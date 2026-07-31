/* ─── 营销 H5 (marketing-h5) preview config ───
 *
 * Drives MarketingH5Preview's stacked sections (头图 / 倒计时 / 活动介绍 /
 * 幸运抽奖 / 参与任务 / 活动规则 / footer). Content only (text / images /
 * data); the layout, decorations, and edit-mode layer selection stay in the
 * renderer as the shared framework. Falls back to DEFAULT_MARKETING_H5_PREVIEW.
 *
 * One config-data + one renderer per scenario, so each can be owned separately.
 */

export interface H5CountdownUnit {
  value: string
  unit: string
}
export interface H5RuleSection {
  title: string
  lines: string[]
}

export interface MarketingH5PreviewConfig {
  heroImage: string
  lotteryImage: string
  hero: { badge: string; accentTitle: string }
  countdown: H5CountdownUnit[]
  intro: { title: string; paragraphs: string[] }
  lottery: {
    title: string
    winners: string[]
    drawLabel: string
    remainLabel: string
    myPrizeLabel: string
  }
  task: { title: string; name: string; desc: string; cta: string; reward: string }
  rules: {
    title: string
    sections: H5RuleSection[]
    contact: { title: string; text: string }
  }
  footer: { searchTag: string; keyword: string; disclaimer: string }
}

/** Default = the seeded 抖音 ACG 游戏新春会, so the renderer shows a complete
 *  page for any marketing-h5 even without a config. */
export const DEFAULT_MARKETING_H5_PREVIEW: MarketingH5PreviewConfig = {
  heroImage: '/assets/acg-new-year/hero.jpg',
  lotteryImage: '/assets/acg-new-year/main-video.jpg',
  hero: { badge: '抖音 ACG', accentTitle: '游戏新春会' },
  countdown: [
    { value: '0', unit: '天' },
    { value: '00', unit: '时' },
    { value: '00', unit: '分' },
    { value: '00', unit: '秒' },
  ],
  intro: {
    title: '好游戏一起过新年',
    paragraphs: [
      '抖音 ACG 集结热门游戏与高燃创作，为玩家带来一站式新春内容会场。',
      '在主会场切换地下城与勇士、蛋仔派对、王者荣耀等游戏，观看新春特别内容。',
      '参与「放你一马」与「好活加马」互动，为喜欢的作品积累马力值。',
    ],
  },
  lottery: {
    title: '开年高燃',
    winners: ['地下城与勇士', '蛋仔派对', '王者荣耀'],
    drawLabel: '好活加马',
    remainLabel: '马力值持续更新',
    myPrizeLabel: '查看全部',
  },
  task: {
    title: '主会场互动',
    name: '为高燃作品加马',
    desc: '浏览视频并为喜欢的游戏内容助力',
    cta: '去主会场',
    reward: '+马力值',
  },
  rules: {
    title: '活动规则',
    sections: [
      { title: '活动对象', lines: ['抖音全体用户均可参与'] },
      {
        title: '互动方式',
        lines: [
          '浏览主会场视频与开年高燃榜单',
          '点击「放你一马」或「好活加马」为作品助力',
          '每个账号每日可为同一作品助力一次',
        ],
      },
      {
        title: '榜单规则',
        lines: [
          '榜单按作品累计马力值排序',
          '平台将对异常互动和作弊数据进行清理',
        ],
      },
      {
        title: '注意事项',
        lines: [
          '每人每日抽奖次数有限，请合理参与',
          '如发现作弊行为，平台有权取消参与资格',
          '本活动最终解释权归抖音所有',
        ],
      },
    ],
    contact: { title: '客服联系', text: '如有疑问请联系抖音官方客服' },
  },
  footer: { searchTag: '抖音搜索', keyword: '游戏新春会', disclaimer: '好游戏一起过新年' },
}

/** Per-project mock configs, keyed by project name. */
export const MARKETING_H5_CONFIGS: Record<string, MarketingH5PreviewConfig> = {
  '抖音 ACG 游戏新春会': DEFAULT_MARKETING_H5_PREVIEW,
}

/** Look up the preview config for a project, if it is a marketing-h5. */
export function getMarketingH5Preview(
  projectName: string,
): MarketingH5PreviewConfig | undefined {
  return MARKETING_H5_CONFIGS[projectName]
}
