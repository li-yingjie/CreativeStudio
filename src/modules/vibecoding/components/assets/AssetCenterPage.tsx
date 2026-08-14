import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ChevronRight,
  Gift,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Monitor,
  Palette,
  Plus,
  Search,
  Sparkles,
  Type,
} from '@/shared/icons'
import {
  ASSET_CATALOG,
  ASSET_CENTER_CATEGORIES,
  ASSET_CLASS_LABEL,
  type AssetCatalogItem,
  type AssetCenterCategory,
  type AssetClass,
} from '../../assets/assetCatalog'
import AssetDetailPage from './AssetDetailPage'
import AssetFormPage, { type AssetFormIntent } from './AssetFormPage'
import { AssetImageDialog, AssetMediaSurface } from './AssetMedia'
import { assetMediaReferences } from './assetMediaUtils'

const CLASS_ICON = {
  'activity-template': LayoutTemplate,
  'page-template': LayoutTemplate,
  'h5-component': LayoutTemplate,
  'native-component': LayoutTemplate,
  'lynx-component': LayoutTemplate,
  'brand-kit': Layers,
  'character-kit': Sparkles,
  'banner-template': ImageIcon,
  'live-room-kit': Monitor,
  'live-component': LayoutTemplate,
  'style-profile': Palette,
  'layer-template': Layers,
  'gameplay-package': Gift,
  'font-family': Type,
} as const

const REGISTRY_LABEL = {
  asset: '资产注册表',
  capability: '能力注册表',
  knowledge: '知识索引',
  rule: '规则注册表',
} as const

const ASSET_DRAFT_STORAGE_KEY = 'creative-studio.asset-drafts.v1'

function migrateLegacyCategory(item: AssetCatalogItem): AssetCatalogItem {
  const legacyCategory = item.category as string
  const legacyClass = item.assetClass as string
  if (legacyCategory === 'template') return { ...item, category: 'activity-template' }
  if (legacyCategory === 'style') {
    return { ...item, category: item.assetClass === 'style-profile' ? 'inspiration' : 'material-template' }
  }
  if (legacyCategory === 'page-template' && legacyClass === 'page-canvas-template') return { ...item, assetClass: 'page-template' }
  if (legacyCategory === 'page-template' && item.assetClass !== 'page-template') return { ...item, category: 'material-template' }
  return item
}

function readStoredDrafts(): AssetCatalogItem[] {
  try {
    const value = window.localStorage.getItem(ASSET_DRAFT_STORAGE_KEY)
    if (!value) return []
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is AssetCatalogItem => Boolean(item && typeof item === 'object' && 'id' in item && 'name' in item && 'status' in item && item.status === '草稿'))
      .map(migrateLegacyCategory)
      .filter((item) => ASSET_CENTER_CATEGORIES.some((category) => category.id === item.category))
  } catch {
    return []
  }
}

function AssetPreview({
  item,
  compact = false,
  onPreview,
}: {
  item: AssetCatalogItem
  compact?: boolean
  onPreview?: (reference: NonNullable<AssetCatalogItem['visualReferences']>[number]) => void
}) {
  const pageTemplate = item.assetClass === 'page-template'
  const fluidMaterial = compact && item.category === 'material-template'
  const height = pageTemplate ? 'h-full' : fluidMaterial ? 'h-auto' : compact ? 'h-[84px]' : 'h-[132px]'
  const primaryReference = assetMediaReferences(item)[0]

  if (['h5-component', 'native-component', 'lynx-component'].includes(item.assetClass) && primaryReference) {
    const surface = item.metrics.find((metric) => metric.label === '运行载体')?.value
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[#E9EBEF] ${height}`}>
        <img src={primaryReference.src} alt={primaryReference.label} className="size-full object-cover object-top" />
        {surface ? <span className="absolute left-3 top-3 rounded-full bg-[#161823]/72 px-2.5 py-1 text-[9px] font-medium text-white backdrop-blur">{surface}</span> : null}
      </div>
    )
  }

  if (item.assetClass === 'page-template' && primaryReference) {
    const surface = item.metrics.find((metric) => metric.label === '运行载体')?.value ?? 'H5'
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[#E9EBEF] ${height}`}>
        <img src={primaryReference.src} alt={primaryReference.label} className="size-full object-cover object-top" />
        <span className="absolute left-3 top-3 rounded-full bg-[#161823]/72 px-2.5 py-1 text-[9px] font-medium text-white backdrop-blur">{surface}</span>
      </div>
    )
  }

  if (item.resourcePositionProfile) {
    const topicBackground = item.resourcePositionProfile.canvases.find((canvas) => canvas.id === 'topic-background')
    const topicBanner = item.resourcePositionProfile.canvases.find((canvas) => canvas.id === 'topic-banner')
    const activityCard = item.resourcePositionProfile.canvases.find((canvas) => canvas.id === 'creator-activity-card')
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[#F5F7FA] ${compact ? 'h-full' : height}`}>
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#1C1F23]">常见资源位</span>
          <span className="text-xs text-[#71717A]">5 类尺寸</span>
        </div>
        <div className="absolute inset-x-4 bottom-4 top-11 grid grid-cols-[minmax(0,1fr)_72px] items-end gap-3">
          <div className="min-w-0">
            <div className="relative aspect-[375/210] overflow-hidden rounded-lg border border-[#D4D4D8] bg-[linear-gradient(145deg,#3A547F_0%,#8B5E86_48%,#EE9B74_100%)] shadow-[0_1px_3px_rgba(0,0,0,.08)]">
              <div className="absolute inset-x-0 top-0 h-[9.52%] bg-[#FE2C55]/65" />
              <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-b from-transparent to-[#FE2C55]/38" />
              <span className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 text-[11px] font-medium text-white">{topicBackground?.logicalSize.width} × {topicBackground?.logicalSize.height}</span>
            </div>
            <div className="mt-2 flex h-7 items-center justify-between rounded-md border border-[#D4D4D8] bg-[linear-gradient(100deg,#F9E5D0,#6BD13C)] px-2.5 text-[11px] font-medium text-[#1C1F23]">
              <span>话题页 Banner</span><span>{topicBanner?.logicalSize.width} × {topicBanner?.logicalSize.height}</span>
            </div>
          </div>
          <div className="relative aspect-[183/244] overflow-hidden rounded-lg border border-[#D4D4D8] bg-[linear-gradient(150deg,#2F2A5C,#D85D66)] shadow-[0_1px_3px_rgba(0,0,0,.08)]">
            <div className="absolute inset-x-2 bottom-2 rounded-md bg-white/92 px-1.5 py-1.5 text-center text-[11px] font-medium text-[#1C1F23]">活动卡片</div>
            <span className="absolute left-2 top-2 text-[11px] font-medium text-white">{activityCard?.logicalSize.width} × {activityCard?.logicalSize.height}</span>
          </div>
        </div>
      </div>
    )
  }

  if (item.brandKitProfile) {
    const { presentation } = item.brandKitProfile
    const palette = item.brandKitProfile.colors
    return (
      <div className={`group/brand relative overflow-hidden rounded-xl bg-[#F4F4F5] ${compact ? 'h-full' : height}`}>
        <img src={presentation.cardImage} alt="" className="size-full object-cover object-center transition duration-500 group-hover/brand:scale-[1.01]" />
        <div className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs font-medium text-[#1C1F23] shadow-[0_1px_4px_rgba(0,0,0,.08)] backdrop-blur-sm">Brand Kit</div>
        <div className="absolute bottom-3 right-3 flex rounded-full border border-white/80 bg-white/90 p-1 shadow-[0_1px_4px_rgba(0,0,0,.08)] backdrop-blur-sm">
          {palette.filter((token) => token.value !== '#FFFFFF').slice(0, 5).map((token) => <span key={token.value} className="size-4 rounded-full border border-black/10" style={{ backgroundColor: token.value }} title={`${token.name} ${token.value}`} />)}
        </div>
      </div>
    )
  }

  if (item.ipKitProfile) {
    const { presentation } = item.ipKitProfile
    return (
      <div className={`group/ip relative overflow-hidden rounded-xl bg-[#F5F7FA] ${compact ? 'h-full' : height}`}>
        <img src={presentation.heroImage} alt="" className="absolute inset-x-[12%] bottom-0 h-[calc(100%_-_12px)] w-[76%] object-contain object-bottom drop-shadow-[0_12px_16px_rgba(167,40,40,0.13)] transition duration-500 group-hover/ip:scale-[1.01]" />
        <span className="absolute left-3 top-3 rounded-full border border-[#E4E4E7] bg-white/92 px-2.5 py-1 text-xs font-medium text-[#71717A] shadow-[0_1px_4px_rgba(0,0,0,.06)] backdrop-blur-sm">IP 资产</span>
        <div className="absolute bottom-3 right-3 flex rounded-full border border-white/80 bg-white/90 p-1 shadow-[0_1px_4px_rgba(0,0,0,.08)] backdrop-blur-sm">
          {item.ipKitProfile.colors.slice(0, 5).map((token) => <span key={token.value} className="size-4 rounded-full border border-black/10" style={{ backgroundColor: token.value }} title={`${token.name} ${token.value}`} />)}
        </div>
      </div>
    )
  }

  if (item.gameplayProfile) {
    const profile = item.gameplayProfile
    const stages = profile.preset.stages
    return (
      <div className={`group/gameplay relative overflow-hidden rounded-xl bg-[#FFF4F6] text-[#1C1F23] ${compact ? 'h-full' : height}`}>
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#C93553] shadow-[0_1px_4px_rgba(0,0,0,.06)]">限时找物</span>
          <span className="text-xs text-[#71717A]">{stages.length} 关 · {profile.preset.totalTargets} 个目标</span>
        </div>
        <div className="absolute inset-x-4 bottom-4 top-12 flex flex-col justify-end">
          <div className="flex items-end gap-2">
            {stages.map((count, index) => <span key={index} className={`flex min-w-0 flex-1 items-end justify-center rounded-t-md pb-1.5 text-xs font-semibold ${index === 2 || index === 6 ? 'bg-[#F6C466] text-[#7C4A00]' : 'bg-[#FFDCE4] text-[#A52B47]'}`} style={{ height: 28 + index * 5 }}>{count}</span>)}
          </div>
          <div className="mt-3 flex items-end justify-between gap-4 border-t border-[#F1DCE1] pt-3">
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{profile.presentation.headline}</p><p className="mt-1 truncate text-xs text-[#71717A]">90 秒 · 任务回流 · 里程碑奖励</p></div>
            <span className="shrink-0 text-xs text-[#71717A]">v{profile.capability.version}</span>
          </div>
        </div>
      </div>
    )
  }

  if (primaryReference) {
    if (compact && item.category === 'material-template') {
      return (
        <div className="group/media relative overflow-hidden rounded-xl bg-[#E9EBEF]">
          <button type="button" onClick={() => onPreview?.(primaryReference)} aria-label={`放大预览：${primaryReference.label}`} className="relative block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#357EF8]">
            <img src={primaryReference.src} alt="" className="block h-auto w-full transition duration-500 group-hover/media:scale-[1.008]" />
          </button>
        </div>
      )
    }
    return (
      <AssetMediaSurface
        reference={primaryReference}
        onPreview={onPreview}
        className={`${height} rounded-xl border border-black/[0.06]`}
        imageClassName="drop-shadow-[0_5px_12px_rgba(22,24,35,0.08)]"
      />
    )
  }

  if (item.assetClass === 'activity-template') {
    const nodes = [
      { label: 'Lynx', value: '主会场' },
      { label: 'H5', value: '分会场 ×2' },
      { label: '资源位', value: '多规格' },
      { label: '战报', value: '结算长图' },
    ]
    return (
      <div className={`relative overflow-hidden rounded-xl border border-[#E7E2DC] bg-[#FBF8F4] ${height} ${compact ? 'px-3 py-2.5' : 'px-4 py-3.5'}`}>
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-[#EA5B34]/10 px-2 py-1 text-xs font-semibold text-[#B64627]">活动项目模板</span>
          <span className="text-[8px] text-[#161823]/32">4 个阶段</span>
        </div>
        {!compact ? <p className="mt-2 truncate text-[8px] font-medium text-[#161823]/52">主流程：双会场分流 · 榜单参与 · 阶段回流</p> : null}
        <div className={`${compact ? 'mt-2 gap-1' : 'mt-2 gap-1.5'} grid grid-cols-4`}>
          {nodes.map((node, index) => (
            <div key={node.label} className="relative min-w-0 rounded-lg border border-[#E7E2DC] bg-white px-2 py-2 text-center shadow-[0_2px_6px_rgba(88,61,37,0.04)]">
              <p className="truncate text-[7px] font-medium text-[#A56A51]">{node.label}</p>
              <p className="mt-0.5 truncate text-[8px] font-semibold text-[#161823]/68">{node.value}</p>
              {index < nodes.length - 1 ? <ChevronRight className="absolute -right-[5px] top-1/2 z-10 size-2.5 -translate-y-1/2 rounded-full bg-[#FBF8F4] text-[#161823]/22" /> : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (item.assetClass === 'font-family') {
    return (
      <div className={`flex items-end overflow-hidden rounded-xl bg-[#F3F4F6] ${height} ${compact ? 'p-3' : 'p-4'}`}>
        <div className="min-w-0">
          <p className={`${compact ? 'text-[18px]' : 'text-[25px]'} truncate font-medium tracking-[-0.04em] text-[#161823]`}>
            {item.preview}
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#161823]/32">{item.name}</p>
        </div>
      </div>
    )
  }

  if (item.assetClass === 'character-kit') {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#FFF0EA_0%,#FFE5E7_54%,#F7F4F4_100%)] ${height}`}>
        <div className={`${compact ? 'left-3 top-3' : 'left-4 top-4'} absolute z-10`}>
          <span className="rounded-md bg-white/80 px-2 py-1 text-[9px] font-medium text-[#B52D33] shadow-sm backdrop-blur-sm">官方角色资产</span>
          <p className={`${compact ? 'mt-2 text-[10px]' : 'mt-3 text-[12px]'} font-medium text-[#6D262A]`}>{item.metrics.map((metric) => `${metric.value} ${metric.label}`).join(' · ')}</p>
        </div>
        {item.thumbnail ? <img src={item.thumbnail} alt={`${item.name}预览`} className="absolute bottom-[-6%] right-[6%] h-[105%] object-contain drop-shadow-[0_10px_14px_rgba(126,37,37,0.16)]" /> : null}
      </div>
    )
  }

  if (item.assetClass === 'banner-template') {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[#2D333B] ${height}`}>
        {item.thumbnail ? <img src={item.thumbnail} alt="Banner 模板预览" className="size-full object-cover" /> : <div className="size-full bg-[linear-gradient(120deg,#F6D56B,#63C7F2)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
        <div className={`${compact ? 'bottom-2.5 left-3' : 'bottom-3.5 left-4'} absolute flex items-center gap-2 text-white`}>
          <span className="rounded bg-black/35 px-1.5 py-0.5 text-[9px] backdrop-blur-sm">{item.metrics[0]?.value}</span>
          <span className="text-[9px] text-white/75">{item.metrics[1]?.label} {item.metrics[1]?.value}</span>
        </div>
      </div>
    )
  }

  if (item.assetClass === 'live-room-kit') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-[#21252A] ${height}`}>
        <div className="absolute inset-0 opacity-30" style={item.thumbnail ? { backgroundImage: `url(${item.thumbnail})`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined} />
        <div className="relative h-[88%] aspect-[9/16] overflow-hidden rounded-[5px] border border-white/25 bg-[#C58AA6] shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
          {item.thumbnail ? <img src={item.thumbnail} alt="直播间画布预览" className="size-full object-cover" /> : null}
          <div className="absolute inset-y-0 left-[13%] right-[13%] border-x border-dashed border-white/50" />
          <div className="absolute left-[18%] right-[18%] top-[20%] h-[12%] rounded-sm bg-white/80" />
          <div className="absolute left-[14%] top-[43%] h-[21%] w-[22%] rounded-sm bg-[#C14E79]/90" />
          <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-[#A9456B]/85 to-transparent" />
        </div>
        <span className="absolute bottom-2 right-2.5 rounded bg-black/45 px-1.5 py-0.5 text-[9px] text-white/80">1536×2752 · 6+ 图层</span>
      </div>
    )
  }

  if (item.assetClass === 'live-component') {
    return (
      <div className={`relative flex items-center justify-center gap-4 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#F8EAF0,#F4F5F7)] ${height}`}>
        <div className={`${compact ? 'h-[68px] w-[40px]' : 'h-[106px] w-[60px]'} flex flex-col rounded-lg bg-[#B64C75] p-1.5 text-white shadow-[0_8px_18px_rgba(143,56,93,0.2)]`}>
          <span className="rounded bg-white/20 py-0.5 text-center text-[7px]">直播福利</span>
          <span className="mt-1 text-[6px]">50元代金券</span>
          <span className="mt-0.5 rounded-full bg-white px-1 py-0.5 text-center text-[8px] font-bold text-[#B64C75]">¥29</span>
          <span className="mt-1 border-t border-dashed border-white/40 pt-1 text-[6px]">100元代金券</span>
          <span className="mt-0.5 rounded-full bg-white px-1 py-0.5 text-center text-[8px] font-bold text-[#B64C75]">¥59</span>
        </div>
        <div className={`${compact ? 'size-[48px]' : 'size-[70px]'} flex flex-col items-center justify-center rounded-b-[14px] rounded-t-[6px] bg-[#D96675] text-white shadow-[0_8px_18px_rgba(143,56,93,0.18)]`}>
          <Gift className="size-4" />
          <span className="mt-1 text-[8px] font-semibold">福袋</span>
        </div>
      </div>
    )
  }

  if (item.assetClass === 'brand-kit') {
    const isAcg = item.id === 'brand.douyin-acg-new-year-2026'
    return (
      <div className={`flex items-center justify-between rounded-xl bg-[#F4F4F6] ${height} ${compact ? 'px-3.5' : 'px-5'}`}>
        <div className="flex items-center gap-2.5">
          <span className={`${compact ? 'size-9' : 'size-12'} rounded-full p-2 text-white`} style={{ backgroundColor: isAcg ? '#EA5B34' : '#161823' }}>
            <span className="flex size-full items-center justify-center rounded-full border border-white/60 text-[10px] font-bold">{isAcg ? 'ACG' : '音'}</span>
          </span>
          <span className={`${compact ? 'max-w-[124px] text-[11px]' : 'max-w-[180px] text-[14px]'} truncate font-semibold text-[#161823]`}>{isAcg ? '抖音 ACG 新春会' : '抖音生活服务'}</span>
        </div>
        <div className="flex gap-1.5">
          {['#161823', item.accent, '#25F4EE', '#FE2C55'].map((color, index) => (
            <span key={`${color}-${index}`} className={`${compact ? 'size-4' : 'size-6'} rounded-full border border-black/5`} style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
    )
  }

  if (item.assetClass === 'style-profile') {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[#F4F4F6] ${height}`}>
        {item.thumbnail ? <img src={item.thumbnail} alt="风格样例预览" className="size-full object-cover" /> : <div className="size-full" style={{ backgroundColor: item.accent }} />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/5 to-transparent" />
        <div className={`${compact ? 'left-3 top-3' : 'left-4 top-4'} absolute text-white`}>
          <span className="rounded bg-white/18 px-1.5 py-0.5 text-xs font-semibold backdrop-blur-sm">视觉风格</span>
          <p className={`${compact ? 'mt-2 text-[10px]' : 'mt-3 text-[12px]'} max-w-[150px] font-medium leading-4`}>{item.tags.slice(0, 3).join(' · ')}</p>
        </div>
      </div>
    )
  }

  if (item.assetClass === 'layer-template') {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-[#F2F1F8] ${height} ${compact ? 'p-3' : 'p-4'}`}>
        <div className="grid h-full grid-cols-[1fr_1.35fr_1fr] gap-1.5">
          {['整图底景', '真文字 / 主体', 'Logo / 组件'].map((label, index) => (
            <div key={label} className={`relative overflow-hidden rounded-lg border ${index === 1 ? 'border-[#6C5CE7]/35 bg-white' : 'border-black/[0.06] bg-white/70'}`}>
              {item.thumbnail ? <img src={item.thumbnail} alt="" className="absolute inset-0 size-full object-cover opacity-20" /> : null}
              <div className="absolute inset-x-2 bottom-2 rounded bg-white/90 px-1.5 py-1 text-center text-[7px] font-medium text-[#161823]/55 shadow-sm">{label}</div>
            </div>
          ))}
        </div>
        <span className="absolute left-4 top-4 rounded-md bg-[#6C5CE7] px-2 py-1 text-xs font-semibold text-white shadow-sm">图层模板</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center rounded-xl bg-[#F4F4F6] ${height} ${compact ? 'gap-2 p-2.5' : 'gap-3 p-4'}`}>
      {['输入资产', '规则契约', '运行实例'].map((label, index) => (
        <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg border border-black/[0.06] bg-white text-center text-[9px] font-medium text-[#161823]/66">
            {label}
          </span>
          {index < 2 ? <ChevronRight className="size-3 shrink-0 text-[#161823]/28" /> : null}
        </div>
      ))}
    </div>
  )
}

function AssetCard({
  item,
  onOpen,
  onPreview,
}: {
  item: AssetCatalogItem
  onOpen: () => void
  onPreview: (reference: NonNullable<AssetCatalogItem['visualReferences']>[number]) => void
}) {
  const Icon = CLASS_ICON[item.assetClass]
  const primaryReference = assetMediaReferences(item)[0]
  const pageTemplate = item.assetClass === 'page-template'
  const structuredBrandKit = Boolean(item.brandKitProfile || item.resourcePositionProfile)
  const structuredIpKit = Boolean(item.ipKitProfile)
  const structuredGameplayKit = Boolean(item.gameplayProfile)
  const materialTemplate = item.category === 'material-template'
  return (
    <article className={`group min-w-0 break-inside-avoid overflow-hidden rounded-2xl border border-[#F2F2F7] bg-white transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(124,246,254,0.1),0_18px_38px_-18px_rgba(124,246,254,0.28),0_12px_28px_-18px_rgba(246,111,17,0.14)] focus-within:ring-2 focus-within:ring-[#A1A1AA]/20 ${materialTemplate ? 'mb-4' : ''}`}>
      <div className={`relative overflow-hidden border-b border-[#F2F2F7] bg-[#F4F4F5] [&>*]:!rounded-none [&>*]:!border-0 ${pageTemplate ? 'aspect-[9/16]' : materialTemplate ? '' : 'h-[216px] [&>*]:!h-full'}`}>
        {pageTemplate || structuredBrandKit || structuredIpKit || structuredGameplayKit ? (
          <button type="button" onClick={onOpen} aria-label={pageTemplate ? `打开真实页面：${item.name}` : structuredIpKit ? `打开 IP Kit：${item.name}` : structuredGameplayKit ? `打开玩法资产：${item.name}` : `打开 Brand Kit：${item.name}`} className="size-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#357EF8]"><AssetPreview item={item} compact /></button>
        ) : primaryReference ? (
          <AssetPreview item={item} compact onPreview={onPreview} />
        ) : (
          <button type="button" onClick={onOpen} className="size-full p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#357EF8]" aria-label={`从预览打开${item.name}详情`}>
            <AssetPreview item={item} compact />
          </button>
        )}
      </div>
      <button type="button" onClick={onOpen} className="block w-full px-4 pb-4 pt-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#A1A1AA]/20" aria-label={`查看${item.name}详情`}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-5 shrink-0 items-center gap-1 rounded-md bg-[#F4F4F5] px-1.5 text-xs font-medium text-[#71717A]"><Icon className="size-3" strokeWidth={1.8} />{ASSET_CLASS_LABEL[item.assetClass]}</span>
          <span className={`size-1.5 shrink-0 rounded-full ${item.status === '已发布' ? 'bg-emerald-500' : item.status === '草稿' ? 'bg-blue-500' : 'bg-violet-500'}`} />
          <span className="truncate text-xs text-[#71717A]">{item.status} · v{item.version}</span>
        </div>
        <div className="mt-3 flex min-w-0 items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold leading-[22px] text-[#222727]">{item.name}</h3>
            <p className={`${materialTemplate ? 'line-clamp-1' : 'line-clamp-2 min-h-8'} mt-1.5 text-xs leading-4 text-[rgba(34,39,39,0.6)]`}>{item.summary}</p>
          </div>
          <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#A1A1AA] transition-transform group-hover:translate-x-0.5 group-hover:text-[#71717A]" />
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-[#F4F4F5] pt-3 text-xs leading-4 text-[#A1A1AA]">
          <span>{item.visualReferences?.length ? `${item.visualReferences.length} 个视觉文件` : primaryReference ? '1 个视觉文件' : `${item.parameterGroups.length} 组规则`}</span>
          <span className="size-0.5 rounded-full bg-[#D4D4D8]" />
          <span className="truncate">{item.updatedAt} 更新</span>
        </div>
      </button>
    </article>
  )
}

interface AssetCenterPageProps {
  activeProjectName?: string
  returnLabel?: string
  onReturn?: () => void
  onUseAsset?: (item: AssetCatalogItem) => void
}

function categoryFromSearch(params: URLSearchParams): AssetCenterCategory {
  const candidate = params.get('assetCategory')
  if (['template', 'style', 'page-template', 'material-template', 'inspiration', 'activity-template'].includes(candidate ?? '')) return 'page-component'
  return ASSET_CENTER_CATEGORIES.some((item) => item.id === candidate)
    ? candidate as AssetCenterCategory
    : 'page-component'
}

function isVisibleCategory(category: AssetCenterCategory) {
  return ASSET_CENTER_CATEGORIES.some((item) => item.id === category)
}

function defaultAssetClassForCategory(category: AssetCenterCategory): AssetClass | 'all' {
  return category === 'page-component' ? 'h5-component' : 'all'
}

export default function AssetCenterPage({
  activeProjectName,
  returnLabel,
  onReturn,
  onUseAsset,
}: AssetCenterPageProps) {
  const initialParams = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
  const initialAssetId = initialParams.get('asset')
  const [view, setView] = useState<'catalog' | 'detail' | 'form'>(initialAssetId ? 'detail' : 'catalog')
  const initialCategory = categoryFromSearch(initialParams)
  const [category, setCategory] = useState<AssetCenterCategory>(initialCategory)
  const [assetClass, setAssetClass] = useState<AssetClass | 'all'>(() => defaultAssetClassForCategory(initialCategory))
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState(initialAssetId ?? 'template.page.acg-game-venue')
  const [draftAssets, setDraftAssets] = useState<AssetCatalogItem[]>(readStoredDrafts)
  const [formIntent, setFormIntent] = useState<AssetFormIntent>('create')
  const [formSourceId, setFormSourceId] = useState<string>()
  const [previewImage, setPreviewImage] = useState<NonNullable<AssetCatalogItem['visualReferences']>[number] | null>(null)

  const allAssets = useMemo(() => [...draftAssets, ...ASSET_CATALOG], [draftAssets])
  const categoryConfig = ASSET_CENTER_CATEGORIES.find((item) => item.id === category)
  const categoryItems = useMemo(() => allAssets.filter((item) => item.category === category), [allAssets, category])
  const classOptions = useMemo(() => Array.from(new Set(categoryItems.map((item) => item.assetClass))), [categoryItems])
  const items = useMemo(() => {
    const normalized = keyword.trim().toLocaleLowerCase('zh-CN')
    return categoryItems
      .filter((item) => assetClass === 'all' || item.assetClass === assetClass)
      .filter((item) => {
        if (!normalized) return true
        const searchable = [
          item.name,
          item.summary,
          ASSET_CLASS_LABEL[item.assetClass],
          ...item.tags,
          ...item.coverage,
          ...item.parameterGroups.flatMap((group) => group.parameters.flatMap((parameter) => [parameter.label, parameter.value])),
        ].join('')
        return searchable.toLocaleLowerCase('zh-CN').includes(normalized)
      })
  }, [assetClass, categoryItems, keyword])
  const selected = items.find((item) => item.id === selectedId) ?? allAssets.find((item) => item.id === selectedId) ?? items[0]
  const formSource = formSourceId ? allAssets.find((item) => item.id === formSourceId) : undefined

  useEffect(() => {
    window.localStorage.setItem(ASSET_DRAFT_STORAGE_KEY, JSON.stringify(draftAssets))
  }, [draftAssets])

  useEffect(() => {
    const syncDetailFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const assetId = params.get('asset')
      if (!assetId) {
        const nextCategory = categoryFromSearch(params)
        setCategory(nextCategory)
        setAssetClass(defaultAssetClassForCategory(nextCategory))
        setView((current) => current === 'form' ? current : 'catalog')
        return
      }
      const asset = allAssets.find((item) => item.id === assetId)
      if (!asset) {
        const params = new URLSearchParams(window.location.search)
        params.delete('asset')
        window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
        setView('catalog')
        return
      }
      setSelectedId(asset.id)
      setCategory(asset.category)
      setView('detail')
    }
    syncDetailFromUrl()
    window.addEventListener('popstate', syncDetailFromUrl)
    return () => window.removeEventListener('popstate', syncDetailFromUrl)
  }, [allAssets])

  const openDetail = (item: AssetCatalogItem) => {
    setSelectedId(item.id)
    setCategory(item.category)
    setView('detail')
    const params = new URLSearchParams(window.location.search)
    params.set('page', 'assets')
    params.set('assetCategory', item.category)
    params.set('asset', item.id)
    window.history.pushState({ ...window.history.state, assetCenterEntry: item.id }, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }

  const closeDetail = () => {
    if (window.history.state?.assetCenterEntry === selectedId) {
      window.history.back()
      return
    }
    const params = new URLSearchParams(window.location.search)
    const nextCategory = isVisibleCategory(selected.category) ? selected.category : 'page-component'
    params.delete('asset')
    params.set('assetCategory', nextCategory)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
    setCategory(nextCategory)
    setAssetClass(defaultAssetClassForCategory(nextCategory))
    setView('catalog')
  }

  const handleCategoryChange = (nextCategory: AssetCenterCategory) => {
    if (nextCategory === category) return
    setCategory(nextCategory)
    setAssetClass(defaultAssetClassForCategory(nextCategory))
    setKeyword('')
    const firstItem = allAssets.find((item) => item.category === nextCategory)
    if (firstItem) setSelectedId(firstItem.id)
    const params = new URLSearchParams(window.location.search)
    params.set('page', 'assets')
    params.set('assetCategory', nextCategory)
    params.delete('asset')
    window.history.pushState({ ...window.history.state, assetCenterCategory: nextCategory }, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }

  const openForm = (intent: AssetFormIntent, source?: AssetCatalogItem) => {
    setFormIntent(intent)
    setFormSourceId(source?.id)
    setView('form')
  }

  const handleSaveDraft = (asset: AssetCatalogItem) => {
    setDraftAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)])
    setCategory(asset.category)
    setAssetClass(defaultAssetClassForCategory(asset.category))
    setKeyword('')
    setSelectedId(asset.id)
    const params = new URLSearchParams(window.location.search)
    params.set('page', 'assets')
    params.set('assetCategory', asset.category)
    params.set('asset', asset.id)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
    setView('detail')
  }

  const handleUseAsset = (item: AssetCatalogItem) => {
    if (item.status === '草稿') {
      toast.warning('草稿不能被正式项目引用', { description: '请完成发布前检查并发布版本后再引用。' })
      return
    }
    toast.success(`已加入「${item.name}」`, {
      description: onUseAsset
        ? '已回到来源页面，并加入当前对话上下文；发送后将按该版本生成。'
        : '已选择当前发布版本。',
    })
    onUseAsset?.(item)
  }

  if (view === 'form') {
    return <AssetFormPage intent={formIntent} category={category} source={formSource} onCancel={() => setView(formSource ? 'detail' : 'catalog')} onSave={handleSaveDraft} />
  }

  if (view === 'detail' && selected) {
    return (
      <AssetDetailPage
        item={selected}
        preview={<AssetPreview item={selected} />}
        registryLabel={REGISTRY_LABEL[selected.registry]}
        onBack={closeDetail}
        onReturn={onReturn}
        returnLabel={returnLabel}
        onCreateVersion={() => openForm('version', selected)}
        onCreateVariant={() => openForm('variant', selected)}
        onUse={() => handleUseAsset(selected)}
        useLabel={activeProjectName ? `用于「${activeProjectName}」` : undefined}
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="z-20 shrink-0 bg-white px-6 shadow-[inset_0_-1px_0_rgba(45,66,107,0.12)]">
        <div className={`flex items-center ${onReturn ? 'gap-3' : 'gap-6'}`}>
          {onReturn ? (
            <>
              <button
                type="button"
                onClick={onReturn}
                aria-label={`返回${returnLabel ?? '项目'}`}
                className="flex h-8 max-w-[190px] shrink-0 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-[#1C1F23]/58 transition-colors hover:bg-[#F3F4F5] hover:text-[#1C1F23]"
              >
                <ArrowLeft className="size-3.5 shrink-0" />
                <span className="truncate">返回{returnLabel ?? '项目'}</span>
              </button>
              <span aria-hidden className="h-4 w-px shrink-0 bg-[#E4E5E7]" />
            </>
          ) : null}
          <h1 className="shrink-0 text-[20px] font-semibold leading-6 tracking-[-0.08px] text-[#1C1F23]">资产中心</h1>
          <nav aria-label="资产中心分类" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ASSET_CENTER_CATEGORIES.map((item) => {
              const active = item.id === category
              return (
                <button key={item.id} type="button" aria-current={active ? 'page' : undefined} onClick={() => handleCategoryChange(item.id)} className={`relative flex h-[52px] shrink-0 items-center px-3 text-[14px] transition-colors ${active ? 'font-medium text-[#1C1F23]' : 'text-[#1C1F23]/60 hover:text-[#1C1F23]'}`}>
                  {item.label}
                  {active ? <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#1C1F23]" /> : null}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="thin-scroll min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-[#ECEDEF] bg-white/95 px-6 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex h-8 w-[260px] items-center">
                <Search className="pointer-events-none absolute left-2.5 size-3.5 text-[#161823]/38" />
                <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={`搜索${categoryConfig?.label ?? '资产'}或参数`} className="h-8 w-full rounded-lg border border-[#E3E4E6] bg-white pl-8 pr-3 text-[12px] text-[#161823] outline-none placeholder:text-[#161823]/30 focus:border-[#161823]/28" />
              </label>
              <span className="text-[11px] text-[#161823]/38">{items.length} / {categoryItems.length} 项</span>
              <button type="button" onClick={() => openForm('create')} className="ml-auto flex h-8 items-center gap-1.5 rounded-full bg-[#161823] px-3.5 text-[11px] font-medium text-white hover:opacity-90">
                <Plus className="size-3.5" /> 新建资产
              </button>
            </div>
            {classOptions.length > 1 ? (
              <div className="mt-2 flex items-center gap-1.5" aria-label="资产类型筛选">
                {category !== 'page-component' ? <button type="button" aria-pressed={assetClass === 'all'} onClick={() => setAssetClass('all')} className={`h-6 rounded-full px-2.5 text-[10px] transition-colors ${assetClass === 'all' ? 'bg-[#161823] text-white' : 'bg-[#F3F4F6] text-[#161823]/52 hover:bg-[#EDEEF0]'}`}>全部</button> : null}
                {classOptions.map((itemClass) => (
                  <button key={itemClass} type="button" aria-pressed={assetClass === itemClass} onClick={() => setAssetClass(itemClass)} className={`h-6 rounded-full px-2.5 text-[10px] transition-colors ${assetClass === itemClass ? 'bg-[#161823] text-white' : 'bg-[#F3F4F6] text-[#161823]/52 hover:bg-[#EDEEF0]'}`}>
                    {ASSET_CLASS_LABEL[itemClass]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="px-6 py-5">
            <div className="mb-4 flex items-start gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#161823]">{categoryConfig?.label}</h2>
                <p className="mt-1 text-[11px] text-[#161823]/42">{categoryConfig?.description}</p>
              </div>
            </div>
            {items.length ? (
              <div className={category === 'page-component'
                ? 'grid grid-cols-1 gap-4 min-[760px]:grid-cols-2 min-[1120px]:grid-cols-3 min-[1560px]:grid-cols-4'
                : 'grid grid-cols-1 gap-4 min-[1050px]:grid-cols-2 min-[1560px]:grid-cols-3'}>
                {items.map((item) => <AssetCard key={item.id} item={item} onOpen={() => openDetail(item)} onPreview={setPreviewImage} />)}
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCDDDF] text-center">
                <Search className="size-5 text-[#161823]/22" />
                <p className="mt-2 text-[12px] text-[#161823]/42">没有匹配的资产</p>
                <button type="button" onClick={() => { setKeyword(''); setAssetClass(defaultAssetClassForCategory(category)) }} className="mt-2 text-[10px] text-blue-600">清除筛选</button>
              </div>
            )}
          </div>
        </main>
      </div>
      {previewImage ? <AssetImageDialog reference={previewImage} onClose={() => setPreviewImage(null)} /> : null}
    </div>
  )
}
