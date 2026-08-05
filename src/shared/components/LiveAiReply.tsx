import { useEffect, useRef, useState } from 'react'
import { ChatStreamError, streamChat, type ChatMessage } from '@/shared/api/chat'

type ReplyStatus = 'queued' | 'streaming' | 'complete' | 'error'

function userFacingError(error: unknown): string {
  if (error instanceof ChatStreamError) {
    if (error.status === 429) return '请求较多，请稍后重试。'
    if (error.status === 401 || error.status === 403) return 'AI 服务暂时不可用，请稍后重试。'
    if (error.status !== undefined && error.status >= 500) {
      return 'AI 服务暂时没有响应，请稍后重试。'
    }
  }
  if (error instanceof TypeError) return '网络连接失败，请检查网络后重试。'
  return '回复生成失败，请重试。'
}

/** Streams one AI turn. `active=false` keeps the turn visibly queued, which
 * lets the parent serialize a conversation without disabling the composer. */
export function LiveAiReply({
  messages,
  cached,
  active = true,
  fallback: _fallback,
  onDone,
  onError,
  onRetry,
}: {
  /** Full conversation context (system + prior turns + this user message). */
  messages: ChatMessage[]
  /** Previously-streamed reply for this turn; when set, render it instantly. */
  cached?: string
  /** Only the first unresolved turn in a conversation should be active. */
  active?: boolean
  /** Kept for compatibility; failures are shown explicitly instead. */
  fallback?: string
  /** Called once with the final text so the parent can cache it. */
  onDone?: (reply: string) => void
  /** Called when the stream fails, before the inline retry is shown. */
  onError?: (error: unknown) => void
  /** Called immediately before retrying a failed turn. */
  onRetry?: () => void
}) {
  void _fallback
  const [text, setText] = useState(cached ?? '')
  const [status, setStatus] = useState<ReplyStatus>(
    cached != null ? 'complete' : active ? 'streaming' : 'queued',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [attempt, setAttempt] = useState(0)
  const messagesRef = useRef(messages)
  const onDoneRef = useRef(onDone)
  const onErrorRef = useRef(onError)
  const onRetryRef = useRef(onRetry)

  useEffect(() => {
    messagesRef.current = messages
    onDoneRef.current = onDone
    onErrorRef.current = onError
    onRetryRef.current = onRetry
  }, [messages, onDone, onError, onRetry])

  useEffect(() => {
    if (cached != null || !active) return

    const controller = new AbortController()
    let acc = ''
    streamChat(messagesRef.current, {
      signal: controller.signal,
      onToken: (token) => {
        acc += token
        setText(acc)
      },
    })
      .then((full) => {
        if (controller.signal.aborted) return
        const reply = (acc || full).trim()
        if (!reply) throw new ChatStreamError('chat returned an empty reply')
        setText(reply)
        setStatus('complete')
        onDoneRef.current?.(reply)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setStatus('error')
        setErrorMessage(userFacingError(error))
        onErrorRef.current?.(error)
      })

    return () => controller.abort()
  }, [active, attempt, cached])

  const retry = () => {
    onRetryRef.current?.()
    setText('')
    setErrorMessage('')
    setStatus('streaming')
    setAttempt((value) => value + 1)
  }

  const displayedStatus: ReplyStatus = cached != null
    ? 'complete'
    : !active && status !== 'complete'
      ? 'queued'
      : active && status === 'queued'
        ? 'streaming'
        : status
  const displayedText = cached ?? text

  return (
    <div className="space-y-2.5">
      {displayedStatus === 'queued' && (
        <p role="status" className="text-pretty text-[12px] leading-5 text-[var(--color-ink)]/45">
          已排队，等待上一条回复完成
        </p>
      )}
      {displayedStatus === 'streaming' && !displayedText && (
        <p role="status" className="text-pretty text-[12px] leading-5 text-[var(--color-ink)]/45">
          AI 正在回复…
        </p>
      )}
      {displayedText && (
        <p className="text-pretty whitespace-pre-wrap text-[14px] leading-[20px] text-[var(--color-ink)]">
          {displayedText}
        </p>
      )}
      {displayedStatus === 'error' && (
        <div role="alert" className="flex flex-wrap items-center gap-2 text-[12px] leading-5">
          <span className="text-pretty text-red-600 dark:text-red-400">{errorMessage}</span>
          <button
            type="button"
            onClick={retry}
            className="rounded-md border border-[var(--divider)] px-2 py-1 font-medium text-[var(--color-ink)] hover:bg-[var(--fill-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
          >
            重试
          </button>
        </div>
      )}
    </div>
  )
}
