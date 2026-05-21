// Shared Kimi proxy handlers — used by both the Vite dev middleware
// (vite.config.ts) and the production Express server (server/index.mjs).
// Plain Node http (req, res) so it drops into either without adapters.

export function loadKimiConfig() {
  try {
    process.loadEnvFile()
  } catch {
    // no .env — rely on the process environment (production)
  }
  return {
    apiKey: process.env.KIMI_API_KEY,
    baseUrl: (process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1').replace(/\/$/, ''),
    model: process.env.KIMI_MODEL || 'moonshot-v1-8k',
  }
}

// Resolve the JSON body across runtimes: Vercel/@vercel/node pre-parses it
// onto req.body; Express/Vite middleware leaves the raw stream to read here.
function readJsonBody(req) {
  if (req.body != null && req.body !== '') {
    return Promise.resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
  }
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1_000_000) req.destroy()
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, obj) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(obj))
}

export async function handleHealth(_req, res) {
  const cfg = loadKimiConfig()
  sendJson(res, 200, { ok: true, model: cfg.model, keyConfigured: Boolean(cfg.apiKey) })
}

// Streams a Kimi chat completion back to the browser as SSE, keeping the
// API key on the server. Body: { messages: [...], model?, temperature? }.
export async function handleChat(req, res) {
  const cfg = loadKimiConfig()
  if (!cfg.apiKey) {
    sendJson(res, 500, { error: 'KIMI_API_KEY is not configured on the server' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    sendJson(res, 400, { error: 'invalid JSON body' })
    return
  }

  const { messages, model, temperature } = body ?? {}
  if (!Array.isArray(messages) || messages.length === 0) {
    sendJson(res, 400, { error: 'messages must be a non-empty array' })
    return
  }

  // Abort upstream if the browser disconnects (res close, not req).
  const controller = new AbortController()
  res.on('close', () => controller.abort())

  let upstream
  try {
    upstream = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: model || cfg.model,
        messages,
        temperature: typeof temperature === 'number' ? temperature : 0.6,
        stream: true,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (!res.headersSent) sendJson(res, 502, { error: 'Failed to reach Kimi', detail: String(err) })
    return
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    sendJson(res, upstream.status || 502, { error: 'Kimi request failed', detail })
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')

  // Reader loop (not for-await) so it works regardless of whether the
  // runtime's web ReadableStream is async-iterable.
  const reader = upstream.body.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }
  } catch {
    // client disconnected or stream aborted
  } finally {
    res.end()
  }
}
