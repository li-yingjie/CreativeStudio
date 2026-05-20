import type { LucideIcon } from '@/shared/icons'

interface PlatformPlaceholderViewProps {
  icon: LucideIcon
  title: string
  description: string
  /** Optional small badge to hint the page is upcoming. */
  badge?: string
}

/**
 * Generic empty-state hero used by platform-level pages that don't yet
 * have real content (Skills, 创意广场). Mirrors the resource library
 * page's outer chrome (m-3 rounded card) so navigation between top-level
 * platform views feels consistent.
 */
export default function PlatformPlaceholderView({
  icon: Icon,
  title,
  description,
  badge = '敬请期待',
}: PlatformPlaceholderViewProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--color-surface-0)]">
      <div className="flex max-w-[440px] flex-col items-center gap-3 px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fill-subtle)] text-[var(--color-ink)]/55">
          <Icon size={26} strokeWidth={1.5} />
        </span>
        <h2 className="text-[20px] font-semibold text-[var(--color-ink)]">
          {title}
        </h2>
        <p className="text-[13px] leading-[1.65] text-[var(--color-ink)]/60">
          {description}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-1 text-[11.5px] text-[var(--color-ink)]/65">
          {badge}
        </span>
      </div>
    </div>
  )
}
