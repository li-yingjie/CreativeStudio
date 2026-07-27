// Vercel serverless function — POST /api/product-intent.
// Classifies the user's creation goal server-side without exposing the Kimi key.
export { handleProductIntent as default } from '../server/kimi.mjs'

export const config = { maxDuration: 10 }
