import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, Minus, Plus } from '@/shared/icons'
import XiahuaH5Preview, { activityScreens, type XiahuaScreen } from './XiahuaH5Preview'
import { XIAHUA_PRESET, type ActivityPreset } from './ActivityPreset'
import type { XiahuaOverrides, XiahuaSel } from './XiahuaEditPanel'
import type { XiahuaGameplay } from './XiahuaGameplay'
import type { BuildStage } from './XiahuaBuildScript'

/* ─── 编辑态画布 ───
 * 5 个关键页面平铺成画板：点哪个画板它就成为当前画板（蓝框 + 编辑中），
 * 里面的元素可点选 / 拖拽 / 缩放；同一时刻只有一个画板在编辑态。
 * 底色与点阵直接沿用外层预览画布 —— 进出编辑态是同一个画布，不换背景。
 * 画布本身支持常见操作：滚轮平移、⌘/Ctrl+滚轮以光标为锚点缩放、空格 /
 * 中键拖拽平移、适应屏幕、双击空白复位、Esc 取消选择。
 * 元素拖拽的换算从渲染尺寸反推比例，因此在任意缩放下都准确。 */

const W = 375
const H = 812
const GAP = 28
const PAD = 20
const SCREEN_N = 5
/** 画板上方那行标题占的高度。 */
const BOARD_TITLE_H = 34
const CONTENT_W = SCREEN_N * W + (SCREEN_N - 1) * GAP + PAD * 2
const CONTENT_H = H + BOARD_TITLE_H + PAD * 2
/** 与预览里 PhoneMockup 的 maxScale 保持一致，进编辑态手机不会突然变大。 */
const PREVIEW_MAX_Z = 1.4

const MIN_Z = 0.15
const MAX_Z = 3
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

interface View {
  z: number
  x: number
  y: number
}


/* 画板行单独 memo —— 平移/缩放只改外层 transform，不重渲 5 个预览。 */
const Boards = memo(function Boards({
  screens,
  active,
  setActive,
  spaceHeld,
  selected,
  onSelect,
  hoveredId,
  onOffsetsCommit,
  overrides,
  gameplay,
  previewKey,
  build,
  ps,
  wireframe,
  picks,
}: {
  screens: { id: string; label: string; desc: string }[]
  active: XiahuaScreen
  setActive: (s: XiahuaScreen) => void
  spaceHeld: boolean
  selected: XiahuaSel | null
  onSelect: (sel: XiahuaSel | null) => void
  hoveredId: string | null
  onOffsetsCommit: (offsets: Record<string, { x: number; y: number }>) => void
  overrides: XiahuaOverrides
  gameplay: XiahuaGameplay
  previewKey: number
  build?: BuildStage
  ps: ActivityPreset
  wireframe: boolean
  picks?: Record<string, number>
}) {
  return (
        <div className="flex items-start" style={{ gap: GAP, padding: PAD }}>
          {screens.map((sc) => {
            const editable = sc.id === active
            return (
              <div key={sc.id} className="shrink-0" style={{ width: W }}>
                <button
                  type="button"
                  onClick={() => setActive(sc.id as XiahuaScreen)}
                  className="mb-2 flex w-full cursor-pointer items-baseline gap-2 text-left"
                >
                  <span
                    className={`text-[13px] font-semibold ${
                      editable ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/55'
                    }`}
                  >
                    {sc.label}
                  </span>
                  <span className="text-[11px] text-[var(--color-ink)]/40">{sc.desc}</span>
                  {editable && (
                    <span className="rounded-full bg-[#d4ebff] px-1.5 py-[1px] text-[10px] font-semibold text-[#357ef8]">
                      编辑中
                    </span>
                  )}
                </button>
                <div
                  className={`overflow-hidden rounded-[18px] bg-black transition-shadow ${
                    editable
                      ? 'ring-2 ring-[#357ef8] ring-offset-2 ring-offset-[var(--color-surface-0)]'
                      : 'ring-1 ring-black/10 hover:ring-[#357ef8]/40'
                  }`}
                  style={{ width: W, height: H }}
                  // 画板内部点击不冒泡到空白，避免误取消选择；
                  // 点非当前画板先把它切成当前画板（画布编辑器的常规行为）。
                  onPointerDown={(e) => {
                    if (spaceHeld) return
                    e.stopPropagation()
                    if (!editable) {
                      onSelect(null)
                      setActive(sc.id as XiahuaScreen)
                    }
                  }}
                >
                  <XiahuaH5Preview
                    key={`${previewKey}-${sc.id}`}
                    screen={sc.id as XiahuaScreen}
                    readOnly={!editable || spaceHeld}
                    editing={editable}
                    selected={editable ? selected : null}
                    onSelect={editable ? onSelect : undefined}
                    hoveredId={editable ? hoveredId : null}
                    onOffsetsCommit={editable ? onOffsetsCommit : undefined}
                    overrides={overrides}
                    gameplay={gameplay}
                    build={build}
                    preset={ps}
                    wireframe={wireframe}
                    picks={picks}
                  />
                </div>
              </div>
            )
          })}
        </div>
  )
})

export default function XiahuaEditCanvas({
  selected,
  onSelect,
  hoveredId,
  onOffsetsCommit,
  overrides,
  gameplay,
  previewKey,
  build,
  preset,
  wireframe = false,
  picks,
  activeScreen,
  onActiveScreen,
}: {
  selected: XiahuaSel | null
  onSelect: (sel: XiahuaSel | null) => void
  hoveredId: string | null
  onOffsetsCommit: (offsets: Record<string, { x: number; y: number }>) => void
  overrides: XiahuaOverrides
  gameplay: XiahuaGameplay
  previewKey: number
  /** 0→1 回放时的搭建阶段。 */
  build?: BuildStage
  /** 活动模板。 */
  preset?: ActivityPreset
  /** 交互框架态：素材位显示占位框。 */
  wireframe?: boolean
  /** 素材版本选择。 */
  picks?: Record<string, number>
  /** 外部页面选择器同步当前画板。 */
  activeScreen?: XiahuaScreen
  /** 当前画板变化时上报 —— 右侧图层清单要跟着换。 */
  onActiveScreen?: (s: XiahuaScreen) => void
}) {
  const ps = preset ?? XIAHUA_PRESET
  // 每次渲染都新建数组会让下面的 Boards memo 失效，平移时又会重渲 5 个预览
  const screens = useMemo(() => activityScreens(ps), [ps])
  const wrapRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>({ z: 0.5, x: 0, y: 0 })
  /** 当前正在编辑的画板 —— 点哪个画板就切到哪个，同一时刻只有一个。 */
  const [active, setActiveState] = useState<XiahuaScreen>('main')
  const setActive = useCallback(
    (s: XiahuaScreen) => {
      setActiveState(s)
      onActiveScreen?.(s)
    },
    [onActiveScreen],
  )
  const displayedActive = activeScreen ?? active
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [panning, setPanning] = useState(false)
  const panRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)

  /** 适应屏幕：5 个画板整体撑满视窗（取两轴较小的比例，居中）。 */
  const fit = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const z = clamp(Math.min(width / CONTENT_W, height / CONTENT_H), MIN_Z, MAX_Z)
    setView({ z, x: (width - CONTENT_W * z) / 2, y: (height - CONTENT_H * z) / 2 })
  }, [])

  /** 对准某个画板：单屏铺满视窗并居中 —— 用的是和预览同一套「一台手机塞进
   *  这块区域」的算法，所以进出编辑态手机的大小不变，只是周围多了别的画板。 */
  const focusScreen = useCallback(
    (id: XiahuaScreen) => {
      const el = wrapRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      const boardH = H + BOARD_TITLE_H
      const z = clamp(
        Math.min(width / (W + PAD * 2), height / (boardH + PAD * 2), PREVIEW_MAX_Z),
        MIN_Z,
        MAX_Z,
      )
      const i = Math.max(0, screens.findIndex((s) => s.id === id))
      const cx = PAD + i * (W + GAP) + W / 2
      const cy = PAD + boardH / 2
      setView({ z, x: width / 2 - cx * z, y: height / 2 - cy * z })
    },
    [screens],
  )

  // 首次进入对准刚才在预览的那一屏，不是缩到 5 个画板的全景
  const enterScreenRef = useRef(activeScreen ?? active)
  useEffect(() => {
    const t = window.setTimeout(() => focusScreen(enterScreenRef.current), 0)
    return () => window.clearTimeout(t)
  }, [focusScreen])

  /** 以某点为锚点缩放（保持该点在画布上的相对位置不动）。 */
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const nz = clamp(v.z * factor, MIN_Z, MAX_Z)
      if (nz === v.z) return v
      const k = nz / v.z
      return { z: nz, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
    })
  }, [])

  /** 从控件缩放时以视口中心为锚点。 */
  const zoomFromCenter = useCallback(
    (factor: number) => {
      const el = wrapRef.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      zoomAt(factor, width / 2, height / 2)
    },
    [zoomAt],
  )

  // 滚轮：⌘/Ctrl 缩放（光标锚点），否则双向平移（触控板两指）
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY / 240), e.clientX - rect.left, e.clientY - rect.top)
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // 空格暂时切到抓手；Esc 取消选择
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSelect(null)
      if (e.code === 'Space' && !e.repeat) {
        const t = e.target as HTMLElement | null
        if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return
        e.preventDefault()
        setSpaceHeld(true)
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [onSelect])

  const grabbing = spaceHeld || panning

  return (
    <div
      ref={wrapRef}
      className={`relative min-h-0 flex-1 overflow-hidden ${
        grabbing ? (panning ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      onPointerDown={(e) => {
        // 空格 / 中键 → 平移；点空白 → 取消选择
        if (spaceHeld || e.button === 1) {
          e.preventDefault()
          panRef.current = { px: e.clientX, py: e.clientY, ox: view.x, oy: view.y }
          setPanning(true)
          e.currentTarget.setPointerCapture(e.pointerId)
          return
        }
        if (e.target === e.currentTarget) onSelect(null)
      }}
      onPointerMove={(e) => {
        const p = panRef.current
        if (!p) return
        setView((v) => ({ ...v, x: p.ox + (e.clientX - p.px), y: p.oy + (e.clientY - p.py) }))
      }}
      onPointerUp={() => {
        panRef.current = null
        setPanning(false)
      }}
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) fit()
      }}
    >
      {/* 画布内容层 */}
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}
      >
        <Boards
          screens={screens}
          active={displayedActive}
          setActive={setActive}
          spaceHeld={spaceHeld}
          selected={selected}
          onSelect={onSelect}
          hoveredId={hoveredId}
          onOffsetsCommit={onOffsetsCommit}
          overrides={overrides}
          gameplay={gameplay}
          previewKey={previewKey}
          build={build}
          ps={ps}
          wireframe={wireframe}
          picks={picks}
        />
      </div>

      {/* 缩放控件 — 右下角 */}
      <div className="absolute bottom-3 right-3 z-20">
        <div className="flex items-center gap-0.5 rounded-full border border-[var(--divider-soft)] bg-white px-1 py-1 shadow-[0_2px_8px_rgba(16,18,24,0.10)]">
          <button
            type="button"
            title="适应屏幕"
            onClick={fit}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <Maximize2 size={12} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            title="缩小"
            onClick={() => zoomFromCenter(1 / 1.2)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <Minus size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            title="重置为 100%"
            onClick={() => zoomFromCenter(1 / view.z)}
            className="min-w-[42px] rounded-full px-1 text-center text-[11px] tabular-nums text-[var(--color-ink)]/70 transition-colors hover:text-[var(--color-ink)]"
          >
            {Math.round(view.z * 100)}%
          </button>
          <button
            type="button"
            title="放大"
            onClick={() => zoomFromCenter(1.2)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <Plus size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  )
}
