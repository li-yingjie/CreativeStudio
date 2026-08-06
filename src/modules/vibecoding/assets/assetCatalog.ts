import type { GenerationReference, RegistryDomain } from '../gameplay/contracts'

export type AssetCenterCategory = 'template' | 'brand' | 'style' | 'gameplay' | 'font'

export type AssetClass =
  | 'activity-template'
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
  'activity-template': '活动模板',
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
  { id: 'template', label: '活动模板', description: '活动主流程、玩法组件槽位与交付矩阵组成的可复用活动配方' },
  { id: 'brand', label: 'Brand Kit', description: '主品牌身份、IP 角色、Banner 模板与直播间分层素材' },
  { id: 'gameplay', label: '玩法库', description: '可生成、可编辑、可校验、可运行的玩法能力包' },
  { id: 'style', label: '视觉能力', description: 'Style Profile 与可版本化的分层结构模板' },
  { id: 'font', label: '字体库', description: '字重、角色、授权和端能力明确的字体资产' },
] as const

const commonBrandGovernance = {
  rights: '仅用于已授权的抖音生活服务业务；站外传播与源文件导出需再次核验授权',
  importFormats: ['PNG', 'SVG', 'Figma', 'PSD'],
} as const

export const ASSET_CATALOG: readonly AssetCatalogItem[] = [
  {
    id: 'template.ip-co-brand-dual-venue-event',
    category: 'template',
    assetClass: 'activity-template',
    registry: 'asset',
    name: 'IP 联名 · 双会场 · 节点大会场',
    version: '1.0.0',
    summary: '面向强 IP 与节日节点的内容聚合活动模板，以双会场、榜单助力和阶段传播组织 Lynx、H5、资源位与战报交付。',
    owner: '活动产品中台',
    status: '已发布',
    updatedAt: '2026-08-06',
    tags: ['双会场', '内容榜单', '节点活动', '多端交付'],
    coverage: ['抖音', 'Lynx', '站内 H5', '站内资源位', '图片生成'],
    metrics: [
      { label: '活动阶段', value: '4 个' },
      { label: '交付组', value: '6 类' },
      { label: '组件槽位', value: '3 个' },
    ],
    parameterGroups: [
      {
        name: '活动主流程内核',
        summary: '定义用户如何触达、分流、参与、回流和结算；引用后写入 ActivitySpec，并在项目文档中结构化展示。',
        parameters: [
          { label: '参与主循环', value: '资源位触达 → 主会场理解 → 双会场分流 → 榜单参与 → 回流 → 结算传播', mode: '固定规则' },
          { label: '入口', value: '话题 Banner / 站内资源位 / 分享回流', mode: '可配置' },
          { label: '分支规则', value: '按内容偏好进入游戏会场或二次元会场', mode: '可配置' },
          { label: '回流与完成', value: '组件结果回写榜单/个人状态；结算快照驱动战报', mode: '固定规则' },
          { label: '阶段模型', value: '预热 → 主会场开启 → 分会场主推 → 结算战报', mode: '固定规则' },
          { label: '会场结构', value: '1 个主会场 + N 个内容分会场', mode: '可配置', note: '分会场数量由内容分类字段计算，不复制模板。' },
          { label: '内容骨架', value: '主题 Hero / 会场入口 / 嘉宾主理人 / 分类榜单 / 权益与规则', mode: '固定规则' },
          { label: '状态模型', value: '页面、状态变体与渠道变体分别计数', mode: '固定规则', note: '同一页面的 5 个榜单状态不能误算为 5 个页面。' },
        ],
      },
      {
        name: '玩法组件槽位',
        summary: '组件挂载在主流程节点上，只声明能力契约和槽位约束，不反向定义整个活动流程。',
        parameters: [
          { label: '榜单与助力', value: '必填 · 内容榜单 / 双动作助力能力包', mode: '引用资产' },
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
      { name: '主会场 · Lynx', specification: '1 页；设计源 1688×4237；原生状态栏、DuxTitleBar、Hero、双会场入口、阶段内容、主理人与榜单入口', required: true },
      { name: '内容分会场 · H5', specification: 'N 个路由；参考设计 750×9776；当前样例 2 个内容路由、5 个展示状态', required: true },
      { name: '资源位矩阵', specification: '话题 Banner、大横图、竖图、入口卡；画板尺寸与实际投放画框分别登记并校验', required: true },
      { name: '玩法视觉件', specification: '按已启用玩法生成主页、卡片、任务卡和结果态；运行逻辑仍由 GameplayPackage 提供', required: false },
      { name: '节目单与宣发', specification: '节目单长图、双列横卡、1080×1920 宣发图等渠道变体', required: true },
      { name: '结算战报', specification: '数据驱动的长图与渠道版；超长版参考 1080×26668，P0 允许人工排版并锁定', required: true },
    ],
    constraints: [
      '探索方向稿、脑暴板和外部参考不得计入交付完成度',
      '状态变体与独立页面分别计数，避免错误估算工作量',
      '没有激励证据时必须标记待确认，不得由 Agent 臆造奖品',
      '人工编辑或锁定的交付物不得被重编译静默覆盖',
    ],
    usage: '2026 抖音 ACG 新春会锁定 v1.0.0；用于验证模板 → 项目交付物的完整编译链路',
    accent: '#EA5B34',
    sourceFiles: [
      { name: '2026 抖音ACG新春会-创意.fig', format: 'Figma', status: '已归档' },
      { name: 'activity-template.manifest.json', format: 'JSON', status: '已归档' },
    ],
    governance: {
      source: '2026 抖音 ACG 新春会真实创意交付复盘',
      evidence: '5 个设计页面、主会场/分会场/资源位/节目单/战报的画板与状态清单',
      rights: '模板结构可跨项目复用；具体 ACG/IP 视觉与内容仅限授权项目引用',
      qualityGate: '阶段完整性、玩法槽位兼容、页面/状态计数、设计/交付尺寸、安全区、人工锁定与必交付项检查',
      importFormats: ['Figma', 'JSON', 'Markdown', 'CSV'],
    },
  },
  {
    id: 'brand.douyin-acg-new-year-2026',
    category: 'brand',
    assetClass: 'brand-kit',
    registry: 'asset',
    name: '抖音 ACG 新春会 Brand Kit',
    version: '1.0.0',
    summary: '从真实交付中沉淀抖音 ACG 主身份、游戏/二次元双会场锁定关系、标题字与节日视觉边界。',
    owner: '抖音 ACG 视觉设计',
    status: '已发布',
    updatedAt: '2026-08-06',
    tags: ['抖音 ACG', '新春会', '游戏会场', '二次元会场'],
    coverage: ['抖音', 'Lynx', '站内 H5', '站内资源位', '图片生成'],
    metrics: [
      { label: '身份锁定', value: '3 组' },
      { label: '标题字', value: '4 套' },
      { label: '会场主题', value: '2 类' },
    ],
    parameterGroups: [
      {
        name: '品牌身份',
        summary: '主身份与会场身份按固定角色使用，不从项目正文重新生成。',
        parameters: [
          { label: '主品牌', value: '抖音 ACG', mode: '固定规则' },
          { label: '活动标题', value: '抖音 ACG 新春会 / 新春会独立标题字', mode: '引用资产' },
          { label: '会场锁定', value: '游戏会场 / 二次元会场', mode: '可配置' },
          { label: '平台联名', value: '抖音游戏、抖音动漫按场景启用', mode: '可配置' },
        ],
      },
      {
        name: '视觉语言',
        summary: 'ACG 热血感与春节团聚、热闹、归途等语义交叉后的视觉约束。',
        parameters: [
          { label: '主色关系', value: '暖橙红 / 奶油白为主，天空蓝仅用于场景纵深与信息区', mode: '固定规则' },
          { label: '构图语汇', value: '多 IP 群像、跨次元轨道、舞台/庙会空间', mode: '可配置' },
          { label: '标题层级', value: 'ACG 标识 < 新春会主标题 < 阶段口号', mode: '固定规则' },
          { label: '节日叠加', value: '春节 Style Profile 作为角色化输入，不改变主品牌标识', mode: '引用资产' },
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
    ],
    deliverables: [
      { name: '品牌与活动 Logo', specification: '抖音 ACG、抖音 ACG 新春会、游戏会场、二次元会场透明源文件', required: true },
      { name: '标题字资产', specification: '完整标题字与“新春会”短标题多背景变体', required: true },
      { name: '视觉 Token', specification: '色板、标题/正文字体角色、描边、阴影与信息卡层级', required: true },
      { name: 'Golden / Reject', specification: '采用方向与未采用探索稿分别标注，不允许 Reject 进入生成参考', required: true },
      { name: '资源位锁定件', specification: 'Hero、话题 Banner、节目单、战报的品牌最小组合', required: true },
    ],
    constraints: ['不得重绘或改写抖音 ACG 标识', '游戏与二次元 IP 只能进入对应授权会场', '外部战报参考图禁止被编译引用', '窄资源位必须优先保证标题字和活动识别'],
    usage: '2026 抖音 ACG 新春会使用；与“IP 联名 · 双会场 · 节点大会场”模板共同锁定',
    accent: '#EA5B34',
    sourceFiles: [
      { name: '抖音ACG主标题&分会场.fig', format: 'Figma', status: '已归档' },
      { name: 'brand-lockups.svg', format: 'SVG', status: '已归档' },
    ],
    governance: {
      ...commonBrandGovernance,
      source: '2026 抖音 ACG 新春会真实设计交付',
      evidence: '脑暴、方向聚焦、主标题与分会场、资源位延展、战报五页设计记录',
      rights: '仅限抖音 ACG 及本次已授权 IP/游戏合作范围；复用模板时必须替换具体 IP 资产',
      qualityGate: 'Logo 变形/安全区、标题识别度、IP 授权会场、窄资源位信息优先级与 Reject 泄漏检查',
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
  {
    id: 'brand.xinzai-character',
    category: 'brand',
    assetClass: 'character-kit',
    registry: 'asset',
    name: '心仔 IP 角色资产包',
    version: '1.11',
    summary: '不是一张吉祥物图片，而是包含标准形象、动作、表情、道具与不可变结构的角色系统。',
    owner: '生活服务 IP 设计',
    status: '已发布',
    updatedAt: '2026-08-04',
    tags: ['心仔', '角色资产', '3D IP'],
    coverage: ['Banner', 'KV', '活动页', '直播贴片', '图片生成'],
    metrics: [
      { label: '资产总量', value: '160 项' },
      { label: '官方动作', value: '30 个' },
      { label: '表情参考', value: '15 款' },
    ],
    parameterGroups: [
      {
        name: '角色表现',
        summary: 'Agent 按主题动词选动作，运营可以显式覆盖。',
        parameters: [
          { label: '形象维度', value: '立体 / 平面', mode: '可配置' },
          { label: '身体朝向', value: '正面 / 侧面站姿 / 侧面行走', mode: '可配置' },
          { label: '动作分类', value: '常规 / 吃喝 / 玩乐 / 日常 / 运动 / 出行 / 购物 / 节日', mode: 'Agent 推断' },
          { label: '表情', value: '开心 / 馋 / 得意 / 吃惊 / 比心等 15 款', mode: '可配置' },
          { label: '主题道具', value: '0–2 件，按主题动词选择', mode: 'Agent 推断' },
          { label: '主题服饰', value: '标准着装 / 主题二创服饰', mode: '可配置' },
        ],
      },
      {
        name: '不可变结构',
        summary: '这些不是审美偏好，任何生成结果都必须满足。',
        parameters: [
          { label: '头身腿比例', value: '1 : 0.35 : 0.30', mode: '固定规则' },
          { label: '雷达眼', value: '默认双眼睁开；眨眼时至少保留一只完整眼件', mode: '固定规则' },
          { label: '核心部件', value: '爱心头、云朵腮红、四指手、百宝挎包', mode: '固定规则' },
          { label: '镜像使用', value: '禁止', mode: '固定规则' },
        ],
      },
    ],
    deliverables: [
      { name: '标准形象', specification: '立体 / 平面 × 正面 / 侧面，共 6 张透明原件', required: true },
      { name: '动作库', specification: '8 类 30 个透明动作件', required: true },
      { name: '情绪表', specification: '15 款表情参考', required: true },
      { name: '道具库', specification: '30 件主题道具，带死字素材单独标记', required: false },
    ],
    constraints: ['普通主题只引用单心仔透明件', '带死字道具不得进入图生图参考', '服饰可变但角色基础结构不可变'],
    usage: '心仔 Banner Skill v1.11 的角色保真来源',
    accent: '#FF2424',
    thumbnail: '/assets/xiahua/kv/xinzai-meishi.png',
    governance: {
      ...commonBrandGovernance,
      source: '生服-心仔 IP 物料生成 Skill v1.11',
      evidence: '6 张标准形象、30 个官方动作、15 款表情及资产 URL 映射',
      qualityGate: '角色结构、色值、镜像、额外角色泄漏与动作趋同检查',
    },
  },
  {
    id: 'template.xinzai-scene-banner',
    category: 'brand',
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
    category: 'brand',
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
    category: 'brand',
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
    category: 'brand',
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
    category: 'style',
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
    thumbnail: '/assets/xiahua/head-kv.png',
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
    category: 'style',
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
    category: 'style',
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
    category: 'style',
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
    thumbnail: '/assets/xiahua/head-kv.png',
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
    category: 'style',
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
    category: 'style',
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
    category: 'style',
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
