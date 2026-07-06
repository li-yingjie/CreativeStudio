import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Download,
} from '@/shared/icons'
import type { LucideIcon } from '@/shared/icons'
import { useLiveMgmt } from './live-store'
import {
  fmtCount,
  fmtYuan,
  useCreatorStats,
  useHomeOverview,
  type CreatorStats,
  type StatsRange,
  type TrendPoint,
} from './api'
import {
  CREATOR_PROFILE,
  PUBLISH_ENTRIES,
  PUBLISH_ICON,
  SIDE_MENU,
  SMART_CREATE_ENTRIES,
  type ProductId,
} from './data'
import ActivityPage from './ActivityPage'
import CollabPage from './CollabPage'
import ContentPage from './ContentPage'
import CopyrightPage from './CopyrightPage'
import DouyinIndexPage from './DouyinIndexPage'
import IncomePage from './IncomePage'
import LivePage from './LivePage'
import MaskIcon from './MaskIcon'
import PublishVideoPage from './PublishVideoPage'
import { ActivityCenterCard, HomeFooter, InteractionSection, MonetizationSection, QuickNavCard } from './HomeSections'
import { OverviewRadar, SimpleAreaChart, TrendAreaChart } from './HomeCharts'

const RANGE_LABELS: { value: StatsRange; label: string }[] = [
  { value: 'yesterday', label: '昨天' },
  { value: 'week', label: '近7天' },
  { value: 'month', label: '近30天' },
]

/** 时间范围切换 — 受控，切换会触发面板重新向 /api/creator/stats 查询。 */
function RangeSwitch({ value, onChange }: { value: StatsRange; onChange: (r: StatsRange) => void }) {
  return (
    <div className="flex items-center rounded-lg bg-[#F2F3F5] p-0.5 text-[12px]">
      {RANGE_LABELS.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`rounded-md px-3 py-1 transition-colors ${
            value === r.value ? 'bg-white font-medium text-[#252632] shadow-sm' : 'text-[#252632]/55 hover:text-[#252632]'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

function PanelHeader({ title, period, extra }: { title: string; period?: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-[16px] font-semibold text-[#252632]">{title}</h3>
      <CircleHelp size={14} className="text-[#252632]/30" />
      {period && <span className="text-[12px] text-[#252632]/40">{period}</span>}
      <div className="ml-auto flex items-center gap-2">{extra}</div>
    </div>
  )
}

const periodText = (d: CreatorStats | null) =>
  d ? `统计周期: ${d.period.start} 至 ${d.period.end}（每日12点更新前一日数据）` : undefined

/** 加载骨架 / 错误占位。 */
function PanelFallback({ error, height }: { error: string | null; height: number }) {
  if (error) {
    return (
      <div className="flex items-center justify-center text-[13px] text-[#252632]/45" style={{ height }}>
        数据加载失败（{error}），请刷新重试
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 py-4" style={{ height }}>
      <div className="h-5 w-1/3 animate-pulse rounded bg-black/5" />
      <div className="flex-1 animate-pulse rounded-xl bg-black/[0.04]" />
    </div>
  )
}

/* ─── 左侧栏 ─── */

interface SideMenuItem {
  key: string
  label: string
  icon?: string
  lucide?: LucideIcon
  children?: string[]
}

function SideNav({ active, onSelect }: { active: string; onSelect: (key: string) => void }) {
  const [serviceOpen, setServiceOpen] = useState(true)
  const liveEnabled = useLiveMgmt((s) => s.enabled)
  // 直播管理是权限菜单，开启时插在「内容」上方
  const menu: SideMenuItem[] = []
  for (const m of SIDE_MENU as SideMenuItem[]) {
    if (m.key === 'content' && liveEnabled) menu.push({ key: 'live', label: '直播管理', icon: '/icons/zhibo.svg' })
    menu.push(m)
  }
  return (
    // <lg 收缩为「只有 icon」的窄导航（icon rail），≥lg 展开为完整侧栏
    <aside className="flex w-14 shrink-0 flex-col gap-1 border-r border-black/5 bg-white px-2 pt-4 lg:w-[176px] lg:px-3">
      <button
        type="button"
        title="发布"
        onClick={() => onSelect('publish-video')}
        className="mb-2 flex h-10 items-center justify-center rounded-xl bg-[#161823] px-0 text-[14px] font-medium text-white hover:bg-[#161823]/90 lg:justify-between lg:px-4"
      >
        <span className="flex items-center gap-2">
          <MaskIcon url={PUBLISH_ICON} size={15} />
          <span className="hidden lg:inline">发布</span>
        </span>
        <ChevronDown size={15} className="hidden lg:block" />
      </button>
      {menu.map((m) => {
        // 收缩态下父项在其子页高亮，方便看出当前所在模块
        const isActive = active === m.key || (Boolean(m.children) && active.startsWith(`service:`))
        const hasChildren = Boolean(m.children)
        return (
          <div key={m.key}>
            <button
              type="button"
              title={m.label}
              onClick={() => (hasChildren ? setServiceOpen((v) => !v) : onSelect(m.key))}
              className={`flex h-9 w-full items-center justify-center gap-2.5 rounded-lg px-3 text-[13px] transition-colors lg:justify-start ${
                isActive
                  ? 'bg-black/5 font-medium text-[#252632]'
                  : 'font-normal text-[#252632]/45 hover:bg-black/[0.03] hover:text-[#252632]/70'
              }`}
            >
              {/* icon 跟随文字色：选中深色 #252632，未选中灰（svg 填充已统一无透明度） */}
              {m.lucide ? <m.lucide size={15} strokeWidth={1.8} /> : <MaskIcon url={m.icon!} size={15} />}
              <span className="hidden lg:inline">{m.label}</span>
              {hasChildren &&
                (serviceOpen ? (
                  <ChevronUp size={13} className="ml-auto hidden text-[#252632]/40 lg:block" />
                ) : (
                  <ChevronDown size={13} className="ml-auto hidden text-[#252632]/40 lg:block" />
                ))}
            </button>
            {/* 子菜单为缩进文字，窄栏放不下 —— 仅在 ≥lg 展示 */}
            {hasChildren && serviceOpen && (
              <div className="mt-0.5 hidden space-y-0.5 lg:block">
                {m.children!.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onSelect(`service:${c}`)}
                    className={`flex h-8 w-full items-center rounded-lg pl-[38px] text-[13px] transition-colors ${
                      active === `service:${c}`
                        ? 'bg-black/5 text-[#252632]'
                        : 'text-[#252632]/45 hover:bg-black/[0.03] hover:text-[#252632]/75'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}

/* ─── 资料头（粉丝/获赞来自接口） ─── */

function ProfileHeader({ stats }: { stats: CreatorStats | null }) {
  const p = CREATOR_PROFILE
  const nums = stats
    ? [
        { label: '关注', value: String(stats.profile.follow) },
        { label: '粉丝', value: fmtCount(stats.profile.fansTotal) },
        { label: '获赞', value: fmtCount(stats.profile.likesTotal) },
      ]
    : null
  return (
    <div className="flex items-start gap-4">
      <img src={p.avatar} alt={p.name} className="h-[72px] w-[72px] rounded-full object-cover ring-2 ring-white" />
      <div className="min-w-0 pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold text-[#252632]">{p.name}</h2>
          <span className="flex items-center gap-1 rounded-full bg-[#FFF6DC] px-2 py-0.5 text-[11px] text-[#B57A00]">
            ✔ {p.badge}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#252632]/50">
          <span className="text-[#4E83FD]">{p.authorize}</span>
          <span>{p.mcn}</span>
          <span>{p.douyinId}</span>
          <span className="truncate">{p.signature}</span>
        </div>
        <div className="mt-2 flex items-center gap-5 text-[13px]">
          {nums
            ? nums.map((s) => (
                <span key={s.label} className="text-[#252632]/55">
                  {s.label} <b className="ml-0.5 font-semibold text-[#252632]">{s.value}</b>
                </span>
              ))
            : <span className="h-4 w-48 animate-pulse rounded bg-black/5" />}
        </div>
      </div>
    </div>
  )
}

/* ─── 入口卡 ─── */

/** 入口卡（设计稿 947-41110/947-41212）：图标以「贴纸」构图悬出卡片左上角
 *  （绝对定位 77×84，顶部超出约 6px，正面卡与卡片精确等高贴齐），文字从 86px 起排。
 *  whileHover 变体向下传播，驱动 CardImageIcon 的后卡扇开。 */
function EntryCard({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  onClick?: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      animate="rest"
      whileHover="spread"
      className="relative h-[75px] rounded-2xl border-[0.5px] border-black/5 bg-white py-[16px] pl-[86px] pr-3 text-left shadow-[0_7px_8px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_10px_16px_rgba(0,0,0,0.08)]"
    >
      <span className="pointer-events-none absolute -left-px -top-1.5 z-[1] h-[84px] w-[77px]">{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold text-[#252632]">{label}</div>
        <div className="mt-1 truncate text-[12px] text-[#252632]/50">{desc}</div>
      </div>
    </motion.button>
  )
}

/** 入口卡图标：正卡（front，设计稿导出的 4x 贴纸）在左，后卡与正卡等大、在右后方
 *  斜置探出（有 back 图则铺图，否则用中性浅色底板——对应设计里作品发布/工坊的白底后卡）。
 *  hover 时后卡以左下角为圆心再向右轻扇（spring 回弹）。 */
function CardImageIcon({ front, back }: { front: string; back?: string }) {
  return (
    <span className="relative block h-full w-full">
      {/* 后卡：与正卡等大，右后方斜置探出 */}
      <motion.span
        className="pointer-events-none absolute left-[14%] top-[1%] h-[95%] w-[83%] overflow-hidden rounded-[13px] border border-white/80 bg-gradient-to-b from-[#f2f3f5] to-[#e0e3e9] shadow-[0_5px_10px_rgba(0,0,0,0.12)]"
        style={{ transformOrigin: '0% 100%' }}
        variants={{ rest: { rotate: 9 }, spread: { rotate: 13 } }}
        transition={{ type: 'spring', stiffness: 320, damping: 17 }}
      >
        {back && <img src={back} alt="" className="h-full w-full object-cover" />}
      </motion.span>
      {/* 正卡在左，压住后卡 */}
      <img src={front} alt="" className="pointer-events-none absolute left-[-3%] top-0 w-[86%]" />
    </span>
  )
}

/* ─── 数据总览 ─── */

/** 各维度在贡献榜里的 value 文案。 */
function dimWorkValue(dimKey: string, days: number, value: number | string): { label: string; text: string } {
  const prefix = days === 1 ? '昨日' : `${days}日`
  switch (dimKey) {
    case 'plays':
      return { label: `${prefix}新增播放量`, text: fmtCount(Number(value)) }
    case 'finishRate':
      return { label: '完播率', text: `${value}%` }
    case 'fansNet':
      return { label: `${prefix}涨粉贡献`, text: fmtCount(Number(value)) }
    case 'works':
      return { label: '发布于', text: String(value) }
    default:
      return { label: '互动率', text: `${value}%` }
  }
}

/** 分析结论：按百分位分档。 */
const dimVerdict = (pct: number) =>
  pct >= 70
    ? '表现优于大多数同类创作者，保持当前创作节奏'
    : pct >= 40
      ? '与同类作者水平相当，可在选题和封面上尝试差异化'
      : '低于多数同类作者，建议重点优化这一指标'

function OverviewSection() {
  const [range, setRange] = useState<StatsRange>('week')
  const [dimIdx, setDimIdx] = useState(0)
  const { data, error } = useCreatorStats(range)
  const dim = data?.overview.dims[dimIdx]
  const days = data?.period.days ?? 7
  return (
    <section className="rounded-[20px] bg-white p-5">
      <PanelHeader title="数据总览" period={periodText(data)} extra={<RangeSwitch value={range} onChange={setRange} />} />
      {!data || !dim ? (
        <PanelFallback error={error} height={340} />
      ) : (
        <div className="mt-4 grid grid-cols-[minmax(0,460px)_1fr] gap-8">
          <OverviewRadar dims={data.overview.dims} active={dimIdx} onSelect={setDimIdx} />
          <div className="min-w-0">
            <h4 className="text-[14px] font-semibold text-[#252632]">{dim.label}分析</h4>
            <p className="mt-2 rounded-xl bg-[#F7F8FA] p-4 text-[13px] leading-6 text-[#252632]/70">
              {days}日{dim.label}{' '}
              <b className="text-[#252632]">
                {typeof dim.display === 'number' ? fmtCount(dim.display) : dim.display}
                {dim.valueKind === 'date' ? ' 个' : ''}
              </b>
              ，同类作者中位数为{' '}
              <b className="text-[#252632]">
                {dim.valueKind === 'rate' ? `${dim.peerMedian}%` : fmtCount(dim.peerMedian)}
                {dim.valueKind === 'date' ? ' 个' : ''}
              </b>
              ，高于 <b className="text-[#252632]">{dim.percentile}%</b> 的同类创作者，
              {dimVerdict(dim.percentile)}
            </p>
            <div className="mt-4 flex items-center">
              <h4 className="text-[14px] font-semibold text-[#252632]">
                {dim.key === 'works' ? '本期发布作品' : `${dim.label}贡献TOP3`}
              </h4>
              <button type="button" className="ml-auto text-[12px] text-[#4E83FD] hover:opacity-80">
                查看所有作品 ›
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {dim.topWorks.length === 0 && (
                <div className="rounded-xl bg-[#F7F8FA] px-3 py-4 text-center text-[12px] text-[#252632]/40">
                  本期暂无新发布作品
                </div>
              )}
              {dim.topWorks.map((w, i) => {
                const v = dimWorkValue(dim.key, days, w.value)
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-black/[0.02]">
                    <img src={w.cover} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-[#252632]">{w.title}</span>
                    <span className="shrink-0 text-[12px] text-[#252632]/45">
                      {v.label} <b className="ml-1 font-semibold text-[#252632]">{v.text}</b>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* ─── 作品数据 ─── */

interface MetricDef {
  label: string
  dataKey: keyof TrendPoint
  value: (d: CreatorStats) => string
  info?: boolean
  rich?: boolean
}

const WORKS_METRIC_DEFS: MetricDef[] = [
  { label: '总播放量', dataKey: 'plays', value: (d) => fmtCount(d.works.metrics.plays), info: true, rich: true },
  { label: '发布作品', dataKey: 'published', value: (d) => String(d.works.metrics.published), info: true },
  { label: '主页访问', dataKey: 'homeVisits', value: (d) => fmtCount(d.works.metrics.homeVisits) },
  { label: '作品点赞', dataKey: 'likes', value: (d) => fmtCount(d.works.metrics.likes) },
  { label: '作品分享', dataKey: 'shares', value: (d) => fmtCount(d.works.metrics.shares) },
  { label: '作品评论', dataKey: 'comments', value: (d) => fmtCount(d.works.metrics.comments) },
  { label: '平均播放时长', dataKey: 'avgPlaySeconds', value: (d) => `${d.works.metrics.avgPlaySeconds}秒` },
  { label: '5S 完播率', dataKey: 'finish5s', value: (d) => `${d.works.metrics.finish5s}%` },
]

const FANS_METRIC_DEFS: MetricDef[] = [
  { label: '总粉丝量', dataKey: 'fansTotal', value: (d) => fmtCount(d.fans.metrics.total) },
  { label: '粉丝净增', dataKey: 'fansNet', value: (d) => fmtCount(d.fans.metrics.net), info: true },
  { label: '吸粉量', dataKey: 'fansNew', value: (d) => fmtCount(d.fans.metrics.gained) },
  { label: '脱粉量', dataKey: 'fansLost', value: (d) => fmtCount(d.fans.metrics.lost) },
  { label: '回访粉丝量', dataKey: 'fansReturn', value: (d) => fmtCount(d.fans.metrics.returned) },
]

function MetricTabs({
  defs,
  data,
  active,
  onSelect,
  cols,
}: {
  defs: MetricDef[]
  data: CreatorStats
  active: number
  onSelect: (i: number) => void
  cols: number
}) {
  return (
    <div className="grid overflow-hidden rounded-xl border border-black/5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {defs.map((m, i) => (
        <button
          key={m.label}
          type="button"
          onClick={() => onSelect(i)}
          className={`relative flex flex-col gap-1 border-r border-black/5 px-4 py-3 text-left last:border-r-0 ${
            active === i ? 'bg-white' : 'bg-[#FAFBFC] hover:bg-white'
          }`}
        >
          <span className="flex items-center gap-1 text-[12px] text-[#252632]/50">
            {m.label}
            {m.info && <CircleHelp size={11} className="text-[#252632]/25" />}
          </span>
          <span className="text-[18px] font-semibold text-[#252632]">{m.value(data)}</span>
          {active === i && <i className="absolute inset-x-0 bottom-0 h-0.5 bg-[#252632]" />}
        </button>
      ))}
    </div>
  )
}

function ExportButton() {
  return (
    <button
      type="button"
      className="flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1 text-[12px] text-[#252632]/70 hover:bg-black/[0.03]"
    >
      <Download size={13} /> 导出数据
    </button>
  )
}

function WorksSection() {
  const [range, setRange] = useState<StatsRange>('week')
  const [tab, setTab] = useState('投稿')
  const [metric, setMetric] = useState(0)
  const { data, error } = useCreatorStats(range)
  const def = WORKS_METRIC_DEFS[metric]
  return (
    <section className="rounded-[20px] bg-white p-5">
      <PanelHeader
        title="作品数据"
        period={periodText(data)}
        extra={
          <>
            <RangeSwitch value={range} onChange={setRange} />
            <ExportButton />
          </>
        }
      />
      <div className="mt-3 flex gap-5 border-b border-black/5 text-[13px]">
        {['投稿', '合集', '直播'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 transition-colors ${
              tab === t
                ? 'border-[#252632] font-medium text-[#252632]'
                : 'border-transparent text-[#252632]/45 hover:text-[#252632]/75'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {!data ? (
        <PanelFallback error={error} height={330} />
      ) : (
        <>
          <div className="mt-3">
            <MetricTabs defs={WORKS_METRIC_DEFS} data={data} active={metric} onSelect={setMetric} cols={8} />
          </div>
          <div className="mt-4">
            <TrendAreaChart
              data={data.works.trend}
              dataKey={def.dataKey}
              name={def.label}
              id="works-trend"
              rich={def.rich}
            />
          </div>
        </>
      )}
    </section>
  )
}

function FansSection() {
  const [range, setRange] = useState<StatsRange>('week')
  const [metric, setMetric] = useState(1)
  const { data, error } = useCreatorStats(range)
  const def = FANS_METRIC_DEFS[metric]
  return (
    <section className="rounded-[20px] bg-white p-5">
      <PanelHeader
        title="粉丝数据"
        period={periodText(data)}
        extra={
          <>
            <RangeSwitch value={range} onChange={setRange} />
            <ExportButton />
          </>
        }
      />
      {!data ? (
        <PanelFallback error={error} height={330} />
      ) : (
        <>
          <div className="mt-3">
            <MetricTabs defs={FANS_METRIC_DEFS} data={data} active={metric} onSelect={setMetric} cols={5} />
          </div>
          <div className="mt-4">
            <TrendAreaChart data={data.fans.trend} dataKey={def.dataKey} name={def.label} id="fans-trend" />
          </div>
        </>
      )}
    </section>
  )
}

/* ─── 首页「数据概览」板块（最新作品 + 账号总览/直播趋势 + 8 指标） ─── */

/** 带符号的紧凑格式化（涨红跌绿由调用处控制颜色）。 */
function fmtDelta(delta: number, type: 'count' | 'yuan') {
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : ''
  const abs = Math.abs(delta)
  return `${sign}${type === 'yuan' ? abs.toFixed(0) : fmtCount(abs)}`
}

function DataOverviewSection({ onViewDetail }: { onViewDetail: () => void }) {
  const { data, error } = useHomeOverview()
  const [tab, setTab] = useState<'account' | 'live'>('account')
  const trend = tab === 'account' ? data?.accountTrend : data?.liveTrend
  return (
    <section className="rounded-[20px] bg-white p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-[18px] font-semibold text-[#252632]">数据概览</h2>
        <CircleHelp size={14} className="text-[#252632]/30" />
        {data && <span className="text-[12px] text-[#252632]/40">更新时间: {data.updatedAt}</span>}
        <button type="button" onClick={onViewDetail} className="ml-auto flex items-center text-[12px] text-[#4E83FD] hover:opacity-80">
          查看详情 <ChevronRight size={13} />
        </button>
      </div>

      {!data ? (
        <PanelFallback error={error} height={320} />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* 最新作品 */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#252632]">最新作品</h3>
            {/* 堆叠（<lg）时限宽，避免竖版封面撑满整行 */}
            <div className="relative mt-3 aspect-[3/4] max-w-[260px] overflow-hidden rounded-2xl">
              <img src={data.latestWork.cover} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 top-0 flex flex-col gap-1 bg-gradient-to-b from-black/50 to-transparent p-3 text-white">
                <span className="text-[12px]">{data.latestWork.duration}</span>
                <span className="line-clamp-1 text-[13px] font-medium">{data.latestWork.title}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                <div className="flex items-center justify-between text-[12px]"><span className="opacity-80">播放量</span><b className="font-semibold">{fmtCount(data.latestWork.plays)}</b></div>
                <div className="flex items-center justify-between text-[12px]"><span className="opacity-80">点赞量</span><b className="font-semibold">{data.latestWork.likes}</b></div>
              </div>
            </div>
          </div>

          {/* 账号总览 / 直播数据 */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-y-2">
              <div className="flex gap-5 text-[14px]">
                {([['account', '账号总览'], ['live', '直播数据']] as const).map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setTab(k)}
                    className={`-mb-px whitespace-nowrap border-b-2 pb-2 transition-colors ${tab === k ? 'border-[#FE2C55] font-medium text-[#252632]' : 'border-transparent text-[#252632]/45 hover:text-[#252632]/75'}`}>{l}</button>
                ))}
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#F2F3F5] px-3 py-1.5 text-[12px] text-[#252632]/60">
                时间 近7天 <ChevronDown size={12} />
              </div>
            </div>
            <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-[#252632]/55">
              <i className="h-1.5 w-1.5 rounded-full bg-[#4E83FD]" />播放量
            </div>
            {trend && <SimpleAreaChart data={trend} id={`home-${tab}`} height={190} />}
            {/* 8 指标 */}
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              {data.metrics.map((m) => (
                <div key={m.label}>
                  <div className="text-[12px] text-[#252632]/50">{m.label}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[20px] font-semibold text-[#252632]">
                      {m.type === 'yuan' ? fmtYuan(m.value) : fmtCount(m.value)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#252632]/40">
                    较前7日 <span className={m.delta >= 0 ? 'text-[#F53F3F]' : 'text-[#00B578]'}>{fmtDelta(m.delta, m.type)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* ─── 数据中心（原首页的数据总览 + 作品数据 + 粉丝数据） ─── */

function DataCenter() {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      {/* 无页面级大标题——与内容管理等页一致，标题由各卡片自带（数据总览…） */}
      <div className="space-y-4 px-8 py-6">
        <OverviewSection />
        <WorksSection />
        <FansSection />
      </div>
    </main>
  )
}

/* ─── 首页主体 ─── */

export default function CreatorCenterHome({
  onOpenProduct,
}: {
  onOpenProduct: (id: ProductId) => void
}) {
  // 左侧栏当前页：data=数据看板 content=内容管理 其余为建设中占位
  const [page, setPage] = useState('data')
  const liveEnabled = useLiveMgmt((s) => s.enabled)
  // 关闭直播管理开关后若正停在该页，回落到数据看板（渲染期派生）
  if (page === 'live' && !liveEnabled) setPage('data')
  // 资料头的粉丝/获赞用近7天档的响应（任意档都含 profile 快照）
  const { data: profileData } = useCreatorStats('week')
  // 首页新板块（互动/变现/活动/快速导航）共用一次 home-overview 拉取
  const { data: homeData } = useHomeOverview()

  return (
    <div className="flex h-full min-h-0 bg-[#F5F6F8]">
      <SideNav active={page} onSelect={setPage} />
      {/* 只有内容区做载入动画；侧栏等框架保持静止 */}
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-0 min-w-0 flex-1"
      >
      {page === 'publish-video' ? (
        <PublishVideoPage />
      ) : page === 'content' ? (
        <ContentPage />
      ) : page === 'live' ? (
        <LivePage />
      ) : page === 'datacenter' ? (
        <DataCenter />
      ) : page === 'income' ? (
        <IncomePage />
      ) : page === 'service:作品共创' ? (
        <CollabPage />
      ) : page === 'service:活动管理' ? (
        <ActivityPage />
      ) : page === 'service:原创保护' ? (
        <CopyrightPage />
      ) : page === 'service:抖音指数' ? (
        <DouyinIndexPage />
      ) : page !== 'data' ? (
        <main className="flex min-w-0 flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-[15px] font-medium text-[#252632]/70">
              {page.startsWith('service:') ? page.slice(8) : SIDE_MENU.find((m) => m.key === page)?.label}
            </div>
            <div className="mt-1 text-[13px] text-[#252632]/40">页面建设中，敬请期待</div>
          </div>
        </main>
      ) : (
      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* 顶部 ASCII 天空动画视频 + 淡蓝渐变遮罩（视频在后，遮罩把它向下淡出到页面底色，保证文字可读） */}
        <div className="relative overflow-hidden bg-[#F5F6F8]">
          <video
            className="pointer-events-none absolute inset-x-0 top-0 h-[300px] w-full object-cover"
            src="/bg/ascii-animation.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-[linear-gradient(180deg,rgba(226,238,247,0.08)_0%,rgba(230,239,247,0.4)_44%,rgba(243,245,248,0.9)_76%,#F5F6F8_100%)]" />
          <div className="relative px-8 pb-2 pt-6">
            <ProfileHeader stats={profileData} />

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* 智能创作 */}
              <section className="rounded-[20px] border border-[#f1f1f1] bg-gradient-to-b from-[rgba(251,251,251,0.9)] to-white p-4 backdrop-blur">
                <h3 className="px-1 pb-3 text-[16px] font-semibold text-[#252632]">智能创作</h3>
                <div className="grid grid-cols-2 gap-3">
                  {SMART_CREATE_ENTRIES.map((e) => (
                    <EntryCard
                      key={e.id}
                      icon={<CardImageIcon front={e.front} back={e.back} />}
                      label={e.label}
                      desc={e.desc}
                      onClick={() => onOpenProduct(e.id)}
                    />
                  ))}
                </div>
              </section>
              {/* 作品发布 */}
              <section className="rounded-[20px] border border-[#f1f1f1] bg-gradient-to-b from-[rgba(251,251,251,0.9)] to-white p-4 backdrop-blur">
                <h3 className="px-1 pb-3 text-[16px] font-semibold text-[#252632]">作品发布</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PUBLISH_ENTRIES.map((e) => (
                    <EntryCard
                      key={e.label}
                      icon={<CardImageIcon front={e.img} />}
                      label={e.label}
                      desc={e.desc}
                      // 目前仅「发布高清视频」有对应表单页，其余为占位
                      onClick={e.label === '发布高清视频' ? () => setPage('publish-video') : undefined}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="px-8 pb-6 pt-2">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_336px]">
            {/* 左主栏 */}
            <div className="min-w-0 space-y-4">
              <DataOverviewSection onViewDetail={() => setPage('datacenter')} />
              {homeData && <InteractionSection data={homeData.interaction} onMore={() => setPage('content')} />}
              {homeData && <MonetizationSection data={homeData.monetization} onMore={() => setPage('income')} />}
            </div>
            {/* 右侧栏 */}
            <div className="space-y-4">
              {homeData && <ActivityCenterCard data={homeData.calendar} onMore={() => setPage('service:活动管理')} />}
              {homeData && <QuickNavCard items={homeData.quickNav} onMore={() => setPage('service')} />}
            </div>
          </div>
          <HomeFooter />
        </div>
      </main>
      )}
      </motion.div>
    </div>
  )
}
