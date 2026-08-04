import { ChevronDown, X } from '@/shared/icons'
import type { TarotInterestCardConfig } from './TarotInterestCardModel'
import type {
  TarotEditSelection,
  TarotEditTarget,
} from './TarotInterestCardPreview'

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

  const target = selection?.target ?? 'feed-card'

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white text-[#161823]">
      <header className="flex h-12 shrink-0 items-center px-4">
        <h2 className="min-w-0 truncate text-balance text-[13px] font-semibold">
          组件 · {getComponentName(target, value)}
        </h2>
        <button
          type="button"
          onClick={onClose}
          title="关闭"
          aria-label="关闭兴趣卡配置"
          className="ml-auto flex size-7 items-center justify-center rounded-md text-[#878b99] hover:bg-[#f2f3f5] hover:text-[#161823]"
        >
          <X size={15} strokeWidth={1.8} aria-hidden />
        </button>
      </header>

      <div className="thin-scroll flex-1 overflow-y-auto px-4 pb-6 pt-1">
        <TarotTargetFields
          key={target}
          target={target}
          value={value}
          set={set}
        />
      </div>
    </div>
  )
}

function TarotTargetFields({
  target,
  value,
  set,
}: {
  target: TarotEditTarget
  value: TarotInterestCardConfig
  set: <Key extends keyof TarotInterestCardConfig>(
    key: Key,
    next: TarotInterestCardConfig[Key],
  ) => void
}) {
  if (target === 'heading') {
    return (
      <InspectorSection title="标题与生成标记">
        <TextRow
          label="星座名称"
          value={value.signName}
          onChange={(next) => set('signName', next)}
        />
        <TextRow
          label="生成标记"
          value={value.aiLabel}
          onChange={(next) => set('aiLabel', next)}
        />
      </InspectorSection>
    )
  }

  if (target === 'zodiac-copy') {
    return (
      <InspectorSection title="星座信息">
        <TextRow
          label="英文星座"
          value={value.signEnglish}
          onChange={(next) => set('signEnglish', next.toUpperCase())}
        />
        <TextRow
          label="日期区间"
          value={value.dateRange}
          onChange={(next) => set('dateRange', next)}
        />
      </InspectorSection>
    )
  }

  if (target === 'keyword') {
    return (
      <InspectorSection title="今日关键词">
        <TextRow
          label="关键词"
          value={value.keyword}
          maxLength={4}
          onChange={(next) => set('keyword', next)}
        />
      </InspectorSection>
    )
  }

  if (target === 'card-image' || target === 'landing-card') {
    const landing = target === 'landing-card'
    const image = landing ? value.landingCardImage : value.cardImage
    return (
      <InspectorSection title={landing ? '落地页牌面' : '牌面素材'}>
        <ImageAssetField
          label={landing ? '素材/TwoOfCups.PNG' : '素材/Start.PNG'}
          src={image}
          alt={landing ? '落地页牌面缩略图' : `${value.signName}牌面缩略图`}
          onChange={(next) =>
            landing ? set('landingCardImage', next) : set('cardImage', next)
          }
        />
        {!landing && (
          <TextRow
            label="牌面名称"
            value={value.signEnglish}
            onChange={(next) => set('signEnglish', next.toUpperCase())}
          />
        )}
      </InspectorSection>
    )
  }

  if (target === 'interpretation') {
    return (
      <InspectorSection title="关键词解读">
        <TextareaRow
          label="解读文案"
          value={value.interpretation}
          onChange={(next) => set('interpretation', next)}
        />
      </InspectorSection>
    )
  }

  if (target === 'feed-actions') {
    return (
      <InspectorSection title="操作按钮">
        <TextRow
          label="次要按钮"
          value={value.dismissLabel}
          onChange={(next) => set('dismissLabel', next)}
        />
        <TextRow
          label="主要按钮"
          value={value.ctaLabel}
          onChange={(next) => set('ctaLabel', next)}
        />
      </InspectorSection>
    )
  }

  if (target === 'landing-title') {
    return (
      <InspectorSection title="落地页标题">
        <TextRow
          label="作者"
          value={value.landingAuthor}
          onChange={(next) => set('landingAuthor', next)}
        />
        <TextRow
          label="标题"
          value={value.landingTitle}
          onChange={(next) => set('landingTitle', next)}
        />
      </InspectorSection>
    )
  }

  if (target === 'landing-action') {
    return (
      <InspectorSection title="解读按钮">
        <TextRow
          label="按钮文案"
          value={value.landingButtonLabel}
          onChange={(next) => set('landingButtonLabel', next)}
        />
      </InspectorSection>
    )
  }

  return (
    <div>
      <InspectorSection title="基础信息" first>
        <TextRow
          label="星座名称"
          value={value.signName}
          onChange={(next) => set('signName', next)}
        />
        <TextRow
          label="生成标记"
          value={value.aiLabel}
          onChange={(next) => set('aiLabel', next)}
        />
        <TextRow
          label="英文星座"
          value={value.signEnglish}
          onChange={(next) => set('signEnglish', next.toUpperCase())}
        />
        <TextRow
          label="日期区间"
          value={value.dateRange}
          onChange={(next) => set('dateRange', next)}
        />
        <TextRow
          label="今日关键词"
          value={value.keyword}
          maxLength={4}
          onChange={(next) => set('keyword', next)}
        />
      </InspectorSection>

      <InspectorSection title="牌面素材">
        <ImageAssetField
          label="素材/Start.PNG"
          src={value.cardImage}
          alt={`${value.signName}牌面缩略图`}
          onChange={(next) => set('cardImage', next)}
        />
      </InspectorSection>

      <InspectorSection title="内容文案">
        <TextareaRow
          label="关键词解读"
          value={value.interpretation}
          onChange={(next) => set('interpretation', next)}
        />
      </InspectorSection>

      <InspectorSection title="操作按钮">
        <TextRow
          label="次要按钮"
          value={value.dismissLabel}
          onChange={(next) => set('dismissLabel', next)}
        />
        <TextRow
          label="主要按钮"
          value={value.ctaLabel}
          onChange={(next) => set('ctaLabel', next)}
        />
      </InspectorSection>
    </div>
  )
}

function InspectorSection({
  title,
  first = false,
  children,
}: {
  title: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open
      className="group"
      style={{ marginTop: first ? 0 : 24 }}
    >
      <summary className="flex h-6 list-none items-center gap-1 text-[13px] font-medium text-[#34373d] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          size={13}
          strokeWidth={1.6}
          aria-hidden
          className="text-[#878b99] group-open:rotate-180"
        />
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  )
}

function InspectorRow({
  label,
  children,
  alignStart = false,
}: {
  label: string
  children: React.ReactNode
  alignStart?: boolean
}) {
  return (
    <div
      className="grid grid-cols-[76px_minmax(0,1fr)] gap-3"
      style={{ alignItems: alignStart ? 'start' : 'center' }}
    >
      <span className="pt-0.5 text-[12px] text-[#565a60]">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function TextRow({
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
    <InspectorRow label={label}>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-9 w-full rounded-lg border border-[#e4e6eb] bg-white px-3 text-[13px] text-[#34373d] outline-none placeholder:text-[#b7bac2] focus:border-[#8f939c]"
      />
    </InspectorRow>
  )
}

function TextareaRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <InspectorRow label={label} alignStart>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="thin-scroll w-full resize-none rounded-lg border border-[#e4e6eb] bg-white px-3 py-2 text-pretty text-[13px] leading-5 text-[#34373d] outline-none focus:border-[#8f939c]"
      />
    </InspectorRow>
  )
}

function ImageAssetField({
  label,
  src,
  alt,
  onChange,
}: {
  label: string
  src: string
  alt: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] font-medium text-[#34373d]">{label}</p>
      <img
        src={src}
        alt={alt}
        className="h-40 w-28 rounded-lg border border-[#e4e6eb] object-cover"
      />
      <TextRow label="素材地址" value={src} onChange={onChange} />
    </div>
  )
}

function getComponentName(
  target: TarotEditTarget,
  value: TarotInterestCardConfig,
) {
  switch (target) {
    case 'feed-card':
    case 'card-image':
      return `${value.signName}卡片`
    case 'heading':
      return '标题与生成标记'
    case 'zodiac-copy':
      return '星座信息'
    case 'keyword':
      return '今日关键词'
    case 'interpretation':
      return '关键词解读'
    case 'feed-actions':
      return '操作按钮'
    case 'landing-title':
      return '落地页标题'
    case 'landing-card':
      return '落地页牌面'
    case 'landing-action':
      return '解读按钮'
  }
}
