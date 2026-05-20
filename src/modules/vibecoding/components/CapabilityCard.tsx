import { Clock, TrendingUp } from '@/shared/icons'
import type { Capability, CapabilityType, Resource } from './ResourceLibraryData'
import { CAPABILITY_LABEL, inferCapabilityTag } from './ResourceLibraryData'
import { CAPABILITY_TYPE_TONE } from './ResourceIconMap'
import {
  formatCallCount,
  formatRelativeDays,
  mockCallCount,
  mockHealthStatus,
  mockOwner,
  mockUpdatedDays,
  ownerAvatarTone,
  type HealthStatus,
} from './ResourceMockMetrics'

const HEALTH_VISUAL: Record<HealthStatus, { label: string; dot: string; text: string }> = {
  healthy: {
    label: '健康',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    label: '需关注',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
  unhealthy: {
    label: '异常',
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
  },
}

interface CapabilityCardProps {
  capability: Capability
  platform: Resource
  onClick: () => void
}

export default function CapabilityCard({
  capability,
  platform,
  onClick,
}: CapabilityCardProps) {
  const seed = `${platform.id}::${capability.name}::${capability.category ?? ''}`
  const owner = mockOwner(seed)
  const ownerInitial = ownerInitialChar(owner)
  const ownerTone = ownerAvatarTone(owner)
  const updatedDays = mockUpdatedDays(seed)
  const callCount = mockCallCount(seed)
  const healthVisual =
    capability.type === 'skill'
      ? HEALTH_VISUAL[mockHealthStatus(seed)]
      : null

  return (
    <button
      type="button"
      onClick={onClick}
      title={capability.name}
      className="group flex flex-col gap-1.5 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-3.5 text-left transition-colors hover:border-[var(--divider)] hover:bg-[var(--fill-subtle)]"
    >
      <div className="flex items-center gap-2">
        <h4 className="line-clamp-1 min-w-0 flex-1 text-[13.5px] font-medium leading-[1.35] text-[var(--color-ink)]">
          {capability.name}
        </h4>
        {healthVisual && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 text-[11px] ${healthVisual.text}`}
          >
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${healthVisual.dot}`} />
            {healthVisual.label}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span
          className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${CAPABILITY_TYPE_TONE[capability.type as CapabilityType]}`}
        >
          {CAPABILITY_LABEL[capability.type]}
        </span>
        <span className="rounded-md bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[11px] text-[var(--color-ink)]/70">
          {inferCapabilityTag(capability.name)}
        </span>
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-[1.5] text-[var(--color-ink)]/60">
        {capabilityDescription(capability, platform)}
      </p>
      <div className="flex items-center gap-2 text-[11px] text-[var(--color-ink)]/55">
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-medium ${ownerTone}`}
        >
          {ownerInitial}
        </span>
        <span className="min-w-0 truncate text-[var(--color-ink)]/75">
          {owner}
        </span>
        <span className="text-[var(--color-ink)]/25">·</span>
        <span className="inline-flex shrink-0 items-center gap-0.5">
          <Clock size={10.5} strokeWidth={1.6} />
          {formatRelativeDays(updatedDays)}
        </span>
        <span className="text-[var(--color-ink)]/25">·</span>
        <span className="inline-flex shrink-0 items-center gap-0.5">
          <TrendingUp size={10.5} strokeWidth={1.6} />
          {formatCallCount(callCount)}
        </span>
      </div>
    </button>
  )
}

/** First non-whitespace character of the owner name, defensive for both
 *  CJK characters and ASCII handles. Falls back to '?' for empty input. */
function ownerInitialChar(name: string): string {
  for (const ch of name) {
    if (ch.trim()) return ch.toUpperCase()
  }
  return '?'
}

function capabilityDescription(cap: Capability, platform: Resource): string {
  if (cap.description) return cap.description
  const typeDesc: Record<CapabilityType, string> = {
    skill: '可调用的智能技能',
    tool: '可触发的功能工具',
    knowledge: '可检索的知识库',
  }
  return `${platform.name} 提供的${typeDesc[cap.type]}${
    cap.category ? `，归属于「${cap.category}」类目` : ''
  }，可在 VibeCoding 对话中以自然语言调用。`
}
