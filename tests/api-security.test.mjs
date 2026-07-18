import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import test from 'node:test'
import { handleChat, handleHealth } from '../server/kimi.mjs'
import { handleCreatorStats } from '../server/creator-data.mjs'

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

function request({ method = 'GET', url = '/', headers = {}, body } = {}) {
  return Object.assign(new EventEmitter(), {
    method,
    url,
    headers,
    body,
    socket: { remoteAddress: '127.0.0.1' },
  })
}

function parsed(response) {
  return JSON.parse(response.body)
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
      headers: { host: 'app.test', 'content-type': 'text/plain' },
      body: { messages: [{ role: 'user', content: 'hello' }] },
    }),
    wrongContentType,
  )
  assert.equal(wrongContentType.statusCode, 415)
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
