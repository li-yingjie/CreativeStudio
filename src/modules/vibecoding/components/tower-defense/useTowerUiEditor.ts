import { useCallback, useMemo, useRef, useState } from 'react'
import type { TowerDefenseUiConfig } from './TowerDefenseFlowModel'
import {
  artifactStale,
  buildArtifact,
  cropArtifactToDataUrl,
  currentArtifact,
  nextArtifactVersion,
  styleLockFromUi,
} from './GameUiArtifact'
import {
  applyLayoutToUi,
  applyNodeArt,
  backfillSlicesToNodes,
  canSliceNode,
  clearNodeArt,
  cloneDraft,
  recutNodesToVersion,
  restoreNodeArt,
  createAddedNode,
  createGeneratedScreen,
  deleteGeneratedScreen,
  deleteNode as removeDraftNode,
  draftFromUi,
  hotspotsForScreen,
  layersForScreen,
  moveNode,
  patchNode,
  resizeNode,
  setGameUiLink,
  sliceableNodes,
  type GameUiArtifact,
  type GameUiDraft,
  type GameUiGeneratedSpec,
  type GameUiLink,
  type GameUiNode,
  type GameUiNodeKind,
  type GameUiScreenId,
} from './GameUiModel'
import {
  assignSliceToNode,
  createStartV1Slices,
  ensurePresetSlices,
  sliceBoxFromNode,
  createUploadSlice,
  deleteSlices,
  markSlicesInLibrary,
  replaceVersionSlices,
  slicesForVersion,
} from './GameUiSlices'

function sameDraft(a: GameUiDraft, b: GameUiDraft) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useTowerUiEditor(ui: TowerDefenseUiConfig) {
  const [draft, setDraft] = useState<GameUiDraft>(() => draftFromUi(ui))
  const [baseline, setBaseline] = useState<GameUiDraft>(() => draftFromUi(ui))
  const [past, setPast] = useState<GameUiDraft[]>([])
  const [future, setFuture] = useState<GameUiDraft[]>([])
  const [focus, setFocus] = useState<GameUiScreenId>('start')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [slicingId, setSlicingId] = useState<string | null>(null)
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null)
  const [surface, setSurface] = useState<'css' | 'artifact'>('css')
  const [backfillNote, setBackfillNote] = useState<{
    screenId: string
    skipped: number
    kind: 'backfill' | 'recut'
  } | null>(null)

  const draftRef = useRef(draft)
  draftRef.current = draft
  const selected = draft.nodes.find((item) => item.id === selectedId) ?? null
  const layers = useMemo(
    () => layersForScreen(draft.nodes, focus),
    [draft.nodes, focus],
  )
  const hotspots = useMemo(
    () => hotspotsForScreen(draft.nodes, focus),
    [draft.nodes, focus],
  )
  const pending = !sameDraft(draft, baseline)

  const commit = useCallback((next: GameUiDraft) => {
    setPast((current) => [...current.slice(-49), cloneDraft(draftRef.current)])
    setFuture([])
    draftRef.current = next
    setDraft(next)
  }, [])

  const replaceLive = useCallback((next: GameUiDraft) => {
    setDraft(next)
  }, [])

  const select = useCallback((id: string | null, screen?: GameUiScreenId) => {
    if (screen) setFocus(screen)
    setSelectedId(id)
    setSurface('css')
    if (id !== justAddedId) setJustAddedId(null)
  }, [justAddedId])

  const selectArtifact = useCallback((screenId: GameUiScreenId) => {
    setFocus(screenId)
    setSelectedId(null)
    setSurface('artifact')
    setJustAddedId(null)
  }, [])

  const selectFromArtifact = useCallback((id: string, screen?: GameUiScreenId) => {
    if (screen) setFocus(screen)
    setSelectedId(id)
    setSurface('artifact')
    if (id !== justAddedId) setJustAddedId(null)
  }, [justAddedId])

  const commitNodes = (nodes: GameUiNode[]) => {
    commit({ ...draft, nodes })
  }

  return {
    nodes: draft.nodes,
    screens: draft.screens,
    links: draft.links,
    slices: draft.slices,
    selected,
    selectedSliceId,
    selectedId,
    surface,
    backfillNote,
    focus,
    layers,
    hotspots,
    pending,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    setFocus,
    select,
    selectArtifact,
    selectFromArtifact,
    commit,
    replaceLive,
    move: (id: string, x: number, y: number) =>
      commitNodes(moveNode(draft.nodes, id, x, y)),
    resize: (id: string, width: number, height: number) =>
      commitNodes(resizeNode(draft.nodes, id, width, height)),
    patch: (id: string, next: Partial<GameUiNode>) =>
      commitNodes(patchNode(draft.nodes, id, next)),
    setLink: (screenId: string, nodeId: string, patch: Partial<GameUiLink>) =>
      commit({
        ...draft,
        links: setGameUiLink(draft.links, screenId, nodeId, patch),
      }),
    generateScreen: (
      spec: GameUiGeneratedSpec,
      hotspot: { screenId: string; nodeId: string; label: string },
    ) => {
      const created = createGeneratedScreen(spec, hotspot)
      commit({
        ...draft,
        nodes: [...draft.nodes, ...created.nodes],
        screens: [...draft.screens, created.screen],
        links: { ...draft.links, [created.key]: created.link, ...created.backLinks },
      })
      setFocus(created.screen.id)
      setSelectedId(created.nodes[0]?.id ?? null)
      return created.screen
    },
    generateArtifact: (
      screenId: string,
      preset: TowerDefenseUiConfig['visualPreset'],
      lock = styleLockFromUi(ui),
      note?: string,
    ) => {
      const screen = draftRef.current.screens.find((item) => item.id === screenId)
      if (!screen) return
      setGeneratingId(screenId)
      window.setTimeout(() => {
        const current = draftRef.current
        const latest = current.screens.find((item) => item.id === screenId)
        if (!latest) {
          setGeneratingId(null)
          return
        }
        commit({
          ...current,
          screens: current.screens.map((item) =>
            item.id === screenId
              ? {
                  ...item,
                  artifact: buildArtifact(
                    item,
                    current.nodes,
                    preset,
                    lock,
                    nextArtifactVersion(latest.artifact),
                    note,
                  ),
                }
              : item,
          ),
        })
        setSelectedId(null)
        setSurface('artifact')
        setFocus(screenId)
        setGeneratingId(null)
      }, 420)
    },
    setArtifactVersion: (screenId: string, versionId: GameUiArtifact['versionId']) => {
      commit({
        ...draft,
        screens: draft.screens.map((item) =>
          item.id === screenId && item.artifact
            ? { ...item, artifact: { ...item.artifact, versionId } }
            : item,
        ),
      })
      setFocus(screenId)
      setSelectedId(null)
      setSurface('artifact')
    },
    setPrimaryVersion: (screenId: string, versionId: GameUiArtifact['versionId']) => {
      commit({
        ...draft,
        screens: draft.screens.map((item) =>
          item.id === screenId && item.artifact
            ? {
                ...item,
                artifact: { ...item.artifact, versionId, primaryId: versionId },
              }
            : item,
        ),
      })
      setFocus(screenId)
      setSelectedId(null)
      setSurface('artifact')
    },
    artifactStale: (screenId: string, preset: TowerDefenseUiConfig['visualPreset']) =>
      artifactStale(
        draft.screens.find((item) => item.id === screenId),
        draft.nodes,
        preset,
        styleLockFromUi(ui),
      ),
    generatingId,
    justAddedId,
    slicingId,
    selectSlice: setSelectedSliceId,
    addNode: (screenId: string, kind: GameUiNodeKind) => {
      const created = createAddedNode(screenId, kind, draft.nodes)
      commit({ ...draft, nodes: [...draft.nodes, created] })
      setFocus(screenId)
      setSelectedId(created.id)
      setJustAddedId(created.id)
      return created
    },
    deleteNode: (nodeId: string) => {
      commit(removeDraftNode(draft, nodeId))
      if (selectedId === nodeId) setSelectedId(null)
    },
    splitScreen: async (screenId: string) => {
      const current = draftRef.current
      const screen = current.screens.find((item) => item.id === screenId)
      const artifact = currentArtifact(screen)
      if (!screen || !artifact) return
      const existing = slicesForVersion(current.slices, screenId, artifact.id)
      if (existing.length) {
        const nextSlices = ensurePresetSlices(current.slices)
        if (nextSlices !== current.slices) {
          commit({ ...current, slices: nextSlices })
        }
        setSelectedSliceId(
          nextSlices.find((item) => item.id === 'start-v1-bg')?.id ?? existing[0]?.id ?? null,
        )
        setSurface('artifact')
        return
      }
      setSlicingId(screenId)
      try {
        const nextSlices =
          screenId === 'start' && artifact.id === 'v1'
            ? createStartV1Slices()
            : await Promise.all(
                sliceableNodes(current.nodes, screenId).map(async (node) => ({
                  id: `crop:${screenId}:${artifact.id}:${node.id}`,
                  screenId,
                  versionId: artifact.id,
                  name: node.name,
                  src: await cropArtifactToDataUrl(artifact.src, node),
                  bbox: sliceBoxFromNode(node),
                  nodeId: node.id,
                  score: 0.78,
                  origin: 'auto' as const,
                  kind: node.kind,
                  inLibrary: false,
                })),
              )
        commit({
          ...current,
          slices: replaceVersionSlices(current.slices, nextSlices),
        })
        setSelectedSliceId(nextSlices[0]?.id ?? null)
        setSelectedId(null)
        setSurface('artifact')
        setFocus(screenId)
      } finally {
        setSlicingId(null)
      }
    },
    backfillMatched: (screenId: string, overwritePinned = false) => {
      const current = draftRef.current
      const screen = current.screens.find((item) => item.id === screenId)
      const artifact = currentArtifact(screen)
      if (!artifact) return
      const versionSlices = slicesForVersion(current.slices, screenId, artifact.id)
      if (!versionSlices.length) return
      const result = backfillSlicesToNodes(current.nodes, versionSlices, {
        overwritePinned,
        versionId: artifact.id,
      })
      setBackfillNote(
        result.skipped
          ? { screenId, skipped: result.skipped, kind: 'backfill' }
          : null,
      )
      commit({
        ...current,
        nodes: result.nodes,
        screens: current.screens.map((item) =>
          item.id === screenId && item.artifact
            ? { ...item, artifact: { ...item.artifact, collapsed: true } }
            : item,
        ),
      })
    },
    recutFromVersion: (screenId: string, overwritePinned = false) => {
      const current = draftRef.current
      const screen = current.screens.find((item) => item.id === screenId)
      const artifact = currentArtifact(screen)
      if (!artifact) return
      const versionSlices = slicesForVersion(current.slices, screenId, artifact.id)
      if (!versionSlices.length) return
      const result = recutNodesToVersion(
        current.nodes,
        versionSlices,
        screenId,
        artifact.id,
        { overwritePinned },
      )
      setBackfillNote(
        result.skipped ? { screenId, skipped: result.skipped, kind: 'recut' } : null,
      )
      commit({ ...current, nodes: result.nodes })
    },
    applyArtifactCrop: async (nodeId: string, overwritePinned = false) => {
      const current = draftRef.current
      const node = current.nodes.find((item) => item.id === nodeId)
      const screen = current.screens.find((item) => item.id === node?.screen)
      const artifact = currentArtifact(screen)
      if (!node || !artifact || !canSliceNode(node)) return 'missing'
      if (node.artPinned && !overwritePinned) return 'pinned'
      const bound = current.slices.find(
        (item) => item.nodeId === node.id && item.versionId === artifact.id,
      )
      const src = bound?.src ?? (await cropArtifactToDataUrl(artifact.src, node))
      const sliceId = bound?.id ?? `crop:${node.screen}:${artifact.id}:${node.id}`
      const nextSlices = bound
        ? current.slices
        : [
            ...current.slices,
            {
              id: sliceId,
              screenId: node.screen,
              versionId: artifact.id,
              name: node.name,
              src,
              bbox: sliceBoxFromNode(node),
              nodeId: node.id,
              score: 0.99,
              origin: 'manual' as const,
              kind: node.kind,
              inLibrary: false,
            },
          ]
      commit({
        ...current,
        slices: nextSlices,
        nodes: applyNodeArt(current.nodes, node.id, src, {
          artSource: 'slice',
          artSliceId: sliceId,
          artVersionId: artifact.id,
          artPinned: false,
        }),
      })
      return 'applied'
    },
    ingestSlices: (ids?: string[]) => {
      const current = draftRef.current
      const nextSlices = markSlicesInLibrary(current.slices, ids)
      const ingested = ids?.length
        ? nextSlices.filter((item) => ids.includes(item.id))
        : nextSlices.filter((item) => item.inLibrary === true)
      const result = backfillSlicesToNodes(current.nodes, ingested)
      commit({
        ...current,
        slices: nextSlices,
        nodes: result.nodes,
      })
    },
    uploadLibrarySlice: (
      screenId: GameUiScreenId,
      versionId: GameUiArtifact['versionId'],
      name: string,
      src: string,
    ) => {
      commit({
        ...draft,
        slices: [
          ...draft.slices,
          {
            id: `upload:${screenId}:${versionId}:${Date.now().toString(36)}`,
            screenId,
            versionId,
            name,
            src,
            bbox: { x: 0, y: 0, width: 80, height: 80 },
            nodeId: null,
            score: 1,
            origin: 'upload' as const,
            inLibrary: true,
          },
        ],
      })
    },
    bindSlice: (sliceId: string, nodeId: string | null) => {
      commit({ ...draft, slices: assignSliceToNode(draft.slices, sliceId, nodeId) })
    },
    applySliceToNode: (nodeId: string, sliceId: string) => {
      const slice = draft.slices.find((item) => item.id === sliceId)
      const node = draft.nodes.find((item) => item.id === nodeId)
      if (!slice || !node || !canSliceNode(node)) return
      commit({
        ...draft,
        slices: assignSliceToNode(draft.slices, sliceId, nodeId),
        nodes: applyNodeArt(draft.nodes, nodeId, slice.src, {
          artSource: slice.origin === 'upload' ? 'upload' : 'slice',
          artSliceId: slice.id,
          artVersionId: slice.versionId,
          artPinned: slice.origin === 'upload',
        }),
      })
    },
    uploadNodeArt: (nodeId: string, src: string) => {
      const node = draft.nodes.find((item) => item.id === nodeId)
      const screen = draft.screens.find((item) => item.id === node?.screen)
      const artifact = currentArtifact(screen)
      if (!node || !canSliceNode(node)) return
      const slice = createUploadSlice(node.screen, artifact?.id ?? 'v1', node, src)
      commit({
        ...draft,
        slices: assignSliceToNode([...draft.slices, slice], slice.id, node.id),
        nodes: applyNodeArt(draft.nodes, node.id, src, {
          artSource: 'upload',
          artSliceId: slice.id,
          artPinned: true,
        }),
      })
    },
    setNodePinned: (nodeId: string, pinned: boolean) => {
      commit({
        ...draft,
        nodes: draft.nodes.map((item) =>
          item.id === nodeId ? { ...item, artPinned: pinned } : item,
        ),
      })
    },
    replaceSliceSrc: (sliceId: string, src: string) => {
      const slice = draft.slices.find((item) => item.id === sliceId)
      if (!slice) return
      const node = slice.nodeId
        ? draft.nodes.find((item) => item.id === slice.nodeId)
        : undefined
      commit({
        ...draft,
        slices: draft.slices.map((item) =>
          item.id === sliceId ? { ...item, src, origin: 'upload' as const } : item,
        ),
        nodes:
          node && !node.artPinned
            ? applyNodeArt(draft.nodes, node.id, src, {
                artSource: 'upload',
                artSliceId: slice.id,
                artPinned: true,
              })
            : draft.nodes,
      })
    },
    deleteSlice: (sliceId: string) => {
      const slice = draft.slices.find((item) => item.id === sliceId)
      commit({
        ...draft,
        slices: deleteSlices(draft.slices, [sliceId]),
        nodes:
          slice?.nodeId && !draft.nodes.find((item) => item.id === slice.nodeId)?.artPinned
            ? clearNodeArt(draft.nodes, slice.nodeId)
            : draft.nodes,
      })
      if (selectedSliceId === sliceId) setSelectedSliceId(null)
    },
    deleteArtifactVersion: (screenId: string, versionId: GameUiArtifact['versionId']) => {
      const screen = draft.screens.find((item) => item.id === screenId)
      if (!screen?.artifact || screen.artifact.versions.length <= 1) return
      const versions = screen.artifact.versions.filter((item) => item.id !== versionId)
      commit({
        ...draft,
        slices: draft.slices.filter(
          (item) => !(item.screenId === screenId && item.versionId === versionId),
        ),
        screens: draft.screens.map((item) => {
          if (item.id !== screenId || !item.artifact) return item
          return {
            ...item,
            artifact: {
              ...item.artifact,
              versions,
              versionId:
                item.artifact.versionId === versionId
                  ? versions[0].id
                  : item.artifact.versionId,
              primaryId:
                item.artifact.primaryId === versionId
                  ? versions[0].id
                  : item.artifact.primaryId,
            },
          }
        }),
      })
      setSurface('artifact')
      setSelectedId(null)
      setFocus(screenId)
    },
    restoreNode: (nodeId: string) => {
      commit({ ...draft, nodes: restoreNodeArt(draft.nodes, nodeId) })
    },
    setArtifactCollapsed: (screenId: string, collapsed: boolean) => {
      commit({
        ...draft,
        screens: draft.screens.map((item) =>
          item.id === screenId && item.artifact
            ? { ...item, artifact: { ...item.artifact, collapsed } }
            : item,
        ),
      })
    },
    deleteScreen: (screenId: string) => {
      const next = deleteGeneratedScreen(draft, screenId)
      commit(next)
      if (focus === screenId) {
        const from = draft.screens.find((item) => item.id === screenId)?.fromScreenId
        setFocus(from && next.screens.some((item) => item.id === from) ? from : 'start')
        setSelectedId(null)
      }
    },
    undo: () => {
      const previous = past.at(-1)
      if (!previous) return
      setPast((current) => current.slice(0, -1))
      setFuture((ahead) => [cloneDraft(draft), ...ahead])
      setDraft(previous)
    },
    redo: () => {
      const next = future[0]
      if (!next) return
      setFuture((current) => current.slice(1))
      setPast((behind) => [...behind, cloneDraft(draft)])
      setDraft(next)
    },
    discard: () => {
      setDraft(cloneDraft(baseline))
      setSelectedId(null)
      setSurface('css')
    },
    applyTo: (current: TowerDefenseUiConfig) => {
      const source = draftRef.current
      setBaseline(cloneDraft(source))
      return applyLayoutToUi(current, source)
    },
    resetFrom: (nextUi: TowerDefenseUiConfig) => {
      const next = draftFromUi(nextUi)
      setDraft(next)
      setBaseline(cloneDraft(next))
      setPast([])
      setFuture([])
      setSelectedId(null)
      setSurface('css')
      setFocus('start')
    },
  }
}

export type TowerUiEditor = ReturnType<typeof useTowerUiEditor>
