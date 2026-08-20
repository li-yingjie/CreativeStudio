import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  Coins,
  Heart,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Zap,
} from '@/shared/icons'
import {
  TOWER_ARCHETYPES,
  type FastGameplayConfig,
  type TowerDefenseFlowState,
  type TowerDefenseUiComponentConfig,
  type TowerDefenseUiComponentId,
  type TowerSlot,
} from './TowerDefenseFlowModel'

type GameStatus = 'ready' | 'playing' | 'paused' | 'won' | 'lost'

interface RuntimeEnemy {
  id: number
  progress: number
  health: number
  maxHealth: number
  kind: 'mossling' | 'wisp'
}

interface RuntimeProjectile {
  id: number
  towerId: TowerSlot['id']
  towerType: NonNullable<TowerSlot['occupiedBy']>
  fromX: number
  fromY: number
  toX: number
  toY: number
  color: string
  expiresAt: number
}

interface RuntimeState {
  status: GameStatus
  elapsed: number
  coins: number
  baseHealth: number
  wave: number
  kills: number
  spawnedInWave: number
  enemies: RuntimeEnemy[]
  projectiles: RuntimeProjectile[]
}

interface RuntimeConfig extends FastGameplayConfig {
  towerPowerMultiplier: number
  waveGrowth: number
}

interface VisualPreset {
  surface: string
  surfaceRaised: string
  ink: string
  muted: string
  accent: string
  secondary: string
  map: string
}

const VISUAL_PRESETS: Record<TowerDefenseFlowState['ui']['visualPreset'], VisualPreset> = {
  'night-watch': {
    surface: '#121A1C',
    surfaceRaised: '#20302D',
    ink: '#F4F3E8',
    muted: '#A4B1AA',
    accent: '#F0C56C',
    secondary: '#6FD0A5',
    map: 'linear-gradient(145deg,#354C41,#182A29)',
  },
  'forest-signal': {
    surface: '#10261F',
    surfaceRaised: '#1C3B2E',
    ink: '#F0FFF7',
    muted: '#9BC2AD',
    accent: '#D8FF6A',
    secondary: '#55E5A3',
    map: 'linear-gradient(145deg,#416D4D,#173A30)',
  },
  'paper-kingdom': {
    surface: '#302B28',
    surfaceRaised: '#51463E',
    ink: '#FFF8E8',
    muted: '#C8B9A6',
    accent: '#FFB268',
    secondary: '#8FD19D',
    map: 'linear-gradient(145deg,#8B775E,#4F493E)',
  },
}

const PATH_POINTS = [
  [12, 3],
  [20, 17],
  [65, 21],
  [80, 34],
  [55, 45],
  [25, 48],
  [18, 62],
  [70, 68],
  [76, 82],
  [46, 95],
] as const

const STATUS_COPY: Record<GameStatus, string> = {
  ready: '开始守卫',
  playing: '对局进行中',
  paused: '继续对局',
  won: '再次挑战',
  lost: '重新挑战',
}

const HERO_ROUTE_STOPS = [12, 28, 45, 62, 78, 94] as const
const DEMOLISH_REFUND_RATE = 0.6
const TOWER_RANGES: Record<NonNullable<TowerSlot['occupiedBy']>, number> = {
  rapid: 20,
  frost: 23,
  cannon: 26,
}

function createRuntime(config: RuntimeConfig, status: GameStatus = 'ready'): RuntimeState {
  return {
    status,
    elapsed: 0,
    coins: config.startingCoins,
    baseHealth: config.baseHealth,
    wave: 1,
    kills: 0,
    spawnedInWave: 0,
    enemies: [],
    projectiles: [],
  }
}

function positionOnPath(progress: number) {
  const safeProgress = Math.max(0, Math.min(99.9, progress))
  const scaled = (safeProgress / 100) * (PATH_POINTS.length - 1)
  const index = Math.floor(scaled)
  const fraction = scaled - index
  const start = PATH_POINTS[index]
  const end = PATH_POINTS[Math.min(index + 1, PATH_POINTS.length - 1)]

  return {
    x: start[0] + (end[0] - start[0]) * fraction,
    y: start[1] + (end[1] - start[1]) * fraction,
  }
}

function uiComponent(
  flow: TowerDefenseFlowState,
  id: TowerDefenseUiComponentId,
): TowerDefenseUiComponentConfig | undefined {
  return flow.ui.components.find((component) => component.id === id)
}

function uiStyle(component: TowerDefenseUiComponentConfig | undefined): CSSProperties {
  return {
    opacity: component?.emphasis === 'quiet' ? 0.72 : component?.emphasis === 'strong' ? 1 : 0.88,
    scale: (component?.scale ?? 100) / 100,
  }
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      {icon}
      <span className="sr-only">{label}</span>
      <strong className="font-semibold tabular-nums">{value}</strong>
    </div>
  )
}

export interface TowerDefensePageCanvasProps {
  flow: TowerDefenseFlowState
  onFlowChange: (flow: TowerDefenseFlowState) => void
  suspended?: boolean
  className?: string
}

/**
 * The persistent game page surface. Editors belong to the surrounding product
 * shell; this canvas deliberately owns only one playable phone viewport.
 */
export function TowerDefensePageCanvas({
  flow,
  onFlowChange,
  suspended = false,
  className = '',
}: TowerDefensePageCanvasProps) {
  const runtimeConfig = useMemo<RuntimeConfig>(() => ({
    ...flow.gameplay,
    startingCoins: flow.balance.startingCoins,
    enemyHealth: flow.gameplay.enemyHealth * flow.balance.enemyHealthMultiplier,
    enemySpeed: flow.gameplay.enemySpeed * flow.balance.enemySpeedMultiplier,
    towerPowerMultiplier:
      flow.balance.towerDamageMultiplier * flow.balance.towerFireRateMultiplier,
    waveGrowth: flow.balance.waveGrowth,
  }), [flow.balance, flow.gameplay])
  const [runtime, setRuntime] = useState(() => createRuntime(runtimeConfig))
  const previousRuntimeConfig = useRef(runtimeConfig)
  const [announcement, setAnnouncement] = useState('试玩尚未开始')
  const [activeTowerSlotId, setActiveTowerSlotId] = useState<string | null>(null)
  const [heroProgress, setHeroProgress] = useState(94)
  const [heroTargetProgress, setHeroTargetProgress] = useState(94)
  const [skillCooldowns, setSkillCooldowns] = useState({ charge: 0, guard: 0 })
  const enemyId = useRef(0)
  const projectileId = useRef(0)
  const towerSlots = flow.towerSlots

  const preset = VISUAL_PRESETS[flow.ui.visualPreset]
  const radius = flow.ui.cornerRadius
  const hud = uiComponent(flow, 'battle-hud')
  const progress = uiComponent(flow, 'wave-progress')
  const dock = uiComponent(flow, 'tower-dock')
  const controls = uiComponent(flow, 'battle-controls')
  const result = uiComponent(flow, 'result-panel')
  const confirmedAssets = flow.assets.filter((asset) => asset.baseVisualStatus === 'confirmed')
  const assetPreview = (asset: (typeof flow.assets)[number] | undefined) =>
    asset?.visualVersions?.[asset.selectedVisualVersion ?? 0]?.src
  const mapPreview = assetPreview(
    confirmedAssets.find((asset) => asset.category === 'map')
      ?? confirmedAssets.find((asset) => asset.category === 'visual-style'),
  )
  const heroPreview = assetPreview(confirmedAssets.find((asset) => asset.category === 'hero'))
  const enemyPreviews = confirmedAssets
    .filter((asset) => asset.category === 'enemy')
    .map(assetPreview)
    .filter((src): src is string => Boolean(src))
  const towerPreviews = confirmedAssets
    .filter((asset) => asset.category === 'tower')
    .map(assetPreview)
    .filter((src): src is string => Boolean(src))

  const occupiedTowers = useMemo(
    () => towerSlots.filter((slot) => slot.occupiedBy !== null),
    [towerSlots],
  )
  const activeTowerSlot = towerSlots.find((slot) => slot.id === activeTowerSlotId) ?? null

  useEffect(() => {
    const previous = previousRuntimeConfig.current
    if (previous === runtimeConfig) return

    setRuntime((current) => {
      const enemyHealthScale = previous.enemyHealth > 0
        ? runtimeConfig.enemyHealth / previous.enemyHealth
        : 1
      return {
        ...current,
        coins: Math.max(0, current.coins + runtimeConfig.startingCoins - previous.startingCoins),
        baseHealth: Math.max(0, current.baseHealth + runtimeConfig.baseHealth - previous.baseHealth),
        enemies: current.enemies.map((enemy) => ({
          ...enemy,
          health: enemy.health * enemyHealthScale,
          maxHealth: enemy.maxHealth * enemyHealthScale,
        })),
      }
    })
    previousRuntimeConfig.current = runtimeConfig
    setAnnouncement('参数已实时应用到当前对局')
  }, [runtimeConfig])

  const reset = useCallback(() => {
    enemyId.current = 0
    projectileId.current = 0
    setRuntime(createRuntime(runtimeConfig))
    setActiveTowerSlotId(null)
    setHeroProgress(94)
    setHeroTargetProgress(94)
    setSkillCooldowns({ charge: 0, guard: 0 })
    onFlowChange({
      ...flow,
      towerSlots: flow.towerSlots.map((slot) => ({ ...slot, occupiedBy: null, level: 0 })),
    })
    setAnnouncement('已重置对局')
  }, [flow, onFlowChange, runtimeConfig])

  useEffect(() => {
    if (runtime.status !== 'playing' || suspended) return undefined
    const timer = window.setInterval(() => {
      setHeroProgress((current) => {
        const delta = heroTargetProgress - current
        if (Math.abs(delta) < 0.8) return heroTargetProgress
        return current + Math.sign(delta) * Math.min(1.6, Math.abs(delta))
      })
      setSkillCooldowns((current) => ({
        charge: Math.max(0, current.charge - 0.1),
        guard: Math.max(0, current.guard - 0.1),
      }))
    }, 100)
    return () => window.clearInterval(timer)
  }, [heroTargetProgress, runtime.status, suspended])

  useEffect(() => {
    if (runtime.status !== 'playing' || suspended) return undefined

    const timer = window.setInterval(() => {
      setRuntime((current) => {
        if (current.status !== 'playing') return current

        const tick = 0.1
        const elapsed = current.elapsed + tick
        const wave = Math.min(3, Math.floor(elapsed / runtimeConfig.waveInterval) + 1)
        let spawnedInWave = wave === current.wave ? current.spawnedInWave : 0
        let enemies = current.enemies.map((enemy) => ({
          ...enemy,
          progress:
            enemy.progress + runtimeConfig.enemySpeed * (enemy.kind === 'wisp' ? 0.42 : 0.3),
        }))
        const phase = elapsed - (wave - 1) * runtimeConfig.waveInterval
        const spawnWindow = Math.max(4, runtimeConfig.waveInterval * 0.68)
        const targetSpawns = Math.min(
          runtimeConfig.waveSize,
          Math.max(0, Math.floor((phase / spawnWindow) * runtimeConfig.waveSize) + 1),
        )

        while (spawnedInWave < targetSpawns) {
          const kind = (spawnedInWave + wave) % 4 === 0 ? 'wisp' : 'mossling'
          const maxHealth =
            runtimeConfig.enemyHealth
            * (1 + (wave - 1) * runtimeConfig.waveGrowth)
            * (kind === 'wisp' ? 0.72 : 1)
          enemyId.current += 1
          enemies.push({
            id: enemyId.current,
            progress: 0,
            health: maxHealth,
            maxHealth,
            kind,
          })
          spawnedInWave += 1
        }

        const projectiles = current.projectiles.filter((projectile) => projectile.expiresAt > elapsed)
        occupiedTowers.forEach((slot) => {
          if (!slot.occupiedBy) return
          const tower = TOWER_ARCHETYPES.find((item) => item.id === slot.occupiedBy)
          if (!tower) return
          const interval = tower.attackInterval / Math.max(0.5, runtimeConfig.towerPowerMultiplier)
          const shouldFire = Math.floor(current.elapsed / interval) !== Math.floor(elapsed / interval)
          if (!shouldFire) return

          const range = TOWER_RANGES[tower.id] + (slot.level - 1) * 2
          const targetsInRange = enemies
            .map((enemy, index) => {
              const position = positionOnPath(enemy.progress)
              return {
                index,
                position,
                distance: Math.hypot(position.x - slot.x, position.y - slot.y),
                progress: enemy.progress,
              }
            })
            .filter((target) => target.distance <= range)
            .sort((a, b) => b.progress - a.progress)
          const target = targetsInRange[0]
          if (!target) return

          const damage = runtimeConfig.towerDamage
            * tower.damageMultiplier
            * runtimeConfig.towerPowerMultiplier
            * (1 + (slot.level - 1) * 0.55)
          enemies[target.index] = {
            ...enemies[target.index],
            health: enemies[target.index].health - damage,
          }
          projectileId.current += 1
          projectiles.push({
            id: projectileId.current,
            towerId: slot.id,
            towerType: tower.id,
            fromX: slot.x,
            fromY: slot.y,
            toX: target.position.x,
            toY: target.position.y,
            color: tower.accent,
            expiresAt: elapsed + (tower.id === 'cannon' ? 0.45 : 0.28),
          })
        })

        const heroTargetIndex = enemies.reduce<number | null>((best, enemy, index, list) => {
          if (Math.abs(enemy.progress - heroProgress) > 14) return best
          if (best === null) return index
          return Math.abs(enemy.progress - heroProgress) < Math.abs(list[best].progress - heroProgress)
            ? index
            : best
        }, null)
        if (heroTargetIndex !== null) {
          enemies[heroTargetIndex] = {
            ...enemies[heroTargetIndex],
            health: enemies[heroTargetIndex].health - runtimeConfig.towerDamage * 0.7 * tick,
          }
        }

        const defeated = enemies.filter((enemy) => enemy.health <= 0)
        const arrived = enemies.filter((enemy) => enemy.progress >= 100 && enemy.health > 0)
        enemies = enemies.filter((enemy) => enemy.health > 0 && enemy.progress < 100)
        const baseHealth = Math.max(0, current.baseHealth - arrived.length)
        const coins = current.coins + defeated.length * 18
        const kills = current.kills + defeated.length
        const finalWaveFinished =
          wave === 3
          && spawnedInWave >= runtimeConfig.waveSize
          && phase >= spawnWindow
          && enemies.length === 0

        if (baseHealth <= 0) {
          setAnnouncement('基地失守，请调整策略后重新挑战')
          return {
            ...current,
            status: 'lost',
            elapsed,
            baseHealth,
            coins,
            kills,
            wave,
            spawnedInWave,
            enemies,
            projectiles,
          }
        }
        if (finalWaveFinished) {
          setAnnouncement('三波守卫完成')
          return {
            ...current,
            status: 'won',
            elapsed,
            baseHealth,
            coins,
            kills,
            wave,
            spawnedInWave,
            enemies,
            projectiles,
          }
        }

        return {
          ...current,
          elapsed,
          baseHealth,
          coins,
          kills,
          wave,
          spawnedInWave,
          enemies,
          projectiles,
        }
      })
    }, 100)

    return () => window.clearInterval(timer)
  }, [heroProgress, occupiedTowers, runtime.status, runtimeConfig, suspended])

  const togglePlay = () => {
    if (runtime.status === 'won' || runtime.status === 'lost') {
      enemyId.current = 0
      setRuntime(createRuntime(runtimeConfig, 'playing'))
      setAnnouncement('已开始新一轮守卫')
      return
    }
    const status = runtime.status === 'playing' ? 'paused' : 'playing'
    setRuntime((current) => ({ ...current, status }))
    setAnnouncement(status === 'playing' ? '对局已开始' : '对局已暂停')
  }

  const towerBuildCost = (tower: (typeof TOWER_ARCHETYPES)[number]) =>
    Math.round(runtimeConfig.towerCost * tower.costMultiplier)

  const buildTower = (slot: TowerSlot, tower: (typeof TOWER_ARCHETYPES)[number]) => {
    const buildCost = Math.round(runtimeConfig.towerCost * tower.costMultiplier)
    if (runtime.coins < buildCost || slot.occupiedBy) return
    const nextSlots = towerSlots.map((item) =>
      item.id === slot.id ? { ...item, occupiedBy: tower.id, level: 1 } : item,
    )
    setRuntime((current) => ({ ...current, coins: current.coins - buildCost }))
    setAnnouncement(`${tower.name}已建造在 ${slot.label} 号塔位`)
    onFlowChange({ ...flow, towerSlots: nextSlots })
    setActiveTowerSlotId(null)
  }

  const upgradeTower = (slot: TowerSlot) => {
    const tower = TOWER_ARCHETYPES.find((item) => item.id === slot.occupiedBy)
    if (!tower || slot.level >= 3) return
    const upgradeCost = Math.round(towerBuildCost(tower) * 0.65 * slot.level)
    if (runtime.coins < upgradeCost) return
    onFlowChange({
      ...flow,
      towerSlots: towerSlots.map((item) =>
        item.id === slot.id ? { ...item, level: item.level + 1 } : item,
      ),
    })
    setRuntime((current) => ({ ...current, coins: current.coins - upgradeCost }))
    setAnnouncement(`${tower.name}已升至 ${slot.level + 1} 级`)
    setActiveTowerSlotId(null)
  }

  const demolishTower = (slot: TowerSlot) => {
    const tower = TOWER_ARCHETYPES.find((item) => item.id === slot.occupiedBy)
    if (!tower) return
    const buildCost = towerBuildCost(tower)
    const invested = Array.from({ length: Math.max(0, slot.level - 1) }, (_, index) =>
      Math.round(buildCost * 0.65 * (index + 1)),
    ).reduce((sum, cost) => sum + cost, buildCost)
    const refund = Math.round(invested * DEMOLISH_REFUND_RATE)
    onFlowChange({
      ...flow,
      towerSlots: towerSlots.map((item) =>
        item.id === slot.id ? { ...item, occupiedBy: null, level: 0 } : item,
      ),
    })
    setRuntime((current) => ({ ...current, coins: current.coins + refund }))
    setAnnouncement(`已拆除${tower.name}，返还 ${refund} 金币`)
    setActiveTowerSlotId(null)
  }

  const activateHeroSkill = (skill: 'charge' | 'guard') => {
    if (runtime.status !== 'playing' || skillCooldowns[skill] > 0) return
    if (skill === 'charge') {
      setRuntime((current) => ({
        ...current,
        enemies: current.enemies.map((enemy) =>
          Math.abs(enemy.progress - heroProgress) <= 20
            ? { ...enemy, health: enemy.health - runtimeConfig.enemyHealth * 0.48 }
            : enemy,
        ),
      }))
      setSkillCooldowns((current) => ({ ...current, charge: 6 }))
      setAnnouncement('英雄释放「破阵」')
      return
    }
    setRuntime((current) => ({
      ...current,
      baseHealth: Math.min(runtimeConfig.baseHealth, current.baseHealth + 2),
    }))
    setSkillCooldowns((current) => ({ ...current, guard: 10 }))
    setAnnouncement('英雄释放「守城」，城门恢复 2 点生命')
  }

  return (
    <section
      aria-label="塔防游戏页面画布"
      className={`relative flex min-h-[480px] min-w-0 flex-1 overflow-visible bg-transparent [container-type:size] ${className}`}
    >
      <div
        className="relative z-10 m-auto aspect-[390/844] shrink-0 overflow-hidden rounded-[30px] border-[5px] border-[#111319] shadow-[0_30px_75px_-28px_rgba(15,23,27,0.5)]"
        style={{
          width: 'min(390px, calc((100cqh - 48px) * 390 / 844), calc(100cqw - 48px))',
          background: preset.surface,
          color: preset.ink,
        }}
      >
        <div className="absolute inset-x-0 top-0 z-50 flex h-7 items-center justify-between px-4 text-[7px] font-semibold">
          <span>9:41</span>
          <span className="h-1.5 w-14 rounded-full bg-current opacity-90" />
          <span>5G · 100%</span>
        </div>

        {hud?.visible ? (
          <div
            className="absolute inset-x-0 top-0 z-30 flex h-[12%] items-end justify-between border-b border-white/10 px-4 pb-2.5"
            style={{ ...uiStyle(hud), background: `${preset.surface}F2` }}
          >
            <Metric icon={<Heart className="size-3.5" style={{ color: preset.accent }} />} label="基地生命" value={runtime.baseHealth} />
            <div className="pb-0.5 text-center">
              <p className="text-[9px] font-semibold">月隐林 · 01</p>
              <p className="mt-0.5 text-[6px]" style={{ color: preset.muted }}>守住月光灯塔</p>
            </div>
            <Metric icon={<Coins className="size-3.5" style={{ color: preset.accent }} />} label="金币" value={runtime.coins} />
          </div>
        ) : null}

        <div
          className="absolute inset-x-0 bottom-[21%] top-[12%] overflow-hidden"
          style={{ background: preset.map }}
        >
          {mapPreview ? <img src={mapPreview} alt="已确认战场地图" className="absolute inset-0 size-full object-cover" /> : null}
          <div className="absolute inset-0 opacity-75" style={{ backgroundImage: 'radial-gradient(circle at 25% 22%,rgba(255,255,255,.12),transparent 18%),radial-gradient(circle at 70% 62%,rgba(255,255,255,.09),transparent 26%)' }} />
          <svg className="absolute inset-0 size-full opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M12 3 C18 17 33 18 65 21 C87 23 84 36 55 45 C34 51 17 49 18 62 C20 70 62 63 70 68 C86 75 72 88 46 95" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="13" strokeLinecap="round" />
            <path d="M12 3 C18 17 33 18 65 21 C87 23 84 36 55 45 C34 51 17 49 18 62 C20 70 62 63 70 68 C86 75 72 88 46 95" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="7" strokeLinecap="round" strokeDasharray="1.5 2" />
          </svg>

          <svg className="pointer-events-none absolute inset-0 z-30 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {runtime.projectiles.map((projectile) => (
              <g key={projectile.id}>
                <line
                  x1={projectile.fromX}
                  y1={projectile.fromY}
                  x2={projectile.toX}
                  y2={projectile.toY}
                  stroke={projectile.color}
                  strokeWidth={projectile.towerType === 'cannon' ? 1.4 : 0.75}
                  strokeLinecap="round"
                  strokeDasharray={projectile.towerType === 'frost' ? '2 1.2' : undefined}
                  opacity="0.9"
                />
                <circle
                  cx={projectile.toX}
                  cy={projectile.toY}
                  r={projectile.towerType === 'cannon' ? 2.4 : 1.2}
                  fill={projectile.color}
                  opacity="0.85"
                />
              </g>
            ))}
          </svg>

          <div className="absolute left-[4%] top-[1%] grid size-8 place-items-center rounded-full border border-rose-200/30 bg-rose-400/20 text-[7px] font-semibold text-rose-50">入口</div>
          <div className="absolute bottom-[1%] left-[38%] grid size-10 place-items-center rounded-[14px] border border-white/24 bg-black/35 text-[6px] font-semibold shadow-lg">
            <ShieldCheck className="size-4" style={{ color: preset.accent }} />
            <span className="absolute -bottom-3 whitespace-nowrap">城门</span>
          </div>

          {HERO_ROUTE_STOPS.map((routeProgress, index) => {
            const position = positionOnPath(routeProgress)
            const selected = routeProgress === heroTargetProgress
            return (
              <button
                key={routeProgress}
                type="button"
                onClick={() => {
                  setHeroTargetProgress(routeProgress)
                  setAnnouncement(`英雄正在前往路线节点 ${index + 1}`)
                }}
                className={`absolute z-[11] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all ${selected ? 'border-white bg-white/80 shadow-[0_0_0_4px_rgba(255,255,255,.12)]' : 'border-white/35 bg-black/20 hover:bg-white/45'}`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                aria-label={`移动英雄到路线节点 ${index + 1}`}
              />
            )
          })}

          {(() => {
            const position = positionOnPath(heroProgress)
            return (
              <div
                className="pointer-events-none absolute z-20 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center drop-shadow-[0_5px_7px_rgba(0,0,0,.45)] transition-[left,top] duration-100"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                {heroPreview ? <img src={heroPreview} alt="已确认英雄" className="size-full object-contain" /> : <ShieldCheck className="size-6" style={{ color: preset.accent }} />}
                <span className="absolute -bottom-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[5px] font-semibold text-white">英雄</span>
              </div>
            )
          })()}

          {towerSlots.map((slot) => {
            const tower = TOWER_ARCHETYPES.find((item) => item.id === slot.occupiedBy)
            return (
              <div key={slot.id}>
                {tower && activeTowerSlotId === slot.id ? (
                  <span
                    className="pointer-events-none absolute z-[9] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-40"
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${(TOWER_RANGES[tower.id] + (slot.level - 1) * 2) * 2}%`,
                      aspectRatio: '1',
                      borderColor: tower.accent,
                      background: `radial-gradient(circle,${tower.accent}18,transparent 68%)`,
                    }}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setActiveTowerSlotId(slot.id)}
                  className={`absolute z-20 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[8px] font-bold shadow-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${tower ? 'size-10 border-white/34' : 'size-9 border-dashed border-white/42 bg-black/22 text-white/70'}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, backgroundColor: tower ? `${tower.accent}D9` : undefined }}
                  aria-label={tower ? `打开 ${slot.label} 号${tower.name}管理菜单` : `打开 ${slot.label} 号塔位建造菜单`}
                >
                  {tower && towerPreviews.length ? <img src={towerPreviews[TOWER_ARCHETYPES.indexOf(tower) % towerPreviews.length]} alt={tower.name} className="size-full rounded-full object-cover" /> : tower?.shortName ?? '+'}
                  {tower ? <span className="absolute -bottom-1 -right-1 grid size-3.5 place-items-center rounded-full bg-[#111319] text-[6px] text-white">{slot.level}</span> : null}
                </button>
              </div>
            )
          })}

          {activeTowerSlot ? (
            <div className="absolute bottom-3 left-1/2 z-50 w-[82%] -translate-x-1/2 rounded-2xl border border-white/16 bg-[#111719]/95 p-3 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold">
                    {activeTowerSlot.occupiedBy
                      ? `${TOWER_ARCHETYPES.find((tower) => tower.id === activeTowerSlot.occupiedBy)?.name ?? '防御塔'} · Lv.${activeTowerSlot.level}`
                      : `${activeTowerSlot.label} 号塔位`}
                  </p>
                  <p className="mt-0.5 text-[6px] text-white/50">
                    {activeTowerSlot.occupiedBy ? '选择升级或拆除' : '选择要建造的防御塔'}
                  </p>
                </div>
                <button type="button" onClick={() => setActiveTowerSlotId(null)} className="grid size-6 place-items-center rounded-full bg-white/8 text-[10px] text-white/60" aria-label="关闭塔位菜单">×</button>
              </div>
              {activeTowerSlot.occupiedBy ? (() => {
                const tower = TOWER_ARCHETYPES.find((item) => item.id === activeTowerSlot.occupiedBy)
                if (!tower) return null
                const buildCost = towerBuildCost(tower)
                const upgradeCost = Math.round(buildCost * 0.65 * activeTowerSlot.level)
                const invested = Array.from({ length: Math.max(0, activeTowerSlot.level - 1) }, (_, index) =>
                  Math.round(buildCost * 0.65 * (index + 1)),
                ).reduce((sum, cost) => sum + cost, buildCost)
                const refund = Math.round(invested * DEMOLISH_REFUND_RATE)
                const canUpgrade = activeTowerSlot.level < 3 && runtime.coins >= upgradeCost
                return (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" disabled={!canUpgrade} onClick={() => upgradeTower(activeTowerSlot)} className="rounded-xl border border-white/10 bg-white/10 px-2 py-2 text-left disabled:cursor-not-allowed disabled:opacity-35">
                      <strong className="block text-[8px]">{activeTowerSlot.level >= 3 ? '已满级' : '升级防御塔'}</strong>
                      <span className="mt-1 block text-[6px]" style={{ color: preset.accent }}>{activeTowerSlot.level >= 3 ? '当前已达上限' : `${upgradeCost} 金币`}</span>
                    </button>
                    <button type="button" onClick={() => demolishTower(activeTowerSlot)} className="rounded-xl border border-rose-300/15 bg-rose-300/8 px-2 py-2 text-left">
                      <strong className="block text-[8px]">拆除防御塔</strong>
                      <span className="mt-1 block text-[6px] text-rose-200/80">返还 {refund} 金币</span>
                    </button>
                  </div>
                )
              })() : (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {TOWER_ARCHETYPES.map((tower) => {
                    const price = towerBuildCost(tower)
                    const affordable = runtime.coins >= price
                    return (
                      <button key={tower.id} type="button" disabled={!affordable} onClick={() => buildTower(activeTowerSlot, tower)} className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35">
                        <span className="grid size-5 place-items-center rounded-md text-[7px] font-bold text-[#17201D]" style={{ background: tower.accent }}>{tower.shortName}</span>
                        <strong className="mt-1.5 block truncate text-[7px]">{tower.name}</strong>
                        <span className="mt-1 block text-[6px]" style={{ color: preset.accent }}>{price} 金币</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          {runtime.enemies.map((enemy) => {
            const position = positionOnPath(enemy.progress)
            const health = Math.max(0, Math.min(100, (enemy.health / enemy.maxHealth) * 100))
            return (
              <div key={enemy.id} className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
                {enemyPreviews.length ? (
                  <img src={enemyPreviews[enemy.id % enemyPreviews.length]} alt="已确认敌人" className="size-12 object-contain drop-shadow-md" />
                ) : (
                  <div className={`grid size-5 rotate-45 place-items-center border border-white/25 shadow-md ${enemy.kind === 'wisp' ? 'rounded-full bg-sky-300' : 'rounded-[6px] bg-[#A7CB89]'}`}>
                    <span className="-rotate-45 text-[5px] font-bold text-[#14201D]">{enemy.kind === 'wisp' ? '灵' : '苔'}</span>
                  </div>
                )}
                <div className="absolute -left-1 -top-2 h-0.5 w-12 overflow-hidden rounded-full bg-black/35"><i className="block h-full bg-rose-300" style={{ width: `${health}%` }} /></div>
              </div>
            )
          })}

          {progress?.visible ? (
            <div
              className="absolute left-1/2 top-[4%] z-30 w-[70%] -translate-x-1/2 rounded-full border border-white/12 px-3 py-2"
              style={{ ...uiStyle(progress), background: `${preset.surface}D9`, borderRadius: radius }}
            >
              <div className="flex items-center justify-between text-[6px] font-medium"><span>第 {runtime.wave} 波</span><span style={{ color: preset.muted }}>{runtime.kills} 已消灭</span></div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/12"><i className="block h-full rounded-full" style={{ width: `${Math.min(100, (runtime.spawnedInWave / runtimeConfig.waveSize) * 100)}%`, background: preset.accent }} /></div>
            </div>
          ) : null}

          {controls?.visible ? (
            <div
              className="absolute right-3 top-[18%] z-30 grid gap-1.5 rounded-2xl border border-white/12 p-1.5"
              style={{ ...uiStyle(controls), background: `${preset.surface}DD`, borderRadius: radius }}
            >
              <button type="button" onClick={togglePlay} className="grid size-7 place-items-center rounded-lg bg-white/10" aria-label={runtime.status === 'playing' ? '暂停对局' : '继续对局'}>{runtime.status === 'playing' ? <Pause className="size-3" /> : <Play className="size-3" />}</button>
              <span className="grid size-7 place-items-center rounded-lg bg-white/10 text-[7px] font-bold">1×</span>
              <span className="grid size-7 place-items-center rounded-lg" style={{ background: preset.accent, color: preset.surface }}><Zap className="size-3" /></span>
            </div>
          ) : null}

          {runtime.status === 'ready' || runtime.status === 'paused' ? (
            <button type="button" onClick={togglePlay} className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/18 bg-black/60 px-4 py-3 text-[9px] font-semibold text-white shadow-xl backdrop-blur-md hover:bg-black/75">
              <Play className="size-3.5" />{STATUS_COPY[runtime.status]}
            </button>
          ) : null}
        </div>

        {dock?.visible ? (
          <div
            className="absolute inset-x-0 bottom-0 z-30 h-[21%] border-t border-white/10 px-3 py-2.5"
            style={{ ...uiStyle(dock), background: preset.surface }}
          >
            <div className="mb-2 flex items-center justify-between text-[6px]" style={{ color: preset.muted }}><span>英雄守城 · 点击路线节点移动</span><span>{occupiedTowers.length} / {towerSlots.length} 已建造</span></div>
            <div className="grid grid-cols-[1.25fr_1fr_1fr] gap-2">
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-2" style={{ borderRadius: radius }}>
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/8">
                  {heroPreview ? <img src={heroPreview} alt="英雄头像" className="size-full object-contain" /> : <ShieldCheck className="size-4" style={{ color: preset.accent }} />}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-[8px]">守城英雄</strong>
                  <small className="mt-1 block truncate text-[6px]" style={{ color: preset.muted }}>路线节点 {HERO_ROUTE_STOPS.indexOf(heroTargetProgress as (typeof HERO_ROUTE_STOPS)[number]) + 1}
                  </small>
                </span>
              </div>
              <button type="button" disabled={runtime.status !== 'playing' || skillCooldowns.charge > 0} onClick={() => activateHeroSkill('charge')} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-2 text-left disabled:cursor-not-allowed disabled:opacity-45" style={{ borderRadius: radius }}>
                <span className="grid size-5 place-items-center rounded-md bg-rose-300/20 text-[10px]">⚔</span>
                <strong className="mt-1.5 block text-[7px]">破阵</strong>
                <span className="mt-0.5 block text-[5px]" style={{ color: preset.muted }}>范围伤害</span>
                {skillCooldowns.charge > 0 ? <i className="absolute right-2 top-2 not-italic text-[7px] font-semibold">{Math.ceil(skillCooldowns.charge)}s</i> : null}
              </button>
              <button type="button" disabled={runtime.status !== 'playing' || skillCooldowns.guard > 0} onClick={() => activateHeroSkill('guard')} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-2 text-left disabled:cursor-not-allowed disabled:opacity-45" style={{ borderRadius: radius }}>
                <span className="grid size-5 place-items-center rounded-md bg-amber-200/20"><ShieldCheck className="size-3" style={{ color: preset.accent }} /></span>
                <strong className="mt-1.5 block text-[7px]">守城</strong>
                <span className="mt-0.5 block text-[5px]" style={{ color: preset.muted }}>恢复城门</span>
                {skillCooldowns.guard > 0 ? <i className="absolute right-2 top-2 not-italic text-[7px] font-semibold">{Math.ceil(skillCooldowns.guard)}s</i> : null}
              </button>
            </div>
          </div>
        ) : null}

        {(runtime.status === 'won' || runtime.status === 'lost') && result?.visible ? (
          <div className="absolute inset-0 z-50 grid place-items-center bg-black/58 px-8 backdrop-blur-[2px]">
            <div className="w-full border border-white/14 p-5 text-center shadow-2xl" style={{ ...uiStyle(result), background: preset.surfaceRaised, borderRadius: Math.max(16, radius + 6) }}>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl" style={{ background: `${preset.accent}26`, color: preset.accent }}><ShieldCheck className="size-6" /></span>
              <h3 className="mt-3 text-[16px] font-semibold">{runtime.status === 'won' ? '守卫成功' : '灯塔失守'}</h3>
              <p className="mt-1 text-[7px]" style={{ color: preset.muted }}>{runtime.status === 'won' ? '月光灯塔再次照亮了林地' : '调整塔位与经济后再次挑战'}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[[runtime.kills, '消灭'], [runtime.wave, '波次'], [runtime.baseHealth, '生命']].map(([value, label]) => <div key={label} className="rounded-lg bg-white/[0.06] py-2"><strong className="block text-[12px]">{value}</strong><span className="text-[6px]" style={{ color: preset.muted }}>{label}</span></div>)}
              </div>
              <button type="button" onClick={togglePlay} className="mt-4 h-9 w-full rounded-xl text-[8px] font-semibold" style={{ background: preset.accent, color: preset.surface }}>{STATUS_COPY[runtime.status]}</button>
            </div>
          </div>
        ) : null}

        <button type="button" onClick={reset} className="absolute bottom-[22.5%] left-3 z-40 grid size-7 place-items-center rounded-lg border border-white/10 bg-black/24 text-white/70 backdrop-blur" aria-label="重开试玩" title="重开试玩"><RefreshCw className="size-3" /></button>
      </div>

      <p className="sr-only" aria-live="polite">{announcement}</p>
    </section>
  )
}

export default TowerDefensePageCanvas
