import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronRight,
  Play,
  RotateCcw,
  Table,
  Trophy,
} from '@/shared/icons'
import type { TowerDefenseBalanceConfig } from './TowerDefenseFlowModel'
import {
  cloneTowerDefenseBalanceProfile,
  createDefaultTowerDefenseBalanceProfile,
  TOWER_BALANCE_PLANS,
  type TowerBalancePlanKey,
  type TowerBalanceRow,
  type TowerBalanceSectionKey,
  type TowerDefenseBalanceProfile,
} from './TowerDefenseBalanceModel'

type BalanceMainPanel = 'report' | 'plans' | 'config'
type BalanceRunStatus = 'idle' | 'running' | 'finished'

interface BalanceWaveResult {
  name: string
  leakDamage: number
  leaked: number
  pressure: number
  defense: number
  goldAfter: number
  baseHpAfter: number
}

interface BalanceResult {
  label: string
  stars: number
  baseHp: number
  difficulty: string
  recommendation: string
  worstWave?: BalanceWaveResult
}

interface BalanceTest {
  status: BalanceRunStatus
  source: string
  speed: 1 | 2 | 4
  waveIndex: number
  baseHp: number
  gold: number
  leaked: number
  kills: number
  waveResults: BalanceWaveResult[]
  result?: BalanceResult
}

interface BalanceColumn {
  key: string
  label: string
  type?: 'number'
  step?: number
  readonly?: boolean
  format?: 'percent'
  derive?: (row: TowerBalanceRow, profile: TowerDefenseBalanceProfile) => number
}

const ENEMY_IDS = ['knife_soldier', 'iron_cavalry', 'sorcerer', 'eagle_scout'] as const

const numberValue = (row: TowerBalanceRow | undefined, key: string, fallback = 0) =>
  Number(row?.[key] ?? fallback)

const enemyById = (profile: TowerDefenseBalanceProfile, id: string) =>
  profile.data.enemies.find((enemy) => enemy.id === id)

const bossConfig = (profile: TowerDefenseBalanceProfile) =>
  profile.data.boss.find((item) => item.id === 'liubei')

const ruleValue = (profile: TowerDefenseBalanceProfile, id: string, fallback = 0) =>
  numberValue(profile.data.rules.find((item) => item.id === id), 'value', fallback)

const towerDps = (tower: TowerBalanceRow) =>
  numberValue(tower, 'attack') / Math.max(0.1, numberValue(tower, 'interval', 1))

function canTowerHitEnemy(tower: TowerBalanceRow, enemy: TowerBalanceRow) {
  if (tower.target === '空地') return true
  if (tower.target === '对空') return enemy.type === 'air'
  return enemy.type === 'ground'
}

function effectiveDps(tower: TowerBalanceRow, enemy: TowerBalanceRow) {
  const resistance = tower.damageType === 'magic'
    ? numberValue(enemy, 'magicResistance')
    : numberValue(enemy, 'physicalResistance')
  return towerDps(tower) * (1 - resistance)
}

function waveEnemyCount(wave: TowerBalanceRow) {
  return [...ENEMY_IDS, 'boss'].reduce((sum, key) => sum + numberValue(wave, key), 0)
}

function waveTotalHp(profile: TowerDefenseBalanceProfile, wave: TowerBalanceRow) {
  const boss = bossConfig(profile)
  return ENEMY_IDS.reduce((sum, enemyId) => {
    const enemy = enemyById(profile, enemyId)
    return sum + numberValue(enemy, 'hp') * numberValue(wave, enemyId)
  }, numberValue(boss, 'hp') * numberValue(wave, 'boss'))
}

function waveGold(profile: TowerDefenseBalanceProfile, wave: TowerBalanceRow) {
  const boss = bossConfig(profile)
  return ENEMY_IDS.reduce((sum, enemyId) => {
    const enemy = enemyById(profile, enemyId)
    return sum + numberValue(enemy, 'rewardGold') * numberValue(wave, enemyId)
  }, numberValue(wave, 'reward') + numberValue(boss, 'rewardGold') * numberValue(wave, 'boss'))
}

function wavePressure(profile: TowerDefenseBalanceProfile, wave: TowerBalanceRow) {
  const boss = bossConfig(profile)
  const enemyPressure = ENEMY_IDS.reduce((sum, enemyId) => {
    const enemy = enemyById(profile, enemyId)
    return sum + numberValue(enemy, 'hp') * numberValue(enemy, 'speed') * numberValue(enemy, 'leakDamage') * numberValue(wave, enemyId)
  }, 0)
  return enemyPressure + (
    numberValue(boss, 'hp') + numberValue(boss, 'attack') * 3 + numberValue(boss, 'leakDamage') * 120
  ) * numberValue(wave, 'boss')
}

function targetCoverage(profile: TowerDefenseBalanceProfile, tower: TowerBalanceRow, wave: TowerBalanceRow) {
  const enemies = ENEMY_IDS.map((id) => ({ enemy: enemyById(profile, id), count: numberValue(wave, id) }))
    .filter((item): item is { enemy: TowerBalanceRow; count: number } => Boolean(item.enemy) && item.count > 0)
  if (!enemies.length) return 1
  const total = enemies.reduce((sum, item) => sum + item.count, 0)
  const covered = enemies.reduce((sum, item) => sum + (canTowerHitEnemy(tower, item.enemy) ? item.count : 0), 0)
  const bossCoverage = numberValue(wave, 'boss') && tower.target !== '对空' ? 0.2 : 0
  return Math.max(0.18, covered / total + bossCoverage)
}

function projectedDefensePower(profile: TowerDefenseBalanceProfile, availableGold: number, wave: TowerBalanceRow) {
  const affordableDps = profile.data.towers.reduce((sum, tower) => {
    const level = numberValue(tower, 'level')
    const levelWeight = level === 1 ? 1 : level === 2 ? 0.42 : 0.2
    const affordability = Math.min(1, availableGold / Math.max(1, numberValue(tower, 'cost') * 3.2))
    return sum + towerDps(tower) * levelWeight * affordability * targetCoverage(profile, tower, wave)
  }, 0)
  const hero = profile.data.hero.find((item) => item.id === 'lvbu')
  const heroDps = numberValue(hero, 'attack') / Math.max(0.1, numberValue(hero, 'interval', 1))
  return (affordableDps + heroDps * 0.7) * 18 + availableGold * 0.8
}

function projectWaveResult(profile: TowerDefenseBalanceProfile, wave: TowerBalanceRow, availableGold: number) {
  const pressure = wavePressure(profile, wave)
  const defense = projectedDefensePower(profile, availableGold, wave)
  const ratio = pressure / Math.max(1, defense)
  const leakDamage = Math.max(0, Math.round((ratio - 1.02) * 2.2))
  const count = waveEnemyCount(wave)
  const leaked = Math.min(count, Math.max(0, Math.ceil(leakDamage / 2)))
  return {
    pressure,
    defense,
    leakDamage,
    leaked,
    kills: Math.max(0, count - leaked),
    spend: Math.min(availableGold, Math.round(Math.max(0, defense * 0.014))),
  }
}

function balanceRecommendation(stars: number, worstWave?: BalanceWaveResult) {
  if (stars <= 1) return '建议选择“降低难度”或“平滑节奏”。'
  if (worstWave?.name === '第4波') return '建议选择“强化克制”优化对空体验。'
  if (stars === 3) return '如需提升挑战，选择“增加挑战”。'
  return '当前可继续微调关键波次，或选择方案快速试跑。'
}

function buildBalanceResult(profile: TowerDefenseBalanceProfile, test: BalanceTest): BalanceResult {
  const three = ruleValue(profile, 'threeStarHp', 16)
  const two = ruleValue(profile, 'twoStarHp', 8)
  const one = ruleValue(profile, 'oneStarHp', 1)
  const stars = test.baseHp >= three ? 3 : test.baseHp >= two ? 2 : test.baseHp >= one ? 1 : 0
  const worstWave = [...test.waveResults].sort((a, b) => b.leakDamage - a.leakDamage || b.pressure - a.pressure)[0]
  return {
    label: stars === 0 ? '失败' : stars === 3 ? '三星稳定' : stars === 2 ? '难度适中' : '偏难',
    stars,
    baseHp: test.baseHp,
    worstWave,
    difficulty: stars === 0 ? '过难' : stars === 1 ? '偏难' : stars === 2 ? '合理' : '偏简单',
    recommendation: balanceRecommendation(stars, worstWave),
  }
}

function balanceIssues(profile: TowerDefenseBalanceProfile) {
  const issues: string[] = []
  const pressures = profile.data.waves.map((wave) => wavePressure(profile, wave))
  pressures.forEach((pressure, index) => {
    if (index > 0 && pressure > pressures[index - 1] * 1.6) {
      issues.push(`${profile.data.waves[index].name} 压力比上一波高 ${Math.round((pressure / pressures[index - 1] - 1) * 100)}%，建议检查出怪密度或奖励。`)
    }
  })
  const eagle = enemyById(profile, 'eagle_scout')
  const airHp = profile.data.waves.reduce((sum, wave) => sum + numberValue(wave, 'eagle_scout') * numberValue(eagle, 'hp'), 0)
  const antiAirDps = profile.data.towers.filter((tower) => tower.target !== '对地').reduce((sum, tower) => sum + towerDps(tower), 0)
  if (airHp > 2500 && antiAirDps < 450) issues.push('飞行单位总生命偏高，但可对空塔理论 DPS 偏低，建议强化瞭望塔或降低第4—6波飞鹰数量。')
  const physicalRatio = profile.data.towers.filter((tower) => tower.damageType === 'physical').length / profile.data.towers.length
  if (physicalRatio > 0.55 && profile.data.enemies.some((enemy) => numberValue(enemy, 'physicalResistance') >= 0.8)) issues.push('物理塔占比高，同时存在 80% 以上物抗敌人，玩家可能被迫依赖军师台。')
  const boss = bossConfig(profile)
  const bossAsEnemy: TowerBalanceRow = { ...(boss ?? { id: 'boss', name: 'Boss' }), type: 'ground', physicalResistance: numberValue(boss, 'armor'), magicResistance: 0 }
  const bestGroundDps = Math.max(...profile.data.towers.filter((tower) => tower.target !== '对空').map((tower) => effectiveDps(tower, bossAsEnemy)))
  if (boss && numberValue(boss, 'hp') / Math.max(1, bestGroundDps) > 28) issues.push('Boss 单塔击杀时间超过 28 秒，建议提高 Boss 波前经济或降低 Boss 血量。')
  return issues
}

const COLUMNS: Record<Exclude<TowerBalanceSectionKey, 'metrics'>, BalanceColumn[]> = {
  rules: [
    { key: 'name', label: '规则' }, { key: 'value', label: '数值', type: 'number', step: 1 }, { key: 'note', label: '说明' },
  ],
  towers: [
    { key: 'name', label: '塔' }, { key: 'level', label: '等级', type: 'number', step: 1 }, { key: 'role', label: '定位' }, { key: 'damageType', label: '伤害' }, { key: 'target', label: '目标' }, { key: 'attack', label: '攻击', type: 'number', step: 1 }, { key: 'interval', label: '间隔', type: 'number', step: 0.1 }, { key: 'range', label: '射程', type: 'number', step: 0.05 }, { key: 'cost', label: '成本', type: 'number', step: 10 }, { key: 'dps', label: 'DPS', readonly: true, derive: (row) => towerDps(row) }, { key: 'counter', label: '克制' },
  ],
  enemies: [
    { key: 'name', label: '敌人' }, { key: 'type', label: '类型' }, { key: 'hp', label: '生命', type: 'number', step: 10 }, { key: 'attack', label: '攻击', type: 'number', step: 1 }, { key: 'interval', label: '攻速', type: 'number', step: 0.1 }, { key: 'speed', label: '移速', type: 'number', step: 0.1 }, { key: 'physicalResistance', label: '物抗', type: 'number', step: 0.05, format: 'percent' }, { key: 'magicResistance', label: '魔抗', type: 'number', step: 0.05, format: 'percent' }, { key: 'leakDamage', label: '漏怪', type: 'number', step: 1 }, { key: 'rewardGold', label: '金币', type: 'number', step: 5 }, { key: 'role', label: '定位' },
  ],
  hero: [
    { key: 'name', label: '英雄/技能' }, { key: 'hp', label: '生命', type: 'number', step: 50 }, { key: 'attack', label: '伤害', type: 'number', step: 10 }, { key: 'interval', label: '间隔/冷却', type: 'number', step: 0.5 }, { key: 'target', label: '目标' }, { key: 'damageTakenMultiplier', label: '受伤倍率', type: 'number', step: 0.01 }, { key: 'regenPercent', label: '回血/秒', type: 'number', step: 0.001, format: 'percent' }, { key: 'reviveTime', label: '复活', type: 'number', step: 1 }, { key: 'heroDps', label: 'DPS', readonly: true, derive: (row) => numberValue(row, 'attack') / Math.max(0.1, numberValue(row, 'interval', 1)) }, { key: 'note', label: '说明' },
  ],
  boss: [
    { key: 'name', label: 'Boss/技能' }, { key: 'hp', label: '生命', type: 'number', step: 50 }, { key: 'attack', label: '攻击', type: 'number', step: 10 }, { key: 'interval', label: '间隔/冷却', type: 'number', step: 0.5 }, { key: 'speed', label: '速度/倍率', type: 'number', step: 0.1 }, { key: 'armor', label: '护甲', type: 'number', step: 0.05, format: 'percent' }, { key: 'leakDamage', label: '漏怪', type: 'number', step: 1 }, { key: 'rewardGold', label: '金币', type: 'number', step: 10 }, { key: 'bossPressure', label: '压力', readonly: true, derive: (row) => numberValue(row, 'hp') + numberValue(row, 'leakDamage') * 120 + numberValue(row, 'attack') * 3 }, { key: 'note', label: '说明' },
  ],
  waves: [
    { key: 'name', label: '波次' }, { key: 'knife_soldier', label: '刀兵', type: 'number', step: 1 }, { key: 'iron_cavalry', label: '铁骑', type: 'number', step: 1 }, { key: 'sorcerer', label: '术士', type: 'number', step: 1 }, { key: 'eagle_scout', label: '飞鹰', type: 'number', step: 1 }, { key: 'boss', label: 'Boss', type: 'number', step: 1 }, { key: 'reward', label: '奖励', type: 'number', step: 10 }, { key: 'spawnInterval', label: '间隔', type: 'number', step: 0.1 }, { key: 'bossDelay', label: 'Boss 延迟', type: 'number', step: 1 }, { key: 'waveHp', label: '总生命', readonly: true, derive: (row, profile) => waveTotalHp(profile, row) }, { key: 'waveGold', label: '总金币', readonly: true, derive: (row, profile) => waveGold(profile, row) }, { key: 'pressure', label: '压力', readonly: true, derive: (row, profile) => wavePressure(profile, row) },
  ],
}

function formatValue(value: string | number, column?: BalanceColumn) {
  if (column?.format === 'percent') return `${Math.round(Number(value) * 100)}%`
  if (typeof value === 'number') return Math.abs(value) >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10)
  return value
}

function applyBalancePlan(profile: TowerDefenseBalanceProfile, planKey: TowerBalancePlanKey) {
  const next = cloneTowerDefenseBalanceProfile(profile)
  const mutate = (rows: TowerBalanceRow[], id: string, changes: Record<string, number>, level?: number) => {
    const row = rows.find((item) => item.id === id && (level === undefined || numberValue(item, 'level') === level))
    if (!row) return
    Object.entries(changes).forEach(([key, delta]) => { row[key] = Math.max(0, numberValue(row, key) + delta) })
  }
  if (planKey === 'lowerDifficulty') {
    mutate(next.data.waves, 'wave2', { iron_cavalry: -1, reward: 20 })
    mutate(next.data.waves, 'wave4', { eagle_scout: -2 })
    mutate(next.data.rules, 'initialGold', { value: 30 })
  } else if (planKey === 'increaseChallenge') {
    next.data.enemies.forEach((enemy) => { enemy.hp = Math.round(numberValue(enemy, 'hp') * 1.08) })
    mutate(next.data.boss, 'liubei', { hp: 120, attack: 10 })
  } else if (planKey === 'smoothPacing') {
    mutate(next.data.waves, 'wave2', { iron_cavalry: -1, knife_soldier: 1, reward: 10 })
    mutate(next.data.waves, 'wave4', { eagle_scout: -2, knife_soldier: 2 })
    mutate(next.data.waves, 'wave5', { eagle_scout: 1, sorcerer: 1 })
  } else {
    mutate(next.data.towers, 'strategist_platform', { attack: 8, cost: -10 }, 1)
    mutate(next.data.towers, 'watchtower', { attack: 8, cost: -10 }, 1)
    mutate(next.data.enemies, 'sorcerer', { hp: 20 })
  }
  return next
}

function syncRuntimeConfig(balance: TowerDefenseBalanceConfig, profile: TowerDefenseBalanceProfile): TowerDefenseBalanceConfig {
  const arrow = profile.data.towers.find((tower) => tower.id === 'arrow_tower' && numberValue(tower, 'level') === 1)
  const knife = enemyById(profile, 'knife_soldier')
  const bossWaveIndex = profile.data.waves.findIndex((wave) => numberValue(wave, 'boss') > 0)
  return {
    ...balance,
    profile,
    startingCoins: ruleValue(profile, 'initialGold', balance.startingCoins),
    towerDamageMultiplier: numberValue(arrow, 'attack', 35) / 35,
    towerFireRateMultiplier: 1.2 / Math.max(0.1, numberValue(arrow, 'interval', 1.2)),
    enemyHealthMultiplier: numberValue(knife, 'hp', 200) / 200,
    enemySpeedMultiplier: numberValue(knife, 'speed', 1),
    bossEvery: bossWaveIndex >= 0 ? bossWaveIndex + 1 : balance.bossEvery,
  }
}

function createInitialTest(profile: TowerDefenseBalanceProfile, speed: 1 | 2 | 4, source: string): BalanceTest {
  return { status: 'running', source, speed, waveIndex: 0, baseHp: ruleValue(profile, 'baseHp', 20), gold: ruleValue(profile, 'initialGold', 500), leaked: 0, kills: 0, waveResults: [] }
}

function SectionInsight({ section, profile }: { section: TowerBalanceSectionKey; profile: TowerDefenseBalanceProfile }) {
  if (section === 'towers') {
    const best = [...profile.data.towers].sort((a, b) => towerDps(b) / numberValue(b, 'cost', 1) - towerDps(a) / numberValue(a, 'cost', 1))[0]
    return <>最高 DPS/金币：{best.name} Lv{best.level}，{formatValue(towerDps(best) / numberValue(best, 'cost', 1))}。</>
  }
  if (section === 'waves') {
    const ranked = [...profile.data.waves].sort((a, b) => wavePressure(profile, b) - wavePressure(profile, a))
    return <>最高压力波次：{ranked[0].name}，压力 {formatValue(wavePressure(profile, ranked[0]))}。</>
  }
  if (section === 'enemies') {
    const armored = profile.data.enemies.filter((enemy) => numberValue(enemy, 'physicalResistance') >= 0.7).map((enemy) => enemy.name).join('、')
    return <>高物抗单位：{armored || '无'}；需要法术塔覆盖。</>
  }
  return <>修改数值后会即时刷新派生指标；底部按钮会在有改动时启用。</>
}

function MetricsPanel({ profile }: { profile: TowerDefenseBalanceProfile }) {
  const levelOneTowers = profile.data.towers.filter((tower) => numberValue(tower, 'level') === 1)
  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">{profile.data.waves.map((wave) => <article key={wave.id} className="rounded-xl border border-black/[0.07] bg-white p-3"><strong className="text-[10px] text-[#161823]">{wave.name}</strong><div className="mt-2 space-y-1 text-[8px] text-[#161823]/46"><p>总生命 {formatValue(waveTotalHp(profile, wave))}</p><p>总金币 {formatValue(waveGold(profile, wave))}</p><p>压力 {formatValue(wavePressure(profile, wave))}</p></div></article>)}</div>
    <div className="thin-scroll overflow-x-auto rounded-xl border border-black/[0.07] bg-white"><table className="w-full min-w-[620px] border-collapse text-left text-[8px]"><thead><tr className="border-b border-black/[0.06] bg-[#F7F7F8]"><th className="sticky left-0 bg-[#F7F7F8] px-3 py-2.5">Lv1 塔 TTK</th>{profile.data.enemies.map((enemy) => <th key={enemy.id} className="px-3 py-2.5">{enemy.name}</th>)}</tr></thead><tbody>{levelOneTowers.map((tower) => <tr key={tower.id} className="border-b border-black/[0.05] last:border-0"><td className="sticky left-0 bg-white px-3 py-2.5 font-semibold">{tower.name}</td>{profile.data.enemies.map((enemy) => { const dps = canTowerHitEnemy(tower, enemy) ? effectiveDps(tower, enemy) : 0; return <td key={enemy.id} className="px-3 py-2.5 text-[#161823]/55">{dps ? `${formatValue(numberValue(enemy, 'hp') / dps)}s` : '—'}</td> })}</tr>)}</tbody></table></div>
  </div>
}

export interface TowerDefenseBalanceEditorPanelProps {
  balance: TowerDefenseBalanceConfig
  onChange: (balance: TowerDefenseBalanceConfig) => void
  onConfirm?: () => void
  className?: string
}

export function TowerDefenseBalanceEditorPanel({ balance, onChange, onConfirm, className = '' }: TowerDefenseBalanceEditorPanelProps) {
  const profile = balance.profile ?? createDefaultTowerDefenseBalanceProfile()
  const [mainPanel, setMainPanel] = useState<BalanceMainPanel>('report')
  const [section, setSection] = useState<TowerBalanceSectionKey>('rules')
  const [selectedPlan, setSelectedPlan] = useState<TowerBalancePlanKey | null>(null)
  const [configDirty, setConfigDirty] = useState(false)
  const [speed, setSpeed] = useState<1 | 2 | 4>(2)
  const [test, setTest] = useState<BalanceTest>({ status: 'idle', source: '', speed: 2, waveIndex: 0, baseHp: ruleValue(profile, 'baseHp', 20), gold: ruleValue(profile, 'initialGold', 500), leaked: 0, kills: 0, waveResults: [] })
  const testProfileRef = useRef(profile)

  useEffect(() => {
    if (test.status !== 'running') return
    const timer = window.setTimeout(() => setTest((current) => {
      if (current.status !== 'running') return current
      const testProfile = testProfileRef.current
      const wave = testProfile.data.waves[current.waveIndex]
      if (!wave) return { ...current, status: 'finished', result: buildBalanceResult(testProfile, current) }
      const projected = projectWaveResult(testProfile, wave, current.gold)
      const nextBaseHp = Math.max(0, current.baseHp - projected.leakDamage)
      const nextGold = Math.max(0, current.gold + waveGold(testProfile, wave) - projected.spend)
      const next: BalanceTest = {
        ...current,
        waveIndex: current.waveIndex + 1,
        baseHp: nextBaseHp,
        gold: nextGold,
        leaked: current.leaked + projected.leaked,
        kills: current.kills + projected.kills,
        waveResults: [...current.waveResults, { name: String(wave.name), leakDamage: projected.leakDamage, leaked: projected.leaked, pressure: projected.pressure, defense: projected.defense, goldAfter: nextGold, baseHpAfter: nextBaseHp }],
      }
      if (next.baseHp <= 0 || next.waveIndex >= testProfile.data.waves.length) return { ...next, status: 'finished', result: buildBalanceResult(testProfile, next) }
      return next
    }), Math.max(260, 1100 / test.speed))
    return () => window.clearTimeout(timer)
  }, [test.speed, test.status, test.waveIndex])

  const issues = useMemo(() => balanceIssues(profile), [profile])
  const previewPressures = profile.data.waves.map((wave) => wavePressure(profile, wave))
  const previewWorst = profile.data.waves[previewPressures.indexOf(Math.max(...previewPressures))]
  const displayResult: BalanceResult = test.result ?? { label: '等待试跑', stars: 0, baseHp: ruleValue(profile, 'baseHp', 20), difficulty: '待测试', recommendation: '点击开始试跑，或选择一个调整方案直接测试。', worstWave: previewWorst ? { name: String(previewWorst.name), leakDamage: 0, leaked: 0, pressure: wavePressure(profile, previewWorst), defense: 0, goldAfter: 0, baseHpAfter: ruleValue(profile, 'baseHp', 20) } : undefined }

  const commitProfile = (nextProfile: TowerDefenseBalanceProfile) => onChange(syncRuntimeConfig(balance, nextProfile))
  const updateRow = (rowIndex: number, field: string, value: number) => {
    if (section === 'metrics') return
    const next = cloneTowerDefenseBalanceProfile(profile)
    next.data[section][rowIndex][field] = value
    setConfigDirty(true)
    commitProfile(next)
  }
  const beginTest = (source: string, nextProfile = profile) => {
    testProfileRef.current = cloneTowerDefenseBalanceProfile(nextProfile)
    setTest(createInitialTest(nextProfile, speed, source))
    setMainPanel('report')
  }
  const runAction = () => {
    if (mainPanel === 'plans' && selectedPlan) {
      const next = applyBalancePlan(profile, selectedPlan)
      commitProfile(next)
      const title = TOWER_BALANCE_PLANS.find((plan) => plan.key === selectedPlan)?.title ?? '调整方案'
      setSelectedPlan(null)
      beginTest(title, next)
    } else if (mainPanel === 'config' && configDirty) {
      setConfigDirty(false)
      beginTest('手动数值')
    } else if (mainPanel === 'report') beginTest('手动试跑')
  }
  const canRun = mainPanel === 'report' || (mainPanel === 'plans' && Boolean(selectedPlan)) || (mainPanel === 'config' && configDirty)
  const actionLabel = mainPanel === 'plans' ? '应用方案并试跑' : mainPanel === 'config' ? '应用并试跑' : test.status === 'running' ? '试跑中' : '开始试跑'

  return <aside className={`flex h-full min-h-0 w-full flex-col bg-[#F7F7F8] ${className}`} aria-label="平衡性编辑">
    <nav className="grid h-11 shrink-0 grid-cols-3 border-b border-black/[0.07] bg-white px-3 pt-1" aria-label="平衡性工作流">{([['report', '试跑报告'], ['plans', '调整方案'], ['config', '数值配置']] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setMainPanel(id)} className={`border-b-2 text-[10px] font-medium ${mainPanel === id ? 'border-[#161823] text-[#161823]' : 'border-transparent text-[#161823]/42 hover:text-[#161823]/70'}`} aria-pressed={mainPanel === id}>{label}</button>)}</nav>

    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-4">
      {mainPanel === 'report' ? <div className="space-y-3">
        <section className="rounded-2xl border border-black/[0.07] bg-[#161823] p-4 text-white"><span className="text-[8px] text-white/50">当前难度</span><strong className="mt-1 block text-[22px] font-semibold">{displayResult.difficulty}</strong><p className="mt-2 text-[9px] leading-4 text-white/62">{displayResult.recommendation}</p>{test.status === 'running' ? <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/12"><div className="h-full bg-white transition-all" style={{ width: `${(test.waveIndex / profile.data.waves.length) * 100}%` }} /></div> : null}</section>
        <div className="grid grid-cols-2 gap-2"><article className="rounded-xl border border-black/[0.07] bg-white p-3"><span className="text-[8px] text-[#161823]/38">预计星级</span><strong className="mt-1 block text-[16px]">{test.result ? test.result.stars : '—'}</strong></article><article className="rounded-xl border border-black/[0.07] bg-white p-3"><span className="text-[8px] text-[#161823]/38">基地血量</span><strong className="mt-1 block text-[16px]">{Math.round(test.baseHp)}</strong></article><article className="rounded-xl border border-black/[0.07] bg-white p-3"><span className="text-[8px] text-[#161823]/38">漏怪数</span><strong className="mt-1 block text-[16px]">{test.leaked}</strong></article><article className="rounded-xl border border-black/[0.07] bg-white p-3"><span className="text-[8px] text-[#161823]/38">击杀数</span><strong className="mt-1 block text-[16px]">{test.kills}</strong></article></div>
        <section className="rounded-xl border border-black/[0.07] bg-white p-3"><div className="flex items-center gap-1.5 text-[10px] font-semibold"><AlertTriangle className="size-3.5" />主要问题</div><div className="mt-2 space-y-2 text-[8px] leading-4 text-[#161823]/52">{issues.length ? issues.slice(0, 3).map((issue) => <p key={issue}>{issue}</p>) : <p>暂无明显风险，建议用预览试跑确认实战表现。</p>}</div></section>
        <section className="rounded-xl border border-black/[0.07] bg-white p-3"><div className="flex items-center gap-1.5 text-[10px] font-semibold"><BarChart3 className="size-3.5" />试跑过程</div><div className="mt-2 divide-y divide-black/[0.05] text-[8px] text-[#161823]/52">{test.waveResults.length ? test.waveResults.map((wave) => <div key={wave.name} className="flex items-center justify-between py-2"><span>{wave.name}</span><span>漏怪伤害 {wave.leakDamage} · 基地 {Math.round(wave.baseHpAfter)}</span></div>) : <p className="py-2">尚未完成波次，开始试跑后会实时生成结果。</p>}</div></section>
      </div> : null}

      {mainPanel === 'plans' ? <div className="grid grid-cols-1 gap-2">{TOWER_BALANCE_PLANS.map((plan) => <button key={plan.key} type="button" onClick={() => setSelectedPlan(plan.key)} className={`rounded-xl border p-3 text-left transition ${selectedPlan === plan.key ? 'border-[#161823] bg-white shadow-sm ring-1 ring-[#161823]' : 'border-black/[0.07] bg-white hover:border-black/20'}`} aria-pressed={selectedPlan === plan.key}><div className="flex items-center justify-between"><span className="rounded-full bg-[#F1F2F3] px-2 py-1 text-[7px] text-[#161823]/52">{plan.tag}</span>{selectedPlan === plan.key ? <Check className="size-3.5" /> : null}</div><strong className="mt-2 block text-[11px]">{plan.title}</strong><div className="mt-2 space-y-1 text-[8px] leading-4 text-[#161823]/44"><p>{plan.when}</p><p>{plan.reason}</p><p>{plan.effect}</p></div></button>)}</div> : null}

      {mainPanel === 'config' ? <div className="space-y-3">
        <div className="thin-scroll flex gap-1 overflow-x-auto pb-1">{profile.sections.map((item) => <button key={item.key} type="button" onClick={() => setSection(item.key)} className={`h-8 shrink-0 rounded-lg px-3 text-[8px] font-medium ${section === item.key ? 'bg-[#161823] text-white' : 'border border-black/[0.07] bg-white text-[#161823]/52 hover:text-[#161823]'}`}>{item.label}</button>)}</div>
        <header><strong className="text-[11px]">{profile.sections.find((item) => item.key === section)?.label}</strong><p className="mt-0.5 text-[8px] text-[#161823]/34">{profile.title}：配置、测算、异常检查</p></header>
        {section === 'metrics' ? <MetricsPanel profile={profile} /> : <div className="thin-scroll overflow-x-auto rounded-xl border border-black/[0.07] bg-white"><table className="w-full min-w-max border-collapse text-left text-[8px]"><thead><tr className="border-b border-black/[0.06] bg-[#F7F7F8]">{COLUMNS[section].map((column, index) => <th key={column.key} className={`px-2.5 py-2.5 font-semibold text-[#161823]/58 ${index === 0 ? 'sticky left-0 z-10 bg-[#F7F7F8]' : ''}`}>{column.label}</th>)}</tr></thead><tbody>{profile.data[section].map((row, rowIndex) => <tr key={`${row.id}-${rowIndex}`} className="border-b border-black/[0.05] last:border-0">{COLUMNS[section].map((column, columnIndex) => { const value = column.derive ? column.derive(row, profile) : row[column.key]; return <td key={column.key} className={`px-2.5 py-2 ${columnIndex === 0 ? 'sticky left-0 z-[5] bg-white font-semibold' : 'text-[#161823]/55'}`}>{column.type === 'number' && !column.readonly ? <input type="number" step={column.step ?? 1} value={Number(value ?? 0)} onChange={(event) => updateRow(rowIndex, column.key, Number(event.target.value))} className="h-7 w-20 rounded-md border border-black/[0.08] bg-[#F7F7F8] px-2 text-[8px] tabular-nums outline-none focus:border-[#161823]/30" aria-label={`${row.name} ${column.label}`} /> : formatValue(value ?? '', column)}</td> })}</tr>)}</tbody></table></div>}
        <section className="rounded-xl border border-black/[0.07] bg-white p-3"><div className="flex items-center gap-1.5 text-[9px] font-semibold"><Table className="size-3.5" />检查结果</div><p className="mt-2 text-[8px] leading-4 text-[#161823]/48"><SectionInsight section={section} profile={profile} /></p></section>
      </div> : null}
    </div>

    <div className="shrink-0 border-t border-black/[0.07] bg-white p-3"><div className="mb-2 flex items-center justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-[9px]">{test.status === 'running' ? `试跑中：${profile.data.waves[test.waveIndex]?.name ?? '结算中'}` : test.status === 'finished' ? `试跑完成：${test.result?.label}` : '等待试跑'}</strong><span className="mt-0.5 block truncate text-[7px] text-[#161823]/35">{test.status === 'running' ? `来源：${test.source} / 基地 ${Math.round(test.baseHp)} / 金币 ${Math.round(test.gold)} / ${test.speed}x` : test.status === 'finished' ? `星级 ${test.result?.stars} / 剩余血量 ${Math.round(test.baseHp)} / 漏怪 ${test.leaked}` : '选择方案或修改数值后开始试跑。'}</span></div><select value={speed} onChange={(event) => setSpeed(Number(event.target.value) as 1 | 2 | 4)} className="h-8 rounded-lg border border-black/[0.08] bg-white px-2 text-[8px]" aria-label="测试速度"><option value={1}>1x</option><option value={2}>2x</option><option value={4}>4x</option></select></div><div className="flex gap-2"><button type="button" onClick={() => setTest({ status: 'idle', source: '', speed, waveIndex: 0, baseHp: ruleValue(profile, 'baseHp', 20), gold: ruleValue(profile, 'initialGold', 500), leaked: 0, kills: 0, waveResults: [] })} className="grid size-10 shrink-0 place-items-center rounded-xl border border-black/[0.08] text-[#161823]/52 hover:bg-[#F3F4F5]" aria-label="重置试跑"><RotateCcw className="size-4" /></button><button type="button" disabled={!canRun || test.status === 'running'} onClick={runAction} className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#161823] px-3 text-[9px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#161823]/28"><Play className="size-3.5" />{actionLabel}</button>{onConfirm ? <button type="button" disabled={test.status !== 'finished'} onClick={onConfirm} className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-black/[0.1] px-3 text-[9px] font-semibold text-[#161823] disabled:cursor-not-allowed disabled:opacity-30"><Trophy className="size-3.5" />保存版本<ChevronRight className="size-3.5" /></button> : null}</div></div>
  </aside>
}

export default TowerDefenseBalanceEditorPanel
