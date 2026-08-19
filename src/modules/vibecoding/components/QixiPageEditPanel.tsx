import type { ReactNode } from 'react'
import {
  Image as ImageIcon,
  LayoutGrid,
  ListChecks,
  Type,
  X,
} from '@/shared/icons'
import type {
  QixiPageContent,
  QixiPageElementId,
  QixiPageSection,
  QixiPageSelection,
} from './QixiPageModel'

const SECTION_META: Record<
  QixiPageSection,
  { label: string; hint: string; icon: typeof Type }
> = {
  hero: { label: '头图与标题', hint: '活动日期、主标题与入口按钮', icon: ImageIcon },
  bridge: { label: '鹊桥进度', hint: '进度、主操作与抽奖入口', icon: LayoutGrid },
  tasks: { label: '任务模块', hint: '签到与好友助力任务', icon: ListChecks },
  feed: { label: '助力动态', hint: '助力结果与空状态', icon: ListChecks },
}

const ELEMENT_META: Record<
  QixiPageElementId,
  { label: string; kind: '文字' | '按钮' | '组件' | '状态'; icon: typeof Type }
> = {
  'hero.share': { label: '分享按钮', kind: '按钮', icon: LayoutGrid },
  'hero.rules': { label: '规则按钮', kind: '按钮', icon: LayoutGrid },
  'hero.eyebrow': { label: '活动日期', kind: '文字', icon: Type },
  'hero.title': { label: '活动主标题', kind: '文字', icon: Type },
  'hero.meta': { label: '活动说明', kind: '文字', icon: Type },
  'bridge.header': { label: '进度标题', kind: '文字', icon: Type },
  'bridge.details': { label: '活动明细按钮', kind: '按钮', icon: LayoutGrid },
  'bridge.progress': { label: '鹊桥进度组件', kind: '状态', icon: LayoutGrid },
  'bridge.primary': { label: '找喜鹊按钮', kind: '按钮', icon: LayoutGrid },
  'bridge.lottery': { label: '立即抽奖按钮', kind: '按钮', icon: LayoutGrid },
  'tasks.header': { label: '任务标题', kind: '文字', icon: Type },
  'tasks.signin': { label: '每日签到任务', kind: '组件', icon: ListChecks },
  'tasks.signin.action': { label: '签到按钮', kind: '按钮', icon: LayoutGrid },
  'tasks.assist': { label: '好友助力任务', kind: '组件', icon: ListChecks },
  'tasks.assist.action': { label: '邀请按钮', kind: '按钮', icon: LayoutGrid },
  'feed.header': { label: '助力动态标题', kind: '文字', icon: Type },
  'feed.content': { label: '助力动态内容', kind: '组件', icon: ListChecks },
  'feed.action': { label: '空状态邀请按钮', kind: '按钮', icon: LayoutGrid },
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-medium text-[var(--color-ink)]/55">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 text-[12px] text-[var(--color-ink)] outline-none transition-colors focus:border-[#357ef8] focus:ring-2 focus:ring-[#357ef8]/15"
      />
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const pickerValue = /^#[0-9a-f]{6}$/i.test(value) ? value : '#202126'
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-medium text-[var(--color-ink)]/55">{label}</span>
      <span className="flex h-8 items-center gap-2 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-2 focus-within:border-[#357ef8] focus-within:ring-2 focus-within:ring-[#357ef8]/15">
        <input
          type="color"
          value={pickerValue}
          aria-label={`${label}取色器`}
          onChange={(event) => onChange(event.target.value)}
          className="size-5 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[11px] uppercase text-[var(--color-ink)] outline-none"
        />
      </span>
    </label>
  )
}

function RadiusField({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-medium text-[var(--color-ink)]/55">圆角</span>
      <span className="flex h-8 items-center rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 focus-within:border-[#357ef8] focus-within:ring-2 focus-within:ring-[#357ef8]/15">
        <input
          type="number"
          min={0}
          max={999}
          value={value}
          onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
          className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--color-ink)] outline-none"
        />
        <span className="text-[10px] text-[var(--color-ink)]/35">px</span>
      </span>
    </label>
  )
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-b border-[var(--divider-soft)] pb-4 last:border-b-0 last:pb-0">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink)]/38">
        {title}
      </h3>
      {children}
    </section>
  )
}

function DataBoundNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] px-3 py-2.5 text-[11px] leading-5 text-[var(--color-ink)]/52">
      {children}
    </div>
  )
}

export default function QixiPageEditPanel({
  value,
  selection,
  onChange,
  onSelect,
  onClose,
}: {
  value: QixiPageContent
  selection: QixiPageSelection | null
  onChange: (value: QixiPageContent) => void
  onSelect: (selection: QixiPageSelection | null) => void
  onClose: () => void
}) {
  const update = (patch: Partial<QixiPageContent>) => onChange({ ...value, ...patch })
  const sectionMeta = selection ? SECTION_META[selection.section] : null
  const elementMeta = selection?.type === 'element' ? ELEMENT_META[selection.element] : null
  const Icon = elementMeta?.icon ?? sectionMeta?.icon ?? LayoutGrid
  const crumb = elementMeta
    ? `${sectionMeta?.label ?? '活动首页'} / ${elementMeta.label}`
    : sectionMeta?.label ?? '活动首页'
  const hint = elementMeta ? `${elementMeta.kind} · 只编辑当前对象` : sectionMeta?.hint ?? '选择一个组件开始编辑'

  const buttonAppearance = (
    background: string,
    color: string,
    radius: number,
    onBackground: (next: string) => void,
    onColor: (next: string) => void,
    onRadius: (next: number) => void,
  ) => (
    <FieldGroup title="外观">
      <div className="grid grid-cols-2 gap-2">
        <ColorField label="填充" value={background} onChange={onBackground} />
        <ColorField label="文字" value={color} onChange={onColor} />
      </div>
      <RadiusField value={radius} onChange={onRadius} />
    </FieldGroup>
  )

  const signInAppearance = buttonAppearance(
    value.signInButtonBackground,
    value.signInButtonColor,
    value.signInButtonRadius,
    (signInButtonBackground) => update({ signInButtonBackground }),
    (signInButtonColor) => update({ signInButtonColor }),
    (signInButtonRadius) => update({ signInButtonRadius }),
  )
  const assistAppearance = buttonAppearance(
    value.assistButtonBackground,
    value.assistButtonColor,
    value.assistButtonRadius,
    (assistButtonBackground) => update({ assistButtonBackground }),
    (assistButtonColor) => update({ assistButtonColor }),
    (assistButtonRadius) => update({ assistButtonRadius }),
  )

  const renderSectionFields = (section: QixiPageSection) => {
    if (section === 'hero') {
      return (
        <FieldGroup title="区块内容">
          <Field label="活动日期" value={value.eyebrow} onChange={(eyebrow) => update({ eyebrow })} />
          <Field label="主标题·第一行" value={value.titleLine1} onChange={(titleLine1) => update({ titleLine1 })} />
          <Field label="主标题·第二行" value={value.titleLine2} onChange={(titleLine2) => update({ titleLine2 })} />
          <Field label="活动说明" value={value.heroMeta} onChange={(heroMeta) => update({ heroMeta })} />
          <Field label="分享按钮" value={value.shareLabel} onChange={(shareLabel) => update({ shareLabel })} />
          <Field label="规则按钮" value={value.rulesLabel} onChange={(rulesLabel) => update({ rulesLabel })} />
        </FieldGroup>
      )
    }
    if (section === 'bridge') {
      return (
        <>
          <FieldGroup title="区块内容">
            <Field label="进度标题" value={value.bridgeTitle} onChange={(bridgeTitle) => update({ bridgeTitle })} />
            <Field label="明细入口" value={value.detailsLabel} onChange={(detailsLabel) => update({ detailsLabel })} />
            <Field label="主按钮" value={value.primaryLabel} onChange={(primaryLabel) => update({ primaryLabel })} />
            <Field label="抽奖入口" value={value.lotteryLabel} onChange={(lotteryLabel) => update({ lotteryLabel })} />
          </FieldGroup>
          <DataBoundNotice>关卡进度、可用次数和奖励节点由玩法状态驱动，不作为静态文案编辑。</DataBoundNotice>
        </>
      )
    }
    if (section === 'tasks') {
      return (
        <FieldGroup title="区块内容">
          <Field label="模块标题" value={value.taskTitle} onChange={(taskTitle) => update({ taskTitle })} />
          <Field label="签到标题" value={value.signInTitle} onChange={(signInTitle) => update({ signInTitle })} />
          <Field label="签到说明" value={value.signInDescription} onChange={(signInDescription) => update({ signInDescription })} />
          <Field label="签到按钮" value={value.signInAction} onChange={(signInAction) => update({ signInAction })} />
          <Field label="助力标题" value={value.assistTitle} onChange={(assistTitle) => update({ assistTitle })} />
          <Field label="助力说明" value={value.assistDescription} onChange={(assistDescription) => update({ assistDescription })} />
          <Field label="助力按钮" value={value.assistAction} onChange={(assistAction) => update({ assistAction })} />
        </FieldGroup>
      )
    }
    return (
      <FieldGroup title="区块内容">
        <Field label="模块标题" value={value.feedTitle} onChange={(feedTitle) => update({ feedTitle })} />
        <Field label="空状态标题" value={value.feedEmptyTitle} onChange={(feedEmptyTitle) => update({ feedEmptyTitle })} />
        <Field label="空状态说明" value={value.feedEmptyDescription} onChange={(feedEmptyDescription) => update({ feedEmptyDescription })} />
        <Field label="邀请按钮" value={value.feedAction} onChange={(feedAction) => update({ feedAction })} />
      </FieldGroup>
    )
  }

  const renderElementFields = (element: QixiPageElementId) => {
    if (element === 'hero.share')
      return <Field label="按钮文案" value={value.shareLabel} onChange={(shareLabel) => update({ shareLabel })} />
    if (element === 'hero.rules')
      return <Field label="按钮文案" value={value.rulesLabel} onChange={(rulesLabel) => update({ rulesLabel })} />
    if (element === 'hero.eyebrow')
      return <Field label="活动日期" value={value.eyebrow} onChange={(eyebrow) => update({ eyebrow })} />
    if (element === 'hero.title')
      return (
        <FieldGroup title="文字">
          <Field label="第一行" value={value.titleLine1} onChange={(titleLine1) => update({ titleLine1 })} />
          <Field label="第二行" value={value.titleLine2} onChange={(titleLine2) => update({ titleLine2 })} />
        </FieldGroup>
      )
    if (element === 'hero.meta')
      return <Field label="活动说明" value={value.heroMeta} onChange={(heroMeta) => update({ heroMeta })} />
    if (element === 'bridge.header')
      return <Field label="进度标题" value={value.bridgeTitle} onChange={(bridgeTitle) => update({ bridgeTitle })} />
    if (element === 'bridge.details')
      return <Field label="按钮文案" value={value.detailsLabel} onChange={(detailsLabel) => update({ detailsLabel })} />
    if (element === 'bridge.progress')
      return <DataBoundNotice>这是玩法状态组件：7 个关卡节点、已完成数和第 3/7 关奖励由玩法配置生成，不能在页面文案里单独改写。</DataBoundNotice>
    if (element === 'bridge.primary')
      return (
        <>
          <Field label="按钮文案" value={value.primaryLabel} onChange={(primaryLabel) => update({ primaryLabel })} />
          {buttonAppearance(
            value.primaryButtonBackground,
            value.primaryButtonColor,
            value.primaryButtonRadius,
            (primaryButtonBackground) => update({ primaryButtonBackground }),
            (primaryButtonColor) => update({ primaryButtonColor }),
            (primaryButtonRadius) => update({ primaryButtonRadius }),
          )}
        </>
      )
    if (element === 'bridge.lottery')
      return (
        <>
          <Field label="按钮文案" value={value.lotteryLabel} onChange={(lotteryLabel) => update({ lotteryLabel })} />
          {buttonAppearance(
            value.lotteryButtonBackground,
            value.lotteryButtonColor,
            value.lotteryButtonRadius,
            (lotteryButtonBackground) => update({ lotteryButtonBackground }),
            (lotteryButtonColor) => update({ lotteryButtonColor }),
            (lotteryButtonRadius) => update({ lotteryButtonRadius }),
          )}
        </>
      )
    if (element === 'tasks.header')
      return <Field label="模块标题" value={value.taskTitle} onChange={(taskTitle) => update({ taskTitle })} />
    if (element === 'tasks.signin')
      return (
        <>
          <FieldGroup title="任务内容">
            <Field label="标题" value={value.signInTitle} onChange={(signInTitle) => update({ signInTitle })} />
            <Field label="说明" value={value.signInDescription} onChange={(signInDescription) => update({ signInDescription })} />
            <Field label="按钮" value={value.signInAction} onChange={(signInAction) => update({ signInAction })} />
          </FieldGroup>
          {signInAppearance}
        </>
      )
    if (element === 'tasks.signin.action')
      return (
        <>
          <Field label="按钮文案" value={value.signInAction} onChange={(signInAction) => update({ signInAction })} />
          {signInAppearance}
        </>
      )
    if (element === 'tasks.assist')
      return (
        <>
          <FieldGroup title="任务内容">
            <Field label="标题" value={value.assistTitle} onChange={(assistTitle) => update({ assistTitle })} />
            <Field label="说明" value={value.assistDescription} onChange={(assistDescription) => update({ assistDescription })} />
            <Field label="按钮" value={value.assistAction} onChange={(assistAction) => update({ assistAction })} />
          </FieldGroup>
          {assistAppearance}
        </>
      )
    if (element === 'tasks.assist.action')
      return (
        <>
          <Field label="按钮文案" value={value.assistAction} onChange={(assistAction) => update({ assistAction })} />
          {assistAppearance}
        </>
      )
    if (element === 'feed.header')
      return <Field label="模块标题" value={value.feedTitle} onChange={(feedTitle) => update({ feedTitle })} />
    if (element === 'feed.content')
      return (
        <FieldGroup title="空状态内容">
          <Field label="标题" value={value.feedEmptyTitle} onChange={(feedEmptyTitle) => update({ feedEmptyTitle })} />
          <Field label="说明" value={value.feedEmptyDescription} onChange={(feedEmptyDescription) => update({ feedEmptyDescription })} />
        </FieldGroup>
      )
    return (
      <>
        <Field label="按钮文案" value={value.feedAction} onChange={(feedAction) => update({ feedAction })} />
        {buttonAppearance(
          value.feedButtonBackground,
          value.feedButtonColor,
          value.feedButtonRadius,
          (feedButtonBackground) => update({ feedButtonBackground }),
          (feedButtonColor) => update({ feedButtonColor }),
          (feedButtonRadius) => update({ feedButtonRadius }),
        )}
      </>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3">
        <Icon className="size-3.5 shrink-0 text-[var(--color-ink)]/45" />
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-[12px] font-semibold text-[var(--color-ink)]">{crumb}</strong>
          <span className="block truncate text-[10px] text-[var(--color-ink)]/40">{hint}</span>
        </div>
        {elementMeta && (
          <span className="rounded bg-[#357ef8]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#357ef8]">
            {elementMeta.kind}
          </span>
        )}
        <button
          type="button"
          aria-label="关闭编辑栏"
          onClick={onClose}
          className="grid size-7 place-items-center rounded-md text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <X className="size-3.5" />
        </button>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {!selection ? (
          <div className="grid gap-3">
            <div className="rounded-lg bg-[#eef5ff] px-3 py-2.5 text-[11px] leading-5 text-[#235fb8]">
              单击手机画布里的标题、按钮、任务卡或状态组件。蓝色选框表示当前只编辑这一项。
            </div>
            <div className="grid gap-1.5" role="list" aria-label="页面模块">
              {(Object.keys(SECTION_META) as QixiPageSection[]).map((section) => {
                const meta = SECTION_META[section]
                const SectionIcon = meta.icon
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => onSelect({ type: 'section', section })}
                    className="flex items-center gap-2 rounded-lg border border-[var(--divider-soft)] px-3 py-2 text-left transition-colors hover:border-[#357ef8]/35 hover:bg-[#357ef8]/[0.04]"
                  >
                    <SectionIcon className="size-3.5 shrink-0 text-[var(--color-ink)]/40" />
                    <span className="min-w-0 flex-1">
                      <strong className="block text-[11.5px] font-medium text-[var(--color-ink)]">{meta.label}</strong>
                      <span className="block truncate text-[10px] text-[var(--color-ink)]/40">{meta.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {selection.type === 'element'
              ? renderElementFields(selection.element)
              : renderSectionFields(selection.section)}
          </div>
        )}
      </div>
    </div>
  )
}
