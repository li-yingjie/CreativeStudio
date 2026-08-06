import SideNavPanelStateIcon from './SideNavPanelStateIcon'

type SideNavProductHeaderProps = {
  /** 收起态：方案 2 显示产品 logo，方案 4 的文字头显示展开 icon。 */
  collapsed?: boolean
  /** 与下方首项的间距；分身、百科需要紧贴时传 0。 */
  bottomGap?: 0 | 12
  /** 不传则不渲染收起按钮 —— 用于「本产品不提供收起」的场合（方案 4 首页）。 */
  onToggle?: () => void
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
      /** 方案 4：用 13px 文本替代左侧产品 icon/logo。 */
      leadingText: string
      icon?: never
      productLabel?: never
      onLogoClick?: never
    }
)

/** 方案 2 的侧栏顶部行：产品自有 logo（左）+ 收起/展开 icon（右）。
 *  logo / 文本头几何对齐 Figma「统一导航」579-57535；方案 4 用产品对应的
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
        {/* 不提供收起的场合（方案 8：入口只在内容区）收起态就只是一枚
            产品 logo，不能再挂一个「展开导航」的按钮语义。 */}
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="展开导航"
            title="展开导航"
            className="group relative flex size-8 shrink-0 items-center justify-center rounded-lg text-[#565A60] transition-colors duration-150 hover:bg-black/[0.03] hover:text-[#161823] motion-reduce:transition-none"
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
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center">
            {iconGlyph}
          </span>
        )}
      </div>
    )
  }

  if (isTextHeader && !collapsed) {
    return (
      <div className="flex h-10 w-full items-center justify-between pl-5 pr-2">
        <span className="min-w-0 truncate text-[13px] font-medium leading-[18px] text-[#1c1f2399]">
          {props.leadingText}
        </span>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="收起导航"
            title="收起导航"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#1c1f2359] transition-colors hover:bg-black/[0.03] hover:text-[#1c1f2399]"
          >
            <SideNavPanelStateIcon className="size-4 shrink-0" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`${isTextHeader ? 'h-10' : bottomGap === 0 ? 'mb-0' : 'mb-3'} flex items-center ${
        collapsed ? 'justify-center' : 'justify-between pl-1.5'
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
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? '展开导航' : '收起导航'}
          title={collapsed ? '展开导航' : '收起导航'}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#565A60] transition-colors hover:bg-black/[0.03] hover:text-[#161823]"
        >
          <SideNavPanelStateIcon collapsed={collapsed} />
        </button>
      )}
    </div>
  )
}
