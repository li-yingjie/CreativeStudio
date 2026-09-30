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

export interface H5LabHistoryVersion {
  id: string
  workspaceId: string
  label: string
  description: string
  author: H5LabHistoryAuthor
  createdAt: number
  pageIds: string[]
  snapshot: H5LabHistorySnapshot
}

export interface H5LabHistoryAuthor {
  name: string
  avatarUrl: string
}

const HISTORY_LIMIT = 80
const GROUP_IDLE_MS = 750
const HISTORY_BOOT_TIME = Date.now()

function changedPageIds(
  before: H5LabHistorySnapshot,
  next: H5LabHistorySnapshot,
) {
  const changed = new Set<string>()
  const overrideIds = new Set([
    ...Object.keys(before.overrides),
    ...Object.keys(next.overrides),
  ])
  for (const id of overrideIds) {
    if (before.overrides[id] !== next.overrides[id]) changed.add(id)
  }

  const beforeScreens = new Map(
    before.prototype.screens.map((screen) => [screen.id, screen]),
  )
  const nextScreens = new Map(
    next.prototype.screens.map((screen) => [screen.id, screen]),
  )
  for (const id of new Set([...beforeScreens.keys(), ...nextScreens.keys()])) {
    if (
      JSON.stringify(beforeScreens.get(id)) !==
      JSON.stringify(nextScreens.get(id))
    ) {
      changed.add(id)
    }
  }

  const linkKeys = new Set([
    ...Object.keys(before.prototype.links),
    ...Object.keys(next.prototype.links),
  ])
  for (const key of linkKeys) {
    if (
      JSON.stringify(before.prototype.links[key]) !==
      JSON.stringify(next.prototype.links[key])
    ) {
      changed.add(key.split('||')[0])
    }
  }

  const groupStateIds = new Set([
    ...before.prototype.groups.map((group) => group.stateId),
    ...next.prototype.groups.map((group) => group.stateId),
  ])
  for (const stateId of groupStateIds) {
    const beforeGroups = before.prototype.groups.filter(
      (group) => group.stateId === stateId,
    )
    const nextGroups = next.prototype.groups.filter(
      (group) => group.stateId === stateId,
    )
    if (JSON.stringify(beforeGroups) !== JSON.stringify(nextGroups)) {
      changed.add(stateId)
    }
  }

  return [...changed].filter(Boolean)
}

function historyLabel(group?: string) {
  if (!group) return '画布编辑'
  if (group.startsWith('content|')) return '编辑内容'
  if (group.startsWith('style|')) return '调整样式'
  if (group.startsWith('link|')) return '配置页面交互'
  if (group.startsWith('group|')) return '创建元素编组'
  if (group.startsWith('ungroup|')) return '取消元素编组'
  if (group.startsWith('slot-')) return '同步状态帧'
  if (/move|drag|resize|layout|position/.test(group)) return '调整位置与布局'
  return '自动保存'
}

/** H5 画布草稿历史。覆盖和原型必须放在同一张快照里，否则补屏 +
 * 连线或跨帧覆盖会被拆成不可预期的半步撤销。 */
export function useH5LabHistory(
  initial: H5LabHistorySnapshot,
  author: H5LabHistoryAuthor,
) {
  const [current, setCurrent] = useState(initial)
  const [undoStack, setUndoStack] = useState<H5LabHistorySnapshot[]>([])
  const [redoStack, setRedoStack] = useState<H5LabHistorySnapshot[]>([])
  const [versions, setVersions] = useState<H5LabHistoryVersion[]>([])
  const [currentMeta, setCurrentMeta] = useState({
    id: `draft-${HISTORY_BOOT_TIME.toString(36)}`,
    workspaceId: 'workspace',
    label: '当前版本',
    description: '',
    author,
    createdAt: HISTORY_BOOT_TIME,
    pageIds: [] as string[],
    customLabel: false,
  })
  const currentRef = useRef(current)
  const undoRef = useRef(undoStack)
  const redoRef = useRef(redoStack)
  const versionsRef = useRef(versions)
  const currentMetaRef = useRef(currentMeta)
  const versionSequenceRef = useRef(0)
  const groupRef = useRef<{ key: string; touchedAt: number } | null>(null)
  const workspaceIdRef = useRef('workspace')

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
  const syncVersions = useCallback((next: H5LabHistoryVersion[]) => {
    versionsRef.current = next
    setVersions(next)
  }, [])
  const syncCurrentMeta = useCallback((next: typeof currentMeta) => {
    currentMetaRef.current = next
    setCurrentMeta(next)
  }, [])
  const setWorkspaceId = useCallback(
    (workspaceId: string) => {
      if (workspaceIdRef.current === workspaceId) return
      workspaceIdRef.current = workspaceId
      groupRef.current = null
      const createdAt = Date.now()
      syncCurrentMeta({
        id: `draft-${createdAt.toString(36)}`,
        workspaceId,
        label: '当前版本',
        description: '',
        author,
        createdAt,
        pageIds: [],
        customLabel: false,
      })
    },
    [author, syncCurrentMeta],
  )

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
      const createdAt = Date.now()
      const label = historyLabel(group)
      const pageIds = changedPageIds(before, next)
      if (coalesced && versionsRef.current.length > 0) {
        const previous = versionsRef.current.at(-1)!
        syncVersions([
          ...versionsRef.current.slice(0, -1),
          {
            ...previous,
            label,
            createdAt,
            pageIds: [...new Set([...previous.pageIds, ...pageIds])],
            snapshot: next,
          },
        ])
      } else {
        const version: H5LabHistoryVersion = {
          id: `canvas-${createdAt.toString(36)}-${(versionSequenceRef.current++).toString(36)}`,
          workspaceId: workspaceIdRef.current,
          label,
          description: '',
          author,
          createdAt,
          pageIds,
          snapshot: next,
        }
        syncVersions([...versionsRef.current, version].slice(-HISTORY_LIMIT))
      }
      syncCurrentMeta({
        ...currentMetaRef.current,
        label: currentMetaRef.current.customLabel
          ? currentMetaRef.current.label
          : label,
        createdAt,
        pageIds,
      })
    },
    [author, syncCurrent, syncCurrentMeta, syncRedo, syncUndo, syncVersions],
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
    syncCurrentMeta({
      ...currentMetaRef.current,
      label: currentMetaRef.current.customLabel
        ? currentMetaRef.current.label
        : '撤销修改',
      createdAt: Date.now(),
      pageIds: changedPageIds(before, target),
    })
  }, [syncCurrent, syncCurrentMeta, syncRedo, syncUndo])

  const redo = useCallback(() => {
    const target = redoRef.current[0]
    if (!target) return
    const before = currentRef.current
    syncRedo(redoRef.current.slice(1))
    syncUndo([...undoRef.current, before].slice(-HISTORY_LIMIT))
    groupRef.current = null
    syncCurrent(target)
    syncCurrentMeta({
      ...currentMetaRef.current,
      label: currentMetaRef.current.customLabel
        ? currentMetaRef.current.label
        : '重做修改',
      createdAt: Date.now(),
      pageIds: changedPageIds(before, target),
    })
  }, [syncCurrent, syncCurrentMeta, syncRedo, syncUndo])

  const clear = useCallback(() => {
    groupRef.current = null
    syncUndo([])
    syncRedo([])
  }, [syncRedo, syncUndo])

  const replace = useCallback(
    (next: H5LabHistorySnapshot) => {
      clear()
      syncCurrent(next)
      syncVersions([])
      const createdAt = Date.now()
      syncCurrentMeta({
        id: `draft-${createdAt.toString(36)}`,
        workspaceId: workspaceIdRef.current,
        label: '当前版本',
        description: '',
        author,
        createdAt,
        pageIds: [],
        customLabel: false,
      })
    },
    [author, clear, syncCurrent, syncCurrentMeta, syncVersions],
  )

  const restoreVersion = useCallback(
    (id: string) => {
      const version = versionsRef.current.find((item) => item.id === id)
      if (!version) return
      const before = currentRef.current
      syncUndo([...undoRef.current, before].slice(-HISTORY_LIMIT))
      syncRedo([])
      groupRef.current = null
      syncCurrent(version.snapshot)
      syncCurrentMeta({
        id: `draft-${Date.now().toString(36)}`,
        workspaceId: version.workspaceId,
        label: `恢复：${version.label}`,
        description: version.description,
        author: version.author,
        createdAt: Date.now(),
        pageIds: version.pageIds,
        customLabel: false,
      })
    },
    [syncCurrent, syncCurrentMeta, syncRedo, syncUndo],
  )

  const activateVersion = useCallback(
    (id: string) => {
      const version = versionsRef.current.find((item) => item.id === id)
      if (!version) return
      const before = currentRef.current
      syncUndo([...undoRef.current, before].slice(-HISTORY_LIMIT))
      syncRedo([])
      groupRef.current = null
      syncCurrent(version.snapshot)
      syncVersions(versionsRef.current.filter((item) => item.id !== id))
      syncCurrentMeta({
        id: version.id,
        workspaceId: version.workspaceId,
        label: version.label,
        description: version.description,
        author: version.author,
        createdAt: Date.now(),
        pageIds: version.pageIds,
        customLabel: true,
      })
    },
    [syncCurrent, syncCurrentMeta, syncRedo, syncUndo, syncVersions],
  )

  const updateVersionMetadata = useCallback(
    (id: string, label: string, description: string) => {
      if (id === currentMetaRef.current.id) {
        syncCurrentMeta({
          ...currentMetaRef.current,
          label,
          description,
          customLabel: true,
        })
        return
      }
      syncVersions(
        versionsRef.current.map((version) =>
          version.id === id ? { ...version, label, description } : version,
        ),
      )
    },
    [syncCurrentMeta, syncVersions],
  )

  const deleteVersion = useCallback(
    (id: string) => {
      syncVersions(versionsRef.current.filter((version) => version.id !== id))
    },
    [syncVersions],
  )

  const discardCurrent = useCallback(
    (next: H5LabHistorySnapshot) => {
      clear()
      syncCurrent(next)
      const createdAt = Date.now()
      syncCurrentMeta({
        id: `draft-${createdAt.toString(36)}`,
        workspaceId: workspaceIdRef.current,
        label: '当前版本',
        description: '',
        author,
        createdAt,
        pageIds: [],
        customLabel: false,
      })
    },
    [author, clear, syncCurrent, syncCurrentMeta],
  )

  return {
    overrides: current.overrides,
    prototype: current.prototype,
    setOverrides,
    setPrototype,
    setWorkspaceId,
    undo,
    redo,
    clear,
    replace,
    restoreVersion,
    activateVersion,
    updateVersionMetadata,
    deleteVersion,
    discardCurrent,
    versions,
    currentVersion: {
      id: currentMeta.id,
      workspaceId: currentMeta.workspaceId,
      label: currentMeta.label,
      description: currentMeta.description,
      author: currentMeta.author,
      createdAt: currentMeta.createdAt,
      pageIds: currentMeta.pageIds,
    },
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  }
}
