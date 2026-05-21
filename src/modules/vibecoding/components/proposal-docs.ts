/* ─── 提案流 (ops-proposal) 文档生成器 ───
 *
 * Pure functions that render each proposal-flow step's output into a markdown
 * document (surfaced when the user opens the artefact in a tab). Extracted from
 * VibeCodingPage to keep the hub component lean — these depend only on the
 * Proposal* card data, never on component state.
 */
import { getPackProfile, type ProposalPackId } from './ProposalPackCard'
import { type ProposalGoalDraft } from './ProposalGoalCard'
import { PROPOSAL_PLAYS } from './ProposalBriefCard'
import { PROPOSAL_FUNNEL, PROPOSAL_MODULES } from './ProposalDashboardCard'
import {
  PROPOSAL_REVIEW_ADVICE,
  PROPOSAL_REVIEW_MODULES,
  PROPOSAL_REVIEW_STATS,
  PROPOSAL_REVIEW_TRAFFIC,
} from './ProposalReviewCard'

/** Render the 商家目标卡 form draft into a markdown document. Stored as
 *  a string and surfaced when the user opens the file in a tab. */
export function renderGoalMarkdown(d: {
  brand: string
  district: string
  category: string
  budget: string
  period: string
  audience: string
  ask: string
  constraints: string
}): string {
  return `# 商家目标卡

> 由对话补充的需求经 AI 解析为可执行的种草目标。

## 基本信息

- **商家 / 品牌**：${d.brand}
- **品类**：${d.category}
- **城市 / 商圈**：${d.district}
- **活动周期**：${d.period}
- **市场预算**：${d.budget}
- **目标人群**：${d.audience}

## 商家核心诉求

${d.ask}

## 约束条件

${d.constraints || '（暂无）'}

## AI 目标解析

当前商家的核心诉求是 **五一节点前潜客种草与搜索意向提升**，不适合直接以带货 GMV 作为第一目标。建议采用「头部品宣建立认知 + 本地垂类达人真实体验 + 中腰部场景覆盖 + 素人挑战扩散 + 可投广内容放大」的组合策略。

需要重点监控：

- A3 种草规模
- 看后搜
- 潜客覆盖
- 内容自然贡献占比

避免结果主要由商业投广堆出。

## 待确认追问

- 预算是否包含投广？当前预算记录为达人商业合作费用，若包含投广预算，会影响自然贡献占比判断。
- 是否有必选达人？若商家指定头部达人，需锁定在达人包并重新估算预算和效果。
`
}

/** Single source of truth for the proposal-flow artifact summaries.
 *  The in-chat ArtifactCard pulls filename → summary from here. */
export const PROPOSAL_FILE_SUMMARY: Record<string, string> = {
  '商家目标卡.md': '商家目标已结构化，包含核心诉求、约束和 AI 解析',
  '人群诊断.md':
    '人群与流量诊断结论：3 个风险 + 4 个目标阈值 + 同类商家 Benchmark',
  '人群诊断看板': '可视化数据看板：KPI / 风险 / 人群 / 流量结构 / Benchmark',
  '达人包.md': '已确认的达人包策略，含结构、指标预估和 AI 建议',
  '玩法brief.md':
    '4 套玩法 + Brief 模板：本地垂类 / 头部品宣 / 素人挑战 / 可投广候选',
  '提案报告.md': '完整提案报告',
  '执行看板.md': '执行看板配置（达人 / 机构 / 星图任务拆分）',
  '复盘.md': '复盘文档（指标对比 + 经验沉淀）',
}

/** Render the 人群与流量诊断 step output into a markdown document. */
export function renderDiagnosisMarkdown(): string {
  return `# 人群与流量诊断

> 数据来源：@风神 同类火锅品牌过去 30 天指标 + @iDA 商家历史 A3 / 看后搜结构。

## 风险诊断

### 潜客覆盖缺口（高）

近 30 天潜客内容触达低于同类商家均值 23%。建议本次提高本地垂类和可投广内容占比，扩大潜客覆盖。

### 看后搜机会（高）

同类火锅品牌中，**场景化探店**和**套餐价值内容**对看后搜的贡献最明显，需要在达人 brief 中强约束这两类元素。

### 投广依赖风险（中）

商家历史营销中商业投广流量占比偏高，A3 达成主要靠投广堆出。本次需要把内容自然贡献占比从 38% 提升到 50% 以上。

## 人群覆盖结构

- 老客覆盖：高
- 新客覆盖：中
- 搜索意向人群：中低
- 潜客覆盖：低
- A3 种草人群：低（需重点提升）

## 流量结构

- 商业投广流量：62%（偏高）
- 内容自然流量：38%
- 达人自然内容贡献：24%
- 可投广内容贡献：18%

## 建议目标阈值

| 指标 | 阈值 |
| --- | --- |
| A3 种草人群 | ≥ 120 万 |
| 看后搜规模 | ≥ 30 万 |
| 内容自然贡献占比 | ≥ 50% |
| 优质内容率 | ≥ 35% |

## 同类商家策略 Benchmark

| 策略类型 | 达人包结构 | A3 表现 | 看后搜 | 自然流量占比 | 平台建议 |
| --- | --- | --- | --- | --- | --- |
| 高头部品宣型 | 头部占比高 | 高 | 中 | 低 | 仅保留 1-2 位作为声量锚点 |
| 本地垂类种草型 | 垂类达人占比高 | 中高 | 高 | 高 | **推荐** |

## 诊断结论

历史结果偏依赖商业投广。本次提案应优先提升「本地垂类真实体验内容」和「高质量可投广素材」占比，目标将内容自然贡献占比提升至 50% 以上。
`
}

/** Render the chosen 达人包 into a markdown document. Captures the
 *  pack id, projected metrics, talent bucket structure, and the AI's
 *  recommendation note so the choice is auditable as a project artefact. */
export function renderPackMarkdown(pick: ProposalPackId): string {
  const p = getPackProfile(pick)
  const buckets = p.buckets
    .map(
      (b) =>
        `| ${b.name} | ${b.count} 人 | ${b.budget} | ${b.note} |`,
    )
    .join('\n')
  return `# 达人包策略 · ${p.id}

> ${p.desc}

## 关键指标预估

| 预计 A3 种草人群 | 内容自然贡献 | 看后搜规模 | 预算 |
| --- | --- | --- | --- |
| ${p.metrics.a3} | ${p.metrics.natural} | ${p.metrics.afterSearch} | ${p.metrics.budget} |

## 达人结构

| 模块 | 数量 | 预算占比 | 核心作用 |
| --- | --- | --- | --- |
${buckets}

## AI 建议

${p.aiNote}

## 下一步

进入玩法 + Brief 编排（@mira 生成达人侧 brief；@aeolus 校准内容方向）。
`
}

/** Step 5 — assemble the full proposal report from prior step output.
 *  Mirrors what the original 提案报告生成器 surfaces: 商家目标理解 +
 *  种草经营策略 + 关键指标预估 + 达人包结构表 + AI 修改建议 + 审批流。 */
export function renderReportMarkdown(
  goal: ProposalGoalDraft,
  pack: ProposalPackId,
): string {
  const p = getPackProfile(pack)
  const buckets = p.buckets
    .map(
      (b) => `| ${b.name} | ${b.count} 人 | ${b.budget} | ${b.note} |`,
    )
    .join('\n')
  return `# ${goal.brand}｜五一潜客种草方案

> 方案版本 V2 ｜ ${pack} ｜ 预算 ${p.metrics.budget} ｜ 周期 ${goal.period}

## 1. 商家目标理解

本次目标不是短期达人带货，而是五一节点前提升潜客认知和搜索意向。建议用达人内容建立"朋友聚餐、性价比套餐、夜宵火锅"等消费场景，带动 A3 种草人群和看后搜增长。

> 商家原话：${goal.ask}

## 2. 种草经营策略

采用"头部品宣达人建立声量 + 本地垂类达人提供真实体验 + 中腰部达人扩大场景覆盖 + 素人挑战营造参与氛围 + 可投广素材放大潜客"的组合策略。

### 关键指标预估

| 预计 A3 | 预计看后搜 | 内容自然贡献 | 预算 |
| --- | --- | --- | --- |
| ${p.metrics.a3} | ${p.metrics.afterSearch} | ${p.metrics.natural} | ${p.metrics.budget} |

## 3. 达人包结构

| 模块 | 数量 | 预算占比 | 核心作用 |
| --- | --- | --- | --- |
${buckets}

## 4. 玩法 + Brief

详情见 \`briefs/玩法brief.md\`，包含本地垂类、头部品宣、素人挑战、可投广候选 4 套模板。

## 5. AI 修改建议

建议在提案里补充"内容自然贡献占比"作为商家复盘口径，并解释为什么不建议过度增加头部达人预算。

## 6. 审批流

- 行业负责人：**已通过**
- 财务预算确认：**待确认**
- 星图合作校验：**进行中**

## 7. 提案质量检查

- 目标清晰度：92
- 达人包完整度：88
- 预算合理性：76（建议补充投广预算口径）
- 自然贡献风险：中（需要 brief 严控可投广素材）
`
}

/** Step 6 — render the 转执行看板 snapshot into a markdown document.
 *  Captures the funnel + 5 status modules so the dashboard is auditable
 *  as a project artefact. */
export function renderDashboardMarkdown(): string {
  const funnel = PROPOSAL_FUNNEL.map(
    (f) => `| ${f.label} | ${f.value} |`,
  ).join('\n')
  const modules = PROPOSAL_MODULES.map((m) => {
    const items = m.items
      .map((it) =>
        it.alert
          ? `- **${it.title}** —— ${it.meta}\n  > ⚠ ${it.alert}`
          : `- **${it.title}** —— ${it.meta}`,
      )
      .join('\n')
    return `### ${m.title}（${m.status}）\n\n${items}`
  }).join('\n\n')
  return `# 执行看板

> 提案不止导出文档，而是一键拆成达人、机构、星图、达人中心和飞书任务。

## 执行漏斗

| 阶段 | 数量 |
| --- | --- |
${funnel}

## 执行模块

${modules}

## 同步频率

- 每日同步飞书日报到行业群
- 每周一对照 \`reports/提案报告.md\` 校准节奏
- 复盘节点（5/05 后）触发自动出 \`reports/复盘.md\`
`
}

/** Step 7 — render the 复盘 doc. Final terminal artefact: actual data
 *  vs target, traffic decomposition, module contribution table, and
 *  next-iteration advice. */
export function renderReviewMarkdown(): string {
  const stats = PROPOSAL_REVIEW_STATS.map(
    (s) => `- **${s.label}**: ${s.value}（${s.note}）`,
  ).join('\n')
  const traffic = PROPOSAL_REVIEW_TRAFFIC.map(
    (t) => `| ${t.label} | ${t.valueLabel} |`,
  ).join('\n')
  const headers = Object.keys(PROPOSAL_REVIEW_MODULES[0])
  const modules = PROPOSAL_REVIEW_MODULES.map(
    (row) => `| ${headers.map((h) => row[h]).join(' | ')} |`,
  ).join('\n')
  const advice = PROPOSAL_REVIEW_ADVICE.map(
    (a) => `### ${a.title}\n\n${a.desc}`,
  ).join('\n\n')
  return `# 种草复盘

> 复盘重点不是总量，而是种草质量和自然贡献。

## 实际数据 vs 目标

${stats}

## 流量贡献拆解

| 维度 | 实际值 |
| --- | --- |
${traffic}

> AI 诊断：总 A3 和看后搜均达成，但 A3 仍较依赖投广；看后搜的自然贡献表现更好，主要来自本地垂类达人和中腰部真实体验内容。下次建议提高本地垂类占比，减少头部达人预算。

## 达人包模块贡献

| ${headers.join(' | ')} |
| ${headers.map(() => '---').join(' | ')} |
${modules}

## 下次策略建议

${advice}

## 可复用资产沉淀

- 优选达人包：18 人
- 可投广内容池：9 条
- 高质量机构：2 家
- 模板归档：「餐饮节点潜客种草」可作为后续同类项目起点
`
}

/** Render the 4 玩法 + Brief into a single markdown document. */
export function renderBriefMarkdown(): string {
  return `# 玩法 + Brief 编排

> 每个达人桶都对应一种玩法 + Brief 模板。统一标准后再下发，避免内容方向漂移。

${PROPOSAL_PLAYS.map(
  (p) => `## ${p.name}｜${p.tag}

${p.scope}

### 创作目标

${p.goal}

### 必须包含

${p.mustHave.map((m) => `- ${m}`).join('\n')}

### 质量要求

${p.quality}
`,
).join('\n')}## 下发说明

- 头部 / 本地垂类达人走 @mira 单独沟通，确认档期与脚本初稿后再下星图订单
- 中腰部 / 素人挑战投稿走机构批量下发，机构内预筛后才能进入审核
- 可投广候选标签由 @holmes 自动初评，命中规则才会进入投广素材池
`
}
