import type {
  TowerDefenseUiComponentConfig,
  TowerDefenseUiConfig,
} from './TowerDefenseFlowModel'
import type { GameUiSlice } from './GameUiSlices'

/** Figma Phone frame 274×599.24，按 390 逻辑宽还原。 */
export const GAME_UI_WIDTH = 390
export const GAME_UI_HEIGHT = 853
export const GAME_UI_CORNER_RADIUS = 59
export const GAME_UI_FIT_ZOOM = 0.7
const FAT_UI_WIDTH = 750
const FAT_UI_HEIGHT = 1334

function scaleBox<T extends { x: number; y: number; width: number; height: number }>(
  box: T,
  fromWidth: number,
  fromHeight: number,
): T {
  return {
    ...box,
    x: Math.round((box.x * GAME_UI_WIDTH) / fromWidth),
    y: Math.round((box.y * GAME_UI_HEIGHT) / fromHeight),
    width: Math.round((box.width * GAME_UI_WIDTH) / fromWidth),
    height: Math.round((box.height * GAME_UI_HEIGHT) / fromHeight),
  }
}

function looksLikeFatCanvas(
  items: Array<{ x: number; y: number; width: number; height: number }>,
) {
  if (!items.length) return false
  const maxRight = Math.max(...items.map((item) => item.x + item.width))
  return maxRight > 500 && maxRight <= FAT_UI_WIDTH + 8
}

function scaleFatNodes(items: GameUiNode[]): GameUiNode[] {
  return items.map((item) => ({ ...item, ...scaleBox(item, FAT_UI_WIDTH, FAT_UI_HEIGHT) }))
}

export type GameUiScreenId = string
export type GameUiScreenKind =
  | 'start'
  | 'battle'
  | 'pause'
  | 'result'
  | 'overlay'
  | 'list'
  | 'form'
  | 'custom'
export type GameUiNodeKind =
  | 'container'
  | 'button'
  | 'icon'
  | 'text'
  | 'progress'
  | 'image'
export type GameUiTextPlacement = 'center' | 'bottom' | 'corner' | 'right'
export type GameUiAlignX = 'left' | 'center' | 'right'
export type GameUiAlignY = 'top' | 'middle' | 'bottom'
export type GameUiButtonVariant = 'plain' | 'titled' | 'titled-icon'
export type GameUiBind = 'hp' | 'coins' | 'wave'
export type GameUiRender = 'code' | 'art'
export type GameUiArtSource = 'code' | 'slice' | 'upload'
export type GameUiTransition = 'fade' | 'slide' | 'none'
export type GameUiLinkTrigger = 'tap' | 'game'

export interface GameUiArtifactVersion {
  id: 'v1' | 'v2'
  src: string
  generatedFromHash: string
  styleKey: string
  note?: string
}

export interface GameUiArtifact {
  versionId: GameUiArtifactVersion['id']
  primaryId?: GameUiArtifactVersion['id']
  versions: GameUiArtifactVersion[]
  collapsed?: boolean
}

export interface GameUiStyleLock {
  mode?: 'preset' | 'custom'
  keywords: string[]
  refs: string[]
  prompt?: string
}

export interface GameUiScreen {
  id: GameUiScreenId
  kind: GameUiScreenKind
  label: string
  note: string
  generated?: boolean
  fromScreenId?: string
  fromNodeId?: string
  fromLabel?: string
  artifact?: GameUiArtifact
}

export interface GameUiNode {
  id: string
  screen: GameUiScreenId
  name: string
  kind: GameUiNodeKind
  x: number
  y: number
  width: number
  height: number
  z: number
  visible: boolean
  locked: boolean
  text?: string
  hasText?: boolean
  hasFrame?: boolean
  iconName?: string
  textPlacement?: GameUiTextPlacement
  buttonVariant?: GameUiButtonVariant
  alignX?: GameUiAlignX
  alignY?: GameUiAlignY
  bind?: GameUiBind | null
  render?: GameUiRender
  artSlot?: string
  artSource?: GameUiArtSource
  artSliceId?: string
  artVersionId?: GameUiArtifactVersion['id']
  artPinned?: boolean
  artPrev?: GameUiArtSnapshot
}

export interface GameUiArtSnapshot {
  render: GameUiRender
  artSlot?: string
  artSource?: GameUiArtSource
  artSliceId?: string
  artVersionId?: GameUiArtifactVersion['id']
  artPinned?: boolean
}

export interface GameUiLink {
  targetId: string
  transition: GameUiTransition
  trigger?: GameUiLinkTrigger
}

export interface GameUiDraft {
  nodes: GameUiNode[]
  screens: GameUiScreen[]
  links: Record<string, GameUiLink>
  slices: GameUiSlice[]
}

export const GAME_UI_KIND_LABEL: Record<GameUiNodeKind, string> = {
  container: '容器',
  button: '按钮',
  icon: '图标',
  text: '文字',
  progress: '进度条',
  image: '图片',
}

export const GAME_UI_BUTTON_VARIANTS: Array<[GameUiButtonVariant, string]> = [
  ['plain', '普通按钮'],
  ['titled', '按钮带标题'],
  ['titled-icon', '按钮带标题图标'],
]

export function alignXFromPlacement(placement?: GameUiTextPlacement): GameUiAlignX {
  return placement === 'right' || placement === 'corner' ? 'right' : 'center'
}

export function alignYFromPlacement(placement?: GameUiTextPlacement): GameUiAlignY {
  if (placement === 'bottom') return 'bottom'
  if (placement === 'corner') return 'top'
  return 'middle'
}

export function placementFromAlign(alignX: GameUiAlignX, alignY: GameUiAlignY): GameUiTextPlacement {
  if (alignX === 'right' && alignY === 'top') return 'corner'
  if (alignX === 'right') return 'right'
  if (alignY === 'bottom') return 'bottom'
  return 'center'
}

export function nodeButtonVariant(node: GameUiNode): GameUiButtonVariant {
  if (
    node.buttonVariant === 'plain' ||
    node.buttonVariant === 'titled' ||
    node.buttonVariant === 'titled-icon'
  ) {
    return node.buttonVariant
  }
  if (node.iconName && node.hasText !== false) return 'titled-icon'
  if (node.hasText === false) return 'plain'
  return 'titled'
}

export function nodeAlignX(node: GameUiNode): GameUiAlignX {
  if (node.alignX === 'left' || node.alignX === 'center' || node.alignX === 'right') {
    return node.alignX
  }
  return alignXFromPlacement(node.textPlacement)
}

export function nodeAlignY(node: GameUiNode): GameUiAlignY {
  if (node.alignY === 'top' || node.alignY === 'middle' || node.alignY === 'bottom') {
    return node.alignY
  }
  return alignYFromPlacement(node.textPlacement)
}

export const GAME_UI_SCREENS: readonly GameUiScreen[] = [
  { id: 'start', kind: 'start', label: '开始页', note: '标题与入口' },
  { id: 'battle', kind: 'battle', label: '对局态', note: 'HUD 叠在战场上' },
  { id: 'pause', kind: 'pause', label: '暂停态', note: '对局暂停' },
  { id: 'win', kind: 'result', label: '胜利结算', note: '守卫成功' },
  { id: 'lose', kind: 'result', label: '失败结算', note: '灯塔失守' },
]

export const GAME_UI_BATTLE_TRIGGERS = [
  { id: 'hp', label: '血量归零', targetId: 'lose', note: '由对局触发，不手连' },
  { id: 'wave', label: '波次打完', targetId: 'win', note: '由对局触发，不手连' },
] as const

export function createDefaultGameUiScreens(): GameUiScreen[] {
  return GAME_UI_SCREENS.map((screen) => ({ ...screen }))
}

export function linkKey(screenId: string, nodeId: string) {
  return `${screenId}||${nodeId}`
}

export function isHotspot(node: GameUiNode) {
  return node.kind === 'button' || node.kind === 'icon'
}

export function createDefaultGameUiLinks(): Record<string, GameUiLink> {
  return {
    [linkKey('start', 'start-play')]: { targetId: 'battle', transition: 'fade', trigger: 'tap' },
    [linkKey('pause', 'pause-continue')]: { targetId: 'battle', transition: 'fade', trigger: 'tap' },
    [linkKey('battle', 'battle-controls')]: { targetId: 'pause', transition: 'fade', trigger: 'tap' },
  }
}

function node(
  screen: GameUiScreenId,
  partial: Omit<GameUiNode, 'screen' | 'visible' | 'locked' | 'render'> &
    Partial<Pick<GameUiNode, 'visible' | 'locked' | 'render'>>,
): GameUiNode {
  return {
    visible: true,
    locked: false,
    render: 'code',
    textPlacement: partial.hasText || partial.kind === 'text' || partial.kind === 'button'
      ? 'center'
      : undefined,
    ...partial,
    screen,
  }
}

const BATTLE_HUD = {
  id: 'battle-hud',
  name: '战斗 HUD',
  kind: 'container' as const,
  x: 0,
  y: 0,
  width: 390,
  height: 68,
  z: 30,
  hasText: true,
  hasFrame: true,
}

const BATTLE_WAVE = {
  id: 'battle-wave',
  name: '波次进度',
  kind: 'progress' as const,
  x: 20,
  y: 80,
  width: 350,
  height: 26,
  z: 32,
  hasText: true,
  hasFrame: true,
  text: '第 2 波 · 7 / 12',
  bind: 'wave' as const,
}

const BATTLE_CONTROLS = {
  id: 'battle-controls',
  name: '对局控件',
  kind: 'container' as const,
  x: 342,
  y: 118,
  width: 36,
  height: 104,
  z: 34,
  hasFrame: true,
}

const BATTLE_DOCK = {
  id: 'battle-dock',
  name: '防御塔卡组',
  kind: 'container' as const,
  x: 0,
  y: 708,
  width: 390,
  height: 145,
  z: 30,
  hasText: true,
  hasFrame: true,
}

const FIGMA_START_WIDTH = 750
const FIGMA_START_HEIGHT = 1643

function figStartBox(x: number, y: number, width: number, height: number) {
  return {
    x: Math.max(0, Math.round((x * GAME_UI_WIDTH) / FIGMA_START_WIDTH)),
    y: Math.max(0, Math.round((y * GAME_UI_HEIGHT) / FIGMA_START_HEIGHT)),
    width: Math.max(1, Math.round((width * GAME_UI_WIDTH) / FIGMA_START_WIDTH)),
    height: Math.max(1, Math.round((height * GAME_UI_HEIGHT) / FIGMA_START_HEIGHT)),
  }
}

export function ensureDefaultLayoutNodes(nodes: GameUiNode[]) {
  const have = new Set(nodes.map((item) => item.id))
  const missing = createDefaultGameUiLayout().filter((item) => !have.has(item.id))
  return missing.length ? [...missing, ...nodes] : nodes
}

export function createDefaultGameUiLayout(): GameUiNode[] {
  return [
    node('start', {
      id: 'start-bg',
      name: '页面背景',
      kind: 'container',
      x: 0,
      y: 0,
      width: GAME_UI_WIDTH,
      height: GAME_UI_HEIGHT,
      z: 0,
    }),
    node('start', {
      id: 'start-logo',
      name: '标题 Logo',
      kind: 'image',
      ...figStartBox(110, 108, 566, 316),
      z: 16,
      hasFrame: true,
    }),
    node('start', {
      id: 'start-title',
      name: '游戏标题',
      kind: 'text',
      x: 24,
      y: 264,
      width: 342,
      height: 40,
      z: 20,
      hasText: true,
      text: '暮光防线',
    }),
    node('start', {
      id: 'start-subtitle',
      name: '关卡副标题',
      kind: 'text',
      x: 32,
      y: 308,
      width: 326,
      height: 22,
      z: 20,
      hasText: true,
      text: '守住月光灯塔',
    }),
    node('start', {
      id: 'start-play',
      name: '开始游戏',
      kind: 'button',
      ...figStartBox(211, 1254, 327, 150),
      z: 24,
      hasText: true,
      hasFrame: true,
      text: '开始游戏',
    }),
    node('start', {
      id: 'start-rank',
      name: '排行榜',
      kind: 'button',
      ...figStartBox(211, 1404, 327, 137),
      z: 24,
      hasText: true,
      hasFrame: true,
      text: '排行榜',
    }),
    node('start', {
      id: 'start-load',
      name: '加载进度',
      kind: 'progress',
      x: 32,
      y: 548,
      width: 326,
      height: 24,
      z: 18,
      hasText: true,
      hasFrame: true,
      text: '关卡加载进度 65%',
    }),
    node('start', {
      id: 'start-mail',
      name: '音乐',
      kind: 'icon',
      ...figStartBox(664, 40, 60, 60),
      z: 26,
      hasFrame: true,
      iconName: '音乐',
    }),
    node('start', {
      id: 'start-rank-icon',
      name: '音效',
      kind: 'icon',
      ...figStartBox(664, 120, 60, 60),
      z: 26,
      hasFrame: true,
      iconName: '音效',
    }),
    node('battle', BATTLE_HUD),
    node('battle', BATTLE_WAVE),
    node('battle', BATTLE_CONTROLS),
    node('battle', BATTLE_DOCK),
    node('pause', { ...BATTLE_HUD, id: 'pause-hud' }),
    node('pause', { ...BATTLE_DOCK, id: 'pause-dock' }),
    node('pause', {
      id: 'pause-panel',
      name: '暂停面板',
      kind: 'container',
      x: 22,
      y: 268,
      width: 346,
      height: 176,
      z: 50,
      hasText: true,
      hasFrame: true,
      text: '对局已暂停',
    }),
    node('pause', {
      id: 'pause-continue',
      name: '继续游戏',
      kind: 'button',
      x: 51,
      y: 380,
      width: 288,
      height: 44,
      z: 52,
      hasText: true,
      hasFrame: true,
      text: '继续守夜',
    }),
    node('win', {
      id: 'win-panel',
      name: '胜利结算',
      kind: 'container',
      x: 18,
      y: 186,
      width: 354,
      height: 360,
      z: 50,
      hasText: true,
      hasFrame: true,
      text: '守卫成功',
    }),
    node('lose', {
      id: 'lose-panel',
      name: '失败结算',
      kind: 'container',
      x: 18,
      y: 186,
      width: 354,
      height: 360,
      z: 50,
      hasText: true,
      hasFrame: true,
      text: '灯塔失守',
    }),
  ]
}

export function createDefaultGameUiDraft(): GameUiDraft {
  return {
    nodes: createDefaultGameUiLayout(),
    screens: createDefaultGameUiScreens(),
    links: createDefaultGameUiLinks(),
    slices: [],
  }
}

export function normalizeGameUiNode(raw: Partial<GameUiNode> & Pick<GameUiNode, 'id'>): GameUiNode {
  const kind = raw.kind ?? 'container'
  const hasText = raw.hasText ?? (kind === 'text' || kind === 'button' || Boolean(raw.text))
  return {
    id: raw.id,
    screen: raw.screen ?? 'start',
    name: raw.name ?? raw.id,
    kind,
    x: Number.isFinite(raw.x) ? Number(raw.x) : 0,
    y: Number.isFinite(raw.y) ? Number(raw.y) : 0,
    width: Number.isFinite(raw.width) ? Number(raw.width) : 80,
    height: Number.isFinite(raw.height) ? Number(raw.height) : 32,
    z: Number.isFinite(raw.z) ? Number(raw.z) : 10,
    visible: raw.visible !== false,
    locked: Boolean(raw.locked),
    text: raw.text,
    hasText,
    hasFrame: raw.hasFrame,
    iconName: raw.iconName ?? (kind === 'icon' ? raw.name : undefined),
    textPlacement: raw.textPlacement ?? (hasText ? 'center' : undefined),
    buttonVariant:
      raw.buttonVariant === 'plain' ||
      raw.buttonVariant === 'titled' ||
      raw.buttonVariant === 'titled-icon'
        ? raw.buttonVariant
        : kind === 'button'
          ? 'titled'
          : undefined,
    alignX:
      raw.alignX === 'left' || raw.alignX === 'right' || raw.alignX === 'center'
        ? raw.alignX
        : hasText
          ? alignXFromPlacement(raw.textPlacement)
          : undefined,
    alignY:
      raw.alignY === 'top' || raw.alignY === 'bottom' || raw.alignY === 'middle'
        ? raw.alignY
        : hasText
          ? alignYFromPlacement(raw.textPlacement)
          : undefined,
    bind: raw.bind ?? null,
    render: raw.render === 'art' ? 'art' : 'code',
    artSlot: raw.artSlot,
    artSource:
      raw.artSource === 'slice' || raw.artSource === 'upload' ? raw.artSource : 'code',
    artSliceId: raw.artSliceId,
    artVersionId: raw.artVersionId === 'v2' ? 'v2' : raw.artVersionId === 'v1' ? 'v1' : undefined,
    artPinned: Boolean(raw.artPinned),
    artPrev: raw.artPrev
      ? {
          render: raw.artPrev.render === 'art' ? 'art' : 'code',
          artSlot: raw.artPrev.artSlot,
          artSource:
            raw.artPrev.artSource === 'slice' || raw.artPrev.artSource === 'upload'
              ? raw.artPrev.artSource
              : 'code',
          artSliceId: raw.artPrev.artSliceId,
          artVersionId:
            raw.artPrev.artVersionId === 'v2'
              ? 'v2'
              : raw.artPrev.artVersionId === 'v1'
                ? 'v1'
                : undefined,
          artPinned: Boolean(raw.artPrev.artPinned),
        }
      : undefined,
  }
}

export function snapshotNodeArt(node: GameUiNode): GameUiArtSnapshot {
  return {
    render: node.render ?? 'code',
    artSlot: node.artSlot,
    artSource: node.artSource,
    artSliceId: node.artSliceId,
    artVersionId: node.artVersionId,
    artPinned: node.artPinned,
  }
}

export function artMark(node: GameUiNode) {
  if (node.render !== 'art') return null
  return node.artSource === 'upload' ? '图·传' : '图·切'
}

export function nodesForScreen(nodes: GameUiNode[], screen: GameUiScreenId) {
  return nodes
    .filter((item) => item.screen === screen && item.visible)
    .sort((a, b) => a.z - b.z)
}

export function layersForScreen(nodes: GameUiNode[], screen: GameUiScreenId) {
  return nodes
    .filter((item) => item.screen === screen)
    .slice()
    .sort((a, b) => b.z - a.z)
}

export function hotspotsForScreen(nodes: GameUiNode[], screen: GameUiScreenId) {
  return layersForScreen(nodes, screen).filter((item) => item.visible && isHotspot(item))
}

export function moveNode(nodes: GameUiNode[], id: string, x: number, y: number) {
  return nodes.map((item) =>
    item.id === id && !item.locked
      ? { ...item, x: Math.round(x), y: Math.round(y) }
      : item,
  )
}

export function resizeNode(
  nodes: GameUiNode[],
  id: string,
  width: number,
  height: number,
) {
  return nodes.map((item) =>
    item.id === id && !item.locked
      ? {
          ...item,
          width: Math.max(24, Math.round(width)),
          height: Math.max(18, Math.round(height)),
        }
      : item,
  )
}

export function patchNode(
  nodes: GameUiNode[],
  id: string,
  patch: Partial<GameUiNode>,
) {
  return nodes.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function deleteNode(draft: GameUiDraft, nodeId: string): GameUiDraft {
  return {
    nodes: draft.nodes.filter((item) => item.id !== nodeId),
    screens: draft.screens,
    links: Object.fromEntries(
      Object.entries(draft.links).filter(([key]) => key.split('||')[1] !== nodeId),
    ),
    slices: draft.slices.map((item) =>
      item.nodeId === nodeId ? { ...item, nodeId: null } : item,
    ),
  }
}

const ADD_NODE_DEFAULTS: Record<
  GameUiNodeKind,
  {
    width: number
    height: number
    name: string
    text?: string
    hasText?: boolean
    hasFrame?: boolean
    iconName?: string
  }
> = {
  button: { width: 200, height: 44, name: '新按钮', text: '新按钮', hasText: true, hasFrame: true },
  icon: { width: 40, height: 40, name: '新图标', hasFrame: true, iconName: '图标' },
  text: { width: 240, height: 32, name: '新文案', text: '新文案', hasText: true },
  progress: { width: 240, height: 28, name: '新进度', text: '进度', hasText: true, hasFrame: true },
  image: { width: 160, height: 160, name: '新图片', hasFrame: true },
  container: { width: 280, height: 120, name: '新容器', hasFrame: true },
}

export function canSliceNode(node: GameUiNode) {
  return node.kind !== 'text'
}

export function sliceRect(node: GameUiNode) {
  const x = Math.max(0, Math.min(GAME_UI_WIDTH - 1, Math.round(node.x)))
  const y = Math.max(0, Math.min(GAME_UI_HEIGHT - 1, Math.round(node.y)))
  return {
    x,
    y,
    width: Math.max(1, Math.min(GAME_UI_WIDTH - x, Math.round(node.width))),
    height: Math.max(1, Math.min(GAME_UI_HEIGHT - y, Math.round(node.height))),
  }
}

export function sliceableNodes(nodes: GameUiNode[], screen: GameUiScreenId) {
  return nodesForScreen(nodes, screen).filter(canSliceNode)
}

export function screenArtBackfilled(nodes: GameUiNode[], screen: GameUiScreenId) {
  const sliceable = sliceableNodes(nodes, screen)
  return sliceable.length > 0 && sliceable.every((item) => item.render === 'art' && Boolean(item.artSlot))
}

export function applyNodeArt(
  nodes: GameUiNode[],
  nodeId: string,
  artSlot: string,
  meta?: {
    artSource?: GameUiArtSource
    artSliceId?: string
    artVersionId?: GameUiArtifactVersion['id']
    artPinned?: boolean
  },
) {
  return nodes.map((item) =>
    item.id === nodeId && canSliceNode(item)
      ? {
          ...item,
          artPrev: snapshotNodeArt(item),
          render: 'art' as const,
          artSlot,
          artSource: meta?.artSource ?? 'slice',
          artSliceId: meta?.artSliceId,
          artVersionId: meta?.artVersionId,
          artPinned: meta?.artPinned ?? item.artPinned,
        }
      : item,
  )
}

export function restoreNodeArt(nodes: GameUiNode[], nodeId: string) {
  return nodes.map((item) => {
    if (item.id !== nodeId) return item
    if (item.artPrev) {
      return { ...item, ...item.artPrev, artPrev: undefined }
    }
    return {
      ...item,
      render: 'code' as const,
      artSlot: undefined,
      artSource: 'code' as const,
      artSliceId: undefined,
      artVersionId: undefined,
      artPinned: false,
      artPrev: undefined,
    }
  })
}

export function nodeSkipsBackfill(node: GameUiNode) {
  return Boolean(node.artPinned) || node.artSource === 'upload'
}

export function backfillSlicesToNodes(
  nodes: GameUiNode[],
  slices: GameUiSlice[],
  opts?: { overwritePinned?: boolean; versionId?: GameUiArtifactVersion['id'] },
) {
  let applied = 0
  let skipped = 0
  let next = nodes
  for (const slice of slices) {
    if (!slice.nodeId) continue
    const node = next.find((item) => item.id === slice.nodeId)
    if (!node || !canSliceNode(node)) continue
    if (nodeSkipsBackfill(node) && !opts?.overwritePinned) {
      skipped += 1
      continue
    }
    next = applyNodeArt(next, node.id, slice.src, {
      artSource: 'slice',
      artSliceId: slice.id,
      artVersionId: opts?.versionId ?? slice.versionId,
      artPinned: false,
    })
    applied += 1
  }
  return { nodes: next, applied, skipped }
}

export function recutNodesToVersion(
  nodes: GameUiNode[],
  slices: GameUiSlice[],
  screenId: GameUiScreenId,
  versionId: GameUiArtifactVersion['id'],
  opts?: { overwritePinned?: boolean },
) {
  let recut = 0
  let skipped = 0
  let next = nodes
  for (const node of nodes.filter(
    (item) => item.screen === screenId && item.artSource === 'slice',
  )) {
    if (node.artVersionId === versionId) continue
    if (nodeSkipsBackfill(node) && !opts?.overwritePinned) {
      skipped += 1
      continue
    }
    const slice = slices.find((item) => item.nodeId === node.id)
    if (!slice) continue
    next = applyNodeArt(next, node.id, slice.src, {
      artSource: 'slice',
      artSliceId: slice.id,
      artVersionId: versionId,
      artPinned: false,
    })
    recut += 1
  }
  return { nodes: next, recut, skipped }
}

export function foreignSliceCount(
  nodes: GameUiNode[],
  screenId: GameUiScreenId,
  versionId: GameUiArtifactVersion['id'],
) {
  return nodes.filter(
    (item) =>
      item.screen === screenId &&
      item.artSource === 'slice' &&
      item.artVersionId &&
      item.artVersionId !== versionId,
  ).length
}

export function clearNodeArt(nodes: GameUiNode[], nodeId: string) {
  return nodes.map((item) =>
    item.id === nodeId
      ? {
          ...item,
          render: 'code' as const,
          artSlot: undefined,
          artSource: 'code' as const,
          artSliceId: undefined,
          artVersionId: undefined,
          artPinned: false,
          artPrev: undefined,
        }
      : item,
  )
}

export function createAddedNode(
  screen: GameUiScreenId,
  kind: GameUiNodeKind,
  existing: GameUiNode[],
): GameUiNode {
  const preset = ADD_NODE_DEFAULTS[kind]
  const siblings = existing.filter((item) => item.screen === screen)
  const z = (siblings.reduce((max, item) => Math.max(max, item.z), 10) || 10) + 2
  let x = Math.round((GAME_UI_WIDTH - preset.width) / 2)
  let y = Math.round((GAME_UI_HEIGHT - preset.height) / 2)
  while (siblings.some((item) => item.x === x && item.y === y)) y += 28
  return normalizeGameUiNode({
    id: `add:${kind}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    screen,
    kind,
    name: preset.name,
    x,
    y,
    width: preset.width,
    height: preset.height,
    z,
    text: preset.text,
    hasText: preset.hasText,
    hasFrame: preset.hasFrame,
    iconName: preset.iconName,
    render: 'code',
  })
}

export function cloneDraft(draft: GameUiDraft): GameUiDraft {
  return {
    nodes: draft.nodes.map((item) => ({ ...item })),
    screens: draft.screens.map((item) => ({ ...item })),
    links: { ...draft.links },
    slices: draft.slices.map((item) => ({ ...item })),
  }
}

export interface GameUiGeneratedSpec {
  id: string
  kind: GameUiScreenKind
  label: string
  note: string
  title: string
  body: string
  primaryAction: string
  secondaryAction?: string
  rows?: string[]
}

export function nodesFromGeneratedSpec(
  screenId: string,
  spec: GameUiGeneratedSpec,
): GameUiNode[] {
  const rows = spec.rows ?? []
  if (spec.kind === 'overlay') {
    return [
      node(screenId, {
        id: `${screenId}-panel`,
        name: spec.label,
        kind: 'container',
        x: 24,
        y: 220,
        width: 342,
        height: spec.secondaryAction ? 300 : 248,
        z: 50,
        hasText: true,
        hasFrame: true,
        text: spec.title,
      }),
      node(screenId, {
        id: `${screenId}-title`,
        name: '标题',
        kind: 'text',
        x: 40,
        y: 244,
        width: 310,
        height: 36,
        z: 52,
        hasText: true,
        text: spec.title,
      }),
      node(screenId, {
        id: `${screenId}-body`,
        name: '说明',
        kind: 'text',
        x: 40,
        y: 288,
        width: 310,
        height: 56,
        z: 52,
        hasText: true,
        text: spec.body,
      }),
      node(screenId, {
        id: `${screenId}-primary`,
        name: spec.primaryAction,
        kind: 'button',
        x: 48,
        y: 380,
        width: 294,
        height: 44,
        z: 54,
        hasText: true,
        hasFrame: true,
        text: spec.primaryAction,
      }),
      ...(spec.secondaryAction
        ? [
            node(screenId, {
              id: `${screenId}-secondary`,
              name: spec.secondaryAction,
              kind: 'button' as const,
              x: 48,
              y: 432,
              width: 294,
              height: 40,
              z: 54,
              hasText: true,
              hasFrame: true,
              text: spec.secondaryAction,
            }),
          ]
        : []),
    ]
  }

  const listRows = rows.slice(0, 4).map((row, index) =>
    node(screenId, {
      id: `${screenId}-row-${index}`,
      name: row,
      kind: 'container',
      x: 20,
      y: 108 + index * 56,
      width: 350,
      height: 48,
      z: 24,
      hasText: true,
      hasFrame: true,
      text: row,
    }),
  )

  return [
    node(screenId, {
      id: `${screenId}-title`,
      name: '标题',
      kind: 'text',
      x: 24,
      y: 24,
      width: 342,
      height: 36,
      z: 20,
      hasText: true,
      text: spec.title,
    }),
    node(screenId, {
      id: `${screenId}-body`,
      name: '说明',
      kind: 'text',
      x: 24,
      y: 64,
      width: 342,
      height: 28,
      z: 20,
      hasText: true,
      text: spec.body,
    }),
    ...listRows,
    node(screenId, {
      id: `${screenId}-primary`,
      name: spec.primaryAction,
      kind: 'button',
      x: 48,
      y: 760,
      width: 294,
      height: 44,
      z: 30,
      hasText: true,
      hasFrame: true,
      text: spec.primaryAction,
    }),
  ]
}

export function createGeneratedScreen(
  spec: GameUiGeneratedSpec,
  hotspot: { screenId: string; nodeId: string; label: string },
): {
  screen: GameUiScreen
  nodes: GameUiNode[]
  key: string
  link: GameUiLink
  backLinks: Record<string, GameUiLink>
} {
  const screenId = `gen:${spec.id}:${Date.now().toString(36)}`
  const back: GameUiLink = {
    targetId: hotspot.screenId,
    transition: spec.kind === 'overlay' ? 'fade' : 'slide',
    trigger: 'tap',
  }
  return {
    screen: {
      id: screenId,
      kind: spec.kind,
      label: spec.label,
      note: spec.note,
      generated: true,
      fromScreenId: hotspot.screenId,
      fromNodeId: hotspot.nodeId,
      fromLabel: hotspot.label,
    },
    nodes: nodesFromGeneratedSpec(screenId, spec),
    key: linkKey(hotspot.screenId, hotspot.nodeId),
    link: {
      targetId: screenId,
      transition: spec.kind === 'overlay' ? 'fade' : 'slide',
      trigger: 'tap',
    },
    backLinks: {
      [linkKey(screenId, `${screenId}-primary`)]: back,
      ...(spec.secondaryAction
        ? { [linkKey(screenId, `${screenId}-secondary`)]: back }
        : {}),
    },
  }
}

export function deleteGeneratedScreen(draft: GameUiDraft, screenId: string): GameUiDraft {
  return {
    nodes: draft.nodes.filter((item) => item.screen !== screenId),
    screens: draft.screens.filter((item) => item.id !== screenId),
    links: Object.fromEntries(
      Object.entries(draft.links).filter(
        ([key, link]) => link.targetId !== screenId && key.split('||')[0] !== screenId,
      ),
    ),
    slices: draft.slices.filter((item) => item.screenId !== screenId),
  }
}

export function setGameUiLink(
  links: Record<string, GameUiLink>,
  screenId: string,
  nodeId: string,
  patch: Partial<GameUiLink> & { targetId?: string },
): Record<string, GameUiLink> {
  const key = linkKey(screenId, nodeId)
  const next = { ...links }
  const merged = {
    targetId: patch.targetId ?? next[key]?.targetId ?? '',
    transition: patch.transition ?? next[key]?.transition ?? 'fade',
    trigger: patch.trigger ?? next[key]?.trigger ?? 'tap',
  } satisfies GameUiLink
  if (!merged.targetId) delete next[key]
  else next[key] = merged
  return next
}

const LAYOUT_TO_COMPONENT: Record<string, TowerDefenseUiComponentConfig['id']> = {
  'battle-hud': 'battle-hud',
  'battle-wave': 'wave-progress',
  'battle-dock': 'tower-dock',
  'battle-controls': 'battle-controls',
  'win-panel': 'result-panel',
  'lose-panel': 'result-panel',
}

function asDraft(input: GameUiNode[] | GameUiDraft): GameUiDraft {
  if (Array.isArray(input)) {
    return {
      nodes: input,
      screens: createDefaultGameUiScreens(),
      links: createDefaultGameUiLinks(),
      slices: [],
    }
  }
  return { ...input, slices: input.slices ?? [] }
}

export function applyLayoutToUi(
  ui: TowerDefenseUiConfig,
  input: GameUiNode[] | GameUiDraft,
): TowerDefenseUiConfig {
  const draft = asDraft(input)
  return {
    ...ui,
    layout: draft.nodes,
    screens: draft.screens,
    links: draft.links,
    slices: draft.slices,
    selectedComponentId:
      LAYOUT_TO_COMPONENT[ui.selectedComponentId] ?? ui.selectedComponentId,
    components: ui.components.map((component) => {
      const found = draft.nodes.find(
        (item) => LAYOUT_TO_COMPONENT[item.id] === component.id,
      )
      if (!found) return component
      return {
        ...component,
        visible: found.visible,
        x: found.x,
        y: found.y,
        width: found.width,
        height: found.height,
      }
    }),
  }
}

export function draftFromUi(ui: TowerDefenseUiConfig): GameUiDraft {
  const fallback = createDefaultGameUiDraft()
  const rawNodes = ui.layout?.length
    ? ui.layout.map((item) => normalizeGameUiNode(item))
    : fallback.nodes
  const scaledNodes = looksLikeFatCanvas(rawNodes) ? scaleFatNodes(rawNodes) : rawNodes
  const ensuredNodes = ensureDefaultLayoutNodes(scaledNodes)
  const screens = ui.screens?.length
    ? ui.screens.map((item) => ({ ...item }))
    : fallback.screens
  const links =
    ui.links && Object.keys(ui.links).length ? { ...ui.links } : fallback.links
  const rawSlices = ui.slices?.length ? ui.slices.map((item) => ({ ...item })) : fallback.slices
  const slices = looksLikeFatCanvas(rawSlices.map((item) => item.bbox))
    ? rawSlices.map((item) => ({ ...item, bbox: scaleBox(item.bbox, FAT_UI_WIDTH, FAT_UI_HEIGHT) }))
    : rawSlices
  return { nodes: ensuredNodes, screens, links, slices }
}

export function layoutFromUi(ui: TowerDefenseUiConfig): GameUiNode[] {
  return draftFromUi(ui).nodes
}
