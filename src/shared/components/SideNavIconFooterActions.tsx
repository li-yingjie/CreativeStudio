import { ArrowLeftDoubleLinearIcon } from 'master-icon/react/ArrowLeftDoubleLinearIcon'
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
      className={`flex h-[var(--sn-rh,36px)] w-full items-center gap-[var(--sn-rgap,8px)] rounded-[var(--sn-rr,8px)] px-[var(--sn-rpx,8px)] text-[length:var(--sn-rfs,13px)] text-[#252632]/70 transition-colors hover:bg-black/[0.03] hover:text-[#252632]/85 ${
        collapsed ? 'justify-center' : ''
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
  onOpenProjectSettings,
  className = '',
}: {
  collapsed?: boolean
  onToggle: () => void
  onOpenProjectSettings: () => void
  className?: string
}) {
  const buttonClass =
    'flex h-[var(--sn-rh,36px)] items-center justify-center rounded-[var(--sn-rr,8px)] text-[#252632]/70 transition-colors hover:bg-black/[0.03] hover:text-[#252632]/85'
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
        {collapsed ? (
          <SideNavPanelStateIcon collapsed />
        ) : (
          <ArrowLeftDoubleLinearIcon className="size-[var(--sn-mis,16px)] shrink-0" />
        )}
      </button>
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
