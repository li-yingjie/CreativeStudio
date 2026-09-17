const MOTIONSITES_URL = 'https://motionsites.ai'
const SUPABASE_URL = 'https://xgdzyqfalbibzelpdpvr.supabase.co'
// This is the public anon key shipped in MotionSites' browser bundle. It only
// grants the same read access as a visitor opening the public inspiration page.
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZHp5cWZhbGJpYnplbHBkcHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzUwMDYsImV4cCI6MjA4NzQxMTAwNn0.u8lH5Y14xx2WxrNEBp8ngkJlijIYHJASq_gOzTaINZY'
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024
const PROMPT_ID_RE = /^[a-zA-Z0-9_-]{1,100}$/

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

function safeMediaUrl(value) {
  if (typeof value !== 'string' || !value) return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
}

function normalizePrompt(prompt) {
  const id = String(prompt?.id || '')
  if (!PROMPT_ID_RE.test(id)) return null

  const imageUrl = safeMediaUrl(prompt.image_preview_url)
  const videoUrl = safeMediaUrl(prompt.video_preview_url)
  const muxId = videoUrl.match(/^https:\/\/stream\.mux\.com\/([^./]+)\.m3u8(?:\?|$)/)?.[1]
  const animatedImage = muxId ? `https://image.mux.com/${muxId}/animated.webp?width=640&fps=15` : ''
  const videoIsImage = /\.(?:avif|gif|jpe?g|png|webp)(?:\?|$)/i.test(videoUrl)
  const videoIsPlayable = /\.(?:mp4|webm|mov)(?:\?|$)/i.test(videoUrl)
  const mediaUrl = animatedImage || (videoIsImage ? videoUrl : '') || (videoIsPlayable ? videoUrl : '') || imageUrl
  if (!mediaUrl) return null

  const category = String(prompt.category || prompt.type || '网站设计').slice(0, 80)
  const isFree = prompt.is_free === true
  return {
    id: `motionsites-${id}`,
    title: String(prompt.title || 'MotionSites 灵感').slice(0, 160),
    author: 'MotionSites',
    description: `${category} 动效网站参考${isFree ? '，公开提示词可前往原站查看。' : '，提示词需前往原站解锁。'}`,
    creativeType: category,
    publishedAt: String(prompt.created_at || ''),
    sourceUrl: `${MOTIONSITES_URL}/?prompt=${encodeURIComponent(id)}`,
    assetCount: 1,
    mediaType: videoIsPlayable && !animatedImage ? 'video' : 'image',
    mediaUrl,
    posterUrl: imageUrl,
  }
}

export async function handleMotionSites(req, res) {
  if (rejectMethod(req, res)) return

  try {
    const upstreamUrl = new URL(`${SUPABASE_URL}/rest/v1/prompts`)
    upstreamUrl.searchParams.set(
      'select',
      'id,title,category,type,is_free,image_preview_url,video_preview_url,created_at',
    )
    upstreamUrl.searchParams.set('order', 'created_at.desc')
    upstreamUrl.searchParams.set('limit', '36')

    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`upstream returned ${response.status}`)
    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength > MAX_RESPONSE_BYTES) throw new Error('upstream response is too large')
    const text = await response.text()
    if (Buffer.byteLength(text, 'utf8') > MAX_RESPONSE_BYTES) throw new Error('upstream response is too large')
    const payload = JSON.parse(text)
    if (!Array.isArray(payload)) throw new Error('upstream response is invalid')

    const items = payload.map(normalizePrompt).filter(Boolean).slice(0, 18)
    sendJson(res, 200, { items }, { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800' })
  } catch (error) {
    console.error('[motionsites] list failed', error)
    sendJson(res, 502, { error: 'MotionSites is unavailable' }, { 'Cache-Control': 'no-store' })
  }
}
