import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { toast } from 'sonner'
import { ArrowUp, Plus } from '@/shared/icons'
import SharedSideNav from '@/shared/components/SideNav'
import {
  SIDE_NAV_NUMERIC_CONSTRAINTS,
  useSideNavConfig,
} from '@/shared/components/side-nav-config'
import { Disclosure, DISCLOSURE_INDENT } from '@/modules/vibecoding/components/FileTreeView'
import FigmaGlyph from './FigmaGlyph'

/* ─── 世界书编辑页（设计稿 统一导航 259-32672「03-百科-编辑」） ───
 * 三栏：左侧世界书目录树 + 中间文档编辑区 + 右侧世界书智能体对话。
 * 演示页：文档内容为设计稿示例文案，对话为空态 + 快捷开始。 */

/** 设计稿标题用宋体（方正研宋），未装机器回退到系统宋体。 */
const SERIF = { fontFamily: '"FZYanSongS-DB-GB", "Source Han Serif CN", "Songti SC", serif' }

const ICON = '/icons/wiki-editor'

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
}) {
  return (
    <div
      className={`group flex min-h-[28px] w-full items-center gap-1 rounded-lg pr-2 transition-colors ${
        active
          ? 'bg-[var(--sidenav-active,rgba(83,96,143,0.12))]'
          : 'hover:bg-[var(--sidenav-hover,rgba(0,0,0,0.03))]'
      }`}
      style={{ paddingLeft: 4 + depth * DISCLOSURE_INDENT }}
    >
      <Disclosure
        expanded={expanded ?? false}
        visible={expandable ?? false}
        label={label}
        onToggle={onToggle ?? (() => {})}
      />
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={onClick}
        className={`flex min-w-0 flex-1 items-center gap-1 text-left ${
          active
            ? 'text-[var(--sidenav-ink,#1c1f23)]'
            : 'text-[var(--sidenav-ink-dim,rgba(28,31,35,0.8))] group-hover:text-[var(--sidenav-ink-hover,#1c1f23)]'
        }`}
      >
        <FigmaGlyph src={icon} inset={inset} size={size} />
        <span className="min-w-0 flex-1 truncate text-[13px]">{label}</span>
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

/** 世界书目录侧栏 —— 外壳复用统一 SideNav（底色 / 分隔线 / 配色变量），
 *  内部保留世界书的多分组目录树与拖拽宽度交互。 */
export function WikiSideNav({
  activeDoc,
  onPickDoc,
  onBackHome,
  onCollapse,
}: {
  activeDoc: string
  onPickDoc: (doc: string) => void
  onBackHome?: () => void
  onCollapse?: () => void
}) {
  // 目录分组默认全展开（新建的世界书内容少，一眼看全）
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(NAV_GROUPS.map((g) => g.key)))

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

  const toggleGroup = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (!next.delete(key)) next.add(key)
      return next
    })

  return (
    <div style={{ width: sidebarWidth }} className="relative h-full shrink-0">
      {/* 右边缘拖拽把手 — 与 AI 工坊 / 随变同一套交互 */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="拖拽调整目录宽度"
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
      <SharedSideNav
        ariaLabel="世界书目录"
        layout="fill"
        items={[]}
        activeKey={null}
        onSelect={() => {}}
        header={
          <div className="px-[var(--sn-px)] pb-2">
            <div className="flex h-8 items-center gap-1.5 py-1.5">
              <button
                type="button"
                title="收起目录"
                aria-label="收起目录"
                onClick={onCollapse}
                className="flex items-center text-[var(--sidenav-ink-dim,rgba(28,31,35,0.8))] transition-colors hover:text-[var(--sidenav-ink,#1c1f23)]"
              >
                <FigmaGlyph src={`${ICON}/collapse.svg`} inset="10% 10% 10% 11.5%" />
              </button>
              <span className="truncate text-[13px] font-medium text-[var(--sidenav-ink-dim,rgba(28,31,35,0.8))]">
                世界书目录
              </span>
            </div>
          </div>
        }
      >
        <nav aria-label="世界书目录菜单" className="flex flex-col gap-0.5 px-[var(--sn-px)] pb-3">
          <NavRow
            label="主页"
            icon={`${ICON}/nav-home.svg`}
            inset="5.5% 16.7% 11.1% 8.3%"
            onClick={onBackHome}
          />
          {NAV_GROUPS.map((g) => {
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
                />
                {open &&
                  g.children.map((c) => (
                    <NavRow
                      key={c}
                      label={c}
                      icon={`${ICON}/doc-leaf.svg`}
                      inset="6.44% 12.7% 6.5% 12.7%"
                      depth={1}
                      active={activeDoc === c}
                      onClick={() => onPickDoc(c)}
                    />
                  ))}
              </div>
            )
          })}
          <NavRow
            label="关系网"
            icon={`${ICON}/nav-relation.svg`}
            inset="0"
            size={20}
            onClick={() => toast('关系网（演示）')}
          />
        </nav>
      </SharedSideNav>
    </div>
  )
}

export default function WikiEditorPage({ onBackHome }: { onBackHome: () => void }) {
  const [activeDoc, setActiveDoc] = useState('未命名设定')
  const [collapsed, setCollapsed] = useState(false)
  const [draft, setDraft] = useState('')
  const composerRef = useRef<HTMLTextAreaElement>(null)

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
      {/* ── 左：世界书目录 ── */}
      {!collapsed && (
        <WikiSideNav
          activeDoc={activeDoc}
          onPickDoc={setActiveDoc}
          onBackHome={onBackHome}
          onCollapse={() => setCollapsed(true)}
        />
      )}

      {/* ── 中：文档编辑区 ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[60px] shrink-0 items-center justify-between p-3">
          <div className="flex items-center gap-1">
            {collapsed && (
              <button
                type="button"
                title="展开目录"
                aria-label="展开目录"
                onClick={() => setCollapsed(false)}
                className="flex size-8 items-center justify-center rounded text-[rgba(37,38,50,0.6)] transition-colors hover:bg-black/[0.04] hover:text-[#17171f]"
              >
                <FigmaGlyph src={`${ICON}/collapse.svg`} inset="10% 10% 10% 11.5%" className="rotate-180" />
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

          <div className="flex items-center gap-3 opacity-50">
            <div className="flex items-center overflow-hidden rounded-[15px] bg-black/[0.04]">
              <ToolButton icon={`${ICON}/undo.svg`} inset="14.53% 10.09% 18.24% 14.98%" label="撤销" />
              <ToolButton icon={`${ICON}/undo.svg`} inset="14.52% 10.6% 18.24% 14.47%" label="重做" className="[&>span]:-scale-x-100" />
            </div>
            <ToolButton icon={`${ICON}/history.svg`} inset="8.33%" label="历史版本" className="rounded-[28px] bg-black/[0.04]" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <div className="mx-auto w-full max-w-[720px] pb-20">
            {/* 文档头 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 pt-8">
                <h1 className="text-[32px] leading-normal text-[#17171f]" style={SERIF}>{activeDoc}</h1>
                <p className="text-[14px] leading-[1.6] text-[rgba(37,38,50,0.6)]">
                  具体来源：<span className="text-[rgba(37,38,50,0.35)]">未命名版权方资料</span>
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

      {/* ── 右：世界书智能体 ── */}
      <div className="flex shrink-0 items-center py-3 pr-3">
        <div className="flex h-full w-[366px] flex-col overflow-hidden rounded-2xl border border-[#e9e9eb] bg-[#f8f9fa]">
          <div className="flex shrink-0 items-center justify-between py-[7px] pl-4 pr-2">
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
                  <FigmaGlyph src={`${ICON}/${b.icon}.svg`} inset={b.inset} size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* 空态 + 快捷开始 */}
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 overflow-y-auto px-[39px]">
            <div className="flex flex-col items-center gap-3">
              <h2 className="w-full text-center text-[24px] leading-normal text-black" style={SERIF}>
                嗨～开始创建世界书吧
              </h2>
              <p className="w-full text-[14px] leading-[1.75] text-[rgba(37,38,50,0.6)]">
                手里有完整稿子可以直接丢给我梳理，没成型也能慢慢一起攒设定，看你现在是哪种情况：
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-medium text-[rgba(37,38,50,0.6)]">快速开始</span>
              <div className="flex flex-col gap-3">
                {QUICK_STARTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => pickQuickStart(q)}
                    className="flex h-11 items-center rounded-[38px] border border-[#e9e9eb] bg-[#fafafa] px-4 text-left text-[13px] font-medium text-black transition-colors hover:bg-white"
                  >
                    <span className="min-w-0 flex-1 truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 输入框 */}
          <div className="m-[15px] flex h-[174px] shrink-0 flex-col rounded-3xl border-[0.5px] border-black/[0.12] bg-white shadow-[0_8px_8px_rgba(12,17,31,0.08)]">
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
              placeholder="请输入你的想法"
              aria-label="输入你的想法"
              className="min-h-0 flex-1 resize-none bg-transparent px-4 pt-3.5 text-[14px] leading-[22px] text-[#17171f] outline-none placeholder:text-[rgba(37,38,50,0.35)]"
            />
            <div className="flex shrink-0 items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="添加素材"
                  aria-label="添加素材"
                  onClick={() => toast('添加素材（演示）')}
                  className="flex items-center rounded-3xl p-[5px] text-[rgba(37,38,50,0.8)] transition-colors hover:bg-black/[0.04]"
                >
                  <Plus size={14} strokeWidth={2} />
                </button>
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
              </div>
              <button
                type="button"
                title="发送"
                aria-label="发送"
                disabled={!draft.trim()}
                onClick={send}
                className="flex size-6 items-center justify-center rounded-full bg-[#1c1f23] text-white transition-opacity disabled:opacity-40"
              >
                <ArrowUp size={14} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
