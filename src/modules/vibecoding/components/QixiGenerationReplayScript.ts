import type { BuildStep } from './XiahuaBuildScript'

export type QixiReplayTarget =
  | 'source-understanding'
  | 'scope-decision'
  | 'wireframe'
  | 'gameplay'
  | 'visual-direction'
  | 'reward-copy'
  | 'playtest-audit'
  | 'visual-sample'
  | 'product-shell'
  | 'current-result'

export type QixiReplayStep = BuildStep & {
  target?: QixiReplayTarget
  nextTo?: string
}

/**
 * 七夕项目的一次可回放 CompileRun。
 *
 * 用户只参与三类会改变活动本身的决定：边界、玩法和设计风格。
 * 页面白模、技术组织、事实隔离、质量修复与样张范围由 Agent 自动完成。
 * 产品实现纠偏仍保留为历史节点，但不混入正常的活动生成回放。
 */
export const QIXI_GENERATION_REPLAY_SCRIPT: QixiReplayStep[] = [
  {
    id: 'qixi-request',
    view: {
      kind: 'user',
      text: '根据这份七夕活动需求，边尝试边梳理怎么生成活动页面。只关注前端实现，后端接口先不用管。',
    },
    target: 'source-understanding',
    hold: 800,
  },
  {
    id: 'qixi-source-doc',
    view: {
      kind: 'doc',
      text: '读取活动规则、页面清单、关卡表和奖励说明；原文保持只读。',
      fileName: '七夕 · 搭建鹊桥找喜鹊活动需求.docx',
      meta: '活动主流程、7 关参数、任务机会、奖励节点与页面状态',
    },
    target: 'source-understanding',
    hold: 700,
  },
  {
    id: 'qixi-parse',
    view: {
      kind: 'ai',
      text: '已生成《页面需求》：活动主线是“获得机会 → 找喜鹊 → 搭鹊桥 → 领取奖励”，需要首页、关卡、结果、任务、抽奖、规则和明细等页面。\n\n先确认本期边界，确认后我会把结果追加回文档。',
    },
    target: 'source-understanding',
    hold: 1500,
  },
  {
    id: 'qixi-scope-choice',
    view: {
      kind: 'ai',
      text: '需求已经拆成确定项、冲突项和后置项。第一步先定本期做到什么程度；范围一旦选大，页面、状态和素材数量都会跟着增长。\n\n我推荐“单人完整闭环”：它严格贴合文档主线，也足够验证活动能不能成立。',
      cards: [
        {
          id: 'qixi-brief',
          type: 'doc',
          badge: '确认 1/3',
          title: '确定本期活动边界',
          desc: '做多大 · 保留哪些体验 · 哪些内容后置',
        },
      ],
    },
    target: 'scope-decision',
    gate: {
      confirm: '采用 Agent 推荐范围',
      choiceLayout: 'compact',
      choices: [
        {
          title: '单人完整闭环',
          eyebrow: 'Agent 推荐',
          tag: 'P0',
          desc: '保留 7 关、任务、助力、券奖励、抽奖、明细与异常状态，一次验证完整活动循环。',
          facts: ['7 个页面族', '5 类边际状态', '后端全部 mock'],
          recommended: true,
          to: 'qixi-scope-complete-selected',
        },
        {
          title: '只做找喜鹊 MVP',
          tag: '更快',
          desc: '只保留首页、关卡和结果页；能测点击玩法，但无法验证机会与奖励能否驱动回访。',
          facts: ['3 个页面族', '不含任务与抽奖', '验证面较窄'],
          to: 'qixi-scope-minimal-selected',
        },
        {
          title: '把组队玩法加回来',
          tag: '不建议',
          desc: '会扩大到房间、邀请、队伍状态和多人结算，且与七夕文档“本期删除”相冲突。',
          facts: ['至少新增 4 个页面', '需要真实服务端', '偏离本期'],
          to: 'qixi-scope-group-selected',
        },
        {
          title: '其他',
          desc: '直接输入你希望本期完成的范围。',
          input: true,
          placeholder: '补充活动边界…',
          to: 'qixi-scope-custom-selected',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'qixi-scope-complete-selected',
    view: { kind: 'user', text: '按 Agent 推荐执行：单人完整闭环' },
    target: 'scope-decision',
    hold: 500,
  },
  {
    id: 'qixi-scope-complete-applied',
    view: {
      kind: 'ai',
      text: '范围已锁定：本期用一个完整闭环检验活动，而不是只做一次找图演示。组队和一键生成分享作品都留到后续版本；后端、风控和真实奖品接口只保留前端状态。',
    },
    target: 'scope-decision',
    nextTo: 'qixi-wireframe-choice',
    hold: 750,
  },
  {
    id: 'qixi-scope-minimal-selected',
    view: { kind: 'user', text: '首版只做找喜鹊 MVP' },
    target: 'scope-decision',
    hold: 500,
  },
  {
    id: 'qixi-scope-minimal-applied',
    view: {
      kind: 'ai',
      text: '可以缩到三个页面，但这样只能验证“能不能玩”，验证不了任务、机会、奖励和回流是否成立。我会保留这条分支记录，页面结构仍按可扩回完整闭环的方式搭。',
    },
    target: 'scope-decision',
    nextTo: 'qixi-wireframe-choice',
    hold: 750,
  },
  {
    id: 'qixi-scope-group-selected',
    view: { kind: 'user', text: '把组队玩法也放进本期' },
    target: 'scope-decision',
    hold: 500,
  },
  {
    id: 'qixi-scope-group-applied',
    view: {
      kind: 'ai',
      text: '这项与原文“七夕不做组队”直接冲突，而且多人状态无法只靠前端正确验证。我不会把它伪装成本期可交付能力；先完成单人链路，组队作为中秋候选版本单独立项。',
    },
    target: 'scope-decision',
    nextTo: 'qixi-wireframe-choice',
    hold: 850,
  },
  {
    id: 'qixi-scope-custom-selected',
    view: { kind: 'user', text: '补充本期活动边界' },
    target: 'scope-decision',
    hold: 500,
  },
  {
    id: 'qixi-scope-custom-applied',
    view: {
      kind: 'ai',
      text: '你补充的边界已追加到《页面需求》。我会以这个范围生成活动灰模。',
    },
    target: 'scope-decision',
    nextTo: 'qixi-wireframe-choice',
    hold: 750,
  },
  {
    id: 'qixi-wireframe-thinking',
    view: {
      kind: 'think',
      group: 'qixi-wireframe',
      title: '整理用户使用路径',
      lines: [
        '首页先让用户看懂鹊桥进度、剩余机会和下一步操作。',
        '进入关卡后只保留找鹊、倒计时、退出和结果反馈，避免无关信息干扰。',
        '任务、好友助力和抽奖都从首页进入，完成后回到同一条活动主线。',
        '规则、奖励和参与明细提供独立入口，用户随时可以查看。',
      ],
    },
    target: 'wireframe',
    hold: 1400,
  },
  {
    id: 'qixi-wireframe-choice',
    view: {
      kind: 'ai',
      text: '活动灰模已生成：首页、闯关、任务、抽奖、规则和结果状态已经串成一条可点击的用户路径。页面复用和状态组织由 Agent 负责。',
      cards: [
        {
          id: 'qixi-page-matrix',
          type: 'wire',
          badge: 'Agent 自动完成',
          title: '活动白模',
          desc: '首页 · 找鹊 · 任务 · 抽奖 · 规则 · 结果状态',
        },
      ],
    },
    target: 'wireframe',
    nextTo: 'qixi-gameplay-choice',
    hold: 800,
  },
  {
    id: 'qixi-wireframe-reuse-selected',
    view: { kind: 'user', text: '按 Agent 推荐执行：1 套关卡模板 + 7 份配置' },
    target: 'wireframe',
    hold: 500,
  },
  {
    id: 'qixi-wireframe-reuse-applied',
    view: {
      kind: 'ai',
      text: '白模已经串通：用户可以从首页获得机会、进入找鹊、主动退出或完成关卡，并继续查看进度、参与抽奖和查看明细。下一步只需要确认玩法节奏。',
    },
    target: 'wireframe',
    nextTo: 'qixi-gameplay-choice',
    hold: 850,
  },
  {
    id: 'qixi-wireframe-independent-selected',
    view: { kind: 'user', text: '每一关都做成独立页面' },
    target: 'wireframe',
    hold: 500,
  },
  {
    id: 'qixi-wireframe-independent-applied',
    view: {
      kind: 'ai',
      text: '可以拆开，但目前没有任何一关需要独有布局。为避免七份重复代码，我会保留独立场景槽位，交互和状态机仍共用一套模板；如果后续某关出现特殊机制，再只对那一关扩展。',
    },
    target: 'wireframe',
    nextTo: 'qixi-gameplay-choice',
    hold: 850,
  },
  {
    id: 'qixi-gameplay-choice',
    view: {
      kind: 'ai',
      text: '第二步确认玩法。需求原稿是 7 关、每关 90 秒，目标数量从 5 只逐步增加到 8 只；签到和好友助力补充机会，通关获得抽奖次数。\n\n我推荐沿用这套渐进挑战，它既保留活动紧张感，也给普通用户足够的识别时间。',
      cards: [
        {
          id: 'qixi-playable',
          type: 'play',
          badge: '确认 2/3',
          title: '确定玩法节奏',
          desc: '关卡数量 · 单关时长 · 难度曲线 · 机会与奖励',
        },
      ],
    },
    target: 'gameplay',
    gate: {
      confirm: '采用 90 秒渐进挑战',
      choiceLayout: 'compact',
      choices: [
        {
          title: '90 秒渐进挑战',
          eyebrow: 'Agent 推荐',
          tag: '沿用需求',
          desc: '7 关逐步增加目标数量，保留倒计时、机会消耗与通关奖励。',
          facts: ['5 → 8 只', '每关 90 秒', '通关获得抽奖次数'],
          recommended: true,
          to: 'qixi-gameplay-baseline-selected',
        },
        {
          title: '60 秒高压挑战',
          tag: '更刺激',
          desc: '节奏更快，但小屏找图容错更低，可能放大误点和挫败感。',
          facts: ['时长更短', '难度更高', '适合后续实验'],
          to: 'qixi-gameplay-fast-selected',
        },
        {
          title: '无倒计时休闲找图',
          tag: '更轻松',
          desc: '取消失败压力，但机会消耗和奖励挑战的意义会明显减弱。',
          facts: ['无失败压力', '适合轻量渠道', '奖励驱动力较弱'],
          to: 'qixi-gameplay-calm-selected',
        },
        {
          title: '其他',
          desc: '直接输入你希望的玩法主线或节奏。',
          input: true,
          placeholder: '补充玩法主线…',
          to: 'qixi-gameplay-custom-selected',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'qixi-gameplay-baseline-selected',
    view: { kind: 'user', text: '按 Agent 推荐执行：90 秒渐进难度曲线' },
    target: 'gameplay',
    hold: 500,
  },
  {
    id: 'qixi-gameplay-baseline-applied',
    view: {
      kind: 'ai',
      text: '玩法已确定为 90 秒渐进挑战。白模同步更新：首次参与、签到、好友助力、进入关卡、退出、通关、抽奖和明细现在可以沿同一条用户路径完整跑通。',
    },
    target: 'gameplay',
    nextTo: 'qixi-visual-choice',
    hold: 900,
  },
  {
    id: 'qixi-gameplay-fast-selected',
    view: { kind: 'user', text: '改成 60 秒高压挑战' },
    target: 'gameplay',
    hold: 500,
  },
  {
    id: 'qixi-gameplay-fast-applied',
    view: {
      kind: 'ai',
      text: '玩法已更新为 60 秒高压挑战。灰模会同步收紧倒计时和失败反馈，并在自检时重点检查小屏误点与挫败感。',
    },
    target: 'gameplay',
    nextTo: 'qixi-visual-choice',
    hold: 850,
  },
  {
    id: 'qixi-gameplay-calm-selected',
    view: { kind: 'user', text: '取消倒计时，做轻松找图' },
    target: 'gameplay',
    hold: 500,
  },
  {
    id: 'qixi-gameplay-calm-applied',
    view: {
      kind: 'ai',
      text: '玩法已更新为无倒计时休闲找图。灰模会移除超时失败，同时重新检查机会消耗和奖励驱动是否仍然合理。',
    },
    target: 'gameplay',
    nextTo: 'qixi-visual-choice',
    hold: 850,
  },
  {
    id: 'qixi-gameplay-custom-selected',
    view: { kind: 'user', text: '补充玩法主线' },
    target: 'gameplay',
    hold: 500,
  },
  {
    id: 'qixi-gameplay-custom-applied',
    view: {
      kind: 'ai',
      text: '你补充的玩法已追加到《玩法信息》，并更新到灰模的玩法配置中。',
    },
    target: 'gameplay',
    nextTo: 'qixi-visual-choice',
    hold: 850,
  },
  {
    id: 'qixi-visual-choice',
    view: {
      kind: 'ai',
      text: '第三步确认设计风格。右侧素材库已经放入三张同口径样张，可以先看图再决定。\n\n我推荐“现代东方月夜剪纸”：月、鹊羽和桥都是这项活动独有的视觉线索，鹊桥逐段点亮也能直接表达 7 关进度。',
    },
    target: 'visual-direction',
    gate: {
      confirm: '采用现代东方月夜剪纸',
      choiceLayout: 'cards',
      choices: [
        {
          title: '现代东方月夜剪纸',
          eyebrow: 'Agent 推荐',
          tag: '进度即视觉',
          preview: '/assets/qixi/level-01-v1.webp',
          desc: '黛蓝月夜、米白月盘、朱砂奖励节点；鹊羽层层叠成桥，通关时逐段点亮。',
          facts: ['适配 7 关进度', '东方但不古装', '动效集中在搭桥'],
          recommended: true,
          to: 'qixi-visual-eastern-selected',
        },
        {
          title: '甜美元气粉紫',
          tag: '社交感强',
          preview: '/assets/qixi/style-sweet-v1.jpg',
          desc: '爱心、糖果色和 Q 版喜鹊更轻松，但容易与常规节日模板同质化。',
          facts: ['亲和', '通用', '活动辨识度较弱'],
          to: 'qixi-visual-sweet-selected',
        },
        {
          title: '写实城市夜景',
          tag: '沉浸',
          preview: '/assets/qixi/style-city-v1.jpg',
          desc: '真实城市天际线与写实鸟群，氛围成熟，但 7 张场景的制作与一致性成本最高。',
          facts: ['沉浸感强', '素材成本高', '小屏目标识别更难'],
          to: 'qixi-visual-real-selected',
        },
        {
          title: '其他',
          desc: '直接输入你希望尝试的设计风格。',
          input: true,
          placeholder: '补充设计风格…',
          to: 'qixi-visual-custom-selected',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'qixi-visual-eastern-selected',
    view: { kind: 'user', text: '按 Agent 推荐执行：现代东方月夜剪纸' },
    target: 'visual-direction',
    hold: 500,
  },
  {
    id: 'qixi-visual-eastern-applied',
    view: {
      kind: 'ai',
      text: '视觉方向已记录：黛蓝月夜为底、月盘米白、奖励节点朱砂；标题避免仿古书法，使用收紧字面与竖向桥势；整场只把“鹊羽叠桥”作为主记忆点，其余组件保持克制。正式素材尚未生成。',
      cards: [
        {
          id: 'qixi-visual-direction',
          type: 'asset',
          badge: '确认 3/3',
          title: '视觉方向 · 现代东方月夜剪纸',
          desc: '月盘 · 鹊羽 · 叠桥 · 朱砂奖励节点',
        },
      ],
    },
    target: 'visual-direction',
    nextTo: 'qixi-current-build',
    hold: 900,
  },
  {
    id: 'qixi-visual-sweet-selected',
    view: { kind: 'user', text: '选择甜美元气粉紫方向' },
    target: 'visual-direction',
    hold: 500,
  },
  {
    id: 'qixi-visual-sweet-applied',
    view: {
      kind: 'ai',
      text: '设计风格已更新为甜美元气粉紫。首页、关卡和奖励素材会统一使用粉紫灯彩、Q 版喜鹊和轻社交氛围。',
    },
    target: 'visual-direction',
    nextTo: 'qixi-current-build',
    hold: 850,
  },
  {
    id: 'qixi-visual-real-selected',
    view: { kind: 'user', text: '选择写实城市夜景方向' },
    target: 'visual-direction',
    hold: 500,
  },
  {
    id: 'qixi-visual-real-applied',
    view: {
      kind: 'ai',
      text: '设计风格已更新为写实城市夜景。后续生成会统一城市蓝调与写实光影，并在小屏上严格检查喜鹊的识别度。',
    },
    target: 'visual-direction',
    nextTo: 'qixi-current-build',
    hold: 850,
  },
  {
    id: 'qixi-visual-custom-selected',
    view: { kind: 'user', text: '补充设计风格' },
    target: 'visual-direction',
    hold: 500,
  },
  {
    id: 'qixi-visual-custom-applied',
    view: {
      kind: 'ai',
      text: '你补充的设计风格已记录。我会先以该方向生成主 KV 和第 1 关样张，再进入页面生成与审查。',
    },
    target: 'visual-direction',
    nextTo: 'qixi-current-build',
    hold: 850,
  },
  {
    id: 'qixi-reward-choice',
    view: {
      kind: 'ai',
      text: '检查需求时发现奖励金额同时出现 X、480 和 680 元，目前没有唯一口径。这不需要增加一次选择：我会自动隔离金额，继续完成不依赖金额的页面和素材。\n\n用户侧不展示任何候选数字，项目文档保留冲突证据，并在发布前要求业务补齐唯一金额。',
      cards: [
        {
          id: 'qixi-reward-conflict',
          type: 'doc',
          badge: '发布前待补',
          title: '奖励金额待确认',
          desc: '页面与图片不带金额，其余前端继续',
        },
      ],
    },
    target: 'reward-copy',
    nextTo: 'qixi-reward-dynamic-applied',
    hold: 850,
  },
  {
    id: 'qixi-reward-dynamic-selected',
    view: {
      kind: 'user',
      text: '按 Agent 推荐执行：金额不进入页面，继续无金额前端',
    },
    target: 'reward-copy',
    hold: 500,
  },
  {
    id: 'qixi-reward-dynamic-applied',
    view: {
      kind: 'ai',
      text: '金额已隔离：运行页面不展示 X、480 或 680，券面图片也不包含金额。冲突继续保留在“需求原文”，并已进入“发布前待补资料”。',
    },
    target: 'reward-copy',
    nextTo: 'qixi-audit-thinking',
    hold: 750,
  },
  {
    id: 'qixi-reward-480-selected',
    view: { kind: 'user', text: '先暂停金额相关产出，等业务确认' },
    target: 'reward-copy',
    hold: 500,
  },
  {
    id: 'qixi-reward-480-applied',
    view: {
      kind: 'ai',
      text: '金额文案与券面已经暂停；关卡、状态机和不含金额的主视觉仍可继续验证。业务确认唯一口径后，再从配置补入，不改写此前记录。',
    },
    target: 'reward-copy',
    nextTo: 'qixi-audit-thinking',
    hold: 750,
  },
  {
    id: 'qixi-reward-680-selected',
    view: { kind: 'user', text: '暂按 680 元出稿' },
    target: 'reward-copy',
    hold: 500,
  },
  {
    id: 'qixi-reward-680-applied',
    view: {
      kind: 'ai',
      text: '当前也没有足够证据把 680 元当成正式金额。我会保留候选值并继续使用配置占位，避免把未确认预算扩散到 KV、券面和分享图。',
    },
    target: 'reward-copy',
    nextTo: 'qixi-audit-thinking',
    hold: 750,
  },
  {
    id: 'qixi-audit-thinking',
    view: {
      kind: 'think',
      group: 'qixi-audit',
      title: '对抗式试玩灰模',
      lines: [
        '0 次机会时主按钮仍写“找喜鹊”，点击只出现轻提示，用户会把正确的机会消耗误判成页面坏了。',
        '7 关复用了同一组目标坐标，目标还是 30px 的明牌“鹊”；这只能验证状态机，不能验证找图难度。',
        '误点反馈固定出现在画面中央，没有告诉用户刚才点错了哪里；退出链路虽能结算，但反馈层级偏绕。',
        '正式上画前必须先让灰模具备可测的命中区、反馈和机会不足去向，否则批量素材会把交互问题放大七次。',
      ],
    },
    target: 'playtest-audit',
    hold: 1300,
  },
  {
    id: 'qixi-audit-choice',
    view: {
      kind: 'ai',
      text: '灰模能点通，但还不能叫“玩法通过”。机会不足去向、命中区和误点反馈属于质量缺陷，我会先修复再做视觉样张。\n\n这类问题不应该让用户在“修不修”之间选择；Agent 负责执行，用户只需在后续样张验收真实体验。',
      cards: [
        {
          id: 'qixi-playtest-audit',
          type: 'play',
          badge: 'Agent 自动修复',
          title: '前端试玩审查',
          desc: '机会不足 · 命中区 · 误点位置 · 7 关差异',
        },
      ],
    },
    target: 'playtest-audit',
    nextTo: 'qixi-audit-fix-applied',
    hold: 850,
  },
  {
    id: 'qixi-audit-fix-selected',
    view: { kind: 'user', text: '按 Agent 推荐执行：先修玩法，再上样张' },
    target: 'playtest-audit',
    hold: 450,
  },
  {
    id: 'qixi-audit-fix-applied',
    view: {
      kind: 'ai',
      text: '已先收紧灰模：0 次机会时主按钮改为“去得闯关机会”并定位任务区；命中热区扩大到 44px；误点叉回到实际触点。第 1 关改用独立的 5 个目标落点，其余 6 关仍明确标记为待生成，避免把复用占位伪装成完成。',
    },
    target: 'playtest-audit',
    nextTo: 'qixi-sample-thinking',
    hold: 900,
  },
  {
    id: 'qixi-audit-batch-selected',
    view: { kind: 'user', text: '先把 7 关背景都生成出来' },
    target: 'playtest-audit',
    hold: 450,
  },
  {
    id: 'qixi-audit-batch-applied',
    view: {
      kind: 'ai',
      text: '我不会把尚未验证的目标落点放大成 7 张返工。先保留批量方案，实际仍从第 1 关联合样张开始；它通过后再复用视觉约束，而不是复用错误坐标。',
    },
    target: 'playtest-audit',
    nextTo: 'qixi-sample-thinking',
    hold: 850,
  },
  {
    id: 'qixi-audit-hero-selected',
    view: { kind: 'user', text: '先只把首页头图做好' },
    target: 'playtest-audit',
    hold: 450,
  },
  {
    id: 'qixi-audit-hero-applied',
    view: {
      kind: 'ai',
      text: '只换头图会让页面看起来更接近成品，却掩盖核心玩法仍不可测。我会把首页 KV 与第 1 关一起出样，确保视觉不是一层贴皮。',
    },
    target: 'playtest-audit',
    nextTo: 'qixi-sample-thinking',
    hold: 850,
  },
  {
    id: 'qixi-sample-thinking',
    view: {
      kind: 'think',
      group: 'qixi-sample',
      title: '定义最小视觉验证包',
      lines: [
        '只出 KV 验不了喜鹊是否能融入场景；直接出全量又会在构图未定时浪费 6 张背景。',
        '最小验证包应同时包含首页主 KV 与第 1 关：前者定活动识别，后者定环境密度、目标尺寸和点击落点。',
        '文字和金额继续用前端 DOM 叠加，不烘进图片；这样 X / 480 / 680 的业务冲突不会污染素材。',
      ],
    },
    target: 'visual-sample',
    hold: 1100,
  },
  {
    id: 'qixi-sample-choice',
    view: {
      kind: 'ai',
      text: '设计风格已经确定，下一步不再让用户选生成范围。为了用最少素材同时验证活动识别度和找图体验，我会先生成“主 KV + 第 1 关”联合样张，通过后再批量展开。',
      cards: [
        {
          id: 'qixi-visual-sample',
          type: 'asset',
          badge: 'Agent 自动生成',
          title: '最小视觉验证包',
          desc: '主 KV · 第 1 关场景 · 5 个真实目标落点',
        },
      ],
    },
    target: 'visual-sample',
    nextTo: 'qixi-sample-joint-generated',
    hold: 850,
  },
  {
    id: 'qixi-sample-joint-selected',
    view: { kind: 'user', text: '按 Agent 推荐执行：主 KV + 第 1 关联合样张' },
    target: 'visual-sample',
    hold: 450,
  },
  {
    id: 'qixi-sample-joint-generated',
    view: {
      kind: 'think',
      group: 'qixi-sample-generate',
      title: '生成并校验联合样张',
      lines: [
        '首页主 KV 采用黛蓝月夜、米白月盘与鹊羽叠桥，保留清晰的标题区域。',
        '第 1 关采用同一套月夜园林风格，5 只喜鹊融入场景但仍能在手机屏幕上被识别。',
        '图片不包含活动文字或未确认金额，后续更改文案时不需要重新生成图片。',
        '素材库只保留通过检查的主 KV 和第 1 关样张，其余候选不进入项目。',
      ],
    },
    target: 'visual-sample',
    hold: 1350,
  },
  {
    id: 'qixi-sample-joint-applied',
    view: {
      kind: 'ai',
      text: '联合样张已落位：首页不再是 KV 占位，第 1 关也不再是明牌“鹊”按钮，而是 5 只真正融进月夜园林的喜鹊。当前只验证了 1/7 关；其余 6 关背景、桥进度、奖励弹窗、奖品图和分享图仍待后续批量生成。',
      cards: [
        {
          id: 'qixi-visual-sample-result',
          type: 'asset',
          badge: '2 张样张',
          title: '现代东方月夜剪纸 · v1',
          desc: '主 KV 已落位 · 第 1 关可找 5 只喜鹊 · 其余素材待生成',
        },
      ],
    },
    target: 'visual-sample',
    nextTo: 'qixi-current-build',
    hold: 950,
  },
  {
    id: 'qixi-sample-hero-selected',
    view: { kind: 'user', text: '先只做首页 KV' },
    target: 'visual-sample',
    hold: 450,
  },
  {
    id: 'qixi-sample-hero-applied',
    view: {
      kind: 'ai',
      text: '首页 KV 可以单独生成，但它不足以验收核心玩法。我会保留这个低成本分支，当前版本仍补齐第 1 关联合样张后再进入批量阶段。',
    },
    target: 'visual-sample',
    nextTo: 'qixi-sample-joint-generated',
    hold: 850,
  },
  {
    id: 'qixi-sample-full-selected',
    view: { kind: 'user', text: '直接生成完整素材包' },
    target: 'visual-sample',
    hold: 450,
  },
  {
    id: 'qixi-sample-full-applied',
    view: {
      kind: 'ai',
      text: '完整素材包应以通过的样张为母版，而不是把未经验证的方向复制七遍。当前仍先完成联合样张，批量生成作为下一阶段继续。',
    },
    target: 'visual-sample',
    nextTo: 'qixi-sample-joint-generated',
    hold: 850,
  },
  {
    id: 'qixi-shell-feedback',
    view: {
      kind: 'user',
      text: '现在还是壳子：「页面」应该是把真实 H5 放到画布上直接编辑，「素材库」也要对齐其他项目；另外预览长页现在滚不动。',
    },
    target: 'product-shell',
    hold: 550,
  },
  {
    id: 'qixi-shell-audit',
    view: {
      kind: 'think',
      group: 'qixi-shell-audit',
      title: '审查产品壳层与项目一致性',
      lines: [
        '「页面」被七夕专属的说明型矩阵页截走，导致真实 H5 没有进入通用点阵画布，也无法选中页面模块。',
        '「素材库」另做了两张样张展示页，缺少 Grid / List / 页面使用、上传、画布编辑与单图详情。',
        '预览内层只有 min-height 而没有可计算的滚动高度，父层 overflow hidden 直接截断了首页底部。',
        '收口原则：预览只负责运行；页面进真实画布并就地编辑；素材库只注册当前真实存在的 2 张样张。',
      ],
    },
    target: 'product-shell',
    hold: 1200,
  },
  {
    id: 'qixi-shell-applied',
    view: {
      kind: 'ai',
      text: '七夕已收回通用营销项目模型：预览长页可纵向滚动；「页面」放置真实 H5，点击头图、鹊桥进度、任务或榜单后可在右侧就地改文案；「素材库」复用统一分组、列表、页面使用与单图无限画布。',
      cards: [
        {
          id: 'qixi-page-canvas',
          type: 'wire',
          badge: '已对齐通用框架',
          title: '页面画布与素材库',
          desc: '真实 H5 · 就地编辑 · 页面使用 · 单图画布',
        },
      ],
    },
    target: 'product-shell',
    nextTo: 'qixi-runtime-review-feedback',
    hold: 900,
  },
  {
    id: 'qixi-runtime-review-feedback',
    view: {
      kind: 'user',
      text: '规则页不要再给“待补文案”留位置；整个回放左右信息太多、选择呈现不好，还有跳跃。项目文档要持久保留，多份文档用 Tab，多轮确认只能增加记录，不能互相替换。',
    },
    target: 'product-shell',
    hold: 650,
  },
  {
    id: 'qixi-runtime-review-audit',
    view: {
      kind: 'think',
      group: 'qixi-runtime-review',
      title: '重审回放架构、Agent 能力与用户动线',
      lines: [
        '运行时活动页混入“样张、占位、待补、灰模演示”等制作说明，导致页面看似有结构、实际不像可交付页面；制作进度应只留在工作台和回放。',
        '7 个选择里，页面复用、需求基线和试玩缺陷修复都有明确最优解，本应由 Agent 自动执行；把它们做成选择题既增加负担，也制造伪协作。',
        '右侧产物按每条叙述自动切 Tab，左侧又同步展开长选择卡，注意力被双向抢夺；应保持当前产物稳定，只有用户点击产物卡时才切换。',
        '项目文档按阶段替换内容会让早期证据消失；需求原文、结构方案、决策记录必须并存，后两者只能向下追加。',
        '真实 Agent 可以解析文档、生成前端、产图并做本地测试，但不能确认预算、真实库存、风控或发奖；这些必须明确成为发布门禁，而不是被 mock 状态掩盖。',
      ],
    },
    target: 'product-shell',
    hold: 1400,
  },
  {
    id: 'qixi-runtime-review-applied',
    view: {
      kind: 'ai',
      text: '回放已收口为 3 次用户确认：定范围、定玩法、定设计风格。白模结构、未知金额隔离、试玩修复与最小样张范围由 Agent 自动完成。\n\n项目文档分为“需求原文 / 活动方案 / 确认结果”三个 Tab：原文只读，其余文档可在阅读与 Markdown 之间切换并继续编辑。',
      cards: [
        {
          id: 'qixi-decision-log',
          type: 'doc',
          badge: '架构纠偏已记录',
          title: '三次确认与持久文档',
          desc: '用户只定关键方向 · Agent 自动完成其余动作',
        },
      ],
    },
    target: 'product-shell',
    nextTo: 'qixi-component-edit-feedback',
    hold: 1000,
  },
  {
    id: 'qixi-component-edit-feedback',
    view: {
      kind: 'user',
      text: '「页面」里的产物还不能像 Figma 一样单选组件：点按钮时仍然像在编辑整个页面。页面应该按组件模块生成，标题、按钮、任务卡都能独立选中并编辑。',
    },
    target: 'product-shell',
    hold: 650,
  },
  {
    id: 'qixi-component-edit-audit',
    view: {
      kind: 'think',
      group: 'qixi-component-edit',
      title: '对照 MagicX H5 Code Mode 重建选择模型',
      lines: [
        '旧实现只有 hero / bridge / tasks / feed 四个 section 枚举，右侧只是按大区块切换表单；按钮、标题和任务项没有独立身份，所以交互看起来始终像“编辑整页”。',
        'MagicX Code Mode 把 DOM / 组件树作为分层事实源，以稳定 data-ref 与 elementPath 定位元素；点击后显示选框，右侧只编辑当前对象。',
        '响应式 H5 不应照搬 Figma 的自由拖拽：流式布局里的按钮位置由组件约束决定。本轮对齐组件单选、文案与外观属性，不制造会破坏响应式结构的绝对定位。',
        '玩法进度、机会次数等运行数据仍归状态机，只能选中查看绑定关系，不能被静态页面编辑器改成假数据。',
      ],
    },
    target: 'product-shell',
    hold: 1250,
  },
  {
    id: 'qixi-component-edit-applied',
    view: {
      kind: 'ai',
      text: '页面编辑已升级为两级对象模型：4 个页面模块下有 18 个可选组件。单击标题、找喜鹊按钮、抽奖入口、签到任务或邀请按钮，会出现独立蓝色选框并自动打开对应属性；修改文案、填充、文字色或圆角只回写当前对象。\n\n关卡进度等数据驱动组件仍保持只读绑定，避免页面编辑器伪造运行状态。',
      cards: [
        {
          id: 'qixi-page-canvas',
          type: 'wire',
          badge: '组件单选已接入',
          title: 'H5 页面组件编辑',
          desc: '稳定 data-ref · 蓝色选框 · 对象级属性 · 状态数据只读',
        },
      ],
    },
    target: 'product-shell',
    nextTo: 'qixi-current-build',
    hold: 950,
  },
  {
    id: 'qixi-current-build',
    view: {
      kind: 'ai',
      text: '已按确认的风格生成页面并完成一轮自检：首页主 KV 和第 1 关样张已落位，长页可滚动，标题、按钮和任务卡可单独编辑。\n\n自检中的热区、误点反馈、机会不足去向和未确认金额已自动处理，详情写入活动方案，不再逐条刷屏。',
    },
    target: 'current-result',
    hold: 1200,
  },
  {
    id: 'qixi-current-result',
    view: {
      kind: 'ai',
      text: '当前版本已完成范围、玩法和设计风格 3 次确认。Agent 已自动完成白模结构、异常信息隔离、试玩修复和最小样张生成。\n\n首页主 KV 与第 1 关已落位，页面可以按组件单独编辑，项目文档也可在阅读和 Markdown 两种状态中继续补充。当前还不是完整上线稿：其余 6 关与奖励、抽奖、分享素材待生成，奖励金额待业务确认。',
      cards: [
        {
          id: 'qixi-decision-log',
          type: 'doc',
          badge: '3 项已确认',
          title: '活动方案',
          desc: '活动范围 · 玩法节奏 · 设计风格 · 待补资料',
        },
        {
          id: 'qixi-page-canvas',
          type: 'wire',
          badge: '真实页面画布',
          title: '七夕活动页面编辑',
          desc: '4 个模块 · 18 个组件 · 单选框 · 对象级属性',
        },
        {
          id: 'qixi-playable',
          type: 'play',
          badge: '第 1 关可试玩',
          title: '找喜鹊联合样张',
          desc: '5 只喜鹊 · 44px 热区 · 就地点错反馈',
        },
        {
          id: 'qixi-visual-direction',
          type: 'asset',
          badge: '2 张样张',
          title: '现代东方月夜剪纸',
          desc: '主 KV + 第 1 关已落位 · 其余素材待生成',
        },
      ],
    },
    target: 'current-result',
    hold: 0,
  },
]

export const qixiReplayIndex = (id: string): number =>
  QIXI_GENERATION_REPLAY_SCRIPT.findIndex((step) => step.id === id)

const QIXI_COMPLETED_STEP_IDS = [
  'qixi-request',
  'qixi-source-doc',
  'qixi-parse',
  'qixi-scope-choice',
  'qixi-scope-complete-selected',
  'qixi-scope-complete-applied',
  'qixi-wireframe-choice',
  'qixi-gameplay-choice',
  'qixi-gameplay-baseline-selected',
  'qixi-gameplay-baseline-applied',
  'qixi-visual-choice',
  'qixi-visual-eastern-selected',
  'qixi-visual-eastern-applied',
  'qixi-current-build',
  'qixi-current-result',
] as const

export const QIXI_REPLAY_COMPLETED_PATH =
  QIXI_COMPLETED_STEP_IDS.map(qixiReplayIndex)
