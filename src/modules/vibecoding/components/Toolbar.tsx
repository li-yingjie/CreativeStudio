import type { ReactNode } from 'react'
import type { LucideIcon } from '@/shared/icons'

export function FlexAlignGlyph({
  side,
  size = 13,
}: {
  side: 'left' | 'right'
  size?: number
}) {
  const mask = `url(/icons/flex-align-${side}.svg) center / contain no-repeat`
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
        WebkitMask: mask,
        mask,
      }}
    />
  )
}

/** Second-layer product toolbar — a consistent row with the multi-object
 *  tabs on the left and contextual actions on the right. Every preview
 *  surface (phone / 界面 / 素材 / 代码 / 知识库 …) renders through this so the
 *  spacing, divider and alignment stay identical. */
export function ProductToolbar({
  leading,
  tabs,
  actions,
}: {
  /** Far-left actions, pinned before the tab row (e.g. 编辑). */
  leading?: ReactNode
  tabs: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="@container flex min-h-[44px] shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--divider-soft)] px-4 py-2">
      <div className="flex min-w-0 items-center gap-3">
        {leading ? <div className="flex shrink-0 items-center gap-2">{leading}</div> : null}
        <div className="tab-scroll flex min-w-0 items-center gap-3 overflow-x-auto">{tabs}</div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** A single right-side toolbar action (icon + label, collapses to icon-only
 *  on narrow toolbars). Shared by every product toolbar so the buttons read
 *  the same everywhere. */
export function ToolbarAction({
  icon: Icon,
  label,
  onClick,
  active = false,
  iconOnly = false,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
  active?: boolean
  /** Render as a square icon-only button (label kept as the tooltip). */
  iconOnly?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex items-center rounded-lg border text-[12px] transition-colors ${
        iconOnly ? 'gap-0 px-2 py-1.5' : 'gap-0 px-2 py-1.5 @[520px]:gap-1.5 @[520px]:px-3'
      } ${
        active
          ? 'border-[var(--color-ink)]/25 bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]'
          : 'border-[var(--color-ink)]/8 text-[var(--color-ink)]/60 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
      }`}
    >
      <Icon size={13} />
      {!iconOnly && <span className="hidden @[520px]:inline">{label}</span>}
    </button>
  )
}
