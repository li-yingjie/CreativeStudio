import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import {
  ACG_NEW_YEAR_ASSET_GROUPS,
  GARUDA_ASSET_GROUPS,
  resolveAssetPrompt,
} from '../src/modules/vibecoding/components/ProjectAssetCatalog.ts'

function publicPath(src) {
  return fileURLToPath(new URL(`../public${src}`, import.meta.url))
}

function framePath(src, index) {
  const match = src.match(/^(.*?)(\d+)(\.[a-z0-9]+)$/i)
  if (!match) return src
  const [, prefix, frame, extension] = match
  return `${prefix}${String(index).padStart(frame.length, '0')}${extension}`
}

function verifyCatalog(groups) {
  const items = groups.flatMap((group) => group.items)
  const ids = items.map((item) => item.id)

  assert.equal(ids.every(Boolean), true)
  assert.equal(new Set(ids).size, ids.length)

  items.forEach((item) => {
    const prompt = resolveAssetPrompt(item)
    assert.ok(prompt.text.trim(), `${item.id} is missing a Prompt`)
    assert.ok(prompt.skillLabel.trim(), `${item.id} is missing a skill label`)
    assert.ok(prompt.model.trim(), `${item.id} is missing a model`)
    assert.ok(
      existsSync(publicPath(item.src)),
      `${item.id} points to a missing public asset: ${item.src}`,
    )

    if (item.frames) {
      const lastFrame = framePath(item.src, item.frames - 1)
      assert.ok(
        existsSync(publicPath(lastFrame)),
        `${item.id} points past its final sequence frame: ${lastFrame}`,
      )
    }
  })

  return items
}

test('H5 catalog exposes the 12 extracted Figma assets with Prompt metadata', () => {
  const items = verifyCatalog(ACG_NEW_YEAR_ASSET_GROUPS)
  assert.equal(items.length, 12)
  assert.equal(
    items.every((item) => item.src.startsWith('/assets/acg-new-year/materials/')),
    true,
  )
})

test('Garuda catalog keeps every logical asset addressable by one Prompt', () => {
  const items = verifyCatalog(GARUDA_ASSET_GROUPS)
  assert.equal(items.length, 51)
  assert.equal(
    items.filter((item) => (item.kind ?? 'image') === 'image').length,
    40,
  )
  assert.equal(items.filter((item) => item.kind === 'audio').length, 9)
  assert.equal(items.filter((item) => item.kind === 'video').length, 2)
})

test('catalog ids stay unique across projects', () => {
  const ids = [ACG_NEW_YEAR_ASSET_GROUPS, GARUDA_ASSET_GROUPS]
    .flatMap((groups) => groups)
    .flatMap((group) => group.items)
    .map((item) => item.id)
  assert.equal(new Set(ids).size, ids.length)
})
