import { ChatFormCard } from './ChatFormCard'

/**
 * Step 7 — 种草复盘 in-chat summary. Final terminal step: actual numbers
 * vs. targets, traffic decomposition, talent-bucket contribution table,
 * and AI 下次策略建议.
 */

const ACTUAL_STATS = [
  {
    label: '实际 A3 种草人群',
    value: '132 万',
    note: '目标 120 万，达成 110%',
    tone: 'mint',
  },
  {
    label: '实际看后搜规模',
    value: '36 万',
    note: '目标 30 万，达成 120%',
    tone: 'mint',
  },
  {
    label: '内容自然贡献占比',
    value: '48%',
    note: '略低于理想阈值 50%',
    tone: 'amber',
  },
] as const

const TRAFFIC_BREAKDOWN = [
  { label: '内容自然 A3', value: 70, valueLabel: '63 万', tone: 'mint' },
  { label: '商业投广 A3', value: 77, valueLabel: '69 万', tone: 'violet' },
  { label: '看后搜自然贡献', value: 60, valueLabel: '20.5 万', tone: 'mint' },
  { label: '看后搜投广贡献', value: 45, valueLabel: '15.5 万', tone: 'violet' },
] as const

const MODULE_CONTRIB: Record<string, string>[] = [
  {
    模块: '头部品宣达人',
    A3贡献: '高',
    看后搜: '中',
    自然流量: '低',
    优质率: '高',
    预算: '30%',
    结论: '适合品宣，不宜扩大',
  },
  {
    模块: '本地垂类达人',
    A3贡献: '中高',
    看后搜: '高',
    自然流量: '高',
    优质率: '高',
    预算: '25%',
    结论: '⭐ 下次提高占比',
  },
  {
    模块: '中腰部达人',
    A3贡献: '中',
    看后搜: '中',
    自然流量: '中',
    优质率: '中',
    预算: '20%',
    结论: '稳定供给',
  },
  {
    模块: '素人投稿',
    A3贡献: '中',
    看后搜: '低',
    自然流量: '中',
    优质率: '低',
    预算: '8%',
    结论: '规模有效，质量需治理',
  },
  {
    模块: '机构达人',
    A3贡献: '中',
    看后搜: '中',
    自然流量: '中',
    优质率: '中',
    预算: '10%',
    结论: '机构 B 表现更好',
  },
]

const NEXT_ADVICE = [
  {
    title: '达人包结构调整',
    desc: '本地垂类预算占比从 25% 提到 35%；头部达人保留 1-2 位作为内容样板；素人投稿保留，但必须增加 AI brief 强约束。',
  },
  {
    title: '内容策略调整',
    desc: '高看后搜内容通常具备明确消费场景、套餐信息完整、达人真实体验。下次 Brief 应强制要求"适合谁、为什么值得去、价格/套餐信息"。',
  },
  {
    title: '可复用资产',
    desc: '优选达人包 18 人 ｜ 可投广内容 9 条 ｜ 高质量机构 2 家 ｜ 建议保存模板「餐饮节点潜客种草」。',
  },
]

export default function ProposalReviewCard() {
  return (
    <ChatFormCard delay={0.05}>
      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          实际数据 vs 目标
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ACTUAL_STATS.map((s) => (
            <ActualStat key={s.label} {...s} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          流量贡献拆解
        </div>
        <div className="flex flex-col gap-1.5">
          {TRAFFIC_BREAKDOWN.map((t) => (
            <Bar key={t.label} {...t} />
          ))}
        </div>
        <div className="rounded-md bg-[var(--color-surface-0)] px-2.5 py-2 text-[11.5px] leading-[1.65] text-[var(--color-ink)]/65">
          <strong className="text-[var(--color-ink)]">AI 诊断：</strong>
          总 A3 和看后搜均达成，但 A3 仍较依赖投广；看后搜的自然贡献表现更好，主要来自本地垂类达人和中腰部真实体验内容。下次建议提高本地垂类占比，减少头部达人预算。
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          达人包模块贡献
        </div>
        <div className="overflow-hidden rounded-lg bg-[var(--color-surface-0)]">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-left text-[var(--color-ink)]/45">
                <Th>模块</Th>
                <Th>A3</Th>
                <Th>看后搜</Th>
                <Th>自然</Th>
                <Th>优质率</Th>
                <Th>预算</Th>
                <Th>结论</Th>
              </tr>
            </thead>
            <tbody>
              {MODULE_CONTRIB.map((row, i) => (
                <tr
                  key={row.模块}
                  className={
                    i === 0
                      ? 'border-t border-[var(--divider-soft)]'
                      : 'border-t border-[var(--divider-soft)]'
                  }
                >
                  <Td>{row.模块}</Td>
                  <Td>{row.A3贡献}</Td>
                  <Td>{row.看后搜}</Td>
                  <Td>{row.自然流量}</Td>
                  <Td>{row.优质率}</Td>
                  <Td>{row.预算}</Td>
                  <Td>{row.结论}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          下次策略建议
        </div>
        <div className="flex flex-col gap-1.5">
          {NEXT_ADVICE.map((a) => (
            <div
              key={a.title}
              className="flex flex-col gap-1 rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5"
            >
              <span className="text-[12.5px] font-medium text-[var(--color-ink)]">
                {a.title}
              </span>
              <span className="text-[11.5px] leading-[1.65] text-[var(--color-ink)]/65">
                {a.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChatFormCard>
  )
}

function ActualStat({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note: string
  tone: 'mint' | 'amber'
}) {
  const valueColor =
    tone === 'mint' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5">
      <span className="text-[11px] text-[var(--color-ink)]/55">{label}</span>
      <span className={`text-[18px] font-semibold leading-none tabular-nums ${valueColor}`}>
        {value}
      </span>
      <span className="text-[10.5px] text-[var(--color-ink)]/55">{note}</span>
    </div>
  )
}

function Bar({
  label,
  value,
  valueLabel,
  tone,
}: {
  label: string
  value: number
  valueLabel: string
  tone: 'mint' | 'violet'
}) {
  const fill = tone === 'mint' ? 'bg-emerald-500/85' : 'bg-violet-500/85'
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)_56px] items-center gap-2 text-[12px]">
      <span className="truncate text-[var(--color-ink)]/55">{label}</span>
      <div className="relative h-2 rounded-full bg-[var(--color-surface-0)]">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${fill}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-right font-semibold tabular-nums text-[var(--color-ink)]">
        {valueLabel}
      </span>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-1.5 font-medium">{children}</th>
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-2 py-1.5 text-[var(--color-ink)]/85">{children}</td>
}

export const PROPOSAL_REVIEW_STATS = ACTUAL_STATS
export const PROPOSAL_REVIEW_TRAFFIC = TRAFFIC_BREAKDOWN
export const PROPOSAL_REVIEW_MODULES = MODULE_CONTRIB
export const PROPOSAL_REVIEW_ADVICE = NEXT_ADVICE
