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
import { AppWindowLinearIcon } from 'master-icon/react/AppWindowLinearIcon'
import { BotLinearIcon } from 'master-icon/react/BotLinearIcon'
import { BrowserLinearIcon } from 'master-icon/react/BrowserLinearIcon'
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
export const ACTIVITY_ASSETS_LABEL = '交付物'
export const FINISHED_PAGES_LABEL = '页面'
export const H5_GAMEPLAY_CONFIG_LABEL = '玩法配置'
export const GAME_GAMEPLAY_CONFIG_LABEL = '游戏玩法配置'
export const GAME_ASSET_LIBRARY_LABEL = '游戏资产库'
export const GAME_UI_CONFIG_LABEL = '游戏 UI'
export const GAME_BALANCE_CONFIG_LABEL = '平衡性编辑'
const TOWER_DEFENSE_PROJECT_NAME = '暮光防线'
export const INTEREST_CARD_CONFIG_LABEL = '兴趣卡配置'
export const PROJECT_MEMORY_LABEL = '项目记忆'
/** 纯设计资产项目没有可运行页面：项目树与顶部 Tab 只展示任务文档和素材库。 */
export const XINZAI_IP_ASSET_PROJECT = '心仔城市生活季 · IP 素材包'
export const JINGXIN_LIVESTREAM_ASSET_PROJECT = '静心采耳馆 · 直播间贴片'
export const LIFE_SERVICE_RESOURCE_POSITION_PROJECT = '生活服务热点 · 资源位周更'
export const MAGICX_HEADER_ASSET_PROJECT = '城市灵感 · 活动头图提案'

export const ASSET_ONLY_PROJECTS = [
  '生服热点 Banner',
  XINZAI_IP_ASSET_PROJECT,
  JINGXIN_LIVESTREAM_ASSET_PROJECT,
  LIFE_SERVICE_RESOURCE_POSITION_PROJECT,
  MAGICX_HEADER_ASSET_PROJECT,
] as const

export function isAssetOnlyProject(projectName?: string): boolean {
  return Boolean(
    projectName &&
      (ASSET_ONLY_PROJECTS as readonly string[]).includes(projectName),
  )
}
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
  [FINISHED_PAGES_LABEL]: AppWindowLinearIcon,
  素材: Image01LinearIcon,
  [ASSET_LIBRARY_LABEL]: Image01LinearIcon,
  [ACTIVITY_ASSETS_LABEL]: LayoutGrid1LinearIcon,
  代码: FileCodeLinearIcon,
  // 「项目文件」是四级分类里唯一的「文件夹」，不给分类图标 —— 交给
  // FileTreeView 兜底成文件夹图标（展开/收起两态），与内部目录一致。
  数据库: Database01LinearIcon,
  [INTEREST_CARD_CONFIG_LABEL]: Database01LinearIcon,
  [DATA_CONFIG_LABEL]: Database01LinearIcon,
  玩法: GameController01LinearIcon,
  [H5_GAMEPLAY_CONFIG_LABEL]: Settings01LinearIcon,
  [GAME_GAMEPLAY_CONFIG_LABEL]: Settings01LinearIcon,
  [GAME_ASSET_LIBRARY_LABEL]: Image01LinearIcon,
  [GAME_UI_CONFIG_LABEL]: LayoutGrid1LinearIcon,
  [GAME_BALANCE_CONFIG_LABEL]: Analytics01LinearIcon,
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

/** 项目交付目录里的叶子不是“文件名”，而是不同运行 Surface / 物料类型。
 *  统一在这里解析，保证侧栏、顶部 Tab 和下拉目录使用同一套类型图标。 */
export function getDeliverableIcon(label: string): LucideIcon | undefined {
  const normalized = label.trim()
  if (normalized === FINISHED_PAGES_LABEL) return AppWindowLinearIcon
  if (normalized === '交付总览') return LayoutGrid1LinearIcon
  if (/^Lynx\b/i.test(normalized) || /^(原生|直播间)\s*·/.test(normalized))
    return AppWindowLinearIcon
  if (/^H5\b/i.test(normalized)) return BrowserLinearIcon
  if (/文档|方案|复盘/.test(normalized)) return FileTextLinearIcon
  if (/资源位|玩法视觉|节目单|活动战报|开屏|线下屏|商业中心|海报|Banner|长图|横卡|图片|画布/i.test(normalized))
    return Image01LinearIcon
  return undefined
}

/** 关键节点的彩色图标底板。数据库 / 小程序配置 / 记忆跟随统一导航
 *  579-57535；其余业务节点继续使用各自的 Semi light-1 tint。 */
export const PRODUCT_CATEGORY_BADGES: Record<string, { bg: string; fg: string }> = {
  预览: { bg: '#e0ecff', fg: '#3370ff' },
  [FINISHED_PAGES_LABEL]: { bg: '#e0ecff', fg: '#3370ff' },
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
  [DATABASE_LABEL]: { bg: '#c4f0e7', fg: '#0eb39c' },
  [INTEREST_CARD_CONFIG_LABEL]: { bg: '#d9f4f4', fg: '#0e9c9c' },
  [DATA_CONFIG_LABEL]: { bg: '#dcf5e8', fg: '#18a058' },
  文档: { bg: '#e3e6f7', fg: '#4b55bd' },
  项目文档: { bg: '#e3e6f7', fg: '#4b55bd' },
  素材: { bg: '#fde6f7', fg: '#d939b8' },
  [ASSET_LIBRARY_LABEL]: { bg: '#fde6f7', fg: '#d939b8' },
  [ACTIVITY_ASSETS_LABEL]: { bg: '#e0ecff', fg: '#3370ff' },
  代码: { bg: '#d1d6f0', fg: '#4b55bd' },
  // 「项目文件」走文件夹图标，不加彩色底板（见 PRODUCT_CATEGORY_ICONS）
  玩法: { bg: '#fde2e2', fg: '#e5484d' },
  [H5_GAMEPLAY_CONFIG_LABEL]: { bg: '#dcf5e8', fg: '#18a058' },
  [GAME_GAMEPLAY_CONFIG_LABEL]: { bg: '#dcf5e8', fg: '#18a058' },
  [GAME_ASSET_LIBRARY_LABEL]: { bg: '#fde6f7', fg: '#d939b8' },
  [GAME_UI_CONFIG_LABEL]: { bg: '#e0ecff', fg: '#3370ff' },
  [GAME_BALANCE_CONFIG_LABEL]: { bg: '#fdf3ce', fg: '#c29104' },
  智能体: { bg: '#d9f4f4', fg: '#0e9c9c' },
  小程序设置: { bg: '#d0f0d1', fg: '#3eb346' },
  小程序配置: { bg: '#d0f0d1', fg: '#3eb346' },
  [PROJECT_MEMORY_LABEL]: { bg: '#dcd4f3', fg: '#6d45c5' },
  记忆: { bg: '#dcd4f3', fg: '#6d45c5' },
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
function gameView(tree: FileNode[], projectName?: string): FileNode[] {
  if (projectName === TOWER_DEFENSE_PROJECT_NAME) {
    return [
      { name: FINISHED_PAGES_LABEL, type: 'file' },
      { name: GAME_GAMEPLAY_CONFIG_LABEL, type: 'file' },
      { name: GAME_ASSET_LIBRARY_LABEL, type: 'file' },
      { name: GAME_UI_CONFIG_LABEL, type: 'file' },
      { name: GAME_BALANCE_CONFIG_LABEL, type: 'file' },
      { name: '项目文件', type: 'dir', children: tree },
    ]
  }
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
  projectName?: string,
): FileNode[] {
  switch (kind) {
    case 'mini-program':
      return buildMiniProgramProductView(tree, undefined)
    case 'web-app':
      return webAppView(tree)
    case 'web-game':
      return gameView(tree, projectName)
    case 'marketing-h5': {
      // 项目名进入最终预览；「页面」是页面产物的管理与编辑入口。
      // 图片、资源位和传播物料继续统一在素材库管理。
      void tree
      if (isAssetOnlyProject(projectName)) {
        return [
          { name: PROJECT_DOCUMENT_LABEL, type: 'file' },
          { name: ASSET_LIBRARY_LABEL, type: 'file' },
        ]
      }
      return [
        { name: FINISHED_PAGES_LABEL, type: 'file' },
        { name: PROJECT_DOCUMENT_LABEL, type: 'file' },
        { name: H5_GAMEPLAY_CONFIG_LABEL, type: 'file' },
        { name: ASSET_LIBRARY_LABEL, type: 'file' },
      ]
    }
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
