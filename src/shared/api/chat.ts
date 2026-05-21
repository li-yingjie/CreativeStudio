export type ChatRole = 'system' | 'user' | 'assistant'
export interface ChatMessage {
  role: ChatRole
  content: string
}

interface StreamChatOptions {
  /** Called for each token as it streams in. */
  onToken?: (token: string) => void
  /** Abort signal to cancel the request (e.g. on unmount). */
  signal?: AbortSignal
}

/**
 * Stream a chat completion from our backend proxy (/api/chat), which forwards
 * to Kimi with the API key kept server-side. Parses the SSE response and
 * surfaces incremental tokens via `onToken`. Resolves with the full text.
 */
export async function streamChat(
  messages: ChatMessage[],
  { onToken, signal }: StreamChatOptions = {},
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => '')
    throw new Error(`chat request failed (${res.status}): ${detail}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE frames are newline-delimited; keep the trailing partial line.
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return full
      try {
        const json = JSON.parse(data)
        const token: string | undefined = json?.choices?.[0]?.delta?.content
        if (token) {
          full += token
          onToken?.(token)
        }
      } catch {
        // ignore keep-alive / non-JSON frames
      }
    }
  }

  return full
}
