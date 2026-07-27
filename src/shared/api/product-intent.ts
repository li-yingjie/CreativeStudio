export type ProductIntentTarget = 'ai-avatar' | 'wiki' | 'suibian' | 'workshop'
export type ProductIntent = ProductIntentTarget | 'none'

const PRODUCT_INTENTS = new Set<ProductIntent>([
  'ai-avatar',
  'wiki',
  'suibian',
  'workshop',
  'none',
])

export async function classifyProductIntent(
  text: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<ProductIntent> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  const timeout = window.setTimeout(abort, 7_000)
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', abort, { once: true })

  try {
    const response = await fetch('/api/product-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`product intent request failed (${response.status})`)

    const data: unknown = await response.json()
    const target =
      data && typeof data === 'object' && 'target' in data
        ? (data as { target?: unknown }).target
        : undefined
    if (typeof target !== 'string' || !PRODUCT_INTENTS.has(target as ProductIntent)) {
      throw new Error('product intent response is invalid')
    }
    return target as ProductIntent
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
