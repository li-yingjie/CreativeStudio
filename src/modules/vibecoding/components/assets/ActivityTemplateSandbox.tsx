import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronRight, RotateCcw } from '@/shared/icons'
import type { AssetCatalogItem } from '../../assets/assetCatalog'

interface SandboxDefinition {
  slots: readonly string[]
  surfaces: readonly string[]
  defaultSlots: readonly string[]
}

const SANDBOX_DEFINITIONS: Record<string, SandboxDefinition> = {
  'template.ip-co-brand-dual-venue-event': {
    slots: ['榜单互动', '助力', '任务', '阶段结算'],
    surfaces: ['Lynx 主会场', 'H5 分会场', '资源位', '节目单', '战报'],
    defaultSlots: ['榜单互动', '助力', '任务'],
  },
  'template.channel-resource-pack-no-page': {
    slots: ['搜索承接', '话题入口', '活动中心', '开屏'],
    surfaces: ['搜索 Banner', '话题头图', '活动中心卡片', '开屏', '业务频道入口'],
    defaultSlots: ['搜索承接', '话题入口', '活动中心'],
  },
  'template.live-program-asset-pack': {
    slots: ['主机位', '竖屏', '字幕', '手语'],
    surfaces: ['直播封面', '竖版频道图', '节目单元封面', '行政横屏', '行政竖屏'],
    defaultSlots: ['主机位', '竖屏', '手语'],
  },
  'template.program-gala-omnichannel': {
    slots: ['直播', '节目单', '任务抽奖', '祝福结果卡'],
    surfaces: ['Lynx 主会场', 'H5 互动', '直播频道', '资源位', '线下屏'],
    defaultSlots: ['直播', '节目单', '任务抽奖'],
  },
  'template.film-ip-task-card-draw': {
    slots: ['任务', '次数账本', '卡池', '图鉴', '分享卡'],
    surfaces: ['Lynx 抽卡主会场', '任务页', '图鉴', '结果卡', '搜索资源位'],
    defaultSlots: ['任务', '次数账本', '卡池', '图鉴'],
  },
}

const SCALE_OPTIONS = [
  { label: '轻量', factor: 0.7 },
  { label: '标准', factor: 1 },
  { label: '大型', factor: 1.45 },
] as const

function metricNumber(value: string, fallback: number) {
  const match = value.match(/(\d+)/)
  return match ? Number(match[1]) : fallback
}

export default function ActivityTemplateSandbox({ item }: { item: AssetCatalogItem }) {
  const profile = item.templateProfile
  const definition = SANDBOX_DEFINITIONS[item.id]
  const [scale, setScale] = useState(1)
  const [activeStep, setActiveStep] = useState(0)
  const [activeSurface, setActiveSurface] = useState(0)
  const [enabledSlots, setEnabledSlots] = useState<string[]>(() => [...(definition?.defaultSlots ?? [])])
  const zeroPage = item.metrics.some((metric) => metric.label === '新增页面' && metric.value === '0 个')

  const estimatedOutputs = useMemo(() => {
    const metric = item.metrics.find((entry) => /(交付|物料|画幅)/.test(entry.label))
    const base = metricNumber(metric?.value ?? '', definition?.surfaces.length ?? 4)
    return Math.max(definition?.surfaces.length ?? 1, Math.round(base * SCALE_OPTIONS[scale].factor))
  }, [definition?.surfaces.length, item.metrics, scale])

  if (!profile || !definition) return null

  const reset = () => {
    setScale(1)
    setActiveStep(0)
    setActiveSurface(0)
    setEnabledSlots([...definition.defaultSlots])
  }

  const toggleSlot = (slot: string) => {
    setEnabledSlots((current) => current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot])
  }

  const advance = () => setActiveStep((current) => (current + 1) % profile.systemMap.journey.length)

  return (
    <section aria-label={`${item.name}模板试用`} className="mb-6 overflow-hidden rounded-[20px] border border-[#E3E4E6] bg-white shadow-[0_8px_26px_rgba(31,35,41,0.04)]">
      <header className="flex items-start justify-between gap-6 border-b border-[#ECEDEF] px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">可试用</span>
            <span className="text-[9px] text-[#161823]/34">结构运行态 · 不携带案例品牌与成片</span>
          </div>
          <h2 className="mt-2 text-[16px] font-semibold tracking-[-0.01em] text-[#161823]">先试清楚模板怎么跑</h2>
          <p className="mt-1 text-[10px] leading-4 text-[#161823]/40">调整规模和能力槽位，右侧立即重算主路径与交付范围；这是模板的组织能力，不是静态视觉预览。</p>
        </div>
        <button type="button" onClick={reset} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#E0E1E3] px-3 text-[9px] font-medium text-[#161823]/52 hover:bg-[#F7F7F8]"><RotateCcw className="size-3" />重置试用</button>
      </header>

      <div className="grid min-h-[430px] lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-[#ECEDEF] bg-[#FAFAFB] p-5 lg:border-b-0 lg:border-r">
          <p className="text-[9px] font-semibold text-[#161823]/48">活动规模</p>
          <div className="mt-2 grid grid-cols-3 rounded-xl border border-[#E3E4E6] bg-white p-1">
            {SCALE_OPTIONS.map((option, index) => (
              <button key={option.label} type="button" aria-pressed={scale === index} onClick={() => setScale(index)} className={`h-8 rounded-lg text-[9px] font-medium ${scale === index ? 'bg-[#161823] text-white' : 'text-[#161823]/44 hover:bg-[#F3F4F5]'}`}>{option.label}</button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-[9px] font-semibold text-[#161823]/48">能力槽位</p>
            <span className="text-[8px] text-[#161823]/30">{enabledSlots.length} / {definition.slots.length} 已启用</span>
          </div>
          <div className="mt-2 space-y-2">
            {definition.slots.map((slot) => {
              const enabled = enabledSlots.includes(slot)
              return (
                <button key={slot} type="button" aria-pressed={enabled} onClick={() => toggleSlot(slot)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${enabled ? 'border-[#B9CFFF] bg-[#EFF5FF]' : 'border-[#E4E5E7] bg-white'}`}>
                  <span className={`grid size-5 shrink-0 place-items-center rounded-md text-[9px] ${enabled ? 'bg-[#357EF8] text-white' : 'bg-[#F0F1F2] text-[#161823]/28'}`}>{enabled ? '✓' : '+'}</span>
                  <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[#161823]/66">{slot}</span>
                  <span className="text-[8px] text-[#161823]/28">{enabled ? '已挂载' : '可选'}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-[9px] font-semibold text-amber-800">发布前仍需接入</p>
            <p className="mt-1 text-[8px] leading-4 text-amber-700/68">具体品牌、内容、Surface 尺寸、业务 ID、概率/库存/履约等真实数据不会由模板替你猜。</p>
          </div>
        </aside>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#161823] px-2 py-1 text-[8px] font-semibold text-white">{zeroPage ? '交付矩阵运行态' : '活动主路径运行态'}</span>
            <span className="text-[9px] text-[#161823]/34">预计 {estimatedOutputs} 项交付 · {enabledSlots.length} 个能力槽位</span>
          </div>

          {zeroPage ? (
            <div className="mt-4 rounded-2xl border border-[#E2E4E7] bg-[#F4F5F7] p-4 sm:p-5">
              <div className="flex items-end justify-between gap-6">
                <div><p className="text-[9px] text-[#161823]/36">当前查看的 Surface</p><h3 className="mt-1 text-[19px] font-semibold text-[#161823]">{definition.surfaces[activeSurface]}</h3></div>
                <span className="rounded-full bg-white px-3 py-1.5 text-[8px] text-[#161823]/46 shadow-sm">不新增 H5 / Lynx</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
                {definition.surfaces.map((surface, index) => (
                  <button key={surface} type="button" onClick={() => setActiveSurface(index)} className={`min-h-[108px] rounded-xl border p-3 text-left transition ${activeSurface === index ? 'border-[#357EF8] bg-white shadow-[0_6px_18px_rgba(53,126,248,0.1)]' : 'border-[#E0E2E5] bg-white/68 hover:bg-white'}`}>
                    <span className="flex items-center justify-between"><span className={`grid size-6 place-items-center rounded-lg text-[8px] ${activeSurface === index ? 'bg-[#357EF8] text-white' : 'bg-[#EDEEF0] text-[#161823]/42'}`}>{index + 1}</span>{index < estimatedOutputs ? <CheckCircle2 className="size-3.5 text-emerald-600" /> : null}</span>
                    <span className="mt-4 block text-[10px] font-semibold text-[#161823]/68">{surface}</span>
                    <span className="mt-1 block text-[8px] text-[#161823]/36">独立尺寸、职责与验收状态</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#161823] px-4 py-3 text-white">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-[9px]">{activeSurface + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold">{definition.surfaces[activeSurface]}交付合同</p><p className="mt-0.5 truncate text-[8px] text-white/42">尺寸、文案职责、承接链接、Owner 与审核状态分别登记</p></div>
                <ChevronRight className="size-4 text-white/34" />
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-2xl border border-[#E2E4E7] bg-[#F4F5F7] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] text-[#161823]/36">正在体验</p><h3 className="mt-1 text-[19px] font-semibold text-[#161823]">{profile.systemMap.journey[activeStep].label}</h3></div><span className="rounded-full bg-white px-3 py-1.5 text-[8px] text-[#161823]/46 shadow-sm">{activeStep + 1} / {profile.systemMap.journey.length}</span></div>
                <p className="mt-2 text-[10px] leading-5 text-[#161823]/46">{profile.systemMap.journey[activeStep].detail}</p>
                <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {profile.systemMap.journey.map((step, index) => (
                    <button key={step.label} type="button" onClick={() => setActiveStep(index)} aria-label={`体验步骤 ${index + 1}：${step.label}`} className={`grid size-8 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${index === activeStep ? 'bg-[#161823] text-white' : index < activeStep ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-[#161823]/34'}`}>{index < activeStep ? '✓' : index + 1}</button>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-white p-4 shadow-[0_8px_22px_rgba(31,35,41,0.06)]">
                  <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl text-[10px] font-bold text-white" style={{ backgroundColor: item.accent }}>{activeStep + 1}</span><div><p className="text-[11px] font-semibold text-[#161823]/72">{profile.systemMap.journey[activeStep].label}</p><p className="mt-0.5 text-[8px] text-[#161823]/34">当前节点会读取已启用能力和项目数据</p></div></div>
                  <div className="mt-4 grid grid-cols-2 gap-2">{enabledSlots.slice(0, 4).map((slot) => <span key={slot} className="rounded-lg bg-[#F3F4F6] px-2.5 py-2 text-[8px] font-medium text-[#161823]/52">{slot}</span>)}</div>
                  <button type="button" onClick={advance} className="mt-4 h-10 w-full rounded-xl text-[10px] font-semibold text-white" style={{ backgroundColor: item.accent }}>{activeStep === profile.systemMap.journey.length - 1 ? '重新体验主路径' : '完成当前动作，进入下一步'}</button>
                </div>
              </div>

              <aside className="rounded-2xl border border-[#E2E4E7] bg-white p-4">
                <p className="text-[9px] font-semibold text-[#161823]/48">本次试用生成范围</p>
                <div className="mt-3 space-y-2">{definition.surfaces.map((surface, index) => <div key={surface} className="flex items-center gap-2 rounded-lg bg-[#F5F6F7] px-2.5 py-2"><CheckCircle2 className={`size-3 shrink-0 ${index < Math.ceil(definition.surfaces.length * SCALE_OPTIONS[scale].factor) ? 'text-emerald-600' : 'text-[#161823]/18'}`} /><span className="min-w-0 flex-1 truncate text-[8px] text-[#161823]/52">{surface}</span></div>)}</div>
                <div className="mt-4 border-t border-[#ECEDEF] pt-4"><p className="text-[9px] font-semibold text-[#161823]/48">模板不会固定</p><p className="mt-1.5 text-[8px] leading-4 text-[#161823]/36">品牌视觉、IP、活动文案和最终成片；它只提供组织方式、槽位和交付合同。</p></div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
