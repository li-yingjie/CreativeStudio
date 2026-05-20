import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  GitBranch,
  Sparkles,
  Wrench,
} from '@/shared/icons'
import type { LucideIcon } from '@/shared/icons'
import type { Capability, CapabilityType, Resource } from './ResourceLibraryData'
import { CAPABILITY_LABEL, projectsUsingPlatform } from './ResourceLibraryData'

interface ResourceDetailViewProps {
  resource: Resource
  onBack: () => void
  onUseInChat: (resource: Resource) => void
  onOpenProject: (projectName: string) => void
}

const CAPABILITY_ICON: Record<CapabilityType, LucideIcon> = {
  skill: Sparkles,
  tool: Wrench,
  knowledge: BookOpen,
}

export default function ResourceDetailView({
  resource,
  onBack,
  onUseInChat,
  onOpenProject,
}: ResourceDetailViewProps) {
  const groups = (['skill', 'tool', 'knowledge'] as const)
    .map((type) => ({
      type,
      items: resource.capabilities.filter((c) => c.type === type),
    }))
    .filter((g) => g.items.length > 0)

  const usingProjects = projectsUsingPlatform(resource.id)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <div className="thin-scroll flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          {/* Top bar — back + CTA */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[13px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <ArrowLeft size={13} strokeWidth={1.8} />
              资源库
            </button>
            <button
              type="button"
              onClick={() => onUseInChat(resource)}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-surface-0)] transition-opacity hover:opacity-90"
            >
              <Sparkles size={13} strokeWidth={1.8} />
              在 VibeCoding 中使用
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink)]/55">
              <span>{resource.primaryCategory}</span>
              <span>›</span>
              <span>{resource.secondaryCategory}</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-semibold text-[var(--color-ink)]">
                {resource.name}
              </h2>
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                >
                  <ExternalLink size={12} strokeWidth={1.8} />
                  访问平台
                </a>
              )}
            </div>
          </div>

          {/* 平台介绍 */}
          <Section title="平台介绍" icon={BookOpen}>
            <p className="text-[13px] leading-[1.6] text-[var(--color-ink)]/85">
              {resource.description}
            </p>
          </Section>

          {/* 提供的能力 */}
          <Section title="提供的能力" icon={Sparkles}>
            <div className="flex flex-col gap-3">
              {groups.map((g) => (
                <CapabilityGroup key={g.type} type={g.type} items={g.items} />
              ))}
            </div>
          </Section>

          {/* 项目血缘 */}
          <Section
            title={`项目血缘 · ${usingProjects.length} 个项目使用`}
            icon={GitBranch}
          >
            {usingProjects.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {usingProjects.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onOpenProject(p)}
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--color-surface-2)] px-2 py-1 text-[12.5px] text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
                  >
                    {p}
                    <ArrowUpRight
                      size={11}
                      strokeWidth={1.8}
                      className="text-[var(--color-ink)]/45"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--color-ink)]/55">
                暂无已知项目使用该平台。
              </p>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}

function CapabilityGroup({
  type,
  items,
}: {
  type: CapabilityType
  items: Capability[]
}) {
  const Icon = CAPABILITY_ICON[type]
  // Group by sub-category (preserve insertion order). Items without a
  // category fall under a synthetic '__default__' bucket and render flat.
  const buckets = new Map<string, Capability[]>()
  for (const cap of items) {
    const key = cap.category ?? '__default__'
    const list = buckets.get(key)
    if (list) list.push(cap)
    else buckets.set(key, [cap])
  }
  const hasCategories = items.some((c) => c.category)
  return (
    <div className="flex items-start gap-3">
      <div className="flex w-[72px] shrink-0 items-center gap-1.5 pt-1 text-[13px] text-[var(--color-ink)]/45">
        <Icon size={12} strokeWidth={1.8} />
        {CAPABILITY_LABEL[type]}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {hasCategories ? (
          Array.from(buckets.entries()).map(([category, list]) => (
            <div key={category} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink)]/55">
                <span>{category === '__default__' ? '其他' : category}</span>
                <span className="text-[var(--color-ink)]/30">
                  {list.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {list.map((cap, idx) => (
                  <span
                    key={`${cap.name}-${idx}`}
                    title={cap.description}
                    className="inline-flex items-center rounded-md bg-[var(--chat-form-option-bg)] px-2 py-0.5 text-[13px] text-[var(--color-ink)]"
                  >
                    {cap.name}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {items.map((cap, idx) => (
              <span
                key={`${cap.name}-${idx}`}
                title={cap.description}
                className="inline-flex items-center rounded-md bg-[var(--chat-form-option-bg)] px-2 py-0.5 text-[13px] text-[var(--color-ink)]"
              >
                {cap.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--fill-subtle)] text-[var(--color-ink)]/55">
          <Icon size={11} strokeWidth={2} />
        </span>
        <h3 className="text-[13px] font-semibold text-[var(--color-ink)]/85">
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-2.5 rounded-xl bg-[var(--fill-subtle)] px-5 py-4">
        {children}
      </div>
    </div>
  )
}
