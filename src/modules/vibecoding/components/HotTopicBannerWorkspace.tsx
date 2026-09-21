import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { toast } from 'sonner'
import {
  Brush,
  Check,
  Download,
  Eye,
  FileJson,
  History,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquareText,
  Move,
  RotateCcw,
  Save,
  ShieldCheck,
  Type,
  WandSparkles,
  X,
} from '@/shared/icons'
import {
  buildImageHtmlSidecar,
  cloneLayeredArtworkDocument,
  downloadLayeredArtworkPng,
  downloadTextFile,
  validateLayeredArtworkDocument,
  type LayeredArtworkDocument,
  type LayeredArtworkLayer,
} from './LayeredArtworkDocument'

type ArtworkId = 'banner' | 'poster'
type BrushSelection = { x: number; y: number; width: number; height: number }
type EditorTab = 'layers' | 'spec'
type GenerationMode = 'comment' | 'brush'
type Gesture = {
  id: string
  mode: 'move' | 'resize'
  startClientX: number
  startClientY: number
  startLayer: LayeredArtworkLayer
  before: LayeredArtworkDocument
}

type ArtworkDefinition = {
  id: ArtworkId
  shortLabel: string
  document: LayeredArtworkDocument
  maxDisplayWidth: number
  notes: readonly string[]
  specRows: readonly [string, string][]
  protectedRegions: readonly BrushSelection[]
  downloadName: string
}

type HistoryState = {
  past: LayeredArtworkDocument[]
  future: LayeredArtworkDocument[]
}

const STORAGE_KEY = 'creative-studio:layered-artworks:v2'

const BANNER_DOCUMENT: LayeredArtworkDocument = {
  schemaVersion: 1,
  id: 'life-service-hot-topic-banner',
  title: '行业热点专项 Banner',
  version: '6.7.8',
  canvas: { width: 1170, height: 330 },
  templateRef: {
    id: 'template.hot-topic-banner',
    version: '6.7.8',
    name: '无 IP 热点话题 Banner',
  },
  styleBibleRef: {
    id: 'brand.douyin-life-service-resource-spec',
    version: '1.0.0',
    name: '生活服务资源位规范',
  },
  source: {
    generator: '生服热点话题 Banner Skill',
    mode: 'structured_template',
    benchmark: '生活服务常见资源位设计规范',
    output: '1170×330 RGB PNG + 780×220 同步规格',
  },
  layerTree: [
    { id: 'banner-visual', name: '主视觉', layerIds: ['scene', 'brand-logo'], locked: true },
    { id: 'banner-copy', name: '可编辑文案', layerIds: ['title', 'subtitle'] },
  ],
  layers: [
    {
      id: 'scene',
      name: '主题画面与固定件',
      group: '主视觉',
      type: 'raster',
      renderer: 'image-model',
      src: '/assets/hot-topic-banner/industry-showcase-base-1170x330.png',
      x: 0,
      y: 0,
      width: 1170,
      height: 330,
      z: 0,
      visible: true,
      locked: true,
    },
    {
      id: 'brand-logo',
      name: '抖音生活服务 Logo',
      group: '主视觉',
      type: 'raster',
      renderer: 'brand-asset',
      src: '/assets/hot-topic-banner/douyin-life-service-logo.png',
      x: 27,
      y: 25,
      width: 192,
      height: 32.5,
      z: 1,
      visible: true,
      locked: true,
    },
    {
      id: 'title',
      name: '主标题',
      group: '可编辑文案',
      type: 'text',
      renderer: 'true-text',
      text: '行业热点专项',
      color: '#FF5239',
      fontSize: 105,
      fontWeight: 400,
      fontFamily: 'FangFang XianFeng, PingFang SC, sans-serif',
      letterSpacing: -7.35,
      lineHeight: 1,
      textAlign: 'left',
      x: 66.5,
      y: 105.5,
      width: 585,
      height: 99,
      z: 2,
      visible: true,
      locked: false,
    },
    {
      id: 'subtitle',
      name: '副标题',
      group: '可编辑文案',
      type: 'text',
      renderer: 'true-text',
      text: '今天又拿捏“热点”了',
      color: '#FF5239',
      fontSize: 36,
      fontWeight: 400,
      fontFamily: 'FangFang XianFeng, PingFang SC, sans-serif',
      letterSpacing: -1.8,
      lineHeight: 1,
      textAlign: 'center',
      x: 199.8,
      y: 224.5,
      width: 308.5,
      height: 34,
      z: 3,
      visible: true,
      locked: false,
    },
  ],
}

const POSTER_REDACTIONS = [
  { x: 102, y: 518, width: 865, height: 86, fill: 'rgba(7,43,39,0.96)' },
  { x: 92, y: 1000, width: 420, height: 150, fill: '#0A302B' },
  { x: 535, y: 1000, width: 420, height: 150, fill: '#0A302B' },
  { x: 975, y: 1000, width: 520, height: 150, fill: '#0A302B' },
  { x: 286, y: 2440, width: 1110, height: 118, fill: '#082E29' },
  { x: 286, y: 2760, width: 1110, height: 118, fill: '#082E29' },
  { x: 286, y: 3085, width: 1110, height: 118, fill: '#082E29' },
  { x: 286, y: 3410, width: 1110, height: 118, fill: '#082E29' },
  { x: 286, y: 3740, width: 1110, height: 118, fill: '#082E29' },
  { x: 520, y: 6710, width: 630, height: 70, fill: '#061F1B' },
] as const

const posterTextLayer = (
  id: string,
  name: string,
  group: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  color: string,
  z: number,
  textAlign: 'left' | 'center' | 'right' = 'left',
  fontFamily = 'Songti SC, STSong, serif',
): LayeredArtworkLayer => ({
  id,
  name,
  group,
  type: 'text',
  renderer: 'true-text',
  text,
  color,
  fontSize,
  fontWeight: 600,
  fontFamily,
  letterSpacing: 0,
  lineHeight: 1,
  textAlign,
  x,
  y,
  width,
  height,
  z,
  visible: true,
  locked: false,
})

const POSTER_DOCUMENT: LayeredArtworkDocument = {
  schemaVersion: 1,
  id: 'hotel-case-report-poster',
  title: '成都世园瀑布美憬阁酒店战报',
  version: '1.0.0',
  canvas: { width: 1620, height: 6900 },
  templateRef: {
    id: 'skill.report-poster.editorial-flow',
    version: '1.0.0',
    name: '案例战报长图 · Editorial Flow',
  },
  styleBibleRef: {
    id: 'brand.report-poster.prestige-green',
    version: '1.0.0',
    name: '深绿金色案例战报视觉规则',
  },
  source: {
    generator: '案例战报海报 Skill',
    mode: 'minimal_hybrid',
    benchmark: '酒店案例 1620×6900 golden case · 8/8 回归通过',
    output: 'pureImage + imageHtml v1 sidecar',
  },
  layerTree: [
    { id: 'poster-visual', name: '主视觉', layerIds: ['poster-base'], locked: true },
    { id: 'poster-content', name: '内容信息', layerIds: ['poster-subtitle'] },
    {
      id: 'poster-metrics',
      name: '关键指标',
      layerIds: [
        'metric-1-value',
        'metric-1-name',
        'metric-2-value',
        'metric-2-name',
        'metric-3-value',
        'metric-3-name',
      ],
    },
    {
      id: 'poster-actions',
      name: '运营动作',
      layerIds: ['action-1', 'action-2', 'action-3', 'action-4', 'action-5'],
    },
    { id: 'poster-delivery', name: '交付信息', layerIds: ['search-term'] },
  ],
  layers: [
    {
      id: 'poster-base',
      name: '主视觉底图',
      group: '主视觉',
      type: 'raster',
      renderer: 'source-asset',
      src: '/assets/hot-topic-banner/hotel-case-poster-1620x6900.png',
      redactions: POSTER_REDACTIONS.map((item) => ({ ...item })),
      x: 0,
      y: 0,
      width: 1620,
      height: 6900,
      z: 0,
      visible: true,
      locked: true,
    },
    posterTextLayer(
      'poster-subtitle',
      '副标题',
      '内容信息',
      '成都周边度假酒店暑期运营战报',
      110,
      518,
      850,
      86,
      38,
      '#F4E8CF',
      1,
      'left',
      'PingFang SC, sans-serif',
    ),
    posterTextLayer('metric-1-value', '指标 1 / 数值', '关键指标', '100万+', 108, 1018, 230, 112, 73, '#E7C68D', 2),
    posterTextLayer('metric-1-name', '指标 1 / 名称', '关键指标', '支付', 330, 1036, 160, 84, 24, '#F4E8CF', 3, 'left', 'PingFang SC, sans-serif'),
    posterTextLayer('metric-2-value', '指标 2 / 数值', '关键指标', '30万+', 552, 1018, 230, 112, 73, '#E7C68D', 4),
    posterTextLayer('metric-2-name', '指标 2 / 名称', '关键指标', '核销', 776, 1036, 160, 84, 24, '#F4E8CF', 5, 'left', 'PingFang SC, sans-serif'),
    posterTextLayer('metric-3-value', '指标 3 / 数值', '关键指标', '100%+', 1004, 1018, 280, 112, 73, '#E7C68D', 6),
    posterTextLayer('metric-3-name', '指标 3 / 名称', '关键指标', '核销 YOY', 1285, 1036, 190, 84, 24, '#F4E8CF', 7, 'left', 'PingFang SC, sans-serif'),
    posterTextLayer('action-1', '运营动作 01', '运营动作', '榜单联动与宣发', 325, 2448, 920, 100, 38, '#F4E8CF', 8),
    posterTextLayer('action-2', '运营动作 02', '运营动作', '专属货盘与直播转化', 325, 2768, 920, 100, 38, '#F4E8CF', 9),
    posterTextLayer('action-3', '运营动作 03', '运营动作', '直播与短视频矩阵', 325, 3093, 920, 100, 38, '#F4E8CF', 10),
    posterTextLayer('action-4', '运营动作 04', '运营动作', '品质服务与口碑', 325, 3418, 920, 100, 38, '#F4E8CF', 11),
    posterTextLayer('action-5', '运营动作 05', '运营动作', '文旅 IP 深度绑定', 325, 3748, 920, 100, 38, '#F4E8CF', 12),
    posterTextLayer('search-term', '检索词', '交付信息', '抖音搜索 · 心动榜酒店', 535, 6718, 600, 58, 23, '#E7C68D', 13, 'center', 'PingFang SC, sans-serif'),
  ],
}

const ARTWORKS: Record<ArtworkId, ArtworkDefinition> = {
  banner: {
    id: 'banner',
    shortLabel: '热点 Banner',
    document: BANNER_DOCUMENT,
    maxDisplayWidth: 1080,
    notes: ['4 个真实图层', '标题 3–14 字', '保护 Logo 与主题画面', '同步输出 780×220'],
    protectedRegions: [
      { x: 0, y: 0, width: 21, height: 20 },
      { x: 53, y: 0, width: 47, height: 100 },
    ],
    specRows: [
      ['画布', '1170 × 330，RGB PNG'],
      ['同步规格', '780 × 220，等比缩制一次'],
      ['主标题', '3–14 个可见字符；超规阻断'],
      ['副标题', '选填，建议不超过 16 字'],
      ['文字安全区', 'x 80–650；支持拖拽与数值调整'],
      ['保护区', 'Logo、右侧场景与固定件不可改写'],
    ],
    downloadName: '行业热点专项-Banner-1170x330',
  },
  poster: {
    id: 'poster',
    shortLabel: '案例战报海报',
    document: POSTER_DOCUMENT,
    maxDisplayWidth: 330,
    notes: ['1620 × 6900', '13 个可编辑文字层', '主视觉受保护', '可保存编辑版本'],
    protectedRegions: [],
    specRows: [
      ['交付', '1620 × 6900 RGB PNG'],
      ['可编辑内容', '副标题、3 组关键指标、5 个运营动作、检索词'],
      ['受保护内容', '复杂标题、图表、证据图片、品牌与装饰'],
      ['保存内容', '画布、图层树、文字样式与素材来源'],
      ['事实校验', '数字、结论、截图与 Logo 均须保留来源'],
      ['导出', '原尺寸 PNG + 可编辑图层文件'],
    ],
    downloadName: '成都世园瀑布美憬阁酒店-案例战报-1620x6900',
  },
}

const emptyHistory = (): Record<ArtworkId, HistoryState> => ({
  banner: { past: [], future: [] },
  poster: { past: [], future: [] },
})

function validateArtworkDocument(
  artworkId: ArtworkId,
  document: LayeredArtworkDocument,
  baseline: LayeredArtworkDocument,
) {
  const errors = validateLayeredArtworkDocument(document, baseline)
  const editableText = document.layers.filter(
    (layer) => layer.type === 'text' && !layer.locked,
  )
  if (artworkId === 'banner') {
    const title = editableText.find((layer) => layer.id === 'title')?.text?.trim() ?? ''
    const subtitle = editableText.find((layer) => layer.id === 'subtitle')?.text?.trim() ?? ''
    const titleLength = [...title].length
    if (titleLength < 3 || titleLength > 14) errors.push('主标题须为 3–14 个可见字符')
    if ([...subtitle].length > 16) errors.push('副标题不能超过 16 个可见字符')
  } else {
    const emptyLayer = editableText.find((layer) => !layer.text?.trim())
    if (emptyLayer) errors.push(`必填文字为空：${emptyLayer.name}`)
  }
  return errors
}

function initialDocuments(): Record<ArtworkId, LayeredArtworkDocument> {
  const defaults = {
    banner: cloneLayeredArtworkDocument(BANNER_DOCUMENT),
    poster: cloneLayeredArtworkDocument(POSTER_DOCUMENT),
  }
  if (typeof window === 'undefined') return defaults
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as
      | Partial<Record<ArtworkId, LayeredArtworkDocument>>
      | null
    for (const id of ['banner', 'poster'] as const) {
      const candidate = saved?.[id]
      if (
        candidate?.schemaVersion === 1 &&
        candidate.id === ARTWORKS[id].document.id &&
        validateArtworkDocument(id, candidate, ARTWORKS[id].document).length === 0
      ) {
        defaults[id] = cloneLayeredArtworkDocument(candidate)
      }
    }
  } catch {
    // Corrupt local drafts are ignored; the verified template remains available.
  }
  return defaults
}

const layerIcon = (layer: LayeredArtworkLayer) => {
  if (layer.type === 'text') return Type
  if (layer.type === 'shape') return Layers
  return ImageIcon
}

const intersects = (selection: BrushSelection, region: BrushSelection) =>
  selection.x < region.x + region.width &&
  selection.x + selection.width > region.x &&
  selection.y < region.y + region.height &&
  selection.y + selection.height > region.y

function deriveInstructionPatch(layer: LayeredArtworkLayer, instruction: string) {
  const patch: Partial<LayeredArtworkLayer> = {}
  const quoted = instruction.match(/[“「『"]([^”」』"]+)[”」』"]/)?.[1]
  const explicit = instruction
    .match(/(?:改成|替换为|写成|标题为|文案为)\s*[:：]?\s*(.+)$/)?.[1]
    ?.trim()
  const styleOnly = /^(?:改成)?(?:红色|蓝色|金色|白色)(?:并|、|和|且)?(?:加大|更大|缩小|更小)?$/
  if (quoted) patch.text = quoted.trim()
  else if (explicit && !styleOnly.test(explicit)) patch.text = explicit
  else if (/精简|更短|缩短/.test(instruction) && layer.text) {
    patch.text = layer.text.length > 8 ? `${layer.text.slice(0, 8)}…` : layer.text
  } else if (instruction.length <= 32 && !/(红色|蓝色|金色|白色|加大|缩小|透明)/.test(instruction)) {
    patch.text = instruction
  }
  if (/红色/.test(instruction)) patch.color = '#FF4D3D'
  if (/蓝色/.test(instruction)) patch.color = '#3370FF'
  if (/金色/.test(instruction)) patch.color = '#E7C68D'
  if (/白色/.test(instruction)) patch.color = '#FFFFFF'
  if (/加大|更大/.test(instruction)) patch.fontSize = Math.round((layer.fontSize ?? 32) * 1.12)
  if (/缩小|更小/.test(instruction)) patch.fontSize = Math.round((layer.fontSize ?? 32) * 0.88)
  return patch
}

function LayerPreview({
  layer,
  canvas,
  active,
  onSelect,
  onGestureStart,
}: {
  layer: LayeredArtworkLayer
  canvas: LayeredArtworkDocument['canvas']
  active: boolean
  onSelect: () => void
  onGestureStart: (
    mode: Gesture['mode'],
    layer: LayeredArtworkLayer,
    event: ReactPointerEvent<HTMLElement>,
  ) => void
}) {
  if (!layer.visible) return null
  const commonStyle = {
    left: `${(layer.x / canvas.width) * 100}%`,
    top: `${(layer.y / canvas.height) * 100}%`,
    width: `${(layer.width / canvas.width) * 100}%`,
    height: `${(layer.height / canvas.height) * 100}%`,
    opacity: layer.opacity ?? 1,
    zIndex: layer.z,
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`选择图层：${layer.name}`}
      aria-pressed={active}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect()
      }}
      onPointerDown={(event) => {
        onSelect()
        if (!layer.locked) onGestureStart('move', layer, event)
      }}
      className={`absolute overflow-hidden text-left outline-none ${
        layer.locked ? 'cursor-default' : 'cursor-move touch-none'
      } ${
        active
          ? 'ring-2 ring-inset ring-[#3370FF]'
          : 'hover:ring-1 hover:ring-inset hover:ring-[#3370FF]/55'
      }`}
      style={commonStyle}
    >
      {(layer.type === 'raster' || layer.type === 'vector') && layer.src ? (
        <>
          <img src={layer.src} alt="" draggable={false} className="size-full object-fill" />
          {layer.redactions?.map((redaction, index) => (
            <span
              key={`${layer.id}-redaction-${index}`}
              className="absolute"
              style={{
                left: `${(redaction.x / layer.width) * 100}%`,
                top: `${(redaction.y / layer.height) * 100}%`,
                width: `${(redaction.width / layer.width) * 100}%`,
                height: `${(redaction.height / layer.height) * 100}%`,
                background: redaction.fill,
              }}
            />
          ))}
        </>
      ) : layer.type === 'shape' ? (
        <span className="block size-full" style={{ background: layer.fill }} />
      ) : (
        <span
          className="flex size-full items-center overflow-hidden leading-none"
          style={{
            color: layer.color ?? '#161823',
            fontSize: `${((layer.fontSize ?? 32) / canvas.width) * 100}cqw`,
            fontWeight: layer.fontWeight ?? 600,
            fontFamily: layer.fontFamily,
            letterSpacing: `${((layer.letterSpacing ?? 0) / canvas.width) * 100}cqw`,
            whiteSpace: 'nowrap',
            justifyContent:
              layer.textAlign === 'center'
                ? 'center'
                : layer.textAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
            textAlign: layer.textAlign ?? 'left',
          }}
        >
          {layer.text}
        </span>
      )}
      {active && !layer.locked ? (
        <button
          type="button"
          aria-label={`缩放图层：${layer.name}`}
          title="拖动缩放"
          onPointerDown={(event) => onGestureStart('resize', layer, event)}
          className="absolute bottom-0 right-0 z-50 size-3 translate-x-[1px] translate-y-[1px] cursor-nwse-resize touch-none rounded-sm border border-white bg-[#3370FF] shadow"
        />
      ) : null}
    </div>
  )
}

export default function HotTopicBannerWorkspace() {
  const [artworkId, setArtworkId] = useState<ArtworkId>('banner')
  const artwork = ARTWORKS[artworkId]
  const [documents, setDocuments] = useState(initialDocuments)
  const [histories, setHistories] = useState(emptyHistory)
  const document = documents[artworkId]
  const [selectedId, setSelectedId] = useState('title')
  const [editorTab, setEditorTab] = useState<EditorTab>('layers')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [generationMode, setGenerationMode] = useState<GenerationMode>('comment')
  const [brushSelection, setBrushSelection] = useState<BrushSelection | null>(null)
  const [generationNote, setGenerationNote] = useState('')
  const [generationApplied, setGenerationApplied] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const brushStart = useRef<{ x: number; y: number } | null>(null)
  const gestureRef = useRef<Gesture | null>(null)
  const selected = document.layers.find((layer) => layer.id === selectedId) ?? null
  const history = histories[artworkId]

  const orderedGroups = useMemo(
    () =>
      document.layerTree.map((group) => ({
        ...group,
        layers: group.layerIds
          .map((id) => document.layers.find((layer) => layer.id === id))
          .filter((layer): layer is LayeredArtworkLayer => Boolean(layer)),
      })),
    [document],
  )

  const replaceCurrentDocument = (
    next: LayeredArtworkDocument,
    before = document,
  ) => {
    setDocuments((current) => ({ ...current, [artworkId]: next }))
    setHistories((current) => ({
      ...current,
      [artworkId]: {
        past: [...current[artworkId].past, cloneLayeredArtworkDocument(before)].slice(-50),
        future: [],
      },
    }))
    setSavedAt(null)
  }

  const updateLayer = (id: string, patch: Partial<LayeredArtworkLayer>) => {
    const layer = document.layers.find((candidate) => candidate.id === id)
    if (!layer || layer.locked) return
    const next = cloneLayeredArtworkDocument(document)
    next.layers = next.layers.map((candidate) =>
      candidate.id === id ? { ...candidate, ...patch } : candidate,
    )
    replaceCurrentDocument(next)
  }

  const updateLayerLive = (id: string, patch: Partial<LayeredArtworkLayer>) => {
    setDocuments((current) => ({
      ...current,
      [artworkId]: {
        ...current[artworkId],
        layers: current[artworkId].layers.map((layer) =>
          layer.id === id && !layer.locked ? { ...layer, ...patch } : layer,
        ),
      },
    }))
    setSavedAt(null)
  }

  const undo = () => {
    const prior = history.past.at(-1)
    if (!prior) return
    setDocuments((current) => ({
      ...current,
      [artworkId]: cloneLayeredArtworkDocument(prior),
    }))
    setHistories((current) => ({
      ...current,
      [artworkId]: {
        past: current[artworkId].past.slice(0, -1),
        future: [cloneLayeredArtworkDocument(document), ...current[artworkId].future].slice(0, 50),
      },
    }))
    setSavedAt(null)
  }

  const redo = () => {
    const next = history.future[0]
    if (!next) return
    setDocuments((current) => ({
      ...current,
      [artworkId]: cloneLayeredArtworkDocument(next),
    }))
    setHistories((current) => ({
      ...current,
      [artworkId]: {
        past: [...current[artworkId].past, cloneLayeredArtworkDocument(document)].slice(-50),
        future: current[artworkId].future.slice(1),
      },
    }))
    setSavedAt(null)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const reset = () => {
    replaceCurrentDocument(cloneLayeredArtworkDocument(artwork.document))
    setSelectedId(artwork.id === 'poster' ? 'metric-1-value' : 'title')
    setBrushSelection(null)
    setGenerationApplied(false)
    toast(`已恢复到 v${artwork.document.version}`)
  }

  const save = () => {
    const errors = validateArtworkDocument(artworkId, document, artwork.document)
    if (errors.length) {
      toast.error('保存被保护规则阻断', { description: errors[0] })
      return
    }
    try {
      const next = { ...documents, [artworkId]: cloneLayeredArtworkDocument(document) }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      const time = new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())
      setSavedAt(time)
      toast.success('已保存为可重开的编辑版本', {
        description: '刷新或重新进入项目后仍会恢复当前图层内容。',
      })
    } catch {
      toast.error('浏览器存储不可用，当前修改仍保留在本次会话')
    }
  }

  const exportPng = async () => {
    if (exporting) return
    const errors = validateArtworkDocument(artworkId, document, artwork.document)
    if (errors.length) {
      toast.error('导出被保护规则阻断', { description: errors[0] })
      return
    }
    setExporting(true)
    try {
      await downloadLayeredArtworkPng(document, `${artwork.downloadName}.png`)
      toast.success('PNG 已按原始画布尺寸导出')
    } catch (error) {
      toast.error('PNG 导出失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    } finally {
      setExporting(false)
    }
  }

  const exportSidecar = () => {
    const errors = validateArtworkDocument(artworkId, document, artwork.document)
    if (errors.length) {
      toast.error('图层协议导出被阻断', { description: errors[0] })
      return
    }
    downloadTextFile(
      `${artwork.downloadName}__imageHtml.json`,
      buildImageHtmlSidecar(document),
    )
    toast.success('imageHtml 图层描述已导出')
  }

  const eventPoint = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100)),
    }
  }

  const onGestureStart = (
    mode: Gesture['mode'],
    layer: LayeredArtworkLayer,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    event.stopPropagation()
    if (layer.locked) return
    event.currentTarget.setPointerCapture(event.pointerId)
    gestureRef.current = {
      id: layer.id,
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLayer: { ...layer },
      before: cloneLayeredArtworkDocument(document),
    }
  }

  const onCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    const canvas = canvasRef.current
    if (!gesture || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const dx = ((event.clientX - gesture.startClientX) / rect.width) * document.canvas.width
    const dy = ((event.clientY - gesture.startClientY) / rect.height) * document.canvas.height
    if (gesture.mode === 'move') {
      updateLayerLive(gesture.id, {
        x: Math.max(0, Math.min(document.canvas.width - gesture.startLayer.width, gesture.startLayer.x + dx)),
        y: Math.max(0, Math.min(document.canvas.height - gesture.startLayer.height, gesture.startLayer.y + dy)),
      })
    } else {
      updateLayerLive(gesture.id, {
        width: Math.max(24, Math.min(document.canvas.width - gesture.startLayer.x, gesture.startLayer.width + dx)),
        height: Math.max(18, Math.min(document.canvas.height - gesture.startLayer.y, gesture.startLayer.height + dy)),
      })
    }
  }

  const finishGesture = () => {
    const gesture = gestureRef.current
    if (!gesture) return
    gestureRef.current = null
    setHistories((current) => ({
      ...current,
      [artworkId]: {
        past: [...current[artworkId].past, gesture.before].slice(-50),
        future: [],
      },
    }))
  }

  const setSelectionFromLayer = (layerId: string) => {
    const layer = document.layers.find((candidate) => candidate.id === layerId)
    if (!layer) return
    setBrushSelection({
      x: (layer.x / document.canvas.width) * 100,
      y: (layer.y / document.canvas.height) * 100,
      width: (layer.width / document.canvas.width) * 100,
      height: (layer.height / document.canvas.height) * 100,
    })
    setSelectedId(layerId)
    setGenerationApplied(false)
  }

  const applyGeneration = () => {
    const instruction = generationNote.trim()
    if (!instruction) {
      toast.error('请补充修改要求')
      return
    }
    let target: LayeredArtworkLayer | undefined
    if (generationMode === 'comment') {
      target = selected && selected.type === 'text' && !selected.locked ? selected : undefined
      if (!target) {
        toast.error('请先选中一个可编辑文字图层')
        return
      }
    } else {
      if (!brushSelection) {
        toast.error('请先在画布上框选要修改的区域')
        return
      }
      const protectedRegion = artwork.protectedRegions.find((region) => intersects(brushSelection, region))
      if (protectedRegion) {
        toast.error('选区包含受保护内容', {
          description: 'Logo、固定件或主题画面不允许被局部生成覆盖。',
        })
        return
      }
      const selectedRegion = selected
        ? {
            x: (selected.x / document.canvas.width) * 100,
            y: (selected.y / document.canvas.height) * 100,
            width: (selected.width / document.canvas.width) * 100,
            height: (selected.height / document.canvas.height) * 100,
          }
        : null
      target =
        selected &&
        selected.type === 'text' &&
        !selected.locked &&
        selected.visible &&
        selectedRegion &&
        intersects(brushSelection, selectedRegion)
          ? selected
          : [...document.layers]
        .sort((a, b) => b.z - a.z)
        .find((layer) => {
          if (layer.type !== 'text' || layer.locked || !layer.visible) return false
          const region = {
            x: (layer.x / document.canvas.width) * 100,
            y: (layer.y / document.canvas.height) * 100,
            width: (layer.width / document.canvas.width) * 100,
            height: (layer.height / document.canvas.height) * 100,
          }
          return intersects(brushSelection, region)
        })
      if (!target) {
        toast.error('选区内没有可生成式编辑的图层', {
          description: '为保护成品，底图和证据图片不会被静默重绘。',
        })
        return
      }
    }
    const patch = deriveInstructionPatch(target, instruction)
    if (!Object.keys(patch).length) {
      toast.error('没有识别到可执行的修改', {
        description: '可直接写“改成「新的文案」”“标题加大”或“改成金色”。',
      })
      return
    }
    updateLayer(target.id, patch)
    setSelectedId(target.id)
    setGenerationApplied(true)
    toast.success('已更新选中图层', {
      description: '锁定底图、证据图片与未选图层保持不变。',
    })
  }

  const moveLayerZ = (direction: -1 | 1) => {
    if (!selected || selected.locked) return
    const editable = [...document.layers].sort((a, b) => a.z - b.z)
    const index = editable.findIndex((layer) => layer.id === selected.id)
    const other = editable[index + direction]
    if (!other || other.locked) return
    const next = cloneLayeredArtworkDocument(document)
    next.layers = next.layers.map((layer) =>
      layer.id === selected.id
        ? { ...layer, z: other.z }
        : layer.id === other.id
          ? { ...layer, z: selected.z }
          : layer,
    )
    replaceCurrentDocument(next)
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#F5F6F7]">
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-black/[0.07] bg-white px-4">
          <Layers className="size-3.5 text-[#161823]/45" />
          <span className="text-[11px] font-semibold text-[#161823]">多图层编辑器</span>
          <span className="text-[10px] text-[#161823]/32">/</span>
          <span className="min-w-0 truncate text-[10px] text-[#161823]/58">{document.title}</span>
          <span className="ml-1 shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-medium text-emerald-700">
            {document.layers.length} 层
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F1F6FF] px-2 py-0.5 text-[8px] font-medium text-[#175CD3]">
            <ShieldCheck className="size-2.5" />保护规则正常
          </span>
          {savedAt ? <span className="text-[8px] text-[#161823]/34">已保存 {savedAt}</span> : null}
          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={undo} disabled={!history.past.length} className="flex h-7 items-center gap-1 rounded-lg px-2 text-[8px] text-[#161823]/52 hover:bg-[#F2F3F5] disabled:opacity-25"><History className="size-3" />撤销</button>
            <button type="button" onClick={redo} disabled={!history.future.length} className="flex h-7 items-center gap-1 rounded-lg px-2 text-[8px] text-[#161823]/52 hover:bg-[#F2F3F5] disabled:opacity-25"><History className="size-3 scale-x-[-1]" />重做</button>
            <button type="button" aria-pressed={aiPanelOpen} onClick={() => setAiPanelOpen((open) => !open)} className={`flex h-7 items-center gap-1 rounded-lg px-2.5 text-[8px] font-medium ${aiPanelOpen ? 'bg-[#3370FF] text-white' : 'border border-[#3370FF]/18 bg-[#EEF4FF] text-[#175CD3] hover:bg-[#E3EDFF]'}`}><WandSparkles className="size-3" />AI 修改</button>
            <button type="button" onClick={reset} className="grid size-7 place-items-center rounded-lg text-[#161823]/42 hover:bg-[#F2F3F5]" aria-label={`重置${artwork.shortLabel}`}><RotateCcw className="size-3.5" /></button>
            <button type="button" onClick={exportSidecar} className="flex h-7 items-center gap-1 rounded-lg border border-black/[0.08] px-2 text-[8px] font-medium text-[#161823]/62 hover:bg-[#F6F7F8]"><FileJson className="size-3" />图层 JSON</button>
            <button type="button" onClick={exportPng} disabled={exporting} className="flex h-7 items-center gap-1 rounded-lg border border-black/[0.08] px-2 text-[8px] font-medium text-[#161823]/62 hover:bg-[#F6F7F8] disabled:opacity-45"><Download className="size-3" />{exporting ? '导出中…' : 'PNG'}</button>
            <button type="button" onClick={save} className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[9px] font-medium text-white hover:bg-[#2C2D35]"><Save className="size-3" />保存版本</button>
          </div>
        </header>

        <div
          className="relative min-h-0 flex-1 overflow-auto p-8"
          style={{
            backgroundColor: '#EEF0F3',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(22,24,35,0.11) 1px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        >
          <div className="flex min-h-full min-w-0 items-start justify-center py-2">
            <div className="min-w-0 w-full" style={{ maxWidth: artwork.maxDisplayWidth }}>
              <div className="mb-4 space-y-2.5">
                <div aria-label="图片产物" className="grid grid-cols-2 rounded-xl bg-black/[0.055] p-1">
                  {(Object.values(ARTWORKS) as ArtworkDefinition[]).map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      aria-pressed={artworkId === candidate.id}
                      onClick={() => {
                        setArtworkId(candidate.id)
                        setSelectedId(candidate.id === 'poster' ? 'metric-1-value' : 'title')
                        setEditorTab('layers')
                        setAiPanelOpen(false)
                        setBrushSelection(null)
                        setGenerationNote('')
                        setGenerationApplied(false)
                      }}
                      className={`h-8 rounded-lg text-[9px] font-medium transition-colors ${artworkId === candidate.id ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/45 hover:text-[#161823]'}`}
                    >
                      {candidate.shortLabel}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 text-[9px] text-[#161823]/38">
                  <span className="inline-flex items-center gap-1 truncate"><Move className="size-3" />选中未锁定图层可直接拖动；右下角拖动缩放</span>
                  <span className="shrink-0">原始画布 {document.canvas.width} × {document.canvas.height}</span>
                </div>
              </div>
              <div
                ref={canvasRef}
                className="relative w-full overflow-hidden bg-white shadow-[0_18px_50px_rgba(31,35,41,0.16)]"
                style={{ aspectRatio: `${document.canvas.width} / ${document.canvas.height}`, containerType: 'inline-size' }}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={finishGesture}
                onPointerCancel={finishGesture}
              >
                {[...document.layers].sort((a, b) => a.z - b.z).map((layer) => (
                  <LayerPreview
                    key={layer.id}
                    layer={layer}
                    active={selectedId === layer.id}
                    canvas={document.canvas}
                    onSelect={() => {
                      setSelectedId(layer.id)
                      setEditorTab('layers')
                    }}
                    onGestureStart={onGestureStart}
                  />
                ))}
                {aiPanelOpen && generationMode === 'brush' ? (
                  <div
                    aria-label="画笔选区画布"
                    className="absolute inset-0 z-50 cursor-crosshair touch-none"
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId)
                      const point = eventPoint(event)
                      brushStart.current = point
                      setBrushSelection({ ...point, width: 0, height: 0 })
                      setGenerationApplied(false)
                    }}
                    onPointerMove={(event) => {
                      if (!brushStart.current) return
                      const point = eventPoint(event)
                      setBrushSelection({
                        x: Math.min(brushStart.current.x, point.x),
                        y: Math.min(brushStart.current.y, point.y),
                        width: Math.abs(point.x - brushStart.current.x),
                        height: Math.abs(point.y - brushStart.current.y),
                      })
                    }}
                    onPointerUp={() => { brushStart.current = null }}
                  >
                    {brushSelection && brushSelection.width > 0.5 && brushSelection.height > 0.5 ? (
                      <div className={`pointer-events-none absolute border-2 border-dashed ${generationApplied ? 'border-emerald-500 bg-emerald-400/10' : 'border-[#3370FF] bg-[#3370FF]/8'}`} style={{ left: `${brushSelection.x}%`, top: `${brushSelection.y}%`, width: `${brushSelection.width}%`, height: `${brushSelection.height}%` }}>
                        <span className={`absolute left-1 top-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[7px] font-medium text-white shadow ${generationApplied ? 'bg-emerald-600' : 'bg-[#3370FF]'}`}>{generationApplied ? <Check className="size-2.5" /> : <Brush className="size-2.5" />}{generationApplied ? '已应用' : '生成选区'}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[8px] text-[#161823]/38">
                {artwork.notes.map((note) => <span key={note} className="rounded bg-white px-2 py-1 shadow-sm">{note}</span>)}
              </div>
            </div>
          </div>
          {aiPanelOpen ? (
            <section aria-label="画布 AI 修改" className="sticky bottom-4 z-[70] ml-auto mt-[-4px] w-[330px] overflow-hidden rounded-2xl border border-black/[0.09] bg-white shadow-[0_20px_60px_-18px_rgba(22,24,35,0.38)]">
              <div className="flex items-start justify-between border-b border-black/[0.07] px-4 py-3.5">
                <div><p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#161823]"><WandSparkles className="size-3.5 text-[#3370FF]" />画布 AI 修改</p><p className="mt-1 text-[8px] text-[#161823]/38">独立于右侧精确属性编辑器</p></div>
                <button type="button" onClick={() => setAiPanelOpen(false)} aria-label="关闭画布 AI 修改" className="grid size-7 place-items-center rounded-lg text-[#161823]/38 hover:bg-[#F2F3F5] hover:text-[#161823]"><X className="size-3.5" /></button>
              </div>
              <div className="space-y-3.5 p-4">
                <div className="grid grid-cols-2 rounded-lg bg-[#F2F3F5] p-1">
                  <button type="button" onClick={() => setGenerationMode('comment')} className={`h-7 rounded-md text-[8px] font-medium ${generationMode === 'comment' ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/44'}`}><MessageSquareText className="mr-1 inline size-3" />对象批注</button>
                  <button type="button" onClick={() => setGenerationMode('brush')} className={`h-7 rounded-md text-[8px] font-medium ${generationMode === 'brush' ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/44'}`}><Brush className="mr-1 inline size-3" />画笔选区</button>
                </div>
                {generationMode === 'comment' ? (
                  <div className="rounded-xl border border-[#3370FF]/16 bg-[#F4F8FF] p-3"><p className="text-[9px] font-semibold text-[#175CD3]">作用对象</p><p className="mt-1.5 text-[8px] leading-[13px] text-[#175CD3]/58">{selected && selected.type === 'text' && !selected.locked ? selected.name : '请在画布或右栏选择可编辑文字图层'}</p></div>
                ) : (
                  <div className="rounded-xl border border-[#3370FF]/16 bg-[#F4F8FF] p-3">
                    <p className="flex items-center gap-1.5 text-[9px] font-semibold text-[#175CD3]"><Brush className="size-3" />画笔选区</p>
                    <p className="mt-1.5 text-[8px] leading-[13px] text-[#175CD3]/58">在成品上框选；只有选区命中的开放图层可被修改。</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => setSelectionFromLayer(artworkId === 'poster' ? 'metric-1-value' : 'title')} className="rounded-md bg-white px-2 py-1 text-[8px] text-[#175CD3] shadow-sm">{artworkId === 'poster' ? '指标 1' : '主标题区'}</button>
                      <button type="button" onClick={() => setSelectionFromLayer(artworkId === 'poster' ? 'action-1' : 'subtitle')} className="rounded-md bg-white px-2 py-1 text-[8px] text-[#175CD3] shadow-sm">{artworkId === 'poster' ? '运营动作 01' : '副标题区'}</button>
                      <button type="button" onClick={() => { setBrushSelection(null); setGenerationApplied(false) }} className="rounded-md px-2 py-1 text-[8px] text-[#161823]/42 hover:bg-white">清除选区</button>
                    </div>
                  </div>
                )}
                <label className="block"><span className="flex items-center gap-1.5 text-[8px] font-medium text-[#161823]/48"><MessageSquareText className="size-3" />修改要求</span><textarea value={generationNote} onChange={(event) => setGenerationNote(event.target.value)} rows={4} placeholder="例如：改成「暑期酒店增长战报」；标题加大并改成金色。" className="mt-1.5 w-full resize-none rounded-xl border border-black/[0.09] px-2.5 py-2 text-[10px] leading-4 text-[#161823] outline-none placeholder:text-[#161823]/24 focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10" /></label>
                <button type="button" onClick={applyGeneration} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#3370FF] text-[9px] font-medium text-white hover:bg-[#2864DC]"><WandSparkles className="size-3.5" />生成并应用修改</button>
                <div className="rounded-xl border border-black/[0.07] p-3"><p className="flex items-center gap-1.5 text-[8px] font-medium text-[#161823]/56"><ShieldCheck className="size-3 text-emerald-600" />保护规则</p><p className="mt-1.5 text-[8px] leading-[13px] text-[#161823]/38">主视觉、Logo 和证据图片受保护；未命中开放对象时直接阻断。</p></div>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <aside aria-label="图片编辑器" className="flex w-[340px] shrink-0 flex-col border-l border-black/[0.08] bg-white">
        <div className="shrink-0 border-b border-black/[0.07] px-4 pb-3 pt-3.5">
          <p className="text-[12px] font-semibold text-[#161823]">编辑器</p>
          <p className="mt-0.5 text-[8px] text-[#161823]/34">{document.source.generator} · v{document.version}</p>
          <div className="mt-3 grid grid-cols-2 rounded-lg bg-[#F2F3F5] p-1">
            {([['layers', '图层与属性'], ['spec', '交付规范']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setEditorTab(id)} className={`h-7 rounded-md text-[9px] font-medium ${editorTab === id ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/44 hover:text-[#161823]'}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-3.5">
          {editorTab === 'layers' ? (
            <>
              <div className="space-y-3">
                {orderedGroups.map((group) => (
                  <section key={group.id}>
                    <div className="mb-1 flex items-center justify-between px-1">
                      <p className="text-[8px] font-semibold text-[#161823]/42">{group.name}</p>
                      <span className="text-[7px] text-[#161823]/28">{group.layers.length}</span>
                    </div>
                    <div className="space-y-1">
                      {[...group.layers].sort((a, b) => b.z - a.z).map((layer) => {
                        const Icon = layerIcon(layer)
                        const active = selectedId === layer.id
                        return (
                          <div key={layer.id} className={`flex items-center rounded-lg pr-1 ${active ? 'bg-[#EAF3FF] text-[#175CD3]' : 'text-[#161823]/62 hover:bg-[#F5F6F7]'}`}>
                            <button type="button" onClick={() => setSelectedId(layer.id)} className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left">
                              <Icon className="size-3.5 shrink-0" />
                              <span className="min-w-0 flex-1 truncate text-[9px] font-medium">{layer.name}</span>
                              {layer.locked ? <Lock className="size-3 opacity-45" /> : null}
                            </button>
                            <button type="button" aria-label={`${layer.visible ? '隐藏' : '显示'}${layer.name}`} disabled={layer.locked} onClick={() => updateLayer(layer.id, { visible: !layer.visible })} className={`grid size-6 place-items-center rounded disabled:cursor-not-allowed disabled:opacity-25 ${layer.visible ? '' : 'opacity-30'}`}><Eye className="size-3" /></button>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {selected ? (
                <section className="mt-4 border-t border-black/[0.07] pt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-semibold text-[#161823]">{selected.name}</p>
                    <span className={`rounded px-1.5 py-0.5 text-[7px] font-medium ${selected.locked ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{selected.locked ? '受保护' : '可编辑'}</span>
                  </div>

                  {selected.type === 'text' ? (
                    <div className="mt-3 space-y-3">
                      <label className="block">
                        <span className="text-[8px] font-medium text-[#161823]/48">文字内容</span>
                        <textarea value={selected.text ?? ''} onChange={(event) => updateLayer(selected.id, { text: event.target.value })} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-black/[0.09] px-2.5 py-2 text-[10px] leading-4 text-[#161823] outline-none focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10" />
                      </label>
                      <div className="grid grid-cols-[1fr_78px] gap-2">
                        <label className="block">
                          <span className="text-[8px] font-medium text-[#161823]/48">字色</span>
                          <div className="mt-1.5 flex h-8 items-center gap-2 rounded-lg border border-black/[0.09] px-2">
                            <input type="color" value={selected.color ?? '#161823'} onChange={(event) => updateLayer(selected.id, { color: event.target.value })} className="size-4 cursor-pointer border-0 bg-transparent p-0" />
                            <span className="text-[8px] uppercase text-[#161823]/52">{selected.color}</span>
                          </div>
                        </label>
                        <label className="block">
                          <span className="text-[8px] font-medium text-[#161823]/48">字号</span>
                          <input type="number" min="8" max="180" value={selected.fontSize ?? 32} onChange={(event) => updateLayer(selected.id, { fontSize: Number(event.target.value) })} className="mt-1.5 h-8 w-full rounded-lg border border-black/[0.09] px-2 text-[9px] outline-none focus:border-[#3370FF]/45" />
                        </label>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['x', 'y', 'width', 'height'] as const).map((key) => (
                          <label key={key} className="block">
                            <span className="text-[7px] uppercase text-[#161823]/34">{key === 'width' ? 'W' : key === 'height' ? 'H' : key.toUpperCase()}</span>
                            <input type="number" value={Math.round(selected[key])} onChange={(event) => updateLayer(selected.id, { [key]: Number(event.target.value) })} className="mt-1 h-7 w-full rounded-md border border-black/[0.08] px-1.5 text-[8px] outline-none focus:border-[#3370FF]/45" />
                          </label>
                        ))}
                      </div>
                      <label className="block text-[8px] text-[#161823]/44">
                        不透明度 {Math.round((selected.opacity ?? 1) * 100)}%
                        <input type="range" min="0.1" max="1" step="0.05" value={selected.opacity ?? 1} onChange={(event) => updateLayer(selected.id, { opacity: Number(event.target.value) })} className="mt-1.5 w-full accent-[#3370FF]" />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => moveLayerZ(-1)} className="h-8 rounded-lg border border-black/[0.08] text-[8px] text-[#161823]/55 hover:bg-[#F6F7F8]">下移一层</button>
                        <button type="button" onClick={() => moveLayerZ(1)} className="h-8 rounded-lg border border-black/[0.08] text-[8px] text-[#161823]/55 hover:bg-[#F6F7F8]">上移一层</button>
                      </div>
                      <p className="rounded-lg bg-[#F6F7F8] px-2.5 py-2 text-[8px] leading-[13px] text-[#161823]/38">字体：{selected.fontFamily ?? 'PingFang SC'}。画布选择、图层树选择与属性修改实时同步。</p>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-black/[0.07] bg-[#F7F8F9] p-3">
                      <p className="text-[8px] leading-[13px] text-[#161823]/42">{selected.id === 'poster-base' ? '复杂标题、图表、证据拼贴、品牌与装饰保持在受保护主视觉中；文字内容请从对应图层编辑。' : selected.id === 'brand-logo' ? 'Logo 原形、顺序与安全距离固定，不允许拉伸或改色。' : '主题画面与固定件受保护；生成式修改只作用于显式开放的图层。'}</p>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-[8px]">
                        <div><dt className="text-[#161823]/30">位置</dt><dd className="mt-0.5 text-[#161823]/58">{Math.round(selected.x)}, {Math.round(selected.y)}</dd></div>
                        <div><dt className="text-[#161823]/30">尺寸</dt><dd className="mt-0.5 text-[#161823]/58">{Math.round(selected.width)} × {Math.round(selected.height)}</dd></div>
                      </dl>
                    </div>
                  )}
                </section>
              ) : null}
            </>
          ) : (
            <div className="space-y-3">
              {artwork.specRows.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-black/[0.07] p-3"><p className="text-[8px] text-[#161823]/34">{label}</p><p className="mt-1 text-[9px] font-medium text-[#161823]/72">{value}</p></div>
              ))}
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800/70">
                <p className="flex items-center gap-1.5 text-[9px] font-semibold"><Check className="size-3" />可验证的交付链路</p>
                <p className="mt-1.5 text-[8px] leading-[13px]">保存后可刷新重开；PNG 按原始尺寸合成；可编辑图层文件保留图层树、文字样式和素材来源。</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
