import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Gamepad2,
  Image,
  Layers,
  Search,
  Sparkles,
} from '@/shared/icons'
import {
  type SkillItem,
  skillCategories,
  skillCategoryKey,
  skills,
} from './skills-data'

const CATEGORY_STYLE: Record<SkillItem['category'], { bg: string; ink: string }> = {
  'Brand Kit': { bg: '#F5F0E8', ink: '#795F37' },
  'IP 资产': { bg: '#F2ECF7', ink: '#6B4D87' },
  活动设计: { bg: '#EAF1FF', ink: '#315FA9' },
  素材设计: { bg: '#F4EEE4', ink: '#86623A' },
  游戏设计: { bg: '#EEEAF7', ink: '#674C96' },
  产品设计: { bg: '#EAF3F1', ink: '#326D64' },
  数据复盘: { bg: '#E8F3EF', ink: '#32715B' },
  知识管理: { bg: '#EFF0F2', ink: '#4F5662' },
  搜索: { bg: '#E9F3F5', ink: '#2C6D78' },
}

function CategoryIcon({ category, size = 18 }: { category: SkillItem['category']; size?: number }) {
  const props = { size, strokeWidth: 1.8 }
  if (category === 'Brand Kit') return <Layers {...props} />
  if (category === 'IP 资产') return <Sparkles {...props} />
  if (category === '素材设计') return <Image {...props} />
  if (category === '游戏设计') return <Gamepad2 {...props} />
  if (category === '产品设计') return <Layers {...props} />
  if (category === '数据复盘') return <FileText {...props} />
  if (category === '知识管理') return <BookOpen {...props} />
  if (category === '搜索') return <Search {...props} />
  return <Code2 {...props} />
}

function SkillCover({ item }: { item: SkillItem }) {
  const style = CATEGORY_STYLE[item.category]
  const image = item.sourceAsset?.thumbnail ?? item.sourceAsset?.visualReferences?.[0]?.src
  if (image) {
    return (
      <div className="relative h-[132px] overflow-hidden bg-[#F1F2F4]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]" />
        <span className="absolute left-3 top-3 inline-flex h-6 items-center gap-1.5 rounded-md bg-white/92 px-2 text-[11px] font-medium text-[#1C1F23] shadow-sm backdrop-blur">
          <CategoryIcon category={item.category} size={12} />{item.category}
        </span>
      </div>
    )
  }
  return (
    <div className="relative flex h-[104px] items-center justify-center overflow-hidden" style={{ background: style.bg }}>
      <span aria-hidden className="absolute -left-7 -top-8 size-24 rounded-full border-[18px] border-white/35" />
      <span aria-hidden className="absolute -bottom-10 right-3 size-28 rounded-full border-[20px] border-white/30" />
      <div className="relative flex h-12 max-w-[calc(100%-28px)] items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3.5 shadow-[0_3px_10px_rgba(31,35,41,0.07)]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ background: style.bg, color: style.ink }}>
          <CategoryIcon category={item.category} size={15} />
        </span>
        <span className="truncate text-[13px] font-medium text-[#1C1F23]">{item.name}</span>
      </div>
    </div>
  )
}

function StatusTag({ status }: { status: SkillItem['status'] }) {
  const ready = status === '已有'
  return (
    <span className={`inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium ${ready ? 'bg-[#E7F6EF] text-[#137A52]' : 'bg-[#FFF3DC] text-[#9A6217]'}`}>
      {ready && <CheckCircle2 size={11} strokeWidth={2} />}
      {status}
    </span>
  )
}

function SkillDetail({ item, onBack }: { item: SkillItem; onBack: () => void }) {
  const style = CATEGORY_STYLE[item.category]
  const asset = item.sourceAsset
  const image = asset?.thumbnail ?? asset?.visualReferences?.[0]?.src
  const [copied, setCopied] = useState(false)
  const copyInvocation = async () => {
    if (!item.invocation) return
    await navigator.clipboard.writeText(item.invocation)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="thin-scroll h-full overflow-y-auto bg-[#F7F8FA] px-8 py-6">
      <div className="mx-auto max-w-[920px]">
        <button type="button" onClick={onBack} className="mb-4 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-[#1C1F23]/65 hover:bg-black/[0.04] hover:text-[#1C1F23]">
          <ArrowLeft size={15} strokeWidth={1.8} />返回技能库
        </button>
        <div className="overflow-hidden rounded-2xl border border-[rgba(45,66,107,0.10)] bg-white">
          <div className="flex min-h-[176px] items-end justify-between gap-8 overflow-hidden px-8 py-7" style={{ background: style.bg }}>
            <div className="max-w-[640px]">
              <div className="mb-4 flex items-center gap-2 text-[12px] font-medium" style={{ color: style.ink }}>
                <span>{item.group}</span><span className="opacity-40">/</span><span>{item.category}</span>
              </div>
              <h1 className="text-[30px] font-semibold tracking-[-0.7px] text-[#1C1F23]">{item.name}</h1>
            </div>
            {image ? (
              <img src={image} alt="" className="h-[116px] w-[206px] shrink-0 rounded-xl object-cover shadow-[0_5px_18px_rgba(31,35,41,0.10)]" />
            ) : (
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_5px_18px_rgba(31,35,41,0.08)]" style={{ color: style.ink }}>
                <CategoryIcon category={item.category} size={28} />
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-[minmax(0,1fr)_260px] md:gap-10">
            <section>
              <h2 className="text-[15px] font-semibold text-[#1C1F23]">能力说明</h2>
              <p className="mt-3 text-[14px] leading-7 text-[#1C1F23]/72">{item.description}</p>
              {asset?.parameterGroups.map((group) => (
                <div key={group.name} className="mt-7 border-t border-[rgba(45,66,107,0.10)] pt-6">
                  <h2 className="text-[15px] font-semibold text-[#1C1F23]">{group.name}</h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#1C1F23]/50">{group.summary}</p>
                  <dl className="mt-4 divide-y divide-[rgba(45,66,107,0.08)] rounded-xl border border-[rgba(45,66,107,0.10)]">
                    {group.parameters.map((parameter) => (
                      <div key={parameter.label} className="grid grid-cols-[132px_minmax(0,1fr)] gap-4 px-4 py-3 text-[12px] leading-5">
                        <dt className="font-medium text-[#1C1F23]/64">{parameter.label}</dt>
                        <dd className="text-[#1C1F23]">{parameter.value}<span className="ml-2 text-[10px] text-[#1C1F23]/38">{parameter.mode}</span></dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              {asset?.constraints.length ? (
                <div className="mt-7 border-t border-[rgba(45,66,107,0.10)] pt-6">
                  <h2 className="text-[15px] font-semibold text-[#1C1F23]">调用边界</h2>
                  <ul className="mt-3 space-y-2 text-[13px] leading-6 text-[#1C1F23]/68">
                    {asset.constraints.map((rule) => <li key={rule} className="flex gap-2"><span className="mt-[9px] size-1 shrink-0 rounded-full bg-[#1C1F23]/35" />{rule}</li>)}
                  </ul>
                </div>
              ) : null}
            </section>
            <aside className="border-t border-[rgba(45,66,107,0.10)] pt-7 md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <dl className="space-y-5">
                <div><dt className="text-[12px] text-[#1C1F23]/45">状态</dt><dd className="mt-1.5"><StatusTag status={item.status} /></dd></div>
                <div><dt className="text-[12px] text-[#1C1F23]/45">分类</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">{item.group} · {item.category}</dd></div>
                {asset && <div><dt className="text-[12px] text-[#1C1F23]/45">版本</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">v{asset.version} · {asset.status}</dd></div>}
                {asset?.metrics.map((metric) => <div key={metric.label}><dt className="text-[12px] text-[#1C1F23]/45">{metric.label}</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">{metric.value}</dd></div>)}
                {item.provider && <div><dt className="text-[12px] text-[#1C1F23]/45">来源</dt><dd className="mt-1.5 text-[13px] text-[#1C1F23]">{item.provider}</dd></div>}
                {item.invocation && (
                  <div>
                    <dt className="text-[12px] text-[#1C1F23]/45">调用标识</dt>
                    <dd className="mt-1.5 rounded-lg bg-[#F4F5F7] p-2.5 font-mono text-[12px] leading-5 text-[#1C1F23] break-all">{item.invocation}</dd>
                    <button type="button" onClick={copyInvocation} className="mt-2 text-[12px] font-medium text-[#315FA9] hover:underline">{copied ? '已复制' : '复制调用标识'}</button>
                  </div>
                )}
              </dl>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SkillsLibraryPage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'全部' | SkillItem['status']>('全部')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedGroups, setExpandedGroups] = useState(() => new Set(skillCategories.map((item) => item.key)))
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const id = params.get('skill') ?? params.get('asset')
    return skills.find((item) => item.id === id) ?? null
  })

  const selectSkill = (item: SkillItem | null) => {
    setSelectedSkill(item)
    const params = new URLSearchParams(window.location.search)
    if (item) params.set('skill', item.id)
    else params.delete('skill')
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }

  const filtered = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase('zh-CN')
    return skills.filter((item) => {
      const categoryMatch = selectedCategory === 'all' || selectedCategory === item.group || selectedCategory === skillCategoryKey(item.group, item.category)
      const statusMatch = status === '全部' || item.status === status
      const queryMatch = !query || `${item.name}${item.description}${item.invocation ?? ''}`.toLocaleLowerCase('zh-CN').includes(query)
      return categoryMatch && statusMatch && queryMatch
    })
  }, [keyword, selectedCategory, status])

  if (selectedSkill) return <SkillDetail item={selectedSkill} onBack={() => selectSkill(null)} />

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[rgba(45,66,107,0.12)] px-6">
        <h1 className="text-[20px] font-semibold tracking-[-0.2px] text-[#1C1F23]">技能库</h1>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="thin-scroll w-[220px] shrink-0 overflow-y-auto border-r border-[rgba(45,66,107,0.10)] px-2 py-3">
          <button type="button" onClick={() => setSelectedCategory('all')} className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-[13px] ${selectedCategory === 'all' ? 'bg-[#EEF0F5] font-medium text-[#1C1F23]' : 'text-[#1C1F23]/70 hover:bg-black/[0.03]'}`}>
            <span className="flex items-center gap-2"><Sparkles size={15} strokeWidth={1.8} />全部技能</span><span className="text-[12px] text-[#1C1F23]/40">{skills.length}</span>
          </button>
          <div className="mt-2 space-y-1">
            {skillCategories.map((group) => {
              const open = expandedGroups.has(group.key)
              const groupCount = skills.filter((item) => item.group === group.label).length
              return (
                <div key={group.key}>
                  <button type="button" onClick={() => {
                    setSelectedCategory(group.key)
                    setExpandedGroups((current) => {
                      const next = new Set(current)
                      if (next.has(group.key)) next.delete(group.key); else next.add(group.key)
                      return next
                    })
                  }} className={`flex h-8 w-full items-center gap-1 rounded-lg px-2 text-[13px] ${selectedCategory === group.key ? 'bg-[#EEF0F5] font-medium text-[#1C1F23]' : 'text-[#1C1F23]/76 hover:bg-black/[0.03]'}`}>
                    {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <span className="min-w-0 flex-1 truncate text-left">{group.label}</span>
                    <span className="text-[12px] text-[#1C1F23]/38">{groupCount}</span>
                  </button>
                  {open && <div className="ml-4 border-l border-[rgba(45,66,107,0.10)] pl-2">
                    {group.children.map((child) => {
                      const count = skills.filter((item) => item.group === group.label && item.category === child.label).length
                      return <button key={child.key} type="button" onClick={() => setSelectedCategory(child.key)} className={`flex h-8 w-full items-center justify-between rounded-lg px-2 text-[12px] ${selectedCategory === child.key ? 'bg-[#EEF0F5] font-medium text-[#1C1F23]' : 'text-[#1C1F23]/62 hover:bg-black/[0.03]'}`}><span>{child.label}</span><span className="text-[#1C1F23]/35">{count}</span></button>
                    })}
                  </div>}
                </div>
              )
            })}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[rgba(45,66,107,0.08)] px-6 py-3">
            <label className="relative min-w-[190px] flex-1 sm:max-w-[260px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1C1F23]/38" />
              <input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} aria-label="搜索技能" placeholder="搜索技能或调用标识" className="h-8 w-full rounded-lg border border-[rgba(45,66,107,0.14)] bg-white pl-8 pr-3 text-[13px] outline-none placeholder:text-[#1C1F23]/35 focus:border-[#697386]" />
            </label>
            <label className="relative">
              <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-8 appearance-none rounded-lg border border-[rgba(45,66,107,0.14)] bg-white pl-3 pr-8 text-[13px] text-[#1C1F23]/75 outline-none"><option>全部</option><option>已有</option><option>待抽象</option></select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1C1F23]/42" />
            </label>
            <span className="ml-auto whitespace-nowrap text-[12px] text-[#1C1F23]/42">{filtered.length} / {skills.length} 项</span>
          </div>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[#FAFAFB] px-6 py-5">
            {filtered.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-3">
                {filtered.map((item) => (
                  <button key={item.id} type="button" onClick={() => selectSkill(item)} className="group min-w-0 overflow-hidden rounded-xl border border-[rgba(45,66,107,0.10)] bg-white text-left transition hover:-translate-y-px hover:border-[rgba(45,66,107,0.18)] hover:shadow-[0_8px_22px_rgba(31,35,41,0.07)]">
                    <SkillCover item={item} />
                    <div className="p-3.5">
                      <div className="flex min-w-0 items-center gap-2"><h2 className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#1C1F23]">{item.name}</h2><StatusTag status={item.status} /></div>
                      <p className="mt-2 line-clamp-2 min-h-10 text-[12px] leading-5 text-[#1C1F23]/55">{item.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[rgba(45,66,107,0.08)] pt-2.5 text-[11px] text-[#1C1F23]/42"><span className="truncate">{item.group} · {item.category}</span>{item.provider ? <span className="shrink-0">{item.provider}</span> : item.invocation ? <code className="max-w-[96px] truncate font-mono">{item.invocation}</code> : null}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : <div className="flex h-48 flex-col items-center justify-center text-center"><Search size={24} className="text-[#1C1F23]/22" /><p className="mt-3 text-[13px] text-[#1C1F23]/48">没有符合条件的技能</p></div>}
          </div>
        </main>
      </div>
    </div>
  )
}
