import { useEffect, useRef, useState } from 'react'
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
} from '@/shared/icons'
import type { AssetGroup } from './GarudaAssetsView'

/**
 * 画布式素材编辑器 — 从游戏「素材 · 图片」工具栏点「画布编辑」进入。画布是
 * 透明（棋盘格）背景，图片按类型一排排开（每个分组一行，宽度随原始比例，不
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

      {/* Canvas area (relative so the selection toolbar can float at the top) */}
      <div className="relative min-h-0 flex-1">
        {selectedId && <SelectionToolbar />}
        <div
          ref={wrapRef}
          onPointerDown={() => setSelectedId(null)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="absolute inset-0 overflow-auto"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage:
              'linear-gradient(45deg,#eceef2 25%,transparent 25%),linear-gradient(-45deg,#eceef2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceef2 75%),linear-gradient(-45deg,transparent 75%,#eceef2 75%)',
            backgroundSize: '18px 18px',
            backgroundPosition: '0 0,0 9px,9px -9px,-9px 0',
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

function SelectionToolbar() {
  return (
    <div
      // Keep clicks inside the bar from clearing the selection.
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute left-1/2 top-3 z-20 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2 py-1.5 shadow-[0_12px_30px_-10px_rgba(16,18,24,0.28)]"
    >
      {/* 快捷编辑 — leads with the 抖音AI工坊 brand mark */}
      <button
        type="button"
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-2 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-ink-contrast)]">
          <BrandMark size={12} />
        </span>
        快捷编辑
        <span className="text-[12px] text-[var(--color-ink)]/35">Tab</span>
      </button>

      <Divider />

      <ToolBtn icon={<HdBadge />} label="放大" />
      <ToolBtn icon={<Scissors size={15} strokeWidth={1.7} />} label="去背景" />
      <ToolBtn icon={<Eraser size={15} strokeWidth={1.7} />} label="橡皮工具" />
      <ToolBtn icon={<Layers size={15} strokeWidth={1.7} />} label="编辑元素" />
      <ToolBtn icon={<Type size={15} strokeWidth={1.7} />} label="编辑文字" />
      <ToolBtn icon={<Box size={15} strokeWidth={1.7} />} label="多角度" />
      <ToolBtn icon={<Move size={15} strokeWidth={1.7} />} label="移动对象" dot />
      <ToolBtn icon={<MoreHorizontal size={16} strokeWidth={1.8} />} dot />

      <Divider />

      <button
        type="button"
        title="导出"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
      >
        <Download size={16} strokeWidth={1.7} />
      </button>
    </div>
  )
}

function ToolBtn({ icon, label, dot }: { icon: React.ReactNode; label?: string; dot?: boolean }) {
  return (
    <button
      type="button"
      title={label}
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

/** 抖音AI工坊 圆形点阵 logo（取自品牌字标里的图形部分）。 */
function BrandMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.64629 7.23566C4.64629 8.51889 3.6058 9.55933 2.32369 9.55933C1.04046 9.55933 0 8.51889 0 7.23566C0 5.95243 1.04046 4.91309 2.32369 4.91309C3.6058 4.91309 4.64629 5.95243 4.64629 7.23566Z" fill="currentColor"/>
      <path d="M4.64629 11.8569C4.64629 13.1401 3.6058 14.1795 2.32369 14.1795C1.04046 14.1795 0 13.1401 0 11.8569C0 10.5737 1.04046 9.5332 2.32369 9.5332C3.6058 9.5332 4.64629 10.5737 4.64629 11.8569Z" fill="currentColor"/>
      <path d="M6.52691 4.9923C5.61958 5.89963 4.21325 5.96452 3.38648 5.13775C2.55859 4.30986 2.62348 2.90355 3.5308 1.99623C4.43813 1.0889 5.84446 1.02401 6.67123 1.8519C7.49912 2.67867 7.43423 4.08498 6.52691 4.9923Z" fill="currentColor"/>
      <path d="M6.52691 17.0939C5.61958 18.0012 4.21325 18.0661 3.38648 17.2382C2.55859 16.4114 2.62348 15.0051 3.5308 14.0978C4.43813 13.1905 5.84446 13.1256 6.67123 13.9535C7.49912 14.7802 7.43423 16.1865 6.52691 17.0939Z" fill="currentColor"/>
      <path d="M16.2489 6.88788C17.1562 5.98055 18.0344 5.38761 18.2112 5.56438C18.388 5.74114 17.795 6.61938 16.8877 7.52671C15.9804 8.43403 15.1021 9.02586 14.9253 8.85021C14.7497 8.67344 15.3415 7.7952 16.2489 6.88788Z" fill="currentColor"/>
      <path d="M16.3845 11.6724C17.2918 10.7651 18.1096 10.1118 18.2114 10.2136C18.3132 10.3165 17.661 11.1343 16.7536 12.0416C15.8463 12.949 15.0285 13.6012 14.9256 13.4994C14.8238 13.3976 15.4771 12.5798 16.3845 11.6724Z" fill="currentColor"/>
      <path d="M13.0553 2.66021C13.9626 1.75288 15.0602 1.3792 15.5065 1.82447C15.9518 2.27086 15.5782 3.36838 14.6709 4.27571C13.7635 5.18303 12.6671 5.55671 12.2207 5.11032C11.7743 4.66393 12.148 3.56753 13.0553 2.66021Z" fill="currentColor"/>
      <path d="M13.1782 14.8979C14.0855 13.9906 15.1271 13.5621 15.5064 13.9402C15.8845 14.3184 15.456 15.3611 14.5487 16.2684C13.6414 17.1757 12.5987 17.6042 12.2205 17.2261C11.8424 16.8468 12.2709 15.8052 13.1782 14.8979Z" fill="currentColor"/>
      <path d="M8.33898 15.9313C9.2463 15.0239 10.4714 14.7789 11.0755 15.3831C11.6807 15.9872 11.4358 17.2134 10.5285 18.1207C9.62113 19.028 8.39493 19.273 7.79079 18.6689C7.18554 18.0636 7.43166 16.8386 8.33898 15.9313Z" fill="currentColor"/>
      <path d="M8.25097 0.831134C9.15829 -0.0761893 10.4348 -0.270856 11.1027 0.39705C11.7707 1.06496 11.576 2.34147 10.6687 3.2488C9.76135 4.15612 8.48481 4.34967 7.8169 3.68288C7.14899 3.01498 7.34365 1.73846 8.25097 0.831134Z" fill="currentColor"/>
    </svg>
  )
}
