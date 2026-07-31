import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createDefaultH5CanvasDocument,
  duplicateH5CanvasNode,
  removeH5CanvasNode,
  reorderH5CanvasNode,
  screenDeltaToCanvas,
  updateH5CanvasNode,
} from '../src/modules/vibecoding/components/H5CanvasModel.ts'

test('H5 canvas converts screen movement through the active zoom', () => {
  assert.ok(Math.abs(screenDeltaToCanvas(55, 0.55) - 100) < Number.EPSILON * 100)
  assert.equal(screenDeltaToCanvas(20, 2), 10)
  assert.equal(screenDeltaToCanvas(20, 0), 0)
})

test('H5 canvas duplicates one instance with a unique id and nearby offset', () => {
  const document = createDefaultH5CanvasDocument()
  const source = document.nodes.find((node) => node.id === 'intro-1')
  assert.ok(source)

  const result = duplicateH5CanvasNode(
    document.nodes,
    source.id,
    'intro-copy',
    16,
  )

  assert.equal(result.nodes.length, document.nodes.length + 1)
  assert.equal(result.duplicate?.id, 'intro-copy')
  assert.equal(result.duplicate?.kind, source.kind)
  assert.equal(result.duplicate?.x, source.x + 16)
  assert.equal(result.duplicate?.y, source.y + 16)
  assert.equal(new Set(result.nodes.map((node) => node.id)).size, result.nodes.length)
  assert.deepEqual(
    result.nodes.map((node) => node.zIndex),
    result.nodes.map((_, index) => index + 1),
  )
  assert.equal(document.nodes.length, 5)
})

test('H5 canvas movement and layer ordering update only the target instance', () => {
  const document = createDefaultH5CanvasDocument()
  const moved = updateH5CanvasNode(document.nodes, 'hero-1', { x: 24, y: 32 })

  assert.equal(moved.find((node) => node.id === 'hero-1')?.x, 24)
  assert.equal(document.nodes.find((node) => node.id === 'hero-1')?.x, 0)

  const reordered = reorderH5CanvasNode(moved, 'hero-1', 'forward')
  assert.equal(reordered.find((node) => node.id === 'hero-1')?.zIndex, 2)
  assert.deepEqual(
    reordered.map((node) => node.zIndex),
    reordered.map((_, index) => index + 1),
  )
})

test('H5 canvas removal normalizes stacking without mutating the source', () => {
  const document = createDefaultH5CanvasDocument()
  const next = removeH5CanvasNode(document.nodes, 'countdown-1')

  assert.equal(next.some((node) => node.id === 'countdown-1'), false)
  assert.equal(document.nodes.some((node) => node.id === 'countdown-1'), true)
  assert.deepEqual(
    next.map((node) => node.zIndex),
    next.map((_, index) => index + 1),
  )
})
