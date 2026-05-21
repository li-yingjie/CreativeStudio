import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUp,
  ChevronDown,
  Copy,
  Headphones,
  MessageCircle,
  Plus,
  Search,
  Star,
} from '@/shared/icons'

/**
 * 智能体广场 — 静态预览页（移植自 li-yingjie/DYAI 的 agent-hub 页面）。
 *
 * 作为 web-app 项目「抖音 AI 工坊设计探索」右侧的产物预览。仅保留静态视觉与
 * 轻交互（分类筛选 / 侧栏收起），去掉了 Next 路由、视频与外部数据依赖。
 * 资源放在 public/assets 下（移植时一并拷入）。
 */

const SIDEBAR_ASSETS = {
  logoExpanded: '/assets/logosmall.svg',
}

const HUB_ICONS = {
  square: {
    line: '/assets/agent-hub/类型=智能体广场, 属性=线性.svg',
    fill: '/assets/agent-hub/类型=智能体广场, 属性=面性.svg',
  },
  agents: {
    line: '/assets/agent-hub/类型=我的智能体, 属性=线性.svg',
    fill: '/assets/agent-hub/类型=我的智能体, 属性=面性.svg',
  },
  toolbox: {
    line: '/assets/agent-hub/类型=工具箱, 属性=线性.svg',
    fill: '/assets/agent-hub/类型=工具箱, 属性=面性.svg',
  },
  knowledge: {
    line: '/assets/agent-hub/类型=知识库, 属性=线性.svg',
    fill: '/assets/agent-hub/类型=知识库, 属性=面性.svg',
  },
  models: {
    line: '/assets/agent-hub/类型=模型广场, 属性=线性.svg',
    fill: '/assets/agent-hub/类型=模型广场, 属性=面性.svg',
  },
} as const

const AGENT_HUB_ASSETS = {
  hero: '/assets/banner.jpeg',
  avatar: '/assets/agent-hub/card-avatar.webp',
}

const CREATE_AGENT_HOVER_GLOW_STYLE = {
  background:
    'linear-gradient(234deg, #0F5AE5 0%, #0FB2FD 16.2012%, #7CF6FE 69.0486%, #FFF20D 87.9462%, #F66F11 100%)',
  filter: 'blur(4px)',
} as const

const CARD_HOVER_GLOW_STYLE = {
  opacity: 0.4,
  background:
    'linear-gradient(279deg, #1768FF 0%, #28BBFF 13.36%, #7CF6FE 63.45%, #F6E901 81.37%, #FE8028 92.79%)',
  filter: 'blur(2px)',
} as const

const CURRENT_USER = {
  name: '李英杰',
  avatar: '/assets/kingjaylee.PNG',
} as const

const discoveryTabs = ['全部', '数字员工', '角色互动', '官方服务', '工具玩法', '其他'] as const
type DiscoveryTab = (typeof discoveryTabs)[number]

const AV = {
  one: '/assets/avatar/1.png',
  two: '/assets/avatar/2.png',
  three: '/assets/avatar/3.png',
  four: '/assets/avatar/4.png',
  five: '/assets/avatar/5.jpeg',
  luoYonghao: '/assets/avatar/罗永浩.png',
  feiji: '/assets/avatar/feiji.jpeg',
  pipitu: '/assets/avatar/pipitu.jpg',
  zhaxi: '/assets/avatar/zhaxi.jpg',
  tup: '/assets/avatar/tup.png',
}
const FEATURED_IMG = {
  platformAssistant: '/assets/agent-hub/featured-platform-assistant.webp',
  shenbi: '/assets/agent-hub/featured-shenbi.webp',
  feishuReport: '/assets/agent-hub/featured-feishu-report.webp',
  lazygoat: '/assets/agent-hub/featured-lazygoat.webp',
  douyinAssistant: '/assets/agent-hub/featured-douyin-assistant.webp',
}

const BUSINESS_IMG = {
  aha: '/assets/agent-hub/business/aha.webp',
  moonquan: '/assets/agent-hub/business/moonquan.webp',
  agentPlatform: '/assets/agent-hub/business/agent-platform.webp',
  douyin: '/assets/agent-hub/business/douyin.webp',
  musicLab: '/assets/agent-hub/business/music-lab.webp',
  qaAssistant: '/assets/agent-hub/business/qa-assistant.webp',
  aiden: '/assets/agent-hub/business/aiden.webp',
}

type FeaturedAgent = {
  title: string
  subtitle: string
  author: string
  metricA: string
  metricB: string
  badge: string
  badgeColor: string
  image: string
  background: string
  overlay: string
}

const featuredHubAgents: FeaturedAgent[] = [
  {
    title: '抖音AI工坊智能助手',
    subtitle: '用于抖音AI工坊内部用户群，通过机器人的自动回复为用户答疑，减轻人工运营成本。',
    author: '王维维',
    metricA: '1.7K',
    metricB: '15',
    badge: '维维',
    badgeColor: '#db7df6',
    image: FEATURED_IMG.platformAssistant,
    background: '#f198ff',
    overlay:
      'linear-gradient(187.42deg, rgba(241, 152, 255, 0.72) 2.03%, rgba(241, 152, 255, 0) 20.47%, rgba(241, 152, 255, 0) 59.43%, rgb(241, 152, 255) 77.23%)',
  },
  {
    title: '图片生成助手小程序',
    subtitle: '支持上传照片或输入文字描述，选择水彩、剪纸、二次元等风格，一键生成灵感图片。',
    author: '章博昕',
    metricA: '694',
    metricB: '7',
    badge: '章',
    badgeColor: '#8fb3ff',
    image: FEATURED_IMG.shenbi,
    background: '#8aa3d0',
    overlay:
      'linear-gradient(187.42deg, rgba(138, 163, 208, 0.76) 2.03%, rgba(138, 163, 208, 0) 22.15%, rgba(138, 163, 208, 0) 55.48%, rgb(138, 163, 208) 72.23%)',
  },
  {
    title: '舆情文档小助手',
    subtitle: '输入想要查询的舆情事件描述或关键词，智能体自主完成事件脉络梳理与飞书文档沉淀。',
    author: '黄红钰',
    metricA: '802',
    metricB: '13',
    badge: '黄',
    badgeColor: '#f7bb4e',
    image: FEATURED_IMG.feishuReport,
    background: '#0f5ff5',
    overlay:
      'linear-gradient(187.42deg, rgba(15, 95, 245, 0.82) 2.03%, rgba(15, 95, 245, 0) 22.15%, rgba(15, 95, 245, 0) 55.48%, rgb(15, 95, 245) 74.23%)',
  },
  {
    title: '懒羊羊',
    subtitle: '懒人烹饪红大师。与《喜羊羊与灰太狼》中角色懒羊羊对话，给出做饭灵感和趣味反馈。',
    author: '梁媛媛',
    metricA: '3.3K',
    metricB: '13',
    badge: '梁',
    badgeColor: '#f4a45b',
    image: FEATURED_IMG.lazygoat,
    background: '#b86e46',
    overlay:
      'linear-gradient(187.42deg, rgba(184, 110, 70, 0.72) 2.03%, rgba(184, 110, 70, 0) 24.15%, rgba(184, 110, 70, 0) 55.48%, rgb(184, 110, 70) 74.23%)',
  },
  {
    title: '抖音账号小助手',
    subtitle: '帮助用户更快更好了解自己的抖音账号的相关信息，适合账号诊断和权限答疑场景。',
    author: '金叶清',
    metricA: '1.4K',
    metricB: '15',
    badge: '叶清',
    badgeColor: '#9a65f9',
    image: FEATURED_IMG.douyinAssistant,
    background: '#7da489',
    overlay:
      'linear-gradient(187.42deg, rgba(125, 164, 137, 0.76) 2.03%, rgba(125, 164, 137, 0) 22.15%, rgba(125, 164, 137, 0) 55.48%, rgb(125, 164, 137) 72.23%)',
  },
]

type DiscoveryAgent = {
  title: string
  description: string
  author: string
  avatar?: string
  metricA: string
  metricB: string
  category: DiscoveryTab
  icon: string
  iconBg: string
}

const discoveryHubAgents: DiscoveryAgent[] = [
  { title: '罗永浩', description: '能讲人话的科技数字人，幽默、实在、懂点商业', author: '李英杰', avatar: AV.luoYonghao, metricA: '2.6K', metricB: '9', category: '数字员工', icon: '🧑‍💼', iconBg: 'linear-gradient(135deg, #dfe7ff, #8da2ff)' },
  { title: '斐济出发！', description: '旅行规划助手，专注斐济，行住游吃一站搞定', author: '尹龙', avatar: AV.feiji, metricA: '1.1M', metricB: '2', category: '角色互动', icon: '🏝️', iconBg: 'linear-gradient(135deg, #fbf2a6, #f6c65b)' },
  { title: '痞痞兔', description: '冷面妖怪行走人间，表面狠厉，实则嘴硬心软超护短', author: '李轩', avatar: AV.pipitu, metricA: '1.1M', metricB: '7', category: '角色互动', icon: '🐰', iconBg: 'linear-gradient(135deg, #40284d, #ff6ea9)' },
  { title: '轧戏', description: '穿梭剧本世界，在冒险中邂逅独属于你的宿命之旅。', author: '李庆方', avatar: AV.zhaxi, metricA: '455.8K', metricB: '3', category: '角色互动', icon: '🎭', iconBg: 'linear-gradient(135deg, #1a2b5c, #4f86ff)' },
  { title: '热点事件研判报送智能体', description: '对潜力热点事件进行数据分析与价值研判，支持热点智能化分类分级运营', author: '尹龙', metricA: '1.3K', metricB: '4', category: '官方服务', icon: '🔥', iconBg: 'linear-gradient(135deg, #70b7ff, #ff8d49)' },
  { title: '图片生成小助手智能体', description: '输入你想要的图片，我快速为你风格化图片。支持文生图、图生图', author: '孙锦文', avatar: AV.tup, metricA: '52', metricB: '0', category: '工具玩法', icon: '🎨', iconBg: 'linear-gradient(135deg, #fff0c7, #ff9f43)' },
  { title: '抖音开放平台智能客服-内部', description: '抖音开放平台内部 oncall 中台的智能拦截环节，支持查询 logid、官方知识库', author: '张弈欣', metricA: '4.3K', metricB: '4', category: '官方服务', icon: '🤖', iconBg: 'linear-gradient(135deg, #f4f4f4, #d2d2d2)' },
  { title: '抖音开放平台智能客服', description: '拥有所有抖音开放平台对外知识库，通过机器人自动回复为用户答疑，减轻人工客服成本。', author: '王维维', metricA: '174.1K', metricB: '5', category: '数字员工', icon: '🧑🏽', iconBg: 'linear-gradient(135deg, #d0e2ff, #ff8cc6)' },
  { title: '视频创作cot生产大师', description: '支持输入标签、优质视频 prompt、参考人设等，自动生成脚本链路。', author: '高岩', metricA: '133', metricB: '2', category: '工具玩法', icon: '🧠', iconBg: 'linear-gradient(135deg, #78d6ff, #6d64ff)' },
  { title: '平台浅励内容cot生产', description: '通过这个工具实现对平台浅励内容的评级预测，或输出评级 cot', author: '高岩', metricA: '59', metricB: '1', category: '官方服务', icon: '🐠', iconBg: 'linear-gradient(135deg, #ffd36a, #ff6a83)' },
  { title: '机审结果生成Hive表', description: '通过 workflow 和插件，读现网用户头图或昵称结果，生成 hive 表信息。', author: '孙锦文', metricA: '92', metricB: '3', category: '工具玩法', icon: '📄', iconBg: 'linear-gradient(135deg, #e1efff, #8cbcff)' },
  { title: '内容治理平台-无资质医疗生成特征值', description: '通过构建 UID 读取账号画像及事件特征，挖掘模型对风险的判断，给出问题定位线索。', author: '孙锦文', metricA: '159', metricB: '4', category: '官方服务', icon: '🧊', iconBg: 'linear-gradient(135deg, #e9fff7, #5c81ff)' },
  { title: '基础运营平台-映射自动修改', description: '对业务线目标位标签之间映射关系的自动修改，帮助运营同学提效，可闭环覆盖站运平台', author: '赵彦慧', metricA: '59', metricB: '4', category: '数字员工', icon: '💠', iconBg: 'linear-gradient(135deg, #efe1ff, #7c61ff)' },
  { title: '大大怪将军', description: '小小怪的人生项目提案', author: '尹龙', metricA: '80', metricB: '5', category: '角色互动', icon: '🪖', iconBg: 'linear-gradient(135deg, #ffef8a, #6b7cff)' },
  { title: '飞狗MOCO', description: '主人主人，带我一起去旅行吧！旅行去森林、去海底、去外太空。', author: '李轩', metricA: '911', metricB: '3', category: '角色互动', icon: '🐶', iconBg: 'linear-gradient(135deg, #84dfff, #ffa94f)' },
  { title: '红太狼', description: '老婆的心意你得猜', author: '尹龙', metricA: '323', metricB: '2', category: '角色互动', icon: '🐺', iconBg: 'linear-gradient(135deg, #ffc8d7, #8b8b8b)' },
  { title: '灵宝', description: '今天也在峡谷观察英雄哦～', author: '尹龙', metricA: '209', metricB: '3', category: '角色互动', icon: '🐨', iconBg: 'linear-gradient(135deg, #d7e6ff, #6271b8)' },
  { title: '第二魔法实验中学', description: '中式魔法学院', author: '朱江波', metricA: '803', metricB: '0', category: '角色互动', icon: '🎓', iconBg: 'linear-gradient(135deg, #ffffff, #ff4b3a)' },
  { title: '汤圆酱的海龟汤馆', description: '快来和我一起玩海龟汤', author: '曾晓荣', metricA: '1.4K', metricB: '1', category: '角色互动', icon: '🍜', iconBg: 'linear-gradient(135deg, #f1f1f1, #cfcfcf)' },
  { title: '喵先生', description: '我们的故事怎么发展，由你来定～', author: '许瑞瑶', metricA: '4.2K', metricB: '1', category: '角色互动', icon: '🐱', iconBg: 'linear-gradient(135deg, #d5e9ff, #f2c099)' },
  { title: 'Magic X - 扩图小助理', description: '可上传 K V 图或资源位图片，处理头图、运营 banner 图、原生化类图。', author: '刘梦琪', metricA: '52', metricB: '1', category: '工具玩法', icon: '✖️', iconBg: 'linear-gradient(135deg, #efe5ff, #9d87ff)' },
  { title: '运营海报助手', description: '一个运营海报生成助手，擅长 3D 运营风格，同时也能生成插画风、平面设计等海报。', author: '卢艳华', metricA: '402', metricB: '4', category: '工具玩法', icon: '🀄', iconBg: 'linear-gradient(135deg, #fff1d8, #ff6a4a)' },
  { title: '『跑团』城郊汽修厂的夜灯', description: '欢迎来到『剧本杀』城市迷你的夜灯！点击「开始游戏」开启挑战。', author: '孙锦文', metricA: '231', metricB: '1', category: '角色互动', icon: '🛠️', iconBg: 'linear-gradient(135deg, #102030, #ffbf5f)' },
  { title: '小游戏文档生成智能体', description: '通过自然语言跟我对话，我便能依据小游戏文档知识库生成符合小游戏规范的文档。', author: '叔平', metricA: '31', metricB: '0', category: '数字员工', icon: '🤖', iconBg: 'linear-gradient(135deg, #d8f1ff, #6ec5ff)' },
  { title: '头像圣诞帽', description: '给你的头像戴个圣诞帽吧～', author: '郑子喆', metricA: '23', metricB: '2', category: '工具玩法', icon: '🎅', iconBg: 'linear-gradient(135deg, #ffe4df, #ff8a8a)' },
  { title: '竞品书研分析师', description: '智能生成调研报告，实时捕捉抖音热门动态，助力决策快人一步', author: '王启东', metricA: '82', metricB: '2', category: '数字员工', icon: '🎼', iconBg: 'linear-gradient(135deg, #101820, #68a0ff)' },
]

type BusinessProduct = {
  title: string
  description: string
  tag: string
  icon: string
}

const businessProducts: BusinessProduct[] = [
  { title: 'Aha', description: '面向UG业务的AI工作流编排平台', tag: 'UG', icon: BUSINESS_IMG.aha },
  { title: '墨攻', description: '营销中台推出的AIGC营销内容全链路管理平台，服务营销场景内容策略与生成', tag: 'UG', icon: BUSINESS_IMG.moonquan },
  { title: '抖音创作Agent平台', description: '面向抖音创作场景的一站式 Agent 搭建与调试平台', tag: '随变', icon: BUSINESS_IMG.agentPlatform },
  { title: 'IP生态合作平台', description: '抖音管理全平台 IP的统一生态合作与商业化中台', tag: 'IP生态平台', icon: BUSINESS_IMG.douyin },
  { title: '创作者中心', description: '抖音创作者中心是抖音创作者的一站式服务平台，助力创作者高效运营', tag: 'IP生态平台', icon: BUSINESS_IMG.douyin },
  { title: '创作实验室', description: '抖音音乐内容团队孵化的音乐创作工具，融合多种AI能力，支持完整创作生态链', tag: '音乐', icon: BUSINESS_IMG.musicLab },
  { title: '抖音虚拟创作平台', description: '面向UGC与专业创作者的3D虚拟世界/互动内容创作平台', tag: '游戏', icon: BUSINESS_IMG.douyin },
  { title: '抖音虚拟形象平台', description: '抖音官方虚拟形象创作与 AI 数字人运营平台', tag: '分身', icon: BUSINESS_IMG.douyin },
  { title: 'LLM提效平台', description: '定位是自动化机评工具，定向服务搜索业务场景，预设相关评测模版', tag: '评测', icon: BUSINESS_IMG.douyin },
  { title: '抖音问答助手', description: '基于大模型与抖音上下文业务知识，支持问答、任务执行与协作的智能工作助手', tag: '研发产品', icon: BUSINESS_IMG.qaAssistant },
  { title: 'Aiden', description: '一站式AI研发平台', tag: '研发产品', icon: BUSINESS_IMG.aiden },
]

const sortOptions = ['默认排序', '使用量排序', '发布时间'] as const
type SortOption = (typeof sortOptions)[number]

function parseMetricValue(value: string) {
  const normalized = value.trim().toUpperCase()
  if (normalized.endsWith('M')) return Number.parseFloat(normalized) * 1_000_000
  if (normalized.endsWith('K')) return Number.parseFloat(normalized) * 1_000
  return Number.parseFloat(normalized) || 0
}

function ExpandedNavItem({
  iconFillSrc,
  iconLineSrc,
  label,
  active = false,
}: {
  iconFillSrc: string
  iconLineSrc: string
  label: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-start gap-2.5 rounded-full px-4 py-[10px] text-left transition-colors ${
        active ? 'bg-[rgba(83,96,143,0.12)]' : 'hover:bg-white/60'
      }`}
    >
      <span className="flex h-[22px] w-[22px] items-center justify-center text-[#1c1f23]">
        <img alt="" className="h-[18px] w-[18px]" src={active ? iconFillSrc : iconLineSrc} />
      </span>
      <span className={`text-sm text-[#1c1f23] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
    </button>
  )
}

function SmallMetric({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-xs leading-4 text-inherit">
      <span className="flex h-3.5 w-3.5 items-center justify-center">{icon}</span>
      <span>{value}</span>
    </div>
  )
}

function CardHoverGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    >
      <div className="absolute inset-0 rounded-[inherit]" style={CARD_HOVER_GLOW_STYLE} />
    </div>
  )
}

function FeaturedCard({
  title,
  subtitle,
  author,
  metricA,
  metricB,
  badge,
  badgeColor,
  image,
  background,
  overlay,
}: FeaturedAgent) {
  return (
    <div
      className="group relative block overflow-hidden rounded-[28px] bg-[var(--card-border)] transition-colors duration-200 hover:bg-transparent"
      style={{ ['--card-border' as string]: background }}
    >
      <div
        className="relative m-1 aspect-[314/392] overflow-hidden rounded-[24px] transition-[margin,border-radius] duration-200 group-hover:m-0 group-hover:rounded-[28px]"
        style={{ backgroundColor: background }}
      >
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.1]"
          src={image}
        />
        <div className="absolute inset-0" style={{ backgroundImage: overlay }} />
        <div className="absolute inset-x-4 bottom-4 flex min-w-0 flex-col overflow-hidden text-white">
          <h3 className="truncate whitespace-nowrap text-[16px] font-medium leading-[18px]">{title}</h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-white/92">{subtitle}</p>
          <div className="relative mt-2 h-5 transition-[height] duration-200 group-hover:h-9">
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 transition-opacity duration-200 group-hover:opacity-0">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: badgeColor }}
                >
                  {badge.slice(0, 1)}
                </span>
                <span className="text-[12px] leading-[18px] text-white/95">{author}</span>
              </div>
              <div className="flex items-center gap-3 text-white/95">
                <SmallMetric icon={<MessageCircle className="h-3.5 w-3.5" strokeWidth={2.2} />} value={metricA} />
                <SmallMetric icon={<Star className="h-3.5 w-3.5" strokeWidth={2.2} />} value={metricB} />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between gap-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-[#1c1f23] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                <Copy className="h-4 w-4" strokeWidth={2.2} />
                做同款
              </span>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1c1f23] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                <Star className="h-4 w-4" strokeWidth={2.2} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DiscoveryCard({
  title,
  description,
  author,
  avatar,
  metricA,
  metricB,
  icon,
  iconBg,
}: DiscoveryAgent) {
  return (
    <div className="group relative block rounded-[24px] p-[1px] transition-transform duration-200 hover:-translate-y-1">
      <CardHoverGlow />
      <div className="relative rounded-[24px] border border-[rgba(45,66,107,0.12)] bg-white px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="flex items-start gap-4">
          <div
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] text-[32px]"
            style={{ background: iconBg }}
          >
            {avatar ? <img alt="" className="h-full w-full object-cover" src={avatar} /> : icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[16px] font-semibold leading-[22px] text-[#222727]">{title}</h3>
            <p className="mt-1 line-clamp-2 text-[12px] leading-[16px] text-[rgba(34,39,39,0.6)]">{description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-[rgba(34,39,39,0.7)]">
          <div className="flex min-w-0 items-center gap-2">
            <img alt="" className="h-5 w-5 rounded-full object-cover" src={avatar ?? AGENT_HUB_ASSETS.avatar} />
            <span className="truncate text-xs leading-[18px]">{author}</span>
          </div>
          <div className="flex items-center gap-3">
            <SmallMetric icon={<MessageCircle className="h-3.5 w-3.5" strokeWidth={2.2} />} value={metricA} />
            <SmallMetric icon={<Star className="h-3.5 w-3.5" strokeWidth={2.2} />} value={metricB} />
            <div className="flex items-center gap-1 text-xs leading-4">
              <Copy className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>做同款</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BusinessProductCard({ title, description, tag, icon }: BusinessProduct) {
  return (
    <div className="group relative rounded-[20px] p-[1px] transition-transform duration-200 hover:-translate-y-1">
      <CardHoverGlow />
      <div className="relative overflow-hidden rounded-[20px] border border-[rgba(83,96,143,0.12)] bg-white p-5">
        <div className="flex items-start gap-3">
          <img
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            src={icon}
          />
          <div className="h-16 min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="min-w-0 flex-1 truncate text-[16px] font-semibold leading-[22px] text-[#1c1f23]">
                {title}
              </h4>
              <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-[rgba(115,158,202,0.15)] px-1.5 text-[12px] font-semibold leading-4 text-[#373d46]">
                {tag}
              </span>
            </div>
            <p className="line-clamp-2 text-[12px] leading-4 text-[rgba(28,31,35,0.6)]">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentHubPreview({ hideSidebar = false }: { hideSidebar?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('全部')
  const [sortOption, setSortOption] = useState<SortOption>('默认排序')
  const [sortOpen, setSortOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const filteredAgents = useMemo(() => {
    let items = discoveryHubAgents.map((item, index) => ({
      ...item,
      originalIndex: index,
      usageValue: parseMetricValue(item.metricA),
      publishValue: discoveryHubAgents.length - index,
    }))
    if (activeTab !== '全部') items = items.filter((item) => item.category === activeTab)
    if (sortOption === '使用量排序') {
      items.sort((a, b) => b.usageValue - a.usageValue || a.originalIndex - b.originalIndex)
    } else if (sortOption === '发布时间') {
      items.sort((a, b) => b.publishValue - a.publishValue)
    } else {
      items.sort((a, b) => a.originalIndex - b.originalIndex)
    }
    return items
  }, [activeTab, sortOption])

  const moduleInitial = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const moduleAnimate = { opacity: 1, y: 0 }
  const moduleTransition = (delay: number) => ({
    duration: 0.6,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  })

  return (
    <main className="flex h-full w-full bg-[var(--color-surface-0)] text-[#222727]">
        {/* ── Left rail —— fills the visible pane height; content scrolls.
             Hidden when embedded under a host nav (e.g. 创意广场). ── */}
        <aside className={`${hideSidebar ? 'hidden' : 'hidden @[700px]:block'} h-full w-[220px] shrink-0 px-2 py-2`}>
          <nav className="relative flex h-full flex-col justify-between rounded-[24px] bg-[#f2f2f7] px-4 py-4">
            <div className="w-full">
              <div className="flex items-center justify-between gap-2">
                <img alt="" className="h-[15px] w-auto shrink-0" src={SIDEBAR_ASSETS.logoExpanded} />
                <span className="h-4 w-px shrink-0 bg-[rgba(28,31,35,0.12)]" />
                <button type="button" className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#222727]">
                  产品研发
                  <ChevronDown className="h-3 w-3" strokeWidth={2.2} />
                </button>
              </div>

              <button type="button" className="group relative mt-6 block h-[46px] w-full">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[-4px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-40"
                  style={CREATE_AGENT_HOVER_GLOW_STYLE}
                />
                <span className="relative z-[1] flex h-full w-full items-center justify-start gap-2 rounded-full bg-[#1c1f23] px-4 text-sm font-medium text-white">
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2.3} />
                  <span>创建项目</span>
                </span>
              </button>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="py-[10px] text-xs leading-4 text-[rgba(28,31,35,0.45)]">探索发现</div>
                  <ExpandedNavItem iconFillSrc={HUB_ICONS.square.fill} iconLineSrc={HUB_ICONS.square.line} label="智能体广场" active />
                </div>
                <div>
                  <div className="py-[10px] text-xs leading-4 text-[rgba(28,31,35,0.45)]">工作空间</div>
                  <div className="space-y-2">
                    <ExpandedNavItem iconFillSrc={HUB_ICONS.agents.fill} iconLineSrc={HUB_ICONS.agents.line} label="智能体" />
                    <ExpandedNavItem iconFillSrc={HUB_ICONS.toolbox.fill} iconLineSrc={HUB_ICONS.toolbox.line} label="工具箱" />
                    <ExpandedNavItem iconFillSrc={HUB_ICONS.knowledge.fill} iconLineSrc={HUB_ICONS.knowledge.line} label="知识库" />
                    <ExpandedNavItem iconFillSrc={HUB_ICONS.models.fill} iconLineSrc={HUB_ICONS.models.line} label="模型库" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full space-y-2 pb-1">
              <button
                type="button"
                className="flex w-full items-center justify-start gap-2.5 rounded-full px-4 py-[10px] text-left text-[rgba(28,31,35,0.72)] transition-colors hover:bg-white/60"
              >
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                  <img alt="" className="h-[18px] w-[18px] opacity-75" src="/assets/bell-03.svg" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">消息</span>
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5b57] px-1 text-[10px] font-semibold leading-none text-white">
                    6
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-start gap-2.5 rounded-full px-4 py-[10px] text-left text-[rgba(28,31,35,0.72)] transition-colors hover:bg-white/60"
              >
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                  <img alt="" className="h-[18px] w-[18px] opacity-75" src="/assets/layout-left.svg" />
                </span>
                <span className="text-sm font-medium">收起</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-start gap-[10px] rounded-full px-4 py-2 text-left transition-colors hover:bg-white/60"
              >
                <img alt="" className="h-8 w-8 rounded-full" src={CURRENT_USER.avatar} />
                <span className="text-sm font-semibold">{CURRENT_USER.name}</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ── Content (scrolls; rail stays fixed) ── */}
        <div className="thin-scroll relative min-w-0 flex-1 overflow-y-auto px-4 py-6 @[700px]:px-8">
          <div className="mx-auto flex w-full max-w-none flex-col">
            <div className="flex flex-col gap-4 @[700px]:flex-row @[700px]:items-center @[700px]:justify-between">
              <h1 className="text-[20px] font-semibold leading-7">智能体广场</h1>
              <div className="flex flex-col gap-3 @[460px]:flex-row @[460px]:items-center">
                <button
                  type="button"
                  className="flex h-9 items-center gap-1.5 rounded-full border border-[rgba(45,66,107,0.12)] bg-white px-4 text-[14px] font-semibold text-[rgba(28,31,35,0.8)]"
                >
                  <Star className="h-5 w-5" strokeWidth={2.1} />
                  我的收藏
                </button>
                <label className="flex h-9 items-center gap-3 rounded-full border border-[rgba(45,66,107,0.12)] bg-white px-4 text-[14px] text-[rgba(28,31,35,0.6)] @[1000px]:w-[210px]">
                  <Search className="h-5 w-5 shrink-0" strokeWidth={2.1} />
                  <input
                    className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] text-[#1c1f23] outline-none placeholder:text-[rgba(28,31,35,0.6)]"
                    placeholder="搜索"
                    type="text"
                  />
                </label>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(45,66,107,0.12)] bg-white text-[rgba(28,31,35,0.8)]"
                >
                  <Headphones className="h-5 w-5" strokeWidth={2.1} />
                </button>
              </div>
            </div>

            {/* Hero */}
            <motion.section
              className="mt-4 overflow-hidden rounded-[32px] bg-white shadow-[0_18px_40px_rgba(15,95,245,0.08)]"
              initial={moduleInitial}
              animate={moduleAnimate}
              transition={moduleTransition(0)}
            >
              <div className="relative overflow-hidden rounded-[32px]">
                <img
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  src={AGENT_HUB_ASSETS.hero}
                  style={{ objectPosition: 'calc(50% + 180px) center' }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, #150423 0px, #150423 calc(13.42% - 240px), rgba(22, 2, 29, 0.90) calc(42.32% - 240px), rgba(169, 121, 186, 0.00) 100%)',
                  }}
                />
                <div className="relative flex min-h-[192px] flex-col justify-between gap-6 px-8 py-6 @[700px]:flex-row @[700px]:items-center @[700px]:px-14">
                  <div className="max-w-full">
                    <h2 className="text-[16px] font-bold leading-6 text-white @[700px]:text-[22px] @[700px]:leading-8">
                      <span>Connect All, Creat Next</span>
                      <span>{'  '}全新 Agent 广场重磅推出！</span>
                    </h2>
                    <p className="mt-4 text-[12px] leading-4 text-white/70">
                      轻松创作、调用与管理智能体，一站式满足需求。深度集成抖音端到端生态，汇聚优质工具资源，
                      助您畅享 AI 新体验。
                    </p>
                  </div>
                  <div className="flex shrink-0 items-start">
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-[#1c1f23] shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                    >
                      <Plus className="h-5 w-5" strokeWidth={2.2} />
                      创建项目
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Featured */}
            <motion.section
              className="mt-4"
              initial={moduleInitial}
              animate={moduleAnimate}
              transition={moduleTransition(0.14)}
            >
              <h3 className="text-[20px] font-semibold leading-7">精品推荐</h3>
              <div className="mt-4">
                <div className="mx-auto w-full max-w-[2160px]">
                  <div className="grid grid-cols-2 gap-4 @[460px]:grid-cols-3 @[720px]:grid-cols-5">
                    {featuredHubAgents.slice(0, 5).map((agent) => (
                      <div key={agent.title} className="min-w-0">
                        <FeaturedCard {...agent} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Business products */}
            <motion.section
              className="mt-4"
              initial={moduleInitial}
              animate={moduleAnimate}
              transition={moduleTransition(0.21)}
            >
              <h3 className="text-[20px] font-semibold leading-7">业务产品</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 @[560px]:grid-cols-2 @[900px]:grid-cols-3">
                {businessProducts.map((product) => (
                  <BusinessProductCard key={product.title} {...product} />
                ))}
              </div>
            </motion.section>

            {/* Discovery */}
            <motion.section
              className="mt-4"
              initial={moduleInitial}
              animate={moduleAnimate}
              transition={moduleTransition(0.35)}
            >
              <h3 className="text-[20px] font-semibold leading-7">发现更多</h3>
              <div className="mt-4 flex flex-col gap-4 @[900px]:flex-row @[900px]:items-center @[900px]:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {discoveryTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`inline-flex h-7 items-center rounded-[8px] px-4 text-[14px] transition-colors ${
                        activeTab === tab
                          ? 'border border-[rgba(45,66,107,0.12)] bg-white font-semibold text-[#1c1f23]'
                          : 'text-[rgba(34,39,39,0.8)] hover:bg-white/80'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative self-start">
                  <button
                    type="button"
                    onClick={() => setSortOpen((v) => !v)}
                    onBlur={() => setTimeout(() => setSortOpen(false), 120)}
                    className="flex h-9 w-[144px] items-center justify-between rounded-full border border-[rgba(45,66,107,0.12)] bg-white px-4 text-[14px] font-medium text-[rgba(28,31,35,0.8)]"
                  >
                    {sortOption}
                    <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full z-20 mt-1 w-[144px] rounded-[16px] border border-[rgba(45,66,107,0.12)] bg-white p-1 shadow-[0_12px_24px_rgba(28,31,35,0.08)]">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSortOption(option)
                            setSortOpen(false)
                          }}
                          className={`flex w-full items-center rounded-[12px] px-3 py-2 text-left text-[14px] transition-colors hover:bg-[rgba(83,96,143,0.08)] ${
                            sortOption === option ? 'font-semibold text-[#1c1f23]' : 'text-[rgba(28,31,35,0.8)]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 @[560px]:grid-cols-2 @[840px]:grid-cols-3 @[1120px]:grid-cols-4 @[1400px]:grid-cols-5">
                {filteredAgents.map((agent) => (
                  <DiscoveryCard key={`${agent.category}-${agent.title}`} {...agent} />
                ))}
              </div>
            </motion.section>
          </div>

          <div className="pointer-events-none sticky bottom-0 z-10 -mt-[72px] flex justify-end pb-2 pr-2">
            <button
              type="button"
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(45,66,107,0.12)] bg-white text-[#1c1f23] shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
    </main>
  )
}
