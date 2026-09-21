import assert from 'node:assert/strict'
import test from 'node:test'

import {
  appendTowerDefenseVisualVersion,
  fitTowerDefenseUploadSize,
  visualVersionLabel,
} from '../src/modules/vibecoding/components/tower-defense/TowerDefenseVisualVersion.ts'
import { buildCatalogSpareAsset, CATALOG_SPARE_BIN_ID, canvasVisualRecordId, createCanvasSpareFromUpload, spareRequiresAssetImport } from '../src/modules/vibecoding/components/tower-defense/TowerDefenseCanvasSpares.ts'

function sampleAsset(id = 'hero-lvbu') {
  return {
    id,
    name: '吕布',
    category: 'hero',
    role: '主控英雄',
    description: '测试资产',
    accent: '#B87A42',
    baseVisualStatus: 'draft',
    selectedVisualVersion: 0,
    visualVersions: [
      { id: 'v1', src: '/assets/tower-defense-demo/characters/hero-lvbu-cutout.png', width: 899, height: 725 },
    ],
    states: [],
  }
}

test('upload size keeps images within the 1600px long-side cap', () => {
  assert.deepEqual(fitTowerDefenseUploadSize(800, 600), { width: 800, height: 600 })
  assert.deepEqual(fitTowerDefenseUploadSize(3200, 1800), { width: 1600, height: 900 })
  assert.deepEqual(fitTowerDefenseUploadSize(900, 2700), { width: 533, height: 1600 })
})

test('appending a local upload creates a selectable visual version', () => {
  const hero = sampleAsset()
  const result = appendTowerDefenseVisualVersion([hero], hero.id, {
    id: 'upload-lvbu',
    src: 'data:image/png;base64,aaa',
    width: 512,
    height: 512,
    source: 'upload',
    label: '吕布手绘',
  })

  const nextHero = result.assets.find((asset) => asset.id === hero.id)
  assert.equal(result.versionIndex, 1)
  assert.equal(nextHero?.visualVersions?.length, 2)
  assert.equal(nextHero?.visualVersions?.[1]?.src, 'data:image/png;base64,aaa')
  assert.equal(visualVersionLabel(nextHero?.visualVersions?.[1], 1), '吕布手绘')
})

test('unknown asset uploads do not mutate the library', () => {
  const assets = [sampleAsset()]
  const result = appendTowerDefenseVisualVersion(assets, 'missing-asset', {
    id: 'upload-x',
    src: 'data:image/png;base64,bbb',
    width: 64,
    height: 64,
    source: 'upload',
  })

  assert.equal(result.versionIndex, -1)
  assert.equal(result.assets, assets)
})

test('unassigned canvas uploads collect into a catalog spare bin', () => {
  const spare = createCanvasSpareFromUpload({
    src: 'data:image/png;base64,ccc',
    width: 320,
    height: 180,
    label: '手绘地图',
  })
  const asset = buildCatalogSpareAsset([spare])
  assert.equal(spare.id.startsWith('spare-upload-'), true)
  assert.equal(asset.id, CATALOG_SPARE_BIN_ID)
  assert.equal(asset.name, '备选')
  assert.equal(asset.visualVersions?.length, 1)
  assert.equal(asset.visualVersions?.[0]?.label, '手绘地图')
  assert.equal(spareRequiresAssetImport(spare, 'map-battlefield'), true)
  assert.equal(canvasVisualRecordId(3), 'visual-3')
  assert.equal(spareRequiresAssetImport({
    id: 'spare-existing',
    sourceAssetId: 'hero-lvbu',
    record: { id: 'visual-1', kind: 'visual', versionIndex: 1, label: '方案 B', src: 'x', width: 64, height: 64 },
  }, 'hero-lvbu'), false)
  assert.equal(spareRequiresAssetImport({
    id: 'spare-cross',
    sourceAssetId: 'hero-lvbu',
    record: { id: 'visual-1', kind: 'visual', versionIndex: 1, label: '方案 B', src: 'x', width: 64, height: 64 },
  }, 'map-battlefield'), true)
})
