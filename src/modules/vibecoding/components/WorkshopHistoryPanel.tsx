import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  History,
  MessageSquareText,
  Palette,
  RotateCcw,
  X,
} from '@/shared/icons'

export interface WorkshopChatVersion {
  id: string
  title: string
  summary: string
  createdAt: number
  current?: boolean
}

export interface WorkshopCanvasVersion {
  id: string
  label: string
  createdAt: number
}

interface Props {
  projectName: string
  chatVersions: WorkshopChatVersion[]
  canvasVersions: WorkshopCanvasVersion[]
  currentCanvasVersion: { label: string; createdAt: number }
  onSelectChatVersion: (id: string) => void
  onRestoreCanvasVersion: (id: string) => void
  onClose: () => void
}

function formatTime(value: number) {
  const date = new Date(value)
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  return new Intl.DateTimeFormat('zh-CN', {
    month: sameDay ? undefined : 'short',
    day: sameDay ? undefined : 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export default function WorkshopHistoryPanel({
  projectName,
  chatVersions,
  canvasVersions,
  currentCanvasVersion,
  onSelectChatVersion,
  onRestoreCanvasVersion,
  onClose,
}: Props) {
  const [tab, setTab] = useState<'chat' | 'canvas'>('chat')
  const [autosavesOpen, setAutosavesOpen] = useState(true)
  const versions = [...canvasVersions].reverse()

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--color-surface-0)]" aria-label="历史记录">
      <header className="flex h-13 shrink-0 items-center border-b border-[var(--divider-soft)] px-4">
        <div className="flex min-w-0 items-center gap-2">
          <History size={15} strokeWidth={1.8} className="text-[var(--color-ink)]/62" />
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">历史记录</h2>
            <p className="truncate text-[10.5px] text-[var(--color-ink)]/38">{projectName}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="关闭历史记录"
          onClick={onClose}
          className="ml-auto flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </header>

      <div role="tablist" aria-label="历史记录类型" className="grid h-12 shrink-0 grid-cols-2 gap-1 border-b border-[var(--divider-soft)] px-3 py-1.5">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'chat'}
          onClick={() => setTab('chat')}
          className="flex items-center justify-center gap-1.5 rounded-lg text-[12px] font-medium text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] aria-selected:bg-[var(--color-ink)]/[0.07] aria-selected:text-[var(--color-ink)]"
        >
          <MessageSquareText size={13} strokeWidth={1.8} />
          对话版本
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'canvas'}
          onClick={() => setTab('canvas')}
          className="flex items-center justify-center gap-1.5 rounded-lg text-[12px] font-medium text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] aria-selected:bg-[var(--color-ink)]/[0.07] aria-selected:text-[var(--color-ink)]"
        >
          <Palette size={13} strokeWidth={1.8} />
          画布版本
        </button>
      </div>

      {tab === 'chat' ? (
        <div role="tabpanel" className="thin-scroll flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-[11px] leading-5 text-[var(--color-ink)]/42">
            每个对话保留独立的需求、生成结果和修改上下文，点击即可回到对应版本。
          </p>
          <ul className="space-y-2.5">
            {chatVersions.map((version, index) => (
              <li key={version.id}>
                <button
                  type="button"
                  onClick={() => onSelectChatVersion(version.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    version.current
                      ? 'border-[#2f6bff]/65 bg-[#2f6bff]/[0.035]'
                      : 'border-[var(--color-ink)]/8 hover:border-[var(--color-ink)]/18 hover:bg-[var(--fill-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} strokeWidth={1.8} className="shrink-0 text-[var(--color-ink)]/48" />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-[var(--color-ink)]/82">
                      {version.title || `修改 ${chatVersions.length - index}`}
                    </span>
                    {version.current && (
                      <span className="rounded-md bg-[var(--color-ink)]/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ink)]/68">
                        当前
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 pl-[22px] text-[11.5px] leading-5 text-[var(--color-ink)]/58">
                    {version.summary}
                  </p>
                  <time className="mt-1 block pl-[22px] text-[10.5px] text-[var(--color-ink)]/34">
                    {formatTime(version.createdAt)}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div role="tabpanel" className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
          <div className="relative pl-9">
            <span className="absolute bottom-0 left-[13px] top-3 w-px bg-[var(--color-ink)]/12" />
            <div className="relative pb-5">
              <span className="absolute -left-9 top-0 grid size-7 place-items-center rounded-full bg-[#168af8] text-white ring-4 ring-white">
                <span className="size-2 rounded-full border-2 border-white" />
              </span>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13px] font-semibold text-[#087cef]">当前版本</div>
                  <div className="mt-0.5 text-[11px] text-[var(--color-ink)]/45">{currentCanvasVersion.label}</div>
                </div>
                <time className="shrink-0 text-[10.5px] text-[var(--color-ink)]/34">
                  {formatTime(currentCanvasVersion.createdAt)}
                </time>
              </div>
            </div>

            <button
              type="button"
              aria-expanded={autosavesOpen}
              onClick={() => setAutosavesOpen((open) => !open)}
              className="relative mb-3 flex w-full items-center gap-2 rounded-lg py-1 text-left hover:bg-[var(--fill-hover)]"
            >
              <span className="absolute -left-9 grid size-7 place-items-center rounded-full bg-[var(--color-surface-1)] text-[var(--color-ink)]/60 ring-4 ring-white">
                {autosavesOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <span className="text-[12px] font-semibold text-[var(--color-ink)]/78">
                {versions.length} 个自动保存版本
              </span>
            </button>

            {autosavesOpen && (
              versions.length > 0 ? (
                <ul className="space-y-1.5 pb-5">
                  {versions.map((version) => (
                    <li key={version.id} className="relative">
                      <span className="absolute -left-[29px] top-[14px] size-2 rounded-full border-2 border-white bg-[var(--color-ink)]/24 ring-1 ring-[var(--color-ink)]/10" />
                      <button
                        type="button"
                        onClick={() => onRestoreCanvasVersion(version.id)}
                        className="group flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[var(--fill-hover)]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-medium text-[var(--color-ink)]/78">{version.label}</div>
                          <time className="mt-0.5 block text-[10.5px] text-[var(--color-ink)]/36">{formatTime(version.createdAt)} · 自动保存</time>
                        </div>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--color-ink)]/38 opacity-0 transition-opacity group-hover:bg-white group-hover:opacity-100">
                          <RotateCcw size={13} strokeWidth={1.8} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--color-ink)]/10 px-3 py-5 text-center text-[11px] leading-5 text-[var(--color-ink)]/38">
                  画布发生修改后，会像 Figma 一样按连续操作自动归并保存。
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  )
}
