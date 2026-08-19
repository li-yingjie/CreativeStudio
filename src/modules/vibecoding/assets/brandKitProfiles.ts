import {
  ACG_EXPERIENCE_BRAND_KIT,
  type AcgExperienceBrandKit,
} from './acgExperienceBrandKit.ts'

export type BrandKitEvidenceStatus = '已核验' | '工作规则' | '待归档'

export interface BrandKitIdentityLevel {
  order: string
  name: string
  role: string
  rule: string
  status: BrandKitEvidenceStatus
}

export interface BrandKitColorToken {
  name: string
  value: string
  role: string
  group: '核心身份色' | '活动应用色'
  status: BrandKitEvidenceStatus
}

export interface BrandKitTypographyRole {
  role: string
  treatment: string
  usage: string
  source: string
  status: BrandKitEvidenceStatus
}

export interface BrandKitComponentRule {
  name: string
  purpose: string
  anatomy: readonly string[]
  fixed: string
  configurable: string
  evidence: string
  status: BrandKitEvidenceStatus
}

export interface BrandKitPresentation {
  accent: string
  accentOnDark: string
  accentDeep: string
  accentSoft: string
  cardImage: string
  cardTitle: string
  cardSubtitle: string
  heroReferenceIndex: number
  heroTags: readonly string[]
  applicationColorTitle: string
  applicationColorDescription: string
  typographySample: string
}

export interface BrandKitProfile {
  definition: string
  boundary: string
  experienceSystem?: AcgExperienceBrandKit
  presentation: BrandKitPresentation
  source: {
    fileName: string
    fileKey: string
    rootNode: string
    url: string
    pageCount: string
    evidenceCount: string
    excluded: string
  }
  identityLevels: readonly BrandKitIdentityLevel[]
  colors: readonly BrandKitColorToken[]
  typography: readonly BrandKitTypographyRole[]
  components: readonly BrandKitComponentRule[]
  doList: readonly string[]
  dontList: readonly string[]
  pending: readonly string[]
  markdownPath: string
}

export const ACG_NEW_YEAR_BRAND_KIT_PROFILE: BrandKitProfile = {
  definition: '统一管理品牌身份、活动标题、颜色和字体角色，并提供移动活动长页的舞台构图、玩法皮肤、素材分工与复杂度验收规则。',
  boundary: 'Brand Kit 管理可复用的身份与体验语法，但不收纳具体游戏/动漫角色、作品封面或 Figma 成片；交互状态仍由真实页面组件实现。',
  experienceSystem: ACG_EXPERIENCE_BRAND_KIT,
  presentation: {
    accent: '#FE2C55',
    accentOnDark: '#FFD980',
    accentDeep: '#601619',
    accentSoft: '#FFF2DE',
    cardImage: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png',
    cardTitle: '抖音 ACG · 新春会应用版',
    cardSubtitle: '联名锁定 · 活动签名 · 舞台语法 · 玩法皮肤',
    heroReferenceIndex: 1,
    heroTags: ['联名锁定', '完整活动签名', '横版适配'],
    applicationColorTitle: '新春会体验应用色',
    applicationColorDescription: '来自单页 Golden Reference 的正式工作采样，不等于永久品牌主色',
    typographySample: '2026 New Year',
  },
  source: {
    fileName: 'ACG 新春会 · 单页 Golden Reference',
    fileKey: 'PxXGus8deG2BZ3xQLUFl0u',
    rootNode: '1:369',
    url: 'https://www.figma.com/design/PxXGus8deG2BZ3xQLUFl0u/Untitled?node-id=0-1',
    pageCount: '1 页，1 张 750 × 9776 正式长页',
    evidenceCount: 'Hero、内容橱窗、对抗投票、双榜、愿望墙、抽奖与任务共 7 类舞台证据',
    excluded: '角色/IP、作者头像、作品封面与 Figma 成片仅作为视觉证据，不进入独立生成素材',
  },
  identityLevels: [
    {
      order: '01',
      name: '平台联名锁定',
      role: '说明活动由谁联合发起或承接',
      rule: '正式资源位中使用“抖音游戏 × 抖音精选”横向锁定；不得改变前后次序、替换分隔关系或与活动标题拼成新 Logo。',
      status: '已核验',
    },
    {
      order: '02',
      name: '活动身份签名',
      role: '建立“抖音 ACG 新春会”的唯一活动识别',
      rule: '“抖音 ACG”作为标题组成，“新春会”承担最大视觉权重，日期作为同组次级签名；完整锁定与短标题不得混用。',
      status: '已核验',
    },
    {
      order: '03',
      name: '会场与渠道署名',
      role: '区分游戏、二次元会场及具体站内入口',
      rule: '会场名、搜索条、渠道 Logo 是可配置署名，不得取代活动主标题；游戏 IP 与二次元内容按授权会场挂载。',
      status: '已核验',
    },
  ],
  colors: [
    { name: 'Identity Ink', value: '#161823', role: '平台 Logo、正文与高对比信息；不随活动主题重新着色', group: '核心身份色', status: '已核验' },
    { name: 'Reverse White', value: '#FFFFFF', role: '深色或高密画面上的反白身份、信息面与安全留白', group: '核心身份色', status: '已核验' },
    { name: 'Douyin Red', value: '#FE2C55', role: '主行动、玩法强调、标题投影与状态高亮', group: '活动应用色', status: '已核验' },
    { name: 'Carnival Coral', value: '#FF5A4D', role: '艺术字立体面、贴纸描边、红方投票与转场弧线', group: '活动应用色', status: '工作规则' },
    { name: 'Clear Sky', value: '#39A9FF', role: 'Hero 天空、蓝方投票和冷色玩法反馈', group: '活动应用色', status: '工作规则' },
    { name: 'Festival Cream', value: '#FFF2DE', role: '长页主画布与不同舞台之间的统一暖色基底', group: '活动应用色', status: '已核验' },
    { name: 'Surface Ivory', value: '#FFF9F0', role: '榜单、任务与高密内容卡的可读信息面', group: '活动应用色', status: '工作规则' },
    { name: 'Info Wine', value: '#601619', role: '暖色信息卡正文、数字与标题，替代生硬纯黑', group: '活动应用色', status: '已核验' },
  ],
  typography: [
    {
      role: '活动主标题字',
      treatment: '定制倾斜粗标题；米白填充、橙红多层描边、暖色投影，保持完整字形轮廓',
      usage: '主 KV、开屏、资源位与长图封面中的第一识别层',
      source: '正式位图证据已核验；可编辑矢量标题字尚未归档',
      status: '待归档',
    },
    {
      role: '日期签名',
      treatment: '高倾斜手写感拉丁数字，与主标题共用基线动势但保持次级对比',
      usage: '完整活动签名；窄资源位空间不足时可按来源版本隐藏',
      source: '正式交付中的组合关系已核验，具体字体/矢量源待归档',
      status: '待归档',
    },
    {
      role: '章节展示字',
      treatment: '粗体中文展示字配节庆图形或高亮底板，避免与主标题竞争',
      usage: '会场模块标题、节目单章节、战报段落标题',
      source: '角色与层级来自 H5、节目单和战报；具体字体清单待 Figma 补齐',
      status: '工作规则',
    },
    {
      role: 'UI 标题 / 按钮',
      treatment: '高字重中文无衬线，短句、单行优先；按钮用强对比实底或描边双动作组',
      usage: '榜单、任务、规则入口、主次操作按钮与状态标签',
      source: '页面视觉与交互层级已核验；字体文件与端侧映射待归档',
      status: '工作规则',
    },
    {
      role: '正文 / 数据',
      treatment: '中文无衬线常规字重；数据采用清晰数字字形并与单位分级',
      usage: '规则、榜单说明、时间、热度与结算数据',
      source: '排版角色已核验；正式 font-family、字重和授权清单待归档',
      status: '待归档',
    },
  ],
  components: [
    {
      name: '平台联名锁定',
      purpose: '在活动标题之外明确平台发起关系',
      anatomy: ['平台 Logo A', '乘号分隔', '平台 Logo B'],
      fixed: '顺序、Logo 原形、同一基线、单色高对比呈现',
      configurable: '仅可在来源已提供的黑色/反白版本中切换',
      evidence: '开屏、横版 KV、发现页 Banner',
      status: '已核验',
    },
    {
      name: '完整活动签名',
      purpose: '形成跨渠道最稳定的活动识别单元',
      anatomy: ['抖音 ACG 前缀', '新春会标题字', '活动日期'],
      fixed: '标题字形、三层相对顺序、暖色描边与日期的从属关系',
      configurable: '横/竖排版本、整体尺度与安全区位置',
      evidence: '话题头图、资源位、开屏、节目单',
      status: '已核验',
    },
    {
      name: 'Hero 身份区',
      purpose: '在页面首屏同时完成品牌确认、活动理解与会场分流',
      anatomy: ['联名锁定', '活动签名', '主视觉群像', '会场/搜索入口'],
      fixed: 'Logo 与标题不可压脸、不可被轨道或高光截断',
      configurable: '入口文案、会场标签、渠道动作与背景语境',
      evidence: '游戏会场 H5、二次元会场 H5、横版主 KV',
      status: '工作规则',
    },
    {
      name: '窄资源位签名',
      purpose: '在高度受限的 Banner 中保住最小活动识别',
      anatomy: ['短联名', '活动标题', '日期或单一利益点', '一个角色簇'],
      fixed: '标题优先于角色数量；平台 Logo 不得被裁切或贴边',
      configurable: '角色簇、利益点、横向留白与标题缩放级别',
      evidence: '780×220 资源位、1029×195 话题 Banner',
      status: '工作规则',
    },
    {
      name: '长页章节标题',
      purpose: '让节目单、战报与会场长页维持同一识别节奏',
      anatomy: ['章节名', '节庆装饰', '暖白信息面', '橙红强调'],
      fixed: '标题层级高于列表内容；数据区不复刻活动主标题造型',
      configurable: '章节名、内容密度、装饰件数量与数据模块',
      evidence: '节目单长图、结算战报、二次元会场',
      status: '工作规则',
    },
    {
      name: '玩法舞台皮肤',
      purpose: '让对抗、榜单、心愿和抽奖凭视觉解剖直接可识别',
      anatomy: ['贴纸式标题', '玩法专属底板', '核心动作组件', '反馈/状态区'],
      fixed: '同一玩法内保持色彩与解剖一致；按钮、票数和状态必须是可编辑组件',
      configurable: '业务文案、作品图、奖励图、榜单数量与玩法数据',
      evidence: '抓马大战、抓马榜/赛场、春晚许愿、抽新春福利',
      status: '已核验',
    },
    {
      name: '舞台转场',
      purpose: '将近万像素长页组织成连续节目旅程',
      anatomy: ['弧形顶边', '暖白底板', '局部满版插画', '票券/云台缺口'],
      fixed: '每 1–2 屏必须出现新的空间层次，禁止全页同一种卡片堆叠',
      configurable: '转场高度、装饰密度与当前业务主题',
      evidence: '750 × 9776 单页 Golden Reference',
      status: '已核验',
    },
  ],
  doList: [
    '先选择已核验的锁定版本，再按 Surface 选择完整签名或窄资源位签名。',
    '在照片或高密群像上使用黑/白高对比平台 Logo，并保留独立安全区。',
    '颜色 Token 必须记录“核心身份色”或“活动应用色”，生成时不可互相替代。',
    '所有外发成品记录所用 Brand Kit 版本、画幅尺寸和导出规格。',
    '生成前先编译七类素材槽位，并在 375px 宽度验证图像焦点和交互可读性。',
  ],
  dontList: [
    '禁止拉伸、描边、重绘、镜像或用生成模型仿画平台 Logo 与活动标题字。',
    '禁止把天空、轨道、烟花或 IP 群像误登记为 Brand Kit 内容。',
    '禁止在没有授权证据时跨游戏/二次元会场混用角色。',
    '禁止把“脑暴”“方向聚焦”或外部参考当作 Golden Reference。',
    '禁止全页复用同一白卡、圆角、阴影和标题样式伪装成高保真。',
  ],
  pending: [
    '活动标题字的 SVG/可编辑矢量源、反白与短标题变体。',
    'Figma 字体清单：font-family、字重、端侧替代与字体授权。',
    '各 Logo 锁定件的精确安全区、最小显示尺寸和暗/亮底对比度阈值。',
    '独立透明 Logo 文件与联名组件的组件属性、导出倍率和命名规范。',
  ],
  markdownPath: '/assets/brand-kits/douyin-acg-new-year-2026/brand-kit.md',
}

export const DOUYIN_SPRING_FESTIVAL_BRAND_KIT_PROFILE: BrandKitProfile = {
  definition: '抖音春节不是一枚新的母 Logo，而是一套跨节目节点的品牌应用规则：春晚与元宵分别保留节目主身份，再由抖音传播署名、合作方锁定和渠道组件把它们组织成同一春节传播体系。',
  boundary: '本包管理节目标题、平台与合作方署名、直播频道标识和跨画幅身份关系。红金纹样、山水烟花、马年角色与具体节目内容属于 Style / IP / 项目素材；春晚规则不能自动套到元宵节点。',
  presentation: {
    accent: '#C91D25',
    accentOnDark: '#F1D18A',
    accentDeep: '#821318',
    accentSoft: '#FFF5F2',
    cardImage: '/assets/figma-deliverables/spring-gala/admin-screen-landscape.png',
    cardTitle: '抖音春节 · 春晚 / 元宵',
    cardSubtitle: '节目主身份 · 合作方锁定 · 直播频道 · 传播适配',
    heroReferenceIndex: 1,
    heroTags: ['春晚正式节点', '元宵独立分支', '跨渠道署名'],
    applicationColorTitle: '春节节目应用色',
    applicationColorDescription: '春晚正式成稿工作采样；元宵节点需按自己的正式导出补齐，不默认继承',
    typographySample: '上抖音 看春晚',
  },
  source: {
    fileName: '2026春晚&元宵',
    fileKey: 'DLhjcvo02Wbwk2PrUAJTkR',
    rootNode: '572:114797',
    url: 'https://www.figma.com/design/DLhjcvo02Wbwk2PrUAJTkR/2026%E6%98%A5%E6%99%9A-%E5%85%83%E5%AE%B5?node-id=572-114797&m=dev',
    pageCount: '春晚 4 个正式页；元宵 1 个正式资源位页',
    evidenceCount: '17 个春晚正式节点；元宵资源位总画板 750:117489 已核验',
    excluded: '“过程”页不进入生成参考；“交互”只证明交互结构，不作为视觉 Golden Reference。',
  },
  identityLevels: [
    {
      order: 'PROGRAM',
      name: '节目节点主身份',
      role: '明确当前传播属于春晚还是元宵',
      rule: '春晚使用“2026 中央广播电视总台春节联欢晚会”正式标题锁定；元宵使用自己的“2026 总台元宵晚会”节点标题，不得只换文案沿用春晚标题件。',
      status: '已核验',
    },
    {
      order: 'PARTNER',
      name: '官方合作方锁定',
      role: '表达总台节目与技术/产品合作关系',
      rule: '春晚正式交付按“总台春晚标题—火山引擎—豆包”的顺序和分隔关系使用；合作链只属于已核验节目节点，不能泛化成抖音春节永久联名。',
      status: '已核验',
    },
    {
      order: 'CHANNEL',
      name: '抖音传播署名',
      role: '在站内页面、直播和行政传播中建立平台入口',
      rule: '“上抖音 看春晚”、抖音 Logo、直播频道名和观看动作分层放置；平台署名不能覆盖节目主标题，也不能与合作方锁定拼成新 Logo。',
      status: '已核验',
    },
  ],
  colors: [
    { name: 'Identity Ink', value: '#161823', role: '抖音平台标识、正文与高对比信息的稳定底座', group: '核心身份色', status: '已核验' },
    { name: 'Reverse White', value: '#FFFFFF', role: '高密画面上的反白平台署名、直播信息与安全留白', group: '核心身份色', status: '已核验' },
    { name: 'Gala Red', value: '#C91D25', role: '春晚节目封面、行政屏与直播频道的主场色；来自正式成稿工作采样', group: '活动应用色', status: '工作规则' },
    { name: 'Deep Vermilion', value: '#821318', role: '红底的暗部、边框与信息层次，避免大红平铺失去深度', group: '活动应用色', status: '工作规则' },
    { name: 'Ceremonial Gold', value: '#F1D18A', role: '节目标题、分隔符、合作方锁定与关键口号的高等级强调', group: '活动应用色', status: '工作规则' },
    { name: 'Warm Paper', value: '#FCE7CE', role: '站内页面信息面、规则与弱层级背景；不替代纯白身份反色', group: '活动应用色', status: '工作规则' },
  ],
  typography: [
    {
      role: '节目主标题字',
      treatment: '春晚使用总台正式标题锁定与金色立体/线性版本；元宵使用独立节目标题件，不以通用粗体代写',
      usage: '节目封面、直播主机位、资源位、行政屏与页面 Hero',
      source: '春晚标题锁定已由正式成稿核验；元宵标题画面已核验，透明矢量源待归档',
      status: '待归档',
    },
    {
      role: '平台传播口号',
      treatment: '高字重中文展示字，春晚成稿采用金色立体字；与节目标题保持明确上下级关系',
      usage: '“上抖音 看春晚”等渠道主张、行政屏和外部传播主信息',
      source: '行政横屏/竖屏正式成稿已核验，字形和图层源待归档',
      status: '待归档',
    },
    {
      role: '合作方字标',
      treatment: '使用火山引擎、豆包的正式 Logo/字标，按来源锁定保持尺寸关系和分隔符',
      usage: '合作方联合署名、资源位 Banner 与节目封面',
      source: '活动 Banner、节目封面与行政屏的组合关系已核验',
      status: '已核验',
    },
    {
      role: '直播频道标题',
      treatment: '清晰无衬线标题配频道状态，不复刻节目主标题的立体金字效果',
      usage: '主机位、竖屏看春晚、年年有你、字幕与手语频道',
      source: '直播间物料 6 个正式节点已核验；字体族和端侧映射待归档',
      status: '工作规则',
    },
    {
      role: 'UI 正文 / 数据',
      treatment: '中文无衬线常规字重；日期、直播时间、按钮和说明按信息层级分配字重',
      usage: 'Lynx/H5 页面、节目归档、互动模块、规则与行政传播说明',
      source: '正式页面和跨画幅成稿已核验；font-family、字重与授权清单待归档',
      status: '待归档',
    },
  ],
  components: [
    {
      name: '春晚节目签名',
      purpose: '建立春晚节点不可替代的节目身份',
      anatomy: ['2026 年份', '总台节目归属', '春节联欢晚会标题', '节目图形标'],
      fixed: '字形、图形标、年份与节目归属的相对关系；禁止拆字、重绘或替换节目名称',
      configurable: '只可使用来源提供的横/竖、金色/反白和尺寸变体',
      evidence: '主机位、节目封面、活动 Banner、行政屏',
      status: '已核验',
    },
    {
      name: '元宵节目签名',
      purpose: '让元宵资源位拥有独立节目识别，而不是春晚皮肤换文案',
      anatomy: ['2026 年份', '总台元宵晚会标题', '节目节点日期', '元宵资源位视觉'],
      fixed: '节目名和日期必须来自元宵正式节点，不得引用春晚标题锁定或合作口径',
      configurable: '按资源位提供的横版、竖版、方图和直播封面变体使用',
      evidence: '元宵资源位延展总画板 750:117489；横版节点 750:117493',
      status: '待归档',
    },
    {
      name: '官方合作方锁定',
      purpose: '准确表达节目、技术服务与产品合作关系',
      anatomy: ['节目主标题', '菱形分隔', '火山引擎', '菱形分隔', '豆包'],
      fixed: '顺序、Logo 原形、分隔关系、视觉基线和双方字标比例',
      configurable: '仅可在已核验的横向、居中和窄版来源变体中切换',
      evidence: '活动 Banner、活动头图、节目封面、行政横屏',
      status: '已核验',
    },
    {
      name: '抖音传播署名',
      purpose: '把节目观看动作与抖音平台入口绑定',
      anatomy: ['抖音 Logo', '传播口号', '观看时间/直播信息', '主行动入口'],
      fixed: '平台 Logo 原形、口号与节目标题的上下级关系、关键时间口径',
      configurable: '口号版本、横竖排、按钮动作和 Surface 位置',
      evidence: '主会场、行政屏与元宵资源位延展',
      status: '工作规则',
    },
    {
      name: '直播频道封面头',
      purpose: '在多路直播中稳定节目身份并区分频道内容',
      anatomy: ['节目签名', '频道名称', '直播状态', '背景框架'],
      fixed: '节目签名安全区、频道名可读性、直播状态位置和画面方向',
      configurable: '主机位/竖屏/回顾/字幕/手语频道名与对应画面',
      evidence: '直播间物料 6 个正式节点',
      status: '已核验',
    },
    {
      name: '跨画幅传播框架',
      purpose: '让节目封面、Banner 和行政屏共享身份秩序而非机械裁切',
      anatomy: ['节目/合作方锁定', '主传播口号', '节目时间', '平台署名', '安全区背景'],
      fixed: '身份件完整、标题与 Logo 不贴边、合作方顺序不因画幅改变',
      configurable: '横/竖/方画幅、主口号、渠道说明和背景纹样密度',
      evidence: '节目封面 3 版、活动资源位 2 版、行政屏 2 版',
      status: '工作规则',
    },
  ],
  doList: [
    '先选择春晚或元宵节目节点，再选对应标题锁定、合作口径和应用色；不得跨节点拼装。',
    '春晚合作方锁定按正式成稿保持“节目标题—火山引擎—豆包”的次序、分隔和安全区。',
    '直播频道先继承节目签名，再配置频道名、状态和画面；字幕与手语信息必须保留可读性。',
    '所有外发成品记录节目节点、Brand Kit 版本、画幅尺寸和导出规格。',
  ],
  dontList: [
    '禁止把“红金春节风格”当成 Brand Kit 全部内容，或用同一红金模板覆盖元宵正式视觉。',
    '禁止拉伸、重绘、AI 仿画总台节目标题、抖音、火山引擎和豆包 Logo。',
    '禁止把马年角色、山水烟花、主持人/艺人或节目画面登记为品牌基础资产。',
    '禁止把“过程”页、试稿或没有节目节点的外部参考加入 Golden Reference。',
  ],
  pending: [
    '元宵资源位正式导出图片组：当前已核验总画板与关键节点，尚未归档独立文件。',
    '春晚与元宵节目标题锁定、合作方锁定和抖音 Logo 的 SVG/透明 PNG 原件。',
    'Figma 字体清单：font-family、字重、端侧替代与使用授权。',
    '各标题与合作方锁定的精确安全区、最小显示尺寸、暗/亮底对比阈值。',
  ],
  markdownPath: '/assets/brand-kits/douyin-spring-festival-2026/brand-kit.md',
}

export const ZHUAMA_UGC_BRAND_KIT_PROFILE: BrandKitProfile = {
  definition: '一套服务于生活服务 UGC 活动的跨节期身份与角色使用规则：以抖音生活服务为业务署名，以红色小马及“马”字语义建立连续识别，再允许春节、五一、暑期分别替换活动标题、场景与玩法。现有证据没有证明存在一枚可独立使用的“抓马”字标，因此“抓马”在本包中是资产组织名，不被伪装成 Logo。',
  boundary: '本包只定义业务署名、抓马识别结构、语义语气和活动层级。小马的模型、动作、服装与表情应拆入 IP 资产；“这夏夯爆了”的玩水蓝、夜食棕、荧光绿标题和具体卡面属于暑期项目应用；任务、抽卡、交换与兑奖属于玩法和页面组件。',
  presentation: {
    accent: '#FF4A32',
    accentOnDark: '#B7FF38',
    accentDeep: '#5B2F20',
    accentSoft: '#FFF4EC',
    cardImage: '/assets/figma-deliverables/xiahua/select-horse.png',
    cardTitle: '生活服务 UGC · 抓马 H1',
    cardSubtitle: '红色小马 · 马字语义 · 跨节期身份 · 应用分层',
    heroReferenceIndex: 3,
    heroTags: ['跨春节 / 五一 / 暑期', '小马识别结构', '这夏夯爆了应用证据'],
    applicationColorTitle: '暑期活动应用色',
    applicationColorDescription: '来自“这夏夯爆了”正式节点，只证明暑期落地方式，不是抓马永久主色',
    typographySample: '这夏夯爆了',
  },
  source: {
    fileName: 'UGC活动-2026H1',
    fileKey: 'kMedatdeXqtzmq0KOeG0qk',
    rootNode: '文件根（未指定 node）',
    url: 'https://www.figma.com/design/kMedatdeXqtzmq0KOeG0qk/UGC%E6%B4%BB%E5%8A%A8-2026H1?m=dev',
    pageCount: 'cover + 8 个交互 / UI 页；另含结构分隔页',
    evidenceCount: '14 个暑期正式节点；春节、五一页面结构已核验',
    excluded: 'Page divider、交互推演白板和未导出的探索稿不进入视觉 Golden Reference；暑期项目标题、场景和卡面不升级为品牌基础件。',
  },
  identityLevels: [
    {
      order: 'OWNER',
      name: '抖音生活服务业务署名',
      role: '明确活动所属业务与站内承接主体',
      rule: '使用正式“抖音生活服务”标识与口号锁定；深色场景使用反白版本，浅色场景使用高对比版本。不得由生成模型重绘、拆字或与活动标题拼成新 Logo。',
      status: '已核验',
    },
    {
      order: 'IP',
      name: '抓马角色识别',
      role: '用红色小马、固定识别结构与“马”字语义串联 H1 活动',
      rule: '保留红色主体、深棕鬃尾、米色口鼻/手脚和半睁眼神态等识别锚点；具体姿势、服装和道具从关联 IP 资产选择，不在 Brand Kit 内重新生成一套角色。',
      status: '工作规则',
    },
    {
      order: 'CAMPAIGN',
      name: '阶段活动身份',
      role: '让春节、五一、暑期拥有独立标题、利益点与视觉语境',
      rule: '每次先选活动节点，再绑定标题字、档期、主题场景和玩法；“这夏夯爆了”仅是暑期应用，不得反向改名为抓马母品牌或覆盖春节、五一分支。',
      status: '已核验',
    },
  ],
  colors: [
    { name: 'Identity Ink', value: '#161823', role: '抖音生活服务标识、正文和高对比信息的稳定底座', group: '核心身份色', status: '已核验' },
    { name: 'Reverse White', value: '#FFFFFF', role: '深色场景的业务署名、信息面和安全留白', group: '核心身份色', status: '已核验' },
    { name: 'Horse Red', value: '#FF4A32', role: '小马主体、主行动与关键状态的连续识别色；最终标准值待角色源文件确认', group: '核心身份色', status: '工作规则' },
    { name: 'Mane Brown', value: '#3A1814', role: '小马鬃尾与高对比暗部；不可替代业务标识用黑', group: '核心身份色', status: '工作规则' },
    { name: 'Water Sky', value: '#55CDF3', role: '暑期玩水线的空间底色与清凉语境', group: '活动应用色', status: '工作规则' },
    { name: 'Night Brown', value: '#5B2F20', role: '暑期夜食线的木质夜景、容器和正文主色', group: '活动应用色', status: '工作规则' },
    { name: 'Acid Green', value: '#9AFF22', role: '暑期标题高亮、选择箭头和机会提示；只作小面积强调', group: '活动应用色', status: '工作规则' },
    { name: 'Warm Cream', value: '#FFF4DE', role: '夜食信息面、任务卡和角色肤色的暖色承接面', group: '活动应用色', status: '工作规则' },
    { name: 'Action Red', value: '#FF3F2D', role: '抽取、领取、去完成等主动作；禁用态必须降对比而非换成新品牌色', group: '活动应用色', status: '工作规则' },
  ],
  typography: [
    {
      role: '阶段活动标题字',
      treatment: '每个节点使用独立定制标题；暑期“这夏夯爆了”采用白色手写主字、荧光绿重点字和喷绘飞白，标题与档期组成锁定',
      usage: '活动 Hero、角色选择页、资源位与分享卡的第一识别层',
      source: '暑期正式位图节点已核验；春节、五一标题源与可编辑矢量仍待归档',
      status: '待归档',
    },
    {
      role: '马字语义标题',
      treatment: '以短促、口语化、带“马”字双关的命名形成角色语气；不要求所有词都做艺术字',
      usage: '角色名、活动入口、轻量标签与阶段玩法命名，如“马杀鸡”“吃什马”“fun马过来”“好运加马”',
      source: '春节 UI 图层命名已核验；正式语气词库与禁用词待内容侧归档',
      status: '工作规则',
    },
    {
      role: 'Hero 利益点 / 副标题',
      treatment: '高字重短句或手写副标题，与活动标题保持至少一级对比；档期不与利益点争夺主层级',
      usage: '“选定我的马 得抽卡机会”、活动玩法摘要、阶段口号',
      source: '暑期选择页和主会场已核验；字体家族待 Figma 字体清单确认',
      status: '工作规则',
    },
    {
      role: 'UI 标题 / 主按钮',
      treatment: '高字重中文无衬线，单行动作优先；主按钮使用红色实底、白字和大圆角，次动作使用白底或描边',
      usage: '抽取、选择、领取、去完成、页签和状态反馈',
      source: '暑期 H5、原生页和浮层的层级已核验；端侧字体映射待归档',
      status: '工作规则',
    },
    {
      role: '正文 / 数据',
      treatment: '中文无衬线常规字重；次数、进度、日期与奖励数值分级，长规则不使用活动标题字',
      usage: '任务说明、卡片状态、规则、交换记录、地点与内容列表',
      source: '正式页面已核验；font-family、字重和字体授权待归档',
      status: '待归档',
    },
  ],
  components: [
    {
      name: '生活服务业务署名',
      purpose: '在多种活动皮肤下保持明确的业务归属',
      anatomy: ['抖音图形标', '抖音生活服务字标', '业务口号（可选）'],
      fixed: 'Logo 原形、字标内容、基线关系与高对比安全区',
      configurable: '黑色/反白版本、横向位置与是否带口号；只能使用来源已有变体',
      evidence: '暑期玩水长页、夜食长页页脚与原生活动入口',
      status: '已核验',
    },
    {
      name: '抓马识别锚点',
      purpose: '让不同节期、服装和场景中的角色仍被识别为同一小马系统',
      anatomy: ['红色主体', '深棕鬃尾', '米色口鼻/手脚', '半睁眼神态', '当前服装/道具'],
      fixed: '头身比例、鼻口体块、鬃尾结构、基础配色与眼神气质',
      configurable: '动作、服装、道具、场景光线和同场角色；必须来自关联 IP 资产版本',
      evidence: 'cover、春节 UI、暑期玩水/夜食主会场与选择马页面',
      status: '工作规则',
    },
    {
      name: '阶段活动签名',
      purpose: '在不改变母体身份的前提下建立每个活动节点的主识别',
      anatomy: ['阶段活动标题字', '档期', '一句利益点', '抓马角色', '业务署名'],
      fixed: '标题、角色与业务署名三层不可互相冒充；标题不压住角色关键识别结构',
      configurable: '春节/五一/暑期标题、横竖排、场景、档期和利益点',
      evidence: '春节 UI、五一 UI、暑期玩水与夜食正式页面',
      status: '已核验',
    },
    {
      name: '角色选择 Hero',
      purpose: '把角色人格、阶段主题与首个行动合并成可读入口',
      anatomy: ['阶段活动签名', '角色全身像', '角色名', '姿势提示', '主按钮', '跳过动作'],
      fixed: '角色全身像优先、主动作唯一、角色名与当前形象对应',
      configurable: '角色款式、左右切换、机会文案与背景场景',
      evidence: '暑期 UI · 美食，选择马节点 9683:26518',
      status: '已核验',
    },
    {
      name: '马字语义标签',
      purpose: '用稳定的口语语气增强角色记忆，而不是靠重复 Logo',
      anatomy: ['短语前后缀', '“马”字双关', '图标或角色表情（可选）'],
      fixed: '语义必须自然可读，不为押“马”破坏业务理解；敏感词和生硬谐音不得上线',
      configurable: '节点主题、玩法动作、角色名和语气强弱',
      evidence: '春节 UI 图层中的马杀鸡、吃什马、fun马过来、好运加马、杀马特、一字马、收款马、马卡龙、马上到',
      status: '工作规则',
    },
    {
      name: '阶段色适配器',
      purpose: '允许同一身份进入节庆、玩水与夜食语境，同时避免把项目色误认成永久品牌色',
      anatomy: ['核心身份色', '阶段背景色', '一个强调色', '信息面', '状态色'],
      fixed: '小马核心识别色和业务署名对比不变；主动作与信息状态保持可访问对比',
      configurable: '玩水蓝 / 夜食棕 / 节期配色、背景材质和装饰密度',
      evidence: '暑期玩水与夜食两条正式长页；春节、五一 UI 分支',
      status: '工作规则',
    },
  ],
  doList: [
    '先选择春节、五一或暑期活动节点，再绑定对应标题、场景、利益点和玩法；抓马不是一张万能皮肤。',
    '角色出镜必须引用关联 IP 资产的已批准形象，并保留红色主体、深棕鬃尾、米色口鼻/手脚与眼神气质。',
    '业务署名与阶段活动标题分层放置；外发成品保留 Figma page、node ID、源尺寸和 Kit / IP 版本。',
    '所有颜色明确标注核心身份色或阶段应用色，跨活动复用前重新选择应用色组。',
  ],
  dontList: [
    '禁止把“抓马”三个字当作已经存在的正式 Logo；现有文件未提供该字标证据。',
    '禁止把“这夏夯爆了”的标题、夜食场景、玩水场景或卡面升级为抓马永久品牌资产。',
    '禁止在 Brand Kit 中收纳或重新生成小马的所有动作、服装和 3D 模型；这些属于 IP 资产。',
    '禁止让“马”字双关压过活动理解，或把交互白板、试稿和项目生成图加入视觉 Golden Reference。',
  ],
  pending: [
    '确认“抓马”是否为官方资产名，并归档命名、权属与业务使用范围；当前仅按用户命名组织资产。',
    '将小马标准三视图、结构比例、表情、动作、服装、3D 模型和授权拆成独立 IP Kit，并回链本 Brand Kit。',
    '抖音生活服务 Logo/口号的 SVG、透明 PNG、黑白变体、安全区与最小显示尺寸。',
    '春节、五一正式视觉独立导出与节点清单；当前图片组以暑期正式节点为主。',
    '阶段标题字矢量源、正式字体清单、端侧替代、字体授权和“马”字语气词库。',
  ],
  markdownPath: '/assets/brand-kits/zhuama-ugc-2026-h1/brand-kit.md',
}
