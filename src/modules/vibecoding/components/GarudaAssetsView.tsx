/* eslint-disable react-refresh/only-export-components -- asset schema and selectors are shared with the project toolbar */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Box,
  Check,
  Film,
  FolderTree,
  Image as ImageIcon,
  LayoutGrid,
  Layers,
  ListCollapse,
  Music2,
  Upload,
} from '@/shared/icons'
import ImageCanvasEditor from './ImageCanvasEditor'
import LayeredAssetEditor from './LayeredAssetEditor'
import { resolveLayerManifest } from './AssetLayerManifest'
import {
  GARUDA_ASSET_GROUPS,
  resolveAssetPrompt,
  type AssetGroup,
  type AssetItem,
  type AssetKind,
  type AssetLayerManifest,
} from './ProjectAssetCatalog'
import { resolveMarketingKingAssetUrl } from './marketingKingAssetCache'

// Three.js 仅在用户真正打开 3D 素材详情时下载。
const XiahuaMascot3DStudio = lazy(() => import('./XiahuaMascot3DStudio'))

/**
 * Garuda 资产视图
 *
 * 直接从 /public/garuda/assets/ 读图，分组展示主角 / 敌人 / 道具 /
 * UI / 音效。图片点击后直接进入精确编辑器；音效、视频和 3D 素材
 * 保留各自必要的播放 / 查看详情。长帧序列只显示一个代表 + 帧数标签，
 * 避免一次性渲染数百张 webp。
 */

export type { AssetGroup, AssetItem, AssetKind }

interface GarudaAssetsViewProps {
  /** Group/items to render. Defaults to the Garuda game's GROUPS so
   *  existing call sites stay unchanged; pass a project-specific list
   *  (e.g. H5 活动素材) to reuse the same layout for other surfaces. */
  groups?: AssetGroup[]
  /** Controlled active kind. When provided, the component renders no
   *  internal kind tab-bar — the parent (toolbar) owns the 图像/音频/视频
   *  switcher and feeds the selection down. */
  activeKind?: AssetKind
  onKindChange?: (k: AssetKind) => void
  /** Controlled selected asset (the one opened on the canvas). When
   *  `onSelectAsset` is provided the parent owns the selection so its
   *  toolbar / edit panel can bind to the specific asset object. */
  selectedAsset?: AssetItem | null
  onSelectAsset?: (a: AssetItem | null) => void
  /** 纯素材项目没有页面对象，不展示无意义的“页面使用”视图。 */
  showPageUsage?: boolean
}

/** Derive frame-N's path from the frame-0 src by re-padding the trailing
 *  number, e.g. `..._00.webp` + 7 → `..._07.webp`. */
function framePath(src: string, i: number): string {
  const m = src.match(/^(.*?)(\d+)(\.[a-z0-9]+)$/i)
  if (!m) return src
  const [, prefix, num, ext] = m
  return `${prefix}${String(i).padStart(num.length, '0')}${ext}`
}

function assetSources(item: AssetItem): string[] {
  return [item.src, ...(item.variants ?? [])]
}

function versionedAsset(item: AssetItem, versionIndex: number): AssetItem {
  const sources = assetSources(item)
  const safeIndex = Math.max(0, Math.min(versionIndex, sources.length - 1))
  return { ...item, src: sources[safeIndex], version: safeIndex + 1 }
}

function assetKey(item: AssetItem): string {
  return item.id ?? item.src
}

/** An <img> that, when `playing` and the item is a frame sequence, loops
 *  through its frames (~15fps). Otherwise shows the static frame-0 src.
 *  Shared by the grid thumb (hover) and the canvas (always playing). */
function FrameImage({
  item,
  playing,
  className,
}: {
  item: AssetItem
  playing: boolean
  className?: string
}) {
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!playing || !item.frames || (item.kind ?? 'image') !== 'image') {
      el.src = item.src
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % item.frames!
      el.src = framePath(item.src, i)
    }, 1000 / 15)
    return () => {
      clearInterval(id)
      el.src = item.src
    }
  }, [playing, item])
  return <img ref={ref} src={item.src} alt={item.label} loading="lazy" className={className} />
}

/** Which asset kinds the groups actually contain (image/audio/video),
 *  preserving display order. Used by the parent toolbar to build the
 *  kind tabs without re-deriving GROUPS. */
export function garudaKindTabs(groups: AssetGroup[] = GARUDA_ASSET_GROUPS): AssetKind[] {
  const counts = { image: 0, audio: 0, video: 0 } as Record<AssetKind, number>
  groups.forEach((g) => g.items.forEach((it) => { counts[it.kind ?? 'image'] += 1 }))
  return (['image', 'audio', 'video'] as AssetKind[]).filter((k) => counts[k] > 0)
}

/** Groups containing only their image-kind items (empty groups dropped) —
 *  used by the canvas editor to lay images out one row per type. */
export function garudaImageGroups(
  groups: AssetGroup[] = GARUDA_ASSET_GROUPS,
): AssetGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((it) => (it.kind ?? 'image') === 'image') }))
    .filter((g) => g.items.length > 0)
}

/** Aggregate per-kind / frame counts across the provided groups. When
 *  no category is passed (or `null`), totals span every group; passing
 *  a group title narrows the count to just that bucket so the toolbar
 *  reflects the filter the user has selected. */
function computeStats(groups: AssetGroup[], activeCategory: string | null) {
  const slice = activeCategory
    ? groups.filter((g) => g.title === activeCategory)
    : groups
  return slice.reduce(
    (a, g) => {
      g.items.forEach((it) => {
        const k = it.kind ?? 'image'
        a[k] += 1
        if (it.frames) a.frames += it.frames
      })
      return a
    },
    { image: 0, audio: 0, video: 0, frames: 0 } as Record<string, number>,
  )
}

export const KIND_META: Record<AssetKind, { label: string; icon: typeof ImageIcon }> = {
  image: { label: '图像', icon: ImageIcon },
  audio: { label: '音频', icon: Music2 },
  video: { label: '视频', icon: Film },
}

type AssetViewMode = 'grid' | 'list' | 'usage'

const LAYERED_ASSET_VERSIONS_STORAGE_KEY = 'creative-studio.project-layered-assets.v1'

type LayeredAssetVersion = {
  manifest: AssetLayerManifest
  version: number
}

function readLayeredAssetVersions(): Record<string, LayeredAssetVersion> {
  if (typeof window === 'undefined') return {}
  try {
    const value = window.localStorage.getItem(LAYERED_ASSET_VERSIONS_STORAGE_KEY)
    return value ? JSON.parse(value) as Record<string, LayeredAssetVersion> : {}
  } catch {
    return {}
  }
}

const VIEW_MODE_META: Array<{
  value: AssetViewMode
  label: string
  icon: typeof LayoutGrid
}> = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: ListCollapse },
  { value: 'usage', label: '页面使用', icon: FolderTree },
]

const PAGE_USAGE_ORDER = [
  '开始页',
  '战斗页',
  '排行榜页',
  '活动首页',
  '焦点视频页',
  '内容榜单页',
  '活动入口',
  '找喜鹊关卡',
  'Feed 兴趣卡',
  '塔罗落地页',
  '首页',
  '作品页',
  '全局资源',
  '未分配页面',
]

function usagePagesFor(item: AssetItem, sourceGroup: string): string[] {
  const id = item.id ?? ''

  if (id === 'qixi-home-kv-v1') return ['活动首页']
  if (id === 'qixi-level-01-v1') return ['找喜鹊关卡']

  if (id === 'ui-button-rank') return ['开始页', '排行榜页']
  if (
    ['scene-start', 'scene-logo', 'ui-button-start', 'video-menu'].includes(id)
  ) {
    return ['开始页']
  }
  if (
    /^(garuda-|enemy-|item-|scene-|ui-|fx-|hud-|audio-|video-)/.test(id)
  ) {
    return ['战斗页']
  }

  if (/^acg-0[1-6]-/.test(id)) return ['活动首页']
  if (id === 'acg-07-video-cover') return ['焦点视频页']
  if (/^acg-(08|09|10|11)-/.test(id)) return ['内容榜单页']
  if (id === 'acg-12-mascot') return ['活动入口']

  if (/Feed|底纹|天秤座/.test(item.label)) return ['Feed 兴趣卡']
  if (/落地页|圣杯二/.test(item.label)) return ['塔罗落地页']
  if (id.startsWith('uploaded-')) return ['未分配页面']
  if (/asset-\d+$/.test(id)) return ['未分配页面']

  if (/主视觉|Banner/.test(sourceGroup)) return ['首页']
  if (/卡片配图/.test(sourceGroup)) return ['首页', '作品页']
  return ['全局资源']
}

export default function GarudaAssetsView({
  groups = GARUDA_ASSET_GROUPS,
  activeKind: controlledKind,
  onKindChange,
  selectedAsset: controlledSel,
  onSelectAsset,
  showPageUsage = true,
}: GarudaAssetsViewProps = {}) {
  const [internalKind, setInternalKind] = useState<AssetKind>('image')
  const [internalSel, setInternalSel] = useState<AssetItem | null>(null)
  const [canvasOpen, setCanvasOpen] = useState(false)
  const [layerEditorItem, setLayerEditorItem] = useState<AssetItem | null>(null)
  const [viewMode, setViewMode] = useState<AssetViewMode>('grid')
  const [uploadedAssets, setUploadedAssets] = useState<AssetItem[]>([])
  const [versionPicks, setVersionPicks] = useState<Record<string, number>>({})
  const [layeredAssetVersions, setLayeredAssetVersions] = useState(readLayeredAssetVersions)
  const gridUploadInputRef = useRef<HTMLInputElement>(null)
  // Controlled when the parent (toolbar) drives the kind selection.
  const controlled = controlledKind !== undefined
  const activeKind = controlled ? controlledKind : internalKind
  const setActiveKind = (k: AssetKind) => {
    onKindChange?.(k)
    if (!controlled) setInternalKind(k)
  }
  const addUploadedAssets = (files: FileList | null) => {
    if (!files?.length) return
    const batchId = Date.now().toString(36)
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result
        if (typeof src !== 'string') return
        setUploadedAssets((current) => [
          ...current,
          {
            id: `uploaded-${batchId}-${index}`,
            src,
            label: file.name,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
    setActiveKind('image')
  }
  // Selection (the asset opened on the canvas) — controlled when the
  // parent passes onSelectAsset so its toolbar / 编辑 panel can bind to it.
  const selControlled = onSelectAsset !== undefined
  const selected = selControlled ? controlledSel ?? null : internalSel
  const setSelected = (a: AssetItem | null) => {
    onSelectAsset?.(a)
    if (!selControlled) setInternalSel(a)
  }

  const versionIndexFor = (item: AssetItem) => {
    const count = assetSources(item).length
    return Math.max(0, Math.min(versionPicks[assetKey(item)] ?? 0, count - 1))
  }
  const openAsset = (item: AssetItem) => {
    const next = versionedAsset(item, versionIndexFor(item))
    if ((next.kind ?? 'image') === 'image' && !next.modelSrc) {
      setSelected(null)
      setLayerEditorItem(next)
      return
    }
    setSelected(next)
  }
  const selectVersion = (item: AssetItem, versionIndex: number) => {
    const safeIndex = Math.max(0, Math.min(versionIndex, assetSources(item).length - 1))
    setVersionPicks((current) => ({ ...current, [assetKey(item)]: safeIndex }))
    if (selected && assetKey(selected) === assetKey(item)) {
      setSelected(versionedAsset(item, safeIndex))
    }
  }

  const sourceGroups: AssetGroup[] =
    useMemo(
      () =>
        uploadedAssets.length > 0
          ? [
              {
                title: '上传素材',
                desc: '本次会话中上传的本地图像',
                items: uploadedAssets,
              },
              ...groups,
            ]
          : groups,
      [groups, uploadedAssets],
    )

  const [resolvedGroups, setResolvedGroups] = useState(sourceGroups)
  useEffect(() => {
    let disposed = false
    const createdUrls: string[] = []
    const hydrate = async () => {
      const next = await Promise.all(
        sourceGroups.map(async (group) => ({
          ...group,
          items: await Promise.all(
            group.items.map(async (item) => {
              const src = await resolveMarketingKingAssetUrl(item.assetId)
              if (!src) return item
              createdUrls.push(src)
              return { ...item, src }
            }),
          ),
        })),
      )
      if (!disposed) setResolvedGroups(next)
    }
    void hydrate()
    return () => {
      disposed = true
      createdUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [sourceGroups])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LAYERED_ASSET_VERSIONS_STORAGE_KEY,
        JSON.stringify(layeredAssetVersions),
      )
    } catch {
      // Local persistence is best-effort in the prototype; the active session remains editable.
    }
  }, [layeredAssetVersions])

  const displayGroups = useMemo(
    () => resolvedGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        const saved = layeredAssetVersions[assetKey(item)]
        return saved
          ? { ...item, layerManifest: saved.manifest, version: saved.version }
          : item
      }),
    })),
    [layeredAssetVersions, resolvedGroups],
  )

  // Which kinds actually have assets — only those get a tab.
  const kindCounts = displayGroups.reduce(
    (a, g) => {
      g.items.forEach((it) => {
        a[it.kind ?? 'image'] += 1
      })
      return a
    },
    { image: 0, audio: 0, video: 0 } as Record<AssetKind, number>,
  )
  const kindTabs = (['image', 'audio', 'video'] as AssetKind[]).filter(
    (k) => kindCounts[k] > 0,
  )
  const effectiveKind = kindTabs.includes(activeKind) ? activeKind : kindTabs[0]

  // Filter by the selected kind tab, dropping groups that end up empty.
  const visibleGroups = displayGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => (it.kind ?? 'image') === effectiveKind),
    }))
    .filter((g) => g.items.length > 0)
  const visibleAssets = visibleGroups.flatMap((group) => group.items)
  const visibleEntries = visibleGroups.flatMap((group) =>
    group.items.map((item) => ({ item, sourceGroup: group.title })),
  )
  const usageRows = visibleEntries.reduce<
    Array<{ page: string; items: AssetItem[] }>
  >((rows, entry) => {
    usagePagesFor(entry.item, entry.sourceGroup).forEach((page) => {
      const row = rows.find((candidate) => candidate.page === page)
      if (row) row.items.push(entry.item)
      else rows.push({ page, items: [entry.item] })
    })
    return rows
  }, [])
  usageRows.sort((a, b) => {
    const aIndex = PAGE_USAGE_ORDER.indexOf(a.page)
    const bIndex = PAGE_USAGE_ORDER.indexOf(b.page)
    const aRank = aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex
    const bRank = bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex
    return aRank - bRank
  })

  if (canvasOpen) {
    return (
      <ImageCanvasEditor
        groups={garudaImageGroups(displayGroups)}
        onClose={() => setCanvasOpen(false)}
      />
    )
  }

  if (layerEditorItem) {
    const saved = layeredAssetVersions[assetKey(layerEditorItem)]
    const editorItem = saved
      ? { ...layerEditorItem, layerManifest: saved.manifest, version: saved.version }
      : layerEditorItem
    return (
      <LayeredAssetEditor
        key={assetKey(editorItem)}
        item={editorItem}
        initialManifest={resolveLayerManifest(editorItem)}
        onBack={() => {
          setLayerEditorItem(null)
          setSelected(null)
        }}
        onSave={async (manifest) => {
          const version = (saved?.version ?? editorItem.version ?? 1) + 1
          setLayeredAssetVersions((current) => ({
            ...current,
            [assetKey(editorItem)]: { manifest, version },
          }))
          setSelected(null)
          setLayerEditorItem(null)
          toast.success(`已保存为 v${version}`, {
            description: '扁平交付图与图层清单已同步生成。',
          })
        }}
      />
    )
  }

  // 视频 / 音频 / 3D 素材仍需要各自的播放或查看详情。
  // 图片不经过这层，网格点击时已直接进入 LayeredAssetEditor。
  if (selected) {
    if (selected.modelSrc) {
      return (
        <AssetModelDetail
          label={selected.label}
          modelSrc={selected.modelSrc}
          onBack={() => setSelected(null)}
        />
      )
    }
    return (
      <AssetMediaDetail
        key={selected.id ?? selected.src}
        item={selected}
        assets={visibleAssets}
        onSelect={openAsset}
        onSelectVersion={(asset, version) => selectVersion(asset, version)}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <input
        ref={gridUploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          addUploadedAssets(event.target.files)
          event.currentTarget.value = ''
        }}
      />
      <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2">
        <div className="flex min-w-0 items-center gap-1">
          {kindTabs.map((kindValue) => {
            const Icon = KIND_META[kindValue].icon
            const active = kindValue === effectiveKind
            const label = kindTabs.length === 1 ? '所有素材' : KIND_META[kindValue].label
            return (
              <button
                key={kindValue}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setActiveKind(kindValue)
                  setSelected(null)
                }}
                className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12px] transition-colors ${
                  active
                    ? 'bg-[var(--color-ink)]/[0.07] font-medium text-[var(--color-ink)]'
                    : 'text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75'
                }`}
              >
                <Icon className="size-3.5" strokeWidth={1.8} />
                {label}
                <span className="text-[10px] text-[var(--color-ink)]/35">
                  {kindCounts[kindValue]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div
            role="group"
            aria-label="素材显示模式"
            className="flex items-center rounded-lg bg-[var(--fill-subtle)] p-0.5"
          >
            {VIEW_MODE_META.filter(
              (mode) => showPageUsage || mode.value !== 'usage',
            ).map((mode) => {
              const Icon = mode.icon
              const active = viewMode === mode.value
              return (
                <button
                  key={mode.value}
                  type="button"
                  title={mode.label}
                  aria-label={mode.label}
                  aria-pressed={active}
                  onClick={() => setViewMode(mode.value)}
                  className={`flex h-7 items-center gap-1.5 rounded-md px-2 text-[11.5px] transition-colors ${
                    active
                      ? 'bg-[var(--color-surface-0)] text-[var(--color-ink)] shadow-sm'
                      : 'text-[var(--color-ink)]/45 hover:text-[var(--color-ink)]/75'
                  }`}
                >
                  <Icon className="size-3.5" strokeWidth={1.8} />
                  <span>{mode.label}</span>
                </button>
              )
            })}
          </div>
          {effectiveKind === 'image' && showPageUsage && (
            <button
              type="button"
              onClick={() => setCanvasOpen(true)}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-[var(--color-ink)]/8 px-2.5 text-[12px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <LayoutGrid className="size-3.5" strokeWidth={1.8} />
              画布编辑
            </button>
          )}
          <button
            type="button"
            onClick={() => gridUploadInputRef.current?.click()}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-[var(--color-ink)]/8 px-2.5 text-[12px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <Upload className="size-3.5" strokeWidth={1.8} />
            上传
          </button>
        </div>
      </div>

      <div className="thin-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {viewMode === 'grid' && (
          <div className="space-y-7 px-5 py-5">
            {visibleGroups.map((group) => (
              <section key={group.title}>
                <div className="mb-2.5 flex items-baseline gap-2">
                  <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">
                    {group.title}
                  </h3>
                  {group.desc && (
                    <span className="text-[11px] text-[var(--color-ink)]/45">
                      {group.desc}
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-[var(--color-ink)]/35">
                    {group.items.length} 项
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                  {group.items.map((item, index) => (
                    <AssetThumb
                      key={`${group.title}-${item.id ?? item.src}-${index}`}
                      item={item}
                      selectedVersion={versionIndexFor(item)}
                      onOpen={() => openAsset(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="px-5 py-4">
            <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)]">
              {visibleEntries.map(({ item, sourceGroup }, index) => {
                const kindValue = item.kind ?? 'image'
                const promptMeta = resolveAssetPrompt(item)
                return (
                  <button
                    key={`${sourceGroup}-${item.id ?? item.src}-${index}`}
                    type="button"
                    onClick={() => openAsset(item)}
                    className="grid h-14 w-full grid-cols-[40px_minmax(120px,1fr)_120px_84px_120px] items-center gap-3 border-b border-[var(--divider-soft)] px-3 text-left last:border-b-0 hover:bg-[var(--fill-hover)]"
                  >
                    <AssetListThumb item={item} />
                    <span className="truncate text-[12.5px] font-medium text-[var(--color-ink)]">
                      {item.label}
                    </span>
                    <span className="truncate text-[11.5px] text-[var(--color-ink)]/45">
                      {sourceGroup}
                    </span>
                    <span className="text-[11.5px] text-[var(--color-ink)]/45">
                      {item.modelSrc
                        ? '3D 模型'
                        : kindValue === 'image' && (item.layerManifest?.layers.length ?? 1) > 1
                          ? `图像 · ${item.layerManifest?.layers.length} 层`
                          : KIND_META[kindValue].label}
                    </span>
                    <span className="truncate text-[11.5px] text-[var(--color-ink)]/45">
                      {promptMeta.model}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {viewMode === 'usage' && (
          <div className="space-y-6 px-5 py-5">
            {usageRows.map((row) => (
              <section key={row.page}>
                <div className="mb-2.5 flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">
                    {row.page}
                  </h3>
                  <span className="text-[11px] text-[var(--color-ink)]/35">
                    {row.items.length} 项素材
                  </span>
                </div>
                <div className="thin-scroll grid grid-flow-col auto-cols-[120px] justify-start gap-3 overflow-x-auto pb-1">
                  {row.items.map((item, index) => (
                    <AssetThumb
                      key={`${row.page}-${item.id ?? item.src}-${index}`}
                      item={item}
                      selectedVersion={versionIndexFor(item)}
                      onOpen={() => openAsset(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AssetModelDetail({
  label,
  modelSrc,
  onBack,
}: {
  label: string
  modelSrc: string
  onBack: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-black/[0.06] px-3 py-1.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-semibold leading-4 text-[var(--color-ink)]/80 transition-colors duration-150 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft className="size-4" strokeWidth={1.8} />
          返回
        </button>
        <Box className="size-3.5 text-[var(--color-ink)]/45" strokeWidth={1.8} />
        <span className="truncate text-[12px] text-[var(--color-ink)]/55">{label}</span>
        <span className="shrink-0 rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ink)]/55">
          3D 模型
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <Suspense
          fallback={(
            <div className="flex h-full items-center justify-center bg-[var(--color-surface-1)] text-[12px] text-[var(--color-ink)]/50" role="status">
              3D 编辑器加载中…
            </div>
          )}
        >
          <XiahuaMascot3DStudio modelSrc={modelSrc} />
        </Suspense>
      </div>
    </div>
  )
}

/** 视频 / 音频媒体详情：104px 素材轨 + 播放预览。 */
function AssetMediaDetail({
  item,
  assets,
  onSelect,
  onSelectVersion,
  onBack,
}: {
  item: AssetItem
  assets: AssetItem[]
  onSelect: (item: AssetItem) => void
  onSelectVersion: (item: AssetItem, version: number) => void
  onBack: () => void
}) {
  const kind = item.kind ?? 'image'
  const sourceItem = assets.find((asset) => assetKey(asset) === assetKey(item)) ?? item
  const sources = assetSources(sourceItem)
  const currentVersion = Math.max(0, Math.min((item.version ?? 1) - 1, sources.length - 1))
  const hasVersions = kind === 'image' && sources.length > 1

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-black/[0.06] px-3 py-1.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-semibold leading-4 text-[var(--color-ink)]/80 transition-colors duration-150 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft className="size-4" strokeWidth={1.8} />
          返回
        </button>
        <span className="truncate text-[12px] text-[var(--color-ink)]/55">
          {item.label}
        </span>
        {hasVersions && (
          <span className="shrink-0 rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-ink)]/55">
            v{currentVersion + 1}/{sources.length}
          </span>
        )}
        {item.frames && (
          <span className="rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--color-ink)]/55">
            {item.frames} 帧
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          aria-label="素材列表"
          className="thin-scroll w-[104px] shrink-0 overflow-y-auto p-3"
        >
          <div className="flex flex-col gap-2">
            {assets.map((asset) => {
              const assetKind = asset.kind ?? 'image'
              const selected = (asset.id ?? asset.src) === (item.id ?? item.src)
              return (
                <button
                  key={asset.id ?? asset.src}
                  type="button"
                  aria-label={`选择素材：${asset.label}`}
                  aria-pressed={selected}
                  title={asset.label}
                  onClick={() => onSelect(asset)}
                  className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-transparent bg-[#ebebeb] transition-colors duration-150 hover:border-black/20 aria-pressed:border-2 aria-pressed:border-[#2e90fa]"
                >
                  {assetKind === 'audio' ? (
                    <Music2 className="size-5 text-[var(--color-ink)]/45" strokeWidth={1.6} />
                  ) : assetKind === 'video' ? (
                    asset.src ? (
                      <video
                        src={asset.src}
                        poster={asset.poster}
                        muted
                        playsInline
                        preload="metadata"
                        className="size-full object-cover"
                      />
                    ) : asset.poster ? (
                      <img src={asset.poster} alt="" className="size-full object-cover" />
                    ) : (
                      <Film className="size-5 text-[var(--color-ink)]/45" strokeWidth={1.6} />
                    )
                  ) : (
                    <FrameImage
                      item={asset}
                      playing={false}
                      className="size-full object-contain"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        <div className="thin-scroll flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
          <section
            aria-label={`${item.label} 预览`}
            className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-[rgba(83,96,143,0.07)] p-5"
          >
            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-3">
              <div className="group relative flex min-h-0 min-w-0 flex-1 items-center justify-center">
                {kind === 'video' ? (
                  item.src ? (
                    <video
                      src={item.src}
                      poster={item.poster}
                      controls
                      autoPlay
                      loop
                      className="max-h-full max-w-full rounded-lg"
                    />
                  ) : (
                    <div className="flex max-w-[360px] flex-col items-center gap-2 rounded-xl bg-white/80 px-8 py-8 text-center text-[var(--color-ink)]/55 shadow-sm">
                      {item.poster && <img src={item.poster} alt="" className="mb-1 max-h-52 max-w-full rounded-lg object-contain" />}
                      <Film className="size-7" strokeWidth={1.5} />
                      <strong className="text-[13px] text-[var(--color-ink)]/75">原始项目视频缓存未导出</strong>
                      <span className="text-[11px] leading-4">当前先展示真实首帧海报；如果浏览器缓存中有视频，会自动挂载播放。</span>
                    </div>
                  )
                ) : kind === 'audio' ? (
                  <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-7 shadow-sm">
                    <Music2 className="size-10 text-[var(--color-ink)]/65" strokeWidth={1.4} />
                    <span className="text-[13px] text-[var(--color-ink)]/85">
                      {item.label}
                    </span>
                    <audio src={item.src} controls autoPlay />
                  </div>
                ) : (
                  <FrameImage
                    item={item}
                    playing
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>

              {hasVersions && (
                <div
                  aria-label={`${item.label} 的版本`}
                  className="thin-scroll flex max-h-full w-[64px] shrink-0 flex-col gap-1.5 overflow-y-auto"
                >
                  <span className="px-1 text-[10px] font-medium text-[var(--color-ink)]/45">版本</span>
                  {sources.map((src, version) => {
                    const active = version === currentVersion
                    return (
                      <button
                        key={src}
                        type="button"
                        aria-label={`选择 ${item.label} 第 ${version + 1} 版`}
                        aria-pressed={active}
                        title={`第 ${version + 1} 版${active ? '（当前选中）' : ''}`}
                        onClick={() => onSelectVersion(sourceItem, version)}
                        className={`relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-colors ${
                          active
                            ? 'border-[#357ef8] bg-[#eaf3ff] ring-1 ring-[#357ef8]/20'
                            : 'border-[var(--divider-soft)] bg-[var(--color-surface-0)] hover:border-[#357ef8]/50 hover:bg-[#f5f8ff]'
                        }`}
                      >
                        <img
                          src={src}
                          alt={`${item.label} 第 ${version + 1} 版缩略图`}
                          draggable={false}
                          className="max-h-full max-w-full object-contain"
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1 text-[9px] font-medium leading-3 text-white">
                          v{version + 1}
                        </span>
                        {active && (
                          <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-[#357ef8] text-white">
                            <Check className="size-2.5" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

/** Stats line — exported so the parent preview toolbar can surface
 *  the same image / audio / video / frame counts without re-importing
 *  GROUPS. When `activeCategory` is set (matches a group title), the
 *  counts narrow to that bucket so the toolbar tracks the filter
 *  applied in the side panel. */
export function AssetStatsLine({
  activeCategory = null,
  groups = GARUDA_ASSET_GROUPS,
}: {
  activeCategory?: string | null
  groups?: AssetGroup[]
} = {}) {
  const stats = computeStats(groups, activeCategory)
  return (
    <span className="flex items-center gap-3 text-[11px] text-[var(--color-ink)]/50">
      <Stat icon={ImageIcon} value={stats.image} label="图像" />
      <Stat icon={Music2} value={stats.audio} label="音频" />
      <Stat icon={Film} value={stats.video} label="视频" />
      {stats.frames > 0 && (
        <span>
          含 <span className="font-mono">{stats.frames}</span> 帧动画
        </span>
      )}
    </span>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof ImageIcon
  value: number
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={11} strokeWidth={1.8} />
      <span className="font-mono text-[var(--color-ink)]/70">{value}</span>
      <span>{label}</span>
    </span>
  )
}

function AssetListThumb({ item }: { item: AssetItem }) {
  const kind = item.kind ?? 'image'
  return (
    <span className="flex size-9 items-center justify-center overflow-hidden rounded-md bg-[var(--fill-subtle)]">
      {kind === 'audio' ? (
        <Music2 className="size-4 text-[var(--color-ink)]/45" strokeWidth={1.7} />
      ) : kind === 'video' ? (
        item.src ? (
          <video
            src={item.src}
            poster={item.poster}
            muted
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        ) : item.poster ? (
          <img src={item.poster} alt="" className="size-full object-cover" />
        ) : (
          <Film className="size-4 text-[var(--color-ink)]/45" strokeWidth={1.7} />
        )
      ) : (
        <FrameImage
          item={item}
          playing={false}
          className="size-full object-contain"
        />
      )}
    </span>
  )
}

function AssetThumb({
  item,
  selectedVersion = 0,
  onOpen,
}: {
  item: AssetItem
  selectedVersion?: number
  onOpen: () => void
}) {
  const kind = item.kind ?? 'image'
  const [hover, setHover] = useState(false)
  const sources = assetSources(item)
  const pick = Math.max(0, Math.min(selectedVersion, sources.length - 1))
  const displayItem = versionedAsset(item, pick)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group flex min-w-0 flex-col gap-1.5 overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-1.5 text-left transition-colors hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-hover)]"
    >
      <div className="flex min-w-0 items-stretch gap-1">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`打开素材：${item.label}，当前第 ${pick + 1} 版`}
          className="relative flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded bg-[var(--color-ink)]/[0.06]"
        >
          {kind === 'audio' ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--color-ink)]/45">
              <Music2 size={18} strokeWidth={1.6} />
              <span className="text-[10px] uppercase">audio</span>
            </div>
          ) : kind === 'video' ? (
            displayItem.src ? (
              <video
                src={displayItem.src}
                poster={displayItem.poster}
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => {
                  e.currentTarget.pause()
                  e.currentTarget.currentTime = 0
                }}
              />
            ) : displayItem.poster ? (
              <img src={displayItem.poster} alt="" className="h-full w-full object-cover" />
            ) : (
              <Film className="size-5 text-[var(--color-ink)]/45" strokeWidth={1.6} />
            )
          ) : (
            // Frame sequences loop-play on hover; static images just sit.
            <FrameImage
              item={displayItem}
              playing={hover}
              className="h-full w-full object-contain transition-transform duration-150 group-hover:scale-[1.04]"
            />
          )}
          {item.frames && (
            <span className="absolute right-1 top-1 rounded-md bg-black/65 px-1.5 py-0.5 font-mono text-[9.5px] text-white/80">
              {item.frames}f
            </span>
          )}
          {kind === 'image' && (item.layerManifest?.layers.length ?? 1) > 1 && (
            <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-md bg-[#175CD3]/90 px-1.5 py-0.5 text-[9.5px] font-medium text-white">
              <Layers className="size-2.5" strokeWidth={2} /> {item.layerManifest?.layers.length} 层
            </span>
          )}
          {item.modelSrc && (
            <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[9.5px] font-medium text-white/90">
              <Box className="size-2.5" strokeWidth={1.8} /> 3D
            </span>
          )}
        </button>
      </div>
      <div className="flex min-w-0 items-center gap-1 px-1">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 truncate text-left text-[11px] text-[var(--color-ink)]/70"
        >
          {item.label}
        </button>
      </div>
    </div>
  )
}
