// Vercel serverless function — GET /api/health.
// Quick check that the function deployed and the key env var is present.
export { handleHealth as default } from '../server/kimi.mjs'
