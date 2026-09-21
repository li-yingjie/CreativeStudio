import assert from 'node:assert/strict'
import test from 'node:test'

import {
  followSelectionToolbarBox,
  canvasPanFromPointer,
  canvasTileId,
  canvasWorldPoint,
  canvasZoomFromWheel,
  canvasZoomTowardPoint,
  catalogShowsSpareBin,
  clampCanvasZoom,
  isCanvasSpacePanTarget,
  expandMaxWidth,
  expandedGroupSize,
  groupShowsExpandControl,
  groupShowsStack,
  isCanvasSpareKey,
  layoutCanvasSlot,
  nextCoverRecordId,
  layoutFromPositions,
  objectTileBox,
  clampTileScale,
  packShelfColumns,
  scaleObjectTileBox,
  tileScaleFromCornerDrag,
  wrapObjectTileIndexes,
  wrapObjectTilesByGuide,
  placeExpandedGroup,
  placeShelfKey,
  positionsFromRects,
  pushAsideForExpand,
  quantizeAssetAspect,
  rectsOverlap,
  SHELF,
  tidyBoardPositions,
  shelfColumnCount,
  shelfGroupSize,
  shelfInsertIndex,
  wrapObjectRowWidths,
} from '../src/modules/vibecoding/components/tower-defense/TowerDefenseCanvasModel.ts'

const GRID = { originX: 24, originY: 80, gapX: 24, gapY: 40, rightPad: 24, cellWidth: 176 }

test('groups only show a stack and expand control when more than one tile remains', () => {
  assert.equal(groupShowsStack(1), false)
  assert.equal(groupShowsExpandControl(1), false)
  assert.equal(groupShowsStack(2), true)
  assert.equal(groupShowsExpandControl(4), true)
})

test('deleting the cover promotes the first remaining in-group tile', () => {
  assert.equal(nextCoverRecordId(['a', 'b', 'c'], 'a', 'a'), 'b')
  assert.equal(nextCoverRecordId(['a', 'b', 'c'], 'b', 'a'), 'b')
  assert.equal(nextCoverRecordId(['a'], 'a', 'a'), undefined)
})

test('slot-scoped tile ids keep group membership isolated', () => {
  assert.equal(canvasTileId('hero-lvbu:base', 'visual-0'), 'hero-lvbu:base::visual-0')
})

test('canvas slot layout keeps groups on a regular board grid', () => {
  assert.deepEqual(layoutCanvasSlot(0), { x: 28, y: 80 })
  assert.deepEqual(layoutCanvasSlot(4), { x: 28, y: 336 })
})

test('collapsed groups sit on a stable column grid', () => {
  const packed = packShelfColumns([
    { key: 'a', width: 176, height: 214 },
    { key: 'b', width: 176, height: 214 },
    { key: 'c', width: 176, height: 214 },
  ], 448, GRID)
  assert.equal(shelfColumnCount(448, GRID), 2)
  assert.equal(packed.a.col, 0)
  assert.equal(packed.b.col, 1)
  assert.equal(packed.c.col, 0)
  assert.equal(packed.a.x, 24)
  assert.equal(packed.b.x, 224)
  assert.equal(packed.a.y, packed.b.y)
  assert.equal(packed.c.x, packed.a.x)
  assert.ok(packed.c.y > packed.a.y)
})

test('expanding a group keeps the same-row neighbor and shifts the whole next row down', () => {
  const collapsed = { width: 176, height: 214 }
  const items = (aHeight) => [
    { key: 'a', width: 176, height: aHeight },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
    { key: 'd', ...collapsed },
  ]
  const before = packShelfColumns(items(214), 600, GRID)
  const after = packShelfColumns(items(520), 600, GRID)
  assert.equal(before.a.y, before.b.y)
  assert.equal(before.c.y, before.d.y)
  assert.equal(after.a.col, before.a.col)
  assert.equal(after.b.col, before.b.col)
  assert.equal(after.c.col, before.c.col)
  assert.equal(after.d.col, before.d.col)
  assert.equal(after.b.x, before.b.x)
  assert.equal(after.b.y, before.b.y)
  assert.equal(after.c.x, before.c.x)
  assert.equal(after.d.x, before.d.x)
  assert.equal(after.c.y, after.d.y)
  assert.ok(after.c.y > before.c.y)
  assert.equal(after.d.y - before.d.y, after.c.y - before.c.y)
  assert.ok(after.c.y >= after.a.y + after.a.height)
})

test('collapsing closes the vacated column space and later items slide back up', () => {
  const collapsed = { width: 176, height: 214 }
  const expanded = packShelfColumns([
    { key: 'a', width: 176, height: 520 },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
  ], 600, GRID)
  const collapsedAgain = packShelfColumns([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
  ], 600, GRID)
  assert.ok(expanded.c.y > expanded.a.y)
  assert.equal(collapsedAgain.a.y, collapsedAgain.b.y)
  assert.equal(collapsedAgain.b.x, 224)
  assert.equal(collapsedAgain.c.x, collapsedAgain.a.x)
  assert.ok(collapsedAgain.c.y < expanded.c.y)
})

test('expanded tiles keep cover size and wrap inside a narrow column', () => {
  const size = expandedGroupSize(4, SHELF.collapsedWidth)
  assert.equal(size.tile, SHELF.collapsedWidth)
  assert.equal(size.cols, 1)
  assert.ok(size.rows >= 4)
  assert.ok(size.width >= SHELF.collapsedWidth)
  assert.ok(size.height > SHELF.collapsedHeight)
  assert.equal(size.scrollable, false)
  const collapsed = shelfGroupSize({ expanded: false, tileCount: 4 })
  assert.equal(collapsed.width, SHELF.collapsedWidth)
})

test('expanded tiles wrap at cover size without capping or inner scroll', () => {
  const two = expandedGroupSize(2, SHELF.collapsedWidth)
  const many = expandedGroupSize(8, SHELF.collapsedWidth)
  assert.equal(two.tile, SHELF.collapsedWidth)
  assert.equal(many.tile, SHELF.collapsedWidth)
  assert.equal(two.scrollable, false)
  assert.equal(many.scrollable, false)
  assert.equal(many.visibleRows, many.rows)
  assert.ok(many.height > two.height)
})

test('wide expand wraps full-size tiles across multiple rows', () => {
  const size = expandedGroupSize(5, 400)
  assert.equal(size.tile, SHELF.collapsedWidth)
  assert.ok(size.cols >= 2)
  assert.ok(size.rows >= 2)
  assert.equal(size.scrollable, false)
  assert.ok(size.width >= size.cols * SHELF.collapsedWidth)
})

test('shelf width lets expanded tiles wrap horizontally at cover size', () => {
  const maxWidth = expandMaxWidth(400, 0)
  const size = expandedGroupSize(4, maxWidth)
  assert.ok(maxWidth >= SHELF.collapsedWidth * 2)
  assert.equal(size.tile, SHELF.collapsedWidth)
  assert.ok(size.cols >= 2)
  assert.equal(size.scrollable, false)
})

test('object tiles snap to five aspect buckets', () => {
  assert.equal(quantizeAssetAspect(), 1)
  assert.equal(quantizeAssetAspect(100, 100), 1)
  assert.equal(quantizeAssetAspect(16, 9), 16 / 9)
  assert.equal(quantizeAssetAspect(1920, 1080), 16 / 9)
  assert.equal(quantizeAssetAspect(9, 16), 9 / 16)
  assert.equal(quantizeAssetAspect(4, 3), 4 / 3)
  assert.equal(quantizeAssetAspect(3, 4), 3 / 4)
  assert.equal(quantizeAssetAspect(17, 10), 16 / 9)
  assert.equal(objectTileBox(16, 9).height, SHELF.tile)
  assert.ok(objectTileBox(16, 9).width > SHELF.tile)
  assert.ok(objectTileBox(9, 16).width < SHELF.tile)
})

test('expanded groups wrap mixed object tiles on a locked row height', () => {
  const landscape = objectTileBox(16, 9).width
  const portrait = objectTileBox(9, 16).width
  const square = objectTileBox(1, 1).width
  const rows = wrapObjectRowWidths([landscape, portrait, square, landscape], 800)
  assert.ok(rows[0].length >= 2)
  assert.equal(rows.flat().length, 4)
  const size = expandedGroupSize([landscape, portrait, square, landscape], 800)
  assert.equal(size.tile, SHELF.tile)
  assert.ok(size.cols >= 2)
  assert.ok(size.width > SHELF.collapsedWidth)
  assert.ok(size.width >= landscape + SHELF.tileGap + portrait)
  const narrow = expandedGroupSize([landscape, landscape], SHELF.collapsedWidth)
  assert.equal(narrow.cols, 1)
  assert.ok(narrow.rows >= 2)
})

test('corner drag scales a tile proportionally and custom sizes lift the wrap row', () => {
  assert.equal(clampTileScale(0.1), 0.5)
  assert.equal(clampTileScale(9), 4)
  const base = objectTileBox(16, 9)
  const scaled = scaleObjectTileBox(16, 9, 2)
  assert.equal(scaled.height, base.height * 2)
  assert.equal(scaled.width, base.width * 2)
  assert.equal(
    tileScaleFromCornerDrag(1, base, 'se', { width: base.width, height: base.height }),
    2,
  )
  const size = expandedGroupSize([
    { width: base.width, height: base.height },
    { width: scaled.width, height: scaled.height },
  ], 800)
  assert.ok(size.padHeight >= scaled.height)
  assert.ok(size.height > SHELF.grip + SHELF.tile)
})

test('scaling tiles keeps the default row breaks and only grows the group', () => {
  const base = objectTileBox(16, 9)
  const guides = [base.width, base.width, base.width, base.width]
  const defaultRows = wrapObjectTileIndexes(guides, 800)
  const scaled = scaleObjectTileBox(16, 9, 2)
  const scaledRows = wrapObjectTilesByGuide(
    [scaled, scaled, scaled, scaled],
    guides,
    800,
  )
  assert.deepEqual(scaledRows.map((row) => row.length), defaultRows.map((row) => row.length))
  assert.ok(scaledRows.some((row) => row.length >= 2))
  assert.ok(scaledRows[0][0].width > base.width)
  const grown = expandedGroupSize([scaled, scaled, scaled, scaled], 800, guides)
  const def = expandedGroupSize([base, base, base, base], 800, guides)
  assert.equal(grown.rows, def.rows)
  assert.ok(grown.width > def.width)
})

test('groups after a wide expand start on a new left-aligned row', () => {
  const collapsed = { width: 176, height: 214 }
  const packed = packShelfColumns([
    { key: 'a', width: 360, height: 520 },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
    { key: 'd', ...collapsed },
  ], 600, GRID)
  assert.equal(packed.a.x, GRID.originX)
  assert.equal(packed.b.x, GRID.originX)
  assert.equal(packed.b.col, 0)
  assert.ok(packed.b.y >= packed.a.y + packed.a.height)
  assert.equal(packed.c.y, packed.b.y)
  assert.ok(packed.c.x > packed.b.x)
  assert.equal(packed.d.x, GRID.originX)
  assert.ok(packed.d.y > packed.b.y)
})

test('expanding a later group leaves earlier cards and left-aligns the rest', () => {
  const collapsed = { width: 176, height: 214 }
  const packed = packShelfColumns([
    { key: 'style', ...collapsed },
    { key: 'map', width: 360, height: 400 },
    { key: 'hero', ...collapsed },
    { key: 'enemy', ...collapsed },
  ], 600, GRID)
  assert.equal(packed.style.x, GRID.originX)
  assert.equal(packed.map.x, GRID.originX)
  assert.ok(packed.map.y > packed.style.y)
  assert.equal(packed.hero.x, GRID.originX)
  assert.ok(packed.hero.y >= packed.map.y + packed.map.height)
  assert.equal(packed.enemy.y, packed.hero.y)
  assert.ok(packed.enemy.x > packed.hero.x)
})

test('two expanded groups both stay open and stack their extra height downward', () => {
  const collapsed = { width: 176, height: 214 }
  const after = packShelfColumns([
    { key: 'a', width: 176, height: 520 },
    { key: 'b', ...collapsed },
    { key: 'c', width: 176, height: 400 },
    { key: 'd', ...collapsed },
    { key: 'e', ...collapsed },
    { key: 'f', ...collapsed },
  ], 600, GRID)
  assert.equal(after.b.y, after.a.y)
  assert.equal(after.d.y, after.c.y)
  assert.equal(after.f.y, after.e.y)
  assert.ok(after.c.y >= after.a.y + after.a.height)
  assert.ok(after.e.y >= after.c.y + after.c.height)
  assert.equal(after.c.y, after.a.y + 520 + GRID.gapY)
  assert.equal(after.e.y, after.c.y + 400 + GRID.gapY)
})

test('packer height includes the title block so collapsed cards do not overlap', () => {
  const packed = packShelfColumns([
    { key: 'a', width: SHELF.collapsedWidth, height: SHELF.collapsedHeight },
    { key: 'b', width: SHELF.collapsedWidth, height: SHELF.collapsedHeight },
  ], 388)
  assert.equal(packed.a.col, 0)
  assert.equal(packed.b.col, 1)
  assert.equal(packed.a.y, packed.b.y)
  const next = packShelfColumns([
    { key: 'a', width: SHELF.collapsedWidth, height: SHELF.collapsedHeight },
    { key: 'b', width: SHELF.collapsedWidth, height: SHELF.collapsedHeight },
    { key: 'c', width: SHELF.collapsedWidth, height: SHELF.collapsedHeight },
  ], 388)
  assert.equal(next.c.y, next.a.y + SHELF.collapsedHeight + SHELF.gapY)
  assert.ok(SHELF.gapY >= 56)
  assert.ok(SHELF.gapX >= 32)
})

test('spare cells pack in the same downward-only grid as slot groups', () => {
  const cell = { width: SHELF.collapsedWidth, height: SHELF.collapsedHeight }
  const packed = packShelfColumns([
    { key: 'slot-a', ...cell },
    { key: 'spare-1', ...cell },
    { key: 'slot-b', ...cell },
  ], 388)
  assert.equal(isCanvasSpareKey('spare-1'), true)
  assert.equal(isCanvasSpareKey('hero-lvbu:base'), false)
  assert.equal(packed['slot-a'].col, 0)
  assert.equal(packed['spare-1'].col, 1)
  assert.equal(packed['slot-b'].col, 0)
  assert.equal(packed['spare-1'].y, packed['slot-a'].y)
  assert.ok(packed['slot-b'].y > packed['slot-a'].y)
})

test('expand keeps the group in place and slides overlapped neighbors right', () => {
  const collapsed = { width: 176, height: 214 }
  const start = packShelfColumns([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
    { key: 'd', ...collapsed },
  ], 600, GRID)
  const expanded = pushAsideForExpand(start, 'a', { width: 360, height: 520 }, 600, ['a', 'b', 'c', 'd'], GRID)
  const rightOfA = expanded.a.x + expanded.a.width + GRID.gapX
  assert.equal(expanded.a.x, start.a.x)
  assert.equal(expanded.a.y, start.a.y)
  assert.equal(expanded.b.y, start.b.y)
  assert.equal(expanded.c.y, start.c.y)
  assert.equal(expanded.d.y, start.d.y)
  assert.ok(expanded.b.x >= rightOfA)
  assert.ok(expanded.c.x >= rightOfA)
  assert.ok(!rectsOverlap(expanded.a, expanded.b))
  assert.ok(!rectsOverlap(expanded.a, expanded.c))
  assert.ok(!rectsOverlap(expanded.a, expanded.d))
  const kept = layoutFromPositions([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
    { key: 'd', ...collapsed },
  ], positionsFromRects(expanded), 600, GRID)
  assert.equal(kept.b.x, expanded.b.x)
  assert.equal(kept.b.y, expanded.b.y)
  assert.equal(kept.c.x, expanded.c.x)
  assert.equal(kept.c.y, expanded.c.y)
})

test('expand height growth slides the row below to the right instead of a new row', () => {
  const collapsed = { width: 176, height: 214 }
  const start = packShelfColumns([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
    { key: 'd', ...collapsed },
    { key: 'e', ...collapsed },
    { key: 'f', ...collapsed },
  ], 800, GRID)
  assert.equal(start.a.y, start.b.y)
  assert.equal(start.d.y, start.e.y)
  assert.ok(start.d.y > start.a.y)
  const expanded = pushAsideForExpand(
    start,
    'a',
    { width: 560, height: 520 },
    800,
    ['a', 'b', 'c', 'd', 'e', 'f'],
    GRID,
  )
  const rightOfA = expanded.a.x + expanded.a.width + GRID.gapX
  assert.equal(expanded.a.x, start.a.x)
  assert.equal(expanded.a.y, start.a.y)
  assert.equal(expanded.b.y, start.b.y)
  assert.equal(expanded.d.y, start.d.y)
  assert.ok(expanded.b.x >= rightOfA)
  assert.ok(expanded.d.x >= rightOfA)
  assert.ok(!rectsOverlap(expanded.a, expanded.b))
  assert.ok(!rectsOverlap(expanded.a, expanded.d))
  assert.ok(!rectsOverlap(expanded.b, expanded.c) || expanded.c.x >= expanded.b.x + expanded.b.width)
})

test('user-moved group keeps its coordinates until tidy re-packs', () => {
  const collapsed = { width: 176, height: 214 }
  const start = packShelfColumns([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
  ], 600, GRID)
  const moved = layoutFromPositions([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
  ], { ...positionsFromRects(start), b: { x: 410, y: 48 } }, 600, GRID)
  assert.equal(moved.b.x, 410)
  assert.equal(moved.b.y, 48)
  assert.equal(moved.a.x, start.a.x)
  assert.equal(moved.c.y, start.c.y)
  const tidied = tidyBoardPositions([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
  ], 600, GRID)
  assert.equal(tidied.a.x, start.a.x)
  assert.equal(tidied.b.x, start.b.x)
  assert.equal(tidied.b.y, start.b.y)
  assert.equal(tidied.c.x, start.c.x)
})

test('expanding a later group stays put and only slides overlapped neighbors right', () => {
  const collapsed = { width: 176, height: 214 }
  const start = packShelfColumns([
    { key: 'a', ...collapsed },
    { key: 'b', ...collapsed },
    { key: 'c', ...collapsed },
  ], 600, GRID)
  const placed = placeExpandedGroup(start.b)
  assert.equal(placed.x, start.b.x)
  assert.equal(placed.y, start.b.y)
  const expanded = pushAsideForExpand(start, 'b', { width: 360, height: 400 }, 600, ['a', 'b', 'c'], GRID)
  assert.equal(expanded.b.x, start.b.x)
  assert.equal(expanded.b.y, start.b.y)
  assert.equal(expanded.a.y, start.a.y)
  assert.ok(!rectsOverlap(expanded.a, expanded.b))
  assert.ok(!rectsOverlap(expanded.b, expanded.c) || expanded.c.x >= expanded.b.x + expanded.b.width)
})

test('shelf insert index and placeShelfKey reorder without free coordinates', () => {
  const others = [
    { key: 'a', x: 24, y: 80, width: 176, height: 214, col: 0, row: 0 },
    { key: 'b', x: 224, y: 80, width: 176, height: 214, col: 1, row: 0 },
  ]
  assert.equal(shelfInsertIndex(others, { x: 40, y: 100 }), 0)
  assert.equal(shelfInsertIndex(others, { x: 300, y: 100 }), 1)
  assert.equal(shelfInsertIndex(others, { x: 500, y: 100 }), 2)
  assert.deepEqual(placeShelfKey(['a', 'b', 'c'], 'c', 0), ['c', 'a', 'b'])
  assert.deepEqual(placeShelfKey(['a', 'b', 'c'], 'a', 2), ['b', 'c', 'a'])
})

test('follow-selection toolbar sits above the tile and flips below when clipped', () => {
  assert.deepEqual(
    followSelectionToolbarBox({ x: 100, y: 120, width: 156, height: 156 }, { width: 280, height: 40 }, { width: 800, height: 600 }),
    { x: 38, y: 70 },
  )
  assert.equal(
    followSelectionToolbarBox({ x: 40, y: 20, width: 156, height: 156 }, { width: 280, height: 40 }, { width: 800, height: 600 }).y,
    186,
  )
  assert.equal(
    followSelectionToolbarBox({ x: 700, y: 80, width: 156, height: 156 }, { width: 280, height: 40 }, { width: 800, height: 600 }).x,
    512,
  )
})

test('command wheel steps canvas zoom and clamps the range', () => {
  assert.equal(canvasZoomFromWheel(1, 120), 0.9)
  assert.equal(canvasZoomFromWheel(1, -120), 1.1)
  assert.equal(clampCanvasZoom(0.05), 0.1)
  assert.equal(clampCanvasZoom(10), 8)
})

test('space plus left-drag pans the infinite canvas in screen pixels', () => {
  assert.deepEqual(
    canvasPanFromPointer({ x: 12, y: -8 }, { x: 100, y: 40 }, { x: 140, y: 10 }),
    { x: 52, y: -38 },
  )
  assert.deepEqual(
    canvasWorldPoint(220, 140, { left: 20, top: 40 }, { x: 40, y: -20 }, 2),
    { x: 80, y: 60 },
  )
})

test('command wheel keeps the cursor-anchored world point when zooming', () => {
  const next = canvasZoomTowardPoint(1, 1.2, 220, 140, { left: 20, top: 40 }, { x: 40, y: -20 })
  assert.equal(next.zoom, 1.2)
  assert.deepEqual(canvasWorldPoint(220, 140, { left: 20, top: 40 }, next.pan, next.zoom), { x: 160, y: 120 })
})

test('space pan ignores typing surfaces', () => {
  assert.equal(isCanvasSpacePanTarget(null), true)
  assert.equal(isCanvasSpacePanTarget({ tagName: 'TEXTAREA' }), false)
  assert.equal(isCanvasSpacePanTarget({ tagName: 'DIV' }), true)
})

test('tile mode only shows the spare bin for unassigned images', () => {
  assert.equal(catalogShowsSpareBin(0), false)
  assert.equal(catalogShowsSpareBin(2), true)
  assert.equal(catalogShowsSpareBin(2, { kind: 'video' }), false)
  assert.equal(catalogShowsSpareBin(2, { source: 'generated' }), false)
  assert.equal(catalogShowsSpareBin(2, { category: 'hero' }), false)
  assert.equal(catalogShowsSpareBin(2, { kind: 'image', source: 'uploaded', category: 'all' }), true)
})
