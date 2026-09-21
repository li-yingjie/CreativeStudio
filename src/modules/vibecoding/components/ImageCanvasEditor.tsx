import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
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
      <div className="relative min-h-0 flex-1">
        {selectedItem && (
          <SelectionToolbar
            centerX={selectedItem.x + selectedItem.w / 2 - scroll.left}
            imgTop={selectedItem.y - scroll.top}
            imgBottom={selectedItem.y + selectedItem.h - scroll.top}
            viewportW={viewportW}
          />
        )}
        <div
          ref={wrapRef}
          onPointerDown={() => setSelectedId(null)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onScroll={(e) => setScroll({ left: e.currentTarget.scrollLeft, top: e.currentTarget.scrollTop })}
          className="absolute inset-0 overflow-auto"
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
      className="absolute z-20 flex max-w-[calc(100%-24px)] items-center gap-1 overflow-visible rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2 py-1.5 shadow-[0_12px_30px_-10px_rgba(16,18,24,0.28)]"
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
  canvasLabel = '画布编辑',
}: {
  onCanvasEdit?: () => void
  onUpload?: () => void
  canvasLabel?: string
}) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreTools = [
    { icon: <Eraser size={15} strokeWidth={1.7} />, label: '橡皮工具' },
    { icon: <Layers size={15} strokeWidth={1.7} />, label: '编辑元素' },
    { icon: <Type size={15} strokeWidth={1.7} />, label: '编辑文字' },
    { icon: <Box size={15} strokeWidth={1.7} />, label: '多角度' },
    { icon: <Move size={15} strokeWidth={1.7} />, label: '移动对象' },
  ]

  return (
    <>
      {onCanvasEdit ? (
        <>
          <button
            type="button"
            onClick={onCanvasEdit}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-2 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
          >
            <span className="flex h-5 w-5 items-center justify-center text-[var(--color-ink)]/65">
              <LayoutGrid size={13} strokeWidth={1.8} />
            </span>
            {canvasLabel}
          </button>
          <Divider />
        </>
      ) : null}

      <ToolBtn
        icon={<Upload size={15} strokeWidth={1.7} />}
        label="上传"
        onClick={onUpload}
      />
      <ToolBtn icon={<HdBadge />} label="放大" />
      <ToolBtn icon={<Scissors size={15} strokeWidth={1.7} />} label="去背景" />

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
          className="relative flex h-8 w-8 items-center justify-center rounded-xl text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <MoreHorizontal size={16} strokeWidth={1.8} />
        </button>
        {moreOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[132px] overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] py-1 shadow-[0_12px_28px_-8px_rgba(16,18,24,0.24)]">
            {moreTools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-full items-center gap-2 px-3 text-left text-[12px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
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

      <Divider />

      <button
        type="button"
        title="导出"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
      >
        <Download size={16} strokeWidth={1.7} />
      </button>
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
