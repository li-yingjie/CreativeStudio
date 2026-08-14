import type { DocumentedActivityCase, DocumentedActivityDeliverable } from './DocumentedActivityData'

export type PageEditorElementId = 'hero' | 'navigation' | 'content' | 'footer'

export interface DocumentedPageEditorState {
  title: string
  subtitle: string
  cta: string
  deviceWidth: number
  elements: Record<PageEditorElementId, boolean>
  gameplay: {
    packageName: string
    taskEnabled: boolean
    shareEnabled: boolean
    dailyLimit: number
  }
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

export function createDocumentedPageEditorState(
  activityCase: DocumentedActivityCase,
  item: DocumentedActivityDeliverable,
): DocumentedPageEditorState {
  const copy = PROJECT_COPY[activityCase.code] ?? {
    title: item.label,
    subtitle: item.summary,
    cta: '立即参与',
    gameplay: '基础活动玩法',
  }
  return {
    ...copy,
    deviceWidth: 390,
    elements: { hero: true, navigation: true, content: true, footer: true },
    gameplay: {
      packageName: copy.gameplay,
      taskEnabled: true,
      shareEnabled: true,
      dailyLimit: 3,
    },
  }
}
