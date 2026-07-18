import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { streamChat, type ChatMessage } from '@/shared/api/chat'

/** Live AI reply block — streams a real reply from the Kimi-backed
 *  /api/chat proxy, showing a thinking indicator until the first token
 *  lands. Caches the finished text in the parent (via `cached` / `onDone`)
 *  so re-opening renders instantly instead of re-fetching, and falls back
 *  to a canned line if the request fails. Failed or incomplete streams
 *  remain uncached so a later remount can retry.
 *  Ink color follows `--color-ink` — hosts on a light surface can scope
 *  the var locally instead of forking the component. */
export function LiveAiReply({
  messages,
  cached,
  fallback,
  onDone,
}: {
  /** Full conversation context (system + prior turns + this user message). */
  messages: ChatMessage[]
  /** Previously-streamed reply for this turn; when set, render it instantly. */
  cached?: string
  /** Canned reply shown if the API call fails. */
  fallback: string
  /** Called once with the final text so the parent can cache it. */
  onDone?: (reply: string) => void
}) {
  const [text, setText] = useState(cached ?? '')
  const [thinking, setThinking] = useState(cached == null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })
  // Capture the message context from first render — the reply is tied to this
  // turn, so later re-renders shouldn't change what we asked.
  const messagesRef = useRef(messages)
  useEffect(() => {
    if (cached != null) return // already have the reply — no fetch
    const controller = new AbortController()
    let acc = ''
    streamChat(messagesRef.current, {
      signal: controller.signal,
      onToken: (token) => {
        acc += token
        setThinking(false)
        setText(acc)
      },
    })
      .then((full) => {
        const completedReply = (acc || full || '').trim()
        const reply = completedReply || fallback
        setThinking(false)
        setText(reply)
        if (completedReply) onDoneRef.current?.(completedReply)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setThinking(false)
        setText(fallback)
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="space-y-2.5">
      {thinking && (
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/45">
          {[0, 1, 2].map((k) => (
            <motion.span
              key={k}
              animate={{ y: [0, -3, 0], opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 0.9, delay: k * 0.15, repeat: Infinity, ease: 'easeInOut' }}
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
            />
          ))}
          <span className="ml-1">AI 正在回复</span>
        </div>
      )}
      {text && (
        <motion.p
          initial={cached != null ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={cached != null ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="whitespace-pre-wrap text-[14px] leading-[20px] text-[var(--color-ink)]"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
