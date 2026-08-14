import { useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import {
  AppWindow,
  BadgeCheck,
  Bot,
  ChevronDown,
  ChevronRight,
  Code2,
  CreditCard,
  ExternalLink,
  Info,
  MessageCircle,
  Search,
  Star,
  User,
  UserCircle,
  Users,
} from '@/shared/icons'
import {
  AUTHOR_AVATAR,
  type ExperienceProject,
  type ProjectKind,
  type ProjectOrder,
  type SpaceKind,
  projects,
} from './projects-data'

/* ─── 项目库 ───
 *
 * 结构与样式对齐 AI 平台 (ai_design) 的 components/app/AppListPage.tsx +
 * AppListPage.module.scss。那边搭在 @douyin-ai/ui 上（Filter / Badge /
 * Avatar / Banner / PublisherHoverCard），这里按同样尺寸用 Tailwind 重建：
 *   左 216 分类栏（三个空间 × 五种类型，点击锚点滚动）｜ 右 筛选条 + 分组卡片
 * 卡片 128 高、封面 64、四列 gap 16（<1600 三列 / <1180 两列 / <900 一列）。 */

const CATEGORY_ITEMS: { key: ProjectKind; label: string; icon: ReactNode }[] = [
  { key: 'assistant', label: '活动页', icon: <AppWindow size={14} strokeWidth={1.8} /> },
  { key: 'miniapp', label: '小程序', icon: <Code2 size={14} strokeWidth={1.8} /> },
  { key: 'interest', label: '兴趣卡', icon: <CreditCard size={14} strokeWidth={1.8} /> },
  { key: 'avatar', label: 'AI分身', icon: <UserCircle size={14} strokeWidth={1.8} /> },
  { key: 'agent', label: '智能体', icon: <Bot size={14} strokeWidth={1.8} /> },
]

const SECTION_ORDER: ProjectKind[] = ['assistant', 'miniapp', 'interest', 'avatar', 'agent']

const SECTION_LABELS: Record<ProjectKind, string> = {
  assistant: '活动页',
  miniapp: '小程序',
  interest: '兴趣卡',
  avatar: 'AI分身',
  agent: '智能体',
}

const SPACE_SECTIONS: {
  key: SpaceKind
  label: string
  icon: ReactNode
  tone: string
}[] = [
  {
    key: 'team',
    label: '团队空间',
    icon: <Users size={12} strokeWidth={2} />,
    tone: 'bg-[#EFE9FF] text-[#6D45D8]',
  },
  {
    key: 'personal',
    label: '个人空间',
    icon: <User size={12} strokeWidth={2} />,
    tone: 'bg-[#F3E8FF] text-[#844CFF]',
  },
  {
    key: 'featured',
    label: '精选项目',
    icon: <BadgeCheck size={12} strokeWidth={2} />,
    tone: 'bg-[#E8F0FF] text-[#2B6CF6]',
  },
]

const ORDER_OPTIONS = [
  { label: '按使用量排序', value: 'usage' },
  { label: '按收藏量排序', value: 'favorites' },
]

/** '2.3k' → 2300，用于排序。 */
const parseUsage = (usage?: string) => {
  if (!usage) return 0
  const normalized = usage.trim().toLowerCase()
  const multiplier = normalized.endsWith('k') ? 1000 : 1
  return Number.parseFloat(normalized) * multiplier || 0
}

const sectionKeyOf = (space: SpaceKind, kind: ProjectKind) => `${space}:${kind}`

/** 项目卡：源站 CoverProjectCard / CompactProjectCard 结构完全一致，合成一个。
 *  外层是 PublisherHoverCard 的 arch 变体 —— hover 时透出一圈彩色模糊描边。 */
function ProjectCard({
  project,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: {
  project: ExperienceProject
  isFavorite: boolean
  onOpen: () => void
  onToggleFavorite: () => void
}) {
  if (project.activity) {
    const statusTone = project.activity.status === '已上线'
      ? 'bg-emerald-50 text-emerald-700'
      : project.activity.status === '交付中'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-amber-50 text-amber-700'
    return (
      <article
        role="button"
        tabIndex={0}
        aria-label={`打开项目 ${project.title}`}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
          event.preventDefault()
          onOpen()
        }}
        className="group relative flex h-[264px] w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E6E7E9] bg-white text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[#D5D7DA] hover:shadow-[0_10px_26px_rgba(31,35,41,0.08)]"
      >
        <div className="relative h-[106px] shrink-0 overflow-hidden bg-[#F1F2F4]">
          <img src={project.cover} alt={`${project.title} 项目封面`} className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/46 via-black/5 to-transparent" />
          <span className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className={`rounded-md px-2 py-1 text-[9px] font-medium shadow-sm ${statusTone}`}>{project.activity.status}</span>
            {project.activity.priority ? <span className="rounded-md bg-[#FFF2E8] px-2 py-1 text-[9px] font-semibold text-[#B84B2D] shadow-sm">{project.activity.priority}</span> : null}
          </span>
          <span className="absolute bottom-2.5 left-3 rounded bg-black/46 px-2 py-1 text-[9px] text-white/90 backdrop-blur-sm">{project.activity.template}</span>
          <button
            type="button"
            aria-label={`${isFavorite ? '取消收藏' : '收藏'}${project.title}`}
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite()
            }}
            className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/88 text-[#161823]/55 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            <Star size={13} strokeWidth={1.8} className={isFavorite ? 'fill-[#FF8800] text-[#FF8800]' : ''} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[14px] font-semibold leading-5 text-[#1C1F23]">{project.title}</h3>
              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#1C1F23]/52">{project.description}</p>
            </div>
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#1C1F23]/24 transition-transform group-hover:translate-x-0.5" />
          </div>
          {project.activity.sources && project.activity.sources.length > 0 ? (
            <div className="mt-2 flex min-w-0 flex-wrap gap-1.5" aria-label="项目依据">
              {project.activity.sources.map((source) => (
                <a
                  key={`${source.type}-${source.label}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  title={`${source.type} · ${source.label}`}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  className="inline-flex h-5 max-w-[108px] items-center gap-1 rounded-md border border-[#E7E8EA] bg-[#FAFAFB] px-1.5 text-[8px] font-medium text-[#1C1F23]/52 hover:border-[#D5D7DA] hover:bg-white hover:text-[#1C1F23]/76"
                >
                  <span className="shrink-0 text-[#1C1F23]/34">{source.type}</span>
                  <span className="truncate">{source.label}</span>
                  <ExternalLink className="size-2.5 shrink-0" />
                </a>
              ))}
            </div>
          ) : null}
          <div className="mt-auto grid grid-cols-[1fr_auto] items-end gap-3 border-t border-[#F0F1F2] pt-2.5">
            <div className="min-w-0">
              <p className="truncate text-[9px] font-medium text-[#1C1F23]/62">{project.activity.phase}</p>
              <p className="mt-0.5 truncate text-[8px] text-[#1C1F23]/34">{project.activity.investment ?? project.activity.period} · {project.activity.deliverables}</p>
              {project.activity.evidence ? <p className="mt-0.5 truncate text-[8px] font-medium text-[#B84B2D]/72">{project.activity.evidence}</p> : null}
            </div>
            <div className="text-right">
              <p className="text-[8px] text-[#1C1F23]/32">最近更新</p>
              <p className="mt-0.5 text-[9px] font-medium text-[#1C1F23]/55">{project.activity.updatedAt}</p>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="group relative h-full w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 blur-[4px] transition-opacity duration-200 group-hover:opacity-40"
        style={{
          background:
            'linear-gradient(283deg, #1768ff -1.99%, #28bbff 13.36%, #7cf6fe 63.45%, #f6e901 81.37%, #fe8028 92.79%)',
        }}
      />
      <article
        role="button"
        tabIndex={0}
        aria-label={`打开项目 ${project.title}`}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
          event.preventDefault()
          onOpen()
        }}
        className="relative flex h-32 w-full cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border border-[#F2F2F7] bg-white p-4 transition-[box-shadow,border-color] duration-200"
      >
        <div className="flex h-16 w-full min-w-0 items-start gap-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-xl">
            <img
              src={project.cover}
              alt=""
              className="size-16 object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="w-full truncate text-[16px] font-semibold leading-[22px] text-[#1C1F23]">
              {project.title}
            </span>
            <span className="line-clamp-2 h-8 w-full text-[12px] leading-4 text-[#1C1F23]/60">
              {project.description}
            </span>
          </div>
        </div>
        <div className="flex h-5 w-full items-center justify-between text-[12px] leading-4 text-[#1C1F23]/60">
          <span className="flex min-w-0 items-center gap-2">
            <img src={AUTHOR_AVATAR} alt="" className="size-5 shrink-0 rounded-full" />
            <span className="truncate">{project.author}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <MessageCircle size={12} strokeWidth={1.8} />
              {project.usage ?? '2.3k'}
            </span>
            <span aria-hidden className="h-2.5 w-px bg-[rgba(45,66,107,0.12)]" />
            <button
              type="button"
              aria-label={`${isFavorite ? '取消收藏' : '收藏'}${project.title}`}
              title={isFavorite ? '取消收藏' : '收藏'}
              onClick={(event) => {
                event.stopPropagation()
                onToggleFavorite()
              }}
              className="-ml-1 flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-black/[0.04]"
            >
              <Star
                size={12}
                strokeWidth={1.8}
                className={isFavorite ? 'fill-[#FF8800] text-[#FF8800]' : 'text-[#1C1F23]/60'}
              />
              {project.favorites ?? 3}
            </button>
          </span>
        </div>
      </article>
    </div>
  )
}

export default function ProjectLibraryPage({ onOpenProject }: { onOpenProject?: (project: ExperienceProject) => void }) {
  const contentRef = useRef<HTMLElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [keyword, setKeyword] = useState('')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [onlyMine, setOnlyMine] = useState(false)
  const [orderBy, setOrderBy] = useState<ProjectOrder>('usage')
  const [collapsedSpaces, setCollapsedSpaces] = useState(() => new Set<SpaceKind>())
  const [favorites, setFavorites] = useState(() => new Set<string>())
  const acgPilot = projects.find((project) => project.id === 'team_acg_new_year_2026')

  const toggleFavorite = (id: string) =>
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const visibleProjects = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    const list = projects.filter((project) => {
      const matchKeyword = normalized
        ? `${project.title}${project.description}`.toLowerCase().includes(normalized)
        : true
      const matchFavorite = onlyFavorites ? favorites.has(project.id) : true
      const matchMine = onlyMine ? project.space === 'personal' : true
      return matchKeyword && matchFavorite && matchMine
    })
    return [...list].sort((a, b) => {
      if (Boolean(a.activity) !== Boolean(b.activity)) return a.activity ? -1 : 1
      if (orderBy === 'usage' && a.activity && b.activity) {
        const benchmarkDelta = (a.activity.benchmarkOrder ?? 99) - (b.activity.benchmarkOrder ?? 99)
        if (benchmarkDelta !== 0) return benchmarkDelta
      }
      return orderBy === 'favorites'
        ? (b.favorites ?? 0) - (a.favorites ?? 0)
        : parseUsage(b.usage) - parseUsage(a.usage)
    })
  }, [favorites, keyword, onlyFavorites, onlyMine, orderBy])

  const countOf = (space: SpaceKind, kind?: ProjectKind) =>
    visibleProjects.filter(
      (project) => project.space === space && (!kind || project.kind === kind),
    ).length

  const visibleSections = useMemo(
    () =>
      SPACE_SECTIONS.flatMap((space) =>
        SECTION_ORDER.map((kind) => ({
          key: sectionKeyOf(space.key, kind),
          space: space.key,
          label: `${space.label} · ${SECTION_LABELS[kind]}`,
          items: visibleProjects.filter(
            (project) => project.space === space.key && project.kind === kind,
          ),
        })).filter((section) => section.items.length > 0),
      ),
    [visibleProjects],
  )

  const scrollToSection = (key: string) => {
    const target =
      sectionRefs.current[key] ??
      // 空间标题：滚到该空间下第一个有内容的分组
      Object.entries(sectionRefs.current).find(
        ([sectionKey, element]) => element && sectionKey.startsWith(`${key}:`),
      )?.[1]
    const container = contentRef.current
    if (!target || !container) return
    container.scrollTo({
      top: target.offsetTop - container.offsetTop - 58 - 6,
      behavior: 'smooth',
    })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <header className="flex h-[52px] shrink-0 items-center border-b border-[rgba(45,66,107,0.12)] px-6">
        <h1 className="text-[20px] font-semibold leading-6 tracking-[-0.08px] text-[#1C1F23]">
          项目库
        </h1>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── 左：分类 216 ── */}
        <aside
          aria-label="项目分类"
          className="thin-scroll w-[216px] shrink-0 overflow-y-auto border-r border-[rgba(45,66,107,0.12)] pt-1"
        >
          {SPACE_SECTIONS.map((space) => {
            const collapsed = collapsedSpaces.has(space.key)
            return (
              <section key={space.key} className="px-1.5">
                <div className="group/space relative">
                  <button
                    type="button"
                    onClick={() => scrollToSection(space.key)}
                    className="flex h-10 w-full items-center gap-1.5 rounded-lg px-1.5 py-2.5 text-left text-[13px] font-medium leading-[18px] text-[#1C1F23] transition-colors hover:bg-black/[0.03]"
                  >
                    <span
                      className={`inline-flex size-5 shrink-0 items-center justify-center rounded transition-opacity group-hover/space:opacity-0 ${space.tone}`}
                    >
                      {space.icon}
                    </span>
                    <span>{space.label}</span>
                    <span className="ml-auto inline-flex h-[18px] min-w-2 items-center justify-center rounded-2xl border border-white bg-[rgba(83,96,143,0.07)] px-[5px] text-[12px] font-normal leading-4 text-[#1C1F23]/60">
                      {countOf(space.key)}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${collapsed ? '展开' : '收起'}${space.label}分类`}
                    aria-expanded={!collapsed}
                    title={`${collapsed ? '展开' : '收起'}${space.label}分类`}
                    onClick={(event) => {
                      event.stopPropagation()
                      setCollapsedSpaces((current) => {
                        const next = new Set(current)
                        if (next.has(space.key)) next.delete(space.key)
                        else next.add(space.key)
                        return next
                      })
                    }}
                    className="pointer-events-none absolute left-1.5 top-2.5 flex size-5 items-center justify-center rounded text-[#1C1F23]/60 opacity-0 transition-opacity hover:bg-black/[0.04] group-hover/space:pointer-events-auto group-hover/space:opacity-100"
                  >
                    {collapsed ? (
                      <ChevronRight size={12} strokeWidth={2} />
                    ) : (
                      <ChevronDown size={12} strokeWidth={2} />
                    )}
                  </button>
                </div>
                {!collapsed && (
                  <div className="mt-1 flex flex-col gap-1 pb-2 pl-6">
                    {CATEGORY_ITEMS.map((category) => {
                      const count = countOf(space.key, category.key)
                      return (
                        <button
                          key={`${space.key}-${category.key}`}
                          type="button"
                          onClick={() => scrollToSection(sectionKeyOf(space.key, category.key))}
                          className="flex h-7 w-full items-center gap-1.5 rounded-md px-2 text-left text-[13px] leading-[18px] text-[#1C1F23] transition-colors hover:bg-[rgba(83,96,143,0.07)]"
                        >
                          <span className="inline-flex size-3.5 shrink-0 items-center justify-center text-[#1C1F23]/70">
                            {category.icon}
                          </span>
                          <span>{category.label}</span>
                          <span className="ml-auto min-w-6 pr-1 text-right text-[12px] leading-4 tabular-nums text-[#1C1F23]/45">
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </aside>

        {/* ── 右：Banner + 筛选条 + 分组 ── */}
        <main ref={contentRef} className="thin-scroll min-w-0 flex-1 overflow-y-auto px-6 pb-10">
          {acgPilot ? (
            <section className="-mx-6 grid min-h-[168px] grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] overflow-hidden border-b border-[#E7DDD5] bg-[#F8F4F0] max-[980px]:grid-cols-1">
              <div className="flex flex-col justify-center px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#EA5B34] px-2.5 py-1 text-[9px] font-semibold text-white">P0 · S 级高互动活动</span>
                  <span className="text-[9px] text-[#1C1F23]/34">当前业务验证样板</span>
                </div>
                <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.015em] text-[#1C1F23]">从需求、资产到可发布页面，先在 ACG 新春会跑通</h2>
                <p className="mt-1.5 max-w-[720px] text-[11px] leading-[18px] text-[#1C1F23]/48">原流程单项目投入约 21–24 人月。本次不虚构提效数字，先验证主 KV、双会场、榜单/助力、资源位与战报能否形成可复用模板。</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => onOpenProject?.(acgPilot)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#161823] px-4 text-[11px] font-medium text-white hover:bg-[#2B2C33]">进入端到端样板 <ChevronRight size={13} /></button>
                  {['18 项正式交付', '来源节点可追溯', '模板可复用'].map((label) => <span key={label} className="rounded-full border border-[#DED3CA] bg-white/75 px-2.5 py-1.5 text-[9px] text-[#1C1F23]/52">{label}</span>)}
                </div>
              </div>
              <button type="button" onClick={() => onOpenProject?.(acgPilot)} className="group relative min-h-[168px] overflow-hidden border-l border-[#E7DDD5] bg-[#DDEBF0] text-left max-[980px]:border-l-0 max-[980px]:border-t" aria-label="打开 2026 抖音 ACG 新春会端到端样板">
                <img src="/assets/figma-deliverables/acg/discovery-banner-1372x512.png" alt="2026 抖音 ACG 新春会发现页 Banner" className="absolute inset-0 size-full object-contain transition duration-300 group-hover:scale-[1.01]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <span className="absolute inset-x-4 bottom-4 flex items-center justify-between text-white"><span><span className="block text-[9px] text-white/68">真实 Figma 交付</span><span className="mt-1 block text-[12px] font-semibold">游戏中心发现页 · 1372 × 512</span></span><ExternalLink size={14} className="text-white/72" /></span>
              </button>
            </section>
          ) : (
            <div className="-mx-6 flex items-start gap-2 bg-[#E8F0FF] px-6 py-2.5 text-[13px] leading-5 text-[#1C1F23]/80"><Info size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#2B6CF6]" />团队项目与个人项目按空间权限分别管理。</div>
          )}

          <div className="sticky top-0 z-[5] flex flex-wrap items-center gap-2 bg-white pb-2.5 pt-3">
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
                aria-label="搜索项目"
                className="h-8 w-full rounded-md border border-[rgba(45,66,107,0.12)] bg-white pl-[30px] pr-2 text-[13px] text-[#1C1F23] outline-none transition-colors placeholder:text-[#1C1F23]/35 focus:border-[rgba(45,66,107,0.28)]"
              />
            </label>
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-[#1C1F23]/80 transition-colors hover:bg-black/[0.03]">
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(event) => setOnlyFavorites(event.target.checked)}
                className="size-3.5 cursor-pointer accent-[#1C1F23]"
              />
              只看收藏
            </label>
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-[#1C1F23]/80 transition-colors hover:bg-black/[0.03]">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(event) => setOnlyMine(event.target.checked)}
                className="size-3.5 cursor-pointer accent-[#1C1F23]"
              />
              我创建的
            </label>
            <label className="relative inline-flex h-8 items-center">
              <select
                value={orderBy}
                onChange={(event) => setOrderBy(event.target.value as ProjectOrder)}
                className="h-8 cursor-pointer appearance-none rounded-md border border-[rgba(45,66,107,0.12)] bg-white py-0 pl-2.5 pr-7 text-[13px] text-[#1C1F23] outline-none transition-colors hover:border-[rgba(45,66,107,0.24)]"
              >
                {ORDER_OPTIONS.map((option) => (
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
          </div>

          {visibleSections.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center text-[14px] text-[#1C1F23]/60">
              没有找到匹配的项目
            </div>
          ) : (
            visibleSections.map((section, index) => (
              <section
                key={section.key}
                ref={(element) => {
                  sectionRefs.current[section.key] = element
                }}
                className={`flex flex-col gap-3 ${index === 0 ? 'mt-1.5' : 'mt-6'}`}
              >
                <div className="flex h-5 items-center gap-1 text-[14px] leading-5 text-[#1C1F23]">
                  <strong className="font-semibold">{section.label}</strong>
                  <span className="inline-flex h-[18px] min-w-2 items-center justify-center rounded-2xl border border-white bg-[rgba(83,96,143,0.07)] px-[5px] text-[12px] font-normal leading-4 text-[#1C1F23]/60">
                    {section.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2 min-[1180px]:grid-cols-3 min-[1600px]:grid-cols-4">
                  {section.items.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isFavorite={favorites.has(project.id)}
                      onOpen={() => project.projectName && onOpenProject
                        ? onOpenProject(project)
                        : toast(`「${project.title}」尚未加入当前工作区`)}
                      onToggleFavorite={() => toggleFavorite(project.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  )
}
