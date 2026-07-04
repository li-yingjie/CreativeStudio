import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtAxis, fmtCount, type RadarDimData, type TrendPoint } from './api'

const BLUE = '#4E83FD'

/* ─── 数据总览雷达图：中间五边形 + 周围五个指标浮签 ─── */

function DimChip({ dim, active, onClick }: { dim: RadarDimData; active?: boolean; onClick: () => void }) {
  const value = typeof dim.display === 'number' ? fmtCount(dim.display) : dim.display
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-max rounded-lg border bg-white px-2.5 py-1.5 text-left transition-shadow ${
        active
          ? 'border-[#4E83FD] shadow-[0_4px_14px_rgba(78,131,253,0.25)]'
          : 'border-black/5 shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:border-[#4E83FD]/40'
      }`}
    >
      <div className="flex items-center gap-1 text-[12px] font-semibold text-[#252632]">
        {dim.label} {value}
        {dim.grade && (
          <span className="rounded bg-[#EDF3FF] px-1 py-px text-[10px] font-normal text-[#4E83FD]">
            {dim.grade}
          </span>
        )}
      </div>
      <div className="mt-0.5 text-[11px] text-[#252632]/50">超过{dim.percentile}%同类作者</div>
    </button>
  )
}

/** 五个浮签的定位（百分比坐标，顺时针从顶部开始，对应 dims 顺序）。 */
const CHIP_POS: React.CSSProperties[] = [
  { top: 0, left: '50%', transform: 'translateX(-50%)' },
  { top: '32%', right: 0 },
  { bottom: '4%', right: '8%' },
  { bottom: '4%', left: '8%' },
  { top: '32%', left: 0 },
]

export function OverviewRadar({
  dims,
  active,
  onSelect,
}: {
  dims: RadarDimData[]
  active: number
  onSelect: (i: number) => void
}) {
  const data = dims.map((d) => ({ name: d.label, mine: d.mine, peers: d.peers }))
  return (
    <div className="relative h-[330px] w-full max-w-[460px]">
      {/* 雷达本体缩在中间，给周围浮签留白 */}
      <div className="absolute inset-x-[70px] inset-y-[40px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="86%">
            <PolarGrid stroke="#E6E8EC" />
            <PolarAngleAxis dataKey="name" tick={false} />
            <Radar dataKey="peers" stroke="#C9CDD4" fill="#C9CDD4" fillOpacity={0.18} strokeWidth={1.5} />
            <Radar dataKey="mine" stroke={BLUE} fill={BLUE} fillOpacity={0.22} strokeWidth={1.5} dot={{ r: 2.5, fill: '#fff', stroke: BLUE }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {dims.map((d, i) => (
        <div key={d.key} className="absolute" style={CHIP_POS[i]}>
          <DimChip dim={d} active={i === active} onClick={() => onSelect(i)} />
        </div>
      ))}
      {/* 图例 */}
      <div className="absolute bottom-[-14px] left-1/2 flex -translate-x-1/2 items-center gap-4 text-[11px] text-[#252632]/60">
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE }} /> 我的指标
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-[#C9CDD4]" /> 同类作者
        </span>
      </div>
    </div>
  )
}

/* ─── 面积趋势图（作品数据 / 粉丝数据共用） ─── */

interface TooltipProps {
  active?: boolean
  payload?: { value: number; payload: TrendPoint }[]
  label?: string
}

/** 播放量的富 tooltip：环比 + 渠道拆分 + 当日 Top3 视频（全部来自接口的逐日数据）。 */
function PlaysTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="w-[200px] rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
      <div className="text-[12px] font-semibold text-[#252632]">{label}</div>
      <div className="mt-1.5 flex items-center gap-1 text-[12px]">
        <i className="h-1.5 w-1.5 rounded-full" style={{ background: BLUE }} />
        <span className="text-[#252632]/70">播放量</span>
        {p.deltaPct != null && (
          <span className={p.deltaPct >= 0 ? 'text-[#F53F3F]' : 'text-[#00B578]'}>
            {p.deltaPct >= 0 ? '+' : ''}
            {p.deltaPct}%
          </span>
        )}
        <span className="ml-auto font-semibold text-[#252632]">{fmtCount(p.plays)}</span>
      </div>
      <div className="mt-1 space-y-0.5 pl-2.5 text-[11px] text-[#252632]/55">
        <div className="flex justify-between">
          <span>抖音</span>
          <span>{fmtCount(p.playsDouyin)}</span>
        </div>
        <div className="flex justify-between">
          <span>西瓜</span>
          <span>{fmtCount(p.playsXigua)}</span>
        </div>
      </div>
      {p.topVideos.length > 0 && (
        <>
          <div className="mt-2 border-t border-black/5 pt-1.5 text-[11px] font-medium text-[#252632]/80">Top3视频</div>
          <div className="mt-1 space-y-1 text-[11px]">
            {p.topVideos.map((v, i) => (
              <div key={v.title} className="flex items-center justify-between gap-2">
                <span className={`truncate ${i === 0 ? 'text-[#4E83FD]' : 'text-[#252632]/70'}`}>{v.title}</span>
                <span className="shrink-0 text-[#252632]/55">{fmtCount(v.plays)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SimpleTooltip({ active, payload, label, name }: TooltipProps & { name: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] shadow-[0_6px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
      <div className="font-medium text-[#252632]">{label}</div>
      <div className="text-[#252632]/60">
        {name} {fmtCount(payload[0].value)}
      </div>
    </div>
  )
}

function CountTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] shadow-[0_6px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
      <div className="font-medium text-[#252632]">{label}</div>
      <div className="text-[#252632]/60">{fmtCount(payload[0].value)}</div>
    </div>
  )
}

/** 通用面积趋势图（date/value 序列），首页数据概览用。 */
export function SimpleAreaChart({ data, id, height = 200 }: { data: { date: string; value: number }[]; id: string; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity={0.2} />
              <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(37,38,50,0.4)' }} dy={6} interval="preserveStartEnd" />
          <Tooltip content={<CountTooltip />} cursor={{ stroke: '#D3D8DF', strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="value" stroke={BLUE} strokeWidth={2} fill={`url(#${id})`} activeDot={{ r: 4, fill: '#fff', stroke: BLUE, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TrendAreaChart({
  data,
  dataKey,
  name,
  id,
  rich,
}: {
  data: TrendPoint[]
  /** 画哪个指标的序列（TrendPoint 的数值字段名） */
  dataKey: keyof TrendPoint
  /** 简单 tooltip 里显示的指标名 */
  name: string
  /** 渐变 defs 的唯一 id，避免同页两图冲突 */
  id: string
  /** 播放量专用富 tooltip（环比/渠道/Top3） */
  rich?: boolean
}) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity={0.22} />
              <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#EEF0F3" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'rgba(37,38,50,0.45)' }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={52}
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: 'rgba(37,38,50,0.45)' }}
            tickFormatter={(v: number) => fmtAxis(v)}
          />
          <Tooltip
            content={rich ? <PlaysTooltip /> : <SimpleTooltip name={name} />}
            cursor={{ stroke: '#D3D8DF', strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={BLUE}
            strokeWidth={2}
            fill={`url(#${id})`}
            activeDot={{ r: 4, fill: '#fff', stroke: BLUE, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
