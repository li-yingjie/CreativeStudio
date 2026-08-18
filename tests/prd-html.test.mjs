import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const prdHtml = await readFile(new URL('../public/prd.html', import.meta.url), 'utf8')

test('interactive PRD exposes the complete decision narrative', () => {
  const requiredSections = [
    'opportunity',
    'system',
    'projects',
    'scope',
    'generation',
    'editor',
    'governance',
    'cases',
    'document',
    'roadmap',
    'sources',
  ]
  requiredSections.forEach((id) => assert.match(prdHtml, new RegExp(`id="${id}"`)))
  assert.match(prdHtml, /把创意生成，变成<em>可交付系统<\/em>/)
  assert.match(prdHtml, /三甬道不是三块界面/)
  assert.match(prdHtml, /ActivitySpec/)
  assert.match(prdHtml, /CompileRun/)
  assert.match(prdHtml, /项目不是都要长页面/)
  assert.match(prdHtml, /零页面/)
  assert.match(prdHtml, /operator-owned/)
  assert.match(prdHtml, /普通单层图片/)
  assert.match(prdHtml, /真实多图层图片/)
  assert.match(prdHtml, /Demo 尚未接真实 Registry、Bundle 与 Channel 服务/)
})

test('interactive PRD keeps evidence local and links its read-only source', () => {
  assert.match(prdHtml, /MPJhd2lOwofBHbxdzepcSB7Qnqe/)
  assert.match(prdHtml, /\/assets\/figma-deliverables\/acg\/discovery-banner-1372x512\.png/)
  assert.match(prdHtml, /\/assets\/ip-kits\/xinzai-2026\/03-3d-front\.png/)
  assert.doesNotMatch(prdHtml, /<script[^>]+src=/)
  assert.doesNotMatch(prdHtml, /<link[^>]+(?:stylesheet|preload)/)
})

test('interactive PRD provides review and accessibility controls', () => {
  assert.match(prdHtml, /data-filter="activity"/)
  assert.match(prdHtml, /role="tablist"/)
  assert.match(prdHtml, /data-lightbox-dialog/)
  assert.match(prdHtml, /<details class="spec-details"/)
  assert.match(prdHtml, /prefers-reduced-motion/)
  assert.match(prdHtml, /@media print/)
})
