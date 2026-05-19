/* Mock metric helpers — until the catalog gains real fields, derive
 * stable values from a string seed so each capability shows realistic
 * (and re-render-stable) numbers. Swap these for real reads later. */

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h
}

export function mockUpdatedDays(seed: string): number {
  return hashString(seed) % 180
}

export function mockCallCount(seed: string): number {
  const h = hashString(seed)
  const base = h % 1000
  const multiplier = (h >>> 10) % 200
  return base * multiplier
}

export function mockUsageCount(seed: string): number {
  return (hashString(seed + ':usage') % 9000) + 100
}

export function mockSuccessRate(seed: string): number {
  // 95.00 – 99.99
  const h = hashString(seed + ':success')
  return 95 + (h % 500) / 100
}

export function mockCreatedAt(seed: string): Date {
  // 30–700 days ago, stable per seed.
  const days = (hashString(seed + ':created') % 670) + 30
  return new Date(Date.now() - days * 86400000)
}

export function mockOwner(seed: string): string {
  const owners = [
    '我想天天睡觉',
    '小满',
    '陈青莲',
    '潘安',
    'oncall-team',
    '基础平台',
    '智能客服组',
    'hailang',
    'BCM 实验室',
  ]
  return owners[hashString(seed + ':owner') % owners.length]
}

export type HealthStatus = 'healthy' | 'warning' | 'unhealthy'

export function mockHealthStatus(seed: string): HealthStatus {
  // 80% healthy, 15% warning, 5% unhealthy.
  const h = hashString(seed + ':health') % 100
  if (h < 80) return 'healthy'
  if (h < 95) return 'warning'
  return 'unhealthy'
}

const OWNER_TONES: string[] = [
  'bg-rose-500/15 text-rose-700 dark:text-rose-200',
  'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  'bg-blue-500/15 text-blue-700 dark:text-blue-200',
  'bg-violet-500/15 text-violet-700 dark:text-violet-200',
  'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200',
  'bg-cyan-500/15 text-cyan-700 dark:text-cyan-200',
  'bg-orange-500/15 text-orange-700 dark:text-orange-200',
]

export function ownerAvatarTone(name: string): string {
  return OWNER_TONES[hashString(name) % OWNER_TONES.length]
}

export function formatRelativeDays(days: number): string {
  if (days < 1) return '今天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  if (days < 365) return `${Math.floor(days / 30)} 月前`
  return `${Math.floor(days / 365)} 年前`
}

export function formatCallCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
