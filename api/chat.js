// Vercel serverless function — POST /api/chat.
// Reuses the shared Kimi proxy handler; the API key stays server-side
// (read from Vercel env vars), never shipped to the browser.
export { handleChat as default } from '../server/kimi.mjs'

// Allow long streaming replies (seconds) before Vercel times the function out.
export const config = { maxDuration: 60 }
