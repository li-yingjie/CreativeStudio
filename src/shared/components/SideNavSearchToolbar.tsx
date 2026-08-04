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
      {/* 输入框与紧邻的对象/项目切换器同款：h-8、rounded-lg、#e9e9eb 描边。
          原来是 rounded-full + 蓝调 ring，百科里两个控件上下贴着，一个胶囊
          一个圆角卡、描边颜色也不同，看着不像一套。 */}
      {!collapsed && (
        <label className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-[#e9e9eb] bg-white px-2 text-[#1c1f23]/60 focus-within:border-[#d0d0d4]">
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
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#565A60] hover:bg-black/[0.03] hover:text-[#161823]"
      >
        <SideNavPanelStateIcon collapsed={collapsed} />
      </button>
    </div>
  )
}
