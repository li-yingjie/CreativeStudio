import {
  ASSET_CATALOG,
  type AssetCatalogItem,
} from '../../assets/assetCatalog.ts'

export interface ResourceParameter {
  name: string
  type: string
  description: string
  required?: boolean
  expandable?: boolean
}

export interface KnowledgeFileItem {
  name: string
  status: string
  autoUpdate: string
  enabled: boolean
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
}

export interface ModelResourceDetail {
  status: string
  serviceAgents: string
  totalCalls: string
  permission: string
  generationType: string
  inputModalities: readonly string[]
  capabilityTags: readonly string[]
  contextLength: string
  maxOutput: string
  baseModel: string
  modelKey: string
  endpoint: string
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export type ResourceTabKey = 'toolbox' | 'knowledge' | 'model'

export interface ResourceItem {
  id: string
  title: string
  summary?: string
  tab: ResourceTabKey
  group: string
  category: string
  state?: string
  externalId?: string
  provider?: string
  updatedAt?: string
  metrics?: readonly string[]
  toolId?: string
  inputParameters?: readonly ResourceParameter[]
  outputParameters?: readonly ResourceParameter[]
  knowledgeKind?: string
  knowledgeFiles?: readonly KnowledgeFileItem[]
  modelDetail?: ModelResourceDetail
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
    id: 'kit-platform-headline-creator-tool',
    title: '账号_投放_加油包投放效果不好',
    summary: '根据已投放量级和目标投放量级的比较结果判断投放状态，返回“是”、“否”或“未投放”。',
    tab: 'toolbox',
    group: '抖音',
    category: '投放工具',
    externalId: 'KIT_PLATFORM-HEADLINE_CREATOR-TOOL-7633721570092845862',
    provider: 'kit客服平台',
    updatedAt: '08-10 更新',
    metrics: ['0', '0', '--'],
    toolId: '0',
    inputParameters: [
      {
        name: 'paramMap',
        type: 'object',
        description: 'map[string]string 入参，key 有 item_id（视频或图集 id）、user_id（用户 ID）',
        required: true,
      },
      {
        name: 'businessScene',
        type: 'string',
        description: '固定值：asset_center',
        required: true,
      },
      {
        name: 'abilityIDs',
        type: 'array',
        description: '能力 ID 列表，固定值 [1007389]',
        required: true,
        expandable: true,
      },
    ],
    outputParameters: [
      {
        name: 'data',
        type: 'object',
        description: 'key 为 abilityID，value 为执行结果',
      },
    ],
  },
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
    id: 'ai-workbench-knowledge-base',
    title: 'AI工作台知识库',
    summary: '知识库是智能体“资料库”，含分类及使用示例，能提升智能体回复准确性等。',
    tab: 'knowledge',
    group: '通用能力',
    category: '团队知识',
    knowledgeKind: '文件',
    knowledgeFiles: [
      {
        name: 'AI工作台丨基础功能 知识库',
        status: '解析完成',
        autoUpdate: '未开启',
        enabled: true,
        createdBy: '刘学涛',
        createdAt: '2026-08-14 03:39:11',
        updatedBy: '刘学涛',
        updatedAt: '2026-08-14 03:40:43',
      },
    ],
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
  {
    id: 'doubao-1-5-vision-pro-32k',
    title: 'Doubao-1.5-vision-pro-32k',
    summary: 'Doubao-1.5-vision-pro 全新升级的多模态大模型，支持任意分辨率和极端长宽比图像识别，增强视觉推理、文档识别、细节信息理解和指令遵循能力。支持 32k 上下文窗口，输出长度支持最大 12k tokens。',
    tab: 'model',
    group: '基础模型',
    category: '豆包系列',
    modelDetail: {
      status: '已上线',
      serviceAgents: '43',
      totalCalls: '6K',
      permission: '共享',
      generationType: '文本生成',
      inputModalities: ['文本'],
      capabilityTags: ['大语言模型', '工具调用'],
      contextLength: '--',
      maxOutput: '12k',
      baseModel: '豆包',
      modelKey: 'Doubao-1.5-vision-pro-32k',
      endpoint: 'ep-20250804145050-gnzfd',
      createdAt: '2025-08-21 18:43:22',
      updatedAt: '2025-10-10 18:47:16',
      updatedBy: '罗智佳',
    },
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
