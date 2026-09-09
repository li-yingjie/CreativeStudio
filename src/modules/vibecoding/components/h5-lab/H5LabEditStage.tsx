import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  MessageSquarePlus,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Type as TypeIcon,
} from '@/shared/icons'
import type { H5LabCase } from './h5-lab-cases'
import { buildH5LabFrames } from './H5LabFrames'
import {
  findH5LabHotspots,
  type H5LabChatRef,
  type H5LabHotspot,
  type H5LabScreen,
} from './h5-lab-prototype'
import { buildH5LabLayers, type H5LabLayer } from './h5-lab-layers'
import {
  applyH5LabBoard,
  h5LabCss,
  h5LabKindOf,
  h5LabLabelOf,
  h5LabNodeAt,
  h5LabPathOf,
  type H5LabOverrides,
  type H5LabSelection,
} from './h5-lab-overrides'
import { useHostTitle } from './useHostTitle'

/* ─── H5 Lab 画布编辑台 ───
 *
 * 版式对齐 OJO：左边一台可交互的手机框（页面照常可点可滑，是「运行态」），
 * 右边把同一版页面的关键交互态并排铺成状态帧（「编辑态」）。状态帧接管点击 ——
 * 命中的 DOM 节点算出路径就是选区，页面自己的按钮在这里不会被触发。
 *
 * 覆盖走两条路：样式编译成作用域 CSS 注入（声明式、页面重渲染也在），文案 /
 * 图片只能命令式写回，所以每次覆盖变化和页面自身 DOM 变动后都跑一次 apply pass。
 */

const ZOOM_STEPS = [0.3, 0.4, 0.5, 0.62, 0.75, 0.9, 1, 1.25]

/** 面板要靠它反选图层 —— 画布和面板是布局上的兄弟，只能用一个句柄互通。 */
export interface H5LabStageApi {
  selectPath: (stateId: string, path: string) => void
}

export interface H5LabAsset {
  src: string
  label: string
}

interface Props {
  labCase: H5LabCase
  /** 补交互时生成的界面，和 registry 里的状态态一起铺在画布上。 */
  screens: H5LabScreen[]
  selection: H5LabSelection | null
  onSelect: (selection: H5LabSelection | null) => void
  overrides: H5LabOverrides
  onOverrides: (next: H5LabOverrides) => void
  /** 当前聚焦帧的图层树，推给右侧面板。 */
  onLayers: (layers: H5LabLayer[]) => void
  /** 当前聚焦帧的可交互热点 —— 面板靠它做交互盘点。 */
  onHotspots: (hotspots: H5LabHotspot[]) => void
  /** 页面里用到的图片 —— 下钻素材库画布编辑时当素材源。 */
  onAssets: (assets: H5LabAsset[]) => void
  apiRef: { current: H5LabStageApi | null }
  /** 顶栏页面选择器选中的帧 —— 画布把它滚进视野并高亮。 */
  focusFrameId?: string
  /** 画布上换了聚焦帧时同步给顶栏选择器。 */
  onFocusFrame?: (frameId: string) => void
  /** 把选中的元素带进对话，接着聊着改。 */
  onAddToChat: (ref: H5LabChatRef) => void
  /** 待应用的改动数 —— 顶栏「应用 N」用。 */
  pendingCount: number
  /** 放弃未应用的改动，回到上次应用的样子。 */
  onDiscard: () => void
  /** ESC 退出画布编辑（不提交草稿）。 */
  onExit: () => void
  /** 换 key 时重新挂载页面组件（刷新预览）。 */
  previewKey?: number
}

type Box = { left: number; top: number; width: number; height: number }

function sameBox(a: Box | null, b: Box | null) {
  if (a === b) return true
  if (!a || !b) return false
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

export default function H5LabEditStage({
  labCase,
  screens,
  selection,
  onSelect,
  overrides,
  onOverrides,
  onLayers,
  onHotspots,
  onAssets,
  apiRef,
  focusFrameId,
  onFocusFrame,
  onAddToChat,
  pendingCount,
  onDiscard,
  onExit,
  previewKey,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef(new Map<string, HTMLDivElement>())
  const [zoom, setZoom] = useState(0.5)
  const [hoverBox, setHoverBox] = useState<(Box & { label: string }) | null>(null)
  const [selectionBox, setSelectionBox] = useState<Box | null>(null)
  const [textEditingPath, setTextEditingPath] = useState<string | null>(null)
  // 覆盖写回后重新量一次选中框；也被滚动 / 缩放 / 尺寸变化触发。
  const [measureTick, setMeasureTick] = useState(0)
  const remeasure = useCallback(() => setMeasureTick((n) => n + 1), [])

  const css = useMemo(() => h5LabCss(overrides), [overrides])
  const frames = useMemo(() => buildH5LabFrames(labCase, screens), [labCase, screens])
  const focusedStateId =
    selection?.stateId ??
    (focusFrameId && frames.some((frame) => frame.id === focusFrameId)
      ? focusFrameId
      : frames[0]?.id ?? '')

  useHostTitle()

  /* ── apply pass：给有覆盖的节点补 data-h5el（CSS 靠它命中），并写回文案/图片 ── */
  const applyingRef = useRef(false)
  const applyOverrides = useCallback(() => {
    applyingRef.current = true
    for (const frame of frames) {
      const root = frameRefs.current.get(frame.id)
      if (root) applyH5LabBoard(root, overrides[frame.id] ?? {})
    }
    // 自己写的这批 mutation 也会进 observer，下一帧再放行。
    requestAnimationFrame(() => {
      applyingRef.current = false
    })
  }, [frames, overrides])

  useLayoutEffect(() => {
    applyOverrides()
  }, [applyOverrides, previewKey])

  /* 聚焦帧的图层树 / 交互热点，以及全部帧里用到的图片 —— 选区、覆盖或页面
     自身 DOM 变化后都重新推一次。 */
  const pushLayers = useCallback(() => {
    const root = frameRefs.current.get(focusedStateId)
    onLayers(root ? buildH5LabLayers(root) : [])
    onHotspots(root ? findH5LabHotspots(root) : [])

    const assets = new Map<string, string>()
    for (const frame of frames) {
      const frameRoot = frameRefs.current.get(frame.id)
      if (!frameRoot) continue
      for (const img of Array.from(frameRoot.querySelectorAll('img'))) {
        const src = img.getAttribute('src')
        if (!src || assets.has(src)) continue
        assets.set(src, img.alt?.trim() || src.split('/').at(-1) || '图片')
      }
    }
    onAssets([...assets].map(([src, label]) => ({ src, label })))
  }, [focusedStateId, frames, onAssets, onHotspots, onLayers])

  useEffect(() => {
    const frame = requestAnimationFrame(pushLayers)
    return () => cancelAnimationFrame(frame)
  }, [pushLayers, overrides, previewKey])

  /* 页面自身的 useState 切换会重建 DOM，把补写过的属性冲掉 —— 观察到就补回去。 */
  useEffect(() => {
    const observers: MutationObserver[] = []
    for (const frame of frames) {
      const root = frameRefs.current.get(frame.id)
      if (!root) continue
      const observer = new MutationObserver(() => {
        if (applyingRef.current) return
        applyOverrides()
        pushLayers()
        remeasure()
      })
      observer.observe(root, { childList: true, subtree: true })
      observers.push(observer)
    }
    return () => observers.forEach((observer) => observer.disconnect())
  }, [applyOverrides, frames, pushLayers, remeasure])

  /* ── 选中框跟随 ── */
  // 覆盖层挂在状态画布这一栏里，所以量的是相对这一栏的位置。
  const boxOf = useCallback((el: Element): Box | null => {
    const root = canvasRef.current
    if (!root) return null
    const rect = el.getBoundingClientRect()
    const base = root.getBoundingClientRect()
    return {
      left: rect.left - base.left,
      top: rect.top - base.top,
      width: rect.width,
      height: rect.height,
    }
  }, [])

  // 选中框要等 DOM 落位才量得到，属于「读 DOM → 写状态」的同步。量出来一样就把
  // 原对象还回去，免得每帧都换一个新引用把自己重新触发一遍。
  useLayoutEffect(() => {
    const root = selection ? frameRefs.current.get(selection.stateId) : null
    const node = root && selection ? h5LabNodeAt(root, selection.path) : null
    const next = node ? boxOf(node) : null
    setSelectionBox((prev) => (sameBox(prev, next) ? prev : next))
  }, [selection, boxOf, measureTick, zoom, css])

  /* 顶栏选了别的帧就把它滚进视野 —— 画布是横向铺开的，不然要手动找。 */
  useEffect(() => {
    if (!focusFrameId) return
    const node = frameRefs.current.get(focusFrameId)
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [focusFrameId])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    const onScroll = () => remeasure()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [remeasure])

  /* ESC 退出画布编辑（正在就地改字时先退出改字）。 */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (textEditingPath) return
      event.preventDefault()
      onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit, textEditingPath])

  /* ── 命中测试 / 选中 ── */
  const measure = useCallback(
    (stateId: string, path: string, el: HTMLElement): H5LabSelection => {
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        stateId,
        path,
        label: h5LabLabelOf(el),
        tag: el.tagName.toLowerCase(),
        kind: h5LabKindOf(el),
        measured: {
          width: Math.round(rect.width / zoom),
          height: Math.round(rect.height / zoom),
          x: Math.round(el.offsetLeft),
          y: Math.round(el.offsetTop),
          text: (el.textContent ?? '').trim(),
          src:
            el instanceof HTMLImageElement
              ? el.getAttribute('src') ?? ''
              : /url\("?(.*?)"?\)/.exec(style.backgroundImage)?.[1] ?? '',
          color: style.color,
          background: style.backgroundColor,
          radius: Math.round(parseFloat(style.borderTopLeftRadius) || 0),
          fontSize: Math.round(parseFloat(style.fontSize) || 0),
        },
      }
    },
    [zoom],
  )

  const resolve = useCallback(
    (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null
      for (const frame of frames) {
        const root = frameRefs.current.get(frame.id)
        if (!root || !root.contains(target)) continue
        let el: Element = target
        // svg 内部的 path/g 不单独成对象，统一收敛到最外层 svg。
        const svg = el.closest('svg')
        if (svg && root.contains(svg)) el = svg
        const path = h5LabPathOf(root, el as HTMLElement)
        if (!path) return null
        return { stateId: frame.id, path, el: el as HTMLElement }
      }
      return null
    },
    [frames],
  )

  /* 面板反选图层用的句柄。 */
  useEffect(() => {
    apiRef.current = {
      selectPath: (stateId, path) => {
        const root = frameRefs.current.get(stateId)
        const node = root ? h5LabNodeAt(root, path) : null
        if (!node) return
        onFocusFrame?.(stateId)
        onSelect(measure(stateId, path, node))
        node.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        remeasure()
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, measure, onFocusFrame, onSelect, remeasure])

  /* ── 拖动：选中元素上再按下就是移动，四角手柄改宽高 ──
     移动不做整块遮罩，否则点不进子元素；命中路径和当前选区相同才算移动。 */
  const dragRef = useRef<{
    mode: 'move' | 'resize'
    stateId: string
    path: string
    startX: number
    startY: number
    baseW: number
    baseH: number
    baseOffsetX: number
    baseOffsetY: number
    moved: boolean
  } | null>(null)
  const overridesRef = useRef(overrides)
  useEffect(() => {
    overridesRef.current = overrides
  }, [overrides])

  const beginDrag = useCallback(
    (mode: 'move' | 'resize', event: { clientX: number; clientY: number }) => {
      if (!selection) return
      const style = overridesRef.current[selection.stateId]?.[selection.path]?.style ?? {}
      dragRef.current = {
        mode,
        stateId: selection.stateId,
        path: selection.path,
        startX: event.clientX,
        startY: event.clientY,
        baseW: style.width ?? selection.measured.width,
        baseH: style.height ?? selection.measured.height,
        baseOffsetX: style.offsetX ?? 0,
        baseOffsetY: style.offsetY ?? 0,
        moved: false,
      }
    },
    [selection],
  )

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = (event.clientX - drag.startX) / zoom
      const dy = (event.clientY - drag.startY) / zoom
      // 一次普通点击不该留下一条空覆盖，先过 3px 门槛。
      if (!drag.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return
      drag.moved = true
      event.preventDefault()
      const current = overridesRef.current
      const board = current[drag.stateId] ?? {}
      const prev = board[drag.path] ?? {}
      const style =
        drag.mode === 'move'
          ? {
              offsetX: Math.round(drag.baseOffsetX + dx),
              offsetY: Math.round(drag.baseOffsetY + dy),
            }
          : {
              width: Math.max(8, Math.round(drag.baseW + dx)),
              height: Math.max(8, Math.round(drag.baseH + dy)),
            }
      onOverrides({
        ...current,
        [drag.stateId]: {
          ...board,
          [drag.path]: { ...prev, style: { ...prev.style, ...style } },
        },
      })
      remeasure()
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [onOverrides, remeasure, zoom])

  const onPointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hit = resolve(event.target)
    if (!hit) return
    if (textEditingPath === hit.path) return // 正在改字，别打断光标
    event.preventDefault()
    event.stopPropagation()
    setTextEditingPath(null)
    if (selection && selection.stateId === hit.stateId && selection.path === hit.path) {
      beginDrag('move', event)
      return
    }
    onFocusFrame?.(hit.stateId)
    onSelect(measure(hit.stateId, hit.path, hit.el))
  }

  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    // 状态帧是编辑对象，页面自身的按钮/链接在这里不响应（试交互去应用后的预览）。
    if (textEditingPath === null) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const onMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const hit = resolve(event.target)
    if (!hit) {
      setHoverBox(null)
      return
    }
    const box = boxOf(hit.el)
    setHoverBox(box ? { ...box, label: h5LabLabelOf(hit.el) } : null)
  }

  /* ── 双击就地改字 ── */
  const onDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const hit = resolve(event.target)
    if (!hit) return
    if (h5LabKindOf(hit.el) !== 'text') return
    event.preventDefault()
    const el = hit.el
    el.setAttribute('contenteditable', 'plaintext-only')
    el.style.outline = '2px solid #2f6bff'
    el.style.outlineOffset = '1px'
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    setTextEditingPath(hit.path)

    const finish = () => {
      el.removeEventListener('blur', finish)
      el.removeEventListener('keydown', onKey)
      el.removeAttribute('contenteditable')
      el.style.outline = ''
      el.style.outlineOffset = ''
      setTextEditingPath(null)
      const text = (el.textContent ?? '').trim()
      const board = overridesRef.current[hit.stateId] ?? {}
      const prev = board[hit.path] ?? {}
      onOverrides({
        ...overridesRef.current,
        [hit.stateId]: { ...board, [hit.path]: { ...prev, text } },
      })
    }
    const onKey = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape' || (keyEvent.key === 'Enter' && !keyEvent.shiftKey)) {
        keyEvent.preventDefault()
        el.blur()
      }
    }
    el.addEventListener('blur', finish)
    el.addEventListener('keydown', onKey)
  }

  const stepZoom = (direction: 1 | -1) => {
    const index = ZOOM_STEPS.findIndex((step) => step >= zoom - 0.001)
    const next = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, index + direction))]
    setZoom(next ?? zoom)
    remeasure()
  }

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-0 w-full overflow-hidden"
    >
      <style>{`[data-h5-frame]{contain:layout paint;}\n${css}`}</style>

      {/* ── 多状态画布 ── */}
      <div ref={canvasRef} className="@container relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          className="thin-scroll h-full w-full overflow-auto"
          /* 点画布空白处取消选中，面板回到 case 级的全局配置。命中画板里的元素时
             上面那个 capture handler 已经 stopPropagation，这里不会被触发。 */
          onPointerDown={() => {
            if (textEditingPath !== null) return
            onSelect(null)
          }}
        >
          <div
            className="flex w-max items-start gap-8 px-8 pb-16 pt-4"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            onPointerDownCapture={onPointerDownCapture}
            onClickCapture={onClickCapture}
            onDoubleClick={onDoubleClick}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setHoverBox(null)}
          >
            {frames.map((frame) => {
              const focused = frame.id === focusedStateId
              return (
                <div key={frame.id} className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2 pl-0.5">
                    {frame.generated && (
                      <span className="rounded-sm bg-[#2f6bff]/12 px-1 text-[10px] leading-[16px] text-[#2f6bff]">
                        新增
                      </span>
                    )}
                    <span
                      className={`text-[13px] ${focused ? 'font-semibold text-[#2f6bff]' : 'font-medium text-[var(--color-ink)]/75'}`}
                    >
                      {frame.label}
                    </span>
                    {frame.note && (
                      <span className="text-[11px] text-[var(--color-ink)]/40">
                        {frame.note}
                      </span>
                    )}
                  </div>
                  <div
                    data-h5-frame={frame.id}
                    ref={(node) => {
                      if (node) frameRefs.current.set(frame.id, node)
                      else frameRefs.current.delete(frame.id)
                    }}
                    className={`relative overflow-hidden rounded-[10px] shadow-[0_8px_30px_rgba(16,18,24,0.16)] ${
                      focused ? 'outline outline-[1.5px] outline-[#2f6bff]/45' : ''
                    }`}
                    style={{ width: labCase.width, background: labCase.canvasTone }}
                  >
                    <Suspense
                      fallback={
                        <div
                          className="grid h-[720px] place-items-center text-[12px] text-white/70"
                          style={{ background: labCase.canvasTone }}
                        >
                          页面加载中…
                        </div>
                      }
                    >
                      {frame.render(previewKey ?? 0)}
                    </Suspense>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* hover 轮廓 */}
        {hoverBox && (!selectionBox || hoverBox.top !== selectionBox.top) && (
          <div
            className="pointer-events-none absolute z-10 border border-[#2f6bff]/60"
            style={{
              left: hoverBox.left,
              top: hoverBox.top,
              width: hoverBox.width,
              height: hoverBox.height,
            }}
          >
            <span className="absolute -top-[17px] left-0 whitespace-nowrap rounded-sm bg-[#2f6bff]/80 px-1 text-[10px] leading-[15px] text-white">
              {hoverBox.label}
            </span>
          </div>
        )}

        {/* 选中框 + 手柄 —— 框体不吃事件，点击仍能落到更深的子元素上 */}
        {selection && selectionBox && (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: selectionBox.left,
              top: selectionBox.top,
              width: selectionBox.width,
              height: selectionBox.height,
            }}
          >
            <div className="absolute inset-0 border-[1.5px] border-[#2f6bff]" />
            <span className="absolute -top-[19px] left-0 flex items-center whitespace-nowrap rounded-sm bg-[#2f6bff] text-[10px] leading-[17px] text-white">
              <span className="px-1">{selection.label}</span>
              {/* 选中的这块直接丢进对话，接着用自然语言改。 */}
              <button
                type="button"
                title="添加到对话"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const frame = frames.find((item) => item.id === selection.stateId)
                  onAddToChat({
                    frameId: selection.stateId,
                    frameLabel: frame?.label ?? selection.stateId,
                    path: selection.path,
                    label: selection.label,
                    tag: selection.tag,
                    text: selection.measured.text || undefined,
                    src: selection.measured.src || undefined,
                  })
                }}
                className="pointer-events-auto flex h-[17px] items-center gap-0.5 border-l border-white/30 px-1 transition-colors hover:bg-white/20"
              >
                <MessageSquarePlus size={10} strokeWidth={2} />
                对话
              </button>
            </span>
            {(
              [
                ['-left-[4px] -top-[4px]', 'nwse-resize'],
                ['-right-[4px] -top-[4px]', 'nesw-resize'],
                ['-left-[4px] -bottom-[4px]', 'nesw-resize'],
                ['-right-[4px] -bottom-[4px]', 'nwse-resize'],
              ] as const
            ).map(([pos, cursor]) => (
              <div
                key={pos}
                className={`pointer-events-auto absolute size-[8px] rounded-[1px] border border-[#2f6bff] bg-white ${pos}`}
                style={{ cursor }}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  beginDrag('resize', event)
                }}
              />
            ))}
          </div>
        )}

        {/* 底部工具条 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex flex-wrap items-center justify-center gap-2">
          {/* 帧数和「放弃」跟其它浮动控件同排 —— 顶上不再压一条横栏，
              也不会盖住画板标题。应用/退出在外层工具栏。 */}
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[var(--divider-soft)] bg-white px-2 py-1 shadow-[0_2px_10px_rgba(16,18,24,0.12)]">
            <span className="text-[11px] text-[var(--color-ink)]/55">
              Current page · {frames.length} 帧
            </span>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={onDiscard}
                title="放弃未应用的改动"
                className="ml-1 flex h-5 items-center gap-1 rounded-full border-l border-[var(--divider-soft)] pl-2 text-[11px] text-[var(--color-ink)]/55 transition-colors hover:text-[var(--color-ink)]"
              >
                <RotateCcw size={10} strokeWidth={1.8} />
                放弃 {pendingCount}
              </button>
            )}
          </div>
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[var(--divider-soft)] bg-white px-1.5 py-1 shadow-[0_2px_10px_rgba(16,18,24,0.12)]">
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]">
              <Move size={12} strokeWidth={1.8} />
            </span>
            <span className="flex items-center gap-1 px-1 text-[11px] text-[var(--color-ink)]/55">
              <TypeIcon size={11} strokeWidth={1.8} />
              双击改文案 · ESC 退出
            </span>
          </div>
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-[var(--divider-soft)] bg-white px-1 py-1 shadow-[0_2px_10px_rgba(16,18,24,0.12)]">
            <button
              type="button"
              title="缩小"
              onClick={() => stepZoom(-1)}
              className="flex size-6 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <Minus size={13} strokeWidth={1.8} />
            </button>
            <span className="min-w-[42px] text-center text-[11px] tabular-nums text-[var(--color-ink)]/70">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              title="放大"
              onClick={() => stepZoom(1)}
              className="flex size-6 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <Plus size={13} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
