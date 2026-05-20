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

export interface MiniProgramAsset {
  name: string
  url: string
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
