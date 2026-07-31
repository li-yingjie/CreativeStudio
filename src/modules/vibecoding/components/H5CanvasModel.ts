export const H5_CANVAS_WIDTH = 375
export const H5_CANVAS_HEIGHT = 1551

export type H5CanvasLayerKind =
  | 'hero'
  | 'countdown'
  | 'intro'
  | 'lottery'
  | 'rules'

export interface H5CanvasNode {
  id: string
  kind: H5CanvasLayerKind
  name: string
  parentId: 'page-1'
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  visible: boolean
  locked: boolean
}

export interface H5CanvasDocument {
  page: {
    id: 'page-1'
    name: string
    width: number
    height: number
  }
  nodes: H5CanvasNode[]
}

const DEFAULT_NODES: H5CanvasNode[] = [
  {
    id: 'hero-1',
    kind: 'hero',
    name: '头图',
    parentId: 'page-1',
    x: 0,
    y: 0,
    width: 375,
    height: 300,
    zIndex: 1,
    visible: true,
    locked: false,
  },
  {
    id: 'lottery-1',
    kind: 'lottery',
    name: '开年高燃',
    parentId: 'page-1',
    x: 0,
    y: 566,
    width: 375,
    height: 985,
    zIndex: 2,
    visible: true,
    locked: false,
  },
  {
    id: 'countdown-1',
    kind: 'countdown',
    name: '游戏会场',
    parentId: 'page-1',
    x: 8,
    y: 223,
    width: 367,
    height: 91,
    zIndex: 3,
    visible: true,
    locked: false,
  },
  {
    id: 'intro-1',
    kind: 'intro',
    name: '主会场视频',
    parentId: 'page-1',
    x: 12,
    y: 319,
    width: 352,
    height: 270,
    zIndex: 4,
    visible: true,
    locked: false,
  },
  {
    id: 'rules-1',
    kind: 'rules',
    name: '页面尾部',
    parentId: 'page-1',
    x: 16,
    y: 1489,
    width: 343,
    height: 40,
    zIndex: 5,
    visible: true,
    locked: false,
  },
]

export function createDefaultH5CanvasDocument(): H5CanvasDocument {
  return {
    page: {
      id: 'page-1',
      name: '活动首页',
      width: H5_CANVAS_WIDTH,
      height: H5_CANVAS_HEIGHT,
    },
    nodes: DEFAULT_NODES.map((node) => ({ ...node })),
  }
}

export function screenDeltaToCanvas(delta: number, zoom: number) {
  if (!Number.isFinite(zoom) || zoom <= 0) return 0
  return delta / zoom
}

export function normalizeH5CanvasZ(nodes: H5CanvasNode[]) {
  return nodes.map((node, index) => ({ ...node, zIndex: index + 1 }))
}

export function updateH5CanvasNode(
  nodes: H5CanvasNode[],
  id: string,
  patch: Partial<Omit<H5CanvasNode, 'id' | 'kind' | 'parentId'>>,
) {
  return nodes.map((node) => (node.id === id ? { ...node, ...patch } : node))
}

export function duplicateH5CanvasNode(
  nodes: H5CanvasNode[],
  id: string,
  nextId: string,
  offset = 16,
) {
  const sourceIndex = nodes.findIndex((node) => node.id === id)
  if (sourceIndex < 0) return { nodes, duplicate: null }

  const source = nodes[sourceIndex]
  const siblingsWithName = nodes.filter((node) => node.kind === source.kind).length
  const duplicate: H5CanvasNode = {
    ...source,
    id: nextId,
    name: `${source.name} 副本 ${siblingsWithName}`,
    x: source.x + offset,
    y: source.y + offset,
    locked: false,
  }
  const next = [...nodes]
  next.splice(sourceIndex + 1, 0, duplicate)
  const normalized = normalizeH5CanvasZ(next)

  return {
    nodes: normalized,
    duplicate: normalized.find((node) => node.id === nextId) ?? null,
  }
}

export function reorderH5CanvasNode(
  nodes: H5CanvasNode[],
  id: string,
  direction: 'forward' | 'backward',
) {
  const index = nodes.findIndex((node) => node.id === id)
  if (index < 0) return nodes
  const nextIndex = direction === 'forward' ? index + 1 : index - 1
  if (nextIndex < 0 || nextIndex >= nodes.length) return nodes

  const next = [...nodes]
  ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
  return normalizeH5CanvasZ(next)
}

export function removeH5CanvasNode(nodes: H5CanvasNode[], id: string) {
  return normalizeH5CanvasZ(nodes.filter((node) => node.id !== id))
}

export function h5CanvasNodesEqual(a: H5CanvasNode[], b: H5CanvasNode[]) {
  if (a.length !== b.length) return false
  return a.every((node, index) => {
    const other = b[index]
    return (
      node.id === other.id &&
      node.x === other.x &&
      node.y === other.y &&
      node.width === other.width &&
      node.height === other.height &&
      node.zIndex === other.zIndex &&
      node.visible === other.visible &&
      node.locked === other.locked &&
      node.name === other.name
    )
  })
}
