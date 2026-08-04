/* eslint-disable react-refresh/only-export-components -- defaultPlan 与文档组件同源 */
import { useMemo } from 'react'
import { Check, FileText, Sparkles } from '@/shared/icons'
import type { ActivityPreset } from './ActivityPreset'

/* ─── 解析后的活动方案（右侧「文档」态） ───
 * 上传的策划稿被解析成结构化方案：每个字段都能直接改，改完确认才进入搭建。
 * 这是 0→1 的第一个卡点 —— AI 先把「读懂了什么」摊开给人看。 */

export interface PlanCandidate {
  name: string
  /** 是否纳入本期 */
  inScope: boolean
  /** 原文出处 —— 让人能回去核对 */
  from: string
  why: string
}

/* 真实策划文档的形态：前半是项目定位、数据指标、竞品参考（不落地），
   玩法散在「活动形式」下面的小标题里，时间是几个节点而不是一个档期，
   还有一堆 xx 占位。所以解析结果分三层：
     背景（记下来，不影响搭建）→ 能落地的（搭建依据）→ 待确认（占位/缺失）。 */
export interface PlanDoc {
  title: string
  /** 项目定位 —— 战略层，不落地 */
  positioning: string
  goal: string
  audience: string
  /** 数据指标：真实策划里常带 xx 占位 */
  metrics: { label: string; value: string }[]
  /** 时间是几个节点，不是一个档期 */
  phases: { name: string; time: string; note: string }[]
  candidates: PlanCandidate[]
  cardCount: number
  tiers: { need: number; reward: string }[]
  chances: string[]
  pages: string[]
  /** 文档里没写清楚 / 留了占位的 */
  open: string[]
  /** 只作背景、这次不落地的部分 */
  background: string[]
}

/** 从活动模板 + 玩法配置推出初始解析结果。 */
export function defaultPlan(preset: ActivityPreset): PlanDoc {
  const g = preset.gameplay
  return {
    title: preset.name,
    positioning: '面向 C 端用户的夏季夜宵消费事件，用集卡把到店核销和内容投稿串起来',
    goal: '拉动夏季夜间时段的到店核销，同时沉淀一批夜宵场景的用户内容',
    audience: '18–35 岁本地生活用户，重点覆盖夜宵高频人群',
    metrics: [
      { label: '核销单量', value: 'xx 万单' },
      { label: '主话题 vv', value: 'xx 亿' },
      { label: '参与人数', value: 'xx 万' },
      { label: '投稿量', value: 'xx 万条' },
    ],
    phases: [
      { name: '预热', time: '6.30 – 7.06', note: '开放集卡，先放低门槛档位' },
      { name: '主推', time: '7.07 – 8.17', note: '任务全量开放，加投稿激励' },
      { name: '收官', time: '8.18 – 8.31', note: '兑换倒计时，清库存' },
    ],
    candidates: [
      { name: '集美食卡兑奖励', inScope: true, from: '活动形式 · 内容呈现', why: '链路最短、闭环完整，本期主玩法' },
      { name: '接金豆小游戏', inScope: true, from: '活动形式 · 用户参与', why: '作为抽卡次数的补充来源' },
      { name: '投稿任务体系', inScope: false, from: '活动形式 · 激励形式', why: '依赖内容侧排期，放到第二阶段' },
    ],
    cardCount: g.cards.length,
    tiers: g.tiers.map((t) => ({ need: t.need, reward: t.reward })),
    chances: ['每日首次进入 +1', '发布带话题投稿 +2', '赠送好友夜食卡 +1', '浏览合作商家 +1'],
    pages: ['活动主会场', '开卡结算页', '我的夜食（卡册）', '兑奖弹窗', '活动规则'],
    open: [
      '数据指标里的 xx 还没填，不影响搭建',
      '券面额度待商务终审',
      '小马黄金转运珠的库存与发放方式未定',
      '收官期的兑换截止时间文档里没写',
    ],
    background: [
      '竞品参考：某平台的集卡换购、便利店集点兑换（只作调性参考，不落地）',
      '品牌合作位与线下物料排期（另有专项，不在本次页面范围）',
    ],
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-[7px]">
      <span className="w-[68px] shrink-0 pt-[3px] text-[12px] text-[var(--color-ink)]/45">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

/** 行内可编辑文本 —— 看着像文档，点进去就能改。 */
function Line({
  value,
  onChange,
  readOnly,
}: {
  value: string
  onChange: (v: string) => void
  readOnly?: boolean
}) {
  return (
    <input
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-[5px] border border-transparent bg-transparent px-1.5 py-[2px] text-[13px] leading-[19px] text-[var(--color-ink)] outline-none transition-colors ${
        readOnly
          ? 'cursor-default'
          : 'cursor-text hover:border-[var(--divider)] focus:border-[var(--color-ink)]/60 focus:bg-[var(--color-surface-0)]'
      }`}
    />
  )
}

export default function XiahuaPlanDoc({
  preset,
  plan,
  onChange,
  parsing = false,
  confirmed = false,
  docName,
}: {
  preset: ActivityPreset
  plan: PlanDoc
  onChange: (next: PlanDoc) => void
  /** 解析中：显示骨架 */
  parsing?: boolean
  /** 已确认：转为只读并盖章 */
  confirmed?: boolean
  /** 从首页上传进来时的真实文件名；不传用活动预设默认名。 */
  docName?: string
}) {
  const ro = confirmed
  const sourceDocName = docName ?? preset.copy.docName
  const inScope = useMemo(() => plan.candidates.filter((c) => c.inScope), [plan.candidates])

  if (parsing)
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-0)]">
        <div className="w-[420px] space-y-3 rounded-[12px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-5">
          <div className="flex items-center gap-2 text-[13px] text-[var(--color-ink)]/70">
            <FileText className="size-4 text-sky-600" />
            {sourceDocName}
            <span className="ml-auto flex items-center gap-1 text-[12px] text-[var(--color-ink)]/55">
              <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-ink)]/45" />
              解析中
            </span>
          </div>
          {[92, 74, 100, 64, 88, 52].map((w, i) => (
            <div
              key={w}
              className="h-3 animate-pulse rounded-full bg-[var(--color-ink)]/[0.07]"
              style={{ width: `${w}%`, animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>
    )

  return (
    // 文档就是一页纸：白底、内容居中限宽，不再套一层灰底 + 卡片
    <div className="thin-scroll h-full w-full overflow-y-auto bg-[var(--color-surface-0)] px-6 py-6">
      <div className="mx-auto max-w-[680px]">
        {/* 头 */}
        <div className="flex items-start gap-2.5 border-b border-[var(--divider-soft)] pb-4">
          <span className="mt-[2px] flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]/70">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold leading-[24px] text-[var(--color-ink)]">
              活动方案
            </h2>
            <p className="mt-0.5 text-[12px] text-[var(--color-ink)]/50">
              来自 {sourceDocName} · 共识别 {plan.candidates.length} 个候选玩法、
              {plan.cardCount} 张卡、{plan.tiers.length} 档奖励
            </p>
          </div>
          {confirmed ? (
            <span className="mt-[3px] inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600">
              <Check className="size-3" /> 已确认
            </span>
          ) : (
            <span className="mt-[3px] shrink-0 rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-600">
              待确认
            </span>
          )}
        </div>

        {/* 基本信息 */}
        <div className="divide-y divide-[var(--divider-soft)] py-1">
          <Field label="活动名称">
            <Line readOnly={ro} value={plan.title} onChange={(v) => onChange({ ...plan, title: v })} />
          </Field>
          <Field label="项目定位">
            <Line readOnly={ro} value={plan.positioning} onChange={(v) => onChange({ ...plan, positioning: v })} />
          </Field>
          <Field label="核心目标">
            <Line readOnly={ro} value={plan.goal} onChange={(v) => onChange({ ...plan, goal: v })} />
          </Field>
          <Field label="人群">
            <Line readOnly={ro} value={plan.audience} onChange={(v) => onChange({ ...plan, audience: v })} />
          </Field>
        </div>

        {/* 文档前半段：目标与指标 —— 记下来，但不决定页面长什么样 */}
        <Section title="数据指标" hint="来自原文 · 不影响页面搭建">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {plan.metrics.map((m) => (
              <div key={m.label} className="flex items-baseline gap-2 text-[13px]">
                <span className="text-[var(--color-ink)]/45">{m.label}</span>
                <span
                  className={
                    m.value.includes('x')
                      ? 'font-medium text-amber-600'
                      : 'font-medium text-[var(--color-ink)]'
                  }
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
          <p className="pt-1 text-[11px] text-[var(--color-ink)]/40">
            标黄的是原文里还没填的占位，已记进「待确认」。
          </p>
        </Section>

        <Section title="活动节奏" hint={`${plan.phases.length} 个阶段`}>
          <div className="overflow-hidden rounded-[8px] border border-[var(--divider-soft)]">
            {plan.phases.map((ph, i) => (
              <div
                key={ph.name}
                className={`flex items-baseline gap-3 px-3 py-2 text-[13px] ${
                  i ? 'border-t border-[var(--divider-soft)]' : ''
                }`}
              >
                <span className="w-[44px] shrink-0 font-medium text-[var(--color-ink)]">{ph.name}</span>
                <span className="w-[112px] shrink-0 tabular-nums text-[var(--color-ink)]/70">{ph.time}</span>
                <span className="min-w-0 flex-1 text-[12px] text-[var(--color-ink)]/55">{ph.note}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 候选玩法 —— 勾选决定本期范围 */}
        <Section title="候选玩法" hint={`本期纳入 ${inScope.length} / ${plan.candidates.length}`}>
          <div className="space-y-1.5">
            {plan.candidates.map((c, i) => (
              <label
                key={c.name}
                className={`flex items-start gap-2.5 rounded-[8px] border px-3 py-2.5 transition-colors ${
                  c.inScope
                    ? 'border-[var(--color-ink)]/30 bg-[var(--color-ink)]/[0.04]'
                    : 'border-[var(--divider-soft)] bg-[var(--color-surface-1)]'
                } ${ro ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  checked={c.inScope}
                  disabled={ro}
                  onChange={(e) => {
                    const next = [...plan.candidates]
                    next[i] = { ...c, inScope: e.target.checked }
                    onChange({ ...plan, candidates: next })
                  }}
                  className="mt-[3px] size-3.5 shrink-0 accent-[var(--color-ink)]"
                />
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[13px] font-medium text-[var(--color-ink)]">{c.name}</span>
                    <span className="text-[11px] text-[var(--color-ink)]/35">{c.from}</span>
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-[18px] text-[var(--color-ink)]/55">
                    {c.why}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </Section>

        {/* 玩法参数 */}
        <Section title="集卡与奖励">
          <div className="flex items-center gap-2 pb-2 text-[13px] text-[var(--color-ink)]">
            <span className="text-[12px] text-[var(--color-ink)]/45">卡片种类</span>
            <input
              type="number"
              min={3}
              max={20}
              value={plan.cardCount}
              readOnly={ro}
              onChange={(e) => onChange({ ...plan, cardCount: Number(e.target.value) })}
              className="w-[64px] rounded-[6px] border border-[var(--divider)] bg-[var(--color-surface-0)] px-2 py-1 text-[13px] outline-none focus:border-[var(--color-ink)]/60"
            />
            <span className="text-[12px] text-[var(--color-ink)]/45">种</span>
          </div>
          <div className="overflow-hidden rounded-[8px] border border-[var(--divider-soft)]">
            <div className="flex bg-[var(--color-surface-1)] px-3 py-1.5 text-[11px] text-[var(--color-ink)]/45">
              <span className="w-[72px]">集齐</span>
              <span className="flex-1">奖励</span>
            </div>
            {plan.tiers.map((t, i) => (
              <div
                key={t.need}
                className="flex items-center border-t border-[var(--divider-soft)] px-3 py-1.5 text-[13px]"
              >
                <span className="w-[72px] text-[var(--color-ink)]/70">{t.need} 种</span>
                <div className="min-w-0 flex-1">
                  <Line
                    readOnly={ro}
                    value={t.reward}
                    onChange={(v) => {
                      const next = [...plan.tiers]
                      next[i] = { ...t, reward: v }
                      onChange({ ...plan, tiers: next })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="抽卡次数来源">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] text-[var(--color-ink)]/80">
            {plan.chances.map((c) => (
              <li key={c} className="flex items-start gap-1.5">
                <Check className="mt-[4px] size-3 shrink-0 text-emerald-500" />
                {c}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="需要的页面" hint={`${plan.pages.length} 个`}>
          <div className="flex flex-wrap gap-1.5">
            {plan.pages.map((p) => (
              <span
                key={p}
                className="rounded-full border border-[var(--divider)] px-2.5 py-1 text-[12px] text-[var(--color-ink)]/75"
              >
                {p}
              </span>
            ))}
          </div>
        </Section>

        <Section title="待确认" hint="不阻塞搭建">
          <ul className="list-disc space-y-1 pl-4 text-[13px] text-[var(--color-ink)]/70">
            {plan.open.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Section>

        {/* 文档里读到但这次不落地的 —— 明说出来，免得以为漏读了 */}
        <Section title="仅作背景" hint="读到了，但这次不做进页面">
          <ul className="space-y-1 text-[13px] text-[var(--color-ink)]/45">
            {plan.background.map((b2) => (
              <li key={b2} className="flex items-start gap-1.5">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-[var(--color-ink)]/25" />
                {b2}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-4 border-t border-[var(--divider-soft)] pt-4">
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">{title}</h3>
        {hint && <span className="text-[11px] text-[var(--color-ink)]/40">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
