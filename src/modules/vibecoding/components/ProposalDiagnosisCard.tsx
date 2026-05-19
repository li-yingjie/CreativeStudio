import { ChatFormCard } from './ChatFormCard'

/**
 * Step 2 — 人群与流量诊断 summary card. Read-only summary that surfaces
 * the AI's risk diagnosis + suggested goal thresholds inline in chat,
 * with a primary CTA to advance into Step 3 (达人包策略).
 */

const RISKS = [
  {
    title: '潜客覆盖缺口',
    level: '高',
    tone: 'rose',
    note: '近 30 天潜客内容触达低于同类商家均值 23%，建议本次提高本地垂类和可投广内容占比。',
  },
  {
    title: '看后搜机会',
    level: '高',
    tone: 'mint',
    note: '同类火锅品牌中，场景化探店和套餐价值内容对看后搜贡献更明显。',
  },
  {
    title: '投广依赖风险',
    level: '中',
    tone: 'amber',
    note: '商家历史营销中商业投广流量占比偏高，需要提升内容自然贡献。',
  },
] as const

const THRESHOLDS = [
  { label: 'A3 种草人群', value: '≥ 120 万' },
  { label: '看后搜规模', value: '≥ 30 万' },
  { label: '内容自然贡献占比', value: '≥ 50%' },
  { label: '优质内容率', value: '≥ 35%' },
] as const

export default function ProposalDiagnosisCard() {
  return (
    <ChatFormCard delay={0.05}>
      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          风险诊断
        </div>
        <div className="grid grid-cols-1 gap-2">
          {RISKS.map((r) => (
            <RiskRow
              key={r.title}
              title={r.title}
              level={r.level}
              tone={r.tone}
              note={r.note}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          建议目标阈值
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {THRESHOLDS.map((t) => (
            <div
              key={t.label}
              className="flex items-center justify-between rounded-lg bg-[var(--color-surface-0)] px-3 py-2 text-[12.5px]"
            >
              <span className="text-[var(--color-ink)]/55">{t.label}</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {t.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5 text-[12.5px] leading-[1.7] text-[var(--color-ink)]/75">
        <strong className="text-[var(--color-ink)]">诊断结论：</strong>
        历史结果偏依赖商业投广。本次提案应优先提升「本地垂类真实体验内容」和「高质量可投广素材」占比，目标将内容自然贡献占比提升至 50% 以上。
      </div>
    </ChatFormCard>
  )
}

function RiskRow({
  title,
  level,
  tone,
  note,
}: {
  title: string
  level: string
  tone: 'rose' | 'mint' | 'amber'
  note: string
}) {
  const map: Record<string, string> = {
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
    mint: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5">
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${map[tone]}`}
      >
        {level}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[12.5px] font-medium text-[var(--color-ink)]">
          {title}
        </span>
        <span className="text-[11.5px] leading-[1.65] text-[var(--color-ink)]/65">
          {note}
        </span>
      </div>
    </div>
  )
}
