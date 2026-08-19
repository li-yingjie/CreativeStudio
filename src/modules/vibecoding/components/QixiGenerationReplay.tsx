import { useCallback, useEffect, useRef, useState } from 'react'
import XiahuaBuildFlow from './XiahuaBuildFlow'
import type { BuildCard } from './XiahuaChatUI'
import {
  QIXI_GENERATION_REPLAY_SCRIPT,
  QIXI_REPLAY_COMPLETED_PATH,
  qixiReplayIndex,
  type QixiReplayTarget,
} from './QixiGenerationReplayScript'

const LAST_STEP = QIXI_GENERATION_REPLAY_SCRIPT.length - 1
const QIXI_REPLAY_SESSION_KEY = 'creative-studio.qixi-generation-replay.v6'
const QIXI_CUSTOM_CONFIRMATIONS_KEY =
  'creative-studio.qixi-custom-confirmations.v1'

type ReplaySession = {
  step: number
  path: number[]
  playing: boolean
  messages: Record<number, string>
}

const completedReplaySession = (): ReplaySession => ({
  step: LAST_STEP,
  path: [...QIXI_REPLAY_COMPLETED_PATH],
  playing: false,
  messages: {},
})

function readReplaySession(): ReplaySession {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(QIXI_REPLAY_SESSION_KEY) ?? 'null',
    ) as Partial<ReplaySession> | null
    const storedStep = Number(stored?.step)
    const storedPlaying = Boolean(stored?.playing)
    const storedCurrent = QIXI_GENERATION_REPLAY_SCRIPT[storedStep]
    if (
      stored &&
      Number.isInteger(stored.step) &&
      storedStep >= 0 &&
      storedStep <= LAST_STEP &&
      Array.isArray(stored.path) &&
      stored.path.every(
        (index) => Number.isInteger(index) && index >= 0 && index <= LAST_STEP,
      ) &&
      (storedPlaying ||
        storedStep === LAST_STEP ||
        Boolean(storedCurrent?.gate))
    ) {
      return {
        step: storedStep,
        path: stored.path,
        playing: storedPlaying,
        messages:
          stored.messages && typeof stored.messages === 'object'
            ? (stored.messages as Record<number, string>)
            : {},
      }
    }
  } catch {
    // Corrupt or unavailable session storage falls back to the completed log.
  }
  return completedReplaySession()
}

export default function QixiGenerationReplay({
  replayToken,
  onPlaybackChange,
  onTarget,
  onOpenCard,
}: {
  replayToken: number
  onPlaybackChange?: (playing: boolean) => void
  onTarget?: (
    target: QixiReplayTarget,
    stepId: string,
    pathIds: string[],
  ) => void
  onOpenCard?: (card: BuildCard) => void
}) {
  const [session, setSession] = useState<ReplaySession>(readReplaySession)
  const { step, path, playing } = session
  const lastReplayToken = useRef(replayToken)
  const replayEndRef = useRef<HTMLDivElement>(null)
  const onPlaybackChangeRef = useRef(onPlaybackChange)
  const onTargetRef = useRef(onTarget)
  const sessionRef = useRef(session)

  useEffect(() => {
    onPlaybackChangeRef.current = onPlaybackChange
    onTargetRef.current = onTarget
  })

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const startReplay = useCallback(() => {
    setSession({ step: 0, path: [0], playing: true, messages: {} })
  }, [])

  useEffect(() => {
    if (lastReplayToken.current === replayToken) return
    lastReplayToken.current = replayToken
    startReplay()
  }, [replayToken, startReplay])

  useEffect(() => {
    onPlaybackChangeRef.current?.(playing)
  }, [playing])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        QIXI_REPLAY_SESSION_KEY,
        JSON.stringify(session),
      )
    } catch {
      // The replay remains functional in memory.
    }
  }, [session])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      replayEndRef.current?.scrollIntoView({ block: 'end' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [path.length, playing])

  useEffect(
    () => () => {
      try {
        window.sessionStorage.setItem(
          QIXI_REPLAY_SESSION_KEY,
          JSON.stringify({
            step: sessionRef.current.step,
            path: sessionRef.current.path,
            playing: false,
            messages: sessionRef.current.messages,
          }),
        )
      } catch {
        // The completed record remains the safe fallback.
      }
      onPlaybackChangeRef.current?.(false)
    },
    [],
  )

  useEffect(() => {
    const current = QIXI_GENERATION_REPLAY_SCRIPT[step]
    if (!current?.target) return
    onTargetRef.current?.(
      current.target,
      current.id,
      path
        .map((index) => QIXI_GENERATION_REPLAY_SCRIPT[index]?.id)
        .filter(Boolean),
    )
  }, [path, step])

  useEffect(() => {
    if (!playing) return
    const current = QIXI_GENERATION_REPLAY_SCRIPT[step]
    if (!current || current.gate || step >= LAST_STEP) return
    const next = current.nextTo ? qixiReplayIndex(current.nextTo) : step + 1
    const timer = window.setTimeout(
      () => {
        if (next < 0 || next > LAST_STEP) {
          setSession((currentSession) => ({
            ...currentSession,
            playing: false,
          }))
          return
        }
        setSession((currentSession) => ({
          step: next,
          path: [...currentSession.path, next],
          messages: currentSession.messages,
          playing: !(
            QIXI_GENERATION_REPLAY_SCRIPT[next]?.gate || next === LAST_STEP
          ),
        }))
      },
      Math.max(350, current.hold),
    )
    return () => window.clearTimeout(timer)
  }, [playing, step])

  const chooseGate = (
    choice: 'confirm' | 'alt' | { to: string; text?: string },
  ) => {
    const current = QIXI_GENERATION_REPLAY_SCRIPT[step]
    const targetId =
      typeof choice === 'object'
        ? choice.to
        : choice === 'confirm'
          ? current.gate?.confirmTo
          : current.gate?.altTo
    const next = targetId ? qixiReplayIndex(targetId) : step + 1
    if (next < 0 || next > LAST_STEP) return

    if (typeof choice === 'object' && choice.text) {
      const customType = {
        'qixi-scope-choice': 'scope',
        'qixi-gameplay-choice': 'gameplay',
        'qixi-visual-choice': 'visual',
      }[current.id]
      if (customType && targetId?.includes('custom')) {
        try {
          const stored = JSON.parse(
            window.localStorage.getItem(QIXI_CUSTOM_CONFIRMATIONS_KEY) ?? '{}',
          ) as Record<string, string>
          window.localStorage.setItem(
            QIXI_CUSTOM_CONFIRMATIONS_KEY,
            JSON.stringify({ ...stored, [customType]: choice.text }),
          )
        } catch {
          // Custom replies still remain visible in the replay session.
        }
      }
    }
    setSession((currentSession) => ({
      step: next,
      path: [...currentSession.path, next],
      playing: true,
      messages:
        typeof choice === 'object' && choice.text
          ? { ...currentSession.messages, [next]: choice.text }
          : currentSession.messages,
    }))
  }

  const displayScript = QIXI_GENERATION_REPLAY_SCRIPT.map(
    (scriptStep, index) => {
      const message = session.messages[index]
      if (!message || scriptStep.view.kind !== 'user') return scriptStep
      return { ...scriptStep, view: { kind: 'user' as const, text: message } }
    },
  )

  return (
    <>
      <XiahuaBuildFlow
        step={step}
        path={path}
        waiting={!playing && Boolean(QIXI_GENERATION_REPLAY_SCRIPT[step]?.gate)}
        script={displayScript}
        onGate={chooseGate}
        onOpenCard={onOpenCard}
        onReplay={startReplay}
      />
      <div ref={replayEndRef} aria-hidden className="h-px" />
    </>
  )
}
