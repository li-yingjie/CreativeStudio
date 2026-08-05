import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import path from 'node:path'
import test from 'node:test'
import {
  handleChat,
  handleHealth,
  handleProductIntent,
  parseProductIntentTarget,
} from '../server/kimi.mjs'
import { handleCreatorStats } from '../server/creator-data.mjs'
import { staticCacheControl } from '../server/static-cache.mjs'

class MockResponse extends EventEmitter {
  statusCode = 200
  headers = new Map()
  headersSent = false
  writableEnded = false
  body = ''

  setHeader(name, value) {
    this.headers.set(name.toLowerCase(), String(value))
  }

  getHeader(name) {
    return this.headers.get(name.toLowerCase())
  }

  end(value = '') {
    this.body += String(value)
    this.headersSent = true
    this.writableEnded = true
    this.emit('finish')
  }

  write(value) {
    this.body += String(value)
    this.headersSent = true
    return true
  }
}

function request({ method = 'GET', url = '/', headers = {}, body, remoteAddress = '127.0.0.1', encrypted = false } = {}) {
  const req = Object.assign(new EventEmitter(), {
    method,
    url,
    headers,
    body,
    socket: { remoteAddress, encrypted },
  })
  req.pause = () => {
    req.paused = true
    return req
  }
  req.unpipe = () => req
  return req
}

function parsed(response) {
  return JSON.parse(response.body)
}

function restoreEnv(name, value) {
  if (value == null) delete process.env[name]
  else process.env[name] = value
}

test('health endpoint rejects unsupported methods', () => {
  const response = new MockResponse()
  handleHealth(request({ method: 'POST' }), response)
  assert.equal(response.statusCode, 405)
  assert.equal(response.getHeader('allow'), 'GET')
  assert.equal(parsed(response).error, 'method not allowed')
})

test('chat endpoint blocks cross-origin and non-JSON requests before upstream access', async () => {
  process.env.KIMI_API_KEY = 'test-key'

  const crossOrigin = new MockResponse()
  await handleChat(
    request({
      method: 'POST',
      headers: {
        host: 'app.test',
        origin: 'https://evil.test',
        'content-type': 'application/json',
      },
      body: { messages: [{ role: 'user', content: 'hello' }] },
    }),
    crossOrigin,
  )
  assert.equal(crossOrigin.statusCode, 403)

  const wrongContentType = new MockResponse()
  await handleChat(
    request({
      method: 'POST',
      headers: { host: 'app.test', origin: 'http://app.test', 'content-type': 'text/plain' },
      body: { messages: [{ role: 'user', content: 'hello' }] },
    }),
    wrongContentType,
  )
  assert.equal(wrongContentType.statusCode, 415)
})

test('POST endpoints compare scheme and host and reject missing Origin by default', async () => {
  const previousAllowMissing = process.env.KIMI_ALLOW_MISSING_ORIGIN
  const previousTrustProxy = process.env.TRUST_PROXY_HEADERS
  process.env.KIMI_API_KEY = 'test-key'
  delete process.env.KIMI_ALLOW_MISSING_ORIGIN
  process.env.TRUST_PROXY_HEADERS = 'false'

  try {
    const missingOrigin = new MockResponse()
    await handleChat(
      request({
        method: 'POST',
        headers: { host: 'app.test', 'content-type': 'application/json' },
        body: { messages: [{ role: 'user', content: 'hello' }] },
      }),
      missingOrigin,
    )
    assert.equal(missingOrigin.statusCode, 403)

    const wrongScheme = new MockResponse()
    await handleChat(
      request({
        method: 'POST',
        headers: {
          host: 'app.test',
          origin: 'https://app.test',
          'content-type': 'application/json',
        },
        body: { messages: [{ role: 'user', content: 'hello' }] },
      }),
      wrongScheme,
    )
    assert.equal(wrongScheme.statusCode, 403)

    process.env.KIMI_ALLOW_MISSING_ORIGIN = 'true'
    const trustedNonBrowserClient = new MockResponse()
    await handleChat(
      request({
        method: 'POST',
        headers: { host: 'app.test', 'content-type': 'application/json' },
        body: { messages: [] },
      }),
      trustedNonBrowserClient,
    )
    assert.equal(trustedNonBrowserClient.statusCode, 400)

    const crossOriginStillRejected = new MockResponse()
    await handleChat(
      request({
        method: 'POST',
        headers: {
          host: 'app.test',
          origin: 'https://evil.test',
          'content-type': 'application/json',
        },
        body: { messages: [{ role: 'user', content: 'hello' }] },
      }),
      crossOriginStillRejected,
    )
    assert.equal(crossOriginStillRejected.statusCode, 403)
  } finally {
    restoreEnv('KIMI_ALLOW_MISSING_ORIGIN', previousAllowMissing)
    restoreEnv('TRUST_PROXY_HEADERS', previousTrustProxy)
  }
})

test('trusted proxy protocol participates in the same-origin comparison', async () => {
  const previousTrustProxy = process.env.TRUST_PROXY_HEADERS
  process.env.KIMI_API_KEY = 'test-key'
  process.env.TRUST_PROXY_HEADERS = 'true'

  try {
    const response = new MockResponse()
    await handleChat(
      request({
        method: 'POST',
        headers: {
          host: 'internal.test',
          origin: 'https://app.test',
          'x-forwarded-host': 'app.test',
          'x-forwarded-proto': 'https',
          'content-type': 'application/json',
        },
        body: { messages: [] },
      }),
      response,
    )
    assert.equal(response.statusCode, 400)
  } finally {
    restoreEnv('TRUST_PROXY_HEADERS', previousTrustProxy)
  }
})

test('chat rejects declared oversized bodies before accessing body data', async () => {
  process.env.KIMI_API_KEY = 'test-key'
  let bodyAccessed = false
  const oversizedRequest = request({
    method: 'POST',
    headers: {
      host: 'app.test',
      origin: 'http://app.test',
      'content-type': 'application/json',
      'content-length': String(64 * 1024 + 1),
    },
    remoteAddress: '192.0.2.10',
  })
  Object.defineProperty(oversizedRequest, 'body', {
    configurable: true,
    get() {
      bodyAccessed = true
      return { messages: [{ role: 'user', content: 'hello' }] }
    },
  })

  const response = new MockResponse()
  await handleChat(oversizedRequest, response)
  assert.equal(response.statusCode, 413)
  assert.equal(bodyAccessed, false)
  assert.equal(oversizedRequest.paused, true)
  assert.equal(response.getHeader('connection'), 'close')
})

test('chat stops reading request bodies when the body deadline expires', async () => {
  const previousTimeout = process.env.KIMI_BODY_TIMEOUT_MS
  process.env.KIMI_API_KEY = 'test-key'
  process.env.KIMI_BODY_TIMEOUT_MS = '100'

  try {
    const stalledRequest = request({
      method: 'POST',
      headers: {
        host: 'app.test',
        origin: 'http://app.test',
        'content-type': 'application/json',
      },
      remoteAddress: '192.0.2.11',
    })
    const response = new MockResponse()
    await handleChat(stalledRequest, response)
    assert.equal(response.statusCode, 408)
    assert.equal(stalledRequest.paused, true)
    assert.equal(response.getHeader('connection'), 'close')
  } finally {
    restoreEnv('KIMI_BODY_TIMEOUT_MS', previousTimeout)
  }
})

test('chat endpoint rejects unapproved models and malformed conversations', async () => {
  process.env.KIMI_API_KEY = 'test-key'
  process.env.KIMI_MODEL = 'moonshot-v1-8k'
  process.env.KIMI_ALLOWED_MODELS = 'moonshot-v1-8k'
  const headers = {
    host: 'app.test',
    origin: 'http://app.test',
    'content-type': 'application/json',
  }

  const modelResponse = new MockResponse()
  await handleChat(
    request({
      method: 'POST',
      headers,
      body: {
        model: 'untrusted-model',
        messages: [{ role: 'user', content: 'hello' }],
      },
    }),
    modelResponse,
  )
  assert.equal(modelResponse.statusCode, 400)
  assert.match(parsed(modelResponse).error, /model/i)

  const roleResponse = new MockResponse()
  await handleChat(
    request({
      method: 'POST',
      headers,
      body: { messages: [{ role: 'assistant', content: 'not a user turn' }] },
    }),
    roleResponse,
  )
  assert.equal(roleResponse.statusCode, 400)
  assert.match(parsed(roleResponse).error, /last message/i)
})

test('product intent endpoint validates input before upstream access', async () => {
  process.env.KIMI_API_KEY = 'test-key'

  const crossOrigin = new MockResponse()
  await handleProductIntent(
    request({
      method: 'POST',
      headers: {
        host: 'app.test',
        origin: 'https://evil.test',
        'content-type': 'application/json',
      },
      body: { text: '做一个粉丝抽签页' },
    }),
    crossOrigin,
  )
  assert.equal(crossOrigin.statusCode, 403)

  const invalidText = new MockResponse()
  await handleProductIntent(
    request({
      method: 'POST',
      headers: { host: 'app.test', origin: 'http://app.test', 'content-type': 'application/json' },
      body: { text: '' },
    }),
    invalidText,
  )
  assert.equal(invalidText.statusCode, 400)
  assert.match(parsed(invalidText).error, /text/i)
})

test('product intent endpoint returns only a server-controlled product enum', async () => {
  process.env.KIMI_API_KEY = 'test-key'
  process.env.KIMI_MODEL = 'moonshot-v1-8k'
  const previousFetch = globalThis.fetch
  let upstreamBody
  globalThis.fetch = async (_url, options) => {
    upstreamBody = JSON.parse(options.body)
    return new Response(
      JSON.stringify({ choices: [{ message: { content: 'workshop' } }] }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }

  try {
    const response = new MockResponse()
    await handleProductIntent(
      request({
        method: 'POST',
        headers: { host: 'app.test', origin: 'http://app.test', 'content-type': 'application/json' },
        body: {
          text: '做个每天提醒打卡、完成后还能领徽章的工具',
          model: 'client-controlled-model',
          temperature: 1,
        },
      }),
      response,
    )
    assert.equal(response.statusCode, 200)
    assert.deepEqual(parsed(response), { target: 'workshop' })
    assert.equal(upstreamBody.model, 'moonshot-v1-8k')
    assert.equal(upstreamBody.temperature, 0)
    assert.equal(upstreamBody.stream, false)
    assert.equal(upstreamBody.messages.at(-1).content, '做个每天提醒打卡、完成后还能领徽章的工具')
  } finally {
    globalThis.fetch = previousFetch
  }
})

test('product intent parser rejects explanatory or unknown model output', () => {
  assert.equal(parseProductIntentTarget('ai-avatar'), 'ai-avatar')
  assert.equal(parseProductIntentTarget(' workshop\n'), 'workshop')
  assert.equal(parseProductIntentTarget('建议跳转到 workshop'), null)
  assert.equal(parseProductIntentTarget('unknown'), null)
})

test('one client cannot consume every upstream concurrency slot', async () => {
  const previousFetch = globalThis.fetch
  const previousGlobalLimit = process.env.KIMI_MAX_CONCURRENT
  const previousClientLimit = process.env.KIMI_MAX_CONCURRENT_PER_CLIENT
  const previousRateLimit = process.env.KIMI_RATE_LIMIT_MAX
  process.env.KIMI_API_KEY = 'test-key'
  process.env.KIMI_MAX_CONCURRENT = '3'
  process.env.KIMI_MAX_CONCURRENT_PER_CLIENT = '1'
  process.env.KIMI_RATE_LIMIT_MAX = '120'

  let fetchCalls = 0
  let firstFetchStarted
  let secondFetchStarted
  let releaseFetches
  const firstStarted = new Promise((resolve) => {
    firstFetchStarted = resolve
  })
  const secondStarted = new Promise((resolve) => {
    secondFetchStarted = resolve
  })
  const gate = new Promise((resolve) => {
    releaseFetches = resolve
  })
  globalThis.fetch = async () => {
    fetchCalls += 1
    if (fetchCalls === 1) firstFetchStarted()
    if (fetchCalls === 2) secondFetchStarted()
    await gate
    return new Response('data: {"choices":[]}\n\n', {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    })
  }

  const headers = {
    host: 'app.test',
    origin: 'http://app.test',
    'content-type': 'application/json',
  }
  const body = { messages: [{ role: 'user', content: 'hello' }] }

  try {
    const firstResponse = new MockResponse()
    const firstRequest = handleChat(
      request({ method: 'POST', headers, body, remoteAddress: '198.51.100.20' }),
      firstResponse,
    )
    await firstStarted

    const sameClientResponse = new MockResponse()
    await handleChat(
      request({ method: 'POST', headers, body, remoteAddress: '198.51.100.20' }),
      sameClientResponse,
    )
    assert.equal(sameClientResponse.statusCode, 429)
    assert.match(parsed(sameClientResponse).error, /concurrent requests/i)
    assert.equal(fetchCalls, 1)

    const otherClientResponse = new MockResponse()
    const otherClientRequest = handleChat(
      request({ method: 'POST', headers, body, remoteAddress: '198.51.100.21' }),
      otherClientResponse,
    )
    await secondStarted
    assert.equal(fetchCalls, 2)

    releaseFetches()
    await Promise.all([firstRequest, otherClientRequest])
    assert.equal(firstResponse.statusCode, 200)
    assert.equal(otherClientResponse.statusCode, 200)
  } finally {
    releaseFetches()
    globalThis.fetch = previousFetch
    restoreEnv('KIMI_MAX_CONCURRENT', previousGlobalLimit)
    restoreEnv('KIMI_MAX_CONCURRENT_PER_CLIENT', previousClientLimit)
    restoreEnv('KIMI_RATE_LIMIT_MAX', previousRateLimit)
  }
})

test('static caching reserves immutable lifetime for top-level Vite hashes', () => {
  const distRoot = path.resolve('/srv/app/dist')
  assert.equal(
    staticCacheControl(path.join(distRoot, 'assets', 'chunk-BNv3lrIs.js'), distRoot),
    'public, max-age=31536000, immutable',
  )
  assert.equal(
    staticCacheControl(path.join(distRoot, 'assets', 'workshop', 'inspire', 'card-knight-of-wands.webp'), distRoot),
    'public, max-age=3600',
  )
  assert.equal(
    staticCacheControl(path.join(distRoot, 'assets', 'xiahua', 'mascot-horse-v3.png'), distRoot),
    'public, max-age=3600',
  )
  assert.equal(
    staticCacheControl(path.join(distRoot, 'assets', 'nested', 'chunk-BNv3lrIs.js'), distRoot),
    'public, max-age=3600',
  )
  assert.equal(staticCacheControl(path.join(distRoot, 'index.html'), distRoot), 'no-cache')
})

test('creator stats returns bounded JSON and enforces GET', () => {
  const response = new MockResponse()
  handleCreatorStats(request({ method: 'GET', url: '/api/creator/stats?range=week' }), response)
  const body = parsed(response)
  assert.equal(response.statusCode, 200)
  assert.match(response.getHeader('content-type'), /application\/json/)
  assert.match(body.period.start, /^\d{4}-\d{2}-\d{2}$/)
  assert.match(body.period.end, /^\d{4}-\d{2}-\d{2}$/)
  assert.ok(Array.isArray(body.works.trend))

  const rejected = new MockResponse()
  handleCreatorStats(request({ method: 'POST', url: '/api/creator/stats' }), rejected)
  assert.equal(rejected.statusCode, 405)
  assert.equal(rejected.getHeader('allow'), 'GET')
})
