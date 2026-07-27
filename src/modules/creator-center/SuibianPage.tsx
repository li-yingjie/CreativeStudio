import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Minus, Plus } from '@/shared/icons'
import { SIDE_NAV_DEFAULT_BACKGROUND } from '@/shared/components/SideNav'
import {
  SIDE_NAV_NUMERIC_CONSTRAINTS,
  useSideNavConfig,
} from '@/shared/components/side-nav-config'
import SideNavDisclosureIcon from '@/shared/components/SideNavDisclosureIcon'
import { LayoutLeftLinearIcon } from 'master-icon/react/LayoutLeftLinearIcon'

/* ─── 随变（AI 短片创作工作台） — 设计稿 统一导航 244-19030「04-随变-编辑」 ───
 * 三栏：左侧项目/角色列表 + 中间创作对话 + 右侧无限画布。
 * 演示页：对话与画布内容取自设计稿，画布产物为设计导出整图。 */

const A = '/assets/suibian'
const ICON = '/icons/suibian'

interface Cell {
  id: string
  title: string
  date: string
  img: string
  /** 我的世界：标题下的风格标签，用「/」分隔。 */
  tags?: string[]
}

const PROJECTS: Cell[] = [
  { id: 'jennie', title: 'Jennie 哥特 MV', date: '2026年3月31日 19:28', img: `${A}/projects/jennie.png` },
  { id: 'kimetsu', title: '鬼灭之刃掉入无限城二创', date: '2026年3月30日 17:02', img: `${A}/projects/kimetsu.png` },
  { id: 'awake', title: '醒来被双男主争宠，我懵了', date: '2026年3月30日 14:04', img: `${A}/projects/awake.png` },
  { id: 'gagas', title: 'Gagas 的奇幻冒险', date: '2026年2月28日 18:02', img: `${A}/projects/gagas.png` },
]

const ROLES: Cell[] = [
  'Like Jennie,狂拽酷丸子头,小鼻嘎,林小夕,白曼曼,顾霆骁,林老先生,思瑾'
    .split(','),
]
  .flat()
  .map((title, i) => ({
    id: `role-${i}`,
    title,
    date: '2026年3月31日 19:28',
    img: `${A}/roles/${i + 1}.png`,
  }))

const WORLDS: Cell[] = [
  {
    id: 'xinghedu',
    title: '星禾渡',
    date: '2026年3月31日 19:28',
    img: `${ICON}/world-item.svg`,
    tags: ['麦香微光', '星絮浮动', '低饱和治愈系'],
  },
  {
    id: 'brothers',
    title: '余华《兄弟》IP世界观',
    date: '2026年3月31日 19:28',
    img: `${ICON}/world-item.svg`,
    tags: ['时代写实', '荒诞主义'],
  },
]

/** 对话消息 — user 右侧灰白气泡，ai 左侧白卡；ai 消息可带「创作总监」头
 *  与状态 chip（设计稿的工具调用回执）。文中的高亮词用 mark 标出。 */
type Msg =
  | { who: 'user'; text: string }
  | { who: 'ai'; head?: boolean; chip?: string; parts: (string | { hl: string })[] }

const MESSAGES: Msg[] = [
  {
    who: 'ai',
    head: true,
    parts: [
      '形象收到了。这种软萌又带点俏皮的质感太治愈了，尤其是配上这种草坪背景，隔着屏幕都能感觉到风。',
    ],
  },
  {
    who: 'ai',
    parts: [
      '我建议可以往治愈系短片或者互动解压小游戏的方向走。如果想展现那种"奔跑在星空下"的动态美，做一个光影感极强的叙事短片效果最出彩。你是想让 ta 在短片里开启一段"治愈冒险"，还是先给 ta 二创几个在不同自然天气下的立绘看看？',
    ],
  },
  { who: 'user', text: '想看短片，冒险那种，感觉在星空下跑起来一定很美。' },
  {
    who: 'ai',
    head: true,
    chip: '已获取制作故事短片的知识',
    parts: [
      '没问题，星空下的奔跑绝对是视觉焦点。为了把那种"星垂平野阔"的意境撑起来，我强烈建议用 ',
      { hl: '宽屏 21:9 的电影比例' },
      '，这样草坪的纵深和星空的广袤才有压迫感。',
    ],
  },
  {
    who: 'ai',
    parts: [
      '既然是冒险，咱们是走那种色彩明快的"',
      { hl: '奇幻冒险' },
      '"，还是更安静、更有故事感的"',
      { hl: '孤独而温暖' },
      '"的风格？时间设定在 1 分钟左右。如果是这种走心的风格，不需要太多台词，靠场景音效和音乐就能把情绪拉满。',
    ],
  },
  { who: 'user', text: '行，宽屏合适。走那种温暖治愈的吧，别太闹腾，画面要精致。' },
  {
    who: 'ai',
    head: true,
    chip: '查找情绪关键词',
    parts: [
      '明白了。我们要的是那种"万物共生下的自由时刻"。核心画面定在阿米嘎朵喵喵穿过午后的金色草坪，一直跑到繁星点点的深夜。',
    ],
  },
  {
    who: 'ai',
    parts: [
      '我打算把叙事核心定在"与自然的无声陪伴"，拒绝那种低幼的打闹，用奔跑时的微风和星光的流动来表达情绪。这种',
      { hl: '纯真的自由感' },
      '和',
      { hl: '生命的跳动' },
      '，哪一个更能戳中你？或者你觉得还得再加点奇幻的萤火虫光效？',
    ],
  },
  { who: 'user', text: '生命力吧，我就想看 ta 自由自在奔跑的样子，那种最质朴的快乐。' },
]

/** 分组头 —— 图标 + 标题 + 新建/折叠。 */
function GroupHeader({
  icon,
  label,
  collapsed,
  onToggle,
}: {
  icon: string
  label: string
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-1 px-1">
      {/* 分组图标非正方形（earth.svg 16×12），contain 保比例不拉伸 */}
      <img src={icon} alt="" aria-hidden className="size-4 shrink-0 object-contain" />
      <span className="flex-1 text-[12px] text-[#161823]">{label}</span>
      <button
        type="button"
        title={`新建${label.replace('我的', '')}`}
        onClick={() => toast(`新建${label.replace('我的', '')}（演示）`)}
        className="flex size-4 items-center justify-center text-[#161823]/45 transition-colors hover:text-[#161823]"
      >
        <Plus size={13} strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-label={`${collapsed ? '展开' : '收起'}${label}`}
        onClick={onToggle}
        className="flex size-4 items-center justify-center text-[#161823]/45 transition-colors hover:text-[#161823]"
      >
        <SideNavDisclosureIcon
          expanded={!collapsed}
          className="transition-transform duration-150"
        />
      </button>
    </div>
  )
}

/** 列表行 —— 缩略图 + 标题 + 时间。round 为角色的圆形头像；
 *  我的世界的行用 20px 线性图标，标题下多一行风格标签。 */
function ListCell({
  cell,
  round,
  glyph,
  active,
  onClick,
}: {
  cell: Cell
  round?: boolean
  /** 图标是线性字形（我的世界），不做裁切与底色。 */
  glyph?: boolean
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full gap-1.5 rounded-2xl py-2 pl-2 pr-3 text-left transition-colors ${
        glyph ? 'items-start' : 'items-center'
      } ${active ? 'bg-[#f1f1f1]' : 'hover:bg-[#f6f6f7]'}`}
    >
      <img
        src={cell.img}
        alt=""
        className={
          glyph
            ? 'size-5 shrink-0'
            : `size-8 shrink-0 bg-black/[0.04] object-cover ${round ? 'rounded-full' : 'rounded-lg'}`
        }
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[11px] text-[#161823]">{cell.title}</span>
        {cell.tags && (
          <span className="flex items-center gap-1 truncate text-[rgba(22,24,35,0.6)]">
            {cell.tags.map((t, i) => (
              <span key={t} className="flex shrink-0 items-center gap-1">
                {i > 0 && <span className="text-[10px]">/</span>}
                <span className="text-[8.5px]">{t}</span>
              </span>
            ))}
          </span>
        )}
        <span className="truncate text-[10px] text-[rgba(22,24,35,0.34)]">{cell.date}</span>
      </span>
    </button>
  )
}

/** 气泡 —— host（用户）右侧、圆角右上收窄；guest（AI）左侧、左上收窄。 */
function Bubble({ who, children }: { who: 'user' | 'ai'; children: ReactNode }) {
  return (
    <div className={`flex ${who === 'user' ? 'justify-end' : ''}`}>
      <div
        className={`max-w-[318px] bg-white px-4 py-3 text-[12px] leading-[1.7] text-[#161823] shadow-[0_4px_30px_rgba(0,0,0,0.06)] ${
          who === 'user'
            ? 'rounded-[24px] rounded-tr-[4px] font-medium'
            : 'w-full max-w-none rounded-[22px] rounded-tl-[4px]'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

/** 随变的左侧栏 —— 项目 / 角色 / 世界三组 + 收起导航。
 *  自成一体（含展开态与拖拽宽度），规范画布 /sidebar 直接复用同一份，
 *  避免两处各写一遍再各自漂移。 */
export function SuibianSideNav() {
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [rolesOpen, setRolesOpen] = useState(true)
  const [worldsOpen, setWorldsOpen] = useState(true)
  const [activeProject, setActiveProject] = useState('awake')

  // 全局配置提供基准宽度；本页拖拽仍只覆盖当前页面。
  const configuredWidth = useSideNavConfig((s) => s.config.width)
  const [sidebarWidthState, setSidebarWidthState] = useState(() => ({
    configuredWidth,
    width: configuredWidth,
  }))
  if (sidebarWidthState.configuredWidth !== configuredWidth) {
    setSidebarWidthState({ configuredWidth, width: configuredWidth })
  }
  const sidebarWidth =
    sidebarWidthState.configuredWidth === configuredWidth
      ? sidebarWidthState.width
      : configuredWidth
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const onDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: e.clientX, startWidth: sidebarWidth }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = dragRef.current
    if (!s) return
    const { min, max } = SIDE_NAV_NUMERIC_CONSTRAINTS.width
    setSidebarWidthState({
      configuredWidth,
      width: Math.min(max, Math.max(min, s.startWidth + (e.clientX - s.startX))),
    })
  }
  const onDragEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
      <aside
        aria-label="随变侧栏"
        style={{ width: sidebarWidth, background: SIDE_NAV_DEFAULT_BACKGROUND }}
        className="relative flex shrink-0 flex-col overflow-hidden border-r border-black/[0.06]"
      >
        {/* 右边缘拖拽把手 */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="拖拽调整侧栏宽度"
          aria-valuemin={SIDE_NAV_NUMERIC_CONSTRAINTS.width.min}
          aria-valuemax={SIDE_NAV_NUMERIC_CONSTRAINTS.width.max}
          aria-valuenow={Math.round(sidebarWidth)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
            e.preventDefault()
            const { min, max } = SIDE_NAV_NUMERIC_CONSTRAINTS.width
            setSidebarWidthState({
              configuredWidth,
              width: Math.min(
                max,
                Math.max(min, sidebarWidth + (e.key === 'ArrowRight' ? 8 : -8)),
              ),
            })
          }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          className="group absolute bottom-0 right-0 top-0 z-10 w-1 translate-x-1/2 cursor-col-resize touch-none select-none"
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-black/20 group-active:bg-black/30" />
        </div>
        <div className="thin-scroll-light min-h-0 flex-1 overflow-y-auto px-4 pt-3">
          <div className="flex flex-col gap-1.5">
            <GroupHeader
              icon={`${ICON}/folder.svg`}
              label="我的项目"
              collapsed={!projectsOpen}
              onToggle={() => setProjectsOpen((v) => !v)}
            />
            {projectsOpen &&
              PROJECTS.map((p) => (
                <ListCell
                  key={p.id}
                  cell={p}
                  active={activeProject === p.id}
                  onClick={() => setActiveProject(p.id)}
                />
              ))}
          </div>

          <div className="my-4 h-px bg-black/[0.06]" />

          <div className="flex flex-col gap-1.5">
            <GroupHeader
              icon={`${ICON}/character.svg`}
              label="我的角色"
              collapsed={!rolesOpen}
              onToggle={() => setRolesOpen((v) => !v)}
            />
            {rolesOpen &&
              ROLES.map((r) => (
                <ListCell key={r.id} cell={r} round onClick={() => toast(`打开角色「${r.title}」（演示）`)} />
              ))}
          </div>

          <div className="my-4 h-px bg-black/[0.06]" />

          <div className="flex flex-col gap-1 pb-4">
            <GroupHeader
              icon={`${ICON}/earth.svg`}
              label="我的世界"
              collapsed={!worldsOpen}
              onToggle={() => setWorldsOpen((v) => !v)}
            />
            {worldsOpen &&
              WORLDS.map((w) => (
                <ListCell key={w.id} cell={w} glyph onClick={() => toast(`打开世界「${w.title}」（演示）`)} />
              ))}
          </div>
        </div>

        {/* 底部「收起导航」— 与创作者中心 / AI 工坊侧栏统一 */}
        <div className="shrink-0 px-3 pb-3">
          <button
            type="button"
            onClick={() => toast('收起导航（演示）')}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-[13px] text-[#252632]/55 transition-colors hover:bg-black/[0.03] hover:text-[#252632]/80"
          >
            <LayoutLeftLinearIcon size={18} className="shrink-0 text-[#252632]" />
            收起导航
          </button>
        </div>
      </aside>
  )
}

export default function SuibianPage() {
  const [draft, setDraft] = useState('')
  const [zoom, setZoom] = useState(16)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  const send = () => {
    if (!draft.trim()) return
    toast('创作总监正在接入中（演示）')
    setDraft('')
  }

  return (
    <div className="flex h-full bg-[#f1f1f2]">
      {/* ── 左：项目 / 角色 ── */}
      <SuibianSideNav />

      {/* ── 中：创作对话 ── */}
      {/* 底色取自设计稿像素：对话栏 #f0f0f1（白气泡/白输入框靠它拉开层次） */}
      <section className="flex w-[440px] shrink-0 flex-col overflow-hidden bg-[#f0f0f1]">
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <h2 className="truncate text-[15px] font-medium text-[#161823]">阿米嘎朵喵喵</h2>
          <button
            type="button"
            title="灵感速记"
            aria-label="灵感速记"
            onClick={() => toast('灵感速记（演示）')}
            className="flex size-8 items-center justify-center rounded-full bg-white text-[#161823] shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2.5 13.5 5 13l7.3-7.3a1.8 1.8 0 0 0-2.5-2.5L2.5 10.5l-.5 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="thin-scroll-light flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-2">
          {MESSAGES.map((m, i) =>
            m.who === 'user' ? (
              <Bubble key={i} who="user">{m.text}</Bubble>
            ) : (
              <div key={i} className="flex flex-col gap-2">
                {m.head && (
                  <div className="flex items-center gap-1.5 pt-2">
                    <img src={`${A}/director.png`} alt="" aria-hidden className="size-8 shrink-0 object-contain" />
                    <span className="text-[11px] font-medium text-[rgba(22,24,35,0.6)]">创作总监</span>
                    {m.chip && (
                      <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-[rgba(22,24,35,0.6)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0">
                          <circle cx="6" cy="6" r="5" fill="#00C566" />
                          <path d="m3.6 6.1 1.6 1.6 3.2-3.4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {m.chip}
                      </span>
                    )}
                  </div>
                )}
                <Bubble who="ai">
                  {m.parts.map((p, j) =>
                    typeof p === 'string' ? (
                      p
                    ) : (
                      <span key={j} className="text-[#ff6a2b]">{p.hl}</span>
                    ),
                  )}
                </Bubble>
              </div>
            ),
          )}
        </div>

        {/* 输入框（设计稿 244-13616） */}
        <div className="shrink-0 px-3 pb-3 pt-2">
          <div className="flex flex-col gap-2 rounded-[18px] border-[0.5px] border-black/[0.08] bg-white p-3">
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="输入你的创作想法"
              aria-label="输入你的创作想法"
              // 输入区 58px + 工具条 24px + gap 8 + 内边距 24 = 114px（设计稿 Input Box 高度）
              className="h-[58px] resize-none bg-transparent text-[12px] leading-[20px] text-[#161823] outline-none placeholder:text-[rgba(22,24,35,0.34)]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[
                  { icon: `${ICON}/plus.svg`, label: '添加素材' },
                  { icon: `${ICON}/at.svg`, label: '引用角色' },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    title={b.label}
                    aria-label={b.label}
                    onClick={() => toast(`${b.label}（演示）`)}
                    className="flex h-6 items-center justify-center rounded-[7.5px] bg-[#f3f3f4] px-[5px] transition-colors hover:bg-[#ebebec]"
                  >
                    <img src={b.icon} alt="" aria-hidden className="size-3.5" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                title="发送"
                aria-label="发送"
                disabled={!draft.trim()}
                onClick={send}
                className="flex size-6 items-center justify-center rounded-full bg-[#fce918] transition-opacity disabled:opacity-40"
              >
                <img src={`${ICON}/arrow-up.svg`} alt="" aria-hidden className="w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 右：画布 ── */}
      <section className="relative min-w-0 flex-1 overflow-hidden bg-[#f3f3f4]">
        {/* 点阵底 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(22,24,35,0.13) 1.4px, transparent 1.4px)',
            backgroundSize: '13px 13px',
          }}
        />
        {/* 画布产物（设计稿导出整图：剧本卡 / 形象设定 / 分镜 / 成片） */}
        <div className="absolute inset-0 overflow-auto">
          <img
            src={`${A}/canvas.png`}
            alt="创作画布：剧本、形象设定图、分镜与成片"
            className="max-w-none select-none p-4 transition-[width] duration-200"
            style={{ width: `${(zoom / 16) * 656}px` }}
          />
        </div>

        {/* 画布模式切换 */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <div className="flex h-8 items-center gap-1 rounded-full bg-white px-3 text-[12px] font-medium text-[#161823] shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2.5 13.5 5 13l7.3-7.3a1.8 1.8 0 0 0-2.5-2.5L2.5 10.5l-.5 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            画布模式
          </div>
          <button
            type="button"
            title="保存画布"
            aria-label="保存画布"
            onClick={() => toast('画布已保存（演示）')}
            className="flex size-8 items-center justify-center rounded-full text-[#161823]/70 transition-colors hover:bg-white hover:text-[#161823]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3h7.5L13 5.5V13H3V3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M5.5 3v3.5h5V3M5.5 13v-3h5v3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 缩放 HUD */}
        <div className="absolute bottom-4 right-4 flex h-[46px] items-center gap-1 rounded-full bg-white px-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          <button
            type="button"
            aria-label="放大"
            onClick={() => setZoom((z) => Math.min(200, z + 8))}
            className="flex size-7 items-center justify-center rounded-full text-[#161823] transition-colors hover:bg-black/[0.05]"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
          <span className="w-10 text-center text-[13px] tabular-nums text-[#161823]">{zoom}%</span>
          <button
            type="button"
            aria-label="缩小"
            onClick={() => setZoom((z) => Math.max(8, z - 8))}
            className="flex size-7 items-center justify-center rounded-full text-[#161823] transition-colors hover:bg-black/[0.05]"
          >
            <Minus size={16} strokeWidth={2} />
          </button>
          <span aria-hidden className="mx-1 h-4 w-px bg-black/10" />
          {[
            { label: '选择', d: 'M4 2.5 12.5 7 8.6 8.6 7 12.5 4 2.5Z' },
            { label: '抓手', d: 'M5 7V4.5a1 1 0 1 1 2 0V7m0 0V3.6a1 1 0 1 1 2 0V7m0 0V4.6a1 1 0 1 1 2 0V9c0 2.2-1.4 4-3.5 4S4.5 11.2 4.5 9V7.4a1 1 0 0 1 2 0' },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.label}
              aria-label={t.label}
              onClick={() => toast(`${t.label}工具（演示）`)}
              className="flex size-7 items-center justify-center rounded-full text-[#161823]/75 transition-colors hover:bg-black/[0.05] hover:text-[#161823]"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d={t.d} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
