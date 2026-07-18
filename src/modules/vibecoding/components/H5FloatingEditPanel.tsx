import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import H5LayerEditPanel, { type H5Selection } from './H5LayerEditPanel'

/**
 * H5 编辑浮层 — 把 H5LayerEditPanel 装进一个可拖动的浮动卡片里。默认悬浮在
 * 画布右侧内缩位置；每次选择变化时，跟随被选中的对象（预览里标了
 * data-h5-active 的节点）就近定位；用户拖动 header 可手动摆放，直到下次
 * 选择变化再重新跟随。
 * 仅用于 marketing-h5；其余产物仍用右侧停靠的编辑面板。
 */

const PANEL_W = 300
const GAP = 16
const MARGIN = 8
const CANVAS_INSET = 24

export default function H5FloatingEditPanel({
  selection,
  onClose,
}: {
  selection: H5Selection | null
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const clamp = useCallback((x: number, y: number) => {
    const h = cardRef.current?.offsetHeight ?? 480
    const vw = window.innerWidth
    const vh = window.innerHeight
    return {
      x: Math.max(MARGIN, Math.min(x, vw - PANEL_W - MARGIN)),
      y: Math.max(MARGIN, Math.min(y, vh - h - MARGIN)),
    }
  }, [])

  const getCanvasRect = useCallback(() => {
    return (
      document
        .querySelector('[data-h5-edit-canvas]')
        ?.getBoundingClientRect() ?? null
    )
  }, [])

  // Reposition whenever the selection changes: follow the selected object, or
  // fall back to a canvas-relative default when nothing (整体配置) is selected.
  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const canvasRect = getCanvasRect()
      const minY = canvasRect ? canvasRect.top + CANVAS_INSET : MARGIN
      const active = document.querySelector('[data-h5-active]') as HTMLElement | null
      if (active) {
        const r = active.getBoundingClientRect()
        // Prefer to the right of the object; flip left if it would overflow.
        let x = r.right + GAP
        if (x + PANEL_W > window.innerWidth - MARGIN) x = r.left - GAP - PANEL_W
        setPos(clamp(x, Math.max(r.top, minY)))
      } else {
        setPos(
          canvasRect
            ? clamp(canvasRect.right - PANEL_W - CANVAS_INSET, canvasRect.top + CANVAS_INSET)
            : clamp(window.innerWidth - PANEL_W - 24, 88),
        )
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selection, clamp, getCanvasRect])

  // Keep it on-screen if the window resizes.
  useLayoutEffect(() => {
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp])

  // Drag via the header. Window listeners so the drag survives fast pointer
  // moves that outrun the handle element.
  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!pos) return
      const start = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }
      const move = (ev: PointerEvent) =>
        setPos(clamp(start.x + (ev.clientX - start.px), start.y + (ev.clientY - start.py)))
      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [pos, clamp],
  )

  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: pos?.x ?? -9999,
        top: pos?.y ?? -9999,
        width: PANEL_W,
        height: 'min(72vh, 540px)',
        zIndex: 50,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className="overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--color-surface-0)] shadow-[0_12px_40px_rgba(16,18,24,0.18)]"
    >
      <H5LayerEditPanel
        floating
        onHeaderPointerDown={onHeaderPointerDown}
        selection={selection}
        onClose={onClose}
      />
    </div>
  )
}
