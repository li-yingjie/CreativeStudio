/* ─── AI 分身 (ai-avatar) app config ───
 *
 * An AI 分身 is defined by a single app-config object (mirrors the real
 * platform export: space / appID / name / systemPrompt / modelInfo /
 * toolInfoList / knowledgeInfoList / skillInfoList).
 *
 * The product view surfaces this config as five plain-language sections
 * (基础信息 / 人设指令 / 知识库 / 技能 / 触发器) instead of raw files.
 */

/** A referenced capability inside the config (knowledge / skill / tool). */
export interface AvatarCapRef {
  id: string
  name: string
  /** Only tools carry this — the tool's parent kind. */
  parentToolKind?: string
}

export interface AvatarAppConfig {
  space: string
  appID: string
  name: string
  description: string
  iconURL: string
  /** The persona instruction prompt — markdown-structured free text. */
  systemPrompt: string
  modelInfo: { modelKey: string; modelName: string }
  toolInfoList: AvatarCapRef[]
  knowledgeInfoList: AvatarCapRef[]
  skillInfoList: AvatarCapRef[]
}

/* ─── per-project mock configs, keyed by project name ─── */

const TAOBAIBAI_PROMPT = `# 角色

你是「陶白白 Sensei」—— 一个温柔、毒舌又精准的星座情感解读分身。
你陪用户聊星座、聊感情、聊当下的情绪，用轻松日常的口吻把复杂的关系
讲清楚。

# 风格

- 称呼：亲切，像朋友，不端着。
- 语气：温柔打底，偶尔毒舌点破，但不伤人。
- 句子：短，口语化，多用比喻。

# 能做什么

- 解读 12 星座的性格与当下运势。
- 分析感情关系里的纠结，给可执行的小建议。
- 结合抖音星座热点内容，给用户聊资。

# 不做什么

- 不下绝对结论（"你们一定分手"这类）。
- 不替用户做人生决定，只陪伴与启发。`

const FANBOT_PROMPT = `# 角色

你是创作者的「粉丝互动小助手」—— 一个高效、有温度的互动分身，
负责在评论区和私信里替创作者回应粉丝。

# 风格

- 语气：热情、真诚，带创作者本人的口头禅。
- 长度：评论区简短（1-2 句），私信可稍展开。

# 能做什么

- 识别评论情绪，对夸奖、提问、吐槽分别得体回应。
- 引导粉丝关注、参与活动、查看新作品。
- 高频问题走 FAQ 知识库，保证回答一致。

# 要求

- 不承诺创作者本人未授权的事。
- 遇到争议 / 敏感内容，转人工，不自行展开。`

export const AVATAR_CONFIGS: Record<string, AvatarAppConfig> = {
  '陶白白 Sensei 分身': {
    space: 'aicore_personal',
    appID: 'app_taobaibai_8f6e',
    name: '陶白白 Sensei',
    description: '12 星座情感解读 · 陪聊式星座占卜分身',
    iconURL: '/tbb.jpeg',
    systemPrompt: TAOBAIBAI_PROMPT,
    modelInfo: { modelKey: 'doubao-pro-32k', modelName: 'Doubao-pro-32k' },
    toolInfoList: [
      { id: 'tool_100023', name: '抖音热点查询', parentToolKind: '抖音工具' },
      { id: 'tool_761137', name: '多模态内容分析', parentToolKind: '通用工具' },
    ],
    knowledgeInfoList: [
      { id: 'aicore_kb_astro', name: '12 星座性格库' },
      { id: 'aicore_kb_relations', name: '情感关系知识库' },
      { id: 'aicore_kb_douyin_astro', name: '抖音星座内容数据' },
    ],
    skillInfoList: [
      { id: 'skill_astro_reading', name: '星座运势解读' },
      { id: 'skill_emotion_coach', name: '情感陪伴对话' },
    ],
  },
  '粉丝互动机器人': {
    space: 'aicore_personal',
    appID: 'app_fanbot_3a21',
    name: '粉丝互动小助手',
    description: '抖音粉丝评论 / 私信自动回复互动分身',
    iconURL: '/bg/identity-v-mascot.png',
    systemPrompt: FANBOT_PROMPT,
    modelInfo: { modelKey: 'doubao-lite-4k', modelName: 'Doubao-lite-4k' },
    toolInfoList: [
      { id: 'tool_330451', name: '评论情感识别', parentToolKind: '抖音工具' },
      { id: 'tool_330452', name: '抖音粉丝画像查询', parentToolKind: '抖音工具' },
    ],
    knowledgeInfoList: [
      { id: 'aicore_kb_account', name: '账号内容知识库' },
      { id: 'aicore_kb_faq', name: '常见问题 FAQ' },
    ],
    skillInfoList: [
      { id: 'skill_auto_reply', name: '评论自动回复' },
      { id: 'skill_dm_guide', name: '私信互动引导' },
      { id: 'skill_fan_campaign', name: '粉丝活动推送' },
    ],
  },
}

/** Look up the config for a project, if it is an AI 分身. */
export function getAvatarConfig(projectName: string): AvatarAppConfig | undefined {
  return AVATAR_CONFIGS[projectName]
}
