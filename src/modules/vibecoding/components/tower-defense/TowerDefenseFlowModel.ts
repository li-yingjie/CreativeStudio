import {
  createDefaultTowerDefenseBalanceProfile,
  type TowerDefenseBalanceProfile,
} from './TowerDefenseBalanceModel'

export type TowerDefenseStage =
  | 'gameplay'
  | 'art-direction'
  | 'asset-production'
  | 'ui-generation'
  | 'balance'

export const TOWER_DEFENSE_PROJECT_NAME = '暮光防线'

export const TOWER_DEFENSE_STAGE_ORDER = [
  'gameplay',
  'art-direction',
  'asset-production',
  'ui-generation',
  'balance',
] as const satisfies readonly TowerDefenseStage[]

export function getTowerDefenseStageIndex(stage: TowerDefenseStage): number {
  return TOWER_DEFENSE_STAGE_ORDER.indexOf(stage)
}

export function advanceTowerDefenseStage(
  current: TowerDefenseStage,
  next: TowerDefenseStage,
): TowerDefenseStage {
  return getTowerDefenseStageIndex(next) > getTowerDefenseStageIndex(current)
    ? next
    : current
}

export interface TowerDefenseStageMeta {
  id: TowerDefenseStage
  index: number
  label: string
  description: string
}

export const TOWER_DEFENSE_STAGES: readonly TowerDefenseStageMeta[] = [
  { id: 'gameplay', index: 1, label: '玩法配置', description: '试玩几何体 Demo，验证核心循环' },
  { id: 'art-direction', index: 2, label: '游戏美术设定', description: '统一世界观与全量资产视觉' },
  { id: 'asset-production', index: 3, label: '游戏资产制作', description: '按状态、方向和帧数生产可用素材' },
  { id: 'ui-generation', index: 4, label: '游戏 UI 生成', description: '生成并分拆调整游戏界面' },
  { id: 'balance', index: 5, label: '试玩与平衡性', description: '在成品对局中完成数值收敛' },
]

export interface FastGameplayConfig {
  waveSize: number
  waveInterval: number
  startingCoins: number
  baseHealth: number
  towerCost: number
  towerDamage: number
  enemyHealth: number
  enemySpeed: number
}

export type TowerArchetypeId = 'rapid' | 'frost' | 'cannon'

export interface TowerArchetype {
  id: TowerArchetypeId
  name: string
  shortName: string
  costMultiplier: number
  damageMultiplier: number
  attackInterval: number
  accent: string
}

export const TOWER_ARCHETYPES: readonly TowerArchetype[] = [
  { id: 'rapid', name: '连射塔', shortName: '连', costMultiplier: 1, damageMultiplier: 0.75, attackInterval: 0.55, accent: '#54D6A4' },
  { id: 'frost', name: '冰霜塔', shortName: '冰', costMultiplier: 1.2, damageMultiplier: 0.9, attackInterval: 0.9, accent: '#74A9FF' },
  { id: 'cannon', name: '轰击塔', shortName: '轰', costMultiplier: 1.5, damageMultiplier: 1.65, attackInterval: 1.35, accent: '#FFB45C' },
]

export interface TowerSlot {
  id: string
  label: string
  /** Percentage position inside the playable map. */
  x: number
  /** Percentage position inside the playable map. */
  y: number
  occupiedBy: TowerArchetypeId | null
  level: number
}

export type TowerDefenseAssetCategory =
  | 'visual-style'
  | 'map'
  | 'hero'
  | 'enemy'
  | 'tower'

export type TowerDefenseDirection = 'front' | 'back' | 'left' | 'right' | 'none'

export type SpriteLoopMode = 'loop' | 'once' | 'ping-pong'

export type AssetStateStatus =
  | 'empty'
  | 'queued'
  | 'generating'
  | 'review'
  | 'completed'
  | 'failed'

export type BaseVisualStatus = 'draft' | 'confirmed'

export interface TowerDefenseAssetState {
  id: string
  name: string
  directions: TowerDefenseDirection[]
  framesPerDirection: number
  /** Optional for older saved drafts; reconciliation fills the runtime default. */
  fps?: number
  /** Optional for older saved drafts; reconciliation infers it from the state. */
  loopMode?: SpriteLoopMode
  status: AssetStateStatus
}

export interface TowerDefenseAsset {
  id: string
  name: string
  category: TowerDefenseAssetCategory
  role: string
  description: string
  accent: string
  baseVisualStatus: BaseVisualStatus
  selectedVisualVersion?: number
  visualVersions?: Array<{ id: string; src: string; width: number; height: number }>
  states: TowerDefenseAssetState[]
}

export type SpriteTaskStatus = 'queued' | 'generating' | 'review' | 'completed' | 'failed'

export interface SpriteTaskOutput {
  previewUrl?: string
  spriteSheetUrl?: string
  metadataUrl?: string
  width?: number
  height?: number
}

export interface SpriteTask {
  id: string
  assetId: string
  stateId: string
  direction: TowerDefenseDirection
  label: string
  status: SpriteTaskStatus
  progress: number
  frameCount: number
  /** Optional so persisted tasks created before the animation spec remain valid. */
  fps?: number
  /** Optional so persisted tasks created before the animation spec remain valid. */
  loopMode?: SpriteLoopMode
  output?: SpriteTaskOutput
  error?: string
}

export interface ReconcileSpriteTasksOptions {
  defaultFps?: number
  defaultLoopMode?: SpriteLoopMode
  initialStatus?: SpriteTaskStatus
}

export type TowerDefenseUiComponentId =
  | 'battle-hud'
  | 'wave-progress'
  | 'tower-dock'
  | 'battle-controls'
  | 'result-panel'

export type UiEmphasis = 'quiet' | 'standard' | 'strong'

export interface TowerDefenseUiComponentConfig {
  id: TowerDefenseUiComponentId
  name: string
  description: string
  visible: boolean
  emphasis: UiEmphasis
  scale: number
}

export interface TowerDefenseUiConfig {
  visualPreset: 'night-watch' | 'forest-signal' | 'paper-kingdom'
  selectedComponentId: TowerDefenseUiComponentId
  compactMode: boolean
  cornerRadius: number
  components: TowerDefenseUiComponentConfig[]
}

export interface TowerDefenseBalanceConfig {
  towerDamageMultiplier: number
  towerFireRateMultiplier: number
  enemyHealthMultiplier: number
  enemySpeedMultiplier: number
  startingCoins: number
  waveGrowth: number
  bossEvery: number
  profile?: TowerDefenseBalanceProfile
}

export interface TowerDefenseFlowState {
  stage: TowerDefenseStage
  furthestStageReached: TowerDefenseStage
  prompt: string
  gameplay: FastGameplayConfig
  selectedTower: TowerArchetypeId
  towerSlots: TowerSlot[]
  assets: TowerDefenseAsset[]
  tasks: SpriteTask[]
  ui: TowerDefenseUiConfig
  balance: TowerDefenseBalanceConfig
}

const FOUR_DIRECTIONS: TowerDefenseDirection[] = ['front', 'back', 'left', 'right']
const SINGLE_DIRECTION: TowerDefenseDirection[] = ['none']

function defaultStateFps(stateId: string) {
  if (stateId === 'attack' || stateId === 'cast' || stateId === 'trigger') return 14
  if (stateId === 'hit') return 16
  return 12
}

function defaultStateLoopMode(stateId: string): SpriteLoopMode {
  return stateId === 'idle' || stateId === 'move' || stateId === 'loop'
    ? 'loop'
    : 'once'
}

function assetState(
  id: string,
  name: string,
  framesPerDirection: number,
  directions: TowerDefenseDirection[] = FOUR_DIRECTIONS,
): TowerDefenseAssetState {
  return {
    id,
    name,
    directions: [...directions],
    framesPerDirection,
    fps: defaultStateFps(id),
    loopMode: defaultStateLoopMode(id),
    status: 'empty',
  }
}

function createDefaultAssets(): TowerDefenseAsset[] {
  const visualVersions = (folder: string, dimensions: Array<[number, number]>) =>
    dimensions.map(([width, height], index) => ({ id: `v${index + 1}`, src: `/assets/tower-defense-demo/${folder}/v${index + 1}.webp`, width, height }))
  const cutoutVersion = (id: string, width: number, height: number) => ({
    id,
    src: `/assets/tower-defense-demo/characters/${id}.png`,
    width,
    height,
  })
  const dynamicStates = () => [assetState('idle', '待机', 8), assetState('move', '移动', 8), assetState('attack', '攻击', 10), assetState('hit', '受击', 6), assetState('death', '死亡', 10)]
  const towerStates = () => [assetState('idle', '待机', 8, SINGLE_DIRECTION), assetState('attack', '攻击', 10, SINGLE_DIRECTION), assetState('upgrade', '升级', 12, SINGLE_DIRECTION)]
  const asset = (value: Omit<TowerDefenseAsset, 'baseVisualStatus'>): TowerDefenseAsset => ({ ...value, baseVisualStatus: 'draft' })
  return [
    asset({ id: 'visual-world-style', name: '视觉风格', category: 'visual-style', role: '世界观与核心战场视觉', description: '全项目统一视觉风格与核心战场大图来源。', accent: '#9A6B43', visualVersions: visualVersions('visual-style/world-style', [[1536,2752],[937,1678],[2752,1536],[2752,1536]]), states: [] }),
    asset({ id: 'map-battlefield', name: '地图', category: 'map', role: '战场地图', description: '塔防关卡地图候选方案。', accent: '#6B7864', visualVersions: visualVersions('map/battle-map', [[670,1200],[1200,675],[670,1200],[1200,670]]), states: [] }),
    asset({ id: 'hero-lvbu', name: '吕布', category: 'hero', role: '主控英雄', description: '英雄吕布的基础视觉候选。', accent: '#B87A42', visualVersions: [cutoutVersion('hero-lvbu-cutout', 899, 725), ...visualVersions('hero/lvbu', [[1200,670],[1200,1148],[1200,670]])], states: dynamicStates() }),
    asset({ id: 'enemy-xiliang-soldier', name: '西凉小兵', category: 'enemy', role: '基础敌人', description: '基础近战兵种。', accent: '#71806B', visualVersions: [cutoutVersion('enemy-xiliang-soldier-cutout', 454, 633), ...visualVersions('enemy/xiliang-soldier', [[2752,1536],[2752,1536]])], states: dynamicStates() }),
    asset({ id: 'enemy-xiliang-blade', name: '西凉刀兵', category: 'enemy', role: '近战敌人', description: '高伤害近战兵种。', accent: '#7C6655', visualVersions: visualVersions('enemy/xiliang-blade', [[1024,1024],[2752,1536]]), states: dynamicStates() }),
    asset({ id: 'enemy-xiliang-mage', name: '西凉术士', category: 'enemy', role: '远程敌人', description: '远程法术兵种。', accent: '#70658C', visualVersions: [cutoutVersion('enemy-xiliang-mage-cutout', 627, 768), ...visualVersions('enemy/xiliang-mage', [[2752,1536],[2752,1536]])], states: dynamicStates() }),
    asset({ id: 'enemy-heavy-guard', name: '重甲兵', category: 'enemy', role: '重装敌人', description: '高生命、高护甲的前排单位。', accent: '#66584D', visualVersions: [cutoutVersion('enemy-heavy-guard-cutout', 901, 992)], states: dynamicStates() }),
    asset({ id: 'enemy-xiliang-hawk', name: '西凉飞鹰', category: 'enemy', role: '空中敌人', description: '快速飞行单位。', accent: '#7D8990', visualVersions: visualVersions('enemy/xiliang-hawk', [[2400,1792],[2048,2048],[2048,2048]]), states: dynamicStates() }),
    asset({ id: 'enemy-guanyu', name: '敌方英雄-关羽', category: 'enemy', role: '敌方英雄', description: '精英首领单位。', accent: '#8A624D', visualVersions: visualVersions('enemy/guanyu', [[2048,2048],[2048,2048]]), states: dynamicStates() }),
    asset({ id: 'tower-advisor', name: '军师台', category: 'tower', role: '辅助建筑塔', description: '提供战场增益。', accent: '#8A735F', visualVersions: visualVersions('tower/advisor-tower', [[2400,1792],[2400,1792],[2400,1792]]), states: towerStates() }),
    asset({ id: 'tower-fire-oil', name: '火油营', category: 'tower', role: '范围伤害塔', description: '持续范围输出。', accent: '#A65E3C', visualVersions: visualVersions('tower/fire-oil-tower', [[1200,1200],[1200,896],[1200,896]]), states: towerStates() }),
    asset({ id: 'tower-arrow', name: '箭塔', category: 'tower', role: '基础攻击塔', description: '稳定单体输出。', accent: '#7A8161', visualVersions: visualVersions('tower/arrow-tower', [[1200,1200],[1200,896],[1200,896]]), states: towerStates() }),
    asset({ id: 'tower-lookout', name: '瞭望塔', category: 'tower', role: '远程侦察塔', description: '扩大攻击与侦察范围。', accent: '#71858A', visualVersions: visualVersions('tower/lookout-tower', [[2400,1792],[2400,1792],[2400,1792],[2400,1792]]), states: towerStates() }),
    asset({ id: 'tower-crossbow', name: '重弩营', category: 'tower', role: '重型攻击塔', description: '高伤害低攻速建筑。', accent: '#665F58', visualVersions: visualVersions('tower/crossbow-tower', [[2400,1792],[2400,1792],[2400,1792],[2400,1792]]), states: towerStates() }),
  ]
}

export function getTowerDefenseSpriteTaskKey(
  assetId: string,
  stateId: string,
  direction: TowerDefenseDirection,
): string {
  return `${assetId}::${stateId}::${direction}`
}

const DEMO_SPRITE_OUTPUT_COUNTS: Record<string, number> = {
  'hero-lvbu': 6,
  'enemy-xiliang-soldier': 4,
  'enemy-xiliang-mage': 4,
  'enemy-xiliang-hawk': 2,
  'enemy-guanyu': 4,
  'enemy-xiliang-blade': 2,
  'tower-crossbow': 1,
  'tower-lookout': 2,
  'tower-arrow': 2,
  'tower-fire-oil': 3,
  'tower-advisor': 3,
}

/** Maps the supplied demo sprite sheets onto each planned state cell. */
export function getTowerDefenseDemoSpriteOutput(task: Pick<SpriteTask, 'assetId' | 'stateId' | 'direction'>): SpriteTaskOutput | undefined {
  const count = DEMO_SPRITE_OUTPUT_COUNTS[task.assetId]
  if (!count) return undefined
  const seed = `${task.stateId}:${task.direction}`
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)
  const index = (seed % count) + 1
  const previewUrl = `/assets/tower-defense-demo/generated-sprites/${task.assetId}/${String(index).padStart(2, '0')}.webp`
  return { previewUrl, spriteSheetUrl: previewUrl }
}

/**
 * Rebuilds the production queue from the current asset specification while
 * carrying forward runtime state for tasks that still describe the same cell.
 */
export function reconcileTowerDefenseSpriteTasks(
  assets: readonly TowerDefenseAsset[],
  existingTasks: readonly SpriteTask[],
  options: ReconcileSpriteTasksOptions = {},
): SpriteTask[] {
  const existingByKey = new Map<string, SpriteTask>()
  for (const task of existingTasks) {
    const key = getTowerDefenseSpriteTaskKey(
      task.assetId,
      task.stateId,
      task.direction,
    )
    if (!existingByKey.has(key)) existingByKey.set(key, task)
  }

  const reconciled: SpriteTask[] = []
  for (const asset of assets) {
    if (asset.category === 'map') continue

    for (const state of asset.states) {
      const directions = Array.from(new Set(state.directions))
      for (const direction of directions) {
        const semanticKey = getTowerDefenseSpriteTaskKey(
          asset.id,
          state.id,
          direction,
        )
        const existing = existingByKey.get(semanticKey)
        reconciled.push({
          ...existing,
          id: existing?.id || semanticKey,
          assetId: asset.id,
          stateId: state.id,
          direction,
          label: `${asset.name} · ${state.name}`,
          status: existing?.status ?? options.initialStatus ?? 'queued',
          progress: existing?.progress ?? 0,
          frameCount: state.framesPerDirection,
          fps: state.fps ?? options.defaultFps ?? defaultStateFps(state.id),
          loopMode:
            state.loopMode
            ?? options.defaultLoopMode
            ?? defaultStateLoopMode(state.id),
        })
      }
    }
  }

  return reconciled
}

export function getTowerDefenseDirectionLabel(direction: TowerDefenseDirection): string {
  return {
    front: '正面',
    back: '背面',
    left: '向左',
    right: '向右',
    none: '单向',
  }[direction]
}

export function createDefaultTowerDefenseFlowState(): TowerDefenseFlowState {
  return {
    stage: 'gameplay',
    furthestStageReached: 'gameplay',
    prompt: '做一个守护月光灯塔的暗夜森林塔防游戏，节奏轻快，适合单手游玩。',
    gameplay: {
      waveSize: 8,
      waveInterval: 22,
      startingCoins: 500,
      baseHealth: 10,
      towerCost: 80,
      towerDamage: 24,
      enemyHealth: 72,
      enemySpeed: 1,
    },
    selectedTower: 'rapid',
    towerSlots: [
      { id: 'slot-1', label: '01', x: 30, y: 23, occupiedBy: null, level: 1 },
      { id: 'slot-2', label: '02', x: 69, y: 31, occupiedBy: null, level: 1 },
      { id: 'slot-3', label: '03', x: 42, y: 48, occupiedBy: null, level: 1 },
      { id: 'slot-4', label: '04', x: 74, y: 60, occupiedBy: null, level: 1 },
      { id: 'slot-5', label: '05', x: 29, y: 70, occupiedBy: null, level: 1 },
      { id: 'slot-6', label: '06', x: 61, y: 84, occupiedBy: null, level: 1 },
    ],
    assets: createDefaultAssets(),
    tasks: [],
    ui: {
      visualPreset: 'night-watch',
      selectedComponentId: 'battle-hud',
      compactMode: false,
      cornerRadius: 14,
      components: [
        { id: 'battle-hud', name: '战斗 HUD', description: '基地生命、金币与关卡信息', visible: true, emphasis: 'standard', scale: 100 },
        { id: 'wave-progress', name: '波次进度', description: '当前波次和来敌进度', visible: true, emphasis: 'quiet', scale: 100 },
        { id: 'tower-dock', name: '防御塔卡组', description: '可建造塔与资源反馈', visible: true, emphasis: 'strong', scale: 100 },
        { id: 'battle-controls', name: '对局控件', description: '倍速、暂停与技能按钮', visible: true, emphasis: 'standard', scale: 100 },
        { id: 'result-panel', name: '结算面板', description: '通关成绩和下一局入口', visible: true, emphasis: 'strong', scale: 100 },
      ],
    },
    balance: {
      towerDamageMultiplier: 1,
      towerFireRateMultiplier: 1,
      enemyHealthMultiplier: 1,
      enemySpeedMultiplier: 1,
      startingCoins: 320,
      waveGrowth: 1.16,
      bossEvery: 5,
      profile: createDefaultTowerDefenseBalanceProfile(),
    },
  }
}
