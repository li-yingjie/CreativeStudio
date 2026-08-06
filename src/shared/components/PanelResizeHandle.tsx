import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

const KEYBOARD_STEP = 8

export default function PanelResizeHandle({
  value,
  onChange,
  edge,
  ariaLabel,
  min = 320,
  max = 680,
}: {
  value: number
  onChange: (width: number) => void
  edge: 'left' | 'right'
  ariaLabel: string
  min?: number
  max?: number
}) {
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startWidth: number
  } | null>(null)
  const direction = edge === 'right' ? 1 : -1
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
      style={edge === 'left' ? { left: 0 } : { right: 0 }}
      onKeyDown={(event) => {
        let nextWidth: number | null = null
        if (event.key === 'ArrowLeft') {
          nextWidth = value - KEYBOARD_STEP * direction
        }
        if (event.key === 'ArrowRight') {
          nextWidth = value + KEYBOARD_STEP * direction
        }
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
        onChange(
          clamp(drag.startWidth + (event.clientX - drag.startX) * direction),
        )
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={() => {
        dragRef.current = null
      }}
      className="group absolute inset-y-0 z-10 w-2 cursor-col-resize touch-none select-none focus-visible:outline-none"
    >
      <span
        aria-hidden
        style={edge === 'left' ? { left: 0 } : { right: 0 }}
        className="pointer-events-none absolute inset-y-0 w-px bg-transparent group-focus-visible:w-0.5 group-focus-visible:bg-[var(--color-brand-400)]"
      />
    </div>
  )
}
