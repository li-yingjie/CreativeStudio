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
} from '@/shared/icons'
import type { GameEditSelection } from './GarudaGamePreview'

/**
 * Garuda 可视化编辑面板
 *
 * 未选对象时展示游戏级配置；快速编辑选中背景、按钮、主角、敌人、HUD
 * 或结算对象后，只呈现该对象真正相关的字段。全部本地状态，不实际写回
 * garuda.js。
 */

interface Props {
  onClose: () => void
  selection?: GameEditSelection | null
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

export default function GarudaEditPanel({ onClose, selection }: Props) {
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
          快速编辑
        </span>
        <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/40">
          {selection?.label ?? '射击小游戏'}
        </span>
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
      {!selection && (
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
      )}

      {/* Body */}
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
        {selection ? (
          <GameObjectEditor
            key={`${selection.screen}-${selection.target}`}
            selection={selection}
          />
        ) : (
          <>
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
                          on ? 'bg-[#3478ff]' : 'bg-[var(--color-ink)]/15'
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
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">
          {selection
            ? `正在编辑「${selection.label}」`
            : '选择预览对象可查看对应字段'}
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

function GameObjectEditor({ selection }: { selection: GameEditSelection }) {
  const [label, setLabel] = useState(
    selection.target === 'primary-action'
      ? selection.screen === '结算界面'
        ? '再来一局'
        : '开始游戏'
      : selection.screen === '结算界面'
        ? '返回首页'
        : '查看排行榜',
  )
  const [brightness, setBrightness] = useState(100)
  const [scale, setScale] = useState(100)
  const [speed, setSpeed] = useState(70)
  const [density, setDensity] = useState(60)
  const [opacity, setOpacity] = useState(88)
  const [enabled, setEnabled] = useState(true)
  const [secondaryEnabled, setSecondaryEnabled] = useState(true)
  const [tertiaryEnabled, setTertiaryEnabled] = useState(true)
  const [fieldOne, setFieldOne] = useState(
    selection.target === 'result-panel' ? 'MISSION COMPLETE' : '本局得分',
  )
  const [fieldTwo, setFieldTwo] = useState(
    selection.target === 'result-panel' ? '任务完成' : '到达波次',
  )
  const [fieldThree, setFieldThree] = useState(
    selection.target === 'result-panel' ? '本次行动数据' : '存活时间',
  )

  if (selection.target === 'background') {
    return (
      <div className="space-y-5">
        <Group title={`${selection.screen} · 场景`} icon={ImageIcon}>
          <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-black">
            <img
              src={
                selection.screen === '开始界面'
                  ? '/garuda/assets/Start.jpg'
                  : selection.screen === '游戏进行中'
                    ? '/garuda/docs/garuda-gameplay-showcase.png'
                    : '/garuda/docs/garuda-key-art.png'
              }
              alt={`${selection.screen}背景`}
              className="h-28 w-full object-cover"
            />
          </div>
          <TextControl label="背景素材" value="来自素材库 / 当前场景" />
          <SelectControl
            label="填充方式"
            options={['覆盖填充', '完整显示', '拉伸铺满']}
          />
          <Slider
            label="亮度"
            hint={`${brightness}%`}
            min={40}
            max={140}
            value={brightness}
            onChange={setBrightness}
          />
          <Toggle
            label="场景动效"
            hint="启用粒子、景深与轻微视差"
            value={enabled}
            onChange={setEnabled}
          />
        </Group>
      </div>
    )
  }

  if (
    selection.target === 'primary-action' ||
    selection.target === 'secondary-action'
  ) {
    return (
      <div className="space-y-5">
        <Group title={selection.label} icon={Gamepad2}>
          <EditableTextControl label="按钮文案" value={label} onChange={setLabel} />
          <SelectControl
            label="点击动作"
            options={
              selection.target === 'primary-action'
                ? ['进入游戏', '重新开始', '打开下一页']
                : ['打开排行榜', '返回首页', '关闭弹层']
            }
          />
          <SelectControl
            label="按钮样式"
            options={
              selection.target === 'primary-action'
                ? ['主按钮 · 橙色', '主按钮 · 金色', '主按钮 · 品牌色']
                : ['次按钮 · 深色', '描边按钮', '文字按钮']
            }
          />
          <Slider
            label="圆角"
            hint={`${Math.round(scale / 2)}px`}
            min={16}
            max={100}
            value={scale}
            onChange={setScale}
          />
          <Toggle
            label="显示按钮"
            hint="关闭后从当前界面隐藏"
            value={enabled}
            onChange={setEnabled}
          />
        </Group>
      </div>
    )
  }

  if (selection.target === 'player') {
    return (
      <div className="space-y-5">
        <Group title="主角战机" icon={ImageIcon}>
          <div className="flex items-center gap-3 rounded-xl border border-[var(--divider-soft)] p-3">
            <img
              src="/garuda/assets/garuda_fly-webp/garuda_fly_00.webp"
              alt="当前主角"
              className="size-16 object-contain"
            />
            <div>
              <p className="text-[12.5px] font-medium text-[var(--color-ink)]">
                Garuda · 经典形态
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-ink)]/45">
                点击可从素材库替换
              </p>
            </div>
          </div>
          <Slider
            label="角色尺寸"
            hint={`${scale}%`}
            min={60}
            max={150}
            value={scale}
            onChange={setScale}
          />
          <Slider
            label="移动速度"
            hint={`${speed}%`}
            min={30}
            max={120}
            value={speed}
            onChange={setSpeed}
          />
          <SelectControl
            label="射击模式"
            options={['自动射击', '按住射击', '点击射击']}
          />
          <Toggle
            label="出生保护"
            hint="进入战斗后短暂无敌"
            value={enabled}
            onChange={setEnabled}
          />
        </Group>
      </div>
    )
  }

  if (selection.target === 'enemies') {
    return (
      <div className="space-y-5">
        <Group title="敌人与弹幕" icon={Gauge}>
          <Slider
            label="敌人密度"
            hint={`${density}%`}
            min={20}
            max={100}
            value={density}
            onChange={setDensity}
          />
          <Slider
            label="弹幕速度"
            hint={`${speed}%`}
            min={40}
            max={150}
            value={speed}
            onChange={setSpeed}
          />
          <SelectControl
            label="生成阵型"
            options={['混合阵型', '左右夹击', '环形包围', 'Boss 波次']}
          />
          <Toggle
            label="精英敌人"
            hint="在普通波次中插入强化敌人"
            value={enabled}
            onChange={setEnabled}
          />
        </Group>
      </div>
    )
  }

  if (selection.target === 'hud') {
    return (
      <div className="space-y-5">
        <Group title="战斗 HUD" icon={Layers}>
          <Toggle
            label="生命值"
            hint="左上角生命条"
            value={enabled}
            onChange={setEnabled}
          />
          <Toggle
            label="护盾值"
            hint="生命条下方护盾槽"
            value={secondaryEnabled}
            onChange={setSecondaryEnabled}
          />
          <Toggle
            label="必杀能量"
            hint="底部技能能量槽"
            value={tertiaryEnabled}
            onChange={setTertiaryEnabled}
          />
          <Slider
            label="界面缩放"
            hint={`${scale}%`}
            min={70}
            max={130}
            value={scale}
            onChange={setScale}
          />
          <Slider
            label="透明度"
            hint={`${opacity}%`}
            min={40}
            max={100}
            value={opacity}
            onChange={setOpacity}
          />
        </Group>
      </div>
    )
  }

  if (selection.target === 'score-stats') {
    return (
      <div className="space-y-5">
        <Group title="结算数据" icon={Gauge}>
          <EditableTextControl label="指标一" value={fieldOne} onChange={setFieldOne} />
          <EditableTextControl label="指标二" value={fieldTwo} onChange={setFieldTwo} />
          <EditableTextControl label="指标三" value={fieldThree} onChange={setFieldThree} />
          <SelectControl
            label="数字格式"
            options={['自动格式化', '整数', '时间 mm:ss']}
          />
          <Slider
            label="强调强度"
            hint={`${opacity}%`}
            min={40}
            max={100}
            value={opacity}
            onChange={setOpacity}
          />
        </Group>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Group title="结算面板" icon={Layers}>
        <EditableTextControl label="状态标题" value={fieldOne} onChange={setFieldOne} />
        <EditableTextControl label="主标题" value={fieldTwo} onChange={setFieldTwo} />
        <EditableTextControl label="副标题" value={fieldThree} onChange={setFieldThree} />
        <Slider
          label="背景透明度"
          hint={`${opacity}%`}
          min={40}
          max={100}
          value={opacity}
          onChange={setOpacity}
        />
        <Slider
          label="面板缩放"
          hint={`${scale}%`}
          min={70}
          max={120}
          value={scale}
          onChange={setScale}
        />
      </Group>
    </div>
  )
}

function EditableTextControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] text-[var(--color-ink)]/60">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 text-[12.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/35"
      />
    </label>
  )
}

function TextControl({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1.5 block text-[11.5px] text-[var(--color-ink)]/60">{label}</span>
      <div className="flex h-9 items-center rounded-lg border border-[var(--divider)] px-3 text-[12px] text-[var(--color-ink)]/65">
        {value}
      </div>
    </div>
  )
}

function SelectControl({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] text-[var(--color-ink)]/60">{label}</span>
      <select className="h-9 w-full rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 text-[12.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/35">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
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
          value ? 'bg-[#3478ff]' : 'bg-[var(--color-ink)]/20'
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
