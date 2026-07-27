import { ChevronDownSmallLinearIcon } from 'master-icon/react/ChevronDownSmallLinearIcon'

export const SIDE_NAV_DISCLOSURE_ICON_SIZE = 16

/** 侧栏统一披露箭头：chevron-down-small，仅按菜单 / 树的语义旋转。 */
export default function SideNavDisclosureIcon({
  expanded = false,
  mode = 'menu',
  className = '',
}: {
  expanded?: boolean
  mode?: 'menu' | 'tree'
  className?: string
}) {
  const rotation = mode === 'tree' ? (expanded ? 0 : -90) : expanded ? 180 : 0
  return (
    <ChevronDownSmallLinearIcon
      size={SIDE_NAV_DISCLOSURE_ICON_SIZE}
      className={`shrink-0 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    />
  )
}
