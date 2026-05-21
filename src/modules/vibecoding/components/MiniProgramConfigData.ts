/* ─── 小程序 (mini-program) config ───
 *
 * A mini-program project's product view surfaces four plain-language
 * sections instead of raw files:
 *   智能体     — the backing agent's LLM + prompt config
 *   小程序设置 — project.config.json as a minimal form
 *   界面       — src/pages routes (driven by the file tree)
 *   静态素材   — icons / images as a visual grid
 *
 * 智能体 / 小程序设置 / 静态素材 are backed by this config object.
 */

import { getWorld } from '@/modules/editor/data/worlds'

export interface MiniProgramAsset {
  name: string
  url: string
}

/* ─── preview (right-side phone) content ───
 * Drives MiniAppPreview's 4 pages. Content only (text / images / data); the
 * gold accent + tarot flip mechanics + layout stay in the renderer as the
 * shared "framework". Falls back to DEFAULT_MINIPROGRAM_PREVIEW. */
export interface MpQuickEntry {
  t: string
  d: string
}
export interface MpChatMsg {
  from: 'ai' | 'me'
  text: string
}
export interface MpStat {
  num: string
  unit: string
}
export interface MiniProgramPreviewConfig {
  sceneBg: string
  /** Avatar shown in 聊天 / 个人. */
  portrait: string
  /** Card face images for the 塔罗 deck. */
  cardPool: string[]
  /** Nav title per route label (首页 / 塔罗 / 聊天 / 个人). */
  navTitles: Record<string, string>
  home: {
    dateLabel: string
    title: string
    desc: string
    cta: string
    quickEntries: MpQuickEntry[]
  }
  tarot: {
    cardLabels: [string, string, string]
    hintInitial: string
    hintPartial: string
    hintAll: string
    reshuffleLabel: string
  }
  chat: MpChatMsg[]
  profile: {
    name: string
    subtitle: string
    stats: MpStat[]
    menu: string[]
  }
}

export interface MiniProgramConfig {
  /** 小程序设置 — project.config.json fields. */
  name: string
  appID: string
  description: string
  /** 智能体 — the agent powering the mini-program. */
  agent: {
    modelKey: string
    modelName: string
    /** markdown-structured prompt. */
    systemPrompt: string
  }
  /** 静态素材 — icons / images. */
  assets: MiniProgramAsset[]
  /** Right-side preview content. Falls back to DEFAULT_MINIPROGRAM_PREVIEW. */
  preview?: MiniProgramPreviewConfig
}

/** Default preview content = the seeded 第五人格塔罗 surface, so the renderer
 *  shows a complete phone for any mini-program even without a `preview`. */
const IDENTITY_V_WORLD = getWorld('identity-v')
const IDENTITY_V_CARDS = [
  ...(IDENTITY_V_WORLD.defaults.gallery ?? []),
  IDENTITY_V_WORLD.defaults.portraitUrl,
]
export const DEFAULT_MINIPROGRAM_PREVIEW: MiniProgramPreviewConfig = {
  sceneBg: '/场景/约瑟夫暗房.png',
  portrait: IDENTITY_V_WORLD.defaults.portraitUrl,
  cardPool: IDENTITY_V_CARDS.length > 0 ? IDENTITY_V_CARDS : ['/bg/identity-v-portrait.png'],
  navTitles: {
    首页: '第五人格 · 今日运势',
    塔罗: '今日塔罗',
    聊天: '约瑟夫',
    个人: '我的',
  },
  home: {
    dateLabel: 'TODAY · 5 月 18 日',
    title: '为你显影今日运势',
    desc: '抽出过去、当下与下一张牌，让约瑟夫的快门替你解读。',
    cta: '开始今日占卜',
    quickEntries: [
      { t: '运势日记', d: '回看历史牌面' },
      { t: '牌意词典', d: '78 张牌全解' },
    ],
  },
  tarot: {
    cardLabels: ['PAST', 'NOW', 'NEXT'],
    hintInitial: '点击牌堆，抽出今日的第一张牌',
    hintPartial: '继续点未翻开的牌，让约瑟夫的快门替你显影。',
    hintAll: '三张牌已为你显影 —— 过去、当下、下一张等你按下快门。',
    reshuffleLabel: '重新抽卡',
  },
  chat: [
    { from: 'ai', text: '今晚的暗房很安静，想聊聊你抽到的牌吗？' },
    { from: 'me', text: '我抽到了「NOW」是一张倒置的牌。' },
    { from: 'ai', text: '倒置常意味着「尚未释放的能量」。别急，先按下快门，再谈显影。' },
    { from: 'me', text: '那我下一步该注意什么？' },
  ],
  profile: {
    name: '深夜旅人',
    subtitle: '与约瑟夫同行 12 天',
    stats: [
      { num: '36', unit: '次占卜' },
      { num: '12', unit: '连续天' },
      { num: '5', unit: '收藏牌' },
    ],
    menu: ['我的运势日记', '收藏的牌意', '提醒设置'],
  },
}

/* ─── per-project mock configs ─── */

const TAROT_PROMPT = `# 角色

你是「第五人格塔罗」小程序背后的占卜师智能体。以庄园宫廷摄影师
约瑟夫的口吻，为用户解读今日塔罗运势。

# 玩法

塔罗以照片作牌面，围绕 Past / Now / Next 三张显影：

- Past —— 被雾气封存的过往
- Now —— 当下你站着的那格光圈
- Next —— 下一帧里等你按下快门的人

# 风格

- 语气：慢、稳、带旧时代礼节。
- 解读：先描述牌面意象，再落到用户当下处境。

# 边界

- 不下绝对结论，只提供启发与陪伴。
- 不替用户做现实决定。`

const CHECKIN_PROMPT = `# 角色

你是「每日打卡」小程序的习惯教练智能体，陪用户坚持每日目标。

# 风格

- 语气：积极、简短、不说教。
- 在用户打卡 / 断卡时给出恰当的鼓励或提醒。

# 边界

- 不制造焦虑，断卡也温和对待。`

const TANDIAN_PROMPT = `# 角色

你是「探店视频创作助手」小程序的创作智能体，帮用户把探店素材
快速变成可发布的短视频脚本与文案。

# 风格

- 语气：利落、有镜头感。
- 输出结构化的分镜与口播文案。

# 边界

- 不杜撰商家未提供的信息。`

/** Build an image-asset list from the shared random card images. */
function assets(names: string[]): MiniProgramAsset[] {
  return names.map((name, i) => ({
    name,
    url: `/bg/cards/banner-${i + 1}.png`,
  }))
}

export const MINIPROGRAM_CONFIGS: Record<string, MiniProgramConfig> = {
  '塔罗小程序': {
    name: '塔罗',
    appID: 'wx_tarot_5f6e2a',
    description: '第五人格主题的塔罗运势小程序，每日抽卡解读运势。',
    agent: {
      modelKey: 'doubao-pro-32k',
      modelName: 'Doubao-pro-32k',
      systemPrompt: TAROT_PROMPT,
    },
    assets: assets([
      '小程序 logo',
      '首页 banner',
      '塔罗牌·牌背',
      '塔罗牌·过去',
      '塔罗牌·当下',
      '塔罗牌·未来',
      '加载占位图',
      '结果页背景',
      '分享卡片底图',
    ]),
    preview: DEFAULT_MINIPROGRAM_PREVIEW,
  },
  '每日打卡小程序': {
    name: '每日打卡',
    appID: 'wx_checkin_3b91',
    description: '轻量的每日习惯打卡小程序，连续坚持可解锁成就。',
    agent: {
      modelKey: 'doubao-lite-4k',
      modelName: 'Doubao-lite-4k',
      systemPrompt: CHECKIN_PROMPT,
    },
    assets: assets(['小程序 logo', '打卡日历底图', '成就徽章', '空状态插画']),
  },
  '探店视频创作助手': {
    name: '探店视频创作助手',
    appID: 'wx_tandian_7c40',
    description: '把探店素材一键整理成短视频脚本与口播文案的小程序。',
    agent: {
      modelKey: 'doubao-pro-32k',
      modelName: 'Doubao-pro-32k',
      systemPrompt: TANDIAN_PROMPT,
    },
    assets: assets(['小程序 logo', '首页封面', '分镜模板缩略图', '导出卡片底图']),
  },
}

/** Look up the config for a project, if it is a mini-program. */
export function getMiniProgramConfig(
  projectName: string,
): MiniProgramConfig | undefined {
  return MINIPROGRAM_CONFIGS[projectName]
}
