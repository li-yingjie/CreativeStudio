import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { createBrotliCompress, createGzip, constants as zlibConstants } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { handleChat, handleHealth, handleProductIntent, loadKimiConfig } from './kimi.mjs'
import {
  handleCreatorActivities,
  handleCreatorCollab,
  handleCreatorCopyright,
  handleCreatorHomeOverview,
  handleCreatorIncome,
  handleCreatorIndexHot,
  handleCreatorLives,
  handleCreatorStats,
  handleCreatorWorks,
} from './creator-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PORT = Number.parseInt(process.env.PORT || '8787', 10)
const COMPRESSIBLE_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt', '.xml'])

const apiRoutes = new Map([
  ['/api/health', { method: 'GET', handler: handleHealth }],
  ['/api/chat', { method: 'POST', handler: handleChat }],
  ['/api/product-intent', { method: 'POST', handler: handleProductIntent }],
  ['/api/creator/stats', { method: 'GET', handler: handleCreatorStats }],
  ['/api/creator/works', { method: 'GET', handler: handleCreatorWorks }],
  ['/api/creator/income', { method: 'GET', handler: handleCreatorIncome }],
  ['/api/creator/collab', { method: 'GET', handler: handleCreatorCollab }],
  ['/api/creator/activities', { method: 'GET', handler: handleCreatorActivities }],
  ['/api/creator/copyright', { method: 'GET', handler: handleCreatorCopyright }],
  ['/api/creator/index-hot', { method: 'GET', handler: handleCreatorIndexHot }],
  ['/api/creator/lives', { method: 'GET', handler: handleCreatorLives }],
  ['/api/creator/home-overview', { method: 'GET', handler: handleCreatorHomeOverview }],
])

function pathnameOf(req) {
  try {
    return new URL(req.originalUrl || req.url || '/', 'http://local').pathname
  } catch {
    return '/'
  }
}

function sendApiJson(res, status, body, headers = {}) {
  if (res.headersSent || res.writableEnded) return
  res.status(status)
  res.set('Content-Type', 'application/json; charset=utf-8')
  res.set('Cache-Control', 'no-store')
  res.set('X-Content-Type-Options', 'nosniff')
  for (const [name, value] of Object.entries(headers)) res.set(name, value)
  res.end(JSON.stringify(body))
}

function acceptsEncoding(req, encoding) {
  const header = String(req.headers['accept-encoding'] || '')
  return header.split(',').some((part) => {
    const [name, ...parameters] = part.trim().toLowerCase().split(';')
    if (name !== encoding && name !== '*') return false
    return !parameters.some((parameter) => parameter.trim() === 'q=0')
  })
}

function setStaticCacheHeaders(res, filePath) {
  const name = path.basename(filePath)
  const extension = path.extname(name).toLowerCase()
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (extension === '.html' || name === 'sw.js') {
    res.setHeader('Cache-Control', 'no-cache')
  } else if (/[-.][A-Za-z0-9_-]{8,}\.[^.]+$/.test(name) && filePath.includes(`${path.sep}assets${path.sep}`)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600')
  }
}

function compressedStatic(root) {
  const rootWithSeparator = `${path.resolve(root)}${path.sep}`
  return async (req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method) || req.headers.range) return next()

    let pathname
    try {
      pathname = decodeURIComponent(pathnameOf(req)).replace(/^\/+/, '')
    } catch {
      return next()
    }
    const filePath = path.resolve(root, pathname)
    if (!filePath.startsWith(rootWithSeparator)) return next()
    if (!COMPRESSIBLE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return next()

    let stat
    try {
      stat = await fs.promises.stat(filePath)
    } catch (error) {
      if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return next()
      return next(error)
    }
    if (!stat.isFile()) return next()

    const etag = `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`
    res.type(path.extname(filePath))
    res.setHeader('ETag', etag)
    res.setHeader('Last-Modified', stat.mtime.toUTCString())
    setStaticCacheHeaders(res, filePath)
    if (String(req.headers['if-none-match'] || '').split(/\s*,\s*/).includes(etag)) {
      res.status(304).end()
      return
    }

    let encoding = ''
    if (stat.size >= 1_024 && acceptsEncoding(req, 'br')) encoding = 'br'
    else if (stat.size >= 1_024 && acceptsEncoding(req, 'gzip')) encoding = 'gzip'

    if (encoding) {
      res.setHeader('Content-Encoding', encoding)
      res.setHeader('Vary', 'Accept-Encoding')
    } else {
      res.setHeader('Content-Length', stat.size)
    }
    if (req.method === 'HEAD') {
      res.end()
      return
    }

    const source = fs.createReadStream(filePath)
    source.on('error', (error) => {
      if (!res.headersSent) next(error)
      else res.destroy(error)
    })
    if (encoding === 'br' || encoding === 'gzip') {
      const compressor =
        encoding === 'br'
          ? createBrotliCompress({ params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 } })
          : createGzip({ level: 6 })
      compressor.on('error', (error) => res.destroy(error))
      source.pipe(compressor).pipe(res)
    } else {
      source.pipe(res)
    }
  }
}

const app = express()
app.disable('x-powered-by')

app.use((req, res, next) => {
  const pathname = pathnameOf(req)
  if (pathname !== '/api' && !pathname.startsWith('/api/')) return next()

  const route = apiRoutes.get(pathname)
  if (!route) {
    sendApiJson(res, 404, { error: 'API route not found' })
    return
  }
  if (req.method !== route.method) {
    sendApiJson(res, 405, { error: 'method not allowed' }, { Allow: route.method })
    return
  }
  Promise.resolve(route.handler(req, res)).catch((error) => {
    console.error(`[server] ${req.method} ${pathname} failed`, error)
    sendApiJson(res, 500, { error: 'internal server error' })
  })
})

const distDir = path.join(ROOT, 'dist')
if (fs.existsSync(distDir)) {
  app.use(compressedStatic(distDir))
  app.use(
    express.static(distDir, {
      index: false,
      setHeaders: setStaticCacheHeaders,
    }),
  )
  app.get('*', (_req, res) => {
    const indexPath = path.join(distDir, 'index.html')
    setStaticCacheHeaders(res, indexPath)
    res.sendFile(indexPath)
  })
}

app.use((error, req, res, _next) => {
  console.error(`[server] ${req.method} ${pathnameOf(req)} failed`, error)
  if (pathnameOf(req).startsWith('/api')) sendApiJson(res, 500, { error: 'internal server error' })
  else if (!res.headersSent) res.status(500).send('Internal server error')
})

app.listen(PORT, () => {
  const cfg = loadKimiConfig()
  console.log(`[server] listening on http://localhost:${PORT} (model: ${cfg.model})`)
  if (!cfg.apiKey) console.warn('[server] WARNING: KIMI_API_KEY is not set')
})
