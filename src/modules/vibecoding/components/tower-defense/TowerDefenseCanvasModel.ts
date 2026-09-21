export function canvasTileId(slotKey: string, recordId: string) {
  return `${slotKey}::${recordId}`
}

export function groupShowsStack(tileCount: number) {
  return tileCount > 1
}

export function groupShowsExpandControl(tileCount: number) {
  return tileCount > 1
}

/** After deleting a tile, keep the current cover if it still exists; otherwise promote the first remaining tile. */
export function nextCoverRecordId(
  recordIds: readonly string[],
  currentCoverId: string | undefined,
  deletedId: string,
): string | undefined {
  const remaining = recordIds.filter((id) => id !== deletedId)
  if (remaining.length === 0) return undefined
  if (currentCoverId && currentCoverId !== deletedId && remaining.includes(currentCoverId)) return currentCoverId
  return remaining[0]
}

export function layoutCanvasSlot(
  index: number,
  cols = 4,
  originX = 28,
  originY = 80,
  colWidth = 228,
  rowHeight = 256,
) {
  return {
    x: originX + (index % cols) * colWidth,
    y: originY + Math.floor(index / cols) * rowHeight,
  }
}

export const SHELF = {
  originX: 12,
  originY: 20,
  gapX: 36,
  gapY: 64,
  rightPad: 12,
  collapsedWidth: 156,
  titleBlock: 44,
  collapsedHeight: 200,
  tile: 156,
  tileGap: 8,
  pad: 12,
  grip: 44,
  frame: 2,
  padMinHeight: 196,
  dragThreshold: 8,
} as const

export type ShelfBox = {
  key: string
  width: number
  height: number
}

export type ShelfRect = ShelfBox & {
  x: number
  y: number
  col: number
  row: number
}

export type CanvasTileSelection = {
  groupKey: string
  recordId: string
}

export type ShelfPackOptions = {
  originX?: number
  originY?: number
  gapX?: number
  gapY?: number
  rightPad?: number
  cellWidth?: number
}

function shelfMetrics(canvasWidth: number, options?: ShelfPackOptions) {
  const originX = options?.originX ?? SHELF.originX
  const originY = options?.originY ?? SHELF.originY
  const gapX = options?.gapX ?? SHELF.gapX
  const gapY = options?.gapY ?? SHELF.gapY
  const rightPad = options?.rightPad ?? SHELF.rightPad
  const cellWidth = options?.cellWidth ?? SHELF.collapsedWidth
  const inner = Math.max(cellWidth, canvasWidth - originX - rightPad)
  const cols = Math.max(1, Math.floor((inner + gapX) / (cellWidth + gapX)))
  return { originX, originY, gapX, gapY, rightPad, cellWidth, cols }
}

export function shelfColumnCount(canvasWidth: number, options?: ShelfPackOptions) {
  return shelfMetrics(canvasWidth, options).cols
}

/** Full shelf width so expanded tiles can sit in a horizontal wrap, not a one-column stack. */
export function expandMaxWidth(canvasWidth: number, _col = 0, options?: ShelfPackOptions) {
  const { originX, rightPad, cellWidth } = shelfMetrics(canvasWidth, options)
  return Math.max(cellWidth, canvasWidth - originX - rightPad)
}

/** Index covers stay square; object tiles snap to these so mixed ratios can wrap on a locked row height. */
export const ASSET_ASPECT_BUCKETS = [9 / 16, 3 / 4, 1, 4 / 3, 16 / 9] as const

export function quantizeAssetAspect(width?: number, height?: number) {
  if (!width || !height || width <= 0 || height <= 0) return 1
  const ratio = width / height
  let best = 1
  let bestDist = Infinity
  for (const bucket of ASSET_ASPECT_BUCKETS) {
    const dist = Math.abs(Math.log(ratio / bucket))
    if (dist < bestDist) {
      best = bucket
      bestDist = dist
    }
  }
  return best
}

export function objectTileBox(width?: number, height?: number, rowHeight = SHELF.tile) {
  const ratio = quantizeAssetAspect(width, height)
  return {
    width: Math.max(1, Math.round(rowHeight * ratio)),
    height: rowHeight,
    ratio,
  }
}

export const TILE_SCALE_MIN = 0.5
export const TILE_SCALE_MAX = 4

export function clampTileScale(value: number) {
  return Math.min(TILE_SCALE_MAX, Math.max(TILE_SCALE_MIN, Number(value.toFixed(3))))
}

export type ObjectTileSize = {
  width: number
  height: number
}

export function scaleObjectTileBox(width?: number, height?: number, scale = 1) {
  const base = objectTileBox(width, height)
  const next = clampTileScale(scale)
  return {
    width: Math.max(1, Math.round(base.width * next)),
    height: Math.max(1, Math.round(base.height * next)),
    ratio: base.ratio,
    scale: next,
  }
}

export type TileResizeCorner = 'nw' | 'ne' | 'sw' | 'se'

/** Keep aspect; the farther axis from the opposite corner wins so the drag feels proportional. */
export function tileScaleFromCornerDrag(
  originScale: number,
  startBox: ObjectTileSize,
  corner: TileResizeCorner,
  delta: ObjectTileSize,
) {
  const baseWidth = startBox.width / (originScale || 1)
  const baseHeight = startBox.height / (originScale || 1)
  const nextWidth = startBox.width + (corner.includes('e') ? delta.width : -delta.width)
  const nextHeight = startBox.height + (corner.includes('s') ? delta.height : -delta.height)
  const scaleX = nextWidth / Math.max(1, baseWidth)
  const scaleY = nextHeight / Math.max(1, baseHeight)
  const dominant = Math.abs(delta.width) * startBox.height >= Math.abs(delta.height) * startBox.width ? scaleX : scaleY
  return clampTileScale(dominant)
}

export function wrapObjectTiles(tiles: readonly ObjectTileSize[], innerMax: number) {
  return wrapObjectTilesByGuide(tiles, tiles.map((tile) => tile.width), innerMax, true)
}

/** Row breaks follow default/guide widths so scaling never reshuffles membership. */
export function wrapObjectTileIndexes(guideWidths: readonly number[], innerMax: number) {
  const limit = Math.max(1, innerMax)
  const rows: number[][] = []
  let current: number[] = []
  let used = 0
  guideWidths.forEach((raw, index) => {
    const guide = Math.min(Math.max(1, raw), limit)
    const nextUsed = current.length === 0 ? guide : used + SHELF.tileGap + guide
    if (current.length > 0 && nextUsed > limit + 0.5) {
      rows.push(current)
      current = [index]
      used = guide
      return
    }
    current.push(index)
    used = nextUsed
  })
  if (current.length) rows.push(current)
  return rows.length ? rows : [[0]]
}

export function wrapObjectTilesByGuide(
  tiles: readonly ObjectTileSize[],
  guideWidths: readonly number[],
  innerMax: number,
  clampToGuide = false,
) {
  const limit = Math.max(1, innerMax)
  return wrapObjectTileIndexes(guideWidths.length ? guideWidths : tiles.map((tile) => tile.width), innerMax).map((row) => (
    row.map((index) => {
      const raw = tiles[index] ?? { width: SHELF.tile, height: SHELF.tile }
      const width = clampToGuide ? Math.min(Math.max(1, raw.width), limit) : Math.max(1, raw.width)
      const height = clampToGuide
        ? Math.max(1, Math.round(width * (raw.height / Math.max(1, raw.width))))
        : Math.max(1, raw.height)
      return { width, height }
    })
  ))
}

export function wrapObjectRowWidths(tileWidths: readonly number[], innerMax: number) {
  return wrapObjectTiles(tileWidths.map((width) => ({ width, height: SHELF.tile })), innerMax).map((row) => row.map((tile) => tile.width))
}

function rowContentWidth(row: readonly number[]) {
  return row.reduce((sum, width, index) => sum + width + (index ? SHELF.tileGap : 0), 0)
}

function isObjectTileSize(value: unknown): value is ObjectTileSize {
  return Boolean(value && typeof value === 'object' && 'width' in value && 'height' in value)
}

function normalizeExpandedTiles(tiles: number | readonly number[] | readonly ObjectTileSize[]): ObjectTileSize[] {
  if (typeof tiles === 'number') {
    return Array.from({ length: Math.max(1, tiles) }, () => ({ width: SHELF.tile, height: SHELF.tile }))
  }
  if (!tiles.length) return [{ width: SHELF.tile, height: SHELF.tile }]
  if (typeof tiles[0] === 'number') {
    return (tiles as readonly number[]).map((width) => ({ width, height: SHELF.tile }))
  }
  return (tiles as readonly ObjectTileSize[]).filter(isObjectTileSize)
}

/** `tiles` is a 1:1 count, default-height widths, or custom {width,height} after a user resize. */
export function expandedGroupSize(
  tiles: number | readonly number[] | readonly ObjectTileSize[],
  maxWidth: number,
  guideWidths?: readonly number[],
) {
  const tile = SHELF.tile
  const sizes = normalizeExpandedTiles(tiles)
  const columnWidth = Math.max(tile, maxWidth)
  const innerMax = Math.max(tile, columnWidth - SHELF.pad * 2 - SHELF.frame)
  const rows = guideWidths
    ? wrapObjectTilesByGuide(sizes, guideWidths, innerMax)
    : wrapObjectTiles(sizes, innerMax)
  const widest = Math.max(...rows.map((row) => rowContentWidth(row.map((item) => item.width))))
  const contentWidth = SHELF.frame + SHELF.pad * 2 + widest
  const width = Math.max(SHELF.collapsedWidth, guideWidths ? contentWidth : Math.min(columnWidth, contentWidth))
  const rowHeights = rows.map((row) => Math.max(...row.map((item) => item.height)))
  const contentHeight = SHELF.pad * 2 + rowHeights.reduce((sum, height) => sum + height, 0) + Math.max(0, rows.length - 1) * SHELF.tileGap
  const padHeight = sizes.length <= 2 && rowHeights.every((height) => height <= tile)
    ? Math.max(SHELF.padMinHeight, contentHeight)
    : contentHeight
  return {
    width,
    height: SHELF.grip + padHeight,
    padHeight,
    cols: Math.max(...rows.map((row) => row.length)),
    rows: rows.length,
    visibleRows: rows.length,
    scrollable: false,
    tile,
  }
}

export function shelfGroupSize(options: {
  expanded: boolean
  tileCount: number
  empty?: boolean
  maxWidth?: number
  tileWidths?: readonly number[]
  tileSizes?: readonly ObjectTileSize[]
  guideWidths?: readonly number[]
}) {
  if (!options.expanded || options.empty) {
    return {
      width: SHELF.collapsedWidth,
      height: SHELF.collapsedHeight,
      padHeight: SHELF.collapsedWidth,
      cols: 1,
      rows: 1,
      visibleRows: 1,
      scrollable: false,
      tile: SHELF.collapsedWidth,
    }
  }
  return expandedGroupSize(
    options.tileSizes ?? options.tileWidths ?? options.tileCount,
    options.maxWidth ?? SHELF.collapsedWidth,
    options.guideWidths,
  )
}

function itemStartsNewBand(width: number, cellWidth: number) {
  return width > cellWidth
}

/** Left-aligned wrap: rows always start at originX. An expanded (wide) group takes its own band; groups after it start on a new left-aligned row. */
export function packShelfColumns(
  items: readonly ShelfBox[],
  canvasWidth: number,
  options?: ShelfPackOptions,
): Record<string, ShelfRect> {
  const { originX, originY, gapX, gapY, rightPad, cellWidth } = shelfMetrics(canvasWidth, options)
  const maxX = canvasWidth - rightPad
  const packed: Record<string, ShelfRect> = {}
  let x = originX
  let y = originY
  let row = 0
  let col = 0
  let rowHeight = 0
  items.forEach((item) => {
    const wide = itemStartsNewBand(item.width, cellWidth)
    const fits = x === originX || x + item.width <= maxX + 0.5
    if (!fits || (wide && x !== originX)) {
      y += rowHeight + gapY
      x = originX
      row += 1
      col = 0
      rowHeight = 0
    }
    packed[item.key] = { ...item, x, y, col, row }
    rowHeight = Math.max(rowHeight, item.height)
    if (wide) {
      y += rowHeight + gapY
      x = originX
      row += 1
      col = 0
      rowHeight = 0
      return
    }
    x += item.width + gapX
    col += 1
  })
  return packed
}

/** @deprecated Use packShelfColumns. Kept so older imports keep the downward-only grid. */
export function packShelfFlow(
  items: readonly ShelfBox[],
  canvasWidth: number,
  options?: ShelfPackOptions,
) {
  return packShelfColumns(items, canvasWidth, options)
}

export type BoardPosition = {
  x: number
  y: number
}

export function positionsFromRects(rects: Record<string, Pick<ShelfRect, 'x' | 'y'>>): Record<string, BoardPosition> {
  const next: Record<string, BoardPosition> = {}
  for (const [key, rect] of Object.entries(rects)) {
    next[key] = { x: rect.x, y: rect.y }
  }
  return next
}

export function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

function horizontallyOverlap(a: { x: number; width: number }, b: { x: number; width: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x
}

function verticallyOverlap(a: { y: number; height: number }, b: { y: number; height: number }) {
  return a.y < b.y + b.height && a.y + a.height > b.y
}

/** Keep stored x/y. Missing keys pack left-aligned after existing items (or from the origin if the board is empty). */
export function layoutFromPositions(
  boxes: readonly ShelfBox[],
  positions: Record<string, BoardPosition>,
  canvasWidth: number,
  options?: ShelfPackOptions,
): Record<string, ShelfRect> {
  const result: Record<string, ShelfRect> = {}
  const missing: ShelfBox[] = []
  for (const box of boxes) {
    const pos = positions[box.key]
    if (pos) result[box.key] = { ...box, x: pos.x, y: pos.y, col: 0, row: 0 }
    else missing.push(box)
  }
  if (missing.length === 0) return result
  const { originY, gapY } = shelfMetrics(canvasWidth, options)
  const packedOriginY = Object.keys(result).length === 0
    ? originY
    : Math.max(...Object.values(result).map((rect) => rect.y + rect.height)) + gapY
  return { ...result, ...packShelfColumns(missing, canvasWidth, { ...options, originY: packedOriginY }) }
}

export function tidyBoardPositions(
  boxes: readonly ShelfBox[],
  canvasWidth: number,
  options?: ShelfPackOptions,
) {
  return positionsFromRects(packShelfColumns(boxes, canvasWidth, options))
}

export function placeExpandedGroup(
  oldRect: { x: number; y: number; width: number; height: number },
): BoardPosition {
  return { x: oldRect.x, y: oldRect.y }
}

function shouldYieldHorizontally(
  movingKey: string,
  blockerKey: string,
  expandedKey: string,
  moving: BoardPosition,
  blocker: BoardPosition,
  order: readonly string[],
) {
  if (blockerKey === expandedKey) return true
  if (movingKey === expandedKey) return false
  if (blocker.x < moving.x - 0.5) return true
  if (moving.x < blocker.x - 0.5) return false
  return order.indexOf(blockerKey) < order.indexOf(movingKey)
}

/** Grow the expanded group in place and slide overlapped neighbors right. Collapse must not call this. */
export function pushAsideForExpand(
  rects: Record<string, ShelfRect>,
  expandedKey: string,
  newSize: { width: number; height: number },
  canvasWidth: number,
  order: readonly string[] = Object.keys(rects),
  options?: ShelfPackOptions,
): Record<string, ShelfRect> {
  const old = rects[expandedKey]
  if (!old) return rects
  const { gapX } = shelfMetrics(canvasWidth, options)
  const next: Record<string, ShelfRect> = {}
  for (const [key, rect] of Object.entries(rects)) next[key] = { ...rect }
  const placed = placeExpandedGroup(old)
  next[expandedKey] = { ...old, ...newSize, ...placed, col: 0, row: 0 }

  const keys = order.filter((key) => next[key] && key !== expandedKey)
  for (let step = 0; step < 48; step += 1) {
    let moved = false
    for (const key of keys) {
      const rect = next[key]
      let x = rect.x
      for (const blockerKey of [expandedKey, ...keys]) {
        if (blockerKey === key) continue
        const blocker = next[blockerKey]
        if (!verticallyOverlap(rect, blocker)) continue
        if (!horizontallyOverlap({ ...rect, x }, blocker)) continue
        if (!shouldYieldHorizontally(key, blockerKey, expandedKey, { x, y: rect.y }, blocker, order)) continue
        x = Math.max(x, blocker.x + blocker.width + gapX)
      }
      if (x > rect.x + 0.5) {
        next[key] = { ...rect, x, col: 0 }
        moved = true
      }
    }
    if (!moved) break
  }
  return next
}

export function shelfInsertIndex(others: readonly ShelfRect[], pointer: { x: number; y: number }) {
  for (let index = 0; index < others.length; index += 1) {
    const item = others[index]
    const midX = item.x + item.width / 2
    const sameBand = pointer.y >= item.y && pointer.y <= item.y + item.height
    if (pointer.y < item.y || (sameBand && pointer.x < midX)) return index
  }
  return others.length
}

export function placeShelfKey(order: readonly string[], key: string, insertAmongOthers: number) {
  const others = order.filter((item) => item !== key)
  const index = Math.max(0, Math.min(insertAmongOthers, others.length))
  return [...others.slice(0, index), key, ...others.slice(index)]
}

export function isCanvasSpareKey(key: string) {
  return key.startsWith('spare-')
}

/** Place a follow-selection bar above the tile, flipping below and clamping to the viewport. */
export function followSelectionToolbarBox(
  selected: { x: number; y: number; width: number; height: number },
  toolbar: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = 10,
  pad = 8,
) {
  const x = Math.min(
    Math.max(pad, selected.x + selected.width / 2 - toolbar.width / 2),
    Math.max(pad, viewport.width - toolbar.width - pad),
  )
  const above = selected.y - toolbar.height - gap
  const y = above < pad ? selected.y + selected.height + gap : above
  return { x, y }
}

export const CANVAS_ZOOM_MIN = 0.1
export const CANVAS_ZOOM_MAX = 8
export const CANVAS_ZOOM_STEP = 0.1

export function clampCanvasZoom(value: number) {
  return Math.min(CANVAS_ZOOM_MAX, Math.max(CANVAS_ZOOM_MIN, Number(value.toFixed(2))))
}

export function canvasZoomFromWheel(current: number, deltaY: number, step = CANVAS_ZOOM_STEP) {
  return clampCanvasZoom(current + (deltaY > 0 ? -step : step))
}

export type CanvasPan = { x: number; y: number }

export function canvasWorldPoint(
  clientX: number,
  clientY: number,
  viewport: { left: number; top: number },
  pan: CanvasPan,
  zoom: number,
) {
  const scale = zoom || 1
  return {
    x: (clientX - viewport.left - pan.x) / scale,
    y: (clientY - viewport.top - pan.y) / scale,
  }
}

export function canvasPanFromPointer(
  origin: CanvasPan,
  start: { x: number; y: number },
  current: { x: number; y: number },
): CanvasPan {
  return {
    x: origin.x + (current.x - start.x),
    y: origin.y + (current.y - start.y),
  }
}

export function canvasZoomTowardPoint(
  currentZoom: number,
  nextZoom: number,
  clientX: number,
  clientY: number,
  viewport: { left: number; top: number },
  pan: CanvasPan,
) {
  const world = canvasWorldPoint(clientX, clientY, viewport, pan, currentZoom)
  return {
    zoom: nextZoom,
    pan: {
      x: clientX - viewport.left - world.x * nextZoom,
      y: clientY - viewport.top - world.y * nextZoom,
    },
  }
}

export function isCanvasSpacePanTarget(target: EventTarget | null) {
  if (!target || typeof target !== 'object') return true
  const element = target as { closest?: (selector: string) => unknown; tagName?: string; isContentEditable?: boolean }
  if (typeof element.closest === 'function') {
    return !element.closest('input,textarea,select,[contenteditable="true"]')
  }
  const tag = String(element.tagName ?? '').toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return false
  return !element.isContentEditable
}

export function catalogShowsSpareBin(
  spareCount: number,
  filters: {
    kind?: 'all' | 'image' | 'video' | 'audio'
    source?: 'all' | 'generated' | 'uploaded'
    category?: string
  } = {},
) {
  if (spareCount <= 0) return false
  if (filters.kind === 'video' || filters.kind === 'audio') return false
  if (filters.source === 'generated') return false
  if (filters.category && filters.category !== 'all') return false
  return true
}
