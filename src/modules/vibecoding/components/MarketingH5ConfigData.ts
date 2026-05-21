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

/** Default = the seeded 六一儿童节 activity, so the renderer shows a complete
 *  page for any marketing-h5 even without a config. */
export const DEFAULT_MARKETING_H5_PREVIEW: MarketingH5PreviewConfig = {
  heroImage: '/h5/children-day/hero-gifts.png',
  lotteryImage: '/h5/children-day/lottery-cube.png',
  hero: { badge: '六一', accentTitle: '童趣抽奖' },
  countdown: [
    { value: '0', unit: '天' },
    { value: '00', unit: '时' },
    { value: '00', unit: '分' },
    { value: '00', unit: '秒' },
  ],
  intro: {
    title: '六一童趣节，好礼送不停',
    paragraphs: [
      '童年是最美好的时光，陪伴是最珍贵的礼物。',
      '这个六一儿童节，抖音为你准备了超多惊喜好礼！参与活动即有机会赢取丰厚奖品，让你的节日更加精彩纷呈。',
      '每人每日可获得1次抽奖机会，完成签到、观看直播、分享页面还可额外获得抽奖机会哦！',
    ],
  },
  lottery: {
    title: '幸运抽奖',
    winners: ['xxxxx975获得', '恭喜167xxxxx9'],
    drawLabel: '立即抽奖',
    remainLabel: '剩余XX次机会',
    myPrizeLabel: '查看我的奖品',
  },
  task: {
    title: '参与任务',
    name: '这是一个任务名称',
    desc: '任务说明/任务规则',
    cta: '去做任务',
    reward: '+1000金币',
  },
  rules: {
    title: '活动规则',
    sections: [
      { title: '活动对象', lines: ['抖音全体用户均可参与'] },
      {
        title: '抽奖机会获取',
        lines: [
          '每人每日基础1次抽奖机会',
          '完成每日签到，额外获得1次抽奖机会',
          '观看直播，额外获得1次抽奖机会',
          '分享页面，额外获得1次抽奖机会',
          '每人每日最多可获得4次抽奖机会',
        ],
      },
      {
        title: '奖品设置',
        lines: [
          '一等奖：儿童智能手表（1名）',
          '二等奖：玩具礼盒（10名）',
          '三等奖：学习用品礼包（50名）',
          '四等奖：贴纸盲盒（100名）',
        ],
      },
      {
        title: '奖品发放',
        lines: [
          '实物奖品将在活动结束后7个工作日内寄出',
          '请确保收货信息准确，因信息错误导致奖品无法送达，平台不承担责任',
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
  footer: { searchTag: '抖音搜索', keyword: '六一儿童节', disclaimer: '本活动与Apple Inc.无关' },
}

/** Per-project mock configs, keyed by project name. */
export const MARKETING_H5_CONFIGS: Record<string, MarketingH5PreviewConfig> = {
  '六一儿童节活动': DEFAULT_MARKETING_H5_PREVIEW,
}

/** Look up the preview config for a project, if it is a marketing-h5. */
export function getMarketingH5Preview(
  projectName: string,
): MarketingH5PreviewConfig | undefined {
  return MARKETING_H5_CONFIGS[projectName]
}
