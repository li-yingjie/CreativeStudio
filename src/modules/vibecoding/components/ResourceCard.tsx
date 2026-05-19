import { ArrowUpRight } from 'lucide-react'
import type { Resource } from './ResourceLibraryData'
import { CAPABILITY_LABEL } from './ResourceLibraryData'

interface ResourceCardProps {
  resource: Resource
  onClick: () => void
}

export default function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const counts = resource.capabilities.reduce(
    (acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-transparent bg-[var(--color-surface-2)] p-4 text-left transition-colors hover:border-[var(--divider-soft)] hover:bg-[var(--fill-hover)]"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-medium text-[var(--color-ink)]">
            {resource.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--color-ink)]/45">
            {resource.secondaryCategory}
          </p>
        </div>
        <ArrowUpRight
          size={14}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-[var(--color-ink)]/30 transition-colors group-hover:text-[var(--color-ink)]/70"
        />
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-[1.55] text-[var(--color-ink)]/70">
        {resource.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {(['skill', 'tool', 'knowledge'] as const).map((type) =>
          counts[type] ? (
            <span
              key={type}
              className="inline-flex items-center rounded-md bg-[var(--chat-form-option-bg)] px-2 py-0.5 text-[12px] text-[var(--color-ink)]/75"
            >
              {counts[type]} {CAPABILITY_LABEL[type]}
            </span>
          ) : null,
        )}
      </div>
    </button>
  )
}
