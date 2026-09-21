import assert from 'node:assert/strict'
import test from 'node:test'

import { ASSET_CATALOG } from '../src/modules/vibecoding/assets/assetCatalog.ts'
import {
  ACG_GENERATION_REPLAY_SCRIPT,
  ACG_REPLAY_COMPLETED_PATH,
} from '../src/modules/vibecoding/components/AcgGenerationReplayScript.ts'
import { ACG_NEW_YEAR_CASE } from '../src/modules/vibecoding/components/DocumentedActivityData.ts'

const stepIds = new Set(ACG_GENERATION_REPLAY_SCRIPT.map((step) => step.id))
const assetIds = new Set(ASSET_CATALOG.map((asset) => asset.id))
const deliverableIds = new Set(ACG_NEW_YEAR_CASE.deliverables.map((item) => item.id))
const workspaceCardIds = new Set(['activity-brief', 'activity-spec', 'delivery-matrix', 'delivery-overview'])

test('ACG generation replay keeps every branch target resolvable', () => {
  ACG_GENERATION_REPLAY_SCRIPT.forEach((step) => {
    const targets = [
      step.nextTo,
      step.gate?.confirmTo,
      step.gate?.altTo,
      ...((step.gate?.choices ?? []).map((choice) => choice.to)),
    ].filter(Boolean)

    targets.forEach((target) => {
      assert.ok(stepIds.has(target), `${step.id} points to missing step ${target}`)
    })
  })

  assert.equal(ACG_REPLAY_COMPLETED_PATH.every((index) => index >= 0), true)
})

test('ACG generation replay only links registered assets and real deliverables', () => {
  const cards = ACG_GENERATION_REPLAY_SCRIPT.flatMap((step) =>
    step.view.kind === 'ai' ? (step.view.cards ?? []) : [],
  )

  cards.forEach((card) => {
    if (!card.id) return
    if (card.id.startsWith('deliverable:')) {
      const deliverableId = card.id.slice('deliverable:'.length)
      assert.ok(
        deliverableIds.has(deliverableId),
        `${card.title} points to missing deliverable ${deliverableId}`,
      )
      return
    }

    assert.ok(
      assetIds.has(card.id) || workspaceCardIds.has(card.id),
      `${card.title} points to unregistered asset or workspace object ${card.id}`,
    )
  })
})

test('ACG completed replay resolves to the verified 18-item delivery matrix', () => {
  assert.equal(ACG_NEW_YEAR_CASE.deliverables.length, 18)
  assert.equal(new Set(ACG_NEW_YEAR_CASE.deliverables.map((item) => item.id)).size, 18)
})

test('ACG replay confirms understanding before recommending templates', () => {
  const completedIds = ACG_REPLAY_COMPLETED_PATH.map(
    (index) => ACG_GENERATION_REPLAY_SCRIPT[index].id,
  )
  assert.ok(completedIds.indexOf('acg-brief-ready') > completedIds.indexOf('acg-evidence-scan'))
  assert.ok(completedIds.indexOf('acg-brief-confirmed') < completedIds.indexOf('acg-template-choice'))
  assert.ok(completedIds.indexOf('acg-creative-input-choice') > completedIds.indexOf('acg-template-applied'))
  assert.ok(completedIds.indexOf('acg-spec-ready') > completedIds.indexOf('acg-creative-applied'))
})

test('ACG replay starts from one query and one planning document', () => {
  const userInputs = ACG_GENERATION_REPLAY_SCRIPT.filter(
    (step) => step.view.kind === 'user',
  )
  const sourceDocuments = ACG_GENERATION_REPLAY_SCRIPT.filter(
    (step) => step.view.kind === 'doc',
  )

  assert.equal(userInputs[0]?.id, 'acg-request')
  assert.deepEqual(sourceDocuments.map((step) => step.id), ['acg-source-plan'])
  assert.match(sourceDocuments[0].view.fileName, /活动策划\.docx$/)
  assert.doesNotMatch(sourceDocuments[0].view.fileName, /\.wiki$|\.fig$/)
})

test('ACG replay keeps the representative venue visible while the remaining batch runs', () => {
  const step = (id) => ACG_GENERATION_REPLAY_SCRIPT.find((item) => item.id === id)
  assert.equal(step('acg-generate-venues')?.target, 'activity-blueprint')
  assert.equal(step('acg-venues-ready')?.target, 'game-runtime')
  assert.equal(step('acg-generate-resources')?.target, 'game-runtime')
  assert.equal(step('acg-resource-batch-ready')?.target, 'delivery-overview')
})
