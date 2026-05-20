import { useRef } from 'react'
import { Pencil } from '@/shared/icons'

/**
 * 文档编辑器 — 单一编辑视图（已去掉分屏 / 预览模式）。
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
  const taRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--divider-soft)] px-4 py-2">
        <h1 className="min-w-0 truncate text-[13px] font-semibold text-[var(--color-ink)]">
          {title}
        </h1>
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-[var(--fill-subtle)] px-2 py-1 text-[11px] text-[var(--color-ink)]/55">
          <Pencil size={12} strokeWidth={1.8} />
          编辑
        </span>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="thin-scroll min-h-0 flex-1 resize-none border-0 bg-transparent px-6 py-6 font-mono text-[12.5px] leading-[1.75] text-[var(--color-ink)]/90 outline-none"
          />
        </div>
      </div>
    </div>
  )
}
