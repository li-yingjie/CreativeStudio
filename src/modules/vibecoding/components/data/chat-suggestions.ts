import type { ProjectKind } from '../ProjectProductView'

/** Rotating reply bank for plain (non-trigger) chat messages. Picked by
 *  index so repeated sends still feel varied without needing a real
 *  language model. */
export const GENERIC_AI_REPLIES = [
  '好的，我记下了这个需求。可以再告诉我具体的使用场景或期望结果，这样我可以帮你精准地搭建。',
  '收到。为了给出更贴合的方案，你能补充一下目标用户、触发时机和数据来源吗？',
  '好，我先整理下你的想法。建议把它拆成更小的步骤说给我听，我会按步骤接着往下做。',
  '明白了。如果方便，可以直接描述一下理想中的最终产出形态，比如一个页面、一段接口或一份内容。',
]

export const CHAT_EMPTY_SUGGESTIONS = [
  '换套更神秘的配色',
  '给卡片加上翻面动效',
  '再写两个塔罗牌面',
  '加一个每日签到提醒',
  '优化首页加载速度',
]

/** AI-avatar project suggestions — each phrase matches the trigger
 *  pattern-match in `sendChat` so clicking one immediately kicks off
 *  the recognition flow. */
export const AI_AVATAR_CHAT_SUGGESTIONS = [
  '当用户关注时发送"欢迎关注"',
  '用户评论后回复"谢谢留言"',
  '用户点赞后发送"感谢点赞"',
  '用户送礼物时答谢"感谢礼物"',
  '用户投稿时推荐"新作品上线"',
]

/** Quick-command chips shown in a project's empty chat — edit-oriented and
 *  tailored to the product kind. ai-avatar keeps the trigger-matching set so
 *  clicking a chip still fires the recognition flow. */
export const CHAT_SUGGESTIONS_BY_KIND: Record<ProjectKind, string[]> = {
  'mini-program': CHAT_EMPTY_SUGGESTIONS,
  'ai-avatar': AI_AVATAR_CHAT_SUGGESTIONS,
  'web-app': [
    '换个更简洁的主题色',
    '作品页加上分类筛选',
    '首页加一段自我介绍',
    '联系页加个留言表单',
    '适配一下移动端布局',
  ],
  'web-game': [
    '把敌人密度调高一点',
    '新增一个 Roguelike 流派',
    '换个更燃的 BOSS 战音乐',
    '加一个本地排行榜',
    '优化手机端触控手感',
  ],
  'marketing-h5': [
    '多加一个抽奖楼层',
    '换成更童趣的配色',
    '调整奖品和文案',
    '加一个分享得抽奖机会',
    '改一下活动时间',
  ],
  'ops-proposal': [
    '多找几个腰部达人',
    '调整种草投放节奏',
    '换个内容种草方向',
    '增加团购转化钩子',
    '补充人群诊断维度',
  ],
}

/** Per-project overrides — finer-grained chips for specific projects. */
export const CHAT_SUGGESTIONS_BY_PROJECT: Record<string, string[]> = {
  '塔罗小程序': [
    '换套更神秘的配色',
    '给卡片加上翻面动效',
    '再写两个塔罗牌面',
    '牌意词典加个搜索',
    '加一个每日签到',
  ],
  '射击小游戏': CHAT_SUGGESTIONS_BY_KIND['web-game'],
  '六一儿童节活动': CHAT_SUGGESTIONS_BY_KIND['marketing-h5'],
  '沪上火锅·五一种草提案': CHAT_SUGGESTIONS_BY_KIND['ops-proposal'],
}
