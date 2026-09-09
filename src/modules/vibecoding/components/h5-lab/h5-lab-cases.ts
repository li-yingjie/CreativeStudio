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
const HomeGuideBenchmarkH5 = lazy(() => import('../HomeGuideBenchmarkH5'))
const YoungVoiceXhsRebuild = lazy(() => import('../YoungVoiceXhsRebuild'))
const YoungVoiceArchiveH5Claude = lazy(
  () => import('../YoungVoiceArchiveH5Claude'),
)

/** 页面组件统一收成「接一个可选 state 播种」的形状，画布不关心具体字段。 */
type CasePageComponent = LazyExoticComponent<ComponentType<{ state?: never }>>

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
    id: 'winter-gathering',
    project: '冬日召集令 · 复刻',
    origin: 'H5 Benchmark · 冬日召集令',
    summary:
      '蓝色长画布 + 透明冬日 3D 主视觉，白色人格测试纸卡、路线任务卡与冬日手账收尾。',
    route: '/h5-reference-lab',
    width: 430,
    canvasTone: '#0a73c8',
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
      ['WinterGatheringH5.tsx', 'WinterGatheringH5.css'],
      [
        'winter-hero-benchmark-v2.jpg',
        'personality-card-art-v2.png',
        'route-card-collage.png',
        'journal-paper.png',
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
    id: 'young-voice',
    project: 'Young 声音藏品 · 复刻',
    origin: 'H5 Benchmark · Young 声音藏品',
    summary:
      '深蓝音乐拼贴 benchmark 的复刻：撕纸拼贴主版，外加一版 Claude 对照实现。',
    route: '/young-voice-archive',
    width: 430,
    canvasTone: '#06123e',
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
