export type ImportedGameplayRow = Record<string, unknown>

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"' && quoted && text[index + 1] === '"') {
      field += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field.trim())
      field = ''
      if (row.some(Boolean)) rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

export function parseGameplayImport(text: string, filename: string): ImportedGameplayRow[] {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('文件内容为空')

  if (filename.toLowerCase().endsWith('.json')) {
    const parsed: unknown = JSON.parse(trimmed)
    const rows = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed && Array.isArray((parsed as { items?: unknown }).items)
        ? (parsed as { items: unknown[] }).items
        : null
    if (!rows) throw new Error('JSON 需要是数组，或包含 items 数组')
    if (!rows.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))) {
      throw new Error('每一项都必须是对象')
    }
    return rows.slice(0, 500) as ImportedGameplayRow[]
  }

  const rows = parseCsv(trimmed)
  if (rows.length < 2) throw new Error('CSV 至少需要表头和一行内容')
  const headers = rows[0].map((header) => header.trim())
  if (headers.some((header) => !header)) throw new Error('CSV 表头不能为空')
  return rows
    .slice(1, 501)
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

export function importString(row: ImportedGameplayRow, key: string, fallback = ''): string {
  const value = row[key]
  return value == null ? fallback : String(value).trim()
}

export function importNumber(row: ImportedGameplayRow, key: string, fallback: number): number {
  const value = Number(row[key])
  return Number.isFinite(value) ? value : fallback
}

export function importBoolean(row: ImportedGameplayRow, key: string, fallback = true): boolean {
  const value = row[key]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    if (['true', '1', 'yes', '是', '启用'].includes(value.toLowerCase())) return true
    if (['false', '0', 'no', '否', '停用'].includes(value.toLowerCase())) return false
  }
  return fallback
}

export function importStringArray(row: ImportedGameplayRow, key: string): string[] {
  const value = row[key]
  if (Array.isArray(value))
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean)
  return importString(row, key)
    .split(/\||；|;/)
    .map((item) => item.trim())
    .filter(Boolean)
}
