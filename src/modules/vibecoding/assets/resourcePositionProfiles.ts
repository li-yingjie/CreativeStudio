export type ResourceSpecEvidenceStatus = '已核验' | '来源换算' | '规范规则' | '参考'

export interface ResourceCanvasSpec {
  id: string
  name: string
  family: '话题页' | '创作者活动中心'
  role: string
  logicalSize: { width: number; height: number }
  exportScale?: number
  exportSize?: { width: number; height: number }
  composition: readonly string[]
  rules: readonly string[]
  sourceNode: string
  status: ResourceSpecEvidenceStatus
}

export interface ResourceOcclusionRule {
  name: string
  width: number
  height: number
  offsetBottom?: number
  fill: string
  purpose: string
  status: ResourceSpecEvidenceStatus
}

export interface ResourceTokenRule {
  name: string
  type: '文字' | '背景' | '分割线' | '规范标注'
  value?: string
  usage: string
  status: ResourceSpecEvidenceStatus
}

export interface ResourceValidationRule {
  code: string
  level: 'error' | 'warning'
  check: string
  message: string
}

export interface ResourcePositionProfile {
  definition: string
  boundary: string
  presentation: {
    accent: string
    accentAlt: string
    ink: string
    cardTitle: string
    cardSubtitle: string
  }
  source: {
    fileName: string
    fileKey: string
    rootNode: string
    url: string
    verifiedAt: string
    pageScope: string
    excluded: string
  }
  canvases: readonly ResourceCanvasSpec[]
  occlusion: readonly ResourceOcclusionRule[]
  tokens: readonly ResourceTokenRule[]
  contentRules: readonly {
    title: string
    detail: string
    appliesTo: string
    status: ResourceSpecEvidenceStatus
  }[]
  sets: readonly {
    name: string
    items: readonly string[]
    purpose: string
  }[]
  validation: readonly ResourceValidationRule[]
  pending: readonly string[]
  markdownPath: string
  manifestPath: string
}

export const DOUYIN_LIFE_SERVICE_RESOURCE_POSITION_PROFILE: ResourcePositionProfile = {
  definition: '面向生活服务常见资源位的生产规范包：把画布、导出倍率、遮挡区、组合关系、文图距离和主题 Token 变成可读、可查、可由 Agent 强校验的设计合同。',
  boundary: '这不是一套活动视觉风格，也不提供万能 KV。它只约束资源位如何正确交付；具体品牌气质、标题字、IP、图片内容与活动配色仍由项目 Brand Kit、Style 与素材资产决定。',
  presentation: {
    accent: '#FE2C55',
    accentAlt: '#25F4EE',
    ink: '#161823',
    cardTitle: '生活服务 · 常见资源位规范',
    cardSubtitle: '画布尺寸 · 导出倍率 · 遮挡区 · 文图规则',
  },
  source: {
    fileName: '【基建】生活服务常见资源位设计规范',
    fileKey: 'Uj4movjk325cfo1BMorhLe',
    rootNode: '85:2772',
    url: 'https://www.figma.com/design/Uj4movjk325cfo1BMorhLe/%E3%80%90%E5%9F%BA%E5%BB%BA%E3%80%91%E7%94%9F%E6%B4%BB%E6%9C%8D%E5%8A%A1%E5%B8%B8%E8%A7%81%E8%B5%84%E6%BA%90%E4%BD%8D%E8%AE%BE%E8%AE%A1%E8%A7%84%E8%8C%83?node-id=85-2772&m=dev',
    verifiedAt: '2026-08-11',
    pageScope: '⭐️汇总：话题页相关物料；✈️：创作者活动中心 Banner',
    excluded: '1952×1193、1657×1193、1067×1162 等是规范说明板，不是资源交付尺寸；说明板标题使用的 PingFang SC 50/18 也不作为资源位字号。',
  },
  canvases: [
    {
      id: 'topic-cover',
      name: '话题头像 / 话题封面',
      family: '话题页',
      role: '话题列表与详情页的方形识别入口',
      logicalSize: { width: 240, height: 240 },
      composition: ['单一核心识别', '方形裁切', '小尺寸可辨识'],
      rules: ['主体避免贴边', '不得把说明板内的原图层尺寸当成交付画布'],
      sourceNode: '⭐️汇总 / Component「话题头像」与 Group「话题封面」',
      status: '已核验',
    },
    {
      id: 'topic-background',
      name: '话题页背景',
      family: '话题页',
      role: '话题页顶部氛围背景，承接搜索框与前景信息遮挡',
      logicalSize: { width: 375, height: 210 },
      exportScale: 3,
      exportSize: { width: 1125, height: 630 },
      composition: ['氛围主视觉', '顶部搜索框避让', '底部渐变承接'],
      rules: ['重点信息避开顶部搜索框', '以氛围为主并与话题封面、下方 Banner 拉开差异', '一般情况下不放抖音 Logo'],
      sourceNode: '85:2772 / Component「话题背景」',
      status: '已核验',
    },
    {
      id: 'topic-banner',
      name: '话题页 Banner',
      family: '话题页',
      role: '话题页内的活动利益点与行动入口',
      logicalSize: { width: 343, height: 65 },
      exportScale: 3,
      exportSize: { width: 1029, height: 195 },
      composition: ['短标题', '辅助信息', '行动 / 方向提示', '关联配图'],
      rules: ['文案与配图不得遮挡', '配图必须辅助理解 Banner 信息', '文字与背景保持清晰对比'],
      sourceNode: '⭐️汇总 / Component「话题页banner」',
      status: '已核验',
    },
    {
      id: 'creator-activity-card',
      name: '创作者活动中心卡片',
      family: '创作者活动中心',
      role: '手机端活动专区的 A/B、S/SS 级活动入口',
      logicalSize: { width: 183, height: 244 },
      exportScale: 3,
      exportSize: { width: 549, height: 732 },
      composition: ['活动画面', '标题与状态信息', '入口指示'],
      rules: ['活动等级改变内容策略，不改变交付画布', '列表并排时保持同一视觉基线'],
      sourceNode: '✈️ / A/B级活动banner、S/SS级活动banner',
      status: '已核验',
    },
    {
      id: 'creator-web-banner',
      name: '创作者活动专区 Banner · 网页端',
      family: '创作者活动中心',
      role: '网页端活动专区横向入口',
      logicalSize: { width: 916, height: 74 },
      exportScale: 4,
      exportSize: { width: 3664, height: 296 },
      composition: ['单一利益点', '横向场景 / 配图', '稳定文字区'],
      rules: ['网页端按 @4x 输出', '画面与创作者服务首页整体色调协调'],
      sourceNode: '✈️ / Frame「活动专区banner（网页端）」内导出图片',
      status: '来源换算',
    },
  ],
  occlusion: [
    {
      name: '顶部完全遮挡区',
      width: 375,
      height: 20,
      fill: 'rgba(255, 0, 79, 0.30)',
      purpose: '系统顶栏 / 搜索区域不可承载关键信息',
      status: '已核验',
    },
    {
      name: '下方渐变遮挡区',
      width: 375,
      height: 190,
      offsetBottom: 20,
      fill: 'linear-gradient(180deg, rgba(255,0,79,0) 0%, rgba(255,0,79,.30) 100%)',
      purpose: '预判前景信息与页面内容对背景的渐进遮挡',
      status: '已核验',
    },
  ],
  tokens: [
    { name: 'Text/TextPrimary', type: '文字', usage: '主要信息；最终值由消费端主题变量解析，不在图片中手抄色号', status: '已核验' },
    { name: 'Text/TextQuaternary', type: '文字', usage: '弱辅助信息；只用于非关键层级', status: '已核验' },
    { name: 'Text/ConstTextInverse3_Light', type: '文字', usage: '浅色主题上的反色次级文字', status: '已核验' },
    { name: 'Text/ConstTextInverse4_Light', type: '文字', usage: '浅色主题上的反色弱文字', status: '已核验' },
    { name: 'BG/BGPrimary', type: '背景', usage: '主题主背景 Token', status: '已核验' },
    { name: 'BG/BGPanelGray', type: '背景', usage: '面板灰背景 Token', status: '已核验' },
    { name: 'Line/LineReverse2_Light', type: '分割线', usage: '浅色主题反向分割线', status: '已核验' },
    { name: '遮挡区', type: '规范标注', value: '#FF004F / 30%', usage: '只用于规范图示，不得进入正式资源', status: '已核验' },
  ],
  contentRules: [
    { title: '文图最小距离', detail: '文案与中间配图的极限距离为 12px；小于该值直接阻止交付。', appliesTo: '创作者活动中心 Banner', status: '规范规则' },
    { title: '配图语义', detail: '插图应与标题有表层或深层关联，负责辅助理解，不得只作无关装饰。', appliesTo: 'Banner / 活动入口', status: '规范规则' },
    { title: '文字可读性', detail: '文字色与背景色必须形成清晰对比；不得用高饱和、高对比背景破坏识别。', appliesTo: '全部含文资源位', status: '规范规则' },
    { title: '整体色调', detail: '从承载页面整体出发确定 Banner 信息层级，背景色调需与页面协调。', appliesTo: '创作者服务首页', status: '规范规则' },
    { title: '字号策略', detail: '字号由具体组件 / 端侧 Token 提供；当前源文件未给出一套跨资源位通用数值，禁止拿说明板的 50/18px 代替。', appliesTo: '全部含文资源位', status: '规范规则' },
  ],
  sets: [
    { name: '话题页三件套', items: ['话题头像 / 封面', '话题页背景', '话题页 Banner'], purpose: '三种物料共同建立话题识别、顶部氛围和活动转化入口。' },
    { name: '挑战赛话题页三件套', items: ['挑战赛头图', '话题页背景', '话题页 Banner'], purpose: '挑战赛保留同一组合合同，但头图内容按挑战赛信息结构替换。' },
  ],
  validation: [
    { code: 'CANVAS_SIZE_MISMATCH', level: 'error', check: '交付画布必须等于所选资源位 logicalSize', message: '画布尺寸与资源位规范不一致' },
    { code: 'EXPORT_SCALE_MISMATCH', level: 'error', check: '存在 exportScale 时，导出像素必须等于 logicalSize × exportScale', message: '导出倍率或像素尺寸错误' },
    { code: 'TOP_OCCLUSION_COLLISION', level: 'error', check: '话题背景顶部 20px 内不得出现标题、Logo、利益点等关键信息', message: '关键信息进入顶部完全遮挡区' },
    { code: 'TEXT_IMAGE_GAP_TOO_SMALL', level: 'error', check: '创作者活动 Banner 的文案与配图边界距离不得小于 12px', message: '文案与配图距离不足 12px' },
    { code: 'TOPIC_BACKGROUND_LOGO', level: 'warning', check: '话题背景默认不出现抖音 Logo；项目明确要求时需记录例外', message: '话题背景包含非默认 Logo' },
    { code: 'UNRESOLVED_THEME_TOKEN', level: 'error', check: 'Text / BG / Line Token 必须在目标端主题中可解析', message: '端侧主题 Token 未解析' },
    { code: 'SPEC_BOARD_SIZE_LEAK', level: 'error', check: '阻止 1952×1193、1657×1193、1067×1162 等说明板尺寸进入交付清单', message: '检测到规范说明板尺寸被误登记为资源尺寸' },
  ],
  pending: [
    '补齐各端组件内部的真实字号、行高、字重和最大行数；当前源文件未提供可安全泛化的统一数值。',
    '补齐所有资源位的正式导出节点 ID 与透明 / 位图样例，不以说明板截图替代。',
    '把 Text、BG、Line 变量解析为目标端主题的确切色值，并记录亮 / 暗模式映射。',
    '补齐 A/B 与 S/SS 活动等级的内容门槛、文案长度和审核条件。',
  ],
  markdownPath: '/assets/brand-kits/douyin-life-service-resource-spec/brand-kit.md',
  manifestPath: '/assets/brand-kits/douyin-life-service-resource-spec/resource-spec.json',
}
