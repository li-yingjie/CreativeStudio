import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  QIXI_GENERATION_REPLAY_SCRIPT,
  QIXI_REPLAY_COMPLETED_PATH,
} from '../src/modules/vibecoding/components/QixiGenerationReplayScript.ts'
import {
  DEFAULT_QIXI_PAGE_CONTENT,
  QIXI_PAGE_ELEMENT_IDS,
} from '../src/modules/vibecoding/components/QixiPageModel.ts'
import { QIXI_LEVEL_ONE_TARGETS } from '../src/modules/vibecoding/components/QixiBridgeData.ts'

const stepIds = new Set(QIXI_GENERATION_REPLAY_SCRIPT.map((step) => step.id))

test('Qixi replay keeps every choice and continuation target resolvable', () => {
  QIXI_GENERATION_REPLAY_SCRIPT.forEach((step) => {
    const targets = [
      step.nextTo,
      step.gate?.confirmTo,
      step.gate?.altTo,
      ...(step.gate?.choices ?? []).map((choice) => choice.to),
    ].filter(Boolean)

    targets.forEach((target) => {
      assert.ok(
        stepIds.has(target),
        `${step.id} points to missing step ${target}`,
      )
    })
  })

  assert.equal(
    QIXI_REPLAY_COMPLETED_PATH.every((index) => index >= 0),
    true,
  )
})

test('Qixi completed replay keeps exactly three user confirmations', () => {
  const completedIds = QIXI_REPLAY_COMPLETED_PATH.map(
    (index) => QIXI_GENERATION_REPLAY_SCRIPT[index].id,
  )
  const decisions = [
    'qixi-scope-complete-selected',
    'qixi-gameplay-baseline-selected',
    'qixi-visual-eastern-selected',
  ]

  decisions.forEach((id, index) => {
    assert.ok(completedIds.includes(id), `completed replay is missing ${id}`)
    if (index > 0) {
      assert.ok(
        completedIds.indexOf(id) > completedIds.indexOf(decisions[index - 1]),
        `${id} must appear after ${decisions[index - 1]}`,
      )
    }
  })

  assert.ok(completedIds.includes('qixi-wireframe-choice'))
  assert.ok(completedIds.includes('qixi-current-build'))
  assert.equal(
    QIXI_GENERATION_REPLAY_SCRIPT.filter((step) => step.gate).length,
    3,
  )
  assert.equal(
    QIXI_GENERATION_REPLAY_SCRIPT.find(
      (step) => step.id === 'qixi-wireframe-choice',
    )?.gate,
    undefined,
  )
  assert.ok(
    QIXI_GENERATION_REPLAY_SCRIPT.find(
      (step) => step.id === 'qixi-gameplay-choice',
    )?.gate,
  )
  assert.equal(
    QIXI_GENERATION_REPLAY_SCRIPT.find(
      (step) => step.id === 'qixi-audit-choice',
    )?.gate,
    undefined,
  )

  const hiddenInternalSteps = [
    'qixi-reward-choice',
    'qixi-audit-thinking',
    'qixi-sample-choice',
    'qixi-shell-feedback',
    'qixi-runtime-review-feedback',
    'qixi-component-edit-feedback',
  ]
  hiddenInternalSteps.forEach((id) => assert.ok(!completedIds.includes(id)))
  assert.equal(
    QIXI_REPLAY_COMPLETED_PATH.some(
      (index) => QIXI_GENERATION_REPLAY_SCRIPT[index].view.kind === 'think',
    ),
    false,
  )
})

test('Qixi confirmation gates provide three presets plus manual input', () => {
  ;['qixi-scope-choice', 'qixi-gameplay-choice', 'qixi-visual-choice'].forEach(
    (id) => {
      const choices =
        QIXI_GENERATION_REPLAY_SCRIPT.find((step) => step.id === id)?.gate
          ?.choices ?? []
      assert.equal(choices.filter((choice) => !choice.input).length, 3)
      assert.equal(choices.filter((choice) => choice.input).length, 1)
    },
  )

  const visualChoices =
    QIXI_GENERATION_REPLAY_SCRIPT.find(
      (step) => step.id === 'qixi-visual-choice',
    )?.gate?.choices ?? []
  assert.equal(
    visualChoices.filter((choice) => !choice.input && choice.preview).length,
    3,
  )
})

test('Qixi completed replay keeps the honest partial-visual status', () => {
  const completedText = QIXI_REPLAY_COMPLETED_PATH.map(
    (index) => QIXI_GENERATION_REPLAY_SCRIPT[index],
  )
    .map((step) =>
      step.view.kind === 'ai' || step.view.kind === 'user'
        ? step.view.text
        : '',
    )
    .join('\n')

  assert.match(completedText, /主 KV 与第 1 关|主 KV \+ 第 1 关/)
  assert.match(completedText, /其余 6 关/)
  assert.doesNotMatch(completedText, /交互灰模通过、视觉方向锁定/)
})

test('Qixi replay never hard-codes a disputed coupon amount into the adopted path', () => {
  const completedText = QIXI_REPLAY_COMPLETED_PATH.map(
    (index) => QIXI_GENERATION_REPLAY_SCRIPT[index],
  )
    .map((step) =>
      step.view.kind === 'ai' || step.view.kind === 'user'
        ? step.view.text
        : '',
    )
    .join('\n')

  assert.match(completedText, /未确认金额|奖励金额待业务确认/)
  assert.doesNotMatch(completedText, /按 Agent 推荐执行：.*(?:480|680)/)
})

test('Qixi keeps product implementation corrections out of the user replay', () => {
  const completedIds = QIXI_REPLAY_COMPLETED_PATH.map(
    (index) => QIXI_GENERATION_REPLAY_SCRIPT[index].id,
  )
  assert.ok(stepIds.has('qixi-shell-feedback'))
  assert.ok(stepIds.has('qixi-shell-applied'))
  assert.ok(!completedIds.includes('qixi-shell-feedback'))
  assert.ok(!completedIds.includes('qixi-shell-applied'))
})

test('Qixi document surface is user-facing, persistent and editable', () => {
  const completedIds = QIXI_REPLAY_COMPLETED_PATH.map(
    (index) => QIXI_GENERATION_REPLAY_SCRIPT[index].id,
  )
  const source = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/QixiReplayWorkspace.tsx',
      import.meta.url,
    ),
    'utf8',
  )

  assert.ok(!completedIds.includes('qixi-runtime-review-feedback'))
  assert.ok(!completedIds.includes('qixi-component-edit-feedback'))
  assert.match(source, /需求原文/)
  assert.match(source, /活动方案/)
  assert.match(source, /确认结果/)
  assert.match(source, /Markdown/)
  assert.match(source, /编辑/)
  assert.match(source, /localStorage/)
  assert.match(source, /mergeNewSections/)
  assert.doesNotMatch(source, /data-ref|DOM \/ 组件树|MagicX H5 Code Mode/)
})

test('Qixi replay reveals tabs by story stage and switches only for evidence or delivery', () => {
  const source = readFileSync(
    new URL(
      '../src/modules/vibecoding/components/VibeCodingPage.tsx',
      import.meta.url,
    ),
    'utf8',
  )

  assert.match(source, /if \(qixiReplayToken === 0\) return/)
  assert.match(source, /const hasGameplay = reached\(/)
  assert.match(source, /qixi-gameplay-baseline-selected/)
  assert.match(source, /stepId === 'qixi-visual-choice'/)
  assert.match(source, /ASSET_LIBRARY_LABEL/)
  assert.match(source, /stepId === 'qixi-current-result'/)
  assert.match(source, /\? '预览'/)
})

test('Qixi page editor exposes stable component-level targets instead of one page form', () => {
  assert.equal(QIXI_PAGE_ELEMENT_IDS.length, 18)
  assert.equal(new Set(QIXI_PAGE_ELEMENT_IDS).size, QIXI_PAGE_ELEMENT_IDS.length)
  ;[
    'hero.title',
    'bridge.primary',
    'bridge.lottery',
    'tasks.signin',
    'tasks.signin.action',
    'tasks.assist.action',
    'feed.action',
  ].forEach((id) => assert.ok(QIXI_PAGE_ELEMENT_IDS.includes(id)))

  assert.equal(DEFAULT_QIXI_PAGE_CONTENT.primaryLabel, '找喜鹊')
  assert.equal(DEFAULT_QIXI_PAGE_CONTENT.signInAction, '去签到')
  assert.equal(DEFAULT_QIXI_PAGE_CONTENT.assistAction, '去邀请')
  assert.notEqual(
    DEFAULT_QIXI_PAGE_CONTENT.primaryButtonBackground,
    DEFAULT_QIXI_PAGE_CONTENT.lotteryButtonBackground,
  )
})

test('Qixi level one hit areas stay aligned with all five baked magpies', () => {
  assert.equal(QIXI_LEVEL_ONE_TARGETS.length, 5)
  QIXI_LEVEL_ONE_TARGETS.forEach(({ x, y }) => {
    assert.ok(x > 0 && x < 100)
    assert.ok(y > 0 && y < 100)
  })
  assert.ok(QIXI_LEVEL_ONE_TARGETS[2].x > 80, 'upper-right magpie drifted left')
  assert.ok(QIXI_LEVEL_ONE_TARGETS[4].x > 85, 'lower-right magpie drifted left')
})
