import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { Calendar, Download, Play, Settings, Sparkles, Trash2 } from '@/shared/icons'
import { useCreatorLives, type LiveItem } from './api'

/* ─── 直播管理（权限菜单，由头像开关控制显示，Figma 904-69330） ─── */

const BLUE = '#4E83FD'

function Spark({ data, id }: { data: number[]; id: string }) {
  return (
    <div className="h-9 w-[88px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((v) => ({ v }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity={0.25} />
              <stop offset="100%" stopColor={BLUE} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={BLUE} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function LiveRow({ live }: { live: LiveItem }) {
  return (
    <div className="flex gap-4 border-b border-black/5 py-4 last:border-b-0">
      <div className="relative h-[150px] w-[112px] shrink-0 overflow-hidden rounded-xl bg-black/5">
        <img src={live.cover} alt="" className="h-full w-full object-cover" />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">{live.duration}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start">
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium text-[#252632]">{live.title}</div>
            <div className="mt-1 flex items-center gap-2 text-[12px]">
              <span className="text-[#252632]/45">{live.date}</span>
              <span className="text-[#00B578]">{live.status}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 text-[12px] text-[#252632]/60">
            <button type="button" onClick={() => toast('直播回放（演示）')} className="flex items-center gap-1 hover:text-[#252632]"><Play size={13} />直播回放</button>
            <button type="button" onClick={() => toast('高光时刻（演示）')} className="flex items-center gap-1 hover:text-[#252632]"><Sparkles size={13} />高光时刻</button>
            <button type="button" onClick={() => toast('下载视频（演示）')} className="flex items-center gap-1 hover:text-[#252632]"><Download size={13} />下载视频</button>
            <button type="button" onClick={() => toast('直播详情（演示）')} className="hover:text-[#252632]">详情</button>
            <button type="button" onClick={() => toast('已删除（演示）')} className="flex items-center gap-1 text-[#F53F3F] hover:opacity-80"><Trash2 size={13} />删除直播</button>
          </div>
        </div>
        <div className="mt-auto flex items-end gap-4 pt-3">
          <Spark data={live.spark} id={`live-spark-${live.id}`} />
          <div className="flex min-w-0 flex-1 items-center">
            {live.metrics.map((m) => (
              <div key={m.label} className="min-w-0 flex-1 border-l border-black/5 px-4 first:border-l-0 first:pl-0">
                <div className="truncate text-[12px] text-[#252632]/45">{m.label}</div>
                <div className="mt-0.5 text-[15px] font-semibold text-[#252632]">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LivePage() {
  const { data, error } = useCreatorLives()
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1240px] px-8 py-6">
        <div className="rounded-[20px] bg-white p-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-[#252632]">直播管理</h2>
            <span className="ml-auto text-[12px] text-[#252632]/45">共 {data?.total ?? '—'} 个直播</span>
            <button type="button" className="flex h-8 items-center gap-1.5 rounded-lg bg-[#F2F3F5] px-3 text-[12px] text-[#252632]/70 hover:bg-[#EBEDF0]"><Calendar size={13} />所有时间</button>
            <button type="button" onClick={() => toast('直播设置（演示）')} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#F2F3F5] px-3 text-[12px] text-[#252632]/70 hover:bg-[#EBEDF0]"><Settings size={13} />直播设置</button>
            <button type="button" onClick={() => toast('新建直播（演示）')} className="flex h-8 items-center gap-1 rounded-lg bg-[#161823] px-4 text-[13px] font-medium text-white hover:bg-[#161823]/90">+ 新建直播</button>
          </div>
          {!data ? (
            error ? <div className="py-16 text-center text-[13px] text-[#252632]/45">加载失败（{error}）</div>
              : <div className="mt-4 space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-[150px] animate-pulse rounded-xl bg-black/[0.04]" />)}</div>
          ) : (
            <div className="mt-2">{data.list.map((l) => <LiveRow key={l.id} live={l} />)}</div>
          )}
        </div>
      </div>
    </main>
  )
}
