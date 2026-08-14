export type GameplayEvidenceStatus = '源文档已确认' | '规范化建议' | '待接入核验'

export interface GameplayConfigField {
  key: string
  label: string
  value: string
  type: 'integer' | 'boolean' | 'enum' | 'reference' | 'duration' | 'string'
  ownership: '智能配置' | '运营锁定' | '平台固定'
  status: GameplayEvidenceStatus
  constraint?: string
}

export interface GameplayAssetProfile {
  capability: {
    id: string
    version: string
    schemaVersion: string
    maturity: string
    reusableCore: string
    preset: string
  }
  presentation: {
    eyebrow: string
    headline: string
    description: string
    accent: string
    deep: string
    soft: string
  }
  decision: {
    useWhen: readonly string[]
    avoidWhen: readonly string[]
  }
  playerLoop: readonly {
    id: string
    label: string
    detail: string
    output: string
  }[]
  preset: {
    activityName: string
    schedule: string
    stages: readonly number[]
    roundSeconds: number
    totalTargets: number
    initialAttempts: number
    milestoneRewards: readonly string[]
  }
  configGroups: readonly {
    name: string
    summary: string
    fields: readonly GameplayConfigField[]
  }[]
  states: readonly {
    state: string
    trigger: string
    behavior: string
    next: string
  }[]
  tasks: readonly {
    phase: string
    task: string
    reward: string
    quota: string
    reset: string
  }[]
  contract: {
    inputs: readonly string[]
    outputs: readonly string[]
    events: readonly string[]
    requiredArguments: readonly string[]
    optionalArguments: readonly string[]
  }
  dependencies: readonly {
    name: string
    role: string
    required: boolean
    status: GameplayEvidenceStatus
  }[]
  assetSlots: readonly {
    slot: string
    count: string
    requirement: string
  }[]
  measurement: readonly string[]
  acceptance: readonly string[]
  source: {
    documentUrl: string
    figmaUrl: string
    documentTitle: string
    revision: string
    verified: readonly string[]
    openQuestions: readonly string[]
    artifacts: readonly { label: string; href: string; format: string }[]
  }
}

export const QIXI_MAGPIE_HUNT_GAMEPLAY_PROFILE: GameplayAssetProfile = {
  capability: {
    id: 'gameplay.hidden-object.magpie-hunt',
    version: '0.7.0',
    schemaVersion: 'gameplay-package/v1alpha1',
    maturity: '需求已验证 · Runtime 接口待归档',
    reusableCore: '限时找物 / 找茬闯关',
    preset: '2026 七夕 · 搭建鹊桥',
  },
  presentation: {
    eyebrow: 'HIDDEN OBJECT · STAGED CHALLENGE',
    headline: '找喜鹊，搭鹊桥',
    description: '在限时场景中找到指定目标，以关卡、次数、任务、里程碑奖励与抽奖构成完整回流闭环。',
    accent: '#FF5B76',
    deep: '#25172D',
    soft: '#FFF0F4',
  },
  decision: {
    useWhen: [
      '需要 30–120 秒即可理解的轻互动，覆盖大规模泛用户',
      '有多张可探索场景图，希望难度随关卡递增',
      '需要把签到、分享或好友回流转成继续挑战的次数',
      '希望用阶段奖励驱动用户通关，而不是依赖强竞技',
    ],
    avoidWhen: [
      '核心目标是实时多人对战或强社交协作',
      '没有足够清晰且可控热区的高分辨率场景素材',
      '奖励、任务、风险或库存服务尚未提供真实接口',
    ],
  },
  playerLoop: [
    { id: 'enter', label: '进入活动', detail: '首访领取 1 次挑战机会；读取当前关卡、进度与奖励状态。', output: 'session.ready' },
    { id: 'play', label: '限时找物', detail: '倒计时开始；正确点击累计目标，错误点击只反馈、不额外扣时。', output: 'target.found / target.missed' },
    { id: 'settle', label: '关卡结算', detail: '找齐即成功；超时、主动退出或进程被杀视为失败，已消耗次数不返还。', output: 'level.completed / level.failed' },
    { id: 'reward', label: '发放奖励', detail: '每关成功 +1 抽奖机会；第 3、7 关额外解锁消费券。', output: 'reward.granted' },
    { id: 'return', label: '任务回流', detail: '次数不足时去签到或好友助力；全通后切换为邀请好友得抽奖次数。', output: 'attempt.granted / lottery_chance.granted' },
  ],
  preset: {
    activityName: '搭建鹊桥 赢券包',
    schedule: '2026-08-15 00:00 — 2026-08-19 23:59',
    stages: [5, 6, 6, 7, 7, 8, 8],
    roundSeconds: 90,
    totalTargets: 47,
    initialAttempts: 1,
    milestoneRewards: ['第 3 关：消费券奖励', '第 7 关：消费券奖励', '每关成功：抽奖机会 ×1'],
  },
  configGroups: [
    {
      name: '关卡与难度',
      summary: '可根据场景数和目标密度生成关卡，热区与可访问性规则始终参与校验。',
      fields: [
        { key: 'stages[].targetCount', label: '每关目标数', value: '5 / 6 / 6 / 7 / 7 / 8 / 8', type: 'integer', ownership: '智能配置', status: '源文档已确认', constraint: '每关必须与热区清单一一对应' },
        { key: 'round.durationSeconds', label: '单关时长', value: '90 秒', type: 'duration', ownership: '智能配置', status: '源文档已确认', constraint: '建议 30–120 秒' },
        { key: 'stages[].sceneAssetRef', label: '关卡场景', value: '每关引用 1 张场景图', type: 'reference', ownership: '智能配置', status: '规范化建议', constraint: '必须是已授权项目素材' },
        { key: 'stages[].hotspots', label: '目标热区', value: '目标 ID、归一化坐标、命中半径', type: 'reference', ownership: '运营锁定', status: '规范化建议', constraint: '不得超出安全区；重叠热区必须报错' },
        { key: 'difficulty.mode', label: '难度曲线', value: '目标更小 / 遮挡更深 / 场景更复杂', type: 'enum', ownership: '智能配置', status: '源文档已确认' },
      ],
    },
    {
      name: '次数与失败',
      summary: '次数是唯一对局门票；失败原因可区分，但消耗规则保持一致。',
      fields: [
        { key: 'attempt.initialGrant', label: '首访赠送', value: '1 次', type: 'integer', ownership: '运营锁定', status: '源文档已确认' },
        { key: 'attempt.consumeOnStart', label: '进入即消耗', value: 'true', type: 'boolean', ownership: '平台固定', status: '源文档已确认' },
        { key: 'attempt.refundOnFailure', label: '失败返还', value: 'false', type: 'boolean', ownership: '平台固定', status: '源文档已确认' },
        { key: 'round.pauseEnabled', label: '暂停', value: 'false', type: 'boolean', ownership: '平台固定', status: '源文档已确认' },
        { key: 'round.warningThreshold', label: '临期警告', value: '剩余 10 秒', type: 'duration', ownership: '智能配置', status: '源文档已确认' },
      ],
    },
    {
      name: '任务、奖励与风险',
      summary: '奖励必须绑定真实库存；风险结果优先于奖励展示，任何异常都不能伪装成成功。',
      fields: [
        { key: 'reward.perLevel', label: '通关奖励', value: '抽奖机会 ×1', type: 'reference', ownership: '运营锁定', status: '源文档已确认' },
        { key: 'reward.milestones', label: '里程碑', value: '第 3、7 关消费券', type: 'reference', ownership: '运营锁定', status: '源文档已确认' },
        { key: 'task.preCompletion', label: '通关前任务', value: '签到 + 好友助力', type: 'reference', ownership: '运营锁定', status: '源文档已确认' },
        { key: 'task.postCompletion', label: '通关后任务', value: '邀请好友访问得抽奖机会', type: 'reference', ownership: '运营锁定', status: '源文档已确认' },
        { key: 'risk.policyRef', label: '风险策略', value: '外部风险服务引用', type: 'reference', ownership: '平台固定', status: '待接入核验', constraint: '未接入不得发奖' },
      ],
    },
  ],
  states: [
    { state: 'loading', trigger: '关卡资源加载超过 300ms', behavior: '展示加载态，计时尚未开始', next: 'countdown / load_error' },
    { state: 'countdown', trigger: '资源与热区校验通过', behavior: '3-2-1 后开始计时', next: 'playing' },
    { state: 'playing', trigger: '用户进入关卡', behavior: '正确命中标记目标；错误命中展示红色 X 1 秒', next: 'success / timeout / exit_confirm' },
    { state: 'success', trigger: '全部目标找到', behavior: '先发放抽奖机会，命中里程碑再发券；2 秒后进入结果页', next: 'next_level / task_anchor' },
    { state: 'failed', trigger: '超时、确认退出或进程被杀', behavior: '不返还次数；有余量则重试，否则去任务区获取次数', next: 'retry / task_anchor' },
    { state: 'risk_blocked', trigger: '命中风控或资格不可用', behavior: '只展示标题与稍后再试，不展示任务、奖品和榜单', next: 'end' },
  ],
  tasks: [
    { phase: '通关前', task: '每日签到', reward: '挑战机会 +2', quota: '每天 1 次', reset: '每日 00:00' },
    { phase: '通关前', task: '好友助力', reward: '每位好友挑战机会 +2', quota: '每天最多 10 位', reset: '每日 00:00' },
    { phase: '全通后', task: '邀请好友访问', reward: '每位好友抽奖机会 +1', quota: '每天最多 10 位', reset: '每日 00:00' },
  ],
  contract: {
    inputs: ['scene_asset_refs', 'hotspot_manifest', 'task_policy_ref', 'reward_policy_ref', 'risk_policy_ref'],
    outputs: ['attempt_ledger', 'level_progress', 'reward_receipt', 'activity_ledger'],
    events: ['gameplay.viewed', 'level.started', 'target.found', 'target.missed', 'level.completed', 'level.failed', 'attempt.granted', 'reward.granted', 'share.returned'],
    requiredArguments: ['presetId', 'stageCount', 'stages[].targetCount', 'round.durationSeconds', 'sceneAssetRefs', 'hotspotManifest', 'attemptPolicy'],
    optionalArguments: ['milestoneRewards', 'taskPolicyRef', 'lotteryPolicyRef', 'sharePolicyRef', 'leaderboardRef', 'audioRef'],
  },
  dependencies: [
    { name: '任务系统', role: '签到、好友助力、邀请回流与每日额度', required: true, status: '待接入核验' },
    { name: '奖励/券服务', role: '第 3、7 关奖励发放与活动明细', required: true, status: '待接入核验' },
    { name: '抽奖能力', role: '通关和全通后邀请产生抽奖机会', required: true, status: '源文档已确认' },
    { name: '风险服务', role: '参与资格、助力与奖励链路实时拦截', required: true, status: '待接入核验' },
    { name: '分享能力', role: '好友助力与邀请访问回流', required: true, status: '源文档已确认' },
    { name: '榜单/商品 Feed', role: '活动首页底部内容承接', required: false, status: '源文档已确认' },
  ],
  assetSlots: [
    { slot: 'home.hero', count: '1 组', requirement: '标题、活动时间、鹊桥进度与主行动区；文字需保持真文字' },
    { slot: 'stage.scene', count: '7 张', requirement: '逐关场景图；每张必须附热点清单和安全区' },
    { slot: 'stage.target', count: '47 个（原文另标 49）', requirement: '逐关目标合计为 47；源文档总数口径存在矛盾，发布前必须确认' },
    { slot: 'feedback.correct', count: '1 套', requirement: '正确圈选、计数增加与目标消失/标记' },
    { slot: 'feedback.wrong', count: '1 套', requirement: '红色 X，持续 1 秒，不与正确反馈混淆' },
    { slot: 'result', count: '3 套', requirement: '普通成功、里程碑成功、失败；CTA 随剩余次数变化' },
    { slot: 'share', count: '3 种', requirement: '站内好友、口令复制、二维码保存' },
  ],
  measurement: [
    '所有入口携带渠道标识；任务邀请回流与普通分享回流必须分开',
    '逐关记录曝光、开始、成功、失败、退出与用户级通关耗时',
    '结果页按关卡和成功/失败状态记录 CTA 曝光与点击',
    '任务、抽奖、奖品、Feed 均记录曝光与点击 PV/UV',
    '奖品按商品 ID 实时观测实际发放与核销',
  ],
  acceptance: [
    '7 关热点数分别为 5/6/6/7/7/8/8，逐关合计 47；源文档另标 49，未确认前阻断发布',
    '首次引导每个 uid 在活动期内只出现一次',
    '进入关卡只扣 1 次；超时、主动退出、杀进程均不返还',
    '关卡成功发放 1 次抽奖；第 3、7 关奖励幂等，不可重复领取',
    '10 秒警告、错误反馈 1 秒、结果反馈 2 秒均可被自动化验证',
    '通关前助力与全通后邀请使用独立日额度，均在 00:00 重置',
    '风险兜底只保留标题和稍后再试，隐藏所有利益相关模块',
    '所有奖励必须返回可追踪 receipt；失败不得渲染为已到账',
  ],
  source: {
    documentUrl: 'https://bytedance.larkoffice.com/docx/Q9Esd0NW0ojx2Vxu4TycirMynzc',
    figmaUrl: 'https://www.figma.com/design/NJuTLKg2n5omaJaR05aQSA/七夕互动玩法-找茬?node-id=1204-120121',
    documentTitle: '七夕「搭建鹊桥」互动玩法',
    revision: '飞书 revision 10 · 2026-07-02 v2.0',
    verified: ['玩法主循环', '关卡数与目标数', '任务及每日额度', '奖励节点', '异常状态', '入口人群', '埋点口径'],
    openQuestions: ['逐关合计 47 与原文总数 49 的口径冲突', '任务系统技术接口', '风险策略 ID 与返回码', '券面额和券 ID', '抽奖概率与库存策略', '实验分组', '站内信接入', '正式 Runtime adapter'],
    artifacts: [
      { label: '人类可读说明', href: '/assets/gameplay-kits/qixi-magpie-hunt-2026/README.md', format: 'Markdown' },
      { label: '调用清单', href: '/assets/gameplay-kits/qixi-magpie-hunt-2026/manifest.json', format: 'JSON' },
    ],
  },
}
