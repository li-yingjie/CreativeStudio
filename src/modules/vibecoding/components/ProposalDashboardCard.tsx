import { ChatFormCard } from './ChatFormCard'

/**
 * Step 6 — 转执行看板 in-chat summary. Surfaces the 6-stage funnel +
 * 5 status modules so the user gets an at-a-glance view of how the
 * proposal cascades into operational work without leaving chat.
 */

const FUNNEL = [
  { label: '待触达', value: 638 },
  { label: '已响应', value: 412 },
  { label: '已确认', value: 286 },
  { label: '创作中', value: 154 },
  { label: '已提交', value: 82 },
  { label: '优质内容', value: 38 },
] as const

const MODULES: ModuleSpec[] = [
  {
    title: '达人确认',
    status: '进行中',
    statusTone: 'blue',
    items: [
      {
        title: '头部达人档期确认',
        meta: '计划 3 人 ｜ 已确认 2 人 ｜ 星图待下单 1 人',
        alert: '风险：1 位头部达人报价超预算 18%',
      },
      {
        title: '垂类达人意愿确认',
        meta: '已触达 42 ｜ 有意向 31 ｜ 待确认 7',
      },
    ],
  },
  {
    title: '机构履约',
    status: '预警',
    statusTone: 'amber',
    items: [
      {
        title: '机构 A ｜ 门店覆盖任务',
        meta: '目标 60 人 ｜ 已分配 42 ｜ 提交 12',
        alert: '进度低于计划 22%, 建议追加机构 B',
      },
      {
        title: '机构 B ｜ 素人挑战投稿',
        meta: '目标 120 ｜ 已报名 96 ｜ 创作中 58',
      },
    ],
  },
  {
    title: '内容任务',
    status: '正常',
    statusTone: 'mint',
    items: [
      { title: '朋友聚餐场景 Brief', meta: '领取 86 ｜ 提交 31 ｜ 通过 18' },
      { title: '夜宵火锅体验 Brief', meta: '领取 44 ｜ 提交 17 ｜ 通过 9' },
    ],
  },
  {
    title: '星图状态',
    status: '同步',
    statusTone: 'blue',
    items: [
      { title: '商业合作订单', meta: '待下单 4 ｜ 已下单 18 ｜ 已完成 3' },
      {
        title: '报价异常',
        meta: '2 位达人报价超预算阈值',
        alert: 'AI 建议替换 1 位头部达人',
      },
    ],
  },
  {
    title: '内容质检',
    status: 'AI 初评',
    statusTone: 'violet',
    items: [
      { title: '待人工复核内容', meta: '低置信 7 条 ｜ 疑似硬广 4 条' },
      {
        title: '可投广候选内容',
        meta: '已识别 6 条 ｜ 目标 20 条',
        alert: '可投广内容不足，建议强化 Brief',
      },
    ],
  },
]

interface ModuleSpec {
  title: string
  status: string
  statusTone: 'blue' | 'mint' | 'amber' | 'violet' | 'rose'
  items: { title: string; meta: string; alert?: string }[]
}

export default function ProposalDashboardCard() {
  const max = FUNNEL[0].value
  return (
    <ChatFormCard delay={0.05}>
      <div className="flex flex-col gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          执行漏斗
        </div>
        <div className="flex flex-col gap-1">
          {FUNNEL.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-[64px_minmax(0,1fr)_56px] items-center gap-2 text-[12px]"
            >
              <span className="truncate text-[var(--color-ink)]/55">
                {f.label}
              </span>
              <div className="relative h-2 rounded-full bg-[var(--color-surface-0)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--color-ink)]/55 to-[var(--color-ink)]"
                  style={{ width: `${(f.value / max) * 100}%` }}
                />
              </div>
              <span className="text-right font-semibold tabular-nums text-[var(--color-ink)]">
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-[13px] font-medium text-[var(--color-ink)]/85">
          执行模块
        </div>
        <div className="flex flex-col gap-1.5">
          {MODULES.map((m) => (
            <ModuleRow key={m.title} module={m} />
          ))}
        </div>
      </div>
    </ChatFormCard>
  )
}

function ModuleRow({ module: m }: { module: ModuleSpec }) {
  const toneMap: Record<string, string> = {
    blue: 'bg-[#eef4ff] text-[#155eef] dark:bg-blue-500/15 dark:text-blue-200',
    mint: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  }
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-[var(--color-surface-0)] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-medium text-[var(--color-ink)]">
          {m.title}
        </span>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${toneMap[m.statusTone]}`}
        >
          {m.status}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {m.items.map((it) => (
          <div
            key={it.title}
            className="flex flex-col gap-0.5 rounded-md bg-[var(--fill-subtle)] px-2.5 py-1.5"
          >
            <span className="text-[12px] font-medium text-[var(--color-ink)]/85">
              {it.title}
            </span>
            <span className="text-[11px] text-[var(--color-ink)]/55">
              {it.meta}
            </span>
            {it.alert && (
              <span className="mt-0.5 inline-flex items-center rounded bg-amber-500/10 px-1.5 py-0.5 text-[10.5px] font-medium text-amber-700 dark:text-amber-300">
                {it.alert}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export const PROPOSAL_FUNNEL = FUNNEL
export const PROPOSAL_MODULES = MODULES
