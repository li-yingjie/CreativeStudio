import { useEffect, useState } from 'react'

/* ─── /api/creator/stats 的响应类型（与 server/creator-data.mjs 对应） ─── */

export type StatsRange = 'yesterday' | 'week' | 'month'

/* ─── 通用：一次性 GET + 缓存 + 并发去重 hook（无参端点） ─── */

function makeResourceHook<T>(path: string) {
  let cache: T | null = null
  let pending: Promise<T> | null = null
  const fetcher = (): Promise<T> => {
    if (cache) return Promise.resolve(cache)
    if (pending) return pending
    pending = (async () => {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`${path} ${res.status}`)
      const data = (await res.json()) as T
      cache = data
      return data
    })().finally(() => {
      pending = null
    })
    return pending
  }
  return function useResource(enabled = true) {
    const [data, setData] = useState<T | null>(cache)
    const [error, setError] = useState<string | null>(null)
    useEffect(() => {
      if (!enabled) return
      let alive = true
      fetcher()
        .then((d) => alive && setData(d))
        .catch((e: Error) => alive && setError(e.message))
      return () => {
        alive = false
      }
    }, [enabled])
    return { data, error, loading: enabled && !data && !error }
  }
}

/* ─── /api/creator/activities（活动管理） ─── */

export type ActivityStatus = 'pending' | 'reviewing' | 'ongoing' | 'rejected' | 'ended'

export interface ActivityInspiration {
  cover: string
  title: string
  audience: string
  start: string
  desc: string
}
export interface MyActivity {
  id: string
  title: string
  status: ActivityStatus
  start: string
  end: string
  remainingDays: number | null
  totalDays: number
  audience: string
  playType: string
  rewardType: 'virtual' | 'physical'
  activityType: string
  canPublish: boolean
}
export interface CreatorActivities {
  inspirations: ActivityInspiration[]
  myActivities: MyActivity[]
}
export const useCreatorActivities = makeResourceHook<CreatorActivities>('/api/creator/activities')

/* ─── /api/creator/copyright（原创保护） ─── */

export interface CopyrightData {
  steps: { label: string; action: string; state: 'done' | 'current' | 'todo' }[]
  benefits: { key: string; name: string }[]
  videos: { id: string; cover: string; title: string }[]
  announcements: { title: string; tag?: string }[]
}
export const useCreatorCopyright = makeResourceHook<CopyrightData>('/api/creator/copyright')

/* ─── /api/creator/index-hot（抖音指数） ─── */

export interface HotItem {
  rank: number
  name: string
  index: string
  change: 'up' | 'down' | 'flat'
}
export interface IndexHotData {
  tabs: string[]
  bubbles: string[]
  realtime: HotItem[]
  surging: HotItem[]
}
export const useCreatorIndexHot = makeResourceHook<IndexHotData>('/api/creator/index-hot')

/* ─── /api/creator/home-overview（首页数据概览） ─── */

export interface HomeOverviewMetric {
  label: string
  value: number
  delta: number
  type: 'count' | 'yuan'
}
export interface HomeInteraction {
  comments: { count: number; time: string; text: string; source: string }
  messages: { count: number; time: string; text: string; user: string; avatar: string }
}
export interface HomeMonetization {
  range: string
  amount: number
  delta: number
  availableTasks: number
  myTasks: number
  availableTaskTitle: string
  myTaskTitle: string
}
export interface HomeCalendarEvent {
  title: string
  range: string
  color: string
  startDay: number
  endDay: number
}
export interface HomeCalendar {
  year: number
  month: number
  today: number
  daysInMonth: number
  firstWeekday: number
  marks: Record<string, string>
  selectedDay: number
  selectedLabel: string
  ongoing: number
  events: HomeCalendarEvent[]
}
export interface HomeQuickNav {
  name: string
  tint: string
  short: string
}
export interface HomeOverview {
  updatedAt: string
  latestWork: { cover: string; duration: string; title: string; plays: number; likes: number }
  accountTrend: { date: string; value: number }[]
  liveTrend: { date: string; value: number }[]
  metrics: HomeOverviewMetric[]
  interaction: HomeInteraction
  monetization: HomeMonetization
  calendar: HomeCalendar
  quickNav: HomeQuickNav[]
}
export const useHomeOverview = makeResourceHook<HomeOverview>('/api/creator/home-overview')

/* ─── /api/creator/lives（直播管理） ─── */

export interface LiveItem {
  id: string
  cover: string
  duration: string
  title: string
  date: string
  status: string
  spark: number[]
  metrics: { label: string; value: string }[]
}
export interface CreatorLives {
  total: number
  list: LiveItem[]
}
export const useCreatorLives = makeResourceHook<CreatorLives>('/api/creator/lives')

/* ─── /api/creator/collab 的响应类型（作品共创页） ─── */

export type CollabStatus = 'active' | 'dissolved' | 'revoked' | 'partial'

export interface CollabItem {
  id: string
  title: string
  cover: string
  duration: string
  publishedAt: string
  total: number
  accepted: number
  avatars: string[]
  status: CollabStatus
  notice: string | null
}

export interface CreatorCollab {
  remainingThisMonth: number
  faqs: string[]
  list: CollabItem[]
}

let collabCache: CreatorCollab | null = null
let collabPending: Promise<CreatorCollab> | null = null

export function fetchCreatorCollab(): Promise<CreatorCollab> {
  if (collabCache) return Promise.resolve(collabCache)
  if (collabPending) return collabPending
  collabPending = (async () => {
    const res = await fetch('/api/creator/collab')
    if (!res.ok) throw new Error(`collab ${res.status}`)
    const data = (await res.json()) as CreatorCollab
    collabCache = data
    return data
  })().finally(() => {
    collabPending = null
  })
  return collabPending
}

/** 拉取作品共创数据（创作服务 · 作品共创页）。 */
export function useCreatorCollab() {
  const [data, setData] = useState<CreatorCollab | null>(collabCache)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    fetchCreatorCollab()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])
  return { data, error, loading: !data && !error }
}

export interface RadarDimData {
  key: string
  label: string
  /** 数值型（播放量/净增/作品数）为 number，比率型为 '12.3%' 字符串 */
  display: number | string
  percentile: number
  grade: string | null
  mine: number
  peers: number
  /** 同类作者中位数（已折算到当前统计区间的量纲） */
  peerMedian: number
  /** 贡献榜 value 的量纲：count=计数 rate=百分比 date=发布日期 */
  valueKind: 'count' | 'rate' | 'date'
  /** 该维度的贡献 TOP3（作品数维度为本期发布的作品） */
  topWorks: { title: string; cover: string; value: number | string }[]
}

export interface TrendPoint {
  date: string
  plays: number
  playsDouyin: number
  playsXigua: number
  deltaPct: number | null
  topVideos: { title: string; plays: number }[]
  published: number
  homeVisits: number
  likes: number
  comments: number
  shares: number
  avgPlaySeconds: number
  finish5s: number
  fansNew: number
  fansLost: number
  fansNet: number
  fansReturn: number
  fansTotal: number
}

export interface CreatorStats {
  period: { start: string; end: string; days: number }
  profile: { fansTotal: number; likesTotal: number; follow: number }
  overview: {
    dims: RadarDimData[]
    analysis: { plays: number; peerMedianDaily: number; peerMedianRange: number; percentile: number }
    topWorks: { title: string; cover: string; plays: number }[]
  }
  works: {
    metrics: {
      plays: number
      published: number
      homeVisits: number
      likes: number
      shares: number
      comments: number
      avgPlaySeconds: number
      finish5s: number
    }
    trend: TrendPoint[]
  }
  fans: {
    metrics: { total: number; net: number; gained: number; lost: number; returned: number }
    trend: TrendPoint[]
  }
}

/* ─── /api/creator/works 的响应类型（内容管理页） ─── */

export interface WorkItem {
  id: string
  title: string
  cover: string
  type: 'video' | 'gallery'
  /** AI 工坊产出的作品类型中文标签（如「小程序」）。视频/图文作品为
   *  空；有值时列表按工坊指标展示、封面角标显示该标签。 */
  workshopKind?: string
  duration: string | null
  imageCount: number | null
  publishedAt: string
  status: string
  pinned: boolean
  tags: string[]
  trafficDown: boolean
  notice: { tone: 'success' | 'warning'; text: string } | null
  spark: number[]
  metrics: {
    plays: number
    likes: number
    comments: number
    shares: number
    favorites: number
    danmaku: number | null
    finishRate: number | null
    bounce2s: number | null
    coverClickRate: number | null
    avgPlayRatio: number | null
    fanGain: number
  }
}

export interface CreatorWorks {
  total: number
  list: WorkItem[]
}

let worksCache: CreatorWorks | null = null
let worksPending: Promise<CreatorWorks> | null = null

export function fetchCreatorWorks(): Promise<CreatorWorks> {
  if (worksCache) return Promise.resolve(worksCache)
  if (worksPending) return worksPending
  worksPending = (async () => {
    const res = await fetch('/api/creator/works')
    if (!res.ok) throw new Error(`works ${res.status}`)
    const data = (await res.json()) as CreatorWorks
    worksCache = data
    return data
  })().finally(() => {
    worksPending = null
  })
  return worksPending
}

/** 拉取作品列表（内容管理页）。 */
export function useCreatorWorks() {
  const [data, setData] = useState<CreatorWorks | null>(worksCache)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    fetchCreatorWorks()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [])
  return { data, error, loading: !data && !error }
}

/* ─── /api/creator/income 的响应类型（收入页） ─── */

export interface IncomePoint {
  date: string
  total: number
  xingtu: number
  miniapp: number
  music: number
}

export interface CreatorIncome {
  updatedAt: string
  summary: { yesterday: number; last7: number; last30: number; withdrawable: number }
  trend: IncomePoint[]
  tasksInProgress: number
  featuredTask: {
    cover: string
    title: string
    deadlineTag: string
    brand: string
    category: string
    deadline: string
    commission: string
    commissionNote: string
    budget: string
    budgetNote: string
  }
}

const incomeCache = new Map<StatsRange, CreatorIncome>()
const incomePending = new Map<StatsRange, Promise<CreatorIncome>>()

export function fetchCreatorIncome(range: StatsRange): Promise<CreatorIncome> {
  const hit = incomeCache.get(range)
  if (hit) return Promise.resolve(hit)
  const inflight = incomePending.get(range)
  if (inflight) return inflight
  const p = (async () => {
    const res = await fetch(`/api/creator/income?range=${range}`)
    if (!res.ok) throw new Error(`income ${res.status}`)
    const data = (await res.json()) as CreatorIncome
    incomeCache.set(range, data)
    return data
  })().finally(() => incomePending.delete(range))
  incomePending.set(range, p)
  return p
}

/** 按时间范围拉取收入数据（切档真实重查，同档走缓存）。 */
export function useCreatorIncome(range: StatsRange) {
  const [state, setState] = useState<{
    range: StatsRange
    data: CreatorIncome | null
    error: string | null
  }>(() => ({ range, data: incomeCache.get(range) ?? null, error: null }))
  if (state.range !== range) {
    setState({ range, data: incomeCache.get(range) ?? null, error: null })
  }
  useEffect(() => {
    let alive = true
    fetchCreatorIncome(range)
      .then((d) => alive && setState((s) => (s.range === range ? { ...s, data: d } : s)))
      .catch((e: Error) => alive && setState((s) => (s.range === range ? { ...s, error: e.message } : s)))
    return () => {
      alive = false
    }
  }, [range])
  return { data: state.data, error: state.error, loading: !state.data && !state.error }
}

/** 金额格式化：¥872.20 / ¥10.23万。 */
export function fmtYuan(n: number): string {
  if (n >= 1e4) return `¥ ${(n / 1e4).toFixed(2).replace(/0$/, '')}万`
  return `¥ ${n.toFixed(2)}`
}

/* ─── 请求 + 缓存 ─── */

const cache = new Map<StatsRange, CreatorStats>()
// 同 range 的并发请求合并成一个（首屏多个面板同时要 week 档）
const pending = new Map<StatsRange, Promise<CreatorStats>>()

export function fetchCreatorStats(range: StatsRange): Promise<CreatorStats> {
  const hit = cache.get(range)
  if (hit) return Promise.resolve(hit)
  const inflight = pending.get(range)
  if (inflight) return inflight
  const p = (async () => {
    const res = await fetch(`/api/creator/stats?range=${range}`)
    if (!res.ok) throw new Error(`stats ${res.status}`)
    const data = (await res.json()) as CreatorStats
    cache.set(range, data)
    return data
  })().finally(() => pending.delete(range))
  pending.set(range, p)
  return p
}

/** 按时间范围拉取统计。切 range 会真实重新查询（同 range 走内存缓存）。 */
export function useCreatorStats(range: StatsRange, enabled = true) {
  const [state, setState] = useState<{
    range: StatsRange
    data: CreatorStats | null
    error: string | null
  }>(() => ({ range, data: cache.get(range) ?? null, error: null }))
  // range 变化时在渲染期重置（React 推荐的 derived-state 写法，不走 effect）
  if (state.range !== range) {
    setState({ range, data: cache.get(range) ?? null, error: null })
  }
  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchCreatorStats(range)
      .then((d) => alive && setState((s) => (s.range === range ? { ...s, data: d } : s)))
      .catch((e: Error) => alive && setState((s) => (s.range === range ? { ...s, error: e.message } : s)))
    return () => {
      alive = false
    }
  }, [enabled, range])
  return {
    data: state.data,
    error: state.error,
    loading: enabled && !state.data && !state.error,
  }
}

/* ─── 展示格式化 ─── */

/** 12345 → 1.2万；1.2e8 → 1.2亿。整数位数多时保留一位小数。 */
export function fmtCount(n: number): string {
  if (n >= 1e8) return `${trimZero((n / 1e8).toFixed(2))}亿`
  if (n >= 1e4) return `${trimZero((n / 1e4).toFixed(1))}万`
  return String(n)
}

const trimZero = (s: string) => s.replace(/\.?0+$/, '')

/** 图表 Y 轴刻度：优先整万。 */
export function fmtAxis(n: number): string {
  if (n >= 1e4) return `${trimZero((n / 1e4).toFixed(1))}w`
  return String(n)
}
