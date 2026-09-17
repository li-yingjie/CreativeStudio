import { spawn } from 'node:child_process'

const DEFAULT_DOCUMENT_TOKEN = 'KIkmdQBwdo8Ilmx7vzpcZKEwnjg'
const DEFAULT_DOCUMENT_URL = `https://bytedance.larkoffice.com/docx/${DEFAULT_DOCUMENT_TOKEN}`
const MAX_DOCUMENT_BYTES = 6 * 1024 * 1024
const FETCH_TIMEOUT_MS = 20_000
const CACHE_TTL_MS = 60_000
let cachedAnalysis = null

function decodeXml(value) {
  return String(value || '')
    .replace(/&#xA;/gi, '\n')
    .replace(/&#10;/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function plainText(value) {
  return decodeXml(String(value || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function blocksById(xml) {
  const blocks = new Map()
  const leafPattern = /<(p|h1|h2|h3)\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi
  for (const match of xml.matchAll(leafPattern)) blocks.set(match[2], plainText(match[3]))
  const containerPattern = /<(li|blockquote)\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi
  for (const match of xml.matchAll(containerPattern)) {
    if (!blocks.has(match[2])) blocks.set(match[2], plainText(match[3]))
  }
  return blocks
}

function tables(xml) {
  const result = []
  const pattern = /<table\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/table>/gi
  for (const match of xml.matchAll(pattern)) {
    const rows = []
    for (const row of match[2].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((cell) => plainText(cell[1]))
      if (cells.length) rows.push(cells)
    }
    result.push({ id: match[1], text: plainText(match[2]), rows })
  }
  return result
}

function firstNumber(value, fallback = 0) {
  const match = String(value || '').match(/\d+/)
  return match ? Number(match[0]) : fallback
}

function isoDateRange(text, year = 2026) {
  const match = String(text || '').match(/(\d{1,2})\s*[/.月-]\s*(\d{1,2})\s*(?:日)?\s*[-–—至]\s*(\d{1,2})\s*[/.月-]\s*(\d{1,2})/)
  if (!match) return null
  const pad = (value) => String(value).padStart(2, '0')
  return {
    startAt: `${year}-${pad(match[1])}-${pad(match[2])}T00:00`,
    endAt: `${year}-${pad(match[3])}-${pad(match[4])}T23:59`,
  }
}

function source(documentUrl, blockId, text) {
  return {
    blockId,
    text,
    url: blockId ? `${documentUrl}#${blockId}` : documentUrl,
  }
}

export function analyzeActivityDocument(xml, metadata = {}) {
  const blockMap = blocksById(xml)
  const tableList = tables(xml)
  const documentUrl = metadata.url || DEFAULT_DOCUMENT_URL
  const titleMatch = xml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  const title = plainText(titleMatch?.[1]) || '活动玩法文档'

  const activityTimeText = blockMap.get('Nz5PdhHdfoNNA6xqs7fc7aWwn5e') || plainText(xml).match(/活动时间[^。；]*/)?.[0] || ''
  const schedule = isoDateRange(activityTimeText)

  const themeTable = tableList.find((table) => table.text.includes('合作方') && table.text.includes('在线时间'))
  const themes = (themeTable?.rows || [])
    .filter((row) => row.some((cell) => /\d{1,2}\/\d{1,2}\s*[-–—]\s*\d{1,2}\/\d{1,2}/.test(cell)))
    .map((row) => ({
      name: row[0] || '未命名主题',
      scene: row[1] || '',
      partner: row[2] || '',
      schedule: row[3] || '',
    }))

  const cardStatement = blockMap.get('Q3Zvd1RVPoKrz6xoALccHui7nQh') || ''
  const declaredCardCount = firstNumber(cardStatement)
  const cardTable = tableList.find((table) => table.text.includes('卡片名称') && table.text.includes('卡片文案'))
  const listedCardRows = (cardTable?.rows || []).filter((row, index) => index > 0 && row[3] && row[3] !== '卡片名称')
  const listedCardCount = listedCardRows.length

  const tierStatement = cardStatement.match(/集齐([^。；]+)/)?.[1] || cardStatement
  const tierNumbers = [...tierStatement.matchAll(/(\d+)\s*[、,，]?/g)]
    .map((match) => Number(match[1]))
    .filter((value, index, values) => value > 0 && value <= 20 && values.indexOf(value) === index)
  const tierTable = tableList.find((table) => table.text.includes('集齐装备数') && table.text.includes('对应奖励'))
  const tableTierNumbers = (tierTable?.rows || [])
    .map((row) => firstNumber(row[0]))
    .filter(Boolean)
  const parsedTiers = tierNumbers.length >= 2 ? tierNumbers : tableTierNumbers

  const postLimitText = blockMap.get('MviGd7giZo11EDxiB0fcfQron5f') || ''
  const postRewardText = blockMap.get('Km0ida6LzoCy1YxSx1hc6YqRnze') || ''
  const lightLimitText = blockMap.get('R0w2dbmnFoWfA6x6CXOcBkeanig') || ''
  const lightRewardText = blockMap.get('SNemdE6LvopRJ4xNT26cUX1HnEb') || ''
  const giftLimitText = blockMap.get('BLVJdZbP1oRiw2xhyQAcxQWQnvP') || ''
  const giftRewardText = blockMap.get('Rphndcx96ogGezxTqD4cXAPlnnb') || ''
  const goldLightLimitText = blockMap.get('MFqEd2XhxoKbphxwUfgcQAkwnxd') || ''

  const changes = [
    schedule
      ? {
          id: 'activity-schedule',
          kind: 'schedule',
          title: '活动周期',
          value: schedule,
          confidence: 0.99,
          source: source(documentUrl, 'Nz5PdhHdfoNNA6xqs7fc7aWwn5e', activityTimeText),
        }
      : null,
    postLimitText
      ? {
          id: 'task-post',
          kind: 'task',
          title: '投稿任务',
          targetId: 'post',
          value: { dailyLimit: firstNumber(postLimitText, 3), reward: firstNumber(postRewardText, 2) },
          confidence: 0.98,
          source: source(documentUrl, 'MviGd7giZo11EDxiB0fcfQron5f', `${postRewardText}；${postLimitText}`),
        }
      : null,
    lightLimitText
      ? {
          id: 'task-poi-light',
          kind: 'task',
          title: '商家点亮任务',
          targetId: 'poi-light',
          value: {
            dailyLimit: firstNumber(lightLimitText, 10),
            reward: firstNumber(lightRewardText, 1),
            create: true,
          },
          confidence: 0.98,
          source: source(documentUrl, 'R0w2dbmnFoWfA6x6CXOcBkeanig', `${lightRewardText}；${lightLimitText}`),
        }
      : null,
    giftLimitText
      ? {
          id: 'task-gift',
          kind: 'task',
          title: '赠送任务',
          targetId: 'gift',
          value: { dailyLimit: firstNumber(giftLimitText, 3), reward: firstNumber(giftRewardText, 1) },
          confidence: 0.98,
          source: source(documentUrl, 'BLVJdZbP1oRiw2xhyQAcxQWQnvP', `${giftRewardText}；${giftLimitText}`),
        }
      : null,
    parsedTiers.length
      ? {
          id: 'collection-tiers',
          kind: 'tiers',
          title: '集卡奖励门槛',
          value: { needs: parsedTiers },
          confidence: 0.96,
          blocked: /xx元/.test(tierTable?.text || ''),
          blockedReason: /xx元/.test(tierTable?.text || '') ? '奖励金额仍是占位符，不能生成可履约配置' : '',
          source: source(documentUrl, 'Q3Zvd1RVPoKrz6xoALccHui7nQh', cardStatement),
        }
      : null,
  ].filter(Boolean)

  const conflicts = []
  if (declaredCardCount && listedCardCount && declaredCardCount !== listedCardCount) {
    conflicts.push({
      id: 'card-count-conflict',
      severity: 'blocking',
      title: '装备数量存在冲突',
      description: `正文写“${declaredCardCount}种装备”，卡片表实际列出 ${listedCardCount} 项。`,
      options: [`按正文使用 ${declaredCardCount} 种`, `按卡片表使用 ${listedCardCount} 种`, '返回飞书修改'],
      sources: [
        source(documentUrl, 'Q3Zvd1RVPoKrz6xoALccHui7nQh', cardStatement),
        source(documentUrl, cardTable?.id || '', `卡片表共 ${listedCardCount} 项`),
      ],
    })
  }
  if (lightLimitText && goldLightLimitText && firstNumber(lightLimitText) !== firstNumber(goldLightLimitText)) {
    conflicts.push({
      id: 'light-limit-conflict',
      severity: 'warning',
      title: '两条玩法回路的点亮上限不同',
      description: `集装备玩法为每日 ${firstNumber(lightLimitText)} 次，金豆玩法为每日 ${firstNumber(goldLightLimitText)} 次，需要明确是否分别计数。`,
      options: ['两条玩法分别计数', '统一使用同一上限', '返回飞书补充说明'],
      sources: [
        source(documentUrl, 'R0w2dbmnFoWfA6x6CXOcBkeanig', lightLimitText),
        source(documentUrl, 'MFqEd2XhxoKbphxwUfgcQAkwnxd', goldLightLimitText),
      ],
    })
  }
  if (/xx元/.test(tierTable?.text || '')) {
    conflicts.push({
      id: 'reward-placeholder',
      severity: 'blocking',
      title: '奖励金额尚未确定',
      description: '四档奖励仍写为“xx元优惠券”，可以识别门槛，但不能绑定真实奖品。',
      options: ['暂不更新奖励档位', '返回飞书补齐金额'],
      sources: [source(documentUrl, tierTable?.id || '', '奖励档位表仍包含 xx 元占位符')],
    })
  }

  const goalText = blockMap.get('VjfodylpfouDVFxoCD3cDpsen1b') || ''
  const lifecycleText = blockMap.get('OxA3dMEI0oGl3kxCcn3cTD1nnph') || ''
  return {
    document: {
      token: metadata.token || DEFAULT_DOCUMENT_TOKEN,
      url: documentUrl,
      title,
      revision: Number(metadata.revision || 0),
      fetchedAt: metadata.fetchedAt || new Date().toISOString(),
    },
    summary: {
      goal: goalText || '以生服 UGC 投稿增长、作者拉新与活动后留存为核心目标。',
      schedule,
      themes,
      loops: [
        { id: 'collection', name: '分阶段集装备', route: '任务 → 抽装备 → 集齐兑换', detected: plainText(xml).includes('集碎片') || plainText(xml).includes('集卡') },
        { id: 'gold-bean', name: '长期金豆玩法', route: '任务 → 挖金豆 → 主端兑换', detected: plainText(xml).includes('赚金豆') },
      ],
      lifecycle: lifecycleText || '活动结束后承接新作者及回流作者的投稿留存。',
      declaredCardCount,
      listedCardCount,
    },
    changes,
    conflicts,
  }
}

function snapshotAnalysis(reason = '') {
  const xml = `<title>「这夏夯爆了」生服UGC暑期活动方案</title>
    <p id="VjfodylpfouDVFxoCD3cDpsen1b">目标日均4万条生服UGC投稿，周期内252万条，撬动84万作者，其中新作者至少26万。</p>
    <p id="Nz5PdhHdfoNNA6xqs7fc7aWwn5e">活动时间：6/30-8/31</p>
    <p id="Q3Zvd1RVPoKrz6xoALccHui7nQh">奖励设计：设计有9种装备，4档奖励。用户集齐2、4、6、9种装备即可领取对应奖励。</p>
    <p id="Km0ida6LzoCy1YxSx1hc6YqRnze">2次抽装备机会，新作者额外1次</p><p id="MviGd7giZo11EDxiB0fcfQron5f">单日上限3次</p>
    <p id="SNemdE6LvopRJ4xNT26cUX1HnEb">1次抽装备机会</p><p id="R0w2dbmnFoWfA6x6CXOcBkeanig">单日上限10次</p>
    <p id="Rphndcx96ogGezxTqD4cXAPlnnb">1次抽装备机会</p><p id="BLVJdZbP1oRiw2xhyQAcxQWQnvP">单日上限3次</p>
    <p id="MFqEd2XhxoKbphxwUfgcQAkwnxd">单日上限1次</p>
    <p id="OxA3dMEI0oGl3kxCcn3cTD1nnph">目的：提升新作者及回流作者在活动结束后的投稿留存。</p>
    <table id="UlPpdZsrYoxzTQx1XClcDPObnIc"><tr><th>主题</th><th>场景</th><th>合作方</th><th>在线时间</th></tr><tr><td>一起去玩水</td><td>玩水</td><td>玩水季</td><td>06/30-08/31</td></tr><tr><td>一起去干饭</td><td>美食</td><td>夜食指南</td><td>07/20-08/31</td></tr><tr><td>一起去遛娃</td><td>亲子</td><td>海底小纵队</td><td>08/11-08/31</td></tr></table>
    <table id="IM8jdpFtGobTUdxIlpAcMRIznjA"><tr><th>序号</th><th>类型</th><th>元素</th><th>卡片名称</th><th>卡片文案</th></tr>${Array.from({ length: 10 }, (_, index) => `<tr><td>${index + 1}</td><td>装备</td><td>元素</td><td>装备${index + 1}</td><td>文案</td></tr>`).join('')}</table>
    <table id="Nq4Qdu9L6oivkQxWFLEcPboKnb2"><tr><th>集齐装备数</th><th>对应奖励</th></tr><tr><td>2种</td><td>xx元优惠券</td></tr><tr><td>4种</td><td>xx元优惠券</td></tr><tr><td>6种</td><td>xx元优惠券</td></tr><tr><td>9种</td><td>xx元优惠券</td></tr></table>
    <p>集卡与集碎片玩法；暑期主线玩法：赚金豆。</p>`
  return {
    ...analyzeActivityDocument(xml, {
      token: DEFAULT_DOCUMENT_TOKEN,
      url: DEFAULT_DOCUMENT_URL,
      revision: 5280,
      fetchedAt: new Date().toISOString(),
    }),
    syncMode: 'snapshot',
    warning: reason ? `实时读取不可用，已展示 Revision 5280 基线快照：${reason}` : '展示 Revision 5280 基线快照',
  }
}

function fetchDocument(token) {
  return new Promise((resolve, reject) => {
    const child = spawn('lark-cli', ['docs', '+fetch', '--doc', token, '--detail', 'with-ids', '--as', 'user'], {
      env: {
        ...process.env,
        LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1',
        LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (error, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (error) reject(error)
      else resolve(value)
    }
    const append = (current, chunk) => {
      const next = current + chunk.toString('utf8')
      if (Buffer.byteLength(next) > MAX_DOCUMENT_BYTES) {
        child.kill('SIGKILL')
        finish(new Error('document response exceeded size limit'))
      }
      return next
    }
    child.stdout.on('data', (chunk) => { stdout = append(stdout, chunk) })
    child.stderr.on('data', (chunk) => { stderr = append(stderr, chunk) })
    child.on('error', (error) => finish(error))
    child.on('close', (code) => {
      if (code !== 0) return finish(new Error(plainText(stderr) || `lark-cli exited with ${code}`))
      try {
        const envelope = JSON.parse(stdout)
        if (!envelope.ok) throw new Error(envelope.error?.message || 'failed to fetch document')
        finish(null, envelope.data.document)
      } catch (error) {
        finish(error)
      }
    })
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      finish(new Error('document fetch timed out'))
    }, FETCH_TIMEOUT_MS)
  })
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(body))
}

export async function handleActivityDocument(req, res) {
  const requestUrl = new URL(req.url || '/', 'http://local')
  const token = requestUrl.searchParams.get('token') || process.env.ACTIVITY_DOC_TOKEN || DEFAULT_DOCUMENT_TOKEN
  const allowedTokens = new Set(
    String(process.env.ACTIVITY_DOC_ALLOWED_TOKENS || DEFAULT_DOCUMENT_TOKEN)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  )
  if (!/^[A-Za-z0-9_-]{12,80}$/.test(token) || !allowedTokens.has(token)) {
    sendJson(res, 403, { ok: false, error: 'document token is not allowed' })
    return
  }

  if (
    requestUrl.searchParams.get('refresh') !== '1' &&
    cachedAnalysis?.token === token &&
    Date.now() - cachedAnalysis.createdAt < CACHE_TTL_MS
  ) {
    sendJson(res, 200, { ok: true, data: cachedAnalysis.data })
    return
  }

  try {
    const document = await fetchDocument(token)
    const analysis = analyzeActivityDocument(document.content, {
      token,
      url: `https://bytedance.larkoffice.com/docx/${token}`,
      revision: document.revision_id,
      fetchedAt: new Date().toISOString(),
    })
    const data = { ...analysis, syncMode: 'live' }
    cachedAnalysis = { token, createdAt: Date.now(), data }
    sendJson(res, 200, { ok: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    if (token === DEFAULT_DOCUMENT_TOKEN) {
      sendJson(res, 200, { ok: true, data: snapshotAnalysis(message) })
      return
    }
    sendJson(res, 502, { ok: false, error: 'failed to read activity document' })
  }
}
