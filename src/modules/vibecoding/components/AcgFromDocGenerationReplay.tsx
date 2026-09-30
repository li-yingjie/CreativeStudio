import { useCallback, useEffect, useRef, useState } from 'react'
import XiahuaBuildFlow from './XiahuaBuildFlow'
import type { BuildCard } from './XiahuaChatUI'
import {
  ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT,
  ACG_FROM_DOC_REPLAY_COMPLETED_PATH,
  acgFromDocReplayIndex,
  type AcgFromDocReplayTarget,
} from './AcgFromDocGenerationReplayScript'

const LAST_STEP = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.length - 1
const SESSION_KEY = 'creative-studio.acg-from-doc-generation-replay.v2'
const CUSTOM_CONFIRMATIONS_KEY =
  'creative-studio.acg-from-doc-custom-confirmations.v2'

type ReplaySession = {
  step: number
  path: number[]
  playing: boolean
  messages: Record<number, string>
}

const completedReplaySession = (): ReplaySession => ({
  step: LAST_STEP,
  path: [...ACG_FROM_DOC_REPLAY_COMPLETED_PATH],
  playing: false,
  messages: {},
})

function readReplaySession(): ReplaySession {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(SESSION_KEY) ?? 'null',
    ) as Partial<ReplaySession> | null
    const step = Number(stored?.step)
    const current = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[step]
    if (
      stored &&
      Number.isInteger(step) &&
      step >= 0 &&
      step <= LAST_STEP &&
      Array.isArray(stored.path) &&
      stored.path.every(
        (index) => Number.isInteger(index) && index >= 0 && index <= LAST_STEP,
      ) &&
      (stored.playing || step === LAST_STEP || Boolean(current?.gate))
    ) {
      return {
        step,
        path: stored.path,
        playing: Boolean(stored.playing),
        messages:
          stored.messages && typeof stored.messages === 'object'
            ? (stored.messages as Record<number, string>)
            : {},
      }
    }
  } catch {
    // A corrupt replay never blocks the completed project.
  }
  return completedReplaySession()
}

export default function AcgFromDocGenerationReplay({
  replayToken,
  onPlaybackChange,
  onTarget,
  onOpenCard,
  onReplayStart,
}: {
  replayToken: number
  onPlaybackChange?: (playing: boolean) => void
  onTarget?: (
    target: AcgFromDocReplayTarget,
    stepId: string,
    pathIds: string[],
  ) => void
  onOpenCard?: (card: BuildCard) => void
  onReplayStart?: () => void
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

  useEffect(() => onPlaybackChangeRef.current?.(playing), [playing])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      // The replay remains functional in memory.
    }
  }, [session])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      replayEndRef.current?.scrollIntoView({ block: 'end' }),
    )
    return () => window.cancelAnimationFrame(frame)
  }, [path.length, playing])

  useEffect(
    () => () => {
      try {
        window.sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...sessionRef.current, playing: false }),
        )
      } catch {
        // The completed record remains the fallback.
      }
      onPlaybackChangeRef.current?.(false)
    },
    [],
  )

  useEffect(() => {
    const current = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[step]
    if (!current?.target) return
    onTargetRef.current?.(
      current.target,
      current.id,
      path
        .map((index) => ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[index]?.id)
        .filter(Boolean),
    )
  }, [path, step])

  useEffect(() => {
    if (!playing) return
    const current = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[step]
    if (!current || current.gate || step >= LAST_STEP) return
    const next = current.nextTo ? acgFromDocReplayIndex(current.nextTo) : step + 1
    const timer = window.setTimeout(() => {
      if (next < 0 || next > LAST_STEP) {
        setSession((value) => ({ ...value, playing: false }))
        return
      }
      setSession((value) => ({
        step: next,
        path: [...value.path, next],
        messages: value.messages,
        playing: !(
          ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[next]?.gate || next === LAST_STEP
        ),
      }))
    }, Math.max(350, current.hold))
    return () => window.clearTimeout(timer)
  }, [playing, step])

  const chooseGate = (
    choice: 'confirm' | 'alt' | { to: string; text?: string },
  ) => {
    const current = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[step]
    const targetId =
      typeof choice === 'object'
        ? choice.to
        : choice === 'confirm'
          ? current.gate?.confirmTo
          : current.gate?.altTo
    const next = targetId ? acgFromDocReplayIndex(targetId) : step + 1
    if (next < 0 || next > LAST_STEP) return

    if (typeof choice === 'object' && choice.text && targetId?.includes('custom')) {
      const customType = {
        'acg-doc-scope-choice': 'scope',
        'acg-doc-gameplay-choice': 'gameplay',
        'acg-doc-visual-choice': 'visual',
      }[current.id]
      if (customType) {
        try {
          const stored = JSON.parse(
            window.localStorage.getItem(CUSTOM_CONFIRMATIONS_KEY) ?? '{}',
          ) as Record<string, string>
          window.localStorage.setItem(
            CUSTOM_CONFIRMATIONS_KEY,
            JSON.stringify({ ...stored, [customType]: choice.text }),
          )
        } catch {
          // The custom text still stays in this replay session.
        }
      }
    }

    setSession((value) => ({
      step: next,
      path: [...value.path, next],
      playing: true,
      messages:
        typeof choice === 'object' && choice.text
          ? { ...value.messages, [next]: choice.text }
          : value.messages,
    }))
  }

  const displayScript = ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.map(
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
        waiting={
          !playing &&
          Boolean(ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT[step]?.gate)
        }
        script={displayScript}
        onGate={chooseGate}
        onOpenCard={onOpenCard}
        onReplay={() => {
          onReplayStart?.()
          startReplay()
        }}
      />
      <div ref={replayEndRef} aria-hidden className="h-px" />
    </>
  )
}
