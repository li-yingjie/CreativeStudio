import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Box,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  FileText,
  Headphones,
  Image,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from '@/shared/icons'
import {
  type KnowledgeFileItem,
  type ModelResourceDetail,
  type ResourceItem,
  type ResourceParameter,
  type ResourceTabKey,
  resourceTabOptions,
  resources,
  resourcesForTab,
} from './resources-data'

export interface ResourceReference {
  id: string
  name: string
  kind: ResourceTabKey
}

const TAB_META: Record<ResourceTabKey, { label: string; singular: string }> = {
  toolbox: { label: '工具箱', singular: '工具' },
  knowledge: { label: '知识库', singular: '知识' },
  model: { label: '模型库', singular: '模型' },
}

const GROUP_STYLE: Record<string, { bg: string; ink: string }> = {
  抖音: { bg: '#E9F2FF', ink: '#3268A8' },
  通用能力: { bg: '#EDF0F3', ink: '#4C5967' },
  内容创作: { bg: '#F6EDE6', ink: '#8A5E3C' },
  开发工具: { bg: '#E9F3EF', ink: '#33715B' },
  'H5 页面开发': { bg: '#EAF1FF', ink: '#315FA9' },
  活动设计: { bg: '#F4EEE4', ink: '#86623A' },
  'Native 页面开发': { bg: '#E8F3F5', ink: '#2C6D78' },
  视觉设计: { bg: '#F0EAF6', ink: '#6D4C8C' },
  玩法库: { bg: '#F3EAF5', ink: '#765287' },
  页面组件库: { bg: '#EAF1FF', ink: '#315FA9' },
  字体库: { bg: '#F4EEE4', ink: '#86623A' },
  基础模型: { bg: '#ECEFF4', ink: '#485A73' },
  多模态生成模型: { bg: '#F3EAEF', ink: '#84506B' },
}

function styleFor(item: ResourceItem) {
  return GROUP_STYLE[item.group] ?? { bg: '#EFF0F2', ink: '#4F5662' }
}

function ResourceIcon({ item, size = 18 }: { item: ResourceItem; size?: number }) {
  const props = { size, strokeWidth: 1.8 }
  if (item.tab === 'model') return <Cpu {...props} />
  if (item.tab === 'knowledge') return <BookOpen {...props} />
  if (item.category.includes('图片')) return <Image {...props} />
  if (item.category.includes('数据') || item.title.includes('查询') || item.title.includes('搜索')) return <Database {...props} />
  if (item.category.includes('开发')) return <Code2 {...props} />
  return <Box {...props} />
}

function StateTag({ state }: { state: string }) {
  const ready = state === '已有' || state === '已有系统知识'
  return <span className={`inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium ${ready ? 'bg-[#E7F6EF] text-[#137A52]' : 'bg-[#FFF3DC] text-[#8A5B18]'}`}>{state}</span>
}

function ResourceCover({ item }: { item: ResourceItem }) {
  const style = styleFor(item)
  const asset = item.sourceAsset
  const image = asset?.thumbnail ?? asset?.visualReferences?.[0]?.src
  if (image) {
    return (
      <div className="relative h-[132px] overflow-hidden bg-[#F1F2F4]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]" />
        <span className="absolute left-3 top-3 inline-flex h-6 items-center gap-1.5 rounded-md bg-white/92 px-2 text-[11px] font-medium text-[#1C1F23] shadow-sm backdrop-blur"><ResourceIcon item={item} size={12} />{item.group}</span>
      </div>
    )
  }
  return (
    <div className="relative flex h-[108px] items-center justify-center overflow-hidden" style={{ background: style.bg }}>
      <span aria-hidden className="absolute -left-8 top-4 h-12 w-32 rotate-[-12deg] rounded-full bg-white/30" />
      <span aria-hidden className="absolute -bottom-10 right-0 size-28 rounded-full border-[22px] border-white/30" />
      <div className="relative flex h-12 max-w-[calc(100%-28px)] items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3.5 shadow-[0_3px_10px_rgba(31,35,41,0.07)]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: style.bg, color: style.ink }}><ResourceIcon item={item} size={15} /></span>
        <span className="truncate text-[13px] font-medium text-[#1C1F23]">{item.title}</span>
      </div>
    </div>
  )
}

function DetailShell({ children }: { children: ReactNode }) {
  return <div className="thin-scroll h-full overflow-y-auto bg-[#F3F4F7] p-3"><article className="min-h-full rounded-2xl bg-white px-7 pb-10 pt-5">{children}</article></div>
}

function DetailIcon({ item }: { item: ResourceItem }) {
  return <span className="flex size-[78px] shrink-0 items-center justify-center rounded-2xl bg-[#E3E7FF] text-[#5968DF]"><ResourceIcon item={item} size={34} /></span>
}

function ParameterTable({ parameters }: { parameters: readonly ResourceParameter[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(45,66,107,0.14)]">
      <div className="grid grid-cols-[280px_188px_minmax(320px,1fr)] border-b border-[rgba(45,66,107,0.12)] bg-[#FAFAFB] px-4 py-3 text-[12px] font-medium text-[#1C1F23]/58">
        <span>参数名称</span><span>参数类型</span><span>描述</span>
      </div>
      {parameters.length ? parameters.map((parameter) => (
        <div key={parameter.name} className="grid min-h-[62px] grid-cols-[280px_188px_minmax(320px,1fr)] items-center border-b border-[rgba(45,66,107,0.10)] px-4 text-[13px] text-[#1C1F23] last:border-b-0">
          <span className="flex items-center gap-2 font-mono">{parameter.expandable ? <ChevronRight size={13} className="text-[#1C1F23]/45" /> : <span className="w-[13px]" />}{parameter.name}{parameter.required && <b className="font-sans font-medium text-[#F05252]">*</b>}</span>
          <span><em className="rounded-md border border-[rgba(45,66,107,0.14)] bg-[#FAFAFB] px-2 py-1 font-mono text-[11px] not-italic">{parameter.type}</em></span>
          <span className="leading-5 text-[#1C1F23]/78">{parameter.description}</span>
        </div>
      )) : <div className="flex h-[90px] items-center justify-center text-[12px] text-[#1C1F23]/38">暂无参数</div>}
    </div>
  )
}

function ToolResourceDetail({ item, onBack }: { item: ResourceItem; onBack: () => void }) {
  return (
    <DetailShell>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex h-8 items-center gap-2 rounded-lg px-1.5 text-[13px] text-[#1C1F23]/55 hover:bg-black/[0.04]"><span>工具箱</span><ChevronRight size={13} /><span className="max-w-[280px] truncate text-[#1C1F23]/75">{item.title}</span></button>
        <button type="button" aria-label="帮助与支持" className="flex size-8 items-center justify-center rounded-lg text-[#1C1F23]/70 hover:bg-black/[0.04]"><Headphones size={17} /></button>
      </div>
      <header className="mt-8 flex items-start gap-5">
        <DetailIcon item={item} />
        <div className="min-w-0 pt-0.5">
          <h1 className="text-[20px] font-semibold tracking-[-0.2px] text-[#1C1F23]">{item.title}</h1>
          <p className="mt-2 max-w-[1100px] text-[13px] leading-6 text-[#1C1F23]/62">{item.summary ?? '暂无描述'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#1C1F23]/48">
            <span>ID: {item.externalId ?? item.id}</span><i className="h-3 w-px bg-[#1C1F23]/12" />
            {item.provider && <><span className="inline-flex items-center gap-1.5"><span className="flex size-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">♪</span>{item.provider}</span><i className="h-3 w-px bg-[#1C1F23]/12" /></>}
            {item.updatedAt && <><span>{item.updatedAt}</span><i className="h-3 w-px bg-[#1C1F23]/12" /></>}
            {(item.metrics ?? []).map((metric, index) => <span key={`${metric}-${index}`} className="inline-flex items-center gap-1.5">{index === 0 ? <Calendar size={13} /> : index === 1 ? <ArrowUpRight size={13} /> : <CheckCircle2 size={13} />}{metric}</span>)}
          </div>
        </div>
      </header>
      <div className="mt-9 inline-flex h-9 items-center gap-2 rounded-full bg-[#F3F4F6] px-4 text-[13px] font-medium text-[#1C1F23]"><Activity size={15} />{item.title}</div>
      <div className="mt-3 rounded-xl border border-[rgba(45,66,107,0.14)] px-5 py-4">
        <dl className="grid grid-cols-[100px_minmax(0,1fr)] text-[13px]"><dt className="text-[#1C1F23]/48">工具ID</dt><dd className="text-[#1C1F23]">{item.toolId ?? '暂无'}</dd></dl>
      </div>
      <section className="mt-7"><h2 className="mb-4 text-[15px] font-semibold text-[#1C1F23]">输入参数</h2><ParameterTable parameters={item.inputParameters ?? []} /></section>
      <section className="mt-7"><h2 className="mb-4 text-[15px] font-semibold text-[#1C1F23]">输出参数</h2><ParameterTable parameters={item.outputParameters ?? []} /></section>
    </DetailShell>
  )
}

function KnowledgeFileTable({ files }: { files: readonly KnowledgeFileItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(45,66,107,0.14)]">
      <div className="min-w-[1040px]">
        <div className="grid grid-cols-[2fr_120px_130px_100px_1.3fr_1.3fr] border-b border-[rgba(45,66,107,0.12)] bg-[#FAFAFB] px-4 py-3 text-[12px] font-medium text-[#1C1F23]/58"><span>文件名称</span><span>文件状态</span><span>自动更新状态</span><span>是否启用</span><span>创建人</span><span>更新人</span></div>
        {files.length ? files.map((file) => <div key={file.name} className="grid min-h-[76px] grid-cols-[2fr_120px_130px_100px_1.3fr_1.3fr] items-center px-4 text-[12px] text-[#1C1F23]">
          <span className="inline-flex items-center gap-2 font-medium"><FileText size={16} className="text-[#667085]" />{file.name}</span><span className="text-[#1C1F23]/62">{file.status}</span><span className="text-[#1C1F23]/62">{file.autoUpdate}</span>
          <span aria-label={file.enabled ? '已启用' : '未启用'} className={`relative h-5 w-9 rounded-full ${file.enabled ? 'bg-[#3370FF]' : 'bg-[#D9DCE3]'}`}><i className={`absolute top-0.5 size-4 rounded-full bg-white transition ${file.enabled ? 'left-[18px]' : 'left-0.5'}`} /></span>
          <span><b className="block font-normal">{file.createdBy}</b><small className="mt-1 block text-[10px] text-[#1C1F23]/42">创建于 {file.createdAt}</small></span><span><b className="block font-normal">{file.updatedBy}</b><small className="mt-1 block text-[10px] text-[#1C1F23]/42">更新于 {file.updatedAt}</small></span>
        </div>) : <div className="flex h-[140px] items-center justify-center text-[12px] text-[#1C1F23]/38">暂无文件</div>}
      </div>
    </div>
  )
}

function KnowledgeResourceDetail({ item, onBack }: { item: ResourceItem; onBack: () => void }) {
  const [view, setView] = useState<'files' | 'recall'>('files')
  return (
    <DetailShell>
      <div className="flex items-center justify-between"><button type="button" onClick={onBack} className="inline-flex h-8 items-center gap-2 rounded-lg px-1.5 text-[13px] text-[#1C1F23] hover:bg-black/[0.04]"><ArrowLeft size={15} />知识库</button><div className="flex items-center gap-1"><button type="button" aria-label="刷新" className="flex size-8 items-center justify-center rounded-lg text-[#1C1F23]/62 hover:bg-black/[0.04]"><RefreshCw size={16} /></button><button type="button" aria-label="帮助与支持" className="flex size-8 items-center justify-center rounded-lg text-[#1C1F23]/62 hover:bg-black/[0.04]"><Headphones size={16} /></button></div></div>
      <header className="mt-8 flex items-start gap-5"><DetailIcon item={item} /><div className="pt-0.5"><div className="flex items-center gap-2"><h1 className="text-[20px] font-semibold text-[#1C1F23]">{item.title}</h1><span className="rounded-md bg-[#F1F2F4] px-2 py-1 text-[11px] text-[#1C1F23]/58">{item.knowledgeKind ?? '知识'}</span></div><p className="mt-2 max-w-[1000px] text-[13px] leading-6 text-[#1C1F23]/62">{item.summary ?? '暂无描述'}</p></div></header>
      <nav className="mt-9 flex h-10 items-center gap-7 border-b border-[rgba(45,66,107,0.12)]" aria-label="知识库详情"><button type="button" onClick={() => setView('files')} className={`relative h-10 text-[13px] ${view === 'files' ? 'font-medium text-[#1C1F23]' : 'text-[#1C1F23]/48'}`}>文件列表{view === 'files' && <i className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1C1F23]" />}</button><button type="button" onClick={() => setView('recall')} className={`relative h-10 text-[13px] ${view === 'recall' ? 'font-medium text-[#1C1F23]' : 'text-[#1C1F23]/48'}`}>召回测试{view === 'recall' && <i className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1C1F23]" />}</button></nav>
      {view === 'files' ? <section className="mt-7"><div className="mb-4 flex items-center justify-between"><h2 className="text-[15px] font-semibold text-[#1C1F23]">文件列表</h2><label className="relative w-[260px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1F23]/35" /><input type="search" aria-label="文件名称" placeholder="文件名称" className="h-8 w-full rounded-lg border border-[rgba(45,66,107,0.14)] pl-8 pr-3 text-[12px] outline-none" /></label></div><KnowledgeFileTable files={item.knowledgeFiles ?? []} /></section> : <section className="mt-7"><h2 className="text-[15px] font-semibold text-[#1C1F23]">召回测试</h2><div className="mt-4 rounded-xl border border-[rgba(45,66,107,0.14)] p-5"><label className="block text-[12px] text-[#1C1F23]/55">测试问题</label><div className="mt-3 flex gap-2"><input aria-label="测试问题" placeholder="输入问题，验证知识召回结果" className="h-9 min-w-0 flex-1 rounded-lg border border-[rgba(45,66,107,0.14)] px-3 text-[13px] outline-none" /><button type="button" className="h-9 rounded-lg bg-[#1C1F23] px-5 text-[12px] font-medium text-white">开始测试</button></div><div className="mt-5 flex h-[150px] items-center justify-center rounded-lg bg-[#FAFAFB] text-[12px] text-[#1C1F23]/38">请输入测试问题</div></div></section>}
    </DetailShell>
  )
}

const MODEL_INFO_FIELDS: Array<{ key: keyof ModelResourceDetail; label: string }> = [
  { key: 'serviceAgents', label: '服务智能体' }, { key: 'totalCalls', label: '累计调用' }, { key: 'permission', label: '模型权限' }, { key: 'generationType', label: '生成类型' }, { key: 'contextLength', label: '上下文长度' }, { key: 'maxOutput', label: '最大回复长度' }, { key: 'baseModel', label: '基座' }, { key: 'modelKey', label: '模型Key' }, { key: 'endpoint', label: 'Endpoint' }, { key: 'createdAt', label: '创建时间' }, { key: 'updatedAt', label: '更新时间' }, { key: 'updatedBy', label: '更新人' },
]

function ModelResourceDetailView({ item, onBack }: { item: ResourceItem; onBack: () => void }) {
  const [view, setView] = useState<'info' | 'performance' | 'usage'>('info')
  const detail = item.modelDetail
  return (
    <DetailShell>
      <div className="flex items-center justify-between"><button type="button" onClick={onBack} className="inline-flex h-8 items-center gap-2 rounded-lg px-1.5 text-[13px] text-[#1C1F23] hover:bg-black/[0.04]"><ArrowLeft size={15} />模型</button><button type="button" className="h-8 rounded-lg border border-[rgba(45,66,107,0.16)] px-4 text-[12px] font-medium text-[#1C1F23] hover:bg-black/[0.03]">申请协作</button></div>
      <header className="mt-8 flex items-start gap-5"><DetailIcon item={item} /><div className="min-w-0 pt-0.5"><div className="flex items-center gap-2"><h1 className="text-[20px] font-semibold text-[#1C1F23]">{item.title}</h1>{detail?.status && <span className="inline-flex items-center gap-1 rounded-md bg-[#E7F6EF] px-2 py-1 text-[11px] font-medium text-[#137A52]"><Check size={12} />{detail.status}</span>}</div><p className="mt-2 max-w-[1120px] text-[13px] leading-6 text-[#1C1F23]/62">{item.summary ?? '暂无描述'}</p></div></header>
      <nav className="mt-9 flex h-10 items-center gap-7 border-b border-[rgba(45,66,107,0.12)]" aria-label="模型详情">{([['info', '模型信息'], ['performance', '模型性能'], ['usage', '用量统计']] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setView(key)} className={`relative h-10 text-[13px] ${view === key ? 'font-medium text-[#1C1F23]' : 'text-[#1C1F23]/48'}`}>{label}{view === key && <i className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#1C1F23]" />}</button>)}</nav>
      {view === 'info' ? <section className="mt-7"><h2 className="mb-4 text-[15px] font-semibold text-[#1C1F23]">模型信息</h2>{detail ? <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[rgba(45,66,107,0.14)]">{MODEL_INFO_FIELDS.map(({ key, label }) => <dl key={key} className="min-h-[76px] border-b border-r border-[rgba(45,66,107,0.10)] px-5 py-4"><dt className="text-[11px] text-[#1C1F23]/42">{label}</dt><dd className="mt-2 break-all text-[13px] text-[#1C1F23]">{detail[key]}</dd></dl>)}<dl className="min-h-[76px] border-r border-[rgba(45,66,107,0.10)] px-5 py-4"><dt className="text-[11px] text-[#1C1F23]/42">输入模态</dt><dd className="mt-2 flex gap-1.5">{detail.inputModalities.map((value) => <span key={value} className="rounded-md bg-[#F1F2F4] px-2 py-1 text-[11px]">{value}</span>)}</dd></dl><dl className="min-h-[76px] border-r border-[rgba(45,66,107,0.10)] px-5 py-4"><dt className="text-[11px] text-[#1C1F23]/42">能力标签</dt><dd className="mt-2 flex gap-1.5">{detail.capabilityTags.map((value) => <span key={value} className="rounded-md bg-[#F1F2F4] px-2 py-1 text-[11px]">{value}</span>)}</dd></dl><dl className="min-h-[76px] px-5 py-4"><dt className="text-[11px] text-[#1C1F23]/42">模型报告</dt><dd className="mt-2 text-[13px] text-[#3370FF]">审核评估信息</dd></dl></div> : <div className="flex h-[180px] items-center justify-center rounded-xl border border-[rgba(45,66,107,0.14)] text-[12px] text-[#1C1F23]/38">暂无模型信息</div>}</section> : <section className="mt-7"><div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold text-[#1C1F23]">{view === 'performance' ? '模型性能' : '用量统计'}</h2><div className="flex gap-1 rounded-lg bg-[#F3F4F6] p-1"><button type="button" className="h-7 rounded-md bg-white px-3 text-[11px] shadow-sm">近1天</button><button type="button" className="h-7 px-3 text-[11px] text-[#1C1F23]/48">近7天</button><button type="button" className="h-7 px-3 text-[11px] text-[#1C1F23]/48">近14天</button></div></div><div className="mt-4 grid grid-cols-3 gap-3">{[{ icon: Users, label: view === 'performance' ? '服务智能体' : '调用用户' }, { icon: BarChart3, label: view === 'performance' ? '成功率' : '累计调用' }, { icon: Activity, label: view === 'performance' ? '平均耗时' : 'Token 用量' }].map(({ icon: Icon, label }) => <div key={label} className="rounded-xl border border-[rgba(45,66,107,0.14)] p-5"><span className="flex size-8 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#1C1F23]/58"><Icon size={16} /></span><p className="mt-4 text-[11px] text-[#1C1F23]/42">{label}</p><strong className="mt-2 block text-[20px] font-medium text-[#1C1F23]/36">--</strong></div>)}</div><div className="mt-3 flex h-[220px] items-center justify-center rounded-xl border border-[rgba(45,66,107,0.14)] text-[12px] text-[#1C1F23]/38">暂无数据</div></section>}
    </DetailShell>
  )
}

function ResourceDetail({ item, onBack }: { item: ResourceItem; onBack: () => void }) {
  if (item.tab === 'toolbox') return <ToolResourceDetail item={item} onBack={onBack} />
  if (item.tab === 'knowledge') return <KnowledgeResourceDetail item={item} onBack={onBack} />
  return <ModelResourceDetailView item={item} onBack={onBack} />
}

function ResourcePane({ tab }: { tab: ResourceTabKey }) {
  const allItems = useMemo(() => resourcesForTab(tab), [tab])
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expanded, setExpanded] = useState(
    () => new Set(allItems.map((item) => item.group)),
  )
  const [selected, setSelected] = useState<ResourceItem | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const id = params.get('knowledge') ?? (params.get('asset') ? `knowledge:${params.get('asset')}` : null)
    return resourcesForTab(tab).find((item) => item.id === id) ?? null
  })

  const selectResource = (item: ResourceItem | null) => {
    setSelected(item)
    const params = new URLSearchParams(window.location.search)
    if (item) params.set('knowledge', item.id)
    else params.delete('knowledge')
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }

  const groups = useMemo(() => Array.from(new Set(allItems.map((item) => item.group))).map((group) => ({
    group,
    categories: Array.from(new Set(allItems.filter((item) => item.group === group).map((item) => item.category))),
  })), [allItems])

  const filtered = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase('zh-CN')
    return allItems.filter((item) => {
      const categoryMatch = selectedCategory === 'all' || selectedCategory === item.group || selectedCategory === `${item.group}/${item.category}`
      const keywordMatch = !query || `${item.title}${item.summary ?? ''}${item.group}${item.category}`.toLocaleLowerCase('zh-CN').includes(query)
      return categoryMatch && keywordMatch
    })
  }, [allItems, keyword, selectedCategory])

  if (selected) return <ResourceDetail item={selected} onBack={() => selectResource(null)} />

  return (
    <div className="flex h-full min-h-0">
      <aside className="thin-scroll w-[220px] shrink-0 overflow-y-auto border-r border-[rgba(45,66,107,0.10)] px-2 py-3">
        <button type="button" onClick={() => setSelectedCategory('all')} className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-[13px] ${selectedCategory === 'all' ? 'bg-[#EEF0F5] font-medium text-[#1C1F23]' : 'text-[#1C1F23]/70 hover:bg-black/[0.03]'}`}><span className="flex items-center gap-2"><Sparkles size={15} />全部{TAB_META[tab].singular}</span><span className="text-[12px] text-[#1C1F23]/40">{allItems.length}</span></button>
        <div className="mt-2 space-y-1">
          {groups.map(({ group, categories }) => {
            const open = expanded.has(group)
            const count = allItems.filter((item) => item.group === group).length
            return <div key={group}>
              <button type="button" onClick={() => {
                setSelectedCategory(group)
                setExpanded((current) => { const next = new Set(current); if (next.has(group)) next.delete(group); else next.add(group); return next })
              }} className={`flex h-8 w-full items-center gap-1 rounded-lg px-2 text-[13px] ${selectedCategory === group ? 'bg-[#EEF0F5] font-medium text-[#1C1F23]' : 'text-[#1C1F23]/76 hover:bg-black/[0.03]'}`}>
                {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}<span className="min-w-0 flex-1 truncate text-left">{group}</span><span className="text-[12px] text-[#1C1F23]/38">{count}</span>
              </button>
              {open && <div className="ml-4 border-l border-[rgba(45,66,107,0.10)] pl-2">{categories.map((category) => {
                const key = `${group}/${category}`
                const childCount = allItems.filter((item) => item.group === group && item.category === category).length
                return <button key={key} type="button" onClick={() => setSelectedCategory(key)} className={`flex h-8 w-full items-center justify-between rounded-lg px-2 text-[12px] ${selectedCategory === key ? 'bg-[#EEF0F5] font-medium text-[#1C1F23]' : 'text-[#1C1F23]/62 hover:bg-black/[0.03]'}`}><span className="truncate">{category}</span><span className="text-[#1C1F23]/35">{childCount}</span></button>
              })}</div>}
            </div>
          })}
        </div>
      </aside>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[rgba(45,66,107,0.08)] px-6 py-3">
          <label className="relative min-w-[190px] flex-1 sm:max-w-[280px]"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1C1F23]/38" /><input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} aria-label={`搜索${TAB_META[tab].singular}`} placeholder={`搜索${TAB_META[tab].singular}名称或能力`} className="h-8 w-full rounded-lg border border-[rgba(45,66,107,0.14)] bg-white pl-8 pr-3 text-[13px] outline-none placeholder:text-[#1C1F23]/35 focus:border-[#697386]" /></label>
          <span className="ml-auto whitespace-nowrap text-[12px] text-[#1C1F23]/42">{filtered.length} / {allItems.length} 项</span>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[#FAFAFB] px-6 py-5">
          {filtered.length ? <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-3">{filtered.map((item) => (
            <button key={item.id} type="button" onClick={() => selectResource(item)} className="group min-w-0 overflow-hidden rounded-xl border border-[rgba(45,66,107,0.10)] bg-white text-left transition hover:-translate-y-px hover:border-[rgba(45,66,107,0.18)] hover:shadow-[0_8px_22px_rgba(31,35,41,0.07)]">
              <ResourceCover item={item} />
              <div className="p-3.5">
                <div className="flex min-w-0 items-center gap-2"><h2 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#1C1F23]">{item.title}</h2>{item.state && <StateTag state={item.state} />}</div>
                {item.summary && <p className="mt-2 line-clamp-2 min-h-10 text-[12px] leading-5 text-[#1C1F23]/55">{item.summary}</p>}
                <div className={`${item.summary ? 'mt-3' : 'mt-7'} flex items-center justify-between border-t border-[rgba(45,66,107,0.08)] pt-2.5 text-[11px] text-[#1C1F23]/42`}><span>{item.group}</span><span>{item.category}</span></div>
              </div>
            </button>
          ))}</div> : <div className="flex h-48 flex-col items-center justify-center text-center"><Search size={24} className="text-[#1C1F23]/22" /><p className="mt-3 text-[13px] text-[#1C1F23]/48">没有符合条件的{TAB_META[tab].singular}</p></div>}
        </div>
      </main>
    </div>
  )
}

const getInitialTab = (fallback: ResourceTabKey): ResourceTabKey => {
  if (typeof window === 'undefined') return fallback
  const value = new URLSearchParams(window.location.search).get('resourceTab')
  return value === 'toolbox' || value === 'knowledge' || value === 'model' ? value : fallback
}

export default function ResourceLibraryPage({ initialTab = 'toolbox' }: { initialTab?: ResourceTabKey; onUseResource?: (reference: ResourceReference) => void }) {
  const [tab, setTab] = useState<ResourceTabKey>(() => getInitialTab(initialTab))

  const selectTab = (next: ResourceTabKey) => {
    setTab(next)
    const params = new URLSearchParams(window.location.search)
    params.set('page', 'resources')
    params.set('resourceTab', next)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }

  useEffect(() => {
    const sync = () => setTab(getInitialTab(initialTab))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [initialTab])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[rgba(45,66,107,0.12)] px-6">
        <h1 className="mr-6 shrink-0 text-[20px] font-semibold tracking-[-0.2px] text-[#1C1F23]">资源库</h1>
        <nav aria-label="资源库分类" className="flex h-full items-center gap-1">
          {resourceTabOptions.map((option) => <button key={option.key} type="button" aria-current={tab === option.key ? 'page' : undefined} onClick={() => selectTab(option.key)} className={`relative flex h-full items-center px-3 text-[14px] ${tab === option.key ? 'font-medium text-[#1C1F23]' : 'text-[#1C1F23]/55 hover:text-[#1C1F23]'}`}>{option.label}{tab === option.key && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#1C1F23]" />}</button>)}
        </nav>
        <span className="ml-auto text-[12px] text-[#1C1F23]/40">{resources.length} 项资源</span>
      </header>
      <div className="min-h-0 flex-1"><ResourcePane key={tab} tab={tab} /></div>
    </div>
  )
}
