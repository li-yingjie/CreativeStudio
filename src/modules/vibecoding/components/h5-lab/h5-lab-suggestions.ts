import type { H5LabScreenKind } from './h5-lab-prototype'

/* ─── 按热点语义给补屏建议 ───
 *
 * 之前不管选中什么，补一屏都只给「结果弹层 / 结果页 / 填写页 / 列表页」这四个
 * 空壳，脱离页面实际。这里按热点自己的文案判断它大概是什么动作（测一测 / 领任务 /
 * 解锁 / 报名 / 抽奖 / 分享 …），给 2–3 条具体的下一屏建议，每条都带上「为什么是
 * 它」和一套贴着这个动作写的文案，生成出来就是能看的一屏，而不是占位符。
 *
 * 判断只看按钮文案，不猜活动规则 —— 猜多了反而不准。匹配不上就退回通用四件套。
 */

export interface H5LabScreenSuggestion {
  id: string
  kind: H5LabScreenKind
  /** 建议名，同时是生成出来那一帧的标题。 */
  label: string
  /** 一句话说明为什么建议它 —— 交互灵感，不是废话。 */
  why: string
  title: string
  body: string
  primaryAction: string
  secondaryAction?: string
  rows: string[]
  /** 列表行尾的小动作；不给就用默认的「去完成」，给空串就不显示。 */
  rowAction?: string
}

type Rule = {
  /** 命中按钮文案里的这些词。 */
  match: RegExp
  /** 这个动作叫什么，用来写文案。 */
  build: (action: string) => H5LabScreenSuggestion[]
}

const s = (
  id: string,
  kind: H5LabScreenKind,
  label: string,
  why: string,
  title: string,
  body: string,
  primaryAction: string,
  extra?: { secondaryAction?: string; rows?: string[]; rowAction?: string },
): H5LabScreenSuggestion => ({
  id,
  kind,
  label,
  why,
  title,
  body,
  primaryAction,
  secondaryAction: extra?.secondaryAction,
  rows: extra?.rows ?? [],
  rowAction: extra?.rowAction,
})

const RULES: Rule[] = [
  {
    // 测一测 / 人格测试 / 答题
    match: /测试|测一测|人格|答题|问卷|测评/,
    build: () => [
      s(
        'quiz-questions',
        'list',
        '测试答题页',
        '点了"测试"总得先答题，这一屏是缺的那一环',
        '选出最像你的那一个',
        '一共 5 题，凭直觉选就好，答完给你一个冬日人格。',
        '下一题',
        {
          rows: [
            '雪天出门，你第一个想到的是？',
            '同行的人临时改路线，你会？',
            '看到没走过的岔路，你会？',
          ],
          rowAction: '选这个',
        },
      ),
      s(
        'quiz-result',
        'result',
        '人格结果页',
        '答完要有个结果承接，也是最容易被分享的一屏',
        '你的冬日人格是「野雪先锋」',
        '你不太爱按路书走，雪一厚就想往没脚印的地方去。适合你的是长线穿越和野雪场。',
        '看看适合我的路线',
        { secondaryAction: '重新测一次' },
      ),
      s(
        'quiz-share',
        'overlay',
        '结果分享弹层',
        '结果页的传播出口，压在结果上更顺手',
        '把你的冬日人格发出去',
        '生成一张人格卡，发给同行的朋友，看看你们能不能凑一队。',
        '保存图片',
        { secondaryAction: '复制链接' },
      ),
    ],
  },
  {
    // 领取任务 / 做任务
    match: /领取|接任务|任务|做任务|打卡/,
    build: (action) => [
      s(
        'task-taken',
        'overlay',
        '领取成功弹层',
        '领完先给个确认，用户才知道任务已经在自己名下',
        '任务已领取',
        '完成后回来这里领奖励，任务有效期到活动结束。',
        '去完成',
        { secondaryAction: '稍后再说' },
      ),
      s(
        'task-list',
        'list',
        '我的任务清单',
        `${action}之后要有地方看进度，否则领了就断了`,
        '我的任务',
        '已领取的任务都在这里，完成一条领一次奖励。',
        '全部去完成',
        { rows: ['雪场打卡一次', '发布一条雪地视频', '邀请一位同行的朋友'], rowAction: '去完成' },
      ),
    ],
  },
  {
    // 解锁 / 开启
    match: /解锁|开启|激活|立即/,
    build: (action) => [
      s(
        'unlock-confirm',
        'overlay',
        '解锁确认弹层',
        '解锁通常要花掉点什么，先确认一次比较稳',
        `确认${action}？`,
        '解锁后这一档内容对你永久开放，消耗的权益不退回。',
        '确认解锁',
        { secondaryAction: '再想想' },
      ),
      s(
        'unlock-done',
        'result',
        '解锁成功页',
        '解锁完要立刻把拿到的东西摆出来',
        '解锁成功',
        '新的内容已经在你的账户里，现在就能用。',
        '马上去看',
      ),
      s(
        'unlock-rights',
        'list',
        '权益说明页',
        '解锁前的疑虑一般在"我能得到什么"，单开一屏讲清楚',
        '解锁后你能拿到',
        '这一档包含下面这些权益，活动期内都有效。',
        '知道了',
        { rows: ['全部路线详情', '限定人格卡面', '同行者匹配入口'], rowAction: '' },
      ),
    ],
  },
  {
    // 报名 / 参与 / 预约
    match: /报名|参与|加入|预约|申请/,
    build: (action) => [
      s(
        'signup-form',
        'form',
        '报名填写页',
        `${action}要收信息，这一屏是必经的`,
        '填一下就能报名',
        '信息只用于本次活动的行程联系，不会外传。',
        '提交报名',
        { rows: ['姓名', '手机号', '想去的目的地', '出发日期'] },
      ),
      s(
        'signup-done',
        'result',
        '报名成功页',
        '提交完要有回执，并告诉用户下一步等什么',
        '报名成功',
        '我们会在 3 个工作日内电话联系你确认行程，留意来电。',
        '查看行程安排',
        { secondaryAction: '返回首页' },
      ),
    ],
  },
  {
    // 抽卡 / 抽奖
    match: /抽|摇一摇|开箱|翻牌/,
    build: () => [
      s(
        'draw-result',
        'overlay',
        '抽中结果弹层',
        '抽的即时反馈必须压在原页上，跳走会断掉连抽的节奏',
        '恭喜抽中「雪原穿越日记」',
        '卡片已存进你的收藏，集齐一套可以兑换实物。',
        '再抽一次',
        { secondaryAction: '看看我的收藏' },
      ),
      s(
        'draw-collection',
        'list',
        '我的收藏页',
        '抽到的东西要有地方沉淀，也是回访的理由',
        '我的收藏',
        '已经收到的卡片，灰色的还没抽到。',
        '继续抽',
        { rows: ['雪原穿越日记 ×2', '温泉小屋 ×1', '野雪先锋 · 未获得'], rowAction: '' },
      ),
    ],
  },
  {
    // 兑换 / 领奖
    match: /兑换|兑奖|领奖|换购/,
    build: (action) => [
      s(
        'redeem-confirm',
        'overlay',
        '兑换确认弹层',
        '兑换是不可逆的，确认一次能挡掉大部分误触',
        `确认${action}？`,
        '兑换后将扣除对应数量的卡片，不支持撤回。',
        '确认兑换',
        { secondaryAction: '取消' },
      ),
      s(
        'redeem-done',
        'result',
        '兑换成功页',
        '兑完要告诉用户东西在哪、什么时候到',
        '兑换成功',
        '奖品会在 7 个工作日内寄出，物流信息可在"我的奖品"里查。',
        '查看我的奖品',
      ),
    ],
  },
  {
    // 分享 / 邀请
    match: /分享|邀请|转发|叫上/,
    build: () => [
      s(
        'share-sheet',
        'overlay',
        '分享面板',
        '分享的标准形态就是从底部升起的面板，不该整屏跳走',
        '分享到',
        '选一个渠道，或者保存图片自己发。',
        '保存图片',
        { secondaryAction: '复制链接' },
      ),
      s(
        'share-poster',
        'result',
        '邀请海报页',
        '带专属码的海报比纯链接更容易被转发',
        '你的专属邀请海报',
        '朋友扫码进来算你邀请的，满 3 人可以多抽一次。',
        '保存海报',
      ),
    ],
  },
  {
    // 攻略 / 详情 / 查看更多
    match: /攻略|指南|详情|查看|更多|了解/,
    build: (action) => [
      s(
        'detail-page',
        'result',
        '内容详情页',
        `${action}后要有完整内容，否则这个入口是空的`,
        '雪原穿越 · 完整路线',
        '从进山到扎营的全程安排、装备清单和注意事项都在这里。',
        '按这条路线报名',
        { secondaryAction: '收藏' },
      ),
      s(
        'detail-list',
        'list',
        '内容列表页',
        '一个入口对应多条内容时，先给列表再进详情',
        '全部路线',
        '按难度排好了，点进去看每条的详细安排。',
        '看看全部',
        { rows: ['新手友好 · 松花湖', '进阶 · 长白山北坡', '硬核 · 阿勒泰野雪'], rowAction: '看详情' },
      ),
    ],
  },
  {
    // 规则 / 说明
    match: /规则|说明|须知|条款/,
    build: () => [
      s(
        'rules-page',
        'list',
        '活动规则页',
        '规则是合规必需项，通常单开一屏而不是弹层',
        '活动规则',
        '参与前请阅读以下条款，最终解释权归主办方所有。',
        '我知道了',
        {
          rows: [
            '活动时间：2月28日 - 2月9日',
            '参与方式：完成任务即可领取奖励',
            '奖励发放：活动结束后 7 个工作日内',
          ],
          rowAction: '',
        },
      ),
    ],
  },
  {
    // 提交 / 确认 / 保存
    match: /提交|确认|保存|完成/,
    build: (action) => [
      s(
        'submit-done',
        'overlay',
        '提交成功弹层',
        '提交类动作最需要的就是一个明确回执',
        '提交成功',
        '内容已经收到，审核通过后会通知你。',
        '知道了',
      ),
      s(
        'submit-fail',
        'overlay',
        '提交失败弹层',
        '失败态常被漏掉，补上才是完整的交互',
        `${action}失败`,
        '网络开小差了，你填的内容还在，可以直接重试。',
        '重试',
        { secondaryAction: '返回修改' },
      ),
    ],
  },
]

/** 通用四件套 —— 语义匹配不上时的兜底。 */
const FALLBACK: H5LabScreenSuggestion[] = [
  s(
    'generic-overlay',
    'overlay',
    '结果弹层',
    '压在当前页上的确认 / 结果卡片',
    '操作完成',
    '这一步的结果先落在这里，文案和按钮都能在画布上改。',
    '知道了',
    { secondaryAction: '再看看' },
  ),
  s(
    'generic-result',
    'result',
    '结果页',
    '整屏结果，带一个主行动',
    '操作成功',
    '整屏结果页，用来承接这次操作之后的主行动。',
    '继续下一步',
  ),
  s(
    'generic-form',
    'form',
    '填写页',
    '需要用户补齐信息时用',
    '完善信息',
    '把这次操作需要用户补齐的信息列在这里。',
    '提交',
    { rows: ['姓名', '手机号', '备注'] },
  ),
  s(
    'generic-list',
    'list',
    '列表页',
    '任务、奖励、榜单这类清单',
    '接下来能做什么',
    '把后续可做的事列成清单，逐条可点。',
    '全部完成',
    { rows: ['第一件事', '第二件事', '第三件事'], rowAction: '去完成' },
  ),
]

/** 返回 / 关闭这类导航热点，补新屏是错的 —— 它们该连回已有的帧。 */
const NAV_PATTERN = /^(返回|后退|关闭|取消|back|close|×|✕)$/i

export interface H5LabSuggestionResult {
  /** 这个热点该不该补新屏；导航类返回 false。 */
  shouldGenerate: boolean
  /** 给用户看的一句判断依据。 */
  reason: string
  suggestions: H5LabScreenSuggestion[]
  /** 是否走的兜底（没匹配上语义）。 */
  fallback: boolean
}

export function suggestH5LabScreens(label: string): H5LabSuggestionResult {
  const action = label.replace(/[▶▷►»›→>\s]+$/, '').trim() || '这个按钮'

  if (NAV_PATTERN.test(action)) {
    return {
      shouldGenerate: false,
      reason: `「${action}」是导航，应该连回已有的帧，而不是补一屏新的。`,
      suggestions: [],
      fallback: false,
    }
  }

  for (const rule of RULES) {
    if (!rule.match.test(action)) continue
    return {
      shouldGenerate: true,
      reason: `按「${action}」的语义，接下来常见的是：`,
      suggestions: rule.build(action),
      fallback: false,
    }
  }

  return {
    shouldGenerate: true,
    reason: `没认出「${action}」是什么动作，先从通用界面里挑一个：`,
    suggestions: FALLBACK,
    fallback: true,
  }
}

/** 通用四件套也给外面用（非热点元素手动加交互时）。 */
export const H5_LAB_FALLBACK_SUGGESTIONS = FALLBACK
