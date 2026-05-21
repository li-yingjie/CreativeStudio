import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
// @ts-expect-error — plain .mjs handler, no types needed
import { handleChat, handleHealth } from './server/kimi.mjs'

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
})
