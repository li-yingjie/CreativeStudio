import { useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from '@/shared/icons'
import {
  fmtCount,
  fmtYuan,
  type HomeCalendar,
  type HomeInteraction,
  type HomeMonetization,
  type HomeQuickNav,
} from './api'

/* ─── 首页新增板块（Figma 947-41110）：互动管理 / 变现中心 / 活动中心 / 快速导航 / 页脚 ─── */

function CardHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center">
      <h3 className="text-[16px] font-semibold text-[#252632]">{title}</h3>
      {action && (
        <button type="button" onClick={onAction} className="ml-auto flex items-center text-[12px] text-[#252632]/45 hover:text-[#252632]">
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}

/* ─── 互动管理 ─── */

function InteractionItem({ title, count, time, text, sub }: {
  title: string; count: number; time: string; text: string; sub: React.ReactNode
}) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2F3F5] text-[#252632]/60"><MessageCircle size={14} /></span>
        <span className="text-[13px] font-medium text-[#252632]">{title}</span>
        <span className="rounded bg-[#FFECEF] px-1.5 py-0.5 text-[11px] text-[#FE2C55]">+{count}</span>
        <span className="ml-auto text-[12px] text-[#252632]/40">{time}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#252632]/80">{text}</p>
      <div className="mt-2 flex items-center gap-1 text-[12px] text-[#252632]/45">
        {sub}
        <button type="button" onClick={() => toast('快捷回复（演示）')} className="ml-auto flex items-center gap-1 text-[#252632]/55 hover:text-[#252632]">
          <MessageCircle size={12} /> 快捷回复
        </button>
      </div>
    </div>
  )
}

export function InteractionSection({ data, onMore }: { data: HomeInteraction; onMore?: () => void }) {
  return (
    <section className="rounded-[20px] bg-white p-6">
      <CardHeader title="互动管理" action="查看详情" onAction={onMore ?? (() => toast('互动管理详情（演示）'))} />
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:gap-8">
        <InteractionItem title="作品评论" count={data.comments.count} time={data.comments.time} text={data.comments.text}
          sub={<span className="truncate">来源作品：{data.comments.source}</span>} />
        <div className="hidden w-px shrink-0 bg-black/5 lg:block" />
        <InteractionItem title="私信消息" count={data.messages.count} time={data.messages.time} text={data.messages.text}
          sub={
            <span className="flex items-center gap-1.5">
              <img src={data.messages.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
              {data.messages.user}
            </span>
          } />
      </div>
    </section>
  )
}

/* ─── 收入变现 ─── */

function MonetTaskCard({ tint, icon, label, count, desc }: {
  tint: string; icon: string; label: string; count: number; desc: string
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3" style={{ background: `${tint}0F` }}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[15px]" style={{ background: `${tint}22` }}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[#252632]">{label}</span>
          <span className="text-[14px] font-semibold" style={{ color: tint }}>{fmtCount(count)}个</span>
        </div>
        <div className="mt-0.5 truncate text-[12px] text-[#252632]/50">{desc}</div>
      </div>
      <button type="button" onClick={() => toast(`${label} · 去查看（演示）`)} className="shrink-0 rounded-md px-2.5 py-1 text-[12px] font-medium text-white" style={{ background: tint }}>去查看</button>
    </div>
  )
}

export function MonetizationSection({ data, onMore }: { data: HomeMonetization; onMore?: () => void }) {
  return (
    <section className="rounded-[20px] bg-white p-6">
      <CardHeader title="收入变现" action="查看更多" onAction={onMore ?? (() => toast('收入变现（演示）'))} />
      <div className="mt-4 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:gap-8">
        <div className="shrink-0">
          <div className="text-[12px] text-[#252632]/45">近7日 {data.range}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[24px] font-bold text-[#252632]">{fmtYuan(data.amount)}</span>
            <span className="text-[12px] text-[#252632]/40">较7天前 <span className="text-[#F53F3F]">+{data.delta}</span></span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row">
          <MonetTaskCard tint="#FE2C55" icon="🎬" label="可参与任务" count={data.availableTasks} desc={data.availableTaskTitle} />
          <MonetTaskCard tint="#FF7A45" icon="🔔" label="我的任务" count={data.myTasks} desc={data.myTaskTitle} />
        </div>
      </div>
    </section>
  )
}

/* ─── 活动中心（日历 + 活动列表） ─── */

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

export function ActivityCenterCard({ data, onMore }: { data: HomeCalendar; onMore?: () => void }) {
  // 选中日期（默认今天）；点击日期联动下方活动列表
  const [selected, setSelected] = useState(data.selectedDay)
  // 网格：前置空格 firstWeekday 个 + 1..daysInMonth
  const cells: (number | null)[] = [
    ...Array.from({ length: data.firstWeekday }, () => null),
    ...Array.from({ length: data.daysInMonth }, (_, i) => i + 1),
  ]
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const selLabel = `${data.year}-${pad2(data.month)}-${pad2(selected)}`
  // 选中日当天进行中的活动（落在其区间内）
  const dayEvents = data.events.filter((e) => selected >= e.startDay && selected <= e.endDay)
  return (
    <section className="rounded-[20px] bg-white p-5">
      <CardHeader title="活动中心" action="查看更多" onAction={onMore ?? (() => toast('活动中心（演示）'))} />
      {/* 月份切换 */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[13px] font-medium text-[#252632]">
        <button type="button" className="text-[#252632]/40 hover:text-[#252632]"><ChevronLeft size={16} /></button>
        {data.year}年{data.month}月
        <button type="button" className="text-[#252632]/40 hover:text-[#252632]"><ChevronRight size={16} /></button>
      </div>
      {/* 星期表头 */}
      <div className="mt-3 grid grid-cols-7 text-center text-[11px] text-[#252632]/40">
        {WEEK.map((w) => <div key={w} className="py-1">{w}</div>)}
      </div>
      {/* 日期格 */}
      <div className="grid grid-cols-7 text-center">
        {cells.map((d, i) => (
          <div key={i} className="flex flex-col items-center py-1.5">
            {d != null && (
              <button
                type="button"
                onClick={() => setSelected(d)}
                className="flex flex-col items-center"
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] transition-colors ${
                  d === selected
                    ? 'bg-[#FE2C55] font-medium text-white'
                    : d === data.today
                      ? 'font-medium text-[#FE2C55]'
                      : 'text-[#252632]/75 hover:bg-black/5'
                }`}>{d}</span>
                <span className="mt-1 h-[3px] w-4 rounded-full" style={{ background: data.marks[String(d)] ?? 'transparent' }} />
              </button>
            )}
          </div>
        ))}
      </div>
      {/* 选中日期的活动列表 */}
      <div className="mt-3 border-t border-black/5 pt-3">
        <div className="flex items-center text-[12px]">
          <span className="font-medium text-[#252632]">{selLabel}</span>
          <span className="ml-auto text-[#252632]/45">共{dayEvents.length}个进行中</span>
        </div>
        <div className="mt-2 space-y-2">
          {dayEvents.length === 0 ? (
            <div className="py-3 text-center text-[12px] text-[#252632]/35">当天暂无进行中的活动</div>
          ) : (
            dayEvents.map((e) => (
              <button key={e.title} type="button" onClick={() => toast(`${e.title}（演示）`)} className="flex w-full items-center gap-2 text-left">
                <i className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: e.color }} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-[#252632]/80">{e.title}</span>
                <span className="shrink-0 text-[12px] text-[#252632]/40">{e.range}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── 快速导航 ─── */

export function QuickNavCard({ items, onMore }: { items: HomeQuickNav[]; onMore?: () => void }) {
  return (
    <section className="rounded-[20px] bg-white p-5">
      <CardHeader title="快速导航" action="查看更多" onAction={onMore ?? (() => toast('快速导航（演示）'))} />
      <div className="mt-4 grid grid-cols-4 gap-2">
        {items.map((q) => (
          <button key={q.name} type="button" onClick={() => toast(`${q.name}（演示）`)} className="flex flex-col items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-[13px] font-semibold text-white" style={{ background: q.tint }}>
              {q.short.slice(0, 2)}
            </span>
            <span className="text-[12px] text-[#252632]/65">{q.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

/* ─── 页脚 ─── */

const FOOTER_LINKS = ['账号授权', '协议用户', '服务协议', '隐私政策', '账号找回', '联系我们']

export function HomeFooter() {
  return (
    <footer className="mt-6 pb-4 text-center">
      <div className="flex items-center justify-center gap-6 text-[13px] text-[#252632]/55">
        {FOOTER_LINKS.map((l) => (
          <button key={l} type="button" onClick={() => toast(`${l}（演示）`)} className="hover:text-[#252632]">{l}</button>
        ))}
      </div>
      <div className="mt-3 space-y-1 text-[12px] text-[#252632]/30">
        <p>2022 © 抖音京ICP备16016397号-3  北京微播视界科技有限公司</p>
        <p>中国互联网举报中心  网络文化经营许可证-京网文-（2016）2282-264号  违法和不良信息举报: 400-140-2108</p>
        <p>京公网安备11000002002046号  地址: 北京市海淀区知春路51号4层408</p>
      </div>
    </footer>
  )
}
