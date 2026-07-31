import SideNavPanelStateIcon from './SideNavPanelStateIcon'

type SideNavProductHeaderProps = {
  /** 收起态：方案 2 显示产品 logo，方案 4 / 6 的文字头显示展开 icon。 */
  collapsed?: boolean
  /** 与下方首项的间距；分身、百科需要紧贴时传 0。 */
  bottomGap?: 0 | 12
  onToggle: () => void
} & (
  | {
      /** public/icons 下的产品图标 — logo 占位 */
      icon: string
      /** 产品名，仅用于无障碍标签 */
      productLabel: string
      leadingText?: undefined
      onLogoClick?: () => void
    }
  | {
      /** 方案 4 / 6：用 13px 文本替代左侧产品 icon/logo。 */
      leadingText: string
      icon?: never
      productLabel?: never
      onLogoClick?: never
    }
)

/** 方案 2 的侧栏顶部行：产品自有 logo（左）+ 收起/展开 icon（右）。
 *  logo 来自 Figma「统一导航」380-27227；方案 4 / 6 用产品对应的
 *  文本标题替代左侧标识。 */
export default function SideNavProductHeader(props: SideNavProductHeaderProps) {
  const { bottomGap = 12, collapsed = false, onToggle } = props
  const isTextHeader = props.leadingText !== undefined
  const iconGlyph = !isTextHeader ? (
    <img
      src={props.icon}
      alt=""
      aria-hidden
      className="size-6 shrink-0 object-contain opacity-[0.67]"
    />
  ) : null

  if (collapsed && !isTextHeader) {
    return (
      <div
        className={`${bottomGap === 0 ? 'mb-0' : 'mb-3'} flex items-center justify-center`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label="展开导航"
          title="展开导航"
          className="group relative flex size-8 shrink-0 items-center justify-center rounded-lg text-[#252632]/45 transition-colors duration-150 hover:bg-black/[0.03] hover:text-[#252632]/70 motion-reduce:transition-none"
        >
          <img
            src={props.icon}
            alt=""
            aria-hidden
            className="size-6 shrink-0 object-contain opacity-[0.67] transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
          />
          <SideNavPanelStateIcon
            collapsed
            className="absolute size-4 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`${isTextHeader ? 'h-10' : bottomGap === 0 ? 'mb-0' : 'mb-3'} flex items-center ${
        collapsed ? 'justify-center' : 'justify-between pl-1'
      }`}
    >
      {!collapsed && (
        isTextHeader ? (
          <span className="truncate text-[13px] font-medium leading-5 text-[#161823]">
            {props.leadingText}
          </span>
        ) : props.onLogoClick ? (
          <button
            type="button"
            aria-label={`${props.productLabel}首页`}
            onClick={props.onLogoClick}
            className="flex items-center text-[#161823]"
          >
            {iconGlyph}
          </button>
        ) : (
          <span className="flex items-center text-[#161823]">{iconGlyph}</span>
        )
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? '展开导航' : '收起导航'}
        title={collapsed ? '展开导航' : '收起导航'}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#252632]/45 transition-colors hover:bg-black/[0.03] hover:text-[#252632]/70"
      >
        <SideNavPanelStateIcon collapsed={collapsed} />
      </button>
    </div>
  )
}
