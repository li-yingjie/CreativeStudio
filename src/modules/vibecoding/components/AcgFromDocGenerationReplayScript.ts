import type { BuildStep } from './XiahuaBuildScript'
import { ACG_FROM_DOC_BRAND_KIT_CANDIDATES } from '../assets/acgExperienceBrandKit.ts'

const [STAR_FAIR_KIT, MANGA_ANNUAL_KIT, CANDY_ARCADE_KIT] =
  ACG_FROM_DOC_BRAND_KIT_CANDIDATES

export type AcgFromDocReplayTarget =
  | 'source-understanding'
  | 'scope-decision'
  | 'wireframe'
  | 'gameplay-decision'
  | 'visual-decision'
  | 'generation-review'
  | 'current-result'

export type AcgFromDocReplayStep = BuildStep & {
  target?: AcgFromDocReplayTarget
  nextTo?: string
}

export const ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT: AcgFromDocReplayStep[] = [
  {
    id: 'acg-doc-request',
    view: {
      kind: 'user',
      text: '根据需求生成活动页面 https://bytedance.larkoffice.com/docx/VBFIdHa1Jovf12xEbUTcbxjynvb',
    },
    target: 'source-understanding',
    hold: 700,
  },
  {
    id: 'acg-doc-source',
    view: {
      kind: 'doc',
      text: '已读取项目定位、活动形式、活动时间和 3 个内嵌飞书画板；原文只读，不读取旧 Figma 方案。',
      fileName: '抖音 ACG 新春会活动需求.docx',
      meta: '主会场 + 分会场 · 六篇章 · 夯/拉 · 福利 · 晚会许愿',
    },
    target: 'source-understanding',
    hold: 700,
  },
  {
    id: 'acg-doc-parse',
    view: {
      kind: 'ai',
      text: '已生成《页面需求》。本次不读取旧 Figma。文档描述的不是把六篇内容平铺在一张专题页，而是一个两级活动产品：主会场负责当前篇章、主理人、双榜、征稿、许愿和福利；游戏 / 二次元分会场负责按品类聚合内容与累计夯拉积分。\n\n原文个别位置写“五大篇章”，但主题表和时间轴实际都是六篇章，本项目统一按六篇章。先确认本期前端体验边界。',
    },
    target: 'source-understanding',
    hold: 1300,
  },
  {
    id: 'acg-doc-scope-choice',
    view: {
      kind: 'ai',
      text: '我推荐“完整 C 端活动体验”：主会场和分会场都做，内容详情、完整规则和奖励反馈用页面层承接；征稿后台、直播推流与服务端风控不做。这样既覆盖需求核心，也不把纯前端原型伪装成全链路系统。',
      cards: [
        {
          id: 'acg-doc-page-requirement',
          type: 'doc',
          badge: '确认 1/3',
          title: '确定本期活动边界',
          desc: '用户能看到什么 · 能做什么 · 哪些能力后置',
        },
      ],
    },
    target: 'scope-decision',
    gate: {
      confirm: '采用 Agent 推荐范围',
      choiceLayout: 'compact',
      choices: [
        {
          title: '完整 C 端活动体验',
          eyebrow: 'Agent 推荐',
          tag: 'P0',
          desc: '主会场 + 游戏 / 二次元分会场，并包含详情、规则、投票、任务与奖励反馈。',
          facts: ['2 级页面结构', '多种用户状态', '后端数据前端模拟'],
          recommended: true,
          to: 'acg-doc-scope-main-selected',
        },
        {
          title: '只做主会场',
          tag: '更轻',
          desc: '保留篇章、夯拉、许愿和福利，但不验证文档明确提出的 IP / 品类分会场。',
          facts: ['开发更轻', '缺少分会场', '需求覆盖不完整'],
          to: 'acg-doc-scope-showcase-selected',
        },
        {
          title: '全链路都做',
          tag: '不建议',
          desc: '加入征稿后台、真实直播、抽奖发奖与风控，扩大到运营端和服务端。',
          facts: ['至少 3 个端', '依赖真实接口', '无法在本期验证'],
          to: 'acg-doc-scope-all-selected',
        },
        {
          title: '其他',
          desc: '输入你希望本期完成的页面边界。',
          input: true,
          placeholder: '补充活动边界…',
          to: 'acg-doc-scope-custom-selected',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'acg-doc-scope-main-selected',
    view: { kind: 'user', text: '按推荐做完整 C 端活动体验' },
    target: 'scope-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-scope-main-applied',
    view: {
      kind: 'ai',
      text: '边界已追加到《页面需求》：本期交付主会场、游戏 / 二次元分会场，以及内容详情、规则和奖励反馈层；征稿后台、真实直播、发奖与风控后置。',
    },
    target: 'scope-decision',
    nextTo: 'acg-doc-wireframe',
    hold: 700,
  },
  {
    id: 'acg-doc-scope-showcase-selected',
    view: { kind: 'user', text: '先只做主会场' },
    target: 'scope-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-scope-showcase-applied',
    view: {
      kind: 'ai',
      text: '这会漏掉画板明确给出的品类分会场与累计积分。我会记录该分支，但默认验收仍保留分会场，避免把需求理解成单页专题。',
    },
    target: 'scope-decision',
    nextTo: 'acg-doc-wireframe',
    hold: 750,
  },
  {
    id: 'acg-doc-scope-all-selected',
    view: { kind: 'user', text: '征稿、直播和抽奖都做' },
    target: 'scope-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-scope-all-applied',
    view: {
      kind: 'ai',
      text: '这会超出“只验证前端活动页”的边界，也会把依赖真实服务端的能力做成假壳子。我先完成可验证的 C 端页面状态，其余能力进入后续清单。',
    },
    target: 'scope-decision',
    nextTo: 'acg-doc-wireframe',
    hold: 750,
  },
  {
    id: 'acg-doc-scope-custom-selected',
    view: { kind: 'user', text: '补充本期活动边界' },
    target: 'scope-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-scope-custom-applied',
    view: {
      kind: 'ai',
      text: '补充内容已追加进《页面需求》，页面框架将按新边界生成。',
    },
    target: 'scope-decision',
    nextTo: 'acg-doc-wireframe',
    hold: 700,
  },
  {
    id: 'acg-doc-wireframe',
    view: {
      kind: 'think',
      group: 'acg-doc-wireframe',
      title: 'Agent 从用户任务生成页面模型',
      lines: [
        '首屏先回答“今天开到哪一篇、现在能做什么”，世界观只做氛围。',
        '主会场承载当前篇章、主理人、征稿、双榜、随机内容、许愿和福利回路。',
        '游戏 / 二次元分会场按品类聚合六篇章内容，并展示累计夯拉积分。',
        '内容详情、规则和奖励使用独立页面层，避免所有信息挤在一条长页里。',
        '投票与作品同场出现；投票后立即反馈榜单与任务进度，再引导继续浏览。',
      ],
    },
    target: 'wireframe',
    hold: 1300,
  },
  {
    id: 'acg-doc-wireframe-ready',
    view: {
      kind: 'ai',
      text: '页面模型已由 Agent 自动完成：主会场解决“今天做什么”，分会场解决“我关心什么”，Big Day 解决“为什么回来”；详情、规则和奖励反馈不再挤进主长页。下一步只确认玩法主线。',
      cards: [
        {
          id: 'acg-doc-page-canvas',
          type: 'wire',
          badge: 'Agent 自动完成',
          title: '两级活动页面模型',
          desc: '主会场 + 分会场 + 3 类反馈层 · 可分组件编辑',
        },
      ],
    },
    target: 'wireframe',
    nextTo: 'acg-doc-gameplay-choice',
    hold: 700,
  },
  {
    id: 'acg-doc-gameplay-choice',
    view: {
      kind: 'ai',
      text: '玩法核心不是“逛完六站”，而是一个持续回来的参与回路。我推荐“篇章解锁 + 单作品夯拉 + 奖励回路”：先看当前篇章，在作品上下文里投票，双榜和任务即时反馈，许愿把用户带到 Big Day。',
      cards: [
        {
          id: 'acg-doc-gameplay',
          type: 'play',
          badge: '确认 2/3',
          title: '确定玩法主线',
          desc: '当前篇章 → 单作品夯拉 → 双榜 / 任务 → Big Day',
        },
      ],
    },
    target: 'gameplay-decision',
    gate: {
      confirm: '采用 Agent 推荐玩法',
      choiceLayout: 'compact',
      choices: [
        {
          title: '篇章解锁 + 夯拉 + 奖励',
          eyebrow: 'Agent 推荐',
          tag: '完整闭环',
          desc: '用户每次先看到当前可做任务，投票后获得榜单与福利反馈，再继续发现内容。',
          facts: ['时间驱动', '即时反馈', '持续回访'],
          recommended: true,
          to: 'acg-doc-gameplay-journey-selected',
        },
        {
          title: '只做阵营总 PK',
          tag: '更强对抗',
          desc: '把六篇章压成两个阵营，冲突更强，但会损失原文的六段内容心智。',
          facts: ['强竞争', '篇章被弱化', '解释成本高'],
          to: 'acg-doc-gameplay-pk-selected',
        },
        {
          title: '只做内容投票',
          tag: '更直接',
          desc: '直接进入榜单投票，操作短，但无法建立新春会旅程和内容发现。',
          facts: ['一步投票', '没有探索', '年度感较弱'],
          to: 'acg-doc-gameplay-vote-selected',
        },
        {
          title: '其他',
          desc: '输入你希望的玩法主线。',
          input: true,
          placeholder: '补充玩法主线…',
          to: 'acg-doc-gameplay-custom-selected',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'acg-doc-gameplay-journey-selected',
    view: { kind: 'user', text: '采用篇章解锁 + 夯拉 + 奖励回路' },
    target: 'gameplay-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-gameplay-journey-applied',
    view: {
      kind: 'ai',
      text: '玩法已写入《确认结果》，并新建《玩法配置》：篇章开放 / 待解锁、作品未投 / 已投夯 / 已投拉、双榜切换、任务进度、抽奖次数、心愿提交和分会场积分都由前端状态驱动。',
    },
    target: 'gameplay-decision',
    nextTo: 'acg-doc-visual-choice',
    hold: 750,
  },
  {
    id: 'acg-doc-gameplay-pk-selected',
    view: { kind: 'user', text: '改成两大阵营 PK' },
    target: 'gameplay-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-gameplay-pk-applied',
    view: {
      kind: 'ai',
      text: '阵营总 PK 会覆盖六篇章的内容组织，也无法解释单作品夯拉和篇章奖励。我会把它记录为分会场积分表现，主线仍保留篇章解锁与单作品投票。',
    },
    target: 'gameplay-decision',
    nextTo: 'acg-doc-visual-choice',
    hold: 750,
  },
  {
    id: 'acg-doc-gameplay-vote-selected',
    view: { kind: 'user', text: '只做年度节目投票' },
    target: 'gameplay-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-gameplay-vote-applied',
    view: {
      kind: 'ai',
      text: '可以收短，但会损失时间解锁、福利任务和 Big Day 回访理由。我会保留快速投票入口，完整体验仍按参与回路组织。',
    },
    target: 'gameplay-decision',
    nextTo: 'acg-doc-visual-choice',
    hold: 750,
  },
  {
    id: 'acg-doc-gameplay-custom-selected',
    view: { kind: 'user', text: '补充玩法主线' },
    target: 'gameplay-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-gameplay-custom-applied',
    view: {
      kind: 'ai',
      text: '补充玩法已追加到《确认结果》，并同步更新《玩法配置》。',
    },
    target: 'gameplay-decision',
    nextTo: 'acg-doc-visual-choice',
    hold: 700,
  },
  {
    id: 'acg-doc-visual-choice',
    view: {
      kind: 'ai',
      text: '我已基于页面蓝图组装三套可直接执行的 Brand Kit。每套都包含代表素材图、色彩与艺术字、Hero 构图、玩法组件皮肤和生图约束；右侧已切到素材库，请整套定调。',
      cards: [
        {
          id: 'acg-doc-style-board',
          type: 'asset',
          badge: '确认 3/3 · 3 套 Brand Kit',
          title: '选择页面 Brand Kit',
          desc: `${STAR_FAIR_KIT.name} · ${MANGA_ANNUAL_KIT.name} · ${CANDY_ARCADE_KIT.name}`,
        },
      ],
    },
    target: 'visual-decision',
    gate: {
      confirm: '采用 Agent 推荐 Brand Kit',
      choiceLayout: 'compact',
      choices: [
        {
          title: STAR_FAIR_KIT.name,
          eyebrow: 'Agent 推荐',
          tag: '年度内容感',
          desc: STAR_FAIR_KIT.positioning,
          facts: ['明亮主 KV', '六站旅程舞台', '4 套玩法皮肤'],
          recommended: true,
          to: 'acg-doc-visual-star-selected',
        },
        {
          title: MANGA_ANNUAL_KIT.name,
          tag: '创作者感',
          desc: MANGA_ANNUAL_KIT.positioning,
          facts: ['分镜主 KV', '年刊编辑系统', '4 套印刷玩法皮肤'],
          to: 'acg-doc-visual-manga-selected',
        },
        {
          title: CANDY_ARCADE_KIT.name,
          tag: '潮玩感',
          desc: CANDY_ARCADE_KIT.positioning,
          facts: ['3D 潮玩主 KV', '电玩反馈系统', '4 套游戏机玩法皮肤'],
          to: 'acg-doc-visual-candy-selected',
        },
        {
          title: '其他',
          desc: '补充品牌气质、组件解剖或材质约束，Agent 会组装为第四套 Brand Kit。',
          input: true,
          placeholder: '补充 Brand Kit 方向…',
          to: 'acg-doc-visual-custom-selected',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'acg-doc-visual-star-selected',
    view: { kind: 'user', text: `采用${STAR_FAIR_KIT.name}` },
    target: 'visual-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-visual-star-applied',
    view: {
      kind: 'ai',
      text: `Brand Kit 已锁定：${STAR_FAIR_KIT.name} @${STAR_FAIR_KIT.version}。后续主 KV、艺术字、篇章素材、玩法皮肤和按钮状态全部继承同一 Kit；交互文字、票数和状态仍保持组件级可编辑。`,
    },
    target: 'visual-decision',
    nextTo: 'acg-doc-asset-plan',
    hold: 750,
  },
  {
    id: 'acg-doc-visual-manga-selected',
    view: { kind: 'user', text: `采用${MANGA_ANNUAL_KIT.name}` },
    target: 'visual-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-visual-manga-applied',
    view: {
      kind: 'ai',
      text: `Brand Kit 已锁定：${MANGA_ANNUAL_KIT.name} @${MANGA_ANNUAL_KIT.version}。Agent 将用分镜、目录、票根和印刷约束统一后续素材与组件，不再回退到其他方向。`,
    },
    target: 'visual-decision',
    nextTo: 'acg-doc-asset-plan',
    hold: 750,
  },
  {
    id: 'acg-doc-visual-candy-selected',
    view: { kind: 'user', text: `采用${CANDY_ARCADE_KIT.name}` },
    target: 'visual-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-visual-candy-applied',
    view: {
      kind: 'ai',
      text: `Brand Kit 已锁定：${CANDY_ARCADE_KIT.name} @${CANDY_ARCADE_KIT.version}。Agent 将用 3D 潮玩、透明材质和电玩反馈系统统一后续素材与组件，不再回退到其他方向。`,
    },
    target: 'visual-decision',
    nextTo: 'acg-doc-asset-plan',
    hold: 750,
  },
  {
    id: 'acg-doc-visual-custom-selected',
    view: { kind: 'user', text: '补充新的 Brand Kit 方向' },
    target: 'visual-decision',
    hold: 450,
  },
  {
    id: 'acg-doc-visual-custom-applied',
    view: {
      kind: 'ai',
      text: '新的 Brand Kit 要求已追加到《确认结果》。Agent 会先编译出色彩、字体、Hero、组件皮肤和生图提示词合约，再进入素材生产。',
    },
    target: 'visual-decision',
    nextTo: 'acg-doc-asset-plan',
    hold: 700,
  },
  {
    id: 'acg-doc-asset-plan',
    view: {
      kind: 'think',
      group: 'acg-doc-asset-generation',
      title: '根据页面蓝图生成 Asset BOM',
      lines: [
        '继承已选 Campaign Brand Kit + 抖音 ACG 平台基础 Kit：三层 Hero、连续舞台、一玩法一皮肤、内容密度分级。',
        '主身份：1 张竖版主 KV + 1 张透明艺术字标题，分别保留移动端安全区。',
        '篇章系统：6 张篇章场景 + 6 张主理人头像，对应六站内容与状态卡。',
        '内容系统：6 张原创作品封面，覆盖焦点作品、双榜、随机 Feed 与详情层。',
        '权益系统：6 张奖励物件图，覆盖任务、抽奖、头像框、心愿与 Big Day。',
        '舞台系统：弧形转场、玩法贴纸标题、蓝红对抗底板、愿望纸条与抽奖装置分别编译。',
        '统一低噪点约束：大色块、平滑渐变、克制微纹理与稀疏粒子；拒绝颗粒、斑驳、过锐和高频碎细节。',
        '逐项检查无文字污染、无已有 IP、无占位图，并绑定到可编辑组件。',
      ],
    },
    target: 'generation-review',
    hold: 1500,
  },
  {
    id: 'acg-doc-assets-ready',
    view: {
      kind: 'ai',
      text: '页面素材已按 Brand Kit 与蓝图逐项生成并通过首轮检查：主 KV、艺术字、六篇章场景、六位主理人、六张作品封面和六件奖励物，共 26 项；舞台与玩法皮肤由组件层编译。素材库保留 Kit 版本、用途、提示词与低噪点约束；下一步进入组件绑定与整页审查。',
      cards: [
        {
          id: 'acg-doc-production-assets',
          type: 'asset',
          badge: '26 项页面素材',
          title: '星轨庙会 · 页面视觉组件包',
          desc: '主 KV · 艺术字 · 篇章 · 作品 · 主理人 · 奖励',
        },
      ],
    },
    target: 'generation-review',
    nextTo: 'acg-doc-generate',
    hold: 900,
  },
  {
    id: 'acg-doc-generate',
    view: {
      kind: 'think',
      group: 'acg-doc-generation',
      title: '生成页面并进行前端审查',
      lines: [
        '将主 KV、透明艺术字、篇章场景、主理人头像、作品封面和奖励物件逐项绑定到组件。',
        '实现主会场当前任务、篇章锁定、主理人、征稿、作品详情、夯拉双榜和随机内容流。',
        '实现游戏 / 二次元分会场切换、品类积分和按六篇章聚合的内容投票。',
        '实现心愿、任务、抽奖、完整规则与奖励反馈层。',
        '检查至少 6 个业务区块、4 种玩法皮肤和 7 类素材槽位，禁止全页复用同一种白卡。',
        '逐段对照 750 × 9776 Golden Reference 的视觉层级、信息密度与转场节奏，但不复制其中角色、头像和作品成片。',
        '检查没有占位图、组件视觉状态齐全，并验证手机滚动、会场切换、对象级点选、投票状态和浮层关闭。',
      ],
    },
    target: 'generation-review',
    hold: 1500,
  },
  {
    id: 'acg-doc-review-applied',
    view: {
      kind: 'ai',
      text: '页面审查完成：已按 Golden Reference 的明亮群像 Hero、立体标题、蓝红对抗、排行卡、横向心愿纸条和实体抽奖机逐段复核；26 项原创页面素材已经实际落位，不再使用渐变方块或字符代替封面。主会场与两个分会场可切换并独立滚动；单作品投票会更新任务进度；心愿、规则、详情和奖励层均可闭环；榜单中的每张作品卡也可以单独点选编辑。',
    },
    target: 'generation-review',
    hold: 850,
  },
  {
    id: 'acg-doc-current-result',
    view: {
      kind: 'ai',
      text: '高保真活动页面已交付，右侧已切到真实预览。主会场按新春会舞台顺序展开：群像主 KV → 当前篇章与主理人 → 抓马对抗与作品赛场 → 春晚许愿 → 实体抽奖机与任务；游戏 / 二次元分会场仍可切换并继续给六篇章内容投票。\n\n项目文档保留需求原文、持续更新的页面方案和只追加的确认结果；页面 Tab 下可点选独立模块、单张榜单作品、投票、任务或按钮进行对象级编辑。',
      cards: [
        {
          id: 'acg-doc-final-preview',
          type: 'play',
          badge: '可交互交付',
          title: '抖音 ACG 新春会 · 高保真活动体验',
          desc: '群像主 KV · 双分会场 · 抓马投票 · 许愿 · 实体抽奖机',
        },
        {
          id: 'acg-doc-page-canvas',
          type: 'wire',
          badge: '8 类模块 + 单卡实例',
          title: '页面组件画布',
          desc: '模块点选 · 单张作品点选 · 状态组件点选 · 文案即时回写',
        },
        {
          id: 'acg-doc-style-board',
          type: 'asset',
          badge: '26 项生产素材',
          title: '页面视觉组件包',
          desc: '主 KV、艺术字、篇章、作品、主理人和奖励均可追溯',
        },
      ],
    },
    target: 'current-result',
    hold: 0,
  },
]

export const acgFromDocReplayIndex = (id: string): number =>
  ACG_FROM_DOC_GENERATION_REPLAY_SCRIPT.findIndex((step) => step.id === id)

const ACG_FROM_DOC_COMPLETED_STEP_IDS = [
  'acg-doc-request',
  'acg-doc-source',
  'acg-doc-parse',
  'acg-doc-scope-choice',
  'acg-doc-scope-main-selected',
  'acg-doc-scope-main-applied',
  'acg-doc-wireframe',
  'acg-doc-wireframe-ready',
  'acg-doc-gameplay-choice',
  'acg-doc-gameplay-journey-selected',
  'acg-doc-gameplay-journey-applied',
  'acg-doc-visual-choice',
  'acg-doc-visual-star-selected',
  'acg-doc-visual-star-applied',
  'acg-doc-asset-plan',
  'acg-doc-assets-ready',
  'acg-doc-generate',
  'acg-doc-review-applied',
  'acg-doc-current-result',
] as const

export const ACG_FROM_DOC_REPLAY_COMPLETED_PATH =
  ACG_FROM_DOC_COMPLETED_STEP_IDS.map(acgFromDocReplayIndex)
