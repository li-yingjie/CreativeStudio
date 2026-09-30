import assert from 'node:assert/strict'
import test from 'node:test'
import { analyzeActivityDocument } from '../server/activity-doc.mjs'

test('activity document analysis keeps sources and detects contradictions', () => {
  const xml = `<title>测试活动</title>
    <p id="Nz5PdhHdfoNNA6xqs7fc7aWwn5e">活动时间：6/30-8/31</p>
    <p id="Q3Zvd1RVPoKrz6xoALccHui7nQh">设计有9种装备，用户集齐2、4、6、9种装备可领奖。</p>
    <p id="Km0ida6LzoCy1YxSx1hc6YqRnze">2次抽装备机会</p>
    <p id="MviGd7giZo11EDxiB0fcfQron5f">单日上限3次</p>
    <p id="SNemdE6LvopRJ4xNT26cUX1HnEb">1次抽装备机会</p>
    <p id="R0w2dbmnFoWfA6x6CXOcBkeanig">单日上限10次</p>
    <p id="MFqEd2XhxoKbphxwUfgcQAkwnxd">单日上限1次</p>
    <table id="cards"><tr><th>序号</th><th>类型</th><th>元素</th><th>卡片名称</th><th>卡片文案</th></tr>${Array.from({ length: 10 }, (_, index) => `<tr><td>${index + 1}</td><td>装备</td><td>元素</td><td>卡${index + 1}</td><td>文案</td></tr>`).join('')}</table>
    <table id="tiers"><tr><th>集齐装备数</th><th>对应奖励</th></tr><tr><td>2种</td><td>xx元优惠券</td></tr></table>
    <p>集卡玩法；赚金豆。</p>`

  const result = analyzeActivityDocument(xml, { revision: 12, url: 'https://example.test/docx/demo' })
  assert.equal(result.document.revision, 12)
  assert.deepEqual(result.summary.schedule, {
    startAt: '2026-06-30T00:00',
    endAt: '2026-08-31T23:59',
  })
  assert.equal(result.summary.listedCardCount, 10)
  assert.ok(result.conflicts.some((item) => item.id === 'card-count-conflict'))
  assert.ok(result.conflicts.some((item) => item.id === 'light-limit-conflict'))
  assert.ok(result.changes.every((item) => item.source?.url))
})
