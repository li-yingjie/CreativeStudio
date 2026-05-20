import { useEffect, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { ArrowLeft, Play, Pause, Scissors, Trash2, Save } from '@/shared/icons'
import type { AssetItem } from './GarudaAssetsView'

/**
 * 简易视频编辑器 — 从游戏「素材 · 视频」里选中一个视频后点「编辑」进入。
 * 上方是预览播放器，底部是一条剪辑轨道：支持拖动裁剪片段首尾、在播放头
 * 处拆分、删除片段，以及在轨道上拖动播放头定位。纯前端演示，不真正导出。
 */

type Clip = { id: string; in: number; out: number }

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  const cs = Math.floor((t * 100) % 100)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

export default function VideoEditor({
  item,
  onClose,
}: {
  item: AssetItem
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const [duration, setDuration] = useState(0)
  const [clips, setClips] = useState<Clip[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // Re-init when a different video is opened.
  useEffect(() => {
    setDuration(0)
    setClips([])
    setSelectedId(null)
    setPlaying(false)
    setCurrentTime(0)
  }, [item])

  const onLoadedMetadata = () => {
    const d = videoRef.current?.duration ?? 0
    setDuration(d)
    const id = nanoid(6)
    setClips([{ id, in: 0, out: d }])
    setSelectedId(id)
    setCurrentTime(0)
  }

  /** Ordered kept segments. */
  const ordered = [...clips].sort((a, b) => a.in - b.in)

  const clipAt = (t: number): Clip | undefined =>
    ordered.find((c) => t >= c.in - 1e-3 && t < c.out - 1e-3)

  const seek = (t: number) => {
    const clamped = Math.max(0, Math.min(duration, t))
    if (videoRef.current) videoRef.current.currentTime = clamped
    setCurrentTime(clamped)
  }

  // Playback loop — keeps the playhead in sync and enforces clip boundaries
  // so trimmed-out regions are skipped during preview.
  useEffect(() => {
    if (!playing) return
    const step = () => {
      const v = videoRef.current
      if (v) {
        const t = v.currentTime
        const cur = clipAt(t)
        if (!cur) {
          // In a trimmed gap → jump to the next segment, or stop at the end.
          const next = ordered.find((c) => c.in > t - 1e-3)
          if (next) {
            v.currentTime = next.in
          } else {
            v.pause()
            setPlaying(false)
            return
          }
        } else if (t >= cur.out - 1e-3) {
          const next = ordered.find((c) => c.in >= cur.out - 1e-3)
          if (next) {
            v.currentTime = next.in
          } else {
            v.pause()
            setPlaying(false)
            const last = ordered[ordered.length - 1]
            setCurrentTime(last ? last.out : t)
            return
          }
        }
        setCurrentTime(v.currentTime)
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, clips, duration])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v || duration === 0) return
    if (playing) {
      v.pause()
      setPlaying(false)
      return
    }
    // Snap into a kept segment before playing.
    if (!clipAt(v.currentTime)) {
      const first = ordered[0]
      if (first) v.currentTime = first.in
    }
    void v.play()
    setPlaying(true)
  }

  const splitAtPlayhead = () => {
    const t = currentTime
    const target = clipAt(t)
    if (!target || t <= target.in + 0.05 || t >= target.out - 0.05) return
    const a: Clip = { id: nanoid(6), in: target.in, out: t }
    const b: Clip = { id: nanoid(6), in: t, out: target.out }
    setClips((prev) => prev.flatMap((c) => (c.id === target.id ? [a, b] : [c])))
    setSelectedId(b.id)
  }

  const deleteSelected = () => {
    if (!selectedId || clips.length <= 1) return
    setClips((prev) => prev.filter((c) => c.id !== selectedId))
    setSelectedId(null)
  }

  /** Map a pointer X within the track to a source time. */
  const xToTime = (clientX: number): number => {
    const el = trackRef.current
    if (!el || duration === 0) return 0
    const r = el.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    return ratio * duration
  }

  const onTrackPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).dataset.handle) return
    seek(xToTime(e.clientX))
  }

  // Drag a clip's in/out handle.
  const dragRef = useRef<{ id: string; edge: 'in' | 'out' } | null>(null)
  const onHandleDown = (id: string, edge: 'in' | 'out') => (e: React.PointerEvent) => {
    e.stopPropagation()
    dragRef.current = { id, edge }
    setSelectedId(id)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onHandleMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const t = xToTime(e.clientX)
    setClips((prev) =>
      prev.map((c) => {
        if (c.id !== d.id) return c
        if (d.edge === 'in') return { ...c, in: Math.max(0, Math.min(t, c.out - 0.1)) }
        return { ...c, out: Math.min(duration, Math.max(t, c.in + 0.1)) }
      }),
    )
  }
  const onHandleUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      const d = dragRef.current
      dragRef.current = null
      ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
      // Re-seek the playhead onto the trimmed clip edge for immediate feedback.
      const c = clips.find((x) => x.id === d.id)
      if (c) seek(d.edge === 'in' ? c.in : c.out)
    }
  }

  const pct = (t: number) => (duration > 0 ? (t / duration) * 100 : 0)
  const totalKept = ordered.reduce((s, c) => s + (c.out - c.in), 0)
  const TICKS = 8

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3">
        <button
          type="button"
          onClick={onClose}
          title="返回素材"
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[12.5px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={14} strokeWidth={1.8} />
          返回
        </button>
        <span className="ml-1 text-[12.5px] font-semibold text-[var(--color-ink)]">视频编辑</span>
        <span className="min-w-0 truncate font-mono text-[11px] text-[var(--color-ink)]/40">{item.label}</span>
        <button
          type="button"
          title="导出（演示）"
          className="ml-auto flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
        >
          <Save size={11} strokeWidth={2} />
          导出
        </button>
      </div>

      {/* Preview */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={item.src}
          muted
          playsInline
          onLoadedMetadata={onLoadedMetadata}
          onClick={togglePlay}
          className="max-h-full max-w-full"
        />
        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform hover:scale-105"
            title="播放"
          >
            <Play size={22} strokeWidth={2} className="ml-0.5 fill-current" />
          </button>
        )}
      </div>

      {/* Transport */}
      <div className="flex shrink-0 items-center gap-2 border-t border-[var(--divider-soft)] px-3 py-2">
        <button
          type="button"
          onClick={togglePlay}
          title={playing ? '暂停' : '播放'}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          {playing ? <Pause size={15} strokeWidth={2} /> : <Play size={15} strokeWidth={2} className="fill-current" />}
        </button>
        <span className="font-mono text-[11.5px] tabular-nums text-[var(--color-ink)]/70">
          {fmt(currentTime)} <span className="text-[var(--color-ink)]/30">/ {fmt(duration)}</span>
        </span>
        <div className="mx-1 h-4 w-px bg-[var(--divider)]" />
        <button
          type="button"
          onClick={splitAtPlayhead}
          title="在播放头处拆分"
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <Scissors size={13} strokeWidth={1.8} />
          拆分
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={!selectedId || clips.length <= 1}
          title="删除选中片段"
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Trash2 size={13} strokeWidth={1.8} />
          删除
        </button>
        <span className="ml-auto font-mono text-[11px] text-[var(--color-ink)]/40">
          {clips.length} 个片段 · 保留 {fmt(totalKept)}
        </span>
      </div>

      {/* Timeline */}
      <div className="shrink-0 border-t border-[var(--divider-soft)] bg-[var(--color-surface-1)] px-3 pb-4 pt-2">
        {/* Ruler */}
        <div className="relative mb-1 h-4 select-none">
          {Array.from({ length: TICKS + 1 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 -translate-x-1/2 font-mono text-[9px] text-[var(--color-ink)]/35"
              style={{ left: `${(i / TICKS) * 100}%` }}
            >
              {fmt((duration * i) / TICKS).slice(0, 5)}
            </span>
          ))}
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          className="relative h-16 w-full cursor-text overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-0)]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--divider-soft) 0 1px, transparent 1px 12.5%)',
          }}
        >
          {duration === 0 ? (
            <div className="flex h-full items-center justify-center text-[11px] text-[var(--color-ink)]/35">
              正在载入视频…
            </div>
          ) : (
            <>
              {ordered.map((c) => {
                const active = c.id === selectedId
                return (
                  <div
                    key={c.id}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      setSelectedId(c.id)
                    }}
                    className={`group absolute inset-y-1.5 overflow-hidden rounded-md border text-left transition-colors ${
                      active
                        ? 'border-[#3478ff] bg-[#3478ff]/15'
                        : 'border-[var(--color-ink)]/15 bg-[var(--color-ink)]/[0.06] hover:bg-[var(--color-ink)]/[0.1]'
                    }`}
                    style={{ left: `${pct(c.in)}%`, width: `${pct(c.out - c.in)}%` }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-60"
                      style={{
                        background:
                          'repeating-linear-gradient(135deg, rgba(120,140,180,0.18) 0 6px, transparent 6px 12px)',
                      }}
                    />
                    <span className="pointer-events-none absolute left-2 top-1 font-mono text-[10px] text-[var(--color-ink)]/70">
                      {fmt(c.out - c.in).slice(0, 5)}
                    </span>
                    {/* trim handles */}
                    <span
                      data-handle="in"
                      onPointerDown={onHandleDown(c.id, 'in')}
                      className="absolute inset-y-0 left-0 w-2 cursor-ew-resize bg-[#3478ff]/0 group-hover:bg-[#3478ff]/40"
                    />
                    <span
                      data-handle="out"
                      onPointerDown={onHandleDown(c.id, 'out')}
                      className="absolute inset-y-0 right-0 w-2 cursor-ew-resize bg-[#3478ff]/0 group-hover:bg-[#3478ff]/40"
                    />
                  </div>
                )
              })}
              {/* playhead */}
              <div
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#ff4d4f]"
                style={{ left: `${pct(currentTime)}%` }}
              >
                <span className="absolute -top-0.5 -left-[3px] h-1.5 w-1.5 rounded-full bg-[#ff4d4f]" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
