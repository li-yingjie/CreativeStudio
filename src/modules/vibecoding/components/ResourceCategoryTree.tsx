import {
  BadgeCheck,
  Boxes,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { OFFICIAL_DOMAINS } from './ResourceLibraryData'
import type {
  CategoryTreeNode,
  PrimaryCategory,
} from './ResourceLibraryData'
import DouyinMark from './icons/DouyinMark'

/* Renderer per primary category — picks the icon used in the row's
 * leading slot. 官方 and 空间 paint a coloured tile around a lucide
 * icon; the official domains use the bare 抖音 mark, no tile. */
type PrimaryRenderer =
  | { kind: 'lucide'; icon: LucideIcon; tileClass: string }
  | { kind: 'douyin' }

const PRIMARY_RENDERER: Record<PrimaryCategory, PrimaryRenderer> = {
  官方: {
    kind: 'lucide',
    icon: BadgeCheck,
    tileClass: 'bg-[#eff8ff] text-[#3370ff] dark:bg-sky-500/15 dark:text-sky-300',
  },
  业务平台: { kind: 'douyin' },
  舆情监控: { kind: 'douyin' },
  内容理解与生成: { kind: 'douyin' },
  数据分析和处理: { kind: 'douyin' },
  开发和效率: { kind: 'douyin' },
  官方引入: { kind: 'douyin' },
  空间: {
    kind: 'lucide',
    icon: Boxes,
    tileClass:
      'bg-[#f1eef9] text-[#5720b7] dark:bg-violet-500/15 dark:text-violet-300',
  },
}

interface ResourceCategoryTreeProps {
  tree: CategoryTreeNode[]
  expandedPrimary: Set<PrimaryCategory>
  onTogglePrimary: (primary: PrimaryCategory) => void
  selectedPrimary: PrimaryCategory | null
  selectedSecondary: string | null
  onSelect: (primary: PrimaryCategory | null, secondary: string | null) => void
  /** Per-secondary resource count after filtering, keyed by
   *  `${primary}::${secondary}`. Treated as the displayed count. */
  countMap: Map<string, number>
  /** Per-secondary intrinsic count (unfiltered) — used only to decide
   *  whether a zero reads as "0" (filter zeroed a real category) or
   *  "待接入" (no resources in this category to begin with). */
  intrinsicCountMap: Map<string, number>
  /** Total count for the 官方 aggregator (it has no own secondaries). */
  officialTotal: number
  /** Intrinsic total for the 官方 aggregator — see intrinsicCountMap. */
  officialIntrinsicTotal: number
}

export default function ResourceCategoryTree({
  tree,
  expandedPrimary,
  onTogglePrimary,
  onSelect,
  countMap,
  intrinsicCountMap,
  officialTotal,
  officialIntrinsicTotal,
}: ResourceCategoryTreeProps) {
  // Split the aggregator (官方) + the pinned 空间 footer out of the
  // scroll area so they stay fixed at the top / bottom edges; only the
  // OFFICIAL_DOMAINS list scrolls when content overflows.
  const officialNode = tree.find((n) => n.primary === '官方') ?? null
  const scrollableNodes = tree.filter(
    (n) => n.primary !== '空间' && n.primary !== '官方',
  )
  const spaceNode = tree.find((n) => n.primary === '空间') ?? null
  return (
    <div className="flex h-full flex-col bg-white">
      {officialNode && (() => {
        const renderer = PRIMARY_RENDERER[officialNode.primary]
        // Tree no longer carries a "selected" highlight — clicks still
        // fire scroll behavior but the row state stays neutral.
        const isPrimaryActive = false
        const AggIcon =
          renderer.kind === 'lucide' ? renderer.icon : BadgeCheck
        const aggTile =
          renderer.kind === 'lucide'
            ? renderer.tileClass
            : 'bg-[#eff8ff] text-[#3370ff]'
        return (
          <button
            type="button"
            onClick={() => onSelect(officialNode.primary, null)}
            className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-left transition-colors ${
              isPrimaryActive
                ? 'bg-[var(--fill-hover)]'
                : 'hover:bg-[var(--fill-hover)]'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${aggTile}`}
            >
              <AggIcon size={12} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-[18px] text-[var(--color-ink)]/85">
              {officialNode.primary}
            </span>
            <PillBadge
              value={officialTotal}
              zeroLabel={officialIntrinsicTotal > 0 ? '0' : '待接入'}
            />
          </button>
        )
      })()}
      <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
      {scrollableNodes.map(({ primary, secondaries }) => {
        const renderer = PRIMARY_RENDERER[primary]
        const isPrimaryActive = false

        /* ─── OFFICIAL_DOMAINS (业务平台 / 舆情监控 / 内容理解与生成 /
         *     数据分析和处理 / 开发和效率 / 官方引入). Indented under 官方,
         *     bare 抖音 mark + medium 13px label, hover swaps to chevron,
         *     own secondaries under a vertical hairline. ─── */
        const expanded = expandedPrimary.has(primary)
        const ChevIcon = expanded ? ChevronDown : ChevronRight
        const totalCount = secondaries.reduce(
          (sum, sec) => sum + (countMap.get(`${primary}::${sec}`) ?? 0),
          0,
        )
        const intrinsicTotal = secondaries.reduce(
          (sum, sec) => sum + (intrinsicCountMap.get(`${primary}::${sec}`) ?? 0),
          0,
        )
        // 空间: empty bucket always reads as literal "0".
        // Otherwise: 待接入 only when the primary intrinsically has no
        // resources at all. Once any resource exists in the data, a
        // filter-driven zero stays as "0" (it's a real category that
        // happened to filter empty, not a pending placeholder).
        const primaryZeroLabel =
          primary === '空间' || intrinsicTotal > 0 ? '0' : '待接入'
        const isOfficial = OFFICIAL_DOMAINS.includes(primary)
        return (
          <div
            key={primary}
            className={`shrink-0 pr-2 ${isOfficial ? 'pl-4' : 'pl-2'}`}
          >
            <div
              className={`group flex h-7 items-center gap-1.5 rounded-md px-2 text-[13px] transition-colors ${
                isPrimaryActive
                  ? 'bg-[var(--fill-hover)]'
                  : 'hover:bg-[var(--fill-hover)]'
              }`}
            >
              <button
                type="button"
                aria-label={expanded ? '收起' : '展开'}
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePrimary(primary)
                }}
                className="relative flex h-[14px] w-[14px] shrink-0 items-center justify-center overflow-hidden rounded-[3.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--color-ink)]/10 hover:text-[var(--color-ink)]"
              >
                {renderer.kind === 'lucide' ? (
                  <renderer.icon
                    size={12}
                    strokeWidth={1.8}
                    className="absolute transition-opacity duration-100 group-hover:opacity-0"
                  />
                ) : (
                  <DouyinMark
                    size={14}
                    className="absolute transition-opacity duration-100 group-hover:opacity-0"
                  />
                )}
                <ChevIcon
                  size={12}
                  strokeWidth={2}
                  className="absolute opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                />
              </button>
              <button
                type="button"
                onClick={() => onSelect(primary, null)}
                className="flex min-w-0 flex-1 items-center justify-between text-left"
              >
                <span className="min-w-0 truncate text-[13px] font-medium leading-[18px] text-[var(--color-ink)]/85">
                  {primary}
                </span>
                <span className="ml-2 shrink-0 text-[12px] leading-4 text-[var(--color-ink)]/35">
                  {totalCount === 0 ? primaryZeroLabel : totalCount}
                </span>
              </button>
            </div>

            {expanded && secondaries.length > 0 && (
              <div className="pl-[14px] pt-1">
                <div className="flex flex-col gap-1 border-l border-[rgba(16,18,24,0.08)] pl-px dark:border-[rgba(255,255,255,0.08)]">
                  {secondaries.map((sec) => {
                    const isActive = false
                    const count = countMap.get(`${primary}::${sec}`) ?? 0
                    const intrinsic =
                      intrinsicCountMap.get(`${primary}::${sec}`) ?? 0
                    // A leaf is "待接入" only when the secondary itself
                    // has no resources at all. If it ships any resource
                    // and the current filter zeroed it, the badge shows
                    // "0" and the row stays clickable (so the user can
                    // jump to the section even though the cards are
                    // currently hidden by filter).
                    const isPending = intrinsic === 0 && primary !== '空间'
                    if (isPending) {
                      return (
                        <div
                          key={sec}
                          aria-disabled
                          title={`${sec} 接入中`}
                          className="flex h-7 cursor-not-allowed items-center gap-2 rounded-md py-1 pl-3 pr-2 text-[13px] text-[var(--color-ink)]/80"
                        >
                          <span className="min-w-0 flex-1 truncate text-left leading-[18px]">
                            {sec}
                          </span>
                          <span className="shrink-0 text-[12px] leading-4 text-[var(--color-ink)]/35">
                            待接入
                          </span>
                        </div>
                      )
                    }
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => onSelect(primary, sec)}
                        className={`flex h-7 items-center gap-2 rounded-md py-1 pl-3 pr-2 text-[13px] transition-colors ${
                          isActive
                            ? 'bg-[var(--fill-hover)] text-[var(--color-ink)]'
                            : 'text-[var(--color-ink)]/80 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate text-left leading-[18px]">
                          {sec}
                        </span>
                        <span className="shrink-0 text-[12px] leading-4 text-[var(--color-ink)]/35">
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
      </div>
      {spaceNode && (() => {
        const renderer = PRIMARY_RENDERER[spaceNode.primary]
        const isPrimaryActive = false
        const SpaceIcon =
          renderer.kind === 'lucide' ? renderer.icon : Boxes
        const spaceTile =
          renderer.kind === 'lucide'
            ? renderer.tileClass
            : 'bg-[#f1eef9] text-[#5720b7]'
        const totalCount = spaceNode.secondaries.reduce(
          (sum, sec) =>
            sum + (countMap.get(`${spaceNode.primary}::${sec}`) ?? 0),
          0,
        )
        return (
          <button
            type="button"
            onClick={() => onSelect(spaceNode.primary, null)}
            className={`flex shrink-0 items-center gap-1.5 border-t border-[var(--divider-soft)] px-3 py-3 text-left transition-colors ${
              isPrimaryActive
                ? 'bg-[var(--fill-hover)]'
                : 'hover:bg-[var(--fill-hover)]'
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${spaceTile}`}
            >
              <SpaceIcon size={12} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-[18px] text-[var(--color-ink)]/85">
              {spaceNode.primary}
            </span>
            <PillBadge value={totalCount} zeroLabel="0" />
          </button>
        )
      })()}
    </div>
  )
}

/** Pill-style count badge for the 官方 / 空间 rows — soft grey fill +
 *  white outline + 16-radius. Matches the Figma Badge component used on
 *  top-level aggregator rows. */
function PillBadge({
  value,
  zeroLabel = '待接入',
}: {
  value: number
  zeroLabel?: string
}) {
  const label = value === 0 ? zeroLabel : value
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-white bg-[var(--fill-subtle)] px-1.5 py-px text-[12px] leading-4 text-[var(--color-ink)]/55 dark:border-[var(--color-surface-0)]">
      {label}
    </span>
  )
}
