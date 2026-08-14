import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Box,
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Image,
  Search,
  Sparkles,
} from '@/shared/icons'
import {
  type ResourceItem,
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

function ResourceDetail({ item, onBack, onUse }: { item: ResourceItem; onBack: () => void; onUse?: (reference: ResourceReference) => void }) {
  const style = styleFor(item)
  const asset = item.sourceAsset
  const image = asset?.thumbnail ?? asset?.visualReferences?.[0]?.src
  return (
    <div className="thin-scroll h-full overflow-y-auto bg-[#F7F8FA] px-8 py-6">
      <div className="mx-auto max-w-[920px]">
        <button type="button" onClick={onBack} className="mb-4 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-[#1C1F23]/65 hover:bg-black/[0.04] hover:text-[#1C1F23]"><ArrowLeft size={15} />返回{TAB_META[item.tab].label}</button>
        <article className="overflow-hidden rounded-2xl border border-[rgba(45,66,107,0.10)] bg-white">
          <header className="flex min-h-[176px] items-end justify-between gap-8 px-8 py-7" style={{ background: style.bg }}>
            <div>
              <div className="mb-4 text-[12px] font-medium" style={{ color: style.ink }}>{item.group} / {item.category}</div>
              <h1 className="text-[30px] font-semibold tracking-[-0.7px] text-[#1C1F23]">{item.title}</h1>
            </div>
            {image ? <img src={image} alt="" className="h-[116px] w-[206px] shrink-0 rounded-xl object-cover shadow-[0_5px_18px_rgba(31,35,41,0.10)]" /> : <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_5px_18px_rgba(31,35,41,0.08)]" style={{ color: style.ink }}><ResourceIcon item={item} size={28} /></span>}
          </header>
          <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-[minmax(0,1fr)_260px] md:gap-10">
            <section>
              {item.summary ? <><h2 className="text-[15px] font-semibold text-[#1C1F23]">知识说明</h2><p className="mt-3 text-[14px] leading-7 text-[#1C1F23]/72">{item.summary}</p></> : <div className="flex h-24 items-center text-[13px] text-[#1C1F23]/42">暂无补充说明</div>}
              {asset?.parameterGroups.map((group) => (
                <div key={group.name} className="mt-7 border-t border-[rgba(45,66,107,0.10)] pt-6">
                  <h2 className="text-[15px] font-semibold text-[#1C1F23]">{group.name}</h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#1C1F23]/50">{group.summary}</p>
                  <dl className="mt-4 divide-y divide-[rgba(45,66,107,0.08)] rounded-xl border border-[rgba(45,66,107,0.10)]">
                    {group.parameters.map((parameter) => (
                      <div key={parameter.label} className="grid grid-cols-[132px_minmax(0,1fr)] gap-4 px-4 py-3 text-[12px] leading-5">
                        <dt className="font-medium text-[#1C1F23]/64">{parameter.label}</dt><dd className="text-[#1C1F23]">{parameter.value}<span className="ml-2 text-[10px] text-[#1C1F23]/38">{parameter.mode}</span></dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              {asset?.constraints.length ? <div className="mt-7 border-t border-[rgba(45,66,107,0.10)] pt-6"><h2 className="text-[15px] font-semibold text-[#1C1F23]">使用边界</h2><ul className="mt-3 space-y-2 text-[13px] leading-6 text-[#1C1F23]/68">{asset.constraints.map((rule) => <li key={rule} className="flex gap-2"><span className="mt-[9px] size-1 shrink-0 rounded-full bg-[#1C1F23]/35" />{rule}</li>)}</ul></div> : null}
            </section>
            <aside className="border-t border-[rgba(45,66,107,0.10)] pt-7 md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <dl className="space-y-5">
                <div><dt className="text-[12px] text-[#1C1F23]/45">资源类型</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">{TAB_META[item.tab].singular}</dd></div>
                <div><dt className="text-[12px] text-[#1C1F23]/45">分类</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">{item.group} · {item.category}</dd></div>
                {asset && <div><dt className="text-[12px] text-[#1C1F23]/45">版本</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">v{asset.version} · {asset.status}</dd></div>}
                {asset?.metrics.map((metric) => <div key={metric.label}><dt className="text-[12px] text-[#1C1F23]/45">{metric.label}</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">{metric.value}</dd></div>)}
                {item.state && <div><dt className="text-[12px] text-[#1C1F23]/45">沉淀状态</dt><dd className="mt-1.5"><StateTag state={item.state} /></dd></div>}
              </dl>
              {onUse && <button type="button" onClick={() => onUse({ id: item.id, name: item.title, kind: item.tab })} className="mt-7 h-9 w-full rounded-full bg-[#1C1F23] text-[13px] font-medium text-white hover:bg-[#303238]">在对话中引用</button>}
            </aside>
          </div>
        </article>
      </div>
    </div>
  )
}

function ResourcePane({ tab, onUseResource }: { tab: ResourceTabKey; onUseResource?: (reference: ResourceReference) => void }) {
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

  if (selected) return <ResourceDetail item={selected} onBack={() => selectResource(null)} onUse={onUseResource} />

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

export default function ResourceLibraryPage({ initialTab = 'toolbox', onUseResource }: { initialTab?: ResourceTabKey; onUseResource?: (reference: ResourceReference) => void }) {
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
      <div className="min-h-0 flex-1"><ResourcePane key={tab} tab={tab} onUseResource={onUseResource} /></div>
    </div>
  )
}
