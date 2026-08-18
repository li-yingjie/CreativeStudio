import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  FileText,
  FolderClosed,
  Gamepad2,
  Headphones,
  Image,
  Layers,
  Search,
  Sparkles,
  Wrench,
} from '@/shared/icons'
import {
  type SkillPackage,
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

function packageForSkill(item: SkillItem): SkillPackage | null {
  if (item.skillPackage) return item.skillPackage
  if (item.status !== '已有') return null

  const lines = [
    '---',
    `name: ${item.invocation ?? item.id}`,
    `description: ${item.description}`,
    '---',
    '',
    `# ${item.name} Skill`,
    '',
    item.description,
  ]

  item.sourceAsset?.parameterGroups.forEach((group) => {
    lines.push('', `## ${group.name}`, '', group.summary, '')
    group.parameters.forEach((parameter) => {
      lines.push(`- **${parameter.label}**：${parameter.value}（${parameter.mode}）`)
    })
  })
  if (item.sourceAsset?.constraints.length) {
    lines.push('', '## 通用约束', '')
    item.sourceAsset.constraints.forEach((rule) => lines.push(`- ${rule}`))
  }

  return {
    folderName: `${item.id}.skill`,
    files: [{ name: 'SKILL.md', content: lines.join('\n') }],
  }
}

function MetricIcon({ icon }: { icon: NonNullable<SkillItem['metrics']>[number]['icon'] }) {
  if (icon === 'calendar') return <Calendar size={14} strokeWidth={1.8} />
  if (icon === 'quality') return <CheckCircle2 size={14} strokeWidth={1.8} />
  return <ArrowUpRight size={14} strokeWidth={1.8} />
}

function SkillPackageViewer({ item }: { item: SkillItem }) {
  const skillPackage = useMemo(() => packageForSkill(item), [item])
  const [selectedFileName, setSelectedFileName] = useState(
    () => skillPackage?.files[0]?.name ?? '',
  )
  const selectedFile =
    skillPackage?.files.find((file) => file.name === selectedFileName) ??
    skillPackage?.files[0] ??
    null
  const lines = selectedFile?.content.split('\n') ?? []

  return (
    <div
      className="mt-3 overflow-hidden rounded-xl border border-black/[0.09] bg-white"
      style={{ height: 'clamp(440px, calc(100vh - 470px), 610px)' }}
    >
      {skillPackage && selectedFile ? (
        <div className="grid h-full grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[276px_minmax(0,1fr)]">
          <aside className="min-w-0 border-r border-black/[0.08] bg-white px-3 py-3">
            <h3 className="px-1 text-[13px] font-semibold text-[#1C1F23]">文件目录</h3>
            <div className="mt-3">
              <div className="flex h-8 min-w-0 items-center gap-2 px-2 text-[12px] text-[#1C1F23]/76">
                <ChevronDown size={13} className="shrink-0 text-[#1C1F23]/42" />
                <FolderClosed size={16} fill="#FFC53D" color="#FFC53D" className="shrink-0" />
                <span className="max-w-[148px] truncate">{skillPackage.folderName}</span>
              </div>
              <div className="ml-5 space-y-1">
                {skillPackage.files.map((file) => {
                  const selected = file.name === selectedFile.name
                  return (
                    <button
                      key={file.name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedFileName(file.name)}
                      className={`flex h-9 w-full min-w-0 items-center gap-2 rounded-lg px-3 text-left text-[12px] ${selected ? 'bg-[#EDEFF3] text-[#1C1F23]' : 'text-[#1C1F23]/62 hover:bg-black/[0.035]'}`}
                    >
                      <span className="grid h-4 min-w-5 place-items-center rounded bg-[#73777F] px-1 text-[7px] font-bold text-white">MD</span>
                      <span className="truncate">{file.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
          <div className="thin-scroll min-w-0 overflow-auto bg-white py-3 font-mono text-[12px] leading-6 text-[#1C1F23]">
            {lines.map((line, index) => (
              <div key={`${index}:${line}`} className="grid min-w-[520px] grid-cols-[54px_minmax(0,1fr)] px-3">
                <span aria-hidden className="select-none pr-4 text-right text-[#1C1F23]/38">{index + 1}</span>
                <span className="whitespace-pre-wrap break-words pr-6">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid h-full place-items-center text-[12px] text-[#1C1F23]/38">暂无技能包文件</div>
      )}
    </div>
  )
}

function SkillDetail({ item, onBack }: { item: SkillItem; onBack: () => void }) {
  const style = item.detailTone ?? CATEGORY_STYLE[item.category]
  const tools = item.tools ?? (item.invocation ? [item.invocation] : [])
  const knowledgeBases = item.knowledgeBases ?? []

  return (
    <div data-testid="skill-detail-page" className="thin-scroll h-full w-full overflow-y-auto bg-[#F3F4F6] p-3">
      <article className="min-h-full w-full rounded-[18px] bg-white px-7 pb-12 pt-5 shadow-[0_1px_2px_rgba(22,24,35,0.03)] sm:px-9">
        <header className="flex h-9 items-center justify-between">
          <button type="button" onClick={onBack} className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-[14px] font-semibold text-[#1C1F23] hover:bg-black/[0.04]">
            <ArrowLeft size={15} strokeWidth={1.8} />技能详情
          </button>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="下载技能包" title="下载技能包" className="grid size-8 place-items-center rounded-lg text-[#1C1F23]/70 hover:bg-black/[0.04] hover:text-[#1C1F23]"><Download size={15} strokeWidth={1.8} /></button>
            <button type="button" aria-label="联系支持" title="联系支持" className="grid size-8 place-items-center rounded-lg text-[#1C1F23]/70 hover:bg-black/[0.04] hover:text-[#1C1F23]"><Headphones size={15} strokeWidth={1.8} /></button>
          </div>
        </header>

        <section className="mt-9 flex items-center gap-5">
          <span className="grid size-[82px] shrink-0 place-items-center rounded-[18px]" style={{ background: style.bg, color: style.ink }}>{item.detailIcon === 'wrench' ? <Wrench size={34} strokeWidth={1.9} /> : <CategoryIcon category={item.category} size={34} />}</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-semibold tracking-[-0.25px] text-[#1C1F23]">{item.name}</h1>
            <p className="mt-1.5 text-[13px] leading-6 text-[#1C1F23]/55">{item.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#1C1F23]/48">
              {item.provider ? <span className="inline-flex items-center gap-1.5 font-medium text-[#1C1F23]/64">{item.provider.includes('抖音') ? <img src="/assets/workshop/resources/toolbox-icons/douyin.webp" alt="" className="size-4 rounded-full" /> : null}{item.provider}</span> : null}
              {item.updatedAt ? <><span aria-hidden className="h-3 w-px bg-black/[0.08]" /><span>{item.updatedAt}</span></> : null}
              {item.metrics?.map((metric) => <span key={metric.label} className="inline-flex items-center gap-1"><span aria-hidden className="h-3 w-px bg-black/[0.08]" /><MetricIcon icon={metric.icon} /><span>{metric.value}</span></span>)}
            </div>
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-[16px] font-semibold text-[#1C1F23]">技能调用信息</h2>
          <dl className="mt-3 rounded-xl border border-black/[0.09] px-5 py-1">
            <div className="grid min-h-10 grid-cols-[92px_minmax(0,1fr)] items-center gap-3"><dt className="text-[12px] text-[#1C1F23]/44">工具</dt><dd className="flex flex-wrap items-center gap-1.5">{tools.length ? tools.map((tool) => <span key={tool} className="rounded border border-black/[0.09] bg-white px-2 py-1 text-[11px] text-[#1C1F23]">{tool}</span>) : <span className="text-[12px] text-[#1C1F23]/38">暂无</span>}</dd></div>
            <div className="grid min-h-10 grid-cols-[92px_minmax(0,1fr)] items-center gap-3"><dt className="text-[12px] text-[#1C1F23]/44">知识库</dt><dd className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#1C1F23]/38">{knowledgeBases.length ? knowledgeBases.map((knowledge) => <span key={knowledge} className="rounded border border-black/[0.09] bg-white px-2 py-1 text-[11px] text-[#1C1F23]">{knowledge}</span>) : '暂无'}</dd></div>
          </dl>
        </section>

        <section className="mt-9">
          <h2 className="text-[16px] font-semibold text-[#1C1F23]">技能包内容</h2>
          <SkillPackageViewer item={item} />
        </section>
      </article>
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
