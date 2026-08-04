import { DEFAULT_XIAHUA_GAMEPLAY, type XiahuaGameplay } from './XiahuaGameplay'

/* ─── 活动模板（Preset）───
 * 「集卡兑奖 H5」是一套可复用的模板：版式、热区、玩法机制、编辑能力都固定，
 * 变的只有 ①素材目录 ②玩法配置 ③文案。所以换一个活动 = 加一个 preset +
 * 一个同名约定的素材目录，不用改任何组件代码。
 *
 * 素材目录命名约定（放在 public/assets/<id>/）：
 *   head-kv.png      主视觉        title.png         活动标题字
 *   btn-draw.png     主按钮        btn-my-cards.png  左侧入口
 *   btn-my-prizes.png 右侧入口     panel-bg.png      集卡面板底
 *   tier-1..4.png    奖励档位图标   bigcard.png       开卡大图
 *   result-title.png 开卡标题      envelope.png      兑奖礼物
 *   sec-tasks.png / sec-topics.png / sec-banner.png  下半屏三段
 *   footer-logo.png  页脚字标      mascot.png        IP 形象
 *   card-<卡id>.png / card-<卡id>-grey.png           每张卡的彩色 / 灰态
 * 缺哪张就显示带文件名的占位框，不会白屏 —— 可以边补素材边看效果。 */

export interface ActivityTheme {
  /** 页面底色 */
  bg: string
  /** 下半区渐变（从 bg 过渡到该色） */
  bgLower: string
  /** 侧栏胶囊底色（含透明度写法） */
  rail: string
  /** 侧栏文字色 */
  railText: string
  /** 阶段 Tab 容器底 */
  tabBar: string
  /** 阶段 Tab 选中文字色 */
  tabActiveText: string
  /** 阶段 Tab 未选中文字色 */
  tabIdleText: string
  /** 进度文案里的强调数字色 */
  accent: string
  /** 副文案色 */
  subText: string
}

export interface ActivityStage {
  id: string
  label: string
  /** 胶囊宽度（设计稿实测） */
  w: number
  locked?: boolean
}

export interface ActivityCopy {
  /** 上传的策划文档名 */
  docName: string
  /** 首条诉求 */
  request: string
  /** 拆解卡里的要点 */
  brief: string[]
  /** 素材批次名（对应 6 个搭建阶段） */
  assetBatches: { title: string; items: string[]; note?: string }[]
  /** 画板名 */
  screens: { main: string; result: string; cards: string; redeem: string; rules: string }
  /** 卡册页签名 */
  cardsTabs: { other: string; current: string; history: string }
  /** 我的奖品空态文案 */
  prizesEmpty: string
}

/** 头图 KV 的合成图层（对齐 Figma「活动收集/head」：底景 + 角色 + 贴片，
 *  不是一张整图）。坐标为 375 宽设计稿 px，按数组顺序叠放。 */
export interface KvLayer {
  id: string
  /** 相对 assetRoot 的文件名；以 / 开头则为绝对地址（换皮时直接指向新素材） */
  file: string
  label: string
  x: number
  y: number
  w: number
  h: number
  /** 底景层：铺满整个 KV 区（object-cover），忽略 x/y/w/h */
  base?: boolean
}

export interface ActivityPreset {
  id: string
  /** 项目名（侧栏与标题栏显示） */
  name: string
  /** 素材目录，如 /assets/xiahua */
  assetRoot: string
  /** 阶段 Tab */
  stages: ActivityStage[]
  theme: ActivityTheme
  gameplay: XiahuaGameplay
  copy: ActivityCopy
  /** 已生成的真实候选素材；首项永远是当前约定文件，后续项按需解锁。 */
  assetVariants?: Record<string, string[]>
  /** 少数不按约定命名的素材可在此覆盖（key 为约定名，value 为实际文件名）。 */
  assetOverrides?: Record<string, string>
  /** 头图 KV 的合成图层；缺省时退回单张 headKv 整图。 */
  kvLayers?: KvLayer[]
}

/** 图层地址：支持绝对路径（模板换皮直接指向其他目录的素材）。 */
export function kvLayerSrc(p: ActivityPreset, l: KvLayer): string {
  return l.file.startsWith('/') ? l.file : `${p.assetRoot}/${l.file}`
}

/** 约定的素材键 → 默认文件名。 */
export const ASSET_FILES = {
  headKv: 'head-kv.png',
  title: 'title.png',
  btnDraw: 'btn-draw.png',
  btnMyCards: 'btn-my-cards.png',
  btnMyPrizes: 'btn-my-prizes.png',
  panelBg: 'panel-bg.png',
  tier1: 'tier-1.png',
  tier2: 'tier-2.png',
  tier3: 'tier-3.png',
  tier4: 'tier-4.png',
  bigCard: 'bigcard.png',
  resultTitle: 'result-title.png',
  secTasks: 'sec-tasks.png',
  secTopics: 'sec-topics.png',
  secBanner: 'sec-banner.png',
  footerLogo: 'footer-logo.png',
  beanBar: 'bean-bar.png',
  envelope: 'envelope.png',
  mascot: 'mascot.png',
} as const

export type AssetKey = keyof typeof ASSET_FILES

/** 解析出该 preset 下每个素材键的完整地址（override 以 / 开头视为绝对地址）。 */
export function assetMap(p: ActivityPreset): Record<AssetKey, string> {
  const out = {} as Record<AssetKey, string>
  ;(Object.keys(ASSET_FILES) as AssetKey[]).forEach((k) => {
    const f = p.assetOverrides?.[k] ?? ASSET_FILES[k]
    out[k] = f.startsWith('/') ? f : `${p.assetRoot}/${f}`
  })
  return out
}

/** 素材真实候选地址：v1 是现有素材，后续版本来自 preset 的 variants 目录。 */
export function assetVariants(p: ActivityPreset, key: string): string[] {
  const base = assetMap(p)[key as AssetKey]
  if (!base) return []
  return [base, ...(p.assetVariants?.[key] ?? [])].map((src) =>
    src.startsWith('/') ? src : `${p.assetRoot}/${src}`,
  )
}

/** 卡面按约定名解析：card-<id>.png / card-<id>-grey.png。 */
export function cardArt(p: ActivityPreset, cardId: string): { img: string; grey: string } {
  return {
    img: `${p.assetRoot}/${p.assetOverrides?.[`card-${cardId}`] ?? `card-${cardId}.png`}`,
    grey: `${p.assetRoot}/${p.assetOverrides?.[`card-${cardId}-grey`] ?? `card-${cardId}-grey.png`}`,
  }
}

/** 卡面彩色候选地址；灰态保持一份，避免生成版破坏未获得态。 */
export function cardArtVariants(p: ActivityPreset, cardId: string): { img: string[]; grey: string[] } {
  const art = cardArt(p, cardId)
  return {
    img: [art.img, ...(p.assetVariants?.[`card-${cardId}`] ?? [])].map((src) =>
      src.startsWith('/') ? src : `${p.assetRoot}/${src}`,
    ),
    grey: [art.grey],
  }
}

/* ─── 内置模板 ① 这夏夯爆了（原始还原，素材沿用现有文件名） ─── */

export const XIAHUA_PRESET: ActivityPreset = {
  id: 'xiahua',
  name: '这夏夯爆了',
  assetRoot: '/assets/xiahua',
  stages: [
    { id: 'shun', label: '夏天马上顺', w: 81 },
    { id: 'yeshi', label: '夏日夜食指南', w: 94 },
  ],
  theme: {
    bg: '#2f1912',
    bgLower: '#5e3523',
    rail: 'rgba(47,25,18,0.55)',
    railText: '#f5dcc4',
    tabBar: 'rgba(61,32,17,0.55)',
    tabActiveText: '#6b3410',
    tabIdleText: '#e6c6a8',
    accent: '#ff2e1a',
    subText: 'rgba(255,210,164,0.9)',
  },
  gameplay: DEFAULT_XIAHUA_GAMEPLAY,
  /* 头图不是一张整图 —— 对齐 Figma「活动收集/head」的真实图层：
     空场景底景 + 小马角色 + 各食物贴片，z 序照抄设计稿。 */
  kvLayers: [
    { id: 'kv-base', file: 'kv/base.png', label: '底景 · 深夜食堂', x: 0, y: 0, w: 375, h: 494, base: true },
    { id: 'kv-longxia', file: 'kv/longxia.png', label: '贴片 · 小龙虾', x: 268, y: 122, w: 67, h: 80 },
    { id: 'kv-kuaizi', file: 'kv/kuaizi.png', label: '贴片 · 筷子调料', x: 311, y: 191, w: 45, h: 66 },
    { id: 'kv-xinzai-luosifen', file: 'kv/xinzai-luosifen.png', label: '贴片 · 螺蛳粉心仔', x: 20, y: 75, w: 61, h: 74 },
    { id: 'kv-pisa', file: 'kv/pisa.png', label: '贴片 · 披萨', x: 280, y: 232, w: 60, h: 57 },
    { id: 'kv-huangyu', file: 'kv/huangyu.png', label: '贴片 · 黄鱼', x: 177, y: 306, w: 77, h: 68 },
    { id: 'kv-mascot', file: 'kv/mascot.png', label: '主角 · 小马', x: 17, y: 131, w: 285, h: 283 },
    { id: 'kv-huoguo', file: 'kv/huoguo.png', label: '贴片 · 火锅', x: 216, y: 230, w: 93, h: 126 },
    { id: 'kv-zhaji', file: 'kv/zhaji.png', label: '贴片 · 炸鸡', x: 290, y: 278, w: 71, h: 83 },
    { id: 'kv-luwei', file: 'kv/luwei.png', label: '贴片 · 卤味', x: 259, y: 333, w: 64, h: 63 },
    { id: 'kv-xinzai-meishi', file: 'kv/xinzai-meishi.png', label: '贴片 · 美食心仔', x: 17, y: 85, w: 71, h: 83 },
  ],
  assetVariants: {
    headKv: ['variants/head-kv-v2.png', 'variants/head-kv-v3.png', 'variants/head-kv-v4.png'],
    title: ['variants/title-v2.png'],
    panelBg: ['variants/panel-bg-v2.png'],
    btnDraw: ['variants/btn-draw-v2.png'],
    bigCard: ['variants/bigcard-v2.png'],
    tier3: ['variants/tier-43-v2.png'],
    'card-huoguo': ['variants/food-huoguo-v2.png'],
  },
  // 现有素材沿用原文件名，用 overrides 对齐约定键
  assetOverrides: {
    tier1: 'tier-2.png',
    tier2: 'tier-5.png',
    tier3: 'tier-43.png',
    tier4: 'tier-gold.png',
    mascot: 'mascot-horse-v3.png',
    'card-huoguo': 'food-huoguo.png',
    'card-huoguo-grey': 'food-huoguo-grey.png',
    'card-longxia': 'food-longxia.png',
    'card-kaorou': 'food-kaorou.png',
    'card-huangyu': 'food-huangyu.png',
    'card-pisa': 'food-pisa.png',
    'card-zhaji': 'food-zhaji.png',
    'card-ningcha': 'food-ningcha.png',
    'card-luwei-grey': 'food-luwei-grey.png',
    'card-luosifen-grey': 'food-luosifen-grey.png',
  },
  copy: {
    docName: '这夏夯爆了项目策划-内部沟通版.docx',
    request:
      '这是「这夏夯爆了」的活动策划，帮我把里面「集美食卡 兑红包」的玩法做成站内 H5，视觉按设计稿走',
    brief: [
      '档期 6.30 – 8.31，主题「深夜食堂 × 小马 IP」，分三阶段上线',
      '识别到 3 个候选玩法：集美食卡兑奖励、接金豆小游戏、投稿任务体系',
      '本期先做集卡 + 兑红包：9 种夜食卡，集齐 2 / 4 / 7 / 9 种分别兑 2元券 / 5元券 / 43元券包 / 小马黄金转运珠',
      '抽卡机会来自任务（投稿 / 赠卡 / 浏览），同种卡 ≥2 张可赠送好友',
    ],
    assetBatches: [
      { title: '生成主视觉', items: ['深夜食堂 KV（小马 IP + 满桌夜宵 + 霓虹窗景）'] },
      { title: '生成品牌与标题', items: ['活动标题字「这夏夯爆了」', '开卡标题「恭喜你获得」', '页脚字标'] },
      { title: '生成交互组件', items: ['抽夜食主按钮', '我的夜食 / 我的奖品入口', '集卡面板底 + 金豆条'] },
      { title: '生成奖励档位', items: ['¥2 / ¥5 / ¥43 券面', '小马黄金转运珠', '兑换红包'] },
      {
        title: '生成 9 张夜食卡面',
        items: [
          '沸腾火锅 · 红火小龙虾 · 滋滋烤肉',
          '鲜烧黄鱼 · 浓香披萨 · 香脆炸鸡',
          '冰爽柠檬茶 · 解馋卤味 · 上头螺蛳粉',
        ],
        note: '卤味 / 螺蛳粉仅产出石膏（未获得）版，彩色卡面排进下一批',
      },
      { title: '生成下半屏分区', items: ['任务区「玩一夏 赚更多」', '暑期灵感话题流', '底部活动 banner'] },
    ],
    screens: {
      main: '主会场',
      result: '开卡结算',
      cards: '我的夜食',
      redeem: '兑奖弹窗',
      rules: '活动规则',
    },
    cardsTabs: { other: '装备卡', current: '夜食卡', history: '交换记录' },
    prizesEmpty: '还没有奖品，集齐夜食卡来兑换吧',
  },
}

/* ─── 内置模板 ② 空白模板：换素材即成新活动 ───
 * assetRoot 指向新目录后，把按约定命名的图丢进去就能跑；缺图显示占位。 */

export const BLANK_PRESET: ActivityPreset = {
  id: 'newact',
  name: '新活动（模板）',
  assetRoot: '/assets/newact',
  stages: [
    { id: 's1', label: '第一阶段', w: 81 },
    { id: 's2', label: '第二阶段', w: 94 },
  ],
  theme: {
    bg: '#141c2e',
    bgLower: '#26365a',
    rail: 'rgba(20,28,46,0.55)',
    railText: '#cfe0ff',
    tabBar: 'rgba(30,44,74,0.55)',
    tabActiveText: '#1c3a70',
    tabIdleText: '#a8c2ee',
    accent: '#ffb020',
    subText: 'rgba(207,224,255,0.9)',
  },
  gameplay: {
    cards: [
      { id: 'c1', name: '藏品一', motto: '待补充文案' },
      { id: 'c2', name: '藏品二', motto: '待补充文案' },
      { id: 'c3', name: '藏品三', motto: '待补充文案' },
      { id: 'c4', name: '藏品四', motto: '待补充文案' },
      { id: 'c5', name: '藏品五', motto: '待补充文案' },
      { id: 'c6', name: '藏品六', motto: '待补充文案' },
    ],
    tiers: [
      { need: 2, reward: '5元券', kind: 'coupon' },
      { need: 4, reward: '20元券', kind: 'coupon' },
      { need: 6, reward: '实物大奖', kind: 'goods' },
    ],
    draw: { initialChances: 8, newCardBias: 0.75 },
    gift: { minHold: 2 },
    tasks: [
      { id: 'post', label: '发布带话题投稿', reward: 2, dailyLimit: 5 },
      { id: 'gift', label: '赠送好友一张卡', reward: 1, dailyLimit: 3 },
    ],
    copy: {
      progress: '再集 {n} 种',
      progressSub: '兑{reward}',
      allDone: '集齐{total}种!',
    },
  },
  copy: {
    docName: '新活动策划.docx',
    request: '这是新活动的策划，按集卡兑奖的模板做成站内 H5',
    brief: [
      '档期与主题按策划填写',
      '核心玩法：集卡 + 兑奖',
      '卡池 6 种，集齐 2 / 4 / 6 种解锁三档奖励',
      '抽卡机会来自投稿与赠卡任务',
    ],
    assetBatches: [
      { title: '生成主视觉', items: ['活动主 KV'] },
      { title: '生成品牌与标题', items: ['活动标题字', '开卡标题', '页脚字标'] },
      { title: '生成交互组件', items: ['主按钮', '两侧入口', '集卡面板底'] },
      { title: '生成奖励档位', items: ['三档奖励图标', '兑奖礼物'] },
      { title: '生成卡面', items: ['6 张藏品卡面（彩色 + 灰态）'], note: '缺图会显示占位框，补进目录即自动替换' },
      { title: '生成下半屏分区', items: ['任务区', '内容话题区', '底部 banner'] },
    ],
    screens: {
      main: '主会场',
      result: '开卡结算',
      cards: '我的卡册',
      redeem: '兑奖弹窗',
      rules: '活动规则',
    },
    cardsTabs: { other: '其他卡', current: '藏品卡', history: '交换记录' },
    prizesEmpty: '还没有奖品，集齐卡片来兑换吧',
  },
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [XIAHUA_PRESET, BLANK_PRESET]
