import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronRight, Search, TrendingDown, TrendingUp, Trophy } from '@/shared/icons'
import { useCreatorIndexHot, type HotItem } from './api'

/* ─── 创作服务 · 抖音指数（Figma 904-64366） ───
 * 顶部页签 + 雷达同心圆背景 + 关键词搜索 + 我的订阅 + 实时/飙升热点榜。 */

const TROPHY_COLOR = ['#F5B60D', '#B7C4D0', '#D89B6A']

function HotBoard({ title, items }: { title: string; items: HotItem[] }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-[#252632] underline decoration-[#4E83FD] decoration-2 underline-offset-4">{title}</h3>
      <table className="mt-3 w-full text-left">
        <thead>
          <tr className="border-b border-black/5 text-[12px] text-[#252632]/45">
            <th className="pb-2 pr-2 font-normal">排名</th>
            <th className="pb-2 pr-2 font-normal">热点名称</th>
            <th className="pb-2 pr-2 font-normal">热点指数</th>
            <th className="pb-2 text-right font-normal">热点指数变化</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.rank} className="border-b border-black/5 last:border-b-0">
              <td className="py-2.5 pr-2">
                {it.rank <= 3 ? <Trophy size={16} style={{ color: TROPHY_COLOR[it.rank - 1] }} /> : <span className="pl-1 text-[13px] text-[#252632]/50">{it.rank}</span>}
              </td>
              <td className="py-2.5 pr-2">
                <button type="button" onClick={() => toast(`${it.name}（演示）`)} className="max-w-[180px] truncate text-[13px] text-[#252632] hover:text-[#4E83FD]">{it.name}</button>
              </td>
              <td className="py-2.5 pr-2 text-[13px] text-[#4E83FD]">{it.index}</td>
              <td className="py-2.5 text-right">
                {it.change === 'up' ? <TrendingUp size={15} className="ml-auto text-[#F53F3F]" />
                  : it.change === 'down' ? <TrendingDown size={15} className="ml-auto text-[#00B578]" />
                  : <span className="text-[13px] text-[#252632]/30">--</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DouyinIndexPage() {
  const { data, error } = useCreatorIndexHot()
  const [tab, setTab] = useState('关键词')
  const [topTab, setTopTab] = useState('抖音指数')
  const [search, setSearch] = useState('')

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-white">
      {/* 顶部页签 */}
      <div className="border-b border-black/5 px-8 pt-5">
        <div className="flex gap-6 text-[14px]">
          {['抖音指数', '创作指南', '趋势报告'].map((t) => (
            <button key={t} type="button" onClick={() => setTopTab(t)}
              className={`-mb-px border-b-2 pb-3 transition-colors ${topTab === t ? 'border-[#252632] font-medium text-[#252632]' : 'border-transparent text-[#252632]/45 hover:text-[#252632]/75'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* 主视觉：雷达同心圆 + 搜索 */}
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#EEF3FE_0%,#F7F9FD_60%,#fff_100%)] px-8 pb-8 pt-10">
        {/* 同心圆背景 */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          {[220, 340, 460, 580].map((r) => (
            <div key={r} className="absolute rounded-full border border-[#4E83FD]/10" style={{ width: r, height: r, left: -r / 2, top: 40 - r / 2 + 200 }} />
          ))}
        </div>
        {/* 散落关键词气泡 */}
        {data?.bubbles.map((b, i) => {
          const pos = [
            { top: '8%', left: '48%' }, { top: '24%', left: '30%' }, { top: '20%', right: '22%' },
            { top: '52%', left: '24%' }, { bottom: '10%', left: '42%' }, { top: '44%', right: '18%' }, { bottom: '18%', right: '30%' },
          ][i] ?? { top: '50%', left: '50%' }
          return (
            <span key={b} className="absolute flex items-center gap-1 text-[12px] text-[#252632]/40" style={pos}>
              <i className="h-1.5 w-1.5 rounded-full bg-[#7FB2FF]" />{b}
            </span>
          )
        })}

        <div className="relative mx-auto max-w-[600px] text-center">
          <h1 className="text-[28px] font-bold text-[#161823]">洞悉内容背后的规律和趋势</h1>
          <div className="mt-5 flex justify-center gap-6 text-[14px]">
            {(data?.tabs ?? ['关键词', '达人', '视频', '品牌', '话题']).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`-mb-px border-b-2 pb-2 transition-colors ${tab === t ? 'border-[#4E83FD] font-medium text-[#252632]' : 'border-transparent text-[#252632]/55 hover:text-[#252632]'}`}>{t}</button>
            ))}
          </div>
          <div className="mt-4 flex overflow-hidden rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`搜索${tab}`}
              className="h-11 flex-1 bg-white px-4 text-[14px] text-[#252632] outline-none placeholder:text-[#252632]/35" />
            <button type="button" onClick={() => toast(`搜索「${search || tab}」（演示）`)} className="flex items-center gap-1 bg-[#161823] px-6 text-[14px] font-medium text-white hover:bg-[#161823]/90">
              <Search size={15} />搜索
            </button>
          </div>
          {/* 我的订阅 */}
          <div className="mt-4 rounded-2xl bg-white p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center">
              <span className="text-[14px] font-medium text-[#252632]">我的订阅</span>
              <button type="button" onClick={() => toast('更多订阅（演示）')} className="ml-auto flex items-center text-[12px] text-[#252632]/45 hover:text-[#252632]">更多 <ChevronRight size={13} /></button>
            </div>
            <div className="py-8 text-center text-[13px] text-[#252632]/35">暂无订阅词</div>
          </div>
        </div>
      </div>

      {/* 热点榜 */}
      <div className="px-8 py-8">
        {!data ? (
          error ? <div className="py-12 text-center text-[13px] text-[#252632]/45">加载失败（{error}）</div>
            : <div className="grid grid-cols-2 gap-10">{[0, 1].map((i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-black/[0.04]" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-10">
            <HotBoard title="抖音实时热点" items={data.realtime} />
            <HotBoard title="抖音飙升热点" items={data.surging} />
          </div>
        )}
      </div>
    </main>
  )
}
