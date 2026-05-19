import { useState } from 'react'
import { Check } from 'lucide-react'
import { ChatFormCard, ChatFormSubmit } from './ChatFormCard'

/**
 * Step 3 — 达人包策略 in-chat selector. User picks one of three packs;
 * each pack ships with a different mix of headcount + budget across
 * talent buckets and projected metrics. Confirm advances Step 4.
 */

export type ProposalPackId = '综合推荐包' | '自然种草强化包' | '潜客覆盖包'

interface PackProfile {
  id: ProposalPackId
  desc: string
  metrics: { a3: string; natural: string; afterSearch: string; budget: string }
  buckets: { name: string; count: string; budget: string; note: string }[]
  aiNote: string
}

const PACKS: PackProfile[] = [
  {
    id: '综合推荐包',
    desc: '头部声量、本地垂类、素人规模和投广素材均衡组合',
    metrics: {
      a3: '128 万',
      natural: '46%',
      afterSearch: '34 万',
      budget: '¥50 万',
    },
    buckets: [
      { name: '头部品宣达人', count: '3', budget: '30%', note: '品牌声量、信任背书、内容样板' },
      { name: '本地垂类达人', count: '30', budget: '25%', note: '真实体验、场景种草、看后搜' },
      { name: '中腰部达人', count: '80', budget: '20%', note: '内容覆盖、商圈扩散' },
      { name: '素人挑战投稿', count: '300', budget: '8%', note: '低成本规模化内容氛围' },
      { name: '机构供给', count: '120', budget: '17%', note: '机构批量履约、内容稳定' },
    ],
    aiNote: 'A3 可达成（128 万 ≥ 120 万），但自然贡献 46% 略低于阈值 50%。建议把本地垂类预算从 25% 提升到 32%。',
  },
  {
    id: '自然种草强化包',
    desc: '提高本地垂类和中腰部达人占比，降低投广依赖',
    metrics: {
      a3: '122 万',
      natural: '56%',
      afterSearch: '38 万',
      budget: '¥50 万',
    },
    buckets: [
      { name: '头部品宣达人', count: '2', budget: '18%', note: '保留 1-2 位作为声量锚点' },
      { name: '本地垂类达人', count: '40', budget: '34%', note: '主力承担看后搜与自然贡献' },
      { name: '中腰部达人', count: '100', budget: '24%', note: '场景多样化覆盖核心商圈' },
      { name: '素人挑战投稿', count: '320', budget: '8%', note: '保留参与氛围' },
      { name: '机构供给', count: '120', budget: '16%', note: '机构 B 履约稳定' },
    ],
    aiNote: '自然贡献 56% 达标，但 A3 122 万距阈值仅 +2 万。适合内容自然贡献为优先目标的商家。',
  },
  {
    id: '潜客覆盖包',
    desc: '提升可投广内容和潜客匹配达人比例，拉高 A3',
    metrics: {
      a3: '146 万',
      natural: '39%',
      afterSearch: '42 万',
      budget: '¥50 万',
    },
    buckets: [
      { name: '头部品宣达人', count: '3', budget: '32%', note: '建立强势品牌认知' },
      { name: '本地垂类达人', count: '20', budget: '15%', note: '兜底真实体验' },
      { name: '中腰部达人', count: '60', budget: '14%', note: '广覆盖场景' },
      { name: '潜客匹配达人', count: '50', budget: '22%', note: '可投广素材产出主力' },
      { name: '机构供给', count: '160', budget: '17%', note: '提升投广素材规模' },
    ],
    aiNote: 'A3 拉到 146 万远超阈值，但自然贡献只有 39%，会触发投广依赖风险。仅在商家明确接受投广堆量时使用。',
  },
]

export default function ProposalPackCard({
  defaultPick = '综合推荐包',
  onConfirm,
}: {
  defaultPick?: ProposalPackId
  onConfirm: (pick: ProposalPackId) => void
}) {
  const [pick, setPick] = useState<ProposalPackId>(defaultPick)
  const active = PACKS.find((p) => p.id === pick) ?? PACKS[0]

  return (
    <ChatFormCard delay={0.05}>
      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          策略包对比
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PACKS.map((p) => {
            const selected = p.id === pick
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPick(p.id)}
                className={`relative flex flex-col gap-2 rounded-lg p-3 text-left transition-colors ${
                  selected
                    ? 'bg-[var(--color-surface-0)] ring-2 ring-[var(--color-ink)]/30'
                    : 'bg-[var(--color-surface-0)] hover:bg-[var(--fill-hover)] ring-1 ring-[var(--divider-soft)]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[12.5px] font-medium text-[var(--color-ink)]">
                    {p.id}
                  </span>
                  {selected && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-ink-contrast)]">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <Metric value={p.metrics.a3} label="A3" />
                  <Metric value={p.metrics.natural} label="自然" />
                  <Metric value={p.metrics.afterSearch} label="看后搜" />
                  <Metric value={p.metrics.budget} label="预算" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          {active.id} · 达人结构
        </div>
        <div className="flex flex-col gap-1.5">
          {active.buckets.map((b) => (
            <div
              key={b.name}
              className="grid grid-cols-[minmax(0,1fr)_56px_56px] items-center gap-2 rounded-lg bg-[var(--color-surface-0)] px-3 py-2 text-[12.5px]"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-[var(--color-ink)]">
                  {b.name}
                </span>
                <span className="truncate text-[11px] text-[var(--color-ink)]/55">
                  {b.note}
                </span>
              </div>
              <span className="text-right tabular-nums text-[var(--color-ink)]">
                {b.count} 人
              </span>
              <span className="text-right tabular-nums text-[var(--color-ink)]/65">
                {b.budget}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5 text-[12.5px] leading-[1.7] text-[var(--color-ink)]/75">
        <strong className="text-[var(--color-ink)]">AI 建议：</strong>
        {active.aiNote}
      </div>

      <div className="mt-1 flex items-center gap-2">
        <ChatFormSubmit onClick={() => onConfirm(pick)}>
          确认 {active.id}
        </ChatFormSubmit>
        <span className="text-[11.5px] text-[var(--color-ink)]/45">
          确认后生成 configs/达人包.md，进入玩法 + Brief 编排
        </span>
      </div>
    </ChatFormCard>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded bg-[var(--fill-subtle)] px-1.5 py-1">
      <span className="text-[12px] font-semibold tabular-nums leading-none text-[var(--color-ink)]">
        {value}
      </span>
      <span className="text-[10px] text-[var(--color-ink)]/55">{label}</span>
    </div>
  )
}

export function getPackProfile(id: ProposalPackId): PackProfile {
  return PACKS.find((p) => p.id === id) ?? PACKS[0]
}
