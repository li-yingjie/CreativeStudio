import { useRef } from 'react'
import { toast } from 'sonner'
import { Plus } from '@/shared/icons'

export default function ComposerLocalFileButton({
  className = 'flex size-6 shrink-0 items-center justify-center rounded-full text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]',
  iconSize = 14,
  onFilesSelected,
}: {
  className?: string
  iconSize?: number
  onFilesSelected?: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        title="上传本地文件"
        aria-label="上传本地文件"
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        <Plus size={iconSize} strokeWidth={2} className="shrink-0" />
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? [])
          if (files.length === 0) return
          onFilesSelected?.(files)
          toast.success(
            files.length === 1
              ? `已添加 ${files[0].name}`
              : `已添加 ${files.length} 个本地文件`,
          )
          event.currentTarget.value = ''
        }}
      />
    </>
  )
}
