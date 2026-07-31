import { nanoid } from 'nanoid'
import { create } from 'zustand'
import {
  createDefaultH5CanvasDocument,
  duplicateH5CanvasNode,
  h5CanvasNodesEqual,
  removeH5CanvasNode,
  reorderH5CanvasNode,
  updateH5CanvasNode,
  type H5CanvasNode,
} from './H5CanvasModel'

const HISTORY_LIMIT = 50

interface H5CanvasState {
  nodes: H5CanvasNode[]
  selectedNodeId: string | null
  copiedNode: H5CanvasNode | null
  past: H5CanvasNode[][]
  future: H5CanvasNode[][]
  interactionStart: H5CanvasNode[] | null
  selectNode: (id: string | null) => void
  beginInteraction: () => void
  moveNode: (id: string, x: number, y: number) => void
  endInteraction: () => void
  updateNode: (
    id: string,
    patch: Partial<Omit<H5CanvasNode, 'id' | 'kind' | 'parentId'>>,
  ) => void
  duplicateNode: (id: string, interactive?: boolean) => string | null
  copyNode: (id: string) => void
  pasteNode: () => string | null
  removeNode: (id: string) => void
  reorderNode: (id: string, direction: 'forward' | 'backward') => void
  toggleNodeVisible: (id: string) => void
  toggleNodeLocked: (id: string) => void
  undo: () => void
  redo: () => void
  reset: () => void
}

function cloneNodes(nodes: H5CanvasNode[]) {
  return nodes.map((node) => ({ ...node }))
}

function appendHistory(past: H5CanvasNode[][], snapshot: H5CanvasNode[]) {
  return [...past, cloneNodes(snapshot)].slice(-HISTORY_LIMIT)
}

export const useH5CanvasStore = create<H5CanvasState>((set, get) => ({
  nodes: createDefaultH5CanvasDocument().nodes,
  selectedNodeId: null,
  copiedNode: null,
  past: [],
  future: [],
  interactionStart: null,

  selectNode: (id) => set({ selectedNodeId: id }),

  beginInteraction: () => {
    if (get().interactionStart) return
    set({ interactionStart: cloneNodes(get().nodes) })
  },

  moveNode: (id, x, y) => {
    set((state) => ({
      nodes: updateH5CanvasNode(state.nodes, id, { x, y }),
    }))
  },

  endInteraction: () => {
    const { interactionStart, nodes, past } = get()
    if (!interactionStart) return
    if (h5CanvasNodesEqual(interactionStart, nodes)) {
      set({ interactionStart: null })
      return
    }
    set({
      past: appendHistory(past, interactionStart),
      future: [],
      interactionStart: null,
    })
  },

  updateNode: (id, patch) => {
    const { nodes, past } = get()
    const next = updateH5CanvasNode(nodes, id, patch)
    if (h5CanvasNodesEqual(nodes, next)) return
    set({
      nodes: next,
      past: appendHistory(past, nodes),
      future: [],
    })
  },

  duplicateNode: (id, interactive = false) => {
    const { nodes, past } = get()
    const nextId = `${id.split('-')[0]}-${nanoid(6)}`
    const result = duplicateH5CanvasNode(nodes, id, nextId)
    if (!result.duplicate) return null
    set({
      nodes: result.nodes,
      selectedNodeId: nextId,
      past: interactive ? past : appendHistory(past, nodes),
      future: [],
      interactionStart: interactive ? cloneNodes(nodes) : null,
    })
    return nextId
  },

  copyNode: (id) => {
    const node = get().nodes.find((candidate) => candidate.id === id)
    if (node) set({ copiedNode: { ...node } })
  },

  pasteNode: () => {
    const { copiedNode, nodes, past } = get()
    if (!copiedNode) return null
    const temporaryId = '__clipboard-source__'
    const source = { ...copiedNode, id: temporaryId }
    const nextId = `${copiedNode.kind}-${nanoid(6)}`
    const result = duplicateH5CanvasNode([...nodes, source], temporaryId, nextId)
    if (!result.duplicate) return null
    const next = result.nodes.filter((node) => node.id !== temporaryId)
    const normalized = next.map((node, index) => ({ ...node, zIndex: index + 1 }))
    set({
      nodes: normalized,
      selectedNodeId: nextId,
      past: appendHistory(past, nodes),
      future: [],
    })
    return nextId
  },

  removeNode: (id) => {
    const { nodes, past, selectedNodeId } = get()
    if (!nodes.some((node) => node.id === id)) return
    set({
      nodes: removeH5CanvasNode(nodes, id),
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
      past: appendHistory(past, nodes),
      future: [],
    })
  },

  reorderNode: (id, direction) => {
    const { nodes, past } = get()
    const next = reorderH5CanvasNode(nodes, id, direction)
    if (h5CanvasNodesEqual(nodes, next)) return
    set({
      nodes: next,
      past: appendHistory(past, nodes),
      future: [],
    })
  },

  toggleNodeVisible: (id) => {
    const node = get().nodes.find((candidate) => candidate.id === id)
    if (node) get().updateNode(id, { visible: !node.visible })
  },

  toggleNodeLocked: (id) => {
    const node = get().nodes.find((candidate) => candidate.id === id)
    if (node) get().updateNode(id, { locked: !node.locked })
  },

  undo: () => {
    const { past, nodes } = get()
    const previous = past.at(-1)
    if (!previous) return
    const selectedNodeId = get().selectedNodeId
    set({
      nodes: cloneNodes(previous),
      selectedNodeId: previous.some((node) => node.id === selectedNodeId)
        ? selectedNodeId
        : null,
      past: past.slice(0, -1),
      future: [cloneNodes(nodes), ...get().future].slice(0, HISTORY_LIMIT),
      interactionStart: null,
    })
  },

  redo: () => {
    const { future, nodes, past } = get()
    const next = future[0]
    if (!next) return
    const selectedNodeId = get().selectedNodeId
    set({
      nodes: cloneNodes(next),
      selectedNodeId: next.some((node) => node.id === selectedNodeId)
        ? selectedNodeId
        : null,
      past: appendHistory(past, nodes),
      future: future.slice(1),
      interactionStart: null,
    })
  },

  reset: () => {
    const nodes = createDefaultH5CanvasDocument().nodes
    set({
      nodes,
      selectedNodeId: null,
      copiedNode: null,
      past: [],
      future: [],
      interactionStart: null,
    })
  },
}))
