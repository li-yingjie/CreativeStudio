import type { XiahuaGameplay } from './XiahuaGameplay'
import type { XiahuaOverrides } from './XiahuaEditPanel'
import type { PlanDoc } from './XiahuaPlanDoc'
import type { ActivityPreset } from './ActivityPreset'

/* ─── 「这夏夯爆了」0 → 1 生成脚本 ───
 * 真实的搭建顺序，每个大阶段之间是要人点确认的卡点，不是一路自动播完：
 *
 *   ① 说需求 / 传文档
 *   ② 解析成结构化方案 → 右侧出文档，可改可确认      ← 卡点 1
 *   ③ 页面框架（只有版式与热区，没有视觉）→ 可调整   ← 卡点 2
 *   ④ 在框架占位上把核心玩法跑通 → 可试玩可调        ← 卡点 3
 *   ⑤ 按框架 + 玩法整理素材清单 → 可增删              ← 卡点 4
 *   ⑥ 先出一版风格参考定调 → 定了再批量出            ← 卡点 5
 *   ⑦ 分批生成素材，完成后进入素材库逐项查看           ← 卡点 6
 *   ⑧ 素材落进框架，生成正式 UI 界面
 *   ⑨ 在 UI 上多轮调整
 *
 * 对话按正常聊天呈现：过程走 think（连续同 group 的合并成一个思考块，
 * 完成后自动折叠），结论走 ai。每步还可能切右侧产物、推进搭建阶段、真改状态。 */

/** 右侧此刻展示什么产物。none = 还只是在聊需求，右侧不开。 */
export type BuildPhase =
  | 'none'
  | 'doc'
  /** 页面框架 —— 版式与热区，无视觉 */
  | 'wireframe'
  /** 玩法 —— 还是框架占位，但抽卡/集卡/兑奖已经能跑 */
  | 'gameplay'
  /** 素材清单 —— 要生成哪些素材，先对齐清单再动手 */
  | 'assetList'
  | 'assets'
  /** 模板复刻：素材与玩法的替换清单 */
  | 'diff'
  /** 正式 UI 界面 */
  | 'final'

/** 预览的搭建阶段 —— 决定当前画面已经长出哪些部分。 */
export type BuildStage =
  | 'empty'
  | 'kv'
  | 'title'
  | 'actions'
  | 'collect'
  | 'cardArt'
  | 'sections'
  | 'playable'

export const BUILD_ORDER: BuildStage[] = [
  'empty',
  'kv',
  'title',
  'actions',
  'collect',
  'cardArt',
  'sections',
  'playable',
]

/** 阶段是否已到达（预览按此逐层显示）。 */
export function stageReached(current: BuildStage, need: BuildStage): boolean {
  return BUILD_ORDER.indexOf(current) >= BUILD_ORDER.indexOf(need)
}

/** 步骤对状态的真实改动。 */
export type BuildMutation =
  | { type: 'gameplay'; patch: (g: XiahuaGameplay) => XiahuaGameplay }
  | { type: 'overrides'; patch: (o: XiahuaOverrides) => XiahuaOverrides }
  | { type: 'plan'; patch: (p: PlanDoc) => PlanDoc }
  /** 模板复刻：直接改活动模板（换背景 / 换形象 / 换素材 / 换主题色） */
  | { type: 'preset'; patch: (p: ActivityPreset) => ActivityPreset }
  | {
      type: 'picks'
      patch: (p: Record<string, number>) => Record<string, number>
      /** 同时改「每样有几版」——重新生成会多出一版 */
      versions?: (v: Record<string, number>) => Record<string, number>
    }

/** 卡点：播放停下来等人点。confirm 走主路径，alt 走「我要改」的支路。 */
export interface BuildGate {
  confirm: string
  /** 点确认后跳到哪个 step id（默认下一步） */
  confirmTo?: string
  alt?: string
  altTo?: string
  /** 选择题式卡点：几个选项各自跳不同分支（选玩法这种，一句话说不清差别）。
   *  给了 choices 就不再渲染 confirm / alt。最后一项可以是自由输入。 */
  choices?: {
    title: string
    desc: string
    tag?: string
    to: string
    /** 选它展开输入框，用户自己写；写的内容就是发出去的那条消息 */
    input?: boolean
    placeholder?: string
  }[]
}

import type { BuildCard } from './XiahuaChatUI'
export type { BuildCard }

export interface BuildStep {
  id: string
  /** 对话里的呈现形态 */
  view:
    | { kind: 'doc'; text?: string }
    | { kind: 'user'; text: string }
    /** 结论 —— 正常的一条回复，可挂产物卡片 */
    | { kind: 'ai'; text: string; cards?: BuildCard[]; image?: { src: string; caption?: string } }
    /** 过程 —— 连续同 group 的合并成一个可折叠思考块 */
    | { kind: 'think'; group: string; title: string; lines: string[] }
  /** 右侧切到哪个产物 */
  phase?: BuildPhase
  /** 推进到哪个搭建阶段 */
  stage?: BuildStage
  /** 素材板已产出到第几批 */
  assetBatch?: number
  /** 模板复刻：替换清单已执行到第几批 */
  replaceBatch?: number
  /** 已选定并接入的主玩法（右侧玩法面板据此高亮） */
  gameplayPick?: string
  /** 停下来等人确认 */
  gate?: BuildGate
  /** 真实状态改动 */
  mutate?: BuildMutation
  /** 这一步显示多久后自动进入下一步（ms） */
  hold: number
}

export const XIAHUA_BUILD_SCRIPT: BuildStep[] = [
  /* ═══ ① 只是在聊需求 —— 右侧不开 ═══
     对话从用户开口开始：AI 不会在没人说话时先发言。 */
  {
    id: 'ask-1',
    view: {
      kind: 'user',
      text: '夏天想做个夜宵活动，让用户每天来抽卡集卡，集齐了能兑券和红包',
    },
    phase: 'none',
    hold: 1000,
  },
  {
    id: 'clarify',
    view: {
      kind: 'ai',
      text: '这个方向能做。有几件事想先跟你对一下：\n\n一是集多少种算集齐——种类少了没意思，多了用户攒不动；二是抽卡的机会从哪来，是每天白送还是要做点什么；三是集齐之后给什么，券、红包还是实物。\n\n有现成的策划文档就直接丢给我，我照着读。',
    },
    hold: 2400,
  },
  { id: 'doc', view: { kind: 'doc', text: '都在这里面了，你先读一遍' }, hold: 1100 },

  /* ═══ ② 读完给方案 —— 第一个产物，右侧这时才打开 ═══ */
  {
    id: 'parse-1',
    view: {
      kind: 'think',
      group: 'parse',
      title: '读需求和文档',
      lines: [
        '文档 12 个小节。前面三分之一是项目定位、数据指标和几个竞品参考——这些跟页面长什么样没关系，但得记下来，别当没读过。',
        '数据指标那栏一堆 xx 没填（核销 xx 万单、主话题 xx 亿），是常见的待补，先标出来不卡搭建。',
        '真正要落地的东西散在「活动形式」下面：内容呈现、用户参与、激励形式、页面展示几个小标题，得一条条挑出来。',
      ],
    },
    hold: 1800,
  },
  {
    id: 'parse-2',
    view: {
      kind: 'think',
      group: 'parse',
      title: '读需求和文档',
      lines: [
        '挑出来是三个候选：集美食卡兑奖励、接金豆小游戏、投稿任务体系。用户刚才那句话指的是第一个。',
        '集卡这条最完整：9 种夜食卡，集齐 2 / 4 / 7 / 9 种分别兑 2元券、5元券、43元券包、小马黄金转运珠。门槛卡在 2 种就有第一档，第一天大概率能摸到，不至于劝退。',
        '抽卡机会散在两处写的，凑起来是四个来源：每天首次进入、发投稿、送朋友、逛商家。都要用户动一下，不是白送，节奏合理。',
        '时间不是一个档期，是三个节点：预热放低门槛、主推全量开任务、收官清库存。这个会影响页面上要不要做倒计时。',
        '倒推下来要做 5 个页面：主会场、抽到卡的展示页、卡册、兑奖弹窗、规则。',
      ],
    },
    hold: 2400,
  },
  {
    id: 'parsed',
    view: {
      kind: 'ai',
      text: '读完了，方案在右侧。我按三层拆的：\n\n一是背景——项目定位、数据指标、竞品参考，记下来了但不决定页面长什么样；二是能落地的——三个候选玩法、卡池、奖励档位、抽卡机会来源、要做的 5 个页面，这些是搭建依据；三是待确认——文档里 xx 的占位、券面额度、收官的兑换截止时间。\n\n有两点想跟你对一下：接金豆我先留着当抽卡次数的补充来源；投稿任务体系依赖内容侧排期，建议放第二阶段。字段都能直接改。',
      cards: [
        { type: 'doc', badge: '文档', title: '活动方案', desc: '点击查看解析结果' },
      ],
    },
    phase: 'doc',
    gate: {
      confirm: '',
      choices: [
        {
          title: '生成页面框架',
          desc: '先把 5 个页面的版式和热区搭出来，再往上接玩法',
          to: 'ok-plan',
        },
        {
          title: '先定核心玩法',
          desc: '玩法定了再搭页面 —— 框架和玩法一起出，少一轮来回',
          to: 'gp-early',
        },
      ],
    },
    hold: 0,
  },

  /* ── 跳着来：先把玩法定下来，框架和玩法一起出 ── */
  {
    id: 'gp-early',
    view: { kind: 'user', text: '先定核心玩法' },
    hold: 900,
  },
  {
    id: 'gp-early-ask',
    view: {
      kind: 'ai',
      text: '行，那先定玩法。文档里三个候选不是同一套东西 —— 选哪个决定要做哪些页面、出哪些素材，接错了返工的是整条链路。',
    },
    gate: {
      confirm: '',
      choices: [
        {
          title: '集卡兑奖',
          tag: '文档主线',
          desc: '抽卡 → 集卡 → 解锁档位 → 兑奖 · 5 个页面 / 18 张卡面',
          to: 'gp-early-pick',
        },
        {
          title: '接金豆小游戏',
          tag: '副玩法',
          desc: '玩一局 → 得金豆 → 兑券 · 2 个页面，但要做游戏本身',
          to: 'gp-early-pick',
        },
        {
          title: '投稿任务体系',
          tag: '依赖内容侧',
          desc: '发投稿 → 审核入池 → 按表现给奖 · 页面最轻，但要等排期',
          to: 'gp-early-pick',
        },
        {
          title: '',
          desc: '都不是的话，直接描述你想要的玩法',
          to: 'gp-early-pick',
          input: true,
          placeholder: '都不是的话，直接说你想要的玩法…',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'gp-early-pick',
    // 文案由刚才选中/写下的那句覆盖
    view: { kind: 'user', text: '集卡兑奖' },
    hold: 1000,
  },
  {
    id: 'gp-early-do',
    view: {
      kind: 'ai',
      text: '记下了。三套里只有集卡兑奖是这份文档的主线 —— 页面、卡池、奖励档位都写全了；另两套要么依赖内容侧排期，要么得先做个游戏出来。所以我按集卡这套往下搭，你要是选的另两套，等链路跑通再按它调，比空等排期实在。\n\n玩法要跑起来总得有页面，既然玩法已经定了，框架和玩法我一起出，省一轮来回。',
    },
    gate: { confirm: '生成页面框架并接入玩法', confirmTo: 'wf-e1' },
    hold: 0,
  },
  {
    id: 'wf-e1',
    view: {
      kind: 'think',
      group: 'wf-e',
      title: '按玩法搭框架',
      lines: [
        '玩法已经定了，页面就按它反推：抽卡要主按钮、集卡要卡槽和进度、兑奖要档位和弹窗、送卡要卡册 —— 5 个页面一个都不多。',
        '头图占一屏大半，标题压上面；抽卡按钮放头图正下方，卡册和奖品两个入口分列左右。',
        '集卡面板是核心：进度在左上、档位横排在右、卡槽一排铺下面，一屏内看全。下半屏是任务区、话题区和一个运营位。',
      ],
    },
    phase: 'wireframe',
    stage: 'sections',
    hold: 2400,
  },
  {
    id: 'wf-e2',
    view: {
      kind: 'think',
      group: 'wf-e',
      title: '把玩法接上去',
      lines: [
        '框架一出来就把玩法接上：占位框照样能点、能扣次数、能点亮卡槽，不用等素材。',
        '参数按方案里的来：9 种卡、2/4/7/9 四档奖励、初始 9 次机会；同种卡两张以上可以送朋友。',
      ],
    },
    phase: 'gameplay',
    gameplayPick: 'collect',
    hold: 2200,
  },
  {
    id: 'wf-e-done',
    view: {
      kind: 'ai',
      text: '框架和玩法一起出来了，5 个页面的版式、热区、交互都在，右侧的灰框现在就能试玩：点「抽卡」占位框会真的扣次数、出卡、点亮卡槽，集够种数档位会解锁。\n\n画面还是灰的 —— 先确认手感，手感定了再花时间出素材。',
      cards: [
        { type: 'play', badge: '框架 + 玩法', title: '页面框架 · 5 个页面 / 核心玩法可试玩', desc: '版式与热区已定 · 无视觉' },
      ],
    },
    stage: 'playable',
    gate: {
      confirm: '',
      choices: [
        { title: '生成素材清单', desc: '按框架槽位倒推要出哪些素材，建进素材库', to: 'ok-gp' },
        { title: '调整抽卡参数', desc: '重复卡太多、次数不够这类手感问题，现在改最省事', to: 'gp-adjust-ask' },
      ],
    },
    hold: 0,
  },

  {
    id: 'ok-plan',
    view: { kind: 'user', text: '生成页面框架' },
    hold: 900,
  },
  /* ═══ ③ 页面框架 —— 只有版式与热区，没有任何视觉 ═══ */
  {
    id: 'wf-1',
    view: {
      kind: 'think',
      group: 'wf',
      title: '搭页面框架',
      lines: [
        '先把每块内容摆到位，视觉后面再说——位置定错了，图再好看也得重做。',
        '头图占满一屏的大半，标题压在上面；阶段切换放头图里，不另占一行。',
      ],
    },
    phase: 'wireframe',
    stage: 'title',
    hold: 1700,
  },
  {
    id: 'wf-2',
    view: {
      kind: 'think',
      group: 'wf',
      title: '搭页面框架',
      lines: [
        '抽卡按钮放在头图正下方，一进来就能看见；剩余次数做成角标贴在按钮右上，不用另找地方。',
        '卡册和奖品两个入口放按钮左右，都是二级动作，不跟主按钮抢。',
        '集卡面板是这个活动的核心——进度写在左上，奖励档位横排在右，卡槽一排铺在下面，三样一屏内看全。',
      ],
    },
    stage: 'cardArt',
    hold: 2200,
  },
  {
    id: 'wf-3',
    view: {
      kind: 'think',
      group: 'wf',
      title: '搭页面框架',
      lines: [
        '下半屏放任务区、话题区和一个运营位，顺序按「用户看完集卡后最可能想干什么」排：先给攒次数的路子，再给内容看。',
      ],
    },
    stage: 'sections',
    hold: 1800,
  },
  {
    id: 'wf-done',
    view: {
      kind: 'ai',
      text: '页面框架出来了，5 个页面的版式和热区都在，右侧可以直接点和拖。现在没有任何视觉，图的位置先用占位框占着。\n\n结构上有想动的现在说最省事——素材还没生成，改了不用重做。',
      cards: [
        { type: 'wire', badge: '框架', title: '页面框架 · 5 个页面', desc: '版式与热区已定 · 无视觉' },
      ],
    },
    gate: { confirm: '选择核心玩法', confirmTo: 'ok-wf' },
    hold: 0,
  },

  {
    id: 'ok-wf',
    view: { kind: 'user', text: '选择核心玩法' },
    hold: 900,
  },
  /* ═══ ④ 先定主玩法，再用框架占位把它跑通（还是没有视觉） ═══
     文档里有三个候选，三套的链路 / 页面 / 素材都不一样，得先选再接。 */
  {
    id: 'gp-choose',
    view: {
      kind: 'ai',
      text: '页面框架已经定下来了，5 个页面的版式和热区先保留。接下来要从文档里的三个候选里选一个主玩法 —— 玩法一旦确定，参与链路、对应页面和后面要出的素材都会跟着它走。\n\n先在下面选一套；右侧继续保留现在的灰阶页面框架，等你选定后我再把对应的「活动玩法配置」接上去，在占位框上跑一遍。',
    },
    phase: 'gameplay',
    gate: {
      choices: [
        {
          title: '集卡兑奖',
          tag: '文档主线',
          desc: '抽卡 → 集卡 → 解锁档位 → 兑奖 · 5 个页面 / 18 张卡面',
          to: 'gp-pick-collect',
        },
        {
          title: '接金豆小游戏',
          tag: '副玩法',
          desc: '玩一局 → 得金豆 → 兑券 · 2 个页面，但要做游戏本身',
          to: 'gp-alt-bean',
        },
        {
          title: '投稿任务体系',
          tag: '依赖内容侧',
          desc: '发投稿 → 审核入池 → 按表现给奖 · 页面最轻，但要等排期',
          to: 'gp-alt-post',
        },
        {
          title: '',
          desc: '都不是的话，直接描述你想要的玩法',
          to: 'gp-pick-custom',
          input: true,
          placeholder: '都不是的话，直接说你想要的玩法…',
        },
      ],
      confirm: '',
    },
    hold: 0,
  },
  {
    id: 'gp-pick-custom',
    // 文案由用户在卡片里写的那句覆盖
    view: { kind: 'user', text: '我自己描述一套玩法' },
    hold: 1100,
  },
  {
    id: 'gp-pick-custom-do',
    view: {
      kind: 'ai',
      text: '记下了。你描述的这套本质上还是「反复回来 → 累积 → 到阈值兑换」，跟集卡是同一类结构 —— 集卡的卡池、档位、任务这三块能直接对上去，只是把「集齐几种」换成「攒够多少」。\n\n所以我先按集卡这套接上链路，跑通之后再按你说的把累积方式和文案改过来，比从零搭一套省一轮。',
    },
    phase: 'gameplay',
    gate: { confirm: '就这么办', confirmTo: 'gp-1' },
    hold: 0,
  },
  {
    id: 'gp-alt-bean',
    view: { kind: 'user', text: '主玩法用接金豆小游戏' },
    hold: 1000,
  },
  {
    id: 'gp-alt-bean-do',
    view: {
      kind: 'ai',
      text: '金豆这套能做，但它跟集卡是两条不同的链路：金豆是单局小游戏，玩一局给一次结算，页面只要游戏页和兑换页；集卡是长线累积，靠每天回来攒。\n\n拿它当主玩法的话，文档里的 9 种卡池、四档奖励、卡册这些就都用不上了，等于换一个活动。文档写的主线也是集卡，金豆是列在补充位置的。\n\n建议主玩法还是集卡，金豆接成副玩法当抽卡次数的来源 —— 两边的留存逻辑正好互补。',
    },
    phase: 'gameplay',
    gate: { confirm: '主玩法用集卡，金豆做副玩法', confirmTo: 'gp-1', alt: '就按金豆做', altTo: 'gp-1' },
    hold: 0,
  },
  {
    id: 'gp-alt-post',
    view: { kind: 'user', text: '主玩法用投稿任务体系' },
    hold: 1000,
  },
  {
    id: 'gp-alt-post-do',
    view: {
      kind: 'ai',
      text: '投稿任务这套页面最轻 —— 一个任务列表加一个奖励页就够了，但它的链路卡在活动之外：投稿要审核、要入池、要按内容表现给奖，这些依赖内容侧的排期。\n\n你之前也说过这期来不及，所以它在方案里已经移到第二阶段了。\n\n建议这期主玩法走集卡，投稿留成抽卡次数的一个来源 —— 不依赖排期也能上。',
    },
    phase: 'gameplay',
    gate: { confirm: '主玩法用集卡，投稿做次数来源', confirmTo: 'gp-1' },
    hold: 0,
  },
  {
    id: 'gp-pick-collect',
    view: { kind: 'user', text: '主玩法用集卡兑奖' },
    hold: 900,
  },
  {
    id: 'gp-1',
    view: {
      kind: 'think',
      group: 'gp',
      title: '接玩法',
      lines: [
        '按刚才定的集卡兑奖接：这套的链路是抽卡 → 集卡 → 集够解锁档位 → 兑奖，前面搭的 5 个页面正好对得上。',
        '玩法要在框架上就跑通——占位框照样能点、能扣次数、能点亮卡槽。等出完素材才发现玩法不对，返工的是全部素材。',
        '主链路串起来：点抽卡 → 扣一次机会 → 出一张卡 → 卡槽点亮 → 集够种数解锁档位 → 领奖走弹窗。',
      ],
    },
    phase: 'gameplay',
    gameplayPick: 'collect',
    hold: 2000,
  },
  {
    id: 'gp-2',
    view: {
      kind: 'think',
      group: 'gp',
      title: '接玩法',
      lines: [
        '参数先按方案里的来：9 种卡、2/4/7/9 种四档奖励、初始 9 次机会，重复卡按完全随机发。',
        '同种卡拿到两张以上可以送朋友，这条也接上——它是拉新的主要路子，不能等成品才补。',
      ],
    },
    hold: 1800,
  },
  {
    id: 'gp-done',
    view: {
      kind: 'ai',
      text: '玩法接上了，右侧的灰框现在就能试玩：点「抽卡」占位框，会真的扣次数、出卡、点亮卡槽，集够种数档位会解锁。\n\n画面还是灰的框，这是故意的——先确认玩法手感对不对，手感定了再花时间出素材。哪儿别扭直接说。',
      cards: [
        { type: 'play', badge: '玩法', title: '核心玩法 · 框架占位可试玩', desc: '9 张卡 / 4 档奖励 / 3 类抽卡任务' },
      ],
    },
    stage: 'playable',
    gate: {
      confirm: '生成素材清单',
      confirmTo: 'ok-gp',
      alt: '调整抽卡参数',
    },
    hold: 0,
  },
  {
    id: 'gp-adjust-ask',
    view: { kind: 'user', text: '试了几把老是重复，太磨人了；机会也少了点' },
    hold: 1200,
  },
  {
    id: 'gp-adjust-think',
    view: {
      kind: 'think',
      group: 'gp-adjust',
      title: '调抽卡手感',
      lines: [
        '重复卡多是因为完全随机——9 种里已经有 5 种的时候，再抽有一半以上概率是老卡。',
        '光提新卡概率还不够：次数太少的话，概率再高也集不齐。两个一起调。',
        '按新参数估了一下，12 次大概能出 6–7 种，剩下的留给每天的任务补，节奏刚好。',
      ],
    },
    hold: 2000,
  },
  {
    id: 'gp-adjust-do',
    view: {
      kind: 'ai',
      text: '把出新卡的概率提上去了，初始机会也从 9 次加到 12 次。现在开头几抽基本都是新卡，先给够正反馈，后面再慢慢卡。\n\n幸亏是在框架阶段调的——这一下改了抽卡节奏，要是素材都出完了，卡面数量也得跟着重排。',
    },
    phase: 'gameplay',
    mutate: {
      type: 'gameplay',
      patch: (g) => ({ ...g, draw: { initialChances: 12, newCardBias: 0.88 } }),
    },
    gate: { confirm: '生成素材清单', confirmTo: 'ok-gp' },
    hold: 0,
  },

  {
    id: 'ok-gp',
    view: { kind: 'user', text: '生成素材清单' },
    hold: 900,
  },
  /* ═══ ⑤ 素材清单 —— 先对齐要出哪些，再动手生成 ═══ */
  {
    id: 'list-1',
    view: {
      kind: 'think',
      group: 'list',
      title: '整理素材清单',
      lines: [
        '清单不是拍脑袋列的，是从框架的槽位倒推：框架上每个占位框对应一项素材，尺寸和比例都是现成的。',
        '数一遍：主视觉 1、品牌与标题 3、交互组件 4、奖励档位 5、卡面 9 张、下半屏分区 4 —— 26 项，按产出顺序分成 6 组。',
        '卡面这项要注意：9 种每种得两态，彩色（已获得）和石膏（未获得），实际是 18 张图。',
        '清单直接建成项目的素材库：每一项先占个位，生成出来就填进去，不另做一份。',
      ],
    },
    phase: 'assetList',
    hold: 2200,
  },
  {
    id: 'list-done',
    view: {
      kind: 'ai',
      text: '清单建在右侧的素材库里了，26 项按产出顺序分了 6 组，现在都是待生成的空位，尺寸是从框架槽位量出来的。\n\n先对清单再生成，是因为漏一项就得回头补一轮，而且补出来的那张跟前面的风格容易对不上。要加要减现在说。\n\n生成的时候整份出、只出其中某一项都行。',
      cards: [
        { type: 'list', badge: '素材库', title: '素材清单 · 26 项', desc: '全部待生成 · 点击进入素材库' },
      ],
    },
    gate: {
      confirm: '生成风格参考',
      confirmTo: 'ok-list',
      alt: '补充清单项',
    },
    hold: 0,
  },
  {
    id: 'list-adjust-ask',
    view: { kind: 'user', text: '兑奖弹窗里的红包封面也得出一张，还有页脚的字标别漏了' },
    hold: 1200,
  },
  {
    id: 'list-adjust-think',
    view: {
      kind: 'think',
      group: 'list-adjust',
      title: '补清单',
      lines: [
        '红包封面确实漏了——它在兑奖弹窗里，不在主会场的框架上，按槽位倒推就扫不到。',
        '页脚字标在清单里，归在「品牌与标题」那批，一起确认一下位置。',
      ],
    },
    hold: 1700,
  },
  {
    id: 'list-adjust-do',
    view: {
      kind: 'ai',
      text: '红包封面加进「奖励档位」那批了，页脚字标本来就在「品牌与标题」里。清单现在是 26 项。\n\n弹窗里的素材容易漏，我把 5 个页面又过了一遍，其余的都在。',
    },
    phase: 'assetList',
    gate: { confirm: '生成风格参考', confirmTo: 'ok-list' },
    hold: 0,
  },

  {
    id: 'ok-list',
    view: { kind: 'user', text: '生成风格参考' },
    hold: 900,
  },
  /* ═══ ⑥ 先出一版风格参考定调 ═══ */
  {
    id: 'style-1',
    view: {
      kind: 'think',
      group: 'style',
      title: '出风格参考',
      lines: [
        '26 项一次全出，风格错了就是 26 项重做。先出一张样张把调子定下来，成本最低。',
        '样张往「深夜食堂」走：暖橙打底，背景放霓虹窗景，桌上堆满夜宵，小马站中间当主角。',
      ],
    },
    hold: 2000,
  },
  {
    id: 'style-done',
    view: {
      kind: 'ai',
      text: '风格样张出来了，就这一张，先看调子对不对。定的是暖橙夜市调：高饱和、有油光、暖光源，标题这类文字层得用荧光绿压上去才看得清。\n\n这版认可的话，后面 26 项都按这个调子批量出；不认可现在换最便宜。',
      image: { src: '/assets/xiahua/head-kv.png', caption: '风格样张 · 暖橙夜市调' },
    },
    gate: {
      confirm: '按此风格生成全部素材',
      confirmTo: 'ok-style',
      alt: '重出风格参考',
    },
    hold: 0,
  },
  {
    id: 'style-alt-ask',
    view: { kind: 'user', text: '再浓一点，现在还不够馋人' },
    hold: 1200,
  },
  {
    id: 'style-alt-think',
    view: {
      kind: 'think',
      group: 'style-alt',
      title: '换风格方向',
      lines: [
        '往浓里走就是提饱和、加油光，夜宵这个品类越油越馋人。',
        '样张单独再出一版，原来那版留着——批量出之前还能切回去比。',
      ],
    },
    hold: 1600,
  },
  {
    id: 'style-alt-do',
    view: {
      kind: 'ai',
      text: '样张出了第二版，饱和和油光都往上提了。两版都留着，定哪版就按哪版批量出，26 项都跟着它走。',
      image: { src: '/assets/xiahua/head-kv.png', caption: '风格样张 v2 · 更浓的油光' },
    },
    mutate: {
      type: 'picks',
      patch: (p) => ({ ...p, headKv: 1 }),
      versions: (v) => ({ ...v, headKv: 2 }),
    },
    gate: { confirm: '按此风格生成全部素材', confirmTo: 'ok-style' },
    hold: 0,
  },

  {
    id: 'ok-style',
    view: { kind: 'user', text: '按此风格生成全部素材' },
    hold: 900,
  },
  /* ═══ ⑦ 分批生成素材 ═══ */
  {
    id: 'asset-1',
    view: {
      kind: 'think',
      group: 'assets',
      title: '批量出素材',
      lines: [
        '按清单的批次一批批来，不一次全铺开——出一批看一批，风格跑偏能当场拽回来。',
        '头图先出，它是样张的正式版，后面的标题、按钮、卡面都跟着它走，不然会散。',
        '每样先出一版就够了：一次铺开几十张候选，人也挑不过来。生成完成后逐项进入素材库查看。',
      ],
    },
    phase: 'assets',
    assetBatch: 1,
    stage: 'kv',
    hold: 2000,
  },
  {
    id: 'asset-2',
    view: {
      kind: 'think',
      group: 'assets',
      title: '批量出素材',
      lines: [
        '标题字用荧光绿压在暖色头图上，对比拉开才看得清；档期做小一号跟在下面。',
        '主按钮用高饱和的橙红，是全页最亮的一块，视线自然落上去。',
      ],
    },
    assetBatch: 3,
    stage: 'actions',
    hold: 2000,
  },
  {
    id: 'asset-3',
    view: {
      kind: 'think',
      group: 'assets',
      title: '批量出素材',
      lines: [
        '奖励档位按面额从小到大排，最后一档是实物，给它做得比券显眼一些，用户才有奔头。',
        '9 种夜食每种要两张：得到了是彩色，还没得到是石膏灰——一眼能看出还差哪几种。',
      ],
    },
    assetBatch: 5,
    stage: 'cardArt',
    hold: 2200,
  },
  {
    id: 'asset-4',
    view: {
      kind: 'think',
      group: 'assets',
      title: '批量出素材',
      lines: ['下半屏的任务区和话题区做得比上面素一点，别跟集卡面板抢注意力。'],
    },
    assetBatch: 6,
    stage: 'sections',
    hold: 1600,
  },
  {
    id: 'asset-done',
    view: {
      kind: 'ai',
      text: '26 项都出来了，每样一版，已经同步到右侧素材库。点任意素材可以进入详情，查看大图和生成 Prompt。\n\n有个事先说一下：解馋卤味和上头螺蛳粉这轮只出了石膏版，彩色的还得再排一批。不影响先上，用户抽到这两种会看到灰卡，我标记了。',
      cards: [
        { type: 'asset', badge: '素材', title: '活动素材 26 项', desc: '已生成 · 点击进入素材库' },
      ],
    },
    gate: {
      confirm: '生成 UI 界面',
      confirmTo: 'ok-asset',
    },
    hold: 0,
  },
  {
    id: 'asset-adjust-ask',
    view: { kind: 'user', text: '奖品那张我直接传设计给的图；任务区再出一版素一点的' },
    hold: 1200,
  },
  {
    id: 'asset-adjust-think',
    view: {
      kind: 'think',
      group: 'asset-adjust',
      title: '换素材',
      lines: [
        '实物奖是要真发出去的东西，设计手上有定稿图，直接传上来比生成准——每一项都能用本地文件顶掉。',
        '任务区再出一版：这块只是承载文字，太花会跟集卡面板抢注意力，往素里调。',
        '原来那版都留着，右侧点版本号能随时切回去比。',
      ],
    },
    hold: 1700,
  },
  {
    id: 'asset-adjust-do',
    view: {
      kind: 'ai',
      text: '实物奖那项等你在右侧点「本地上传」把图丢进来就替换掉，上传的会作为新一版排在最后。任务区出了第二版，已经切过去。\n\n这两处都不影响别的素材，改完直接生成界面就行。',
    },
    phase: 'assets',
    mutate: {
      type: 'picks',
      patch: (p) => ({ ...p, secTasks: 1 }),
      versions: (v) => ({ ...v, secTasks: 2 }),
    },
    gate: { confirm: '生成 UI 界面', confirmTo: 'ok-asset' },
    hold: 0,
  },

  {
    id: 'ok-asset',
    view: { kind: 'user', text: '生成 UI 界面' },
    hold: 900,
  },
  /* ═══ ⑧ 素材落进框架，生成正式 UI 界面 ═══ */
  {
    id: 'compose-1',
    view: {
      kind: 'think',
      group: 'compose',
      title: '生成 UI 界面',
      lines: [
        '框架的槽位、玩法的逻辑都是现成的，这一步只是把选中的素材一层层放回各自的位置。',
        '先头部：头图铺满，标题压上去，阶段切换叠在头图里。',
      ],
    },
    phase: 'final',
    stage: 'title',
    hold: 1400,
  },
  {
    id: 'compose-2',
    view: {
      kind: 'think',
      group: 'compose',
      title: '生成 UI 界面',
      lines: ['再放抽卡按钮和两侧入口，然后是集卡面板的进度、档位和卡槽。'],
    },
    stage: 'cardArt',
    hold: 1500,
  },
  {
    id: 'compose-3',
    view: {
      kind: 'think',
      group: 'compose',
      title: '生成 UI 界面',
      lines: [
        '下半屏接上任务区和话题区，页脚收底（运营位按前面说的没放）。',
        '玩法不用重接——前面在框架上跑通的那套逻辑原样带过来，换的只是皮。',
      ],
    },
    stage: 'playable',
    hold: 2200,
  },
  {
    id: 'v1',
    view: {
      kind: 'ai',
      text: 'UI 界面出来了，右侧直接点「抽夏日夜食」就能试：抽到卡 → 卡槽点亮 → 集够解锁档位 → 领奖 → 进我的奖品，送朋友那条也通了。\n\n界面上哪儿不对直接说，改哪都行。',
      cards: [
        { type: 'app', badge: 'H5', title: '这夏夯爆了 · 第一版', desc: '点击预览活动' },
      ],
    },
    gate: { confirm: '试玩活动' },
    hold: 0,
  },

  /* ═══ ⑨ 在 UI 上多轮调整 ═══ */
  { id: 'adj1-ask', view: { kind: 'user', text: '试了几把，四档太多了，先上三档试试水' }, hold: 1200 },
  {
    id: 'adj1-think',
    view: {
      kind: 'think',
      group: 'adj1',
      title: '收档位',
      lines: [
        '砍档要从后面砍——留 2 / 4 / 7 种。最后那档「集齐 9 种」拿掉，不然集满了反而没东西领，用户会觉得被耍。',
        '收成三档之后最高档从 9 种降到 7 种，达成率会明显上去。',
      ],
    },
    hold: 1600,
  },
  {
    id: 'adj1-do',
    view: {
      kind: 'ai',
      text: '收成三档了：集齐 2 / 4 / 7 种。最高档从 9 种降到 7 种，能领到最后一档的人会多不少。\n\n实物奖那档我先摘了，后面想加回来随时说。',
    },
    mutate: { type: 'gameplay', patch: (g) => ({ ...g, tiers: g.tiers.slice(0, 3) }) },
    hold: 2100,
  },

  { id: 'adj2-ask', view: { kind: 'user', text: '素材换上去之后标题又压住小马的脸了' }, hold: 1200 },
  {
    id: 'adj2-think',
    view: {
      kind: 'think',
      group: 'adj2',
      title: '调界面',
      lines: [
        '框架阶段挪过一次，但那会儿标题只是个占位框；正式字标比占位宽，压回脸上了。',
        '再往上提一点、跟着缩小一档就够——头图和小马的位置不动，只动标题这一层。',
      ],
    },
    hold: 1800,
  },
  {
    id: 'adj2-do',
    view: {
      kind: 'ai',
      text: '标题又往上提了一点、再缩了一档，小马的脸完整露出来了。\n\n这类位置微调是在正式 UI 上直接改的，不用重出素材——图还是那张，动的只是它在页面上的位置和大小。',
    },
    mutate: {
      type: 'overrides',
      patch: (o) => ({
        ...o,
        offsets: { ...(o.offsets ?? {}), title: { x: 0, y: -22, s: 0.9 } },
      }),
    },
    hold: 2100,
  },

  { id: 'adj3-ask', view: { kind: 'user', text: '「再抽 N 种」这句话不太对，用户不知道抽了能干嘛' }, hold: 1200 },
  {
    id: 'adj3-think',
    view: {
      kind: 'think',
      group: 'adj3',
      title: '改文案',
      lines: [
        '「再抽 N 种」只说了要做什么，没说做完有什么。改成「还差 N 种就能兑」，把目标点出来。',
        '副文案也跟着改成「XX 等你拿」，两句连起来是一个完整的动机。',
      ],
    },
    hold: 1700,
  },
  {
    id: 'adj3-do',
    view: {
      kind: 'ai',
      text: '改成「还差 N 种就能兑」了，下面那行跟着改成「5元夜食券 等你拿」。\n\n差几种、兑什么都是按当前进度实时算的，用户每抽一张这句话都会变。',
    },
    mutate: {
      type: 'gameplay',
      patch: (g) => ({
        ...g,
        copy: { ...g.copy, progress: '还差 {n} 种就能兑', progressSub: '{reward} 等你拿' },
      }),
    },
    hold: 2100,
  },

  { id: 'adj4-ask', view: { kind: 'user', text: '任务区下面加个引导发投稿的入口，投稿能多得次数' }, hold: 1200 },
  {
    id: 'adj4-think',
    view: {
      kind: 'think',
      group: 'insert',
      title: '想放哪儿',
      lines: [
        '放任务区后面最顺——用户刚看完「怎么攒次数」，紧接着就给一条最划算的路子。',
        '这块是跟着内容往下排的，插进去之后下面的话题区会自动顺延，不用手动挪。',
      ],
    },
    hold: 1800,
  },
  {
    id: 'adj4-do',
    view: {
      kind: 'ai',
      text: '加在任务区后面了，下面的内容自动往下顺延。\n\n文案先写的「发夏日投稿 · 大概率得稀有夜食」，想换直接说。',
    },
    mutate: {
      type: 'overrides',
      patch: (o) => ({
        ...o,
        inserted: [
          ...(o.inserted ?? []),
          {
            id: 'ins-guide',
            kind: 'button',
            label: '投稿引导入口',
            placement: 'flow',
            after: 'sec-tasks',
            w: 375,
            h: 64,
            text: '发夏日投稿 · 大概率得稀有夜食',
          },
        ],
      }),
    },
    hold: 2300,
  },

  { id: 'v2-ask', view: { kind: 'user', text: '这一轮改完现在是什么状态？' }, hold: 1100 },
  {
    id: 'v2',
    view: {
      kind: 'ai',
      text: '这一轮改完是这样：奖励收到三档、标题重新避开了小马的脸、进度文案换了说法、任务区后面多了投稿入口。抽卡手感（12 次机会、提新卡概率）是接玩法那步就调好的，去掉运营位是定框架时改的。\n\n还有两件事没做：解馋卤味和上头螺蛳粉的彩色卡面得补，接金豆那条路子也还没接上。要现在做就说一声。',
    },
    hold: 0,
  },
]

export const BUILD_TOTAL = XIAHUA_BUILD_SCRIPT.length

/** step id → 下标，供卡点跳转用。 */
export function stepIndex(id: string): number {
  return XIAHUA_BUILD_SCRIPT.findIndex((s) => s.id === id)
}

/* ═══ 模板复刻：引用做好的活动模板，换素材换玩法生成新活动 ═══
 *
 * 模板抽象掉的是「集卡兑奖」这套结构：活动长页、交互浮层、抽卡 → 集卡 →
 * 解锁档位 → 领奖的链路、全部素材槽位。复刻一个新活动要动的只有两样：素材（换皮）和
 * 玩法参数（卡池、档位、文案）。所以流程是：读模板 → 出一份「替换清单」
 * （哪些素材要重出、哪些玩法要改）→ 人确认 → 按清单替换 → 新活动出来。 */

export const TEMPLATE_CLONE_PROJECT = '夏日冲浪 · 顺风顺水'

/** 首页输入框里 @ 引用模板的 token（弹层插入、提交时识别用同一份）。 */
export const XIAHUA_TEMPLATE_TOKEN = '@夯爆了·集卡 H5 模板'
/** 兼容旧的首页草稿 / 录屏文案，入口最终统一到同一套模板流程。 */
export const LEGACY_XIAHUA_TEMPLATE_TOKEN = '@这夏夯爆了·集卡活动模板'

/** 从「夯爆了」项目方案抽出的模板文档，不是某个活动成品的项目方案。 */
export interface XiahuaTemplateDocument {
  title: string
  source: string
  version: string
  summary: string
  fixed: string[]
  replaceable: { slot: string; current: string; usage: string }[]
  steps: string[]
  confirm: string[]
  /** 项目文档专用：按最终可玩产物列出页面与浮层，不复用源模板缩略图。 */
  surfaces?: { name: string; kind: string; description: string }[]
}

export const XIAHUA_TEMPLATE_DOCUMENT: XiahuaTemplateDocument = {
  title: '夯爆了 · 集卡 H5 模板使用说明',
  source: '基于「夯爆了 已上线」活动方案与已验证成品抽象',
  version: 'v1.0 · 集卡兑奖 H5',
  summary:
    '这是一套可复用的夏日营销活动骨架。它保留「夯爆了」已经跑通的页面结构、状态和抽卡到领奖链路；每次使用时，只需要确认新活动文档，再替换主题素材与玩法参数。',
  fixed: [
    '5 个页面：活动主会场、开卡结算、我的卡册、兑奖弹窗、活动规则',
    '1 条主链路：抽卡 → 集卡 → 解锁奖励档位 → 领奖',
    '卡槽点亮、重复卡赠送、抽卡次数、奖励弹窗与状态反馈',
    '30 个素材项的命名与图层关系，主视觉支持背景 / 贴片 / 主角分层',
  ],
  replaceable: [
    { slot: '活动主题与文案', current: '夏日夜宵 / 这夏夯爆了', usage: '替换活动名称、标题字、按钮文案与页脚字标' },
    { slot: '主视觉与角色', current: '深夜食堂 / 厨师小马', usage: '替换背景、贴片和角色造型，保留图层位置与交互热区' },
    { slot: '卡池与卡面', current: '9 种夜食卡', usage: '确认卡片种类、卡面素材与卡槽数量，集齐门槛随卡池计算' },
    { slot: '奖励与任务', current: '3 档奖励 / 3 类抽卡任务', usage: '确认奖励门槛、奖品发放方式、抽卡机会来源与活动周期' },
    { slot: '金豆入口', current: '原主题视觉占位', usage: '可替换主题与提示文案；真正接入前不改变主链路与次数账本' },
  ],
  steps: [
    '先提供新活动文档，说明主题、卡池、奖励、任务和视觉方向。',
    '确认这份模板使用说明：哪些结构继承，哪些内容要替换。',
    '对齐新活动的素材与玩法差异，生成分批替换清单。',
    '按批次替换并逐批确认，完成后才生成新活动预览。',
  ],
  confirm: [
    '本次只继承页面与玩法骨架，不直接复用「夯爆了」的活动文案和素材。',
    '夏日冲浪的素材与参数来自本次确认后的替换清单，不把已有成品当作输入。',
  ],
}

/** 引用模板后生成的本期项目文档：把用户输入落到模板的页面、玩法与素材槽位。 */
export const XIAHUA_CLONE_PROJECT_DOCUMENT: XiahuaTemplateDocument = {
  title: '夏日冲浪 · 顺风顺水',
  source: '基于「夯爆了 · 集卡 H5 模板」与本次活动需求',
  version: '项目文档 · 生成基线 v1.0',
  summary:
    '本项目基于「夯爆了」的集卡主链路生成夏日玩水主题活动。最终产物为 1 个活动长页与 4 个交互浮层，包含 7 种装备、4 档奖励和 5 类任务；金豆区本期只生成视觉入口与“即将开放”提示，不接入活动次数或奖励状态。',
  fixed: [
    '1 个活动长页：夏日 KV、抽装备、装备册与奖励、金豆入口、任务、话题、地点内容和活动 banner',
    '4 个交互浮层：抽装备结果、顺风装备册、我的奖品、活动规则',
    '1 条主链路：抽卡 → 集卡 → 解锁奖励档位 → 领奖',
    '初始点亮「鲨鲨水枪」并提供 2 次抽取机会，抽中装备后同步更新卡册和主视觉',
    '卡槽点亮、重复卡数量与赠送提示、任务补充抽取机会、奖励领取与状态反馈',
  ],
  replaceable: [
    { slot: '活动主题与文案', current: '夏日玩水 / 夏日冲浪', usage: '生成海边主题、活动标题、按钮和页脚文案' },
    { slot: '主视觉与角色', current: '夏日海边 / 泳圈小马', usage: '生成海滩底景、玩水道具贴片和夏日角色造型' },
    { slot: '卡池与卡面', current: '7 种玩水装备', usage: '鲨鲨水枪 / 冰镇西瓜 / 顺风冲浪板 / 海岛椰树 / 好运泳圈 / 躺赢沙滩椅 / 遮阳幸运帽' },
    { slot: '奖励档位', current: '1 / 4 / 6 / 7 种', usage: '配置 3 元券、12 元券、23 元券与足金顺顺马抽签码' },
    { slot: '抽取任务', current: '5 类任务', usage: '投稿 / 发布玩水灵感 / 到店点亮 / 赠送装备 / 浏览活动页' },
    { slot: '金豆入口', current: '视觉占位', usage: '展示“冲浪得金豆”入口；点击提示即将开放，不连接次数与奖励账本' },
  ],
  steps: [
    '确认本项目文档中的主题、卡池、奖励、任务和金豆入口边界。',
    '按模板页面结构生成夏日冲浪的素材与玩法配置清单。',
    '分组生成素材并逐项确认，保留模板的页面和交互关系。',
    '完成替换后生成活动预览，进入编辑调整。',
  ],
  confirm: [
    '用户需求：夏天玩水主题，集 7 种冲浪装备，奖励以券为主，最高档使用足金抽签码，主角保留小马。',
    '生成边界：当前可玩预览交付活动长页和 4 个交互浮层；金豆玩法只交付入口占位，Loading 与角色选择保留为工程草稿路由。',
  ],
  surfaces: [
    { name: '活动主页', kind: '长页面', description: '地图顶栏、夏日 KV、抽装备、装备册与奖励、金豆入口、5 类任务、话题、地点内容和活动 banner' },
    { name: '抽装备结果', kind: '浮层', description: '包含抽取中与抽取结果两态，确认后同步点亮装备、卡册与主视觉' },
    { name: '顺风装备册', kind: '浮层', description: '展示 7 种装备的已点亮 / 待点亮状态、持有数量与重复装备赠送提示' },
    { name: '我的奖品', kind: '浮层', description: '展示已领取奖励列表与未领奖空态；4 档解锁和领取状态位于活动主页奖励区' },
    { name: '活动规则', kind: '浮层', description: '说明抽取、集卡、任务、赠送与奖励领取规则' },
  ],
}

/** 替换清单的一行：模板里是什么 → 新活动要换成什么。 */
export interface CloneDiffItem {
  id: string
  /** 第几批替换；0 = 原样继承，不参与替换也不可勾选 */
  batch: number
  from: string
  to: string
  /** 附注：为什么这么换 / 换不动的部分 */
  note?: string
}

export const CLONE_ASSET_DIFF: CloneDiffItem[] = [
  { id: 'a-kv', batch: 1, from: '头图 KV · 深夜食堂', to: '头图 KV · 夏日海边', note: '分层的，底景换海滩、贴片换玩水道具' },
  { id: 'a-mascot', batch: 1, from: '主角 · 厨师小马', to: '主角 · 泳圈小马', note: '同一个 IP 换造型，位置沿用主角层槽位' },
  { id: 'a-title', batch: 1, from: '活动标题字 · 暖橙夜市', to: '活动标题字 · 夏日冷调', note: '沿用标题槽位，替换活动名与配色以适配海边底图' },
  { id: 'a-btn', batch: 1, from: '主按钮「抽夏日夜食」', to: '主按钮「抽装备 一顺到底」', note: '按钮上的字跟着卡池变' },
  { id: 'a-cards', batch: 2, from: '9 张夜食卡面（彩色 + 石膏）', to: '7 张玩水装备卡面（彩色 + 待点亮）', note: '卡池换了，卡面全部重出' },
  { id: 'a-tier', batch: 3, from: '奖励档位图 · 券面 3 档', to: '奖励档位图 · 券面 3 档 + 足金抽签码', note: '面额、门槛和最高档奖品都变了' },
  { id: 'a-sections', batch: 3, from: '任务区 / 话题区底图', to: '同版式换夏日配色', note: '版式不动，只换皮' },
  { id: 'a-footer', batch: 3, from: '页脚字标', to: '页脚字标 · 夏日版' },
]

export const CLONE_GAMEPLAY_DIFF: CloneDiffItem[] = [
  { id: 'g-cards', batch: 2, from: '卡池：9 种夜食', to: '卡池：7 种玩水装备', note: '鲨鲨水枪 / 冰镇西瓜 / 顺风冲浪板 / 海岛椰树 / 好运泳圈 / 躺赢沙滩椅 / 遮阳幸运帽' },
  { id: 'g-tiers', batch: 3, from: '奖励门槛 2 / 4 / 7 种', to: '奖励门槛 1 / 4 / 6 / 7 种', note: '¥3 清凉开运券 / ¥12 玩水装备券 / ¥23 一顺到底券 / 足金顺顺马' },
  { id: 'g-goods', batch: 3, from: '最高档：43 元夜食券包', to: '最高档：足金顺顺马抽签码', note: '新增第 4 档，走抽签码发放，不直接发货' },
  { id: 'g-tasks', batch: 3, from: '抽卡任务 3 类', to: '抽卡任务 5 类', note: '生成投稿、发布灵感、到店点亮、赠送装备与浏览活动页任务' },
  { id: 'g-sub', batch: 3, from: '金豆入口：原主题视觉占位', to: '金豆入口：夏日冲浪视觉占位', note: '本期只换主题与提示文案，不接入活动次数或奖励账本' },
  { id: 'g-core', batch: 0, from: '抽卡 / 集卡 / 解锁 / 领奖 链路', to: '原样继承', note: '这套是模板的核心，不动，也不给勾' },
]

/** 替换分几批做 —— 一次全换完看不出「换了什么」，也不给人叫停的机会。 */
export const CLONE_BATCH_TITLE: Record<number, string> = {
  1: '背景与主视觉',
  2: '卡池与卡面',
  3: '档位 · 任务 · 金豆入口',
}

export const TEMPLATE_CLONE_SCRIPT: BuildStep[] = [
  {
    id: 'tpl-ask',
    view: {
      kind: 'user',
      text: '@夯爆了·集卡 H5 模板 参考这个模板帮我生成一个夏日冲浪的活动，主题换成夏天玩水，集的东西换成冲浪装备',
    },
    // 先呈现用户需求，下一步直接产出本期项目文档。
    phase: 'none',
    hold: 900,
  },
  {
    id: 'tpl-template-doc',
    view: {
      kind: 'ai',
      text: '我根据你的需求和「夯爆了 · 集卡 H5 模板」整理了一份「夏日冲浪 · 顺风顺水」项目文档：集卡主链路沿用模板，本期生成活动长页与交互浮层，并单独配置主题素材、卡池、奖励和任务。金豆区先保留视觉入口，玩法逻辑不在本期接入。确认后就按这份文档生成活动。',
      cards: [
        {
          type: 'doc',
          badge: '项目文档',
          title: '夏日冲浪 · 顺风顺水',
          desc: '基于集卡 H5 模板 · 页面结构与本期活动配置',
        },
      ],
    },
    phase: 'doc',
    gate: { confirm: '确认项目文档，开始生成活动', confirmTo: 'tpl-doc-confirm' },
    hold: 0,
  },
  {
    id: 'tpl-doc-confirm',
    view: { kind: 'user', text: '确认项目文档，按它生成夏日冲浪' },
    phase: 'doc',
    hold: 900,
  },
  {
    id: 'tpl-clarify',
    view: {
      kind: 'ai',
      text: '项目文档确认了。本期配置已经从你的描述中整理出来：夏日玩水主题、7 种冲浪装备、4 档奖励和 5 类抽取任务。页面结构和抽卡到领奖的主链路沿用模板；金豆区本期只做夏日主题入口与“即将开放”提示。接下来生成对应的素材与玩法清单。',
    },
    phase: 'doc',
    hold: 2200,
  },
  {
    id: 'tpl-read',
    view: {
      kind: 'think',
      group: 'tpl',
      title: '整理项目配置',
      lines: [
        '模板提供集卡主链路、卡槽状态和奖励交互；本期产物按活动长页与 4 个交互浮层组织。',
        '本期活动配置来自你的需求：7 种冲浪装备、4 档奖励和 5 类抽取任务。',
        '需要重新生成的是夏日主题素材、装备卡面、奖励视觉与活动文案；金豆区只生成视觉入口与提示。',
        '已按项目文档整理为素材替换项和玩法配置项，接下来分组确认生成范围。',
      ],
    },
    hold: 2200,
  },
  {
    id: 'tpl-diff',
    view: {
      kind: 'ai',
      text: '项目文档已经整理成替换清单：8 项素材、5 处玩法配置需要按夏日冲浪调整，页面结构和抽卡到领奖的主链路直接继承。清单按背景与主视觉、卡池与卡面、档位与玩法三组排列，确认范围后我会分组生成。',
      cards: [
        { type: 'list', badge: '清单', title: '替换清单 · 素材 8 项 / 玩法 5 处', desc: '勾选要替换的项 · 按顺序执行' },
      ],
    },
    phase: 'diff',
    gate: {
      confirm: '开始替换',
      confirmTo: 'ok-diff',
      alt: '调整替换项',
    },
    hold: 0,
  },
  {
    id: 'tpl-diff-adjust-ask',
    view: { kind: 'user', text: '装备卡先做 7 种就行，别扩到 9 种；金豆冲浪这期先留入口，玩法下期再接' },
    hold: 1200,
  },
  {
    id: 'tpl-diff-adjust-do',
    view: {
      kind: 'ai',
      text: '卡池按 7 种走，门槛调整为 1 / 4 / 6 / 7 种；金豆冲浪在主玩法下方保留夏日主题入口，点击提示“即将开放”，不接入活动次数与奖励状态。项目配置已更新，可以继续生成。',
    },
    phase: 'diff',
    gate: { confirm: '开始替换', confirmTo: 'ok-diff' },
    hold: 0,
  },
  {
    id: 'ok-diff',
    view: { kind: 'user', text: '开始替换' },
    hold: 900,
  },

  /* ── 第 1 批：背景与主视觉 ── */
  {
    id: 'tpl-b1-think',
    view: {
      kind: 'think',
      group: 'tpl-b1',
      title: '替换背景与主视觉',
      lines: [
        '头图是分层的：底景从深夜食堂换成海边，食物贴片换成冲浪板、泳圈、椰树这些玩水道具。',
        '主角还是那只小马，换成套泳圈的夏日造型 —— IP 不换，只换造型，用户认得出是同一个。',
        '标题字和主按钮的字跟着主题走，重新出一版；版式一格没动。',
      ],
    },
    replaceBatch: 1,
    hold: 2200,
  },
  {
    id: 'tpl-b1-done',
    view: {
      kind: 'ai',
      text: '背景与主视觉已按夏日玩水主题生成：海边底景、玩水道具、泳圈小马、标题字和主按钮都已更新。卡池配置保持项目文档中的 7 种装备，下一步生成对应卡面。',
    },
    phase: 'diff',
    gate: { confirm: '替换卡池与卡面', confirmTo: 'ok-b2', alt: '这批再调一下' },
    hold: 0,
  },
  {
    id: 'tpl-b1-adjust-ask',
    view: { kind: 'user', text: '小马再往画面中间挪一点，别被冲浪板挡住' },
    hold: 1200,
  },
  {
    id: 'tpl-b1-adjust-do',
    view: {
      kind: 'ai',
      text: '主角层往中间挪了，冲浪板的贴片压到它后面去。图层顺序是模板里就定好的，调的只是这一层的位置。',
    },
    phase: 'diff',
    gate: { confirm: '替换卡池与卡面', confirmTo: 'ok-b2' },
    hold: 0,
  },
  { id: 'ok-b2', view: { kind: 'user', text: '替换卡池与卡面' }, hold: 900 },

  /* ── 第 2 批：卡池与卡面 ── */
  {
    id: 'tpl-b2-think',
    view: {
      kind: 'think',
      group: 'tpl-b2',
      title: '替换卡池与卡面',
      lines: [
        '卡池整组换掉：9 种夜食 → 7 种玩水装备，卡槽格数跟着从 9 变 7，模板里这是同一个参数。',
        '每种照样出两态：已点亮卡面和待点亮状态，卡册和结算浮层共用同一份卡池配置。',
        '7 套装备视觉与两态样式单独占一批，生成后直接同步到卡槽和装备册。',
      ],
    },
    replaceBatch: 2,
    hold: 2400,
  },
  {
    id: 'tpl-b2-done',
    view: {
      kind: 'ai',
      text: '7 种装备卡面出完了，卡槽也从 9 格收成 7 格。集卡进度、卡册的三态按钮这些都是按卡池数算的，不用另改。\n\n接下来处理档位、任务和金豆入口。',
    },
    phase: 'diff',
    gate: { confirm: '替换档位与玩法', confirmTo: 'ok-b3' },
    hold: 0,
  },
  { id: 'ok-b3', view: { kind: 'user', text: '替换档位与玩法' }, hold: 900 },

  /* ── 第 3 批：档位 / 任务 / 金豆入口 ── */
  {
    id: 'tpl-b3-think',
    view: {
      kind: 'think',
      group: 'tpl-b3',
      title: '替换档位与玩法',
      lines: [
        '门槛降到 1 / 4 / 6 / 7 种：第一档点亮一张就有，避免开局空手；最高档 7 种正好是集齐。',
        '实物奖改成足金顺顺马抽签码，走抽签不直接发货，档位图也跟着换。',
        '任务扩为投稿、发布灵感、到店点亮、赠送装备和浏览活动页 5 类；金豆区只替换为夏日视觉入口，不接次数账本。',
      ],
    },
    replaceBatch: 3,
    hold: 2400,
  },
  {
    id: 'tpl-done',
    view: {
      kind: 'ai',
      text: '「夏日冲浪 · 顺风顺水」已生成：活动长页与 4 个交互浮层、7 种装备卡、4 档奖励、5 类任务和足金抽签码都已落地。金豆区按项目文档保留为“即将开放”的视觉入口，尚未接入活动次数和奖励状态。需要调整的地方直接告诉我。',
      cards: [
        { type: 'app', badge: 'H5', title: '夏日冲浪 · 顺风顺水', desc: '基于集卡活动模板生成 · 点击预览活动' },
      ],
    },
    phase: 'final',
    stage: 'playable',
    hold: 0,
  },
]
