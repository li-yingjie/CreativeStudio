import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import {
  BarChart3,
  ChevronRight,
  Lock,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from '@/shared/icons'
import { fmtCount, type WorkItem } from './api'

/* ─── 内容管理页的「作品行」组件 ───
 * 封面（置顶/张数/时长角标）+ 标题与行内操作 + 活动标签 + 日期状态 +
 * 迷你趋势 + 指标条 + 可选的流量升降通知条。列表页只负责铺行。 */

const BLUE = '#4E83FD'

/** 指标条单元：label 在上、值加粗在下，左侧细分隔线由父级控制。 */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 border-l border-black/5 px-2.5 first:border-l-0 first:pl-0">
      <div className="truncate text-[11px] text-[#252632]/45">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-[#252632]">{value}</div>
    </div>
  )
}

/** 近 14 天播放的迷你面积图（无轴、无交互）。 */
function Sparkline({ data, id }: { data: number[]; id: string }) {
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

function ActionLink({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: typeof Pencil
  label: string
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 text-[12px] transition-colors ${
        danger ? 'text-[#F53F3F] hover:text-[#d63030]' : 'text-[#252632]/60 hover:text-[#252632]'
      }`}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </button>
  )
}

/** 作品行的指标集合：前 5 项通用，后 3 项按体裁（图文/视频）不同。 */
function metricCells(w: WorkItem): { label: string; value: string }[] {
  const m = w.metrics
  const common = [
    { label: '播放', value: fmtCount(m.plays) },
    { label: '点赞', value: fmtCount(m.likes) },
    { label: '评论', value: fmtCount(m.comments) },
    { label: '分享', value: fmtCount(m.shares) },
    { label: '收藏', value: fmtCount(m.favorites) },
  ]
  const typed =
    w.type === 'gallery'
      ? [
          { label: '完播率', value: `${m.finishRate}%` },
          { label: '2S 跳出率', value: `${m.bounce2s}%` },
        ]
      : [
          { label: '弹幕', value: fmtCount(m.danmaku ?? 0) },
          { label: '封面点击率', value: `${m.coverClickRate}%` },
          { label: '平均播放占比', value: `${m.avgPlayRatio}%` },
        ]
  return [...common, ...typed, { label: '吸粉量', value: fmtCount(m.fanGain) }]
}

export default function WorkRow({
  work,
  onEdit,
  onAnalyze,
  onPermission,
  onTogglePin,
  onDelete,
}: {
  work: WorkItem
  onEdit?: (w: WorkItem) => void
  onAnalyze?: (w: WorkItem) => void
  onPermission?: (w: WorkItem) => void
  onTogglePin?: (w: WorkItem) => void
  onDelete?: (w: WorkItem) => void
}) {
  return (
    <div>
      <div className="flex gap-4 py-4">
        {/* 封面 */}
        <div className="relative h-[150px] w-[112px] shrink-0 overflow-hidden rounded-xl bg-black/5">
          <img src={work.cover} alt={work.title} className="h-full w-full object-cover" />
          {work.pinned && (
            <span className="absolute left-1.5 top-1.5 rounded bg-[#F5B60D] px-1.5 py-0.5 text-[10px] font-medium text-white">
              置顶
            </span>
          )}
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
            {work.type === 'gallery' ? `${work.imageCount}张` : work.duration}
          </span>
        </div>

        {/* 右侧内容 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start gap-6">
            <h4 className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#252632]">{work.title}</h4>
            <div className="flex shrink-0 items-center gap-4">
              <ActionLink icon={Pencil} label="编辑作品" onClick={() => onEdit?.(work)} />
              <ActionLink icon={BarChart3} label="分析详情" onClick={() => onAnalyze?.(work)} />
              <ActionLink icon={Lock} label="设置权限" onClick={() => onPermission?.(work)} />
              <ActionLink
                icon={work.pinned ? PinOff : Pin}
                label={work.pinned ? '取消置顶' : '置顶作品'}
                onClick={() => onTogglePin?.(work)}
              />
              <ActionLink icon={Trash2} label="删除作品" danger onClick={() => onDelete?.(work)} />
            </div>
          </div>

          {work.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {work.tags.map((t) => (
                <span key={t} className="rounded-full border border-black/8 bg-[#F7F8FA] px-2 py-0.5 text-[11px] text-[#252632]/65">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className="text-[#252632]/45">{work.publishedAt}</span>
            <span className="text-[#00B578]">{work.status}</span>
            {work.trafficDown && (
              <button type="button" className="flex items-center text-[#FF7A45] hover:opacity-80">
                流量减少 <ChevronRight size={12} />
              </button>
            )}
          </div>

          {/* 指标条 */}
          <div className="mt-auto flex items-end gap-4 pt-3">
            <Sparkline data={work.spark} id={`spark-${work.id}`} />
            <div className="flex min-w-0 flex-1 items-center">
              {metricCells(work).map((c) => (
                <Metric key={c.label} label={c.label} value={c.value} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 流量升降通知条（由后端按近7日 vs 前7日真实对比生成） */}
      {work.notice && (
        <button
          type="button"
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] ${
            work.notice.tone === 'success'
              ? 'bg-[#E8F7EE] text-[#00A550] hover:bg-[#DEF3E7]'
              : 'bg-[#FFEFEA] text-[#F53F3F] hover:bg-[#FFE6DF]'
          }`}
        >
          <span className="flex-1">
            {work.notice.tone === 'success' ? '📈 ' : '❗ '}
            {work.notice.text}
          </span>
          <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}
