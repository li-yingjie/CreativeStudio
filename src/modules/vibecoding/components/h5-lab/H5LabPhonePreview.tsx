import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { ArrowLeft } from '@/shared/icons'
import type { H5LabCase } from './h5-lab-cases'
import { buildH5LabFrames } from './H5LabFrames'
import {
  applyH5LabBoard,
  applyH5LabGroups,
  h5LabCss,
  h5LabPathOf,
  type H5LabOverrides,
} from './h5-lab-overrides'
import {
  applyH5LabPageSettings,
  h5LabPageSettings,
  linkKey,
  type H5LabLink,
  type H5LabPrototype,
} from './h5-lab-prototype'
import { useHostTitle } from './useHostTitle'
import { h5LabDesignCss, h5LabMergeDesign, markH5LabDesign } from './h5-lab-design'

/* 非编辑态的 case 预览 —— 真机框里的一块可滚长页，页面自身的交互照常可用。
   补过交互的热点会按连接关系跳到目标帧，多屏就咬合成可点触原型；顶上的
   状态条和画布上的帧一一对应。 */

interface Props {
  labCase: H5LabCase
  overrides: H5LabOverrides
  prototype: H5LabPrototype
  /** 顶栏页面选择器选中的帧 —— 预览由外面控帧，和画布共用一个选择器。 */
  frameId?: string
  onFrameChange?: (frameId: string) => void
  previewKey?: number
}

export default function H5LabPhonePreview({
  labCase,
  overrides,
  prototype,
  frameId,
  onFrameChange,
  previewKey,
}: Props) {
  // 跳转来路，用于「返回」。
  const [backStack, setBackStack] = useState<string[]>([])
  const [transition, setTransition] = useState<string>('')
  const frameRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef<{ x: number; y: number } | null>(null)
  const pageSettings = useMemo(
    () => h5LabPageSettings(prototype, labCase.id),
    [labCase.id, prototype],
  )
  const design = useMemo(
    () => h5LabMergeDesign(labCase.design, pageSettings.design),
    [labCase.design, pageSettings.design],
  )
  const frames = useMemo(
    () => buildH5LabFrames(labCase, prototype.screens, design),
    [design, labCase, prototype.screens],
  )
  const frame = frames.find((item) => item.id === frameId) ?? frames[0]
  const css = useMemo(
    () =>
      `${h5LabDesignCss(labCase.design, design, pageSettings.designTintImages)}\n${h5LabCss(overrides)}`,
    [design, labCase.design, overrides, pageSettings.designTintImages],
  )

  useHostTitle()

  useLayoutEffect(() => {
    const root = frameRef.current
    if (!root || !frame) return
    applyH5LabGroups(
      root,
      (prototype.groups ?? []).filter((group) => group.stateId === frame.id),
    )
    applyH5LabBoard(root, overrides[frame.id] ?? {})
    applyH5LabPageSettings(root, pageSettings)
  }, [frame, overrides, pageSettings, previewKey, prototype.groups])

  /* 页面是 lazy 组件，挂上来晚于 layout effect；新节点进来时补打设计系统角色。 */
  useEffect(() => {
    const root = frameRef.current
    if (!root || !frame || frame.generated) return
    const mark = () => markH5LabDesign(root, labCase.design)
    mark()
    const observer = new MutationObserver(mark)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [frame, labCase.design, previewKey])

  /* 点到补过交互的热点就跳帧 —— 这是把静态多屏拼成可点触原型的那一下。 */
  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const root = frameRef.current
    if (!root || !frame) return
    if (!(event.target instanceof Element)) return
    // 从点到的节点往上找最近一个接了跳转的祖先 —— 按钮之外的元素（图片、整块
    // 卡片）也能被手动接上交互，所以不能只认 button / a。
    let node: HTMLElement | null =
      event.target instanceof HTMLElement ? event.target : null
    let link: H5LabLink | undefined
    let path: string | null = null
    while (node && root.contains(node)) {
      path = h5LabPathOf(root, node)
      if (path) {
        link = prototype.links[linkKey(frame.id, path)]
        if (link) break
      }
      node = node.parentElement
    }
    if (!link || !frames.some((item) => item.id === link.targetId)) return
    event.preventDefault()
    event.stopPropagation()
    setBackStack((prev) => [...prev, frame.id])
    setTransition(link.transition)
    onFrameChange?.(link.targetId)
  }

  const goBack = () => {
    setBackStack((prev) => {
      const next = [...prev]
      const last = next.pop()
      if (last) onFrameChange?.(last)
      return next
    })
    setTransition('fade')
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pageSettings.swipeBack || backStack.length === 0) return
    swipeRef.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start || !pageSettings.swipeBack || backStack.length === 0) return
    const dx = event.clientX - start.x
    const dy = Math.abs(event.clientY - start.y)
    if (dx > 64 && dx > dy * 1.4) goBack()
  }

  if (!frame) return null

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white">
      <style>{`[data-h5-frame]{contain:layout paint;}\n${css}`}</style>
      {/* 帧切换已经在外层工具栏的选择器上，机身里不再重复一排 chip；
          只有跳帧之后留一颗返回，原型点进去还能退出来。 */}
      {pageSettings.backButton && backStack.length > 0 && (
        <button
          type="button"
          onClick={goBack}
          title="返回上一帧"
          className="absolute left-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/55"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
        </button>
      )}
      <div
        ref={frameRef}
        data-h5-frame={frame.id}
        onClickCapture={onClickCapture}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeRef.current = null
        }}
        className={`thin-scroll min-h-0 flex-1 overflow-y-auto ${
          transition === 'slide'
            ? 'animate-[h5lab-slide_.22s_ease-out]'
            : transition === 'fade'
              ? 'animate-[h5lab-fade_.22s_ease-out]'
              : ''
        }`}
        style={{ background: labCase.canvasTone }}
        key={frame.id}
      >
        <Suspense
          fallback={
            <div
              className="grid h-full place-items-center text-[12px] text-white/70"
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
}
