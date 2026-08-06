import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Info,
  Lock,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from '@/shared/icons'
import {
  ASSET_CATALOG,
  ASSET_CLASS_LABEL,
  type AssetCatalogItem,
  type AssetCenterCategory,
  type AssetClass,
  type AssetDeliverable,
  type AssetParameterGroup,
  type AssetParameterMode,
} from '../../assets/assetCatalog'

export type AssetFormIntent = 'create' | 'version' | 'variant'

interface AssetFormPageProps {
  intent: AssetFormIntent
  category: AssetCenterCategory
  source?: AssetCatalogItem
  onCancel: () => void
  onSave: (asset: AssetCatalogItem) => void
}

const FIELD_CLASS = 'h-9 w-full rounded-lg border border-[#E1E2E5] bg-white px-3 text-[12px] text-[#161823] outline-none placeholder:text-[#161823]/28 focus:border-[#161823]/36 focus:ring-2 focus:ring-[#161823]/[0.04]'
const TEXTAREA_CLASS = 'w-full resize-none rounded-lg border border-[#E1E2E5] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#161823] outline-none placeholder:text-[#161823]/28 focus:border-[#161823]/36 focus:ring-2 focus:ring-[#161823]/[0.04]'

const CATEGORY_CLASS: Record<AssetCenterCategory, readonly AssetClass[]> = {
  template: ['activity-template'],
  brand: ['brand-kit', 'character-kit', 'banner-template', 'live-room-kit', 'live-component'],
  style: ['style-profile', 'layer-template'],
  gameplay: ['gameplay-package'],
  font: ['font-family'],
}

const CATEGORY_LABEL: Record<AssetCenterCategory, string> = {
  template: '活动模板',
  brand: 'Brand Kit',
  style: '视觉能力',
  gameplay: '玩法库',
  font: '字体库',
}

const MODE_STYLE: Record<AssetParameterMode, string> = {
  可配置: 'bg-blue-50 text-blue-700',
  'Agent 推断': 'bg-violet-50 text-violet-700',
  引用资产: 'bg-amber-50 text-amber-700',
  固定规则: 'bg-[#F1F2F4] text-[#161823]/50',
}

const COVERAGE_OPTIONS = ['抖音', '抖音极速版', '站内 H5', '图片生成', '直播间', 'Figma'] as const

function cloneParameterGroups(groups: readonly AssetParameterGroup[]): AssetParameterGroup[] {
  return groups.map((group) => ({
    ...group,
    parameters: group.parameters.map((parameter) => ({ ...parameter })),
  }))
}

function cloneDeliverables(deliverables: readonly AssetDeliverable[]): AssetDeliverable[] {
  return deliverables.map((deliverable) => ({ ...deliverable }))
}

function nextDraftVersion(version: string) {
  return version.includes('-draft') ? version : `${version}-draft.1`
}

function getDefaultTemplate(category: AssetCenterCategory, assetClass?: AssetClass) {
  return ASSET_CATALOG.find((item) => item.assetClass === assetClass)
    ?? ASSET_CATALOG.find((item) => item.category === category)
    ?? ASSET_CATALOG[0]
}

export default function AssetFormPage({ intent, category, source, onCancel, onSave }: AssetFormPageProps) {
  const initialTemplate = source ?? getDefaultTemplate(category)
  const [assetClass, setAssetClass] = useState<AssetClass>(initialTemplate.assetClass)
  const [name, setName] = useState(intent === 'variant' ? `${initialTemplate.name} · 变体` : intent === 'create' ? '' : initialTemplate.name)
  const [summary, setSummary] = useState(intent === 'create' ? '' : initialTemplate.summary)
  const [owner, setOwner] = useState(initialTemplate.owner)
  const [version, setVersion] = useState(intent === 'create' ? '0.1.0' : intent === 'variant' ? `${initialTemplate.version}-variant.1` : initialTemplate.status === '草稿' ? initialTemplate.version : nextDraftVersion(initialTemplate.version))
  const [tags, setTags] = useState(intent === 'create' ? '' : initialTemplate.tags.join('、'))
  const [coverage, setCoverage] = useState<string[]>([...initialTemplate.coverage])
  const [parameterGroups, setParameterGroups] = useState<AssetParameterGroup[]>(cloneParameterGroups(initialTemplate.parameterGroups))
  const [deliverables, setDeliverables] = useState<AssetDeliverable[]>(cloneDeliverables(initialTemplate.deliverables))
  const [sourceText, setSourceText] = useState(intent === 'create' ? '' : initialTemplate.governance.source)
  const [evidence, setEvidence] = useState(intent === 'create' ? '' : initialTemplate.governance.evidence)
  const [rights, setRights] = useState(initialTemplate.governance.rights)
  const [qualityGate, setQualityGate] = useState(initialTemplate.governance.qualityGate)
  const [importFormats, setImportFormats] = useState(initialTemplate.governance.importFormats.join('、'))
  const [importedFiles, setImportedFiles] = useState<string[]>(source?.sourceFiles?.map((file) => file.name) ?? [])

  const availableClasses = CATEGORY_CLASS[category]
  const selectedTemplate = useMemo(() => getDefaultTemplate(category, assetClass), [assetClass, category])
  const sectionChecks = useMemo(() => {
    const parametersComplete = parameterGroups.length > 0 && parameterGroups.every((group) => group.name.trim() && group.parameters.every((parameter) => parameter.label.trim() && parameter.value.trim()))
    const sourceContentReady = assetClass !== 'layer-template' || intent !== 'create' || importedFiles.length > 0
    return [
      { label: '基础信息', passed: Boolean(name.trim() && summary.trim() && owner.trim() && version.trim()), detail: '名称、用途、负责人、版本' },
      { label: '内容与交付', passed: deliverables.length > 0 && coverage.length > 0 && sourceContentReady, detail: assetClass === 'layer-template' ? '源结构、交付物、适用端' : '交付物、适用端、导入格式' },
      { label: '参数与规则', passed: parametersComplete, detail: '参数值、变更权限、固定边界' },
      { label: '授权与质检', passed: Boolean(sourceText.trim() && evidence.trim() && rights.trim() && qualityGate.trim()), detail: '来源证据、授权、自动检查' },
    ]
  }, [assetClass, coverage.length, deliverables.length, evidence, importedFiles.length, intent, name, owner, parameterGroups, qualityGate, rights, sourceText, summary, version])
  const passedCount = sectionChecks.filter((check) => check.passed).length

  const handleClassChange = (nextClass: AssetClass) => {
    const nextTemplate = getDefaultTemplate(category, nextClass)
    setAssetClass(nextClass)
    setParameterGroups(cloneParameterGroups(nextTemplate.parameterGroups))
    setDeliverables(cloneDeliverables(nextTemplate.deliverables))
    setCoverage([...nextTemplate.coverage])
    setOwner(nextTemplate.owner)
    setRights(nextTemplate.governance.rights)
    setQualityGate(nextTemplate.governance.qualityGate)
    setImportFormats(nextTemplate.governance.importFormats.join('、'))
    setImportedFiles([])
  }

  const updateParameterGroup = (groupIndex: number, patch: Partial<Pick<AssetParameterGroup, 'name' | 'summary'>>) => {
    setParameterGroups((current) => current.map((group, index) => index === groupIndex ? { ...group, ...patch } : group))
  }

  const updateParameter = (groupIndex: number, parameterIndex: number, patch: { label?: string; value?: string; note?: string }) => {
    setParameterGroups((current) => current.map((group, index) => {
      if (index !== groupIndex) return group
      return {
        ...group,
        parameters: group.parameters.map((parameter, innerIndex) => innerIndex === parameterIndex ? { ...parameter, ...patch } : parameter),
      }
    }))
  }

  const addParameter = (groupIndex: number) => {
    setParameterGroups((current) => current.map((group, index) => index === groupIndex
      ? { ...group, parameters: [...group.parameters, { label: '新参数', value: '待配置', mode: '可配置' }] }
      : group))
  }

  const removeParameter = (groupIndex: number, parameterIndex: number) => {
    if (!window.confirm('移除这个尚未发布的参数？')) return
    setParameterGroups((current) => current.map((group, index) => index === groupIndex
      ? { ...group, parameters: group.parameters.filter((_, innerIndex) => innerIndex !== parameterIndex) }
      : group))
  }

  const addParameterGroup = () => {
    setParameterGroups((current) => [...current, {
      name: '新参数组',
      summary: '说明这组参数控制的业务对象和使用边界',
      parameters: [{ label: '新参数', value: '待配置', mode: '可配置' }],
    }])
  }

  const updateDeliverable = (index: number, patch: Partial<AssetDeliverable>) => {
    setDeliverables((current) => current.map((deliverable, innerIndex) => innerIndex === index ? { ...deliverable, ...patch } : deliverable))
  }

  const removeDeliverable = (index: number) => {
    if (!window.confirm('移除这个尚未发布的交付物？')) return
    setDeliverables((current) => current.filter((_, innerIndex) => innerIndex !== index))
  }

  const toggleCoverage = (value: string) => {
    setCoverage((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  const handleCheck = () => {
    if (passedCount === sectionChecks.length) {
      toast.success('发布前业务检查通过', { description: '4 个配置域完整；仍需在发布流程中完成素材文件与授权原件校验。' })
      return
    }
    const missing = sectionChecks.filter((check) => !check.passed).map((check) => check.label).join('、')
    toast.warning(`还有 ${sectionChecks.length - passedCount} 项待补充`, { description: missing })
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('请先填写资产名称')
      return
    }
    if (assetClass === 'layer-template' && intent === 'create' && importedFiles.length === 0) {
      toast.error('请导入分层源结构', { description: '分层模板从真实项目或设计文件沉淀，不从空白画布创建。' })
      return
    }
    const date = new Date().toISOString().slice(0, 10)
    const newId = source?.status === '草稿' && intent === 'version'
      ? source.id
      : `${intent === 'create' ? 'draft' : source?.id ?? selectedTemplate.id}.${Date.now()}`
    const draft: AssetCatalogItem = {
      ...selectedTemplate,
      id: newId,
      category,
      assetClass,
      name: name.trim(),
      summary: summary.trim() || '待补充资产用途和适用边界',
      owner: owner.trim() || '待指定',
      version: version.trim() || '0.1.0',
      status: '草稿',
      updatedAt: date,
      tags: tags.split(/[、,，]/).map((tag) => tag.trim()).filter(Boolean),
      coverage,
      parameterGroups,
      deliverables,
      usage: '草稿版本，尚未被项目引用',
      basedOn: source ? source.status === '草稿' ? source.basedOn : { assetId: source.id, name: source.name, version: source.version } : undefined,
      sourceFiles: importedFiles.map((file) => ({
        name: file,
        format: file.includes('.') ? file.split('.').pop()?.toUpperCase() ?? 'FILE' : 'FILE',
        status: '待校验',
      })),
      governance: {
        source: sourceText.trim() || '待补充',
        evidence: evidence.trim() || '待补充',
        rights: rights.trim() || '待补充',
        qualityGate: qualityGate.trim() || '待补充',
        importFormats: importFormats.split(/[、,，]/).map((format) => format.trim()).filter(Boolean),
      },
    }
    onSave(draft)
    toast.success('草稿已保存', { description: '已打开新版本详情；不会覆盖当前已发布版本。' })
  }

  const title = intent === 'create' ? `新建${CATEGORY_LABEL[category]}资产` : intent === 'variant' ? '创建资产变体' : source?.status === '草稿' ? '继续编辑草稿' : '创建新版本'
  const subtitle = intent === 'create'
    ? '先选择资产类型，再基于同类资产契约补齐内容、参数与发布边界。'
    : source?.status === '草稿'
      ? `继续补充「${source.name} v${source.version}」；保存后仍保持草稿状态。`
      : `基于「${source?.name} v${source?.version}」创建独立草稿，原发布版本保持不变。`

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F7F8]">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[#E5E6E8] bg-white px-6">
        <button type="button" onClick={onCancel} className="mr-3 flex size-8 items-center justify-center rounded-lg text-[#161823]/58 hover:bg-[#F3F4F5]" aria-label="返回资产中心">
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[14px] font-semibold text-[#161823]">{title}</h1>
          <p className="mt-0.5 truncate text-[9px] text-[#161823]/36">{subtitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={handleCheck} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#E0E1E3] bg-white px-3 text-[11px] font-medium text-[#161823]/64 hover:bg-[#F7F7F8]">
            <ShieldCheck className="size-3.5" /> 发布前检查
          </button>
          <button type="button" onClick={handleSave} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-3.5 text-[11px] font-medium text-white hover:opacity-90">
            <Save className="size-3.5" /> 保存草稿
          </button>
        </div>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)_280px] items-start gap-5">
          <main className="min-w-0 space-y-4">
            <section id="basic" className="rounded-2xl border border-[#E5E6E8] bg-white p-5">
              <div>
                <h2 className="text-[14px] font-semibold text-[#161823]">1. 基础信息</h2>
                <p className="mt-1 text-[10px] text-[#161823]/38">资产类型决定可配置参数、交付物和质量门槛；创建后仍可在草稿阶段调整。</p>
              </div>

              <div className="mt-4">
                <label className="text-[10px] font-medium text-[#161823]/52">资产类型</label>
                {intent === 'create' ? (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {availableClasses.map((itemClass) => {
                      const active = itemClass === assetClass
                      return (
                        <button key={itemClass} type="button" onClick={() => handleClassChange(itemClass)} className={`flex min-h-12 items-center justify-between rounded-xl border px-3 text-left transition-colors ${active ? 'border-[#161823]/35 bg-[#F5F5F6]' : 'border-[#E5E6E8] bg-white hover:bg-[#FAFAFB]'}`}>
                          <span>
                            <span className="block text-[11px] font-medium text-[#161823]/74">{ASSET_CLASS_LABEL[itemClass]}</span>
                            <span className="mt-0.5 block text-[8px] text-[#161823]/34">继承同类契约</span>
                          </span>
                          {active ? <CheckCircle2 className="size-4 text-[#161823]/72" /> : null}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-2 flex h-12 items-center justify-between rounded-xl bg-[#F1F2F4] px-3.5">
                    <div><p className="text-[11px] font-medium text-[#161823]/66">{ASSET_CLASS_LABEL[assetClass]}</p><p className="mt-0.5 text-[8px] text-[#161823]/32">版本与变体不能改变资产类型，避免破坏下游引用契约</p></div>
                    <Lock className="size-3.5 text-[#161823]/28" />
                  </div>
                )}
              </div>

              {assetClass === 'layer-template' ? (
                <div className="mt-3 flex gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-violet-800">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  <p className="text-[9px] leading-[15px]">分层模板需从已验证的项目素材、Layer Manifest、Figma Frame 或 PSD 导入；平台不提供脱离业务实例的空白模板编辑器。</p>
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">资产名称 <span className="text-red-500">*</span></span>
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder={`例如：夏日活动${ASSET_CLASS_LABEL[assetClass]}`} className={`mt-1.5 ${FIELD_CLASS}`} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">负责人 <span className="text-red-500">*</span></span>
                  <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="团队或具体负责人" className={`mt-1.5 ${FIELD_CLASS}`} />
                </label>
                <label className="col-span-2 block">
                  <span className="text-[10px] font-medium text-[#161823]/52">用途与适用边界 <span className="text-red-500">*</span></span>
                  <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} placeholder="说明这项资产解决什么问题、谁会使用、不能用在哪里" className={`mt-1.5 ${TEXTAREA_CLASS}`} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">草稿版本</span>
                  <input value={version} onChange={(event) => setVersion(event.target.value)} className={`mt-1.5 ${FIELD_CLASS}`} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">检索标签</span>
                  <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="用顿号分隔，如：夏日、年轻化" className={`mt-1.5 ${FIELD_CLASS}`} />
                </label>
              </div>
            </section>

            <section id="content" className="rounded-2xl border border-[#E5E6E8] bg-white p-5">
              <h2 className="text-[14px] font-semibold text-[#161823]">2. 内容与交付</h2>
              <p className="mt-1 text-[10px] text-[#161823]/38">上传原始内容，明确下游真正拿到的文件、结构和必选规格。</p>

              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#CFD1D5] bg-[#FAFAFB] px-4 py-3.5 hover:bg-[#F7F7F8]">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#161823]/52 shadow-[inset_0_0_0_1px_#E5E6E8]"><Upload className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium text-[#161823]/68">导入源文件或结构化清单</span>
                  <span className="mt-0.5 block text-[9px] text-[#161823]/34">支持 {importFormats || selectedTemplate.governance.importFormats.join('、')}；当前原型仅记录文件名</span>
                </span>
                <span className="rounded-lg border border-[#E1E2E5] bg-white px-2.5 py-1.5 text-[9px] font-medium text-[#161823]/54">选择文件</span>
                <input type="file" multiple className="hidden" onChange={(event) => setImportedFiles(Array.from(event.target.files ?? []).map((file) => file.name))} />
              </label>
              {importedFiles.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">{importedFiles.map((file, index) => <span key={`${index}-${file}`} className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-700">{file}</span>)}</div>
              ) : null}

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[11px] font-semibold text-[#161823]/72">交付物清单</h3>
                  <p className="mt-0.5 text-[9px] text-[#161823]/34">规格会成为生成、导出和发布检查的共同契约。</p>
                </div>
                <button type="button" onClick={() => setDeliverables((current) => [...current, { name: '新交付物', specification: '待补充文件格式、尺寸或结构', required: false }])} className="flex h-7 items-center gap-1 rounded-lg border border-[#E1E2E5] px-2.5 text-[9px] font-medium text-[#161823]/56 hover:bg-[#F7F7F8]"><Plus className="size-3" /> 添加交付物</button>
              </div>
              <div className="mt-2 overflow-hidden rounded-xl border border-[#E5E6E8]">
                {deliverables.map((deliverable, index) => (
                  <div key={index} className={`grid grid-cols-[22px_180px_minmax(0,1fr)_30px] items-center gap-2 px-3 py-2.5 ${index ? 'border-t border-[#EFEFF1]' : ''}`}>
                    <input type="checkbox" checked={deliverable.required} onChange={(event) => updateDeliverable(index, { required: event.target.checked })} aria-label={`${deliverable.name}是否必需`} />
                    <input value={deliverable.name} onChange={(event) => updateDeliverable(index, { name: event.target.value })} className="h-8 rounded-md border border-transparent bg-[#F7F7F8] px-2 text-[10px] font-medium text-[#161823]/68 outline-none focus:border-[#D9DADE] focus:bg-white" />
                    <input value={deliverable.specification} onChange={(event) => updateDeliverable(index, { specification: event.target.value })} className="h-8 min-w-0 rounded-md border border-transparent bg-[#F7F7F8] px-2 text-[10px] text-[#161823]/52 outline-none focus:border-[#D9DADE] focus:bg-white" />
                    <button type="button" onClick={() => removeDeliverable(index)} className="flex size-7 items-center justify-center rounded-md text-[#161823]/26 hover:bg-red-50 hover:text-red-600" aria-label={`移除${deliverable.name}`}><Trash2 className="size-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <h3 className="text-[11px] font-semibold text-[#161823]/72">适用端与生产场景</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COVERAGE_OPTIONS.map((option) => (
                    <button key={option} type="button" aria-pressed={coverage.includes(option)} onClick={() => toggleCoverage(option)} className={`h-7 rounded-full px-3 text-[9px] transition-colors ${coverage.includes(option) ? 'bg-[#161823] text-white' : 'bg-[#F1F2F4] text-[#161823]/48 hover:bg-[#E9EAEC]'}`}>{option}</button>
                  ))}
                </div>
              </div>
            </section>

            <section id="parameters" className="rounded-2xl border border-[#E5E6E8] bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#161823]">3. 参数与规则</h2>
                  <p className="mt-1 text-[10px] text-[#161823]/38">按业务对象分组；固定规则来自资产契约，普通编辑者不能在版本表单中绕过。</p>
                </div>
                <button type="button" onClick={addParameterGroup} className="flex h-7 items-center gap-1 rounded-lg border border-[#E1E2E5] px-2.5 text-[9px] font-medium text-[#161823]/56 hover:bg-[#F7F7F8]"><Plus className="size-3" /> 添加参数组</button>
              </div>
              <div className="mt-4 space-y-3">
                {parameterGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="overflow-hidden rounded-xl border border-[#E3E4E7]">
                    <div className="grid grid-cols-[180px_minmax(0,1fr)_auto] gap-2 border-b border-[#ECEDEF] bg-[#FAFAFB] px-3 py-2.5">
                      <input value={group.name} onChange={(event) => updateParameterGroup(groupIndex, { name: event.target.value })} className="h-8 rounded-md border border-transparent bg-white px-2 text-[11px] font-semibold text-[#161823]/72 outline-none focus:border-[#D9DADE]" />
                      <input value={group.summary} onChange={(event) => updateParameterGroup(groupIndex, { summary: event.target.value })} className="h-8 min-w-0 rounded-md border border-transparent bg-white px-2 text-[9px] text-[#161823]/42 outline-none focus:border-[#D9DADE]" />
                      <button type="button" onClick={() => addParameter(groupIndex)} className="flex h-8 items-center gap-1 rounded-md px-2 text-[9px] font-medium text-blue-600 hover:bg-blue-50"><Plus className="size-3" /> 添加参数</button>
                    </div>
                    <div className="divide-y divide-[#EFEFF1]">
                      {group.parameters.map((parameter, parameterIndex) => {
                        const editable = parameter.mode !== '固定规则'
                        return (
                          <div key={parameterIndex} className={`grid grid-cols-[150px_82px_minmax(0,1fr)_30px] items-start gap-2 px-3 py-2.5 ${editable ? 'bg-white' : 'bg-[#FAFAFB]'}`}>
                            {editable ? (
                              <input value={parameter.label} onChange={(event) => updateParameter(groupIndex, parameterIndex, { label: event.target.value })} className="h-8 rounded-md border border-[#E4E5E7] px-2 text-[10px] font-medium text-[#161823]/62 outline-none focus:border-[#161823]/30" />
                            ) : (
                              <div className="flex h-8 items-center gap-1.5 px-2 text-[10px] font-medium text-[#161823]/44"><Lock className="size-3" />{parameter.label}</div>
                            )}
                            <span className={`mt-1 inline-flex h-6 items-center justify-center rounded px-1.5 text-[8px] ${MODE_STYLE[parameter.mode]}`}>{parameter.mode}</span>
                            <div className="min-w-0">
                              {editable ? (
                                <input value={parameter.value} onChange={(event) => updateParameter(groupIndex, parameterIndex, { value: event.target.value })} className="h-8 w-full rounded-md border border-[#E4E5E7] px-2 text-[10px] text-[#161823]/62 outline-none focus:border-[#161823]/30" />
                              ) : (
                                <div className="flex min-h-8 items-center rounded-md bg-[#F1F2F4] px-2 text-[10px] text-[#161823]/42">{parameter.value}</div>
                              )}
                              {parameter.note ? <p className="mt-1 text-[8px] leading-3 text-[#161823]/30">{parameter.note}</p> : null}
                            </div>
                            {editable ? <button type="button" onClick={() => removeParameter(groupIndex, parameterIndex)} className="flex size-7 items-center justify-center rounded-md text-[#161823]/24 hover:bg-red-50 hover:text-red-600" aria-label={`移除${parameter.label}`}><Trash2 className="size-3" /></button> : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="governance" className="rounded-2xl border border-[#E5E6E8] bg-white p-5">
              <h2 className="text-[14px] font-semibold text-[#161823]">4. 来源、授权与发布门槛</h2>
              <p className="mt-1 text-[10px] text-[#161823]/38">这些信息进入资产版本记录，供 Agent 选材、审核和问题追溯共同使用。</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">沉淀来源 <span className="text-red-500">*</span></span>
                  <textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={3} placeholder="Skill、设计规范、业务文档或历史项目" className={`mt-1.5 ${TEXTAREA_CLASS}`} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">可信证据 <span className="text-red-500">*</span></span>
                  <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} rows={3} placeholder="版本号、维护人、Golden 样例或回归记录" className={`mt-1.5 ${TEXTAREA_CLASS}`} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">授权范围 <span className="text-red-500">*</span></span>
                  <textarea value={rights} onChange={(event) => setRights(event.target.value)} rows={3} placeholder="允许的渠道、业务、地域和有效期" className={`mt-1.5 ${TEXTAREA_CLASS}`} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-medium text-[#161823]/52">自动质量门槛 <span className="text-red-500">*</span></span>
                  <textarea value={qualityGate} onChange={(event) => setQualityGate(event.target.value)} rows={3} placeholder="发布前必须执行的结构、视觉或数据检查" className={`mt-1.5 ${TEXTAREA_CLASS}`} />
                </label>
                <label className="col-span-2 block">
                  <span className="text-[10px] font-medium text-[#161823]/52">允许导入格式</span>
                  <input value={importFormats} onChange={(event) => setImportFormats(event.target.value)} placeholder="PNG、SVG、JSON" className={`mt-1.5 ${FIELD_CLASS}`} />
                </label>
              </div>
            </section>
          </main>

          <aside className="sticky top-0 space-y-3">
            <div className="rounded-2xl border border-[#E5E6E8] bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-semibold text-[#161823]">草稿完整度</h2>
                <span className="text-[11px] font-semibold text-[#161823]/68">{passedCount} / {sectionChecks.length}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ECEDEF]"><div className="h-full rounded-full bg-[#161823] transition-all" style={{ width: `${passedCount / sectionChecks.length * 100}%` }} /></div>
              <div className="mt-3 divide-y divide-[#EFEFF1]">
                {sectionChecks.map((check, index) => (
                  <a key={check.label} href={`#${['basic', 'content', 'parameters', 'governance'][index]}`} className="flex items-start gap-2 py-2.5">
                    <CheckCircle2 className={`mt-0.5 size-3.5 shrink-0 ${check.passed ? 'text-emerald-600' : 'text-[#161823]/18'}`} />
                    <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-[#161823]/62">{check.label}</span><span className="mt-0.5 block text-[8px] text-[#161823]/30">{check.detail}</span></span>
                    <ChevronRight className="mt-0.5 size-3 text-[#161823]/20" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E6E8] bg-white p-4">
              <h2 className="text-[12px] font-semibold text-[#161823]">版本策略</h2>
              <div className="mt-3 flex gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-blue-800">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                <p className="text-[9px] leading-[15px]">保存只会生成草稿。发布后参数、文件和授权记录会一起冻结；下一次调整必须再创建新版本。</p>
              </div>
              <dl className="mt-3 space-y-2 text-[9px]">
                <div className="flex justify-between gap-3"><dt className="text-[#161823]/34">来源版本</dt><dd className="truncate text-[#161823]/56">{source ? `v${source.version}` : '新资产'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#161823]/34">草稿版本</dt><dd className="truncate font-medium text-[#161823]/68">v{version}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-[#161823]/34">变更方式</dt><dd className="text-[#161823]/56">{intent === 'variant' ? '独立变体' : intent === 'version' ? '新版本' : '首次创建'}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
