import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, PlusCircle, Search } from '@/shared/icons'
import {
  type KnowledgeItem,
  type ModelItem,
  type PublisherItem,
  type ResourceTabKey,
  type ToolboxItem,
  type ToolboxNavGroup,
  type TriggerItem,
  knowledgeItems,
  knowledgeSectionMeta,
  knowledgeTypeOptions,
  modelAbilityOptions,
  modelGroupMeta,
  modelItems,
  modelSceneOptions,
  publisherEntryOptions,
  publisherGenreOptions,
  publisherItems,
  resourceTabOptions,
  toolboxItems,
  toolboxNavGroups,
  toolboxNavStats,
  toolboxOrderOptions,
  toolboxSectionMeta,
  toolboxSourceOptions,
  toolboxStatusOptions,
  triggerAppOptions,
  triggerItems,
  triggerMethodOptions,
  triggerSceneOptions,
} from './resources-data'

/* ─── 资源库 ───
 *
 * 对齐 AI 平台 (ai_design) 的 components/resources/*：顶部「资源库」标题 +
 * 五个 tab（工具箱 / 知识库 / 模型库 / 发布器 / 触发器），数据来自同一份
 * resourceMockData。那边每个子页是独立路由 + @douyin-ai/ui 的 Filter/Tabs，
 * 这里合并成一个组件、用本地 tab state 切换，筛选条与卡片用 Tailwind 重建。 */

/* ── 共用小件 ── */

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: readonly { label: string; value: string }[]
  onChange: (value: string) => void
}) {
  return (
    <label className="relative inline-flex h-8 items-center">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 cursor-pointer appearance-none rounded-md border border-[rgba(45,66,107,0.12)] bg-white py-0 pl-2.5 pr-7 text-[13px] text-[#1C1F23] outline-none transition-colors hover:border-[rgba(45,66,107,0.24)]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        strokeWidth={2}
        aria-hidden
        className="pointer-events-none absolute right-2 text-[#1C1F23]/45"
      />
    </label>
  )
}

function SearchInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="relative inline-flex h-8 w-[200px] items-center">
      <Search
        size={14}
        aria-hidden
        className="pointer-events-none absolute left-2.5 text-[#1C1F23]/45"
      />
      <input
        type="search"
        value={value}
        aria-label={placeholder}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-md border border-[rgba(45,66,107,0.12)] bg-white pl-[30px] pr-2 text-[13px] text-[#1C1F23] outline-none transition-colors placeholder:text-[#1C1F23]/35 focus:border-[rgba(45,66,107,0.28)]"
      />
    </label>
  )
}

function CheckboxFilter({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-[#1C1F23]/80 transition-colors hover:bg-black/[0.03]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-3.5 cursor-pointer accent-[#1C1F23]"
      />
      {label}
    </label>
  )
}

function FilterBar({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 pb-2.5 pt-3">
      {children}
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  )
}

function CreateButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast(`${label}（演示）`)}
      className="flex h-8 items-center gap-1.5 rounded-full bg-[#1C1F23] px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
    >
      <PlusCircle size={14} strokeWidth={1.8} />
      {label}
    </button>
  )
}

function SectionTitle({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex h-5 items-center gap-1.5 pb-1 pt-3 text-[14px] leading-5 text-[#1C1F23]">
      <strong className="font-semibold">{label}</strong>
      <span className="inline-flex h-[18px] min-w-2 items-center justify-center rounded-2xl bg-[rgba(83,96,143,0.07)] px-[5px] text-[12px] font-normal leading-4 text-[#1C1F23]/60">
        {count}
      </span>
    </div>
  )
}

/** 通用资源卡：封面/图标 + 标题 + 摘要 + 底部元信息。 */
function ResourceCard({
  title,
  summary,
  cover,
  coverText,
  badge,
  meta,
  onOpen,
}: {
  title: string
  summary: string
  cover?: string
  coverText?: string
  badge?: string
  meta: ReactNode
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 text-left transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(31,35,41,0.08)]"
    >
      <div className="flex min-w-0 items-start gap-3">
        {cover ? (
          <img src={cover} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(83,96,143,0.07)] text-[16px]">
            {coverText ?? '🧩'}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="min-w-0 truncate text-[14px] font-medium text-[#1C1F23]">
              {title}
            </span>
            {badge && (
              <span className="shrink-0 rounded border border-[rgba(45,66,107,0.12)] px-1 text-[11px] leading-4 text-[#1C1F23]/70">
                {badge}
              </span>
            )}
          </span>
          <span className="line-clamp-2 text-[12px] leading-4 text-[#1C1F23]/45">
            {summary}
          </span>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 text-[12px] leading-4 text-[#1C1F23]/45">
        {meta}
      </div>
    </button>
  )
}

const CARD_GRID =
  'grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-3 min-[1680px]:grid-cols-4'

const Dot = () => <span aria-hidden className="h-2.5 w-px shrink-0 bg-[rgba(45,66,107,0.12)]" />

/* ── 工具箱 ── */

function ToolboxPane() {
  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [isMine, setIsMine] = useState(false)
  const [orderBy, setOrderBy] = useState('use_count')
  const [activeKey, setActiveKey] = useState('plaza')
  const [collapsed, setCollapsed] = useState(() => new Set<string>())

  const toggleGroup = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const filtered = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    const list = toolboxItems.filter((item) => {
      const matchKeyword = normalized
        ? `${item.title}${item.summary}`.toLowerCase().includes(normalized)
        : true
      const matchSource = source ? item.source === source : true
      const matchStatus = status ? item.status === status : true
      const matchMine = isMine ? item.isMine : true
      const matchNav =
        activeKey === 'plaza' ||
        item.groupKey === activeKey ||
        item.categoryKey === activeKey
      return matchKeyword && matchSource && matchStatus && matchMine && matchNav
    })
    return [...list].sort((a, b) =>
      orderBy === 'use_count' ? b.useCount - a.useCount : a.title.localeCompare(b.title),
    )
  }, [activeKey, isMine, keyword, orderBy, source, status])

  /** 按 section（官方广场 / 空间）分组 —— 与源站的两段式一致。 */
  const sections = useMemo(() => {
    const bySection = new Map<string, ToolboxItem[]>()
    for (const item of filtered) {
      const list = bySection.get(item.section) ?? []
      list.push(item)
      bySection.set(item.section, list)
    }
    return [...bySection.entries()].map(([key, items]) => ({
      key,
      label: toolboxSectionMeta[key as keyof typeof toolboxSectionMeta] ?? key,
      items,
    }))
  }, [filtered])

  return (
    <div className="flex h-full min-h-0">
      <aside className="thin-scroll w-[216px] shrink-0 overflow-y-auto border-r border-[rgba(45,66,107,0.12)] px-1.5 py-1">
        <button
          type="button"
          onClick={() => setActiveKey('plaza')}
          className={`flex h-10 w-full items-center gap-1.5 rounded-lg px-1.5 text-left text-[13px] font-medium leading-[18px] transition-colors ${
            activeKey === 'plaza' ? 'bg-[rgba(83,96,143,0.12)]' : 'hover:bg-black/[0.03]'
          }`}
        >
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded bg-[#E8F0FF] text-[11px] text-[#2B6CF6]">
            全
          </span>
          <span className="text-[#1C1F23]">广场</span>
          <span className="ml-auto text-[12px] text-[#1C1F23]/45">
            {toolboxNavStats.plazaTotal}
          </span>
        </button>

        {(toolboxNavGroups as ToolboxNavGroup[]).map((group) => {
          const isCollapsed = collapsed.has(group.key)
          return (
            <div key={group.key}>
              <button
                type="button"
                onClick={() => {
                  setActiveKey(group.key)
                  toggleGroup(group.key)
                }}
                className={`flex h-9 w-full items-center gap-1.5 rounded-lg px-1.5 text-left text-[13px] font-medium leading-[18px] transition-colors ${
                  activeKey === group.key
                    ? 'bg-[rgba(83,96,143,0.12)]'
                    : 'hover:bg-black/[0.03]'
                }`}
              >
                <span className="flex size-3.5 shrink-0 items-center justify-center text-[#1C1F23]/45">
                  {isCollapsed ? (
                    <ChevronRight size={12} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={12} strokeWidth={2} />
                  )}
                </span>
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt="" className="size-4 shrink-0 rounded" />
                ) : (
                  <span aria-hidden className="size-4 shrink-0 rounded bg-[rgba(83,96,143,0.12)]" />
                )}
                <span className="min-w-0 truncate text-[#1C1F23]">{group.label}</span>
                <span className="ml-auto shrink-0 text-[12px] text-[#1C1F23]/45">
                  {toolboxNavStats.groupTotals[group.key] ?? 0}
                </span>
              </button>
              {!isCollapsed &&
                group.children.map((child) => (
                  <button
                    key={child.key}
                    type="button"
                    onClick={() => setActiveKey(child.key)}
                    className={`flex h-7 w-full items-center gap-1.5 rounded-md pl-8 pr-2 text-left text-[13px] leading-[18px] transition-colors ${
                      activeKey === child.key
                        ? 'bg-[rgba(83,96,143,0.12)] text-[#1C1F23]'
                        : 'text-[#1C1F23]/80 hover:bg-black/[0.03]'
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{child.label}</span>
                    <span className="shrink-0 text-[12px] text-[#1C1F23]/45">
                      {toolboxNavStats.childTotals[child.key] ?? 0}
                    </span>
                  </button>
                ))}
            </div>
          )
        })}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <FilterBar action={<CreateButton label="创建工具" />}>
          <SearchInput value={keyword} placeholder="搜索工具" onChange={setKeyword} />
          <FilterSelect
            value={source}
            placeholder="来源"
            options={toolboxSourceOptions}
            onChange={setSource}
          />
          <FilterSelect
            value={status}
            placeholder="工具状态"
            options={toolboxStatusOptions}
            onChange={setStatus}
          />
          <CheckboxFilter checked={isMine} label="我创建的" onChange={setIsMine} />
          <FilterSelect
            value={orderBy}
            placeholder="热门排序"
            options={toolboxOrderOptions}
            onChange={(value) => setOrderBy(value || 'use_count')}
          />
        </FilterBar>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-8">
          {sections.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center text-[13px] text-[#1C1F23]/45">
              当前筛选条件下暂无工具
            </div>
          ) : (
            sections.map((section) => (
              <section key={section.key}>
                <SectionTitle label={section.label} count={section.items.length} />
                <div className={CARD_GRID}>
                  {section.items.map((item) => (
                    <ResourceCard
                      key={item.id}
                      title={item.title}
                      summary={item.summary}
                      coverText="🛠"
                      badge={item.source}
                      onOpen={() => toast(`打开工具「${item.title}」（演示）`)}
                      meta={
                        <>
                          <span className="truncate">{item.category}</span>
                          <Dot />
                          <span className="shrink-0">{item.owner}</span>
                          <Dot />
                          <span className="shrink-0">调用 {item.useCount}</span>
                        </>
                      }
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/* ── 知识库 ── */

function KnowledgePane() {
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('')
  const [isMine, setIsMine] = useState(false)

  const sections = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    const list = knowledgeItems.filter((item: KnowledgeItem) => {
      const matchKeyword = normalized
        ? `${item.title}${item.summary}`.toLowerCase().includes(normalized)
        : true
      const matchType = type ? item.type === type : true
      const matchMine = isMine ? item.isMine : true
      return matchKeyword && matchType && matchMine
    })
    const bySection = new Map<string, KnowledgeItem[]>()
    for (const item of list) {
      const bucket = bySection.get(item.section) ?? []
      bucket.push(item)
      bySection.set(item.section, bucket)
    }
    return [...bySection.entries()].map(([key, items]) => ({
      key,
      label: knowledgeSectionMeta[key as keyof typeof knowledgeSectionMeta] ?? key,
      items,
    }))
  }, [isMine, keyword, type])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FilterBar action={<CreateButton label="创建知识库" />}>
        <SearchInput value={keyword} placeholder="搜索知识库" onChange={setKeyword} />
        <FilterSelect
          value={type}
          placeholder="类型"
          options={knowledgeTypeOptions}
          onChange={setType}
        />
        <CheckboxFilter checked={isMine} label="我创建的" onChange={setIsMine} />
      </FilterBar>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {sections.map((section) => (
          <section key={section.key}>
            <SectionTitle label={section.label} count={section.items.length} />
            <div className={CARD_GRID}>
              {section.items.map((item) => (
                <ResourceCard
                  key={item.id}
                  title={item.title}
                  summary={item.summary}
                  cover={item.coverIconUrl ?? item.coverBackgroundUrl}
                  coverText={item.coverIconText ?? '📚'}
                  badge={item.type}
                  onOpen={() => toast(`打开知识库「${item.title}」（演示）`)}
                  meta={
                    <>
                      <span className="truncate">{item.owner}</span>
                      <Dot />
                      <span className="shrink-0">{item.documentCount} 篇</span>
                      <Dot />
                      <span className="shrink-0">{item.updatedAt}</span>
                    </>
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

/* ── 模型库 ── */

function ModelPane() {
  const [keyword, setKeyword] = useState('')
  const [scene, setScene] = useState('')
  const [ability, setAbility] = useState('')

  const sections = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    const list = modelItems.filter((item: ModelItem) => {
      const matchKeyword = normalized
        ? `${item.title}${item.summary}`.toLowerCase().includes(normalized)
        : true
      const matchScene = scene ? item.scenes.includes(scene) : true
      const matchAbility = ability ? item.abilities.includes(ability) : true
      return matchKeyword && matchScene && matchAbility
    })
    const byGroup = new Map<string, ModelItem[]>()
    for (const item of list) {
      const bucket = byGroup.get(item.group) ?? []
      bucket.push(item)
      byGroup.set(item.group, bucket)
    }
    return [...byGroup.entries()].map(([key, items]) => ({
      key,
      label: modelGroupMeta[key as keyof typeof modelGroupMeta] ?? key,
      items,
    }))
  }, [ability, keyword, scene])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FilterBar>
        <SearchInput value={keyword} placeholder="搜索模型" onChange={setKeyword} />
        <FilterSelect
          value={scene}
          placeholder="场景"
          options={modelSceneOptions.map((option) =>
            typeof option === 'string' ? { label: option, value: option } : option,
          )}
          onChange={setScene}
        />
        <FilterSelect
          value={ability}
          placeholder="能力"
          options={modelAbilityOptions.map((option) =>
            typeof option === 'string' ? { label: option, value: option } : option,
          )}
          onChange={setAbility}
        />
      </FilterBar>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {sections.map((section) => (
          <section key={section.key}>
            <SectionTitle label={section.label} count={section.items.length} />
            <div className={CARD_GRID}>
              {section.items.map((item) => (
                <ResourceCard
                  key={item.id}
                  title={item.title}
                  summary={item.summary}
                  cover={item.coverUrl}
                  coverText={item.coverLabel ?? '🤖'}
                  badge={item.modal}
                  onOpen={() => toast(`打开模型「${item.title}」（演示）`)}
                  meta={
                    <>
                      <span className="truncate">{item.provider ?? item.series ?? '—'}</span>
                      <Dot />
                      <span className="shrink-0">上下文 {item.contextLength}</span>
                      <Dot />
                      <span className="shrink-0">{item.status ?? '已上线'}</span>
                    </>
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

/* ── 发布器 ── */

function PublisherPane() {
  const [keyword, setKeyword] = useState('')
  const [genre, setGenre] = useState('')
  const [entry, setEntry] = useState('')

  const items = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return publisherItems.filter((item: PublisherItem) => {
      const matchKeyword = normalized
        ? `${item.name}${item.description}`.toLowerCase().includes(normalized)
        : true
      const matchGenre = genre ? item.genre === genre : true
      const matchEntry = entry ? item.entry === entry : true
      return matchKeyword && matchGenre && matchEntry
    })
  }, [entry, genre, keyword])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FilterBar>
        <SearchInput value={keyword} placeholder="搜索发布器" onChange={setKeyword} />
        <FilterSelect
          value={genre}
          placeholder="体裁"
          options={publisherGenreOptions.map((option) =>
            typeof option === 'string' ? { label: option, value: option } : option,
          )}
          onChange={setGenre}
        />
        <FilterSelect
          value={entry}
          placeholder="入口"
          options={publisherEntryOptions.map((option) => ({ label: option, value: option }))}
          onChange={setEntry}
        />
      </FilterBar>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        <SectionTitle label="全部发布器" count={items.length} />
        <div className={CARD_GRID}>
          {items.map((item) => (
            <ResourceCard
              key={item.id}
              title={item.name}
              summary={item.description}
              cover={item.coverImage}
              badge={item.sceneLabel}
              onOpen={() => toast(`打开发布器「${item.name}」（演示）`)}
              meta={
                <>
                  <span className="truncate">{item.entryLabel}</span>
                  <Dot />
                  <span className="shrink-0">{item.genre}</span>
                  {item.available === false && (
                    <>
                      <Dot />
                      <span className="shrink-0">敬请期待</span>
                    </>
                  )}
                </>
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 触发器 ── */

function TriggerPane() {
  const [keyword, setKeyword] = useState('')
  const [scene, setScene] = useState('')
  const [method, setMethod] = useState('')
  const [app, setApp] = useState('')

  const items = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return triggerItems.filter((item: TriggerItem) => {
      const matchKeyword = normalized
        ? `${item.title}${item.summary}`.toLowerCase().includes(normalized)
        : true
      const matchScene = scene ? item.scenes.includes(scene) : true
      const matchMethod = method ? item.method === method : true
      const matchApp = app ? item.apps.includes(app) : true
      return matchKeyword && matchScene && matchMethod && matchApp
    })
  }, [app, keyword, method, scene])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FilterBar>
        <SearchInput value={keyword} placeholder="搜索触发器" onChange={setKeyword} />
        <FilterSelect
          value={scene}
          placeholder="场景"
          options={triggerSceneOptions.map((option) => ({ label: option, value: option }))}
          onChange={setScene}
        />
        <FilterSelect
          value={method}
          placeholder="触发方式"
          options={triggerMethodOptions.map((option) => ({ label: option, value: option }))}
          onChange={setMethod}
        />
        <FilterSelect
          value={app}
          placeholder="应用"
          options={triggerAppOptions.map((option) => ({ label: option, value: option }))}
          onChange={setApp}
        />
      </FilterBar>
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        <SectionTitle label="全部触发器" count={items.length} />
        <div className={CARD_GRID}>
          {items.map((item) => (
            <ResourceCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              cover={item.iconUrl ?? item.coverUrl}
              coverText={item.coverIcon ?? '⚡️'}
              badge={item.method}
              onOpen={() => toast(`打开触发器「${item.title}」（演示）`)}
              meta={
                <>
                  <span className="truncate">{item.scenes.join(' / ')}</span>
                  <Dot />
                  <span className="shrink-0">{item.updatedAt}</span>
                  {!item.available && (
                    <>
                      <Dot />
                      <span className="shrink-0">敬请期待</span>
                    </>
                  )}
                </>
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 壳层 ── */

export default function ResourceLibraryPage() {
  const [tab, setTab] = useState<ResourceTabKey>('toolbox')

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <div className="sticky top-0 z-20 shrink-0 bg-white px-6 shadow-[inset_0_-1px_0_rgba(45,66,107,0.12)]">
        <div className="flex items-center gap-6">
          <h1 className="shrink-0 text-[20px] font-semibold leading-6 tracking-[-0.08px] text-[#1C1F23]">
            资源库
          </h1>
          <nav aria-label="资源库分类" className="flex min-w-0 flex-1 items-center gap-1">
            {resourceTabOptions.map((option) => {
              const active = option.key === tab
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setTab(option.key)}
                  className={`relative flex h-[52px] shrink-0 items-center px-3 text-[14px] transition-colors ${
                    active
                      ? 'font-medium text-[#1C1F23]'
                      : 'text-[#1C1F23]/60 hover:text-[#1C1F23]'
                  }`}
                >
                  {option.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#1C1F23]"
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'toolbox' && <ToolboxPane />}
        {tab === 'knowledge' && <KnowledgePane />}
        {tab === 'model' && <ModelPane />}
        {tab === 'publisher' && <PublisherPane />}
        {tab === 'trigger' && <TriggerPane />}
      </div>
    </div>
  )
}
