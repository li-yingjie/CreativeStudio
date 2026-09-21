import { useRef } from 'react'
import { Download, Trash2, Upload } from '@/shared/icons'
import type { GameUiSlice } from './GameUiSlices'

export interface UiMaterialGroup {
  key: string
  title: string
  items: GameUiSlice[]
}

interface Props {
  groups: UiMaterialGroup[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  onDownload?: (item: GameUiSlice) => void
  onDelete?: (id: string) => void
  onAssign?: (id: string) => void
  onUpload?: (groupKey: string, file: File) => void
  compact?: boolean
}

export function TowerDefenseUiMaterialShelf({
  groups,
  selectedId,
  onSelect,
  onDownload,
  onDelete,
  onAssign,
  onUpload,
  compact = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadKey = useRef<string>('')

  if (!groups.length) {
    return (
      <p className="px-1 py-2 text-[11px] leading-[1.6] text-[var(--color-ink)]/40">
        拆分后点「存入素材库」，会把图层填进对应槽位。
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="mb-1.5 flex items-center gap-1.5">
            <h4 className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-[var(--color-ink)]/75">
              {group.title}
            </h4>
            <span className="shrink-0 text-[10px] text-[var(--color-ink)]/35">
              {group.items.length}
            </span>
            {onUpload ? (
              <button
                type="button"
                title="上传到这一组"
                onClick={() => {
                  uploadKey.current = group.key
                  fileRef.current?.click()
                }}
                className="grid size-6 place-items-center rounded text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)]"
              >
                <Upload size={11} />
              </button>
            ) : null}
          </div>
          <div
            className={`grid ${compact ? 'grid-cols-3 gap-1.5' : 'grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2'}`}
          >
            {group.items.map((item) => {
              const active = selectedId === item.id
              return (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-md border ${
                    active ? 'border-[#2f6bff]/50 bg-[#2f6bff]/8' : 'border-[var(--color-ink)]/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect?.(item.id)
                      onAssign?.(item.id)
                    }}
                    className="block w-full"
                  >
                    <span
                      className={`block bg-[var(--color-ink)]/[0.04] ${compact ? 'h-14' : 'h-20'}`}
                    >
                      <img src={item.src} alt="" className="size-full object-contain" />
                    </span>
                    <span className="block truncate px-1.5 py-1 text-left text-[10.5px] text-[var(--color-ink)]/70">
                      {item.name}
                    </span>
                  </button>
                  <div className="flex items-center justify-end gap-0.5 px-1 pb-1">
                    {onDownload ? (
                      <button
                        type="button"
                        title="下载"
                        onClick={() => onDownload(item)}
                        className="grid size-5 place-items-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)]"
                      >
                        <Download size={10} />
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        title="删除"
                        onClick={() => onDelete(item.id)}
                        className="grid size-5 place-items-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)]"
                      >
                        <Trash2 size={10} />
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
      {onUpload ? (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file && uploadKey.current) onUpload(uploadKey.current, file)
          }}
        />
      ) : null}
    </div>
  )
}

export default TowerDefenseUiMaterialShelf
