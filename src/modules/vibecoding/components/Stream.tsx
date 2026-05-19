import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Tiny coordinator hook: returns `[step, next]` where step starts at 1
 *  and each call to next() bumps it by 1. Used inside an AI bubble to
 *  gate sequential reveal — paragraph 2 mounts only after paragraph 1's
 *  Stream calls onDone, etc. */
export function useStreamStep(initial = 1): readonly [number, () => void] {
  const [step, setStep] = useState(initial)
  const next = useCallback(() => setStep((s) => s + 1), [])
  return [step, next] as const
}

/** Render-prop wrapper that owns its own step counter so each AI bubble
 *  reveals its paragraphs / cards sequentially without manually plumbing
 *  state per call site. */
export function Sequential({
  children,
}: {
  children: (step: number, next: () => void) => ReactNode
}) {
  const [step, next] = useStreamStep()
  return <>{children(step, next)}</>
}

/** Reveals its children after `delay` ms once mounted. Use for non-Stream
 *  items (cards, forms, summaries) inside a sequential bubble so they
 *  appear after a small pause and report done up the chain. */
export function RevealAfter({
  delay = 150,
  onDone,
  children,
}: {
  delay?: number
  onDone?: () => void
  children: ReactNode
}) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const tid = setTimeout(() => {
      setShown(true)
      onDone?.()
    }, delay)
    return () => clearTimeout(tid)
  }, [delay, onDone])
  if (!shown) return null
  return <>{children}</>
}

/**
 * <Stream> — AI-style streaming text renderer.
 *
 * Reveals children progressively to mimic token-by-token output. Plain
 * string children are typed character-by-character; React-element
 * children (e.g. <MentionChip>, <FileChip>) appear atomically when the
 * stream reaches their position.
 *
 * Use to wrap an AI bubble's leading text so the chat feels live instead
 * of all-at-once. The state persists across re-renders, so once a Stream
 * has finished it stays done — only newly-mounted instances animate
 * fresh, which matches the "latest message streams" UX.
 */

type Token =
  | { type: 'text'; text: string }
  | { type: 'element'; el: ReactElement }

function tokenize(node: ReactNode): Token[] {
  const out: Token[] = []
  Children.forEach(node, (child) => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return
    }
    if (typeof child === 'string' || typeof child === 'number') {
      out.push({ type: 'text', text: String(child) })
    } else if (Array.isArray(child)) {
      // forEach already flattens single-level arrays; defensive recurse
      out.push(...tokenize(child))
    } else if (isValidElement(child)) {
      out.push({ type: 'element', el: child as ReactElement })
    }
  })
  return out
}

interface StreamProps {
  children: ReactNode
  /** ms per character (default 22, snappy for CJK). */
  speed?: number
  /** ms per non-text element when revealed (default 70). */
  nodePause?: number
  /** Render a blinking caret at the tail while streaming. */
  cursor?: boolean
  /** Called once when the full content has been revealed. Use to chain
   *  the next paragraph / card / form so siblings appear sequentially. */
  onDone?: () => void
}

export default function Stream({
  children,
  speed = 22,
  nodePause = 70,
  cursor = true,
  onDone,
}: StreamProps) {
  const tokens = useMemo(() => tokenize(children), [children])
  const totalSteps = useMemo(
    () =>
      tokens.reduce(
        (s, t) => s + (t.type === 'text' ? t.text.length : 1),
        0,
      ),
    [tokens],
  )
  const [progress, setProgress] = useState(0)

  // Hold the latest tokens / onDone in refs so the timer effect only
  // re-runs when progress / totalSteps actually change. Otherwise every
  // parent render produces new tokens/onDone refs, the effect re-runs,
  // the in-flight setTimeout gets cleared, and progress stalls at 0.
  const tokensRef = useRef(tokens)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    tokensRef.current = tokens
  }, [tokens])
  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (progress >= totalSteps) {
      onDoneRef.current?.()
      return
    }
    // Pick the per-step delay based on the token currently being revealed.
    let consumed = 0
    let delay = speed
    for (const t of tokensRef.current) {
      const len = t.type === 'text' ? t.text.length : 1
      if (progress < consumed + len) {
        delay = t.type === 'element' ? nodePause : speed
        break
      }
      consumed += len
    }
    const tid = setTimeout(() => setProgress((p) => p + 1), delay)
    return () => clearTimeout(tid)
  }, [progress, totalSteps, speed, nodePause])

  // Compose visible output
  const rendered: ReactNode[] = []
  let consumed = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'text') {
      const len = t.text.length
      if (progress >= consumed + len) {
        rendered.push(<span key={`t${i}`}>{t.text}</span>)
        consumed += len
      } else {
        const visible = progress - consumed
        if (visible > 0) {
          rendered.push(
            <span key={`t${i}`}>{t.text.slice(0, visible)}</span>,
          )
        }
        break
      }
    } else {
      if (progress >= consumed + 1) {
        rendered.push(<span key={`e${i}`}>{t.el}</span>)
        consumed += 1
      } else {
        break
      }
    }
  }

  return (
    <>
      {rendered}
      {cursor && progress < totalSteps && (
        <span
          aria-hidden
          className="ml-[1px] inline-block h-[0.95em] w-[2px] -translate-y-[1px] bg-current align-middle animate-pulse"
        />
      )}
    </>
  )
}
