import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'

/* eslint-disable react-refresh/only-export-components -- the editor component and its tightly coupled controller hook share one small module */

export interface H5EditableItem {
  id: string
  name: string
}

export interface H5LayoutOverride {
  x?: number
  y?: number
  width?: number
  minHeight?: number
  background?: string
  opacity?: number
  borderRadius?: number
  fontSize?: number
}

export interface H5SelectionBox {
  top: number
  left: number
  width: number
  height: number
}

export type H5LayoutOverrides = Record<string, H5LayoutOverride>

interface H5LayoutEditorOptions {
  enabled?: boolean
  selectedId?: string | null
  overrides?: H5LayoutOverrides
  onSelectedIdChange?: (id: string | null) => void
  onOverridesChange?: (overrides: H5LayoutOverrides) => void
  onSelectionBoxChange?: (box: H5SelectionBox | null) => void
}

interface DragState {
  mode: 'move' | 'resize'
  id: string
  startX: number
  startY: number
  baseX: number
  baseY: number
  baseWidth: number
  baseHeight: number
  contentHeight: number
  scale: number
}

const round = (value: number) => Math.round(value)

export function readH5LayoutOverrides(storageKey: string): H5LayoutOverrides {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as H5LayoutOverrides
  } catch {
    return {}
  }
}

export function useH5LayoutEditor(
  storageKey: string,
  options: H5LayoutEditorOptions = {},
) {
  const {
    enabled: controlledEnabled,
    selectedId: controlledSelectedId,
    overrides: controlledOverrides,
    onSelectedIdChange,
    onOverridesChange,
    onSelectionBoxChange,
  } = options
  const pageRef = useRef<HTMLElement>(null)
  const [internalEnabled, setInternalEnabled] = useState(() =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('edit') === '1',
  )
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)
  const [selectionBox, setSelectionBox] = useState<H5SelectionBox | null>(null)
  const [internalOverrides, setInternalOverrides] = useState<H5LayoutOverrides>(() =>
    readH5LayoutOverrides(storageKey),
  )
  const dragRef = useRef<DragState | null>(null)

  const enabled = controlledEnabled ?? internalEnabled
  const selectedId = controlledSelectedId === undefined
    ? internalSelectedId
    : controlledSelectedId
  const overrides = controlledOverrides ?? internalOverrides
  const overridesRef = useRef(overrides)
  useEffect(() => {
    overridesRef.current = overrides
  }, [overrides])

  const setOverrides = useCallback(
    (update: H5LayoutOverrides | ((current: H5LayoutOverrides) => H5LayoutOverrides)) => {
      const next = typeof update === 'function' ? update(overridesRef.current) : update
      overridesRef.current = next
      if (controlledOverrides === undefined) setInternalOverrides(next)
      onOverridesChange?.(next)
    },
    [controlledOverrides, onOverridesChange],
  )

  const setSelectedId = useCallback(
    (id: string | null) => {
      if (controlledSelectedId === undefined) setInternalSelectedId(id)
      onSelectedIdChange?.(id)
    },
    [controlledSelectedId, onSelectedIdChange],
  )

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(overrides))
  }, [overrides, storageKey])

  const setEnabled = useCallback((next: boolean) => {
    if (controlledEnabled === undefined) setInternalEnabled(next)
    if (!next) setSelectedId(null)
  }, [controlledEnabled, setSelectedId])

  const editProps = useCallback((id: string, name: string) => {
    const value = overrides[id] ?? {}
    const style: CSSProperties = {}
    if (value.x || value.y) style.translate = `${value.x ?? 0}px ${value.y ?? 0}px`
    if (value.width) style.width = value.width
    if (value.minHeight) style.minHeight = value.minHeight
    if (value.background) style.background = value.background
    if (value.opacity !== undefined) style.opacity = value.opacity
    if (value.borderRadius !== undefined) style.borderRadius = value.borderRadius
    if (value.fontSize !== undefined) style.fontSize = value.fontSize
    return {
      'data-wgh-edit-id': id,
      'data-wgh-edit-name': name,
      style,
    }
  }, [overrides])

  const measureSelection = useCallback(() => {
    const page = pageRef.current
    if (!enabled || !page || !selectedId) {
      setSelectionBox(null)
      return
    }
    const element = page.querySelector<HTMLElement>(`[data-wgh-edit-id="${selectedId}"]`)
    if (!element) return
    const shell = page.parentElement
    const shellRect = shell?.getBoundingClientRect() ?? page.getBoundingClientRect()
    const pageRect = page.getBoundingClientRect()
    // PhoneMockup scales the entire H5 with CSS transform. DOM rects are in
    // viewport pixels, while the overlay lives in the page's unscaled local
    // coordinate system, so convert before positioning the selection frame.
    const scale = page.offsetWidth > 0 ? pageRect.width / page.offsetWidth : 1
    const rect = element.getBoundingClientRect()
    setSelectionBox({
      top: (rect.top - shellRect.top) / scale + (shell?.scrollTop ?? 0),
      left: (rect.left - shellRect.left) / scale + (shell?.scrollLeft ?? 0),
      width: rect.width / scale,
      height: rect.height / scale,
    })
  }, [enabled, selectedId])

  useEffect(() => {
    onSelectionBoxChange?.(selectionBox)
  }, [onSelectionBoxChange, selectionBox])

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(measureSelection)
    return () => window.cancelAnimationFrame(frame)
  }, [measureSelection, overrides])

  useEffect(() => {
    window.addEventListener('resize', measureSelection)
    const shell = pageRef.current?.parentElement
    shell?.addEventListener('scroll', measureSelection, { passive: true })
    return () => {
      window.removeEventListener('resize', measureSelection)
      shell?.removeEventListener('scroll', measureSelection)
    }
  }, [measureSelection])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      event.preventDefault()
      const dx = (event.clientX - drag.startX) / drag.scale
      const dy = (event.clientY - drag.startY) / drag.scale
      setOverrides((current) => ({
        ...current,
        [drag.id]: drag.mode === 'move'
          ? { ...current[drag.id], x: round(drag.baseX + dx), y: round(drag.baseY + dy) }
          : {
              ...current[drag.id],
              width: Math.max(40, round(drag.baseWidth + dx)),
              minHeight: Math.max(drag.contentHeight, round(drag.baseHeight + dy)),
            },
      }))
    }
    const end = () => { dragRef.current = null }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [setOverrides])

  const onCanvasPointerDownCapture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!enabled) return
    const target = event.target as HTMLElement
    const element = target.closest<HTMLElement>('[data-wgh-edit-id]')
    if (!element || !pageRef.current?.contains(element)) return
    event.preventDefault()
    event.stopPropagation()
    const id = element.dataset.wghEditId
    if (!id) return
    const value = overrides[id] ?? {}
    const rect = element.getBoundingClientRect()
    const pageRect = pageRef.current.getBoundingClientRect()
    const scale = pageRef.current.offsetWidth > 0
      ? pageRect.width / pageRef.current.offsetWidth
      : 1
    setSelectedId(id)
    dragRef.current = {
      mode: 'move',
      id,
      startX: event.clientX,
      startY: event.clientY,
      baseX: value.x ?? 0,
      baseY: value.y ?? 0,
      baseWidth: value.width ?? rect.width / scale,
      baseHeight: value.minHeight ?? rect.height / scale,
      contentHeight: element.scrollHeight,
      scale,
    }
  }, [enabled, overrides, setSelectedId])

  const onResizePointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!selectedId || !pageRef.current) return
    event.preventDefault()
    event.stopPropagation()
    const element = pageRef.current.querySelector<HTMLElement>(`[data-wgh-edit-id="${selectedId}"]`)
    if (!element) return
    const value = overrides[selectedId] ?? {}
    const rect = element.getBoundingClientRect()
    const pageRect = pageRef.current.getBoundingClientRect()
    const scale = pageRef.current.offsetWidth > 0
      ? pageRect.width / pageRef.current.offsetWidth
      : 1
    dragRef.current = {
      mode: 'resize',
      id: selectedId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: value.x ?? 0,
      baseY: value.y ?? 0,
      baseWidth: value.width ?? rect.width / scale,
      baseHeight: value.minHeight ?? rect.height / scale,
      contentHeight: element.scrollHeight,
      scale,
    }
  }, [overrides, selectedId])

  const updateSelected = useCallback((key: keyof H5LayoutOverride, value: number) => {
    if (!selectedId) return
    setOverrides((current) => ({ ...current, [selectedId]: { ...current[selectedId], [key]: round(value) } }))
  }, [selectedId, setOverrides])

  const resetSelected = useCallback(() => {
    if (!selectedId) return
    setOverrides((current) => {
      const next = { ...current }
      delete next[selectedId]
      return next
    })
  }, [selectedId, setOverrides])

  const resetAll = useCallback(() => {
    setOverrides({})
    setSelectedId(null)
  }, [setOverrides, setSelectedId])

  return {
    pageRef,
    enabled,
    setEnabled,
    selectedId,
    setSelectedId,
    selectionBox,
    overrides,
    editProps,
    onCanvasPointerDownCapture,
    onResizePointerDown,
    updateSelected,
    resetSelected,
    resetAll,
  }
}

export function H5LayoutEditorChrome({
  items,
  enabled,
  setEnabled,
  selectedId,
  setSelectedId,
  selectionBox,
  overrides,
  onResizePointerDown,
  updateSelected,
  resetSelected,
  resetAll,
}: {
  items: H5EditableItem[]
  enabled: boolean
  setEnabled: (next: boolean) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectionBox: H5SelectionBox | null
  overrides: H5LayoutOverrides
  onResizePointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  updateSelected: (key: keyof H5LayoutOverride, value: number) => void
  resetSelected: () => void
  resetAll: () => void
}) {
  const selected = items.find((item) => item.id === selectedId)
  const value = selectedId ? overrides[selectedId] ?? {} : {}
  return (
    <>
      <button className="wgh-editor-toggle" type="button" onClick={() => setEnabled(!enabled)}>
        {enabled ? '退出布局编辑' : '编辑布局'}
      </button>
      <H5LayoutSelectionOverlay
        items={items}
        enabled={enabled}
        selectedId={selectedId}
        selectionBox={selectionBox}
        onResizePointerDown={onResizePointerDown}
      />
      {enabled && (
        <aside className="wgh-editor-panel" aria-label="H5 布局编辑器">
          <header><strong>布局编辑器</strong><button type="button" onClick={() => setEnabled(false)}>×</button></header>
          <p>点击页面元素后拖动位置；拖拽蓝框右下角调整宽度与最小高度。</p>
          <label>
            编辑元素
            <select value={selectedId ?? ''} onChange={(event) => setSelectedId(event.target.value || null)}>
              <option value="">请选择</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          {selected && (
            <div className="wgh-editor-fields">
              {([
                ['x', 'X 偏移', value.x ?? 0],
                ['y', 'Y 偏移', value.y ?? 0],
                ['width', '宽度', value.width ?? round(selectionBox?.width ?? 0)],
                ['minHeight', '最小高度', value.minHeight ?? round(selectionBox?.height ?? 0)],
              ] as const).map(([key, label, fieldValue]) => (
                <label key={key}>{label}<input type="number" value={fieldValue} onChange={(event) => updateSelected(key, Number(event.target.value))} /></label>
              ))}
              <button type="button" onClick={resetSelected}>重置当前元素</button>
            </div>
          )}
          <footer><button type="button" onClick={resetAll}>重置全部调整</button><small>调整自动保存在本机浏览器</small></footer>
        </aside>
      )}
    </>
  )
}

export function H5LayoutSelectionOverlay({
  items,
  enabled,
  selectedId,
  selectionBox,
  onResizePointerDown,
}: {
  items: H5EditableItem[]
  enabled: boolean
  selectedId: string | null
  selectionBox: H5SelectionBox | null
  onResizePointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
}) {
  const selected = items.find((item) => item.id === selectedId)
  if (!enabled || !selectionBox || !selected) return null
  return (
    <div
      className="wgh-editor-selection"
      style={{
        top: selectionBox.top,
        left: selectionBox.left,
        width: selectionBox.width,
        height: selectionBox.height,
      }}
    >
      <span>{selected.name}</span>
      <button
        type="button"
        aria-label={`调整${selected.name}大小`}
        onPointerDown={onResizePointerDown}
      />
    </div>
  )
}
