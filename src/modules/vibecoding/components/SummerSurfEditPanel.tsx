import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import {
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from '@/shared/icons'
import {
  DEFAULT_SUMMER_SURF_EDIT_CONFIG,
  type SummerSurfAssetConfig,
  type SummerSurfEditConfig,
  type SummerSurfFlowEdge,
  type SummerSurfHeroComposition,
  type SummerSurfHeroLayer,
  type SummerSurfHeroMedia,
  type SummerSurfPageNode,
  type SummerSurfSelection,
  type SummerSurfTarget,
  type SurfCard,
  type SurfTier,
} from './SummerSurfH5Preview'
import './SummerSurfEditPanel.css'

const HERO_WIDTH = 375
const HERO_HEIGHT = 500

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

function SectionSummary({ index, children }: { index: string; children: ReactNode }) {
  return (
    <summary>
      <span className="studio-section-index">{index}</span>
      <span className="studio-section-title">{children}</span>
      <span className="studio-details-affordance" aria-hidden="true">
        <span className="studio-details-collapsed">展开</span>
        <span className="studio-details-expanded">收起</span>
        <ChevronDown size={13} strokeWidth={1.6} />
      </span>
    </summary>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const colorValue = /^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'
  return (
    <label className="studio-color-field">
      <input type="color" value={colorValue} onChange={(event) => onChange(event.target.value)} aria-label={`${label}取色器`} />
      <span>{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} />
    </label>
  )
}

function AssetPreview({ src, fallback, alt, displaySize, recommended }: { src?: string; fallback: ReactNode; alt: string; displaySize?: string; recommended?: string }) {
  return (
    <div className="studio-asset-preview">
      <div className="studio-asset-preview-frame">
        {src ? <img src={src} alt={alt} /> : <span aria-hidden>{fallback}</span>}
      </div>
      <small>{displaySize ?? '展示素材 · 支持地址替换'}</small>
      {recommended && <small>{recommended}</small>}
    </div>
  )
}

function ModuleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="studio-ai-slot-action" onClick={onClick}>
      <span>AI 生成</span>
      <small>{label} · 自带当前主题约束</small>
    </button>
  )
}

function cloneConfig(config: SummerSurfEditConfig): SummerSurfEditConfig {
  return JSON.parse(JSON.stringify(config)) as SummerSurfEditConfig
}

function mediaFromFile(file: File, fit: 'cover' | 'contain' = 'contain'): SummerSurfHeroMedia {
  return {
    type: file.type.startsWith('video/') ? 'video' : 'image',
    src: URL.createObjectURL(file),
    fit,
    position: 'center top',
  }
}

function HeroLayerComposer({ baseMedia, layers, selectedLayerId, onSelect, onCommit }: { baseMedia: SummerSurfHeroMedia; layers: SummerSurfHeroLayer[]; selectedLayerId: string; onSelect: (layerId: string) => void; onCommit: (layerId: string, patch: Partial<SummerSurfHeroLayer>) => void }) {
  const [transient, setTransient] = useState<{ layerId: string; x: number; y: number; width: number } | null>(null)
  const interaction = useRef<{ pointerId: number; layerId: string; mode: 'move' | 'resize'; startClientX: number; startClientY: number; startX: number; startY: number; startWidth: number; rectWidth: number; rectHeight: number } | null>(null)
  const compositionLayers = layers.filter((layer) => layer.presentation !== 'none' && layer.media?.src && !layer.embeddedInBase).sort((left, right) => left.zIndex - right.zIndex)

  const renderMedia = (media: SummerSurfHeroMedia, className: string, alt = '') => {
    const style: CSSProperties = { objectFit: media.fit ?? 'cover', objectPosition: media.position ?? 'center top' }
    return media.type === 'video' ? <video className={className} src={media.src} poster={media.poster} style={style} autoPlay muted loop playsInline /> : <img className={className} src={media.src} alt={alt} style={style} />
  }

  const begin = (event: ReactPointerEvent<HTMLElement>, layer: SummerSurfHeroLayer, mode: 'move' | 'resize') => {
    if (!layer.media?.src || layer.embeddedInBase) return
    event.preventDefault()
    event.stopPropagation()
    onSelect(layer.id)
    const canvas = event.currentTarget.closest('.studio-hero-composer-canvas')
    if (!(canvas instanceof HTMLElement)) return
    const rect = canvas.getBoundingClientRect()
    event.currentTarget.setPointerCapture(event.pointerId)
    interaction.current = { pointerId: event.pointerId, layerId: layer.id, mode, startClientX: event.clientX, startClientY: event.clientY, startX: layer.x, startY: layer.y, startWidth: layer.width, rectWidth: rect.width, rectHeight: rect.height }
    setTransient({ layerId: layer.id, x: layer.x, y: layer.y, width: layer.width })
  }

  const move = (event: ReactPointerEvent<HTMLElement>) => {
    const active = interaction.current
    if (!active || active.pointerId !== event.pointerId) return
    event.preventDefault()
    const deltaX = ((event.clientX - active.startClientX) / active.rectWidth) * HERO_WIDTH
    const deltaY = ((event.clientY - active.startClientY) / active.rectHeight) * HERO_HEIGHT
    setTransient({ layerId: active.layerId, x: active.mode === 'resize' ? active.startX : active.startX + deltaX, y: active.mode === 'resize' ? active.startY : active.startY + deltaY, width: active.mode === 'resize' ? Math.max(16, active.startWidth + deltaX) : active.startWidth })
  }

  const finish = (event: ReactPointerEvent<HTMLElement>) => {
    const active = interaction.current
    if (!active || active.pointerId !== event.pointerId) return
    const frame = transient
    if (frame?.layerId === active.layerId) onCommit(active.layerId, { x: Math.round(frame.x * 10) / 10, y: Math.round(frame.y * 10) / 10, width: Math.round(frame.width * 10) / 10 })
    interaction.current = null
    setTransient(null)
  }

  return (
    <div className="studio-hero-composer-canvas" data-testid="config-hero-layer-canvas" data-composition-layer-count={compositionLayers.length}>
      {renderMedia(baseMedia, 'studio-hero-composer-base', 'Hero 基础图')}
      {compositionLayers.map((layer) => {
        const frame = transient?.layerId === layer.id ? transient : layer
        const selected = selectedLayerId === layer.id
        return (
          <div key={layer.id} className={`studio-hero-composer-layer ${selected ? 'selected' : ''}`} style={{ left: `${(frame.x / HERO_WIDTH) * 100}%`, top: `${(frame.y / HERO_HEIGHT) * 100}%`, width: `${(frame.width / HERO_WIDTH) * 100}%`, zIndex: layer.zIndex + 2, transform: `rotate(${layer.rotation}deg)` }} onPointerDown={(event) => begin(event, layer, 'move')} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} data-card-id={layer.cardId}>
            {renderMedia(layer.media!, 'studio-hero-composer-layer-media')}
            {selected && <><span className="studio-hero-composer-label">{layer.label}</span><button type="button" className="studio-hero-composer-resize" aria-label={`缩放${layer.label}`} onPointerDown={(event) => begin(event, layer, 'resize')} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} /></>}
          </div>
        )
      })}
      <span className="studio-hero-composer-size">375 × 500</span>
    </div>
  )
}

const CORE_COLOR_FIELDS: Array<{ key: keyof SummerSurfEditConfig['colors']; label: string }> = [
  { key: 'page', label: '页面背景' },
  { key: 'heroBackground', label: 'Hero 兜底色' },
  { key: 'surface', label: '内容卡片' },
  { key: 'surfaceText', label: '主要文字' },
  { key: 'accent', label: '品牌强调色' },
  { key: 'actionStart', label: '主按钮起始色' },
  { key: 'actionEnd', label: '主按钮结束色' },
]

const ADVANCED_COLOR_FIELDS: Array<{ key: keyof SummerSurfEditConfig['colors']; label: string }> = [
  { key: 'mapBackground', label: '地图背景' },
  { key: 'mutedText', label: '辅助文字' },
  { key: 'accentText', label: '强调色文字' },
  { key: 'actionShadow', label: '按钮阴影' },
  { key: 'sideAction', label: '两侧操作底色' },
  { key: 'sideActionText', label: '两侧操作文字' },
  { key: 'tabSurface', label: 'Tab 轨道' },
  { key: 'tabText', label: 'Tab 文字' },
  { key: 'tabActiveSurface', label: '选中 Tab' },
  { key: 'tabActiveText', label: '选中 Tab 文字' },
  { key: 'cardBorder', label: '卡片描边' },
  { key: 'cardOwned', label: '已获得卡片' },
  { key: 'cardMissing', label: '未获得卡片' },
  { key: 'countBadge', label: '数字徽标' },
]

type DraftEntry = { id: string; name: string; config: SummerSurfEditConfig }

const DRAFTS_STORAGE_KEY = 'campaign-studio-drafts-v1'

const NIGHT_SURF_CARDS: SurfCard[] = [
  { id: 'hotpot', name: '沸腾火锅', emoji: '🥘', accent: '#ff7048', rarity: '普通', weight: 1 },
  { id: 'skewers', name: '滋滋烤串', emoji: '🍢', accent: '#ff9d3d', rarity: '普通', weight: 1 },
  { id: 'tofu', name: '冰爽豆花', emoji: '🍧', accent: '#f6c8ff', rarity: '普通', weight: 1 },
  { id: 'crayfish', name: '红运龙虾', emoji: '🦞', accent: '#ff4c3e', rarity: '普通', weight: 1 },
  { id: 'beer', name: '晚风冰杯', emoji: '🍺', accent: '#ffd55c', rarity: '普通', weight: 1 },
  { id: 'wrap', name: '街角卷饼', emoji: '🌯', accent: '#8ee66d', rarity: '普通', weight: 1 },
  { id: 'shrimp', name: '鲜活生腌', emoji: '🍤', accent: '#ff9da6', rarity: '普通', weight: 0.9 },
  { id: 'coconut', name: '月下糖水', emoji: '🥥', accent: '#78e0cf', rarity: '稀有', weight: 0.55 },
  { id: 'crown', name: '宵夜之王', emoji: '👑', accent: '#cbff46', rarity: '稀有', weight: 0.38 },
]

const NIGHT_SURF_TIERS: SurfTier[] = [
  { id: 'tier-2', threshold: 2, amount: '2', title: '夜宵立减券', condition: '满9元可用', reward: '¥2 夜宵立减券', icon: '¥2', kind: 'coupon' },
  { id: 'tier-4', threshold: 4, amount: '5', title: '夏夜加餐券', condition: '满29元可用', reward: '¥5 夏夜加餐券', icon: '¥5', kind: 'coupon' },
  { id: 'tier-7', threshold: 7, amount: '43', title: '夜宵欢聚券', condition: '满99元可用', reward: '¥43 夜宵欢聚券', icon: '¥43', kind: 'coupon' },
  { id: 'tier-9', threshold: 9, amount: '限定礼', title: '金勺纪念礼抽签码', condition: '集齐全套即可领取', reward: '金勺纪念礼抽签码', icon: '金勺', kind: 'grand' },
]

function createNightConfig(base: SummerSurfEditConfig): SummerSurfEditConfig {
  const next = cloneConfig(base)
  return {
    ...next,
    activeTheme: 'night',
    campaignName: '夏日夜食 · 默认',
    navLabel: '夏日夜食指南',
    accessibleTitle: '今晚开饭｜夏夜九味收藏计划',
    heroMedia: { type: 'image', src: '/assets/marketing-king/theme-assets/night/hero-scene.webp', fit: 'contain', position: 'center top', sourceWidth: 1125, sourceHeight: 1125 },
    heroComposition: { ...next.heroComposition, enabled: false, layers: [] },
    collectionTitle: '九味卡册',
    collectionEntryLabel: '卡册',
    collectionProgressVerb: '再集',
    cardNoun: '夜宵卡',
    missingCardLabel: '神秘夜味',
    drawLabel: '抽一张夜宵卡',
    energyEyebrow: '夜食副玩法',
    energyTitle: '夜食攒金豆，好礼兑不停',
    energyDescription: '已有8888🟡，攒一攒兑43元券 ›',
    energyCta: '攒!',
    energyVisual: '🥘',
    energyAnnouncement: '夏夜攒金豆玩法即将开放',
    topicsEyebrow: 'SUMMER NIGHT TOPICS',
    topicsTitle: '暑期 #灵感话题',
    topicChips: ['# 趁热吃顿夏夜小火锅', '# 我拍到了夏天的味道', '# 下班后的第一口快乐', '# 晚风里的烟火气', '# 夏夜碰杯计划', '# 夜宵搭子集合'],
    discoveryEyebrow: '热门夜食 · HOT!! · 🔥',
    discoveryTitle: '钻进夜色吃一夏',
    activityBanners: [{ eyebrow: 'NIGHT BITES', title: '深夜食堂地图' }, { eyebrow: 'AFTER DARK', title: '夏夜聚会灵感' }],
    cards: NIGHT_SURF_CARDS,
    tiers: NIGHT_SURF_TIERS,
    colors: { ...next.colors, page: '#24120d', heroBackground: '#1b0d09', surface: 'rgba(111, 56, 36, 0.98)', surfaceText: '#fff0d4', mutedText: '#c29b87', accent: '#caff42', accentText: '#1b170d', actionStart: '#ff5940', actionEnd: '#f33121', actionShadow: '#971b12', sideAction: 'rgba(110, 55, 34, 0.96)', sideActionText: '#ffe1b3', tabSurface: 'rgba(54, 25, 18, 0.92)', tabText: '#c9a693', tabActiveSurface: '#fff0d4', tabActiveText: '#4a1f11', cardBorder: '#9b654e', cardOwned: '#6f3824', cardMissing: '#3b1c13', countBadge: '#caff42' },
    inspirationCards: [
      { emoji: '🥘', image: '/assets/marketing-king/figma/topic-hotpot-card.webp', eyebrow: '深夜沸腾指南', title: '这口热气，最懂夏夜', action: '去发现更多', taskId: 'post' },
      { emoji: '🍢', image: '/assets/marketing-king/figma/topic-sunset-card.webp', eyebrow: '街角烟火地图', title: '把城市吃到发光', action: '去发现更多', taskId: 'store' },
      { emoji: '🍻', image: '/assets/marketing-king/figma/topic-lake-card.webp', eyebrow: '晚风碰杯指南', title: '和夜宵搭子再坐一会', action: '去发现更多', taskId: 'share' },
    ],
    venues: [
      { image: '/assets/marketing-king/figma/topic-hotpot-card.webp', location: '定西路夜市', title: '晚风一吹，今晚就吃小火锅' },
      { image: '/assets/marketing-king/figma/topic-sunset-card.webp', location: '滨江夜市', title: '落日之后，把城市吃到发光' },
      { image: '/assets/marketing-king/figma/topic-hotpot-card.webp', location: '昌里路夜市', title: '一桌热气，接住下班后的快乐' },
      { image: '/assets/marketing-king/figma/topic-lake-card.webp', location: '苏河夜生活带', title: '和夜宵搭子吹风到深夜' },
    ],
  }
}

function readSavedDrafts(): DraftEntry[] | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = JSON.parse(window.localStorage.getItem(DRAFTS_STORAGE_KEY) ?? 'null') as unknown
    if (!Array.isArray(saved) || !saved.length) return null
    const valid = saved.filter((item): item is DraftEntry => Boolean(item && typeof item === 'object' && typeof (item as DraftEntry).id === 'string' && (item as DraftEntry).config))
    return valid.length ? valid.map((item) => ({ ...item, config: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG, ...item.config, colors: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.colors, ...item.config.colors }, assets: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.assets, ...item.config.assets } } })) : null
  } catch {
    return null
  }
}

export default function SummerSurfEditPanel({ selection, onSelect, config, onConfigChange, onClose }: { selection: SummerSurfSelection | null; onSelect: (selection: SummerSurfSelection | null) => void; config: SummerSurfEditConfig; onConfigChange: (config: SummerSurfEditConfig) => void; onClose: () => void }) {
  const [previewMode, setPreviewMode] = useState(false)
  const [notice, setNotice] = useState('')
  const [importError, setImportError] = useState('')
  const [selectedPageId, setSelectedPageId] = useState('campaign-main')
  const [selectedHeroLayerId, setSelectedHeroLayerId] = useState<string | null>(() => config.heroComposition.layers[0]?.id ?? null)
  const [activeDraftId, setActiveDraftId] = useState('starter-summer')
  const [drafts, setDrafts] = useState<DraftEntry[]>(() => readSavedDrafts() ?? [
    { id: 'starter-summer', name: config.campaignName, config: cloneConfig(config) },
    { id: 'starter-night', name: '夏日夜食 · 默认', config: createNightConfig(config) },
  ])
  const selectedHeroLayer = config.heroComposition.layers.find((layer) => layer.id === selectedHeroLayerId) ?? null
  const selectedHeroCard = selectedHeroLayer ? config.cards.find((card) => card.id === selectedHeroLayer.cardId) : null
  const heroTransitionLibrary = useMemo(() => {
    const entries = new Map<string, { key: string; media: SummerSurfHeroMedia; sourceLayerIds: string[]; sourceLabels: string[] }>()
    config.heroComposition.layers.forEach((layer) => {
      const media = layer.transitionMedia
      if (!media?.src) return
      const key = media.assetId ?? media.src
      const current = entries.get(key)
      if (current) {
        current.sourceLayerIds.push(layer.id)
        current.sourceLabels.push(layer.label)
      } else {
        entries.set(key, { key, media, sourceLayerIds: [layer.id], sourceLabels: [layer.label] })
      }
    })
    return [...entries.values()]
  }, [config.heroComposition.layers])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
  }, [drafts])

  const updateConfig = <K extends keyof SummerSurfEditConfig>(key: K, value: SummerSurfEditConfig[K]) => {
    const next = { ...config, [key]: value }
    onConfigChange(next)
    setDrafts((current) => current.map((draft) => draft.id === activeDraftId ? { ...draft, name: next.campaignName, config: cloneConfig(next) } : draft))
  }
  const updateColor = (key: keyof SummerSurfEditConfig['colors'], value: string) => updateConfig('colors', { ...config.colors, [key]: value })
  const updateAsset = (key: keyof SummerSurfAssetConfig, value: string) => updateConfig('assets', { ...config.assets, [key]: value || undefined })
  const updateHeroMedia = (patch: Partial<SummerSurfHeroMedia>) => updateConfig('heroMedia', { ...config.heroMedia, ...patch })
  const updateHeroComposition = (patch: Partial<SummerSurfHeroComposition>) => updateConfig('heroComposition', { ...config.heroComposition, ...patch })
  const updateHeroLayer = (layerId: string, patch: Partial<SummerSurfHeroLayer>) => updateHeroComposition({ layers: config.heroComposition.layers.map((layer) => layer.id === layerId ? { ...layer, ...patch } : layer) })
  const updateCard = (index: number, patch: Partial<SurfCard>) => updateConfig('cards', config.cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card))
  const updateTier = (index: number, patch: Partial<SurfTier>) => {
    const current = config.tiers[index]
    const next = { ...current, ...patch }
    const reward = patch.reward ?? (next.amount === '限定礼' ? next.title : `¥${next.amount} ${next.title}`)
    updateConfig('tiers', config.tiers.map((tier, tierIndex) => tierIndex === index ? { ...next, reward } : tier))
  }
  const updateTask = (index: number, patch: Partial<SummerSurfEditConfig['tasks'][number]>) => updateConfig('tasks', config.tasks.map((task, taskIndex) => taskIndex === index ? { ...task, ...patch } : task))
  const updateInspiration = (index: number, patch: Partial<SummerSurfEditConfig['inspirationCards'][number]>) => updateConfig('inspirationCards', config.inspirationCards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card))
  const updateVenue = (index: number, patch: Partial<SummerSurfEditConfig['venues'][number]>) => updateConfig('venues', config.venues.map((venue, venueIndex) => venueIndex === index ? { ...venue, ...patch } : venue))
  const updateFlowEdge = (edgeId: string, patch: Partial<SummerSurfFlowEdge>) => updateConfig('flowEdges', config.flowEdges.map((edge) => edge.id === edgeId ? { ...edge, ...patch } : edge))
  const select = (target: SummerSurfTarget, label: string, kind: SummerSurfSelection['kind'] = 'section') => onSelect({ target, label, kind })
  const activeDraft = useMemo(() => drafts.find((draft) => draft.id === activeDraftId) ?? drafts[0], [activeDraftId, drafts])

  const chooseDraft = (draft: DraftEntry) => {
    setActiveDraftId(draft.id)
    setSelectedHeroLayerId(draft.config.heroComposition.layers[0]?.id ?? null)
    onConfigChange(cloneConfig(draft.config))
  }
  const addDraft = (theme: 'summer' | 'night') => {
    const id = `draft-${Date.now()}`
    const next = theme === 'night' ? createNightConfig(config) : cloneConfig({ ...config, activeTheme: 'summer', campaignName: '夏日冲浪 · 顺风顺水' })
    const draft = { id, name: next.campaignName, config: next }
    setDrafts((current) => [...current, draft])
    setActiveDraftId(id)
    setSelectedHeroLayerId(next.heroComposition.layers[0]?.id ?? null)
    onConfigChange(next)
  }
  const duplicateActive = () => {
    if (!activeDraft) return
    const id = `copy-${Date.now()}`
    const next = cloneConfig({ ...activeDraft.config, campaignName: `${activeDraft.config.campaignName} · 副本` })
    setDrafts((current) => [...current, { id, name: next.campaignName, config: next }])
    setActiveDraftId(id)
    setSelectedHeroLayerId(next.heroComposition.layers[0]?.id ?? null)
    onConfigChange(next)
  }
  const deleteActive = () => {
    if (drafts.length <= 1 || !activeDraft) return
    const nextDrafts = drafts.filter((draft) => draft.id !== activeDraft.id)
    setDrafts(nextDrafts)
    setActiveDraftId(nextDrafts[0].id)
    setSelectedHeroLayerId(nextDrafts[0].config.heroComposition.layers[0]?.id ?? null)
    onConfigChange(cloneConfig(nextDrafts[0].config))
  }
  const importDraft = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Partial<SummerSurfEditConfig> & { content?: Partial<SummerSurfEditConfig>; pack?: { colors?: Partial<SummerSurfEditConfig['colors']>; assets?: Partial<SummerSurfAssetConfig> } }
        const source = imported.content ? { ...imported, ...imported.content } : imported
        const next = { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG, ...source, colors: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.colors, ...imported.colors, ...imported.pack?.colors }, assets: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.assets, ...imported.assets, ...imported.pack?.assets } }
        const importedDraft = { id: `import-${Date.now()}`, name: next.campaignName, config: cloneConfig(next) }
        setDrafts((current) => [...current, importedDraft])
        setActiveDraftId(importedDraft.id)
        setSelectedHeroLayerId(next.heroComposition.layers[0]?.id ?? null)
        onConfigChange(next)
        setImportError('')
      } catch {
        setImportError('JSON 格式不可用')
      }
    }
    reader.readAsText(file)
  }
  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    return file
  }
  const uploadHero = (event: ChangeEvent<HTMLInputElement>) => {
    const file = pickFile(event)
    if (file) updateHeroMedia({ ...mediaFromFile(file, 'cover'), assetId: `${activeDraftId}:hero:start` })
  }
  const uploadEndFrame = (event: ChangeEvent<HTMLInputElement>) => {
    const file = pickFile(event)
    if (file) updateHeroComposition({ finalReference: { ...mediaFromFile(file, 'cover'), assetId: `${activeDraftId}:hero:end` } })
  }
  const uploadCard = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = pickFile(event)
    if (file) updateCard(index, { image: URL.createObjectURL(file), imageAssetId: `${activeDraftId}:card:${config.cards[index]?.id ?? index}`, imageWidth: 180, imageHeight: 220 })
  }
  const uploadCards = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    updateConfig('cards', config.cards.map((card, index) => files[index] ? { ...card, image: URL.createObjectURL(files[index]), imageAssetId: `${activeDraftId}:card:${card.id}`, imageWidth: 180, imageHeight: 220 } : card))
  }
  const uploadTier = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = pickFile(event)
    if (file) updateTier(index, { image: URL.createObjectURL(file), imageWidth: 132, imageHeight: 90 })
  }
  const uploadHeroLayer = (layerId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = pickFile(event)
    if (file) updateHeroLayer(layerId, { media: { ...mediaFromFile(file), assetId: `${activeDraftId}:hero-layer:${layerId}` } })
  }
  const uploadTransition = (layerId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = pickFile(event)
    if (file) updateHeroLayer(layerId, { transitionMedia: { ...mediaFromFile(file, 'cover'), assetId: `${activeDraftId}:transition:${layerId}` }, presentation: 'video-transition' })
  }
  const uploadPoster = (layerId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = pickFile(event)
    if (file) updateHeroLayer(layerId, { transitionMedia: { ...(selectedHeroLayer?.transitionMedia ?? { type: 'video', src: '' }), poster: URL.createObjectURL(file), posterAssetId: `${activeDraftId}:transition-poster:${layerId}`, type: 'video' } })
  }
  const reuseHeroTransition = (layerId: string, transition: (typeof heroTransitionLibrary)[number]) => {
    updateHeroLayer(layerId, { transitionMedia: { ...transition.media }, presentation: 'video-transition' })
  }
  return (
    <aside className={`studio-inspector summer-surf-inspector ${previewMode ? 'is-readonly' : ''}`} data-readonly={previewMode} data-selected-target={selection?.target ?? ''} aria-label="Marketing King 活动编辑面板">
      <div className="studio-inspector-workbar">
        <button type="button" aria-label="帮助与支持" title="帮助与支持"><CircleHelp size={14} strokeWidth={1.7} /></button>
        <button type="button" className={previewMode ? 'active' : ''} onClick={() => setPreviewMode((value) => !value)}>{previewMode ? '退出预览' : '预览'}</button>
        <button type="button" className="publish" onClick={() => setNotice('已应用到活动页')}>发布</button>
        <button type="button" aria-label="关闭编辑面板" title="关闭编辑面板" onClick={onClose}><X size={14} strokeWidth={1.7} /></button>
      </div>
      <header className="studio-inspector-header">
        <div><small>正在编辑</small><strong>{config.campaignName}</strong></div>
        <span>{notice || '配置完整'}</span>
      </header>
      <div className="studio-inspector-group studio-project-group" data-testid="inspector-group-project">
        <div className="studio-inspector-group-title"><span>Project</span><strong>页面与方案</strong></div>
        <details open data-setting-id="pages">
          <SectionSummary index="P1">页面与跳转</SectionSummary>
          <div className="studio-section-body">
            <div className="studio-project-summary"><span><strong>{config.pages.length} 个页面</strong><small>1 个起始页 · 1 个 overlay</small></span><button type="button" onClick={() => select('page', '页面流程')}>在 Canvas 查看流程</button></div>
            <div className="studio-project-pages">{config.pages.map((page: SummerSurfPageNode) => <button key={page.id} type="button" className={selectedPageId === page.id ? 'active' : ''} onClick={() => { setSelectedPageId(page.id); select(page.kind === 'overlay' ? 'page' : page.id === 'campaign-main' ? 'hero' : 'page', page.name) }}><span>{page.order}</span><i className={`studio-page-kind ${page.kind}`} aria-hidden /><b>{page.name}</b><small>{page.id === 'loading' ? 'Start' : page.kind === 'overlay' ? 'Overlay' : page.status === 'ready' ? 'Ready' : 'Draft'}</small></button>)}</div>
            <details className="studio-subdetails"><summary>跳转事件与动作</summary><div className="studio-flow-edge-editor">{config.flowEdges.map((edge) => { const fromPage = config.pages.find((page) => page.id === edge.fromPageId); return <article key={edge.id}><span><small>{fromPage?.name}</small><input type="text" value={edge.eventKey} onChange={(event) => updateFlowEdge(edge.id, { eventKey: event.target.value })} aria-label={`${fromPage?.name}触发事件`} /></span><select value={edge.navigation} onChange={(event) => updateFlowEdge(edge.id, { navigation: event.target.value as SummerSurfFlowEdge['navigation'] })} aria-label={`${fromPage?.name}导航方式`}><option value="push">push</option><option value="replace">replace</option><option value="overlay">overlay</option><option value="back">back</option></select><select value={edge.targetPageId} onChange={(event) => updateFlowEdge(edge.id, { targetPageId: event.target.value })} aria-label={`${fromPage?.name}目标页面`}>{config.pages.map((page) => <option value={page.id} key={page.id}>→ {page.name}</option>)}</select></article> })}</div></details>
          </div>
        </details>
        <details open data-setting-id="schemes">
          <SectionSummary index="P2">多主题方案</SectionSummary>
          <div className="studio-section-body studio-scheme-panel">
            <div className="studio-inspector-create-row"><button type="button" onClick={() => addDraft('summer')}>新建夏日方案</button><button type="button" onClick={() => addDraft('night')}>新建夜食方案</button></div>
            <div className="studio-inspector-scheme-list" aria-label="主题方案">{drafts.map((draft) => <button key={draft.id} type="button" className={draft.id === activeDraftId ? 'active' : ''} onClick={() => chooseDraft(draft)}><i style={{ background: draft.config.colors.accent }} aria-hidden /><span><strong>{draft.name}</strong><small>{draft.config.activeTheme === 'summer' ? '夏日模板' : '夜食模板'}</small></span><b>{draft.id === activeDraftId ? '当前' : '切换'}</b></button>)}</div>
            <div className="studio-inspector-scheme-actions"><button type="button" onClick={duplicateActive}><Copy size={12} />复制</button><label className="studio-file-button"><Upload size={12} />导入 JSON<input type="file" accept="application/json,.json" onChange={importDraft} /></label><button type="button" className="danger" disabled={drafts.length <= 1} onClick={deleteActive}><Trash2 size={12} />删除</button></div>
            {importError && <p className="studio-error">导入失败：{importError}</p>}
          </div>
        </details>
      </div>
      <div className="studio-inspector-group" data-testid="inspector-group-global">
        <div className="studio-inspector-group-title"><span>Global</span><strong>全局设置</strong></div>
        <details open data-setting-id="theme"><SectionSummary index="G1">主题基础</SectionSummary><div className="studio-section-body"><Field label="方案名称"><input value={config.campaignName} onChange={(event) => updateConfig('campaignName', event.target.value)} /></Field><Field label="主题 Tab 文案" hint="建议不超过 8 个汉字"><input value={config.navLabel} onChange={(event) => updateConfig('navLabel', event.target.value)} /></Field><Field label="无障碍标题"><input value={config.accessibleTitle} onChange={(event) => updateConfig('accessibleTitle', event.target.value)} /></Field></div></details>
        <details open data-setting-id="brand"><SectionSummary index="G2">品牌配色</SectionSummary><div className="studio-section-body"><p className="studio-section-note">全局语义色会联动多个模块；模块内的局部素材仍在对应模块中配置。</p><div className="studio-color-grid">{CORE_COLOR_FIELDS.map((field) => <ColorField key={field.key} label={field.label} value={config.colors[field.key]} onChange={(value) => updateColor(field.key, value)} />)}</div><details className="studio-subdetails"><summary>高级颜色 token</summary><div className="studio-color-grid">{ADVANCED_COLOR_FIELDS.map((field) => <ColorField key={field.key} label={field.label} value={config.colors[field.key]} onChange={(value) => updateColor(field.key, value)} />)}</div></details></div></details>
      </div>
      <div className="studio-inspector-group" data-testid="inspector-group-modules">
        <div className="studio-inspector-group-title"><span>Modules</span><strong>页面模块</strong></div>
        <details open data-module-id="hero"><SectionSummary index="M1">首焦与主操作</SectionSummary><div className="studio-section-body">
          <ModuleButton label="375 × 500" onClick={() => select('hero', '首焦与主操作')} />
          <div className="studio-hero-frame-grid"><div className="studio-hero-frame-card"><AssetPreview src={config.heroMedia.src} fallback="Hero" alt="Hero 首帧预览" displaySize="首帧 · 进入活动与抽卡前显示" /><span><strong>首帧</strong><small>上传图片或视频</small><b>上传素材</b></span><input type="file" accept="image/*,video/*" onChange={uploadHero} /></div><div className="studio-hero-frame-card"><AssetPreview src={config.heroComposition.finalReference?.src} fallback="待上传" alt="Hero 尾帧预览" displaySize="尾帧 · 两段过场播放完成后停留" /><span><strong>尾帧</strong><small>过场播放完成后停留</small><b>上传图片</b></span><input type="file" accept="image/*" onChange={uploadEndFrame} /></div></div>
          <Field label="首帧素材地址"><input value={config.heroMedia.src} onChange={(event) => updateHeroMedia({ src: event.target.value })} /></Field>
          <Field label="首帧媒体类型"><select value={config.heroMedia.type} onChange={(event) => updateHeroMedia({ type: event.target.value as SummerSurfHeroMedia['type'] })}><option value="image">图片</option><option value="video">视频</option></select></Field>
          <Field label="尾帧素材地址"><input value={config.heroComposition.finalReference?.src ?? ''} onChange={(event) => updateHeroComposition({ finalReference: event.target.value ? { ...(config.heroComposition.finalReference ?? { type: 'image' }), src: event.target.value } : undefined })} /></Field>
          <div className="studio-two-fields"><Field label="填充方式"><select value={config.heroMedia.fit ?? 'cover'} onChange={(event) => updateHeroMedia({ fit: event.target.value as 'cover' | 'contain' })}><option value="cover">铺满裁切</option><option value="contain">完整展示</option></select></Field><Field label="焦点"><select value={config.heroMedia.position ?? 'center top'} onChange={(event) => updateHeroMedia({ position: event.target.value })}><option value="center top">顶部居中</option><option value="center center">中心</option><option value="left top">左上</option><option value="right top">右上</option><option value="center bottom">底部居中</option></select></Field></div>
          <Field label="主按钮文案" hint="建议不超过 10 个汉字"><input value={config.drawLabel} onChange={(event) => updateConfig('drawLabel', event.target.value)} /></Field><Field label="左侧入口单位"><input value={config.collectionEntryLabel} onChange={(event) => updateConfig('collectionEntryLabel', event.target.value)} /></Field>
          <details className="studio-subdetails"><summary>首焦模块高级素材</summary><div className="studio-subsection-body"><Field label="地图背景图"><input value={config.assets.mapBackgroundImage ?? ''} onChange={(event) => updateAsset('mapBackgroundImage', event.target.value)} /></Field><Field label="主按钮皮肤"><input value={config.assets.actionButtonImage ?? ''} onChange={(event) => updateAsset('actionButtonImage', event.target.value)} /></Field></div></details>
        </div></details>
        <details data-module-id="collection"><SectionSummary index="M2">集卡与奖励</SectionSummary><div className="studio-section-body">
          <p className="studio-section-note">当前主题包含 {config.cards.length} 张卡片和 {config.tiers.length} 档奖励；稳定 ID 不随换肤改变。</p>
          <section className="studio-hero-layer-editor" aria-label="Hero 道具图层"><div className="studio-hero-layer-heading"><div><strong>Hero 道具图层</strong><span>已配置 {config.heroComposition.layers.filter((layer) => layer.media?.src || layer.embeddedInBase).length}/{config.heroComposition.layers.length} 个道具</span></div><label className="studio-toggle"><input type="checkbox" checked={config.heroComposition.enabled} onChange={(event) => updateHeroComposition({ enabled: event.target.checked })} /><i aria-hidden /><span>{config.heroComposition.enabled ? '已启用' : '已停用'}</span></label></div><p className="studio-hero-layer-note">组合画布常显所有已配置图层；选择卡片只切换编辑焦点，不会隐藏其他素材。</p><HeroLayerComposer baseMedia={config.heroComposition.finalReference ?? config.heroMedia} layers={config.heroComposition.layers} selectedLayerId={selectedHeroLayerId ?? ''} onSelect={setSelectedHeroLayerId} onCommit={updateHeroLayer} /><div className="studio-hero-layer-list-heading"><strong>{config.heroComposition.layers.length} 个道具素材</strong><span>点选后在上方组合画布中定位</span></div><div className="studio-hero-layer-cards" role="tablist" aria-label="选择要定位的道具图层">{config.heroComposition.layers.map((layer) => { const card = config.cards.find((item) => item.id === layer.cardId); const isSelected = selectedHeroLayerId === layer.id; return <button key={layer.id} type="button" role="tab" aria-selected={isSelected} className={`${isSelected ? 'selected' : ''} ${layer.media?.src || layer.embeddedInBase ? 'configured' : 'missing'}`} onClick={() => setSelectedHeroLayerId(layer.id)}><i style={{ background: card?.accent }}>{layer.media?.src ? <img src={layer.media.src} alt="" /> : card?.image ? <img src={card.image} alt="" /> : <span>{card?.emoji ?? '?'}</span>}</i><b>{card?.name ?? layer.label}</b><small>{layer.presentation === 'video-transition' ? layer.transitionMedia?.src ? '视频过场' : '待上传视频' : layer.presentation === 'none' ? '不呈现' : layer.embeddedInBase ? '底图已含' : layer.media?.src ? '独立图层' : '待上传'}</small></button> })}</div>
          {selectedHeroLayer && <div className="studio-hero-layer-properties"><div className="studio-hero-layer-selected"><div><strong>{selectedHeroLayer.label}</strong><span>稳定卡片 ID：<code>{selectedHeroLayer.cardId}</code></span></div><span className="studio-hero-layer-effect-badge">{selectedHeroLayer.presentation === 'video-transition' ? '视频过场' : selectedHeroLayer.presentation === 'none' ? '不呈现' : '图片叠加'}</span></div><div className="studio-two-fields"><Field label="获得方式"><select value={selectedHeroLayer.unlockMethod ?? 'draw'} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { unlockMethod: event.target.value as SummerSurfHeroLayer['unlockMethod'] })}><option value="first-gift">首次赠送</option><option value="draw">抽中本卡</option><option value="points">积分获得</option></select></Field><Field label="点亮后效果"><select value={selectedHeroLayer.presentation ?? 'image-layer'} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { presentation: event.target.value as SummerSurfHeroLayer['presentation'] })}><option value="image-layer">图片叠加到 Hero</option><option value="video-transition">播放视频过场</option><option value="none">仅点亮卡片</option></select></Field></div>{selectedHeroLayer.unlockMethod === 'points' && <Field label="所需积分"><input type="number" min="1" value={selectedHeroLayer.pointsCost ?? 100} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { pointsCost: Math.max(1, Number(event.target.value) || 1) })} /></Field>}{selectedHeroLayer.presentation !== 'none' && <><div className="studio-hero-layer-asset-choices"><label className="studio-hero-layer-asset-choice"><span className="studio-hero-layer-asset-thumb">{selectedHeroCard?.image ? <img src={selectedHeroCard.image} alt="卡片素材预览" /> : <i>+</i>}</span><b>卡片图</b><small>集卡槽 · {selectedHeroCard?.imageWidth ?? 180} × {selectedHeroCard?.imageHeight ?? 220}</small><input type="file" accept="image/*" onChange={(event) => selectedHeroCard && uploadCard(config.cards.findIndex((card) => card.id === selectedHeroCard.id), event)} /></label><label className="studio-hero-layer-asset-choice"><span className="studio-hero-layer-asset-thumb">{selectedHeroLayer.media?.src ? <img src={selectedHeroLayer.media.src} alt="Hero 透明图层预览" /> : <i>+</i>}</span><b>Hero 图层</b><small>首焦叠加 · 透明 PNG/WebP</small><input type="file" accept="image/png,image/webp,image/avif" onChange={(event) => uploadHeroLayer(selectedHeroLayer.id, event)} /></label></div><label className="studio-hero-layer-embedded"><input type="checkbox" checked={Boolean(selectedHeroLayer.embeddedInBase)} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { embeddedInBase: event.target.checked })} /><span>已烘焙进基础图<small>此状态不会再叠加图片，适合默认赠送的首个道具。</small></span></label><div className="studio-three-fields"><Field label="X"><input type="number" value={selectedHeroLayer.x} disabled={selectedHeroLayer.embeddedInBase} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { x: Number(event.target.value) || 0 })} /></Field><Field label="Y"><input type="number" value={selectedHeroLayer.y} disabled={selectedHeroLayer.embeddedInBase} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { y: Number(event.target.value) || 0 })} /></Field><Field label="宽度"><input type="number" min="8" max="750" value={selectedHeroLayer.width} disabled={selectedHeroLayer.embeddedInBase} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { width: Math.max(8, Number(event.target.value) || 8) })} /></Field></div><div className="studio-two-fields"><Field label="旋转角度"><input type="number" min="-180" max="180" value={selectedHeroLayer.rotation} disabled={selectedHeroLayer.embeddedInBase} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { rotation: Number(event.target.value) || 0 })} /></Field><Field label="图层顺序"><input type="number" min="1" max="20" value={selectedHeroLayer.zIndex} disabled={selectedHeroLayer.embeddedInBase} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { zIndex: Math.max(1, Math.min(20, Number(event.target.value) || 1)) })} /></Field></div><button type="button" className="studio-hero-layer-reset" onClick={() => updateHeroLayer(selectedHeroLayer.id, { x: 0, y: 0, width: 64, rotation: 0, zIndex: 2 })}><RotateCcw size={12} />重置当前图层位置</button>{selectedHeroLayer.presentation === 'video-transition' && <div className="studio-hero-video-editor"><Field label="视频地址"><input value={selectedHeroLayer.transitionMedia?.src ?? ''} onChange={(event) => updateHeroLayer(selectedHeroLayer.id, { transitionMedia: { ...(selectedHeroLayer.transitionMedia ?? { type: 'video' }), type: 'video', src: event.target.value } })} /></Field><div className="studio-hero-layer-asset-actions"><label className="studio-mini-upload">上传新视频<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => uploadTransition(selectedHeroLayer.id, event)} /></label><label className="studio-mini-upload">上传封面图<input type="file" accept="image/*" onChange={(event) => uploadPoster(selectedHeroLayer.id, event)} /></label></div></div>}</>}</div>}
            {selectedHeroLayer?.presentation === 'video-transition' && (
              <section className="studio-hero-transition-library" data-testid="config-hero-transition-library">
                <div className="studio-hero-transition-library-heading">
                  <div><strong>已上传动画</strong><small>可被多个道具卡共用</small></div>
                  <span>{heroTransitionLibrary.length} 个</span>
                </div>
                {heroTransitionLibrary.length > 0 ? (
                  <div className="studio-hero-transition-options" role="radiogroup" aria-label="选择已上传的过场动画">
                    {heroTransitionLibrary.map((transition) => {
                      const selected = transition.sourceLayerIds.includes(selectedHeroLayer.id)
                      return <button key={transition.key} type="button" className="studio-hero-transition-option" data-selected={selected} role="radio" aria-checked={selected} onClick={() => reuseHeroTransition(selectedHeroLayer.id, transition)}>
                        <span className="studio-hero-transition-thumb">{transition.media.poster ? <span className="studio-hero-transition-poster" style={{ backgroundImage: `url(${transition.media.poster})` }} aria-hidden /> : <i aria-hidden>▶</i>}</span>
                        <span className="studio-hero-transition-copy"><b>{transition.sourceLabels.join('、')}</b><small>{transition.media.sourceWidth && transition.media.sourceHeight ? `${transition.media.sourceWidth} × ${transition.media.sourceHeight} px` : '视频过场'} · {transition.sourceLayerIds.length} 张卡使用</small></span>
                        <span className="studio-hero-transition-check" aria-hidden>{selected ? '✓' : ''}</span>
                      </button>
                    })}
                  </div>
                ) : <p className="studio-hero-transition-library-empty">暂无可复用动画，上传后会自动出现在这里。</p>}
              </section>
            )}
          </section>
          <Field label="卡册名称"><input value={config.collectionTitle} onChange={(event) => updateConfig('collectionTitle', event.target.value)} /></Field><div className="studio-two-fields"><Field label="进度动词"><input value={config.collectionProgressVerb} onChange={(event) => updateConfig('collectionProgressVerb', event.target.value)} /></Field><Field label="卡片单位"><input value={config.cardNoun} onChange={(event) => updateConfig('cardNoun', event.target.value)} /></Field></div><Field label="未获得卡片名称"><input value={config.missingCardLabel} onChange={(event) => updateConfig('missingCardLabel', event.target.value)} /></Field><label className="studio-mini-upload">批量上传卡片（按文件顺序映射前 {config.cards.length} 张）<input type="file" accept="image/*" multiple onChange={uploadCards} /></label>
          <div className="studio-item-list">{config.cards.map((card, index) => <details className="studio-item" key={card.id}><summary><i className="studio-item-thumb" style={{ background: card.accent }}>{card.image ? <img src={card.image} alt="" /> : <span>{card.emoji}</span>}</i><span className="studio-item-name">{index + 1}. {card.name}</span><small>{card.rarity}</small></summary><div className="studio-item-body"><AssetPreview src={card.image} fallback={card.emoji} alt={`${card.name}当前素材`} displaySize={`页面展示容器：59 × 72 px · 当前文件：${card.imageWidth ?? '未知'} × ${card.imageHeight ?? '未知'} px`} recommended="建议透明 PNG/WebP 180 × 220 px" /><Field label="卡片名称"><input value={card.name} onChange={(event) => updateCard(index, { name: event.target.value })} /></Field><div className="studio-two-fields"><Field label="Emoji 兜底"><input value={card.emoji} onChange={(event) => updateCard(index, { emoji: event.target.value })} /></Field><ColorField label="卡片强调色" value={card.accent} onChange={(value) => updateCard(index, { accent: value })} /></div><Field label="素材地址"><input value={card.image ?? ''} onChange={(event) => updateCard(index, { image: event.target.value || undefined })} /></Field><label className="studio-mini-upload">上传替换 · 推荐 180 × 220 px<input type="file" accept="image/*" onChange={(event) => uploadCard(index, event)} /></label></div></details>)}</div>
          <h3 className="studio-small-heading">奖励档位</h3><div className="studio-item-list">{config.tiers.map((tier, index) => <details className="studio-item" key={tier.id}><summary><i className={`studio-item-thumb reward ${tier.kind === 'grand' ? 'grand' : 'coupon'}`}>{tier.image ? <img src={tier.image} alt="" /> : <span>{tier.icon}</span>}</i><span className="studio-item-name">集齐 {tier.threshold} 种 · {tier.title}</span><small>{tier.icon}</small></summary><div className="studio-item-body"><AssetPreview src={tier.image} fallback={tier.icon} alt={`${tier.title}当前素材`} displaySize={tier.kind === 'grand' ? '44 × 30 px' : '46 × 27 px'} recommended={tier.kind === 'grand' ? '建议透明 PNG/WebP 至少 132 × 90 px' : '建议透明 PNG/WebP 至少 140 × 82 px'} /><div className="studio-two-fields"><Field label="集齐种数"><input type="number" min="1" max="9" value={tier.threshold} onChange={(event) => updateTier(index, { threshold: Math.max(1, Math.min(9, Number(event.target.value) || 1)) })} /></Field><Field label="金额/奖励"><input value={tier.amount} onChange={(event) => updateTier(index, { amount: event.target.value })} /></Field></div><Field label="奖励名称"><input value={tier.title} onChange={(event) => updateTier(index, { title: event.target.value })} /></Field><Field label="使用条件"><input value={tier.condition} onChange={(event) => updateTier(index, { condition: event.target.value })} /></Field><Field label="奖励图中文字 / 无图片时兜底"><input value={tier.icon} onChange={(event) => updateTier(index, { icon: event.target.value })} /></Field><Field label="奖励图片地址"><input value={tier.image ?? ''} onChange={(event) => updateTier(index, { image: event.target.value || undefined })} /></Field><label className="studio-mini-upload">上传奖励图 · {tier.kind === 'grand' ? '建议至少 132 × 90 px' : '建议至少 140 × 82 px'}<input type="file" accept="image/*" onChange={(event) => uploadTier(index, event)} /></label></div></details>)}</div>
          <details className="studio-subdetails"><summary>集卡模块高级样式</summary><div className="studio-subsection-body"><Field label="奖励货架皮肤"><input value={config.assets.rewardShelfImage ?? ''} onChange={(event) => updateAsset('rewardShelfImage', event.target.value)} /></Field><Field label="优惠券框"><input value={config.assets.tierFrameImage ?? ''} onChange={(event) => updateAsset('tierFrameImage', event.target.value)} /></Field><Field label="已获得卡框"><input value={config.assets.cardOwnedFrameImage ?? ''} onChange={(event) => updateAsset('cardOwnedFrameImage', event.target.value)} /></Field><Field label="未获得卡框"><input value={config.assets.cardMissingFrameImage ?? ''} onChange={(event) => updateAsset('cardMissingFrameImage', event.target.value)} /></Field></div></details>
        </div></details>
        <details data-module-id="side-game"><SectionSummary index="M3">副玩法卡</SectionSummary><div className="studio-section-body"><Field label="模块眉题"><input value={config.energyEyebrow} onChange={(event) => updateConfig('energyEyebrow', event.target.value)} /></Field><Field label="副玩法标题"><input value={config.energyTitle} onChange={(event) => updateConfig('energyTitle', event.target.value)} /></Field><Field label="副玩法说明"><textarea value={config.energyDescription} onChange={(event) => updateConfig('energyDescription', event.target.value)} /></Field><Field label="角色图片地址" hint="页面展示区域约 70 × 78 px"><input value={config.energyImage} onChange={(event) => updateConfig('energyImage', event.target.value)} /></Field><div className="studio-two-fields"><Field label="Emoji 兜底"><input value={config.energyVisual} onChange={(event) => updateConfig('energyVisual', event.target.value)} /></Field><Field label="按钮文案"><input value={config.energyCta} onChange={(event) => updateConfig('energyCta', event.target.value)} /></Field></div><div className="studio-two-fields"><Field label="角标"><input value={config.energyBadge} onChange={(event) => updateConfig('energyBadge', event.target.value)} /></Field><Field label="点击提示"><input value={config.energyAnnouncement} onChange={(event) => updateConfig('energyAnnouncement', event.target.value)} /></Field></div></div></details>
        <details data-module-id="tasks"><SectionSummary index="M4">任务区</SectionSummary><div className="studio-section-body"><Field label="任务区标题"><input value={config.tasksTitle} onChange={(event) => updateConfig('tasksTitle', event.target.value)} /></Field><div className="studio-two-fields"><Field label="任务 Tab 1"><input value={config.drawTabLabel} onChange={(event) => updateConfig('drawTabLabel', event.target.value)} /></Field><Field label="任务 Tab 2"><input value={config.energyTabLabel} onChange={(event) => updateConfig('energyTabLabel', event.target.value)} /></Field></div><div className="studio-item-list">{config.tasks.map((task, index) => <details className="studio-item" key={task.id}><summary><i className="studio-item-thumb compact"><span>{task.icon}</span></i><span className="studio-item-name">{task.title}</span><small>{task.target} 次 / +{task.reward}</small></summary><div className="studio-item-body"><div className="studio-two-fields"><Field label="图标"><input value={task.icon} onChange={(event) => updateTask(index, { icon: event.target.value })} /></Field><Field label="按钮文案"><input value={task.action} onChange={(event) => updateTask(index, { action: event.target.value })} /></Field></div><Field label="任务标题"><input value={task.title} onChange={(event) => updateTask(index, { title: event.target.value })} /></Field><Field label="任务说明"><textarea value={task.description} onChange={(event) => updateTask(index, { description: event.target.value })} /></Field><div className="studio-two-fields"><Field label="完成目标"><input type="number" min="1" value={task.target} onChange={(event) => updateTask(index, { target: Math.max(1, Number(event.target.value) || 1) })} /></Field><Field label="奖励次数"><input type="number" min="0" value={task.reward} onChange={(event) => updateTask(index, { reward: Math.max(0, Number(event.target.value) || 0) })} /></Field></div><label className="studio-checkbox-field"><input type="checkbox" checked={Boolean(task.repeatable)} onChange={(event) => updateTask(index, { repeatable: event.target.checked })} /><span>可重复任务</span></label></div></details>)}</div></div></details>
        <details data-module-id="topics"><SectionSummary index="M5">话题与灵感</SectionSummary><div className="studio-section-body"><Field label="英文眉题"><input value={config.topicsEyebrow} onChange={(event) => updateConfig('topicsEyebrow', event.target.value)} /></Field><Field label="话题区标题"><input value={config.topicsTitle} onChange={(event) => updateConfig('topicsTitle', event.target.value)} /></Field><Field label="话题标签" hint="每行一个，当前模板固定 6 个槽位"><textarea value={config.topicChips.join('\n')} onChange={(event) => updateConfig('topicChips', event.target.value.split('\n').slice(0, 6))} /></Field><div className="studio-item-list">{config.inspirationCards.map((card, index) => <details className="studio-item" key={`${index}-${card.title}`}><summary><i className="studio-item-thumb compact">{card.image ? <img src={card.image} alt="" /> : <span>{card.emoji}</span>}</i><span className="studio-item-name">灵感卡 {index + 1} · {card.title}</span></summary><div className="studio-item-body"><Field label="图片地址" hint="图片在卡片内按 cover 展示"><input value={card.image} onChange={(event) => updateInspiration(index, { image: event.target.value })} /></Field><div className="studio-two-fields"><Field label="Emoji 兜底"><input value={card.emoji} onChange={(event) => updateInspiration(index, { emoji: event.target.value })} /></Field><Field label="眉题"><input value={card.eyebrow} onChange={(event) => updateInspiration(index, { eyebrow: event.target.value })} /></Field></div><Field label="标题"><input value={card.title} onChange={(event) => updateInspiration(index, { title: event.target.value })} /></Field><Field label="按钮文案"><input value={card.action} onChange={(event) => updateInspiration(index, { action: event.target.value })} /></Field></div></details>)}</div></div></details>
        <details data-module-id="discovery"><SectionSummary index="M6">内容发现</SectionSummary><div className="studio-section-body"><Field label="模块眉题"><input value={config.discoveryEyebrow} onChange={(event) => updateConfig('discoveryEyebrow', event.target.value)} /></Field><Field label="内容发现标题"><input value={config.discoveryTitle} onChange={(event) => updateConfig('discoveryTitle', event.target.value)} /></Field><div className="studio-item-list">{config.venues.map((venue, index) => <details className="studio-item" key={`${index}-${venue.title}`}><summary><i className="studio-item-thumb compact"><img src={venue.image} alt="" /></i><span className="studio-item-name">内容卡 {index + 1} · {venue.title}</span></summary><div className="studio-item-body"><Field label="封面图片地址" hint="双列卡片按 cover 展示"><input value={venue.image} onChange={(event) => updateVenue(index, { image: event.target.value })} /></Field><Field label="地点"><input value={venue.location} onChange={(event) => updateVenue(index, { location: event.target.value })} /></Field><Field label="标题"><input value={venue.title} onChange={(event) => updateVenue(index, { title: event.target.value })} /></Field></div></details>)}</div></div></details>
        <details data-module-id="activities"><SectionSummary index="M7">更多精彩活动</SectionSummary><div className="studio-section-body"><p className="studio-section-note">当前模板固定两个 Banner 位；文案与跳转能力沿用 Marketing King 活动草稿。</p>{config.activityBanners.map((banner, index) => <div className="studio-inline-card" key={`${index}-${banner.title}`}><b>活动 Banner {index + 1}</b><input aria-label={`Banner ${index + 1} 眉题`} value={banner.eyebrow} onChange={(event) => updateConfig('activityBanners', config.activityBanners.map((item, itemIndex) => itemIndex === index ? { ...item, eyebrow: event.target.value } : item))} /><input aria-label={`Banner ${index + 1} 标题`} value={banner.title} onChange={(event) => updateConfig('activityBanners', config.activityBanners.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /></div>)}</div></details>
      </div>
      <button type="button" className="studio-reset-button" onClick={() => { onConfigChange(cloneConfig(DEFAULT_SUMMER_SURF_EDIT_CONFIG)); setNotice('已恢复默认活动配置') }}><Check size={13} strokeWidth={1.8} />恢复默认活动配置</button>
    </aside>
  )
}
