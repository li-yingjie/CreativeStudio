import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Calendar, ChevronDown, Download, Search } from '@/shared/icons'
import { useCreatorWorks, type WorkItem } from './api'
import WorkRow from './WorkRow'

/* ─── 内容管理页：工具栏（页签/筛选/搜索）+ 作品行列表 ─── */

function FilterSelect({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label?: string
  icon?: typeof Calendar
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex h-8 items-center gap-1 rounded-lg bg-[#F2F3F5] px-3 text-[12px] text-[#252632]/70 hover:bg-[#EBEDF0]"
      >
        {Icon && <Icon size={13} className="mr-0.5" />}
        {label} <b className="font-medium text-[#252632]">{value}</b>
        <ChevronDown size={13} className="text-[#252632]/40" />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-10 w-28 rounded-lg bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-[12px] ${
                o === value ? 'bg-[#F2F3F5] font-medium text-[#252632]' : 'text-[#252632]/70 hover:bg-black/[0.03]'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const demoToast = (action: string, w: WorkItem) => toast(`「${w.title.slice(0, 12)}…」${action}（演示）`)

/** 时间筛选：预设区间 → 发布时间下限（YYYY-MM-DD，字符串比较即可）。 */
const TIME_RANGES = ['所有时间', '近7天', '近30天', '近90天'] as const

function timeCutoff(range: string): string | null {
  const days = range === '近7天' ? 7 : range === '近30天' ? 30 : range === '近90天' ? 90 : null
  if (days == null) return null
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export default function ContentPage() {
  const { data, error } = useCreatorWorks()
  const [tab, setTab] = useState<'作品' | '作品合集'>('作品')
  const [genre, setGenre] = useState('全部')
  const [status, setStatus] = useState('全部')
  const [timeRange, setTimeRange] = useState<string>('所有时间')
  const [search, setSearch] = useState('')
  // 本地覆盖：置顶切换 / 删除（demo 内存态，刷新还原）
  const [pinnedOverride, setPinnedOverride] = useState<Record<string, boolean>>({})
  const [deleted, setDeleted] = useState<Set<string>>(new Set())

  const list = useMemo(() => {
    if (!data) return []
    return data.list
      .filter((w) => !deleted.has(w.id))
      .map((w) => ({ ...w, pinned: pinnedOverride[w.id] ?? w.pinned }))
      .filter((w) => (genre === '全部' ? true : genre === '视频' ? w.type === 'video' : w.type === 'gallery'))
      .filter((w) => (status === '全部' ? true : w.status === status))
      .filter((w) => {
        const cutoff = timeCutoff(timeRange)
        return cutoff ? w.publishedAt >= cutoff : true
      })
      .filter((w) => (search ? w.title.includes(search) : true))
      .sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.publishedAt < b.publishedAt ? 1 : -1))
  }, [data, deleted, pinnedOverride, genre, status, timeRange, search])

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1240px] px-8 py-6">
        <div className="rounded-[20px] bg-white p-6">
          <h2 className="text-[18px] font-semibold text-[#252632]">内容管理</h2>

          {/* 工具栏 */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(['作品', '作品合集'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`h-8 rounded-lg px-3.5 text-[13px] transition-colors ${
                    tab === t ? 'bg-[#161823] font-medium text-white' : 'text-[#252632]/55 hover:bg-black/5'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[12px] text-[#252632]/45">
              共 {list.length} 个{tab === '作品' ? '作品' : '合集'}
            </span>
            <FilterSelect label="体裁" value={genre} options={['全部', '视频', '图文']} onChange={setGenre} />
            <FilterSelect label="发布状态" value={status} options={['全部', '已发布']} onChange={setStatus} />
            <FilterSelect icon={Calendar} value={timeRange} options={[...TIME_RANGES]} onChange={setTimeRange} />
            <button
              type="button"
              onClick={() => toast('导出成功（演示）')}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-[#F2F3F5] px-3 text-[12px] text-[#252632]/70 hover:bg-[#EBEDF0]"
            >
              <Download size={13} /> 导出数据
            </button>
            <label className="flex h-8 items-center gap-1.5 rounded-lg border border-black/10 px-2.5">
              <Search size={13} className="text-[#252632]/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索"
                className="w-24 bg-transparent text-[12px] text-[#252632] outline-none placeholder:text-[#252632]/35"
              />
            </label>
          </div>

          {/* 列表 */}
          {tab === '作品合集' ? (
            <div className="py-20 text-center text-[13px] text-[#252632]/40">暂无合集，去创建你的第一个作品合集吧</div>
          ) : !data ? (
            error ? (
              <div className="py-20 text-center text-[13px] text-[#252632]/45">数据加载失败（{error}），请刷新重试</div>
            ) : (
              <div className="space-y-4 py-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[150px] animate-pulse rounded-xl bg-black/[0.04]" />
                ))}
              </div>
            )
          ) : list.length === 0 ? (
            <div className="py-20 text-center text-[13px] text-[#252632]/40">没有符合条件的作品</div>
          ) : (
            <div className="mt-2 divide-y divide-black/5">
              {list.map((w) => (
                <WorkRow
                  key={w.id}
                  work={w}
                  onEdit={(x) => demoToast('进入编辑', x)}
                  onAnalyze={(x) => demoToast('打开分析详情', x)}
                  onPermission={(x) => demoToast('打开权限设置', x)}
                  onTogglePin={(x) =>
                    setPinnedOverride((prev) => ({ ...prev, [x.id]: !x.pinned }))
                  }
                  onDelete={(x) => {
                    setDeleted((prev) => new Set(prev).add(x.id))
                    toast(`已删除「${x.title.slice(0, 12)}…」（演示，刷新恢复）`)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
