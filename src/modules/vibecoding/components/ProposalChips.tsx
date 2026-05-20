import { ArrowUpRight, FileCode2, FileText, LayoutDashboard, Library } from '@/shared/icons'

/** Static, inline @-mention chip for resource references inside AI bubbles.
 *  Self-contained styles (Tailwind) so the chip renders consistently
 *  outside the contentEditable composer's `.chat-editable` scope where
 *  the original `.mention-pill` CSS lives. */
export function MentionChip({ name }: { name: string }) {
  return (
    <span className="mx-[1px] inline-flex items-baseline gap-[3px] rounded-md bg-indigo-500/10 px-1.5 align-baseline text-[13px] leading-[18px] text-[var(--color-ink)]">
      <Library
        size={10}
        strokeWidth={1.8}
        className="shrink-0 self-center text-indigo-500"
      />
      {name}
    </span>
  )
}

/** Inline quality-score chip used in 提案报告 / 复盘 summary blocks. */
export function ReportQualityRow({
  label,
  score,
  tone,
}: {
  label: string
  score: string
  tone: 'mint' | 'amber' | 'rose'
}) {
  const toneMap: Record<string, string> = {
    mint: 'text-emerald-700 dark:text-emerald-300',
    amber: 'text-amber-700 dark:text-amber-300',
    rose: 'text-rose-700 dark:text-rose-300',
  }
  return (
    <div className="flex items-center justify-between rounded-md bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[11.5px]">
      <span className="text-[var(--color-ink)]/55">{label}</span>
      <span className={`font-semibold tabular-nums ${toneMap[tone]}`}>
        {score}
      </span>
    </div>
  )
}

/** Inline file pill rendered in AI bubbles when an artefact is generated.
 *  Click opens the file in a right-side preview tab. */
export function FileChip({
  filename,
  onOpen,
}: {
  filename: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-1 rounded-md bg-[var(--fill-subtle)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
    >
      <FileText size={11} strokeWidth={1.8} className="text-[var(--color-ink)]/55" />
      {filename}
    </button>
  )
}

/* ─── Block-level artefact card rendered in AI bubbles when a step
 *     produces a sedimented artefact. Visually mirrors the right-side
 *     ProposalProgressPanel artefact card so users feel the same
 *     "product card" identity in both places. ─── */

export type ArtifactKind = 'doc' | 'dashboard' | 'code'

const KIND_VISUAL: Record<
  ArtifactKind,
  { icon: typeof FileText; tone: string; label: string }
> = {
  doc: {
    icon: FileText,
    tone: 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/70',
    label: '文档',
  },
  dashboard: {
    icon: LayoutDashboard,
    tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
    label: '看板',
  },
  code: {
    icon: FileCode2,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    label: '代码',
  },
}

export function ArtifactCard({
  filename,
  summary,
  kind = 'doc',
  onOpen,
}: {
  filename: string
  summary?: string
  kind?: ArtifactKind
  onOpen: () => void
}) {
  const v = KIND_VISUAL[kind]
  const Icon = v.icon
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-start gap-3 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-3.5 py-3 text-left transition-colors hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-subtle)]"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${v.tone}`}
      >
        <Icon size={15} strokeWidth={1.7} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13.5px] font-semibold text-[var(--color-ink)]">
            {filename}
          </span>
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${v.tone}`}
          >
            {v.label}
          </span>
        </div>
        {summary && (
          <p className="text-[12px] leading-[1.6] text-[var(--color-ink)]/65">
            {summary}
          </p>
        )}
      </div>
      <ArrowUpRight
        size={14}
        strokeWidth={1.8}
        className="mt-1 shrink-0 text-[var(--color-ink)]/35 transition-colors group-hover:text-[var(--color-ink)]/75"
      />
    </button>
  )
}

/* Stack helper so multiple ArtifactCards in a row read as one group. */
export function ArtifactCardGroup({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col gap-2">{children}</div>
}
