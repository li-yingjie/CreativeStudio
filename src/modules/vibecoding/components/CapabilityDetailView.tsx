import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BookText,
  CheckCircle2,
  GitBranch,
  Info,
  Play,
  ShieldAlert,
  Sparkles,
} from '@/shared/icons'
import type { LucideIcon } from '@/shared/icons'
import MarkdownView from './MarkdownView'
import CapabilityPreviewCanvas, {
  hasCapabilityPreview,
} from './CapabilityPreviewCanvas'
import {
  CAPABILITY_LABEL,
  projectsUsingCapability,
  type Capability,
  type Resource,
} from './ResourceLibraryData'
import { CAPABILITY_TYPE_TONE, capabilityVisual } from './ResourceIconMap'
import {
  formatCallCount,
  formatDate,
  formatRelativeDays,
  mockCallCount,
  mockCreatedAt,
  mockHealthStatus,
  mockOwner,
  mockSuccessRate,
  mockUpdatedDays,
  mockUsageCount,
  ownerAvatarTone,
  type HealthStatus,
} from './ResourceMockMetrics'

const HEALTH_VISUAL: Record<
  HealthStatus,
  { label: string; icon: LucideIcon; tone: string }
> = {
  healthy: {
    label: '健康',
    icon: CheckCircle2,
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    label: '需关注',
    icon: AlertTriangle,
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  unhealthy: {
    label: '异常',
    icon: ShieldAlert,
    tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  },
}

/** Subtle ambient glow colour per capability type — used as the hero
 *  backdrop so the detail page picks up the same accent identity. */
const TYPE_AMBIENT: Record<Capability['type'], string> = {
  skill: 'rgb(99 102 241 / 0.10)', // indigo
  tool: 'rgb(16 185 129 / 0.10)', // emerald
  knowledge: 'rgb(245 158 11 / 0.10)', // amber
}

interface CapabilityDetailViewProps {
  capability: Capability
  platform: Resource
  onBack?: () => void
  onUseInChat?: () => void
  onOpenProject?: (projectName: string) => void
  /** Embedded mode (e.g. inside an AI 分身 tab) — drops the top bar
   *  (返回 / 去使用) and the right sidebar (基础信息 / 血缘 / 相关能力),
   *  leaving just the hero + documentation in a single column. */
  embedded?: boolean
}

export default function CapabilityDetailView({
  capability,
  platform,
  onBack,
  onUseInChat,
  onOpenProject,
  embedded = false,
}: CapabilityDetailViewProps) {
  const { icon: Icon, tone: capTone } = capabilityVisual(capability)

  const seed = `${platform.id}::${capability.name}::${capability.category ?? ''}`
  const owner = mockOwner(seed)
  const stats = {
    usage: mockUsageCount(seed),
    calls: mockCallCount(seed),
    successRate: mockSuccessRate(seed),
    updatedDays: mockUpdatedDays(seed),
    createdAt: mockCreatedAt(seed),
  }
  const ownerInitial = ownerInitialChar(owner)
  const ownerTone = ownerAvatarTone(owner)
  const healthVisual =
    capability.type === 'skill'
      ? HEALTH_VISUAL[mockHealthStatus(seed)]
      : null

  const siblings = platform.capabilities.filter(
    (c) =>
      (c.category ?? null) === (capability.category ?? null) &&
      c.name !== capability.name,
  )
  const usingProjects = projectsUsingCapability(
    platform.id,
    capability.name,
    capability.category ?? null,
  )

  const description = capabilityDescription(capability, platform)
  const markdown = mockCapabilityMarkdown(capability, platform)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Top bar — hidden in embedded mode */}
      {!embedded && (
        <div className="flex shrink-0 items-center justify-between gap-3 px-8 py-3">
          <button
            type="button"
            onClick={onBack}
            className="-ml-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[13px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft size={13} strokeWidth={1.8} />
            资源库
          </button>
          <button
            type="button"
            onClick={onUseInChat}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-4 py-1.5 text-[13px] font-medium text-[var(--color-surface-0)] transition-opacity hover:opacity-90"
          >
            <Sparkles size={13} strokeWidth={1.8} />
            去使用
          </button>
        </div>
      )}

      {/* Body — 7 / 3 grid (single column in embedded mode); right column
           sticky on scroll */}
      <div className="thin-scroll flex-1 overflow-y-auto px-8 py-6">
        <div
          className={
            embedded
              ? 'mx-auto max-w-[860px]'
              : 'mx-auto grid max-w-[1280px] grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-start gap-10'
          }
        >
          {/* ── Left column (~70%) ── */}
          <div className="flex min-w-0 flex-col">
            {/* Hero — designed header with ambient glow, large title +
                 icon, refined meta line, and a polished stats strip. */}
            <section className="relative flex flex-col gap-6 pt-2 pb-8">
              {/* Ambient gradient — picks up the type's accent colour and
                   fades to transparent so it reads as a hint rather than a
                   coloured panel. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-6 -top-6 -z-10 h-[260px]"
                style={{
                  background: `radial-gradient(70% 100% at 0% 0%, ${TYPE_AMBIENT[capability.type]}, transparent 72%)`,
                }}
              />

              <div className="flex items-start gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${capTone}`}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <div className="flex h-11 min-w-0 flex-1 flex-col justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="min-w-0 text-[18px] font-semibold leading-[1.2] tracking-[-0.005em] text-[var(--color-ink)]">
                      {capability.name}
                    </h2>
                    {healthVisual && (
                      <span
                        title={`健康度: ${healthVisual.label}`}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${healthVisual.tone}`}
                      >
                        <healthVisual.icon size={11} strokeWidth={2} />
                      </span>
                    )}
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${CAPABILITY_TYPE_TONE[capability.type]}`}
                    >
                      {CAPABILITY_LABEL[capability.type]}
                    </span>
                  </div>
                  <p className="max-w-[640px] truncate text-[13px] leading-[1.4] text-[var(--color-ink)]/65">
                    {description}
                  </p>
                </div>
              </div>

              {/* Stats — strip below the title with hairline dividers */}
              <div className="flex w-fit items-stretch divide-x divide-[var(--divider-soft)]">
                <Stat label="使用数" value={formatCallCount(stats.usage)} />
                <Stat label="调用数" value={formatCallCount(stats.calls)} />
                <Stat
                  label="成功率"
                  value={`${stats.successRate.toFixed(2)}%`}
                />
              </div>
            </section>

            {/* Live preview canvas — only shown for capabilities whose
                output is visualisable (table / chart / dashboard / doc /
                image / video / search / message / code / agent). For
                governance / metadata-only capabilities this returns null
                and we fall through directly to 详细说明. */}
            {hasCapabilityPreview(capability) && (
              <Section title="效果预览" icon={Play} pad="pt-3 pb-2" gap="gap-2">
                <CapabilityPreviewCanvas capability={capability} />
              </Section>
            )}

            {/* Markdown documentation */}
            <Section title="详细说明" icon={BookText} pad="pt-3 pb-6" gap="gap-1.5">
              <MarkdownView source={markdown} />
            </Section>
          </div>

          {/* ── Right column (~30%) — sticky; hidden in embedded mode ── */}
          {!embedded && (
          <div className="thin-scroll sticky top-0 flex max-h-[calc(100vh-120px)] min-w-0 flex-col divide-y divide-[var(--divider-soft)] self-start overflow-y-auto">
            <Section title="基础信息" icon={Info} pad="pb-5">
              <div className="flex flex-col gap-2">
                <Field label="创建人">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink)]/85">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-medium ${ownerTone}`}
                    >
                      {ownerInitial}
                    </span>
                    {owner}
                  </span>
                </Field>
                <Field label="创建时间">
                  <span className="text-[12.5px] text-[var(--color-ink)]/85">
                    {formatDate(stats.createdAt)}
                  </span>
                </Field>
                {capability.category && (
                  <Field label="所属类目">
                    <span className="text-[12.5px] text-[var(--color-ink)]/85">
                      {capability.category}
                    </span>
                  </Field>
                )}
                <Field label="所属平台">
                  <span className="text-[12.5px] text-[var(--color-ink)]/85">
                    {platform.name}
                  </span>
                </Field>
                <Field label="状态">
                  <span className="inline-flex items-center gap-1 text-[12.5px] text-[var(--color-ink)]/85">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    已发布
                  </span>
                </Field>
                <Field label="更新时间">
                  <span className="text-[12.5px] text-[var(--color-ink)]/85">
                    {formatRelativeDays(stats.updatedDays)}前
                  </span>
                </Field>
              </div>
            </Section>

            <Section
              title={`项目血缘 · ${usingProjects.length}`}
              icon={GitBranch}
              pad="py-5"
            >
              {usingProjects.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {usingProjects.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onOpenProject?.(p)}
                      className="inline-flex items-center gap-1 rounded-md bg-[var(--fill-subtle)] px-2 py-1 text-[12.5px] text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
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
                <p className="text-[12.5px] text-[var(--color-ink)]/55">
                  暂无已知项目使用该能力。
                </p>
              )}
            </Section>

            {siblings.length > 0 && (
              <Section title="相关能力" icon={Sparkles} pad="pt-5 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {siblings.slice(0, 18).map((s, idx) => (
                    <span
                      key={`${s.name}-${idx}`}
                      className="inline-flex items-center rounded-md bg-[var(--fill-subtle)] px-2 py-0.5 text-[12px] text-[var(--color-ink)]/85"
                    >
                      {s.name}
                    </span>
                  ))}
                  {siblings.length > 18 && (
                    <span className="inline-flex items-center rounded-md border border-dashed border-[var(--divider)] px-2 py-0.5 text-[12px] text-[var(--color-ink)]/55">
                      + {siblings.length - 18}
                    </span>
                  )}
                </div>
              </Section>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  pad = 'py-5',
  gap = 'gap-3',
}: {
  title: string
  icon?: LucideIcon
  children: React.ReactNode
  pad?: string
  gap?: string
}) {
  return (
    <section className={`flex flex-col ${gap} ${pad}`}>
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon
            size={13}
            strokeWidth={1.8}
            className="text-[var(--color-ink)]/55"
          />
        )}
        <h3 className="text-[13px] font-semibold text-[var(--color-ink)]/85">
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[80px] flex-col gap-1 px-4 first:pl-0 last:pr-0">
      <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink)]/45">
        {label}
      </span>
      <span className="text-[18px] font-semibold leading-none tabular-nums tracking-[-0.01em] text-[var(--color-ink)]">
        {value}
      </span>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-[12.5px]">
      <span className="w-[68px] shrink-0 text-[var(--color-ink)]/45">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

/** First non-whitespace character of the owner name. */
function ownerInitialChar(name: string): string {
  for (const ch of name) {
    if (ch.trim()) return ch.toUpperCase()
  }
  return '?'
}

function capabilityDescription(cap: Capability, platform: Resource): string {
  if (cap.description) return cap.description
  const typeDesc = {
    skill: '可调用的智能技能',
    tool: '可触发的功能工具',
    knowledge: '可检索的知识库',
  }[cap.type]
  return `${platform.name} 提供的${typeDesc}${
    cap.category ? `,归属于「${cap.category}」类目` : ''
  },可在 VibeCoding 对话中以自然语言调用。`
}

/** Mock long-form documentation. */
function mockCapabilityMarkdown(cap: Capability, platform: Resource): string {
  const typeLabel = {
    skill: '智能技能',
    tool: '功能工具',
    knowledge: '知识库',
  }[cap.type]
  const categoryLine = cap.category ? `，归属于「${cap.category}」类目` : ''
  return `## 功能介绍

${cap.name} 是 ${platform.name} 平台对外暴露的${typeLabel}${categoryLine}。该资源已与 VibeCoding 对话工作流深度集成，业务方无需自行接入鉴权 / API，即可通过自然语言驱动完成原本依赖 ${platform.name} 后台操作的工作。

## 使用场景

- **业务数据洞察** —— 业务方在对话中直接发问，由 ${cap.name} 自动接管查询与归因
- **流程自动化** —— 与其他 ${platform.primaryCategory} 能力组合，形成端到端的自动化链路
- **临时探索分析** —— 不想为一次性需求开发专项报表，直接在 chat 中拉数即可

## 调用方式

在 VibeCoding 对话面板中输入 \`@${cap.name}\`，附带本次需求描述：

\`\`\`text
@${cap.name} 帮我查询近 7 天核心指标的趋势，并按业务线拆分
\`\`\`

执行后将返回结构化结果，可直接在对话中追问、二次加工，或写回上层报告。

## 输入参数

- \`query\` *（必填）* —— 自然语言的需求描述
- \`time_range\` —— 时间范围，缺省为最近 7 天
- \`dimensions\` —— 业务维度数组，可选
- \`top_n\` —— 返回条数上限，默认 10

## 输出结构

返回结构化 JSON 对象，关键字段：

- \`summary\` —— 一段话概述本次结果
- \`data\` —— 主体数据数组
- \`insights\` —— AI 自动归因与异动解读
- \`trace_id\` —— 调用链追踪 ID，用于排查问题

## 注意事项

> 调用本资源依赖 ${platform.name} 平台权限。首次调用会触发权限校验流程，确保账号已被加入对应业务方的白名单。

## 更新历史

- 2025-04-12 优化响应延迟，p99 耗时降至 1.2s
- 2024-11-01 增加自然语言归因能力
- 2024-06-15 首次发布`
}
