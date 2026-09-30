import { createHash } from 'node:crypto'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MIME_EXTENSIONS = new Map([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
])

function decodeXml(value = '') {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

export function parseAttributes(tag) {
  const attributes = {}
  for (const match of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) attributes[match[1]] = decodeXml(match[2])
  return attributes
}

function plainText(xml) {
  return decodeXml(xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function redactContext(value) {
  return value
    .replace(/https?:\/\/\S+/g, '[链接已省略]')
    .replace(/提取码\s*[:：]?\s*[\w-]+/gi, '提取码：[已省略]')
    .replace(/(?:authcode|code|pwd)\s*=\s*[\w-]+/gi, '凭证=[已省略]')
}

function nearbyContext(xml, index) {
  const fragment = xml.slice(Math.max(0, index - 1800), index)
  const tagBoundary = fragment.indexOf('>')
  const safeFragment = tagBoundary >= 0 ? fragment.slice(tagBoundary + 1) : fragment
  return redactContext(plainText(safeFragment)).slice(-360)
}

export function classifyImage(context, sourceBlockId = '') {
  if (/永夜星河|其他活动|参考案例|参考图|参考示意/.test(context)) {
    return { role: 'other_activity_reference', confidence: 0.9, reason: '上下文明确标记为其他活动或参考素材' }
  }
  if (/物料输出规范|物料示意图|命名规范|平台规范|实际输出尺寸/.test(context)) {
    return { role: 'platform_spec', confidence: 0.82, reason: '图片位于平台物料规格上下文' }
  }
  if (sourceBlockId === 'NzyNdyz3DsrE35bt1fBctJS5nme') {
    return { role: 'target_activity_asset', confidence: 0.88, reason: '图片位于九门卡片等级与卡名配置区块' }
  }
  if (/九门|群像|卡面|卡包/.test(context) && sourceBlockId === 'Swzjd3qsZsOrbAbGX48cToeonOg') {
    return { role: 'target_activity_asset', confidence: 0.72, reason: '目标活动素材同步块中出现九门素材语义' }
  }
  return { role: 'unknown', confidence: 0.3, reason: '仅凭文档上下文无法判断素材归属或最终性' }
}

export function extractDocumentMedia(xml, location) {
  const media = []
  for (const match of xml.matchAll(/<img\b[^>]*\/?\s*>/g)) {
    const attributes = parseAttributes(match[0])
    const mediaToken = attributes.token || attributes.src
    if (!mediaToken) continue
    const context = nearbyContext(xml, match.index)
    media.push({
      mediaToken,
      blockId: attributes.id || null,
      name: attributes.name || 'image',
      mimeType: attributes.mime || 'application/octet-stream',
      width: attributes['origin-width'] || attributes.width || null,
      height: attributes['origin-height'] || attributes.height || null,
      context,
      location,
      classification: classifyImage(context, location.sourceBlockId),
    })
  }
  return media
}

function extractSyncedReferences(xml) {
  return [...xml.matchAll(/<synced_reference\b[^>]*\/?\s*>/g)].map((match) => parseAttributes(match[0]))
}

async function runLark(args) {
  const { stdout } = await execFileAsync('lark-cli', args, {
    cwd: ROOT,
    env: {
      ...process.env,
      LARKSUITE_CLI_NO_UPDATE_NOTIFIER: '1',
      LARKSUITE_CLI_NO_SKILLS_NOTIFIER: '1',
    },
    maxBuffer: 64 * 1024 * 1024,
  })
  const payload = JSON.parse(stdout)
  if (payload.ok !== true) throw new Error(payload.error?.message || '飞书文档读取失败')
  return payload.data.document
}

async function fetchDocument(doc, blockId = null) {
  const args = ['docs', '+fetch', '--doc', doc, '--detail', 'full', '--doc-format', 'xml', '--as', 'user']
  if (blockId) args.push('--scope', 'range', '--start-block-id', blockId, '--end-block-id', blockId)
  return runLark(args)
}

async function collectDocumentTree(rootDoc) {
  const root = await fetchDocument(rootDoc)
  const documents = [{
    xml: root.content,
    documentId: root.document_id,
    revisionId: root.revision_id,
    sourceBlockId: null,
  }]
  const queue = extractSyncedReferences(root.content)
  const visited = new Set()

  while (queue.length) {
    const reference = queue.shift()
    const sourceToken = reference['src-token']
    const sourceBlockId = reference['src-block-id']
    const key = `${sourceToken}:${sourceBlockId}`
    if (!sourceToken || !sourceBlockId || visited.has(key)) continue
    visited.add(key)
    const fragment = await fetchDocument(sourceToken, sourceBlockId)
    documents.push({
      xml: fragment.content,
      documentId: fragment.document_id,
      revisionId: fragment.revision_id,
      sourceBlockId,
    })
    queue.push(...extractSyncedReferences(fragment.content))
  }
  return documents
}

function mediaId(item) {
  return `media_${createHash('sha256').update(`${item.location.documentId}:${item.blockId}:${item.mediaToken}`).digest('hex').slice(0, 16)}`
}

function safeExtension(mimeType) {
  return MIME_EXTENSIONS.get(mimeType.toLowerCase()) || '.bin'
}

async function downloadMedia(item, outputPath) {
  const relativeOutput = path.relative(ROOT, outputPath)
  await runLark(['docs', '+media-download', '--token', item.mediaToken, '--output', relativeOutput, '--as', 'user'])
}

async function createDerivedImages(originalPath, optimizedPath, thumbnailPath) {
  await mkdir(path.dirname(optimizedPath), { recursive: true })
  await mkdir(path.dirname(thumbnailPath), { recursive: true })
  if (!(await exists(optimizedPath))) {
    await execFileAsync('sips', ['-Z', '1600', originalPath, '--out', optimizedPath], { maxBuffer: 4 * 1024 * 1024 })
  }
  if (!(await exists(thumbnailPath))) {
    await execFileAsync('sips', ['-Z', '480', originalPath, '--out', thumbnailPath], { maxBuffer: 4 * 1024 * 1024 })
  }
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

function parseArgs(argv) {
  const values = new Map()
  const flags = new Set()
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (!argument.startsWith('--')) continue
    if (argument === '--download') flags.add(argument)
    else values.set(argument, argv[++index])
  }
  return {
    caseId: values.get('--case-id'),
    doc: values.get('--doc'),
    download: flags.has('--download'),
    maxAssets: Number(values.get('--max-assets') || 0),
    roles: (values.get('--roles') || '').split(',').filter(Boolean),
    sourceBlocks: (values.get('--source-blocks') || '').split(',').filter(Boolean),
  }
}

export async function collectCaseAssets({ caseId, doc, download = false, maxAssets = 0, roles = [], sourceBlocks = [] }) {
  if (!caseId || !doc) throw new Error('必须提供 --case-id 和 --doc')
  const caseDir = path.join(ROOT, 'knowledge', 'cases', caseId)
  const packagePath = path.join(caseDir, 'case-package.json')
  const packageData = JSON.parse(await readFile(packagePath, 'utf8'))
  const documents = await collectDocumentTree(doc)
  const deduplicated = new Map()

  for (const document of documents) {
    const location = {
      documentId: document.documentId,
      revisionId: document.revisionId,
      sourceBlockId: document.sourceBlockId,
    }
    for (const item of extractDocumentMedia(document.xml, location)) {
      if (!deduplicated.has(item.mediaToken)) deduplicated.set(item.mediaToken, item)
    }
  }

  const allMedia = [...deduplicated.values()]
  const originalsDir = path.join(caseDir, 'assets', 'originals')
  if (download) await mkdir(originalsDir, { recursive: true })
  const records = []
  const reviewGroups = new Map()
  let selectedDownloadCount = 0

  for (const item of allMedia) {
    const id = mediaId(item)
    const extension = safeExtension(item.mimeType)
    const localPath = path.join(originalsDir, `${id}${extension}`)
    const optimizedPath = path.join(caseDir, 'assets', 'optimized', `${id}${extension}`)
    const thumbnailPath = path.join(caseDir, 'assets', 'thumbnails', `${id}${extension}`)
    const roleSelected = roles.length === 0 || roles.includes(item.classification.role)
    const blockSelected = sourceBlocks.length === 0 || sourceBlocks.includes(item.location.sourceBlockId)
    const underLimit = maxAssets === 0 || selectedDownloadCount < maxAssets
    const shouldDownload = download && roleSelected && blockSelected && underLimit
    if (shouldDownload) selectedDownloadCount += 1
    let downloadStatus = shouldDownload ? 'pending' : (download ? 'not_selected' : 'not_requested')
    let downloadError = null
    let processingError = null
    if (shouldDownload) {
      try {
        if (!(await exists(localPath))) await downloadMedia(item, localPath)
        downloadStatus = 'downloaded'
        try {
          await createDerivedImages(localPath, optimizedPath, thumbnailPath)
        } catch (error) {
          processingError = error.message
        }
      } catch (error) {
        downloadStatus = 'failed'
        downloadError = error.message
      }
    }

    const record = {
      asset_id: id,
      name: item.name,
      media_type: 'image',
      mime_type: item.mimeType,
      dimensions: { width: item.width, height: item.height },
      role: item.classification.role,
      role_confidence: item.classification.confidence,
      finality: item.classification.role === 'other_activity_reference' ? 'reference_only' : 'unknown',
      local_path: downloadStatus === 'downloaded' ? path.relative(caseDir, localPath) : null,
      optimized_path: downloadStatus === 'downloaded' && !processingError ? path.relative(caseDir, optimizedPath) : null,
      thumbnail_path: downloadStatus === 'downloaded' && !processingError ? path.relative(caseDir, thumbnailPath) : null,
      source: {
        document_id: item.location.documentId,
        revision_id: item.location.revisionId,
        source_block_id: item.location.sourceBlockId,
        image_block_id: item.blockId,
        context: item.context,
        evidence_type: 'document_embedded_media',
      },
      permission_scope: packageData.manifest.permission_scope,
      download_status: downloadStatus,
      download_error: downloadError,
      processing_error: processingError,
      confirmation: 'pending',
    }
    records.push(record)

    if (record.role === 'unknown' || record.finality === 'unknown' || downloadStatus === 'failed' || processingError) {
      const groupKey = [item.location.documentId, item.location.sourceBlockId || 'root', record.role, downloadStatus, Boolean(processingError)].join(':')
      const group = reviewGroups.get(groupKey) || {
        review_id: `review_group_${createHash('sha256').update(groupKey).digest('hex').slice(0, 12)}`,
        source_document_id: item.location.documentId,
        source_block_id: item.location.sourceBlockId,
        asset_ids: [],
        sample_contexts: [],
        questions: [],
        suggested_role: item.classification.role,
        suggestion_reason: item.classification.reason,
        status: 'open',
      }
      group.asset_ids.push(id)
      if (item.context && group.sample_contexts.length < 3 && !group.sample_contexts.includes(item.context)) group.sample_contexts.push(item.context)
      const questions = [
        ...(record.role === 'unknown' ? ['这一组是九门目标素材、其他活动参考，还是平台规范？'] : []),
        ...(record.finality === 'unknown' ? ['这一组是过程稿、已提供成品，还是最终上线稿？'] : []),
        ...(downloadStatus === 'failed' ? ['图片下载失败，是否需要补权限或重新上传？'] : []),
        ...(processingError ? ['图片缩略图生成失败，是否需要手动处理？'] : []),
      ]
      for (const question of questions) if (!group.questions.includes(question)) group.questions.push(question)
      reviewGroups.set(groupKey, group)
    }
  }

  const reviewQueue = [...reviewGroups.values()].map((group) => ({
    ...group,
    asset_count: group.asset_ids.length,
  }))

  const manifest = {
    manifest_version: '1.0.0',
    case_id: caseId,
    generated_at: new Date().toISOString(),
    source_document: doc,
    source_revisions: documents.map((document) => ({
      document_id: document.documentId,
      revision_id: document.revisionId,
      source_block_id: document.sourceBlockId,
    })),
    permission_scope: packageData.manifest.permission_scope,
    collection_summary: {
      discovered: allMedia.length,
      included: records.length,
      downloaded: records.filter((record) => record.download_status === 'downloaded').length,
      failed: records.filter((record) => record.download_status === 'failed').length,
      requires_review: reviewQueue.length,
    },
    assets: records,
  }

  await writeFile(path.join(caseDir, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  await writeFile(path.join(caseDir, 'review-queue.json'), `${JSON.stringify({ case_id: caseId, reviews: reviewQueue }, null, 2)}\n`)
  return manifest
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const manifest = await collectCaseAssets(options)
  console.log(JSON.stringify(manifest.collection_summary, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
