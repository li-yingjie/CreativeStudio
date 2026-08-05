import { useEffect, useMemo, useState } from 'react'
import {
  hydrateSummerSurfConfigAssets,
  summerSurfConfigForStorage,
} from './summerSurfLocalAssets'
import './SummerSurfH5Preview.css'

export type SummerSurfThemeId = 'summer' | 'night'
type TaskTab = 'draw' | 'energy'
type ModalKind = 'cards' | 'prizes' | 'rules' | 'result' | 'drawing' | null

export type SummerSurfTarget =
  | 'page'
  | 'hero'
  | 'hero.theme'
  | 'hero.actions'
  | 'collection'
  | 'energy'
  | 'tasks'
  | 'topics'
  | 'discovery'

export interface SummerSurfSelection {
  target: SummerSurfTarget
  label: string
  kind: 'section' | 'element'
}

export interface SummerSurfColorConfig {
  page: string
  mapBackground: string
  heroBackground: string
  surface: string
  surfaceText: string
  mutedText: string
  accent: string
  accentText: string
  actionStart: string
  actionEnd: string
  actionShadow: string
  sideAction: string
  sideActionText: string
  tabSurface: string
  tabText: string
  tabActiveSurface: string
  tabActiveText: string
  cardBorder: string
  cardOwned: string
  cardMissing: string
  countBadge: string
}

export type SummerSurfHeroMedia = {
  type: 'image' | 'video'
  src: string
  assetId?: string
  poster?: string
  posterAssetId?: string
  fit?: 'cover' | 'contain'
  position?: string
  sourceWidth?: number
  sourceHeight?: number
}

export type SummerSurfHeroLayer = {
  id: string
  cardId: string
  label: string
  unlockMethod?: 'first-gift' | 'draw' | 'points'
  presentation?: 'image-layer' | 'video-transition' | 'none'
  media?: SummerSurfHeroMedia
  transitionMedia?: SummerSurfHeroMedia
  pointsCost?: number
  embeddedInBase?: boolean
  x: number
  y: number
  width: number
  rotation: number
  zIndex: number
}

export type SummerSurfHeroComposition = {
  enabled: boolean
  initialUnlockedCardIds: string[]
  finalReference?: SummerSurfHeroMedia
  layers: SummerSurfHeroLayer[]
}

export type SummerSurfAssetConfig = {
  mapBackgroundImage?: string
  grandRewardImage?: string
  rewardShelfImage?: string
  actionButtonImage?: string
  tierFrameImage?: string
  cardOwnedFrameImage?: string
  cardMissingFrameImage?: string
}

export type SummerSurfPageNode = {
  id: string
  order: string
  name: string
  route: string
  kind: 'screen' | 'overlay'
  status: 'ready' | 'draft'
}

export type SummerSurfFlowEdge = {
  id: string
  fromPageId: string
  eventKey: string
  targetPageId: string
  navigation: 'push' | 'replace' | 'overlay' | 'back'
  transition: 'fade' | 'slide' | 'none'
}

export interface SummerSurfInspirationConfig {
  image: string
  emoji: string
  eyebrow: string
  title: string
  action: string
  taskId?: string
}

export interface SummerSurfActivityBannerConfig {
  eyebrow: string
  title: string
}

export interface SummerSurfEditConfig {
  activeTheme: SummerSurfThemeId
  campaignName: string
  navLabel: string
  accessibleTitle: string
  heroMedia: SummerSurfHeroMedia
  heroComposition: SummerSurfHeroComposition
  assets: SummerSurfAssetConfig
  pages: SummerSurfPageNode[]
  flowEdges: SummerSurfFlowEdge[]
  drawLabel: string
  collectionEntryLabel: string
  collectionTitle: string
  collectionProgressVerb: string
  cardNoun: string
  missingCardLabel: string
  energyTitle: string
  energyEyebrow: string
  energyDescription: string
  energyCta: string
  energyBadge: string
  energyImage: string
  energyVisual: string
  energyAnnouncement: string
  tasksTitle: string
  drawTabLabel: string
  energyTabLabel: string
  topicsEyebrow: string
  topicsTitle: string
  topicChips: string[]
  discoveryEyebrow: string
  discoveryTitle: string
  activityBanners: SummerSurfActivityBannerConfig[]
  cards: SurfCard[]
  tiers: SurfTier[]
  tasks: SurfTask[]
  inspirationCards: SummerSurfInspirationConfig[]
  venues: typeof VENUES
  colors: SummerSurfColorConfig
}

export type SurfCard = {
  id: string
  name: string
  image?: string
  imageAssetId?: string
  emoji: string
  accent: string
  rarity: '普通' | '稀有'
  imageWidth?: number
  imageHeight?: number
  weight?: number
}

export type SurfTier = {
  id: string
  threshold: number
  amount: string
  title: string
  condition: string
  icon: string
  kind: 'coupon' | 'grand'
  image?: string
  imageAssetId?: string
  imageWidth?: number
  imageHeight?: number
  reward: string
}

export type SurfTask = {
  id: string
  icon: string
  title: string
  description: string
  target: number
  reward: number
  action: string
  repeatable?: boolean
}

const ASSET_ROOT = '/assets/marketing-king'

const CARDS: SurfCard[] = [
  {
    id: 'watergun',
    name: '鲨鲨水枪',
    image: `${ASSET_ROOT}/figma/equipment-water-gun.webp`,
    emoji: '🔫',
    accent: '#39c7ff',
    rarity: '普通',
    imageWidth: 180,
    imageHeight: 156,
    weight: 1,
  },
  {
    id: 'watermelon',
    name: '冰镇西瓜',
    image: `${ASSET_ROOT}/figma/equipment-watermelon-bucket.webp`,
    emoji: '🍉',
    accent: '#77e36b',
    rarity: '普通',
    imageWidth: 180,
    imageHeight: 179,
    weight: 1,
  },
  {
    id: 'surfboard',
    name: '顺风冲浪板',
    image: `${ASSET_ROOT}/figma/equipment-paddle-board.webp`,
    emoji: '🏄',
    accent: '#ffd84d',
    rarity: '普通',
    imageWidth: 93,
    imageHeight: 180,
    weight: 1,
  },
  {
    id: 'palmtree',
    name: '海岛椰树',
    image: `${ASSET_ROOT}/figma/equipment-palm-tree.webp`,
    emoji: '🌴',
    accent: '#5de08c',
    rarity: '普通',
    imageWidth: 159,
    imageHeight: 180,
    weight: 1,
  },
  {
    id: 'floatie',
    name: '好运泳圈',
    image: `${ASSET_ROOT}/figma/equipment-pineapple-float.webp`,
    emoji: '🛟',
    accent: '#ff7791',
    rarity: '普通',
    imageWidth: 180,
    imageHeight: 138,
    weight: 1,
  },
  {
    id: 'deckchair',
    name: '躺赢沙滩椅',
    image: `${ASSET_ROOT}/figma/equipment-sun-chair.webp`,
    emoji: '⛱️',
    accent: '#7f9cff',
    rarity: '普通',
    imageWidth: 150,
    imageHeight: 180,
    weight: 0.95,
  },
  {
    id: 'sunhat',
    name: '遮阳幸运帽',
    image: '',
    emoji: '👒',
    accent: '#ffc85a',
    rarity: '稀有',
    weight: 0.55,
  },
]

const TIERS: SurfTier[] = [
  { id: 'tier-1', threshold: 1, amount: '3', title: '清凉开运券', condition: '满15元可用', reward: '¥3 清凉开运券', icon: '¥3', kind: 'coupon' },
  { id: 'tier-4', threshold: 4, amount: '12', title: '玩水装备券', condition: '满49元可用', reward: '¥12 玩水装备券', icon: '¥12', kind: 'coupon' },
  { id: 'tier-6', threshold: 6, amount: '23', title: '一顺到底券', condition: '满88元可用', reward: '¥23 一顺到底券', icon: '¥23', kind: 'coupon' },
  {
    id: 'tier-7',
    threshold: 7,
    amount: '限定礼',
    title: '足金顺顺马抽签码',
    condition: '集齐全套即可领取',
    reward: '足金顺顺马抽签码',
    icon: '足金',
    kind: 'grand',
    image: `${ASSET_ROOT}/figma/reward-gold-horse.webp`,
    imageWidth: 132,
    imageHeight: 112,
  },
]

const TASKS: SurfTask[] = [
  {
    id: 'post',
    icon: '✨',
    title: '为点亮过的避暑玩水地点投稿',
    description: '每次模拟投稿，获得 2 次抽装备机会',
    target: 3,
    reward: 2,
    action: '去投稿',
  },
  {
    id: 'share',
    icon: '📸',
    title: '带定位和话题发布玩水灵感',
    description: '带 #顺风顺水的夏天 发布，即得 2 次机会',
    target: 2,
    reward: 2,
    action: '去投稿',
  },
  {
    id: 'store',
    icon: '📍',
    title: '到店点亮避暑玩水商户',
    description: '每次点亮即得 1 次抽装备机会',
    target: 6,
    reward: 1,
    action: '去点亮',
  },
  {
    id: 'gift',
    icon: '🎁',
    title: '给朋友赠送一张装备卡',
    description: '好友模拟领取后，获得 1 次抽装备机会',
    target: 3,
    reward: 1,
    action: '去赠送',
  },
  {
    id: 'browse',
    icon: '👀',
    title: '浏览本玩水活动页',
    description: '每日首次浏览即得 1 次抽装备机会',
    target: 1,
    reward: 1,
    action: '明日再来',
  },
]

const TOPICS = [
  '# 2026暑假接好运',
  '# 暑假快乐',
  '# 今年暑假去哪玩',
  '# 顺风顺水的夏天',
  '# 今年暑期去哪玩',
  '# 扎进水里过夏天',
]

const INSPIRATION: SummerSurfInspirationConfig[] = [
  {
    image: `${ASSET_ROOT}/figma/topic-hotpot-card.webp`,
    emoji: '🍧',
    eyebrow: '清凉美食指南',
    title: '把夏天吃进这一口',
    action: '去发现更多',
    taskId: 'store',
  },
  {
    image: `${ASSET_ROOT}/figma/topic-sunset-card.webp`,
    emoji: '🌇',
    eyebrow: '晚霞打卡指南',
    title: '晚霞就是天空的诗',
    action: '发布同款灵感',
    taskId: 'post',
  },
  {
    image: `${ASSET_ROOT}/figma/topic-lake-card.webp`,
    emoji: '🌊',
    eyebrow: '扎进水里夏天',
    title: '把清凉值拉满',
    action: '去发现更多',
    taskId: 'share',
  },
]

const VENUES = [
  {
    image: `${ASSET_ROOT}/figma/content-card-lions.webp`,
    location: '上海动物园',
    title: '元旦来动物园打卡啦～',
  },
  {
    image: `${ASSET_ROOT}/figma/content-card-cabin.webp`,
    location: '世博文化公园',
    title: '今年夏天，去一片有风的湖边',
  },
  {
    image: `${ASSET_ROOT}/figma/topic-lake-card.webp`,
    location: '滴水湖',
    title: '把周末过成一场小型冲浪节',
  },
  {
    image: `${ASSET_ROOT}/figma/topic-sunset-card.webp`,
    location: '滨江水岸',
    title: '晚霞之后，再和夏天玩一会',
  },
]

const CAMPAIGN_PAGES: SummerSurfPageNode[] = [
  { id: 'loading', order: '01', name: '开场 Loading', route: '#/loading', kind: 'screen', status: 'draft' },
  { id: 'character-select', order: '02', name: '角色选择', route: '#/character', kind: 'screen', status: 'draft' },
  { id: 'campaign-main', order: '03', name: '活动主页', route: '#/campaign', kind: 'screen', status: 'ready' },
  { id: 'prizes', order: '04', name: '我的奖品', route: '#/prizes', kind: 'screen', status: 'draft' },
  { id: 'rules', order: '05', name: '活动规则', route: '#/rules', kind: 'overlay', status: 'draft' },
]

const CAMPAIGN_FLOW_EDGES: SummerSurfFlowEdge[] = [
  { id: 'loading-ready', fromPageId: 'loading', eventKey: 'assets.ready', targetPageId: 'character-select', navigation: 'replace', transition: 'fade' },
  { id: 'character-confirm', fromPageId: 'character-select', eventKey: 'confirm.click', targetPageId: 'campaign-main', navigation: 'replace', transition: 'slide' },
  { id: 'campaign-prizes', fromPageId: 'campaign-main', eventKey: 'prize.click', targetPageId: 'prizes', navigation: 'push', transition: 'slide' },
  { id: 'campaign-rules', fromPageId: 'campaign-main', eventKey: 'rules.click', targetPageId: 'rules', navigation: 'overlay', transition: 'fade' },
]

const HERO_LAYERS: SummerSurfHeroLayer[] = [
  { id: 'hero-layer-watergun', cardId: 'watergun', label: '鲨鲨水枪', unlockMethod: 'first-gift', presentation: 'image-layer', embeddedInBase: true, x: 0, y: 0, width: 76, rotation: 0, zIndex: 1 },
  { id: 'hero-layer-watermelon', cardId: 'watermelon', label: '冰镇西瓜', unlockMethod: 'draw', presentation: 'image-layer', media: { type: 'image', src: `${ASSET_ROOT}/figma/equipment-watermelon-bucket.webp`, fit: 'contain', position: 'center', sourceWidth: 180, sourceHeight: 179 }, x: 1, y: 330, width: 108, rotation: -4, zIndex: 4 },
  { id: 'hero-layer-surfboard', cardId: 'surfboard', label: '顺风冲浪板', unlockMethod: 'draw', presentation: 'image-layer', embeddedInBase: true, x: 0, y: 0, width: 118, rotation: 0, zIndex: 1 },
  { id: 'hero-layer-palmtree', cardId: 'palmtree', label: '海岛椰树', presentation: 'image-layer', media: { type: 'image', src: `${ASSET_ROOT}/figma/equipment-palm-tree.webp`, fit: 'contain', position: 'center', sourceWidth: 159, sourceHeight: 180 }, x: 300, y: 112, width: 78, rotation: 0, zIndex: 2 },
  { id: 'hero-layer-floatie', cardId: 'floatie', label: '好运泳圈', presentation: 'image-layer', media: { type: 'image', src: `${ASSET_ROOT}/figma/equipment-pineapple-float.webp`, fit: 'contain', position: 'center', sourceWidth: 180, sourceHeight: 138 }, x: 285, y: 292, width: 84, rotation: 0, zIndex: 3 },
  { id: 'hero-layer-deckchair', cardId: 'deckchair', label: '躺赢沙滩椅', presentation: 'image-layer', media: { type: 'image', src: `${ASSET_ROOT}/figma/equipment-sun-chair.webp`, fit: 'contain', position: 'center', sourceWidth: 150, sourceHeight: 180 }, x: 300, y: 218, width: 62, rotation: 0, zIndex: 2 },
  { id: 'hero-layer-sunhat', cardId: 'sunhat', label: '遮阳幸运帽', presentation: 'image-layer', x: 0, y: 0, width: 64, rotation: 0, zIndex: 2 },
]

// Ported from Marketing King's Campaign Studio starter data so the inspector
// and the live activity share the same content contract.
// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_SUMMER_SURF_EDIT_CONFIG: SummerSurfEditConfig = {
  activeTheme: 'summer',
  campaignName: '夏日冲浪 · 顺风顺水',
  navLabel: '夏天马上顺',
  accessibleTitle: '夏日冲浪活动',
  heroMedia: {
    type: 'image',
    src: `${ASSET_ROOT}/theme-assets/summer/hero-layer-base.png`,
    assetId: 'builtin:summer:hero:start:video-native-v1',
    fit: 'cover',
    position: 'center top',
    sourceWidth: 834,
    sourceHeight: 1112,
  },
  heroComposition: {
    enabled: true,
    initialUnlockedCardIds: ['watergun'],
    finalReference: { type: 'image', src: `${ASSET_ROOT}/theme-assets/summer/hero-scene-v2.png`, assetId: 'builtin:summer:hero:end:video-native-v1', fit: 'cover', position: 'center top', sourceWidth: 834, sourceHeight: 1112 },
    layers: HERO_LAYERS,
  },
  assets: {
    mapBackgroundImage: `${ASSET_ROOT}/figma/map-cap.png`,
    grandRewardImage: `${ASSET_ROOT}/figma/reward-gold-horse.webp`,
  },
  pages: CAMPAIGN_PAGES,
  flowEdges: CAMPAIGN_FLOW_EDGES,
  drawLabel: '抽装备 一顺到底',
  collectionEntryLabel: '我的装备',
  collectionTitle: '顺风装备册',
  collectionProgressVerb: '已点亮',
  cardNoun: '种',
  missingCardLabel: '等待点亮',
  energyTitle: '冲浪得金豆，好礼兑不停',
  energyEyebrow: '金豆副玩法',
  energyDescription: '已有 99999 🟡，冲一冲兑 50 元券 ›',
  energyCta: '冲!',
  energyBadge: '1',
  energyImage: `${ASSET_ROOT}/figma/mascot-side-horse.webp`,
  energyVisual: '🏄',
  energyAnnouncement: '冲浪攒金豆玩法即将开放',
  tasksTitle: '玩一夏，赚更多',
  drawTabLabel: '抽装备',
  energyTabLabel: '攒体力',
  topicsEyebrow: 'SUMMER WATER TOPICS',
  topicsTitle: '暑期 #灵感话题',
  topicChips: TOPICS,
  discoveryEyebrow: '热门投稿 · HOT!! · 🔥',
  discoveryTitle: '扎进水里夏天（马上顺）',
  activityBanners: [
    { eyebrow: 'LIFE GUIDE', title: '生活有用指南' },
    { eyebrow: 'SUMMER PLAN', title: '吃喝玩乐方案计划' },
  ],
  cards: CARDS,
  tiers: TIERS,
  tasks: TASKS,
  inspirationCards: INSPIRATION,
  venues: VENUES,
  colors: {
    page: '#bcecff',
    mapBackground: '#dfeef8',
    heroBackground: '#19a9ed',
    surface: '#fdfefc',
    surfaceText: '#101921',
    mutedText: '#6b8a99',
    accent: '#159de4',
    accentText: '#ffffff',
    actionStart: '#ff4d40',
    actionEnd: '#ff2821',
    actionShadow: '#c91f19',
    sideAction: 'rgba(232, 250, 255, 0.96)',
    sideActionText: '#071925',
    tabSurface: 'rgba(230, 247, 255, 0.96)',
    tabText: '#5b879c',
    tabActiveSurface: '#ffffff',
    tabActiveText: '#087bb4',
    cardBorder: '#cde4ec',
    cardOwned: '#87ddfb',
    cardMissing: '#e2edf1',
    countBadge: '#baff20',
  },
}

export const SUMMER_SURF_CONFIG_STORAGE_KEY = 'campaign-studio-summer-surf-config-v1'

// eslint-disable-next-line react-refresh/only-export-components
export function getInitialSummerSurfEditConfig(): SummerSurfEditConfig {
  if (typeof window === 'undefined') return DEFAULT_SUMMER_SURF_EDIT_CONFIG
  try {
    const saved = JSON.parse(window.localStorage.getItem(SUMMER_SURF_CONFIG_STORAGE_KEY) ?? 'null') as Partial<SummerSurfEditConfig> | null
    if (!saved) return DEFAULT_SUMMER_SURF_EDIT_CONFIG
    return summerSurfConfigForStorage({
      ...DEFAULT_SUMMER_SURF_EDIT_CONFIG,
      ...saved,
      heroMedia: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroMedia, ...saved.heroMedia },
      heroComposition: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroComposition, ...saved.heroComposition, layers: saved.heroComposition?.layers ?? DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroComposition.layers },
      assets: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.assets, ...saved.assets },
      colors: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.colors, ...saved.colors },
    })
  } catch {
    return DEFAULT_SUMMER_SURF_EDIT_CONFIG
  }
}

export interface SummerSurfH5PreviewProps {
  editing?: boolean
  selected?: SummerSurfSelection | null
  onSelect?: (selection: SummerSurfSelection) => void
  config?: Partial<SummerSurfEditConfig>
  /** 模板复刻的已完成替换批次：让生成结果逐批落到界面。 */
  generationBatch?: number
}

function GenerationPlaceholder({
  title,
  detail,
  className = '',
}: {
  title: string
  detail: string
  className?: string
}) {
  return (
    <div className={`surf-generation-placeholder ${className}`} aria-label={`${title}${detail}`}>
      <strong>{title}</strong>
      <small>{detail}</small>
    </div>
  )
}

export default function SummerSurfH5Preview({
  editing = false,
  selected = null,
  onSelect,
  config,
  generationBatch,
}: SummerSurfH5PreviewProps) {
  const baseEditConfig = useMemo(
    () => ({ ...DEFAULT_SUMMER_SURF_EDIT_CONFIG, ...config }),
    [config],
  )
  const [hydratedAssets, setHydratedAssets] = useState<{
    source: Partial<SummerSurfEditConfig> | undefined
    config: SummerSurfEditConfig
  } | null>(null)
  const [localAssetNotice, setLocalAssetNotice] = useState('')
  const editConfig = hydratedAssets && hydratedAssets.source === config
    ? hydratedAssets.config
    : baseEditConfig

  useEffect(() => {
    let cancelled = false
    hydrateSummerSurfConfigAssets(baseEditConfig)
      .then((result) => {
        if (cancelled) return
        setHydratedAssets({ source: config, config: result.config })
        setLocalAssetNotice(result.missingAssetIds.length > 0
          ? '部分本地素材未找到，请打开编辑面板重新上传。'
          : '')
      })
      .catch(() => {
        if (!cancelled) {
          setLocalAssetNotice('本地素材库不可用，上传素材可能需要重新选择。')
        }
      })
    return () => {
      cancelled = true
    }
  }, [baseEditConfig, config])
  const generationProgress = Math.max(0, Math.min(3, generationBatch ?? 3))
  const heroReady = generationBatch == null || generationProgress >= 1
  const cardsReady = generationBatch == null || generationProgress >= 2
  const gameplayReady = generationBatch == null || generationProgress >= 3
  const cards = cardsReady ? editConfig.cards : []
  const tiers = gameplayReady ? editConfig.tiers : []
  const tasks = gameplayReady ? editConfig.tasks : []
  const inspirationCards = gameplayReady ? editConfig.inspirationCards : []
  const venues = editConfig.venues
  const [previewTheme, setPreviewTheme] = useState<SummerSurfThemeId>('summer')
  const activeTheme = editing ? editConfig.activeTheme : previewTheme
  const [owned, setOwned] = useState<Record<string, number>>({ watergun: 1 })
  const [drawBalance, setDrawBalance] = useState(2)
  const [claimedTiers, setClaimedTiers] = useState<string[]>([])
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({})
  const [taskTab, setTaskTab] = useState<TaskTab>('draw')
  const [modal, setModal] = useState<ModalKind>(null)
  const [resultCard, setResultCard] = useState<SurfCard | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [toast, setToast] = useState('')

  const uniqueCount = cards.filter((card) => (owned[card.id] ?? 0) > 0).length
  const heroSrc =
    editConfig.heroMedia.src || (activeTheme === 'night'
      ? `${ASSET_ROOT}/theme-assets/night/hero-scene.webp`
      : uniqueCount >= 2
        ? `${ASSET_ROOT}/theme-assets/summer/hero-scene-v2.png`
        : `${ASSET_ROOT}/theme-assets/summer/hero-layer-base.png`)
  const heroLayers = editConfig.heroComposition.enabled
    ? editConfig.heroComposition.layers.filter(
        (layer) => layer.presentation !== 'none' && layer.media?.src && !layer.embeddedInBase,
      )
    : []

  const isSelected = (target: SummerSurfTarget) => selected?.target === target
  const targetClass = (target: SummerSurfTarget) =>
    isSelected(target) ? ' is-edit-target-selected' : ''
  const selectTarget = (
    target: SummerSurfTarget,
    label: string,
    kind: SummerSurfSelection['kind'] = 'section',
  ) => {
    if (editing) onSelect?.({ target, label, kind })
  }

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 1900)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = (message: string) => setToast(message)

  const handleDraw = () => {
    if (editing) {
      selectTarget('hero.actions', '抽装备按钮', 'element')
      return
    }
    if (isDrawing || modal) return
    if (drawBalance <= 0) {
      showToast('抽装备机会用完啦，去做任务赚机会吧')
      return
    }
    setDrawBalance((balance) => balance - 1)
    setIsDrawing(true)
    setModal('drawing')
    window.setTimeout(() => {
      const unowned = cards.filter((card) => !(owned[card.id] ?? 0))
      const pool = unowned.length ? unowned : cards
      const card = pool[Math.floor(Math.random() * pool.length)]
      setResultCard(card)
      setIsDrawing(false)
      setModal('result')
    }, 720)
  }

  const acceptResult = () => {
    if (!resultCard) return
    setOwned((current) => ({
      ...current,
      [resultCard.id]: (current[resultCard.id] ?? 0) + 1,
    }))
    showToast(
      (owned[resultCard.id] ?? 0) > 0
        ? `「${resultCard.name}」已放入装备册`
        : `新装备「${resultCard.name}」已点亮`,
    )
    setResultCard(null)
    setModal(null)
  }

  const completeTask = (task: SurfTask) => {
    const progress = taskProgress[task.id] ?? 0
    if (progress >= task.target) {
      showToast('今天这项任务已经完成啦')
      return
    }
    setTaskProgress((current) => ({
      ...current,
      [task.id]: Math.min(task.target, progress + 1),
    }))
    setDrawBalance((balance) => balance + task.reward)
    showToast(`任务完成，获得 ${task.reward} 次抽装备机会`)
  }

  const claimTier = (tier: (typeof tiers)[number]) => {
    if (claimedTiers.includes(tier.id)) {
      showToast('这档奖励已经领取过啦')
      return
    }
    if (uniqueCount < tier.threshold) {
      showToast(`再点亮 ${tier.threshold - uniqueCount} 种装备即可领取`)
      return
    }
    setClaimedTiers((current) => [...current, tier.id])
    showToast(`已领取「${tier.reward}」`)
  }

  const share = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href)
    }
    showToast('活动链接已复制，快喊朋友一起玩水')
  }

  const renderCard = (card: SurfCard, compact = false) => {
    const count = owned[card.id] ?? 0
    return (
      <button
        key={card.id}
        type="button"
        className={`surf-card ${count ? 'is-owned' : 'is-missing'} ${compact ? 'is-compact' : ''}`}
        style={{ '--card-accent': card.accent } as React.CSSProperties}
        onClick={() => {
          if (editing) {
            selectTarget('collection', editConfig.collectionTitle)
            return
          }
          setModal('cards')
          if (count > 1) showToast(`「${card.name}」有 ${count - 1} 张可赠送`)
        }}
        aria-label={`${card.name}，${count ? `已有${count}张` : '尚未获得'}`}
      >
        {count > 1 && <span className="surf-card-count">×{count}</span>}
        <span className="surf-card-art">
          {card.image ? (
            <img src={card.image} alt="" loading="lazy" />
          ) : (
            <span aria-hidden>{card.emoji}</span>
          )}
        </span>
        {!compact && (
          <>
            <strong>{count ? card.name : '等待点亮'}</strong>
            <small>{count ? card.rarity : '神秘装备'}</small>
          </>
        )}
      </button>
    )
  }

  return (
    <div
      className={`summer-surf-preview ${activeTheme === 'night' ? 'is-night' : ''} ${editing ? 'is-editing' : ''}`}
      style={{
        '--surf-page': editConfig.colors.page,
        '--surf-hero': editConfig.colors.heroBackground,
        '--surf-ink': editConfig.colors.surfaceText,
        '--surf-muted': editConfig.colors.mutedText,
        '--surf-surface': editConfig.colors.surface,
        '--surf-accent': editConfig.colors.accent,
        '--surf-action': editConfig.colors.actionEnd,
        '--surf-action-dark': editConfig.colors.actionShadow,
      } as React.CSSProperties}
    >
      {localAssetNotice && (
        <div className="absolute inset-x-3 top-3 z-50 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-pretty text-xs text-amber-900 shadow-sm" role="status">
          {localAssetNotice}
        </div>
      )}
      <div className="summer-surf-scroll">
        <section
          className={`surf-stage${targetClass('page')}`}
          aria-label="夏日冲浪活动主舞台"
          onClick={() => selectTarget('page', '整页活动')}
        >
          <div className="surf-map-cap" aria-hidden>
            {heroReady ? (
              <img src={editConfig.assets.mapBackgroundImage} alt="" />
            ) : (
              <GenerationPlaceholder title="活动底景" detail="待生成" />
            )}
          </div>
          <div className={`surf-hero${targetClass('hero')}`} onClick={() => selectTarget('hero', '主视觉')}>
            {heroReady ? editConfig.heroMedia.type === 'video' ? (
              <video
                  className="surf-hero-art"
                  src={editConfig.heroMedia.src || heroSrc}
                  poster={editConfig.heroMedia.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={editConfig.accessibleTitle}
                  style={{ objectFit: editConfig.heroMedia.fit, objectPosition: editConfig.heroMedia.position }}
                />
            ) : (
              <img
                className="surf-hero-art"
                src={heroSrc}
                alt={editConfig.accessibleTitle}
                style={{ objectFit: editConfig.heroMedia.fit, objectPosition: editConfig.heroMedia.position }}
              />
              ) : (
                <GenerationPlaceholder title="夏日主视觉" detail="第 1 批生成中" className="surf-hero-placeholder" />
              )}
            {heroReady && (
              <div className="surf-hero-composition" aria-hidden>
                {heroLayers.map((layer) => (
                  <img
                    key={layer.id}
                    src={layer.media?.src}
                    alt=""
                    style={{
                      left: `${(layer.x / 375) * 100}%`,
                      top: `${(layer.y / 500) * 100}%`,
                      width: `${(layer.width / 375) * 100}%`,
                      transform: `rotate(${layer.rotation}deg)`,
                      zIndex: layer.zIndex + 2,
                      objectFit: layer.media?.fit ?? 'contain',
                      objectPosition: layer.media?.position ?? 'center',
                    }}
                  />
                ))}
              </div>
            )}
            <nav
              className={`surf-theme-tabs${targetClass('hero.theme')}`}
              aria-label="活动主题"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={activeTheme === 'summer' ? 'is-active' : ''}
                onClick={() => {
                  if (editing) {
                    selectTarget('hero.theme', '主题切换', 'element')
                    return
                  }
                  setPreviewTheme('summer')
                }}
                aria-pressed={activeTheme === 'summer'}
              >
                {editConfig.navLabel}
              </button>
              <button
                type="button"
                className={activeTheme === 'night' ? 'is-active' : ''}
                onClick={() => {
                  if (editing) {
                    selectTarget('hero.theme', '主题切换', 'element')
                    return
                  }
                  setPreviewTheme('night')
                }}
                aria-pressed={activeTheme === 'night'}
              >
                夏日夜食指南
              </button>
            </nav>
            <div className="surf-floating-actions" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={() => (editing ? selectTarget('hero.actions', '快捷操作', 'element') : share())} aria-label="分享活动">
                分<br />享
              </button>
              <button type="button" onClick={() => (editing ? selectTarget('hero.actions', '快捷操作', 'element') : setModal('rules'))} aria-label="查看活动规则">
                规<br />则
              </button>
            </div>
            <div className={`surf-hero-actions${targetClass('hero.actions')}`} onClick={(event) => event.stopPropagation()}>
              <button type="button" className="surf-side-action is-left" onClick={() => (editing ? selectTarget('hero.actions', '快捷操作', 'element') : setModal('cards'))}>
                {editConfig.collectionEntryLabel.split('').map((char, index) => <span key={`${char}-${index}`}>{char}</span>)}
              </button>
              <button
                type="button"
                className={`surf-draw-button ${isDrawing ? 'is-drawing' : ''}`}
                onClick={handleDraw}
                disabled={isDrawing}
                aria-label={`抽装备，剩余${drawBalance}次`}
              >
                <span>{isDrawing ? '正在抽取…' : editConfig.drawLabel}</span>
                <b>{drawBalance}</b>
              </button>
              <button type="button" className="surf-side-action is-right" onClick={() => (editing ? selectTarget('hero.actions', '快捷操作', 'element') : setModal('prizes'))}>
                我的<br />奖品
              </button>
            </div>
          </div>
        </section>

        <section
          className={`surf-collection${targetClass('collection')}`}
          aria-label={editConfig.collectionTitle}
          onClick={() => selectTarget('collection', editConfig.collectionTitle)}
        >
          <div className="surf-collection-heading">
            <h2>{editConfig.collectionTitle}</h2>
            <p>
              {cardsReady
                ? <>{editConfig.collectionProgressVerb} <b>{uniqueCount}</b> / {cards.length} {editConfig.cardNoun}</>
                : '卡池与卡面待生成'}
            </p>
          </div>
          <div className="surf-tier-row">
            {gameplayReady ? tiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                className={`surf-tier ${uniqueCount >= tier.threshold ? 'is-unlocked' : ''} ${claimedTiers.includes(tier.id) ? 'is-claimed' : ''}`}
                onClick={() => (editing ? selectTarget('collection', editConfig.collectionTitle) : claimTier(tier))}
                aria-label={`${tier.threshold}种装备奖励：${tier.reward}`}
              >
                <span className="surf-tier-ticket">
                  {tier.image ? <img src={tier.image} alt="" /> : tier.icon}
                </span>
                <strong>{tier.threshold}种</strong>
              </button>
            )) : (
              <GenerationPlaceholder title="奖励档位" detail="第 3 批生成" className="surf-generation-inline" />
            )}
          </div>
          <div className="surf-card-scroller">
            {cardsReady
              ? cards.map((card) => renderCard(card))
              : <GenerationPlaceholder title="装备卡面" detail="第 2 批生成" className="surf-generation-inline" />}
          </div>
        </section>

        {gameplayReady ? (
          <section
            className={`surf-energy-teaser${targetClass('energy')}`}
            aria-label={editConfig.energyTitle}
            onClick={(event) => {
              event.stopPropagation()
              if (editing) selectTarget('energy', editConfig.energyTitle)
            }}
          >
            <div className="surf-energy-art">
              {editConfig.energyImage ? <img src={editConfig.energyImage} alt="" /> : <span aria-hidden>{editConfig.energyVisual}</span>}
            </div>
            <div>
              <small>{editConfig.energyEyebrow}</small>
              <h2>{editConfig.energyTitle}</h2>
              <p>{editConfig.energyDescription}</p>
            </div>
            <button type="button" onClick={() => (editing ? selectTarget('energy', editConfig.energyTitle) : showToast(editConfig.energyAnnouncement))}>
              {editConfig.energyCta}<b>{editConfig.energyBadge}</b>
            </button>
          </section>
        ) : (
          <GenerationPlaceholder title="奖励与副玩法" detail="第 3 批生成" className="surf-generation-block" />
        )}

        {gameplayReady ? <section
          className={`surf-tasks${targetClass('tasks')}`}
          aria-labelledby="surf-tasks-title"
          onClick={() => selectTarget('tasks', editConfig.tasksTitle)}
        >
          <div className="surf-section-kicker">每天 0 点刷新</div>
          <p className="surf-section-overline">PLAY · EARN · COLLECT</p>
          <h2 id="surf-tasks-title">{editConfig.tasksTitle}</h2>
          <div className="surf-task-tabs" role="tablist" aria-label="任务类型">
            <button type="button" className={taskTab === 'draw' ? 'is-active' : ''} onClick={() => (editing ? selectTarget('tasks', '任务玩法') : setTaskTab('draw'))}>
              {editConfig.drawTabLabel}
            </button>
            <button type="button" className={taskTab === 'energy' ? 'is-active' : ''} onClick={() => (editing ? selectTarget('tasks', '任务玩法') : setTaskTab('energy'))}>
              {editConfig.energyTabLabel}
            </button>
          </div>
          <div className="surf-task-list">
            {tasks.map((task) => {
              const progress = taskProgress[task.id] ?? 0
              const complete = progress >= task.target
              return (
                <article className={`surf-task-card ${task.id === 'post' || task.id === 'share' ? 'is-featured' : ''}`} key={task.id}>
                  <span className="surf-task-icon" aria-hidden>{task.icon}</span>
                  <div className="surf-task-copy">
                    <div className="surf-task-title-row">
                      <h3>{task.title}</h3>
                      <span>{progress}/{task.target}</span>
                    </div>
                    <p>{taskTab === 'energy' ? task.description.replace(/获得|即得/, '获得') : task.description}</p>
                    <div className="surf-task-progress"><span style={{ width: `${(progress / task.target) * 100}%` }} /></div>
                  </div>
                  <button type="button" onClick={() => (editing ? selectTarget('tasks', '任务玩法') : completeTask(task))} disabled={complete && !editing}>
                    {complete ? '已完成' : task.action}
                  </button>
                </article>
              )
            })}
          </div>
        </section> : (
          <GenerationPlaceholder title="任务配置" detail="第 3 批生成" className="surf-generation-block" />
        )}

        {gameplayReady ? <div className="surf-content-world">
          <section
            className={`surf-topics${targetClass('topics')}`}
            aria-labelledby="surf-topics-title"
            onClick={() => selectTarget('topics', editConfig.topicsTitle)}
          >
            <p>{editConfig.topicsEyebrow}</p>
            <h2 id="surf-topics-title">{editConfig.topicsTitle}</h2>
            <div className="surf-topic-chips">
              {editConfig.topicChips.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
            <div className="surf-inspiration-scroller">
              {inspirationCards.map((item) => (
                <article className="surf-inspiration-card" key={item.title}>
                  <img src={item.image} alt="" loading="lazy" />
                  <small>{item.eyebrow}</small>
                  <h3>{item.title}</h3>
                  <button type="button" onClick={() => (editing ? selectTarget('topics', '灵感话题') : showToast(`${item.title}已打开`))}>{item.action} →</button>
                </article>
              ))}
            </div>
          </section>

          <section
            className={`surf-discovery${targetClass('discovery')}`}
            aria-labelledby="surf-discovery-title"
            onClick={() => selectTarget('discovery', editConfig.discoveryTitle)}
          >
            <div className="surf-discovery-heading">
              <small>{editConfig.discoveryEyebrow}</small>
              <h2 id="surf-discovery-title">{editConfig.discoveryTitle}</h2>
            </div>
            <div className="surf-venue-grid">
              {venues.map((venue) => (
                <article className="surf-venue-card" key={venue.location}>
                  <div className="surf-venue-media">
                    <img src={venue.image} alt="" loading="lazy" />
                    <span>⌖ {venue.location}</span>
                  </div>
                  <h3>{venue.title}</h3>
                  <div className="surf-venue-meta">
                    <img src={`${ASSET_ROOT}/figma/content-avatar.png`} alt="" />
                    <span>小九兄弟</span>
                    <span>♡ 92.4万</span>
                  </div>
                  <button type="button" onClick={() => (editing ? selectTarget('discovery', '热门投稿') : showToast(`已打开${venue.location}灵感`))} aria-label={`查看${venue.location}：${venue.title}`} />
                </article>
              ))}
            </div>
            <button type="button" className="surf-more-activities" onClick={() => (editing ? selectTarget('discovery', '热门投稿') : showToast('更多精彩活动即将上线'))}>
              更多精彩活动
            </button>
          </section>
          <section className="surf-activity-banners" aria-label="更多精彩活动">
            {editConfig.activityBanners.map((banner, index) => (
              <button
                key={`${index}-${banner.title}`}
                type="button"
                onClick={() => (editing ? selectTarget('discovery', banner.title) : showToast(`${banner.title}即将上线`))}
              >
                <small>{banner.eyebrow}</small>
                <strong>{banner.title}</strong>
                <span aria-hidden>→</span>
              </button>
            ))}
          </section>
        </div> : (
          <GenerationPlaceholder title="活动内容区" detail="第 3 批生成" className="surf-generation-world" />
        )}

        {gameplayReady && <footer className="surf-footer">
          <img src={`${ASSET_ROOT}/figma/brand-logo.png`} alt="抖音生活服务，让每次心动都值得" />
          <button type="button" onClick={() => (editing ? selectTarget('page', '整页活动') : setModal('rules'))}>玩法与演示说明</button>
        </footer>}
      </div>

      {modal && (
        <div className="surf-modal-backdrop" role="presentation" onClick={() => !isDrawing && setModal(null)}>
          <section className={`surf-modal ${modal === 'drawing' ? 'is-drawing-modal' : ''}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="surf-modal-close" onClick={() => !isDrawing && setModal(null)} aria-label="关闭">×</button>
            {modal === 'drawing' && (
              <>
                <span className="surf-drawing-wave">🌊</span>
                <p className="surf-modal-kicker">GOOD LUCK!</p>
                <h2>正在抽取夏日装备</h2>
                <p>把清凉和好运一起抽出来～</p>
              </>
            )}
            {modal === 'result' && resultCard && (
              <>
                <p className="surf-modal-kicker">{(owned[resultCard.id] ?? 0) ? 'DUPLICATE CARD' : 'NEW COLLECTION!'}</p>
                <div className="surf-result-art" style={{ '--card-accent': resultCard.accent } as React.CSSProperties}>
                  {resultCard.image ? <img src={resultCard.image} alt="" /> : resultCard.emoji}
                </div>
                <h2>{resultCard.name}</h2>
                <p>{(owned[resultCard.id] ?? 0) ? '重复装备可赠送给朋友，继续把好运传出去' : `新装备已点亮，当前集齐 ${uniqueCount + 1}/${cards.length} ${editConfig.cardNoun}`}</p>
                <div className="surf-modal-actions"><button type="button" className="is-primary" onClick={acceptResult}>收下这张装备</button></div>
              </>
            )}
            {modal === 'cards' && (
              <>
                <p className="surf-modal-kicker">MY COLLECTION</p>
                <h2>{editConfig.collectionTitle}</h2>
                <p>{editConfig.collectionProgressVerb} {uniqueCount} {editConfig.cardNoun} · 重复装备可赠送</p>
                <div className="surf-album-grid">{cards.map((card) => renderCard(card, true))}</div>
              </>
            )}
            {modal === 'prizes' && (
              <>
                <p className="surf-modal-kicker">MY PRIZES</p>
                <h2>我的奖品</h2>
                <div className="surf-prize-list">
                  {tiers.filter((tier) => claimedTiers.includes(tier.id)).map((tier) => <div key={tier.id}><b>已领取</b><span>{tier.reward}</span></div>)}
                  {!claimedTiers.length && <p>还没有奖品，点亮装备后回来领取吧～</p>}
                </div>
              </>
            )}
            {modal === 'rules' && (
              <>
                <p className="surf-modal-kicker">HOW TO PLAY</p>
                <h2>顺风顺水玩法说明</h2>
                <ol className="surf-rules-list">
                  <li>完成投稿、点亮商户、赠送装备等任务，获得抽装备机会。</li>
                  <li>抽到新装备会点亮主视觉，收集达到档位即可领取券和限定礼。</li>
                  <li>重复装备可以送给朋友，和好友一起把夏天玩起来。</li>
                </ol>
              </>
            )}
          </section>
        </div>
      )}

      {toast && <div className="surf-toast" role="status">{toast}</div>}
    </div>
  )
}
