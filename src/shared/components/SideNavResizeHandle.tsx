import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { SIDE_NAV_NUMERIC_CONSTRAINTS } from './side-nav-config'

const KEYBOARD_STEP = 8

export default function SideNavResizeHandle({
  value,
  onChange,
  ariaLabel = '调整导航宽度',
}: {
  value: number
  onChange: (width: number) => void
  ariaLabel?: string
}) {
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startWidth: number
  } | null>(null)
  const { min, max } = SIDE_NAV_NUMERIC_CONSTRAINTS.width
  const clamp = (width: number) => Math.min(max, Math.max(min, width))

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={`${Math.round(value)} 像素`}
      tabIndex={0}
      onKeyDown={(event) => {
        let nextWidth: number | null = null
        if (event.key === 'ArrowLeft') nextWidth = value - KEYBOARD_STEP
        if (event.key === 'ArrowRight') nextWidth = value + KEYBOARD_STEP
        if (event.key === 'Home') nextWidth = min
        if (event.key === 'End') nextWidth = max
        if (nextWidth === null) return
        event.preventDefault()
        onChange(clamp(nextWidth))
      }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startWidth: value,
        }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        onChange(clamp(drag.startWidth + event.clientX - drag.startX))
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={() => {
        dragRef.current = null
      }}
      className="side-nav-resize-handle group pointer-events-auto absolute inset-y-0 right-0 z-10 w-2 translate-x-full cursor-col-resize touch-none select-none"
    >
      {/* 平时不可见；仅键盘聚焦时由 index.css 上色 */}
      <div className="side-nav-resize-handle__line absolute inset-y-0 left-0 w-px -translate-x-px bg-transparent" />
    </div>
  )
}
