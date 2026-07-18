// Shared Kimi proxy handlers for Vite, Express and Vercel.
// Keep all credentials and policy decisions on the server.

const DEFAULT_MODEL = 'moonshot-v1-8k'
const BODY_LIMIT_BYTES = 64 * 1024
const MAX_MESSAGES = 32
const MAX_MESSAGE_CHARS = 12_000
const MAX_TOTAL_MESSAGE_CHARS = 32_000
const RATE_BUCKET_LIMIT = 5_000
const VALID_ROLES = new Set(['system', 'user', 'assistant'])

let envLoaded = false
let inFlightRequests = 0
let lastRateSweep = 0
const rateBuckets = new Map()

function loadEnvOnce() {
  if (envLoaded) return
  envLoaded = true
  try {
    process.loadEnvFile()
  } catch {
    // Production platforms provide environment variables directly.
  }
}

function boundedInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback
}

export function loadKimiConfig() {
  loadEnvOnce()
  const model = process.env.KIMI_MODEL?.trim() || DEFAULT_MODEL
  const configuredModels = (process.env.KIMI_ALLOWED_MODELS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const allowedModels = new Set(configuredModels.length ? configuredModels : [model])
  allowedModels.add(model)

  return {
    apiKey: process.env.KIMI_API_KEY,
    baseUrl: (process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1').replace(/\/$/, ''),
    model,
    allowedModels,
    maxConcurrent: boundedInt(process.env.KIMI_MAX_CONCURRENT, 4, 1, 20),
    maxOutputTokens: boundedInt(process.env.KIMI_MAX_OUTPUT_TOKENS, 2_048, 128, 4_096),
    maxOutputBytes: boundedInt(process.env.KIMI_MAX_OUTPUT_BYTES, 2_000_000, 64_000, 4_000_000),
    rateLimitMax: boundedInt(process.env.KIMI_RATE_LIMIT_MAX, 15, 1, 120),
    rateLimitWindowMs: boundedInt(process.env.KIMI_RATE_LIMIT_WINDOW_MS, 60_000, 1_000, 3_600_000),
    upstreamTimeoutMs: boundedInt(process.env.KIMI_TIMEOUT_MS, 45_000, 5_000, 120_000),
  }
}

class RequestError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function byteLength(value) {
  return Buffer.byteLength(value, 'utf8')
}

function readJsonBody(req) {
  if (req.body != null && req.body !== '') {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    if (byteLength(raw) > BODY_LIMIT_BYTES) {
      return Promise.reject(new RequestError(413, 'request body is too large'))
    }
    try {
      return Promise.resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
    } catch {
      return Promise.reject(new RequestError(400, 'invalid JSON body'))
    }
  }

  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false

    const fail = (error) => {
      if (settled) return
      settled = true
      reject(error)
    }

    req.on('data', (chunk) => {
      if (settled) return
      size += chunk.length
      if (size > BODY_LIMIT_BYTES) {
        fail(new RequestError(413, 'request body is too large'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (settled) return
      settled = true
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new RequestError(400, 'invalid JSON body'))
      }
    })
    req.on('error', () => fail(new RequestError(400, 'unable to read request body')))
  })
}

function sendJson(res, status, obj, extraHeaders = {}) {
  if (res.headersSent || res.writableEnded) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  for (const [name, value] of Object.entries(extraHeaders)) res.setHeader(name, value)
  res.end(JSON.stringify(obj))
}

function rejectMethod(req, res, allowedMethod) {
  if ((req.method || '').toUpperCase() === allowedMethod) return false
  sendJson(res, 405, { error: 'method not allowed' }, { Allow: allowedMethod })
  return true
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new RequestError(400, `messages must contain 1-${MAX_MESSAGES} items`)
  }

  let totalChars = 0
  const normalized = messages.map((message) => {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      throw new RequestError(400, 'each message must be an object')
    }
    if (!VALID_ROLES.has(message.role) || typeof message.content !== 'string') {
      throw new RequestError(400, 'each message must have a valid role and string content')
    }
    if (!message.content.trim() || message.content.length > MAX_MESSAGE_CHARS) {
      throw new RequestError(400, `message content must contain 1-${MAX_MESSAGE_CHARS} characters`)
    }
    totalChars += message.content.length
    return { role: message.role, content: message.content }
  })

  if (totalChars > MAX_TOTAL_MESSAGE_CHARS) {
    throw new RequestError(413, `message content exceeds ${MAX_TOTAL_MESSAGE_CHARS} characters`)
  }
  if (normalized.at(-1)?.role !== 'user') {
    throw new RequestError(400, 'the last message must have the user role')
  }
  return normalized
}

function trustsProxyHeaders() {
  return (
    process.env.TRUST_PROXY_HEADERS === 'true' ||
    Boolean(process.env.VERCEL || process.env.CF_PAGES || process.env.CF_WORKER)
  )
}

function requestHost(req) {
  const forwarded = trustsProxyHeaders() ? req.headers?.['x-forwarded-host'] : ''
  return String(forwarded || req.headers?.host || '').split(',')[0].trim().toLowerCase()
}

function isSameOrigin(req) {
  const origin = req.headers?.origin
  if (!origin) return true
  try {
    return new URL(origin).host.toLowerCase() === requestHost(req)
  } catch {
    return false
  }
}

function waitForDrainOrStop(res, signal) {
  if (res.destroyed || signal.aborted) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      res.off('drain', done)
      res.off('close', done)
      signal.removeEventListener('abort', done)
      resolve()
    }
    res.once('drain', done)
    res.once('close', done)
    signal.addEventListener('abort', done, { once: true })
  })
}

function clientKey(req) {
  const trustProxy = trustsProxyHeaders()
  const forwardedFor = trustProxy
    ? String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
    : ''
  return String(
    (trustProxy && req.headers?.['cf-connecting-ip']) ||
      (trustProxy && req.headers?.['x-real-ip']) ||
      forwardedFor ||
      req.socket?.remoteAddress ||
      'unknown',
  ).slice(0, 128)
}

function sweepRateBuckets(now, windowMs) {
  if (now - lastRateSweep < windowMs && rateBuckets.size < RATE_BUCKET_LIMIT) return
  lastRateSweep = now
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.startedAt >= windowMs) rateBuckets.delete(key)
  }
  while (rateBuckets.size >= RATE_BUCKET_LIMIT) {
    rateBuckets.delete(rateBuckets.keys().next().value)
  }
}

function consumeRateLimit(req, cfg) {
  const now = Date.now()
  sweepRateBuckets(now, cfg.rateLimitWindowMs)
  const key = clientKey(req)
  let bucket = rateBuckets.get(key)
  if (!bucket || now - bucket.startedAt >= cfg.rateLimitWindowMs) {
    bucket = { startedAt: now, count: 0 }
    rateBuckets.set(key, bucket)
  }
  if (bucket.count >= cfg.rateLimitMax) {
    return Math.max(1, Math.ceil((cfg.rateLimitWindowMs - (now - bucket.startedAt)) / 1_000))
  }
  bucket.count += 1
  return 0
}

export function handleHealth(req, res) {
  if (rejectMethod(req, res, 'GET')) return
  const cfg = loadKimiConfig()
  sendJson(res, 200, { ok: true, model: cfg.model, keyConfigured: Boolean(cfg.apiKey) })
}

export async function handleChat(req, res) {
  if (rejectMethod(req, res, 'POST')) return
  if (!isSameOrigin(req)) {
    sendJson(res, 403, { error: 'cross-origin requests are not allowed' })
    return
  }
  if (!String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) {
    sendJson(res, 415, { error: 'content-type must be application/json' })
    return
  }

  const cfg = loadKimiConfig()
  if (!cfg.apiKey) {
    sendJson(res, 503, { error: 'chat service is not configured' })
    return
  }

  let body
  let messages
  try {
    body = await readJsonBody(req)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new RequestError(400, 'request body must be a JSON object')
    }
    messages = normalizeMessages(body.messages)
  } catch (error) {
    const status = error instanceof RequestError ? error.status : 400
    sendJson(res, status, { error: error instanceof Error ? error.message : 'invalid request' })
    return
  }

  const requestedModel = body.model
  if (requestedModel != null && (typeof requestedModel !== 'string' || !cfg.allowedModels.has(requestedModel))) {
    sendJson(res, 400, { error: 'requested model is not allowed' })
    return
  }
  const temperature = body.temperature == null ? 0.6 : body.temperature
  if (typeof temperature !== 'number' || !Number.isFinite(temperature) || temperature < 0 || temperature > 1) {
    sendJson(res, 400, { error: 'temperature must be a number from 0 to 1' })
    return
  }

  const retryAfter = consumeRateLimit(req, cfg)
  if (retryAfter) {
    sendJson(res, 429, { error: 'too many chat requests' }, { 'Retry-After': String(retryAfter) })
    return
  }
  if (inFlightRequests >= cfg.maxConcurrent) {
    sendJson(res, 503, { error: 'chat service is busy; retry shortly' }, { 'Retry-After': '2' })
    return
  }

  inFlightRequests += 1
  const controller = new AbortController()
  let timedOut = false
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, cfg.upstreamTimeoutMs)
  const onClose = () => controller.abort()
  res.once('close', onClose)

  try {
    let upstream
    try {
      upstream = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: requestedModel || cfg.model,
          messages,
          temperature,
          max_tokens: cfg.maxOutputTokens,
          stream: true,
        }),
        signal: controller.signal,
      })
    } catch {
      if (!res.headersSent && !res.writableEnded) {
        sendJson(res, timedOut ? 504 : 502, { error: timedOut ? 'chat service timed out' : 'chat service is unavailable' })
      }
      return
    }

    if (!upstream.ok || !upstream.body) {
      await upstream.body?.cancel().catch(() => {})
      sendJson(res, upstream.status === 429 ? 503 : 502, {
        error: upstream.status === 429 ? 'chat service is busy; retry shortly' : 'upstream chat request failed',
      })
      return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.flushHeaders?.()

    const reader = upstream.body.getReader()
    let outputBytes = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        outputBytes += value.byteLength
        if (outputBytes > cfg.maxOutputBytes) {
          controller.abort()
          break
        }
        if (!res.write(Buffer.from(value))) {
          await waitForDrainOrStop(res, controller.signal)
        }
      }
    } catch {
      // The client disconnected, the timeout fired, or the output limit stopped the stream.
    } finally {
      reader.releaseLock()
      if (!res.writableEnded) res.end()
    }
  } finally {
    clearTimeout(timeout)
    res.off('close', onClose)
    inFlightRequests = Math.max(0, inFlightRequests - 1)
  }
}
