import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { XIAHUA_BUILD_SCRIPT, type BuildStep } from './XiahuaBuildScript'
import type { BuildCard } from './XiahuaChatUI'
export type { BuildStep }
import {
  AssistantMessage,
  DocAttachment,
  ToolStatus,
  UserMessage,
} from './XiahuaChatUI'

/* ─── 0 → 1 生成流程的对话呈现 ───
 * 样式对齐 AI 平台（ai_design / ProjectDetailPage）的对话流：
 *   用户   右侧气泡（fill-0 / r12 / 14-22）+ 时间
 *   助手   「✓ 已完成工具调用 ›」状态行 → 正文段落(13-22) → 产物卡片 → 操作行 → 时间
 * 这里的状态行就是过程：跑的时候是脉冲点 + 标题，跑完变成绿勾，点开能看推理明细。
 * 状态推进与真实改动由 VibeCodingPage 驱动。 */

/** 卡点选项 —— 就跟在这条回复下面，是「建议这么回」，不是页面主操作，
 *  所以一律轻量：描边 + 弱色，不抢正文和产物卡片。 */
const OPTION_CLS =
  'flex h-7 cursor-pointer items-center gap-1 rounded-[8px] border border-[var(--divider)] bg-transparent px-2.5 text-[12px] text-[var(--color-ink)]/60 transition-colors hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85'

function Options({
  step,
  onConfirm,
  onAlt,
  onPick,
}: {
  step: BuildStep
  onConfirm: () => void
  onAlt: () => void
  onPick: (to: string, text?: string) => void
}) {
  const g = step.gate
  if (!g) return null
  // 带自由输入的（选主玩法那种）才用选择卡；其余就是跟在这条回复下面的建议回复
  if (g.choices?.some((c) => c.input)) return <ChoiceCard choices={g.choices} onPick={onPick} />
  if (g.choices?.length)
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        className="mt-2 flex flex-wrap gap-1.5"
      >
        {/* 多个选项可以指向同一步（选完再分流），to 不能当 key */}
        {g.choices.map((c, i) => (
          <button
            key={`${c.to}-${i}`}
            type="button"
            title={c.desc}
            onClick={() => onPick(c.to, c.title)}
            className={OPTION_CLS}
          >
            {c.title}
          </button>
        ))}
      </motion.div>
    )
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="mt-2 flex flex-wrap gap-1.5"
    >
      {/* 几个选项是并列的下一步，第一个不加勾图标 —— 加了像「确认」，
          但它并不比后面那个更「对」 */}
      <button type="button" onClick={onConfirm} className={OPTION_CLS}>
        {g.confirm}
      </button>
      {g.alt && (
        <button type="button" onClick={onAlt} className={OPTION_CLS}>
          {g.alt}
        </button>
      )}
    </motion.div>
  )
}

/** 选择卡：编号选项 + 最后一行直接是输入框。选中哪项 / 写了什么，
 *  那句话就作为一条用户消息发出去。 */
function ChoiceCard({
  choices,
  onPick,
}: {
  choices: NonNullable<BuildStep['gate']>['choices']
  onPick: (to: string, text?: string) => void
}) {
  const [draft, setDraft] = useState('')
  const list = choices ?? []
  const options = list.filter((c) => !c.input)
  const custom = list.find((c) => c.input)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="mt-2.5 max-w-[450px] overflow-hidden rounded-[12px] border border-[var(--divider)] bg-[var(--color-surface-0)]"
    >
      {options.map((c, i) => (
        <button
          key={`${c.to}-${i}`}
          type="button"
          onClick={() => onPick(c.to, c.title)}
          className={`flex w-full cursor-pointer items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#357ef8]/[0.05] ${
            i > 0 ? 'border-t border-[var(--divider-soft)]' : ''
          }`}
        >
          <span className="mt-[1px] flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-ink)]/[0.06] text-[10px] font-medium tabular-nums text-[var(--color-ink)]/55">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-[var(--color-ink)]">{c.title}</span>
              {c.tag && (
                <span className="rounded-[4px] bg-[var(--color-ink)]/[0.06] px-1 text-[10px] leading-[15px] text-[var(--color-ink)]/50">
                  {c.tag}
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-[11.5px] leading-[17px] text-[var(--color-ink)]/50">
              {c.desc}
            </span>
          </span>
        </button>
      ))}
      {custom && (
        // 最后一项不是「点开才有输入框」的选项，本身就是输入框：不想选上面那几个
        // 就直接在这儿写
        <div className="flex items-center gap-1.5 border-t border-[var(--divider-soft)] px-3 py-2.5">
          <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-ink)]/[0.06] text-[10px] font-medium tabular-nums text-[var(--color-ink)]/55">
            {options.length + 1}
          </span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) onPick(custom.to, draft.trim())
            }}
            placeholder={custom.placeholder ?? custom.desc}
            className="min-w-0 flex-1 rounded-[8px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] px-2.5 py-1.5 text-[12.5px] leading-[19px] text-[var(--color-ink)] outline-none focus:border-sky-400"
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => draft.trim() && onPick(custom.to, draft.trim())}
            className="h-[30px] shrink-0 cursor-pointer rounded-[8px] bg-[#357ef8] px-2.5 text-[12px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            发送
          </button>
        </div>
      )}
    </motion.div>
  )
}

/** 把脚本切成渲染块：连续同 group 的 think 合并成一条状态行。 */
type Block =
  | { type: 'think'; key: string; group: string; title: string; lines: string[]; last: number }
  | { type: 'step'; key: string; step: BuildStep; index: number }

function toBlocks(script: BuildStep[], path: number[]): Block[] {
  const out: Block[] = []
  path.forEach((stepIdx) => {
    const s = script[stepIdx]
    if (!s) return
    const i = stepIdx
    if (s.view.kind === 'think') {
      const prev = out[out.length - 1]
      if (prev?.type === 'think' && prev.group === s.view.group) {
        prev.lines.push(...s.view.lines)
        prev.last = i
        return
      }
      out.push({
        type: 'think',
        key: s.id,
        group: s.view.group,
        title: s.view.title,
        lines: [...s.view.lines],
        last: i,
      })
      return
    }
    out.push({ type: 'step', key: s.id, step: s, index: i })
  })
  return out
}

function FooterButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={OPTION_CLS}>
      {children}
    </button>
  )
}

export default function XiahuaBuildFlow({
  step,
  path,
  waiting,
  docName,
  docText,
  docMeta,
  script = XIAHUA_BUILD_SCRIPT,
  textOverrides,
  onGate,
  onOpenCard,
  onReplay,
  onExit,
}: {
  step: number
  /** 实际走过的步骤下标（有序）—— 卡点会跳步，不能按区间渲染 */
  path: number[]
  /** 停在卡点等确认 */
  waiting?: boolean
  /** 文档从首页上传时显示真实文件名；回放入口默认使用活动策划名。 */
  docName?: string
  /** 首页上传时用户附带的原话 —— 覆盖 doc 步的脚本文案。 */
  docText?: string
  docMeta?: string
  /** 走哪套脚本：默认 0→1 搭建；模板复刻传 TEMPLATE_CLONE_SCRIPT。 */
  script?: BuildStep[]
  /** 按 step id 覆盖用户消息文案（如首页 @模板 时用户的原话）。 */
  textOverrides?: Record<string, string>
  onGate?: (choice: 'confirm' | 'alt' | { to: string; text?: string }) => void
  /** 点对话里的产物卡片 —— 打开它对应的视图 */
  onOpenCard?: (card: BuildCard) => void
  onReplay?: () => void
  onExit?: () => void
}) {
  const blocks = toBlocks(script, path)
  const cur = script[step]
  const done = step >= script.length - 1
  return (
    <div>
      {blocks.map((b) => {
        if (b.type === 'think')
          return (
            <ToolStatus
              key={b.key}
              title={b.title}
              lines={b.lines}
              running={b.last === step && !waiting}
            />
          )
        const v = b.step.view
        const at = path.indexOf(b.index)
        if (v.kind === 'doc') {
          return (
            <DocAttachment
              key={b.key}
              index={at}
              text={docText ?? v.text}
              fileName={docName}
              meta={docMeta}
            />
          )
        }
        if (v.kind === 'user')
          return <UserMessage key={b.key} text={textOverrides?.[b.step.id] ?? v.text} index={at} />
        if (v.kind === 'ai') {
          // 卡点选项挂在提出它的那条回复下面，不另起一块
          const gateHere = waiting && onGate && b.index === step && b.step.gate
          return (
            <AssistantMessage
              key={b.key}
              text={v.text}
              cards={v.cards}
              image={v.image}
              onOpenCard={onOpenCard}
              index={at}
              footer={
                gateHere ? (
                  <Options
                    step={b.step}
                    onConfirm={() => onGate('confirm')}
                    onAlt={() => onGate('alt')}
                    onPick={(to, text) => onGate({ to, text })}
                  />
                ) : undefined
              }
            />
          )
        }
        return null
      })}
      {/* 卡点落在非 ai 步骤上时的兜底（脚本目前都挂在回复上） */}
      {waiting && cur?.gate && onGate && cur.view.kind !== 'ai' && (
        <Options
          step={cur}
          onConfirm={() => onGate('confirm')}
          onAlt={() => onGate('alt')}
          onPick={(to, text) => onGate({ to, text })}
        />
      )}
      {done && (onReplay || onExit) && (
        <div className="flex gap-1.5">
          {onReplay && <FooterButton onClick={onReplay}>再放一次</FooterButton>}
          {onExit && <FooterButton onClick={onExit}>查看完整改动记录</FooterButton>}
        </div>
      )}
    </div>
  )
}
