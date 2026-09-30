import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  Brush,
  Check,
  Clock,
  Crop,
  Download,
  Eraser,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Loader2,
  MessageSquarePlus,
  Palette,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  User,
  WandSparkles,
} from '@/shared/icons'
import type { TowerDefenseAssetLibraryProps } from './TowerDefenseAssetLibrary'
import type {
  SpriteTask,
  TowerDefenseAsset,
  TowerDefenseAssetCategory,
  TowerDefenseAssetState,
  TowerDefenseDirection,
} from './TowerDefenseFlowModel'
import TowerDefenseAssetCanvas from './TowerDefenseAssetCanvas'
import type { CanvasSlotDescriptor } from './TowerDefenseAssetCanvas'
import { visualVersionLabel } from './TowerDefenseVisualVersion'
import { readTowerDefenseUploadImage } from './TowerDefenseUpload'

const DIRECTION_LABEL: Record<TowerDefenseDirection, string> = {
  front: '正面',
  'front-right': '右前',
  right: '向右',
  'back-right': '右后',
  back: '背面',
  'back-left': '左后',
  left: '向左',
  'front-left': '左前',
  none: '单向',
}

const CATEGORY_LABEL: Record<TowerDefenseAssetCategory, string> = {
  'visual-style': '素材-视觉风格',
  map: '素材-地图',
  hero: '素材-英雄',
  enemy: '素材-敌人',
  tower: '素材-建筑塔',
  ui: 'UI',
}

function designSlotLabel(asset: TowerDefenseAsset) {
  if (asset.category === 'visual-style') return '视觉设定'
  return `${asset.name}设定`
}

type SlotTarget =
  | { kind: 'base'; assetId: string }
  | { kind: 'state'; assetId: string; stateId: string }
  | { kind: 'direction'; assetId: string; stateId: string; direction: TowerDefenseDirection }

type DirectionPresetCount = 1 | 2 | 4 | 8

const DIRECTION_PRESETS: Record<DirectionPresetCount, TowerDefenseDirection[]> = {
  1: ['front'],
  2: ['front', 'back'],
  4: ['front', 'right', 'back', 'left'],
  8: ['front', 'front-right', 'right', 'back-right', 'back', 'back-left', 'left', 'front-left'],
}

const DIRECTION_PRESET_COUNTS: DirectionPresetCount[] = [1, 2, 4, 8]

type SlotRecord =
  | { id: string; kind: 'visual'; versionIndex: number; label: string; src?: string; width?: number; height?: number }
  | { id: string; kind: 'dynamic'; taskId: string; label: string; src: string; width?: number; height?: number; detail: string }

function CategoryIcon({ category }: { category: TowerDefenseAssetCategory }) {
  const className = 'size-3.5 text-[#161823]/42'
  if (category === 'visual-style') return <Palette className={className} />
  if (category === 'map') return <Layers className={className} />
  if (category === 'hero') return <User className={className} />
  if (category === 'enemy') return <Target className={className} />
  if (category === 'ui') return <LayoutGrid className={className} />
  return <Layers className={className} />
}

function taskForDirection(tasks: SpriteTask[], assetId: string, stateId: string, direction: TowerDefenseDirection) {
  return tasks.find((task) => task.assetId === assetId && task.stateId === stateId && task.direction === direction)
}

function selectedVisualIndex(asset: TowerDefenseAsset, state?: TowerDefenseAssetState, direction?: TowerDefenseDirection) {
  const directional = direction ? state?.directionMaterialRefs?.[direction] : undefined
  if (directional?.kind === 'visual-version') return directional.versionIndex
  if (state?.materialRef?.kind === 'visual-version') return state.materialRef.versionIndex
  return asset.selectedVisualVersion ?? 0
}

function slotKey(target: SlotTarget) {
  if (target.kind === 'base') return `${target.assetId}:base`
  if (target.kind === 'state') return `${target.assetId}:${target.stateId}`
  return `${target.assetId}:${target.stateId}:${target.direction}`
}

function slotTitle(asset: TowerDefenseAsset, target: SlotTarget) {
  if (target.kind === 'base') return asset.category === 'visual-style' && asset.id === 'visual-world-style' ? '视觉设定' : asset.name
  const state = asset.states.find((item) => item.id === target.stateId)
  if (target.kind === 'state') return `${asset.name} · ${state?.name ?? '状态'}`
  return `${asset.name} · ${state?.name ?? '状态'} · ${DIRECTION_LABEL[target.direction]}`
}

function slotIsEnabled(asset: TowerDefenseAsset, target: SlotTarget) {
  if (asset.enabled === false) return false
  if (target.kind === 'base') return true
  const state = asset.states.find((item) => item.id === target.stateId)
  if (target.kind === 'state') return state?.enabled !== false
  return state?.enabled !== false && !state?.disabledDirections?.includes(target.direction)
}

function slotCurrentRecord(asset: TowerDefenseAsset, target: SlotTarget, tasks: SpriteTask[]): SlotRecord {
  if (target.kind === 'base') {
    const versionIndex = asset.selectedVisualVersion ?? 0
    const version = asset.visualVersions?.[versionIndex]
    return { id: `visual-${versionIndex}`, kind: 'visual', versionIndex, label: visualVersionLabel(version, versionIndex), src: version?.src, width: version?.width, height: version?.height }
  }
  if (target.kind === 'state') {
    const state = asset.states.find((item) => item.id === target.stateId)
    const direction = state?.directions.find((item) => !state.disabledDirections?.includes(item)) ?? state?.directions[0] ?? 'front'
    return slotCurrentRecord(asset, { kind: 'direction', assetId: asset.id, stateId: target.stateId, direction }, tasks)
  }
  const state = asset.states.find((item) => item.id === target.stateId)
  const directionalRef = state?.directionMaterialRefs?.[target.direction]
  if (directionalRef?.kind === 'visual-version') {
    const version = asset.visualVersions?.[directionalRef.versionIndex]
    return { id: `visual-${directionalRef.versionIndex}`, kind: 'visual', versionIndex: directionalRef.versionIndex, label: visualVersionLabel(version, directionalRef.versionIndex), src: version?.src, width: version?.width, height: version?.height }
  }
  const task = taskForDirection(tasks, asset.id, target.stateId, target.direction)
  const taskSrc = task?.output?.previewUrl ?? task?.output?.spriteSheetUrl
  if (task?.status === 'completed' && taskSrc) {
    return { id: `dynamic-${task.id}`, kind: 'dynamic', taskId: task.id, label: '动态生成', src: taskSrc, width: task.output?.width, height: task.output?.height, detail: `${task.frameCount} 帧${task.fps ? ` · ${task.fps} FPS` : ''}` }
  }
  const versionIndex = selectedVisualIndex(asset, state, target.direction)
  const version = asset.visualVersions?.[versionIndex]
  return { id: `visual-${versionIndex}`, kind: 'visual', versionIndex, label: visualVersionLabel(version, versionIndex), src: version?.src, width: version?.width, height: version?.height }
}

export function buildTowerCanvasSlots({
  assets,
  tasks,
  mode,
  categoryFilter = 'all',
  query = '',
  kindFilter,
  generationInProgress,
  visibleImageCount,
  productionApplied = true,
}: {
  assets: TowerDefenseAsset[]
  tasks: SpriteTask[]
  mode: TowerDefenseAssetLibraryProps['mode']
  categoryFilter?: TowerDefenseAssetCategory | 'all'
  query?: string
  kindFilter?: TowerDefenseAssetLibraryProps['libraryKindFilter']
  generationInProgress?: boolean
  visibleImageCount?: number
  productionApplied?: boolean
}): CanvasSlotDescriptor[] {
  if (kindFilter && kindFilter !== 'all' && kindFilter !== 'image') return []
  const needle = query.trim().toLocaleLowerCase()
  const revealedVisuals = new Set(assets.flatMap((asset) => (asset.visualVersions ?? []).map((_, versionIndex) => `${asset.id}:${versionIndex}`)).slice(0, visibleImageCount ?? Number.POSITIVE_INFINITY))
  const filteredAssets = assets.filter((asset) => {
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false
    return !needle || `${asset.name} ${asset.role} ${asset.states.map((state) => state.name).join(' ')}`.toLocaleLowerCase().includes(needle)
  })
  const slots: CanvasSlotDescriptor[] = []
  const categories = Array.from(new Set(assets.map((asset) => asset.category)))
  categories.filter((category) => categoryFilter === 'all' || categoryFilter === category).forEach((category) => {
    const categoryAssets = filteredAssets.filter((asset) => asset.category === category)
    const pushSlot = (asset: TowerDefenseAsset, target: SlotTarget, title?: string, forceEmpty = false) => {
      const current = slotCurrentRecord(asset, target, tasks)
      const pending = Boolean(generationInProgress && visibleImageCount !== undefined && current.kind === 'visual' && !revealedVisuals.has(`${asset.id}:${current.versionIndex}`))
      slots.push({
        key: slotKey(target),
        target,
        asset,
        title: title ?? slotTitle(asset, target),
        records: forceEmpty ? [] : recordsForSlot(asset, target, tasks),
        current,
        enabled: slotIsEnabled(asset, target),
        pending,
        forceEmpty,
      })
    }
    categoryAssets.forEach((asset) => {
      if (mode === 'art-direction' || category === 'visual-style' || category === 'map' || category === 'ui') {
        pushSlot(asset, { kind: 'base', assetId: asset.id }, category === 'ui' ? asset.name : designSlotLabel(asset))
        return
      }
      if (asset.states.length === 0) {
        pushSlot(asset, { kind: 'base', assetId: asset.id })
        return
      }
      pushSlot(asset, { kind: 'base', assetId: asset.id }, designSlotLabel(asset))
      asset.states.forEach((state) => {
        pushSlot(asset, { kind: 'state', assetId: asset.id, stateId: state.id }, `${asset.name} · ${state.name}`, !productionApplied)
      })
    })
  })
  return slots
}

function recordsForSlot(asset: TowerDefenseAsset, target: SlotTarget, tasks: SpriteTask[]): SlotRecord[] {
  if (target.kind === 'state') {
    const state = asset.states.find((item) => item.id === target.stateId)
    const direction = state?.directions.find((item) => !state.disabledDirections?.includes(item)) ?? state?.directions[0] ?? 'front'
    return recordsForSlot(asset, { kind: 'direction', assetId: asset.id, stateId: target.stateId, direction }, tasks)
  }
  const records: SlotRecord[] = []
  if (target.kind === 'direction') {
    const task = taskForDirection(tasks, asset.id, target.stateId, target.direction)
    const src = task?.output?.previewUrl ?? task?.output?.spriteSheetUrl
    if (task?.status === 'completed' && src) {
      records.push({ id: `dynamic-${task.id}`, kind: 'dynamic', taskId: task.id, label: '动态生成', src, width: task.output?.width, height: task.output?.height, detail: `${task.frameCount} 帧${task.fps ? ` · ${task.fps} FPS` : ''}` })
    }
  }
  ;[...(asset.visualVersions ?? [])].reverse().forEach((version, reverseIndex) => {
    const versionIndex = (asset.visualVersions?.length ?? 0) - 1 - reverseIndex
    records.push({ id: `visual-${versionIndex}`, kind: 'visual', versionIndex, label: visualVersionLabel(version, versionIndex), src: version.src, width: version.width, height: version.height })
  })
  if (records.length === 0) records.push(slotCurrentRecord(asset, target, tasks))
  return records
}

function AnimatedSpriteCover({ src, frameCount, fps, alt }: { src: string; frameCount: number; fps: number; alt: string }) {
  const [frame, setFrame] = useState(0)
  const [cellAspect, setCellAspect] = useState(1)
  const playableFrames = Math.max(1, Math.min(frameCount, 12))
  useEffect(() => {
    if (playableFrames <= 1) return
    const timer = window.setInterval(() => setFrame((value) => (value + 1) % playableFrames), Math.round(2000 / Math.max(1, fps)))
    return () => window.clearInterval(timer)
  }, [fps, playableFrames])
  const column = frame % 4
  const row = Math.floor(frame / 4)
  return <span role="img" aria-label={alt} className="relative block size-full overflow-hidden bg-white">
    <img src={src} alt="" aria-hidden className="hidden" onLoad={(event) => setCellAspect((event.currentTarget.naturalWidth / 4) / (event.currentTarget.naturalHeight / 3))} />
    <span className={`absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 bg-no-repeat ${cellAspect >= 1 ? 'h-full' : 'w-full'}`} style={{ aspectRatio: cellAspect, backgroundImage: `url(${src})`, backgroundSize: '400% 300%', backgroundPosition: `${column * (100 / 3)}% ${row * 50}%` }} />
  </span>
}

function SlotCard({
  asset,
  target,
  tasks,
  onOpen,
  onToggle,
  pending = false,
  label,
  showToggle = true,
  forceEmpty = false,
  canvasGroup = false,
}: {
  asset: TowerDefenseAsset
  target: SlotTarget
  tasks: SpriteTask[]
  onOpen: () => void
  onToggle: () => void
  pending?: boolean
  label?: string
  showToggle?: boolean
  forceEmpty?: boolean
  canvasGroup?: boolean
}) {
  const current = slotCurrentRecord(asset, target, tasks)
  const enabled = slotIsEnabled(asset, target)
  const title = label ?? (target.kind === 'base'
    ? (asset.category === 'visual-style' && asset.id === 'visual-world-style' ? '视觉设定' : asset.name)
    : target.kind === 'state'
      ? asset.states.find((state) => state.id === target.stateId)?.name ?? '状态'
      : `${asset.states.find((state) => state.id === target.stateId)?.name ?? '状态'} · ${DIRECTION_LABEL[target.direction]}`)
  const historyCount = recordsForSlot(asset, target, tasks).length
  const dynamicTask = current.kind === 'dynamic' ? tasks.find((task) => task.id === current.taskId) : undefined
  return (
    <article className={`group min-w-0 ${canvasGroup ? 'w-[176px]' : ''} ${enabled ? '' : 'opacity-55'}`}>
      <div className={`relative aspect-square overflow-hidden rounded-xl border bg-[#f2f3f5] ${enabled ? 'border-black/[0.07]' : 'border-dashed border-black/20'}`}>
        {canvasGroup ? (
          <div className="block size-full cursor-default" aria-label={`${title}素材组`}>
            {pending
              ? <span className="grid size-full place-items-center bg-[#f2f3f5] text-[9px] font-medium text-[#161823]/38"><span className="flex flex-col items-center gap-2"><Loader2 className="size-5 animate-spin" />生成中</span></span>
              : forceEmpty
              ? <span className="grid size-full place-items-center bg-[#f2f3f5] text-[9px] font-medium text-[#161823]/32"><span className="flex flex-col items-center gap-2"><ImageIcon className="size-5" />空素材</span></span>
              : current.src
              ? dynamicTask
                ? <AnimatedSpriteCover src={current.src} frameCount={dynamicTask.frameCount} fps={dynamicTask.fps ?? 12} alt={`${title}序列帧预览`} />
                : <img src={current.src} alt={title} className="block size-full bg-white object-cover" />
              : <span className="grid size-full place-items-center text-[10px] text-[#161823]/30"><ImageIcon className="mb-1 size-5" />等待素材</span>}
          </div>
        ) : (
          <button type="button" onClick={onOpen} aria-label={`编辑${slotTitle(asset, target)}槽位`} className="block size-full">
            {pending
              ? <span className="grid size-full place-items-center bg-[#f2f3f5] text-[9px] font-medium text-[#161823]/38"><span className="flex flex-col items-center gap-2"><Loader2 className="size-5 animate-spin" />生成中</span></span>
              : forceEmpty
              ? <span className="grid size-full place-items-center bg-[#f2f3f5] text-[9px] font-medium text-[#161823]/32"><span className="flex flex-col items-center gap-2"><ImageIcon className="size-5" />空素材</span></span>
              : current.src
              ? dynamicTask
                ? <AnimatedSpriteCover src={current.src} frameCount={dynamicTask.frameCount} fps={dynamicTask.fps ?? 12} alt={`${title}序列帧预览`} />
                : <img src={current.src} alt={title} className="block size-full bg-white object-cover" />
              : <span className="grid size-full place-items-center text-[10px] text-[#161823]/30"><ImageIcon className="mb-1 size-5" />等待素材</span>}
          </button>
        )}
        {canvasGroup && <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onOpen() }}
          aria-label={`展开${slotTitle(asset, target)}历史素材`}
          title="展开历史素材"
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg border border-black/[0.08] bg-white/94 text-[#161823]/62 shadow-sm hover:bg-white hover:text-[#161823]"
        >
          <Clock className="size-3.5" />
        </button>}
        {showToggle && <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onToggle() }}
          aria-label={`${enabled ? '弃用' : '重新启用'}${slotTitle(asset, target)}槽位`}
          className={`absolute bottom-2 right-2 flex h-7 items-center gap-1 rounded-lg border px-2 text-[8px] font-medium shadow-sm ${enabled ? 'border-black/[0.08] bg-white/94 text-[#161823]/55 hover:text-rose-500' : 'border-[#357ef8]/24 bg-[#eaf2ff] text-[#357ef8]'}`}
        >
          {enabled ? <Ban className="size-3" /> : <RefreshCw className="size-3" />}{enabled ? '弃用' : '启用'}
        </button>}
        {!enabled && <span className="pointer-events-none absolute inset-x-2 bottom-11 rounded-md bg-[#161823]/76 py-1 text-center text-[8px] font-medium text-white">该槽位已停用</span>}
      </div>
      <button type="button" onClick={onOpen} className="block w-full pt-2 text-left">
        <span className="block truncate text-[11px] font-semibold text-[#161823]">{title}</span>
        <span className="mt-1 flex items-center gap-1 text-[8px] text-[#161823]/38"><Clock className="size-3" />{forceEmpty ? '等待应用生产规划' : canvasGroup ? `素材组 · ${historyCount} 条历史` : `${target.kind === 'state' ? `${asset.states.find((state) => state.id === target.stateId)?.directions.length ?? 0} 个方向` : `${historyCount} 条生成记录`} · ${current.label}`}</span>
      </button>
    </article>
  )
}

function SlotDetailView({
  asset,
  target,
  tasks,
  onBack,
  onAttach,
  onRegenerate,
  onCreateSprite,
  onConfirmVisual,
  onConfirmDynamic,
  onUpdateDirections,
  onAddVisualVersion,
  forceEmpty = false,
}: {
  asset: TowerDefenseAsset
  target: SlotTarget
  tasks: SpriteTask[]
  onBack: () => void
  onAttach?: TowerDefenseAssetLibraryProps['onAttachAsset']
  onRegenerate?: TowerDefenseAssetLibraryProps['onRegenerateAsset']
  onCreateSprite?: TowerDefenseAssetLibraryProps['onCreateSprite']
  onConfirmVisual: (versionIndex: number, direction?: TowerDefenseDirection) => void
  onConfirmDynamic: (direction?: TowerDefenseDirection) => void
  onUpdateDirections: (directions: TowerDefenseDirection[]) => void
  onAddVisualVersion?: TowerDefenseAssetLibraryProps['onAddVisualVersion']
  forceEmpty?: boolean
}) {
  const state = target.kind === 'base' ? undefined : asset.states.find((item) => item.id === target.stateId)
  const [activeDirection, setActiveDirection] = useState<TowerDefenseDirection | undefined>(target.kind === 'direction' ? target.direction : state?.directions[0])
  const resolvedActiveDirection = activeDirection && state?.directions.includes(activeDirection) ? activeDirection : state?.directions[0]
  const effectiveTarget: SlotTarget = target.kind === 'state'
    ? { kind: 'direction', assetId: asset.id, stateId: target.stateId, direction: resolvedActiveDirection ?? 'front' }
    : target
  const current = slotCurrentRecord(asset, effectiveTarget, tasks)
  const records = forceEmpty ? [] : recordsForSlot(asset, effectiveTarget, tasks)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [selectedId, setSelectedId] = useState(current.id)
  const [confirmedId, setConfirmedId] = useState(current.id)
  const [uploading, setUploading] = useState(false)
  const selected = records.find((record) => record.id === selectedId) ?? records[0]
  const title = slotTitle(asset, target)
  const selectedLabel = selected?.label ?? '当前素材'
  const changeDirection = (direction: TowerDefenseDirection) => {
    setActiveDirection(direction)
    if (target.kind !== 'state') return
    const nextCurrent = slotCurrentRecord(asset, { kind: 'direction', assetId: asset.id, stateId: target.stateId, direction }, tasks)
    setSelectedId(nextCurrent.id)
    setConfirmedId(nextCurrent.id)
  }
  const uploadImage = (file: File) => {
    setUploading(true)
    void readTowerDefenseUploadImage(file)
      .then((version) => {
        const versionIndex = onAddVisualVersion?.(asset.id, {
          id: `upload-${Date.now()}`,
          src: version.src,
          width: version.width,
          height: version.height,
          source: 'upload',
          label: version.label,
        })
        if (versionIndex == null || versionIndex < 0) return
        setSelectedId(`visual-${versionIndex}`)
      })
      .finally(() => setUploading(false))
  }
  const confirmRecord = (record: SlotRecord) => {
    setSelectedId(record.id)
    if (record.kind === 'visual') onConfirmVisual(record.versionIndex, resolvedActiveDirection)
    else onConfirmDynamic(resolvedActiveDirection)
    setConfirmedId(record.id)
  }
  return (
    <div className="absolute inset-0 z-50 flex min-h-0 flex-col bg-white" aria-label={`${title}素材槽位编辑`}>
      <header className="flex h-13 shrink-0 items-center gap-3 border-b border-black/[0.08] px-4">
        <button type="button" onClick={onBack} className="flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-medium text-[#161823]/65 hover:bg-[#f2f3f5]"><ArrowLeft className="size-4" />返回资产库</button>
        <span className="h-5 w-px bg-black/[0.08]" />
        <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold text-[#161823]">{title}</p><p className="mt-0.5 truncate text-[8px] text-[#161823]/36">素材槽位编辑 · 当前 {selectedLabel}</p></div>
        <input ref={uploadInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadImage(file); event.currentTarget.value = '' }} />
        <button type="button" disabled={uploading} onClick={() => uploadInputRef.current?.click()} className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[9px] font-medium text-[#161823]/58 hover:bg-[#f2f3f5] disabled:cursor-wait disabled:opacity-50"><ArrowUp className="size-3.5" />{uploading ? '上传中' : '上传'}</button>
        {selected?.src && <a href={selected.src} download={`${asset.name}-${selectedLabel}.png`} className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[9px] font-medium text-[#161823]/58 hover:bg-[#f2f3f5]"><Download className="size-3.5" />下载</a>}
        <button type="button" onClick={() => selected?.kind === 'visual' && onRegenerate?.(asset.id, selected.label)} className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[9px] font-medium text-[#161823]/58 hover:bg-[#f2f3f5]"><RefreshCw className="size-3.5" />重新生成</button>
        <button type="button" onClick={() => selected?.kind === 'visual' && onCreateSprite?.(asset.id, selected.versionIndex, selected.label)} className="flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.08] px-2.5 text-[9px] font-medium text-[#161823]/68 hover:bg-[#f2f3f5]"><WandSparkles className="size-3.5" />制作序列帧</button>
        <button type="button" onClick={() => onAttach?.(asset.id, selectedLabel)} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-2.5 text-[9px] font-medium text-white"><MessageSquarePlus className="size-3.5" />添加到 Chat</button>
      </header>
      {target.kind === 'state' && state && <div className="shrink-0 border-b border-black/[0.07] bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-[9px] font-medium text-[#161823]/45">方向数量</span>
          <div className="flex items-center rounded-lg bg-[#f2f3f5] p-0.5">
            {DIRECTION_PRESET_COUNTS.map((count) => <button key={count} type="button" onClick={() => { const directions = asset.category === 'tower' && count === 1 ? (['none'] as TowerDefenseDirection[]) : [...DIRECTION_PRESETS[count]]; onUpdateDirections(directions); changeDirection(directions[0]) }} className={`h-6 min-w-7 rounded-md px-1.5 text-[8px] font-medium ${state.directions.length === count ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/38'}`}>{count}</button>)}
          </div>
          <span className="h-4 w-px bg-black/[0.08]" />
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {state.directions.map((direction) => <button key={direction} type="button" onClick={() => changeDirection(direction)} className={`h-7 shrink-0 rounded-lg px-2.5 text-[8px] font-medium ${resolvedActiveDirection === direction ? 'bg-[#161823] text-white' : 'border border-black/[0.07] bg-white text-[#161823]/48'}`}>{DIRECTION_LABEL[direction]}</button>)}
          </div>
        </div>
      </div>}
      <div className="flex min-h-0 flex-1">
        <main className="relative min-h-0 min-w-0 flex-1 overflow-auto bg-[#f4f5f7] p-6 [background-image:radial-gradient(circle,rgba(22,24,35,0.12)_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-[0_8px_28px_rgba(31,35,41,.12)]">
            {[Brush, Crop, Eraser, ImageIcon].map((Icon, index) => <button key={index} type="button" aria-label={['画笔','裁切','橡皮擦','替换图像'][index]} disabled={index === 3 && uploading} onClick={index === 3 ? () => uploadInputRef.current?.click() : undefined} className="grid size-8 place-items-center rounded-lg text-[#161823]/52 hover:bg-[#f2f3f5] hover:text-[#161823] disabled:cursor-wait disabled:opacity-50"><Icon className="size-4" /></button>)}
          </div>
          <div className="flex min-h-full items-center justify-center pl-12">
            <div className="relative flex max-h-[calc(100vh-180px)] max-w-[min(86%,860px)] items-center justify-center overflow-hidden bg-white shadow-[0_20px_70px_rgba(31,35,41,.16)]">
              {selected?.src
                ? <img src={selected.src} alt={`${title} · ${selectedLabel}`} className="block max-h-[calc(100vh-180px)] max-w-full object-contain" />
                : <div className="grid h-[420px] w-[420px] place-items-center text-[#161823]/28"><span className="flex flex-col items-center gap-3"><ImageIcon className="size-12" /><span className="text-[10px]">等待应用生产规划</span></span></div>}
              {selected?.kind === 'dynamic' && <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[9px] font-medium text-white">{selected.detail}</span>}
            </div>
          </div>
        </main>
        <aside className="thin-scroll w-[116px] shrink-0 overflow-y-auto border-l border-black/[0.08] bg-white px-2 py-3">
          <div className="flex items-end justify-between gap-1"><h3 className="text-[10px] font-semibold text-[#161823]">生成记录</h3><span className="text-[7px] text-[#161823]/32">{records.length}</span></div>
          <div className="mt-2 space-y-2">
            {records.map((record, index) => {
              const active = selectedId === record.id
              const confirmed = confirmedId === record.id
              return <article key={record.id} className={`overflow-hidden rounded-lg border bg-white ${active ? 'border-[#357ef8] ring-2 ring-[#357ef8]/10' : 'border-black/[0.07]'}`}>
                <div className="relative aspect-square w-full overflow-hidden bg-[#f2f3f5]">
                  <button type="button" aria-label={`预览${record.label}`} onClick={() => setSelectedId(record.id)} className="absolute inset-0 z-0 block size-full">
                    {record.src ? <img src={record.src} alt={record.label} className="size-full object-cover" /> : <span className="grid size-full place-items-center text-[#161823]/25"><ImageIcon className="size-6" /></span>}
                  </button>
                  <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded bg-black/65 px-1 py-0.5 text-[7px] font-medium text-white">{record.label}</span>
                  {confirmed
                    ? <span className="absolute bottom-1.5 right-1.5 z-10 grid size-5 place-items-center rounded-full bg-emerald-500 text-white shadow-sm" aria-label="当前选择"><Check className="size-3" /></span>
                    : <button type="button" onClick={() => confirmRecord(record)} className="absolute bottom-1.5 right-1.5 z-10 h-5 rounded-md bg-[#161823] px-1.5 text-[7px] font-medium text-white shadow-sm">选择</button>}
                </div>
                <div className="flex items-center justify-between gap-1 px-1.5 py-1.5"><span className="truncate text-[7px] font-medium text-[#161823]/58">第 {records.length - index} 次</span><span className="text-[6px] text-[#161823]/28">刚刚</span></div>
              </article>
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function TowerDefenseSlotAssetLibrary(props: TowerDefenseAssetLibraryProps) {
  const {
    mode,
    assets,
    tasks,
    onSelectAsset,
    onAttachAsset,
    onRegenerateAsset,
    onCreateSprite,
    onAddVisualVersion,
    onReferenceChange,
    onPreviewOpen,
    onConfirmSelections,
    onUpdateState,
    onAssignDirectionMaterial,
    onBatchGenerate,
    onProceed,
    onSetAssetEnabled,
    visibleImageCount,
    generationInProgress,
    productionApplied = true,
    canvasEditing = false,
    onCanvasEditingChange,
    canvasSpares,
    onCanvasSparesChange,
    hideChrome = false,
    libraryCategory,
    libraryQuery,
    libraryKindFilter,
  } = props
  const [categoryFilterState, setCategoryFilter] = useState<TowerDefenseAssetCategory | 'all'>('all')
  const [queryState, setQuery] = useState('')
  const categoryFilter = libraryCategory ?? categoryFilterState
  const query = libraryQuery ?? queryState
  const [detailTarget, setDetailTarget] = useState<SlotTarget | null>(null)
  const categories = Array.from(new Set(assets.map((asset) => asset.category)))
  const revealedVisuals = new Set(assets.flatMap((asset) => (asset.visualVersions ?? []).map((_, versionIndex) => `${asset.id}:${versionIndex}`)).slice(0, visibleImageCount ?? Number.POSITIVE_INFINITY))
  const filteredAssets = assets.filter((asset) => {
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false
    const needle = query.trim().toLocaleLowerCase()
    return !needle || `${asset.name} ${asset.role} ${asset.states.map((state) => state.name).join(' ')}`.toLocaleLowerCase().includes(needle)
  })
  const enabledTaskIds = tasks.filter((task) => {
    const asset = assets.find((item) => item.id === task.assetId)
    const state = asset?.states.find((item) => item.id === task.stateId)
    return asset?.enabled !== false && state?.enabled !== false && !state?.disabledDirections?.includes(task.direction) && (task.status === 'queued' || task.status === 'failed')
  }).map((task) => task.id)
  const activeSlotCount = mode === 'art-direction'
    ? assets.filter((asset) => asset.enabled !== false).length
    : assets.reduce((sum, asset) => sum + (asset.category === 'map' || asset.category === 'visual-style'
      ? (asset.enabled === false ? 0 : 1)
      : (asset.enabled === false ? 0 : 1) + asset.states.filter((state) => asset.enabled !== false && state.enabled !== false).length), 0)

  useEffect(() => {
    if (canvasEditing) setDetailTarget(null)
  }, [canvasEditing])

  const openDetail = (target: SlotTarget) => {
    if (canvasEditing) return
    onSelectAsset?.(target.assetId)
    onPreviewOpen?.()
    setDetailTarget(target)
  }
  const toggleSlot = (asset: TowerDefenseAsset, target: SlotTarget) => {
    if (target.kind === 'base') {
      onSetAssetEnabled?.(asset.id, asset.enabled === false)
      return
    }
    const state = asset.states.find((item) => item.id === target.stateId)
    if (!state) return
    if (target.kind === 'state') {
      onUpdateState?.(asset.id, state.id, { enabled: state.enabled === false })
      return
    }
    const disabled = new Set(state.disabledDirections ?? [])
    if (disabled.has(target.direction)) disabled.delete(target.direction)
    else disabled.add(target.direction)
    onUpdateState?.(asset.id, state.id, { disabledDirections: [...disabled] })
  }

  const detailAsset = detailTarget ? assets.find((asset) => asset.id === detailTarget.assetId) : undefined
  if (detailTarget && detailAsset && !canvasEditing) {
    return <div className="relative flex h-full min-h-0 flex-col">
      <SlotDetailView
        key={slotKey(detailTarget)}
        asset={detailAsset}
        target={detailTarget}
        tasks={tasks}
        onBack={() => setDetailTarget(null)}
        onAttach={onAttachAsset}
        onRegenerate={onRegenerateAsset}
        onCreateSprite={onCreateSprite}
        onAddVisualVersion={onAddVisualVersion}
        onConfirmVisual={(versionIndex, direction) => {
          if (detailTarget.kind === 'base') onReferenceChange?.(detailAsset.id, versionIndex)
          else if (detailTarget.kind === 'direction') onAssignDirectionMaterial?.(detailAsset.id, detailTarget.stateId, detailTarget.direction, versionIndex)
          else if (direction) onAssignDirectionMaterial?.(detailAsset.id, detailTarget.stateId, direction, versionIndex)
        }}
        onConfirmDynamic={(direction) => {
          if (detailTarget.kind === 'base') return
          const state = detailAsset.states.find((item) => item.id === detailTarget.stateId)
          if (!state) return
          const targetDirection = detailTarget.kind === 'direction' ? detailTarget.direction : direction
          if (!targetDirection) return
          const next = { ...(state.directionMaterialRefs ?? {}) }
          delete next[targetDirection]
          onUpdateState?.(detailAsset.id, state.id, { directionMaterialRefs: next })
        }}
        onUpdateDirections={(directions) => {
          if (detailTarget.kind === 'base') return
          onUpdateState?.(detailAsset.id, detailTarget.stateId, { directions })
        }}
        forceEmpty={mode === 'production' && !productionApplied && detailTarget.kind === 'state'}
      />
    </div>
  }

  const canvasSlots = canvasEditing
    ? buildTowerCanvasSlots({
      assets,
      tasks,
      mode,
      categoryFilter,
      query,
      kindFilter: libraryKindFilter,
      generationInProgress,
      visibleImageCount,
      productionApplied,
    })
    : []

  const slotGridClass = canvasEditing ? 'flex flex-wrap gap-4' : 'grid grid-cols-4 gap-3'
  return <div className="relative flex h-full min-h-0 flex-col bg-[#f7f7f8] text-[#161823]">
    {!hideChrome && <div aria-label="素材库工具栏" className="flex h-12 shrink-0 items-center gap-2 border-b border-black/[0.07] bg-white px-3">
      <h2 className="shrink-0 text-[13px] font-semibold text-[#161823]">素材库</h2>
      <div className="flex min-w-0 shrink-0 items-center gap-0.5 overflow-x-auto">
        <button type="button" onClick={() => setCategoryFilter('all')} className={`h-7 rounded-lg px-2.5 text-[10px] font-medium ${categoryFilter === 'all' ? 'bg-[#f2f3f5] text-[#161823]' : 'text-[#161823]/48 hover:text-[#161823]'}`}>全部</button>
        {categories.map((category) => <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={`h-7 rounded-lg px-2.5 text-[10px] font-medium ${categoryFilter === category ? 'bg-[#f2f3f5] text-[#161823]' : 'text-[#161823]/48 hover:text-[#161823]'}`}>{CATEGORY_LABEL[category]}</button>)}
      </div>
      <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-black/[0.08] bg-[#f7f7f8] px-2.5"><Search className="size-3.5 text-[#161823]/30" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索" className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#161823]/28" /></label>
      <button
        type="button"
        aria-pressed={canvasEditing}
        title="画布编辑"
        onClick={() => onCanvasEditingChange?.(!canvasEditing)}
        className={`flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[11px] font-medium ${canvasEditing ? 'bg-[#161823] text-white' : 'text-[#161823]/62 hover:bg-[#f2f3f5]'}`}
      >
        <LayoutGrid className="size-3.5" />
        画布编辑
      </button>
    </div>}
    <div className={`min-h-0 flex-1 ${canvasEditing ? 'flex flex-col overflow-hidden [background-image:radial-gradient(circle,rgba(22,24,35,0.12)_1px,transparent_1px)] [background-size:20px_20px] bg-[#eef0f3]' : 'thin-scroll overflow-auto px-4 py-4'}`}>
      {canvasEditing ? (
        <TowerDefenseAssetCanvas
          slots={canvasSlots}
          tasks={tasks}
          spares={canvasSpares}
          onSparesChange={onCanvasSparesChange}
          onAddVisualVersion={onAddVisualVersion}
          onReferenceChange={onReferenceChange}
          onAssignDirectionMaterial={onAssignDirectionMaterial}
          onUpdateState={onUpdateState}
          onAttachAsset={onAttachAsset}
          onCreateSprite={onCreateSprite}
          onRegenerateAsset={onRegenerateAsset}
        />
      ) : categories.filter((category) => categoryFilter === 'all' || categoryFilter === category).map((category) => {
        const categoryAssets = filteredAssets.filter((asset) => asset.category === category)
        if (!categoryAssets.length) return null
        return <section key={category} className="mb-8" aria-label={CATEGORY_LABEL[category]}>
          <div className="mb-3 flex items-center gap-2"><CategoryIcon category={category} /><h3 className="text-[11px] font-semibold text-[#161823]/72">{CATEGORY_LABEL[category]}</h3><span className="text-[8px] text-[#161823]/32">Chat 已规划 {categoryAssets.length} 项</span></div>
          {category === 'ui' ? (
            <div className="space-y-7">
              {Array.from(new Map(categoryAssets.map((asset) => [asset.role, asset.role])).keys()).map((page) => {
                const pageAssets = categoryAssets.filter((asset) => asset.role === page)
                return (
                  <section key={page} aria-label={`界面 / ${page}`}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <h4 className="text-[11px] font-semibold">{page}</h4>
                      <span className="text-[8px] text-[#161823]/34">{pageAssets.length} 个槽位</span>
                    </div>
                    <div className={slotGridClass}>
                      {pageAssets.map((asset) => {
                        const target: SlotTarget = { kind: 'base', assetId: asset.id }
                        const current = slotCurrentRecord(asset, target, tasks)
                        const pending = Boolean(generationInProgress && visibleImageCount !== undefined && current.kind === 'visual' && !revealedVisuals.has(`${asset.id}:${current.versionIndex}`))
                        return (
                          <SlotCard
                            key={asset.id}
                            asset={asset}
                            target={target}
                            tasks={tasks}
                            pending={pending}
                            label={asset.name}
                            showToggle={false}
                            canvasGroup={canvasEditing}
                            onOpen={() => openDetail(target)}
                            onToggle={() => {}}
                          />
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : mode === 'art-direction' || category === 'visual-style' || category === 'map' ? (
            <div className={slotGridClass}>
              {categoryAssets.map((asset) => {
                const target: SlotTarget = { kind: 'base', assetId: asset.id }
                const current = slotCurrentRecord(asset, target, tasks)
                const pending = Boolean(generationInProgress && visibleImageCount !== undefined && current.kind === 'visual' && !revealedVisuals.has(`${asset.id}:${current.versionIndex}`))
                return <SlotCard key={asset.id} asset={asset} target={target} tasks={tasks} pending={pending} label={designSlotLabel(asset)} canvasGroup={canvasEditing} onOpen={() => openDetail(target)} onToggle={() => toggleSlot(asset, target)} />
              })}
            </div>
          ) : (
          <div className="space-y-7">
            {categoryAssets.map((asset) => {
              const baseOnly = asset.states.length === 0
              const slotPending = (target: SlotTarget) => {
                if (!generationInProgress || visibleImageCount === undefined) return false
                const current = slotCurrentRecord(asset, target, tasks)
                return current.kind === 'visual' && !revealedVisuals.has(`${asset.id}:${current.versionIndex}`)
              }
              return <section key={asset.id} aria-label={`${CATEGORY_LABEL[category]} / ${asset.name}`}>
                <div className="mb-2.5 flex items-center gap-2"><h4 className="text-[11px] font-semibold">{asset.name}</h4><span className="text-[8px] text-[#161823]/34">{asset.role}</span>{asset.enabled === false && <span className="rounded bg-[#f2f3f5] px-1.5 py-0.5 text-[8px] text-[#161823]/42">已停用</span>}</div>
                <div className={slotGridClass}>
                  {baseOnly
                    ? <SlotCard asset={asset} target={{ kind: 'base', assetId: asset.id }} tasks={tasks} pending={slotPending({ kind: 'base', assetId: asset.id })} canvasGroup={canvasEditing} onOpen={() => openDetail({ kind: 'base', assetId: asset.id })} onToggle={() => toggleSlot(asset, { kind: 'base', assetId: asset.id })} />
                    : <>
                      <SlotCard asset={asset} target={{ kind: 'base', assetId: asset.id }} tasks={tasks} pending={slotPending({ kind: 'base', assetId: asset.id })} label={designSlotLabel(asset)} showToggle={false} canvasGroup={canvasEditing} onOpen={() => openDetail({ kind: 'base', assetId: asset.id })} onToggle={() => {}} />
                      {asset.states.map((state) => {
                        const target: SlotTarget = { kind: 'state', assetId: asset.id, stateId: state.id }
                        return <SlotCard key={state.id} asset={asset} target={target} tasks={tasks} pending={slotPending(target)} forceEmpty={!productionApplied} canvasGroup={canvasEditing} onOpen={() => openDetail(target)} onToggle={() => toggleSlot(asset, target)} />
                      })}
                    </>}
                </div>
              </section>
            })}
          </div>
          )}
        </section>
      })}
      {!canvasEditing && filteredAssets.length === 0 && <div className="grid h-48 place-items-center text-[10px] text-[#161823]/34">没有符合条件的资产槽位</div>}
      {canvasEditing && canvasSlots.length === 0 && <div className="grid h-48 place-items-center text-[10px] text-[#161823]/34">没有符合条件的资产槽位</div>}
    </div>
    {!hideChrome && (mode === 'art-direction' ? <footer className="flex min-h-[54px] shrink-0 items-center gap-3 border-t border-black/[0.07] bg-white px-4 py-2.5">
      <div className="min-w-0 flex-1"><p className="text-[10px] font-medium">已生成 {activeSlotCount} 个设定槽位</p><p className="mt-0.5 text-[8px] text-[#161823]/36">状态槽位将在确认资产生产清单后展开</p></div>
      <button type="button" onClick={() => onConfirmSelections?.(assets.filter((asset) => asset.enabled !== false).map((asset) => ({ assetId: asset.id, versionIndex: asset.selectedVisualVersion ?? 0 })))} disabled={!onConfirmSelections} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#161823] px-3.5 text-[10px] font-medium text-white disabled:cursor-default disabled:opacity-40">确认设定<ArrowRight className="size-3.5" /></button>
    </footer> : <footer className="flex min-h-[54px] shrink-0 items-center gap-3 border-t border-black/[0.07] bg-white px-4 py-2.5">
      <div className="min-w-0 flex-1"><p className="text-[10px] font-medium">{!productionApplied ? `已建立 ${activeSlotCount} 个规划槽位` : enabledTaskIds.length ? `还有 ${enabledTaskIds.length} 个启用槽位待生成` : '所有启用槽位均已就绪'}</p><p className="mt-0.5 text-[8px] text-[#161823]/36">{!productionApplied ? '状态容器为空，应用规划后填入预置序列帧' : '停用槽位不会删除素材与生成记录'}</p></div>
      {productionApplied && enabledTaskIds.length > 0 && <button type="button" onClick={() => onBatchGenerate?.(enabledTaskIds)} disabled={!onBatchGenerate} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#161823] px-3.5 text-[10px] font-medium text-white disabled:opacity-40"><Sparkles className="size-3.5" />批量生成</button>}
      <button type="button" onClick={onProceed} disabled={!onProceed || (productionApplied && enabledTaskIds.length > 0)} className={`flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[10px] font-medium disabled:cursor-default disabled:opacity-40 ${productionApplied ? 'border border-black/[0.09] bg-white' : 'bg-[#161823] text-white'}`}>{productionApplied ? '进入游戏 UI' : '应用资产生产规划'}<ArrowRight className="size-3.5" /></button>
    </footer>)}
  </div>
}
