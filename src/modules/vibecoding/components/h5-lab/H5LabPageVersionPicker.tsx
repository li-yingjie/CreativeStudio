import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from '@/shared/icons'

export interface H5LabPageFrameOption {
  id: string
  label: string
  generated?: boolean
}

export interface H5LabPageVersionOption {
  value: 'before' | 'current'
  number: number
  label: string
  detail: string
}

interface Props {
  pageName: string
  frames: H5LabPageFrameOption[]
  activeFrameId?: string
  versions?: H5LabPageVersionOption[]
  activeVersion: 'before' | 'current'
  onFrameChange: (frameId: string) => void
  onVersionChange: (version: 'before' | 'current') => void
}

export default function H5LabPageVersionPicker({
  pageName,
  frames,
  activeFrameId,
  versions = [],
  activeVersion,
  onFrameChange,
  onVersionChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const visibleVersions = [...versions]
    .sort((left, right) => left.number - right.number)
    .slice(-2)
  const activeFrame = frames.find((frame) => frame.id === activeFrameId)
  const activeVersionOption = visibleVersions.find(
    (version) => version.value === activeVersion,
  )

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="选择页面、状态帧和版本"
        aria-haspopup="menu"
        aria-expanded={open}
        title={[
          pageName,
          activeFrame?.label,
          activeVersionOption
            ? `V${activeVersionOption.number} ${activeVersionOption.label}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-7 max-w-[168px] cursor-pointer items-center gap-1 rounded-lg bg-[#f5f7fa] px-2.5 text-left text-[12px] font-semibold leading-4 text-[#1c1f23] transition-colors hover:bg-[#eef1f5]"
      >
        <span className="min-w-0 max-w-[132px] truncate">{pageName}</span>
        <ChevronDown
          aria-hidden
          className={`size-3.5 shrink-0 text-[#1c1f23]/45 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="页面、状态帧和版本"
          className="absolute left-0 top-full z-50 mt-1 w-[240px] overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] py-1 shadow-[0_12px_28px_-8px_rgba(16,18,24,0.2)]"
        >
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-medium text-[var(--color-ink)]/40">
            状态帧
          </p>
          <div
            role="group"
            aria-label="状态帧"
            className="max-h-[min(320px,calc(100vh-220px))] overflow-y-auto"
          >
            {frames.map((frame) => {
              const selected = frame.id === activeFrameId
              return (
                <button
                  key={frame.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    onFrameChange(frame.id)
                    setOpen(false)
                  }}
                  className={`flex w-full cursor-pointer items-center gap-1.5 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-[var(--fill-subtle)] ${
                    selected
                      ? 'font-medium text-[var(--color-ink)]'
                      : 'text-[var(--color-ink)]/70'
                  }`}
                >
                  {frame.generated && (
                    <span className="shrink-0 rounded-sm bg-[#2f6bff]/12 px-1 text-[10px] leading-[15px] text-[#2f6bff]">
                      新增
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{frame.label}</span>
                  {selected && (
                    <Check
                      size={12}
                      className="ml-auto shrink-0 text-[#357ef8]"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {visibleVersions.length > 0 && (
            <>
              <div className="mx-3 my-1 h-px bg-[var(--divider)]" />
              <p className="px-3 pb-1 pt-1 text-[10px] font-medium text-[var(--color-ink)]/40">
                版本
              </p>
              {visibleVersions.map((version) => {
                const selected = version.value === activeVersion
                return (
                  <button
                    key={version.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => {
                      onVersionChange(version.value)
                      setOpen(false)
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-[var(--fill-subtle)] ${
                      selected
                        ? 'text-[var(--color-ink)]'
                        : 'text-[var(--color-ink)]/70'
                    }`}
                  >
                    <span className="w-7 shrink-0 text-[11px] font-semibold">
                      {version.number > 0 ? `V${version.number}` : '初始'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-medium">
                        {version.label}
                      </span>
                      <span className="block truncate text-[10px] text-[var(--color-ink)]/40">
                        {version.detail}
                      </span>
                    </span>
                    {selected && (
                      <Check
                        size={12}
                        className="ml-auto shrink-0 text-[#357ef8]"
                      />
                    )}
                  </button>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
