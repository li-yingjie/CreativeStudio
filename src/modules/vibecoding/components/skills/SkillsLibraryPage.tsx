import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import {
  Bot,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Search,
  Users,
  User,
  Puzzle,
  BadgeCheck,
} from '@/shared/icons'
import {
  type SkillCardItem,
  type SkillCategoryNode,
  skillCategories,
  skillCategorySummary,
  skillSections,
} from './skills-data'

/* ─── 技能库 ───
 *
 * 结构与样式对齐 AI 平台 (ai_design) 的 components/skills/SkillsPage.tsx +
 * routes/index.css 里的 .skills-* 规则。那边搭在 @douyin-ai/ui 上（Tree /
 * Filter / Badge / Typography …），这里按同样的尺寸与配色用 Tailwind 重建：
 *   左 216 分类栏（广场树 + 小花树 + 团队/个人）｜ 右 筛选条 + 分组卡片网格
 * 卡片 191.57 高、封面 93.43，栅格 auto-fill minmax(218px, 1fr)、间距 12。 */

const SOURCE_OPTIONS = [
  { label: '抖音官方', value: 'official' },
  { label: '三方提供', value: 'third-party' },
]

const STATUS_OPTIONS = [
  { label: '已发布', value: 'published' },
  { label: '未发布', value: 'draft' },
]

const ORDER_OPTIONS = [
  { label: '使用量排序', value: 'use_count' },
  { label: '更新时间排序', value: 'publish_time' },
]

/** 分类图标的渐变色板 —— 对应 .skills-category-icon.is-* */
const TONE_GRADIENT: Record<string, string> = {
  gray: 'linear-gradient(135deg, #101113, #45484d)',
  blue: 'linear-gradient(135deg, #2b6cf6, #7fb7ff)',
  violet: 'linear-gradient(135deg, #6d45d8, #9a7cf4)',
  cyan: 'linear-gradient(135deg, #2f8af7, #62d8f6)',
  green: 'linear-gradient(135deg, #17a66a, #82dd9b)',
  orange: 'linear-gradient(135deg, #ff8a00, #ffc66b)',
  purple: 'linear-gradient(135deg, #844cff, #d177ff)',
}

const formatCount = (value: number) => value.toLocaleString('zh-CN')

const collectLeafKeys = (node: SkillCategoryNode): string[] =>
  node.children?.length ? node.children.flatMap(collectLeafKeys) : [node.key]

const findCategoryNode = (
  nodes: SkillCategoryNode[],
  key: string,
): SkillCategoryNode | undefined => {
  for (const node of nodes) {
    if (node.key === key) return node
    const match = node.children ? findCategoryNode(node.children, key) : undefined
    if (match) return match
  }
  return undefined
}

const collectGroupKeys = (nodes: SkillCategoryNode[]): string[] =>
  nodes.flatMap((node) =>
    node.children?.length ? [node.key, ...collectGroupKeys(node.children)] : [],
  )

const xiaohuaCategory = skillCategories.find((c) => c.key === 'xiaohua')
const standardCategories = skillCategories.filter((c) => c.key !== 'xiaohua')
const ALL_GROUP_KEYS = [
  ...collectGroupKeys(standardCategories),
  ...collectGroupKeys(xiaohuaCategory?.children ?? []),
]

/** 一级入口（广场 / 小花 / 团队 / 个人）：40 高、图标 20 方块 + 计数气泡。 */
function PrimaryEntry({
  icon,
  label,
  count,
  active,
  collapsible,
  collapsed,
  onToggleCollapse,
  onClick,
}: {
  icon: ReactNode
  label: string
  count: number
  active: boolean
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  onClick: () => void
}) {
  return (
    <div className="group relative w-full">
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg px-1.5 py-2.5 text-[13px] font-medium leading-[18px] transition-colors ${
          active ? 'bg-[rgba(83,96,143,0.12)]' : 'hover:bg-black/[0.03]'
        }`}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {/* hover 时一级图标让位给折叠箭头 —— 与源站同款 */}
          <span className={collapsible ? 'group-hover:opacity-0' : undefined}>
            {icon}
          </span>
          <span className="truncate text-[#1C1F23]">{label}</span>
        </span>
        <span className="inline-flex h-[18px] min-w-2 shrink-0 items-center justify-center rounded-2xl border border-white bg-[rgba(83,96,143,0.07)] px-[5px] text-[12px] font-normal leading-4 text-[#1C1F23]/60">
          {count > 999 ? '999+' : count}
        </span>
      </button>
      {collapsible && (
        <button
          type="button"
          aria-label={`${collapsed ? '展开' : '收起'}${label}分类`}
          title={`${collapsed ? '展开' : '收起'}${label}分类`}
          onClick={onToggleCollapse}
          className="pointer-events-none absolute left-1.5 top-2.5 flex size-5 items-center justify-center rounded text-[#1C1F23]/60 opacity-0 transition-opacity hover:bg-black/[0.04] group-hover:pointer-events-auto group-hover:opacity-100"
        >
          {collapsed ? (
            <ChevronRight size={12} strokeWidth={2} />
          ) : (
            <ChevronDown size={12} strokeWidth={2} />
          )}
        </button>
      )}
    </div>
  )
}

/** 分类树节点：叶子可选中，有子级的可展开。 */
function CategoryTree({
  nodes,
  depth,
  selected,
  expanded,
  onSelect,
  onToggle,
}: {
  nodes: SkillCategoryNode[]
  depth: number
  selected: string
  expanded: Set<string>
  onSelect: (value: string) => void
  onToggle: (key: string) => void
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length)
        const value = hasChildren ? `group:${node.key}` : `category:${node.key}`
        const isOpen = expanded.has(node.key)
        const active = selected === value
        return (
          <div key={node.key}>
            <button
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                onSelect(value)
                if (hasChildren) onToggle(node.key)
              }}
              className={`flex h-7 w-full items-center gap-1 rounded-md pr-[5px] text-[13px] leading-[18px] transition-colors ${
                active
                  ? 'bg-[rgba(83,96,143,0.12)] text-[#1C1F23]'
                  : 'text-[#1C1F23]/80 hover:bg-black/[0.03]'
              } ${hasChildren ? 'font-medium' : ''}`}
              style={{ paddingLeft: 4 + depth * 14 }}
            >
              <span className="flex size-3.5 shrink-0 items-center justify-center">
                {hasChildren ? (
                  isOpen ? (
                    <ChevronDown size={12} strokeWidth={2} className="text-[#1C1F23]/45" />
                  ) : (
                    <ChevronRight size={12} strokeWidth={2} className="text-[#1C1F23]/45" />
                  )
                ) : null}
              </span>
              {node.iconUrl ? (
                <img
                  src={node.iconUrl}
                  alt=""
                  aria-hidden
                  className="size-3.5 shrink-0 rounded"
                />
              ) : node.iconKind === 'puzzle' ? (
                <span className="flex size-3.5 shrink-0 items-center justify-center rounded bg-[#E4F6FB] text-[#0E9CC0]">
                  <Puzzle size={10} strokeWidth={2} />
                </span>
              ) : node.iconTone ? (
                <span
                  aria-hidden
                  className="size-3.5 shrink-0 rounded"
                  style={{ background: TONE_GRADIENT[node.iconTone] }}
                />
              ) : (
                <span aria-hidden className="size-3.5 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate text-left">{node.label}</span>
              <span className="shrink-0 text-[12px] leading-4 text-[#1C1F23]/45">
                {node.count}
              </span>
            </button>
            {hasChildren && isOpen && (
              <CategoryTree
                nodes={node.children ?? []}
                depth={depth + 1}
                selected={selected}
                expanded={expanded}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

/** 下拉筛选（来源 / 状态 / 排序）—— 演示态的原生 select，样式对齐筛选条。 */
function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: { label: string; value: string }[]
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

function SkillCard({ item }: { item: SkillCardItem }) {
  return (
    <button
      type="button"
      onClick={() => toast(`打开技能「${item.name}」（演示）`)}
      className="flex h-[191.57px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#F2F2F7] bg-white text-left transition-[box-shadow,transform] duration-150 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(31,35,41,0.08)]"
    >
      <div
        className="relative h-[93.43px] shrink-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${item.coverUrl.replace(/"/g, '\\"')}")` }}
      >
        {item.coverIcon && (
          <span className="absolute left-1/2 top-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[rgba(28,31,35,0.08)] bg-white text-[24px] shadow-[0_1.11px_4.46px_rgba(0,0,0,0.08)]">
            {item.coverIcon}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-2.5 px-3 pb-3 pt-2">
        <div className="flex w-full min-w-0 items-center gap-1">
          <span className="min-w-0 truncate text-[14px] font-medium text-[#1C1F23]">
            {item.name}
          </span>
          <span className="shrink-0 rounded border border-[rgba(45,66,107,0.12)] bg-white px-1 text-[11px] font-medium leading-4 text-[#1C1F23]/70">
            Skill
          </span>
        </div>
        <p className="line-clamp-1 text-[12px] leading-4 text-[#1C1F23]/45">
          {item.description}
        </p>
        <div className="flex h-[18px] w-full min-w-0 items-center gap-2 leading-none">
          <span className="inline-flex h-4 min-w-0 max-w-[50%] items-center gap-1">
            <span className="inline-flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-white">
              <BadgeCheck size={10} strokeWidth={2} />
            </span>
            <span className="truncate text-[12px] text-[#1C1F23]/45">{item.source}</span>
          </span>
          <span aria-hidden className="h-2.5 w-px shrink-0 bg-[rgba(45,66,107,0.12)]" />
          <span className="shrink-0 text-[12px] text-[#1C1F23]/45">{item.updatedAt}</span>
          <span aria-hidden className="h-2.5 w-px shrink-0 bg-[rgba(45,66,107,0.12)]" />
          <span className="inline-flex shrink-0 items-center whitespace-nowrap text-[12px] leading-4 text-[#1C1F23]/60">
            <Bot size={12} strokeWidth={1.8} className="mr-1" />
            {formatCount(item.useCount)}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function SkillsLibraryPage() {
  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [isMine, setIsMine] = useState(false)
  const [orderBy, setOrderBy] = useState('use_count')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expanded, setExpanded] = useState(() => new Set(ALL_GROUP_KEYS))
  const [squareCollapsed, setSquareCollapsed] = useState(false)
  const [xiaohuaCollapsed, setXiaohuaCollapsed] = useState(false)

  const toggleGroup = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  /** 选中分类 → 允许出现的 categoryKey 集合；'all' 表示不过滤。 */
  const visibleCategoryKeys = useMemo(() => {
    if (selectedCategory === 'all') return null
    if (selectedCategory === 'team' || selectedCategory === 'personal') {
      return new Set<string>()
    }
    const [kind, key] = selectedCategory.split(':')
    if (!key) return null
    if (kind === 'category') return new Set([key])
    const node = findCategoryNode(skillCategories, key)
    return node ? new Set(collectLeafKeys(node)) : null
  }, [selectedCategory])

  const filteredSections = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return skillSections
      .filter(
        (section) =>
          !visibleCategoryKeys ||
          section.items.some((item) => visibleCategoryKeys.has(item.categoryKey)),
      )
      .map((section) => {
        const items = section.items.filter((item) => {
          const matchKeyword = normalized
            ? `${item.name}${item.description}`.toLowerCase().includes(normalized)
            : true
          const matchSource = source
            ? item.source === (source === 'official' ? '抖音官方' : '三方提供')
            : true
          const matchStatus = status ? status === 'published' : true
          const matchMine = isMine ? item.id.includes('miniapp') : true
          return matchKeyword && matchSource && matchStatus && matchMine
        })
        return {
          ...section,
          items:
            orderBy === 'use_count'
              ? [...items].sort((a, b) => b.useCount - a.useCount)
              : items,
        }
      })
      .filter((section) => section.items.length > 0)
  }, [isMine, keyword, orderBy, source, status, visibleCategoryKeys])

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[rgba(45,66,107,0.12)] px-6">
        <h1 className="text-[16px] font-semibold text-[#1C1F23]">技能库</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── 左：分类 216 ── */}
        <div className="w-[216px] shrink-0 border-r border-[rgba(45,66,107,0.12)] bg-white">
          <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 px-1.5 pt-1">
              <PrimaryEntry
                label="广场"
                count={skillCategorySummary.squareTotal}
                active={selectedCategory === 'all'}
                collapsible
                collapsed={squareCollapsed}
                onToggleCollapse={() => setSquareCollapsed((v) => !v)}
                onClick={() => setSelectedCategory('all')}
                icon={
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded bg-[#E8F0FF] text-[#2B6CF6]">
                    <BadgeCheck size={12} strokeWidth={2} />
                  </span>
                }
              />
            </div>

            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
              {!squareCollapsed && (
                <div className="ml-4 mr-3">
                  <CategoryTree
                    nodes={standardCategories}
                    depth={0}
                    selected={selectedCategory}
                    expanded={expanded}
                    onSelect={setSelectedCategory}
                    onToggle={toggleGroup}
                  />
                </div>
              )}

              {xiaohuaCategory && (
                <>
                  <div className="sticky bottom-[88px] z-[1] mt-2 bg-white px-1.5">
                    <PrimaryEntry
                      label={xiaohuaCategory.label}
                      count={xiaohuaCategory.count}
                      active={selectedCategory === `group:${xiaohuaCategory.key}`}
                      collapsible
                      collapsed={xiaohuaCollapsed}
                      onToggleCollapse={() => setXiaohuaCollapsed((v) => !v)}
                      onClick={() =>
                        setSelectedCategory(`group:${xiaohuaCategory.key}`)
                      }
                      icon={
                        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded bg-[#E4F6FB] text-[#0E9CC0]">
                          <Puzzle size={12} strokeWidth={2} />
                        </span>
                      }
                    />
                  </div>
                  {!xiaohuaCollapsed && (xiaohuaCategory.children?.length ?? 0) > 0 && (
                    <div className="ml-4 mr-3">
                      <CategoryTree
                        nodes={xiaohuaCategory.children ?? []}
                        depth={0}
                        selected={selectedCategory}
                        expanded={expanded}
                        onSelect={setSelectedCategory}
                        onToggle={toggleGroup}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="sticky bottom-0 z-[2] shrink-0 bg-white px-1.5 py-1">
                <PrimaryEntry
                  label="团队"
                  count={skillCategorySummary.teamTotal}
                  active={selectedCategory === 'team'}
                  onClick={() => setSelectedCategory('team')}
                  icon={
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded bg-[#EFE9FF] text-[#6D45D8]">
                      <Users size={12} strokeWidth={2} />
                    </span>
                  }
                />
                <PrimaryEntry
                  label="个人"
                  count={skillCategorySummary.personalTotal}
                  active={selectedCategory === 'personal'}
                  onClick={() => setSelectedCategory('personal')}
                  icon={
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded bg-[#F3E8FF] text-[#844CFF]">
                      <User size={12} strokeWidth={2} />
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 右：筛选条 + 卡片 ── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 pb-2.5 pt-3">
            <label className="relative inline-flex h-8 w-[200px] items-center">
              <Search
                size={14}
                aria-hidden
                className="pointer-events-none absolute left-2.5 text-[#1C1F23]/45"
              />
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索"
                aria-label="搜索技能"
                className="h-8 w-full rounded-md border border-[rgba(45,66,107,0.12)] bg-white pl-[30px] pr-2 text-[13px] text-[#1C1F23] outline-none transition-colors placeholder:text-[#1C1F23]/35 focus:border-[rgba(45,66,107,0.28)]"
              />
            </label>
            <FilterSelect
              value={source}
              placeholder="来源"
              options={SOURCE_OPTIONS}
              onChange={setSource}
            />
            <FilterSelect
              value={status}
              placeholder="状态"
              options={STATUS_OPTIONS}
              onChange={setStatus}
            />
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-[#1C1F23]/80 transition-colors hover:bg-black/[0.03]">
              <input
                type="checkbox"
                checked={isMine}
                onChange={(event) => setIsMine(event.target.checked)}
                className="size-3.5 cursor-pointer accent-[#1C1F23]"
              />
              我创建的
            </label>
            <FilterSelect
              value={orderBy}
              placeholder="使用量排序"
              options={ORDER_OPTIONS}
              onChange={(value) => setOrderBy(value || 'use_count')}
            />
            <button
              type="button"
              onClick={() => toast('创建 Skill（演示）')}
              className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#1C1F23] px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <PlusCircle size={14} strokeWidth={1.8} />
              创建Skill
            </button>
          </div>

          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6">
            {filteredSections.map((section) => (
              <section key={section.key} className="flex flex-col">
                <div className="sticky top-0 z-[1] -ml-3 flex items-center gap-2 bg-white px-3 py-1.5">
                  <span className="text-[14px] font-medium text-[#1C1F23]">
                    {section.label}
                  </span>
                  <span className="inline-flex h-[18px] min-w-2 items-center justify-center rounded-2xl bg-[rgba(83,96,143,0.07)] px-[5px] text-[12px] leading-4 text-[#1C1F23]/60">
                    {section.count}
                  </span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(218px,1fr))] gap-3 pb-2.5 pt-1.5">
                  {section.items.map((item) => (
                    <SkillCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
            {filteredSections.length === 0 && (
              <div className="py-20 text-center text-[13px] text-[#1C1F23]/45">
                没有符合条件的技能
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
