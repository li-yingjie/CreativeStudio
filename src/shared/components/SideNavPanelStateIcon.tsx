import { SidebarHiddenLeftWideLinearIcon } from 'master-icon/react/SidebarHiddenLeftWideLinearIcon'
import { SidebarHiddenRightWideLinearIcon } from 'master-icon/react/SidebarHiddenRightWideLinearIcon'

/** 收起/展开导航的图标 —— master-icon 的 sidebar-hidden-*-wide。
 *
 *  收展两态同一枚图形：这是「侧栏」这个对象的标识，不是方向指示，
 *  换来换去反而让人以为点的是两个不同的东西。
 *  颜色一律走实色 currentColor（挂载处给 #565A60 / hover #161823），
 *  不要用 text-xxx/45 这种透明度填充 —— 叠在不同底色上会花。 */
export default function SideNavPanelStateIcon({
  side = 'left',
  className = 'size-4 shrink-0',
}: {
  side?: 'left' | 'right'
  /** 保留以兼容调用处；两态同图，不影响渲染。 */
  collapsed?: boolean
  className?: string
}) {
  const Icon =
    side === 'right'
      ? SidebarHiddenRightWideLinearIcon
      : SidebarHiddenLeftWideLinearIcon

  return <Icon aria-hidden className={className} />
}
