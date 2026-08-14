import {
  ASSET_CATALOG,
  type AssetCatalogItem,
} from '../../assets/assetCatalog'

export type SkillStatus = '已有' | '待抽象'

export interface SkillItem {
  id: string
  name: string
  description: string
  group: '品牌与 IP' | '灵感设计' | '活动复盘' | '通用能力'
  category: 'Brand Kit' | 'IP 资产' | '活动设计' | '素材设计' | '游戏设计' | '产品设计' | '数据复盘' | '知识管理' | '搜索'
  status: SkillStatus
  invocation?: string
  provider?: '设计团队 Skill'
  sourceAsset?: AssetCatalogItem
}

export interface SkillCategory {
  key: string
  label: SkillItem['group']
  children: Array<{
    key: string
    label: SkillItem['category']
  }>
}

/**
 * 唯一内容来源：飞书 Wiki「X的技能/知识/模型/工具盘点-工坊结构」。
 * 这里是产品目录数据，不补写来源文档没有提供的作者、用量或更新时间。
 */
const workflowSkills: SkillItem[] = [
  {
    id: 'h5-page-generation',
    name: 'H5活动页生成（coding）',
    description: '完成需求分析、页面方案、大纲、组件选择、子 Agent 调度，并最终交付 coding 出来的 H5 页面。',
    group: '灵感设计',
    category: '活动设计',
    status: '已有',
    invocation: 'h5-page-generation',
  },
  {
    id: 'head-image',
    name: '页面头图生成',
    description: '负责 H5／原生页面头图生成、编辑和尺寸适配。',
    group: '灵感设计',
    category: '活动设计',
    status: '已有',
    invocation: 'head-image',
  },
  {
    id: 'workflow-creator',
    name: 'Native活动页生成（批量）',
    description: '新建、修改、批量生成，并可参考已有活动生成原生化、TTML、阿拉丁页面。',
    group: '灵感设计',
    category: '活动设计',
    status: '已有',
    invocation: 'workflow-creator',
  },
  {
    id: 'ip-keep-image',
    name: '海报制作（人像）',
    description: '保持人物或 IP 一致，按参考版式生成海报。',
    group: '灵感设计',
    category: '活动设计',
    status: '已有',
    invocation: 'ip-keep-image',
  },
  {
    id: 'livestream-sticker',
    name: '直播间贴片生成',
    description: '生成直播背景、艺术字、上下贴片、侧贴片和福袋等透明 PNG 套件。',
    group: '灵感设计',
    category: '素材设计',
    status: '已有',
    invocation: 'livestream-sticker',
  },
  {
    id: 'video-cover',
    name: '短视频封面生成',
    description: '解析视频、抽帧、理解内容并生成短视频封面。',
    group: '灵感设计',
    category: '素材设计',
    status: '已有',
    invocation: 'video-cover',
  },
  {
    id: 'series-image',
    name: '主KV-资源位扩展生成',
    description: '基于主 KV 生成 Banner 等多尺寸、同风格资源位图片。',
    group: '灵感设计',
    category: '素材设计',
    status: '已有',
    invocation: 'series-image',
  },
  {
    id: 'general-image-processing',
    name: '图片裁切',
    description: '裁切、处理并适配图片。',
    group: '灵感设计',
    category: '素材设计',
    status: '已有',
    invocation: 'general-image-processing',
  },
  {
    id: 'long-image-page-generation',
    name: '长图H5生成',
    description: '规划、生成并切分长图楼层。',
    group: '灵感设计',
    category: '素材设计',
    status: '已有',
    invocation: 'long-image-page-generation',
  },
  {
    id: 'dynamic-poster',
    name: '动态图生成',
    description: '将动态图转化成可动的视频或 GIF。',
    group: '灵感设计',
    category: '素材设计',
    status: '已有',
    invocation: 'dynamic-poster',
  },
  {
    id: 'general-image-generation-fallback',
    name: '兜底-通用图片生成',
    description: '所有专业生图技能都不匹配时的兜底。覆盖文生图、图像编辑、扩图、局部重绘、风格转换、套系延展、重新生成五类创作。',
    group: '灵感设计',
    category: '素材设计',
    status: '已有',
  },
  {
    id: 'game-card-series',
    name: '卡牌设计',
    description: '从一句话开始，经世界观、立绘风格和卡框样式选择，生成结构一致且包含文字、数值、阵营与立绘的一组卡牌成品图。',
    group: '灵感设计',
    category: '游戏设计',
    status: '已有',
    invocation: '游戏设计-套系结构-卡牌生成',
  },
  {
    id: 'game-ip-assets',
    name: '立绘设计',
    description: '根据一句话或游戏策划 Markdown 规划同一世界观下的资产树，并生成立绘、头像、背景图和 CG 图等美术资产。',
    group: '灵感设计',
    category: '游戏设计',
    status: '已有',
    invocation: '游戏设计-套系IP-美术资产生成',
  },
  {
    id: 'game-character-frame-animation',
    name: '帧动画生成',
    description: '一键式动画工作流：只需一张角色图和动作指令，系统就会自动输出透明背景的 Sprite Sheet 和 GIF。',
    group: '灵感设计',
    category: '游戏设计',
    status: '已有',
    invocation: '游戏设计-角色-帧动画生成',
    provider: '设计团队 Skill',
  },
  {
    id: 'ai-platform-interface-generation',
    name: 'AI平台-界面生成',
    description: '快速生成符合 AI 平台设计规范的 HTML 界面。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'life-service-b-global-style',
    name: '体服平台B端-全局样式',
    description: '体服 B 端风格 Skill：快速生成体服风格的页面样式，轻量刷新 CSS 样式。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'life-service-b-interface-generation',
    name: '体服平台B端-界面生成',
    description: '体服 B 端组件调用 Skill：调用组件和模板，生成高还原度的页面。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'life-service-b-dashboard',
    name: '体服平台B端-数据看板',
    description: '体服 B 端 Dashboard 组件调用 Skill：调用组件和模板，生成高还原度的页面。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'life-service-c-voip',
    name: '体服平台C端-VOIP',
    description: '体服 C 端 VoIP 组件调用 Skill：调用组件和模板，生成高还原度的页面。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'life-service-c-im',
    name: '体服平台C端-IM',
    description: '体服 C 端 IM 组件调用 Skill：调用组件和模板，生成高还原度的页面。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'miniapp-feed-interface-generation',
    name: '小程序&Feed异形卡-界面生成',
    description: '稳定生成较高质量的小程序界面，同时生产该小程序在 Feed 分发的异形卡，并符合抖音主端规范。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'consumer-agent-card-generation',
    name: 'C端智能体-卡片生成',
    description: '生成符合 C 端智能体规范的卡片，如玩法卡、活动卡、视频卡等。',
    group: '灵感设计',
    category: '产品设计',
    status: '已有',
    provider: '设计团队 Skill',
  },
  {
    id: 'activity-review-report',
    name: '复盘报告生成',
    description: '查询活动数据、分析并生成飞书复盘报告；当前能力由子 Agent 承载，待抽象成 Skill。',
    group: '活动复盘',
    category: '数据复盘',
    status: '待抽象',
  },
  {
    id: 'knowledge-management',
    name: '知识管理',
    description: '按阶段检索系统知识、团队知识和个人记忆，并控制读取顺序与证据范围。',
    group: '通用能力',
    category: '知识管理',
    status: '已有',
    invocation: 'knowledge-management',
  },
  {
    id: 'media-search',
    name: '抖音搜索',
    description: '搜索并注入真实视频、用户等媒体数据。',
    group: '通用能力',
    category: '搜索',
    status: '已有',
    invocation: 'media-search',
  },
]

const governedAssetSkills: SkillItem[] = ASSET_CATALOG
  .filter((item) => item.category === 'brand' || item.category === 'ip')
  .map((item) => ({
    id: item.id,
    name: item.name,
    description: item.summary,
    group: '品牌与 IP',
    category: item.category === 'brand' ? 'Brand Kit' : 'IP 资产',
    status: '已有',
    invocation: `asset-skill:${item.id}@${item.version}`,
    sourceAsset: item,
  }))

/**
 * Brand Kit / IP 在产品层以可调用 Skill 呈现；sourceAsset 继续保留
 * 版本、授权、参数和证据，避免为了统一入口而丢掉治理能力。
 */
export const skills: SkillItem[] = [
  ...governedAssetSkills,
  ...workflowSkills,
]

const categoryKey = (group: string, category: string) => `${group}/${category}`

export const skillCategories: SkillCategory[] = Array.from(
  skills.reduce((groups, item) => {
    const categories = groups.get(item.group) ?? new Set<SkillItem['category']>()
    categories.add(item.category)
    groups.set(item.group, categories)
    return groups
  }, new Map<SkillItem['group'], Set<SkillItem['category']>>()),
  ([group, categories]) => ({
    key: group,
    label: group,
    children: Array.from(categories, (category) => ({
      key: categoryKey(group, category),
      label: category,
    })),
  }),
)

export const skillCategoryKey = categoryKey
