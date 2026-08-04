
import { Settings01LinearIcon } from 'master-icon/react/Settings01LinearIcon'
import SideNavPanelStateIcon from './SideNavPanelStateIcon'

export function SideNavCollapseFooterButton({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? '展开导航' : '收起导航'}
      title={collapsed ? '展开导航' : '收起导航'}
      className={`flex h-[var(--sn-rh,36px)] w-full items-center gap-[var(--sn-rgap,8px)] rounded-[var(--sn-rr,8px)] text-[length:var(--sn-rfs,13px)] text-[#565A60] transition-colors hover:bg-black/[0.03] hover:text-[#161823] ${
        collapsed
          ? 'justify-center px-0'
          : 'pl-[var(--sn-rip,var(--sn-rpx,8px))] pr-[var(--sn-rpx,8px)]'
      }`}
    >
      <SideNavPanelStateIcon collapsed={collapsed} />
      {!collapsed && <span>收起导航</span>}
    </button>
  )
}

export default function SideNavIconFooterActions({
  collapsed = false,
  onToggle,
  onOpenMyEntries,
  onOpenProjectSettings,
  className = '',
}: {
  collapsed?: boolean
  onToggle: () => void
  onOpenMyEntries?: () => void
  onOpenProjectSettings: () => void
  className?: string
}) {
  const buttonClass =
    'flex h-[var(--sn-rh,36px)] items-center justify-center rounded-[var(--sn-rr,8px)] text-[#565A60] transition-colors hover:bg-black/[0.03] hover:text-[#161823]'
  const expandedButtonClass = `${buttonClass} px-[var(--sn-rpx,8px)]`

  return (
    <div className={`flex items-center gap-1 ${collapsed ? 'justify-center' : 'justify-start'} ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? '展开导航' : '收起导航'}
        title={collapsed ? '展开导航' : '收起导航'}
        className={collapsed ? `${buttonClass} w-full` : expandedButtonClass}
      >
        {/* 收展两态同一枚面板图标 —— 展开态原来用的是 « 双箭头，
            和其他方案的收起入口不是一个东西，也和旁边的设置图标不搭。 */}
        <SideNavPanelStateIcon
          collapsed={collapsed}
          className="size-[var(--sn-mis,16px)] shrink-0"
        />
      </button>
      {!collapsed && onOpenMyEntries && (
        <button
          type="button"
          onClick={onOpenMyEntries}
          aria-label="我的词条 23"
          title="我的词条 23"
          className={expandedButtonClass}
        >
          <img
            src="/icons/wiki-editor/scheme4-inbox.svg"
            alt=""
            aria-hidden
            className="size-[var(--sn-mis,16px)] shrink-0"
          />
        </button>
      )}
      {!collapsed && (
        <button
          type="button"
          onClick={onOpenProjectSettings}
          aria-label="项目设置"
          title="项目设置"
          className={expandedButtonClass}
        >
          <Settings01LinearIcon className="size-[var(--sn-mis,16px)] shrink-0" />
        </button>
      )}
    </div>
  )
}
