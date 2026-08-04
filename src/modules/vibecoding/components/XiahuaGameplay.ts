/* ─── 「这夏夯爆了」玩法配置 ───
 * 从预览组件里抽出来的可编辑玩法层：卡池、奖励档位、抽卡规则、任务、赠送。
 * 预览只负责「怎么画」，这里定义「怎么玩」——两边通过元素上的 gameplay
 * 绑定键关联，改这里的规则会让 UI 自动重算（档位增减、卡池增减都即时生效）。
 * 卡面 / 券图等素材归 UI 层（按 id 映射），所以玩法可以脱离素材独立调整。 */

export interface XiahuaCardDef {
  /** 与卡面素材映射的稳定 id */
  id: string
  name: string
  /** 卡面上的风味短句 */
  motto: string
}

export interface XiahuaTierDef {
  /** 集齐多少种解锁 */
  need: number
  reward: string
  kind: 'coupon' | 'goods'
  /** 每日库存（取自活动规则页） */
  stock?: number
}

export interface XiahuaTaskDef {
  id: string
  label: string
  /** 完成一次得几次抽卡机会 */
  reward: number
  dailyLimit: number
}

export interface XiahuaGameplay {
  cards: XiahuaCardDef[]
  tiers: XiahuaTierDef[]
  draw: {
    /** 初始抽卡次数 */
    initialChances: number
    /** 未获得品类的权重倾斜（0 = 完全随机，1 = 必出新卡） */
    newCardBias: number
  }
  gift: {
    /** 持有几张以上才可赠送 */
    minHold: number
  }
  tasks: XiahuaTaskDef[]
  /** 进度文案模板，{n} 会替换成还差几种，{reward} 替换成下一档奖励 */
  copy: {
    progress: string
    progressSub: string
    allDone: string
  }
}

/** 0→1 回放的输入基线：保留策划初稿，后续脚本会逐步调成上线版本。 */
export const XIAHUA_BUILD_BASELINE_GAMEPLAY: XiahuaGameplay = {
  cards: [
    { id: 'huoguo', name: '沸腾火锅', motto: '热辣下肚 烦恼止步' },
    { id: 'longxia', name: '红火小龙虾', motto: '虾壳通红 焦虑清空' },
    { id: 'kaorou', name: '滋滋烤肉', motto: '油花一响 快乐开场' },
    { id: 'huangyu', name: '鲜烧黄鱼', motto: '鲜掉眉毛 烦恼跑掉' },
    { id: 'pisa', name: '浓香披萨', motto: '拉丝瞬间 幸福满格' },
    { id: 'zhaji', name: '香脆炸鸡', motto: '咔嚓一口 压力全走' },
    { id: 'ningcha', name: '冰爽柠檬茶', motto: '透心一凉 暑气投降' },
    { id: 'luwei', name: '解馋卤味', motto: '越嚼越香 越吃越爽' },
    { id: 'luosifen', name: '上头螺蛳粉', motto: '闻着上头 吃着点头' },
  ],
  tiers: [
    { need: 2, reward: '2元夜食券', kind: 'coupon', stock: 7587 },
    { need: 4, reward: '5元夜食券', kind: 'coupon', stock: 2023 },
    { need: 7, reward: '43元夜食券包', kind: 'coupon', stock: 196 },
    { need: 9, reward: '小马黄金转运珠', kind: 'goods', stock: 1 },
  ],
  draw: { initialChances: 9, newCardBias: 0.72 },
  gift: { minHold: 2 },
  tasks: [
    { id: 'post', label: '带定位&话题投稿分享夏日夜食', reward: 2, dailyLimit: 5 },
    { id: 'gift', label: '给朋友赠送一张美食卡', reward: 1, dailyLimit: 3 },
    { id: 'visit', label: '浏览夏日夜食指南活动页', reward: 1, dailyLimit: 1 },
  ],
  copy: {
    progress: '再抽 {n} 种',
    progressSub: '兑{reward}',
    allDone: '集齐{total}种!',
  },
}

/** 「夯爆了 已上线」与活动模板读取的生成终态。 */
export const DEFAULT_XIAHUA_GAMEPLAY: XiahuaGameplay = {
  ...XIAHUA_BUILD_BASELINE_GAMEPLAY,
  tiers: XIAHUA_BUILD_BASELINE_GAMEPLAY.tiers.slice(0, 3),
  draw: { initialChances: 12, newCardBias: 0.88 },
  copy: {
    progress: '还差 {n} 种就能兑',
    progressSub: '{reward} 等你拿',
    allDone: '集齐{total}种!',
  },
}

/** UI 元素 → 它承载的玩法规则。编辑面板据此在「玩法」页签给出对应字段。 */
export const GAMEPLAY_BINDING: Record<string, keyof XiahuaGameplay | 'gift'> = {
  'btn-draw': 'draw',
  'tier-row': 'tiers',
  'card-strip': 'cards',
  'collect-info': 'copy',
  'sec-tasks': 'tasks',
  'btn-my-cards': 'gift',
}

export const GAMEPLAY_LABEL: Record<string, string> = {
  draw: '抽卡规则',
  tiers: '奖励档位',
  cards: '夜食卡池',
  copy: '进度文案',
  tasks: '任务发放',
  gift: '赠送规则',
}

/** 渲染进度文案：把模板里的占位替换成实时数值。 */
export function renderProgress(
  copy: XiahuaGameplay['copy'],
  remaining: number,
  reward: string | undefined,
  total: number,
): { main: string; sub: string } {
  if (!reward) {
    return { main: copy.allDone.replace('{total}', String(total)), sub: '全套奖励等你领' }
  }
  return {
    main: copy.progress.replace('{n}', String(remaining)),
    sub: copy.progressSub.replace('{reward}', reward),
  }
}
