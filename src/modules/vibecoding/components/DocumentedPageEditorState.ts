import type { DocumentedActivityCase, DocumentedActivityDeliverable } from './DocumentedActivityData'

export type PageEditorElementId = 'hero' | 'navigation' | 'content' | 'footer'
export type PageEditorSelectionId =
  | 'page'
  | 'hero'
  | 'title'
  | 'subtitle'
  | 'primaryAction'
  | 'navigation'
  | 'content'
  | 'footer'

export type PageEditorSelectionKind = 'page' | 'region' | 'text' | 'action'

export interface PageEditorNodeDefinition {
  id: PageEditorSelectionId
  label: string
  kind: PageEditorSelectionKind
  parentId: PageEditorSelectionId | null
  regionId?: PageEditorElementId
  field?: 'title' | 'subtitle' | 'cta'
  detail: string
}

export const PAGE_EDITOR_NODES: readonly PageEditorNodeDefinition[] = [
  {
    id: 'page',
    label: '页面实例',
    kind: 'page',
    parentId: null,
    detail: '运行容器、页面宽度与端能力',
  },
  {
    id: 'hero',
    label: '主视觉区',
    kind: 'region',
    parentId: 'page',
    regionId: 'hero',
    detail: '活动主题、媒体与核心行动点',
  },
  {
    id: 'title',
    label: '主标题',
    kind: 'text',
    parentId: 'hero',
    regionId: 'hero',
    field: 'title',
    detail: '页面最主要的活动标题',
  },
  {
    id: 'subtitle',
    label: '副标题',
    kind: 'text',
    parentId: 'hero',
    regionId: 'hero',
    field: 'subtitle',
    detail: '时间、卖点或补充说明',
  },
  {
    id: 'primaryAction',
    label: '主要按钮',
    kind: 'action',
    parentId: 'page',
    field: 'cta',
    detail: '当前页面的主要行动文案；所在区域由页面模板约束',
  },
  {
    id: 'navigation',
    label: '导航与入口',
    kind: 'region',
    parentId: 'page',
    regionId: 'navigation',
    detail: '会场切换、频道与页面 Tab',
  },
  {
    id: 'content',
    label: '核心内容区',
    kind: 'region',
    parentId: 'page',
    regionId: 'content',
    detail: '榜单、节目、卡池或内容列表',
  },
  {
    id: 'footer',
    label: '任务与回流区',
    kind: 'region',
    parentId: 'page',
    regionId: 'footer',
    detail: '任务、规则、分享与回流内容',
  },
] as const

export function pageEditorNode(id: PageEditorSelectionId) {
  return PAGE_EDITOR_NODES.find((node) => node.id === id) ?? PAGE_EDITOR_NODES[0]
}

export function pageEditorBreadcrumb(id: PageEditorSelectionId) {
  const labels: string[] = []
  let node: PageEditorNodeDefinition | undefined = pageEditorNode(id)
  while (node) {
    labels.unshift(node.label)
    node = node.parentId ? PAGE_EDITOR_NODES.find((candidate) => candidate.id === node?.parentId) : undefined
  }
  return labels
}
export type PageRuntimeKind = 'h5' | 'lynx' | 'native'
export type PageTitleBarMode = 'standard' | 'transparent' | 'hidden'
export type PageBackBehavior = 'close' | 'history' | 'route'

export interface DocumentedPageEditorState {
  title: string
  subtitle: string
  cta: string
  deviceWidth: number
  elements: Record<PageEditorElementId, boolean>
  surface: {
    kind: PageRuntimeKind
    route: string
    titleBar: PageTitleBarMode
    safeArea: boolean
    responsiveLayout: boolean
    stickyNavigation: boolean
    backBehavior: PageBackBehavior
  }
  gameplay: {
    packageName: string
    taskEnabled: boolean
    shareEnabled: boolean
    dailyLimit: number
  }
}

export const pageRuntimeLabel = (kind: PageRuntimeKind) =>
  kind === 'h5' ? 'H5' : kind === 'lynx' ? 'Lynx' : 'Native'

const pageRuntimeKind = (item: DocumentedActivityDeliverable): PageRuntimeKind => {
  if (item.label.startsWith('Lynx')) return 'lynx'
  if (item.label.startsWith('Native')) return 'native'
  return 'h5'
}

const PROJECT_COPY: Record<string, { title: string; subtitle: string; cta: string; gameplay: string }> = {
  'CASE-ACG-CNY-2026': {
    title: '开年高燃',
    subtitle: '游戏 × 二次元双会场',
    cta: '查看年度榜单',
    gameplay: '内容榜单 + 双动作助力',
  },
  'CASE-GALA-2026': {
    title: '上抖音 看春晚',
    subtitle: '2026 年 2 月 16 日 20:00 直播',
    cta: '进入直播会场',
    gameplay: '直播 + 节目单 + 抽奖',
  },
  'CASE-IP-CARD-2024': {
    title: '独星河小卡 · 开启快乐征途',
    subtitle: '完成任务，领取抽卡次数',
    cta: '立即抽卡',
    gameplay: '任务 + 抽卡 + 图鉴',
  },
}

const ITEM_COPY: Record<string, { title: string; subtitle: string; cta: string; gameplay: string }> = {
  'DLV-XIA-001': {
    title: '这夏夯爆了',
    subtitle: '6.30—8.31 · 夏日玩水季',
    cta: '抽夏日装备',
    gameplay: '集夏装 + 阶梯兑换',
  },
  'DLV-XIA-002': {
    title: '这夏夯爆了',
    subtitle: '6.30—8.31 · 夏日玩水季',
    cta: '抽夏日装备',
    gameplay: '集夏装 + 好友交换',
  },
  'DLV-XIA-003': {
    title: '这夏夯爆了',
    subtitle: '6.30—8.31 · 夏日玩水季',
    cta: '抽夏日装备',
    gameplay: '集夏装 + 内容承接',
  },
  'DLV-XIA-009': {
    title: '这夏夯爆了',
    subtitle: '三步玩懂夏日集卡玩法',
    cta: '开始玩',
    gameplay: '新手引导 + 集卡任务',
  },
  'DLV-XIA-011': {
    title: '夏日夜食指南',
    subtitle: '深夜食堂 × 小马 IP',
    cta: '抽夏日夜食',
    gameplay: '集夜食卡 + 阶梯兑换',
  },
  'DLV-XIA-012': {
    title: '选择一匹小马',
    subtitle: '不同角色会带来专属开场动作',
    cta: '带它出发',
    gameplay: '角色选择 + 分支进入',
  },
  'DLV-XIA-013': {
    title: 'AR 识别状态',
    subtitle: '移动镜头，把小马放到餐桌上',
    cta: '打卡拍照',
    gameplay: 'AR 识别 + 互动打卡',
  },
}

export function createDocumentedPageEditorState(
  activityCase: DocumentedActivityCase,
  item: DocumentedActivityDeliverable,
): DocumentedPageEditorState {
  const copy = ITEM_COPY[item.id] ?? PROJECT_COPY[activityCase.code] ?? {
    title: item.label,
    subtitle: item.summary,
    cta: '立即参与',
    gameplay: '基础活动玩法',
  }
  const kind = pageRuntimeKind(item)
  return {
    ...copy,
    deviceWidth: 390,
    elements: { hero: true, navigation: true, content: true, footer: true },
    surface: {
      kind,
      route: `/activity/${item.id.toLocaleLowerCase('en-US')}`,
      titleBar: kind === 'h5' ? 'hidden' : 'standard',
      safeArea: kind !== 'h5',
      responsiveLayout: kind === 'h5',
      stickyNavigation: kind === 'h5',
      backBehavior: kind === 'h5' ? 'history' : 'close',
    },
    gameplay: {
      packageName: copy.gameplay,
      taskEnabled: true,
      shareEnabled: true,
      dailyLimit: 3,
    },
  }
}
