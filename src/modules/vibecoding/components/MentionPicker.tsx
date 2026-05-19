import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  FileCode2,
  FolderCode,
  FolderTree,
  Library,
  Wrench,
  Zap,
} from 'lucide-react'

export interface MentionItem {
  id: string
  name: string
  /** Optional tag shown next to the name (e.g. "AI分身"). */
  tag?: string
}

export type MentionTab = 'skills' | 'tools' | 'files' | 'triggers' | 'resources'

interface AnchorRect {
  left: number
  top: number
  width: number
}

interface MentionPickerProps {
  open: boolean
  /** Anchor rect of the composer — picker positions itself above it. */
  anchor: AnchorRect | null
  skills: MentionItem[]
  tools: MentionItem[]
  files: MentionItem[]
  triggers: MentionItem[]
  resources: MentionItem[]
  /** Receives the tab so the inserted pill can be color-coded / icon-
   *  prefixed by kind. */
  onInsert: (item: MentionItem, tab: MentionTab) => void
  onClose: () => void
  /** Open the resource library tab in the right preview area. */
  onOpenResourceLibrary?: () => void
}

const TABS: { id: MentionTab; label: string; icon: LucideIcon }[] = [
  { id: 'skills', label: 'Skills', icon: FolderCode },
  { id: 'tools', label: '工具', icon: Wrench },
  { id: 'resources', label: '资源', icon: Library },
  { id: 'files', label: '文件目录', icon: FolderTree },
  { id: 'triggers', label: '触发条件', icon: Zap },
]

/**
 * @mention picker — pops up above the chat composer when the user types
 * `@`. Top tabs switch between resource kinds; each tab renders a simple
 * list of items. Click an item to insert `@{name} ` into the draft.
 *
 * Kept intentionally minimal (no sidebar sub-categories, no search field,
 * no arrow-key navigation) — the tabs + click-to-insert interaction is
 * enough for the current flow. Clicking outside or pressing Escape closes.
 */
export default function MentionPicker({
  open,
  anchor,
  skills,
  tools,
  files,
  triggers,
  resources,
  onInsert,
  onClose,
  onOpenResourceLibrary,
}: MentionPickerProps) {
  const [tab, setTab] = useState<MentionTab>('skills')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape. Only attach listeners while open.
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !anchor) return null

  const items =
    tab === 'skills'
      ? skills
      : tab === 'tools'
        ? tools
        : tab === 'resources'
          ? resources
          : tab === 'files'
            ? files
            : triggers

  const width = Math.max(360, Math.min(anchor.width, 560))
  // Position above the composer (top - popover-height - 8). Using
  // bottom offset from viewport keeps the anchor stable during scroll.
  const style: React.CSSProperties = {
    position: 'fixed',
    left: anchor.left,
    bottom: window.innerHeight - anchor.top + 8,
    width,
    zIndex: 120,
  }

  return (
    <div
      ref={ref}
      style={style}
      className="flex max-h-[320px] flex-col overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] shadow-[0_12px_28px_-8px_rgba(16,18,24,0.22)]"
    >
      {/* Tabs */}
      <div className="flex shrink-0 items-center gap-4 border-b border-[var(--divider-soft)] px-3 pt-2">
        {TABS.map((t) => {
          const isActive = t.id === tab
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 pb-2 text-[13px] transition-colors ${
                isActive
                  ? 'font-semibold text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]/80'
              }`}
            >
              <Icon size={13} strokeWidth={1.8} />
              {t.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-t bg-[var(--color-ink)]" />
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto py-1">
        {items.length === 0 ? (
          <p className="px-4 py-4 text-center text-[12px] text-[var(--color-ink)]/45">
            {tab === 'triggers'
              ? '暂无可用触发条件'
              : tab === 'files'
                ? '当前项目暂无文件'
                : tab === 'resources'
                  ? '暂无可用资源平台'
                  : '暂无可用资源'}
          </p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => {
                // Prevent the outside-click handler from firing before
                // insert runs (mousedown fires before click).
                e.preventDefault()
                onInsert(item, tab)
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-[var(--fill-hover)]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
                <MentionIcon tab={tab} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--color-ink)]">
                {item.name}
              </span>
              {item.tag && (
                <span className="shrink-0 rounded-md border border-[var(--divider)] px-1.5 py-[1px] text-[10.5px] font-medium text-[var(--color-ink)]/70">
                  {item.tag}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {tab === 'resources' && onOpenResourceLibrary && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onOpenResourceLibrary()
            onClose()
          }}
          className="shrink-0 border-t border-[var(--divider-soft)] px-3 py-2 text-left text-[12px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          浏览全部资源 →
        </button>
      )}
    </div>
  )
}

function MentionIcon({ tab }: { tab: MentionTab }) {
  const common = { size: 11, strokeWidth: 1.8 }
  if (tab === 'skills') return <FolderCode {...common} />
  if (tab === 'tools') return <Wrench {...common} />
  if (tab === 'resources') return <Library {...common} />
  if (tab === 'files') return <FileCode2 {...common} />
  return <Zap {...common} />
}
