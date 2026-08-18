import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from '@/shared/icons'
import {
  AppWindow,
  ArrowUpRight,
  Brush,
  CreditCard,
  Gamepad2,
  Image,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Megaphone,
  MonitorPlay,
  Palette,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  X,
} from '@/shared/icons'
import ChatComposer from '@/shared/components/ChatComposer'
import inspirationData from './inspiration-data.json'

export interface InspirationItem {
  imageUrl: string
  slug: string
  labelKeys: string[]
  title: string
  prompt: string
  textArray: string[]
  model: string
  refSource: string
  width: number
  height: number
  status: string
}

const inspirations = inspirationData as InspirationItem[]
const FAVORITE_STORAGE_KEY = 'creative-studio-inspiration-favorites-v1'

type InspirationOrder = 'newest' | 'oldest'
type InspirationDomain = 'marketing' | 'game' | 'activity-assets' | 'game-assets'
type InspirationCategory =
  | 'all'
  | 'interactive-activity'
  | 'h5-activity'
  | 'native-activity'
  | 'tower-defense'
  | 'survivor'
  | '2d-shooter'
  | 'ip-design'
  | 'activity-poster'
  | 'header-banner'
  | 'resource-slot'
  | 'live-background'
  | 'game-card'
  | 'sprite-frames'
  | 'game-map'
  | 'game-ui'

interface InspirationCategoryItem {
  key: Exclude<InspirationCategory, 'all'>
  label: string
  Icon: LucideIcon
  slugs: readonly string[]
}

interface InspirationDomainItem {
  key: InspirationDomain
  label: string
  Icon: LucideIcon
  iconTone: string
  categories: readonly InspirationCategoryItem[]
}

/** 灵感目录与首页四大创作域共用同一套业务语言。 */
const INSPIRATION_DOMAINS: readonly InspirationDomainItem[] = [
  {
    key: 'marketing',
    label: '运营活动',
    Icon: Megaphone,
    iconTone: 'bg-[#EAF3FF] text-[#2E90FA]',
    categories: [
      { key: 'interactive-activity', label: '互动活动', Icon: Sparkles, slugs: ['collage', 'dreamy'] },
      { key: 'h5-activity', label: 'H5 活动', Icon: AppWindow, slugs: ['illustration'] },
      { key: 'native-activity', label: '原生化活动', Icon: Smartphone, slugs: ['tech-trend'] },
    ],
  },
  {
    key: 'game',
    label: '互动游戏',
    Icon: Gamepad2,
    iconTone: 'bg-[#E9F8F1] text-[#13A06F]',
    categories: [
      { key: 'tower-defense', label: '塔防', Icon: ShieldCheck, slugs: ['mirror-palace'] },
      { key: 'survivor', label: '割草', Icon: Scissors, slugs: ['cosmic-civilization'] },
      { key: '2d-shooter', label: '2D 射击', Icon: Target, slugs: ['neon-ritual-cinema'] },
    ],
  },
  {
    key: 'activity-assets',
    label: '活动素材',
    Icon: Palette,
    iconTone: 'bg-[#FFF3E7] text-[#E57919]',
    categories: [
      { key: 'ip-design', label: 'IP 设计', Icon: Brush, slugs: ['character-dossier'] },
      { key: 'activity-poster', label: '活动海报', Icon: Image, slugs: ['collage', 'food'] },
      { key: 'header-banner', label: '头图 Banner', Icon: LayoutTemplate, slugs: ['dreamy'] },
      { key: 'resource-slot', label: '资源位图', Icon: LayoutGrid, slugs: ['illustration'] },
      { key: 'live-background', label: '直播间背景', Icon: MonitorPlay, slugs: ['neon-ritual-cinema'] },
    ],
  },
  {
    key: 'game-assets',
    label: '游戏素材',
    Icon: Layers,
    iconTone: 'bg-[#F4EEFF] text-[#8257D8]',
    categories: [
      { key: 'game-card', label: '游戏卡牌', Icon: CreditCard, slugs: ['character-dossier'] },
      { key: 'sprite-frames', label: '精灵序列帧', Icon: Sparkles, slugs: ['illustration'] },
      { key: 'game-map', label: '游戏地图', Icon: LayoutGrid, slugs: ['cosmic-civilization', 'mirror-palace', 'sand-bureaucracy'] },
      { key: 'game-ui', label: '游戏 UI', Icon: AppWindow, slugs: ['tech-trend'] },
    ],
  },
]

const categoryCount = (category: InspirationCategoryItem) =>
  inspirations.filter((item) => category.slugs.includes(item.slug)).length

const domainSlugs = (domain: InspirationDomainItem) =>
  new Set(domain.categories.flatMap((category) => category.slugs))

const domainCount = (domain: InspirationDomainItem) => {
  const slugs = domainSlugs(domain)
  return inspirations.filter((item) => slugs.has(item.slug)).length
}

const formatModel = (model: string) =>
  model
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (value) => value.toUpperCase())

export default function InspirationGalleryPage({
  onUse,
}: {
  onUse: (item: InspirationItem, prompt: string) => void
}) {
  const [activeCategory, setActiveCategory] = useState<InspirationCategory>('all')
  const [activeDomain, setActiveDomain] = useState<InspirationDomain>('marketing')
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<InspirationOrder>('newest')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [mineOnly, setMineOnly] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = JSON.parse(window.localStorage.getItem(FAVORITE_STORAGE_KEY) ?? '[]')
      return new Set(Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string') : [])
    } catch {
      return new Set()
    }
  })
  const [selected, setSelected] = useState<InspirationItem | null>(null)
  const [composerItem, setComposerItem] = useState<InspirationItem | null>(null)
  const [composerDraft, setComposerDraft] = useState('')
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const visibleItems = useMemo(
    () => {
      const domain = INSPIRATION_DOMAINS.find((entry) => entry.key === activeDomain) ?? INSPIRATION_DOMAINS[0]
      const domainCategory = domain.categories.find((entry) => entry.key === activeCategory)
      const allowedSlugs = domainCategory ? new Set(domainCategory.slugs) : domainSlugs(domain)
      const filtered = inspirations.filter((item) => {
        if (!allowedSlugs.has(item.slug)) return false
        if (favoriteOnly && !favoriteIds.has(item.imageUrl)) return false
        // 这批数据来自用户此前在 MagicX 创建并导出的 51 张灵感图，均属于“我创建的”。
        if (mineOnly && !item.refSource.includes('magicx.bytedance.net')) return false
        if (!normalizedQuery) return true
        return `${item.title} ${item.prompt} ${item.labelKeys.join(' ')}`
          .toLocaleLowerCase('zh-CN')
          .includes(normalizedQuery)
      })
      return order === 'newest' ? filtered : [...filtered].reverse()
    },
    [activeCategory, activeDomain, favoriteIds, favoriteOnly, mineOnly, normalizedQuery, order],
  )

  useEffect(() => {
    if (!composerItem) return
    const frame = requestAnimationFrame(() => composerRef.current?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setComposerItem(null)
        setComposerDraft('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [composerItem])

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify([...favoriteIds]))
    } catch {
      // 收藏仍保留在当前会话；浏览器禁用存储时不阻断浏览和做同款。
    }
  }, [favoriteIds])

  const selectDomain = (domain: InspirationDomain) => {
    setActiveDomain(domain)
    setActiveCategory('all')
  }

  const selectCategory = (domain: InspirationDomain, category: InspirationCategory) => {
    setActiveDomain(domain)
    setActiveCategory(category)
  }

  const openSameStyleComposer = (item: InspirationItem) => {
    setComposerItem(item)
    setComposerDraft(item.prompt.trim())
    setSelected(null)
  }

  const submitSameStyle = () => {
    if (!composerItem || !composerDraft.trim()) return
    onUse(composerItem, composerDraft.trim())
  }

  const toggleFavorite = (item: InspirationItem) => {
    setFavoriteIds((current) => {
      const next = new Set(current)
      if (next.has(item.imageUrl)) next.delete(item.imageUrl)
      else next.add(item.imageUrl)
      return next
    })
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <header className="flex h-[52px] shrink-0 items-center border-b border-black/[0.07] px-6">
        <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-[#161823]">灵感广场</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="thin-scroll w-[216px] shrink-0 overflow-y-auto border-r border-[#ECEEF0] bg-white px-3 pb-5 pt-4">
          {INSPIRATION_DOMAINS.map((domain) => (
            <InspirationDomainSection
              key={domain.key}
              domain={domain}
              count={domainCount(domain)}
              activeDomain={activeDomain}
              activeCategory={activeCategory}
              onSelectDomain={selectDomain}
              onSelectCategory={selectCategory}
            />
          ))}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#F7F7F8]">
          <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-black/[0.06] bg-white px-5">
            <label className="flex h-9 w-[250px] items-center gap-2 rounded-xl border border-black/[0.09] bg-[#FAFAFB] px-3 focus-within:border-[#3370FF]/35 focus-within:bg-white">
              <Search size={14} className="shrink-0 text-[#161823]/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索标题、标签或画面描述"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#161823] outline-none placeholder:text-[#161823]/30"
              />
            </label>
            <select
              aria-label="更新时间排序"
              value={order}
              onChange={(event) => setOrder(event.target.value as InspirationOrder)}
              className="h-9 rounded-xl border border-black/[0.09] bg-white px-3 text-[11px] text-[#161823]/70 outline-none hover:bg-[#FAFAFB]"
            >
              <option value="newest">更新时间 · 新到旧</option>
              <option value="oldest">更新时间 · 旧到新</option>
            </select>
            <FilterToggle checked={favoriteOnly} onChange={setFavoriteOnly} label="我收藏的" />
            <FilterToggle checked={mineOnly} onChange={setMineOnly} label="我创建的" />
            <span className="ml-auto text-[11px] tabular-nums text-[#161823]/35">{visibleItems.length} 项</span>
          </div>

      <main className={`thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4 ${composerItem ? 'pb-[176px]' : ''}`}>
        {visibleItems.length ? (
          <div style={{ columnWidth: 260, columnGap: 16 }}>
            {visibleItems.map((item) => (
              <article
                key={`${item.slug}-${item.title}`}
                className="group mb-4 inline-block w-full break-inside-avoid overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(22,24,35,0.03)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-16px_rgba(22,24,35,0.3)]"
              >
                <div className="relative block w-full text-left">
                  <button
                    type="button"
                    aria-label={`查看灵感：${item.title}`}
                    onClick={() => setSelected(item)}
                    className="absolute inset-0 z-10 rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]"
                  />
                  <div className="relative overflow-hidden bg-[#ECEDEF]" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                    />
                    <span className="absolute left-2 top-2 translate-y-1 rounded-lg bg-white/92 px-2 py-1 text-[10px] font-medium text-[#161823] opacity-0 shadow-sm backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      查看灵感
                    </span>
                    <button
                      type="button"
                      aria-label={favoriteIds.has(item.imageUrl) ? `取消收藏${item.title}` : `收藏${item.title}`}
                      onClick={() => toggleFavorite(item)}
                      className={`absolute right-2 top-2 z-20 grid size-7 place-items-center rounded-full shadow-sm backdrop-blur transition-colors ${favoriteIds.has(item.imageUrl) ? 'bg-[#161823] text-white' : 'bg-white/92 text-[#161823]/55 hover:text-[#161823]'}`}
                    >
                      <Star size={13} fill={favoriteIds.has(item.imageUrl) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="px-3 pb-3 pt-2.5">
                    <p className="line-clamp-1 text-[13px] font-medium text-[#161823]">{item.title}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-[10px] text-[#161823]/38">{formatModel(item.model)}</span>
                      <div className="flex shrink-0 gap-1">
                        {item.labelKeys.slice(0, 2).map((label) => (
                          <span key={label} className="rounded bg-[#F2F3F5] px-1.5 py-0.5 text-[9px] text-[#161823]/45">{label}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid h-64 place-items-center text-center">
            <div>
              <Image size={28} className="mx-auto text-[#161823]/20" />
              <p className="mt-3 text-[13px] font-medium text-[#161823]/60">没有匹配的灵感</p>
              <button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); setFavoriteOnly(false); setMineOnly(false); setActiveDomain('marketing') }} className="mt-2 text-[11px] text-[#3370FF]">查看运营活动灵感</button>
            </div>
          </div>
        )}
      </main>
        </div>
      </div>

      {selected ? (
        <InspirationDetail
          item={selected}
          onClose={() => setSelected(null)}
          onUse={() => openSameStyleComposer(selected)}
        />
      ) : null}

      {composerItem ? (
        <div className="pointer-events-none absolute bottom-4 left-[216px] right-0 z-20 flex justify-center px-5">
          <div className="pointer-events-auto w-full max-w-[720px]">
            <ChatComposer
              value={composerDraft}
              onChange={setComposerDraft}
              onSend={submitSameStyle}
              placeholder="补充你希望调整的内容"
              ariaLabel="做同款提示词"
              textareaRef={composerRef}
              height={146}
              skinClassName="rounded-[18px] border border-black/[0.10] bg-white shadow-[0_18px_50px_-20px_rgba(22,24,35,0.36)]"
              inputClassName="text-[13px] leading-[20px] text-[#161823] placeholder:text-[#161823]/30"
              sendButtonClassName="size-8 bg-[#161823] text-white hover:bg-[#2C2D35]"
              footerLeft={(
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#161823] px-2.5 text-[11px] font-medium text-white">
                    <Sparkles size={12} strokeWidth={1.8} /> 做同款
                  </span>
                  <span className="max-w-[320px] truncate text-[11px] text-[#161823]/42">{composerItem.title}</span>
                </div>
              )}
              footerExtra={(
                <button
                  type="button"
                  aria-label="关闭做同款对话框"
                  onClick={() => { setComposerItem(null); setComposerDraft('') }}
                  className="grid size-8 place-items-center rounded-full text-[#161823]/42 hover:bg-[#F2F3F5] hover:text-[#161823]"
                >
                  <X size={14} />
                </button>
              )}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function InspirationDomainSection({
  domain,
  count,
  activeDomain,
  activeCategory,
  onSelectDomain,
  onSelectCategory,
}: {
  domain: InspirationDomainItem
  count: number
  activeDomain: InspirationDomain
  activeCategory: InspirationCategory
  onSelectDomain: (domain: InspirationDomain) => void
  onSelectCategory: (domain: InspirationDomain, category: InspirationCategory) => void
}) {
  const isActiveDomain = activeDomain === domain.key

  return (
    <section className="mb-[18px] last:mb-0">
      <button
        type="button"
        onClick={() => onSelectDomain(domain.key)}
        className={`group flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#3370FF]/25 ${isActiveDomain && activeCategory === 'all' ? 'bg-[#F5F6F7]' : 'hover:bg-[#F7F8F9]'}`}
      >
        <span className={`grid size-6 shrink-0 place-items-center rounded-md ${domain.iconTone}`}>
          <domain.Icon size={14} strokeWidth={1.8} />
        </span>
        <span className={`min-w-0 flex-1 text-[13px] font-semibold tracking-[-0.01em] ${isActiveDomain ? 'text-[#161823]' : 'text-[#161823]/78'}`}>
          {domain.label}
        </span>
        <span className="min-w-5 rounded-full bg-[#F5F6F7] px-1.5 py-0.5 text-center text-[11px] tabular-nums leading-4 text-[#161823]/38">
          {count}
        </span>
      </button>

      <div className="mt-1 space-y-0.5 pl-8">
        {domain.categories.map((category) => {
          const isSelected = isActiveDomain && activeCategory === category.key
          const itemCount = categoryCount(category)
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onSelectCategory(domain.key, category.key)}
              className={`flex h-8 w-full items-center gap-2 rounded-md px-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#3370FF]/25 ${isSelected ? 'bg-[#F5F6F7] font-medium text-[#161823]' : 'text-[#161823]/58 hover:bg-[#F7F8F9] hover:text-[#161823]'}`}
            >
              <category.Icon size={15} strokeWidth={1.7} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-[12px]">{category.label}</span>
              <span className="text-[11px] tabular-nums text-[#161823]/34">{itemCount}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function FilterToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <label className={`flex h-9 cursor-pointer items-center gap-2 rounded-xl border px-3 text-[11px] transition-colors ${checked ? 'border-[#161823]/20 bg-[#F2F3F5] font-medium text-[#161823]' : 'border-black/[0.09] bg-white text-[#161823]/62 hover:bg-[#FAFAFB]'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-3 rounded border-black/20 accent-[#161823]"
      />
      {label}
    </label>
  )
}

function InspirationDetail({
  item,
  onClose,
  onUse,
}: {
  item: InspirationItem
  onClose: () => void
  onUse: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex justify-end bg-black/25 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="flex h-full w-[min(720px,72vw)] min-w-[520px] overflow-hidden border-l border-black/[0.08] bg-white shadow-[-18px_0_50px_-28px_rgba(22,24,35,0.45)]">
        <div className="flex min-w-0 flex-1 items-center justify-center bg-[#ECEDEF] p-7">
          <img src={item.imageUrl} alt={item.title} className="max-h-full max-w-full rounded-xl object-contain shadow-[0_16px_44px_-20px_rgba(22,24,35,0.45)]" />
        </div>
        <div className="thin-scroll flex w-[300px] shrink-0 flex-col overflow-y-auto border-l border-black/[0.07] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#F1F0FF] px-2 py-1 text-[9px] font-medium text-[#6254D8]"><Sparkles size={11} /> 灵感</span>
              <h2 className="mt-3 text-[18px] font-semibold leading-6 text-[#161823]">{item.title}</h2>
            </div>
            <button type="button" aria-label="关闭" onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-lg text-[#161823]/45 hover:bg-[#F2F3F5] hover:text-[#161823]"><X size={16} /></button>
          </div>
          <dl className="mt-5 space-y-3 border-y border-black/[0.07] py-4 text-[11px]">
            <div className="flex justify-between gap-4"><dt className="text-[#161823]/38">尺寸</dt><dd className="font-medium text-[#161823]/65">{item.width} × {item.height}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[#161823]/38">模型</dt><dd className="text-right font-medium text-[#161823]/65">{formatModel(item.model)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[#161823]/38">来源</dt><dd className="flex items-center gap-1 font-medium text-[#161823]/65">MagicX <ArrowUpRight size={11} /></dd></div>
          </dl>
          <section className="mt-4">
            <p className="text-[10px] font-semibold text-[#161823]/42">画面描述</p>
            <p className="mt-2 line-clamp-[12] text-[11.5px] leading-[19px] text-[#161823]/58">{item.prompt}</p>
          </section>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.labelKeys.map((label) => <span key={label} className="rounded-md bg-[#F2F3F5] px-2 py-1 text-[10px] text-[#161823]/55">{label}</span>)}
          </div>
          <div className="mt-auto pt-6">
            <button type="button" onClick={onUse} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#161823] text-[11px] font-medium text-white hover:bg-[#2C2D35]"><Sparkles size={13} /> 做同款</button>
          </div>
        </div>
      </aside>
    </div>
  )
}
