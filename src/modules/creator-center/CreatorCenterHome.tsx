import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Download,
} from '@/shared/icons'
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
  SIDE_MENU,
  SMART_CREATE_ENTRIES,
  type PublishEntryId,
  type ProductId,
} from './data'
import * as Popover from '@radix-ui/react-popover'
import SharedSideNav, { SideNavActionButton, type SideNavItem } from '@/shared/components/SideNav'
import AccountSwitcherPanel from './AccountSwitcher'
import FigmaGlyph from './FigmaGlyph'
import { SlideWideAddLinearIcon } from 'master-icon/react/SlideWideAddLinearIcon'
import { LiveStreaming01LinearIcon } from 'master-icon/react/LiveStreaming01LinearIcon'
import SideNavDisclosureIcon from '@/shared/components/SideNavDisclosureIcon'
import { SideNavCollapseFooterButton } from '@/shared/components/SideNavIconFooterActions'
import { ActivityCenterCard, HomeFooter, InteractionSection, MonetizationSection, QuickNavCard } from './HomeSections'
import {
  useNavVersion,
  usesSchemeFourLayout,
  usesContentToggleLayout,
  usesToolbarHeaderLayout,
} from '@/shared/storage/nav-version'
import { useProductSideNav } from '@/shared/storage/product-side-nav'
import AiAssistantPanel from '@/shared/components/AiAssistantPanel'
import { assistantContextFor } from './assistant-contexts'

const ActivityPage = lazy(() => import('./ActivityPage'))
const CollabPage = lazy(() => import('./CollabPage'))
const ContentPage = lazy(() => import('./ContentPage'))
const CopyrightPage = lazy(() => import('./CopyrightPage'))
const DouyinIndexPage = lazy(() => import('./DouyinIndexPage'))
const IncomePage = lazy(() => import('./IncomePage'))
const LivePage = lazy(() => import('./LivePage'))
const PublishVideoPage = lazy(() => import('./PublishVideoPage'))
const OverviewRadar = lazy(() =>
  import('./HomeCharts').then((module) => ({ default: module.OverviewRadar })),
)
const SimpleAreaChart = lazy(() =>
  import('./HomeCharts').then((module) => ({ default: module.SimpleAreaChart })),
)
const TrendAreaChart = lazy(() =>
  import('./HomeCharts').then((module) => ({ default: module.TrendAreaChart })),
)

function SectionLoader({ height = 240 }: { height?: number }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center text-[13px] text-[#252632]/45"
      style={{ minHeight: height }}
    >
      加载中…
    </div>
  )
}

const RANGE_LABELS: { value: StatsRange; label: string }[] = [
  { value: 'yesterday', label: '昨天' },
  { value: 'week', label: '近7天' },
  { value: 'month', label: '近30天' },
]

/** 时间范围切换 — 受控，切换会触发面板重新向 /api/creator/stats 查询。 */
function RangeSwitch({ value, onChange }: { value: StatsRange; onChange: (r: StatsRange) => void }) {
  return (
    <div role="group" aria-label="统计时间范围" className="flex items-center rounded-lg bg-[#F2F3F5] p-0.5 text-[12px]">
      {RANGE_LABELS.map((r) => (
        <button
          key={r.value}
          type="button"
          aria-pressed={value === r.value}
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

type SideMenuItem = SideNavItem

function isPublishPage(page: string) {
  return page.startsWith('publish-')
}

function publishPageKey(id: PublishEntryId) {
  return `publish-${id}`
}

function publishKindFromPage(page: string): PublishEntryId {
  if (page === 'publish-image') return 'image'
  if (page === 'publish-panorama') return 'panorama'
  if (page === 'publish-article') return 'article'
  return 'video'
}

function SideNav({ active, onSelect }: { active: string; onSelect: (key: string) => void }) {
  const liveEnabled = useLiveMgmt((s) => s.enabled)
  const version = useNavVersion((state) => state.version)
  const schemeFourLayout = usesSchemeFourLayout(version)
  // 与 AI 工坊同一轮廓框架：透明侧栏（设计稿 统一导航 250-37291），
  // 方案 2 不提供产品头与手动收起，方案 4 把入口放在产品头，
  // 方案 6 按约定首页不显示搜索工具栏，
  // 方案 1 放在外壳品牌头；
  // 方案 3 / 5 分别在底部保留文字版 / icon-only 入口。
  const storedCollapsed = useProductSideNav((state) => state.collapsed.home)
  // 方案 2 / 6 没有收起入口；方案 4 首页明确不提供收起（入口只在各产品自己的头里）。
  const contentToggleLayout = usesContentToggleLayout(version)
  const collapsed =
    usesToolbarHeaderLayout(version) ||
    version === 6 ||
    schemeFourLayout ||
    contentToggleLayout
      ? false
      : storedCollapsed
  const toggleCollapsed = useProductSideNav((state) => state.toggleCollapsed)
  // 直播管理是权限菜单，开启时插在「内容」上方
  const menu: SideMenuItem[] = []
  for (const m of SIDE_MENU as SideMenuItem[]) {
    if (m.key === 'content' && liveEnabled) menu.push({ key: 'live', label: '直播管理', Icon: LiveStreaming01LinearIcon })
    menu.push(m)
  }
  return (
    <SharedSideNav
      ariaLabel="创作者中心侧栏"
      chrome={version === 1 ? 'plain' : 'panel'}
      showDivider={version !== 1}
      collapsed={collapsed}
      resizable
      flushHeader={version === 1}
      items={menu}
      activeKey={active}
      onSelect={onSelect}
      header={
        /* 首页不放产品头 —— 它既不提供收起，也没有可写的业务文案，
           顶部直接就是「发布作品」。 */
        <div
          className={`px-[var(--sn-px)] pb-3 ${version === 1 ? '' : 'pt-3'}`}
        >
          <Popover.Root>
            <Popover.Trigger asChild>
              <SideNavActionButton
                aria-label="发布作品"
                variant={version === 1 ? 'light' : 'dark'}
                collapsed={collapsed}
                className={collapsed ? '' : 'justify-between'}
                style={
                  version === 1
                    ? { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.10)' }
                    : undefined
                }
              >
                <span className="flex items-center gap-[var(--sn-rgap)]">
                  <SlideWideAddLinearIcon size={16} />
                  {!collapsed && '发布作品'}
                </span>
                {!collapsed && <SideNavDisclosureIcon className="opacity-70" />}
              </SideNavActionButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="start"
                sideOffset={6}
                className="z-[80] w-[176px] rounded-xl border border-black/5 bg-white p-2 shadow-lg"
              >
                {PUBLISH_ENTRIES.map((e) => (
                  <Popover.Close asChild key={e.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(publishPageKey(e.id))}
                      className="flex h-8 w-full items-center rounded-lg px-2 text-[13px] text-[#252632]/70 hover:bg-black/[0.03] hover:text-[#252632]"
                    >
                      {e.label}
                    </button>
                  </Popover.Close>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      }
      footer={
        version === 3 ? (
          <div className="px-[var(--sn-px)] pb-3">
            <SideNavCollapseFooterButton
              collapsed={collapsed}
              onToggle={() => toggleCollapsed('home')}
            />
          </div>
        ) : undefined
      }
    />
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
    <div className="flex min-h-[80px] items-center gap-3">
      <img src={p.avatar} alt={p.name} className="size-[74px] rounded-full border border-[#E4E4E6] object-cover" />
      {/* 字段结构按设计稿 788-20834:昵称+三角chip、同行 抖音号|签名,下行 关注/粉丝/获赞 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <h2 className="text-[16px] font-semibold leading-6 text-[#252632]">{p.name}</h2>
            {/* 昵称下拉 — 账号切换（设计稿 788-22480） */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  aria-label="切换账号"
                  className="flex size-4 items-center justify-center rounded-full bg-[#E6E8EA] text-[#252632]/75 transition-colors hover:bg-[#DCDEE1] hover:text-[#252632]"
                >
                  {/* 素材为朝右三角,旋转 90° 后成为设计稿的朝下三角 */}
                  <FigmaGlyph src="/icons/account-menu/triangle-down.svg" size={12} inset="27% 32%" className="rotate-90" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content side="bottom" align="start" sideOffset={6} className="z-[80]">
                  <AccountSwitcherPanel />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          <div className="flex min-w-0 items-center gap-3 text-[12px] leading-4 text-[#232323]/60">
            <span className="shrink-0">{p.douyinId}</span>
            <i className="h-3 w-px shrink-0 bg-[#E2E2E2]" />
            <span className="truncate">{p.signature}</span>
          </div>
        </div>
        <div className="flex items-center gap-6 tabular-nums">
          {nums
            ? nums.map((s, i) => (
                <span key={s.label} className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold leading-4 text-[#252632]/60">{s.label}</span>
                  <b className="text-[16px] font-bold leading-5 text-[#252632]">
                    {s.value.endsWith('万') ? (
                      <>
                        {s.value.slice(0, -1)}
                        <span className="text-[14px] font-semibold">万</span>
                      </>
                    ) : (
                      s.value
                    )}
                  </b>
                  {i < 2 && <ChevronRight size={12} className="text-[#252632]/45" />}
                </span>
              ))
            : <span className="h-4 w-48 animate-pulse rounded bg-black/5" />}
        </div>
      </div>
    </div>
  )
}

/* ─── 入口卡 ─── */

/** 入口卡（设计稿 1-24030）：图标容器 77×84；前卡 60×75，视觉上与入口卡等高。
 *  容器上移 5px 抵消前卡内部偏移，文字从 86px 起排。
 *  hover / focus 变体只向下传播，驱动 CardImageIcon 的卡面扇开。 */
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
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      animate="rest"
      whileHover="spread"
      whileFocus="spread"
      whileTap={
        reduceMotion
          ? undefined
          : { y: 0, scale: 0.99, transition: { type: 'tween', duration: 0.07, ease: 'easeOut' } }
      }
      className="relative h-[75px] rounded-2xl border-[0.5px] border-black/5 bg-white py-[16px] pl-[86px] pr-1 text-left shadow-[0_7px_8px_rgba(0,0,0,0.05)]"
    >
      <span className="pointer-events-none absolute -left-px top-[-5.1px] z-[1] h-[84px] w-[77px]">{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold text-[#252632]">{label}</div>
        <div className="mt-1 truncate text-[12px] text-[#252632]/50">{desc}</div>
      </div>
    </motion.button>
  )
}

/** 入口卡图标：正卡（front，设计稿导出的 4x 贴纸）在左，后卡与正卡等大、在右后方
 *  斜置探出（有 back 图则铺图，否则用中性浅色底板——对应设计里作品发布/工坊的白底后卡）。
 *  默认几何与 hover 增量分层：后卡绕左下角右扇，正卡同时向左展开。 */
function CardImageIcon({ front, back }: { front: string; back?: string }) {
  const reduceMotion = useReducedMotion()
  const fanInTransition = { type: 'tween' as const, duration: reduceMotion ? 0 : 0.11, ease: 'easeOut' as const }
  const fanOutTransition = { type: 'tween' as const, duration: reduceMotion ? 0 : 0.08, ease: 'easeOut' as const }

  return (
    <span className="relative block h-full w-full">
      {/* 后卡：设计稿 x=17.936, y=0, 60×75, rotate=10°, skewX=-1.54° */}
      <motion.span
        className="pointer-events-none absolute left-[17.94px] top-0 h-[75px] w-[60px]"
        style={{ transformOrigin: '0% 100%' }}
        variants={{
          rest: { x: 0, rotate: 0, transition: fanOutTransition },
          spread: {
            x: reduceMotion ? 0 : 2,
            rotate: reduceMotion ? 0 : 4,
            transition: fanInTransition,
          },
        }}
      >
        <span
          className="absolute inset-0 overflow-hidden rounded-xl border border-white/80 bg-gradient-to-b from-[#f2f3f5] to-[#e0e3e9] shadow-[0_5px_10px_rgba(0,0,0,0.12)]"
          style={{ transform: 'rotate(10deg) skewX(-1.54deg)', transformOrigin: '0% 0%' }}
        >
          {back && <img src={back} alt="" className="h-full w-full object-cover" />}
        </span>
      </motion.span>
      {/* 正卡在左，压住后卡 */}
      <motion.img
        src={front}
        alt=""
        className="pointer-events-none absolute left-0 top-[5.1px] h-[75px] w-[60px] object-cover"
        style={{ transformOrigin: '100% 100%' }}
        variants={{
          rest: { x: 0, rotate: 0, transition: fanOutTransition },
          spread: {
            x: reduceMotion ? 0 : -5,
            rotate: reduceMotion ? 0 : -6,
            transition: fanInTransition,
          },
        }}
      />
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

function OverviewSection({ active }: { active: boolean }) {
  const [range, setRange] = useState<StatsRange>('week')
  const [dimIdx, setDimIdx] = useState(0)
  const { data, error } = useCreatorStats(range, active)
  const dim = data?.overview.dims[dimIdx]
  const days = data?.period.days ?? 7
  return (
    <section className="bg-white p-5">
      <PanelHeader title="数据总览" period={periodText(data)} extra={<RangeSwitch value={range} onChange={setRange} />} />
      {!data || !dim ? (
        <PanelFallback error={error} height={340} />
      ) : (
        <div className="mt-4 grid grid-cols-[minmax(0,460px)_1fr] gap-8">
          {active && (
            <Suspense fallback={<SectionLoader height={250} />}>
              <OverviewRadar dims={data.overview.dims} active={dimIdx} onSelect={setDimIdx} />
            </Suspense>
          )}
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
              <button type="button" onClick={() => toast('已打开全部作品（演示）')} className="ml-auto text-[12px] text-[#2C64E3] hover:opacity-80">
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
    <div role="group" aria-label="数据指标" className="grid overflow-hidden rounded-xl border border-black/5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {defs.map((m, i) => (
        <button
          key={m.label}
          type="button"
          aria-pressed={active === i}
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
      onClick={() => toast('导出成功（演示）')}
      className="flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1 text-[12px] text-[#252632]/70 hover:bg-black/[0.03]"
    >
      <Download size={13} /> 导出数据
    </button>
  )
}

function WorksSection({ active }: { active: boolean }) {
  const [range, setRange] = useState<StatsRange>('week')
  const [tab, setTab] = useState('投稿')
  const [metric, setMetric] = useState(0)
  const { data, error } = useCreatorStats(range, active)
  const def = WORKS_METRIC_DEFS[metric]
  return (
    <section className="bg-white p-5">
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
      <div role="tablist" aria-label="作品数据类型" className="mt-3 flex gap-5 border-b border-black/5 text-[13px]">
        {['投稿', '合集', '直播'].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
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
            {active && (
              <Suspense fallback={<SectionLoader height={230} />}>
                <TrendAreaChart
                  data={data.works.trend}
                  dataKey={def.dataKey}
                  name={def.label}
                  id="works-trend"
                  rich={def.rich}
                />
              </Suspense>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function FansSection({ active }: { active: boolean }) {
  const [range, setRange] = useState<StatsRange>('week')
  const [metric, setMetric] = useState(1)
  const { data, error } = useCreatorStats(range, active)
  const def = FANS_METRIC_DEFS[metric]
  return (
    <section className="bg-white p-5">
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
            {active && (
              <Suspense fallback={<SectionLoader height={230} />}>
                <TrendAreaChart data={data.fans.trend} dataKey={def.dataKey} name={def.label} id="fans-trend" />
              </Suspense>
            )}
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

function DataOverviewSection({ active, onViewDetail }: { active: boolean; onViewDetail: () => void }) {
  const { data, error } = useHomeOverview(active)
  const [tab, setTab] = useState<'account' | 'recent' | 'live'>('account')
  const trend = tab === 'live' ? data?.liveTrend : data?.accountTrend
  return (
    <section className="rounded-[20px] border-[0.5px] border-black/10 bg-white p-6 shadow-[0_6px_6px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2">
        <h2 className="text-[18px] font-semibold text-[#252632]">数据概览</h2>
        <CircleHelp size={14} className="text-[#252632]/30" />
        {data && <span className="text-[12px] text-[#252632]/40">更新时间: {data.updatedAt}</span>}
        <button type="button" onClick={onViewDetail} className="ml-auto flex items-center text-[12px] text-[#252632]/60 hover:text-[#252632]">
          查看更多 <ChevronRight size={13} />
        </button>
      </div>

      {!data ? (
        <PanelFallback error={error} height={320} />
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-[215px_1fr]">
          {/* 最新作品 */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#252632]">最新作品</h3>
            {/* 堆叠（<lg）时限宽，避免竖版封面撑满整行 */}
            <div className="relative mt-3 h-[280px] w-[191px] overflow-hidden rounded-xl">
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
              <div role="tablist" aria-label="数据概览类型" className="flex gap-5 text-[14px]">
                {([['account', '账号总览'], ['recent', '近期作品'], ['live', '直播数据']] as const).map(([k, l]) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} aria-controls="home-overview-panel" onClick={() => setTab(k)}
                    className={`-mb-px whitespace-nowrap border-b-2 pb-2 transition-colors ${tab === k ? 'border-[#FE2C55] font-medium text-[#252632]' : 'border-transparent text-[#252632]/45 hover:text-[#252632]/75'}`}>{l}</button>
                ))}
              </div>
              <button type="button" onClick={() => toast('当前展示近 7 天数据（演示）')} className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#F2F3F5] px-3 py-1.5 text-[12px] text-[#252632]/60 hover:bg-[#EBEDF0]">
                时间 近7天 <ChevronDown size={12} />
              </button>
            </div>
            <div id="home-overview-panel" role="tabpanel" className="min-w-0">
              <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-[#252632]/55">
                <i className="size-1.5 rounded-full bg-[#4E83FD]" />播放量
              </div>
              {active && trend && (
                <Suspense fallback={<SectionLoader height={118} />}>
                  <SimpleAreaChart data={trend} id={`home-${tab}`} height={118} />
                </Suspense>
              )}
              {/* 8 指标 */}
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
                {data.metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-[12px] text-[#252632]/55">{m.label}</div>
                    <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                      <span className="text-[20px] font-bold text-[#252632]">
                        {m.type === 'yuan' ? fmtYuan(m.value) : fmtCount(m.value)}
                      </span>
                      <span className="text-[11px] text-[#252632]/55">
                        较前7日 <span className={m.delta >= 0 ? 'text-[#C92B2B]' : 'text-[#00875A]'}>{fmtDelta(m.delta, m.type)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* ─── 数据中心（原首页的数据总览 + 作品数据 + 粉丝数据） ─── */

function DataCenter({ active }: { active: boolean }) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-white">
      {/* 无页面级大标题——与内容管理等页一致，标题由各卡片自带（数据总览…） */}
      <div className="space-y-4">
        <OverviewSection active={active} />
        <WorksSection active={active} />
        <FansSection active={active} />
      </div>
    </main>
  )
}

/** 装饰背景仅在当前产品可见且用户未请求减少动态效果时播放。 */
function AmbientBackgroundVideo({
  active,
  fadeToWhite = false,
}: {
  active: boolean
  fadeToWhite?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fadeRgb = fadeToWhite ? '255,255,255' : '245,246,248'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    const syncPlayback = () => {
      if (motionPreference.matches || !visible || !active) {
        video.pause()
      } else {
        void video.play().catch(() => undefined)
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        syncPlayback()
      },
      { threshold: 0.05 },
    )

    observer.observe(video)
    motionPreference.addEventListener('change', syncPlayback)
    syncPlayback()
    return () => {
      observer.disconnect()
      motionPreference.removeEventListener('change', syncPlayback)
      video.pause()
    }
  }, [active])

  return (
    // 固定高度裁剪容器：视频 scale 溢出被裁掉，底边始终落在 430px，
    // 不会露出缩放后的彩色底边；遮罩在容器内叠加。
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[430px] overflow-hidden">
      <video
        ref={videoRef}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full scale-[1.05] object-cover object-[center_95%]"
        src="/bg/ascii-animation2.mp4"
        preload="metadata"
        loop
        muted
        playsInline
      />
      {/* 遮罩：顶部一层轻遮让视频与顶栏过渡（更明显），中段全透明露出
          视频主体，底部提前完全落到页面底色盖住视频底边。 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(${fadeRgb},0.5) 0%, rgba(${fadeRgb},0.28) 16%, rgba(${fadeRgb},0.08) 30%, rgba(${fadeRgb},0) 42%, rgba(${fadeRgb},0.28) 58%, rgba(${fadeRgb},0.62) 74%, rgba(${fadeRgb},0.9) 86%, rgb(${fadeRgb}) 95%)`,
        }}
      />
      {/* 横向遮罩：左缘落到页面底色再渐显，与透明侧栏一侧融合无硬切 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, rgb(${fadeRgb}) 0%, rgba(${fadeRgb},0.72) 12%, rgba(${fadeRgb},0.32) 26%, rgba(${fadeRgb},0) 42%)`,
        }}
      />
    </div>
  )
}

/* ─── 首页主体 ─── */

export default function CreatorCenterHome({
  active,
  onOpenProduct,
}: {
  active: boolean
  onOpenProduct: (id: ProductId) => void
}) {
  // 左侧栏当前页：data=数据看板 content=内容管理 其余为建设中占位
  const [page, setPage] = useState('data')
  const navVersion = useNavVersion((state) => state.version)
  const liveEnabled = useLiveMgmt((s) => s.enabled)
  // 关闭直播管理开关后若正停在该页，回落到数据看板（渲染期派生）
  if (page === 'live' && !liveEnabled) setPage('data')
  // 资料头的粉丝/获赞用近7天档的响应（任意档都含 profile 快照）
  const homePageActive = active && page === 'data'
  const { data: profileData } = useCreatorStats('week', homePageActive)
  // 首页新板块（互动/变现/活动/快速导航）共用一次 home-overview 拉取
  const { data: homeData } = useHomeOverview(homePageActive)
  const reduceMotion = useReducedMotion()

  return (
    <div className={`flex h-full min-h-0 ${navVersion === 1 ? 'bg-transparent' : 'bg-[#F5F6F8]'}`}>
      <SideNav active={page} onSelect={setPage} />
      {/* 只有内容区做载入动画；侧栏等框架保持静止 */}
      <motion.div
        key={page}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        className="flex min-h-0 min-w-0 flex-1"
      >
      <Suspense fallback={<main className="min-w-0 flex-1 bg-[#F5F6F8]"><SectionLoader /></main>}>
      {isPublishPage(page) ? (
        <PublishVideoPage key={page} initialKind={publishKindFromPage(page)} />
      ) : page === 'content' ? (
        <ContentPage />
      ) : page === 'live' ? (
        <LivePage />
      ) : page === 'datacenter' ? (
        <DataCenter active={active} />
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
      <main
        className={`min-w-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          navVersion === 1 ? 'bg-white' : ''
        }`}
      >
        {/* 完整 ASCII 动画靠底取景；遮罩不跟随视频放大，确保在内容区
            底边完全落到页面底色，避免残留画面形成一条硬接缝。 */}
        <div
          className={`relative overflow-hidden ${
            navVersion === 1 ? 'bg-white' : 'bg-[#F5F6F8]'
          }`}
        >
          <AmbientBackgroundVideo active={active} fadeToWhite={navVersion === 1} />
          <div className="relative px-4 pb-4 pt-6">
            <ProfileHeader stats={profileData} />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* 智能创作 */}
              <section className="h-[264px] rounded-[20px] border-[0.5px] border-black/10 bg-white px-3 pb-3 pt-6 shadow-[0_6px_6px_rgba(0,0,0,0.02)]">
                <h3 className="px-3 pb-4 text-[18px] font-semibold leading-[26px] text-[#252632]">智能创作</h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-[18px] px-2 py-1.5">
                  {SMART_CREATE_ENTRIES.map((e) => (
                    <EntryCard
                      key={e.id}
                      icon={<CardImageIcon front={e.homeFront} back={e.homeBack} />}
                      label={e.label}
                      desc={e.desc}
                      onClick={() => onOpenProduct(e.id)}
                    />
                  ))}
                </div>
              </section>
              {/* 作品发布 */}
              <section className="h-[264px] rounded-[20px] border-[0.5px] border-black/10 bg-white px-3 pb-3 pt-6 shadow-[0_6px_6px_rgba(0,0,0,0.02)]">
                <div className="flex h-[42px] items-start px-3">
                  <h3 className="text-[18px] font-semibold leading-[26px] text-[#252632]">作品发布</h3>
                  <div className="ml-auto flex items-center gap-1 pt-1 text-[12px] leading-4 text-[#252632]/80">
                    <span>你有一个上次未发布的作品</span>
                    <button type="button" onClick={() => toast('已恢复上次未发布作品（演示）')} className="flex items-center font-semibold text-[#1769C2] hover:opacity-80">继续编辑 <ChevronRight size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-[18px] px-2 py-1.5">
                  {PUBLISH_ENTRIES.map((e) => (
                    <EntryCard
                      key={e.label}
                      icon={<CardImageIcon front={e.img} />}
                      label={e.label}
                      desc={e.desc}
                      onClick={() => setPage(publishPageKey(e.id))}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <DataOverviewSection active={homePageActive} onViewDetail={() => setPage('datacenter')} />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_292px]">
            <div className="min-w-0 space-y-4">
              {homeData && <InteractionSection data={homeData.interaction} onMore={() => setPage('content')} />}
              {homeData && <MonetizationSection data={homeData.monetization} onMore={() => setPage('income')} />}
            </div>
            <div className="space-y-4">
              {homeData && <ActivityCenterCard data={homeData.calendar} onMore={() => setPage('service:活动管理')} />}
              {homeData && <QuickNavCard items={homeData.quickNav} onMore={() => setPage('service')} />}
            </div>
          </div>
          <HomeFooter />
        </div>
      </main>
      )}
      </Suspense>
      </motion.div>
      {/* 创作主页用模型理解产品意图；隐藏首页与其他内容页保持纯对话。 */}
      <AiAssistantPanel
        defaultOpen={false}
        context={assistantContextFor(page)}
        onOpenProduct={active && page === 'data' ? onOpenProduct : undefined}
      />
    </div>
  )
}
