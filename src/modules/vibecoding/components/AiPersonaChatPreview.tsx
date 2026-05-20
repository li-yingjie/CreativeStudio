import { Fragment, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  AudioLines,
  Ban,
  Camera,
  MoreHorizontal,
  Plus,
  Smile,
  Trash2,
  Video,
  Zap,
} from '@/shared/icons'
import PhoneStatusBar from '@/modules/editor/components/preview/PhoneStatusBar'

/**
 * 抖音 AI 分身私信预览 — mock of the Douyin private-message page for an
 * AI-avatar persona. Renders the nav bar, hero profile, a seeded mini
 * conversation, and any simulated trigger firings appended by the
 * parent (`simulations` prop). The test controls themselves live
 * outside the phone frame — owned by VibeCodingPage — so the phone
 * renders as an authentic Douyin surface.
 */
const AVATAR_GRADIENT =
  'linear-gradient(135deg,#ffe0a6 0%,#ffc57a 45%,#ff9b68 100%)'

/** Friendly user-perspective label for a simulated event — shown in the
 *  "模拟事件" banner so the preview reads like the user's real action. */
const SIM_USER_ACTION: Record<string, string> = {
  'user-follow': '你关注了 陶白白Sensei',
  'user-comment': '你在作品下留言',
  'user-like': '你点赞了作品',
  'user-gift': '你送出一个礼物',
  'user-post': '你发布了新作品',
}

export interface TriggerSimulation {
  key: string
  eventId: string
  eventLabel: string
  actionDescription: string
}

export default function AiPersonaChatPreview({
  simulations = [],
}: {
  /** Trigger firings the parent has appended. Rendering only — the
   *  parent owns state and exposes the test controls outside the phone. */
  simulations?: TriggerSimulation[]
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  // Scroll the body to the bottom whenever a new simulation arrives so
  // the freshly-fired AI reply is immediately visible.
  useEffect(() => {
    if (simulations.length === 0) return
    const el = bodyRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [simulations.length])
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#ededed] text-[#1f1f1f]">
      <PhoneStatusBar />

      {/* Top nav */}
      <div className="relative z-10 flex shrink-0 items-center justify-between bg-[#ededed] px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="ml-0.5 text-[12px] text-[#1f1f1f]/60">6</span>
          <div
            className="ml-1 h-6 w-6 shrink-0 overflow-hidden rounded-full"
            style={{ background: AVATAR_GRADIENT }}
            aria-hidden
          >
            <AvatarGlyph small />
          </div>
          <span className="ml-1.5 truncate text-[14px] font-medium">陶白白Sensei</span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Video size={16} strokeWidth={2} />
          <MoreHorizontal size={16} strokeWidth={2} />
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="thin-scroll flex-1 overflow-y-auto px-3 pb-1.5">
        {/* Hero profile card */}
        <div className="flex flex-col items-center pt-3 pb-2">
          <div
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
            style={{ background: AVATAR_GRADIENT }}
          >
            <AvatarGlyph />
          </div>
          <h3 className="mt-3 text-[16px] font-semibold">陶白白Sensei</h3>
          <p className="mt-1 text-[11.5px] leading-[1.6] text-[#6b6b6b]">
            大家好啊，我是陶白白。
          </p>
          <p className="text-[11.5px] leading-[1.6] text-[#6b6b6b]">
            商务合作: fqsw0031
          </p>
        </div>

        {/* Timestamp */}
        <p className="mt-1 text-center text-[10px] text-[#9b9b9b]">
          2025/12/04 16:19
        </p>

        {/* Safety notice */}
        <p className="mt-2 px-5 text-center text-[10.5px] leading-[1.55] text-[#9b9b9b]">
          为保障用户沟通安全，未互相关注的陌生人违规消息可能会被处理，请遵守法律法规和社区规范
        </p>

        {/* User message */}
        <div className="mt-3 flex items-end justify-end gap-1.5">
          <div className="rounded-[10px] bg-[#2f85ff] px-3 py-1.5 text-[13px] leading-[1.5] text-white shadow-[0_1px_2px_rgba(16,18,24,0.06)]">
            你好
          </div>
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-400">
            <UserGlyph />
          </div>
        </div>

        {/* AI-avatar system notice */}
        <p className="mt-3 text-center text-[10.5px] leading-[1.6] text-[#9b9b9b]">
          作者已开启{' '}
          <span className="text-[#2f85ff]">AI 分身</span>{' '}
          私信，由{' '}
          <span className="text-[#2f85ff]">AI 分身</span>
          回复你的消息
        </p>

        {/* AI reply */}
        <div className="mt-2 flex items-start gap-1.5">
          <div
            className="h-6 w-6 shrink-0 overflow-hidden rounded-full"
            style={{ background: AVATAR_GRADIENT }}
          >
            <AvatarGlyph small />
          </div>
          <div className="flex max-w-[82%] flex-col items-start gap-1">
            <div className="rounded-[10px] bg-white px-3 py-2 text-[13px] leading-[1.55] text-[#1f1f1f] shadow-[0_1px_2px_rgba(16,18,24,0.05)]">
              你好啊 kingjaylee！最近感情上有没有啥困惑？或者想聊聊哪个星座？我这儿随时在线帮你分析分析。
            </div>
            <span className="ml-1 text-[10px] text-[#9b9b9b]">由AI分身生成</span>
          </div>
        </div>

        {/* Simulated trigger firings — appended in click order. Each sim
             renders a dashed system banner + the AI-reply bubble using
             the trigger's configured action.description. */}
        {simulations.map((sim) => (
          <Fragment key={sim.key}>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="h-px flex-1 bg-[#dcdcdc]" />
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6e0] px-2 py-0.5 text-[10px] text-[#a87b20]">
                <Zap size={9} strokeWidth={2} />
                模拟事件：{sim.eventLabel}
              </span>
              <span className="h-px flex-1 bg-[#dcdcdc]" />
            </div>
            <p className="mt-1 text-center text-[10px] leading-[1.6] text-[#9b9b9b]">
              {SIM_USER_ACTION[sim.eventId] ?? '触发器被触发'}
            </p>
            <div className="mt-2 flex items-start gap-1.5">
              <div
                className="h-6 w-6 shrink-0 overflow-hidden rounded-full"
                style={{ background: AVATAR_GRADIENT }}
              >
                <AvatarGlyph small />
              </div>
              <div className="flex max-w-[82%] flex-col items-start gap-1">
                <div className="rounded-[10px] bg-white px-3 py-2 text-[13px] leading-[1.55] text-[#1f1f1f] shadow-[0_1px_2px_rgba(16,18,24,0.05)]">
                  {sim.actionDescription}
                </div>
                <span className="ml-1 text-[10px] text-[#9b9b9b]">
                  由AI分身生成 · 触发器
                </span>
              </div>
            </div>
          </Fragment>
        ))}

      </div>

      {/* Action chips */}
      <div className="relative z-10 flex shrink-0 items-center gap-1.5 px-3 pb-1.5">
        {[
          { label: '拉黑', icon: Ban },
          { label: '举报', icon: AlertTriangle },
          { label: '删除会话', icon: Trash2 },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex flex-1 items-center justify-center gap-1 rounded-[10px] bg-white py-2 text-[11.5px] font-medium text-[#1f1f1f] shadow-[0_1px_2px_rgba(16,18,24,0.05)]"
          >
            <Icon size={11} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="relative z-10 flex shrink-0 items-center gap-2 border-t border-[#dcdcdc] bg-white px-3 py-2">
        <Camera size={18} strokeWidth={1.5} className="text-[#1f1f1f]" />
        <div className="flex-1 rounded-md bg-[#f1f1f1] px-3 py-1.5 text-[12px] text-[#9b9b9b]">
          发送消息
        </div>
        <AudioLines size={18} strokeWidth={1.5} className="text-[#1f1f1f]" />
        <Smile size={18} strokeWidth={1.5} className="text-[#1f1f1f]" />
        <Plus size={18} strokeWidth={1.5} className="text-[#1f1f1f]" />
      </div>
    </div>
  )
}

/** Simple CSS-only glyph that suggests the anime-style persona avatar
 *  in the reference screenshot without shipping a bitmap asset. */
function AvatarGlyph({ small = false }: { small?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="h-full w-full"
    >
      {/* hair */}
      <path
        d="M14 30C14 18 22 10 32 10C42 10 50 18 50 30V42H14V30Z"
        fill="#7fdfc6"
      />
      {/* face */}
      <circle cx="32" cy="34" r="14" fill="#ffe7cf" />
      {/* bangs */}
      <path
        d="M18 30 Q22 20 32 20 Q42 20 46 30 L46 34 Q42 28 32 28 Q22 28 18 34 Z"
        fill="#67cdb3"
      />
      {/* cheeks */}
      <circle cx="24" cy="39" r={small ? 1.2 : 2} fill="#f5a7a0" opacity="0.7" />
      <circle cx="40" cy="39" r={small ? 1.2 : 2} fill="#f5a7a0" opacity="0.7" />
      {/* eyes */}
      <rect x="24" y="34" width="5" height="1.5" rx="0.75" fill="#2d2b2b" />
      <rect x="35" y="34" width="5" height="1.5" rx="0.75" fill="#2d2b2b" />
    </svg>
  )
}

/** Placeholder user avatar — a generic rounded silhouette so the bubble
 *  still has a companion glyph without needing a real uploaded photo. */
function UserGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="h-full w-full text-white/80"
    >
      <circle cx="12" cy="9" r="3.5" fill="currentColor" />
      <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" fill="currentColor" />
    </svg>
  )
}
