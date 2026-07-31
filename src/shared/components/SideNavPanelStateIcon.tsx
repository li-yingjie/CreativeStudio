export default function SideNavPanelStateIcon({
  side = 'left',
  collapsed = false,
  className = 'size-4 shrink-0',
}: {
  side?: 'left' | 'right'
  collapsed?: boolean
  className?: string
}) {
  const source = `/icons/layout/layout-${side}${collapsed ? '-on' : ''}.svg`

  return (
    <img
      aria-hidden
      alt=""
      src={source}
      className={`object-contain ${className}`}
    />
  )
}
