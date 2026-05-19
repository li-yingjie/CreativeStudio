import { useState } from 'react'
import { ChatFormCard, ChatFormSubmit } from './ChatFormCard'

/**
 * Step 4 — 玩法 + Brief in-chat editor. Shows the four play templates
 * (本地垂类 / 头部品宣 / 素人挑战 / 可投广素材) on top and the brief
 * detail for the selected play below. Confirming generates the
 * 玩法brief.md file containing all four briefs.
 */

interface PlayBrief {
  name: string
  tag: string
  scope: string
  goal: string
  mustHave: string[]
  quality: string
}

const PLAYS: PlayBrief[] = [
  {
    name: '本地垂类达人',
    tag: '真实探店 / 场景化种草',
    scope: '承担看后搜与内容自然贡献，强调真实体验、套餐信息和适合人群。',
    goal: '用真实体验帮助用户判断五一前朋友聚餐是否值得选择该品牌。',
    mustHave: [
      '适合场景：朋友聚餐 / 夜宵 / 商圈逛街后',
      '套餐或价格信息，至少说明人均或推荐菜品',
      '真实体验：服务、环境、口味、排队/预约建议',
      '明确结论：适合哪些人，不适合哪些情况',
    ],
    quality:
      '避免泛泛夸商家；内容需要有场景感、信息量和用户决策帮助。',
  },
  {
    name: '头部品宣达人',
    tag: '节点品宣 / 品牌认知',
    scope: '建立品牌声量与内容样板，不承担规模投稿。',
    goal: '在五一节点上塑造品牌锚点，给后续达人/素人提供参考样板。',
    mustHave: [
      '一句记忆点 + 一段品牌故事或菜品故事',
      '强调与五一节点的情绪绑定（团聚、解压、犒劳自己）',
      '稳定画面 + 口播至少 30 秒',
    ],
    quality:
      '不堆 SKU，不进价；输出方向决策：让看客在看完后愿意去试、愿意安利朋友。',
  },
  {
    name: '素人挑战投稿',
    tag: '五一火锅饭局挑战',
    scope: '低成本规模化拉内容氛围，需严格 brief + 机构预筛。',
    goal: '在五一前 7 天形成「五一火锅饭局」话题氛围，覆盖核心商圈周边的素人内容。',
    mustHave: [
      '统一封面话题：#五一火锅饭局',
      '出现门店/招牌菜/朋友合影任一组合',
      '描述聚餐时长 / 人均 / 是否值得',
    ],
    quality:
      '机构提交前完成预筛：低置信硬广 / 错别字 / 黑名单达人直接退稿。',
  },
  {
    name: '可投广内容候选',
    tag: '投广素材产出',
    scope: '产出可二次商业放大的优质内容，不仅满足种草还要满足投广素材规范。',
    goal: '产出可投广候选 ≥ 24 条，覆盖朋友聚餐 / 夜宵 / 商圈逛街三类场景。',
    mustHave: [
      '封面：商品 / 商家 / 卖点三选二，标题 ≤ 14 字',
      '前 3 秒抓人：场景或冲突或反差',
      '末尾给行动指引（看简介 / 搜索品牌 / 到店领券）',
    ],
    quality:
      '提交前自检卖点是否清晰、信息是否完整、潜客是否能看懂；机器初评不通过的直接退回。',
  },
]

export default function ProposalBriefCard({
  onConfirm,
}: {
  onConfirm: () => void
}) {
  const [active, setActive] = useState(0)
  const play = PLAYS[active]

  return (
    <ChatFormCard delay={0.05}>
      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          玩法分配
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {PLAYS.map((p, i) => {
            const selected = i === active
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setActive(i)}
                className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors ${
                  selected
                    ? 'bg-[var(--color-surface-0)] ring-2 ring-[var(--color-ink)]/30'
                    : 'bg-[var(--color-surface-0)] ring-1 ring-[var(--divider-soft)] hover:bg-[var(--fill-hover)]'
                }`}
              >
                <span className="text-[12.5px] font-medium text-[var(--color-ink)]">
                  {p.name}
                </span>
                <span className="text-[11px] text-[var(--color-ink)]/55">
                  {p.tag}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          {play.name}｜{play.tag} Brief
        </div>
        <div className="rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5 text-[12.5px] leading-[1.7] text-[var(--color-ink)]/75">
          {play.scope}
        </div>

        <BriefBlock title="创作目标">
          <p>{play.goal}</p>
        </BriefBlock>

        <BriefBlock title="必须包含">
          <ul className="ml-1 flex flex-col gap-1">
            {play.mustHave.map((m) => (
              <li key={m} className="relative pl-3.5 before:absolute before:left-0.5 before:top-[10px] before:h-1 before:w-1 before:rounded-full before:bg-[var(--color-ink)]/45">
                {m}
              </li>
            ))}
          </ul>
        </BriefBlock>

        <BriefBlock title="质量要求">
          <p>{play.quality}</p>
        </BriefBlock>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <ChatFormSubmit onClick={onConfirm}>
          确认玩法 + Brief
        </ChatFormSubmit>
        <span className="text-[11.5px] text-[var(--color-ink)]/45">
          确认后生成 briefs/玩法brief.md，包含全部 4 种玩法说明
        </span>
      </div>
    </ChatFormCard>
  )
}

function BriefBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5 text-[12.5px] leading-[1.7] text-[var(--color-ink)]">
      <div className="text-[12px] font-semibold text-[var(--color-ink)]/85">{title}</div>
      <div className="text-[var(--color-ink)]/75">{children}</div>
    </div>
  )
}

export const PROPOSAL_PLAYS = PLAYS
