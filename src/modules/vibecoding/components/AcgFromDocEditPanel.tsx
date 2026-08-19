import type { ReactNode } from 'react'
import {
  Gift,
  Image as ImageIcon,
  LayoutGrid,
  ListChecks,
  Type,
  WandSparkles,
  X,
} from '@/shared/icons'
import {
  type AcgFromDocElement,
  type AcgFromDocPageContent,
  type AcgFromDocSection,
  type AcgFromDocSelection,
} from './AcgFromDocData'

const SECTION_META: Record<
  AcgFromDocSection,
  { label: string; hint: string; icon: typeof Type }
> = {
  hero: { label: '活动头图与会场导航', hint: '活动身份、主动作与页面层级入口', icon: ImageIcon },
  journey: { label: '篇章旅程', hint: '当前任务与六篇章解锁状态', icon: LayoutGrid },
  chapter: { label: '当前篇章', hint: '主理人、征稿与篇章说明', icon: LayoutGrid },
  battle: { label: '夯拉主战场', hint: '焦点作品、双向投票和双榜', icon: ListChecks },
  content: { label: '随机内容流', hint: '榜单外作品发现与持续投票', icon: LayoutGrid },
  wish: { label: '春晚许愿池', hint: '心愿滚动墙、输入与发布反馈', icon: WandSparkles },
  benefits: { label: '任务与福利', hint: '任务进度、抽奖次数与奖励反馈', icon: Gift },
  venue: { label: '分会场', hint: '品类积分和六篇章聚合内容', icon: LayoutGrid },
}

const ELEMENT_META: Record<
  AcgFromDocElement,
  { label: string; kind: '文字' | '按钮' | '组件' | '状态' }
> = {
  'hero.title': { label: '活动主标题', kind: '文字' },
  'hero.subtitle': { label: '活动副标题', kind: '文字' },
  'hero.venue-nav': { label: '会场切换', kind: '组件' },
  'hero.action': { label: '启程按钮', kind: '按钮' },
  'journey.progress': { label: '当前任务卡', kind: '状态' },
  'journey.chapter': { label: '篇章解锁路线', kind: '状态' },
  'chapter.host': { label: '篇章主理人', kind: '组件' },
  'chapter.submit': { label: '公开征集入口', kind: '组件' },
  'battle.spotlight': { label: '焦点作品', kind: '组件' },
  'battle.vote': { label: '夯拉投票', kind: '状态' },
  'battle.ranking': { label: '夯榜 / 拉榜', kind: '状态' },
  'content.feed': { label: '随机作品流', kind: '组件' },
  'wish.wall': { label: '实时心愿墙', kind: '状态' },
  'wish.input': { label: '心愿输入框', kind: '组件' },
  'wish.action': { label: '发布心愿按钮', kind: '按钮' },
  'benefits.tasks': { label: '福利任务列表', kind: '状态' },
  'benefits.lottery': { label: '抽奖按钮', kind: '按钮' },
  'venue.score': { label: '分会场积分', kind: '状态' },
  'venue.feed': { label: '分会场内容流', kind: '组件' },
}

function Field({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string
  value: string
  multiline?: boolean
  onChange: (value: string) => void
}) {
  const className =
    'w-full rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 text-[12px] leading-5 text-[var(--color-ink)] outline-none transition-colors focus:border-[#357ef8] focus:ring-2 focus:ring-[#357ef8]/15'
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-medium text-[var(--color-ink)]/55">{label}</span>
      {multiline ? (
        <textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} className={`${className} resize-none py-2`} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className={`${className} h-8`} />
      )}
    </label>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-b border-[var(--divider-soft)] pb-4 last:border-0 last:pb-0">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink)]/38">{title}</h3>
      {children}
    </section>
  )
}

function DataNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] px-3 py-2.5 text-[11px] leading-5 text-[var(--color-ink)]/52">{children}</div>
  )
}

export default function AcgFromDocEditPanel({
  value,
  selection,
  onChange,
  onSelect,
  onClose,
}: {
  value: AcgFromDocPageContent
  selection: AcgFromDocSelection | null
  onChange: (value: AcgFromDocPageContent) => void
  onSelect: (selection: AcgFromDocSelection | null) => void
  onClose: () => void
}) {
  const update = (patch: Partial<AcgFromDocPageContent>) => onChange({ ...value, ...patch })
  const section = selection?.section
  const sectionMeta = section ? SECTION_META[section] : null
  const elementMeta = selection?.type === 'element' ? ELEMENT_META[selection.element] : null
  const Icon = sectionMeta?.icon ?? LayoutGrid

  const textFields: Partial<
    Record<AcgFromDocSection, Array<[keyof AcgFromDocPageContent, string, boolean?]>>
  > = {
    hero: [
      ['eventBadge', '联合身份'],
      ['heroTitle', '主标题'],
      ['heroSubtitle', '副标题', true],
      ['heroAction', '主按钮'],
    ],
    journey: [
      ['journeyTitle', '标题'],
      ['journeySubtitle', '说明', true],
    ],
    battle: [
      ['battleTitle', '标题'],
      ['battleSubtitle', '说明', true],
      ['positiveVoteLabel', '夯按钮'],
      ['negativeVoteLabel', '拉按钮'],
    ],
    content: [
      ['contentTitle', '标题'],
      ['contentSubtitle', '说明', true],
    ],
    wish: [
      ['wishTitle', '标题'],
      ['wishSubtitle', '说明', true],
      ['wishPlaceholder', '输入提示', true],
      ['wishAction', '发布按钮'],
    ],
    benefits: [['benefitsTitle', '标题']],
    venue: [
      ['venueTitle', '游戏分会场标题'],
      ['venueSubtitle', '分会场说明', true],
    ],
  }

  const renderFields = (activeSection: AcgFromDocSection) => {
    const fields = textFields[activeSection]
    if (!fields) {
      return <DataNotice>该区块由篇章配置和运营内容驱动。可在画布中继续点选主理人、征集入口等对象查看边界。</DataNotice>
    }
    return (
      <Group title="区块内容">
        {fields.map(([key, label, multiline]) => (
          <Field
            key={key}
            label={label}
            value={value[key]}
            multiline={multiline}
            onChange={(next) => update({ [key]: next })}
          />
        ))}
      </Group>
    )
  }

  const elementField: Partial<Record<AcgFromDocElement, [keyof AcgFromDocPageContent, string, boolean?]>> = {
    'hero.title': ['heroTitle', '活动主标题'],
    'hero.subtitle': ['heroSubtitle', '活动副标题', true],
    'hero.action': ['heroAction', '按钮文案'],
    'battle.vote': ['positiveVoteLabel', '夯按钮文案'],
    'wish.input': ['wishPlaceholder', '输入提示', true],
    'wish.action': ['wishAction', '按钮文案'],
  }

  const renderElement = (element: AcgFromDocElement) => {
    const field = elementField[element]
    if (field) {
      const [key, label, multiline] = field
      return (
        <Group title="对象内容">
          <Field label={label} value={value[key]} multiline={multiline} onChange={(next) => update({ [key]: next })} />
          {element === 'battle.vote' && (
            <Field label="拉按钮文案" value={value.negativeVoteLabel} onChange={(negativeVoteLabel) => update({ negativeVoteLabel })} />
          )}
        </Group>
      )
    }
    return (
      <DataNotice>
        这是独立的数据 / 状态组件。画布选择已经定位到单个对象；票数、锁定、任务完成和榜单切换由玩法配置维护，编辑模式不会误触真实交互。
      </DataNotice>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-surface-0)]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--divider-soft)] px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#357ef8]/10 text-[#357ef8]"><Icon size={14} /></span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-[var(--color-ink)]">{elementMeta?.label ?? sectionMeta?.label ?? '页面结构'}</p>
            <p className="truncate text-[10px] text-[var(--color-ink)]/42">
              {elementMeta ? `${elementMeta.kind} · ${selection?.type === 'element' && selection.instance ? selection.instance : '单独编辑当前对象'}` : sectionMeta?.hint ?? '在画布中点选一个模块或按钮'}
            </p>
          </div>
        </div>
        <button type="button" aria-label="关闭编辑栏" onClick={onClose} className="grid size-7 place-items-center rounded-md text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"><X size={14} /></button>
      </header>

      <div className="thin-scroll flex-1 overflow-y-auto p-3.5">
        {!selection ? (
          <div className="grid gap-2">
            <p className="mb-1 text-[11px] leading-5 text-[var(--color-ink)]/48">
              页面按用户任务拆成 8 类组件，不是一张整图。先选模块，再在画布里点标题、投票、榜单、任务或分会场内容。
            </p>
            {(Object.keys(SECTION_META) as AcgFromDocSection[]).map((id) => {
              const meta = SECTION_META[id]
              const SectionIcon = meta.icon
              return (
                <button key={id} type="button" onClick={() => onSelect({ type: 'section', section: id })} className="flex items-center gap-3 rounded-xl border border-[var(--divider-soft)] px-3 py-3 text-left transition-colors hover:border-[#357ef8]/35 hover:bg-[#357ef8]/[0.04]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--fill-subtle)] text-[var(--color-ink)]/52"><SectionIcon size={15} /></span>
                  <span className="min-w-0"><strong className="block text-[12px] text-[var(--color-ink)]/82">{meta.label}</strong><span className="mt-0.5 block text-[10px] text-[var(--color-ink)]/40">{meta.hint}</span></span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4">
            {selection.type === 'element' ? renderElement(selection.element) : renderFields(selection.section)}
            <button type="button" onClick={() => onSelect({ type: 'section', section: selection.section })} className="h-8 rounded-lg border border-[var(--divider-soft)] text-[10px] text-[var(--color-ink)]/50 hover:bg-[var(--fill-hover)]">选择整个「{SECTION_META[selection.section].label}」模块</button>
          </div>
        )}
      </div>
    </div>
  )
}
