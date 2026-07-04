import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, CircleAlert } from '@/shared/icons'
import { useCreatorCollab, type CollabItem } from './api'

/* ─── 创作服务 · 作品共创页（Figma 904-68923） ───
 * 顶部蓝色横幅 + 剩余次数/常见问题卡 + 共创作品列表（含状态与警告条）。 */

/** 共创人头像组（叠加显示，超出折叠为 +N）。 */
function AvatarStack({ avatars }: { avatars: string[] }) {
  const shown = avatars.slice(0, 5)
  const extra = avatars.length - shown.length
  return (
    <div className="flex items-center">
      {shown.map((a, i) => (
        <img
          key={i}
          src={a}
          alt=""
          className="h-5 w-5 rounded-full object-cover ring-2 ring-white"
          style={{ marginLeft: i === 0 ? 0 : -6, zIndex: shown.length - i }}
        />
      ))}
      {extra > 0 && (
        <span className="ml-1 text-[11px] text-[#252632]/45">+{extra}</span>
      )}
    </div>
  )
}

/** 状态文案：正常显示「N人共创，M已接受」，解除态灰字，其余保留计数。 */
function statusText(item: CollabItem): { text: string; muted?: boolean } {
  if (item.status === 'dissolved') return { text: '共创关系已解除', muted: true }
  return { text: `${item.total}人共创，${item.accepted}人已接受` }
}

function CollabRow({ item }: { item: CollabItem }) {
  const st = statusText(item)
  return (
    <div className="border-b border-black/5 py-4 last:border-b-0">
      <div className="flex gap-4">
        {/* 封面 */}
        <div className="relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-xl bg-black/5">
          <img src={item.cover} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-1.5 top-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white">
            共创
          </span>
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
            {item.duration}
          </span>
        </div>

        {/* 右侧 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="line-clamp-2 text-[14px] leading-6 text-[#252632]">{item.title}</p>
          <div className="mt-1.5 text-[12px] text-[#252632]/40">{item.publishedAt}</div>
          <div className="mt-auto flex items-center gap-2 pt-2">
            <AvatarStack avatars={item.avatars} />
            <span className={`text-[12px] ${st.muted ? 'text-[#252632]/40' : 'text-[#252632]/65'}`}>
              {st.text}
            </span>
          </div>
        </div>
      </div>

      {/* 警告条（整体/部分被平台解除） */}
      {item.notice && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#FFF7E8] px-3 py-2.5 text-[12px] text-[#F5820D]">
          <CircleAlert size={14} className="shrink-0" />
          <span>{item.notice}</span>
        </div>
      )}
    </div>
  )
}

export default function CollabPage() {
  const { data, error } = useCreatorCollab()
  const [faqPage, setFaqPage] = useState(0)
  const faqs = data?.faqs ?? []
  const faqPerPage = 2
  const faqPages = Math.max(1, Math.ceil(faqs.length / faqPerPage))
  const pageFaqs = faqs.slice(faqPage * faqPerPage, faqPage * faqPerPage + faqPerPage)

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1240px] px-8 py-6">
        {/* 顶部蓝色横幅 */}
        <section className="overflow-hidden rounded-[20px] bg-[linear-gradient(120deg,#3E7BFA_0%,#5B9CFF_55%,#8FC0FF_100%)] p-6">
          <div className="flex items-center gap-3 text-white">
            <CollabMark />
            <h2 className="text-[20px] font-semibold">作品共创</h2>
            <button
              type="button"
              onClick={() => toast('共同创作公约（演示）')}
              className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm hover:bg-white/30"
            >
              共同创作公约 <ChevronRight size={13} />
            </button>
          </div>

          {/* 白卡：剩余次数 + 常见问题 */}
          <div className="mt-4 grid grid-cols-[300px_1fr] gap-4 rounded-2xl bg-white p-6">
            <div className="flex flex-col justify-center border-r border-black/5 pr-6">
              <div className="text-[36px] font-bold leading-none text-[#252632]">
                {data ? data.remainingThisMonth : '—'}
                <span className="ml-1 text-[16px] font-medium">次</span>
              </div>
              <div className="mt-2 text-[13px] text-[#252632]/50">本月剩余共创发起次数</div>
            </div>
            <div className="min-w-0 pl-2">
              <div className="flex items-center">
                <h3 className="text-[15px] font-semibold text-[#252632]">常见问题</h3>
                <div className="ml-auto flex items-center gap-2 text-[12px] text-[#252632]/45">
                  <button
                    type="button"
                    onClick={() => setFaqPage((p) => (p - 1 + faqPages) % faqPages)}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/5"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>
                    {faqPage + 1}/{faqPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFaqPage((p) => (p + 1) % faqPages)}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/5"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2">
                {pageFaqs.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => toast(q + '（演示）')}
                    className="flex items-center gap-2 text-left text-[13px] text-[#252632]/70 hover:text-[#252632]"
                  >
                    <span className="min-w-0 flex-1 truncate">{q}</span>
                    <ChevronRight size={13} className="shrink-0 text-[#252632]/35" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 共创作品列表 */}
        <section className="mt-5">
          <h3 className="text-[18px] font-semibold text-[#252632]">共创作品列表</h3>
          {!data ? (
            error ? (
              <div className="py-16 text-center text-[13px] text-[#252632]/45">数据加载失败（{error}），请刷新重试</div>
            ) : (
              <div className="mt-4 space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[112px] animate-pulse rounded-xl bg-black/[0.04]" />
                ))}
              </div>
            )
          ) : (
            <div className="mt-2 rounded-[20px] bg-white px-6">
              {data.list.map((item) => (
                <CollabRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

/** 「CO」共创标记（双环叠字）。 */
function CollabMark() {
  return (
    <svg viewBox="0 0 40 24" className="h-6 w-10" fill="none" aria-hidden>
      <circle cx="13" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="26" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.6" />
    </svg>
  )
}
