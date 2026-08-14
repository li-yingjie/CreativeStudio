import { useCallback, useEffect, useRef, useState } from 'react'
import XiahuaBuildFlow from './XiahuaBuildFlow'
import type { BuildCard } from './XiahuaChatUI'
import {
  ACG_GENERATION_REPLAY_SCRIPT,
  ACG_REPLAY_COMPLETED_PATH,
  acgReplayIndex,
  type AcgReplayTarget,
} from './AcgGenerationReplayScript'

const LAST_STEP = ACG_GENERATION_REPLAY_SCRIPT.length - 1
const ACG_REPLAY_SESSION_KEY = 'creative-studio.acg-generation-replay.v4'

type ReplaySession = { step: number; path: number[]; playing: boolean }

function readReplaySession(): ReplaySession {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(ACG_REPLAY_SESSION_KEY) ?? 'null',
    ) as Partial<ReplaySession> | null
    if (
      stored &&
      Number.isInteger(stored.step) &&
      Number(stored.step) >= 0 &&
      Number(stored.step) <= LAST_STEP &&
      Array.isArray(stored.path) &&
      stored.path.every(
        (index) => Number.isInteger(index) && index >= 0 && index <= LAST_STEP,
      )
    ) {
      return {
        step: Number(stored.step),
        path: stored.path,
        playing: Boolean(stored.playing),
      }
    }
  } catch {
    // Corrupt or unavailable session storage falls back to the completed log.
  }
  return {
    step: LAST_STEP,
    path: ACG_REPLAY_COMPLETED_PATH,
    playing: false,
  }
}

export default function AcgGenerationReplay({
  replayToken,
  onPlaybackChange,
  onTarget,
  onOpenCard,
}: {
  replayToken: number
  onPlaybackChange?: (playing: boolean) => void
  onTarget?: (target: AcgReplayTarget, stepId: string, pathIds: string[]) => void
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
    setSession({ step: 0, path: [0], playing: true })
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
        ACG_REPLAY_SESSION_KEY,
        JSON.stringify(session),
      )
    } catch {
      // The replay remains fully functional in memory.
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
          ACG_REPLAY_SESSION_KEY,
          JSON.stringify({
            step: sessionRef.current.step,
            path: sessionRef.current.path,
            playing: false,
          }),
        )
      } catch {
        // The workspace can still reopen at its default completed state.
      }
      onPlaybackChangeRef.current?.(false)
    },
    [],
  )

  useEffect(() => {
    const current = ACG_GENERATION_REPLAY_SCRIPT[step]
    if (current?.target) {
      onTargetRef.current?.(
        current.target,
        current.id,
        path.map((index) => ACG_GENERATION_REPLAY_SCRIPT[index]?.id).filter(Boolean),
      )
    }
  }, [path, step])

  useEffect(() => {
    if (!playing) return
    const current = ACG_GENERATION_REPLAY_SCRIPT[step]
    if (!current || current.gate || step >= LAST_STEP) return
    const next = current.nextTo ? acgReplayIndex(current.nextTo) : step + 1
    const timer = window.setTimeout(() => {
      if (next < 0 || next > LAST_STEP) {
        setSession((currentSession) => ({ ...currentSession, playing: false }))
        return
      }
      setSession((currentSession) => ({
        step: next,
        path: [...currentSession.path, next],
        playing: !(
          ACG_GENERATION_REPLAY_SCRIPT[next]?.gate || next === LAST_STEP
        ),
      }))
    }, Math.max(350, current.hold))
    return () => window.clearTimeout(timer)
  }, [playing, step])

  const chooseGate = (
    choice: 'confirm' | 'alt' | { to: string; text?: string },
  ) => {
    const current = ACG_GENERATION_REPLAY_SCRIPT[step]
    const targetId =
      typeof choice === 'object'
        ? choice.to
        : choice === 'confirm'
          ? current.gate?.confirmTo
          : current.gate?.altTo
    const next = targetId ? acgReplayIndex(targetId) : step + 1
    if (next < 0 || next > LAST_STEP) return
    setSession((currentSession) => ({
      step: next,
      path: [...currentSession.path, next],
      playing: true,
    }))
  }

  return (
    <>
      <XiahuaBuildFlow
        step={step}
        path={path}
        waiting={!playing && Boolean(ACG_GENERATION_REPLAY_SCRIPT[step]?.gate)}
        script={ACG_GENERATION_REPLAY_SCRIPT}
        onGate={chooseGate}
        onOpenCard={onOpenCard}
        onReplay={startReplay}
      />
      <div ref={replayEndRef} aria-hidden className="h-px" />
    </>
  )
}
