import { useState } from 'react'
import {
  Monitor,
  UsersRound,
  Gauge,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from '@/shared/icons'

/**
 * 运营数据看板内容 — 三个 Tab（运营数据 / 用户画像 / 性能数据）+ 横排筛选
 * （渠道 / 时间）。被「运营数据抽屉」与「运营数据菜单页」共用，样式一致。
 * 数据对齐效果优化设计稿，纯本地演示。
 */

type Tab = 'ops' | 'portrait' | 'perf'

export default function OpsDataDashboard({ projectName }: { projectName: string }) {
  const [tab, setTab] = useState<Tab>('ops')
  const [channel, setChannel] = useState('mini')
  const [range, setRange] = useState('30d')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Controls row — tabs (left) + filters (right) */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--divider-soft)] px-3">
        <div className="flex items-center gap-1">
          <TabBtn active={tab === 'ops'} onClick={() => setTab('ops')}>运营数据</TabBtn>
          <TabBtn active={tab === 'portrait'} onClick={() => setTab('portrait')}>用户画像</TabBtn>
          <TabBtn active={tab === 'perf'} onClick={() => setTab('perf')}>性能数据</TabBtn>
        </div>
        <div className="flex shrink-0 items-center gap-2 py-1.5">
          <span className="text-[11px] text-[var(--color-ink)]/40">次日更新（T+1）</span>
          <Dropdown
            label="渠道"
            value={channel}
            options={[
              { id: 'all', label: '全部渠道' },
              { id: 'mini', label: '小程序' },
            ]}
            onChange={setChannel}
          />
          <Dropdown
            label="时间"
            value={range}
            options={[
              { id: 'today', label: '昨天' },
              { id: '7d', label: '近7天' },
              { id: '30d', label: '近30天' },
              { id: '90d', label: '近90天' },
              { id: 'custom', label: '自定义' },
            ]}
            onChange={setRange}
          />
        </div>
      </div>

      {/* Body */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[var(--color-surface-0)] p-4">
        {tab === 'ops' ? (
          <OpsSection projectName={projectName} />
        ) : tab === 'portrait' ? (
          <PortraitSection />
        ) : (
          <PerfSection />
        )}
      </div>
    </div>
  )
}

/* ─────────── 运营数据 ─────────── */
function OpsSection({ projectName }: { projectName: string }) {
  return (
    <Card icon={Monitor} title="运营数据">
      <div className="flex gap-5">
        <div className="w-[230px] shrink-0 space-y-4">
          <MetricBlock title="触达">
            <MetricCard highlighted>
              <Metric label="曝光次数" value="2,332" delta={-2.82} />
              <Metric label="曝光用户数" value="153" delta={2.82} />
            </MetricCard>
            <MetricCard>
              <Metric label="访问次数" value="2,332" delta={2.82} />
              <Metric label="访问用户数" value="153" delta={-2.82} />
            </MetricCard>
            <MetricCard>
              <Metric label="启动次数" value="2,332" delta={2.82} />
              <Metric label="启动用户数" value="153" delta={-2.82} />
            </MetricCard>
          </MetricBlock>
          <MetricBlock title="使用">
            <MetricCard>
              <Metric label="对话次数" value="2,332" delta={2.82} />
              <Metric label="对话用户数" value="153" delta={-2.82} />
              <Metric label="玩法次数" value="153" delta={2.82} />
            </MetricCard>
          </MetricBlock>
          <MetricBlock title="业务转化">
            <MetricCard>
              <Metric label="关注转化率" value="10.1%" delta={2.82} />
              <Metric label="互动转化率" value="153" delta={2.82} />
            </MetricCard>
          </MetricBlock>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[13px] font-medium text-[var(--color-ink)]">曝光</div>
          <ExposureChart seed={projectName} />
          <div className="mt-4 space-y-2.5">
            <LegendRow color="#3478ff" label="曝光次数" value="23,322" delta={12.34} />
            <BreakdownRow label="视频播放量" value="1,221,376" />
            <BreakdownRow label="短视频曝光次数" value="421,376" />
            <BreakdownRow label="个人页曝光次数" value="126,372" />
            <div className="h-px bg-[var(--divider-soft)]" />
            <LegendRow color="#22c55e" label="曝光用户数" value="23,322" delta={12.34} />
            <BreakdownRow label="短视频曝光用户数" value="1,376" />
            <BreakdownRow label="个人页锚点曝光用户数" value="2,276" />
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ─────────── 用户画像 ─────────── */
const AGE_BARS = [
  { label: '18岁以下', pct: 60.1, tone: 'blue' },
  { label: '未知', pct: 78.7, tone: 'deep' },
  { label: '24–30岁', pct: 18, tone: 'light' },
  { label: '18–23岁', pct: 32.2, tone: 'gray' },
  { label: '31–40岁', pct: 10.3, tone: 'gray' },
  { label: '41–50岁', pct: 8.3, tone: 'gray' },
  { label: '50岁以上', pct: 4.1, tone: 'gray' },
] as const

const REGIONS = [
  { name: '广东', pct: 18.2, tier: '> 15%' },
  { name: '江苏', pct: 12.6, tier: '10-15%' },
  { name: '浙江', pct: 11.4, tier: '10-15%' },
  { name: '四川', pct: 8.7, tier: '5-10%' },
  { name: '山东', pct: 6.3, tier: '5-10%' },
  { name: '北京', pct: 3.9, tier: '1-5%' },
]
const TIER_COLOR: Record<string, string> = {
  '> 15%': '#1d4ed8',
  '10-15%': '#3b82f6',
  '5-10%': '#93c5fd',
  '1-5%': '#dbeafe',
}

const RANKING = [
  { name: '潮人日记', a: 888, b: 888, c: 888, d: 888, e: 888 },
  { name: '旋律追随者', a: 668, b: 668, c: 668, d: 668, e: 668 },
  { name: '梦幻光影', a: 538, b: 538, c: 538, d: 538, e: 538 },
  { name: '潮流先锋', a: 134, b: 134, c: 134, d: 134, e: 134 },
]

function PortraitSection() {
  return (
    <div className="space-y-4">
      <Card icon={UsersRound} title="用户画像" badge="使用阶段">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="mb-3 text-[12.5px] font-medium text-[var(--color-ink)]/70">性别分布</div>
            <GenderDonut />
          </div>
          <div>
            <div className="mb-3 text-[12.5px] font-medium text-[var(--color-ink)]/70">年龄分布</div>
            <div className="space-y-2">
              {AGE_BARS.map((a) => (
                <div key={a.label} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-14 shrink-0 text-[var(--color-ink)]/60">{a.label}</span>
                  <div className="h-3.5 flex-1 overflow-hidden rounded-[3px] bg-[var(--fill-subtle)]">
                    <div
                      className="h-full rounded-[3px]"
                      style={{
                        width: `${a.pct}%`,
                        backgroundColor:
                          a.tone === 'deep'
                            ? '#2563eb'
                            : a.tone === 'blue'
                              ? '#60a5fa'
                              : a.tone === 'light'
                                ? '#bfdbfe'
                                : '#e2e8f0',
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-[var(--color-ink)]/55">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 text-[12.5px] font-medium text-[var(--color-ink)]/70">地域分布</div>
            <div className="space-y-1.5">
              {REGIONS.map((r) => (
                <div key={r.name} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-8 shrink-0 text-[var(--color-ink)]/65">{r.name}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--fill-subtle)]">
                    <div className="h-full rounded-full" style={{ width: `${r.pct * 4}%`, backgroundColor: TIER_COLOR[r.tier] }} />
                  </div>
                  <span className="w-9 shrink-0 text-right font-mono text-[var(--color-ink)]/55">{r.pct}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--color-ink)]/45">
              {['> 15%', '10-15%', '5-10%', '1-5%'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: TIER_COLOR[t] }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="活跃用户排名" action="查看全部">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="text-[var(--color-ink)]/45">
              {['用户', '累计访问次数', '近7天访问次数', '累计对话轮数', '平均对话轮数', '平均首字耗时'].map((h, i) => (
                <th key={h} className={`py-2 font-normal ${i === 0 ? 'text-left pl-1' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RANKING.map((row, i) => (
              <tr key={row.name} className="border-t border-[var(--divider-soft)]">
                <td className="py-2.5 pl-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[var(--color-ink)]/40">{i + 1}</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--fill-subtle)] text-[10px] text-[var(--color-ink)]/55">
                      {row.name.slice(0, 1)}
                    </span>
                    <span className="text-[var(--color-ink)]/85">{row.name}</span>
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono text-[var(--color-ink)]/70">{row.a}</td>
                <td className="py-2.5 text-right font-mono text-[var(--color-ink)]/70">{row.b}</td>
                <td className="py-2.5 text-right font-mono text-[var(--color-ink)]/70">{row.c}</td>
                <td className="py-2.5 text-right font-mono text-[var(--color-ink)]/70">{row.d}</td>
                <td className="py-2.5 text-right font-mono text-[var(--color-ink)]/70">{row.e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

/* ─────────── 性能数据 ─────────── */
function PerfSection() {
  return (
    <Card icon={Gauge} title="性能数据">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '平均首屏耗时', value: '1.2s', delta: -8.4 },
          { label: '平均加载耗时', value: '680ms', delta: -3.1 },
          { label: 'JS 错误率', value: '0.12%', delta: 1.5 },
          { label: '崩溃率', value: '0.03%', delta: -0.4 },
          { label: '平均 FPS', value: '58', delta: 2.2 },
          { label: 'P95 响应', value: '2.4s', delta: -5.0 },
          { label: 'API 成功率', value: '99.6%', delta: 0.3 },
          { label: '弱网占比', value: '6.8%', delta: -1.2 },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[var(--divider-soft)] p-3">
            <div className="text-[11.5px] text-[var(--color-ink)]/50">{m.label}</div>
            <div className="mt-1.5 text-[20px] font-semibold text-[var(--color-ink)]">{m.value}</div>
            <Delta delta={m.delta} />
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ─────────── exposure line chart ─────────── */
function hash(s: string, i: number): number {
  let h = 2166136261 ^ i
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 0xffffffff
}
function ExposureChart({ seed }: { seed: string }) {
  const N = 40
  const W = 560
  const H = 230
  const pad = 8
  const series = (salt: string, base: number, amp: number) =>
    Array.from({ length: N }, (_, i) => {
      const spike = hash(seed + salt, i) ** 3
      return base + amp * (0.4 * hash(seed + salt + 'b', i) + 0.6 * spike)
    })
  const blue = series('blue', 0.25, 0.7)
  const green = series('green', 0.15, 0.45)
  const max = Math.max(...blue, ...green, 1)
  const toPath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = pad + (i / (N - 1)) * (W - pad * 2)
        const y = H - pad - (v / max) * (H - pad * 2)
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  return (
    <div className="rounded-xl border border-[var(--divider-soft)] p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={W - pad} y1={H * g} y2={H * g} stroke="var(--divider-soft)" strokeDasharray="3 4" strokeWidth={1} />
        ))}
        <path d={toPath(blue)} fill="none" stroke="#3478ff" strokeWidth={1.6} />
        <path d={toPath(green)} fill="none" stroke="#22c55e" strokeWidth={1.6} />
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[9.5px] text-[var(--color-ink)]/35">
        {['12-01', '12-02', '12-03', '12-04', '12-05', '12-06', '12-07', '12-08'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  )
}

/* ─────────── gender donut ─────────── */
function GenderDonut() {
  const male = 60.3
  const r = 42
  const c = 2 * Math.PI * r
  const maleLen = (male / 100) * c
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
          <circle cx="55" cy="55" r={r} fill="none" stroke="#dbeafe" strokeWidth="13" />
          <circle
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke="#3478ff"
            strokeWidth="13"
            strokeDasharray={`${maleLen} ${c - maleLen}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-[var(--color-ink)]/45">用户数</span>
          <span className="text-[16px] font-semibold text-[var(--color-ink)]">4,314</span>
        </div>
      </div>
      <div className="mt-3 flex gap-5 text-[11.5px]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3478ff]" />
          男性 <span className="font-medium text-[var(--color-ink)]/80">60.3%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#dbeafe]" />
          女性 <span className="font-medium text-[var(--color-ink)]/80">39.7%</span>
        </span>
      </div>
    </div>
  )
}

/* ─────────── shared atoms ─────────── */
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-2.5 py-2.5 text-[13px] font-medium transition-colors ${
        active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/45 hover:text-[var(--color-ink)]/75'
      }`}
    >
      {children}
      {active && <span className="absolute -bottom-px left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#3478ff]" />}
    </button>
  )
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { id: string; label: string }[]
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.id === value) ?? options[0]
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 items-center gap-1 rounded-md border border-[var(--divider)] px-2.5 text-[12px] transition-colors hover:bg-[var(--fill-hover)]"
      >
        <span className="text-[var(--color-ink)]/45">{label}</span>
        <span className="text-[var(--color-ink)]/85">{current.label}</span>
        <ChevronDown size={12} className={`text-[var(--color-ink)]/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[1]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-[2] mt-1 min-w-[120px] overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] py-1 shadow-[0_12px_28px_-8px_rgba(16,18,24,0.2)]">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-[var(--fill-hover)] ${
                  o.id === value ? 'text-[#3478ff]' : 'text-[var(--color-ink)]/75'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Card({
  icon: Icon,
  title,
  badge,
  action,
  children,
}: {
  icon?: typeof Monitor
  title: string
  badge?: string
  action?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-4">
      <div className="mb-3.5 flex items-center gap-2">
        {Icon && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3478ff]/12 text-[#3478ff]">
            <Icon size={14} strokeWidth={1.8} />
          </span>
        )}
        <span className="text-[14px] font-semibold text-[var(--color-ink)]">{title}</span>
        {badge && (
          <span className="rounded bg-[#3478ff]/12 px-1.5 py-0.5 text-[10px] font-medium text-[#3478ff]">{badge}</span>
        )}
        {action && <button className="ml-auto text-[11.5px] text-[#3478ff]">{action}</button>}
      </div>
      {children}
    </section>
  )
}

function MetricBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[12.5px] font-semibold text-[var(--color-ink)]/70">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function MetricCard({ highlighted, children }: { highlighted?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-lg border px-2.5 py-1.5 ${
        highlighted ? 'border-[#3478ff] bg-[#3478ff]/[0.04]' : 'border-[var(--divider-soft)]'
      }`}
    >
      {children}
    </div>
  )
}

function Metric({ label, value, delta }: { label: string; value: string; delta: number }) {
  return (
    <div className="flex items-center gap-2 py-0.5 text-[12px]">
      <span className="min-w-0 flex-1 truncate text-[var(--color-ink)]/65">{label}</span>
      <span className="shrink-0 font-mono font-medium text-[var(--color-ink)]">{value}</span>
      <Delta delta={delta} className="w-[58px] shrink-0 justify-end" />
    </div>
  )
}

function Delta({ delta, className = '' }: { delta: number; className?: string }) {
  const up = delta >= 0
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-medium ${up ? 'text-rose-500' : 'text-emerald-600'} ${className}`}>
      {up ? '+' : ''}
      {delta}%
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
    </span>
  )
}

function LegendRow({ color, label, value, delta }: { color: string; label: string; value: string; delta: number }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: color }} />
      <span className="text-[var(--color-ink)]/75">{label}</span>
      <span className="ml-auto font-mono font-semibold text-[var(--color-ink)]">{value}</span>
      <span className="flex items-center gap-0.5 text-[11px] font-medium text-rose-500">↑ {delta}%</span>
    </div>
  )
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 pl-[18px] text-[11.5px]">
      <span className="text-[var(--color-ink)]/50">{label}</span>
      <span className="ml-auto font-mono text-[var(--color-ink)]/65">{value}</span>
    </div>
  )
}
