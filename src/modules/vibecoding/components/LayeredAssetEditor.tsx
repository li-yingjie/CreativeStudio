import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Brush,
  Eye,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageCircle,
  Save,
  Sparkles,
  Type,
  Upload,
} from '@/shared/icons'
import type {
  AssetItem,
  AssetLayer,
  AssetLayerManifest,
} from './ProjectAssetCatalog'

const RENDERER_LABEL = {
  'image-model': '图像模型',
  'raster-art': '艺术字 / 栅格',
  'true-text': '真文字',
  'brand-asset': '品牌资产',
  'source-asset': '已有素材',
} as const

type EditorToolMode = 'select' | 'brush' | 'comment'

type CanvasPoint = { x: number; y: number }

type BrushStroke = {
  id: string
  points: CanvasPoint[]
}

type CanvasComment = CanvasPoint & {
  id: string
  text: string
  resolved: boolean
}

type LayerMoveGesture = {
  id: string
  startClientX: number
  startClientY: number
  startX: number
  startY: number
}

function suggestedManifest(item: AssetItem, current: AssetLayerManifest): AssetLayerManifest {
  const { width, height } = current.canvas
  return {
    ...current,
    templateRef: {
      id: /Banner|banner/.test(item.label)
        ? 'template.campaign-kv-layered'
        : 'template.interest-card-layered',
      version: /Banner|banner/.test(item.label) ? '1.2.0' : '1.0.0',
      name: /Banner|banner/.test(item.label)
        ? '活动主视觉分层模板'
        : '兴趣卡图文分层模板',
    },
    layers: [
      {
        ...current.layers[0],
        id: 'suggested-background',
        name: '其余画面 · 整图背景',
        locked: true,
        z: 0,
      },
      {
        id: 'suggested-title',
        name: '智能识别 · 标题区域',
        type: 'text',
        renderer: 'true-text',
        text: '',
        fontRef: { id: 'font.douyin-sans', version: '2.0', family: '抖音 Sans' },
        x: Math.round(width * 0.08),
        y: Math.round(height * 0.1),
        width: Math.round(width * 0.56),
        height: Math.round(height * 0.16),
        z: 1,
        visible: true,
        locked: false,
      },
      {
        id: 'suggested-cta',
        name: '智能识别 · 行动区域',
        type: 'text',
        renderer: 'true-text',
        text: '',
        fontRef: { id: 'font.douyin-sans', version: '2.0', family: '抖音 Sans' },
        x: Math.round(width * 0.68),
        y: Math.round(height * 0.7),
        width: Math.round(width * 0.22),
        height: Math.round(height * 0.12),
        z: 2,
        visible: true,
        locked: false,
      },
      {
        id: 'suggested-brand',
        name: '智能识别 · 品牌保护区',
        type: 'vector',
        renderer: 'brand-asset',
        x: Math.round(width * 0.72),
        y: Math.round(height * 0.08),
        width: Math.round(width * 0.2),
        height: Math.round(height * 0.09),
        z: 3,
        visible: true,
        locked: true,
      },
    ],
  }
}

function layerIcon(layer: AssetLayer) {
  if (layer.type === 'text') return Type
  if (layer.type === 'vector') return Layers
  return ImageIcon
}

export default function LayeredAssetEditor({
  item,
  initialManifest,
  onBack,
  onSave,
}: {
  item: AssetItem
  initialManifest: AssetLayerManifest
  onBack: () => void
  onSave: (manifest: AssetLayerManifest) => Promise<void> | void
}) {
  const [manifest, setManifest] = useState(() => ({
    ...initialManifest,
    canvas: { ...initialManifest.canvas },
    layers: initialManifest.layers.map((layer) => ({ ...layer })),
  }))
  const [selectedId, setSelectedId] = useState(initialManifest.layers.at(-1)?.id ?? null)
  const [analysisState, setAnalysisState] = useState<'idle' | 'running' | 'ready'>('idle')
  const [saving, setSaving] = useState(false)
  const [toolMode, setToolMode] = useState<EditorToolMode>('select')
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([])
  const [brushInstruction, setBrushInstruction] = useState('')
  const [brushApplying, setBrushApplying] = useState(false)
  const [brushResult, setBrushResult] = useState<string | null>(null)
  const [comments, setComments] = useState<CanvasComment[]>([])
  const [pendingComment, setPendingComment] = useState<CanvasPoint | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [viewportSize, setViewportSize] = useState({ width: 980, height: 720 })
  const activeStrokeIdRef = useRef<string | null>(null)
  const artboardRef = useRef<HTMLDivElement>(null)
  const canvasViewportRef = useRef<HTMLDivElement>(null)
  const layerMoveRef = useRef<LayerMoveGesture | null>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const selected = manifest.layers.find((layer) => layer.id === selectedId) ?? null
  const orderedLayers = useMemo(
    () => [...manifest.layers].sort((a, b) => b.z - a.z),
    [manifest.layers],
  )
  const isSingleLayer = manifest.layers.length === 1
  const isLongArtwork = manifest.canvas.height / manifest.canvas.width > 3
  const artboardScale = Math.min(
    1,
    Math.max(220, viewportSize.width - 96) / manifest.canvas.width,
    isLongArtwork
      ? 1
      : Math.max(240, viewportSize.height - 96) / manifest.canvas.height,
  )
  const artboardWidth = Math.max(
    180,
    Math.round(manifest.canvas.width * artboardScale),
  )

  const flatRoot =
    initialManifest.layers.length === 1 &&
    initialManifest.layers[0]?.id === 'flat-root'
      ? initialManifest.layers[0]
      : null

  useLayoutEffect(() => {
    const viewport = canvasViewportRef.current
    if (!viewport) return
    const update = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = flatRoot
    if (
      !root?.src
    ) {
      return
    }
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (cancelled || !image.naturalWidth || !image.naturalHeight) return
      setManifest((current) => ({
        ...current,
        canvas: {
          width: image.naturalWidth,
          height: image.naturalHeight,
        },
        layers: current.layers.map((layer) =>
          layer.id === root.id
            ? {
                ...layer,
                x: 0,
                y: 0,
                width: image.naturalWidth,
                height: image.naturalHeight,
              }
            : layer,
        ),
      }))
    }
    image.src = root.src
    return () => {
      cancelled = true
    }
  }, [flatRoot])

  const updateLayer = (id: string, patch: Partial<AssetLayer>) => {
    setManifest((current) => ({
      ...current,
      layers: current.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer),
    }))
  }

  const startLayerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
    layer: AssetLayer,
  ) => {
    setSelectedId(layer.id)
    if (toolMode !== 'select' || layer.locked || event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    layerMoveRef.current = {
      id: layer.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layer.x,
      startY: layer.y,
    }
  }

  const moveSelectedLayer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = layerMoveRef.current
    const artboard = artboardRef.current
    if (!gesture || !artboard) return
    const layer = manifest.layers.find((candidate) => candidate.id === gesture.id)
    if (!layer) return
    const bounds = artboard.getBoundingClientRect()
    const dx = ((event.clientX - gesture.startClientX) / bounds.width) * manifest.canvas.width
    const dy = ((event.clientY - gesture.startClientY) / bounds.height) * manifest.canvas.height
    updateLayer(gesture.id, {
      x: Math.round(
        Math.max(
          0,
          Math.min(manifest.canvas.width - layer.width, gesture.startX + dx),
        ),
      ),
      y: Math.round(
        Math.max(
          0,
          Math.min(manifest.canvas.height - layer.height, gesture.startY + dy),
        ),
      ),
    })
  }

  const finishLayerMove = () => {
    layerMoveRef.current = null
  }

  const moveLayer = (direction: -1 | 1) => {
    if (!selected || selected.locked) return
    const layers = [...manifest.layers].sort((a, b) => a.z - b.z)
    const index = layers.findIndex((layer) => layer.id === selected.id)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= layers.length) return
    const target = layers[targetIndex]
    const currentZ = layers[index].z
    layers[index] = { ...layers[index], z: target.z }
    layers[targetIndex] = { ...target, z: currentZ }
    setManifest((current) => ({ ...current, layers }))
  }

  const analyze = () => {
    setAnalysisState('running')
    window.setTimeout(() => setAnalysisState('ready'), 650)
  }

  const adoptSuggestion = () => {
    const next = suggestedManifest(item, manifest)
    setManifest(next)
    setSelectedId(next.layers[1]?.id ?? next.layers[0]?.id ?? null)
    setAnalysisState('idle')
  }

  const pointFromPointer = (
    event: { currentTarget: HTMLElement; clientX: number; clientY: number },
  ): CanvasPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    }
  }

  const startBrushStroke = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const id = `stroke-${Date.now()}`
    const point = pointFromPointer(event)
    activeStrokeIdRef.current = id
    setBrushResult(null)
    setBrushStrokes((current) => [
      ...current,
      { id, points: [point] },
    ])
  }

  const extendBrushStroke = (event: ReactPointerEvent<HTMLDivElement>) => {
    const id = activeStrokeIdRef.current
    if (!id || (event.buttons & 1) === 0) return
    const point = pointFromPointer(event)
    setBrushStrokes((current) =>
      current.map((stroke) =>
        stroke.id === id
          ? { ...stroke, points: [...stroke.points, point] }
          : stroke,
      ),
    )
  }

  const finishBrushStroke = () => {
    activeStrokeIdRef.current = null
  }

  const applyBrushEdit = () => {
    if (brushStrokes.length === 0 || !brushInstruction.trim() || brushApplying)
      return
    setBrushApplying(true)
    setBrushResult(null)
    window.setTimeout(() => {
      setBrushApplying(false)
      setBrushResult('已生成局部修改候选，原图层保持不变')
      toast.success('局部修改候选已生成', {
        description: '当前为 Demo Mock，不会覆盖真实交付像素。',
      })
    }, 700)
  }

  const addComment = () => {
    if (!pendingComment || !commentDraft.trim()) return
    setComments((current) => [
      ...current,
      {
        ...pendingComment,
        id: `comment-${Date.now()}`,
        text: commentDraft.trim(),
        resolved: false,
      },
    ])
    setPendingComment(null)
    setCommentDraft('')
    toast.success('评论已标记到画面')
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 450))
      await onSave(manifest)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file || !selected) return
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              updateLayer(selected.id, { src: reader.result, type: 'upload', renderer: 'source-asset' })
            }
          }
          reader.readAsDataURL(file)
          event.currentTarget.value = ''
        }}
      />

      <header className="flex h-12 shrink-0 items-center gap-2 overflow-hidden border-b border-[var(--divider-soft)] px-3">
        <button type="button" onClick={onBack} className="flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[12px] text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)]">
          <ArrowLeft className="size-3.5" /> 返回素材库
        </button>
        <span className="h-4 w-px bg-[var(--divider)]" />
        <div className="min-w-0 max-w-[220px] flex-1">
          <p className="truncate text-[12px] font-semibold text-[var(--color-ink)]">{item.label}</p>
          <p className="truncate text-[9px] text-[var(--color-ink)]/38">
            {manifest.templateRef ? `${manifest.templateRef.name} v${manifest.templateRef.version}` : '单图 manifest · 未引用分层模板'}
          </p>
        </div>
        <span className="ml-1 shrink-0 whitespace-nowrap rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ink)]/55">{isSingleLayer ? '单图层' : `多图层 · ${manifest.layers.length} 层`}</span>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button type="button" disabled={analysisState === 'running'} onClick={() => {
            setToolMode('select')
            if (!isSingleLayer) {
              toast('当前素材已是多图层，可直接在右侧选择图层')
              return
            }
            if (analysisState === 'ready') adoptSuggestion()
            else analyze()
          }} className="flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-[10px] font-medium text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)] disabled:opacity-45"><Sparkles className="size-3.5" />{analysisState === 'running' ? '分层中…' : analysisState === 'ready' ? '应用建议分层' : '智能分层'}</button>
          <button
            type="button"
            aria-pressed={toolMode === 'brush'}
            onClick={() => setToolMode((current) => current === 'brush' ? 'select' : 'brush')}
            className={`flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-[10px] font-medium transition-colors ${toolMode === 'brush' ? 'bg-[#EAF2FF] text-[#2563EB]' : 'text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)]'}`}
          ><Brush className="size-3.5" />智能画笔{brushStrokes.length > 0 ? ` ${brushStrokes.length}` : ''}</button>
          <button
            type="button"
            aria-pressed={toolMode === 'comment'}
            onClick={() => setToolMode((current) => current === 'comment' ? 'select' : 'comment')}
            className={`flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-[10px] font-medium transition-colors ${toolMode === 'comment' ? 'bg-[#EAF2FF] text-[#2563EB]' : 'text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)]'}`}
          ><MessageCircle className="size-3.5" />评论{comments.length > 0 ? ` ${comments.length}` : ''}</button>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--color-ink)] px-3 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Save className="size-3.5" /> {saving ? '正在生成扁平图…' : '保存为新版本'}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F4F5F7]">
          <div
            ref={canvasViewportRef}
            aria-label="单图无限画布"
            className="thin-scroll min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_1px_1px,rgba(22,24,35,0.12)_1px,transparent_0)] bg-[size:20px_20px]"
          >
            <div className="flex min-h-full w-max min-w-full items-center justify-center p-12">
              <div
                ref={artboardRef}
                aria-label={`画板：${item.label}`}
                onPointerMove={moveSelectedLayer}
                onPointerUp={finishLayerMove}
                onPointerCancel={finishLayerMove}
                className="relative overflow-hidden rounded-md bg-white shadow-[0_18px_48px_rgba(22,25,33,0.2)] [container-type:inline-size]"
                style={{
                  aspectRatio: `${manifest.canvas.width} / ${manifest.canvas.height}`,
                  width: `${artboardWidth}px`,
                }}
              >
              {[...manifest.layers].sort((a, b) => a.z - b.z).map((layer) => {
                if (!layer.visible) return null
                const active = layer.id === selectedId
                const style = {
                  left: `${layer.x / manifest.canvas.width * 100}%`,
                  top: `${layer.y / manifest.canvas.height * 100}%`,
                  width: `${layer.width / manifest.canvas.width * 100}%`,
                  height: `${layer.height / manifest.canvas.height * 100}%`,
                  opacity: layer.opacity ?? 1,
                  zIndex: layer.z,
                }
                return (
                  <button
                    key={layer.id}
                    type="button"
                    aria-label={`选中图层：${layer.name}`}
                    onClick={() => setSelectedId(layer.id)}
                    onPointerDown={(event) => startLayerMove(event, layer)}
                    className={`absolute touch-none overflow-hidden border-0 bg-transparent p-0 text-left ${layer.locked ? 'cursor-default' : 'cursor-move'} ${active ? 'ring-2 ring-[#3478FF] ring-inset' : 'hover:ring-1 hover:ring-[#3478FF]/55 hover:ring-inset'}`}
                    style={style}
                  >
                    {layer.type === 'text' ? (
                      <span
                        className="flex size-full items-center overflow-hidden whitespace-nowrap leading-none"
                        style={{
                          color: layer.color ?? '#FFFFFF',
                          fontSize: `${((layer.fontSize ?? 36) / manifest.canvas.width) * 100}cqw`,
                          fontWeight: layer.fontWeight ?? 600,
                          fontFamily: layer.fontFamily ?? layer.fontRef?.family,
                          letterSpacing: `${((layer.letterSpacing ?? 0) / manifest.canvas.width) * 100}cqw`,
                          lineHeight: layer.lineHeight ?? 1,
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
                    ) : layer.src ? (
                      <img src={layer.src} alt="" draggable={false} className="size-full object-contain" />
                    ) : layer.name.startsWith('智能识别') ? (
                      <span className="block size-full" />
                    ) : (
                      <span className="flex size-full items-center justify-center bg-black/10 text-[8px] text-white/65">{layer.name}</span>
                    )}
                  </button>
                )
              })}
              {brushStrokes.length > 0 ? (
                <svg
                  aria-label="智能画笔选区"
                  viewBox="0 0 1000 1000"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 z-[60] size-full"
                >
                  {brushStrokes.map((stroke) => (
                    <polyline
                      key={stroke.id}
                      points={stroke.points.map((point) => `${point.x * 1000},${point.y * 1000}`).join(' ')}
                      fill="none"
                      stroke="#3478FF"
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.72"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              ) : null}
              {comments.map((comment, index) => (
                <span
                  key={comment.id}
                  title={comment.text}
                  className={`pointer-events-none absolute z-[80] flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-white shadow-md ${comment.resolved ? 'bg-emerald-500' : 'bg-[#3478FF]'}`}
                  style={{ left: `${comment.x * 100}%`, top: `${comment.y * 100}%` }}
                >
                  {index + 1}
                </span>
              ))}
              {pendingComment ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute z-[80] flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#3478FF] text-[9px] font-semibold text-white shadow-md ring-4 ring-[#3478FF]/20"
                  style={{ left: `${pendingComment.x * 100}%`, top: `${pendingComment.y * 100}%` }}
                >
                  {comments.length + 1}
                </span>
              ) : null}
              {toolMode === 'brush' ? (
                <div
                  role="application"
                  aria-label="在画面上涂抹需要修改的区域"
                  onPointerDown={startBrushStroke}
                  onPointerMove={extendBrushStroke}
                  onPointerUp={finishBrushStroke}
                  onPointerCancel={finishBrushStroke}
                  onPointerLeave={finishBrushStroke}
                  className="absolute inset-0 z-[70] cursor-crosshair touch-none"
                />
              ) : null}
              {toolMode === 'comment' ? (
                <button
                  type="button"
                  aria-label="点击画面添加评论"
                  onClick={(event) => setPendingComment(pointFromPointer(event))}
                  className="absolute inset-0 z-[70] cursor-crosshair"
                />
              ) : null}
              {toolMode !== 'select' ? (
                <span className="pointer-events-none absolute left-2 top-2 z-[90] rounded-md bg-black/70 px-2 py-1 text-[9px] font-medium text-white shadow-sm">
                  {toolMode === 'brush' ? '拖动涂抹修改区域' : '点击画面放置评论'}
                </span>
              ) : null}
              {analysisState === 'ready' && isSingleLayer ? (
                <div className="pointer-events-none absolute inset-0 z-50">
                  <span className="absolute left-[8%] top-[10%] h-[16%] w-[56%] rounded border border-dashed border-[#B8A6FF] bg-[#6C5CE7]/15" />
                  <span className="absolute left-[68%] top-[70%] h-[12%] w-[22%] rounded border border-dashed border-[#B8A6FF] bg-[#6C5CE7]/15" />
                  <span className="absolute left-[72%] top-[8%] h-[9%] w-[20%] rounded border border-dashed border-[#B8A6FF] bg-[#6C5CE7]/15" />
                </div>
              ) : null}
              </div>
            </div>
          </div>
        </main>

        <aside aria-label={isSingleLayer ? '整图属性' : '图层与属性'} className="thin-scroll w-[264px] shrink-0 overflow-y-auto border-l border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-3">
          {toolMode === 'brush' ? (
            <section aria-label="智能画笔面板" className="mb-3 rounded-xl border border-[#BFD5FF] bg-[#F5F8FF] p-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-semibold text-[#2563EB]">智能画笔</h2>
                <span className="text-[8px] text-[#2563EB]/55">{brushStrokes.length} 笔选区</span>
              </div>
              <p className="mt-1 text-[8px] leading-3 text-[var(--color-ink)]/40">在画面上拖动涂抹，原图不会被直接覆盖。</p>
              <div className="mt-2 flex gap-1.5">
                <button type="button" disabled={brushStrokes.length === 0} onClick={() => setBrushStrokes((current) => current.slice(0, -1))} className="h-6 rounded-md border border-[#BFD5FF] bg-white px-2 text-[8px] text-[#2563EB] disabled:opacity-35">撤销一笔</button>
                <button type="button" disabled={brushStrokes.length === 0} onClick={() => { setBrushStrokes([]); setBrushResult(null) }} className="h-6 rounded-md border border-[#BFD5FF] bg-white px-2 text-[8px] text-[#2563EB] disabled:opacity-35">清除</button>
              </div>
              <textarea
                value={brushInstruction}
                onChange={(event) => setBrushInstruction(event.target.value)}
                placeholder="例如：移除这里的烟花"
                className="mt-2 h-16 w-full resize-none rounded-lg border border-[#BFD5FF] bg-white px-2 py-1.5 text-[9px] leading-4 text-[var(--color-ink)] outline-none focus:border-[#3478FF]"
              />
              <button
                type="button"
                disabled={brushStrokes.length === 0 || !brushInstruction.trim() || brushApplying}
                onClick={applyBrushEdit}
                className="mt-2 flex h-7 w-full items-center justify-center rounded-lg bg-[#3478FF] text-[9px] font-medium text-white disabled:opacity-35"
              >
                {brushApplying ? '生成局部候选中…' : '生成局部修改候选'}
              </button>
              {brushResult ? <p aria-live="polite" className="mt-2 rounded-md bg-white px-2 py-1.5 text-[8px] leading-3 text-emerald-700">{brushResult}</p> : null}
            </section>
          ) : null}

          {toolMode === 'comment' ? (
            <section aria-label="评论面板" className="mb-3 rounded-xl border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-semibold text-[var(--color-ink)]">评论</h2>
                <span className="text-[8px] text-[var(--color-ink)]/35">{comments.filter((comment) => !comment.resolved).length} 条待处理</span>
              </div>
              {pendingComment ? (
                <div className="mt-2 rounded-lg bg-white p-2 shadow-sm">
                  <p className="text-[8px] font-medium text-[#2563EB]">标记 {comments.length + 1}</p>
                  <textarea
                    autoFocus
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="输入这个位置的评论"
                    className="mt-1.5 h-14 w-full resize-none rounded-md border border-[var(--divider)] px-2 py-1.5 text-[9px] leading-4 outline-none focus:border-[#3478FF]"
                  />
                  <div className="mt-1.5 flex justify-end gap-1.5">
                    <button type="button" onClick={() => { setPendingComment(null); setCommentDraft('') }} className="h-6 rounded-md px-2 text-[8px] text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)]">取消</button>
                    <button type="button" disabled={!commentDraft.trim()} onClick={addComment} className="h-6 rounded-md bg-[#3478FF] px-2 text-[8px] font-medium text-white disabled:opacity-35">添加评论</button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[8px] leading-3 text-[var(--color-ink)]/38">点击画面中的位置放置评论标记。</p>
              )}
              {comments.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {comments.map((comment, index) => (
                    <div key={comment.id} className={`rounded-lg bg-white p-2 ${comment.resolved ? 'opacity-55' : ''}`}>
                      <div className="flex items-start gap-2">
                        <span className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[7px] font-semibold text-white ${comment.resolved ? 'bg-emerald-500' : 'bg-[#3478FF]'}`}>{index + 1}</span>
                        <p className="min-w-0 flex-1 text-[8px] leading-3 text-[var(--color-ink)]/65">{comment.text}</p>
                        <button type="button" onClick={() => setComments((current) => current.map((candidate) => candidate.id === comment.id ? { ...candidate, resolved: !candidate.resolved } : candidate))} className="shrink-0 text-[7px] text-[#2563EB]">{comment.resolved ? '重新打开' : '解决'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold text-[var(--color-ink)]">{isSingleLayer ? '图片对象' : '图层'}</h2>
              <span className="text-[8px] text-[var(--color-ink)]/32">{isSingleLayer ? '仅整图' : '从上到下'}</span>
            </div>
            {isSingleLayer ? <p className="mt-1 text-[8px] leading-3 text-[var(--color-ink)]/34">这是一张扁平图片，不存在可单独选择的内部元素；使用智能分层后才会生成候选图层。</p> : null}
            <div className="mt-2 space-y-1" role="list" aria-label={isSingleLayer ? '图片对象列表' : '图层列表'}>
              {orderedLayers.map((layer) => {
                const Icon = layerIcon(layer)
                const active = layer.id === selectedId
                return (
                  <div
                    key={layer.id}
                    role="listitem"
                    className={`flex h-8 items-center gap-1 rounded-md px-1 ${active ? 'bg-[#EAF2FF] text-[#2563EB]' : 'text-[var(--color-ink)]/58 hover:bg-[var(--fill-hover)]'}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(layer.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-1 text-left"
                    >
                      <Icon className="size-3 shrink-0" />
                      <span className="truncate text-[9px] font-medium">{layer.name}</span>
                    </button>
                    {layer.locked ? <Lock className="size-2.5 shrink-0 opacity-40" /> : null}
                    <button
                      type="button"
                      aria-label={layer.visible ? `隐藏图层：${layer.name}` : `显示图层：${layer.name}`}
                      onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                      className={`flex size-6 shrink-0 items-center justify-center rounded ${layer.visible ? 'opacity-65' : 'opacity-25'}`}
                    >
                      <Eye className="size-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="mt-3 border-t border-[var(--divider-soft)] pt-3">
            <h2 className="text-[11px] font-semibold text-[var(--color-ink)]">{isSingleLayer ? '整图属性' : '图层属性'}</h2>
          </section>
          {selected ? (
            <div className="mt-3 space-y-4">
              <section>
                <p className="text-[10px] font-medium text-[var(--color-ink)]/65">{selected.name}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded bg-[var(--fill-subtle)] px-1.5 py-1 text-[8px] text-[var(--color-ink)]/52">{RENDERER_LABEL[selected.renderer]}</span>
                  {selected.locked ? <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-1 text-[8px] text-amber-700"><Lock className="size-2.5" /> 锁定</span> : null}
                </div>
              </section>

              {selected.type === 'text' ? (
                <label className="block">
                  <span className="text-[9px] font-medium text-[var(--color-ink)]/48">文字内容</span>
                  <textarea
                    value={selected.text ?? ''}
                    disabled={selected.locked}
                    onChange={(event) => updateLayer(selected.id, { text: event.target.value })}
                    className="mt-1.5 h-20 w-full resize-none rounded-lg border border-[var(--divider)] bg-white px-2.5 py-2 text-[10px] leading-4 text-[var(--color-ink)] outline-none focus:border-[#3478FF]/55 disabled:cursor-not-allowed disabled:bg-[var(--fill-subtle)] disabled:text-[var(--color-ink)]/42"
                  />
                  <span className="mt-1 block text-[8px] text-[var(--color-ink)]/34">{selected.fontRef ? `${selected.fontRef.family} v${selected.fontRef.version}` : '未绑定字体版本'}</span>
                </label>
              ) : (
                <section>
                  <p className="text-[9px] font-medium text-[var(--color-ink)]/48">图像内容</p>
                  <div className="mt-1.5 rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-2">
                    <p className="truncate text-[8px] text-[var(--color-ink)]/45">{selected.src ?? '待绑定资产'}</p>
                    {!selected.locked ? (
                      <button type="button" onClick={() => uploadInputRef.current?.click()} className="mt-2 flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-[var(--divider)] bg-white text-[9px] font-medium text-[var(--color-ink)]/58 hover:bg-[var(--fill-hover)]">
                        <Upload className="size-3" /> 替换当前图层
                      </button>
                    ) : null}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-medium text-[var(--color-ink)]/48">层序与显示</p>
                  <div className="flex gap-1">
                    <button type="button" aria-label="下移图层" disabled={selected.locked} onClick={() => moveLayer(-1)} className="flex size-6 items-center justify-center rounded border border-[var(--divider)] disabled:opacity-30"><ArrowDown className="size-3" /></button>
                    <button type="button" aria-label="上移图层" disabled={selected.locked} onClick={() => moveLayer(1)} className="flex size-6 items-center justify-center rounded border border-[var(--divider)] disabled:opacity-30"><ArrowUp className="size-3" /></button>
                  </div>
                </div>
                <label className="mt-2 block text-[8px] text-[var(--color-ink)]/38">
                  不透明度 {Math.round((selected.opacity ?? 1) * 100)}%
                  <input type="range" min="0.1" max="1" step="0.05" value={selected.opacity ?? 1} disabled={selected.locked} onChange={(event) => updateLayer(selected.id, { opacity: Number(event.target.value) })} className="mt-1 w-full accent-[#3478FF] disabled:cursor-not-allowed disabled:opacity-35" />
                </label>
              </section>

              <section className="rounded-xl border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-2.5">
                <p className="text-[9px] font-semibold text-[var(--color-ink)]/58">
                  {isSingleLayer ? '整图保持原始尺寸与比例' : selected.locked ? '位置由模板锁定' : '位置与尺寸 · 可在画布中拖拽'}
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[8px]">
                  <div><dt className="text-[var(--color-ink)]/30">X / Y</dt><dd className="mt-0.5 text-[var(--color-ink)]/52">{selected.x} / {selected.y}</dd></div>
                  <div><dt className="text-[var(--color-ink)]/30">宽 / 高</dt><dd className="mt-0.5 text-[var(--color-ink)]/52">{selected.width} / {selected.height}</dd></div>
                </dl>
              </section>

              <section className="border-t border-[var(--divider-soft)] pt-3">
                <p className="text-[9px] font-semibold text-[var(--color-ink)]/58">生成与校验依据</p>
                <p className="mt-1 text-[8px] leading-3.5 text-[var(--color-ink)]/38">
                  {manifest.templateRef ? `${manifest.templateRef.name} v${manifest.templateRef.version}` : '未引用模板'}
                  {manifest.styleBibleRef ? ` · ${manifest.styleBibleRef.name} v${manifest.styleBibleRef.version}` : ''}
                </p>
              </section>
            </div>
          ) : (
            <p className="mt-3 text-[9px] text-[var(--color-ink)]/35">{isSingleLayer ? '选中整图查看属性。' : '选中一个图层查看可编辑内容。'}</p>
          )}
        </aside>
      </div>
    </div>
  )
}
