import type { GenerationReference, RegistryDomain } from '../gameplay/contracts'
import {
  ACG_NEW_YEAR_BRAND_KIT_PROFILE,
  DOUYIN_SPRING_FESTIVAL_BRAND_KIT_PROFILE,
  ZHUAMA_UGC_BRAND_KIT_PROFILE,
  type BrandKitProfile,
} from './brandKitProfiles.ts'
import { XINZAI_IP_KIT_PROFILE, type IpKitProfile } from './ipKitProfiles.ts'
import {
  DOUYIN_LIFE_SERVICE_RESOURCE_POSITION_PROFILE,
  type ResourcePositionProfile,
} from './resourcePositionProfiles.ts'
import {
  QIXI_MAGPIE_HUNT_GAMEPLAY_PROFILE,
  type GameplayAssetProfile,
} from './gameplayAssetProfiles.ts'

export type AssetCenterCategory =
  | 'page-component'
  | 'page-template'
  | 'material-template'
  | 'brand'
  | 'ip'
  | 'gameplay'
  | 'inspiration'
  | 'font'
  | 'activity-template'

export type AssetClass =
  | 'activity-template'
  | 'page-template'
  | 'h5-component'
  | 'native-component'
  | 'lynx-component'
  | 'brand-kit'
  | 'character-kit'
  | 'banner-template'
  | 'live-room-kit'
  | 'live-component'
  | 'style-profile'
  | 'layer-template'
  | 'gameplay-package'
  | 'font-family'

export type AssetParameterMode = '可配置' | 'Agent 推断' | '引用资产' | '固定规则'

export interface AssetParameter {
  label: string
  value: string
  mode: AssetParameterMode
  note?: string
}

export interface AssetParameterGroup {
  name: string
  summary: string
  parameters: readonly AssetParameter[]
}

export interface AssetDeliverable {
  name: string
  specification: string
  required: boolean
}

export interface AssetVisualReference {
  src: string
  label: string
  specification: string
  objectPosition?: string
}

export interface ActivityTemplateProfile {
  purpose: string
  organization: string
  gameplay: string
  scale: string
  format: string
  fit: string
  systemMap: {
    journey: readonly { label: string; detail: string }[]
    assetInputs: readonly { label: string; role: string }[]
    outputs: readonly { label: string; detail: string }[]
  }
}

export interface AssetCatalogItem {
  id: string
  category: AssetCenterCategory
  assetClass: AssetClass
  registry: RegistryDomain
  name: string
  version: string
  summary: string
  owner: string
  status: '草稿' | '已发布' | '内测中' | '待更新'
  updatedAt: string
  tags: readonly string[]
  coverage: readonly string[]
  metrics: readonly { label: string; value: string }[]
  parameterGroups: readonly AssetParameterGroup[]
  deliverables: readonly AssetDeliverable[]
  constraints: readonly string[]
  usage: string
  accent: string
  preview?: string
  thumbnail?: string
  visualReferences?: readonly AssetVisualReference[]
  templateProfile?: ActivityTemplateProfile
  brandKitProfile?: BrandKitProfile
  resourcePositionProfile?: ResourcePositionProfile
  ipKitProfile?: IpKitProfile
  gameplayProfile?: GameplayAssetProfile
  basedOn?: {
    assetId: string
    name: string
    version: string
  }
  sourceFiles?: readonly {
    name: string
    format: string
    status: '已归档' | '待校验'
  }[]
  governance: {
    source: string
    evidence: string
    rights: string
    qualityGate: string
    importFormats: readonly string[]
  }
}

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  'activity-template': '活动项目模板',
  'page-template': '页面模板',
  'h5-component': 'H5 组件',
  'native-component': 'Native 组件',
  'lynx-component': 'Lynx 组件',
  'brand-kit': 'Brand Kit',
  'character-kit': 'IP 角色',
  'banner-template': 'Banner 模板',
  'live-room-kit': '直播间套件',
  'live-component': '直播组件',
  'style-profile': 'Style Bible',
  'layer-template': '分层模板',
  'gameplay-package': '玩法能力包',
  'font-family': '字体家族',
}

export const ASSET_CENTER_CATEGORIES: readonly {
  id: AssetCenterCategory
  label: string
  description: string
}[] = [
  { id: 'brand', label: 'Brand Kit', description: '品牌主体级身份系统：Logo、品牌色、字体角色、联名锁定与不可变使用规则' },
  { id: 'gameplay', label: '玩法库', description: '可生成、可编辑、可校验、可运行的玩法能力包' },
  { id: 'page-component', label: '页面组件库', description: '可独立引用的 H5、Native 与 Lynx 页面组件' },
  { id: 'ip', label: 'IP 资产', description: '角色、动作、表情、道具、授权范围与不可变结构组成的可复用 IP Kit' },
  { id: 'font', label: '字体库', description: '字重、角色、授权和端能力明确的字体资产' },
] as const

const commonBrandGovernance = {
  rights: '仅用于已授权的抖音生活服务业务；站外传播与源文件导出需再次核验授权',
  importFormats: ['PNG', 'SVG', 'Figma', 'PSD'],
} as const

function createPageTemplate({
  id,
  name,
  surface,
  summary,
  preview,
  source,
  specification,
  modules,
  accent,
}: {
  id: string
  name: string
  surface: 'H5' | 'Lynx'
  summary: string
  preview: string
  source: string
  specification: string
  modules: readonly string[]
  accent: string
}): AssetCatalogItem {
  return {
    id,
    category: 'page-template',
    assetClass: 'page-template',
    registry: 'asset',
    name,
    version: '1.0.0',
    summary,
    owner: '活动体验设计',
    status: '已发布',
    updatedAt: '2026-08-10',
    tags: [surface, ...modules.slice(0, 3)],
    coverage: [surface, '站内活动页', 'Web Preview'],
    metrics: [
      { label: '页面', value: '1 个' },
      { label: '运行载体', value: surface },
      { label: '预览比例', value: '100%' },
    ],
    parameterGroups: [
      {
        name: '页面信息',
        summary: '页面预览、适用端及包含模块。',
        parameters: [
          { label: '页面模块', value: modules.join(' / '), mode: '可配置' },
          { label: '页面类型', value: surface, mode: '固定规则' },
          { label: '画布尺寸', value: '390px 宽 · 原始比例', mode: '固定规则' },
          { label: '适用场景', value: modules.slice(0, 3).join('、'), mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name, specification: `${surface} 页面`, required: true },
      { name: '页面说明', specification: '包含模块、适用场景与使用要求', required: true },
    ],
    constraints: ['按原始比例预览页面', '关键内容保持在页面安全区内', '品牌、IP 与人物素材按项目授权使用'],
    usage: `适用于${modules.join('、')}等活动页面场景`,
    accent,
    thumbnail: preview,
    visualReferences: [{ src: preview, label: `${name}设计对照`, specification }],
    governance: {
      source,
      evidence: `${name}正式设计稿与页面预览`,
      rights: '复用页面结构；具体品牌、IP、人物和成片素材按项目授权替换',
      qualityGate: '核心交互、页面适配、文字安全区与来源文件检查',
      importFormats: ['Figma Frame', `${surface} Page`, '页面说明'],
    },
  }
}

type PageComponentSurface = 'H5' | 'Native' | 'Lynx'

function createPageComponent({
  id,
  name,
  surface,
  summary,
  preview,
  source,
  specification,
  slots,
  accent,
}: {
  id: string
  name: string
  surface: PageComponentSurface
  summary: string
  preview: string
  source: string
  specification: string
  slots: readonly string[]
  accent: string
}): AssetCatalogItem {
  const assetClass: AssetClass =
    surface === 'H5'
      ? 'h5-component'
      : surface === 'Native'
        ? 'native-component'
        : 'lynx-component'
  return {
    id,
    category: 'page-component',
    assetClass,
    registry: 'asset',
    name,
    version: '1.0.0',
    summary,
    owner: '活动体验设计',
    status: '已发布',
    updatedAt: '2026-08-10',
    tags: [surface, '页面组件', ...slots.slice(0, 3)],
    coverage: [surface, '活动页', '组件引用'],
    metrics: [
      { label: '运行载体', value: surface },
      { label: '可配置槽位', value: `${slots.length} 类` },
      { label: '引用单位', value: '1 个组件' },
    ],
    parameterGroups: [
      {
        name: '组件接口',
        summary: '组件只管自身的内容、状态和交互，页面路由项目组装。',
        parameters: [
          { label: '运行载体', value: surface, mode: '固定规则' },
          { label: '内容槽位', value: slots.join(' / '), mode: '可配置' },
          { label: '状态回调', value: '加载 / 空态 / 成功 / 失败', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name, specification: `${surface} 组件包 · 真实运行态`, required: true },
      { name: '组件接口定义', specification: '属性、事件、状态与降级规则', required: true },
    ],
    constraints: ['只封装单一页面组件', '不携带项目品牌与授权素材', '引用后仍由页面管理布局与路由'],
    usage: `在 ${surface} 页面中引用「${name}」，再绑定本项目的文案、数据和素材`,
    accent,
    thumbnail: preview,
    visualReferences: [{ src: preview, label: `${name}真实应用`, specification }],
    governance: {
      source,
      evidence: `${name}在已上线活动页中的实际使用画面`,
      rights: '复用组件结构与交互；品牌、IP 和成片素材按项目授权替换',
      qualityGate: '端能力、内容槽位、状态闭环、埋点和降级检查',
      importFormats: ['Figma Component', `${surface} Component`, 'JSON Schema'],
    },
  }
}

export const ASSET_CATALOG: readonly AssetCatalogItem[] = [
  createPageComponent({
    id: 'component.h5.venue-header',
    name: '会场头图组件',
    surface: 'H5',
    summary: '活动标题、主视觉、会场切换与分享入口组成的 H5 首屏组件。',
    preview: '/assets/figma-deliverables/acg/gameplay-header.png',
    source: '2026 抖音 ACG 新春会 · Figma 资源位延展',
    specification: '1002 × 600 真实会场头图；用于 H5 首屏组件对照',
    slots: ['主标题', '活动时间', '会场切换', '分享入口'],
    accent: '#EE5E3B',
  }),
  createPageComponent({
    id: 'component.h5.card-atlas',
    name: '卡片图鉴组件',
    surface: 'H5',
    summary: '卡组分类、持有状态、锁定态与卡片详情组成的 H5 图鉴组件。',
    preview: '/assets/figma-deliverables/evernight/collection-page.png',
    source: '《永夜星河》独星河小卡 · Figma 页面',
    specification: '750 × 2687 图鉴页中的真实卡片组件应用',
    slots: ['卡面', '稀有度', '持有数量', '锁定态'],
    accent: '#7652D6',
  }),
  createPageComponent({
    id: 'component.native.activity-entry',
    name: '活动入口卡组件',
    surface: 'Native',
    summary: '在原生内容首页中承接活动标识、进度和主动作的入口卡。',
    preview: '/assets/figma-deliverables/xiahua/native-activity-home.png',
    source: 'UGC 活动 2026H1 · Figma 暑期 UI',
    specification: '390 × 845 原生活动首页实际应用',
    slots: ['活动标识', '进度', '主动作', '状态角标'],
    accent: '#3A9CB5',
  }),
  createPageComponent({
    id: 'component.native.onboarding-dialog',
    name: '新手引导弹层',
    surface: 'Native',
    summary: '首次进入活动时展示玩法摘要、步骤和开始动作的原生弹层。',
    preview: '/assets/figma-deliverables/xiahua/onboarding-dialog.png',
    source: 'UGC 活动 2026H1 · Figma 暑期 UI',
    specification: '375 × 812 首次进入态真实画面',
    slots: ['标题', '规则摘要', '步骤图', '主按钮'],
    accent: '#20A1C4',
  }),
  createPageComponent({
    id: 'component.lynx.live-room-frame',
    name: '直播间活动边框',
    surface: 'Lynx',
    summary: '直播画面、活动标识、任务入口和下方操作区组成的 Lynx 容器组件。',
    preview: '/assets/figma-deliverables/evernight/live-room-frame.png',
    source: '《永夜星河》抽卡 · Figma 直播间画板',
    specification: '375 × 812 直播间 Lynx 边框真实应用',
    slots: ['活动标识', '任务入口', '互动区', '安全区'],
    accent: '#6B4BD2',
  }),
  createPageComponent({
    id: 'component.lynx.draw-stage',
    name: '抽卡结果舞台',
    surface: 'Lynx',
    summary: '卡牌翻开、稀有度反馈、结果操作与再抽一次组成的 Lynx 结果组件。',
    preview: '/assets/figma-deliverables/evernight/draw-result-stage.png',
    source: '《永夜星河》抽卡 · Figma 页面',
    specification: '672 × 924 抽卡结果舞台真实应用',
    slots: ['卡面', '稀有度', '结果文案', '结果动作'],
    accent: '#7B59C8',
  }),
  {
    id: 'template.ip-co-brand-dual-venue-event',
    category: 'activity-template',
    assetClass: 'activity-template',
    registry: 'asset',
    name: '新春会模板',
    version: '1.1.0',
    summary: '从 ACG 新春会真实交付中抽取的节点活动配方：以主会场、1–N 个内容分会场、阶段互动和结算传播组织 Lynx、H5、资源位与战报，不携带具体品牌、IP 或成片。',
    owner: '活动产品中台',
    status: '已发布',
    updatedAt: '2026-08-10',
    tags: ['新春会', '多会场', '内容互动', '阶段传播'],
    coverage: ['抖音', 'Lynx', '站内 H5', '站内资源位', '图片生成'],
    metrics: [
      { label: '组织形式', value: '主会场 + 分会场' },
      { label: '标准规模', value: '中大型节点活动' },
      { label: '核心玩法', value: '榜单 + 助力' },
    ],
    templateProfile: {
      purpose: '把多个内容品类、合作方或 IP 组织成一场节点型内容盛典，统一活动主题，同时保留各分会场独立参与空间。',
      organization: '1 个主会场统筹活动身份与总入口，1–5 个分会场按内容品类或合作方分流；运营、合作方、嘉宾和创作者围绕同一阶段节奏协作。',
      gameplay: '内容榜单与用户助力构成默认主循环；投稿、预约、投票可替换，场景小游戏与集卡作为可选增强组件。',
      scale: '标准档为 4 个活动阶段、2–5 个分会场、2–4 个玩法组件、12–30 项跨渠道交付；适合 4–8 周的中大型节点活动。',
      format: 'Lynx/H5 主会场与分会场，配套搜索、话题、活动中心等站内入口，以及节目单、传播图和结算战报。',
      fit: '适合春节、周年、暑期等节点盛典及多 IP/多合作方内容活动；不适合只需要一个抽奖页或单次资源位投放的轻量需求。',
      systemMap: {
        journey: [
          { label: '资源位触达', detail: '用户先看懂活动主题' },
          { label: '进入主会场', detail: '理解内容与参与入口' },
          { label: '选择分会场', detail: '按品类或合作方分流' },
          { label: '榜单与助力', detail: '围绕内容持续参与' },
          { label: '分享与结算', detail: '回流并形成阶段战报' },
        ],
        assetInputs: [
          { label: '新春会模板', role: '活动结构' },
          { label: 'Brand Kit', role: '品牌身份' },
          { label: 'Style Bible', role: '视觉语法' },
          { label: 'IP / 内容素材', role: '项目内容' },
          { label: '榜单 / 助力包', role: '运行玩法' },
        ],
        outputs: [
          { label: '主会场与分会场', detail: 'Lynx / H5 可交互页面' },
          { label: '站内入口', detail: '搜索、话题、活动中心资源位' },
          { label: '传播与结算', detail: '节目单、传播图和战报' },
        ],
      },
    },
    parameterGroups: [
      {
        name: '活动主流程内核',
        summary: '定义用户如何触达、分流、参与、回流和结算；引用后写入 ActivitySpec，并在项目文档中结构化展示。',
        parameters: [
          { label: '参与主循环', value: '资源位触达 → 主会场理解 → 1–N 个内容会场分流 → 内容互动 → 分享回流 → 结算传播', mode: '固定规则' },
          { label: '入口', value: '话题 Banner / 站内资源位 / 分享回流', mode: '可配置' },
          { label: '分支规则', value: '按内容品类、合作方或人群偏好进入对应分会场', mode: '可配置' },
          { label: '回流与完成', value: '组件结果回写榜单/个人状态；结算快照驱动战报', mode: '固定规则' },
          { label: '阶段模型', value: '预热 → 主会场开启 → 分会场主推 → 结算战报', mode: '固定规则' },
          { label: '会场结构', value: '1 个主会场 + 1–N 个内容分会场', mode: '可配置', note: 'ACG 实例使用游戏/二次元双分会场；模板本身不固化为两个。' },
          { label: '内容骨架', value: '主题 Hero / 会场入口 / 嘉宾主理人 / 分类榜单 / 权益与规则', mode: '固定规则' },
          { label: '状态模型', value: '页面、状态变体与渠道变体分别计数', mode: '固定规则', note: '同一页面的 5 个榜单状态不能误算为 5 个页面。' },
        ],
      },
      {
        name: '玩法组件槽位',
        summary: '组件挂载在主流程节点上，只声明能力契约和槽位约束，不反向定义整个活动流程。',
        parameters: [
          { label: '内容互动', value: '至少 1 个 · 榜单 / 助力 / 投票 / 预约等能力包', mode: '引用资产' },
          { label: '场景小游戏', value: '可选 · 跃马攀峰等轻量玩法', mode: '引用资产' },
          { label: '收集玩法', value: '可选 · 集卡 / 集章能力包', mode: '引用资产' },
          { label: '跨玩法关系', value: '由 ActivitySpec 引用图与 Compiler 校验', mode: '固定规则' },
        ],
      },
      {
        name: '视觉与内容输入',
        summary: '主品牌、节日风格和 IP 资产按角色叠加，不把视觉值固化进模板。',
        parameters: [
          { label: '主 Brand Kit', value: '必选 1 个并锁定版本', mode: '引用资产' },
          { label: '节日 Style Profile', value: '可选 1 个；春节 / 暑期 / 周年等', mode: '引用资产' },
          { label: 'IP Kit', value: '0–N 个；角色、嘉宾、合作游戏资产', mode: '引用资产' },
          { label: '内容清单', value: '会场分类、主理人、榜单口径、规则与阶段文案', mode: '可配置' },
        ],
      },
      {
        name: '激励与编译',
        summary: '奖励不内联进玩法；模板保留独立激励槽位和人工接管语义。',
        parameters: [
          { label: '激励方案', value: '无激励 / 虚拟权益 / 实物 / 流量；项目必须显式选择或待确认', mode: '可配置' },
          { label: '交付物状态', value: '已生成 / 已人工编辑 / 已锁定', mode: '固定规则' },
          { label: '重编译策略', value: '只更新受影响交付物；人工接管内容先展示差异', mode: '固定规则' },
          { label: '尺寸合同', value: '同时记录设计画板与真实交付尺寸', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '主会场页面', specification: '1 个主入口 Surface；Hero、分会场入口、阶段内容与核心互动入口，具体 Lynx/H5 合同由项目选择', required: true },
      { name: '内容分会场页面', specification: '按内容分类实例化 N 个路由；页面数量、状态数量和渠道变体分别计数', required: true },
      { name: '资源位矩阵', specification: '话题 Banner、大横图、竖图、入口卡；尺寸从项目 Delivery Surface 读取并逐项校验', required: true },
      { name: '玩法视觉件', specification: '按已启用玩法生成主页、卡片、任务卡和结果态；运行逻辑仍由 GameplayPackage 提供', required: false },
      { name: '节目单与宣发', specification: '节目单长图、横卡、海报等渠道变体；画幅和内容槽位由项目合同决定', required: true },
      { name: '结算战报', specification: '数据驱动的长图与渠道版；允许人工排版并锁定，重编译前必须展示差异', required: true },
    ],
    constraints: [
      '探索方向稿、脑暴板和外部参考不得计入交付完成度',
      '状态变体与独立页面分别计数，避免错误估算工作量',
      '没有激励证据时必须标记待确认，不得由 Agent 臆造奖品',
      '人工编辑或锁定的交付物不得被重编译静默覆盖',
    ],
    usage: '2026 抖音 ACG 新春会锁定 v1.1.0；该项目实例化 2 个分会场并启用榜单/助力，模板仍允许其它会场数和互动组件',
    accent: '#EA5B34',
    visualReferences: [
      { src: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png', label: '游戏中心发现页 Banner', specification: 'Figma node 2229:63622 · 1372×512' },
      { src: '/assets/figma-deliverables/acg/key-visual-landscape.png', label: '主会场 KV 横版', specification: 'Figma node 2253:13642 · 1920×1080' },
      { src: '/assets/figma-deliverables/acg/game-venue-long.png', label: '游戏分会场长页', specification: 'Figma node 1470:25605 · 750×9776' },
      { src: '/assets/figma-deliverables/acg/program-guide-long.png', label: '节目单长图', specification: 'Figma node 2895:67559 · 1080×11493' },
    ],
    sourceFiles: [
      { name: '2026 抖音ACG新春会-创意.fig', format: 'Figma', status: '已归档' },
      { name: 'activity-template.manifest.json', format: 'JSON', status: '已归档' },
    ],
    governance: {
      source: '2026 抖音 ACG 新春会真实创意交付复盘',
      evidence: 'ACG 新春会正式分会场、资源位、节目单和战报节点作为首个验证实例；项目像素不写入模板合同',
      rights: '模板结构可跨项目复用；具体 ACG 品牌、春节视觉、IP 群像和项目成片不属于模板',
      qualityGate: '阶段完整性、玩法槽位兼容、页面/状态计数、设计/交付尺寸、安全区、人工锁定与必交付项检查',
      importFormats: ['Figma', 'JSON', 'Markdown', 'CSV'],
    },
  },
  {
    id: 'brand.douyin-acg-new-year-2026',
    category: 'brand',
    assetClass: 'brand-kit',
    registry: 'asset',
    name: '抖音 ACG Brand Kit · 新春会应用版',
    version: '1.2.0',
    summary: '面向活动页面、会场与站内资源位的品牌身份、视觉基调和组件样式规范。',
    owner: '抖音 ACG 视觉设计',
    status: '已发布',
    updatedAt: '2026-08-19',
    tags: ['抖音 ACG', '品牌锁定', '舞台语法', '玩法皮肤', '跨画幅适配'],
    coverage: ['抖音', 'Lynx', '站内 H5', '站内资源位', '图片生成'],
    metrics: [
      { label: '品牌标识', value: '2 组' },
      { label: '配色色板', value: '9 色' },
      { label: '组件样式', value: '4 类' },
    ],
    parameterGroups: [
      {
        name: '品牌身份',
        summary: '主身份与会场身份按固定角色使用，不从项目正文重新生成。',
        parameters: [
          { label: '主品牌', value: '抖音 ACG', mode: '固定规则' },
          { label: '活动标题', value: '抖音 ACG 新春会 / 新春会独立标题字', mode: '引用资产' },
          { label: '会场子身份', value: '游戏会场 / 二次元会场', mode: '引用资产', note: '只属于本项目应用版，不是抖音 ACG 永久品牌分类。' },
          { label: '平台联名', value: '抖音游戏、抖音动漫按场景启用', mode: '可配置' },
        ],
      },
      {
        name: '品牌表达边界',
        summary: '只定义可跨画幅保持的身份关系；场景、氛围、群像构图交给关联 Style Bible。',
        parameters: [
          { label: '品牌基础色', value: '抖音黑 / 白；活动色不得改变 Logo 本体', mode: '固定规则' },
          { label: '活动色与构图', value: '引用“新春热力 · ACG Style Bible”', mode: '引用资产' },
          { label: '标题层级', value: 'ACG 标识 < 新春会主标题 < 阶段口号', mode: '固定规则' },
          { label: '字体角色', value: '活动主标题使用定制标题字图层；UI 正文沿用平台字体角色', mode: '固定规则', note: '具体字体文件仍需从 Figma 字体清单补齐校验。' },
        ],
      },
      {
        name: '内容与资源位适配',
        summary: '同一套身份在页面、长图和资源位中采用不同精简度。',
        parameters: [
          { label: '主会场 Hero', value: '完整标题 + 双会场标签 + 阶段口号', mode: '固定规则' },
          { label: '窄 Banner', value: '主标题缩略锁定 + 单一活动利益点', mode: '可配置' },
          { label: '节目单/战报', value: '保留标题字、章节标和数据高亮色', mode: '固定规则' },
          { label: 'IP 出镜', value: '按授权与会场归属筛选，不跨项目借用参考角色', mode: '固定规则' },
        ],
      },
      {
        name: '页面体验语法',
        summary: '从单页 Golden Reference 抽象舞台节奏和玩法皮肤，阻止生成结果退化为通用卡片网页。',
        parameters: [
          { label: 'Hero 分层', value: '平台锁定 / 主 KV / 艺术字 / 阶段条 / 操作层', mode: '固定规则' },
          { label: '模块皮肤', value: '对抗 / 榜单 / 心愿 / 抽奖分别使用独立解剖', mode: '固定规则' },
          { label: '转场方式', value: '弧形舞台、云台、票券缺口、局部满版图', mode: '可配置' },
          { label: '复杂度门槛', value: '≥6 业务区块、≥4 皮肤、7 类素材槽位', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: 'Brand Kit Markdown', specification: '定义、边界、来源、身份层级、色彩、字体、组件、Do / Don’t 与待归档项', required: true },
      { name: '跨画幅参考图', specification: '7 组会场、资源位、节目单与战报应用示例', required: true },
      { name: '品牌与活动锁定件', specification: '平台联名、活动标题、会场署名；透明 Logo 与标题矢量源仍待归档', required: true },
      { name: 'Design Token', specification: '核心身份色、活动应用色、字体角色与组件固定/可配置规则', required: true },
      { name: 'Golden / Reject 清单', specification: '正式交付与过程探索分开登记，禁止 Reject 进入生成参考', required: true },
    ],
    constraints: ['不得重绘或改写抖音 ACG 标识', '游戏与二次元 IP 只能进入对应授权会场', 'Figma 角色与成片仅作为证据，不进入独立生成素材', '禁止全页复用同一种卡片皮肤', '窄资源位必须优先保证标题字和活动识别'],
    usage: '适用于抖音 ACG 活动会场、站内资源位、节目单与传播长图；具体 IP 与项目素材按授权引用。',
    accent: '#E65D24',
    thumbnail: '/assets/figma-deliverables/acg/resource-banner-780x220.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/acg/resource-banner-780x220.png', label: '窄资源位最小签名', specification: '资源位 Banner · 780×220' },
      { src: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png', label: '横版完整活动签名', specification: '游戏中心发现页 · 1372×512' },
      { src: '/assets/figma-deliverables/acg/topic-header-banner.png', label: '话题页标题适配', specification: '话题头图 · 1125×450' },
      { src: '/assets/figma-deliverables/acg/splash-screen.png', label: '竖版联名与活动签名', specification: '开屏 · 1242×2208' },
      { src: '/assets/figma-deliverables/acg/anime-venue-long.png', label: '二次元会场身份与 UI 角色', specification: '二次元会场 H5 · 375×3383' },
      { src: '/assets/figma-deliverables/acg/program-guide-long.png', label: '节目单章节系统', specification: '节目单长图 · 1080×11493' },
      { src: '/assets/figma-deliverables/acg/final-report-long.png', label: '战报信息层级延展', specification: '结算战报 · 1080×26668' },
    ],
    sourceFiles: [
      { name: '2026 抖音 ACG 新春会设计源文件', format: 'Figma', status: '已归档' },
      { name: 'brand-kit.md', format: 'Markdown', status: '已归档' },
      { name: 'image-group.json', format: 'JSON', status: '已归档' },
      { name: 'brand-lockups.svg', format: 'SVG', status: '待校验' },
    ],
    governance: {
      ...commonBrandGovernance,
      source: '2026 抖音 ACG 新春会真实设计交付',
      evidence: '主标题与分会场、资源位延展、战报三类正式画板；脑暴、方向探索和外部参考已排除',
      rights: '仅限抖音 ACG 及本次已授权 IP/游戏合作范围；复用模板时必须替换具体 IP 资产',
      qualityGate: 'Logo 变形/安全区、标题识别度、IP 授权会场、窄资源位信息优先级与 Reject 泄漏检查',
    },
    brandKitProfile: ACG_NEW_YEAR_BRAND_KIT_PROFILE,
  },
  {
    id: 'brand.douyin-spring-festival-2026',
    category: 'brand',
    assetClass: 'brand-kit',
    registry: 'asset',
    name: '抖音春节 Brand Kit · 2026 春晚 / 元宵',
    version: '1.0.0',
    summary: '统一抖音春节传播中的节目标题、合作方署名、直播频道与跨画幅规则；春晚和元宵各自保留独立标题与应用视觉。',
    owner: '抖音节目活动视觉设计',
    status: '待更新',
    updatedAt: '2026-08-10',
    tags: ['抖音春节', '春晚', '元宵', '节目合作', '跨渠道署名'],
    coverage: ['抖音', 'Lynx', 'H5', '直播间', '站内资源位', '行政传播'],
    metrics: [
      { label: '身份层级', value: '3 层' },
      { label: '规范组件', value: '6 组' },
      { label: '适配场景', value: '8 组' },
    ],
    parameterGroups: [
      {
        name: '节目节点身份',
        summary: '“抖音春节”是资产组织层，不假定存在一枚新的母 Logo；生成前必须先选择春晚或元宵节点。',
        parameters: [
          { label: '春节节目节点', value: '2026 春晚 / 2026 元宵', mode: '可配置' },
          { label: '节目主标题', value: '按节点引用总台正式标题锁定', mode: '引用资产' },
          { label: '抖音传播署名', value: '抖音 Logo + 节目节点传播口号', mode: '引用资产' },
          { label: '跨节点复用', value: '只复用平台级规则，不复用节目标题和应用视觉', mode: '固定规则' },
        ],
      },
      {
        name: '合作方与频道锁定',
        summary: '合作口径和频道名来自正式交付，不从项目文案临时拼接。',
        parameters: [
          { label: '春晚合作链', value: '总台春晚标题—火山引擎—豆包', mode: '固定规则' },
          { label: '元宵合作链', value: '按元宵正式资源位节点读取；待透明源件归档', mode: '引用资产' },
          { label: '直播频道', value: '主机位 / 竖屏看春晚 / 年年有你 / 字幕 / 手语', mode: '可配置' },
          { label: '节目日期与直播时间', value: '按节点配置并进入发布前内容校验', mode: '可配置' },
        ],
      },
      {
        name: 'Surface 适配',
        summary: '同一身份关系按页面、直播、资源位和行政传播提供受控变体，而不是裁切同一张 KV。',
        parameters: [
          { label: '页面 Hero', value: '节目标题 + 抖音传播署名 + 直播时间 + 主行动', mode: '固定规则' },
          { label: '直播封面', value: '节目签名 + 频道名 + 直播状态', mode: '可配置' },
          { label: '资源位', value: '240×240 / 1029×195 / 1125×630 / 516×672 等来源规格', mode: '固定规则' },
          { label: '行政传播', value: '横屏 / 竖屏 / 海报 / 易拉宝；保留合作身份与口号安全区', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: 'Brand Kit Markdown', specification: '定义、边界、来源、双节目节点、身份层级、色彩、字体、组件与 Do / Don’t', required: true },
      { name: '跨画幅参考图', specification: '8 组页面、直播间、资源位与行政传播应用示例', required: true },
      { name: '节目与合作方锁定件', specification: '春晚/元宵节目签名、合作方链和抖音传播署名；透明源文件按证据状态登记', required: true },
      { name: 'Design Token', specification: '核心身份色、节目应用色、字体角色和组件固定/可配置关系', required: true },
      { name: '节目节点防混用校验', specification: '阻止春晚标题、合作口径和红金应用视觉误装到元宵成品', required: true },
    ],
    constraints: [
      '春晚与元宵必须先选节目节点再调用资产，不允许跨节点拼装标题锁定',
      '总台节目标题、抖音、火山引擎和豆包 Logo 不得重绘、拉伸或 AI 仿画',
      '马年角色、山水烟花与节目画面属于项目素材，不进入品牌基础件',
      '“过程”页与试稿不得进入生成 Golden Reference',
    ],
    usage: '春晚规则可直接使用；元宵引用前需补齐独立导出与透明标题源件。',
    accent: '#C91D25',
    thumbnail: '/assets/figma-deliverables/spring-gala/admin-screen-landscape.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/spring-gala/activity-banner.png', label: '春晚节目与合作方横向锁定', specification: '资源位延展 · 1074×192' },
      { src: '/assets/figma-deliverables/spring-gala/admin-screen-landscape.png', label: '抖音传播口号与行政横屏', specification: '资源位延展 · 1920×1079' },
      { src: '/assets/figma-deliverables/spring-gala/main-venue.png', label: '春晚主会场身份与 UI 层级', specification: 'Lynx 页面 · 375×2348' },
      { src: '/assets/figma-deliverables/spring-gala/live-main-camera.png', label: '直播主机位节目签名', specification: '直播间物料 · 1116×630' },
      { src: '/assets/figma-deliverables/spring-gala/live-vertical-cover.png', label: '竖屏看春晚频道封面', specification: '直播间物料 · 728×1032' },
      { src: '/assets/figma-deliverables/spring-gala/program-cover-landscape.png', label: '节目封面横版锁定', specification: '资源位延展 · 1125×633' },
      { src: '/assets/figma-deliverables/spring-gala/program-cover-portrait.png', label: '节目封面竖版锁定', specification: '资源位延展 · 1125×1600' },
      { src: '/assets/figma-deliverables/spring-gala/admin-screen-portrait.png', label: '行政竖屏传播适配', specification: '资源位延展 · 1079×1920' },
    ],
    sourceFiles: [
      { name: '2026 春晚与元宵设计源文件', format: 'Figma', status: '已归档' },
      { name: 'brand-kit.md', format: 'Markdown', status: '已归档' },
      { name: 'image-group.json', format: 'JSON', status: '已归档' },
      { name: '元宵独立节点图片组', format: 'PNG/JPG', status: '待校验' },
      { name: '节目/合作方锁定件', format: 'SVG/PNG', status: '待校验' },
    ],
    governance: {
      source: '2026春晚&元宵真实设计交付',
      evidence: '春晚 UI、直播间物料、资源位延展 17 个独立节点；元宵资源位延展总画板与关键横版节点已核验；过程页已排除',
      rights: '仅用于对应节目节点与已确认的抖音/总台/火山引擎/豆包合作范围；人物、节目画面和马年角色按项目授权使用',
      qualityGate: '节目节点、标题锁定、合作方次序、Logo 安全区、直播频道可读性、资源位尺寸与 Reject 泄漏检查',
      importFormats: ['Figma', 'Markdown', 'JSON', 'PNG', 'SVG'],
    },
    brandKitProfile: DOUYIN_SPRING_FESTIVAL_BRAND_KIT_PROFILE,
  },
  {
    id: 'brand.zhuama-ugc-2026-h1',
    category: 'brand',
    assetClass: 'brand-kit',
    registry: 'asset',
    name: '生活服务 UGC「抓马」Brand Kit · 2026 H1',
    version: '0.9.0',
    summary: '统一抖音生活服务署名、红色小马识别结构与“马”字语义规则，覆盖春节、五一与暑期活动应用。',
    owner: '生活服务 UGC 设计',
    status: '待更新',
    updatedAt: '2026-08-10',
    tags: ['生活服务 UGC', '抓马', '小马 IP', '跨节期', '角色身份'],
    coverage: ['抖音生活服务', 'H5', 'Native', '活动资源位', '角色活动'],
    metrics: [
      { label: '身份层级', value: '3 层' },
      { label: '规范组件', value: '6 组' },
      { label: '节期场景', value: '3 类' },
    ],
    parameterGroups: [
      {
        name: '身份与命名',
        summary: '“抓马”当前是资产组织名，而不是已证明存在的独立字标；生成时按业务署名、IP 识别和阶段活动三层组合。',
        parameters: [
          { label: '业务主身份', value: '抖音生活服务', mode: '引用资产' },
          { label: '角色识别', value: '红色小马 + 深棕鬃尾 + 米色口鼻/手脚 + 半睁眼神态', mode: '固定规则' },
          { label: '阶段节点', value: '春节 / 五一 / 暑期', mode: '可配置' },
          { label: '“抓马”字标', value: '无正式源文件证据，不作为 Logo 使用', mode: '固定规则' },
        ],
      },
      {
        name: '角色与活动分层',
        summary: 'Brand Kit 只保留角色识别锚点；模型、动作、服装和表情进入关联 IP Kit，项目标题和场景进入活动应用层。',
        parameters: [
          { label: '角色结构', value: '比例、鼻口体块、鬃尾、基础配色与眼神气质', mode: '固定规则' },
          { label: '角色变体', value: '动作 / 服装 / 道具 / 场景光线', mode: '引用资产' },
          { label: '暑期项目标题', value: '这夏夯爆了', mode: '引用资产', note: '属于暑期活动签名，不是抓马母品牌名。' },
          { label: '暑期视觉', value: '玩水蓝 / 夜食棕 / 荧光绿强调', mode: '可配置', note: '仅限暑期应用色。' },
        ],
      },
      {
        name: '跨 Surface 识别',
        summary: '页面、原生入口与角色选择页共享身份顺序，但不复制同一张长图。',
        parameters: [
          { label: '活动 Hero', value: '阶段标题 + 档期 + 抓马角色 + 一句利益点', mode: '固定规则' },
          { label: '原生入口', value: '业务署名 + 活动入口 + 角色/阶段轻提示', mode: '可配置' },
          { label: '角色选择页', value: '全身角色 + 角色名 + 姿势提示 + 唯一主动作', mode: '固定规则' },
          { label: '页脚署名', value: '抖音生活服务 Logo / 口号按背景选黑白版本', mode: '引用资产' },
        ],
      },
    ],
    deliverables: [
      { name: 'Brand Kit Markdown', specification: '定义、边界、来源、身份层级、色彩、字体、组件、Do / Don’t 与待归档项', required: true },
      { name: '跨页面参考图', specification: '8 组 Hero、原生入口、角色选择、引导与收集状态示例', required: true },
      { name: '身份与应用 Token', specification: '业务署名、角色识别锚点、核心色与暑期应用色的固定/可配置关系', required: true },
      { name: '关联 IP Kit', specification: '小马三视图、结构、动作、表情、服装和 3D 模型；当前待独立归档', required: true },
      { name: '命名与语气规则', specification: '马字双关、角色名、利益点和禁用语；正式词库仍待内容侧校验', required: true },
    ],
    constraints: [
      '“抓马”不能在没有源文件的情况下被画成或当作正式 Logo',
      '这夏夯爆了的标题、暑期配色、场景和卡面不进入品牌永久层',
      '小马动作、服装、3D 模型和完整角色库必须从关联 IP 资产引用',
      '业务 Logo、阶段标题和角色关键识别结构不得被生成模型重绘或互相覆盖',
    ],
    usage: '适用于抖音生活服务 UGC 节期活动；补齐官方命名、Logo/字体源件与独立小马 IP Kit 后发布。',
    accent: '#FF4A32',
    thumbnail: '/assets/figma-deliverables/xiahua/select-horse.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/xiahua/water-venue-a.png', label: '暑期玩水活动签名与 Hero', specification: '暑期 UI · 390×2320', objectPosition: '50% 15%' },
      { src: '/assets/figma-deliverables/xiahua/native-activity-home.png', label: '原生活动入口与轻量署名', specification: 'Native 页面 · 390×845' },
      { src: '/assets/figma-deliverables/xiahua/onboarding-dialog.png', label: '角色引导与玩法说明层级', specification: '引导弹窗 · 375×812' },
      { src: '/assets/figma-deliverables/xiahua/select-horse.png', label: '抓马角色选择 Hero', specification: '角色选择页 · 375×812' },
      { src: '/assets/figma-deliverables/xiahua/food-venue-full.png', label: '夜食线阶段活动签名', specification: '暑期 UI · 375×1898' },
      { src: '/assets/figma-deliverables/xiahua/food-ar-venue.png', label: '角色与夜食场景适配', specification: 'AR 会场 · 375×812' },
      { src: '/assets/figma-deliverables/xiahua/my-summer-outfits.png', label: '玩水线收集状态', specification: '收集页 · 375×812' },
      { src: '/assets/figma-deliverables/xiahua/my-night-food.png', label: '夜食线收集状态', specification: '收集页 · 375×812' },
    ],
    sourceFiles: [
      { name: 'UGC 活动 2026 H1 设计源文件', format: 'Figma', status: '已归档' },
      { name: 'brand-kit.md', format: 'Markdown', status: '已归档' },
      { name: 'image-group.json', format: 'JSON', status: '已归档' },
      { name: '抓马官方命名与 Logo/字标源件', format: 'SVG/PNG', status: '待校验' },
      { name: '小马独立 IP Kit', format: 'Figma/GLB/PNG', status: '待校验' },
    ],
    governance: {
      source: 'UGC活动-2026H1 真实设计文件与暑期正式交付节点',
      evidence: 'Figma 文件按春节、五一、暑期与选马组织；暑期 14 个正式节点可回链，春节 UI 图层包含连续的“马”字语义命名',
      rights: '仅用于抖音生活服务 UGC 活动及已确认项目；小马角色、合作方、场景和用户内容按独立授权范围使用',
      qualityGate: '业务署名、活动节点、角色识别结构、应用色分层、IP 版本、标题源件与 Reject 泄漏检查',
      importFormats: ['Figma', 'Markdown', 'JSON', 'PNG', 'SVG', 'GLB'],
    },
    brandKitProfile: ZHUAMA_UGC_BRAND_KIT_PROFILE,
  },
  {
    id: 'brand.douyin-life-service-resource-spec',
    category: 'brand',
    assetClass: 'brand-kit',
    registry: 'rule',
    name: '生活服务 Brand Kit · 常见资源位规范',
    version: '1.0.0',
    summary: '话题页与创作者活动中心的画布、导出倍率、遮挡区、文图距离和端侧主题变量规范。',
    owner: '生活服务创意视觉 / POI Graphic',
    status: '待更新',
    updatedAt: '2026-08-11',
    tags: ['生活服务', '资源位规范', '画布校验', '话题页', 'Banner'],
    coverage: ['话题页', '创作者活动中心', '移动端', '网页端', '图片生成'],
    metrics: [
      { label: '交付画布', value: '5 类' },
      { label: '交付检查', value: '7 条' },
      { label: '精确尺寸', value: '4+1 组' },
    ],
    parameterGroups: [
      {
        name: '资源位选择',
        summary: '生成前先选择 Surface；画布、倍率和遮挡合同随资源位一起锁定。',
        parameters: [
          { label: '话题头像 / 封面', value: '240×240', mode: '固定规则' },
          { label: '话题页背景', value: '375×210 → @3x 1125×630', mode: '固定规则' },
          { label: '话题页 Banner', value: '343×65 → @3x 1029×195', mode: '固定规则' },
          { label: '创作者活动中心卡片', value: '183×244 → @3x 549×732', mode: '固定规则' },
          { label: '网页端活动专区 Banner', value: '916×74 → @4x 3664×296', mode: '固定规则', note: '由 Figma 内导出图片尺寸与 @4x 规则换算。' },
        ],
      },
      {
        name: '安全区与内容规则',
        summary: '遮挡区、文图关系和 Token 解析属于交付门槛，不是设计建议。',
        parameters: [
          { label: '顶部完全遮挡', value: '375×20', mode: '固定规则' },
          { label: '下方渐变遮挡', value: '375×190，底部偏移 20', mode: '固定规则' },
          { label: '文图最小距离', value: '≥ 12px', mode: '固定规则' },
          { label: '文字 / 背景色', value: '解析 Text / BG / Line 端侧 Token', mode: '引用资产' },
          { label: '字号', value: '跟随具体组件 Token；不采用说明板 50/18px', mode: '引用资产' },
        ],
      },
    ],
    deliverables: [
      { name: 'Resource Spec Markdown', specification: '交付尺寸、倍率、遮挡、组合关系、文图规则、来源与未覆盖项', required: true },
      { name: '交付检查清单', specification: '5 类资源位和 7 条机器校验规则，含错误码与阻断条件', required: true },
      { name: '规格图谱', specification: '逻辑画布与导出像素并列，说明板尺寸独立排除', required: true },
      { name: '主题 Token 映射', specification: 'Text / BG / Line 变量名称已核验；精确亮暗色值仍需从端侧主题解析', required: true },
    ],
    constraints: [
      '禁止把规范说明板尺寸登记为资源位交付尺寸',
      '话题背景顶部 20px 不得放关键信息，默认不放抖音 Logo',
      '创作者活动 Banner 的文案与配图间距不得小于 12px',
      '未解析主题变量前不得手写猜测字色；未核验字号不得拿说明板字体替代',
    ],
    usage: '用于生活服务常见资源位的生成前选型、画布初始化、设计复核和导出前自动验收；当前已覆盖话题页三件套与创作者活动中心核心入口。',
    accent: '#FE2C55',
    sourceFiles: [
      { name: '生活服务常见资源位设计规范 · Figma', format: 'Figma', status: '已归档' },
      { name: 'brand-kit.md', format: 'Markdown', status: '已归档' },
      { name: 'resource-spec.json', format: 'JSON', status: '已归档' },
      { name: '端侧字号与主题色变量解析表', format: 'JSON', status: '待校验' },
    ],
    governance: {
      source: '【基建】生活服务常见资源位设计规范',
      evidence: '⭐️汇总页的真实组件画布与遮挡图层；✈️页的创作者活动中心实例、资源图片尺寸和规范文字',
      rights: '用于抖音生活服务内部资源位生产与验收；项目视觉、Logo、IP 与活动素材按各自资产权限调用',
      qualityGate: '画布、倍率、遮挡碰撞、文图间距、主题 Token 解析与说明板尺寸泄漏检查',
      importFormats: ['Figma', 'Markdown', 'JSON', 'PNG'],
    },
    resourcePositionProfile: DOUYIN_LIFE_SERVICE_RESOURCE_POSITION_PROFILE,
  },
  {
    id: 'style.acg-new-year-kinetic-festival',
    category: 'inspiration',
    assetClass: 'style-profile',
    registry: 'asset',
    name: '新春热力 · ACG Style Bible',
    version: '1.0.0',
    summary: '从 ACG 新春会正式 Banner、主 KV、话题头图和分会场中提炼的项目视觉语法；负责春节氛围、群像构图和活动色，不承担品牌 Logo 或具体 IP 授权。',
    owner: '抖音 ACG 视觉设计',
    status: '已发布',
    updatedAt: '2026-08-07',
    tags: ['春节热力', '天空纵深', '轨道动势', '多 IP 群像'],
    coverage: ['Lynx', 'H5', 'Banner', '开屏', '节目单', '战报'],
    metrics: [
      { label: '正式参考', value: '4 组' },
      { label: '核心色', value: '6 个' },
      { label: '构图层', value: '5 层' },
    ],
    parameterGroups: [
      {
        name: '视觉 Token',
        summary: '色值来自正式交付的降采样聚类；按 Surface 选择语境，用作生成约束而非重新定义品牌色。',
        parameters: [
          { label: '热力橙', value: '#E65D24', mode: '固定规则' },
          { label: '深轨道红', value: '#9B230D', mode: '固定规则' },
          { label: '天空蓝', value: '#B0E2F8', mode: '固定规则' },
          { label: '高光奶油', value: '#F3D5AA', mode: '固定规则' },
          { label: '云雾白', value: '#E8EAEA', mode: '固定规则' },
          { label: '信息深棕', value: '#5E2B1C', mode: '固定规则' },
        ],
      },
      {
        name: 'Surface 视觉语境',
        summary: '主会场与站内资源位不是同一张 KV 的裁切，而是同一活动身份下的两套正式表达。',
        parameters: [
          { label: '主会场 / 开屏 / 竖版 KV', value: '新春红 + 暖金 + 米黄；灯笼、烟花与节庆舞台', mode: '固定规则' },
          { label: '发现页 / 话题 / 活动中心', value: '天空蓝 + 热力橙红 + 奶油白；轨道与跨次元群像', mode: '固定规则' },
          { label: '语境选择', value: '由 Delivery Surface 决定，不允许全渠道套用单一主色', mode: 'Agent 推断' },
        ],
      },
      {
        name: '群像与动势',
        summary: '保证跨画幅仍能读出“沿轨道奔向新春会”的同一世界，而不是简单裁切一张 KV。',
        parameters: [
          { label: '空间层级', value: '云雾前景 / 红色轨道 / 左侧骑行主角 / 右侧环形群像 / 天空烟花', mode: '固定规则' },
          { label: '动势方向', value: '左下 → 右上；角色与载具沿轨道汇聚', mode: '固定规则' },
          { label: '标题安全区', value: '横版优先左侧 38%；竖版移至下三分之一并避开角色脸部', mode: 'Agent 推断' },
          { label: '群像密度', value: '主 KV 高密；窄 Banner 保留 1 个主角簇 + 标题锁定', mode: 'Agent 推断' },
        ],
      },
      {
        name: '跨 Surface 编译',
        summary: '每类交付按信息职责重排，不允许对主 KV 做机械 center-crop。',
        parameters: [
          { label: 'H5 / Lynx', value: 'Hero 先建立世界观，内容卡与榜单使用暖白信息面', mode: '固定规则' },
          { label: '资源位', value: '标题、活动日期、单一利益点优先；IP 数量按安全区删减', mode: '固定规则' },
          { label: '节目单 / 战报', value: '沿用章节标题字、橙红数据高亮和轨道分隔语汇', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: 'Style Token', specification: '6 色、光影、描边、阴影与信息面层级', required: true },
      { name: '构图规则', specification: '横版、竖版、窄 Banner、长页 Hero 四类重排规则', required: true },
      { name: 'Golden References', specification: '仅引用正式 KV / Banner / 会场，不含脑暴和外部参考', required: true },
      { name: 'Reject Rules', specification: '禁止机械裁切、跨授权会场混放 IP、标题压脸和弱化活动日期', required: true },
    ],
    constraints: ['不得修改抖音 ACG Logo', '不得把具体 IP 群像发布为跨项目素材', '窄资源位不得机械裁切主 KV', '探索稿和外部战报参考禁止进入生成参考'],
    usage: '2026 抖音 ACG 新春会项目视觉输入；其它项目复用时必须重新选择 Brand Kit 与授权 IP 素材',
    accent: '#E65D24',
    thumbnail: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png', label: '群像与轨道主构图', specification: 'Figma node 2229:63622 · 1372×512' },
      { src: '/assets/figma-deliverables/acg/topic-header-banner.png', label: '话题页横向适配', specification: 'Figma node 2229:64229 · 1125×450' },
      { src: '/assets/figma-deliverables/acg/key-visual-portrait.png', label: '竖版重排', specification: 'Figma node 2253:13707 · 1080×1920' },
      { src: '/assets/figma-deliverables/acg/game-venue-long.png', label: 'H5 信息面与章节语法', specification: 'Figma node 1470:25605 · 750×9776' },
    ],
    sourceFiles: [
      { name: '2026 抖音ACG新春会-创意.fig', format: 'Figma', status: '已归档' },
      { name: 'style-token.sample.json', format: 'JSON', status: '待校验' },
    ],
    governance: {
      source: '2026 抖音 ACG 新春会正式设计交付',
      evidence: '资源位延展、主 KV、话题头图与分会场正式画板；每个参考均保留 node ID 和源尺寸',
      rights: '视觉语法可作为受控参考；具体游戏/IP 角色和项目成片只限原授权项目',
      qualityGate: '正式稿来源、标题安全区、角色脸部遮挡、跨画幅重排、IP 授权与 Reject 泄漏检查',
      importFormats: ['Figma', 'PNG', 'WebP', 'JSON'],
    },
  },
  {
    id: 'ip.xinzai-life-service-2026',
    category: 'ip',
    assetClass: 'character-kit',
    registry: 'asset',
    name: '抖音生活服务 · 心仔 IP Kit',
    version: '1.0.0',
    summary: '统一管理心仔的角色身份、不可变结构、标准色、比例、15 种表情、30 个动作和传播使用要求。',
    owner: '抖音生活服务品牌',
    status: '已发布',
    updatedAt: '2026-08-10',
    tags: ['心仔', '抖音生活服务', '官方 IP', '2D', '3D', 'STL', '动作资产'],
    coverage: ['平面传播', '视频', '线下装置', '周边', '联合营销', '活动页面'],
    metrics: [
      { label: '标准形象', value: '2D / 3D' },
      { label: '情绪资产', value: '15 种' },
      { label: '动作资产', value: '30 个' },
    ],
    parameterGroups: [
      {
        name: '角色身份与不可变结构',
        summary: '心仔不是一张吉祥物图片，而是一套具有稳定识别、比例和业务归属的角色系统。',
        parameters: [
          { label: '核心定位', value: '抖音生活服务 · 吃喝玩乐好搭子', mode: '固定规则' },
          { label: '爱心脑袋', value: '外轮廓、头身主关系与左右心瓣结构不可变', mode: '固定规则' },
          { label: '烟火雷达眼', value: '保留大眼体块；瞳孔、眼皮与眉形可随表情变化', mode: '可配置' },
          { label: '云朵腮红', value: '两侧云朵形状、成对关系和粉色识别不可变', mode: '固定规则' },
          { label: '百宝挎包', value: '爱心包体、斜挎关系与抖音标识不可变', mode: '固定规则' },
          { label: '圆圆小手', value: '四根手指；手势和持物按批准动作资产变化', mode: '可配置' },
        ],
      },
      {
        name: '表情与动作资产',
        summary: '表情与动作是受控变体，不允许借场景变化改写角色本体。',
        parameters: [
          { label: '标准表情', value: '开心、比心、无奈、眯眼笑、得意、委屈、生气、无语、吃惊、眩晕、期待、犯困、疑惑、尴尬、馋', mode: '引用资产' },
          { label: '常规动作', value: '8 个', mode: '引用资产' },
          { label: '吃喝动作', value: '8 个', mode: '引用资产' },
          { label: '玩乐 / 日常', value: '各 3 个', mode: '引用资产' },
          { label: '运动 / 出行 / 购物 / 节日', value: '各 2 个', mode: '引用资产' },
        ],
      },
      {
        name: '源文件与授权',
        summary: '公开预览、可编辑源文件与传播授权分开管理，能下载不代表自动获得所有使用权限。',
        parameters: [
          { label: '标准形象', value: '2D / 3D PNG 与平面 AI', mode: '引用资产' },
          { label: '线下模型', value: '标准“心仔模型.stl”', mode: '引用资产' },
          { label: '动作源文件', value: '30 个 PSD / PSB 与对应预览', mode: '引用资产' },
          { label: '传播确认', value: '使用前按规范联系黄文强确认范围', mode: '固定规则' },
          { label: '正式署名', value: '联合海报、单人海报及周边需呈现“抖音生活服务  心仔”', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '标准形象', specification: '2D / 3D 正面与侧面 PNG、平面 AI', required: true },
      { name: '结构与比例规范', specification: '不可变结构、1 : 0.35 : 0.30 头身腿比例与线下参考', required: true },
      { name: '标准色', specification: '6 个核验色号及对应 Pantone', required: true },
      { name: '表情资产', specification: '15 种标准表情及使用规则', required: true },
      { name: '动作资产库', specification: '8 个场景分类、30 个 PSD / PSB 动作', required: true },
      { name: '线下模型', specification: '心仔模型 STL 与带品牌 Logo 的底座要求', required: false },
    ],
    constraints: [
      '爱心脑袋、云朵腮红和百宝挎包不可重画或替换',
      '四根手指不得改成拟真人手，头身比例不得拉长成人形',
      '版权应用示意图不可作为可复用营销成片对外传播',
      '生成结果必须逐项复核帽子、挎包、手指、Logo 与身体比例',
    ],
    usage: '作为心仔在生活服务活动、传播、线下装置与周边中的受控角色输入；活动主题、页面视觉与合作方资产需在项目层另行绑定。',
    accent: '#FF2424',
    thumbnail: '/assets/ip-kits/xinzai-2026/03-3d-front.png',
    visualReferences: [
      { src: '/assets/ip-kits/xinzai-2026/01-color-standard.png', label: '标准色规范', specification: '官方规范 · 4001×1920 · 6 个标准色' },
      { src: '/assets/ip-kits/xinzai-2026/02-character-anatomy.png', label: '角色结构标注', specification: '官方规范 · 4001×1921 · 5 个核心识别结构' },
      { src: '/assets/ip-kits/xinzai-2026/03-3d-front.png', label: '3D 标准形象', specification: '官方规范 · 4168×4168 · 透明 PNG' },
      { src: '/assets/ip-kits/xinzai-2026/04-2d-front.png', label: '2D 标准形象', specification: '官方规范 · 2084×2084 · 透明 PNG' },
      { src: '/assets/ip-kits/xinzai-2026/05-height-ratio.png', label: '标准比例与线下参考', specification: '官方规范 · 8000×4500 · 头 1× / 身 0.35× / 腿 0.30×' },
      { src: '/assets/ip-kits/xinzai-2026/06-emotion-expect.png', label: '表情示例 · 期待', specification: '官方规范 · 1024×1024' },
      { src: '/assets/ip-kits/xinzai-2026/07-emotion-angry.png', label: '表情示例 · 生气', specification: '官方规范 · 1024×1024' },
      { src: '/assets/ip-kits/xinzai-2026/08-action-greeting.jpg', label: '动作示例 · 打招呼', specification: '动作资产库 · 常规 · 2000×2000' },
      { src: '/assets/ip-kits/xinzai-2026/09-action-hotpot.png', label: '动作示例 · 吃火锅', specification: '动作资产库 · 吃喝 · 4000×4000' },
      { src: '/assets/ip-kits/xinzai-2026/10-action-karaoke.png', label: '动作示例 · 唱 K', specification: '动作资产库 · 玩乐 · 2000×2000' },
      { src: '/assets/ip-kits/xinzai-2026/11-action-skateboard.png', label: '动作示例 · 滑板', specification: '动作资产库 · 运动 · 7046×7046' },
      { src: '/assets/ip-kits/xinzai-2026/12-action-plane.png', label: '动作示例 · 开飞机', specification: '动作资产库 · 出行 · 3488×3489' },
      { src: '/assets/ip-kits/xinzai-2026/13-action-spring.png', label: '动作示例 · 新春快乐', specification: '动作资产库 · 节日 · 2000×2000' },
    ],
    sourceFiles: [
      { name: '心仔平面 AI 与 PNG 压缩包', format: 'AI / PNG', status: '已归档' },
      { name: '心仔 3D PNG 压缩包', format: 'PNG', status: '已归档' },
      { name: '心仔模型.stl', format: 'STL', status: '已归档' },
      { name: '30 个动作源文件', format: 'PSD / PSB', status: '已归档' },
      { name: '心仔正式 title 矢量与安全区', format: 'AI / SVG', status: '待校验' },
    ],
    governance: {
      source: '飞书《抖音生活服务｜心仔》revision 1005 与《心仔｜形象设计资产库》revision 1208',
      evidence: '13 张官方规范 / 资产库图片；15 种表情；8 个已填充动作分类共 30 个动作与对应 PSD/PSB',
      rights: '资产使用前需确认传播范围；版权应用示意图不进入可复用图片组，联合与周边场景保留正式署名。',
      qualityGate: '来源、版本、轮廓、比例、标准色、手指、腮红、挎包、Logo、正式署名与传播授权逐项检查',
      importFormats: ['Lark Docx', 'AI', 'PNG', 'PSD', 'PSB', 'STL', 'MD', 'JSON'],
    },
    ipKitProfile: XINZAI_IP_KIT_PROFILE,
  },
  {
    id: 'ip.acg-horse-mascot-2026',
    category: 'ip',
    assetClass: 'character-kit',
    registry: 'asset',
    name: 'ACG 新春会 · 马年吉祥物与授权素材包',
    version: '1.0.0',
    summary: '从项目正式页面切片中登记的 12 个真实素材文件，包含马年吉祥物、游戏角色、节庆道具和内容封面；只服务当前授权项目，不属于通用新春会模板。',
    owner: '抖音 ACG 视觉设计',
    status: '已发布',
    updatedAt: '2026-08-07',
    tags: ['马年吉祥物', '项目授权', '透明切片', '游戏角色'],
    coverage: ['H5', '资源位', '玩法视觉', '节目单', '传播物料'],
    metrics: [
      { label: '真实文件', value: '12 个' },
      { label: '角色 / 道具', value: '6 个' },
      { label: '内容封面', value: '5 个' },
    ],
    parameterGroups: [
      {
        name: '素材清单',
        summary: '每项对应本地真实 PNG，不用生成占位图替代。',
        parameters: [
          { label: '活动主视觉切片', value: '01-activity-hero.png · 1600×1035', mode: '引用资产' },
          { label: '角色与道具', value: '派对柯基、地下城角色、王者角色、蛋仔键盘、标题炮仗、马年吉祥物', mode: '引用资产' },
          { label: '内容封面', value: '焦点视频 1 张 + 榜单/内容封面 4 张', mode: '引用资产' },
        ],
      },
      {
        name: '授权与挂载',
        summary: '角色归属和出现范围由项目授权清单控制，模板只保存槽位。',
        parameters: [
          { label: '授权范围', value: '2026 抖音 ACG 新春会项目内', mode: '固定规则' },
          { label: '会场归属', value: '游戏角色仅进入游戏会场；跨会场使用需再次确认', mode: '固定规则' },
          { label: '吉祥物挂载', value: '主会场 Hero / 玩法入口 / 节目单封面', mode: '可配置' },
          { label: '重生成权限', value: '默认只可裁切与排版，不得重绘角色本体', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '活动与吉祥物透明件', specification: '活动 Hero 与马年吉祥物 2 个高分辨率 PNG', required: true },
      { name: '角色 / 道具切片', specification: '6 个项目授权角色与节庆道具 PNG', required: true },
      { name: '内容封面', specification: '5 个视频、榜单和内容卡封面 PNG', required: true },
    ],
    constraints: ['不得发布为跨项目公共 IP', '不得重绘、镜像或改变角色识别结构', '角色必须匹配授权会场', '切片进入生成前保留来源文件名'],
    usage: '2026 抖音 ACG 新春会项目素材输入；与 Brand Kit、Style Bible 和玩法槽位分别绑定',
    accent: '#E65D24',
    thumbnail: '/assets/acg-new-year/materials/12-event-mascot-horse.png',
    visualReferences: [
      { src: '/assets/acg-new-year/materials/12-event-mascot-horse.png', label: '马年活动吉祥物', specification: '真实 PNG · 1600×1064' },
      { src: '/assets/acg-new-year/materials/01-activity-hero.png', label: '活动 Hero 切片', specification: '真实 PNG · 1600×1035' },
      { src: '/assets/acg-new-year/materials/06-title-cannon.png', label: '节庆标题炮仗', specification: '真实 PNG · 488×511' },
      { src: '/assets/acg-new-year/materials/02-party-corgi.png', label: '派对柯基角色', specification: '真实 PNG · 1100×1300' },
    ],
    sourceFiles: [
      { name: 'public/assets/acg-new-year/materials · 12 PNG', format: 'PNG', status: '已归档' },
    ],
    governance: {
      source: '2026 抖音 ACG 新春会正式页面切片',
      evidence: '12 个本地真实 PNG；尺寸与文件名可逐项核验',
      rights: '仅限当前项目和已授权渠道；不得作为通用角色包外发或用于其它活动',
      qualityGate: '文件存在性、透明边缘、角色归属、授权范围、镜像和重绘检查',
      importFormats: ['PNG', 'Figma node', '授权清单'],
    },
  },
  {
    id: 'brand.douyin-life-service',
    category: 'brand',
    assetClass: 'brand-kit',
    registry: 'asset',
    name: '抖音生活服务官方 Brand Kit',
    version: '4.0.2',
    summary: '活动项目的品牌身份入口，统一管理 Logo 变体、品牌色、字体角色与联名锁定关系。',
    owner: '生活服务品牌设计',
    status: '已发布',
    updatedAt: '2026-07-18',
    tags: ['官方', '生活服务', '品牌身份'],
    coverage: ['抖音', '抖音极速版', '站内 H5', '图片生成'],
    metrics: [
      { label: 'Logo 变体', value: '4 组' },
      { label: '品牌色', value: '8 项' },
      { label: '字体角色', value: '5 类' },
    ],
    parameterGroups: [
      {
        name: '品牌身份',
        summary: '由项目归属继承，运营通常只选择适配变体。',
        parameters: [
          { label: 'Logo 版本', value: '彩色 / 黑色 / 白色 / 图形标', mode: '引用资产' },
          { label: '背景适配', value: '根据背景明度自动选择', mode: 'Agent 推断' },
          { label: '主品牌色', value: '#161823 / #FE2C55 / #25F4EE', mode: '固定规则' },
          { label: '联名关系', value: '主品牌在前，合作方按锁定比例排列', mode: '可配置' },
        ],
      },
      {
        name: '版式边界',
        summary: '发布前自动检查最小尺寸、留白和变形。',
        parameters: [
          { label: '最小显示高度', value: '24 px', mode: '固定规则' },
          { label: 'Logo 安全区', value: '四周 ≥ 1× 标志图形高度', mode: '固定规则' },
          { label: '联名分隔', value: '竖线 / 乘号 / 无分隔', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: 'Logo 源文件', specification: 'SVG + 透明 PNG（1× / 2× / 4×）', required: true },
      { name: 'Design Token', specification: '颜色、圆角、字体角色 JSON', required: true },
      { name: '联名锁定组件', specification: 'Figma Component', required: false },
    ],
    constraints: ['禁止拉伸、描边或重绘 Logo', '反白 Logo 不得落在高亮浅色区', '生成模型不得自行仿画品牌标识'],
    usage: '作为生活服务活动项目的默认品牌依赖',
    accent: '#161823',
    governance: {
      ...commonBrandGovernance,
      source: '生活服务品牌资产登记',
      evidence: 'Logo、色板与联名组件均有源文件和版本记录',
      qualityGate: '尺寸、对比度、安全区、变形与重复 Logo 自动检查',
    },
  },
  createPageTemplate({ id: 'template.page.acg-game-venue', name: 'ACG 新春会 · 游戏榜单会场', surface: 'H5', summary: '游戏内容榜单、双动作助力、任务和规则入口组成的独立会场页。', preview: '/assets/figma-deliverables/acg/game-venue-long.png', source: '2026 抖音 ACG 新春会正式 Figma 交付', specification: 'Figma node 1470:25605 · 750×9776', modules: ['主视觉', '内容榜单', '助力', '任务'], accent: '#F06939' }),
  createPageTemplate({ id: 'template.page.acg-anime-venue', name: 'ACG 新春会 · 二次元会场', surface: 'H5', summary: '二次元内容聚合、榜单、会场切换和互动反馈组成的独立会场页。', preview: '/assets/figma-deliverables/acg/anime-venue-long.png', source: '2026 抖音 ACG 新春会正式 Figma 交付', specification: 'Figma node 1529:29607 · 375×3383', modules: ['主视觉', '内容聚合', '榜单', '会场切换'], accent: '#E49B3D' }),
  createPageTemplate({ id: 'template.page.gala-main', name: '抖音春晚 · 直播主会场', surface: 'Lynx', summary: '直播、节目单、抽奖、往年内容和投稿入口组成的独立主会场页。', preview: '/assets/figma-deliverables/spring-gala/main-venue.png', source: '2026 抖音春晚正式 Figma 交付', specification: 'Figma node 636:116216 · 375×2348', modules: ['直播', '节目单', '抽奖', '投稿'], accent: '#E94B40' }),
  createPageTemplate({ id: 'template.page.gala-full', name: '抖音春晚 · 完整活动长页', surface: 'Lynx', summary: '在直播主会场基础上补齐话题内容、往年回放与完整活动承接的长页。', preview: '/assets/figma-deliverables/spring-gala/main-venue-full.png', source: '2026 抖音春晚正式 Figma 交付', specification: 'Figma node 773:119100 · 375×5925', modules: ['直播', '节目单', '话题投稿', '往年回放'], accent: '#C92D28' }),
  createPageTemplate({ id: 'template.page.evernight-main', name: '永夜星河 · 抽卡主会场', surface: 'Lynx', summary: '卡池、单抽与十连、任务入口和图鉴进度组成的独立抽卡主页面。', preview: '/assets/figma-deliverables/evernight/main-venue.png', source: '《永夜星河》抽卡正式 Figma 页面交付', specification: 'Figma node 40:27228 · 750×3652', modules: ['卡池', '抽卡', '任务', '图鉴'], accent: '#7544D8' }),
  createPageTemplate({ id: 'template.page.evernight-task', name: '永夜星河 · 抽卡任务页', surface: 'Lynx', summary: '任务列表、完成反馈、抽卡次数领取和图鉴回流组成的独立任务页面。', preview: '/assets/figma-deliverables/evernight/task-page.png', source: '《永夜星河》抽卡正式 Figma 页面交付', specification: 'Figma node 747:9409 · 750×1603', modules: ['任务列表', '次数领取', '完成反馈', '图鉴回流'], accent: '#8F5CFF' }),
  {
    id: 'template.xinzai-scene-banner',
    category: 'material-template',
    assetClass: 'banner-template',
    registry: 'asset',
    name: '心仔全幅场景 Banner 模板',
    version: '1.11',
    summary: '全幅 3D 场景、心仔演出和手绘标题一体生成，Logo 作为独立确定性图层贴装。',
    owner: '生活服务创意中台',
    status: '已发布',
    updatedAt: '2026-08-04',
    tags: ['心仔', 'Banner', '全幅场景'],
    coverage: ['热点话题位', '站内活动 Banner'],
    metrics: [
      { label: '交付尺寸', value: '1170×330' },
      { label: '垫图', value: '17 张' },
      { label: '回归用例', value: '7 / 7' },
    ],
    parameterGroups: [
      {
        name: '文案与版式',
        summary: '标题容量决定模板和字号档位，不允许模型随意放大。',
        parameters: [
          { label: '主标题', value: '建议 5–8 字；9–12 字自动缩号', mode: '可配置' },
          { label: '副标题', value: '建议 ≤ 12 字，始终单行', mode: '可配置' },
          { label: '行动按钮', value: '无 / 立即查看 / 自定义文案', mode: '可配置' },
          { label: '标题参考', value: '纯中文 / 中英混排 / 数字标题样本', mode: 'Agent 推断' },
          { label: '心仔站位', value: '默认右侧；居中标题模板可左侧', mode: 'Agent 推断' },
          { label: 'Logo 位置', value: '根据心仔实际侧位放至对侧上角', mode: '固定规则' },
        ],
      },
      {
        name: '场景生成',
        summary: '整个画面必须属于同一个明快商业 3D 世界。',
        parameters: [
          { label: '场景类型', value: '主题 / 城市 / 大促 / 通用', mode: 'Agent 推断' },
          { label: '画面色调', value: '明快高饱和；蓝系 / 暖夜蓝 / 米黄', mode: '可配置' },
          { label: '心仔动作', value: '从角色资产包按主题动词引用', mode: '引用资产' },
          { label: '主题道具', value: '1–2 件，禁止残留旧主题道具', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: '最终 Banner', specification: 'RGB PNG，1170×330（39:11）', required: true },
      { name: 'Logo 图层', specification: '白色横排 Logo；大促模板可用黑色', required: true },
      { name: '标题字样本', specification: '9 套手绘字形参考', required: false },
    ],
    constraints: ['只交付 1170×330，不继承旧版 780×220', '标题不得投影、描边、发光或折行', 'Logo 与心仔不得同侧拥挤'],
    usage: 'v1.11 固定 7 条 Query 已完成全量回归',
    accent: '#F04444',
    thumbnail: 'https://p6-magic.byteimg.com/tos-cn-i-tokbwntzau/ff2f9ac5dc944504ae363236cce25418~tplv-tokbwntzau-recrop:0:0:0:0:0:0:q90.png?size=1170x330&magic_type=image_png',
    governance: {
      ...commonBrandGovernance,
      source: '生服-心仔 IP 物料生成 Skill v1.11',
      evidence: '17 张垫图、19 张成品参考、9 套标题样本及 7 条固定回归 Query',
      qualityGate: '逐字文案、角色结构、标题几何、Logo 对侧与唯一尺寸守卫',
      importFormats: ['活动 Brief', '主副标题', '参考图', '心仔动作资产'],
    },
  },
  {
    id: 'template.hot-topic-banner',
    category: 'material-template',
    assetClass: 'banner-template',
    registry: 'asset',
    name: '无 IP 热点话题 Banner 模板',
    version: '6.5',
    summary: '固定官方框架、语义四色路由和确定性文字合成；与心仔全幅场景版是两套独立资产。',
    owner: '生活服务创意中台',
    status: '已发布',
    updatedAt: '2026-08-05',
    tags: ['热点话题', 'Banner', '无 IP'],
    coverage: ['热点话题位', '双尺寸投放'],
    metrics: [
      { label: '色调模板', value: '4 套' },
      { label: '交付尺寸', value: '2 个' },
      { label: '标准集', value: '12 / 12' },
    ],
    parameterGroups: [
      {
        name: '文案容量',
        summary: '字数门禁在生图前执行，超规不允许静默改写。',
        parameters: [
          { label: '主标题', value: '3–14 字', mode: '可配置' },
          { label: '标题行数', value: '3–10 字单行；11–14 字按语义双行', mode: '固定规则' },
          { label: '副标题', value: '可选，建议 ≤ 16 字', mode: '可配置' },
          { label: '主元素', value: '1–2 个纯中文无字实物', mode: 'Agent 推断' },
        ],
      },
      {
        name: '视觉路由',
        summary: '显式指定优先，否则按主副标题语义自动选色。',
        parameters: [
          { label: '蓝色模板', value: '冰饮 / 避暑 / 水域 / 露营', mode: 'Agent 推断' },
          { label: '绿色模板', value: '旅行 / 景区 / 公园 / 亲子', mode: 'Agent 推断' },
          { label: '灰色模板', value: '烘焙 / 咖啡 / 餐饮 / 美食', mode: 'Agent 推断' },
          { label: '黄色模板', value: '活动 / 节日 / 开业 / 通用', mode: 'Agent 推断' },
        ],
      },
    ],
    deliverables: [
      { name: '标准 Banner', specification: 'PNG，1170×330', required: true },
      { name: '小尺寸 Banner', specification: 'PNG，780×220', required: true },
      { name: '框架质检报告', specification: '四色模板、固定件与像素不变量', required: true },
    ],
    constraints: ['固定 Hot!、#、爱心与音符不可被模型改写', '无字底图和 QC 仅作为中间产物', '任何门禁失败均不得发布'],
    usage: '7 条非心仔标准集 + 5 条语义盲测均通过',
    accent: '#F6C844',
    thumbnail: '/assets/figma-deliverables/spring-gala/activity-banner.png',
    governance: {
      ...commonBrandGovernance,
      source: '生服-热点话题 Banner 生成 Skill v6.5',
      evidence: '四色路由、标题字号阶梯、双尺寸合成与三类线上 badcase 回归',
      qualityGate: '文案门禁、框架固定件、场景侵入、锐度与保护像素 fail-closed 检查',
      importFormats: ['主副标题', '显式色调', '主题实物清单'],
    },
  },
  {
    id: 'template.official-live-room',
    category: 'material-template',
    assetClass: 'live-room-kit',
    registry: 'asset',
    name: '生服官号直播间分层套件',
    version: '3.40',
    summary: '以统一画布和安全区管理背景、主题字、上下氛围层、政策词、侧卡及动态组件。',
    owner: '生活服务直播设计',
    status: '已发布',
    updatedAt: '2026-06-29',
    tags: ['直播间', '分层 PNG', '官号'],
    coverage: ['抖音直播间', '官号专场'],
    metrics: [
      { label: '标准画布', value: '1536×2752' },
      { label: '基础图层', value: '6 层' },
      { label: '业务基准', value: '16 例' },
    ],
    parameterGroups: [
      {
        name: '场次内容',
        summary: 'Brief 可整体导入，Agent 拆为各层的真实文案和视觉描述。',
        parameters: [
          { label: '行业', value: '甜品 / 餐饮 / SPA / 服饰 / 亲子 / 乐园等', mode: 'Agent 推断' },
          { label: '主题与副标题', value: '逐字输入，作为 F 主题层', mode: '可配置' },
          { label: '统一主色', value: '主色 + 中性色 + 1 个强调色', mode: '可配置' },
          { label: '渲染风格', value: '写实 3D arch-viz / 精致 3D / 商品超写实', mode: 'Agent 推断' },
          { label: '政策词', value: '默认「放心囤 随时退 过期退」', mode: '可配置' },
          { label: 'Logo', value: '无 / 默认生服 / 导入合作方 Logo', mode: '可配置' },
        ],
      },
      {
        name: '画布与槽位',
        summary: '模型只生成单元素，最终位置由确定性版式配置控制。',
        parameters: [
          { label: '内容安全区', value: '水平 13%–87%', mode: '固定规则' },
          { label: '主题槽位 F', value: 'x14% / y18% / w72% / h16%', mode: '固定规则' },
          { label: '侧卡槽位 N', value: '左 13% 或右 65%，宽 22%', mode: '可配置' },
          { label: '福袋槽位', value: 'y66% / w22% / h12%', mode: '可配置' },
          { label: '图层顺序', value: '背景 → 渐变 → 商品 → 主题 → 侧卡 → 福袋 → 政策词', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: 'H 背景', specification: '1536×2752 不透明 PNG，无字、无人、无贴片', required: true },
      { name: 'F 主题字', specification: '全画布透明 PNG，仅主题艺术字非透明', required: true },
      { name: 'J / L-gradient', specification: '顶部 / 底部品牌色半透明渐变层', required: true },
      { name: 'L-text', specification: '抖音美好体政策词透明层', required: true },
      { name: 'N 侧卡', specification: '全画布透明 PNG，左 / 右侧福利卡', required: true },
      { name: 'Logo / 福袋 / 商品', specification: '按场次动态增加的独立图层', required: false },
      { name: 'P 成品预览', specification: '全图层合成的 1536×2752 PNG', required: true },
    ],
    constraints: ['所有可读内容必须在中央 74% 安全区', '返修只替换目标层并重新合成', '白底或色键中间图不得作为交付资产'],
    usage: '来自 16 个真实直播行业案例的分层规范',
    accent: '#ED4B73',
    thumbnail: 'https://p3-magic.byteimg.com/tos-cn-i-tokbwntzau/magic_eco/18bc88fb13213ea508ff90219ade51b8~tplv-tokbwntzau-perf:0:0:q90.image?size=1374x2437&magic_type=image_png',
    governance: {
      ...commonBrandGovernance,
      source: '生服官号-直播间-贴片素材生成 Skill v3.40',
      evidence: '16 个业务 benchmark 的背景、标题、上下贴、侧卡反写描述与版式中位数',
      qualityGate: '逐层透明度、尺寸、安全区、文字准确、配色一致与成品遮挡检查',
      importFormats: ['场次 Brief', '直播间参考图', '合作方 Logo', '权益表格', '商品图'],
    },
  },
  {
    id: 'component.live-benefit-card',
    category: 'material-template',
    assetClass: 'live-component',
    registry: 'asset',
    name: '直播间福利侧卡与福袋组件包',
    version: '3.40',
    summary: '从直播间套件拆出的可复用权益组件，管理档位、价格、位置、卡身比例和文案边界。',
    owner: '生活服务直播设计',
    status: '已发布',
    updatedAt: '2026-06-29',
    tags: ['侧卡', '福袋', '直播权益'],
    coverage: ['官号直播间', '品牌专场', '食品与零售直播'],
    metrics: [
      { label: '券档位', value: '1–3 档' },
      { label: '最大宽度', value: '22%' },
      { label: '组件类型', value: '3 类' },
    ],
    parameterGroups: [
      {
        name: '侧卡内容',
        summary: '价格是卡内第一视觉信息，售后政策不进入侧卡。',
        parameters: [
          { label: '卡标题', value: '直播福利 / 超值代金券 / 自定义', mode: '可配置' },
          { label: '权益档数', value: '1–3 档', mode: '可配置' },
          { label: '每档字段', value: '品类、代金券面值、到手价、价格类型', mode: '可配置' },
          { label: '到手价样式', value: '卡内最大字号 + 浅色药丸底', mode: '固定规则' },
          { label: '售后政策', value: '不进入侧卡，引用 L-text 图层', mode: '固定规则' },
        ],
      },
      {
        name: '结构适配',
        summary: '档数决定卡片生成比例，避免内容稀疏。',
        parameters: [
          { label: '1 档比例', value: '4:5', mode: '固定规则' },
          { label: '2 档比例', value: '3:4', mode: '固定规则' },
          { label: '3 档及以上', value: '9:16', mode: '固定规则' },
          { label: '侧卡位置', value: '左侧 / 右侧', mode: '可配置' },
          { label: '阴影与外发光', value: '禁止，保持平面利落边缘', mode: '固定规则' },
          { label: '福袋奖品', value: '1–2 行真实品名，可从奖品池引用', mode: '引用资产' },
        ],
      },
    ],
    deliverables: [
      { name: '侧卡 N', specification: '全画布透明 PNG，卡片填充率 ≥ 55%', required: true },
      { name: '福袋', specification: '独立透明层，奖品名与奖品池一致', required: false },
      { name: '底部商品带', specification: '食品 / 商品行业可选超写实商品透明层', required: false },
    ],
    constraints: ['配色限制为品牌主色 + 白字 + 浅色价格底', '金额必须与导入权益表逐字一致', '福袋奖品不得被展开成漂浮实物'],
    usage: '可被直播间套件或单场活动独立引用',
    accent: '#C95B82',
    thumbnail: 'https://p9-magic.byteimg.com/tos-cn-i-tokbwntzau/magic_eco/f726eff13fa7eba801aad59b0bb6c3be~tplv-tokbwntzau-perf:0:0:q90.image?size=1374x2437&magic_type=image_png',
    governance: {
      ...commonBrandGovernance,
      source: '生服官号直播间 Skill 的 N / 福袋组件契约',
      evidence: '16 个 benchmark 的卡片结构、档位比例与价格层级规则',
      qualityGate: '金额逐字校验、卡身填充率、透明边缘、安全区与配色数量检查',
      importFormats: ['权益 Excel', '奖品池', '商品图', '卡片参考图'],
    },
  },
  {
    id: 'template.campaign-kv-layered',
    category: 'material-template',
    assetClass: 'layer-template',
    registry: 'asset',
    name: '活动主视觉分层模板',
    version: '1.2.0',
    summary: '保留整图视觉质量，只把需要频繁替换的正文、Logo、价格和主体拆成可编辑槽位。',
    owner: '生活服务创意工具',
    status: '已发布',
    updatedAt: '2026-08-06',
    tags: ['分层', 'KV', '横竖版'],
    coverage: ['站内 H5', '运营 Banner', '活动 KV', '图片生成'],
    metrics: [
      { label: '默认槽位', value: '6 类' },
      { label: '最大图层', value: '8 层' },
      { label: '版式', value: '4 组' },
    ],
    parameterGroups: [
      {
        name: '画布与槽位',
        summary: '模板保存结构，项目素材版本保存具体内容。',
        parameters: [
          { label: '画布规格', value: '1170×330 / 750×1000 / 375×494 / 1242×1660', mode: '可配置' },
          { label: '整图背景', value: '始终保留 1 个根栅格层', mode: '固定规则' },
          { label: '可拆元素', value: '正文 / Logo / 价格 / CTA / 可复用主体', mode: 'Agent 推断' },
          { label: '艺术字', value: '默认保持栅格图层，不转真文字', mode: '固定规则' },
        ],
      },
      {
        name: '版本与约束',
        summary: '项目引用精确版本，模板更新不会静默覆盖。',
        parameters: [
          { label: '引用策略', value: '锁定 template id + version', mode: '固定规则' },
          { label: '破坏性变更', value: '差异预览后手动迁移', mode: '固定规则' },
          { label: '品牌层', value: '引用 Brand Kit，默认锁定', mode: '引用资产' },
          { label: '文字层', value: '引用字体库精确版本', mode: '引用资产' },
        ],
      },
    ],
    deliverables: [
      { name: 'LayerTemplate Manifest', specification: '画布、槽位、类型、锁定与安全区', required: true },
      { name: '差异迁移规则', specification: 'breaking / additive / cosmetic 分级', required: true },
      { name: 'Golden / Reject', specification: '正确拆层和过度拆层反例', required: true },
    ],
    constraints: ['单图同样必须有一层 manifest', '不自动迁移已有项目版本', '艺术字不因可编辑性被强制转为普通字体'],
    usage: '这夏夯爆了主视觉已锁定 v1.2.0',
    accent: '#6C5CE7',
    thumbnail: '/assets/figma-deliverables/acg/topic-header-banner.png',
    governance: {
      source: '图片分层编辑实践与活动 KV 生产链路',
      evidence: '心仔 Banner、深夜食堂 KV 和图文混合分层用例',
      rights: '模板只包含结构；实例图像、字体和 Logo 仍按各自授权管理',
      qualityGate: '画布尺寸、必填槽、字体版本、Logo 安全区与扁平图/manifest 哈希一致性检查',
      importFormats: ['Layer Manifest', 'imageHtml sidecar', 'Figma Frame', 'PSD'],
    },
  },
  {
    id: 'template.live-room-layered',
    category: 'material-template',
    assetClass: 'layer-template',
    registry: 'asset',
    name: '直播间竖屏分层模板',
    version: '3.4.0',
    summary: '固定 1536×2752 画布与主播安全区，分开背景、主题字、氛围、侧卡、政策词和商品层。',
    owner: '生活服务直播设计',
    status: '已发布',
    updatedAt: '2026-08-04',
    tags: ['分层', '直播间', '安全区'],
    coverage: ['直播间', '竖屏预览', '直播贴片'],
    metrics: [
      { label: '标准画布', value: '1536×2752' },
      { label: '基础槽位', value: '6 类' },
      { label: '安全区', value: '中央 74%' },
    ],
    parameterGroups: [
      {
        name: '固定结构',
        summary: '主播位和直播组件共同决定可用空间。',
        parameters: [
          { label: '画布', value: '1536×2752', mode: '固定规则' },
          { label: '中央主播区', value: '宽度 74%，禁止强对比文字与人物贴片', mode: '固定规则' },
          { label: '主题字', value: '艺术字栅格层，文案变更时重新渲染', mode: 'Agent 推断' },
          { label: '权益侧卡', value: '引用直播组件资产', mode: '引用资产' },
          { label: '政策正文', value: '真文字层，支持逐字替换', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: '竖屏 LayerTemplate', specification: '背景 / 主题字 / 氛围 / 侧卡 / 政策词 / 商品层', required: true },
      { name: '安全区定义', specification: '主播、评论区、礼物与运营组件遮挡区', required: true },
      { name: '尺寸校验', specification: '全屏画布与透明层边界', required: true },
    ],
    constraints: ['不将主播作为图像层生成', '文字与权益数值不进入背景层', '新版本不自动覆盖正在直播的实例'],
    usage: '生服官号直播间分层套件引用',
    accent: '#C95B82',
    thumbnail: 'https://p9-magic.byteimg.com/tos-cn-i-tokbwntzau/magic_eco/f726eff13fa7eba801aad59b0bb6c3be~tplv-tokbwntzau-perf:0:0:q90.image?size=1374x2437&magic_type=image_png',
    governance: {
      source: '生服官号直播间 Skill v3.40',
      evidence: '16 个业务 benchmark 的画布、安全区与图层结构',
      rights: '模板结构可跨项目使用；具体商品图、标题字和品牌资产单独核验',
      qualityGate: '安全区侵入、文字遮挡、透明边缘、层级与分辨率检查',
      importFormats: ['Layer Manifest', 'PSD', 'Figma Frame', '直播安全区定义'],
    },
  },
  {
    id: 'template.interest-card-layered',
    category: 'material-template',
    assetClass: 'layer-template',
    registry: 'asset',
    name: '兴趣卡图文分层模板',
    version: '1.0.0',
    summary: '卡面插画保持整图，标题、解释、标签和底部品牌作为真文字/品牌层编辑。',
    owner: '内容互动设计',
    status: '内测中',
    updatedAt: '2026-08-06',
    tags: ['兴趣卡', '图文混排', '分层'],
    coverage: ['Feed 兴趣卡', '落地页卡片', '分享图'],
    metrics: [
      { label: '卡面规格', value: '3 类' },
      { label: '文字槽位', value: '4 类' },
      { label: '语言', value: '2 种' },
    ],
    parameterGroups: [
      {
        name: '卡面槽位',
        summary: '插画不过度拆层，只提高文案和品牌的可复用性。',
        parameters: [
          { label: '主插画', value: '单一栅格层', mode: '固定规则' },
          { label: '标题', value: '真文字，最多 12 个汉字', mode: '可配置' },
          { label: '解释文案', value: '真文字，2–4 行', mode: '可配置' },
          { label: '卡类标签', value: '结构化标签层', mode: 'Agent 推断' },
          { label: '品牌标识', value: '引用 Brand Kit', mode: '引用资产' },
        ],
      },
    ],
    deliverables: [
      { name: '卡面 LayerTemplate', specification: '插画、标题、解释、标签、品牌 5 类槽位', required: true },
      { name: '文字容量规则', specification: '标题与正文行数、最小字号与字体回退', required: true },
      { name: '平台裁切预设', specification: 'Feed / 落地页 / 分享图', required: true },
    ],
    constraints: ['插画内的艺术字不拆成普通字体', '正文层不得叠加到角色脸部', '品牌层保持安全区和最小尺寸'],
    usage: '塔罗兴趣卡可在实例验收后提升为模板',
    accent: '#8B6BE8',
    thumbnail: '/assets/tarot-interest-card/feed-card-shell.png',
    governance: {
      source: '兴趣卡模板与塔罗卡生成项目',
      evidence: 'Feed 卡、落地页卡与文字容量回归样例',
      rights: '卡牌插画按来源授权；模板结构仅内部复用',
      qualityGate: '文字溢出、字体缺失、对比度、人脸遮挡与品牌安全区检查',
      importFormats: ['Figma Frame', 'Layer Manifest', '文案容量规则'],
    },
  },
  {
    id: 'style.night-food-3d',
    category: 'inspiration',
    assetClass: 'style-profile',
    registry: 'asset',
    name: '夜食 3D 烟火感',
    version: '2.3.1',
    summary: '暖夜城市、近景食物和高密度活动信息的 Style Bible，用于约束而非提供固定页面。',
    owner: '生活服务创意中台',
    status: '已发布',
    updatedAt: '2026-07-24',
    tags: ['3D', '夜食', '高氛围'],
    coverage: ['KV', '卡面', '运营 Banner', 'H5 页面'],
    metrics: [
      { label: 'Golden', value: '28 张' },
      { label: 'Reject', value: '19 张' },
      { label: '构图规则', value: '14 条' },
    ],
    parameterGroups: [
      {
        name: '视觉锚点',
        summary: 'Agent 可结合 Brief 调节强度，但不能脱离风格边界。',
        parameters: [
          { label: '场景时间', value: '暖光夜晚 / 夜市 / 室内夜食', mode: '可配置' },
          { label: '渲染质感', value: '精致商业 3D + 食物高光', mode: '固定规则' },
          { label: '主体密度', value: '单一主焦点 + 3–6 个陪衬元素', mode: 'Agent 推断' },
          { label: '背景景深', value: '中等，确保文字区干净', mode: '可配置' },
          { label: '强调色', value: '暖橙 / 辣椒红 / 夜蓝', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: 'Style Profile', specification: '结构化风格 token 与生成描述', required: true },
      { name: 'Golden / Reject', specification: '正例 28 张、反例 19 张', required: true },
      { name: '构图约束', specification: '焦点、文字安全区、色彩与密度规则', required: true },
    ],
    constraints: ['文字可读区不得叠高光食物', '背景不可低饱和灰紫', '不可把多个菜品并列成无焦点平铺'],
    usage: '这夏夯爆了项目当前引用',
    accent: '#E86D3A',
    thumbnail: '/assets/figma-deliverables/xiahua/food-venue-full.png',
    governance: {
      source: '这夏夯爆了视觉基准与项目素材',
      evidence: '页面 KV、卡片、Banner 正反例及设计复盘',
      rights: '仅继承已授权项目素材；第三方品牌和餐饮图片需逐项检查',
      qualityGate: '焦点数量、文字区遮挡、饱和度与画风一致性检查',
      importFormats: ['参考图', 'Figma Frame', 'Style Prompt', '品牌色板'],
    },
  },
  {
    id: 'style.xinzai-commercial-3d',
    category: 'inspiration',
    assetClass: 'style-profile',
    registry: 'asset',
    name: '心仔明快商业 3D',
    version: '1.11',
    summary: '将角色、背景、道具和光照约束成同一商业 3D 世界，避免照片背景与卡通 IP 拼贴。',
    owner: '生活服务 IP 设计',
    status: '已发布',
    updatedAt: '2026-08-04',
    tags: ['心仔', '商业 3D', '高饱和'],
    coverage: ['心仔 Banner', 'KV', '活动素材'],
    metrics: [
      { label: '场景族', value: '4 类' },
      { label: '成品参考', value: '19 张' },
      { label: '禁用项', value: '18 类' },
    ],
    parameterGroups: [
      {
        name: '风格参数',
        summary: '色彩可随主题变化，材质和角色一致性不可破坏。',
        parameters: [
          { label: '主色系', value: '明快蓝系为主，夜景用暖光夜蓝', mode: '可配置' },
          { label: '场景材质', value: '圆润商业 3D 动画材质', mode: '固定规则' },
          { label: '光照', value: '柔和高亮、主体轮廓清晰', mode: 'Agent 推断' },
          { label: '景深', value: '主角清晰，背景轻景深', mode: '可配置' },
          { label: '雨天 / 夜晚', value: '保持鲜艳卡通，不转写实灰调', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '风格锚点', specification: '角色材质、光照、色调与背景统一规则', required: true },
      { name: '成品参考', specification: '19 张 1170×330 benchmark', required: true },
      { name: '拒绝规则', specification: '写实拼贴、灰调、杂字、重复角色等', required: true },
    ],
    constraints: ['背景、角色、道具必须像同一套 3D 渲染', '雨天与夜景也必须明快高饱和', '心仔是全画面风格锚，不是后贴装饰'],
    usage: '与心仔 IP 角色包和心仔 Banner 模板联动使用',
    accent: '#3B9AF8',
    thumbnail: 'https://p6-magic.byteimg.com/tos-cn-i-tokbwntzau/ff2f9ac5dc944504ae363236cce25418~tplv-tokbwntzau-recrop:0:0:0:0:0:0:q90.png?size=1170x330&magic_type=image_png',
    governance: {
      source: '生服-心仔 IP 物料生成 Skill v1.11',
      evidence: '19 张 benchmark、7 条回归集与角色结构质检规则',
      rights: '与心仔 IP 授权绑定，不能脱离角色授权独立外发',
      qualityGate: '角色保真、场景统一、饱和度、杂字和重复主体检查',
      importFormats: ['Golden 图', 'Reject 图', '风格参考', '心仔角色资产'],
    },
  },
  {
    id: 'style.live-commerce-premium',
    category: 'inspiration',
    assetClass: 'style-profile',
    registry: 'asset',
    name: '高质感直播电商 Style Bible',
    version: '3.40',
    summary: '把直播场景、主题字、侧卡与商品层约束在统一色相、分层明度和行业化视觉语言中。',
    owner: '生活服务直播设计',
    status: '已发布',
    updatedAt: '2026-06-29',
    tags: ['直播间', '电商', '行业风格'],
    coverage: ['直播背景', '标题艺术字', '权益卡', '商品底贴'],
    metrics: [
      { label: '行业基线', value: '9 类' },
      { label: '业务样例', value: '16 个' },
      { label: '文字色数', value: '≤ 3' },
    ],
    parameterGroups: [
      {
        name: '全场风格',
        summary: '统一色相，但背景、组件和文字必须拉开明度层次。',
        parameters: [
          { label: '行业风格', value: '甜品 / 生鲜 / 中餐 / 西餐 / SPA / 服饰 / 亲子等', mode: 'Agent 推断' },
          { label: '统一色板', value: '主色 + 奶白 / 深色 + 1 个强调色', mode: '可配置' },
          { label: '背景空间', value: '写实 3D 行业理想空间 + 中央主播位', mode: '固定规则' },
          { label: '标题字效', value: '按行业选择书法 / 3D 气泡 / 斜体 / 水彩手写', mode: 'Agent 推断' },
          { label: '全件文字色', value: '2–3 色封顶', mode: '固定规则' },
          { label: '视觉层级', value: '主标题 ＞ 到手价 ＞ 面值 ＞ 政策词', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '行业风格映射', specification: '9 类行业的字效、场景和主色', required: true },
      { name: '业务反写描述', specification: '16 个案例逐物料描述', required: true },
      { name: '组件配色纪律', specification: '色相统一、明度分层、文字色数约束', required: true },
    ],
    constraints: ['背景必须有中央焦点光和空间纵深', '组件不能全部同色同亮度', '禁止廉价扁平贴纸感和无意义漂浮元素'],
    usage: '官号直播间分层套件的默认风格依赖',
    accent: '#B85F8B',
    thumbnail: 'https://p3-magic.byteimg.com/tos-cn-i-tokbwntzau/magic_eco/f1c664db80854306360f14dcf95c79ef~tplv-tokbwntzau-perf:0:0:q90.image?size=1374x2437&magic_type=image_png',
    governance: {
      source: '生服官号直播间 Skill v3.40 的 benchmark 蒸馏',
      evidence: '16 个真实业务案例与 9 类行业风格速查',
      rights: '参考图只用于内部风格学习；生成结果仍需检查品牌与商品素材授权',
      qualityGate: '背景纵深、主播位、组件对比度、文字色数与跨层一致性检查',
      importFormats: ['整体参考图', '行业标签', '品牌色板', '商品图'],
    },
  },
  {
    id: 'style.douyin-clean-campaign',
    category: 'inspiration',
    assetClass: 'style-profile',
    registry: 'asset',
    name: '抖音轻量活动页',
    version: '1.8.0',
    summary: '白底、克制色彩与内容优先的活动页 Style Bible，适合任务、榜单和规则页面。',
    owner: '体验设计平台',
    status: '已发布',
    updatedAt: '2026-07-12',
    tags: ['轻量', '白底', '内容优先'],
    coverage: ['任务页', '榜单页', '规则页'],
    metrics: [
      { label: 'Golden', value: '36 张' },
      { label: 'Reject', value: '12 张' },
      { label: '组件规则', value: '21 条' },
    ],
    parameterGroups: [
      {
        name: '页面密度',
        summary: '通过组件层级和间距控制信息量。',
        parameters: [
          { label: '页面底色', value: '白色 / 极浅灰', mode: '固定规则' },
          { label: '强调色', value: '主色 1 个，辅助色最多 1 个', mode: '可配置' },
          { label: '卡片嵌套', value: '最多 2 层', mode: '固定规则' },
          { label: '正文对比度', value: '≥ 4.5 : 1', mode: '固定规则' },
          { label: '信息密度', value: '舒展 / 标准 / 紧凑', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: 'Style Profile', specification: '页面 token 与组件约束', required: true },
      { name: '正反例', specification: 'Golden 36 张、Reject 12 张', required: true },
      { name: '组件规则', specification: '任务、榜单、规则页 21 条规则', required: true },
    ],
    constraints: ['同屏强调色不超过 2 种', '正文对比度不低于 4.5:1', '信息卡片最多两层嵌套'],
    usage: '适合作为玩法配置页之外的用户端活动页基础风格',
    accent: '#357EF8',
    governance: {
      source: '体验设计平台活动页规范',
      evidence: '36 张 Golden、12 张 Reject 与 21 条组件规则',
      rights: '内部产品设计资产，可用于抖音站内业务',
      qualityGate: '颜色数量、对比度、嵌套层数与字号层级检查',
      importFormats: ['Figma Frame', 'Design Token', '组件截图'],
    },
  },
  {
    id: 'gameplay.hidden-object.magpie-hunt',
    category: 'gameplay',
    assetClass: 'gameplay-package',
    registry: 'capability',
    name: '限时找物闯关玩法包',
    version: '0.7.0',
    summary: '7 关限时找物，包含挑战次数、任务回流、里程碑奖励、抽奖、风险控制与逐关数据记录。',
    owner: '互动活动产品 / 活动玩法平台',
    status: '内测中',
    updatedAt: '2026-08-10',
    tags: ['找茬', '限时找物', '闯关', '任务回流'],
    coverage: ['抖音 H5', 'Lynx', 'Web Preview'],
    metrics: [
      { label: '关卡', value: '7 关' },
      { label: '找物目标', value: '47 个' },
      { label: '单关', value: '90 秒' },
    ],
    parameterGroups: QIXI_MAGPIE_HUNT_GAMEPLAY_PROFILE.configGroups.map((group) => ({
      name: group.name,
      summary: group.summary,
      parameters: group.fields.map((field) => ({
        label: field.label,
        value: field.value,
        mode: field.ownership === '智能配置' ? '可配置' : field.ownership === '运营锁定' ? '引用资产' : '固定规则',
        note: `${field.key} · ${field.status}${field.constraint ? ` · ${field.constraint}` : ''}`,
      })),
    })),
    deliverables: [
      { name: '玩法能力说明', specification: '玩家主循环、状态机、边际状态、任务与奖励边界', required: true },
      { name: '调用清单', specification: '输入、输出、事件、依赖与发布前校验规则', required: true },
      { name: '七夕活动预设', specification: '7 关 / 47 目标 / 90 秒 / 任务与里程碑配置', required: true },
      { name: '视觉与热点清单', specification: '7 张场景、47 个目标热区和各状态视觉；当前待媒体权限归档', required: true },
    ],
    constraints: QIXI_MAGPIE_HUNT_GAMEPLAY_PROFILE.acceptance.slice(0, 5),
    usage: '适合大规模泛用户的轻互动活动；引用时必须同时补齐场景、热点、奖励、任务与风险服务。',
    accent: QIXI_MAGPIE_HUNT_GAMEPLAY_PROFILE.presentation.accent,
    gameplayProfile: QIXI_MAGPIE_HUNT_GAMEPLAY_PROFILE,
    sourceFiles: [
      { name: 'README.md', format: 'Markdown', status: '已归档' },
      { name: 'manifest.json', format: 'JSON', status: '已归档' },
      { name: 'Figma 交互稿视觉文件', format: 'Figma', status: '待校验' },
    ],
    governance: {
      source: '飞书《七夕「搭建鹊桥」互动玩法》revision 10 与对应 Figma 交互稿',
      evidence: '玩法主链路、7 关目标、任务额度、奖励节点、边际状态、入口人群与埋点口径均由源文档确认',
      rights: '能力结构可跨项目复用；七夕叙事、视觉和商品权益只能在授权项目内使用',
      qualityGate: '热点数量与安全区、次数账本、奖励幂等、风险兜底、渠道标识、逐关事件和依赖可解析性检查',
      importFormats: ['Gameplay Manifest JSON', 'Markdown', 'Figma', 'Hotspot Manifest'],
    },
  },
  {
    id: 'gameplay.content-ranking',
    category: 'gameplay',
    assetClass: 'gameplay-package',
    registry: 'capability',
    name: '内容榜单玩法包',
    version: '1.0.0',
    summary: '把内容池、准入、分榜、排名公式、刷新冻结和异常降级封装为可运行的榜单能力。',
    owner: '活动玩法平台',
    status: '已发布',
    updatedAt: '2026-08-07',
    tags: ['内容榜单', '分榜', '结算快照'],
    coverage: ['H5', 'Lynx', 'Web Preview'],
    metrics: [{ label: '配置组', value: '3 组' }, { label: '运行状态', value: '5 个' }, { label: '校验规则', value: '8 条' }],
    parameterGroups: [
      { name: '榜单契约', summary: '运营配置业务口径，运行时负责一致结算。', parameters: [
        { label: '业务对象', value: '作品 / 创作者 / 话题内容', mode: '可配置' },
        { label: '分榜', value: '按会场、内容分类或人群建立', mode: '可配置' },
        { label: '排名公式', value: '有效助力 + 播放/互动补正', mode: '可配置' },
        { label: '状态', value: '正常 / 空态 / 延迟 / 冻结 / 封禁降级', mode: '固定规则' },
      ] },
    ],
    deliverables: [{ name: '榜单 Schema', specification: '内容池、分榜与排名口径', required: true }, { name: 'Runtime Adapter', specification: '查询、刷新、冻结与降级', required: true }],
    constraints: ['所有会场使用同一结算快照', '异常内容必须可移出并补位', '状态变体不得误算为独立页面'],
    usage: '新春会模板的必选内容互动槽位',
    accent: '#4F46E5',
    governance: { source: '活动玩法平台能力契约', evidence: 'ACG 双分会场榜单与 5 状态运行需求', rights: '平台内部能力，可按版本引用', qualityGate: '内容准入、排名公式、刷新冻结、异常降级和快照一致性', importFormats: ['内容池', '排名公式', '审核规则'] },
  },
  {
    id: 'gameplay.dual-action-boost',
    category: 'gameplay',
    assetClass: 'gameplay-package',
    registry: 'capability',
    name: '双动作助力玩法包',
    version: '1.0.0',
    summary: '同一内容对象上的普通/高价值双动作助力，分别管理文案、权重、配额、反刷和榜单回写。',
    owner: '活动玩法平台',
    status: '已发布',
    updatedAt: '2026-08-07',
    tags: ['助力', '双动作', '榜单回写'],
    coverage: ['H5', 'Lynx', 'Web Preview'],
    metrics: [{ label: '动作槽位', value: '2 个' }, { label: '频控层', value: '3 层' }, { label: '回写目标', value: '1 个' }],
    parameterGroups: [
      { name: '动作与回写', summary: '两个动作共享对象，配额和分值独立。', parameters: [
        { label: '动作', value: '普通动作 / 高价值动作', mode: '可配置' },
        { label: '频控', value: '用户日额 / 单作品额度 / 冷却时间', mode: '可配置' },
        { label: '回写', value: '目标榜单 + 得分 + 当前名次反馈', mode: '引用资产' },
      ] },
    ],
    deliverables: [{ name: '助力 Schema', specification: '动作、权重、配额和反馈', required: true }, { name: '反刷与回写适配', specification: '风险拦截、幂等写入和榜单反馈', required: true }],
    constraints: ['助力必须引用有效榜单', '高价值动作必须单独频控', '异常设备不得影响结算'],
    usage: '与内容榜单玩法包组合使用',
    accent: '#EC4899',
    governance: { source: '活动玩法平台能力契约', evidence: 'ACG 分会场双动作助力运行需求', rights: '平台内部能力，可按版本引用', qualityGate: '配额、反刷、幂等、榜单引用和反馈一致性', importFormats: ['动作配置', '频控规则', '榜单引用'] },
  },
  {
    id: 'gameplay.climb-lite',
    category: 'gameplay',
    assetClass: 'gameplay-package',
    registry: 'capability',
    name: '跃马攀峰轻游戏玩法包',
    version: '0.8.0',
    summary: '可选的 45 秒轻量跑酷/攀升玩法，独立管理局数、难度、积分和任务回流，不改写活动主流程。',
    owner: '活动玩法平台',
    status: '内测中',
    updatedAt: '2026-08-07',
    tags: ['轻游戏', '跑酷', '任务回流'],
    coverage: ['H5', 'Web Preview'],
    metrics: [{ label: '运行状态', value: '4 个' }, { label: '难度档', value: '3 档' }, { label: '回流事件', value: '1 个' }],
    parameterGroups: [
      { name: '对局与回流', summary: '对局独立结算，只向 ActivitySpec 回写完成事实。', parameters: [
        { label: '单局时长', value: '30–90 秒', mode: '可配置' },
        { label: '难度曲线', value: '固定 / 逐段加速', mode: '可配置' },
        { label: '任务回流', value: 'minigame.completed', mode: '固定规则' },
        { label: '角色素材', value: '引用项目 IP Kit', mode: '引用资产' },
      ] },
    ],
    deliverables: [{ name: '游戏 Runtime', specification: '运行、暂停、结算和达成状态', required: true }, { name: '视觉槽位', specification: '入口小卡、角色、障碍与结果态', required: true }],
    constraints: ['玩法结果不直接修改内容榜单', '角色必须来自已授权 IP Kit', '未启用时不进入交付矩阵'],
    usage: '新春会模板的可选场景小游戏槽位',
    accent: '#F97316',
    governance: { source: '活动玩法平台轻游戏契约', evidence: 'ACG 跃马攀峰入口与状态画板', rights: '平台内部 Runtime；角色与视觉按项目授权', qualityGate: '局数、难度、事件回写、素材授权和可选槽位关闭检查', importFormats: ['关卡参数', '角色素材', '任务引用'] },
  },
  {
    id: 'gameplay.lottery',
    category: 'gameplay',
    assetClass: 'gameplay-package',
    registry: 'capability',
    name: '抽奖玩法包',
    version: '1.0.0',
    summary: '支持抽卡、九宫格与转盘，包含内容池、概率、保底、库存、次数和频控契约。',
    owner: '活动玩法平台',
    status: '已发布',
    updatedAt: '2026-08-05',
    tags: ['抽奖', '概率', '保底'],
    coverage: ['抖音 H5', 'Lynx', 'Web Preview'],
    metrics: [
      { label: '配置字段', value: '16 项' },
      { label: '校验规则', value: '7 条' },
      { label: '运行适配', value: '3 端' },
    ],
    parameterGroups: [
      {
        name: '核心规则',
        summary: '玩法包定义可编辑边界，实例保存具体活动值。',
        parameters: [
          { label: '抽奖形式', value: '抽卡 / 九宫格 / 转盘', mode: '可配置' },
          { label: '内容池', value: '卡牌 / 权益 / 实物 / 谢谢参与', mode: '引用资产' },
          { label: '概率模式', value: '固定概率 / 权重 / 分群概率', mode: '可配置' },
          { label: '保底', value: '次数保底 / 连续未中保底 / 无', mode: '可配置' },
          { label: '次数来源', value: '初始次数 + 任务发放 + 补偿', mode: '引用资产' },
          { label: '频控', value: '日 / 周 / 活动期 / 用户分群', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: '玩法 Schema', specification: '配置字段、默认值和 Agent 可编辑范围', required: true },
      { name: '校验器', specification: '概率、库存、保底与引用完整性', required: true },
      { name: 'Runtime Adapter', specification: 'H5 / Lynx / Web Preview', required: true },
    ],
    constraints: ['概率必须归一化为 100%', '保底不得绕过库存', '人工接管字段不可被 Agent 静默覆盖'],
    usage: '这夏夯爆了当前正在使用',
    accent: '#8B5CF6',
    governance: {
      source: '活动玩法平台能力契约',
      evidence: '当前项目抽卡集卡配置与发布检查',
      rights: '平台内部能力，可被活动项目按版本引用',
      qualityGate: '概率和、库存覆盖、次数闭环、奖品履约与人工锁定检查',
      importFormats: ['奖品表', '内容池 CSV', '用户分群', '任务配置'],
    },
  },
  {
    id: 'gameplay.collection',
    category: 'gameplay',
    assetClass: 'gameplay-package',
    registry: 'capability',
    name: '集卡玩法包',
    version: '0.9.4',
    summary: '管理卡册、卡片稀有度、抽取映射、赠送边界、组合收集和多档兑换。',
    owner: '活动玩法平台',
    status: '内测中',
    updatedAt: '2026-07-30',
    tags: ['集卡', '赠送', '兑换'],
    coverage: ['抖音 H5', 'Web Preview'],
    metrics: [
      { label: '配置字段', value: '24 项' },
      { label: '对象槽位', value: '3 个' },
      { label: '校验规则', value: '11 条' },
    ],
    parameterGroups: [
      {
        name: '卡册与兑换',
        summary: '卡片身份在抽取、展示、赠送和兑换中保持一致。',
        parameters: [
          { label: '卡片数量', value: '2–30 张 / 卡册', mode: '可配置' },
          { label: '稀有度', value: '普通 / 稀有 / 隐藏 / 自定义', mode: '可配置' },
          { label: '卡面内容', value: '从卡池或素材清单导入', mode: '引用资产' },
          { label: '赠送规则', value: '可赠 / 不可赠 / 每日上限 / 好友限制', mode: '可配置' },
          { label: '兑换档位', value: '集齐指定组合或数量', mode: '可配置' },
          { label: '卡片消耗', value: '保留 / 消耗 / 二次确认', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: '卡册 Schema', specification: '卡片、稀有度与组合规则', required: true },
      { name: '卡面槽位', specification: '正面、背面、锁定态、分享态', required: true },
      { name: '兑换契约', specification: '组合条件、奖品与消耗方式', required: true },
    ],
    constraints: ['兑换档位必须引用有效奖品', '赠送与抽取共用同一卡片身份', '消耗型兑换必须二次确认'],
    usage: '正在被当前项目和 11 个内部实例试用',
    accent: '#14B8A6',
    governance: {
      source: '活动玩法平台能力契约',
      evidence: '这夏夯爆了卡池、兑换档位与素材绑定配置',
      rights: '平台内部能力，可被活动项目按版本引用',
      qualityGate: '卡片 ID、稀有度、抽取概率、赠送上限和兑换奖品完整性检查',
      importFormats: ['卡池 CSV', '卡面素材', '兑换表', '奖品池'],
    },
  },
  {
    id: 'gameplay.task',
    category: 'gameplay',
    assetClass: 'gameplay-package',
    registry: 'capability',
    name: '任务玩法包',
    version: '0.8.6',
    summary: '将投稿、点赞、访问、邀请等业务动作映射为可计数任务，并发放抽奖次数或卡片。',
    owner: '活动玩法平台',
    status: '内测中',
    updatedAt: '2026-07-26',
    tags: ['任务', '资源发放', '计数'],
    coverage: ['抖音 H5', 'Lynx', 'Web Preview'],
    metrics: [
      { label: '任务类型', value: '8 类' },
      { label: '计数周期', value: '4 类' },
      { label: '校验规则', value: '9 条' },
    ],
    parameterGroups: [
      {
        name: '任务事实',
        summary: '运营选择用户可理解的业务动作，不填写技术事件 ID。',
        parameters: [
          { label: '任务类型', value: '投稿 / 点赞 / 访问 / 邀请 / 行为教育等', mode: '可配置' },
          { label: '完成阈值', value: '次数 / 天数 / 连续天数 / 累计值', mode: '可配置' },
          { label: '计数周期', value: '单次 / 每日 / 每周 / 活动期', mode: '可配置' },
          { label: '适用人群', value: '全部 / 新用户 / 创作者 / 自定义人群', mode: '引用资产' },
          { label: '发放内容', value: '抽奖次数 / 卡片 / 积分 / 权益', mode: '引用资产' },
          { label: '补发策略', value: '自动重试 / 人工补发 / 不补发', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: '任务 Schema', specification: '任务类型、阈值、周期与奖励', required: true },
      { name: '计数契约', specification: '业务事实到计数器的映射', required: true },
      { name: '发放契约', specification: '幂等资源发放与重试', required: true },
    ],
    constraints: ['运营只配置业务事实，不填写事件 ID', '奖励发放必须幂等', '跨玩法资源引用必须存在'],
    usage: '作为抽奖次数和卡片供给的上游玩法',
    accent: '#F59E0B',
    governance: {
      source: '活动玩法平台能力契约',
      evidence: '当前项目阶段任务、通用任务和资源发放配置',
      rights: '平台内部能力，可被活动项目按版本引用',
      qualityGate: '任务可达性、阈值、周期、幂等发放和跨玩法引用检查',
      importFormats: ['任务表格', '人群包', '资源发放规则'],
    },
  },
  {
    id: 'font.douyin-sans',
    category: 'font',
    assetClass: 'font-family',
    registry: 'asset',
    name: '抖音 Sans',
    version: '2.0',
    summary: '抖音品牌默认中文字体，覆盖页面标题、正文、数字展示与图片生成。',
    owner: '抖音品牌设计',
    status: '已发布',
    updatedAt: '2026-05-20',
    tags: ['中文', '品牌字体', '可嵌入'],
    coverage: ['抖音', 'Lynx', '站内 H5', '图片生成'],
    metrics: [
      { label: '字重', value: '5 个' },
      { label: '字符集', value: 'GB18030' },
      { label: '端能力', value: '4 类' },
    ],
    parameterGroups: [
      {
        name: '排版角色',
        summary: '不同语义角色绑定允许的字重和字号范围。',
        parameters: [
          { label: '页面标题', value: 'Bold / Heavy', mode: '可配置' },
          { label: '卡片标题', value: 'Medium / Bold', mode: '可配置' },
          { label: '正文', value: 'Regular / Medium', mode: '固定规则' },
          { label: '数字信息', value: '等宽数字变体', mode: '可配置' },
          { label: 'Web 子集', value: '按文案自动裁剪', mode: 'Agent 推断' },
        ],
      },
    ],
    deliverables: [
      { name: '字体文件', specification: '5 个字重 + 数字等宽变体', required: true },
      { name: 'Web 子集', specification: '按项目字符集生成 WOFF2', required: true },
      { name: '授权记录', specification: '业务范围、端范围和导出限制', required: true },
    ],
    constraints: ['仅限抖音及已授权业务场景', '站外传播需转曲或重新申请', '正文不得使用 Heavy 字重'],
    usage: '活动项目的默认页面字体',
    accent: '#161823',
    preview: '今晚，把城市吃到发光',
    governance: {
      source: '抖音品牌字体资产',
      evidence: '字体源文件、端侧子集与字体角色映射',
      rights: '抖音及已授权业务使用；源文件不可随项目外发',
      qualityGate: '缺字、字重角色、字体回退、包体和端兼容检查',
      importFormats: ['TTF', 'OTF', 'WOFF2', '字符子集清单'],
    },
  },
  {
    id: 'font.douyin-meihao',
    category: 'font',
    assetClass: 'font-family',
    registry: 'asset',
    name: '抖音美好体',
    version: 'Bold',
    summary: '直播政策词、活动权益短句和高识别运营文案使用的品牌展示字体。',
    owner: '抖音品牌设计',
    status: '已发布',
    updatedAt: '2026-06-29',
    tags: ['展示字体', '直播间', '运营文案'],
    coverage: ['直播贴片', '图片生成', '活动短标题'],
    metrics: [
      { label: '当前字重', value: 'Bold' },
      { label: '推荐字号', value: '展示级' },
      { label: '交付格式', value: 'TTF' },
    ],
    parameterGroups: [
      {
        name: '使用角色',
        summary: '适合短句展示，不承担长正文。',
        parameters: [
          { label: '默认文案角色', value: '直播政策词 / 权益短句', mode: '固定规则' },
          { label: '默认颜色', value: '白字 + 深色描边', mode: '可配置' },
          { label: '直播底边位置', value: 'y = 95.5%', mode: '固定规则' },
          { label: '长文使用', value: '禁止', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '字体文件', specification: 'DouyinSansBold.ttf', required: true },
      { name: '渲染预设', specification: '白字、深描边、底边位置', required: true },
      { name: '回退策略', specification: '加载失败必须显式告警', required: true },
    ],
    constraints: ['仅用于展示级短文案', '字体加载失败不得静默换字体', '源文件不随普通项目包外发'],
    usage: '官号直播间 L-text 政策词的固定字体',
    accent: '#FE2C55',
    preview: '放心囤 随时退 过期退',
    governance: {
      source: '官号直播间 Skill 固定字体依赖',
      evidence: '直播间政策词确定性渲染链路',
      rights: '沿用抖音品牌字体授权范围',
      qualityGate: '字体文件完整性、加载结果、缺字和字号可读性检查',
      importFormats: ['TTF', '渲染预设 JSON'],
    },
  },
  {
    id: 'font.fangfang-xianfeng',
    category: 'font',
    assetClass: 'font-family',
    registry: 'asset',
    name: '方方先锋体',
    version: '100',
    summary: '无 IP 热点 Banner 的确定性标题字体，用于官方字号阶梯和双尺寸文字合成。',
    owner: '生活服务创意中台',
    status: '待更新',
    updatedAt: '2026-08-05',
    tags: ['Banner', '展示字体', '确定性合成'],
    coverage: ['热点话题 Banner'],
    metrics: [
      { label: '字号档位', value: '8 档' },
      { label: '标题字数', value: '3–14' },
      { label: '交付尺寸', value: '2 个' },
    ],
    parameterGroups: [
      {
        name: '标题阶梯',
        summary: '字号由可见字符数决定，运营不能随意拖拽破坏框架。',
        parameters: [
          { label: '3–4 字', value: '130', mode: '固定规则' },
          { label: '5 / 6 / 7 / 8 字', value: '116 / 105 / 98 / 83', mode: '固定规则' },
          { label: '9 / 10 字', value: '78 / 70', mode: '固定规则' },
          { label: '11–14 字', value: '双行 98 / 83', mode: '固定规则' },
          { label: '副标题', value: '36–30 自动缩号', mode: 'Agent 推断' },
        ],
      },
    ],
    deliverables: [
      { name: '字体文件', specification: 'TTF', required: true },
      { name: '字号阶梯', specification: '标题字数到字号和行距映射', required: true },
      { name: '双尺寸渲染预设', specification: '1170×330 / 780×220', required: true },
    ],
    constraints: ['仅用于登记的 Banner 版式', '授权范围需要在字体资产登记中持续维护', '标题超规必须阻断而非强行缩小'],
    usage: '无 IP 热点 Banner Skill v6.5 的文字合成依赖',
    accent: '#D89A17',
    preview: '夏日冰饮，全城清凉',
    governance: {
      source: '生服热点话题 Banner Skill v6.5',
      evidence: '官方字号阶梯、双尺寸渲染和 7 条标准 Query',
      rights: '当前登记为内部 Banner 场景使用；站外与源文件流转需复核',
      qualityGate: '字数门禁、字号阶梯、逐字文案、双尺寸清晰度检查',
      importFormats: ['TTF', '字号阶梯 JSON'],
    },
  },
  {
    id: 'font.source-han-sans',
    category: 'font',
    assetClass: 'font-family',
    registry: 'asset',
    name: '思源黑体',
    version: '2.004',
    summary: '跨平台兜底中文字体，用于长文、规则和多语言混排。',
    owner: '字体资产平台',
    status: '已发布',
    updatedAt: '2026-04-16',
    tags: ['中文', '开源授权', '多语言'],
    coverage: ['Web', 'H5', '图片生成'],
    metrics: [
      { label: '字重', value: '7 个' },
      { label: '语言', value: '中日韩' },
      { label: '授权', value: 'OFL' },
    ],
    parameterGroups: [
      {
        name: '兜底策略',
        summary: '品牌字体缺字或长文场景时自动回退。',
        parameters: [
          { label: '正文默认字重', value: 'Regular', mode: '固定规则' },
          { label: '小字号', value: 'Regular / Medium', mode: 'Agent 推断' },
          { label: '多语言混排', value: 'SC / TC / JP / KR', mode: '可配置' },
          { label: '品牌标题替代', value: '不允许', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '字体家族', specification: '7 个字重，中日韩字符集', required: true },
      { name: 'Web 子集', specification: 'WOFF2', required: true },
      { name: '授权文件', specification: 'SIL Open Font License', required: true },
    ],
    constraints: ['发布产物保留开源授权声明', '不可替代品牌标题字', '小字号优先 Regular'],
    usage: '长规则、多语言和品牌字体缺字时回退',
    accent: '#4B5563',
    preview: '规则清楚，体验自然',
    governance: {
      source: '字体资产平台开源字体镜像',
      evidence: '字体文件、字符集清单与 OFL 授权文件',
      rights: '遵循 SIL Open Font License',
      qualityGate: '缺字、语言变体、字体回退和授权文件完整性检查',
      importFormats: ['OTF', 'TTF', 'WOFF2', 'OFL.txt'],
    },
  },
  {
    id: 'template.channel-resource-pack-no-page',
    category: 'activity-template',
    assetClass: 'activity-template',
    registry: 'asset',
    name: '全渠道资源位整包',
    version: '1.0.0',
    summary: '面向已有承接页、话题页或内容详情页的轻量活动：不新建 H5/Lynx，通过搜索、话题、活动中心、开屏和业务频道等资源位形成统一触达矩阵。',
    owner: '活动产品中台',
    status: '内测中',
    updatedAt: '2026-08-07',
    tags: ['0 页面', '资源位矩阵', '存量承接', '轻量投放'],
    coverage: ['搜索', '话题', '活动中心', '开屏', '业务频道', '图片生成'],
    metrics: [
      { label: '新增页面', value: '0 个' },
      { label: '标准规模', value: '6–12 个资源位' },
      { label: '核心形式', value: '触达矩阵' },
    ],
    templateProfile: {
      purpose: '当活动已有可复用的内容页、话题页或业务承接页时，用一套统一身份和信息策略覆盖多个流量入口，而不是为了“像活动”再造一个无必要的 H5。',
      organization: '1 个既有承接目标 + 1 份资源位清单；运营统一活动主题与节奏，各资源位 Owner 负责真实尺寸、审核和排期，没有主会场/分会场层级。',
      gameplay: '默认无玩法，只承担活动触达和导流；可以表达倒计时、利益点或内容主题，但若需要抽奖、榜单、集卡等交互，应切换或组合其它活动模板。',
      scale: '标准档为 1–2 个投放阶段、6–12 个站内资源位、2–4 天生产周期；新增页面为 0，工作量按尺寸与信息职责计数。',
      format: 'PNG/WebP/JPG 资源位整包，覆盖搜索、话题、活动中心、开屏与业务频道；每个 Surface 独立重排，不从一张 KV 机械裁切。',
      fit: '适合已有承接页的节点宣传、内容专题、品牌合作和短周期热点；不适合需要独立活动主流程、用户状态或复杂玩法的项目。',
      systemMap: {
        journey: [
          { label: '多入口曝光', detail: '搜索、话题、开屏等触达' },
          { label: '理解单一利益点', detail: '每个资源位只讲一件事' },
          { label: '点击跳转', detail: '携带统一活动识别' },
          { label: '既有页面承接', detail: '话题、内容或业务页面' },
        ],
        assetInputs: [
          { label: '资源位整包模板', role: '活动结构' },
          { label: 'Brand Kit', role: '品牌身份' },
          { label: 'Style Bible', role: '视觉语法' },
          { label: '文案与承接链接', role: '项目内容' },
          { label: 'Resource Slot', role: '尺寸合同' },
        ],
        outputs: [
          { label: '6–12 个资源位', detail: '逐 Surface 独立排版' },
          { label: '文案矩阵', detail: '标题、利益点、时间与 CTA' },
          { label: '投放检查单', detail: '尺寸、安全区、跳转与审核' },
        ],
      },
    },
    parameterGroups: [
      {
        name: '活动主流程内核',
        summary: '没有新页面，但仍有清楚的触达、理解和承接链路；承接目标是整个模板的第一项必填。',
        parameters: [
          { label: '触达链路', value: '站内资源位曝光 → 单一利益点理解 → 点击 → 既有页面/内容承接', mode: '固定规则' },
          { label: '承接目标', value: '话题页 / 内容详情 / 直播间 / 已有活动页 / 业务频道', mode: '可配置' },
          { label: '投放阶段', value: '预热 / 爆发 / 收官中选择 1–2 段', mode: '可配置' },
          { label: '新增页面数', value: '0；若 Brief 出现页面模块或用户状态，必须重新判断模板', mode: '固定规则' },
          { label: '玩法槽位', value: '无默认玩法；仅允许跳转到承接目标已有能力', mode: '固定规则' },
        ],
      },
      {
        name: '资源位矩阵',
        summary: '每个 Surface 都有自己的信息职责、尺寸合同、安全区与审核 Owner。',
        parameters: [
          { label: '资源位选择', value: '搜索 / 话题 / 活动中心 / 开屏 / 业务频道，多选', mode: '可配置' },
          { label: '主信息', value: '活动身份 + 单一利益点 + 时间/行动提示', mode: '可配置' },
          { label: '尺寸来源', value: '读取真实 ResourceSlot 合同，不使用“横版/竖版”模糊值', mode: '引用资产' },
          { label: '适配策略', value: '按信息优先级重排角色、标题和背景，不做 center-crop', mode: '固定规则' },
          { label: '投放校验', value: '文字安全区、Logo、跳转、时间、Owner 与审核状态逐项检查', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '资源位清单', specification: 'Surface、真实尺寸、信息职责、承接链接、Owner、排期与审核状态', required: true },
      { name: '主视觉母版', specification: '只作为视觉关系基准，不直接等同于所有渠道成片', required: true },
      { name: '资源位成片整包', specification: '标准 6–12 张 PNG/WebP/JPG，每张保留独立交付 ID 与尺寸合同', required: true },
      { name: '文案矩阵', specification: '活动身份、标题、利益点、时间和 CTA 的逐渠道版本', required: true },
      { name: '投放检查单', specification: '尺寸、安全区、跳转、时效、Logo、版权与审核结果', required: true },
    ],
    constraints: ['不得为了套模板虚构 H5/Lynx 页面', '没有明确承接目标时不得开始批量生成', '资源位必须按职责重排而非机械裁切', '同一画面不同尺寸仍需分别登记和验收'],
    usage: '从 ACG 新春会“资源位延展”10 个真实节点和春晚资源位画板中抽取；可独立用于只有站内图片投放、没有页面建设的活动',
    accent: '#2F7CF6',
    thumbnail: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png', label: '游戏中心发现页', specification: 'Figma node 2229:63622 · 1372×512' },
      { src: '/assets/figma-deliverables/acg/topic-header-banner.png', label: '话题头图与 Banner', specification: 'Figma node 2229:64229 · 1125×450' },
      { src: '/assets/figma-deliverables/acg/splash-screen.png', label: '竖版开屏', specification: 'Figma node 2229:67795 · 1242×2208' },
      { src: '/assets/figma-deliverables/acg/activity-center-banner.png', label: '活动中心入口', specification: 'Figma node 2229:64459 · 1029×420' },
    ],
    sourceFiles: [
      { name: 'ACG 新春会 · 资源位延展.fig', format: 'Figma', status: '已归档' },
      { name: 'resource-slot-manifest.json', format: 'JSON', status: '待校验' },
    ],
    governance: {
      source: 'ACG 新春会与 2026 春晚真实资源位延展画板',
      evidence: '真实案例分别提供搜索、话题、活动中心、游戏中心、开屏和活动 Banner 的独立节点；模板抽取的是可独立生产的资源位工作模式，不宣称原项目本身没有页面',
      rights: '模板只复用渠道合同与组织方式；ACG、春晚、角色、标题字与项目成片不得跨项目沿用',
      qualityGate: '承接目标、真实尺寸、信息职责、安全区、逐字文案、版权、Owner 与投放状态检查',
      importFormats: ['Figma', 'PNG', 'WebP', 'CSV', 'JSON'],
    },
  },
  {
    id: 'template.live-program-asset-pack',
    category: 'activity-template',
    assetClass: 'activity-template',
    registry: 'asset',
    name: '直播节目包装整包',
    version: '1.0.0',
    summary: '不新建活动页面，以一场直播或节目为中心，为主机位、竖屏、无障碍频道、节目单元和站内外屏幕生成成套识别物料。',
    owner: '节目活动产品中台',
    status: '内测中',
    updatedAt: '2026-08-07',
    tags: ['0 页面', '直播包装', '频道矩阵', '节目同步'],
    coverage: ['直播封面', '直播竖图', '无障碍频道', '节目封面', '行政屏'],
    metrics: [
      { label: '新增页面', value: '0 个' },
      { label: '标准规模', value: '8–16 项物料' },
      { label: '核心形式', value: '直播频道矩阵' },
    ],
    templateProfile: {
      purpose: '为已经在直播产品内承载的节目活动建立统一识别和多频道包装，让用户能区分主机位、竖屏、手语、字幕与不同节目单元，无需额外创建活动页。',
      organization: '1 场节目活动统筹时间、标题与主视觉，1–N 个直播频道或节目单元共享内容源；直播运营、节目编导和设计围绕同一场次表协作。',
      gameplay: '默认无独立玩法，核心行为是进入对应直播频道观看；红包、抽奖或预约只能引用直播产品已有能力，不能在图片模板里伪造运行逻辑。',
      scale: '标准档为 1 个活动身份、3–8 个直播频道/节目单元、8–16 项图片物料，生产周期 3–7 天；新增活动页面为 0。',
      format: '横版直播封面、竖版频道图、无障碍频道封面、节目单元封面及行政横/竖屏；状态由直播间真实排期和频道数据驱动。',
      fit: '适合春晚、演唱会、赛事、多机位直播和系列节目；不适合需要独立会场、复杂任务或跨日用户成长状态的活动。',
      systemMap: {
        journey: [
          { label: '识别节目', detail: '从入口看懂场次与状态' },
          { label: '选择频道', detail: '主机位、竖屏或无障碍' },
          { label: '进入直播间', detail: '承接到真实直播能力' },
          { label: '结束后回放', detail: '沿用同一节目内容源' },
        ],
        assetInputs: [
          { label: '直播包装模板', role: '活动结构' },
          { label: 'Brand Kit', role: '品牌身份' },
          { label: '直播 Style', role: '视觉语法' },
          { label: '节目与场次表', role: '项目内容' },
          { label: '直播间 ID', role: '业务数据' },
        ],
        outputs: [
          { label: '频道封面', detail: '主机位、竖屏、字幕与手语' },
          { label: '节目单元封面', detail: '由同一节目表批量生成' },
          { label: '直播前检查单', detail: '排期、ID、画幅与版权' },
        ],
      },
    },
    parameterGroups: [
      {
        name: '活动主流程内核',
        summary: '活动组织发生在直播频道与节目排期中，而非新建页面中。',
        parameters: [
          { label: '观看链路', value: '资源位/直播入口 → 识别频道 → 进入直播间 → 切换机位或节目 → 结束态回放', mode: '固定规则' },
          { label: '节目内容源', value: '场次、时间、频道、主持/嘉宾、节目标题与直播间 ID', mode: '引用资产' },
          { label: '频道类型', value: '主机位 / 竖屏 / 手语 / 字幕 / 节目单元', mode: '可配置' },
          { label: '直播状态', value: '预约 / 直播中 / 已结束 / 回放', mode: '可配置' },
          { label: '新增页面数', value: '0；所有入口承接到真实直播间或回放页', mode: '固定规则' },
        ],
      },
      {
        name: '节目包装矩阵',
        summary: '标题、角色与频道标识由同一内容表驱动，画幅只决定如何重排。',
        parameters: [
          { label: '频道识别', value: '频道名称、直播状态、节目标题和主视觉必须一致', mode: '固定规则' },
          { label: '横版封面', value: '1116×630 或具体直播 Surface 合同', mode: '引用资产' },
          { label: '竖版封面', value: '728×1032 或具体直播 Surface 合同', mode: '引用资产' },
          { label: '无障碍版本', value: '字幕 / 手语作为独立频道身份，不用角标临时覆盖', mode: '固定规则' },
          { label: '线下屏', value: '行政横屏 / 竖屏可选，读取各屏幕安全区', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: '直播频道清单', specification: '频道类型、直播间 ID、排期、状态、节目名称、Owner 与审核状态', required: true },
      { name: '主机位与频道封面', specification: '主机位、竖屏、字幕、手语等独立画幅与身份', required: true },
      { name: '节目单元封面', specification: '按节目内容表批量生成，标题与排期保持单一事实源', required: true },
      { name: '站内外屏幕物料', specification: '活动 Banner、行政横/竖屏按真实需求选配', required: false },
      { name: '直播前检查单', specification: '直播间 ID、时间、频道名、节目名、画幅、安全区与版权检查', required: true },
    ],
    constraints: ['不得在静态图中模拟一个不存在的直播能力', '节目标题与直播时间必须来自同一内容源', '无障碍频道必须独立验收可识别性', '直播间 ID 未确认时成片不得标记可发布'],
    usage: '从 2026 春晚 Figma“直播间物料”真实节点抽取；适合只交付直播包装、节目封面和屏幕物料而不建设活动页的项目',
    accent: '#D73B35',
    thumbnail: '/assets/figma-deliverables/spring-gala/live-main-camera.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/spring-gala/live-main-camera.png', label: '主机位封面', specification: 'Figma node 739:121303 · 1116×630' },
      { src: '/assets/figma-deliverables/spring-gala/live-vertical-cover.png', label: '竖版直播封面', specification: 'Figma node 739:121593 · 728×1032' },
      { src: '/assets/figma-deliverables/spring-gala/live-sign-language-cover.png', label: '手语频道封面', specification: 'Figma node 739:121021 · 1116×630' },
      { src: '/assets/figma-deliverables/spring-gala/program-cover-landscape.png', label: '节目单元横版封面', specification: 'Figma node 739:120914 · 1116×630' },
    ],
    sourceFiles: [
      { name: '2026春晚&元宵 · 直播间物料.fig', format: 'Figma', status: '已归档' },
      { name: 'live-program-manifest.csv', format: 'CSV', status: '待校验' },
    ],
    governance: {
      source: '2026 春晚真实直播间物料与节目封面节点',
      evidence: '主机位、竖屏、字幕、手语及节目单元均有独立 Figma 交付节点，证明活动组织可以只发生在直播与物料矩阵中',
      rights: '模板复用频道与排期结构；春晚人物、节目名、标题字和成片仅限原项目',
      qualityGate: '直播间 ID、单一内容源、频道识别、时间、画幅、安全区、无障碍标识与版权检查',
      importFormats: ['Figma', 'PNG', 'WebP', 'CSV', 'JSON'],
    },
  },
  {
    id: 'template.program-gala-omnichannel',
    category: 'activity-template',
    assetClass: 'activity-template',
    registry: 'asset',
    name: '全渠道节目盛典',
    version: '1.0.0',
    summary: '从话题与资源位触达，到主会场直播、节目单、抽奖、结果分享和多画幅传播的节目活动模板；来源为 2026 抖音春晚真实交付。',
    owner: '节目活动产品中台',
    status: '内测中',
    updatedAt: '2026-08-06',
    tags: ['节目盛典', '直播', '抽奖', '全渠道交付'],
    coverage: ['抖音原生页', 'Lynx', 'H5', '开屏', '直播 Tab', '线下屏'],
    metrics: [
      { label: '核心流程', value: '5 个节点' },
      { label: '交付类型', value: '8 类' },
      { label: '画幅族', value: '竖版 / 横版' },
    ],
    templateProfile: {
      purpose: '把一场直播节目盛典组织成可触达、可观看、可参与、可分享和可回放的完整活动，统一节目内容、直播状态与跨渠道传播。',
      organization: '1 个活动主会场统筹直播、节目单和互动入口，1–N 个直播频道或节目单元共享内容源，站内资源位与线下屏按阶段协同投放。',
      gameplay: '观看与节目浏览是核心行为；任务抽奖、预约、投票和祝福结果卡作为可替换互动组件，奖励必须绑定真实库存与履约。',
      scale: '标准档为 3–5 个活动阶段、1 个主会场、3–8 个直播频道/节目单元、12–30 项跨渠道交付，适合 2–6 周节点节目。',
      format: '原生话题入口、Lynx 主会场、H5 互动、直播频道与封面、站内资源位及行政横/竖屏。',
      fit: '适合春晚、演唱会、赛事和大型直播节目；若只需要直播包装而不建设会场，应使用“直播节目包装整包”。',
      systemMap: {
        journey: [
          { label: '资源位触达', detail: '话题、开屏与频道入口' },
          { label: '进入主会场', detail: '查看直播与节目单' },
          { label: '观看或参与', detail: '预约、抽奖、投票可组合' },
          { label: '生成结果卡', detail: '把参与结果变成内容' },
          { label: '分享与回放', detail: '传播并承接结束态' },
        ],
        assetInputs: [
          { label: '节目盛典模板', role: '活动结构' },
          { label: 'Brand Kit', role: '品牌身份' },
          { label: '节目 Style', role: '视觉语法' },
          { label: '节目单 / 嘉宾', role: '项目内容' },
          { label: '抽奖 / 预约包', role: '运行玩法' },
        ],
        outputs: [
          { label: '原生页与主会场', detail: '话题、Lynx 与直播频道' },
          { label: '互动 H5', detail: '抽奖与祝福结果卡' },
          { label: '跨渠道物料', detail: '开屏、直播 Tab 与线下屏' },
        ],
      },
    },
    parameterGroups: [
      {
        name: '活动主流程内核',
        summary: '定义触达、观看、参与、分享与回流顺序；抽奖和祝福卡作为可替换组件挂载。',
        parameters: [
          { label: '参与主循环', value: '资源位触达 → 主会场 → 直播/节目单 → 抽奖 → 祝福分享/回流', mode: '固定规则' },
          { label: '直播状态', value: '未开播 / 直播中 / 已结束', mode: '可配置' },
          { label: '节目内容源', value: '节目单、直播间与往年内容共用内容表', mode: '引用资产' },
          { label: '互动槽位', value: '任务抽奖 + 祝福结果卡', mode: '可配置' },
        ],
      },
      {
        name: '交付矩阵',
        summary: '按 Surface 生成不同职责的交付物，不把竖版主视觉机械裁切到所有资源位。',
        parameters: [
          { label: '站内页面', value: '原生话题页 / Lynx 主会场 / H5 抽奖 / H5 祝福卡', mode: '固定规则' },
          { label: '站内资源位', value: '开屏 / 直播间 Tab', mode: '可配置' },
          { label: '线下与内宣', value: '行政竖屏 / 商业中心横版海报', mode: '可配置' },
          { label: '画幅适配', value: '信息层级、角色构图与安全区分别编译', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '原生话题入口', specification: '活动身份、内容聚合与主会场导流', required: true },
      { name: 'Lynx 主会场', specification: '直播、节目单、抽奖、更多活动、往年内容与投稿', required: true },
      { name: 'H5 互动', specification: '抽奖页 + 祝福结果卡', required: true },
      { name: '资源位', specification: '开屏 + 直播间 Tab', required: true },
      { name: '线下与内宣', specification: '行政竖屏 + 商业中心横版海报', required: false },
    ],
    constraints: ['直播时间与节目单必须读取同一内容源', '抽奖奖品必须绑定履约与库存', '资源位必须按真实 Surface 安全区编译', '项目角色视觉不能作为跨项目 Brand Kit 复用'],
    usage: '可用于春晚、晚会、演唱会等以直播与节目内容为核心的节点活动',
    accent: '#E94138',
    thumbnail: '/assets/figma-deliverables/spring-gala/main-venue-full.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/spring-gala/main-venue-full.png', label: 'Lynx 春晚完整长页', specification: 'Figma node 773:119100 · 375×5925' },
      { src: '/assets/figma-deliverables/spring-gala/live-main-camera.png', label: '直播主机位封面', specification: 'Figma node 739:121303 · 1116×630' },
      { src: '/assets/figma-deliverables/spring-gala/activity-banner.png', label: '活动 Banner', specification: 'Figma node 439:12044 · 1074×192' },
      { src: '/assets/figma-deliverables/spring-gala/admin-screen-landscape.png', label: '行政横屏', specification: 'Figma node 686:120050 · 1920×1079' },
    ],
    sourceFiles: [
      { name: '2026春晚&元宵.fig', format: 'Figma', status: '已归档' },
      { name: 'delivery-manifest.json', format: 'JSON', status: '待校验' },
    ],
    governance: {
      source: '2026 抖音春晚真实设计交付',
      evidence: '案例文档 8 类交付 + Figma UI / 资源位延展页面',
      rights: '模板结构可复用；春晚角色、标题字和成片仅限原项目，派生项目必须重新校验授权',
      qualityGate: '直播状态、节目数据一致性、奖品履约、资源位安全区与跨画幅构图检查',
      importFormats: ['Figma', 'PNG', 'WebP', 'JSON'],
    },
  },
  {
    id: 'template.film-ip-task-card-draw',
    category: 'activity-template',
    assetClass: 'activity-template',
    registry: 'asset',
    name: '影视 IP · 任务抽卡',
    version: '1.0.0',
    summary: '以站内宣发行作为抽卡次数来源，通过单抽/十连、图鉴收集和个性化分享形成回流的影视宣发活动模板。',
    owner: '节目活动产品中台',
    status: '内测中',
    updatedAt: '2026-08-06',
    tags: ['影视 IP', '任务抽卡', '图鉴', '分享回流'],
    coverage: ['Lynx', 'H5', '分享卡', '图片生成'],
    metrics: [
      { label: '流程节点', value: '5 个' },
      { label: '能力对象', value: '任务 / 次数 / 卡池 / 图鉴 / 分享' },
      { label: '参考画框', value: '181 个' },
    ],
    templateProfile: {
      purpose: '围绕影视 IP 宣发，把站内观看、关注、互动等行为转成抽卡机会，再以稀有度卡池、图鉴收集和个性化分享形成回流。',
      organization: '1 个抽卡主会场统筹卡池、任务和图鉴；内容运营维护宣发任务，IP/法务维护素材授权，奖励与次数账本由独立能力服务管理。',
      gameplay: '任务得次数 → 单抽/十连 → 卡池概率与保底 → 图鉴收集 → 个性化分享；任务、次数、卡池、图鉴是独立但关联的数据对象。',
      scale: '标准档为 1 个主会场、1 个任务页、12–60 张卡面、5–10 类任务和 8–20 项交付，适合 1–4 周影视宣发活动。',
      format: 'Lynx/H5 抽卡主会场与任务页、卡池图鉴、结果/分享卡、搜索资源位和可选直播间包装。',
      fit: '适合电视剧、电影、综艺等拥有稳定 IP 素材和宣发行为的活动；不适合无授权卡面、无概率/库存策略或只做资源位投放的需求。',
      systemMap: {
        journey: [
          { label: '完成宣发任务', detail: '观看、关注或互动' },
          { label: '获得抽卡次数', detail: '统一进入次数账本' },
          { label: '单抽或十连', detail: '按概率、保底和库存出卡' },
          { label: '点亮卡片图鉴', detail: '记录获得与重复数量' },
          { label: '生成分享卡', detail: '用已获得卡面带来回流' },
        ],
        assetInputs: [
          { label: '任务抽卡模板', role: '活动结构' },
          { label: '剧集 Brand Kit', role: '品牌身份' },
          { label: '角色 / 卡面 IP Kit', role: '项目内容' },
          { label: '任务 / 卡池能力包', role: '运行玩法' },
          { label: '概率与库存', role: '业务数据' },
        ],
        outputs: [
          { label: '抽卡主会场', detail: '任务、次数与单抽/十连' },
          { label: '卡池图鉴', detail: '已获得、未解锁与重复卡' },
          { label: '个性化分享卡', detail: '保存、分享与搜索入口' },
        ],
      },
    },
    parameterGroups: [
      {
        name: '任务与次数',
        summary: '所有站内任务只负责产出次数，次数账本是抽卡消费的唯一事实源。',
        parameters: [
          { label: '任务来源', value: '签到 / 想看 / 关注 / 观看 / 点赞 / 投票 / 浏览', mode: '可配置' },
          { label: '奖励次数', value: '按任务配置，写入统一次数流水', mode: '可配置' },
          { label: '抽取方式', value: '单抽扣 1 次 / 十连扣 10 次', mode: '固定规则' },
          { label: '幂等与频控', value: '按用户、任务、自然日校验', mode: '固定规则' },
        ],
      },
      {
        name: '卡池与图鉴',
        summary: '卡池决定抽到什么，图鉴只展示用户持有事实，分享卡只消费已获得卡面。',
        parameters: [
          { label: '卡池规模', value: 'N 张，可配置权重、保底、库存与上下架', mode: '可配置' },
          { label: '重复卡', value: '记录持有数量，可挂补偿或赠送策略', mode: '可配置' },
          { label: '图鉴状态', value: '已获得 / 未解锁 / 重复数量', mode: '固定规则' },
          { label: '分享个性化', value: '卡面 + To 文案 + 保存 / 站内分享', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: '抽卡主会场', specification: 'IP 主视觉、卡池、单抽/十连、图鉴与任务列表', required: true },
      { name: '卡池图鉴', specification: '已获得、未解锁与重复持有状态', required: true },
      { name: '个性化分享卡', specification: '已获得卡面、用户文案、保存与分享', required: true },
    ],
    constraints: ['页面不得自行维护抽卡次数副本', '分享卡只能使用用户已获得卡面', '演员与剧集素材必须按项目授权隔离', '卡池概率、库存和保底发布前必须通过模拟'],
    usage: '适合电视剧、电影、综艺等需要站内宣发任务与收藏传播的活动',
    accent: '#8D57FF',
    thumbnail: '/assets/figma-deliverables/evernight/main-venue.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/evernight/main-venue.png', label: '抽卡主会场', specification: 'Figma node 40:27228 · 750×3652' },
      { src: '/assets/figma-deliverables/evernight/collection-page.png', label: '卡片图鉴', specification: 'Figma node 110:81917 · 750×2687' },
      { src: '/assets/figma-deliverables/evernight/search-banner-1029x420.png', label: '搜索资源位', specification: 'Figma node 1220:54942 · 1029×420' },
      { src: '/assets/figma-deliverables/evernight/card-frame-dyr.png', label: 'DYR 独占卡框', specification: 'Figma node 1608:11777 · 492×676' },
    ],
    sourceFiles: [
      { name: '《永夜星河》抽卡.fig', format: 'Figma', status: '已归档' },
      { name: 'card-pool.schema.json', format: 'JSON Schema', status: '待校验' },
    ],
    governance: {
      source: '《永夜星河》抽卡真实设计交付',
      evidence: '750 × 3652 主组件、181 个 Figma 画框与案例文档三类核心交付',
      rights: '模板结构与分层规则可复用；演员、剧名、角色和成片卡面仅限原项目',
      qualityGate: '任务幂等、次数账本、卡池模拟、图鉴一致性、分享文本安全与 IP 授权检查',
      importFormats: ['Figma', 'PNG', 'WebP', 'JSON Schema'],
    },
  },
  {
    id: 'layer.film-card-atlas-share',
    category: 'material-template',
    assetClass: 'layer-template',
    registry: 'asset',
    name: '影视卡牌 · 图鉴与分享分层模板',
    version: '1.0.0',
    summary: '把影视 IP 卡面、稀有标、锁定遮罩、持有数量、用户 To 文案和分享动作拆成可替换层，避免整图重绘。',
    owner: '节目活动视觉中台',
    status: '内测中',
    updatedAt: '2026-08-06',
    tags: ['卡牌', '图鉴', '分享卡', '分层模板'],
    coverage: ['玩法图鉴', '结果分享页', '图片生成'],
    metrics: [
      { label: '卡牌状态', value: '3 类' },
      { label: '真文字槽', value: '3 个' },
      { label: '核心图层', value: '8 层' },
    ],
    parameterGroups: [
      {
        name: '卡牌槽位',
        summary: '卡面与版权信息锁定，状态与数据层由运行时更新。',
        parameters: [
          { label: 'IP 卡面', value: '项目素材引用，不参与跨项目生成', mode: '引用资产' },
          { label: '状态遮罩', value: '已获得 / 未解锁 / 重复持有', mode: '可配置' },
          { label: '持有数量', value: '运行时真文字', mode: 'Agent 推断' },
          { label: 'To 文案', value: '最多 6 字，独立真文字层', mode: '可配置' },
        ],
      },
    ],
    deliverables: [
      { name: 'Layer Manifest', specification: '卡面 / 边框 / 稀有标 / 锁定遮罩 / 数量 / 文案 / CTA / 背景', required: true },
      { name: '图鉴状态组件', specification: '已获得、未解锁、重复数量', required: true },
      { name: '分享卡模板', specification: '卡面选择、To 文案、保存与分享', required: true },
    ],
    constraints: ['演员卡面保持锁定', '文案必须使用真文字层', '状态遮罩不得覆盖版权与角色主体', '不同项目必须替换全部 IP 专属层'],
    usage: '与“影视 IP · 任务抽卡”模板共同使用，也可服务其他具备正式 IP 授权的卡牌活动',
    accent: '#6F45D5',
    thumbnail: '/assets/figma-deliverables/evernight/card-frame-sp.png',
    visualReferences: [
      { src: '/assets/figma-deliverables/evernight/card-frame-sp.png', label: 'SP 卡框槽位', specification: 'Figma node 1608:11633 · 透明卡面区' },
      { src: '/assets/figma-deliverables/evernight/card-frame-dyr.png', label: 'DYR 独占卡框槽位', specification: 'Figma node 1608:11777 · 项目独占稀有度' },
      { src: '/assets/figma-deliverables/evernight/collection-page.png', label: '图鉴状态基线', specification: 'Figma node 110:81917 · 已获得 / 未解锁 / 重复持有' },
    ],
    governance: {
      source: '《永夜星河》图鉴与分享卡真实交付抽象',
      evidence: 'Figma 图鉴状态与个性化分享卡画面',
      rights: '仅复用结构与图层规则；项目卡面、演员与剧集元素不得跨项目复制',
      qualityGate: '保护区像素不变量、真文字、状态完整性、对比度与版权层检查',
      importFormats: ['Figma', 'PSD', 'Layer Manifest JSON'],
    },
  },
] as const

export const XIAHUA_GENERATION_BASIS: readonly GenerationReference[] = [
  {
    id: 'gameplay.lottery',
    name: '抽奖玩法包',
    version: '1.0.0',
    domain: 'capability',
    kind: '玩法能力',
    role: '决定抽取内容、概率、保底、次数和频控的可编辑范围',
    inheritedFrom: '活动目标自动选型',
  },
  {
    id: 'brand.douyin-life-service',
    name: '抖音生活服务官方 Brand Kit',
    version: '4.0.2',
    domain: 'asset',
    kind: 'Brand Kit',
    role: '提供品牌标识、颜色、字体角色和联名使用边界',
    inheritedFrom: '项目所属业务线',
  },
  {
    id: 'style.night-food-3d',
    name: '夜食 3D 烟火感',
    version: '2.3.1',
    domain: 'asset',
    kind: 'Style Profile',
    role: '约束活动主视觉、卡面和运营素材的构图与质感',
    inheritedFrom: '策划主题与参考样张匹配',
  },
  {
    id: 'font.douyin-sans',
    name: '抖音 Sans',
    version: '2.0',
    domain: 'asset',
    kind: '字体',
    role: '用于活动标题、正文和数字信息的默认排版',
    inheritedFrom: 'Brand Kit 字体角色',
  },
  {
    id: 'knowledge.life-service-ugc-campaign',
    name: '生活服务 UGC 活动方法库',
    version: '2026.07',
    domain: 'knowledge',
    kind: '运营知识',
    role: '提供任务供给、参与频次与集齐节奏的历史经验和反例',
    inheritedFrom: '活动目标与业务线检索',
  },
] as const
