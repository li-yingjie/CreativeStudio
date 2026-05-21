import { Fragment, memo, useEffect, useRef } from 'react'
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
import { DEFAULT_AVATAR_PREVIEW, type AvatarAppConfig, type AvatarComment } from './AvatarConfigData'

/**
 * 抖音 AI 分身私信预览 — mock of the Douyin private-message page for an
 * AI-avatar persona. Persona-specific content (name / avatar / bio / seeded
 * conversation / comment thread) is driven by the project's `config.preview`,
 * so the same renderer shows any 分身; it falls back to DEFAULT_AVATAR_PREVIEW
 * when no config is supplied. Simulated trigger firings are appended by the
 * parent (`simulations` prop) — the test controls live outside the phone.
 */
const AVATAR_GRADIENT =
  'linear-gradient(135deg,#ffe0a6 0%,#ffc57a 45%,#ff9b68 100%)'

/** Friendly user-perspective label for a simulated event — shown in the
 *  "模拟事件" banner so the preview reads like the user's real action. */
function simUserAction(eventId: string, displayName: string): string {
  switch (eventId) {
    case 'user-follow':
      return `你关注了 ${displayName}`
    case 'user-comment':
      return '你在作品下留言'
    case 'user-like':
      return '你点赞了作品'
    case 'user-gift':
      return '你送出一个礼物'
    case 'user-post':
      return '你发布了新作品'
    default:
      return '触发器被触发'
  }
}

export interface TriggerSimulation {
  key: string
  eventId: string
  eventLabel: string
  actionDescription: string
}

function AiPersonaChatPreview({
  config,
  scene = 'chat',
  simulations = [],
}: {
  /** The 分身's app config — its `preview` drives the surface content. */
  config?: AvatarAppConfig
  /** Which surface to render — 'chat' = 私信/AI 聊天; 'comment' = 评论区. */
  scene?: 'chat' | 'comment'
  /** Trigger firings the parent has appended. Rendering only — the
   *  parent owns state and exposes the test controls outside the phone. */
  simulations?: TriggerSimulation[]
}) {
  const p = config?.preview ?? DEFAULT_AVATAR_PREVIEW
  const bodyRef = useRef<HTMLDivElement>(null)
  // Scroll the body to the bottom whenever a new simulation arrives so
  // the freshly-fired AI reply is immediately visible.
  useEffect(() => {
    if (simulations.length === 0) return
    const el = bodyRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [simulations.length])
  if (scene === 'comment')
    return (
      <CommentSceneView
        comments={p.comments}
        avatarUrl={p.avatarUrl}
        displayName={p.displayName}
      />
    )
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#ededed] text-[#1f1f1f]">
      <PhoneStatusBar />

      {/* Top nav */}
      <div className="relative z-10 flex shrink-0 items-center justify-between bg-[#ededed] px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <ArrowLeft size={18} strokeWidth={2} />
          <div
            className="ml-1 h-6 w-6 shrink-0 overflow-hidden rounded-full"
            style={{ background: AVATAR_GRADIENT }}
            aria-hidden
          >
            <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <span className="ml-1.5 truncate text-[14px] font-medium">{p.displayName}</span>
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
            <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <h3 className="mt-3 text-[16px] font-semibold">{p.displayName}</h3>
          {p.bio.map((line, i) => (
            <p
              key={i}
              className={`${i === 0 ? 'mt-1 ' : ''}text-[11.5px] leading-[1.6] text-[#6b6b6b]`}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Timestamp */}
        <p className="mt-1 text-center text-[10px] text-[#9b9b9b]">{p.timestamp}</p>

        {/* Safety notice */}
        <p className="mt-2 px-5 text-center text-[10.5px] leading-[1.55] text-[#9b9b9b]">
          为保障用户沟通安全，未互相关注的陌生人违规消息可能会被处理，请遵守法律法规和社区规范
        </p>

        {/* User message */}
        <div className="mt-3 flex items-end justify-end gap-1.5">
          <div className="rounded-[10px] bg-[#2f85ff] px-3 py-1.5 text-[13px] leading-[1.5] text-white shadow-[0_1px_2px_rgba(16,18,24,0.06)]">
            {p.seedUserMessage}
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
            <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex max-w-[82%] flex-col items-start gap-1">
            <div className="rounded-[10px] bg-white px-3 py-2 text-[13px] leading-[1.55] text-[#1f1f1f] shadow-[0_1px_2px_rgba(16,18,24,0.05)]">
              {p.seedAiReply}
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
              {simUserAction(sim.eventId, p.displayName)}
            </p>
            <div className="mt-2 flex items-start gap-1.5">
              <div
                className="h-6 w-6 shrink-0 overflow-hidden rounded-full"
                style={{ background: AVATAR_GRADIENT }}
              >
                <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
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

/** 评论区 surface — a Douyin-style comment thread where the AI 分身 auto-replies
 *  to user comments. Content (thread + persona avatar/name) is config-driven;
 *  mirrors the chat scene's framing so toggling between the two reads as one
 *  product. */
function CommentSceneView({
  comments,
  avatarUrl,
  displayName,
}: {
  comments: AvatarComment[]
  avatarUrl: string
  displayName: string
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#1f1f1f]">
      <PhoneStatusBar />

      {/* Top nav */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#f0f0f0] px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-[14px] font-medium">评论 156</span>
        </div>
        <MoreHorizontal size={16} strokeWidth={2} />
      </div>

      {/* Comment list */}
      <div className="thin-scroll flex-1 overflow-y-auto px-3 py-2">
        {comments.map((c) => (
          <div key={c.user} className="flex gap-2 py-2.5">
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-400">
              <UserGlyph />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-[#9b9b9b]">{c.user}</div>
              <p className="mt-0.5 text-[13px] leading-[1.5] text-[#1f1f1f]">{c.text}</p>
              <div className="mt-1 flex items-center gap-3 text-[10.5px] text-[#9b9b9b]">
                <span>{c.time}</span>
                <span>回复</span>
                <span className="ml-auto flex items-center gap-1">♥ {c.likes}</span>
              </div>

              {/* AI 分身 auto-reply */}
              <div className="mt-2 flex gap-2 rounded-[10px] bg-[#f7f7f7] p-2">
                <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full">
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[#1f1f1f]">{displayName}</span>
                    <span className="rounded bg-[#ffe7cf] px-1 text-[9px] leading-[14px] text-[#b5701f]">作者</span>
                    <span className="rounded bg-[#e6f0ff] px-1 text-[9px] leading-[14px] text-[#2f85ff]">AI 分身</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-[1.5] text-[#3f3f3f]">{c.reply}</p>
                  <div className="mt-1 text-[10px] text-[#b5b5b5]">由 AI 分身生成</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="relative z-10 flex shrink-0 items-center gap-2 border-t border-[#dcdcdc] bg-white px-3 py-2">
        <div className="flex-1 rounded-full bg-[#f1f1f1] px-3 py-1.5 text-[12px] text-[#9b9b9b]">
          留下你的精彩评论吧
        </div>
        <Smile size={18} strokeWidth={1.5} className="text-[#1f1f1f]" />
        <Plus size={18} strokeWidth={1.5} className="text-[#1f1f1f]" />
      </div>
    </div>
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

export default memo(AiPersonaChatPreview)
