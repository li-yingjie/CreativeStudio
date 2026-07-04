import { useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowsLeftRight,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Globe,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from '@/shared/icons'
import type { LucideIcon } from '@/shared/icons'
import { useCreatorCopyright } from './api'

/* ─── 创作服务 · 原创保护（Figma 904-65582） ───
 * 顶部蓝色横幅 + 原创度三步进度 + 原创权益（7 图标）+ 视频讲解（分页）+ 公告。 */

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  onsite: ShieldCheck,
  impersonation: ShieldAlert,
  protect: Lock,
  offsite: Globe,
  jury: UsersRound,
  transfer: ArrowsLeftRight,
  litigation: Gavel,
}

export default function CopyrightPage() {
  const { data, error } = useCreatorCopyright()
  const [videoPage, setVideoPage] = useState(0)
  const perPage = 8
  const videos = data?.videos ?? []
  const pages = Math.max(1, Math.ceil(videos.length / perPage))

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1240px] px-8 py-6">
        {/* 蓝色横幅 + 三步进度 */}
        <section className="overflow-hidden rounded-[20px] bg-[linear-gradient(120deg,#3E7BFA_0%,#5B9CFF_55%,#8FC0FF_100%)] p-6">
          <h2 className="text-[20px] font-semibold text-white">原创保护中心</h2>
          <div className="mt-4 rounded-2xl bg-white p-6">
            {!data ? (
              error ? <div className="text-center text-[13px] text-[#252632]/45">加载失败（{error}）</div>
                : <div className="h-12 animate-pulse rounded-lg bg-black/[0.04]" />
            ) : (
              <div className="flex items-center">
                {data.steps.map((s, i) => (
                  <div key={s.label} className="flex flex-1 items-center">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        s.state === 'done' ? 'bg-[#E8F7EE] text-[#00B578]' : s.state === 'current' ? 'bg-[#E8F7EE] text-[#00B578]' : 'bg-[#F2F3F5] text-[#252632]/35'
                      }`}>
                        {s.state === 'done' ? <ShieldAlert size={20} /> : s.state === 'current' ? <ShieldCheck size={20} /> : <UsersRound size={20} />}
                      </span>
                      <div>
                        <div className="text-[15px] font-semibold text-[#252632]">{s.label}</div>
                        <button type="button" onClick={() => toast(`${s.action}（演示）`)}
                          className={`mt-0.5 flex items-center text-[12px] ${s.state === 'done' ? 'text-[#00B578]' : 'text-[#4E83FD]'}`}>
                          {s.action}{s.state !== 'done' && <ChevronRight size={12} />}
                        </button>
                      </div>
                    </div>
                    {i < data.steps.length - 1 && <div className="mx-4 h-px flex-1 border-t border-dashed border-black/15" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 原创权益 */}
        {data && (
          <section className="mt-5">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-semibold text-[#252632]">原创权益</h3>
              <span className="text-[12px] text-[#252632]/45">提升原创度，可解锁部分权益</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {data.benefits.map((b) => {
                const Icon = BENEFIT_ICONS[b.key] ?? ShieldCheck
                return (
                  <button key={b.key} type="button" onClick={() => toast(`${b.name}（演示）`)}
                    className="flex flex-col items-center gap-2 rounded-xl py-4 transition-colors hover:bg-white">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#252632]/70 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <span className="text-[13px] text-[#252632]/75">{b.name}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* 视频讲解 */}
        {data && (
          <section className="mt-5">
            <h3 className="text-[16px] font-semibold text-[#252632]">视频讲解</h3>
            <div className="mt-4 grid grid-cols-8 gap-3">
              {videos.slice(videoPage * perPage, videoPage * perPage + perPage).map((v) => (
                <button key={v.id} type="button" onClick={() => toast('播放视频（演示）')} className="text-left">
                  <img src={v.cover} alt="" className="aspect-[3/4] w-full rounded-xl object-cover" />
                  <p className="mt-2 line-clamp-2 text-[12px] leading-4 text-[#252632]/70">{v.title}</p>
                </button>
              ))}
            </div>
            {pages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#252632]/50">
                <button type="button" onClick={() => setVideoPage((p) => (p - 1 + pages) % pages)} className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5"><ChevronLeft size={14} /></button>
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} type="button" onClick={() => setVideoPage(i)} className={`h-6 w-6 rounded ${i === videoPage ? 'bg-[#F2F3F5] font-medium text-[#252632]' : 'hover:bg-black/5'}`}>{i + 1}</button>
                ))}
                <button type="button" onClick={() => setVideoPage((p) => (p + 1) % pages)} className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5"><ChevronRight size={14} /></button>
              </div>
            )}
          </section>
        )}

        {/* 原创消息公告 */}
        {data && (
          <section className="mt-5 rounded-[20px] bg-white p-6">
            <div className="flex items-center">
              <h3 className="text-[16px] font-semibold text-[#252632]">原创消息公告</h3>
              <button type="button" onClick={() => toast('更多公告（演示）')} className="ml-auto flex items-center text-[12px] text-[#252632]/45 hover:text-[#252632]">更多 <ChevronRight size={13} /></button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4">
              {data.announcements.map((n) => (
                <button key={n.title} type="button" onClick={() => toast(n.title + '（演示）')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#F7F8FA] px-4 py-3 text-left hover:bg-[#F2F3F5]">
                  <span className="text-[#252632]/30">·</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#252632]/75">{n.title}</span>
                  {n.tag && <span className="shrink-0 rounded bg-[#FE2C55] px-1 py-0.5 text-[10px] text-white">{n.tag}</span>}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
