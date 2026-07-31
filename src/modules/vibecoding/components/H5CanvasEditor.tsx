import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  Minus,
  Plus,
  RotateCcw,
  Trash2,
} from '@/shared/icons'
import H5LayerEditPanel, {
  type H5LayerId,
  type H5Selection,
} from './H5LayerEditPanel'
import {
  H5_CANVAS_HEIGHT,
  H5_CANVAS_WIDTH,
  screenDeltaToCanvas,
  type H5CanvasNode,
} from './H5CanvasModel'
import { useH5CanvasStore } from './H5CanvasStore'
import MarketingH5Preview from './MarketingH5Preview'
import type { MarketingH5PreviewConfig } from './MarketingH5ConfigData'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.6
const ZOOM_STEP = 0.1
const DEFAULT_ZOOM = 0.9

interface H5CanvasEditorProps {
  projectName: string
  preview: MarketingH5PreviewConfig
  selection: H5Selection | null
  onSelect: (selection: H5Selection | null) => void
  onClose: () => void
  leftInset?: number
}

interface DragState {
  pointerId: number
  nodeId: string
  startClientX: number
  startClientY: number
  startX: number
  startY: number
}

export default function H5CanvasEditor({
  projectName,
  preview,
  selection,
  onSelect,
  onClose,
  leftInset = 0,
}: H5CanvasEditorProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const stageRef = useRef<HTMLElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const nodes = useH5CanvasStore((state) => state.nodes)
  const selectedNodeId = useH5CanvasStore((state) => state.selectedNodeId)
  const pastLength = useH5CanvasStore((state) => state.past.length)
  const futureLength = useH5CanvasStore((state) => state.future.length)
  const selectNode = useH5CanvasStore((state) => state.selectNode)
  const beginInteraction = useH5CanvasStore((state) => state.beginInteraction)
  const moveNode = useH5CanvasStore((state) => state.moveNode)
  const endInteraction = useH5CanvasStore((state) => state.endInteraction)
  const updateNode = useH5CanvasStore((state) => state.updateNode)
  const duplicateNode = useH5CanvasStore((state) => state.duplicateNode)
  const copyNode = useH5CanvasStore((state) => state.copyNode)
  const pasteNode = useH5CanvasStore((state) => state.pasteNode)
  const removeNode = useH5CanvasStore((state) => state.removeNode)
  const reorderNode = useH5CanvasStore((state) => state.reorderNode)
  const toggleNodeVisible = useH5CanvasStore((state) => state.toggleNodeVisible)
  const toggleNodeLocked = useH5CanvasStore((state) => state.toggleNodeLocked)
  const undo = useH5CanvasStore((state) => state.undo)
  const redo = useH5CanvasStore((state) => state.redo)

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? null

  useEffect(() => {
    selectNode(null)
    onSelect(null)
    return () => selectNode(null)
  }, [onSelect, selectNode])

  const updateZoom = (next: number) => {
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2)))))
  }

  const syncSelection = (id: string | null) => {
    selectNode(id)
    if (!id) {
      onSelect(null)
      return
    }
    const node = useH5CanvasStore
      .getState()
      .nodes.find((candidate) => candidate.id === id)
    onSelect(node ? { type: 'layer', layer: node.kind as H5LayerId } : null)
  }

  const clearSelection = () => syncSelection(null)

  const duplicateAndSelect = (id: string, interactive = false) => {
    const nextId = duplicateNode(id, interactive)
    if (nextId) syncSelection(nextId)
    return nextId
  }

  const onCanvasNodePointerDown = (
    event: React.PointerEvent<HTMLElement>,
    node: H5CanvasNode,
    duplicate: boolean,
  ) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    stageRef.current?.focus({ preventScroll: true })

    const shouldDuplicate = duplicate || event.altKey
    let activeNode = node
    if (shouldDuplicate) {
      const nextId = duplicateAndSelect(node.id, true)
      const nextNode = useH5CanvasStore
        .getState()
        .nodes.find((candidate) => candidate.id === nextId)
      if (!nextNode) return
      activeNode = nextNode
    } else {
      syncSelection(node.id)
      if (node.locked) return
      beginInteraction()
    }

    dragRef.current = {
      pointerId: event.pointerId,
      nodeId: activeNode.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: activeNode.x,
      startY: activeNode.y,
    }
    stageRef.current?.setPointerCapture(event.pointerId)
  }

  const onStagePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const x =
      drag.startX + screenDeltaToCanvas(event.clientX - drag.startClientX, zoom)
    const y =
      drag.startY + screenDeltaToCanvas(event.clientY - drag.startClientY, zoom)
    moveNode(drag.nodeId, Math.round(x), Math.round(y))
  }

  const finishDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    endInteraction()
    if (stageRef.current?.hasPointerCapture(event.pointerId)) {
      stageRef.current.releasePointerCapture(event.pointerId)
    }
  }

  const removeSelected = () => {
    if (!selectedNodeId) return
    removeNode(selectedNodeId)
    clearSelection()
  }

  const onStageKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (
      target.matches('input, textarea, [contenteditable="true"], [role="textbox"]')
    ) {
      return
    }

    const mod = event.metaKey || event.ctrlKey
    if (event.key === 'Escape') {
      event.preventDefault()
      clearSelection()
      return
    }
    if (mod && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
      const currentId = useH5CanvasStore.getState().selectedNodeId
      syncSelection(currentId)
      return
    }
    if (mod && event.key.toLowerCase() === 'd' && selectedNodeId) {
      event.preventDefault()
      duplicateAndSelect(selectedNodeId)
      return
    }
    if (mod && event.key.toLowerCase() === 'c' && selectedNodeId) {
      event.preventDefault()
      copyNode(selectedNodeId)
      return
    }
    if (mod && event.key.toLowerCase() === 'v') {
      event.preventDefault()
      const nextId = pasteNode()
      if (nextId) syncSelection(nextId)
      return
    }
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      selectedNodeId
    ) {
      event.preventDefault()
      removeSelected()
      return
    }
    if (
      selectedNode &&
      !selectedNode.locked &&
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    ) {
      event.preventDefault()
      const amount = event.shiftKey ? 10 : 1
      const patch =
        event.key === 'ArrowLeft'
          ? { x: selectedNode.x - amount }
          : event.key === 'ArrowRight'
            ? { x: selectedNode.x + amount }
            : event.key === 'ArrowUp'
              ? { y: selectedNode.y - amount }
              : { y: selectedNode.y + amount }
      updateNode(selectedNode.id, patch)
    }
  }

  return (
    <section
      aria-label="新春会画布编辑器"
      data-h5-canvas-mode="editor"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]"
    >
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-3">
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
          <h2 className="truncate text-balance text-[13px] font-semibold text-[var(--color-ink)]">
            画布编辑
          </h2>
          <p className="truncate text-pretty text-[10.5px] text-[var(--color-ink)]/45">
            {projectName}
          </p>
        </div>
        <span className="ml-1 rounded-md bg-[var(--fill-subtle)] px-2 py-1 text-[10.5px] tabular-nums text-[var(--color-ink)]/55">
          375 × 1551
        </span>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            aria-label="撤销"
            title="撤销（⌘Z）"
            disabled={pastLength === 0}
            onClick={undo}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <RotateCcw size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="重做"
            title="重做（⇧⌘Z）"
            disabled={futureLength === 0}
            onClick={redo}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <RotateCcw size={13} strokeWidth={1.8} className="-scale-x-100" />
          </button>
          <div className="mx-1 h-4 w-px bg-[var(--divider)]" />
          <button
            type="button"
            aria-label="复制选中对象"
            title="复制（⌘D）"
            disabled={!selectedNodeId}
            onClick={() => selectedNodeId && duplicateAndSelect(selectedNodeId)}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <Copy size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="选中对象上移一层"
            title="上移一层"
            disabled={!selectedNodeId}
            onClick={() => selectedNodeId && reorderNode(selectedNodeId, 'forward')}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowUp size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="选中对象下移一层"
            title="下移一层"
            disabled={!selectedNodeId}
            onClick={() => selectedNodeId && reorderNode(selectedNodeId, 'backward')}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowDown size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="删除选中对象"
            title="删除（Delete）"
            disabled={!selectedNodeId}
            onClick={removeSelected}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
          <div className="mx-1 h-4 w-px bg-[var(--divider)]" />
          <button
            type="button"
            aria-label="缩小画布"
            title="缩小画布"
            onClick={() => updateZoom(zoom - ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
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
            onClick={() => updateZoom(zoom + ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-25"
          >
            <Plus size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(DEFAULT_ZOOM)}
            className="ml-1 flex h-7 items-center rounded-md px-2 text-[11px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            适应画布
          </button>
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

      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        style={{ marginLeft: leftInset }}
      >
        <main
          ref={stageRef}
          tabIndex={0}
          data-h5-canvas-stage
          aria-label="H5 可编辑画布，按方向键移动对象，按住 Option 拖动可复制"
          className="thin-scroll relative min-w-0 flex-1 touch-none overflow-auto bg-[var(--color-surface-1)] px-2 py-8 outline-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--color-ink-10) 1px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) clearSelection()
          }}
          onPointerMove={onStagePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onKeyDown={onStageKeyDown}
        >
          <div
            className="relative mx-auto"
            style={{
              width: H5_CANVAS_WIDTH * zoom,
              height: H5_CANVAS_HEIGHT * zoom,
            }}
          >
            <div
              data-h5-canvas-page
              className="relative border border-[var(--divider)] bg-[#fdf0c3] shadow-lg"
              style={{
                width: H5_CANVAS_WIDTH,
                height: H5_CANVAS_HEIGHT,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) clearSelection()
              }}
            >
              <MarketingH5Preview
                preview={preview}
                onSelect={clearSelection}
                canvasNodes={nodes}
                selectedCanvasNodeId={selectedNodeId}
                onCanvasNodePointerDown={onCanvasNodePointerDown}
              />
            </div>
          </div>

          <div className="pointer-events-none sticky bottom-2 mx-auto mt-6 w-fit rounded-md border border-[var(--divider-soft)] bg-[var(--color-surface-0)]/95 px-3 py-1.5 text-[10.5px] text-[var(--color-ink)]/50 shadow-sm">
            拖动对象移动 · 按住 ⌥ 拖动或拖拽复制把手可生成副本 · 方向键微调
          </div>
        </main>

        {selectedNode && selection && (
          <aside
            aria-label="画布属性"
            className="w-72 shrink-0 border-l border-[var(--divider-soft)]"
          >
            <H5LayerEditPanel
              title="属性"
              selection={selection}
              onClose={clearSelection}
              canvasNode={selectedNode}
              onCanvasNodeChange={(patch) => updateNode(selectedNode.id, patch)}
              onDuplicate={() => duplicateAndSelect(selectedNode.id)}
              onMoveLayer={(direction) => reorderNode(selectedNode.id, direction)}
              onToggleVisible={() => toggleNodeVisible(selectedNode.id)}
              onToggleLocked={() => toggleNodeLocked(selectedNode.id)}
            />
          </aside>
        )}
      </div>
    </section>
  )
}
