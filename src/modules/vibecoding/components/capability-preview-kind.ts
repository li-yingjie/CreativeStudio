import type { Capability } from './ResourceLibraryData'

export type PreviewKind =
  | 'table'
  | 'chart'
  | 'dashboard'
  | 'doc'
  | 'image'
  | 'video'
  | 'search'
  | 'message'
  | 'code'
  | 'agent'

const RULES: Array<{ patterns: string[]; kind: PreviewKind }> = [
  { patterns: ['xlsx', '表格', 'sheet', '多维', 'table'], kind: 'table' },
  { patterns: ['看板', 'dashboard'], kind: 'dashboard' },
  {
    patterns: [
      '图表', 'chart', '气泡图', '瀑布图', 'vchart', '分析', 'analysis',
      'analyz', 'analytics', '统计', '指标', 'metric', '监测', 'monitor', '监控',
      '异常', '检测', 'spc-',
    ],
    kind: 'chart',
  },
  {
    patterns: [
      'pdf', 'docx', '文档', 'doc', 'one-page', 'onepage', 'easy-read', 'prettydoc',
      '报告', 'report', '战报', '一页纸', '周报', 'weekly', '日报', 'morning', 'evening',
      'ppt', 'slide', '幻灯片', 'high-end-ppt',
    ],
    kind: 'doc',
  },
  {
    patterns: [
      '图片', 'image', 'banner', '图像', '渲染图片', 'screenshot', '设计', 'design',
      '原型', 'mockup', 'svg', 'palette',
    ],
    kind: 'image',
  },
  {
    patterns: ['视频', 'video', '直播', 'live', '剪辑', 'videocut', '短剧', 'short-drama', 'drama'],
    kind: 'video',
  },
  {
    patterns: ['搜索', 'search', '检索', 'research', '查询', 'query', 'sql'],
    kind: 'search',
  },
  {
    patterns: [
      '消息', '群聊', '单聊', 'im-chat', 'chat-', '通知', 'message', 'feishu-card',
      '飞书卡片', 'lark-im', 'lark-card', '会议', 'meeting', '邮件', 'mail',
    ],
    kind: 'message',
  },
  { patterns: ['code', '代码', 'codebase', 'cli'], kind: 'code' },
  { patterns: ['agent', 'autopilot', 'humanizer', 'bot', 'ai', 'llm'], kind: 'agent' },
]

export function pickPreviewKind(name: string): PreviewKind | null {
  const lower = name.toLowerCase()
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => lower.includes(pattern.toLowerCase()))) {
      return rule.kind
    }
  }
  return null
}

export function hasCapabilityPreview(capability: Capability): boolean {
  return pickPreviewKind(capability.name) !== null
}
