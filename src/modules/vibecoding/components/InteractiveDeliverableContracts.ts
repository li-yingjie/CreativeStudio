export interface InteractiveDeliverableContract {
  id: string
  experience: string
  primaryAction: string
  completion: string
  states: readonly string[]
  unverified: readonly string[]
}

export const INTERACTIVE_DELIVERABLE_CONTRACTS: Record<string, InteractiveDeliverableContract> = {
  'DLV-ACG-001': {
    id: 'DLV-ACG-001',
    experience: '浏览游戏榜单并为喜欢的作品互动',
    primaryAction: '筛选游戏内容 → 打开作品 → 完成榜单互动',
    completion: '作品已浏览、互动已记录、新锐榜已查看',
    states: ['默认榜单', '分类筛选', '作品详情', '互动回写', '任务完成'],
    unverified: ['正式票数', '奖励权益', '每日频控'],
  },
  'DLV-ACG-002': {
    id: 'DLV-ACG-002',
    experience: '发现二次元内容并完成榜单参与',
    primaryAction: '切换内容分类 → 浏览作品 → 完成偏好互动',
    completion: '内容详情与任务进度同步更新',
    states: ['内容分类', '热门/新锐', '作品详情', '互动回写', '分享'],
    unverified: ['正式票数', '奖励权益', '每日频控'],
  },
  'DLV-XIA-001': {
    id: 'DLV-XIA-001',
    experience: '完成玩水任务并抽取夏装',
    primaryAction: '做任务得次数 → 抽夏装 → 点亮装备册',
    completion: '装备进度和兑换档位即时更新',
    states: ['任务未完成', '抽取结果', '装备册', '档位解锁'],
    unverified: ['正式库存', '线下核销'],
  },
  'DLV-XIA-002': {
    id: 'DLV-XIA-002',
    experience: '在阶段 B 交换重复夏装',
    primaryAction: '查看装备册 → 选择重复卡 → 赠送或求赠',
    completion: '交换状态回写任务并补充抽取次数',
    states: ['阶段 B', '赠送', '求赠', '交换完成'],
    unverified: ['好友关系', '真实消息发送'],
  },
  'DLV-XIA-003': {
    id: 'DLV-XIA-003',
    experience: '体验玩水线的完整活动长页',
    primaryAction: '做任务得次数 → 抽取集齐 → 浏览内容并完成奖励闭环',
    completion: '主玩法、内容承接与奖励档位形成闭环',
    states: ['抽取', '收集', '奖励', '任务', '内容承接'],
    unverified: ['正式奖品库存', '投稿审核'],
  },
  'DLV-XIA-009': {
    id: 'DLV-XIA-009',
    experience: '首次进入时三步理解玩法',
    primaryAction: '阅读玩法步骤 → 开始玩',
    completion: '关闭引导并获得首次体验次数',
    states: ['首次进入', '规则说明', '完成引导'],
    unverified: ['正式新手奖励'],
  },
  'DLV-XIA-011': {
    id: 'DLV-XIA-011',
    experience: '抽夜食卡、集卡并解锁三档夜食券',
    primaryAction: '做任务得次数 → 抽夜食 → 集齐 2/4/7 种 → 领取',
    completion: '9 种卡片、三档奖励与任务状态联动',
    states: ['抽卡', '新卡/重复卡', '图鉴三态', '奖励可领/已领'],
    unverified: ['真实券库存', '核销与履约'],
  },
  'DLV-XIA-012': {
    id: 'DLV-XIA-012',
    experience: '选择进入夜食会场的角色搭子',
    primaryAction: '选择角色 → 确认 → 进入会场',
    completion: '角色选择被确认并反馈下一步',
    states: ['未选择', '选中角色', '确认出发'],
    unverified: ['真实角色权益差异'],
  },
  'DLV-XIA-013': {
    id: 'DLV-XIA-013',
    experience: '完成一次夜食 AR 打卡',
    primaryAction: '识别场景 → 放置角色 → 拍照打卡',
    completion: '打卡成功并反馈抽卡次数',
    states: ['识别中', '可拍摄', '打卡成功'],
    unverified: ['真实相机权限', 'AR 模型识别'],
  },
  'DLV-GALA-001': {
    id: 'DLV-GALA-001',
    experience: '观看春晚直播并参与节目互动',
    primaryAction: '选择频道 → 播放直播 → 浏览节目单 → 参与抽奖',
    completion: '频道、关注、播放与抽奖状态闭环',
    states: ['直播频道', '播放/暂停', '节目单', '抽奖结果'],
    unverified: ['真实直播流', '奖品库存与履约'],
  },
  'DLV-GALA-002': {
    id: 'DLV-GALA-002',
    experience: '浏览节目盛典完整长页',
    primaryAction: '看直播 → 看节目 → 参与互动 → 投稿 → 回放',
    completion: '直播、内容、互动和结束态入口可连续体验',
    states: ['直播', '节目单', '互动', '投稿', '历年回放'],
    unverified: ['真实直播流', '投稿发布', '奖品履约'],
  },
  'DLV-EVN-001': {
    id: 'DLV-EVN-001',
    experience: '完成任务后进行单抽或十连并点亮图鉴',
    primaryAction: '做任务得次数 → 抽卡 → 收入图鉴 → 分享',
    completion: '次数、抽取结果、图鉴和分享状态联动',
    states: ['卡池', '单抽/十连', '抽卡结果', '图鉴', '分享'],
    unverified: ['正式概率', '保底与库存'],
  },
  'DLV-EVN-002': {
    id: 'DLV-EVN-002',
    experience: '从主会场任务态补充抽卡次数',
    primaryAction: '查看任务 → 完成宣发行为 → 领取次数 → 返回抽卡',
    completion: '任务完成后次数账本即时更新',
    states: ['任务展开', '进行中', '已完成', '次数到账'],
    unverified: ['真实站内行为校验', '反作弊阈值'],
  },
  'DLV-EVN-016': {
    id: 'DLV-EVN-016',
    experience: '集中管理任务与次数领取状态',
    primaryAction: '逐项完成任务 → 领取次数 → 查看图鉴进度',
    completion: '任务页显示已完成数量和累计次数',
    states: ['任务列表', '任务完成', '次数到账', '图鉴进度'],
    unverified: ['真实站内行为校验', '反作弊阈值'],
  },
}

export function interactiveDeliverableContract(id: string) {
  return INTERACTIVE_DELIVERABLE_CONTRACTS[id]
}
