import {
  File,
  FileCode2,
  FileCog,
  FileJson,
  FileText,
  FolderClosed,
  FolderOpen,
  Image as ImageIcon,
  Palette,
  type LucideIcon,
} from '@/shared/icons'
import type { FileNode } from './ProjectProductView'

export function getFileIcon(name: string): typeof File {
  const lower = name.toLowerCase()
  if (/\.(tsx|ts|jsx|js|mjs|cjs)$/.test(lower)) return FileCode2
  if (/\.json$/.test(lower)) return FileJson
  if (/\.(css|less|scss|sass|styl)$/.test(lower)) return Palette
  if (/\.(yaml|yml|toml|ini|env)$/.test(lower)) return FileCog
  if (/\.(md|mdx|txt)$/.test(lower)) return FileText
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/.test(lower)) return ImageIcon
  return File
}

export function FileTreeView({
  nodes,
  expanded,
  onToggleDir,
  onOpenFile,
  onOpenDir,
  showDirChildren = true,
  defaultExpanded = false,
  depth,
  parentPath,
  railStartDepth = 0,
  rowBleedLeft = 0,
  roundedRows = false,
  iconFor,
  isActive,
}: {
  nodes: FileNode[]
  expanded: Set<string>
  onToggleDir: (path: string) => void
  onOpenFile: (name: string) => void
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
  depth: number
  parentPath: string
  /** Lowest depth at which to draw an indent rail. Platform sidebar
   *  passes 1 so the outermost rail connecting files to the project
   *  header is suppressed. */
  railStartDepth?: number
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
  /** Optional leaf-active predicate — the product view uses it to
   *  highlight the page node matching the current preview route. */
  isActive?: (node: FileNode, path: string) => boolean
}) {
  // Each row carries `depth` absolutely-positioned rails — one per
  // ancestor level — so the user can trace a child back to its parent
  // folder. Rails only render for rows at depth ≥ 1 (root rows have no
  // parent to connect to), and since rows stack contiguously the rails
  // visually fuse into continuous vertical guides for each open branch.
  const renderRails = () =>
    depth === 0
      ? null
      : Array.from({ length: depth })
          .map((_, i) => i)
          .filter((i) => i >= railStartDepth)
          .map((i) => (
            <span
              key={i}
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-[var(--color-ink)]/[0.06]"
              style={{ left: 12 + i * 14 + 6 }}
            />
          ))

  return (
    <>
      {nodes.map((node) => {
        const path = parentPath ? `${parentPath}/${node.name}` : node.name
        // With defaultExpanded the set tracks collapsed paths, so flip it.
        const isExpanded = defaultExpanded ? !expanded.has(path) : expanded.has(path)
        const pl = 12 + depth * 14
        const rowStyle = rowBleedLeft
          ? { paddingLeft: pl + rowBleedLeft, marginLeft: -rowBleedLeft }
          : { paddingLeft: pl }
        if (node.type === 'dir') {
          const DirIcon = iconFor?.(node, path, depth)
          return (
            <div key={path}>
              <div className="relative">
                {renderRails()}
                <button
                  onClick={() => {
                    if (showDirChildren) onToggleDir(path)
                    onOpenDir?.(node, path)
                  }}
                  className={`box-border flex w-full items-center gap-1.5 py-1 text-[12px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/95 ${
                    roundedRows ? 'rounded-md' : ''
                  }`}
                  style={rowStyle}
                >
                  {DirIcon ? (
                    <DirIcon size={13} className="shrink-0 text-[var(--color-ink)]/60" />
                  ) : isExpanded ? (
                    <FolderOpen size={13} className="shrink-0 text-[var(--color-ink)]/60" />
                  ) : (
                    <FolderClosed size={13} className="shrink-0 text-[var(--color-ink)]/60" />
                  )}
                  {node.name}
                </button>
              </div>
              {showDirChildren && isExpanded && node.children && (
                <FileTreeView
                  nodes={node.children}
                  expanded={expanded}
                  onToggleDir={onToggleDir}
                  onOpenFile={onOpenFile}
                  onOpenDir={onOpenDir}
                  showDirChildren={showDirChildren}
                  defaultExpanded={defaultExpanded}
                  rowBleedLeft={rowBleedLeft}
                  roundedRows={roundedRows}
                  depth={depth + 1}
                  parentPath={path}
                  railStartDepth={railStartDepth}
                  iconFor={iconFor}
                  isActive={isActive}
                />
              )}
            </div>
          )
        }
        const Icon = iconFor?.(node, path, depth) ?? getFileIcon(node.name)
        const active = isActive?.(node, path) ?? false
        return (
          <div key={path} className="relative">
            {renderRails()}
            <button
              onClick={() => onOpenFile(node.name)}
              className={`box-border flex w-full items-center gap-1.5 py-1 text-[12px] transition-colors ${
                roundedRows ? 'rounded-md' : ''
              } ${
                active
                  ? 'bg-[var(--color-ink)]/[0.07] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/75 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/95'
              }`}
              style={rowStyle}
            >
              <Icon
                size={12}
                className={`shrink-0 ${active ? 'text-[var(--color-ink)]/80' : 'text-[var(--color-ink)]/55'}`}
              />
              {node.name}
            </button>
          </div>
        )
      })}
    </>
  )
}
