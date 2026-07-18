import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../public/garuda/cloudflare/leaderboard-worker.js'

function createEnv(seedScores = []) {
  const scores = seedScores.map((score) => ({ ...score }))
  const submissions = []
  return {
    scores,
    DB: {
      prepare(sql) {
        return {
          args: [],
          bind(...args) {
            this.args = args
            return this
          },
          async first() {
            if (sql.includes('COUNT(*)')) return { total: 0 }
            return null
          },
          async all() {
            const sorted = [...scores].sort(
              (a, b) =>
                b.score - a.score ||
                b.wave - a.wave ||
                String(a.created_at).localeCompare(String(b.created_at)),
            )
            return { results: sorted.slice(0, this.args[0] ?? sorted.length) }
          },
          async run() {
            if (sql.startsWith('INSERT INTO submissions')) {
              submissions.push({ ipHash: this.args[0], createdAt: this.args[1] })
            } else if (sql.startsWith('INSERT INTO scores')) {
              scores.push({
                id: this.args[0],
                name: this.args[1],
                score: this.args[2],
                wave: this.args[3],
                created_at: this.args[4],
              })
            } else if (sql.startsWith('DELETE FROM scores')) {
              const index = scores.findIndex((score) => score.id === this.args[0])
              if (index >= 0) scores.splice(index, 1)
            }
            return { success: true }
          },
        }
      },
    },
  }
}

test('leaderboard only reflects approved origins', async () => {
  const env = createEnv()
  const denied = await worker.fetch(
    new Request('https://leaderboard.test/scores', {
      headers: { Origin: 'https://evil.test' },
    }),
    env,
  )
  assert.equal(denied.status, 403)
  assert.equal(denied.headers.get('access-control-allow-origin'), null)

  const allowed = await worker.fetch(
    new Request('https://leaderboard.test/scores', {
      headers: { Origin: 'http://localhost:5173' },
    }),
    env,
  )
  assert.equal(allowed.status, 200)
  assert.equal(
    allowed.headers.get('access-control-allow-origin'),
    'http://localhost:5173',
  )
})

test('leaderboard rejects invalid score payloads', async () => {
  const response = await worker.fetch(
    new Request('https://leaderboard.test/scores', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '127.0.0.1',
      },
      body: JSON.stringify({ name: 'pilot', score: 100_000_001, wave: 1 }),
    }),
    createEnv(),
  )
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /score and wave/i)
})

test('leaderboard assigns the record id server-side', async () => {
  const env = createEnv()
  const response = await worker.fetch(
    new Request('https://leaderboard.test/scores', {
      method: 'POST',
      headers: {
        Origin: 'http://localhost:5173',
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '127.0.0.1',
      },
      body: JSON.stringify({
        id: 'attacker-controlled-id',
        name: '<pilot>',
        score: 1234,
        wave: 7,
      }),
    }),
    env,
  )
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.saved, true)
  assert.notEqual(body.entry.id, 'attacker-controlled-id')
  assert.match(body.entry.id, /^[0-9a-f-]{36}$/i)
  assert.equal(env.scores[0].name, 'pilot')
})
