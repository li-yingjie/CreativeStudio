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
  ASSET_LIBRARY_LABEL,
  H5_GAMEPLAY_CONFIG_LABEL,
  PROJECT_DOCUMENT_LABEL,
  buildProductView,
} from '../src/modules/vibecoding/components/ProjectProductView.ts'

const interactiveDeliverables = Object.values(DOCUMENTED_ACTIVITY_CASES)
  .flatMap((activityCase) => activityCase.deliverables)
  .filter((item) => /^(?:H5|Lynx)\b/.test(item.label) || /^(?:H5|Lynx)\b/.test(item.surface))

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

test('image deliverables are grouped into one to three complete material canvases', () => {
  Object.values(DOCUMENTED_ACTIVITY_CASES).forEach((activityCase) => {
    const canvases = documentedImageCanvases(activityCase)
    const imageDeliverables = activityCase.deliverables.filter((item) => item.category !== '页面')

    assert.ok(canvases.length >= 1 && canvases.length <= 3, `${activityCase.projectName} should expose 1–3 material canvases`)
    const groupedIds = canvases.flatMap((canvas) => canvas.items.map((item) => item.id))
    assert.equal(new Set(groupedIds).size, groupedIds.length, `${activityCase.projectName} contains duplicate image items`)
    assert.deepEqual(groupedIds.sort(), imageDeliverables.map((item) => item.id).sort())
  })
})

test('documented activity navigation separates finished pages from material canvases', () => {
  Object.values(DOCUMENTED_ACTIVITY_CASES).forEach((activityCase) => {
    const labels = documentedActivityLabels(activityCase.projectName)
    assert.equal(labels[0], DOCUMENTED_ACTIVITY_PAGES)
    assert.equal(labels[1], DOCUMENTED_ACTIVITY_MATERIALS)
    assert.equal(labels.includes('交付总览'), false)
    activityCase.deliverables
      .filter((item) => item.category === '页面')
      .forEach((item) => assert.ok(labels.includes(item.label)))
  })
})

test('marketing projects expose tools in the tree while the project row owns the finished-page entry', () => {
  assert.deepEqual(
    buildProductView([{ name: 'deliverables', type: 'dir', children: [{ name: '资源位 · Banner', type: 'file' }] }], 'marketing-h5'),
    [
      { name: PROJECT_DOCUMENT_LABEL, type: 'file' },
      { name: H5_GAMEPLAY_CONFIG_LABEL, type: 'file' },
      { name: ASSET_LIBRARY_LABEL, type: 'file' },
    ],
  )
})
