import type {
  GameUiArtifact,
  GameUiNode,
  GameUiNodeKind,
  GameUiScreenId,
} from './GameUiModel'

const SCREEN_LABELS: Record<string, string> = {
  start: '开始页',
  battle: '对局态',
  pause: '暂停态',
  win: '胜利结算',
  lose: '失败结算',
}
import type { TowerDefenseAsset } from './TowerDefenseFlowModel'

export const CATALOG_UI_SLICE_PREFIX = 'catalog-ui:'

const GAME_UI_WIDTH = 390
const GAME_UI_HEIGHT = 853

export type GameUiArtSource = 'code' | 'slice' | 'upload'
export type GameUiSliceOrigin = 'auto' | 'manual' | 'upload'

export interface GameUiSliceBox {
  x: number
  y: number
  width: number
  height: number
}

export interface GameUiSlice {
  id: string
  screenId: GameUiScreenId
  versionId: GameUiArtifact['versionId']
  name: string
  src: string
  bbox: GameUiSliceBox
  nodeId: string | null
  score: number
  origin: GameUiSliceOrigin
  kind?: GameUiNodeKind
  inLibrary?: boolean
}

export const START_PAGE_ART = '/tower-defense/ui-art/start/page-v1.jpg'
const START_SLICE = '/tower-defense/ui-art/start'

const FIGMA_WIDTH = 750
const FIGMA_HEIGHT = 1643

export function figToCanvas(
  x: number,
  y: number,
  width: number,
  height: number,
): GameUiSliceBox {
  return {
    x: Math.max(0, Math.round((x * GAME_UI_WIDTH) / FIGMA_WIDTH)),
    y: Math.max(0, Math.round((y * GAME_UI_HEIGHT) / FIGMA_HEIGHT)),
    width: Math.max(1, Math.round((width * GAME_UI_WIDTH) / FIGMA_WIDTH)),
    height: Math.max(1, Math.round((height * GAME_UI_HEIGHT) / FIGMA_HEIGHT)),
  }
}

function startSlice(
  partial: Omit<GameUiSlice, 'screenId' | 'versionId' | 'inLibrary' | 'origin'> &
    Partial<Pick<GameUiSlice, 'origin' | 'inLibrary'>>,
): GameUiSlice {
  return {
    screenId: 'start',
    versionId: 'v1',
    origin: 'auto',
    inLibrary: false,
    ...partial,
  }
}

export function ensurePresetSlices(slices: GameUiSlice[]) {
  const hasStartV1 = slices.some((item) => item.screenId === 'start' && item.versionId === 'v1')
  if (!hasStartV1) return slices
  const have = new Set(slices.map((item) => item.id))
  const missing = createStartV1Slices().filter((item) => !have.has(item.id))
  return missing.length ? [...missing, ...slices] : slices
}

/** Figma 开始页预置切片：背景容器 + 图层原图，不合成整页。 */
export function createStartV1Slices(): GameUiSlice[] {
  return [
    startSlice({
      id: 'start-v1-bg',
      name: '页面背景',
      src: `${START_SLICE}/bg.jpg`,
      bbox: figToCanvas(0, 0, FIGMA_WIDTH, FIGMA_HEIGHT),
      nodeId: 'start-bg',
      score: 0.99,
      kind: 'container',
    }),
    startSlice({
      id: 'start-v1-logo',
      name: '标题 Logo',
      src: `${START_SLICE}/logo.png`,
      bbox: figToCanvas(110, 108, 566, 316),
      nodeId: 'start-logo',
      score: 0.96,
      kind: 'image',
    }),
    startSlice({
      id: 'start-v1-play',
      name: '开始游戏',
      src: `${START_SLICE}/play.png`,
      bbox: figToCanvas(211, 1254, 327, 150),
      nodeId: 'start-play',
      score: 0.94,
      kind: 'button',
    }),
    startSlice({
      id: 'start-v1-rank',
      name: '排行榜',
      src: `${START_SLICE}/rank.png`,
      bbox: figToCanvas(211, 1404, 327, 137),
      nodeId: 'start-rank',
      score: 0.93,
      kind: 'button',
    }),
    startSlice({
      id: 'start-v1-music',
      name: '音乐',
      src: `${START_SLICE}/music.png`,
      bbox: figToCanvas(664, 40, 60, 60),
      nodeId: 'start-mail',
      score: 0.91,
      kind: 'icon',
    }),
    startSlice({
      id: 'start-v1-sound',
      name: '音效',
      src: `${START_SLICE}/sound.png`,
      bbox: figToCanvas(664, 120, 60, 60),
      nodeId: 'start-rank-icon',
      score: 0.9,
      kind: 'icon',
    }),
  ]
}

export function slicesForVersion(
  slices: GameUiSlice[],
  screenId: GameUiScreenId,
  versionId: GameUiArtifact['versionId'],
) {
  return slices.filter((item) => item.screenId === screenId && item.versionId === versionId)
}

export function librarySlices(slices: GameUiSlice[], screenId?: GameUiScreenId) {
  return slices.filter((item) => item.inLibrary === true && (!screenId || item.screenId === screenId))
}

export function groupLibrarySlices(slices: GameUiSlice[]) {
  const groups: Array<{
    key: string
    screenId: GameUiScreenId
    versionId: GameUiArtifact['versionId']
    items: GameUiSlice[]
  }> = []
  for (const slice of slices.filter((item) => item.inLibrary === true)) {
    const key = `${slice.screenId}:${slice.versionId}`
    const found = groups.find((item) => item.key === key)
    if (found) found.items.push(slice)
    else {
      groups.push({
        key,
        screenId: slice.screenId,
        versionId: slice.versionId,
        items: [slice],
      })
    }
  }
  return groups
}

export function uiSliceGroupTitle(
  screenId: GameUiScreenId,
  _versionId: GameUiArtifact['versionId'],
  screens?: Array<{ id: string; label: string }>,
) {
  const label =
    screens?.find((item) => item.id === screenId)?.label ??
    SCREEN_LABELS[screenId] ??
    screenId
  return `${label} UI`
}

export function catalogUiSliceAssetId(
  screenId: GameUiScreenId,
  versionId: GameUiArtifact['versionId'],
) {
  return `${CATALOG_UI_SLICE_PREFIX}${screenId}:${versionId}`
}

export function isCatalogUiSliceAssetId(id: string) {
  return id.startsWith(CATALOG_UI_SLICE_PREFIX)
}

export function buildCatalogUiSliceAsset(
  group: { screenId: GameUiScreenId; versionId: GameUiArtifact['versionId']; items: GameUiSlice[] },
  title = uiSliceGroupTitle(group.screenId, group.versionId),
): TowerDefenseAsset {
  return {
    id: catalogUiSliceAssetId(group.screenId, group.versionId),
    name: title,
    category: 'visual-style',
    role: 'UI 切片',
    description: `${title} · ${group.items.length} 张拆分素材`,
    accent: '#357ef8',
    baseVisualStatus: 'confirmed',
    selectedVisualVersion: 0,
    visualVersions: group.items.map((item) => ({
      id: item.id,
      src: item.src,
      width: Math.max(1, Math.round(item.bbox.width)),
      height: Math.max(1, Math.round(item.bbox.height)),
      source: item.origin === 'upload' ? 'upload' : 'generated',
      label: item.name,
    })),
    states: [],
  }
}

export function sliceMatchCount(slices: GameUiSlice[]) {
  return {
    matched: slices.filter((item) => item.nodeId).length,
    pending: slices.filter((item) => !item.nodeId).length,
  }
}

export function nodeSkipsBackfill(node: GameUiNode) {
  return Boolean(node.artPinned) || node.artSource === 'upload'
}

export function assignSliceToNode(
  slices: GameUiSlice[],
  sliceId: string,
  nodeId: string | null,
): GameUiSlice[] {
  return slices.map((item) => {
    if (item.id === sliceId) {
      return {
        ...item,
        nodeId,
        origin: nodeId ? 'manual' : item.origin,
        score: nodeId ? Math.max(item.score, 0.99) : item.score,
      }
    }
    if (nodeId && item.nodeId === nodeId) return { ...item, nodeId: null }
    return item
  })
}

export function markSlicesInLibrary(slices: GameUiSlice[], ids?: string[]) {
  return slices.map((item) =>
    !ids || ids.includes(item.id) ? { ...item, inLibrary: true } : item,
  )
}

export function deleteSlices(slices: GameUiSlice[], ids: string[]) {
  const drop = new Set(ids)
  return slices.filter((item) => !drop.has(item.id))
}

export function createUploadSlice(
  screenId: GameUiScreenId,
  versionId: GameUiArtifact['versionId'],
  node: GameUiNode,
  src: string,
): GameUiSlice {
  return {
    id: `upload:${node.id}:${Date.now().toString(36)}`,
    screenId,
    versionId,
    name: node.name,
    src,
    bbox: sliceBoxFromNode(node),
    nodeId: node.id,
    score: 1,
    origin: 'upload',
    kind: node.kind,
    inLibrary: true,
  }
}

export function sliceBoxFromNode(node: GameUiNode): GameUiSliceBox {
  const x = Math.max(0, Math.min(GAME_UI_WIDTH - 1, Math.round(node.x)))
  const y = Math.max(0, Math.min(GAME_UI_HEIGHT - 1, Math.round(node.y)))
  return {
    x,
    y,
    width: Math.max(1, Math.min(GAME_UI_WIDTH - x, Math.round(node.width))),
    height: Math.max(1, Math.min(GAME_UI_HEIGHT - y, Math.round(node.height))),
  }
}

export function replaceVersionSlices(
  slices: GameUiSlice[],
  next: GameUiSlice[],
) {
  const versionKey = new Set(next.map((item) => `${item.screenId}:${item.versionId}`))
  return [
    ...slices.filter((item) => !versionKey.has(`${item.screenId}:${item.versionId}`)),
    ...next,
  ]
}

export function pickerSlicesForNode(slices: GameUiSlice[], node: GameUiNode) {
  const library = librarySlices(slices, node.screen)
  const pool = library.length
    ? library
    : slices.filter((item) => item.screenId === node.screen)
  const sameKind = pool.filter((item) => item.kind === node.kind)
  return sameKind.length ? sameKind : pool
}

export function normalizeGameUiSlice(raw: Partial<GameUiSlice> & Pick<GameUiSlice, 'id'>): GameUiSlice {
  return {
    id: raw.id,
    screenId: raw.screenId ?? 'start',
    versionId: raw.versionId === 'v2' ? 'v2' : 'v1',
    name: raw.name ?? raw.id,
    src: raw.src ?? '',
    bbox: raw.bbox ?? { x: 0, y: 0, width: 80, height: 32 },
    nodeId: raw.nodeId ?? null,
    score: Number.isFinite(raw.score) ? Number(raw.score) : 0,
    origin: raw.origin === 'manual' || raw.origin === 'upload' ? raw.origin : 'auto',
    kind: raw.kind,
    inLibrary: raw.inLibrary === true,
  }
}

export function canSliceNodeForArt(node: GameUiNode) {
  return node.kind !== 'text'
}
