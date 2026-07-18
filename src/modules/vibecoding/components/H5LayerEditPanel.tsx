import { useEffect, useRef, useState } from 'react'
import {
  X,
  Image as ImageIcon,
  RefreshCw,
  Type,
  Upload,
  Ruler,
  Play,
  Crop,
  Box,
  Move,
  ChevronDown,
  Clock,
  FileText,
  Gift,
  ListChecks,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from '@/shared/icons'

/**
 * H5 图层编辑面板 — 跟随左侧预览选中的对象刷新不同的编辑属性。两级选择：
 * 选中「楼层」给整楼层属性（头图那套 / 倒计时 / 介绍 …），选中楼层内的
 * 「元素」（主标题 / 正文 / 按钮 / 图片）给该元素的细粒度属性（文案·字号·
 * 颜色 / 按钮文案·底色 / 图片替换）。无选中 ⇒ 整体活动配置。纯本地演示。
 */

export type H5LayerId =
  | 'hero'
  | 'countdown'
  | 'intro'
  | 'lottery'
  | 'task'
  | 'rules'

/** 楼层内可单独选中的元素类型。 */
export type H5ElementKind = 'text' | 'button' | 'image'

/** 一个被选中的楼层内元素。`value` 携带当前文案 / 图片地址，便于编辑器预填。 */
export interface H5ElementSel {
  layer: H5LayerId
  /** 楼层内唯一 id，如 'intro.title'。 */
  id: string
  kind: H5ElementKind
  /** 展示名：主标题 / 正文 / 按钮 / 图片 … */
  label: string
  /** 当前内容：文本（text/button）或图片地址（image）。 */
  value?: string
}

/** 当前选择：楼层级 / 元素级；null ⇒ 整体活动配置。 */
export type H5Selection =
  | { type: 'layer'; layer: H5LayerId }
  | { type: 'element'; el: H5ElementSel }

const HERO_IMG = '/h5/children-day/hero-gifts.png'
const LOTTERY_IMG = '/h5/children-day/lottery-cube.png'

// Shared with the preview/editor shell; keeping this map beside its layer
// types avoids two sources of truth for the H5 editing model.
// eslint-disable-next-line react-refresh/only-export-components
export const H5_LAYER_META: Record<H5LayerId, { label: string; icon: LucideIcon }> = {
  hero: { label: '头图', icon: ImageIcon },
  countdown: { label: '倒计时', icon: Clock },
  intro: { label: '活动介绍', icon: FileText },
  lottery: { label: '幸运抽奖', icon: Gift },
  task: { label: '参与任务', icon: ListChecks },
  rules: { label: '活动规则', icon: ScrollText },
}

export default function H5LayerEditPanel({
  selection,
  onClose,
  floating = false,
  onHeaderPointerDown,
}: {
  /** 当前选择：楼层 / 元素；null ⇒ 整体活动配置。 */
  selection: H5Selection | null
  onClose: () => void
  /** 浮层模式：header 变成可拖拽手柄（带 grip 图标 + move 光标）。 */
  floating?: boolean
  onHeaderPointerDown?: (e: React.PointerEvent) => void
}) {
  const layerId =
    selection?.type === 'layer'
      ? selection.layer
      : selection?.type === 'element'
        ? selection.el.layer
        : null
  const layerMeta = layerId ? H5_LAYER_META[layerId] : null
  const el = selection?.type === 'element' ? selection.el : null

  // Breadcrumb: 楼层 / 元素 — falls back to 活动配置 when nothing is picked.
  const crumb = el
    ? `${layerMeta?.label ?? ''} / ${el.label}`
    : layerMeta
      ? layerMeta.label
      : '活动配置'

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Header — drag handle when floating */}
      <div
        onPointerDown={floating ? onHeaderPointerDown : undefined}
        className={`flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5 ${
          floating ? 'cursor-move touch-none select-none' : ''
        }`}
      >
        {floating && (
          <Move size={13} strokeWidth={1.8} className="-ml-1 shrink-0 text-[var(--color-ink)]/35" />
        )}
        <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">编辑</span>
        <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/40">{crumb}</span>
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          title="关闭"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <EditAiPrompt
        key={el?.id ?? layerId ?? 'overall'}
        selection={selection}
        layerLabel={layerMeta?.label}
        autoFocus={selection?.type === 'element'}
      />

      {/* Body — element editor when an element is picked; else per-layer; else overall */}
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
        {el ? (
          <ElementEditor key={el.id} el={el} />
        ) : layerId === null ? (
          <OverallEditor />
        ) : layerId === 'hero' ? (
          <HeroEditor />
        ) : layerId === 'countdown' ? (
          <CountdownEditor />
        ) : layerId === 'intro' ? (
          <IntroEditor />
        ) : layerId === 'lottery' ? (
          <LotteryEditor />
        ) : layerId === 'task' ? (
          <TaskEditor />
        ) : (
          <RulesEditor />
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">
          {el
            ? `编辑「${el.label}」元素`
            : layerMeta
              ? `编辑「${layerMeta.label}」图层`
              : '选中左侧元素可单独编辑'}
        </span>
        <div className="flex items-center gap-1.5">
          <button className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--divider)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)]">
            重置
          </button>
          <button className="flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90">
            应用
          </button>
        </div>
      </div>
    </div>
  )
}

function EditAiPrompt({
  selection,
  layerLabel,
  autoFocus = false,
}: {
  selection: H5Selection | null
  layerLabel?: string
  autoFocus?: boolean
}) {
  const [prompt, setPrompt] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const meta = getAiPromptMeta(selection, layerLabel)

  useEffect(() => {
    if (!autoFocus) return
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [autoFocus, meta.key])

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="shrink-0 border-b border-[var(--divider-soft)] px-3 py-2.5"
    >
      <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--divider)] bg-[var(--fill-subtle)] px-2.5 focus-within:border-[var(--color-ink)]/35 focus-within:bg-[var(--color-surface-0)]">
        <Sparkles size={14} strokeWidth={1.8} className="shrink-0 text-[var(--color-ink)]/55" />
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          aria-label={meta.ariaLabel}
          placeholder={meta.placeholder}
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-[var(--color-ink)] px-2 py-1 text-[11px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
        >
          生成
        </button>
      </div>
    </form>
  )
}

function getAiPromptMeta(selection: H5Selection | null, layerLabel?: string) {
  if (!selection) {
    return {
      key: 'overall',
      ariaLabel: 'AI 调整整体活动配置',
      placeholder: '发送信息给到 AI，调整整体活动配置...',
    }
  }
  if (selection.type === 'layer') {
    const label = layerLabel ?? '当前图层'
    return {
      key: selection.layer,
      ariaLabel: `AI 调整${label}图层`,
      placeholder: `发送信息给到 AI，调整「${label}」图层...`,
    }
  }

  const { el } = selection
  if (el.kind === 'image') {
    return {
      key: el.id,
      ariaLabel: `AI 修改${el.label}图片`,
      placeholder: `发送信息给到 AI，重绘或替换「${el.label}」...`,
    }
  }
  if (el.kind === 'button') {
    return {
      key: el.id,
      ariaLabel: `AI 修改${el.label}按钮`,
      placeholder: `发送信息给到 AI，调整「${el.label}」按钮...`,
    }
  }
  return {
    key: el.id,
    ariaLabel: `AI 修改${el.label}文案`,
    placeholder: `发送信息给到 AI，改写「${el.label}」文案...`,
  }
}

/* ─────────── 整体活动配置（默认，无选中元素时） ─────────── */
function OverallEditor() {
  const [theme, setTheme] = useState('rose')
  const [gradient, setGradient] = useState(60)
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle icon={ImageIcon}>活动信息</SectionTitle>
        <div className="mt-3 space-y-3.5">
          <Field label="活动名称">
            <input
              type="text"
              defaultValue="六一童趣抽奖"
              className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
            />
          </Field>
          <Field label="活动时间">
            <input
              type="text"
              defaultValue="2026-05-25 ~ 2026-06-01"
              className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={Gift}>主题配色</SectionTitle>
        <div className="mt-3 space-y-3.5">
          <Field label="主题色">
            <Swatches value={theme} onChange={setTheme} />
          </Field>
          <Slider label="渐变强度" value={gradient} min={0} max={100} onChange={setGradient} unit="%" />
        </div>
      </div>

      <div>
        <SectionTitle icon={ListChecks}>页面楼层</SectionTitle>
        <div className="mt-3 space-y-3">
          <ToggleRow label="倒计时" defaultOn />
          <ToggleRow label="活动介绍" defaultOn />
          <ToggleRow label="幸运抽奖" defaultOn />
          <ToggleRow label="参与任务" defaultOn />
          <ToggleRow label="活动规则" defaultOn />
        </div>
      </div>
    </div>
  )
}

/* ─────────── 头图 ─────────── */
function HeroEditor() {
  const [recordOpen, setRecordOpen] = useState(true)
  return (
    <div className="space-y-5">
      <SectionTitle icon={ImageIcon}>头图</SectionTitle>

      {/* quick actions */}
      <div className="grid grid-cols-3 gap-2">
        <ActionPill icon={RefreshCw} label="再次生成" />
        <ActionPill icon={Type} label="识图改字" />
        <ActionPill icon={Upload} label="上传头图" />
      </div>

      {/* feature cards */}
      <div className="space-y-2.5">
        <FeatureCard icon={Ruler} label="资源位扩展">
          <div className="flex items-center gap-1">
            <img src={HERO_IMG} className="h-9 w-9 rounded object-cover" />
            <span className="text-[var(--color-ink)]/30">→</span>
            <img src={HERO_IMG} className="h-9 w-14 rounded object-cover" />
          </div>
        </FeatureCard>
        <FeatureCard icon={Play} label="动态头图">
          <div className="relative">
            <img src={HERO_IMG} className="h-9 w-16 rounded object-cover" />
            <span className="absolute left-1 top-1 rounded bg-black/55 px-1 text-[8px] font-medium text-white">
              MP4
            </span>
          </div>
        </FeatureCard>
        <FeatureCard icon={Crop} label="画布编辑">
          <img src={HERO_IMG} className="h-9 w-16 rounded object-cover ring-1 ring-[#7c5cff]/60" />
        </FeatureCard>
      </div>

      {/* history */}
      <div>
        <button
          type="button"
          onClick={() => setRecordOpen((v) => !v)}
          className="flex w-full items-center text-[12.5px] font-semibold text-[var(--color-ink)]/70"
        >
          头图记录
          <ChevronDown
            size={14}
            className={`ml-auto transition-transform ${recordOpen ? '' : '-rotate-90'}`}
          />
        </button>
        {recordOpen && (
          <div className="mt-3 flex gap-2.5">
            {[HERO_IMG, LOTTERY_IMG, HERO_IMG].map((src, i) => (
              <div
                key={i}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ${
                  i === 2 ? 'ring-2 ring-[#7c5cff]' : 'ring-1 ring-[var(--divider)]'
                }`}
              >
                <img src={src} className="h-full w-full object-cover" />
                <span className="absolute left-1 top-1 rounded bg-black/50 px-1 text-[8px] font-bold text-white">
                  H5
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────── 倒计时 ─────────── */
function CountdownEditor() {
  const [color, setColor] = useState('mint')
  return (
    <div className="space-y-5">
      <SectionTitle icon={Clock}>倒计时</SectionTitle>
      <Field label="结束时间">
        <input
          type="text"
          defaultValue="2026-06-01 23:59"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Field label="数字底色">
        <Swatches value={color} onChange={setColor} />
      </Field>
      <ToggleRow label="显示「天」单位" defaultOn />
    </div>
  )
}

/* ─────────── 活动介绍 ─────────── */
function IntroEditor() {
  return (
    <div className="space-y-5">
      <SectionTitle icon={FileText}>活动介绍</SectionTitle>
      <Field label="标题">
        <input
          type="text"
          defaultValue="六一童趣节，好礼送不停"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Field label="正文">
        <textarea
          rows={5}
          defaultValue={'童年是最美好的时光，陪伴是最珍贵的礼物。\n这个六一儿童节，抖音为你准备了超多惊喜好礼！'}
          className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
    </div>
  )
}

/* ─────────── 幸运抽奖 ─────────── */
function LotteryEditor() {
  const [prizes, setPrizes] = useState(4)
  return (
    <div className="space-y-5">
      <SectionTitle icon={Gift}>幸运抽奖</SectionTitle>
      <Field label="按钮文案">
        <input
          type="text"
          defaultValue="立即抽奖"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Slider label="奖品档位" value={prizes} min={1} max={8} onChange={setPrizes} />
      <ToggleRow label="中奖名单滚动" defaultOn />
      <ToggleRow label="显示剩余次数" defaultOn />
    </div>
  )
}

/* ─────────── 参与任务 ─────────── */
function TaskEditor() {
  const [coins, setCoins] = useState(1000)
  return (
    <div className="space-y-5">
      <SectionTitle icon={ListChecks}>参与任务</SectionTitle>
      <Field label="任务名称">
        <input
          type="text"
          defaultValue="这是一个任务名称"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Slider label="金币奖励" value={coins} min={100} max={5000} step={100} onChange={setCoins} unit="" />
      <ToggleRow label="完成自动发放" defaultOn />
    </div>
  )
}

/* ─────────── 活动规则 ─────────── */
function RulesEditor() {
  return (
    <div className="space-y-5">
      <SectionTitle icon={ScrollText}>活动规则</SectionTitle>
      <ToggleRow label="默认折叠规则" />
      <ToggleRow label="展示客服联系" defaultOn />
      <Field label="规则说明">
        <textarea
          rows={4}
          defaultValue={'每人每日抽奖次数有限，请合理参与。\n本活动最终解释权归抖音所有。'}
          className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
    </div>
  )
}

/* ═════════════ 元素级编辑（楼层内单个元素） ═════════════ */
function ElementEditor({ el }: { el: H5ElementSel }) {
  if (el.kind === 'button') return <ButtonElementEditor el={el} />
  if (el.kind === 'image') return <ImageElementEditor el={el} />
  return <TextElementEditor el={el} />
}

/* ─────────── 文本元素（主标题 / 正文 / 名单 …） ─────────── */
function TextElementEditor({ el }: { el: H5ElementSel }) {
  const [text, setText] = useState(el.value ?? '')
  const [size, setSize] = useState(20)
  const [color, setColor] = useState('rose')
  const [align, setAlign] = useState('center')
  // 正文之类的长文本用多行输入。
  const multiline = el.id.endsWith('body') || (el.value ?? '').length > 16
  return (
    <div className="space-y-5">
      <SectionTitle icon={Type}>{el.label}</SectionTitle>
      <Field label="文案">
        {multiline ? (
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
          />
        ) : (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
          />
        )}
      </Field>
      <Slider label="字号" value={size} min={12} max={36} onChange={setSize} unit="px" />
      <Field label="文字颜色">
        <Swatches value={color} onChange={setColor} />
      </Field>
      <Field label="对齐">
        <Chips
          value={align}
          onChange={setAlign}
          options={[
            { id: 'left', label: '左对齐' },
            { id: 'center', label: '居中' },
            { id: 'right', label: '右对齐' },
          ]}
        />
      </Field>
      <ToggleRow label="加粗" defaultOn />
    </div>
  )
}

/* ─────────── 按钮元素（立即抽奖 / 我的奖品 / 任务 CTA …） ─────────── */
function ButtonElementEditor({ el }: { el: H5ElementSel }) {
  const [label, setLabel] = useState(el.value ?? '')
  const [bg, setBg] = useState('rose')
  const [textColor, setTextColor] = useState('slate')
  const [radius, setRadius] = useState(24)
  return (
    <div className="space-y-5">
      <SectionTitle icon={Box}>{el.label}</SectionTitle>
      <Field label="按钮文案">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Field label="底色">
        <Swatches value={bg} onChange={setBg} />
      </Field>
      <Field label="文字颜色">
        <Swatches value={textColor} onChange={setTextColor} />
      </Field>
      <Slider label="圆角" value={radius} min={0} max={28} onChange={setRadius} unit="px" />
      <ToggleRow label="点击埋点" defaultOn />
    </div>
  )
}

/* ─────────── 图片元素（头图 / 抽奖机 …） ─────────── */
function ImageElementEditor({ el }: { el: H5ElementSel }) {
  const [fit, setFit] = useState('cover')
  return (
    <div className="space-y-5">
      <SectionTitle icon={ImageIcon}>{el.label}</SectionTitle>
      {el.value && (
        <div className="overflow-hidden rounded-xl ring-1 ring-[var(--divider)]">
          <img src={el.value} alt="" className="max-h-40 w-full object-cover" />
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <ActionPill icon={Upload} label="上传图片" />
        <ActionPill icon={RefreshCw} label="再次生成" />
        <ActionPill icon={Crop} label="画布编辑" />
      </div>
      <Field label="适配方式">
        <Chips
          value={fit}
          onChange={setFit}
          options={[
            { id: 'cover', label: '填充' },
            { id: 'contain', label: '包含' },
            { id: 'fill', label: '拉伸' },
          ]}
        />
      </Field>
    </div>
  )
}

/* ─────────── shared atoms ─────────── */
function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink)]">
      <Icon size={15} strokeWidth={1.8} className="text-[var(--color-ink)]/65" />
      {children}
    </div>
  )
}

function ActionPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] text-[12px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </button>
  )
}

function FeatureCard({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-2.5 text-left transition-colors hover:border-[var(--color-ink)]/20 hover:bg-[var(--fill-hover)]"
    >
      <Icon size={15} strokeWidth={1.7} className="shrink-0 text-[var(--color-ink)]/60" />
      <span className="flex-1 text-[13px] font-medium text-[var(--color-ink)]/85">{label}</span>
      <div className="shrink-0 overflow-hidden rounded-md bg-[var(--fill-subtle)]">{children}</div>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] text-[var(--color-ink)]/65">{label}</div>
      {children}
    </div>
  )
}

function Chips({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const on = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${
              on
                ? 'border-[var(--color-ink)]/30 bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]'
                : 'border-[var(--divider-soft)] text-[var(--color-ink)]/55 hover:border-[var(--color-ink)]/15'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

const SWATCHES = [
  { id: 'mint', color: '#65cfc8' },
  { id: 'rose', color: '#ff7186' },
  { id: 'amber', color: '#f7b85c' },
  { id: 'violet', color: '#7c5cff' },
  { id: 'slate', color: '#475569' },
]
function Swatches({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {SWATCHES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`h-7 w-7 rounded-full border-2 transition-transform ${
            value === s.id ? 'scale-110 border-[var(--color-ink)]/40' : 'border-transparent hover:scale-105'
          }`}
          style={{ backgroundColor: s.color }}
        />
      ))}
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] text-[var(--color-ink)]/80">{label}</span>
        <span className="font-mono text-[11px] text-[var(--color-ink)]/55">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--fill-subtle)] accent-[var(--color-ink)]"
      />
    </div>
  )
}

function ToggleRow({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button type="button" onClick={() => setOn((v) => !v)} className="flex w-full items-center gap-3 text-left">
      <span className="min-w-0 flex-1 text-[12px] text-[var(--color-ink)]/85">{label}</span>
      <span
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
          on ? 'bg-[#3478ff]' : 'bg-[var(--color-ink)]/20'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
            on ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
