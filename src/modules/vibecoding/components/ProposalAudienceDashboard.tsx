import {
  Activity,
  AlertTriangle,
  Eye,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Step 2 artefact — 人群与流量诊断看板. Renders the same audience /
 * flow analysis as the .md doc, but as a visual BI-style dashboard
 * (KPI strip, risk lane, audience + flow horizontal bars, benchmark
 * matrix). Opened in the right preview when the user clicks on
 * `人群诊断看板` in the artefact list.
 */

interface KpiTile {
  label: string
  value: string
  threshold: string
  delta: string
  status: 'ok' | 'warn' | 'risk'
  icon: LucideIcon
}

const KPIS: KpiTile[] = [
  {
    label: 'A3 种草人群',
    value: '128 万',
    threshold: '阈值 ≥ 120 万',
    delta: '+6.7%',
    status: 'ok',
    icon: Target,
  },
  {
    label: '看后搜规模',
    value: '34 万',
    threshold: '阈值 ≥ 30 万',
    delta: '+13.3%',
    status: 'ok',
    icon: Search,
  },
  {
    label: '内容自然贡献占比',
    value: '38%',
    threshold: '阈值 ≥ 50%',
    delta: '-12pt',
    status: 'risk',
    icon: TrendingUp,
  },
  {
    label: '优质内容率',
    value: '32%',
    threshold: '阈值 ≥ 35%',
    delta: '-3pt',
    status: 'warn',
    icon: Sparkles,
  },
]

interface Risk {
  title: string
  level: '高' | '中' | '低'
  severity: number
  note: string
  source: string
}

const RISKS: Risk[] = [
  {
    title: '潜客覆盖缺口',
    level: '高',
    severity: 0.82,
    note: '近 30 天潜客内容触达低于同类商家均值 23%',
    source: '@风神 同类品牌指标对比',
  },
  {
    title: '看后搜机会',
    level: '高',
    severity: 0.74,
    note: '场景化探店 + 套餐价值内容对看后搜贡献最显著',
    source: '@iDA 同类商家内容标签拆解',
  },
  {
    title: '投广依赖风险',
    level: '中',
    severity: 0.56,
    note: '历史 A3 达成主要靠投广堆出，自然贡献占比仅 38%',
    source: '@iDA 历史营销结构',
  },
]

interface AudienceBucket {
  label: string
  pct: number
  level: '高' | '中' | '中低' | '低'
  tone: 'ok' | 'warn' | 'risk'
}

const AUDIENCE: AudienceBucket[] = [
  { label: '老客覆盖', pct: 0.78, level: '高', tone: 'ok' },
  { label: '新客覆盖', pct: 0.52, level: '中', tone: 'ok' },
  { label: '搜索意向人群', pct: 0.36, level: '中低', tone: 'warn' },
  { label: '潜客覆盖', pct: 0.22, level: '低', tone: 'risk' },
  { label: 'A3 种草人群', pct: 0.18, level: '低', tone: 'risk' },
]

interface FlowSlice {
  label: string
  pct: number
  color: string
}

const FLOW: FlowSlice[] = [
  { label: '商业投广流量', pct: 0.62, color: 'bg-rose-500/70' },
  { label: '达人自然内容', pct: 0.24, color: 'bg-emerald-500/70' },
  { label: '可投广内容', pct: 0.14, color: 'bg-indigo-500/70' },
]

interface BenchmarkRow {
  label: string
  structure: string
  a3: 'high' | 'mid-high' | 'mid' | 'low'
  search: 'high' | 'mid' | 'low'
  natural: 'high' | 'mid' | 'low'
  suggestion: string
  recommended?: boolean
}

const BENCHMARKS: BenchmarkRow[] = [
  {
    label: '高头部品宣型',
    structure: '头部占比高',
    a3: 'high',
    search: 'mid',
    natural: 'low',
    suggestion: '仅保留 1-2 位作为声量锚点',
  },
  {
    label: '本地垂类种草型',
    structure: '本地垂类达人占比高',
    a3: 'mid-high',
    search: 'high',
    natural: 'high',
    suggestion: '推荐主路径',
    recommended: true,
  },
  {
    label: '素人挑战量化型',
    structure: '素人投稿规模化',
    a3: 'mid',
    search: 'mid',
    natural: 'mid',
    suggestion: '作为氛围层补充',
  },
]

const STATUS_TONE: Record<KpiTile['status'], string> = {
  ok: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
  warn: 'text-amber-700 dark:text-amber-300 bg-amber-500/10',
  risk: 'text-rose-600 dark:text-rose-300 bg-rose-500/10',
}

const BAR_TONE: Record<AudienceBucket['tone'], string> = {
  ok: 'bg-emerald-500/70',
  warn: 'bg-amber-500/70',
  risk: 'bg-rose-500/70',
}

const LEVEL_TONE: Record<Risk['level'], string> = {
  高: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
  中: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  低: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
}

const GRADE_LABEL: Record<BenchmarkRow['a3'], string> = {
  high: '高',
  'mid-high': '中高',
  mid: '中',
  low: '低',
}

const GRADE_TONE: Record<BenchmarkRow['a3'], string> = {
  high: 'text-emerald-600 dark:text-emerald-300',
  'mid-high': 'text-emerald-600 dark:text-emerald-300',
  mid: 'text-[var(--color-ink)]/65',
  low: 'text-rose-600 dark:text-rose-300',
}

export default function ProposalAudienceDashboard() {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-8 py-7">
        {/* ── Header ── */}
        <header className="flex flex-col gap-2 border-b border-[var(--divider-soft)] pb-5">
          <div className="flex items-center gap-2 text-[11.5px] uppercase tracking-[0.08em] text-[var(--color-ink)]/45">
            <Activity size={12} strokeWidth={1.8} />
            人群与流量诊断
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--color-ink)]">
            沪上火锅·五一种草 / 数据看板
          </h1>
          <p className="text-[12.5px] leading-[1.7] text-[var(--color-ink)]/55">
            数据来源：@风神 同类火锅品牌过去 30 天指标 + @iDA 商家历史 A3 / 看后搜结构 · 更新于 2 分钟前
          </p>
        </header>

        {/* ── KPI strip ── */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className="flex flex-col gap-2.5 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-4"
            >
              <div className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink)]/55">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md ${STATUS_TONE[k.status]}`}
                >
                  <k.icon size={12} strokeWidth={1.9} />
                </span>
                <span className="truncate">{k.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[22px] font-semibold tabular-nums leading-none text-[var(--color-ink)]">
                  {k.value}
                </span>
                <span
                  className={`text-[11px] font-medium tabular-nums ${
                    k.status === 'ok'
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : k.status === 'warn'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-rose-600 dark:text-rose-300'
                  }`}
                >
                  {k.delta}
                </span>
              </div>
              <div className="text-[11px] text-[var(--color-ink)]/45">
                {k.threshold}
              </div>
            </div>
          ))}
        </section>

        {/* ── Risk lane ── */}
        <section className="flex flex-col gap-3">
          <SectionHeading icon={AlertTriangle} title="风险诊断" />
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
            {RISKS.map((r) => (
              <div
                key={r.title}
                className="flex flex-col gap-3 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[var(--color-ink)]">
                    {r.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${LEVEL_TONE[r.level]}`}
                  >
                    {r.level}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--fill-subtle)]">
                  <div
                    className={`h-full rounded-full ${
                      r.level === '高'
                        ? 'bg-rose-500/70'
                        : r.level === '中'
                          ? 'bg-amber-500/70'
                          : 'bg-emerald-500/70'
                    }`}
                    style={{ width: `${Math.round(r.severity * 100)}%` }}
                  />
                </div>
                <p className="text-[12px] leading-[1.7] text-[var(--color-ink)]/70">
                  {r.note}
                </p>
                <div className="text-[10.5px] text-[var(--color-ink)]/40">
                  {r.source}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Audience + Flow ── */}
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-5">
            <SectionHeading icon={Eye} title="人群覆盖结构" subtle />
            <div className="flex flex-col gap-3">
              {AUDIENCE.map((a) => (
                <div key={a.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--color-ink)]/75">{a.label}</span>
                    <span className="tabular-nums text-[var(--color-ink)]/55">
                      {a.level} · {Math.round(a.pct * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--fill-subtle)]">
                    <div
                      className={`h-full rounded-full ${BAR_TONE[a.tone]}`}
                      style={{ width: `${Math.round(a.pct * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-5">
            <SectionHeading icon={TrendingUp} title="流量结构" subtle />
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--fill-subtle)]">
              {FLOW.map((s) => (
                <div
                  key={s.label}
                  className={s.color}
                  style={{ width: `${Math.round(s.pct * 100)}%` }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {FLOW.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between text-[12px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-sm ${s.color}`}
                      aria-hidden
                    />
                    <span className="text-[var(--color-ink)]/75">
                      {s.label}
                    </span>
                  </div>
                  <span className="tabular-nums text-[var(--color-ink)]/55">
                    {Math.round(s.pct * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-[var(--fill-subtle)]/60 px-3 py-2.5 text-[11.5px] leading-[1.7] text-[var(--color-ink)]/65">
              商业投广占 62% 偏高，目标把内容自然贡献从 38% 拉到 50% 以上。
            </div>
          </div>
        </section>

        {/* ── Benchmark table ── */}
        <section className="flex flex-col gap-3">
          <SectionHeading icon={Activity} title="同类商家策略 Benchmark" />
          <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--divider-soft)] text-left text-[11.5px] uppercase tracking-[0.04em] text-[var(--color-ink)]/45">
                  <th className="px-4 py-2.5 font-medium">策略类型</th>
                  <th className="px-4 py-2.5 font-medium">达人包结构</th>
                  <th className="px-3 py-2.5 text-center font-medium">A3</th>
                  <th className="px-3 py-2.5 text-center font-medium">看后搜</th>
                  <th className="px-3 py-2.5 text-center font-medium">自然占比</th>
                  <th className="px-4 py-2.5 font-medium">平台建议</th>
                </tr>
              </thead>
              <tbody>
                {BENCHMARKS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-[var(--divider-soft)]/60 last:border-b-0"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-ink)]">
                          {row.label}
                        </span>
                        {row.recommended && (
                          <span className="rounded-md bg-emerald-500/12 px-1.5 py-0.5 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-300">
                            推荐
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-[var(--color-ink)]/75">
                      {row.structure}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-medium tabular-nums ${GRADE_TONE[row.a3]}`}
                    >
                      {GRADE_LABEL[row.a3]}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-medium tabular-nums ${GRADE_TONE[row.search]}`}
                    >
                      {GRADE_LABEL[row.search]}
                    </td>
                    <td
                      className={`px-3 py-3 text-center font-medium tabular-nums ${GRADE_TONE[row.natural]}`}
                    >
                      {GRADE_LABEL[row.natural]}
                    </td>
                    <td className="px-4 py-3 align-top text-[var(--color-ink)]/75">
                      {row.suggestion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--divider-soft)] bg-[var(--fill-subtle)]/40 p-5 text-[13px] leading-[1.75] text-[var(--color-ink)]/80">
          <div className="mb-1 flex items-center gap-2 text-[11.5px] uppercase tracking-[0.08em] text-[var(--color-ink)]/55">
            <Sparkles size={12} strokeWidth={1.8} />
            诊断结论
          </div>
          历史结果偏依赖商业投广。本次提案应优先提升「本地垂类真实体验内容」和「高质量可投广素材」占比，目标将内容自然贡献占比提升至 <strong className="text-[var(--color-ink)]">50%</strong> 以上，并把潜客覆盖从「低」拉到「中」档。
        </section>
      </div>
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  subtle,
}: {
  icon: LucideIcon
  title: string
  subtle?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 ${subtle ? 'text-[12px] font-medium text-[var(--color-ink)]/65' : 'text-[13px] font-semibold text-[var(--color-ink)]'}`}
    >
      <Icon
        size={subtle ? 12 : 13}
        strokeWidth={1.8}
        className="text-[var(--color-ink)]/55"
      />
      {title}
    </div>
  )
}
