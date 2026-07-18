import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, ChevronDown, ChevronsRight, FolderCode, Plus } from '@/shared/icons'
import type { ChatMessage } from '@/shared/api/chat'
import Logo2Lottie from './Logo2Lottie'
import { LiveAiReply } from './LiveAiReply'
import { ChatEmptyState } from './ChatEmptyState'

/** 一个页面/Tab 对应的助手语境：切换 context 即切换建议与对话线程。 */
export interface AiAssistantContext {
  /** 唯一标识（对话线程、回复缓存都按它隔离）。 */
  key: string
  /** 页面名，展示在头部与系统提示词里。 */
  label: string
  /** 空态欢迎语（描述这个页面上 AI 能帮什么）。 */
  greeting: string
  /** 建议 chips，点击即发送。 */
  suggestions: string[]
  /** 注入系统提示词的页面背景（当前数据、用户在做什么）。 */
  systemHint: string
}

interface UserMsg {
  id: number
  text: string
}

const FALLBACK_REPLY = '这个问题我需要结合更多账号数据来分析，你可以先看看页面里的数据面板，或换个问法试试～'

/** 系统级 AI 助手面板 — 与 AI 工坊聊天栏同一套视觉件：
 *  ChatEmptyState 空态、同款消息气泡、同款 composer 卡片（圆角 24 白卡 +
 *  顶部彩虹光晕 + contentEditable 输入 + 扩展/附件/Figma/Auto/发送按钮）。
 *  面板通过 `.light-scope` 复用全局浅色变量（与创作者中心一致），不随
 *  暗色主题翻转。对话线程按 context.key 隔离，切换页面 Tab 会带出各自
 *  的建议和历史。 */
export default function AiAssistantPanel({
  context,
  className = '',
}: {
  context: AiAssistantContext
  className?: string
}) {
  const [open, setOpen] = useState(true)
  /** 面板宽度 — 左边缘可拖拽（300~560px）。 */
  const [panelWidth, setPanelWidth] = useState(340)
  /** 拖拽中 — 抑制展开/收起的宽度过渡，让拖拽即时跟手。 */
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: e.clientX, startWidth: panelWidth }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    // 面板在右侧，左边缘往左拖 = 加宽。
    const next = dragRef.current.startWidth + (dragRef.current.startX - e.clientX)
    setPanelWidth(Math.min(560, Math.max(300, next)))
  }
  const onDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    setDragging(false)
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }
  /** 每个 context 一条线程：只存用户消息，AI 回复由 LiveAiReply 流式生成并缓存。 */
  const [threads, setThreads] = useState<Record<string, UserMsg[]>>({})
  const [draft, setDraft] = useState('')
  const idRef = useRef(0)
  /** 已完成回复的缓存（state 持有的 Map：渲染期可读，onDone 里原地写入）。 */
  const [replyCache] = useState(() => new Map<string, string>())
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  const msgs = threads[context.key] ?? []

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }
  useEffect(scrollToBottom, [msgs.length, context.key])

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    idRef.current += 1
    const msg: UserMsg = { id: idRef.current, text }
    setThreads((t) => ({ ...t, [context.key]: [...(t[context.key] ?? []), msg] }))
    setDraft('')
    if (inputRef.current) inputRef.current.innerText = ''
  }

  /** 组装该条用户消息之前的完整上下文（系统提示 + 已完成的往返）。 */
  const historyFor = (index: number): ChatMessage[] => {
    const nowStr = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
    const history: ChatMessage[] = [
      {
        role: 'system',
        content: `你是「抖音创作者中心」页面右侧常驻的 AI 创作助手。当前日期：${nowStr}。用户正在浏览「${context.label}」页面。${context.systemHint} 请用简体中文回答，语气专业、简洁、可执行，优先给出具体建议或步骤，控制在 200 字以内；只有用户明确要求展开时才写长内容。`,
      },
    ]
    for (let k = 0; k <= index; k++) {
      history.push({ role: 'user', content: msgs[k].text })
      if (k < index) {
        const prev = replyCache.get(`${context.key}::${msgs[k].id}`)
        if (prev) history.push({ role: 'assistant', content: prev })
      }
    }
    return history
  }

  return (
    <>
    {/* 悬浮球 — 收起态。fixed 定位不占布局，独立淡入/缩放。 */}
    <AnimatePresence>
      {!open && (
        <motion.button
          key="ball"
          type="button"
          title="展开创作助手"
          aria-label="展开创作助手"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#5B9DFF] to-[#3370FF] text-white shadow-[0_8px_24px_-6px_rgba(51,112,255,0.6)]"
        >
          {/* Lottie 旋转圆圈 logo：hover 播放旋转、移开停止（组件内部处理）。 */}
          <Logo2Lottie white className="h-8 w-8" />
        </motion.button>
      )}
    </AnimatePresence>

    {/* 面板 — 展开态。宽度动画驱动展开/收起；内层固定宽度避免过程中
        内容被挤压。拖拽调宽时抑制过渡以即时跟手。 */}
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="panel"
          aria-label="创作助手"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: panelWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: dragging ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`light-scope relative flex shrink-0 flex-col overflow-hidden border-l border-[var(--divider-soft)] bg-[var(--color-surface-0)] ${className}`}
        >
          <div style={{ width: panelWidth }} className="relative flex h-full min-h-0 flex-col">
      {/* 左边缘拖拽手柄 — 调整面板宽度 */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="拖拽调整创作助手宽度"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        className="group absolute left-0 top-0 bottom-0 z-20 w-2 cursor-col-resize touch-none select-none"
      >
        <div className="absolute inset-y-0 left-0 w-px bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/25 group-active:bg-[#3370FF]" />
      </div>

      {/* ── 头部：名字 + 收起（收起变悬浮球） ── */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3">
        <span className="text-[13px] font-semibold text-[var(--color-ink)]">创作助手</span>
        <button
          type="button"
          title="收起创作助手"
          onClick={() => setOpen(false)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/40 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/80"
        >
          <ChevronsRight size={17} />
        </button>
      </div>

      {/* ── 消息区 — 与工坊聊天栏同款排版（px-5 / space-y-6 / 同款气泡） ── */}
      <div ref={scrollRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-6 space-y-6">
        {msgs.length === 0 ? (
          <ChatEmptyState
            key={context.key}
            forceLight
            title="嗨，我是你的创作助手"
            subtitle={context.greeting}
            suggestions={context.suggestions}
            onPick={send}
          />
        ) : (
          msgs.map((m, i) => {
            const replyKey = `${context.key}::${m.id}`
            return (
              <Fragment key={m.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] rounded-[8px] rounded-br-none bg-[var(--bubble-me-bg)] px-3 py-2.5 text-[14px] leading-[20px] text-[var(--color-ink)]">
                    {m.text}
                  </div>
                </motion.div>
                <LiveAiReply
                  key={replyKey}
                  messages={historyFor(i)}
                  cached={replyCache.get(replyKey)}
                  fallback={FALLBACK_REPLY}
                  onDone={(reply) => {
                    replyCache.set(replyKey, reply)
                    scrollToBottom()
                  }}
                />
              </Fragment>
            )
          })
        )}
      </div>

      {/* ── 对话中保留建议 chips（同工坊空态 chip 样式），随 Tab 切换 ── */}
      {msgs.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-1.5 px-5 pb-2">
          {context.suggestions.slice(0, 2).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="max-w-full truncate rounded-full bg-[var(--fill-subtle)] px-[13px] py-[7px] text-[11px] leading-[16.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Composer — 与工坊同款：圆角 24 白卡 + 顶部彩虹光晕 +
           contentEditable 输入 + 扩展/附件/Figma + Auto/发送。 ── */}
      <div className="mx-3 mb-3 flex-shrink-0">
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-[var(--color-surface-0)] p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_10px_15px_-5px_rgba(0,0,0,0.05)]">
          {/* Top rainbow-tint blur decoration */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-4 blur-[20px]"
            style={{
              backgroundImage:
                'linear-gradient(0deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%), linear-gradient(95deg, rgba(255,186,51,0.1) 7.59%, rgba(78,217,44,0.1) 23.2%, rgba(69,146,242,0.1) 44.7%, rgba(110,124,253,0.1) 66.3%, rgba(225,53,248,0.1) 92.3%)',
            }}
          />

          {/* Input area — default 32px tall, grows with content. */}
          <div className="relative flex min-h-[32px] items-center pl-2">
            <div
              ref={inputRef}
              contentEditable="plaintext-only"
              suppressContentEditableWarning
              role="textbox"
              aria-multiline
              data-placeholder="请输入，问我任何问题"
              onInput={(e) => setDraft((e.currentTarget as HTMLDivElement).innerText)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send((e.currentTarget as HTMLDivElement).innerText)
                }
              }}
              className="chat-editable thin-scroll block max-h-[160px] min-h-0 w-full overflow-y-auto bg-transparent text-[14px] leading-[20px] text-[var(--color-ink)] outline-none"
            />
          </div>

          {/* Action row */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="新建"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--divider)] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <Plus size={16} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                className="flex h-8 items-center gap-1 rounded-full border border-[var(--divider)] px-3 text-[13px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <FolderCode size={14} strokeWidth={1.8} />
                扩展
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                Auto
                <ChevronDown size={14} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="发送"
                disabled={!draft.trim()}
                onClick={() => send(inputRef.current?.innerText ?? draft)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-ink-contrast)] transition-all hover:-translate-y-[1px] hover:opacity-90 disabled:opacity-30 disabled:hover:translate-y-0"
              >
                <ArrowUp size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
    </>
  )
}
