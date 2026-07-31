import { forwardRef, useId, useMemo, useState, type ComponentProps, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { motion, useReducedMotion } from 'framer-motion'
import SideNavDisclosureIcon from './SideNavDisclosureIcon'
import {
  SIDE_NAV_DEFAULT_BACKGROUND,
  SIDE_NAV_DEFAULTS,
  useSideNavConfig,
} from './side-nav-config'
import SideNavResizeHandle from './SideNavResizeHandle'
import { useResizableSideNavWidth } from '@/shared/hooks/useResizableSideNavWidth'

export {
  SIDE_NAV_COLLAPSED_WIDTH,
  SIDE_NAV_DEFAULT_BACKGROUND,
  SIDE_NAV_WIDTH,
} from './side-nav-config'

export const SIDE_NAV_MOTION_DURATION = 0.16
export const SIDE_NAV_MOTION_OFFSET = 12

/* ─── 统一左侧导航 ───
 *
 * 所有产品的左侧栏共用同一个组件：同一宽度（SIDE_NAV_WIDTH）、同一套
 * 菜单视觉；各产品只注入自己的内容（items / header / children）。
 *
 * 尺寸与配色统一走 side-nav-config 的运行时配置（规范画布 /sidebar 可
 * 实时编辑并保存），组件把配置注入为 --sn-* / --sidenav-* CSS 变量；
 * 主题化面板仍可在挂载处通过 style 覆写背景与 --sidenav-* 配色变量。 */

export interface SideNavItem {
  key: string
  /** 菜单图标统一来自 MasterIcon（master-icon/react，currentColor 着色）。 */
  Icon?: ComponentType<{ size?: number | string; className?: string }>
  label: string
  /** 兜底：public/icons 下的单色 SVG — 以 CSS mask 着色，跟随文字色 */
  icon?: string
  /** 可折叠子菜单；点击子项回调 `${key}:${子项}` */
  children?: string[]
}

/** 菜单图标 — MasterIcon 组件或 mask 着色的 SVG。
 *  图标不跟随行文字的半透明色，始终用实色（--sidenav-icon）。 */
function ItemGlyph({ item, size = SIDE_NAV_DEFAULTS.menuIconSize }: { item: SideNavItem; size?: number }) {
  if (item.Icon) return <item.Icon size={size} className="shrink-0 text-[var(--sidenav-icon,#252632)]" />
  if (!item.icon) return null
  // 路径可能含空格/中文（如 /icons/Nav 菜单/…），必须 encodeURI + 引号
  const mask = `url("${encodeURI(item.icon)}")`
  return (
    <span
      aria-hidden
      className="shrink-0 bg-[var(--sidenav-icon,#252632)]"
      style={{
        width: size,
        height: size,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

/** 侧栏顶部主操作按钮（首页「发布作品」/ 工坊「AI 创作」）——
 *  按钮样式统一在这里，产品只注入内容与行为。forwardRef 以便
 *  作为 Radix Popover 的 asChild trigger 使用。 */
export const SideNavActionButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<'button'> & { collapsed?: boolean; variant?: 'light' | 'dark' }
>(function SideNavActionButton({ collapsed = false, variant = 'light', className = '', children, style, ...rest }, ref) {
  // 几何（高度 / 圆角 / 字号 / 内边距）两种变体完全一致，默认值取自设计稿
  // 统一导航 275-22603，可在 /sidebar 的配置面板运行时调整；variant 只切换
  // 配色：dark = 首页「发布作品」，light = 工坊「AI 创作」。
  const cfg = useSideNavConfig((s) => s.config)
  const tone =
    variant === 'dark'
      ? 'bg-[#1c1f23] text-white hover:bg-[#2b2e33]'
      : 'bg-white text-[#161823] ring-1 ring-black/10 transition-shadow hover:shadow-sm'
  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      // 收起态与菜单行一样收成正方形（外层 px 提供左右内边距）
      className={`relative flex w-full items-center gap-[var(--sn-rgap,8px)] font-semibold ${tone} ${
        collapsed ? 'justify-center' : ''
      } ${className}`}
      style={{
        height: collapsed ? cfg.rowHeight : cfg.buttonHeight,
        borderRadius: cfg.buttonRadius,
        // 顶部操作与下方菜单共享 13px 字号和横向对齐基线。
        fontSize: 13,
        paddingLeft: collapsed ? 0 : cfg.rowPaddingX,
        paddingRight: collapsed ? 0 : cfg.rowPaddingX,
        ...style,
      }}
    >
      {children}
    </button>
  )
})

export default function SideNav({
  ariaLabel,
  items,
  activeKey,
  onSelect,
  isItemActive,
  header,
  children,
  footer,
  layout = 'fixed',
  responsive = false,
  collapsed = false,
  resizable = false,
  flushHeader = false,
  chrome = 'panel',
  showDivider = true,
  style,
}: {
  ariaLabel: string
  items: SideNavItem[]
  /** 当前激活项（item.key 或子项的 `${key}:${子项}`）。 */
  activeKey: string | null
  onSelect: (key: string) => void
  /** 自定义父项高亮逻辑（默认为 key 全等，或其子项处于激活态）。 */
  isItemActive?: (item: SideNavItem) => boolean
  /** 菜单上方的产品自定义区（如工坊的「AI 创作」按钮）。 */
  header?: ReactNode
  /** 菜单下方的产品自定义区（如工坊的项目列表树）。 */
  children?: ReactNode
  /** 底部固定区（如首页的「收起导航」按钮）。 */
  footer?: ReactNode
  /** fixed = 组件自身固定统一宽度；fill = 撑满外层（外层负责宽度）。 */
  layout?: 'fixed' | 'fill'
  /** <lg 收缩为只有 icon 的窄导航（icon rail），仅 fixed 布局使用。 */
  responsive?: boolean
  /** 手动收起为 icon rail（由外部状态控制，如底部「收起导航」）。 */
  collapsed?: boolean
  /** fixed 布局下允许拖拽右边缘调整当前页面内的展开宽度；收起态自动隐藏手柄。 */
  resizable?: boolean
  /** 让自定义 Header 从侧栏顶部开始；用于方案 4 Header 与搜索工具栏。 */
  flushHeader?: boolean
  /** panel = 导航默认底色；plain = 透明（浮在产品自己的底色上）。 */
  chrome?: 'panel' | 'plain'
  /** panel 模式是否显示右侧分隔线；plain 模式始终不显示。 */
  showDivider?: boolean
  /** 覆写背景或 --sidenav-* 配色变量（主题化面板用）。 */
  style?: CSSProperties
}) {
  const cfg = useSideNavConfig((s) => s.config)
  const reduceMotion = useReducedMotion() ?? false
  const { width: resizedWidth, setWidth: setResizedWidth } = useResizableSideNavWidth()
  const subIdPrefix = useId()
  const activeSubKey =
    items.find((item) => item.children?.length && activeKey?.startsWith(`${item.key}:`))?.key ?? null
  const [subMenuState, setSubMenuState] = useState(() => ({
    activeKey,
    activeSubKey,
    openKey: activeSubKey,
  }))
  const subMenuStateIsCurrent =
    subMenuState.activeKey === activeKey && subMenuState.activeSubKey === activeSubKey
  if (!subMenuStateIsCurrent) {
    setSubMenuState({ activeKey, activeSubKey, openKey: activeSubKey })
  }
  const openSub = subMenuStateIsCurrent ? subMenuState.openKey : activeSubKey
  const setOpenSub = (openKey: string | null) =>
    setSubMenuState({ activeKey, activeSubKey, openKey })
  const selectSubItem = (parentKey: string, child: string) => {
    const key = `${parentKey}:${child}`
    setSubMenuState({ activeKey: key, activeSubKey: parentKey, openKey: parentKey })
    onSelect(key)
  }

  const itemActive = (m: SideNavItem) =>
    isItemActive
      ? isItemActive(m)
      : activeKey === m.key ||
        (Boolean(m.children?.length) && Boolean(activeKey?.startsWith(`${m.key}:`)))

  // 尺寸走 --sn-* 变量（值来自运行时配置），宽度类引用变量以保住
  // responsive 的 lg: 断点切换能力。
  const widthClass =
    layout === 'fill'
      ? 'w-full'
      : collapsed
        ? 'w-[var(--sn-wc)]'
        : responsive
          ? 'w-[var(--sn-wc)] lg:w-[var(--sn-w)]'
          : 'w-[var(--sn-w)]'
  const chromeClass =
    chrome === 'panel' && showDivider ? 'border-r border-black/5' : ''
  const topPaddingClass = flushHeader ? 'pt-0' : 'pt-[var(--sn-top)]'

  const rowClass = (active: boolean) =>
    `flex h-[var(--sn-rh)] w-full items-center gap-[var(--sn-rgap)] rounded-[var(--sn-rr)] px-[var(--sn-rpx)] text-[length:var(--sn-rfs)] font-medium transition-colors ${
      collapsed ? 'justify-center' : responsive ? 'justify-center lg:justify-start' : ''
    } ${
      active
        ? 'bg-[var(--sidenav-active,rgba(83,96,143,0.12))] text-[var(--sidenav-ink,#1c1f23)]'
        : 'text-[var(--sidenav-ink-dim,rgba(28,31,35,0.8))] hover:bg-[var(--sidenav-hover,rgba(0,0,0,0.03))] hover:text-[var(--sidenav-ink-hover,#1c1f23)]'
    }`

  const subRowClass = (active: boolean) =>
    `flex h-[var(--sn-srh)] w-full items-center rounded-[var(--sn-rr)] pl-8 text-[length:var(--sn-rfs)] transition-colors ${
      active
        ? 'bg-[var(--sidenav-active,rgba(83,96,143,0.12))] text-[var(--sidenav-ink,#1c1f23)]'
        : 'text-[var(--sidenav-ink-dim,rgba(28,31,35,0.65))] hover:bg-[var(--sidenav-hover,rgba(0,0,0,0.03))] hover:text-[var(--sidenav-ink-hover,#1c1f23)]'
    }`

  const panelBackground =
    cfg.bg.trim().toLowerCase() === SIDE_NAV_DEFAULTS.bg.toLowerCase()
      ? SIDE_NAV_DEFAULT_BACKGROUND
      : cfg.bg

  // 配置注入为 CSS 变量；挂载处传入的 style 放最后，仍可覆写配色。
  const cfgVars = {
    '--sn-w': `${resizable ? resizedWidth : cfg.width}px`,
    '--sn-wc': `${cfg.collapsedWidth}px`,
    '--sn-top': `${cfg.topPadding}px`,
    '--sn-px': `${cfg.listPaddingX}px`,
    '--sn-rh': `${cfg.rowHeight}px`,
    '--sn-rr': `${cfg.rowRadius}px`,
    '--sn-rpx': `${cfg.rowPaddingX}px`,
    '--sn-rgap': `${cfg.rowGap}px`,
    '--sn-rsp': `${cfg.rowSpacing}px`,
    '--sn-rfs': `${cfg.rowFontSize}px`,
    '--sn-mis': `${cfg.menuIconSize}px`,
    '--sn-srh': `${cfg.subRowHeight}px`,
    '--sidenav-active': cfg.activeBg,
    '--sidenav-hover': cfg.hoverBg,
    '--sidenav-ink': cfg.ink,
    '--sidenav-ink-hover': cfg.ink,
    '--sidenav-ink-dim': cfg.inkDim,
    '--sidenav-icon': cfg.iconColor,
  } as CSSProperties
  const resolvedStyle = {
    ...cfgVars,
    background: chrome === 'panel' ? panelBackground : undefined,
    ...style,
  } as CSSProperties
  const resolvedTokens = resolvedStyle as CSSProperties & Record<string, string | number | undefined>
  const collapseFeedback = useMemo(
    () =>
      reduceMotion
        ? { x: 0, opacity: 1 }
        : {
            x: 0,
            opacity: collapsed ? [0.86, 1] : [0.82, 1],
          },
    [collapsed, reduceMotion],
  )
  // Popover 通过 Portal 挂到 body，需显式携带侧栏主题变量。
  const popoverStyle = {
    '--sidenav-active': resolvedTokens['--sidenav-active'],
    '--sidenav-hover': resolvedTokens['--sidenav-hover'],
    '--sidenav-ink': resolvedTokens['--sidenav-ink'],
    '--sidenav-ink-hover': resolvedTokens['--sidenav-ink-hover'],
    '--sidenav-ink-dim': resolvedTokens['--sidenav-ink-dim'],
    '--sidenav-popover-bg': resolvedTokens['--sidenav-popover-bg'] ?? '#fff',
    '--sidenav-popover-border': resolvedTokens['--sidenav-popover-border'] ?? 'rgba(0,0,0,0.05)',
  } as CSSProperties

  return (
    <motion.aside
      aria-label={ariaLabel}
      data-side-nav-motion
      data-side-nav-surface
      data-state={collapsed ? 'collapsed' : 'expanded'}
      initial={false}
      animate={collapseFeedback}
      transition={{
        duration: reduceMotion ? 0 : SIDE_NAV_MOTION_DURATION,
        ease: 'easeOut',
      }}
      style={resolvedStyle}
      className={`relative flex h-full min-h-0 shrink-0 flex-col ${widthClass} ${chromeClass} ${topPaddingClass}`}
    >
      {header && <div className="shrink-0">{header}</div>}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {items.length > 0 && (
          <nav
            aria-label={`${ariaLabel}菜单`}
            className="flex shrink-0 flex-col gap-[var(--sn-rsp)] px-[var(--sn-px)]"
          >
            {items.map((m, itemIndex) => {
            const active = itemActive(m)

            if (m.children?.length) {
              const subOpen = openSub === m.key
              const subId = `${subIdPrefix}-sub-${itemIndex}`
              return (
                <div key={m.key}>
                  {/* 收缩态（icon rail）下子菜单走 Popover，保证窄屏可达 */}
                  {(responsive || collapsed) && (
                    <div className={collapsed ? '' : 'lg:hidden'}>
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button type="button" title={m.label} aria-label={`打开${m.label}菜单`} className={rowClass(active)}>
                            <ItemGlyph item={m} size={cfg.menuIconSize} />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            side="right"
                            align="start"
                            sideOffset={8}
                            aria-label={m.label}
                            style={popoverStyle}
                            className="z-50 min-w-36 rounded-xl border border-[var(--sidenav-popover-border,rgba(0,0,0,0.05))] bg-[var(--sidenav-popover-bg,#fff)] p-2 shadow-lg"
                          >
                            <div className="px-2 pb-1.5 text-[12px] font-medium text-[var(--sidenav-ink-dim,rgba(28,31,35,0.65))]">
                              {m.label}
                            </div>
                            {m.children.map((c) => (
                              <Popover.Close asChild key={c}>
                                <button
                                  type="button"
                                  aria-current={activeKey === `${m.key}:${c}` ? 'page' : undefined}
                                  onClick={() => selectSubItem(m.key, c)}
                                  className={`flex h-8 w-full items-center rounded-lg px-2 text-[13px] ${
                                    activeKey === `${m.key}:${c}`
                                      ? 'bg-[var(--sidenav-active,rgba(83,96,143,0.12))] font-medium text-[var(--sidenav-ink,#1c1f23)]'
                                      : 'text-[var(--sidenav-ink-dim,rgba(28,31,35,0.65))] hover:bg-[var(--sidenav-hover,rgba(0,0,0,0.03))] hover:text-[var(--sidenav-ink-hover,#1c1f23)]'
                                  }`}
                                >
                                  {c}
                                </button>
                              </Popover.Close>
                            ))}
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                  )}

                  {!collapsed && (
                    <button
                      type="button"
                      aria-expanded={subOpen}
                      aria-controls={subId}
                      onClick={() => setOpenSub(subOpen ? null : m.key)}
                      className={`${rowClass(active)} ${responsive ? 'hidden lg:flex' : ''}`}
                    >
                      <ItemGlyph item={m} size={cfg.menuIconSize} />
                      <span>{m.label}</span>
                      <SideNavDisclosureIcon expanded={subOpen} className="ml-auto opacity-50" />
                    </button>
                  )}
                  {subOpen && !collapsed && (
                    <div id={subId} className={`mt-0.5 space-y-0.5 ${responsive ? 'hidden lg:block' : ''}`}>
                      {m.children.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-current={activeKey === `${m.key}:${c}` ? 'page' : undefined}
                          onClick={() => selectSubItem(m.key, c)}
                          className={subRowClass(activeKey === `${m.key}:${c}`)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={m.key}
                type="button"
                title={m.label}
                aria-label={m.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(m.key)}
                className={rowClass(active)}
              >
                <ItemGlyph item={m} size={cfg.menuIconSize} />
                <span className={collapsed ? 'hidden' : responsive ? 'hidden lg:inline' : ''}>{m.label}</span>
              </button>
            )
            })}
          </nav>
        )}
        {children}
      </div>
      {footer && <div className="mt-auto shrink-0">{footer}</div>}
      {resizable && !collapsed && layout === 'fixed' && (
        <SideNavResizeHandle
          value={resizedWidth}
          onChange={setResizedWidth}
          ariaLabel={`调整${ariaLabel}宽度`}
        />
      )}
    </motion.aside>
  )
}
