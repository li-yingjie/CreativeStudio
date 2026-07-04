import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
// @ts-expect-error — plain .mjs handler, no types needed
import { handleChat, handleHealth } from './server/kimi.mjs'
// @ts-expect-error — plain .mjs handler, no types needed
import { handleCreatorStats, handleCreatorWorks, handleCreatorIncome, handleCreatorCollab, handleCreatorActivities, handleCreatorCopyright, handleCreatorIndexHot, handleCreatorLives, handleCreatorHomeOverview } from './server/creator-data.mjs'

// Runs the Kimi proxy inside the Vite dev server so /api works in dev with no
// separate process. The key stays server-side; the browser only sees /api.
function kimiDevApi(): PluginOption {
  return {
    name: 'kimi-dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (url === '/api/health') return handleHealth(req, res)
        if (url === '/api/chat' && req.method === 'POST') return handleChat(req, res)
        if (url === '/api/creator/stats') return handleCreatorStats(req, res)
        if (url === '/api/creator/works') return handleCreatorWorks(req, res)
        if (url === '/api/creator/income') return handleCreatorIncome(req, res)
        if (url === '/api/creator/collab') return handleCreatorCollab(req, res)
        if (url === '/api/creator/activities') return handleCreatorActivities(req, res)
        if (url === '/api/creator/copyright') return handleCreatorCopyright(req, res)
        if (url === '/api/creator/index-hot') return handleCreatorIndexHot(req, res)
        if (url === '/api/creator/lives') return handleCreatorLives(req, res)
        if (url === '/api/creator/home-overview') return handleCreatorHomeOverview(req, res)
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), kimiDevApi()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 支持 PORT 环境变量，便于 5173 被占用时自动换端口
  server: {
    port: Number(process.env.PORT) || 5173,
  },
})
