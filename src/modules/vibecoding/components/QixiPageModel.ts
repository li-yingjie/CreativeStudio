export type QixiPageSection = 'hero' | 'bridge' | 'tasks' | 'feed'

export const QIXI_PAGE_ELEMENT_IDS = [
  'hero.share',
  'hero.rules',
  'hero.eyebrow',
  'hero.title',
  'hero.meta',
  'bridge.header',
  'bridge.details',
  'bridge.progress',
  'bridge.primary',
  'bridge.lottery',
  'tasks.header',
  'tasks.signin',
  'tasks.signin.action',
  'tasks.assist',
  'tasks.assist.action',
  'feed.header',
  'feed.content',
  'feed.action',
] as const

export type QixiPageElementId = (typeof QIXI_PAGE_ELEMENT_IDS)[number]

export type QixiPageSelection =
  | { type: 'section'; section: QixiPageSection }
  | {
      type: 'element'
      section: QixiPageSection
      element: QixiPageElementId
    }

export interface QixiPageContent {
  eyebrow: string
  titleLine1: string
  titleLine2: string
  heroMeta: string
  shareLabel: string
  rulesLabel: string
  bridgeTitle: string
  detailsLabel: string
  primaryLabel: string
  lotteryLabel: string
  taskTitle: string
  signInTitle: string
  signInDescription: string
  signInAction: string
  assistTitle: string
  assistDescription: string
  assistAction: string
  feedTitle: string
  feedEmptyTitle: string
  feedEmptyDescription: string
  feedAction: string
  primaryButtonBackground: string
  primaryButtonColor: string
  primaryButtonRadius: number
  lotteryButtonBackground: string
  lotteryButtonColor: string
  lotteryButtonRadius: number
  signInButtonBackground: string
  signInButtonColor: string
  signInButtonRadius: number
  assistButtonBackground: string
  assistButtonColor: string
  assistButtonRadius: number
  feedButtonBackground: string
  feedButtonColor: string
  feedButtonRadius: number
}

export const DEFAULT_QIXI_PAGE_CONTENT: QixiPageContent = {
  eyebrow: '七夕互动活动 · 8.15—8.19',
  titleLine1: '搭建鹊桥',
  titleLine2: '解锁七夕好礼',
  heroMeta: '8.15—8.19 · 7 关挑战',
  shareLabel: '分享',
  rulesLabel: '规则',
  bridgeTitle: '鹊桥搭建进度',
  detailsLabel: '活动明细',
  primaryLabel: '找喜鹊',
  lotteryLabel: '立即抽奖',
  taskTitle: '做任务得闯关机会',
  signInTitle: '每日签到',
  signInDescription: '完成签到即可得 2 次',
  signInAction: '去签到',
  assistTitle: '邀请好友助力',
  assistDescription: '每邀 1 位可获得 2 次',
  assistAction: '去邀请',
  feedTitle: '好友助力动态',
  feedEmptyTitle: '还没有好友助力',
  feedEmptyDescription: '邀请第一位好友，可获得 2 次闯关机会',
  feedAction: '去邀请',
  primaryButtonBackground: '#202126',
  primaryButtonColor: '#ffffff',
  primaryButtonRadius: 12,
  lotteryButtonBackground: '#f6f6f4',
  lotteryButtonColor: '#202126',
  lotteryButtonRadius: 12,
  signInButtonBackground: '#202126',
  signInButtonColor: '#ffffff',
  signInButtonRadius: 9,
  assistButtonBackground: '#202126',
  assistButtonColor: '#ffffff',
  assistButtonRadius: 9,
  feedButtonBackground: '#202126',
  feedButtonColor: '#ffffff',
  feedButtonRadius: 9,
}

export const QIXI_PAGE_CONTENT_STORAGE_KEY =
  'creative-studio.qixi-page-content.v1'

export function getInitialQixiPageContent(): QixiPageContent {
  if (typeof window === 'undefined') return { ...DEFAULT_QIXI_PAGE_CONTENT }
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(QIXI_PAGE_CONTENT_STORAGE_KEY) ?? 'null',
    ) as Record<string, unknown> | null
    if (!parsed) return { ...DEFAULT_QIXI_PAGE_CONTENT }
    return Object.fromEntries(
      Object.entries(DEFAULT_QIXI_PAGE_CONTENT).map(([key, fallback]) => {
        const candidate = parsed[key]
        return [key, typeof candidate === typeof fallback ? candidate : fallback]
      }),
    ) as unknown as QixiPageContent
  } catch {
    return { ...DEFAULT_QIXI_PAGE_CONTENT }
  }
}
