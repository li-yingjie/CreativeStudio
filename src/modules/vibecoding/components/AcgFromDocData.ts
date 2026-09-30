export const ACG_FROM_DOC_PROJECT = 'ACG 新春会 · 从需求生成'

export const ACG_FROM_DOC_SOURCE_URL =
  'https://bytedance.larkoffice.com/docx/VBFIdHa1Jovf12xEbUTcbxjynvb'

export type AcgFromDocChapter = {
  id: string
  order: string
  keyword: string
  title: string
  summary: string
  accent: string
  glow: string
  glyph: string
  unlockDate: string
  dateRange: string
  host: string
  image: string
  hostImage: string
}

export const ACG_FROM_DOC_CHAPTERS: AcgFromDocChapter[] = [
  {
    id: 'abstract',
    order: '01',
    keyword: '抽象',
    title: '抽象奇境',
    summary: '打破常规，让脑洞和意外成为这一篇的主角。',
    accent: '#ff765d',
    glow: '#ffad78',
    glyph: '✦',
    unlockDate: '1.14',
    dateRange: '1.14—1.18',
    host: '@王小瓜',
    image: '/assets/acg-from-doc/generated/chapter-abstract.webp',
    hostImage: '/assets/acg-from-doc/generated/host-trickster.webp',
  },
  {
    id: 'aesthetic',
    order: '02',
    keyword: '美学',
    title: '美学圣殿',
    summary: '让画面、音乐和想象抵达年度美学高点。',
    accent: '#72e1d1',
    glow: '#b7fff3',
    glyph: '◇',
    unlockDate: '1.19',
    dateRange: '1.19—1.23',
    host: '@凌晨合成器',
    image: '/assets/acg-from-doc/generated/chapter-aesthetic.webp',
    hostImage: '/assets/acg-from-doc/generated/host-musician.webp',
  },
  {
    id: 'joy',
    order: '03',
    keyword: '快乐',
    title: '欢愉乐园',
    summary: '把不讲道理的快乐留在这一站。',
    accent: '#ffcf5a',
    glow: '#fff0a8',
    glyph: '●',
    unlockDate: '1.24',
    dateRange: '1.24—1.28',
    host: '@快乐发射站',
    image: '/assets/acg-from-doc/generated/chapter-joy.webp',
    hostImage: '/assets/acg-from-doc/generated/host-inventor.webp',
  },
  {
    id: 'healing',
    order: '04',
    keyword: '治愈',
    title: '治愈绿洲',
    summary: '收下角色与创作者递来的温暖。',
    accent: '#8ce6a5',
    glow: '#d6ffde',
    glyph: '✿',
    unlockDate: '1.29',
    dateRange: '1.29—2.2',
    host: '@小动物事务所',
    image: '/assets/acg-from-doc/generated/chapter-healing.webp',
    hostImage: '/assets/acg-from-doc/generated/host-keeper.webp',
  },
  {
    id: 'battle',
    order: '05',
    keyword: '燃',
    title: '燃斗竞技场',
    summary: '为热血、高光与不服输彻底升温。',
    accent: '#ff5e73',
    glow: '#ffb0ba',
    glyph: '▲',
    unlockDate: '2.3',
    dateRange: '2.3—2.7',
    host: '@必杀技研究社',
    image: '/assets/acg-from-doc/generated/chapter-battle.webp',
    hostImage: '/assets/acg-from-doc/generated/host-director.webp',
  },
  {
    id: 'bond',
    order: '06',
    keyword: '羁绊',
    title: '羁绊回响谷',
    summary: '回应人与角色、人与人的长久联结。',
    accent: '#8aa9ff',
    glow: '#cbd7ff',
    glyph: '∞',
    unlockDate: '2.8',
    dateRange: '2.8—2.12',
    host: '@存档回声',
    image: '/assets/acg-from-doc/generated/chapter-bond.webp',
    hostImage: '/assets/acg-from-doc/generated/host-archivist.webp',
  },
]

export type AcgFromDocSection =
  | 'hero'
  | 'journey'
  | 'chapter'
  | 'battle'
  | 'content'
  | 'wish'
  | 'benefits'
  | 'venue'

export type AcgFromDocElement =
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.venue-nav'
  | 'hero.action'
  | 'journey.progress'
  | 'journey.chapter'
  | 'chapter.host'
  | 'chapter.submit'
  | 'battle.spotlight'
  | 'battle.vote'
  | 'battle.ranking'
  | 'content.feed'
  | 'wish.wall'
  | 'wish.input'
  | 'wish.action'
  | 'benefits.tasks'
  | 'benefits.lottery'
  | 'venue.score'
  | 'venue.feed'

export type AcgFromDocSelection =
  | { type: 'section'; section: AcgFromDocSection }
  | {
      type: 'element'
      section: AcgFromDocSection
      element: AcgFromDocElement
      instance?: string
    }

export type AcgFromDocPageContent = {
  eventBadge: string
  heroTitle: string
  heroSubtitle: string
  heroAction: string
  journeyTitle: string
  journeySubtitle: string
  battleTitle: string
  battleSubtitle: string
  positiveVoteLabel: string
  negativeVoteLabel: string
  contentTitle: string
  contentSubtitle: string
  wishTitle: string
  wishSubtitle: string
  wishPlaceholder: string
  wishAction: string
  benefitsTitle: string
  venueTitle: string
  venueSubtitle: string
}

export const DEFAULT_ACG_FROM_DOC_PAGE_CONTENT: AcgFromDocPageContent = {
  eventBadge: '抖音游戏 × 抖音二次元',
  heroTitle: 'ACG 奇妙之旅',
  heroSubtitle: '“马”住最爱年度篇章，一路玩到 2 月 14 日惊喜晚会。',
  heroAction: '开启奇幻之旅',
  journeyTitle: '六大篇章，逐站解锁',
  journeySubtitle: '每 5 天抵达一站；当前篇章可投票、做任务并领取限定奖励。',
  battleTitle: '抽象作品夯拉战',
  battleSubtitle: '先看作品，再决定它是年度最夯，还是有点拉。',
  positiveVoteLabel: '太夯了',
  negativeVoteLabel: '诶呀，有点拉',
  contentTitle: '继续逛抽象奇境',
  contentSubtitle: '榜单之外的优质内容随机出现，每一次刷新都有新发现。',
  wishTitle: '共创 ACG 春晚',
  wishSubtitle: '把想看的节目写进许愿池，优质心愿将由年度作者真的做出来。',
  wishPlaceholder: '例如：想看王小瓜 cos 不知火舞…',
  wishAction: '发布春晚心愿',
  benefitsTitle: '做任务，抽春晚福利',
  venueTitle: '游戏分会场',
  venueSubtitle: '为你玩的游戏内容投夯拉票，合力冲上分会场积分榜。',
}

export const ACG_FROM_DOC_PAGE_CONTENT_STORAGE_KEY =
  'creative-studio.acg-from-doc-page-content.v2'

export function getInitialAcgFromDocPageContent(): AcgFromDocPageContent {
  if (typeof window === 'undefined')
    return { ...DEFAULT_ACG_FROM_DOC_PAGE_CONTENT }
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(ACG_FROM_DOC_PAGE_CONTENT_STORAGE_KEY) ??
        'null',
    ) as Record<string, unknown> | null
    if (!parsed) return { ...DEFAULT_ACG_FROM_DOC_PAGE_CONTENT }
    return Object.fromEntries(
      Object.entries(DEFAULT_ACG_FROM_DOC_PAGE_CONTENT).map(
        ([key, fallback]) => [
          key,
          typeof parsed[key] === typeof fallback ? parsed[key] : fallback,
        ],
      ),
    ) as AcgFromDocPageContent
  } catch {
    return { ...DEFAULT_ACG_FROM_DOC_PAGE_CONTENT }
  }
}

export const ACG_FROM_DOC_SOURCE_MD = `# 抖音 ACG 新春会 · 需求理解

> 来源：[飞书需求文档](${ACG_FROM_DOC_SOURCE_URL}) · 原文与 3 个内嵌画板均已读取 · 原稿只读

## 这不是一个“内容专题页”

它是横跨 1 月 1 日至 2 月 14 日的年度 ACG 内容事件。内容大赏和惊喜晚会是前后两个高潮，用户通过篇章解锁、夯/拉投票、福利任务和晚会许愿持续参与。

## 用户真正要完成的事

1. 一进来知道今天开到哪一篇、现在能做什么。
2. 看当前篇章的主理人和代表作品，对单条内容投“夯 / 拉”。
3. 从双榜和随机内容流继续发现作品，而不是投完即走。
4. 通过投票、关注、发布心愿积累抽奖机会并领取头像框等权益。
5. 按游戏 / 二次元 IP 进入分会场，看到阵营累计积分并继续投票。
6. 把内容大赏的结果和用户心愿带到 2 月 14 日惊喜晚会。

## 页面证据

- 画板 1 给出活动关系：主页面承担用户投票，IP / 品类进入分会场，Top 内容汇入晚会混剪。
- 画板 2 给出两级页面：主会场长页 + 游戏分会场；主会场包含旅程解锁、主理人征集、双榜、许愿池和福利任务。
- 画板 3 给出时间状态：1 月 14 日上线大赏，六篇章按 5 天更新，2 月 14 日 Big Day 收束。

## 六大篇章

抽象奇境、美学圣殿、欢愉乐园、治愈绿洲、燃斗竞技场、羁绊回响谷。

## 口径判断

正文与画板个别位置写“五大篇章”，但主题表、时间轴与实际命名均为六篇章。本项目统一按六篇章实现。`

export const ACG_FROM_DOC_PLAN_MD = `# 页面需求 · 持续更新

## 1. 交付边界

- 交付一个移动端活动体验，但不是单一平铺长页。
- 包含主会场、游戏 / 二次元分会场、内容详情、完整规则和奖励反馈层。
- 后端接口不实现；票数、榜单、任务和抽奖均用可切换的前端状态验证。

## 2. 产品模型

主会场解决“今天做什么”：当前篇章 → 主理人 → 作品夯拉战 → 双榜 / 随机内容 → 征稿 → 许愿与福利。

分会场解决“我关心什么”：选择游戏或 IP → 查看阵营累计夯拉积分 → 浏览按篇章聚合的内容 → 对单条作品继续投票。

Big Day 解决“为什么回来”：Top 内容、精选心愿和福利结果在 2 月 14 日统一兑现。

## 3. 核心状态

- 活动阶段：预热 / 篇章进行中 / Big Day。
- 篇章状态：当前开放 / 待解锁 / 已结束。
- 内容状态：未投 / 已投夯 / 已投拉。
- 用户权益：任务未完成 / 已完成；0—N 次抽奖机会；已领取奖励。
- 页面层级：主会场 / 分会场 / 内容详情 / 规则 / 奖励。

## 4. 页面优先级

首屏先告诉用户“当前篇章 + 立即可做动作”，年度世界观是氛围，不抢任务。投票后立即反馈榜单和奖励进度，再把用户导向更多内容或许愿，形成继续参与的理由。

## 5. Brand Kit 定调

用户在「星轨庙会 Brand Kit」「新春漫画年刊 Brand Kit」「糖果电玩城 Brand Kit」三套可执行方案中定调，每套均带代表素材图、色彩与艺术字、Hero 构图、玩法组件皮肤和生图提示词合约。默认验收分支采用「星轨庙会 Brand Kit @1.0.0」，并以「抖音 ACG 体验基础 Kit @1.2.0」作为平台约束。后续主 KV、艺术字、篇章素材、按钮和玩法皮肤必须继承已选 Kit。

## 6. 页面素材 BOM

- 主身份：竖版主 KV、透明活动艺术字。
- 篇章：6 张篇章场景、6 张主理人肖像。
- 内容：6 张原创作品封面，复用于焦点位、榜单、Feed 和详情层。
- 权益：6 张任务与奖励物件，复用于任务、抽奖、头像框和 Big Day。
- 舞台：弧形转场、玩法贴纸标题、蓝红对抗底板、愿望纸条和抽奖装置由 Brand Kit 组件层编译，不烘焙整页。
- 合计 26 项生产图片 + 4 类玩法皮肤；不得用字符、渐变色块、统一白卡或空框代替。`

export const ACG_FROM_DOC_DECISIONS_MD = `# 确认结果 · 只追加不覆盖

## 决策 1 · 活动边界

采用「完整 C 端活动体验」：主会场 + 分会场 + 内容详情 / 规则 / 奖励浮层。征稿后台、直播推流和服务端风控不在本次前端范围。

## 决策 2 · 玩法主线

采用「篇章解锁 + 单作品夯拉 + 奖励回路」：用户先知道当前篇章，再在内容上下文里投票；双榜、任务和抽奖反馈承接投票，许愿连接到 Big Day。

## 决策 3 · Brand Kit 定调

在三套可执行 Brand Kit 中采用「星轨庙会 Brand Kit @1.0.0」。「新春漫画年刊」与「糖果电玩城」作为完整备选 Kit 持久保留，不再仅作为两张风格图。

## Agent 判断记录

- 已读取需求正文和 3 个内嵌飞书画板；画板作为产品证据，不机械照抄线框。
- 将原文“五大篇章”统一为六篇章。
- 只读取用户提供的单页 Figma Golden Reference，提炼构图、层级、材质与组件方法；不复制其中角色/IP、头像、Logo 或作品成片。
- 首屏任务优先于世界观陈列，投票必须与作品同场出现。
- 主 KV、活动艺术字和内容视觉作为独立图片组件；玩法结构、按钮、票数和状态保持组件级可编辑。
- Brand Kit 定调后由 Agent 自动生成 Asset BOM，并逐项完成页面素材生产、质检和组件绑定。
- 三套 Brand Kit 共用「定设计」这一次用户二确，不额外增加流程节点；页面必须达到 ≥6 业务区块、≥4 玩法皮肤和 7 类素材槽位。
- 不使用真实 IP 角色和作品数据，前端内容使用原创模拟，避免误导为已授权线上数据。`
