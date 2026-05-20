import { useEffect, useState } from 'react'
import { X, Upload, RotateCcw, Save, Music2, Film } from '@/shared/icons'
import type { AssetItem } from './GarudaAssetsView'

/**
 * 素材对象编辑面板 — 针对「某一个具体素材」的可视化编辑（区别于整个游戏
 * 的 GarudaEditPanel）。从游戏素材画布里点「编辑」打开，绑定当前画布上
 * 的那个素材对象：改名 / 替换文件 / 序列帧帧率与循环 等。纯本地演示。
 */
export default function AssetEditPanel({
  item,
  onClose,
}: {
  item: AssetItem
  onClose: () => void
}) {
  const kind = item.kind ?? 'image'
  const isSequence = kind === 'image' && !!item.frames
  const [name, setName] = useState(item.label)
  const [fps, setFps] = useState(15)
  const [loop, setLoop] = useState(true)

  // Re-bind whenever the opened asset changes (panel stays mounted while
  // the user clicks through different assets).
  useEffect(() => {
    setName(item.label)
    setFps(15)
    setLoop(true)
  }, [item])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">编辑</span>
        <span className="min-w-0 truncate font-mono text-[11px] text-[var(--color-ink)]/40">
          {item.label}
        </span>
        <button
          type="button"
          onClick={onClose}
          title="关闭"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Body */}
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-5">
          {/* 当前素材预览 */}
          <section>
            <Label>当前素材</Label>
            <div
              className="flex items-center justify-center overflow-hidden rounded-xl p-4"
              style={{
                backgroundColor: '#ffffff',
                backgroundImage:
                  'linear-gradient(45deg,#eceef2 25%,transparent 25%),linear-gradient(-45deg,#eceef2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceef2 75%),linear-gradient(-45deg,transparent 75%,#eceef2 75%)',
                backgroundSize: '18px 18px',
                backgroundPosition: '0 0,0 9px,9px -9px,-9px 0',
              }}
            >
              {kind === 'audio' ? (
                <div className="flex flex-col items-center gap-1 py-4 text-[var(--color-ink)]/55">
                  <Music2 size={26} strokeWidth={1.4} />
                  <span className="font-mono text-[11px]">{item.label}</span>
                </div>
              ) : kind === 'video' ? (
                <video src={item.src} muted loop autoPlay playsInline className="max-h-28 rounded" />
              ) : (
                <img src={item.src} alt={item.label} className="max-h-28 object-contain" />
              )}
            </div>
          </section>

          {/* 名称 */}
          <section>
            <Label>名称</Label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
            />
          </section>

          {/* 替换文件 */}
          <section>
            <Label>替换素材</Label>
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--divider)] py-5 text-[var(--color-ink)]/50 transition-colors hover:border-[var(--color-ink)]/30 hover:text-[var(--color-ink)]/75"
            >
              <Upload size={16} strokeWidth={1.7} />
              <span className="text-[12px]">点击上传 / 拖拽替换</span>
              <span className="text-[10.5px] text-[var(--color-ink)]/35">
                {kind === 'audio' ? '支持 mp3 / wav' : kind === 'video' ? '支持 mp4 / webm' : '支持 png / webp / 序列帧'}
              </span>
            </button>
          </section>

          {/* 序列帧设置 */}
          {isSequence && (
            <section className="space-y-3.5">
              <Label icon={<Film size={12} strokeWidth={1.8} />}>序列帧</Label>
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[12px] text-[var(--color-ink)]/80">帧率</span>
                  <span className="font-mono text-[11px] text-[var(--color-ink)]/55">{fps} fps</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={30}
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="block h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--fill-subtle)] accent-[var(--color-ink)]"
                />
              </div>
              <button
                type="button"
                onClick={() => setLoop((v) => !v)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] text-[var(--color-ink)]/85">循环播放</div>
                  <div className="text-[10.5px] text-[var(--color-ink)]/45">共 {item.frames} 帧</div>
                </div>
                <span
                  className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
                    loop ? 'bg-[#3478ff]' : 'bg-[var(--color-ink)]/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
                      loop ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
            </section>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">编辑当前素材对象</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--divider)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <RotateCcw size={11} strokeWidth={1.8} />
            重置
          </button>
          <button
            type="button"
            className="flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
          >
            <Save size={11} strokeWidth={2} />
            应用
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink)]/65">
      {icon}
      {children}
    </div>
  )
}
