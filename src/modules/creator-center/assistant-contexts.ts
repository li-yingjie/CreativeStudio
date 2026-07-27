import type { AiAssistantContext } from '@/shared/components/AiAssistantPanel'

/** 账号基本盘，注入每个语境的系统提示，让回复贴合这个演示账号。 */
const PROFILE_HINT =
  '账号概况：抖音音乐人认证，粉丝 141.8 万，获赞 275.8 万，关注 30，所属 MCN 为纯初文化，内容以音乐/星座情感类短视频为主。'

/** 左侧导航各页面（Tab）对应的 AI 助手语境。key 与 CreatorCenterHome 的
 *  page state 对齐；未覆盖的页面回落到 DEFAULT_ASSISTANT_CONTEXT。 */
export const ASSISTANT_CONTEXTS: Record<string, AiAssistantContext> = {
  data: {
    key: 'data',
    label: '首页',
    greeting: '有任何创作、数据、变现的问题都可以问我，下面这些你可以试试～',
    suggestions: [
      '总结一下我最近 7 天的账号表现',
      '我下一条视频拍什么选题比较好？',
      '如何让粉丝从 141 万涨到 200 万？',
    ],
    systemHint: `${PROFILE_HINT} 首页展示：近 7 天播放量趋势、最新作品数据、互动与变现概览。`,
  },
  content: {
    key: 'content',
    label: '内容管理',
    greeting: '我可以帮你优化标题、分析哪类内容表现最好、规划发布节奏～',
    suggestions: [
      '帮我起 3 个更容易上热门的视频标题',
      '分析我哪类作品的数据表现最好',
      '什么时间段发布作品效果最好？',
    ],
    systemHint: `${PROFILE_HINT} 用户正在管理已发布的视频作品（标题、封面、数据）。`,
  },
  live: {
    key: 'live',
    label: '直播管理',
    greeting: '直播相关的问题都可以问我：开播策划、留存提升、直播带货都在行～',
    suggestions: [
      '帮我策划一场音乐主题直播',
      '如何提升直播间的观众留存？',
      '直播间涨粉有什么实用技巧？',
    ],
    systemHint: `${PROFILE_HINT} 用户正在查看直播管理页面，关注开播计划与直播数据。`,
  },
  datacenter: {
    key: 'datacenter',
    label: '数据中心',
    greeting: '把你关心的指标告诉我，我来帮你解读和给优化建议～',
    suggestions: [
      '分析近 7 天播放量的变化趋势',
      '完播率低于同类作者，怎么优化？',
      '哪个指标最值得我优先提升？',
    ],
    systemHint: `${PROFILE_HINT} 页面展示：数据总览雷达图（播放/完播率/涨粉/发布数/互动率对比同类作者）、作品数据与粉丝数据趋势图。`,
  },
  income: {
    key: 'income',
    label: '收入变现',
    greeting: '关于变现的问题交给我：收入结构分析、变现方式推荐、报价策略都可以聊～',
    suggestions: [
      '帮我分析目前的收入构成',
      '适合百万粉音乐人的变现方式有哪些？',
      '如何提高星图广告的报价？',
    ],
    systemHint: `${PROFILE_HINT} 用户正在查看收入变现页面（礼物收入、星图、电商佣金等）。`,
  },
  'service:作品共创': {
    key: 'service:作品共创',
    label: '作品共创',
    greeting: '想找人合拍或共创？我可以帮你想共创玩法、写邀约文案～',
    suggestions: [
      '推荐几种适合音乐人的共创玩法',
      '帮我写一段共创邀约私信',
      '共创作品的流量分成怎么谈？',
    ],
    systemHint: `${PROFILE_HINT} 用户正在查看作品共创页面，寻找合作创作者。`,
  },
  'service:活动管理': {
    key: 'service:活动管理',
    label: '活动管理',
    greeting: '平台活动是涨粉和涨播放的好机会，我可以帮你挑活动、定参与策略～',
    suggestions: [
      '最近哪类平台活动适合我参加？',
      '参加投稿活动怎么提高获奖概率？',
      '帮我规划这个月的活动参与节奏',
    ],
    systemHint: `${PROFILE_HINT} 页面展示平台活动日历与可报名的投稿活动。`,
  },
  'service:原创保护': {
    key: 'service:原创保护',
    label: '原创保护',
    greeting: '原创权益的问题问我：搬运维权、原创申请、版权音乐都能解答～',
    suggestions: [
      '发现别人搬运我的视频怎么办？',
      '如何申请原创保护标识？',
      '翻唱歌曲发布要注意什么版权问题？',
    ],
    systemHint: `${PROFILE_HINT} 用户正在查看原创保护页面（侵权检测与维权）。`,
  },
  'service:抖音指数': {
    key: 'service:抖音指数',
    label: '抖音指数',
    greeting: '想知道什么在涨热度？我可以帮你解读热点指数、找和你内容匹配的热点～',
    suggestions: [
      '最近有哪些适合音乐人蹭的热点？',
      '怎么判断一个热点值不值得跟？',
      '帮我把热门 BGM 和我的内容结合起来',
    ],
    systemHint: `${PROFILE_HINT} 页面展示关键词热度指数与热点趋势。`,
  },
}

/** 发布类页面共用一个语境。 */
const PUBLISH_CONTEXT: AiAssistantContext = {
  key: 'publish',
  label: '作品发布',
  greeting: '发布前让我帮你把关：标题、话题标签、封面文案都可以现场生成～',
  suggestions: [
    '帮我写一个吸引人的视频标题和话题标签',
    '封面文案怎么写点击率更高？',
    '发布时选哪些参与的活动或标签？',
  ],
  systemHint: `${PROFILE_HINT} 用户正在填写作品发布表单（标题、简介、话题、封面、发布时间）。`,
}

export const DEFAULT_ASSISTANT_CONTEXT: AiAssistantContext = {
  key: 'default',
  label: '创作者中心',
  greeting: '有任何创作、数据、变现的问题都可以问我，下面这些你可以试试～',
  suggestions: ['我下一条视频拍什么好？', '帮我分析账号近期表现', '如何提升作品完播率？'],
  systemHint: PROFILE_HINT,
}

export function assistantContextFor(page: string): AiAssistantContext {
  if (page.startsWith('publish-')) return PUBLISH_CONTEXT
  return ASSISTANT_CONTEXTS[page] ?? DEFAULT_ASSISTANT_CONTEXT
}
