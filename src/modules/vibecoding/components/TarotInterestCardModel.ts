export interface TarotInterestCardConfig {
  signName: string
  signEnglish: string
  dateRange: string
  keyword: string
  interpretation: string
  aiLabel: string
  cardImage: string
  dismissLabel: string
  ctaLabel: string
  landingAuthor: string
  landingTitle: string
  landingButtonLabel: string
  landingCardImage: string
}

export const DEFAULT_TAROT_INTEREST_CARD_CONFIG: TarotInterestCardConfig = {
  signName: '天秤座',
  signEnglish: 'LIBRA',
  dateRange: '09.23 - 10.23',
  keyword: '爱情',
  interpretation:
    '今日天秤的爱情运势被轻轻点亮，将更容易在关系中找到平衡与回应。适合表达心意别犹豫，顺着感觉靠近一点。',
  aiLabel: 'AI生成',
  cardImage: '/assets/tarot-interest-card/libra-card.png',
  dismissLabel: '不感兴趣',
  ctaLabel: '查看运势详解',
  landingAuthor: '@落日飞车',
  landingTitle: '这是你抽到的牌',
  landingButtonLabel: '解读',
  landingCardImage: '/assets/tarot-interest-card/two-of-cups.png',
}
