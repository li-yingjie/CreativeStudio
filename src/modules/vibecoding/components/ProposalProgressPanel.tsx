import {
  ChevronRight,
  FileText,
  LayoutDashboard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * 会话产出面板。和 vibecoding 的 chat-driven 哲学保持一致：不假设固定
 * 的 N 步流程，只展示对话已经实际沉淀的产出。下一步操作走 chat 内的
 * CTA 按钮，不在这里重复展示。
 */

export type ProposalProgressStep =
  | 'idle'
  | 'collecting'
  | 'goal-confirmed'
  | 'audience-diagnosed'
  | 'pack-ready'
  | 'brief-ready'
  | 'report-ready'
  | 'dashboard-ready'
  | 'review-ready'

interface Artifact {
  filename: string
  /** Short summary line auto-derived from chat. */
  summary: string
  /** Anchor in chat to scroll to when clicked. */
  anchor: string
}

type ArtifactKind = 'doc' | 'dashboard'

interface ProposalProgressPanelProps {
  /** Current chat-driven stage. Drives the status pill. */
  step: ProposalProgressStep
  /** Filenames that have been generated, keyed by bare filename. The
   *  ordering of object insertion is preserved so the list reads top-down
   *  like the chat. */
  docs: Record<string, unknown>
  onOpenFile: (filename: string) => void
  onJumpToStep?: (anchor: string) => void
  /** Map of filename → chat anchor id, used so each artifact can scroll
   *  back to where it was generated. */
  anchorByFile?: Record<string, string>
  /** Map of filename → human summary line for the artifact card. */
  summaryByFile?: Record<string, string>
  /** Map of filename → artifact kind, drives icon + tag rendering.
   *  Defaults to 'doc' (FileText) for unmapped files. */
  kindByFile?: Record<string, ArtifactKind>
}

const KIND_ICON: Record<ArtifactKind, LucideIcon> = {
  doc: FileText,
  dashboard: LayoutDashboard,
}

const KIND_LABEL: Record<ArtifactKind, string> = {
  doc: '文档',
  dashboard: '看板',
}

const KIND_TONE: Record<ArtifactKind, string> = {
  doc: 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/65',
  dashboard:
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
}

const STAGE_LABEL: Record<ProposalProgressStep, string> = {
  idle: '等待开始',
  collecting: '正在收集商家诉求',
  'goal-confirmed': '目标已结构化',
  'audience-diagnosed': '人群与流量诊断已完成',
  'pack-ready': '达人包策略已确认',
  'brief-ready': '玩法 + Brief 已固化',
  'report-ready': '提案报告已生成',
  'dashboard-ready': '执行看板已转出',
  'review-ready': '复盘已沉淀',
}

export default function ProposalProgressPanel({
  step,
  docs,
  onOpenFile,
  onJumpToStep,
  anchorByFile = {},
  summaryByFile = {},
  kindByFile = {},
}: ProposalProgressPanelProps) {
  const artifacts: Artifact[] = Object.keys(docs).map((filename) => ({
    filename,
    summary: summaryByFile[filename] ?? '由 AI 在对话中沉淀的产出',
    anchor: anchorByFile[filename] ?? '',
  }))

  return (
    <div className="thin-scroll flex h-full min-h-0 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      {/* Slim status strip — project + stage pill, no extra chrome. */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-6 py-3">
        <p className="truncate text-[12.5px] text-[var(--color-ink)]/65">
          沪上火锅·五一种草提案
        </p>
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--fill-subtle)] px-2.5 py-1 text-[11.5px] text-[var(--color-ink)]/65">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {STAGE_LABEL[step]}
        </div>
      </div>

      {artifacts.length === 0 ? (
        <div className="px-6 py-5">
          <div className="rounded-lg bg-[var(--fill-subtle)]/50 px-3 py-2.5 text-[12px] leading-[1.65] text-[var(--color-ink)]/45">
            开始对话后，AI 沉淀的文档、配置、看板都会列在这里
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-6 py-5">
          {artifacts.map((a, idx) => {
            const kind = kindByFile[a.filename] ?? 'doc'
            const Icon = KIND_ICON[kind]
            return (
              <button
                key={a.filename}
                type="button"
                onClick={() => onOpenFile(a.filename)}
                className="group relative flex w-full items-start gap-3 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4 py-3.5 text-left transition-colors hover:border-[var(--color-ink)]/20 hover:bg-[var(--fill-subtle)]"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${KIND_TONE[kind]}`}
                >
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-mono text-[var(--color-ink)]/35">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate text-[14px] font-semibold text-[var(--color-ink)]">
                      {a.filename}
                    </span>
                    <span
                      className={`ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${KIND_TONE[kind]}`}
                    >
                      {KIND_LABEL[kind]}
                    </span>
                  </div>
                  <p className="text-[12.5px] leading-[1.65] text-[var(--color-ink)]/65">
                    {a.summary}
                  </p>
                </div>
                {a.anchor && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      onJumpToStep?.(a.anchor)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        onJumpToStep?.(a.anchor)
                      }
                    }}
                    className="ml-2 inline-flex shrink-0 cursor-pointer items-center gap-0.5 self-start rounded-md px-1.5 py-0.5 text-[11px] text-[var(--color-ink)]/40 opacity-0 transition-all hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85 group-hover:opacity-100"
                  >
                    跳到对话位置
                    <ChevronRight size={11} strokeWidth={1.8} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
