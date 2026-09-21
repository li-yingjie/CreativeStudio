import type { GameUiGeneratedSpec, GameUiScreenKind } from './GameUiModel'

export interface GameUiScreenSuggestion extends GameUiGeneratedSpec {
  why: string
}

type Rule = {
  match: RegExp
  build: (action: string) => GameUiScreenSuggestion[]
}

const s = (
  id: string,
  kind: GameUiScreenKind,
  label: string,
  note: string,
  why: string,
  title: string,
  body: string,
  primaryAction: string,
  extra?: { secondaryAction?: string; rows?: string[] },
): GameUiScreenSuggestion => ({
  id,
  kind,
  label,
  note,
  why,
  title,
  body,
  primaryAction,
  secondaryAction: extra?.secondaryAction,
  rows: extra?.rows,
})

const RULES: Rule[] = [
  {
    match: /排行|榜|奖杯|排名/,
    build: () => [
      s(
        'rank-list',
        'list',
        '排行榜',
        '本周守卫名次',
        '点了排行榜就该进名次页，这是缺的那一环',
        '本周守卫榜',
        '按本周守住灯塔的评分排名，前三有额外金币。',
        '返回开始页',
        { rows: ['01  月隐守夜人  986', '02  林间哨  942', '03  纸境旅人  901'] },
      ),
      s(
        'rank-mine',
        'result',
        '我的战绩',
        '个人成绩卡',
        '榜单之外再给一张自己的成绩，方便分享',
        '你的最好成绩',
        '最高守住 3 波，评分 86。再高一点就能进前十。',
        '再守一局',
        { secondaryAction: '返回' },
      ),
    ],
  },
  {
    match: /邮件|信箱|消息|信件/,
    build: () => [
      s(
        'mail-list',
        'list',
        '邮件',
        '系统与活动信',
        '邮件入口按下去要能看到信，不能是空按钮',
        '信件',
        '未读的系统和活动通知都在这里。',
        '全部已读',
        { rows: ['守卫补给已送达', '本周榜结算提醒', '新的试炼关即将开放'] },
      ),
      s(
        'mail-detail',
        'overlay',
        '信件详情',
        '单封弹层',
        '点开一封信用弹层承接，不用整屏跳走',
        '守卫补给已送达',
        '今晚的补给里有 80 金币和一张冰霜塔图纸，记得去背包领。',
        '领取',
        { secondaryAction: '稍后' },
      ),
    ],
  },
  {
    match: /商店|商城|购买|兑换/,
    build: (action) => [
      s(
        'shop-list',
        'list',
        '商店',
        '金币换塔与道具',
        `${action}之后要有货架，否则入口是空的`,
        '守夜商店',
        '用本局金币换下一局能带进去的塔和道具。',
        '返回',
        { rows: ['连射塔图纸  120', '冰霜塔图纸  160', '急救灯油  80'] },
      ),
    ],
  },
  {
    match: /设置|选项|音效|画质/,
    build: () => [
      s(
        'settings',
        'form',
        '设置',
        '音画与操作',
        '设置入口要落到可改的项，不要只弹一句提示',
        '对局设置',
        '这些选项只影响本机，不会改关卡数值。',
        '保存',
        { rows: ['音乐', '音效', '伤害数字'] },
      ),
    ],
  },
  {
    match: /分享|邀请|转发/,
    build: () => [
      s(
        'share-sheet',
        'overlay',
        '分享面板',
        '海报与链接',
        '分享用底部弹层，整屏跳走会断掉回访',
        '把这次守卫发下去',
        '生成一张成绩卡，发给同行的人看看谁守得更久。',
        '保存图片',
        { secondaryAction: '复制链接' },
      ),
    ],
  },
  {
    match: /暂停/,
    build: () => [
      s(
        'pause-extra',
        'overlay',
        '暂停确认',
        '对局暂停层',
        '暂停已经有一帧，通常连到已有的暂停态即可',
        '对局已暂停',
        '塔和敌人都停住了，随时可以继续守夜。',
        '继续守夜',
        { secondaryAction: '返回开始页' },
      ),
    ],
  },
]

const FALLBACK: GameUiScreenSuggestion[] = [
  s(
    'generic-overlay',
    'overlay',
    '结果弹层',
    '压在当前页上',
    '压在当前页上的确认 / 结果卡片',
    '操作完成',
    '这一步的结果先落在这里，文案和按钮都能在画布上改。',
    '知道了',
    { secondaryAction: '再看看' },
  ),
  s(
    'generic-list',
    'list',
    '列表页',
    '清单与条目',
    '任务、榜单、商店这类清单',
    '接下来能做什么',
    '把后续可做的事列成清单，逐条可点。',
    '返回',
    { rows: ['第一件事', '第二件事', '第三件事'] },
  ),
  s(
    'generic-result',
    'result',
    '结果页',
    '整屏结果',
    '整屏结果，带一个主行动',
    '操作成功',
    '整屏结果页，用来承接这次操作之后的主行动。',
    '继续下一步',
  ),
]

const NAV_PATTERN = /^(返回|后退|关闭|取消|继续|继续守夜|继续游戏|back|close|×|✕)$/i
const BATTLE_PATTERN = /^(开始游戏|开战|进入对局|挑战|再守一局|再来一局)$/i

export interface GameUiSuggestionResult {
  shouldGenerate: boolean
  reason: string
  suggestions: GameUiScreenSuggestion[]
  fallback: boolean
  preferExistingId?: string
}

export function suggestGameUiScreens(label: string): GameUiSuggestionResult {
  const action = label.replace(/[▶▷►»›→>\s]+$/, '').trim() || '这个按钮'

  if (NAV_PATTERN.test(action)) {
    return {
      shouldGenerate: false,
      reason: `「${action}」是导航，应该连回已有的帧，而不是补一屏新的。`,
      suggestions: [],
      fallback: false,
    }
  }

  if (BATTLE_PATTERN.test(action)) {
    return {
      shouldGenerate: false,
      reason: `「${action}」应对局态，连到已有的对局帧。`,
      suggestions: [],
      fallback: false,
      preferExistingId: 'battle',
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
