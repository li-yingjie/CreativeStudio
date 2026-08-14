import type { BuildStep } from './XiahuaBuildScript'

export type AcgReplayTarget =
  | 'source-understanding'
  | 'activity-strategy'
  | 'asset-binding'
  | 'activity-blueprint'
  | 'delivery-overview'
  | 'game-runtime'

export type AcgReplayStep = BuildStep & {
  /** The project surface that should be visible when this event is replayed. */
  target?: AcgReplayTarget
  /** Explicit continuation for a branch that is not adjacent in the source array. */
  nextTo?: string
}

const TEMPLATE_ID = 'template.ip-co-brand-dual-venue-event'
const BRAND_ID = 'brand.douyin-acg-new-year-2026'
const STYLE_ID = 'style.acg-new-year-kinetic-festival'
const IP_ID = 'ip.acg-horse-mascot-2026'

/**
 * A presentation projection of one compile run, not a fictional chat transcript.
 * Every conclusion below is backed by the documented Figma nodes or is explicitly
 * marked as a pending business confirmation.
 */
export const ACG_GENERATION_REPLAY_SCRIPT: AcgReplayStep[] = [
  {
    id: 'acg-request',
    view: {
      kind: 'user',
      text: '请根据我的活动策划文档，生成 2026 抖音 ACG 新春会的完整活动。优先复用平台资产，活动结构、品牌风格和首批交付方向先让我确认。',
    },
    target: 'source-understanding',
    hold: 1100,
  },
  {
    id: 'acg-source-plan',
    view: {
      kind: 'doc',
      text: '策划文档里包含活动需求、已有结论和设计参考链接。请先理解活动怎么组织，不要直接套页面。',
      fileName: '2026 抖音 ACG 新春会 · 活动策划.docx',
      meta: '活动目标、组织方式、玩法诉求、交付范围与设计参考链接',
    },
    target: 'source-understanding',
    hold: 1000,
  },
  {
    id: 'acg-evidence-scan',
    view: {
      kind: 'think',
      group: 'evidence',
      title: '核验需求与设计证据',
      lines: [
        '从策划文档的设计参考链接进入 Figma，读取 5 个有效页面并定位 18 个正式交付节点。',
        '排除脑暴、方向探索和外部战报参考，避免把过程稿误算成交付物或生成参考。',
        '归类得到：2 个互动 H5、10 个站内资源位、1 组玩法视觉、4 组传播物料和 1 张结算战报。',
      ],
    },
    target: 'source-understanding',
    hold: 2400,
  },
  {
    id: 'acg-brief-ready',
    view: {
      kind: 'ai',
      text: '我先没有套模板，而是根据这份策划文档及其中引用的设计证据整理了活动简报。当前可以确认：这是一个春节节点型内容活动，用游戏、二次元两个分会场承接榜单和助力互动，共有 18 项可核验交付。\n\n右侧把“策划中明确的事实”和“Agent 沿引用链接核验的证据”与“仍需业务确认的缺口”分开了。请先确认我对活动的理解，确认后我再推荐组织模板。',
      cards: [
        {
          id: 'activity-brief',
          type: 'doc',
          badge: 'rev.1',
          title: 'ACG 新春会活动简报',
          desc: '目标 · 组织形式 · 核心参与 · 交付范围 · 4 项待确认',
        },
      ],
    },
    target: 'source-understanding',
    gate: {
      confirm: '理解正确，继续组织方案',
      confirmTo: 'acg-brief-confirmed',
      alt: '先展开待确认项',
      altTo: 'acg-brief-gaps-request',
    },
    hold: 0,
  },
  {
    id: 'acg-brief-gaps-request',
    view: { kind: 'user', text: '先展开待确认项，看看哪些会影响后面的生成' },
    target: 'source-understanding',
    hold: 700,
  },
  {
    id: 'acg-brief-gaps',
    view: {
      kind: 'ai',
      text: '有四项：奖励与库存、助力频控、榜单冻结口径、战报数据字段。它们不会改变双会场和 18 项交付范围，因此可以先生成无奖励的会场骨架与资源位；但在 ActivitySpec 中会保持“待确认”，最终发布检查不会放行。',
    },
    target: 'source-understanding',
    gate: {
      confirm: '边界清楚，继续组织方案',
      confirmTo: 'acg-brief-confirmed',
    },
    hold: 0,
  },
  {
    id: 'acg-brief-confirmed',
    view: { kind: 'user', text: '活动理解正确，先按现有材料继续，四项待确认不要编造' },
    target: 'source-understanding',
    hold: 700,
  },
  {
    id: 'acg-template-choice',
    view: {
      kind: 'ai',
      text: '资料解析完成，先决定活动怎么组织。模板会带入活动定位、主/分会场关系、默认玩法组合、规模基线和交付形态；不会带入具体品牌、IP 或视觉成片。也可以不选模板，从空白活动结构开始。',
    },
    target: 'activity-strategy',
    gate: {
      confirm: '使用新春会模板',
      choiceLayout: 'cards',
      choices: [
        {
          title: '新春会模板',
          tag: 'v1.1.0',
          eyebrow: '节点型内容盛典',
          desc: '用一个主会场组织主题，以分会场承接不同内容品类或合作方，默认通过榜单与助力推动参与。',
          facts: ['1 主 + 1–5 分会场', '4 个阶段', '标准 12–30 项交付'],
          preview: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png',
          recommended: true,
          to: 'acg-template-selected',
        },
        {
          title: '无模板创建',
          eyebrow: '从空白 ActivitySpec 开始',
          desc: '不继承既有组织形式，Agent 根据需求重新提出会场、玩法、阶段和交付结构，再由你逐项确认。',
          facts: ['不继承固定结构', '多一轮结构确认', '适合新形态探索'],
          to: 'acg-no-template-selected',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'acg-template-selected',
    view: { kind: 'user', text: '使用新春会模板，活动组织形式先按标准档展开' },
    hold: 700,
  },
  {
    id: 'acg-template-applied',
    view: {
      kind: 'ai',
      text: '已采用标准档：节点型内容盛典，1 个主会场统筹主题与总入口，游戏/二次元两个分会场承接内容；榜单与助力为核心玩法，按预热、开启、主推、结算四阶段推进。项目可调整会场数、组件组合和交付规模。',
      cards: [
        {
          id: TEMPLATE_ID,
          type: 'asset',
          badge: '已选 v1.1.0',
          title: '新春会模板',
          desc: '中大型节点活动 · 主/分会场 · 榜单/助力 · 12–30 项交付',
          preview: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png',
        },
      ],
    },
    target: 'activity-strategy',
    nextTo: 'acg-creative-input-choice',
    hold: 1200,
  },
  {
    id: 'acg-no-template-selected',
    view: { kind: 'user', text: '不使用活动模板，从空白结构开始创建' },
    hold: 700,
  },
  {
    id: 'acg-no-template-applied',
    view: {
      kind: 'ai',
      text: '已切换为无模板创建。本次不会继承任何会场数量、玩法组合或交付矩阵；我会把文档和 Figma 证据先整理成项目专属 ActivitySpec，再额外确认活动定位、组织规模和主流程。该结构只属于当前项目，成熟后才能另行沉淀为模板。',
    },
    target: 'activity-strategy',
    nextTo: 'acg-creative-input-choice',
    hold: 1200,
  },
  {
    id: 'acg-creative-input-choice',
    view: {
      kind: 'ai',
      text: '活动组织确定后，再确认本次生成使用的创意输入。我从正式交付里匹配了三项：Brand Kit 管品牌身份，Style Bible 管跨画幅视觉语法，IP Kit 只提供当前项目授权素材；它们都不会改变刚才确定的活动结构。',
    },
    target: 'asset-binding',
    gate: {
      confirm: '使用推荐创意输入',
      choiceLayout: 'cards',
      choices: [
        {
          title: '使用推荐创意输入',
          eyebrow: 'Brand Kit + Style Bible + IP Kit',
          desc: '绑定抖音 ACG 品牌身份、新春热力视觉语法和当前项目授权素材，三类资产职责分开记录。',
          facts: ['品牌身份 v1.1.0', '视觉语法 v1.0.0', '12 个项目授权 PNG'],
          preview: '/assets/figma-deliverables/acg/topic-header-banner.png',
          recommended: true,
          to: 'acg-creative-selected',
        },
        {
          title: '暂不使用 Brand Kit',
          eyebrow: 'Style 与项目素材继续使用',
          desc: '保留空的品牌槽位，只使用 Style Bible 和项目 IP 素材；正式发布前必须补齐 Logo、字体授权和身份校验。',
          facts: ['品牌槽位显式为空', '发布前必须补齐', '不影响活动结构'],
          to: 'acg-creative-no-brand-selected',
        },
        {
          title: '先看来源证据',
          eyebrow: '核对资产是否来自正式交付',
          desc: '查看 Brand、Style 和 IP 素材分别引用了哪些正式画板，以及仍待补齐的源文件。',
          facts: ['排除探索稿', '保留 Figma 节点', '标出待校验源文件'],
          to: 'acg-creative-evidence-request',
        },
      ],
    },
    hold: 0,
  },
  {
    id: 'acg-creative-selected',
    view: { kind: 'user', text: '使用推荐创意输入，三类资产按各自职责绑定' },
    hold: 700,
  },
  {
    id: 'acg-creative-applied',
    view: {
      kind: 'ai',
      text: '创意输入已确认：品牌身份、视觉语法和项目授权素材分别锁定版本。透明 Logo、标题字矢量源文件与 Figma 字体清单仍保持待校验，不会被演示数据伪装成已齐备。',
      cards: [
        {
          id: BRAND_ID,
          type: 'asset',
          badge: 'Brand v1.1.0',
          title: '抖音 ACG Brand Kit · 新春会应用版',
          desc: '品牌身份 · 标题层级 · 联名顺序',
          preview: '/assets/figma-deliverables/acg/topic-header-banner.png',
        },
        {
          id: STYLE_ID,
          type: 'asset',
          badge: 'Style v1.0.0',
          title: '新春热力 · ACG Style Bible',
          desc: '天空纵深、轨道动势与跨画幅重排',
          preview: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png',
        },
        {
          id: IP_ID,
          type: 'asset',
          badge: '项目授权',
          title: '马年吉祥物与授权素材包',
          desc: '12 个真实 PNG · 仅限当前项目',
          preview: '/assets/acg-new-year/materials/12-event-mascot-horse.png',
        },
      ],
    },
    target: 'asset-binding',
    nextTo: 'acg-bind-assets',
    hold: 1300,
  },
  {
    id: 'acg-creative-no-brand-selected',
    view: { kind: 'user', text: '暂不使用 Brand Kit，保留 Style Bible 和当前项目素材' },
    hold: 700,
  },
  {
    id: 'acg-creative-no-brand-applied',
    view: {
      kind: 'ai',
      text: 'Brand Kit 槽位已显式留空；Style Bible 与当前项目 IP 素材继续锁定版本。可以先生成结构与方向稿，但任何正式品牌标识都会保持“待确认”，发布检查不会放行。',
      cards: [
        { id: STYLE_ID, type: 'asset', badge: 'Style v1.0.0', title: '新春热力 · ACG Style Bible', desc: '跨画幅视觉语法' },
        { id: IP_ID, type: 'asset', badge: '项目授权', title: '马年吉祥物与授权素材包', desc: '12 个真实 PNG · 仅限当前项目' },
      ],
    },
    target: 'asset-binding',
    nextTo: 'acg-bind-assets',
    hold: 1300,
  },
  {
    id: 'acg-creative-evidence-request',
    view: { kind: 'user', text: '先看三类创意输入的来源证据' },
    target: 'asset-binding',
    hold: 700,
  },
  {
    id: 'acg-creative-evidence',
    view: {
      kind: 'ai',
      text: 'Brand Kit 引用正式标题锁定和资源位；Style Bible 只引用正式 KV、Banner 与分会场画板；IP Kit 对应 12 个本地真实 PNG。探索稿和外部参考已排除，透明 Logo、标题字矢量源文件与字体清单仍标为待校验。',
    },
    target: 'asset-binding',
    gate: {
      confirm: '证据清楚，使用推荐创意输入',
      confirmTo: 'acg-creative-selected',
      alt: '仍不使用 Brand Kit',
      altTo: 'acg-creative-no-brand-selected',
    },
    hold: 0,
  },
  {
    id: 'acg-bind-assets',
    view: {
      kind: 'think',
      group: 'binding',
      title: '建立版本化资产绑定',
      lines: [
        '分别记录活动组织来源、品牌身份来源、Style Bible 与项目 IP Kit；选择“无模板”或“不使用 Brand Kit”时写入显式空值，不进行隐式兜底。',
        '锁定内容榜单@1.0.0 与双动作助力@1.0.0 两个必选玩法包；按现有 Figma 实例保留集卡@0.9.4 与跃马攀峰@0.8.0，它们只影响玩法视觉件，不把状态数量误计成交付物数量。',
        '把游戏/二次元群像标为 project-scoped 授权素材；奖励方案缺少证据，保持待确认。',
      ],
    },
    target: 'asset-binding',
    hold: 2300,
  },
  {
    id: 'acg-compile-spec',
    view: {
      kind: 'think',
      group: 'compile-spec',
      title: '编译 ActivitySpec 与交付矩阵',
      lines: [
        '活动主循环：资源位触达 → 主会场理解 → 游戏/二次元分流 → 榜单与助力 → 分享回流 → 结算战报。',
        '阶段拆成预热、主会场开启、分会场主推、结算传播 4 段；页面、状态变体和渠道变体分别计数。',
        '18 项交付合同全部来自正式 Figma 节点；未提供的奖品、库存和结算数据只建占位字段，不臆造业务值。',
      ],
    },
    target: 'activity-blueprint',
    hold: 2600,
  },
  {
    id: 'acg-spec-ready',
    view: {
      kind: 'ai',
      text: 'ActivitySpec rev.12 已生成。这里先确认活动结构，不让视觉成稿掩盖业务问题：2 个分会场、榜单/助力为核心互动、18 项交付物；奖励保持待确认，不阻塞无奖励的会场与资源位生成。',
      cards: [
        { id: 'activity-spec', type: 'doc', badge: 'rev.12', title: 'ACG 新春会 ActivitySpec', desc: '4 阶段 · 2 分会场 · 榜单/助力 · 奖励待确认' },
        { id: 'delivery-matrix', type: 'list', badge: '18 项', title: '交付矩阵', desc: '2 H5 · 10 资源位 · 1 玩法视觉 · 4 传播 · 1 战报' },
        { id: 'gameplay.content-ranking', type: 'play', badge: '必选 v1.0.0', title: '内容榜单玩法包', desc: '内容池、分榜、排名、刷新冻结与 5 个运行状态' },
        { id: 'gameplay.dual-action-boost', type: 'play', badge: '必选 v1.0.0', title: '双动作助力玩法包', desc: '放你一马 / 好活加马 · 频控、反刷与榜单回写' },
      ],
    },
    target: 'activity-blueprint',
    gate: {
      confirm: '确认骨架，生成代表性会场',
      confirmTo: 'acg-spec-confirmed',
    },
    hold: 0,
  },
  {
    id: 'acg-spec-confirmed',
    view: { kind: 'user', text: '活动骨架确认，先生成游戏分会场作为代表' },
    hold: 350,
  },
  {
    id: 'acg-generate-venues',
    view: {
      kind: 'think',
      group: 'venues',
      title: '生成代表性可交互会场',
      lines: [
        '先只编译游戏分会场；榜单 Tab、助力按钮、任务与规则使用可点击运行态，不以截图替代。',
        '先应用 Brand Kit 的标题与身份层，再应用 Style Bible 的色彩/构图规则，最后注入本项目授权 IP 素材。',
        '执行首屏信息优先级、安全区、空态和内容路由检查；设计对照继续保留 Figma node 作为证据。',
      ],
    },
    target: 'activity-blueprint',
    hold: 2800,
  },
  {
    id: 'acg-venues-ready',
    view: {
      kind: 'ai',
      text: '代表性会场已完成：游戏分会场是可点击运行态，右侧可以切榜单、助力并查看规则；同时保留“设计对照”核验 Figma 成稿。请先确认结构、交互和视觉方向，再生成二次元会场及其余 16 个图片交付。',
      cards: [
        {
          id: 'deliverable:DLV-ACG-001',
          type: 'app',
          badge: '可交互',
          title: 'H5 · 游戏分会场长页',
          desc: '榜单、助力、任务、规则与设计对照',
          preview: '/assets/figma-deliverables/acg/game-venue-long.png',
        },
      ],
    },
    target: 'game-runtime',
    gate: {
      confirm: '方向确认，继续全量生成',
      confirmTo: 'acg-venues-confirmed',
    },
    hold: 0,
  },
  {
    id: 'acg-venues-confirmed',
    view: { kind: 'user', text: '方向确认，继续生成剩余交付物' },
    hold: 350,
  },
  {
    id: 'acg-generate-resources',
    view: {
      kind: 'think',
      group: 'resources',
      title: '批量生成剩余交付物',
      lines: [
        '按已确认的页面合同生成二次元分会场，保留独立内容路由与状态。',
        '按各 Surface 的真实尺寸重新排版，不对主 KV 做机械 center-crop：窄 Banner 缩减群像，竖版移动标题并避开脸部。',
        '生成 10 个站内资源位，并逐项检查标题识别、日期、IP 授权会场与安全区。',
        '继续生成玩法头图、合作海报、横/竖主 KV 和节目单；人工调整过的节点自动锁定。',
      ],
    },
    target: 'game-runtime',
    hold: 2900,
  },
  {
    id: 'acg-resource-batch-ready',
    view: {
      kind: 'ai',
      text: '剩余 17 项交付已完成。二次元分会场进入可交互运行态；每张图片成稿都保留源 Figma page、node ID、尺寸和下载入口，长图在右侧自然下滚查看。',
      image: {
        src: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png',
        caption: '正式交付 · 游戏中心发现页 Banner · node 2229:63622',
      },
      cards: [
        { id: 'delivery-overview', type: 'list', badge: '18/18', title: '完整交付批次', desc: '2 H5 · 10 资源位 · 1 玩法视觉 · 4 传播 · 1 战报' },
      ],
    },
    target: 'delivery-overview',
    hold: 1800,
  },
  {
    id: 'acg-finalize',
    view: {
      kind: 'think',
      group: 'finalize',
      title: '校验并形成最终交付',
      lines: [
        '汇总 18 项状态：2 个可交互 H5 与 16 个图片交付全部可定位、可预览、可下载。',
        '结算战报沿用真实设计结构，业务数据保持待接入；不填造假的曝光、投稿或互动数字。',
        '记录 CompileRun、ActivitySpec rev.12、资产版本和人工锁定节点，形成可追溯回放。',
      ],
    },
    target: 'delivery-overview',
    hold: 2400,
  },
  {
    id: 'acg-complete',
    view: {
      kind: 'ai',
      text: '本次生成完成：18 项交付物已经落到项目目录。\n\n其中 2 个 H5 可直接切到运行态试玩；16 个图片交付来自已核验的正式 Figma 节点，可在无限画布查看和下载。奖励配置、战报业务数据、透明 Logo/标题字源文件与字体清单仍明确标为待确认，没有被演示数据伪装成已完成。',
      cards: [
        { id: 'delivery-overview', type: 'list', badge: '18 项', title: '查看全部交付物', desc: '按 Surface、阶段、源节点与状态验收' },
        { id: 'deliverable:DLV-ACG-001', type: 'app', badge: '可交互', title: '试玩游戏分会场', desc: '运行态 / 设计对照可切换' },
        { id: 'activity-spec', type: 'doc', badge: 'rev.12', title: '查看 ActivitySpec 与资产绑定', desc: '模板、Brand Kit、Style 与项目素材可追溯' },
      ],
    },
    target: 'delivery-overview',
    hold: 0,
  },
]

export const acgReplayIndex = (id: string) =>
  ACG_GENERATION_REPLAY_SCRIPT.findIndex((step) => step.id === id)

export const ACG_REPLAY_COMPLETED_PATH = [
  'acg-request',
  'acg-source-plan',
  'acg-evidence-scan',
  'acg-brief-ready',
  'acg-brief-confirmed',
  'acg-template-choice',
  'acg-template-selected',
  'acg-template-applied',
  'acg-creative-input-choice',
  'acg-creative-selected',
  'acg-creative-applied',
  'acg-bind-assets',
  'acg-compile-spec',
  'acg-spec-ready',
  'acg-spec-confirmed',
  'acg-generate-venues',
  'acg-venues-ready',
  'acg-venues-confirmed',
  'acg-generate-resources',
  'acg-resource-batch-ready',
  'acg-finalize',
  'acg-complete',
].map(acgReplayIndex)
