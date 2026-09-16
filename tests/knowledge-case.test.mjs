import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

import { validateCasePackage } from '../scripts/validate-knowledge.mjs'

const CASE_FILE = new URL('../knowledge/cases/film_jiu_men_card_2026/case-package.json', import.meta.url)
const data = JSON.parse(await readFile(CASE_FILE, 'utf8'))
const ASSET_MANIFEST_FILE = new URL('../knowledge/cases/film_jiu_men_card_2026/asset-manifest.json', import.meta.url)
const assetManifestText = await readFile(ASSET_MANIFEST_FILE, 'utf8')
const assetManifest = JSON.parse(assetManifestText)
const PLATFORM_SPEC_FILE = new URL('../knowledge/cases/platform_film_ip_card_interaction_v2/case-package.json', import.meta.url)
const platformSpec = JSON.parse(await readFile(PLATFORM_SPEC_FILE, 'utf8'))

test('九门黄金案例包通过结构与语义校验', () => {
  const result = validateCasePackage(data)
  assert.deepEqual(result.errors, [])
})

test('九门案例保留关键事实和缺口边界', () => {
  assert.equal(data.tasks.length, 15)
  assert.equal(data.card_tiers.length, 5)
  assert.equal(data.card_tiers.reduce((sum, tier) => sum + tier.card_count, 0), 49)
  assert.equal(data.card_tiers.some((tier) => tier.code === 'SF'), false)
  assert.equal(data.metrics.length, 0)
  assert.equal(data.case.business_goal, null)
  assert.equal(data.case.activity_period.confirmation, 'pending')
})

test('其他活动参考不会被当作九门最终设计', () => {
  const reference = data.assets.find((asset) => asset.id === 'asset_yong_ye_reference')
  assert.equal(reference.role, 'other_activity_reference')
  assert.equal(reference.finality, 'reference_only')
  assert.ok(data.gaps.some((gap) => gap.field === 'assets.final_design' && gap.status === 'open'))
})

test('九门主视觉图片已下载且清单不保存临时凭证', async () => {
  const keyArt = data.assets.find((asset) => asset.id === 'asset_jiu_men_key_art')
  assert.equal(keyArt.variants.length, 2)
  assert.equal(assetManifest.collection_summary.downloaded, 2)
  assert.doesNotMatch(assetManifestText, /authcode=|pwd=|提取码[：:]?\s*[A-Za-z0-9]/i)
  for (const variant of keyArt.variants) {
    await access(new URL(`../knowledge/cases/film_jiu_men_card_2026/${variant.local_path}`, import.meta.url))
    await access(new URL(`../knowledge/cases/film_jiu_men_card_2026/${variant.thumbnail_path}`, import.meta.url))
  }
})

test('影视IP抽卡Figma规范包通过结构与语义校验', () => {
  const result = validateCasePackage(platformSpec)
  assert.deepEqual(result.errors, [])
  assert.equal(platformSpec.case.case_type, 'platform_spec')
  assert.equal(platformSpec.manifest.package_status, 'candidate')
})

test('Figma演示内容不会被当作已上线业务配置', () => {
  assert.equal(platformSpec.tasks.length, 0)
  assert.equal(platformSpec.card_tiers.length, 0)
  assert.equal(platformSpec.metrics.length, 0)
  const demo = platformSpec.assets.find((asset) => asset.id === 'asset_demo_ip_visuals')
  assert.equal(demo.role, 'other_activity_reference')
  assert.equal(demo.finality, 'reference_only')
  assert.ok(platformSpec.gaps.some((gap) => gap.field === 'business_configuration' && gap.status === 'open'))
})

test('Figma规范包包含四轮本地视觉证据', async () => {
  const boardAssets = platformSpec.assets.filter((asset) => asset.asset_type === 'figma_board_screenshot')
  assert.equal(boardAssets.length, 4)
  for (const asset of boardAssets) {
    await access(new URL(`../knowledge/cases/platform_film_ip_card_interaction_v2/${asset.local_path}`, import.meta.url))
  }
})
