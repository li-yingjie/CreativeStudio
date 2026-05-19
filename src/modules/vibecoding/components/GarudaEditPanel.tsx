import { useState } from 'react'
import {
  X,
  Sparkles,
  Gauge,
  Palette,
  Layers,
  Wand2,
  Volume2,
  Image as ImageIcon,
  RefreshCw,
  Save,
  Gamepad2,
} from 'lucide-react'

/**
 * Garuda 可视化编辑面板
 *
 * 默认展示「游戏配置」组：难度 / 关卡节奏 / Roguelike 流派 / 美术风格 /
 * 主角皮肤 / 音效 / 调色 — 全部本地状态，不实际写回 garuda.js。给的是
 * 一个「我可以怎么改它」的可视化入口。
 */

interface Props {
  onClose: () => void
}

type Section = 'config' | 'art' | 'audio'

const SKINS = [
  { id: 'classic', label: '经典 · 红', preview: '/garuda/assets/garuda_fly-webp/garuda_fly_00.webp' },
  { id: 'shadow', label: '暗影 · 紫', preview: '/garuda/assets/garuda_killer_video-webp/garuda_killer_video_000.webp' },
  { id: 'shell', label: '甲胄 · 金', preview: '/garuda/assets/garuda_shell_gif-webp/garuda_shell_gif_00.webp' },
  { id: 'storm', label: '风暴 · 银', preview: '/garuda/assets/garuda_special-webp/garuda_special_000.webp' },
] as const

const BUILDS = [
  { id: 'storm', label: '弹幕海' },
  { id: 'laser', label: '激光反射' },
  { id: 'shield', label: '无尽护盾' },
  { id: 'aoe', label: '粒子 AOE' },
  { id: 'missile', label: '导弹追踪' },
  { id: 'freeze', label: '冰冻流' },
] as const

const PALETTES = [
  { id: 'aurora', label: 'Aurora', from: '#0e1b3a', via: '#1f3a8a', to: '#5b21b6' },
  { id: 'crimson', label: 'Crimson', from: '#1a0710', via: '#7f1d1d', to: '#f97316' },
  { id: 'ocean', label: 'Ocean', from: '#021026', via: '#0e7490', to: '#67e8f9' },
  { id: 'midnight', label: 'Midnight', from: '#060709', via: '#1f2937', to: '#94a3b8' },
] as const

export default function GarudaEditPanel({ onClose }: Props) {
  const [section, setSection] = useState<Section>('config')

  // ── Game config ──
  const [difficulty, setDifficulty] = useState(3)
  const [enemyDensity, setEnemyDensity] = useState(60)
  const [bossInterval, setBossInterval] = useState(90)
  const [bulletSpeed, setBulletSpeed] = useState(75)
  const [drops, setDrops] = useState({ blood: true, bomb: true, shield: true, laser: true, speed: true })
  const [activeBuilds, setActiveBuilds] = useState<Set<string>>(
    () => new Set(['storm', 'laser', 'shield', 'aoe']),
  )

  // ── Art ──
  const [skin, setSkin] = useState<(typeof SKINS)[number]['id']>('classic')
  const [palette, setPalette] = useState<(typeof PALETTES)[number]['id']>('aurora')
  const [bloom, setBloom] = useState(40)
  const [scanlines, setScanlines] = useState(false)

  // ── Audio ──
  const [bgmVolume, setBgmVolume] = useState(70)
  const [sfxVolume, setSfxVolume] = useState(85)
  const [muteOnBlur, setMuteOnBlur] = useState(true)

  const toggleBuild = (id: string) =>
    setActiveBuilds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
        <Wand2 size={14} strokeWidth={1.8} className="text-[var(--color-ink)]/65" />
        <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">
          可视化编辑
        </span>
        <span className="text-[11px] text-[var(--color-ink)]/40">Garuda · 神明黄昏</span>
        <button
          type="button"
          onClick={onClose}
          title="关闭"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex shrink-0 items-center gap-1 border-b border-[var(--divider-soft)] px-2 py-1.5">
        {(
          [
            { id: 'config', label: '游戏配置', icon: Gamepad2 },
            { id: 'art', label: '美术与渲染', icon: Palette },
            { id: 'audio', label: '音频', icon: Volume2 },
          ] as const
        ).map((t) => {
          const Icon = t.icon
          const active = section === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSection(t.id)}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] transition-colors ${
                active
                  ? 'bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/55 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85'
              }`}
            >
              <Icon size={12} strokeWidth={1.8} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Body */}
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
        {section === 'config' && (
          <div className="space-y-5">
            <Group title="难度曲线" icon={Gauge}>
              <Slider
                label="基础难度"
                hint={['新手', '休闲', '挑战', '硬核', '梦魇'][difficulty - 1]}
                min={1}
                max={5}
                step={1}
                value={difficulty}
                onChange={setDifficulty}
                ticks={['1', '2', '3', '4', '5']}
              />
              <Slider
                label="敌人密度"
                hint={`${enemyDensity}%`}
                min={20}
                max={100}
                value={enemyDensity}
                onChange={setEnemyDensity}
              />
              <Slider
                label="BOSS 间隔（秒）"
                hint={`${bossInterval}s`}
                min={30}
                max={180}
                step={10}
                value={bossInterval}
                onChange={setBossInterval}
              />
              <Slider
                label="弹幕速度"
                hint={`${bulletSpeed}%`}
                min={50}
                max={150}
                value={bulletSpeed}
                onChange={setBulletSpeed}
              />
            </Group>

            <Group title="Roguelike 流派 · 抽取池" icon={Sparkles}>
              <div className="grid grid-cols-2 gap-2">
                {BUILDS.map((b) => {
                  const on = activeBuilds.has(b.id)
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBuild(b.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[12.5px] transition-colors ${
                        on
                          ? 'border-[var(--color-ink)]/30 bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]'
                          : 'border-[var(--divider-soft)] bg-[var(--color-surface-0)] text-[var(--color-ink)]/55 hover:border-[var(--color-ink)]/15'
                      }`}
                    >
                      <span>{b.label}</span>
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          on ? 'bg-emerald-500' : 'bg-[var(--color-ink)]/15'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-[10.5px] text-[var(--color-ink)]/40">
                每局从勾选池里随机抽 3 个供玩家选择
              </p>
            </Group>

            <Group title="道具掉落" icon={Layers}>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'blood', label: '回血', src: '/garuda/assets/item_blood.png' },
                    { id: 'bomb', label: '炸弹', src: '/garuda/assets/item_bomb.png' },
                    { id: 'shield', label: '护盾', src: '/garuda/assets/item_shell.png' },
                    { id: 'laser', label: '激光', src: '/garuda/assets/item_laser.png' },
                    { id: 'speed', label: '加速', src: '/garuda/assets/item_speed.png' },
                  ] as const
                ).map((it) => {
                  const on = drops[it.id as keyof typeof drops]
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() =>
                        setDrops((d) => ({ ...d, [it.id]: !d[it.id as keyof typeof drops] }))
                      }
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                        on
                          ? 'border-[var(--color-ink)]/25 bg-[var(--color-ink)]/[0.05]'
                          : 'border-[var(--divider-soft)] opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={it.src} alt={it.label} className="h-10 w-10 object-contain" />
                      <span className="text-[11px] text-[var(--color-ink)]/75">
                        {it.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Group>
          </div>
        )}

        {section === 'art' && (
          <div className="space-y-5">
            <Group title="主角皮肤" icon={ImageIcon}>
              <div className="grid grid-cols-2 gap-2">
                {SKINS.map((s) => {
                  const on = skin === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkin(s.id)}
                      className={`group relative aspect-[5/3] overflow-hidden rounded-lg border bg-black transition-all ${
                        on
                          ? 'border-emerald-400/70 ring-1 ring-emerald-400/40'
                          : 'border-[var(--divider-soft)] hover:border-[var(--color-ink)]/25'
                      }`}
                    >
                      <img
                        src={s.preview}
                        alt={s.label}
                        className="h-full w-full object-cover opacity-85 transition-transform group-hover:scale-105"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.75) 100%)',
                        }}
                      />
                      <span className="absolute inset-x-2 bottom-1.5 text-[11px] font-medium text-white">
                        {s.label}
                      </span>
                      {on && (
                        <span className="absolute right-1.5 top-1.5 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[9.5px] font-medium text-white">
                          当前
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </Group>

            <Group title="主题调色" icon={Palette}>
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((p) => {
                  const on = palette === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPalette(p.id)}
                      className={`flex flex-col gap-1.5 rounded-lg border p-1.5 text-left transition-colors ${
                        on
                          ? 'border-[var(--color-ink)]/30'
                          : 'border-[var(--divider-soft)] hover:border-[var(--color-ink)]/15'
                      }`}
                    >
                      <span
                        className="h-7 w-full rounded"
                        style={{
                          background: `linear-gradient(90deg, ${p.from}, ${p.via}, ${p.to})`,
                        }}
                      />
                      <span className="px-1 text-[11.5px] text-[var(--color-ink)]/75">
                        {p.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Group>

            <Group title="后处理" icon={Sparkles}>
              <Slider
                label="Bloom 强度"
                hint={`${bloom}%`}
                min={0}
                max={100}
                value={bloom}
                onChange={setBloom}
              />
              <Toggle
                label="CRT 扫描线"
                hint="复古街机感"
                value={scanlines}
                onChange={setScanlines}
              />
            </Group>
          </div>
        )}

        {section === 'audio' && (
          <div className="space-y-5">
            <Group title="音量" icon={Volume2}>
              <Slider label="BGM 音量" hint={`${bgmVolume}%`} min={0} max={100} value={bgmVolume} onChange={setBgmVolume} />
              <Slider label="SFX 音量" hint={`${sfxVolume}%`} min={0} max={100} value={sfxVolume} onChange={setSfxVolume} />
              <Toggle
                label="窗口失焦自动静音"
                hint="切换标签页时暂停音频"
                value={muteOnBlur}
                onChange={setMuteOnBlur}
              />
            </Group>
            <Group title="音效组" icon={Layers}>
              <div className="space-y-1.5">
                {[
                  { file: 'bgm.mp3', desc: '主菜单 + 关卡背景音乐' },
                  { file: 'laser.wav', desc: '激光发射' },
                  { file: 'sfx_bomb_blast.wav', desc: '炸弹爆炸' },
                  { file: 'sfx_explosion_big.wav', desc: '大型敌人击毁' },
                  { file: 'sfx_explosion_small.wav', desc: '普通弹幕击中' },
                  { file: 'sfx_shield_on.wav', desc: '护盾激活' },
                  { file: 'killer.mp3', desc: '必杀技触发' },
                ].map((row) => (
                  <div
                    key={row.file}
                    className="flex items-center justify-between rounded-md border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[11.5px] text-[var(--color-ink)]/85">
                        {row.file}
                      </div>
                      <div className="text-[10.5px] text-[var(--color-ink)]/45">{row.desc}</div>
                    </div>
                    <audio src={`/garuda/assets/${row.file}`} controls className="h-7" />
                  </div>
                ))}
              </div>
            </Group>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">
          配置仅本地预览 · 应用到 garuda.js 需重新打包
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <RefreshCw size={11} strokeWidth={1.8} />
            重置
          </button>
          <button
            type="button"
            className="flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
          >
            <Save size={11} strokeWidth={2} />
            应用到游戏
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Atomic UI ─── */

function Group({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Wand2
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={12} strokeWidth={1.8} className="text-[var(--color-ink)]/55" />
        <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink)]/65">
          {title}
        </h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Slider({
  label,
  hint,
  min,
  max,
  step = 1,
  value,
  onChange,
  ticks,
}: {
  label: string
  hint?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (n: number) => void
  ticks?: string[]
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] text-[var(--color-ink)]/80">{label}</span>
        {hint && (
          <span className="font-mono text-[11px] text-[var(--color-ink)]/55">{hint}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--fill-subtle)] accent-[var(--color-ink)]"
      />
      {ticks && (
        <div className="mt-1 flex justify-between px-0.5 text-[10px] text-[var(--color-ink)]/35">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: boolean
  onChange: (b: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-3 rounded-md py-1 text-left transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-[var(--color-ink)]/85">{label}</div>
        {hint && <div className="text-[10.5px] text-[var(--color-ink)]/45">{hint}</div>}
      </div>
      <span
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
          value ? 'bg-emerald-500' : 'bg-[var(--color-ink)]/20'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
