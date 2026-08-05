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
  /** 奖池内的相对权重；省略时按 100 处理。 */
  weight?: number
  rarity?: 'common' | 'rare' | 'epic'
  /** 对应素材库里的稳定素材 key。 */
  assetKey?: string
  enabled?: boolean
}

export interface XiahuaTierDef {
  id?: string
  /** 集齐多少种解锁 */
  need: number
  reward: string
  kind: 'coupon' | 'goods'
  /** 每日库存（取自活动规则页） */
  stock?: number
  /** 引用独立奖品对象，门槛规则和奖品库存不再混成一份。 */
  prizeId?: string
  totalStock?: number
  perUserLimit?: number
  assetKey?: string
  ruleType?: 'count' | 'all' | 'combination'
  requiredCardIds?: string[]
  consumeCards?: boolean
}

export interface XiahuaPrizeDef {
  id: string
  name: string
  type: 'coupon' | 'goods' | 'points' | 'virtual'
  valueLabel: string
  dailyStock: number
  totalStock: number
  perUserLimit: number
  /** 券模板 / SKU / 积分账户等真实履约对象。 */
  fulfillmentId: string
  assetKey: string
  fallbackPrizeId?: string
  enabled: boolean
  fulfillmentMode?: 'instant' | 'scheduled' | 'manual' | 'offline'
  validityDays?: number
  stockReset?: 'none' | 'daily' | 'weekly'
  refundPolicy?: 'retain' | 'revoke'
  shippingRequired?: boolean
}

export interface XiahuaTaskDef {
  id: string
  label: string
  /** 完成一次得几次抽卡机会 */
  reward: number
  dailyLimit: number
  /** 完成事实来自哪个业务事件，不能靠前端按钮直接发奖。 */
  eventSource?: string
  eventKey?: string
  resetCycle?: 'daily' | 'activity'
  audience?: 'all' | 'new_creator' | 'returning_creator'
  enabled?: boolean
  assetKey?: string
  taskType?: 'post' | 'gift' | 'visit' | 'share' | 'custom'
  subtitle?: string
  countDimension?: 'UID' | 'DID' | 'ACTID'
  claimMode?: 'auto' | 'manual'
  cooldownSeconds?: number
  validFrom?: string
  validTo?: string
  jumpSchema?: string
  completedCopy?: string
  expiredCopy?: string
}

export interface XiahuaVoteCandidateDef {
  id: string
  name: string
  description: string
  assetKey?: string
  enabled: boolean
}

export interface XiahuaQuizQuestionDef {
  id: string
  question: string
  options: string[]
  answer: number
  difficulty: 'easy' | 'medium' | 'hard'
  assetKey?: string
  enabled: boolean
}

export type XiahuaGameplayModuleKind =
  'lottery' | 'collection' | 'tasks' | 'voting' | 'quiz'

export interface XiahuaGameplayModules {
  enabled: XiahuaGameplayModuleKind[]
  lottery: {
    dailyLimit: number
    costPerDraw: number
    pityAfter: number
    resetCycle: 'daily' | 'activity'
    cooldownSeconds: number
    allowDuplicate: boolean
    accountDailyLimit: number
    deviceDailyLimit: number
    ipHourlyLimit: number
    template: 'card' | 'grid' | 'wheel' | 'list'
    entryMode: 'free' | 'chance' | 'token' | 'points'
    resourceId: string
    maxWinsPerUser: number
  }
  voting: {
    votesPerUser: number
    candidateCount: number
    liveRanking: boolean
    anonymous: boolean
    resetCycle: 'daily' | 'activity'
    candidates: XiahuaVoteCandidateDef[]
  }
  quiz: {
    questionCount: number
    passScore: number
    timeLimit: number
    randomOrder: boolean
    retryLimit: number
    questions: XiahuaQuizQuestionDef[]
  }
}

export const DEFAULT_XIAHUA_GAMEPLAY_MODULES: XiahuaGameplayModules = {
  enabled: ['lottery', 'collection', 'tasks'],
  lottery: {
    dailyLimit: 20,
    costPerDraw: 1,
    pityAfter: 6,
    resetCycle: 'daily',
    cooldownSeconds: 1,
    allowDuplicate: true,
    accountDailyLimit: 20,
    deviceDailyLimit: 40,
    ipHourlyLimit: 120,
    template: 'card',
    entryMode: 'chance',
    resourceId: 'draw_chance_night_food',
    maxWinsPerUser: 4,
  },
  voting: {
    votesPerUser: 3,
    candidateCount: 6,
    liveRanking: true,
    anonymous: false,
    resetCycle: 'daily',
    candidates: [],
  },
  quiz: {
    questionCount: 10,
    passScore: 80,
    timeLimit: 20,
    randomOrder: true,
    retryLimit: 2,
    questions: [],
  },
}

export type XiahuaActivityPlatform = 'douyin' | 'douyin_lite' | 'external_h5'
export type XiahuaEntryChannel = 'activity_home' | 'task_center' | 'search' | 'poi'

/** 运营能够理解并决策的活动参与规则；不承载服务名、接口 ID 等技术接线信息。 */
export interface XiahuaParticipationPolicy {
  startAt: string
  endAt: string
  timezone: 'Asia/Shanghai' | 'Asia/Tokyo'
  dailyResetHour: number
  platforms: XiahuaActivityPlatform[]
  entryChannels: XiahuaEntryChannel[]
  audience: 'all' | 'activity_creators' | 'new_users' | 'custom'
  audienceDescription: string
  regionScope: 'nationwide' | 'selected'
  regions: string
  loginRequired: boolean
  realNameRequired: boolean
  accountStatusRequired: boolean
  minAge: number
  participantIdentity: 'account' | 'account_device'
  riskAction: 'block' | 'verify' | 'participate_without_reward'
}

export const DEFAULT_XIAHUA_PARTICIPATION_POLICY: XiahuaParticipationPolicy = {
  startAt: '2026-06-30T00:00',
  endAt: '2026-08-31T23:59',
  timezone: 'Asia/Shanghai',
  dailyResetHour: 0,
  platforms: ['douyin'],
  entryChannels: ['activity_home', 'task_center', 'poi'],
  audience: 'all',
  audienceDescription: '18–35 岁本地生活用户，重点覆盖夜宵高频人群',
  regionScope: 'nationwide',
  regions: '',
  loginRequired: true,
  realNameRequired: false,
  accountStatusRequired: true,
  minAge: 18,
  participantIdentity: 'account_device',
  riskAction: 'verify',
}

export interface XiahuaGameplay {
  /** 可组合的一级玩法模块与各模块独立参数。旧配置省略时使用默认模块集。 */
  modules?: XiahuaGameplayModules
  prizes?: XiahuaPrizeDef[]
  participation?: XiahuaParticipationPolicy
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
    chancesInsufficient?: string
    prizeEmpty?: string
    giftSuccess?: string
    rulesTitle?: string
  }
}

/** 0→1 回放的输入基线：保留策划初稿，后续脚本会逐步调成上线版本。 */
export const XIAHUA_BUILD_BASELINE_GAMEPLAY: XiahuaGameplay = {
  modules: DEFAULT_XIAHUA_GAMEPLAY_MODULES,
  prizes: [
    {
      id: 'prize-2',
      name: '2元夜食券',
      type: 'coupon',
      valueLabel: '¥2',
      dailyStock: 7587,
      totalStock: 120000,
      perUserLimit: 1,
      fulfillmentId: 'coupon_tpl_night_2',
      assetKey: 'tier1',
      enabled: true,
      fulfillmentMode: 'instant',
      validityDays: 30,
      stockReset: 'daily',
      refundPolicy: 'revoke',
      shippingRequired: false,
    },
    {
      id: 'prize-5',
      name: '5元夜食券',
      type: 'coupon',
      valueLabel: '¥5',
      dailyStock: 2023,
      totalStock: 36000,
      perUserLimit: 1,
      fulfillmentId: 'coupon_tpl_night_5',
      assetKey: 'tier2',
      enabled: true,
      fulfillmentMode: 'instant',
      validityDays: 30,
      stockReset: 'daily',
      refundPolicy: 'revoke',
      shippingRequired: false,
    },
    {
      id: 'prize-43',
      name: '43元夜食券包',
      type: 'coupon',
      valueLabel: '¥43',
      dailyStock: 196,
      totalStock: 5000,
      perUserLimit: 1,
      fulfillmentId: 'coupon_pkg_night_43',
      assetKey: 'tier3',
      fallbackPrizeId: 'prize-5',
      enabled: true,
      fulfillmentMode: 'instant',
      validityDays: 30,
      stockReset: 'daily',
      refundPolicy: 'revoke',
      shippingRequired: false,
    },
    {
      id: 'prize-gold',
      name: '小马黄金转运珠',
      type: 'goods',
      valueLabel: '实物',
      dailyStock: 1,
      totalStock: 20,
      perUserLimit: 1,
      fulfillmentId: 'sku_horse_gold_2026',
      assetKey: 'tier4',
      fallbackPrizeId: 'prize-43',
      enabled: true,
      fulfillmentMode: 'manual',
      validityDays: 14,
      stockReset: 'none',
      refundPolicy: 'retain',
      shippingRequired: true,
    },
  ],
  participation: DEFAULT_XIAHUA_PARTICIPATION_POLICY,
  cards: [
    { id: 'huoguo', name: '沸腾火锅', motto: '热辣下肚 烦恼止步',
      rarity: 'common',
      weight: 120,
      assetKey: 'card-huoguo',
      enabled: true,
    },
    { id: 'longxia', name: '红火小龙虾', motto: '虾壳通红 焦虑清空',
      rarity: 'common',
      weight: 120,
      assetKey: 'card-longxia',
      enabled: true,
    },
    { id: 'kaorou', name: '滋滋烤肉', motto: '油花一响 快乐开场',
      rarity: 'common',
      weight: 110,
      assetKey: 'card-kaorou',
      enabled: true,
    },
    { id: 'huangyu', name: '鲜烧黄鱼', motto: '鲜掉眉毛 烦恼跑掉',
      rarity: 'common',
      weight: 110,
      assetKey: 'card-huangyu',
      enabled: true,
    },
    { id: 'pisa', name: '浓香披萨', motto: '拉丝瞬间 幸福满格',
      rarity: 'rare',
      weight: 80,
      assetKey: 'card-pisa',
      enabled: true,
    },
    { id: 'zhaji', name: '香脆炸鸡', motto: '咔嚓一口 压力全走',
      rarity: 'rare',
      weight: 80,
      assetKey: 'card-zhaji',
      enabled: true,
    },
    { id: 'ningcha', name: '冰爽柠檬茶', motto: '透心一凉 暑气投降',
      rarity: 'rare',
      weight: 70,
      assetKey: 'card-ningcha',
      enabled: true,
    },
    { id: 'luwei', name: '解馋卤味', motto: '越嚼越香 越吃越爽',
      rarity: 'epic',
      weight: 45,
      assetKey: 'card-luwei',
      enabled: true,
    },
    { id: 'luosifen', name: '上头螺蛳粉', motto: '闻着上头 吃着点头',
      rarity: 'epic',
      weight: 45,
      assetKey: 'card-luosifen',
      enabled: true,
    },
  ],
  tiers: [
    {
      id: 'tier-2',
      need: 2, reward: '2元夜食券', kind: 'coupon', stock: 7587,
      prizeId: 'prize-2',
      totalStock: 120000,
      perUserLimit: 1,
      assetKey: 'tier1',
      ruleType: 'count',
      requiredCardIds: [],
      consumeCards: false,
    },
    {
      id: 'tier-4',
      need: 4, reward: '5元夜食券', kind: 'coupon', stock: 2023,
      prizeId: 'prize-5',
      totalStock: 36000,
      perUserLimit: 1,
      assetKey: 'tier2',
      ruleType: 'count',
      requiredCardIds: [],
      consumeCards: false,
    },
    {
      id: 'tier-7',
      need: 7, reward: '43元夜食券包', kind: 'coupon', stock: 196,
      prizeId: 'prize-43',
      totalStock: 5000,
      perUserLimit: 1,
      assetKey: 'tier3',
      ruleType: 'count',
      requiredCardIds: [],
      consumeCards: false,
    },
    {
      id: 'tier-9',
      need: 9, reward: '小马黄金转运珠', kind: 'goods', stock: 1,
      prizeId: 'prize-gold',
      totalStock: 20,
      perUserLimit: 1,
      assetKey: 'tier4',
      ruleType: 'all',
      requiredCardIds: [],
      consumeCards: false,
    },
  ],
  draw: { initialChances: 9, newCardBias: 0.72 },
  gift: { minHold: 2 },
  tasks: [
    { id: 'post', label: '带定位&话题投稿分享夏日夜食',
      subtitle: '投稿审核通过后发放',
      taskType: 'post',
      reward: 2, dailyLimit: 5,
      eventSource: '内容投稿',
      eventKey: 'video.publish.approved',
      resetCycle: 'daily',
      audience: 'all',
      countDimension: 'UID',
      claimMode: 'auto',
      cooldownSeconds: 60,
      validFrom: '2026-06-30 00:00',
      validTo: '2026-08-31 23:59',
      jumpSchema: 'snssdk1128://challenge/detail?cid=night_food',
      completedCopy: '已完成',
      expiredCopy: '已结束',
      enabled: true,
      assetKey: 'secTasks',
    },
    { id: 'gift', label: '给朋友赠送一张美食卡',
      subtitle: '好友领取后计入完成',
      taskType: 'gift',
      reward: 1, dailyLimit: 3,
      eventSource: '赠送服务',
      eventKey: 'collectible.gift.received',
      resetCycle: 'daily',
      audience: 'all',
      countDimension: 'UID',
      claimMode: 'auto',
      cooldownSeconds: 10,
      validFrom: '2026-06-30 00:00',
      validTo: '2026-08-31 23:59',
      jumpSchema: 'snssdk1128://activity/night-food/cards',
      completedCopy: '已赠送',
      expiredCopy: '已结束',
      enabled: true,
      assetKey: 'btnMyCards',
    },
    { id: 'visit', label: '浏览夏日夜食指南活动页',
      subtitle: '有效浏览 10 秒',
      taskType: 'visit',
      reward: 1, dailyLimit: 1,
      eventSource: '活动埋点',
      eventKey: 'activity.page.valid_view',
      resetCycle: 'daily',
      audience: 'all',
      countDimension: 'UID',
      claimMode: 'auto',
      cooldownSeconds: 0,
      validFrom: '2026-06-30 00:00',
      validTo: '2026-08-31 23:59',
      jumpSchema: 'https://www.douyin.com/activities/night-food',
      completedCopy: '已浏览',
      expiredCopy: '已结束',
      enabled: true,
      assetKey: 'secTopics',
    },
  ],
  copy: {
    progress: '再抽 {n} 种',
    progressSub: '兑{reward}',
    allDone: '集齐{total}种!',
    chancesInsufficient: '抽卡机会用完啦，去做任务赚机会吧',
    prizeEmpty: '还没有奖品，快去集卡解锁吧',
    giftSuccess: '已送给好友，领取后生效',
    rulesTitle: '活动规则',
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
    chancesInsufficient: '抽卡机会用完啦，去做任务赚机会吧',
    prizeEmpty: '还没有奖品，快去集卡解锁吧',
    giftSuccess: '已送给好友，领取后生效',
    rulesTitle: '活动规则',
  },
}

/**
 * 把旧版本地草稿补齐为当前配置结构。保留用户改过的值，
 * 只为旧草稿中不存在的对象和字段补默认值。
 */
export function normalizeXiahuaGameplay(
  gameplay: XiahuaGameplay,
): XiahuaGameplay {
  const normalizedBase = { ...gameplay } as XiahuaGameplay & {
    integrations?: unknown
  }
  delete normalizedBase.integrations
  const savedModules = gameplay.modules
  const defaultCards = new Map(
    DEFAULT_XIAHUA_GAMEPLAY.cards.map((card) => [card.id, card]),
  )
  const defaultPrizes = new Map(
    (DEFAULT_XIAHUA_GAMEPLAY.prizes ?? []).map((prize) => [prize.id, prize]),
  )
  const defaultTiers = new Map(
    DEFAULT_XIAHUA_GAMEPLAY.tiers.map((tier) => [tier.need, tier]),
  )
  const defaultTasks = new Map(
    DEFAULT_XIAHUA_GAMEPLAY.tasks.map((task) => [task.id, task]),
  )

  return {
    ...normalizedBase,
    modules: {
      ...DEFAULT_XIAHUA_GAMEPLAY_MODULES,
      ...savedModules,
      enabled: savedModules?.enabled ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES.enabled,
      lottery: {
        ...DEFAULT_XIAHUA_GAMEPLAY_MODULES.lottery,
        ...savedModules?.lottery,
      },
      voting: {
        ...DEFAULT_XIAHUA_GAMEPLAY_MODULES.voting,
        ...savedModules?.voting,
        candidates:
          savedModules?.voting?.candidates ??
          DEFAULT_XIAHUA_GAMEPLAY_MODULES.voting.candidates,
      },
      quiz: {
        ...DEFAULT_XIAHUA_GAMEPLAY_MODULES.quiz,
        ...savedModules?.quiz,
        questions:
          savedModules?.quiz?.questions ??
          DEFAULT_XIAHUA_GAMEPLAY_MODULES.quiz.questions,
      },
    },
    prizes: (gameplay.prizes ?? DEFAULT_XIAHUA_GAMEPLAY.prizes)?.map(
      (prize) => ({
        ...defaultPrizes.get(prize.id),
        ...prize,
      }),
    ),
    participation: {
      ...DEFAULT_XIAHUA_PARTICIPATION_POLICY,
      ...gameplay.participation,
      platforms:
        gameplay.participation?.platforms ??
        DEFAULT_XIAHUA_PARTICIPATION_POLICY.platforms,
      entryChannels:
        gameplay.participation?.entryChannels ??
        DEFAULT_XIAHUA_PARTICIPATION_POLICY.entryChannels,
    },
    cards: gameplay.cards.map((card) => ({
      ...defaultCards.get(card.id),
      ...card,
      enabled: card.enabled ?? true,
    })),
    tiers: gameplay.tiers.map((tier) => ({
      ...defaultTiers.get(tier.need),
      ...tier,
    })),
    tasks: gameplay.tasks.map((task) => ({
      ...defaultTasks.get(task.id),
      ...task,
      enabled: task.enabled ?? true,
    })),
    copy: {
      ...DEFAULT_XIAHUA_GAMEPLAY.copy,
      ...gameplay.copy,
    },
  }
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
