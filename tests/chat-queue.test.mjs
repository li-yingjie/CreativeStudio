import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildChatQueueHistory,
  isChatQueueTurnActive,
} from '../src/shared/api/chat-queue.ts'

const turns = [
  { id: 'first', text: '第一问', includeInAiHistory: true },
  { id: 'scripted', text: '发布', includeInAiHistory: false },
  { id: 'second', text: '第二问', includeInAiHistory: true },
]

test('chat queue serializes AI-backed turns and waits through failures', () => {
  const replies = new Map()
  assert.equal(isChatQueueTurnActive(turns, 0, (id) => replies.has(id)), true)
  assert.equal(isChatQueueTurnActive(turns, 2, (id) => replies.has(id)), false)

  // A failed turn remains uncached, so later work stays queued until retry succeeds.
  assert.equal(isChatQueueTurnActive(turns, 2, (id) => replies.has(id)), false)
  replies.set('first', '第一答')
  assert.equal(isChatQueueTurnActive(turns, 2, (id) => replies.has(id)), true)
})

test('promoted turn includes the previous assistant reply', () => {
  const history = buildChatQueueHistory(
    { role: 'system', content: 'system' },
    turns,
    2,
    (id) => (id === 'first' ? '第一答' : undefined),
  )

  assert.deepEqual(history, [
    { role: 'system', content: 'system' },
    { role: 'user', content: '第一问' },
    { role: 'assistant', content: '第一答' },
    { role: 'user', content: '第二问' },
  ])
})
