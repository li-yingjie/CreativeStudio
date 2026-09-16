import { Readable } from 'node:stream'

const DEFAULT_BASE_URL = 'https://design-radar-team.sierrasuly.chatgpt.site'
const MAX_NOTES_BYTES = 5 * 1024 * 1024
const MAX_ASSET_BYTES = 24 * 1024 * 1024
const CASE_ID_RE = /^[a-zA-Z0-9_-]{8,80}$/
const FILE_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,120}$/
const CREATIVE_TYPE_LABELS = new Map([
  ['Interactive Gameplay', '互动玩法'],
  ['Campaign Visual', '活动视觉'],
  ['Social Activation', '社交互动'],
  ['Offline Experience', '线下体验'],
  ['IP & Character', 'IP 与角色'],
  ['Packaging & Merch', '包装与周边'],
  ['Motion & Video', '动效与视频'],
  ['Content & Editorial', '内容与编辑'],
])

let envLoaded = false

function loadEnvOnce() {
  if (envLoaded) return
  envLoaded = true
  try {
    process.loadEnvFile()
  } catch {
    // Production platforms provide environment variables directly.
  }
}

function config() {
  loadEnvOnce()
  return {
    baseUrl: (process.env.DESIGN_RADAR_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    workspaceKey: process.env.DESIGN_RADAR_WORKSPACE_KEY?.trim() || '',
  }
}

function sendJson(res, status, body, headers = {}) {
  if (res.headersSent || res.writableEnded) return
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

function rejectMethod(req, res) {
  if ((req.method || '').toUpperCase() === 'GET') return false
  sendJson(res, 405, { error: 'method not allowed' }, { Allow: 'GET', 'Cache-Control': 'no-store' })
  return true
}

function assetFile(asset) {
  if (!asset || typeof asset !== 'object' || typeof asset.key !== 'string') return null
  const parts = asset.key.split('/')
  const file = parts.at(-1)
  return file && FILE_RE.test(file) ? file : null
}

function normalizeNote(note) {
  if (!note || typeof note !== 'object' || !CASE_ID_RE.test(String(note.id || ''))) return null
  const assets = Array.isArray(note.assets) ? note.assets : []
  const video = assets.find((asset) => asset?.kind === 'video' && assetFile(asset))
  const image = assets.find((asset) => asset?.kind === 'image' && assetFile(asset))
  // Design Radar stores GIF sources as a static WebP poster plus an MP4 copy.
  // Prefer the motion-preserving copy so synced GIFs do not become stills.
  const media = video || image
  const file = assetFile(media)
  if (!media || !file) return null

  const id = String(note.id)
  return {
    id,
    title: String(note.title || '未命名灵感'),
    author: String(note.author || 'Design Radar'),
    description: String(note.description || '').slice(0, 2_000),
    creativeType: CREATIVE_TYPE_LABELS.get(note.creativeType) || '创意灵感',
    publishedAt: String(note.publishedAt || ''),
    sourceUrl: typeof note.url === 'string' && /^https:\/\//.test(note.url) ? note.url : '',
    assetCount: assets.length,
    mediaType: media.kind === 'video' ? 'video' : 'image',
    mediaUrl: `/api/design-radar-asset?case=${encodeURIComponent(id)}&file=${encodeURIComponent(file)}`,
  }
}

export async function handleDesignRadar(req, res) {
  if (rejectMethod(req, res)) return
  const { baseUrl, workspaceKey } = config()
  if (!workspaceKey) {
    sendJson(res, 503, { error: 'Design Radar is not configured' }, { 'Cache-Control': 'no-store' })
    return
  }

  try {
    const response = await fetch(`${baseUrl}/api/notes`, {
      headers: { Accept: 'application/json', 'X-Workspace-Key': workspaceKey },
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`upstream returned ${response.status}`)
    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength > MAX_NOTES_BYTES) throw new Error('upstream response is too large')
    const text = await response.text()
    if (Buffer.byteLength(text, 'utf8') > MAX_NOTES_BYTES) throw new Error('upstream response is too large')
    const payload = JSON.parse(text)
    if (!payload?.ok || !Array.isArray(payload.notes)) throw new Error('upstream response is invalid')
    const items = payload.notes.map(normalizeNote).filter(Boolean)
    sendJson(res, 200, { items }, { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' })
  } catch (error) {
    console.error('[design-radar] list failed', error)
    sendJson(res, 502, { error: 'Design Radar is unavailable' }, { 'Cache-Control': 'no-store' })
  }
}

export async function handleDesignRadarAsset(req, res) {
  if (rejectMethod(req, res)) return
  const { baseUrl, workspaceKey } = config()
  if (!workspaceKey) {
    sendJson(res, 503, { error: 'Design Radar is not configured' }, { 'Cache-Control': 'no-store' })
    return
  }

  let caseId = ''
  let file = ''
  try {
    const url = new URL(req.originalUrl || req.url || '/', 'http://local')
    caseId = url.searchParams.get('case') || ''
    file = url.searchParams.get('file') || ''
  } catch {
    // Validation below returns a stable 400 response.
  }
  if (!CASE_ID_RE.test(caseId) || !FILE_RE.test(file)) {
    sendJson(res, 400, { error: 'invalid asset path' }, { 'Cache-Control': 'no-store' })
    return
  }

  try {
    const upstreamUrl = new URL(`${baseUrl}/api/assets/cases/${caseId}/${file}`)
    upstreamUrl.searchParams.set('workspace_key', workspaceKey)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)
    let response
    try {
      response = await fetch(upstreamUrl, { signal: controller.signal })
    } finally {
      // Only bound connection/header latency. Large videos must remain free to
      // stream after the upstream has accepted the request.
      clearTimeout(timeout)
    }
    if (!response.ok || !response.body) throw new Error(`upstream returned ${response.status}`)
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/') && !contentType.startsWith('video/')) {
      throw new Error('unsupported asset type')
    }
    const contentLength = Number(response.headers.get('content-length') || 0)
    if (contentLength > MAX_ASSET_BYTES) throw new Error('upstream asset is too large')

    res.statusCode = 200
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (contentLength > 0) res.setHeader('Content-Length', String(contentLength))
    const source = Readable.fromWeb(response.body)
    source.on('error', (error) => {
      console.error('[design-radar] asset stream failed', error)
      res.destroy(error)
    })
    source.pipe(res)
  } catch (error) {
    console.error('[design-radar] asset failed', error)
    sendJson(res, 502, { error: 'Design Radar asset is unavailable' }, { 'Cache-Control': 'no-store' })
  }
}
