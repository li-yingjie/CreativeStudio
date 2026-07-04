import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Flag, Flame, Search } from '@/shared/icons'
import { useCreatorActivities, type ActivityStatus, type MyActivity } from './api'

/* ─── 创作服务 · 活动管理（Figma 904-65050） ───
 * 活动灵感（招募卡分页）+ 我的活动（表格，多状态）。 */

const STATUS_META: Record<ActivityStatus, { label: string; cls: string }> = {
  pending: { label: '待开始', cls: 'text-[#252632]/55' },
  reviewing: { label: '创建审批中', cls: 'text-[#F5820D]' },
  ongoing: { label: '进行中', cls: 'text-[#00B578]' },
  rejected: { label: '被驳回', cls: 'text-[#F53F3F]' },
  ended: { label: '已结束', cls: 'text-[#252632]/40' },
}

function InspirationCard({ cover, title, audience, start, desc }: { cover: string; title: string; audience: string; start: string; desc: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4">
      <img src={cover} alt="" className="h-[150px] w-[112px] shrink-0 rounded-xl object-cover" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h4 className="text-[15px] font-semibold text-[#252632]">{title}</h4>
        <div className="mt-1.5 flex items-center gap-3 text-[12px] text-[#252632]/50">
          <span>{audience}</span>
          <span className="h-3 w-px bg-black/10" />
          <span>开始时间：{start}</span>
        </div>
        <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-[#252632]/55">{desc}</p>
        <div className="mt-auto flex items-center gap-2.5 pt-2">
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-[#252632]/50"><span className="text-[#252632]">🎵</span>平台赞助</span>
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-[#F53F3F]"><Flame size={12} />上升热点</span>
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-[#F5820D]"><Flag size={12} />节点活动</span>
          <button
            type="button"
            onClick={() => toast(`创建活动「${title}」（演示）`)}
            className="ml-auto shrink-0 whitespace-nowrap rounded-lg border border-black/10 px-3.5 py-1.5 text-[13px] text-[#252632] hover:bg-black/[0.03]"
          >
            创建活动
          </button>
        </div>
      </div>
    </div>
  )
}

const COLS = ['活动名称/ID', '状态', '活动起止时间', '参与对象', '活动玩法', '活动奖励', '活动类型', '操作']

function ActivityRow({ a }: { a: MyActivity }) {
  const st = STATUS_META[a.status]
  return (
    <tr className="border-b border-black/5 last:border-b-0">
      <td className="py-4 pr-4">
        <div className="text-[13px] text-[#252632]">{a.title}</div>
        <div className="mt-0.5 text-[12px] text-[#252632]/40">活动ID: {a.id}</div>
      </td>
      <td className="pr-4">
        <span className={`text-[13px] ${st.cls}`}>{st.label}</span>
        {a.status === 'rejected' && <span className="ml-1 cursor-pointer text-[12px] text-[#252632]/45 hover:text-[#252632]">原因</span>}
      </td>
      <td className="pr-4">
        <div className="text-[13px] text-[#252632]">{a.start} ~ {a.end}</div>
        <div className="mt-0.5 text-[12px] text-[#252632]/40">
          剩余 {a.remainingDays != null ? <><b className="text-[#F53F3F]">{a.remainingDays}</b> / {a.totalDays}</> : '--'} 天
        </div>
      </td>
      <td className="pr-4 text-[13px] text-[#252632]/70">{a.audience}</td>
      <td className="pr-4 text-[13px] text-[#252632]/70">{a.playType}</td>
      <td className="pr-4">
        <span className="flex items-center gap-1 text-[13px] text-[#252632]/70">
          <span className={`inline-flex h-4 w-4 items-center justify-center rounded ${a.rewardType === 'physical' ? 'bg-[#F3E8FF] text-[#8A5CF6]' : 'bg-[#E0F2FF] text-[#3B8DFF]'}`}>◈</span>
          {a.rewardType === 'physical' ? '实物奖励' : '虚拟奖励'}
          <span className="ml-1 cursor-pointer text-[#4E83FD]">明细</span>
        </span>
      </td>
      <td className="pr-4 text-[13px] text-[#252632]/70">{a.activityType}</td>
      <td>
        <span className="flex items-center gap-3 text-[13px]">
          <button type="button" onClick={() => toast('活动详情（演示）')} className="text-[#4E83FD] hover:opacity-80">详情</button>
          {a.canPublish && <button type="button" onClick={() => toast('发布视频（演示）')} className="text-[#4E83FD] hover:opacity-80">发布视频</button>}
          {a.status === 'ongoing' && a.rewardType === 'physical' && <button type="button" onClick={() => toast('去发奖（演示）')} className="text-[#4E83FD] hover:opacity-80">去发奖</button>}
        </span>
      </td>
    </tr>
  )
}

export default function ActivityPage() {
  const { data, error } = useCreatorActivities()
  const [inspPage, setInspPage] = useState(0)
  const [search, setSearch] = useState('')
  const perPage = 2
  const insps = data?.inspirations ?? []
  const pages = Math.max(1, Math.ceil(insps.length / perPage))
  const shown = insps.slice(inspPage * perPage, inspPage * perPage + perPage)

  const rows = useMemo(
    () => (data?.myActivities ?? []).filter((a) => (search ? a.title.includes(search) || a.id.includes(search) : true)),
    [data, search],
  )

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1240px] px-8 py-6">
        {/* 活动灵感 */}
        <section className="rounded-[20px] bg-white p-6">
          <h2 className="text-[18px] font-semibold text-[#252632]">活动灵感</h2>
          <p className="mt-1 text-[13px] text-[#252632]/50">以下是官方提供并对你进行招募的灵感，根据灵感进行活动策划，审批通过率更高。</p>
          {!data ? (
            error ? (
              <div className="py-12 text-center text-[13px] text-[#252632]/45">加载失败（{error}）</div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[0, 1].map((i) => <div key={i} className="h-[182px] animate-pulse rounded-2xl bg-black/[0.04]" />)}
              </div>
            )
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {shown.map((c) => <InspirationCard key={c.title} {...c} />)}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#252632]/50">
                <button type="button" onClick={() => setInspPage((p) => (p - 1 + pages) % pages)} className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5"><ChevronLeft size={14} /></button>
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} type="button" onClick={() => setInspPage(i)} className={`h-6 w-6 rounded ${i === inspPage ? 'bg-[#F2F3F5] font-medium text-[#252632]' : 'hover:bg-black/5'}`}>{i + 1}</button>
                ))}
                <button type="button" onClick={() => setInspPage((p) => (p + 1) % pages)} className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5"><ChevronRight size={14} /></button>
              </div>
            </>
          )}
        </section>

        {/* 我的活动 */}
        <section className="mt-4 rounded-[20px] bg-white p-6">
          <div className="flex items-center gap-3">
            <h3 className="text-[18px] font-semibold text-[#252632]">我的活动</h3>
            <label className="ml-auto flex h-9 w-[280px] items-center gap-1.5 rounded-lg border border-black/10 px-3">
              <Search size={14} className="text-[#252632]/35" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="输入活动名称或ID搜索" className="w-full bg-transparent text-[13px] text-[#252632] outline-none placeholder:text-[#252632]/35" />
            </label>
            <button type="button" onClick={() => toast('创建活动（演示）')} className="rounded-lg bg-[#161823] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#161823]/90">创建活动</button>
          </div>
          {data && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-black/5 text-[12px] text-[#252632]/45">
                    {COLS.map((c) => <th key={c} className="pb-2.5 pr-4 font-normal">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={COLS.length} className="py-12 text-center text-[13px] text-[#252632]/40">没有符合条件的活动</td></tr>
                  ) : rows.map((a) => <ActivityRow key={a.id + a.status} a={a} />)}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
