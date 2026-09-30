export type IpKitEvidenceStatus = '已核验' | '应用规则' | '待归档'

export interface IpKitIdentityFact {
  label: string
  value: string
  detail: string
}

export interface IpKitAnatomyRule {
  name: string
  role: string
  fixed: string
  configurable: string
  status: IpKitEvidenceStatus
}

export interface IpKitColorToken {
  name: string
  value: string
  pantone?: string
  role: string
}

export interface IpKitActionCategory {
  name: string
  count: number
  examples: readonly string[]
}

export interface IpKitProfile {
  definition: string
  boundary: string
  presentation: {
    accent: string
    accentDeep: string
    accentSoft: string
    sky: string
    cardImage: string
    heroImage: string
    cardTitle: string
    cardSubtitle: string
    heroTags: readonly string[]
  }
  source: {
    specificationName: string
    specificationRevision: string
    specificationUrl: string
    libraryName: string
    libraryRevision: string
    libraryUrl: string
    evidence: string
    excluded: string
  }
  identityFacts: readonly IpKitIdentityFact[]
  abilities: readonly { name: string; detail: string }[]
  anatomy: readonly IpKitAnatomyRule[]
  proportions: readonly { label: string; value: string; detail: string }[]
  colors: readonly IpKitColorToken[]
  expressions: {
    count: number
    names: readonly string[]
    rule: string
  }
  actionCategories: readonly IpKitActionCategory[]
  usageRules: readonly string[]
  dontList: readonly string[]
  pending: readonly string[]
  markdownPath: string
}

export const XINZAI_IP_KIT_PROFILE: IpKitProfile = {
  definition: '抖音生活服务官方角色“心仔”的可版本化形象资产与使用规则：以爱心本体、烟火雷达眼、云朵腮红和百宝挎包建立稳定识别，并通过表情、动作、服装和场景变体服务吃喝玩乐传播。',
  boundary: 'IP Kit 只管理角色身份、结构比例、标准色、表情动作、源文件和授权要求；活动标题、页面主题色、营销构图与合作方视觉属于项目 Brand / Style / 页面素材，不能反向改写心仔本体。',
  presentation: {
    accent: '#FF2424',
    accentDeep: '#B91F1F',
    accentSoft: '#FFF2EF',
    sky: '#A6D3FF',
    cardImage: '/assets/ip-kits/xinzai-2026/08-action-greeting.jpg',
    heroImage: '/assets/ip-kits/xinzai-2026/03-3d-front.png',
    cardTitle: '抖音生活服务 · 心仔',
    cardSubtitle: '标准形象 · 15 种情绪 · 30 个动作 · 2D / 3D / STL',
    heroTags: ['吃喝玩乐好搭子', '爱心本体', '烟火雷达眼', '百宝挎包'],
  },
  source: {
    specificationName: '抖音生活服务｜心仔',
    specificationRevision: 'revision 1005',
    specificationUrl: 'https://bytedance.larkoffice.com/docx/JwHXdvBNPoybwixdnFKcTGahnse',
    libraryName: '心仔｜形象设计资产库',
    libraryRevision: 'revision 1208',
    libraryUrl: 'https://bytedance.larkoffice.com/docx/G5fAdFVT0ovcN1x0lOycir3wnOf',
    evidence: '标准规范、2D/3D 正侧面、STL、15 种情绪，以及 8 个已填充场景分类中的 30 个动作预览与对应 PSD/PSB。',
    excluded: '规范文档中的营销海报、联合营销与线下场景图仅作应用示意，文档明确标注受版权约束或禁止商业使用，因此不进入可复用图片组。',
  },
  identityFacts: [
    { label: '中文名', value: '心仔', detail: '由抖音生活服务爱心符号幻化而来的城市生活伙伴。' },
    { label: '核心定位', value: '吃喝玩乐好搭子', detail: '为用户发现好店、规划生活、提供靠谱攻略与超值福利。' },
    { label: '性格', value: 'ENFJ', detail: '外向、直觉、共情、结果导向；亲和但不迷糊，活泼同时精打细算。' },
    { label: '生日', value: '5 月 20 日', detail: '“爱你”的语义与爱心本体呼应，可延展每月 20 日的用户互动。' },
  ],
  abilities: [
    { name: '烟火雷达眼', detail: '扫描城市烟火与小众目的地，发现隐藏老字号、氛围小店和宝藏民宿；眼部可以承载表情变化。' },
    { name: '百宝挎包', detail: '收纳攻略、团购券与避坑指南，是“有求必应”的帮助入口；爱心形状不可改。' },
  ],
  anatomy: [
    { name: '爱心脑袋', role: '心仔最主要的轮廓识别', fixed: '爱心外轮廓、头身主关系和左右心瓣结构不可变。', configurable: '朝向、轻微透视和动作挤压可随正式源文件切换。', status: '已核验' },
    { name: '烟火雷达眼', role: '发现好店的能力与情绪窗口', fixed: '大眼体块、白色眼眶和黑色瞳孔的基本关系保留。', configurable: '瞳孔、眼皮、眉形和附加符号可随 15 种情绪变化。', status: '已核验' },
    { name: '云朵腮红', role: '亲和、暖心的面部识别点', fixed: '两侧云朵形状、成对关系和粉色识别不可变。', configurable: '可随透视轻微缩放，但不能替换成普通圆形腮红。', status: '已核验' },
    { name: '百宝挎包', role: '生活攻略与福利的角色道具', fixed: '红色爱心包体、斜挎关系和抖音标识不可变。', configurable: '摆动角度可跟随动作；遮挡时仍需保留可识别部分。', status: '已核验' },
    { name: '圆圆小手', role: '动作与互动表达', fixed: '圆润体块与四根手指的结构不可变。', configurable: '手势、持物和前后关系按已批准动作资产变化。', status: '已核验' },
    { name: '帽子与服装', role: '场景和季节适配层', fixed: '默认草帽、浅蓝上衣、黑短裤是标准造型；替换后不得破坏头身轮廓和挎包。', configurable: '可按活动场景更换服装、帽子与道具，但必须回到标准图校验。', status: '应用规则' },
  ],
  proportions: [
    { label: '头部', value: '1.00×', detail: '爱心脑袋是比例基准和最大识别体块。' },
    { label: '身体', value: '0.35×', detail: '上身保持短小圆润，不得拉长成人形。' },
    { label: '腿部', value: '0.30×', detail: '腿脚短而有重量感，维持吃货小团子的亲和感。' },
    { label: '线下参考', value: '约 130 cm', detail: '规范图用于线下装置的人物比例参考，不适用于人偶服。' },
  ],
  colors: [
    { name: 'Heart Red', value: '#FF2424', pantone: '185 C', role: '爱心本体、四肢和主要识别色。' },
    { name: 'Companion Blue', value: '#A6D3FF', pantone: '658 C', role: '标准上衣与亲和的生活服务语境。' },
    { name: 'Identity Black', value: '#000000', role: '短裤、挎带、瞳孔与高对比结构。' },
    { name: 'Cloud Blush', value: '#FFA399', pantone: '2339 C', role: '两侧不可变的云朵腮红。' },
    { name: 'Hat Band', value: '#D15A09', pantone: '7571 C', role: '草帽饰带和暖色结构强调。' },
    { name: 'Sun Hat', value: '#FFCE61', pantone: '156 C', role: '草帽、道具与阳光感辅助色。' },
  ],
  expressions: {
    count: 15,
    names: ['开心', '比心', '无奈', '眯眼笑', '得意', '委屈', '生气', '无语', '吃惊', '眩晕', '期待', '犯困', '疑惑', '尴尬', '馋'],
    rule: '表情优先修改雷达眼、眉形和嘴部，并用星星、蒸汽、感叹号等轻量符号辅助；不得改变爱心脑袋、云朵腮红、百宝挎包或身体比例。',
  },
  actionCategories: [
    { name: '常规', count: 8, examples: ['打招呼', '亲亲', '送红包', '点赞', '庆祝', '冲锋'] },
    { name: '吃喝', count: 8, examples: ['吃面', '蛋糕', '薯片', '西瓜', '火锅', '冰淇淋'] },
    { name: '玩乐', count: 3, examples: ['唱 K', '滑板车', '泡澡'] },
    { name: '日常', count: 3, examples: ['沙发玩手机', '捧花亲亲（左右向）'] },
    { name: '运动', count: 2, examples: ['踢球', '滑板'] },
    { name: '出行', count: 2, examples: ['开飞机', '夏日度假'] },
    { name: '购物', count: 2, examples: ['逛超市', '买花'] },
    { name: '节日', count: 2, examples: ['新春快乐', '恭喜发财'] },
  ],
  usageRules: [
    '传播项目使用心仔前，按规范联系黄文强确认使用范围；资产库可下载不等于自动获得所有传播授权。',
    '气膜、泡雕、玻璃钢等线下装置必须从“心仔模型.stl”标准版延展，底座保留抖音生活服务 Logo。',
    '联合海报、单人海报以及周边包装或角色本体，需要呈现“抖音生活服务  心仔”的正式 title。',
    '生成新表情或动作时，以标准形象作首图；服装、帽子、动作和环境分步变更，并重点复核挎包与帽子走形。',
  ],
  dontList: [
    '禁止把规范文档中的版权应用示意图当作可复用营销成片或图片资产对外传播。',
    '禁止重画爱心脑袋、云朵腮红和百宝挎包，或把四根手指改成拟真人手。',
    '禁止因为节日、联名或活动风格替换 Heart Red、拉长头身比例或移除业务归属。',
    '禁止直接发布生成工作流的首版结果；帽子、挎包、手指、Logo 和身体比例必须逐项校准。',
  ],
  pending: [
    '归档“抖音生活服务  心仔”title 的正式矢量文件、安全区、最小尺寸与黑白版本。',
    '补齐侧面行走、侧面站姿的 2D / 3D 文件版本号、创建时间和审批记录。',
    '为 30 个 PSD/PSB 动作建立独立资产 ID、预览图、朝向、服装、道具和授权元数据。',
    '大促与 3D 模型分类当前为空，需要明确是暂未建设还是文档尚未同步。',
  ],
  markdownPath: '/assets/ip-kits/xinzai-2026/ip-kit.md',
}
