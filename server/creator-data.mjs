// 创作者中心的 mock 后端数据层 — 与 kimi.mjs 同款 plain Node (req,res) 处理器，
// dev（Vite 中间件）/ prod（Express）/ Vercel 三处共用。
//
// 「表」是确定性生成的：每个日期用自身字符串做种子，任何时候重启、任何环境
// 生成的行都一致 —— 像一张真实落库的表，而不是前端写死的展示数字。
//
//   daily_stats      逐日统计（播放、完播/互动率、涨掉粉、点赞评论分享……）
//   works            作品表（标题/封面/发布日/热度基数）
//   work_daily_plays 作品×日播放（由作品热度×当日大盘推导）
//   peer_benchmarks  同类作者基准（中位数+离散度，用于算「超过 xx% 同类作者」）

/* ─── 确定性伪随机 ─── */

function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SHANGHAI_DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function shanghaiDateKey(date = new Date()) {
  const parts = Object.fromEntries(
    SHANGHAI_DATE_FORMATTER.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}`
}

const dateKey = (d) => d.toISOString().slice(0, 10)
let dataAnchorDate = shanghaiDateKey()

/** 过去第 n 天（n=1 是昨天）。数据截至昨天 —— 「每日更新前一日数据」。 */
function daysAgo(n) {
  const [year, month, day] = dataAnchorDate.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

/* ─── works 表 ─── */

const WORK_TITLES = [
  '拉花师翻车集锦 #在拍一种很新的vlog',
  '糕点师上线 #抖音真实生活分享计划',
  '凌晨四点的咖啡店开门实录',
  '和粉丝一起做的隐藏菜单',
  '探店翻车了但真的好好笑',
  '30秒学会一个拿铁小技巧',
  '店里来了只会点单的猫',
  '雨天的窗边座位 #治愈系',
  '第一次直播拉花翻车名场面',
  '员工餐大公开，成本三块五',
  '客人留下的100张手写便签',
  '闭店后的一人食深夜安静时刻',
]

const WORK_COVERS = [
  '/bg/lifestyle-vlog-album-1.jpg',
  '/bg/lifestyle-vlog-album-2.jpg',
  '/bg/lifestyle-vlog-album-3.jpg',
  '/bg/scenes/lifestyle-cafe.png',
  '/bg/scenes/lifestyle-street.png',
  '/bg/scenes/lifestyle-seaside.png',
  '/bg/scenes/lifestyle-studio.png',
]

/** 60 天内的作品：每 4~6 天发一条，热度基数随机。 */
function buildWorks() {
  const works = []
  let day = 58
  let i = 0
  while (day > 0) {
    const rnd = mulberry32(hashSeed(`work-${day}`))
    works.push({
      id: `w${i + 1}`,
      title: WORK_TITLES[i % WORK_TITLES.length],
      cover: WORK_COVERS[i % WORK_COVERS.length],
      publishedAt: dateKey(daysAgo(day)),
      heat: 0.55 + rnd() * 0.9, // 播放分配权重
    })
    day -= 4 + Math.floor(rnd() * 3)
    i++
  }
  return works
}

let works = buildWorks()

/* ─── daily_stats 表（60 行，截至昨天） ─── */

function buildDailyRow(n) {
  const date = daysAgo(n)
  const key = dateKey(date)
  const rnd = mulberry32(hashSeed(`daily-${key}`))
  const weekday = date.getUTCDay()
  // 周末流量高一档 + 平滑周期 + 噪声
  const weekendBoost = weekday === 0 || weekday === 6 ? 1.3 : 1
  const cycle = 1 + 0.25 * Math.sin((n / 60) * Math.PI * 4)
  const plays = Math.round((52000 + rnd() * 46000) * weekendBoost * cycle)
  const douyinShare = 0.62 + rnd() * 0.18
  const fansNew = Math.round(plays * (0.004 + rnd() * 0.008))
  const fansLost = Math.round(fansNew * (0.25 + rnd() * 0.55))
  return {
    date: key,
    label: key.slice(5), // MM-DD
    plays,
    playsDouyin: Math.round(plays * douyinShare),
    playsXigua: Math.round(plays * (1 - douyinShare)),
    finishRate: +(10 + rnd() * 5.5).toFixed(1), // %
    interactRate: +(8 + rnd() * 6).toFixed(1), // %
    fansNew,
    fansLost,
    fansReturn: Math.round(80 + rnd() * 220),
    homeVisits: Math.round(plays * (0.03 + rnd() * 0.03)),
    likes: Math.round(plays * (0.05 + rnd() * 0.04)),
    comments: Math.round(plays * (0.006 + rnd() * 0.006)),
    shares: Math.round(plays * (0.003 + rnd() * 0.004)),
    avgPlaySeconds: +(10 + rnd() * 6).toFixed(2),
    finish5s: +(30 + rnd() * 15).toFixed(1), // %
  }
}

const DAYS = 60
let dailyStats = Array.from({ length: DAYS }, (_, i) => buildDailyRow(DAYS - i)) // 旧→新

/** 粉丝存量：基数 + 逐日净增累计。 */
const FANS_BASE = 1398000
function buildFansTotalByDate() {
  const map = new Map()
  let total = FANS_BASE
  for (const row of dailyStats) {
    total += row.fansNew - row.fansLost
    map.set(row.date, total)
  }
  return map
}

let fansTotalByDate = buildFansTotalByDate()

/** Long-running servers rebuild the deterministic mock tables after Shanghai midnight. */
function ensureFreshData() {
  const currentDate = shanghaiDateKey()
  if (currentDate === dataAnchorDate) return
  dataAnchorDate = currentDate
  works = buildWorks()
  dailyStats = Array.from({ length: DAYS }, (_, i) => buildDailyRow(DAYS - i))
  fansTotalByDate = buildFansTotalByDate()
}

/* ─── work_daily_plays：当日大盘按热度（近期作品加权）分给各作品 ─── */

function workPlaysOn(row) {
  const published = works.filter((w) => w.publishedAt <= row.date)
  const weights = published.map((w) => {
    const age = (new Date(row.date) - new Date(w.publishedAt)) / 86400000
    return { w, weight: w.heat * Math.exp(-age / 9) + 0.02 }
  })
  const sum = weights.reduce((s, x) => s + x.weight, 0)
  return weights
    .map(({ w, weight }) => ({ id: w.id, title: w.title, cover: w.cover, plays: Math.round((row.plays * weight) / sum) }))
    .sort((a, b) => b.plays - a.plays)
}

/* ─── peer_benchmarks 表：同类作者的分布（median + sigma，按日折算） ─── */

const peerBenchmarks = {
  plays: { median: 62000, sigma: 55000 }, // 日播放中位数（同量级同类）
  finishRate: { median: 12.0, sigma: 3.5 },
  interactRate: { median: 10.5, sigma: 4 },
  fansNet: { median: 420, sigma: 260 }, // 日净增
  worksPerWeek: { median: 0.7, sigma: 0.4 },
}

/** 正态 CDF —— 「超过 xx% 同类作者」的来源。 */
function percentileOf(x, { median, sigma }) {
  const z = (x - median) / sigma
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  if (z > 0) p = 1 - p
  return Math.min(99, Math.max(1, Math.round(p * 100)))
}

const gradeOf = (pct) => (pct >= 90 ? '优秀' : pct >= 70 ? '较好' : null)

/** 百分位 → 雷达半径（0-100 图形值）。我的与同类走同一映射，图形才可比。 */
const radiusOf = (pct) => Math.round(18 + pct * 0.78)

/** 把一日拆成 24 个小时点：计数字段按昼夜曲线分配，率值加小噪声。 */
function hourlyTrend(row) {
  const rnd = mulberry32(hashSeed(`hourly-${row.date}`))
  // 昼夜权重：早 8 点爬升、午间小峰、晚 20-22 点主峰
  const weights = Array.from({ length: 24 }, (_, h) => {
    const base = 0.25 + Math.exp(-((h - 21) ** 2) / 14) * 1.6 + Math.exp(-((h - 12) ** 2) / 18) * 0.7
    return base * (0.85 + rnd() * 0.3)
  })
  const wSum = weights.reduce((s, x) => s + x, 0)
  const split = (total, w) => Math.round((total * w) / wSum)
  const topVideos = workPlaysOn(row).slice(0, 3).map((w) => ({ title: w.title, plays: w.plays }))
  const prevTotal = fansTotalByDate.get(row.date) - (row.fansNew - row.fansLost)
  let fansRun = prevTotal
  let prevPlays = null
  return weights.map((w, h) => {
    const plays = split(row.plays, w)
    const fansNew = split(row.fansNew, w)
    const fansLost = split(row.fansLost, w)
    fansRun += fansNew - fansLost
    const deltaPct = prevPlays ? +(((plays - prevPlays) / prevPlays) * 100).toFixed(2) : null
    prevPlays = plays
    return {
      date: `${String(h).padStart(2, '0')}:00`,
      plays,
      playsDouyin: split(row.playsDouyin, w),
      playsXigua: split(row.playsXigua, w),
      deltaPct,
      topVideos,
      published: 0,
      homeVisits: split(row.homeVisits, w),
      likes: split(row.likes, w),
      comments: split(row.comments, w),
      shares: split(row.shares, w),
      avgPlaySeconds: +(row.avgPlaySeconds + (rnd() - 0.5) * 1.6).toFixed(2),
      finish5s: +(row.finish5s + (rnd() - 0.5) * 3).toFixed(1),
      fansNew,
      fansLost,
      fansNet: fansNew - fansLost,
      fansReturn: split(row.fansReturn, w),
      fansTotal: fansRun,
    }
  })
}

/* ─── 聚合 ─── */

const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0)
const avg = (rows, k) => (rows.length ? sum(rows, k) / rows.length : 0)

function aggregate(rangeDays) {
  const rows = dailyStats.slice(-rangeDays)
  const days = rows.length
  const plays = sum(rows, 'plays')
  const finishRate = +avg(rows, 'finishRate').toFixed(1)
  const interactRate = +avg(rows, 'interactRate').toFixed(1)
  const fansNet = sum(rows, 'fansNew') - sum(rows, 'fansLost')
  const published = works.filter((w) => w.publishedAt >= rows[0].date && w.publishedAt <= rows[days - 1].date).length

  // 区间内各作品播放合计（各维度的贡献榜都从它推导）
  const perWork = new Map()
  for (const row of rows) {
    for (const wp of workPlaysOn(row)) {
      perWork.set(wp.id, {
        id: wp.id,
        title: wp.title,
        cover: wp.cover,
        plays: (perWork.get(wp.id)?.plays ?? 0) + wp.plays,
      })
    }
  }
  const byPlays = [...perWork.values()].sort((a, b) => b.plays - a.plays)
  const playsSum = byPlays.reduce((s, w) => s + w.plays, 0) || 1

  // 每个作品的率值：围绕账号均值的确定性偏移（同一作品永远同一率）
  const workRate = (id, base, spread) => {
    const rnd = mulberry32(hashSeed(`rate-${id}`))
    return +(base + (rnd() - 0.5) * spread).toFixed(1)
  }

  // 各维度的贡献 TOP3：value 的量纲随维度不同（见 valueKind）
  const topWorksOf = {
    plays: byPlays.slice(0, 3).map((w) => ({ title: w.title, cover: w.cover, value: w.plays })),
    finishRate: byPlays
      .map((w) => ({ title: w.title, cover: w.cover, value: workRate(w.id, finishRate, 6) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3),
    fansNet: byPlays
      .slice(0, 3)
      .map((w) => ({ title: w.title, cover: w.cover, value: Math.round((fansNet * w.plays) / playsSum) })),
    works: works
      .filter((w) => w.publishedAt >= rows[0].date && w.publishedAt <= rows[days - 1].date)
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, 3)
      .map((w) => ({ title: w.title, cover: w.cover, value: w.publishedAt.slice(5) })),
    interactRate: byPlays
      .map((w) => ({ title: w.title, cover: w.cover, value: workRate(w.id, interactRate, 5) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3),
  }

  // 与同类比较统一折算到「日均」，再算百分位。peerMedian 已折回区间量纲，
  // 前端直接展示「同类作者中位数」。
  const dims = [
    { key: 'plays', label: '播放量', display: plays, pct: percentileOf(plays / days, peerBenchmarks.plays), peerMedian: peerBenchmarks.plays.median * days, valueKind: 'count' },
    { key: 'finishRate', label: '完播率', display: `${finishRate}%`, pct: percentileOf(finishRate, peerBenchmarks.finishRate), peerMedian: peerBenchmarks.finishRate.median, valueKind: 'rate' },
    { key: 'fansNet', label: '粉丝净增', display: fansNet, pct: percentileOf(fansNet / days, peerBenchmarks.fansNet), peerMedian: Math.round(peerBenchmarks.fansNet.median * days), valueKind: 'count' },
    { key: 'works', label: '作品数', display: published, pct: percentileOf((published / days) * 7, peerBenchmarks.worksPerWeek), peerMedian: +((peerBenchmarks.worksPerWeek.median * days) / 7).toFixed(1), valueKind: 'date' },
    { key: 'interactRate', label: '互动率', display: `${interactRate}%`, pct: percentileOf(interactRate, peerBenchmarks.interactRate), peerMedian: peerBenchmarks.interactRate.median, valueKind: 'rate' },
  ].map((d) => ({
    key: d.key,
    label: d.label,
    display: d.display,
    percentile: d.pct,
    grade: gradeOf(d.pct),
    mine: radiusOf(d.pct),
    peers: radiusOf(50),
    peerMedian: d.peerMedian,
    valueKind: d.valueKind,
    topWorks: topWorksOf[d.key],
  }))

  const topWorks = topWorksOf.plays.map((w) => ({ title: w.title, cover: w.cover, plays: w.value }))

  // 趋势：每天带渠道拆分 + 当日 Top3 视频 + 环比。
  // 「昨天」档只有一行，按小时拆成 24 个点，图才有形状。
  const trend =
    days === 1 ? hourlyTrend(rows[0]) : rows.map((row, i) => {
      const prev = dailyStats[dailyStats.length - days + i - 1]
      return {
        date: row.label,
        plays: row.plays,
        playsDouyin: row.playsDouyin,
        playsXigua: row.playsXigua,
        deltaPct: prev ? +(((row.plays - prev.plays) / prev.plays) * 100).toFixed(2) : null,
        topVideos: workPlaysOn(row).slice(0, 3).map((w) => ({ title: w.title, plays: w.plays })),
        published: works.filter((w) => w.publishedAt === row.date).length,
        homeVisits: row.homeVisits,
        likes: row.likes,
        comments: row.comments,
        shares: row.shares,
        avgPlaySeconds: row.avgPlaySeconds,
        finish5s: row.finish5s,
        fansNew: row.fansNew,
        fansLost: row.fansLost,
        fansNet: row.fansNew - row.fansLost,
        fansReturn: row.fansReturn,
        fansTotal: fansTotalByDate.get(row.date),
      }
    })

  const latest = rows[days - 1]
  const fansTotal = fansTotalByDate.get(latest.date)

  return {
    period: { start: rows[0].date, end: latest.date, days },
    profile: {
      fansTotal,
      likesTotal: 2422300 + sum(dailyStats, 'likes'),
      follow: 30,
    },
    overview: {
      dims,
      analysis: {
        plays,
        peerMedianDaily: peerBenchmarks.plays.median,
        peerMedianRange: peerBenchmarks.plays.median * days,
        percentile: dims[0].percentile,
      },
      topWorks,
    },
    works: {
      metrics: {
        plays,
        published,
        homeVisits: sum(rows, 'homeVisits'),
        likes: sum(rows, 'likes'),
        shares: sum(rows, 'shares'),
        comments: sum(rows, 'comments'),
        avgPlaySeconds: +avg(rows, 'avgPlaySeconds').toFixed(2),
        finish5s: +avg(rows, 'finish5s').toFixed(1),
      },
      trend,
    },
    fans: {
      metrics: {
        total: fansTotal,
        net: fansNet,
        gained: sum(rows, 'fansNew'),
        lost: sum(rows, 'fansLost'),
        returned: sum(rows, 'fansReturn'),
      },
      trend,
    },
  }
}

/* ─── 内容管理：作品列表 ───
 * 每个作品的累计指标从 work_daily_plays 推导；流量升/降通知条来自
 * 「近7日 vs 前7日」的真实对比，不是写死的文案开关。 */

const GALLERY_EVERY = 4 // 每第 4 个作品是图文，其余为视频

function buildWorksList() {
  // 一次遍历 60 天，按作品累计：总播放、近14天火花线、近7/前7
  const acc = new Map(works.map((w) => [w.id, { total: 0, spark: [], last7: 0, prev7: 0 }]))
  dailyStats.forEach((row, i) => {
    for (const wp of workPlaysOn(row)) {
      const a = acc.get(wp.id)
      if (!a) continue
      a.total += wp.plays
      const idxFromEnd = dailyStats.length - 1 - i // 0 = 最新
      if (idxFromEnd < 14) a.spark.push(wp.plays)
      if (idxFromEnd < 7) a.last7 += wp.plays
      else if (idxFromEnd < 14) a.prev7 += wp.plays
    }
  })

  return works
    .map((w, idx) => {
      const rnd = mulberry32(hashSeed(`work-meta-${w.id}`))
      const a = acc.get(w.id)
      const plays = a.total
      const gallery = idx % GALLERY_EVERY === GALLERY_EVERY - 1
      const secs = 31 + Math.floor(rnd() * 150)
      // 作品热度本身按 exp(-age/9) 衰减，直接比近7/前7会人人「流量减少」。
      // 用实际衰减比 ÷ 预期衰减比衡量：>1 跑赢预期（推荐加持），<1 跑输。
      const EXPECTED_DECAY = Math.exp(-7 / 9)
      const perf = a.prev7 > 0 ? a.last7 / a.prev7 / EXPECTED_DECAY : 1
      const notice =
        perf >= 1.5
          ? { tone: 'success', text: `恭喜作品获得更多推荐，近7日额外获得${fmtWan(Math.max(0, Math.round(a.last7 - a.prev7 * EXPECTED_DECAY)))}次播放` }
          : perf <= 0.88
            ? { tone: 'warning', text: '作品流量减少，优化后可以获得更多流量' }
            : null
      return {
        id: w.id,
        title: w.title,
        cover: w.cover,
        type: gallery ? 'gallery' : 'video',
        duration: gallery ? null : `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`,
        imageCount: gallery ? 3 + Math.floor(rnd() * 6) : null,
        publishedAt: `${w.publishedAt} ${String(Math.floor(rnd() * 24)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`,
        status: '已发布',
        pinned: idx === works.length - 1, // 最新一条被作者置顶
        tags: idx === works.length - 1 ? ['挑战：假装自己很酷', '官方活动：我爱我很棒'] : [],
        trafficDown: perf <= 0.88,
        notice,
        // 火花线按时间正序（旧→新；累计循环本身按 i 升序推入）
        spark: a.spark,
        metrics: {
          plays,
          likes: Math.round(plays * (0.05 + rnd() * 0.04)),
          comments: Math.round(plays * (0.006 + rnd() * 0.006)),
          shares: Math.round(plays * (0.003 + rnd() * 0.004)),
          favorites: Math.round(plays * (0.004 + rnd() * 0.004)),
          // 图文：完播率 + 2S 跳出率；视频：弹幕 + 封面点击率 + 平均播放占比
          danmaku: gallery ? null : Math.round(plays * (0.002 + rnd() * 0.003)),
          finishRate: gallery ? +(30 + rnd() * 15).toFixed(1) : null,
          bounce2s: gallery ? +(20 + rnd() * 15).toFixed(2) : null,
          coverClickRate: gallery ? null : +(30 + rnd() * 12).toFixed(1),
          avgPlayRatio: gallery ? null : +(24 + rnd() * 12).toFixed(2),
          fanGain: Math.round(plays * (0.001 + rnd() * 0.002)),
        },
      }
    })
    .sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.publishedAt < b.publishedAt ? 1 : -1))
}

const fmtWan = (n) => (n >= 10000 ? `${(n / 10000).toFixed(1).replace(/\.0$/, '')}万` : String(n))

export function handleCreatorWorks(req, res) {
  if (!acceptGet(req, res)) return
  ensureFreshData()
  sendCreatorJson(res, { total: works.length, list: buildWorksList() })
}

/* ─── 收入：我的变现 ───
 * 收入从 daily_stats 的播放/互动推导（播放 × RPM + 互动加成），再按
 * 星图任务 / 小程序推广计划 / 音乐推广计划 三个来源确定性拆分。 */

function incomeRow(row) {
  const rnd = mulberry32(hashSeed(`income-${row.date}`))
  // RPM 6-10 元/千播 + 互动率加成
  const total = (row.plays / 1000) * (6 + rnd() * 4) * (1 + row.interactRate / 100)
  const xingtuShare = 0.12 + rnd() * 0.16
  const miniappShare = 0.5 + rnd() * 0.18
  const xingtu = total * xingtuShare
  const miniapp = total * miniappShare
  return {
    date: row.label,
    total: +total.toFixed(2),
    xingtu: +xingtu.toFixed(2),
    miniapp: +miniapp.toFixed(2),
    music: +(total - xingtu - miniapp).toFixed(2),
  }
}

/** 昨日收入按小时拆 24 个点（昼夜曲线同播放）。 */
function hourlyIncome(row) {
  const day = incomeRow(row)
  const rnd = mulberry32(hashSeed(`income-h-${row.date}`))
  const weights = Array.from({ length: 24 }, (_, h) => {
    const base = 0.25 + Math.exp(-((h - 21) ** 2) / 14) * 1.6 + Math.exp(-((h - 12) ** 2) / 18) * 0.7
    return base * (0.85 + rnd() * 0.3)
  })
  const wSum = weights.reduce((s, x) => s + x, 0)
  return weights.map((w, h) => ({
    date: `${String(h).padStart(2, '0')}:00`,
    total: +((day.total * w) / wSum).toFixed(2),
    xingtu: +((day.xingtu * w) / wSum).toFixed(2),
    miniapp: +((day.miniapp * w) / wSum).toFixed(2),
    music: +((day.music * w) / wSum).toFixed(2),
  }))
}

const sumIncome = (rows) => +rows.reduce((s, r) => s + incomeRow(r).total, 0).toFixed(2)

/** 商单任务（进行中里置顶展示的一条）。 */
const FEATURED_TASK = {
  cover: '/bg/identity-v-album-1.png',
  title: '山海短剧cps90%高分佣高转化短剧《修罗帅》',
  deadlineTag: '7日内截止',
  brand: '山海短剧',
  category: '传媒及内容',
  deadline: '2026-07-30',
  commission: '90%',
  commissionNote: '分佣比例（按付费分佣结算）',
  budget: '¥ 80万',
  budgetNote: '剩余预算',
}

export function handleCreatorIncome(req, res) {
  if (!acceptGet(req, res)) return
  ensureFreshData()
  const url = new URL(req.url || '/', 'http://local')
  const range = RANGES[url.searchParams.get('range') || 'week'] ?? 7
  const yesterdayRow = dailyStats[dailyStats.length - 1]
  const trend = range === 1 ? hourlyIncome(yesterdayRow) : dailyStats.slice(-range).map(incomeRow)
  sendCreatorJson(res, {
    updatedAt: `${yesterdayRow.date}（每天10点更新）`,
    summary: {
      yesterday: incomeRow(yesterdayRow).total,
      last7: sumIncome(dailyStats.slice(-7)),
      last30: sumIncome(dailyStats.slice(-30)),
      // 可提现 = 全部 60 天累计中尚未提现的部分（演示按 62% 未提现）
      withdrawable: +(sumIncome(dailyStats) * 0.62).toFixed(2),
    },
    trend,
    tasksInProgress: 25,
    featuredTask: FEATURED_TASK,
  })
}

/* ─── 作品共创（创作服务 · 作品共创） ─── */

const COLLAB_AVATARS = [
  '/assets/avatar/1.png',
  '/assets/avatar/2.png',
  '/assets/avatar/3.png',
  '/assets/avatar/4.png',
  '/assets/avatar/罗永浩.png',
  '/icons/creator-center/creator-avatar.png',
]

const COLLAB_COVERS = [
  '/bg/cyber-city.png',
  '/bg/lifestyle-vlog-album-1.jpg',
  '/bg/scenes/lifestyle-seaside.png',
  '/bg/lifestyle-vlog-album-3.jpg',
  '/bg/scenes/lifestyle-street.png',
  '/bg/identity-v-album-1.png',
]

const COLLAB_TITLES = [
  '记录第一次拍短视频 希望跟大家一起分享生活 #美食精选 现在买机票还有一大波特价机票等着你哦',
  '带你打卡ins网红胜地，体验不一样的雪山风情 #旅行日记 沉浸式旅游攻略上线',
  '春日限定下午茶合集 #探店 手把手教你复刻网红同款，成本不到十块钱',
  '一个人也要好好吃饭 深夜食堂治愈系列 #生活方式 记录平凡日子里的小确幸',
  '城市漫游 vlog｜清晨六点的街道 #城市漫游 用镜头记录你没见过的城市角落',
  '拉花师翻车集锦第二弹 #在拍一种很新的vlog 咖啡日常的欢乐瞬间',
]

/** 四种共创状态：正常 / 关系已解除（灰） / 整体被平台解除（橙警告） /
 *  部分共创人被解除（橙警告）。 */
function buildCollabList() {
  return COLLAB_TITLES.map((title, i) => {
    const rnd = mulberry32(hashSeed(`collab-${i}`))
    const total = 3 + Math.floor(rnd() * 3) // 3-5 人
    const accepted = Math.max(2, total - Math.floor(rnd() * 2))
    const avatars = COLLAB_AVATARS.slice(0, total)
    const secs = 60 + Math.floor(rnd() * 120)
    const status = i === 1 ? 'dissolved' : i === 2 ? 'revoked' : i === 4 ? 'partial' : 'active'
    const day = 8 + i * 3
    return {
      id: `co${i + 1}`,
      title,
      cover: COLLAB_COVERS[i % COLLAB_COVERS.length],
      duration: `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`,
      publishedAt: `2026年06月${String(day).padStart(2, '0')}日 15:46`,
      total,
      accepted,
      avatars,
      status,
      notice:
        status === 'revoked'
          ? '共创关系被解除：因违反平台操作规范，已解除该作品的共创关系'
          : status === 'partial'
            ? '部分共创人的共创关系被解除：因违反平台操作规范，已解除 XXX 作者与此作品的共创关系'
            : null,
    }
  })
}

const COLLAB_FAQS = [
  '我被别人邀请进行共创会有次数限制吗？',
  '为什么我申请共创总是失败？',
  '共创作品的收益如何分配？',
  '如何解除已建立的共创关系？',
]

export function handleCreatorCollab(req, res) {
  if (!acceptGet(req, res)) return
  sendCreatorJson(res, {
    remainingThisMonth: 4,
    faqs: COLLAB_FAQS,
    list: buildCollabList(),
  })
}

/* ─── 活动管理（创作服务 · 活动管理） ─── */

const ACTIVITY_INSPIRATIONS = [
  { cover: '/bg/cards/banner-3.png', title: '包好笑的·主包开心夜·开放麦', audience: '面向指定作者邀约', start: '2025.02.23' },
  { cover: '/bg/cards/banner-8.png', title: '晒出你最猛的残局', audience: '面向指定作者邀约', start: '2025.02.23' },
  { cover: '/bg/cards/banner-12.png', title: '夏日限定·清凉一夏挑战赛', audience: '面向全部作者', start: '2025.06.01' },
  { cover: '/bg/cards/banner-16.png', title: '城市烟火气·街头美食大赏', audience: '面向指定作者邀约', start: '2025.05.10' },
]
const INSPIRATION_DESC =
  '为帮助作者提升粉丝粘性及收入，平台号召美食、旅行、生活记录等高粉作者自行举办挑战赛。挑战赛是由创作者发起特定主题挑战，号召大众带特定话题发布内容接招挑战的玩法…'

const ACTIVITY_STATUSES = ['pending', 'reviewing', 'ongoing', 'ongoing', 'rejected', 'ended']
const ACTIVITY_TITLES = [
  '晒出你最猛的残局',
  '主包开心夜·开放麦招募',
  '夏日清凉挑战赛',
  '街头美食大赏',
  '我的城市漫游计划',
  '雪山旅行 vlog 征集',
]

function buildActivities() {
  const list = ACTIVITY_TITLES.map((title, i) => {
    const rnd = mulberry32(hashSeed(`act-${i}`))
    const status = ACTIVITY_STATUSES[i]
    const rewardPhysical = i === 3
    const total = 89 + Math.floor(rnd() * 40)
    const remaining = status === 'ongoing' ? Math.floor(rnd() * total) : null
    return {
      id: `74270533731971592${10 + i}`,
      title,
      status, // pending/reviewing/ongoing/rejected/ended
      start: '2026-06-01',
      end: '2026-08-15',
      remainingDays: remaining,
      totalDays: total,
      audience: i % 3 === 2 ? '所有用户' : '仅粉丝',
      playType: i === 0 ? '打卡' : '榜单',
      rewardType: rewardPhysical ? 'physical' : 'virtual',
      activityType: i === 1 ? '官方灵感' : i === 2 ? '平台活动' : '你的活动',
      canPublish: status === 'ongoing',
    }
  })
  return { inspirations: ACTIVITY_INSPIRATIONS.map((c) => ({ ...c, desc: INSPIRATION_DESC })), myActivities: list }
}

export function handleCreatorActivities(req, res) {
  if (!acceptGet(req, res)) return
  sendCreatorJson(res, buildActivities())
}

/* ─── 原创保护（创作服务 · 原创保护） ─── */

const COPYRIGHT_BENEFITS = [
  { key: 'onsite', name: '站内维权' },
  { key: 'impersonation', name: '冒用治理' },
  { key: 'protect', name: '作品保护' },
  { key: 'offsite', name: '站外维权' },
  { key: 'jury', name: '抄袭评审团' },
  { key: 'transfer', name: '粉丝转移' },
  { key: 'litigation', name: '诉讼维权' },
]

function buildCopyright() {
  return {
    steps: [
      { label: '原创度低', action: '已完成', state: 'done' },
      { label: '原创度良好', action: '去认证', state: 'current' },
      { label: '原创认证', action: '去查看', state: 'todo' },
    ],
    benefits: COPYRIGHT_BENEFITS,
    videos: Array.from({ length: 8 }, (_, i) => ({
      id: `cv${i + 1}`,
      cover: `/bg/cards/banner-${(i % 6) + 1}.png`,
      title: '创作者如遇到被搬运、抄袭视频咋办',
    })),
    announcements: [
      { title: '原创保护周报（11.1~11.7）', tag: '新' },
      { title: '2026.06 处罚公告' },
      { title: '抖音关于治理"冒用他人营销"公告' },
    ],
  }
}

export function handleCreatorCopyright(req, res) {
  if (!acceptGet(req, res)) return
  sendCreatorJson(res, buildCopyright())
}

/* ─── 抖音指数（创作服务 · 抖音指数） ─── */

const HOT_REALTIME = [
  '原来每个省都有自己的省冰', '殷墟还藏了多少老祖宗的秘密', '中国多项硬核成果接连刷屏',
  'A股', '潮流舞蹈这票到底投给谁', '交换你相册里的蓝色瞬间', '这届年轻人开始整顿职场', '春天的第一杯奶茶',
]
const HOT_SURGING = [
  '委内瑞拉地震9名中国公民', '佛得角把世界杯踢成了旅游', '最适合我的鼓点BGM找到了',
  '火影手游宇智波氛围感合影', '千香黎非摇萌翻全网', '摇滚萝莉第三季先导预告上线', '打工人的早八生存图鉴', '周末去哪儿玩',
]

function buildHotBoard(names, seed) {
  return names.map((name, i) => {
    const rnd = mulberry32(hashSeed(`${seed}-${i}`))
    const base = seed === 'rt' ? 1250 - i * 55 : 770 - i * 1.3
    const index = +(base - rnd() * 12).toFixed(1)
    const change = i < 1 ? 'flat' : rnd() > 0.62 ? 'up' : rnd() > 0.4 ? 'down' : 'flat'
    return { rank: i + 1, name, index: `${index}万`, change }
  })
}

export function handleCreatorIndexHot(req, res) {
  if (!acceptGet(req, res)) return
  sendCreatorJson(res, {
    tabs: ['关键词', '达人', '视频', '品牌', '话题'],
    bubbles: ['女装', '好物分享', '小米12', '护肤', '三农', '数码', '亲子'],
    realtime: buildHotBoard(HOT_REALTIME, 'rt'),
    surging: buildHotBoard(HOT_SURGING, 'sg'),
  })
}

/* ─── 直播管理（权限菜单，头像开关控制） ─── */

const LIVE_COVERS = ['/assets/avatar/1.png', '/assets/avatar/罗永浩.png', '/bg/scenes/lifestyle-studio.png']
const LIVE_TITLES = ['直播名称', 'TIM 中国行', '毕业季·高考作文点评专场']

function buildLives() {
  return LIVE_TITLES.map((title, i) => {
    const rnd = mulberry32(hashSeed(`live-${i}`))
    const hours = 1 + (i % 3)
    const minutes = 10 + Math.floor(rnd() * 40)
    const peak = 6 + rnd() * 3 // 人气峰值（万）
    // 实时在线人数曲线：开播爬升 → 约 55% 时段达峰 → 结束回落（钟形 + 轻噪声）。
    // 每点用独立种子，不打乱主 rnd 序列，保持确定性。
    const points = 12
    const spark = Array.from({ length: points }, (_, t) => {
      const x = t / (points - 1)
      const shape = Math.exp(-((x - 0.55) ** 2) / 0.09)
      const noise = 0.9 + mulberry32(hashSeed(`live-${i}-${t}`))() * 0.2
      return +(peak * (0.2 + 0.8 * shape) * noise).toFixed(2)
    })
    const peakOnline = Math.max(...spark)
    const avgOnline = spark.reduce((a, b) => a + b, 0) / spark.length
    // 累计参与人数 ≈ 平均在线 × 时长 × 换手系数（>同时在线峰值，符合直播口径）
    const attend = avgOnline * hours * 2.4
    return {
      id: `live${i + 1}`,
      cover: LIVE_COVERS[i],
      duration: `0${hours}:${String(minutes).padStart(2, '0')}:00`,
      title,
      date: '2026年06月12日 17:34',
      status: '已结束',
      spark,
      metrics: [
        { label: '参与人数', value: `${attend.toFixed(1)}万` },
        { label: '涨粉数量', value: `${Math.round(6000 + rnd() * 4000)}` },
        { label: '直播时长', value: `${hours}小时` },
        { label: '人气峰值', value: `${peakOnline.toFixed(1)}万` },
      ],
    }
  })
}

export function handleCreatorLives(req, res) {
  if (!acceptGet(req, res)) return
  sendCreatorJson(res, { total: LIVE_TITLES.length, list: buildLives() })
}

/* ─── 首页「数据概览」板块（Figma 904-67124） ───
 * 最新作品卡 + 账号总览/直播数据趋势 + 8 个概览指标（较前 7 日增减）。 */

function buildHomeOverview() {
  const rows7 = dailyStats.slice(-7)
  const prev7 = dailyStats.slice(-14, -7)
  const s = (rows, k) => rows.reduce((a, r) => a + r[k], 0)
  const favOf = (rows) => rows.reduce((a, r) => a + Math.round(r.plays * 0.004), 0)
  const incOf = (rows) => Math.round(rows.reduce((a, r) => a + incomeRow(r).total, 0))

  // 8 个指标：value 原值 + 较前 7 日差值（涨为正）。type 决定前端格式化。
  const metric = (label, cur, prev, type = 'count') => ({ label, value: cur, delta: cur - prev, type })
  const metrics = [
    metric('总播放量', s(rows7, 'plays'), s(prev7, 'plays')),
    metric('新增粉丝数', s(rows7, 'fansNew'), s(prev7, 'fansNew')),
    metric('主页访问', s(rows7, 'homeVisits'), s(prev7, 'homeVisits')),
    metric('总收益', incOf(rows7), incOf(prev7), 'yuan'),
    metric('作品点赞', s(rows7, 'likes'), s(prev7, 'likes')),
    metric('作品评论', s(rows7, 'comments'), s(prev7, 'comments')),
    metric('作品收藏', favOf(rows7), favOf(prev7)),
    metric('作品分享', s(rows7, 'shares'), s(prev7, 'shares')),
  ]

  // 最新发布的作品（works 表末条）+ 一个体面的累计播放/点赞
  const rnd = mulberry32(hashSeed('home-latest'))
  const latestPlays = Math.round(3.2e7 + rnd() * 1.2e7)
  const latestWork = {
    cover: '/bg/identity-v-album-2.png',
    duration: '00:36',
    title: '新的一年·兔·be·fine#张杰',
    plays: latestPlays,
    likes: 235,
  }

  // 账号总览 = 播放量近 7 日；直播数据 = 参与人数走势（播放的一个折算）
  const accountTrend = rows7.map((r) => ({ date: r.label, value: r.plays }))
  const liveTrend = rows7.map((r) => ({ date: r.label, value: Math.round(r.plays * 0.22) }))

  // 互动管理：最新一条评论 + 一条私信（含未读增量）
  const interaction = {
    comments: {
      count: s(rows7, 'comments') % 900 + 120,
      time: '07-08 00:35',
      text: '你知道私人FM为什么没有倒退键只有下一首吗，因为错过了就是错过了…',
      source: '重庆通报1批次不合格食品，网络平台仍有售',
    },
    messages: {
      count: 23,
      time: '07-21 00:35',
      text: '"长的是深夜，短的是人生。"在你成长的这些年里，"真正放不下的那个人…',
      user: '酸豆角的小毛牛',
      avatar: '/assets/avatar/3.png',
    },
  }

  // 变现中心：近 7 日总变现（含商单/星图，量级大于纯 CPM 收益）
  const mRnd = mulberry32(hashSeed('home-monet'))
  const monetization = {
    range: `${rows7[0].date.slice(5).replace('-', '-')}~${rows7[6].date.slice(5)}`,
    amount: Math.round(350000 + mRnd() * 60000), // 元
    delta: Math.round(2000 + mRnd() * 3000),
    availableTasks: 3242,
    myTasks: 42,
    availableTaskTitle: '山海短剧cps90%高分佣高转化短剧《修罗帅》',
    myTaskTitle: '中国电信155G-星图投稿',
  }

  // 活动中心日历：以 dailyStats 末日所在月为准，活动是真实的日期区间，
  // 日历色条由活动区间推导、选中某天联动显示当天进行中的活动。
  const latest = dailyStats[dailyStats.length - 1]
  const [yy, mm, dd] = latest.date.split('-').map(Number)
  const firstWeekday = new Date(Date.UTC(yy, mm - 1, 1)).getUTCDay() // 0=周日
  const daysInMonth = new Date(Date.UTC(yy, mm, 0)).getUTCDate()
  const pad2 = (n) => String(n).padStart(2, '0')
  const md = (m, d) => `${pad2(m)}-${pad2(d)}` // MM-DD

  // 本月的真实活动（startDay/endDay 为当月的日；跨月活动截到本月边界展示）
  const events = [
    { title: '春日光合创作季', startDay: 1, endDay: 6, color: '#7CC4FF' },
    { title: '用营养守护足球梦', startDay: 4, endDay: 12, color: '#4E83FD' },
    { title: '潮流收藏在抖音', startDay: 10, endDay: 16, color: '#FE9EC0' },
    { title: '心动观赛季', startDay: 14, endDay: 23, color: '#FF9A3D' },
    { title: '快乐是小游戏给的', startDay: 20, endDay: 28, color: '#FE2C55' },
  ].map((e) => ({
    ...e,
    range: `${md(mm, e.startDay)} ~ ${md(mm, e.endDay)}`,
  }))

  // 色条标记从活动区间推导：某天被活动覆盖 → 标该活动颜色（多活动时取最早开始的）
  const marks = {}
  for (const e of events) {
    for (let d = e.startDay; d <= e.endDay && d <= daysInMonth; d++) {
      if (!(d in marks)) marks[d] = e.color
    }
  }

  // 默认选中「今天」，联动出当天进行中的活动
  const ongoingOn = (day) => events.filter((e) => day >= e.startDay && day <= e.endDay)
  const calendar = {
    year: yy,
    month: mm,
    today: dd,
    daysInMonth,
    firstWeekday,
    marks,
    selectedDay: dd,
    selectedLabel: `${yy}-${pad2(mm)}-${pad2(dd)}`,
    ongoing: ongoingOn(dd).length,
    events,
  }

  // 快速导航（品牌外链入口，纯展示）
  const quickNav = [
    { name: '巨量引擎', tint: '#2B5BFF', short: '引擎' },
    { name: '剪映', tint: '#000000', short: '剪映' },
    { name: '抖店', tint: '#FE2C55', short: '抖店' },
    { name: '巨量百应', tint: '#3B6EF5', short: '百应' },
  ]

  return {
    updatedAt: `${dailyStats[dailyStats.length - 1].date}（每天10点更新）`,
    latestWork,
    accountTrend,
    liveTrend,
    metrics,
    interaction,
    monetization,
    calendar,
    quickNav,
  }
}

export function handleCreatorHomeOverview(req, res) {
  if (!acceptGet(req, res)) return
  ensureFreshData()
  sendCreatorJson(res, buildHomeOverview())
}

/* 统一 JSON 响应（无缓存）。 */
function sendCreatorJson(res, obj) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(obj))
}

function acceptGet(req, res) {
  if ((req.method || '').toUpperCase() === 'GET') return true
  res.statusCode = 405
  res.setHeader('Allow', 'GET')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify({ error: 'method not allowed' }))
  return false
}

/* ─── HTTP 处理器 ─── */

const RANGES = { yesterday: 1, week: 7, month: 30 }

export function handleCreatorStats(req, res) {
  if (!acceptGet(req, res)) return
  ensureFreshData()
  const url = new URL(req.url || '/', 'http://local')
  const range = RANGES[url.searchParams.get('range') || 'week'] ?? 7
  sendCreatorJson(res, aggregate(range))
}
