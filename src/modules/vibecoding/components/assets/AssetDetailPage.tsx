import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Upload,
} from '@/shared/icons'
import {
  ASSET_CLASS_LABEL,
  type AssetCatalogItem,
  type AssetParameterMode,
  type AssetVisualReference,
} from '../../assets/assetCatalog'
import { AssetImageDialog, AssetMediaSurface } from './AssetMedia'
import { assetMediaReferences } from './assetMediaUtils'
import ActivityTemplateSandbox from './ActivityTemplateSandbox'
import BrandKitDetail from './BrandKitDetail'
import IpKitDetail from './IpKitDetail'
import GameplayKitDetail from './GameplayKitDetail'
import InteractiveDeliverableRuntime from '../InteractiveDeliverableRuntime'
import {
  ACG_NEW_YEAR_CASE,
  EVERNIGHT_CASE,
  SPRING_GALA_CASE,
  type DocumentedActivityCase,
} from '../DocumentedActivityData'

interface AssetDetailPageProps {
  item: AssetCatalogItem
  preview: ReactNode
  registryLabel: string
  onBack: () => void
  onReturn?: () => void
  returnLabel?: string
  onCreateVersion: () => void
  onCreateVariant: () => void
  onUse: () => void
  useLabel?: string
}

const MODE_STYLE: Record<AssetParameterMode, string> = {
  可配置: 'bg-blue-50 text-blue-700',
  'Agent 推断': 'bg-violet-50 text-violet-700',
  引用资产: 'bg-amber-50 text-amber-700',
  固定规则: 'bg-[#F1F2F4] text-[#161823]/50',
}

function modeLabel(mode: AssetParameterMode) {
  return mode === 'Agent 推断' ? '智能填写' : mode
}

const PAGE_TEMPLATE_RUNTIME: Record<string, { activityCase: DocumentedActivityCase; deliverableId: string }> = {
  'template.page.acg-game-venue': { activityCase: ACG_NEW_YEAR_CASE, deliverableId: 'DLV-ACG-001' },
  'template.page.acg-anime-venue': { activityCase: ACG_NEW_YEAR_CASE, deliverableId: 'DLV-ACG-002' },
  'template.page.gala-main': { activityCase: SPRING_GALA_CASE, deliverableId: 'DLV-GALA-001' },
  'template.page.gala-full': { activityCase: SPRING_GALA_CASE, deliverableId: 'DLV-GALA-002' },
  'template.page.evernight-main': { activityCase: EVERNIGHT_CASE, deliverableId: 'DLV-EVN-001' },
  'template.page.evernight-task': { activityCase: EVERNIGHT_CASE, deliverableId: 'DLV-EVN-016' },
}

function PageTemplateRuntimeStage({ item }: { item: AssetCatalogItem }) {
  const [runtimeSession, setRuntimeSession] = useState(0)
  const source = PAGE_TEMPLATE_RUNTIME[item.id]
  const deliverable = source?.activityCase.deliverables.find((candidate) => candidate.id === source.deliverableId)
  if (!source || !deliverable) return null
  const surface = item.metrics.find((metric) => metric.label === '运行载体')?.value ?? deliverable.surface

  return (
    <section aria-label={`${item.name}真实页面运行态`} className="overflow-hidden rounded-[20px] border border-[#E0E2E5] bg-white shadow-[0_10px_32px_rgba(31,35,41,0.06)]">
      <header className="flex min-h-12 items-center gap-3 border-b border-[#E7E8EA] px-4 py-2.5">
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><i className="size-1.5 rounded-full bg-emerald-500" />{surface} 页面</span>
        <button type="button" onClick={() => setRuntimeSession((value) => value + 1)} className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-[#E0E1E3] px-2.5 text-xs font-medium text-[#161823]/52 hover:bg-[#F2F3F5] hover:text-[#161823]"><RotateCcw className="size-3" />重置试玩</button>
      </header>
      <div className="thin-scroll overflow-auto bg-[#EEF0F3] [background-image:radial-gradient(circle,rgba(22,24,35,0.12)_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="w-max min-w-full px-8 py-8">
          <div className="mx-auto w-[390px]">
            <InteractiveDeliverableRuntime key={`${deliverable.id}-${runtimeSession}`} activityCase={source.activityCase} item={deliverable} />
          </div>
        </div>
      </div>
      <footer className="border-t border-[#E7E8EA] px-5 py-3 text-xs text-[#71717A]">
        页面内按钮、Tab、弹层与业务状态均可直接操作
      </footer>
    </section>
  )
}

function statusStyle(status: AssetCatalogItem['status']) {
  if (status === '草稿') return 'bg-blue-50 text-blue-700'
  if (status === '待更新') return 'bg-amber-50 text-amber-700'
  if (status === '内测中') return 'bg-violet-50 text-violet-700'
  return 'bg-emerald-50 text-emerald-700'
}

function VisualStage({ item, preview, onPreview }: { item: AssetCatalogItem; preview: ReactNode; onPreview: (reference: AssetVisualReference) => void }) {
  const references = assetMediaReferences(item)
  const [activeSource, setActiveSource] = useState('')

  if (!references.length) {
    return (
      <section aria-label={`${item.name}视觉预览`} className="grid h-[360px] grid-cols-[minmax(0,1.65fr)_minmax(280px,0.7fr)] overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="min-w-0 bg-[#F5F7FA] p-5 [&>*]:!h-full">{preview}</div>
        <div className="flex min-w-0 flex-col justify-between border-l border-[#E4E4E7] bg-white p-6">
          <div>
            <p className="text-xs font-medium text-[#A1A1AA]">{ASSET_CLASS_LABEL[item.assetClass]}</p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[#1C1F23]">{item.name}</h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-[#F4F4F5] px-2.5 py-1 text-xs text-[#71717A]">{tag}</span>)}
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#E4E4E7]">
              {item.metrics.slice(0, 3).map((metric) => <div key={metric.label} className="min-w-0 bg-white px-2.5 py-3"><p className="truncate text-xs text-[#A1A1AA]">{metric.label}</p><p className="mt-1 truncate text-sm font-semibold text-[#1C1F23]">{metric.value}</p></div>)}
            </div>
            <p className="mt-4 text-xs leading-4 text-[#A1A1AA]">{item.coverage.slice(0, 4).join(' · ')}</p>
          </div>
        </div>
      </section>
    )
  }
  const selectedIndex = references.findIndex((reference) => reference.src === activeSource)
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0
  const activeReference = references[activeIndex]
  return (
    <section aria-label={`${item.name}视觉预览`} className="overflow-hidden rounded-[20px] border border-[#E0E2E5] bg-white shadow-[0_10px_32px_rgba(31,35,41,0.06)]">
      <div className={`grid min-h-[500px] ${references.length > 1 ? 'min-[1120px]:grid-cols-[minmax(0,1fr)_188px]' : ''}`}>
        <AssetMediaSurface
          reference={activeReference}
          onPreview={onPreview}
          className="min-h-[420px] border-b border-[#E0E2E5] min-[1120px]:border-b-0 min-[1120px]:border-r"
          imageClassName="drop-shadow-[0_8px_20px_rgba(22,24,35,0.1)]"
        />
        {references.length > 1 ? (
          <aside className="border-b border-[#E0E2E5] bg-[#FAFAFB] p-3 min-[1120px]:border-b-0">
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-xs font-semibold text-[#161823]/56">视觉文件</p>
              <span className="text-xs text-[#161823]/30">{activeIndex + 1} / {references.length}</span>
            </div>
            <div className="thin-scroll mt-2.5 flex gap-2 overflow-x-auto pb-1 min-[1120px]:max-h-[440px] min-[1120px]:flex-col min-[1120px]:overflow-x-hidden min-[1120px]:overflow-y-auto min-[1120px]:pr-1">
              {references.map((reference, index) => (
                <button
                  key={reference.src}
                  type="button"
                  onClick={() => setActiveSource(reference.src)}
                  aria-pressed={index === activeIndex}
                  className={`w-[142px] shrink-0 rounded-xl border bg-white p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#357EF8]/55 min-[1120px]:w-full ${index === activeIndex ? 'border-[#161823]/42 shadow-sm' : 'border-[#E3E4E6] hover:border-[#C8CBD0]'}`}
                >
                  <span className="relative block h-[84px] overflow-hidden rounded-lg bg-[#F1F2F4]">
                    <span aria-hidden className="absolute inset-0 opacity-55 [background-image:linear-gradient(45deg,#E4E6E9_25%,transparent_25%),linear-gradient(-45deg,#E4E6E9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E4E6E9_75%),linear-gradient(-45deg,transparent_75%,#E4E6E9_75%)] [background-position:0_0,0_6px,6px_-6px,-6px_0] [background-size:12px_12px]" />
                    <img src={reference.src} alt="" className="relative size-full object-contain p-1" />
                  </span>
                  <span className="mt-1.5 block truncate px-0.5 text-xs font-medium text-[#161823]/58">{reference.label}</span>
                </button>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
      <footer className="flex items-center gap-4 border-t border-[#E7E8EA] px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#161823]/76">{activeReference.label}</p>
          <p className="mt-1 truncate text-xs text-[#161823]/36">{activeReference.specification}</p>
        </div>
        <span className="shrink-0 rounded-md bg-[#F1F2F4] px-2 py-1 text-xs text-[#161823]/44">点击画面放大</span>
      </footer>
    </section>
  )
}

function TemplateDecisionHero({ item, onPreview }: { item: AssetCatalogItem; onPreview: (reference: AssetVisualReference) => void }) {
  const profile = item.templateProfile
  if (!profile) return null
  const reference = item.visualReferences?.[0]
  const referenceCase = ({
    'template.ip-co-brand-dual-venue-event': '2026 抖音 ACG 新春会',
    'template.channel-resource-pack-no-page': 'ACG 新春会 · 资源位延展',
    'template.live-program-asset-pack': '2026 抖音春晚 · 直播包装',
    'template.program-gala-omnichannel': '2026 抖音春晚',
    'template.film-ip-task-card-draw': '《永夜星河》任务抽卡',
  } as Record<string, string>)[item.id] ?? '已落地活动案例'
  return (
    <section aria-label={`${item.name}模板概览`} className="overflow-hidden rounded-[20px] border border-[#E3E4E6] bg-white shadow-[0_10px_32px_rgba(31,35,41,0.05)]">
      <div className="grid min-h-[300px] lg:grid-cols-[minmax(520px,1.3fr)_minmax(340px,0.7fr)]">
        <div className="flex flex-col p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyle(item.status)}`}>{item.status}</span>
            <span className="rounded-md bg-[#EDEEF0] px-2 py-1 text-xs text-[#161823]/52">活动模板</span>
            <span className="text-xs text-[#161823]/30">v{item.version}</span>
          </div>
          <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#161823]">{item.name}</h1>
          <p className="mt-3 text-[15px] font-medium leading-7 tracking-[-0.01em] text-[#161823]/78">{profile.purpose}</p>

          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E7E8EA] bg-[#E7E8EA]">
            {[
              ['适合什么活动', profile.fit],
              ['标准活动规模', profile.scale],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#FAFAFB] px-3.5 py-3">
                <p className="text-xs font-semibold text-[#161823]/38">{label}</p>
                <p className="mt-1.5 line-clamp-3 text-sm leading-[17px] text-[#161823]/58">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-auto pt-4 text-xs leading-4 text-[#161823]/34">模板定义活动怎么组织，不携带案例中的具体品牌、IP 或视觉成片。</p>
        </div>

        <div className="flex min-h-[300px] flex-col border-t border-[#E7E8EA] bg-[#FAFAFB] p-4 lg:border-l lg:border-t-0">
          {reference ? (
            <>
              <AssetMediaSurface reference={reference} onPreview={onPreview} className="min-h-[220px] flex-1 rounded-xl border border-[#E1E3E6]" imageClassName="drop-shadow-[0_6px_16px_rgba(22,24,35,0.08)]" />
              <div className="px-1 pb-1 pt-3">
                <p className="text-xs font-medium text-[#161823]/32">真实案例参考 · 不写入模板固定视觉</p>
                <p className="mt-1 text-sm font-semibold text-[#161823]/70">{referenceCase}</p>
                <p className="mt-1 truncate text-xs text-[#161823]/36">{reference.label} · {reference.specification}</p>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-[#DCDDDF] text-sm text-[#161823]/30">暂无视觉案例</div>
          )}
        </div>
      </div>
    </section>
  )
}

function assetInputStyle(role: string) {
  if (role.includes('品牌')) return 'border-blue-200 bg-blue-50 text-blue-700'
  if (role.includes('视觉')) return 'border-violet-200 bg-violet-50 text-violet-700'
  if (role.includes('玩法')) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (role.includes('内容')) return 'border-amber-200 bg-amber-50 text-amber-700'
  if (role.includes('数据') || role.includes('尺寸')) return 'border-cyan-200 bg-cyan-50 text-cyan-700'
  return 'border-[#DCDDDF] bg-[#F1F2F4] text-[#161823]/64'
}

function TemplateSystemMap({ item }: { item: AssetCatalogItem }) {
  const profile = item.templateProfile
  if (!profile) return null
  const map = profile.systemMap
  return (
    <section aria-label="活动运行与资产关系" className="mb-6 overflow-hidden rounded-[20px] border border-[#E3E4E6] bg-white">
      <div className="border-b border-[#ECEDEF] px-6 py-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[#161823]">活动组成</h2>
        <p className="mt-1 text-sm text-[#161823]/40">参与流程、使用资产与包含内容。</p>
      </div>

      <div className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#161823] px-2 py-1 text-xs font-semibold text-white">参与流程</span>
          <span className="text-xs text-[#161823]/34">从进入活动到完成参与</span>
        </div>
        <div className="thin-scroll mt-3 overflow-x-auto pb-1">
          <div className="flex min-w-[760px] items-stretch">
            {map.journey.map((step, index) => (
              <div key={step.label} className="contents">
                <div className="min-w-0 flex-1 rounded-xl border border-[#E5E6E8] bg-[#FAFAFB] px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#161823] text-xs font-semibold text-white">{index + 1}</span>
                    <p className="truncate text-sm font-semibold text-[#161823]/74">{step.label}</p>
                  </div>
                  <p className="mt-2 text-xs leading-[13px] text-[#161823]/40">{step.detail}</p>
                </div>
                {index < map.journey.length - 1 ? <span aria-hidden="true" className="grid w-7 shrink-0 place-items-center text-[15px] text-[#161823]/20">→</span> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#ECEDEF] bg-[#FAFAFB] px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#E8F1FF] px-2 py-1 text-xs font-semibold text-[#246BDB]">使用资产</span>
          <span className="text-xs text-[#161823]/34">页面、品牌、玩法与素材</span>
        </div>

        <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.15fr)_26px_190px_26px_minmax(220px,0.85fr)]">
          <div className="rounded-xl border border-[#E5E6E8] bg-white p-3.5">
            <p className="text-xs font-semibold text-[#161823]/48">本次项目选择的资产</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {map.assetInputs.map((input) => (
                <div key={`${input.label}-${input.role}`} className={`rounded-lg border px-2.5 py-2 ${assetInputStyle(input.role)}`}>
                  <p className="truncate text-xs font-semibold">{input.label}</p>
                  <p className="mt-0.5 text-xs opacity-60">负责{input.role}</p>
                </div>
              ))}
            </div>
          </div>

          <span aria-hidden="true" className="hidden place-items-center text-[18px] text-[#161823]/20 lg:grid">→</span>

          <div className="flex flex-col justify-center rounded-xl border border-[#E4E4E7] bg-white px-4 py-4 text-[#1C1F23]">
            <p className="text-sm font-semibold">活动配置</p>
            <p className="mt-1.5 text-xs leading-[13px] text-[#71717A]">组织活动阶段、页面与交付内容。</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {['组织', '玩法', '内容', '交付'].map((label) => <span key={label} className="rounded bg-[#F4F4F5] px-1.5 py-1 text-xs text-[#71717A]">{label}</span>)}
            </div>
          </div>

          <span aria-hidden="true" className="hidden place-items-center text-[18px] text-[#161823]/20 lg:grid">→</span>

          <div className="rounded-xl border border-[#E5E6E8] bg-white p-3.5">
            <p className="text-xs font-semibold text-[#161823]/48">包含内容</p>
            <div className="mt-2.5 space-y-2">
              {map.outputs.map((output) => (
                <div key={output.label} className="flex items-start gap-2.5 rounded-lg bg-[#F5F6F7] px-2.5 py-2">
                  <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#161823]/68">{output.label}</p>
                    <p className="mt-0.5 truncate text-xs text-[#161823]/34">{output.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AssetDetailPage({
  item,
  preview,
  registryLabel,
  onBack,
  onReturn,
  returnLabel,
  onCreateVersion,
  onCreateVariant,
  onUse,
  useLabel,
}: AssetDetailPageProps) {
  const [previewImage, setPreviewImage] = useState<AssetVisualReference | null>(null)

  const isActivityTemplate = item.assetClass === 'activity-template'
  const isPageTemplate = item.assetClass === 'page-template'
  const isStructuredBrandKit = Boolean(item.brandKitProfile || item.resourcePositionProfile)
  const isStructuredIpKit = Boolean(item.ipKitProfile)
  const isStructuredGameplayKit = Boolean(item.gameplayProfile)
  const allParameters = item.parameterGroups.flatMap((group) => group.parameters)
  const editableCount = allParameters.filter((parameter) => parameter.mode !== '固定规则').length
  const fixedCount = allParameters.length - editableCount
  const coreGroup = item.parameterGroups.find((group) => (
    isActivityTemplate
      ? group.name.includes('活动主流程')
      : /(核心|品牌身份|角色表现|玩法|视觉语言|场次内容)/.test(group.name)
  )) ?? item.parameterGroups[0]
  const componentGroup = isActivityTemplate
    ? item.parameterGroups.find((group) => group.name.includes('玩法组件'))
    : undefined
  const secondaryGroups = item.parameterGroups.filter((group) => group !== coreGroup && group !== componentGroup)
  const detailGroups = isActivityTemplate ? item.parameterGroups : secondaryGroups
  const mainRule = coreGroup?.parameters[0]
  const supportingRules = coreGroup?.parameters.slice(1, 7) ?? []

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col bg-[#F7F7F8]">
      <header className="flex h-[56px] shrink-0 items-center border-b border-[#E5E6E8] bg-white px-3 min-[1000px]:px-6">
        <button
          type="button"
          onClick={onReturn ?? onBack}
          className="mr-3 flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[#161823]/58 hover:bg-[#F3F4F5]"
          aria-label={onReturn ? `返回${returnLabel ?? '项目'}` : '返回资产中心'}
        >
          <ArrowLeft className="size-4" />
          {onReturn ? <span className="max-w-[132px] truncate text-sm">返回{returnLabel ?? '项目'}</span> : null}
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
          <button type="button" onClick={onBack} className="text-[#161823]/42 hover:text-[#161823]/72">资产中心</button>
          <span className="text-[#161823]/20">/</span>
          <span className="truncate font-medium text-[#161823]/66">{item.name}</span>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1.5 min-[1000px]:gap-2">
          {item.status !== '草稿' ? (
            <button type="button" onClick={onCreateVariant} title="创建变体" aria-label="创建变体" className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E0E1E3] bg-white px-2 text-sm font-medium text-[#161823]/64 hover:bg-[#F7F7F8] min-[1000px]:px-3">
              <Copy className="size-3.5" /> <span className="hidden min-[1000px]:inline">创建变体</span>
            </button>
          ) : null}
          <button type="button" onClick={onCreateVersion} title={item.status === '草稿' ? '继续编辑' : '新建版本'} aria-label={item.status === '草稿' ? '继续编辑' : '新建版本'} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E0E1E3] bg-white px-2 text-sm font-medium text-[#161823]/64 hover:bg-[#F7F7F8] min-[1000px]:px-3">
            <Pencil className="size-3.5" /> <span className="hidden min-[1000px]:inline">{item.status === '草稿' ? '继续编辑' : '新建版本'}</span>
          </button>
          <button type="button" onClick={onUse} title={useLabel ?? '用于当前项目'} aria-label={useLabel ?? '用于当前项目'} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-2.5 text-sm font-medium text-white hover:opacity-90 min-[1000px]:px-3.5">
            <Plus className="size-3.5" /> <span className="hidden min-[1000px]:inline">{useLabel ?? '用于当前项目'}</span>
          </button>
        </div>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 min-[1000px]:px-8 min-[1000px]:py-7">
        <div className="mx-auto max-w-[1360px]">
          {isStructuredBrandKit ? (
            <BrandKitDetail item={item} onPreview={setPreviewImage} />
          ) : isStructuredIpKit ? (
            <IpKitDetail item={item} onPreview={setPreviewImage} />
          ) : isStructuredGameplayKit ? (
            <GameplayKitDetail item={item} />
          ) : (
            <>
          {isActivityTemplate ? <TemplateDecisionHero item={item} onPreview={setPreviewImage} /> : isPageTemplate ? <PageTemplateRuntimeStage item={item} /> : <VisualStage item={item} preview={preview} onPreview={setPreviewImage} />}

          {!isActivityTemplate ? <section className="px-1 pb-7 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyle(item.status)}`}>{item.status}</span>
              <span className="rounded-md bg-[#EDEEF0] px-2 py-1 text-xs text-[#161823]/52">{ASSET_CLASS_LABEL[item.assetClass]}</span>
              <span className="text-sm text-[#161823]/34">v{item.version}</span>
            </div>
            <div className="mt-3 flex flex-col items-start gap-5 min-[1180px]:flex-row min-[1180px]:items-end min-[1180px]:justify-between min-[1180px]:gap-8">
              <div className="min-w-0">
                <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-[#161823]">{item.name}</h1>
                <p className="mt-2 max-w-[920px] text-[13px] leading-6 text-[#161823]/52">{item.summary}</p>
              </div>
              {item.visualReferences?.length ? (
                <div className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#E1E2E5] bg-[#E1E2E5]">
                  {item.metrics.slice(0, 3).map((metric) => (
                    <div key={metric.label} className="min-w-[112px] bg-white px-3 py-2.5">
                      <p className="text-xs text-[#161823]/34">{metric.label}</p>
                      <p className="mt-1 text-sm font-semibold text-[#161823]/72">{metric.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section> : <div className="h-6" />}

          {isActivityTemplate ? <ActivityTemplateSandbox item={item} /> : null}

          {isActivityTemplate ? <TemplateSystemMap item={item} /> : null}

          {!isActivityTemplate && coreGroup ? (
            <section className="rounded-[20px] border border-[#E3E4E6] bg-white p-6">
              <div className="flex items-start justify-between gap-8">
              <div>
                  <h2 className="text-xl font-semibold leading-7 text-[#1C1F23]">{isActivityTemplate ? '核心玩法与活动结构' : coreGroup.name}</h2>
                  <p className="mt-1.5 max-w-[760px] text-sm leading-[18px] text-[#161823]/42">{coreGroup.summary}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">{item.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-[#F1F2F4] px-2.5 py-1 text-xs text-[#161823]/46">{tag}</span>)}</div>
              </div>

              {mainRule ? (
                <div className="mt-5 rounded-xl border border-[#E4E4E7] bg-[#F5F7FA] px-5 py-4 text-[#1C1F23]">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white px-2 py-1 text-xs font-medium text-[#71717A]">{mainRule.label}</span>
                    <span className="text-xs text-[#A1A1AA]">{modeLabel(mainRule.mode)}</span>
                  </div>
                  <p className="mt-3 text-base font-medium leading-7">{mainRule.value}</p>
                </div>
              ) : null}

              {supportingRules.length ? (
                <div className="mt-3 grid grid-cols-2 gap-3 min-[1220px]:grid-cols-3">
                  {supportingRules.map((parameter) => (
                    <div key={parameter.label} className="rounded-xl border border-[#E7E8EA] bg-[#FAFAFB] px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#161823]/70">{parameter.label}</h3>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${MODE_STYLE[parameter.mode]}`}>{modeLabel(parameter.mode)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-[17px] text-[#161823]/52">{parameter.value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {componentGroup ? (
                <div className="mt-5 border-t border-[#ECEDEF] pt-5">
                  <div className="flex items-end justify-between gap-6">
                    <div><h3 className="text-[13px] font-semibold text-[#161823]">玩法组件</h3><p className="mt-1 text-xs text-[#161823]/36">组件挂在主流程节点上，可以按活动需要替换。</p></div>
                    <span className="text-xs text-[#161823]/34">{componentGroup.parameters.length} 个能力槽位</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 min-[1180px]:grid-cols-4">
                    {componentGroup.parameters.map((parameter) => (
                      <div key={parameter.label} className="rounded-xl border border-[#E7E8EA] px-3.5 py-3">
                        <div className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${parameter.mode === '引用资产' ? 'bg-amber-500' : 'bg-[#161823]/28'}`} /><h4 className="text-sm font-semibold text-[#161823]/66">{parameter.label}</h4></div>
                        <p className="mt-2 text-xs leading-4 text-[#161823]/44">{parameter.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {!isPageTemplate && item.visualReferences?.length ? (
            <section className="mt-6">
              <div className="flex items-end justify-between px-1">
                <div><h2 className="text-xl font-semibold leading-7 text-[#1C1F23]">使用案例</h2></div>
                <span className="text-xs text-[#161823]/34">{item.visualReferences.length} 个可追溯案例</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 min-[1180px]:grid-cols-3">
                {item.visualReferences.map((reference) => (
                  <figure key={reference.src} className="overflow-hidden rounded-2xl border border-[#E0E2E5] bg-white shadow-[0_4px_14px_rgba(31,35,41,0.035)] transition-shadow hover:shadow-[0_9px_24px_rgba(31,35,41,0.08)]">
                    <AssetMediaSurface reference={reference} onPreview={setPreviewImage} className="h-[240px] border-b border-[#E7E8EA]" imageClassName="drop-shadow-[0_5px_12px_rgba(22,24,35,0.08)]" />
                    <figcaption className="px-4 py-3.5">
                      <p className="truncate text-sm font-semibold text-[#161823]/72">{reference.label}</p>
                      <p className="mt-1 truncate text-xs text-[#161823]/36">{reference.specification}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : (
            <section className="mt-6 rounded-[20px] border border-[#E3E4E6] bg-white px-6 py-5">
              <h2 className="text-xl font-semibold leading-7 text-[#1C1F23]">使用情况</h2>
              <p className="mt-3 text-sm leading-5 text-[#161823]/50">{item.usage}</p>
            </section>
          )}

          <details className="group mt-6 overflow-hidden rounded-[20px] border border-[#E3E4E6] bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 hover:bg-[#FAFAFB]">
              <div><h2 className="text-base font-semibold text-[#1C1F23]">规格与文件</h2><p className="mt-1 text-xs text-[#71717A]">交付清单、参数、授权、质检和来源记录</p></div>
              <div className="flex items-center gap-3 text-xs text-[#161823]/40"><span>{item.deliverables.length} 项交付</span><span>{allParameters.length} 项参数</span><span className="rounded-full border border-[#DCDDDF] px-2.5 py-1 group-open:hidden">展开</span><span className="hidden rounded-full border border-[#DCDDDF] px-2.5 py-1 group-open:inline">收起</span></div>
            </summary>
            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)] gap-6 border-t border-[#ECEDEF] px-6 py-6">
              <div className="min-w-0 space-y-6">
                <section>
                  <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#161823]/72">交付内容</h3><span className="text-xs text-[#161823]/32">{item.deliverables.filter((entry) => entry.required).length} 项必需</span></div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-[#E7E8EA]">
                    {item.deliverables.map((deliverable, index) => (
                      <div key={deliverable.name} className={`grid grid-cols-[24px_160px_minmax(0,1fr)_56px] items-start gap-3 px-4 py-3 ${index ? 'border-t border-[#F0F0F2]' : ''}`}>
                        <CheckCircle2 className={`mt-0.5 size-3.5 ${deliverable.required ? 'text-emerald-600' : 'text-[#161823]/20'}`} />
                        <span className="text-sm font-medium text-[#161823]/62">{deliverable.name}</span>
                        <span className="text-xs leading-4 text-[#161823]/42">{deliverable.specification}</span>
                        <span className="text-xs text-[#161823]/30">{deliverable.required ? '必需' : '可选'}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {detailGroups.map((group) => (
                  <section key={group.name}>
                    <h3 className="text-sm font-semibold text-[#161823]/72">{group.name}</h3>
                    <p className="mt-1 text-xs text-[#161823]/34">{group.summary}</p>
                    <div className="mt-3 divide-y divide-[#F0F0F2] overflow-hidden rounded-xl border border-[#E7E8EA]">
                      {group.parameters.map((parameter) => (
                        <div key={parameter.label} className="grid grid-cols-[150px_86px_minmax(0,1fr)] gap-3 px-4 py-3">
                          <div className="flex items-start gap-1.5 text-sm font-medium text-[#161823]/58">{parameter.mode === '固定规则' ? <Lock className="mt-0.5 size-3 shrink-0 text-[#161823]/24" /> : null}{parameter.label}</div>
                          <span className={`inline-flex h-5 items-center justify-center rounded px-1.5 text-xs ${MODE_STYLE[parameter.mode]}`}>{modeLabel(parameter.mode)}</span>
                          <div><p className="text-sm leading-4 text-[#161823]/58">{parameter.value}</p>{parameter.note ? <p className="mt-1 text-xs leading-3 text-[#161823]/30">{parameter.note}</p> : null}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className="space-y-4">
                <section className="rounded-xl border border-[#E7E8EA] p-4">
                  <h3 className="text-sm font-semibold text-[#161823]/72">资产信息</h3>
                  <dl className="mt-3 divide-y divide-[#F0F0F2] text-xs">
                    {[['负责人', item.owner], ['存储域', registryLabel], ['更新日期', item.updatedAt], ['可调整', `${editableCount} 项`], ['固定规则', `${fixedCount} 项`]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-[#161823]/34">{label}</dt><dd className="text-right font-medium text-[#161823]/58">{value}</dd></div>)}
                  </dl>
                </section>
                <section className="rounded-xl border border-[#E7E8EA] p-4">
                  <div className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-[#161823]/42" /><h3 className="text-sm font-semibold text-[#161823]/72">质检与授权</h3></div>
                  <p className="mt-3 text-xs leading-4 text-[#161823]/44">{item.governance.qualityGate}</p>
                  <p className="mt-3 border-t border-[#F0F0F2] pt-3 text-xs leading-4 text-[#161823]/44">{item.governance.rights}</p>
                </section>
                <section className="rounded-xl border border-[#E7E8EA] p-4">
                  <h3 className="text-sm font-semibold text-[#161823]/72">来源与导入</h3>
                  <p className="mt-3 text-xs leading-4 text-[#161823]/44">{item.governance.source}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{item.governance.importFormats.map((format) => <span key={format} className="rounded bg-[#F1F2F4] px-2 py-1 text-xs text-[#161823]/44">{format}</span>)}</div>
                  <button type="button" onClick={onCreateVersion} className="mt-4 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-[#E0E1E3] text-sm font-medium text-[#161823]/58 hover:bg-[#F7F7F8]"><Upload className="size-3.5" /> 导入到新版本</button>
                </section>
              </aside>
            </div>
          </details>
            </>
          )}
        </div>
      </div>
      {previewImage ? <AssetImageDialog reference={previewImage} onClose={() => setPreviewImage(null)} returnLabel="返回资产详情" /> : null}
    </div>
  )
}
