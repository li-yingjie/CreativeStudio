import type { ReactNode } from 'react'
import SideNavPanelStateIcon from '@/shared/components/SideNavPanelStateIcon'
import addSquareGlyph from './assets/unified-toolbar/add-square.svg'
import productsGlyph from './assets/unified-toolbar/products.svg'
import searchGlyph from './assets/unified-toolbar/search.svg'
import settingsGlyph from './assets/unified-toolbar/settings.svg'
import taskApprovalGlyph from './assets/unified-toolbar/task-approval.svg'

export type UnifiedToolbarAction =
  | 'layout'
  | 'products'
  | 'create'
  | 'settings'
  | 'search'
  | 'tasks'

const DEFAULT_ACTIONS: readonly UnifiedToolbarAction[] = [
  'layout',
  'products',
  'create',
  'settings',
  'search',
  'tasks',
]

const ACTION_LABELS: Record<UnifiedToolbarAction, string> = {
  layout: '收起导航',
  products: '产品入口',
  create: '新建',
  settings: '设置',
  search: '搜索',
  tasks: '任务',
}

/** layout（收起导航）不走这里 —— 它统一用 SideNavPanelStateIcon，
 *  和其他方案的收起入口保持同一枚图标。 */
const ACTION_GLYPHS: Record<Exclude<UnifiedToolbarAction, 'layout'>, string> = {
  products: productsGlyph,
  create: addSquareGlyph,
  settings: settingsGlyph,
  search: searchGlyph,
  tasks: taskApprovalGlyph,
}

function ToolbarButton({
  action,
  label,
  onAction,
  children,
}: {
  action: UnifiedToolbarAction
  label: string
  onAction: (action: UnifiedToolbarAction) => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-toolbar-action={action}
      onClick={() => onAction(action)}
      className="flex shrink-0 items-center rounded-md p-1 text-[#1c1f23] transition-colors duration-150 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c1f23]/40 motion-reduce:transition-none"
    >
      {children}
    </button>
  )
}

/** Figma「统一导航」472:58090。入口从左侧开始，以固定 12px 间距排列。 */
export default function UnifiedToolbar({
  actions = DEFAULT_ACTIONS,
  ariaLabel = '统一工具条',
  taskCount = 23,
  collapsed = false,
  onAction,
}: {
  actions?: readonly UnifiedToolbarAction[]
  ariaLabel?: string
  taskCount?: number
  /** 收起态只留「收起导航」一颗 —— 图标和位置与展开态完全一致，
   *  收展之间那颗按钮原地不动，不再换成别的图标、挪到别的地方。 */
  collapsed?: boolean
  onAction: (action: UnifiedToolbarAction) => void
}) {
  const visibleActions = collapsed
    ? actions.filter((action) => action === 'layout')
    : actions
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className="flex h-10 w-full shrink-0 items-center justify-start gap-3"
    >
      {visibleActions.map((action) => (
        <ToolbarButton
          key={action}
          action={action}
              label={
            action === 'tasks'
              ? `${ACTION_LABELS[action]} ${taskCount}`
              : action === 'layout' && collapsed
                ? '展开导航'
                : ACTION_LABELS[action]
          }
          onAction={onAction}
        >
          {action === 'layout' ? (
            <SideNavPanelStateIcon className="size-4 shrink-0" />
          ) : action === 'tasks' ? (
            <span className="flex items-center gap-0.5">
              <img src={ACTION_GLYPHS[action]} alt="" aria-hidden className="size-4 shrink-0" />
              <span className="rounded-md bg-[rgba(28,31,35,0.8)] px-1 text-center text-[10px] font-medium leading-3 tabular-nums text-white">
                {taskCount}
              </span>
            </span>
          ) : (
            <img src={ACTION_GLYPHS[action]} alt="" aria-hidden className="size-4 shrink-0" />
          )}
        </ToolbarButton>
      ))}
    </div>
  )
}
