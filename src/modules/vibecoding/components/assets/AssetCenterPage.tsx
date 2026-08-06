import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Gift,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Lock,
  Monitor,
  Palette,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
  Upload,
} from '@/shared/icons'
import {
  ASSET_CATALOG,
  ASSET_CENTER_CATEGORIES,
  ASSET_CLASS_LABEL,
  type AssetCatalogItem,
  type AssetCenterCategory,
  type AssetClass,
  type AssetParameterMode,
} from '../../assets/assetCatalog'
import AssetDetailPage from './AssetDetailPage'
import AssetFormPage, { type AssetFormIntent } from './AssetFormPage'

const CLASS_ICON = {
  'activity-template': LayoutTemplate,
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

const MODE_STYLE: Record<AssetParameterMode, string> = {
  可配置: 'bg-blue-50 text-blue-700',
  'Agent 推断': 'bg-violet-50 text-violet-700',
  引用资产: 'bg-amber-50 text-amber-700',
  固定规则: 'bg-[#F1F2F4] text-[#161823]/50',
}

const ASSET_DRAFT_STORAGE_KEY = 'creative-studio.asset-drafts.v1'

function readStoredDrafts(): AssetCatalogItem[] {
  try {
    const value = window.localStorage.getItem(ASSET_DRAFT_STORAGE_KEY)
    if (!value) return []
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is AssetCatalogItem => Boolean(item && typeof item === 'object' && 'id' in item && 'name' in item && 'status' in item && item.status === '草稿'))
  } catch {
    return []
  }
}

function AssetPreview({ item, compact = false }: { item: AssetCatalogItem; compact?: boolean }) {
  const height = compact ? 'h-[84px]' : 'h-[132px]'

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
          <span className="rounded-md bg-[#EA5B34]/10 px-2 py-1 text-[8px] font-semibold text-[#B64627]">ACTIVITY TEMPLATE</span>
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
          <p className={`${compact ? 'mt-2 text-[10px]' : 'mt-3 text-[12px]'} font-medium text-[#6D262A]`}>6 标准形象 · 30 动作 · 15 表情</p>
        </div>
        {item.thumbnail ? <img src={item.thumbnail} alt="心仔角色预览" className="absolute bottom-[-6%] right-[6%] h-[105%] object-contain drop-shadow-[0_10px_14px_rgba(126,37,37,0.16)]" /> : null}
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
          <span className="rounded bg-white/18 px-1.5 py-0.5 text-[8px] font-semibold backdrop-blur-sm">STYLE BIBLE</span>
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
        <span className="absolute left-4 top-4 rounded-md bg-[#6C5CE7] px-2 py-1 text-[8px] font-semibold text-white shadow-sm">LAYER TEMPLATE</span>
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

function AssetCard({ item, selected, onSelect }: { item: AssetCatalogItem; selected: boolean; onSelect: () => void }) {
  const Icon = CLASS_ICON[item.assetClass]
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-w-0 rounded-2xl border bg-white p-3.5 text-left transition-[border-color,box-shadow,transform] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(31,35,41,0.07)] ${selected ? 'border-[#161823]/28 shadow-[0_8px_20px_rgba(31,35,41,0.06)]' : 'border-[#EFF0F2]'}`}
    >
      <AssetPreview item={item} compact />
      <div className="mt-3 flex min-w-0 items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F3F3F5] text-[#161823]/62">
          <Icon className="size-3.5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-[13px] font-medium text-[#161823]">{item.name}</h3>
            <span className="shrink-0 text-[10px] text-[#161823]/35">v{item.version}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-[17px] text-[#161823]/44">{item.summary}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-[#ECEDEF]">
        {item.metrics.slice(0, 3).map((metric) => (
          <div key={metric.label} className="min-w-0 bg-[#F8F8FA] px-2 py-1.5">
            <p className="truncate text-[8px] text-[#161823]/32">{metric.label}</p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-[#161823]/68">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#F2F2F4] pt-2.5 text-[10px] text-[#161823]/38">
        <span className="inline-flex items-center gap-1"><Icon className="size-3" /> {ASSET_CLASS_LABEL[item.assetClass]}</span>
        <span className={`inline-flex items-center gap-1 ${item.status === '待更新' ? 'text-amber-700' : item.status === '草稿' ? 'text-blue-700' : item.status === '内测中' ? 'text-violet-700' : 'text-emerald-700'}`}>
          <span className={`size-1.5 rounded-full ${item.status === '待更新' ? 'bg-amber-500' : item.status === '草稿' ? 'bg-blue-500' : item.status === '内测中' ? 'bg-violet-500' : 'bg-emerald-500'}`} /> {item.status}
        </span>
      </div>
    </button>
  )
}

function DetailPanel({ item, projectName, onOpen, onCreateVersion, onUse }: { item: AssetCatalogItem; projectName?: string; onOpen: () => void; onCreateVersion: () => void; onUse: () => void }) {
  const Icon = CLASS_ICON[item.assetClass]
  return (
    <aside className="flex h-full min-h-0 w-[38%] min-w-[320px] max-w-[400px] shrink-0 flex-col border-l border-[#E9EAED] bg-[#FAFAFB]">
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <AssetPreview item={item} />
        <div className="mt-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#161823]/64 shadow-[inset_0_0_0_1px_#E8E9EC]">
            <Icon className="size-[17px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#161823]">{item.name}</h2>
              <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-[#161823]/45 shadow-[inset_0_0_0_1px_#E8E9EC]">v{item.version}</span>
            </div>
            <p className="mt-1 text-[11px] leading-[18px] text-[#161823]/48">{item.summary}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#E8E9EC] bg-[#E8E9EC]">
          {item.metrics.slice(0, 3).map((metric) => (
            <div key={metric.label} className="min-w-0 bg-white px-2.5 py-2.5">
              <p className="truncate text-[9px] text-[#161823]/34">{metric.label}</p>
              <p className="mt-1 truncate text-[11px] font-semibold text-[#161823]/72">{metric.value}</p>
            </div>
          ))}
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 rounded-xl border border-[#ECEDEF] bg-white px-3 py-3 text-[10px]">
          {[
            ['资产类型', ASSET_CLASS_LABEL[item.assetClass]],
            ['归属团队', item.owner],
            ['存储域', REGISTRY_LABEL[item.registry]],
            ['更新时间', item.updatedAt],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[#161823]/34">{label}</dt>
              <dd className="mt-1 truncate font-medium text-[#161823]/68">{value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#161823]/80"><Box className="size-3.5" /> 参数与可变范围</h3>
            <span className="text-[9px] text-[#161823]/34">按资产类型定义</span>
          </div>
          <div className="mt-2.5 space-y-2.5">
            {item.parameterGroups.map((group) => (
              <div key={group.name} className="overflow-hidden rounded-xl border border-[#E8E9EC] bg-white">
                <div className="border-b border-[#F0F0F2] px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-[#161823]/76">{group.name}</p>
                  <p className="mt-0.5 text-[9px] leading-[14px] text-[#161823]/36">{group.summary}</p>
                </div>
                <div className="divide-y divide-[#F2F2F4]">
                  {group.parameters.map((parameter) => {
                    const editable = parameter.mode !== '固定规则'
                    return (
                      <button
                        key={parameter.label}
                        type="button"
                        onClick={() => editable ? onCreateVersion() : toast(`「${parameter.label}」由资产规则锁定`)}
                        className="group flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-[#FAFAFB]"
                      >
                        <div className="w-[92px] shrink-0">
                          <p className="text-[10px] font-medium text-[#161823]/58">{parameter.label}</p>
                          <span className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[8px] ${MODE_STYLE[parameter.mode]}`}>{parameter.mode}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] leading-[16px] text-[#161823]/72">{parameter.value}</p>
                          {parameter.note ? <p className="mt-0.5 text-[9px] leading-[14px] text-[#161823]/34">{parameter.note}</p> : null}
                        </div>
                        {editable ? <Pencil className="mt-0.5 size-3 shrink-0 text-[#161823]/18 group-hover:text-[#161823]/42" /> : <Lock className="mt-0.5 size-3 shrink-0 text-[#161823]/18" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#161823]/80"><Layers className="size-3.5" /> 资产组成与交付</h3>
          <div className="mt-2.5 overflow-hidden rounded-xl border border-[#E8E9EC] bg-white">
            {item.deliverables.map((deliverable, index) => (
              <div key={deliverable.name} className={`flex items-start gap-2.5 px-3 py-2.5 ${index ? 'border-t border-[#F0F0F2]' : ''}`}>
                <CheckCircle2 className={`mt-0.5 size-3.5 shrink-0 ${deliverable.required ? 'text-emerald-600' : 'text-[#161823]/24'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-medium text-[#161823]/68">{deliverable.name}</p>
                    <span className="text-[8px] text-[#161823]/30">{deliverable.required ? '必需' : '可选'}</span>
                  </div>
                  <p className="mt-0.5 text-[9px] leading-[14px] text-[#161823]/38">{deliverable.specification}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-[#E8E9EC] bg-white px-3 py-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#161823]/80"><Upload className="size-3.5" /> 可导入内容</h3>
            <button type="button" onClick={onCreateVersion} className="text-[9px] font-medium text-blue-600 hover:text-blue-700">导入到新版本</button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.governance.importFormats.map((format) => <span key={format} className="rounded-md bg-[#F3F4F6] px-2 py-1 text-[9px] text-[#161823]/52">{format}</span>)}
          </div>
          <p className="mt-3 border-t border-[#F0F0F2] pt-2.5 text-[9px] leading-[15px] text-[#161823]/38">适用：{item.coverage.join(' · ')}</p>
        </section>

        <section className="mt-5">
          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-[#161823]/80"><ShieldCheck className="size-3.5" /> 发布门槛与使用边界</h3>
          <ul className="mt-2.5 space-y-2 text-[10px] leading-[16px] text-[#161823]/48">
            {item.constraints.map((constraint) => (
              <li key={constraint} className="flex gap-2"><span className="mt-[6px] size-1 shrink-0 rounded-full bg-[#161823]/28" />{constraint}</li>
            ))}
          </ul>
        </section>

        <section className="mt-5 overflow-hidden rounded-xl border border-[#E8E9EC] bg-white">
          <div className="border-b border-[#F0F0F2] px-3 py-2.5">
            <h3 className="text-[11px] font-semibold text-[#161823]/76">来源、证据与授权</h3>
          </div>
          <dl className="divide-y divide-[#F2F2F4] text-[9px] leading-[15px]">
            {[
              ['沉淀来源', item.governance.source],
              ['可信证据', item.governance.evidence],
              ['自动质检', item.governance.qualityGate],
              ['授权范围', item.governance.rights],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[62px_1fr] gap-2.5 px-3 py-2.5">
                <dt className="text-[#161823]/34">{label}</dt>
                <dd className="text-[#161823]/56">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-5 rounded-xl bg-[#F1F2F4] px-3 py-3">
          <p className="text-[9px] text-[#161823]/34">当前引用情况</p>
          <p className="mt-1 text-[10px] font-medium leading-[16px] text-[#161823]/62">{item.usage}</p>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#E6E7E9] bg-white px-5 py-3">
        <div className="flex gap-2">
          <button type="button" onClick={onOpen} className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#E4E5E7] bg-white px-3 text-[10px] font-medium text-[#161823]/66 hover:bg-[#F7F7F8]">
            <ExternalLink className="size-3.5" /> 完整详情
          </button>
          <button type="button" onClick={onUse} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[10px] font-medium text-white hover:opacity-90">
            <Plus className="size-3.5" /> <span className="truncate">用于{projectName ? `「${projectName}」` : '当前项目'}</span>
          </button>
          <button type="button" onClick={onCreateVersion} aria-label={item.status === '草稿' ? '继续编辑草稿' : '创建新版本'} className="flex size-8 items-center justify-center rounded-lg border border-[#E4E5E7] bg-white text-[#161823]/58 hover:bg-[#F7F7F8]">
            <Pencil className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

interface AssetCenterPageProps {
  activeProjectName?: string
  returnLabel?: string
  onReturn?: () => void
  onUseAsset?: (item: AssetCatalogItem) => void
}

export default function AssetCenterPage({
  activeProjectName,
  returnLabel,
  onReturn,
  onUseAsset,
}: AssetCenterPageProps) {
  const [view, setView] = useState<'catalog' | 'detail' | 'form'>('catalog')
  const [category, setCategory] = useState<AssetCenterCategory>('template')
  const [assetClass, setAssetClass] = useState<AssetClass | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState('template.ip-co-brand-dual-venue-event')
  const [draftAssets, setDraftAssets] = useState<AssetCatalogItem[]>(readStoredDrafts)
  const [formIntent, setFormIntent] = useState<AssetFormIntent>('create')
  const [formSourceId, setFormSourceId] = useState<string>()

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

  const handleCategoryChange = (nextCategory: AssetCenterCategory) => {
    setCategory(nextCategory)
    setAssetClass('all')
    setKeyword('')
    const firstItem = allAssets.find((item) => item.category === nextCategory)
    if (firstItem) setSelectedId(firstItem.id)
  }

  const openForm = (intent: AssetFormIntent, source?: AssetCatalogItem) => {
    setFormIntent(intent)
    setFormSourceId(source?.id)
    setView('form')
  }

  const handleSaveDraft = (asset: AssetCatalogItem) => {
    setDraftAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)])
    setCategory(asset.category)
    setAssetClass('all')
    setKeyword('')
    setSelectedId(asset.id)
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
        onBack={() => setView('catalog')}
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
          <nav aria-label="资产中心分类" className="flex min-w-0 flex-1 items-center gap-1">
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
              <button type="button" onClick={() => toast(`批量导入${categoryConfig?.label ?? '资产'}（演示）`)} className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-[#E3E4E6] bg-white px-3 text-[11px] font-medium text-[#161823]/66 hover:bg-[#F7F7F8]">
                <Upload className="size-3.5" /> 批量导入
              </button>
              <button type="button" onClick={() => openForm('create')} className="flex h-8 items-center gap-1.5 rounded-full bg-[#161823] px-3.5 text-[11px] font-medium text-white hover:opacity-90">
                <Plus className="size-3.5" /> 新建资产
              </button>
            </div>
            {classOptions.length > 1 ? (
              <div className="mt-2 flex items-center gap-1.5" aria-label="资产类型筛选">
                <button type="button" aria-pressed={assetClass === 'all'} onClick={() => setAssetClass('all')} className={`h-6 rounded-full px-2.5 text-[10px] transition-colors ${assetClass === 'all' ? 'bg-[#161823] text-white' : 'bg-[#F3F4F6] text-[#161823]/52 hover:bg-[#EDEEF0]'}`}>全部</button>
                {classOptions.map((itemClass) => (
                  <button key={itemClass} type="button" aria-pressed={assetClass === itemClass} onClick={() => setAssetClass(itemClass)} className={`h-6 rounded-full px-2.5 text-[10px] transition-colors ${assetClass === itemClass ? 'bg-[#161823] text-white' : 'bg-[#F3F4F6] text-[#161823]/52 hover:bg-[#EDEEF0]'}`}>
                    {ASSET_CLASS_LABEL[itemClass]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="px-6 py-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#161823]">{categoryConfig?.label}</h2>
                <p className="mt-1 text-[11px] text-[#161823]/42">{categoryConfig?.description}</p>
                <p className="mt-1.5 text-[10px] text-[#161823]/32">每项资产都包含可变参数、交付规格、来源证据、授权范围和发布门槛。</p>
              </div>
              <button type="button" onClick={() => toast('查看资产分层与治理说明（演示）')} className="flex shrink-0 items-center gap-1.5 text-[11px] text-[#161823]/48 hover:text-[#161823]/76">
                <BookOpen className="size-3.5" /> 资产治理说明
              </button>
            </div>
            {items.length ? (
              <div className="grid grid-cols-1 gap-3 min-[1080px]:grid-cols-2 min-[1640px]:grid-cols-3">
                {items.map((item) => <AssetCard key={item.id} item={item} selected={item.id === selected?.id} onSelect={() => setSelectedId(item.id)} />)}
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCDDDF] text-center">
                <Search className="size-5 text-[#161823]/22" />
                <p className="mt-2 text-[12px] text-[#161823]/42">没有匹配的资产</p>
                <button type="button" onClick={() => { setKeyword(''); setAssetClass('all') }} className="mt-2 text-[10px] text-blue-600">清除筛选</button>
              </div>
            )}
          </div>
        </main>
        {selected ? <DetailPanel item={selected} projectName={activeProjectName} onOpen={() => setView('detail')} onCreateVersion={() => openForm('version', selected)} onUse={() => handleUseAsset(selected)} /> : null}
      </div>
    </div>
  )
}
