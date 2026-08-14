import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from '@/shared/icons'
import {
  ArrowUpRight,
  BookOpen,
  Box,
  ChevronRight,
  FolderCode,
  Gamepad2,
  Library,
  Palette,
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
}

const TABS: { id: MentionTab; label: string; icon: LucideIcon }[] = [
  { id: 'skills', label: '技能', icon: FolderCode },
  { id: 'tools', label: '工具', icon: Wrench },
  { id: 'knowledge', label: '知识库', icon: Library },
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

export default function MentionPicker({
  open,
  anchor,
  skills,
  tools,
  knowledge,
  onInsert,
  onClose,
  onBrowseAll,
}: MentionPickerProps) {
  const [tab, setTab] = useState<MentionTab>('skills')
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const sourceItems = itemsForTab(tab, skills, tools, knowledge)
  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(sourceItems.map((item) => item.category).filter(Boolean) as string[]))],
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
    visibleItems.find((item) => item.id === activeId) ?? visibleItems[0] ?? null

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
        onInsert(activeItem, tab)
      }
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [activeItem, onClose, onInsert, open, tab])

  useEffect(() => {
    setCategory('全部')
    setQuery('')
    setActiveId(null)
  }, [tab])

  if (!open || !anchor) return null

  const width = Math.min(880, window.innerWidth - 32)
  const height = Math.min(430, window.innerHeight - 32)
  const left = Math.max(16, Math.min(anchor.left, window.innerWidth - width - 16))
  const top = Math.max(16, Math.min(anchor.top - height - 10, window.innerHeight - height - 16))

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="引用技能、工具或知识库"
      style={{ position: 'fixed', left, top, width, height, zIndex: 120 }}
      className="flex flex-col overflow-hidden rounded-[18px] border border-black/[0.09] bg-white shadow-[0_20px_70px_-22px_rgba(22,24,35,0.32)]"
    >
      <div className="flex h-12 shrink-0 items-end gap-7 border-b border-black/[0.07] px-5">
        {TABS.map((item) => {
          const active = item.id === tab
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative flex h-12 items-center gap-2 text-[14px] transition-colors ${
                active
                  ? 'font-semibold text-[#161823]'
                  : 'text-[#161823]/48 hover:text-[#161823]/75'
              }`}
            >
              <Icon size={15} strokeWidth={1.8} />
              {item.label}
              {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t bg-[#161823]" /> : null}
            </button>
          )
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[170px_minmax(250px,1fr)_300px]">
        <aside className="thin-scroll overflow-y-auto border-r border-black/[0.07] bg-[#FAFAFB] p-3">
          <div className="mb-2 flex h-8 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-2.5">
            <Search size={13} className="text-[#161823]/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[#161823] outline-none placeholder:text-[#161823]/30"
            />
          </div>
          <nav className="space-y-0.5">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item)
                  setActiveId(null)
                }}
                className={`flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-left text-[12px] ${
                  category === item
                    ? 'bg-[#EEF0F3] font-medium text-[#161823]'
                    : 'text-[#161823]/58 hover:bg-black/[0.035] hover:text-[#161823]'
                }`}
              >
                <span className="truncate">{item}</span>
                {item === '全部' ? (
                  <span className="text-[10px] tabular-nums text-[#161823]/30">{sourceItems.length}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>

        <section className="thin-scroll min-h-0 overflow-y-auto border-r border-black/[0.07] py-2">
          {visibleItems.length ? (
            visibleItems.map((item) => {
              const active = item.id === activeItem?.id
              const meta = variantMeta[item.variant ?? (tab === 'tools' ? 'tool' : tab === 'knowledge' ? 'knowledge' : 'workflow')]
              const Icon = meta.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  onDoubleClick={() => onInsert(item, tab)}
                  className={`group mx-2 flex w-[calc(100%-16px)] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    active ? 'bg-[#F1F2F4]' : 'hover:bg-[#F7F7F8]'
                  }`}
                >
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt=""
                      className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-black/[0.06]"
                    />
                  ) : (
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-lg"
                      style={{ backgroundColor: `${item.accent ?? '#6E75FF'}16`, color: item.accent ?? '#5A63E8' }}
                    >
                      <Icon size={18} strokeWidth={1.7} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-[#161823]">{item.name}</span>
                      {(item.variant === 'brand-kit' || item.variant === 'ip-kit') && (
                        <span
                          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold"
                          style={{ backgroundColor: `${item.accent ?? '#FE2C55'}16`, color: item.accent ?? '#C82045' }}
                        >
                          {meta.label}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#161823]/42">{item.summary ?? meta.description}</span>
                  </span>
                  <ChevronRight size={14} className={`shrink-0 ${active ? 'text-[#161823]/52' : 'text-[#161823]/18 group-hover:text-[#161823]/40'}`} />
                </button>
              )
            })
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-[12px] text-[#161823]/38">没有匹配项</div>
          )}
        </section>

        <MentionDetail item={activeItem} tab={tab} onInsert={onInsert} />
      </div>

      <footer className="flex h-10 shrink-0 items-center justify-between border-t border-black/[0.07] bg-[#FAFAFB] px-4 text-[10px] text-[#161823]/38">
        <span>单击查看详情 · 双击或按 Enter 引用</span>
        {onBrowseAll ? (
          <button
            type="button"
            onClick={() => onBrowseAll(tab)}
            className="flex items-center gap-1 font-medium text-[#161823]/58 hover:text-[#161823]"
          >
            浏览全部 <ArrowUpRight size={12} />
          </button>
        ) : null}
      </footer>
    </div>
  )
}

function MentionDetail({
  item,
  tab,
  onInsert,
}: {
  item: MentionItem | null
  tab: MentionTab
  onInsert: (item: MentionItem, tab: MentionTab) => void
}) {
  if (!item) return <aside className="bg-white" />
  const variant = item.variant ?? (tab === 'tools' ? 'tool' : tab === 'knowledge' ? 'knowledge' : 'workflow')
  const meta = variantMeta[variant]
  const Icon = meta.icon
  return (
    <aside className="thin-scroll min-h-0 overflow-y-auto bg-white p-4">
      {item.preview ? (
        <div className="relative mb-4 h-28 overflow-hidden rounded-xl bg-[#F2F3F5]">
          <img src={item.preview} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[9px] font-semibold text-[#161823] backdrop-blur">
            {meta.label}
          </span>
        </div>
      ) : (
        <span
          className="mb-4 grid size-11 place-items-center rounded-xl"
          style={{ backgroundColor: `${item.accent ?? '#6E75FF'}16`, color: item.accent ?? '#5A63E8' }}
        >
          <Icon size={21} strokeWidth={1.7} />
        </span>
      )}
      <p className="text-[15px] font-semibold leading-5 text-[#161823]">{item.name}</p>
      <p className="mt-1.5 text-[11.5px] leading-[18px] text-[#161823]/52">{item.summary ?? meta.description}</p>
      <div className="mt-4 border-t border-black/[0.07] pt-3">
        <p className="text-[10px] font-semibold text-[#161823]/42">
          {variant === 'brand-kit' || variant === 'ip-kit'
            ? '引用后生效范围'
            : variant === 'component-library' || variant === 'gameplay-library'
              ? '可调用结构'
              : tab === 'tools'
                ? '调用方式'
                : '知识范围'}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from(
            new Set(
              item.highlights?.length
                ? item.highlights
                : defaultHighlights(variant),
            ),
          ).slice(0, 5).map((label) => (
            <span key={label} className="rounded-md bg-[#F2F3F5] px-2 py-1 text-[10px] text-[#161823]/62">{label}</span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onInsert(item, tab)}
        className="mt-5 flex h-8 w-full items-center justify-center rounded-lg bg-[#161823] text-[11px] font-medium text-white hover:bg-[#2C2D35]"
      >
        引用到对话
      </button>
    </aside>
  )
}

function defaultHighlights(variant: MentionVariant) {
  if (variant === 'brand-kit') return ['Logo', '品牌色', '字体', '版式规则']
  if (variant === 'ip-kit') return ['角色形象', '动作表情', '道具', '授权边界']
  if (variant === 'component-library') return ['端能力', '组件结构', '字段配置', '适用页面']
  if (variant === 'gameplay-library') return ['状态机', '玩法配置', '校验规则', '交互反馈']
  if (variant === 'tool') return ['明确输入', '单步调用', '结构化输出']
  if (variant === 'workflow') return ['需求理解', '生成编排', '交付校验']
  return ['规范正文', '来源证据', '版本信息']
}
