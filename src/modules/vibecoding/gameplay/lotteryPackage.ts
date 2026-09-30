import {
  DEFAULT_XIAHUA_GAMEPLAY_MODULES,
  type XiahuaCardDef,
  type XiahuaGameplay,
} from '../components/XiahuaGameplay'
import type {
  GameplayPackageManifest,
  SemanticPatch,
  ValidationIssue,
} from './contracts'

export type LotteryFieldPath =
  | 'draw.newCardBias'
  | 'draw.initialChances'
  | 'modules.lottery.pityAfter'
  | 'modules.lottery.allowDuplicate'
  | 'modules.lottery.dailyLimit'
  | 'modules.lottery.costPerDraw'
  | 'modules.lottery.template'
  | 'modules.lottery.entryMode'
  | 'modules.lottery.resourceId'
  | 'modules.lottery.resetCycle'
  | 'modules.lottery.cooldownSeconds'
  | 'modules.lottery.accountDailyLimit'
  | 'modules.lottery.deviceDailyLimit'
  | 'modules.lottery.ipHourlyLimit'

export type LotteryFieldValue = string | number | boolean

export type LotteryPatchPath = LotteryFieldPath | 'cards'

/** P0 对卡池采用集合级所有权：改动任意卡片即接管整个 cards 集合。 */

export type LotteryPatch = SemanticPatch<
  LotteryPatchPath,
  LotteryFieldValue | XiahuaCardDef[]
>

export interface LotteryPatchBatchResult {
  value: XiahuaGameplay
  revision: number
  applied: readonly LotteryPatch[]
  skipped: readonly LotteryPatch[]
  rejected: readonly LotteryPatch[]
  issues: readonly ValidationIssue<LotteryFieldPath>[]
  reason?: 'stale_revision' | 'validation_failed'
}

export type LotteryControl = 'slider' | 'number' | 'select' | 'switch'

export interface LotterySelectOption {
  label: string
  value: string
}

export interface CompiledLotteryField {
  path: LotteryFieldPath
  label: string
  description?: string
  control: LotteryControl
  value: LotteryFieldValue
  min?: number
  max?: number
  step?: number
  suffix?: string
  options?: readonly LotterySelectOption[]
  disabled?: boolean
  owner: 'agent' | 'operator'
}

export interface CompiledLotteryPanel {
  id: LotteryPanelId
  kind: 'custom' | 'fields'
  title: string
  summary: string
  description: string
  defaultOpen: boolean
  fields: readonly CompiledLotteryField[]
}

export interface CompiledLotterySection {
  id: string
  title: string
  description: string
  panels: readonly CompiledLotteryPanel[]
}

export interface CompiledLotteryEditor {
  package: typeof LOTTERY_GAMEPLAY_PACKAGE
  sections: readonly CompiledLotterySection[]
  issues: readonly ValidationIssue<LotteryFieldPath>[]
}

type LotteryPanelId =
  | 'content-pool'
  | 'probability'
  | 'pity'
  | 'draw-limits'
  | 'entry'
  | 'risk'

interface LotteryPanelRecipe {
  id: LotteryPanelId
  kind: 'custom' | 'fields'
  defaultOpen?: boolean
  fields?: readonly LotteryFieldPath[]
}

interface LotterySectionRecipe {
  id: string
  title: string
  description: string
  panels: readonly LotteryPanelRecipe[]
}

export const LOTTERY_GAMEPLAY_PACKAGE = {
  manifest: {
    id: 'gameplay.lottery',
    name: '抽奖玩法包',
    version: '1.0.0',
    category: '抽奖',
    owner: '活动玩法平台',
    compatibleSurfaces: ['抖音 H5', 'Lynx', 'Web Preview'],
    runtimeAdapters: ['douyin-h5@1', 'lynx-activity@1', 'web-preview@1'],
    status: 'stable',
  } satisfies GameplayPackageManifest,
  ports: {
    inputs: [{ id: 'draw_chance', label: '抽奖机会', accepts: ['task_reward', 'initial_grant', 'activity_points'] }],
    outputs: [{ id: 'collectible_card', label: '卡片', consumedBy: ['collection'] }],
  },
  assetSlots: [
    { id: 'content-card-art', label: '抽取内容卡面', multiple: true, required: true },
    { id: 'draw-button', label: '抽奖按钮', multiple: false, required: true },
    { id: 'result-animation', label: '结果动效', multiple: false, required: false },
  ],
  editorRecipe: [
    {
      id: 'content',
      title: '抽取内容',
      description: '先确定一次抽奖会返回什么内容，再配置这些内容之间的出奖规则。',
      panels: [{ id: 'content-pool', kind: 'custom' }],
    },
    {
      id: 'distribution',
      title: '出奖规则',
      description: '控制新卡与重复卡的比例，以及连续未出新卡时的保底。',
      panels: [
        { id: 'probability', kind: 'custom' },
        {
          id: 'pity',
          kind: 'fields',
          fields: ['modules.lottery.pityAfter', 'modules.lottery.allowDuplicate'],
        },
      ],
    },
    {
      id: 'participation',
      title: '参与规则',
      description: '配置用户如何进入抽奖、每次消耗多少，以及每天最多参与多少次。',
      panels: [
        {
          id: 'draw-limits',
          kind: 'fields',
          fields: [
            'draw.initialChances',
            'modules.lottery.dailyLimit',
            'modules.lottery.costPerDraw',
          ],
        },
        {
          id: 'entry',
          kind: 'fields',
          fields: [
            'modules.lottery.template',
            'modules.lottery.entryMode',
            'modules.lottery.resourceId',
          ],
        },
      ],
    },
    {
      id: 'risk',
      title: '风险控制',
      description: '业务次数之外的账号、设备和网络频控，仅在异常参与时生效。',
      panels: [
        {
          id: 'risk',
          kind: 'fields',
          fields: [
            'modules.lottery.resetCycle',
            'modules.lottery.cooldownSeconds',
            'modules.lottery.accountDailyLimit',
            'modules.lottery.deviceDailyLimit',
            'modules.lottery.ipHourlyLimit',
          ],
        },
      ],
    },
  ] satisfies readonly LotterySectionRecipe[],
  migration: { currentSchemaVersion: 1, acceptsFrom: [1] },
} as const

function lotteryModule(value: XiahuaGameplay) {
  return (value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES).lottery
}

function compileField(
  path: LotteryFieldPath,
  value: XiahuaGameplay,
  operatorOwnedPaths: ReadonlySet<LotteryPatchPath>,
): CompiledLotteryField {
  const lottery = lotteryModule(value)
  const owner = operatorOwnedPaths.has(path) ? 'operator' : 'agent'
  switch (path) {
    case 'draw.initialChances':
      return { path, owner, label: '初始抽奖次数', control: 'slider', value: value.draw.initialChances, min: 0, max: 30, suffix: ' 次' }
    case 'draw.newCardBias':
      return { path, owner, label: '优先新卡', control: 'slider', value: value.draw.newCardBias, min: 0, max: 1, step: 0.01 }
    case 'modules.lottery.pityAfter':
      return {
        path,
        owner,
        label: '连续重复保底',
        control: 'slider',
        value: lottery.pityAfter,
        min: 2,
        max: 12,
        suffix: ' 抽',
        description: `连续 ${lottery.pityAfter} 抽没有新卡时，下一抽必出未获得卡。`,
      }
    case 'modules.lottery.allowDuplicate':
      return {
        path,
        owner,
        label: '允许抽到重复卡',
        control: 'switch',
        value: lottery.allowDuplicate,
        description: '关闭后只从未拥有卡片中抽取；集齐后停止继续抽卡。',
      }
    case 'modules.lottery.dailyLimit':
      return { path, owner, label: '每日抽奖上限', control: 'slider', value: lottery.dailyLimit, min: 1, max: 50, suffix: ' 次' }
    case 'modules.lottery.costPerDraw':
      return { path, owner, label: '单次消耗', control: 'slider', value: lottery.costPerDraw, min: 1, max: 5, suffix: ' 机会' }
    case 'modules.lottery.template':
      return {
        path,
        owner,
        label: '交互模板',
        control: 'select',
        value: lottery.template,
        options: [
          { label: '抽卡', value: 'card' },
          { label: '九宫格', value: 'grid' },
          { label: '转盘', value: 'wheel' },
          { label: '通用列表', value: 'list' },
        ],
      }
    case 'modules.lottery.entryMode':
      return {
        path,
        owner,
        label: '参与消耗',
        control: 'select',
        value: lottery.entryMode,
        options: [
          { label: '免费', value: 'free' },
          { label: '抽奖机会', value: 'chance' },
          { label: '代币', value: 'token' },
          { label: '积分', value: 'points' },
        ],
      }
    case 'modules.lottery.resourceId':
      return {
        path,
        owner,
        label: '机会来源',
        control: 'select',
        value: lottery.resourceId,
        disabled: lottery.entryMode === 'free',
        options: [
          { label: '完成活动任务获得', value: 'draw_chance_night_food' },
          { label: '仅使用首次赠送次数', value: 'activity_initial_chance' },
          { label: '消耗活动积分兑换', value: 'activity_points' },
        ],
      }
    case 'modules.lottery.resetCycle':
      return {
        path,
        owner,
        label: '次数重置',
        control: 'select',
        value: lottery.resetCycle,
        options: [
          { label: '每日重置', value: 'daily' },
          { label: '活动期累计', value: 'activity' },
        ],
      }
    case 'modules.lottery.cooldownSeconds':
      return { path, owner, label: '抽奖冷却', control: 'number', value: lottery.cooldownSeconds, min: 0, suffix: ' 秒' }
    case 'modules.lottery.accountDailyLimit':
      return { path, owner, label: '账号日上限', control: 'number', value: lottery.accountDailyLimit, min: 1, suffix: ' 次' }
    case 'modules.lottery.deviceDailyLimit':
      return { path, owner, label: '设备日上限', control: 'number', value: lottery.deviceDailyLimit, min: 1, suffix: ' 次' }
    case 'modules.lottery.ipHourlyLimit':
      return { path, owner, label: 'IP 小时上限', control: 'number', value: lottery.ipHourlyLimit, min: 1, suffix: ' 次' }
  }
}

function panelCopy(id: LotteryPanelId, value: XiahuaGameplay) {
  const lottery = lotteryModule(value)
  const newCardPercent = Math.round(value.draw.newCardBias * 100)
  const enabledCards = value.cards.filter((card) => card.enabled !== false)
  switch (id) {
    case 'content-pool':
      return {
        title: '夜食卡池',
        summary: `${enabledCards.length} 张卡片参与抽取 · 结果进入夜食卡册`,
        description: '维护每次抽卡可能返回的卡片、基础权重和卡面素材。',
      }
    case 'probability':
      return {
        title: '新卡与重复卡',
        summary: `新卡优先 ${newCardPercent}% · 重复卡 ${100 - newCardPercent}% · 支持抽样模拟`,
        description: '先根据用户持有状态选择新卡池或重复卡池，再在对应分池内按卡片权重归一化。',
      }
    case 'pity':
      return {
        title: '重复卡保底',
        summary: `${lottery.allowDuplicate ? '允许抽到重复卡' : '不允许重复卡'} · 连续 ${lottery.pityAfter} 抽未出新卡时保底`,
        description: '保底只影响仍有未获得卡片的用户，不改变卡片库存与兑换奖励。',
      }
    case 'draw-limits':
      return {
        title: '抽取次数',
        summary: `首次赠送 ${value.draw.initialChances} 次 · 每抽消耗 ${lottery.costPerDraw} 次机会 · 每日最多 ${lottery.dailyLimit} 抽`,
        description: '控制用户的初始资源、单次成本和每日业务上限。',
      }
    case 'entry':
      return {
        title: '参与方式',
        summary: `${lottery.template === 'card' ? '抽卡' : lottery.template === 'grid' ? '九宫格' : lottery.template === 'wheel' ? '转盘' : '列表'}形态 · ${lottery.entryMode === 'free' ? '免费参与' : lottery.resourceId === 'draw_chance_night_food' ? '任务提供机会' : lottery.resourceId === 'activity_points' ? '活动积分兑换' : '仅首次赠送'}`,
        description: '确定用户看到哪种交互形态，以及抽奖消耗从哪里获得。',
      }
    case 'risk':
      return {
        title: '频控与风险阈值',
        summary: `账号 ${lottery.accountDailyLimit} 次/日 · 设备 ${lottery.deviceDailyLimit} 次/日 · IP ${lottery.ipHourlyLimit} 次/小时`,
        description: '业务次数和风险频控分开计算；命中任一上限即拒绝本次抽取。',
      }
  }
}

export function validateLotteryGameplay(
  value: XiahuaGameplay,
): ValidationIssue<LotteryFieldPath>[] {
  const lottery = lotteryModule(value)
  const enabledCards = value.cards.filter((card) => card.enabled !== false)
  const totalWeight = enabledCards.reduce((total, card) => total + Math.max(0, card.weight ?? 100), 0)
  const issues: ValidationIssue<LotteryFieldPath>[] = []

  if (enabledCards.length === 0) {
    issues.push({ code: 'lottery.empty_pool', severity: 'error', message: '至少启用一张卡片后才能保存抽奖玩法。' })
  } else if (totalWeight <= 0) {
    issues.push({ code: 'lottery.zero_weight', severity: 'error', message: '生效卡片的基础权重合计必须大于 0。' })
  }
  if (value.draw.newCardBias < 0 || value.draw.newCardBias > 1) {
    issues.push({ code: 'lottery.bias_range', path: 'draw.newCardBias', severity: 'error', message: '新卡倾斜必须在 0%–100% 之间。' })
  }
  if (lottery.accountDailyLimit < lottery.dailyLimit) {
    issues.push({ code: 'lottery.account_below_business', path: 'modules.lottery.accountDailyLimit', severity: 'warning', message: '账号风控上限低于业务日上限，用户会先命中风控。' })
  }
  if (lottery.deviceDailyLimit < lottery.accountDailyLimit) {
    issues.push({ code: 'lottery.device_below_account', path: 'modules.lottery.deviceDailyLimit', severity: 'warning', message: '设备日上限低于账号日上限，请确认是否符合风控预期。' })
  }
  if (lottery.pityAfter > lottery.dailyLimit) {
    issues.push({ code: 'lottery.pity_unreachable_daily', path: 'modules.lottery.pityAfter', severity: 'warning', message: '保底次数高于每日抽奖上限，单日内无法触发。' })
  }
  if (lottery.resourceId === 'draw_chance_night_food' && !(value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES).enabled.includes('tasks')) {
    issues.push({ code: 'lottery.missing_task_source', path: 'modules.lottery.resourceId', severity: 'error', message: '当前机会来源是活动任务，但任务玩法尚未启用。' })
  }
  if (enabledCards.some((card) => !card.assetKey)) {
    issues.push({ code: 'lottery.missing_card_asset', severity: 'warning', message: '部分生效卡片尚未绑定卡面素材，试玩会显示占位内容。' })
  }
  return issues
}

export function compileLotteryEditor(
  value: XiahuaGameplay,
  operatorOwnedPaths: ReadonlySet<LotteryPatchPath> = new Set(),
): CompiledLotteryEditor {
  const recipe: readonly LotterySectionRecipe[] =
    LOTTERY_GAMEPLAY_PACKAGE.editorRecipe
  return {
    package: LOTTERY_GAMEPLAY_PACKAGE,
    sections: recipe.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      panels: section.panels.map((panel) => ({
        id: panel.id,
        kind: panel.kind,
        ...panelCopy(panel.id, value),
        defaultOpen: panel.defaultOpen ?? true,
        fields: (panel.fields ?? []).map((path) => compileField(path, value, operatorOwnedPaths)),
      })),
    })),
    issues: validateLotteryGameplay(value),
  }
}

export function applyLotteryPatch(value: XiahuaGameplay, patch: LotteryPatch): XiahuaGameplay {
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const lottery = modules.lottery
  switch (patch.path) {
    case 'cards':
      return { ...value, cards: patch.value as XiahuaCardDef[] }
    case 'draw.newCardBias':
      return { ...value, draw: { ...value.draw, newCardBias: Number(patch.value) } }
    case 'draw.initialChances':
      return { ...value, draw: { ...value.draw, initialChances: Number(patch.value) } }
    case 'modules.lottery.allowDuplicate':
      return { ...value, modules: { ...modules, lottery: { ...lottery, allowDuplicate: Boolean(patch.value) } } }
    case 'modules.lottery.pityAfter':
      return { ...value, modules: { ...modules, lottery: { ...lottery, pityAfter: Number(patch.value) } } }
    case 'modules.lottery.dailyLimit':
      return { ...value, modules: { ...modules, lottery: { ...lottery, dailyLimit: Number(patch.value) } } }
    case 'modules.lottery.costPerDraw':
      return { ...value, modules: { ...modules, lottery: { ...lottery, costPerDraw: Number(patch.value) } } }
    case 'modules.lottery.template':
      return { ...value, modules: { ...modules, lottery: { ...lottery, template: patch.value as typeof lottery.template } } }
    case 'modules.lottery.entryMode':
      return { ...value, modules: { ...modules, lottery: { ...lottery, entryMode: patch.value as typeof lottery.entryMode } } }
    case 'modules.lottery.resourceId':
      return { ...value, modules: { ...modules, lottery: { ...lottery, resourceId: String(patch.value) } } }
    case 'modules.lottery.resetCycle':
      return { ...value, modules: { ...modules, lottery: { ...lottery, resetCycle: patch.value as typeof lottery.resetCycle } } }
    case 'modules.lottery.cooldownSeconds':
      return { ...value, modules: { ...modules, lottery: { ...lottery, cooldownSeconds: Number(patch.value) } } }
    case 'modules.lottery.accountDailyLimit':
      return { ...value, modules: { ...modules, lottery: { ...lottery, accountDailyLimit: Number(patch.value) } } }
    case 'modules.lottery.deviceDailyLimit':
      return { ...value, modules: { ...modules, lottery: { ...lottery, deviceDailyLimit: Number(patch.value) } } }
    case 'modules.lottery.ipHourlyLimit':
      return { ...value, modules: { ...modules, lottery: { ...lottery, ipHourlyLimit: Number(patch.value) } } }
  }
}

export function applyLotteryPatchBatch(
  value: XiahuaGameplay,
  patches: readonly LotteryPatch[],
  currentRevision: number,
  operatorOwnedPaths: ReadonlySet<LotteryPatchPath>,
): LotteryPatchBatchResult {
  if (patches.some((patch) => patch.baseRevision !== currentRevision)) {
    return {
      value,
      revision: currentRevision,
      applied: [],
      skipped: [],
      rejected: patches,
      issues: [],
      reason: 'stale_revision',
    }
  }

  const baselineErrorKeys = new Set(
    validateLotteryGameplay(value)
      .filter((issue) => issue.severity === 'error')
      .map((issue) => `${issue.code}:${issue.path ?? ''}`),
  )
  const applied: LotteryPatch[] = []
  const skipped: LotteryPatch[] = []
  let draft = value
  patches.forEach((patch) => {
    if (patch.actor !== 'operator' && operatorOwnedPaths.has(patch.path)) {
      skipped.push(patch)
      return
    }
    draft = applyLotteryPatch(draft, patch)
    applied.push(patch)
  })

  const issues = validateLotteryGameplay(draft)
  const introducedErrors = issues.filter(
    (issue) =>
      issue.severity === 'error' &&
      !baselineErrorKeys.has(`${issue.code}:${issue.path ?? ''}`),
  )
  if (introducedErrors.length > 0) {
    return {
      value,
      revision: currentRevision,
      applied: [],
      skipped,
      rejected: applied,
      issues,
      reason: 'validation_failed',
    }
  }

  return {
    value: draft,
    revision: applied.length ? currentRevision + 1 : currentRevision,
    applied,
    skipped,
    rejected: [],
    issues,
  }
}

function readLotteryPatchValue(
  value: XiahuaGameplay,
  path: LotteryPatchPath,
): LotteryPatch['value'] | undefined {
  const lottery = lotteryModule(value)
  switch (path) {
    case 'cards': return value.cards
    case 'draw.newCardBias': return value.draw.newCardBias
    case 'draw.initialChances': return value.draw.initialChances
    case 'modules.lottery.pityAfter': return lottery.pityAfter
    case 'modules.lottery.allowDuplicate': return lottery.allowDuplicate
    case 'modules.lottery.dailyLimit': return lottery.dailyLimit
    case 'modules.lottery.costPerDraw': return lottery.costPerDraw
    case 'modules.lottery.template': return lottery.template
    case 'modules.lottery.entryMode': return lottery.entryMode
    case 'modules.lottery.resourceId': return lottery.resourceId
    case 'modules.lottery.resetCycle': return lottery.resetCycle
    case 'modules.lottery.cooldownSeconds': return lottery.cooldownSeconds
    case 'modules.lottery.accountDailyLimit': return lottery.accountDailyLimit
    case 'modules.lottery.deviceDailyLimit': return lottery.deviceDailyLimit
    case 'modules.lottery.ipHourlyLimit': return lottery.ipHourlyLimit
  }
}

export function rebaseGeneratedLotteryGameplay(
  current: XiahuaGameplay,
  generated: XiahuaGameplay,
): XiahuaGameplay {
  const currentRevision = current.meta?.revision ?? 12
  const ownedPaths = (current.meta?.operatorOwnedPaths ?? []) as LotteryPatchPath[]
  const rebased = ownedPaths.reduce((draft, path) => {
    const ownedValue = readLotteryPatchValue(current, path)
    if (ownedValue === undefined) return draft
    return applyLotteryPatch(draft, {
      op: 'replace',
      path,
      value: ownedValue,
      actor: 'operator',
      reason: '重生成后重放运营人工接管值',
      baseRevision: currentRevision,
    })
  }, generated)

  return {
    ...rebased,
    meta: {
      revision: currentRevision + 1,
      source: generated.meta?.source ?? current.meta?.source ?? 'Agent 重生成',
      generatedAt: new Date().toISOString(),
      generationBasisIds:
        generated.meta?.generationBasisIds ?? current.meta?.generationBasisIds ?? [],
      operatorOwnedPaths: ownedPaths,
    },
  }
}
