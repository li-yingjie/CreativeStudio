import { useState } from 'react'
import { ChatFormCard, ChatFormStep, ChatFormSubmit } from './ChatFormCard'

/**
 * 商家目标卡 — Step 1 of the seeding proposal flow rendered inline in
 * chat. Covers the 8 fields from the original 达人智能运营平台 page so the
 * AI can transform a fuzzy merchant brief into structured goal config.
 *
 * Submitting calls `onSubmit` with the captured values; the parent page
 * is responsible for advancing to the AI 目标解析 step + writing the
 * resulting markdown file into the project tree.
 */

export interface ProposalGoalDraft {
  brand: string
  district: string
  category: string
  budget: string
  period: string
  audience: string
  ask: string
  constraints: string
}

const PRESET_BRAND = '沪上某连锁火锅品牌'
const PRESET_DISTRICT = '上海｜徐家汇、五角场、陆家嘴'
const PRESET_CATEGORY = '餐饮 - 火锅 / 朋友聚餐'
const PRESET_BUDGET = '¥500,000（含星图达人费用，不含平台投广预算）'
const PRESET_PERIOD = '4/18 - 5/05，五一前两周种草蓄水'
const PRESET_AUDIENCE = '潜客、新客、年轻聚餐人群、商圈附近消费人群'
const PRESET_ASK =
  '五一前做一波达人种草，希望更多上海年轻人知道这家火锅店，内容最好能带动搜索和到店前兴趣。希望有一些头部达人做声量，也需要足够多本地内容覆盖核心商圈。'
const PRESET_CONSTRAINTS =
  '达人商业合作走星图；需要沉淀一批可投广素材；机构可以参与批量供给；不以达人带货 GMV 作为本次第一目标。'

export default function ProposalGoalCard({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<ProposalGoalDraft>
  onSubmit: (draft: ProposalGoalDraft) => void
  onCancel?: () => void
}) {
  const [draft, setDraft] = useState<ProposalGoalDraft>({
    brand: initial?.brand ?? PRESET_BRAND,
    district: initial?.district ?? PRESET_DISTRICT,
    category: initial?.category ?? PRESET_CATEGORY,
    budget: initial?.budget ?? PRESET_BUDGET,
    period: initial?.period ?? PRESET_PERIOD,
    audience: initial?.audience ?? PRESET_AUDIENCE,
    ask: initial?.ask ?? PRESET_ASK,
    constraints: initial?.constraints ?? PRESET_CONSTRAINTS,
  })

  const set = <K extends keyof ProposalGoalDraft>(k: K, v: ProposalGoalDraft[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }))

  const canSubmit =
    draft.brand.trim() && draft.budget.trim() && draft.ask.trim()

  return (
    <ChatFormCard delay={0.1}>
      <ChatFormStep number={1} title="商家与场景">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="商家 / 品牌"
            value={draft.brand}
            onChange={(v) => set('brand', v)}
            placeholder="例：沪上某连锁火锅品牌"
          />
          <Input
            label="品类"
            value={draft.category}
            onChange={(v) => set('category', v)}
            placeholder="餐饮 - 火锅"
          />
          <Input
            label="城市 / 商圈"
            value={draft.district}
            onChange={(v) => set('district', v)}
            placeholder="上海｜徐家汇、五角场"
          />
          <Input
            label="活动周期"
            value={draft.period}
            onChange={(v) => set('period', v)}
            placeholder="4/18 - 5/05"
          />
        </div>
      </ChatFormStep>

      <ChatFormStep number={2} title="预算与人群">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="市场预算"
            value={draft.budget}
            onChange={(v) => set('budget', v)}
            placeholder="¥500,000"
          />
          <Input
            label="目标人群"
            value={draft.audience}
            onChange={(v) => set('audience', v)}
            placeholder="潜客、新客、年轻聚餐人群"
          />
        </div>
      </ChatFormStep>

      <ChatFormStep number={3} title="核心诉求">
        <Textarea
          value={draft.ask}
          onChange={(v) => set('ask', v)}
          placeholder="商家想达成什么 / 关心什么 / 担心什么"
        />
      </ChatFormStep>

      <ChatFormStep number={4} title="约束条件" optional>
        <Textarea
          value={draft.constraints}
          onChange={(v) => set('constraints', v)}
          placeholder="合作通道、素材沉淀、是否走星图、是否以 GMV 为目标 …"
        />
      </ChatFormStep>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ChatFormSubmit
          disabled={!canSubmit}
          onClick={() => onSubmit(draft)}
        >
          提交目标卡
        </ChatFormSubmit>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-[12px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            取消
          </button>
        )}
        <span className="text-[11.5px] text-[var(--color-ink)]/45">
          提交后 AI 会做目标解析 + 风险追问，并生成 商家目标卡.md
        </span>
      </div>
    </ChatFormCard>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] text-[var(--color-ink)]/55">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[13px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
      />
    </label>
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
    />
  )
}
