import { useState } from 'react'
import { ArrowLeft, Check, Minus, Plus, Settings } from '@/shared/icons'
import GarudaEditPanel from './GarudaEditPanel'
import GarudaGamePreview from './GarudaGamePreview'

const CANVAS_WIDTH = 360
const CANVAS_HEIGHT = 640
const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.3
const DEFAULT_ZOOM = 0.85

interface GameCanvasEditorProps {
  projectName: string
  screen?: string | null
  leftInset?: number
  onClose: () => void
}

export default function GameCanvasEditor({
  projectName,
  screen,
  leftInset = 0,
  onClose,
}: GameCanvasEditorProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const updateZoom = (next: number) =>
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2)))))

  return (
    <section
      aria-label="游戏画布编辑器"
      data-game-canvas-mode="editor"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]"
    >
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          返回预览
        </button>
        <div className="h-4 w-px bg-[var(--divider)]" />
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold text-[var(--color-ink)]">画布编辑</h2>
          <p className="truncate text-[10.5px] text-[var(--color-ink)]/45">{projectName}</p>
        </div>
        <span className="ml-1 rounded-md bg-[var(--fill-subtle)] px-2 py-1 text-[10.5px] tabular-nums text-[var(--color-ink)]/55">
          {CANVAS_WIDTH} × {CANVAS_HEIGHT}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            aria-label="缩小画布"
            title="缩小画布"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => updateZoom(zoom - 0.1)}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <Minus size={13} strokeWidth={1.8} />
          </button>
          <span className="min-w-10 text-center text-[11px] tabular-nums text-[var(--color-ink)]/65">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="放大画布"
            title="放大画布"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => updateZoom(zoom + 0.1)}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <Plus size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(DEFAULT_ZOOM)}
            className="ml-1 flex h-7 items-center rounded-md px-2 text-[11px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)]"
          >
            适应画布
          </button>
          {!propertiesOpen && (
            <button
              type="button"
              onClick={() => setPropertiesOpen(true)}
              className="ml-1 flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)]"
            >
              <Settings size={12} strokeWidth={1.8} />
              属性
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-1 flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
          >
            <Check size={12} strokeWidth={2} />
            完成
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden" style={{ marginLeft: leftInset }}>
        <main
          aria-label="游戏可编辑画布"
          className="thin-scroll min-w-0 flex-1 overflow-auto bg-[var(--color-surface-1)] px-4 py-8"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-ink-10) 1px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        >
          <div
            className="relative mx-auto"
            style={{ width: CANVAS_WIDTH * zoom, height: CANVAS_HEIGHT * zoom }}
          >
            <div
              className="overflow-hidden border border-[var(--divider)] bg-black shadow-xl"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              <GarudaGamePreview screen={screen} />
            </div>
          </div>
          <div className="pointer-events-none sticky bottom-2 mx-auto mt-6 w-fit rounded-md border border-[var(--divider-soft)] bg-[var(--color-surface-0)]/95 px-3 py-1.5 text-[10.5px] text-[var(--color-ink)]/50 shadow-sm">
            游戏预览画布 · 右侧属性实时调整游戏配置
          </div>
        </main>

        {propertiesOpen && (
          <aside aria-label="游戏画布属性" className="w-80 shrink-0 border-l border-[var(--divider-soft)]">
            <GarudaEditPanel onClose={() => setPropertiesOpen(false)} />
          </aside>
        )}
      </div>
    </section>
  )
}
