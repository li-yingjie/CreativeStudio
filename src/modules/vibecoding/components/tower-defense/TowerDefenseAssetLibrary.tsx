import { useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  Download,
  Image as ImageIcon,
  LayoutGrid,
  Layers,
  Loader2,
  Minus,
  MessageSquarePlus,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  User,
  WandSparkles,
} from '@/shared/icons'
import type {
  SpriteTask,
  TowerDefenseAsset,
  TowerDefenseAssetCategory,
  TowerDefenseDirection,
  TowerDefenseAssetState,
  TowerSlot,
} from './TowerDefenseFlowModel'

export type TowerDefenseAssetLibraryMode = 'art-direction' | 'production'
type CatalogKindFilter = 'all' | 'image' | 'video' | 'audio'

type TowerAssetDetailSource = {
  src: string
  width?: number
  height?: number
  detail?: string
}

type TowerAssetLightbox =
  | { kind: 'visual'; assetId: string; versionIndex: number; versionLabel: string }
  | { kind: 'dynamic'; assetId: string; stateId: string; direction: TowerDefenseDirection }

type StatePatch = Partial<Pick<TowerDefenseAssetState, 'directions' | 'framesPerDirection'>>

export interface TowerDefenseAssetLibraryProps {
  uiScheme?: 'canvas' | 'catalog'
  mode: TowerDefenseAssetLibraryMode
  assets: TowerDefenseAsset[]
  tasks: SpriteTask[]
  towerSlots: TowerSlot[]
  selectedAssetId?: string | null
  onSelectAsset?: (assetId: string) => void
  onAttachAsset?: (assetId: string, versionLabel: string) => void
  onRegenerateAsset?: (assetId: string, versionLabel: string) => void
  onCreateSprite?: (assetId: string, versionIndex: number, versionLabel: string) => void
  onReferenceChange?: (assetId: string, versionIndex: number | null) => void
  onPreviewOpen?: () => void
  visibleImageCount?: number
  generationInProgress?: boolean
  onConfirmSelections?: (selections: Array<{ assetId: string; versionIndex: number }>) => void
  onUpdateState?: (assetId: string, stateId: string, patch: StatePatch) => void
  onAddState?: (assetId: string) => void
  onDeleteState?: (assetId: string, stateId: string) => void
  onGenerateCell?: (assetId: string, stateId: string, direction: TowerDefenseDirection) => void
  onGenerateAsset?: (assetId: string) => void
  onBatchGenerate?: (taskIds: string[]) => void
  onProceed?: () => void
  onAddTowerSlot?: () => void
  onMoveTowerSlot?: (slotId: string, deltaX: number, deltaY: number) => void
  onDeleteTowerSlot?: (slotId: string) => void
}

const DIRECTION_LABEL: Record<TowerDefenseDirection, string> = {
  front: '正面',
  back: '背面',
  left: '向左',
  right: '向右',
  none: '单向',
}

function categoryLabel(category: TowerDefenseAssetCategory): string {
  switch (category) {
    case 'visual-style': return '视觉风格'
    case 'map': return '地图'
    case 'hero': return '英雄'
    case 'enemy': return '敌人'
    case 'tower': return '建筑塔'
  }
}

function CategoryIcon({ category, className }: { category: TowerDefenseAssetCategory; className: string }) {
  switch (category) {
    case 'visual-style': return <Palette className={className} strokeWidth={1.45} />
    case 'map': return <LayoutGrid className={className} strokeWidth={1.45} />
    case 'hero': return <User className={className} strokeWidth={1.45} />
    case 'enemy': return <Target className={className} strokeWidth={1.45} />
    case 'tower': return <Layers className={className} strokeWidth={1.45} />
  }
}

function isConfirmed(asset: TowerDefenseAsset): boolean {
  return asset.baseVisualStatus === 'confirmed'
}

function taskForCell(
  tasks: SpriteTask[],
  assetId: string,
  stateId: string,
  direction: TowerDefenseDirection,
): SpriteTask | undefined {
  return tasks.find(
    (task) => task.assetId === assetId && task.stateId === stateId && task.direction === direction,
  )
}

function AssetArtwork({ asset, compact = false, fill = false, versionIndex = 0 }: { asset: TowerDefenseAsset; compact?: boolean; fill?: boolean; versionIndex?: number }) {
  const version = asset.visualVersions?.[versionIndex]
  return (
    <div
      className={`relative isolate overflow-hidden bg-[#20242a] ${fill ? 'h-full w-full' : version ? 'w-full' : compact ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}
      style={{
        background: `linear-gradient(${145 + versionIndex * 18}deg, ${asset.accent} 0%, ${versionIndex % 2 ? '#30343c' : '#252932'} 48%, #121419 100%)`,
        aspectRatio: !fill && version ? `${version.width} / ${version.height}` : undefined,
      }}
    >
      {version ? <img src={version.src} alt={`${asset.name} 方案 ${versionIndex + 1}`} className="absolute inset-0 block size-full object-cover" /> : <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px)', backgroundSize: compact ? '18px 18px' : '28px 28px' }} />}
      <div className="absolute -right-[8%] -top-[24%] size-[72%] rounded-full border border-white/10 bg-white/[0.06]" />
      <div className="absolute -bottom-[48%] -left-[10%] size-[82%] rounded-full border border-white/10 bg-black/20" />
      {!version && <div className="relative flex h-full items-center justify-center">
        <div className={`${compact ? 'size-10 rounded-xl' : 'size-20 rounded-[22px]'} flex items-center justify-center border border-white/20 bg-black/25 text-white shadow-[0_18px_45px_rgba(0,0,0,.28)] backdrop-blur-sm`}>
          <CategoryIcon category={asset.category} className={compact ? 'size-5' : 'size-9'} />
        </div>
      </div>}
      {!version && !compact && (
        <div className="absolute bottom-3 left-3 rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[10px] font-medium tracking-[0.12em] text-white/78 backdrop-blur">
          WORLD STYLE / {categoryLabel(asset.category)}
        </div>
      )}
    </div>
  )
}

function visualAspect(asset: TowerDefenseAsset, versionIndex: number): number {
  const version = asset.visualVersions?.[versionIndex]
  if (version) return version.width / version.height
  if (asset.category === 'visual-style') return versionIndex % 2 ? 9 / 16 : 16 / 9
  if (asset.category === 'map') return versionIndex % 3 === 1 ? 4 / 3 : 16 / 9
  if (asset.category === 'hero') return versionIndex % 2 ? 4 / 5 : 3 / 4
  if (asset.category === 'enemy') return versionIndex % 3 === 2 ? 1 : 4 / 5
  if (asset.category === 'tower') return versionIndex % 2 ? 4 / 3 : 1
  return versionIndex % 2 ? 3 / 2 : 4 / 3
}

function visualBaseWidth(asset: TowerDefenseAsset): number {
  const first = asset.visualVersions?.[0]
  const ratio = first ? first.width / first.height : 1
  if (ratio >= 1.5) return 340
  if (ratio <= 0.75) return 200
  if (asset.category === 'map' || asset.category === 'visual-style') return 280
  if (asset.category === 'hero' || asset.category === 'enemy') return 220
  if (asset.category === 'tower') return 260
  return 240
}

function TowerAssetImageDialog({
  asset,
  versionIndex,
  versionLabel,
  source,
  onAttach,
  onRegenerate,
  onCreateSprite,
  onClose,
}: {
  asset: TowerDefenseAsset
  versionIndex: number
  versionLabel: string
  source?: TowerAssetDetailSource
  onAttach: () => void
  onRegenerate: () => void
  onCreateSprite?: () => void
  onClose: () => void
}) {
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const version = asset.visualVersions?.[versionIndex]
  const sourceUrl = source?.src ?? version?.src
  const sourceWidth = source?.width ?? version?.width
  const sourceHeight = source?.height ?? version?.height
  const longForm = naturalSize.width > 0 && naturalSize.height / naturalSize.width > 2.4

  return (
    <div role="dialog" aria-modal="true" aria-label={`${asset.name}${versionLabel}素材详情`} className="absolute inset-0 z-50 flex min-h-0 flex-col bg-white">
      <header className="flex h-13 shrink-0 items-center gap-3 border-b border-black/[0.08] bg-white px-4 text-[#161823]">
        <button type="button" onClick={onClose} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-[#161823]/68 hover:bg-[#F2F3F5] hover:text-[#161823]">
          <ArrowLeft className="size-4" />返回素材库
        </button>
        <span className="h-5 w-px bg-black/[0.08]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{asset.name} · {versionLabel}</p>
          <p className="mt-0.5 truncate text-[9px] text-[#161823]/38">{asset.role}{sourceWidth && sourceHeight ? ` · ${sourceWidth} × ${sourceHeight}` : ''}</p>
        </div>
        <button type="button" onClick={onAttach} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[10px] font-medium text-[#161823]/68 hover:bg-[#F2F3F5] hover:text-[#161823]"><MessageSquarePlus className="size-3.5" />添加到 Chat</button>
        <button type="button" onClick={onRegenerate} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[10px] font-medium text-[#161823]/68 hover:bg-[#F2F3F5] hover:text-[#161823]"><RefreshCw className="size-3.5" />重新生成</button>
        {onCreateSprite && <button type="button" onClick={onCreateSprite} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[10px] font-medium text-[#161823]/68 hover:bg-[#F2F3F5] hover:text-[#161823]"><WandSparkles className="size-3.5" />制作序列帧</button>}
        {sourceUrl && <a href={sourceUrl} download={`${asset.name}_${versionLabel}.png`} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[10px] font-medium text-white hover:bg-black"><Download className="size-3.5" />下载原图</a>}
      </header>
      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-[#F4F5F7] p-6 [background-image:radial-gradient(circle,rgba(22,24,35,0.12)_1px,transparent_1px)] [background-size:20px_20px]">
          <div className={`flex min-h-full min-w-full ${longForm ? 'items-start' : 'items-center'} justify-center`}>
            <div className="inline-block overflow-hidden bg-white leading-none shadow-[0_18px_70px_rgba(31,35,41,0.18)]">
              {sourceUrl ? <img src={sourceUrl} alt={`${asset.name} · ${versionLabel}`} onLoad={(event) => setNaturalSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} className={`block h-auto object-contain ${longForm ? 'max-h-none' : 'max-h-[calc(100vh-190px)] max-w-[calc(100vw-760px)]'}`} style={longForm ? { width: 'min(520px, calc(100vw - 760px))' } : undefined} /> : <div className="h-[70vh] w-[60vw]"><AssetArtwork asset={asset} fill versionIndex={versionIndex} /></div>}
            </div>
          </div>
        </div>
        <aside className="thin-scroll w-[280px] shrink-0 overflow-y-auto border-l border-black/[0.08] bg-white p-4">
          <h3 className="text-[12px] font-semibold text-[#161823]">素材信息</h3>
          <dl className="mt-4 space-y-4 text-[10px]">
            <div><dt className="text-[#161823]/38">分类</dt><dd className="mt-1 font-medium text-[#161823]">{categoryLabel(asset.category)}</dd></div>
            <div><dt className="text-[#161823]/38">角色定位</dt><dd className="mt-1 font-medium text-[#161823]">{asset.role}</dd></div>
            <div><dt className="text-[#161823]/38">当前方案</dt><dd className="mt-1 font-medium text-[#161823]">{versionLabel}</dd></div>
            {source?.detail && <div><dt className="text-[#161823]/38">动态规格</dt><dd className="mt-1 font-medium text-[#161823]">{source.detail}</dd></div>}
            {sourceWidth && sourceHeight && <div><dt className="text-[#161823]/38">原始尺寸</dt><dd className="mt-1 font-medium text-[#161823]">{sourceWidth} × {sourceHeight}</dd></div>}
          </dl>
          <div className="mt-6 border-t border-black/[0.06] pt-4"><p className="text-[9px] leading-5 text-[#161823]/42">当前为单素材详情视图。返回素材库后可继续引用、重新生成或切换其他方案。</p></div>
        </aside>
      </div>
    </div>
  )
}

function AssetVersionCard({
  asset,
  versionIndex,
  referenced,
  generating,
  loadingLabel = '生成中',
  onOpen,
  onDownload,
  onAttach,
  onRegenerate,
  onReference,
  zoom,
}: {
  asset: TowerDefenseAsset
  versionIndex: number
  referenced: boolean
  generating?: boolean
  loadingLabel?: string
  onOpen: () => void
  onDownload: () => void
  onAttach: () => void
  onRegenerate: () => void
  onReference: () => void
  zoom: number
}) {
  const versionLabel = `方案 ${String.fromCharCode(65 + versionIndex)}`
  const version = asset.visualVersions?.[versionIndex]
  const baseWidth = visualBaseWidth(asset)
  const aspectRatio = visualAspect(asset, versionIndex)
  const bodyHeight = Math.round(baseWidth / aspectRatio)
  const scaledWidth = Math.round(baseWidth * zoom)
  const scaledHeight = Math.round((44 + bodyHeight) * zoom)
  return (
    <div className="shrink-0 transition-[width,height] duration-150" style={{ width: scaledWidth, height: scaledHeight }}>
      <figure
        style={{ containerType: 'inline-size', width: baseWidth, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        className={`tower-asset-version group overflow-hidden rounded-xl border bg-white text-left shadow-[0_18px_48px_rgba(31,35,41,0.12)] ${zoom < 0.85 ? 'tower-compact-actions' : ''} ${referenced ? 'border-emerald-400/70 ring-1 ring-emerald-400/25' : 'border-black/[0.08]'}`}
      >
      <figcaption className="flex h-11 items-center gap-2 border-b border-black/[0.06] px-3">
        <ImageIcon className="size-3.5 shrink-0 text-[#161823]/38" />
        <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-[#161823]/68">{asset.name} · {versionLabel}</span>
        <span className="secondary shrink-0 text-[8px] text-[#161823]/28">{baseWidth} × {bodyHeight}</span>
        <div className="tower-variant-actions flex shrink-0 items-center gap-0.5">
          <button type="button" aria-label={`下载${asset.name}${versionLabel}`} onClick={onDownload} className="secondary grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><Download className="size-3" /></button>
          <button type="button" aria-label={`添加到对话：${asset.name}${versionLabel}`} onClick={onAttach} className="secondary grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><MessageSquarePlus className="size-3" /></button>
          <button type="button" aria-label={`重新生成${asset.name}${versionLabel}`} onClick={onRegenerate} className="secondary grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><RefreshCw className="size-3" /></button>
          <button type="button" aria-pressed={referenced} aria-label={`${referenced ? '已引用' : '标记引用'}：${asset.name}${versionLabel}`} onClick={onReference} className={`grid size-6 place-items-center rounded-md ${referenced ? 'bg-emerald-50 text-emerald-600' : 'text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]'}`}><Check className="size-3" /></button>
        </div>
      </figcaption>
      <div className="relative flex items-center justify-center overflow-hidden bg-[#F6F7F8]" style={{ height: bodyHeight }}>
        <button type="button" onClick={onOpen} className="h-full w-full" aria-label={`查看${asset.name}${versionLabel}`}>
          {version ? (
            <img src={version.src} alt={`${asset.name} · ${versionLabel}`} className="block size-full object-cover" />
          ) : (
            <AssetArtwork asset={asset} fill versionIndex={versionIndex} />
          )}
        </button>
        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F2F3F5] text-[#161823]">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-[10px] font-medium">{loadingLabel}</span>
          </div>
        )}
        {referenced && !generating && <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-emerald-500 px-2 py-1 text-[8px] font-medium text-white shadow-sm">已引用</span>}
      </div>
      </figure>
    </div>
  )
}

function CatalogAssetCard({
  asset,
  versionIndex,
  versionLabel,
  referenced,
  generating,
  loadingLabel = '生成中',
  onOpen,
  onDownload,
  onAttach,
  onRegenerate,
  onReference,
}: {
  asset: TowerDefenseAsset
  versionIndex: number
  versionLabel: string
  referenced: boolean
  generating?: boolean
  loadingLabel?: string
  onOpen: () => void
  onDownload: () => void
  onAttach: () => void
  onRegenerate: () => void
  onReference: () => void
}) {
  const version = asset.visualVersions?.[versionIndex]
  const fileName = `${asset.name}_${versionLabel.replace(' ', '_')}.png`
  return (
    <article className={`group min-w-0 ${referenced ? 'text-emerald-600' : 'text-[#161823]'}`}>
      <div className={`relative aspect-square overflow-hidden rounded-xl border bg-[#f2f3f5] ${referenced ? 'border-emerald-400 ring-1 ring-emerald-400/20' : 'border-black/[0.06]'}`}>
        <button type="button" onClick={onOpen} className="block size-full" aria-label={`查看${asset.name}${versionLabel}`}>
          {version ? (
            <img src={version.src} alt={`${asset.name} · ${versionLabel}`} className="block size-full object-cover" />
          ) : (
            <AssetArtwork asset={asset} fill versionIndex={versionIndex} />
          )}
        </button>
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-white/92 p-1 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" aria-label={`下载${asset.name}${versionLabel}`} onClick={onDownload} className="grid size-7 place-items-center rounded-md text-[#161823]/52 hover:bg-[#f2f3f5] hover:text-[#161823]"><Download className="size-3.5" /></button>
          <button type="button" aria-label={`添加到对话：${asset.name}${versionLabel}`} onClick={onAttach} className="grid size-7 place-items-center rounded-md text-[#161823]/52 hover:bg-[#f2f3f5] hover:text-[#161823]"><MessageSquarePlus className="size-3.5" /></button>
          <button type="button" aria-label={`重新生成${asset.name}${versionLabel}`} onClick={onRegenerate} className="grid size-7 place-items-center rounded-md text-[#161823]/52 hover:bg-[#f2f3f5] hover:text-[#161823]"><RefreshCw className="size-3.5" /></button>
        </div>
        <button
          type="button"
          aria-pressed={referenced}
          aria-label={`${referenced ? '已引用' : '标记引用'}：${asset.name}${versionLabel}`}
          onClick={onReference}
          className={`absolute bottom-2 right-2 grid size-7 place-items-center rounded-full border shadow-sm ${referenced ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-white/80 bg-white/92 text-[#161823]/42 hover:text-[#161823]'}`}
        >
          <Check className="size-3.5" />
        </button>
        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F2F3F5] text-[#161823]">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-[11px] font-medium">{loadingLabel}</span>
          </div>
        )}
      </div>
      <div className="pt-2">
        <div className="truncate text-[12px] font-semibold text-[#161823]">{fileName}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span className="rounded bg-[#eee8ff] px-1.5 py-0.5 text-[9px] font-medium text-[#7656b7]">工具生成</span>
          <span className="rounded border border-black/[0.08] bg-white px-1.5 py-0.5 text-[9px] font-medium text-[#161823]/56">图片</span>
        </div>
        <div className="mt-1.5 truncate text-[10px] text-[#161823]/36">game/assets/{asset.category}/{version?.id ?? asset.id}</div>
      </div>
    </article>
  )
}

function EmptyStateGrid({ state }: { state: TowerDefenseAssetState }) {
  return (
    <div className="grid grid-cols-4 gap-1.5" aria-label={`${state.name}待生成方向`}>
      {state.directions.map((direction) => (
        <div key={direction} className="flex aspect-square items-center justify-center rounded-md border border-dashed border-[#161823]/14 bg-[#f7f7f8]">
          <span className="text-[9px] text-[#161823]/32">{DIRECTION_LABEL[direction]}</span>
        </div>
      ))}
    </div>
  )
}

function StateProductionRow({
  asset,
  state,
  tasks,
  mode,
  onUpdateState,
  onDeleteState,
  onGenerateCell,
  onOpenDynamic,
}: {
  asset: TowerDefenseAsset
  state: TowerDefenseAssetState
  tasks: SpriteTask[]
  mode: TowerDefenseAssetLibraryMode
  onUpdateState?: TowerDefenseAssetLibraryProps['onUpdateState']
  onDeleteState?: TowerDefenseAssetLibraryProps['onDeleteState']
  onGenerateCell?: TowerDefenseAssetLibraryProps['onGenerateCell']
  onOpenDynamic?: (assetId: string, stateId: string, direction: TowerDefenseDirection) => void
}) {
  const directionOptions: TowerDefenseDirection[] = state.directions.includes('none')
    ? ['none']
    : ['front', 'back', 'left', 'right']
  const visibleDirections = state.directions

  const toggleDirection = (direction: TowerDefenseDirection) => {
    if (!onUpdateState) return
    const hasDirection = state.directions.includes(direction)
    const next = hasDirection
      ? state.directions.filter((item) => item !== direction)
      : [...state.directions, direction]
    if (next.length > 0) onUpdateState(asset.id, state.id, { directions: next })
  }

  return (
    <section className="rounded-xl border border-[var(--divider-soft)] bg-white p-2.5">
      <div className="flex items-start gap-1.5">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h4 className="shrink-0 whitespace-nowrap text-[11px] font-semibold text-[var(--color-ink)]">{state.name}</h4>
            <span className="shrink-0 whitespace-nowrap text-[8px] text-[#161823]/38">方向 {state.directions.length}</span>
          </div>
          {mode === 'art-direction' && <p className="mt-1 text-[10px] text-[var(--color-ink)]/40">先规划状态规格，制作阶段再生成动态帧。</p>}
        </div>

        {onDeleteState && (
          <button
            type="button"
            aria-label={`删除${state.name}状态`}
            onClick={() => onDeleteState(asset.id, state.id)}
            className="grid size-7 place-items-center rounded-md text-[#161823]/32 hover:bg-rose-50 hover:text-rose-500"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {onUpdateState && (
        <div className="thin-scroll mt-2 flex flex-nowrap items-center gap-1 overflow-x-auto pb-0.5" aria-label={`${state.name}方向设置`}>
          {directionOptions.map((direction) => {
            const enabled = state.directions.includes(direction)
            return (
              <button
                key={direction}
                type="button"
                aria-pressed={enabled}
                onClick={() => toggleDirection(direction)}
                className={`shrink-0 whitespace-nowrap rounded-md border px-1.5 py-1 text-[8px] font-medium ${enabled ? 'border-[#161823] bg-[#161823] text-white' : 'border-[#dcdddf] bg-white text-[#161823]/46 hover:bg-[#f5f5f6]'}`}
              >
                {DIRECTION_LABEL[direction]}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-2.5">
        {mode === 'art-direction' ? (
          <EmptyStateGrid state={state} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(72px,1fr))] gap-1.5">
            {visibleDirections.map((direction) => {
              const task = taskForCell(tasks, asset.id, state.id, direction)
              const status = task?.status ?? 'queued'
              const outputPreview = task?.output?.previewUrl ?? task?.output?.spriteSheetUrl
              const canOpen = Boolean(outputPreview && onOpenDynamic)
              return (
                <button
                  key={direction}
                  type="button"
                  disabled={!canOpen && (!onGenerateCell || status === 'generating')}
                  onClick={() => {
                    if (canOpen) {
                      onOpenDynamic?.(asset.id, state.id, direction)
                      return
                    }
                    onGenerateCell?.(asset.id, state.id, direction)
                  }}
                  aria-label={canOpen
                    ? `查看${asset.name}${state.name}${DIRECTION_LABEL[direction]}动态素材`
                    : `生成${asset.name}${state.name}${DIRECTION_LABEL[direction]}动态素材`}
                  className="group relative aspect-[4/3] min-w-[72px] overflow-hidden rounded-lg border border-black/[0.08] bg-[#f5f5f6] shadow-[0_6px_18px_rgba(31,35,41,0.07)] transition-colors enabled:hover:border-black/25 disabled:cursor-default"
                >
                  {outputPreview && (
                    <img
                      src={outputPreview}
                      alt={`${asset.name}${state.name}${DIRECTION_LABEL[direction]}动态帧`}
                      className="absolute inset-0 size-full bg-white object-contain"
                    />
                  )}
                  {!outputPreview && <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f1f2_25%,transparent_25%,transparent_75%,#f0f1f2_75%),linear-gradient(45deg,#f0f1f2_25%,#fafafa_25%,#fafafa_75%,#f0f1f2_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]" />}
                  {status === 'generating' && <div className="absolute inset-0 grid place-items-center bg-[#f1f1f2]"><Loader2 className="size-5 animate-spin text-[#161823]/55" /></div>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function TowerSlotMap({
  asset,
  slots,
  onAdd,
  onMove,
  onDelete,
}: {
  asset: TowerDefenseAsset
  slots: TowerSlot[]
  onAdd?: () => void
  onMove?: (slotId: string, deltaX: number, deltaY: number) => void
  onDelete?: (slotId: string) => void
}) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(slots[0]?.id ?? null)
  const selected = slots.find((slot) => slot.id === selectedSlotId) ?? null

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-black/10 bg-[#1e2730]" style={{ background: `linear-gradient(145deg, ${asset.accent}, #24342f 48%, #172024)` }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 16% 24%, rgba(255,255,255,.7) 0 2px, transparent 3px), radial-gradient(circle at 72% 68%, rgba(255,255,255,.5) 0 2px, transparent 3px)', backgroundSize: '44px 44px, 58px 58px' }} />
        <div className="absolute left-[10%] top-[12%] h-[28%] w-[28%] rotate-[-8deg] rounded-[48%] bg-black/14 blur-[1px]" />
        <div className="absolute bottom-[12%] right-[8%] h-[32%] w-[34%] rotate-[12deg] rounded-[48%] bg-black/14 blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {slots.map((slot, index) => {
          const active = selectedSlotId === slot.id
          return (
            <button
              key={slot.id}
              type="button"
              aria-label={`选择建造塔位 ${index + 1}`}
              aria-pressed={active}
              onClick={() => setSelectedSlotId(slot.id)}
              className={`absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[11px] font-semibold shadow-[0_4px_12px_rgba(0,0,0,.28)] transition-transform hover:scale-105 ${active ? 'border-white bg-[#161823] text-white ring-4 ring-white/20' : 'border-white/80 bg-white/85 text-[#161823]'}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              {index + 1}
            </button>
          )
        })}
        <div className="absolute bottom-3 left-3 rounded-md bg-black/35 px-2 py-1 text-[10px] text-white/82 backdrop-blur-sm">
          建造塔位 · {slots.length}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--divider-soft)] bg-[#f7f7f8] p-2.5">
        <button
          type="button"
          onClick={onAdd}
          disabled={!onAdd}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[10px] font-medium text-white disabled:cursor-default disabled:opacity-40"
        >
          <Plus className="size-3.5" /> 添加塔位
        </button>
        {selected ? (
          <>
            <span className="ml-1 text-[10px] font-medium text-[#161823]/65">塔位 {slots.findIndex((slot) => slot.id === selected.id) + 1}</span>
            <div className="grid grid-cols-3 gap-0.5" aria-label="移动当前塔位">
              <span />
              <button type="button" aria-label="向上移动塔位" onClick={() => onMove?.(selected.id, 0, -3)} disabled={!onMove} className="flex size-6 items-center justify-center rounded bg-white text-[#161823]/55 shadow-sm hover:text-[#161823] disabled:cursor-default disabled:opacity-40"><ArrowUp className="size-3" /></button>
              <span />
              <button type="button" aria-label="向左移动塔位" onClick={() => onMove?.(selected.id, -3, 0)} disabled={!onMove} className="flex size-6 items-center justify-center rounded bg-white text-[#161823]/55 shadow-sm hover:text-[#161823] disabled:cursor-default disabled:opacity-40"><ArrowLeft className="size-3" /></button>
              <span className="flex size-6 items-center justify-center rounded bg-[#161823]/5 text-[8px] tabular-nums text-[#161823]/38">{Math.round(selected.x)},{Math.round(selected.y)}</span>
              <button type="button" aria-label="向右移动塔位" onClick={() => onMove?.(selected.id, 3, 0)} disabled={!onMove} className="flex size-6 items-center justify-center rounded bg-white text-[#161823]/55 shadow-sm hover:text-[#161823] disabled:cursor-default disabled:opacity-40"><ArrowRight className="size-3" /></button>
              <span />
              <button type="button" aria-label="向下移动塔位" onClick={() => onMove?.(selected.id, 0, 3)} disabled={!onMove} className="flex size-6 items-center justify-center rounded bg-white text-[#161823]/55 shadow-sm hover:text-[#161823] disabled:cursor-default disabled:opacity-40"><ArrowDown className="size-3" /></button>
              <span />
            </div>
            <button
              type="button"
              aria-label="删除当前塔位"
              onClick={() => {
                onDelete?.(selected.id)
                setSelectedSlotId(slots.find((slot) => slot.id !== selected.id)?.id ?? null)
              }}
              disabled={!onDelete}
              className="ml-auto flex size-8 items-center justify-center rounded-lg border border-[#dcdddf] bg-white text-[#161823]/48 hover:border-red-200 hover:text-red-500 disabled:cursor-default disabled:opacity-40"
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        ) : (
          <span className="text-[10px] text-[#161823]/40">添加后可选择、编号和微调位置</span>
        )}
      </div>
    </div>
  )
}

// 地图塔位编辑保留为后续独立工具能力，不再挂在资产 Canvas 尾部。
void TowerSlotMap

export default function TowerDefenseAssetLibrary({
  uiScheme = 'canvas',
  mode,
  assets,
  tasks,
  selectedAssetId,
  onSelectAsset,
  onAttachAsset,
  onRegenerateAsset,
  onCreateSprite,
  onReferenceChange,
  onPreviewOpen,
  visibleImageCount,
  generationInProgress = false,
  onConfirmSelections,
  onUpdateState,
  onAddState,
  onDeleteState,
  onGenerateCell,
  onBatchGenerate,
  onProceed,
}: TowerDefenseAssetLibraryProps) {
  const [zoom, setZoom] = useState(1)
  const [catalogKindFilter, setCatalogKindFilter] = useState<CatalogKindFilter>('all')
  const [catalogQuery, setCatalogQuery] = useState('')
  const [catalogCategory, setCatalogCategory] = useState<TowerDefenseAssetCategory | 'all'>('all')
  const [catalogSource, setCatalogSource] = useState<'all' | 'generated' | 'uploaded'>('all')
  const [catalogCanvasEditing, setCatalogCanvasEditing] = useState(false)
  const [internalAssetId, setInternalAssetId] = useState(assets[0]?.id ?? '')
  const [versionOrder, setVersionOrder] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(assets.map((asset) => [asset.id, Array.from({ length: asset.visualVersions?.length ?? 1 }, (_, index) => index)])),
  )
  const [generatedSources, setGeneratedSources] = useState<Record<string, number>>({})
  const [generatingVersions, setGeneratingVersions] = useState<Set<string>>(new Set())
  const draggedVersionRef = useRef<{ assetId: string; versionId: number } | null>(null)
  const [referencedVersions, setReferencedVersions] = useState<Record<string, number>>(() =>
    Object.fromEntries(assets.filter(isConfirmed).map((asset) => [asset.id, asset.selectedVisualVersion ?? 0])),
  )
  const [lightbox, setLightbox] = useState<TowerAssetLightbox | null>(null)
  // 资产分类、行与卡片始终完整挂载；生成进度只控制卡片内部图片何时显现。
  const visibleAssets = assets
  const currentAssetId = selectedAssetId ?? internalAssetId
  const selectedAsset = visibleAssets.find((asset) => asset.id === currentAssetId) ?? visibleAssets[0]
  const effectiveUiScheme = uiScheme === 'catalog' && catalogCanvasEditing ? 'canvas' : uiScheme
  const catalogFilterValue = catalogCategory !== 'all'
    ? `category:${catalogCategory}`
    : catalogSource !== 'all'
      ? `source:${catalogSource}`
      : 'all'

  const categories = Array.from(new Set(visibleAssets.map((asset) => asset.category)))
  const orderedImageKeys = visibleAssets.flatMap((asset) =>
    (versionOrder[asset.id] ?? []).map((versionId) => `${asset.id}:${versionId}`),
  )
  const revealedImageKeys = new Set(orderedImageKeys.slice(0, visibleImageCount ?? orderedImageKeys.length))
  const isProgressiveImagePending = (versionKey: string) =>
    mode === 'art-direction' && visibleImageCount !== undefined && !revealedImageKeys.has(versionKey)
  const pendingTaskIds = tasks.filter((task) => task.status === 'queued' || task.status === 'failed').map((task) => task.id)
  const queuedTaskCount = tasks.filter((task) => task.status === 'queued').length
  const generatingTaskCount = tasks.filter((task) => task.status === 'generating').length
  const failedTaskCount = tasks.filter((task) => task.status === 'failed').length
  const blockingTaskCount = queuedTaskCount + generatingTaskCount + failedTaskCount
  const catalogEntries = visibleAssets.flatMap((asset) =>
    (versionOrder[asset.id] ?? []).map((versionId, orderIndex) => ({
      asset,
      versionId,
      orderIndex,
      sourceVersionIndex: generatedSources[`${asset.id}:${versionId}`] ?? versionId,
    })),
  ).filter(({ asset, orderIndex }) => {
    if (catalogKindFilter !== 'all' && catalogKindFilter !== 'image') return false
    if (catalogCategory !== 'all' && asset.category !== catalogCategory) return false
    if (catalogSource === 'uploaded') return false
    const query = catalogQuery.trim().toLocaleLowerCase()
    return !query || `${asset.name} ${asset.role} 方案 ${String.fromCharCode(65 + orderIndex)}`.toLocaleLowerCase().includes(query)
  }).sort((left, right) => right.versionId - left.versionId)

  const selectAsset = (assetId: string) => {
    setInternalAssetId(assetId)
    onSelectAsset?.(assetId)
  }
  const openAssetPreview = (assetId: string, versionIndex: number, versionLabel: string) => {
    selectAsset(assetId)
    onPreviewOpen?.()
    setLightbox({ kind: 'visual', assetId, versionIndex, versionLabel })
  }
  const openDynamicPreview = (assetId: string, stateId: string, direction: TowerDefenseDirection) => {
    selectAsset(assetId)
    onPreviewOpen?.()
    setLightbox({ kind: 'dynamic', assetId, stateId, direction })
  }
  const setReferencedVersion = (assetId: string, versionIndex: number) => {
    setReferencedVersions((current) => {
      if (current[assetId] !== versionIndex) {
        onReferenceChange?.(assetId, generatedSources[`${assetId}:${versionIndex}`] ?? versionIndex)
        return { ...current, [assetId]: versionIndex }
      }
      const next = { ...current }
      delete next[assetId]
      onReferenceChange?.(assetId, null)
      return next
    })
  }
  const regenerateVersion = (assetId: string, sourceVersionId: number, versionLabel: string) => {
    const currentIds = versionOrder[assetId] ?? []
    const nextVersionId = Math.max(-1, ...currentIds) + 1
    const versionKey = `${assetId}:${nextVersionId}`
    setGeneratedSources((current) => ({ ...current, [versionKey]: generatedSources[`${assetId}:${sourceVersionId}`] ?? sourceVersionId }))
    setVersionOrder((current) => ({ ...current, [assetId]: [nextVersionId, ...(current[assetId] ?? [])] }))
    setGeneratingVersions((current) => new Set(current).add(versionKey))
    onRegenerateAsset?.(assetId, versionLabel)
    window.setTimeout(() => {
      setGeneratingVersions((current) => {
        const next = new Set(current)
        next.delete(versionKey)
        return next
      })
    }, 2200)
  }
  const moveVersion = (assetId: string, targetVersionId: number) => {
    const dragged = draggedVersionRef.current
    if (!dragged || dragged.assetId !== assetId || dragged.versionId === targetVersionId) return
    setVersionOrder((current) => {
      const order = [...(current[assetId] ?? [])]
      const from = order.indexOf(dragged.versionId)
      const to = order.indexOf(targetVersionId)
      if (from < 0 || to < 0) return current
      order.splice(to, 0, order.splice(from, 1)[0])
      return { ...current, [assetId]: order }
    })
  }
  const downloadVersion = (asset: TowerDefenseAsset, versionLabel: string) => {
    const versionIndex = Math.max(0, versionLabel.charCodeAt(versionLabel.length - 1) - 65)
    const source = asset.visualVersions?.[versionIndex]?.src
    if (source) {
      const link = document.createElement('a')
      link.href = source
      link.download = `${asset.name}-${versionLabel}.webp`
      link.click()
      return
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><rect width="1200" height="900" fill="${asset.accent}"/><text x="60" y="780" fill="white" font-size="54" font-family="sans-serif">${asset.name} · ${versionLabel}</text></svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${asset.name}-${versionLabel}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!selectedAsset) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#EEF0F3]">
        <header className="flex h-[58px] shrink-0 items-center border-b border-black/[0.06] bg-white px-4 text-[13px] font-semibold">游戏资产库</header>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-[#161823]/45">
          <span className={generationInProgress ? 'size-6 animate-spin rounded-full border-2 border-[#161823]/12 border-t-[#161823]/60' : ''}>{generationInProgress ? null : <Sparkles className="size-7" />}</span>
          <p className="text-[12px] font-medium">{generationInProgress ? '正在生成第 1 项视觉设定' : '先在 Chat 中完成视觉意图选择'}</p>
          <p className="text-[10px]">{generationInProgress ? '生成完成后会自动加入当前分类' : '开始生成后，图片会依次出现在这里'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col bg-[var(--color-surface-0)]">
      {catalogCanvasEditing && <header className="flex h-[48px] shrink-0 items-center border-b border-[var(--divider-soft)] bg-white px-4">
        <button type="button" onClick={() => setCatalogCanvasEditing(false)} className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-[#161823]/68 hover:bg-[#F2F3F5] hover:text-[#161823]"><ArrowLeft className="size-4" />返回</button>
      </header>}

      {effectiveUiScheme === 'canvas' && !catalogCanvasEditing && <header className="flex min-h-[58px] shrink-0 flex-wrap items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#161823] text-white">
            {mode === 'art-direction' ? <Palette className="size-4" /> : <Sparkles className="size-4" />}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold text-[var(--color-ink)]">游戏资产库</h2>
            <p className="truncate text-[10px] text-[var(--color-ink)]/42">
              {mode === 'art-direction' ? '美术设定 · 确认世界观下的统一视觉与状态规划' : '资产制作 · 按已确认规格生成可用动态素材'}
            </p>
          </div>
        </div>
        <span className="ml-auto rounded-full bg-[#f2f3f5] px-2 py-1 text-[10px] font-medium text-[#161823]/55">
          {mode === 'art-direction' ? '设定阶段' : '制作阶段'}
        </span>
      </header>}

      {effectiveUiScheme === 'catalog' && (
        <div aria-label="游戏资产库筛选工具栏" className="flex h-12 shrink-0 items-center gap-2 overflow-x-auto whitespace-nowrap border-b border-[var(--divider-soft)] bg-white px-4">
          <div className="flex shrink-0 items-center gap-1">
            {([
              ['all', '全部'],
              ['image', '图片'],
              ['video', '视频'],
              ['audio', '音频'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={catalogKindFilter === value}
                onClick={() => setCatalogKindFilter(value)}
                className={`h-7 rounded-lg px-3 text-[11px] font-medium ${catalogKindFilter === value ? 'bg-[#f2f3f5] text-[#161823]' : 'text-[#161823]/48 hover:text-[#161823]'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex h-8 min-w-[160px] flex-1 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 text-[#161823]/38">
              <Search className="size-4 shrink-0" />
              <input
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="搜索素材名称"
                className="min-w-0 flex-1 bg-transparent text-[11px] text-[#161823] outline-none placeholder:text-[#161823]/30"
              />
          </label>
          <label className="relative shrink-0">
              <select
                aria-label="素材分类与来源"
                value={catalogFilterValue}
                onChange={(event) => {
                  const [kind, value] = event.target.value.split(':')
                  setCatalogCategory(kind === 'category' ? value as TowerDefenseAssetCategory : 'all')
                  setCatalogSource(kind === 'source' ? value as 'generated' | 'uploaded' : 'all')
                }}
                className="h-8 appearance-none rounded-xl border border-black/[0.08] bg-white pl-3 pr-8 text-[10px] font-medium text-[#161823]/68 outline-none"
              >
                <option value="all">分类与来源</option>
                <optgroup label="素材分类">
                  {categories.map((category) => <option key={category} value={`category:${category}`}>{categoryLabel(category)}</option>)}
                </optgroup>
                <optgroup label="素材来源">
                  <option value="source:generated">工具生成</option>
                  <option value="source:uploaded">用户上传</option>
                </optgroup>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#161823]/38" />
          </label>
          <button type="button" onClick={() => { setZoom(1); setCatalogCanvasEditing(true) }} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[10px] font-medium text-[#161823]/68 hover:bg-[#f7f7f8]"><LayoutGrid className="size-3.5" />画布编辑</button>
        </div>
      )}

      <div
        className="thin-scroll min-h-0 flex-1 overflow-auto"
        style={effectiveUiScheme === 'canvas'
          ? { backgroundColor: '#EEF0F3', backgroundImage: 'radial-gradient(circle, rgba(22, 24, 35, 0.12) 1px, transparent 1px)', backgroundSize: '20px 20px' }
          : { backgroundColor: '#F7F7F8' }}
      >
        <div className={`${effectiveUiScheme === 'canvas' && !catalogCanvasEditing ? 'flex' : 'hidden'} sticky left-0 top-0 z-30 h-11 min-w-full items-center justify-between border-b border-black/[0.06] bg-[#F7F7F8]/94 px-4 backdrop-blur-md`}>
          <span className="rounded-full bg-white px-2 py-1 text-[8px] font-medium text-[#161823]/62 shadow-sm">{Object.values(versionOrder).reduce((sum, order) => sum + order.length, 0)} 张图片</span>
          <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-white p-0.5">
            <button type="button" aria-label="缩小游戏素材" onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3" /></button>
            <button type="button" onClick={() => setZoom(1)} className="min-w-12 px-1 text-[9px] font-medium text-[#161823]/54">{Math.round(zoom * 100)}%</button>
            <button type="button" aria-label="放大游戏素材" onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3" /></button>
          </div>
        </div>

        <div className={`${effectiveUiScheme === 'canvas' ? 'w-max' : 'w-full'} min-w-full transition-[padding] duration-150`} style={{ padding: Math.round((effectiveUiScheme === 'canvas' ? 40 : 20) * zoom) }}>
          <div className={`mx-auto ${effectiveUiScheme === 'canvas' ? 'max-w-[1680px]' : 'max-w-[1440px]'}`}>
            {generationInProgress && <div className="mb-4 flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 text-[10px] text-[#161823]/58 shadow-sm">
              <span className="size-3.5 animate-spin rounded-full border-2 border-[#161823]/12 border-t-[#161823]/60" />
              <span>资产分类与容器已就绪，图片正在逐张生成：{Math.min(visibleImageCount ?? 0, orderedImageKeys.length)} / {orderedImageKeys.length} 张</span>
            </div>}
            {effectiveUiScheme === 'catalog' ? (
              <>
                <div className="mb-4 flex items-center gap-2 text-[10px] text-[#161823]/42">
                  <span>{catalogEntries.length} 个素材</span>
                  {(catalogQuery || catalogCategory !== 'all' || catalogSource !== 'all' || catalogKindFilter !== 'all') && <span>· 已筛选</span>}
                </div>
                {catalogEntries.length > 0 ? (
                  <div className="space-y-8">
                    {categories.map((category) => {
                      const categoryEntries = catalogEntries.filter(({ asset }) => asset.category === category)
                      if (categoryEntries.length === 0) return null
                      const categoryAssetCount = new Set(categoryEntries.map(({ asset }) => asset.id)).size
                      const groupedAssetIds = category === 'hero' || category === 'enemy' || category === 'tower'
                        ? Array.from(new Set(categoryEntries.map(({ asset }) => asset.id)))
                        : [null]
                      return (
                        <section key={category} aria-label={categoryLabel(category)}>
                          <div className="mb-3 flex items-center gap-2 border-b border-black/[0.06] pb-2.5">
                            <CategoryIcon category={category} className="size-4 text-[#161823]/48" />
                            <h3 className="text-[12px] font-semibold text-[#161823]">{categoryLabel(category)}</h3>
                            <span className="text-[9px] text-[#161823]/34">{categoryAssetCount} 项设定 · {categoryEntries.length} 张素材</span>
                          </div>
                          <div className="space-y-6">
                            {groupedAssetIds.map((assetId) => {
                              const groupEntries = assetId ? categoryEntries.filter(({ asset }) => asset.id === assetId) : categoryEntries
                              const groupAsset = groupEntries[0]?.asset
                              return (
                                <section key={assetId ?? category} aria-label={assetId ? `${categoryLabel(category)} / ${groupAsset?.name}` : undefined}>
                                  {assetId && groupAsset && (
                                    <div className="mb-2.5 flex items-baseline gap-2">
                                      <h4 className="text-[11px] font-semibold text-[#161823]/78">{groupAsset.name}</h4>
                                      <span className="text-[9px] text-[#161823]/34">{groupAsset.role}</span>
                                      <span className="text-[9px] text-[#161823]/28">{groupEntries.length} 个方案</span>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-3 gap-y-5">
                                    {groupEntries.map(({ asset, versionId, orderIndex, sourceVersionIndex }) => {
                                      const versionLabel = `方案 ${String.fromCharCode(65 + orderIndex)}`
                                      const versionKey = `${asset.id}:${versionId}`
                                      return (
                                        <div
                                          key={versionKey}
                                          draggable
                                          onDragStart={() => { draggedVersionRef.current = { assetId: asset.id, versionId } }}
                                          onDragOver={(event) => event.preventDefault()}
                                          onDrop={() => moveVersion(asset.id, versionId)}
                                          onDragEnd={() => { draggedVersionRef.current = null }}
                                          className="cursor-grab active:cursor-grabbing"
                                        >
                                          <CatalogAssetCard
                                            asset={asset}
                                            versionIndex={sourceVersionIndex}
                                            versionLabel={versionLabel}
                                            referenced={referencedVersions[asset.id] === versionId}
                                            generating={generatingVersions.has(versionKey) || isProgressiveImagePending(versionKey)}
                                            loadingLabel={generatingVersions.has(versionKey) || generationInProgress ? '生成中' : '等待生成'}
                                            onOpen={() => openAssetPreview(asset.id, sourceVersionIndex, versionLabel)}
                                            onDownload={() => downloadVersion(asset, versionLabel)}
                                            onAttach={() => onAttachAsset?.(asset.id, versionLabel)}
                                            onRegenerate={() => regenerateVersion(asset.id, versionId, versionLabel)}
                                            onReference={() => setReferencedVersion(asset.id, versionId)}
                                          />
                                        </div>
                                      )
                                    })}
                                  </div>
                                  {mode === 'production' && groupAsset && groupAsset.states.length > 0 && (
                                    <div className="mt-4 border-t border-black/[0.06] pt-3">
                                      <div className="mb-2.5 flex items-center gap-2">
                                        <Layers className="size-3.5 text-[#161823]/42" />
                                        <span className="text-[10px] font-semibold text-[#161823]/68">动态状态</span>
                                        <span className="text-[9px] text-[#161823]/34">{groupAsset.states.length} 个容器</span>
                                        <button type="button" onClick={() => onAddState?.(groupAsset.id)} disabled={!onAddState} className="ml-auto flex h-7 items-center gap-1 rounded-md border border-black/[0.08] bg-white px-2 text-[9px] font-medium text-[#161823]/62 hover:bg-[#f7f7f8] disabled:cursor-default disabled:opacity-40"><Plus className="size-3" />增加状态</button>
                                      </div>
                                      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-2">
                                        {groupAsset.states.map((state) => <StateProductionRow key={state.id} asset={groupAsset} state={state} tasks={tasks} mode={mode} onUpdateState={onUpdateState} onDeleteState={onDeleteState} onGenerateCell={onGenerateCell} onOpenDynamic={openDynamicPreview} />)}
                                      </div>
                                    </div>
                                  )}
                                </section>
                              )
                            })}
                          </div>
                        </section>
                      )
                    })}
                  </div>
                ) : (
                  <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-black/[0.1] bg-white text-[11px] text-[#161823]/38">没有符合当前筛选条件的素材</div>
                )}
              </>
            ) : (
              <>
              {categories.map((category) => (
                <section key={category} aria-label={categoryLabel(category)} style={{ marginBottom: Math.round(40 * zoom) }}>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: Math.round(16 * zoom) }}>
                    <CategoryIcon category={category} className="size-3.5 text-[#161823]/45" />
                    <h3 className="text-[12px] font-semibold text-[#161823]/76">{categoryLabel(category)}</h3>
                    <span className="text-[9px] text-[#161823]/35">{assets.filter((asset) => asset.category === category).length} 项设定</span>
                  </div>
                  <div aria-label={`${categoryLabel(category)}资产`}>
                    {visibleAssets.filter((asset) => asset.category === category).map((asset) => (
                      <section
                        key={asset.id}
                        aria-label={`${categoryLabel(category)} / ${asset.name}`}
                        style={{ marginBottom: Math.round(28 * zoom) }}
                      >
                        <div className="flex items-baseline gap-2" style={{ marginBottom: Math.round(10 * zoom) }}>
                          <h4 className="text-[11px] font-semibold text-[#161823]/72">{asset.name}</h4>
                          <span className="text-[9px] text-[#161823]/34">{asset.role}</span>
                          <span className="text-[9px] text-[#161823]/28">{versionOrder[asset.id]?.length ?? 0} 个方案</span>
                        </div>
                        <div className="flex items-start" style={{ columnGap: Math.round(28 * zoom), rowGap: Math.round(14 * zoom) }}>
                            {(versionOrder[asset.id] ?? []).map((versionId, orderIndex) => {
                              const sourceVersionIndex = generatedSources[`${asset.id}:${versionId}`] ?? versionId
                              const versionLabel = `方案 ${String.fromCharCode(65 + orderIndex)}`
                              const versionKey = `${asset.id}:${versionId}`
                              return (
                                <div
                                  key={versionKey}
                                  draggable
                                  onDragStart={() => { draggedVersionRef.current = { assetId: asset.id, versionId } }}
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={() => moveVersion(asset.id, versionId)}
                                  onDragEnd={() => { draggedVersionRef.current = null }}
                                  onDoubleClick={() => downloadVersion(asset, versionLabel)}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <AssetVersionCard
                                    asset={asset}
                                    versionIndex={sourceVersionIndex}
                                    referenced={referencedVersions[asset.id] === versionId}
                                    generating={generatingVersions.has(versionKey) || isProgressiveImagePending(versionKey)}
                                    loadingLabel={generatingVersions.has(versionKey) || generationInProgress ? '生成中' : '等待生成'}
                                    onOpen={() => openAssetPreview(asset.id, sourceVersionIndex, versionLabel)}
                                    onDownload={() => downloadVersion(asset, versionLabel)}
                                    onAttach={() => onAttachAsset?.(asset.id, versionLabel)}
                                    onRegenerate={() => regenerateVersion(asset.id, versionId, versionLabel)}
                                    onReference={() => setReferencedVersion(asset.id, versionId)}
                                    zoom={zoom}
                                  />
                                </div>
                              )
                            })}
                        </div>
                        {mode === 'production' && isConfirmed(asset) && asset.category !== 'map' && (
                          <div className="mt-3 border-t border-black/[0.07] pt-3">
                            <div className="mb-2.5 flex items-center gap-2">
                              <Layers className="size-3.5 text-[#161823]/42" />
                              <span className="text-[10px] font-semibold text-[#161823]/68">动态状态</span>
                              <span className="text-[9px] text-[#161823]/34">{asset.states.length} 个容器</span>
                              <button
                                type="button"
                                onClick={() => onAddState?.(asset.id)}
                                disabled={!onAddState}
                                className="ml-auto flex h-7 items-center gap-1 rounded-md border border-black/[0.08] bg-white px-2 text-[9px] font-medium text-[#161823]/62 hover:bg-[#f7f7f8] disabled:cursor-default disabled:opacity-40"
                              >
                                <Plus className="size-3" /> 增加状态
                              </button>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-2">
                              {asset.states.map((state) => (
                                <StateProductionRow
                                  key={state.id}
                                  asset={asset}
                                  state={state}
                                  tasks={tasks}
                                  mode={mode}
                                  onUpdateState={onUpdateState}
                                  onDeleteState={onDeleteState}
                                  onGenerateCell={onGenerateCell}
                                  onOpenDynamic={openDynamicPreview}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </section>
                    ))}
                  </div>
                </section>
              ))}
              </>
            )}
          </div>
        </div>

      </div>

      {catalogCanvasEditing && !lightbox && (
        <div className="absolute bottom-[66px] right-4 z-40 flex h-9 items-center rounded-xl border border-black/[0.08] bg-white p-1 shadow-[0_8px_28px_rgba(31,35,41,0.16)]">
          <button type="button" aria-label="缩小游戏素材" onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-lg text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3.5" /></button>
          <button type="button" aria-label="恢复游戏素材比例" onClick={() => setZoom(1)} className="min-w-12 px-1 text-[10px] font-medium text-[#161823]/58">{Math.round(zoom * 100)}%</button>
          <button type="button" aria-label="放大游戏素材" onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-lg text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3.5" /></button>
        </div>
      )}

      {lightbox && (() => {
        const asset = visibleAssets.find((item) => item.id === lightbox.assetId)
        if (!asset) return null
        if (lightbox.kind === 'dynamic') {
          const state = asset.states.find((item) => item.id === lightbox.stateId)
          const task = taskForCell(tasks, asset.id, lightbox.stateId, lightbox.direction)
          const sourceUrl = task?.output?.previewUrl ?? task?.output?.spriteSheetUrl
          if (!state || !task || !sourceUrl) return null
          const versionLabel = `${state.name} · ${DIRECTION_LABEL[lightbox.direction]}`
          return (
            <TowerAssetImageDialog
              asset={asset}
              versionIndex={asset.selectedVisualVersion ?? 0}
              versionLabel={versionLabel}
              source={{
                src: sourceUrl,
                width: task.output?.width,
                height: task.output?.height,
                detail: `${task.frameCount} 帧${task.fps ? ` · ${task.fps} FPS` : ''}`,
              }}
              onAttach={() => onAttachAsset?.(asset.id, versionLabel)}
              onRegenerate={() => onGenerateCell?.(asset.id, state.id, lightbox.direction)}
              onClose={() => setLightbox(null)}
            />
          )
        }
        return (
          <TowerAssetImageDialog
            asset={asset}
            versionIndex={lightbox.versionIndex}
            versionLabel={lightbox.versionLabel}
            onAttach={() => onAttachAsset?.(asset.id, lightbox.versionLabel)}
            onRegenerate={() => onRegenerateAsset?.(asset.id, lightbox.versionLabel)}
            onCreateSprite={() => onCreateSprite?.(asset.id, lightbox.versionIndex, lightbox.versionLabel)}
            onClose={() => setLightbox(null)}
          />
        )
      })()}

      {mode === 'art-direction' ? (
        <footer className="flex min-h-[54px] shrink-0 flex-wrap items-center gap-2 border-t border-[var(--divider-soft)] bg-white px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-[#161823]">
              已选择 {Object.keys(referencedVersions).length} 项设定
            </div>
            <div className="text-[9px] text-[#161823]/38">
              标记需要采用的素材，确认后会统一装配到游戏预览
            </div>
          </div>
          <button
            type="button"
            disabled={!onConfirmSelections || Object.keys(referencedVersions).length === 0}
            onClick={() => onConfirmSelections?.(Object.entries(referencedVersions).map(([assetId, versionIndex]) => ({ assetId, versionIndex: generatedSources[`${assetId}:${versionIndex}`] ?? versionIndex })))}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#161823] px-3.5 text-[11px] font-medium text-white hover:bg-black disabled:cursor-default disabled:opacity-40"
          >
            确认设定
            <ArrowRight className="size-3.5" />
          </button>
        </footer>
      ) : (
        <footer className="flex min-h-[54px] shrink-0 flex-wrap items-center gap-2 border-t border-[var(--divider-soft)] bg-white px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-[#161823]">
              {blockingTaskCount > 0 ? `还有 ${blockingTaskCount} 个动态素材待生成` : '动态素材已生成，可进入游戏 UI'}
            </div>
            <div className="text-[9px] text-[#161823]/38">
              {blockingTaskCount > 0
                ? `待生成 ${queuedTaskCount} · 生成中 ${generatingTaskCount} · 失败 ${failedTaskCount}`
                : '需要单项复核时，可通过顶栏“+”打开 Sprite Maker II'}
            </div>
          </div>
          <button
            type="button"
            disabled={!onBatchGenerate || pendingTaskIds.length === 0}
            onClick={() => onBatchGenerate?.(pendingTaskIds)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#161823] px-3.5 text-[11px] font-medium text-white hover:bg-black disabled:cursor-default disabled:opacity-40"
          >
            <WandSparkles className="size-3.5" /> 批量生成
          </button>
          <button
            type="button"
            disabled={!onProceed || blockingTaskCount > 0}
            onClick={onProceed}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[#161823]/14 bg-white px-3.5 text-[11px] font-medium text-[#161823] hover:bg-[#161823]/5 disabled:cursor-default disabled:opacity-40"
          >
            {blockingTaskCount > 0 ? `完成剩余 ${blockingTaskCount} 项` : '进入游戏 UI'}
            <ArrowRight className="size-3.5" />
          </button>
        </footer>
      )}
    </div>
  )
}
