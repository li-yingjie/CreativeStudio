import { useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, ChevronDown, CircleHelp, ExternalLink, Gift, Layers, ListChecks, Plus, Save, Sparkles, ThumbsUp, WandSparkles } from '@/shared/icons'
import type { LucideIcon } from '@/shared/icons'
import type { ActivityPreset } from './ActivityPreset'
import {
  DEFAULT_XIAHUA_GAMEPLAY_MODULES,
  DEFAULT_XIAHUA_PARTICIPATION_POLICY,
  type XiahuaGameplay,
  type XiahuaGameplayModuleKind,
  type XiahuaTierDef,
} from './XiahuaGameplay'
import {
  ContentPoolPanel,
  CopyManagementPanel,
  ParticipationPolicyPanel,
  PrizeInventoryPanel,
  QuizQuestionPanel,
  TaskDefinitionPanel,
  VoteCandidatePanel,
} from './XiahuaGameplayDataPanels'
import { ToolbarAction } from './Toolbar'
import { XIAHUA_GENERATION_BASIS } from '../assets/assetCatalog'
import {
  applyLotteryPatchBatch,
  compileLotteryEditor,
  type CompiledLotteryField,
  type LotteryPatch,
  type LotteryPatchPath,
} from '../gameplay/lotteryPackage'

type GameplayKind = XiahuaGameplayModuleKind

type GameplayKindDefinition = {
  id: GameplayKind
  label: string
  instance: string
  purpose: string
  icon: LucideIcon
}

const GAMEPLAY_KINDS: GameplayKindDefinition[] = [
  {
    id: 'lottery',
    label: '抽奖玩法',
    instance: '夜食卡抽取',
    purpose: '用户消耗抽卡机会，从当前夜食卡池中获得 1 张卡片。',
    icon: Gift,
  },
  {
    id: 'collection',
    label: '集卡玩法',
    instance: '夜食卡册与兑换',
    purpose: '管理卡册收集目标、重复卡赠送规则和各档兑换奖励。',
    icon: Layers,
  },
  {
    id: 'tasks',
    label: '任务玩法',
    instance: '抽卡机会任务',
    purpose: '配置用户要完成的动作，以及每次完成后发放的抽卡机会。',
    icon: ListChecks,
  },
  {
    id: 'voting',
    label: '投票玩法',
    instance: '候选内容投票',
    purpose: '管理候选内容、用户票数额度和结果公布方式。',
    icon: ThumbsUp,
  },
  {
    id: 'quiz',
    label: '答题玩法',
    instance: '活动知识问答',
    purpose: '管理题库、一轮答题节奏和通过条件。',
    icon: CircleHelp,
  },
]

const INPUT =
  'h-8 w-full rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2.5 text-[12px] text-[var(--color-ink)] outline-none transition-colors focus:border-sky-400'

function Panel({
  title,
  summary,
  description,
  trailing,
  defaultOpen = true,
  children,
}: {
  title: string
  summary?: string
  description?: string
  trailing?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={() => setOpen((current) => !current)} className="min-w-0 flex-1 text-left">
          <h3 className="text-[12px] font-semibold text-[var(--color-ink)]/82">{title}</h3>
          {summary || description ? (
            <p className="mt-0.5 truncate text-[11px] leading-[18px] text-[var(--color-ink)]/45">
              {open ? description ?? summary : summary ?? description}
            </p>
          ) : null}
        </button>
        {trailing}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[10px] font-medium text-[var(--color-ink)]/52 transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]/75"
        >
          {open ? '收起' : '展开'}
          <ChevronDown className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open ? <div className="border-t border-[var(--divider-soft)] px-4 py-4">{children}</div> : null}
    </section>
  )
}

function ConfigGroup({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-2.5 px-0.5">
        <h3 className="text-[13px] font-semibold text-[var(--color-ink)]/84">{title}</h3>
        <p className="mt-0.5 text-[10px] leading-4 text-[var(--color-ink)]/40">{description}</p>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  description,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  description?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-4">
        <span className="text-[12px] font-medium text-[var(--color-ink)]/72">{label}</span>
        <span className="font-mono text-[11px] text-[var(--color-ink)]/55">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="block h-1 w-full cursor-ew-resize appearance-none rounded-full bg-[var(--fill-subtle)] accent-[#357ef8]"
      />
      {description ? (
        <span className="mt-1.5 block text-[10px] leading-4 text-[var(--color-ink)]/38">{description}</span>
      ) : null}
    </label>
  )
}

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors ${checked ? 'bg-[#357ef8]' : 'bg-[var(--color-ink)]/18'}`}
    >
      <span
        className={`absolute top-[1.5px] size-[15px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.24)] transition-[left] ${checked ? 'left-[13px]' : 'left-[1.5px]'}`}
      />
    </button>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-[var(--color-ink)]/70">{label}</p>
        <p className="mt-0.5 text-[10px] text-[var(--color-ink)]/38">{description}</p>
      </div>
      <Switch checked={value} label={label} onChange={onChange} />
    </div>
  )
}

function ModuleRail({
  active,
  enabled,
  onSelect,
  trailing,
}: {
  active: GameplayKind
  enabled: GameplayKind[]
  onSelect: (kind: GameplayKind) => void
  trailing?: ReactNode
}) {
  return (
    <div className="flex min-h-11 shrink-0 items-center gap-1.5 border-b border-[var(--divider-soft)] px-4 py-2">
      <div className="thin-scroll flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {GAMEPLAY_KINDS.map((item) => {
          const Icon = item.icon
          const isEnabled = enabled.includes(item.id)
          const selected = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              title={isEnabled ? item.instance : `${item.label}尚未添加`}
              onClick={() => onSelect(item.id)}
              className={`flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12px] transition-colors ${
                selected
                  ? 'bg-[var(--color-ink)]/[0.07] font-medium text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75'
              }`}
            >
              <Icon className="size-3.5" strokeWidth={1.8} />
              {item.label.replace('玩法', '')}
              <span
                className={`size-1.5 rounded-full ${
                  isEnabled ? 'bg-emerald-500' : 'bg-[var(--color-ink)]/14'
                }`}
              />
            </button>
          )
        })}
      </div>
      {trailing ? <div className="ml-auto shrink-0">{trailing}</div> : null}
    </div>
  )
}

const PLATFORM_LABELS = {
  douyin: '抖音',
  douyin_lite: '抖音极速版',
  external_h5: '站外 H5',
} as const

function shortDate(value: string) {
  const [, month = '--', day = '--'] = value.slice(0, 10).split('-')
  return `${month}/${day}`
}

function moduleSummary(kind: GameplayKind, value: XiahuaGameplay) {
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const enabledCards = value.cards.filter((card) => card.enabled !== false)
  const enabledTasks = value.tasks.filter((task) => task.enabled !== false)

  if (kind === 'lottery') {
    return [
      { value: '夜食卡', label: '抽取内容' },
      { value: `${enabledCards.length} 张`, label: '生效卡片' },
      { value: `${modules.lottery.costPerDraw} 次`, label: '每抽消耗' },
      { value: `${modules.lottery.dailyLimit} 抽`, label: '每日上限' },
    ]
  }
  if (kind === 'collection') {
    return [
      { value: `${enabledCards.length} 种`, label: '卡册内容' },
      { value: `${value.tiers.length} 档`, label: '生效档位' },
      { value: `${value.tiers.filter((tier) => tier.prizeId).length} 个`, label: '已绑定奖品' },
      { value: `${value.gift.minHold} 张`, label: '可赠送门槛' },
    ]
  }
  if (kind === 'tasks') {
    const dailyChances = enabledTasks.reduce(
      (total, task) => total + (task.resetCycle === 'activity' ? 0 : task.dailyLimit * task.reward),
      0,
    )
    return [
      { value: `${enabledTasks.length} 个`, label: '生效任务' },
      { value: '抽卡机会', label: '发放资源' },
      { value: `${dailyChances} 次`, label: '每日最多发放' },
      { value: `${enabledTasks.filter((task) => task.claimMode !== 'manual').length} 个`, label: '自动到账' },
    ]
  }
  if (kind === 'voting') {
    return [
      { value: `${modules.voting.votesPerUser} 票`, label: '每人额度' },
      { value: `${modules.voting.candidates.filter((item) => item.enabled).length} 项`, label: '有效候选' },
      { value: modules.voting.resetCycle === 'daily' ? '每日' : '活动期', label: '额度周期' },
      { value: modules.voting.liveRanking ? '实时展示' : '结束公布', label: '结果展示' },
    ]
  }
  return [
    { value: `${modules.quiz.questionCount} 题`, label: '每轮题量' },
    { value: `${modules.quiz.passScore} 分`, label: '通关分数' },
    { value: `${modules.quiz.timeLimit} 秒`, label: '单题限时' },
    { value: `${modules.quiz.retryLimit} 次`, label: '重试机会' },
  ]
}

function EditorHeader({
  kind,
  value,
  preset,
  dirty,
  scopeOpen,
  onToggleScope,
}: {
  kind: GameplayKindDefinition
  value: XiahuaGameplay
  preset: ActivityPreset
  dirty: boolean
  scopeOpen: boolean
  onToggleScope: () => void
}) {
  const Icon = kind.icon
  const policy = value.participation ?? DEFAULT_XIAHUA_PARTICIPATION_POLICY
  const summary = moduleSummary(kind.id, value)
  const stage = preset.stages.at(-1)?.label ?? '当前阶段'
  const platforms = policy.platforms.map((item) => PLATFORM_LABELS[item]).join('、')
  const region = policy.regionScope === 'nationwide' ? '全国' : policy.regions || '指定地区'
  return (
    <header className="border-b border-[var(--divider-soft)] pb-5">
      <div className="flex items-start gap-3">
        <span className="mt-[2px] flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]/70">
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-[var(--color-ink)]/38">
            {preset.name} · {stage} · 线上 v3
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h2 className="text-[18px] font-semibold leading-6 text-[var(--color-ink)]">
              {kind.instance}
            </h2>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              运行中
            </span>
            {dirty ? (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                草稿有修改
              </span>
            ) : (
              <span className="text-[10px] text-[var(--color-ink)]/35">已同步至试玩</span>
            )}
          </div>
          <p className="mt-1 text-[11px] leading-[18px] text-[var(--color-ink)]/48">
            {kind.purpose}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-1)] @[560px]:grid-cols-4">
        {summary.map((item, index) => (
          <div
            key={item.label}
            className={`px-3 py-2.5 ${index % 2 ? 'border-l border-[var(--divider-soft)]' : ''} ${index > 1 ? 'border-t border-[var(--divider-soft)] @[560px]:border-t-0' : ''} ${index > 0 ? '@[560px]:border-l @[560px]:border-[var(--divider-soft)]' : ''}`}
          >
            <p className="text-[14px] font-semibold text-[var(--color-ink)]">{item.value}</p>
            <p className="mt-0.5 text-[9px] text-[var(--color-ink)]/38">{item.label}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-expanded={scopeOpen}
        onClick={onToggleScope}
        className="mt-3 flex w-full items-center gap-2 text-left text-[10px] text-[var(--color-ink)]/45 transition-colors hover:text-[var(--color-ink)]/72"
      >
        <span className="font-medium text-[var(--color-ink)]/62">活动范围</span>
        <span className="min-w-0 flex-1 truncate">
          {shortDate(policy.startAt)}–{shortDate(policy.endAt)} · {platforms} · {region} · {policy.audienceDescription}
        </span>
        <span className="shrink-0 text-[var(--color-ink)]/52">{scopeOpen ? '收起' : '编辑'}</span>
        <ChevronDown className={`size-3 transition-transform ${scopeOpen ? 'rotate-180' : ''}`} />
      </button>
    </header>
  )
}

function GenerationBasisPanel({
  revision,
  operatorOwnedCount,
  onOpenAssetCenter,
  onOpenKnowledge,
  onRegenerate,
  onReleaseOwnership,
}: {
  revision: number
  operatorOwnedCount: number
  onOpenAssetCenter: () => void
  onOpenKnowledge: () => void
  onRegenerate: () => void
  onReleaseOwnership: () => void
}) {
  return (
    <section className="rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4 py-3.5">
      <div className="flex flex-wrap items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
          <WandSparkles className="size-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[12px] font-semibold text-[var(--color-ink)]/82">本次生成依据</h3>
            <span className="rounded-md bg-[var(--fill-subtle)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--color-ink)]/42">revision {revision}</span>
            {operatorOwnedCount ? (
              <button type="button" onClick={onReleaseOwnership} className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 hover:bg-amber-100" title="点击后允许 Agent 再次优化这些字段">
                {operatorOwnedCount} 项保持人工设置 · 允许 Agent 再次优化
              </button>
            ) : (
              <span className="text-[9px] text-[var(--color-ink)]/34">参数可继续由 Agent 优化</span>
            )}
          </div>
          <p className="mt-1 text-[10px] leading-4 text-[var(--color-ink)]/42">Agent 只在玩法包允许的字段内生成；你手动改过的参数会自动保留。</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={onRegenerate} className="flex h-7 items-center gap-1 rounded-md border border-[var(--divider-soft)] px-2 text-[10px] font-medium text-[var(--color-ink)]/58 hover:bg-[var(--fill-subtle)]">
            <Sparkles className="size-3" /> 按目标重新建议
          </button>
          <button type="button" onClick={onOpenAssetCenter} className="flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-medium text-[var(--color-ink)]/52 hover:bg-[var(--fill-subtle)]">
            资产中心 <ExternalLink className="size-3" />
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--divider-soft)] @[620px]:grid-cols-2">
        {XIAHUA_GENERATION_BASIS.map((item) => (
          <button key={item.id} type="button" onClick={item.domain === 'knowledge' ? onOpenKnowledge : onOpenAssetCenter} className="flex min-w-0 items-center gap-2 bg-[var(--color-surface-1)] px-3 py-2 text-left hover:bg-[var(--fill-subtle)]">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[10px] font-medium text-[var(--color-ink)]/68">{item.name}</span>
                <span className="shrink-0 font-mono text-[9px] text-[var(--color-ink)]/30">v{item.version}</span>
              </span>
              <span className="mt-0.5 block truncate text-[9px] text-[var(--color-ink)]/34">{item.kind} · {item.inheritedFrom}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function CompiledFieldControl({
  field,
  revision,
  onPatch,
  onReleaseOwnership,
}: {
  field: CompiledLotteryField
  revision: number
  onPatch: (patch: LotteryPatch) => void
  onReleaseOwnership: (path: LotteryPatchPath) => void
}) {
  const setValue = (next: string | number | boolean) =>
    onPatch({
      op: 'replace',
      path: field.path,
      value: next,
      actor: 'operator',
      reason: '运营在玩法配置台手动调整',
      baseRevision: revision,
    })
  const ownership = field.owner === 'operator' ? (
    <button type="button" onClick={() => onReleaseOwnership(field.path)} className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 hover:bg-amber-100" title="当前值不变；下一次 Agent 优化可以调整该字段">
      保持人工设置
    </button>
  ) : null

  if (field.control === 'switch') {
    return (
      <div className="flex items-center gap-4 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[12px] font-medium text-[var(--color-ink)]/70">{field.label}</p>
            {ownership}
          </div>
          {field.description ? <p className="mt-0.5 text-[10px] leading-4 text-[var(--color-ink)]/38">{field.description}</p> : null}
        </div>
        <Switch checked={Boolean(field.value)} label={field.label} onChange={setValue} />
      </div>
    )
  }

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
        <span className="truncate text-[10px] text-[var(--color-ink)]/42">{field.label}</span>
        {ownership}
      </span>
      {field.control === 'slider' ? (
        <>
          <span className="mb-1.5 flex justify-end font-mono text-[10px] text-[var(--color-ink)]/52">{String(field.value)}{field.suffix}</span>
          <input type="range" min={field.min} max={field.max} step={field.step} value={Number(field.value)} aria-label={field.label} onChange={(event) => setValue(Number(event.target.value))} className="block h-1 w-full cursor-ew-resize appearance-none rounded-full bg-[var(--fill-subtle)] accent-[#357ef8]" />
        </>
      ) : field.control === 'select' ? (
        <select className={INPUT} value={String(field.value)} disabled={field.disabled} onChange={(event) => setValue(event.target.value)}>
          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <div className="relative">
          <input type="number" min={field.min} max={field.max} step={field.step} className={`${INPUT} ${field.suffix ? 'pr-9' : ''}`} value={Number(field.value)} onChange={(event) => setValue(Math.max(field.min ?? Number.NEGATIVE_INFINITY, Number(event.target.value) || 0))} />
          {field.suffix ? <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--color-ink)]/30">{field.suffix.trim()}</span> : null}
        </div>
      )}
      {field.description ? <span className="mt-1.5 block text-[9px] leading-4 text-[var(--color-ink)]/34">{field.description}</span> : null}
    </label>
  )
}

function LotteryEditor({
  value,
  preset,
  onOpenAssetLibrary,
  revision,
  operatorOwnedPaths,
  onPatch,
  onReleaseOwnership,
}: {
  value: XiahuaGameplay
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
  revision: number
  operatorOwnedPaths: ReadonlySet<LotteryPatchPath>
  onPatch: (patch: LotteryPatch) => void
  onReleaseOwnership: (path: LotteryPatchPath) => void
}) {
  const [simulated, setSimulated] = useState({ newCards: 88, repeats: 12 })
  const editor = useMemo(
    () => compileLotteryEditor(value, operatorOwnedPaths),
    [operatorOwnedPaths, value],
  )
  const newCardPercent = Math.round(value.draw.newCardBias * 100)

  const simulate = () => {
    let newCards = 0
    for (let index = 0; index < 100; index += 1) {
      if (Math.random() < value.draw.newCardBias) newCards += 1
    }
    setSimulated({ newCards, repeats: 100 - newCards })
    toast.success('已按当前参数模拟 100 次')
  }

  return (
    <div className="space-y-7">
      {editor.sections.map((section) => (
        <ConfigGroup
          key={section.id}
          title={section.title}
          description={section.description}
        >
          {section.panels.map((panel) => {
            if (panel.id === 'content-pool') {
              return (
                <ContentPoolPanel
                  key={panel.id}
                  value={value}
                  onChange={(next) =>
                    onPatch({
                      op: 'replace',
                      path: 'cards',
                      value: next.cards,
                      actor: 'operator',
                      reason: '运营调整抽取内容与卡片素材',
                      baseRevision: revision,
                    })
                  }
                  preset={preset}
                  onOpenAssetLibrary={onOpenAssetLibrary}
                  context="lottery"
                />
              )
            }

            if (panel.id === 'probability') {
              const probabilityOwned = operatorOwnedPaths.has('draw.newCardBias')
              return (
                <Panel
                  key={panel.id}
                  title={panel.title}
                  summary={panel.summary}
                  description={panel.description}
                  defaultOpen={panel.defaultOpen}
                  trailing={
                    <button
                      type="button"
                      onClick={simulate}
                      className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-[var(--divider-soft)] px-2 text-[10px] text-[var(--color-ink)]/58 transition-colors hover:bg-[var(--fill-subtle)]"
                    >
                      <Sparkles className="size-3" /> 模拟 100 次
                    </button>
                  }
                >
                  <div className="rounded-lg bg-[var(--color-surface-1)] p-3.5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-medium text-sky-700">优先新卡 {newCardPercent}%</span>
                      <span className="flex items-center gap-2 text-[var(--color-ink)]/42">
                        允许重复 {100 - newCardPercent}%
                        {probabilityOwned ? (
                          <button
                            type="button"
                            onClick={() => onReleaseOwnership('draw.newCardBias')}
                            className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 hover:bg-amber-100"
                            title="当前值不变；下一次 Agent 优化可以调整该字段"
                          >
                            保持人工设置
                          </button>
                        ) : null}
                      </span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-[var(--fill-subtle)]">
                      <span
                        className="bg-[#357ef8] transition-[width]"
                        style={{ width: String(newCardPercent) + '%' }}
                      />
                      <span className="flex-1 bg-[var(--color-ink)]/12" />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={newCardPercent}
                      aria-label="新卡概率"
                      onChange={(event) =>
                        onPatch({
                          op: 'replace',
                          path: 'draw.newCardBias',
                          value: Number(event.target.value) / 100,
                          actor: 'operator',
                          reason: '运营调整新卡与重复卡分池倾斜',
                          baseRevision: revision,
                        })
                      }
                      className="mt-3 block h-1 w-full cursor-ew-resize appearance-none rounded-full bg-[var(--fill-subtle)] accent-[#357ef8]"
                    />
                    <p className="mt-2 text-[9px] leading-4 text-[var(--color-ink)]/36">
                      先按用户持有状态进入新卡或重复卡分池，再按下方卡片权重计算最终结果。
                    </p>
                    <div className="mt-3 grid grid-cols-2 divide-x divide-[var(--divider-soft)] border-t border-[var(--divider-soft)] pt-3 text-center">
                      <div>
                        <p className="font-mono text-[16px] font-semibold text-[var(--color-ink)]">{simulated.newCards}</p>
                        <p className="text-[10px] text-[var(--color-ink)]/38">模拟抽中新卡</p>
                      </div>
                      <div>
                        <p className="font-mono text-[16px] font-semibold text-[var(--color-ink)]">{simulated.repeats}</p>
                        <p className="text-[10px] text-[var(--color-ink)]/38">模拟抽到重复</p>
                      </div>
                    </div>
                  </div>
                </Panel>
              )
            }

            const gridClass =
              panel.id === 'draw-limits' || panel.id === 'entry'
                ? 'grid gap-5 @[560px]:grid-cols-3'
                : panel.id === 'risk'
                  ? 'grid gap-4 @[520px]:grid-cols-2 @[760px]:grid-cols-4'
                  : 'grid gap-5 @[560px]:grid-cols-2 @[560px]:items-center'

            return (
              <Panel
                key={panel.id}
                title={panel.title}
                summary={panel.summary}
                description={panel.description}
                defaultOpen={panel.defaultOpen}
              >
                <div className={gridClass}>
                  {panel.fields.map((field) => (
                    <CompiledFieldControl
                      key={field.path}
                      field={field}
                      revision={revision}
                      onPatch={onPatch}
                      onReleaseOwnership={onReleaseOwnership}
                    />
                  ))}
                </div>
              </Panel>
            )
          })}
        </ConfigGroup>
      ))}
    </div>
  )
}

function CollectionEditor({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const setTier = (index: number, patch: Partial<XiahuaTierDef>) =>
    onChange({
      ...value,
      tiers: value.tiers.map((tier, itemIndex) => (itemIndex === index ? { ...tier, ...patch } : tier)),
    })
  const prizes = value.prizes ?? []

  const bindPrize = (index: number, prizeId: string) => {
    const prize = prizes.find((item) => item.id === prizeId)
    if (!prize) return
    setTier(index, {
      prizeId: prize.id,
      reward: prize.name,
      kind: prize.type === 'goods' ? 'goods' : 'coupon',
      stock: prize.dailyStock,
      totalStock: prize.totalStock,
      perUserLimit: prize.perUserLimit,
      assetKey: prize.assetKey,
    })
  }

  return (
    <div className="space-y-7">
      <ContentPoolPanel
        value={value}
        onChange={onChange}
        preset={preset}
        onOpenAssetLibrary={onOpenAssetLibrary}
        context="collection"
      />

      <ConfigGroup
        title="兑换设置"
        description="先定义收集门槛与绑定奖品，再维护这些奖品的库存和履约。"
      >

      <Panel
        title="兑换档位"
        summary={value.tiers.map((tier, index) => `第${index + 1}档集齐${tier.need}种兑${tier.reward}`).join(' · ')}
        description="每个档位绑定一个可发放奖品；库存、有效期和缺货替代方案在下方统一维护。"
        trailing={
          <button
            type="button"
            onClick={() =>
              onChange({
                ...value,
                tiers: [
                  ...value.tiers,
                  {
                    id: `tier-${Date.now()}`,
                    need: Math.min(value.cards.length, (value.tiers.at(-1)?.need ?? 0) + 1),
                    reward: prizes[0]?.name ?? '新奖励',
                    kind: prizes[0]?.type === 'goods' ? 'goods' : 'coupon',
                    stock: prizes[0]?.dailyStock ?? 0,
                    prizeId: prizes[0]?.id,
                    ruleType: 'count',
                    requiredCardIds: [],
                    consumeCards: false,
                  },
                ],
              })
            }
            className="flex h-7 items-center gap-1 rounded-md border border-[var(--divider-soft)] px-2 text-[10px] text-[var(--color-ink)]/58 hover:bg-[var(--fill-subtle)]"
          >
            <Plus className="size-3" /> 增加档位
          </button>
        }
      >
        <div className="space-y-4">
          {value.tiers.map((tier, index) => {
            const boundPrize = prizes.find((prize) => prize.id === tier.prizeId)
            return (
            <div key={tier.id ?? `${index}-${tier.reward}`} className="rounded-lg bg-[var(--color-surface-1)] p-3">
              <div className="grid gap-3 @[600px]:grid-cols-[1fr_150px_180px] @[600px]:items-end">
                <SliderField
                  label={`第 ${index + 1} 档 · 集齐数量`}
                  value={tier.need}
                  min={1}
                  max={value.cards.length}
                  suffix=" 种"
                  onChange={(need) => setTier(index, { need })}
                />
                <label>
                  <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">解锁规则</span>
                  <select
                    className={INPUT}
                    value={tier.ruleType ?? 'count'}
                    onChange={(event) =>
                      setTier(index, {
                        ruleType: event.target.value as XiahuaTierDef['ruleType'],
                      })
                    }
                  >
                    <option value="count">集齐 N 种</option>
                    <option value="all">集齐全部</option>
                    <option value="combination">指定组合</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">绑定奖品</span>
                  <select
                    className={INPUT}
                    value={tier.prizeId ?? ''}
                    onChange={(event) => bindPrize(index, event.target.value)}
                  >
                    <option value="">请选择奖品</option>
                    {prizes
                      .filter((prize) => prize.enabled)
                      .map((prize) => (
                        <option key={prize.id} value={prize.id}>
                          {prize.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 @[600px]:grid-cols-[1fr_180px] @[600px]:items-center">
                {tier.ruleType === 'combination' ? (
                  <div>
                    <p className="mb-1.5 text-[10px] text-[var(--color-ink)]/42">指定必须集齐的卡片</p>
                    <div className="flex flex-wrap gap-1.5">
                      {value.cards.map((card) => {
                        const selected = (tier.requiredCardIds ?? []).includes(card.id)
                        return (
                          <button
                            key={card.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              setTier(index, {
                                requiredCardIds: selected
                                  ? (tier.requiredCardIds ?? []).filter((id) => id !== card.id)
                                  : [...(tier.requiredCardIds ?? []), card.id],
                              })
                            }
                            className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${selected ? 'border-sky-300 bg-sky-50 font-medium text-sky-700' : 'border-[var(--divider-soft)] bg-white text-[var(--color-ink)]/52 hover:bg-[var(--fill-hover)]'}`}
                          >
                            {card.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-[var(--color-ink)]/38">
                    {boundPrize
                      ? `${boundPrize.name} · 每日最多发放 ${boundPrize.dailyStock.toLocaleString('zh-CN')} 份 · 每人限领 ${boundPrize.perUserLimit} 份`
                      : '尚未绑定奖品，用户达到条件后将无法领取。'}
                  </p>
                )}
                <ToggleRow
                  label="兑换后消耗卡片"
                  description="关闭时只记录领奖状态。"
                  value={tier.consumeCards ?? false}
                  onChange={(consumeCards) => setTier(index, { consumeCards })}
                />
              </div>
            </div>
            )
          })}
        </div>
      </Panel>
      <PrizeInventoryPanel value={value} onChange={onChange} preset={preset} onOpenAssetLibrary={onOpenAssetLibrary} />
      </ConfigGroup>

      <ConfigGroup
        title="赠送与反馈"
        description="配置重复卡的赠送条件，以及卡册进度、空态和完成状态文案。"
      >
        <Panel
          title="赠送规则"
          summary={`持有 ${value.gift.minHold} 张起可赠送 · 未获得卡可求赠送`}
          description="只控制重复卡能否送出，不改变卡册的集齐进度。"
        >
          <SliderField
            label="可赠送最低持有数"
            value={value.gift.minHold}
            min={1}
            max={8}
            suffix=" 张"
            description="低于这个数量只展示求赠送，不允许送出。"
            onChange={(minHold) => onChange({ ...value, gift: { minHold } })}
          />
        </Panel>
        <CopyManagementPanel value={value} onChange={onChange} />
      </ConfigGroup>
    </div>
  )
}

function TaskEditor({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  return <TaskDefinitionPanel value={value} onChange={onChange} preset={preset} onOpenAssetLibrary={onOpenAssetLibrary} />
}

function VotingEditor({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const settings = modules.voting
  const update = (patch: Partial<typeof settings>) =>
    onChange({
      ...value,
      modules: { ...modules, voting: { ...settings, ...patch } },
    })
  return (
    <div className="space-y-7">
      <VoteCandidatePanel value={value} onChange={onChange} preset={preset} onOpenAssetLibrary={onOpenAssetLibrary} />

      <ConfigGroup
        title="投票规则"
        description="配置每位用户的票数额度、重置周期和结果公布方式。"
      >
      <Panel
        title="投票额度"
        summary={`每人 ${settings.votesPerUser} 票 · ${settings.resetCycle === 'daily' ? '每日重置' : '活动期累计'} · ${settings.candidateCount} 个候选项`}
        description="控制每个用户能投几票，以及候选内容的规模。"
      >
        <div className="grid gap-5 @[560px]:grid-cols-2">
          <SliderField
            label="每人可投"
            value={settings.votesPerUser}
            min={1}
            max={10}
            suffix=" 票"
            onChange={(next) => update({ votesPerUser: next })}
          />
          <SliderField
            label="候选项数量"
            value={settings.candidateCount}
            min={2}
            max={20}
            suffix=" 项"
            onChange={(next) => update({ candidateCount: next })}
          />
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">票数重置</span>
            <select
              className={INPUT}
              value={settings.resetCycle}
              onChange={(event) =>
                update({
                  resetCycle: event.target.value as typeof settings.resetCycle,
                })
              }
            >
              <option value="daily">每日重置</option>
              <option value="activity">活动期累计</option>
            </select>
          </label>
        </div>
      </Panel>
      <Panel
        title="结果展示"
        summary={`${settings.liveRanking ? '实时展示排名' : '结束后公布排名'} · ${settings.anonymous ? '匿名投票' : '记录参与人'}`}
      >
        <div className="divide-y divide-[var(--divider-soft)]">
          <ToggleRow
            label="实时展示排名"
            description="每次投票后立即更新候选项顺序。"
            value={settings.liveRanking}
            onChange={(next) => update({ liveRanking: next })}
          />
          <ToggleRow
            label="匿名投票"
            description="结果页不展示投票用户身份。"
            value={settings.anonymous}
            onChange={(next) => update({ anonymous: next })}
          />
        </div>
      </Panel>
      </ConfigGroup>
    </div>
  )
}

function QuizEditor({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const settings = modules.quiz
  const update = (patch: Partial<typeof settings>) =>
    onChange({
      ...value,
      modules: { ...modules, quiz: { ...settings, ...patch } },
    })
  return (
    <div className="space-y-7">
      <QuizQuestionPanel value={value} onChange={onChange} preset={preset} onOpenAssetLibrary={onOpenAssetLibrary} />

      <ConfigGroup
        title="作答设置"
        description="配置一轮抽取多少题、题目如何排序，以及用户怎样算通过。"
      >
        <Panel
          title="每轮题目"
          summary={`每轮 ${settings.questionCount} 题 · ${settings.randomOrder ? '随机抽题并打乱选项' : '按题库顺序出题'}`}
        >
          <div className="grid gap-5 @[560px]:grid-cols-2 @[560px]:items-center">
            <SliderField
              label="每轮题量"
              value={settings.questionCount}
              min={3}
              max={30}
              suffix=" 题"
              onChange={(next) => update({ questionCount: next })}
            />
            <ToggleRow
              label="随机出题"
              description="每次进入时打乱题目与选项顺序。"
              value={settings.randomOrder}
              onChange={(next) => update({ randomOrder: next })}
            />
          </div>
        </Panel>
        <Panel
          title="通过条件"
          summary={`${settings.passScore} 分通过 · 每题 ${settings.timeLimit} 秒 · 最多重试 ${settings.retryLimit} 次`}
        >
          <div className="grid gap-5 @[560px]:grid-cols-3">
            <SliderField
              label="通过分数"
              value={settings.passScore}
              min={50}
              max={100}
              step={5}
              suffix=" 分"
              onChange={(next) => update({ passScore: next })}
            />
            <SliderField
              label="单题限时"
              value={settings.timeLimit}
              min={5}
              max={60}
              suffix=" 秒"
              onChange={(next) => update({ timeLimit: next })}
            />
            <SliderField
              label="重试次数"
              value={settings.retryLimit}
              min={0}
              max={10}
              suffix=" 次"
              onChange={(next) => update({ retryLimit: next })}
            />
          </div>
        </Panel>
      </ConfigGroup>
    </div>
  )
}

function AddGameplay({ kind, onAdd }: { kind: GameplayKindDefinition; onAdd: () => void }) {
  const Icon = kind.icon
  return (
    <div className="flex min-h-[420px] items-center justify-center px-6 py-12">
      <div className="max-w-[360px] text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[var(--fill-subtle)] text-[var(--color-ink)]/42">
          <Icon className="size-5" />
        </span>
        <h2 className="mt-4 text-[15px] font-semibold text-[var(--color-ink)]">添加{kind.label}</h2>
        <p className="mt-2 text-[11px] leading-[19px] text-[var(--color-ink)]/45">
          添加后会沿用当前活动的参与范围，并生成「{kind.instance}」所需的专属内容与规则。
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--color-ink)] px-3 text-[11px] font-medium text-white transition-opacity hover:opacity-88"
        >
          <Plus className="size-3.5" /> 添加到活动
        </button>
      </div>
    </div>
  )
}

export default function XiahuaGameplayWorkspace({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
  onOpenAssetCenter,
  onOpenKnowledge,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
  onOpenAssetCenter: () => void
  onOpenKnowledge: () => void
}) {
  const [activeKind, setActiveKind] = useState<GameplayKind>('lottery')
  const [dirty, setDirty] = useState(false)
  const [scopeOpen, setScopeOpen] = useState(false)
  const revision = value.meta?.revision ?? 12
  const operatorOwnedPaths = useMemo(
    () =>
      new Set<LotteryPatchPath>(
        (value.meta?.operatorOwnedPaths ?? []) as LotteryPatchPath[],
      ),
    [value.meta?.operatorOwnedPaths],
  )
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const enabledKinds = modules.enabled
  const activeDefinition = useMemo(
    () => GAMEPLAY_KINDS.find((item) => item.id === activeKind) ?? GAMEPLAY_KINDS[0],
    [activeKind],
  )
  const enabled = enabledKinds.includes(activeKind)

  const withSpecMeta = (
    next: XiahuaGameplay,
    nextRevision: number,
    ownedPaths: ReadonlySet<LotteryPatchPath>,
  ): XiahuaGameplay => ({
    ...next,
    meta: {
      revision: nextRevision,
      source: value.meta?.source ?? '活动策划文档 rev.12',
      generatedAt: new Date().toISOString(),
      generationBasisIds:
        value.meta?.generationBasisIds ??
        XIAHUA_GENERATION_BASIS.map((item) => item.id),
      operatorOwnedPaths: [...ownedPaths],
    },
  })

  const updateGameplay = (next: XiahuaGameplay) => {
    onChange(withSpecMeta(next, revision + 1, operatorOwnedPaths))
    setDirty(true)
  }

  const applyLotteryOperatorPatch = (patch: LotteryPatch) => {
    const result = applyLotteryPatchBatch(
      value,
      [patch],
      revision,
      operatorOwnedPaths,
    )
    if (result.reason === 'stale_revision') {
      toast.error('配置版本已变化，请重试本次修改')
      return
    }
    if (result.reason === 'validation_failed') {
      toast.error('该修改无法应用', {
        description: result.issues.find((issue) => issue.severity === 'error')?.message,
      })
      return
    }
    const nextOwnedPaths = new Set(operatorOwnedPaths).add(patch.path)
    onChange(withSpecMeta(result.value, result.revision, nextOwnedPaths))
    setDirty(true)
  }

  const releaseOwnership = (path?: LotteryPatchPath) => {
    const nextOwnedPaths = new Set(operatorOwnedPaths)
    if (path) nextOwnedPaths.delete(path)
    else nextOwnedPaths.clear()
    onChange(withSpecMeta(value, revision + 1, nextOwnedPaths))
    setDirty(true)
    toast.success(path ? '已允许 Agent 再次优化该参数' : '已允许 Agent 再次优化全部参数', {
      description: '当前值保持不变，将在下一次生成建议时参与更新。',
    })
  }

  const regenerateLotterySuggestion = () => {
    const patches: LotteryPatch[] = [
      {
        op: 'replace',
        path: 'draw.newCardBias',
        value: 0.84,
        actor: 'agent',
        reason: '结合当前 9 张卡与活动频次，降低后段集齐过快风险',
        baseRevision: revision,
      },
      {
        op: 'replace',
        path: 'modules.lottery.pityAfter',
        value: 5,
        actor: 'agent',
        reason: '在新卡倾斜降低后提前一抽触发体验保底',
        baseRevision: revision,
      },
      {
        op: 'replace',
        path: 'modules.lottery.dailyLimit',
        value: 18,
        actor: 'agent',
        reason: '按当前任务每日供给量收敛业务上限',
        baseRevision: revision,
      },
    ]
    const result = applyLotteryPatchBatch(
      value,
      patches,
      revision,
      operatorOwnedPaths,
    )
    if (result.reason) {
      toast.error(
        result.reason === 'stale_revision' ? '配置版本已变化，建议未应用' : '生成建议未通过玩法校验',
      )
      return
    }
    onChange(withSpecMeta(result.value, result.revision, operatorOwnedPaths))
    if (result.applied.length > 0) setDirty(true)
    toast.success('已按当前活动目标更新建议', {
      description: `应用 ${result.applied.length} 项${result.skipped.length ? `，保留 ${result.skipped.length} 项人工设置` : ''}`,
    })
  }

  const addGameplay = () => {
    updateGameplay({
      ...value,
      modules: {
        ...modules,
        enabled: modules.enabled.includes(activeKind) ? modules.enabled : [...modules.enabled, activeKind],
      },
    })
    toast.success(`${activeDefinition.label}已添加`, {
      description: '已生成默认参数，可以继续调整。',
    })
  }

  const save = () => {
    if (activeKind === 'lottery') {
      const issues = compileLotteryEditor(value, operatorOwnedPaths).issues
      const blocking = issues.find((issue) => issue.severity === 'error')
      if (blocking) {
        toast.error('玩法配置暂不能保存', { description: blocking.message })
        return
      }
      const warningCount = issues.filter((issue) => issue.severity === 'warning').length
      setDirty(false)
      toast.success('玩法配置已保存', {
        description: warningCount
          ? `已同步至试玩，另有 ${warningCount} 项非阻断提醒会在发布时再次确认。`
          : '已同步至试玩。',
      })
      return
    }
    setDirty(false)
    toast.success('玩法配置已保存', { description: '试玩将使用最新参数。' })
  }

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-[var(--color-surface-0)]">
      <ModuleRail
        active={activeKind}
        enabled={enabledKinds}
        onSelect={(kind) => {
          setActiveKind(kind)
          setScopeOpen(false)
        }}
        trailing={
          <ToolbarAction
            icon={Save}
            label={dirty ? '保存改动' : '已保存'}
            active={dirty}
            onClick={save}
          />
        }
      />

      <div className="min-h-0 flex-1">
        <main className="thin-scroll h-full min-h-0 overflow-y-auto bg-[var(--color-surface-0)]">
          {enabled ? (
            <div className="mx-auto w-full max-w-[860px] space-y-6 px-5 py-6">
              <EditorHeader
                kind={activeDefinition}
                value={value}
                preset={preset}
                dirty={dirty}
                scopeOpen={scopeOpen}
                onToggleScope={() => setScopeOpen((current) => !current)}
              />
              {scopeOpen ? <ParticipationPolicyPanel value={value} onChange={updateGameplay} /> : null}
              {activeKind === 'lottery' ? (
                <GenerationBasisPanel
                  revision={revision}
                  operatorOwnedCount={operatorOwnedPaths.size}
                  onOpenAssetCenter={onOpenAssetCenter}
                  onOpenKnowledge={onOpenKnowledge}
                  onRegenerate={regenerateLotterySuggestion}
                  onReleaseOwnership={() => releaseOwnership()}
                />
              ) : null}
              {activeKind === 'lottery' ? (
                <LotteryEditor
                  value={value}
                  preset={preset}
                  onOpenAssetLibrary={onOpenAssetLibrary}
                  revision={revision}
                  operatorOwnedPaths={operatorOwnedPaths}
                  onPatch={applyLotteryOperatorPatch}
                  onReleaseOwnership={releaseOwnership}
                />
              ) : null}
              {activeKind === 'collection' ? (
                <CollectionEditor
                  value={value}
                  onChange={updateGameplay}
                  preset={preset}
                  onOpenAssetLibrary={onOpenAssetLibrary}
                />
              ) : null}
              {activeKind === 'tasks' ? (
                <TaskEditor
                  value={value}
                  onChange={updateGameplay}
                  preset={preset}
                  onOpenAssetLibrary={onOpenAssetLibrary}
                />
              ) : null}
              {activeKind === 'voting' ? (
                <VotingEditor
                  value={value}
                  onChange={updateGameplay}
                  preset={preset}
                  onOpenAssetLibrary={onOpenAssetLibrary}
                />
              ) : null}
              {activeKind === 'quiz' ? (
                <QuizEditor
                  value={value}
                  onChange={updateGameplay}
                  preset={preset}
                  onOpenAssetLibrary={onOpenAssetLibrary}
                />
              ) : null}
            </div>
          ) : (
            <AddGameplay kind={activeDefinition} onAdd={addGameplay} />
          )}
        </main>
      </div>
    </div>
  )
}
