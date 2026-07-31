import { Image as ImageIcon, RefreshCw, Save, Sparkles, X } from '@/shared/icons'
import {
  DEFAULT_TAROT_INTEREST_CARD_CONFIG,
  type TarotInterestCardConfig,
} from './TarotInterestCardModel'
import type { TarotEditSelection } from './TarotInterestCardPreview'

interface TarotInterestCardEditPanelProps {
  value: TarotInterestCardConfig
  onChange: (value: TarotInterestCardConfig) => void
  onClose: () => void
  selection?: TarotEditSelection | null
}

export default function TarotInterestCardEditPanel({
  value,
  onChange,
  onClose,
  selection,
}: TarotInterestCardEditPanelProps) {
  const set = <Key extends keyof TarotInterestCardConfig>(
    key: Key,
    next: TarotInterestCardConfig[Key],
  ) => onChange({ ...value, [key]: next })

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
        <Sparkles size={14} strokeWidth={1.8} className="text-[#c58d58]" />
        <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">快速编辑</span>
        <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/40">
          {selection?.label ?? '整体兴趣卡'}
        </span>
        <button
          type="button"
          onClick={onClose}
          title="关闭"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
        <TarotTargetFields
          key={selection?.target ?? 'overall'}
          selection={selection}
          value={value}
          set={set}
        />
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">
          {selection ? `正在编辑「${selection.label}」` : '选择预览对象可查看对应字段'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_TAROT_INTEREST_CARD_CONFIG })}
            className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--divider)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)]"
          >
            <RefreshCw size={11} strokeWidth={1.8} />
            重置
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
          >
            <Save size={11} strokeWidth={2} />
            完成
          </button>
        </div>
      </div>
    </div>
  )
}

function TarotTargetFields({
  selection,
  value,
  set,
}: {
  selection?: TarotEditSelection | null
  value: TarotInterestCardConfig
  set: <Key extends keyof TarotInterestCardConfig>(
    key: Key,
    next: TarotInterestCardConfig[Key],
  ) => void
}) {
  const target = selection?.target

  if (target === 'heading') {
    return (
      <FieldSection title="标题与生成标记" icon={Sparkles}>
        <TextField
          label="星座名称"
          value={value.signName}
          onChange={(next) => set('signName', next)}
        />
        <TextField
          label="生成标记"
          value={value.aiLabel}
          onChange={(next) => set('aiLabel', next)}
        />
      </FieldSection>
    )
  }

  if (target === 'zodiac-copy') {
    return (
      <FieldSection title="星座文案" icon={Sparkles}>
        <TextField
          label="英文星座"
          value={value.signEnglish}
          onChange={(next) => set('signEnglish', next.toUpperCase())}
        />
        <TextField
          label="日期区间"
          value={value.dateRange}
          onChange={(next) => set('dateRange', next)}
        />
      </FieldSection>
    )
  }

  if (target === 'keyword') {
    return (
      <FieldSection title="今日关键词" icon={Sparkles}>
        <TextField
          label="关键词"
          value={value.keyword}
          maxLength={4}
          onChange={(next) => set('keyword', next)}
        />
        <p className="rounded-lg bg-[var(--fill-subtle)] px-3 py-2 text-[11px] leading-5 text-[var(--color-ink)]/50">
          建议使用 2–4 个汉字，预览会按单字竖排。
        </p>
      </FieldSection>
    )
  }

  if (target === 'card-image' || target === 'landing-card') {
    const landing = target === 'landing-card'
    const image = landing ? value.landingCardImage : value.cardImage
    return (
      <FieldSection title={landing ? '落地页牌面' : '星座牌面'} icon={ImageIcon}>
        <ImageField
          src={image}
          alt={landing ? '落地页牌面缩略图' : `${value.signName}卡面缩略图`}
        />
        <TextField
          label="素材地址"
          value={image}
          onChange={(next) =>
            landing ? set('landingCardImage', next) : set('cardImage', next)
          }
        />
        {!landing && (
          <TextField
            label="牌面名称"
            value={value.signEnglish}
            onChange={(next) => set('signEnglish', next.toUpperCase())}
          />
        )}
      </FieldSection>
    )
  }

  if (target === 'interpretation') {
    return (
      <FieldSection title="关键词解读" icon={Sparkles}>
        <TextareaField
          label="解读正文"
          value={value.interpretation}
          onChange={(next) => set('interpretation', next)}
        />
      </FieldSection>
    )
  }

  if (target === 'feed-actions') {
    return (
      <FieldSection title="操作按钮" icon={Sparkles}>
        <TextField
          label="次要按钮"
          value={value.dismissLabel}
          onChange={(next) => set('dismissLabel', next)}
        />
        <TextField
          label="主要按钮"
          value={value.ctaLabel}
          onChange={(next) => set('ctaLabel', next)}
        />
      </FieldSection>
    )
  }

  if (target === 'landing-title') {
    return (
      <FieldSection title="落地页标题" icon={Sparkles}>
        <TextField
          label="作者"
          value={value.landingAuthor}
          onChange={(next) => set('landingAuthor', next)}
        />
        <TextField
          label="标题"
          value={value.landingTitle}
          onChange={(next) => set('landingTitle', next)}
        />
      </FieldSection>
    )
  }

  if (target === 'landing-action') {
    return (
      <FieldSection title="解读按钮" icon={Sparkles}>
        <TextField
          label="按钮文案"
          value={value.landingButtonLabel}
          onChange={(next) => set('landingButtonLabel', next)}
        />
      </FieldSection>
    )
  }

  return (
    <div className="space-y-5">
      <FieldSection title={target === 'feed-card' ? '兴趣卡整体' : '卡片内容'} icon={Sparkles}>
        <TextField
          label="星座名称"
          value={value.signName}
          onChange={(next) => set('signName', next)}
        />
        <TextField
          label="英文星座"
          value={value.signEnglish}
          onChange={(next) => set('signEnglish', next.toUpperCase())}
        />
        <TextField
          label="日期区间"
          value={value.dateRange}
          onChange={(next) => set('dateRange', next)}
        />
        <TextField
          label="今日关键词"
          value={value.keyword}
          maxLength={4}
          onChange={(next) => set('keyword', next)}
        />
        <TextareaField
          label="关键词解读"
          value={value.interpretation}
          onChange={(next) => set('interpretation', next)}
        />
      </FieldSection>
      <FieldSection title="卡面素材" icon={ImageIcon}>
        <ImageField src={value.cardImage} alt={`${value.signName}卡面缩略图`} />
      </FieldSection>
    </div>
  )
}

function FieldSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Sparkles
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Icon size={12} strokeWidth={1.8} className="text-[var(--color-ink)]/55" />
        <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink)]/65">
          {title}
        </h3>
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  )
}

function ImageField({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--divider-soft)] p-2.5">
      <img src={src} alt={alt} className="h-20 w-14 rounded object-cover" />
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-[var(--color-ink)]/85">
          当前牌面
        </p>
        <p className="mt-1 text-[10.5px] text-[var(--color-ink)]/45">来自素材库</p>
      </div>
    </div>
  )
}

function TextareaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-[var(--color-ink)]/80">{label}</span>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
      />
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-[var(--color-ink)]/80">{label}</span>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
      />
    </label>
  )
}
