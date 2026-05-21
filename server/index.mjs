import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { handleChat, handleHealth, loadKimiConfig } from './kimi.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PORT = process.env.PORT || 8787

const app = express()

// Raw (req, res) handlers — they read the body themselves, so don't mount a
// JSON body parser ahead of them.
app.get('/api/health', handleHealth)
app.post('/api/chat', handleChat)

// Serve the built SPA in production (same origin → no CORS, key stays server-side).
const distDir = path.join(ROOT, 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.listen(PORT, () => {
  const cfg = loadKimiConfig()
  console.log(`[server] listening on http://localhost:${PORT} (model: ${cfg.model})`)
  if (!cfg.apiKey) console.warn('[server] WARNING: KIMI_API_KEY is not set')
})
