import {
  ASSET_CATALOG,
  type AssetCatalogItem,
} from '../../assets/assetCatalog'

export type ResourceTabKey = 'toolbox' | 'knowledge' | 'model'

export interface ResourceItem {
  id: string
  title: string
  summary?: string
  tab: ResourceTabKey
  group: string
  category: string
  state?: string
  sourceAsset?: AssetCatalogItem
}

export const resourceTabOptions: Array<{
  key: ResourceTabKey
  label: string
}> = [
  { key: 'toolbox', label: '工具箱' },
  { key: 'knowledge', label: '知识库' },
  { key: 'model', label: '模型库' },
]

/**
 * 唯一内容来源：飞书 Wiki「X的技能/知识/模型/工具盘点-工坊结构」。
 * 不引入参考站 mock 中的 Plugin、发布器、触发器、作者、用量等字段。
 */
const baseResources: ResourceItem[] = [
  {
    id: 'douyin-media-search',
    title: '抖音媒体搜索',
    summary: '搜索真实抖音视频和用户；包含关键词搜视频、条件搜用户、昵称搜用户。',
    tab: 'toolbox',
    group: '抖音',
    category: '抖音搜索',
    state: '已有',
  },
  {
    id: 'douyin-media-detail',
    title: '抖音媒体详情查询',
    summary: '根据视频、用户或直播 ID，批量获取标题、封面、昵称、头像等完整信息。',
    tab: 'toolbox',
    group: '抖音',
    category: '视频内容',
    state: '已有',
  },
  {
    id: 'magicx-knowledge-search',
    title: 'MagicX 知识检索',
    summary: '搜索结构化知识，并按需读取知识正文、原始来源和个人记忆证据。',
    tab: 'toolbox',
    group: '通用能力',
    category: '数据检索',
    state: '已有',
  },
  {
    id: 'ai-image-generation',
    title: 'AI 图片生成',
    summary: '根据提示词生成页面头图、背景图和通用视觉素材。',
    tab: 'toolbox',
    group: '内容创作',
    category: '图片编辑',
    state: '已有',
  },
  {
    id: 'image-understanding',
    title: '图片智能理解',
    summary: '识别图片中的内容、文字、人物、布局和视觉风格。',
    tab: 'toolbox',
    group: '内容创作',
    category: '图片编辑',
    state: '已有',
  },
  {
    id: 'image-processing',
    title: '图片通用处理',
    summary: '提供图片抠图、尺寸适配、格式及资产类型转换。',
    tab: 'toolbox',
    group: '内容创作',
    category: '图片编辑',
    state: '已有',
  },
  {
    id: 'page-image-replace',
    title: '页面图片替换',
    summary: '定位页面 Schema 中的图片节点，并将新图片写入对应字段。',
    tab: 'toolbox',
    group: '内容创作',
    category: '图片编辑',
    state: '已有',
  },
  {
    id: 'page-schema-edit',
    title: '页面 Schema 编辑',
    summary: '初始化和修改 H5／Native 页面 Schema，支持节点及属性的增删改。',
    tab: 'toolbox',
    group: '开发工具',
    category: '界面开发',
    state: '已有',
  },
  {
    id: 'magicx-component-query',
    title: 'MagicX 组件查询',
    summary: '搜索可用组件，获取组件属性接口、默认值和使用约束。',
    tab: 'toolbox',
    group: '开发工具',
    category: '界面开发',
    state: '已有',
  },
  {
    id: 'page-preview-validation',
    title: '页面预览校验',
    summary: '获取页面截图，检查布局越界、组件嵌套及结构完整性。',
    tab: 'toolbox',
    group: '开发工具',
    category: '界面开发',
    state: '已有',
  },
  {
    id: 'history-page-reference',
    title: '历史页面引用',
    summary: '读取已有魔方或 MagicX 页面的 Schema、组件及玩法信息。',
    tab: 'toolbox',
    group: '开发工具',
    category: '界面开发',
    state: '已有',
  },
  {
    id: 'figma-page-conversion',
    title: 'Figma 页面转换',
    summary: '将 Figma 设计节点转换为可继续编辑的页面结构。',
    tab: 'toolbox',
    group: '开发工具',
    category: '界面开发',
    state: '已有',
  },
  {
    id: 'native-page-build',
    title: 'Native 页面构建',
    summary: '查询 Native 能力，召回页面模板，生成数据源及 TTML Schema。',
    tab: 'toolbox',
    group: '开发工具',
    category: '界面开发',
    state: '已有',
  },
  {
    id: 'magicx-component-knowledge',
    title: 'MagicX 组件知识库',
    summary: '沉淀 MagicX 组件目录、业务语义、属性、默认值、使用限制和玩法绑定关系，支持组件选型及页面 Schema 生成。',
    tab: 'knowledge',
    group: 'H5 页面开发',
    category: '组件知识',
    state: '已有',
  },
  {
    id: 'h5-page-spec',
    title: 'H5 页面搭建规范库',
    summary: '包含页面类型、大纲设计、Schema 结构、HTML Mix、组件 Slot、设计 Token、生成与校验规范。',
    tab: 'knowledge',
    group: 'H5 页面开发',
    category: 'H5 页面规范',
    state: '分散，待归集',
  },
  {
    id: 'activity-cases',
    title: '活动案例与历史大纲库',
    summary: '沉淀历史活动方案、大纲结构、落地页面案例和可复用经验，支持按业务场景、行业和玩法检索。',
    tab: 'knowledge',
    group: '活动设计',
    category: '案例经验',
    state: '已有，待归集',
  },
  {
    id: 'magicx-gameplay-knowledge',
    title: 'MagicX 玩法知识库',
    summary: '包含玩法类型、任务类型、奖励类型、配置结构、业务约束、玩法图谱和历史玩法案例。',
    tab: 'knowledge',
    group: '活动设计',
    category: '玩法知识',
    state: '已有',
  },
  {
    id: 'native-ttml-knowledge',
    title: 'Native／TTML 页面知识库',
    summary: '包含原生化设计原则、页面模板、TTML 页面结构、数据源配置和审核规则。',
    tab: 'knowledge',
    group: 'Native 页面开发',
    category: '原生化规范',
    state: '已有，待归集',
  },
  {
    id: 'magicx-visual-spec',
    title: 'MagicX 视觉资源规范库',
    summary: '包含头图、主 KV、卡牌、直播贴片、短视频封面等资源的尺寸、构图、文字保留和交付规范。',
    tab: 'knowledge',
    group: '视觉设计',
    category: '视觉规范',
    state: '分散，待归集',
  },
  {
    id: 'page-type-boundary',
    title: '页面类型与投放端知识库',
    summary: '定义 H5、Native 等页面类型、投放渠道，以及组件、玩法和生成模式的能力边界。',
    tab: 'knowledge',
    group: '通用能力',
    category: '产品能力边界',
    state: '已有系统知识',
  },
  {
    id: 'magicx-team-knowledge',
    title: 'MagicX 团队知识库',
    summary: '收录团队维护的结构化知识、Wiki／文档来源、最佳实践、团队偏好和决策记录，并保留来源与更新时间。',
    tab: 'knowledge',
    group: '通用能力',
    category: '团队知识',
    state: '已有基础设施，内容待核',
  },
  { id: 'gpt-5-5', title: 'GPT-5.5', tab: 'model', group: '基础模型', category: 'GPT 系列' },
  { id: 'deepseek-v4-flash', title: 'DeepSeek-V4-flash', tab: 'model', group: '基础模型', category: 'DeepSeek 系列' },
  { id: 'kimi-k2-5', title: 'kimi-k2.5', tab: 'model', group: '基础模型', category: 'Kimi 系列' },
  { id: 'seedream-5-lite', title: 'Seedream-5-Lite', tab: 'model', group: '多模态生成模型', category: '图片生成' },
  { id: 'seedream-4-5', title: 'Seedream-4.5', tab: 'model', group: '多模态生成模型', category: '图片生成' },
  { id: 'nano-banana-2', title: 'Nano-Banana-2', tab: 'model', group: '多模态生成模型', category: '图片生成' },
  { id: 'gpt-image-2', title: 'GPT-Image-2', tab: 'model', group: '多模态生成模型', category: '图片生成' },
  { id: 'seedance-1-5', title: 'Seedance-1.5', tab: 'model', group: '多模态生成模型', category: '视频生成' },
]

const knowledgeGroupByCategory = {
  gameplay: '玩法库',
  'page-component': '页面组件库',
  font: '字体库',
} as const

const governedKnowledgeItems: ResourceItem[] = ASSET_CATALOG
  .filter((item) => item.category === 'gameplay' || item.category === 'page-component' || item.category === 'font')
  .map((item) => ({
    id: `knowledge:${item.id}`,
    title: item.name,
    summary: item.summary,
    tab: 'knowledge',
    group: knowledgeGroupByCategory[item.category as keyof typeof knowledgeGroupByCategory],
    category:
      item.category === 'page-component'
        ? item.assetClass === 'native-component'
          ? 'Native 组件'
          : item.assetClass === 'lynx-component'
            ? 'Lynx 组件'
            : 'H5 组件'
        : item.category === 'font'
          ? '字体规范'
          : '玩法规范',
    state: item.status === '已发布' ? '已有' : item.status,
    sourceAsset: item,
  }))

/** 资源库是知识入口；结构化资产继续作为来源与版本证据挂在条目上。 */
export const resources: ResourceItem[] = [
  ...governedKnowledgeItems,
  ...baseResources,
]

export const resourcesForTab = (tab: ResourceTabKey) =>
  resources.filter((item) => item.tab === tab)
