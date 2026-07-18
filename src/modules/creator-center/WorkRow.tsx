import {
  ChevronRight,
  Lock,
  Music,
  Pencil,
  Pin,
  PinOff,
  Target,
  Trash2,
  TrendingUp,
} from '@/shared/icons'
import { fmtCount, type WorkItem } from './api'

/* ─── 内容管理页的「作品行」组件（设计稿 创作者中心26.7 · 20-8421） ───
 * 封面（置顶/张数/时长角标）+ 标题与行内操作 + 活动标签 + 日期状态 +
 * 指标条 + 可选的流量通知条。封面/标题/评论格可点进作品详情。 */

/** 指标格：label 在上、值加粗在下；格间细竖线分隔。`onClick` 让评论格
 *  点进详情的评论管理（设计稿 hover 态）——整行也可点，这里只是让评论
 *  格落到不同的 tab，所以要拦掉冒泡。 */
function Metric({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="truncate text-[12px] text-[#252632]/45">{label}</div>
      <div className="mt-1 text-[14px] font-semibold tabular-nums text-[#252632]">{value}</div>
    </>
  )
  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className="min-w-[92px] rounded-md border-l border-black/5 px-3 text-left transition-colors first:border-l-0 first:pl-0 hover:bg-black/5"
      >
        {inner}
      </button>
    )
  }
  return (
    <div className="min-w-[92px] border-l border-black/5 px-3 first:border-l-0 first:pl-0">
      {inner}
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
      // 整行可点进详情，行内操作要拦掉冒泡。
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      disabled={!onClick}
      className={`flex items-center gap-1 text-[12px] transition-colors ${
        danger ? 'text-[#F53F3F] hover:text-[#d63030]' : 'text-[#252632]/60 hover:text-[#252632]'
      }`}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </button>
  )
}

/** 作品行的指标集合：AI 工坊作品用一套「访问/使用」口径；视频/图文
 *  用原有播放口径（前 5 项通用，后几项按体裁不同）。 */
function metricCells(w: WorkItem): { label: string; value: string }[] {
  const m = w.metrics
  if (w.workshopKind) {
    return [
      { label: '访问量', value: fmtCount(m.plays) },
      { label: '访客数', value: fmtCount(m.likes) },
      { label: '互动', value: fmtCount(m.comments) },
      { label: '分享', value: fmtCount(m.shares) },
      { label: '收藏', value: fmtCount(m.favorites) },
      { label: '转化率', value: `${m.finishRate ?? 0}%` },
      { label: '新增用户', value: fmtCount(m.fanGain) },
    ]
  }
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
          { label: '完播率', value: `${w.metrics.finishRate}%` },
          { label: '2S 跳出率', value: `${w.metrics.bounce2s}%` },
        ]
      : [
          { label: '弹幕', value: fmtCount(m.danmaku ?? 0) },
          { label: '封面点击率', value: `${m.coverClickRate}%` },
          { label: '平均播放占比', value: `${m.avgPlayRatio}%` },
        ]
  return [...common, ...typed, { label: '吸粉量', value: fmtCount(m.fanGain) }]
}

/** '2025-05-05[ HH:MM]' → '2025年05月05日 00:01'。没带时间时由 id
 *  稳定派生一个演示值。 */
export function fmtWorkDate(w: WorkItem): string {
  const [datePart, timePart] = w.publishedAt.split(' ')
  const [y, mo, d] = datePart.split('-')
  let time = timePart
  if (!time) {
    let h = 0
    for (const ch of w.id) h = (h * 31 + ch.charCodeAt(0)) % 1440
    time = `${String(Math.floor(h / 60)).padStart(2, '0')}:${String(h % 60).padStart(2, '0')}`
  }
  return `${y}年${mo}月${d}日 ${time}`
}

export default function WorkRow({
  work,
  onOpen,
  onOpenComments,
  onEdit,
  onPermission,
  onTogglePin,
  onDelete,
}: {
  work: WorkItem
  /** 点封面/标题进入作品详情（总览 tab）。 */
  onOpen?: (w: WorkItem) => void
  /** 点「评论」指标进入作品详情的评论管理 tab。 */
  onOpenComments?: (w: WorkItem) => void
  onEdit?: (w: WorkItem) => void
  onPermission?: (w: WorkItem) => void
  onTogglePin?: (w: WorkItem) => void
  onDelete?: (w: WorkItem) => void
}) {
  return (
    <div>
      {/* 整行可点进详情；行内操作按钮各自 stopPropagation。 */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`查看作品「${work.title}」`}
        onClick={() => onOpen?.(work)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen?.(work)
          }
        }}
        className="group -mx-3 flex cursor-pointer flex-col gap-4 rounded-xl px-3 py-5 transition-colors hover:bg-black/[0.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4E83FD] sm:flex-row"
      >
        {/* 封面 */}
        <div className="relative h-[160px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-black/5">
          <img
            src={work.cover}
            alt={work.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {work.pinned && (
            <span className="absolute left-0 top-2 rounded-r bg-[#FF9F1A] px-1.5 py-0.5 text-[11px] font-medium text-white">
              置顶
            </span>
          )}
          {/* AI 工坊作品：类型 Tag 放封面左上角 */}
          {work.workshopKind && (
            <span
              className={`absolute left-1.5 rounded bg-[#3370FF] px-1.5 py-0.5 text-[11px] font-medium text-white shadow-sm ${
                work.pinned ? 'top-9' : 'top-1.5'
              }`}
            >
              {work.workshopKind}
            </span>
          )}
          {/* 视频时长 / 图文张数（工坊作品无此角标） */}
          {!work.workshopKind && (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[11px] text-white">
              {work.type === 'gallery' ? `${work.imageCount}张` : work.duration}
            </span>
          )}
        </div>

        {/* 右侧内容 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:gap-6">
            <h4 className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#252632] decoration-black/30 underline-offset-2 group-hover:underline">
              {work.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 xl:shrink-0">
              <ActionLink icon={Pencil} label="编辑作品" onClick={() => onEdit?.(work)} />
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
                <span
                  key={t}
                  className="flex items-center gap-1 rounded border border-black/8 px-1.5 py-0.5 text-[12px] text-[#252632]/75"
                >
                  {t.startsWith('挑战') ? (
                    <Target size={12} className="text-[#252632]/55" />
                  ) : (
                    <Music size={12} className="text-[#252632]/55" />
                  )}
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2.5 text-[13px]">
            <span className="text-[#252632]/60">{fmtWorkDate(work)}</span>
            {work.trafficDown ? (
              <span className="flex items-center text-[#F5533D] group-hover:opacity-80">
                流量减少 <ChevronRight size={13} />
              </span>
            ) : (
              <span className="text-[#00B578]">{work.status}</span>
            )}
          </div>

          {/* 指标条 */}
          <div className="mt-auto flex items-end overflow-x-auto pt-4">
            {metricCells(work).map((c) => (
              <Metric
                key={c.label}
                label={c.label}
                value={c.value}
                onClick={c.label === '评论' ? () => onOpenComments?.(work) : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 流量升降通知条（由后端按近7日 vs 前7日真实对比生成） */}
      {work.notice && (
        <button
          type="button"
          onClick={() => onOpen?.(work)}
          className={`mb-2 flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-[13px] ${
            work.notice.tone === 'success'
              ? 'bg-[#E8F7EE] text-[#00A550] hover:bg-[#DEF3E7]'
              : 'bg-[#FFEFEA] text-[#F53F3F] hover:bg-[#FFE6DF]'
          }`}
        >
          <TrendingUp size={14} className="shrink-0" />
          <span className="flex-1">{work.notice.text}</span>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}
