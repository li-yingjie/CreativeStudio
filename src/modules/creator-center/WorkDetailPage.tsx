import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Play,
  Search,
  Smile,
  ThumbsDown,
  Trash2,
} from '@/shared/icons'
import { fmtCount, type WorkItem } from './api'
import { CREATOR_PROFILE } from './data'
import { fmtWorkDate } from './WorkRow'

/* ─── 作品详情页（设计稿 创作者中心26.7 · 1-38221 总览 / 1-38571 评论管理） ───
 * 从内容管理的作品列表点入。头部作品卡 + 总览/评论管理两个可用 tab
 * （流量分析/粉丝分析 按设计稿置灰），右上角前后切换浏览相邻作品。 */

export type WorkDetailTab = '总览' | '流量分析' | '粉丝分析' | '评论管理'

const BLUE = '#4E83FD'

/** 由 spark 派生的逐小时演示序列，缩放到目标总量级。 */
function hourlySeries(spark: number[], scaleTo: number) {
  const total = spark.reduce((a, b) => a + b, 0) || 1
  return spark.map((v, i) => ({
    // 23:00 起往后逐小时
    t: `${String((23 + i) % 24).padStart(2, '0')}:00`,
    v: Math.max(1, Math.round((v / total) * scaleTo)),
  }))
}

const cumulative = (rows: { t: string; v: number }[]) => {
  let acc = 0
  return rows.map((r) => ({ ...r, v: (acc += r.v) }))
}

/** 小型分段开关（新增/累计、每小时/每天）。 */
function SegToggle({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center rounded-md bg-[#F2F3F5] p-0.5 text-[12px]">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`rounded px-2 py-0.5 transition-colors ${
            value === o ? 'bg-white font-medium text-[#252632] shadow-sm' : 'text-[#252632]/50 hover:text-[#252632]'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** 指标小卡：选中态蓝边浅蓝底（设计稿 tile）。 */
function MetricTile({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-[#4E83FD] bg-[#EFF4FF]'
          : 'border-black/5 bg-[#FAFBFC] hover:bg-[#F2F3F5]'
      }`}
    >
      <div className="text-[12px] text-[#252632]/55">{label}</div>
      <div className="mt-1 text-[18px] font-semibold tabular-nums text-[#252632]">{value}</div>
    </button>
  )
}

/** 趋势卡内的面积图 + 底部仿 brush 条。 */
function DetailChart({ rows, id }: { rows: { t: string; v: number }[]; id: string }) {
  return (
    <div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity={0.22} />
                <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" strokeDasharray="2 4" />
            <XAxis
              dataKey="t"
              interval={1}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'rgba(37,38,50,0.45)' }}
            />
            <YAxis
              orientation="right"
              width={36}
              tickCount={5}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'rgba(37,38,50,0.45)' }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={BLUE}
              strokeWidth={1.6}
              fill={`url(#${id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* 仿 brush 缩略条：整段浅色曲线 + 选区高亮 */}
      <div className="relative mt-2 h-5 overflow-hidden rounded">
        <div className="absolute inset-0 opacity-50">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <Area type="monotone" dataKey="v" stroke={BLUE} strokeWidth={1} fill={`url(#${id})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-y-0 left-[28%] right-0 rounded bg-[#4E83FD]/15 ring-1 ring-[#4E83FD]/25" />
      </div>
    </div>
  )
}

/* ─── 评论管理（1-38571） ─── */

interface CommentItem {
  id: string
  avatar: string
  name: string
  time: string
  text: string
  replyCount?: number
  reply?: { name: string; time: string; text: string }
}

const SEED_COMMENTS: CommentItem[] = [
  {
    id: 'c1',
    avatar: '/bg/lifestyle-vlog-album-2.jpg',
    name: '月嫂任阿姨（技师级）',
    time: '昨天07:22',
    text: '👏👏👏👏👍👍👍',
  },
  {
    id: 'c2',
    avatar: '/bg/lifestyle-vlog-album-3.jpg',
    name: '..',
    time: '1天前',
    text: '铁胆火车侠是高达那个么？',
    replyCount: 1,
    reply: { name: CREATOR_PROFILE.name, time: '1天前', text: '哈哈不是哦，是童年的动画～' },
  },
]

function CommentActions({ onAct }: { onAct: (label: string) => void }) {
  const items = [
    { icon: Heart, label: '0' },
    { icon: ThumbsDown, label: '' },
    { icon: MessageCircle, label: '回复' },
    { icon: Trash2, label: '删除' },
    { icon: AlertTriangle, label: '举报' },
  ]
  return (
    <div className="mt-2 flex items-center gap-5 text-[12px] text-[#252632]/45">
      {items.map(({ icon: Icon, label }, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onAct(label || '点踩')}
          className="flex items-center gap-1 transition-colors hover:text-[#252632]/80"
        >
          <Icon size={13} strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </div>
  )
}

function CommentsPanel() {
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [comments, setComments] = useState<CommentItem[]>(SEED_COMMENTS)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const visible = comments.filter((c) => (search ? c.text.includes(search) || c.name.includes(search) : true))

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setComments((prev) => [
      { id: `mine-${prev.length}`, avatar: CREATOR_PROFILE.avatar, name: CREATOR_PROFILE.name, time: '刚刚', text },
      ...prev,
    ])
    setDraft('')
  }

  return (
    <div>
      {/* 评论输入 */}
      <div className="flex items-start gap-3 pt-5">
        <img src={CREATOR_PROFILE.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) send()
            }}
            placeholder="有爱评论，说点好听的~"
            className="h-10 w-full rounded bg-[#F2F3F5] px-3 text-[13px] text-[#252632] outline-none placeholder:text-[#252632]/40 focus:bg-[#EBEDF0]"
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              title="表情"
              onClick={() => toast('表情面板（演示）')}
              className="text-[#252632]/45 hover:text-[#252632]/80"
            >
              <Smile size={17} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={send}
              className={`text-[13px] font-medium ${
                draft.trim() ? 'text-[#161823] hover:opacity-75' : 'text-[#252632]/30'
              }`}
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* 筛选行 */}
      <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-black/5 pt-4">
        {['全部评论', '全部人群', '最新发布'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => toast(`${f} 筛选（演示）`)}
            className="flex items-center gap-0.5 text-[13px] text-[#252632]/75 hover:text-[#252632]"
          >
            {f}
            <ChevronDown size={13} className="text-[#252632]/45" />
          </button>
        ))}
        <label className="ml-auto flex h-8 items-center gap-1.5 rounded bg-[#F2F3F5] px-2.5">
          <Search size={13} aria-hidden className="text-[#252632]/45" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索评论关键词"
            className="w-32 bg-transparent text-[12px] text-[#252632] outline-none placeholder:text-[#252632]/40"
          />
        </label>
      </div>

      {/* 评论列表 */}
      <div className="mt-2 divide-y divide-black/[0.04]">
        {visible.map((c) => (
          <div key={c.id} className="flex items-start gap-3 py-4">
            <img src={c.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[#252632]">{c.name}</div>
              <div className="mt-0.5 text-[12px] text-[#252632]/40">{c.time}</div>
              <div className="mt-2 text-[14px] leading-[20px] text-[#252632]">{c.text}</div>
              <CommentActions onAct={(label) => toast(`${label}（演示）`)} />
              {c.replyCount ? (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedReplies((prev) => {
                        const next = new Set(prev)
                        if (next.has(c.id)) next.delete(c.id)
                        else next.add(c.id)
                        return next
                      })
                    }
                    className="flex items-center gap-1 text-[12px] text-[#252632]/55 hover:text-[#252632]"
                  >
                    <span className="mr-1 inline-block h-px w-8 bg-black/15" />
                    {expandedReplies.has(c.id) ? '收起回复' : `查看${c.replyCount}条回复`}
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${expandedReplies.has(c.id) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedReplies.has(c.id) && c.reply && (
                    <div className="mt-3 flex items-start gap-2.5 pl-9">
                      <img src={CREATOR_PROFILE.avatar} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                      <div className="min-w-0">
                        <span className="text-[12.5px] font-medium text-[#252632]">
                          {c.reply.name}
                          <span className="ml-1.5 rounded bg-[#FE2C55]/10 px-1 text-[11px] font-normal text-[#FE2C55]">作者</span>
                        </span>
                        <div className="mt-0.5 text-[12px] text-[#252632]/40">{c.reply.time}</div>
                        <div className="mt-1 text-[13px] text-[#252632]">{c.reply.text}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="py-6 text-center text-[13px] text-[#252632]/40">没有更多评论</div>
    </div>
  )
}

/* ─── 总览（1-38221） ─── */

function OverviewPanel({ work }: { work: WorkItem }) {
  const m = work.metrics
  const [playMetric, setPlayMetric] = useState(0)
  const [fanMetric, setFanMetric] = useState(0)
  const [playMode, setPlayMode] = useState('新增')
  const [playGrain, setPlayGrain] = useState('每小时')
  const [fanMode, setFanMode] = useState('新增')
  const [fanGrain, setFanGrain] = useState('每小时')

  // 视频体裁没有完播率/跳出率字段 — 用设计稿数值兜底，保持稳定展示。
  const finishRate = m.finishRate ?? 27.31
  const bounce2s = m.bounce2s ?? 62.43
  const fanLoss = Math.max(1, Math.round(m.fanGain * 0.08))
  const fanPlayRatio = m.avgPlayRatio != null ? Math.min(95, m.avgPlayRatio * 2) : 59.8

  const isWorkshop = Boolean(work.workshopKind)
  const playTiles = isWorkshop
    ? [
        { label: '访问量', value: fmtCount(m.plays), scale: m.plays },
        { label: '访客数', value: fmtCount(m.likes), scale: m.likes },
        { label: '互动量', value: fmtCount(m.comments), scale: m.comments },
        { label: '分享量', value: fmtCount(m.shares), scale: m.shares },
        { label: '转化率', value: `${finishRate}%`, scale: 100 },
        { label: '收藏量', value: fmtCount(m.favorites), scale: m.favorites },
      ]
    : [
        { label: '播放量', value: fmtCount(m.plays), scale: m.plays },
        { label: '点赞量', value: fmtCount(m.likes), scale: m.likes },
        { label: '评论量', value: fmtCount(m.comments), scale: m.comments },
        { label: '分享量', value: fmtCount(m.shares), scale: m.shares },
        { label: '完播率', value: `${finishRate}%`, scale: 100 },
        { label: '2秒跳出率', value: `${bounce2s}%`, scale: 100 },
      ]
  const fanTiles = isWorkshop
    ? [
        { label: '新增用户', value: fmtCount(m.fanGain), scale: Math.max(m.fanGain, 8) },
        { label: '流失用户', value: fmtCount(fanLoss), scale: Math.max(fanLoss * 4, 8) },
        { label: '活跃占比', value: `${fanPlayRatio.toFixed(1)}%`, scale: 100 },
      ]
    : [
        { label: '涨粉量', value: fmtCount(m.fanGain), scale: Math.max(m.fanGain, 8) },
        { label: '脱粉量', value: fmtCount(fanLoss), scale: Math.max(fanLoss * 4, 8) },
        { label: '粉丝播放占比', value: `${fanPlayRatio.toFixed(1)}%`, scale: 100 },
      ]

  const playRows = useMemo(() => {
    const base = hourlySeries(work.spark, playTiles[playMetric].scale)
    return playMode === '累计' ? cumulative(base) : base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work, playMetric, playMode, playGrain])
  const fanRows = useMemo(() => {
    const base = hourlySeries([...work.spark].reverse(), fanTiles[fanMetric].scale)
    return fanMode === '累计' ? cumulative(base) : base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work, fanMetric, fanMode, fanGrain])

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* 播放数据卡 */}
      <section className="rounded-[16px] bg-white p-5">
        <div className="grid grid-cols-3 gap-2.5">
          {playTiles.map((t, i) => (
            <MetricTile key={t.label} label={t.label} value={t.value} active={playMetric === i} onClick={() => setPlayMetric(i)} />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <SegToggle options={['新增', '累计']} value={playMode} onChange={setPlayMode} />
          <SegToggle options={['每小时', '每天']} value={playGrain} onChange={setPlayGrain} />
        </div>
        <div className="mt-3">
          <DetailChart rows={playRows} id={`detail-play-${work.id}`} />
        </div>
      </section>

      {/* 粉丝数据卡 */}
      <section className="rounded-[16px] bg-white p-5">
        <div className="grid grid-cols-3 gap-2.5">
          {fanTiles.map((t, i) => (
            <MetricTile key={t.label} label={t.label} value={t.value} active={fanMetric === i} onClick={() => setFanMetric(i)} />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <SegToggle options={['新增', '累计']} value={fanMode} onChange={setFanMode} />
          <SegToggle options={['每小时', '每天']} value={fanGrain} onChange={setFanGrain} />
        </div>
        <div className="mt-3">
          <DetailChart rows={fanRows} id={`detail-fan-${work.id}`} />
        </div>
      </section>
    </div>
  )
}

/* ─── 页面主体 ─── */

export default function WorkDetailPage({
  work,
  initialTab = '总览',
  onBack,
  onPrev,
  onNext,
}: {
  work: WorkItem
  initialTab?: WorkDetailTab
  onBack: () => void
  /** 浏览相邻作品；到头时不传，箭头置灰。 */
  onPrev?: () => void
  onNext?: () => void
}) {
  const [tab, setTab] = useState<WorkDetailTab>(initialTab)
  const updatedAt = useMemo(() => {
    const d = new Date(Date.now() - 86400000)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日23:58`
  }, [])
  const hasChallenge = work.tags.some((t) => t.startsWith('挑战'))
  const hasTopic = work.title.includes('#')

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* 返回 + 标题 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            title="返回内容管理"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#252632]/70 transition-colors hover:bg-black/5 hover:text-[#252632]"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-[16px] font-semibold text-[#252632]">作品管理</h2>
        </div>

        {/* 作品头卡 */}
        <section className="mt-3 rounded-[20px] bg-white p-6">
          <div className="flex items-start gap-5">
            <div className="relative h-[164px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-black/5">
              <img src={work.cover} alt={work.title} className="h-full w-full object-cover" />
              {!work.workshopKind && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Play size={26} className="text-white/85 drop-shadow" fill="currentColor" />
                </span>
              )}
              {/* AI 工坊作品：类型 Tag 放封面左上角 */}
              {work.workshopKind ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-[#3370FF] px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm">
                  {work.workshopKind}
                </span>
              ) : (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[11px] text-white">
                  {work.type === 'gallery' ? `${work.imageCount}张` : work.duration}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-6">
              <h3 className="truncate text-[16px] font-medium text-[#252632]">{work.title}</h3>
              {work.workshopKind ? (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[#252632]/60">
                  <span>{fmtWorkDate(work)}发布</span>
                  <i className="h-3 w-px bg-black/10" />
                  <span>来源: AI 工坊</span>
                  <i className="h-3 w-px bg-black/10" />
                  <span>类型: {work.workshopKind}</span>
                </div>
              ) : (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[#252632]/60">
                  <span>{fmtWorkDate(work)}发布</span>
                  <i className="h-3 w-px bg-black/10" />
                  <span>POI: 无</span>
                  <i className="h-3 w-px bg-black/10" />
                  <span>特效: 无</span>
                  <i className="h-3 w-px bg-black/10" />
                  <span>挑战: {hasChallenge ? '有' : '无'}</span>
                  <i className="h-3 w-px bg-black/10" />
                  <span>贴纸: 无</span>
                  <i className="h-3 w-px bg-black/10" />
                  <span>话题: {hasTopic ? '有' : '无'}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => toast('作品状态详情（演示）')}
                className="mt-3 inline-flex items-center gap-1 rounded bg-[#F2F3F5] py-1 pl-1.5 pr-1 text-[12px] text-[#252632]/80 hover:bg-[#EBEDF0]"
              >
                <CheckCircle2 size={14} className="text-[#00B578]" />
                作品状态正常
                <ChevronRight size={13} className="text-[#252632]/45" />
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                title="上一个作品"
                disabled={!onPrev}
                onClick={onPrev}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#252632]/70 transition-colors hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                title="下一个作品"
                disabled={!onNext}
                onClick={onNext}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#252632]/70 transition-colors hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="mt-1 flex items-center border-b border-black/5 px-1">
          {(['总览', '流量分析', '粉丝分析', '评论管理'] as const).map((t) => {
            const disabled = t === '流量分析' || t === '粉丝分析'
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                disabled={disabled}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-3 pb-2.5 pt-3 text-[14px] transition-colors ${
                  tab === t
                    ? 'border-[#161823] font-medium text-[#252632]'
                    : disabled
                      ? 'cursor-not-allowed border-transparent text-[#252632]/30'
                      : 'border-transparent text-[#252632]/55 hover:text-[#252632]/80'
                }`}
              >
                {t}
              </button>
            )
          })}
          <span className="ml-auto pr-1 text-[12px] text-[#252632]/40">数据更新于{updatedAt}</span>
        </div>

        {tab === '评论管理' ? (
          <section className="mt-4 rounded-[16px] bg-white px-6 pb-4 pt-1">
            <CommentsPanel />
          </section>
        ) : (
          <OverviewPanel work={work} />
        )}
      </div>
    </main>
  )
}
