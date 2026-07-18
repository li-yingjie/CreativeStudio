import { useState } from 'react'
import { Check } from '@/shared/icons'
import { ChatFormCard, ChatFormSubmit } from './ChatFormCard'
import {
  PROPOSAL_PACKS,
  type ProposalPackId,
} from './proposal-pack-data'

export type { ProposalPackId } from './proposal-pack-data'

/**
 * Step 3 — 达人包策略 in-chat selector. User picks one of three packs;
 * each pack ships with a different mix of headcount + budget across
 * talent buckets and projected metrics. Confirm advances Step 4.
 */

export default function ProposalPackCard({
  defaultPick = '综合推荐包',
  onConfirm,
}: {
  defaultPick?: ProposalPackId
  onConfirm: (pick: ProposalPackId) => void
}) {
  const [pick, setPick] = useState<ProposalPackId>(defaultPick)
  const active = PROPOSAL_PACKS.find((p) => p.id === pick) ?? PROPOSAL_PACKS[0]

  return (
    <ChatFormCard delay={0.05}>
      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          策略包对比
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PROPOSAL_PACKS.map((p) => {
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
