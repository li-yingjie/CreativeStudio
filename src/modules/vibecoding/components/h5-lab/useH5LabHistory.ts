import { useCallback, useRef, useState } from 'react'
import type { H5LabOverrides } from './h5-lab-overrides'
import type { H5LabPrototype } from './h5-lab-prototype'

export interface H5LabHistorySnapshot {
  overrides: H5LabOverrides
  prototype: H5LabPrototype
}

export interface H5LabHistoryOptions {
  /** 连续输入和 pointermove 共用 group，整段动作只占一个撤销点。 */
  group?: string
}

const HISTORY_LIMIT = 80
const GROUP_IDLE_MS = 750

/** H5 画布草稿历史。覆盖和原型必须放在同一张快照里，否则补屏 +
 * 连线或跨帧覆盖会被拆成不可预期的半步撤销。 */
export function useH5LabHistory(initial: H5LabHistorySnapshot) {
  const [current, setCurrent] = useState(initial)
  const [undoStack, setUndoStack] = useState<H5LabHistorySnapshot[]>([])
  const [redoStack, setRedoStack] = useState<H5LabHistorySnapshot[]>([])
  const currentRef = useRef(current)
  const undoRef = useRef(undoStack)
  const redoRef = useRef(redoStack)
  const groupRef = useRef<{ key: string; touchedAt: number } | null>(null)

  const syncUndo = useCallback((next: H5LabHistorySnapshot[]) => {
    undoRef.current = next
    setUndoStack(next)
  }, [])
  const syncRedo = useCallback((next: H5LabHistorySnapshot[]) => {
    redoRef.current = next
    setRedoStack(next)
  }, [])
  const syncCurrent = useCallback((next: H5LabHistorySnapshot) => {
    currentRef.current = next
    setCurrent(next)
  }, [])

  const commit = useCallback(
    (next: H5LabHistorySnapshot, options?: H5LabHistoryOptions) => {
      const before = currentRef.current
      if (next.overrides === before.overrides && next.prototype === before.prototype) return

      const now = performance.now()
      const group = options?.group
      const coalesced = Boolean(
        group &&
          groupRef.current?.key === group &&
          now - groupRef.current.touchedAt <= GROUP_IDLE_MS,
      )
      if (!coalesced) {
        syncUndo([...undoRef.current, before].slice(-HISTORY_LIMIT))
      }
      groupRef.current = group ? { key: group, touchedAt: now } : null
      syncRedo([])
      syncCurrent(next)
    },
    [syncCurrent, syncRedo, syncUndo],
  )

  const setOverrides = useCallback(
    (overrides: H5LabOverrides, options?: H5LabHistoryOptions) => {
      commit({ ...currentRef.current, overrides }, options)
    },
    [commit],
  )
  const setPrototype = useCallback(
    (prototype: H5LabPrototype, options?: H5LabHistoryOptions) => {
      commit({ ...currentRef.current, prototype }, options)
    },
    [commit],
  )

  const undo = useCallback(() => {
    const target = undoRef.current.at(-1)
    if (!target) return
    const before = currentRef.current
    syncUndo(undoRef.current.slice(0, -1))
    syncRedo([before, ...redoRef.current].slice(0, HISTORY_LIMIT))
    groupRef.current = null
    syncCurrent(target)
  }, [syncCurrent, syncRedo, syncUndo])

  const redo = useCallback(() => {
    const target = redoRef.current[0]
    if (!target) return
    const before = currentRef.current
    syncRedo(redoRef.current.slice(1))
    syncUndo([...undoRef.current, before].slice(-HISTORY_LIMIT))
    groupRef.current = null
    syncCurrent(target)
  }, [syncCurrent, syncRedo, syncUndo])

  const clear = useCallback(() => {
    groupRef.current = null
    syncUndo([])
    syncRedo([])
  }, [syncRedo, syncUndo])

  const replace = useCallback(
    (next: H5LabHistorySnapshot) => {
      clear()
      syncCurrent(next)
    },
    [clear, syncCurrent],
  )

  return {
    overrides: current.overrides,
    prototype: current.prototype,
    setOverrides,
    setPrototype,
    undo,
    redo,
    clear,
    replace,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  }
}
