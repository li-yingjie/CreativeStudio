import { useRef, useState } from 'react'
import TowerDefenseSlotAssetLibrary, { buildTowerCanvasSlots } from './TowerDefenseSlotAssetLibrary'
import { catalogShowsSpareBin, SHELF } from './TowerDefenseCanvasModel'
import {
  applyCatalogPreviewTool,
  CatalogCoverActionBar,
  CatalogDetailGlyph,
  CatalogPreviewToolBar,
  CATALOG_PREVIEW_TOOLS,
  downloadNamedSrc,
  SetCurrentChip,
} from './TowerDefenseCatalogPreviewBar'
import { buildCatalogSpareAsset, CATALOG_SPARE_BIN_ID, CATALOG_SPARE_BIN_TITLE, createCanvasSpareFromUpload, type CanvasSpareTile } from './TowerDefenseCanvasSpares'
import { readTowerDefenseUploadImage } from './TowerDefenseUpload'
import type { GameUiSlice } from './GameUiSlices'
import {
  flattenUiSlotAssets,
  groupUiSlotsByScreen,
  isCatalogUiSlotAssetId,
} from './GameUiSlots'
import type { GameUiNode, GameUiScreen } from './GameUiModel'
import chevronRightGlyph from './catalog-detail-icons/chevron-right.svg'
import messageGlyph from './catalog-detail-icons/message.svg'
import uploadGlyph from './catalog-detail-icons/upload.svg'
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
  MessageSquarePlus,
  Palette,
  Pencil,
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
export type CatalogKindFilter = 'all' | 'image' | 'video' | 'audio'

type TowerAssetDetailSource = {
  src: string
  width?: number
  height?: number
  detail?: string
}

type TowerAssetLightbox =
  | { kind: 'visual'; assetId: string; versionIndex: number; versionLabel: string; title?: string; source?: TowerAssetDetailSource }
  | { kind: 'dynamic'; assetId: string; stateId: string; direction: TowerDefenseDirection; title?: string }

type StatePatch = Partial<Pick<TowerDefenseAssetState, 'name' | 'directions' | 'framesPerDirection' | 'materialRef' | 'directionMaterialRefs' | 'enabled' | 'disabledDirections'>>

type MaterialPlacement = {
  assetId: string
  versionId: number
  sourceVersionIndex: number
  versionLabel: string
}

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
  onAddVisualVersion?: (
    assetId: string,
    version: NonNullable<TowerDefenseAsset['visualVersions']>[number],
  ) => number
  onReferenceChange?: (assetId: string, versionIndex: number | null) => void
  onSetAssetEnabled?: (assetId: string, enabled: boolean) => void
  onPreviewOpen?: () => void
  canvasEditing?: boolean
  onCanvasEditingChange?: (editing: boolean) => void
  canvasSpares?: CanvasSpareTile[]
  onCanvasSparesChange?: (spares: CanvasSpareTile[]) => void
  hideChrome?: boolean
  libraryCategory?: TowerDefenseAssetCategory | 'all'
  libraryQuery?: string
  libraryKindFilter?: CatalogKindFilter
  previewRequest?: {
    assetId: string
    versionIndex: number
    versionLabel: string
    nonce: number
  } | null
  visibleImageCount?: number
  generationInProgress?: boolean
  productionApplied?: boolean
  onConfirmSelections?: (selections: Array<{ assetId: string; versionIndex: number }>) => void
  onUpdateState?: (assetId: string, stateId: string, patch: StatePatch) => void
  onAssignMaterial?: (assetId: string, stateId: string, versionIndex: number) => void
  onAssignDirectionMaterial?: (assetId: string, stateId: string, direction: TowerDefenseDirection, versionIndex: number) => void
  onAddState?: (assetId: string) => void
  onDeleteState?: (assetId: string, stateId: string) => void
  onGenerateCell?: (assetId: string, stateId: string, direction: TowerDefenseDirection) => void
  onGenerateAsset?: (assetId: string) => void
  onBatchGenerate?: (taskIds: string[]) => void
  onProceed?: () => void
  onAddTowerSlot?: () => void
  onMoveTowerSlot?: (slotId: string, deltaX: number, deltaY: number) => void
  onDeleteTowerSlot?: (slotId: string) => void
  uiSlices?: GameUiSlice[]
  uiNodes?: GameUiNode[]
  uiScreens?: GameUiScreen[]
  onDeleteUiSlice?: (sliceId: string) => void
}

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

type DirectionPresetCount = 1 | 2 | 4 | 8

const DIRECTION_PRESETS: Record<DirectionPresetCount, TowerDefenseDirection[]> = {
  1: ['front'],
  2: ['front', 'back'],
  4: ['front', 'right', 'back', 'left'],
  8: ['front', 'front-right', 'right', 'back-right', 'back', 'back-left', 'left', 'front-left'],
}

const DIRECTION_PRESET_COUNTS: DirectionPresetCount[] = [1, 2, 4, 8]

function directionPresetCount(directions: readonly TowerDefenseDirection[]): DirectionPresetCount {
  if (directions.length >= 8) return 8
  if (directions.length >= 4) return 4
  if (directions.length >= 2) return 2
  return 1
}

function directionsForPreset(asset: TowerDefenseAsset, state: TowerDefenseAssetState, count: DirectionPresetCount): TowerDefenseDirection[] {
  if (count === 1 && (asset.category === 'tower' || state.directions.includes('none'))) return ['none']
  return [...DIRECTION_PRESETS[count]]
}

function categoryLabel(category: TowerDefenseAssetCategory): string {
  switch (category) {
    case 'visual-style': return '素材-视觉风格'
    case 'map': return '素材-地图'
    case 'hero': return '素材-英雄'
    case 'enemy': return '素材-敌人'
    case 'tower': return '素材-建筑塔'
    case 'ui': return 'UI'
  }
}

function CategoryIcon({ category, className }: { category: TowerDefenseAssetCategory; className: string }) {
  switch (category) {
    case 'visual-style': return <Palette className={className} strokeWidth={1.45} />
    case 'map': return <LayoutGrid className={className} strokeWidth={1.45} />
    case 'hero': return <User className={className} strokeWidth={1.45} />
    case 'enemy': return <Target className={className} strokeWidth={1.45} />
    case 'tower': return <Layers className={className} strokeWidth={1.45} />
    case 'ui': return <LayoutGrid className={className} strokeWidth={1.45} />
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
  title,
  versionIndex,
  versionLabel,
  source,
  onAttach,
  onClose,
  onUpload,
  history = [],
  onSelectHistory,
  onCreateSprite,
  onRegenerate,
  onDownload,
  currentVersionIndex,
  onSetCurrent,
}: {
  asset: TowerDefenseAsset
  title?: string
  versionIndex: number
  versionLabel: string
  source?: TowerAssetDetailSource
  onAttach: () => void
  onClose: () => void
  onUpload?: (file: File) => void
  history?: Array<{
    id: number
    versionIndex: number
    versionLabel: string
    generating: boolean
    src?: string
  }>
  onSelectHistory?: (versionIndex: number, versionLabel: string, src?: string) => void
  onCreateSprite?: () => void
  onRegenerate?: () => void
  onDownload?: () => void
  currentVersionIndex?: number
  onSetCurrent?: (versionIndex: number) => void
}) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [rotation, setRotation] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [squarePreview, setSquarePreview] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const version = asset.visualVersions?.[versionIndex]
  const sourceUrl = source?.src ?? version?.src
  const sourceWidth = source?.width ?? version?.width ?? (naturalSize.width || undefined)
  const sourceHeight = source?.height ?? version?.height ?? (naturalSize.height || undefined)
  const pageTitle = title || asset.name
  const runTool = (id: (typeof CATALOG_PREVIEW_TOOLS)[number]['id']) => {
    applyCatalogPreviewTool(id, setRotation, setFlipped, setSquarePreview, setShowInfo)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white" aria-label={`${pageTitle}素材详情`}>
      <header className="flex h-10 shrink-0 items-center gap-2 border-b border-[rgba(45,66,107,0.06)] px-3 py-1.5">
        <nav className="flex min-w-0 items-center gap-1" aria-label="面包屑">
          <button type="button" onClick={onClose} className="cursor-pointer truncate text-[12px] leading-4 text-[rgba(34,39,39,0.6)] hover:text-[#222727]">素材库</button>
          <CatalogDetailGlyph src={chevronRightGlyph} size={16} />
          <span className="truncate text-[12px] font-semibold leading-4 text-[#222727]">{pageTitle}</span>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <CatalogCoverActionBar
            variant="header"
            title={pageTitle}
            hide={['attach']}
            disabled={{ sprite: !onCreateSprite, regenerate: !onRegenerate, download: !onDownload && !sourceUrl }}
            onAction={(id) => {
              if (id === 'sprite') onCreateSprite?.()
              else if (id === 'regenerate') onRegenerate?.()
              else if (id === 'download') {
                if (onDownload) onDownload()
                else downloadNamedSrc(sourceUrl, `${pageTitle}-${versionLabel}.webp`)
              }
            }}
          />
          {onUpload && (
            <>
              <input ref={uploadInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = '' }} />
              <button type="button" onClick={() => uploadInputRef.current?.click()} className="flex h-6 cursor-pointer items-center gap-1 rounded-lg border border-[rgba(45,66,107,0.12)] px-2 py-1 text-[12px] font-semibold leading-4 text-[rgba(28,31,35,0.8)] hover:bg-[#f5f7fa]">
                <CatalogDetailGlyph src={uploadGlyph} size={14} />
                上传
              </button>
            </>
          )}
          <button type="button" onClick={onAttach} className="flex h-6 cursor-pointer items-center gap-1 rounded-lg border border-[rgba(45,66,107,0.12)] px-2 py-1 text-[12px] font-semibold leading-4 text-[rgba(28,31,35,0.8)] hover:bg-[#f5f7fa]">
            <CatalogDetailGlyph src={messageGlyph} size={14} />
            添加到对话
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 bg-white">
        <div className="relative min-h-0 min-w-0 flex-1">
          <div className="flex size-full items-center justify-center overflow-hidden px-10 pb-16 pt-6">
            <div
              className={`overflow-hidden bg-white ${squarePreview ? 'aspect-square max-h-[min(600px,calc(100%-8px))] max-w-[min(337px,100%)]' : 'max-h-full max-w-full'}`}
              style={{ transform: `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})` }}
            >
              {sourceUrl
                ? <img src={sourceUrl} alt={`${pageTitle} · ${versionLabel}`} onLoad={(event) => setNaturalSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} className={`block object-contain ${squarePreview ? 'size-full' : 'max-h-[min(600px,calc(100vh-220px))] max-w-full'}`} />
                : <div className="h-[360px] w-[240px]"><AssetArtwork asset={asset} fill versionIndex={versionIndex} /></div>}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <CatalogPreviewToolBar flipped={flipped} squarePreview={squarePreview} showInfo={showInfo} onTool={runTool} />
          </div>
          {showInfo && (
            <p className="absolute bottom-[58px] left-1/2 -translate-x-1/2 rounded-full border border-[rgba(45,66,107,0.12)] bg-white px-2.5 py-1 text-[12px] leading-4 text-[rgba(28,31,35,0.6)] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              {sourceWidth && sourceHeight ? `${sourceWidth} × ${sourceHeight}` : versionLabel}
              {source?.detail ? ` · ${source.detail}` : ''}
            </p>
          )}
        </div>
        <aside className="thin-scroll w-[105px] shrink-0 overflow-y-auto border-l border-[rgba(45,66,107,0.06)] px-3 py-3">
          <h3 className="text-[12px] font-semibold leading-4 text-[rgba(28,31,35,0.6)]">历史记录</h3>
          <div className="mt-3 flex flex-col gap-2">
            {(history.length > 0 ? history : [{ id: versionIndex, versionIndex, versionLabel, generating: false, src: sourceUrl }]).map((item) => {
              const itemSource = item.src ?? asset.visualVersions?.[item.versionIndex]?.src
              const active = item.versionIndex === versionIndex && item.versionLabel === versionLabel
              const isCurrent = currentVersionIndex != null && item.versionIndex === currentVersionIndex
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.generating}
                  aria-label={item.versionLabel}
                  aria-pressed={active}
                  onClick={() => onSelectHistory?.(item.versionIndex, item.versionLabel, item.src)}
                  className={`group relative size-20 cursor-pointer overflow-hidden rounded-md p-0.5 disabled:cursor-wait ${active ? 'border-2 border-[#e2e2e2]' : 'opacity-40 hover:opacity-70'}`}
                >
                  <span className="block size-full overflow-hidden rounded-md bg-[rgba(215,215,215,0.2)]">
                    {item.generating
                      ? <span className="grid size-full place-items-center"><Loader2 className="size-4 animate-spin text-[#161823]/40" /></span>
                      : itemSource
                        ? <img src={itemSource} alt="" className="size-full object-cover" />
                        : null}
                  </span>
                  {onSetCurrent && !item.generating && (
                    <span className="absolute inset-x-1 bottom-1 z-10 flex justify-center">
                      <SetCurrentChip current={isCurrent} onSet={() => onSetCurrent(item.versionIndex)} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
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
  usageLabel,
  replacementCandidate = false,
  replacementTargetLabel,
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
  usageLabel?: string
  replacementCandidate?: boolean
  replacementTargetLabel?: string
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
        className={`tower-asset-version group overflow-hidden rounded-xl border bg-white text-left shadow-[0_18px_48px_rgba(31,35,41,0.12)] ${zoom < 0.85 ? 'tower-compact-actions' : ''} ${replacementCandidate ? 'border-[#357ef8] ring-2 ring-[#357ef8]/18' : referenced ? 'border-emerald-400/70 ring-1 ring-emerald-400/25' : 'border-black/[0.08]'}`}
      >
      <figcaption className="flex h-11 items-center gap-2 border-b border-black/[0.06] px-3">
        <ImageIcon className="size-3.5 shrink-0 text-[#161823]/38" />
        <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-[#161823]/68">{asset.name} · {versionLabel}</span>
        <span className="secondary shrink-0 text-[8px] text-[#161823]/28">{baseWidth} × {bodyHeight}</span>
        <div className="tower-variant-actions flex shrink-0 items-center gap-0.5">
          <button type="button" aria-label={`下载${asset.name}${versionLabel}`} onClick={onDownload} className="secondary grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><Download className="size-3" /></button>
          <button type="button" aria-label={`添加到对话：${asset.name}${versionLabel}`} onClick={onAttach} className="secondary grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><MessageSquarePlus className="size-3" /></button>
          <button type="button" aria-label={`重新生成${asset.name}${versionLabel}`} onClick={onRegenerate} className="secondary grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><RefreshCw className="size-3" /></button>
          <button type="button" aria-pressed={referenced} aria-label={replacementCandidate ? `用${asset.name}${versionLabel}替换${replacementTargetLabel}` : `${referenced ? '已使用' : '设为已使用'}：${asset.name}${versionLabel}`} onClick={onReference} className={`grid size-6 place-items-center rounded-md ${replacementCandidate ? 'bg-[#357ef8] text-white' : referenced ? 'bg-emerald-50 text-emerald-600' : 'text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]'}`}><Check className="size-3" /></button>
        </div>
      </figcaption>
      <div className="relative flex items-center justify-center overflow-hidden bg-[#F6F7F8]" style={{ height: bodyHeight }}>
        <button type="button" onClick={onOpen} className="h-full w-full" aria-label={replacementCandidate ? `用${asset.name}${versionLabel}替换${replacementTargetLabel}` : `查看${asset.name}${versionLabel}`}>
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
        {!referenced && !generating && <span className={`pointer-events-none absolute bottom-3 left-3 rounded-md px-2 py-1 text-[8px] font-medium shadow-sm ${replacementCandidate ? 'bg-[#357ef8] text-white' : 'border border-black/[0.06] bg-white/92 text-[#161823]/48'}`}>{replacementCandidate ? '点击替换' : '候选素材'}</span>}
        {referenced && !generating && <span className="pointer-events-none absolute bottom-3 right-3 max-w-[75%] truncate rounded-md bg-emerald-500 px-2 py-1 text-[8px] font-medium text-white shadow-sm">已使用{usageLabel ? ` · ${usageLabel}` : ''}</span>}
      </div>
      </figure>
    </div>
  )
}

function catalogCategoryPath(category: TowerDefenseAssetCategory) {
  return categoryLabel(category)
}

function catalogAssetPath(asset: TowerDefenseAsset, versionId?: string | number) {
  return `${catalogCategoryPath(asset.category)}/${versionId ?? asset.id}`
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
  usageLabel,
  replacementCandidate = false,
  replacementTargetLabel,
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
  usageLabel?: string
  replacementCandidate?: boolean
  replacementTargetLabel?: string
}) {
  const version = asset.visualVersions?.[versionIndex]
  const path = catalogAssetPath(asset, version?.id ?? asset.id)
  return (
    <article className="group min-w-0 p-2">
      <div className={`relative aspect-square overflow-hidden rounded-xl border bg-[#f3f4f7] ${replacementCandidate ? 'border-[#357ef8] ring-2 ring-[#357ef8]/18' : referenced ? 'border-emerald-400 ring-1 ring-emerald-400/20' : 'border-[rgba(45,66,107,0.12)]'}`}>
        <button type="button" onClick={onOpen} className="block size-full" aria-label={replacementCandidate ? `用${asset.name}${versionLabel}替换${replacementTargetLabel}` : `查看${asset.name}${versionLabel}`}>
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
          aria-label={replacementCandidate ? `用${asset.name}${versionLabel}替换${replacementTargetLabel}` : `${referenced ? '已使用' : '设为已使用'}：${asset.name}${versionLabel}`}
          onClick={onReference}
          className={`absolute bottom-2 right-2 grid size-7 place-items-center rounded-full border shadow-sm ${replacementCandidate ? 'border-[#357ef8] bg-[#357ef8] text-white' : referenced ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-white/80 bg-white/92 text-[#161823]/42 hover:text-[#161823]'}`}
        >
          <Check className="size-3.5" />
        </button>
        {!referenced && !generating && <span className={`pointer-events-none absolute bottom-2 left-2 rounded-md px-2 py-1 text-[8px] font-medium shadow-sm ${replacementCandidate ? 'bg-[#357ef8] text-white' : 'border border-black/[0.06] bg-white/92 text-[#161823]/48'}`}>{replacementCandidate ? '点击替换' : '候选素材'}</span>}
        {referenced && !generating && <span className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%_-_52px)] truncate rounded-md bg-emerald-500 px-2 py-1 text-[8px] font-medium text-white shadow-sm">已使用{usageLabel ? ` · ${usageLabel}` : ''}</span>}
        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F2F3F5] text-[#161823]">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-[11px] font-medium">{loadingLabel}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <span className="min-w-0 truncate text-[14px] font-semibold leading-5 text-[#161823]/80">{asset.name}</span>
          <span className="shrink-0 rounded-full border border-[rgba(45,66,107,0.12)] bg-white px-2 py-0.5 text-[12px] font-semibold leading-4 text-[#161823]/80">图片</span>
        </div>
        <div className="truncate text-[12px] leading-4 text-[#161823]/60">{path}</div>
      </div>
    </article>
  )
}

function CatalogGroupCard({
  title,
  coverSrc,
  count,
  caption,
  emptyLabel = '等待素材',
  generating,
  onOpen,
  onCreateSprite,
  onRegenerate,
  onAttach,
  onDownload,
}: {
  title: string
  coverSrc?: string
  count: number
  caption?: string
  emptyLabel?: string
  generating?: boolean
  onOpen: () => void
  onCreateSprite?: () => void
  onRegenerate?: () => void
  onAttach: () => void
  onDownload: () => void
}) {
  const coverSize = SHELF.collapsedWidth
  return (
    <article data-catalog-group className="group relative shrink-0" style={{ width: coverSize }}>
      <div
        data-catalog-cover
        className="relative overflow-hidden rounded-xl border border-[rgba(45,66,107,0.12)] bg-[#f3f4f7]"
        style={{ width: coverSize, height: coverSize }}
      >
        <button type="button" onClick={onOpen} className="block size-full cursor-pointer" aria-label={`查看${title}`}>
          {coverSrc
            ? <img src={coverSrc} alt={title} className="block size-full object-cover" />
            : <span className="grid size-full place-items-center text-[10px] text-[#161823]/30"><ImageIcon className="mb-1 size-5" />{emptyLabel}</span>}
        </button>
        {count > 1 && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/94 px-1.5 py-0.5 text-[10px] font-semibold text-[#161823]/70 shadow-sm">{count}</span>
        )}
        {generating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F2F3F5] text-[#161823]">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-[11px] font-medium">生成中</span>
          </div>
        )}
      </div>
      <CatalogCoverActionBar
        title={title}
        disabled={{ sprite: !onCreateSprite, regenerate: !onRegenerate }}
        onAction={(id) => {
          if (id === 'sprite') onCreateSprite?.()
          else if (id === 'regenerate') onRegenerate?.()
          else if (id === 'attach') onAttach()
          else onDownload()
        }}
      />
      <div className="mt-2 flex flex-col gap-1">
        <span className="truncate text-[14px] font-semibold leading-5 text-[#161823]/80">{title}</span>
        <span className="text-[12px] leading-4 text-[#161823]/60">{caption ?? `素材组 · ${count} 张`}</span>
      </div>
    </article>
  )
}

function MaterialTargetPicker({
  asset,
  placement,
  baseUsed,
  onUseBase,
  onUseState,
  onClose,
}: {
  asset: TowerDefenseAsset
  placement: MaterialPlacement
  baseUsed: boolean
  onUseBase: () => void
  onUseState: (stateId: string) => void
  onClose: () => void
}) {
  const source = asset.visualVersions?.[placement.sourceVersionIndex]
  return (
    <div className="mt-3 rounded-xl border border-[#161823]/10 bg-[#f7f7f8] p-3 shadow-[0_8px_24px_rgba(31,35,41,0.06)]">
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.06] bg-white">
          {source?.src ? <img src={source.src} alt="" className="size-full object-cover" /> : <ImageIcon className="size-4 text-[#161823]/28" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold text-[#161823]">将「{placement.versionLabel}」用于</p>
          <p className="mt-0.5 truncate text-[9px] text-[#161823]/40">直接选择目标槽位，不需要打开多层列表</p>
        </div>
        <button type="button" onClick={onClose} className="h-7 rounded-md px-2 text-[9px] font-medium text-[#161823]/48 hover:bg-white hover:text-[#161823]">取消</button>
      </div>
      <div className="mt-2.5 grid grid-cols-[repeat(auto-fit,minmax(82px,1fr))] gap-1.5">
        <button
          type="button"
          onClick={onUseBase}
          className={`flex h-9 items-center justify-between rounded-lg border px-2.5 text-left text-[9px] font-medium ${baseUsed ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-black/[0.08] bg-white text-[#161823]/66 hover:border-black/20'}`}
        >
          设定基准
          {baseUsed && <Check className="size-3" />}
        </button>
        {asset.states.map((state) => {
          const used = state.materialRef?.kind === 'visual-version' && state.materialRef.versionIndex === placement.sourceVersionIndex
          return (
            <button
              key={state.id}
              type="button"
              onClick={() => onUseState(state.id)}
              className={`flex h-9 items-center justify-between rounded-lg border px-2.5 text-left text-[9px] font-medium ${used ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-black/[0.08] bg-white text-[#161823]/66 hover:border-black/20'}`}
            >
              <span className="truncate">{state.name}</span>
              {used && <Check className="size-3 shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StateProductionRow({
  asset,
  state,
  tasks,
  replacementTarget,
  onUpdateState,
  onDeleteState,
  onGenerateCell,
  onOpenDynamic,
  onOpenVisual,
  onStartReplacement,
  onDropMaterial,
}: {
  asset: TowerDefenseAsset
  state: TowerDefenseAssetState
  tasks: SpriteTask[]
  replacementTarget?: TowerDefenseDirection | 'base' | null
  onUpdateState?: TowerDefenseAssetLibraryProps['onUpdateState']
  onDeleteState?: TowerDefenseAssetLibraryProps['onDeleteState']
  onGenerateCell?: TowerDefenseAssetLibraryProps['onGenerateCell']
  onOpenDynamic?: (assetId: string, stateId: string, direction: TowerDefenseDirection) => void
  onOpenVisual?: (versionIndex: number, versionLabel: string) => void
  onStartReplacement?: (target: TowerDefenseDirection | 'base') => void
  onDropMaterial?: (direction?: TowerDefenseDirection) => void
}) {
  const visibleDirections = state.directions
  const selectedMaterialIndex = state.materialRef?.kind === 'visual-version'
    ? state.materialRef.versionIndex
    : asset.selectedVisualVersion ?? null
  const inheritsRoleBase = state.materialRef?.kind !== 'visual-version' && selectedMaterialIndex !== null
  const selectedMaterial = selectedMaterialIndex === null
    ? undefined
    : asset.visualVersions?.[selectedMaterialIndex]
  const selectedMaterialLabel = selectedMaterialIndex === null
    ? null
    : `方案 ${String.fromCharCode(65 + selectedMaterialIndex)}`
  const completedTaskCount = visibleDirections.filter((direction) => taskForCell(tasks, asset.id, state.id, direction)?.status === 'completed').length
  const presetCount = directionPresetCount(visibleDirections)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(state.name)

  const commitName = () => {
    const nextName = draftName.trim()
    if (nextName && nextName !== state.name) onUpdateState?.(asset.id, state.id, { name: nextName })
    if (!nextName) setDraftName(state.name)
    setEditingName(false)
  }

  return (
    <section
      onDragOver={(event) => {
        if (!onDropMaterial) return
        event.preventDefault()
      }}
      onDrop={(event) => {
        if (!onDropMaterial) return
        event.preventDefault()
        onDropMaterial()
      }}
      className="min-w-0"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {editingName ? (
            <input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitName()
                if (event.key === 'Escape') {
                  setDraftName(state.name)
                  setEditingName(false)
                }
              }}
              className="h-7 w-28 rounded-md border border-[#357ef8]/50 bg-white px-2 text-[10px] font-semibold text-[#161823] outline-none ring-2 ring-[#357ef8]/10"
              aria-label={`重命名${state.name}状态`}
            />
          ) : (
            <>
              <h4 className="truncate text-[11px] font-semibold text-[var(--color-ink)]">{state.name}</h4>
              <button
                type="button"
                onClick={() => {
                  setDraftName(state.name)
                  setEditingName(true)
                }}
                aria-label={`重命名${state.name}状态`}
                className="grid size-6 place-items-center rounded-md text-[#161823]/30 hover:bg-[#f2f3f5] hover:text-[#161823]"
              >
                <Pencil className="size-3" />
              </button>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="whitespace-nowrap text-[8px] font-medium text-[#161823]/38">方向数</span>
          <div className="flex rounded-lg border border-black/[0.08] bg-[#f5f5f6] p-0.5" aria-label={`${state.name}方向数`}>
            {DIRECTION_PRESET_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                aria-pressed={presetCount === count}
                onClick={() => onUpdateState?.(asset.id, state.id, { directions: directionsForPreset(asset, state, count) })}
                className={`h-6 min-w-7 rounded-md px-1.5 text-[8px] font-semibold ${presetCount === count ? 'bg-white text-[#161823] shadow-sm ring-1 ring-black/[0.06]' : 'text-[#161823]/40 hover:text-[#161823]'}`}
              >
                {count}向
              </button>
            ))}
          </div>
          {onStartReplacement && (
            <button
              type="button"
              aria-label={`替换${state.name}状态基准素材`}
              onClick={() => onStartReplacement('base')}
              className={`flex h-7 items-center gap-1 rounded-md px-2 text-[9px] font-medium ${replacementTarget === 'base' ? 'bg-[#eaf2ff] text-[#357ef8]' : 'text-[#161823]/42 hover:bg-[#f2f3f5] hover:text-[#161823]'}`}
            >
              <RefreshCw className="size-3" />替换基准
            </button>
          )}
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
      </div>

      <div className="mt-2 flex min-h-10 items-center gap-2 border-y border-black/[0.06] py-1.5">
        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/[0.06] bg-white">
          {selectedMaterial?.src ? <img src={selectedMaterial.src} alt="" className="size-full object-contain" /> : completedTaskCount > 0 ? <Layers className="size-3.5 text-[#161823]/45" /> : <ImageIcon className="size-3.5 text-[#161823]/24" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[9px] font-medium text-[#161823]/68">{selectedMaterialLabel ? `${inheritsRoleBase ? '继承设定基准' : '状态基准'} · ${selectedMaterialLabel}` : completedTaskCount > 0 ? `已生成 ${completedTaskCount} 个方向素材` : '尚未设置状态基准'}</span>
          <span className="mt-0.5 block truncate text-[8px] text-[#161823]/34">未单独配置的方向会自动继承该素材</span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5" aria-label={`${state.name}方向素材`}>
        {visibleDirections.map((direction) => {
          const task = taskForCell(tasks, asset.id, state.id, direction)
          const status = task?.status ?? 'queued'
          const outputPreview = task?.output?.previewUrl ?? task?.output?.spriteSheetUrl
          const directionRef = state.directionMaterialRefs?.[direction]
          const directionMaterialIndex = directionRef?.kind === 'visual-version' ? directionRef.versionIndex : null
          const directionMaterial = directionMaterialIndex === null ? undefined : asset.visualVersions?.[directionMaterialIndex]
          const fallbackMaterial = directionMaterial ?? selectedMaterial
          const fallbackIndex = directionMaterialIndex ?? selectedMaterialIndex
          const fallbackLabel = fallbackIndex === null ? null : `方案 ${String.fromCharCode(65 + fallbackIndex)}`
          const sourceKind = outputPreview ? '动态素材' : directionMaterial ? '方向素材' : fallbackMaterial ? '继承基准' : '未配置'
          const canOpen = Boolean(outputPreview ? onOpenDynamic : fallbackMaterial?.src && onOpenVisual)
          return (
            <article
              key={direction}
              onDragOver={(event) => {
                if (!onDropMaterial) return
                event.preventDefault()
                event.stopPropagation()
              }}
              onDrop={(event) => {
                if (!onDropMaterial) return
                event.preventDefault()
                event.stopPropagation()
                onDropMaterial(direction)
              }}
              className="group min-w-0"
            >
              <div className={`relative aspect-square overflow-hidden rounded-xl border bg-[#f2f3f5] ${replacementTarget === direction ? 'border-[#357ef8] ring-2 ring-[#357ef8]/18' : 'border-black/[0.06]'}`}>
                <button
                  type="button"
                  disabled={!canOpen}
                  onClick={() => {
                    if (outputPreview) {
                      onOpenDynamic?.(asset.id, state.id, direction)
                      return
                    }
                    if (fallbackIndex !== null && fallbackLabel) onOpenVisual?.(fallbackIndex, fallbackLabel)
                  }}
                  aria-label={`查看${asset.name}${state.name}${DIRECTION_LABEL[direction]}素材`}
                  className="block size-full disabled:cursor-default"
                >
                  {outputPreview ? (
                    <img src={outputPreview} alt={`${asset.name}${state.name}${DIRECTION_LABEL[direction]}动态帧`} className="block size-full bg-white object-contain" />
                  ) : fallbackMaterial?.src ? (
                    <img src={fallbackMaterial.src} alt={`${asset.name}${state.name}${DIRECTION_LABEL[direction]}`} className="block size-full bg-white object-contain" />
                  ) : (
                    <span className="grid size-full place-items-center bg-[#f2f3f5] text-[9px] text-[#161823]/30">未配置</span>
                  )}
                </button>
                <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/68 px-1.5 py-0.5 text-[8px] font-medium text-white">{DIRECTION_LABEL[direction]}</span>
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-white/92 p-1 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <button type="button" aria-label={`替换${state.name}${DIRECTION_LABEL[direction]}素材`} onClick={() => onStartReplacement?.(direction)} className={`grid size-7 place-items-center rounded-md ${replacementTarget === direction ? 'bg-[#eaf2ff] text-[#357ef8]' : 'text-[#161823]/52 hover:bg-[#f2f3f5] hover:text-[#161823]'}`}><RefreshCw className="size-3.5" /></button>
                  {!outputPreview && onGenerateCell && <button type="button" aria-label={`生成${state.name}${DIRECTION_LABEL[direction]}素材`} disabled={status === 'generating'} onClick={() => onGenerateCell(asset.id, state.id, direction)} className="grid size-7 place-items-center rounded-md text-[#161823]/52 hover:bg-[#f2f3f5] hover:text-[#161823] disabled:cursor-default disabled:opacity-40"><WandSparkles className="size-3.5" /></button>}
                </div>
                <span className={`pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%_-_16px)] truncate rounded-md px-2 py-1 text-[8px] font-medium shadow-sm ${outputPreview ? 'bg-emerald-500 text-white' : directionMaterial ? 'bg-[#357ef8] text-white' : fallbackMaterial ? 'border border-black/[0.06] bg-white/92 text-[#161823]/48' : 'bg-white/84 text-[#161823]/34'}`}>{sourceKind}</span>
                {status === 'generating' && <span className="absolute inset-0 grid place-items-center bg-[#f1f1f2]"><Loader2 className="size-5 animate-spin text-[#161823]/55" /></span>}
              </div>
              <div className="pt-2">
                <div className="truncate text-[11px] font-semibold text-[#161823]">{state.name} · {DIRECTION_LABEL[direction]}</div>
                <div className="mt-1 flex min-w-0 items-center gap-1">
                  <span className="rounded bg-[#eee8ff] px-1.5 py-0.5 text-[8px] font-medium text-[#7656b7]">{outputPreview ? '工具生成' : '状态素材'}</span>
                  <span className="min-w-0 truncate text-[8px] text-[#161823]/36">{outputPreview ? '已生成' : fallbackLabel ?? '等待素材'}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function AssetStateWorkspace({
  asset,
  tasks,
  activeStateId,
  replacementTarget,
  onSelectState,
  onUpdateState,
  onDeleteState,
  onAddState,
  onGenerateCell,
  onOpenDynamic,
  onOpenVisual,
  onStartReplacement,
  onDropMaterial,
}: {
  asset: TowerDefenseAsset
  tasks: SpriteTask[]
  activeStateId?: string
  replacementTarget?: { stateId: string; direction?: TowerDefenseDirection } | null
  onSelectState: (stateId: string) => void
  onUpdateState?: TowerDefenseAssetLibraryProps['onUpdateState']
  onDeleteState?: TowerDefenseAssetLibraryProps['onDeleteState']
  onAddState?: TowerDefenseAssetLibraryProps['onAddState']
  onGenerateCell?: TowerDefenseAssetLibraryProps['onGenerateCell']
  onOpenDynamic?: (assetId: string, stateId: string, direction: TowerDefenseDirection) => void
  onOpenVisual?: (versionIndex: number, versionLabel: string) => void
  onStartReplacement: (stateId: string, direction?: TowerDefenseDirection) => void
  onDropMaterial: (stateId: string, direction?: TowerDefenseDirection) => void
}) {
  const activeState = asset.states.find((state) => state.id === activeStateId) ?? asset.states[0]

  return (
    <div className="mt-4 border-t border-black/[0.06] pt-3">
      <div className="flex min-w-0 items-center gap-2 border-b border-black/[0.06]">
        <div className="flex shrink-0 items-center gap-1.5 pb-2.5">
          <Layers className="size-3.5 text-[#161823]/42" />
          <span className="text-[10px] font-semibold text-[#161823]/68">状态</span>
        </div>
        <div className="thin-scroll flex min-w-0 flex-1 flex-nowrap items-end gap-0.5 overflow-x-auto" role="tablist" aria-label={`${asset.name}状态`}>
          {asset.states.map((state) => {
            const selected = activeState?.id === state.id
            return (
              <button
                key={state.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onSelectState(state.id)}
                className={`relative h-9 shrink-0 whitespace-nowrap px-3 text-[10px] font-medium ${selected ? 'text-[#161823]' : 'text-[#161823]/42 hover:text-[#161823]'}`}
              >
                {state.name}<span className="ml-1 text-[8px] opacity-48">{state.directions.length}向</span>
                {selected && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#161823]" />}
              </button>
            )
          })}
        </div>
        <button type="button" onClick={() => onAddState?.(asset.id)} disabled={!onAddState} className="mb-1.5 ml-auto flex h-7 shrink-0 items-center gap-1 rounded-md border border-black/[0.08] bg-white px-2 text-[9px] font-medium text-[#161823]/62 hover:bg-[#f7f7f8] disabled:cursor-default disabled:opacity-40"><Plus className="size-3" />增加状态</button>
      </div>

      {activeState ? (
        <div className="pt-2.5" role="tabpanel">
          <StateProductionRow
            key={activeState.id}
            asset={asset}
            state={activeState}
            tasks={tasks}
            replacementTarget={replacementTarget?.stateId === activeState.id ? replacementTarget.direction ?? 'base' : null}
            onUpdateState={onUpdateState}
            onDeleteState={onDeleteState}
            onGenerateCell={onGenerateCell}
            onOpenDynamic={onOpenDynamic}
            onOpenVisual={onOpenVisual}
            onStartReplacement={(target) => onStartReplacement(activeState.id, target === 'base' ? undefined : target)}
            onDropMaterial={(direction) => onDropMaterial(activeState.id, direction)}
          />
        </div>
      ) : (
        <div className="grid min-h-24 place-items-center rounded-b-xl bg-[#fafafa] text-[10px] text-[#161823]/36">暂无状态，点击右侧按钮添加</div>
      )}
    </div>
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
void AssetVersionCard
void CatalogAssetCard

export function LegacyTowerDefenseAssetLibrary({
  uiScheme: _uiScheme = 'canvas',
  mode,
  assets,
  tasks,
  towerSlots,
  selectedAssetId,
  onSelectAsset,
  onAttachAsset,
  onRegenerateAsset,
  onCreateSprite,
  onAddVisualVersion,
  onReferenceChange,
  onSetAssetEnabled,
  onPreviewOpen,
  canvasEditing = false,
  onCanvasEditingChange,
  previewRequest,
  visibleImageCount,
  generationInProgress = false,
  productionApplied,
  onConfirmSelections,
  onUpdateState,
  onAssignMaterial,
  onAssignDirectionMaterial,
  onAddState,
  onDeleteState,
  onGenerateCell,
  onBatchGenerate,
  onProceed,
  uiNodes,
  uiScreens,
}: TowerDefenseAssetLibraryProps) {
  const [catalogKindFilter, setCatalogKindFilter] = useState<CatalogKindFilter>('all')
  const [catalogQuery, setCatalogQuery] = useState('')
  const [catalogCategory, setCatalogCategory] = useState<TowerDefenseAssetCategory | 'all'>('all')
  const [catalogSource, setCatalogSource] = useState<'all' | 'generated' | 'uploaded'>('all')
  const [catalogCanvasEditing, setCatalogCanvasEditing] = useState(false)
  const [canvasSpares, setCanvasSpares] = useState<CanvasSpareTile[]>([])
  const [internalAssetId, setInternalAssetId] = useState(assets[0]?.id ?? '')
  const [versionOrder, setVersionOrder] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(assets.map((asset) => [asset.id, Array.from({ length: asset.visualVersions?.length ?? 1 }, (_, index) => index)])),
  )
  const [generatedSources, setGeneratedSources] = useState<Record<string, number>>({})
  const [uploadedSources, setUploadedSources] = useState<Record<string, string>>({})
  const [generatingVersions, setGeneratingVersions] = useState<Set<string>>(new Set())
  const [materialPlacement, setMaterialPlacement] = useState<MaterialPlacement | null>(null)
  const [replacementTarget, setReplacementTarget] = useState<{ assetId: string; stateId: string; direction?: TowerDefenseDirection } | null>(null)
  const [activeStateIds, setActiveStateIds] = useState<Record<string, string>>({})
  const draggedVersionRef = useRef<{ assetId: string; versionId: number } | null>(null)
  const candidateSectionRefs = useRef(new Map<string, HTMLElement>())
  const [referencedVersions, setReferencedVersions] = useState<Record<string, number>>(() =>
    Object.fromEntries(assets.filter(isConfirmed).map((asset) => [asset.id, asset.selectedVisualVersion ?? 0])),
  )
  const [lightbox, setLightbox] = useState<TowerAssetLightbox | null>(null)
  const [dismissedPreviewNonce, setDismissedPreviewNonce] = useState<number | null>(null)
  const requestedLightbox: TowerAssetLightbox | null =
    previewRequest && previewRequest.nonce !== dismissedPreviewNonce
      ? {
          kind: 'visual',
          assetId: previewRequest.assetId,
          versionIndex: previewRequest.versionIndex,
          versionLabel: previewRequest.versionLabel,
        }
      : null
  const activeLightbox = lightbox ?? requestedLightbox
  // 资产分类、行与卡片始终完整挂载；生成进度只控制卡片内部图片何时显现。
  const visibleAssets = assets
  const currentAssetId = selectedAssetId ?? internalAssetId
  const selectedAsset = visibleAssets.find((asset) => asset.id === currentAssetId) ?? visibleAssets[0]
  const replacementAsset = replacementTarget ? visibleAssets.find((asset) => asset.id === replacementTarget.assetId) : undefined
  const replacementState = replacementTarget ? replacementAsset?.states.find((state) => state.id === replacementTarget.stateId) : undefined
  const replacementSlotLabel = replacementTarget?.direction ? DIRECTION_LABEL[replacementTarget.direction] : '状态基准'
  const replacementContextLabel = replacementAsset && replacementState
    ? `${replacementAsset.name} · ${replacementState.name} · ${replacementSlotLabel}`
    : undefined
  const canvasMode = Boolean(canvasEditing) || catalogCanvasEditing
  const spareAsset = buildCatalogSpareAsset(canvasSpares)
  const showSpareBin = catalogShowsSpareBin(canvasSpares.length, {
    kind: catalogKindFilter,
    source: catalogSource,
    category: catalogCategory,
  })
  const uiSlotNeedle = catalogQuery.trim().toLocaleLowerCase()
  const uiSlotGroups = groupUiSlotsByScreen(uiNodes, uiScreens).map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (catalogKindFilter !== 'all' && catalogKindFilter !== 'image') return false
      if (catalogCategory !== 'all' && catalogCategory !== 'ui') return false
      if (uiSlotNeedle && !`${item.asset.name} ${item.asset.role} ${item.asset.description}`.toLocaleLowerCase().includes(uiSlotNeedle)) return false
      const source = item.asset.visualVersions?.[0]?.source
      if (catalogSource === 'uploaded') return source === 'upload'
      if (catalogSource === 'generated') return source === 'generated'
      return true
    }),
  })).filter((group) => group.items.length > 0)
  const uiSlotAssets = flattenUiSlotAssets(uiSlotGroups)
  const showUiSlotGroups = uiSlotGroups.length > 0

  const categories = Array.from(new Set(visibleAssets.map((asset) => asset.category)))
  const pathCategories = Array.from(new Set<TowerDefenseAssetCategory>([
    ...categories,
    ...(uiSlotAssets.length ? (['ui'] as const) : []),
  ]))
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
  const catalogGroups = buildTowerCanvasSlots({
    assets: visibleAssets,
    tasks,
    mode,
    categoryFilter: catalogCategory,
    query: catalogQuery,
    kindFilter: catalogKindFilter,
    generationInProgress,
    visibleImageCount,
    productionApplied,
  }).filter((slot) => {
    if (replacementTarget) return slot.asset.id === replacementTarget.assetId
    if (catalogSource === 'all') return true
    const versionIndex = slot.current.kind === 'visual' ? slot.current.versionIndex : slot.asset.selectedVisualVersion ?? 0
    const isUploaded = Boolean(uploadedSources[`${slot.asset.id}:${versionIndex}`])
    if (catalogSource === 'uploaded') return isUploaded
    return !isUploaded
  })

  const selectAsset = (assetId: string) => {
    setInternalAssetId(assetId)
    onSelectAsset?.(assetId)
  }
  const openAssetPreview = (assetId: string, versionIndex: number, versionLabel: string, title?: string) => {
    if (assetId !== CATALOG_SPARE_BIN_ID) selectAsset(assetId)
    onPreviewOpen?.()
    setLightbox({ kind: 'visual', assetId, versionIndex, versionLabel, title })
  }
  const openSparePreview = (versionIndex = 0) => {
    const spare = canvasSpares[versionIndex] ?? canvasSpares[0]
    if (!spare) return
    openAssetPreview(CATALOG_SPARE_BIN_ID, versionIndex, spare.record.label, CATALOG_SPARE_BIN_TITLE)
  }
  const openDynamicPreview = (assetId: string, stateId: string, direction: TowerDefenseDirection) => {
    selectAsset(assetId)
    onPreviewOpen?.()
    setLightbox({ kind: 'dynamic', assetId, stateId, direction })
  }
  const ensureReferencedVersion = (assetId: string, versionId: number, sourceVersionIndex: number) => {
    setReferencedVersions((current) => {
      if (current[assetId] === versionId) return current
      onReferenceChange?.(assetId, sourceVersionIndex)
      return { ...current, [assetId]: versionId }
    })
  }
  const assignMaterialToState = (assetId: string, stateId: string, versionIndex: number) => {
    onAssignMaterial?.(assetId, stateId, versionIndex)
    setActiveStateIds((current) => ({ ...current, [assetId]: stateId }))
    setMaterialPlacement(null)
    setReplacementTarget(null)
  }
  const assignMaterialToDirection = (assetId: string, stateId: string, direction: TowerDefenseDirection, versionIndex: number) => {
    onAssignDirectionMaterial?.(assetId, stateId, direction, versionIndex)
    setActiveStateIds((current) => ({ ...current, [assetId]: stateId }))
    setMaterialPlacement(null)
    setReplacementTarget(null)
  }
  const dropMaterialOnState = (assetId: string, stateId: string, direction?: TowerDefenseDirection) => {
    const dragged = draggedVersionRef.current
    if (!dragged || dragged.assetId !== assetId) return
    const sourceVersionIndex = generatedSources[`${assetId}:${dragged.versionId}`] ?? dragged.versionId
    if (direction) assignMaterialToDirection(assetId, stateId, direction, sourceVersionIndex)
    else assignMaterialToState(assetId, stateId, sourceVersionIndex)
    draggedVersionRef.current = null
  }
  const startMaterialReplacement = (assetId: string, stateId: string, direction?: TowerDefenseDirection) => {
    const sameTarget = replacementTarget?.assetId === assetId
      && replacementTarget.stateId === stateId
      && replacementTarget.direction === direction
    setMaterialPlacement(null)
    if (sameTarget) {
      setReplacementTarget(null)
      return
    }
    setReplacementTarget({ assetId, stateId, direction })
    window.requestAnimationFrame(() => {
      candidateSectionRefs.current.get(assetId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
  const uploadVersion = (assetId: string, sourceVersionIndex: number, file: File) => {
    if (assetId === CATALOG_SPARE_BIN_ID) {
      void readTowerDefenseUploadImage(file).then((image) => {
        const spare = createCanvasSpareFromUpload(image)
        setCanvasSpares((current) => {
          setLightbox({
            kind: 'visual',
            assetId: CATALOG_SPARE_BIN_ID,
            title: CATALOG_SPARE_BIN_TITLE,
            versionIndex: current.length,
            versionLabel: image.label,
            source: { src: image.src, width: image.width, height: image.height },
          })
          return [...current, spare]
        })
      })
      return
    }
    const currentIds = versionOrder[assetId] ?? []
    const nextVersionId = Math.max(-1, ...currentIds) + 1
    const versionKey = `${assetId}:${nextVersionId}`
    const sourceUrl = URL.createObjectURL(file)
    setGeneratedSources((current) => ({ ...current, [versionKey]: sourceVersionIndex }))
    setUploadedSources((current) => ({ ...current, [versionKey]: sourceUrl }))
    setVersionOrder((current) => ({ ...current, [assetId]: [nextVersionId, ...(current[assetId] ?? [])] }))
    setLightbox({ kind: 'visual', assetId, versionIndex: sourceVersionIndex, versionLabel: file.name, source: { src: sourceUrl } })
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
  const toggleCanvasEditing = () => {
    if (onCanvasEditingChange) onCanvasEditingChange(!canvasMode)
    else setCatalogCanvasEditing((current) => !current)
  }
  const downloadCatalogBatch = () => {
    catalogGroups.forEach((slot) => {
      const versionIndex = slot.current.kind === 'visual' ? slot.current.versionIndex : slot.asset.selectedVisualVersion ?? 0
      downloadVersion(slot.asset, `方案 ${String.fromCharCode(65 + versionIndex)}`)
    })
  }

  if (!selectedAsset) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#EEF0F3]">
        <header className="flex h-[58px] shrink-0 items-center border-b border-black/[0.06] bg-white px-4 text-[13px] font-semibold">素材库</header>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-[#161823]/45">
          <span className={generationInProgress ? 'size-6 animate-spin rounded-full border-2 border-[#161823]/12 border-t-[#161823]/60' : ''}>{generationInProgress ? null : <Sparkles className="size-7" />}</span>
          <p className="text-[12px] font-medium">{generationInProgress ? '正在生成第 1 项视觉设定' : '先在 Chat 中完成视觉意图选择'}</p>
          <p className="text-[10px]">{generationInProgress ? '生成完成后会自动加入当前分类' : '开始生成后，图片会依次出现在这里'}</p>
        </div>
      </div>
    )
  }

  const catalogDetailOpen = Boolean(activeLightbox) && !canvasMode

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col bg-[var(--color-surface-0)]">
      {replacementContextLabel && <span aria-hidden className="pointer-events-none absolute inset-0 z-[45] border-2 border-[#357ef8] shadow-[inset_0_0_0_1px_rgba(53,126,248,0.08)]" />}
      {!catalogDetailOpen && <div aria-label="素材库筛选工具栏" className="shrink-0 border-b border-[rgba(45,66,107,0.06)] bg-white">
          <div className="flex h-10 items-center justify-between gap-2 px-3">
            <div className="flex min-w-0 items-center gap-2">
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
                  className={`h-7 shrink-0 rounded-lg px-2.5 text-[12px] leading-4 ${catalogKindFilter === value ? 'bg-[#f5f7fa] font-semibold text-[#1c1f23]' : 'font-normal text-[#161823]/60 hover:text-[#1c1f23]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="批量下载当前筛选素材"
                disabled={catalogGroups.length === 0}
                onClick={downloadCatalogBatch}
                className="flex h-6 items-center gap-1 rounded-lg border border-[rgba(45,66,107,0.12)] px-2 text-[12px] font-semibold leading-4 text-[#161823]/80 hover:bg-[#f5f7fa] disabled:cursor-default disabled:opacity-40"
              >
                <Download className="size-3.5" />
                批量下载
              </button>
              <button
                type="button"
                aria-pressed={canvasMode}
                title="画布编辑"
                onClick={toggleCanvasEditing}
                className={`flex h-6 items-center gap-1 rounded-lg border px-2 text-[12px] font-semibold leading-4 ${canvasMode ? 'border-[#161823] bg-[#161823] text-white' : 'border-[rgba(45,66,107,0.12)] text-[#161823]/80 hover:bg-[#f5f7fa]'}`}
              >
                <LayoutGrid className="size-3.5" />
                画布编辑
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <label className="flex h-7 w-40 items-center gap-2 rounded-full border border-[rgba(45,66,107,0.12)] bg-white pl-2 pr-3 text-[#161823]/60">
              <Search className="size-4 shrink-0" />
              <input
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="搜索"
                className="min-w-0 flex-1 bg-transparent text-[12px] leading-4 text-[#1c1f23] outline-none placeholder:text-[#161823]/60"
              />
            </label>
            <label className="relative shrink-0">
              <select
                aria-label="存储路径"
                value={catalogCategory}
                onChange={(event) => setCatalogCategory(event.target.value as TowerDefenseAssetCategory | 'all')}
                className="h-7 appearance-none rounded-full border border-[rgba(45,66,107,0.12)] bg-white pl-2.5 pr-7 text-[12px] font-semibold leading-4 text-[#161823]/80 outline-none"
              >
                <option value="all">存储路径</option>
                {pathCategories.map((category) => (
                  <option key={category} value={category}>{catalogCategoryPath(category)}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-[#161823]/60" />
            </label>
            <label className="relative shrink-0">
              <select
                aria-label="生成方式"
                value={catalogSource}
                onChange={(event) => setCatalogSource(event.target.value as 'all' | 'generated' | 'uploaded')}
                className="h-7 appearance-none rounded-full border border-[rgba(45,66,107,0.12)] bg-white pl-2.5 pr-7 text-[12px] font-semibold leading-4 text-[#161823]/80 outline-none"
              >
                <option value="all">生成方式</option>
                <option value="generated">工具生成</option>
                <option value="uploaded">用户上传</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-[#161823]/60" />
            </label>
            <label className="relative shrink-0">
              <select
                aria-label="类型"
                value={catalogKindFilter}
                onChange={(event) => setCatalogKindFilter(event.target.value as CatalogKindFilter)}
                className="h-7 appearance-none rounded-full border border-[rgba(45,66,107,0.12)] bg-white pl-2.5 pr-7 text-[12px] font-semibold leading-4 text-[#161823]/80 outline-none"
              >
                <option value="all">类型</option>
                <option value="image">图片</option>
                <option value="video">视频</option>
                <option value="audio">音频</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-[#161823]/60" />
            </label>
          </div>
        </div>}

      {replacementContextLabel && (
        <div role="status" aria-label="素材替换模式" className="flex h-10 shrink-0 items-center gap-2 border-b border-[#357ef8]/22 bg-[#eef5ff] px-4 text-[#245fc6]">
          <RefreshCw className="size-3.5 shrink-0" />
          <span className="shrink-0 rounded-md bg-[#357ef8] px-1.5 py-0.5 text-[8px] font-semibold text-white">替换模式</span>
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium">正在替换「{replacementContextLabel}」，点击上方候选素材即可完成</span>
          <button type="button" onClick={() => setReplacementTarget(null)} className="h-7 shrink-0 rounded-md px-2 text-[9px] font-medium text-[#245fc6] hover:bg-white/70">取消</button>
        </div>
      )}

      {!catalogDetailOpen && (canvasMode ? (
        <div className="min-h-0 flex-1">
          <TowerDefenseSlotAssetLibrary
            mode={mode}
            assets={[...assets, ...uiSlotAssets]}
            tasks={tasks}
            towerSlots={towerSlots}
            selectedAssetId={selectedAssetId}
            onSelectAsset={onSelectAsset}
            onAttachAsset={onAttachAsset}
            onRegenerateAsset={onRegenerateAsset}
            onCreateSprite={onCreateSprite}
            onAddVisualVersion={onAddVisualVersion}
            onReferenceChange={onReferenceChange}
            onSetAssetEnabled={onSetAssetEnabled}
            onPreviewOpen={onPreviewOpen}
            onConfirmSelections={onConfirmSelections}
            onUpdateState={onUpdateState}
            onAssignDirectionMaterial={onAssignDirectionMaterial}
            onBatchGenerate={onBatchGenerate}
            onProceed={onProceed}
            visibleImageCount={visibleImageCount}
            generationInProgress={generationInProgress}
            productionApplied={productionApplied}
            canvasEditing
            canvasSpares={canvasSpares}
            onCanvasSparesChange={setCanvasSpares}
            hideChrome
            libraryCategory={catalogCategory}
            libraryQuery={catalogQuery}
            libraryKindFilter={catalogKindFilter}
          />
        </div>
      ) : (
      <div
        className="thin-scroll min-h-0 flex-1 overflow-auto"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="w-full min-w-full">
          <div className="mx-auto max-w-[1440px]">
            {generationInProgress && <div className="mb-4 flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 text-[10px] text-[#161823]/58 shadow-sm">
              <span className="size-3.5 animate-spin rounded-full border-2 border-[#161823]/12 border-t-[#161823]/60" />
              <span>资产分类与容器已就绪，图片正在逐张生成：{Math.min(visibleImageCount ?? 0, orderedImageKeys.length)} / {orderedImageKeys.length} 张</span>
            </div>}
            {catalogGroups.length > 0 || showSpareBin || showUiSlotGroups ? (
                <div data-catalog-grid className="space-y-6">
                  {showSpareBin && (
                    <section aria-label={CATALOG_SPARE_BIN_TITLE}>
                      <div className="flex items-center gap-1.5 px-3">
                        <h3 className="text-[14px] font-semibold leading-5 text-[#1c1f23]">{CATALOG_SPARE_BIN_TITLE}</h3>
                        <span className="rounded-full bg-[#f5f7fa] px-[5px] py-px text-center text-[12px] leading-4 text-[#6b7075]">{canvasSpares.length}</span>
                      </div>
                      <div
                        className="grid justify-start bg-white p-2"
                        style={{
                          gridTemplateColumns: `repeat(auto-fill, ${SHELF.collapsedWidth}px)`,
                          columnGap: 4,
                          rowGap: 8,
                        }}
                      >
                        <div className="cursor-pointer">
                          <CatalogGroupCard
                            title={CATALOG_SPARE_BIN_TITLE}
                            coverSrc={canvasSpares[0]?.record.src}
                            count={canvasSpares.length}
                            onOpen={() => openSparePreview(0)}
                            onCreateSprite={(() => {
                              const spare = canvasSpares[0]
                              if (!spare?.sourceAssetId) return undefined
                              const versionIndex = spare.record.kind === 'visual' ? Math.max(0, spare.record.versionIndex) : 0
                              return () => onCreateSprite?.(spare.sourceAssetId!, versionIndex, spare.record.label)
                            })()}
                            onRegenerate={(() => {
                              const spare = canvasSpares[0]
                              if (!spare?.sourceAssetId) return undefined
                              const versionIndex = spare.record.kind === 'visual' ? Math.max(0, spare.record.versionIndex) : 0
                              return () => regenerateVersion(spare.sourceAssetId!, versionIndex, spare.record.label)
                            })()}
                            onDownload={() => {
                              const src = canvasSpares[0]?.record.src
                              if (!src) return
                              const link = document.createElement('a')
                              link.href = src
                              link.download = `${canvasSpares[0].record.label}.webp`
                              link.click()
                            }}
                            onAttach={() => onAttachAsset?.(canvasSpares[0]?.sourceAssetId ?? selectedAsset.id, canvasSpares[0]?.record.label ?? CATALOG_SPARE_BIN_TITLE)}
                          />
                        </div>
                      </div>
                    </section>
                  )}
                  {categories.map((category) => {
                    const categoryGroups = catalogGroups.filter((slot) => slot.asset.category === category)
                    if (categoryGroups.length === 0) return null
                    const categoryAssets = Array.from(new Map(categoryGroups.map((slot) => [slot.asset.id, slot.asset])).values())
                    return (
                      <section key={category} aria-label={categoryLabel(category)}>
                        <div className="flex items-center gap-1.5 px-3">
                          <h3 className="text-[14px] font-semibold leading-5 text-[#1c1f23]">{categoryLabel(category)}</h3>
                          <span className="rounded-full bg-[#f5f7fa] px-[5px] py-px text-center text-[12px] leading-4 text-[#6b7075]">{categoryGroups.length}</span>
                        </div>
                        <div
                          className="grid justify-start bg-white p-2"
                          style={{
                            gridTemplateColumns: `repeat(auto-fill, ${SHELF.collapsedWidth}px)`,
                            columnGap: 4,
                            rowGap: 8,
                          }}
                        >
                          {categoryGroups.map((slot) => {
                            const versionIndex = slot.current.kind === 'visual' ? slot.current.versionIndex : slot.asset.selectedVisualVersion ?? 0
                            const versionLabel = slot.current.label.startsWith('方案') ? slot.current.label : `方案 ${String.fromCharCode(65 + versionIndex)}`
                            const generating = generatingVersions.has(`${slot.asset.id}:${versionIndex}`) || isProgressiveImagePending(`${slot.asset.id}:${versionIndex}`)
                            return (
                              <div
                                key={slot.key}
                                ref={(node) => {
                                  if (node) candidateSectionRefs.current.set(slot.asset.id, node)
                                  else candidateSectionRefs.current.delete(slot.asset.id)
                                }}
                                className="cursor-pointer"
                              >
                                <CatalogGroupCard
                                  title={slot.title}
                                  coverSrc={slot.current.src}
                                  count={Math.max(1, slot.records.length)}
                                  generating={generating || slot.pending}
                                  onOpen={() => openAssetPreview(slot.asset.id, versionIndex, versionLabel, slot.title)}
                                  onCreateSprite={() => onCreateSprite?.(slot.asset.id, versionIndex, versionLabel)}
                                  onRegenerate={() => regenerateVersion(slot.asset.id, versionIndex, versionLabel)}
                                  onDownload={() => downloadVersion(slot.asset, versionLabel)}
                                  onAttach={() => onAttachAsset?.(slot.asset.id, versionLabel)}
                                />
                              </div>
                            )
                          })}
                        </div>
                        {mode === 'production' && categoryAssets.map((groupAsset) => (
                          <div key={groupAsset.id} className="px-3">
                            {materialPlacement?.assetId === groupAsset.id && (
                              <MaterialTargetPicker
                                asset={groupAsset}
                                placement={materialPlacement}
                                baseUsed={referencedVersions[groupAsset.id] === materialPlacement.versionId}
                                onUseBase={() => {
                                  ensureReferencedVersion(groupAsset.id, materialPlacement.versionId, materialPlacement.sourceVersionIndex)
                                  setMaterialPlacement(null)
                                }}
                                onUseState={(stateId) => assignMaterialToState(groupAsset.id, stateId, materialPlacement.sourceVersionIndex)}
                                onClose={() => setMaterialPlacement(null)}
                              />
                            )}
                            {groupAsset.category !== 'map' && groupAsset.category !== 'visual-style' && (
                              <AssetStateWorkspace
                                asset={groupAsset}
                                tasks={tasks}
                                activeStateId={activeStateIds[groupAsset.id]}
                                replacementTarget={replacementTarget?.assetId === groupAsset.id ? replacementTarget : null}
                                onSelectState={(stateId) => {
                                  setActiveStateIds((current) => ({ ...current, [groupAsset.id]: stateId }))
                                  setReplacementTarget(null)
                                }}
                                onUpdateState={onUpdateState}
                                onDeleteState={onDeleteState}
                                onAddState={onAddState}
                                onGenerateCell={onGenerateCell}
                                onOpenDynamic={openDynamicPreview}
                                onOpenVisual={(versionIndex, versionLabel) => openAssetPreview(groupAsset.id, versionIndex, versionLabel)}
                                onStartReplacement={(stateId, direction) => startMaterialReplacement(groupAsset.id, stateId, direction)}
                                onDropMaterial={(stateId, direction) => dropMaterialOnState(groupAsset.id, stateId, direction)}
                              />
                            )}
                          </div>
                        ))}
                      </section>
                    )
                  })}
                  {showUiSlotGroups && (
                    <section aria-label="UI">
                      {uiSlotGroups.map((group) => (
                        <div key={group.screenId}>
                          <div className="flex items-center gap-1.5 px-3">
                            <h3 className="text-[14px] font-semibold leading-5 text-[#1c1f23]">{group.title}</h3>
                            <span className="rounded-full bg-[#f5f7fa] px-[5px] py-px text-center text-[12px] leading-4 text-[#6b7075]">
                              {group.items.length}
                            </span>
                          </div>
                          <div
                            className="grid justify-start bg-white p-2"
                            style={{
                              gridTemplateColumns: `repeat(auto-fill, ${SHELF.collapsedWidth}px)`,
                              columnGap: 4,
                              rowGap: 8,
                            }}
                          >
                            {group.items.map((item) => {
                              const cover = item.asset.visualVersions?.[0]?.src
                              return (
                                <div key={item.asset.id} className="cursor-pointer">
                                  <CatalogGroupCard
                                    title={item.asset.name}
                                    coverSrc={cover}
                                    count={item.filled ? 1 : 0}
                                    caption={item.filled ? '当前引用' : '空槽位 · 代码'}
                                    emptyLabel="空槽位"
                                    onOpen={() =>
                                      openAssetPreview(item.asset.id, 0, item.asset.name, item.asset.name)
                                    }
                                    onDownload={() => downloadNamedSrc(cover, `${item.asset.name}.png`)}
                                    onAttach={() => onAttachAsset?.(item.asset.id, item.asset.name)}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              ) : (
                <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-black/[0.1] bg-white text-[11px] text-[#161823]/38">没有符合当前筛选条件的素材</div>
              )}
          </div>
        </div>

      </div>
      ))}

      {catalogDetailOpen && activeLightbox && (() => {
        const asset = activeLightbox.kind === 'visual' && activeLightbox.assetId === CATALOG_SPARE_BIN_ID
          ? spareAsset
          : activeLightbox.kind === 'visual' && isCatalogUiSlotAssetId(activeLightbox.assetId)
            ? uiSlotAssets.find((item) => item.id === activeLightbox.assetId)
          : visibleAssets.find((item) => item.id === activeLightbox.assetId)
        if (!asset) return null
        if (activeLightbox.kind === 'dynamic') {
          const state = asset.states.find((item) => item.id === activeLightbox.stateId)
          const task = taskForCell(tasks, asset.id, activeLightbox.stateId, activeLightbox.direction)
          const sourceUrl = task?.output?.previewUrl ?? task?.output?.spriteSheetUrl
          if (!state || !task || !sourceUrl) return null
          const versionLabel = `${state.name} · ${DIRECTION_LABEL[activeLightbox.direction]}`
          return (
            <div className="min-h-0 flex-1">
              <TowerAssetImageDialog
                asset={asset}
                title={activeLightbox.title ?? versionLabel}
                versionIndex={asset.selectedVisualVersion ?? 0}
                versionLabel={versionLabel}
                source={{
                  src: sourceUrl,
                  width: task.output?.width,
                  height: task.output?.height,
                  detail: `${task.frameCount} 帧${task.fps ? ` · ${task.fps} FPS` : ''}`,
                }}
                onAttach={() => onAttachAsset?.(asset.id, versionLabel)}
                onCreateSprite={() => onCreateSprite?.(asset.id, asset.selectedVisualVersion ?? 0, versionLabel)}
                onRegenerate={() => onRegenerateAsset?.(asset.id, versionLabel)}
                onDownload={() => downloadNamedSrc(sourceUrl, `${asset.name}-${versionLabel}.webp`)}
                onClose={() => setLightbox(null)}
              />
            </div>
          )
        }
        const isSpareBin = asset.id === CATALOG_SPARE_BIN_ID
        const isUiSlice = isCatalogUiSlotAssetId(asset.id)
        const spare = isSpareBin ? canvasSpares[activeLightbox.versionIndex] : undefined
        const uiVersion = isUiSlice ? asset.visualVersions?.[activeLightbox.versionIndex] : undefined
        return (
          <div className="min-h-0 flex-1">
            <TowerAssetImageDialog
              asset={asset}
              title={activeLightbox.title ?? asset.name}
              versionIndex={activeLightbox.versionIndex}
              versionLabel={activeLightbox.versionLabel}
              source={activeLightbox.source ?? (spare?.record.src ? { src: spare.record.src, width: spare.record.width, height: spare.record.height } : uiVersion ? { src: uiVersion.src, width: uiVersion.width, height: uiVersion.height } : undefined)}
              onAttach={() => onAttachAsset?.(spare?.sourceAssetId ?? (isSpareBin ? selectedAsset.id : asset.id), activeLightbox.versionLabel)}
              onCreateSprite={isSpareBin || isUiSlice
                ? (spare?.sourceAssetId
                  ? () => onCreateSprite?.(spare.sourceAssetId!, spare.record.kind === 'visual' ? Math.max(0, spare.record.versionIndex) : 0, spare.record.label)
                  : undefined)
                : () => onCreateSprite?.(asset.id, activeLightbox.versionIndex, activeLightbox.versionLabel)}
              onRegenerate={isSpareBin || isUiSlice
                ? (spare?.sourceAssetId
                  ? () => regenerateVersion(spare.sourceAssetId!, spare.record.kind === 'visual' ? Math.max(0, spare.record.versionIndex) : 0, spare.record.label)
                  : undefined)
                : () => regenerateVersion(asset.id, activeLightbox.versionIndex, activeLightbox.versionLabel)}
              onDownload={() => {
                if (isSpareBin) downloadNamedSrc(spare?.record.src, `${spare?.record.label ?? CATALOG_SPARE_BIN_TITLE}.webp`)
                else if (isUiSlice) downloadNamedSrc(uiVersion?.src, `${uiVersion?.label ?? asset.name}.png`)
                else downloadVersion(asset, activeLightbox.versionLabel)
              }}
              currentVersionIndex={isSpareBin || isUiSlice ? 0 : (asset.selectedVisualVersion ?? 0)}
              onSetCurrent={(versionIndex) => {
                if (isSpareBin) {
                  const moved = canvasSpares[versionIndex]
                  if (!moved || versionIndex === 0) return
                  setCanvasSpares((current) => {
                    if (versionIndex <= 0 || versionIndex >= current.length) return current
                    const next = [...current]
                    const [item] = next.splice(versionIndex, 1)
                    return [item, ...next]
                  })
                  setLightbox({
                    kind: 'visual',
                    assetId: CATALOG_SPARE_BIN_ID,
                    title: CATALOG_SPARE_BIN_TITLE,
                    versionIndex: 0,
                    versionLabel: moved.record.label,
                    source: moved.record.src ? { src: moved.record.src, width: moved.record.width, height: moved.record.height } : undefined,
                  })
                  return
                }
                if (isUiSlice) {
                  const next = asset.visualVersions?.[versionIndex]
                  if (!next) return
                  setLightbox({
                    kind: 'visual',
                    assetId: asset.id,
                    title: asset.name,
                    versionIndex,
                    versionLabel: next.label ?? asset.name,
                    source: { src: next.src, width: next.width, height: next.height },
                  })
                  return
                }
                onReferenceChange?.(asset.id, versionIndex)
              }}
              onUpload={isUiSlice ? undefined : (file) => uploadVersion(asset.id, activeLightbox.versionIndex, file)}
              history={isSpareBin
                ? canvasSpares.map((item, orderIndex) => ({
                    id: orderIndex,
                    versionIndex: orderIndex,
                    versionLabel: item.record.label,
                    generating: false,
                    src: item.record.src,
                  }))
                : isUiSlice
                  ? (asset.visualVersions ?? []).map((item, orderIndex) => ({
                      id: orderIndex,
                      versionIndex: orderIndex,
                      versionLabel: item.label ?? item.id,
                      generating: false,
                      src: item.src,
                    }))
                : (versionOrder[asset.id] ?? []).map((versionId, orderIndex) => ({
                    id: versionId,
                    versionIndex: generatedSources[`${asset.id}:${versionId}`] ?? versionId,
                    versionLabel: `方案 ${String.fromCharCode(65 + orderIndex)}`,
                    generating: generatingVersions.has(`${asset.id}:${versionId}`),
                    src: uploadedSources[`${asset.id}:${versionId}`],
                  }))}
              onSelectHistory={(versionIndex, versionLabel, src) =>
                setLightbox({
                  kind: 'visual',
                  assetId: asset.id,
                  title: activeLightbox.title ?? asset.name,
                  versionIndex,
                  versionLabel,
                  source: src ? { src } : undefined,
                })
              }
              onClose={() => {
                setLightbox(null)
                if (previewRequest) setDismissedPreviewNonce(previewRequest.nonce)
              }}
            />
          </div>
        )
      })()}

      {!catalogDetailOpen && !canvasMode && mode === 'production' && (
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

export default function TowerDefenseAssetLibrary(props: TowerDefenseAssetLibraryProps) {
  return <LegacyTowerDefenseAssetLibrary {...props} uiScheme="catalog" />
}
