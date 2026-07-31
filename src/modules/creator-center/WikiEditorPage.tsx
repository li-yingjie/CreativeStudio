import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import ChatComposer from '@/shared/components/ChatComposer'
import ComposerLocalFileButton from '@/shared/components/ComposerLocalFileButton'
import SharedSideNav, {
  SIDE_NAV_MOTION_DURATION,
  SIDE_NAV_MOTION_OFFSET,
} from '@/shared/components/SideNav'
import SideNavPanelStateIcon from '@/shared/components/SideNavPanelStateIcon'
import SideNavIconFooterActions, {
  SideNavCollapseFooterButton,
} from '@/shared/components/SideNavIconFooterActions'
import SideNavProductHeader from '@/shared/components/SideNavProductHeader'
import SideNavResizeHandle from '@/shared/components/SideNavResizeHandle'
import SideNavSearchToolbar from '@/shared/components/SideNavSearchToolbar'
import {
  useNavVersion,
  usesProductHeaderLayout,
  usesSchemeFourLayout,
  usesSearchToolbarLayout,
} from '@/shared/storage/nav-version'
import { useResizableSideNavWidth } from '@/shared/hooks/useResizableSideNavWidth'
import { Disclosure, DISCLOSURE_INDENT } from '@/modules/vibecoding/components/FileTreeView'
import FigmaGlyph from './FigmaGlyph'
import WikiObjectSwitcher from './WikiObjectSwitcher'
import {
  DEFAULT_WIKI_OBJECT_ID,
  getWikiObject,
} from './wiki-object-data'
import UnifiedToolbar from './UnifiedToolbar'

/* ─── 世界书编辑页（设计稿 统一导航 259-32672「03-百科-编辑」） ───
 * 三栏：左侧世界书目录树 + 中间文档编辑区 + 右侧世界书智能体对话。
 * 演示页：文档内容为设计稿示例文案，对话为空态 + 快捷开始。 */

/** 设计稿标题用宋体（方正研宋），未装机器回退到系统宋体。 */
const SERIF = { fontFamily: '"FZYanSongS-DB-GB", "Source Han Serif CN", "Songti SC", serif' }

const ICON = '/icons/wiki-editor'
const WIKI_SCHEME_TWO_TOOLBAR_ACTIONS = [
  'layout',
  'products',
  'search',
  'tasks',
] as const

/** 目录树节点：一级分组（可含子节点）。 */
interface NavGroup {
  key: string
  label: string
  icon: string
  /** 图标在 16px 框内的 inset（取自设计稿）。 */
  inset: string
  children: string[]
}

const NAV_GROUPS: NavGroup[] = [
  { key: '世界设定', label: '世界设定', icon: `${ICON}/nav-world.svg`, inset: '8.33%', children: ['未命名设定'] },
  { key: '剧情事件', label: '剧情事件', icon: `${ICON}/nav-plot.svg`, inset: '6.25% 10.42% 12.5% 10.42%', children: ['未命名剧情'] },
  { key: '角色档案', label: '角色档案', icon: `${ICON}/nav-role.svg`, inset: '8.33% 6.95% 6.93% 8.33%', children: ['未命名角色'] },
]

const QUICK_STARTS = [
  '🌱 只有零散想法、设定碎片，需要一步步完善成型',
  '🎬 基于我自己的抖音视频，逐步补充完善设定',
  '📚 我已有成熟 IP 内容，帮我提炼成完整世界观',
]

/** 文档正文 — 设计稿示例（《西游记》规则秩序）。 */
const DOC_SECTIONS = [
  {
    heading: '规则秩序',
    blocks: [
      { label: '定义描述：' },
      { text: '用于说明该世界的基本运行规则，包括世界如何形成、力量从何而来、角色如何成长，以及不同能力之间如何相互制衡。是整个世界观所有设定、剧情、角色能力的底层运行依据。' },
      { label: '示例：' },
      { text: '《西游记》的世界由天、地、人、幽冥等多重空间共同构成，秩序核心是以玉皇大帝统摄的天庭体系、以如来佛祖为代表的佛门体系，以及人间王朝、山川洞府、龙宫地府等地方性势力共同运转。凡人、神仙、妖怪、龙族、鬼魂都处在同一套因果与修行规则中，身份不同，受到的约束也不同。' },
      { text: '力量来源主要分为三类：一是天生根器，如孙悟空由仙石孕育，天赋异禀；二是后天修行，如拜师学艺、炼丹服药、参禅悟道；三是法宝与职位赋能，如金箍棒、芭蕉扇、紧箍咒、天庭官职等。能力并非完全按战力大小决定胜负，法宝克制、师承门路、天庭佛门授权、因果命数都会影响结果。' },
      { text: '修行与秩序存在明确边界：妖怪可以通过修炼获得神通，但若食人、作乱、阻碍取经，通常会被收伏或惩戒；神仙也不是绝对自由，天庭官职、佛门戒律和因果安排会限制行动。取经主线本质上是一次以"九九八十一难"为框架的功德考验，角色能否成长，不只看法力，也看能否守住使命、克服欲望与执念。' },
    ],
  },
]


/** 目录行 —— 一级分组与子条目共用的排版。 */
function NavRow({
  label,
  icon,
  inset,
  size = 16,
  active,
  depth = 0,
  expandable,
  expanded,
  onToggle,
  onClick,
  schemeFour = false,
}: {
  label: string
  icon: string
  inset: string
  size?: number
  active?: boolean
  depth?: number
  expandable?: boolean
  expanded?: boolean
  onToggle?: () => void
  onClick?: () => void
  schemeFour?: boolean
}) {
  return (
    <div
      className={`group flex w-full items-center rounded-lg transition-colors ${
        schemeFour ? 'h-9 gap-1.5 pr-2' : 'min-h-[28px] gap-1 pr-2'
      } ${
        active
          ? 'bg-[var(--sidenav-active,rgba(83,96,143,0.12))]'
          : 'hover:bg-[var(--sidenav-hover,rgba(0,0,0,0.03))]'
      }`}
      style={{
        paddingLeft: schemeFour
          ? 8 + depth * 22
          : 4 + depth * DISCLOSURE_INDENT,
      }}
    >
      {!schemeFour && (
        <Disclosure
          expanded={expanded ?? false}
          visible={expandable ?? false}
          label={label}
          onToggle={onToggle ?? (() => {})}
        />
      )}
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        aria-expanded={schemeFour && expandable ? expanded : undefined}
        onClick={onClick}
        className={`flex min-w-0 flex-1 items-center text-left ${
          schemeFour ? 'h-full gap-1.5' : 'gap-1'
        } ${
          active
            ? 'text-[var(--sidenav-ink,#1c1f23)]'
            : 'text-[var(--sidenav-ink-dim,rgba(28,31,35,0.8))] group-hover:text-[var(--sidenav-ink-hover,#1c1f23)]'
        }`}
      >
        <FigmaGlyph src={icon} inset={inset} size={size} />
        <span className="min-w-0 flex-1 truncate text-[13px] leading-[18px]">
          {label}
        </span>
      </button>
    </div>
  )
}

/** 顶部工具栏的圆角灰底按钮。 */
function ToolButton({
  icon,
  inset,
  label,
  className = '',
  onClick,
}: {
  icon: string
  inset: string
  label: string
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 items-center justify-center px-2 text-[#17171f] transition-colors hover:bg-black/[0.08] ${className}`}
    >
      <FigmaGlyph src={icon} inset={inset} />
    </button>
  )
}

function WikiSchemeFourHeader({
  activeObjectId,
  onSelectObject,
  onCollapse,
}: {
  activeObjectId: string
  onSelectObject: (id: string) => void
  onCollapse: () => void
}) {
  return (
    <div className="flex h-10 items-center justify-between px-4">
      <WikiObjectSwitcher
        activeId={activeObjectId}
        onChange={onSelectObject}
        compact
      />
      <button
        type="button"
        title="文件"
        aria-label="文件"
        onClick={() => toast('文件入口（演示）')}
        className="flex size-6 items-center justify-center rounded-md hover:bg-black/[0.04]"
      >
        <img
          src={`${ICON}/scheme4-files.svg`}
          alt=""
          aria-hidden
          className="size-4"
        />
      </button>
      <button
        type="button"
        title="收起导航"
        aria-label="收起导航"
        onClick={onCollapse}
        className="flex size-6 items-center justify-center rounded-md hover:bg-black/[0.04]"
      >
        <SideNavPanelStateIcon />
      </button>
    </div>
  )
}

/** 方案 1 / 4 / 6 的百科底部上下文操作。 */
function WikiContextFooter() {
  return (
    <div className="pb-3">
      <button
        type="button"
        onClick={() => toast('我的词条（演示）')}
        className="flex h-8 w-full items-center gap-1.5 rounded-lg pl-[22px] pr-2 text-[12px] font-medium text-[#252632]/80 hover:bg-black/[0.03]"
      >
        <img
          src={`${ICON}/scheme4-inbox.svg`}
          alt=""
          aria-hidden
          className="size-4 shrink-0"
        />
        <span>
          我的词条 <span className="tabular-nums">23</span>
        </span>
      </button>
    </div>
  )
}

/** 世界书目录侧栏 —— 外壳复用统一 SideNav（底色 / 分隔线 / 配色变量），
 *  内部保留世界书的多分组目录树与拖拽宽度交互。 */
export function WikiSideNav({
  activeDoc,
  activeObjectId,
  collapsed = false,
  homeActive = false,
  onPickDoc,
  onBackHome,
  onCollapse,
  onSelectObject,
}: {
  activeDoc: string
  activeObjectId?: string
  collapsed?: boolean
  homeActive?: boolean
  onPickDoc: (doc: string) => void
  onBackHome?: () => void
  onCollapse?: () => void
  onSelectObject?: (id: string) => void
}) {
  // 目录分组默认全展开（新建的世界书内容少，一眼看全）
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(NAV_GROUPS.map((g) => g.key)))
  const [localObjectId, setLocalObjectId] = useState(DEFAULT_WIKI_OBJECT_ID)
  const [navSearch, setNavSearch] = useState('')
  const navVersion = useNavVersion((state) => state.version)
  const schemeFourLayout = usesSchemeFourLayout(navVersion)
  const searchToolbarLayout = usesSearchToolbarLayout(navVersion)
  const reduceSideNavMotion = useReducedMotion() ?? false
  const resolvedObjectId = getWikiObject(activeObjectId ?? localObjectId).id
  const normalizedNavSearch = searchToolbarLayout
    ? navSearch.trim().toLocaleLowerCase('zh-CN')
    : ''
  const visibleNavGroups = normalizedNavSearch
    ? NAV_GROUPS
        .map((group) => ({
          ...group,
          children: group.label.toLocaleLowerCase('zh-CN').includes(normalizedNavSearch)
            ? group.children
            : group.children.filter((child) =>
                child.toLocaleLowerCase('zh-CN').includes(normalizedNavSearch),
              ),
        }))
        .filter(
          (group) =>
            group.label.toLocaleLowerCase('zh-CN').includes(normalizedNavSearch) ||
            group.children.length > 0,
        )
    : NAV_GROUPS
  const relationVisible =
    !normalizedNavSearch ||
    '关系网'.toLocaleLowerCase('zh-CN').includes(normalizedNavSearch)

  const { width: sidebarWidth, setWidth: setSidebarWidth } = useResizableSideNavWidth()

  const toggleGroup = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (!next.delete(key)) next.add(key)
      return next
    })

  const selectObject = (id: string) => {
    if (onSelectObject) onSelectObject(id)
    else {
      setLocalObjectId(id)
      onPickDoc(NAV_GROUPS[0].children[0])
    }
  }

  if (
    collapsed &&
    (navVersion === 2 || navVersion === 3 || searchToolbarLayout)
  ) {
    return (
      <SharedSideNav
        ariaLabel="百科目录"
        collapsed
        flushHeader={searchToolbarLayout}
        items={[
          ...NAV_GROUPS.map((group) => ({
            key: group.key,
            label: group.label,
            icon: group.icon,
          })),
          {
            key: '关系网',
            label: '关系网',
            icon: `${ICON}/nav-relation.svg`,
          },
        ]}
        activeKey={null}
        onSelect={() => onCollapse?.()}
        header={
          searchToolbarLayout ? (
            <div className="px-[var(--sn-px)]">
              <SideNavSearchToolbar
                value={navSearch}
                onChange={setNavSearch}
                onToggle={onCollapse ?? (() => {})}
                placeholder="搜索"
                ariaLabel="搜索百科内容"
                collapsed
              />
            </div>
          ) : navVersion === 2 ? (
            <div className="px-[var(--sn-px)]">
              <SideNavProductHeader
                icon="/icons/nav-products/wiki.svg"
                productLabel="百科"
                bottomGap={0}
                collapsed
                onToggle={() => onCollapse?.()}
              />
            </div>
          ) : undefined
        }
        footer={
          navVersion === 3 ? (
            <div className="px-[var(--sn-px)] pb-3">
              <SideNavCollapseFooterButton
                collapsed
                onToggle={() => onCollapse?.()}
              />
            </div>
          ) : undefined
        }
      />
    )
  }

  return (
    <div
      data-side-nav-motion
      data-product="wiki"
      data-state={collapsed ? 'collapsed' : 'expanded'}
      style={{ width: collapsed ? 0 : sidebarWidth }}
      className="relative h-full shrink-0"
    >
      <motion.div
        data-side-nav-motion-layer
        initial={false}
        animate={{
          x: collapsed && !reduceSideNavMotion ? -SIDE_NAV_MOTION_OFFSET : 0,
          opacity: collapsed ? 0 : 1,
        }}
        transition={{
          duration: reduceSideNavMotion ? 0 : SIDE_NAV_MOTION_DURATION,
          ease: 'easeOut',
        }}
        aria-hidden={collapsed}
        inert={collapsed}
        style={{
          width: sidebarWidth,
          pointerEvents: collapsed ? 'none' : 'auto',
        }}
        className="absolute inset-y-0 left-0"
      >
        <SideNavResizeHandle
          value={sidebarWidth}
          onChange={setSidebarWidth}
          ariaLabel="调整百科目录宽度"
        />
        <SharedSideNav
        ariaLabel="百科目录"
        layout="fill"
        chrome={navVersion === 1 ? 'plain' : 'panel'}
        showDivider={navVersion !== 1}
        flushHeader={schemeFourLayout || searchToolbarLayout || navVersion === 1}
        items={[]}
        activeKey={null}
        onSelect={() => {}}
        header={
          schemeFourLayout ? (
            <WikiSchemeFourHeader
              activeObjectId={resolvedObjectId}
              onSelectObject={selectObject}
              onCollapse={onCollapse ?? (() => {})}
            />
          ) : (
            <div className="px-[var(--sn-px)] pb-2">
              {usesProductHeaderLayout(navVersion) && (
                searchToolbarLayout ? (
                  <SideNavSearchToolbar
                    value={navSearch}
                    onChange={setNavSearch}
                    onToggle={onCollapse ?? (() => {})}
                    placeholder="搜索"
                    ariaLabel="搜索百科内容"
                  />
                ) : navVersion === 2 ? (
                  <UnifiedToolbar
                    ariaLabel="百科工具条"
                    actions={WIKI_SCHEME_TWO_TOOLBAR_ACTIONS}
                    onAction={(action) => {
                      if (action === 'layout') {
                        onCollapse?.()
                        return
                      }
                      if (action === 'products' && onBackHome) {
                        onBackHome()
                        return
                      }
                      if (action === 'products') {
                        toast('产品入口待配置')
                        return
                      }
                      toast(action === 'search' ? '搜索百科内容（演示）' : '任务入口待配置')
                    }}
                  />
                ) : (
                  <SideNavProductHeader
                    icon="/icons/nav-products/wiki.svg"
                    productLabel="百科"
                    onLogoClick={onBackHome}
                    bottomGap={0}
                    onToggle={onCollapse ?? (() => {})}
                  />
                )
              )}
              <WikiObjectSwitcher
                activeId={resolvedObjectId}
                onChange={selectObject}
              />
            </div>
          )
        }
        footer={
          navVersion === 3 ? (
            <div className="px-[var(--sn-px)] pb-3">
              <SideNavCollapseFooterButton onToggle={onCollapse ?? (() => {})} />
            </div>
          ) : navVersion === 1 || searchToolbarLayout || schemeFourLayout ? (
            <WikiContextFooter />
          ) : navVersion === 5 ? (
            <div className="px-[var(--sn-px)] pb-3">
              <SideNavIconFooterActions
                onToggle={onCollapse ?? (() => {})}
                onOpenMyEntries={() => toast('我的词条 23（演示）')}
                onOpenProjectSettings={() => toast('项目设置（演示）')}
              />
            </div>
          ) : undefined
        }
        >
        <nav aria-label="百科目录菜单" className="flex flex-col gap-0.5 px-[var(--sn-px)] pb-3">
          {/* 方案 4 固定保留主页入口；其他方案延续原有条件。 */}
          {(onBackHome || schemeFourLayout) && (
            <NavRow
              label="主页"
              icon={`${ICON}/nav-home.svg`}
              inset="5.5% 16.7% 11.1% 8.3%"
              active={homeActive}
              onClick={onBackHome ?? (() => toast('百科主页（演示）'))}
              schemeFour={schemeFourLayout}
            />
          )}
          {visibleNavGroups.map((g) => {
            const open = expanded.has(g.key)
            return (
              <div key={g.key} className="flex flex-col gap-0.5">
                <NavRow
                  label={g.label}
                  icon={g.icon}
                  inset={g.inset}
                  expandable
                  expanded={open}
                  onToggle={() => toggleGroup(g.key)}
                  onClick={() => toggleGroup(g.key)}
                  schemeFour={schemeFourLayout}
                />
                {open &&
                  g.children.map((c) => {
                    const displayLabel =
                      schemeFourLayout && g.key === '剧情事件'
                        ? '未命名设定'
                        : c
                    return (
                      <NavRow
                        key={c}
                        label={displayLabel}
                        icon={`${ICON}/doc-leaf.svg`}
                        inset="6.44% 12.7% 6.5% 12.7%"
                        depth={1}
                        active={activeDoc === c}
                        onClick={() => onPickDoc(c)}
                        schemeFour={schemeFourLayout}
                      />
                    )
                  })}
              </div>
            )
          })}
          {relationVisible && (
            <NavRow
              label="关系网"
              icon={`${ICON}/nav-relation.svg`}
              inset="0"
              size={20}
              onClick={() => toast('关系网（演示）')}
              schemeFour={schemeFourLayout}
            />
          )}
          {visibleNavGroups.length === 0 && !relationVisible && (
            <div className="px-2 py-6 text-center">
              <p className="text-pretty text-[12px] text-[#252632]/45">未找到相关百科内容</p>
              <button
                type="button"
                onClick={() => setNavSearch('')}
                className="mt-2 text-[12px] font-medium text-[#252632]/75 hover:text-[#252632]"
              >
                清除搜索
              </button>
            </div>
          )}
        </nav>
        </SharedSideNav>
      </motion.div>
    </div>
  )
}

export default function WikiEditorPage({
  activeDoc,
  activeObjectTitle = '灵笼',
  sidebarCollapsed = false,
  onExpandSidebar,
}: {
  activeDoc: string
  activeObjectTitle?: string
  sidebarCollapsed?: boolean
  onExpandSidebar?: () => void
}) {
  const [draft, setDraft] = useState('')
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const navVersion = useNavVersion((state) => state.version)

  const send = () => {
    if (!draft.trim()) return
    toast('世界书智能体正在接入中（演示）')
    setDraft('')
  }

  /** 快捷开始：填入输入框并聚焦，交给用户确认后再发送。 */
  const pickQuickStart = (text: string) => {
    setDraft(text)
    composerRef.current?.focus()
  }

  return (
    <div className="flex h-full bg-white">
      {/* ── 中：文档编辑区 ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 items-center justify-between px-3">
          <div className="flex items-center gap-1">
            {sidebarCollapsed &&
              navVersion !== 1 &&
              navVersion !== 2 &&
              navVersion !== 3 &&
              navVersion !== 6 && (
              <button
                type="button"
                title="展开导航"
                aria-label="展开导航"
                onClick={onExpandSidebar}
                className="flex size-8 items-center justify-center rounded text-[rgba(37,38,50,0.6)] transition-colors hover:bg-black/[0.04] hover:text-[#17171f]"
              >
                <SideNavPanelStateIcon collapsed />
              </button>
            )}
            {/* 当前文档页签 */}
            <div className="flex h-8 items-center gap-1 rounded-[30px] bg-black/[0.04] px-2.5">
              <FigmaGlyph src={`${ICON}/tab-doc.svg`} inset="6.4% 15.5% 5.6% 12.7%" size={18} />
              <span className="text-[13px] font-medium leading-[18px] text-[#17171f]">{activeDoc}</span>
            </div>
            <button
              type="button"
              title="新建文档"
              aria-label="新建文档"
              onClick={() => toast('新建文档（演示）')}
              className="flex size-8 items-center justify-center rounded p-1 text-[#17171f] transition-colors hover:bg-black/[0.04]"
            >
              <FigmaGlyph src={`${ICON}/add.svg`} inset="11.67%" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex items-center overflow-hidden rounded-[15px] bg-black/[0.04]">
                <ToolButton icon={`${ICON}/undo.svg`} inset="14.53% 10.09% 18.24% 14.98%" label="撤销" />
                <ToolButton icon={`${ICON}/undo.svg`} inset="14.52% 10.6% 18.24% 14.47%" label="重做" className="[&>span]:-scale-x-100" />
              </div>
              <ToolButton icon={`${ICON}/history.svg`} inset="8.33%" label="历史版本" className="rounded-[28px] bg-black/[0.04]" />
            </div>
            <button
              type="button"
              onClick={() => toast('发布（演示）')}
              title="发布"
              className="flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-[var(--color-ink)] px-2.5 text-[12px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
            >
              发布
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <div className="mx-auto w-full max-w-[720px] pb-20">
            {/* 文档头 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 pt-8">
                <h1 className="text-[32px] leading-normal text-[#17171f]" style={SERIF}>{activeDoc}</h1>
                <p className="text-[14px] leading-[1.6] text-[rgba(37,38,50,0.6)]">
                  具体来源：<span className="text-[rgba(37,38,50,0.35)]">{activeObjectTitle}设定资料</span>
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="py-1 pr-2 text-[14px] text-[rgba(37,38,50,0.6)]">世界设定</span>
                  <button
                    type="button"
                    onClick={() => toast('移动到其他分组（演示）')}
                    className="flex h-8 items-center gap-1 rounded-lg px-2 text-[14px] text-[rgba(37,38,50,0.8)] transition-colors hover:bg-black/[0.04]"
                  >
                    <FigmaGlyph src={`${ICON}/move.svg`} inset="8.33% 2.92% 8.34% 8.33%" />
                    移动
                  </button>
                </div>
                <div className="pt-5">
                  <div className="h-[0.5px] w-full bg-[#e9e9eb]" />
                </div>
              </div>
            </div>

            {/* 正文 */}
            <div className="pt-7">
              <div className="flex items-center gap-0.5">
                <img src={`${ICON}/quote.png`} alt="" aria-hidden className="size-6 shrink-0 select-none" />
                <p className="flex-1 py-2 text-[16px] leading-[1.75] text-[#17171f]">
                  欢迎开启创世之旅，可以通过右侧对话框创建世界书、构筑新的故事版图，本文下述为参考示例
                </p>
              </div>

              {DOC_SECTIONS.map((s) => (
                <section key={s.heading}>
                  <h2 className="pb-2 pt-6 text-[26px] leading-normal text-[#17171f]" style={SERIF}>{s.heading}</h2>
                  {s.blocks.map((b, i) => (
                    <p
                      key={i}
                      className={`py-1.5 text-[16px] leading-[1.75] ${
                        b.label ? 'text-[#17171f]/85' : 'text-[rgba(37,38,50,0.6)]'
                      }`}
                    >
                      {b.label ?? b.text}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 右：世界书智能体 — 通栏贴边（无外边距），白底 + 左分隔线 ── */}
      <div className="flex shrink-0">
        <div className="flex h-full w-[366px] flex-col overflow-hidden border-l border-[#e9e9eb] bg-white">
          <div className="flex h-10 shrink-0 items-center justify-between pl-4 pr-2">
            <span className="text-[14px] font-semibold text-black">对话</span>
            <div className="flex items-center gap-3">
              {[
                { icon: 'chat-add', label: '新建对话', inset: '4.33% 4.17% 8.17% 8.33%' },
                { icon: 'chat-clock', label: '历史对话', inset: '8.33%' },
                { icon: 'chat-panel', label: '收起面板', inset: '12.5% 16.67% 16.67% 16.67%' },
              ].map((b) => (
                <button
                  key={b.icon}
                  type="button"
                  title={b.label}
                  aria-label={b.label}
                  onClick={() => toast(`${b.label}（演示）`)}
                  className="flex size-8 items-center justify-center rounded-lg text-black transition-colors hover:bg-black/[0.04]"
                >
                  {b.icon === 'chat-panel' ? (
                    <SideNavPanelStateIcon side="right" />
                  ) : (
                    <FigmaGlyph src={`${ICON}/${b.icon}.svg`} inset={b.inset} size={20} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 空态 + 快捷开始 */}
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 overflow-y-auto px-[39px] text-center">
            <div className="flex flex-col items-center gap-3">
              <h2 className="w-full text-center text-[24px] leading-normal text-black" style={SERIF}>
                嗨～开始完善{activeObjectTitle}吧
              </h2>
              <p className="w-full text-center text-[14px] leading-[1.75] text-[rgba(37,38,50,0.6)]">
                手里有完整稿子可以直接丢给我梳理，没成型也能慢慢一起攒设定，看你现在是哪种情况：
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-center text-[12px] font-medium text-[rgba(37,38,50,0.6)]">快速开始</span>
              <div className="flex flex-col gap-3">
                {QUICK_STARTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => pickQuickStart(q)}
                    className="flex h-11 items-center justify-center rounded-[38px] border border-[#e9e9eb] bg-[#fafafa] px-4 text-center text-[13px] font-medium text-black transition-colors hover:bg-white"
                  >
                    <span className="min-w-0 flex-1 truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 输入框 — 统一 ChatComposer（114px） */}
          <ChatComposer
            textareaRef={composerRef}
            value={draft}
            onChange={setDraft}
            onSend={send}
            placeholder="请输入你的想法"
            ariaLabel="输入你的想法"
            className="m-[15px] shrink-0"
            skinClassName="rounded-3xl border-[0.5px] border-black/[0.12] bg-white shadow-[0_8px_8px_rgba(12,17,31,0.08)]"
            inputClassName="px-1 pt-0.5 text-[14px] leading-[22px] text-[#17171f] placeholder:text-[rgba(37,38,50,0.35)]"
            footerLeft={
              <>
                <ComposerLocalFileButton className="flex size-6 shrink-0 items-center justify-center rounded-full text-[rgba(37,38,50,0.8)] transition-colors hover:bg-black/[0.04]" />
                {[
                  { icon: 'conflict', label: '冲突检测', inset: '4.9% 14.3% 11.8% 7.3%' },
                  { icon: 'extract', label: '素材提炼', inset: '2.4% 14.6% 10% 7.3%' },
                ].map((b) => (
                  <button
                    key={b.icon}
                    type="button"
                    onClick={() => toast(`${b.label}（演示）`)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold leading-4 text-[rgba(37,38,50,0.8)] transition-colors hover:bg-black/[0.04]"
                  >
                    <FigmaGlyph src={`${ICON}/${b.icon}.svg`} inset={b.inset} size={14} />
                    {b.label}
                  </button>
                ))}
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}
