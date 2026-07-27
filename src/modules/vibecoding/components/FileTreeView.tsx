import type { LucideIcon } from '@/shared/icons'
import type { CSSProperties } from 'react'
import { Folder2LinearIcon } from 'master-icon/react/Folder2LinearIcon'
import { FolderOpenFrontLinearIcon } from 'master-icon/react/FolderOpenFrontLinearIcon'
import type { FileNode } from './ProjectProductView'
import { getFileIcon } from './file-tree-utils'
import { useSideNavConfig } from '@/shared/components/side-nav-config'
import SideNavDisclosureIcon from '@/shared/components/SideNavDisclosureIcon'

/* 树的节奏对齐设计稿（统一导航 249-18701）：
 * - 行高 28
 * - 每级缩进 20；箭头在左侧时，缩进 = 箭头槽 16 + 间距 4，
 *   子级箭头列会落到父级图标列。箭头切到右侧后，层级仍由同一缩进表达。
 * - 列表自身左边距 8（挂载容器再给 12，箭头列合计从 20 起步）。 */
/* 以下导出是「代码默认值」；实际渲染读 side-nav-config 的运行时配置
 * （/sidebar 配置面板可改可存），这些常量仅作兜底与旧引用兼容。 */
export const DISCLOSURE_INDENT = 20
export const TREE_ROW_HEIGHT = 28

const TREE_TOKENS = {
  '--tree-active': 'var(--sidenav-active, color-mix(in srgb, var(--color-ink) 7%, transparent))',
  '--tree-hover': 'var(--sidenav-hover, color-mix(in srgb, var(--color-ink) 4%, transparent))',
  '--tree-ink': 'var(--sidenav-ink, var(--color-ink))',
  '--tree-ink-dim': 'var(--sidenav-ink-dim, color-mix(in srgb, var(--color-ink) 75%, transparent))',
  '--tree-ink-hover': 'var(--sidenav-ink-hover, var(--sidenav-ink, var(--color-ink)))',
  '--tree-icon': 'var(--sidenav-icon, var(--color-ink))',
} as CSSProperties

/** 披露箭头 — 展开旋转 90°；叶子/空目录保留槽位但不显示箭头，
 *  这样同级的图标始终左对齐（Finder 的做法）。 */
export function Disclosure({
  expanded,
  visible,
  label,
  onToggle,
}: {
  expanded: boolean
  visible: boolean
  label: string
  onToggle: () => void
}) {
  const slot = useSideNavConfig((s) => s.config.treeSlot)
  const treeDisclosurePosition = useSideNavConfig((s) => s.config.treeDisclosurePosition)
  const positionClass = treeDisclosurePosition === 'right' ? 'order-last ml-auto' : ''
  if (!visible)
    return <span aria-hidden className={`h-6 shrink-0 ${positionClass}`} style={{ width: slot }} />
  return (
    <span
      className={`relative flex h-6 shrink-0 items-center justify-center ${positionClass}`}
      style={{ width: slot }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${expanded ? '收起' : '展开'}${label}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="absolute left-1/2 top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[var(--sidenav-icon,var(--color-ink))] opacity-40 transition-opacity hover:opacity-80"
      >
        <SideNavDisclosureIcon
          expanded={expanded}
          mode="tree"
          className="transition-transform duration-150"
        />
      </button>
    </span>
  )
}

export function FileTreeView({
  nodes,
  expanded,
  onToggleDir,
  onOpenFile,
  onOpenDir,
  showDirChildren = true,
  defaultExpanded = false,
  canExpandDir,
  depth,
  parentPath,
  rowBleedLeft = 0,
  roundedRows = false,
  iconFor,
  badgeFor,
  isActive,
}: {
  nodes: FileNode[]
  expanded: Set<string>
  onToggleDir: (path: string) => void
  /** Name stays first for existing consumers; path and node disambiguate
   *  repeated basenames in nested source trees. */
  onOpenFile: (name: string, path: string, node: FileNode) => void
  /** Optional dir-click handler — product-view categories use it so a
   *  parent category (e.g. 界面) opens its own tab while still toggling
   *  expansion. When omitted, clicking a dir only toggles. */
  onOpenDir?: (node: FileNode, path: string) => void
  /** When false, directory rows act as object launchers and do not reveal
   *  their children. Used by the platform project list so object children
   *  stay in the right-side toolbar, not in the left navigation. */
  showDirChildren?: boolean
  /** Invert the `expanded` set so dirs render expanded by default and the
   *  set tracks the *collapsed* ones instead. The platform project list uses
   *  this so every object's children show with their indent rail up front;
   *  product paths are namespaced (`__product__/…`) so they never collide
   *  with the code tree's expanded paths in the same shared set. */
  defaultExpanded?: boolean
  /** 逐节点覆盖 showDirChildren —— 用来区分四级分类里的「模块」与
   *  「文件夹」：模块只选中不展开，文件夹（如 项目文件）可展开。
   *  返回 undefined 时回落到 showDirChildren。 */
  canExpandDir?: (node: FileNode, path: string, depth: number) => boolean | undefined
  depth: number
  parentPath: string
  /** Extends row hover/active backgrounds leftward when the tree itself is
   *  nested inside an inset container. Platform project objects use this
   *  so selected object rows align with selected project rows. */
  rowBleedLeft?: number
  /** Round the row hover/active backgrounds — used by the platform sidebar
   *  so selected object rows match the project row's rounded highlight. */
  roundedRows?: boolean
  /** Optional per-node icon override — the product view uses it to paint
   *  synthetic category folders and page leaves with their own icon.
   *  Returns undefined to fall back to the default folder / file icon.
   *  Applies to both dir and file nodes. */
  iconFor?: (node: FileNode, path: string, depth: number) => LucideIcon | undefined
  /** 关键节点的彩色图标底板（设计稿 WoW-26）：返回 tint 色时，该行的
   *  图标渲染在 16px 圆角 4 的彩色底板里；返回 undefined 保持单色。 */
  badgeFor?: (node: FileNode, path: string, depth: number) => { bg: string; fg: string } | undefined
  /** Optional node-active predicate — applies to both launchable dirs and leaves. */
  isActive?: (node: FileNode, path: string) => boolean
}) {
  const cfg = useSideNavConfig((s) => s.config)
  // macOS Finder 列表风格：不画连接线，层级只靠缩进 + 披露箭头表达。
  // 每行保留固定箭头槽位；配置切换左右时，叶子空槽也同步换边。
  return (
    <>
      {nodes.map((node) => {
        const path = parentPath ? `${parentPath}/${node.name}` : node.name
        // With defaultExpanded the set tracks collapsed paths, so flip it.
        const isExpanded = defaultExpanded ? !expanded.has(path) : expanded.has(path)
        const pl = cfg.treeBasePl + depth * cfg.treeIndent
        // 行高 / 字号 / 列间距一并走配置（见 side-nav-config）
        const rowBase = {
          ...TREE_TOKENS,
          minHeight: cfg.treeRowHeight,
          fontSize: cfg.treeFontSize,
          gap: cfg.treeGap,
        }
        const rowStyle = rowBleedLeft
          ? { ...rowBase, paddingLeft: pl + rowBleedLeft, marginLeft: -rowBleedLeft }
          : { ...rowBase, paddingLeft: pl }
        const active = isActive?.(node, path) ?? false
        if (node.type === 'dir') {
          const DirIcon = iconFor?.(node, path, depth)
          const badge = DirIcon ? badgeFor?.(node, path, depth) : undefined
          // 该节点是「文件夹」（可展开）还是「模块」（只选中）
          const expandable = canExpandDir?.(node, path, depth) ?? showDirChildren
          const canExpand = expandable && Boolean(node.children?.length)
          return (
            <div key={path}>
              {/* 行容器承载 hover 底色：箭头与标题是两个独立按钮
                  （点箭头只展开/收起，点标题还会打开该对象）。 */}
              <div
                className={`group/row box-border flex w-full items-center py-1 transition-colors ${
                  roundedRows ? 'rounded-[8px]' : ''
                } ${
                  active
                    ? 'bg-[var(--tree-active)] text-[var(--tree-ink)]'
                    : 'text-[var(--tree-ink-dim)] hover:bg-[var(--tree-hover)] hover:text-[var(--tree-ink-hover)]'
                }`}
                style={rowStyle}
              >
                {(showDirChildren || canExpandDir) && (
                  <Disclosure
                    expanded={isExpanded}
                    visible={canExpand}
                    label={node.name}
                    onToggle={() => onToggleDir(path)}
                  />
                )}
                <button
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    // 四级分类：文件夹只展开、不可选中；模块反之只打开自己的
                    // 页签（macOS Finder 里点文件夹同样是展开而非"打开"）。
                    if (expandable) onToggleDir(path)
                    else onOpenDir?.(node, path)
                  }}
                  className="flex min-w-0 flex-1 items-center text-left"
                  style={{ gap: cfg.treeGap }}
                >
                  {DirIcon && badge ? (
                    <span
                      className="flex shrink-0 items-center justify-center rounded-[4px]"
                      style={{ background: badge.bg, width: cfg.treeIconSize, height: cfg.treeIconSize }}
                    >
                      <DirIcon size={cfg.treeIconSize - 6} strokeWidth={2.4} style={{ color: badge.fg }} />
                    </span>
                  ) : DirIcon ? (
                    // 与文件夹图标共用 16px 宽的一格，文字列才能跨行对齐
                    <span className="flex shrink-0 justify-center" style={{ width: cfg.treeIconSize }}>
                      <DirIcon size={cfg.treeIconSize - 1} className="text-[var(--tree-icon)] opacity-60" />
                    </span>
                  ) : isExpanded ? (
                    <FolderOpenFrontLinearIcon size={cfg.treeIconSize} className="shrink-0 text-[var(--tree-icon)] opacity-60" />
                  ) : (
                    <Folder2LinearIcon size={cfg.treeIconSize} className="shrink-0 text-[var(--tree-icon)] opacity-60" />
                  )}
                  <span className="min-w-0 truncate">{node.name}</span>
                </button>
              </div>
              {expandable && isExpanded && node.children && (
                <FileTreeView
                  nodes={node.children}
                  expanded={expanded}
                  onToggleDir={onToggleDir}
                  onOpenFile={onOpenFile}
                  onOpenDir={onOpenDir}
                  // 文件夹内部一律按文件夹语义渲染（可继续展开）
                  showDirChildren
                  canExpandDir={canExpandDir}
                  defaultExpanded={defaultExpanded}
                  rowBleedLeft={rowBleedLeft}
                  roundedRows={roundedRows}
                  depth={depth + 1}
                  parentPath={path}
                  iconFor={iconFor}
                  badgeFor={badgeFor}
                  isActive={isActive}
                />
              )}
            </div>
          )
        }
        const Icon = iconFor?.(node, path, depth) ?? getFileIcon(node.name)
        const leafBadge = badgeFor?.(node, path, depth)
        return (
          <button
            key={path}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onOpenFile(node.name, path, node)}
            className={`box-border flex w-full items-center py-1 text-left transition-colors ${
              roundedRows ? 'rounded-[8px]' : ''
            } ${
              active
                ? 'bg-[var(--tree-active)] text-[var(--tree-ink)]'
                : 'text-[var(--tree-ink-dim)] hover:bg-[var(--tree-hover)] hover:text-[var(--tree-ink-hover)]'
            }`}
            style={rowStyle}
          >
            {/* 叶子行的空箭头槽 — 与同级文件夹的图标对齐（macOS/Finder 的
                做法）。整棵树都不可展开（纯模块列表）时不留槽。 */}
            {(showDirChildren || canExpandDir) && (
              <span
                aria-hidden
                className={`shrink-0 ${
                  cfg.treeDisclosurePosition === 'right' ? 'order-last ml-auto' : ''
                }`}
                style={{ width: cfg.treeSlot }}
              />
            )}
            <span className="flex min-w-0 flex-1 items-center" style={{ gap: cfg.treeGap }}>
              {leafBadge ? (
                <span
                  className="flex shrink-0 items-center justify-center rounded-[4px]"
                  style={{ background: leafBadge.bg, width: cfg.treeIconSize, height: cfg.treeIconSize }}
                >
                  <Icon size={cfg.treeIconSize - 6} strokeWidth={2.4} style={{ color: leafBadge.fg }} />
                </span>
              ) : (
                // 文件图标比文件夹小 2px，但占同样宽的一格 —— 否则同级的
                // 文件与文件夹文字会差 2px。
                <span className="flex shrink-0 justify-center" style={{ width: cfg.treeIconSize }}>
                  <Icon
                    size={cfg.treeIconSize - 2}
                    className={`text-[var(--tree-icon)] ${active ? 'opacity-80' : 'opacity-55'}`}
                  />
                </span>
              )}
              <span className="min-w-0 truncate">{node.name}</span>
            </span>
          </button>
        )
      })}
    </>
  )
}
