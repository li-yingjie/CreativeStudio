export const DOCUMENTED_ACTIVITY_OVERVIEW = '交付总览'
export const DOCUMENTED_ACTIVITY_PAGES = '页面'
export const DOCUMENTED_ACTIVITY_MATERIALS = '素材库'

export type DeliverableCategory = '页面' | '资源位' | '传播物料' | '直播物料' | '玩法视觉' | '结算物料'

export type DocumentedActivityDeliverable = {
  label: string
  id: string
  category: DeliverableCategory
  surface: string
  phase: string
  summary: string
  preview: string
  previewAlt: string
  responsibilities: readonly string[]
  figma: {
    fileKey: string
    page: string
    nodeId: string
    nodeName: string
    width: number
    height: number
    exportScale: number
  }
}

export type DocumentedActivityCase = {
  projectName: string
  shortName: string
  code: string
  summary: string
  sourceLabel: string
  sourceUrl: string
  sourceEvidence: string
  accent: string
  tint: string
  template: string
  deliverables: readonly DocumentedActivityDeliverable[]
}

export type DocumentedImageCanvas = {
  label: string
  description: string
  categories: readonly DeliverableCategory[]
  items: readonly DocumentedActivityDeliverable[]
}

export const ACG_NEW_YEAR_PROJECT = '2026 抖音 ACG 新春会'
export const SPRING_GALA_PROJECT = '2026 抖音春晚'
export const EVERNIGHT_PROJECT = '《永夜星河》独星河小卡'
export const XIAHUA_DOCUMENTED_PROJECT = '夯爆了 已上线'

const ACG_FILE = 'dATx52XsiA0xtpE2xpAeBC'
const XIAHUA_FILE = 'kMedatdeXqtzmq0KOeG0qk'
const SPRING_FILE = 'DLhjcvo02Wbwk2PrUAJTkR'
const EVERNIGHT_FILE = 'QyUyHxPLBxH8QvICM9ex5j'

type DeliverableInput = Omit<DocumentedActivityDeliverable, 'figma'> & {
  fileKey: string
  page: string
  nodeId: string
  nodeName: string
  width: number
  height: number
  exportScale?: number
}

const deliverable = ({
  fileKey,
  page,
  nodeId,
  nodeName,
  width,
  height,
  exportScale = 1,
  ...item
}: DeliverableInput): DocumentedActivityDeliverable => ({
  ...item,
  figma: { fileKey, page, nodeId, nodeName, width, height, exportScale },
})

const acg = (input: Omit<DeliverableInput, 'fileKey'>) => deliverable({ ...input, fileKey: ACG_FILE })
const xiahua = (input: Omit<DeliverableInput, 'fileKey'>) => deliverable({ ...input, fileKey: XIAHUA_FILE })
const spring = (input: Omit<DeliverableInput, 'fileKey'>) => deliverable({ ...input, fileKey: SPRING_FILE })
const evernight = (input: Omit<DeliverableInput, 'fileKey'>) => deliverable({ ...input, fileKey: EVERNIGHT_FILE })

export const ACG_NEW_YEAR_CASE: DocumentedActivityCase = {
  projectName: ACG_NEW_YEAR_PROJECT,
  shortName: '抖音 ACG 新春会',
  code: 'CASE-ACG-CNY-2026',
  summary: '从游戏与二次元双会场，延展到搜索、话题、活动中心、开屏、合作海报、节目单和结算战报的完整活动交付。下列画面均直接来自原 Figma 画板。',
  sourceLabel: '2026 抖音 ACG 新春会 · Figma',
  sourceUrl: 'https://www.figma.com/design/dATx52XsiA0xtpE2xpAeBC/2026-%E6%8A%96%E9%9F%B3ACG%E6%96%B0%E6%98%A5%E4%BC%9A-%E5%88%9B%E6%84%8F?node-id=1690-13237',
  sourceEvidence: '已逐页审计“主标题&分会场 / 资源位延展 / 战报”，排除脑暴与过程画板；18 项均记录 page、node ID、原始尺寸与导出倍率。',
  accent: '#EB5B37',
  tint: '#FFF0E9',
  template: '新春会模板 · 游戏/二次元双分会场实例',
  deliverables: [
    acg({ label: 'H5 · 游戏分会场长页', id: 'DLV-ACG-001', category: '页面', surface: 'H5 长页', phase: '主推', summary: '游戏会场完整内容长页，包含主视觉、内容模块、榜单与活动承接。', preview: '/assets/figma-deliverables/acg/game-venue-long.png', previewAlt: '抖音 ACG 新春会游戏分会场长页', responsibilities: ['游戏会场', '内容榜单', '活动承接'], page: '抖音ACG主标题&分会场', nodeId: '1470:25605', nodeName: '·', width: 750, height: 9776, exportScale: 0.5 }),
    acg({ label: 'H5 · 二次元分会场长页', id: 'DLV-ACG-002', category: '页面', surface: 'H5 长页', phase: '主推', summary: '二次元会场独立长页，以同一活动身份组织内容与榜单。', preview: '/assets/figma-deliverables/acg/anime-venue-long.png', previewAlt: '抖音 ACG 新春会二次元分会场长页', responsibilities: ['二次元会场', '内容聚合', '榜单'], page: '抖音ACG主标题&分会场', nodeId: '1529:29607', nodeName: '二次元会场', width: 375, height: 3383 }),
    acg({ label: '玩法视觉 · 会场头图', id: 'DLV-ACG-003', category: '玩法视觉', surface: '活动头图', phase: '主推', summary: '连接主会场与玩法内容的横向视觉头图。', preview: '/assets/figma-deliverables/acg/gameplay-header.png', previewAlt: '抖音 ACG 新春会玩法头图', responsibilities: ['玩法识别', '会场承接'], page: '资源位延展', nodeId: '1728:38482', nodeName: '头图', width: 1002, height: 600 }),
    acg({ label: '图片 · 王者合作海报', id: 'DLV-ACG-004', category: '传播物料', surface: '合作海报', phase: '预热', summary: '王者荣耀合作方竖版传播海报。', preview: '/assets/figma-deliverables/acg/partner-poster-honor.png', previewAlt: '抖音 ACG 新春会王者合作海报', responsibilities: ['合作方联名', '竖版传播'], page: '资源位延展', nodeId: '2017:7470', nodeName: '合作海报-王者', width: 1080, height: 1920 }),
    acg({ label: '资源位 · 780×220 Banner', id: 'DLV-ACG-005', category: '资源位', surface: '横向 Banner', phase: '预热', summary: '站内窄幅资源位的真实 780×220 交付。', preview: '/assets/figma-deliverables/acg/resource-banner-780x220.png', previewAlt: '抖音 ACG 新春会 780×220 资源位', responsibilities: ['活动识别', '站内导流'], page: '资源位延展', nodeId: '2156:15188', nodeName: '780X220', width: 780, height: 220 }),
    acg({ label: '资源位 · 780×840 卡片', id: 'DLV-ACG-006', category: '资源位', surface: '竖向资源卡', phase: '预热', summary: '适配竖向推荐卡的 780×840 主视觉物料。', preview: '/assets/figma-deliverables/acg/resource-card-780x840.png', previewAlt: '抖音 ACG 新春会 780×840 资源卡', responsibilities: ['竖向推荐', '主视觉'], page: '资源位延展', nodeId: '2156:15315', nodeName: '780X840', width: 780, height: 840 }),
    acg({ label: '资源位 · 精选 CNY 页 Banner', id: 'DLV-ACG-007', category: '资源位', surface: '精选活动页 Banner', phase: '预热', summary: '抖音精选 CNY 活动页入口 Banner。', preview: '/assets/figma-deliverables/acg/cny-page-banner.png', previewAlt: '抖音精选 CNY 活动页 Banner', responsibilities: ['精选入口', '活动导流'], page: '资源位延展', nodeId: '2181:42598', nodeName: '抖音精选cny活动 页banner', width: 747, height: 420 }),
    acg({ label: '资源位 · 搜索 Banner', id: 'DLV-ACG-008', category: '资源位', surface: '搜索承接', phase: '预热', summary: '搜索结果场景的活动承接 Banner。', preview: '/assets/figma-deliverables/acg/search-banner.png', previewAlt: '抖音 ACG 新春会搜索 Banner', responsibilities: ['搜索承接', '活动导流'], page: '资源位延展', nodeId: '2181:42603', nodeName: '精选搜索banner', width: 1029, height: 360 }),
    acg({ label: '资源位 · 游戏中心发现页 Banner', id: 'DLV-ACG-009', category: '资源位', surface: '游戏中心发现页', phase: '主推', summary: '游戏中心发现页 1372×512 主资源位；即原 Figma 中蓝天、轨道与 ACG 群像的完整成稿。', preview: '/assets/figma-deliverables/acg/discovery-banner-1372x512.png', previewAlt: '抖音 ACG 新春会游戏中心发现页 Banner', responsibilities: ['游戏中心', '群像主视觉', '活动导流'], page: '资源位延展', nodeId: '2229:63622', nodeName: '游戏中心 发现页 banner-1372X512', width: 1372, height: 512 }),
    acg({ label: '资源位 · 话题头图与 Banner', id: 'DLV-ACG-010', category: '资源位', surface: '话题页', phase: '主推', summary: '话题头图与 Banner 的组合画幅。', preview: '/assets/figma-deliverables/acg/topic-header-banner.png', previewAlt: '抖音 ACG 新春会话题头图与 Banner', responsibilities: ['话题身份', '内容承接'], page: '资源位延展', nodeId: '2229:64229', nodeName: '话题头图与话题banner1', width: 1125, height: 450 }),
    acg({ label: '资源位 · 活动中心 Banner', id: 'DLV-ACG-011', category: '资源位', surface: '活动中心', phase: '主推', summary: '抖音活动中心 1029×420 活动入口。', preview: '/assets/figma-deliverables/acg/activity-center-banner.png', previewAlt: '抖音 ACG 新春会活动中心 Banner', responsibilities: ['活动中心', '流量入口'], page: '资源位延展', nodeId: '2229:64459', nodeName: '抖音活动中心banner2-1029X420', width: 1029, height: 420 }),
    acg({ label: '资源位 · 创作广场 Banner', id: 'DLV-ACG-012', category: '资源位', surface: '游戏中心创作广场', phase: '主推', summary: '游戏中心创作广场 1029×384 入口 Banner。', preview: '/assets/figma-deliverables/acg/creative-plaza-banner.png', previewAlt: '抖音 ACG 新春会创作广场 Banner', responsibilities: ['创作入口', '投稿承接'], page: '资源位延展', nodeId: '2229:65564', nodeName: '游戏中心 创作广场 banner-1029X384', width: 1029, height: 384 }),
    acg({ label: '开屏 · ACG 新春会', id: 'DLV-ACG-013', category: '资源位', surface: '开屏', phase: '预热', summary: '1242×2208 竖版开屏物料。', preview: '/assets/figma-deliverables/acg/splash-screen.png', previewAlt: '抖音 ACG 新春会开屏', responsibilities: ['开屏曝光', '安全区'], page: '资源位延展', nodeId: '2229:67795', nodeName: '开屏-1242*2208', width: 1242, height: 2208 }),
    acg({ label: '图片 · 主会场 KV 横版', id: 'DLV-ACG-014', category: '传播物料', surface: '主视觉横版', phase: '预热', summary: '1920×1080 主会场横版 KV。', preview: '/assets/figma-deliverables/acg/key-visual-landscape.png', previewAlt: '抖音 ACG 新春会主会场 KV 横版', responsibilities: ['主视觉', '横版传播'], page: '资源位延展', nodeId: '2253:13642', nodeName: '主会场KV横板', width: 1920, height: 1080 }),
    acg({ label: '图片 · 主会场 KV 竖版', id: 'DLV-ACG-015', category: '传播物料', surface: '主视觉竖版', phase: '预热', summary: '1080×1920 主会场竖版 KV。', preview: '/assets/figma-deliverables/acg/key-visual-portrait.png', previewAlt: '抖音 ACG 新春会主会场 KV 竖版', responsibilities: ['主视觉', '竖版传播'], page: '资源位延展', nodeId: '2253:13707', nodeName: '主会场KV竖版', width: 1080, height: 1920 }),
    acg({ label: '资源位 · 话题窄 Banner', id: 'DLV-ACG-016', category: '资源位', surface: '话题窄 Banner', phase: '主推', summary: '话题页开年高燃窄幅 Banner。', preview: '/assets/figma-deliverables/acg/topic-banner.png', previewAlt: '抖音 ACG 新春会话题窄 Banner', responsibilities: ['话题导流', '开年高燃'], page: '资源位延展', nodeId: '2276:18124', nodeName: '话题banner-开年高燃', width: 1029, height: 195 }),
    acg({ label: '长图 · 节目单', id: 'DLV-ACG-017', category: '传播物料', surface: '节目单长图', phase: '预热', summary: '1080×11493 完整节目单长图。', preview: '/assets/figma-deliverables/acg/program-guide-long.png', previewAlt: '抖音 ACG 新春会节目单长图', responsibilities: ['节目编排', '嘉宾内容', '长图传播'], page: '战报', nodeId: '2895:67559', nodeName: '节目单-长图', width: 1080, height: 11493, exportScale: 0.5 }),
    acg({ label: '活动战报 · 结算长图', id: 'DLV-ACG-018', category: '结算物料', surface: '战报长图', phase: '结算', summary: '1080×26668 结算战报，汇总活动数据、内容与传播结果。', preview: '/assets/figma-deliverables/acg/final-report-long.png', previewAlt: '抖音 ACG 新春会活动战报', responsibilities: ['活动数据', '内容复盘', '结算传播'], page: '战报', nodeId: '2911:6506', nodeName: '新春会战报', width: 1080, height: 26668, exportScale: 0.5 }),
  ],
}

export const XIAHUA_CASE: DocumentedActivityCase = {
  projectName: XIAHUA_DOCUMENTED_PROJECT,
  shortName: '这夏夯爆了',
  code: 'CASE-UGC-SUMMER-2026',
  summary: 'UGC 2026 H1 文件中的暑期最终 UI，覆盖玩水与夜食两条活动线、原生入口、收集页、交换/点亮状态和内容承接。',
  sourceLabel: 'UGC 活动 2026H1 · Figma',
  sourceUrl: 'https://www.figma.com/design/kMedatdeXqtzmq0KOeG0qk/UGC%E6%B4%BB%E5%8A%A8-2026H1?node-id=7634-28341',
  sourceEvidence: '从“暑期UI - 玩水 / 暑期UI - 美食”两个最终 UI 页提取，排除了暑期交互页中的过程方案与黑底拼接板。',
  accent: '#168EBC', tint: '#E6F8FF', template: 'UGC 暑期节点 · 内容参与 + 收集玩法',
  deliverables: [
    xiahua({ label: 'H5 · 玩水主会场 A', id: 'DLV-XIA-001', category: '页面', surface: 'H5 长页', phase: '主推', summary: '玩水活动主会场完整版本 A。', preview: '/assets/figma-deliverables/xiahua/water-venue-a.png', previewAlt: '这夏夯爆了玩水主会场 A', responsibilities: ['主视觉', '任务', '内容承接'], page: '暑期UI - 玩水', nodeId: '7880:28626', nodeName: '会场', width: 390, height: 2320 }),
    xiahua({ label: 'H5 · 玩水主会场 B', id: 'DLV-XIA-002', category: '页面', surface: 'H5 长页', phase: '主推', summary: '玩水活动主会场另一阶段版本。', preview: '/assets/figma-deliverables/xiahua/water-venue-b.png', previewAlt: '这夏夯爆了玩水主会场 B', responsibilities: ['阶段主题', '任务', '内容承接'], page: '暑期UI - 玩水', nodeId: '7976:40798', nodeName: '会场', width: 390, height: 2320 }),
    xiahua({ label: 'H5 · 玩水完整长页', id: 'DLV-XIA-003', category: '页面', surface: 'H5 超长页', phase: '主推', summary: '玩水线带更多内容模块的完整 A1 长页。', preview: '/assets/figma-deliverables/xiahua/water-venue-full.png', previewAlt: '这夏夯爆了玩水完整长页', responsibilities: ['活动全景', '任务', '作品内容'], page: '暑期UI - 玩水', nodeId: '7976:42929', nodeName: 'A1', width: 375, height: 2989, exportScale: 0.75 }),
    xiahua({ label: '玩法视觉 · 我的夏装', id: 'DLV-XIA-004', category: '玩法视觉', surface: '收集页', phase: '主推', summary: '夏装收集、持有状态与交换入口。', preview: '/assets/figma-deliverables/xiahua/my-summer-outfits.png', previewAlt: '这夏夯爆了我的夏装', responsibilities: ['收集图鉴', '持有状态', '交换入口'], page: '暑期UI - 玩水', nodeId: '8091:73128', nodeName: '我的夏装', width: 375, height: 812 }),
    xiahua({ label: '玩法视觉 · 交换记录', id: 'DLV-XIA-005', category: '玩法视觉', surface: '记录页', phase: '主推', summary: '用户装备交换记录与状态。', preview: '/assets/figma-deliverables/xiahua/exchange-history.png', previewAlt: '这夏夯爆了交换记录', responsibilities: ['交换流水', '状态反馈'], page: '暑期UI - 玩水', nodeId: '8091:83843', nodeName: '交换记录', width: 375, height: 812 }),
    xiahua({ label: '玩法视觉 · 点亮结果', id: 'DLV-XIA-006', category: '玩法视觉', surface: '点亮状态', phase: '主推', summary: '收集物点亮后的结果反馈。', preview: '/assets/figma-deliverables/xiahua/card-lightup.png', previewAlt: '这夏夯爆了点亮结果', responsibilities: ['获得反馈', '收集进度'], page: '暑期UI - 玩水', nodeId: '8091:89367', nodeName: '点亮', width: 375, height: 812 }),
    xiahua({ label: '原生 · 金豆首页', id: 'DLV-XIA-007', category: '页面', surface: '原生页面', phase: '主推', summary: '地图、地点与金豆入口的原生首页状态。', preview: '/assets/figma-deliverables/xiahua/gold-bean-home.png', previewAlt: '这夏夯爆了金豆首页', responsibilities: ['地图', '地点', '金豆入口'], page: '暑期UI - 玩水', nodeId: '8214:60376', nodeName: '首页', width: 375, height: 812 }),
    xiahua({ label: '原生 · 活动首页', id: 'DLV-XIA-008', category: '页面', surface: '原生页面', phase: '主推', summary: '活动态原生首页，聚合入口与推荐内容。', preview: '/assets/figma-deliverables/xiahua/native-activity-home.png', previewAlt: '这夏夯爆了原生活动首页', responsibilities: ['原生承接', '活动入口'], page: '暑期UI - 玩水', nodeId: '8214:64702', nodeName: '首页-活动', width: 390, height: 845 }),
    xiahua({ label: 'H5 · 新手引导', id: 'DLV-XIA-009', category: '页面', surface: '引导浮层', phase: '主推', summary: '首次进入活动的玩法说明与开始动作。', preview: '/assets/figma-deliverables/xiahua/onboarding-dialog.png', previewAlt: '这夏夯爆了新手引导', responsibilities: ['规则引导', '首次体验'], page: '暑期UI - 玩水', nodeId: '8877:70573', nodeName: '弹窗', width: 375, height: 812 }),
    xiahua({ label: '原生 · 作品列表', id: 'DLV-XIA-010', category: '页面', surface: '内容列表', phase: '主推', summary: '活动内容作品列表及筛选状态。', preview: '/assets/figma-deliverables/xiahua/content-list.png', previewAlt: '这夏夯爆了作品列表', responsibilities: ['作品聚合', '内容浏览'], page: '暑期UI - 玩水', nodeId: '9506:5937', nodeName: '作品列表', width: 375, height: 812 }),
    xiahua({ label: 'H5 · 夜食主会场', id: 'DLV-XIA-011', category: '页面', surface: 'H5 长页', phase: '主推', summary: '夜食线完整主会场，包含夜食卡、任务和内容模块。', preview: '/assets/figma-deliverables/xiahua/food-venue-full.png', previewAlt: '这夏夯爆了夜食主会场', responsibilities: ['夜食主题', '集卡', '任务'], page: '暑期UI - 美食', nodeId: '9553:15006', nodeName: 'A1', width: 375, height: 1898, exportScale: 0.75 }),
    xiahua({ label: 'H5 · 选择小马', id: 'DLV-XIA-012', category: '页面', surface: '选择页', phase: '主推', summary: '进入夜食线前的小马角色选择。', preview: '/assets/figma-deliverables/xiahua/select-horse.png', previewAlt: '这夏夯爆了选择小马', responsibilities: ['角色选择', '分支进入'], page: '暑期UI - 美食', nodeId: '9683:26518', nodeName: '选择马', width: 375, height: 812 }),
    xiahua({ label: 'H5 · 夜食 AR 会场', id: 'DLV-XIA-013', category: '页面', surface: '沉浸会场', phase: '主推', summary: '夜食主题沉浸入口与角色互动场景。', preview: '/assets/figma-deliverables/xiahua/food-ar-venue.png', previewAlt: '这夏夯爆了夜食 AR 会场', responsibilities: ['沉浸场景', '角色互动'], page: '暑期UI - 美食', nodeId: '9697:3607', nodeName: '会场', width: 375, height: 812 }),
    xiahua({ label: '玩法视觉 · 我的夜食', id: 'DLV-XIA-014', category: '玩法视觉', surface: '夜食卡图鉴', phase: '主推', summary: '夜食卡收集、已获得与未解锁状态。', preview: '/assets/figma-deliverables/xiahua/my-night-food.png', previewAlt: '这夏夯爆了我的夜食', responsibilities: ['夜食卡池', '图鉴状态'], page: '暑期UI - 美食', nodeId: '9834:33984', nodeName: '我的夜食', width: 375, height: 812 }),
  ],
}

export const SPRING_GALA_CASE: DocumentedActivityCase = {
  projectName: SPRING_GALA_PROJECT, shortName: '抖音春晚', code: 'CASE-GALA-2026',
  summary: '春晚站内主会场、历史回放与直播间素材向活动 Banner、头图、节目封面和行政屏延展的真实交付矩阵。',
  sourceLabel: '2026春晚&元宵 · Figma', sourceUrl: 'https://www.figma.com/design/DLhjcvo02Wbwk2PrUAJTkR/2026%E6%98%A5%E6%99%9A-%E5%85%83%E5%AE%B5?node-id=572-114797',
  sourceEvidence: '从 UI、直播间物料、资源位延展三个 Figma 页提取 17 项独立交付画板。', accent: '#C92D28', tint: '#FBECEA', template: '节目盛典 · 直播主会场 · 全渠道传播矩阵',
  deliverables: [
    spring({ label: 'Lynx · 春晚主会场', id: 'DLV-GALA-001', category: '页面', surface: 'Lynx 长页', phase: '主推', summary: '春晚活动主会场，组织直播、节目与互动内容。', preview: '/assets/figma-deliverables/spring-gala/main-venue.png', previewAlt: '抖音春晚主会场', responsibilities: ['直播承接', '节目内容', '互动入口'], page: 'UI', nodeId: '636:116216', nodeName: '20231134', width: 375, height: 2348, exportScale: 0.75 }),
    spring({ label: 'Lynx · 春晚完整长页', id: 'DLV-GALA-002', category: '页面', surface: 'Lynx 超长页', phase: '主推', summary: '包含完整活动模块的 5925 高主会场画板。', preview: '/assets/figma-deliverables/spring-gala/main-venue-full.png', previewAlt: '抖音春晚完整长页', responsibilities: ['活动全景', '长页模块'], page: 'UI', nodeId: '773:119100', nodeName: 'Frame 2134594707', width: 375, height: 5925, exportScale: 0.75 }),
    spring({ label: '图片 · 春晚头图文案版', id: 'DLV-GALA-003', category: '传播物料', surface: '活动头图', phase: '预热', summary: '“上抖音看春晚”文字版头图。', preview: '/assets/figma-deliverables/spring-gala/hero-copy.png', previewAlt: '抖音春晚头图文案版', responsibilities: ['活动识别', '主文案'], page: 'UI', nodeId: '597:117335', nodeName: '头图更新文字版', width: 375, height: 389 }),
    spring({ label: '原生 · 历年春晚回放', id: 'DLV-GALA-004', category: '页面', surface: '原生内容页', phase: '主推', summary: '历年春晚节目回放与年份选择。', preview: '/assets/figma-deliverables/spring-gala/past-gala-archive.png', previewAlt: '历年春晚大放送', responsibilities: ['年份选择', '回放内容'], page: 'UI', nodeId: '361:32601', nodeName: '历年春晚大放送', width: 375, height: 812 }),
    spring({ label: '直播间 · 主机位封面', id: 'DLV-GALA-005', category: '直播物料', surface: '直播封面', phase: '直播', summary: '春晚直播主机位横版封面。', preview: '/assets/figma-deliverables/spring-gala/live-main-camera.png', previewAlt: '抖音春晚主机位封面', responsibilities: ['主机位', '直播识别'], page: '直播间物料', nodeId: '739:121303', nodeName: '主机位', width: 1116, height: 630 }),
    spring({ label: '直播间 · 竖版封面', id: 'DLV-GALA-006', category: '直播物料', surface: '直播竖图', phase: '直播', summary: '春节联欢晚会竖版直播封面。', preview: '/assets/figma-deliverables/spring-gala/live-vertical-cover.png', previewAlt: '抖音春晚竖版直播封面', responsibilities: ['竖版直播', '节目识别'], page: '直播间物料', nodeId: '739:121593', nodeName: '竖图', width: 728, height: 1032 }),
    spring({ label: '直播间 · 春晚封面', id: 'DLV-GALA-007', category: '直播物料', surface: '直播封面', phase: '直播', summary: '独家竖屏春晚横版频道封面。', preview: '/assets/figma-deliverables/spring-gala/live-spring-cover.png', previewAlt: '独家竖屏春晚封面', responsibilities: ['竖屏春晚', '直播频道'], page: '直播间物料', nodeId: '739:121408', nodeName: '竖屏春晚封面', width: 1116, height: 630 }),
    spring({ label: '直播间 · 一年又一年', id: 'DLV-GALA-008', category: '直播物料', surface: '节目封面', phase: '直播', summary: '《一年又一年》节目直播封面。', preview: '/assets/figma-deliverables/spring-gala/live-year-after-year.png', previewAlt: '一年又一年直播封面', responsibilities: ['节目识别', '直播封面'], page: '直播间物料', nodeId: '739:121118', nodeName: '一年又一年', width: 1116, height: 630 }),
    spring({ label: '直播间 · 无障碍字幕', id: 'DLV-GALA-009', category: '直播物料', surface: '无障碍频道封面', phase: '直播', summary: '无障碍字幕直播频道封面。', preview: '/assets/figma-deliverables/spring-gala/live-captions-cover.png', previewAlt: '无障碍字幕封面', responsibilities: ['无障碍字幕', '频道识别'], page: '直播间物料', nodeId: '739:120836', nodeName: '无障碍字幕封面', width: 1116, height: 630 }),
    spring({ label: '直播间 · 无障碍手语', id: 'DLV-GALA-010', category: '直播物料', surface: '无障碍频道封面', phase: '直播', summary: '无障碍手语直播频道封面。', preview: '/assets/figma-deliverables/spring-gala/live-sign-language-cover.png', previewAlt: '无障碍手语封面', responsibilities: ['无障碍手语', '频道识别'], page: '直播间物料', nodeId: '739:121021', nodeName: '无障碍手语封面', width: 1116, height: 630 }),
    spring({ label: '图片 · 节目封面横版', id: 'DLV-GALA-011', category: '传播物料', surface: '节目封面', phase: '预热', summary: '1125×633 节目横版封面。', preview: '/assets/figma-deliverables/spring-gala/program-cover-landscape.png', previewAlt: '抖音春晚节目横版封面', responsibilities: ['节目传播', '横版适配'], page: '资源位延展', nodeId: '423:13605', nodeName: '节目封面-横', width: 1125, height: 633 }),
    spring({ label: '图片 · 节目封面竖版', id: 'DLV-GALA-012', category: '传播物料', surface: '节目封面', phase: '预热', summary: '1125×1600 节目竖版封面。', preview: '/assets/figma-deliverables/spring-gala/program-cover-portrait.png', previewAlt: '抖音春晚节目竖版封面', responsibilities: ['节目传播', '竖版适配'], page: '资源位延展', nodeId: '423:13656', nodeName: '节目封面-竖', width: 1125, height: 1600 }),
    spring({ label: '图片 · 节目封面方图', id: 'DLV-GALA-013', category: '传播物料', surface: '节目封面', phase: '预热', summary: '750×750 节目方形封面。', preview: '/assets/figma-deliverables/spring-gala/program-cover-square.png', previewAlt: '抖音春晚节目方形封面', responsibilities: ['节目传播', '方图适配'], page: '资源位延展', nodeId: '423:14117', nodeName: '节目封面-方', width: 750, height: 750 }),
    spring({ label: '资源位 · 活动 Banner', id: 'DLV-GALA-014', category: '资源位', surface: '活动 Banner', phase: '预热', summary: '1074×192 春晚活动窄 Banner。', preview: '/assets/figma-deliverables/spring-gala/activity-banner.png', previewAlt: '抖音春晚活动 Banner', responsibilities: ['活动入口', '横向资源位'], page: '资源位延展', nodeId: '439:12044', nodeName: '活动banner', width: 1074, height: 192 }),
    spring({ label: '资源位 · 活动头图', id: 'DLV-GALA-015', category: '资源位', surface: '活动头图', phase: '预热', summary: '738×1032 春晚活动头图。', preview: '/assets/figma-deliverables/spring-gala/activity-header.png', previewAlt: '抖音春晚活动头图', responsibilities: ['活动入口', '竖向资源位'], page: '资源位延展', nodeId: '439:12072', nodeName: '活动头图', width: 738, height: 1032 }),
    spring({ label: '线下屏 · 行政竖屏', id: 'DLV-GALA-016', category: '传播物料', surface: '行政电子屏', phase: '预热', summary: '1079×1920 行政竖屏传播物料。', preview: '/assets/figma-deliverables/spring-gala/admin-screen-portrait.png', previewAlt: '抖音春晚行政竖屏', responsibilities: ['线下曝光', '竖屏适配'], page: '资源位延展', nodeId: '686:120040', nodeName: '1079 × 1920', width: 1079, height: 1920 }),
    spring({ label: '线下屏 · 行政横屏', id: 'DLV-GALA-017', category: '传播物料', surface: '行政电子屏', phase: '预热', summary: '1920×1079 行政横屏传播物料。', preview: '/assets/figma-deliverables/spring-gala/admin-screen-landscape.png', previewAlt: '抖音春晚行政横屏', responsibilities: ['线下曝光', '横屏适配'], page: '资源位延展', nodeId: '686:120050', nodeName: '1079 × 1920', width: 1920, height: 1079 }),
  ],
}

export const EVERNIGHT_CASE: DocumentedActivityCase = {
  projectName: EVERNIGHT_PROJECT, shortName: '永夜星河抽卡', code: 'CASE-IP-CARD-2024',
  summary: '影视 IP 任务抽卡活动的主会场、任务页、卡片图鉴、搜索资源位、等级卡框、抽卡结果舞台与直播间视觉。',
  sourceLabel: '《永夜星河》抽卡 · Figma', sourceUrl: 'https://www.figma.com/design/QyUyHxPLBxH8QvICM9ex5j/%E3%80%8A%E6%B0%B8%E5%A4%9C%E6%98%9F%E6%B2%B3%E3%80%8B%E6%8A%BD%E5%8D%A1?node-id=40-27228',
  sourceEvidence: '从“页面”中的正式组件与“✈️”页中的独立直播框提取，排除了交互详述、切图总板和未登录/加载错误状态。', accent: '#7544D8', tint: '#F0E9FF', template: '影视 IP · 任务得次数 · 多稀有度卡池 · 图鉴分享',
  deliverables: [
    evernight({ label: 'Lynx · 抽卡主会场', id: 'DLV-EVN-001', category: '页面', surface: 'Lynx 长页', phase: '主推', summary: '卡池、单抽/十连、图鉴进度与任务入口的主页面。', preview: '/assets/figma-deliverables/evernight/main-venue.png', previewAlt: '永夜星河抽卡主会场', responsibilities: ['卡池', '抽卡', '任务', '图鉴'], page: '页面', nodeId: '40:27228', nodeName: 'Frame 2036082085', width: 750, height: 3652, exportScale: 0.75 }),
    evernight({ label: 'Lynx · 主会场任务态', id: 'DLV-EVN-002', category: '页面', surface: 'Lynx 长页', phase: '主推', summary: '任务列表展开后的主会场版本。', preview: '/assets/figma-deliverables/evernight/main-venue-alt.png', previewAlt: '永夜星河主会场任务态', responsibilities: ['任务列表', '抽卡入口'], page: '页面', nodeId: '53:3071', nodeName: 'Frame 2036082086', width: 750, height: 2912, exportScale: 0.75 }),
    evernight({ label: '玩法视觉 · 卡片图鉴', id: 'DLV-EVN-003', category: '玩法视觉', surface: '卡片图鉴', phase: '主推', summary: '多张卡面、持有状态与收集入口。', preview: '/assets/figma-deliverables/evernight/collection-page.png', previewAlt: '永夜星河卡片图鉴', responsibilities: ['图鉴', '持有状态', '卡片详情'], page: '页面', nodeId: '110:81917', nodeName: 'Frame 2036082087', width: 750, height: 2687 }),
    evernight({ label: '玩法视觉 · 图鉴空态', id: 'DLV-EVN-004', category: '玩法视觉', surface: '卡片图鉴', phase: '主推', summary: '未收集卡片时的图鉴空态。', preview: '/assets/figma-deliverables/evernight/collection-empty.png', previewAlt: '永夜星河图鉴空态', responsibilities: ['空态', '卡池引导'], page: '页面', nodeId: '412:5561', nodeName: '全部卡片', width: 750, height: 1624 }),
    evernight({ label: '资源位 · 搜索 Banner 1029×420', id: 'DLV-EVN-005', category: '资源位', surface: '搜索 Banner', phase: '预热', summary: '搜索结果承接用 1029×420 Banner。', preview: '/assets/figma-deliverables/evernight/search-banner-1029x420.png', previewAlt: '永夜星河搜索 Banner 1029×420', responsibilities: ['搜索承接', '活动导流'], page: '页面', nodeId: '1220:54942', nodeName: 'Frame 2036083456', width: 1029, height: 420 }),
    evernight({ label: '资源位 · 搜索 Banner 1029×360', id: 'DLV-EVN-006', category: '资源位', surface: '搜索 Banner', phase: '预热', summary: '搜索结果承接用 1029×360 Banner。', preview: '/assets/figma-deliverables/evernight/search-banner-1029x360.png', previewAlt: '永夜星河搜索 Banner 1029×360', responsibilities: ['搜索承接', '活动导流'], page: '页面', nodeId: '1263:60096', nodeName: 'Frame 2036083461', width: 1029, height: 360 }),
    evernight({ label: '玩法视觉 · SP 卡框', id: 'DLV-EVN-007', category: '玩法视觉', surface: '卡框资产', phase: '主推', summary: 'SP 稀有度卡框。', preview: '/assets/figma-deliverables/evernight/card-frame-sp.png', previewAlt: '永夜星河 SP 卡框', responsibilities: ['SP 稀有度', '卡面容器'], page: '页面', nodeId: '1608:11633', nodeName: 'SP', width: 492, height: 676 }),
    evernight({ label: '玩法视觉 · SSR 卡框', id: 'DLV-EVN-008', category: '玩法视觉', surface: '卡框资产', phase: '主推', summary: 'SSR 稀有度卡框。', preview: '/assets/figma-deliverables/evernight/card-frame-ssr.png', previewAlt: '永夜星河 SSR 卡框', responsibilities: ['SSR 稀有度', '卡面容器'], page: '页面', nodeId: '1608:11662', nodeName: 'ssr', width: 492, height: 676 }),
    evernight({ label: '玩法视觉 · SR 卡框', id: 'DLV-EVN-009', category: '玩法视觉', surface: '卡框资产', phase: '主推', summary: 'SR 稀有度卡框。', preview: '/assets/figma-deliverables/evernight/card-frame-sr.png', previewAlt: '永夜星河 SR 卡框', responsibilities: ['SR 稀有度', '卡面容器'], page: '页面', nodeId: '1608:11695', nodeName: 'sr', width: 492, height: 676 }),
    evernight({ label: '玩法视觉 · R 卡框', id: 'DLV-EVN-010', category: '玩法视觉', surface: '卡框资产', phase: '主推', summary: 'R 稀有度卡框。', preview: '/assets/figma-deliverables/evernight/card-frame-r.png', previewAlt: '永夜星河 R 卡框', responsibilities: ['R 稀有度', '卡面容器'], page: '页面', nodeId: '1608:11724', nodeName: 'r', width: 492, height: 676 }),
    evernight({ label: '玩法视觉 · DYR 独占卡框', id: 'DLV-EVN-011', category: '玩法视觉', surface: '卡框资产', phase: '主推', summary: '抖音独占 DYR 卡框。', preview: '/assets/figma-deliverables/evernight/card-frame-dyr.png', previewAlt: '永夜星河 DYR 独占卡框', responsibilities: ['独占稀有度', '卡面容器'], page: '页面', nodeId: '1608:11777', nodeName: 'dyr', width: 492, height: 676 }),
    evernight({ label: '直播间 · 活动边框', id: 'DLV-EVN-012', category: '直播物料', surface: '直播间边框', phase: '主推', summary: '影视宣发直播间的活动主题边框。', preview: '/assets/figma-deliverables/evernight/live-room-frame.png', previewAlt: '永夜星河直播间活动边框', responsibilities: ['直播间包装', '活动入口'], page: '✈️', nodeId: '7:714', nodeName: '直播间边框', width: 375, height: 812 }),
    evernight({ label: '图片 · 活动主封面', id: 'DLV-EVN-013', category: '传播物料', surface: '活动封面', phase: '预热', summary: '“独星河小卡 开启快乐征途”活动主封面。', preview: '/assets/figma-deliverables/evernight/campaign-cover.png', previewAlt: '永夜星河抽卡活动主封面', responsibilities: ['活动识别', '传播封面'], page: '页面', nodeId: '1051:36202', nodeName: 'Frame 2036083437', width: 750, height: 744 }),
    evernight({ label: '图片 · 规则页封面', id: 'DLV-EVN-014', category: '传播物料', surface: '规则页封面', phase: '主推', summary: '抽卡活动规则页的独立封面。', preview: '/assets/figma-deliverables/evernight/rules-cover.png', previewAlt: '永夜星河抽卡规则页封面', responsibilities: ['规则识别', '活动身份'], page: '页面', nodeId: '1243:59953', nodeName: 'Frame 2036083460', width: 750, height: 718 }),
    evernight({ label: '玩法视觉 · 抽卡结果舞台', id: 'DLV-EVN-015', category: '玩法视觉', surface: '抽卡结果', phase: '主推', summary: '展示卡牌翻开前后的抽卡结果舞台。', preview: '/assets/figma-deliverables/evernight/draw-result-stage.png', previewAlt: '永夜星河抽卡结果舞台', responsibilities: ['抽卡结果', '卡面展示'], page: '页面', nodeId: '1601:11382', nodeName: 'Group 2082893760', width: 672, height: 924 }),
    evernight({ label: 'Lynx · 任务页', id: 'DLV-EVN-016', category: '页面', surface: '任务长页', phase: '主推', summary: '任务列表、领取状态与卡片收集进度。', preview: '/assets/figma-deliverables/evernight/task-page.png', previewAlt: '永夜星河抽卡任务页', responsibilities: ['任务列表', '次数领取', '图鉴进度'], page: '页面', nodeId: '747:9409', nodeName: 'Frame 2036083438', width: 750, height: 1603 }),
  ],
}

export const DOCUMENTED_ACTIVITY_CASES: Record<string, DocumentedActivityCase> = {
  [ACG_NEW_YEAR_PROJECT]: ACG_NEW_YEAR_CASE,
  [XIAHUA_DOCUMENTED_PROJECT]: XIAHUA_CASE,
  [SPRING_GALA_PROJECT]: SPRING_GALA_CASE,
  [EVERNIGHT_PROJECT]: EVERNIGHT_CASE,
}

const IMAGE_CANVAS_RULES: readonly Omit<DocumentedImageCanvas, 'items'>[] = [
  {
    label: '入口与资源位',
    description: '搜索、话题、活动中心、开屏等站内入口资源位集中在同一画布校对。',
    categories: ['资源位'],
  },
  {
    label: '玩法与直播视觉',
    description: '玩法卡片、状态视觉和直播间包装按运行场景集中管理。',
    categories: ['玩法视觉', '直播物料'],
  },
  {
    label: '传播与结算',
    description: '节目封面、宣传物料、线下屏与活动战报按传播阶段集中管理。',
    categories: ['传播物料', '结算物料'],
  },
] as const

export function documentedImageCanvases(activityCase: DocumentedActivityCase): DocumentedImageCanvas[] {
  return IMAGE_CANVAS_RULES.map((canvas) => ({
    ...canvas,
    items: activityCase.deliverables.filter((item) => canvas.categories.includes(item.category)),
  })).filter((canvas) => canvas.items.length > 0)
}

export const documentedActivityLabels = (projectName: string) => {
  const activityCase = DOCUMENTED_ACTIVITY_CASES[projectName]
  if (!activityCase) return []
  const imageCanvases = documentedImageCanvases(activityCase)
  return [
    DOCUMENTED_ACTIVITY_PAGES,
    DOCUMENTED_ACTIVITY_MATERIALS,
    ...activityCase.deliverables.filter((item) => item.category === '页面').map((item) => item.label),
    ...imageCanvases.map((canvas) => canvas.label),
  ]
}
