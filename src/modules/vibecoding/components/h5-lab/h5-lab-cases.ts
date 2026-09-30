import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { FileNode } from '../ProjectProductView'

/* ─── h5-reference-lab 的 case 目录 ───
 *
 * benchmark 反推实验产出的 H5 复刻页原本只挂在 `/h5-reference-lab` 这类裸路由上，
 * 工坊侧栏看不到。这里把每个 case 登记成一个真实项目：
 *
 *   - `states` 是同一版页面的关键交互态。画布把它们并排铺开（对齐 OJO 的
 *     Current page 多状态画布），左边的手机框仍然跑不播种的那一版，可点可滑。
 *   - `fileTree` 与 case 源码对得上，侧栏产物视图直接复用 marketing-h5 那套桶。
 */

const WinterGatheringH5 = lazy(() => import('../WinterGatheringH5'))
const ClimbingCbti = lazy(() => import('../climbing-cbti/App'))
const HomeGuideBenchmarkH5 = lazy(() => import('../HomeGuideBenchmarkH5'))
const StudyAbroadPkH5 = lazy(() => import('../StudyAbroadPkH5'))
const YoungVoiceXhsRebuild = lazy(() => import('../YoungVoiceXhsRebuild'))
const YoungVoiceArchiveH5Claude = lazy(
  () => import('../YoungVoiceArchiveH5Claude'),
)

/** 页面组件统一收成「接一个可选 state 播种」的形状，画布不关心具体字段。 */
/* case 页面同时是独立路由页和画布上的一帧：`embedded` 让它跳过 document.title、
   100dvh 这类整屏副作用，`state` 用来播种交互态铺状态帧。 */
type CasePageComponent = LazyExoticComponent<
  ComponentType<{ embedded?: boolean; state?: never }>
>

export interface H5LabState {
  /** 覆盖按状态帧 id 分组存储，改名会丢编辑，别动。 */
  id: string
  label: string
  /** 帧标题旁的一行说明，交代这一帧是什么状态。 */
  note?: string
  Component: CasePageComponent
  /** 播种给页面组件的交互态；不传就是默认态。 */
  state?: Record<string, unknown>
}

/** case 的设计系统 —— 补出来的界面照着它长，不然一屏生成页夹在复刻页中间会
 *  非常出戏。值都是从各自那份 CSS 里抄的真实 token，不是另起一套。 */
export interface H5LabDesign {
  /** 页面底色与页面上的文字 */
  pageBg: string
  pageInk: string
  pageMuted: string
  /** 纸面 / 卡片 */
  paper: string
  paperInk: string
  paperMuted: string
  border: string
  /** 主行动 */
  accent: string
  accentInk: string
  radius: number
  radiusLg: number
  shadow: string
  displayFont: string
  bodyFont: string
}

export interface H5LabCase {
  id: string
  /** 侧栏里的项目名 —— 同时是 PROJECT_KINDS 的 key。 */
  project: string
  /** 复刻的 benchmark 出处。 */
  origin: string
  summary: string
  /** 独立预览路由（没有就是只在工坊里可见）。 */
  route?: string
  /** 设计基准宽度，状态帧按它定宽。 */
  width: number
  /** 帧外的底色，和页面首屏对齐，缩放时不露白。 */
  canvasTone: string
  design: H5LabDesign
  states: H5LabState[]
  fileTree: FileNode[]
}

// lazy() 的类型会带上各页面自己的 state 形状，画布只按统一形状消费。
const page = (component: unknown) => component as CasePageComponent

function caseTree(
  docName: string,
  pageFiles: string[],
  assetFiles: string[],
): FileNode[] {
  return [
    {
      name: 'docs',
      type: 'dir',
      children: [{ name: docName, type: 'file' }],
    },
    {
      name: 'src',
      type: 'dir',
      children: [
        {
          name: 'pages',
          type: 'dir',
          children: pageFiles.map((name) => ({ name, type: 'file' as const })),
        },
      ],
    },
    {
      name: 'assets',
      type: 'dir',
      children: assetFiles.map((name) => ({ name, type: 'file' as const })),
    },
    {
      name: 'config',
      type: 'dir',
      children: [{ name: 'h5.config.json', type: 'file' }],
    },
  ]
}

export const H5_LAB_CASES: H5LabCase[] = [
  {
    id: 'climbing-cbti',
    project: '岩馆爬行动物图鉴 · 导入',
    origin: '用户上传 · Climbing_CBTI',
    summary: '攀岩人格测试：15 道题、8 种基础人格与 2 种隐藏结果，保留原始题面和计分规则。',
    route: '/climbing-cbti-lab',
    width: 430,
    canvasTone: '#f2f2f0',
    design: {
      pageBg: '#f2f2f0', pageInk: '#171717', pageMuted: '#beb9b2',
      paper: '#f4f3ef', paperInk: '#171717', paperMuted: '#beb9b2',
      border: 'rgba(23,23,23,.12)', accent: '#feca19', accentInk: '#171717',
      radius: 14, radiusLg: 999, shadow: 'none',
      displayFont: '"PingFang SC", "Noto Sans SC", sans-serif',
      bodyFont: '"PingFang SC", "Noto Sans SC", sans-serif',
    },
    states: [
      { id: 'climbing-cbti:cover', label: '首页', note: '点击开始，体验完整答题流程', Component: page(ClimbingCbti) },
      ...Array.from({ length: 15 }, (_, index) => ({
        id: `climbing-cbti:q${index + 1}`,
        label: `第 ${index + 1} 题`,
        note: '原包共用题面图片；透明按钮承载各题真实选项',
        Component: page(ClimbingCbti),
        state: { step: 'quiz', question: index + 1 },
      })),
      { id: 'climbing-cbti:loading', label: '识别中', note: '编辑态停留；完整流程中 3 秒后进入结果', Component: page(ClimbingCbti), state: { step: 'loading', resultCode: 'EMS+' } },
      ...['FPS', 'FMS', 'FPL', 'FML', 'EPS', 'EMS', 'EPL', 'EML', 'FPL+', 'EMS+'].map((code) => ({
        id: `climbing-cbti:result-${code}`,
        label: `结果 · ${code}`,
        note: '原包十种结果共用「活体豆包」图片',
        Component: page(ClimbingCbti),
        state: { step: 'result', resultCode: code },
      })),
      { id: 'climbing-cbti:preload', label: '资源加载', Component: page(ClimbingCbti), state: { step: 'preload' } },
      { id: 'climbing-cbti:gate', label: '环境提示', Component: page(ClimbingCbti), state: { step: 'gate' } },
    ],
    fileTree: caseTree(
      'climbing-cbti-editor-assessment.md',
      ['climbing-cbti/App.tsx', 'climbing-cbti/App.css', 'climbing-cbti/content/questions.ts', 'climbing-cbti/content/results.ts', 'climbing-cbti/lib/scoring.ts'],
      ['climbing-cbti/home.png', 'climbing-cbti/question.png', 'climbing-cbti/result.png', 'climbing-cbti/bg-wall.png', 'climbing-cbti/loading.webp', 'climbing-cbti/co-brand-logo.png'],
    ),
  },
  {
    id: 'winter-gathering',
    project: '冬日召集令 · 复刻',
    origin: 'H5 Benchmark · 冬日召集令',
    summary:
      '蓝色长画布 + 冬日 3D 主视觉；人格测试纸卡、趣味破冰场路线、温泉轮播、撒点野场景与电视抽奖一路排下来。',
    route: '/winter-gathering-lab',
    width: 430,
    canvasTone: '#0a73c8',
    // 取自 WinterGatheringH5.css：蓝底、暖白纸卡、浅蓝描边、硬投影
    design: {
      pageBg: '#fffefa',
      pageInk: '#0878d0',
      pageMuted: '#7b7466',
      paper: '#fffef8',
      paperInk: '#0878d0',
      paperMuted: '#b7a88b',
      border: '#a5def2',
      accent: '#0798ed',
      accentInk: '#ffffff',
      radius: 18,
      radiusLg: 28,
      shadow: '0 5px 0 rgba(14,111,194,.12)',
      displayFont: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      bodyFont: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    },
    states: [
      {
        id: 'winter-gathering:main',
        label: '默认态',
        note: '未测人格、未领任务',
        Component: page(WinterGatheringH5),
      },
      {
        id: 'winter-gathering:tested',
        label: '已解锁人格',
        note: '人格测试完成后的卡面',
        Component: page(WinterGatheringH5),
        state: { tested: true },
      },
      {
        id: 'winter-gathering:joined',
        label: '已领取任务',
        note: '报名与解锁按钮全部转成已完成态',
        Component: page(WinterGatheringH5),
        state: { tested: true, joined: true },
      },
    ],
    fileTree: caseTree(
      '冬日召集令复刻说明.md',
      ['WinterGatheringH5.tsx', 'WinterGatheringH5.css', 'H5LayoutEditor.tsx'],
      [
        'winter-hero-benchmark-v2.jpg',
        'personality-card-art-v2.png',
        'spa-module-lockup-v6.jpg',
        'snow-title-lockup-v6.png',
        'snow-scene-friends-v6.jpg',
        'gear-module-lockup-v5.jpg',
      ],
    ),
  },
  {
    id: 'home-guide',
    project: '家居焕新指南 · 复刻',
    origin: 'H5 Benchmark · 双11家居焕新指南',
    summary:
      '暖黄三段渐变底、宋体标题族与三套异形卡轮廓（牌匾 / 拱顶投稿卡 / 奖励牌匾）。',
    width: 430,
    canvasTone: '#f7ecd2',
    // 取自 HomeGuideBenchmarkH5.css：暖黄底、宋体标题、金棕描边、暖橙 CTA
    design: {
      pageBg: '#fff5c7',
      pageInk: '#74413a',
      pageMuted: '#987064',
      paper: 'rgba(255,255,255,.82)',
      paperInk: '#74413a',
      paperMuted: '#987064',
      border: '#d7ae64',
      accent: '#ffad45',
      accentInk: '#fffaf0',
      radius: 14,
      radiusLg: 28,
      shadow: '0 6px 18px rgba(160,110,40,.16)',
      displayFont: '"Songti SC", STSong, "Noto Serif CJK SC", SimSun, serif',
      bodyFont: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    },
    states: [
      {
        id: 'home-guide:main',
        label: '默认态 · 方向一',
        note: '投稿方向停在第一个票签',
        Component: page(HomeGuideBenchmarkH5),
      },
      {
        id: 'home-guide:direction-two',
        label: '方向二',
        note: '切到第二个投稿方向',
        Component: page(HomeGuideBenchmarkH5),
        state: { direction: 'two' },
      },
      {
        id: 'home-guide:submitted',
        label: '已投稿',
        note: '投稿完成后的行动区',
        Component: page(HomeGuideBenchmarkH5),
        state: { submitted: true },
      },
    ],
    fileTree: caseTree(
      '家居焕新 benchmark 反推规范.md',
      ['HomeGuideBenchmarkH5.tsx', 'HomeGuideBenchmarkH5.css'],
      [
        'home-hero-transparent.png',
        'plaque-outline.svg',
        'submission-card-outline.svg',
        'reward-plaque-outline.svg',
      ],
    ),
  },
  {
    id: 'study-abroad-pk',
    project: '留学 PK 赛 · 复刻',
    origin: 'H5 Benchmark · 留学 PK 赛',
    summary:
      '浅灰底 + 高饱和撞色分区，任务分档、抽奖池与招募区靠色块和粗体数字拉节奏。',
    width: 430,
    route: '/h5-reference-lab',
    canvasTone: '#f0eeee',
    // 取自 StudyAbroadPkH5.css：浅灰页、白卡 8px 圆角、洋红点缀、近黑胶囊按钮
    design: {
      pageBg: '#f0eeee',
      pageInk: '#11100f',
      pageMuted: '#6b6968',
      paper: '#ffffff',
      paperInk: '#11100f',
      paperMuted: '#6b6968',
      border: 'rgba(17,16,15,.12)',
      accent: '#ee1b9c',
      accentInk: '#ffffff',
      radius: 8,
      radiusLg: 999,
      shadow: '0 4px 14px rgba(17,16,15,.10)',
      displayFont: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
      bodyFont: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
    },
    states: [
      {
        id: 'study-abroad-pk:main',
        label: '默认态',
        note: '未报名、未领取',
        Component: StudyAbroadPkH5,
      },
      {
        id: 'study-abroad-pk:registered',
        label: '已报名',
        note: '报名后的按钮与状态位',
        Component: StudyAbroadPkH5,
        state: { registered: true },
      },
      {
        id: 'study-abroad-pk:claimed',
        label: '已领取奖励',
        note: '任务奖励领取后的状态',
        Component: StudyAbroadPkH5,
        state: { registered: true, claimed: true },
      },
    ],
    fileTree: caseTree(
      '留学 PK 赛复刻说明.md',
      ['StudyAbroadPkH5.tsx', 'StudyAbroadPkH5.css', 'StudyAbroadPkH5Model.ts'],
      [
        'study-pk-hero-v1.jpg',
        'study-pk-task-rewards-v2.jpg',
        'study-pk-challenge-v1.jpg',
        'study-pk-lottery-v1.jpg',
        'study-pk-recruitment-v1.jpg',
        'study-pk-gift-v1.jpg',
      ],
    ),
  },
  {
    id: 'young-voice',
    project: 'Young 声音藏品 · 复刻',
    origin: 'H5 Benchmark · Young 声音藏品',
    summary:
      '深蓝音乐拼贴 benchmark 的复刻：撕纸拼贴主版，外加一版 Claude 对照实现。',
    route: '/young-voice-archive',
    width: 430,
    canvasTone: '#06123e',
    // 取自 YoungVoiceXhsRebuild.css：深蓝夜色、米色纸卡、柠檬黄行动色
    design: {
      pageBg: '#06123e',
      pageInk: '#ffffff',
      pageMuted: '#c2d2e5',
      paper: '#f4f2df',
      paperInk: '#0b2867',
      paperMuted: '#5b6b8c',
      border: 'rgba(102,198,242,.38)',
      accent: '#f2e75d',
      accentInk: '#0b2867',
      radius: 14,
      radiusLg: 22,
      shadow: '0 14px 34px rgba(0,0,0,.34)',
      displayFont: '"Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif',
      bodyFont: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
    },
    states: [
      {
        id: 'young-voice:xhs',
        label: '默认态',
        note: '撕纸拼贴主版',
        Component: page(YoungVoiceXhsRebuild),
      },
      {
        id: 'young-voice:xhs-rules',
        label: '规则弹层',
        note: '活动规则展开',
        Component: page(YoungVoiceXhsRebuild),
        state: { rulesOpen: true },
      },
      {
        id: 'young-voice:claude',
        label: 'Claude 复刻版',
        note: '同一 benchmark 的对照实现',
        Component: page(YoungVoiceArchiveH5Claude),
      },
      {
        id: 'young-voice:claude-ranking',
        label: 'Claude 版 · 榜单',
        note: '对照实现切到榜单面板',
        Component: page(YoungVoiceArchiveH5Claude),
        state: { activePanel: 'ranking' },
      },
    ],
    fileTree: caseTree(
      'Young 声音藏品复刻对照.md',
      [
        'YoungVoiceXhsRebuild.tsx',
        'YoungVoiceXhsRebuild.css',
        'YoungVoiceArchiveH5Claude.tsx',
        'YoungVoiceArchiveH5Claude.css',
      ],
      [
        'gift-heart-knot.png',
        'gift-hairpin-flower.png',
        'gift-red-stage.png',
        'title-lockup.svg',
      ],
    ),
  },
]

const BY_PROJECT = new Map(H5_LAB_CASES.map((item) => [item.project, item]))

export const H5_LAB_PROJECT_NAMES = H5_LAB_CASES.map((item) => item.project)

export function getH5LabCase(project: string): H5LabCase | undefined {
  return BY_PROJECT.get(project)
}

export function isH5LabProject(project: string): boolean {
  return BY_PROJECT.has(project)
}
