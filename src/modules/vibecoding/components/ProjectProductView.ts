/* ─── Project "product view" mapping ───
 *
 * The left-sidebar project list expands each project into a raw developer
 * file tree (src/ pages/ components/ services/ store/ …). That vocabulary
 * is opaque to non-technical ("小白") users. `buildProductView` re-buckets
 * a project's tree into a small set of plain-language *product* categories
 * — driven by the project's `ProjectKind`.
 *
 * The categories are emitted as synthetic `dir` FileNodes so the existing
 * `FileTreeView` component can render them with zero structural changes.
 * Leaf nodes are reused by reference, preserving their original `name` so
 * clicking still resolves the right file. Empty categories are omitted.
 */
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  FileSearch,
  FileText,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  LayoutGrid,
  Library,
  ScrollText,
  Settings,
  Sparkles,
  SquareUser,
  UsersRound,
  Zap,
} from 'lucide-react'
import type { AvatarAppConfig } from './AvatarConfigData'
import type { MiniProgramConfig } from './MiniProgramConfigData'

/** A node in a project file tree. Shared with VibeCodingPage. */
export type FileNode = {
  name: string
  type: 'file' | 'dir'
  children?: FileNode[]
}

/** The concrete product / case a platform project represents. Drives both
 *  the right-side preview shape and the product-view bucketing here.
 *  `web-app` is a React/Vite frontend project — structurally like a
 *  mini-program, previewed in a browser frame instead of a phone. */
export type ProjectKind =
  | 'mini-program'
  | 'ai-avatar'
  | 'ops-proposal'
  | 'web-app'
  | 'web-game'
  | 'marketing-h5'

/** A page of an app-like project — surfaced in the product view's 页面
 *  category. `label` is the user-facing route name (also the route id the
 *  preview navigates by); `dir` is the source folder under src/pages. */
export interface ProductPage {
  dir: string
  label: string
}

/** Web-app route metadata — label + URL path (shown in the address bar).
 *  The label matches the page-leaf names the product view produces. */
export interface WebPage {
  label: string
  path: string
}

export const WEB_PAGES: WebPage[] = [
  { label: '首页', path: '' },
  { label: '作品', path: '/works' },
  { label: '关于', path: '/about' },
  { label: '联系', path: '/contact' },
]

/** Plain-language label for each src/pages folder, by project kind.
 *  Folders not listed fall back to their raw dir name. */
const PAGE_LABELS: Record<string, string> = {
  // web-app — 个人作品集网站
  Home: '首页',
  Works: '作品',
  About: '关于',
  Contact: '联系',
  // mini-program — 第五人格塔罗小程序
  index: '首页',
  chat: '聊天',
  profile: '个人',
  tarot: '塔罗',
}

/** Node-name → lucide icon. `FileTreeView` resolves a synthetic category
 *  dir's icon (and page-leaf icons) through this map via its `iconFor`
 *  prop; names not present here fall back to the folder / file icon. */
export const PRODUCT_CATEGORY_ICONS: Record<string, LucideIcon> = {
  界面: LayoutGrid,
  素材图片: ImageIcon,
  能力技能: Sparkles,
  人设: SquareUser,
  基础信息: Info,
  人设指令: ScrollText,
  技能: Sparkles,
  知识库: Library,
  触发器: Zap,
  // mini-program sections
  智能体: Bot,
  小程序设置: Settings,
  静态素材: ImageIcon,
  // ops-proposal sections
  诊断分析: FileSearch,
  达人包: UsersRound,
  报告: FileText,
  看板: LayoutDashboard,
  // page leaves (children of 界面) are iconed by path in the consumer.
}

/* ─── tree-walk helpers ─── */

/** Resolve a nested dir by name path, e.g. `dirAt(tree, ['src', 'pages'])`.
 *  Returns undefined if any segment is missing. */
function dirAt(nodes: FileNode[], path: string[]): FileNode | undefined {
  let level = nodes
  let cur: FileNode | undefined
  for (const seg of path) {
    cur = level.find((n) => n.type === 'dir' && n.name === seg)
    if (!cur) return undefined
    level = cur.children ?? []
  }
  return cur
}

/** Children of a nested dir, or [] when the dir is absent. */
function childrenAt(nodes: FileNode[], path: string[]): FileNode[] {
  return dirAt(nodes, path)?.children ?? []
}

/** Pick top-level files by exact name, preserving the requested order. */
function filesByName(nodes: FileNode[], names: string[]): FileNode[] {
  return names
    .map((n) => nodes.find((x) => x.type === 'file' && x.name === n))
    .filter((x): x is FileNode => x != null)
}

/** Wrap collected nodes into a synthetic category dir — or null when the
 *  category collected nothing (empty categories are hidden). */
function category(name: string, children: FileNode[]): FileNode | null {
  return children.length > 0
    ? { name, type: 'dir', children }
    : null
}

/** The pages of an app-like project, read from src/pages/* folders.
 *  Used both to build the 页面 category and to recognise page-node
 *  clicks (each page label drives the preview route). */
export function getProductPages(tree: FileNode[]): ProductPage[] {
  return childrenAt(tree, ['src', 'pages'])
    .filter((n) => n.type === 'dir')
    .map((n) => ({ dir: n.name, label: PAGE_LABELS[n.name] ?? n.name }))
}

/* ─── per-kind bucketing ─── */

/** Shared bucketing for "app-like" kinds (mini-program / web-app). The
 *  dev-facing categories (配置 / 代码文件) are deliberately dropped — they
 *  stay in the file view. Pages are listed under a 页面 category, one leaf
 *  per route; clicking a leaf navigates the preview to that page.
 *  `assetsPath` differs by kind (mini-program keeps assets under src/,
 *  web projects under public/). */
function appLikeView(tree: FileNode[], assetsPath: string[]): FileNode[] {
  const pages = getProductPages(tree)
  return [
    pages.length > 0
      ? ({
          name: '界面',
          type: 'dir',
          children: pages.map((p) => ({ name: p.label, type: 'file' as const })),
        } as FileNode)
      : null,
    category('素材图片', childrenAt(tree, assetsPath)),
    category('能力技能', childrenAt(tree, ['.agent', 'skills'])),
  ].filter((c): c is FileNode => c != null)
}

function aiAvatarView(tree: FileNode[]): FileNode[] {
  const agent = dirAt(tree, ['.agent'])
  const skills = [
    ...childrenAt(tree, ['.agent', 'skills']),
    // .agent/manifest.json has no natural plain-language home — fold it in
    // beside the skills so nothing silently disappears.
    ...(agent ? filesByName(agent.children ?? [], ['manifest.json']) : []),
  ]

  return [
    category('人设', filesByName(tree, ['persona.yaml', 'greeting.md', 'voice-guide.md'])),
    category('能力技能', skills),
    category('知识库', childrenAt(tree, ['knowledge'])),
    category('触发器', childrenAt(tree, ['triggers'])),
  ].filter((c): c is FileNode => c != null)
}

function opsProposalView(tree: FileNode[]): FileNode[] {
  return [
    category('诊断分析', childrenAt(tree, ['briefs'])),
    category('达人包', childrenAt(tree, ['configs'])),
    category('报告', childrenAt(tree, ['reports'])),
    category('看板', childrenAt(tree, ['dashboards'])),
  ].filter((c): c is FileNode => c != null)
}

/** Re-bucket a project's raw file tree into plain-language product
 *  categories. Returns [] when nothing maps in — callers should keep the
 *  "暂无文件" placeholder in that case. */
export function buildProductView(
  tree: FileNode[],
  kind: ProjectKind,
): FileNode[] {
  switch (kind) {
    case 'mini-program':
      return appLikeView(tree, ['src', 'assets'])
    case 'web-app':
      return appLikeView(tree, ['public', 'assets'])
    case 'web-game':
      // Two clickable leaves — no expansion. 游戏预览 jumps the right
      // pane to the runnable game tab; 素材 jumps to the assets browser.
      // The raw README / LICENSE / source files don't surface here.
      return [
        { name: '游戏预览', type: 'file' },
        { name: '素材', type: 'file' },
      ]
    case 'marketing-h5':
      // H5 活动页 — 子产物按用户矩阵展平为四条 leaf。
      return [
        { name: '项目文档', type: 'file' },
        { name: '活动素材', type: 'file' },
        { name: '活动玩法', type: 'file' },
        { name: '代码配置文件', type: 'file' },
      ]
    case 'ai-avatar':
      return aiAvatarView(tree)
    case 'ops-proposal':
      return opsProposalView(tree)
    default:
      return []
  }
}

/** Build the ai-avatar product view from its app config — five plain
 *  sections: 基础信息 / 人设指令 / 知识库 / 技能 / 触发器. 基础信息 and
 *  人设指令 are single leaves (open a form / doc); 知识库 and 技能 are
 *  categories whose leaves are the config's referenced items; 触发器
 *  children still come from the tree's triggers/ folder. Falls back to
 *  the file-tree bucketing when no config is available. */
export function buildAvatarProductView(
  tree: FileNode[],
  config: AvatarAppConfig | undefined,
): FileNode[] {
  if (!config) return aiAvatarView(tree)
  const out: FileNode[] = [
    { name: '基础信息', type: 'file' },
    { name: '人设指令', type: 'file' },
  ]
  const knowledge = config.knowledgeInfoList.map(
    (k): FileNode => ({ name: k.name, type: 'file' }),
  )
  if (knowledge.length > 0) {
    out.push({ name: '知识库', type: 'dir', children: knowledge })
  }
  const skills = [...config.skillInfoList, ...config.toolInfoList].map(
    (s): FileNode => ({ name: s.name, type: 'file' }),
  )
  if (skills.length > 0) {
    out.push({ name: '技能', type: 'dir', children: skills })
  }
  const triggers = childrenAt(tree, ['triggers'])
  if (triggers.length > 0) {
    out.push({ name: '触发器', type: 'dir', children: triggers })
  }
  return out
}

/** Build the mini-program product view — four plain sections: 智能体 /
 *  小程序设置 / 界面 / 静态素材. 智能体 / 小程序设置 / 静态素材 are single
 *  leaves (open agent / settings / asset-grid views); 界面 is a category
 *  whose leaves are the src/pages routes. Falls back to the file-tree
 *  bucketing when no config is available. */
export function buildMiniProgramProductView(
  tree: FileNode[],
  config: MiniProgramConfig | undefined,
): FileNode[] {
  if (!config) return appLikeView(tree, ['src', 'assets'])
  const out: FileNode[] = [
    { name: '智能体', type: 'file' },
    { name: '小程序设置', type: 'file' },
  ]
  const pages = getProductPages(tree)
  if (pages.length > 0) {
    out.push({
      name: '界面',
      type: 'dir',
      children: pages.map((p) => ({ name: p.label, type: 'file' as const })),
    })
  }
  if (config.assets.length > 0) {
    out.push({ name: '静态素材', type: 'file' })
  }
  return out
}
