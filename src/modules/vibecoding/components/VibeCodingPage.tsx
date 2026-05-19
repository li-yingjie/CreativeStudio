import { Fragment, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import ChatPreview from '@/modules/editor/components/preview/ChatPreview'
import GlassIconButton from '@/modules/editor/components/layout/GlassIconButton'
import { useDominantColors, rgbString } from '@/modules/editor/hooks/useDominantColors'
import { getWorld } from '@/modules/editor/data/worlds'
import LogoIconSpinOnce from '@/shared/components/LogoIconSpinOnce'
import { useScrollEdges, fadeClassFromEdges } from '@/shared/hooks/useScrollEdges'
import {
  usePublishFlowStore,
  PUBLISH_SCENES,
  PUBLISH_SCENE_DESCRIPTIONS,
} from '@/modules/editor/store/publish-flow-store'
import PublishFlowModal from '@/modules/editor/components/chat/PublishFlowModal'
import { useThemeStore } from '@/shared/storage/theme'
import MiniAppPreview from './MiniAppPreview'
import WebAppPreview from './WebAppPreview'
import GarudaGamePreview from './GarudaGamePreview'
import GarudaAssetsView, { AssetStatsLine } from './GarudaAssetsView'
import GarudaCodeView from './GarudaCodeView'
import GarudaEditPanel from './GarudaEditPanel'
import GameGenerationFlow, { GameBuildProgress } from './GameGenerationFlow'
import type { GameSpecDraft } from './GameConfirmCard'
import AiPersonaChatPreview, { type TriggerSimulation } from './AiPersonaChatPreview'
import MentionPicker, { type MentionItem } from './MentionPicker'
import TriggerDetailView from './TriggerDetailView'
import { ChatFormCard, ChatFormStep, ChatFormSubmit } from './ChatFormCard'
import ResourceLibraryView, {
  type TypeFilter as ResourceLibraryTypeFilter,
} from './ResourceLibraryView'
import PlatformPlaceholderView from './PlatformPlaceholderView'
import ProposalGoalCard, { type ProposalGoalDraft } from './ProposalGoalCard'
import ProposalDiagnosisCard from './ProposalDiagnosisCard'
import ProposalAudienceDashboard from './ProposalAudienceDashboard'
import ProposalPackCard, {
  getPackProfile,
  type ProposalPackId,
} from './ProposalPackCard'
import ProposalBriefCard, { PROPOSAL_PLAYS } from './ProposalBriefCard'
import ProposalDashboardCard, {
  PROPOSAL_FUNNEL,
  PROPOSAL_MODULES,
} from './ProposalDashboardCard'
import ProposalReviewCard, {
  PROPOSAL_REVIEW_ADVICE,
  PROPOSAL_REVIEW_MODULES,
  PROPOSAL_REVIEW_STATS,
  PROPOSAL_REVIEW_TRAFFIC,
} from './ProposalReviewCard'
import UserEchoBubble, { truncate } from './UserEchoBubble'
import Stream, { RevealAfter, Sequential } from './Stream'
import {
  ArtifactCard,
  ArtifactCardGroup,
  FileChip,
  MentionChip,
  ReportQualityRow,
} from './ProposalChips'
import MarkdownView from './MarkdownView'
import {
  RESOURCES,
  type Capability,
  type PrimaryCategory,
  type Resource,
} from './ResourceLibraryData'
import {
  buildAvatarProductView,
  buildMiniProgramProductView,
  buildProductView,
  getProductPages,
  PRODUCT_CATEGORY_ICONS,
  WEB_PAGES,
  type FileNode,
  type ProjectKind,
} from './ProjectProductView'
import AvatarBasicInfoForm from './AvatarBasicInfoForm'
import AvatarSystemPromptView from './AvatarSystemPromptView'
import CapabilityDetailView from './CapabilityDetailView'
import { getAvatarConfig } from './AvatarConfigData'
import MiniProgramAgentView from './MiniProgramAgentView'
import MiniProgramSettingsForm from './MiniProgramSettingsForm'
import AssetGridView from './AssetGridView'
import { getMiniProgramConfig } from './MiniProgramConfigData'

/** Each platform project has a `ProjectKind` (the concrete product /
 *  case it represents) and an `OutputShape` (the abstract category that
 *  determines what the right-side preview area looks like). New cases
 *  only need a kind + a shape mapping — the dispatcher in the preview
 *  area picks the right container automatically.
 *
 *  - `app`      — buildable product the user can interact with (mini-app,
 *                 AI 分身, future: web/native). Right side renders a
 *                 phone-style mockup with the actual product running.
 *  - `artifact` — chat-driven document / config / dashboard production
 *                 (proposals, reports, briefs, review docs). Right side
 *                 renders the artefact panel (产出列表 + 下一步建议).
 *  - `code`     — code-heavy refactor / library work. Right side renders
 *                 the code editor + diff (already supported by existing
 *                 code paths).
 */
// `ProjectKind` is defined in ./ProjectProductView (shared with the
// product-view bucketing) and imported above.
type OutputShape = 'app' | 'artifact' | 'code'

const PROJECT_KINDS: Record<string, ProjectKind> = {
  '每日打卡小程序': 'mini-program',
  '第五人格塔罗小程序': 'mini-program',
  '探店视频创作助手': 'mini-program',
  '粉丝互动机器人': 'ai-avatar',
  '陶白白 Sensei 分身': 'ai-avatar',
  '沪上火锅·五一种草提案': 'ops-proposal',
  '个人作品集网站': 'web-app',
  'Garuda · 神明黄昏': 'web-game',
  '六一儿童节活动': 'marketing-h5',
}

const SHAPE_BY_KIND: Record<ProjectKind, OutputShape> = {
  'mini-program': 'app',
  'ai-avatar': 'app',
  'ops-proposal': 'artifact',
  'web-app': 'app',
  'web-game': 'app',
  'marketing-h5': 'app',
}

/** Heuristic kind classifier — used when the home screen takes a free
 *  prompt and we need to pick a shape before the project is named.
 *  Keyword-based for the demo; real product would route through an AI
 *  classifier with confidence scores + user override.
 */
function classifyProjectKind(prompt: string): ProjectKind {
  const p = prompt.toLowerCase()
  // App keywords beat artifact when both appear (build something is more
  // specific than describe something).
  if (
    /(小程序|mini[-\s]?program|app|分身|avatar|网页|web)/i.test(p)
  ) {
    if (/(分身|avatar|persona|chat[-\s]?bot)/i.test(p)) return 'ai-avatar'
    return 'mini-program'
  }
  // Artifact keywords cover most ops-proposal-like cases.
  if (
    /(方案|提案|报告|brief|看板|复盘|分析|策略|提案|种草|投放|brief)/i.test(p)
  ) {
    return 'ops-proposal'
  }
  // Fallback: most VibeCoding traffic builds an app.
  return 'mini-program'
}
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  Code2,
  Columns2,
  LayoutGrid,
  MoreHorizontal,
  Moon,
  Sun,
  Copy,
  Database,
  File,
  FileCode2,
  FileCog,
  FileJson,
  FileText,
  FolderClosed,
  FolderCode,
  FolderOpen,
  Headphones,
  Home,
  Inbox,
  LayoutDashboard,
  PanelLeft,
  PanelRight,
  PanelRightOpen,
  PanelRightClose,
  Share2,
  ListCollapse,
  ListFilter,
  Search,
  Sparkles,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Zap,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  Upload,
  X,
  UserRound,
  CheckSquare,
  Telescope,
  UsersRound,
  BadgeDollarSign,
  Archive,
  Type,
  MessageSquareText,
  MessageSquarePlus,
  MessageCircleHeart,
  Gamepad2,
  FileSearch,
  Flashlight,
  Video,
  Clapperboard,
  Camera,
  SquareUser,
  Brush,
  Palette,
  MonitorPlay,
  MessageSquare,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  MessageSquareWarning,
  Blocks,
  BookOpen,
  Gift,
  PencilLine,
  Flag,
  WandSparkles,
  Wand2,
  AppWindow,
  BriefcaseBusiness,
  Library,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ─── Types ─── */
interface RadioOption {
  label: string
  value: string
}

/* ─── Diff data (mock) for the "变更详情" tab ─── */
type DiffLineKind = 'add' | 'remove' | 'context' | 'hunk'
interface DiffLine {
  kind: DiffLineKind
  oldNum?: number
  newNum?: number
  text: string
}
interface FileDiff {
  path: string
  added: number
  removed: number
  lines: DiffLine[]
}

const FILE_DIFFS: FileDiff[] = [
  {
    path: 'src/pages/tarot/index.tsx',
    added: 28,
    removed: 18,
    lines: [
      { kind: 'hunk', text: '@@ -1,6 +1,8 @@' },
      { kind: 'context', oldNum: 1, newNum: 1, text: "import { View, Text } from '@tarojs/components'" },
      { kind: 'remove', oldNum: 2, text: "import { useLoad } from '@tarojs/taro'" },
      { kind: 'add', newNum: 2, text: "import { useLoad, useRouter } from '@tarojs/taro'" },
      { kind: 'add', newNum: 3, text: "import { useState, useEffect } from 'react'" },
      { kind: 'context', oldNum: 3, newNum: 4, text: "import NavBar from '../../components/NavBar'" },
      { kind: 'context', oldNum: 4, newNum: 5, text: "import TarotCard from '../../components/TarotCard'" },
      { kind: 'hunk', text: '@@ -12,10 +14,20 @@' },
      { kind: 'context', oldNum: 12, newNum: 14, text: 'export default function Tarot() {' },
      { kind: 'remove', oldNum: 13, text: '  const [card, setCard] = useState(null)' },
      { kind: 'add', newNum: 15, text: '  const [cards, setCards] = useState<CardResult[]>([])' },
      { kind: 'add', newNum: 16, text: '  const [loading, setLoading] = useState(false)' },
      { kind: 'add', newNum: 17, text: '  const [mood, setMood] = useState<Mood>("neutral")' },
      { kind: 'context', oldNum: 14, newNum: 18, text: '' },
      { kind: 'remove', oldNum: 15, text: '  const fetch = () => Taro.request({ url: "/api/tarot" })' },
      { kind: 'add', newNum: 19, text: '  const drawCards = async () => {' },
      { kind: 'add', newNum: 20, text: '    setLoading(true)' },
      { kind: 'add', newNum: 21, text: '    const res = await fetchTarotResult(mood)' },
      { kind: 'add', newNum: 22, text: '    setCards(res.cards)' },
      { kind: 'add', newNum: 23, text: '    setLoading(false)' },
      { kind: 'add', newNum: 24, text: '  }' },
    ],
  },
  {
    path: 'src/pages/tarot/result.tsx',
    added: 25,
    removed: 15,
    lines: [
      { kind: 'hunk', text: '@@ -1,5 +1,7 @@' },
      { kind: 'context', oldNum: 1, newNum: 1, text: "import { View, Text } from '@tarojs/components'" },
      { kind: 'add', newNum: 2, text: "import { useState } from 'react'" },
      { kind: 'add', newNum: 3, text: "import { fetchDramas } from '../../services/api'" },
      { kind: 'context', oldNum: 2, newNum: 4, text: "import DramaCard from '../../components/DramaCard'" },
      { kind: 'hunk', text: '@@ -10,6 +12,14 @@' },
      { kind: 'remove', oldNum: 10, text: '  const dramas = MOCK_DRAMAS' },
      { kind: 'add', newNum: 12, text: '  const [dramas, setDramas] = useState<Drama[]>([])' },
      { kind: 'add', newNum: 13, text: '' },
      { kind: 'add', newNum: 14, text: '  useEffect(() => {' },
      { kind: 'add', newNum: 15, text: '    fetchDramas(mood).then(setDramas)' },
      { kind: 'add', newNum: 16, text: '  }, [mood])' },
    ],
  },
  {
    path: 'src/components/TarotCard.tsx',
    added: 18,
    removed: 10,
    lines: [
      { kind: 'hunk', text: '@@ -3,5 +3,8 @@' },
      { kind: 'remove', oldNum: 3, text: 'export default function TarotCard({ label }) {' },
      { kind: 'add', newNum: 3, text: 'interface Props { label: string; onFlip?: () => void }' },
      { kind: 'add', newNum: 4, text: '' },
      { kind: 'add', newNum: 5, text: 'export default function TarotCard({ label, onFlip }: Props) {' },
      { kind: 'context', oldNum: 4, newNum: 6, text: '  const [flipped, setFlipped] = useState(false)' },
      { kind: 'hunk', text: '@@ -10,3 +13,5 @@' },
      { kind: 'remove', oldNum: 10, text: '    <View onClick={() => setFlipped(true)}>' },
      { kind: 'add', newNum: 13, text: '    <View onClick={() => {' },
      { kind: 'add', newNum: 14, text: '      setFlipped(true)' },
      { kind: 'add', newNum: 15, text: '      onFlip?.()' },
      { kind: 'add', newNum: 16, text: '    }}>' },
    ],
  },
  {
    path: 'src/components/DramaCard.tsx',
    added: 20,
    removed: 20,
    lines: [
      { kind: 'hunk', text: '@@ -1,8 +1,10 @@' },
      { kind: 'remove', oldNum: 1, text: "import { View, Text } from '@tarojs/components'" },
      { kind: 'add', newNum: 1, text: "import { View, Text, Image } from '@tarojs/components'" },
      { kind: 'context', oldNum: 2, newNum: 2, text: '' },
      { kind: 'remove', oldNum: 3, text: 'interface Props { title: string; rating: number }' },
      { kind: 'add', newNum: 3, text: 'interface Props {' },
      { kind: 'add', newNum: 4, text: '  title: string' },
      { kind: 'add', newNum: 5, text: '  cover: string' },
      { kind: 'add', newNum: 6, text: '  rating: number' },
      { kind: 'add', newNum: 7, text: '}' },
    ],
  },
  {
    path: 'src/services/api.ts',
    added: 18,
    removed: 14,
    lines: [
      { kind: 'hunk', text: '@@ -4,6 +4,10 @@' },
      { kind: 'remove', oldNum: 4, text: 'export const fetchTarotResult = () =>' },
      { kind: 'remove', oldNum: 5, text: '  Taro.request({ url: `${BASE_URL}/api/tarot/read` })' },
      { kind: 'add', newNum: 4, text: 'export const fetchTarotResult = async (mood: Mood) => {' },
      { kind: 'add', newNum: 5, text: '  const res = await Taro.request({' },
      { kind: 'add', newNum: 6, text: '    url: `${BASE_URL}/api/tarot/read`,' },
      { kind: 'add', newNum: 7, text: "    method: 'POST'," },
      { kind: 'add', newNum: 8, text: '    data: { mood, limit: 3 },' },
      { kind: 'add', newNum: 9, text: '  })' },
      { kind: 'add', newNum: 10, text: '  return res.data' },
      { kind: 'add', newNum: 11, text: '}' },
    ],
  },
]

/* ─── Requirement-form data: capabilities + personalization tags ─── */
interface CapabilityOption {
  id: string
  kind: 'skill' | 'knowledge'
  label: string
  title: string
  description: string
  folderName: string
}

const CAPABILITY_OPTIONS: CapabilityOption[] = [
  {
    id: 'live-script',
    kind: 'skill',
    label: '直播',
    title: '直播带货话术',
    description: '节奏拆解 + 逼单句式，覆盖开播 / 留人 / 转化 / 下播四段。',
    folderName: 'live-script',
  },
  {
    id: 'douyin-kb',
    kind: 'knowledge',
    label: '知识库',
    title: '我的抖音知识库',
    description: '基于账号历史内容构建的私有知识库，可在回复中引用。',
    folderName: 'my-douyin-kb',
  },
]

interface TagDimension {
  id: string
  label: string
  hint: string
}

const TAG_OPTIONS: TagDimension[] = [
  { id: 'gender', label: '性别', hint: '男 / 女 / 未知' },
  { id: 'age', label: '年龄段', hint: '18- / 18-24 / 25-34 / 35-44 / 45+' },
  { id: 'region', label: '地域', hint: '省级 / 一二三线' },
  { id: 'interest', label: '兴趣标签', hint: '抖音兴趣分类（最多匹配 3 类）' },
  { id: 'spending', label: '消费力', hint: 'L1–L5（基于历史下单 / 浏览）' },
  { id: 'active-time', label: '活跃时段', hint: '清晨 / 午间 / 晚高峰 / 深夜' },
  { id: 'fan-level', label: '粉丝等级', hint: '路人 / 关注 / 铁粉 / 真爱粉' },
  { id: 'history', label: '历史互动', hint: '近 30 天评论 / 私信 / 点赞行为' },
]

/** AI-recommended defaults pre-selected for steps 3 / 4 based on the
 *  chosen 应用形态 + 场景. Every surfaced card/pill is something the
 *  system recommends, so they all start toggled on — the user then
 *  opts out of anything they don't want rather than opting in. */
const RECOMMENDED_CAPABILITIES: ReadonlySet<string> = new Set(
  CAPABILITY_OPTIONS.map((c) => c.id),
)
const RECOMMENDED_TAGS: ReadonlySet<string> = new Set(['gender', 'age', 'interest'])

/* ─── Helpers ─── */
function RadioGroup({
  options,
  selected,
  onChange,
  locked = false,
}: {
  options: RadioOption[]
  selected: string
  onChange: (v: string) => void
  /** When true, the group shows the current selection but blocks further
   *  changes. Unselected options collapse visually so the confirmed pick
   *  reads as the step's frozen answer. Use the form's "重新选择"
   *  escape hatch to re-open it. */
  locked?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === selected
        if (locked && !active) return null
        return (
          <button
            key={o.value}
            type="button"
            disabled={locked}
            onClick={() => onChange(o.value)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
              active
                ? 'bg-[var(--chat-form-option-bg)] font-medium text-[var(--color-ink)] shadow-[0_1px_2px_rgba(16,18,24,0.04)]'
                : 'bg-[var(--chat-form-option-bg)] text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]'
            } ${locked ? 'cursor-default' : ''}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  VibeCodingPage                                        */
/* ═══════════════════════════════════════════════════════ */
/* ─── File Tree ─── */
// `FileNode` is defined in ./ProjectProductView and imported above.

/* ─── Trigger/action config (AI-avatar projects) ─── */
type TriggerEventId =
  | 'user-follow'
  | 'user-comment'
  | 'user-like'
  | 'user-gift'
  | 'user-post'

interface TriggerConfig {
  id: string
  /** Editable display name — the user can rename from the detail tab. */
  name: string
  event: {
    id: TriggerEventId
    label: string
    scene: string
    supportedApps: string[]
  }
  action: {
    executorApps: string[]
    executionScene: string
    description: string
  }
}

/** Platform preset triggers. Chat keywords match into these; the detail
 *  view reads event metadata from here. Extend by adding a new id to
 *  TriggerEventId and a row below. */
const TRIGGER_PRESETS: Record<
  TriggerEventId,
  { name: string; event: TriggerConfig['event'] }
> = {
  'user-follow': {
    name: '用户关注后主动发消息',
    event: {
      id: 'user-follow',
      label: '用户关注账号',
      scene: 'AI分身账号个人页',
      supportedApps: ['AI分身'],
    },
  },
  'user-comment': {
    name: '用户评论后回复',
    event: {
      id: 'user-comment',
      label: '用户评论',
      scene: 'AI分身作品评论区',
      supportedApps: ['AI分身'],
    },
  },
  'user-like': {
    name: '用户点赞后致谢',
    event: {
      id: 'user-like',
      label: '用户点赞',
      scene: 'AI分身作品',
      supportedApps: ['AI分身'],
    },
  },
  'user-gift': {
    name: '用户送礼后答谢',
    event: {
      id: 'user-gift',
      label: '用户送礼物',
      scene: 'AI分身直播间',
      supportedApps: ['AI分身'],
    },
  },
  'user-post': {
    name: '用户投稿后推荐',
    event: {
      id: 'user-post',
      label: '用户投稿',
      scene: 'AI分身内容流',
      supportedApps: ['AI分身'],
    },
  },
}

/** Default executor shared across triggers. The description gets filled
 *  per-trigger from the quoted text in the user's chat message. */
const DEFAULT_TRIGGER_ACTION: Omit<TriggerConfig['action'], 'description'> = {
  executorApps: ['抖音官方账号小助手', 'AI分身'],
  executionScene: 'AI聊天',
}

/** Pick a lucide icon per file extension so root-level files (e.g.
 *  app.tsx vs app.less vs app.json) are visually distinguishable without
 *  reading the name. Tint stays unified — only the glyph changes. */
/** Lucide icon paths per mention kind. Kept as bare path strings so we
 *  can build SVG elements via createElementNS without pulling React into
 *  the DOM-manipulation path. Stroke-only icons drawn at 24×24 viewBox. */
const MENTION_ICON_PATHS: Record<MentionKind, string[]> = {
  skills: [
    'M20 11.5V6a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L7.6 1.9A2 2 0 0 0 5.91 1H2v12a2 2 0 0 0 2 2h4',
    'm14 16 2-2-2-2',
    'm20 12 2 2-2 2',
  ],
  tools: [
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  ],
  files: [
    'M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4',
    'M14 2v4a2 2 0 0 0 2 2h4',
    'm5 12-3 3 3 3',
    'm9 18 3-3-3-3',
  ],
  triggers: [
    'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
  ],
  resources: [
    'm16 6 4 14',
    'M12 6v14',
    'M8 8v12',
    'M4 4v16',
  ],
}

type MentionKind = 'skills' | 'tools' | 'files' | 'triggers' | 'resources'

/** Create a small SVG glyph element for a mention kind. Inline SVG so
 *  the pill renders without requiring React to mount a component. */
function makeMentionIconSvg(kind: MentionKind): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '10')
  svg.setAttribute('height', '10')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  for (const d of MENTION_ICON_PATHS[kind]) {
    const path = document.createElementNS(ns, 'path')
    path.setAttribute('d', d)
    svg.appendChild(path)
  }
  return svg
}

/** Build a non-editable pill element for the contentEditable composer.
 *  The pill renders as an inline chip and is treated as a single atomic
 *  unit by the editor — arrow-keys skip over it and backspace removes
 *  the whole thing. Text content stays "@name" so `innerText` parsing
 *  in sendChat still reads the mention as a normal token. The `data-
 *  kind` attribute drives kind-specific color in CSS. */
function buildMentionPill(
  item: { id: string; name: string },
  kind: MentionKind,
): HTMLSpanElement {
  const span = document.createElement('span')
  span.className = 'mention-pill'
  span.contentEditable = 'false'
  span.setAttribute('data-mention-id', item.id)
  span.setAttribute('data-kind', kind)
  span.appendChild(makeMentionIconSvg(kind))
  // Name only — the "@" that the user typed is consumed during the
  // insert (deleted from the text node); the pill itself doesn't echo
  // the "@" glyph back.
  span.appendChild(document.createTextNode(item.name))
  return span
}

/** Render the 商家目标卡 form draft into a markdown document. Stored as
 *  a string and surfaced when the user opens the file in a tab. */
function renderGoalMarkdown(d: {
  brand: string
  district: string
  category: string
  budget: string
  period: string
  audience: string
  ask: string
  constraints: string
}): string {
  return `# 商家目标卡

> 由对话补充的需求经 AI 解析为可执行的种草目标。

## 基本信息

- **商家 / 品牌**：${d.brand}
- **品类**：${d.category}
- **城市 / 商圈**：${d.district}
- **活动周期**：${d.period}
- **市场预算**：${d.budget}
- **目标人群**：${d.audience}

## 商家核心诉求

${d.ask}

## 约束条件

${d.constraints || '（暂无）'}

## AI 目标解析

当前商家的核心诉求是 **五一节点前潜客种草与搜索意向提升**，不适合直接以带货 GMV 作为第一目标。建议采用「头部品宣建立认知 + 本地垂类达人真实体验 + 中腰部场景覆盖 + 素人挑战扩散 + 可投广内容放大」的组合策略。

需要重点监控：

- A3 种草规模
- 看后搜
- 潜客覆盖
- 内容自然贡献占比

避免结果主要由商业投广堆出。

## 待确认追问

- 预算是否包含投广？当前预算记录为达人商业合作费用，若包含投广预算，会影响自然贡献占比判断。
- 是否有必选达人？若商家指定头部达人，需锁定在达人包并重新估算预算和效果。
`
}

/** Single source of truth for the proposal-flow artifact summaries.
 *  The in-chat ArtifactCard pulls filename → summary from here. */
const PROPOSAL_FILE_SUMMARY: Record<string, string> = {
  '商家目标卡.md': '商家目标已结构化，包含核心诉求、约束和 AI 解析',
  '人群诊断.md':
    '人群与流量诊断结论：3 个风险 + 4 个目标阈值 + 同类商家 Benchmark',
  '人群诊断看板': '可视化数据看板：KPI / 风险 / 人群 / 流量结构 / Benchmark',
  '达人包.md': '已确认的达人包策略，含结构、指标预估和 AI 建议',
  '玩法brief.md':
    '4 套玩法 + Brief 模板：本地垂类 / 头部品宣 / 素人挑战 / 可投广候选',
  '提案报告.md': '完整提案报告',
  '执行看板.md': '执行看板配置（达人 / 机构 / 星图任务拆分）',
  '复盘.md': '复盘文档（指标对比 + 经验沉淀）',
}

/** Render the 人群与流量诊断 step output into a markdown document. */
function renderDiagnosisMarkdown(): string {
  return `# 人群与流量诊断

> 数据来源：@风神 同类火锅品牌过去 30 天指标 + @iDA 商家历史 A3 / 看后搜结构。

## 风险诊断

### 潜客覆盖缺口（高）

近 30 天潜客内容触达低于同类商家均值 23%。建议本次提高本地垂类和可投广内容占比，扩大潜客覆盖。

### 看后搜机会（高）

同类火锅品牌中，**场景化探店**和**套餐价值内容**对看后搜的贡献最明显，需要在达人 brief 中强约束这两类元素。

### 投广依赖风险（中）

商家历史营销中商业投广流量占比偏高，A3 达成主要靠投广堆出。本次需要把内容自然贡献占比从 38% 提升到 50% 以上。

## 人群覆盖结构

- 老客覆盖：高
- 新客覆盖：中
- 搜索意向人群：中低
- 潜客覆盖：低
- A3 种草人群：低（需重点提升）

## 流量结构

- 商业投广流量：62%（偏高）
- 内容自然流量：38%
- 达人自然内容贡献：24%
- 可投广内容贡献：18%

## 建议目标阈值

| 指标 | 阈值 |
| --- | --- |
| A3 种草人群 | ≥ 120 万 |
| 看后搜规模 | ≥ 30 万 |
| 内容自然贡献占比 | ≥ 50% |
| 优质内容率 | ≥ 35% |

## 同类商家策略 Benchmark

| 策略类型 | 达人包结构 | A3 表现 | 看后搜 | 自然流量占比 | 平台建议 |
| --- | --- | --- | --- | --- | --- |
| 高头部品宣型 | 头部占比高 | 高 | 中 | 低 | 仅保留 1-2 位作为声量锚点 |
| 本地垂类种草型 | 垂类达人占比高 | 中高 | 高 | 高 | **推荐** |

## 诊断结论

历史结果偏依赖商业投广。本次提案应优先提升「本地垂类真实体验内容」和「高质量可投广素材」占比，目标将内容自然贡献占比提升至 50% 以上。
`
}

/** Render the chosen 达人包 into a markdown document. Captures the
 *  pack id, projected metrics, talent bucket structure, and the AI's
 *  recommendation note so the choice is auditable as a project artefact. */
function renderPackMarkdown(pick: ProposalPackId): string {
  const p = getPackProfile(pick)
  const buckets = p.buckets
    .map(
      (b) =>
        `| ${b.name} | ${b.count} 人 | ${b.budget} | ${b.note} |`,
    )
    .join('\n')
  return `# 达人包策略 · ${p.id}

> ${p.desc}

## 关键指标预估

| 预计 A3 种草人群 | 内容自然贡献 | 看后搜规模 | 预算 |
| --- | --- | --- | --- |
| ${p.metrics.a3} | ${p.metrics.natural} | ${p.metrics.afterSearch} | ${p.metrics.budget} |

## 达人结构

| 模块 | 数量 | 预算占比 | 核心作用 |
| --- | --- | --- | --- |
${buckets}

## AI 建议

${p.aiNote}

## 下一步

进入玩法 + Brief 编排（@mira 生成达人侧 brief；@aeolus 校准内容方向）。
`
}

/** Step 5 — assemble the full proposal report from prior step output.
 *  Mirrors what the original 提案报告生成器 surfaces: 商家目标理解 +
 *  种草经营策略 + 关键指标预估 + 达人包结构表 + AI 修改建议 + 审批流。 */
function renderReportMarkdown(
  goal: ProposalGoalDraft,
  pack: ProposalPackId,
): string {
  const p = getPackProfile(pack)
  const buckets = p.buckets
    .map(
      (b) => `| ${b.name} | ${b.count} 人 | ${b.budget} | ${b.note} |`,
    )
    .join('\n')
  return `# ${goal.brand}｜五一潜客种草方案

> 方案版本 V2 ｜ ${pack} ｜ 预算 ${p.metrics.budget} ｜ 周期 ${goal.period}

## 1. 商家目标理解

本次目标不是短期达人带货，而是五一节点前提升潜客认知和搜索意向。建议用达人内容建立"朋友聚餐、性价比套餐、夜宵火锅"等消费场景，带动 A3 种草人群和看后搜增长。

> 商家原话：${goal.ask}

## 2. 种草经营策略

采用"头部品宣达人建立声量 + 本地垂类达人提供真实体验 + 中腰部达人扩大场景覆盖 + 素人挑战营造参与氛围 + 可投广素材放大潜客"的组合策略。

### 关键指标预估

| 预计 A3 | 预计看后搜 | 内容自然贡献 | 预算 |
| --- | --- | --- | --- |
| ${p.metrics.a3} | ${p.metrics.afterSearch} | ${p.metrics.natural} | ${p.metrics.budget} |

## 3. 达人包结构

| 模块 | 数量 | 预算占比 | 核心作用 |
| --- | --- | --- | --- |
${buckets}

## 4. 玩法 + Brief

详情见 \`briefs/玩法brief.md\`，包含本地垂类、头部品宣、素人挑战、可投广候选 4 套模板。

## 5. AI 修改建议

建议在提案里补充"内容自然贡献占比"作为商家复盘口径，并解释为什么不建议过度增加头部达人预算。

## 6. 审批流

- 行业负责人：**已通过**
- 财务预算确认：**待确认**
- 星图合作校验：**进行中**

## 7. 提案质量检查

- 目标清晰度：92
- 达人包完整度：88
- 预算合理性：76（建议补充投广预算口径）
- 自然贡献风险：中（需要 brief 严控可投广素材）
`
}

/** Step 6 — render the 转执行看板 snapshot into a markdown document.
 *  Captures the funnel + 5 status modules so the dashboard is auditable
 *  as a project artefact. */
function renderDashboardMarkdown(): string {
  const funnel = PROPOSAL_FUNNEL.map(
    (f) => `| ${f.label} | ${f.value} |`,
  ).join('\n')
  const modules = PROPOSAL_MODULES.map((m) => {
    const items = m.items
      .map((it) =>
        it.alert
          ? `- **${it.title}** —— ${it.meta}\n  > ⚠ ${it.alert}`
          : `- **${it.title}** —— ${it.meta}`,
      )
      .join('\n')
    return `### ${m.title}（${m.status}）\n\n${items}`
  }).join('\n\n')
  return `# 执行看板

> 提案不止导出文档，而是一键拆成达人、机构、星图、达人中心和飞书任务。

## 执行漏斗

| 阶段 | 数量 |
| --- | --- |
${funnel}

## 执行模块

${modules}

## 同步频率

- 每日同步飞书日报到行业群
- 每周一对照 \`reports/提案报告.md\` 校准节奏
- 复盘节点（5/05 后）触发自动出 \`reports/复盘.md\`
`
}

/** Step 7 — render the 复盘 doc. Final terminal artefact: actual data
 *  vs target, traffic decomposition, module contribution table, and
 *  next-iteration advice. */
function renderReviewMarkdown(): string {
  const stats = PROPOSAL_REVIEW_STATS.map(
    (s) => `- **${s.label}**: ${s.value}（${s.note}）`,
  ).join('\n')
  const traffic = PROPOSAL_REVIEW_TRAFFIC.map(
    (t) => `| ${t.label} | ${t.valueLabel} |`,
  ).join('\n')
  const headers = Object.keys(PROPOSAL_REVIEW_MODULES[0])
  const modules = PROPOSAL_REVIEW_MODULES.map(
    (row) => `| ${headers.map((h) => row[h]).join(' | ')} |`,
  ).join('\n')
  const advice = PROPOSAL_REVIEW_ADVICE.map(
    (a) => `### ${a.title}\n\n${a.desc}`,
  ).join('\n\n')
  return `# 种草复盘

> 复盘重点不是总量，而是种草质量和自然贡献。

## 实际数据 vs 目标

${stats}

## 流量贡献拆解

| 维度 | 实际值 |
| --- | --- |
${traffic}

> AI 诊断：总 A3 和看后搜均达成，但 A3 仍较依赖投广；看后搜的自然贡献表现更好，主要来自本地垂类达人和中腰部真实体验内容。下次建议提高本地垂类占比，减少头部达人预算。

## 达人包模块贡献

| ${headers.join(' | ')} |
| ${headers.map(() => '---').join(' | ')} |
${modules}

## 下次策略建议

${advice}

## 可复用资产沉淀

- 优选达人包：18 人
- 可投广内容池：9 条
- 高质量机构：2 家
- 模板归档：「餐饮节点潜客种草」可作为后续同类项目起点
`
}

/** Render the 4 玩法 + Brief into a single markdown document. */
function renderBriefMarkdown(): string {
  return `# 玩法 + Brief 编排

> 每个达人桶都对应一种玩法 + Brief 模板。统一标准后再下发，避免内容方向漂移。

${PROPOSAL_PLAYS.map(
  (p) => `## ${p.name}｜${p.tag}

${p.scope}

### 创作目标

${p.goal}

### 必须包含

${p.mustHave.map((m) => `- ${m}`).join('\n')}

### 质量要求

${p.quality}
`,
).join('\n')}
## 下发说明

- 头部 / 本地垂类达人走 @mira 单独沟通，确认档期与脚本初稿后再下星图订单
- 中腰部 / 素人挑战投稿走机构批量下发，机构内预筛后才能进入审核
- 可投广候选标签由 @holmes 自动初评，命中规则才会进入投广素材池
`
}

/** Flatten a project FileNode tree into the flat list the mention
 *  picker consumes. Folders become `foo/` paths so `@src` and
 *  `@src/pages/index.tsx` both end up unique. */
function flattenFileTreeForMention(
  nodes: FileNode[],
  prefix = '',
): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = []
  for (const n of nodes) {
    const path = prefix + n.name
    if (n.type === 'file') {
      out.push({ id: path, name: path })
    } else if (n.children) {
      out.push(...flattenFileTreeForMention(n.children, path + '/'))
    }
  }
  return out
}

function getFileIcon(name: string): typeof File {
  const lower = name.toLowerCase()
  if (/\.(tsx|ts|jsx|js|mjs|cjs)$/.test(lower)) return FileCode2
  if (/\.json$/.test(lower)) return FileJson
  if (/\.(css|less|scss|sass|styl)$/.test(lower)) return Palette
  if (/\.(yaml|yml|toml|ini|env)$/.test(lower)) return FileCog
  if (/\.(md|mdx|txt)$/.test(lower)) return FileText
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/.test(lower)) return ImageIcon
  return File
}

function FileTreeView({
  nodes,
  expanded,
  onToggleDir,
  onOpenFile,
  depth,
  parentPath,
  railStartDepth = 0,
  iconFor,
  isActive,
}: {
  nodes: FileNode[]
  expanded: Set<string>
  onToggleDir: (path: string) => void
  onOpenFile: (name: string) => void
  depth: number
  parentPath: string
  /** Lowest depth at which to draw an indent rail. Platform sidebar
   *  passes 1 so the outermost rail connecting files to the project
   *  header is suppressed. */
  railStartDepth?: number
  /** Optional per-node icon override — the product view uses it to paint
   *  synthetic category folders and page leaves with their own icon.
   *  Returns undefined to fall back to the default folder / file icon.
   *  Applies to both dir and file nodes. */
  iconFor?: (node: FileNode, path: string, depth: number) => LucideIcon | undefined
  /** Optional leaf-active predicate — the product view uses it to
   *  highlight the page node matching the current preview route. */
  isActive?: (node: FileNode, path: string) => boolean
}) {
  // Each row carries `depth` absolutely-positioned rails — one per
  // ancestor level — so the user can trace a child back to its parent
  // folder. Rails only render for rows at depth ≥ 1 (root rows have no
  // parent to connect to), and since rows stack contiguously the rails
  // visually fuse into continuous vertical guides for each open branch.
  const renderRails = () =>
    depth === 0
      ? null
      : Array.from({ length: depth })
          .map((_, i) => i)
          .filter((i) => i >= railStartDepth)
          .map((i) => (
            <span
              key={i}
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-[var(--color-ink)]/[0.06]"
              style={{ left: 12 + i * 14 + 6 }}
            />
          ))

  return (
    <>
      {nodes.map((node) => {
        const path = parentPath ? `${parentPath}/${node.name}` : node.name
        const isExpanded = expanded.has(path)
        const pl = 12 + depth * 14
        if (node.type === 'dir') {
          const DirIcon = iconFor?.(node, path, depth)
          return (
            <div key={path}>
              <div className="relative">
                {renderRails()}
                <button
                  onClick={() => onToggleDir(path)}
                  className="flex w-full items-center gap-1.5 py-1 text-[12px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/95"
                  style={{ paddingLeft: pl }}
                >
                  {DirIcon ? (
                    <DirIcon size={13} className="shrink-0 text-[var(--color-ink)]/60" />
                  ) : isExpanded ? (
                    <FolderOpen size={13} className="shrink-0 text-[var(--color-ink)]/60" />
                  ) : (
                    <FolderClosed size={13} className="shrink-0 text-[var(--color-ink)]/60" />
                  )}
                  {node.name}
                </button>
              </div>
              {isExpanded && node.children && (
                <FileTreeView
                  nodes={node.children}
                  expanded={expanded}
                  onToggleDir={onToggleDir}
                  onOpenFile={onOpenFile}
                  depth={depth + 1}
                  parentPath={path}
                  railStartDepth={railStartDepth}
                  iconFor={iconFor}
                  isActive={isActive}
                />
              )}
            </div>
          )
        }
        const Icon = iconFor?.(node, path, depth) ?? getFileIcon(node.name)
        const active = isActive?.(node, path) ?? false
        return (
          <div key={path} className="relative">
            {renderRails()}
            <button
              onClick={() => onOpenFile(node.name)}
              className={`flex w-full items-center gap-1.5 py-1 text-[12px] transition-colors ${
                active
                  ? 'bg-[var(--color-ink)]/[0.07] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/75 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/95'
              }`}
              style={{ paddingLeft: pl }}
            >
              <Icon
                size={12}
                className={`shrink-0 ${active ? 'text-[var(--color-ink)]/80' : 'text-[var(--color-ink)]/55'}`}
              />
              {node.name}
            </button>
          </div>
        )
      })}
    </>
  )
}

/* ─── Phone mockup that scales to fit container ─── */
const PHONE_W = 286
const PHONE_H = 620

function PhoneMockup({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  // The glass-edge pseudo paints a 1px white gradient rim — intended as
  // subtle glass polish on dark surfaces, but shows up as visible side
  // glows on the black bezel in light mode. Zero out the alpha there.
  const isLight = useThemeStore((s) => s.mode) === 'light'

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const sx = (width - 32) / PHONE_W // 32px horizontal padding
    const sy = (height - 32) / PHONE_H // 32px vertical padding
    setScale(Math.min(sx, sy, 1))
  }, [])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 items-center justify-center">
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          ['--edge-alpha' as string]: isLight ? 0 : 0.3,
        }}
        className="glass-edge relative shrink-0 rounded-[36px]"
      >
        <div className="absolute inset-0 rounded-[36px] bg-[var(--phone-bezel)] p-[3px] shadow-[var(--phone-shadow)] ring-1 ring-[var(--divider-soft)]">
          <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-[var(--color-surface-0)] ring-1 ring-black/60">
            <div className="relative h-full w-full overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Platform — 个人空间 dropdown data ─── */

type SpaceTile = { icon: typeof UserRound; label: string }
const SPACE_SECTIONS: { title: string; color: string; tiles: SpaceTile[] }[] = [
  {
    title: '我的',
    color: '#8b5cf6',
    tiles: [{ icon: UserRound, label: '个人空间' }],
  },
  {
    title: '平台',
    color: '#e72e75',
    tiles: [
      { icon: CheckSquare, label: '解决方案' },
      { icon: Telescope, label: '前沿实验室' },
    ],
  },
  {
    title: '运营',
    color: '#fa8b14',
    tiles: [
      { icon: UsersRound, label: '作者运营' },
      { icon: BadgeDollarSign, label: '资金结算' },
      { icon: Archive, label: '版权运营' },
      { icon: Type, label: '敏感词运营' },
      { icon: MessageSquareText, label: '群聊' },
      { icon: Search, label: '抖音搜索' },
      { icon: MessageCircleHeart, label: '垂类运营' },
      { icon: Gamepad2, label: '抖音游戏' },
      { icon: FileSearch, label: '调研中台' },
      { icon: Flashlight, label: '热点资讯运营' },
      { icon: Video, label: '抖音直播运营' },
      { icon: Clapperboard, label: '抖音UGC' },
      { icon: Camera, label: '社交互动' },
      { icon: SquareUser, label: '直播用户平台' },
      { icon: Brush, label: '效果与创作' },
    ],
  },
  {
    title: '治理',
    color: '#3b82f6',
    tiles: [
      { icon: MonitorPlay, label: '视频治理' },
      { icon: Video, label: '直播治理' },
      { icon: SquareUser, label: '账号治理' },
      { icon: MessageSquare, label: 'IM治理' },
      { icon: Smartphone, label: '小程序治理' },
      { icon: ImageIcon, label: 'AIGC治理' },
      { icon: ShieldCheck, label: '版权治理' },
      { icon: Clapperboard, label: '短剧治理' },
      { icon: Gamepad2, label: '游戏治理' },
      { icon: BadgeDollarSign, label: '资金安全' },
      { icon: AlertTriangle, label: 'ZL治理' },
      { icon: MessageSquareWarning, label: '评论治理' },
      { icon: Blocks, label: '生态治理' },
      { icon: MessageSquareText, label: '舆情' },
      { icon: Gift, label: '投稿道具' },
    ],
  },
  {
    title: '职能',
    color: '#8b5cf6',
    tiles: [
      { icon: Sparkles, label: '开放平台' },
      { icon: PencilLine, label: '智能标注' },
      { icon: Flag, label: '数据BP' },
      { icon: WandSparkles, label: 'MagicX' },
      { icon: MessageSquare, label: '体验' },
      { icon: AppWindow, label: '产品研发' },
      { icon: BriefcaseBusiness, label: '劳动力管理' },
    ],
  },
]

/** Popover shown when the 个人空间 label is clicked — a dense tile grid
 *  grouped by platform/ops/governance sections. Positioned fixed so it
 *  escapes the 230px sidebar width. Selecting a tile routes the label
 *  back to the sidebar button via `onSelect`. */
function SpaceMenuPopover({
  pos,
  active,
  onSelect,
  onClose,
}: {
  pos: { top: number; left: number }
  active: string
  onSelect: (label: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [onClose])
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 70,
        maxHeight: `calc(100vh - ${pos.top}px - 12px)`,
      }}
      className="thin-scroll inline-flex flex-col overflow-y-auto rounded-2xl bg-[var(--color-surface-0)] p-3 shadow-[0_12px_32px_-8px_rgba(16,18,24,0.14),0_0_1px_rgba(16,18,24,0.3)]"
    >
      {SPACE_SECTIONS.map((section) => (
        <div key={section.title} className="flex w-full flex-col rounded-xl p-3">
          <p className="mb-2 text-[12px] leading-4 text-[var(--color-ink)]/55">
            {section.title}
          </p>
          <div className="flex w-[576px] flex-wrap items-center gap-2.5">
            {section.tiles.map(({ icon: Icon, label }) => {
              const isActive = label === active
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    onSelect(label)
                    onClose()
                  }}
                  className={`flex w-[136px] items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                    isActive
                      ? 'border-[var(--color-ink)]/60 bg-[var(--fill-subtle)]'
                      : 'border-[var(--divider)] bg-[var(--color-surface-0)] hover:bg-[var(--fill-subtle)]'
                  }`}
                >
                  <Icon size={14} style={{ color: section.color }} />
                  <span className="truncate text-[14px] leading-5 text-[var(--color-ink)]">
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Inline Figma brand icon — matches the Figma design's `figma` glyph. */
function FigmaIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.6665 3.33325C2.6665 1.6764 4.00965 0.333252 5.6665 0.333252H10.3332C11.99 0.333252 13.3332 1.6764 13.3332 3.33325C13.3332 4.27567 12.8986 5.1166 12.2189 5.66659C12.8986 6.21657 13.3332 7.0575 13.3332 7.99992C13.3332 9.65677 11.99 10.9999 10.3332 10.9999C9.71646 10.9999 9.1432 10.8138 8.6665 10.4947V12.6666C8.6665 14.3234 7.32336 15.6666 5.6665 15.6666C4.00965 15.6666 2.6665 14.3234 2.6665 12.6666C2.6665 11.7242 3.10106 10.8832 3.78073 10.3333C3.10106 9.78327 2.6665 8.94234 2.6665 7.99992C2.6665 7.0575 3.10106 6.21657 3.78073 5.66658C3.10106 5.1166 2.6665 4.27567 2.6665 3.33325ZM5.6665 6.33325C4.74603 6.33325 3.99984 7.07944 3.99984 7.99992C3.99984 8.92039 4.74603 9.66658 5.6665 9.66658H7.33317V6.33325H5.6665ZM7.33317 4.99992H5.6665C4.74603 4.99992 3.99984 4.25373 3.99984 3.33325C3.99984 2.41278 4.74603 1.66659 5.6665 1.66659H7.33317V4.99992ZM10.3332 4.99992C11.2536 4.99992 11.9998 4.25373 11.9998 3.33325C11.9998 2.41278 11.2536 1.66659 10.3332 1.66659H8.6665V4.99992H10.3332ZM10.3332 6.33325C9.4127 6.33325 8.6665 7.07944 8.6665 7.99992C8.6665 8.92039 9.4127 9.66658 10.3332 9.66658C11.2536 9.66658 11.9998 8.92039 11.9998 7.99992C11.9998 7.07944 11.2536 6.33325 10.3332 6.33325ZM7.33317 10.9999H5.6665C4.74603 10.9999 3.99984 11.7461 3.99984 12.6666C3.99984 13.5871 4.74603 14.3333 5.6665 14.3333C6.58698 14.3333 7.33317 13.5871 7.33317 12.6666V10.9999Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ─── Platform home (new-project landing) ─── */

const HOME_SUGGESTIONS = [
  '做一款竖版弹幕射击 + Roguelike 太空游戏',
  '生成运营活动社群的AI分身',
  '生成推广《剑来》动画的异形卡',
  '生成评论区回复用户问题的AI分身',
  '视频漏放归因',
  '治理标准条款查询',
  '视频误伤分析',
  '产出调研报告',
]

type AiMode = 'coding' | 'business' | 'orchestration'
const AI_MODES: { id: AiMode; label: string; desc: string; icon: typeof Code2 }[] = [
  {
    id: 'coding',
    label: 'AI Coding',
    desc: '生成代码、组件、页面，适合开发型需求',
    icon: Code2,
  },
  {
    id: 'business',
    label: 'AI 业务助手',
    desc: '对话式完成业务流程，适合数据查询与问答',
    icon: MessageSquare,
  },
  {
    id: 'orchestration',
    label: '智能编排',
    desc: '串联多步任务与工具，适合复杂工作流',
    icon: Blocks,
  },
]

function PlatformHome({
  draft,
  setDraft,
  onSubmit,
}: {
  draft: string
  setDraft: (s: string) => void
  onSubmit: (text: string) => void
}) {
  const isLight = useThemeStore((s) => s.mode) === 'light'
  const [aiMode, setAiMode] = useState<AiMode>('coding')
  const [aiMenuPos, setAiMenuPos] = useState<{ top: number; left: number } | null>(null)
  const aiBtnRef = useRef<HTMLButtonElement>(null)
  const aiMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aiMenuPos) return
    const handler = (e: PointerEvent) => {
      const target = e.target as Node
      if (
        aiMenuRef.current &&
        !aiMenuRef.current.contains(target) &&
        aiBtnRef.current &&
        !aiBtnRef.current.contains(target)
      ) {
        setAiMenuPos(null)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [aiMenuPos])
  const currentMode = AI_MODES.find((m) => m.id === aiMode) ?? AI_MODES[0]
  const CurrentIcon = currentMode.icon
  return (
    <div
      className={`relative my-3 mr-3 flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[16px] px-6 pb-24 pt-6 ${
        isLight ? 'bg-white' : 'bg-[var(--color-surface-0)]'
      }`}
    >
      {/* Ambient illustration — grainy pastel glow pinned to the top-right.
           Only shown in light mode; dark mode keeps the flat surface. */}
      {isLight && (
        <img
          aria-hidden
          src="/bg/platform-home-glow.png"
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-auto w-[720px] max-w-[70%] select-none object-contain object-right-top"
        />
      )}

      {/* Hero */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="text-center font-semibold tracking-[0.64px] text-[var(--color-ink)]">
          <span className="text-[32px]">抖音</span>
          <span className="text-[16px]"> </span>
          <span className="text-[32px]">AI</span>
          <span className="text-[16px]"> </span>
          <span className="text-[32px]">打开无限可能</span>
        </div>
        <p className="text-[16px] leading-[22px] text-[var(--color-ink)]/60">
          所见即所得，一站式满足需求
        </p>
      </div>

      {/* Prompt composer — h-[140px] fixed card, content justified to the
           bottom (textarea grows upward from the action row). */}
      <div className="relative mt-6 w-full max-w-[810px]">
        <div className="relative flex h-[140px] flex-col justify-end gap-2 overflow-hidden rounded-[16px] bg-[var(--color-surface-0)] p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_10px_15px_-5px_rgba(0,0,0,0.05)]">
          {/* rainbow tint */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-4 blur-[20px]"
            style={{
              backgroundImage:
                'linear-gradient(0deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%), linear-gradient(98deg, rgba(255,186,51,0.15) 7.59%, rgba(78,217,44,0.15) 23.2%, rgba(69,146,242,0.15) 44.7%, rgba(110,124,253,0.15) 66.3%, rgba(225,53,248,0.15) 92.3%)',
            }}
          />

          <div className="relative flex min-h-0 flex-1 flex-col pl-3 pt-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit(draft)
                }
              }}
              placeholder="请描述你遇到的具体业务痛点或需求..."
              rows={1}
              className="block w-full resize-none bg-transparent text-[14px] leading-[22px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/60"
            />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                ref={aiBtnRef}
                type="button"
                onClick={() => {
                  if (aiMenuPos) {
                    setAiMenuPos(null)
                    return
                  }
                  const rect = aiBtnRef.current?.getBoundingClientRect()
                  if (rect) setAiMenuPos({ top: rect.bottom + 8, left: rect.left })
                }}
                className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--divider)] px-4 text-[14px] font-semibold text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <CurrentIcon size={16} strokeWidth={1.8} />
                {currentMode.label}
              </button>
              <button
                type="button"
                className="flex h-9 items-center gap-1 rounded-full border border-[var(--divider)] px-4 text-[14px] font-semibold text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <FolderCode size={16} strokeWidth={1.8} />
                资源
              </button>
              <button
                type="button"
                aria-label="附件"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--divider)] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <Paperclip size={16} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="Figma"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--divider)] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <FigmaIcon size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-semibold text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                Auto
                <ChevronDown size={16} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="发送"
                onClick={() => onSubmit(draft)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-ink-contrast)] transition-all hover:-translate-y-[1px] hover:opacity-90"
              >
                <ArrowUp size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions header */}
      <div className="relative mt-6 flex items-center gap-2 text-[var(--color-ink)]/60">
        <Sparkles size={12} />
        <p className="text-[14px] leading-[22px]">没有灵感？试试点击以下需求</p>
      </div>

      {/* Suggestions */}
      <div className="relative mt-4 flex w-full max-w-[810px] flex-wrap items-center justify-center gap-3">
        {HOME_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSubmit(s)}
            className="flex h-[42px] items-center gap-2 rounded-[12px] bg-[var(--fill-subtle)] px-4 text-[14px] leading-5 text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
          >
            <span>{s}</span>
            <ArrowUpRight size={12} className="text-[var(--color-ink)]/60" />
          </button>
        ))}
      </div>

      {/* AI mode dropdown — position: fixed so it escapes the composer's
           overflow-hidden rounded-rect clipping. */}
      {aiMenuPos && (
        <div
          ref={aiMenuRef}
          style={{ position: 'fixed', top: aiMenuPos.top, left: aiMenuPos.left, zIndex: 70 }}
          className="w-[312px] overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--color-surface-0)] shadow-[0_12px_28px_-8px_rgba(16,18,24,0.18)]"
        >
          {AI_MODES.map((m) => {
            const Icon = m.icon
            const isActive = m.id === aiMode
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setAiMode(m.id)
                  setAiMenuPos(null)
                }}
                className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                  isActive ? 'bg-[var(--fill-subtle)]' : 'hover:bg-[var(--fill-subtle)]'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? 'bg-[var(--color-ink)] text-[var(--color-ink-contrast)]'
                      : 'bg-[var(--fill-hover)] text-[var(--color-ink)]/80'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink)]">
                    {m.label}
                    {isActive && <Check size={12} className="text-[var(--color-ink)]/70" />}
                  </span>
                  <span className="text-[11.5px] leading-[1.5] text-[var(--color-ink)]/55">
                    {m.desc}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Platform layout sidebar ─── */

/** Left-side project sidebar shown in the Platform layout. Contains brand
 *  chrome, the + 新建项目 button, platform nav (Skills / 资源库 / 创意广场),
 *  and a multi-project tree where the expanded project reuses the shared
 *  `FileTreeView` with the workspace's real `fileTree` state. Other projects
 *  are static collapsed stubs. */
function PlatformSidebar({
  projectTrees,
  expandedDirs,
  toggleDir,
  openFileInTab,
  onCollapse,
  onNewProject,
  openProjects,
  setOpenProjects,
  onSwitchProject,
  onCollapseAll,
  onOpenResourceLibrary,
  onOpenSkills,
  onOpenCreativeSquare,
  onOpenDataOps,
  activeNav,
  activeRoute,
  activeProjectName,
  sessions,
  activeSessionId,
  onSwitchSession,
  onNewSession,
  layout,
  onChangeLayout,
  themeMode,
  onChangeThemeMode,
  createdProjects,
}: {
  /** Per-project file trees. Projects missing from this map render the
   *  "暂无文件" empty state when expanded. */
  projectTrees: Record<string, FileNode[]>
  expandedDirs: Set<string>
  toggleDir: (path: string) => void
  openFileInTab: (filename: string) => void
  onCollapse: () => void
  onNewProject: () => void
  openProjects: Set<string>
  setOpenProjects: React.Dispatch<React.SetStateAction<Set<string>>>
  /** Clicking a project row activates it on the right-side workspace
   *  (project title + a fresh session). Called alongside toggleProject
   *  so the row still expands/collapses. */
  onSwitchProject: (name: string) => void
  /** Collapse every open folder + project down to the root level. */
  onCollapseAll: () => void
  /** Open the dedicated 资源库 page on the right side. */
  onOpenResourceLibrary: () => void
  /** Open the Skills placeholder page. */
  onOpenSkills: () => void
  /** Open the 创意广场 placeholder page. */
  onOpenCreativeSquare: () => void
  /** Open the 数据运营 placeholder page. */
  onOpenDataOps: () => void
  /** Which top-level nav is currently active — drives the highlight. */
  activeNav: 'Skills' | '资源库' | '创意广场' | '数据运营' | null
  /** Active preview page label — highlights the matching 页面 node in
   *  the product view. null falls back to the default page (首页). */
  activeRoute: string | null
  /** Name of the currently-active project — page highlighting only
   *  applies to that project's product view. */
  activeProjectName: string
  /** Chat session list — rendered as a 对话 section below 项目列表 so
   *  users can switch sessions without opening the chat-header dropdown. */
  sessions: { id: string; name: string }[]
  activeSessionId: string
  onSwitchSession: (id: string) => void
  onNewSession: () => void
  /** Layout + theme switcher — relocated from the (removed) top header. */
  layout: 'workspace' | 'editor' | 'code' | 'platform'
  onChangeLayout: (next: 'workspace' | 'editor' | 'code' | 'platform') => void
  themeMode: 'light' | 'dark'
  onChangeThemeMode: (next: 'light' | 'dark') => void
  /** Dynamically created projects (e.g. game flow output) — appended
   *  to the top of the project list. */
  createdProjects: string[]
}) {
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false)
  const layoutMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!layoutMenuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!layoutMenuRef.current?.contains(e.target as Node)) setLayoutMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [layoutMenuOpen])
  const [spaceMenuPos, setSpaceMenuPos] = useState<{ top: number; left: number } | null>(null)
  /** Height of the 对话 section in px. The 项目列表 above fills the rest
   *  of the available height. Drag the divider between the two sections
   *  to resize. */
  const [conversationHeight, setConversationHeight] = useState(200)
  const conversationDragRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const onConversationDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    conversationDragRef.current = { startY: e.clientY, startHeight: conversationHeight }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onConversationDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = conversationDragRef.current
    if (!s) return
    // Dragging up makes the conversation section taller; dragging down
    // shrinks it. Clamp to a sensible range so neither side disappears.
    const next = Math.min(480, Math.max(80, s.startHeight - (e.clientY - s.startY)))
    setConversationHeight(next)
  }
  const onConversationDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    conversationDragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
  const [activeSpace, setActiveSpace] = useState('个人空间')
  // The project list is master/detail. The list shows every project's
  // plain-language 产物视图; drilling into a project (`drilledProject`)
  // swaps the panel for that one project's full file-view directory,
  // with a 返回 back to the list.
  const [drilledProject, setDrilledProject] = useState<string | null>(null)
  const spaceBtnRef = useRef<HTMLButtonElement>(null)
  const toggleProject = (name: string) =>
    setOpenProjects((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  /* Sidebar project list. Entries with a tree in `projectTrees` expand
   * to a real FileTreeView; the rest fall back to an "暂无文件" stub.
   * `createdProjects` are appended at the top so freshly-generated
   * projects (e.g. Garuda after the home flow finishes) read as new. */
  const ALL_PROJECTS = [
    // De-dup: createdProjects may include Garuda once the user has run
    // the home-flow this session — but we always want Garuda pinned in
    // the fixed list below, so filter it out of createdProjects to
    // avoid double-listing.
    ...createdProjects.filter((p) => p !== 'Garuda · 神明黄昏'),
    // Order: 分身 → 小程序 → 个人网站 → 游戏 → 营销设计·H5 → 营销提案.
    // 粉丝互动机器人 / 探店视频创作助手 / 每日打卡小程序 are hidden —
    // config exists but there's no scripted demo flow for them yet.
    '陶白白 Sensei 分身',
    '第五人格塔罗小程序',
    '个人作品集网站',
    'Garuda · 神明黄昏',
    '六一儿童节活动',
    '沪上火锅·五一种草提案',
  ]

  return (
    <aside className="flex h-full w-full flex-col pt-6">
      {/* Brand header */}
      <div className="flex h-8 shrink-0 items-center justify-between gap-2 px-5">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <svg
            width="108"
            height="20"
            viewBox="0 0 108 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="抖音AI工坊"
            className="h-5 shrink-0 text-[var(--color-ink)]"
          >
            <path d="M38.2988 10.9897L40.0596 10.7847V12.4634L38.2988 12.6665V16.8335H36.3779V12.8882L30.3809 13.5874L30.3613 13.4634L30.1465 12.0415L30.126 11.9077L30.2607 11.8921L36.3779 11.1929V1.64209H38.2988V10.9897ZM28.7246 4.55615H30.4844V6.18408H28.7275V8.77783L30.4531 8.48877V10.1499L30.3467 10.1694L28.7275 10.4741V14.7935L28.7256 14.9019C28.7078 15.4348 28.5558 15.8628 28.25 16.1714C27.9454 16.4787 27.505 16.6505 26.9443 16.7056L26.8311 16.7153C26.3383 16.7484 25.8186 16.7164 25.3203 16.6226L25.2393 16.6069L25.2188 16.5288L24.7998 15.0112L25 15.0425C25.4484 15.113 25.8902 15.1331 26.3213 15.104H26.3223L26.3779 15.0991C26.5072 15.0801 26.6311 15.0235 26.7256 14.9302C26.8318 14.8251 26.9092 14.6651 26.9092 14.436V10.8052L24.9121 11.1646L24.8896 11.0347L24.624 9.45068L26.9072 9.07764V6.18408H25.0371L24.8789 4.55615H26.9072V1.64209H28.7246V4.55615ZM53.8545 9.17334C54.2638 9.17335 54.5961 9.2745 54.8252 9.49756C55.055 9.72132 55.1591 10.047 55.1592 10.4478V15.1675L55.1543 15.3159C55.1318 15.6526 55.0295 15.9263 54.8291 16.1216C54.6007 16.3441 54.2682 16.4419 53.8545 16.4419H43.7979C43.3804 16.4419 43.0471 16.3473 42.8193 16.1255C42.6194 15.9308 42.5189 15.6562 42.4971 15.3169L42.4922 15.1675V10.4478C42.4922 10.0429 42.5933 9.71674 42.8223 9.49365C43.0507 9.27119 43.3841 9.17334 43.7979 9.17334H53.8545ZM69.1914 16.0386L69.25 16.2114H66.9404L66.9111 16.1206L65.8965 12.9067H60.4844L59.4893 16.1196L59.4609 16.2114H57.1523L61.916 2.54932H64.582L69.1914 16.0386ZM73.334 16.2114H71.2588V2.54932H73.334V16.2114ZM44.4121 14.5542L44.4141 14.5894C44.4297 14.7624 44.5599 14.8823 44.7461 14.8823H52.9053L52.9414 14.8804C53.1198 14.8648 53.2382 14.7343 53.2383 14.5542V13.4771H44.4121V14.5542ZM44.7461 10.7329C44.5563 10.7329 44.4122 10.8768 44.4121 11.0601V12.0698H53.2383V11.0601L53.2373 11.0259C53.2217 10.8703 53.1008 10.7494 52.9404 10.7339L52.9053 10.7329H44.7461ZM61.0273 11.0854H65.373L63.2109 4.17822L61.0273 11.0854ZM31.5537 6.65967C32.545 6.8998 33.9001 7.25577 35.1914 7.69092L35.2803 7.72119V9.61084L35.1064 9.55127C33.8189 9.10842 32.4689 8.73964 31.4912 8.4917L31.3926 8.46729V6.62061L31.5537 6.65967ZM46.502 6.39697H51.2012L51.666 4.96436H53.667L53.2002 6.39697H56.4531V7.95654H41.3125L41.1533 6.39697H44.5371L44.0703 4.96436H46.0537L46.502 6.39697ZM31.5557 2.79639C32.7638 3.11029 33.9859 3.48432 35.1924 3.90771L35.2803 3.93799V5.77783L35.1064 5.71729C33.9066 5.29997 32.6919 4.93182 31.4912 4.62354L31.3926 4.59912V2.75342L31.5557 2.79639ZM49.7773 2.88623H55.5391V4.4458H42.209L42.0498 2.88623H47.8223V1.64209H49.7773V2.88623Z" fill="currentColor"/>
            <path d="M103.727 3.5804H107.524V5.35142H101.513V7.29273H105.464C105.816 7.29273 106.1 7.40058 106.315 7.61628C106.531 7.83198 106.645 8.12147 106.656 8.48476C106.747 10.7666 106.747 12.9407 106.656 15.0069C106.633 15.4496 106.463 15.8186 106.145 16.1137C105.839 16.3976 105.453 16.5565 104.987 16.5906C103.931 16.6814 102.864 16.6246 101.786 16.4203L101.411 14.6152C102.319 14.8082 103.199 14.8763 104.051 14.8195C104.425 14.7855 104.63 14.5982 104.664 14.2576C104.777 12.7477 104.777 11.1413 104.664 9.43838C104.641 9.18862 104.516 9.06374 104.289 9.06374H101.479C101.4 10.8461 101.07 12.3844 100.491 13.6786C99.8444 15.1317 98.8454 16.3465 97.4944 17.3228L97.0516 15.1942C98.7205 13.6502 99.5265 11.2264 99.4697 7.9228V5.35142H97.7158L97.5455 3.5804H101.684V1.62207H103.727V3.5804ZM95.9107 12.4185L97.6306 12.0438V13.7467L92.3687 15.0409L91.96 13.304L93.9013 12.8782V7.30976H92.2665L92.0962 5.53874H93.9013V1.62207H95.9107V5.53874H97.5114V7.30976H95.9107V12.4185Z" fill="currentColor"/>
            <path d="M84.3308 14.3255H90.6656V16.0965H76.1058L75.9355 14.3255H82.2192V4.84035H76.9402L76.77 3.06934H89.8993V4.84035H84.3308V14.3255Z" fill="currentColor"/>
            <path d="M4.64629 7.23566C4.64629 8.51889 3.6058 9.55933 2.32369 9.55933C1.04046 9.55933 0 8.51889 0 7.23566C0 5.95243 1.04046 4.91309 2.32369 4.91309C3.6058 4.91309 4.64629 5.95243 4.64629 7.23566Z" fill="currentColor"/>
            <path d="M4.64629 11.8569C4.64629 13.1401 3.6058 14.1795 2.32369 14.1795C1.04046 14.1795 0 13.1401 0 11.8569C0 10.5737 1.04046 9.5332 2.32369 9.5332C3.6058 9.5332 4.64629 10.5737 4.64629 11.8569Z" fill="currentColor"/>
            <path d="M6.52691 4.9923C5.61958 5.89963 4.21325 5.96452 3.38648 5.13775C2.55859 4.30986 2.62348 2.90355 3.5308 1.99623C4.43813 1.0889 5.84446 1.02401 6.67123 1.8519C7.49912 2.67867 7.43423 4.08498 6.52691 4.9923Z" fill="currentColor"/>
            <path d="M6.52691 17.0939C5.61958 18.0012 4.21325 18.0661 3.38648 17.2382C2.55859 16.4114 2.62348 15.0051 3.5308 14.0978C4.43813 13.1905 5.84446 13.1256 6.67123 13.9535C7.49912 14.7802 7.43423 16.1865 6.52691 17.0939Z" fill="currentColor"/>
            <path d="M16.2489 6.88788C17.1562 5.98055 18.0344 5.38761 18.2112 5.56438C18.388 5.74114 17.795 6.61938 16.8877 7.52671C15.9804 8.43403 15.1021 9.02586 14.9253 8.85021C14.7497 8.67344 15.3415 7.7952 16.2489 6.88788Z" fill="currentColor"/>
            <path d="M16.3845 11.6724C17.2918 10.7651 18.1096 10.1118 18.2114 10.2136C18.3132 10.3165 17.661 11.1343 16.7536 12.0416C15.8463 12.949 15.0285 13.6012 14.9256 13.4994C14.8238 13.3976 15.4771 12.5798 16.3845 11.6724Z" fill="currentColor"/>
            <path d="M13.0553 2.66021C13.9626 1.75288 15.0602 1.3792 15.5065 1.82447C15.9518 2.27086 15.5782 3.36838 14.6709 4.27571C13.7635 5.18303 12.6671 5.55671 12.2207 5.11032C11.7743 4.66393 12.148 3.56753 13.0553 2.66021Z" fill="currentColor"/>
            <path d="M13.1782 14.8979C14.0855 13.9906 15.1271 13.5621 15.5064 13.9402C15.8845 14.3184 15.456 15.3611 14.5487 16.2684C13.6414 17.1757 12.5987 17.6042 12.2205 17.2261C11.8424 16.8468 12.2709 15.8052 13.1782 14.8979Z" fill="currentColor"/>
            <path d="M8.33898 15.9313C9.2463 15.0239 10.4714 14.7789 11.0755 15.3831C11.6807 15.9872 11.4358 17.2134 10.5285 18.1207C9.62113 19.028 8.39493 19.273 7.79079 18.6689C7.18554 18.0636 7.43166 16.8386 8.33898 15.9313Z" fill="currentColor"/>
            <path d="M8.25097 0.831134C9.15829 -0.0761893 10.4348 -0.270856 11.1027 0.39705C11.7707 1.06496 11.576 2.34147 10.6687 3.2488C9.76135 4.15612 8.48481 4.34967 7.8169 3.68288C7.14899 3.01498 7.34365 1.73846 8.25097 0.831134Z" fill="currentColor"/>
          </svg>
          <div className="h-4 w-px bg-[var(--divider)]" />
          <button
            ref={spaceBtnRef}
            type="button"
            onClick={() => {
              if (spaceMenuPos) {
                setSpaceMenuPos(null)
                return
              }
              const rect = spaceBtnRef.current?.getBoundingClientRect()
              if (rect) setSpaceMenuPos({ top: rect.bottom + 6, left: rect.left })
            }}
            className="flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded text-[12px] text-[var(--color-ink)]/55 transition-colors hover:text-[var(--color-ink)]/85"
          >
            {activeSpace}
            <ChevronDown size={12} className={`transition-transform ${spaceMenuPos ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <div ref={layoutMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setLayoutMenuOpen((v) => !v)}
              title="布局 / 外观"
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
            >
              <MoreHorizontal size={14} />
            </button>
            {layoutMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-[220px] overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] shadow-[0_12px_28px_-8px_rgba(16,18,24,0.2)]">
                <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink)]/40">
                  布局
                </div>
                {(
                  [
                    { value: 'workspace' as const, label: '工作区视图', hint: '单视图 / 分屏 tabs', icon: Columns2 },
                    { value: 'code' as const, label: '编辑视图 · 左 chat', hint: '左侧对话 · 文件 · 右侧预览', icon: Code2 },
                    { value: 'editor' as const, label: '编辑视图 · chat 在右', hint: '常驻手机 · 独立文件区', icon: LayoutGrid },
                    { value: 'platform' as const, label: '平台视图', hint: '多项目目录 · 对话 · 预览 + 控制台', icon: LayoutDashboard },
                  ]
                ).map((opt) => {
                  const Icon = opt.icon
                  const active = layout === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChangeLayout(opt.value)
                        setLayoutMenuOpen(false)
                      }}
                      className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors ${
                        active ? 'bg-[var(--color-ink)]/[0.06]' : 'hover:bg-[var(--fill-subtle)]'
                      }`}
                    >
                      <Icon size={14} className={`mt-0.5 shrink-0 ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/55'}`} />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className={`text-[12px] ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/80'}`}>
                          {opt.label}
                          {active && <span className="ml-1.5 text-[10px] text-[var(--color-ink)]/45">当前</span>}
                        </span>
                        <span className="text-[10px] text-[var(--color-ink)]/40">{opt.hint}</span>
                      </span>
                    </button>
                  )
                })}
                <div className="mt-1 border-t border-[var(--divider-soft)] px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink)]/40">
                  外观
                </div>
                {(
                  [
                    { value: 'light' as const, label: '亮色模式', icon: Sun },
                    { value: 'dark' as const, label: '暗色模式', icon: Moon },
                  ]
                ).map((opt) => {
                  const Icon = opt.icon
                  const active = themeMode === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChangeThemeMode(opt.value)
                        setLayoutMenuOpen(false)
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                        active ? 'bg-[var(--color-ink)]/[0.06]' : 'hover:bg-[var(--fill-subtle)]'
                      }`}
                    >
                      <Icon size={14} className={`shrink-0 ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/55'}`} />
                      <span className={`text-[12px] ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/80'}`}>
                        {opt.label}
                        {active && <span className="ml-1.5 text-[10px] text-[var(--color-ink)]/45">当前</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <button
            onClick={onCollapse}
            title="收起侧栏"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
          >
            <PanelLeft size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* + 新建项目 */}
      <div className="px-3 pt-4">
        <button
          onClick={onNewProject}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-ink)] text-[13px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
        >
          <Plus size={14} strokeWidth={2} />
          新建项目
        </button>
      </div>

      {/* Platform nav — pill-shaped rows with cool-gray tint when selected.
           Styling aligned with the Figma design: 13px semibold, 16px icons
           inheriting text color, 6px gap, rounded-full container. */}
      <nav className="mt-3 flex flex-col gap-2 px-3">
        {(
          [
            { label: 'Skills', icon: FolderCode },
            { label: '资源库', icon: Inbox },
            { label: '数据运营', icon: BarChart3 },
            { label: '创意广场', icon: Home },
          ] as const
        ).map(({ label, icon: Icon }) => {
          const active = activeNav === label
          return (
            <button
              key={label}
              onClick={() => {
                if (label === '资源库') onOpenResourceLibrary()
                else if (label === 'Skills') onOpenSkills()
                else if (label === '创意广场') onOpenCreativeSquare()
                else if (label === '数据运营') onOpenDataOps()
              }}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold leading-5 text-[var(--color-ink)] transition-colors ${
                active
                  ? 'bg-[rgba(83,96,143,0.12)]'
                  : 'hover:bg-[rgba(83,96,143,0.08)]'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} className="shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      {drilledProject !== null ? (
        /* ── Detail: one project's full file-view directory ── */
        <>
          <div className="mt-4 flex shrink-0 items-center gap-1 px-3 py-1.5">
            <button
              type="button"
              onClick={() => setDrilledProject(null)}
              title="返回项目列表"
              className="flex h-6 shrink-0 items-center gap-0.5 rounded-md pl-1 pr-2 text-[12px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
            >
              <ArrowLeft size={13} strokeWidth={1.8} />
              返回
            </button>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[var(--color-ink)]/85">
              {drilledProject}
            </span>
            <button
              title="收起全部"
              onClick={onCollapseAll}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
            >
              <ListCollapse size={12} strokeWidth={1.8} />
            </button>
          </div>
          <div className="thin-scroll flex-1 overflow-y-auto pb-2">
            {(() => {
              const tree = projectTrees[drilledProject]
              if (!tree) {
                return (
                  <div className="px-5 py-1.5 pl-[38px] text-[12px] text-[var(--color-ink)]/40">
                    暂无文件
                  </div>
                )
              }
              return (
                <FileTreeView
                  nodes={tree}
                  expanded={expandedDirs}
                  onToggleDir={toggleDir}
                  onOpenFile={openFileInTab}
                  depth={1}
                  parentPath=""
                  railStartDepth={1}
                />
              )
            })()}
          </div>
        </>
      ) : (
        /* ── List: every project, inline 产物视图 ── */
        <>
          {/* 项目列表 header */}
          <div className="mt-4 flex shrink-0 items-center justify-between px-5 py-1.5">
            <span className="text-[12px] text-[var(--color-ink)]/55">项目列表</span>
            <div className="flex items-center gap-1 text-[var(--color-ink)]/40">
              <button
                title="搜索全部项目文件"
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
              >
                <Search size={12} strokeWidth={1.8} />
              </button>
              <button
                title="收起全部"
                onClick={onCollapseAll}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
              >
                <ListCollapse size={12} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Project list — each project expands inline to its 产物视图;
               the hover drill button opens its full file directory. */}
          <div className="thin-scroll flex-1 overflow-y-auto pb-2">
            {ALL_PROJECTS.map((name) => {
              const open = openProjects.has(name)
              const tree = projectTrees[name]
              const isActive =
                name === activeProjectName &&
                activeNav === null &&
                !drilledProject
              return (
                <div key={name}>
                  <div
                    className={`group relative mx-3 flex items-center rounded-md pr-2 transition-colors ${
                      isActive
                        ? 'bg-[var(--color-ink)]/[0.06]'
                        : 'hover:bg-[var(--color-ink)]/[0.04]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        toggleProject(name)
                        onSwitchProject(name)
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 pl-2 pr-1 text-[12px] font-medium transition-colors ${
                        isActive ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/85'
                      }`}
                    >
                      {open ? (
                        <FolderOpen
                          size={13}
                          strokeWidth={1.7}
                          className={`shrink-0 ${
                            isActive ? 'text-[var(--color-ink)]/85' : 'text-[var(--color-ink)]/60'
                          }`}
                        />
                      ) : (
                        <FolderClosed
                          size={13}
                          strokeWidth={1.7}
                          className={`shrink-0 ${
                            isActive ? 'text-[var(--color-ink)]/85' : 'text-[var(--color-ink)]/60'
                          }`}
                        />
                      )}
                      <span className="truncate">{name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrilledProject(name)}
                      title="查看完整目录结构"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--color-ink)]/40 opacity-0 transition-opacity hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75 focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <FolderCode size={12} strokeWidth={1.8} />
                    </button>
                  </div>
                  {open && (() => {
                    const emptyStub = (
                      <div className="px-5 py-1.5 pl-[38px] text-[12px] text-[var(--color-ink)]/40">
                        暂无文件
                      </div>
                    )
                    if (!tree) return emptyStub
                    const kind = PROJECT_KINDS[name] ?? 'mini-program'
                    // AI 分身 and 小程序 projects are config-driven;
                    // other kinds bucket the raw file tree.
                    const productTree =
                      kind === 'ai-avatar'
                        ? buildAvatarProductView(tree, getAvatarConfig(name))
                        : kind === 'mini-program'
                          ? buildMiniProgramProductView(
                              tree,
                              getMiniProgramConfig(name),
                            )
                          : buildProductView(tree, kind)
                    if (productTree.length === 0) return emptyStub
                    return (
                      // Extra left inset so a project's contents read as
                      // nested under its project row.
                      <div className="pl-2">
                        <FileTreeView
                          nodes={productTree}
                          expanded={expandedDirs}
                          onToggleDir={toggleDir}
                          onOpenFile={openFileInTab}
                          depth={1}
                          // Distinct root so product-view expansion state
                          // never collides with file-view paths.
                          parentPath="__product__"
                          railStartDepth={1}
                          iconFor={(n, path) =>
                            // Path-keyed leaves first: every 界面 page
                            // shares the same page icon; 知识库 / 技能
                            // items their own. Else fall to the name map.
                            path.includes('/界面/')
                              ? AppWindow
                              : path.includes('/知识库/')
                                ? BookOpen
                                : path.includes('/技能/')
                                  ? Sparkles
                                  : PRODUCT_CATEGORY_ICONS[n.name]
                          }
                          isActive={
                            name === activeProjectName
                              ? (n) => n.name === (activeRoute ?? '首页')
                              : undefined
                          }
                        />
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* 对话列表 — relocated from the chat header dropdown. Sits between
           项目列表 and the user footer; height is user-draggable via the
           top-edge handle so the user can give either list more room.
           Hidden entirely when no project is active (home / secondary
           pages) — sessions are scoped per project, so there's nothing
           meaningful to show without one. */}
      {activeProjectName && (
      <div
        className="relative flex shrink-0 flex-col border-t border-[var(--divider-soft)]"
        style={{ height: conversationHeight }}
      >
        {/* Drag handle — sits on top of the section's top edge, captures
             pointer events to resize. */}
        <div
          role="separator"
          aria-orientation="horizontal"
          onPointerDown={onConversationDragStart}
          onPointerMove={onConversationDragMove}
          onPointerUp={onConversationDragEnd}
          onPointerCancel={onConversationDragEnd}
          className="group absolute inset-x-0 top-0 z-10 h-1.5 -translate-y-1/2 cursor-row-resize touch-none select-none"
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
        </div>
        <div className="flex shrink-0 items-center justify-between px-5 pt-3 pb-1.5">
          <span className="text-[12px] text-[var(--color-ink)]/55">对话</span>
          <button
            type="button"
            title="新会话"
            onClick={onNewSession}
            className="flex h-5 w-5 items-center justify-center rounded text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
          >
            <MessageSquarePlus size={12} strokeWidth={1.8} />
          </button>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-3 pb-2">
          {sessions.map((s) => {
            const active = s.id === activeSessionId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSwitchSession(s.id)}
                className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[12px] transition-colors ${
                  active
                    ? 'bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]/90'
                    : 'text-[var(--color-ink)]/70 hover:bg-[var(--fill-subtle)]'
                }`}
              >
                <MessageSquareText
                  size={12}
                  strokeWidth={1.8}
                  className={`shrink-0 ${active ? 'text-[var(--color-ink)]/80' : 'text-[var(--color-ink)]/45'}`}
                />
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
              </button>
            )
          })}
        </div>
      </div>
      )}

      {/* User footer */}
      <div className="flex h-12 shrink-0 items-center gap-2 px-5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-[10px] font-semibold text-white">
          张
        </div>
        <span className="text-[12px] text-[var(--color-ink)]/80">张俊</span>
      </div>

      {spaceMenuPos && (
        <SpaceMenuPopover
          pos={spaceMenuPos}
          active={activeSpace}
          onSelect={setActiveSpace}
          onClose={() => setSpaceMenuPos(null)}
        />
      )}
    </aside>
  )
}

export default function VibeCodingPage() {
  // Standalone build — no router; the top-left back button is a no-op.
  const handleBack = useCallback(() => {
    /* intentionally empty in standalone */
  }, [])

  /* Ambient glow palette — always picked from the persona actually shown
   * in the phone preview (Identity V · 约瑟夫 for this sample project),
   * not whatever the user currently has in the store. */
  const portraitUrl = getWorld('identity-v').defaults.portraitUrl
  const [c1, c2] = useDominantColors(portraitUrl, 2)

  /* chat panel — always visible; flag kept for future collapse toggle */
  const [chatCollapsed] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const chatScrollEdges = useScrollEdges(chatScrollRef)

  /* form state — cascading: step 2 unlocks after scene, step 3 after
   *  appType. step 3 picks capabilities, step 4 picks personalization tags.
   *  Steps 3 & 4 are now a two-phase reveal: when the upstream step
   *  completes we first show a brief "系统在分析推荐工具/标签…" loading
   *  state before the pills appear. Each step has its own 确认 button —
   *  confirming step 3 kicks off step 4's loading phase, and confirming
   *  step 4 surfaces the final 确认创建 button. */
  const [scene, setScene] = useState('')
  const [appType, setAppType] = useState('')
  const [enabledCapabilities, setEnabledCapabilities] = useState<Set<string>>(() => new Set())
  const [personalizationTags, setPersonalizationTags] = useState<Set<string>>(() => new Set())
  type RecStep = 'idle' | 'loading' | 'ready' | 'confirmed'
  const [capabilitiesStep, setCapabilitiesStep] = useState<RecStep>('idle')
  const [tagsStep, setTagsStep] = useState<RecStep>('idle')
  const [tagsAddOpen, setTagsAddOpen] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  /* Trigger/action configs wired up via chat for AI-avatar projects.
   * Declared here (before the loading→ready useEffect below) so both the
   * effect and the AI-persona file tree can read them. */
  const [triggers, setTriggers] = useState<TriggerConfig[]>([])
  const [triggerStep, setTriggerStep] = useState<RecStep>('idle')

  /* ── 种草提案 flow state ──
   * Drives the 沪上火锅 case. Step 1 collects 商家目标卡 via an inline
   * ChatFormCard; on submit, the captured draft is rendered into a
   * markdown file and appended to the project tree. Subsequent steps
   * (人群诊断, 达人包, brief, 提案报告, 执行看板, 复盘) append further
   * artefacts as the conversation advances. */
  type ProposalStep =
    | 'idle'
    | 'collecting'
    | 'goal-confirmed'
    | 'audience-diagnosed'
    | 'pack-ready'
    | 'brief-ready'
    | 'report-ready'
    | 'dashboard-ready'
    | 'review-ready'
  // Mirror the URL signal here so the proposal step / seeded chat / open
  // tabs all hydrate on first paint (avoids the home-flash-to-proposal
  // transition). Note: keep this in sync with `wantsProposalProject`
  // below where projectTitle is initialised.
  const proposalDeepLink =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('project') === 'proposal'
  const [proposalStep, setProposalStep] = useState<ProposalStep>(
    proposalDeepLink ? 'collecting' : 'idle',
  )
  const [proposalGoal, setProposalGoal] = useState<ProposalGoalDraft | null>(null)
  const [proposalPack, setProposalPack] = useState<ProposalPackId | null>(null)
  /* ── Game-generation flow state ──
   * Mocks the multi-step build of the Garuda HTML5 shooter. Triggered by
   * the homepage suggestion "做一款竖版弹幕射击..."; progresses on a timer
   * so each step's bubble streams in, then the next kicks off. When the
   * step hits 'done', the right preview swaps from the build progress
   * view to the actual playable GarudaGamePreview. */
  type GameStep =
    | 'idle'
    | 'confirming'
    | 'analyzing'
    | 'scaffolding'
    | 'art'
    | 'gameplay'
    | 'audio'
    | 'done'
  const [gameStep, setGameStep] = useState<GameStep>('idle')
  /** Projects materialized at runtime by the game-generation flow. The
   *  Garuda case starts off-list and only appears in the sidebar once
   *  the user has confirmed the spec card and kicked off building. */
  const [createdProjects, setCreatedProjects] = useState<string[]>([])
  /** Spec the user confirmed in GameConfirmCard — kept so the post-step
   *  user-echo bubble can read it back, and so the locked card still
   *  shows the chosen options. */
  const [gameSpec, setGameSpec] = useState<GameSpecDraft | null>(null)
  /** Markdown content for files generated by the proposal flow, keyed by
   *  filename (e.g. '商家目标卡.md'). The file tree carries the structure;
   *  this map carries the body so the renderer can show real content when
   *  the user opens the file in a tab. */
  const [proposalDocs, setProposalDocs] = useState<Record<string, string>>({})
  /** Cross-bubble streaming gates — when one stage's bubble has fully
   *  streamed, the corresponding flag flips so the NEXT bubble in the
   *  same transition can start streaming sequentially. Without these,
   *  bubbles that mount together (e.g. Step 2 diagnosis + Step 3 pack
   *  selector at audience-diagnosed) would stream in parallel. */
  const [step2BubbleStreamed, setStep2BubbleStreamed] = useState(false)
  const [step3ClosingBubbleStreamed, setStep3ClosingBubbleStreamed] =
    useState(false)
  const [pendingTrigger, setPendingTrigger] = useState<TriggerConfig | null>(null)
  const [lastConfirmedTrigger, setLastConfirmedTrigger] = useState<TriggerConfig | null>(null)
  const [editingTriggerNameId, setEditingTriggerNameId] = useState<string | null>(null)
  /* Append-only log of simulated trigger firings. Renders inside the
   * phone preview; the "模拟 {event}" chip that appends to this lives
   * outside the phone (in the preview-tab chrome). */
  const [triggerSimulations, setTriggerSimulations] = useState<TriggerSimulation[]>([])
  const [chatCleared, setChatCleared] = useState(false)
  const [chatDraft, setChatDraft] = useState('')
  /* Composer is a contentEditable div so @mention picks render as
   * inline pills. `chatInputRef` points at the div; `chatDraft` mirrors
   * the div's plain-text content via its onInput. External setters
   * (clear-on-send, programmatic fill) go through `setComposerText`
   * so the DOM and state stay in lockstep. */
  const chatInputRef = useRef<HTMLDivElement>(null)
  const setComposerText = (next: string) => {
    if (chatInputRef.current) chatInputRef.current.innerText = next
    setChatDraft(next)
  }
  /* @mention picker — opens when the user types "@" in the composer.
   * `anchor` positions the popover above the input; clearing it closes
   * the picker. */
  const [mentionAnchor, setMentionAnchor] = useState<
    { left: number; top: number; width: number } | null
  >(null)
  const openMentionPicker = () => {
    const el = chatInputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMentionAnchor({ left: rect.left, top: rect.top, width: rect.width })
  }
  /* User-sent messages — appended to the bottom of the scroll area. The
   * static mock conversation stays above. Three trigger kinds:
   *   • 'publish' — message matched 发布/更新, publish flow kicked off
   *   • 'needs'   — matched 需求/新建/重新收集, needs-gathering form reset
   *   • 'none'    — plain message, just rendered as a user bubble
   */
  type SentMessage = { text: string; trigger: 'none' | 'publish' | 'needs' | 'trigger' | 'proposal' | 'game' }
  const [sentMessages, setSentMessages] = useState<SentMessage[]>(() =>
    proposalDeepLink
      ? [
          {
            text: '帮我做沪上火锅品牌五一前的潜客种草提案，预算 50w，目标是 A3 种草和看后搜提升',
            trigger: 'proposal',
          },
        ]
      : [],
  )
  /* Chat session list — the header's conversation-name button opens a
   * dropdown of these, and the + button creates a fresh empty session. */
  type ChatSession = { id: string; name: string }
  /* Sessions belong to the active project. Project switches snapshot
   * the array (and the matching `activeSessionId`) into projectChatsRef
   * and restore the target project's own list. Each project starts with
   * one fresh '新会话' on first visit. */
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: 's-current', name: '新会话' },
  ])
  const [activeSessionId, setActiveSessionId] = useState('s-current')
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false)
  const sessionMenuRef = useRef<HTMLDivElement>(null)
  /* Per-project chat snapshots. Whenever the user switches projects we
   * stash the outgoing project's full chat state here (messages,
   * sessions, proposal/game/trigger flow state, open preview tabs, ...)
   * and restore the incoming project's prior snapshot if any. This is
   * what gives each project its own isolated conversation history. The
   * shape is the same as what `captureProjectSnapshot()` returns. */
  type ProjectChatSnapshot = {
    sentMessages: SentMessage[]
    sessions: ChatSession[]
    activeSessionId: string
    chatCleared: boolean
    needsFlowActive: boolean
    scene: string
    appType: string
    enabledCapabilities: Set<string>
    personalizationTags: Set<string>
    capabilitiesStep: RecStep
    tagsStep: RecStep
    tagsAddOpen: boolean
    formSubmitted: boolean
    triggers: TriggerConfig[]
    triggerStep: RecStep
    pendingTrigger: TriggerConfig | null
    lastConfirmedTrigger: TriggerConfig | null
    editingTriggerNameId: string | null
    triggerSimulations: TriggerSimulation[]
    proposalStep: ProposalStep
    proposalGoal: ProposalGoalDraft | null
    proposalPack: ProposalPackId | null
    proposalDocs: Record<string, string>
    step2BubbleStreamed: boolean
    step3ClosingBubbleStreamed: boolean
    gameStep: GameStep
    gameSpec: GameSpecDraft | null
    openTabs: { label: string; closable: boolean }[]
    activePreviewTab: number
    previewRoute: string | null
    activeFilter: string
  }
  const projectChatsRef = useRef<Map<string, ProjectChatSnapshot>>(new Map())
  /* Platform "home" / new-project landing view — shown on first load
   * (no project selected yet) and whenever the user clicks + 新建项目.
   * Contains a hero title + a large prompt composer + suggestion pills.
   * Submitting returns to the normal workspace with the prompt routed
   * through sendChat. Closes when the user activates a project via
   * sidebar click. */
  // If a deep link points to a specific surface (resources / proposal),
  // suppress the platform home on first paint so the right surface
  // lands immediately.
  const [platformHomeOpen, setPlatformHomeOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    const p = new URLSearchParams(window.location.search)
    if (p.get('page') === 'resources') return false
    if (p.get('project') === 'proposal') return false
    return true
  })
  const [homeDraft, setHomeDraft] = useState('')
  /* 第五人格 needs-collection mock — only surfaces when the user sends a
   * message containing 第五人格/小程序. Default off so the chat starts in
   * its empty state rather than immediately showing a scripted dialog. */
  const [needsFlowActive, setNeedsFlowActive] = useState(false)
  /* Once the thinking indicator has faded out we unmount it so it stops
   * claiming a `space-y` slot between the user bubble and the form. */
  const [needsThinkingVisible, setNeedsThinkingVisible] = useState(true)
  useEffect(() => {
    if (!needsFlowActive) {
      setNeedsThinkingVisible(true)
      return
    }
    const t = setTimeout(() => setNeedsThinkingVisible(false), 900)
    return () => clearTimeout(t)
  }, [needsFlowActive])
  /** Step 3 cascade — whenever appType is set (or changes) we re-seed
   *  the recommended capabilities and drop step 3 into 'loading'. The
   *  dedicated loading→ready timers (below) each own their own effect
   *  so that re-running a multi-dep effect doesn't cancel the timer. */
  useEffect(() => {
    if (!appType) {
      setCapabilitiesStep('idle')
      setTagsStep('idle')
      setTagsAddOpen(false)
      return
    }
    setEnabledCapabilities(new Set(RECOMMENDED_CAPABILITIES))
    setCapabilitiesStep('loading')
    setTagsStep('idle')
    setTagsAddOpen(false)
  }, [appType])
  /** Step 4 kicks off the moment step 3 is confirmed. */
  useEffect(() => {
    if (capabilitiesStep !== 'confirmed') return
    setPersonalizationTags(new Set(RECOMMENDED_TAGS))
    setTagsStep('loading')
  }, [capabilitiesStep])
  /** Shared loading→ready delays. Each watches a single step so setting
   *  the target state inside doesn't re-trigger-and-cancel the timer. */
  useEffect(() => {
    if (capabilitiesStep !== 'loading') return
    const t = setTimeout(() => setCapabilitiesStep('ready'), 1100)
    return () => clearTimeout(t)
  }, [capabilitiesStep])
  useEffect(() => {
    if (tagsStep !== 'loading') return
    const t = setTimeout(() => setTagsStep('ready'), 1100)
    return () => clearTimeout(t)
  }, [tagsStep])
  /** Trigger-config recognition — brief loading state ("AI 正在识别
   *  触发器...") before surfacing the parsed card for confirmation. */
  useEffect(() => {
    if (triggerStep !== 'loading') return
    const t = setTimeout(() => setTriggerStep('ready'), 650)
    return () => clearTimeout(t)
  }, [triggerStep])
  /** Game-flow stepper — advance gameStep along a fixed timeline so each
   *  generation phase ("分析需求 / 搭骨架 / 跑美术 / 写玩法 / 打音效")
   *  streams in sequentially. Delays roughly match the chat bubble's
   *  stream duration so users always see a fresh message land. The
   *  'confirming' step is human-gated and waits for the user to click
   *  the confirm card; the timer skips it. */
  useEffect(() => {
    if (gameStep === 'idle' || gameStep === 'done' || gameStep === 'confirming') return
    type AutoStep = Exclude<GameStep, 'idle' | 'done' | 'confirming'>
    const NEXT: Record<AutoStep, GameStep> = {
      analyzing: 'scaffolding',
      scaffolding: 'art',
      art: 'gameplay',
      gameplay: 'audio',
      audio: 'done',
    }
    const DELAYS: Record<AutoStep, number> = {
      analyzing: 2200,
      scaffolding: 2400,
      art: 2600,
      gameplay: 2400,
      audio: 2200,
    }
    const cur = gameStep as AutoStep
    const t = setTimeout(() => setGameStep(NEXT[cur]), DELAYS[cur])
    return () => clearTimeout(t)
  }, [gameStep])
  /** When the 0→1 game flow reaches 'done', seed the project's preview
   *  tabs so the right pane unfolds with the playable game. Up until
   *  then `openTabs` is empty → `previewHidden` keeps the chat full
   *  width. Same shape as the proposal flow (artifact → panel). */
  useEffect(() => {
    if (gameStep !== 'done') return
    setOpenTabs((prev) =>
      prev.length > 0
        ? prev
        : [
            { label: '游戏预览', closable: false },
            { label: '素材', closable: false },
          ],
    )
    setActivePreviewTab(0)
  }, [gameStep])
  /* Publish flow now lives in `usePublishFlowStore` so the top-right CTA
   *  can choose between modal vs chat-embedded rendering. */
  const publishStep = usePublishFlowStore((s) => s.step)
  const publishMode = usePublishFlowStore((s) => s.mode)
  const publishScenes = usePublishFlowStore((s) => s.scenes)
  const startPublish = usePublishFlowStore((s) => s.start)
  const resetPublish = usePublishFlowStore((s) => s.reset)
  const togglePublishScene = usePublishFlowStore((s) => s.toggleScene)
  const submitPublish = usePublishFlowStore((s) => s.submit)
  const confirmPublish = usePublishFlowStore((s) => s.confirm)
  const showChatPublish = publishStep !== 'idle' && publishMode === 'chat'
  /* bump to remount the mini-app preview — clicking the phone-bar "重新加载"
   * fully resets its local interactive state. */
  const [miniAppKey, setMiniAppKey] = useState(0)
  /** Active page of the right-side preview for app-like projects, driven
   *  by the product view's 页面 nodes (and the preview's own nav). null =
   *  the project's default first page. */
  const [previewRoute, setPreviewRoute] = useState<string | null>(null)

  /* Layout plan — 'workspace' is the default (tabs 合一, 产物可钉左右);
   * 'editor' mirrors IP-编辑器: 左侧常驻手机 + 中间独立文件编辑;
   * 'code' 把 chat 移到最左，中间文件编辑器，右侧常驻手机预览。 */
  const [layout, setLayout] = useState<'workspace' | 'editor' | 'code' | 'platform'>('platform')
  const isPlatform = layout === 'platform'
  const chatOnLeft = layout === 'code' || isPlatform
  /* Platform-only: sidebar + chat widths are both user-draggable; the
   * sidebar can also be collapsed via the PanelLeft button in the brand
   * header. When collapsed, the card extends to 20px from viewport-left
   * and the brand chrome (logo + 抖音AI工坊 + expand icon) relocates to
   * the card's top-left header. */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [platformSidebarWidth, setPlatformSidebarWidth] = useState(280)
  const effectiveSidebarWidth = sidebarCollapsed ? 12 : platformSidebarWidth
  const sidebarDragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const onSidebarDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    sidebarDragRef.current = { startX: e.clientX, startWidth: platformSidebarWidth }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onSidebarDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sidebarDragRef.current
    if (!s) return
    const next = Math.min(360, Math.max(200, s.startWidth + (e.clientX - s.startX)))
    setPlatformSidebarWidth(next)
  }
  const onSidebarDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    sidebarDragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
  const [platformChatWidth, setPlatformChatWidth] = useState(420)
  const chatDragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const onChatDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    chatDragRef.current = { startX: e.clientX, startWidth: platformChatWidth }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onChatDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = chatDragRef.current
    if (!s) return
    const next = Math.min(680, Math.max(320, s.startWidth + (e.clientX - s.startX)))
    setPlatformChatWidth(next)
  }
  const onChatDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    chatDragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
  const chatWidthPx = isPlatform ? platformChatWidth : chatOnLeft ? 347 : 420
  // Header is full-width in code layout (no mr/ml — chat sits below header).
  // Body keeps a margin so content doesn't slide under the fixed chat column.
  // In code layout the whole below-header area has 20px gutter on L/R/B — the
  // chat sits at left:20, and there's a 16px gap between chat and the right
  // panel, so body starts at 20 + 347 + 16 = 383px.
  // Platform adds a 230px project sidebar on the far left; chat sits flush
  // against it, so body offset is 230 + 420 = 650px.
  const headerMarginClass = isPlatform
    ? 'ml-[230px]'
    : chatOnLeft
      ? ''
      : 'mr-[420px]'
  // Platform: sidebar(230) + chat(platformChatWidth) = marginLeft for the
  // preview panel. The chat sits flush against the preview inside the
  // shared card; their boundary is marked by the chat aside's `border-r`.
  // Actual value is applied inline since it tracks the draggable chat width.
  const bodyMarginClass = isPlatform
    ? ''
    : chatOnLeft
      ? 'ml-[383px]'
      : 'mr-[420px]'
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false)
  const layoutMenuRef = useRef<HTMLDivElement>(null)
  const themeMode = useThemeStore((s) => s.mode)
  const setThemeMode = useThemeStore((s) => s.setMode)

  /* Editor-layout left preview column — user-draggable width. */
  const [previewColumnWidth, setPreviewColumnWidth] = useState(400)
  const previewDragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const onPreviewColDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    previewDragRef.current = { startX: e.clientX, startWidth: previewColumnWidth }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPreviewColDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = previewDragRef.current
    if (!s) return
    // Editor layout has the phone on the left (drag right → wider).
    // Code layout has the phone on the right (drag right → narrower).
    const delta = e.clientX - s.startX
    const signedDelta = layout === 'code' ? -delta : delta
    const next = Math.min(680, Math.max(320, s.startWidth + signedDelta))
    setPreviewColumnWidth(next)
  }
  const onPreviewColDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    previewDragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  useEffect(() => {
    if (!layoutMenuOpen) return
    const handler = (e: PointerEvent) => {
      if (layoutMenuRef.current && !layoutMenuRef.current.contains(e.target as Node)) {
        setLayoutMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [layoutMenuOpen])

  /** Clear every piece of chat-scoped UI so the next session starts in
   *  a truly empty state. Covers:
   *   - Sent messages + new-empty flag
   *   - Needs-collection form (scene/appType/capabilities/tags/step state)
   *   - Publish flow store (the "发布更新" card embedded in chat)
   *   - Inline thinking indicator
   *  Any case that can render inside the chat column should be reset
   *  here — if it's tied to a conversation, it shouldn't leak across. */
  const resetChatState = () => {
    setChatCleared(true)
    setSentMessages([])
    setComposerText('')
    setScene('')
    setAppType('')
    setEnabledCapabilities(new Set())
    setPersonalizationTags(new Set())
    setCapabilitiesStep('idle')
    setTagsStep('idle')
    setTagsAddOpen(false)
    setFormSubmitted(false)
    setNeedsFlowActive(false)
    setNeedsThinkingVisible(true)
    resetPublish()
    // Trigger-config state: clear configured triggers (and any pending
    // recognition) so project switches start with a blank triggers/ folder.
    setTriggers([])
    setTriggerStep('idle')
    setPendingTrigger(null)
    setLastConfirmedTrigger(null)
    setEditingTriggerNameId(null)
    setTriggerSimulations([])
  }

  const handleNewSession = () => {
    const id = `s-${Date.now()}`
    setSessions((prev) => [{ id, name: '新会话' }, ...prev])
    setActiveSessionId(id)
    resetChatState()
  }

  /** New-project button click: reset session state + close any open
   *  secondary page (Skills / 资源库 / 创意广场) so the home view doesn't
   *  end up rendered side-by-side with them, then navigate to the
   *  platform home / landing screen. */
  const handleNewProject = () => {
    // Save the outgoing project's chat so coming back to it from the
    // home view restores everything as it was.
    if (projectTitle && !platformHomeOpen) {
      projectChatsRef.current.set(projectTitle, captureProjectSnapshot())
    }
    handleNewSession()
    setPlatformSkillsOpen(false)
    setPlatformResourceLibraryOpen(false)
    setPlatformCreativeSquareOpen(false)
    setPlatformDataOpsOpen(false)
    setPlatformHomeOpen(true)
  }

  /** Called when the user submits a prompt from the home screen (either
   *  by typing + send or by clicking a suggestion pill). Exits home
   *  view and pipes the text through sendChat. */
  const submitFromHome = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    // Game prompt → kick off the Garuda mock-generation flow. Keyword set
    // covers the suggestion chip + any organic phrasing that names the
    // genre / mechanics. Order matters: this gate runs before the generic
    // classifier so the dedicated flow always wins.
    if (
      /弹幕|射击|stg|roguelike|太空|飞机.*游戏|游戏.*飞机|garuda/i.test(trimmed)
    ) {
      setHomeDraft('')
      startGameFlow(trimmed)
      return
    }
    // Classify the prompt to pick which OutputShape the new project should
    // adopt. Stored as a console hint for now; downstream we'll wire this
    // into the new-project creation so the right-side preview routes
    // correctly without manual PROJECT_KINDS edits.
    const classifiedKind = classifyProjectKind(trimmed)
    if (typeof window !== 'undefined' && (window as { __vc_log__?: unknown }).__vc_log__) {
      // no-op; placeholder for future telemetry
    }
    void classifiedKind
    setHomeDraft('')
    setPlatformHomeOpen(false)
    sendChat(trimmed)
  }

  /** Kick off the Garuda mock-generation flow. Opens the project, seeds
   *  the user's request as a chat bubble, and walks gameStep forward via
   *  staggered timers so each "正在生成..." bubble streams in sequence.
   *  The right-side preview shows a build-progress view until 'done'. */
  const startGameFlow = (userPrompt: string) => {
    // Snapshot the outgoing project before we hijack the global chat
    // state for the Garuda game-build flow.
    if (projectTitle && !platformHomeOpen) {
      projectChatsRef.current.set(projectTitle, captureProjectSnapshot())
    }
    const sid = `s-${Date.now()}`
    setProjectTitle('Garuda · 神明黄昏')
    setSessions([{ id: sid, name: '新会话' }])
    setActiveSessionId(sid)
    setPlatformHomeOpen(false)
    setPlatformResourceLibraryOpen(false)
    setPlatformSkillsOpen(false)
    setPlatformCreativeSquareOpen(false)
    setPlatformDataOpsOpen(false)
    setActivePreviewTab(0)
    setPreviewRoute(null)
    setActiveFilter('mini-program')
    setProposalStep('idle')
    setProposalGoal(null)
    setProposalPack(null)
    setProposalDocs({})
    setStep2BubbleStreamed(false)
    setStep3ClosingBubbleStreamed(false)
    setNeedsFlowActive(false)
    setNeedsThinkingVisible(true)
    setScene('')
    setAppType('')
    setEnabledCapabilities(new Set())
    setPersonalizationTags(new Set())
    setCapabilitiesStep('idle')
    setTagsStep('idle')
    setTagsAddOpen(false)
    setFormSubmitted(false)
    setTriggers([])
    setTriggerStep('idle')
    setPendingTrigger(null)
    setLastConfirmedTrigger(null)
    setEditingTriggerNameId(null)
    setTriggerSimulations([])
    resetPublish()
    // 0→1 generation flow: keep the right pane hidden during confirm /
    // build. Tabs are seeded only once gameStep reaches 'done' (see the
    // effect below), matching the proposal flow's "artifact then panel"
    // pattern. User-collapsed state is also reset so a fresh run doesn't
    // inherit a previously-folded preview.
    setOpenTabs([])
    setPreviewCollapsed(false)
    setChatCleared(false)
    setSentMessages([{ text: userPrompt, trigger: 'game' }])
    setGameStep('confirming')
  }

  /** User confirmed the spec card → store the spec for the echo bubble,
   *  materialise the project (sidebar entry), and let the auto-stepper
   *  take over. */
  const confirmGameSpec = (spec: GameSpecDraft) => {
    setGameSpec(spec)
    setCreatedProjects((prev) =>
      prev.includes('Garuda · 神明黄昏') ? prev : ['Garuda · 神明黄昏', ...prev],
    )
    setPlatformOpenProjects((prev) => {
      if (prev.has('Garuda · 神明黄昏')) return prev
      const next = new Set(prev)
      next.add('Garuda · 神明黄昏')
      return next
    })
    setGameStep('analyzing')
  }

  /** Capture every per-project chat field into a plain snapshot. Called
   *  by `openProject` right before it switches away so the outgoing
   *  project's state can be restored later when the user comes back. */
  const captureProjectSnapshot = (): ProjectChatSnapshot => ({
    sentMessages,
    sessions,
    activeSessionId,
    chatCleared,
    needsFlowActive,
    scene,
    appType,
    enabledCapabilities,
    personalizationTags,
    capabilitiesStep,
    tagsStep,
    tagsAddOpen,
    formSubmitted,
    triggers,
    triggerStep,
    pendingTrigger,
    lastConfirmedTrigger,
    editingTriggerNameId,
    triggerSimulations,
    proposalStep,
    proposalGoal,
    proposalPack,
    proposalDocs,
    step2BubbleStreamed,
    step3ClosingBubbleStreamed,
    gameStep,
    gameSpec,
    openTabs,
    activePreviewTab,
    previewRoute,
    activeFilter,
  })

  /** Replay a previously-stashed snapshot onto the current setters so
   *  re-opening a project shows the chat exactly where the user left
   *  off. Pairs with `captureProjectSnapshot`. */
  const applyProjectSnapshot = (snap: ProjectChatSnapshot) => {
    setSentMessages(snap.sentMessages)
    setSessions(snap.sessions)
    setActiveSessionId(snap.activeSessionId)
    setChatCleared(snap.chatCleared)
    setNeedsFlowActive(snap.needsFlowActive)
    setScene(snap.scene)
    setAppType(snap.appType)
    setEnabledCapabilities(snap.enabledCapabilities)
    setPersonalizationTags(snap.personalizationTags)
    setCapabilitiesStep(snap.capabilitiesStep)
    setTagsStep(snap.tagsStep)
    setTagsAddOpen(snap.tagsAddOpen)
    setFormSubmitted(snap.formSubmitted)
    setTriggers(snap.triggers)
    setTriggerStep(snap.triggerStep)
    setPendingTrigger(snap.pendingTrigger)
    setLastConfirmedTrigger(snap.lastConfirmedTrigger)
    setEditingTriggerNameId(snap.editingTriggerNameId)
    setTriggerSimulations(snap.triggerSimulations)
    setProposalStep(snap.proposalStep)
    setProposalGoal(snap.proposalGoal)
    setProposalPack(snap.proposalPack)
    setProposalDocs(snap.proposalDocs)
    setStep2BubbleStreamed(snap.step2BubbleStreamed)
    setStep3ClosingBubbleStreamed(snap.step3ClosingBubbleStreamed)
    setGameStep(snap.gameStep)
    setGameSpec(snap.gameSpec)
    setOpenTabs(snap.openTabs)
    setActivePreviewTab(snap.activePreviewTab)
    setPreviewRoute(snap.previewRoute)
    setActiveFilter(snap.activeFilter)
  }

  /** Initialise a fresh first-visit snapshot for `name` based on its
   *  project kind. ops-proposal pre-seeds the goal-collection bubble +
   *  empty preview tabs; web-game gets 预览/资产 tabs; everything else
   *  gets the generic 产物预览 tab. Called from `openProject` when no
   *  prior snapshot exists for the target project. */
  const initProjectDefaults = (name: string) => {
    const sid = `s-${Date.now()}`
    setSessions([{ id: sid, name: '新会话' }])
    setActiveSessionId(sid)
    setChatCleared(true)
    setSentMessages([])
    setNeedsFlowActive(false)
    setNeedsThinkingVisible(true)
    setScene('')
    setAppType('')
    setEnabledCapabilities(new Set())
    setPersonalizationTags(new Set())
    setCapabilitiesStep('idle')
    setTagsStep('idle')
    setTagsAddOpen(false)
    setFormSubmitted(false)
    setTriggers([])
    setTriggerStep('idle')
    setPendingTrigger(null)
    setLastConfirmedTrigger(null)
    setEditingTriggerNameId(null)
    setTriggerSimulations([])
    setProposalGoal(null)
    setProposalPack(null)
    setProposalDocs({})
    setStep2BubbleStreamed(false)
    setStep3ClosingBubbleStreamed(false)
    setGameStep('idle')
    setGameSpec(null)
    setActivePreviewTab(0)
    setPreviewRoute(null)
    setActiveFilter('mini-program')
    resetPublish()
    if (PROJECT_KINDS[name] === 'ops-proposal') {
      setProposalStep('collecting')
      setChatCleared(false)
      setOpenTabs([])
      setSentMessages([
        {
          text: '帮我做沪上火锅品牌五一前的潜客种草提案，预算 50w，目标是 A3 种草和看后搜提升',
          trigger: 'proposal',
        },
      ])
    } else if (PROJECT_KINDS[name] === 'web-game') {
      setProposalStep('idle')
      setOpenTabs([
        { label: '游戏预览', closable: false },
        { label: '素材', closable: false },
      ])
    } else {
      setProposalStep('idle')
      setOpenTabs([{ label: '产物预览', closable: false }])
    }
  }

  /** Open an existing project by name — shared by sidebar clicks and
   *  home-page case cards. Snapshots the outgoing project's full chat
   *  state into `projectChatsRef` so coming back later restores it
   *  intact, then either replays the target project's prior snapshot or
   *  initialises kind-specific defaults on first visit. */
  const openProject = (name: string) => {
    if (name === projectTitle && !platformHomeOpen && !platformResourceLibraryOpen && !platformSkillsOpen && !platformCreativeSquareOpen && !platformDataOpsOpen) {
      // Already on this project — no need to re-snapshot or reset.
      return
    }
    if (projectTitle && !platformHomeOpen) {
      projectChatsRef.current.set(projectTitle, captureProjectSnapshot())
    }
    setProjectTitle(name)
    setPlatformHomeOpen(false)
    setPlatformResourceLibraryOpen(false)
    setPlatformSkillsOpen(false)
    setPlatformCreativeSquareOpen(false)
    setPlatformDataOpsOpen(false)
    const prior = projectChatsRef.current.get(name)
    if (prior) {
      applyProjectSnapshot(prior)
      return
    }
    initProjectDefaults(name)
  }

  useEffect(() => {
    if (!sessionMenuOpen) return
    const handler = (e: PointerEvent) => {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(e.target as Node)) {
        setSessionMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [sessionMenuOpen])

  /** Send a chat message. Triggers:
   *  - 发布/更新 → publish flow
   *  - 关注/评论/点赞/礼物/送礼/投稿时/投稿后 (ai-avatar project) →
   *    trigger-config flow, parses event + action from the message
   *  - 第五人格/小程序 → activate the needs-gathering mock dialog
   *  - otherwise → just append the message bubble
   *  Accepts an optional `override` text (used by empty-state suggestion
   *  chips to send immediately on click, bypassing the draft state). */
  const sendChat = (override?: string) => {
    const text = (override ?? chatDraft).trim()
    if (!text) return
    let trigger: 'none' | 'publish' | 'needs' | 'trigger' = 'none'
    if (/发布|更新/.test(text)) {
      trigger = 'publish'
      resetPublish()
      startPublish('chat')
    } else if (
      activeProjectKind === 'ai-avatar' &&
      /关注|评论|点赞|礼物|送礼|投稿时|投稿后/.test(text)
    ) {
      // Pick the preset event that matches the first keyword hit. Order
      // matters — `送礼` beats `礼物` only because both resolve to the
      // same id, so we check the broader `礼物|送礼` union in one step.
      const eventId: TriggerEventId = /关注/.test(text)
        ? 'user-follow'
        : /评论/.test(text)
          ? 'user-comment'
          : /点赞/.test(text)
            ? 'user-like'
            : /礼物|送礼/.test(text)
              ? 'user-gift'
              : 'user-post'
      const quoted =
        text.match(/["'“”「](.+?)["'”'」]/)?.[1] ?? '欢迎关注'
      const preset = TRIGGER_PRESETS[eventId]
      setPendingTrigger({
        id: `${eventId}-${Date.now().toString(36)}`,
        name: preset.name,
        event: preset.event,
        action: {
          ...DEFAULT_TRIGGER_ACTION,
          description: `向用户发送"${quoted}"`,
        },
      })
      setTriggerStep('loading')
      trigger = 'trigger'
    } else if (/第五人格|小程序/.test(text)) {
      trigger = 'needs'
      setNeedsFlowActive(true)
      setScene('')
      setAppType('')
      setEnabledCapabilities(new Set())
      setPersonalizationTags(new Set())
      setCapabilitiesStep('idle')
      setTagsStep('idle')
      setFormSubmitted(false)
    }
    if (chatCleared) setChatCleared(false)
    // Clear the previous trigger confirmation so the success summary
    // doesn't linger above the next user message.
    if (lastConfirmedTrigger) setLastConfirmedTrigger(null)
    // If this is the first message in a still-default-named session,
    // borrow the user's prompt as the session title (capped at ~20 chars).
    if (sentMessages.length === 0) {
      const nextName = text.length > 20 ? `${text.slice(0, 20)}…` : text
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId && s.name === '新会话'
            ? { ...s, name: nextName }
            : s,
        ),
      )
    }
    setSentMessages((prev) => [...prev, { text, trigger }])
    // Clear both the state AND the contentEditable DOM (innerText won't
    // auto-reset from setChatDraft since the div is uncontrolled).
    setComposerText('')
    // Scroll to bottom after React commits the new message.
    requestAnimationFrame(() => {
      const el = chatScrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }

  /* collapse toggles */
  const [task1Open, setTask1Open] = useState(false)
  const [task2Open, setTask2Open] = useState(false)

  /* product pin — when on, the phone mockup stays pinned on one side and
   * the active code tab renders on the other side. Platform view (the
   * default layout) starts unpinned so the preview tab behaves like any
   * other tab until the user explicitly pins it. */
  const [productPinned, setProductPinned] = useState(false)
  const [productSide, setProductSide] = useState<'left' | 'right'>('left')
  /* Left-column ratio when split. 0.5 = equal halves. Range clamped in drag. */
  const [splitRatio, setSplitRatio] = useState(0.5)
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<{ startX: number; startRatio: number; width: number } | null>(null)

  const onDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = splitContainerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    dragStateRef.current = {
      startX: e.clientX,
      startRatio: splitRatio,
      width: rect.width,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onDividerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current
    if (!state) return
    const delta = (e.clientX - state.startX) / state.width
    const next = Math.min(0.8, Math.max(0.2, state.startRatio + delta))
    setSplitRatio(next)
  }
  const onDividerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
  const [pinMenuOpen, setPinMenuOpen] = useState(false)
  // setPinMenuPos is no longer wired (the pin trigger was removed when
  // the X-column header was replaced by a floating bar). The popover
  // itself is kept (still toggled by pinMenuOpen elsewhere) so the
  // future re-introduction of a pin trigger Just Works.
  const [pinMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const pinTriggerRef = useRef<HTMLSpanElement>(null)
  const pinMenuRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!pinMenuOpen) return
    const handler = (e: PointerEvent) => {
      const target = e.target as Node
      const insideTrigger = pinTriggerRef.current?.contains(target)
      const insideMenu = pinMenuRef.current?.contains(target)
      if (!insideTrigger && !insideMenu) setPinMenuOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [pinMenuOpen])

  /* file tree */
  const [fileTreeOpen, setFileTreeOpen] = useState(false)
  const [fileTreeWidth, setFileTreeWidth] = useState(220)
  const fileTreeDragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  /* File-tree panel is split into two accordion sections that can be
   * collapsed independently: conversation context (referenced skills /
   * knowledge) on top, project codebase (the actual file tree) below. */
  const [contextSectionOpen, setContextSectionOpen] = useState(true)
  const [projectSectionOpen, setProjectSectionOpen] = useState(true)

  const onFileTreeDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    fileTreeDragRef.current = { startX: e.clientX, startWidth: fileTreeWidth }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onFileTreeDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = fileTreeDragRef.current
    if (!state) return
    const next = Math.min(480, Math.max(160, state.startWidth + (e.clientX - state.startX)))
    setFileTreeWidth(next)
  }
  const onFileTreeDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    fileTreeDragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src', 'src/pages', 'src/components']))
  /* Lifted from PlatformSidebar so opening a file anywhere can guarantee
   * the sidebar's owning project is expanded + visible. Starts empty
   * since the platform lands on the home view — no project highlighted. */
  const [platformOpenProjects, setPlatformOpenProjects] = useState<Set<string>>(
    new Set(),
  )

  const fileTree: FileNode[] = [
    { name: 'project.config.json', type: 'file' },
    { name: 'app.json', type: 'file' },
    { name: 'app.tsx', type: 'file' },
    { name: 'app.less', type: 'file' },
    {
      name: 'src',
      type: 'dir',
      children: [
        {
          name: 'pages',
          type: 'dir',
          children: [
            { name: 'index', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
              { name: 'index.less', type: 'file' },
              { name: 'index.config.ts', type: 'file' },
            ]},
            { name: 'chat', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
              { name: 'index.less', type: 'file' },
            ]},
            { name: 'profile', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
              { name: 'index.less', type: 'file' },
            ]},
            { name: 'tarot', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
              { name: 'result.tsx', type: 'file' },
              { name: 'index.less', type: 'file' },
            ]},
          ],
        },
        {
          name: 'components',
          type: 'dir',
          children: [
            { name: 'NavBar.tsx', type: 'file' },
            { name: 'TabBar.tsx', type: 'file' },
            { name: 'ChatBubble.tsx', type: 'file' },
            { name: 'TarotCard.tsx', type: 'file' },
            { name: 'DramaCard.tsx', type: 'file' },
          ],
        },
        { name: 'services', type: 'dir', children: [
          { name: 'api.ts', type: 'file' },
          { name: 'request.ts', type: 'file' },
          { name: 'chat.ts', type: 'file' },
        ]},
        { name: 'store', type: 'dir', children: [
          { name: 'index.ts', type: 'file' },
          { name: 'user.ts', type: 'file' },
          { name: 'chat.ts', type: 'file' },
        ]},
        { name: 'utils', type: 'dir', children: [
          { name: 'format.ts', type: 'file' },
          { name: 'auth.ts', type: 'file' },
        ]},
        { name: 'assets', type: 'dir', children: [
          { name: 'logo.png', type: 'file' },
          { name: 'tarot-bg.png', type: 'file' },
        ]},
      ],
    },
    // Agent capabilities injected after the user confirms the form — each
    // enabled capability becomes a subfolder under `.agent/skills/` with its
    // own SKILL.md + manifest.yaml. Mirrors the project tree in the design.
    ...(formSubmitted && enabledCapabilities.size > 0
      ? [
          {
            name: '.agent',
            type: 'dir' as const,
            children: [
              { name: 'manifest.json', type: 'file' as const },
              { name: 'business-config.json', type: 'file' as const },
              {
                name: 'skills',
                type: 'dir' as const,
                children: CAPABILITY_OPTIONS.filter((c) => enabledCapabilities.has(c.id)).map(
                  (c) => ({
                    name: c.folderName,
                    type: 'dir' as const,
                    children: [
                      { name: 'SKILL.md', type: 'file' as const },
                      { name: 'manifest.yaml', type: 'file' as const },
                    ],
                  }),
                ),
              },
            ],
          },
        ]
      : []),
  ]

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  /* File tree for the AI 分身 project — mirrors the real 个人数字分身 code
   * structure: `.agent/skills/*` bind-avatar skill folders + an
   * `avatar-agent/` folder holding the avatar config / verify-result /
   * user-persona JSON. Stub content; opening these files just creates an
   * empty tab since they aren't in codeFiles. */
  const aiPersonaFileTree: FileNode[] = [
    {
      name: '.agent',
      type: 'dir',
      children: [
        {
          name: 'skills',
          type: 'dir',
          children: [
            {
              name: 'bind_avatar_component',
              type: 'dir',
              children: [
                { name: 'douyin-ai-platform-manifest.json', type: 'file' },
                { name: 'SKILL.md', type: 'file' },
              ],
            },
            {
              name: 'bind_avatar_skill',
              type: 'dir',
              children: [
                { name: 'douyin-ai-platform-manifest.json', type: 'file' },
                { name: 'SKILL.md', type: 'file' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'avatar-agent',
      type: 'dir',
      children: [
        { name: 'avatar_config.json', type: 'file' },
        { name: 'avatar_verify_result.json', type: 'file' },
        { name: 'douyin_user_persona.json', type: 'file' },
      ],
    },
    // triggers/ folder only appears once the user configures at least
    // one trigger via the chat flow. Each file maps 1:1 to an entry in
    // `triggers[]` via the filename suffix (last 6 chars of the id).
    ...(triggers.length > 0
      ? [
          {
            name: 'triggers',
            type: 'dir' as const,
            children: triggers.map((t) => ({
              name: `${t.event.id}-${t.id.slice(-6)}.trigger.json`,
              type: 'file' as const,
            })),
          },
        ]
      : []),
  ]

  /* File tree for the 个人作品集网站 project — a generic React + Vite
   * frontend site. Static structure: multi-page `src/pages`, components,
   * hooks, lib, styles + `public/assets` for static images. Mirrors a
   * mini-program structurally but is previewed in a browser frame. */
  const webAppFileTree: FileNode[] = [
    { name: 'index.html', type: 'file' },
    { name: 'package.json', type: 'file' },
    { name: 'vite.config.ts', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
    {
      name: 'public',
      type: 'dir',
      children: [
        {
          name: 'assets',
          type: 'dir',
          children: [
            { name: 'logo.svg', type: 'file' },
            { name: 'hero.png', type: 'file' },
            { name: 'avatar.png', type: 'file' },
          ],
        },
      ],
    },
    {
      name: 'src',
      type: 'dir',
      children: [
        { name: 'main.tsx', type: 'file' },
        { name: 'App.tsx', type: 'file' },
        {
          name: 'pages',
          type: 'dir',
          children: [
            { name: 'Home', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
              { name: 'index.module.css', type: 'file' },
            ]},
            { name: 'Works', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
              { name: 'index.module.css', type: 'file' },
            ]},
            { name: 'About', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
            ]},
            { name: 'Contact', type: 'dir', children: [
              { name: 'index.tsx', type: 'file' },
            ]},
          ],
        },
        {
          name: 'components',
          type: 'dir',
          children: [
            { name: 'Navbar.tsx', type: 'file' },
            { name: 'Footer.tsx', type: 'file' },
            { name: 'ProjectCard.tsx', type: 'file' },
            { name: 'ThemeToggle.tsx', type: 'file' },
          ],
        },
        { name: 'hooks', type: 'dir', children: [
          { name: 'useTheme.ts', type: 'file' },
          { name: 'useScrollSpy.ts', type: 'file' },
        ]},
        { name: 'lib', type: 'dir', children: [
          { name: 'api.ts', type: 'file' },
          { name: 'constants.ts', type: 'file' },
        ]},
        { name: 'styles', type: 'dir', children: [
          { name: 'globals.css', type: 'file' },
        ]},
      ],
    },
  ]

  /* File tree for the Garuda game — mirrors the real /public/garuda
   * folder served by Vite. Animation folders (garuda_*-webp/, enemy_*-webp/)
   * contain dozens-to-hundreds of frame files; only the first few + a
   * truncation marker are listed to keep the sidebar usable. */
  const animFolder = (
    name: string,
    prefix: string,
    pad: 2 | 3,
    total: number,
    ext = '.webp',
    show = 4,
  ): FileNode => ({
    name,
    type: 'dir',
    children: [
      ...Array.from({ length: Math.min(show, total) }, (_, i) => ({
        name: `${prefix}_${String(i).padStart(pad, '0')}${ext}`,
        type: 'file' as const,
      })),
      ...(total > show
        ? [{ name: `…还有 ${total - show} 帧`, type: 'file' as const }]
        : []),
    ],
  })

  const garudaFileTree: FileNode[] = [
    { name: 'ASSET_LICENSE.md', type: 'file' },
    { name: 'LICENSE', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'WEB_RELEASE.md', type: 'file' },
    { name: 'index.html', type: 'file' },
    { name: 'garuda.js', type: 'file' },
    { name: 'jsfxr.js', type: 'file' },
    { name: 'sw.js', type: 'file' },
    {
      name: 'assets',
      type: 'dir',
      children: [
        { name: 'Start.jpg', type: 'file' },
        { name: 'background.jpg', type: 'file' },
        { name: 'logo.jpg', type: 'file' },
        { name: 'bgm.mp3', type: 'file' },
        { name: 'trans.mp3', type: 'file' },
        { name: 'killer.mp3', type: 'file' },
        { name: 'laser.wav', type: 'file' },
        { name: 'explosion_.wav', type: 'file' },
        { name: 'sfx_bomb_blast.wav', type: 'file' },
        { name: 'sfx_explosion_big.wav', type: 'file' },
        { name: 'sfx_explosion_small.wav', type: 'file' },
        { name: 'sfx_shield_on.wav', type: 'file' },
        { name: 'button_start.png', type: 'file' },
        { name: 'button_rank.png', type: 'file' },
        { name: 'coin.png', type: 'file' },
        { name: 'mission_start.webp', type: 'file' },
        { name: 'mission_start.png', type: 'file' },
        { name: 'mission_start.original.webp', type: 'file' },
        { name: 'start_anime_compressed.mp4', type: 'file' },
        { name: 'garuda_bullet.png', type: 'file' },
        { name: 'garuda_killermove.webp', type: 'file' },
        { name: 'garuda_menu.mp4', type: 'file' },
        { name: 'killer.png', type: 'file' },
        { name: 'killer_R.png', type: 'file' },
        ...['blood_0', 'blood_1', 'blood_2', 'blood_3', 'blood_4', 'blood_full'].map(
          (n): FileNode => ({ name: `${n}.png`, type: 'file' }),
        ),
        ...['shield_0', 'shield_1', 'shield_2', 'shield_full'].map(
          (n): FileNode => ({ name: `${n}.png`, type: 'file' }),
        ),
        ...['special_0', 'special_1', 'special_2', 'special_full'].map(
          (n): FileNode => ({ name: `${n}.png`, type: 'file' }),
        ),
        ...['explosion_0', 'explosion_clean_0', 'explosion_clean_1', 'explosion_clean_2', 'explosion_clean_3'].map(
          (n): FileNode => ({ name: `${n}.png`, type: 'file' }),
        ),
        ...['item_blood', 'item_bomb', 'item_enegy', 'item_laser', 'item_shell', 'item_speed'].map(
          (n): FileNode => ({ name: `${n}.png`, type: 'file' }),
        ),
        { name: 'item_Self-Destruct.webp', type: 'file' },
        ...['enemy_Energy Resist', 'enemy_Physical Armor', 'enemy_RapidFire', 'enemy_Shield Generator', 'enemy_Vitality'].map(
          (n): FileNode => ({ name: `${n}.webp`, type: 'file' }),
        ),
        {
          name: 'enemy',
          type: 'dir',
          children: [
            { name: 'enemy_0.png', type: 'file' },
            { name: 'enemy_2.png', type: 'file' },
            { name: 'enemy_3.webp', type: 'file' },
            { name: 'enemy_3_clean.webp', type: 'file' },
            { name: 'enemy_4.webp', type: 'file' },
            { name: 'enemy_4_clean.webp', type: 'file' },
            { name: 'enemy_bullet.png', type: 'file' },
            animFolder('enemy_1-webp', 'enemy_1', 2, 24, '.webp'),
            animFolder('enemy_boss-webp', 'enemy_boss', 2, 60, '.webp'),
          ],
        },
        animFolder('garuda_fly-webp', 'garuda_fly', 2, 50),
        animFolder('garuda_bomb-webp', 'garuda_bomb', 3, 152),
        animFolder('garuda_killer_video-webp', 'garuda_killer_video', 3, 80),
        animFolder('garuda_shell_gif-webp', 'garuda_shell_gif', 2, 31),
        animFolder('garuda_shield-webp', 'garuda_shield', 3, 101),
        animFolder('garuda_special-webp', 'garuda_special', 3, 202),
      ],
    },
    {
      name: 'docs',
      type: 'dir',
      children: [
        { name: 'garuda-key-art.png', type: 'file' },
        { name: 'garuda-gameplay-showcase.png', type: 'file' },
        { name: 'garuda-build-icons.png', type: 'file' },
      ],
    },
  ]

  /* Which file tree belongs to each project. Projects not in this map
   * are treated as empty stubs ("暂无文件"). 沪上火锅 starts as a stub —
   * the proposal flow appends its generated artefacts (商家目标卡.md,
   * 提案报告.md, 复盘.md, 执行看板.json …) into the 'briefs' / 'reports'
   * folders as the chat-driven steps complete. */
  const [projectTrees, setProjectTrees] = useState<Record<string, FileNode[]>>({
    '第五人格塔罗小程序': fileTree,
    '陶白白 Sensei 分身': aiPersonaFileTree,
    '粉丝互动机器人': aiPersonaFileTree,
    // 六一儿童节 H5 — buildProductView('marketing-h5') will re-bucket
    // this raw tree into 4 product leaves, so the concrete file list
    // here is mostly a placeholder so the row stops at "暂无文件".
    '六一儿童节活动': [
      { name: 'docs', type: 'dir', children: [{ name: '六一活动方案.md', type: 'file' }] },
      { name: 'assets', type: 'dir', children: [] },
      { name: 'gameplay', type: 'dir', children: [{ name: '玩法配置.json', type: 'file' }] },
      { name: 'config', type: 'dir', children: [{ name: 'h5.config.json', type: 'file' }] },
    ],
    '个人作品集网站': webAppFileTree,
    'Garuda · 神明黄昏': garudaFileTree,
    '沪上火锅·五一种草提案': [
      { name: 'briefs', type: 'dir', children: [] },
      { name: 'configs', type: 'dir', children: [] },
      { name: 'reports', type: 'dir', children: [] },
      { name: 'dashboards', type: 'dir', children: [] },
    ],
  })

  /* preview tab */
  // For proposal deep-link entries the right preview starts empty
  // (artefact tabs auto-append later via the proposalDocs effect). For
  // other project kinds we seed the standard 产物预览 + soul.md +
  // app.tsx tabs.
  const wantsProposalDeepLink =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('project') === 'proposal'
  const [openTabs, setOpenTabs] = useState(() =>
    wantsProposalDeepLink
      ? []
      : [
          { label: '产物预览', closable: false },
          { label: 'soul.md', closable: true },
          { label: 'app.tsx', closable: true },
        ],
  )
  // Default: 打开 soul.md（AI 分身定义）作为第一眼看到的文件，其次 app.tsx
  // 可关。工作区布局下，产物预览 tab 也通过 productPinned 保持高亮。
  const [activePreviewTab, setActivePreviewTab] = useState(
    wantsProposalDeepLink ? 0 : 1,
  )

  // When the right preview area is fully hidden (artifact-shape projects
  // with no artefacts yet), center the chat in the area between the
  // project sidebar and the right viewport edge — capped at
  // PREVIEW_HIDDEN_CHAT_MAX so the line length stays readable on wide
  // monitors. Both `width` and `left` are recomputed so the column reads
  // as a single centered surface with empty padding on both sides.
  // openTabs being empty is the sentinel; only proposal mode reaches it
  // since other shapes seed a 产物预览 tab.
  const PREVIEW_HIDDEN_CHAT_MAX = 760
  /** User-toggled collapse of the right preview pane (separate from the
   *  artifact-no-tabs sentinel — both fold the pane). */
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  /** Add-tab menu — opens beside the + button next to the tab list. */
  const [addTabMenuOpen, setAddTabMenuOpen] = useState(false)
  const addTabMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!addTabMenuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (!addTabMenuRef.current?.contains(e.target as Node)) setAddTabMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [addTabMenuOpen])
  /** Right-side edit panel (web-game only) — opens a visualization editor
   *  alongside the game preview. */
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [editPanelWidth, setEditPanelWidth] = useState(340)
  const editPanelDragRef = useRef<{ startX: number; startWidth: number } | null>(null)
  /** Preview-toolbar product switcher (web-game and friends). The left
   *  side of the toolbar shows the active product's name; clicking it
   *  opens this dropdown listing every non-closable tab (i.e. real
   *  products) so the user can swap surface without reaching for the
   *  tab strip. */
  const [productMenuOpen, setProductMenuOpen] = useState(false)
  const productMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!productMenuOpen) return
    const handler = (e: PointerEvent) => {
      if (productMenuRef.current && !productMenuRef.current.contains(e.target as Node)) {
        setProductMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [productMenuOpen])
  /** 素材 tab — left category-filter side panel. Toggled by a list
   *  icon-button in the preview toolbar; `assetCategoryFilter === null`
   *  means "show all groups". */
  const [assetPanelOpen, setAssetPanelOpen] = useState(false)
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string | null>(null)
  const onEditPanelDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    editPanelDragRef.current = { startX: e.clientX, startWidth: editPanelWidth }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onEditPanelDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = editPanelDragRef.current
    if (!s) return
    const next = Math.min(560, Math.max(260, s.startWidth - (e.clientX - s.startX)))
    setEditPanelWidth(next)
  }
  const onEditPanelDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    editPanelDragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }
  const previewHidden = openTabs.length === 0 || previewCollapsed
  const effectiveChatWidth: string | number = previewHidden
    ? isPlatform
      ? `calc(100vw - ${effectiveSidebarWidth}px)`
      : `min(calc(100vw - ${effectiveSidebarWidth}px), ${PREVIEW_HIDDEN_CHAT_MAX}px)`
    : chatWidthPx
  const effectiveChatLeft: string | number = previewHidden
    ? isPlatform
      ? `${effectiveSidebarWidth}px`
      : `calc(${effectiveSidebarWidth}px + max(0px, (100vw - ${effectiveSidebarWidth}px - ${PREVIEW_HIDDEN_CHAT_MAX}px) / 2))`
    : effectiveSidebarWidth

  /** Find-or-focus a tab by label, pushing a new closable tab when
   *  absent. Used for AI-分身 structured tabs (基础信息 / 人设指令 /
   *  知识·* / 技能·*). */
  const openNamedTab = (label: string) => {
    const existing = openTabs.findIndex((t) => t.label === label)
    if (existing >= 0) {
      setActivePreviewTab(existing)
      return
    }
    const next = [...openTabs, { label, closable: true }]
    setOpenTabs(next)
    setActivePreviewTab(next.length - 1)
  }

  const openFileInTab = (filename: string) => {
    // Product-view 页面 nodes aren't files — clicking one navigates the
    // right-side preview to that page and focuses the 产物预览 tab.
    const activeTree = projectTrees[projectTitle]
    if (activeTree && getProductPages(activeTree).some((p) => p.label === filename)) {
      setPreviewRoute(filename)
      const idx = openTabs.findIndex((t) => t.label === '产物预览')
      setActivePreviewTab(idx >= 0 ? idx : 0)
      return
    }
    // web-game projects route every sidebar file click into one of the
    // built-in tabs (预览 / 资产 / 代码). 代码 isn't in the default tab
    // strip — it gets appended on demand here when the user opens a
    // source file. Everything under assets/ or docs/ → 资产.
    if (PROJECT_KINDS[projectTitle] === 'web-game') {
      if (filename.startsWith('…')) return
      // Product-view leaves drive the right pane directly: 游戏 → game
      // runtime tab; 素材 → assets browser tab.
      if (filename === '游戏预览' || filename === '素材') {
        const idx = openTabs.findIndex((t) => t.label === filename)
        if (idx >= 0) setActivePreviewTab(idx)
        return
      }
      const sourceFiles = [
        'index.html',
        'garuda.js',
        'jsfxr.js',
        'sw.js',
        'README.md',
        'WEB_RELEASE.md',
        'ASSET_LICENSE.md',
        'LICENSE',
      ]
      const targetLabel = sourceFiles.includes(filename) ? '代码' : '素材'
      const idx = openTabs.findIndex((t) => t.label === targetLabel)
      if (idx >= 0) {
        setActivePreviewTab(idx)
      } else if (targetLabel === '代码') {
        const next = [...openTabs, { label: '代码', closable: true }]
        setOpenTabs(next)
        setActivePreviewTab(next.length - 1)
      }
      return
    }
    // AI 分身 product-view sections open structured tabs (form / doc /
    // capability detail) — never raw config files.
    const avatarConfig = getAvatarConfig(projectTitle)
    if (avatarConfig) {
      if (filename === '基础信息' || filename === '人设指令') {
        openNamedTab(filename)
        return
      }
      if (avatarConfig.knowledgeInfoList.some((c) => c.name === filename)) {
        openNamedTab(`知识·${filename}`)
        return
      }
      if (
        [...avatarConfig.skillInfoList, ...avatarConfig.toolInfoList].some(
          (c) => c.name === filename,
        )
      ) {
        openNamedTab(`技能·${filename}`)
        return
      }
    }
    // 小程序 product-view sections open structured tabs too.
    const miniProgramConfig = getMiniProgramConfig(projectTitle)
    if (
      miniProgramConfig &&
      (filename === '智能体' ||
        filename === '小程序设置' ||
        filename === '静态素材')
    ) {
      openNamedTab(filename)
      return
    }
    // Trigger files route to the structured detail view, not codeFiles.
    // Filename pattern: `${event.id}-${id.slice(-6)}.trigger.json`.
    if (filename.endsWith('.trigger.json')) {
      const match = triggers.find(
        (t) => `${t.event.id}-${t.id.slice(-6)}.trigger.json` === filename,
      )
      if (match) {
        openTriggerTab(match)
        return
      }
    }
    const existing = openTabs.findIndex((t) => t.label === filename)
    if (existing >= 0) {
      setActivePreviewTab(existing)
    } else {
      // Proposal-flow artefacts (人群诊断.md, 人群诊断看板, 提案报告.md…)
      // pin as non-closable so the right preview reads as a stable
      // "产物总览" surface — once an artefact exists it stays.
      const isProposalArtefact = filename in proposalDocs
      const next = [
        ...openTabs,
        { label: filename, closable: !isProposalArtefact },
      ]
      setOpenTabs(next)
      setActivePreviewTab(next.length - 1)
    }
    // Ensure the file's owning project is expanded in the platform sidebar
    // so the user can see it located there too.
    setPlatformOpenProjects((prev) => {
      if (prev.has('项目名称_02')) return prev
      const next = new Set(prev)
      next.add('项目名称_02')
      return next
    })
  }

  const DIFF_TAB_LABEL = '变更详情'
  const openChangesDetail = () => {
    const existing = openTabs.findIndex((t) => t.label === DIFF_TAB_LABEL)
    if (existing >= 0) {
      setActivePreviewTab(existing)
    } else {
      const next = [...openTabs, { label: DIFF_TAB_LABEL, closable: true }]
      setOpenTabs(next)
      setActivePreviewTab(next.length - 1)
    }
  }

  /* ─── Resource library page state ─── */
  // Read the deep-link query at mount so the first paint already shows
  // the resource library — avoids the home-then-flash-to-library
  // hiccup that an effect-based hydration would produce.
  const initialFromQuery =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('page') === 'resources'
  const [platformResourceLibraryOpen, setPlatformResourceLibraryOpen] =
    useState(initialFromQuery)
  const [platformSkillsOpen, setPlatformSkillsOpen] = useState(false)
  const [platformCreativeSquareOpen, setPlatformCreativeSquareOpen] =
    useState(false)
  const [platformDataOpsOpen, setPlatformDataOpsOpen] = useState(false)
  /** Any non-workspace platform-level overlay is open. Used to hide the
   *  chat aside, header, and adjust body margins / padding. */
  const platformSecondaryPageOpen =
    platformResourceLibraryOpen ||
    platformSkillsOpen ||
    platformCreativeSquareOpen ||
    platformDataOpsOpen
  const [resourceLibraryPrimary, setResourceLibraryPrimary] =
    useState<PrimaryCategory | null>('官方')
  const [resourceLibrarySecondary, setResourceLibrarySecondary] = useState<
    string | null
  >(null)
  const [resourceLibraryCapability, setResourceLibraryCapability] = useState<
    { platformId: string; name: string; category: string | null } | null
  >(null)
  const [resourceLibraryExpanded, setResourceLibraryExpanded] = useState<
    Set<PrimaryCategory>
  >(
    () =>
      new Set([
        '业务平台',
        '舆情监控',
        '内容理解与生成',
        '数据分析和处理',
        '开发和效率',
        '官方引入',
      ]),
  )
  const [resourceLibrarySearch, setResourceLibrarySearch] = useState('')
  const [resourceLibraryTypeFilter, setResourceLibraryTypeFilter] = useState<
    ResourceLibraryTypeFilter
  >('skill-tool')
  /** When set, the workspace mounts and inserts an @-mention with this
   *  shape into the chat composer once it's available. Consumed by an
   *  effect so the DOM ref is ready before we manipulate it.
   *  `id` doubles as the mention pill's data-mention-id. */
  const [pendingMention, setPendingMention] = useState<
    { id: string; name: string } | null
  >(null)
  const toggleResourceLibraryExpanded = (primary: PrimaryCategory) => {
    setResourceLibraryExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(primary)) next.delete(primary)
      else next.add(primary)
      return next
    })
  }
  const openResourceLibraryPage = () => {
    setPlatformHomeOpen(false)
    setPlatformSkillsOpen(false)
    setPlatformCreativeSquareOpen(false)
    setPlatformDataOpsOpen(false)
    setPlatformResourceLibraryOpen(true)
  }

  /** Query-string deep link: `?page=resources` opens the library on
   *  initial load (and via browser back/forward). Using the query
   *  string keeps the hash free for external tools (e.g. Figma's
   *  capture script uses `#figmacapture=...`) without interference. */
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(window.location.search)
      if (params.get('page') === 'resources') {
        setPlatformHomeOpen(false)
        setPlatformSkillsOpen(false)
        setPlatformCreativeSquareOpen(false)
        setPlatformDataOpsOpen(false)
        setPlatformResourceLibraryOpen(true)
      }
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Mirror the library-open state back to the URL so the page is
   *  shareable / refresh-safe. Uses replaceState to avoid spurious
   *  history entries. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (platformResourceLibraryOpen) {
      params.set('page', 'resources')
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    const next =
      window.location.pathname +
      (qs ? `?${qs}` : '') +
      window.location.hash
    if (next !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(null, '', next)
    }
  }, [platformResourceLibraryOpen])
  const openPlatformSkillsPage = () => {
    setPlatformHomeOpen(false)
    setPlatformResourceLibraryOpen(false)
    setPlatformCreativeSquareOpen(false)
    setPlatformDataOpsOpen(false)
    setPlatformSkillsOpen(true)
  }
  const openPlatformCreativeSquarePage = () => {
    setPlatformHomeOpen(false)
    setPlatformResourceLibraryOpen(false)
    setPlatformSkillsOpen(false)
    setPlatformDataOpsOpen(false)
    setPlatformCreativeSquareOpen(true)
  }
  const openPlatformDataOpsPage = () => {
    setPlatformHomeOpen(false)
    setPlatformResourceLibraryOpen(false)
    setPlatformSkillsOpen(false)
    setPlatformCreativeSquareOpen(false)
    setPlatformDataOpsOpen(true)
  }

  const closeTab = (index: number) => {
    if (!openTabs[index]?.closable) return
    const next = openTabs.filter((_, i) => i !== index)
    setOpenTabs(next)
    if (activePreviewTab >= next.length) setActivePreviewTab(next.length - 1)
    else if (activePreviewTab === index) setActivePreviewTab(Math.max(0, index - 1))
  }

  /* ─── Trigger detail tab helpers ─── */
  /** Tab label for a trigger — keyed off the event label (stable even
   *  when the user renames the trigger). Used as the single identifier
   *  tying openTabs to the triggers[] array in `renderTab`. */
  const triggerTabLabel = (t: TriggerConfig) => `触发器·${t.event.label}`
  /** Open the detail tab for a configured trigger. Find-or-push pattern
   *  matches openChangesDetail so duplicates never accumulate. */
  const openTriggerTab = (t: TriggerConfig) => {
    const label = triggerTabLabel(t)
    const existing = openTabs.findIndex((tab) => tab.label === label)
    if (existing >= 0) {
      setActivePreviewTab(existing)
    } else {
      const next = [...openTabs, { label, closable: true }]
      setOpenTabs(next)
      setActivePreviewTab(next.length - 1)
    }
  }
  /** Remove a trigger. Also closes its detail tab if open, and clears
   *  any in-flight rename on that trigger. */
  const deleteTrigger = (id: string) => {
    const t = triggers.find((x) => x.id === id)
    if (!t) return
    const label = triggerTabLabel(t)
    setTriggers((prev) => prev.filter((x) => x.id !== id))
    if (editingTriggerNameId === id) setEditingTriggerNameId(null)
    const idx = openTabs.findIndex((tab) => tab.label === label)
    if (idx >= 0) closeTab(idx)
  }
  /** Rename a trigger's display title. Tab label stays fixed (derived
   *  from the event, not the name), so no tab-sync needed. */
  const renameTrigger = (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: trimmed } : t)),
    )
  }
  /** Append a generated artefact file into the 沪上火锅 project tree
   *  under the given top-level folder. Auto-expands the folder so the
   *  new file is visible without hunting in the tree. */
  const appendProposalFile = (folder: string, filename: string) => {
    setProjectTrees((prev) => {
      const tree = prev['沪上火锅·五一种草提案']
      if (!tree) return prev
      const next = tree.map((node) =>
        node.name === folder && node.type === 'dir'
          ? {
              ...node,
              children: [
                ...(node.children ?? []).filter((c) => c.name !== filename),
                { name: filename, type: 'file' as const },
              ],
            }
          : node,
      )
      return { ...prev, '沪上火锅·五一种草提案': next }
    })
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      next.add(folder)
      return next
    })
  }

  /** Auto-append a non-closable preview tab whenever the proposal flow
   *  produces a new artefact. Activates the new tab so the user lands on
   *  it immediately. Only runs in artifact-shape projects (sentinel via
   *  proposalDocs being non-empty for this case). */
  useEffect(() => {
    const docKeys = Object.keys(proposalDocs)
    if (docKeys.length === 0) return
    setOpenTabs((prev) => {
      const known = new Set(prev.map((t) => t.label))
      const additions = docKeys
        .filter((k) => !known.has(k))
        .map((k) => ({ label: k, closable: false }))
      if (additions.length === 0) return prev
      const next = [...prev, ...additions]
      // Activate the most recent addition so the user immediately sees
      // the freshly produced artefact.
      setActivePreviewTab(next.length - 1)
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalDocs])

  /** Step 2 — run the audience & traffic diagnosis. Appends both the
   *  人群诊断.md doc and a 人群诊断看板 visual dashboard, then advances the
   *  flow to `audience-diagnosed`. The dashboard renders via
   *  ProposalAudienceDashboard when opened (see renderTab dispatch). */
  const runAudienceDiagnosis = () => {
    const filename = '人群诊断.md'
    const dashboardName = '人群诊断看板'
    setProposalDocs((prev) => ({
      ...prev,
      [filename]: renderDiagnosisMarkdown(),
      [dashboardName]: '',
    }))
    appendProposalFile('briefs', filename)
    appendProposalFile('dashboards', dashboardName)
    setProposalStep('audience-diagnosed')
  }

  /** Step 3 — confirm the chosen 达人包 strategy. Persists the pick into
   *  configs/达人包.md and advances to `pack-ready`. */
  const confirmProposalPack = (pick: ProposalPackId) => {
    setProposalPack(pick)
    const filename = '达人包.md'
    setProposalDocs((prev) => ({
      ...prev,
      [filename]: renderPackMarkdown(pick),
    }))
    appendProposalFile('configs', filename)
    setProposalStep('pack-ready')
  }

  /** Step 4 — confirm play + brief assignment. Persists into
   *  briefs/玩法brief.md and advances to `brief-ready`. */
  const confirmProposalBrief = () => {
    const filename = '玩法brief.md'
    setProposalDocs((prev) => ({
      ...prev,
      [filename]: renderBriefMarkdown(),
    }))
    appendProposalFile('briefs', filename)
    setProposalStep('brief-ready')
  }

  /** Step 5 — assemble the full proposal report. Persists into
   *  reports/提案报告.md and advances to `report-ready`. */
  const assembleProposalReport = () => {
    if (!proposalGoal || !proposalPack) return
    const filename = '提案报告.md'
    setProposalDocs((prev) => ({
      ...prev,
      [filename]: renderReportMarkdown(proposalGoal, proposalPack),
    }))
    appendProposalFile('reports', filename)
    setProposalStep('report-ready')
  }

  /** Step 6 — convert the report into an execution dashboard. Persists
   *  into dashboards/执行看板.md and advances to `dashboard-ready`. */
  const convertProposalToDashboard = () => {
    const filename = '执行看板.md'
    setProposalDocs((prev) => ({
      ...prev,
      [filename]: renderDashboardMarkdown(),
    }))
    appendProposalFile('dashboards', filename)
    setProposalStep('dashboard-ready')
  }

  /** Step 7 — run the post-execution review. Persists into
   *  reports/复盘.md and advances to terminal `review-ready`. */
  const runProposalReview = () => {
    const filename = '复盘.md'
    setProposalDocs((prev) => ({
      ...prev,
      [filename]: renderReviewMarkdown(),
    }))
    appendProposalFile('reports', filename)
    setProposalStep('review-ready')
  }

  /** Step 1 submit — render the merchant goal draft into markdown,
   *  append the file to the 沪上火锅 project tree under briefs/, advance
   *  the proposal flow to `goal-confirmed` so the chat can show the AI
   *  目标解析 + 追问 follow-up. */
  const submitProposalGoal = (draft: ProposalGoalDraft) => {
    setProposalGoal(draft)
    setProposalStep('goal-confirmed')
    const filename = '商家目标卡.md'
    setProposalDocs((prev) => ({
      ...prev,
      [filename]: renderGoalMarkdown(draft),
    }))
    appendProposalFile('briefs', filename)
  }

  /** Order of proposal steps — used to decide whether the rendered chat
   *  should include cumulative bubbles for past steps. */
  const PROPOSAL_ORDER = [
    'idle',
    'collecting',
    'goal-confirmed',
    'audience-diagnosed',
    'pack-ready',
    'brief-ready',
    'report-ready',
    'dashboard-ready',
    'review-ready',
  ] as const
  const proposalAtOrPast = (step: ProposalStep) =>
    PROPOSAL_ORDER.indexOf(proposalStep) >=
    PROPOSAL_ORDER.indexOf(step)
  /** True while a chat-embedded form is awaiting user input (Step 1
   *  目标卡, Step 3 包选择, Step 4 玩法/Brief). The composer is replaced
   *  with a focusing hint bar in this state so the user has a single
   *  unambiguous action target. */
  const proposalFormPendingLabel: string | null =
    proposalStep === 'collecting'
      ? '商家目标卡'
      : proposalStep === 'audience-diagnosed'
        ? '达人包策略'
        : proposalStep === 'pack-ready'
          ? '玩法 + Brief'
          : null

  /** Confirm the currently-pending trigger — commit it to triggers[],
   *  clear pending state, auto-expand the triggers/ folder, and open
   *  the new detail tab for immediate review. */
  const confirmPendingTrigger = () => {
    if (!pendingTrigger) return
    const t = pendingTrigger
    setTriggers((prev) => [...prev, t])
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      next.add('triggers')
      return next
    })
    setTriggerStep('confirmed')
    setPendingTrigger(null)
    setLastConfirmedTrigger(t)
    // Detail tab no longer auto-opens — the inline chat summary has a
    // "view config" CTA and the sidebar shows the new triggers/ file, so
    // the user can land on the detail view on their own schedule.
  }
  /** Discard the pending trigger so the user can re-phrase. */
  const cancelPendingTrigger = () => {
    setPendingTrigger(null)
    setTriggerStep('idle')
  }
  /** Simulate a configured trigger firing in the phone preview. Appends
   *  a new entry to `triggerSimulations`; the preview scrolls the new
   *  reply into view via its own effect. */
  const simulateTrigger = (t: TriggerConfig) => {
    setTriggerSimulations((prev) => [
      ...prev,
      {
        key: `${t.id}-${Date.now()}`,
        eventId: t.event.id,
        eventLabel: t.event.label,
        actionDescription: t.action.description,
      },
    ])
  }
  /* helper to build a code line */
  const L = (num: number, ...tokens: [string, string][]) => ({
    num,
    tokens: tokens.map(([text, color]) => ({ text, color })),
  })
  const k = 'text-[var(--syntax-keyword)]' // keyword
  const s = 'text-[var(--syntax-string)]'  // string
  const f = 'text-[var(--syntax-func)]'    // function/tag
  const c = 'text-[var(--syntax-comment)]' // comment
  const n = 'text-[var(--syntax-jsx)]'     // number/const (share warm tone)
  const t = 'text-[var(--color-ink)]/80'   // text
  const p = 'text-[var(--syntax-operator)]' // operator
  const x = 'text-[var(--syntax-jsx)]'     // JSX tag

  const codeFiles: Record<string, { lang: string; lines: { num: number; tokens: { text: string; color: string }[] }[] }> = {
    'app.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' Taro ', t], ['from', k], [" '@tarojs/taro'", s]),
      L(2, ['import', k], [' { Component } ', t], ['from', k], [" 'react'", s]),
      L(3, ['import', k], [" './app.less'", s]),
      L(4),
      L(5, ['class', k], [' App ', f], ['extends', k], [' Component {', t]),
      L(6),
      L(7, ['  componentDidMount', f], ['() {', t]),
      L(8, ['    console.log(', t], ["'第五人格小程序已启动'", s], [')', t]),
      L(9, ['  }', t]),
      L(10),
      L(11, ['  componentDidShow', f], ['() {}', t]),
      L(12, ['  componentDidHide', f], ['() {}', t]),
      L(13),
      L(14, ['  render() {', t]),
      L(15, ['    ', ''], ['// this.props.children 是将要会渲染的页面', c]),
      L(16, ['    ', ''], ['return', k], [' this', n], ['.props.children', t]),
      L(17, ['  }', t]),
      L(18, ['}', t]),
      L(19),
      L(20, ['export', k], [' default', k], [' App', f]),
    ]},
    'index.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' { View, Text, Image } ', t], ['from', k], [" '@tarojs/components'", s]),
      L(2, ['import', k], [' { useLoad } ', t], ['from', k], [" '@tarojs/taro'", s]),
      L(3, ['import', k], [' NavBar ', t], ['from', k], [" '../../components/NavBar'", s]),
      L(4, ['import', k], [' TabBar ', t], ['from', k], [" '../../components/TabBar'", s]),
      L(5, ['import', k], [' TarotCard ', t], ['from', k], [" '../../components/TarotCard'", s]),
      L(6, ['import', k], [" './index.less'", s]),
      L(7),
      L(8, ['export default', k], [' function', k], [' Index', f], ['() {', t]),
      L(9, ['  useLoad(() ', p], ['=> {', t]),
      L(10, ['    console.log(', t], ["'Page loaded.'", s], [')', t]),
      L(11, ['  })', t]),
      L(12),
      L(13, ['  ', ''], ['return', k], [' (', t]),
      L(14, ['    ', ''], ['<View', x], [' className=', t], ['"index"', s], ['>', x]),
      L(15, ['      ', ''], ['<NavBar', x], [' title=', t], ['"第五人格"', s], [' />', x]),
      L(16),
      L(17, ['      ', ''], ['<View', x], [' className=', t], ['"hero-section"', s], ['>', x]),
      L(18, ['        ', ''], ['<Image', x], [' src=', t], ['"../../assets/tarot-bg.png"', s], [' />', x]),
      L(19, ['        ', ''], ['<Text', x], [' className=', t], ['"title"', s], ['>', x]),
      L(20, ['          今日塔罗运势指南', t]),
      L(21, ['        ', ''], ['</Text>', x]),
      L(22, ['      ', ''], ['</View>', x]),
      L(23),
      L(24, ['      ', ''], ['<View', x], [' className=', t], ['"card-grid"', s], ['>', x]),
      L(25, ['        {[', t], ["'爱情'", s], [', ', t], ["'缘分'", s], [', ', t], ["'选择'", s], [', ', t], ["'直觉'", s], ['].map(', t], ['label', n], [' =>', p]),
      L(26, ['          ', ''], ['<TarotCard', x], [' key={label} label={label} />', t]),
      L(27, ['        )}', t]),
      L(28, ['      ', ''], ['</View>', x]),
      L(29),
      L(30, ['      ', ''], ['<TabBar', x], [' current=', t], ['{0}', n], [' />', x]),
      L(31, ['    ', ''], ['</View>', x]),
      L(32, ['  )', t]),
      L(33, ['}', t]),
    ]},
    'NavBar.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' { View, Text } ', t], ['from', k], [" '@tarojs/components'", s]),
      L(2),
      L(3, ['interface', k], [' Props { title: ', t], ['string', f], [' }', t]),
      L(4),
      L(5, ['export default', k], [' function', k], [' NavBar', f], ['({ title }: Props) {', t]),
      L(6, ['  ', ''], ['return', k], [' (', t]),
      L(7, ['    ', ''], ['<View', x], [' className=', t], ['"navbar"', s], ['>', x]),
      L(8, ['      ', ''], ['<Text', x], [' className=', t], ['"navbar-title"', s], ['>', x], ['{title}', n], ['</Text>', x]),
      L(9, ['    ', ''], ['</View>', x]),
      L(10, ['  )', t]),
      L(11, ['}', t]),
    ]},
    'api.ts': { lang: 'TypeScript', lines: [
      L(1, ['import', k], [' Taro ', t], ['from', k], [" '@tarojs/taro'", s]),
      L(2, ['import', k], [' { BASE_URL } ', t], ['from', k], [" './request'", s]),
      L(3),
      L(4, ['export const', k], [' fetchTarotResult ', f], ['= ', p], ['async', k], [' (cardName: ', t], ['string', f], [') => {', t]),
      L(5, ['  ', ''], ['const', k], [' res ', t], ['=', p], [' await', k], [' Taro.request({', t]),
      L(6, ['    url: ', t], ['`${BASE_URL}/api/tarot/read`', s], [',', t]),
      L(7, ['    method: ', t], ["'POST'", s], [',', t]),
      L(8, ['    data: { card: cardName },', t]),
      L(9, ['  })', t]),
      L(10, ['  ', ''], ['return', k], [' res.data', t]),
      L(11, ['}', t]),
      L(12),
      L(13, ['export const', k], [' fetchDramas ', f], ['= ', p], ['async', k], [' (mood: ', t], ['string', f], [') => {', t]),
      L(14, ['  ', ''], ['const', k], [' res ', t], ['=', p], [' await', k], [' Taro.request({', t]),
      L(15, ['    url: ', t], ['`${BASE_URL}/api/recommend`', s], [',', t]),
      L(16, ['    method: ', t], ["'POST'", s], [',', t]),
      L(17, ['    data: { mood, limit: ', t], ['5', n], [' },', t]),
      L(18, ['  })', t]),
      L(19, ['  ', ''], ['return', k], [' res.data.dramas', t]),
      L(20, ['}', t]),
    ]},
    'project.config.json': { lang: 'JSON', lines: [
      L(1, ['{', t]),
      L(2, ['  ', ''], ['"appid"', f], [': ', t], ['"wx1234567890abcdef"', s], [',', t]),
      L(3, ['  ', ''], ['"projectname"', f], [': ', t], ['"identity-v-miniapp"', s], [',', t]),
      L(4, ['  ', ''], ['"setting"', f], [': {', t]),
      L(5, ['    ', ''], ['"urlCheck"', f], [': ', t], ['true', n], [',', t]),
      L(6, ['    ', ''], ['"es6"', f], [': ', t], ['true', n], [',', t]),
      L(7, ['    ', ''], ['"enhance"', f], [': ', t], ['true', n], [',', t]),
      L(8, ['    ', ''], ['"compileHotReLoad"', f], [': ', t], ['true', n]),
      L(9, ['  }', t]),
      L(10, ['}', t]),
    ]},
    'app.json': { lang: 'JSON', lines: [
      L(1, ['{', t]),
      L(2, ['  ', ''], ['"pages"', f], [': [', t]),
      L(3, ['    ', ''], ['"pages/index/index"', s], [',', t]),
      L(4, ['    ', ''], ['"pages/chat/index"', s], [',', t]),
      L(5, ['    ', ''], ['"pages/profile/index"', s], [',', t]),
      L(6, ['    ', ''], ['"pages/tarot/index"', s]),
      L(7, ['  ],', t]),
      L(8, ['  ', ''], ['"window"', f], [': {', t]),
      L(9, ['    ', ''], ['"navigationBarTitleText"', f], [': ', t], ['"第五人格"', s], [',', t]),
      L(10, ['    ', ''], ['"navigationBarBackgroundColor"', f], [': ', t], ['"#0a0b0f"', s], [',', t]),
      L(11, ['    ', ''], ['"navigationBarTextStyle"', f], [': ', t], ['"white"', s]),
      L(12, ['  },', t]),
      L(13, ['  ', ''], ['"tabBar"', f], [': {', t]),
      L(14, ['    ', ''], ['"list"', f], [': [', t]),
      L(15, ['      { ', t], ['"pagePath"', f], [': ', t], ['"pages/index/index"', s], [', ', t], ['"text"', f], [': ', t], ['"首页"', s], [' },', t]),
      L(16, ['      { ', t], ['"pagePath"', f], [': ', t], ['"pages/chat/index"', s], [', ', t], ['"text"', f], [': ', t], ['"对话"', s], [' },', t]),
      L(17, ['      { ', t], ['"pagePath"', f], [': ', t], ['"pages/profile/index"', s], [', ', t], ['"text"', f], [': ', t], ['"我的"', s], [' }', t]),
      L(18, ['    ]', t]),
      L(19, ['  }', t]),
      L(20, ['}', t]),
    ]},
    'app.less': { lang: 'Less', lines: [
      L(1, ['// 全局样式', c]),
      L(2, ['@primary', f], [': ', t], ['#0a0b0f', s], [';', t]),
      L(3, ['@accent', f], [': ', t], ['#e8c97a', s], [';', t]),
      L(4),
      L(5, ['page', f], [' {', t]),
      L(6, ['  background', k], [': @primary;', t]),
      L(7, ['  color', k], [': ', t], ['#f0f0f0', s], [';', t]),
      L(8, ['  font-family', k], [': ', t], ['"PingFang SC"', s], [', sans-serif;', t]),
      L(9, ['}', t]),
    ]},
    'index.config.ts': { lang: 'TypeScript', lines: [
      L(1, ['export default', k], [' definePageConfig({', t]),
      L(2, ['  navigationBarTitleText: ', t], ["'第五人格 · 今日运势'", s], [',', t]),
      L(3, ['  enableShareAppMessage: ', t], ['true', n], [',', t]),
      L(4, ['  enableShareTimeline: ', t], ['true', n]),
      L(5, ['})', t]),
    ]},
    'index.less': { lang: 'Less', lines: [
      L(1, ['.index', f], [' {', t]),
      L(2, ['  min-height', k], [': ', t], ['100vh', n], [';', t]),
      L(3, ['  padding', k], [': ', t], ['0 24rpx', n], [';', t]),
      L(4, ['}', t]),
      L(5),
      L(6, ['.hero-section', f], [' {', t]),
      L(7, ['  position', k], [': relative;', t]),
      L(8, ['  height', k], [': ', t], ['400rpx', n], [';', t]),
      L(9, ['  overflow', k], [': hidden;', t]),
      L(10, ['  border-radius', k], [': ', t], ['24rpx', n], [';', t]),
      L(11, ['}', t]),
      L(12),
      L(13, ['.card-grid', f], [' {', t]),
      L(14, ['  display', k], [': grid;', t]),
      L(15, ['  grid-template-columns', k], [': repeat(2, 1fr);', t]),
      L(16, ['  gap', k], [': ', t], ['16rpx', n], [';', t]),
      L(17, ['  margin-top', k], [': ', t], ['32rpx', n], [';', t]),
      L(18, ['}', t]),
    ]},
    'TabBar.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' { View, Text } ', t], ['from', k], [" '@tarojs/components'", s]),
      L(2),
      L(3, ['const', k], [' TABS ', t], ['=', p], [" ['首页', '对话', '消息', '我']", t]),
      L(4),
      L(5, ['export default', k], [' function', k], [' TabBar', f], ['({ current }: { current: number }) {', t]),
      L(6, ['  ', ''], ['return', k], [' (', t]),
      L(7, ['    ', ''], ['<View', x], [' className=', t], ['"tabbar"', s], ['>', x]),
      L(8, ['      {TABS.map((label, i) ', p], ['=> (', t]),
      L(9, ['        ', ''], ['<View', x], [' key={label} className={i === current ? ', t], ['"active"', s], [' : ', t], ['"tab"', s], ['}>', x]),
      L(10, ['          ', ''], ['<Text>', x], ['{label}', n], ['</Text>', x]),
      L(11, ['        ', ''], ['</View>', x]),
      L(12, ['      ))}', t]),
      L(13, ['    ', ''], ['</View>', x]),
      L(14, ['  )', t]),
      L(15, ['}', t]),
    ]},
    'ChatBubble.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' { View, Text, Image } ', t], ['from', k], [" '@tarojs/components'", s]),
      L(2),
      L(3, ['interface', k], [' Props {', t]),
      L(4, ['  avatar: ', t], ['string', f], [';', t]),
      L(5, ['  content: ', t], ['string', f], [';', t]),
      L(6, ['  isMe?: ', t], ['boolean', f]),
      L(7, ['}', t]),
      L(8),
      L(9, ['export default', k], [' function', k], [' ChatBubble', f], ['({ avatar, content, isMe }: Props) {', t]),
      L(10, ['  ', ''], ['return', k], [' (', t]),
      L(11, ['    ', ''], ['<View', x], [' className={isMe ? ', t], ['"bubble-me"', s], [' : ', t], ['"bubble-ai"', s], ['}>', x]),
      L(12, ['      ', ''], ['<Image', x], [' src={avatar} className=', t], ['"avatar"', s], [' />', x]),
      L(13, ['      ', ''], ['<Text', x], [' className=', t], ['"content"', s], ['>', x], ['{content}', n], ['</Text>', x]),
      L(14, ['    ', ''], ['</View>', x]),
      L(15, ['  )', t]),
      L(16, ['}', t]),
    ]},
    'TarotCard.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' { View, Text } ', t], ['from', k], [" '@tarojs/components'", s]),
      L(2, ['import', k], [' { useState } ', t], ['from', k], [" 'react'", s]),
      L(3),
      L(4, ['export default', k], [' function', k], [' TarotCard', f], ['({ label }: { label: string }) {', t]),
      L(5, ['  ', ''], ['const', k], [' [flipped, setFlipped] ', t], ['=', p], [' useState(', f], ['false', n], [')', t]),
      L(6),
      L(7, ['  ', ''], ['return', k], [' (', t]),
      L(8, ['    ', ''], ['<View', x], [' className={flipped ? ', t], ['"card flipped"', s], [' : ', t], ['"card"', s], ['}', x]),
      L(9, ['      onClick={() ', p], ['=> setFlipped(', f], ['true', n], [')}>', x]),
      L(10, ['      ', ''], ['<Text', x], [' className=', t], ['"label"', s], ['>', x], ['{label}', n], ['</Text>', x]),
      L(11, ['    ', ''], ['</View>', x]),
      L(12, ['  )', t]),
      L(13, ['}', t]),
    ]},
    'DramaCard.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' { View, Text, Image } ', t], ['from', k], [" '@tarojs/components'", s]),
      L(2),
      L(3, ['interface', k], [' Props {', t]),
      L(4, ['  title: ', t], ['string', f], [';', t]),
      L(5, ['  cover: ', t], ['string', f], [';', t]),
      L(6, ['  rating: ', t], ['number', f]),
      L(7, ['}', t]),
      L(8),
      L(9, ['export default', k], [' function', k], [' DramaCard', f], ['({ title, cover, rating }: Props) {', t]),
      L(10, ['  ', ''], ['return', k], [' (', t]),
      L(11, ['    ', ''], ['<View', x], [' className=', t], ['"drama-card"', s], ['>', x]),
      L(12, ['      ', ''], ['<Image', x], [' src={cover} mode=', t], ['"aspectFill"', s], [' />', x]),
      L(13, ['      ', ''], ['<Text', x], [' className=', t], ['"title"', s], ['>', x], ['{title}', n], ['</Text>', x]),
      L(14, ['      ', ''], ['<Text', x], [' className=', t], ['"rating"', s], ['>', x], ['{rating}分', n], ['</Text>', x]),
      L(15, ['    ', ''], ['</View>', x]),
      L(16, ['  )', t]),
      L(17, ['}', t]),
    ]},
    'request.ts': { lang: 'TypeScript', lines: [
      L(1, ['export const', k], [' BASE_URL ', t], ['=', p], [" 'https://api.identity-v.example.com'", s]),
      L(2),
      L(3, ['export function', k], [' getToken', f], ['(): ', t], ['string', f], [' | ', t], ['null', n], [' {', t]),
      L(4, ['  ', ''], ['return', k], [' Taro.getStorageSync(', t], ["'token'", s], [')', t]),
      L(5, ['}', t]),
    ]},
    'chat.ts': { lang: 'TypeScript', lines: [
      L(1, ['import', k], [' Taro ', t], ['from', k], [" '@tarojs/taro'", s]),
      L(2, ['import', k], [' { BASE_URL } ', t], ['from', k], [" './request'", s]),
      L(3),
      L(4, ['export const', k], [' sendMessage ', f], ['= ', p], ['async', k], [' (msg: ', t], ['string', f], [', sessionId: ', t], ['string', f], [') => {', t]),
      L(5, ['  ', ''], ['const', k], [' res ', t], ['=', p], [' await', k], [' Taro.request({', t]),
      L(6, ['    url: ', t], ['`${BASE_URL}/api/chat`', s], [',', t]),
      L(7, ['    method: ', t], ["'POST'", s], [',', t]),
      L(8, ['    data: { message: msg, session_id: sessionId },', t]),
      L(9, ['  })', t]),
      L(10, ['  ', ''], ['return', k], [' res.data', t]),
      L(11, ['}', t]),
    ]},
    'index.ts': { lang: 'TypeScript', lines: [
      L(1, ['// Store 入口', c]),
      L(2, ['export', k], [' { ', t], ['default', k], [' as useUserStore }', t], [' from', k], [" './user'", s]),
      L(3, ['export', k], [' { ', t], ['default', k], [' as useChatStore }', t], [' from', k], [" './chat'", s]),
    ]},
    'user.ts': { lang: 'TypeScript', lines: [
      L(1, ['import', k], [' { create } ', t], ['from', k], [" 'zustand'", s]),
      L(2),
      L(3, ['interface', k], [' UserState {', t]),
      L(4, ['  nickname: ', t], ['string', f]),
      L(5, ['  avatar: ', t], ['string', f]),
      L(6, ['  setUser: (n: ', t], ['string', f], [', a: ', t], ['string', f], [') => ', t], ['void', f]),
      L(7, ['}', t]),
      L(8),
      L(9, ['export default', k], [' create<UserState>((set) ', p], ['=> ({', t]),
      L(10, ['  nickname: ', t], ["'求生者'", s], [',', t]),
      L(11, ['  avatar: ', t], ["''", s], [',', t]),
      L(12, ['  setUser: (n, a) ', p], ['=> set({ nickname: n, avatar: a }),', t]),
      L(13, ['}))', t]),
    ]},
    'format.ts': { lang: 'TypeScript', lines: [
      L(1, ['export function', k], [' formatTime', f], ['(date: ', t], ['Date', f], ['): ', t], ['string', f], [' {', t]),
      L(2, ['  ', ''], ['const', k], [' h ', t], ['=', p], [' date.getHours().toString().padStart(', t], ['2', n], [", '0')", t]),
      L(3, ['  ', ''], ['const', k], [' m ', t], ['=', p], [' date.getMinutes().toString().padStart(', t], ['2', n], [", '0')", t]),
      L(4, ['  ', ''], ['return', k], [' `${h}:${m}`', s]),
      L(5, ['}', t]),
    ]},
    'auth.ts': { lang: 'TypeScript', lines: [
      L(1, ['import', k], [' Taro ', t], ['from', k], [" '@tarojs/taro'", s]),
      L(2),
      L(3, ['export function', k], [' isLoggedIn', f], ['(): ', t], ['boolean', f], [' {', t]),
      L(4, ['  ', ''], ['return', k], [' !!Taro.getStorageSync(', t], ["'token'", s], [')', t]),
      L(5, ['}', t]),
      L(6),
      L(7, ['export function', k], [' login', f], ['(code: ', t], ['string', f], [') {', t]),
      L(8, ['  ', ''], ['return', k], [' Taro.request({', t]),
      L(9, ['    url: ', t], ["'https://api.identity-v.example.com/auth/login'", s], [',', t]),
      L(10, ['    method: ', t], ["'POST'", s], [',', t]),
      L(11, ['    data: { code },', t]),
      L(12, ['  })', t]),
      L(13, ['}', t]),
    ]},
    'result.tsx': { lang: 'TypeScript JSX', lines: [
      L(1, ['import', k], [' { View, Text } ', t], ['from', k], [" '@tarojs/components'", s]),
      L(2, ['import', k], [' DramaCard ', t], ['from', k], [" '../../components/DramaCard'", s]),
      L(3),
      L(4, ['export default', k], [' function', k], [' TarotResult', f], ['() {', t]),
      L(5, ['  ', ''], ['const', k], [' dramas ', t], ['=', p], [' [', t]),
      L(6, ['    { title: ', t], ["'倾心之恋'", s], [', cover: ', t], ["'/img/d1.jpg'", s], [', rating: ', t], ['9.2', n], [' },', t]),
      L(7, ['    { title: ', t], ["'月下追逐'", s], [', cover: ', t], ["'/img/d2.jpg'", s], [', rating: ', t], ['8.8', n], [' },', t]),
      L(8, ['  ]', t]),
      L(9),
      L(10, ['  ', ''], ['return', k], [' (', t]),
      L(11, ['    ', ''], ['<View', x], ['>', x]),
      L(12, ['      ', ''], ['<Text', x], [' className=', t], ['"heading"', s], ['>', x], ['为你推荐', t], ['</Text>', x]),
      L(13, ['      {dramas.map(d ', p], ['=> ', t], ['<DramaCard', x], [' key={d.title} {...d} />', t], [')}', t]),
      L(14, ['    ', ''], ['</View>', x]),
      L(15, ['  )', t]),
      L(16, ['}', t]),
    ]},
    'style.css': { lang: 'CSS', lines: [
      L(1, ['/* 全局样式覆盖 */', c]),
      L(2, [':root', f], [' {', t]),
      L(3, ['  ', ''], ['--bg', k], [': ', t], ['#0a0b0f', s], [';', t]),
      L(4, ['  ', ''], ['--accent', k], [': ', t], ['#e8c97a', s], [';', t]),
      L(5, ['  ', ''], ['--text', k], [': ', t], ['#f0f0f0', s], [';', t]),
      L(6, ['}', t]),
    ]},
    'main.js': { lang: 'JavaScript', lines: [
      L(1, ['// 小程序 webview 桥接', c]),
      L(2, ['document', t], ['.addEventListener(', f], ["'DOMContentLoaded'", s], [', () ', p], ['=> {', t]),
      L(3, ['  console.log(', t], ["'WebView bridge ready'", s], [')', t]),
      L(4, ['})', t]),
    ]},
    'index.html': { lang: 'HTML', lines: [
      L(1, ['<!DOCTYPE html>', k]),
      L(2, ['<html', x], [' lang=', t], ['"zh-CN"', s], ['>', x]),
      L(3, ['<head>', x]),
      L(4, ['  ', ''], ['<meta', x], [' charset=', t], ['"UTF-8"', s], [' />', x]),
      L(5, ['  ', ''], ['<title>', x], ['第五人格小程序', t], ['</title>', x]),
      L(6, ['  ', ''], ['<link', x], [' rel=', t], ['"stylesheet"', s], [' href=', t], ['"./style.css"', s], [' />', x]),
      L(7, ['</head>', x]),
      L(8, ['<body>', x]),
      L(9, ['  ', ''], ['<div', x], [' id=', t], ['"app"', s], ['>', x], ['</div>', x]),
      L(10, ['  ', ''], ['<script', x], [' src=', t], ['"./main.js"', s], ['>', x], ['</script>', x]),
      L(11, ['</body>', x]),
      L(12, ['</html>', x]),
    ]},
    'chat.html': { lang: 'HTML', lines: [
      L(1, ['<!DOCTYPE html>', k]),
      L(2, ['<html', x], [' lang=', t], ['"zh-CN"', s], ['>', x]),
      L(3, ['<head>', x]),
      L(4, ['  ', ''], ['<meta', x], [' charset=', t], ['"UTF-8"', s], [' />', x]),
      L(5, ['  ', ''], ['<title>', x], ['对话', t], ['</title>', x]),
      L(6, ['</head>', x]),
      L(7, ['<body>', x]),
      L(8, ['  ', ''], ['<div', x], [' id=', t], ['"chat-root"', s], ['>', x], ['</div>', x]),
      L(9, ['</body>', x]),
      L(10, ['</html>', x]),
    ]},
    'logo.png': { lang: 'Image', lines: [
      L(1, ['// [二进制图片文件 — 128×128 PNG]', c]),
    ]},
    'tarot-bg.png': { lang: 'Image', lines: [
      L(1, ['// [二进制图片文件 — 750×400 背景图]', c]),
    ]},
    '.env': { lang: 'Environment', lines: [
      L(1, ['SECRET_KEY', f], ['=', p], ['my-super-secret-key-2024', t]),
      L(2, ['API_BASE_URL', f], ['=', p], ['https://api.identity-v.example.com', t]),
      L(3, ['MONGO_URI', f], ['=', p], ['mongodb+srv://admin:****@cluster0.mongodb.net/identity-v', t]),
    ]},
    'requirements.txt': { lang: 'Text', lines: [
      L(1, ['@tarojs/cli@4.0.0', t]),
      L(2, ['@tarojs/components@4.0.0', t]),
      L(3, ['@tarojs/taro@4.0.0', t]),
      L(4, ['react@18.3.1', t]),
      L(5, ['zustand@5.0.0', t]),
    ]},
    'soul.md': { lang: 'Markdown', lines: [
      L(1, ['# soul.md', f]),
      L(2),
      L(3, ['## AI 分身 · 约瑟夫', f]),
      L(4),
      L(5, ['- ', p], ['world_id: ', t], ['identity-v', s]),
      L(6, ['- ', p], ['role: ', t], ['庄园宫廷摄影师', s]),
      L(7, ['- ', p], ['tone: ', t], ['慢 · 稳 · 旧时代礼节', s]),
      L(8),
      L(9, ['他习惯先把人与事放进取景框里端详，再开口。', t]),
      L(10, ['相信"快门按下的那一瞬间，一个人就被定住了"。', t]),
      L(11, ['对同伴保持彬彬有礼的距离，对庄园怀有艺术家式的执拗。', t]),
      L(12),
      L(13, ['## 主玩法 · 今日塔罗', f]),
      L(14),
      L(15, ['塔罗以照片作牌面，围绕 ', t], ['Past / Now / Next', k], [' 三张显影：', t]),
      L(16),
      L(17, ['- ', p], ['Past ', k], ['— 被雾气封存的过往', t]),
      L(18, ['- ', p], ['Now ', k], ['— 当下你站着的那格光圈', t]),
      L(19, ['- ', p], ['Next ', k], ['— 下一帧里等你按下快门的人', t]),
      L(20),
      L(21, ['### 抽卡流程', f]),
      L(22),
      L(23, ['1. ', p], ['进入主页 → 三张牌背朝上叠在一起', t]),
      L(24, ['2. ', p], ['点击任一张 → 三张散开，被点中那张翻面', t]),
      L(25, ['3. ', p], ['继续点未翻开的 → 全部显影后解锁运势详解', t]),
      L(26, ['4. ', p], ['重新抽卡 → 牌序打乱，回到背面堆叠态', t]),
      L(27),
      L(28, ['## 资产绑定', f]),
      L(29),
      L(30, ['- ', p], ['牌面 ← ', t], ['AI 分身 gallery（设定集）', s]),
      L(31, ['- ', p], ['场景 ← ', t], ['/场景/约瑟夫暗房.png', s]),
      L(32, ['- ', p], ['重置动效 ← ', t], ['手机左上"重新加载"按钮', s]),
    ]},
  }

  /* preview filter */
  const [activeFilter, setActiveFilter] = useState('mini-program')
  /* Project/session rename — pencil icons flip these flags, the paired
   * span is replaced with an input, save on Enter/blur. */
  // Deep-link: `?project=proposal` opens the 沪上火锅 proposal flow
  // pre-seeded so the demo lands on the goal-collection form. Default
  // remains the 第五人格 mini-program when no project param is set.
  const wantsProposalProject =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('project') === 'proposal'
  const [projectTitle, setProjectTitle] = useState(
    wantsProposalProject ? '沪上火锅·五一种草提案' : '第五人格塔罗小程序',
  )
  /* Derive the active project's "kind" from its title — controls which
   * preview renders on the right and what label the product tab shows.
   * Unknown project names default to mini-program so arbitrary renames
   * don't accidentally flip the preview. */
  const activeProjectKind: ProjectKind =
    PROJECT_KINDS[projectTitle] ?? 'mini-program'
  /** Drives the right-side preview container choice. Detailed kind still
   *  picks variants inside each shape (e.g. ai-avatar vs mini-program
   *  both live under 'app'). */
  const activeOutputShape: OutputShape = SHAPE_BY_KIND[activeProjectKind]
  // productTabLabel was used by the (removed) X-column tab header. Kept
  // here as the canonical label for the synthetic "产物预览" / "产物总览"
  // tab so any future re-introduction of the tab strip can read it.
  const _productTabLabel =
    activeOutputShape === 'artifact' ? '产物总览' : '产物预览'
  void _productTabLabel
  /* True when the active project has actual scaffolded content — drives
   * whether the right-side preview renders the phone mock or an empty
   * state. Stub projects (no entry in `projectTrees`) get the empty
   * state since there's nothing meaningful to preview yet. */
  const activeProjectHasTree = !!projectTrees[projectTitle]
  const emptyProjectPreview = (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fill-subtle)] text-[var(--color-ink)]/35">
        <FolderClosed size={22} strokeWidth={1.6} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-medium text-[var(--color-ink)]/70">
          此项目暂无内容
        </p>
        <p className="text-[12px] leading-[1.6] text-[var(--color-ink)]/45">
          在左侧对话中描述你的需求，AI 会帮你搭建项目结构
        </p>
      </div>
    </div>
  )
  /** Single "触发器测试" button rendered alongside the other preview
   *  controls (重新加载 / 真机预览 / …). Hovering it pops a dropdown
   *  listing every configured trigger; clicking an item fires the
   *  simulation inside the phone. Kept outside the phone frame so the
   *  preview stays visually authentic. */
  const triggerSimBar =
    activeProjectKind === 'ai-avatar' && triggers.length > 0 ? (
      <div className="group relative inline-flex">
        <button
          type="button"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]/85 group-hover:bg-[var(--fill-soft)] group-hover:text-[var(--color-ink)]/85"
        >
          <Zap size={11} strokeWidth={1.8} className="text-amber-500" />
          <span>触发器测试</span>
          <ChevronUp size={10} strokeWidth={1.8} className="text-[var(--color-ink)]/40" />
        </button>
        <div
          className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-1.5 w-[220px] -translate-x-1/2 translate-y-1 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] py-1 opacity-0 shadow-[0_10px_24px_-10px_rgba(16,18,24,0.25)] transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
        >
          <div className="px-3 py-1 text-[10px] text-[var(--color-ink)]/45">
            点击模拟触发
          </div>
          {triggers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => simulateTrigger(t)}
              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[12px] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <Zap size={10} strokeWidth={1.8} className="shrink-0 text-amber-500" />
              <span className="truncate">模拟 {t.event.label}</span>
            </button>
          ))}
        </div>
      </div>
    ) : null

  /* Browser-style address bar shown in the preview's top strip for
   * web-app projects — it replaces the 小程序/AI分身/小花技能 mode tabs,
   * which don't apply to a website. Keeps the web preview unified with
   * the existing preview chrome instead of a bolted-on browser window. */
  const addressBarPath =
    WEB_PAGES.find((p) => p.label === (previewRoute ?? '首页'))?.path ?? ''
  const addressBar = (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="flex h-7 min-w-0 max-w-[460px] flex-1 items-center rounded-lg bg-[var(--fill-subtle)] px-3 text-[12px] text-[var(--color-ink)]/50">
        <span className="truncate">localhost:5173{addressBarPath}</span>
      </div>
    </div>
  )

  /* Right-side preview surface — picks the inner preview for the active
   * project. web-app renders the site full-bleed (its address bar lives
   * in the top strip); everything else keeps the phone frame. Stub
   * projects (no tree) show the empty state. Shared by all three layout
   * variants below. */
  const previewSurface = !activeProjectHasTree ? (
    emptyProjectPreview
  ) : activeProjectKind === 'web-game' ? (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-black">
      {gameStep === 'idle' || gameStep === 'done' ? (
        <GarudaGamePreview key={miniAppKey} />
      ) : (
        <GameBuildProgress step={gameStep} />
      )}
    </div>
  ) : activeProjectKind === 'web-app' ? (
    <div className="thin-scroll min-h-0 w-full flex-1 overflow-y-auto bg-white">
      <WebAppPreview
        key={miniAppKey}
        route={previewRoute}
        onNavigate={setPreviewRoute}
      />
    </div>
  ) : activeFilter === 'ai-avatar' ? (
    <PhoneMockup>
      <ChatPreview worldOverride="identity-v" />
    </PhoneMockup>
  ) : activeProjectKind === 'ai-avatar' ? (
    <PhoneMockup>
      <AiPersonaChatPreview simulations={triggerSimulations} />
    </PhoneMockup>
  ) : (
    <PhoneMockup>
      <MiniAppPreview
        key={miniAppKey}
        route={previewRoute}
        onNavigate={setPreviewRoute}
      />
    </PhoneMockup>
  )

  /* Mention-picker data — derived every render so it stays in sync with
   * the active project's file tree + triggers. Skills stay static since
   * they come from the platform catalog, not per-project state. */
  const activeFileTree =
    projectTrees[projectTitle] ?? (activeProjectKind === 'ai-avatar' ? aiPersonaFileTree : fileTree)
  const mentionSkills: MentionItem[] = CAPABILITY_OPTIONS.map((c) => ({
    id: c.id,
    name: c.title,
    tag: c.kind === 'skill' ? 'Skill' : 'Knowledge',
  }))
  const mentionTools: MentionItem[] = [
    { id: 'tool-search', name: '抖音搜索' },
    { id: 'tool-image', name: '图片生成' },
    { id: 'tool-publish', name: '发布助手' },
    { id: 'tool-rag', name: 'RAG 检索' },
  ]
  const mentionFiles: MentionItem[] = flattenFileTreeForMention(activeFileTree)
  /* Triggers tab lists preset CONDITIONS (the events the platform can
   * hook on), not user-configured trigger instances. Picking one here
   * is how the user scaffolds a new trigger via @ reference. */
  const mentionTriggers: MentionItem[] = Object.values(TRIGGER_PRESETS).map((p) => ({
    id: p.event.id,
    name: p.event.label,
    tag: p.event.scene,
  }))
  const mentionResources: MentionItem[] = RESOURCES.map((r) => ({
    id: r.id,
    name: r.name,
    tag: r.secondaryCategory,
  }))

  /** Replace the most recent `@…` token at the caret with a non-editable
   *  pill node, then place the caret after an inserted trailing space.
   *  Uses the DOM Selection API directly because the composer is a
   *  contentEditable div, not an <input>. */
  const insertMention = (item: MentionItem, kind: MentionKind) => {
    const editor = chatInputRef.current
    if (!editor) return
    editor.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) {
      // Fallback: append at end if no active selection.
      const pill = buildMentionPill(item, kind)
      editor.append(pill, document.createTextNode(' '))
      setChatDraft(editor.innerText)
      setMentionAnchor(null)
      return
    }
    const range = sel.getRangeAt(0)
    // Walk backwards from the caret through text nodes to find the most
    // recent '@' within the same container. Covers the common case where
    // the user just typed '@' (caret is inside a text node after '@').
    const node = range.endContainer
    const offset = range.endOffset
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      const atIdx = text.lastIndexOf('@', offset - 1)
      if (atIdx >= 0) {
        const deleteRange = document.createRange()
        deleteRange.setStart(node, atIdx)
        deleteRange.setEnd(node, offset)
        deleteRange.deleteContents()
        // deleteContents leaves the caret at the deletion point.
      }
    }
    const pill = buildMentionPill(item, kind)
    const space = document.createTextNode(' ')
    range.insertNode(space)
    range.insertNode(pill)
    // Move caret after the space.
    range.setStartAfter(space)
    range.setEndAfter(space)
    sel.removeAllRanges()
    sel.addRange(range)
    setChatDraft(editor.innerText)
    setMentionAnchor(null)
  }

  /** Append an @-mention to the composer and bring the chat to the
   *  foreground. The composer DOM is unmounted while the resource library
   *  page is showing, so we stash the target in `pendingMention` and let
   *  an effect run the insert once the workspace remounts. */
  const useCapabilityInChat = (platform: Resource, capability: Capability) => {
    setActivePreviewTab(0)
    setResourceLibraryCapability(null)
    setPlatformResourceLibraryOpen(false)
    setPendingMention({
      id: `${platform.id}#${capability.name}#${capability.category ?? ''}`,
      name: capability.name,
    })
  }

  /** Auto-scroll the chat so the latest AI bubble lands at the top of
   *  the viewport every time the proposal flow advances. Long replies +
   *  inline cards otherwise force the user to scroll up to read from the
   *  start. The anchor sentinel for each stage is rendered with
   *  `data-proposal-anchor="{stage}"` so we don't depend on element
   *  position counting. */
  useEffect(() => {
    if (proposalStep === 'idle' || proposalStep === 'collecting') return
    // Defer one frame so the new bubble is mounted before we scroll.
    const tid = setTimeout(() => {
      const scroller = chatScrollRef.current
      if (!scroller) return
      const anchor = scroller.querySelector(
        `[data-proposal-anchor="${proposalStep}"]`,
      ) as HTMLElement | null
      if (!anchor) return
      const scrollerRect = scroller.getBoundingClientRect()
      const anchorRect = anchor.getBoundingClientRect()
      const delta = anchorRect.top - scrollerRect.top - 12 // 12px breathing room
      scroller.scrollBy({ top: delta, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(tid)
  }, [proposalStep])

  /** Drain any pending @-mention into the chat composer once the
   *  workspace (and chatInputRef) has remounted. */
  useEffect(() => {
    if (!pendingMention) return
    if (platformSecondaryPageOpen || platformHomeOpen) return
    const editor = chatInputRef.current
    if (!editor) return
    editor.focus()
    const last = editor.lastChild
    const tail = last?.textContent ?? ''
    if (last && !/\s$/.test(tail)) {
      editor.append(document.createTextNode(' '))
    }
    const pill = buildMentionPill(
      { id: pendingMention.id, name: pendingMention.name },
      'resources',
    )
    editor.append(pill, document.createTextNode(' '))
    const sel = window.getSelection()
    if (sel) {
      const range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    setChatDraft(editor.innerText)
    setPendingMention(null)
  }, [pendingMention, platformSecondaryPageOpen, platformHomeOpen])

  const [editingProjectTitle, setEditingProjectTitle] = useState(false)
  /* Which session row (if any) is in inline-edit mode inside the dropdown. */
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const renameSession = (id: string, name: string) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
  // Preview-strip tabs. AI 分身 projects collapse to a single「AI分身」
  // tab (value stays 'mini-program' so previewSurface keeps dispatching
  // by activeProjectKind); other kinds keep the original three.
  const filters =
    activeProjectKind === 'ai-avatar'
      ? [{ label: 'AI分身', value: 'mini-program' }]
      : [
          { label: '小程序', value: 'mini-program' },
          { label: 'AI分身', value: 'ai-avatar' },
          { label: '小花技能', value: 'xiaohua' },
        ]

  /* console */
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [consoleHeight, setConsoleHeight] = useState(220)
  const consoleDragRef = useRef<{ startY: number; startHeight: number } | null>(null)

  const onConsoleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    consoleDragRef.current = { startY: e.clientY, startHeight: consoleHeight }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onConsoleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = consoleDragRef.current
    if (!s) return
    const next = Math.min(
      Math.max(80, s.startHeight - (e.clientY - s.startY)),
      600
    )
    setConsoleHeight(next)
  }
  const onConsoleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    consoleDragRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const consoleLines = [
    { kind: 'cmd', text: '$ npm run dev' },
    { kind: 'log', text: '' },
    { kind: 'info', text: '> identity-v-miniapp@1.0.0 dev' },
    { kind: 'info', text: '> taro build --type weapp --watch' },
    { kind: 'log', text: '' },
    { kind: 'log', text: '👽 Taro v4.0.0' },
    { kind: 'log', text: '' },
    { kind: 'info', text: 'ℹ Compiling for platform weapp...' },
    { kind: 'log', text: 'Compiled successfully in 2847ms' },
    { kind: 'log', text: '' },
    { kind: 'success', text: '✔ Built pages/index/index' },
    { kind: 'success', text: '✔ Built pages/chat/index' },
    { kind: 'success', text: '✔ Built pages/profile/index' },
    { kind: 'success', text: '✔ Built pages/tarot/index' },
    { kind: 'success', text: '✔ Built pages/tarot/result' },
    { kind: 'log', text: '' },
    { kind: 'info', text: 'ℹ Watching for file changes...' },
    { kind: 'log', text: '' },
    { kind: 'warn', text: '⚠ [WARN] pages/index/index.tsx: Image component missing alt prop (line 18)' },
    { kind: 'log', text: '' },
    { kind: 'info', text: '[HMR] src/pages/index/index.tsx changed, rebuilding...' },
    { kind: 'success', text: '✔ Rebuild completed in 340ms' },
    { kind: 'log', text: '' },
    { kind: 'cmd', text: '  Local:   http://localhost:10086/' },
    { kind: 'info', text: '  Network: http://192.168.1.42:10086/' },
  ]

  /* ─── Render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 flex min-h-0 flex-col overflow-hidden bg-[var(--color-surface-1)] font-[var(--font-sans)] text-[var(--color-ink)]"
    >
      {/* ── Platform layout: project sidebar on the far left. Width is
           user-draggable via the right-edge handle; collapse is toggled
           via the PanelLeft button. Stays mounted while collapsed and
           animates its width to 0 so the transition feels continuous —
           the card frame's `left` and the body's `marginLeft` ride the
           same eased width change. The inner column stays at its natural
           width so its contents don't reflow mid-animation; the outer
           clip hides them as the width closes. ── */}
      {isPlatform && (
        <div
          className="fixed inset-y-0 left-0 z-40 overflow-hidden transition-[width] duration-300 ease-out"
          style={{ width: sidebarCollapsed ? 0 : platformSidebarWidth }}
          aria-hidden={sidebarCollapsed}
        >
          {/* Inner column locked at the full sidebar width — clipping
              comes from the outer overflow-hidden, so contents stay
              still while the wrapper width animates. */}
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: platformSidebarWidth }}
          >
          <PlatformSidebar
            projectTrees={
              // While the Garuda 0→1 generation flow is still mid-run,
              // suppress its pre-baked tree so the sidebar shows the
              // project row with a "暂无文件" stub instead of dumping the
              // finished file list before the build animation completes.
              gameStep !== 'idle' && gameStep !== 'done'
                ? (() => {
                    const { 'Garuda · 神明黄昏': _omit, ...rest } = projectTrees
                    void _omit
                    return rest
                  })()
                : projectTrees
            }
            expandedDirs={expandedDirs}
            toggleDir={toggleDir}
            openFileInTab={openFileInTab}
            onCollapse={() => setSidebarCollapsed(true)}
            onNewProject={handleNewProject}
            openProjects={platformOpenProjects}
            setOpenProjects={setPlatformOpenProjects}
            onSwitchProject={openProject}
            onCollapseAll={() => {
              // Fold every open folder + project down to the root level.
              setExpandedDirs(new Set())
              setPlatformOpenProjects(new Set())
            }}
            onOpenResourceLibrary={openResourceLibraryPage}
            onOpenSkills={openPlatformSkillsPage}
            onOpenCreativeSquare={openPlatformCreativeSquarePage}
            onOpenDataOps={openPlatformDataOpsPage}
            activeNav={
              platformResourceLibraryOpen
                ? '资源库'
                : platformSkillsOpen
                  ? 'Skills'
                  : platformCreativeSquareOpen
                    ? '创意广场'
                    : platformDataOpsOpen
                      ? '数据运营'
                      : null
            }
            activeRoute={previewRoute}
            activeProjectName={platformHomeOpen ? '' : projectTitle}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSwitchSession={(id) => {
              if (id !== activeSessionId) {
                setActiveSessionId(id)
                resetChatState()
              }
            }}
            onNewSession={handleNewSession}
            layout={layout}
            onChangeLayout={setLayout}
            themeMode={themeMode}
            onChangeThemeMode={setThemeMode}
            createdProjects={createdProjects}
          />
          {/* Right-edge drag handle — only active when sidebar is expanded
              (no point dragging a zero-width strip). */}
          {!sidebarCollapsed && (
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={onSidebarDragStart}
              onPointerMove={onSidebarDragMove}
              onPointerUp={onSidebarDragEnd}
              onPointerCancel={onSidebarDragEnd}
              className="group absolute right-0 top-0 bottom-0 z-10 w-1 translate-x-1/2 cursor-col-resize touch-none select-none"
            >
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
            </div>
          )}
          </div>
        </div>
      )}

      {/* ── Platform layout: shared white card frame behind chat + preview.
           Lives below body content (z) so chat aside (z-30) and preview
           (inside body z-10) paint on top. Provides rounded/ring/bg so the
           two columns read as a single card split by chat's border-r.
           `left` animates with the sidebar width for a smooth grow/shrink. */}
      {isPlatform && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[5] top-3 bottom-3 right-3 rounded-[16px] bg-[var(--color-surface-0)] transition-[left] duration-300 ease-out"
          style={{ left: effectiveSidebarWidth }}
        />
      )}

      {/* ── Ambient glow derived from the preview product (persona portrait) —
           hidden in code/platform layouts so the page reads flat. ── */}
      {layout !== 'code' && !isPlatform && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[55%]"
            style={{
              background: `
                radial-gradient(120% 90% at 20% 0%, ${rgbString(c1, 0.28)} 0%, ${rgbString(c1, 0)} 65%),
                radial-gradient(95% 85% at 85% 0%, ${rgbString(c2, 0.3)} 0%, ${rgbString(c2, 0)} 60%),
                radial-gradient(60% 60% at 55% 0%, ${rgbString(c1, 0.16)} 0%, ${rgbString(c1, 0)} 70%)
              `,
              filter: 'blur(32px)',
              opacity: 0.75,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[30%] z-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(20,21,23,0) 0%, rgba(20,21,23,0.85) 45%, rgba(20,21,23,1) 100%)',
            }}
          />
        </>
      )}

      {/* The previous floating "expand preview" button was removed — the
           same toggle now lives in the chat header (PanelRightOpen icon)
           and works both directions. */}

      {/* ══════ Header ══════ Non-platform layouts only: normal in-flow top
          bar. Platform layout no longer shows a top header — its utilities
          (layout/theme switch, project title) have been relocated to the
          sidebar and the chat header. */}
      {!isPlatform && (
      <header
        className={`z-20 flex items-center justify-between px-4 transition-[margin] duration-300 ${
          isPlatform
            ? 'fixed top-3 right-3 h-[44px] rounded-t-[16px] border-b border-[var(--divider-soft)]'
            : `relative h-14 shrink-0 ${
                chatOnLeft ? '' : 'border-b border-[var(--divider-soft)]'
              } ${chatCollapsed ? '' : headerMarginClass}`
        }`}
        style={isPlatform ? { left: effectiveSidebarWidth } : undefined}
      >
        <div className="flex items-center gap-3">
          {!isPlatform && (
            <GlassIconButton onClick={handleBack} aria-label="返回" tone={80}>
              <ArrowLeft size={15} strokeWidth={1.8} />
            </GlassIconButton>
          )}
          {/* Platform + sidebar collapsed: relocate the brand SVG and an
               expand button into the card's top-left header. */}
          {isPlatform && sidebarCollapsed && (
            <>
              <svg
                width="108"
                height="20"
                viewBox="0 0 108 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="抖音AI工坊"
                className="h-5 shrink-0 text-[var(--color-ink)]"
              >
                <path d="M38.2988 10.9897L40.0596 10.7847V12.4634L38.2988 12.6665V16.8335H36.3779V12.8882L30.3809 13.5874L30.3613 13.4634L30.1465 12.0415L30.126 11.9077L30.2607 11.8921L36.3779 11.1929V1.64209H38.2988V10.9897ZM28.7246 4.55615H30.4844V6.18408H28.7275V8.77783L30.4531 8.48877V10.1499L30.3467 10.1694L28.7275 10.4741V14.7935L28.7256 14.9019C28.7078 15.4348 28.5558 15.8628 28.25 16.1714C27.9454 16.4787 27.505 16.6505 26.9443 16.7056L26.8311 16.7153C26.3383 16.7484 25.8186 16.7164 25.3203 16.6226L25.2393 16.6069L25.2188 16.5288L24.7998 15.0112L25 15.0425C25.4484 15.113 25.8902 15.1331 26.3213 15.104H26.3223L26.3779 15.0991C26.5072 15.0801 26.6311 15.0235 26.7256 14.9302C26.8318 14.8251 26.9092 14.6651 26.9092 14.436V10.8052L24.9121 11.1646L24.8896 11.0347L24.624 9.45068L26.9072 9.07764V6.18408H25.0371L24.8789 4.55615H26.9072V1.64209H28.7246V4.55615ZM53.8545 9.17334C54.2638 9.17335 54.5961 9.2745 54.8252 9.49756C55.055 9.72132 55.1591 10.047 55.1592 10.4478V15.1675L55.1543 15.3159C55.1318 15.6526 55.0295 15.9263 54.8291 16.1216C54.6007 16.3441 54.2682 16.4419 53.8545 16.4419H43.7979C43.3804 16.4419 43.0471 16.3473 42.8193 16.1255C42.6194 15.9308 42.5189 15.6562 42.4971 15.3169L42.4922 15.1675V10.4478C42.4922 10.0429 42.5933 9.71674 42.8223 9.49365C43.0507 9.27119 43.3841 9.17334 43.7979 9.17334H53.8545ZM69.1914 16.0386L69.25 16.2114H66.9404L66.9111 16.1206L65.8965 12.9067H60.4844L59.4893 16.1196L59.4609 16.2114H57.1523L61.916 2.54932H64.582L69.1914 16.0386ZM73.334 16.2114H71.2588V2.54932H73.334V16.2114ZM44.4121 14.5542L44.4141 14.5894C44.4297 14.7624 44.5599 14.8823 44.7461 14.8823H52.9053L52.9414 14.8804C53.1198 14.8648 53.2382 14.7343 53.2383 14.5542V13.4771H44.4121V14.5542ZM44.7461 10.7329C44.5563 10.7329 44.4122 10.8768 44.4121 11.0601V12.0698H53.2383V11.0601L53.2373 11.0259C53.2217 10.8703 53.1008 10.7494 52.9404 10.7339L52.9053 10.7329H44.7461ZM61.0273 11.0854H65.373L63.2109 4.17822L61.0273 11.0854ZM31.5537 6.65967C32.545 6.8998 33.9001 7.25577 35.1914 7.69092L35.2803 7.72119V9.61084L35.1064 9.55127C33.8189 9.10842 32.4689 8.73964 31.4912 8.4917L31.3926 8.46729V6.62061L31.5537 6.65967ZM46.502 6.39697H51.2012L51.666 4.96436H53.667L53.2002 6.39697H56.4531V7.95654H41.3125L41.1533 6.39697H44.5371L44.0703 4.96436H46.0537L46.502 6.39697ZM31.5557 2.79639C32.7638 3.11029 33.9859 3.48432 35.1924 3.90771L35.2803 3.93799V5.77783L35.1064 5.71729C33.9066 5.29997 32.6919 4.93182 31.4912 4.62354L31.3926 4.59912V2.75342L31.5557 2.79639ZM49.7773 2.88623H55.5391V4.4458H42.209L42.0498 2.88623H47.8223V1.64209H49.7773V2.88623Z" fill="currentColor"/>
                <path d="M103.727 3.5804H107.524V5.35142H101.513V7.29273H105.464C105.816 7.29273 106.1 7.40058 106.315 7.61628C106.531 7.83198 106.645 8.12147 106.656 8.48476C106.747 10.7666 106.747 12.9407 106.656 15.0069C106.633 15.4496 106.463 15.8186 106.145 16.1137C105.839 16.3976 105.453 16.5565 104.987 16.5906C103.931 16.6814 102.864 16.6246 101.786 16.4203L101.411 14.6152C102.319 14.8082 103.199 14.8763 104.051 14.8195C104.425 14.7855 104.63 14.5982 104.664 14.2576C104.777 12.7477 104.777 11.1413 104.664 9.43838C104.641 9.18862 104.516 9.06374 104.289 9.06374H101.479C101.4 10.8461 101.07 12.3844 100.491 13.6786C99.8444 15.1317 98.8454 16.3465 97.4944 17.3228L97.0516 15.1942C98.7205 13.6502 99.5265 11.2264 99.4697 7.9228V5.35142H97.7158L97.5455 3.5804H101.684V1.62207H103.727V3.5804ZM95.9107 12.4185L97.6306 12.0438V13.7467L92.3687 15.0409L91.96 13.304L93.9013 12.8782V7.30976H92.2665L92.0962 5.53874H93.9013V1.62207H95.9107V5.53874H97.5114V7.30976H95.9107V12.4185Z" fill="currentColor"/>
                <path d="M84.3308 14.3255H90.6656V16.0965H76.1058L75.9355 14.3255H82.2192V4.84035H76.9402L76.77 3.06934H89.8993V4.84035H84.3308V14.3255Z" fill="currentColor"/>
                <path d="M4.64629 7.23566C4.64629 8.51889 3.6058 9.55933 2.32369 9.55933C1.04046 9.55933 0 8.51889 0 7.23566C0 5.95243 1.04046 4.91309 2.32369 4.91309C3.6058 4.91309 4.64629 5.95243 4.64629 7.23566Z" fill="currentColor"/>
                <path d="M4.64629 11.8569C4.64629 13.1401 3.6058 14.1795 2.32369 14.1795C1.04046 14.1795 0 13.1401 0 11.8569C0 10.5737 1.04046 9.5332 2.32369 9.5332C3.6058 9.5332 4.64629 10.5737 4.64629 11.8569Z" fill="currentColor"/>
                <path d="M6.52691 4.9923C5.61958 5.89963 4.21325 5.96452 3.38648 5.13775C2.55859 4.30986 2.62348 2.90355 3.5308 1.99623C4.43813 1.0889 5.84446 1.02401 6.67123 1.8519C7.49912 2.67867 7.43423 4.08498 6.52691 4.9923Z" fill="currentColor"/>
                <path d="M6.52691 17.0939C5.61958 18.0012 4.21325 18.0661 3.38648 17.2382C2.55859 16.4114 2.62348 15.0051 3.5308 14.0978C4.43813 13.1905 5.84446 13.1256 6.67123 13.9535C7.49912 14.7802 7.43423 16.1865 6.52691 17.0939Z" fill="currentColor"/>
                <path d="M16.2489 6.88788C17.1562 5.98055 18.0344 5.38761 18.2112 5.56438C18.388 5.74114 17.795 6.61938 16.8877 7.52671C15.9804 8.43403 15.1021 9.02586 14.9253 8.85021C14.7497 8.67344 15.3415 7.7952 16.2489 6.88788Z" fill="currentColor"/>
                <path d="M16.3845 11.6724C17.2918 10.7651 18.1096 10.1118 18.2114 10.2136C18.3132 10.3165 17.661 11.1343 16.7536 12.0416C15.8463 12.949 15.0285 13.6012 14.9256 13.4994C14.8238 13.3976 15.4771 12.5798 16.3845 11.6724Z" fill="currentColor"/>
                <path d="M13.0553 2.66021C13.9626 1.75288 15.0602 1.3792 15.5065 1.82447C15.9518 2.27086 15.5782 3.36838 14.6709 4.27571C13.7635 5.18303 12.6671 5.55671 12.2207 5.11032C11.7743 4.66393 12.148 3.56753 13.0553 2.66021Z" fill="currentColor"/>
                <path d="M13.1782 14.8979C14.0855 13.9906 15.1271 13.5621 15.5064 13.9402C15.8845 14.3184 15.456 15.3611 14.5487 16.2684C13.6414 17.1757 12.5987 17.6042 12.2205 17.2261C11.8424 16.8468 12.2709 15.8052 13.1782 14.8979Z" fill="currentColor"/>
                <path d="M8.33898 15.9313C9.2463 15.0239 10.4714 14.7789 11.0755 15.3831C11.6807 15.9872 11.4358 17.2134 10.5285 18.1207C9.62113 19.028 8.39493 19.273 7.79079 18.6689C7.18554 18.0636 7.43166 16.8386 8.33898 15.9313Z" fill="currentColor"/>
                <path d="M8.25097 0.831134C9.15829 -0.0761893 10.4348 -0.270856 11.1027 0.39705C11.7707 1.06496 11.576 2.34147 10.6687 3.2488C9.76135 4.15612 8.48481 4.34967 7.8169 3.68288C7.14899 3.01498 7.34365 1.73846 8.25097 0.831134Z" fill="currentColor"/>
              </svg>
              <button
                onClick={() => setSidebarCollapsed(false)}
                title="展开侧栏"
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
              >
                <PanelLeft size={13} strokeWidth={1.8} />
              </button>
              <div className="mx-1 h-4 w-px bg-[var(--divider)]" />
            </>
          )}
          {editingProjectTitle ? (
            <input
              autoFocus
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onBlur={() => setEditingProjectTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setEditingProjectTitle(false)
              }}
              className="w-[220px] border-b border-[var(--color-ink)]/40 bg-transparent text-[12px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
            />
          ) : (
            <span className="text-[12px] text-[var(--color-ink)]/70">
              {projectTitle}
            </span>
          )}
          <button
            onClick={() => setEditingProjectTitle((v) => !v)}
            title={editingProjectTitle ? '完成' : '重命名项目'}
            className="text-[var(--color-ink)]/65 transition-colors hover:text-[var(--color-ink)]"
          >
            {editingProjectTitle ? <Check size={11} /> : <Pencil size={11} />}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* ── Layout switcher ── */}
          <div ref={layoutMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setLayoutMenuOpen((v) => !v)}
              title="更多"
              className="flex items-center justify-center rounded-md p-1.5 text-[var(--color-ink)]/90 transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            >
              <MoreHorizontal size={16} />
            </button>
            {layoutMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-[200px] overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-2)] shadow-[0_20px_50px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink)]/40">
                  布局
                </div>
                {(
                  [
                    {
                      value: 'workspace' as const,
                      label: '工作区视图',
                      hint: '单视图 / 分屏 tabs',
                      icon: Columns2,
                    },
                    {
                      value: 'code' as const,
                      label: '编辑视图 · 左 chat',
                      hint: '左侧对话 · 文件 · 右侧预览',
                      icon: Code2,
                    },
                    {
                      value: 'editor' as const,
                      label: '编辑视图 · chat 在右',
                      hint: '常驻手机 · 独立文件区',
                      icon: LayoutGrid,
                    },
                    {
                      value: 'platform' as const,
                      label: '平台视图',
                      hint: '多项目目录 · 对话 · 预览 + 控制台',
                      icon: LayoutDashboard,
                    },
                  ]
                ).map((opt) => {
                  const Icon = opt.icon
                  const active = layout === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLayout(opt.value)
                        setLayoutMenuOpen(false)
                      }}
                      className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors ${
                        active
                          ? 'bg-[var(--color-ink)]/[0.06]'
                          : 'hover:bg-[var(--fill-subtle)]'
                      }`}
                    >
                      <Icon size={14} className={`mt-0.5 shrink-0 ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/55'}`} />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className={`text-[12px] ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/80'}`}>
                          {opt.label}
                          {active && (
                            <span className="ml-1.5 text-[10px] text-[var(--color-ink)]/45">当前</span>
                          )}
                        </span>
                        <span className="text-[10px] text-[var(--color-ink)]/40">
                          {opt.hint}
                        </span>
                      </span>
                    </button>
                  )
                })}
                <div className="mt-1 border-t border-[var(--divider-soft)] px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink)]/40">
                  外观
                </div>
                {(
                  [
                    { value: 'light' as const, label: '亮色模式', icon: Sun },
                    { value: 'dark' as const, label: '暗色模式', icon: Moon },
                  ]
                ).map((opt) => {
                  const Icon = opt.icon
                  const active = themeMode === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setThemeMode(opt.value)
                        setLayoutMenuOpen(false)
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                        active
                          ? 'bg-[var(--color-ink)]/[0.06]'
                          : 'hover:bg-[var(--fill-subtle)]'
                      }`}
                    >
                      <Icon size={14} className={`shrink-0 ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/55'}`} />
                      <span className={`text-[12px] ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/80'}`}>
                        {opt.label}
                        {active && (
                          <span className="ml-1.5 text-[10px] text-[var(--color-ink)]/45">当前</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {[Database, Headphones, Clock].map((Icon, i) => (
            <button
              key={i}
              className="flex items-center justify-center rounded-md p-1.5 text-[var(--color-ink)]/90 transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            >
              <Icon size={16} />
            </button>
          ))}


          {/* ── 发布（右上角主 CTA） — platform hides it inside the card-top strip ── */}
          {!isPlatform && (
            <button
              type="button"
              onClick={() => {
                resetPublish()
                startPublish('modal')
              }}
              style={{ ['--edge-alpha' as string]: 0.3 }}
              className="glass-edge ml-2 flex items-center gap-2 rounded-full bg-[rgba(28,28,32,0.35)] px-5 py-2 text-[14px] font-medium tracking-[0.55px] uppercase text-[var(--color-ink)]/90 shadow-[0_8px_22px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:-translate-y-[1px] hover:bg-[rgba(40,40,44,0.45)] hover:text-[var(--color-ink)]"
            >
              <Upload size={14} strokeWidth={2} />
              <span>发布</span>
            </button>
          )}
        </div>
      </header>
      )}

      {/* ══════ Body ══════ Platform pushes content below the fixed
           card-top header strip: 12px card-top + 44px header = 56px (pt-14).
           Left margin for platform tracks the draggable chat width and is
           applied via inline style since Tailwind arbitrary values are
           compile-time. */}
      <div
        className={`relative z-10 flex min-h-0 flex-1 overflow-hidden transition-[margin] duration-300 ease-out ${
          chatCollapsed || isPlatform ? '' : bodyMarginClass
        } ${isPlatform && !platformHomeOpen && !platformSecondaryPageOpen ? 'pt-3' : ''}`}
        style={
          isPlatform
            ? {
                marginLeft:
                  platformHomeOpen || platformSecondaryPageOpen
                    ? effectiveSidebarWidth
                    : previewHidden
                      ? `calc(${effectiveSidebarWidth}px + min(calc(100vw - ${effectiveSidebarWidth}px), ${PREVIEW_HIDDEN_CHAT_MAX}px))`
                      : effectiveSidebarWidth + platformChatWidth,
              }
            : undefined
        }
      >
        {/* ────── Chat aside — fixed to viewport. Code: below header, flush left with 20px gutter. Platform: flush against the preview inside the shared card (card frame is painted separately just below). Otherwise: pins top-0 on the right with a rounded glass panel. Hidden when platform home screen / resource library page is active. ────── */}
        {!(isPlatform && (platformHomeOpen || platformSecondaryPageOpen)) && (
        <aside
          className={`fixed z-30 flex flex-col transition-[width,left] duration-300 ease-out ${
            isPlatform
              ? `top-3 bottom-3 ${previewHidden ? '' : 'border-r border-[var(--divider-soft)]'}`
              : chatOnLeft
                ? 'left-5 top-14 bottom-5'
                : 'right-0 top-0 bottom-0'
          } ${
            chatCollapsed
              ? 'w-0 overflow-hidden'
              : isPlatform
                ? ''
                : chatOnLeft
                  ? ''
                  : 'py-3 pr-3'
          }`}
          style={
            chatCollapsed
              ? isPlatform
                ? { left: effectiveSidebarWidth }
                : undefined
              : isPlatform
                ? { width: effectiveChatWidth, left: effectiveChatLeft }
                : { width: effectiveChatWidth }
          }
        >
          <div
            style={
              chatOnLeft
                ? undefined
                : {
                    ['--edge-alpha' as string]: 0.1,
                    ['--edge-angle' as string]: '135deg',
                  }
            }
            className={`flex h-full w-full min-w-px flex-col overflow-hidden ${
              chatOnLeft
                ? ''
                : 'glass-edge-down rounded-[24px] bg-[rgba(65,65,65,0.2)] shadow-[-16px_0_40px_-20px_rgba(0,0,0,0.3)] backdrop-blur-[32px]'
            }`}
          >
          {/* ══════ Chat Header ══════ Sits at the very top of the chat
              aside as a direct child of the outer wrapper so nothing
              shrinks it — it always spans the chat column edge-to-edge
              with a bottom divider. Messages + composer live below in
              their own padded flex-col. Left: 项目 / 会话 breadcrumb.
              Right: 分享 + 展开/收起 X. ══════ */}
          <div className="flex h-10 w-full shrink-0 items-center justify-between gap-2 px-3">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              {isPlatform && sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  title="展开侧栏"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
                >
                  <PanelLeft size={13} strokeWidth={1.8} />
                </button>
              )}
              <div ref={sessionMenuRef} className="relative flex min-w-0 items-center">
                <button
                  type="button"
                  onClick={() => setSessionMenuOpen((v) => !v)}
                  className="flex min-w-0 items-center gap-1 rounded text-[12px] leading-5 text-[var(--color-ink)]/70 transition-colors hover:text-[var(--color-ink)]"
                >
                  <span className="truncate text-[var(--color-ink)]/55">
                    {projectTitle}
                  </span>
                  <span className="shrink-0 text-[var(--color-ink)]/30">/</span>
                  <span className="min-w-0 max-w-[180px] truncate text-[var(--color-ink)]/85">
                    {sessions.find((s) => s.id === activeSessionId)?.name ?? '新会话'}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`shrink-0 transition-transform ${sessionMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              {sessionMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] shadow-[0_12px_28px_-8px_rgba(16,18,24,0.2)]">
                  <div className="thin-scroll max-h-[320px] overflow-y-auto py-1">
                    {sessions.map((s) => {
                      const isActive = s.id === activeSessionId
                      const isEditing = editingSessionId === s.id
                      return (
                        <div
                          key={s.id}
                          role="button"
                          onClick={() => {
                            if (isEditing) return
                            if (s.id !== activeSessionId) {
                              setActiveSessionId(s.id)
                              resetChatState()
                            }
                            setSessionMenuOpen(false)
                          }}
                          className={`group flex cursor-pointer items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors ${
                            isActive
                              ? 'bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]/85'
                              : 'text-[var(--color-ink)]/70 hover:bg-[var(--fill-subtle)]'
                          }`}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={s.name}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => renameSession(s.id, e.target.value)}
                              onBlur={() => setEditingSessionId(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') setEditingSessionId(null)
                              }}
                              className="min-w-0 flex-1 border-b border-[var(--color-ink)]/40 bg-transparent text-[12px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
                            />
                          ) : (
                            <span className="min-w-0 flex-1 truncate">{s.name}</span>
                          )}
                          {!isEditing && (
                            <span
                              role="button"
                              tabIndex={0}
                              title="重命名"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingSessionId(s.id)
                              }}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--color-ink)]/40 opacity-0 transition-opacity hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/80 group-hover:opacity-100"
                            >
                              <Pencil size={11} />
                            </span>
                          )}
                          {isActive && !isEditing && (
                            <Check size={12} className="shrink-0 text-[var(--color-ink)]/60" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                title="新建对话"
                onClick={handleNewSession}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <MessageSquarePlus size={13} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                title="分享"
                onClick={() => toast.info('分享链接已复制到剪贴板')}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <Share2 size={13} strokeWidth={1.8} />
              </button>
              {/* When the X panel is already expanded, its own header
                   carries the collapse button — no need to duplicate it
                   here. The chat-header button only surfaces when the
                   panel is collapsed, so the user has a way to bring it
                   back. */}
              {previewCollapsed && (
                <button
                  type="button"
                  title="展开产物预览"
                  onClick={() => setPreviewCollapsed(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                >
                  <PanelRightOpen size={13} strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>
          {/* ── Chat body: messages + composer. Lives under the Header
               in its own flex-col so the Header above can stay edge-to-
               edge while the body retains its inner padding. ── */}
          <div className={`flex min-h-0 flex-1 flex-col ${isPlatform ? 'pb-2' : chatOnLeft ? '' : 'px-1.5 pt-3 pb-1.5'} ${isPlatform && previewHidden ? 'mx-auto w-full max-w-[760px]' : ''}`}>
          {/* Scrollable messages */}
          <div ref={chatScrollRef} className={`thin-scroll flex-1 overflow-y-auto px-2.5 pt-8 pb-8 ${chatCleared ? '' : 'space-y-6'} ${fadeClassFromEdges(chatScrollEdges)}`}>
            {(chatCleared || (!needsFlowActive && !showChatPublish && sentMessages.length === 0)) && proposalStep === 'idle' ? (
              <ChatEmptyState
                suggestions={
                  activeProjectKind === 'ai-avatar'
                    ? AI_AVATAR_CHAT_SUGGESTIONS
                    : CHAT_EMPTY_SUGGESTIONS
                }
                onPick={(t) => sendChat(t)}
              />
            ) : (<>

            {/* ── User-sent messages — always rendered first. Plain
                 messages get a generic AI ack below; trigger-matched
                 messages let needsFlowActive / showChatPublish render
                 their specific response further down. ── */}
            {sentMessages.map((m, i) => (
              <Fragment key={`sent-${i}`}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-end"
                >
                  <div className="max-w-[85%] rounded-[8px] rounded-br-none bg-[var(--bubble-me-bg)] px-3 py-2.5 text-[14px] leading-[20px] text-[var(--color-ink)]">
                    {m.text}
                  </div>
                </motion.div>
                {m.trigger === 'none' && (
                  <GenericAiReply text={GENERIC_AI_REPLIES[i % GENERIC_AI_REPLIES.length]} />
                )}
              </Fragment>
            ))}

            {/* ── Garuda 游戏生成流 ── Each step's bubble mounts when
                 gameStep reaches at-or-past that phase. Steps are
                 advanced by a timer; each AI reply uses Stream/Sequential
                 so the text types in instead of popping. ── */}
            {gameStep !== 'idle' && (
              <GameGenerationFlow
                step={gameStep}
                spec={gameSpec}
                onOpenGame={() => {
                  const idx = openTabs.findIndex((t) => t.label === '游戏预览')
                  if (idx >= 0) setActivePreviewTab(idx)
                }}
                onConfirmSpec={confirmGameSpec}
              />
            )}

            {/* ── 种草提案 Step 1 — 商家目标卡 collection ── */}
            {proposalAtOrPast('collecting') && (
              <div
                id="proposal-step-1"
                data-proposal-anchor="collecting"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalStep === 'collecting' && (
              <Sequential>
                {(step, next) => (
                  <>
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[14px] leading-[20px] text-[var(--color-ink)]"
                    >
                      <Stream onDone={next}>
                        我帮你拆下这次种草提案。先把商家目标卡补完，AI 会把模糊诉求结构化成可执行的种草目标，并标出需要重点监控的指标。
                      </Stream>
                    </motion.p>
                    {step >= 2 && (
                      <RevealAfter delay={120}>
                        <ProposalGoalCard onSubmit={submitProposalGoal} />
                      </RevealAfter>
                    )}
                  </>
                )}
              </Sequential>
            )}
            {/* ── Step 1 closing — goal confirmed ── */}
            {proposalAtOrPast('goal-confirmed') && proposalGoal && (
              <UserEchoBubble
                title="已补完商家目标卡"
                fields={[
                  {
                    label: '品牌',
                    value: `${proposalGoal.brand} · ${proposalGoal.category}`,
                  },
                  {
                    label: '预算 / 周期',
                    value: `${proposalGoal.budget} · ${proposalGoal.period}`,
                  },
                  { label: '目标人群', value: proposalGoal.audience },
                  {
                    label: '核心诉求',
                    value: truncate(proposalGoal.ask, 80),
                  },
                ]}
                footer="约束条件已存档"
              />
            )}
            {proposalAtOrPast('goal-confirmed') && (
              <div
                data-proposal-anchor="goal-confirmed"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalAtOrPast('goal-confirmed') && proposalGoal && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (
                    <>
                      <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                        <Stream onDone={next}>
                          目标已结构化，已沉淀第一份产物：
                        </Stream>
                      </p>
                      {step >= 2 && (
                        <RevealAfter delay={120} onDone={next}>
                          <ArtifactCard
                            filename="商家目标卡.md"
                            summary={PROPOSAL_FILE_SUMMARY['商家目标卡.md']}
                            onOpen={() => openFileInTab('商家目标卡.md')}
                          />
                        </RevealAfter>
                      )}
                      {step >= 3 && (
                        <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/75">
                          <Stream onDone={next}>
                            {'这次的核心目标是'}
                            <strong>五一节点前潜客种草 + 看后搜意向提升</strong>
                            {'，建议组合策略：头部品宣建立认知 + 本地垂类达人真实体验 + 中腰部场景覆盖 + 素人挑战扩散 + 可投广内容放大。'}
                          </Stream>
                        </p>
                      )}
                      {step >= 4 && (
                        <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
                          <Stream onDone={next}>
                            {'下一步我会接入 '}
                            <MentionChip name="风神" />
                            {' / '}
                            <MentionChip name="iDA" />
                            {' 拉一下同类商家的人群覆盖和流量结构，做人群与流量诊断。'}
                          </Stream>
                        </p>
                      )}
                      {step >= 5 && proposalStep === 'goal-confirmed' && (
                        <RevealAfter delay={120}>
                          <button
                            type="button"
                            onClick={runAudienceDiagnosis}
                            className="rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90"
                          >
                            运行人群与流量诊断
                          </button>
                        </RevealAfter>
                      )}
                    </>
                  )}
                </Sequential>
              </motion.div>
            )}

            {/* ── Step 2 — 人群与流量诊断 ── */}
            {proposalAtOrPast('audience-diagnosed') && (
              <div
                id="proposal-step-2"
                data-proposal-anchor="audience-diagnosed"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalAtOrPast('audience-diagnosed') && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (
                    <>
                      <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                        <Stream onDone={next}>
                          {'已通过 '}
                          <MentionChip name="风神" />
                          {' 拉取同类火锅品牌过去 30 天指标，'}
                          <MentionChip name="iDA" />
                          {' 拆出商家的 A3 / 看后搜结构。'}
                        </Stream>
                      </p>
                      {step >= 2 && (
                        <RevealAfter delay={150} onDone={next}>
                          <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                            诊断结果：
                          </p>
                        </RevealAfter>
                      )}
                      {step >= 3 && (
                        <RevealAfter delay={200} onDone={next}>
                          <ProposalDiagnosisCard />
                        </RevealAfter>
                      )}
                      {step >= 4 && (
                        <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
                          <Stream onDone={next}>
                            完整诊断已沉淀到下面这两份产物，每日 AI 会持续刷新看板：
                          </Stream>
                        </p>
                      )}
                      {step >= 5 && (
                        <RevealAfter
                          delay={120}
                          onDone={() => {
                            next()
                            setStep2BubbleStreamed(true)
                          }}
                        >
                          <ArtifactCardGroup>
                            <ArtifactCard
                              filename="人群诊断.md"
                              summary={PROPOSAL_FILE_SUMMARY['人群诊断.md']}
                              onOpen={() => openFileInTab('人群诊断.md')}
                            />
                            <ArtifactCard
                              filename="人群诊断看板"
                              kind="dashboard"
                              summary={PROPOSAL_FILE_SUMMARY['人群诊断看板']}
                              onOpen={() => openFileInTab('人群诊断看板')}
                            />
                          </ArtifactCardGroup>
                        </RevealAfter>
                      )}
                    </>
                  )}
                </Sequential>
              </motion.div>
            )}

            {/* ── Step 3 — 达人包策略 (selector while pack still pending) ── */}
            {proposalAtOrPast('audience-diagnosed') && <div id="proposal-step-3" className="h-0" aria-hidden />}
            {proposalStep === 'audience-diagnosed' && step2BubbleStreamed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (
                    <>
                      <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                        <Stream onDone={next}>
                          {'基于诊断结论，我帮你组了 3 套达人包，已结合 '}
                          <MentionChip name="mira" />
                          {' 的内容样板和 '}
                          <MentionChip name="aeolus" />
                          {' 的指标基线给出推荐：'}
                        </Stream>
                      </p>
                      {step >= 2 && (
                        <RevealAfter delay={120}>
                          <ProposalPackCard
                            defaultPick="综合推荐包"
                            onConfirm={confirmProposalPack}
                          />
                        </RevealAfter>
                      )}
                    </>
                  )}
                </Sequential>
              </motion.div>
            )}

            {proposalAtOrPast('pack-ready') && proposalPack && (
              <UserEchoBubble
                title={`已选「${proposalPack}」`}
                fields={(() => {
                  const p = getPackProfile(proposalPack)
                  return [
                    {
                      label: '关键指标',
                      value: `A3 ${p.metrics.a3} · 自然 ${p.metrics.natural} · 看后搜 ${p.metrics.afterSearch}`,
                    },
                    { label: '预算', value: p.metrics.budget },
                  ]
                })()}
              />
            )}
            {proposalAtOrPast('pack-ready') && (
              <div
                data-proposal-anchor="pack-ready"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalAtOrPast('pack-ready') && proposalPack && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (
                    <>
                      <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                        <Stream onDone={next}>
                          {'已确认 '}
                          <strong>{proposalPack}</strong>
                          {'，达人结构 + 指标预估已沉淀：'}
                        </Stream>
                      </p>
                      {step >= 2 && (
                        <RevealAfter delay={120} onDone={next}>
                          <ArtifactCard
                            filename="达人包.md"
                            summary={PROPOSAL_FILE_SUMMARY['达人包.md']}
                            onOpen={() => openFileInTab('达人包.md')}
                          />
                        </RevealAfter>
                      )}
                      {step >= 3 && (
                        <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
                          <Stream
                            cursor={false}
                            onDone={() => setStep3ClosingBubbleStreamed(true)}
                          >
                            {'下一步进入 '}
                            <strong>玩法 + Brief 编排</strong>
                            {'：为每个达人桶绑定玩法标签，并产出 brief 模板（'}
                            <MentionChip name="mira" />
                            {' / '}
                            <MentionChip name="aeolus" />
                            {' 协同）。'}
                          </Stream>
                        </p>
                      )}
                    </>
                  )}
                </Sequential>
              </motion.div>
            )}

            {/* ── Step 4 — 玩法 + Brief (selector while brief still pending) ── */}
            {proposalAtOrPast('pack-ready') && <div id="proposal-step-4" className="h-0" aria-hidden />}
            {proposalStep === 'pack-ready' && step3ClosingBubbleStreamed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (
                    <>
                      <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                        <Stream onDone={next}>
                          按达人桶我配了 4 套玩法 + Brief 模板，可以切换查看；确认后会沉淀成统一的 brief 模板下发。
                        </Stream>
                      </p>
                      {step >= 2 && (
                        <RevealAfter delay={120}>
                          <ProposalBriefCard onConfirm={confirmProposalBrief} />
                        </RevealAfter>
                      )}
                    </>
                  )}
                </Sequential>
              </motion.div>
            )}

            {proposalAtOrPast('brief-ready') && (
              <UserEchoBubble
                title="已确认 4 套玩法 + Brief 模板"
                fields={[
                  {
                    label: '玩法',
                    value: '本地垂类 / 头部品宣 / 素人挑战 / 可投广候选',
                  },
                  { label: '产物', value: 'briefs/玩法brief.md' },
                ]}
              />
            )}
            {proposalAtOrPast('brief-ready') && (
              <div
                data-proposal-anchor="brief-ready"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalAtOrPast('brief-ready') && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (
                    <>
                      <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                        <Stream onDone={next}>
                          4 套玩法 brief 已固化，机构和达人侧拿这一份就能开干：
                        </Stream>
                      </p>
                      {step >= 2 && (
                        <RevealAfter delay={120} onDone={next}>
                          <ArtifactCard
                            filename="玩法brief.md"
                            summary={PROPOSAL_FILE_SUMMARY['玩法brief.md']}
                            onOpen={() => openFileInTab('玩法brief.md')}
                          />
                        </RevealAfter>
                      )}
                      {step >= 3 && (
                        <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
                          <Stream onDone={next}>
                            {'接下来我会把目标 / 诊断 / 达人包 / Brief 拼装成完整的 '}
                            <strong>提案报告</strong>
                            {'，并由 '}
                            <MentionChip name="aime" />
                            {' 走质量检查。'}
                          </Stream>
                        </p>
                      )}
                      {step >= 4 && proposalStep === 'brief-ready' && (
                        <RevealAfter delay={120}>
                          <button
                            type="button"
                            onClick={assembleProposalReport}
                            className="rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90"
                          >
                            生成提案报告
                          </button>
                        </RevealAfter>
                      )}
                    </>
                  )}
                </Sequential>
              </motion.div>
            )}

            {/* ── Step 5 — 提案报告 ── */}
            {proposalAtOrPast('report-ready') && (
              <div
                id="proposal-step-5"
                data-proposal-anchor="report-ready"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalAtOrPast('report-ready') && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (<>
                <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                  <Stream onDone={next}>
                    {'提案报告已拼装完成，'}
                    <MentionChip name="aime" />
                    {' 跑了一轮质量检查（目标清晰度 92 / 达人包完整度 88 / 预算合理性 76 / 自然贡献风险 中）。'}
                  </Stream>
                </p>
                {step >= 2 && (
                <RevealAfter delay={150} onDone={next}>
                <div className="rounded-xl bg-[var(--chat-form-bg)] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[var(--color-ink)]">
                      {proposalGoal?.brand ?? '本次提案'}｜五一潜客种草方案
                    </span>
                    <FileChip
                      filename="提案报告.md"
                      onOpen={() => openFileInTab('提案报告.md')}
                    />
                  </div>
                  <div className="text-[11.5px] text-[var(--color-ink)]/55">
                    方案版本 V2 ｜ {proposalPack ?? '综合推荐包'} ｜ 预算 ¥50 万 ｜ 含 7 个章节
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <ReportQualityRow label="目标清晰度" score="92" tone="mint" />
                    <ReportQualityRow label="达人包完整度" score="88" tone="mint" />
                    <ReportQualityRow label="预算合理性" score="76" tone="amber" />
                    <ReportQualityRow label="自然贡献风险" score="中" tone="amber" />
                  </div>
                  <div className="rounded-md bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[11.5px] leading-[1.65] text-[var(--color-ink)]/65">
                    <strong className="text-[var(--color-ink)]">AI 修改建议：</strong>
                    建议在提案里补充"内容自然贡献占比"作为商家复盘口径，并解释为什么不建议过度增加头部达人预算。
                  </div>
                </div>
                </RevealAfter>
                )}
                {step >= 3 && (
                <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
                  <Stream onDone={next}>
                    {'下一步把方案'}
                    <strong>转执行看板</strong>
                    {'，自动拆成达人 / 机构 / 星图任务。'}
                  </Stream>
                </p>
                )}
                {step >= 4 && proposalStep === 'report-ready' && (
                  <RevealAfter delay={120}>
                  <button
                    type="button"
                    onClick={convertProposalToDashboard}
                    className="rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90"
                  >
                    提案转执行看板
                  </button>
                  </RevealAfter>
                )}
                  </>)}
                </Sequential>
              </motion.div>
            )}

            {/* ── Step 6 — 转执行看板 ── */}
            {proposalAtOrPast('dashboard-ready') && (
              <div
                id="proposal-step-6"
                data-proposal-anchor="dashboard-ready"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalAtOrPast('dashboard-ready') && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (<>
                <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                  <Stream onDone={next}>
                    {'方案已拆成执行任务：6 阶段漏斗 + 5 个执行模块（达人 / 机构 / 内容任务 / 星图 / 内容质检），'}
                    <MentionChip name="aime" />
                    {' 把每个模块都同步到了对应负责人的飞书。'}
                  </Stream>
                </p>
                {step >= 2 && (
                <RevealAfter delay={150} onDone={next}>
                  <ProposalDashboardCard />
                </RevealAfter>
                )}
                {step >= 3 && (
                <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
                  <Stream onDone={next}>
                    完整看板已沉淀，每日 AI 会同步进度日报：
                  </Stream>
                </p>
                )}
                {step >= 4 && (
                <RevealAfter delay={120} onDone={next}>
                  <ArtifactCard
                    filename="执行看板.md"
                    summary={PROPOSAL_FILE_SUMMARY['执行看板.md']}
                    onOpen={() => openFileInTab('执行看板.md')}
                  />
                </RevealAfter>
                )}
                {step >= 6 && (
                <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/55">
                  <Stream onDone={next}>
                    {'执行结束（5/05 后）会自动跑'}
                    <strong>种草复盘</strong>
                    {'，根据实际数据生成下次模板。'}
                  </Stream>
                </p>
                )}
                {step >= 7 && proposalStep === 'dashboard-ready' && (
                  <RevealAfter delay={120}>
                  <button
                    type="button"
                    onClick={runProposalReview}
                    className="rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90"
                  >
                    模拟执行结束 · 运行复盘
                  </button>
                  </RevealAfter>
                )}
                  </>)}
                </Sequential>
              </motion.div>
            )}

            {/* ── Step 7 — 种草复盘 (终态) ── */}
            {proposalAtOrPast('review-ready') && (
              <div
                id="proposal-step-7"
                data-proposal-anchor="review-ready"
                className="h-0"
                aria-hidden
              />
            )}
            {proposalAtOrPast('review-ready') && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <Sequential>
                  {(step, next) => (<>
                <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                  <Stream onDone={next}>
                    {'执行已收口。'}
                    <MentionChip name="风神" />
                    {' 拉了实际指标，'}
                    <MentionChip name="iDA" />
                    {' 跑了归因，'}
                    <MentionChip name="aime" />
                    {' 出复盘草稿：'}
                  </Stream>
                </p>
                {step >= 2 && (
                <RevealAfter delay={150} onDone={next}>
                  <ProposalReviewCard />
                </RevealAfter>
                )}
                {step >= 3 && (
                <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]/65">
                  <Stream onDone={next}>
                    全部产出已沉淀，可作为同类项目的起点模板。本次提案到这里就完成了 ✨
                  </Stream>
                </p>
                )}
                {step >= 4 && (
                <RevealAfter delay={120} onDone={next}>
                  <ArtifactCard
                    filename="复盘.md"
                    summary={PROPOSAL_FILE_SUMMARY['复盘.md']}
                    onOpen={() => openFileInTab('复盘.md')}
                  />
                </RevealAfter>
                )}
                {step >= 5 && (
                <p className="text-[12.5px] leading-[1.7] text-[var(--color-ink)]/45">
                  <Stream cursor={false}>
                    右侧「会话产出」面板列出了完整 7 份产物，随时可以打开复盘、回看、二次编辑。
                  </Stream>
                </p>
                )}
                  </>)}
                </Sequential>
              </motion.div>
            )}

            {/* ── Trigger-config flow — recognition → confirmation card →
                 post-confirm success summary. Rendered once globally
                 (not per-message) so only the latest trigger is in play. ── */}
            {pendingTrigger && triggerStep === 'loading' && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.25 }}
                className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/45"
              >
                {[0, 1, 2].map((k) => (
                  <motion.span
                    key={k}
                    animate={{ y: [0, -3, 0], opacity: [0.35, 0.85, 0.35] }}
                    transition={{ duration: 0.9, delay: k * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
                  />
                ))}
                <span className="ml-1">AI 正在识别触发器…</span>
              </motion.div>
            )}
            {pendingTrigger && triggerStep === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                  识别到一个触发器，请确认：
                </p>
                <ChatFormCard delay={0.05}>
                  <ChatFormStep number={1} title="事件">
                    <span className="inline-flex items-center rounded-md bg-[var(--chat-form-option-bg)] px-2 py-0.5 text-[13px] font-medium text-[var(--color-ink)]">
                      {pendingTrigger.event.label}
                    </span>
                  </ChatFormStep>
                  <ChatFormStep number={2} title="执行动作">
                    <p className="text-[13px] leading-[1.6] text-[var(--color-ink)]/85">
                      {pendingTrigger.action.description}
                    </p>
                  </ChatFormStep>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ChatFormSubmit onClick={confirmPendingTrigger}>
                      确认创建
                    </ChatFormSubmit>
                    <button
                      type="button"
                      onClick={cancelPendingTrigger}
                      className="rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
                    >
                      修改
                    </button>
                  </div>
                </ChatFormCard>
              </motion.div>
            )}
            {triggerStep === 'confirmed' && lastConfirmedTrigger && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2"
              >
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/50">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>已创建触发器</span>
                </div>
                <button
                  type="button"
                  onClick={() => openTriggerTab(lastConfirmedTrigger)}
                  className="flex w-full items-center justify-between rounded-xl bg-[var(--fill-subtle)] px-3.5 py-3 text-left text-[13px] transition-colors hover:bg-[var(--fill-hover)]"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium text-[var(--color-ink)]">
                      {lastConfirmedTrigger.name}
                    </span>
                    <span className="text-[11.5px] text-[var(--color-ink)]/55">
                      {lastConfirmedTrigger.event.label} · {lastConfirmedTrigger.action.description}
                    </span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--color-ink)]/30" />
                </button>
              </motion.div>
            )}

            {needsFlowActive && (<>

            {/* ── Thinking indicator — shows briefly before AI response
                 1 fades in, so the response feels like it's being typed
                 live rather than popping in whole. Unmounts once faded
                 so it stops eating a `space-y` slot. ── */}
            {needsThinkingVisible && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 0.6, duration: 0.25 }}
                className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/45"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -3, 0], opacity: [0.35, 0.85, 0.35] }}
                    transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
                  />
                ))}
                <span className="ml-1">AI 正在思考</span>
              </motion.div>
            )}

            {/* ── AI response 1 ── */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2.5"
            >
              {/* status */}
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.25 }}
                onClick={() => setTask1Open(!task1Open)}
                className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/50"
              >
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>已梳理需求，耗时 2.8s</span>
                {task1Open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </motion.button>

              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.25 }}
                className="text-[14px] leading-[20px] text-[var(--color-ink)]"
              >
                好，先对齐几个关键信息，我一步步帮你搭出来
              </motion.p>

              {/* form card — cascading: step 2 & 3 unlock based on previous answers */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl bg-[var(--chat-form-bg)] p-3 space-y-5"
              >
                {/* step 1 — 发布场景. Locks once step 2 has been answered
                     (appType is set) — at that point the pick is baked in,
                     and the user must hit "重新选择" to change it. */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)]/75">
                    <span className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-0)] px-1 text-[10px] font-medium text-[var(--color-ink)]/70">1</span>
                    发布到哪个抖音场景？
                    {Boolean(appType) && <CheckCircle2 size={12} className="text-emerald-400" />}
                  </div>
                  <RadioGroup
                    options={[
                      { label: 'Feed 主信息流', value: 'feed' },
                      { label: '评论区 / 直播间', value: 'comment-live' },
                      { label: '私信群聊', value: 'private' },
                      { label: '先不定', value: 'later' },
                    ]}
                    selected={scene}
                    locked={Boolean(appType)}
                    onChange={(v) => {
                      setScene(v)
                      // Reset later steps when upstream changes.
                      setAppType('')
                      setFormSubmitted(false)
                    }}
                  />
                </div>

                {/* step 2 — 应用形态 (unlocks after step 1). Locks once
                     step 3 has started loading / been reached. */}
                {scene && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)]/75">
                      <span className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-0)] px-1 text-[10px] font-medium text-[var(--color-ink)]/70">2</span>
                      这次想做成什么形态？
                      {capabilitiesStep !== 'idle' && <CheckCircle2 size={12} className="text-emerald-400" />}
                    </div>
                    <RadioGroup
                      options={[
                        { label: '抖音小程序', value: 'mini-program' },
                        { label: 'AI 分身', value: 'ai-avatar' },
                        { label: '小花技能', value: 'xiaohua' },
                      ]}
                      selected={appType}
                      locked={capabilitiesStep !== 'idle'}
                      onChange={(v) => {
                        setAppType(v)
                        setFormSubmitted(false)
                      }}
                    />
                  </div>
                )}

                {/* step 3 — 推荐能力. Driven by `capabilitiesStep`:
                     • 'loading' → thinking dots "系统在分析可推荐的能力…"
                     • 'ready'   → pills + 确认能力 button
                     • 'confirmed' → pills (still editable) + ✓ indicator,
                                     step 4 loading kicks off automatically. */}
                {appType && capabilitiesStep !== 'idle' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)]/75">
                      <span className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-0)] px-1 text-[10px] font-medium text-[var(--color-ink)]/70">3</span>
                      <span>引入能力</span>
                      {capabilitiesStep === 'confirmed' && (
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      )}
                    </div>
                    {capabilitiesStep === 'loading' ? (
                      <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/45">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -3, 0], opacity: [0.35, 0.85, 0.35] }}
                            transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                            className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
                          />
                        ))}
                        <span className="ml-1">正在分析可推荐的能力…</span>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-2"
                      >
                        <p className="text-[11.5px] leading-[1.6] text-[var(--color-ink)]/55">
                          根据需求推荐引入，后续可在项目目录里维护
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {CAPABILITY_OPTIONS.map((cap) => {
                            const on = enabledCapabilities.has(cap.id)
                            const locked = capabilitiesStep === 'confirmed'
                            if (locked && !on) return null
                            const toggle = () => {
                              setEnabledCapabilities((prev) => {
                                const next = new Set(prev)
                                if (next.has(cap.id)) next.delete(cap.id)
                                else next.add(cap.id)
                                return next
                              })
                              setFormSubmitted(false)
                            }
                            return (
                              <button
                                key={cap.id}
                                type="button"
                                disabled={locked}
                                onClick={toggle}
                                className={`flex items-start gap-2.5 rounded-lg bg-[var(--color-surface-0)] p-2.5 text-left ring-1 transition-all ${
                                  on
                                    ? 'ring-[var(--color-ink)]/15 shadow-[0_1px_2px_rgba(16,18,24,0.04)]'
                                    : 'opacity-65 ring-[var(--color-ink)]/8'
                                } ${locked ? 'cursor-default' : 'hover:ring-[var(--color-ink)]/25'}`}
                              >
                                <div
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-opacity ${
                                    cap.kind === 'knowledge'
                                      ? 'bg-sky-500/10 text-sky-500'
                                      : 'bg-violet-500/10 text-violet-500'
                                  }`}
                                >
                                  {cap.kind === 'knowledge' ? (
                                    <Database size={12} strokeWidth={1.8} />
                                  ) : (
                                    <WandSparkles size={12} strokeWidth={1.8} />
                                  )}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={`truncate text-[12.5px] ${
                                        on
                                          ? 'font-semibold text-[var(--color-ink)]'
                                          : 'font-medium text-[var(--color-ink)]/70'
                                      }`}
                                    >
                                      {cap.title}
                                    </span>
                                    <span
                                      aria-hidden
                                      className={`flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full transition-colors ${
                                        on
                                          ? 'bg-[var(--color-ink)] text-[var(--color-ink-contrast)]'
                                          : 'ring-1 ring-[var(--color-ink)]/25'
                                      }`}
                                    >
                                      {on && <Check size={9} strokeWidth={3} />}
                                    </span>
                                  </div>
                                  <p className="truncate text-[11px] leading-[1.5] text-[var(--color-ink)]/55">
                                    {cap.description}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        {capabilitiesStep === 'ready' && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCapabilitiesStep('confirmed')}
                              className="rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90"
                            >
                              确认引入
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                // Back to step 2 — wipe appType so the
                                // effect re-runs when it's picked again.
                                setAppType('')
                              }}
                              className="ml-1 rounded-lg px-2 py-1.5 text-[12px] text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
                            >
                              上一步
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* step 4 — 用户标签. Same state machine as step 3,
                     only revealed once step 3 is confirmed. */}
                {appType && tagsStep !== 'idle' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)]/75">
                      <span className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-0)] px-1 text-[10px] font-medium text-[var(--color-ink)]/70">4</span>
                      <span>选择用户标签</span>
                      {tagsStep === 'confirmed' && (
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      )}
                    </div>
                    {tagsStep === 'loading' ? (
                      <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/45">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -3, 0], opacity: [0.35, 0.85, 0.35] }}
                            transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                            className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
                          />
                        ))}
                        <span className="ml-1">正在分析可推荐的用户标签…</span>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-2"
                      >
                        <p className="text-[11.5px] leading-[1.6] text-[var(--color-ink)]/55">
                          根据需求推荐以下标签（建议 3–5 个）
                        </p>
                        {(() => {
                          const locked = tagsStep === 'confirmed'
                          // Selected tags kept in recommended-first order,
                          // frozen on first render and never reshuffled.
                          const ordered = [...TAG_OPTIONS].sort((a, b) => {
                            const aRec = RECOMMENDED_TAGS.has(a.id) ? 0 : 1
                            const bRec = RECOMMENDED_TAGS.has(b.id) ? 0 : 1
                            return aRec - bRec
                          })
                          const selected = ordered.filter((t) => personalizationTags.has(t.id))
                          const remaining = ordered.filter((t) => !personalizationTags.has(t.id))
                          const removeTag = (id: string) => {
                            setPersonalizationTags((prev) => {
                              const next = new Set(prev)
                              next.delete(id)
                              return next
                            })
                            setFormSubmitted(false)
                          }
                          const addTag = (id: string) => {
                            setPersonalizationTags((prev) => {
                              const next = new Set(prev)
                              next.add(id)
                              return next
                            })
                            setFormSubmitted(false)
                          }
                          return (
                            <>
                              <div className="flex flex-wrap items-center gap-2">
                                {selected.map((t) => (
                                  <div key={t.id} className="group relative">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full bg-[var(--chat-form-option-bg)] py-1.5 pl-3 text-[13px] font-medium text-[var(--color-ink)] shadow-[0_1px_2px_rgba(16,18,24,0.04)] ${
                                        locked ? 'pr-3' : 'pr-1.5'
                                      }`}
                                    >
                                      {t.label}
                                      {!locked && (
                                        <button
                                          type="button"
                                          onClick={() => removeTag(t.id)}
                                          aria-label={`删除 ${t.label}`}
                                          className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-ink)]/40 transition-colors hover:bg-[var(--color-ink)]/[0.08] hover:text-[var(--color-ink)]/85"
                                        >
                                          <X size={10} strokeWidth={2.2} />
                                        </button>
                                      )}
                                    </span>
                                    <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-[200px] translate-y-1 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-2)] px-2.5 py-2 text-left text-[11.5px] leading-[1.5] text-[var(--color-ink)]/75 opacity-0 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.55)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                                      {t.hint}
                                    </div>
                                  </div>
                                ))}
                                {!locked && remaining.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setTagsAddOpen((v) => !v)}
                                    className={`inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1.5 text-[12px] transition-colors ${
                                      tagsAddOpen
                                        ? 'border-[var(--color-ink)]/35 bg-[var(--color-surface-0)] text-[var(--color-ink)]/85'
                                        : 'border-[var(--color-ink)]/20 bg-transparent text-[var(--color-ink)]/55 hover:border-[var(--color-ink)]/35 hover:text-[var(--color-ink)]/80'
                                    }`}
                                  >
                                    <Plus size={11} strokeWidth={2.2} />
                                    手动添加
                                  </button>
                                )}
                                {selected.length === 0 && locked && (
                                  <span className="text-[12px] text-[var(--color-ink)]/45">
                                    未选择标签
                                  </span>
                                )}
                              </div>
                              {!locked && tagsAddOpen && remaining.length > 0 && (
                                <div className="rounded-lg bg-[var(--color-surface-0)]/60 p-2.5 ring-1 ring-[var(--color-ink)]/10">
                                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-[var(--color-ink)]/55">
                                    <span>点击添加</span>
                                    <button
                                      type="button"
                                      onClick={() => setTagsAddOpen(false)}
                                      className="rounded p-0.5 text-[var(--color-ink)]/40 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {remaining.map((t) => (
                                      <div key={t.id} className="group relative">
                                        <button
                                          type="button"
                                          onClick={() => addTag(t.id)}
                                          className="inline-flex items-center gap-1 rounded-full bg-[var(--chat-form-option-bg)] px-3 py-1.5 text-[13px] text-[var(--color-ink)]/60 transition-colors hover:text-[var(--color-ink)]"
                                        >
                                          <Plus size={10} strokeWidth={2.2} className="text-[var(--color-ink)]/45" />
                                          {t.label}
                                        </button>
                                        <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-[200px] translate-y-1 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-2)] px-2.5 py-2 text-left text-[11.5px] leading-[1.5] text-[var(--color-ink)]/75 opacity-0 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.55)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                                          {t.hint}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )
                        })()}
                        {tagsStep === 'ready' && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setTagsStep('confirmed')}
                              className="rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90"
                            >
                              确认用户标签
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                // Back to step 3 — reopen the capability
                                // cards and collapse this step's state.
                                setCapabilitiesStep('ready')
                                setTagsStep('idle')
                                setTagsAddOpen(false)
                              }}
                              className="ml-1 rounded-lg px-2 py-1.5 text-[12px] text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
                            >
                              上一步
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {tagsStep === 'confirmed' && !formSubmitted && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFormSubmitted(true)
                        // Reveal the newly-scaffolded .agent/skills tree so the
                        // user can see the capabilities were wired up.
                        setExpandedDirs((prev) => {
                          const next = new Set(prev)
                          next.add('.agent')
                          next.add('.agent/skills')
                          for (const c of CAPABILITY_OPTIONS) {
                            if (enabledCapabilities.has(c.id)) {
                              next.add(`.agent/skills/${c.folderName}`)
                            }
                          }
                          return next
                        })
                        setFileTreeOpen(true)
                        // Scroll the chat to the bottom once the new messages
                        // (confirm bubble + AI response 2) render + finish
                        // their staggered entrance animation (~650ms delay).
                        requestAnimationFrame(() => {
                          const el = chatScrollRef.current
                          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
                        })
                        setTimeout(() => {
                          const el = chatScrollRef.current
                          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
                        }, 700)
                      }}
                      className="flex-1 rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90"
                    >
                      确认创建
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Reset the whole form back to step 1 so the user can
                        // redo scene / appType / capabilities / tags from scratch.
                        setScene('')
                        setAppType('')
                        setEnabledCapabilities(new Set())
                        setPersonalizationTags(new Set())
                        setCapabilitiesStep('idle')
                        setTagsStep('idle')
                        setTagsAddOpen(false)
                        setFormSubmitted(false)
                      }}
                      className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
                    >
                      重选
                    </button>
                  </div>
                )}
              </motion.div>

              {/* action icons */}
              <div className="flex items-center gap-2 pt-0.5">
                {[Copy, RefreshCw].map((Icon, i) => (
                  <button
                    key={i}
                    className="rounded-md p-1 text-[var(--color-ink)]/30 transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]/60"
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ── User message 2 (only appears after the form is submitted) ── */}
            {formSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-end"
            >
              <div className="max-w-[85%] rounded-[8px] rounded-br-none bg-[var(--bubble-me-bg)] px-3 py-2.5 text-[14px] leading-[20px] text-[var(--color-ink)]">
                确认创建
                {enabledCapabilities.size > 0 && ` · ${enabledCapabilities.size} 项能力`}
                {personalizationTags.size > 0 && ` · ${personalizationTags.size} 个用户标签`}
              </div>
            </motion.div>
            )}

            {/* ── AI response 2 ── */}
            {formSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2.5"
            >
              {/* status */}
              <button
                onClick={() => setTask2Open(!task2Open)}
                className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/50"
              >
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>已完成思考和工具调用</span>
                {task2Open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                已生成「第五人格 · 今日塔罗」小程序骨架，左侧预览先过一眼 👈
              </p>

              {/* Summary of what was wired up — matches the image's 已选择 /
                  已引入能力 / 用户标签 block. */}
              <div className="flex flex-col gap-1.5 rounded-xl bg-[var(--fill-subtle)] ring-1 ring-[var(--divider-soft)] px-3.5 py-3 text-[12px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <Check size={13} strokeWidth={2.5} className="mt-[3px] shrink-0 text-emerald-400" />
                  <span className="text-[var(--color-ink)]/85">
                    <span className="text-[var(--color-ink)]/50">已选择：</span>
                    {appType === 'ai-avatar' ? 'AI 分身' : appType === 'xiaohua' ? '小花技能' : '抖音小程序'}
                    {scene && (
                      <>
                        <span className="mx-1 text-[var(--color-ink)]/30">·</span>
                        {scene === 'feed'
                          ? 'Feed 主信息流'
                          : scene === 'comment-live'
                            ? '评论区'
                            : scene === 'private'
                              ? '私信群聊'
                              : '未定'}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-[3px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#74d4ff]" />
                  <span className="text-[var(--color-ink)]/85">
                    <span className="text-[var(--color-ink)]/50">已引入能力：</span>
                    {enabledCapabilities.size > 0
                      ? CAPABILITY_OPTIONS.filter((c) => enabledCapabilities.has(c.id))
                          .map((c) => c.title)
                          .join('、')
                      : '—'}
                  </span>
                </div>
                {personalizationTags.size > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="mt-[3px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#4c7cff]" />
                    <span className="text-[var(--color-ink)]/85">
                      <span className="text-[var(--color-ink)]/50">用户标签：</span>
                      {TAG_OPTIONS.filter((t) => personalizationTags.has(t.id))
                        .map((t) => t.label)
                        .join('、')}
                    </span>
                  </div>
                )}
              </div>

              {/* update summary — clicking opens the "变更详情" diff tab */}
              <button
                onClick={openChangesDetail}
                className="flex w-full items-center justify-between rounded-xl bg-[var(--fill-subtle)] ring-1 ring-[var(--divider-soft)] px-4 py-3 text-[13px] transition-colors hover:bg-[var(--fill-hover)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-ink)]/50">本次更新</span>
                  <span className="mx-1 h-3 w-px bg-[var(--color-ink)]/10" />
                  <span className="text-[var(--color-ink)]/70">修改 5 文件</span>
                  <span className="text-emerald-400">+109</span>
                  <span className="text-red-400">-77</span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-ink)]/30" />
              </button>

              {/* action icons */}
              <div className="flex items-center gap-2 pt-0.5">
                {[Copy, RotateCcw, ThumbsUp, ThumbsDown].map((Icon, i) => (
                  <button
                    key={i}
                    className="rounded-md p-1 text-[var(--color-ink)]/30 transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]/60"
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </motion.div>
            )}
            </>)}
            </>)}

            {/* ── 发布 flow turn — mirrors the needs-flow animation:
                 thinking indicator fades out, then scene selection fades
                 up with a small stagger. User's trigger message is
                 already shown via sentMessages above, so we don't
                 duplicate it here. ── */}
            {showChatPublish && (
              <div className="mt-4 space-y-4">
                {/* Thinking indicator */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 0.6, duration: 0.25 }}
                  className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/45"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -3, 0], opacity: [0.35, 0.85, 0.35] }}
                      transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
                    />
                  ))}
                  <span className="ml-1">AI 正在起草发布流程</span>
                </motion.div>

                {/* Step 1 — choose scenes */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2.5"
                >
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75, duration: 0.25 }}
                    className="text-[14px] leading-[20px] text-[var(--color-ink)]"
                  >
                    请告诉我你要发布到哪些场景
                  </motion.p>
                  <ChatFormCard delay={0.9}>
                    <ChatFormStep number={1} title="选择抖音场景">
                      <div className="flex flex-wrap gap-2">
                        {PUBLISH_SCENES.map((s) => {
                          const checked = publishScenes.includes(s)
                          const locked = publishStep !== 'select'
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={locked}
                              onClick={() => togglePublishScene(s)}
                              className={`rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                                checked
                                  ? 'bg-[var(--chat-form-option-bg)] font-medium text-[var(--color-ink)] shadow-[0_1px_2px_rgba(16,18,24,0.04)]'
                                  : 'bg-[var(--chat-form-option-bg)] text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]'
                              } ${locked ? 'cursor-default opacity-70' : ''}`}
                            >
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    </ChatFormStep>
                    {publishStep === 'select' && (
                      <ChatFormSubmit
                        onClick={submitPublish}
                        disabled={publishScenes.length === 0}
                      >
                        提交
                      </ChatFormSubmit>
                    )}
                  </ChatFormCard>
                </motion.div>

                {/* Step 2 — review summary */}
                {(publishStep === 'review' || publishStep === 'confirmed') && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2.5"
                  >
                    <button className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/50">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>任务已完成</span>
                    </button>
                    <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                      收到。请确认你的发布信息：
                    </p>
                    <ChatFormCard delay={0.3}>
                      <ChatFormStep number={1} title="应用账号">
                        <div className="flex items-center gap-2.5 rounded-lg bg-[var(--color-surface-0)] px-3 py-2 ring-1 ring-[var(--color-ink)]/10">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--fill-hover)] text-[var(--color-ink)]/80">
                            <Code2 size={14} />
                          </div>
                          <span className="truncate text-[12px] font-medium text-[var(--color-ink)]">
                            第五人格 · 今日塔罗
                          </span>
                        </div>
                      </ChatFormStep>
                      <ChatFormStep number={2} title="本次发布场景">
                        <div className="flex flex-col gap-1.5">
                          {publishScenes.map((s) => (
                            <div
                              key={s}
                              className="flex flex-col gap-0.5 rounded-lg bg-[var(--color-surface-0)] px-3 py-2 ring-1 ring-[var(--color-ink)]/10"
                            >
                              <span className="text-[12px] font-medium text-[var(--color-ink)]">{s}</span>
                              <span className="text-[10.5px] leading-[1.5] text-[var(--color-ink)]/55">
                                {PUBLISH_SCENE_DESCRIPTIONS[s] ?? '即将上线'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </ChatFormStep>
                      {publishStep === 'review' && (
                        <ChatFormSubmit onClick={confirmPublish}>
                          确认发布
                        </ChatFormSubmit>
                      )}
                    </ChatFormCard>
                  </motion.div>
                )}

                {/* Step 3 — final ack */}
                {publishStep === 'confirmed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2.5"
                  >
                    <button className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/50">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>任务已完成</span>
                    </button>
                    <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                      好的，已提交发布。发布记录可点击右上角查看。
                    </p>
                  </motion.div>
                )}
              </div>
            )}

          </div>

          {/* ── Composer — matches Figma Prompt Input: white card with
                subtle rainbow glow on top, p-3 rounded-[24px], compact
                32px input default, action row of pill buttons. Outer
                wrapper has mx-2.5 so the composer aligns with the
                message area (8px chat inner px + 10px composer mx matches
                the messages' px-2.5). When an inline proposal form is
                awaiting submission, the composer is swapped with a focus
                hint bar so the user has only one input target. ── */}
          <div className="mx-2.5 flex-shrink-0">
            {proposalFormPendingLabel ? (
              <div className="flex items-center gap-2 rounded-full bg-[var(--fill-subtle)] px-4 py-2 ring-1 ring-[var(--divider-soft)]">
                <FileText
                  size={12}
                  strokeWidth={1.8}
                  className="shrink-0 text-[var(--color-ink)]/55"
                />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--color-ink)]/65">
                  正在补充「
                  <span className="font-medium text-[var(--color-ink)]">
                    {proposalFormPendingLabel}
                  </span>
                  」表单 — 完成后 AI 继续推进
                </span>
              </div>
            ) : (
            <div className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-[var(--color-surface-0)] p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_10px_15px_-5px_rgba(0,0,0,0.05)]">
              {/* Top rainbow-tint blur decoration */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-4 blur-[20px]"
                style={{
                  backgroundImage:
                    'linear-gradient(0deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%), linear-gradient(95deg, rgba(255,186,51,0.1) 7.59%, rgba(78,217,44,0.1) 23.2%, rgba(69,146,242,0.1) 44.7%, rgba(110,124,253,0.1) 66.3%, rgba(225,53,248,0.1) 92.3%)',
                }}
              />

              {/* Input area — default 32px tall, grows with content up
                  to ~160px (8 lines) then scrolls internally. */}
              <div className="relative flex min-h-[32px] items-center pl-2">
                <div
                  ref={chatInputRef}
                  contentEditable="plaintext-only"
                  suppressContentEditableWarning
                  role="textbox"
                  aria-multiline
                  data-placeholder="请输入，@ 引用资源"
                  onInput={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    const val = el.innerText
                    setChatDraft(val)
                    // Detect "@" at the caret — check the character
                    // before the caret's position in the active text node.
                    const sel = window.getSelection()
                    if (!sel || sel.rangeCount === 0) return
                    const node = sel.focusNode
                    const offset = sel.focusOffset
                    if (node && node.nodeType === Node.TEXT_NODE && offset > 0) {
                      const char = (node.textContent ?? '')[offset - 1]
                      if (char === '@') {
                        openMentionPicker()
                        return
                      }
                    }
                    // Close the picker if the most-recent '@' in the
                    // draft is no longer a valid mention prefix (e.g.
                    // whitespace slipped in).
                    if (mentionAnchor) {
                      const lastAt = val.lastIndexOf('@')
                      if (lastAt < 0 || /\s/.test(val.slice(lastAt))) {
                        setMentionAnchor(null)
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && mentionAnchor) {
                      setMentionAnchor(null)
                      return
                    }
                    if (e.key === 'Enter' && !e.shiftKey && !mentionAnchor) {
                      e.preventDefault()
                      sendChat()
                    }
                  }}
                  className="chat-editable thin-scroll block max-h-[160px] min-h-0 w-full overflow-y-auto bg-transparent text-[14px] leading-[20px] text-[var(--color-ink)] outline-none"
                />
              </div>

              {/* Action row */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={openResourceLibraryPage}
                    className="flex h-8 items-center gap-1 rounded-full border border-[var(--divider)] px-3 text-[13px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                  >
                    <Library size={14} strokeWidth={1.8} />
                    资源
                  </button>
                  <button
                    type="button"
                    aria-label="附件"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--divider)] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                  >
                    <Paperclip size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    aria-label="Figma"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--divider)] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                  >
                    <FigmaIcon size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                  >
                    Auto
                    <ChevronDown size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    aria-label="发送"
                    onClick={() => sendChat()}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-ink-contrast)] transition-all hover:-translate-y-[1px] hover:opacity-90"
                  >
                    <ArrowUp size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
          </div>
          </div>
          {/* @mention picker — fixed positioning lets it escape the chat
               column stacking, anchored to the composer via anchor rect. */}
          <MentionPicker
            open={!!mentionAnchor}
            anchor={mentionAnchor}
            skills={mentionSkills}
            tools={mentionTools}
            files={mentionFiles}
            triggers={mentionTriggers}
            resources={mentionResources}
            onInsert={insertMention}
            onClose={() => setMentionAnchor(null)}
            onOpenResourceLibrary={openResourceLibraryPage}
          />
          {/* Right-edge drag handle — only in platform layout for now. Sits
               straddling the chat/preview boundary with a 4px touch area. */}
          {isPlatform && (
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={onChatDragStart}
              onPointerMove={onChatDragMove}
              onPointerUp={onChatDragEnd}
              onPointerCancel={onChatDragEnd}
              className="group absolute right-0 top-0 bottom-0 z-10 w-1 translate-x-1/2 cursor-col-resize touch-none select-none"
            >
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
            </div>
          )}
        </aside>
        )}

        {layout === 'editor' && (
          <>
            {/* ────── Editor layout: 左侧常驻手机 + 中间文件编辑 ────── */}
            <div
              className="relative flex shrink-0 flex-col items-center px-6 pt-6 pb-8"
              style={{ width: previewColumnWidth }}
            >
              {/* Segment control above phone (IP editor 样式) — web-app
                   projects swap it for a browser address bar. */}
              <div
                className={`flex shrink-0 items-center gap-6 pb-10 ${
                  activeProjectKind === 'web-app' ? 'w-full' : ''
                }`}
              >
                {activeProjectKind === 'web-app'
                  ? addressBar
                  : filters.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={`relative text-[13px] font-medium tracking-wide transition-colors ${
                          f.value === activeFilter
                            ? 'text-[var(--color-ink)]'
                            : 'text-[var(--color-ink)]/35 hover:text-[var(--color-ink)]/65'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
              </div>
              {/* Phone + ambient glow */}
              <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    background: `
                      radial-gradient(260px 340px at 50% 50%, ${rgbString(c1, 1)} 0%, ${rgbString(c1, 0)} 75%),
                      radial-gradient(200px 260px at 36% 60%, ${rgbString(c2, 0.55)} 0%, ${rgbString(c2, 0)} 78%),
                      radial-gradient(180px 220px at 64% 40%, ${rgbString(c2, 0.55)} 0%, ${rgbString(c2, 0)} 78%),
                      radial-gradient(140px 160px at 52% 46%, ${rgbString(c1, 0.35)} 0%, ${rgbString(c1, 0)} 82%)
                    `,
                    filter: 'blur(48px) saturate(1.2)',
                  }}
                />
                <div className="relative z-10 flex min-h-0 w-full flex-1">
                  {previewSurface}
                </div>
              </div>
              {/* Actions below the phone */}
              <div className="@container mt-8 flex w-full shrink-0 items-center justify-center gap-1">
                {[
                  {
                    label: '重新加载',
                    icon: RefreshCw,
                    onClick: () => setMiniAppKey((k) => k + 1),
                  },
                  { label: '真机预览', icon: Smartphone },
                  { label: '发布', icon: Upload },
                ].map(({ label, icon: Icon, onClick }) => (
                  <button
                    key={label}
                    title={label}
                    onClick={onClick}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]/85"
                  >
                    <Icon size={11} strokeWidth={1.8} />
                    <span className="hidden @[280px]:inline">{label}</span>
                  </button>
                ))}
              </div>
              {triggerSimBar && (
                <div className="mt-2 flex w-full shrink-0 justify-center">
                  {triggerSimBar}
                </div>
              )}
            </div>

            {/* Drag handle to resize the preview column */}
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={onPreviewColDragStart}
              onPointerMove={onPreviewColDragMove}
              onPointerUp={onPreviewColDragEnd}
              className="group/divider relative flex w-[6px] shrink-0 cursor-col-resize items-center justify-center border-r border-[var(--divider-soft)] transition-colors hover:border-[var(--divider)]"
            >
              <span className="pointer-events-none absolute top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-full bg-white/0 transition-colors group-hover/divider:bg-[var(--fill-strong)]" />
            </div>

            {/* Middle: file editor */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {/* Tab bar — only code file tabs + filetree toggle */}
              <div className="flex h-10 shrink-0 items-center gap-0 overflow-x-auto border-b border-[var(--divider-soft)]">
                <button
                  onClick={() => setFileTreeOpen((v) => !v)}
                  className={`flex h-full w-10 shrink-0 items-center justify-center transition-colors ${
                    fileTreeOpen
                      ? 'bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]/70'
                      : 'text-[var(--color-ink)]/30 hover:text-[var(--color-ink)]/60'
                  }`}
                  title="项目文件"
                >
                  <FolderOpen size={15} />
                </button>
                {openTabs
                  .map((t, origIdx) => ({ tab: t, origIdx }))
                  .filter(({ tab }) => tab.closable)
                  .map(({ tab, origIdx }) => {
                    const isActive = origIdx === activePreviewTab
                    return (
                      <button
                        key={`${tab.label}-${origIdx}`}
                        onClick={() => setActivePreviewTab(origIdx)}
                        className={`flex h-full shrink-0 items-center gap-1.5 border-r border-[var(--divider-soft)] pl-4 pr-3 text-[13px] whitespace-nowrap transition-colors ${
                          isActive
                            ? 'bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]/90'
                            : 'text-[var(--color-ink)]/35 hover:bg-[var(--color-ink)]/[0.03] hover:text-[var(--color-ink)]/55'
                        }`}
                      >
                        {tab.label}
                        <span
                          onClick={(e) => { e.stopPropagation(); closeTab(origIdx) }}
                          className="ml-1 rounded p-0.5 text-[11px] text-[var(--color-ink)]/25 hover:bg-[var(--color-ink)]/10 hover:text-[var(--color-ink)]/50"
                        >
                          <X size={11} />
                        </span>
                      </button>
                    )
                  })}
              </div>

              {/* filetree + code content */}
              <div className="flex min-h-0 flex-1 overflow-hidden">
                {fileTreeOpen && (
                  <div className="relative shrink-0" style={{ width: fileTreeWidth }}>
                    <div className="thin-scroll flex h-full flex-col overflow-y-auto border-r border-[var(--divider-soft)] bg-[var(--color-surface-0)]/50 py-2">
                      <FileTreeView
                        nodes={projectTrees[projectTitle] ?? fileTree}
                        expanded={expandedDirs}
                        onToggleDir={toggleDir}
                        onOpenFile={openFileInTab}
                        depth={0}
                        parentPath=""
                      />
                    </div>
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      onPointerDown={onFileTreeDragStart}
                      onPointerMove={onFileTreeDragMove}
                      onPointerUp={onFileTreeDragEnd}
                      onPointerCancel={onFileTreeDragEnd}
                      className="group absolute right-0 top-0 bottom-0 z-10 w-1 translate-x-1/2 cursor-col-resize touch-none select-none"
                    >
                      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
                    </div>
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  {(() => {
                    const activeTab = openTabs[activePreviewTab]
                    if (!activeTab || !activeTab.closable) {
                      return (
                        <div className="flex flex-1 items-center justify-center text-[12px] text-[var(--color-ink)]/30">
                          从左侧文件目录打开一个文件
                        </div>
                      )
                    }
                    const label = activeTab.label
                    if (label === DIFF_TAB_LABEL) {
                      return (
                        <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px] text-[var(--color-ink)]/35">
                          切回"工作区"布局查看变更详情
                        </div>
                      )
                    }
                    return (
                      <>
                        <div className="flex shrink-0 items-center bg-[var(--color-surface-0)]/50 px-4 py-1.5">
                          <span className="font-mono text-[11px] text-[var(--color-ink)]/40">
                            {label}
                          </span>
                        </div>
                        <div className="thin-scroll flex-1 overflow-y-auto bg-[var(--color-surface-0)]/50 p-0">
                          <table className="w-full border-collapse font-mono text-[13px] leading-6">
                            <tbody>
                              {(codeFiles[label]?.lines ?? []).map((line) => (
                                <tr key={line.num} className="group hover:bg-[var(--color-ink)]/[0.03]">
                                  <td className="w-12 shrink-0 select-none pr-4 text-right text-[var(--color-ink)]/35 group-hover:text-[var(--color-ink)]/55">
                                    {line.num}
                                  </td>
                                  <td className="whitespace-pre">
                                    {line.tokens.length === 0 ? (
                                      <span>&nbsp;</span>
                                    ) : (
                                      line.tokens.map((t, j) => (
                                        <span key={j} className={t.color}>{t.text}</span>
                                      ))
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </>
        )}

        {layout === 'code' && (
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden pb-5 pr-5">
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-[16px] bg-[var(--color-surface-0)]">
            {/* ────── Code layout: 左侧对话(透明) · 中间文件编辑 · 右侧常驻手机 ────── */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {/* Tab bar — file tabs + file tree toggle */}
              <div className="flex h-10 shrink-0 items-center gap-0 overflow-x-auto border-b border-[var(--code-divider)]">
                <button
                  onClick={() => setFileTreeOpen((v) => !v)}
                  className={`flex h-full w-10 shrink-0 items-center justify-center transition-colors ${
                    fileTreeOpen
                      ? 'text-[var(--color-ink)]/80'
                      : 'text-[var(--color-ink)]/30 hover:text-[var(--color-ink)]/60'
                  }`}
                  title="项目文件"
                >
                  <FolderOpen size={15} />
                </button>
                {openTabs
                  .map((t, origIdx) => ({ tab: t, origIdx }))
                  .filter(({ tab }) => tab.closable)
                  .map(({ tab, origIdx }) => {
                    const isActive = origIdx === activePreviewTab
                    return (
                      <button
                        key={`${tab.label}-${origIdx}`}
                        onClick={() => setActivePreviewTab(origIdx)}
                        className={`flex h-full shrink-0 items-center gap-1.5 border-r border-[var(--code-divider)] pl-4 pr-3 text-[13px] whitespace-nowrap transition-colors ${
                          isActive
                            ? 'bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]/90'
                            : 'text-[var(--color-ink)]/35 hover:bg-[var(--color-ink)]/[0.03] hover:text-[var(--color-ink)]/55'
                        }`}
                      >
                        {tab.label}
                        <span
                          onClick={(e) => { e.stopPropagation(); closeTab(origIdx) }}
                          className="ml-1 rounded p-0.5 text-[11px] text-[var(--color-ink)]/25 hover:bg-[var(--color-ink)]/10 hover:text-[var(--color-ink)]/50"
                        >
                          <X size={11} />
                        </span>
                      </button>
                    )
                  })}
              </div>

              {/* File tree + code content */}
              <div className="flex min-h-0 flex-1 overflow-hidden">
                {fileTreeOpen && (
                  <div className="relative shrink-0" style={{ width: fileTreeWidth }}>
                    <div className="thin-scroll flex h-full flex-col overflow-y-auto border-r border-[var(--code-divider)] py-2">
                      <FileTreeView
                        nodes={projectTrees[projectTitle] ?? fileTree}
                        expanded={expandedDirs}
                        onToggleDir={toggleDir}
                        onOpenFile={openFileInTab}
                        depth={0}
                        parentPath=""
                      />
                    </div>
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      onPointerDown={onFileTreeDragStart}
                      onPointerMove={onFileTreeDragMove}
                      onPointerUp={onFileTreeDragEnd}
                      onPointerCancel={onFileTreeDragEnd}
                      className="group absolute right-0 top-0 bottom-0 z-10 w-1 translate-x-1/2 cursor-col-resize touch-none select-none"
                    >
                      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
                    </div>
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  {(() => {
                    const activeTab = openTabs[activePreviewTab]
                    if (!activeTab || !activeTab.closable) {
                      return (
                        <div className="flex flex-1 items-center justify-center text-[12px] text-[var(--color-ink)]/30">
                          从左侧文件目录打开一个文件
                        </div>
                      )
                    }
                    const label = activeTab.label
                    if (label === DIFF_TAB_LABEL) {
                      return (
                        <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px] text-[var(--color-ink)]/35">
                          切回"工作区"布局查看变更详情
                        </div>
                      )
                    }
                    return (
                      <>
                        <div className="flex shrink-0 items-center px-4 py-1.5">
                          <span className="font-mono text-[11px] text-[var(--color-ink)]/40">
                            {label}
                          </span>
                        </div>
                        <div className="thin-scroll flex-1 overflow-y-auto p-0">
                          <table className="w-full border-collapse font-mono text-[13px] leading-6">
                            <tbody>
                              {(codeFiles[label]?.lines ?? []).map((line) => (
                                <tr key={line.num} className="group hover:bg-[var(--color-ink)]/[0.03]">
                                  <td className="w-12 shrink-0 select-none pr-4 text-right text-[var(--color-ink)]/35 group-hover:text-[var(--color-ink)]/55">
                                    {line.num}
                                  </td>
                                  <td className="whitespace-pre">
                                    {line.tokens.length === 0 ? (
                                      <span>&nbsp;</span>
                                    ) : (
                                      line.tokens.map((t, j) => (
                                        <span key={j} className={t.color}>{t.text}</span>
                                      ))
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Divider between middle editor and right preview — 1px line on a 6px grab target */}
            <div
              role="separator"
              aria-orientation="vertical"
              onPointerDown={onPreviewColDragStart}
              onPointerMove={onPreviewColDragMove}
              onPointerUp={onPreviewColDragEnd}
              className="group/divider relative w-[6px] shrink-0 cursor-col-resize"
            >
              <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--divider)] transition-colors group-hover/divider:bg-[var(--color-ink)]/20" />
            </div>

            {/* Right: 常驻手机预览 */}
            <div
              className="relative flex shrink-0 flex-col items-center px-6 pt-4 pb-6"
              style={{ width: previewColumnWidth }}
            >
              {/* Segment pill: 小程序 / 技能 — web-app projects swap it
                   for a browser address bar. */}
              {activeProjectKind === 'web-app' ? (
                <div className="flex w-full shrink-0">{addressBar}</div>
              ) : (
                <div className="flex shrink-0 items-center rounded-full bg-[var(--fill-subtle)] p-1">
                  {filters.map((f) => {
                    const active = f.value === activeFilter
                    return (
                      <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={`rounded-full px-4 py-1 text-[12px] font-medium tracking-wide transition-colors ${
                          active
                            ? 'bg-[var(--fill-strong)] text-[var(--color-ink)] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]'
                            : 'text-[var(--color-ink)]/45 hover:text-[var(--color-ink)]/80'
                        }`}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Phone mockup — no ambient glow in code layout */}
              <div className="relative mt-5 flex min-h-0 w-full flex-1 items-center justify-center">
                <div className="relative z-10 flex min-h-0 w-full flex-1">
                  {previewSurface}
                </div>
              </div>

              {/* Bottom actions */}
              <div className="mt-5 flex w-full shrink-0 items-center justify-center gap-2">
                {[
                  {
                    label: '重新加载',
                    icon: RefreshCw,
                    onClick: () => setMiniAppKey((k) => k + 1),
                  },
                  { label: '真机预览', icon: Smartphone },
                ].map(({ label, icon: Icon, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] text-[var(--color-ink)]/55 transition-colors hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]/85"
                  >
                    <Icon size={11} strokeWidth={1.8} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              {triggerSimBar && (
                <div className="mt-2 flex w-full shrink-0 justify-center">
                  {triggerSimBar}
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {isPlatform && platformHomeOpen && (
          <PlatformHome
            draft={homeDraft}
            setDraft={setHomeDraft}
            onSubmit={submitFromHome}
          />
        )}

        {isPlatform && platformResourceLibraryOpen && (
          <div className="mt-3 mb-3 mr-3 flex min-h-0 flex-1 overflow-hidden rounded-[16px]">
            <ResourceLibraryView
              selectedPrimary={resourceLibraryPrimary}
              selectedSecondary={resourceLibrarySecondary}
              selectedCapability={resourceLibraryCapability}
              expandedPrimary={resourceLibraryExpanded}
              searchQuery={resourceLibrarySearch}
              typeFilter={resourceLibraryTypeFilter}
              onTogglePrimary={toggleResourceLibraryExpanded}
              onSelectCategory={(p, s) => {
                setResourceLibraryPrimary(p)
                setResourceLibrarySecondary(s)
                setResourceLibraryCapability(null)
              }}
              onSelectCapability={setResourceLibraryCapability}
              onSearchChange={setResourceLibrarySearch}
              onTypeFilterChange={setResourceLibraryTypeFilter}
              onUseCapabilityInChat={useCapabilityInChat}
              onOpenProject={(name) => {
                setProjectTitle(name)
                handleNewSession()
                setPlatformHomeOpen(false)
                setPlatformResourceLibraryOpen(false)
                setResourceLibraryCapability(null)
                setPlatformSkillsOpen(false)
                setPlatformCreativeSquareOpen(false)
                setPlatformDataOpsOpen(false)
                setActivePreviewTab(0)
              }}
            />
          </div>
        )}

        {isPlatform && platformSkillsOpen && (
          <div className="mt-3 mb-3 mr-3 flex min-h-0 flex-1 overflow-hidden rounded-[16px]">
            <PlatformPlaceholderView
              icon={FolderCode}
              title="Skills"
              description="个人 Skill 工作台 — 在这里管理你创建的能力，发布到资源库供团队复用。"
            />
          </div>
        )}

        {isPlatform && platformCreativeSquareOpen && (
          <div className="mt-3 mb-3 mr-3 flex min-h-0 flex-1 overflow-hidden rounded-[16px]">
            <PlatformPlaceholderView
              icon={Home}
              title="创意广场"
              description="看看其他业务方在 VibeCoding 里搭了什么 — 复刻热门项目，碰撞新的灵感。"
            />
          </div>
        )}

        {isPlatform && platformDataOpsOpen && (
          <div className="mt-3 mb-3 mr-3 flex min-h-0 flex-1 overflow-hidden rounded-[16px]">
            <PlatformPlaceholderView
              icon={BarChart3}
              title="数据运营"
              description="项目的运行指标、曝光 / 转化 / 留存看板都在这里 — 接入数据后追踪上线后的表现。"
            />
          </div>
        )}

        <AnimatePresence>
        {(layout === 'workspace' ||
          (isPlatform && !platformHomeOpen && !platformSecondaryPageOpen)) &&
          // No artefact yet → no X header / panel either. Covers both
          // proposal flow's initial empty state and the game flow during
          // confirm/build (openTabs is seeded only when generation
          // finishes). User-collapsed state also folds the panel away.
          openTabs.length > 0 &&
          !previewCollapsed && (
          <motion.div
            key="preview-pane"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 min-w-0 flex-1"
          >

        {/* ────── Right: Preview Panel. Platform lives inside a shared
             card (painted by the fixed card frame). The preview occupies
             the right half of that card, so it just needs right/bottom
             margin to align with the card's interior; the rounded/ring
             come from the card frame. ────── */}
        <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${isPlatform ? 'mb-3 mr-3 overflow-hidden rounded-br-[16px]' : ''}`}>
          {/* ══════ X Header — single row: tab strip on the left, 发布 +
              utility icons on the right. The previous double-layer setup
              has been collapsed into one toolbar — tab-specific actions
              (编辑 / 重新加载) live as small overlays on the content
              below so this header stays consistent across tabs. ══════ */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--divider-soft)] px-2">
            <div className="tab-scroll flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {openTabs.map((tab, i) => {
                const isActive = i === activePreviewTab || (!tab.closable && productPinned)
                return (
                  <button
                    key={`${tab.label}-${i}`}
                    onClick={() => setActivePreviewTab(i)}
                    className={`flex h-7 shrink-0 items-center gap-1 rounded-md px-2.5 text-[12.5px] whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[var(--color-ink)]/[0.07] text-[var(--color-ink)]/90'
                        : 'text-[var(--color-ink)]/50 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/80'
                    }`}
                  >
                    {tab.label}
                    {tab.closable && (
                      <span
                        onClick={(e) => { e.stopPropagation(); closeTab(i) }}
                        className="ml-0.5 rounded p-0.5 text-[10px] text-[var(--color-ink)]/25 hover:bg-[var(--color-ink)]/10 hover:text-[var(--color-ink)]/50"
                      >
                        <X size={10} />
                      </span>
                    )}
                  </button>
                )
              })}
              <div className="relative" ref={addTabMenuRef}>
                <button
                  type="button"
                  onClick={() => setAddTabMenuOpen((v) => !v)}
                  title="添加标签"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                    addTabMenuOpen
                      ? 'bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]/85'
                      : 'text-[var(--color-ink)]/40 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/75'
                  }`}
                >
                  <Plus size={13} strokeWidth={1.8} />
                </button>
                {addTabMenuOpen && (() => {
                  /* Build the dropdown items dynamically from whatever
                   * the current project's product view exposes — so the
                   * + menu always mirrors the left-sidebar leaves for
                   * the active project. Clicking a row dispatches
                   * through openFileInTab, which knows how to route
                   * each kind (web-game → switch tab; ai-avatar →
                   * structured panel; mini-program → named tab). Top-
                   * level dirs are flattened one level so e.g.
                   * 知识库/技能 entries show as individual rows.
                   *
                   * Rendered via a portal because the parent .tab-scroll
                   * container forces overflow-y: auto (browser
                   * compensation for overflow-x: auto), which would
                   * otherwise clip an absolute-positioned dropdown. */
                  const tree = projectTrees[projectTitle]
                  if (!tree) return null
                  const kind = PROJECT_KINDS[projectTitle] ?? 'mini-program'
                  const productTree =
                    kind === 'ai-avatar'
                      ? buildAvatarProductView(tree, getAvatarConfig(projectTitle))
                      : kind === 'mini-program'
                        ? buildMiniProgramProductView(tree, getMiniProgramConfig(projectTitle))
                        : buildProductView(tree, kind)
                  const flat: { label: string; parent?: string }[] = []
                  for (const node of productTree) {
                    if (node.type === 'file') {
                      flat.push({ label: node.name })
                    } else if (node.children?.length) {
                      for (const child of node.children) {
                        if (child.type === 'file') {
                          flat.push({ label: child.name, parent: node.name })
                        }
                      }
                    } else {
                      flat.push({ label: node.name })
                    }
                  }
                  if (flat.length === 0) return null
                  if (!addTabMenuRef.current) return null
                  const r = addTabMenuRef.current.getBoundingClientRect()
                  return createPortal(
                    <div
                      style={{ position: 'fixed', top: r.bottom + 4, left: r.left }}
                      className="z-50 min-w-[180px] max-w-[260px] overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] py-1 shadow-[0_12px_28px_-8px_rgba(16,18,24,0.2)]"
                    >
                      {flat.map((item) => (
                        <button
                          key={`${item.parent ?? ''}/${item.label}`}
                          type="button"
                          onClick={() => {
                            setAddTabMenuOpen(false)
                            openFileInTab(item.label)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12.5px] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]"
                        >
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.parent && (
                            <span className="shrink-0 text-[10.5px] text-[var(--color-ink)]/40">
                              {item.parent}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>,
                    document.body,
                  )
                })()}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  resetPublish()
                  startPublish('modal')
                }}
                className="flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[12px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
                title="发布"
              >
                <Upload size={11} strokeWidth={2} />
                发布
              </button>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setFileTreeOpen((v) => !v)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                    fileTreeOpen
                      ? 'bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]/80'
                      : 'text-[var(--color-ink)]/45 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/75'
                  }`}
                  title="项目文件"
                >
                  <FolderOpen size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCollapsed(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/75"
                  title="收起产物预览"
                >
                  <PanelRightOpen size={13} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Content area: tab content (left) + optional file tree (right) ── */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {(() => {
            const previewToolbar = (
                <div className="@container flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-2">
                  {activeProjectKind === 'web-app' ? (
                    addressBar
                  ) : activeProjectKind === 'web-game' ? (
                    // Web-game: left side shows the current product's
                    // name with a chevron — clicking opens a dropdown of
                    // all products (every non-closable tab) so the user
                    // can switch surface without reaching for the tab
                    // strip. Closable on-demand tabs (e.g. opened code
                    // files) are filtered out.
                    (() => {
                      const activeLabel = openTabs[activePreviewTab]?.label ?? ''
                      const isAssetsTab = activeLabel === '素材'
                      // Both 游戏预览 and 素材 just label their surface
                      // — switching between them is the job of the tab
                      // strip above. No dropdown needed.
                      return (
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-1 text-[13px] font-medium text-[var(--color-ink)]">
                            {activeLabel || '产物'}
                          </span>
                          {isAssetsTab && (
                            <>
                              <button
                                type="button"
                                title="分类筛选"
                                onClick={() => setAssetPanelOpen((v) => !v)}
                                className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                                  assetPanelOpen
                                    ? 'bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]/85'
                                    : 'text-[var(--color-ink)]/55 hover:bg-[var(--color-ink)]/[0.05] hover:text-[var(--color-ink)]/80'
                                }`}
                              >
                                <ListFilter size={13} strokeWidth={1.8} />
                              </button>
                              <AssetStatsLine activeCategory={assetCategoryFilter} />
                            </>
                          )}
                        </div>
                      )
                    })()
                  ) : (
                    <div className="flex items-center gap-6">
                      {filters.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setActiveFilter(f.value)}
                          className={`relative text-[13px] font-medium tracking-wide transition-colors ${
                            f.value === activeFilter
                              ? 'text-[var(--color-ink)]'
                              : 'text-[var(--color-ink)]/35 hover:text-[var(--color-ink)]/65'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {activeProjectKind === 'web-game' && (
                      <button
                        title="可视化编辑"
                        onClick={() => setEditPanelOpen((v) => !v)}
                        className={`flex items-center gap-0 rounded-lg border px-2 py-1.5 text-[12px] transition-colors @[520px]:gap-1.5 @[520px]:px-3 ${
                          editPanelOpen
                            ? 'border-[var(--color-ink)]/25 bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]'
                            : 'border-[var(--color-ink)]/8 text-[var(--color-ink)]/60 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
                        }`}
                      >
                        <Wand2 size={13} />
                        <span className="hidden @[520px]:inline">编辑</span>
                      </button>
                    )}
                    {[
                      {
                        label: '重新加载',
                        icon: RefreshCw,
                        onClick: () => setMiniAppKey((k) => k + 1),
                      },
                      { label: '真机预览', icon: Smartphone },
                      { label: '发布', icon: Upload },
                    ].map(({ label, icon: Icon, onClick }) => (
                      <button
                        key={label}
                        title={label}
                        onClick={onClick}
                        className="flex items-center gap-0 rounded-lg border border-[var(--color-ink)]/8 px-2 py-1.5 text-[12px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] @[520px]:gap-1.5 @[520px]:px-3"
                      >
                        <Icon size={13} />
                        <span className="hidden @[520px]:inline">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
            )
            const phoneView = (
              <>
                {previewToolbar}

                {/* phone mockup area — product-color ambient glow is dark-
                     mode-only (in light mode it bloomed into pastel halos
                     that washed out the dot grid on either side of the
                     phone). Light mode keeps just the dot grid + phone. */}
                <div
                  className={`relative flex min-h-0 flex-1 overflow-hidden ${
                    activeProjectKind === 'web-app' || activeProjectKind === 'web-game' ? '' : 'pt-6 pb-12'
                  }`}
                >
                  {themeMode === 'dark' && activeProjectKind !== 'web-app' && activeProjectKind !== 'web-game' && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-0"
                      style={{
                        background: `
                          radial-gradient(260px 340px at 50% 50%, ${rgbString(c1, 1)} 0%, ${rgbString(c1, 0)} 75%),
                          radial-gradient(200px 260px at 36% 60%, ${rgbString(c2, 0.55)} 0%, ${rgbString(c2, 0)} 78%),
                          radial-gradient(180px 220px at 64% 40%, ${rgbString(c2, 0.55)} 0%, ${rgbString(c2, 0)} 78%),
                          radial-gradient(140px 160px at 52% 46%, ${rgbString(c1, 0.35)} 0%, ${rgbString(c1, 0)} 82%)
                        `,
                        filter: 'blur(48px) saturate(1.2)',
                      }}
                    />
                  )}
                  {/* Dot grid — theme-aware via --color-ink-10. Hidden for
                       web-app + web-game: those previews are full-bleed. */}
                  {activeProjectKind !== 'web-app' && activeProjectKind !== 'web-game' && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-[1]"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 1px 1px, var(--color-ink-10) 1px, transparent 1.5px)',
                        backgroundSize: '16px 16px',
                      }}
                    />
                  )}
                  <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                    <div className="flex min-h-0 flex-1">
                      {previewSurface}
                    </div>
                    {triggerSimBar && (
                      <div className="mt-2 flex w-full shrink-0 justify-center">
                        {triggerSimBar}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )

            // Right-side preview dispatcher. Artifact-shape projects
            // don't have a dedicated 产物总览 view — each generated artefact
            // becomes its own non-closable tab via the proposalDocs effect,
            // and the right pane is hidden entirely until at least one
            // exists. So the dispatcher just falls back to the phone view
            // for non-artifact shapes.
            const productView = phoneView

            const diffAddText = themeMode === 'light' ? 'text-emerald-700' : 'text-emerald-200'
            const diffRemoveText = themeMode === 'light' ? 'text-red-700' : 'text-red-200'
            const diffAddAccent = themeMode === 'light' ? 'text-emerald-600' : 'text-emerald-400'
            const diffRemoveAccent = themeMode === 'light' ? 'text-red-600' : 'text-red-400'
            const diffAddBg = themeMode === 'light' ? 'bg-emerald-500/[0.12]' : 'bg-emerald-500/[0.08]'
            const diffRemoveBg = themeMode === 'light' ? 'bg-red-500/[0.12]' : 'bg-red-500/[0.08]'
            const diffView = (
              <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]/50">
                {/* summary */}
                <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--divider-soft)] bg-[var(--color-surface-1)]/85 px-4 py-2 backdrop-blur-sm">
                  <span className="text-[12px] text-[var(--color-ink)]/60">
                    变更 {FILE_DIFFS.length} 个文件
                  </span>
                  <span className={`font-mono text-[11px] ${diffAddAccent}`}>
                    +{FILE_DIFFS.reduce((s, f) => s + f.added, 0)}
                  </span>
                  <span className={`font-mono text-[11px] ${diffRemoveAccent}`}>
                    -{FILE_DIFFS.reduce((s, f) => s + f.removed, 0)}
                  </span>
                </div>
                {FILE_DIFFS.map((file, fi) => (
                  <div key={fi} className="border-b border-[var(--divider-soft)] last:border-none">
                    <div className="sticky top-[37px] z-10 flex items-center justify-between border-b border-[var(--divider-soft)] bg-[var(--color-surface-1)]/80 px-4 py-1.5 backdrop-blur-sm">
                      <span className="font-mono text-[12px] text-[var(--color-ink)]/80">
                        {file.path}
                      </span>
                      <span className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={diffAddAccent}>+{file.added}</span>
                        <span className={diffRemoveAccent}>-{file.removed}</span>
                      </span>
                    </div>
                    <table className="w-full border-collapse font-mono text-[12px] leading-5">
                      <tbody>
                        {file.lines.map((line, li) => {
                          const bg =
                            line.kind === 'add'
                              ? diffAddBg
                              : line.kind === 'remove'
                                ? diffRemoveBg
                                : line.kind === 'hunk'
                                  ? 'bg-[var(--fill-subtle)]'
                                  : ''
                          const sign =
                            line.kind === 'add'
                              ? '+'
                              : line.kind === 'remove'
                                ? '-'
                                : line.kind === 'hunk'
                                  ? '@'
                                  : ' '
                          const textColor =
                            line.kind === 'add'
                              ? diffAddText
                              : line.kind === 'remove'
                                ? diffRemoveText
                                : line.kind === 'hunk'
                                  ? 'text-[var(--color-ink)]/45'
                                  : 'text-[var(--color-ink)]/70'
                          return (
                            <tr key={li} className={bg}>
                              <td className="w-10 shrink-0 select-none pl-3 pr-1 text-right text-[var(--color-ink)]/20">
                                {line.oldNum ?? ''}
                              </td>
                              <td className="w-10 shrink-0 select-none pr-2 text-right text-[var(--color-ink)]/20">
                                {line.newNum ?? ''}
                              </td>
                              <td
                                className={`w-5 shrink-0 select-none text-center ${
                                  line.kind === 'add'
                                    ? diffAddAccent
                                    : line.kind === 'remove'
                                      ? diffRemoveAccent
                                      : 'text-[var(--color-ink)]/30'
                                }`}
                              >
                                {sign}
                              </td>
                              <td className={`whitespace-pre pr-4 ${textColor}`}>
                                {line.text}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )

            const codeView = (label: string) => (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex shrink-0 items-center bg-[var(--color-surface-0)]/50 px-4 py-1.5">
                  <span className="font-mono text-[11px] text-[var(--color-ink)]/40">
                    {label}
                  </span>
                </div>
                <div className="thin-scroll flex-1 overflow-y-auto bg-[var(--color-surface-0)]/50 p-0">
                  <table className="w-full border-collapse font-mono text-[13px] leading-6">
                    <tbody>
                      {(codeFiles[label]?.lines ?? []).map((line) => (
                        <tr key={line.num} className="group hover:bg-[var(--color-ink)]/[0.03]">
                          <td className="w-12 shrink-0 select-none pr-4 text-right text-[var(--color-ink)]/35 group-hover:text-[var(--color-ink)]/55">
                            {line.num}
                          </td>
                          <td className="whitespace-pre">
                            {line.tokens.length === 0 ? (
                              <span>&nbsp;</span>
                            ) : (
                              line.tokens.map((t, j) => (
                                <span key={j} className={t.color}>{t.text}</span>
                              ))
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )

            const renderTab = (label: string) => {
              if (label === DIFF_TAB_LABEL) return diffView
              const trigger = triggers.find((t) => triggerTabLabel(t) === label)
              if (trigger) {
                return (
                  <TriggerDetailView
                    trigger={trigger}
                    editingName={editingTriggerNameId === trigger.id}
                    onStartEditName={() => setEditingTriggerNameId(trigger.id)}
                    onStopEditName={() => setEditingTriggerNameId(null)}
                    onRename={renameTrigger}
                    onDelete={deleteTrigger}
                  />
                )
              }
              // Proposal-flow visual dashboards: render the rich BI view
              // instead of a markdown doc.
              if (label === '人群诊断看板' && label in proposalDocs) {
                return <ProposalAudienceDashboard />
              }
              // Proposal-flow markdown artefacts: render via MarkdownView
              // so the file reads as a real document rather than tokenized
              // source code.
              if (label.endsWith('.md') && proposalDocs[label]) {
                return (
                  <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
                    <div className="mx-auto flex w-full max-w-[760px] flex-col px-8 py-8">
                      <MarkdownView source={proposalDocs[label]} />
                    </div>
                  </div>
                )
              }
              // AI 分身 product-view sections — config-driven structured
              // tabs (basic-info form / persona-prompt doc / capability
              // detail), opened from the avatar product view.
              const avatarConfig = getAvatarConfig(projectTitle)
              if (avatarConfig) {
                if (label === '基础信息') {
                  return <AvatarBasicInfoForm config={avatarConfig} />
                }
                if (label === '人设指令') {
                  return (
                    <AvatarSystemPromptView
                      avatarName={avatarConfig.name}
                      prompt={avatarConfig.systemPrompt}
                    />
                  )
                }
                if (label.startsWith('知识·') || label.startsWith('技能·')) {
                  const isKnow = label.startsWith('知识·')
                  const itemName = label.slice(3)
                  const isTool =
                    !isKnow &&
                    avatarConfig.toolInfoList.some((t) => t.name === itemName)
                  const capability: Capability = {
                    type: isKnow ? 'knowledge' : isTool ? 'tool' : 'skill',
                    name: itemName,
                  }
                  const platform: Resource = {
                    id: `avatar-${avatarConfig.appID}`,
                    name: avatarConfig.name,
                    description: avatarConfig.description,
                    primaryCategory: '空间',
                    secondaryCategory: avatarConfig.name,
                    capabilities: [],
                  }
                  return (
                    <CapabilityDetailView
                      capability={capability}
                      platform={platform}
                      embedded
                    />
                  )
                }
              }
              // 小程序 product-view sections — config-driven structured
              // tabs (agent / settings / asset grid).
              const miniProgramConfig = getMiniProgramConfig(projectTitle)
              if (miniProgramConfig) {
                if (label === '智能体') {
                  return <MiniProgramAgentView config={miniProgramConfig} />
                }
                if (label === '小程序设置') {
                  return <MiniProgramSettingsForm config={miniProgramConfig} />
                }
                if (label === '静态素材') {
                  return <AssetGridView assets={miniProgramConfig.assets} />
                }
              }
              return codeView(label)
            }

            if (productPinned) {
              const codeLabel =
                activePreviewTab > 0
                  ? openTabs[activePreviewTab].label
                  : openTabs[1]?.label
              const leftIsProduct = productSide === 'left'
              /* splitRatio is the LEFT column's width ratio — dragging the
               * divider right always widens the left column regardless of
               * which side the product is on. */
              const leftPercent = splitRatio * 100
              const productCol = (
                <div className="flex min-w-0 flex-col overflow-hidden" style={{ width: `${leftIsProduct ? leftPercent : 100 - leftPercent}%` }}>
                  {productView}
                </div>
              )
              const codeCol = (
                <div className="flex min-w-0 flex-col overflow-hidden" style={{ width: `${leftIsProduct ? 100 - leftPercent : leftPercent}%` }}>
                  {codeLabel ? (
                    renderTab(codeLabel)
                  ) : (
                    <div className="grid flex-1 place-items-center text-[12px] text-[var(--color-ink)]/30">
                      从上方打开一个文件以查看代码
                    </div>
                  )}
                </div>
              )
              return (
                <div ref={splitContainerRef} className="flex min-h-0 flex-1 overflow-hidden">
                  {leftIsProduct ? productCol : codeCol}
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    onPointerDown={onDividerPointerDown}
                    onPointerMove={onDividerPointerMove}
                    onPointerUp={onDividerPointerUp}
                    onPointerCancel={onDividerPointerUp}
                    className="group relative w-1 shrink-0 cursor-col-resize touch-none select-none"
                  >
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--fill-hover)] transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
                  </div>
                  {leftIsProduct ? codeCol : productCol}
                </div>
              )
            }

            // Dispatch by the active tab's label. The synthetic 产物预览
            // tab still falls through to productView (phone/AI-avatar);
            // game projects use 预览 / 资产 / 代码 as their fixed tabs.
            // Every other tab — code files, MD artefacts, dashboards —
            // routes through renderTab, which knows how to render each
            // kind from its filename.
            const activeLabel = openTabs[activePreviewTab]?.label
            if (activeProjectKind === 'web-game') {
              if (activeLabel === '游戏预览') return productView
              if (activeLabel === '素材')
                return (
                  <>
                    {previewToolbar}
                    <GarudaAssetsView
                      panelOpen={assetPanelOpen}
                      activeCategory={assetCategoryFilter}
                      onSelectCategory={setAssetCategoryFilter}
                    />
                  </>
                )
              if (activeLabel === '代码')
                return (
                  <>
                    {previewToolbar}
                    <GarudaCodeView />
                  </>
                )
            }
            return activeLabel === '产物预览'
              ? productView
              : activeLabel
                ? renderTab(activeLabel)
                : null
          })()}

          {/* ── Console panel ── */}
          <AnimatePresence>
            {consoleOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: consoleHeight }}
                exit={{ height: 0 }}
                transition={{ duration: consoleDragRef.current ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="relative shrink-0 overflow-hidden border-t border-[var(--divider-soft)]"
              >
                {/* drag handle — top edge */}
                <div
                  role="separator"
                  aria-orientation="horizontal"
                  onPointerDown={onConsoleDragStart}
                  onPointerMove={onConsoleDragMove}
                  onPointerUp={onConsoleDragEnd}
                  onPointerCancel={onConsoleDragEnd}
                  className="group absolute inset-x-0 top-0 z-20 h-1 cursor-row-resize touch-none select-none"
                >
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
                </div>
                <div className="flex h-full flex-col bg-[var(--color-surface-0)]/50">
                  {/* console header */}
                  <button
                    onClick={() => setConsoleOpen(!consoleOpen)}
                    className="flex h-8 shrink-0 items-center gap-1.5 border-b border-[var(--divider-soft)] px-4 text-[12px] text-[var(--color-ink)]/50 hover:text-[var(--color-ink)]/70"
                  >
                    控制台
                    <ChevronDown size={12} />
                  </button>

                  {/* console output */}
                  <div className="thin-scroll flex-1 overflow-y-auto p-3 font-[var(--font-mono)] text-[12px] leading-5">
                    {consoleLines.map((line, i) => (
                      <div key={i}>
                        {line.kind === 'cmd' && (
                          <span className="text-[var(--color-ink)]/50">{line.text}</span>
                        )}
                        {line.kind === 'info' && (
                          <span className="text-sky-400">{line.text}</span>
                        )}
                        {line.kind === 'success' && (
                          <span className="text-emerald-400">{line.text}</span>
                        )}
                        {line.kind === 'log' && (
                          <span className="text-[var(--color-ink)]/70">{line.text}</span>
                        )}
                        {line.kind === 'warn' && (
                          <span className="text-amber-400">{line.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* console toggle when closed — float button */}
          {!consoleOpen && (
            <button
              onClick={() => setConsoleOpen(true)}
              title="展开控制台"
              className="absolute bottom-3 left-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-2)]/85 text-[var(--color-ink)]/60 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors hover:text-[var(--color-ink)]"
            >
              <Terminal size={13} strokeWidth={1.8} />
            </button>
          )}
          </div>

          {fileTreeOpen && (
            <div className="relative shrink-0" style={{ width: fileTreeWidth }}>
              <div className="thin-scroll flex h-full flex-col overflow-y-auto border-l border-[var(--divider-soft)] bg-[var(--color-surface-0)]/50">
                {/* ── Section 1 — 对话上下文 (referenced skills / knowledge) ── */}
                <div className="shrink-0">
                  <button
                    onClick={() => setContextSectionOpen((v) => !v)}
                    className="flex w-full items-center gap-1.5 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink)]/55 transition-colors hover:text-[var(--color-ink)]/85"
                  >
                    {contextSectionOpen ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                    <span>对话上下文</span>
                    <span className="ml-auto text-[10px] text-[var(--color-ink)]/35">
                      {CAPABILITY_OPTIONS.filter((c) => enabledCapabilities.has(c.id)).length}
                    </span>
                  </button>
                  {contextSectionOpen && (
                    <div className="space-y-0.5 px-2 pb-2">
                      {CAPABILITY_OPTIONS.filter((c) => enabledCapabilities.has(c.id)).map((cap) => (
                        <div
                          key={cap.id}
                          className="flex items-start gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors hover:bg-[var(--color-ink)]/[0.04]"
                        >
                          <span className="mt-px shrink-0 rounded bg-[var(--fill-hover)] px-1.5 py-[1px] font-mono text-[9.5px] text-[var(--color-ink)]/65">
                            {cap.kind === 'skill' ? 'Skill' : 'KB'}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[var(--color-ink)]/85">
                            {cap.title}
                          </span>
                        </div>
                      ))}
                      {CAPABILITY_OPTIONS.filter((c) => enabledCapabilities.has(c.id)).length === 0 && (
                        <div className="px-2 py-1.5 text-[11px] text-[var(--color-ink)]/35">
                          暂无引用
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="mx-3 border-t border-[var(--divider-soft)]" />

                {/* ── Section 2 — 项目代码库 (file tree) ── */}
                <div className="flex min-h-0 flex-1 flex-col">
                  <button
                    onClick={() => setProjectSectionOpen((v) => !v)}
                    className="flex shrink-0 w-full items-center gap-1.5 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink)]/55 transition-colors hover:text-[var(--color-ink)]/85"
                  >
                    {projectSectionOpen ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                    <span>项目代码库</span>
                  </button>
                  {projectSectionOpen && (
                    <div className="min-h-0 flex-1 py-1">
                      <FileTreeView
                        nodes={projectTrees[projectTitle] ?? fileTree}
                        expanded={expandedDirs}
                        onToggleDir={toggleDir}
                        onOpenFile={openFileInTab}
                        depth={0}
                        parentPath=""
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* drag handle — left edge (tree sits on the right now, so
                   pulling the handle left widens it). */}
              <div
                role="separator"
                aria-orientation="vertical"
                onPointerDown={onFileTreeDragStart}
                onPointerMove={(e) => {
                  const state = fileTreeDragRef.current
                  if (!state) return
                  const next = Math.min(480, Math.max(160, state.startWidth - (e.clientX - state.startX)))
                  setFileTreeWidth(next)
                }}
                onPointerUp={onFileTreeDragEnd}
                onPointerCancel={onFileTreeDragEnd}
                className="group absolute left-0 top-0 bottom-0 z-10 w-1 -translate-x-1/2 cursor-col-resize touch-none select-none"
              >
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
              </div>
            </div>
          )}

          {/* ── Edit panel — web-game projects only. Slides in to the
               right of the preview surface (and to the right of the file
               tree if both open) with a left-edge drag handle. ── */}
          {activeProjectKind === 'web-game' && editPanelOpen && (
            <div className="relative shrink-0 border-l border-[var(--divider-soft)]" style={{ width: editPanelWidth }}>
              <GarudaEditPanel onClose={() => setEditPanelOpen(false)} />
              <div
                role="separator"
                aria-orientation="vertical"
                onPointerDown={onEditPanelDragStart}
                onPointerMove={onEditPanelDragMove}
                onPointerUp={onEditPanelDragEnd}
                onPointerCancel={onEditPanelDragEnd}
                className="group absolute left-0 top-0 bottom-0 z-10 w-1 -translate-x-1/2 cursor-col-resize touch-none select-none"
              >
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[var(--color-ink)]/20 group-active:bg-[var(--color-ink)]/30" />
              </div>
            </div>
          )}
          </div>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* ── Pin menu popover (fixed, so it escapes the tab bar overflow clip) ── */}
      {pinMenuOpen && (
        <span
          ref={pinMenuRef}
          style={{ position: 'fixed', top: pinMenuPos.top, left: pinMenuPos.left, zIndex: 60 }}
          className="flex min-w-[140px] flex-col overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-2)] shadow-[0_20px_50px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl"
        >
          <span
            role="button"
            onClick={() => {
              setProductPinned(true)
              setProductSide('left')
              setPinMenuOpen(false)
            }}
            className={`flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-[var(--fill-soft)] ${
              productPinned && productSide === 'left'
                ? 'text-[var(--color-ink)]'
                : 'text-[var(--color-ink)]/70'
            }`}
          >
            <PanelLeft size={12} />
            钉在左侧
            {productPinned && productSide === 'left' && (
              <span className="ml-auto text-[10px] text-[var(--color-ink)]/45">当前</span>
            )}
          </span>
          <span
            role="button"
            onClick={() => {
              setProductPinned(true)
              setProductSide('right')
              setPinMenuOpen(false)
            }}
            className={`flex items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-[var(--fill-soft)] ${
              productPinned && productSide === 'right'
                ? 'text-[var(--color-ink)]'
                : 'text-[var(--color-ink)]/70'
            }`}
          >
            <PanelRight size={12} />
            钉在右侧
            {productPinned && productSide === 'right' && (
              <span className="ml-auto text-[10px] text-[var(--color-ink)]/45">当前</span>
            )}
          </span>
          {productPinned && (
            <>
              <span className="mx-2 my-0.5 h-px bg-[var(--fill-hover)]" />
              <span
                role="button"
                onClick={() => {
                  setProductPinned(false)
                  setPinMenuOpen(false)
                }}
                className="flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]"
              >
                <X size={12} />
                取消固定
              </span>
            </>
          )}
        </span>
      )}
    </motion.div>
  )
}

/** Generic AI reply block — shows a brief thinking indicator (which
 *  unmounts once faded so it doesn't claim a space-y slot), then the
 *  reply text. Kept as its own component so each message can own its
 *  own "thinking" lifecycle without a parent-level Set of timers. */
function GenericAiReply({ text }: { text: string }) {
  const [thinking, setThinking] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setThinking(false), 900)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="space-y-2.5">
      {thinking && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.25 }}
          className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]/45"
        >
          {[0, 1, 2].map((k) => (
            <motion.span
              key={k}
              animate={{ y: [0, -3, 0], opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 0.9, delay: k * 0.15, repeat: Infinity, ease: 'easeInOut' }}
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
            />
          ))}
          <span className="ml-1">AI 正在回复</span>
        </motion.div>
      )}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-[14px] leading-[20px] text-[var(--color-ink)]"
      >
        {text}
      </motion.p>
    </div>
  )
}

/** Rotating reply bank for plain (non-trigger) chat messages. Picked by
 *  index so repeated sends still feel varied without needing a real
 *  language model. */
const GENERIC_AI_REPLIES = [
  '好的，我记下了这个需求。可以再告诉我具体的使用场景或期望结果，这样我可以帮你精准地搭建。',
  '收到。为了给出更贴合的方案，你能补充一下目标用户、触发时机和数据来源吗？',
  '好，我先整理下你的想法。建议把它拆成更小的步骤说给我听，我会按步骤接着往下做。',
  '明白了。如果方便，可以直接描述一下理想中的最终产出形态，比如一个页面、一段接口或一份内容。',
]

const CHAT_EMPTY_SUGGESTIONS = [
  '我想做一个第五人格主题的塔罗运势小程序',
  '做个每日打卡小程序',
  '换套更神秘的配色',
  '给卡片加上翻面动效',
  '再写两个塔罗牌面',
]

/** AI-avatar project suggestions — each phrase matches the trigger
 *  pattern-match in `sendChat` so clicking one immediately kicks off
 *  the recognition flow. */
const AI_AVATAR_CHAT_SUGGESTIONS = [
  '当用户关注时发送"欢迎关注"',
  '用户评论后回复"谢谢留言"',
  '用户点赞后发送"感谢点赞"',
  '用户送礼物时答谢"感谢礼物"',
  '用户投稿时推荐"新作品上线"',
]

function ChatEmptyState({
  suggestions,
  onPick,
}: {
  suggestions: string[]
  onPick: (text: string) => void
}) {
  const themeMode = useThemeStore((s) => s.mode)
  const isLight = themeMode === 'light'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-full flex-col items-center justify-center gap-8 px-3 text-center"
    >
      <div className="relative z-0 flex h-14 w-14 items-center justify-center">
        {/* Halo glow PNG behind the logo. Rendered only in dark mode —
             the light panel doesn't need it and the PNG's dark backdrop
             reads like an ink blot there. */}
        {!isLight && (
          <motion.img
            src="/bg/chat-empty-halo.png"
            alt=""
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          <LogoIconSpinOnce className="h-14 w-14 text-[var(--color-ink)]" />
        </motion.div>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <h2 className="text-[20px] font-medium leading-[24px] text-[var(--color-ink)]">
          嗨，我是你的 AI 助理
        </h2>
        <p className="text-[14px] leading-[24px] text-[var(--color-ink)]/60">
          你可以让我改改小程序，下面这些都可以直接试试
        </p>
      </div>
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
            whileHover={{ y: -1 }}
            className="rounded-full bg-[var(--fill-subtle)] px-[13px] py-[7px] text-[11px] leading-[16.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            {s}
          </motion.button>
        ))}
      </div>
      <PublishFlowModal />
    </motion.div>
  )
}
