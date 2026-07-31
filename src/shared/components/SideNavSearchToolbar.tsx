import { Search01LinearIcon } from 'master-icon/react/Search01LinearIcon'
import SideNavPanelStateIcon from './SideNavPanelStateIcon'

export default function SideNavSearchToolbar({
  value,
  onChange,
  onToggle,
  placeholder = '搜索',
  ariaLabel = placeholder,
  collapsed = false,
}: {
  value: string
  onChange: (value: string) => void
  onToggle: () => void
  placeholder?: string
  ariaLabel?: string
  collapsed?: boolean
}) {
  return (
    <div className="flex h-10 w-full shrink-0 items-center justify-center gap-2">
      {!collapsed && (
        <label className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white px-2 text-[#1c1f23]/60 ring-[0.5px] ring-inset ring-[#2d426b]/[0.12] focus-within:ring-1 focus-within:ring-[#2d426b]/25">
          <Search01LinearIcon size={16} className="shrink-0" />
          <input
            type="search"
            aria-label={ariaLabel}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[12px] leading-4 text-[#1c1f23] outline-none placeholder:text-[#1c1f23]/60"
          />
        </label>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? '展开导航' : '收起导航'}
        title={collapsed ? '展开导航' : '收起导航'}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#252632]/45 hover:bg-black/[0.03] hover:text-[#252632]/70"
      >
        <SideNavPanelStateIcon collapsed={collapsed} />
      </button>
    </div>
  )
}
