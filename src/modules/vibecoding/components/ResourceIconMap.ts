import {
  Activity,
  AlertTriangle,
  BarChart3,
  Beaker,
  BookOpen,
  Bot,
  Brush,
  Calendar,
  CheckSquare,
  Clapperboard,
  Clock,
  Code2,
  Cpu,
  Database,
  DollarSign,
  Eye,
  FileText,
  Flag,
  Flame,
  FolderOpen,
  GitBranch,
  Globe,
  Headphones,
  Heart,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Music,
  Palette,
  Presentation,
  Scale,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Table,
  Telescope,
  TrendingUp,
  Users,
  Video,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Capability, CapabilityType, Resource } from './ResourceLibraryData'

/* ─── Per-platform icon + colour. Each platform gets a distinct identity
 *     so the section heading and detail page read at a glance. */

interface PlatformVisual {
  icon: LucideIcon
  /** Tailwind classes for bg + text. /10 bg + dual-mode text colour. */
  tone: string
}

const PLATFORM_VISUALS: Record<string, PlatformVisual> = {
  /* 业务平台 */
  'live-ops': {
    icon: Video,
    tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
  },
  'music-ops': {
    icon: Music,
    tone: 'bg-pink-500/10 text-pink-600 dark:text-pink-300',
  },
  'kesong-ops': {
    icon: ShoppingBag,
    tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-300',
  },
  gaia: {
    icon: Users,
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  'hotspot-ops': {
    icon: Flame,
    tone: 'bg-red-500/10 text-red-600 dark:text-red-300',
  },
  'wenyu-ops': {
    icon: Clapperboard,
    tone: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  },
  qianxun: {
    icon: ShieldCheck,
    tone: 'bg-stone-500/10 text-stone-600 dark:text-stone-300',
  },
  ola: {
    icon: Headphones,
    tone: 'bg-lime-500/10 text-lime-700 dark:text-lime-300',
  },

  /* 策略平台 */
  owls: {
    icon: Telescope,
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
  },
  holmes: {
    icon: Search,
    tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
  },
  mirror: {
    icon: Eye,
    tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-300',
  },
  xiniao: {
    icon: AlertTriangle,
    tone: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300',
  },

  /* 工具平台 */
  aeolus: {
    icon: BarChart3,
    tone: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  },
  ida: {
    icon: Database,
    tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  },
  dorado: {
    icon: Layers,
    tone: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
  },
  ark: {
    icon: Cpu,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  },
  aime: {
    icon: Bot,
    tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
  },
  mira: {
    icon: MessageCircle,
    tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  },
}

const DEFAULT_PLATFORM_VISUAL: PlatformVisual = {
  icon: Layers,
  tone: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
}

export function platformVisual(platform: Resource): PlatformVisual {
  return PLATFORM_VISUALS[platform.id] ?? DEFAULT_PLATFORM_VISUAL
}

/* ─── Per-capability icon: derived from the capability NAME via a
 *     keyword-rule list, so each card's avatar matches what the
 *     capability actually does (e.g. "飞书会议" → Video, "TEA 数据查询"
 *     → Database, "okrs-by-bco" → Flag) instead of repeating the same
 *     icon per type. Tone still follows the type so skill / tool /
 *     knowledge identity stays at a glance. */

/** Ordered keyword → icon rules. First match wins, so put more specific
 *  patterns earlier. Patterns are matched against the capability's
 *  lowercased name. */
const NAME_ICON_RULES: Array<{ patterns: string[]; icon: LucideIcon }> = [
  /* Document / file types */
  { patterns: ['xlsx', '表格', 'sheet', '多维'], icon: Table },
  { patterns: ['pdf'], icon: FileText },
  { patterns: ['ppt', 'slide', '幻灯片', 'high-end-ppt'], icon: Presentation },
  { patterns: ['docx', '文档', 'doc', '一页纸', 'onepage', 'easy-read', 'prettydoc'], icon: FileText },
  { patterns: ['报告', 'report', '战报', 'weekly-report'], icon: FileText },
  { patterns: ['网页', 'web-page', 'mockup-html'], icon: Globe },

  /* Calendar / time / schedule */
  { patterns: ['日历', 'calendar'], icon: Calendar },
  { patterns: ['scheduler', '调度'], icon: Clock },
  { patterns: ['周报', 'weekly', '日报', 'daily', 'morning', 'evening'], icon: Calendar },

  /* Approval / task */
  { patterns: ['任务', 'task', '审批', 'approval'], icon: CheckSquare },

  /* Communication */
  { patterns: ['会议', 'meeting', '妙记'], icon: Video },
  { patterns: ['邮件', 'mail'], icon: Mail },
  { patterns: ['消息', '群聊', '单聊', 'im-chat', 'chat-', '通知', 'message', 'feishu-card', '飞书卡片', 'lark-im', 'lark-card'], icon: MessageSquare },
  { patterns: ['代发'], icon: Mail },

  /* Search / knowledge */
  { patterns: ['知识库', 'knowledge', 'wiki', '内部知识'], icon: BookOpen },
  { patterns: ['搜索', 'search', '检索', 'research'], icon: Search },

  /* Data & analytics */
  { patterns: ['看板', 'dashboard'], icon: LayoutDashboard },
  { patterns: ['图表', 'chart', '气泡图', '瀑布图', 'vchart'], icon: BarChart3 },
  { patterns: ['监测', 'monitor', '监控', '异常', '检测', 'anomaly', 'spc-'], icon: Activity },
  { patterns: ['归因', 'attribution', 'router'], icon: GitBranch },
  { patterns: ['实验', 'experiment', 'abtest', 'ab-', 'syh-debug'], icon: Beaker },
  { patterns: ['指标', 'metric'], icon: TrendingUp },
  { patterns: ['查询', 'query', 'sql'], icon: Database },
  { patterns: ['分析', 'analysis', 'analyz', 'analytics', '统计'], icon: BarChart3 },
  { patterns: ['数据', 'tea', 'libra', 'aeolus', 'data-', 'kani', 'magibook'], icon: Database },

  /* Creative */
  { patterns: ['图片', 'image', 'banner', '图像', '渲染图片', 'screenshot'], icon: ImageIcon },
  { patterns: ['视频', 'video', '直播', 'live', '剪辑', 'videocut'], icon: Video },
  { patterns: ['音乐', 'music', '音频', 'audio', '语音'], icon: Music },
  { patterns: ['设计', 'design', '原型', 'mockup'], icon: Brush },
  { patterns: ['svg'], icon: Sparkles },
  { patterns: ['生成', 'generate', '创作', '创建', 'gen-', 'creator'], icon: Sparkles },

  /* Code / Engineering */
  { patterns: ['code', '代码', 'codebase', 'meego', 'meegle', 'frontend', '研发'], icon: Code2 },
  { patterns: ['cli'], icon: Code2 },
  { patterns: ['服务', 'service', 'psm', 'bits', 'argos', 'slardar', 'sentry'], icon: Server },
  { patterns: ['git'], icon: GitBranch },

  /* Business / Finance / Legal */
  { patterns: ['采购', 'procurement', 'sourcing', 'supplier'], icon: ShoppingCart },
  { patterns: ['商品', '电商', 'ecom', '抖店'], icon: ShoppingBag },
  { patterns: ['财务', 'finance', 'budget', 'payment', 'expense', 'finai', '财经'], icon: DollarSign },
  { patterns: ['合同', 'contract', '法', 'legal', 'patent'], icon: Scale },
  { patterns: ['客服', 'voc-detective', 'customer'], icon: Headphones },

  /* People / HR */
  { patterns: ['interview', 'people', 'leave', 'job-profile', '离职', '招聘'], icon: Users },

  /* Wellness / lifestyle */
  { patterns: ['health', 'depression', 'screening', 'love-debugger', 'nutritionist'], icon: Heart },
  { patterns: ['短剧', 'short-drama', 'drama'], icon: Clapperboard },
  { patterns: ['股', 'quant', 'stock'], icon: TrendingUp },

  /* Strategy / brand */
  { patterns: ['okr', '战略', 'strategy', 'brand'], icon: Flag },

  /* AI / agent */
  { patterns: ['ai', 'llm', 'agent', 'autopilot', 'humanizer'], icon: Bot },
  { patterns: ['memory', 'memo', '记忆'], icon: Sparkles },

  /* Risk / security */
  { patterns: ['security', 'risk', '风险', '风控', '安全'], icon: ShieldCheck },
  { patterns: ['warning', '预警'], icon: AlertTriangle },

  /* Misc icons / wraps */
  { patterns: ['头脑风暴', 'brainstorm'], icon: Lightbulb },
  { patterns: ['模板', 'template'], icon: Layers },
  { patterns: ['工具包', 'kit', '技能包'], icon: FolderOpen },
  { patterns: ['运营', 'campaign', '活动'], icon: Megaphone },
  { patterns: ['路由', 'routing', 'router'], icon: GitBranch },
  { patterns: ['艺术', 'art', 'palette', '素材'], icon: Palette },
]

const TYPE_TONE: Record<CapabilityType, string> = {
  skill: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
  tool: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  knowledge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
}

const TYPE_FALLBACK_ICON: Record<CapabilityType, LucideIcon> = {
  skill: Sparkles,
  tool: Wrench,
  knowledge: BookOpen,
}

function pickIconByName(name: string, type: CapabilityType): LucideIcon {
  const lower = name.toLowerCase()
  for (const rule of NAME_ICON_RULES) {
    if (rule.patterns.some((p) => lower.includes(p.toLowerCase()))) {
      return rule.icon
    }
  }
  return TYPE_FALLBACK_ICON[type]
}

export function capabilityVisual(
  cap: Capability,
): { icon: LucideIcon; tone: string } {
  return { icon: pickIconByName(cap.name, cap.type), tone: TYPE_TONE[cap.type] }
}

export const CAPABILITY_TYPE_TONE = TYPE_TONE
