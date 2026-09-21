import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Trash2,
  LayoutGrid,
  Maximize2,
  Scissors,
  Eraser,
  Layers,
  Type,
  Box,
  Move,
  MoreHorizontal,
  Download,
  Upload,
  Crop,
  FileInfo,
  MessageSquarePlus,
  RefreshCw,
  Sparkles,
  Plus,
  Minus,
  ImagePlus,
  Smartphone,
  Video,
} from '@/shared/icons'
import type { AssetGroup } from './GarudaAssetsView'

/**
 * 画布式素材编辑器 — 从游戏「素材 · 图片」工具栏点「画布编辑」进入。画布是
 * 主题点阵背景，图片按类型一排排开（每个分组一行，宽度随原始比例，不
 * 强行铺成规则矩形）。可拖拽移动 / 拖角缩放 / 选中删除；选中一张图片时顶部
 * 浮出一条编辑工具条。纯前端演示版本。
 */

type CanvasItem = {
  id: string
  src: string
  label: string
  x: number
  y: number
  w: number
  h: number
  z: number
}
type RowLabel = { title: string; x: number; y: number }

const ROW_H = 84
const GAP_X = 14
const PAD_X = 24
// Leaves room at the top so the floating selection toolbar doesn't cover
// the first type row when an image there is selected.
const PAD_Y = 60
const LABEL_H = 22
const ROW_GAP = 34
const MIN_ZOOM = 0.6
const MAX_ZOOM = 2.4

function buildLayout(
  groups: AssetGroup[],
  aspects: Record<string, number>,
): { items: CanvasItem[]; labels: RowLabel[] } {
  const items: CanvasItem[] = []
  const labels: RowLabel[] = []
  let y = PAD_Y
  let z = 0
  for (const g of groups) {
    labels.push({ title: g.title, x: PAD_X, y })
    const imgY = y + LABEL_H
    let x = PAD_X
    for (const it of g.items) {
      const a = aspects[it.src] ?? 1
      const w = Math.max(44, Math.min(260, Math.round(ROW_H * a)))
      items.push({ id: nanoid(6), src: it.src, label: it.label, x, y: imgY, w, h: ROW_H, z: ++z })
      x += w + GAP_X
    }
    y = imgY + ROW_H + ROW_GAP
  }
  return { items, labels }
}

export default function ImageCanvasEditor({
  groups,
  onClose,
  focusSrc,
  onSync,
}: {
  groups: AssetGroup[]
  onClose: () => void
  /** 从页面图片下钻时，进入画布后直接选中并居中这张素材。 */
  focusSrc?: string
  /** 把画布里的当前版本写回发起下钻的页面图片槽位。 */
  onSync?: (src: string) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const aspectsRef = useRef<Record<string, number>>({})
  const zRef = useRef(0)

  const [items, setItems] = useState<CanvasItem[]>([])
  const [labels, setLabels] = useState<RowLabel[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [viewportW, setViewportW] = useState(0)
  const [zoom, setZoom] = useState(focusSrc ? 1.7 : 1)
  const zoomRef = useRef(zoom)
  const focusedSrcRef = useRef<string | null>(null)
  // Scroll offset of the canvas — the floating toolbar is positioned in
  // viewport space, so it must re-anchor when the canvas scrolls.
  const [scroll, setScroll] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useLayoutEffect(() => {
    const element = wrapRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setViewportW(entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Preload every image to measure its aspect ratio, then lay out once so
  // each row's items keep their natural proportions.
  useEffect(() => {
    let cancelled = false
    const all = groups.flatMap((g) => g.items)
    const result: Record<string, number> = {}
    let remaining = all.length
    const finish = () => {
      if (cancelled) return
      aspectsRef.current = result
      const { items: its, labels: lbs } = buildLayout(groups, result)
      zRef.current = its.length
      setItems(its)
      setLabels(lbs)
      setReady(true)
    }
    if (remaining === 0) {
      finish()
      return
    }
    all.forEach((it) => {
      const img = new Image()
      const mark = (ratio: number) => {
        result[it.src] = ratio
        if (--remaining === 0) finish()
      }
      img.onload = () =>
        mark(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1)
      img.onerror = () => mark(1)
      img.src = it.src
    })
    return () => {
      cancelled = true
    }
  }, [groups])

  /* 页面图片下钻不是打开素材总览，而是带着明确目标来编辑。素材尺寸
     测量完后直接选中目标，并在放大后的画布里把它锚定到视口中心。 */
  useLayoutEffect(() => {
    if (!ready || !focusSrc) return
    if (focusedSrcRef.current === focusSrc) return
    const target = items.find((item) => item.src === focusSrc)
    const viewport = wrapRef.current
    if (!target || !viewport) return
    focusedSrcRef.current = focusSrc
    setSelectedId(target.id)
    const frame = requestAnimationFrame(() => {
      const insetX = Math.max(
        0,
        viewport.clientWidth / (2 * zoom) - (target.x + target.w / 2),
      )
      viewport.scrollTo({
        left: Math.max(
          0,
          (target.x + target.w / 2 + insetX) * zoom - viewport.clientWidth / 2,
        ),
        top: Math.max(0, (target.y + target.h / 2) * zoom - viewport.clientHeight / 2),
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusSrc, items, ready, zoom])

  // Mac 触控板捏合会以 ctrl+wheel 上报。按手势点缩放并回写 scroll，
  // 让素材留在指尖下；普通双指滚动继续交给原生画布平移。
  useEffect(() => {
    const viewport = wrapRef.current
    if (!viewport) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const currentZoom = zoomRef.current
      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, currentZoom * Math.exp(-event.deltaY / 240)),
      )
      if (Math.abs(nextZoom - currentZoom) < 0.001) return
      const rect = viewport.getBoundingClientRect()
      const localX = event.clientX - rect.left
      const localY = event.clientY - rect.top
      const anchorX = (viewport.scrollLeft + localX) / currentZoom
      const anchorY = (viewport.scrollTop + localY) / currentZoom
      zoomRef.current = nextZoom
      setZoom(nextZoom)
      requestAnimationFrame(() => {
        viewport.scrollTo({
          left: Math.max(0, anchorX * nextZoom - localX),
          top: Math.max(0, anchorY * nextZoom - localY),
        })
      })
    }
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [ready])

  const ptToContent = (clientX: number, clientY: number) => {
    const el = wrapRef.current
    if (!el) return { x: clientX, y: clientY }
    const r = el.getBoundingClientRect()
    return {
      x: (clientX - r.left + el.scrollLeft) / zoom - contentOffsetX,
      y: (clientY - r.top + el.scrollTop) / zoom,
    }
  }

  const bringFront = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, z: ++zRef.current } : it)))

  const gestureRef = useRef<
    | { type: 'move' | 'resize'; id: string; dx: number; dy: number; startW: number; startH: number; startX: number; startY: number }
    | null
  >(null)

  const startGesture = (type: 'move' | 'resize', id: string) => (e: React.PointerEvent) => {
    e.stopPropagation()
    setSelectedId(id)
    bringFront(id)
    const it = items.find((x) => x.id === id)
    if (!it) return
    const p = ptToContent(e.clientX, e.clientY)
    gestureRef.current = {
      type,
      id,
      dx: p.x - it.x,
      dy: p.y - it.y,
      startW: it.w,
      startH: it.h,
      startX: p.x,
      startY: p.y,
    }
    try {
      wrapRef.current?.setPointerCapture(e.pointerId)
    } catch {
      /* stale pointer id — drag still works via wrap-level handlers */
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gestureRef.current
    if (!g) return
    const p = ptToContent(e.clientX, e.clientY)
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== g.id) return it
        if (g.type === 'move') return { ...it, x: Math.max(0, p.x - g.dx), y: Math.max(0, p.y - g.dy) }
        return {
          ...it,
          w: Math.max(32, g.startW + (p.x - g.startX)),
          h: Math.max(32, g.startH + (p.y - g.startY)),
        }
      }),
    )
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (gestureRef.current) {
      try {
        wrapRef.current?.releasePointerCapture(e.pointerId)
      } catch {
        /* no-op */
      }
      gestureRef.current = null
    }
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setItems((prev) => prev.filter((it) => it.id !== selectedId))
    setSelectedId(null)
  }

  const resetLayout = () => {
    const { items: its, labels: lbs } = buildLayout(groups, aspectsRef.current)
    zRef.current = its.length
    setItems(its)
    setLabels(lbs)
    setSelectedId(null)
  }

  const selectedItem = selectedId ? items.find((it) => it.id === selectedId) ?? null : null
  const focusItem = focusSrc ? items.find((item) => item.src === focusSrc) ?? null : null
  const contentOffsetX =
    focusItem && viewportW
      ? Math.max(0, viewportW / (2 * zoom) - (focusItem.x + focusItem.w / 2))
      : 0
  const canvasSize = useMemo(() => {
    const right = Math.max(viewportW / zoom, ...items.map((item) => item.x + item.w), 0)
    const bottom = Math.max(520, ...items.map((item) => item.y + item.h), 0)
    return { width: right + PAD_X * 2, height: bottom + PAD_Y }
  }, [items, viewportW, zoom])

  const uploadSelected = () => uploadRef.current?.click()
  const replaceSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selectedId) return
    if (file.size > 4 * 1024 * 1024) {
      toast.error('图片超过 4MB，请先压缩')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      setItems((prev) => prev.map((item) => (item.id === selectedId ? { ...item, src } : item)))
      toast('已更新画布中的图片')
    }
    reader.readAsDataURL(file)
  }

  const syncSelected = () => {
    if (!selectedItem || !onSync) return
    onSync(selectedItem.src)
    toast('图片已同步回页面')
    onClose()
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3">
        <button
          type="button"
          onClick={onClose}
          title="返回素材"
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[12.5px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          返回
        </button>
        <span className="ml-1 text-[12.5px] font-semibold text-[var(--color-ink)]">画布编辑</span>
        <span className="font-mono text-[11px] text-[var(--color-ink)]/40">{items.length} 张图片</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={deleteSelected}
            disabled={!selectedId}
            title="删除选中"
            className="flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Trash2 size={13} strokeWidth={1.8} />
            删除
          </button>
          <button
            type="button"
            onClick={resetLayout}
            title="重置布局"
            className="flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <LayoutGrid size={13} strokeWidth={1.8} />
            重置布局
          </button>
        </div>
      </div>

      {/* Canvas area (relative so the selection toolbar can float over the
          selected image and track it while dragging / scrolling) */}
      <div className="relative isolate min-h-0 flex-1">
        {selectedItem && (
          <SelectionToolbar
            centerX={(selectedItem.x + selectedItem.w / 2 + contentOffsetX) * zoom - scroll.left}
            imgTop={selectedItem.y * zoom - scroll.top}
            imgBottom={(selectedItem.y + selectedItem.h) * zoom - scroll.top}
            viewportW={viewportW}
            onUpload={uploadSelected}
            onSync={onSync ? syncSelected : undefined}
          />
        )}
        <CanvasDock />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={replaceSelected}
          className="hidden"
        />
        <div className="pointer-events-none absolute bottom-4 right-4 z-[95] flex items-center rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-1 shadow-[0_10px_28px_-12px_rgba(16,18,24,0.28)]">
          <button
            type="button"
            title="缩小画布"
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, Number((value - 0.1).toFixed(1))))}
            className="pointer-events-auto flex size-7 items-center justify-center rounded-lg text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)]"
          >
            <Minus size={14} strokeWidth={1.8} />
          </button>
          <span className="w-12 text-center font-mono text-[10.5px] text-[var(--color-ink)]/65">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            title="放大画布"
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, Number((value + 0.1).toFixed(1))))}
            className="pointer-events-auto flex size-7 items-center justify-center rounded-lg text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)]"
          >
            <Plus size={14} strokeWidth={1.8} />
          </button>
        </div>
        <div
          ref={wrapRef}
          onPointerDown={() => setSelectedId(null)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onScroll={(e) => setScroll({ left: e.currentTarget.scrollLeft, top: e.currentTarget.scrollTop })}
          className="absolute inset-0 z-0 overflow-auto"
          style={{
            backgroundColor: 'var(--color-surface-0)',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-ink-10) 1px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        >
          {!ready && (
            <div className="flex h-full items-center justify-center text-[12px] text-[var(--color-ink)]/40">
              正在载入素材…
            </div>
          )}
          <div
            style={{
              width: (canvasSize.width + contentOffsetX) * zoom,
              height: canvasSize.height * zoom,
            }}
          >
            <div
              className="absolute top-0"
              style={{
                left: contentOffsetX,
                width: canvasSize.width,
                height: canvasSize.height,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              {/* group labels */}
              {labels.map((l) => (
                <span
                  key={`${l.title}-${l.y}`}
                  className="pointer-events-none absolute font-mono text-[11px] font-medium text-[var(--color-ink)]/45"
                  style={{ left: l.x, top: l.y }}
                >
                  {l.title}
                </span>
              ))}
              {/* images */}
              {items.map((it) => {
                const active = it.id === selectedId
                return (
                  <div
                    key={it.id}
                    onPointerDown={startGesture('move', it.id)}
                    className={`group absolute touch-none select-none rounded-[3px] ${
                      active ? 'ring-2 ring-[#3478ff]' : 'ring-1 ring-transparent hover:ring-[#3478ff]/40'
                    }`}
                    style={{ left: it.x, top: it.y, width: it.w, height: it.h, zIndex: it.z, cursor: 'grab' }}
                  >
                    <img
                      src={it.src}
                      alt={it.label}
                      draggable={false}
                      className="pointer-events-none h-full w-full object-contain"
                    />
                    {active && (
                      <>
                        <span className="pointer-events-none absolute -top-5 left-0 max-w-full truncate rounded bg-[var(--color-ink)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ink-contrast)]">
                          {it.label}
                        </span>
                        <span
                          onPointerDown={startGesture('resize', it.id)}
                          title="拖拽缩放"
                          className="absolute -bottom-1 -right-1 flex h-4 w-4 cursor-nwse-resize items-center justify-center rounded-sm bg-[#3478ff] text-white"
                        >
                          <Maximize2 size={9} strokeWidth={2.4} />
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Canvas-level dock — fixed to the viewport, not the scrolling content ─── */

function CanvasDock() {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const uploadTypes = [
    { icon: <ImagePlus size={16} strokeWidth={1.7} />, label: '上传图片' },
    { icon: <Video size={16} strokeWidth={1.7} />, label: '上传视频' },
    { icon: <Box size={16} strokeWidth={1.7} />, label: '上传 3D 模型' },
  ]
  const activate = (label: string) => {
    setActiveTool(label)
    setAddOpen(false)
    toast(`${label}（演示）`)
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-4 z-[90] flex justify-center px-4"
      aria-label="画布工具"
    >
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-1.5 shadow-[0_14px_36px_-12px_rgba(16,18,24,0.28)]"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div
          className="relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setAddOpen(false)
          }}
        >
          <CanvasDockButton
            icon={<Plus size={19} strokeWidth={1.7} />}
            label="素材上传"
            active={addOpen}
            expanded={addOpen}
            onClick={() => setAddOpen((open) => !open)}
          />
          {addOpen && (
            <div className="absolute bottom-full left-1/2 z-[110] mb-2 w-[190px] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] py-1.5 shadow-[0_16px_36px_-10px_rgba(16,18,24,0.28)]">
              {uploadTypes.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => activate(item.label)}
                  className="flex h-9 w-full items-center gap-2.5 px-3.5 text-left text-[12.5px] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                >
                  <span className="flex size-4 items-center justify-center text-[var(--color-ink)]/55">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <CanvasDockButton
          icon={<LayoutGrid size={17} strokeWidth={1.7} />}
          label="我的素材"
          active={activeTool === '我的素材'}
          onClick={() => activate('我的素材')}
        />
        <CanvasDockButton
          icon={<Sparkles size={17} strokeWidth={1.7} />}
          label="灵感"
          active={activeTool === '灵感'}
          onClick={() => activate('灵感')}
        />
      </div>
    </div>
  )
}

function CanvasDockButton({
  icon,
  label,
  active,
  expanded,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  expanded?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      aria-expanded={expanded}
      onClick={onClick}
      className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
        active
          ? 'bg-[var(--fill-medium)] text-[var(--color-ink)]'
          : 'text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]'
      }`}
    >
      {icon}
    </button>
  )
}

/* ─── Floating selection toolbar (mock — buttons are visual only) ─── */

function SelectionToolbar({
  centerX,
  imgTop,
  imgBottom,
  viewportW,
  onUpload,
  onSync,
}: {
  centerX: number
  imgTop: number
  imgBottom: number
  viewportW: number
  onUpload?: () => void
  onSync?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth)
  }, [])

  const GAP = 10
  const MARGIN = 8
  const EST_H = 48
  // Float above the image; flip below when there isn't room above.
  const above = imgTop - GAP - EST_H >= MARGIN
  const top = above ? imgTop - GAP : imgBottom + GAP
  // Center on the image but keep the whole bar inside the viewport. When the
  // bar is wider than the canvas it can't track horizontally — center it.
  const half = w / 2
  let left = centerX
  if (w && viewportW) {
    const lo = MARGIN + half
    const hi = viewportW - MARGIN - half
    left = lo > hi ? viewportW / 2 : Math.min(Math.max(centerX, lo), hi)
  }

  return (
    <div
      ref={ref}
      // Keep clicks inside the bar from clearing the selection.
      onPointerDown={(e) => e.stopPropagation()}
      style={{ left, top, transform: above ? 'translate(-50%, -100%)' : 'translate(-50%, 0)' }}
      className="absolute z-[100] flex w-max max-w-none items-center gap-1 overflow-visible rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2 py-1.5 shadow-[0_12px_30px_-10px_rgba(16,18,24,0.28)]"
    >
      <ImageQuickTools onUpload={onUpload} onSync={onSync} />
    </div>
  )
}

/** Shared image actions used by both the multi-image canvas and the
 *  single-asset Prompt detail. Keep the visual language in one place. */
export function ImageQuickTools({
  onCanvasEdit,
  onUpload,
  onSync,
}: {
  onCanvasEdit?: () => void
  onUpload?: () => void
  onSync?: () => void
}) {
  const [moreOpen, setMoreOpen] = useState(false)
  const runDemoAction = (label: string) => {
    setMoreOpen(false)
    toast(`${label}（演示）`)
  }
  const moreTools = [
    { icon: <Layers size={15} strokeWidth={1.7} />, label: '编辑元素' },
    { icon: <Sparkles size={15} strokeWidth={1.7} />, label: '动态视频生成' },
    { icon: <RefreshCw size={15} strokeWidth={1.7} />, label: '重新生成' },
    { icon: <Maximize2 size={15} strokeWidth={1.7} />, label: '扩展画面' },
    { icon: <Crop size={15} strokeWidth={1.7} />, label: '裁剪' },
    { icon: <Move size={15} strokeWidth={1.7} />, label: '调整视图' },
    { icon: <Box size={15} strokeWidth={1.7} />, label: '矢量化' },
    { icon: <MessageSquarePlus size={15} strokeWidth={1.7} />, label: '添加到对话' },
    { icon: <FileInfo size={15} strokeWidth={1.7} />, label: '素材详情' },
  ]

  return (
    <>
      {onCanvasEdit && (
        <>
          {/* 与素材页外部入口共用同一枚画布 icon。 */}
          <button
            type="button"
            onClick={onCanvasEdit}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-2 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
          >
            <span className="flex h-5 w-5 items-center justify-center text-[var(--color-ink)]/65">
              <LayoutGrid size={13} strokeWidth={1.8} />
            </span>
            画布编辑
          </button>
          <Divider />
        </>
      )}

      {onUpload && <ToolBtn icon={<Upload size={15} strokeWidth={1.7} />} label="上传" onClick={onUpload} />}
      <ToolBtn icon={<Scissors size={15} strokeWidth={1.7} />} label="去背景" onClick={() => runDemoAction('去背景')} />
      <ToolBtn icon={<Type size={15} strokeWidth={1.7} />} label="编辑文字" onClick={() => runDemoAction('编辑文字')} />
      <ToolBtn icon={<Layers size={15} strokeWidth={1.7} />} label="局部编辑" onClick={() => runDemoAction('局部编辑')} />
      <ToolBtn icon={<HdBadge />} label="高清放大" onClick={() => runDemoAction('高清放大')} />
      <ToolBtn icon={<Eraser size={15} strokeWidth={1.7} />} label="擦除" onClick={() => runDemoAction('擦除')} />

      {onSync && (
        <ToolBtn
          icon={<Smartphone size={15} strokeWidth={1.7} />}
          label="同步回页面"
          onClick={onSync}
        />
      )}

      <Divider />

      <button
        type="button"
        title="下载"
        aria-label="下载"
        onClick={() => runDemoAction('下载')}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
      >
        <Download size={16} strokeWidth={1.7} />
      </button>

      <div
        className="relative shrink-0"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMoreOpen(false)
        }}
      >
        <button
          type="button"
          title="更多图片工具"
          aria-label="更多图片工具"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
          className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            moreOpen
              ? 'bg-[var(--fill-medium)] text-[var(--color-ink)] hover:bg-[var(--fill-strong)]'
              : 'text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]'
          }`}
        >
          <MoreHorizontal size={16} strokeWidth={1.8} />
        </button>
        {moreOpen && (
          <div className="absolute right-0 top-full z-[110] mt-2 min-w-[184px] overflow-hidden rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] py-1.5 shadow-[0_16px_36px_-10px_rgba(16,18,24,0.28)]">
            {moreTools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={() => runDemoAction(tool.label)}
                className="flex h-9 w-full items-center gap-2.5 px-3.5 text-left text-[12.5px] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <span className="flex size-4 items-center justify-center text-[var(--color-ink)]/55">
                  {tool.icon}
                </span>
                {tool.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ToolBtn({
  icon,
  label,
  dot,
  onClick,
}: {
  icon: React.ReactNode
  label?: string
  dot?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="relative flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-2 text-[13px] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
    >
      <span className="flex items-center justify-center text-[var(--color-ink)]/65">{icon}</span>
      {label}
      {dot && <span className="absolute right-1 top-0.5 h-1.5 w-1.5 rounded-full bg-[#ff4d4f]" />}
    </button>
  )
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-[var(--divider)]" />
}

function HdBadge() {
  return (
    <span className="flex h-[15px] items-center rounded-[4px] border border-current px-1 text-[9px] font-bold leading-none">
      HD
    </span>
  )
}
