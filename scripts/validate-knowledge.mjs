import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CASES_DIR = path.join(ROOT, 'knowledge', 'cases')

const COLLECTION_IDS = {
  sources: 'source_id',
  mechanics: 'id',
  tasks: 'id',
  card_tiers: 'id',
  touchpoints: 'id',
  assets: 'id',
  copy_variants: 'id',
  evidence: 'evidence_id',
  gaps: 'gap_id',
}

const REQUIRED_ARRAYS = Object.keys(COLLECTION_IDS).concat('metrics')
const ALLOWED_CONFIRMATIONS = new Set(['confirmed', 'pending', 'inferred', 'conflicted', 'unknown'])
const ALLOWED_ASSET_ROLES = new Set(['target_activity_asset', 'other_activity_reference', 'platform_spec'])
const ALLOWED_CASE_TYPES = new Set(['production_configuration', 'launched_case', 'reference_case', 'platform_spec'])

function hasOpenGap(data, field) {
  return data.gaps.some((gap) => gap.field === field && gap.status === 'open')
}

export function validateCasePackage(data, file = '<memory>') {
  const errors = []
  const warnings = []
  const error = (message) => errors.push(`${file}: ${message}`)
  const warn = (message) => warnings.push(`${file}: ${message}`)

  if (data?.schema_version !== '1.0.0') error('schema_version 必须为 1.0.0')
  if (!data?.manifest?.case_id || !data?.case?.case_id) error('manifest.case_id 与 case.case_id 均为必填')
  if (data?.manifest?.case_id !== data?.case?.case_id) error('manifest.case_id 与 case.case_id 不一致')
  if (!data?.case?.name || !data?.case?.platform || !data?.case?.industry) error('案例名称、平台与行业为必填')
  if (!ALLOWED_CASE_TYPES.has(data?.case?.case_type)) error(`case_type 非法: ${data?.case?.case_type}`)

  for (const collection of REQUIRED_ARRAYS) {
    if (!Array.isArray(data?.[collection])) error(`${collection} 必须是数组`)
  }
  if (errors.length) return { errors, warnings }

  for (const [collection, idField] of Object.entries(COLLECTION_IDS)) {
    const seen = new Set()
    for (const item of data[collection]) {
      const id = item[idField]
      if (!id) error(`${collection} 存在缺少 ${idField} 的记录`)
      if (seen.has(id)) error(`${collection} 存在重复ID: ${id}`)
      seen.add(id)
    }
  }

  const sourceIds = new Set(data.sources.map((source) => source.source_id))
  const evidenceIds = new Set(data.evidence.map((evidence) => evidence.evidence_id))
  for (const evidence of data.evidence) {
    if (!sourceIds.has(evidence.source_id)) error(`证据 ${evidence.evidence_id} 引用了不存在的来源 ${evidence.source_id}`)
    if (!ALLOWED_CONFIRMATIONS.has(evidence.confirmation)) error(`证据 ${evidence.evidence_id} 的 confirmation 非法`)
  }

  for (const collection of ['mechanics', 'tasks', 'card_tiers', 'touchpoints', 'assets', 'copy_variants']) {
    for (const item of data[collection]) {
      if (!ALLOWED_CONFIRMATIONS.has(item.confirmation)) error(`${collection}.${item.id} 的 confirmation 非法`)
      if (!Array.isArray(item.evidence_ids) || item.evidence_ids.length === 0) error(`${collection}.${item.id} 缺少 evidence_ids`)
      for (const evidenceId of item.evidence_ids ?? []) {
        if (!evidenceIds.has(evidenceId)) error(`${collection}.${item.id} 引用了不存在的证据 ${evidenceId}`)
      }
    }
  }

  for (const task of data.tasks) {
    if (!Number.isInteger(task.reward_draws) || task.reward_draws < 0) error(`任务 ${task.id} 的 reward_draws 必须为非负整数`)
    if (task.frequency === 'daily' && (!Number.isInteger(task.daily_limit) || task.daily_limit < 1)) error(`每日任务 ${task.id} 必须有有效 daily_limit`)
    if (task.frequency === 'one_time' && task.daily_limit !== null) error(`一次性任务 ${task.id} 的 daily_limit 必须为 null`)
  }

  const tierTotal = data.card_tiers.reduce((sum, tier) => sum + tier.card_count, 0)
  if (Number.isInteger(data.case.declared_card_count) && tierTotal !== data.case.declared_card_count) {
    error(`卡片等级合计 ${tierTotal} 与 declared_card_count ${data.case.declared_card_count} 不一致`)
  }
  const tierCodes = new Set(data.card_tiers.map((tier) => tier.code))
  if (tierCodes.has('SF') && hasOpenGap(data, 'card_tiers.SF')) error('SF仍标记为冲突缺口时，不得加入已配置卡片等级')

  for (const asset of data.assets) {
    if (!ALLOWED_ASSET_ROLES.has(asset.role)) error(`素材 ${asset.id} 的 role 非法`)
    if (asset.role === 'other_activity_reference' && asset.finality !== 'reference_only') {
      error(`其他活动参考 ${asset.id} 必须标记为 reference_only`)
    }
  }

  if (data.case.business_goal === null && !hasOpenGap(data, 'case.business_goal')) error('business_goal 为空时必须登记开放缺口')
  if (data.case.target_audience === null && !hasOpenGap(data, 'case.target_audience')) error('target_audience 为空时必须登记开放缺口')
  if (data.metrics.length === 0 && !hasOpenGap(data, 'metrics')) error('metrics 为空时必须登记开放缺口')
  if (data.case.activity_period?.confirmation === 'confirmed' && data.case.activity_period.year === null) {
    error('活动周期标记 confirmed 时必须提供年份')
  }

  const serialized = JSON.stringify(data).toLowerCase()
  for (const forbidden of ['authcode=', '提取码', 'pwd=']) {
    if (serialized.includes(forbidden)) error(`案例包不得保存临时鉴权或网盘口令: ${forbidden}`)
  }

  if (data.manifest.review_status === 'draft_for_human_review') warn('案例包仍需人工复核')
  return { errors, warnings }
}

async function listCaseFiles() {
  const entries = await readdir(CASES_DIR, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(CASES_DIR, entry.name, 'case-package.json'))
}

async function main() {
  const files = await listCaseFiles()
  if (files.length === 0) throw new Error('没有找到案例包')

  let errorCount = 0
  for (const file of files) {
    const data = JSON.parse(await readFile(file, 'utf8'))
    const result = validateCasePackage(data, path.relative(ROOT, file))
    result.warnings.forEach((warning) => console.warn(`WARN ${warning}`))
    result.errors.forEach((validationError) => console.error(`ERROR ${validationError}`))
    errorCount += result.errors.length
    if (result.errors.length === 0) console.log(`OK ${path.relative(ROOT, file)}`)
  }
  if (errorCount > 0) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
