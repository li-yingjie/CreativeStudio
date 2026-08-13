import { useEffect, useMemo, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import {
  AppWindow,
  ArrowUpRight,
  Bot,
  Brush,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  FolderCode,
  Gamepad2,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Megaphone,
  MonitorPlay,
  MoreHorizontal,
  Palette,
  Plus,
  Presentation,
  Puzzle,
  RefreshCw,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  X,
} from '@/shared/icons'
import ChatComposer from '@/shared/components/ChatComposer'
import { WORKSHOP_SKILLS } from '@/modules/editor/data/skills-library'
import {
  useNavVersion,
  usesStandaloneWorkshopLayout,
} from '@/shared/storage/nav-version'
import AsciiTexture from './AsciiTexture'
import InterestCardShowcase from './InterestCardShowcase'
import { XIAHUA_TEMPLATE_TOKEN } from './XiahuaBuildScript'

/* ─── AI 工坊首页 — 方案 7 按 Figma 探索 490:13302 实现 ───
 *
 * 结构：hero 椭圆图片簇 + 标题 → 输入框 → 灵感需求 chips
 * → 分类 tab → 灵感作品网格（hover 出「做同款」）。 */

/** 顶部椭圆图片簇 —— 直接用 AI 平台 (ai_design) 线上那张 hero ring：
 *  同一个构图，但带磨砂玻璃质感（Figma 单节点导出会把左下那颗渲染成
 *  生硬的深色照片，跟画板里看到的不一样）。尺寸/定位也照搬它的
 *  .heroRing：945 宽、top -24、居中。 */
const HERO_RING = '/assets/workshop/hero-ring.webp'

const INSPIRE = '/assets/workshop/inspire'

const PLACEHOLDER = '说说你想做什么，例如：生成一套炉石风格的游戏卡牌'

/** 选中态主色（抖音蓝）。 */
const BLUE = '#1664FF'
const INTEREST_CARD_ICON = '/assets/workshop/xinquka.svg'
const SCENE_TRANSITION = { duration: 0.16, ease: 'easeOut' as const }

/** 快捷入口。选中后工具条只留这枚蓝色入口，后面跟该类型的下拉槽位
 *  （豆包那套交互）：第一个槽是做什么，后面是参数。 */
/** 已存成活动模板的那个活动 —— 营销活动入口的「模板」槽位里选它。 */
const TEMPLATE_OPTION = '夯爆了 · 集卡 H5 模板'

const TOOLS = [
  {
    key: 'card',
    label: '兴趣卡模板',
    Icon: ImageIcon,
    iconSrc: INTEREST_CARD_ICON,
    placeholder: '说说你的兴趣卡，例如：第五人格主题的塔罗运势兴趣卡',
    params: [],
  },
  {
    key: 'marketing',
    label: '营销活动',
    Icon: LayoutTemplate,
    placeholder: '说说你的活动，例如：做一个新春抽奖 H5，红金国风主视觉',
    params: [
      { label: '活动形态', options: ['H5 活动页', '原生化活动页'] },
      // 存过的活动模板挂在这里：选中之后按模板换素材换玩法生成新活动
      { label: '模板', options: ['选择模板', TEMPLATE_OPTION] },
    ],
  },
  {
    key: 'design',
    label: '设计素材',
    Icon: Palette,
    placeholder: '说说你要的素材，例如：一张国风金龙主题的活动 KV',
    params: [
      { label: '素材类型', options: ['海报', '资源位图片', '活动 KV', '直播间背景'] },
      { label: '比例', options: ['1:1', '3:4', '16:9', '9:16'] },
      { label: '风格', options: ['通用', '国风', '赛博', '手绘'] },
      { label: '数量', options: ['×1', '×2', '×4'] },
    ],
  },
  {
    key: 'game',
    label: '游戏素材',
    Icon: Gamepad2,
    placeholder: '说说你要的游戏素材，例如：一套 8 帧的像素小人跑步精灵帧',
    params: [
      {
        label: '素材类型',
        options: ['精灵帧动画', '序列帧特效', '游戏卡牌', '角色立绘', '场景原画', '道具图标', 'UI 图标'],
      },
      { label: '画风', options: ['像素', '二次元', '卡通', '写实'] },
      { label: '帧数', options: ['4 帧', '8 帧', '12 帧', '单图'] },
      { label: '交付', options: ['精灵图集', '逐帧序列', 'PNG 透明底'] },
    ],
  },
  /* ── 以下收在「更多」里 ── */
  {
    key: 'web-game',
    label: '网页游戏',
    Icon: Puzzle,
    more: true,
    placeholder: '说说你的小游戏，例如：一个新春主题的三消，竖屏、60 秒一局',
    params: [
      { label: '玩法', options: ['三消', '跑酷', '答题', '塔防'] },
      { label: '屏幕', options: ['竖屏', '横屏'] },
      { label: '单局时长', options: ['60 秒', '3 分钟', '不限'] },
      { label: '排行榜', options: ['带排行榜', '无排行榜'] },
    ],
  },
  {
    key: 'mini-program',
    label: '小程序',
    Icon: Smartphone,
    more: true,
    placeholder: '说说你的小程序，例如：一个粉丝专属的周边预约小程序',
    params: [
      { label: '类型', options: ['工具', '内容', '电商', '服务预约'] },
      { label: '页面数', options: ['3 页', '5 页', '8 页'] },
      { label: '登录', options: ['需登录', '免登录'] },
      { label: '数据库', options: ['带数据库', '无数据库'] },
    ],
  },
  {
    key: 'ai-avatar',
    label: 'AI 分身',
    Icon: Bot,
    more: true,
    placeholder: '说说你的分身，例如：一个替我回私信的游戏区达人分身',
    params: [
      { label: '人设', options: ['专业', '亲和', '幽默'] },
      { label: '声音', options: ['声音克隆', '女声', '男声'] },
      { label: '回复长度', options: ['简短', '适中', '详细'] },
      { label: '接管场景', options: ['私信', '评论', '直播'] },
    ],
  },
  {
    key: 'ops-proposal',
    label: '运营提案',
    Icon: Presentation,
    more: true,
    placeholder: '说说你的提案，例如：暑期游戏区涨粉活动的策划案',
    params: [
      { label: '提案类型', options: ['活动策划', '内容规划', '增长复盘'] },
      { label: '篇幅', options: ['一页纸', '3 页', '完整方案'] },
      { label: '数据', options: ['带数据', '不带数据'] },
      { label: '交付', options: ['文档', '幻灯片'] },
    ],
  },
] as const

type Tool = (typeof TOOLS)[number]

/** 工具条上平铺的入口；其余收进「更多」。 */
const PRIMARY_TOOLS = TOOLS.filter((t) => !('more' in t))
const MORE_TOOLS = TOOLS.filter((t) => 'more' in t)

const SUGGESTIONS = [
  '生成第五人格主题的塔罗运势兴趣卡',
  '生成同城咖啡点单兴趣卡',
  '制作 MBTI 心理测验',
  '写脚本定时爬取热榜',
  '长视频自动提取逐字稿',
  '看评测视频生成对比兴趣卡',
]

const TABS = [
  '全网灵感',
  '海报',
  '资源位图片',
  '活动KV',
  '直播间背景',
  '游戏卡牌',
  '游戏角色',
  'H5活动页',
  '原生化活动页',
  '兴趣卡模板',
]

type StandaloneSceneKey =
  | 'marketing'
  | 'game'
  | 'activity-assets'
  | 'game-assets'

interface StandaloneToolbarParam {
  label: string
  options: readonly string[]
}

interface StandaloneSubscene {
  key: string
  label: string
  disabled?: boolean
  Icon?: typeof LayoutTemplate
  iconSrc?: string
  iconClassName?: string
  prompt: string
  placeholder: string
  commands: readonly string[]
  toolbarParams?: readonly StandaloneToolbarParam[]
}

interface H5InstructionSlots {
  theme: string
  audience: string
  submission: string
  gameplay: string
}

interface CreativePosterInstructionSlots {
  styleImage: string
  sourceDocument: string
}

interface PlanningInstructionSlots {
  documentLink: string
  activityBrief: string
  requirements: string
}

interface ResourceSlotInstructionSlots {
  referenceImage: string
  deliverables: string
}

type SlotInstructionKey =
  | 'h5'
  | 'creative-poster'
  | 'planning'
  | 'resource-slot'

type HomeLayoutVariant = 'scheme-1' | 'scheme-2'

const DEFAULT_H5_INSTRUCTION_SLOTS: H5InstructionSlots = {
  theme: '美妆相关',
  audience: '女性用户',
  submission: '美妆教学',
  gameplay:
    '消耗积分抽奖，1% 概率获得 iPhone 手机，10% 概率获得活动红包奖励，19% 概率获得迪奥口红实体奖励；单层非晋级榜单玩法设置两个榜单规则，tab1 名称为「开播上榜」，完成直播间开播时长 1 分钟获得 1 积分，积分上限为 99，tab2 名称为「获粉上榜」，每新增 2 个粉丝增加 1 积分，积分上限为 99',
}

const H5_SLOT_COMMAND = '生成美妆 H5 活动页'
const CREATIVE_POSTER_SLOT_COMMAND = '参考素材生成创意海报'
const PLANNING_SLOT_COMMAND = '参考文档生成活动策划'
const RESOURCE_SLOT_COMMAND = '基于参考图生成资源位'

const DEFAULT_CREATIVE_POSTER_INSTRUCTION_SLOTS: CreativePosterInstructionSlots = {
  styleImage: '',
  sourceDocument: '',
}

const DEFAULT_PLANNING_INSTRUCTION_SLOTS: PlanningInstructionSlots = {
  documentLink: '',
  activityBrief: '语音厅 1 月 29 日—2 月 2 日开展的全主播层级刺激营收活动',
  requirements:
    '需要根据营收划分 3 个赛道。需要注意有主播玩法及用户嘉宾玩法。针对嘉宾有礼物收集的牵引。活动特点：活动周期会有平台上线的马年专属 IP 线上礼物。我们想要耦合这个打赏礼物，进行特定礼物收集。如果可以请你给我一些其他输入，关于活动语音厅玩法结合的、功能结合的，或者是丰富赛制的（例如：晋级、任务、多层榜单）。',
}

const DEFAULT_RESOURCE_SLOT_INSTRUCTION_SLOTS: ResourceSlotInstructionSlots = {
  referenceImage: '图 1',
  deliverables:
    '竖版 KV、横版 KV、原生活动页头图、话题 Banner、话题头图、话题背景图',
}

function valueOrPlaceholder(value: string, placeholder: string) {
  return value.trim() || `「${placeholder}」`
}

function buildH5Instruction(slots: H5InstructionSlots) {
  return `生成一个${slots.theme}的 H5 活动页，针对${slots.audience}，投稿内容为${slots.submission}，需要包含玩法：${slots.gameplay}`
}

function buildCreativePosterInstruction(slots: CreativePosterInstructionSlots) {
  return `参考这个海报${valueOrPlaceholder(slots.styleImage, '插入图像')}的风格，生成这个文档${valueOrPlaceholder(slots.sourceDocument, '插入文档')}的创意海报`
}

function buildPlanningInstruction(slots: PlanningInstructionSlots) {
  return `请参考文档${valueOrPlaceholder(slots.documentLink, '粘贴文档 link')}逻辑，帮我生成一个${slots.activityBrief}策划文档。其他需遵循信息：${slots.requirements}`
}

function buildResourceSlotInstruction(slots: ResourceSlotInstructionSlots) {
  return `基于${valueOrPlaceholder(slots.referenceImage, '插入图像')}生成${slots.deliverables}`
}

/** 运营活动子场景；选中后原位进入对应快捷指令。 */
const STANDALONE_SUBSCENES: readonly StandaloneSubscene[] = [
  {
    key: 'lynx',
    label: '互动活动',
    iconSrc: '/assets/workshop/quick-commands/wallet-05.svg',
    iconClassName: 'left-[0.64px] top-[0.75px] h-[10.25px] w-[10.72px]',
    prompt: '互动活动',
    placeholder: '请描述你想搭建的互动活动',
    commands: [
      '集卡抽奖',
      '节日会场',
      '直播互动',
      '测评答题',
      '榜单投票',
      '年度盘点',
      '体育赛事',
    ],
  },
  {
    key: 'h5',
    label: 'H5 活动',
    iconSrc: '/assets/workshop/quick-commands/phone-02.svg',
    iconClassName: 'left-[2px] top-[0.5px] h-[11px] w-[8px]',
    prompt: 'H5 活动',
    placeholder: '请描述你想制作的 H5 活动',
    toolbarParams: [
      { label: '页面结构', options: ['单页', '多页面'] },
      { label: '画面方向', options: ['竖屏', '横屏'] },
    ],
    commands: [
      H5_SLOT_COMMAND,
      '生成品牌集卡活动页',
      '搭建限时签到任务页',
      '设计新品预约活动 H5',
    ],
  },
  {
    key: 'native',
    label: '原生化活动',
    iconSrc: '/assets/workshop/quick-commands/flag-02.svg',
    iconClassName: 'left-[1.5px] top-[0.5px] h-[11px] w-[9px]',
    prompt: '原生化活动',
    placeholder: '请描述你想搭建的原生化活动',
    toolbarParams: [
      { label: '页面结构', options: ['单页', '多页面'] },
      { label: '登录方式', options: ['需登录', '免登录'] },
    ],
    commands: [
      '搭建热点事件互动会场',
      '生成站内任务激励活动',
      '制作内容征集活动页',
      '设计粉丝等级成长活动',
    ],
  },
  {
    key: 'creative-poster',
    label: '活动海报',
    Icon: Palette,
    prompt: '活动海报',
    placeholder: '请描述你想制作的活动海报',
    commands: [
      CREATIVE_POSTER_SLOT_COMMAND,
      '制作活动主视觉海报',
      '生成获奖名单海报',
      '设计活动收官海报',
    ],
    toolbarParams: [
      { label: '比例', options: ['3:4', '9:16', '1:1'] },
      { label: '风格', options: ['通用', '国风', '赛博', '手绘'] },
    ],
  },
]

interface StandaloneSceneCase {
  id: string
  title: string
  description: string
  cover: string
  author: string
  avatar: string
  views: number
  prompt: string
}

interface StandaloneScene {
  key: StandaloneSceneKey
  label: string
  description: string
  Icon: typeof LayoutTemplate
  /** 设计稿自带的图标（图标库里没有的形状），用 mask 上色跟随选中态。 */
  iconSrc?: string
  hero: string
  heroDetails: readonly [string, string, string]
  heroEffects: readonly [string, string, string]
  placeholder: string
  cases: readonly StandaloneSceneCase[]
}

/** 三枚主视觉原图在 Figma 945 × 272 Hero 画布中的精确位置。 */
const STANDALONE_HERO_DETAIL_FRAMES = [
  'left-[276.85px] top-[55.06px] h-[131.07px] w-[131.06px]',
  'left-[408.5px] top-[12px] size-[128px]',
  'left-[548.8px] top-[65.82px] size-[107.94px]',
] as const

const STANDALONE_HERO_EFFECT_FRAMES = [
  'left-[273.93px] top-[52.09px] size-[137.27px]',
  'left-[413.35px] top-[17.59px] h-[120.02px] w-[119.32px]',
  'left-[548.47px] top-[65.74px] size-[108.53px]',
] as const

/** 内部工作台的四类核心场景；入口、输入和案例共用同一份配置。 */
const STANDALONE_BASE_SCENES: readonly StandaloneScene[] = [
  {
    key: 'marketing',
    label: '运营活动',
    description: '活动策划与互动落地',
    Icon: Megaphone,
    hero: '/assets/workshop/figma-scenes/hero-marketing.png?v=2',
    heroDetails: [
      '/assets/workshop/figma-scenes/details/hero-marketing-doll.png',
      '/assets/workshop/figma-scenes/details/hero-marketing-music.png',
      '/assets/workshop/figma-scenes/details/hero-marketing-cyber.png',
    ],
    heroEffects: [
      '/assets/workshop/figma-scenes/details/hero-marketing-doll-glow.svg',
      '/assets/workshop/figma-scenes/details/hero-marketing-music-glow.svg',
      '/assets/workshop/figma-scenes/details/hero-marketing-cyber-glow.svg',
    ],
    placeholder: '请描述你的需求',
    cases: [
      {
        id: 'marketing-star-plan',
        title: '[Magicx]星芒欢颜计划',
        description: '活动主视觉与任务玩法一体化方案',
        cover: '/assets/workshop/figma-scenes/marketing-star-plan.png?v=2',
        author: '雒文谕',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-marketing-magicx.png',
        views: 26,
        prompt: '参考 [Magicx]星芒欢颜计划，帮我生成一套同类型活动',
      },
      {
        id: 'marketing-butterfly',
        title: '夏日蝶影季',
        description: '夏日主题积分任务与抽奖活动',
        cover: '/assets/workshop/figma-scenes/marketing-butterfly.png?v=2',
        author: '雒文谕',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-marketing-butterfly.png',
        views: 5,
        prompt: '参考夏日蝶影季，帮我生成一套夏日主题互动活动',
      },
      {
        id: 'marketing-host-mission',
        title: '主播专属任务榜单',
        description: '主播任务激励与实时榜单活动',
        cover: '/assets/workshop/figma-scenes/marketing-host-mission.png?v=2',
        author: '杜彦霖',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-marketing-host.png',
        views: 0,
        prompt: '参考主播专属任务榜单，帮我设计一套主播激励活动',
      },
      {
        id: 'marketing-musician',
        title: '商演乐手开播计划',
        description: '音乐人开播招募与任务激励活动',
        cover: '/assets/workshop/figma-scenes/marketing-musician.png?v=2',
        author: '王熠彤',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-marketing-musician.png',
        views: 1,
        prompt: '参考商演乐手开播计划，帮我生成一套音乐人招募活动',
      },
    ],
  },
  {
    key: 'game',
    label: '互动游戏',
    description: '塔防、割草与射击玩法',
    Icon: Gamepad2,
    hero: '/assets/workshop/figma-scenes/hero-game.png?v=2',
    heroDetails: [
      '/assets/workshop/figma-scenes/details/hero-game-app.png',
      '/assets/workshop/figma-scenes/details/hero-game-card.png',
      '/assets/workshop/figma-scenes/details/hero-game-face.png',
    ],
    heroEffects: [
      '/assets/workshop/figma-scenes/details/hero-game-app-glow.svg',
      '/assets/workshop/figma-scenes/details/hero-game-card-glow.svg',
      '/assets/workshop/figma-scenes/details/hero-game-face-glow.svg',
    ],
    placeholder: '请描述你想做的互动游戏',
    cases: [
      {
        id: 'game-tarot',
        title: '动态卡牌-塔罗牌',
        description: '神秘幻想风动态塔罗卡牌',
        cover: '/assets/workshop/figma-scenes/game-tarot.png?v=2',
        author: '官方案例',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-game-tarot.png',
        views: 13,
        prompt: '参考动态塔罗牌，帮我生成一套同风格游戏卡牌',
      },
      {
        id: 'game-shuihu',
        title: '动态卡牌-水浒杀',
        description: '水浒英雄主题动态卡牌',
        cover: '/assets/workshop/figma-scenes/game-shuihu.png?v=2',
        author: '官方案例',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-game-shuihu.png',
        views: 23,
        prompt: '参考动态水浒杀卡牌，帮我生成一套东方英雄卡牌',
      },
      {
        id: 'game-hearthstone',
        title: '动态卡牌-炉石传说',
        description: '暗黑奇幻风动态英雄卡牌',
        cover: '/assets/workshop/figma-scenes/game-hearthstone.png?v=2',
        author: '官方案例',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-game-hearthstone.png',
        views: 16,
        prompt: '参考动态炉石传说卡牌，帮我生成一套奇幻英雄卡牌',
      },
      {
        id: 'game-sanguo',
        title: '动态卡牌-三国杀',
        description: '三国武将主题动态卡牌',
        cover: '/assets/workshop/figma-scenes/game-sanguo.png?v=2',
        author: '官方案例',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-game-sanguo.png',
        views: 6,
        prompt: '参考动态三国杀卡牌，帮我生成一套三国武将卡牌',
      },
    ],
  },
  {
    key: 'activity-assets',
    label: '活动素材',
    description: 'IP、头图、资源位与直播背景',
    Icon: Palette,
    hero: '/assets/workshop/figma-scenes/hero-creative.png?v=2',
    heroDetails: [
      '/assets/workshop/figma-scenes/details/hero-creative-avatar.png',
      '/assets/workshop/figma-scenes/details/hero-creative-star.png',
      '/assets/workshop/figma-scenes/details/hero-creative-fashion.png',
    ],
    heroEffects: [
      '/assets/workshop/figma-scenes/details/hero-creative-avatar-glow.svg',
      '/assets/workshop/figma-scenes/details/hero-creative-star-glow.svg',
      '/assets/workshop/figma-scenes/details/hero-creative-fashion-glow.svg',
    ],
    placeholder: '请描述你需要的活动素材',
    cases: [
      {
        id: 'creative-spring',
        title: '早春岩彩国风图',
        description: '早春花枝与岩彩质感国风视觉',
        cover: '/assets/workshop/figma-scenes/creative-spring.png?v=2',
        author: '徐梦迪',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-creative-spring.png',
        views: 15,
        prompt: '参考早春岩彩国风图，帮我生成一张同风格资源位图片',
      },
      {
        id: 'creative-gold',
        title: '鎏金闪耀动效',
        description: '鎏金光效与流动质感动态海报',
        cover: '/assets/workshop/figma-scenes/creative-gold.png?v=2',
        author: '徐梦迪',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-creative-gold.png',
        views: 17,
        prompt: '参考鎏金闪耀动效，帮我生成一张同风格动态海报',
      },
      {
        id: 'creative-lantern',
        title: '古风元宵节直播间背景',
        description: '元宵灯笼与古风人物直播背景',
        cover: '/assets/workshop/figma-scenes/creative-lantern.png?v=2',
        author: '徐梦迪',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-creative-lantern.png',
        views: 7,
        prompt: '参考古风元宵节直播间背景，帮我生成一张节日直播背景',
      },
      {
        id: 'creative-diamond',
        title: '星星钻石微闪动图',
        description: '钻石星光与微闪粒子动效',
        cover: '/assets/workshop/figma-scenes/creative-diamond.png?v=2',
        author: '徐梦迪',
        avatar: '/assets/workshop/figma-scenes/people/avatar/avatar-creative-diamond.png',
        views: 4,
        prompt: '参考星星钻石微闪动图，帮我生成一张同风格动效素材',
      },
    ],
  },
]

const GAME_ASSET_SOURCE_SCENE = STANDALONE_BASE_SCENES[1]

const STANDALONE_SCENES: readonly StandaloneScene[] = [
  ...STANDALONE_BASE_SCENES,
  {
    ...GAME_ASSET_SOURCE_SCENE,
    key: 'game-assets',
    label: '游戏素材',
    description: '卡牌、精灵帧、地图与游戏 UI',
    Icon: Layers,
    iconSrc: '/assets/workshop/scene-icons/game-assets-adventure.svg',
    /* 三张圈图取设计稿 548:10434 的游戏画面，沿用互动游戏的圈形与光晕。 */
    heroDetails: [
      '/assets/workshop/figma-scenes/details/hero-game-assets-1.png',
      '/assets/workshop/figma-scenes/details/hero-game-assets-2.png',
      '/assets/workshop/figma-scenes/details/hero-game-assets-3.png',
    ],
    placeholder: '请描述你需要的游戏素材',
  },
]

/** 子场景使用统一图标库，按内容语义逐项匹配，避免通用占位图标。 */
const STANDALONE_SCENE_SUGGESTIONS: Record<
  Exclude<StandaloneSceneKey, 'marketing'>,
  readonly StandaloneSubscene[]
> = {
  game: [
    {
      key: 'tower-defense',
      label: '塔防',
      Icon: ShieldCheck,
      prompt: '塔防',
      placeholder: '请描述你想制作的塔防游戏',
      commands: ['生成经典路线塔防', '设计随机阵容塔防', '制作竖屏轻量塔防', '生成主题塔防关卡'],
      toolbarParams: [
        { label: '屏幕', options: ['竖屏', '横屏'] },
        { label: '单局时长', options: ['60 秒', '3 分钟', '5 分钟'] },
      ],
    },
    {
      key: 'survivor',
      label: '割草',
      Icon: Scissors,
      prompt: '割草',
      placeholder: '请描述你想制作的割草游戏',
      commands: ['生成幸存者割草玩法', '设计技能构筑组合', '制作竖屏割草小游戏', '生成无限波次关卡'],
      toolbarParams: [
        { label: '屏幕', options: ['竖屏', '横屏'] },
        { label: '节奏', options: ['轻度', '标准', '高强度'] },
      ],
    },
    {
      key: '2d-shooter',
      label: '2D 射击',
      Icon: Target,
      prompt: '2D 射击',
      placeholder: '请描述你想制作的 2D 射击游戏',
      commands: ['生成俯视角射击游戏', '制作横版弹幕射击', '设计双摇杆射击玩法', '生成像素射击关卡'],
      toolbarParams: [
        { label: '视角', options: ['俯视', '横版'] },
        { label: '画风', options: ['像素', '二次元', '卡通'] },
      ],
    },
  ],
  'activity-assets': [
    {
      key: 'ip-design',
      label: 'IP 设计',
      Icon: Brush,
      prompt: 'IP 设计',
      placeholder: '请描述你想设计的 IP 形象',
      commands: ['设计品牌 IP 形象', '生成 IP 三视图', '制作 IP 表情包', '输出 IP 延展方案'],
      toolbarParams: [
        { label: '画风', options: ['卡通', '潮玩', '国风', '写实'] },
        { label: '视图', options: ['单视图', '三视图'] },
      ],
    },
    {
      key: 'header-banner',
      label: '头图 Banner',
      Icon: LayoutTemplate,
      prompt: '头图 Banner',
      placeholder: '请描述你需要的头图 Banner',
      commands: ['生成活动头图', '设计直播间 Banner', '制作品牌横幅', '输出多尺寸头图'],
      toolbarParams: [
        { label: '比例', options: ['16:9', '3:1', '2:1'] },
        { label: '数量', options: ['×1', '×2', '×4'] },
      ],
    },
    {
      key: 'resource-slot',
      label: '资源位图',
      Icon: LayoutGrid,
      prompt: '资源位图',
      placeholder: '请描述你需要的资源位图片',
      commands: [
        RESOURCE_SLOT_COMMAND,
        '设计频道焦点图',
        '制作运营入口图',
        '输出多规格资源位',
      ],
      toolbarParams: [
        { label: '比例', options: ['1:1', '3:4', '16:9', '9:16'] },
        { label: '数量', options: ['×1', '×2', '×4'] },
      ],
    },
    {
      key: 'live-background',
      label: '直播间背景',
      Icon: MonitorPlay,
      prompt: '直播间背景',
      placeholder: '请描述你需要的直播间背景',
      commands: ['生成节日直播间背景', '制作游戏直播背景', '设计品牌专场背景', '输出多尺寸直播背景'],
      toolbarParams: [
        { label: '比例', options: ['16:9', '9:16'] },
        { label: '风格', options: ['通用', '节日', '游戏', '品牌'] },
      ],
    },
  ],
  'game-assets': [
    {
      key: 'game-card',
      label: '游戏卡牌',
      Icon: CreditCard,
      prompt: '游戏卡牌',
      placeholder: '请描述你想制作的游戏卡牌',
      commands: ['生成塔罗卡牌', '制作三国武将卡', '设计炉石风卡牌', '输出整套卡背'],
      toolbarParams: [
        { label: '比例', options: ['2:3', '3:4', '1:1'] },
        { label: '数量', options: ['×1', '×4', '整套'] },
      ],
    },
    {
      key: 'sprite-frames',
      label: '精灵序列帧',
      Icon: Sparkles,
      prompt: '精灵序列帧',
      placeholder: '请描述你需要的精灵序列帧',
      commands: ['生成角色待机序列帧', '制作跑步动画帧', '生成攻击动作序列', '输出透明底精灵图集'],
      toolbarParams: [
        { label: '帧数', options: ['4 帧', '8 帧', '12 帧', '24 帧'] },
        { label: '交付', options: ['精灵图集', '逐帧序列', 'PNG 透明底'] },
      ],
    },
    {
      key: 'game-map',
      label: '游戏地图',
      Icon: LayoutGrid,
      prompt: '游戏地图',
      placeholder: '请描述你需要的游戏地图',
      commands: ['生成塔防关卡地图', '制作像素冒险地图', '设计战斗场景地图', '输出无缝地图素材'],
      toolbarParams: [
        { label: '视角', options: ['俯视', '横版', '2.5D'] },
        { label: '画风', options: ['像素', '二次元', '卡通', '写实'] },
      ],
    },
    {
      key: 'game-ui',
      label: '游戏 UI',
      Icon: AppWindow,
      prompt: '游戏 UI',
      placeholder: '请描述你需要的游戏 UI',
      commands: ['设计主界面 UI', '生成战斗 HUD', '制作背包界面', '设计按钮图标'],
      toolbarParams: [
        { label: '端型', options: ['竖屏', '横屏', '响应式'] },
        { label: '风格', options: ['二次元', '国风', '像素', '写实'] },
      ],
    },
  ],
}

/** 方案 2 用真实场景缩略图区分 Skill，不与方案 1 的语义图标混用。 */
const SCHEME_TWO_SKILL_THUMBNAILS: Record<string, string> = {
  lynx: '/assets/workshop/figma-scenes/scheme2-skill-interactive.jpg',
  h5: '/assets/workshop/figma-scenes/scheme2-skill-h5.jpg',
  native: '/assets/workshop/figma-scenes/scheme2-skill-native.jpg',
  'creative-poster': '/assets/workshop/figma-scenes/scheme2-skill-poster.jpg',
  'tower-defense': '/assets/workshop/proj-garuda.webp',
  survivor: '/assets/workshop/proj-sanguorush.webp',
  '2d-shooter': '/assets/workshop/figma-scenes/details/hero-game-app.png',
  'ip-design': '/assets/workshop/figma-scenes/details/hero-creative-avatar.png',
  'header-banner': '/assets/workshop/figma-scenes/creative-spring.png?v=2',
  'resource-slot': '/assets/workshop/figma-scenes/creative-gold.png?v=2',
  'live-background': '/assets/workshop/figma-scenes/creative-lantern.png?v=2',
  'game-card': '/assets/workshop/figma-scenes/scheme2-skill-game-card.jpg',
  'sprite-frames': '/assets/workshop/figma-scenes/scheme2-skill-sprite-frames.jpg',
  'game-map': '/assets/workshop/figma-scenes/scheme2-skill-game-map.jpg',
  'game-ui': '/assets/workshop/figma-scenes/scheme2-skill-game-ui.jpg',
}

const SCHEME_TWO_SKILL_DESCRIPTIONS: Record<string, string> = {
  lynx: '集卡、抽奖、答题、投票等互动活动搭建',
  h5: '适合单页或多页面的轻量活动体验',
  native: '基于端内能力搭建高性能原生活动',
  'creative-poster': '快速生成活动主视觉与传播海报',
  'tower-defense': '设计路线、防御塔与波次成长玩法',
  survivor: '设计技能构筑、怪潮与成长节奏',
  '2d-shooter': '生成俯视角或横版射击玩法',
  'ip-design': '设计品牌 IP、三视图与延展形象',
  'header-banner': '生成活动头图与多尺寸横幅',
  'resource-slot': '制作频道焦点图与运营入口图',
  'live-background': '生成节日、游戏或品牌直播背景',
  'game-card': '设计角色卡、卡背与整套卡牌视觉',
  'sprite-frames': '生成待机、跑步与攻击动作序列帧',
  'game-map': '制作塔防、冒险与战斗场景地图',
  'game-ui': '设计主界面、战斗 HUD 与按钮图标',
}

const MAGICX_CASES = '/assets/workshop/magicx-cases'
const MAGICX_OFFICIAL_AVATAR =
  '/assets/workshop/figma-scenes/people/avatar/avatar-marketing-magicx.png'

/** 方案 2 的 Skill 推荐只取 MagicX 案例；每类至少两组，供「换一换」轮播。 */
const MAGICX_H5_CASES: readonly StandaloneSceneCase[] = [
  ...STANDALONE_BASE_SCENES[0].cases,
  {
    id: 'h5-pet-fan-festival',
    title: '盛夏宠粉游戏狂欢节',
    description: '夏日宠粉任务与游戏互动活动',
    cover: `${MAGICX_CASES}/h5-pet-fan-festival.jpg`,
    author: '孙思媛',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考盛夏宠粉游戏狂欢节，帮我生成一套夏日宠粉互动活动',
  },
  {
    id: 'h5-singing-duel',
    title: '歌声隔空对决',
    description: '双人歌声对决与拉票互动活动',
    cover: `${MAGICX_CASES}/h5-singing-duel.jpg`,
    author: '孙思媛',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 1,
    prompt: '参考歌声隔空对决，帮我生成一套音乐对战互动活动',
  },
  {
    id: 'h5-emotion-host-recruit',
    title: '情感新主播招募计划',
    description: '主播招募、任务成长与报名转化活动',
    cover: `${MAGICX_CASES}/h5-emotion-host-recruit.jpg`,
    author: '洛柒清',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考情感新主播招募计划，帮我生成一套主播招募活动',
  },
  {
    id: 'h5-new-voice-plan',
    title: '新声发光计划',
    description: '新主播成长任务与阶段激励活动',
    cover: `${MAGICX_CASES}/h5-new-voice-plan.jpg`,
    author: '吴亚楠',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考新声发光计划，帮我生成一套新主播成长激励活动',
  },
]

const MAGICX_NATIVE_CASES: readonly StandaloneSceneCase[] = [
  {
    id: 'native-submission-atmosphere',
    title: '促投稿氛围版',
    description: '突出话题氛围与投稿入口的原生模板',
    cover: `${MAGICX_CASES}/native-submission-atmosphere.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考促投稿氛围版，帮我生成一套端内投稿活动',
  },
  {
    id: 'native-submission-rules',
    title: '促投稿氛围版（强活动规则）',
    description: '强化活动规则与投稿引导的原生模板',
    cover: `${MAGICX_CASES}/native-submission-rules.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考强活动规则模板，帮我生成一套规则清晰的投稿活动',
  },
  {
    id: 'native-submission-simple',
    title: '促投稿简洁版',
    description: '信息精简、转化路径清晰的投稿模板',
    cover: `${MAGICX_CASES}/native-submission-simple.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考促投稿简洁版，帮我生成一套轻量投稿活动',
  },
  {
    id: 'native-daily-topic',
    title: '日常专题（带活动入口）',
    description: '内容专题与活动入口组合的原生模板',
    cover: `${MAGICX_CASES}/native-daily-topic.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考日常专题模板，帮我生成一套带活动入口的专题页',
  },
  {
    id: 'native-celebrity-entry',
    title: '名人明星入驻',
    description: '明星内容聚合与账号关注转化模板',
    cover: `${MAGICX_CASES}/native-celebrity-entry.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考名人明星入驻模板，帮我生成一套明星入驻专题活动',
  },
  {
    id: 'native-ecommerce-atmosphere',
    title: '电商强氛围',
    description: '大促氛围与商品转化并重的原生模板',
    cover: `${MAGICX_CASES}/native-ecommerce-atmosphere.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考电商强氛围模板，帮我生成一套大促活动页',
  },
  {
    id: 'native-ecommerce-entry',
    title: '电商内容与活动入口',
    description: '内容种草与活动入口组合的电商模板',
    cover: `${MAGICX_CASES}/native-ecommerce-entry.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考电商内容与活动入口模板，帮我生成一套内容型电商活动',
  },
  {
    id: 'native-ecommerce-users',
    title: '电商内容与相关用户',
    description: '内容、达人与商品联动的原生模板',
    cover: `${MAGICX_CASES}/native-ecommerce-users.jpg`,
    author: '官方模板',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考电商内容与相关用户模板，帮我生成一套达人联动活动',
  },
]

const MAGICX_POSTER_CASES: readonly StandaloneSceneCase[] = [
  ...STANDALONE_BASE_SCENES[2].cases,
  {
    id: 'poster-birthday',
    title: '主播生日海报',
    description: '高识别度生日主题主播宣传海报',
    cover: `${MAGICX_CASES}/poster-birthday.jpg`,
    author: '官方案例',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 38,
    prompt: '参考主播生日海报，帮我生成一张同风格生日活动海报',
  },
  {
    id: 'poster-newyear',
    title: '抖音跨年海报',
    description: '跨年氛围与平台品牌结合的活动主视觉',
    cover: `${MAGICX_CASES}/poster-newyear.jpg`,
    author: '官方案例',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 3,
    prompt: '参考抖音跨年海报，帮我生成一张跨年活动主视觉',
  },
  {
    id: 'poster-redfox',
    title: '红狐奇幻夜活动',
    description: '奇幻角色与夜色氛围结合的活动海报',
    cover: `${MAGICX_CASES}/poster-redfox.jpg`,
    author: '官方案例',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 1,
    prompt: '参考红狐奇幻夜活动，帮我生成一张奇幻主题活动海报',
  },
  {
    id: 'poster-shopping-festival',
    title: '2025 购物节主视觉',
    description: '购物节促销信息与品牌氛围主视觉',
    cover: `${MAGICX_CASES}/poster-shopping-festival.jpg`,
    author: '官方案例',
    avatar: MAGICX_OFFICIAL_AVATAR,
    views: 0,
    prompt: '参考 2025 购物节主视觉，帮我生成一张大促活动海报',
  },
]

const SCHEME_TWO_RECOMMENDED_CASES: Readonly<
  Record<string, readonly StandaloneSceneCase[]>
> = {
  lynx: MAGICX_H5_CASES,
  h5: MAGICX_H5_CASES,
  native: MAGICX_NATIVE_CASES,
  'creative-poster': MAGICX_POSTER_CASES,
}

/* 每枚都是设计稿 548:10565 里 20×20 图标的整体导出，不再按图层手拼。 */
const CONNECTED_APP_ICONS = [
  { name: '抖音', src: '/assets/workshop/channel-icons/channel-1.svg' },
  { name: '活动平台', src: '/assets/workshop/channel-icons/channel-2.svg' },
  { name: '活动页面', src: '/assets/workshop/channel-icons/channel-3.svg' },
  { name: '飞书表格', src: '/assets/workshop/channel-icons/channel-4.svg' },
  { name: '飞书 Bot', src: '/assets/workshop/channel-icons/channel-5.svg' },
  { name: 'Magic', src: '/assets/workshop/channel-icons/channel-6.svg' },
] as const

interface Work {
  id: string
  img: string
  author: string
  likes: number
  /** 自己存的活动模板 —— 排在最前面，hover 是「用这个模板」 */
  template?: boolean
}

/** 灵感作品 —— 卡面来自设计稿导出；author/likes 为演示数据。 */
const WORKS: Work[] = [
  { id: 'knight-of-wands', img: `${INSPIRE}/card-knight-of-wands.webp`, author: '用户名', likes: 334 },
  { id: 'likui', img: `${INSPIRE}/card-likui.webp`, author: '三国研究所', likes: 281 },
  { id: 'valeera', img: `${INSPIRE}/card-valeera.webp`, author: '卡牌铺子', likes: 512 },
  { id: 'yanqing', img: `${INSPIRE}/card-yanqing.webp`, author: '燕青不燕', likes: 197 },
  { id: 'three-of-cups', img: `${INSPIRE}/card-three-of-cups.webp`, author: '塔罗小馆', likes: 426 },
  { id: 'page-of-cups', img: `${INSPIRE}/card-page-of-cups.webp`, author: '塔罗小馆', likes: 158 },
  { id: 'five-of-swords', img: `${INSPIRE}/card-five-of-swords.webp`, author: '牌灵', likes: 243 },
  { id: 'yanqing-2', img: `${INSPIRE}/card-yanqing.webp`, author: '水浒星卡', likes: 88 },
  { id: 'valeera-2', img: `${INSPIRE}/card-valeera.webp`, author: '炉石同人', likes: 365 },
  { id: 'likui-2', img: `${INSPIRE}/card-likui.webp`, author: '黑旋风', likes: 132 },
]

const AUTHOR_AVATAR = `${INSPIRE}/author.webp`

function StandaloneSceneSwitcher({
  activeScene,
  onChange,
  reduceMotion,
}: {
  activeScene: StandaloneSceneKey
  onChange: (scene: StandaloneSceneKey) => void
  reduceMotion: boolean
}) {
  return (
    <div
      role="group"
      aria-label="创作场景"
      className="inline-flex items-center gap-1 rounded-[24px] bg-[rgba(83,96,143,0.07)] p-1"
    >
      {STANDALONE_SCENES.map((scene) => {
        const active = scene.key === activeScene
        return (
          <button
            key={scene.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(scene.key)}
            className={`relative flex h-9 w-[104px] items-center justify-center gap-1.5 rounded-full px-2.5 text-[14px] font-semibold transition-colors ${
              active
                ? 'text-white'
                : 'text-[#1c1f23] hover:bg-white/70'
            }`}
          >
            {active && (
              <motion.span
                aria-hidden
                layoutId="standalone-scene-indicator"
                className="absolute inset-0 rounded-full bg-[rgba(28,31,35,0.9)]"
                transition={reduceMotion ? { duration: 0 } : SCENE_TRANSITION}
              />
            )}
            {scene.iconSrc ? (
              <span
                aria-hidden
                className="relative z-10 size-4 shrink-0 bg-current"
                style={{
                  WebkitMask: `url(${scene.iconSrc}) center / contain no-repeat`,
                  mask: `url(${scene.iconSrc}) center / contain no-repeat`,
                }}
              />
            ) : (
              <scene.Icon className="relative z-10" size={16} strokeWidth={1.8} />
            )}
            <span className="relative z-10">{scene.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function StandaloneSubsceneIcon({
  subscene,
  selected = false,
  size = 12,
}: {
  subscene: StandaloneSubscene
  selected?: boolean
  /** 设计稿的 iconClassName 都按 12px 框标定，其他尺寸整体缩放这层。 */
  size?: number
}) {
  const colorClassName = subscene.disabled
    ? 'text-[#1c1f23]/25'
    : selected
      ? 'text-[#2e90fa]'
      : 'text-[#1c1f23]/55'

  if (subscene.Icon) {
    const Icon = subscene.Icon
    return (
      <Icon
        aria-hidden
        size={size}
        strokeWidth={1.8}
        className={`shrink-0 ${colorClassName}`}
      />
    )
  }

  if (!subscene.iconSrc || !subscene.iconClassName) return null

  if (size !== 12) {
    return (
      <span
        aria-hidden
        className={`relative shrink-0 ${colorClassName}`}
        style={{ width: size, height: size }}
      >
        <span
          className="absolute left-0 top-0 size-3 origin-top-left overflow-hidden"
          style={{ transform: `scale(${size / 12})` }}
        >
          <span
            className={`absolute bg-current ${subscene.iconClassName}`}
            style={{
              WebkitMaskImage: `url(${subscene.iconSrc})`,
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%',
              maskImage: `url(${subscene.iconSrc})`,
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
              maskSize: '100% 100%',
            }}
          />
        </span>
      </span>
    )
  }

  return (
    <span
      aria-hidden
      className={`relative size-3 shrink-0 overflow-hidden ${colorClassName}`}
    >
      <span
        className={`absolute bg-current ${subscene.iconClassName}`}
        style={{
          WebkitMaskImage: `url(${subscene.iconSrc})`,
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
          maskImage: `url(${subscene.iconSrc})`,
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          maskSize: '100% 100%',
        }}
      />
    </span>
  )
}

function InstructionSkillTags({
  subscene,
  selectedSkill,
  onRemoveSubscene,
  onRemoveSkill,
}: {
  subscene: StandaloneSubscene
  selectedSkill: { title: string } | null
  onRemoveSubscene: () => void
  onRemoveSkill: () => void
}) {
  return (
    <>
      <span className="mr-1 inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[8px] bg-[#d5ebfe] px-2 text-[12px] text-[#2e90fa]">
        <StandaloneSubsceneIcon subscene={subscene} selected />
        <span>{subscene.label}</span>
        <button
          type="button"
          aria-label={`移除${subscene.label}技能`}
          onClick={onRemoveSubscene}
          className="relative size-3 shrink-0 overflow-hidden"
        >
          <img
            src="/assets/workshop/quick-commands/x-close-primary.svg"
            alt=""
            className="absolute left-[2.5px] top-[2.5px] size-[7px] max-w-none"
          />
        </button>
      </span>
      {selectedSkill && (
        <span className="mr-1 inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[8px] bg-[#d5ebfe] px-2 text-[12px] text-[#2e90fa]">
          <FolderCode size={12} strokeWidth={1.8} />
          <span className="max-w-[140px] truncate">{selectedSkill.title}</span>
          <button
            type="button"
            aria-label={`移除${selectedSkill.title}技能`}
            onClick={onRemoveSkill}
            className="relative size-3 shrink-0 overflow-hidden"
          >
            <img
              src="/assets/workshop/quick-commands/x-close-primary.svg"
              alt=""
              className="absolute left-[2.5px] top-[2.5px] size-[7px] max-w-none"
            />
          </button>
        </span>
      )}
    </>
  )
}

function H5InstructionEditor({
  subscene,
  slots,
  selectedSkill,
  onSlotChange,
  onRemoveSubscene,
  onRemoveSkill,
}: {
  subscene: StandaloneSubscene
  slots: H5InstructionSlots
  selectedSkill: { title: string } | null
  onSlotChange: (key: keyof H5InstructionSlots, value: string) => void
  onRemoveSubscene: () => void
  onRemoveSkill: () => void
}) {
  const shortSlotClassName =
    'mx-1 h-7 rounded-[6px] border border-dashed border-[#b9c0ca] bg-[#f8fafc] px-2 text-[13px] leading-5 text-[#5f6670] outline-none focus:border-[#2e90fa]'

  return (
    <div className="h-full overflow-y-auto px-3 pt-1 text-[13px] leading-[22px] text-[#4f5661]">
      <div className="flex flex-wrap items-center gap-y-1">
        <InstructionSkillTags
          subscene={subscene}
          selectedSkill={selectedSkill}
          onRemoveSubscene={onRemoveSubscene}
          onRemoveSkill={onRemoveSkill}
        />
        <span>生成一个</span>
        <input
          aria-label="H5 活动主题槽位"
          value={slots.theme}
          onChange={(event) => onSlotChange('theme', event.target.value)}
          className={`${shortSlotClassName} w-[92px]`}
        />
        <span>的 H5 活动页，针对</span>
        <input
          aria-label="H5 目标用户槽位"
          value={slots.audience}
          onChange={(event) => onSlotChange('audience', event.target.value)}
          className={`${shortSlotClassName} w-[92px]`}
        />
        <span>，投稿内容为</span>
        <input
          aria-label="H5 投稿内容槽位"
          value={slots.submission}
          onChange={(event) => onSlotChange('submission', event.target.value)}
          className={`${shortSlotClassName} w-[92px]`}
        />
        <span>，需要包含玩法：</span>
      </div>
      <textarea
        aria-label="H5 玩法槽位"
        value={slots.gameplay}
        onChange={(event) => onSlotChange('gameplay', event.target.value)}
        className="mt-1 min-h-[44px] w-full resize-none rounded-[6px] border border-dashed border-[#b9c0ca] bg-[#f8fafc] px-2 py-1 text-[13px] leading-5 text-[#5f6670] outline-none focus:border-[#2e90fa]"
      />
    </div>
  )
}

function CreativePosterInstructionEditor({
  subscene,
  slots,
  selectedSkill,
  onSlotChange,
  onRemoveSubscene,
  onRemoveSkill,
}: {
  subscene: StandaloneSubscene
  slots: CreativePosterInstructionSlots
  selectedSkill: { title: string } | null
  onSlotChange: (key: keyof CreativePosterInstructionSlots, value: string) => void
  onRemoveSubscene: () => void
  onRemoveSkill: () => void
}) {
  const slotClassName =
    'mx-1 h-7 rounded-[6px] border border-dashed border-[#b9c0ca] bg-[#f8fafc] px-2 text-[13px] leading-5 text-[#5f6670] outline-none placeholder:text-[#a0a7b1] focus:border-[#2e90fa]'

  return (
    <div className="h-full overflow-y-auto px-3 pt-1 text-[13px] leading-[22px] text-[#4f5661]">
      <div className="flex flex-wrap items-center gap-y-1">
        <InstructionSkillTags
          subscene={subscene}
          selectedSkill={selectedSkill}
          onRemoveSubscene={onRemoveSubscene}
          onRemoveSkill={onRemoveSkill}
        />
        <span>参考这个海报</span>
        <input
          aria-label="创意海报参考图槽位"
          value={slots.styleImage}
          placeholder="「插入图像」"
          onChange={(event) => onSlotChange('styleImage', event.target.value)}
          className={`${slotClassName} w-[118px]`}
        />
        <span>的风格，生成这个文档</span>
        <input
          aria-label="创意海报参考文档槽位"
          value={slots.sourceDocument}
          placeholder="「插入文档」"
          onChange={(event) => onSlotChange('sourceDocument', event.target.value)}
          className={`${slotClassName} w-[118px]`}
        />
        <span>的创意海报</span>
      </div>
    </div>
  )
}

function PlanningInstructionEditor({
  subscene,
  slots,
  selectedSkill,
  onSlotChange,
  onRemoveSubscene,
  onRemoveSkill,
}: {
  subscene: StandaloneSubscene
  slots: PlanningInstructionSlots
  selectedSkill: { title: string } | null
  onSlotChange: (key: keyof PlanningInstructionSlots, value: string) => void
  onRemoveSubscene: () => void
  onRemoveSkill: () => void
}) {
  const slotClassName =
    'mx-1 h-7 rounded-[6px] border border-dashed border-[#b9c0ca] bg-[#f8fafc] px-2 text-[13px] leading-5 text-[#5f6670] outline-none placeholder:text-[#a0a7b1] focus:border-[#2e90fa]'

  return (
    <div className="h-full overflow-y-auto px-3 pt-1 text-[13px] leading-[22px] text-[#4f5661]">
      <div className="flex flex-wrap items-center gap-y-1">
        <InstructionSkillTags
          subscene={subscene}
          selectedSkill={selectedSkill}
          onRemoveSubscene={onRemoveSubscene}
          onRemoveSkill={onRemoveSkill}
        />
        <span>请参考文档</span>
        <input
          aria-label="灵感策划参考文档链接槽位"
          value={slots.documentLink}
          placeholder="粘贴文档 link"
          onChange={(event) => onSlotChange('documentLink', event.target.value)}
          className={`${slotClassName} w-[128px]`}
        />
        <span>逻辑，帮我生成一个</span>
        <input
          aria-label="灵感策划活动描述槽位"
          value={slots.activityBrief}
          onChange={(event) => onSlotChange('activityBrief', event.target.value)}
          className={`${slotClassName} min-w-[260px] flex-1`}
        />
        <span>策划文档。其他需遵循信息：</span>
      </div>
      <textarea
        aria-label="灵感策划补充要求槽位"
        value={slots.requirements}
        onChange={(event) => onSlotChange('requirements', event.target.value)}
        className="mt-1 min-h-[44px] w-full resize-none rounded-[6px] border border-dashed border-[#b9c0ca] bg-[#f8fafc] px-2 py-1 text-[13px] leading-5 text-[#5f6670] outline-none focus:border-[#2e90fa]"
      />
    </div>
  )
}

function ResourceSlotInstructionEditor({
  subscene,
  slots,
  selectedSkill,
  onSlotChange,
  onRemoveSubscene,
  onRemoveSkill,
}: {
  subscene: StandaloneSubscene
  slots: ResourceSlotInstructionSlots
  selectedSkill: { title: string } | null
  onSlotChange: (key: keyof ResourceSlotInstructionSlots, value: string) => void
  onRemoveSubscene: () => void
  onRemoveSkill: () => void
}) {
  const slotClassName =
    'mx-1 h-7 rounded-[6px] border border-dashed border-[#b9c0ca] bg-[#f8fafc] px-2 text-[13px] leading-5 text-[#5f6670] outline-none placeholder:text-[#a0a7b1] focus:border-[#2e90fa]'

  return (
    <div className="h-full overflow-y-auto px-3 pt-1 text-[13px] leading-[22px] text-[#4f5661]">
      <div className="flex flex-wrap items-center gap-y-1">
        <InstructionSkillTags
          subscene={subscene}
          selectedSkill={selectedSkill}
          onRemoveSubscene={onRemoveSubscene}
          onRemoveSkill={onRemoveSkill}
        />
        <span>基于</span>
        <input
          aria-label="资源位参考图槽位"
          value={slots.referenceImage}
          placeholder="「插入图像」"
          onChange={(event) => onSlotChange('referenceImage', event.target.value)}
          className={`${slotClassName} w-[96px]`}
        />
        <span>生成</span>
        <input
          aria-label="资源位交付物槽位"
          value={slots.deliverables}
          onChange={(event) => onSlotChange('deliverables', event.target.value)}
          className={`${slotClassName} min-w-[320px] flex-1`}
        />
      </div>
    </div>
  )
}

function StandaloneSubsceneCommands({
  label,
  options,
  selected,
  onSelect,
  onCommand,
}: {
  label: string
  options: readonly StandaloneSubscene[]
  selected: StandaloneSubscene | null
  onSelect: (subscene: StandaloneSubscene) => void
  onCommand: (prompt: string) => void
}) {
  return (
    <div
      role="group"
      aria-label={selected ? `${selected.label}快捷指令` : `${label}子场景`}
      className="flex w-full max-w-[816px] items-center gap-3 overflow-x-auto"
    >
      {selected ? (
        selected.commands.map((command) => (
          <button
            key={command}
            type="button"
            onClick={() => onCommand(command)}
            className="flex h-9 shrink-0 items-center gap-2 rounded-[10px] bg-[rgba(83,96,143,0.07)] px-3 text-[14px] leading-5 text-[#1c1f23] transition-colors hover:bg-[rgba(83,96,143,0.12)]"
          >
            {command}
            <span
              aria-hidden
              className="relative size-3 shrink-0 overflow-hidden"
            >
              <img
                src="/assets/workshop/quick-commands/trend-down-02.svg"
                alt=""
                className="absolute left-[3px] top-[3px] size-[6px] max-w-none"
              />
            </span>
          </button>
        ))
      ) : (
        options.map((subscene) => (
          <button
            key={subscene.key}
            type="button"
            disabled={subscene.disabled}
            onClick={() => onSelect(subscene)}
            className="flex h-9 shrink-0 items-center gap-2 rounded-[10px] bg-[rgba(83,96,143,0.07)] px-3 text-[14px] leading-5 text-[#1c1f23] transition-colors hover:bg-[rgba(83,96,143,0.12)] disabled:cursor-default disabled:text-[#1c1f23]/25 disabled:hover:bg-[rgba(83,96,143,0.07)]"
          >
            <StandaloneSubsceneIcon subscene={subscene} />
            {subscene.label}
          </button>
        ))
      )}
    </div>
  )
}

function StandaloneSubsceneSkillRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: readonly StandaloneSubscene[]
  selected: StandaloneSubscene | null
  onSelect: (subscene: StandaloneSubscene) => void
}) {
  return (
    // 悬停 1.5s 才出预览：鼠标扫过整排时不该一路弹卡片。
    <TooltipPrimitive.Provider delayDuration={1500} skipDelayDuration={0}>
      <div
        role="group"
        aria-label={`${label}场景 Skill`}
        className="w-full overflow-x-auto"
      >
        <div className="flex w-max min-w-full items-center justify-center gap-3">
          {options.map((subscene) => {
            const active = selected?.key === subscene.key
            return (
              <TooltipPrimitive.Root key={subscene.key}>
                <TooltipPrimitive.Trigger asChild>
                  <button
                    type="button"
                    disabled={subscene.disabled}
                    aria-pressed={active}
                    onClick={() => onSelect(subscene)}
                    style={{
                      backgroundColor: '#ffffff',
                    }}
                    className={`flex h-11 shrink-0 items-center gap-2 rounded-[10px] border border-[rgba(45,66,107,0.12)] py-1 pl-1 pr-3 text-[14px] font-normal leading-5 transition-colors ${
                      subscene.disabled
                        ? 'cursor-default text-[#1c1f23]/25'
                        : active
                        ? 'text-[#2e90fa]'
                        : 'text-[#1c1f23]'
                    }`}
                  >
                    <span
                      className={`relative h-9 w-[66px] shrink-0 overflow-hidden rounded-lg ${
                        subscene.disabled ? 'opacity-35' : ''
                      }`}
                    >
                      <img
                        src={SCHEME_TWO_SKILL_THUMBNAILS[subscene.key]}
                        alt=""
                        className={
                          subscene.key === 'native'
                            ? 'absolute left-0 top-[-7px] h-auto w-full max-w-none'
                            : 'size-full object-cover'
                        }
                      />
                    </span>
                    <span className="min-w-0 truncate">
                      {subscene.label}
                    </span>
                  </button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                  <TooltipPrimitive.Content
                    side="top"
                    sideOffset={10}
                    collisionPadding={16}
                    className="z-50 w-[248px] rounded-xl border border-black/5 bg-white p-2 shadow-lg"
                  >
                    <img
                      src={SCHEME_TWO_SKILL_THUMBNAILS[subscene.key]}
                      alt=""
                      className="h-[132px] w-full rounded-lg object-cover"
                    />
                    <div className="px-1 pb-1 pt-2 text-left">
                      <p className="truncate text-[14px] font-semibold leading-5 text-[#1c1f23]">
                        {subscene.label}
                      </p>
                      <p className="mt-1 text-pretty text-[12px] leading-[18px] text-[#1c1f23]/60">
                        {SCHEME_TWO_SKILL_DESCRIPTIONS[subscene.key] ?? subscene.placeholder}
                      </p>
                    </div>
                  </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
              </TooltipPrimitive.Root>
            )
          })}
        </div>
      </div>
    </TooltipPrimitive.Provider>
  )
}

function SchemeTwoAppFooter() {
  return (
    <div className="relative z-0 mx-auto -mt-3 flex h-14 w-[760px] items-end justify-between overflow-hidden rounded-b-[24px] bg-[#f2f2f2] px-4 pb-2.5 pt-[22px]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src="/assets/workshop/figma-scenes/scheme2-footer-glow-3.svg"
          alt=""
          className="absolute left-[111px] top-[-251px] h-[594px] w-[765px] max-w-none"
        />
        <img
          src="/assets/workshop/figma-scenes/scheme2-footer-glow-2.svg"
          alt=""
          className="absolute left-[-49px] top-[-275px] h-[594px] w-[765px] max-w-none"
        />
        <img
          src="/assets/workshop/figma-scenes/scheme2-footer-glow-1.svg"
          alt=""
          className="absolute left-[-56px] top-[-238px] h-[299.855px] w-[429px] max-w-none"
        />
      </div>
      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2 text-[14px] leading-5 text-[#1c1f23]/60">
        <span className="relative size-4 shrink-0 overflow-hidden">
          <img
            src="/assets/workshop/figma-scenes/scheme2-footer-rocket.svg"
            alt=""
            className="absolute left-[1px] top-[0.667px] h-[14.333px] w-[14.333px] max-w-none"
          />
        </span>
        <span>连接你常用的发布场景</span>
      </div>
      <div
        role="group"
        aria-label="可连接应用"
        className="relative z-10 flex shrink-0 items-center gap-0.5"
      >
        {CONNECTED_APP_ICONS.map((app) => (
          <span
            key={app.name}
            title={app.name}
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white"
          >
            <img src={app.src} alt="" className="size-5 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  )
}

function StandaloneSubsceneCasePrompts({
  subscene,
  cases,
  onPick,
}: {
  subscene: StandaloneSubscene
  cases: readonly StandaloneSceneCase[]
  onPick: (prompt: string) => void
}) {
  const pageSize = 4
  const pageCount = Math.max(1, Math.ceil(cases.length / pageSize))
  const [page, setPage] = useState(0)
  const safePage = page % pageCount
  const visibleCases = cases.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  )

  return (
    <section
      className="relative z-10 mt-4 w-full"
      aria-label={`${subscene.label}模板`}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-[13px] leading-5 text-[#1c1f23]/55">
        <span className="flex min-w-0 items-center gap-1.5">
          选择 {subscene.label} 模板
        </span>
        {pageCount > 1 && (
          <button
            type="button"
            aria-label={`换一组${subscene.label}推荐案例`}
            onClick={() => setPage((current) => (current + 1) % pageCount)}
            className="flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-[12px] text-[#1c1f23]/55 transition-colors hover:bg-black/5 hover:text-[#1c1f23]/80"
          >
            <RefreshCw size={13} strokeWidth={1.8} />
            换一换
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {visibleCases.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={`使用${item.title}模板`}
            onClick={() => onPick(item.prompt)}
            className="group min-w-0 rounded-[12px] border border-black/5 bg-white p-1.5 text-left shadow-sm transition-colors hover:border-black/10"
          >
            <span className="block h-[132px] w-full overflow-hidden rounded-[8px] bg-[#f2f3f5]">
              <img
                src={item.cover}
                alt=""
                loading="lazy"
                className="size-full object-cover object-top"
              />
            </span>
            <span className="block px-1 pb-1 pt-2">
              <span className="block truncate text-[13px] font-medium leading-5 text-[#1c1f23]">
                {item.title}
              </span>
              <span className="mt-1 flex min-w-0 items-center gap-1.5">
                <img
                  src={item.avatar}
                  alt=""
                  loading="lazy"
                  className="size-4 shrink-0 rounded-full object-cover"
                />
                <span className="truncate text-[11px] leading-4 text-[#1c1f23]/45">
                  {item.author}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function StandaloneSceneCases({
  scene,
  onPick,
}: {
  scene: StandaloneScene
  onPick: (prompt: string) => void
}) {
  return (
    <section
      className={`mt-[160px] w-full ${
        scene.key === 'activity-assets' ? 'max-w-[996px]' : 'max-w-[1008px]'
      }`}
      aria-label={`${scene.label}案例`}
    >
      <div className="grid grid-cols-4 justify-items-center gap-3 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {scene.cases.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item.prompt)}
            aria-label={`参考${item.title}做同款，作者${item.author}`}
            className={`group relative flex w-full min-w-0 flex-col overflow-hidden rounded-[10px] bg-[#f9fafb] px-[10px] pb-4 pt-[10px] text-left ${
              scene.key === 'activity-assets'
                ? 'h-[488px] max-w-[240px]'
                : 'h-[455px] max-w-[243px]'
            }`}
          >
            <span
              className={`relative w-full shrink-0 overflow-hidden rounded-[8px] ${
                scene.key === 'activity-assets' ? 'h-[396px]' : 'h-[363px]'
              }`}
            >
              <img
                src={item.cover}
                alt=""
                className="size-full object-cover object-top transition-transform duration-150 group-hover:scale-[1.01] motion-reduce:transition-none"
              />
              <span className="absolute inset-x-3 bottom-3 flex h-9 translate-y-2 items-center justify-center gap-2 rounded-full bg-[#1c1f23] text-[13px] font-medium text-white opacity-0 transition-[transform,opacity] duration-150 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
                <Sparkles size={14} strokeWidth={1.8} />
                做同款
              </span>
            </span>
            <span className="flex h-[66px] w-full shrink-0 flex-col pt-3">
              <span className="h-[22px] w-full truncate text-[14px] font-medium leading-[22px] text-[#1e1c23]">
                {item.title}
              </span>
              <span className="flex h-8 w-full items-end justify-between pt-3">
                <span className="flex min-w-0 items-center gap-2">
                  <img
                    src={item.avatar}
                    alt=""
                    className="size-[18px] shrink-0 rounded-full border border-[#e5e6eb] object-cover"
                  />
                  <span className="truncate text-[12px] leading-5 text-[#86909c]">
                    {item.author}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium leading-5 tabular-nums text-[#949494]">
                  <img
                    src="/assets/workshop/figma-scenes/people/view-count.png"
                    alt=""
                    className="size-3"
                  />
                  {item.views}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function ToolIcon({ tool }: { tool: Tool }) {
  if ('iconSrc' in tool) {
    return (
      <span
        aria-hidden
        className="size-4 shrink-0 bg-current"
        style={{
          WebkitMask: `url("${tool.iconSrc}") center / contain no-repeat`,
          mask: `url("${tool.iconSrc}") center / contain no-repeat`,
        }}
      />
    )
  }

  return <tool.Icon size={16} strokeWidth={1.8} />
}

/** 工具行按钮（icon + 文字）。 */
function ToolChip({
  tool,
  onClick,
}: {
  tool: Tool
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2 text-[14px] text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
    >
      <ToolIcon tool={tool} />
      {tool.label}
    </button>
  )
}

/** 工具条上的小浮层：点外面关掉。 */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return { open, setOpen, ref }
}

/** 浮层皮肤 —— 向上展开、贴住触发器左边。 */
const POPOVER =
  'absolute bottom-full left-0 z-30 mb-2 min-w-[132px] rounded-[12px] border border-black/5 bg-white p-1 shadow-[0_8px_28px_rgba(30,31,35,0.14)]'

const APPROVAL_MODES = [
  { value: 'ask', label: '手动审批' },
  { value: 'auto', label: '自动执行' },
] as const

type ApprovalMode = (typeof APPROVAL_MODES)[number]['value']
type HomeSkill = (typeof WORKSHOP_SKILLS)[number]

function ApprovalModeSelect({
  value,
  onChange,
}: {
  value: ApprovalMode
  onChange: (value: ApprovalMode) => void
}) {
  const { open, setOpen, ref } = usePopover()
  const selected = APPROVAL_MODES.find((mode) => mode.value === value) ?? APPROVAL_MODES[0]
  const iconSrc =
    value === 'ask'
      ? '/assets/workshop/quick-commands/hand.svg'
      : '/assets/workshop/quick-commands/star-04.svg'

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="审批方式"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-semibold text-[#1c1f23]/80 transition-colors hover:bg-black/5 hover:text-[#1c1f23] ${
          open ? 'bg-black/5' : ''
        }`}
      >
        <span aria-hidden className="relative size-4 shrink-0 overflow-hidden">
          <img
            src={iconSrc}
            alt=""
            className={
              value === 'ask'
                ? 'absolute left-[1.67px] top-[0.67px] h-[14.67px] w-[12.67px] max-w-none'
                : 'absolute left-[0.67px] top-[0.67px] size-[14.67px] max-w-none'
            }
          />
        </span>
        {selected.label}
        <ChevronDown size={16} strokeWidth={1.8} />
      </button>
      {open && (
        <div role="menu" aria-label="选择审批方式" className={POPOVER}>
          {APPROVAL_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              role="menuitemradio"
              aria-checked={mode.value === value}
              onClick={() => {
                onChange(mode.value)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-[8px] px-2 py-1.5 text-[13px] text-[#1c1f23] transition-colors hover:bg-black/5"
            >
              {mode.label}
              {mode.value === value && <Check size={14} strokeWidth={2.2} style={{ color: BLUE }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function HomeSkillSelect({
  selected,
  onChange,
}: {
  selected: HomeSkill | null
  onChange: (skill: HomeSkill | null) => void
}) {
  const { open, setOpen, ref } = usePopover()
  const [query, setQuery] = useState('')
  const [panelMaxHeight, setPanelMaxHeight] = useState(420)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredSkills = normalizedQuery
    ? WORKSHOP_SKILLS.filter((skill) =>
        [skill.title, skill.content, ...(skill.tags ?? [])]
          .join(' ')
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : WORKSHOP_SKILLS

  useEffect(() => {
    if (!open) return

    const updatePanelHeight = () => {
      const triggerBottom = ref.current?.getBoundingClientRect().bottom ?? 0
      const availableHeight = Math.max(0, window.innerHeight - triggerBottom - 16)
      setPanelMaxHeight(Math.min(568, availableHeight))
    }

    const ensureDownwardSpace = () => {
      const triggerBottom = ref.current?.getBoundingClientRect().bottom ?? 0
      if (window.innerHeight - triggerBottom < 360) {
        ref.current?.scrollIntoView({ block: 'center', inline: 'nearest' })
      }
      requestAnimationFrame(updatePanelHeight)
    }

    const frame = requestAnimationFrame(ensureDownwardSpace)
    window.addEventListener('resize', updatePanelHeight)
    document.addEventListener('scroll', updatePanelHeight, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePanelHeight)
      document.removeEventListener('scroll', updatePanelHeight, true)
    }
  }, [open, ref])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="选择技能"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-semibold text-[#1c1f23]/80 transition-colors hover:bg-black/5 hover:text-[#1c1f23] ${
          open ? 'bg-black/5' : ''
        }`}
      >
        <FolderCode size={16} strokeWidth={1.8} />
        技能
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-[12px] border border-black/5 bg-white p-1.5 shadow-[0_8px_28px_rgba(30,31,35,0.14)]"
          style={{ maxHeight: panelMaxHeight }}
        >
          <div className="flex h-9 items-center gap-2 rounded-[8px] bg-black/[0.035] px-2.5 text-[#1c1f23]/45">
            <Search size={15} strokeWidth={1.8} className="shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="搜索技能"
              placeholder="搜索技能"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1c1f23] outline-none placeholder:text-[#1c1f23]/35"
            />
          </div>
          <div
            role="menu"
            aria-label="技能列表"
            className="mt-1 overscroll-contain overflow-y-auto"
            style={{ maxHeight: Math.max(0, panelMaxHeight - 48) }}
          >
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected?.id === skill.id}
                  onClick={() => {
                    onChange(skill)
                    setOpen(false)
                    setQuery('')
                  }}
                  className="flex w-full items-start gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-black/5"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[#2e90fa]/10 text-[#2e90fa]">
                    <FolderCode size={14} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-[18px] text-[#1c1f23]">
                      {skill.title}
                    </span>
                    <span className="block truncate text-[11px] leading-[16px] text-[#1c1f23]/45">
                      {skill.content}
                    </span>
                  </span>
                  {selected?.id === skill.id && (
                    <Check size={14} strokeWidth={2.2} className="mt-1 shrink-0 text-[#2e90fa]" />
                  )}
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center px-4 py-6 text-center">
                <span className="text-[13px] text-[#1c1f23]/55">没有匹配的技能</span>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-[12px] text-[#2e90fa]"
                >
                  清除搜索
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** 参数下拉 —— 收起时只显示当前值，工具条才放得下四个。 */
function ParamSelect({
  label,
  options,
  value,
  onChange,
  toolbarStyle = false,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (v: string) => void
  toolbarStyle?: boolean
}) {
  const { open, setOpen, ref } = usePopover()

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 whitespace-nowrap rounded-full transition-colors ${
          toolbarStyle
            ? 'h-9 px-3 text-[14px] font-semibold'
            : 'h-8 px-2.5 text-[13px]'
        } ${
          open
            ? 'bg-black/5 text-[#1C1F23]'
            : toolbarStyle
              ? 'text-[#1C1F23]/80 hover:bg-black/5 hover:text-[#1C1F23]'
              : 'text-[#1C1F23]/70 hover:bg-black/5 hover:text-[#1C1F23]'
        }`}
      >
        {value}
        <ChevronDown size={toolbarStyle ? 16 : 14} strokeWidth={1.8} />
      </button>
      {open && (
        <div className={POPOVER}>
          <div className="px-2 py-1 text-[11px] text-[#1C1F23]/40">{label}</div>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-[8px] px-2 py-1.5 text-[13px] text-[#1C1F23] transition-colors hover:bg-black/5"
            >
              {o}
              {o === value && <Check size={14} strokeWidth={2.2} style={{ color: BLUE }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** 「更多」—— 平铺不下的入口收在这儿，选中后和平铺入口完全一样。 */
function MoreTools({ onPick }: { onPick: (t: Tool) => void }) {
  const { open, setOpen, ref } = usePopover()

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="更多入口"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1.5 rounded-full px-2 text-[14px] transition-colors ${
          open ? 'bg-black/5 text-[#1C1F23]' : 'text-[#1C1F23]/80 hover:bg-black/5 hover:text-[#1C1F23]'
        }`}
      >
        <MoreHorizontal size={16} strokeWidth={1.8} />
        更多
      </button>
      {open && (
        <div className={POPOVER}>
          {MORE_TOOLS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                onPick(t)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] text-[#1C1F23] transition-colors hover:bg-black/5"
            >
              <t.Icon size={15} strokeWidth={1.8} className="shrink-0 opacity-70" />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlatformHome({
  draft,
  setDraft,
  onSubmit,
  onOpenResourceLibrary,
}: {
  draft: string
  setDraft: (s: string) => void
  onSubmit: (
    text: string,
    attachment?: { name: string; size: number; type: string },
  ) => void
  onOpenResourceLibrary: () => void
}) {
  const navVersion = useNavVersion((state) => state.version)
  const standaloneWorkshopLayout = usesStandaloneWorkshopLayout(navVersion)
  const reduceMotion = useReducedMotion() ?? false
  const [homeLayoutVariant, setHomeLayoutVariant] =
    useState<HomeLayoutVariant>('scheme-2')
  const schemeTwo = homeLayoutVariant === 'scheme-2'
  const [activeScene, setActiveScene] =
    useState<StandaloneSceneKey>('marketing')
  const [selectedSubscene, setSelectedSubscene] =
    useState<StandaloneSubscene | null>(null)
  const [activeSlotInstruction, setActiveSlotInstruction] =
    useState<SlotInstructionKey | null>(null)
  const [h5InstructionSlots, setH5InstructionSlots] =
    useState<H5InstructionSlots>(() => ({ ...DEFAULT_H5_INSTRUCTION_SLOTS }))
  const [creativePosterInstructionSlots, setCreativePosterInstructionSlots] =
    useState<CreativePosterInstructionSlots>(() => ({
      ...DEFAULT_CREATIVE_POSTER_INSTRUCTION_SLOTS,
    }))
  const [planningInstructionSlots, setPlanningInstructionSlots] =
    useState<PlanningInstructionSlots>(() => ({
      ...DEFAULT_PLANNING_INSTRUCTION_SLOTS,
    }))
  const [resourceSlotInstructionSlots, setResourceSlotInstructionSlots] =
    useState<ResourceSlotInstructionSlots>(() => ({
      ...DEFAULT_RESOURCE_SLOT_INSTRUCTION_SLOTS,
    }))
  const [selectedHomeSkill, setSelectedHomeSkill] = useState<HomeSkill | null>(null)
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('ask')
  const activeSceneConfig =
    STANDALONE_SCENES.find((scene) => scene.key === activeScene) ??
    STANDALONE_SCENES[0]
  const activeSubscenes =
    activeScene === 'marketing'
      ? STANDALONE_SUBSCENES
      : STANDALONE_SCENE_SUGGESTIONS[activeScene]
  const showsComposerPrefix =
    (!schemeTwo && Boolean(selectedSubscene)) || Boolean(selectedHomeSkill)
  const [activeTab, setActiveTab] = useState('游戏卡牌')
  /* 快捷入口：选中一个类型后，右侧换成它自己的下拉槽位。 */
  const [tool, setTool] = useState<Tool | null>(null)
  /* 槽位按 `${tool.key}.${槽位名}` 存，切换类型时各自的选择还在。 */
  const [params, setParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      TOOLS.flatMap((t) => t.params.map((p) => [`${t.key}.${p.label}`, p.options[0]])),
    ),
  )
  const [subsceneParams, setSubsceneParams] = useState<Record<string, string>>({})
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  /* 输入 @ 弹出模板引用：选中后 token 进输入框，提交时由工坊识别并复刻。 */
  const [mentionOpen, setMentionOpen] = useState(false)
  const mentionRef = useRef<HTMLDivElement>(null)
  const templateRegistered =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('xiahua-template-registered') === '1'

  useEffect(() => {
    if (!mentionOpen) return
    const close = (e: PointerEvent) => {
      if (!mentionRef.current?.contains(e.target as Node)) setMentionOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [mentionOpen])

  const removeSelectedSubscene = () => {
    setSelectedSubscene(null)
    setActiveSlotInstruction(null)
  }

  const selectSubscene = (subscene: StandaloneSubscene) => {
    setSelectedSubscene(subscene)
    setActiveSlotInstruction(null)
  }

  const pickSubsceneCommand = (command: string) => {
    if (selectedSubscene?.key === 'h5' && command === H5_SLOT_COMMAND) {
      const slots = { ...DEFAULT_H5_INSTRUCTION_SLOTS }
      setH5InstructionSlots(slots)
      setActiveSlotInstruction('h5')
      setDraft(buildH5Instruction(slots))
      return
    }

    if (
      selectedSubscene?.key === 'creative-poster' &&
      command === CREATIVE_POSTER_SLOT_COMMAND
    ) {
      const slots = { ...DEFAULT_CREATIVE_POSTER_INSTRUCTION_SLOTS }
      setCreativePosterInstructionSlots(slots)
      setActiveSlotInstruction('creative-poster')
      setDraft(buildCreativePosterInstruction(slots))
      return
    }

    if (
      selectedSubscene?.key === 'planning' &&
      command === PLANNING_SLOT_COMMAND
    ) {
      const slots = { ...DEFAULT_PLANNING_INSTRUCTION_SLOTS }
      setPlanningInstructionSlots(slots)
      setActiveSlotInstruction('planning')
      setDraft(buildPlanningInstruction(slots))
      return
    }

    if (
      selectedSubscene?.key === 'resource-slot' &&
      command === RESOURCE_SLOT_COMMAND
    ) {
      const slots = { ...DEFAULT_RESOURCE_SLOT_INSTRUCTION_SLOTS }
      setResourceSlotInstructionSlots(slots)
      setActiveSlotInstruction('resource-slot')
      setDraft(buildResourceSlotInstruction(slots))
      return
    }

    setActiveSlotInstruction(null)
    setDraft(command)
  }

  const updateH5InstructionSlot = (
    key: keyof H5InstructionSlots,
    value: string,
  ) => {
    const slots = { ...h5InstructionSlots, [key]: value }
    setH5InstructionSlots(slots)
    setDraft(buildH5Instruction(slots))
  }

  const updateCreativePosterInstructionSlot = (
    key: keyof CreativePosterInstructionSlots,
    value: string,
  ) => {
    const slots = { ...creativePosterInstructionSlots, [key]: value }
    setCreativePosterInstructionSlots(slots)
    setDraft(buildCreativePosterInstruction(slots))
  }

  const updatePlanningInstructionSlot = (
    key: keyof PlanningInstructionSlots,
    value: string,
  ) => {
    const slots = { ...planningInstructionSlots, [key]: value }
    setPlanningInstructionSlots(slots)
    setDraft(buildPlanningInstruction(slots))
  }

  const updateResourceSlotInstructionSlot = (
    key: keyof ResourceSlotInstructionSlots,
    value: string,
  ) => {
    const slots = { ...resourceSlotInstructionSlots, [key]: value }
    setResourceSlotInstructionSlots(slots)
    setDraft(buildResourceSlotInstruction(slots))
  }

  const slotInstructionEditor = selectedSubscene ? (
    activeSlotInstruction === 'h5' ? (
      <H5InstructionEditor
        subscene={selectedSubscene}
        slots={h5InstructionSlots}
        selectedSkill={selectedHomeSkill}
        onSlotChange={updateH5InstructionSlot}
        onRemoveSubscene={removeSelectedSubscene}
        onRemoveSkill={() => setSelectedHomeSkill(null)}
      />
    ) : activeSlotInstruction === 'creative-poster' ? (
      <CreativePosterInstructionEditor
        subscene={selectedSubscene}
        slots={creativePosterInstructionSlots}
        selectedSkill={selectedHomeSkill}
        onSlotChange={updateCreativePosterInstructionSlot}
        onRemoveSubscene={removeSelectedSubscene}
        onRemoveSkill={() => setSelectedHomeSkill(null)}
      />
    ) : activeSlotInstruction === 'planning' ? (
      <PlanningInstructionEditor
        subscene={selectedSubscene}
        slots={planningInstructionSlots}
        selectedSkill={selectedHomeSkill}
        onSlotChange={updatePlanningInstructionSlot}
        onRemoveSubscene={removeSelectedSubscene}
        onRemoveSkill={() => setSelectedHomeSkill(null)}
      />
    ) : activeSlotInstruction === 'resource-slot' ? (
      <ResourceSlotInstructionEditor
        subscene={selectedSubscene}
        slots={resourceSlotInstructionSlots}
        selectedSkill={selectedHomeSkill}
        onSlotChange={updateResourceSlotInstructionSlot}
        onRemoveSubscene={removeSelectedSubscene}
        onRemoveSkill={() => setSelectedHomeSkill(null)}
      />
    ) : undefined
  ) : undefined

  const selectHomeLayoutVariant = (variant: HomeLayoutVariant) => {
    setHomeLayoutVariant(variant)
    setSelectedSubscene(null)
    setActiveSlotInstruction(null)
  }

  /* 「H5活动页」这一栏把存好的活动模板排在最前面。 */
  const works = useMemo(
    () =>
      activeTab === 'H5活动页' && templateRegistered
        ? [
            {
              id: 'tpl-xiahua',
              img: '/assets/xiahua/head-kv.png',
              author: '夯爆了 · 集卡 H5 模板',
              likes: 0,
              template: true,
            },
            ...WORKS,
          ]
        : WORKS,
    [activeTab, templateRegistered],
  )

  /* 选中的类型 + 各槽位作为前缀带进 prompt，别只是装饰。 */
  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed && !attachedFile) return
    const request = trimmed || '请根据这份策划文档完整搭建活动'
    const attachment = attachedFile
      ? { name: attachedFile.name, size: attachedFile.size, type: attachedFile.type }
      : undefined
    setAttachedFile(null)
    if (standaloneWorkshopLayout) {
      const selectedParamValues = selectedSubscene?.toolbarParams?.map(
        (param) =>
          subsceneParams[`${selectedSubscene.key}.${param.label}`] ??
          param.options[0],
      )
      const paramScope = selectedParamValues?.length
        ? `｜${selectedParamValues.join(' / ')}`
        : ''
      const scope = `${selectedSubscene?.label ?? activeSceneConfig.label}${paramScope}`
      const selectedSkillScope = selectedHomeSkill
        ? `｜技能：${selectedHomeSkill.title}`
        : ''
      return onSubmit(`【${scope}${selectedSkillScope}】${request}`, attachment)
    }
    if (!tool) return onSubmit(request, attachment)
    const picked = tool.params.map((p) => params[`${tool.key}.${p.label}`])
    // 选了活动模板 = 引用它复刻：把 token 带进 prompt，工坊按模板拆替换清单
    const usesTemplate =
      tool.key === 'marketing' && params['marketing.模板'] === TEMPLATE_OPTION
    const ps = picked.filter((v) => v !== '选择模板').join(' / ')
    const body = usesTemplate ? `${XIAHUA_TEMPLATE_TOKEN} ${request}` : request
    const scope = ps ? `【${tool.label}｜${ps}】` : `【${tool.label}】`
    onSubmit(`${scope}${body}`, attachment)
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
      /* isolate 不能少 —— ASCII 底纹是 z-[-2] 的 canvas，只有本层自己成为
         层叠上下文，它才会画在这层背景之上、内容之下；否则会被祖先的
         背景盖掉（AI 平台那边同样靠 .page 的 isolation: isolate）。 */
      className="relative isolate min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      style={
        standaloneWorkshopLayout
          ? { backgroundColor: '#fff' }
          : {
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 100%), linear-gradient(180deg, #F2F2F7 0%, #F5F5F5 100%)',
            }
      }
    >
      {/* ASCII 底纹 —— 与 AI 平台同一套 canvas 实现（原来是一张静态贴图） */}
      <AsciiTexture />

      {standaloneWorkshopLayout && (
        <div className="absolute right-6 top-6 z-30">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label={`切换首页方案，当前为${schemeTwo ? '方案 2' : '方案 1'}`}
                style={{ outline: 'none' }}
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#1c1f23]/55 outline-none transition-colors hover:text-[#1c1f23] focus-visible:underline focus-visible:underline-offset-2"
              >
                {schemeTwo ? '方案 2' : '方案 1'}
                <ChevronDown aria-hidden size={10} strokeWidth={1.8} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={4}
                className="z-50 w-[112px] rounded-[8px] bg-white p-1 outline-none"
              >
                {([
                  ['scheme-1', '方案 1'],
                  ['scheme-2', '方案 2'],
                ] as const).map(([value, label]) => (
                  <Popover.Close asChild key={value}>
                    <button
                      type="button"
                      aria-pressed={homeLayoutVariant === value}
                      onClick={() => selectHomeLayoutVariant(value)}
                      className="flex h-7 w-full items-center justify-between rounded-[6px] px-2 text-left text-[11px] text-[#1c1f23]/70 outline-none transition-colors hover:bg-black/5 hover:text-[#1c1f23] focus-visible:bg-black/5"
                    >
                      {label}
                      {homeLayoutVariant === value && (
                        <Check aria-hidden size={12} strokeWidth={2} />
                      )}
                    </button>
                  </Popover.Close>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      )}

      <div className="relative mx-auto flex w-full max-w-[1308px] flex-col items-center px-6 pb-20">
        {/* ── Hero ──
             纵向节奏全部按内容面板（Figma 151:12862）的绝对坐标还原：
             椭圆簇 top 89.6（538×260，居中），标题组 top 274（=48 顶部内距
             + 226），输入框 top 368 —— 所以簇底 349.6 到输入框正好 18。 */}
        <div
          className={`relative flex w-full flex-col items-center ${
            standaloneWorkshopLayout
              ? schemeTwo
                ? 'h-[349px]'
                : 'h-[381px]'
              : 'h-[350px]'
          }`}
        >
          <img
            aria-hidden
            src={standaloneWorkshopLayout ? activeSceneConfig.hero : HERO_RING}
            alt=""
            className={`pointer-events-none absolute z-0 w-[945px] max-w-none select-none ${
              standaloneWorkshopLayout
                ? schemeTwo
                  ? 'top-[60px]'
                  : 'top-[92px]'
                : 'top-[-24px]'
            }`}
          />
          {standaloneWorkshopLayout && (
            <div
              aria-hidden
              className={`pointer-events-none absolute z-[1] h-[272px] w-[945px] max-w-none select-none ${
                schemeTwo ? 'top-[60px]' : 'top-[92px]'
              }`}
            >
              {activeSceneConfig.heroDetails.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className={`absolute max-w-none ${STANDALONE_HERO_DETAIL_FRAMES[index]}`}
                />
              ))}
              {activeSceneConfig.heroEffects.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className={`absolute max-w-none ${STANDALONE_HERO_EFFECT_FRAMES[index]}`}
                />
              ))}
            </div>
          )}
          <div
            className={`relative z-10 flex flex-col items-center ${
              standaloneWorkshopLayout
                ? schemeTwo
                  ? 'gap-6 pt-[252px]'
                  : 'gap-6 pt-[284px]'
                : 'gap-4 pt-[274px]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-balance text-[24px] font-bold leading-[29px] text-[#1C1F23]">
                {standaloneWorkshopLayout ? '激发创造' : '创所未见'}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-[#1C1F23]" />
              <span className="text-balance text-[24px] font-bold leading-[29px] text-[#1C1F23]">
                {standaloneWorkshopLayout ? '创意工坊' : 'AI工坊'}
              </span>
            </div>
            {standaloneWorkshopLayout && (
              <StandaloneSceneSwitcher
                activeScene={activeScene}
                reduceMotion={reduceMotion}
                onChange={(scene) => {
                  setActiveScene(scene)
                  setSelectedSubscene(null)
                  setActiveSlotInstruction(null)
                  setTool(null)
                }}
              />
            )}
            {!standaloneWorkshopLayout && (
              <p className="flex items-center gap-1 text-[16px] tracking-[0.32px] text-[#1C1F23]/60">
                把好想法变成好玩法 <span aria-hidden>💡</span>
              </p>
            )}
          </div>
        </div>

        {/* ── 输入框 ── */}
        <div
          className={`relative z-20 w-full ${
            standaloneWorkshopLayout
              ? `${schemeTwo ? 'mt-4' : 'mt-12'} max-w-[816px]`
              : 'mt-[18px] max-w-[800px]'
          }`}
        >
          {standaloneWorkshopLayout && !schemeTwo && (
            <motion.div
              key={activeScene}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : SCENE_TRANSITION}
              className="w-full"
            >
              <StandaloneSubsceneCommands
                label={activeSceneConfig.label}
                options={activeSubscenes}
                selected={selectedSubscene}
                onSelect={selectSubscene}
                onCommand={pickSubsceneCommand}
              />
            </motion.div>
          )}
          {/* 设计稿：输入框背后的深色光晕。用 box-shadow 而不是模糊方块——
              外阴影会被裁在 border-box 之外，不会从磨砂输入框里透出来。 */}
          <div
            className={
              standaloneWorkshopLayout && schemeTwo
                ? 'relative z-0 mx-auto w-full max-w-[800px] overflow-visible'
                : `relative z-0 shadow-[0_-10px_64px_rgba(30,31,35,0.02),0_8px_88px_-28px_rgba(27,48,81,0.45)] ${
                    standaloneWorkshopLayout
                      ? 'mt-2 max-w-[800px] rounded-[20px]'
                      : 'rounded-[32px]'
                  } border-[0.5px] border-[rgba(16,17,18,0.05)]`
            }
          >
            {/* @模板 引用弹层 —— 输入 @ 时贴在输入框上方 */}
            {mentionOpen && (
              <div
                ref={mentionRef}
                className="absolute -top-2 left-8 z-40 w-[340px] -translate-y-full rounded-[12px] border border-black/5 bg-white p-1.5 shadow-[0_8px_28px_rgba(30,31,35,0.14)]"
              >
                <div className="px-2 py-1 text-[11px] text-[#1C1F23]/40">引用模板</div>
                {templateRegistered ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(`${draft.replace(/@$/, '')}${XIAHUA_TEMPLATE_TOKEN} `)
                      setMentionOpen(false)
                    }}
                    className="flex w-full items-start gap-2.5 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-black/5"
                  >
                    <span className="mt-[1px] flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#7C4DFF]/10 text-[12px] font-bold text-[#7C4DFF]">
                      TPL
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] leading-[18px] text-[#1C1F23]">
                        夯爆了 · 集卡 H5 模板
                      </span>
                      <span className="block text-[11px] leading-[16px] text-[#1C1F23]/45">
                        基于夯爆了活动方案抽象 · 先确认模板文档，再换素材和玩法
                      </span>
                    </span>
                  </button>
                ) : (
                  <div className="px-2 py-2 text-[12px] leading-[18px] text-[#1C1F23]/45">
                    还没有可引用的模板 —— 打开做完的活动，在预览工具条点「存为活动模板」
                  </div>
                )}
              </div>
            )}
            <ChatComposer
              /* 传附件不撑高 —— 附件卡挤占输入区，输入框整体高度不动。 */
              height={standaloneWorkshopLayout ? (schemeTwo ? 166 : 134) : 166}
              className={schemeTwo ? 'relative z-10' : ''}
              value={draft}
              onChange={(v) => {
                setDraft(v)
                setMentionOpen(v.endsWith('@'))
              }}
              onSend={() => submit(draft)}
              placeholder={
                standaloneWorkshopLayout
                  ? !schemeTwo && selectedSubscene?.key === 'lynx'
                    ? '从想法到可玩活动，帮你生成可交付的运营活动'
                    : !schemeTwo
                      ? selectedSubscene?.placeholder ?? activeSceneConfig.placeholder
                      : activeScene === 'marketing'
                        ? '从想法到可玩活动，帮你生成可交付的运营活动'
                        : activeSceneConfig.placeholder
                  : tool?.placeholder ?? PLACEHOLDER
              }
              ariaLabel="输入你的创作想法"
              sendDisabled={!draft.trim() && !attachedFile}
              skinClassName={
                standaloneWorkshopLayout && schemeTwo
                  ? 'rounded-[32px] border-[0.5px] border-[rgba(16,17,18,0.05)] bg-gradient-to-b from-[rgba(251,251,251,0.6)] to-white p-[13px] shadow-[0_4px_64px_rgba(30,31,35,0.02),0_12px_88px_-32px_rgba(27,48,81,0.35)] backdrop-blur-[12px]'
                  : `border border-white bg-gradient-to-b from-[rgba(251,251,251,0.6)] to-white backdrop-blur-[12px] ${
                      standaloneWorkshopLayout ? 'rounded-[20px]' : 'rounded-[32px]'
                    }`
              }
              inputClassName={`platform-home-composer-input text-[14px] text-[#1C1F23] placeholder:text-[#1C1F23]/35 ${
                showsComposerPrefix
                  ? 'px-0 pt-[11px] leading-[22px]'
                  : 'px-3 pt-2 leading-[20px]'
              }`}
              sendButtonClassName={`size-9 bg-[#1C1F23] text-white transition-all hover:-translate-y-[1px] hover:opacity-90 ${
                standaloneWorkshopLayout ? 'disabled:!opacity-100' : ''
              }`}
              inputContent={schemeTwo ? undefined : slotInstructionEditor}
              inputPrefix={
                !activeSlotInstruction &&
                ((!schemeTwo && selectedSubscene) || selectedHomeSkill) && (
                  <span className="ml-3 mt-2 inline-flex shrink-0 items-center gap-1">
                    {!schemeTwo && selectedSubscene && (
                      <span className="inline-flex h-7 shrink-0 items-center gap-2 rounded-[10px] bg-[#d5ebfe] px-2 text-[14px] font-normal leading-5 text-[#2e90fa]">
                        <StandaloneSubsceneIcon
                          subscene={selectedSubscene}
                          selected
                        />
                        <span>{selectedSubscene.label}</span>
                        <button
                          type="button"
                          aria-label={`移除${selectedSubscene.label}技能`}
                          onClick={removeSelectedSubscene}
                          className="relative size-3 shrink-0 overflow-hidden"
                        >
                          <img
                            src="/assets/workshop/quick-commands/x-close-primary.svg"
                            alt=""
                            className="absolute left-[2.5px] top-[2.5px] size-[7px] max-w-none"
                          />
                        </button>
                      </span>
                    )}
                    {selectedHomeSkill && (
                      <span className="inline-flex h-7 shrink-0 items-center gap-2 rounded-[10px] bg-[#d5ebfe] px-2 text-[14px] font-normal leading-5 text-[#2e90fa]">
                        <FolderCode size={12} strokeWidth={1.8} />
                        <span className="max-w-[140px] truncate">{selectedHomeSkill.title}</span>
                        <button
                          type="button"
                          aria-label={`移除${selectedHomeSkill.title}技能`}
                          onClick={() => setSelectedHomeSkill(null)}
                          className="relative size-3 shrink-0 overflow-hidden"
                        >
                          <img
                            src="/assets/workshop/quick-commands/x-close-primary.svg"
                            alt=""
                            className="absolute left-[2.5px] top-[2.5px] size-[7px] max-w-none"
                          />
                        </button>
                      </span>
                    )}
                  </span>
                )
              }
              attachments={
                attachedFile && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 上传文档继续独立回显，不占用技能标签的行内位置。 */}
                    <div className="flex w-fit max-w-[320px] items-center gap-2.5 rounded-[12px] border border-black/5 bg-white px-2.5 py-2 shadow-[0_1px_4px_rgba(30,31,35,0.06)]">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#3370FF]/10 text-[#3370FF]">
                        <FileText size={18} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] leading-[18px] text-[#1C1F23]" title={attachedFile.name}>
                          {attachedFile.name}
                        </span>
                        <span className="block text-[11px] leading-[16px] text-[#1C1F23]/45">
                          {attachedFile.name.split('.').pop()?.toUpperCase()} ·{' '}
                          {attachedFile.size >= 1024 * 1024
                            ? `${(attachedFile.size / 1024 / 1024).toFixed(1)} MB`
                            : `${Math.max(1, Math.round(attachedFile.size / 1024))} KB`}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="移除上传文档"
                        onClick={() => setAttachedFile(null)}
                        className="flex size-5 shrink-0 items-center justify-center rounded-full text-[#1C1F23]/50 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                      >
                        <X size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                )
              }
              footerLeft={
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx,.pdf,.md,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/markdown,text/plain"
                    className="hidden"
                    onChange={(event) => {
                      setAttachedFile(event.target.files?.[0] ?? null)
                      event.currentTarget.value = ''
                    }}
                  />
                  <button
                    type="button"
                    aria-label="上传文档"
                    title="上传文档"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                  >
                    <Plus size={16} strokeWidth={1.8} />
                  </button>
                  {standaloneWorkshopLayout && (
                    <>
                      <HomeSkillSelect
                        selected={selectedHomeSkill}
                        onChange={setSelectedHomeSkill}
                      />
                      <ApprovalModeSelect
                        value={approvalMode}
                        onChange={setApprovalMode}
                      />
                      {/* 字号/字重/图标尺寸跟左边「技能」「手动审批」同一套。 */}
                      {schemeTwo && selectedSubscene && (
                        <span className="ml-1 flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#d5ebfe] pl-3 pr-1.5 text-[14px] font-semibold text-[#2e90fa]">
                          <StandaloneSubsceneIcon
                            subscene={selectedSubscene}
                            selected
                            size={16}
                          />
                          <span>{selectedSubscene.label}</span>
                          <button
                            type="button"
                            aria-label={`移除${selectedSubscene.label}技能`}
                            onClick={removeSelectedSubscene}
                            className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#2e90fa]/10"
                          >
                            <X aria-hidden size={14} strokeWidth={2} />
                          </button>
                        </span>
                      )}
                      {!schemeTwo && selectedSubscene?.toolbarParams?.map((param) => {
                        const paramKey = `${selectedSubscene.key}.${param.label}`
                        return (
                          <ParamSelect
                            key={param.label}
                            label={param.label}
                            options={param.options}
                            value={subsceneParams[paramKey] ?? param.options[0]}
                            toolbarStyle
                            onChange={(value) =>
                              setSubsceneParams((current) => ({
                                ...current,
                                [paramKey]: value,
                              }))
                            }
                          />
                        )
                      })}
                    </>
                  )}
                  {!standaloneWorkshopLayout && (
                    <>
                      <span aria-hidden className="h-4 w-px bg-black/10" />
                      {tool ? (
                        <>
                          {/* 选中的入口：蓝色，带 ✕ 退回默认工具条 */}
                          <span
                            className="flex h-8 shrink-0 items-center gap-1.5 rounded-full pl-2 pr-1.5 text-[14px]"
                            style={{ color: BLUE, backgroundColor: 'rgba(22,100,255,0.08)' }}
                          >
                            <ToolIcon tool={tool} />
                            {tool.label}
                            <button
                              type="button"
                              aria-label={`退出${tool.label}`}
                              onClick={() => setTool(null)}
                              className="flex size-5 items-center justify-center rounded-full transition-colors hover:bg-[rgba(22,100,255,0.14)]"
                            >
                              <X size={13} strokeWidth={2.2} />
                            </button>
                          </span>
                          {/* 下拉槽位紧跟在入口后面左对齐，别甩到右边留一大段空 */}
                          {tool.key === 'card' ? (
                            <button
                              type="button"
                              onClick={onOpenResourceLibrary}
                              className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-black/10 px-3 text-[13px] font-medium text-[#1C1F23]/70 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                            >
                              <FolderCode size={14} strokeWidth={1.8} />
                              扩展
                            </button>
                          ) : (
                            tool.params.map((p) => (
                              <ParamSelect
                                key={p.label}
                                label={p.label}
                                options={p.options}
                                value={params[`${tool.key}.${p.label}`]}
                                onChange={(v) =>
                                  setParams((cur) => ({ ...cur, [`${tool.key}.${p.label}`]: v }))
                                }
                              />
                            ))
                          )}
                        </>
                      ) : (
                        <>
                          {PRIMARY_TOOLS.map((t) => (
                            <ToolChip
                              key={t.key}
                              tool={t}
                              onClick={() => setTool(t)}
                            />
                          ))}
                          <MoreTools onPick={setTool} />
                        </>
                      )}
                    </>
                  )}
                </>
              }
              footerLeftClassName={standaloneWorkshopLayout ? 'gap-0' : ''}
              footerExtra={
                !standaloneWorkshopLayout && tool ? null : (
                  <button
                    type="button"
                    onClick={() => toast('切换模型（演示）')}
                    className={`flex h-9 items-center gap-1 rounded-full px-3 text-[14px] text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23] ${
                      standaloneWorkshopLayout ? 'font-semibold' : ''
                    }`}
                  >
                    {standaloneWorkshopLayout ? (
                      <span aria-hidden className="relative size-4 shrink-0 overflow-hidden">
                        <img
                          src="/assets/workshop/quick-commands/star-04.svg"
                          alt=""
                          className="absolute left-[0.67px] top-[0.67px] size-[14.67px] max-w-none"
                        />
                      </span>
                    ) : (
                      <Sparkles size={16} strokeWidth={1.8} />
                    )}
                    Auto
                    <ChevronDown size={16} strokeWidth={1.8} />
                  </button>
                )
              }
            />
            {standaloneWorkshopLayout && schemeTwo && (
              <SchemeTwoAppFooter />
            )}
          </div>
          {standaloneWorkshopLayout && schemeTwo && (
            <>
              <div className="relative z-10 mx-auto mt-6 w-full max-w-[800px]">
                <StandaloneSubsceneSkillRow
                  label={activeSceneConfig.label}
                  options={activeSubscenes}
                  selected={selectedSubscene}
                  /* 再点一次当前 Skill 就反选，和工具栏 chip 上的 × 等价。 */
                  onSelect={(subscene) =>
                    subscene.key === selectedSubscene?.key
                      ? removeSelectedSubscene()
                      : selectSubscene(subscene)
                  }
                />
              </div>
              {selectedSubscene && (
                <StandaloneSubsceneCasePrompts
                  key={selectedSubscene.key}
                  subscene={selectedSubscene}
                  cases={
                    SCHEME_TWO_RECOMMENDED_CASES[selectedSubscene.key] ??
                    activeSceneConfig.cases
                  }
                  onPick={(prompt) => {
                    setActiveSlotInstruction(null)
                    setDraft(prompt)
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* ── 没有灵感？ ── */}
        {!standaloneWorkshopLayout && (
          <div className="mt-[30px] flex w-full max-w-[779px] flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-[14px] leading-[22px] text-[rgba(28,31,35,0.6)]">
              <Sparkles size={12} strokeWidth={1.8} />
              没有灵感？试试点击以下需求
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSubmit(s)}
                  className="flex h-[42px] items-center gap-2 rounded-[12px] bg-[#F5F7FA] px-4 text-[14px] leading-5 text-[#090C14] transition-colors hover:bg-[#ECEFF5]"
                >
                  {s}
                  <ArrowUpRight size={12} strokeWidth={2} className="shrink-0 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 分类 tab + 灵感作品 ── */}
        {standaloneWorkshopLayout && !schemeTwo ? (
          <StandaloneSceneCases
            scene={activeSceneConfig}
            onPick={submit}
          />
        ) : !standaloneWorkshopLayout ? (
          <div className="mt-[72px] w-full">
          <div className="flex flex-wrap items-center gap-1 pb-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-current={tab === activeTab ? 'true' : undefined}
                className={`flex h-9 items-center rounded-[3px] px-3 text-[14px] leading-5 transition-colors ${
                  tab === activeTab
                    ? 'bg-[rgba(49,46,56,0.05)] font-semibold text-[#1F1C23]'
                    : 'text-[rgba(31,28,35,0.6)] hover:text-[#1F1C23]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 「兴趣卡模板」换成案例墙 —— 卡面网格是给卡牌类看的，
              兴趣卡要看的是它在 Feed 里长什么样。 */}
          {activeTab === '兴趣卡模板' ? (
            <div className="mt-2">
              <InterestCardShowcase
                onPick={({ title }) =>
                  onSubmit(`参考「${title}」这张兴趣卡，帮我做同款`)
                }
              />
            </div>
          ) : (
          <div className="mt-2 grid grid-cols-5 gap-3 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2">
            {/* 存过的活动模板挂在「H5活动页」这一栏的最前面 —— 存完就该能在
                首页看到它，而不是只藏在输入框的 @ 里 */}
            {works.map((w) => (
              <div
                key={w.id}
                className="group relative flex h-[331px] flex-col items-center overflow-hidden rounded-[12px] border border-[rgba(45,66,107,0.06)] shadow-[inset_0_1px_2px_0_white]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[12px] bg-gradient-to-b from-[rgba(255,255,255,0.45)] to-white backdrop-blur-[12px]"
                />
                {/* 卡面：设计稿里是 179×322 居中、带双层投影 */}
                <div
                  className="relative mt-[5px] h-[322px] w-[179px] shrink-0 overflow-hidden rounded-[12px]"
                  style={{
                    filter:
                      'drop-shadow(5px 10px 15px rgba(0,0,0,0.2)) drop-shadow(10px 20px 20px rgba(0,0,0,0.2))',
                  }}
                >
                  <img src={w.img} alt="" className="size-full object-cover" />
                  {/* 底部压暗，托住作者行 */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-black/55 to-transparent"
                  />
                  <div className="absolute inset-x-[13px] bottom-[13px] flex items-center justify-between text-[12px] leading-4 text-white">
                    <span className="flex min-w-0 items-center gap-[5px]">
                      <img
                        src={AUTHOR_AVATAR}
                        alt=""
                        className="size-4 shrink-0 rounded-full object-cover"
                      />
                      <span className="truncate">{w.author}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-px tabular-nums">
                      <Star size={11} strokeWidth={2} />
                      {w.likes}
                    </span>
                  </div>
                </div>
                {/* hover：做同款 */}
                {w.template && (
                  <span className="absolute left-[18px] top-[10px] rounded-[6px] bg-[#1C1F23]/75 px-1.5 py-[2px] text-[11px] font-medium text-white backdrop-blur-[2px]">
                    我的模板
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    w.template
                      ? onSubmit(`${XIAHUA_TEMPLATE_TOKEN} 参考这个模板帮我生成一个新活动`)
                      : onSubmit(`参考这张卡面，帮我做同款「${activeTab}」`)
                  }
                  className="absolute inset-x-[13px] bottom-[13px] flex h-10 translate-y-2 items-center justify-center gap-2 rounded-[100px] bg-[#1C1F23] text-[14px] font-medium text-[#F5F7FA] opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none"
                >
                  <Sparkles size={16} strokeWidth={1.8} />
                  {w.template ? '用这个模板' : '做同款'}
                </button>
              </div>
            ))}
          </div>
          )}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
