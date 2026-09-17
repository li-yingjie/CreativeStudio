import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  ImagePlus,
  Video,
} from '@/shared/icons'
import type { AssetGroup } from './GarudaAssetsView'

/**
 * 运营活动素材画布 — all-web-inspiration 这一路专用。
 * 互动游戏继续走 ImageCanvasEditor，两边先不合成一套。
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

export default function MarketingImageCanvasEditor({
  groups,
  onClose,
}: {
  groups: AssetGroup[]
  onClose: () => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const aspectsRef = useRef<Record<string, number>>({})
  const zRef = useRef(0)

  const [items, setItems] = useState<CanvasItem[]>([])
  const [labels, setLabels] = useState<RowLabel[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [viewportW, setViewportW] = useState(0)
  // Scroll offset of the canvas — the floating toolbar is positioned in
  // viewport space, so it must re-anchor when the canvas scrolls.
  const [scroll, setScroll] = useState({ left: 0, top: 0 })

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

  const ptToContent = (clientX: number, clientY: number) => {
    const el = wrapRef.current
    if (!el) return { x: clientX, y: clientY }
    const r = el.getBoundingClientRect()
    return { x: clientX - r.left + el.scrollLeft, y: clientY - r.top + el.scrollTop }
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
            centerX={selectedItem.x + selectedItem.w / 2 - scroll.left}
            imgTop={selectedItem.y - scroll.top}
            imgBottom={selectedItem.y + selectedItem.h - scroll.top}
            viewportW={viewportW}
          />
        )}
        <CanvasDock />
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
}: {
  centerX: number
  imgTop: number
  imgBottom: number
  viewportW: number
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
      <ImageQuickTools />
    </div>
  )
}

/** Shared image actions used by both the multi-image canvas and the
 *  single-asset Prompt detail. Keep the visual language in one place. */
export function ImageQuickTools({
  onCanvasEdit,
  onUpload,
}: {
  onCanvasEdit?: () => void
  onUpload?: () => void
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
