import { useRef, useState } from 'react'
import { Eye, Pencil, Columns2 } from '@/shared/icons'
import MarkdownView from './MarkdownView'

type Mode = 'edit' | 'preview' | 'split'

/**
 * 文档编辑器 — markdown source on the left, live preview on the right.
 * Toggle modes via the toolbar: 编辑 / 预览 / 分屏.
 */
export default function MarketingDocEditor({
  title = '项目文档',
  value,
  onChange,
}: {
  title?: string
  value: string
  onChange: (next: string) => void
}) {
  const [mode, setMode] = useState<Mode>('preview')
  const taRef = useRef<HTMLTextAreaElement>(null)

  const showEdit = mode === 'edit' || mode === 'split'
  const showPreview = mode === 'preview' || mode === 'split'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--divider-soft)] px-4 py-2">
        <h1 className="min-w-0 truncate text-[13px] font-semibold text-[var(--color-ink)]">
          {title}
        </h1>
        <div className="flex shrink-0 items-center gap-0.5 rounded-md bg-[var(--fill-subtle)] p-0.5">
          <ModeButton active={mode === 'edit'} onClick={() => setMode('edit')} icon={Pencil} label="编辑" />
          <ModeButton active={mode === 'split'} onClick={() => setMode('split')} icon={Columns2} label="分屏" />
          <ModeButton active={mode === 'preview'} onClick={() => setMode('preview')} icon={Eye} label="预览" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {showEdit && (
          <div
            className={`flex min-h-0 min-w-0 flex-col overflow-hidden ${
              showPreview ? 'flex-1 border-r border-[var(--divider-soft)]' : 'flex-1'
            }`}
          >
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              className="thin-scroll min-h-0 flex-1 resize-none border-0 bg-transparent px-6 py-6 font-mono text-[12.5px] leading-[1.75] text-[var(--color-ink)]/90 outline-none"
            />
          </div>
        )}
        {showPreview && (
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[760px] flex-col px-8 py-6">
              <MarkdownView source={value} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Eye
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-6 items-center gap-1 rounded px-1.5 text-[11px] transition-colors ${
        active
          ? 'bg-[var(--color-surface-0)] text-[var(--color-ink)] shadow-sm'
          : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]/85'
      }`}
      title={label}
    >
      <Icon size={12} strokeWidth={1.8} />
      {label}
    </button>
  )
}
