import {
  JINGXIN_LIVESTREAM_ASSET_PROJECT,
  LIFE_SERVICE_RESOURCE_POSITION_PROJECT,
  MAGICX_HEADER_ASSET_PROJECT,
  XINZAI_IP_ASSET_PROJECT,
} from '../ProjectProductView.ts'
import type { BuildCard } from '../XiahuaChatUI.tsx'

export type AssetConversationScript = {
  sessionTitle: string
  request: string
  sourceCheck: string[]
  proposal: string
  confirmation: string
  productionCheck: string[]
  completion: string
  documentCard: BuildCard
  assetCard: BuildCard
}

/**
 * 已完成的纯素材项目不是空白会话。这里保留一条可追溯的项目历史：
 * 需求输入 → 读取来源 → 对齐方案 → 批量产出 → 校验交付。
 * 内容只描述当前素材项目的真实输入与产物，不虚构页面或玩法。
 */
export const ASSET_ONLY_PROJECT_CONVERSATIONS: Record<
  string,
  AssetConversationScript
> = {
  ['生服热点 Banner']: {
    sessionTitle: '热点 Banner 分层交付',
    request:
      '按生活服务资源位规范做一组热点 Banner。主规格 1170×330，要保留 Logo 和固定画面保护区，同时让主标题、副标题可以继续改字和调整位置。',
    sourceCheck: [
      '已读取热点话题 Banner 标准、文案字号门禁和发布校验清单。',
      '确认主画面与品牌 Logo 属于保护层；标题和副标题属于可编辑真文字层。',
      '项目只交付文档与设计素材，不创建页面或玩法配置。',
    ],
    proposal:
      '我会先产出一张 1170×330 的四层正式 Banner：主题画面、品牌 Logo、主标题和副标题；再附蓝、绿、黄、灰四套单图模板和一张案例战报长图。素材库先展示网格，点单图后再进入只包含该图的无限画布。',
    confirmation:
      '按这个做。标题必须是真文字，未锁定的文字图层要能拖动；Logo 和固定画面不能被误改。',
    productionCheck: [
      '四层 Banner 已按 1170×330 坐标系完成，主标题与副标题为真文字层。',
      '品牌 Logo 与主题画面已锁定，文字层可编辑、可拖拽并保留层序。',
      '四套模板和案例战报按原始尺寸入库，单图不会再按方形画布裁切。',
    ],
    completion:
      '热点 Banner 交付已完成：1 张可编辑四层 Banner、4 张语义模板和 1 张案例战报。点击素材先进入网格，再点具体图片进入单图无限画布。',
    documentCard: {
      type: 'doc',
      badge: '文档',
      title: '热点 Banner · 标准文档',
      desc: '画布规格、文字门禁与保护层规则',
    },
    assetCard: {
      type: 'asset',
      badge: '6 项',
      title: '热点 Banner 交付包',
      desc: '四层正式稿 + 四套模板 + 案例战报',
      preview: '/assets/hot-topic-banner/industry-showcase-1170x330.png',
    },
  },
  [XINZAI_IP_ASSET_PROJECT]: {
    sessionTitle: '城市生活季 IP 素材归档',
    request:
      '基于心仔官方规范，整理一套城市生活季 IP 素材包。先把角色规范、标准形象和吃喝玩乐动作归档，这期不做页面。',
    sourceCheck: [
      '已读取心仔 IP 规范文档与资产知识库，来源会随素材保留。',
      '先锁定头身比例、面部结构、心形特征、标准色与品牌标识，再筛选动作。',
      '本期只形成项目文档和素材库，不创建 H5、Lynx 或原生页面。',
    ],
    proposal:
      '建议拆成两组：一组放标准色、结构、比例、2D / 3D 标准形象与表情；另一组放打招呼、火锅、K 歌、滑板和出行动作。这样设计和供应商都能按场景查找。',
    confirmation:
      '可以。动作要覆盖餐饮、娱乐和出行，所有素材保留官方来源和使用边界。',
    productionCheck: [
      '按“规范与标准形象 / 吃喝玩乐动作”完成两组归档。',
      '逐项补齐来源说明、适用范围和不可修改的角色特征。',
      '检查同 IP 可复用边界，避免被误当作跨品牌通用素材。',
    ],
    completion:
      '已完成 13 项心仔资产归档：7 项规范与标准形象、6 项吃喝玩乐动作。项目没有页面产物，可从下面直接查看任务文档或进入素材库。',
    documentCard: {
      type: 'doc',
      badge: '文档',
      title: '心仔城市生活季 · 素材任务',
      desc: '角色定位、使用边界与供应商验收门禁',
    },
    assetCard: {
      type: 'asset',
      badge: '13 项',
      title: '心仔 IP 素材包',
      desc: '2 组 · 规范形象与吃喝玩乐动作',
      preview: '/assets/ip-kits/xinzai-2026/03-3d-front.png',
    },
  },
  [JINGXIN_LIVESTREAM_ASSET_PROJECT]: {
    sessionTitle: '直播间贴片拆层与交付',
    request:
      '给静心采耳馆做一套国风静养氛围的直播间贴片。要能单独替换背景、标题、品牌和权益，最后按 1374×2437 导出。',
    sourceCheck: [
      '已读取直播间贴片案例与产物说明，确认本项目只交付贴片与组合预览。',
      '来源母版为 1536×2752；导出按 1374×2437 目标规格适配。',
      '主播面部、商品讲解区和直播互动控件需要持续留空。',
    ],
    proposal:
      '我会拆成 7 个可复原图层：直播背景、上下贴片、主题标题、门店品牌、套餐权益和侧贴片；另外输出一张组合预览。品牌层默认锁定，所有叠加件保留透明通道。',
    confirmation:
      '按这个拆。权益用“经典采耳 45 分钟 ¥68”和“城市专享套餐 ¥55”，透明边缘要重点检查。',
    productionCheck: [
      '已完成组合预览与 7 个独立文件，同一坐标系可还原整套效果。',
      '已检查透明 PNG 白底、脏边与半透明色边。',
      '门店品牌层已锁定，标题和权益层可在素材编辑器中单独调整。',
    ],
    completion:
      '直播间贴片已交付，共 8 项：1 张组合预览 + 7 个独立图层。点击组合预览即可进入分层编辑；单个贴片仍按单图层资产管理。',
    documentCard: {
      type: 'doc',
      badge: '文档',
      title: '静心采耳馆 · 贴片任务',
      desc: '画布规格、内容口径与透明通道验收',
    },
    assetCard: {
      type: 'asset',
      badge: '8 项',
      title: '直播间贴片交付包',
      desc: '组合预览 + 7 个可独立替换图层',
      preview: '/assets/mock-projects/livestream/jingxin-preview.png',
    },
  },
  [LIFE_SERVICE_RESOURCE_POSITION_PROJECT]: {
    sessionTitle: '生活服务热点资源位周更',
    request:
      '按 V6.7.8 模板产出本周 8 个生活服务热点资源位，统一 1170×330。标题必须用需求原文，Logo 和右侧固定装饰不能被改写。',
    sourceCheck: [
      '已读取资源位生成与回归记录，确认 8 个主题和固定模板基线。',
      '蓝色用于清凉与避暑，绿色用于城市旅行，灰色用于餐饮，黄色用于节点活动。',
      '只允许正式成图进入素材库，过程稿、失败稿和无 Logo 底图不入库。',
    ],
    proposal:
      '我会先按语义路由分组，再逐张完成标题、Logo、固定装饰、安全区和 1170×330 尺寸检查。相同模板保留一致基线，但不把不同主题强行做成同一色调。',
    confirmation:
      '就按语义色路由做。清凉和旅行要有区别，餐饮标题优先保证一眼可读。',
    productionCheck: [
      '8 个主题已按蓝、绿、灰、黄四条语义路由完成排版。',
      '逐张核对标题原文、固定品牌件、安全区与 1170×330 输出尺寸。',
      '素材库仅保留 8 张正式成图，未混入中间稿。',
    ],
    completion:
      '本周 8 张资源位已经完成并通过交付检查。项目保持“任务文档 + 正式成图”的轻量结构，后续周更可继续沿用同一验收门禁。',
    documentCard: {
      type: 'doc',
      badge: '文档',
      title: '热点资源位 · 周更任务',
      desc: '8 个主题、语义路由与发布前门禁',
    },
    assetCard: {
      type: 'asset',
      badge: '8 张',
      title: 'V6.7.8 正式资源位',
      desc: '1170×330 · 蓝 / 绿 / 灰 / 黄四条路由',
      preview: '/assets/mock-projects/resource-position/ice-camp.png',
    },
  },
  [MAGICX_HEADER_ASSET_PROJECT]: {
    sessionTitle: '城市活动头图方向提案',
    request:
      '从 MagicX 首页选几张适合城市文旅活动的头图案例，整理成一份方向提案。先做构图参考，不要把案例直接当作本项目成品。',
    sourceCheck: [
      '已记录 2026-08-18 MagicX 首页案例快照与案例名称。',
      '候选覆盖中式夜游、江南直播、轻旅行和夏日事件四种构图语言。',
      '案例只用于方向评审；人物、IP、Logo 与投放版权不能被继承为正式资产。',
    ],
    proposal:
      '建议保留四个差异足够大的方向：建筑景深与夜色、地域符号与直播主题并置、轻松人物旅行、强标题赛事海报。评审只选“构图关系”，确定城市和授权后再派生新版本。',
    confirmation:
      '可以，四个方向都留着。每张标清案例名和来源，先不生成正式投放图。',
    productionCheck: [
      '已完成四张案例的来源、构图关注点和使用边界标记。',
      '未把案例重命名为项目生成物，也未混入无来源图片。',
      '下一阶段待补活动城市、标题、IP 授权、投放尺寸与 Logo 规范。',
    ],
    completion:
      '头图方向提案已整理完成，共 4 个有来源的参考样本。当前状态是“可评审方向”，不是“可发布成品”；确定需求后再基于选中方向新建版本。',
    documentCard: {
      type: 'doc',
      badge: '提案',
      title: '城市灵感 · 头图方向说明',
      desc: '四种构图语言、来源与版权边界',
    },
    assetCard: {
      type: 'asset',
      badge: '4 个',
      title: 'MagicX 首页案例参考板',
      desc: '有来源的构图样本 · 非正式投放成品',
      preview: '/assets/mock-projects/headers/wunvzhou-romance-banner.png',
    },
  },
}

export function getAssetOnlyProjectConversation(
  projectTitle: string,
): AssetConversationScript | undefined {
  return ASSET_ONLY_PROJECT_CONVERSATIONS[projectTitle]
}
