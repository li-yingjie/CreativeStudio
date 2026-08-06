import assert from 'node:assert/strict'
import test from 'node:test'

import { classifyProjectKind } from '../src/modules/vibecoding/components/project-kind-classifier.ts'

test('project kind classifier keeps web surfaces distinct', () => {
  assert.equal(classifyProjectKind('做一个作品展示网站'), 'web-app')
  assert.equal(classifyProjectKind('build a web dashboard'), 'web-app')
  assert.equal(classifyProjectKind('做一个网页游戏'), 'web-game')
  assert.equal(classifyProjectKind('做个消消乐游戏'), 'web-game')
  assert.equal(classifyProjectKind('做一个七夕营销 H5 落地页'), 'marketing-h5')
})

test('project kind classifier preserves other product families', () => {
  assert.equal(classifyProjectKind('做一个陪聊 AI 分身'), 'ai-avatar')
  assert.equal(classifyProjectKind('做一个微信小程序'), 'mini-program')
  assert.equal(classifyProjectKind('整理一份运营复盘报告'), 'ops-proposal')
})
