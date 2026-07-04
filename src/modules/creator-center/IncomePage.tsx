import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, CircleHelp, Eye, LayoutGrid, Menu, Search } from '@/shared/icons'
import { fmtYuan, useCreatorIncome, type IncomePoint, type StatsRange } from './api'

const BLUE = '#4E83FD'

/* ─── 收入趋势图（来源拆分 tooltip） ─── */

const SOURCE_LABELS: { key: keyof IncomePoint; label: string }[] = [
  { key: 'xingtu', label: '星图任务' },
  { key: 'miniapp', label: '小程序推广计划' },
  { key: 'music', label: '音乐推广计划' },
]

function IncomeTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { payload: IncomePoint }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="w-[184px] rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
      <div className="text-[12px] font-semibold text-[#252632]">{label}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[12px]">
        <i className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE }} />
        <span className="text-[#252632]/70">收入金额</span>
        <span className="ml-auto font-semibold text-[#252632]">¥{p.total.toFixed(2)}</span>
      </div>
      <div className="mt-1 space-y-0.5 pl-3 text-[11px] text-[#252632]/55">
        {SOURCE_LABELS.map((s) => (
          <div key={s.key} className="flex justify-between">
            <span>{s.label}</span>
            <span>¥{(p[s.key] as number).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function IncomeChart({ data }: { data: IncomePoint[] }) {
  return (
    <div className="h-[260px] w-full rounded-xl bg-[#FAFBFC] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="income-trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity={0.22} />
              <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E9EBEF" strokeDasharray="4 4" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(37,38,50,0.45)' }} dy={6} />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={52}
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: 'rgba(37,38,50,0.45)' }}
            tickFormatter={(v: number) => (v >= 10000 ? `${(v / 10000).toFixed(1)}w` : String(v))}
          />
          <Tooltip content={<IncomeTooltip />} cursor={{ stroke: '#D3D8DF', strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={BLUE}
            strokeWidth={2}
            fill="url(#income-trend)"
            activeDot={{ r: 4, fill: '#fff', stroke: BLUE, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── 变现广场（营销任务卡，静态 UI 配置） ─── */

interface PlazaTask {
  brand: string
  tint: string
  title: string
  desc: string
  price: string
  tags: string[]
}

const PLAZA_TABS = ['我可投稿 (99+)', '我可报名 (20)', '好物测评 (50)'] as const
const PLAZA_FILTERS = ['高收益', '保底收入', '合作过'] as const

const PLAZA_TASKS: PlazaTask[] = [
  { brand: '1860G', tint: '#1F1B16', title: '1860G 手游新服预约投稿', desc: '游戏实况/攻略向视频均可参与', price: 'CPS 分佣 70%', tags: ['高收益'] },
  { brand: '交', tint: '#FE2C55', title: '视频交友 · 春夏拉新计划', desc: '剧情/生活向内容植入', price: '¥ 320/条 起', tags: ['保底收入'] },
  { brand: '脉', tint: '#1E6FFF', title: '脉 · 职场人故事征集', desc: '职场经验分享类图文与视频', price: '¥ 200/条 + 流量激励', tags: ['保底收入', '合作过'] },
  { brand: '茶', tint: '#00A550', title: '春日新茶饮探店挑战', desc: '到店探店 + 挂购物车', price: 'CPS 分佣 55%', tags: ['高收益', '合作过'] },
  { brand: '书', tint: '#8A5CF6', title: '全民好书计划 · 读书季', desc: '好书推荐/读书感悟向内容', price: '¥ 150/条 起', tags: [] },
  { brand: '云', tint: '#F5B60D', title: '云旅行 · 城市漫游投稿', desc: '城市风光/漫游 vlog', price: 'CPS 分佣 60%', tags: ['高收益'] },
]

function PlazaCard({ task }: { task: PlazaTask }) {
  return (
    <button
      type="button"
      onClick={() => toast(`「${task.title}」报名成功（演示）`)}
      className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(0,0,0,0.07)]"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold text-white"
          style={{ background: task.tint }}
        >
          {task.brand.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-[#252632]">{task.title}</div>
          <div className="mt-0.5 truncate text-[12px] text-[#252632]/50">{task.desc}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] font-semibold text-[#FE2C55]">{task.price}</span>
        <span className="ml-auto flex gap-1">
          {task.tags.map((t) => (
            <span key={t} className="rounded bg-[#EDF3FF] px-1.5 py-0.5 text-[10px] text-[#4E83FD]">
              {t}
            </span>
          ))}
        </span>
      </div>
    </button>
  )
}

/* ─── 页面 ─── */

const METRIC_TABS: { key: string; label: string; range: StatsRange | null }[] = [
  { key: 'yesterday', label: '昨日收入', range: 'yesterday' },
  { key: 'last7', label: '近7日收入', range: 'week' },
  { key: 'last30', label: '近30日收入', range: 'month' },
  { key: 'withdrawable', label: '可提现', range: null },
]

export default function IncomePage() {
  const [range, setRange] = useState<StatsRange>('week')
  const [activeTab, setActiveTab] = useState('last7')
  const { data, error } = useCreatorIncome(range)
  const [plazaTab, setPlazaTab] = useState<string>(PLAZA_TABS[0])
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const plazaList = useMemo(
    () =>
      PLAZA_TASKS.filter((t) => (filter ? t.tags.includes(filter) : true)).filter((t) =>
        search ? t.title.includes(search) || t.brand.includes(search) : true,
      ),
    [filter, search],
  )

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="space-y-4 px-8 py-6">
        {/* 我的变现 */}
        <section className="rounded-[20px] bg-white p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-semibold text-[#252632]">我的变现</h2>
            <Eye size={14} className="text-[#252632]/35" />
            <span className="text-[12px] text-[#252632]/40">
              更新时间: {data?.updatedAt ?? '…'}
            </span>
            <button
              type="button"
              onClick={() => toast('变现设置（演示）')}
              className="ml-auto flex items-center gap-1 text-[12px] text-[#252632]/55 hover:text-[#252632]"
            >
              变现设置 <ChevronDown size={13} />
            </button>
          </div>

          {!data ? (
            <div className="mt-4 space-y-3">
              <div className="h-[76px] animate-pulse rounded-xl bg-black/[0.04]" />
              <div className="h-[260px] animate-pulse rounded-xl bg-black/[0.04]" />
              {error && <div className="text-center text-[13px] text-[#252632]/45">数据加载失败（{error}）</div>}
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-xl border border-black/5">
                {METRIC_TABS.map((t) => {
                  const value =
                    t.key === 'yesterday'
                      ? data.summary.yesterday
                      : t.key === 'last7'
                        ? data.summary.last7
                        : t.key === 'last30'
                          ? data.summary.last30
                          : data.summary.withdrawable
                  const active = activeTab === t.key
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(t.key)
                        if (t.range) setRange(t.range)
                      }}
                      className={`relative flex flex-col gap-1 border-r border-black/5 px-4 py-3.5 text-left last:border-r-0 ${
                        active ? 'bg-white' : 'bg-[#FAFBFC] hover:bg-white'
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[12px] text-[#252632]/50">
                        {t.label}
                        <CircleHelp size={11} className="text-[#252632]/25" />
                      </span>
                      <span className="flex items-baseline gap-2 text-[20px] font-semibold text-[#252632]">
                        {fmtYuan(value)}
                        {t.key === 'withdrawable' && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation()
                              toast('提现申请已提交（演示）')
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && toast('提现申请已提交（演示）')}
                            className="cursor-pointer text-[12px] font-normal text-[#4E83FD] hover:opacity-80"
                          >
                            去提现 ›
                          </span>
                        )}
                      </span>
                      {active && <i className="absolute inset-x-0 top-0 h-0.5 bg-[#252632]" />}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4">
                <IncomeChart data={data.trend} />
              </div>
            </>
          )}
        </section>

        {/* 商单任务进行中 */}
        <section className="rounded-[20px] bg-white p-6">
          <div className="flex items-center">
            <h3 className="text-[16px] font-semibold text-[#252632]">
              商单任务进行中（{data?.tasksInProgress ?? '…'}）
            </h3>
            <button
              type="button"
              onClick={() => toast('全部任务（演示）')}
              className="ml-auto flex items-center gap-0.5 text-[12px] text-[#252632]/45 hover:text-[#252632]"
            >
              全部任务 <ChevronRight size={13} />
            </button>
          </div>
          {data && (
            <div className="mt-4 flex items-center gap-4">
              <img
                src={data.featuredTask.cover}
                alt=""
                className="h-[64px] w-[64px] shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-[#252632]">{data.featuredTask.title}</span>
                  <span className="shrink-0 rounded border border-black/10 px-1.5 py-0.5 text-[10px] text-[#252632]/55">
                    {data.featuredTask.deadlineTag}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[12px] text-[#252632]/50">
                  <span>🏷 {data.featuredTask.brand}</span>
                  <span>{data.featuredTask.category}</span>
                  <span>截止日期：{data.featuredTask.deadline}</span>
                </div>
              </div>
              <div className="shrink-0 px-4">
                <div className="text-[18px] font-semibold text-[#252632]">{data.featuredTask.commission}</div>
                <div className="mt-0.5 text-[11px] text-[#252632]/45">{data.featuredTask.commissionNote}</div>
              </div>
              <div className="shrink-0 px-4">
                <div className="text-[18px] font-semibold text-[#252632]">{data.featuredTask.budget}</div>
                <div className="mt-0.5 text-[11px] text-[#252632]/45">{data.featuredTask.budgetNote}</div>
              </div>
              <button
                type="button"
                onClick={() => toast('任务详情（演示）')}
                className="shrink-0 rounded-lg bg-[#F2F3F5] px-4 py-2 text-[13px] font-medium text-[#252632] hover:bg-[#EBEDF0]"
              >
                查看详情
              </button>
            </div>
          )}
        </section>

        {/* 变现广场 */}
        <section className="rounded-[20px] bg-white p-6">
          <h3 className="text-[16px] font-semibold text-[#252632]">变现广场</h3>
          <div className="mt-4 flex items-center gap-2">
            {PLAZA_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPlazaTab(t)}
                className={`h-8 rounded-lg px-3 text-[13px] transition-colors ${
                  plazaTab === t ? 'bg-[#161823] font-medium text-white' : 'bg-[#F5F6F8] text-[#252632]/55 hover:bg-black/5'
                }`}
              >
                {t}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3 text-[12px]">
              {PLAZA_FILTERS.map((f, i) => (
                <span key={f} className="flex items-center gap-3">
                  {i > 0 && <i className="h-3 w-px bg-black/10" />}
                  <button
                    type="button"
                    onClick={() => setFilter((cur) => (cur === f ? null : f))}
                    className={filter === f ? 'font-semibold text-[#252632]' : 'text-[#252632]/50 hover:text-[#252632]'}
                  >
                    {f}
                  </button>
                </span>
              ))}
              <button type="button" className="flex items-center gap-0.5 text-[#252632]/50 hover:text-[#252632]">
                更多筛选 <ChevronDown size={13} />
              </button>
            </div>
            <label className="flex h-8 items-center gap-1.5 rounded-lg border border-black/10 px-2.5">
              <Search size={13} className="text-[#252632]/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="请输入任务名称/任务ID"
                className="w-36 bg-transparent text-[12px] text-[#252632] outline-none placeholder:text-[#252632]/35"
              />
            </label>
            <div className="flex items-center gap-1 text-[#252632]/35">
              <LayoutGrid size={15} className="text-[#252632]" />
              <Menu size={15} />
            </div>
          </div>

          {plazaTab !== PLAZA_TABS[0] ? (
            <div className="py-16 text-center text-[13px] text-[#252632]/40">
              {plazaTab.startsWith('我可报名') ? '报名类任务即将开放' : '好物测评任务即将开放'}
            </div>
          ) : plazaList.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[#252632]/40">没有符合条件的任务</div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {plazaList.map((t) => (
                <PlazaCard key={t.title} task={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
