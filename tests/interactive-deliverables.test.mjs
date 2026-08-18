import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DOCUMENTED_ACTIVITY_MATERIALS,
  DOCUMENTED_ACTIVITY_PAGES,
  DOCUMENTED_ACTIVITY_CASES,
  documentedActivityLabels,
  documentedImageCanvases,
} from '../src/modules/vibecoding/components/DocumentedActivityData.ts'
import { INTERACTIVE_DELIVERABLE_CONTRACTS } from '../src/modules/vibecoding/components/InteractiveDeliverableContracts.ts'
import {
  PAGE_EDITOR_NODES,
  createDocumentedPageEditorState,
  pageEditorBreadcrumb,
} from '../src/modules/vibecoding/components/DocumentedPageEditorState.ts'
import {
  ASSET_ONLY_PROJECTS,
  ASSET_LIBRARY_LABEL,
  FINISHED_PAGES_LABEL,
  H5_GAMEPLAY_CONFIG_LABEL,
  PROJECT_DOCUMENT_LABEL,
  buildProductView,
} from '../src/modules/vibecoding/components/ProjectProductView.ts'

const interactiveDeliverables = Object.values(DOCUMENTED_ACTIVITY_CASES)
  .flatMap((activityCase) => activityCase.deliverables)
  .filter((item) => /^(?:H5|Lynx)\b/.test(item.label) || /^(?:H5|Lynx)\b/.test(item.surface))

test('page editor selection maps real page nodes to contextual fields', () => {
  const ids = PAGE_EDITOR_NODES.map((node) => node.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(ids, [
    'page',
    'hero',
    'title',
    'subtitle',
    'primaryAction',
    'navigation',
    'content',
    'footer',
  ])
  assert.deepEqual(pageEditorBreadcrumb('title'), ['页面实例', '主视觉区', '主标题'])
  assert.deepEqual(pageEditorBreadcrumb('primaryAction'), ['页面实例', '主要按钮'])
  assert.equal(PAGE_EDITOR_NODES.find((node) => node.id === 'title')?.field, 'title')
  assert.equal(PAGE_EDITOR_NODES.find((node) => node.id === 'subtitle')?.field, 'subtitle')
  assert.equal(PAGE_EDITOR_NODES.find((node) => node.id === 'primaryAction')?.field, 'cta')
})

test('documented page editors start from real page copy instead of generic deliverable metadata', () => {
  const activityCase = Object.values(DOCUMENTED_ACTIVITY_CASES).find(
    (candidate) => candidate.code === 'CASE-UGC-SUMMER-2026',
  )
  assert.ok(activityCase)
  const item = activityCase.deliverables.find((candidate) => candidate.id === 'DLV-XIA-001')
  assert.ok(item)

  const state = createDocumentedPageEditorState(activityCase, item)
  assert.equal(state.title, '这夏夯爆了')
  assert.equal(state.subtitle, '6.30—8.31 · 夏日玩水季')
  assert.equal(state.cta, '抽夏日装备')
})

test('every H5 and Lynx deliverable defines its own runnable experience contract', () => {
  assert.equal(interactiveDeliverables.length, 14)

  interactiveDeliverables.forEach((item) => {
    const contract = INTERACTIVE_DELIVERABLE_CONTRACTS[item.id]
    assert.ok(contract, `${item.label} is missing an interactive contract`)
    assert.equal(contract.id, item.id)
    assert.ok(contract.experience.length >= 8, `${item.label} has no clear experience goal`)
    assert.ok(contract.primaryAction.includes('→'), `${item.label} has no closed-loop action path`)
    assert.ok(contract.completion.length >= 8, `${item.label} has no completion feedback`)
    assert.ok(contract.states.length >= 3, `${item.label} exposes too few meaningful states`)
    assert.ok(contract.unverified.length >= 1, `${item.label} must declare unverified business data`)
  })
})

test('interactive contracts never invent a page for image-only projects', () => {
  const interactiveIds = new Set(interactiveDeliverables.map((item) => item.id))
  assert.deepEqual(
    Object.keys(INTERACTIVE_DELIVERABLE_CONTRACTS).filter((id) => !interactiveIds.has(id)),
    [],
  )
})

test('image deliverables keep complete category groups for explicit canvas editing', () => {
  Object.values(DOCUMENTED_ACTIVITY_CASES).forEach((activityCase) => {
    const canvases = documentedImageCanvases(activityCase)
    const imageDeliverables = activityCase.deliverables.filter((item) => item.category !== '页面')

    assert.ok(canvases.length >= 1, `${activityCase.projectName} should retain canvas-editing groups`)
    const groupedIds = canvases.flatMap((canvas) => canvas.items.map((item) => item.id))
    assert.equal(new Set(groupedIds).size, groupedIds.length, `${activityCase.projectName} contains duplicate image items`)
    assert.deepEqual(groupedIds.sort(), imageDeliverables.map((item) => item.id).sort())
  })
})

test('documented activity navigation exposes one material library node, not canvas nodes', () => {
  Object.values(DOCUMENTED_ACTIVITY_CASES).forEach((activityCase) => {
    const labels = documentedActivityLabels(activityCase.projectName)
    assert.equal(labels[0], DOCUMENTED_ACTIVITY_PAGES)
    assert.equal(labels[1], DOCUMENTED_ACTIVITY_MATERIALS)
    assert.equal(labels.includes('交付总览'), false)
    documentedImageCanvases(activityCase).forEach((canvas) => {
      assert.equal(labels.includes(canvas.label), false)
    })
    activityCase.deliverables
      .filter((item) => item.category === '页面')
      .forEach((item) => assert.ok(labels.includes(item.label)))
  })
})

test('marketing projects expose page editing and tools while the project row owns preview', () => {
  assert.deepEqual(
    buildProductView([{ name: 'deliverables', type: 'dir', children: [{ name: '资源位 · Banner', type: 'file' }] }], 'marketing-h5'),
    [
      { name: FINISHED_PAGES_LABEL, type: 'file' },
      { name: PROJECT_DOCUMENT_LABEL, type: 'file' },
      { name: H5_GAMEPLAY_CONFIG_LABEL, type: 'file' },
      { name: ASSET_LIBRARY_LABEL, type: 'file' },
    ],
  )
})

test('design-asset projects expose only project docs and the asset library', () => {
  ASSET_ONLY_PROJECTS.forEach((projectName) => {
    const productView = buildProductView(
      [{ name: 'assets', type: 'dir', children: [] }],
      'marketing-h5',
      projectName,
    )
    assert.deepEqual(productView, [
      { name: PROJECT_DOCUMENT_LABEL, type: 'file' },
      { name: ASSET_LIBRARY_LABEL, type: 'file' },
    ])
    assert.equal(productView.some((item) => item.name === FINISHED_PAGES_LABEL), false)
    assert.equal(productView.some((item) => item.name === H5_GAMEPLAY_CONFIG_LABEL), false)
  })
})
