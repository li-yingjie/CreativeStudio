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
import type { LucideIcon } from '@/shared/icons'
/* 产物树图标统一走 MasterIcon（与左侧栏菜单同一套字形）。 */
import { Analytics01LinearIcon } from 'master-icon/react/Analytics01LinearIcon'
import { BotLinearIcon } from 'master-icon/react/BotLinearIcon'
import { BulbLinearIcon } from 'master-icon/react/BulbLinearIcon'
import { Database01LinearIcon } from 'master-icon/react/Database01LinearIcon'
import { EyeOpenLinearIcon } from 'master-icon/react/EyeOpenLinearIcon'
import { InformationCircleLinearIcon } from 'master-icon/react/InformationCircleLinearIcon'
import { FileCodeLinearIcon } from 'master-icon/react/FileCodeLinearIcon'
import { FileSearchLinearIcon } from 'master-icon/react/FileSearchLinearIcon'
import { FileTextLinearIcon } from 'master-icon/react/FileTextLinearIcon'
import { MagicWand01LinearIcon } from 'master-icon/react/MagicWand01LinearIcon'
import { GameController01LinearIcon } from 'master-icon/react/GameController01LinearIcon'
import { Image01LinearIcon } from 'master-icon/react/Image01LinearIcon'
import { LayoutGrid1LinearIcon } from 'master-icon/react/LayoutGrid1LinearIcon'
import { LightningLinearIcon } from 'master-icon/react/LightningLinearIcon'
import { Notebook01LinearIcon } from 'master-icon/react/Notebook01LinearIcon'
import { Scroll01LinearIcon } from 'master-icon/react/Scroll01LinearIcon'
import { Settings01LinearIcon } from 'master-icon/react/Settings01LinearIcon'
import { UserMultipleLinearIcon } from 'master-icon/react/UserMultipleLinearIcon'
import { UserSettings01LinearIcon } from 'master-icon/react/UserSettings01LinearIcon'
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

/** Shared product-tree labels. They are also consumed by tab routing so
 *  directory copy and interaction logic cannot drift apart. */
export const BASIC_INFO_LABEL = '基础信息'
export const PROJECT_DOCUMENT_LABEL = '项目文档'
export const PERSONA_CONFIG_LABEL = '人设配置'
export const ABILITY_CONFIG_LABEL = '能力配置'
export const PAGE_CONFIG_LABEL = '页面配置'
export const DATA_CONFIG_LABEL = '数据配置'
export const GAMEPLAY_CONFIG_LABEL = '玩法配置'
export const TRIGGER_CONFIG_LABEL = '触发器配置'
export const ASSET_LIBRARY_LABEL = '素材库'
export const DATABASE_LABEL = '数据库'
export const H5_GAMEPLAY_CONFIG_LABEL = '活动玩法配置'
export const GAME_GAMEPLAY_CONFIG_LABEL = '游戏玩法配置'
export const INTEREST_CARD_CONFIG_LABEL = '兴趣卡配置'
export const PROJECT_MEMORY_LABEL = '项目记忆'
/** AI 分身用自己的一套模块名，与左侧栏入口一字不差（技能库 / 触发器）。 */
export const AVATAR_SKILL_LABEL = '技能库'
export const AVATAR_TRIGGER_LABEL = '触发器'

/** A page of an app-like project — surfaced in the product view's 页面配置
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
  // web-app — 抖音 AI 工坊设计探索
  Home: '首页',
  Works: '作品',
  About: '关于',
  Contact: '联系',
  // mini-program — 塔罗兴趣卡
  index: '首页',
  chat: '聊天',
  profile: '个人',
  tarot: '塔罗',
}

/** Node-name → lucide icon. `FileTreeView` resolves a synthetic category
 *  dir's icon (and page-leaf icons) through this map via its `iconFor`
 *  prop; names not present here fall back to the folder / file icon. */
export const PRODUCT_CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Every project surfaces a 项目文档 (project brief) leaf.
  项目文档: FileTextLinearIcon,
  文档: FileTextLinearIcon,
  界面: LayoutGrid1LinearIcon,
  [PAGE_CONFIG_LABEL]: LayoutGrid1LinearIcon,
  // The primary 预览 tab — content varies by kind, one shared icon.
  预览: EyeOpenLinearIcon,
  素材: Image01LinearIcon,
  [ASSET_LIBRARY_LABEL]: Image01LinearIcon,
  代码: FileCodeLinearIcon,
  // 「项目文件」是四级分类里唯一的「文件夹」，不给分类图标 —— 交给
  // FileTreeView 兜底成文件夹图标（展开/收起两态），与内部目录一致。
  数据库: Database01LinearIcon,
  [INTEREST_CARD_CONFIG_LABEL]: Database01LinearIcon,
  [DATA_CONFIG_LABEL]: Database01LinearIcon,
  玩法: GameController01LinearIcon,
  [GAMEPLAY_CONFIG_LABEL]: GameController01LinearIcon,
  [H5_GAMEPLAY_CONFIG_LABEL]: Settings01LinearIcon,
  [GAME_GAMEPLAY_CONFIG_LABEL]: Settings01LinearIcon,
  能力技能: MagicWand01LinearIcon,
  人设: UserSettings01LinearIcon,
  [PERSONA_CONFIG_LABEL]: UserSettings01LinearIcon,
  [BASIC_INFO_LABEL]: InformationCircleLinearIcon,
  人设指令: Scroll01LinearIcon,
  技能: MagicWand01LinearIcon,
  [ABILITY_CONFIG_LABEL]: MagicWand01LinearIcon,
  [AVATAR_SKILL_LABEL]: MagicWand01LinearIcon,
  [AVATAR_TRIGGER_LABEL]: LightningLinearIcon,
  知识库: Notebook01LinearIcon,
  [TRIGGER_CONFIG_LABEL]: LightningLinearIcon,
  // mini-program sections
  智能体: BotLinearIcon,
  小程序设置: Settings01LinearIcon,
  [PROJECT_MEMORY_LABEL]: BulbLinearIcon,
  // ops-proposal sections
  诊断分析: FileSearchLinearIcon,
  达人包: UserMultipleLinearIcon,
  报告: FileTextLinearIcon,
  看板: Analytics01LinearIcon,
  // page leaves (children of 界面) are iconed by path in the consumer.
}

/** 关键节点的彩色图标底板（设计稿 WoW-26 661-99330）：14px 圆角 4 的
 *  浅色 tint + 同色系饱和图标。只上到产品树的一级节点；子级叶子保持
 *  单色。色值参照 Semi Design 的 light-1 tint 系。 */
export const PRODUCT_CATEGORY_BADGES: Record<string, { bg: string; fg: string }> = {
  预览: { bg: '#e0ecff', fg: '#3370ff' },
  [PAGE_CONFIG_LABEL]: { bg: '#e0ecff', fg: '#3370ff' },
  界面: { bg: '#e0ecff', fg: '#3370ff' },
  [BASIC_INFO_LABEL]: { bg: '#d9f4f4', fg: '#0e9c9c' },
  人设: { bg: '#fde6ee', fg: '#e5457a' },
  [PERSONA_CONFIG_LABEL]: { bg: '#fde6ee', fg: '#e5457a' },
  人设指令: { bg: '#fde6ee', fg: '#e5457a' },
  技能: { bg: '#f1e6fe', fg: '#8f47e6' },
  [ABILITY_CONFIG_LABEL]: { bg: '#f1e6fe', fg: '#8f47e6' },
  能力技能: { bg: '#f1e6fe', fg: '#8f47e6' },
  知识库: { bg: '#fde6f7', fg: '#d939b8' },
  [TRIGGER_CONFIG_LABEL]: { bg: '#feeecf', fg: '#ff8800' },
  [AVATAR_SKILL_LABEL]: { bg: '#fde6f7', fg: '#d939b8' },
  [AVATAR_TRIGGER_LABEL]: { bg: '#feeecf', fg: '#ff8800' },
  [DATABASE_LABEL]: { bg: '#d9f4f4', fg: '#0e9c9c' },
  [INTEREST_CARD_CONFIG_LABEL]: { bg: '#d9f4f4', fg: '#0e9c9c' },
  [DATA_CONFIG_LABEL]: { bg: '#dcf5e8', fg: '#18a058' },
  文档: { bg: '#e3e6f7', fg: '#4b55bd' },
  项目文档: { bg: '#e3e6f7', fg: '#4b55bd' },
  素材: { bg: '#fde6f7', fg: '#d939b8' },
  [ASSET_LIBRARY_LABEL]: { bg: '#fde6f7', fg: '#d939b8' },
  代码: { bg: '#d1d6f0', fg: '#4b55bd' },
  // 「项目文件」走文件夹图标，不加彩色底板（见 PRODUCT_CATEGORY_ICONS）
  玩法: { bg: '#fde2e2', fg: '#e5484d' },
  [GAMEPLAY_CONFIG_LABEL]: { bg: '#fde2e2', fg: '#e5484d' },
  [H5_GAMEPLAY_CONFIG_LABEL]: { bg: '#dcf5e8', fg: '#18a058' },
  [GAME_GAMEPLAY_CONFIG_LABEL]: { bg: '#dcf5e8', fg: '#18a058' },
  智能体: { bg: '#d9f4f4', fg: '#0e9c9c' },
  小程序设置: { bg: '#e8eaed', fg: '#5f6673' },
  [PROJECT_MEMORY_LABEL]: { bg: '#ece4ff', fg: '#7c4dca' },
  诊断分析: { bg: '#d7f2ef', fg: '#0d9e8f' },
  达人包: { bg: '#f1e6fe', fg: '#8f47e6' },
  报告: { bg: '#e0ecff', fg: '#3370ff' },
  看板: { bg: '#fdf3ce', fg: '#c29104' },
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
 *  Used both to build the 页面配置 category and to recognise page-node
 *  clicks (each page label drives the preview route). */
export function getProductPages(tree: FileNode[]): ProductPage[] {
  return childrenAt(tree, ['src', 'pages'])
    .filter((n) => n.type === 'dir')
    .map((n) => ({ dir: n.name, label: PAGE_LABELS[n.name] ?? n.name }))
}

/* ─── per-kind bucketing ─── */

/** 产品设计 (web-app): 数据配置 / 素材库 / 项目文件. */
function webAppView(tree: FileNode[]): FileNode[] {
  return [
    { name: DATA_CONFIG_LABEL, type: 'file' as const },
    { name: ASSET_LIBRARY_LABEL, type: 'file' as const },
    { name: '项目文件', type: 'dir' as const, children: tree },
  ]
}

/** 游戏 (web-game): 项目文档（含基础信息）/ 素材库 /
 *  游戏玩法配置 / 数据库 / 项目文件. */
function gameView(tree: FileNode[]): FileNode[] {
  return [
    { name: PROJECT_DOCUMENT_LABEL, type: 'file' },
    { name: ASSET_LIBRARY_LABEL, type: 'file' },
    { name: GAME_GAMEPLAY_CONFIG_LABEL, type: 'file' },
    { name: DATABASE_LABEL, type: 'file' },
    { name: '项目文件', type: 'dir', children: tree },
  ]
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
    { name: PERSONA_CONFIG_LABEL, type: 'file' },
    category(ABILITY_CONFIG_LABEL, skills),
    category('知识库', childrenAt(tree, ['knowledge'])),
    category(TRIGGER_CONFIG_LABEL, childrenAt(tree, ['triggers'])),
    { name: '项目文件', type: 'dir', children: tree },
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
      return buildMiniProgramProductView(tree, undefined)
    case 'web-app':
      return webAppView(tree)
    case 'web-game':
      return gameView(tree)
    case 'marketing-h5':
      // H5 活动页: 项目文档（含基础信息）/ 素材库 /
      // 活动玩法配置 / 数据库 / 项目文件。
      return [
        { name: PROJECT_DOCUMENT_LABEL, type: 'file' },
        { name: ASSET_LIBRARY_LABEL, type: 'file' },
        { name: H5_GAMEPLAY_CONFIG_LABEL, type: 'file' },
        { name: DATABASE_LABEL, type: 'file' },
        { name: '项目文件', type: 'dir', children: tree },
      ]
    case 'ai-avatar':
      return aiAvatarView(tree)
    case 'ops-proposal':
      return opsProposalView(tree)
    default:
      return []
  }
}

/** Build the ai-avatar product view from its app config — 人设配置 /
 *  能力配置 / 知识库 / 触发器配置 / 项目文件. */
export function buildAvatarProductView(
  tree: FileNode[],
  config: AvatarAppConfig | undefined,
): FileNode[] {
  if (!config) return aiAvatarView(tree)
  // 人设配置 edits the prompt; the underlying persona.yaml remains available
  // from 项目文件 for developers.
  const out: FileNode[] = [{ name: PERSONA_CONFIG_LABEL, type: 'file' }]
  const skills = [...config.skillInfoList, ...config.toolInfoList].map(
    (s): FileNode => ({ name: s.name, type: 'file' }),
  )
  if (skills.length > 0) {
    out.push({ name: AVATAR_SKILL_LABEL, type: 'dir', children: skills })
  }
  const knowledge = config.knowledgeInfoList.map(
    (k): FileNode => ({ name: k.name, type: 'file' }),
  )
  if (knowledge.length > 0) {
    out.push({ name: '知识库', type: 'dir', children: knowledge })
  }
  const triggers = childrenAt(tree, ['triggers'])
  if (triggers.length > 0) {
    out.push({ name: AVATAR_TRIGGER_LABEL, type: 'dir', children: triggers })
  }
  out.push({ name: '项目文件', type: 'dir', children: tree })
  return out
}

/** Build the mini-program product view — 项目文档（含基础信息）/ 素材库 /
 *  兴趣卡配置 / 项目记忆 / 项目文件. */
export function buildMiniProgramProductView(
  tree: FileNode[],
  config: MiniProgramConfig | undefined,
): FileNode[] {
  void config
  return [
    { name: PROJECT_DOCUMENT_LABEL, type: 'file' as const },
    { name: ASSET_LIBRARY_LABEL, type: 'file' as const },
    { name: INTEREST_CARD_CONFIG_LABEL, type: 'file' as const },
    { name: PROJECT_MEMORY_LABEL, type: 'file' as const },
    { name: '项目文件', type: 'dir' as const, children: tree },
  ]
}
