import { useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { ArrowLeft, Trash2, LayoutGrid, Maximize2 } from '@/shared/icons'
import type { AssetItem } from './GarudaAssetsView'

/**
 * 画布式素材编辑器 — 从游戏「素材 · 图片」工具栏点「画布编辑」进入。把所有
 * 图片素材平铺到一块画板上，用户可以拖拽移动、拖右下角缩放、点击置顶、删除。
 * 纯前端演示版本，布局只存在内存里。
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

const CELL = 96
const GAP = 20
const PAD = 24
const COLS = 6

function gridLayout(images: AssetItem[]): CanvasItem[] {
  return images.map((img, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    return {
      id: nanoid(6),
      src: img.src,
      label: img.label,
      x: PAD + col * (CELL + GAP),
      y: PAD + row * (CELL + GAP),
      w: CELL,
      h: CELL,
      z: i + 1,
    }
  })
}

export default function ImageCanvasEditor({
  images,
  onClose,
}: {
  images: AssetItem[]
  onClose: () => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<CanvasItem[]>(() => gridLayout(images))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const zRef = useRef(images.length)

  const gestureRef = useRef<
    | {
        type: 'move' | 'resize'
        id: string
        dx: number
        dy: number
        startW: number
        startH: number
        startX: number
        startY: number
      }
    | null
  >(null)

  const ptToContent = (clientX: number, clientY: number) => {
    const el = wrapRef.current
    if (!el) return { x: clientX, y: clientY }
    const r = el.getBoundingClientRect()
    return { x: clientX - r.left + el.scrollLeft, y: clientY - r.top + el.scrollTop }
  }

  const bringFront = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, z: ++zRef.current } : it)))

  const onItemDown = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation()
    setSelectedId(id)
    bringFront(id)
    const it = items.find((x) => x.id === id)
    if (!it) return
    const p = ptToContent(e.clientX, e.clientY)
    gestureRef.current = {
      type: 'move',
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
      /* setPointerCapture can throw for stale pointer ids — drag still works
         via the wrap-level move/up handlers. */
    }
  }

  const onResizeDown = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation()
    setSelectedId(id)
    bringFront(id)
    const it = items.find((x) => x.id === id)
    if (!it) return
    const p = ptToContent(e.clientX, e.clientY)
    gestureRef.current = {
      type: 'resize',
      id,
      dx: 0,
      dy: 0,
      startW: it.w,
      startH: it.h,
      startX: p.x,
      startY: p.y,
    }
    try {
      wrapRef.current?.setPointerCapture(e.pointerId)
    } catch {
      /* setPointerCapture can throw for stale pointer ids — drag still works
         via the wrap-level move/up handlers. */
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gestureRef.current
    if (!g) return
    const p = ptToContent(e.clientX, e.clientY)
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== g.id) return it
        if (g.type === 'move') {
          return { ...it, x: Math.max(0, p.x - g.dx), y: Math.max(0, p.y - g.dy) }
        }
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
      wrapRef.current?.releasePointerCapture?.(e.pointerId)
      gestureRef.current = null
    }
  }

  const deleteSelected = () => {
    if (!selectedId) return
    setItems((prev) => prev.filter((it) => it.id !== selectedId))
    setSelectedId(null)
  }

  const resetLayout = () => {
    zRef.current = images.length
    setItems(gridLayout(images))
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

      {/* Canvas */}
      <div
        ref={wrapRef}
        onPointerDown={() => setSelectedId(null)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative min-h-0 flex-1 overflow-auto"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          backgroundImage:
            'radial-gradient(circle, var(--divider-soft) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {items.map((it) => {
          const active = it.id === selectedId
          return (
            <div
              key={it.id}
              onPointerDown={onItemDown(it.id)}
              className={`group absolute touch-none select-none rounded-lg border bg-[var(--color-surface-0)] shadow-sm transition-shadow ${
                active
                  ? 'border-[#3478ff] ring-2 ring-[#3478ff]/30'
                  : 'border-[var(--divider-soft)] hover:shadow-md'
              }`}
              style={{ left: it.x, top: it.y, width: it.w, height: it.h, zIndex: it.z, cursor: 'grab' }}
            >
              <img
                src={it.src}
                alt={it.label}
                draggable={false}
                className="pointer-events-none h-full w-full rounded-lg object-contain p-1"
              />
              {active && (
                <>
                  <span className="pointer-events-none absolute -top-5 left-0 max-w-full truncate rounded bg-[var(--color-ink)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ink-contrast)]">
                    {it.label}
                  </span>
                  <span
                    onPointerDown={onResizeDown(it.id)}
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
  )
}
