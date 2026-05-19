import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { ArrowUp } from 'lucide-react'
import { usePersonaStore } from '../../store/persona-store'
import { getWorld } from '../../data/worlds'
import PhoneStatusBar from './PhoneStatusBar'

interface Turn {
  id: string
  from: 'ai' | 'me'
  text: string
}

const REPLY_POOL = [
  '嗯，我在听。',
  '这个想法挺有意思，能再多说一点吗？',
  '让我想想…… 对，我会这么帮你。',
  '好，那按这个方向先试一下？',
  '明白，我替你记下了。',
  '我这边还想到一个角度，要不要一起聊聊？',
  '可以，我陪你慢慢拆这件事。',
]

function pickReply(): string {
  return REPLY_POOL[Math.floor(Math.random() * REPLY_POOL.length)]
}

/** Derive the first welcome turn from the persona's goal doc. */
function buildWelcomeTurn(goal: string): Turn {
  const line = goal.split(/[。.\n]/)[0]?.trim() || '可以帮你把想法变成画面'
  return { id: 'welcome', from: 'ai', text: `${line}。` }
}

interface ChatPreviewProps {
  /** When set, renders the preview as if this world were selected —
   *  overriding whatever the user currently has in the persona store. Used
   *  in vibecoding's Identity V sample to always show 约瑟夫. */
  worldOverride?: string
}

export default function ChatPreview({ worldOverride }: ChatPreviewProps = {}) {
  const storeName = usePersonaStore((s) => s.name)
  const storeGoalDoc = usePersonaStore((s) => s.goalDoc)
  const storePortraitUrl = usePersonaStore((s) => s.portraitUrl)
  const storeWorldId = usePersonaStore((s) => s.currentWorldId)

  const currentWorldId = worldOverride ?? storeWorldId
  const currentWorld = getWorld(currentWorldId)
  const isReal = currentWorld.kind === 'real'
  const previewVideo = currentWorld.previewVideo

  // When overriding, pull persona fields from the target world's defaults
  // instead of the live store so the preview stays frozen to that persona.
  const name = worldOverride ? currentWorld.defaults.name : storeName
  const goalDoc = worldOverride ? currentWorld.defaults.goalDoc : storeGoalDoc
  const portraitUrl = worldOverride
    ? currentWorld.defaults.portraitUrl
    : storePortraitUrl

  const welcome = useMemo(() => buildWelcomeTurn(goalDoc), [goalDoc])
  const [messages, setMessages] = useState<Turn[]>([welcome])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([welcome])
    setInput('')
    setPending(false)
  }, [welcome])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const send = () => {
    const text = input.trim()
    if (!text || pending) return
    const me: Turn = { id: `me-${Date.now()}`, from: 'me', text }
    setMessages((m) => [...m, me])
    setInput('')
    setPending(true)
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: `ai-${Date.now()}`, from: 'ai', text: pickReply() },
      ])
      setPending(false)
    }, 720)
  }

  const handleKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const videoRef = useRef<HTMLVideoElement>(null)

  const playVideo = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !previewVideo) return
    const onEnded = () => {
      v.currentTime = 0
    }
    v.addEventListener('ended', onEnded)
    return () => v.removeEventListener('ended', onEnded)
  }, [previewVideo])

  useEffect(() => {
    if (!previewVideo) return
    const id = window.setInterval(playVideo, 30000)
    return () => window.clearInterval(id)
  }, [previewVideo, playVideo])



  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      onMouseEnter={previewVideo ? playVideo : undefined}
    >
      {/* Status bar */}
      <PhoneStatusBar />

      {/* Background */}
      {previewVideo ? (
        <video
          ref={videoRef}
          key={previewVideo}
          aria-hidden
          src={previewVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : isReal ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(73.23% 121.96% at -9.62% 81.81%, #D5DAEA 0%, #EAEDF3 100%)',
            }}
          />
          <img
            aria-hidden
            src={portraitUrl}
            alt=""
            key={portraitUrl}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500"
          />
        </>
      ) : (
        currentWorld.heroImage && (
          <img
            aria-hidden
            src={currentWorld.heroImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
          />
        )
      )}
      {/* Progressive blur — three duplicate background layers with
           increasing CSS blur radii, each masked to its own band so the
           perceived blur ramps up smoothly from mid-screen to the
           bottom edge. Placed BEFORE the dark gradient layer so the
           gradient presses down their brightness. Uses the SAME source
           as the sharp background (video → duplicate the video; image
           → duplicate the image) so the blurred band matches instead of
           revealing a different asset. */}
      {previewVideo ? (
        <>
          <video
            aria-hidden
            src={previewVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
            style={{
              filter: 'blur(4px)',
              maskImage: 'linear-gradient(to bottom, transparent 42%, black 60%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 42%, black 60%)',
            }}
          />
          <video
            aria-hidden
            src={previewVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
            style={{
              filter: 'blur(10px)',
              maskImage: 'linear-gradient(to bottom, transparent 55%, black 75%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 55%, black 75%)',
            }}
          />
          <video
            aria-hidden
            src={previewVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
            style={{
              filter: 'blur(22px)',
              maskImage: 'linear-gradient(to bottom, transparent 70%, black 92%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 70%, black 92%)',
            }}
          />
        </>
      ) : (
        (isReal ? portraitUrl : currentWorld.heroImage) && (
          <>
            <img
              aria-hidden
              src={isReal ? portraitUrl : currentWorld.heroImage}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
              style={{
                filter: 'blur(4px)',
                maskImage: 'linear-gradient(to bottom, transparent 42%, black 60%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 42%, black 60%)',
              }}
            />
            <img
              aria-hidden
              src={isReal ? portraitUrl : currentWorld.heroImage}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
              style={{
                filter: 'blur(10px)',
                maskImage: 'linear-gradient(to bottom, transparent 55%, black 75%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 55%, black 75%)',
              }}
            />
            <img
              aria-hidden
              src={isReal ? portraitUrl : currentWorld.heroImage}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
              style={{
                filter: 'blur(22px)',
                maskImage: 'linear-gradient(to bottom, transparent 70%, black 92%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 70%, black 92%)',
              }}
            />
          </>
        )
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-40% via-black/50 via-70% to-black/85"
      />

      {/* Spacer */}
      <div className="relative flex-1" />

      {/* Bottom */}
      <div className="relative flex flex-shrink-0 flex-col px-3 pb-4">
        {/* Name + bio centered above cards */}
        <div className="mb-4 flex flex-col items-center gap-1 text-center">
          <h3 className="text-[15px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {name || 'AI'}
          </h3>
          <p className="line-clamp-2 max-w-[85%] text-[11px] leading-relaxed text-white/65">
            {goalDoc.split(/[。.\n]/)[0]?.trim() || '可以帮你把想法变成画面'}
          </p>
        </div>

        {/* Activity cards — content comes from currentWorld.activities so
            each world shows its own flavor; fall back to a generic pair. */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          {(
            currentWorld.activities ?? [
              { label: '日记', hint: '手记，你来续写' },
              { label: '演练', hint: '模拟场景，你选她评' },
            ]
          )
            .slice(0, 2)
            .map((activity, idx) => (
              <div
                key={`${activity.label}-${idx}`}
                style={{ ['--edge-alpha' as string]: 0.2 }}
                className="group/card glass-edge flex flex-col gap-1.5 overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-3 py-2.5 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.15)] backdrop-blur-xl"
              >
                <div className="text-[11px] font-medium text-white">
                  {activity.label}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[8px] leading-[1.5] text-white/40">
                    {activity.hint}
                  </div>
                  <div className="relative h-[36px] w-[36px] flex-shrink-0">
                    <div
                      className={`absolute right-0 top-0 h-[30px] w-[22px] overflow-hidden rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-transform duration-300 ${
                        idx === 0
                          ? 'rotate-6 group-hover/card:rotate-12 group-hover/card:translate-x-0.5'
                          : 'rotate-3 group-hover/card:rotate-8 group-hover/card:translate-x-0.5'
                      }`}
                    >
                      <img
                        src={portraitUrl}
                        alt=""
                        className={`h-full w-full object-cover ${idx === 1 ? 'brightness-110 saturate-125' : ''}`}
                        style={{ objectPosition: idx === 0 ? '50% 20%' : '50% 30%' }}
                      />
                    </div>
                    <div
                      className={`absolute right-[7px] top-[3px] h-[30px] w-[22px] overflow-hidden rounded-md shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-transform duration-300 ${
                        idx === 0
                          ? '-rotate-[15deg] group-hover/card:-rotate-[22deg] group-hover/card:-translate-x-0.5'
                          : '-rotate-[10deg] group-hover/card:-rotate-[18deg] group-hover/card:-translate-x-0.5'
                      }`}
                    >
                      <img
                        src={portraitUrl}
                        alt=""
                        className={`h-full w-full object-cover ${idx === 0 ? 'brightness-75 saturate-150' : ''}`}
                        style={{ objectPosition: idx === 0 ? '50% 35%' : '50% 15%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Composer */}
        <div
          style={{ ['--edge-alpha' as string]: 0.2 }}
          className="glass-edge flex items-center gap-2 rounded-full bg-gradient-to-b from-white/[0.09] to-white/[0.02] px-3 py-2 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.18)] backdrop-blur-xl"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`发消息给${name || 'AI'}说话…`}
            className="flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || pending}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/40 text-white transition-opacity disabled:opacity-40"
            aria-label="发送"
          >
            <ArrowUp size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  )
}
