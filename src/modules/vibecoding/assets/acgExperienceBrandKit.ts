export interface AcgExperienceRule {
  name: string
  intent: string
  recipe: readonly string[]
}

export interface AcgCampaignBrandKitCandidate {
  id: string
  version: string
  name: string
  previewSrc: string
  positioning: string
  palette: readonly string[]
  heroSystem: string
  componentSkins: readonly string[]
  promptSignature: string
  recommended?: boolean
}

export const ACG_EXPERIENCE_BRAND_KIT = {
  id: 'brand.douyin-acg-new-year-2026',
  version: '1.2.0',
  source: {
    fileName: 'ACG 新春会 · 单页 Golden Reference',
    fileKey: 'PxXGus8deG2BZ3xQLUFl0u',
    nodeId: '1:369',
    size: '750 × 9776',
    note: '只提炼视觉方法；原图角色、Logo 和项目成片不进入生成素材库。',
  },
  cssVars: {
    '--acg-brand-canvas': '#FFF2DE',
    '--acg-brand-surface': '#FFF9F0',
    '--acg-brand-ink': '#601619',
    '--acg-brand-muted': 'rgba(96, 22, 25, .62)',
    '--acg-brand-red': '#FE2C55',
    '--acg-brand-coral': '#FF5A4D',
    '--acg-brand-orange': '#FF9A3D',
    '--acg-brand-gold': '#FFD980',
    '--acg-brand-sky': '#39A9FF',
    '--acg-brand-blue': '#35B9FF',
  },
  compositionRules: [
    {
      name: '三层 Hero 舞台',
      intent: '首屏同时建立平台归属、活动记忆点与内容期待，不用普通网页标题区代替 KV。',
      recipe: ['上层平台锁定与规则入口', '中层独立角色/场景主 KV', '下层艺术字、阶段条与弧形舞台过渡'],
    },
    {
      name: '一玩法一皮肤',
      intent: '让用户凭形状和色彩识别玩法，而不是在同一种白卡里阅读标题。',
      recipe: ['对抗玩法使用蓝红分屏', '榜单使用排行条与双动作', '心愿使用横向漂移纸条', '抽奖使用完整机器/奖池图'],
    },
    {
      name: '连续舞台节奏',
      intent: '长页像一次节目旅程，模块之间有转场，不是后台卡片的纵向堆叠。',
      recipe: ['每 1–2 屏更换底板或边框语法', '章节标题使用贴纸式独立锁定', '弧形顶边、云台、票券缺口承担转场'],
    },
    {
      name: '内容密度分级',
      intent: '同时保留视觉冲击和可操作信息。',
      recipe: ['Hero 高图像密度低文字密度', '玩法首屏中密度强动作', '榜单高信息密度但重复同一解剖', '规则与任务回到低装饰高可读'],
    },
  ] satisfies readonly AcgExperienceRule[],
  assetFamilies: [
    '主 KV 场景',
    '透明艺术字',
    '章节/玩法贴纸标题',
    '作品与内容封面',
    '主理人/角色头像',
    '奖励与抽奖装置',
    '底板/边框/转场装饰',
  ],
  complexityGate: [
    '至少 6 个真实业务区块，且每个区块都必须对应用户任务或玩法状态。',
    '至少 4 种可辨识的模块皮肤；禁止全页复用同一种圆角白卡。',
    'Hero 必须拆分主 KV、艺术字、平台锁定与操作层，不能烘焙成不可编辑整图。',
    '内容卡、投票按钮、票数、任务状态保持组件化；装饰层不得截获点击。',
    '在 375px 宽度缩放验收：标题、按钮、票数和角色焦点仍清楚。',
  ],
  promptRecipe: {
    order: ['使用场景与画幅', '舞台构图', '主体与层级', '品牌色与材质', '可编辑安全区', '排除项'],
    rendering: 'clean premium ACG campaign illustration, smooth controlled shading, soft directional lighting, broad readable color masses, continuous gradients, crisp silhouettes, restrained microtexture',
    exclusions: 'no visible grain, speckling, mottled pigment, oversharpening halos, muddy texture, chaotic micro-detail, excessive particles, copied IP characters, logos, watermarks or baked UI text',
  },
} as const

export type AcgExperienceBrandKit = typeof ACG_EXPERIENCE_BRAND_KIT

/** Three complete campaign directions shown at the only visual confirmation
 * gate. Each option is a generation contract, not a loose mood-board image. */
export const ACG_FROM_DOC_BRAND_KIT_CANDIDATES = [
  {
    id: 'brand.douyin-acg-star-fair-2026',
    version: '1.0.0',
    name: '星轨庙会 Brand Kit',
    previewSrc: '/assets/acg-from-doc/style-star-rail.webp',
    positioning: '年度内容事件与六站旅程感最强，适合主会场长页。',
    palette: ['暖奶油', '珊瑚红', '清亮蓝', '暖金'],
    heroSystem: '明亮天空 + 红金星轨 + 原创旅行者群像 + 弧形舞台',
    componentSkins: ['红蓝夸拉对抗', '双榜单', '心愿纸条', '收藏级抽奖装置'],
    promptSignature: 'bright premium ACG festival, warm cream stage, coral red and clear sky blue, smooth controlled shading',
    recommended: true,
  },
  {
    id: 'brand.douyin-acg-manga-annual-2026',
    version: '1.0.0',
    name: '新春漫画年刊 Brand Kit',
    previewSrc: '/assets/acg-from-doc/style-manga-annual.webp',
    positioning: '创作者、征稿与内容编辑感最强，适合强化共创属性。',
    palette: ['暖象牙纸', '朱红', '墨黑', '钴蓝'],
    heroSystem: '六篇章漫画分镜 + 大标题版式 + 擒页与票券转场',
    componentSkins: ['分镜对抗', '目录式榜单', '便笺心愿', '印刷票根奖池'],
    promptSignature: 'premium manga annual editorial, warm ivory paper, vermilion, ink black and cobalt, restrained halftone accents',
  },
  {
    id: 'brand.douyin-acg-candy-arcade-2026',
    version: '1.0.0',
    name: '糖果电玩城 Brand Kit',
    previewSrc: '/assets/acg-from-doc/style-candy-arcade.webp',
    positioning: '年轻、潮玩与游戏感最强，适合强化即时反馈。',
    palette: ['莓果紫', '糖果珊瑚', '发光青', '奶油黄'],
    heroSystem: '软胶潮玩世界 + 透明霓虹轨道 + 3D 微缩舞台',
    componentSkins: ['电量槽对抗', '游戏机榜单', '弹幕心愿', '扭蛋机奖池'],
    promptSignature: 'premium clean 3D toy arcade, berry purple, candy coral, luminous cyan and cream yellow, smooth resin materials',
  },
] as const satisfies readonly AcgCampaignBrandKitCandidate[]

export const ACG_FROM_DOC_DEFAULT_BRAND_KIT =
  ACG_FROM_DOC_BRAND_KIT_CANDIDATES[0]
