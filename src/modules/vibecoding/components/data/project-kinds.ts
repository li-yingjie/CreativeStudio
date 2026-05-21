import type { ProjectKind } from '../ProjectProductView'

export type OutputShape = 'app' | 'artifact' | 'code'

export const PROJECT_KINDS: Record<string, ProjectKind> = {
  '每日打卡小程序': 'mini-program',
  '塔罗小程序': 'mini-program',
  '探店视频创作助手': 'mini-program',
  '粉丝互动机器人': 'ai-avatar',
  '陶白白 Sensei 分身': 'ai-avatar',
  '沪上火锅·五一种草提案': 'ops-proposal',
  '抖音 AI 工坊设计探索': 'web-app',
  '射击小游戏': 'web-game',
  '六一儿童节活动': 'marketing-h5',
}

export const SHAPE_BY_KIND: Record<ProjectKind, OutputShape> = {
  'mini-program': 'app',
  'ai-avatar': 'app',
  'ops-proposal': 'artifact',
  'web-app': 'app',
  'web-game': 'app',
  'marketing-h5': 'app',
}

/** Human-readable label for each project kind — used in docs and the chat
 *  system prompt so the assistant knows what it's helping build. */
export const PROJECT_KIND_LABELS: Record<ProjectKind, string> = {
  'mini-program': '小程序',
  'ai-avatar': 'AI 分身',
  'ops-proposal': '运营提案',
  'web-app': '网站应用',
  'web-game': '网页游戏',
  'marketing-h5': '营销 H5',
}
