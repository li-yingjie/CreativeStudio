import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { LucideIcon } from '@/shared/icons'
import {
  ArrowUpRight,
  BookOpen,
  Box,
  Check,
  FolderCode,
  Gamepad2,
  Palette,
  RotateCcw,
  Search,
  Wrench,
} from '@/shared/icons'

export type MentionVariant =
  | 'brand-kit'
  | 'ip-kit'
  | 'workflow'
  | 'tool'
  | 'component-library'
  | 'gameplay-library'
  | 'knowledge'

export interface MentionItem {
  id: string
  name: string
  tag?: string
  summary?: string
  category?: string
  group?: string
  variant?: MentionVariant
  preview?: string
  accent?: string
  highlights?: string[]
}

export type MentionTab = 'skills' | 'tools' | 'knowledge'
type MentionViewTab = MentionTab | 'all' | 'plugin' | 'generative-model'
type MentionViewItem = MentionItem & { mentionTab: MentionTab }

interface AnchorRect {
  left: number
  top: number
  width: number
}

interface MentionPickerProps {
  open: boolean
  anchor: AnchorRect | null
  skills: MentionItem[]
  tools: MentionItem[]
  knowledge: MentionItem[]
  onInsert: (item: MentionItem, tab: MentionTab) => void
  onClose: () => void
  onBrowseAll?: (tab: MentionTab) => void
  onResetSelection?: () => void
  placement?: 'above' | 'below'
  maxWidth?: number
  maxHeight?: number
  matchAnchorWidth?: boolean
  selectedKeys?: readonly string[]
}

const TABS: { id: Exclude<MentionViewTab, 'all'>; label: string }[] = [
  { id: 'plugin', label: 'Plugin' },
  { id: 'skills', label: '技能库' },
  { id: 'tools', label: '工具' },
  { id: 'generative-model', label: '生成式模型' },
  { id: 'knowledge', label: '知识库' },
]

const variantMeta: Record<
  MentionVariant,
  { label: string; icon: LucideIcon; description: string }
> = {
  'brand-kit': {
    label: 'Brand Kit',
    icon: Palette,
    description: '引用后约束 Logo、品牌色、字体角色、版式与联名关系。',
  },
  'ip-kit': {
    label: 'IP Kit',
    icon: Box,
    description: '引用后保持角色形象、动作表情、道具和授权边界一致。',
  },
  workflow: {
    label: '生成技能',
    icon: FolderCode,
    description: '调用一套已编排的生成流程，并按交付目标推进。',
  },
  tool: {
    label: '工具',
    icon: Wrench,
    description: '作为单步能力调用，输入明确参数并返回结构化结果。',
  },
  'component-library': {
    label: '页面组件库',
    icon: Box,
    description: '按端能力、组件结构和可配置字段选择可复用组件。',
  },
  'gameplay-library': {
    label: '玩法库',
    icon: Gamepad2,
    description: '引用完整玩法能力包，包括状态、配置、校验和交互规则。',
  },
  knowledge: {
    label: '知识库',
    icon: BookOpen,
    description: '检索并引用规范、标准和有来源证据的结构化知识。',
  },
}

const itemsForTab = (
  tab: MentionTab,
  skills: MentionItem[],
  tools: MentionItem[],
  knowledge: MentionItem[],
) => (tab === 'skills' ? skills : tab === 'tools' ? tools : knowledge)

const itemsForViewTab = (
  tab: MentionViewTab,
  skills: MentionItem[],
  tools: MentionItem[],
  knowledge: MentionItem[],
): MentionViewItem[] => {
  const withTab = (items: MentionItem[], mentionTab: MentionTab) =>
    items.map((item) => ({ ...item, mentionTab }))
  if (tab === 'all') {
    return [
      ...withTab(skills, 'skills'),
      ...withTab(tools, 'tools'),
      ...withTab(knowledge, 'knowledge'),
    ]
  }
  if (tab === 'plugin' || tab === 'generative-model') return []
  return withTab(itemsForTab(tab, skills, tools, knowledge), tab)
}

export default function MentionPicker({
  open,
  anchor,
  skills,
  tools,
  knowledge,
  onInsert,
  onClose,
  onBrowseAll,
  onResetSelection,
  placement = 'above',
  maxWidth = 960,
  maxHeight = 520,
  matchAnchorWidth = false,
  selectedKeys = [],
}: MentionPickerProps) {
  const [tab, setTab] = useState<MentionViewTab>('all')
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [smartSelection, setSmartSelection] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const sourceItems = useMemo(
    () => itemsForViewTab(tab, skills, tools, knowledge),
    [knowledge, skills, tab, tools],
  )
  const categoryGroups = useMemo(
    () => {
      const groups = new Map<string, Set<string>>()
      sourceItems.forEach((item) => {
        if (!item.category) return
        const group = item.group || '其他'
        const values = groups.get(group) ?? new Set<string>()
        values.add(item.category)
        groups.set(group, values)
      })
      return Array.from(groups, ([group, values]) => ({
        group,
        categories: Array.from(values),
      }))
    },
    [sourceItems],
  )
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const visibleItems = useMemo(
    () =>
      sourceItems.filter((item) => {
        if (category !== '全部' && item.category !== category) return false
        if (!normalizedQuery) return true
        return `${item.name} ${item.summary ?? ''} ${item.tag ?? ''}`
          .toLocaleLowerCase('zh-CN')
          .includes(normalizedQuery)
      }),
    [category, normalizedQuery, sourceItems],
  )
  const activeItem =
    visibleItems.find((item) => `${item.mentionTab}:${item.id}` === activeId) ??
    visibleItems[0] ??
    null

  const insertItem = useCallback(
    (item: MentionViewItem) => {
      const { mentionTab, ...mentionItem } = item
      onInsert(mentionItem, mentionTab)
    },
    [onInsert],
  )

  useEffect(() => {
    if (!open) return
    const onMouseDown = (event: MouseEvent) => {
      if (
        ref.current &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        onClose()
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Enter' && activeItem) {
        event.preventDefault()
        insertItem(activeItem)
      }
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [activeItem, insertItem, onClose, open])

  if (!open || !anchor) return null

  const width = Math.min(
    matchAnchorWidth ? anchor.width : maxWidth,
    maxWidth,
    window.innerWidth - 32,
  )
  const availableHeight =
    placement === 'below'
      ? window.innerHeight - anchor.top - 26
      : anchor.top - 26
  const height = Math.min(maxHeight, Math.max(1, availableHeight))
  const left = Math.max(16, Math.min(anchor.left, window.innerWidth - width - 16))
  const requestedTop = placement === 'below' ? anchor.top + 10 : anchor.top - height - 10
  const top = Math.max(16, Math.min(requestedTop, window.innerHeight - height - 16))

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="引用技能、工具或知识库"
      style={{ position: 'fixed', left, top, width, height, zIndex: 1000 }}
      className="flex flex-col overflow-hidden rounded-[18px] border border-black/[0.09] bg-white shadow-[0_24px_80px_-24px_rgba(22,24,35,0.34)]"
    >
      <div className="shrink-0 border-b border-black/[0.07] px-3 pt-3">
        <div className="flex items-center gap-2">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-black/[0.09] px-3">
            <Search size={15} className="shrink-0 text-[#161823]/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 Plugin / 技能 / 工具..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#161823] outline-none placeholder:text-[#161823]/32" />
          </label>
          <button type="button" onClick={() => { setCategory('全部'); setQuery(''); setActiveId(null); setSmartSelection(true); onResetSelection?.() }} className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-black/[0.09] px-3 text-[12px] font-medium text-[#161823]/66 hover:bg-[#F7F8F9]"><RotateCcw size={14} />恢复默认</button>
        </div>
        <div className="mt-1 flex h-11 min-w-0 items-end justify-between gap-3">
          <div className="thin-scroll flex min-w-0 flex-1 items-end gap-6 overflow-x-auto">
            <button
              type="button"
              aria-pressed={tab === 'all'}
              onClick={() => {
                setTab('all')
                setCategory('全部')
                setActiveId(null)
              }}
              className={`relative flex h-11 shrink-0 items-center gap-1.5 text-[13px] ${
                tab === 'all'
                  ? 'font-semibold text-[#161823]'
                  : 'text-[#161823]/48 hover:text-[#161823]/75'
              }`}
            >
              全部
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === 'all' ? 'bg-[#E9EAED] text-[#161823]/62' : 'bg-[#F4F5F6] text-[#161823]/35'}`}>{skills.length + tools.length + knowledge.length}</span>
              {tab === 'all' ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t bg-[#161823]" /> : null}
            </button>
            {TABS.map((item) => {
              const active = item.id === tab
              const count = item.id === 'skills'
                ? skills.length
                : item.id === 'tools'
                  ? tools.length
                  : item.id === 'knowledge'
                    ? knowledge.length
                    : 0
              return <button key={item.id} type="button" aria-pressed={active} onClick={() => { setTab(item.id); setCategory('全部'); setActiveId(null) }} className={`relative flex h-11 shrink-0 items-center gap-1.5 text-[13px] ${active ? 'font-semibold text-[#161823]' : 'text-[#161823]/48 hover:text-[#161823]/75'}`}>{item.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-[#E9EAED] text-[#161823]/62' : 'bg-[#F4F5F6] text-[#161823]/35'}`}>{count}</span>{active ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t bg-[#161823]" /> : null}</button>
            })}
          </div>
          <button type="button" aria-pressed={smartSelection} onClick={() => setSmartSelection((enabled) => !enabled)} className="flex h-11 shrink-0 items-center gap-2 border-l border-black/[0.07] pl-4 pr-1 text-[12px] font-semibold text-[#161823]">
            <span className={`grid size-4 place-items-center rounded ${smartSelection ? 'bg-[#161823] text-white' : 'border border-black/[0.18] text-transparent'}`}><Check size={12} strokeWidth={2.4} /></span>智能选择
          </button>
        </div>
      </div>

      <div className={`grid min-h-0 flex-1 ${tab === 'skills' ? 'grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
        {tab === 'skills' ? <aside className="thin-scroll hidden overflow-y-auto border-r border-black/[0.07] bg-[#FAFAFB] p-3 sm:block">
          <nav className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setCategory('全部')
                setActiveId(null)
              }}
              className={`flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-left text-[12px] ${
                category === '全部'
                  ? 'bg-[#EEF0F3] font-medium text-[#161823]'
                  : 'text-[#161823]/58 hover:bg-black/[0.035] hover:text-[#161823]'
              }`}
            >
              <span className="truncate">全部</span>
              <span className="text-[10px] tabular-nums text-[#161823]/30">{sourceItems.length}</span>
            </button>
            {categoryGroups.map((group) => (
              <div key={group.group} className="pt-2">
                <p className="px-2.5 pb-1 text-[10px] font-semibold text-[#161823]/38">{group.group}</p>
                {group.categories.map((item) => (
                  <button
                    key={`${group.group}:${item}`}
                    type="button"
                    onClick={() => {
                      setCategory(item)
                      setActiveId(null)
                    }}
                    className={`flex h-8 w-full items-center rounded-lg px-2.5 text-left text-[12px] ${
                      category === item
                        ? 'bg-[#EEF0F3] font-medium text-[#161823]'
                        : 'text-[#161823]/58 hover:bg-black/[0.035] hover:text-[#161823]'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside> : null}

        <section className="thin-scroll min-h-0 overflow-y-auto">
          {visibleItems.length ? (
            visibleItems.map((item) => {
              const itemKey = `${item.mentionTab}:${item.id}`
              const active = itemKey === activeId
              const selected = selectedKeys.includes(itemKey)
              const meta = variantMeta[item.variant ?? (item.mentionTab === 'tools' ? 'tool' : item.mentionTab === 'knowledge' ? 'knowledge' : 'workflow')]
              return (
                <div
                  key={itemKey}
                  className={`group flex min-h-12 w-full items-center gap-3 border-b border-black/[0.055] px-4 py-2 text-left transition-colors last:border-b-0 ${
                    active ? 'bg-[#F5F6F8]' : 'hover:bg-[#F8F8F9]'
                  }`}
                >
                  <button type="button" onClick={() => setActiveId(itemKey)} onDoubleClick={() => insertItem(item)} className="flex min-w-0 flex-1 items-center text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-[#161823]">{item.name}</span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-[#161823]/42">{item.summary ?? meta.description}</span>
                  </span>
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={selected || smartSelection}
                    aria-label={`引用${item.name}`}
                    onClick={() => {
                      setSmartSelection(false)
                      insertItem(item)
                    }}
                    className={`relative h-5 w-9 shrink-0 rounded-full shadow-inner transition-colors ${
                      selected || smartSelection ? 'bg-[#3370FF]' : 'bg-[#C9CBD0] hover:bg-[#3370FF]'
                    }`}
                  ><i className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${selected || smartSelection ? 'translate-x-4' : ''}`} /></button>
                </div>
              )
            })
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-[12px] text-[#161823]/38">没有匹配项</div>
          )}
        </section>
      </div>

      <footer className="flex h-9 shrink-0 items-center justify-between border-t border-black/[0.07] bg-[#FAFAFB] px-4 text-[10px] text-[#161823]/38">
        <span>单击查看 · 点击开关、双击或按 Enter 引用</span>
        {onBrowseAll && (tab === 'skills' || tab === 'tools' || tab === 'knowledge') ? (
          <button
            type="button"
            onClick={() => onBrowseAll(tab)}
            className="flex items-center gap-1 font-medium text-[#161823]/58 hover:text-[#161823]"
          >
            {tab === 'skills' ? '技能库管理' : '浏览全部'} <ArrowUpRight size={12} />
          </button>
        ) : null}
      </footer>
    </div>,
    document.body,
  )
}
