import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDown,
  Check,
  ChevronDown,
  Clock,
  FolderCode,
  LayoutGrid,
  LayoutTemplate,
  Plus,
  Search,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import CapabilityDetailView from './CapabilityDetailView'
import ResourceCategoryTree from './ResourceCategoryTree'
import RichCapabilityCard from './RichCapabilityCard'
import EmptySearchMark from './icons/EmptySearchMark'
import {
  CAPABILITY_LABEL,
  CAPABILITY_TAGS,
  OFFICIAL_DOMAINS,
  PRIMARY_CATEGORIES,
  RESOURCES,
  SCENE_TAGS,
  buildCategoryTree,
  inferCapabilityTag,
  inferSceneTag,
} from './ResourceLibraryData'
import type {
  Capability,
  CapabilityTag,
  PrimaryCategory,
  Resource,
  SceneTag,
} from './ResourceLibraryData'

/** Two card layouts the user can switch between via the top-right
 *  layout select. Both render the banner-style RichCapabilityCard; the
 *  difference is grid density: `loose` lets cards breathe with
 *  auto-fill, `compact` pins 4-up at xl+ viewports for a denser grid. */
export type CardLayout = 'loose' | 'compact'

/** Internal (内场) shows the full source tree + primary/secondary
 *  groupings. External (外场) drops the source tree and collapses every
 *  resource into 3 top-level buckets: 官方 / 三方 / 空间. Four external
 *  variants share data + filtering but differ in navigation chrome:
 *  - `external` renders the buckets stacked, each with a sticky-section
 *     header (空间's header also sticks at the bottom edge while below
 *     the fold so it's visible on entry).
 *  - `external-tabs` swaps the sticky bucket headers for a horizontal
 *     tabs row at the top of the cards pane. Tabs are anchor-based —
 *     clicking scrolls the pane to that bucket's section header.
 *  - `external-row` keeps sticky-top section headers, but the
 *     bottom-pinned ones live as horizontal pills in a single floating
 *     row. As each section's natural header enters the viewport, its
 *     pill exits with an up-fade and remaining pills slide left.
 *  - `external-flat` adds a 来源 chip row above the 场景 chips and
 *     renders cards flat, with internal-mode-style group headers per
 *     selected source. */
export type SceneMode =
  | 'internal'
  | 'external'
  | 'external-tabs'
  | 'external-row'
  | 'external-flat'

type SourceFilter = 'all' | 'official' | 'thirdParty' | 'space'

const SOURCE_FILTER_OPTIONS: { id: SourceFilter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '官方' },
  { id: 'thirdParty', label: '三方' },
  { id: 'space', label: '空间' },
]

const SOURCE_FILTER_LABEL: Record<SourceFilter, string> = {
  all: '全部',
  official: '官方',
  thirdParty: '三方',
  space: '空间',
}

/** Top-level resource section. `skill-tool` and `knowledge` show
 *  capability cards; `model` and `publisher` are placeholder sections
 *  for upcoming resource types. `all` is the default unfiltered cards
 *  view (no tab highlighted). */
export type TypeFilter =
  | 'all'
  | 'skill-tool'
  | 'knowledge'
  | 'model'
  | 'publisher'

export interface CapabilityRef {
  platformId: string
  name: string
  category: string | null
}

interface ResourceLibraryViewProps {
  selectedPrimary: PrimaryCategory | null
  selectedSecondary: string | null
  selectedCapability: CapabilityRef | null
  expandedPrimary: Set<PrimaryCategory>
  searchQuery: string
  typeFilter: TypeFilter
  onTogglePrimary: (primary: PrimaryCategory) => void
  onSelectCategory: (primary: PrimaryCategory | null, secondary: string | null) => void
  onSelectCapability: (ref: CapabilityRef | null) => void
  onSearchChange: (q: string) => void
  onTypeFilterChange: (t: TypeFilter) => void
  onUseCapabilityInChat: (platform: Resource, capability: Capability) => void
  /** Switch to a project (called from the lineage section in detail
   *  views). Also closes the resource library page. */
  onOpenProject: (projectName: string) => void
}

const TYPE_TABS: { id: TypeFilter; label: string }[] = [
  { id: 'skill-tool', label: 'Skills / 工具' },
  { id: 'knowledge', label: CAPABILITY_LABEL.knowledge },
  { id: 'model', label: '模型' },
  { id: 'publisher', label: '发布器' },
]

const COMING_SOON_COPY: Partial<Record<TypeFilter, { title: string; hint: string }>> = {
  knowledge: {
    title: '知识库',
    hint: '统一接入团队 wiki / 文档 / 数据资产作为对话上下文，敬请期待。',
  },
  model: {
    title: '模型',
    hint: '统一管理可调用的大模型 / 微调模型 / 端侧模型，敬请期待。',
  },
  publisher: {
    title: '发布器',
    hint: '把对话中沉淀的能力一键发布为应用、卡片、推送，敬请期待。',
  },
}

// 场景 (scene) + 能力 (capability) were two independent filter rows;
// the product wants them merged into a single 场景 row. Concatenate the
// two tag pools (de-dupe just in case the sets overlap) and let the
// matcher in `groups` / `treeCountMap` consider both inferSceneTag and
// inferCapabilityTag when deciding whether a capability matches.
type CombinedTag = SceneTag | CapabilityTag
const COMBINED_TAGS: CombinedTag[] = (() => {
  const seen = new Set<string>()
  const out: CombinedTag[] = []
  for (const t of [...SCENE_TAGS, ...CAPABILITY_TAGS] as CombinedTag[]) {
    if (seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
})()
const SCENE_OPTIONS = [
  { id: 'all', label: '全部' },
  ...COMBINED_TAGS.map((t) => ({ id: t, label: t })),
] as { id: 'all' | CombinedTag; label: string }[]

const SORT_OPTIONS = [
  { id: 'all', label: '按使用量排序' },
  { id: 'usage', label: '使用量降序' },
  { id: 'updated', label: '最近更新' },
  { id: 'created', label: '最近创建' },
] as const

const PER_PLATFORM_PREVIEW_LIMIT = 20

export default function ResourceLibraryView({
  selectedPrimary,
  selectedSecondary,
  selectedCapability,
  expandedPrimary,
  searchQuery,
  typeFilter,
  onTogglePrimary,
  onSelectCategory,
  onSelectCapability,
  onSearchChange,
  onTypeFilterChange,
  onUseCapabilityInChat,
  onOpenProject,
}: ResourceLibraryViewProps) {
  const tree = useMemo(() => buildCategoryTree(), [])

  // Single 场景 dimension that merges the previous scene + capability
  // pools. A capability matches when its inferred scene OR capability
  // tag equals the selected value (so the same chip set still narrows
  // the grid either way). 排序 (sort) is still UI-only.
  const [scene, setScene] = useState<'all' | CombinedTag>('all')
  const [sort, setSort] = useState<string>('all')
  const [onlyMine, setOnlyMine] = useState(false)
  const [cardLayout, setCardLayout] = useState<CardLayout>('compact')
  const [sceneMode, setSceneMode] = useState<SceneMode>('internal')
  // 来源 filter — only surfaced in the `external-flat` variant. Values:
  // 全部 / 官方 / 三方 / 空间. Cards in flat mode group by source; this
  // narrows which source headers are rendered (and which cards survive).
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  // External-mode bucket collapse state. Both buckets start expanded;
  // toggling stays local because there's no cross-tab persistence yet.
  const [collapsedExternal, setCollapsedExternal] = useState<
    Set<'official' | 'thirdParty' | 'space'>
  >(new Set())
  const toggleExternalGroup = (id: 'official' | 'thirdParty' | 'space') => {
    setCollapsedExternal((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  // Filter row height — measured so external-mode bucket headers can
  // sticky-top just below it (rather than slipping under). ResizeObserver
  // catches collapsing the chip row and any layout change that resizes
  // the filter chrome.
  const [filterHeight, setFilterHeight] = useState(0)
  useEffect(() => {
    const el = filterRowRef.current
    if (!el) return
    const measure = () => setFilterHeight(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Active tab in 外场·Tab mode — derived from IntersectionObserver on
  // each bucket section. The first section whose top edge has crossed
  // above the sticky chrome (filter row + tabs strip) wins.
  const [activeExternalTab, setActiveExternalTab] = useState<
    'official' | 'thirdParty' | 'space'
  >('official')

  // Which bucket headers are below the fold in 外场·浮动行 mode. Drives
  // the floating bottom row of pills — a pill is rendered for each ID
  // in this set. As a bucket header enters the viewport, its ID is
  // removed and Framer Motion animates the remaining pills leftward.
  const [belowFoldBuckets, setBelowFoldBuckets] = useState<
    Set<'official' | 'thirdParty' | 'space'>
  >(new Set(['official', 'thirdParty', 'space']))
  // Refs to each bucket's sticky-top header element so the row-mode
  // observer can detect when each header enters or leaves the viewport.
  const externalRowHeaderRefs = useRef<
    Record<'official' | 'thirdParty' | 'space', HTMLElement | null>
  >({ official: null, thirdParty: null, space: null })
  // Anchor scroll: ref points at the right-side scroll container so we
  // can scrollTo() the matching primary / secondary header when a tree
  // node is selected.
  const cardsScrollRef = useRef<HTMLDivElement>(null)
  // Sticky filter row inside the scroll container — its height is
  // subtracted from anchor-scroll targets so headings land below it.
  const filterRowRef = useRef<HTMLDivElement>(null)

  const treeCountMap = useMemo(() => {
    // Count capabilities that pass the same filters as the right pane so
    // the tree badges match what the user actually sees in the cards.
    const q = searchQuery.trim().toLowerCase()
    const m = new Map<string, number>()
    for (const r of RESOURCES) {
      const matched = r.capabilities.filter((c) => {
        if (typeFilter === 'skill-tool' && c.type !== 'skill' && c.type !== 'tool') return false
        if (typeFilter === 'knowledge' && c.type !== 'knowledge') return false
        if (
          scene !== 'all' &&
          inferSceneTag(c.name) !== scene &&
          inferCapabilityTag(c.name) !== scene
        )
          return false
        if (q) {
          const hay = [c.name, c.category ?? '', r.name].join(' ').toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      }).length
      const k = `${r.primaryCategory}::${r.secondaryCategory}`
      // Always seed the key — even with 0 — so the tree can tell apart
      // "this secondary intrinsically has resources but the filter
      // zeroed it" (key present, value 0) from "this secondary has no
      // resources at all yet" (key absent, see `intrinsicCountMap`).
      m.set(k, (m.get(k) ?? 0) + matched)
    }
    return m
  }, [searchQuery, scene, typeFilter])

  // Unfiltered intrinsic counts — a secondary appears here only if its
  // platform actually ships any capabilities in the data. Used by the
  // tree to decide whether a zero badge reads as "0" (the filter
  // zeroed a real category) or "待接入" (the category itself is empty).
  const intrinsicCountMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of RESOURCES) {
      if (r.capabilities.length === 0) continue
      const k = `${r.primaryCategory}::${r.secondaryCategory}`
      m.set(k, (m.get(k) ?? 0) + r.capabilities.length)
    }
    return m
  }, [])

  // Anchor-style navigation: the tree no longer narrows the dataset —
  // every resource stays in scope and tree clicks scroll the right
  // pane to the matching section header instead. Search + tag filter
  // are still applied below.
  const platformsInScope = RESOURCES

  // 官方 has no own resources, so the tree row needs an explicit total
  // computed from the aggregator subset. Derive from the (already
  // filtered) treeCountMap so the badge tracks the right pane.
  const officialTotal = useMemo(() => {
    let total = 0
    for (const [key, count] of treeCountMap) {
      const primary = key.split('::')[0] as PrimaryCategory
      if (OFFICIAL_DOMAINS.includes(primary)) total += count
    }
    return total
  }, [treeCountMap])

  // Unfiltered intrinsic total for 官方 — used to decide whether the
  // aggregator's zero badge reads as "0" (filter zeroed real domains)
  // or "待接入" (the whole aggregator genuinely has nothing yet).
  const officialIntrinsicTotal = useMemo(() => {
    let total = 0
    for (const [key, count] of intrinsicCountMap) {
      const primary = key.split('::')[0] as PrimaryCategory
      if (OFFICIAL_DOMAINS.includes(primary)) total += count
    }
    return total
  }, [intrinsicCountMap])

  const groups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const out: { platform: Resource; caps: Capability[]; total: number }[] = []
    for (const platform of platformsInScope) {
      const matches = platform.capabilities.filter((c) => {
        if (typeFilter === 'skill-tool' && c.type !== 'skill' && c.type !== 'tool') return false
        if (typeFilter === 'knowledge' && c.type !== 'knowledge') return false
        if (
          scene !== 'all' &&
          inferSceneTag(c.name) !== scene &&
          inferCapabilityTag(c.name) !== scene
        )
          return false
        if (q) {
          const hay = [c.name, c.category ?? '', platform.name].join(' ').toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      if (matches.length > 0) {
        out.push({ platform, caps: matches, total: matches.length })
      }
    }
    return out
  }, [platformsInScope, typeFilter, searchQuery, scene])

  // Only search / tag filter narrow the displayed cards. Tree selection
  // is navigation-only — it scrolls to the matching anchor but still
  // renders the full by-primary view so adjacent sections stay visible.
  const isFiltering = !!searchQuery.trim() || scene !== 'all'

  // 外场·Tab mode — observe each bucket section to drive the active-tab
  // underline. The rootMargin shrinks the viewport to "below sticky
  // chrome → above midpoint" so the tab activates when a section's top
  // crosses the chrome rather than just when it first enters the visible
  // area. Re-run whenever groups change (filter applied / cleared).
  useEffect(() => {
    if (sceneMode !== 'external-tabs') return
    const root = cardsScrollRef.current
    if (!root) return
    const ids = ['official', 'thirdParty', 'space'] as const
    const observers: IntersectionObserver[] = []
    const visible = new Set<string>()
    const updateActive = () => {
      for (const id of ids) {
        if (visible.has(id)) {
          setActiveExternalTab(id)
          return
        }
      }
    }
    for (const id of ids) {
      const el = document.getElementById(`external-bucket-${id}`)
      if (!el) continue
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible.add(id)
          else visible.delete(id)
          updateActive()
        },
        {
          root,
          rootMargin: `-${filterHeight + 40}px 0px -50% 0px`,
          threshold: 0,
        },
      )
      observer.observe(el)
      observers.push(observer)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [sceneMode, filterHeight, groups.length])

  // 外场·浮动行 mode — observe each bucket's natural section header. A
  // header is "below the fold" until its top crosses just past the
  // sticky chrome at the top of the cards pane (filter row). When that
  // happens, drop it from the floating-row pill set so the pill fades
  // out and remaining pills slide left.
  useEffect(() => {
    if (sceneMode !== 'external-row') return
    const root = cardsScrollRef.current
    if (!root) return
    const ids: ('official' | 'thirdParty' | 'space')[] = [
      'official',
      'thirdParty',
      'space',
    ]
    const observers: IntersectionObserver[] = []
    for (const id of ids) {
      const el = externalRowHeaderRefs.current[id]
      if (!el) continue
      const observer = new IntersectionObserver(
        ([entry]) => {
          setBelowFoldBuckets((prev) => {
            const isAbove =
              entry.boundingClientRect.top < (root.getBoundingClientRect().top + filterHeight)
            const next = new Set(prev)
            if (isAbove || entry.isIntersecting) {
              if (next.has(id)) next.delete(id)
            } else {
              if (!next.has(id)) next.add(id)
            }
            return next
          })
        },
        {
          root,
          rootMargin: `-${filterHeight}px 0px 0px 0px`,
          threshold: [0, 1],
        },
      )
      observer.observe(el)
      observers.push(observer)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [sceneMode, filterHeight, groups.length])

  /** Scroll-spy plumbing. `programmaticScrollUntil` blocks the scroll
   *  handler from firing while a click-triggered smooth scroll is in
   *  flight (otherwise the handler would chase its own tail). Refs hold
   *  the latest selection so the scroll listener stays stable. */
  const programmaticScrollUntil = useRef(0)
  const selectedPrimaryRef = useRef(selectedPrimary)
  const selectedSecondaryRef = useRef(selectedSecondary)
  useEffect(() => {
    selectedPrimaryRef.current = selectedPrimary
  }, [selectedPrimary])
  useEffect(() => {
    selectedSecondaryRef.current = selectedSecondary
  }, [selectedSecondary])

  /** Click → anchor: scroll the right pane to the section that matches
   *  the tree selection. Also fires for deep-linked selections (URL →
   *  state). 官方 has no own section — falling back to scrollTop(0) so
   *  users see the full list from the start. */
  useEffect(() => {
    const container = cardsScrollRef.current
    if (!container) return
    if (!selectedPrimary && !selectedSecondary) return
    // Block the scroll-spy handler for the duration of the smooth scroll
    // so it doesn't fight the click target with sections we pass through.
    programmaticScrollUntil.current = Date.now() + 700
    if (selectedPrimary === '官方' && !selectedSecondary) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // Prefer the secondary anchor; fall back to the primary section
    // when the secondary doesn't exist on the right (e.g. 待接入 leaves
    // whose platform has no capabilities and therefore no rendered
    // section). Falling back gives clicks visible feedback instead of
    // silently failing.
    const secId = selectedSecondary
      ? `resource-anchor-sec-${selectedSecondary}`
      : null
    const priId = selectedPrimary ? `resource-anchor-pri-${selectedPrimary}` : null
    let target: Element | null = null
    if (secId)
      target = container.querySelector(`[id="${CSS.escape(secId)}"]`)
    if (!target && priId)
      target = container.querySelector(`[id="${CSS.escape(priId)}"]`)
    if (!target) return
    const rect = (target as HTMLElement).getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    // The sticky filter row sits at the top of the container and covers
    // content underneath. Subtract its rendered height so the section
    // heading lands just below the filter row instead of behind it.
    const filterHeight = filterRowRef.current?.offsetHeight ?? 0
    container.scrollTo({
      top:
        container.scrollTop +
        rect.top -
        containerRect.top -
        filterHeight -
        12, // small breathing room below the filter row
      behavior: 'smooth',
    })
  }, [selectedPrimary, selectedSecondary])

  // Scroll-spy is disabled: tree selection only updates on explicit
  // clicks, not when the right pane scrolls past sections. Click-driven
  // anchor scrolling above still works.

  // Capability detail takes precedence — user clicked a capability card.
  // Important: this conditional return MUST come after every hook call
  // above so the hook order stays stable across renders (otherwise
  // React's hooks checker bails and the page goes blank).
  if (selectedCapability) {
    const platform = RESOURCES.find((r) => r.id === selectedCapability.platformId)
    const capability = platform?.capabilities.find(
      (c) =>
        c.name === selectedCapability.name &&
        (c.category ?? null) === selectedCapability.category,
    )
    if (platform && capability) {
      return (
        <CapabilityDetailView
          capability={capability}
          platform={platform}
          onBack={() => onSelectCapability(null)}
          onUseInChat={() => onUseCapabilityInChat(platform, capability)}
          onOpenProject={onOpenProject}
        />
      )
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {/* ── Top bar — page title with resource-type tabs trailing it.
           Use baseline alignment + matching pb-3 so the title text and
           tab text share the same baseline, and the active tab's
           underline lines up with the container's bottom border. ── */}
      <div className="relative flex shrink-0 items-baseline gap-6 border-b border-[var(--divider-soft)] px-6 pt-5">
        <h1 className="shrink-0 pb-3 text-[20px] font-semibold leading-[1.2] text-[var(--color-ink)]">
          资源库
        </h1>
        <div className="flex items-baseline gap-6">
          {TYPE_TABS.map((t) => {
            const active = typeFilter === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTypeFilterChange(active ? 'all' : t.id)}
                className={`relative pb-3 text-[14px] leading-[1.2] transition-colors ${
                  active
                    ? 'font-semibold text-[var(--color-ink)]'
                    : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]/85'
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-t bg-[var(--color-ink)]" />
                )}
              </button>
            )
          })}
        </div>
        {/* Scene mode + Layout toggle float absolutely so they don't grow
            the tabs row vertically. Anchored to the row's bottom edge so
            they line up with the active-tab underline. */}
        <div className="absolute bottom-1.5 right-6 flex items-center gap-2">
          <SceneModeToggle value={sceneMode} onChange={setSceneMode} />
          <LayoutToggle value={cardLayout} onChange={setCardLayout} />
        </div>
      </div>

      {/* ── Body: tree (left) + scrollable cards (right). Placeholder
           sections (模型 / 发布器) take over the full body and skip both
           the tree and the filter row. ── */}
      {COMING_SOON_COPY[typeFilter] ? (
        <ComingSoonView copy={COMING_SOON_COPY[typeFilter]!} />
      ) : (
      <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* ── Left tree column (independent scroll). All 外场 variants
           drop the tree (their navigation lives at the top or bottom of
           the cards pane). ── */}
      {sceneMode === 'internal' && (
        <div className="flex w-[220px] shrink-0 flex-col border-r border-[var(--divider-soft)]">
          <div className="min-h-0 flex-1 overflow-hidden pt-1">
            <ResourceCategoryTree
              tree={tree}
              expandedPrimary={expandedPrimary}
              onTogglePrimary={onTogglePrimary}
              selectedPrimary={selectedPrimary}
              selectedSecondary={selectedSecondary}
              officialTotal={officialTotal}
              officialIntrinsicTotal={officialIntrinsicTotal}
              onSelect={(p, s) => onSelectCategory(p, s)}
              countMap={treeCountMap}
              intrinsicCountMap={intrinsicCountMap}
            />
          </div>
        </div>
      )}

      {/* ── Right column: sticky filter + cards ── */}
      <div
        ref={cardsScrollRef}
        className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {/* Sticky filter row */}
        <div
          ref={filterRowRef}
          className="sticky top-0 z-10 shrink-0 bg-white"
        >
          <div className="flex flex-col gap-2 px-6 pb-1.5 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex h-9 w-[200px] items-center">
                  <Search
                    size={16}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-4 text-[var(--color-ink)]/40"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="搜索"
                    className="h-full w-full rounded-full border border-[var(--divider-soft)] bg-white pl-10 pr-3 text-[14px] leading-5 text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/60 focus:border-[var(--color-ink)]/40"
                  />
                </div>

                <CheckboxFilter
                  label="我创建的"
                  checked={onlyMine}
                  onChange={setOnlyMine}
                />
                <FilterDropdown
                  label="按使用量排序"
                  value={sort}
                  options={SORT_OPTIONS}
                  onChange={setSort}
                />
              </div>

              <CreateButton />
            </div>


            {sceneMode === 'external-flat' && (
              <ChipFilterRow
                label="来源"
                value={sourceFilter}
                options={SOURCE_FILTER_OPTIONS}
                onChange={(id) => setSourceFilter(id as SourceFilter)}
              />
            )}
            <ChipFilterRow
              label="场景"
              value={scene}
              options={SCENE_OPTIONS}
              onChange={(id) => setScene(id as 'all' | CombinedTag)}
              collapsible
            />
          </div>
        </div>

        {/* ── Cards area. The wrapper only gets `flex-1` when the body
             is the empty placeholder (which centers itself within the
             remaining viewport). For real cards content, no wrapper is
             rendered — content is a direct child of cardsScrollRef so
             sticky elements inside (tabs strip, bucket headers) are
             bound by the scroll container, not by the wrapper's
             flex-allocated height. ── */}
        {groups.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <EmptyResultState
              scene={scene}
              searchQuery={searchQuery}
              selectedPrimary={selectedPrimary}
              selectedSecondary={selectedSecondary}
              onReset={() => {
                setScene('all')
                onSelectCategory('官方', null)
                onSearchChange('')
              }}
            />
          </div>
        ) : sceneMode === 'external' || sceneMode === 'external-tabs' || sceneMode === 'external-row' || sceneMode === 'external-flat' ? (
            // Externally-bucketed views (sticky stacks + tabs anchor) share
            // the same bucket data + filtering, only the navigation chrome
            // differs. Bucket data is computed once and consumed by either
            // rendering branch below.
            (() => {
              // 三方 maps to the 官方引入 primary (Notion / GitHub / 腾讯 /
              // 阿里 / Figma) — externally sourced platforms brought in
              // via official adapters. 官方 collapses the remaining
              // OFFICIAL_DOMAINS (the Douyin first-party tools).
              const officialGroups = groups.filter(
                (g) =>
                  OFFICIAL_DOMAINS.includes(g.platform.primaryCategory) &&
                  g.platform.primaryCategory !== '官方引入',
              )
              const thirdPartyGroups = groups.filter(
                (g) => g.platform.primaryCategory === '官方引入',
              )
              const spaceGroups = groups.filter(
                (g) => g.platform.primaryCategory === '空间',
              )
              const officialTotal = officialGroups.reduce((s, g) => s + g.total, 0)
              const thirdPartyTotal = thirdPartyGroups.reduce((s, g) => s + g.total, 0)
              const spaceTotal = spaceGroups.reduce((s, g) => s + g.total, 0)
              const officialCaps = officialGroups
                .flatMap((g) => g.caps.map((cap) => ({ cap, platform: g.platform })))
                .slice(0, PER_PLATFORM_PREVIEW_LIMIT)
              const thirdPartyCaps = thirdPartyGroups
                .flatMap((g) => g.caps.map((cap) => ({ cap, platform: g.platform })))
                .slice(0, PER_PLATFORM_PREVIEW_LIMIT)
              const spaceCaps = spaceGroups
                .flatMap((g) => g.caps.map((cap) => ({ cap, platform: g.platform })))
                .slice(0, PER_PLATFORM_PREVIEW_LIMIT)
              const officialCollapsed = collapsedExternal.has('official')
              const thirdPartyCollapsed = collapsedExternal.has('thirdParty')
              const spaceCollapsed = collapsedExternal.has('space')
              const gridCols =
                cardLayout === 'compact'
                  ? 'grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'
                  : 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'
              const renderCards = (
                caps: { cap: Capability; platform: Resource }[],
                prefix: string,
              ) => (
                <div className={`grid ${gridCols} gap-3`}>
                  {caps.map(({ cap, platform }, idx) => (
                    <RichCapabilityCard
                      key={`${prefix}-${platform.id}-${cap.name}-${idx}`}
                      capability={cap}
                      platform={platform}
                      onClick={() =>
                        onSelectCapability({
                          platformId: platform.id,
                          name: cap.name,
                          category: cap.category ?? null,
                        })
                      }
                    />
                  ))}
                </div>
              )

              /* ─── Tabs variant — horizontal anchor tabs at the top of
               *      the cards pane. Sticky below the filter row. ─── */
              if (sceneMode === 'external-tabs') {
                type TabId = 'official' | 'thirdParty' | 'space'
                const allTabs: {
                  id: TabId
                  label: string
                  total: number
                  caps: { cap: Capability; platform: Resource }[]
                  prefix: string
                }[] = [
                  { id: 'official', label: '官方 Skills/工具', total: officialTotal, caps: officialCaps, prefix: 'official' },
                  { id: 'thirdParty', label: '三方 Skills/工具', total: thirdPartyTotal, caps: thirdPartyCaps, prefix: 'thirdParty' },
                  { id: 'space', label: '空间 Skills/工具', total: spaceTotal, caps: spaceCaps, prefix: 'space' },
                ]
                const tabs = allTabs.filter((t) => t.total > 0)
                const scrollToBucket = (id: TabId) => {
                  const root = cardsScrollRef.current
                  const el = document.getElementById(`external-bucket-${id}`)
                  if (!root || !el) return
                  const rootRect = root.getBoundingClientRect()
                  const elRect = el.getBoundingClientRect()
                  // Account for the sticky filter row + tabs strip
                  // (tabs row is roughly 40px tall) plus a small breathing
                  // gap so the section title isn't flush with the chrome.
                  const offset =
                    elRect.top - rootRect.top + root.scrollTop - filterHeight - 40 - 8
                  root.scrollTo({ top: offset, behavior: 'smooth' })
                }
                return (
                  <>
                    {/* Tabs strip — sticky just below the filter row. No
                        negative margin: the strip's parent is padding-
                        less, so px-6 alone keeps the tabs aligned with
                        the cards content below. */}
                    <div
                      className="sticky z-[5] border-b border-[var(--divider-soft)] bg-white px-6"
                      style={{ top: filterHeight }}
                    >
                      <div className="flex items-center gap-6 pt-2">
                        {tabs.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => scrollToBucket(t.id)}
                            className={`relative inline-flex items-center gap-1.5 pb-2.5 text-[14px] leading-[1.2] transition-colors ${
                              activeExternalTab === t.id
                                ? 'font-semibold text-[var(--color-ink)]'
                                : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]/85'
                            }`}
                          >
                            {t.label}
                            <span
                              className={`text-[12px] ${
                                activeExternalTab === t.id
                                  ? 'text-[var(--color-ink)]/45'
                                  : 'text-[var(--color-ink)]/40'
                              }`}
                            >
                              {t.total}
                            </span>
                            {activeExternalTab === t.id && (
                              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-t bg-[var(--color-ink)]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-8 px-6 pt-5 pb-10">
                      {tabs.map((t) => (
                        <section
                          key={t.id}
                          id={`external-bucket-${t.id}`}
                          className="flex flex-col gap-3 scroll-mt-4"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="min-w-0 text-[14px] font-semibold text-[var(--color-ink)]">
                              {t.label}
                            </span>
                            <span className="inline-flex shrink-0 items-center rounded-full border border-white bg-[var(--fill-subtle)] px-1.5 py-px text-[12px] leading-4 text-[var(--color-ink)]/55 dark:border-[var(--color-surface-0)]">
                              {t.total}
                            </span>
                          </div>
                          {t.caps.length > 0 && renderCards(t.caps, t.prefix)}
                        </section>
                      ))}
                    </div>
                  </>
                )
              }

              /* ─── Flat variant — 来源 chip row at the top of the filter
               *      bar (rendered upstream) gates which source(s) of
               *      cards show up; the grid below is a flat tiled list
               *      grouped by source using internal-mode header style. */
              if (sceneMode === 'external-flat') {
                type SourceKey = 'official' | 'thirdParty' | 'space'
                const sourceList: {
                  key: SourceKey
                  label: string
                  total: number
                  caps: { cap: Capability; platform: Resource }[]
                }[] = [
                  { key: 'official', label: SOURCE_FILTER_LABEL.official, total: officialTotal, caps: officialCaps },
                  { key: 'thirdParty', label: SOURCE_FILTER_LABEL.thirdParty, total: thirdPartyTotal, caps: thirdPartyCaps },
                  { key: 'space', label: SOURCE_FILTER_LABEL.space, total: spaceTotal, caps: spaceCaps },
                ]
                const visibleSources = sourceList.filter((s) => {
                  if (s.total === 0) return false
                  if (sourceFilter === 'all') return true
                  return s.key === sourceFilter
                })
                return (
                  <div className="flex flex-col gap-8 px-6 pt-5 pb-10">
                    {visibleSources.map((s) => (
                      <section key={s.key} className="flex flex-col gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="min-w-0 text-[14px] font-semibold text-[var(--color-ink)]">
                            {s.label}
                          </span>
                          <span className="inline-flex shrink-0 items-center rounded-full border border-white bg-[var(--fill-subtle)] px-1.5 py-px text-[12px] leading-4 text-[var(--color-ink)]/55 dark:border-[var(--color-surface-0)]">
                            {s.total}
                          </span>
                        </div>
                        {s.caps.length > 0 && renderCards(s.caps, s.key)}
                      </section>
                    ))}
                  </div>
                )
              }

              /* ─── Floating-row variant — sections naturally stacked
               *      with sticky-top headers, plus a single horizontal
               *      row pinned to the bottom showing pills for any
               *      bucket whose natural header is still below the
               *      fold. When user scrolls into a section, that
               *      bucket's pill fades up out of the row and the
               *      remaining pills animate left via framer-motion's
               *      `layout` prop. ─── */
              if (sceneMode === 'external-row') {
                type BucketId = 'official' | 'thirdParty' | 'space'
                const allBuckets: {
                  id: BucketId
                  label: string
                  total: number
                  caps: { cap: Capability; platform: Resource }[]
                  prefix: string
                }[] = [
                  { id: 'official', label: '官方 Skills/工具', total: officialTotal, caps: officialCaps, prefix: 'official' },
                  { id: 'thirdParty', label: '三方 Skills/工具', total: thirdPartyTotal, caps: thirdPartyCaps, prefix: 'thirdParty' },
                  { id: 'space', label: '空间 Skills/工具', total: spaceTotal, caps: spaceCaps, prefix: 'space' },
                ]
                const buckets = allBuckets.filter((b) => b.total > 0)
                const pinned = buckets.filter((b) => belowFoldBuckets.has(b.id))
                const scrollToBucket = (id: BucketId) => {
                  const root = cardsScrollRef.current
                  const el = document.getElementById(`external-bucket-${id}`)
                  if (!root || !el) return
                  const rootRect = root.getBoundingClientRect()
                  const elRect = el.getBoundingClientRect()
                  const offset =
                    elRect.top - rootRect.top + root.scrollTop - filterHeight - 12
                  root.scrollTo({ top: offset, behavior: 'smooth' })
                }
                return (
                  <>
                    <div className="flex flex-col px-6 pt-5 pb-10">
                      {buckets.map((b, i) => (
                        <section
                          key={b.id}
                          id={`external-bucket-${b.id}`}
                          className={`flex flex-col gap-3 scroll-mt-4 ${i > 0 ? 'pt-6' : ''}`}
                        >
                          <div
                            ref={(el) => {
                              externalRowHeaderRefs.current[b.id] = el
                            }}
                            className="sticky z-[5] -mx-6 bg-white px-6 py-2"
                            style={{ top: filterHeight }}
                          >
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-x-0 top-full h-4"
                              style={{
                                backgroundImage:
                                  'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 25%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.32) 75%, rgba(255,255,255,0) 100%)',
                              }}
                            />
                            <div className="flex w-full items-center gap-2">
                              <span className="min-w-0 text-[14px] font-semibold text-[var(--color-ink)]">
                                {b.label}
                              </span>
                              <span className="inline-flex shrink-0 items-center rounded-full border border-white bg-[var(--fill-subtle)] px-1.5 py-px text-[12px] leading-4 text-[var(--color-ink)]/55 dark:border-[var(--color-surface-0)]">
                                {b.total}
                              </span>
                            </div>
                          </div>
                          {b.caps.length > 0 && renderCards(b.caps, b.prefix)}
                        </section>
                      ))}
                    </div>
                    {/* Floating bottom row — sticky bottom: 0, full-width
                        bar matching the old sticky-section header style
                        (white bg + soft feather above). Pills are
                        left-aligned and animate with Framer Motion: an
                        exiting pill fades upward, remaining pills slide
                        left to fill its slot via the `layout` prop. */}
                    {pinned.length > 0 && (
                      <div className="sticky bottom-0 z-[8] bg-white px-6 py-2">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 bottom-full h-4"
                          style={{
                            backgroundImage:
                              'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 25%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.32) 75%, rgba(255,255,255,0) 100%)',
                          }}
                        />
                        <motion.div layout className="flex items-center gap-5">
                          <AnimatePresence mode="popLayout" initial={false}>
                            {pinned.map((b) => (
                              <motion.button
                                key={b.id}
                                type="button"
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -18 }}
                                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                                onClick={() => scrollToBucket(b.id)}
                                className="group inline-flex items-center gap-2 whitespace-nowrap text-left transition-colors hover:opacity-85"
                              >
                                <span className="text-[14px] font-semibold text-[var(--color-ink)]">
                                  {b.label}
                                </span>
                                <span className="inline-flex shrink-0 items-center rounded-full border border-white bg-[var(--fill-subtle)] px-1.5 py-px text-[12px] leading-4 text-[var(--color-ink)]/55 dark:border-[var(--color-surface-0)]">
                                  {b.total}
                                </span>
                                <ArrowDown
                                  size={14}
                                  strokeWidth={2}
                                  className="shrink-0 text-[var(--color-ink)]/55 transition-transform group-hover:translate-y-0.5 group-hover:text-[var(--color-ink)]/80"
                                />
                              </motion.button>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    )}
                  </>
                )
              }

              /* ─── Sticky-stack variant — sticky-section headers, each
               *      bucket has its own scroll behaviour. Header height
               *      matches the rendered .py-2 (16) + 22px line-height
               *      = 38px; 三方 stacks at the bottom edge ABOVE 空间 by
               *      this offset so both bottom-pinned headers remain
               *      visible side-by-side while either bucket is below
               *      the fold. ─── */
              const HEADER_HEIGHT = 38
              return (
                // No flex `gap` on the wrapper — each bucket manages its
                // own top/bottom spacing so the 空间 group can flatten
                // (header + cards as siblings of the wrapper) without
                // inheriting an oversized gap between its header and
                // cards. Flattening is required so the sticky `bottom: 0`
                // can pin the 空间 header even while its bucket is still
                // below the fold (sticky is bounded by its containing
                // block — section bounds are too small, but the wrapper
                // bounds span the viewport).
                <div className="flex flex-col px-6 pt-5 pb-10">
                    {officialGroups.length > 0 && (
                      // 官方 stays section-wrapped so its sticky-top is
                      // bounded by the section: header detaches once the
                      // 官方 cards scroll past, instead of staying
                      // permanently pinned. No bottom-sticky needed
                      // because 官方 is never below the fold.
                      <section className="flex flex-col gap-3 pb-6">
                        <ExternalBucketHeader
                          title="官方 Skills/工具"
                          total={officialTotal}
                          collapsed={officialCollapsed}
                          onToggle={() => toggleExternalGroup('official')}
                          stickyStyle={{ top: filterHeight }}
                          featherEdges="below"
                          zIndex={5}
                        />
                        {!officialCollapsed && officialCaps.length > 0 &&
                          renderCards(officialCaps, 'official')}
                      </section>
                    )}
                    {thirdPartyGroups.length > 0 && (
                      // 三方 flattened so sticky-bottom's containing
                      // block spans the viewport. Bottom offset stacks
                      // it above 空间. z-index sits between 官方 (5) and
                      // 空间 (7) so the most recently entered section's
                      // header always sits on top of older ones.
                      <>
                        <ExternalBucketHeader
                          title="三方 Skills/工具"
                          total={thirdPartyTotal}
                          collapsed={thirdPartyCollapsed}
                          onToggle={() => toggleExternalGroup('thirdParty')}
                          stickyStyle={{ top: filterHeight, bottom: HEADER_HEIGHT }}
                          featherEdges="both"
                          zIndex={6}
                          className="mt-6"
                        />
                        {!thirdPartyCollapsed && thirdPartyCaps.length > 0 && (
                          <div className="mt-3">
                            {renderCards(thirdPartyCaps, 'thirdParty')}
                          </div>
                        )}
                      </>
                    )}
                    {spaceGroups.length > 0 && (
                      <>
                        <ExternalBucketHeader
                          title="空间 Skills/工具"
                          total={spaceTotal}
                          collapsed={spaceCollapsed}
                          onToggle={() => toggleExternalGroup('space')}
                          stickyStyle={{ top: filterHeight, bottom: 0 }}
                          featherEdges="both"
                          zIndex={7}
                          className="mt-6"
                        />
                        {!spaceCollapsed && spaceCaps.length > 0 && (
                          <div className="mt-3">
                            {renderCards(spaceCaps, 'space')}
                          </div>
                        )}
                      </>
                    )}
                </div>
              )
            })()
          ) : (
            <div className="flex flex-col gap-8 px-6 pt-5 pb-10">
              {!isFiltering ? (
                PRIMARY_CATEGORIES.map((primary) => {
                  const groupsInPrimary = groups.filter(
                    (g) => g.platform.primaryCategory === primary,
                  )
                  if (groupsInPrimary.length === 0) return null
                  return (
                    <div
                      key={primary}
                      id={`resource-anchor-pri-${primary}`}
                      className="flex flex-col gap-7 scroll-mt-4"
                    >
                      {groupsInPrimary.map((g) => (
                        <div
                          key={g.platform.id}
                          id={`resource-anchor-sec-${g.platform.secondaryCategory}`}
                          className="scroll-mt-4"
                        >
                          <PlatformGroup
                            group={g}
                            layout={cardLayout}
                            onSelectCapability={(cap) =>
                              onSelectCapability({
                                platformId: g.platform.id,
                                name: cap.name,
                                category: cap.category ?? null,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col gap-7">
                  {groups.map((g) => (
                    <PlatformGroup
                      key={g.platform.id}
                      group={g}
                      layout={cardLayout}
                      onSelectCapability={(cap) =>
                        onSelectCapability({
                          platformId: g.platform.id,
                          name: cap.name,
                          category: cap.category ?? null,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
      </div>
      )}
    </div>
  )
}

function EmptyResultState({
  scene,
  searchQuery,
  selectedPrimary,
  selectedSecondary,
  onReset,
}: {
  scene: 'all' | CombinedTag
  searchQuery: string
  selectedPrimary: PrimaryCategory | null
  selectedSecondary: string | null
  onReset: () => void
}) {
  const hasSearch = searchQuery.trim().length > 0
  const hasTag = scene !== 'all'
  // Build a copy line that explains *why* the list is empty. Tag-driven
  // empties read very differently from "this category is genuinely
  // empty", so we surface the active filter explicitly.
  let title = '没有符合条件的能力'
  let hint = '试试更换筛选项或清空搜索。'
  const filterLabel = hasTag ? scene : ''
  if (hasTag && hasSearch) {
    title = `在「${filterLabel}」筛选下没有命中「${searchQuery.trim()}」`
    hint = '当前同时启用了场景筛选和搜索，可清空筛选再回到全部资源。'
  } else if (hasTag) {
    title = `「${filterLabel}」筛选下还没有能力`
    hint =
      selectedPrimary && selectedSecondary
        ? `当前定位在 ${selectedPrimary} / ${selectedSecondary}，这个组合可能太窄了。`
        : '可能是当前筛选太窄，可以清空筛选回到全部资源。'
  } else if (hasSearch) {
    title = `没有命中「${searchQuery.trim()}」的能力`
    hint = '换个关键词，或清空搜索回到全部资源。'
  } else if (selectedPrimary || selectedSecondary) {
    title = '当前分类下还没有能力'
    hint = '这个类目还在接入，先回到全部看看其他资源。'
  }
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 py-12">
      <div className="flex max-w-[440px] flex-col items-center gap-5 text-center">
        <EmptySearchMark size={80} />
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">
            {title}
          </h3>
          <p className="text-[12.5px] leading-[1.7] text-[var(--color-ink)]/55">
            {hint}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-4 py-1.5 text-[12.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
        >
          回到全部资源
        </button>
      </div>
    </div>
  )
}

function ComingSoonView({
  copy,
}: {
  copy: { title: string; hint: string }
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 py-12">
      <div className="flex max-w-[420px] flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fill-subtle)] text-[var(--color-ink)]/55">
          <Clock size={22} strokeWidth={1.6} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[16px] font-semibold text-[var(--color-ink)]">
            {copy.title} · 敬请期待
          </h2>
          <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
            {copy.hint}
          </p>
        </div>
      </div>
    </div>
  )
}

function PlatformGroup({
  group,
  layout,
  onSelectCapability,
}: {
  group: { platform: Resource; caps: Capability[]; total: number }
  layout: CardLayout
  onSelectCapability: (capability: Capability) => void
}) {
  const visible = group.caps.slice(0, PER_PLATFORM_PREVIEW_LIMIT)
  // Both layouts render the banner-style RichCapabilityCard via
  // auto-fill grids; only the column min size differs. 紧凑卡片 picks
  // a smaller min so a 1440 viewport (right pane ≈ 876px after
  // sidebar + tree + padding) fits 4-up while narrower viewports
  // gracefully fall back to 3 / 2 columns.
  const gridCols =
    layout === 'compact'
      ? 'grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'
      : 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'
  return (
    <section className="flex flex-col gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 text-[14px] font-semibold text-[var(--color-ink)]">
          {group.platform.secondaryCategory}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-full border border-white bg-[var(--fill-subtle)] px-1.5 py-px text-[12px] leading-4 text-[var(--color-ink)]/55 dark:border-[var(--color-surface-0)]">
          {group.total}
        </span>
      </div>

      <div className={`grid ${gridCols} gap-3`}>
        {visible.map((cap, idx) => (
          <RichCapabilityCard
            key={`${cap.name}-${cap.category ?? ''}-${idx}`}
            capability={cap}
            platform={group.platform}
            onClick={() => onSelectCapability(cap)}
          />
        ))}
      </div>
    </section>
  )
}


const LAYOUT_OPTIONS: { id: CardLayout; label: string; icon: LucideIcon }[] = [
  { id: 'loose', label: '宽松卡片', icon: LayoutGrid },
  { id: 'compact', label: '紧凑卡片', icon: LayoutTemplate },
]

/** Sticky-positioned title row used by both external-mode buckets.
 *  Negative margins extend the white background flush with the wrapper
 *  edges; the parent passes the appropriate sticky offsets (open keeps
 *  only top; space gets top + bottom so it pins to the bottom edge
 *  while the bucket is still below the fold). Feather strips above /
 *  below the white header soften the cards-into-header boundary. */
function ExternalBucketHeader({
  title,
  total,
  collapsed,
  onToggle,
  stickyStyle,
  featherEdges,
  zIndex = 5,
  className = '',
}: {
  title: string
  total: number
  collapsed: boolean
  onToggle: () => void
  stickyStyle: { top: number; bottom?: number }
  /** Where to render the gradient feather strip. `below` for top-only
   *  sticky (cards under the header fade into white); `both` for
   *  top+bottom sticky (cards above and below get the same softening). */
  featherEdges: 'below' | 'both'
  /** Stack order — later sections get higher values so the active
   *  section's sticky-top header sits on top of any earlier headers
   *  that are also stuck at the same top position. */
  zIndex?: number
  className?: string
}) {
  return (
    <div
      className={`sticky -mx-6 bg-white px-6 py-2 ${className}`}
      style={{ ...stickyStyle, zIndex }}
    >
      {/* Bottom feather — cards scrolling up under the header fade into
          white over a 28px strip with ease-out-style stops so the
          transition reads as a soft falloff rather than a linear slope. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-full h-4"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 25%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.32) 75%, rgba(255,255,255,0) 100%)',
        }}
      />
      {/* Top feather — only when bottom-sticky is active (空间 bucket).
          Same ease-out curve, mirrored. */}
      {featherEdges === 'both' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-full h-4"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 25%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.32) 75%, rgba(255,255,255,0) 100%)',
          }}
        />
      )}
      <button
        type="button"
        onClick={onToggle}
        className="group relative flex w-full items-center gap-2 text-left"
      >
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`shrink-0 text-[var(--color-ink)]/55 transition-transform ${
            collapsed ? '-rotate-90' : ''
          }`}
        />
        <span className="min-w-0 text-[14px] font-semibold text-[var(--color-ink)]">
          {title}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-full border border-white bg-[var(--fill-subtle)] px-1.5 py-px text-[12px] leading-4 text-[var(--color-ink)]/55 dark:border-[var(--color-surface-0)]">
          {total}
        </span>
      </button>
    </div>
  )
}

/** Segmented pill toggle for 内场 / 外场. Shares the floating-anchor
 *  slot next to LayoutToggle. */
function SceneModeToggle({
  value,
  onChange,
}: {
  value: SceneMode
  onChange: (v: SceneMode) => void
}) {
  const options: { id: SceneMode; label: string; hint: string }[] = [
    {
      id: 'internal',
      label: '内场',
      hint: '左侧完整来源树 + 一/二级分类视图',
    },
    {
      id: 'external',
      label: '外场·分组',
      hint: '官方 / 三方 / 空间 三组叠放，标题随滚动 sticky',
    },
    {
      id: 'external-tabs',
      label: '外场·Tab',
      hint: '顶部横向 Tab，点击锚点滚动到分组',
    },
    {
      id: 'external-row',
      label: '外场·浮动行',
      hint: '底部悬浮一行，未到的分组左右滑动切换',
    },
    {
      id: 'external-flat',
      label: '外场·平铺',
      hint: '顶部加来源筛选，卡片按来源分组平铺展示',
    },
  ]
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  const current = options.find((o) => o.id === value) ?? options[0]
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
      >
        {current.label}
        <ChevronDown
          size={11}
          strokeWidth={1.8}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-[280px] overflow-hidden rounded-lg border border-[var(--divider)] bg-white py-1 shadow-[0_12px_28px_-8px_rgba(16,18,24,0.22)]">
          {options.map((o) => {
            const isCurrent = o.id === value
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors ${
                  isCurrent
                    ? 'bg-[var(--fill-hover)] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink)]/80 hover:bg-[var(--fill-hover)]'
                }`}
              >
                <span className="text-[13px] font-medium leading-[18px]">
                  {o.label}
                </span>
                <span className="text-[12px] leading-[16px] text-[var(--color-ink)]/55">
                  {o.hint}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Black pill "创建" button that reveals a 2-option popover (Skills /
 *  工具) on hover. Both the button and popover share a `group` wrapper
 *  so moving the cursor onto the popover keeps it open. */
function CreateButton() {
  const options: { id: 'skill' | 'tool'; label: string; hint: string; icon: LucideIcon }[] = [
    { id: 'skill', label: 'Skills', hint: '定制特定任务的执行逻辑', icon: FolderCode },
    { id: 'tool', label: '工具', hint: '接入外部系统与 API 服务', icon: Wrench },
  ]
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 text-[14px] font-semibold leading-5 text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
      >
        <Plus size={16} strokeWidth={1.8} />
        创建
      </button>
      <div className="invisible absolute right-0 top-full z-30 w-[280px] translate-y-1 rounded-xl bg-white p-2 opacity-0 shadow-[0_0_0.5px_rgba(0,0,0,0.3),0_4px_14px_rgba(0,0,0,0.1)] transition-all duration-150 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
        {options.map((o) => {
          const Icon = o.icon
          return (
            <button
              key={o.id}
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg p-3 text-left transition-colors hover:bg-[var(--fill-hover)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--fill-subtle)] text-[var(--color-ink)]/80">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="whitespace-nowrap text-[14px] font-semibold leading-5 text-[var(--color-ink)]">
                  {o.label}
                </span>
                <span className="whitespace-nowrap text-[14px] leading-5 text-[var(--color-ink)]/60">
                  {o.hint}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Pill-shaped toggle that matches the FilterDropdown chrome but with
 *  a leading checkbox. Used for binary filters like "我创建的". */
function CheckboxFilter({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-9 items-center gap-2 rounded-full border bg-white px-4 text-[14px] font-semibold leading-5 outline-none transition-colors focus:outline-none focus-visible:outline-none ${
        checked
          ? 'border-[var(--color-ink)]/40 text-[var(--color-ink)]'
          : 'border-[var(--divider-soft)] text-[var(--color-ink)]/80 hover:border-[var(--color-ink)]/30 hover:text-[var(--color-ink)]'
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
          checked
            ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-surface-0)]'
            : 'border-[var(--color-ink)]/35 bg-transparent'
        }`}
      >
        {checked && <Check size={10} strokeWidth={3} />}
      </span>
      {label}
    </button>
  )
}

/** Flat chip-style filter row: a `label` cell followed by chips. Active
 *  chip gets the filled / bordered look; everything else is plain text.
 *  Pass `collapsible` to wrap long lists into 1 line with a "展开 / 收起"
 *  trigger at the end. */
function ChipFilterRow({
  label,
  value,
  options,
  onChange,
  collapsible,
}: {
  label: string
  value: string
  options: readonly { id: string; label: string }[]
  onChange: (id: string) => void
  collapsible?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex items-start gap-1 pt-1">
      <div className="flex h-[26px] w-12 shrink-0 items-center">
        <span className="text-[13px] font-medium leading-[18px] text-[var(--color-ink)]/80">
          {label}
        </span>
      </div>
      <div className="flex flex-1 items-start gap-2">
        <div
          className={`flex flex-1 flex-wrap items-start gap-2 ${
            collapsible && !expanded ? 'max-h-[26px] overflow-hidden' : ''
          }`}
        >
          {options.map((o) => {
            const active = value === o.id
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onChange(o.id)}
                className={`shrink-0 rounded-md border px-[11px] py-[3px] text-[13px] leading-[18px] outline-none transition-colors focus:outline-none focus-visible:outline-none ${
                  active
                    ? 'border-[var(--divider-soft)] bg-[var(--fill-subtle)] font-medium text-[var(--color-ink)]'
                    : 'border-transparent text-[var(--color-ink)]/80 hover:bg-[var(--fill-subtle)]/60 hover:text-[var(--color-ink)]'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex shrink-0 items-center gap-0.5 rounded-md px-2 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-subtle)]/60 hover:text-[var(--color-ink)]"
          >
            {expanded ? '收起' : '展开'}
            <ChevronDown
              size={12}
              strokeWidth={2}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </div>
  )
}

function LayoutToggle({
  value,
  onChange,
}: {
  value: CardLayout
  onChange: (v: CardLayout) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  const current = LAYOUT_OPTIONS.find((o) => o.id === value) ?? LAYOUT_OPTIONS[0]
  const CurrentIcon = current.icon
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={current.label}
        title={current.label}
        className="flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
      >
        <CurrentIcon size={14} strokeWidth={1.8} />
        <ChevronDown
          size={11}
          strokeWidth={1.8}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 min-w-[152px] overflow-hidden rounded-lg border border-[var(--divider)] bg-white shadow-[0_12px_28px_-8px_rgba(16,18,24,0.22)]">
          {LAYOUT_OPTIONS.map((o) => {
            const Icon = o.icon
            const isCurrent = o.id === value
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                  isCurrent
                    ? 'bg-[var(--fill-hover)] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink)]/80 hover:bg-[var(--fill-hover)]'
                }`}
              >
                <Icon
                  size={13}
                  strokeWidth={1.8}
                  className="text-[var(--color-ink)]/55"
                />
                <span className="flex-1">{o.label}</span>
                {isCurrent && <Check size={12} strokeWidth={2} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Filter row helpers ─── */

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { id: string; label: string }[]
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const active = value !== 'all'
  const current = options.find((o) => o.id === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 items-center gap-2 rounded-full border bg-white px-4 text-[14px] font-semibold leading-5 transition-colors ${
          active
            ? 'border-[var(--color-ink)]/40 text-[var(--color-ink)]'
            : 'border-[var(--divider-soft)] text-[var(--color-ink)]/80 hover:border-[var(--color-ink)]/30 hover:text-[var(--color-ink)]'
        }`}
      >
        <span>{active && current ? current.label : label}</span>
        <ChevronDown
          size={13}
          strokeWidth={1.8}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-[var(--divider)] bg-white shadow-[0_12px_28px_-8px_rgba(16,18,24,0.22)]">
          {options.map((o) => {
            const isCurrent = o.id === value
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                  isCurrent
                    ? 'bg-[var(--fill-hover)] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink)]/80 hover:bg-[var(--fill-hover)]'
                }`}
              >
                {o.label}
                {isCurrent && <Check size={12} strokeWidth={2} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

