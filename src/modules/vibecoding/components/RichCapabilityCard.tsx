import { Bot } from 'lucide-react'
import type { Capability, Resource } from './ResourceLibraryData'
import { inferCapabilityTag } from './ResourceLibraryData'
import {
  formatCallCount,
  formatRelativeDays,
  mockCallCount,
  mockHealthStatus,
  mockUpdatedDays,
  type HealthStatus,
} from './ResourceMockMetrics'
import DouyinMark from './icons/DouyinMark'
import HealthMark from './icons/HealthMark'

/**
 * Rich card layout — banner image up top, padded body with title /
 * type-and-category-and-health tag row / one-line description /
 * official-attribution + updated + invocation count strip. Matches the
 * Figma spec at node 199:19607 of the AI 工坊 file. Selected via the
 * layout toggle in ResourceLibraryView's filter row.
 */

interface RichCapabilityCardProps {
  capability: Capability
  platform: Resource
  onClick: () => void
}

/* Pre-rendered banner backgrounds (png) shipped from /public/bg/cards.
 * 23 illustrated tool covers, hashed by capability seed so each card
 * picks a stable image and the rotation looks varied across a grid. */
const BANNERS: string[] = Array.from(
  { length: 23 },
  (_, i) => `/bg/cards/banner-${i + 1}.png`,
)

function hashIdx(s: string, mod: number): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % mod
}

/* Type-tag palette pulled from Figma — Skill / MCP / knowledge each get
 * their own paired bg + text colour. Pill shape, 12px Semibold. */
const TYPE_TAG: Record<
  Capability['type'],
  { label: string; bg: string; text: string }
> = {
  skill: {
    label: 'Skill',
    bg: 'bg-[#ece9fe] dark:bg-indigo-500/25',
    text: 'text-[#5720b7] dark:text-indigo-200',
  },
  tool: {
    label: 'MCP',
    bg: 'bg-[rgba(60,234,121,0.2)] dark:bg-emerald-500/25',
    text: 'text-[#007d47] dark:text-emerald-200',
  },
  knowledge: {
    label: '知识库',
    bg: 'bg-amber-500/15 dark:bg-amber-500/25',
    text: 'text-amber-700 dark:text-amber-200',
  },
}

/* Health pill — icon-only, color-coded background. The bot icon doubles
 * as the AI-managed signal; severity is conveyed by the bg/text pair.
 * Spec: Figma 321:13706. */
const HEALTH_VISUAL: Record<
  HealthStatus,
  { label: string; bg: string; icon: string }
> = {
  healthy: {
    label: '健康',
    bg: 'bg-[rgba(60,234,121,0.2)] dark:bg-emerald-500/25',
    icon: 'text-[#007d47] dark:text-emerald-200',
  },
  warning: {
    label: '需关注',
    bg: 'bg-[#d5ebff] dark:bg-sky-500/25',
    icon: 'text-[#0d6ad6] dark:text-sky-200',
  },
  unhealthy: {
    label: '异常',
    bg: 'bg-[#fce7f6] dark:bg-pink-500/25',
    icon: 'text-[#c2185b] dark:text-pink-200',
  },
}

export default function RichCapabilityCard({
  capability,
  platform,
  onClick,
}: RichCapabilityCardProps) {
  const seed = `${platform.id}::${capability.name}::${capability.category ?? ''}`
  const banner = BANNERS[hashIdx(seed, BANNERS.length)]
  const description = capabilityDescription(capability, platform)
  const updatedDays = mockUpdatedDays(seed)
  const callCount = mockCallCount(seed)
  const healthStatus =
    capability.type === 'skill' ? mockHealthStatus(seed) : null
  const healthVisual = healthStatus ? HEALTH_VISUAL[healthStatus] : null
  const typeTag = TYPE_TAG[capability.type]
  return (
    <button
      type="button"
      onClick={onClick}
      title={capability.name}
      className="group relative flex flex-col items-stretch overflow-hidden rounded-2xl border border-[var(--divider-soft)] bg-white text-left shadow-none transition-shadow duration-150 hover:shadow-[0_12px_24px_-12px_rgba(16,18,24,0.18)] dark:hover:shadow-[0_12px_24px_-12px_rgba(0,0,0,0.55)]"
    >
      {/* Banner — aspect 632/272 from the Figma. Sits flush with the
          card edges; the outer card's overflow-hidden + 16px radius do
          the rounding. */}
      <div className="relative aspect-[632/272] w-full bg-[var(--fill-subtle)]">
        <img
          src={banner}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Body — gap-2.5 (10px) between rows, px-4 pt-2 pb-4 padding. */}
      <div className="flex flex-col gap-2.5 px-4 pb-4 pt-2">
        <h4 className="line-clamp-1 text-[16px] font-semibold leading-[22px] text-[var(--color-ink)]">
          {capability.name}
        </h4>

        <div className="flex flex-nowrap items-center gap-[5px] overflow-hidden">
          <span
            className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-[12px] font-semibold leading-4 ${typeTag.bg} ${typeTag.text}`}
          >
            {typeTag.label}
          </span>
          <span className="inline-flex min-w-0 shrink items-center justify-center rounded-full bg-[rgba(115,158,202,0.15)] px-1.5 py-0.5 text-[12px] font-semibold leading-4 text-[#373d46] dark:bg-slate-500/20 dark:text-slate-200">
            <span className="min-w-0 truncate whitespace-nowrap">
              {inferCapabilityTag(capability.name)}
            </span>
          </span>
          {healthVisual && healthStatus && (
            <span
              title={healthVisual.label}
              aria-label={healthVisual.label}
              className={`inline-flex h-5 shrink-0 items-center justify-center rounded-full px-1.5 ${healthVisual.bg} ${healthVisual.icon}`}
            >
              <HealthMark status={healthStatus} size={12} />
            </span>
          )}
        </div>

        <p className="line-clamp-1 text-[12px] leading-4 text-[var(--color-ink)]/60">
          {description}
        </p>

        <div className="flex flex-nowrap items-center gap-2 text-[12px] text-[var(--color-ink)]/60">
          <span className="inline-flex min-w-0 items-center gap-1">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#393939]">
              <DouyinMark size={14} />
            </span>
            <span className="min-w-0 truncate leading-[18px]">抖音官方</span>
          </span>
          <MetaDivider />
          <span className="shrink-0 whitespace-nowrap leading-[18px]">
            {formatRelativeDays(updatedDays)}
          </span>
          <MetaDivider />
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
            <Bot size={12} strokeWidth={1.8} className="shrink-0" />
            <span className="leading-4">{formatCallCount(callCount)}</span>
          </span>
        </div>
      </div>
    </button>
  )
}

/** Thin vertical hairline between meta groups (10px tall). */
function MetaDivider() {
  return (
    <span
      aria-hidden
      className="inline-block h-2.5 w-px shrink-0 bg-[var(--color-ink)]/15"
    />
  )
}

/** Keyword-driven description templates — derive a value-oriented line
 *  from the capability's name so the card actually communicates what
 *  this resource can do, instead of repeating the platform name. First
 *  match wins, so the more specific patterns are listed earlier. */
const DESCRIPTION_RULES: { patterns: string[]; render: (name: string) => string }[] = [
  {
    patterns: ['监测', '监控', '异常', '预警', '告警'],
    render: () => '实时盯着关键指标，命中异常自动告警，省去人工巡检。',
  },
  {
    patterns: ['审核', '违规', '风险', '风控', '合规', '安全', '治理'],
    render: () => '自动识别风险点并给出处置建议，可作为人工复核前的兜底。',
  },
  {
    patterns: ['归因', '拆解', '分析', '分布', '画像'],
    render: () => '多维度自动归因，把结果拆成易解读的洞察直接呈现在对话里。',
  },
  {
    patterns: ['查询', '检索', 'sql', '拉取', '榜单实时'],
    render: () => '一句话拉到最新数据，无需登录后台逐项点查。',
  },
  {
    patterns: ['报告', '战报', '摘要', '总结', '周报', '日报', '复盘'],
    render: () => '自动拉数据 + 撰写成文，一次出稿，省去拼接环节。',
  },
  {
    patterns: ['生成', '创作', '撰写', '改写', '润色', '草稿', 'creator', '文案'],
    render: () => '输入关键词或上下文，自动产出多组候选供挑选。',
  },
  {
    patterns: ['配置', '调整', '加热', '加权', '排序权重'],
    render: () => '一句话改参数，AI 帮你下发到平台，无需手动后台点配置。',
  },
  {
    patterns: ['提交', '申请', '审批', '发起'],
    render: () => '表单字段自动预填，复核一眼后即可一键发起。',
  },
  {
    patterns: ['推送', '通知', '同步', '代发', '群发'],
    render: () => '把结果自动送达指定渠道，无需手动转发或复制粘贴。',
  },
  {
    patterns: ['会议', '日程', '日历', '邀约', '妙记'],
    render: () => '自动排期 / 抓取会议要点，省下排日历和整理纪要的时间。',
  },
  {
    patterns: ['sop', '规范', '指引', '基线', '库', '词表', '字典', '手册', '范式'],
    render: () => '团队共识沉淀，AI 检索时直接引用其中条款作为对话上下文。',
  },
  {
    patterns: ['编排', '搭建', '建立'],
    render: () => '一句话起一份新结构，AI 自动按模板组装好初稿。',
  },
  {
    patterns: ['圈选', '订阅'],
    render: () => '把条件描述清楚，自动圈出符合的对象并持续跟进更新。',
  },
  {
    patterns: ['对比', '比对'],
    render: () => 'AI 自动对齐字段并标出差异，避免逐行人工核对。',
  },
]

function capabilityDescription(cap: Capability, _platform: Resource): string {
  if (cap.description) return cap.description
  const lower = cap.name.toLowerCase()
  for (const rule of DESCRIPTION_RULES) {
    if (rule.patterns.some((p) => lower.includes(p.toLowerCase()))) {
      return rule.render(cap.name)
    }
  }
  // Generic value-prop fallback that still feels capability-specific —
  // surfaces the type semantics without devolving into platform meta.
  switch (cap.type) {
    case 'skill':
      return `以自然语言调用「${cap.name}」，AI 自动给出结果，无需走平台界面。`
    case 'tool':
      return `一句话触发「${cap.name}」，操作结果直接回传到对话里。`
    case 'knowledge':
      return `「${cap.name}」作为对话上下文，AI 引用其中条目时自动标注来源。`
  }
}
