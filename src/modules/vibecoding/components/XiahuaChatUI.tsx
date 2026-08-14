import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  LayoutGrid,
  ListChecks,
  Smartphone,
} from '@/shared/icons'

/* ─── 对话流基础件 ───
 * 样式对齐 AI 平台（ai_design / ProjectDetailPage）的对话流：
 *   用户   右侧气泡（fill / r12 / 14-22）+ 时间
 *   助手   「✓ 已完成xx ›」状态行 → 正文段落(13-22) → 产物卡片 → 操作行 → 时间
 * 回放（XiahuaBuildFlow）和静态记录（XiahuaGenerationLog）共用这一套。 */

export interface BuildCard {
  /** Optional stable target used by newer replays to open an asset or deliverable. */
  id?: string
  badge: string
  title: string
  desc: string
  type: 'doc' | 'wire' | 'play' | 'list' | 'asset' | 'app'
  /** Real source preview. Existing Xiahua cards omit it and keep their original icon. */
  preview?: string
}

const ICON = 'size-4 shrink-0'

/** 顺序推进的对话时间，纯派生，不用真实时钟。 */
function timeAt(i: number): string {
  const m = 14 * 60 + 32 + Math.round(i * 0.8)
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function Time({ i }: { i: number }) {
  return <span className="mt-1 block text-[12px] text-[var(--color-ink)]/35">{timeAt(i)}</span>
}

export function UserMessage({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="mb-[18px] flex flex-col items-end"
    >
      <div className="max-w-[520px] rounded-[12px] bg-[var(--bubble-me-bg)] px-3.5 py-2.5 text-[14px] leading-[22px] text-[var(--color-ink)]">
        {text}
      </div>
      <Time i={index} />
    </motion.div>
  )
}

/** 产物卡片按类型给图标 + 配色 —— 光靠 DOC / UI 这类字母看不出是什么东西。 */
const CARD_KIND: Record<
  BuildCard['type'],
  { tone: string; Icon: typeof FileText }
> = {
  doc: { tone: 'bg-sky-500/12 text-sky-600', Icon: FileText },
  wire: { tone: 'bg-violet-500/12 text-violet-600', Icon: LayoutGrid },
  play: { tone: 'bg-indigo-500/12 text-indigo-600', Icon: Gamepad2 },
  list: { tone: 'bg-teal-500/12 text-teal-600', Icon: ListChecks },
  asset: { tone: 'bg-emerald-500/12 text-emerald-600', Icon: ImageIcon },
  app: { tone: 'bg-amber-500/14 text-amber-600', Icon: Smartphone },
}

export function ArtifactCard({ card, onOpen }: { card: BuildCard; onOpen?: () => void }) {
  const { tone, Icon } = CARD_KIND[card.type]
  return (
    // 卡片点开就跳到它自己那个视图：方案→项目文档、清单/素材→素材库、框架/成品→预览
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onOpen()
        }
      }}
      className={`mt-2.5 flex max-w-[450px] items-center gap-3 rounded-[12px] border border-[var(--divider)] bg-[var(--color-surface-0)] px-3.5 py-2.5 ${
        onOpen ? 'cursor-pointer transition-colors hover:border-[#357ef8]/50 hover:bg-[#357ef8]/[0.03]' : ''
      }`}
    >
      {card.preview ? (
        <span className="h-[38px] w-[58px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-1)]">
          <img src={card.preview} alt="" className="size-full object-cover" />
        </span>
      ) : (
        <span className={`flex size-[38px] shrink-0 items-center justify-center rounded-[8px] ${tone}`}>
          <Icon className="size-[18px]" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[13px] font-medium text-[var(--color-ink)]">
            {card.title}
          </span>
          <span className="shrink-0 rounded-[4px] bg-[var(--color-ink)]/[0.06] px-1 text-[10px] font-medium leading-[15px] text-[var(--color-ink)]/50">
            {card.badge}
          </span>
        </span>
        <span className="truncate text-[12px] text-[var(--color-ink)]/45">{card.desc}</span>
      </span>
      <span className="shrink-0 text-[18px] leading-none text-[var(--color-ink)]/30">›</span>
    </div>
  )
}

export function AssistantMessage({
  text,
  cards,
  image,
  index,
  footer,
  onOpenCard,
}: {
  text: string
  cards?: BuildCard[]
  /** 点产物卡片：跳到它对应的那个视图 */
  onOpenCard?: (card: BuildCard) => void
  /** 随回复给出的图（风格参考这类）—— 就在对话里看，不占右侧产物位 */
  image?: { src: string; caption?: string }
  index: number
  /** 建议回复之类的轻量操作 —— 跟在这条消息的正文/卡片下面 */
  footer?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-3.5"
    >
      {text
        .split('\n')
        .filter(Boolean)
        .map((line) => (
          <p key={line} className="mb-1.5 text-[13px] leading-[22px] text-[var(--color-ink)]">
            {line}
          </p>
        ))}
      {image && (
        <figure className="mt-2.5 w-[220px] overflow-hidden rounded-[12px] border border-[var(--divider)] bg-[var(--color-surface-1)]">
          <img src={image.src} alt={image.caption ?? '参考图'} className="block w-full" />
          {image.caption && (
            <figcaption className="px-2.5 py-1.5 text-[11px] text-[var(--color-ink)]/45">
              {image.caption}
            </figcaption>
          )}
        </figure>
      )}
      {cards?.map((c) => (
        <ArtifactCard key={c.title} card={c} onOpen={onOpenCard ? () => onOpenCard(c) : undefined} />
      ))}
      {footer}
      <div className="mt-2 flex gap-2.5 text-[var(--color-ink)]/35">
        <button type="button" title="复制" className="cursor-pointer hover:text-[var(--color-ink)]/70">
          <Copy className={ICON} />
        </button>
        <button type="button" title="引用" className="cursor-pointer hover:text-[var(--color-ink)]/70">
          <ExternalLink className={ICON} />
        </button>
      </div>
      <Time i={index} />
    </motion.div>
  )
}

/** 过程状态行 —— 对齐平台的「✓ 已完成工具调用 ›」，展开是推理明细。 */
export function ToolStatus({
  title,
  lines,
  running,
}: {
  title: string
  lines: string[]
  running: boolean
}) {
  const [manual, setManual] = useState<boolean | null>(null)
  const open = manual ?? running
  return (
    <div className="mb-3.5">
      <button
        type="button"
        onClick={() => setManual(!open)}
        className="flex cursor-pointer items-center gap-1.5 text-left"
      >
        {running ? (
          <motion.span
            className="size-4 shrink-0 rounded-full border-[1.5px] border-[var(--color-ink)]/20 border-t-[var(--color-ink)]/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <CheckCircle2 className={`${ICON} text-emerald-500`} />
        )}
        <span className="text-[12px] text-[var(--color-ink)]/45">
          {running ? `${title}…` : `已${title}`}
        </span>
        <span
          className={`text-[18px] leading-none text-[var(--color-ink)]/30 transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        >
          ›
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-[7px] mt-2 space-y-1.5 border-l border-[var(--divider)] pl-3.5">
              {lines.map((l) => (
                <motion.p
                  key={l}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-[12.5px] leading-[20px] text-[var(--color-ink)]/45"
                >
                  {l}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 带附件的一条用户消息：附件 + 同一条里的说明文字，共用一个时间戳。 */
export function DocAttachment({
  index,
  text,
  fileName = '这夏夯爆了项目策划-内部沟通版.docx',
  meta = '12 个小节 · 4 张图',
}: {
  index: number
  text?: string
  fileName?: string
  meta?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mb-[18px] flex flex-col items-end gap-1.5"
    >
      <div className="flex w-[260px] items-center gap-2.5 rounded-[12px] bg-[var(--bubble-me-bg)] px-3 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]/55">
          <FileText className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">
            {fileName}
          </p>
          {meta && <p className="text-[11px] text-[var(--color-ink)]/45">{meta}</p>}
        </div>
      </div>
      {text && (
        <div className="max-w-[520px] rounded-[12px] bg-[var(--bubble-me-bg)] px-3.5 py-2.5 text-[14px] leading-[22px] text-[var(--color-ink)]">
          {text}
        </div>
      )}
      <Time i={index} />
    </motion.div>
  )
}
