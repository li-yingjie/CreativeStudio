import {
  BarChart3,
  Bot,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Palette,
  Search,
  Sparkles,
  Table as TableIcon,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Capability } from './ResourceLibraryData'

/**
 * Conditional preview "canvas" rendered above 详细说明 in the capability
 * detail page. Only capabilities that produce a tangible artefact get a
 * preview — for text-only / governance / metadata capabilities we return
 * null and the detail page falls through to just the markdown.
 *
 * Preview kind is matched by capability name keywords (same idea as
 * ResourceIconMap's icon rules) so adding new kinds is just adding a
 * pattern row.
 */

type PreviewKind =
  | 'table'
  | 'chart'
  | 'dashboard'
  | 'doc'
  | 'image'
  | 'video'
  | 'search'
  | 'message'
  | 'code'
  | 'agent'

const NAME_PREVIEW_RULES: Array<{ patterns: string[]; kind: PreviewKind }> = [
  { patterns: ['xlsx', '表格', 'sheet', '多维', 'table'], kind: 'table' },
  { patterns: ['看板', 'dashboard'], kind: 'dashboard' },
  {
    patterns: [
      '图表',
      'chart',
      '气泡图',
      '瀑布图',
      'vchart',
      '分析',
      'analysis',
      'analyz',
      'analytics',
      '统计',
      '指标',
      'metric',
      '监测',
      'monitor',
      '监控',
      '异常',
      '检测',
      'spc-',
    ],
    kind: 'chart',
  },
  {
    patterns: [
      'pdf',
      'docx',
      '文档',
      'doc',
      'one-page',
      'onepage',
      'easy-read',
      'prettydoc',
      '报告',
      'report',
      '战报',
      '一页纸',
      '周报',
      'weekly',
      '日报',
      'morning',
      'evening',
    ],
    kind: 'doc',
  },
  {
    patterns: ['ppt', 'slide', '幻灯片', 'high-end-ppt'],
    kind: 'doc',
  },
  {
    patterns: ['图片', 'image', 'banner', '图像', '渲染图片', 'screenshot', '设计', 'design', '原型', 'mockup', 'svg', 'palette'],
    kind: 'image',
  },
  {
    patterns: ['视频', 'video', '直播', 'live', '剪辑', 'videocut', '短剧', 'short-drama', 'drama'],
    kind: 'video',
  },
  {
    patterns: ['搜索', 'search', '检索', 'research', '查询', 'query', 'sql'],
    kind: 'search',
  },
  {
    patterns: ['消息', '群聊', '单聊', 'im-chat', 'chat-', '通知', 'message', 'feishu-card', '飞书卡片', 'lark-im', 'lark-card', '会议', 'meeting', '邮件', 'mail'],
    kind: 'message',
  },
  {
    patterns: ['code', '代码', 'codebase', 'cli'],
    kind: 'code',
  },
  {
    patterns: ['agent', 'autopilot', 'humanizer', 'bot', 'ai', 'llm'],
    kind: 'agent',
  },
]

function pickPreviewKind(name: string): PreviewKind | null {
  const lower = name.toLowerCase()
  for (const rule of NAME_PREVIEW_RULES) {
    if (rule.patterns.some((p) => lower.includes(p.toLowerCase()))) {
      return rule.kind
    }
  }
  return null
}

const KIND_META: Record<PreviewKind, { label: string; icon: LucideIcon }> = {
  table: { label: '示例输出 · 表格', icon: TableIcon },
  chart: { label: '示例输出 · 图表', icon: BarChart3 },
  dashboard: { label: '示例输出 · 看板', icon: LayoutDashboard },
  doc: { label: '示例输出 · 文档', icon: FileText },
  image: { label: '示例输出 · 视觉', icon: ImageIcon },
  video: { label: '示例输出 · 视频', icon: Video },
  search: { label: '示例输出 · 搜索结果', icon: Search },
  message: { label: '示例输出 · 消息卡片', icon: MessageSquare },
  code: { label: '示例输出 · 代码', icon: Monitor },
  agent: { label: '示例输出 · 对话', icon: Bot },
}

export default function CapabilityPreviewCanvas({
  capability,
}: {
  capability: Capability
}) {
  const kind = pickPreviewKind(capability.name)
  if (!kind) return null
  const { label, icon: Icon } = KIND_META[kind]
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      {/* Toolbar — fake "canvas" header so it reads as a live workspace
          rather than a static screenshot. */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--divider-soft)] bg-[var(--fill-subtle)]/50 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink)]/65">
          <Icon size={13} strokeWidth={1.8} className="text-[var(--color-ink)]/55" />
          {label}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400/70" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-amber-400/70" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" aria-hidden />
        </div>
      </div>
      <div className="bg-[var(--color-surface-0)] p-5">
        <PreviewBody kind={kind} capability={capability} />
      </div>
    </div>
  )
}

function PreviewBody({
  kind,
  capability,
}: {
  kind: PreviewKind
  capability: Capability
}) {
  switch (kind) {
    case 'table':
      return <TablePreview />
    case 'chart':
      return <ChartPreview />
    case 'dashboard':
      return <DashboardPreview />
    case 'doc':
      return <DocPreview title={capability.name} />
    case 'image':
      return <ImagePreview />
    case 'video':
      return <VideoPreview />
    case 'search':
      return <SearchPreview query={capability.name} />
    case 'message':
      return <MessagePreview title={capability.name} />
    case 'code':
      return <CodePreview />
    case 'agent':
      return <AgentPreview />
  }
}

/* ─── Per-kind mock visuals ─── */

function TablePreview() {
  const rows = [
    ['2025-04-12', '美妆/护肤', '124,520', '+8.4%', 'A'],
    ['2025-04-11', '3C 数码', '98,140', '+3.1%', 'B'],
    ['2025-04-10', '生活美食', '76,830', '-1.2%', 'B'],
    ['2025-04-09', '本地服务', '64,508', '+12.8%', 'A'],
  ]
  return (
    <table className="w-full border-collapse text-[12.5px]">
      <thead>
        <tr className="border-b border-[var(--divider-soft)] text-left text-[11.5px] uppercase tracking-[0.04em] text-[var(--color-ink)]/45">
          <th className="py-2 pr-3 font-medium">日期</th>
          <th className="py-2 pr-3 font-medium">行业</th>
          <th className="py-2 pr-3 text-right font-medium">A3 人群</th>
          <th className="py-2 pr-3 text-right font-medium">环比</th>
          <th className="py-2 text-center font-medium">健康度</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={i}
            className="border-b border-[var(--divider-soft)]/60 last:border-b-0"
          >
            <td className="py-2.5 pr-3 tabular-nums text-[var(--color-ink)]/75">{r[0]}</td>
            <td className="py-2.5 pr-3 text-[var(--color-ink)]">{r[1]}</td>
            <td className="py-2.5 pr-3 text-right tabular-nums font-medium text-[var(--color-ink)]">{r[2]}</td>
            <td
              className={`py-2.5 pr-3 text-right tabular-nums ${
                r[3].startsWith('+')
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-rose-600 dark:text-rose-300'
              }`}
            >
              {r[3]}
            </td>
            <td className="py-2.5 text-center">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-semibold ${
                  r[4] === 'A'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                }`}
              >
                {r[4]}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ChartPreview() {
  const bars = [42, 58, 39, 71, 55, 84, 67, 78, 62, 90, 73, 88]
  const max = Math.max(...bars)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-semibold tabular-nums text-[var(--color-ink)]">128.4 万</span>
          <span className="text-[11.5px] font-medium text-emerald-600 dark:text-emerald-300">+12.6%</span>
        </div>
        <span className="text-[11px] text-[var(--color-ink)]/45">近 12 周 · A3 人群规模</span>
      </div>
      <div className="flex h-28 items-end gap-1.5">
        {bars.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-indigo-500/70 transition-all"
            style={{ height: `${(v / max) * 100}%` }}
            aria-hidden
          />
        ))}
      </div>
      <div className="flex justify-between text-[10.5px] tabular-nums text-[var(--color-ink)]/45">
        <span>W1</span>
        <span>W4</span>
        <span>W8</span>
        <span>W12</span>
      </div>
    </div>
  )
}

function DashboardPreview() {
  const kpis = [
    { label: 'GMV', value: '¥3.42M', delta: '+8%', tone: 'ok' as const },
    { label: '转化率', value: '5.18%', delta: '+0.4pt', tone: 'ok' as const },
    { label: 'ROI', value: '2.84', delta: '-3%', tone: 'risk' as const },
    { label: '退货率', value: '6.7%', delta: '+0.6pt', tone: 'risk' as const },
  ]
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2.5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex flex-col gap-1 rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)]/40 p-3"
          >
            <span className="text-[10.5px] uppercase tracking-[0.04em] text-[var(--color-ink)]/45">{k.label}</span>
            <span className="text-[15px] font-semibold tabular-nums text-[var(--color-ink)]">{k.value}</span>
            <span
              className={`text-[10.5px] font-medium tabular-nums ${
                k.tone === 'ok'
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-rose-600 dark:text-rose-300'
              }`}
            >
              {k.delta}
            </span>
          </div>
        ))}
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--fill-subtle)]">
        <div className="bg-indigo-500/70" style={{ width: '46%' }} />
        <div className="bg-emerald-500/70" style={{ width: '28%' }} />
        <div className="bg-amber-500/70" style={{ width: '16%' }} />
        <div className="bg-rose-500/70" style={{ width: '10%' }} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--color-ink)]/65">
        <Legend color="bg-indigo-500/70" label="自然流量 46%" />
        <Legend color="bg-emerald-500/70" label="达人内容 28%" />
        <Legend color="bg-amber-500/70" label="搜索 16%" />
        <Legend color="bg-rose-500/70" label="付费推广 10%" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-sm ${color}`} aria-hidden />
      {label}
    </span>
  )
}

function DocPreview({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold text-[var(--color-ink)]">
        {title} · 示例
      </span>
      <span className="text-[11px] text-[var(--color-ink)]/45">
        AI · 自动生成 · 2 分钟前
      </span>
      <div className="mt-2 flex flex-col gap-1.5">
        <Bar w="92%" />
        <Bar w="86%" />
        <Bar w="78%" />
        <div className="h-1" />
        <span className="text-[12.5px] font-medium text-[var(--color-ink)]/85">
          ## 关键结论
        </span>
        <Bar w="88%" />
        <Bar w="74%" />
        <Bar w="62%" />
      </div>
    </div>
  )
}

function Bar({ w }: { w: string }) {
  return (
    <span
      className="block h-2 rounded-full bg-[var(--fill-subtle)]"
      style={{ width: w }}
      aria-hidden
    />
  )
}

function ImagePreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="aspect-square overflow-hidden rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${imageGradient(i)})`,
          }}
        >
          <div className="flex h-full w-full items-end justify-start p-2">
            <span className="rounded-md bg-black/35 px-1.5 py-0.5 text-[10.5px] font-medium text-white/85 backdrop-blur-sm">
              <Palette size={9} className="mr-1 inline-block" strokeWidth={1.8} />
              v{i + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function imageGradient(i: number): string {
  const palettes = [
    'rgb(99 102 241), rgb(217 70 239)',
    'rgb(16 185 129), rgb(59 130 246)',
    'rgb(244 114 182), rgb(251 146 60)',
  ]
  return palettes[i % palettes.length]
}

function VideoPreview() {
  return (
    <div
      className="relative aspect-video overflow-hidden rounded-lg"
      style={{
        background:
          'linear-gradient(135deg, rgb(31 41 55), rgb(99 102 241 / 0.85))',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-[var(--color-ink)] shadow-[0_4px_18px_-4px_rgba(0,0,0,0.4)]">
          <span
            className="ml-0.5 inline-block h-0 w-0"
            style={{
              borderLeft: '12px solid currentColor',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
            }}
            aria-hidden
          />
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-white/90">
        <span className="text-[11px] tabular-nums">00:42 / 03:18</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[22%] rounded-full bg-white/85" aria-hidden />
        </div>
      </div>
    </div>
  )
}

function SearchPreview({ query }: { query: string }) {
  const results = [
    { title: '《五一种草手册 V2》', meta: 'wiki · 火锅事业部 · 4 月 20 日' },
    { title: '同类商家 30 天指标对比', meta: '风神 · 数据分析 · 5 分钟前' },
    { title: '本地垂类达人内容标签拆解', meta: 'iDA · 内容标签 · 1 小时前' },
  ]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-md bg-[var(--fill-subtle)] px-3 py-2">
        <Search size={13} strokeWidth={1.8} className="text-[var(--color-ink)]/55" />
        <span className="text-[12.5px] text-[var(--color-ink)]/85">{query}</span>
      </div>
      <div className="flex flex-col">
        {results.map((r, i) => (
          <div
            key={i}
            className="flex flex-col gap-0.5 border-b border-[var(--divider-soft)]/60 py-2.5 last:border-b-0"
          >
            <span className="text-[13px] text-[var(--color-ink)]">
              {r.title}
            </span>
            <span className="text-[11px] text-[var(--color-ink)]/45">{r.meta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MessagePreview({ title }: { title: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      <div className="flex items-center gap-2 border-b border-[var(--divider-soft)] bg-[var(--fill-subtle)]/60 px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
          AI
        </span>
        <span className="text-[12px] text-[var(--color-ink)]/85">{title}</span>
      </div>
      <div className="flex flex-col gap-2.5 px-3 py-3">
        <span className="text-[13px] text-[var(--color-ink)]">
          🎉 五一活动种草进度日报已生成
        </span>
        <div className="grid grid-cols-3 gap-2 text-[11.5px]">
          <KV label="A3 人群" value="128 万" />
          <KV label="看后搜" value="34 万" />
          <KV label="自然占比" value="46%" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="rounded-md bg-[var(--color-ink)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--color-ink-contrast)]">
            查看完整报告
          </span>
          <span className="text-[11px] text-[var(--color-ink)]/45">5 月 9 日 09:00</span>
        </div>
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-[var(--fill-subtle)] px-2 py-1.5">
      <span className="text-[10px] text-[var(--color-ink)]/55">{label}</span>
      <span className="text-[12.5px] font-semibold tabular-nums text-[var(--color-ink)]">{value}</span>
    </div>
  )
}

function CodePreview() {
  const lines = [
    { c: '// generated by VibeCoding', t: 'mute' as const },
    { c: 'export async function queryA3(date: string) {', t: 'kw' as const },
    { c: "  const rows = await db.query('SELECT * FROM a3 WHERE d = ?', [date])", t: 'plain' as const },
    { c: '  return rows.map(r => ({', t: 'plain' as const },
    { c: '    industry: r.industry,', t: 'plain' as const },
    { c: '    a3: r.a3_count,', t: 'plain' as const },
    { c: '  }))', t: 'plain' as const },
    { c: '}', t: 'kw' as const },
  ]
  const tone: Record<'mute' | 'kw' | 'plain', string> = {
    mute: 'text-[var(--color-ink)]/40',
    kw: 'text-indigo-600 dark:text-indigo-300',
    plain: 'text-[var(--color-ink)]/85',
  }
  return (
    <pre className="overflow-x-auto rounded-md bg-[var(--fill-subtle)]/40 px-3 py-2.5 font-mono text-[12px] leading-[1.7]">
      {lines.map((l, i) => (
        <div key={i} className={`flex gap-3 ${tone[l.t]}`}>
          <span className="w-4 shrink-0 select-none text-right text-[var(--color-ink)]/30">
            {i + 1}
          </span>
          <span>{l.c}</span>
        </div>
      ))}
    </pre>
  )
}

function AgentPreview() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-w-[90%] gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--fill-subtle)] text-[10px] font-medium text-[var(--color-ink)]/70">
          U
        </span>
        <div className="rounded-lg rounded-tl-sm bg-[var(--fill-subtle)] px-3 py-2 text-[12.5px] text-[var(--color-ink)]/85">
          帮我看下昨天的种草进度
        </div>
      </div>
      <div className="ml-auto flex max-w-[90%] flex-row-reverse gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
          AI
        </span>
        <div className="flex flex-col gap-1.5 rounded-lg rounded-tr-sm bg-indigo-500/10 px-3 py-2 text-[12.5px] text-[var(--color-ink)]/85">
          <span>昨日 A3 净增 12 万，看后搜环比 +8%。</span>
          <span className="inline-flex items-center gap-1 text-[11.5px] text-indigo-700 dark:text-indigo-200">
            <Sparkles size={10} strokeWidth={1.8} />
            建议加大本地垂类达人投放
          </span>
        </div>
      </div>
    </div>
  )
}

/* Re-export the kind picker for callers that want to know whether a
 * preview will render, before committing to layout space. */
export function hasCapabilityPreview(capability: Capability): boolean {
  return pickPreviewKind(capability.name) !== null
}
