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
import { toast } from 'sonner'
import {
  Copy,
  Maximize2,
  MessageSquarePlus,
  Minus,
  PencilLine,
  Plus,
  Trash2,
} from '@/shared/icons'
import type { H5LabCase, H5LabDesign } from './h5-lab-cases'
import { buildH5LabFrames } from './H5LabFrames'
import {
  applyH5LabPageSettings,
  findH5LabHotspots,
  type H5LabChatRef,
  type H5LabHotspot,
  type H5LabPageSettings,
  type H5LabScreen,
} from './h5-lab-prototype'
import { buildH5LabLayers, type H5LabLayer } from './h5-lab-layers'
import {
  h5LabDesignCss,
  h5LabDesignTokenUsage,
  h5LabMergeDesign,
  markH5LabDesign,
  type H5LabColorToken,
  type H5LabDesignTokenUsage,
} from './h5-lab-design'
import {
  applyH5LabBoard,
  applyH5LabGroups,
  applyH5LabInsertedElements,
  h5LabCss,
  h5LabGroupId,
  h5LabGroupPath,
  h5LabKindOf,
  h5LabLabelOf,
  h5LabNodeAt,
  h5LabPatchSlot,
  h5LabPathOf,
  h5LabReset,
  type H5LabOverrides,
  type H5LabGroup,
  type H5LabInsertedElement,
  type H5LabInsertedElementKind,
  type H5LabSelection,
} from './h5-lab-overrides'
import { useHostTitle } from './useHostTitle'
import type { H5LabHistoryOptions } from './useH5LabHistory'

/* ─── H5 Lab 画布编辑台 ───
 *
 * 版式对齐 OJO：左边一台可交互的手机框（页面照常可点可滑，是「运行态」），
 * 右边把同一版页面的关键交互态并排铺成状态帧（「编辑态」）。状态帧接管点击 ——
 * 命中的 DOM 节点算出路径就是选区，页面自己的按钮在这里不会被触发。
 *
 * 覆盖走两条路：样式编译成作用域 CSS 注入（声明式、页面重渲染也在），文案 /
 * 图片只能命令式写回，所以每次覆盖变化和页面自身 DOM 变动后都跑一次 apply pass。
 */

const MIN_ZOOM = 0.15
const MAX_ZOOM = 3
const DEFAULT_FRAME_LEFT_PADDING = 24
const INITIAL_ZOOM = 0.5
const CONTENT_INLINE_PADDING = 32
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

interface CanvasView {
  zoom: number
  x: number
  y: number
}

/** 面板要靠它反选图层 —— 画布和面板是布局上的兄弟，只能用一个句柄互通。 */
export interface H5LabStageApi {
  selectPath: (stateId: string, path: string) => void
  reorderPath: (
    stateId: string,
    sourcePath: string,
    targetPath: string,
    placement?: 'before' | 'after',
  ) => boolean
  groupSelectionWithLayout: (
    layoutMode: 'normal' | 'vertical' | 'horizontal',
  ) => void
}

export interface H5LabAsset {
  src: string
  label: string
  kind: 'image' | 'video'
}

interface Props {
  labCase: H5LabCase
  /** 补交互时生成的界面，和 registry 里的状态态一起铺在画布上。 */
  screens: H5LabScreen[]
  groups: H5LabGroup[]
  onGroups: (groups: H5LabGroup[], options?: H5LabHistoryOptions) => void
  selection: H5LabSelection | null
  onSelect: (selection: H5LabSelection | null) => void
  overrides: H5LabOverrides
  onOverrides: (next: H5LabOverrides, options?: H5LabHistoryOptions) => void
  /** 已解除多帧同步的槽位；这些路径只写当前状态帧。 */
  independentPaths: ReadonlySet<string>
  pageSettings: H5LabPageSettings
  /** 当前聚焦帧的图层树，推给右侧面板。 */
  onLayers: (layers: H5LabLayer[]) => void
  /** 当前聚焦帧的可交互热点 —— 面板靠它做交互盘点。 */
  onHotspots: (hotspots: H5LabHotspot[]) => void
  /** 页面里用到的图片 —— 下钻素材库画布编辑时当素材源。 */
  onAssets: (assets: H5LabAsset[]) => void
  /** 设计系统颜色在全部状态帧里的实际命中数量。 */
  onDesignTokenUsage: (usage: H5LabDesignTokenUsage) => void
  /** 面板正在查看的颜色角色，画布会显出所有命中元素。 */
  inspectedDesignToken: H5LabColorToken | null
  /** 多选只存在于画布内；把数量同步给面板，避免属性误写最后一个元素。 */
  onMultiSelectionChange: (count: number) => void
  apiRef: { current: H5LabStageApi | null }
  /** 顶栏页面选择器选中的帧 —— 画布把它滚进视野并高亮。 */
  focusFrameId?: string
  /** 画布上换了聚焦帧时同步给顶栏选择器。 */
  onFocusFrame?: (frameId: string) => void
  /** 删除补出来的状态帧；基准帧不允许删除。 */
  onDeleteFrame: (frameId: string) => void
  elements: H5LabInsertedElement[]
  onElements: (
    elements: H5LabInsertedElement[],
    options?: H5LabHistoryOptions,
  ) => void
  /** 把选中的元素带进对话，接着聊着改。 */
  onAddToChat: (ref: H5LabChatRef) => void
  /** 给选中元素写一条标注，并带入对话继续描述修改。 */
  onAnnotate: (ref: H5LabChatRef, note: string) => void
  onUndo: () => void
  onRedo: () => void
  /** ESC 退出画布编辑（不提交草稿）。 */
  onExit: () => void
  /** 换 key 时重新挂载页面组件（刷新预览）。 */
  previewKey?: number
}

type Box = { left: number; top: number; width: number; height: number }

const INSERTABLE_COMPONENTS: {
  kind: H5LabInsertedElementKind
  label: string
  hint: string
  html: (design: H5LabDesign) => string
}[] = [
  {
    kind: 'heading',
    label: '标题',
    hint: '添加一行章节标题',
    html: (design) =>
      `<h2 data-h5ds-seen data-h5ds="c-pageInk f-display" style="box-sizing:border-box;width:calc(100% - 32px);margin:20px 16px 8px;color:${design.pageInk};font-family:${escapeHtmlAttribute(design.displayFont)};font-size:24px;font-weight:600;line-height:1.35">标题文本</h2>`,
  },
  {
    kind: 'paragraph',
    label: '正文',
    hint: '添加一段说明文字',
    html: (design) =>
      `<p data-h5ds-seen data-h5ds="c-pageInk f-body" style="box-sizing:border-box;width:calc(100% - 32px);margin:8px 16px 20px;color:${design.pageInk};font-family:${escapeHtmlAttribute(design.bodyFont)};font-size:14px;font-weight:400;line-height:1.7">在这里输入正文内容。</p>`,
  },
]

const MAX_PASTED_IMAGE_BYTES = 4 * 1024 * 1024

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('图片读取失败'))
    reader.onerror = () => reject(reader.error ?? new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

function cleanCopiedElement(node: HTMLElement, sourceStateId?: string) {
  const clone = node.cloneNode(true) as HTMLElement
  for (const element of [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))]) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith('data-h5')) element.removeAttribute(attribute.name)
    }
    element.removeAttribute('contenteditable')
  }
  if (sourceStateId) clone.dataset.h5CopySourceFrame = sourceStateId
  return clone.outerHTML
}

async function writeHtmlToClipboard(html: string) {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([html], { type: 'text/plain' }),
      }),
    ])
    return
  }
  await navigator.clipboard.writeText(html)
}

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
  groups,
  onGroups,
  selection,
  onSelect,
  overrides,
  onOverrides,
  independentPaths,
  pageSettings,
  onLayers,
  onHotspots,
  onAssets,
  onDesignTokenUsage,
  inspectedDesignToken,
  onMultiSelectionChange,
  apiRef,
  focusFrameId,
  onFocusFrame,
  onDeleteFrame,
  elements,
  onElements,
  onAddToChat,
  onAnnotate,
  onUndo,
  onRedo,
  onExit,
  previewKey,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef(new Map<string, HTMLDivElement>())
  const copiedElementRef = useRef<{ html: string; sourceStateId: string } | null>(
    null,
  )
  const overridesRef = useRef(overrides)
  useEffect(() => {
    overridesRef.current = overrides
  }, [overrides])
  const [view, setView] = useState<CanvasView>({
    zoom: INITIAL_ZOOM,
    x: DEFAULT_FRAME_LEFT_PADDING - CONTENT_INLINE_PADDING * INITIAL_ZOOM,
    y: 16,
  })
  const { zoom } = view
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [panning, setPanning] = useState(false)
  const panRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)
  const [hoverBox, setHoverBox] = useState<
    (Box & { label: string; stateId: string; path: string }) | null
  >(null)
  const [selectionBox, setSelectionBox] = useState<Box | null>(null)
  const [multiSelections, setMultiSelections] = useState<H5LabSelection[]>([])
  const groupSelectionRef = useRef<
    (layoutMode?: 'normal' | 'vertical' | 'horizontal') => void
  >(() => {})
  const [multiBoxes, setMultiBoxes] = useState<Box[]>([])
  const [textEditingPath, setTextEditingPath] = useState<string | null>(null)
  const [annotationPath, setAnnotationPath] = useState<string | null>(null)
  const [annotationDraft, setAnnotationDraft] = useState('')
  // 覆盖写回后重新量一次选中框；也被滚动 / 缩放 / 尺寸变化触发。
  const [measureTick, setMeasureTick] = useState(0)
  const remeasure = useCallback(() => setMeasureTick((n) => n + 1), [])

  /* 帧标题右侧只保留最基础的文本插入。 */
  const [addingForFrame, setAddingForFrame] = useState<string | null>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addingForFrame) return
    const onPointerDown = (event: PointerEvent) => {
      if (addMenuRef.current?.contains(event.target as Node)) return
      setAddingForFrame(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [addingForFrame])

  useEffect(() => {
    onMultiSelectionChange(multiSelections.length)
  }, [multiSelections.length, onMultiSelectionChange])

  useEffect(
    () => () => onMultiSelectionChange(0),
    [onMultiSelectionChange],
  )

  const css = useMemo(() => h5LabCss(overrides), [overrides])
  const design = useMemo(
    () => h5LabMergeDesign(labCase.design, pageSettings.design),
    [labCase.design, pageSettings.design],
  )
  const designCss = useMemo(
    () => h5LabDesignCss(labCase.design, design, pageSettings.designTintImages),
    [design, labCase.design, pageSettings.designTintImages],
  )
  const frames = useMemo(
    () => buildH5LabFrames(labCase, screens, design),
    [design, labCase, screens],
  )
  const sharedStateIds = useMemo(
    () => labCase.states.map((item) => item.id),
    [labCase.states],
  )
  const sharedStateIdSet = useMemo(() => new Set(sharedStateIds), [sharedStateIds])
  const slotStateIds = useCallback(
    (stateId: string, path: string) =>
      sharedStateIdSet.has(stateId) && !independentPaths.has(path)
        ? sharedStateIds
        : [stateId],
    [independentPaths, sharedStateIdSet, sharedStateIds],
  )
  const focusedStateId =
    selection?.stateId ??
    (focusFrameId && frames.some((frame) => frame.id === focusFrameId)
      ? focusFrameId
      : frames[0]?.id ?? '')
  // 标题、标签和描边也在画布 transform 里面；默认 50% 下做 2 倍补偿，
  // 最终屏幕尺寸才和「夯爆了」一致（13px / 11px / 2px 选中环）。
  const boardUiScale = 2

  useHostTitle()

  /* ── apply pass：给有覆盖的节点补 data-h5el（CSS 靠它命中），并写回文案/图片 ── */
  const applyingRef = useRef(false)
  const applyOverrides = useCallback(() => {
    applyingRef.current = true
    for (const frame of frames) {
      const root = frameRefs.current.get(frame.id)
      if (root) {
        applyH5LabInsertedElements(
          root,
          elements.filter((element) => element.stateId === frame.id),
        )
        applyH5LabGroups(
          root,
          groups.filter((group) => group.stateId === frame.id),
        )
        applyH5LabBoard(root, overrides[frame.id] ?? {})
        applyH5LabPageSettings(root, pageSettings)
        // 生成屏本来就吃 design 变量；仍标角色，供设计系统面板定位影响范围。
        markH5LabDesign(root, frame.generated ? design : labCase.design)
      }
    }
    // 自己写的这批 mutation 也会进 observer，下一帧再放行。
    requestAnimationFrame(() => {
      applyingRef.current = false
    })
  }, [design, elements, frames, groups, labCase.design, overrides, pageSettings])

  useLayoutEffect(() => {
    applyOverrides()
  }, [applyOverrides, previewKey])

  /* 聚焦帧的图层树 / 交互热点，以及全部帧里用到的媒体 —— 选区、覆盖或页面
     自身 DOM 变化后都重新推一次。 */
  const pushLayers = useCallback(() => {
    const root = frameRefs.current.get(focusedStateId)
    onLayers(root ? buildH5LabLayers(root) : [])
    onHotspots(root ? findH5LabHotspots(root) : [])

    const assets = new Map<string, H5LabAsset>()
    for (const frame of frames) {
      const frameRoot = frameRefs.current.get(frame.id)
      if (!frameRoot) continue
      for (const media of Array.from(
        frameRoot.querySelectorAll<HTMLImageElement | HTMLVideoElement>('img, video'),
      )) {
        const src = media.getAttribute('src')
        if (!src || assets.has(src)) continue
        const kind = media instanceof HTMLVideoElement ? 'video' : 'image'
        const label =
          (media instanceof HTMLImageElement ? media.alt?.trim() : media.title?.trim()) ||
          media.getAttribute('aria-label')?.trim() ||
          src.split('/').at(-1) ||
          (kind === 'video' ? '视频' : '图片')
        assets.set(src, { src, label, kind })
      }
    }
    onAssets([...assets.values()])
    onDesignTokenUsage(h5LabDesignTokenUsage(frameRefs.current.values()))
  }, [focusedStateId, frames, onAssets, onDesignTokenUsage, onHotspots, onLayers])

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
    let rect = el.getBoundingClientRect()
    if (el instanceof HTMLElement && el.hasAttribute('data-h5-group')) {
      const childRects = Array.from(el.children)
        .map((child) => child.getBoundingClientRect())
        .filter((childRect) => childRect.width > 0 || childRect.height > 0)
      if (childRects.length > 0) {
        const left = Math.min(...childRects.map((item) => item.left))
        const top = Math.min(...childRects.map((item) => item.top))
        const right = Math.max(...childRects.map((item) => item.right))
        const bottom = Math.max(...childRects.map((item) => item.bottom))
        rect = new DOMRect(left, top, right - left, bottom - top)
      }
    }
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
  }, [selection, boxOf, measureTick, zoom, view.x, view.y, css])

  useLayoutEffect(() => {
    const next = multiSelections.flatMap((item) => {
      const root = frameRefs.current.get(item.stateId)
      const node = root ? h5LabNodeAt(root, item.path) : null
      const box = node ? boxOf(node) : null
      return box ? [box] : []
    })
    setMultiBoxes(next)
  }, [boxOf, css, measureTick, multiSelections, view.x, view.y, zoom])

  /** 以画布内某一点为锚缩放，Mac 触控板捏合时内容不会从指尖滑走。 */
  const zoomAt = useCallback((factor: number, x: number, y: number) => {
    setView((current) => {
      const nextZoom = clamp(current.zoom * factor, MIN_ZOOM, MAX_ZOOM)
      if (nextZoom === current.zoom) return current
      const ratio = nextZoom / current.zoom
      return {
        zoom: nextZoom,
        x: x - (x - current.x) * ratio,
        y: y - (y - current.y) * ratio,
      }
    })
  }, [])

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const viewport = scrollRef.current
      if (!viewport) return
      zoomAt(factor, viewport.clientWidth / 2, viewport.clientHeight / 2)
    },
    [zoomAt],
  )

  /** 全部状态帧适应当前工作区，沿用「这夏夯爆了」旧画布的 fit 行为。 */
  const fit = useCallback(() => {
    const viewport = scrollRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    const contentWidth = content.offsetWidth
    const contentHeight = content.offsetHeight
    if (!contentWidth || !contentHeight) return
    const nextZoom = clamp(
      Math.min(viewport.clientWidth / contentWidth, viewport.clientHeight / contentHeight),
      MIN_ZOOM,
      MAX_ZOOM,
    )
    setView({
      zoom: nextZoom,
      x: (viewport.clientWidth - contentWidth * nextZoom) / 2,
      y: (viewport.clientHeight - contentHeight * nextZoom) / 2,
    })
  }, [])

  // 触控板：双指平移；Mac 捏合会以 ctrlKey wheel 上报，按手势位置缩放。
  useEffect(() => {
    const viewport = scrollRef.current
    if (!viewport) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = viewport.getBoundingClientRect()
      if (event.ctrlKey || event.metaKey) {
        zoomAt(
          Math.exp(-event.deltaY / 240),
          event.clientX - rect.left,
          event.clientY - rect.top,
        )
      } else {
        setView((current) => ({
          ...current,
          x: current.x - event.deltaX,
          y: current.y - event.deltaY,
        }))
      }
      remeasure()
    }
    const onResize = () => remeasure()
    viewport.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResize)
    return () => {
      viewport.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
    }
  }, [remeasure, zoomAt])

  /* ESC 退出画布编辑（正在就地改字时先退出改字）。 */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      if (!editing && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) onRedo()
        else onUndo()
        return
      }
      if (!editing && event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        onRedo()
        return
      }
      if (!editing && event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        setSpaceHeld(true)
        return
      }
      if (
        !editing &&
        !selection &&
        multiSelections.length === 0 &&
        (event.key === 'Delete' || event.key === 'Backspace') &&
        frames.find((frame) => frame.id === focusedStateId)?.generated
      ) {
        event.preventDefault()
        onDeleteFrame(focusedStateId)
        return
      }
      if (event.key !== 'Escape') return
      if (textEditingPath) return
      event.preventDefault()
      if (selection || multiSelections.length > 0) {
        setMultiSelections([])
        onSelect(null)
        return
      }
      onExit()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpaceHeld(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [
    focusedStateId,
    frames,
    multiSelections.length,
    onDeleteFrame,
    onExit,
    onRedo,
    onSelect,
    onUndo,
    selection,
    textEditingPath,
  ])

  /* ── 命中测试 / 选中 ── */
  const measure = useCallback(
    (stateId: string, path: string, el: HTMLElement): H5LabSelection => {
      const style = window.getComputedStyle(el)
      let rect = el.getBoundingClientRect()
      if (el.hasAttribute('data-h5-group')) {
        const childRects = Array.from(el.children)
          .map((child) => child.getBoundingClientRect())
          .filter((childRect) => childRect.width > 0 || childRect.height > 0)
        if (childRects.length > 0) {
          const left = Math.min(...childRects.map((item) => item.left))
          const top = Math.min(...childRects.map((item) => item.top))
          const right = Math.max(...childRects.map((item) => item.right))
          const bottom = Math.max(...childRects.map((item) => item.bottom))
          rect = new DOMRect(left, top, right - left, bottom - top)
        }
      }
      /* Position 面板照 Figma：X/Y 是元素在父容器里的位置，对齐按钮把它贴到父容器
         的边 / 中线。这里量的是去掉平移后的"基准位置"，对齐和改 X/Y 都是
         「目标 − 基准 = 平移」，重复点不会越推越远。display:contents 的编组没有
         自己的盒子，往上找第一个有盒子的祖先当父容器。 */
      let box: HTMLElement | null = el.parentElement
      while (box && window.getComputedStyle(box).display === 'contents') {
        box = box.parentElement
      }
      const parentRect = box?.getBoundingClientRect()
      const matrix =
        style.transform && style.transform !== 'none'
          ? new DOMMatrixReadOnly(style.transform)
          : null
      const translateX = matrix ? matrix.e : 0
      const translateY = matrix ? matrix.f : 0
      const layoutX = parentRect ? (rect.left - parentRect.left) / zoom - translateX : 0
      const layoutY = parentRect ? (rect.top - parentRect.top) / zoom - translateY : 0
      const fontSize = parseFloat(style.fontSize) || 0
      const parsedWeight = Number(style.fontWeight)
      const lineHeight = parseFloat(style.lineHeight)
      const textAlign = ['center', 'right'].includes(style.textAlign)
        ? (style.textAlign as 'center' | 'right')
        : 'left'
      const textDecoration = style.textDecorationLine.includes('underline')
        ? 'underline'
        : style.textDecorationLine.includes('line-through')
          ? 'line-through'
          : 'none'
      const layoutMode = style.display.includes('flex')
        ? style.flexWrap === 'wrap'
          ? 'wrap'
          : style.flexDirection === 'column' || style.flexDirection === 'column-reverse'
            ? 'vertical'
            : 'horizontal'
        : 'normal'
      const justifyContent = ['center', 'flex-end', 'space-between'].includes(
        style.justifyContent,
      )
        ? (style.justifyContent as 'center' | 'flex-end' | 'space-between')
        : 'flex-start'
      const alignItems = ['center', 'flex-end', 'stretch'].includes(style.alignItems)
        ? (style.alignItems as 'center' | 'flex-end' | 'stretch')
        : 'flex-start'
      const inlineSized = style.display.startsWith('inline')
      return {
        stateId,
        path,
        label: h5LabLabelOf(el),
        tag: el.tagName.toLowerCase(),
        kind: h5LabKindOf(el),
        measured: {
          width: Math.round(rect.width / zoom),
          height: Math.round(rect.height / zoom),
          x: Math.round(el.offsetLeft || rect.left),
          y: Math.round(el.offsetTop || rect.top),
          layoutX: Math.round(layoutX),
          layoutY: Math.round(layoutY),
          translateX: Math.round(translateX),
          translateY: Math.round(translateY),
          parentWidth: box ? box.clientWidth : 0,
          parentHeight: box ? box.clientHeight : 0,
          text: (el.textContent ?? '').trim(),
          html: el.innerHTML,
          className: typeof el.className === 'string' ? el.className : '',
          src:
            el instanceof HTMLImageElement || el instanceof HTMLVideoElement
              ? el.getAttribute('src') ?? ''
              : /url\("?(.*?)"?\)/.exec(style.backgroundImage)?.[1] ?? '',
          color: style.color,
          background: style.backgroundColor,
          radius: Math.round(parseFloat(style.borderTopLeftRadius) || 0),
          fontFamily: style.fontFamily,
          fontSize: Math.round(fontSize),
          fontWeight: Number.isFinite(parsedWeight)
            ? parsedWeight
            : style.fontWeight === 'bold'
              ? 700
              : 400,
          fontStyle: style.fontStyle === 'italic' || style.fontStyle === 'oblique'
            ? 'italic'
            : 'normal',
          lineHeight: Math.round(Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.2),
          letterSpacing: Number.isFinite(parseFloat(style.letterSpacing))
            ? parseFloat(style.letterSpacing)
            : 0,
          textAlign,
          textDecoration,
          childCount: Array.from(el.children).filter(
            (child) => !['br', 'style', 'script'].includes(child.tagName.toLowerCase()),
          ).length,
          layoutMode,
          justifyContent,
          alignItems,
          gap: Math.round(parseFloat(style.gap) || 0),
          paddingTop: Math.round(parseFloat(style.paddingTop) || 0),
          paddingRight: Math.round(parseFloat(style.paddingRight) || 0),
          paddingBottom: Math.round(parseFloat(style.paddingBottom) || 0),
          paddingLeft: Math.round(parseFloat(style.paddingLeft) || 0),
          widthSizing: inlineSized ? 'hug' : 'fixed',
          heightSizing: inlineSized ? 'hug' : 'fixed',
          clipContent: ['hidden', 'clip'].includes(style.overflow),
        },
      }
    },
    [zoom],
  )

  const insertElementIntoFrame = useCallback(
    (
      frameId: string,
      element: Omit<
        H5LabInsertedElement,
        'id' | 'caseId' | 'stateId' | 'parentPath'
      >,
      historyGroup: string,
    ) => {
      const root = frameRefs.current.get(frameId)
      if (!root) return false
      const parent =
        root.querySelector<HTMLElement>('main') ??
        root.firstElementChild ??
        root
      if (!(parent instanceof HTMLElement)) return false
      const parentPath = parent === root ? '' : h5LabPathOf(root, parent) ?? ''
      const id = `${element.kind}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`
      onElements(
        [
          ...elements,
          {
            ...element,
            id,
            caseId: labCase.id,
            stateId: frameId,
            parentPath,
          },
        ],
        { group: `${historyGroup}|${frameId}|${id}` },
      )
      onFocusFrame?.(frameId)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const nextRoot = frameRefs.current.get(frameId)
          const wrapper = nextRoot?.querySelector<HTMLElement>(
            `[data-h5-inserted="${CSS.escape(id)}"]`,
          )
          const target = wrapper?.firstElementChild
          if (!(target instanceof HTMLElement) || !nextRoot) return
          const path = h5LabPathOf(nextRoot, target)
          if (!path) return
          onSelect(measure(frameId, path, target))
          remeasure()
        })
      })
      return true
    },
    [
      elements,
      labCase.id,
      measure,
      onElements,
      onFocusFrame,
      onSelect,
      remeasure,
    ],
  )

  const addTextElementToFrame = (
    frameId: string,
    component: (typeof INSERTABLE_COMPONENTS)[number],
  ) => {
    if (
      insertElementIntoFrame(
        frameId,
        {
          kind: component.kind,
          label: component.label,
          // HTML 存原稿 token；当前皮肤由 data-h5ds 规则覆盖，切回原稿也能复原。
          html: component.html(labCase.design),
        },
        'add-text',
      )
    ) {
      setAddingForFrame(null)
      toast(`已添加${component.label}`)
    }
  }

  /* 图片和复制出的 DOM 都落到当前聚焦帧，可在同帧或切换帧后粘贴。 */
  useEffect(() => {
    const onPaste = async (event: ClipboardEvent) => {
      const active = document.activeElement
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return
      }

      const clipboard = event.clipboardData
      if (!clipboard) return
      const imageFile = Array.from(clipboard.items)
        .find((item) => item.kind === 'file' && item.type.startsWith('image/'))
        ?.getAsFile()
      const clipboardHtml = clipboard.getData('text/html')
      const plainText = clipboard.getData('text/plain')
      const html =
        clipboardHtml ||
        (/^\s*</.test(plainText) ? plainText : '') ||
        (clipboard.types.length === 0 ? copiedElementRef.current?.html ?? '' : '')
      const parsed = html
        ? new DOMParser().parseFromString(html, 'text/html')
        : null
      const pastedElement = parsed?.body.firstElementChild
      if (!imageFile && !(pastedElement instanceof HTMLElement)) return

      event.preventDefault()
      if (imageFile && imageFile.size > MAX_PASTED_IMAGE_BYTES) {
        toast.error('图片不能超过 4 MB')
        return
      }

      const stateId = focusedStateId
      if (imageFile) {
        let src = ''
        try {
          src = await readImageFile(imageFile)
        } catch {
          toast.error('图片读取失败，请重新粘贴')
          return
        }
        if (!src) return
        const label = imageFile.name || '粘贴图片'
        if (
          insertElementIntoFrame(
            stateId,
            {
              kind: 'image',
              label,
              html: `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(label)}" style="box-sizing:border-box;display:block;width:calc(100% - 32px);height:auto;margin:20px 16px;object-fit:contain" />`,
            },
            'paste-image',
          )
        ) {
          toast('图片已粘贴，可继续对话或进入素材库编辑')
        }
        return
      }

      if (!(pastedElement instanceof HTMLElement)) return
      const sourceStateId = pastedElement.dataset.h5CopySourceFrame
      const cleanHtml = cleanCopiedElement(pastedElement)
      const tag = pastedElement.tagName.toLowerCase()
      const text = (pastedElement.textContent ?? '').trim().replace(/\s+/g, ' ')
      const label =
        pastedElement.getAttribute('aria-label')?.trim() ||
        (text ? text.slice(0, 16) : tag === 'div' ? '复制的容器' : `复制的 ${tag}`)
      const kind = tag === 'img' ? 'image' : 'html'
      if (
        insertElementIntoFrame(
          stateId,
          { kind, label, html: cleanHtml },
          'paste-element',
        )
      ) {
        const frameLabel =
          frames.find((frame) => frame.id === stateId)?.label ?? '当前画板'
        toast(
          sourceStateId && sourceStateId !== stateId
            ? `已跨画板粘贴到「${frameLabel}」`
            : '已粘贴到当前画板',
        )
      }
    }

    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [
    elements,
    focusedStateId,
    frames,
    insertElementIntoFrame,
    labCase.id,
    measure,
    onElements,
    onFocusFrame,
    onSelect,
    remeasure,
  ])

  const resolve = useCallback(
    (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null
      for (const frame of frames) {
        const root = frameRefs.current.get(frame.id)
        if (!root || !root.contains(target)) continue
        let el: Element = target
        const group = el.closest<HTMLElement>('[data-h5-group]')
        if (group && root.contains(group)) el = group
        // svg 内部的 path/g 不单独成对象，统一收敛到最外层 svg。
        const svg = el.closest('svg')
        if (svg && root.contains(svg)) el = svg
        const groupId = (el as HTMLElement).dataset.h5Group
        const path = groupId
          ? h5LabGroupPath(groupId)
          : h5LabPathOf(root, el as HTMLElement)
        if (!path) return null
        return { stateId: frame.id, path, el: el as HTMLElement }
      }
      return null
    },
    [frames],
  )

  const reorderPath = useCallback(
    (
      stateId: string,
      sourcePath: string,
      targetPath: string,
      placement: 'before' | 'after' = 'before',
    ) => {
      if (sourcePath === targetPath) return false
      const root = frameRefs.current.get(stateId)
      const source = root ? h5LabNodeAt(root, sourcePath) : null
      const target = root ? h5LabNodeAt(root, targetPath) : null
      const parent = source?.parentElement
      if (!root || !source || !target || !parent || target.parentElement !== parent) {
        toast.error('只能调整同一父级下的图层顺序')
        return false
      }
      const siblings = Array.from(parent.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          !['STYLE', 'SCRIPT', 'BR'].includes(child.tagName),
      )
      const sourceIndex = siblings.indexOf(source)
      if (sourceIndex < 0 || !siblings.includes(target)) return false
      const reordered = siblings.filter((node) => node !== source)
      let targetIndex = reordered.indexOf(target)
      if (placement === 'after') targetIndex += 1
      reordered.splice(targetIndex, 0, source)
      if (reordered.every((node, index) => node === siblings[index])) return false

      const entries = siblings.flatMap((node, index) => {
        const path =
          node.dataset.h5Group
            ? h5LabGroupPath(node.dataset.h5Group)
            : h5LabPathOf(root, node)
        if (!path) return []
        node.dataset.h5SourcePath = path
        if (!node.dataset.h5SourceOrder) node.dataset.h5SourceOrder = String(index)
        return [{ node, path }]
      })
      if (entries.length !== siblings.length) return false
      const orderedPaths = reordered.flatMap((node) => {
        const hit = entries.find((entry) => entry.node === node)
        return hit ? [hit.path] : []
      })
      let next = overridesRef.current
      for (const [index, path] of orderedPaths.entries()) {
        next = h5LabPatchSlot(next, [stateId], path, {
          siblingOrder: index,
        })
      }
      onOverrides(next, {
        group: `reorder|${stateId}|${sourcePath}`,
      })
      requestAnimationFrame(() => {
        pushLayers()
        remeasure()
      })
      return true
    },
    [onOverrides, pushLayers, remeasure],
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
        remeasure()
      },
      reorderPath,
      groupSelectionWithLayout: (layoutMode) => {
        groupSelectionRef.current(layoutMode)
      },
    }
    return () => {
      apiRef.current = null
    }
  }, [apiRef, measure, onFocusFrame, onSelect, remeasure, reorderPath])

  /* ── 拖动：选中元素上再按下就是移动，四角手柄改宽高 ──
     移动不做整块遮罩，否则点不进子元素；命中路径和当前选区相同才算移动。 */
  const dragRef = useRef<{
    mode:
      | 'move'
      | 'resize'
      | 'resize-x'
      | 'resize-x-start'
      | 'resize-y'
      | 'resize-y-start'
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
  const groupSelection = useCallback((layoutMode?: 'normal' | 'vertical' | 'horizontal') => {
    const picked = multiSelections.length > 1 ? multiSelections : []
    if (picked.length < 2) {
      toast('按住 Shift 依次选择至少两个同级元素，再按 ⌘G 打组')
      return
    }
    if (picked.some((item) => item.path.startsWith('@group:'))) {
      toast.error('暂不支持嵌套编组，请先取消已有编组')
      return
    }
    const stateId = picked[0].stateId
    const root = frameRefs.current.get(stateId)
    if (!root) return
    const nodes = picked
      .map((item) => h5LabNodeAt(root, item.path))
      .filter((node): node is HTMLElement => Boolean(node))
    const parent = nodes[0]?.parentElement
    if (
      !parent ||
      nodes.length !== picked.length ||
      nodes.some((node) => node.parentElement !== parent)
    ) {
      toast.error('只能将同一父级下的元素打组')
      return
    }
    const siblings = Array.from(parent.children).filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement &&
        !['STYLE', 'SCRIPT', 'BR'].includes(node.tagName) &&
        !node.hasAttribute('data-h5-group'),
    )
    const indexes = nodes.map((node) => siblings.indexOf(node)).filter((index) => index >= 0)
    if (indexes.length !== nodes.length) return
    const first = Math.min(...indexes)
    const last = Math.max(...indexes)
    const range = siblings.slice(first, last + 1)
    const childPaths = range.flatMap((node) => {
      const path = h5LabPathOf(root, node)
      return path ? [path] : []
    })
    if (childPaths.length < 2) return
    const parentPath = parent === root ? '' : h5LabPathOf(root, parent) ?? ''
    const id = `${labCase.id}-${Date.now().toString(36)}`
    const next: H5LabGroup = {
      id,
      caseId: labCase.id,
      stateId,
      parentPath,
      childPaths,
      label: `编组 ${groups.filter((group) => group.caseId === labCase.id).length + 1}`,
    }
    onGroups([...groups, next], { group: `group|${stateId}|${id}` })
    if (layoutMode) {
      onOverrides(
        h5LabPatchSlot(
          overridesRef.current,
          [stateId],
          h5LabGroupPath(id),
          { style: { layoutMode } },
        ),
        { group: `group|${stateId}|${id}` },
      )
    }
    setMultiSelections([])
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const nextRoot = frameRefs.current.get(stateId)
        const path = h5LabGroupPath(id)
        const node = nextRoot ? h5LabNodeAt(nextRoot, path) : null
        if (!node) return
        onSelect(measure(stateId, path, node))
        remeasure()
      })
    })
    toast(
      layoutMode
        ? `已将 ${childPaths.length} 个元素打组并设为${
            layoutMode === 'horizontal'
              ? '横向布局'
              : layoutMode === 'vertical'
                ? '纵向布局'
                : '自由布局'
          }`
        : `已将 ${childPaths.length} 个元素打组`,
    )
  }, [
    groups,
    labCase.id,
    measure,
    multiSelections,
    onGroups,
    onOverrides,
    onSelect,
    remeasure,
  ])

  useEffect(() => {
    groupSelectionRef.current = groupSelection
  }, [groupSelection])

  const ungroupSelection = useCallback(() => {
    if (!selection) return
    const id = h5LabGroupId(selection.path)
    if (!id) {
      toast('请先选中一个编组')
      return
    }
    const historyGroup = `ungroup|${selection.stateId}|${id}`
    onOverrides(
      h5LabReset(overridesRef.current, selection.stateId, selection.path),
      { group: historyGroup },
    )
    onGroups(groups.filter((group) => group.id !== id), {
      group: historyGroup,
    })
    setMultiSelections([])
    onSelect(null)
    toast('已取消编组')
  }, [groups, onGroups, onOverrides, onSelect, selection])

  const toggleSelectionAutoLayout = useCallback(() => {
    if (!selection || selection.measured.childCount === 0) {
      toast('请选择包含子元素的容器或编组')
      return
    }
    const current = overridesRef.current[selection.stateId]?.[selection.path]?.style
    const enabled = (current?.layoutMode ?? selection.measured.layoutMode) !== 'normal'
    onOverrides(
      h5LabPatchSlot(
        overridesRef.current,
        [selection.stateId],
        selection.path,
        { style: { layoutMode: enabled ? 'normal' : 'vertical' } },
      ),
      { group: `auto-layout|${selection.stateId}|${selection.path}` },
    )
    remeasure()
    toast(enabled ? '已关闭自动布局' : '已启用纵向自动布局')
  }, [onOverrides, remeasure, selection])

  const reorderSelectionStep = useCallback(
    (direction: -1 | 1, toEdge: boolean) => {
      if (!selection) return
      const root = frameRefs.current.get(selection.stateId)
      const node = root ? h5LabNodeAt(root, selection.path) : null
      const parent = node?.parentElement
      if (!root || !node || !parent) return
      const siblings = Array.from(parent.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          !['STYLE', 'SCRIPT', 'BR'].includes(child.tagName),
      )
      const index = siblings.indexOf(node)
      const targetIndex = toEdge
        ? direction > 0
          ? siblings.length - 1
          : 0
        : index + direction
      const target = siblings[targetIndex]
      if (!target || target === node) {
        toast(direction > 0 ? '已在最前层' : '已在最后层')
        return
      }
      const targetPath = target.dataset.h5Group
        ? h5LabGroupPath(target.dataset.h5Group)
        : h5LabPathOf(root, target)
      if (!targetPath) return
      const changed = reorderPath(
        selection.stateId,
        selection.path,
        targetPath,
        direction > 0 ? 'after' : 'before',
      )
      if (changed) toast(direction > 0 ? '已前移一层' : '已后移一层')
    },
    [reorderPath, selection],
  )

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      if (editing) return
      const key = event.key.toLowerCase()
      if ((event.metaKey || event.ctrlKey) && key === 'g') {
        event.preventDefault()
        if (event.shiftKey) ungroupSelection()
        else groupSelection()
        return
      }
      if (event.shiftKey && !event.metaKey && !event.ctrlKey && key === 'a') {
        event.preventDefault()
        toggleSelectionAutoLayout()
        return
      }
      if (!selection) return
      const bracketDirection =
        event.code === 'BracketRight' || event.key === ']' || event.key === '】'
          ? 1
          : event.code === 'BracketLeft' ||
              event.key === '[' ||
              event.key === '【'
            ? -1
            : 0
      if ((event.metaKey || event.ctrlKey) && bracketDirection !== 0) {
        event.preventDefault()
        reorderSelectionStep(bracketDirection, event.shiftKey)
        return
      }
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        const style = overridesRef.current[selection.stateId]?.[selection.path]?.style ?? {}
        const x = style.offsetX ?? 0
        const y = style.offsetY ?? 0
        const patch =
          key === 'arrowleft'
            ? { offsetX: x - step }
            : key === 'arrowright'
              ? { offsetX: x + step }
              : key === 'arrowup'
                ? { offsetY: y - step }
                : { offsetY: y + step }
        onOverrides(
          h5LabPatchSlot(
            overridesRef.current,
            [selection.stateId],
            selection.path,
            { style: patch },
          ),
          { group: `nudge|${selection.stateId}|${selection.path}` },
        )
        remeasure()
      }
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [
    groupSelection,
    onOverrides,
    remeasure,
    reorderSelectionStep,
    selection,
    toggleSelectionAutoLayout,
    ungroupSelection,
  ])

  const beginDrag = useCallback(
    (
      mode:
        | 'move'
        | 'resize'
        | 'resize-x'
        | 'resize-x-start'
        | 'resize-y'
        | 'resize-y-start',
      event: { clientX: number; clientY: number },
    ) => {
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
      const style =
        drag.mode === 'move'
          ? {
              offsetX: Math.round(drag.baseOffsetX + dx),
              offsetY: Math.round(drag.baseOffsetY + dy),
            }
          : drag.mode === 'resize-x'
            ? {
                width: Math.max(8, Math.round(drag.baseW + dx)),
                widthSizing: 'fixed' as const,
              }
            : drag.mode === 'resize-x-start'
              ? {
                  width: Math.max(8, Math.round(drag.baseW - dx)),
                  widthSizing: 'fixed' as const,
                  offsetX:
                    Math.round(drag.baseOffsetX) +
                    drag.baseW -
                    Math.max(8, Math.round(drag.baseW - dx)),
                }
            : drag.mode === 'resize-y'
              ? {
                  height: Math.max(8, Math.round(drag.baseH + dy)),
                  heightSizing: 'fixed' as const,
                }
              : drag.mode === 'resize-y-start'
                ? {
                    height: Math.max(8, Math.round(drag.baseH - dy)),
                    heightSizing: 'fixed' as const,
                    offsetY:
                      Math.round(drag.baseOffsetY) +
                      drag.baseH -
                      Math.max(8, Math.round(drag.baseH - dy)),
                  }
              : {
                  width: Math.max(8, Math.round(drag.baseW + dx)),
                  height: Math.max(8, Math.round(drag.baseH + dy)),
                  widthSizing: 'fixed' as const,
                  heightSizing: 'fixed' as const,
                }
      onOverrides(
        h5LabPatchSlot(current, slotStateIds(drag.stateId, drag.path), drag.path, { style }),
        { group: `drag|${drag.stateId}|${drag.path}|${drag.mode}` },
      )
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
  }, [onOverrides, remeasure, slotStateIds, zoom])

  const onPointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hit = resolve(event.target)
    if (!hit) return
    if (textEditingPath === hit.path) return // 正在改字，别打断光标
    event.preventDefault()
    event.stopPropagation()
    setHoverBox(null)
    setTextEditingPath(null)
    if (event.shiftKey) {
      const picked = measure(hit.stateId, hit.path, hit.el)
      const base = multiSelections.length > 0 ? multiSelections : selection ? [selection] : []
      if (base.some((item) => item.stateId !== picked.stateId)) {
        toast('多选只能在同一个状态帧内完成')
        return
      }
      const exists = base.some((item) => item.path === picked.path)
      const next = exists
        ? base.filter((item) => item.path !== picked.path)
        : [...base, picked]
      setMultiSelections(next)
      onSelect(next.at(-1) ?? null)
      return
    }
    setMultiSelections([])
    if (selection && selection.stateId === hit.stateId && selection.path === hit.path) {
      beginDrag('move', event)
      return
    }
    onFocusFrame?.(hit.stateId)
    onSelect(measure(hit.stateId, hit.path, hit.el))
  }

  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-h5-frame-picker]')
    ) {
      return
    }
    // 状态帧是编辑对象，页面自身的按钮/链接在这里不响应（试交互去应用后的预览）。
    if (textEditingPath === null) {
      event.preventDefault()
      event.stopPropagation()
      // 键盘激活和辅助工具可能只派发 click，也应能选中按钮查看属性。
      if (event.detail === 0) {
        const hit = resolve(event.target)
        if (hit) {
          setMultiSelections([])
          onFocusFrame?.(hit.stateId)
          onSelect(measure(hit.stateId, hit.path, hit.el))
        }
      }
    }
  }

  const onMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const hit = resolve(event.target)
    if (!hit) {
      setHoverBox(null)
      return
    }
    const box = boxOf(hit.el)
    setHoverBox(
      box
        ? {
            ...box,
            label: h5LabLabelOf(hit.el),
            stateId: hit.stateId,
            path: hit.path,
          }
        : null,
    )
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
      onOverrides(
        h5LabPatchSlot(
          overridesRef.current,
          slotStateIds(hit.stateId, hit.path),
          hit.path,
          { text },
        ),
      )
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

  const multiUnion =
    multiBoxes.length > 1
      ? {
          left: Math.min(...multiBoxes.map((box) => box.left)),
          top: Math.min(...multiBoxes.map((box) => box.top)),
          width:
            Math.max(...multiBoxes.map((box) => box.left + box.width)) -
            Math.min(...multiBoxes.map((box) => box.left)),
          height:
            Math.max(...multiBoxes.map((box) => box.top + box.height)) -
            Math.min(...multiBoxes.map((box) => box.top)),
        }
      : null

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-0 w-full overflow-clip"
    >
      <style>{`
        [data-h5-frame]{contain:layout;}
        [data-h5-frame] > .is-embedded{
          height:auto !important;
          min-height:0 !important;
          overflow:visible !important;
          overscroll-behavior:auto !important;
        }
        ${designCss}
        ${css}
        ${
          inspectedDesignToken
            ? `
              [data-h5ds~="c-${inspectedDesignToken}"],
              [data-h5ds~="bg-${inspectedDesignToken}"],
              [data-h5ds~="bd-${inspectedDesignToken}"]{
                outline:1px dashed #9eddbd !important;
                outline-offset:-1px !important;
                box-shadow:inset 0 0 0 9999px rgba(183,235,210,.12) !important;
              }
            `
            : ''
        }
      `}</style>

      {/* ── 多状态画布 ── */}
      <div ref={canvasRef} className="@container relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          className={`h-full w-full overflow-hidden ${
            spaceHeld || panning ? (panning ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          /* 点画布空白处取消选中，面板回到 case 级的全局配置。命中画板里的元素时
             上面那个 capture handler 已经 stopPropagation，这里不会被触发。 */
          onPointerDownCapture={(event) => {
            if (spaceHeld || event.button === 1) {
              event.preventDefault()
              event.stopPropagation()
              panRef.current = {
                px: event.clientX,
                py: event.clientY,
                ox: view.x,
                oy: view.y,
              }
              setPanning(true)
              event.currentTarget.setPointerCapture(event.pointerId)
              return
            }
            if (textEditingPath !== null) return
            if (event.target === event.currentTarget) onSelect(null)
          }}
          onPointerMove={(event) => {
            const pan = panRef.current
            if (!pan) return
            setView((current) => ({
              ...current,
              x: pan.ox + event.clientX - pan.px,
              y: pan.oy + event.clientY - pan.py,
            }))
            remeasure()
          }}
          onPointerUp={() => {
            panRef.current = null
            setPanning(false)
          }}
          onPointerCancel={() => {
            panRef.current = null
            setPanning(false)
          }}
          onDoubleClick={(event) => {
            if (event.target === event.currentTarget) fit()
          }}
        >
          <div
            ref={contentRef}
            className="absolute left-0 top-0 flex w-max origin-top-left items-start gap-8 px-8 pb-16 pt-4"
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${zoom})` }}
            onPointerDownCapture={onPointerDownCapture}
            onClickCapture={onClickCapture}
            onDoubleClick={onDoubleClick}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setHoverBox(null)}
          >
            {frames.map((frame) => {
              const focused = frame.id === focusedStateId
              return (
                <div
                  key={frame.id}
                  className="flex flex-col"
                  style={{ width: labCase.width, gap: 8 * boardUiScale }}
                >
                  <div
                    className="flex w-full items-start"
                    style={{ gap: 6 * boardUiScale }}
                  >
                    <button
                      type="button"
                      data-h5-frame-picker
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelect(null)
                        onFocusFrame?.(frame.id)
                      }}
                      className="flex min-w-0 flex-1 cursor-pointer flex-col items-start overflow-hidden text-left"
                      style={{ gap: 2 * boardUiScale, paddingLeft: 2 * boardUiScale }}
                    >
                      <span
                        className="flex min-w-0 max-w-full items-center"
                        style={{ gap: 8 * boardUiScale }}
                      >
                        {frame.generated && (
                          <span
                            className="shrink-0 rounded-sm bg-[#2f6bff]/12 text-[#2f6bff]"
                            style={{
                              paddingInline: 4 * boardUiScale,
                              fontSize: 10 * boardUiScale,
                              lineHeight: `${16 * boardUiScale}px`,
                            }}
                          >
                            新增
                          </span>
                        )}
                        <span
                          className={`min-w-0 truncate whitespace-nowrap ${
                            focused
                              ? 'font-semibold text-[var(--color-ink)]'
                              : 'font-medium text-[var(--color-ink)]/55'
                          }`}
                          style={{ fontSize: 13 * boardUiScale }}
                        >
                          {frame.label}
                        </span>
                        {focused && (
                          <span
                            className="shrink-0 rounded-full bg-[#d4ebff] font-semibold text-[#357ef8]"
                            style={{
                              paddingInline: 6 * boardUiScale,
                              paddingBlock: boardUiScale,
                              fontSize: 10 * boardUiScale,
                            }}
                          >
                            编辑中
                          </span>
                        )}
                      </span>
                      {frame.note && (
                      <span
                          className="block w-full truncate text-[var(--color-ink)]/40"
                          style={{
                            fontSize: 11 * boardUiScale,
                            lineHeight: `${16 * boardUiScale}px`,
                          }}
                          title={frame.note}
                      >
                          {frame.note}
                      </span>
                      )}
                    </button>
                    <div
                      className="flex shrink-0 items-center"
                      style={{ gap: 6 * boardUiScale }}
                    >
                      <div
                        className="relative"
                        ref={addingForFrame === frame.id ? addMenuRef : undefined}
                      >
                        <button
                          type="button"
                          data-h5-frame-picker
                          title="给这一帧新增模块"
                          aria-expanded={addingForFrame === frame.id}
                          onClick={(event) => {
                            event.stopPropagation()
                            onFocusFrame?.(frame.id)
                            setAddingForFrame((current) =>
                              current === frame.id ? null : frame.id,
                            )
                          }}
                          className="flex cursor-pointer items-center whitespace-nowrap rounded-full border border-[var(--divider-soft)] bg-white text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)]"
                          style={{
                            height: 22 * boardUiScale,
                            paddingInline: 8 * boardUiScale,
                            gap: 4 * boardUiScale,
                            fontSize: 11 * boardUiScale,
                          }}
                        >
                          <Plus
                            size={11 * boardUiScale}
                            strokeWidth={2.2}
                          />
                          添加元素
                        </button>
                        {addingForFrame === frame.id && (
                          <div
                            className="thin-scroll absolute right-0 z-20 flex flex-col overflow-y-auto border border-[var(--divider-soft)] bg-white shadow-[0_8px_24px_rgba(16,18,24,0.14)]"
                            style={{
                              top: 26 * boardUiScale,
                              width: 184 * boardUiScale,
                              padding: 4 * boardUiScale,
                              borderRadius: 10 * boardUiScale,
                            }}
                          >
                            <div
                              className="font-medium text-[var(--color-ink)]/45"
                              style={{
                                padding: `${5 * boardUiScale}px ${8 * boardUiScale}px`,
                                fontSize: 10 * boardUiScale,
                              }}
                            >
                              文本
                            </div>
                            {INSERTABLE_COMPONENTS.map((component) => (
                                <button
                                  key={component.kind}
                                  type="button"
                                  data-h5-frame-picker
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    addTextElementToFrame(frame.id, component)
                                  }}
                                  className="flex cursor-pointer flex-col items-start text-left transition-colors hover:bg-[var(--fill-hover)]"
                                  style={{
                                    gap: 2 * boardUiScale,
                                    paddingInline: 8 * boardUiScale,
                                    paddingBlock: 6 * boardUiScale,
                                    borderRadius: 7 * boardUiScale,
                                  }}
                                >
                                  <span
                                    className="font-medium text-[var(--color-ink)]/80"
                                    style={{
                                      fontSize: 12 * boardUiScale,
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {component.label}
                                  </span>
                                  <span
                                    className="text-[var(--color-ink)]/40"
                                    style={{
                                      fontSize: 10.5 * boardUiScale,
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {component.hint}
                                  </span>
                                </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {frame.generated && focused && (
                        <button
                          type="button"
                          title="删除画布"
                          aria-label={`删除画布「${frame.label}」`}
                          data-h5-frame-picker
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteFrame(frame.id)
                          }}
                          className="flex shrink-0 cursor-pointer items-center justify-center rounded text-[var(--color-ink)]/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
                          style={{
                            width: 22 * boardUiScale,
                            height: 22 * boardUiScale,
                          }}
                        >
                          <Trash2 size={12 * boardUiScale} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    data-h5-frame={frame.id}
                    ref={(node) => {
                      if (node) frameRefs.current.set(frame.id, node)
                      else frameRefs.current.delete(frame.id)
                    }}
                    onPointerDown={() => onFocusFrame?.(frame.id)}
                    className="relative overflow-visible shadow-[0_8px_30px_rgba(16,18,24,0.16)]"
                    style={{
                      width: labCase.width,
                      background: labCase.canvasTone,
                      borderRadius: focused ? 0 : 18 * boardUiScale,
                      outline: focused
                        ? `${2 * boardUiScale}px solid #357ef8`
                        : `${boardUiScale}px solid rgba(16,18,24,0.10)`,
                      outlineOffset: focused ? 2 * boardUiScale : 0,
                    }}
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
        {hoverBox &&
          !(
            selection &&
            hoverBox.stateId === selection.stateId &&
            hoverBox.path === selection.path
          ) && (
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

        {multiSelections.length > 1 && (
          <>
            {multiBoxes.map((box, index) => (
              <div
                key={`${multiSelections[index]?.path ?? index}`}
                className="pointer-events-none absolute z-[19] border border-dashed border-[#2f6bff] bg-[#2f6bff]/[0.025]"
                style={box}
              />
            ))}
            {multiUnion && (
              <div
                className="pointer-events-none absolute z-[21] border border-[#2f6bff]/45"
                style={multiUnion}
              >
                <span className="pointer-events-auto absolute -top-[24px] left-0 flex h-5 items-center overflow-hidden rounded bg-[#2f6bff] text-[10px] text-white shadow-sm">
                  <span className="px-1.5">已选 {multiSelections.length} 个</span>
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      groupSelection()
                    }}
                    className="h-full border-l border-white/30 px-1.5 font-medium transition-colors hover:bg-white/20"
                  >
                    打组 ⌘G
                  </button>
                </span>
              </div>
            )}
          </>
        )}

        {/* 选中框 + 手柄 —— 框体不吃事件，点击仍能落到更深的子元素上 */}
        {selection && selectionBox && multiSelections.length <= 1 && (
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
              {selection.kind === 'group' && (
                <button
                  type="button"
                  title="解组（⇧⌘G）"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    ungroupSelection()
                  }}
                  className="pointer-events-auto flex h-[17px] items-center border-l border-white/30 px-1.5 font-medium transition-colors hover:bg-white/20"
                >
                  解组 ⇧⌘G
                </button>
              )}
              <button
                type="button"
                title="标注"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const key = `${selection.stateId}|${selection.path}`
                  setAnnotationPath((current) => (current === key ? null : key))
                  setAnnotationDraft('')
                }}
                className="pointer-events-auto flex h-[17px] items-center gap-0.5 border-l border-white/30 px-1 transition-colors hover:bg-white/20"
              >
                <PencilLine size={9} strokeWidth={2} />
                标注
              </button>
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
              <button
                type="button"
                title="复制元素"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const root = frameRefs.current.get(selection.stateId)
                  const node = root ? h5LabNodeAt(root, selection.path) : null
                  if (!node) {
                    toast.error('当前元素无法复制')
                    return
                  }
                  const html = cleanCopiedElement(node, selection.stateId)
                  copiedElementRef.current = {
                    html,
                    sourceStateId: selection.stateId,
                  }
                  void writeHtmlToClipboard(html)
                    .then(() => toast.success('复制成功'))
                    .catch(() => {
                      // 浏览器拒绝系统剪贴板时，仍保留编辑器内副本供跨画板粘贴。
                      toast.success('复制成功')
                    })
                }}
                className="pointer-events-auto flex size-[17px] items-center justify-center border-l border-white/30 transition-colors hover:bg-white/20"
              >
                <Copy size={9} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="删除元素"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onOverrides(
                    h5LabPatchSlot(
                      overrides,
                      slotStateIds(selection.stateId, selection.path),
                      selection.path,
                      { style: { hidden: true } },
                    ),
                    { group: `delete|${selection.path}` },
                  )
                  onSelect(null)
                }}
                className="pointer-events-auto flex size-[17px] items-center justify-center border-l border-white/30 transition-colors hover:bg-white/20"
              >
                <Trash2 size={9} strokeWidth={2} />
              </button>
            </span>
            {annotationPath === `${selection.stateId}|${selection.path}` && (
              <div
                role="dialog"
                aria-label="添加元素标注"
                className="pointer-events-auto absolute left-0 top-2 z-30 w-64 rounded-xl border border-black/10 bg-white p-2.5 text-[#1c1f23] shadow-[0_12px_30px_rgba(16,18,24,0.18)]"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold">
                  <PencilLine size={11} strokeWidth={2} className="text-[#357ef8]" />
                  标注「{selection.label}」
                </div>
                <textarea
                  autoFocus
                  value={annotationDraft}
                  onChange={(event) => setAnnotationDraft(event.target.value)}
                  placeholder="描述希望如何修改这个元素…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-black/10 px-2 py-1.5 text-[11px] leading-4 outline-none placeholder:text-black/30 focus:border-[#357ef8]/60"
                />
                <div className="mt-2 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAnnotationPath(null)}
                    className="h-7 rounded-md px-2.5 text-[11px] text-black/55 hover:bg-black/[0.04]"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    disabled={!annotationDraft.trim()}
                    onClick={() => {
                      const frame = frames.find((item) => item.id === selection.stateId)
                      onAnnotate(
                        {
                          frameId: selection.stateId,
                          frameLabel: frame?.label ?? selection.stateId,
                          path: selection.path,
                          label: selection.label,
                          tag: selection.tag,
                          text: selection.measured.text || undefined,
                          src: selection.measured.src || undefined,
                        },
                        annotationDraft.trim(),
                      )
                      setAnnotationPath(null)
                      setAnnotationDraft('')
                    }}
                    className="h-7 rounded-md bg-[#357ef8] px-2.5 text-[11px] font-medium text-white hover:bg-[#2a6ede] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    添加标注
                  </button>
                </div>
              </div>
            )}
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
                className={`pointer-events-auto absolute z-10 size-[8px] rounded-[1px] border border-[#2f6bff] bg-white ${pos}`}
                style={{ cursor }}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  beginDrag('resize', event)
                }}
              />
            ))}
            <div
              aria-hidden="true"
              className="pointer-events-auto absolute -left-[5px] bottom-1 top-1 w-[10px]"
              style={{ cursor: 'ew-resize' }}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                beginDrag('resize-x-start', event)
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-auto absolute -right-[5px] bottom-1 top-1 w-[10px]"
              style={{ cursor: 'ew-resize' }}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                beginDrag('resize-x', event)
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-auto absolute -top-[5px] left-1 right-1 h-[10px]"
              style={{ cursor: 'ns-resize' }}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                beginDrag('resize-y-start', event)
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-auto absolute -bottom-[5px] left-1 right-1 h-[10px]"
              style={{ cursor: 'ns-resize' }}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                beginDrag('resize-y', event)
              }}
            />
          </div>
        )}

        {/* 缩放控件属于画布视口，不跟随画板平移或缩放。 */}
        <div className="pointer-events-none absolute inset-0 z-30">
          <div className="pointer-events-auto absolute bottom-4 left-4 rounded-lg border border-[var(--divider-soft)] bg-white/95 px-2.5 py-1.5 text-[10px] text-[var(--color-ink)]/48 shadow-[0_2px_8px_rgba(16,18,24,0.08)] backdrop-blur">
            <span className="font-medium text-[var(--color-ink)]/65">Shift 点选</span>
            <span className="mx-1.5 opacity-35">·</span>
            <span>⌘G 打组</span>
            <span className="mx-1.5 opacity-35">·</span>
            <span>⇧A 自动布局</span>
            <span className="mx-1.5 opacity-35">·</span>
            <span>方向键微移</span>
          </div>
          <div className="pointer-events-auto absolute bottom-4 right-4 flex items-center gap-0.5 rounded-full border border-[var(--divider-soft)] bg-white px-1 py-1 shadow-[0_2px_8px_rgba(16,18,24,0.10)]">
            <button
              type="button"
              title="适应屏幕"
              onClick={fit}
              className="flex size-6 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <Maximize2 size={12} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              title="缩小"
              onClick={() => zoomFromCenter(1 / 1.2)}
              className="flex size-6 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <Minus size={13} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              title="重置为 100%"
              onClick={() => zoomFromCenter(1 / zoom)}
              className="min-w-[42px] rounded-full px-1 text-center text-[11px] tabular-nums text-[var(--color-ink)]/70 transition-colors hover:text-[var(--color-ink)]"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              title="放大"
              onClick={() => zoomFromCenter(1.2)}
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
