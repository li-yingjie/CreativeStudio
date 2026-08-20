import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CheckCircle2,
  Coins,
  Gauge,
  Heart,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from '@/shared/icons'
import {
  TOWER_ARCHETYPES,
  type FastGameplayConfig,
  type TowerArchetypeId,
  type TowerSlot,
} from './TowerDefenseFlowModel'

type DemoStatus = 'ready' | 'playing' | 'paused' | 'won' | 'lost'

interface DemoEnemy {
  id: number
  progress: number
  health: number
  maxHealth: number
  kind: 'mossling' | 'wisp'
}

interface DemoRuntime {
  status: DemoStatus
  elapsed: number
  coins: number
  baseHealth: number
  wave: number
  kills: number
  spawnedInWave: number
  enemies: DemoEnemy[]
}

const STATUS_COPY: Record<DemoStatus, string> = {
  ready: '点击开始试玩',
  playing: '对局进行中',
  paused: '已暂停',
  won: '验证通过',
  lost: '基地失守',
}

const STATUS_CLASS: Record<DemoStatus, string> = {
  ready: 'bg-white/12 text-white/72',
  playing: 'bg-emerald-400/18 text-emerald-200',
  paused: 'bg-amber-300/18 text-amber-100',
  won: 'bg-emerald-400/18 text-emerald-100',
  lost: 'bg-rose-400/18 text-rose-100',
}

const PATH_POINTS = [
  [12, 4],
  [20, 17],
  [65, 20],
  [78, 34],
  [55, 45],
  [25, 48],
  [18, 62],
  [70, 68],
  [76, 82],
  [46, 94],
] as const

function positionOnPath(progress: number) {
  const safe = Math.max(0, Math.min(99.9, progress))
  const scaled = (safe / 100) * (PATH_POINTS.length - 1)
  const index = Math.floor(scaled)
  const fraction = scaled - index
  const start = PATH_POINTS[index]
  const end = PATH_POINTS[Math.min(index + 1, PATH_POINTS.length - 1)]
  return {
    x: start[0] + (end[0] - start[0]) * fraction,
    y: start[1] + (end[1] - start[1]) * fraction,
  }
}

function createRuntime(config: FastGameplayConfig, status: DemoStatus = 'ready'): DemoRuntime {
  return {
    status,
    elapsed: 0,
    coins: config.startingCoins,
    baseHealth: config.baseHealth,
    wave: 1,
    kills: 0,
    spawnedInWave: 0,
    enemies: [],
  }
}

function formatSeconds(value: number) {
  const seconds = Math.max(0, Math.ceil(value))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-white/62">
      <span className="text-white/46">{icon}</span>
      <span className="sr-only">{label}</span>
      <strong className="font-semibold text-white">{value}</strong>
    </div>
  )
}

export interface TowerDefenseGameplayWorkspaceProps {
  config: FastGameplayConfig
  selectedTower: TowerArchetypeId
  towerSlots: TowerSlot[]
  onSelectedTowerChange: (tower: TowerArchetypeId) => void
  onTowerSlotsChange: (slots: TowerSlot[]) => void
  className?: string
}

export function TowerDefenseGameplayWorkspace({
  config,
  selectedTower,
  towerSlots,
  onSelectedTowerChange,
  onTowerSlotsChange,
  className = '',
}: TowerDefenseGameplayWorkspaceProps) {
  const [runtime, setRuntime] = useState(() => createRuntime(config))
  const [announcement, setAnnouncement] = useState('试玩尚未开始')
  const enemyId = useRef(0)

  const occupiedTowers = useMemo(
    () => towerSlots.filter((slot) => slot.occupiedBy !== null),
    [towerSlots],
  )

  const reset = useCallback(() => {
    enemyId.current = 0
    setRuntime(createRuntime(config))
    setAnnouncement('已重置对局，可重新开始')
  }, [config])

  useEffect(() => {
    if (runtime.status !== 'playing') return undefined

    const timer = window.setInterval(() => {
      setRuntime((current) => {
        if (current.status !== 'playing') return current

        const tick = 0.1
        const elapsed = current.elapsed + tick
        const wave = Math.min(3, Math.floor(elapsed / config.waveInterval) + 1)
        let spawnedInWave = wave === current.wave ? current.spawnedInWave : 0
        let enemies = current.enemies.map((enemy) => ({
          ...enemy,
          progress: enemy.progress + config.enemySpeed * (enemy.kind === 'wisp' ? 0.42 : 0.3),
        }))

        const phase = elapsed - (wave - 1) * config.waveInterval
        const spawnWindow = Math.max(4, config.waveInterval * 0.68)
        const targetSpawns = Math.min(
          config.waveSize,
          Math.max(0, Math.floor((phase / spawnWindow) * config.waveSize) + 1),
        )

        while (spawnedInWave < targetSpawns) {
          const kind: DemoEnemy['kind'] = (spawnedInWave + wave) % 4 === 0 ? 'wisp' : 'mossling'
          const maxHealth = config.enemyHealth * (1 + (wave - 1) * 0.18) * (kind === 'wisp' ? 0.72 : 1)
          enemyId.current += 1
          enemies.push({ id: enemyId.current, progress: 0, health: maxHealth, maxHealth, kind })
          spawnedInWave += 1
        }

        const towerPower = occupiedTowers.reduce((total, slot) => {
          const tower = TOWER_ARCHETYPES.find((item) => item.id === slot.occupiedBy)
          return total + (tower?.damageMultiplier ?? 0) * config.towerDamage * slot.level
        }, 0)

        if (towerPower > 0 && enemies.length > 0) {
          const targetIndex = enemies.reduce(
            (best, enemy, index, list) => enemy.progress > list[best].progress ? index : best,
            0,
          )
          enemies[targetIndex] = {
            ...enemies[targetIndex],
            health: enemies[targetIndex].health - towerPower * tick,
          }
        }

        const defeated = enemies.filter((enemy) => enemy.health <= 0)
        const arrived = enemies.filter((enemy) => enemy.progress >= 100 && enemy.health > 0)
        enemies = enemies.filter((enemy) => enemy.health > 0 && enemy.progress < 100)
        const baseHealth = Math.max(0, current.baseHealth - arrived.length)
        const coins = current.coins + defeated.length * 18
        const kills = current.kills + defeated.length
        const finalWaveFinished = wave === 3
          && spawnedInWave >= config.waveSize
          && phase >= spawnWindow
          && enemies.length === 0

        if (baseHealth <= 0) {
          setAnnouncement('基地失守，请调整建塔策略或参数')
          return { ...current, status: 'lost', elapsed, baseHealth, coins, kills, wave, spawnedInWave, enemies }
        }
        if (finalWaveFinished) {
          setAnnouncement('三波测试已通过，核心循环可行')
          return { ...current, status: 'won', elapsed, baseHealth, coins, kills, wave, spawnedInWave, enemies }
        }

        return { ...current, elapsed, baseHealth, coins, kills, wave, spawnedInWave, enemies }
      })
    }, 100)

    return () => window.clearInterval(timer)
  }, [config, occupiedTowers, runtime.status])

  const togglePlay = () => {
    if (runtime.status === 'won' || runtime.status === 'lost') {
      enemyId.current = 0
      setRuntime(createRuntime(config, 'playing'))
      setAnnouncement('已开始新一轮试玩')
      return
    }
    const nextStatus: DemoStatus = runtime.status === 'playing' ? 'paused' : 'playing'
    setRuntime((current) => ({ ...current, status: nextStatus }))
    setAnnouncement(nextStatus === 'playing' ? '对局已开始' : '对局已暂停')
  }

  const handleTowerSlot = (slot: TowerSlot) => {
    const tower = TOWER_ARCHETYPES.find((item) => item.id === selectedTower) ?? TOWER_ARCHETYPES[0]
    const buildCost = Math.round(config.towerCost * tower.costMultiplier)

    if (slot.occupiedBy) {
      const upgradeCost = Math.round(buildCost * 0.65 * slot.level)
      if (runtime.coins < upgradeCost || slot.level >= 3) {
        setAnnouncement(slot.level >= 3 ? `${slot.label} 号塔位已满级` : `金币不足，升级需要 ${upgradeCost}`)
        return
      }
      onTowerSlotsChange(towerSlots.map((item) => item.id === slot.id ? { ...item, level: item.level + 1 } : item))
      setRuntime((current) => ({ ...current, coins: current.coins - upgradeCost }))
      setAnnouncement(`${slot.label} 号塔位已升至 ${slot.level + 1} 级`)
      return
    }

    if (runtime.coins < buildCost) {
      setAnnouncement(`金币不足，建造${tower.name}需要 ${buildCost}`)
      return
    }
    onTowerSlotsChange(towerSlots.map((item) => item.id === slot.id ? { ...item, occupiedBy: tower.id, level: 1 } : item))
    setRuntime((current) => ({ ...current, coins: current.coins - buildCost }))
    setAnnouncement(`${tower.name}已建造在 ${slot.label} 号塔位`)
  }

  const selectedTowerInfo = TOWER_ARCHETYPES.find((item) => item.id === selectedTower) ?? TOWER_ARCHETYPES[0]
  const timeRemaining = Math.max(0, config.waveInterval - (runtime.elapsed % config.waveInterval))

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F5F6F7] ${className}`}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[12px] font-semibold text-[#161823]">核心玩法 Demo</h2>
            <span className="rounded-full bg-[#F0F1F3] px-2 py-1 text-[8px] font-medium text-[#161823]/46">几何体原型</span>
          </div>
          <p className="mt-0.5 text-[8px] text-[#161823]/34">点击塔位建造，再用对局验证压力、经济与节奏</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            className="grid size-8 place-items-center rounded-lg border border-black/[0.08] bg-white text-[#161823]/54 transition-colors hover:bg-[#F3F4F5] hover:text-[#161823]"
            aria-label="重开试玩"
            title="重开"
          >
            <RefreshCw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[9px] font-medium text-white transition-colors hover:bg-[#2C2D35]"
          >
            {runtime.status === 'playing' ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {runtime.status === 'playing' ? '暂停' : runtime.status === 'paused' ? '继续' : runtime.status === 'ready' ? '开始试玩' : '再试一局'}
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto px-5 py-5 sm:px-8">
        <div className="mx-auto flex min-h-full w-full max-w-[1060px] items-center justify-center gap-7 xl:gap-10">
          <div className="hidden w-[164px] shrink-0 space-y-3 lg:block">
            <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-[9px] font-semibold text-[#161823]/70">
                <Target className="size-3.5" />测试目标
              </div>
              <p className="mt-2 text-[9px] leading-[15px] text-[#161823]/42">守住 3 波来敌，并确保基地至少剩余 1 点生命。</p>
            </div>
            <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-sm">
              <div className="text-[8px] font-medium uppercase tracking-[0.16em] text-[#161823]/30">Live readout</div>
              <dl className="mt-2.5 space-y-2.5 text-[9px]">
                <div className="flex justify-between"><dt className="text-[#161823]/42">建造数</dt><dd className="font-semibold text-[#161823]/74">{occupiedTowers.length} / {towerSlots.length}</dd></div>
                <div className="flex justify-between"><dt className="text-[#161823]/42">消灭</dt><dd className="font-semibold text-[#161823]/74">{runtime.kills}</dd></div>
                <div className="flex justify-between"><dt className="text-[#161823]/42">场上敌人</dt><dd className="font-semibold text-[#161823]/74">{runtime.enemies.length}</dd></div>
                <div className="flex justify-between"><dt className="text-[#161823]/42">本波剩余</dt><dd className="font-semibold text-[#161823]/74">{formatSeconds(timeRemaining)}</dd></div>
              </dl>
            </div>
          </div>

          <div className="w-full max-w-[398px] shrink-0">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="text-[9px] font-medium text-[#161823]/46">9:16 可玩预览</span>
              <span className="flex items-center gap-1.5 text-[8px] text-[#161823]/38">
                <i className={`size-1.5 rounded-full ${runtime.status === 'playing' ? 'animate-pulse bg-emerald-500' : 'bg-[#161823]/22'}`} />
                {STATUS_COPY[runtime.status]}
              </span>
            </div>
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[28px] border-[5px] border-[#111319] bg-[#111A1D] shadow-[0_30px_75px_-28px_rgba(15,23,27,0.48)]">
              <div className="absolute inset-x-0 top-0 z-30 flex h-[8.5%] items-center justify-between border-b border-white/10 bg-[#11171B]/88 px-4 backdrop-blur-md">
                <Metric icon={<Heart className="size-3.5" />} label="基地生命" value={runtime.baseHealth} />
                <div className="rounded-full bg-black/26 px-3 py-1.5 text-center text-[9px] font-semibold text-white">
                  波次 {runtime.wave} / 3
                </div>
                <Metric icon={<Coins className="size-3.5" />} label="金币" value={runtime.coins} />
              </div>

              <div className="absolute inset-x-0 bottom-[19%] top-[8.5%] overflow-hidden bg-[#263832]">
                <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 30% 18%, rgba(211,229,174,.16), transparent 24%), radial-gradient(circle at 74% 63%, rgba(103,161,136,.2), transparent 29%), linear-gradient(145deg,#2c4038,#192a28)' }} />
                <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M12 4 C18 16 28 18 65 20 C86 22 84 36 55 45 C34 51 17 49 18 62 C20 70 62 63 70 68 C86 75 72 88 46 94" fill="none" stroke="rgba(11,14,15,.35)" strokeWidth="13" strokeLinecap="round" />
                  <path d="M12 4 C18 16 28 18 65 20 C86 22 84 36 55 45 C34 51 17 49 18 62 C20 70 62 63 70 68 C86 75 72 88 46 94" fill="none" stroke="rgba(211,199,161,.2)" strokeWidth="8" strokeLinecap="round" strokeDasharray="1.5 2" />
                </svg>

                <div className="absolute left-[4%] top-[1%] z-10 grid size-8 place-items-center rounded-full border border-rose-200/30 bg-rose-400/16 text-[7px] font-semibold text-rose-100">入口</div>
                <div className="absolute bottom-[1%] left-[38%] z-10 grid size-12 place-items-center rounded-[16px] border border-amber-100/30 bg-[#293532] text-center text-[7px] font-semibold text-amber-100 shadow-lg">
                  <ShieldCheck className="mb-0.5 size-4" />灯塔
                </div>

                {towerSlots.map((slot) => {
                  const tower = TOWER_ARCHETYPES.find((item) => item.id === slot.occupiedBy)
                  const isEmpty = tower === undefined
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleTowerSlot(slot)}
                      className={`absolute z-20 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isEmpty ? 'size-9 border-dashed border-white/42 bg-black/22 text-white/66' : 'size-10 border-white/34 text-white shadow-[0_6px_18px_rgba(0,0,0,.38)]'}`}
                      style={{ left: `${slot.x}%`, top: `${slot.y}%`, backgroundColor: tower ? `${tower.accent}D9` : undefined }}
                      aria-label={isEmpty ? `在 ${slot.label} 号塔位建造${selectedTowerInfo.name}` : `升级 ${slot.label} 号${tower.name}`}
                      title={isEmpty ? `建造${selectedTowerInfo.name}` : `点击升级 · Lv.${slot.level}`}
                    >
                      <span className="text-[8px] font-bold">{tower?.shortName ?? '+'}</span>
                      {tower ? <span className="absolute -bottom-1 -right-1 grid size-3.5 place-items-center rounded-full bg-[#111319] text-[6px] font-bold text-white">{slot.level}</span> : null}
                    </button>
                  )
                })}

                {runtime.enemies.map((enemy) => {
                  const position = positionOnPath(enemy.progress)
                  const healthPercent = Math.max(0, Math.min(100, (enemy.health / enemy.maxHealth) * 100))
                  return (
                    <div
                      key={enemy.id}
                      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    >
                      <div className={`grid size-5 rotate-45 place-items-center border border-white/25 shadow-md ${enemy.kind === 'wisp' ? 'rounded-full bg-sky-300' : 'rounded-[6px] bg-[#A7CB89]'}`}>
                        <span className="-rotate-45 text-[5px] font-bold text-[#14201D]">{enemy.kind === 'wisp' ? '灵' : '苔'}</span>
                      </div>
                      <div className="absolute -left-1 -top-2 h-0.5 w-7 overflow-hidden rounded-full bg-black/35">
                        <i className="block h-full bg-rose-300" style={{ width: `${healthPercent}%` }} />
                      </div>
                    </div>
                  )
                })}

                {(runtime.status === 'ready' || runtime.status === 'paused' || runtime.status === 'won' || runtime.status === 'lost') ? (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/18 bg-[#0D1113]/84 px-4 py-3 text-[10px] font-semibold text-white shadow-xl backdrop-blur-md hover:bg-[#0D1113]"
                  >
                    {runtime.status === 'won' ? <CheckCircle2 className="size-4 text-emerald-300" /> : <Play className="size-4" />}
                    {runtime.status === 'ready' ? '开始试玩' : runtime.status === 'paused' ? '继续对局' : runtime.status === 'won' ? '通过 · 再试一局' : '重新挑战'}
                  </button>
                ) : null}
              </div>

              <div className="absolute inset-x-0 bottom-0 z-30 h-[19%] border-t border-white/10 bg-[#11171B] px-3 pb-3 pt-2.5">
                <div className="mb-2 flex items-center justify-between text-[7px] text-white/42">
                  <span>选择防御塔后点击地图塔位</span>
                  <span>基础造价 {config.towerCost}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TOWER_ARCHETYPES.map((tower) => {
                    const active = selectedTower === tower.id
                    const price = Math.round(config.towerCost * tower.costMultiplier)
                    return (
                      <button
                        key={tower.id}
                        type="button"
                        onClick={() => onSelectedTowerChange(tower.id)}
                        className={`rounded-xl border px-2 py-2 text-left transition ${active ? 'border-white/44 bg-white/13' : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.08]'}`}
                        aria-pressed={active}
                      >
                        <div className="flex items-center justify-between">
                          <span className="grid size-5 place-items-center rounded-md text-[7px] font-bold text-[#111319]" style={{ backgroundColor: tower.accent }}>{tower.shortName}</span>
                          <span className="text-[7px] font-semibold text-amber-100/80">{price}</span>
                        </div>
                        <span className="mt-1.5 block text-[8px] font-medium text-white/82">{tower.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={`absolute left-1/2 top-[10.5%] z-40 -translate-x-1/2 rounded-full px-3 py-1.5 text-[7px] font-medium backdrop-blur ${STATUS_CLASS[runtime.status]}`}>
                {STATUS_COPY[runtime.status]}
              </div>
            </div>
          </div>

          <div className="hidden w-[164px] shrink-0 space-y-3 lg:block">
            <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-[9px] font-semibold text-[#161823]/70">
                <Sparkles className="size-3.5" />操作方式
              </div>
              <ol className="mt-2 space-y-2 text-[8px] leading-[13px] text-[#161823]/42">
                <li><b className="mr-1 text-[#161823]/70">1.</b>选择塔型</li>
                <li><b className="mr-1 text-[#161823]/70">2.</b>点击空塔位建造</li>
                <li><b className="mr-1 text-[#161823]/70">3.</b>再次点击升级</li>
              </ol>
            </div>
            <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[8px] text-[#161823]/38"><span>当前选择</span><span className="grid size-5 place-items-center rounded-md text-[7px] font-bold text-[#111319]" style={{ backgroundColor: selectedTowerInfo.accent }}>{selectedTowerInfo.shortName}</span></div>
              <p className="mt-2 text-[10px] font-semibold text-[#161823]/76">{selectedTowerInfo.name}</p>
              <p className="mt-1 text-[8px] leading-[13px] text-[#161823]/36">造价 {Math.round(config.towerCost * selectedTowerInfo.costMultiplier)} · 伤害系数 {selectedTowerInfo.damageMultiplier}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </div>
  )
}

interface FastRangeProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  valueLabel?: string
  note: string
  onChange: (value: number) => void
}

function FastRange({ label, value, min, max, step = 1, valueLabel, note, onChange }: FastRangeProps) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <label className="block rounded-xl border border-black/[0.07] bg-white px-3 py-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[9px] font-medium text-[#161823]/62">{label}</span>
        <span className="rounded-md bg-[#F1F2F3] px-2 py-1 text-[9px] font-semibold tabular-nums text-[#161823]/72">{valueLabel ?? value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8E9EB] accent-[#161823]"
        style={{ background: `linear-gradient(to right, #161823 ${percent}%, #E8E9EB ${percent}%)` }}
      />
      <span className="mt-1.5 block text-[8px] leading-[12px] text-[#161823]/32">{note}</span>
    </label>
  )
}

function ConfigSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold text-[#161823]/72">
        <span className="text-[#161823]/46">{icon}</span>{title}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

export interface TowerDefenseFastConfigPanelProps {
  config: FastGameplayConfig
  onChange: (config: FastGameplayConfig) => void
  onConfirm?: () => void
  className?: string
}

export function TowerDefenseFastConfigPanel({
  config,
  onChange,
  onConfirm,
  className = '',
}: TowerDefenseFastConfigPanelProps) {
  const patch = <Key extends keyof FastGameplayConfig>(key: Key, value: FastGameplayConfig[Key]) => {
    onChange({ ...config, [key]: value })
  }
  const pressure = Math.round((config.waveSize * config.enemyHealth * config.enemySpeed) / Math.max(1, config.towerDamage * 7))
  const economy = Math.max(1, Math.floor(config.startingCoins / config.towerCost))

  return (
    <aside className={`flex h-full min-h-0 w-full flex-col bg-[#F7F7F8] ${className}`} aria-label="Fast 玩法配置">
      <div className="shrink-0 border-b border-black/[0.07] bg-white px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[#F2F3F4] px-3 py-2">
            <div className="flex items-center gap-1 text-[8px] text-[#161823]/36"><Gauge className="size-3" />压力指数</div>
            <p className="mt-1 text-[13px] font-semibold text-[#161823]/76">{pressure}<span className="ml-1 text-[8px] font-normal text-[#161823]/36">/ 10</span></p>
          </div>
          <div className="rounded-lg bg-[#F2F3F4] px-3 py-2">
            <div className="flex items-center gap-1 text-[8px] text-[#161823]/36"><Coins className="size-3" />开局可建</div>
            <p className="mt-1 text-[13px] font-semibold text-[#161823]/76">{economy}<span className="ml-1 text-[8px] font-normal text-[#161823]/36">座基础塔</span></p>
          </div>
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <ConfigSection title="节奏与敌群" icon={<Zap className="size-3.5" />}>
          <FastRange label="每波数量" value={config.waveSize} min={4} max={16} note="决定同一波的总压力。" valueLabel={`${config.waveSize} 个`} onChange={(value) => patch('waveSize', value)} />
          <FastRange label="波次间隔" value={config.waveInterval} min={14} max={36} note="越短越紧凑，也会压缩建造时间。" valueLabel={`${config.waveInterval} 秒`} onChange={(value) => patch('waveInterval', value)} />
          <FastRange label="敌人速度" value={config.enemySpeed} min={0.7} max={1.6} step={0.1} note="直接影响防御塔可用输出时间。" valueLabel={`${config.enemySpeed.toFixed(1)}×`} onChange={(value) => patch('enemySpeed', value)} />
        </ConfigSection>

        <ConfigSection title="经济与建造" icon={<Coins className="size-3.5" />}>
          <FastRange label="初始金币" value={config.startingCoins} min={160} max={600} step={20} note="建议开局至少能建造 2 座塔。" valueLabel={`${config.startingCoins}`} onChange={(value) => patch('startingCoins', value)} />
          <FastRange label="基础造价" value={config.towerCost} min={50} max={140} step={10} note="各塔型在该数值上乘以自身系数。" valueLabel={`${config.towerCost}`} onChange={(value) => patch('towerCost', value)} />
        </ConfigSection>

        <ConfigSection title="攻防强度" icon={<ShieldCheck className="size-3.5" />}>
          <FastRange label="基地生命" value={config.baseHealth} min={5} max={20} note="允许多少个敌人突破防线。" valueLabel={`${config.baseHealth} 点`} onChange={(value) => patch('baseHealth', value)} />
          <FastRange label="敌人基础生命" value={config.enemyHealth} min={40} max={140} step={4} note="每波会在此基础上递增。" valueLabel={`${config.enemyHealth}`} onChange={(value) => patch('enemyHealth', value)} />
          <FastRange label="防御塔伤害" value={config.towerDamage} min={12} max={50} step={2} note="配合塔型系数决定实际输出。" valueLabel={`${config.towerDamage}`} onChange={(value) => patch('towerDamage', value)} />
        </ConfigSection>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-3">
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-800"><CheckCircle2 className="size-3.5" />参数会同步到中间 Demo</div>
          <p className="mt-1.5 text-[8px] leading-[13px] text-emerald-900/48">修改后立即作用于当前对局；仅 Replay 会从头重置试玩。</p>
        </div>
      </div>

      {onConfirm ? (
        <div className="shrink-0 border-t border-black/[0.07] bg-white p-4">
          <button type="button" onClick={onConfirm} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#161823] text-[10px] font-semibold text-white transition-colors hover:bg-[#2C2D35]">
            <CheckCircle2 className="size-4" />确认玩法
          </button>
        </div>
      ) : null}
    </aside>
  )
}

export default TowerDefenseGameplayWorkspace
