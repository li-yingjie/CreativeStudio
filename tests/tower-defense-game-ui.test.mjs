import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyLayoutToUi,
  applyNodeArt,
  artMark,
  backfillSlicesToNodes,
  canSliceNode,
  createAddedNode,
  createDefaultGameUiDraft,
  createDefaultGameUiLayout,
  createGeneratedScreen,
  deleteNode,
  draftFromUi,
  ensureDefaultLayoutNodes,
  nodeAlignY,
  nodeButtonVariant,
  normalizeGameUiNode,
  hotspotsForScreen,
  isHotspot,
  layersForScreen,
  linkKey,
  moveNode,
  nodesForScreen,
  patchNode,
  resizeNode,
  recutNodesToVersion,
  restoreNodeArt,
  screenArtBackfilled,
  setGameUiLink,
  sliceRect,
} from '../src/modules/vibecoding/components/tower-defense/GameUiModel.ts'
import {
  artifactFamily,
  artifactStale,
  buildArtifact,
  currentArtifact,
} from '../src/modules/vibecoding/components/tower-defense/GameUiArtifact.ts'
import { suggestGameUiScreens } from '../src/modules/vibecoding/components/tower-defense/GameUiSuggestions.ts'
import {
  assignSliceToNode,
  buildCatalogUiSliceAsset,
  catalogUiSliceAssetId,
  createStartV1Slices,
  ensurePresetSlices,
  figToCanvas,
  groupLibrarySlices,
  isCatalogUiSliceAssetId,
  librarySlices,
  markSlicesInLibrary,
  nodeSkipsBackfill,
  sliceMatchCount,
} from '../src/modules/vibecoding/components/tower-defense/GameUiSlices.ts'
import {
  catalogUiSlotAssetId,
  groupUiSlotsByScreen,
  isCatalogUiSlotAssetId,
  nodeSlotCurrentSrc,
} from '../src/modules/vibecoding/components/tower-defense/GameUiSlots.ts'

test('default layout covers five game screens', () => {
  const nodes = createDefaultGameUiLayout()
  const screens = new Set(nodes.map((node) => node.screen))
  assert.deepEqual([...screens].sort(), ['battle', 'lose', 'pause', 'start', 'win'])
  assert.ok(nodesForScreen(nodes, 'start').some((node) => node.id === 'start-play'))
  assert.ok(layersForScreen(nodes, 'battle')[0].z >= layersForScreen(nodes, 'battle').at(-1).z)
})

test('default draft wires start-play to battle and marks hotspots', () => {
  const draft = createDefaultGameUiDraft()
  assert.equal(draft.links[linkKey('start', 'start-play')].targetId, 'battle')
  assert.equal(draft.links[linkKey('pause', 'pause-continue')].targetId, 'battle')
  assert.ok(isHotspot(draft.nodes.find((node) => node.id === 'start-rank')))
  assert.ok(hotspotsForScreen(draft.nodes, 'start').some((node) => node.id === 'start-play'))
  assert.equal(draft.nodes.find((node) => node.id === 'start-mail').iconName, '音乐')
  assert.equal(draft.nodes.find((node) => node.id === 'start-logo').kind, 'image')
  assert.equal(draft.nodes.find((node) => node.id === 'start-play').render, 'code')
  assert.equal(draft.slices.length, 0)
})

test('move and resize skip locked nodes and keep integer geometry', () => {
  const nodes = createDefaultGameUiLayout()
  const moved = moveNode(nodes, 'start-play', 80.4, 512.8)
  const play = moved.find((node) => node.id === 'start-play')
  assert.equal(play.x, 80)
  assert.equal(play.y, 513)
  const resized = resizeNode(moved, 'start-play', 12, 8)
  assert.equal(resized.find((node) => node.id === 'start-play').width, 24)
  assert.equal(resized.find((node) => node.id === 'start-play').height, 18)
})

test('apply layout writes battle HUD boxes and persists screens/links', () => {
  const draft = createDefaultGameUiDraft()
  draft.nodes = patchNode(draft.nodes, 'battle-hud', {
    x: 10,
    visible: false,
  })
  const ui = applyLayoutToUi(
    {
      visualPreset: 'night-watch',
      selectedComponentId: 'battle-hud',
      compactMode: false,
      cornerRadius: 14,
      components: [
        {
          id: 'battle-hud',
          name: '战斗 HUD',
          description: '',
          visible: true,
          emphasis: 'standard',
          scale: 100,
        },
      ],
    },
    draft,
  )
  assert.equal(ui.components[0].visible, false)
  assert.equal(ui.components[0].x, 10)
  assert.equal(ui.layout?.length, draft.nodes.length)
  assert.equal(ui.screens?.length, 5)
  assert.equal(ui.links[linkKey('start', 'start-play')].targetId, 'battle')
})

test('suggest rank and start actions like the activity interaction dictionary', () => {
  const rank = suggestGameUiScreens('排行榜')
  assert.equal(rank.shouldGenerate, true)
  assert.ok(rank.suggestions.some((item) => item.id === 'rank-list'))
  const play = suggestGameUiScreens('开始游戏')
  assert.equal(play.shouldGenerate, false)
  assert.equal(play.preferExistingId, 'battle')
  const back = suggestGameUiScreens('返回')
  assert.equal(back.shouldGenerate, false)
})

test('generated rank screen adds nodes and a back link', () => {
  const created = createGeneratedScreen(
    {
      id: 'rank-list',
      kind: 'list',
      label: '排行榜',
      note: '本周守卫名次',
      title: '本周守卫榜',
      body: '按评分排名',
      primaryAction: '返回开始页',
      rows: ['01  月隐守夜人  986'],
    },
    { screenId: 'start', nodeId: 'start-rank', label: '排行榜' },
  )
  assert.equal(created.link.targetId, created.screen.id)
  assert.equal(created.screen.generated, true)
  assert.ok(created.nodes.some((node) => node.id === `${created.screen.id}-primary`))
  assert.equal(
    created.backLinks[linkKey(created.screen.id, `${created.screen.id}-primary`)].targetId,
    'start',
  )
  const linked = setGameUiLink({}, 'start', 'start-rank', { targetId: created.screen.id })
  assert.equal(linked[linkKey('start', 'start-rank')].targetId, created.screen.id)
})

test('draftFromUi fills semantic defaults for older layouts', () => {
  const draft = draftFromUi({
    visualPreset: 'night-watch',
    selectedComponentId: 'battle-hud',
    compactMode: false,
    cornerRadius: 14,
    components: [],
    layout: [
      {
        id: 'start-play',
        screen: 'start',
        name: '开始游戏',
        kind: 'button',
        x: 10,
        y: 20,
        width: 100,
        height: 40,
        z: 1,
        visible: true,
        locked: false,
        text: '开始游戏',
      },
    ],
  })
  const play = draft.nodes.find((item) => item.id === 'start-play')
  assert.equal(play.render, 'code')
  assert.equal(play.hasText, true)
  assert.equal(play.textPlacement, 'center')
  assert.ok(draft.nodes.some((item) => item.id === 'start-bg'))
  assert.ok(draft.screens.length >= 5)
  assert.equal(draft.links[linkKey('start', 'start-play')].targetId, 'battle')
})

test('artifact hash flips stale after annotation change', () => {
  const draft = createDefaultGameUiDraft()
  const lock = { keywords: ['暗夜'], refs: [] }
  const artifact = buildArtifact(draft.screens[0], draft.nodes, 'night-watch', lock, 'v1')
  const screen = { ...draft.screens[0], artifact }
  assert.equal(artifact.versions.length, 1)
  assert.equal(artifact.src || artifact.versions[0].src, '/tower-defense/ui-art/start/page-v1.jpg')
  assert.equal(currentArtifact(screen)?.src, '/tower-defense/ui-art/start/page-v1.jpg')
  assert.equal(artifactStale(screen, draft.nodes, 'night-watch', lock), false)
  const withNote = buildArtifact(screen, draft.nodes, 'night-watch', lock, 'v2', '按钮再大一点')
  assert.equal(withNote.versions.length, 2)
  assert.equal(withNote.versions.find((item) => item.id === 'v2')?.note, '按钮再大一点')
  assert.equal(withNote.versions.find((item) => item.id === 'v1')?.src, artifact.versions[0].src)
  const moved = draft.nodes.map((node) =>
    node.id === 'start-play' ? { ...node, y: node.y + 12 } : node,
  )
  assert.equal(artifactStale(screen, moved, 'night-watch', lock), true)
  assert.equal(artifactFamily('win'), 'result')
})

test('added node lands centered and text stays unsliced', () => {
  const draft = createDefaultGameUiDraft()
  const button = createAddedNode('start', 'button', draft.nodes)
  assert.equal(button.kind, 'button')
  assert.equal(button.x, 95)
  assert.equal(button.text, '新按钮')
  assert.equal(canSliceNode(button), true)
  assert.equal(canSliceNode(draft.nodes.find((node) => node.id === 'start-title')), false)
  const box = sliceRect({ ...button, x: -8, width: 800 })
  assert.equal(box.x, 0)
  assert.equal(box.width, 390)
})

test('backfill marks sliceable nodes as art and completes a screen', () => {
  const draft = createDefaultGameUiDraft()
  const start = draft.nodes.filter((node) => node.screen === 'start')
  const next = start.reduce(
    (nodes, node) => (canSliceNode(node) ? applyNodeArt(nodes, node.id, 'data:image/png;art') : nodes),
    draft.nodes,
  )
  assert.equal(next.find((node) => node.id === 'start-play').render, 'art')
  assert.equal(next.find((node) => node.id === 'start-play').artSource, 'slice')
  assert.equal(next.find((node) => node.id === 'start-title').render, 'code')
  assert.equal(screenArtBackfilled(next, 'start'), true)
})

test('old drafts gain the start-page background slot and slice', () => {
  const nodes = createDefaultGameUiLayout().filter((item) => item.id !== 'start-bg')
  const next = ensureDefaultLayoutNodes(nodes)
  assert.equal(nodes.some((item) => item.id === 'start-bg'), false)
  assert.equal(next.some((item) => item.id === 'start-bg'), true)
  const slices = createStartV1Slices().filter((item) => item.id !== 'start-v1-bg')
  const ingested = markSlicesInLibrary(slices)
  const filled = ensurePresetSlices(ingested)
  assert.equal(filled.find((item) => item.id === 'start-v1-bg').inLibrary, false)
  assert.equal(filled.find((item) => item.id === 'start-v1-bg').nodeId, 'start-bg')
})

test('new project draft keeps planned slots empty until the user splits UI', () => {
  const draft = draftFromUi({
    visualPreset: 'night-watch',
    selectedComponentId: 'battle-hud',
    compactMode: false,
    cornerRadius: 14,
    components: [],
  })
  assert.equal(draft.slices.length, 0)
  assert.equal(
    draft.nodes.every((item) => item.render !== 'art' && !item.artSlot),
    true,
  )
  assert.ok(draft.nodes.some((item) => item.id === 'start-bg'))
  assert.equal(draft.nodes.find((item) => item.id === 'start-bg').render, 'code')
})

test('start v1 slices bind Figma layers to start-page slots', () => {
  const slices = createStartV1Slices()
  const count = sliceMatchCount(slices)
  assert.equal(slices.length, 6)
  assert.equal(count.matched, 6)
  assert.equal(count.pending, 0)
  assert.equal(slices.find((item) => item.id === 'start-v1-play').nodeId, 'start-play')
  assert.equal(slices.find((item) => item.id === 'start-v1-bg').nodeId, 'start-bg')
  assert.equal(slices.find((item) => item.id === 'start-v1-logo').src.endsWith('/logo.png'), true)
  assert.equal(slices.every((item) => item.inLibrary !== true), true)
  assert.equal(librarySlices(slices).length, 0)
  const ingested = markSlicesInLibrary(slices)
  assert.equal(librarySlices(ingested).length, 6)
  assert.equal(groupLibrarySlices(ingested).length, 1)
  assert.equal(groupLibrarySlices(ingested)[0].key, 'start:v1')
  const catalog = buildCatalogUiSliceAsset(groupLibrarySlices(ingested)[0])
  assert.equal(catalog.id, catalogUiSliceAssetId('start', 'v1'))
  assert.equal(catalog.name, '开始页 UI')
  assert.equal(catalog.visualVersions.length, 6)
  assert.equal(isCatalogUiSliceAssetId(catalog.id), true)
  const box = figToCanvas(211, 1254, 327, 150)
  assert.equal(box.x, 110)
  assert.equal(box.y, 651)
  assert.equal(box.width, 170)
  const music = figToCanvas(664, 40, 60, 60)
  assert.equal(music.x, 345)
  assert.equal(music.y, 21)
})

test('manual rebind and upload pin skip automatic backfill', () => {
  const rebound = assignSliceToNode(createStartV1Slices(), 'start-v1-rank', 'start-play')
  assert.equal(rebound.find((item) => item.id === 'start-v1-rank').nodeId, 'start-play')
  assert.equal(rebound.find((item) => item.id === 'start-v1-play').nodeId, null)
  const pinned = applyNodeArt(createDefaultGameUiLayout(), 'start-play', '/local.png', {
    artSource: 'upload',
    artPinned: true,
  })
  assert.equal(nodeSkipsBackfill(pinned.find((node) => node.id === 'start-play')), true)
})

test('restore upload returns to the previous slice instead of bare CSS', () => {
  const sliced = applyNodeArt(createDefaultGameUiLayout(), 'start-play', '/slice.png', {
    artSource: 'slice',
    artSliceId: 'start-v1-play',
    artVersionId: 'v1',
  })
  const uploaded = applyNodeArt(sliced, 'start-play', '/local.png', {
    artSource: 'upload',
    artPinned: true,
  })
  assert.equal(artMark(uploaded.find((node) => node.id === 'start-play')), '图·传')
  const restored = restoreNodeArt(uploaded, 'start-play')
  const play = restored.find((node) => node.id === 'start-play')
  assert.equal(play.artSource, 'slice')
  assert.equal(play.artSlot, '/slice.png')
  assert.equal(play.artVersionId, 'v1')
  assert.equal(artMark(play), '图·切')
})

test('backfill skips pinned uploads and overwrite can cover them', () => {
  const slices = createStartV1Slices()
  const pinned = applyNodeArt(createDefaultGameUiLayout(), 'start-play', '/local.png', {
    artSource: 'upload',
    artPinned: true,
  })
  const skipped = backfillSlicesToNodes(pinned, slices, { versionId: 'v1' })
  assert.ok(skipped.skipped >= 1)
  assert.equal(skipped.nodes.find((node) => node.id === 'start-play').artSlot, '/local.png')
  const overwritten = backfillSlicesToNodes(pinned, slices, {
    versionId: 'v1',
    overwritePinned: true,
  })
  const play = overwritten.nodes.find((node) => node.id === 'start-play')
  assert.equal(play.artSource, 'slice')
  assert.equal(play.artVersionId, 'v1')
  assert.equal(play.artPinned, false)
  const stale = overwritten.nodes.map((node) =>
    node.id === 'start-rank'
      ? { ...node, render: 'art', artSource: 'slice', artVersionId: 'v1', artSlot: '/old.png' }
      : node,
  )
  const recut = recutNodesToVersion(stale, slices, 'start', 'v2')
  assert.ok(recut.recut >= 1)
  assert.equal(recut.nodes.find((node) => node.id === 'start-rank').artVersionId, 'v2')
})

test('button inspector defaults titled copy and can delete a node', () => {
  const play = createDefaultGameUiLayout().find((node) => node.id === 'start-play')
  assert.equal(nodeButtonVariant(play), 'titled')
  assert.equal(nodeAlignY(play), 'middle')
  const titled = normalizeGameUiNode({
    id: 'btn',
    kind: 'button',
    text: '开始游戏',
    hasText: true,
    textPlacement: 'bottom',
  })
  assert.equal(titled.buttonVariant, 'titled')
  assert.equal(titled.alignY, 'bottom')
  const draft = createDefaultGameUiDraft()
  const next = deleteNode(draft, 'start-play')
  assert.equal(next.nodes.some((node) => node.id === 'start-play'), false)
  assert.equal(next.links[linkKey('start', 'start-play')], undefined)
})

test('library slots follow CSS nodes and stay empty while still code', () => {
  const draft = createDefaultGameUiDraft()
  const groups = groupUiSlotsByScreen(draft.nodes, draft.screens)
  assert.deepEqual(groups.map((group) => group.title), ['UI-开始页', 'UI-对局态', 'UI-暂停态', 'UI-胜利结算', 'UI-失败结算'])
  assert.deepEqual(groups.map((group) => group.items.length), [7, 4, 4, 1, 1])
  assert.equal(groups.every((group) => group.items.every((item) => !item.filled)), true)
  const play = groups[0].items.find((item) => item.nodeId === 'start-play')
  assert.equal(play.asset.name, '开始游戏')
  assert.equal(play.asset.visualVersions.length, 0)
  assert.equal(isCatalogUiSlotAssetId(play.asset.id), true)
  assert.equal(play.asset.id, catalogUiSlotAssetId('start-play'))
  assert.equal(groups[0].items.some((item) => item.nodeId === 'start-title'), false)

  const painted = applyNodeArt(draft.nodes, 'start-play', '/tower-defense/ui-art/start/play.png')
  assert.equal(nodeSlotCurrentSrc(painted.find((node) => node.id === 'start-play')), '/tower-defense/ui-art/start/play.png')
  const filled = groupUiSlotsByScreen(painted, draft.screens)[0].items.find((item) => item.nodeId === 'start-play')
  assert.equal(filled.filled, true)
  assert.equal(filled.asset.visualVersions[0].src, '/tower-defense/ui-art/start/play.png')

  const added = createAddedNode('start', 'icon', painted)
  const afterAdd = groupUiSlotsByScreen([...painted, added], draft.screens)
  assert.equal(afterAdd[0].items.length, 8)
  assert.equal(afterAdd[0].items.some((item) => item.nodeId === added.id && !item.filled), true)
})

test('ingesting start slices fills bound library slots', () => {
  const draft = createDefaultGameUiDraft()
  const slices = markSlicesInLibrary(createStartV1Slices())
  const filled = backfillSlicesToNodes(draft.nodes, slices)
  assert.ok(filled.applied >= 6)
  const play = filled.nodes.find((node) => node.id === 'start-play')
  const bg = filled.nodes.find((node) => node.id === 'start-bg')
  assert.equal(play.render, 'art')
  assert.equal(play.artSlot.endsWith('/play.png'), true)
  assert.equal(bg.render, 'art')
  assert.equal(bg.artSlot.endsWith('/bg.jpg'), true)
  const slots = groupUiSlotsByScreen(filled.nodes, draft.screens)[0]
  assert.equal(slots.items.find((item) => item.nodeId === 'start-play').filled, true)
  assert.equal(slots.items.find((item) => item.nodeId === 'start-bg').filled, true)
  assert.equal(slots.items.find((item) => item.nodeId === 'start-load').filled, false)
})
