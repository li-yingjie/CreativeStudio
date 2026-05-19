import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Apple Liquid-Glass style icon button.
 *
 * Layer stack (back → front):
 *   1. backdrop-filter: blur()      — blurs page behind the button
 *   2. FILL_GRADIENT                — inner disc tint (alpha 0 → 0.1 etc.)
 *   3. HIGHLIGHT_GRADIENT + ring mask — border-only gradient highlight
 *   4. children (icon)              — on top
 *   5. DROP_SHADOW                  — outer cast shadow
 *
 * The border gradient is confined to a 1px-wide ring via a radial mask, so
 * it never bleeds into the inner area regardless of how transparent the
 * fill is.
 */

// ── Tunable tokens ───────────────────────────────────────────────────────
const SIZE = 36                              // px, width & height
const BORDER_WIDTH = '1px'                   // ring thickness

// Inner disc gradient
const FILL_ANGLE = '135deg'
const FILL_STOPS = [
  'rgba(255,255,255,0) 0%',                  // alpha 0
  'rgba(255,255,255,0.1) 100%',              // alpha 0.1
]

// Border gradient — confined to the ring, never bleeds inward.
const HIGHLIGHT_ANGLE = '135deg'
const HIGHLIGHT_STOPS = [
  'rgba(255,255,255,0.8) 0%',
  'rgba(255,255,255,0) 37%',
  'rgba(255,255,255,0) 75%',
  'rgba(255,255,255,0.8) 100%',
]

const DROP_SHADOW = '0 8px 22px -6px rgba(0,0,0,0.6)'
const BLUR = 'blur(16px)'
// ─────────────────────────────────────────────────────────────────────────

const FILL_GRADIENT = `linear-gradient(${FILL_ANGLE}, ${FILL_STOPS.join(', ')})`
const HIGHLIGHT_GRADIENT = `linear-gradient(${HIGHLIGHT_ANGLE}, ${HIGHLIGHT_STOPS.join(', ')})`

// Radial mask that keeps only a BORDER_WIDTH-thick ring on the outer edge.
const RING_MASK = `radial-gradient(circle closest-side, transparent calc(100% - ${BORDER_WIDTH}), #000 calc(100% - ${BORDER_WIDTH}))`

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Text opacity tier. Map to one of the pre-declared Tailwind classes
   *  so the JIT picks it up at build time. */
  tone?: 70 | 80
}

const TONE_CLASS: Record<70 | 80, string> = {
  70: 'text-[var(--color-ink)]/70',
  80: 'text-[var(--color-ink)]/80',
}

export default function GlassIconButton({
  children,
  tone = 80,
  className = '',
  style,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        width: SIZE,
        height: SIZE,
        boxShadow: DROP_SHADOW,
        backdropFilter: BLUR,
        WebkitBackdropFilter: BLUR,
        ...style,
      }}
      className={[
        'group/glass relative flex flex-shrink-0 items-center justify-center rounded-full',
        TONE_CLASS[tone],
        'transition-[filter,background-color] duration-200',
        'hover:brightness-110 hover:text-[var(--color-ink)]',
        className,
      ].join(' ')}
    >
      {/* Inner fill — semi-transparent gradient over the backdrop blur */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: FILL_GRADIENT }}
      />
      {/* Hover wash — brighter inner tint that fades in on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[var(--fill-strong)] opacity-0 transition-opacity duration-200 group-hover/glass:opacity-100"
      />
      {/* Border-only gradient — clipped to a ring by radial mask */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: HIGHLIGHT_GRADIENT,
          mask: RING_MASK,
          WebkitMask: RING_MASK,
        }}
      />
      <span className="relative flex items-center justify-center">
        {children}
      </span>
    </button>
  )
}
