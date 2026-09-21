import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  GripVertical,
  Image as ImageIcon,
  Inbox,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Trash2,
} from '@/shared/icons'
import type { TowerDefenseAssetLibraryProps } from './TowerDefenseAssetLibrary'
import type { SpriteTask, TowerDefenseAsset, TowerDefenseDirection } from './TowerDefenseFlowModel'
import {
  applyCatalogPreviewTool,
  CatalogFollowToolBar,
  downloadNamedSrc,
  SetCurrentChip,
  type CatalogCoverActionId,
} from './TowerDefenseCatalogPreviewBar'
import { canvasVisualRecordId, createCanvasSpareFromUpload, spareRequiresAssetImport, type CanvasSpareTile } from './TowerDefenseCanvasSpares'
import { readTowerDefenseUploadImage } from './TowerDefenseUpload'
import {
  CANVAS_ZOOM_STEP,
  canvasPanFromPointer,
  followSelectionToolbarBox,
  canvasTileId,
  canvasWorldPoint,
  canvasZoomFromWheel,
  canvasZoomTowardPoint,
  clampCanvasZoom,
  isCanvasSpacePanTarget,
  expandMaxWidth,
  expandedGroupSize,
  groupShowsExpandControl,
  groupShowsStack,
  isCanvasSpareKey,
  layoutFromPositions,
  nextCoverRecordId,
  objectTileBox,
  packShelfColumns,
  positionsFromRects,
  pushAsideForExpand,
  scaleObjectTileBox,
  SHELF,
  shelfColumnCount,
  shelfGroupSize,
  tileScaleFromCornerDrag,
  wrapObjectTileIndexes,
  type CanvasTileSelection,
  type ObjectTileSize,
  type ShelfBox,
  type TileResizeCorner,
} from './TowerDefenseCanvasModel'

export type { CanvasTileSelection }

export type CanvasSlotTarget =
  | { kind: 'base'; assetId: string }
  | { kind: 'state'; assetId: string; stateId: string }
  | { kind: 'direction'; assetId: string; stateId: string; direction: TowerDefenseDirection }

export type CanvasSlotRecord =
  | { id: string; kind: 'visual'; versionIndex: number; label: string; src?: string; width?: number; height?: number }
  | { id: string; kind: 'dynamic'; taskId: string; label: string; src: string; width?: number; height?: number; detail: string }

export type CanvasSlotDescriptor = {
  key: string
  target: CanvasSlotTarget
  asset: TowerDefenseAsset
  title: string
  records: CanvasSlotRecord[]
  current: CanvasSlotRecord
  enabled: boolean
  pending?: boolean
  forceEmpty?: boolean
}

type SpareTile = CanvasSpareTile

type GroupState = {
  tileIds: string[]
  expanded: boolean
}

type PressState =
  | { kind: 'board'; pointerId: number }
  | { kind: 'pan'; pointerId: number; startX: number; startY: number; originX: number; originY: number }
  | { kind: 'group'; key: string; pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number }
  | { kind: 'tile'; key: string; recordId: string; pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number; originX: number; originY: number }
  | { kind: 'resize'; key: string; recordId: string; corner: TileResizeCorner; pointerId: number; startX: number; startY: number; originScale: number; startWidth: number; startHeight: number }
  | { kind: 'spare'; id: string; pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number }

type DragState =
  | { kind: 'group'; key: string; pointerId: number; x: number; y: number }
  | { kind: 'tile'; key: string; recordId: string; pointerId: number; offsetX: number; offsetY: number; x: number; y: number }
  | { kind: 'spare'; id: string; pointerId: number; x: number; y: number }

const SHELF_SHIFT = 'left 160ms cubic-bezier(0.22, 1, 0.36, 1), top 160ms cubic-bezier(0.22, 1, 0.36, 1)'

function recordMap(records: CanvasSlotRecord[]) {
  return new Map(records.map((record) => [record.id, record]))
}

function applyCover(
  target: CanvasSlotTarget,
  record: CanvasSlotRecord,
  handlers: {
    onReferenceChange?: TowerDefenseAssetLibraryProps['onReferenceChange']
    onAssignDirectionMaterial?: TowerDefenseAssetLibraryProps['onAssignDirectionMaterial']
    onUpdateState?: TowerDefenseAssetLibraryProps['onUpdateState']
    asset: TowerDefenseAsset
  },
) {
  if (record.kind === 'visual') {
    if (target.kind === 'base') handlers.onReferenceChange?.(handlers.asset.id, record.versionIndex)
    else if (target.kind === 'direction') handlers.onAssignDirectionMaterial?.(handlers.asset.id, target.stateId, target.direction, record.versionIndex)
    else handlers.onAssignDirectionMaterial?.(handlers.asset.id, target.stateId, handlers.asset.states.find((state) => state.id === target.stateId)?.directions[0] ?? 'front', record.versionIndex)
    return
  }
  if (target.kind === 'base') return
  const state = handlers.asset.states.find((item) => item.id === target.stateId)
  if (!state) return
  const direction = target.kind === 'direction' ? target.direction : state.directions[0]
  if (!direction) return
  const next = { ...(state.directionMaterialRefs ?? {}) }
  delete next[direction]
  handlers.onUpdateState?.(handlers.asset.id, state.id, { directionMaterialRefs: next })
}

function clearCover(
  target: CanvasSlotTarget,
  asset: TowerDefenseAsset,
  handlers: {
    onReferenceChange?: TowerDefenseAssetLibraryProps['onReferenceChange']
    onUpdateState?: TowerDefenseAssetLibraryProps['onUpdateState']
  },
) {
  if (target.kind === 'base') {
    handlers.onReferenceChange?.(asset.id, null)
    return
  }
  const state = asset.states.find((item) => item.id === target.stateId)
  if (!state) return
  if (target.kind === 'state') {
    handlers.onUpdateState?.(asset.id, state.id, { materialRef: undefined })
    return
  }
  const next = { ...(state.directionMaterialRefs ?? {}) }
  delete next[target.direction]
  handlers.onUpdateState?.(asset.id, state.id, { directionMaterialRefs: next })
}

function recordObjectBox(record?: Pick<CanvasSlotRecord, 'width' | 'height'>, scale = 1) {
  return scale === 1 ? objectTileBox(record?.width, record?.height) : scaleObjectTileBox(record?.width, record?.height, scale)
}

const TILE_RESIZE_HANDLES: Array<{ corner: TileResizeCorner; className: string }> = [
  { corner: 'nw', className: 'left-0 top-0 cursor-nwse-resize' },
  { corner: 'ne', className: 'left-full top-0 cursor-nesw-resize' },
  { corner: 'sw', className: 'left-0 top-full cursor-nesw-resize' },
  { corner: 'se', className: 'left-full top-full cursor-nwse-resize' },
]

function TileArtwork({
  record,
  title,
  pending,
  rotation = 0,
  flipped = false,
  squarePreview = false,
  fit = 'token',
}: {
  record?: CanvasSlotRecord
  title: string
  pending?: boolean
  rotation?: number
  flipped?: boolean
  squarePreview?: boolean
  fit?: 'token' | 'object'
}) {
  if (pending) {
    return <span className="grid size-full place-items-center bg-[#f2f3f5] text-[9px] font-medium text-[#161823]/38">生成中</span>
  }
  if (record?.src) {
    return (
      <img
        src={record.src}
        alt={title}
        draggable={false}
        className={`block size-full bg-white ${fit === 'object' && !squarePreview ? 'object-contain' : 'object-cover'}`}
        style={{ transform: `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})` }}
      />
    )
  }
  return <span className="grid size-full place-items-center bg-[#f2f3f5] text-[9px] text-[#161823]/32"><span className="flex flex-col items-center gap-1"><ImageIcon className="size-5" />空素材</span></span>
}

function pointerDistance(from: { x: number; y: number }, to: { x: number; y: number }) {
  return Math.hypot(to.x - from.x, to.y - from.y)
}

export default function TowerDefenseAssetCanvas({
  slots,
  tasks,
  spares: persistedSpares = [],
  onSparesChange,
  onAddVisualVersion,
  onReferenceChange,
  onAssignDirectionMaterial,
  onUpdateState,
  onAttachAsset,
  onCreateSprite,
  onRegenerateAsset,
}: {
  slots: CanvasSlotDescriptor[]
  tasks: SpriteTask[]
  spares?: CanvasSpareTile[]
  onSparesChange?: (spares: CanvasSpareTile[]) => void
  onAddVisualVersion?: TowerDefenseAssetLibraryProps['onAddVisualVersion']
  onReferenceChange?: TowerDefenseAssetLibraryProps['onReferenceChange']
  onAssignDirectionMaterial?: TowerDefenseAssetLibraryProps['onAssignDirectionMaterial']
  onUpdateState?: TowerDefenseAssetLibraryProps['onUpdateState']
  onAttachAsset?: TowerDefenseAssetLibraryProps['onAttachAsset']
  onCreateSprite?: TowerDefenseAssetLibraryProps['onCreateSprite']
  onRegenerateAsset?: TowerDefenseAssetLibraryProps['onRegenerateAsset']
}) {
  void tasks
  const canvasRootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(960)
  const [order, setOrder] = useState<string[]>([])
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [groups, setGroups] = useState<Record<string, GroupState>>({})
  const [spares, setSparesState] = useState<SpareTile[]>(persistedSpares)
  const commitSpares = (updater: SpareTile[] | ((current: SpareTile[]) => SpareTile[])) => {
    setSparesState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      onSparesChange?.(next)
      return next
    })
  }
  const [hiddenTileIds, setHiddenTileIds] = useState<Record<string, string[]>>({})
  const [press, setPress] = useState<PressState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dropKey, setDropKey] = useState<string | null>(null)
  const [selected, setSelected] = useState<CanvasTileSelection | null>(null)
  const [tileScales, setTileScales] = useState<Record<string, number>>({})
  const [previewRotation, setPreviewRotation] = useState(0)
  const [previewFlipped, setPreviewFlipped] = useState(false)
  const [previewSquare, setPreviewSquare] = useState(false)
  const [previewInfo, setPreviewInfo] = useState(false)
  const [followPos, setFollowPos] = useState<{ x: number; y: number } | null>(null)
  const followBarRef = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = useState(false)
  const [shelfReady, setShelfReady] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [spaceHeld, setSpaceHeld] = useState(false)
  const pressRef = useRef<PressState | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const zoomRef = useRef(1)
  const panRef = useRef(pan)
  const spaceHeldRef = useRef(false)
  pressRef.current = press
  dragRef.current = drag
  zoomRef.current = zoom
  panRef.current = pan
  spaceHeldRef.current = spaceHeld

  const toBoardPoint = (clientX: number, clientY: number) => {
    const viewport = viewportRef.current?.getBoundingClientRect()
    if (!viewport) return { x: 0, y: 0 }
    return canvasWorldPoint(clientX, clientY, viewport, panRef.current, zoomRef.current)
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const update = () => setCanvasWidth(Math.max(320, viewport.clientWidth))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShelfReady(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const root = canvasRootRef.current
    if (!root) return
    const onWheel = (event: WheelEvent) => {
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      const viewport = viewportRef.current?.getBoundingClientRect()
      const nextZoom = canvasZoomFromWheel(zoomRef.current, event.deltaY)
      if (viewport) {
        setPan((current) => canvasZoomTowardPoint(zoomRef.current, nextZoom, event.clientX, event.clientY, viewport, current).pan)
      }
      setZoom(nextZoom)
    }
    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return
      if (!isCanvasSpacePanTarget(event.target)) return
      event.preventDefault()
      setSpaceHeld(true)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      setSpaceHeld(false)
    }
    const onBlur = () => setSpaceHeld(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    const keys = slots.map((slot) => slot.key)
    setOrder((current) => {
      const keep = current.filter((key) => keys.includes(key) || isCanvasSpareKey(key))
      const incoming = keys.filter((key) => !keep.includes(key))
      if (incoming.length === 0) return keep
      let lastSlot = -1
      keep.forEach((key, index) => {
        if (keys.includes(key)) lastSlot = index
      })
      if (lastSlot === -1) return [...incoming, ...keep]
      return [...keep.slice(0, lastSlot + 1), ...incoming, ...keep.slice(lastSlot + 1)]
    })
    setGroups((current) => {
      const next = { ...current }
      slots.forEach((slot) => {
        const existing = next[slot.key]
        const hidden = new Set(hiddenTileIds[slot.key] ?? [])
        const seeded = slot.records.map((record) => record.id).filter((id) => !hidden.has(id))
        if (!existing) {
          next[slot.key] = { tileIds: seeded, expanded: false }
          return
        }
        const known = new Set([...existing.tileIds, ...hidden])
        const incoming = seeded.filter((id) => !known.has(id))
        next[slot.key] = { ...existing, tileIds: incoming.length ? [...existing.tileIds, ...incoming] : existing.tileIds }
      })
      return next
    })
  }, [hiddenTileIds, slots])

  const slotByKey = useMemo(() => new Map(slots.map((slot) => [slot.key, slot])), [slots])
  const spareById = useMemo(() => new Map(spares.map((spare) => [spare.id, spare])), [spares])

  const tileDisplaySize = (key: string, record: CanvasSlotRecord) => (
    recordObjectBox(record, tileScales[canvasTileId(key, record.id)] ?? 1)
  )

  const groupTileSizes = (key: string, tiles: CanvasSlotRecord[]): ObjectTileSize[] => (
    tiles.map((record) => tileDisplaySize(key, record))
  )

  const groupGuideWidths = (tiles: CanvasSlotRecord[]) => tiles.map((record) => recordObjectBox(record).width)

  const groupTileRows = (tiles: CanvasSlotRecord[], maxWidth: number) => {
    const innerMax = Math.max(SHELF.tile, maxWidth - SHELF.pad * 2 - SHELF.frame)
    return wrapObjectTileIndexes(groupGuideWidths(tiles), innerMax).map((row) => row.map((index) => tiles[index]).filter(Boolean))
  }

  const orderedKeys = useMemo(() => {
    const knownSlots = new Set(slots.map((slot) => slot.key))
    const knownSpares = new Set(spares.map((spare) => spare.id))
    const listed = order.filter((key) => knownSlots.has(key) || knownSpares.has(key))
    slots.forEach((slot) => {
      if (!listed.includes(slot.key)) listed.push(slot.key)
    })
    spares.forEach((spare) => {
      if (!listed.includes(spare.id)) listed.push(spare.id)
    })
    return listed
  }, [order, slots, spares])

  const shelfBoxes = useMemo<ShelfBox[]>(() => {
    const cols = shelfColumnCount(canvasWidth)
    return orderedKeys.map((key, index) => {
      const spare = spareById.get(key)
      if (spare) return { key, width: SHELF.collapsedWidth, height: SHELF.collapsedHeight }
      const slot = slotByKey.get(key)
      const group = groups[key]
      const records = slot ? recordMap(slot.records) : new Map()
      const tiles = (group?.tileIds ?? slot?.records.map((record) => record.id) ?? [])
        .map((id) => records.get(id))
        .filter((item): item is CanvasSlotRecord => Boolean(item))
      const tileCount = tiles.length
      const empty = Boolean(slot?.forceEmpty) || tileCount === 0
      return {
        key,
        ...shelfGroupSize({
          expanded: Boolean(group?.expanded),
          tileCount,
          empty,
          maxWidth: expandMaxWidth(canvasWidth, index % cols),
          tileSizes: group?.expanded ? groupTileSizes(key, tiles) : undefined,
          guideWidths: group?.expanded ? groupGuideWidths(tiles) : undefined,
        }),
      }
    })
  }, [canvasWidth, groups, orderedKeys, slotByKey, spareById, tileScales])

  const packed = useMemo(
    () => layoutFromPositions(shelfBoxes, positions, canvasWidth),
    [canvasWidth, positions, shelfBoxes],
  )
  useEffect(() => {
    setPositions((current) => {
      const known = new Set(orderedKeys)
      const pruned = Object.fromEntries(Object.entries(current).filter(([key]) => known.has(key)))
      const missing = shelfBoxes.some((box) => pruned[box.key] == null)
      const prunedChanged = Object.keys(pruned).length !== Object.keys(current).length
      if (!missing && !prunedChanged) return current
      return positionsFromRects(layoutFromPositions(shelfBoxes, pruned, canvasWidth))
    })
  }, [canvasWidth, orderedKeys, shelfBoxes])

  useEffect(() => {
    if (!selected) return
    const group = groups[selected.groupKey]
    if (group?.tileIds.includes(selected.recordId)) return
    const spare = spareById.get(selected.groupKey)
    if (spare?.record.id === selected.recordId) return
    setSelected(null)
  }, [groups, selected, spareById])

  useEffect(() => {
    setPreviewRotation(0)
    setPreviewFlipped(false)
    setPreviewSquare(false)
    setPreviewInfo(false)
  }, [selected?.groupKey, selected?.recordId])

  useLayoutEffect(() => {
    if (!selected || drag || press?.kind === 'resize') {
      setFollowPos(null)
      return
    }
    const root = canvasRootRef.current
    const node = boardRef.current?.querySelector<HTMLElement>('[data-tile-selected="true"]')
    const bar = followBarRef.current
    if (!root || !node || !bar) return
    const view = root.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    setFollowPos(followSelectionToolbarBox(
      { x: box.left - view.left, y: box.top - view.top, width: box.width, height: box.height },
      { width: bar.offsetWidth, height: bar.offsetHeight },
      { width: view.width, height: view.height },
    ))
  }, [drag, packed, pan, previewInfo, press?.kind, selected, tileScales, zoom])

  const groupAtPoint = (clientX: number, clientY: number, except?: string) => {
    const nodes = boardRef.current?.querySelectorAll<HTMLElement>('[data-slot-group]')
    if (!nodes) return null
    for (const node of nodes) {
      const key = node.dataset.slotGroup
      if (!key || key === except) continue
      const rect = node.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return key
    }
    return null
  }

  const setGroup = (key: string, patch: Partial<GroupState> | ((current: GroupState) => GroupState)) => {
    setGroups((current) => {
      const group = current[key] ?? { tileIds: [], expanded: false }
      return { ...current, [key]: typeof patch === 'function' ? patch(group) : { ...group, ...patch } }
    })
  }

  const expandGroup = (key: string) => {
    const slot = slotByKey.get(key)
    const group = groups[key]
    const records = slot ? recordMap(slot.records) : new Map()
    const tiles = (group?.tileIds ?? slot?.records.map((record) => record.id) ?? [])
      .map((id) => records.get(id))
      .filter((item): item is CanvasSlotRecord => Boolean(item))
    if (tiles.length < 2) return
    const newSize = expandedGroupSize(groupTileSizes(key, tiles), expandMaxWidth(canvasWidth), groupGuideWidths(tiles))
    const pushed = pushAsideForExpand(packed, key, { width: newSize.width, height: newSize.height }, canvasWidth, orderedKeys)
    setGroup(key, { expanded: true })
    setPositions(positionsFromRects(pushed))
  }

  const yieldGroupForResize = (key: string) => {
    const slot = slotByKey.get(key)
    const group = groups[key]
    if (!slot || !group?.expanded) return
    const records = recordMap(slot.records)
    const tiles = group.tileIds.map((id) => records.get(id)).filter((item): item is CanvasSlotRecord => Boolean(item))
    const newSize = expandedGroupSize(groupTileSizes(key, tiles), expandMaxWidth(canvasWidth), groupGuideWidths(tiles))
    const pushed = pushAsideForExpand(packed, key, { width: newSize.width, height: newSize.height }, canvasWidth, orderedKeys)
    setPositions(positionsFromRects(pushed))
  }

  const useAsCover = (slot: CanvasSlotDescriptor, record: CanvasSlotRecord) => {
    applyCover(slot.target, record, { asset: slot.asset, onReferenceChange, onAssignDirectionMaterial, onUpdateState })
  }

  const promoteOrClear = (slot: CanvasSlotDescriptor, remainingIds: string[], deletedId: string) => {
    const records = recordMap(slot.records)
    const nextId = nextCoverRecordId(remainingIds, slot.current.id, deletedId)
    if (!nextId) {
      clearCover(slot.target, slot.asset, { onReferenceChange, onUpdateState })
      setGroup(slot.key, (group) => ({ ...group, expanded: false }))
      return
    }
    const nextRecord = records.get(nextId)
    if (nextRecord) useAsCover(slot, nextRecord)
    if (remainingIds.length < 2) setGroup(slot.key, { expanded: false })
  }

  const moveToSpare = (slot: CanvasSlotDescriptor, record: CanvasSlotRecord) => {
    const group = groups[slot.key]
    if (!group) return
    const remaining = group.tileIds.filter((id) => id !== record.id)
    const spare: SpareTile = {
      id: `spare-${canvasTileId(slot.key, record.id)}-${Date.now()}`,
      record,
      sourceAssetId: slot.asset.id,
    }
    setHiddenTileIds((current) => ({ ...current, [slot.key]: [...(current[slot.key] ?? []), record.id] }))
    setGroup(slot.key, { tileIds: remaining })
    commitSpares((current) => [...current, spare])
    setOrder((current) => (current.includes(spare.id) ? current : [...current, spare.id]))
    if (slot.current.id === record.id) promoteOrClear(slot, remaining, record.id)
    return spare
  }

  const deleteTile = (slot: CanvasSlotDescriptor, record: CanvasSlotRecord) => {
    const group = groups[slot.key]
    if (!group) return
    const remaining = group.tileIds.filter((id) => id !== record.id)
    setHiddenTileIds((current) => ({ ...current, [slot.key]: [...(current[slot.key] ?? []), record.id] }))
    setGroup(slot.key, { tileIds: remaining })
    if (slot.current.id === record.id) promoteOrClear(slot, remaining, record.id)
    else if (remaining.length < 2) setGroup(slot.key, { expanded: false })
  }

  const detachSpare = (spare: SpareTile) => {
    commitSpares((current) => current.filter((item) => item.id !== spare.id))
    setOrder((current) => current.filter((key) => key !== spare.id))
    setPositions((current) => {
      const next = { ...current }
      delete next[spare.id]
      return next
    })
  }

  const joinSpareToGroup = (slotKey: string, spare: SpareTile) => {
    const slot = slotByKey.get(slotKey)
    if (!slot) return
    const existingIds = groups[slotKey]?.tileIds ?? []
    let record = spare.record
    if (spareRequiresAssetImport(spare, slot.asset.id)) {
      if (spare.record.kind !== 'visual' || !spare.record.src) return
      const versionIndex = onAddVisualVersion?.(slot.asset.id, {
        id: `spare-join-${Date.now()}`,
        src: spare.record.src,
        width: spare.record.width ?? 512,
        height: spare.record.height ?? 512,
        source: 'upload',
        label: spare.record.label,
      })
      if (versionIndex == null || versionIndex < 0) return
      record = {
        id: canvasVisualRecordId(versionIndex),
        kind: 'visual',
        versionIndex,
        label: spare.record.label,
        src: spare.record.src,
        width: spare.record.width,
        height: spare.record.height,
      }
    }
    setHiddenTileIds((current) => ({
      ...current,
      [slotKey]: (current[slotKey] ?? []).filter((id) => id !== record.id && id !== spare.record.id),
    }))
    if (!existingIds.includes(record.id)) {
      setGroup(slotKey, (group) => ({ ...group, tileIds: [...group.tileIds, record.id] }))
    }
    detachSpare(spare)
    if (existingIds.length === 0 || slot.forceEmpty) useAsCover(slot, record)
  }

  const addSpareFromFile = (file: File, clientX: number, clientY: number) => {
    const board = boardRef.current
    if (!board) return
    const drop = toBoardPoint(clientX, clientY)
    setUploading(true)
    void readTowerDefenseUploadImage(file)
      .then((version) => {
        const spare = createCanvasSpareFromUpload(version)
        commitSpares((current) => [...current, spare])
        setOrder((current) => (current.includes(spare.id) ? current : [...current, spare.id]))
        setPositions((current) => ({ ...current, [spare.id]: { x: drop.x, y: drop.y } }))
      })
      .finally(() => setUploading(false))
  }

  const capturePointer = (pointerId: number) => {
    viewportRef.current?.setPointerCapture(pointerId)
  }

  const startPan = (event: ReactPointerEvent) => {
    event.preventDefault()
    setPress({
      kind: 'pan',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: panRef.current.x,
      originY: panRef.current.y,
    })
    capturePointer(event.pointerId)
  }

  const persistBoardPoint = (key: string, x: number, y: number) => {
    setPositions((current) => ({ ...current, [key]: { x, y } }))
  }

  const onBoardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const currentPress = pressRef.current
    const currentDrag = dragRef.current
    if (currentPress && event.pointerId === currentPress.pointerId && !currentDrag) {
      if (currentPress.kind === 'pan') {
        setPan(canvasPanFromPointer(
          { x: currentPress.originX, y: currentPress.originY },
          { x: currentPress.startX, y: currentPress.startY },
          { x: event.clientX, y: event.clientY },
        ))
        return
      }
      if (currentPress.kind === 'resize') {
        const scale = zoomRef.current || 1
        setTileScales((current) => ({
          ...current,
          [canvasTileId(currentPress.key, currentPress.recordId)]: tileScaleFromCornerDrag(
            currentPress.originScale,
            { width: currentPress.startWidth, height: currentPress.startHeight },
            currentPress.corner,
            { width: (event.clientX - currentPress.startX) / scale, height: (event.clientY - currentPress.startY) / scale },
          ),
        }))
        return
      }
      if (currentPress.kind === 'board') return
      const distance = pointerDistance({ x: currentPress.startX, y: currentPress.startY }, { x: event.clientX, y: event.clientY })
      if (distance >= SHELF.dragThreshold) {
        const scale = zoomRef.current || 1
        if (currentPress.kind === 'group') {
          const slotBox = packed[currentPress.key]
          setDrag({
            kind: 'group',
            key: currentPress.key,
            pointerId: currentPress.pointerId,
            x: (slotBox?.x ?? 0) + (event.clientX - currentPress.startX) / scale,
            y: (slotBox?.y ?? 0) + (event.clientY - currentPress.startY) / scale,
          })
        } else if (currentPress.kind === 'tile') {
          setDrag({
            kind: 'tile',
            key: currentPress.key,
            recordId: currentPress.recordId,
            pointerId: currentPress.pointerId,
            offsetX: currentPress.offsetX,
            offsetY: currentPress.offsetY,
            x: currentPress.originX + (event.clientX - currentPress.startX) / scale,
            y: currentPress.originY + (event.clientY - currentPress.startY) / scale,
          })
        } else {
          const spareBox = packed[currentPress.id]
          setDrag({
            kind: 'spare',
            id: currentPress.id,
            pointerId: currentPress.pointerId,
            x: (spareBox?.x ?? 0) + (event.clientX - currentPress.startX) / scale,
            y: (spareBox?.y ?? 0) + (event.clientY - currentPress.startY) / scale,
          })
        }
        return
      }
    }
    if (!currentDrag || event.pointerId !== currentDrag.pointerId) return
    const point = toBoardPoint(event.clientX, event.clientY)
    if (currentDrag.kind === 'group') {
      setDrag({
        ...currentDrag,
        x: point.x - (pressRef.current?.kind === 'group' ? pressRef.current.offsetX : 0),
        y: point.y - (pressRef.current?.kind === 'group' ? pressRef.current.offsetY : 0),
      })
      return
    }
    if (currentDrag.kind === 'spare') {
      const pressOffset = pressRef.current?.kind === 'spare' ? pressRef.current : null
      setDrag({
        ...currentDrag,
        x: point.x - (pressOffset?.offsetX ?? 0),
        y: point.y - (pressOffset?.offsetY ?? 0),
      })
      setDropKey(groupAtPoint(event.clientX, event.clientY))
      return
    }
    setDrag({
      ...currentDrag,
      x: point.x - currentDrag.offsetX,
      y: point.y - currentDrag.offsetY,
    })
    setDropKey(groupAtPoint(event.clientX, event.clientY, currentDrag.key))
  }

  const onBoardPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const currentPress = pressRef.current
    const currentDrag = dragRef.current
    if (currentPress && event.pointerId === currentPress.pointerId && !currentDrag) {
      if (currentPress.kind === 'tile') {
        setSelected({ groupKey: currentPress.key, recordId: currentPress.recordId })
      } else if (currentPress.kind === 'resize') {
        yieldGroupForResize(currentPress.key)
      } else if (currentPress.kind === 'spare') {
        const spare = spareById.get(currentPress.id)
        if (spare) setSelected({ groupKey: spare.id, recordId: spare.record.id })
      } else if (currentPress.kind === 'group') {
        const slot = slotByKey.get(currentPress.key)
        const coverId = slot?.current.id ?? groups[currentPress.key]?.tileIds[0]
        if (coverId) setSelected({ groupKey: currentPress.key, recordId: coverId })
      } else if (currentPress.kind === 'board') {
        setSelected(null)
      }
      setPress(null)
      setDropKey(null)
      return
    }
    if (!currentDrag || event.pointerId !== currentDrag.pointerId) {
      setPress(null)
      return
    }
    if (currentDrag.kind === 'group') {
      persistBoardPoint(currentDrag.key, currentDrag.x, currentDrag.y)
    } else if (currentDrag.kind === 'spare') {
      const key = groupAtPoint(event.clientX, event.clientY)
      const spare = spares.find((item) => item.id === currentDrag.id)
      if (key && spare) joinSpareToGroup(key, spare)
      else persistBoardPoint(currentDrag.id, currentDrag.x, currentDrag.y)
    } else if (currentDrag.kind === 'tile') {
      const source = groupAtPoint(event.clientX, event.clientY)
      const slot = slotByKey.get(currentDrag.key)
      const record = slot ? recordMap(slot.records).get(currentDrag.recordId) : undefined
      if (slot && record && source !== currentDrag.key) {
        const spare = moveToSpare(slot, record)
        if (source && spare) joinSpareToGroup(source, spare)
        else if (spare) persistBoardPoint(spare.id, currentDrag.x, currentDrag.y)
      }
    }
    setPress(null)
    setDrag(null)
    setDropKey(null)
  }

  const startGroupPress = (event: ReactPointerEvent, key: string) => {
    if (event.button !== 0) return
    if (spaceHeldRef.current) {
      startPan(event)
      return
    }
    const target = event.target as HTMLElement
    if (target.closest('button,a,input,[data-group-tile]')) return
    const slotBox = packed[key]
    const board = boardRef.current
    if (!slotBox || !board) return
    const point = toBoardPoint(event.clientX, event.clientY)
    setPress({
      kind: 'group',
      key,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: point.x - slotBox.x,
      offsetY: point.y - slotBox.y,
    })
    capturePointer(event.pointerId)
  }

  const startResizePress = (event: ReactPointerEvent, key: string, record: CanvasSlotRecord, corner: TileResizeCorner) => {
    if (event.button !== 0) return
    if (spaceHeldRef.current) {
      startPan(event)
      return
    }
    event.stopPropagation()
    event.preventDefault()
    const box = tileDisplaySize(key, record)
    setSelected({ groupKey: key, recordId: record.id })
    setPress({
      kind: 'resize',
      key,
      recordId: record.id,
      corner,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originScale: tileScales[canvasTileId(key, record.id)] ?? 1,
      startWidth: box.width,
      startHeight: box.height,
    })
    capturePointer(event.pointerId)
  }

  const startTilePress = (event: ReactPointerEvent, key: string, record: CanvasSlotRecord) => {
    if (event.button !== 0) return
    if (spaceHeldRef.current) {
      startPan(event)
      return
    }
    const target = event.target as HTMLElement
    if (target.closest('button,a,input,[data-tile-resize]')) return
    const board = boardRef.current
    if (!board) return
    event.stopPropagation()
    const tile = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const tileOrigin = toBoardPoint(tile.left, tile.top)
    const scale = zoomRef.current || 1
    setPress({
      kind: 'tile',
      key,
      recordId: record.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: (event.clientX - tile.left) / scale,
      offsetY: (event.clientY - tile.top) / scale,
      originX: tileOrigin.x,
      originY: tileOrigin.y,
    })
    capturePointer(event.pointerId)
  }

  const startSparePress = (event: ReactPointerEvent, spare: SpareTile) => {
    if (event.button !== 0) return
    if (spaceHeldRef.current) {
      startPan(event)
      return
    }
    const target = event.target as HTMLElement
    if (target.closest('button,a,input')) return
    const spareBox = packed[spare.id]
    const board = boardRef.current
    if (!spareBox || !board) return
    const point = toBoardPoint(event.clientX, event.clientY)
    setPress({
      kind: 'spare',
      id: spare.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: point.x - spareBox.x,
      offsetY: point.y - spareBox.y,
    })
    capturePointer(event.pointerId)
  }

  const removeSpare = (id: string) => {
    commitSpares((current) => current.filter((item) => item.id !== id))
    setOrder((current) => current.filter((key) => key !== id))
    setPositions((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const tidyBoard = () => {
    const nextOrder = [...slots.map((slot) => slot.key), ...spares.map((spare) => spare.id)]
    const boxesByKey = new Map(shelfBoxes.map((box) => [box.key, box]))
    const tidied = nextOrder.map((key) => boxesByKey.get(key)).filter((box): box is ShelfBox => Boolean(box))
    setOrder(nextOrder)
    setPositions(positionsFromRects(packShelfColumns(tidied, canvasWidth)))
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const selectedRecord = selected
    ? spareById.get(selected.groupKey)?.record ?? recordMap(slotByKey.get(selected.groupKey)?.records ?? []).get(selected.recordId)
    : undefined
  const selectedSpare = selected ? spareById.get(selected.groupKey) : undefined
  const selectedSlot = selected ? slotByKey.get(selected.groupKey) : undefined
  const selectedActionAssetId = selectedSpare?.sourceAssetId ?? selectedSlot?.asset.id
  const selectedActionLabel = selectedRecord?.label ?? selectedSlot?.title ?? '素材'
  const selectedActionVersion = selectedRecord?.kind === 'visual' ? Math.max(0, selectedRecord.versionIndex) : (selectedSlot?.asset.selectedVisualVersion ?? 0)
  const runCoverAction = (id: CatalogCoverActionId) => {
    if (id === 'sprite' && selectedActionAssetId) onCreateSprite?.(selectedActionAssetId, selectedActionVersion, selectedActionLabel)
    else if (id === 'regenerate' && selectedActionAssetId) onRegenerateAsset?.(selectedActionAssetId, selectedActionLabel)
    else if (id === 'attach' && selectedActionAssetId) onAttachAsset?.(selectedActionAssetId, selectedActionLabel)
    else if (id === 'download') downloadNamedSrc(selectedRecord?.src, `${selectedActionLabel}.webp`)
  }

  const draggingKey = drag?.kind === 'group' ? drag.key : drag?.kind === 'spare' ? drag.id : null
  const dragPos = drag && (drag.kind === 'group' || drag.kind === 'spare') ? { x: drag.x, y: drag.y } : null
  const panning = press?.kind === 'pan'

  const dropFiles = (event: { preventDefault: () => void; clientX: number; clientY: number; dataTransfer: DataTransfer | null }) => {
    const file = event.dataTransfer?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    event.preventDefault()
    const overGroup = groupAtPoint(event.clientX, event.clientY)
    if (overGroup) {
      const slot = slotByKey.get(overGroup)
      if (!slot) return
      setUploading(true)
      void readTowerDefenseUploadImage(file)
        .then((version) => {
          const versionIndex = onAddVisualVersion?.(slot.asset.id, {
            id: `canvas-upload-${Date.now()}`,
            src: version.src,
            width: version.width,
            height: version.height,
            source: 'upload',
            label: version.label,
          })
          if (versionIndex == null || versionIndex < 0) return
          const record: CanvasSlotRecord = {
            id: canvasVisualRecordId(versionIndex),
            kind: 'visual',
            versionIndex,
            label: version.label,
            src: version.src,
            width: version.width,
            height: version.height,
          }
          setGroup(slot.key, (group) => (
            group.tileIds.includes(record.id) ? group : { ...group, tileIds: [...group.tileIds, record.id] }
          ))
          if (slot.forceEmpty || !slot.current.src) useAsCover(slot, record)
        })
        .finally(() => setUploading(false))
      return
    }
    addSpareFromFile(file, event.clientX, event.clientY)
  }

  return (
    <div ref={canvasRootRef} className="relative flex h-full min-h-0 flex-col">
    <div className="relative z-0 min-h-0 w-full flex-1 overflow-hidden">
    <div
      ref={viewportRef}
      data-infinite-canvas=""
      data-space-pan={spaceHeld ? 'true' : 'false'}
      data-panning={panning ? 'true' : 'false'}
      className={`relative z-0 isolate size-full overflow-hidden bg-[#f5f6f8] ${spaceHeld ? (panning ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(22,24,35,0.08) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        const target = event.target as HTMLElement
        if (target.closest('[data-canvas-edit-bar],button,a,input')) return
        if (spaceHeldRef.current) {
          startPan(event)
          return
        }
        if (target.closest('[data-slot-group],[data-spare-cell]')) return
        setPress({ kind: 'board', pointerId: event.pointerId })
      }}
      onPointerMove={onBoardPointerMove}
      onPointerUp={onBoardPointerUp}
      onPointerCancel={onBoardPointerUp}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('Files')) event.preventDefault()
      }}
      onDrop={dropFiles}
    >
      <div
        ref={boardRef}
        aria-label="素材库画布"
        data-board-zoom={zoom}
        data-board-pan-x={pan.x}
        data-board-pan-y={pan.y}
        data-selected-group={selected?.groupKey ?? ''}
        data-selected-record={selected?.recordId ?? ''}
        className="absolute left-0 top-0 select-none"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
      >
        {uploading && (
          <div className="pointer-events-none sr-only" aria-live="polite">正在读取图片…</div>
        )}

        {draggingKey && packed[draggingKey] && (
          <div
            data-shelf-placeholder
            aria-hidden
            className="absolute rounded-2xl border border-dashed border-[#357ef8]/35 bg-[#357ef8]/[0.06]"
            style={{ left: packed[draggingKey].x, top: packed[draggingKey].y, width: packed[draggingKey].width, height: packed[draggingKey].height }}
          />
        )}

        {orderedKeys.map((key, index) => {
          const spare = spareById.get(key)
          if (spare) {
            const spareBox = packed[key] ?? { x: SHELF.originX, y: SHELF.originY, width: SHELF.collapsedWidth, height: SHELF.collapsedHeight, col: 0, row: 0 }
            const draggingSpare = drag?.kind === 'spare' && drag.id === spare.id
            const isSelected = selected?.groupKey === spare.id && selected.recordId === spare.record.id
            return (
              <article
                key={spare.id}
                data-spare-cell={spare.id}
                data-shelf-index={index}
                data-grid-col={spareBox.col}
                data-grid-row={spareBox.row}
                data-board-x={spareBox.x}
                data-board-y={spareBox.y}
                data-tile-selected={isSelected ? 'true' : 'false'}
                aria-label={`备用素材 ${spare.record.label}`}
                style={{
                  left: draggingSpare && dragPos ? dragPos.x : spareBox.x,
                  top: draggingSpare && dragPos ? dragPos.y : spareBox.y,
                  width: SHELF.collapsedWidth,
                  height: SHELF.collapsedHeight,
                  transition: draggingSpare || !shelfReady ? 'none' : SHELF_SHIFT,
                }}
                onPointerDown={(event) => startSparePress(event, spare)}
                className={`absolute z-20 ${draggingSpare ? 'z-40 cursor-grabbing' : 'cursor-grab hover:z-30'}`}
              >
                <div className={`overflow-hidden rounded-2xl border border-dashed bg-white shadow-[0_10px_28px_rgba(31,35,41,0.08)] ${isSelected ? 'border-[#357ef8]/50 ring-2 ring-[#357ef8]' : 'border-[#357ef8]/40'}`}>
                  <div className="relative aspect-square bg-[#f2f3f5]">
                    <TileArtwork
                      record={spare.record}
                      title={spare.record.label}
                      fit="token"
                      rotation={isSelected ? previewRotation : 0}
                      flipped={isSelected ? previewFlipped : false}
                      squarePreview={isSelected ? previewSquare : false}
                    />
                    <span className="pointer-events-none absolute left-1.5 top-1.5 rounded bg-[#eaf2ff] px-1.5 py-0.5 text-[8px] font-medium text-[#357ef8]">备用</span>
                    <button
                      type="button"
                      aria-label={`删除备用素材 ${spare.record.label}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => removeSpare(spare.id)}
                      className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md bg-white/94 text-[#161823]/50 hover:text-rose-500"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <Inbox className="size-3 text-[#161823]/34" />
                  <span className="truncate text-[11px] font-semibold text-[#161823]">{spare.record.label}</span>
                </div>
                <p className="mt-0.5 text-[8px] text-[#161823]/38">备用素材</p>
              </article>
            )
          }
          const slot = slotByKey.get(key)
          if (!slot) return null
          const group = groups[key] ?? { tileIds: slot.records.map((record) => record.id), expanded: false }
          const records = recordMap(slot.records)
          const tiles = group.tileIds.map((id) => records.get(id)).filter((item): item is CanvasSlotRecord => Boolean(item))
          const cover = records.get(slot.current.id) ?? tiles[0]
          const canToggle = groupShowsExpandControl(tiles.length) && !slot.forceEmpty
          const stacked = groupShowsStack(tiles.length) && !group.expanded
          const empty = tiles.length === 0 || slot.forceEmpty
          const size = empty || !group.expanded
            ? shelfGroupSize({ expanded: false, tileCount: tiles.length, empty })
            : expandedGroupSize(groupTileSizes(key, tiles), expandMaxWidth(canvasWidth, index % shelfColumnCount(canvasWidth)), groupGuideWidths(tiles))
          const slotBox = packed[key] ?? { x: SHELF.originX, y: SHELF.originY, col: 0, row: 0, ...size }
          const draggingGroup = drag?.kind === 'group' && drag.key === key
          const draggingTileId = drag?.kind === 'tile' && drag.key === key ? drag.recordId : null
          const collapsedSelected = Boolean(!group.expanded && selected?.groupKey === key && selected.recordId === cover?.id)
          const peekTiles = tiles.filter((item) => item.id !== cover?.id).slice(0, 2)
          const frameTone = dropKey === key
            ? 'border-[#357ef8] ring-2 ring-[#357ef8]/20'
            : slot.enabled
              ? 'border-black/[0.08]'
              : 'border-dashed border-black/20'
          return (
            <article
              key={key}
              data-slot-group={key}
              data-group-expanded={group.expanded ? 'true' : 'false'}
              data-shelf-index={index}
              data-grid-col={slotBox.col}
              data-grid-row={slotBox.row}
              data-pack-h={size.height}
              data-pack-y={slotBox.y}
              data-board-x={slotBox.x}
              data-board-y={slotBox.y}
              aria-label={`${slot.title}素材组`}
              style={{
                left: draggingGroup ? drag.x : slotBox.x,
                top: draggingGroup ? drag.y : slotBox.y,
                width: size.width,
                height: size.height,
                transition: draggingGroup || press?.kind === 'resize' || !shelfReady ? 'none' : SHELF_SHIFT,
              }}
              data-expand-capped="false"
              className={`group/stack absolute ${draggingGroup ? 'z-40' : dropKey === key ? 'z-30' : 'z-10 hover:z-20'}`}
            >
              <div className={`overflow-visible rounded-2xl ${slot.enabled ? '' : 'opacity-60'}`}>
                {empty ? (
                  <div
                    data-group-surface
                    onPointerDown={(event) => startGroupPress(event, key)}
                    className={`grid aspect-square place-items-center rounded-2xl border border-dashed bg-[#f4f5f7] text-[9px] text-[#161823]/36 shadow-[0_8px_24px_rgba(31,35,41,0.06)] ${draggingGroup ? 'cursor-grabbing' : 'cursor-grab'} ${dropKey === key ? 'border-[#357ef8] ring-2 ring-[#357ef8]/20' : 'border-black/15'}`}
                  >
                    <span className="flex flex-col items-center gap-1"><ImageIcon className="size-5" />空槽位 · 拖入备用素材</span>
                  </div>
                ) : group.expanded ? (
                  <div data-group-frame="light" className={`overflow-visible rounded-2xl border bg-white shadow-[0_12px_32px_rgba(31,35,41,0.08)] ${frameTone}`}>
                    <div
                      data-group-grip
                      onPointerDown={(event) => startGroupPress(event, key)}
                      className={`flex h-11 shrink-0 items-center gap-2 border-b border-black/[0.06] bg-[#f7f7f8] px-3 text-[#161823] ${draggingGroup ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <GripVertical className="size-3.5 shrink-0 text-[#161823]/35" />
                      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{slot.title}</span>
                      <span className="shrink-0 text-[8px] text-[#161823]/38">{tiles.length} 张</span>
                    </div>
                    <div
                      data-group-pad
                      data-group-scroll="false"
                      onPointerDown={(event) => startGroupPress(event, key)}
                      style={{ height: size.padHeight }}
                      className={`flex flex-col content-start gap-2 overflow-visible bg-[#f7f7f8] p-3 ${draggingGroup ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      {groupTileRows(tiles, expandMaxWidth(canvasWidth, index % shelfColumnCount(canvasWidth))).map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} data-group-row={rowIndex} className="flex flex-row items-start gap-2">
                          {row.map((record) => {
                        const isCover = slot.current.id === record.id
                        const coverMissing = !tiles.some((item) => item.id === slot.current.id)
                        const showCollapse = canToggle && (isCover || (coverMissing && record.id === tiles[0].id))
                        const lifting = draggingTileId === record.id
                        const isSelected = selected?.groupKey === key && selected.recordId === record.id
                        const box = tileDisplaySize(key, record)
                        const showHandles = isSelected || press?.kind === 'resize' && press.recordId === record.id
                        return (
                          <div
                            key={record.id}
                            data-group-tile={record.id}
                            data-tile-selected={isSelected ? 'true' : 'false'}
                            data-tile-fit="object"
                            data-tile-scale={tileScales[canvasTileId(key, record.id)] ?? 1}
                            aria-selected={isSelected}
                            onPointerDown={(event) => startTilePress(event, key, record)}
                            style={{ width: box.width, height: box.height }}
                            className={`group relative shrink-0 rounded-[4px] bg-white ${showHandles ? 'overflow-visible' : 'overflow-hidden'} ${isSelected ? 'border border-transparent' : 'border border-black/[0.06]'} ${lifting ? 'cursor-grabbing opacity-40' : 'cursor-pointer'}`}
                          >
                            <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                              <TileArtwork
                                record={record}
                                title={`${slot.title} · ${record.label}`}
                                fit="object"
                                rotation={isSelected ? previewRotation : 0}
                                flipped={isSelected ? previewFlipped : false}
                                squarePreview={isSelected ? previewSquare : false}
                              />
                            </div>
                            {showCollapse && (
                              <button
                                type="button"
                                data-expand-toggle
                                aria-expanded
                                aria-label={`收起${slot.title}`}
                                title="收起"
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={() => setGroup(key, { expanded: false })}
                                className="absolute right-1.5 top-1.5 z-10 grid size-7 cursor-pointer place-items-center rounded-lg border border-black/[0.08] bg-white/94 text-[#161823]/70 shadow-sm hover:bg-white"
                              >
                                <Minimize2 className="size-3.5" />
                              </button>
                            )}
                            <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex flex-wrap items-end justify-between gap-1">
                              <SetCurrentChip current={isCover} onSet={() => useAsCover(slot, record)} />
                              <button type="button" aria-label={`删除${record.label}`} onPointerDown={(event) => event.stopPropagation()} onClick={() => deleteTile(slot, record)} className="grid size-6 place-items-center rounded-md bg-white/94 text-[#161823]/55 hover:text-rose-500"><Trash2 className="size-3" /></button>
                            </div>
                            {showHandles && (
                              <div className="pointer-events-none absolute -inset-px z-[15]">
                                <span aria-hidden className="absolute inset-0 border border-[#357ef8]" />
                                {TILE_RESIZE_HANDLES.map((handle) => (
                                  <button
                                    key={handle.corner}
                                    type="button"
                                    data-tile-resize={handle.corner}
                                    aria-label={`按比例缩放${record.label}`}
                                    onPointerDown={(event) => startResizePress(event, key, record, handle.corner)}
                                    className={`pointer-events-auto absolute flex size-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 ${handle.className}`}
                                  >
                                    <span className="pointer-events-none block size-2 rounded-none border border-[#357ef8] bg-white" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-visible">
                    {stacked && peekTiles.map((peek, peekIndex) => (
                      <span
                        key={peek.id}
                        data-stack-peek={peekIndex + 1}
                        aria-hidden
                        className={`pointer-events-none absolute inset-0 origin-bottom-left rounded-2xl border border-black/[0.08] bg-white shadow-[0_6px_16px_rgba(31,35,41,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${peekIndex === 0
                          ? 'translate-x-2 -rotate-[1.5deg] group-hover/stack:translate-x-4 group-hover/stack:-translate-y-1 group-hover/stack:rotate-[4deg]'
                          : 'translate-x-3.5 rotate-[2deg] group-hover/stack:translate-x-7 group-hover/stack:translate-y-0.5 group-hover/stack:rotate-[7deg]'}`}
                      >
                        {peek.src ? <img src={peek.src} alt="" draggable={false} className="size-full rounded-2xl object-cover opacity-75" /> : <span className="block size-full rounded-2xl bg-[#eef0f3]" />}
                      </span>
                    ))}
                    <div
                      data-group-surface
                      data-group-frame="light"
                      data-tile-selected={collapsedSelected ? 'true' : 'false'}
                      onPointerDown={(event) => startGroupPress(event, key)}
                      className={`relative z-10 aspect-square overflow-hidden rounded-2xl border bg-white shadow-[0_10px_28px_rgba(31,35,41,0.08)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/stack:-translate-y-1 group-hover/stack:shadow-[0_18px_40px_rgba(31,35,41,0.12)] ${draggingGroup ? 'cursor-grabbing' : 'cursor-grab'} ${collapsedSelected ? 'border-[#357ef8]/50 ring-2 ring-[#357ef8]' : frameTone}`}
                    >
                      <TileArtwork
                        record={cover}
                        title={slot.title}
                        pending={slot.pending}
                        fit="token"
                        rotation={collapsedSelected ? previewRotation : 0}
                        flipped={collapsedSelected ? previewFlipped : false}
                        squarePreview={collapsedSelected ? previewSquare : false}
                      />
                      {canToggle && (
                        <button
                          type="button"
                          data-expand-toggle
                          aria-expanded={false}
                          aria-label={`展开${slot.title}`}
                          title="展开"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => expandGroup(key)}
                          className="absolute right-2 top-2 z-10 grid size-7 cursor-pointer place-items-center rounded-lg border border-black/[0.08] bg-white/94 text-[#161823]/62 shadow-sm hover:bg-white"
                        >
                          <Maximize2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {!group.expanded && (
                <div className="pt-2">
                  <p className="truncate text-[11px] font-semibold text-[#161823]">{slot.title}</p>
                  <p className="mt-0.5 text-[8px] text-[#161823]/38">{empty ? '空槽位' : stacked || canToggle ? `素材组 · ${tiles.length} 张` : '单张素材'}</p>
                </div>
              )}
            </article>
          )
        })}

        {drag?.kind === 'tile' && (() => {
          const slot = slotByKey.get(drag.key)
          const record = slot ? recordMap(slot.records).get(drag.recordId) : undefined
          if (!record) return null
          const box = tileDisplaySize(drag.key, record)
          return (
            <div
              aria-hidden
              className="pointer-events-none absolute z-50 overflow-hidden rounded-xl border border-[#357ef8]/50 bg-white shadow-[0_12px_32px_rgba(31,35,41,0.22)]"
              style={{ left: drag.x, top: drag.y, width: box.width, height: box.height }}
            >
              <TileArtwork record={record} title={record.label} fit="object" />
            </div>
          )
        })()}

      </div>
    </div>
    {selected && !drag && press?.kind !== 'resize' && (
      <div
        ref={followBarRef}
        data-canvas-edit-bar
        className={`pointer-events-none absolute z-30 flex flex-col items-center ${followPos ? '' : 'invisible'}`}
        style={followPos ? { left: followPos.x, top: followPos.y } : { left: 0, top: 0 }}
      >
        {previewInfo && (
          <p className="mb-2 rounded-full border border-[rgba(45,66,107,0.12)] bg-white px-2.5 py-1 text-[12px] leading-4 text-[rgba(28,31,35,0.6)] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            {selectedRecord?.width && selectedRecord?.height
              ? `${selectedRecord.width} × ${selectedRecord.height}`
              : selectedRecord?.label ?? '素材'}
            {selectedRecord?.kind === 'dynamic' && selectedRecord.detail ? ` · ${selectedRecord.detail}` : ''}
          </p>
        )}
        <CatalogFollowToolBar
          title={selectedActionLabel}
          flipped={previewFlipped}
          squarePreview={previewSquare}
          showInfo={previewInfo}
          disabledCover={{ sprite: !selectedActionAssetId, regenerate: !selectedActionAssetId, attach: !selectedActionAssetId, download: !selectedRecord?.src }}
          onCoverAction={runCoverAction}
          onTool={(id) => applyCatalogPreviewTool(id, setPreviewRotation, setPreviewFlipped, setPreviewSquare, setPreviewInfo)}
        />
      </div>
    )}
    <div data-canvas-board-chrome className="pointer-events-none absolute bottom-3 left-3 z-40">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/[0.08] bg-white px-2 py-1 shadow-[0_8px_24px_rgba(31,35,41,0.08)]">
        <button
          type="button"
          data-tidy-board
          onClick={tidyBoard}
          className="flex h-7 cursor-pointer items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-[#161823]/80 hover:bg-[#f5f7fa]"
        >
          <LayoutGrid className="size-3.5" />
          整理画布
        </button>
        <span className="mx-0.5 h-4 w-px bg-black/[0.08]" />
        <button type="button" aria-label="缩小画布" onClick={() => setZoom((value) => clampCanvasZoom(value - CANVAS_ZOOM_STEP))} className="grid size-7 cursor-pointer place-items-center rounded-full text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3.5" /></button>
        <span data-canvas-zoom className="min-w-10 text-center text-[11px] font-medium text-[#161823]/58">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="放大画布" onClick={() => setZoom((value) => clampCanvasZoom(value + CANVAS_ZOOM_STEP))} className="grid size-7 cursor-pointer place-items-center rounded-full text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3.5" /></button>
      </div>
    </div>
    </div>
    </div>
  )
}
