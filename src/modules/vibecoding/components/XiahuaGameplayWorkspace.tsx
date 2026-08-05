import { useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ChevronDown, CircleHelp, Gift, Layers, ListChecks, Plus, Save, Sparkles, ThumbsUp } from '@/shared/icons'
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

function LotteryEditor({
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
  const [simulated, setSimulated] = useState({ newCards: 88, repeats: 12 })
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const { dailyLimit, pityAfter, costPerDraw } = modules.lottery
  const newCardPercent = Math.round(value.draw.newCardBias * 100)

  const simulate = () => {
    let newCards = 0
    for (let index = 0; index < 100; index += 1) {
      if (Math.random() < value.draw.newCardBias) newCards += 1
    }
    setSimulated({ newCards, repeats: 100 - newCards })
    toast.success('已按当前参数模拟 100 次')
  }

  const setLottery = (patch: Partial<typeof modules.lottery>) =>
    onChange({
      ...value,
      modules: { ...modules, lottery: { ...modules.lottery, ...patch } },
    })

  return (
    <div className="space-y-7">
      <ConfigGroup
        title="抽取内容"
        description="先确定一次抽奖会返回什么内容，再配置这些内容之间的出奖规则。"
      >
        <ContentPoolPanel
          value={value}
          onChange={onChange}
          preset={preset}
          onOpenAssetLibrary={onOpenAssetLibrary}
          context="lottery"
        />
      </ConfigGroup>

      <ConfigGroup
        title="出奖规则"
        description="控制新卡与重复卡的比例，以及连续未出新卡时的保底。"
      >
        <Panel
        title="新卡与重复卡"
        summary={`新卡优先 ${newCardPercent}% · 重复卡 ${100 - newCardPercent}% · 支持抽样模拟`}
        description="横向拖动新内容倾斜，直接决定用户抽到新卡与重复卡的相对概率。"
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
          <div className="mb-2 flex items-baseline justify-between text-[11px]">
            <span className="font-medium text-sky-700">优先新卡 {newCardPercent}%</span>
            <span className="text-[var(--color-ink)]/42">允许重复 {100 - newCardPercent}%</span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-[var(--fill-subtle)]">
            <span className="bg-[#357ef8] transition-[width]" style={{ width: `${newCardPercent}%` }} />
            <span className="flex-1 bg-[var(--color-ink)]/12" />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={newCardPercent}
            aria-label="新卡概率"
            onChange={(event) =>
              onChange({
                ...value,
                draw: {
                  ...value.draw,
                  newCardBias: Number(event.target.value) / 100,
                },
              })
            }
            className="mt-3 block h-1 w-full cursor-ew-resize appearance-none rounded-full bg-[var(--fill-subtle)] accent-[#357ef8]"
          />
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

        <Panel
          title="重复卡保底"
          summary={`${modules.lottery.allowDuplicate ? '允许抽到重复卡' : '不允许重复卡'} · 连续 ${pityAfter} 抽未出新卡时保底`}
          description="保底只影响用户已经拥有部分卡片之后的抽取结果。"
        >
          <div className="grid gap-5 @[560px]:grid-cols-2 @[560px]:items-center">
            <SliderField
              label="连续重复保底"
              value={pityAfter}
              min={2}
              max={12}
              suffix=" 抽"
              description={`连续 ${pityAfter} 抽没有新卡时，下一抽必出未获得卡。`}
              onChange={(next) => setLottery({ pityAfter: next })}
            />
            <ToggleRow
              label="允许抽到重复卡"
              description="关闭后所有抽取都只会从未拥有卡片中产生。"
              value={modules.lottery.allowDuplicate}
              onChange={(allowDuplicate) => setLottery({ allowDuplicate })}
            />
          </div>
        </Panel>
      </ConfigGroup>

      <ConfigGroup
        title="参与规则"
        description="配置用户如何进入抽奖、每次消耗多少，以及每天最多参与多少次。"
      >

      <Panel
        title="抽取次数"
        summary={`首次赠送 ${value.draw.initialChances} 次 · 每抽消耗 ${costPerDraw} 次机会 · 每日最多 ${dailyLimit} 抽`}
        description="控制用户的初始资源、单次成本和每日业务上限。"
      >
        <div className="grid gap-5 @[560px]:grid-cols-3">
          <SliderField
            label="初始抽奖次数"
            value={value.draw.initialChances}
            min={0}
            max={30}
            suffix=" 次"
            onChange={(initialChances) => onChange({ ...value, draw: { ...value.draw, initialChances } })}
          />
          <SliderField
            label="每日抽奖上限"
            value={dailyLimit}
            min={1}
            max={50}
            suffix=" 次"
            onChange={(next) => setLottery({ dailyLimit: next })}
          />
          <SliderField
            label="单次消耗"
            value={costPerDraw}
            min={1}
            max={5}
            suffix=" 机会"
            onChange={(next) => setLottery({ costPerDraw: next })}
          />
        </div>
      </Panel>

      <Panel
        title="参与方式"
        summary={`抽卡形态 · 完成活动任务获得机会 · 每人最多中奖 ${modules.lottery.maxWinsPerUser} 次`}
        description="确定用户看到哪种抽奖形态、如何获得抽奖机会，以及活动期中奖上限。"
      >
        <div className="grid gap-3 @[520px]:grid-cols-2 @[760px]:grid-cols-4">
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">交互模板</span>
            <select
              className={INPUT}
              value={modules.lottery.template}
              onChange={(event) =>
                setLottery({
                  template: event.target.value as typeof modules.lottery.template,
                })
              }
            >
              <option value="card">抽卡</option>
              <option value="grid">九宫格</option>
              <option value="wheel">转盘</option>
              <option value="list">通用列表</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">入场方式</span>
            <select
              className={INPUT}
              value={modules.lottery.entryMode}
              onChange={(event) =>
                setLottery({
                  entryMode: event.target.value as typeof modules.lottery.entryMode,
                })
              }
            >
              <option value="free">免费</option>
              <option value="chance">抽奖机会</option>
              <option value="token">代币</option>
              <option value="points">积分</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">抽奖机会来源</span>
            <select
              className={INPUT}
              value={modules.lottery.resourceId}
              onChange={(event) => setLottery({ resourceId: event.target.value })}
              disabled={modules.lottery.entryMode === 'free'}
            >
              <option value="draw_chance_night_food">完成活动任务获得</option>
              <option value="activity_initial_chance">仅使用首次赠送次数</option>
              <option value="activity_points">消耗活动积分兑换</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">每人最多中奖</span>
            <input
              type="number"
              min={1}
              className={INPUT}
              value={modules.lottery.maxWinsPerUser}
              onChange={(event) =>
                setLottery({
                  maxWinsPerUser: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
          </label>
        </div>
      </Panel>
      </ConfigGroup>

      <ConfigGroup
        title="风险控制"
        description="业务次数之外的账号、设备和网络频控，仅在异常参与时生效。"
      >

      <Panel
        title="频控与风险阈值"
        summary={`账号 ${modules.lottery.accountDailyLimit} 次/日 · 设备 ${modules.lottery.deviceDailyLimit} 次/日 · IP ${modules.lottery.ipHourlyLimit} 次/小时`}
        description="业务次数和风险频控分开计算；命中任一上限即拒绝发奖。"
        defaultOpen={false}
      >
        <div className="grid gap-3 @[520px]:grid-cols-2 @[760px]:grid-cols-4">
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">次数重置</span>
            <select
              className={INPUT}
              value={modules.lottery.resetCycle}
              onChange={(event) =>
                setLottery({
                  resetCycle: event.target.value as 'daily' | 'activity',
                })
              }
            >
              <option value="daily">每日重置</option>
              <option value="activity">活动期累计</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">抽奖冷却（秒）</span>
            <input
              type="number"
              min={0}
              className={INPUT}
              value={modules.lottery.cooldownSeconds}
              onChange={(event) =>
                setLottery({
                  cooldownSeconds: Math.max(0, Number(event.target.value) || 0),
                })
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">账号日上限</span>
            <input
              type="number"
              min={1}
              className={INPUT}
              value={modules.lottery.accountDailyLimit}
              onChange={(event) =>
                setLottery({
                  accountDailyLimit: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">设备日上限</span>
            <input
              type="number"
              min={1}
              className={INPUT}
              value={modules.lottery.deviceDailyLimit}
              onChange={(event) =>
                setLottery({
                  deviceDailyLimit: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] text-[var(--color-ink)]/42">IP 小时上限</span>
            <input
              type="number"
              min={1}
              className={INPUT}
              value={modules.lottery.ipHourlyLimit}
              onChange={(event) =>
                setLottery({
                  ipHourlyLimit: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
          </label>
        </div>
      </Panel>
      </ConfigGroup>
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
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const [activeKind, setActiveKind] = useState<GameplayKind>('lottery')
  const [dirty, setDirty] = useState(false)
  const [scopeOpen, setScopeOpen] = useState(false)
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const enabledKinds = modules.enabled
  const activeDefinition = useMemo(
    () => GAMEPLAY_KINDS.find((item) => item.id === activeKind) ?? GAMEPLAY_KINDS[0],
    [activeKind],
  )
  const enabled = enabledKinds.includes(activeKind)

  const updateGameplay = (next: XiahuaGameplay) => {
    onChange(next)
    setDirty(true)
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
                <LotteryEditor
                  value={value}
                  onChange={updateGameplay}
                  preset={preset}
                  onOpenAssetLibrary={onOpenAssetLibrary}
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
