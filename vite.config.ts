import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'node:http'
// @ts-expect-error — plain .mjs handler, no types needed
import * as kimiApi from './server/kimi.mjs'
// @ts-expect-error — plain .mjs handler, no types needed
import * as creatorApi from './server/creator-data.mjs'

const { handleChat, handleHealth, handleProductIntent } = kimiApi

const {
  handleCreatorActivities,
  handleCreatorCollab,
  handleCreatorCopyright,
  handleCreatorHomeOverview,
  handleCreatorIncome,
  handleCreatorIndexHot,
  handleCreatorLives,
  handleCreatorStats,
  handleCreatorWorks,
} = creatorApi

type ApiHandler = (req: IncomingMessage, res: ServerResponse) => unknown

const apiRoutes = new Map<string, { method: 'GET' | 'POST'; handler: ApiHandler }>([
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

function sendApiJson(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

// Runs the Kimi proxy inside the Vite dev server so /api works in dev with no
// separate process. The key stays server-side; the browser only sees /api.
function kimiDevApi(): PluginOption {
  return {
    name: 'kimi-dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://local').pathname
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
        Promise.resolve(route.handler(req, res)).catch((error: unknown) => {
          console.error(`[vite-api] ${req.method} ${pathname} failed`, error)
          if (!res.headersSent) sendApiJson(res, 500, { error: 'internal server error' })
        })
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
  // 开发端口与 Express 的 PORT 分开，避免读取 .env 后预览从
  // 5173 意外跳到生产 API 端口。PORT 仅在预览工具按会话分配端口
  // （shell 注入，autoPort）时生效；.env 里的 PORT 不会进到这里。
  server: {
    port: Number(process.env.VITE_DEV_PORT || process.env.PORT) || 5173,
  },
})
