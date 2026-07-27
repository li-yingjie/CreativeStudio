import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  FolderPlus,
  Layers,
  Lock,
  Pencil,
  Search,
  Trash2,
  Upload,
} from '@/shared/icons'
import { useCreatorWorks, type WorkItem } from './api'
import WorkRow from './WorkRow'
import WorkDetailPage, { type WorkDetailTab } from './WorkDetailPage'

/* ─── 内容管理页（设计稿 创作者中心26.7 · 20-8421 作品 / 20-9666 作品合集） ───
 * 工具栏（作品/合集页签 + 状态文字筛选 + 时间/体裁/搜索/导出）+ 行列表。
 * 作品行可点进 WorkDetailPage（1-38221 / 1-38571）。 */

const demoToast = (action: string, name: string) => toast(`「${name.slice(0, 12)}…」${action}（演示）`)

/** 工坊类型体裁选项 — 值与 WorkItem.workshopKind、AI 工坊的
 *  PROJECT_KIND_LABELS 对齐（运营提案暂不在内容管理展示）。 */
const WORKSHOP_GENRES = ['小程序', 'AI 分身', '网页游戏', '营销 H5', '网站应用'] as const

const WS_SPARK = [14, 20, 17, 25, 31, 27, 34, 30, 39, 34, 42, 37, 46, 50]

/** AI 工坊发布的作品 — 在内容管理里和视频/图文同列展示，按工坊指标口径。
 *  演示数据，封面复用各自项目的现成图。 */
const WORKSHOP_WORKS: WorkItem[] = [
  {
    id: 'ws-tarot',
    title: '每日塔罗运势 · 星座小程序',
    cover: '/bg/scenes/lifestyle-studio.png',
    type: 'video',
    workshopKind: '小程序',
    duration: null,
    imageCount: null,
    publishedAt: '2026-07-16 10:24',
    status: '已发布',
    pinned: false,
    tags: [],
    trafficDown: false,
    notice: null,
    spark: WS_SPARK,
    metrics: {
      plays: 38200, likes: 12400, comments: 860, shares: 1530, favorites: 2040,
      danmaku: null, finishRate: 42.6, bounce2s: null, coverClickRate: null,
      avgPlayRatio: 51, fanGain: 3120,
    },
  },
  {
    id: 'ws-avatar',
    title: '陶白白 Sensei · 星座情感 AI 分身',
    cover: '/tbb.jpeg',
    type: 'video',
    workshopKind: 'AI 分身',
    duration: null,
    imageCount: null,
    publishedAt: '2026-07-14 19:08',
    status: '已发布',
    pinned: false,
    tags: [],
    trafficDown: false,
    notice: null,
    spark: [...WS_SPARK].reverse(),
    metrics: {
      plays: 51600, likes: 20800, comments: 4300, shares: 2670, favorites: 3180,
      danmaku: null, finishRate: 68.2, bounce2s: null, coverClickRate: null,
      avgPlayRatio: 60, fanGain: 4210,
    },
  },
  {
    id: 'ws-game',
    title: '竖版弹幕射击 · 网页小游戏',
    cover: '/garuda/assets/Start.jpg',
    type: 'video',
    workshopKind: '网页游戏',
    duration: null,
    imageCount: null,
    publishedAt: '2026-07-11 15:42',
    status: '已发布',
    pinned: false,
    tags: [],
    trafficDown: false,
    notice: null,
    spark: WS_SPARK,
    metrics: {
      plays: 27400, likes: 9600, comments: 720, shares: 3140, favorites: 1180,
      danmaku: null, finishRate: 33.5, bounce2s: null, coverClickRate: null,
      avgPlayRatio: 44, fanGain: 1560,
    },
  },
  {
    id: 'ws-h5',
    title: '六一儿童节 · 抽奖营销 H5',
    cover: '/h5/children-day/hero-gifts.png',
    type: 'video',
    workshopKind: '营销 H5',
    duration: null,
    imageCount: null,
    publishedAt: '2026-07-08 12:30',
    status: '已发布',
    pinned: false,
    tags: [],
    trafficDown: false,
    notice: null,
    spark: WS_SPARK,
    metrics: {
      plays: 64200, likes: 18300, comments: 1420, shares: 8600, favorites: 2470,
      danmaku: null, finishRate: 27.8, bounce2s: null, coverClickRate: null,
      avgPlayRatio: 39, fanGain: 2890,
    },
  },
]

/** 时间筛选：预设区间 → 发布时间下限（YYYY-MM-DD，字符串比较即可）。 */
const TIME_RANGES = ['所有时间', '近7天', '近30天', '近90天'] as const

function timeCutoff(range: string): string | null {
  const days = range === '近7天' ? 7 : range === '近30天' ? 30 : range === '近90天' ? 90 : null
  if (days == null) return null
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

/** 灰底工具 chip（时间/体裁/排序/导出共用外观，统一导航 275-22737）。 */
const CHIP =
  'flex h-9 items-center gap-2 rounded-lg bg-[#f8f8f8] px-3 text-[14px] font-semibold text-[#1c1f23]/80 hover:bg-[#f0f0f0]'

/** 状态文字筛选：全部｜已发布｜审核中…，竖线分隔（设计稿样式）。 */
function StatusFilter({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div role="group" aria-label="发布状态" className="flex items-center">
      {options.map((o, i) => (
        <span key={o} className="flex items-center">
          {i > 0 && <i className="mx-1 h-3 w-px bg-[#d9d9d9]" />}
          <button
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`px-2 py-1.5 text-[14px] leading-5 transition-colors ${
              value === o ? 'font-semibold text-[#252632]' : 'text-[rgba(37,38,50,0.6)] hover:text-[#252632]/80'
            }`}
          >
            {o}
          </button>
        </span>
      ))}
    </div>
  )
}

function DeleteWorkDialog({
  work,
  onCancel,
  onConfirm,
}: {
  work: WorkItem | null
  onCancel: () => void
  onConfirm: (work: WorkItem) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (work && !dialog.open) dialog.showModal()
    if (!work && dialog.open) dialog.close()
  }, [work])

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-work-title"
      aria-describedby="delete-work-description"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className="m-auto w-[min(420px,calc(100vw-32px))] rounded-2xl border border-black/10 bg-white p-0 text-[#252632] shadow-xl backdrop:bg-black/50"
    >
      <div className="p-5">
        <h3 id="delete-work-title" className="text-balance text-[16px] font-semibold">确认删除作品？</h3>
        <p id="delete-work-description" className="mt-2 text-pretty text-[13px] leading-5 text-[#252632]/65">
          删除“{work?.title ?? ''}”后将从当前列表移除，你仍可在提示出现时撤销。
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" autoFocus onClick={onCancel} className="rounded-lg bg-[#F2F3F5] px-4 py-2 text-[13px] font-medium hover:bg-[#EBEDF0]">
            取消
          </button>
          <button type="button" onClick={() => work && onConfirm(work)} className="rounded-lg bg-[#D92D20] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#B42318]">
            删除
          </button>
        </div>
      </div>
    </dialog>
  )
}

/* ─── 作品合集（20-9666）：演示数据，封面复用真实作品图 ─── */

interface CollectionItem {
  id: string
  title: string
  desc: string
  count: number
  cover: string
  date: string
  status: string
  metrics: { label: string; value: string }[]
}

const buildCollections = (works: WorkItem[]): CollectionItem[] => [
  {
    id: 'col-1',
    title: '快乐假期',
    desc: '无合集描述',
    count: 11,
    cover: works[1]?.cover ?? '/bg/lifestyle-vlog-album-2.jpg',
    date: '2025年05月12日 17:34',
    status: '已发布',
    metrics: [
      { label: '播放', value: '3.6万' },
      { label: '收藏', value: '802' },
      { label: '点赞', value: '802' },
      { label: '评论', value: '410' },
      { label: '分享', value: '24' },
      { label: '完播率', value: '37.8%' },
      { label: '2S 跳出率', value: '29.41%' },
      { label: '人均播放时长', value: '12 秒' },
    ],
  },
  {
    id: 'col-2',
    title: '运动生活',
    desc: '无合集描述',
    count: 3,
    cover: works[2]?.cover ?? '/bg/lifestyle-vlog-album-3.jpg',
    date: '2025年05月12日 17:34',
    status: '已发布',
    metrics: [
      { label: '播放', value: '1.3万' },
      { label: '收藏', value: '473' },
      { label: '点赞', value: '473' },
      { label: '评论', value: '410' },
      { label: '分享', value: '24' },
      { label: '完播率', value: '37.8%' },
      { label: '2S 跳出率', value: '29.41%' },
      { label: '人均播放时长', value: '12 秒' },
    ],
  },
]

function CollectionRow({ col }: { col: CollectionItem }) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row">
      <div className="relative h-[176px] w-[132px] shrink-0 overflow-hidden rounded-lg bg-black/5">
        <img src={col.cover} alt={col.title} className="h-full w-full object-cover" />
        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
          <Layers size={11} />
          {col.count}个作品
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:gap-6">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-[15px] font-medium text-[#252632]">{col.title}</h4>
            <div className="mt-1.5 text-[13px] text-[#252632]/45">{col.desc}</div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 xl:shrink-0">
            <button type="button" onClick={() => demoToast('进入编辑', col.title)} className="flex items-center gap-1 text-[12px] text-[#252632]/60 hover:text-[#252632]">
              <Pencil size={13} strokeWidth={1.8} /> 编辑合集
            </button>
            <button type="button" onClick={() => demoToast('已设为私密', col.title)} className="flex items-center gap-1 text-[12px] text-[#252632]/60 hover:text-[#252632]">
              <Lock size={13} strokeWidth={1.8} /> 设为私密
            </button>
            <button type="button" onClick={() => demoToast('删除合集', col.title)} className="flex items-center gap-1 text-[12px] text-[#F53F3F] hover:text-[#d63030]">
              <Trash2 size={13} strokeWidth={1.8} /> 删除合集
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2.5 text-[13px]">
          <span className="text-[#252632]/60">{col.date}</span>
          <span className="text-[#00B578]">{col.status}</span>
        </div>
        <div className="mt-auto flex items-end overflow-x-auto pt-4">
          {col.metrics.map((c) => (
            <div key={c.label} className="min-w-[92px] border-l border-black/5 px-3 first:border-l-0 first:pl-0">
              <div className="truncate text-[12px] text-[#252632]/45">{c.label}</div>
              <div className="mt-1 text-[14px] font-semibold tabular-nums text-[#252632]">{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ContentPage() {
  const { data, error } = useCreatorWorks()
  const [tab, setTab] = useState<'作品' | '作品合集'>('作品')
  const [genre, setGenre] = useState('全部')
  const [status, setStatus] = useState('全部')
  const [colStatus, setColStatus] = useState('全部')
  const [timeRange, setTimeRange] = useState<string>('所有时间')
  const [search, setSearch] = useState('')
  // 本地覆盖：置顶切换 / 删除（demo 内存态，刷新还原）
  const [pinnedOverride, setPinnedOverride] = useState<Record<string, boolean>>({})
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<WorkItem | null>(null)
  /** 作品详情路由：由列表点入；prev/next 在当前筛选序列里移动。 */
  const [detail, setDetail] = useState<{ id: string; tab: WorkDetailTab } | null>(null)

  const list = useMemo(() => {
    if (!data) return []
    // AI 工坊作品与视频/图文同列展示（工坊在前，再按日期统一排序）。
    return [...WORKSHOP_WORKS, ...data.list]
      .filter((w) => !deleted.has(w.id))
      .map((w) => ({ ...w, pinned: pinnedOverride[w.id] ?? w.pinned }))
      .filter((w) =>
        genre === '全部'
          ? true
          : genre === '视频'
            ? w.type === 'video' && !w.workshopKind
            : genre === '图文'
              ? w.type === 'gallery' && !w.workshopKind
              : w.workshopKind === genre,
      )
      .filter((w) => (status === '全部' ? true : w.status === status))
      .filter((w) => {
        const cutoff = timeCutoff(timeRange)
        return cutoff ? w.publishedAt.slice(0, 10) >= cutoff : true
      })
      .filter((w) => (search ? w.title.includes(search) : true))
      .sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.publishedAt < b.publishedAt ? 1 : -1))
  }, [data, deleted, pinnedOverride, genre, status, timeRange, search])

  const collections = useMemo(() => buildCollections(data?.list ?? []), [data])

  const confirmDelete = (work: WorkItem) => {
    setDeleted((prev) => new Set(prev).add(work.id))
    setPendingDelete(null)
    toast(`已删除“${work.title.slice(0, 12)}…”`, {
      duration: 6000,
      action: {
        label: '撤销',
        onClick: () => setDeleted((prev) => {
          const next = new Set(prev)
          next.delete(work.id)
          return next
        }),
      },
    })
  }

  /* ── 详情页分支 ── */
  if (detail) {
    const idx = list.findIndex((w) => w.id === detail.id)
    const work = idx >= 0 ? list[idx] : null
    if (work) {
      return (
        <WorkDetailPage
          key={`${detail.id}-${detail.tab}`}
          work={work}
          initialTab={detail.tab}
          onBack={() => setDetail(null)}
          onPrev={idx > 0 ? () => setDetail({ id: list[idx - 1].id, tab: '总览' }) : undefined}
          onNext={idx < list.length - 1 ? () => setDetail({ id: list[idx + 1].id, tab: '总览' }) : undefined}
        />
      )
    }
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-white">
      {/* 统一导航 275-22737:页面 8px 内边距,头部 16px,筛选行下描边,卡片列表贴排 */}
      <div className="p-2">
        <div className="px-4 pt-4">
          <h2 className="text-balance pb-3 text-[18px] font-semibold leading-6 text-[#161823]">内容管理</h2>

          {/* 筛选行（设计稿：页签在左，状态/时间/体裁/搜索/导出靠右,底部描边） */}
          <div className="flex flex-wrap items-center gap-4 border-b border-[rgba(45,66,107,0.12)] pb-4">
            <div role="tablist" aria-label="内容类型" className="flex items-center gap-2">
              {([
                ['作品', `作品（${data ? data.total + WORKSHOP_WORKS.length : '…'}）`],
                ['作品合集', '作品合集 (20)'],
              ] as const).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  id={`content-tab-${t}`}
                  role="tab"
                  aria-selected={tab === t}
                  aria-controls={`content-panel-${t}`}
                  onClick={() => setTab(t)}
                  className={`h-9 rounded-[4px] px-3 text-[14px] leading-5 transition-colors ${
                    tab === t
                      ? 'bg-[rgba(46,50,56,0.09)] font-semibold text-[#1c1f23]'
                      : 'bg-[#f8f8f8] text-[rgba(37,38,50,0.6)] hover:text-[#252632]/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-4">
              {tab === '作品' ? (
                <>
                  <StatusFilter
                    options={['全部', '已发布', '审核中', '未通过']}
                    value={status}
                    onChange={setStatus}
                  />
                  <label className={`${CHIP} relative`}>
                    <Calendar size={16} aria-hidden />
                    <select
                      aria-label="发布时间"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="appearance-none bg-transparent font-medium text-[#252632] outline-none"
                    >
                      {TIME_RANGES.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                  <label className="relative flex h-9 items-center gap-3 rounded-lg bg-[rgba(22,24,35,0.05)] px-3">
                    <span className="text-[13px] text-[rgba(22,24,35,0.6)]">体裁</span>
                    <select
                      aria-label="体裁"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="appearance-none bg-transparent pr-4 text-[14px] font-semibold text-[#1c1f23] outline-none"
                    >
                      {['全部', '视频', '图文', ...WORKSHOP_GENRES].map((option) => <option key={option}>{option}</option>)}
                    </select>
                    <ChevronDown size={13} aria-hidden className="pointer-events-none absolute right-2.5 text-[#252632]/50" />
                  </label>
                  <label className="flex h-9 w-[180px] items-center gap-2 rounded-lg bg-[#f8f8f8] px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#4E83FD]">
                    <span className="sr-only">搜索作品</span>
                    <Search size={16} aria-hidden className="text-[#252632]/45" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="搜索作品"
                      className="w-full bg-transparent text-[14px] text-[#252632] outline-none placeholder:text-[rgba(37,38,50,0.6)]"
                    />
                  </label>
                  <button type="button" onClick={() => toast('导出成功（演示）')} className={CHIP}>
                    <Upload size={16} /> 导出数据
                  </button>
                </>
              ) : (
                <>
                  <StatusFilter
                    options={['全部', '待发布', '已发布', '审核中', '未通过']}
                    value={colStatus}
                    onChange={setColStatus}
                  />
                  <label className={`${CHIP} relative`}>
                    <Calendar size={16} aria-hidden />
                    <select
                      aria-label="发布时间"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="appearance-none bg-transparent font-medium text-[#252632] outline-none"
                    >
                      {TIME_RANGES.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => toast('设置排序（演示）')} className={CHIP}>
                    <ArrowUpDown size={14} /> 设置排序
                  </button>
                  <button type="button" onClick={() => toast('导出成功（演示）')} className={CHIP}>
                    <Upload size={16} /> 导出数据
                  </button>
                  <button
                    type="button"
                    onClick={() => toast('创建合集（演示）')}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-[#161823] px-3.5 text-[13px] font-medium text-white hover:bg-[#161823]/90"
                  >
                    <FolderPlus size={14} /> 创建合集
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 列表 */}
          {tab === '作品合集' ? (
            <div id="content-panel-作品合集" role="tabpanel" aria-labelledby="content-tab-作品合集" className="mt-2">
              {(colStatus === '全部' || colStatus === '已发布' ? collections : []).map((col) => (
                <CollectionRow key={col.id} col={col} />
              ))}
              {colStatus !== '全部' && colStatus !== '已发布' && (
                <div className="py-20 text-center text-[13px] text-[#252632]/60">没有符合条件的合集</div>
              )}
            </div>
          ) : !data ? (
            error ? (
              <div id="content-panel-作品" role="tabpanel" aria-labelledby="content-tab-作品" className="py-20 text-center text-[13px] text-[#252632]/60">数据加载失败（{error}），请刷新重试</div>
            ) : (
              <div id="content-panel-作品" role="tabpanel" aria-labelledby="content-tab-作品" aria-busy="true" className="space-y-4 py-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[160px] animate-pulse rounded-xl bg-black/[0.04]" />
                ))}
              </div>
            )
          ) : list.length === 0 ? (
            <div id="content-panel-作品" role="tabpanel" aria-labelledby="content-tab-作品" className="py-20 text-center text-[13px] text-[#252632]/60">没有符合条件的作品</div>
          ) : (
            <div id="content-panel-作品" role="tabpanel" aria-labelledby="content-tab-作品" className="mt-2">
              {list.map((w) => (
                <WorkRow
                  key={w.id}
                  work={w}
                  onOpen={(x) => setDetail({ id: x.id, tab: '总览' })}
                  onOpenComments={(x) => setDetail({ id: x.id, tab: '评论管理' })}
                  onEdit={(x) => demoToast('进入编辑', x.title)}
                  onPermission={(x) => demoToast('打开权限设置', x.title)}
                  onTogglePin={(x) =>
                    setPinnedOverride((prev) => ({ ...prev, [x.id]: !x.pinned }))
                  }
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          )}
      </div>
      <DeleteWorkDialog work={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
    </main>
  )
}
