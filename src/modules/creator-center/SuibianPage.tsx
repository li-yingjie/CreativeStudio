import { useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { Minus, Plus } from '@/shared/icons'
import ChatComposer from '@/shared/components/ChatComposer'
import ComposerLocalFileButton from '@/shared/components/ComposerLocalFileButton'
import PanelResizeHandle from '@/shared/components/PanelResizeHandle'
import SharedSideNav, {
  SIDE_NAV_MOTION_DURATION,
} from '@/shared/components/SideNav'
import SideNavResizeHandle from '@/shared/components/SideNavResizeHandle'
import { useResizableSideNavWidth } from '@/shared/hooks/useResizableSideNavWidth'
import SideNavProductHeader from '@/shared/components/SideNavProductHeader'
import SideNavPanelStateIcon from '@/shared/components/SideNavPanelStateIcon'
import SideNavSearchToolbar from '@/shared/components/SideNavSearchToolbar'
import SideNavIconFooterActions, {
  SideNavCollapseFooterButton,
} from '@/shared/components/SideNavIconFooterActions'
import {
  useNavVersion,
  usesProductHeaderLayout,
  usesSchemeFourLayout,
  usesSearchToolbarLayout,
  usesStandaloneWorkshopLayout,
  usesContentToggleLayout,
  usesToolbarHeaderLayout,
} from '@/shared/storage/nav-version'
import { useProductSideNav } from '@/shared/storage/product-side-nav'
import UnifiedToolbar from './UnifiedToolbar'

/* ─── 随变（AI 短片创作工作台） — 设计稿 统一导航 244-19030「04-随变-编辑」 ───
 * 三栏：左侧项目/角色列表 + 中间创作对话 + 右侧无限画布。
 * 演示页：对话与画布内容取自设计稿，画布产物为设计导出整图。 */

const A = '/assets/suibian'
const ICON = '/icons/suibian'

interface NavCell {
  id: string
  title: string
  date?: string
  img: string
}

const SUIBIAN_NAV_GROUPS = [
  { key: 'tasks', label: '任务', icon: `${ICON}/nav-task.svg` },
  { key: 'roles', label: '我的角色', icon: `${ICON}/nav-my-role.svg` },
  { key: 'library', label: '角色库', icon: `${ICON}/nav-role-library.svg` },
  { key: 'worlds', label: '世界书', icon: `${ICON}/nav-world.svg` },
] as const

const SUIBIAN_SCHEME_TWO_TOOLBAR_ACTIONS = [
  'layout',
  'create',
  'search',
] as const

const TASKS: NavCell[] = [
  {
    id: 'working-cat',
    title: '打工猫的日常：社畜的一天',
    date: '5月30日 14:04',
    img: `${A}/nav/task-cat.png`,
  },
  {
    id: 'amigaduo',
    title: '阿米嘎朵喵喵',
    date: '3月30日 14:04',
    img: `${A}/nav/task-ami.png`,
  },
  {
    id: 'jennie',
    title: 'Jennie 哥特 MV',
    date: '3月31日 19:28',
    img: `${A}/projects/jennie.png`,
  },
  {
    id: 'kimetsu',
    title: '鬼灭之刃掉入无限城二创',
    date: '3月30日 17:02',
    img: `${A}/projects/kimetsu.png`,
  },
]

const MY_ROLES: NavCell[] = [
  {
    id: 'real-person-1',
    title: '真人形象1',
    img: `${A}/nav/my-role-1.png`,
  },
  {
    id: 'real-person-2',
    title: '真人形象2',
    img: `${A}/nav/my-role-2.png`,
  },
  {
    id: 'douyin-zai',
    title: '抖音仔仔',
    img: `${A}/nav/my-role-3.png`,
  },
]

const ROLE_LIBRARY: NavCell[] = [
  { id: 'like-jennie', title: 'Like Jennie', img: `${A}/projects/jennie.png` },
  { id: 'xiaobiga', title: '小鼻嘎', img: `${A}/roles/3.png` },
  { id: 'linxiaoxi', title: '林小夕', img: `${A}/roles/4.png` },
  { id: 'baimanman', title: '白曼曼', img: `${A}/roles/5.png` },
  { id: 'gutingxiao', title: '顾霆骁', img: `${A}/roles/6.png` },
]

const WORLD_BOOKS: NavCell[] = [
  { id: 'linglong', title: '灵笼世界书', img: `${ICON}/nav-world-item.svg` },
  { id: 'brothers', title: '兄弟', img: `${ICON}/nav-world-item.svg` },
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

/** Figma 425-31142 分组头：图标、标题、可选平台资产标签与右侧操作。 */
function GroupHeader({
  icon,
  label,
  tag,
  searchable = false,
  creatable = false,
  collapsed,
  onToggle,
}: {
  icon: string
  label: string
  tag?: string
  searchable?: boolean
  creatable?: boolean
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-1 pl-[10px] pr-1">
      <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
        <img src={icon} alt="" className="max-h-full max-w-full object-contain" />
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="min-w-0 truncate text-[12px] leading-[normal] text-[#161823]">
          {label}
        </span>
        {tag && (
          <span className="flex h-5 shrink-0 items-center rounded-full bg-[#fce918]/30 px-2 text-[10px] font-medium leading-[normal] text-[#bb8300]">
            {tag}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {searchable && (
          <button
            type="button"
            aria-label={`搜索${label}`}
            title={`搜索${label}`}
            onClick={() => toast(`搜索${label}（演示）`)}
            className="flex size-4 shrink-0 items-center justify-center rounded text-[#161823]/45 hover:bg-black/[0.04]"
          >
            <img
              src={`${ICON}/nav-search.svg`}
              alt=""
              aria-hidden
              className="max-h-full max-w-full"
            />
          </button>
        )}
        {creatable && (
          <button
            type="button"
            title={`新建${label}`}
            aria-label={`新建${label}`}
            onClick={() => toast(`新建${label}（演示）`)}
            className="flex size-4 shrink-0 items-center justify-center rounded text-[#161823]/45 hover:bg-black/[0.04]"
          >
            <img
              src={`${ICON}/nav-plus.svg`}
              alt=""
              aria-hidden
              className="max-h-full max-w-full"
            />
          </button>
        )}
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={`${collapsed ? '展开' : '收起'}${label}`}
          onClick={onToggle}
          className="flex size-4 shrink-0 items-center justify-center rounded text-[#161823]/45 hover:bg-black/[0.04]"
        >
          <img
            src={`${ICON}/nav-collapse.svg`}
            alt=""
            aria-hidden
            className={`max-h-full max-w-full transition-transform duration-150 motion-reduce:transition-none ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </span>
    </div>
  )
}

function MoreDots() {
  return (
    <span aria-hidden className="flex size-4 shrink-0 items-center justify-center gap-[2px] opacity-50">
      {[0, 1, 2].map((dot) => (
        <img
          key={dot}
          src={`${ICON}/nav-more-dot.svg`}
          alt=""
          className="size-0.5"
        />
      ))}
    </span>
  )
}

function TaskCell({
  cell,
  active,
  onClick,
}: {
  cell: NavCell
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-2xl py-2 pl-2 text-left transition-colors ${
        active ? 'pr-2' : 'pr-3'
      } ${
        active ? 'bg-[#f1f1f1]' : 'hover:bg-black/[0.03]'
      }`}
    >
      <img
        src={cell.img}
        alt=""
        className="size-8 shrink-0 rounded-lg bg-black/[0.04] object-cover"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[11px] text-[#161823]">{cell.title}</span>
        <span className="truncate text-[10px] text-[rgba(22,24,35,0.34)]">
          {cell.date}
        </span>
      </span>
      {active && <MoreDots />}
    </button>
  )
}

const ROLE_SEGMENTS = [
  { key: 'original', label: '原创角色' },
  { key: 'ai', label: 'AI 形象' },
  { key: 'task', label: '来自任务' },
] as const

type RoleSegment = (typeof ROLE_SEGMENTS)[number]['key']

function RoleSegmentedControl({
  value,
  onChange,
}: {
  value: RoleSegment
  onChange: (value: RoleSegment) => void
}) {
  return (
    <div className="flex h-7 w-full items-center rounded-full bg-[rgba(22,24,35,0.05)] p-0.5">
      {ROLE_SEGMENTS.map((segment) => {
        const active = segment.key === value
        return (
          <button
            key={segment.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(segment.key)}
            className={`flex h-full min-w-0 flex-1 items-center justify-center rounded-full px-1 text-[10px] ${
              active
                ? 'border border-white bg-white font-medium text-[#161823]'
                : 'text-[rgba(22,24,35,0.75)] hover:bg-white/55'
            }`}
          >
            <span className="truncate">{segment.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function MyRoleGrid({ roles = MY_ROLES }: { roles?: NavCell[] }) {
  return (
    <div className="grid w-full grid-cols-3 gap-1">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => toast(`打开角色「${role.title}」（演示）`)}
          className="flex h-[71px] min-w-0 flex-col items-center justify-center gap-2 rounded-lg p-1 text-center hover:bg-black/[0.03]"
        >
          <img
            src={role.img}
            alt=""
            className="size-8 shrink-0 rounded-full bg-[#f1f0f3] object-cover"
          />
          <span className="w-full truncate text-[11px] text-[#161823]">{role.title}</span>
        </button>
      ))}
    </div>
  )
}

function LibraryCell({ cell }: { cell: NavCell }) {
  return (
    <button
      type="button"
      onClick={() => toast(`打开角色「${cell.title}」（演示）`)}
      className="flex w-full items-center gap-1.5 rounded-2xl py-2 pl-2 pr-3 text-left hover:bg-black/[0.03]"
    >
      <img
        src={cell.img}
        alt=""
        className="size-8 shrink-0 rounded-full bg-black/[0.04] object-cover"
      />
      <span className="min-w-0 flex-1 truncate text-[11px] text-[#161823]">{cell.title}</span>
    </button>
  )
}

function WorldCell({ cell, showMore = false }: { cell: NavCell; showMore?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => toast(`打开世界书「${cell.title}」（演示）`)}
      className="flex w-full items-center gap-1.5 rounded-2xl py-2 pl-2 pr-3 text-left hover:bg-black/[0.03]"
    >
      <img src={cell.img} alt="" className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-[11px] text-[#161823]">{cell.title}</span>
      {showMore && <MoreDots />}
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

/** 随变的左侧栏 —— 任务 / 我的角色 / 角色库 / 世界书 + 收起导航。
 *  自成一体（含展开态与拖拽宽度），规范画布 /sidebar 直接复用同一份，
 *  避免两处各写一遍再各自漂移。 */
export function SuibianSideNav() {
  const [tasksOpen, setTasksOpen] = useState(true)
  const [rolesOpen, setRolesOpen] = useState(true)
  const [libraryOpen, setLibraryOpen] = useState(true)
  const [worldsOpen, setWorldsOpen] = useState(true)
  const [activeTask, setActiveTask] = useState('working-cat')
  const [roleSegment, setRoleSegment] = useState<RoleSegment>('ai')
  const [navSearch, setNavSearch] = useState('')
  const navVersion = useNavVersion((state) => state.version)
  const schemeFourLayout = usesSchemeFourLayout(navVersion)
  const searchToolbarLayout = usesSearchToolbarLayout(navVersion)
  const workbenchHeaderLayout = usesStandaloneWorkshopLayout(navVersion)
  const sidebarCollapsed = useProductSideNav(
    (state) => state.collapsed.suibian,
  )
  const setSidebarCollapsed = useProductSideNav((state) => state.setCollapsed)
  const reduceSideNavMotion = useReducedMotion() ?? false

  const { width: sidebarWidth, setWidth: setSidebarWidth } = useResizableSideNavWidth()
  const normalizedNavSearch = searchToolbarLayout
    ? navSearch.trim().toLocaleLowerCase('zh-CN')
    : ''
  const filterCells = (label: string, cells: NavCell[]) =>
    !normalizedNavSearch ||
    label.toLocaleLowerCase('zh-CN').includes(normalizedNavSearch)
      ? cells
      : cells.filter((cell) =>
          cell.title.toLocaleLowerCase('zh-CN').includes(normalizedNavSearch),
        )
  const visibleTasks = filterCells('任务', TASKS)
  const visibleMyRoles = filterCells('我的角色', MY_ROLES)
  const visibleRoleLibrary = filterCells('角色库', ROLE_LIBRARY)
  const visibleWorldBooks = filterCells('世界书', WORLD_BOOKS)
  const hasSearchResults =
    visibleTasks.length > 0 ||
    visibleMyRoles.length > 0 ||
    visibleRoleLibrary.length > 0 ||
    visibleWorldBooks.length > 0

  if (
    sidebarCollapsed &&
    (navVersion === 1 ||
      usesToolbarHeaderLayout(navVersion) ||
      navVersion === 3 ||
      searchToolbarLayout ||
      usesContentToggleLayout(navVersion))
  ) {
    return (
      <motion.div
        key="suibian-collapsed"
        initial={
          reduceSideNavMotion
            ? false
            : { opacity: 0.88 }
        }
        animate={{ opacity: 1 }}
        transition={{
          duration: reduceSideNavMotion ? 0 : SIDE_NAV_MOTION_DURATION,
          ease: 'easeOut',
        }}
        className="h-full shrink-0"
      >
        <SharedSideNav
          ariaLabel="随变侧栏"
          collapsed
          chrome={navVersion === 1 ? 'plain' : 'panel'}
          showDivider={navVersion !== 1}
          flushHeader={searchToolbarLayout}
          items={SUIBIAN_NAV_GROUPS.map((group) => ({ ...group }))}
          activeKey={null}
          onSelect={(key) => {
            if (key === 'tasks') setTasksOpen(true)
            if (key === 'roles') setRolesOpen(true)
            if (key === 'library') setLibraryOpen(true)
            if (key === 'worlds') setWorldsOpen(true)
            setSidebarCollapsed('suibian', false)
          }}
          header={
            searchToolbarLayout ? (
              <div className="px-[var(--sn-px)]">
                <SideNavSearchToolbar
                  value={navSearch}
                  onChange={setNavSearch}
                  onToggle={() => setSidebarCollapsed('suibian', false)}
                  placeholder="搜索"
                  ariaLabel="搜索随变内容"
                  collapsed
                />
              </div>
            ) : usesToolbarHeaderLayout(navVersion) ? (
              /* 收起态沿用同一条工具条（只留收起入口），位置与展开态一致 */
              <div className="px-[var(--sn-px)]">
                <UnifiedToolbar
                  collapsed
                  ariaLabel="随变工具条"
                  actions={SUIBIAN_SCHEME_TWO_TOOLBAR_ACTIONS}
                  onAction={() => setSidebarCollapsed('suibian', false)}
                />
              </div>
            ) : undefined
          }
          footer={
            navVersion === 3 ? (
              <div className="px-[var(--sn-px)] pb-3">
                <SideNavCollapseFooterButton
                  collapsed
                  onToggle={() => setSidebarCollapsed('suibian', false)}
                />
              </div>
            ) : undefined
          }
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      key="suibian-expanded"
      initial={
        reduceSideNavMotion
          ? false
          : { opacity: 0.88 }
      }
      animate={{ opacity: 1 }}
      transition={{
        duration: reduceSideNavMotion ? 0 : SIDE_NAV_MOTION_DURATION,
        ease: 'easeOut',
      }}
      data-side-nav-motion
      data-product="suibian"
      data-state={sidebarCollapsed ? 'collapsed' : 'expanded'}
      style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
      className="relative h-full shrink-0"
    >
      <motion.div
        data-side-nav-motion-layer
        initial={false}
        animate={{
          opacity: sidebarCollapsed ? 0 : 1,
        }}
        transition={{
          duration: reduceSideNavMotion ? 0 : SIDE_NAV_MOTION_DURATION,
          ease: 'easeOut',
        }}
        aria-hidden={sidebarCollapsed}
        inert={sidebarCollapsed}
        style={{
          width: sidebarWidth,
          pointerEvents: sidebarCollapsed ? 'none' : 'auto',
        }}
        className="absolute inset-y-0 left-0"
      >
        <aside
          aria-label="随变侧栏"
          data-side-nav-surface
          style={{
            background:
              navVersion === 1
                ? 'transparent'
                : workbenchHeaderLayout
                  ? '#f2f2f7'
                  : '#fbfbfc',
            borderRightStyle: 'solid',
            borderRightWidth:
              navVersion === 1 || workbenchHeaderLayout ? 0 : 0.5,
            borderRightColor:
              navVersion === 1
                ? 'rgba(0, 0, 0, 0.05)'
                : 'rgba(0, 0, 0, 0.04)',
            fontFamily: '"PingFang SC", system-ui, sans-serif',
          }}
          className="flex h-full w-full flex-col overflow-hidden"
        >
          {(schemeFourLayout || workbenchHeaderLayout) ? (
            <SideNavProductHeader
              leadingText="开启创作"
              /* 方案 8 收起入口统一在内容区左上角 */
              onToggle={
                usesContentToggleLayout(navVersion)
                  ? undefined
                  : () => setSidebarCollapsed('suibian', true)
              }
            />
          ) : usesProductHeaderLayout(navVersion) ? (
            <div
              className={`shrink-0 px-3 ${
                searchToolbarLayout ? '' : 'pt-3'
              }`}
            >
              {searchToolbarLayout ? (
                <SideNavSearchToolbar
                  value={navSearch}
                  onChange={setNavSearch}
                  onToggle={() => setSidebarCollapsed('suibian', true)}
                  placeholder="搜索"
                  ariaLabel="搜索随变内容"
                />
              ) : usesToolbarHeaderLayout(navVersion) ? (
                <UnifiedToolbar
                  ariaLabel="随变工具条"
                  actions={SUIBIAN_SCHEME_TWO_TOOLBAR_ACTIONS}
                  onAction={(action) => {
                    if (action === 'layout') {
                      setSidebarCollapsed('suibian', true)
                      return
                    }
                    toast(action === 'create' ? '新建任务（演示）' : '搜索随变内容（演示）')
                  }}
                />
              ) : (
                <SideNavProductHeader
                  icon="/icons/nav-products/suibian.svg"
                  productLabel="随变"
                  /* 方案 8 收起入口统一在内容区左上角 */
                  onToggle={
                    usesContentToggleLayout(navVersion)
                      ? undefined
                      : () => setSidebarCollapsed('suibian', true)
                  }
                />
              )}
            </div>
          ) : null}
          <div
            className={`thin-scroll-light flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-3 ${
              navVersion === 1 ? 'pt-0' : 'pt-3'
            }`}
          >
            {!hasSearchResults && normalizedNavSearch && (
              <div className="px-2 py-6 text-center">
                <p className="text-pretty text-[12px] text-[#252632]/45">未找到相关随变内容</p>
                <button
                  type="button"
                  onClick={() => setNavSearch('')}
                  className="mt-2 text-[12px] font-medium text-[#252632]/75 hover:text-[#252632]"
                >
                  清除搜索
                </button>
              </div>
            )}
            {visibleTasks.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <GroupHeader
                  icon={`${ICON}/nav-task.svg`}
                  label="任务"
                  searchable
                  creatable
                  collapsed={!tasksOpen}
                  onToggle={() => setTasksOpen((v) => !v)}
                />
                {tasksOpen &&
                  visibleTasks.map((task) => (
                    <TaskCell
                      key={task.id}
                      cell={task}
                      active={activeTask === task.id}
                      onClick={() => setActiveTask(task.id)}
                    />
                  ))}
              </div>
            )}

            {visibleTasks.length > 0 && visibleMyRoles.length > 0 && (
              <div className="h-px shrink-0 bg-black/[0.06]" />
            )}

            {visibleMyRoles.length > 0 && (
              <div className="flex flex-col gap-3">
                <GroupHeader
                  icon={`${ICON}/nav-my-role.svg`}
                  label="我的角色"
                  searchable
                  collapsed={!rolesOpen}
                  onToggle={() => setRolesOpen((v) => !v)}
                />
                {rolesOpen && (
                  <>
                    <RoleSegmentedControl value={roleSegment} onChange={setRoleSegment} />
                    <MyRoleGrid roles={visibleMyRoles} />
                  </>
                )}
              </div>
            )}

            {visibleMyRoles.length > 0 && visibleRoleLibrary.length > 0 && (
              <div className="h-px shrink-0 bg-black/[0.06]" />
            )}

            {visibleRoleLibrary.length > 0 && (
              <div className="flex flex-col gap-3">
                <GroupHeader
                  icon={`${ICON}/nav-role-library.svg`}
                  label="角色库"
                  tag="平台资产"
                  searchable
                  collapsed={!libraryOpen}
                  onToggle={() => setLibraryOpen((v) => !v)}
                />
                {libraryOpen && (
                  <div className="flex flex-col gap-1.5">
                    {visibleRoleLibrary.map((role) => (
                      <LibraryCell key={role.id} cell={role} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {visibleRoleLibrary.length > 0 && visibleWorldBooks.length > 0 && (
              <div className="h-px shrink-0 bg-black/[0.06]" />
            )}

            {visibleWorldBooks.length > 0 && (
              <div className="flex flex-col gap-1">
                <GroupHeader
                  icon={`${ICON}/nav-world.svg`}
                  label="世界书"
                  tag="平台资产"
                  collapsed={!worldsOpen}
                  onToggle={() => setWorldsOpen((v) => !v)}
                />
                {worldsOpen && (
                  <div className="flex flex-col">
                    {visibleWorldBooks.map((world, index) => (
                      <WorldCell
                        key={world.id}
                        cell={world}
                        showMore={index === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 方案 2 / 4 / 6 的操作在顶部；方案 3 / 5 使用底部文字版 / icon-only 入口。 */}
          {navVersion === 3 && (
            <div className="shrink-0 px-3 pb-3">
              <SideNavCollapseFooterButton
                onToggle={() => setSidebarCollapsed('suibian', true)}
              />
            </div>
          )}
          {navVersion === 5 && (
            <div className="shrink-0 px-4 pb-3">
              <SideNavIconFooterActions
                onToggle={() => setSidebarCollapsed('suibian', true)}
                onOpenProjectSettings={() => toast('项目设置（演示）')}
                className="-ml-1"
              />
            </div>
          )}
        </aside>
        <SideNavResizeHandle
          value={sidebarWidth}
          onChange={setSidebarWidth}
          ariaLabel="调整随变侧栏宽度"
        />
      </motion.div>
    </motion.div>
  )
}

export default function SuibianPage() {
  const [draft, setDraft] = useState('')
  const [zoom, setZoom] = useState(16)
  const [chatWidth, setChatWidth] = useState(380)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const navVersion = useNavVersion((state) => state.version)
  const sidebarCollapsed = useProductSideNav(
    (state) => state.collapsed.suibian,
  )
  const setSidebarCollapsed = useProductSideNav((state) => state.setCollapsed)

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
      <section
        className="relative flex h-full shrink-0 flex-col overflow-hidden bg-[#f0f0f1]"
        style={{ width: chatWidth }}
      >
        {/* 内容区收起方案：入口钉在内容区左上角，正压在这一行上。
            该方案下各产品 Header 统一 40 高、左内距 48，入口和标题
            在所有产品里都落在同一条水平线上。 */}
        <div
          className={`flex shrink-0 items-center justify-between pr-4 ${
            usesContentToggleLayout(navVersion) ? 'h-10 pl-12' : 'h-14 pl-4'
          }`}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {sidebarCollapsed &&
              navVersion !== 1 &&
              !usesToolbarHeaderLayout(navVersion) &&
              navVersion !== 3 &&
              navVersion !== 6 &&
              !usesContentToggleLayout(navVersion) && (
              <button
                type="button"
                title="展开导航"
                aria-label="展开导航"
                onClick={() => setSidebarCollapsed('suibian', false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#252632]/55 transition-colors hover:bg-black/[0.04] hover:text-[#252632]/80"
              >
                <SideNavPanelStateIcon collapsed />
              </button>
            )}
            <h2 className="truncate text-[15px] font-medium text-[#161823]">阿米嘎朵喵喵</h2>
          </div>
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

        {/* 输入框（设计稿 244-13616）— 统一 ChatComposer（114px） */}
        <div className="shrink-0 px-3 pb-3 pt-2">
          <ChatComposer
            textareaRef={composerRef}
            value={draft}
            onChange={setDraft}
            onSend={send}
            placeholder="输入你的创作想法"
            ariaLabel="输入你的创作想法"
            skinClassName="rounded-[18px] border-[0.5px] border-black/[0.08] bg-white"
            inputClassName="text-[12px] leading-[20px] text-[#161823] placeholder:text-[rgba(22,24,35,0.34)]"
            sendButtonClassName="size-6 bg-[#fce918] text-[#161823]"
            footerLeft={
              <>
                <ComposerLocalFileButton
                  className="flex h-6 shrink-0 items-center justify-center rounded-[7.5px] bg-[#f3f3f4] px-[5px] transition-colors hover:bg-[#ebebec]"
                />
                {[
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
              </>
            }
          />
        </div>
        <PanelResizeHandle
          value={chatWidth}
          onChange={setChatWidth}
          edge="right"
          ariaLabel="调整随变对话区域宽度"
        />
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
