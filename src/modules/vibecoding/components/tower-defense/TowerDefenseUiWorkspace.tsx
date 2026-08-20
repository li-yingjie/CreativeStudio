import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  Check,
  CheckCircle2,
  Coins,
  Eye,
  Heart,
  Layers,
  Palette,
  Pause,
  Settings,
  Sparkles,
  Trophy,
  WandSparkles,
  Zap,
} from '@/shared/icons'
import type {
  TowerDefenseUiComponentConfig,
  TowerDefenseUiComponentId,
  TowerDefenseUiConfig,
  UiEmphasis,
} from './TowerDefenseFlowModel'

type PreviewMode = 'battle' | 'result'

interface VisualPreset {
  id: TowerDefenseUiConfig['visualPreset']
  name: string
  summary: string
  surface: string
  surfaceRaised: string
  ink: string
  muted: string
  accent: string
  secondary: string
  map: string
}

const VISUAL_PRESETS: readonly VisualPreset[] = [
  {
    id: 'night-watch',
    name: '守夜灯塔',
    summary: '深色森林 · 金色引导',
    surface: '#121A1C',
    surfaceRaised: '#20302D',
    ink: '#F4F3E8',
    muted: '#A4B1AA',
    accent: '#F0C56C',
    secondary: '#6FD0A5',
    map: 'linear-gradient(145deg,#354C41,#182A29)',
  },
  {
    id: 'forest-signal',
    name: '林间信号',
    summary: '鲜明植物 · 高对比战斗',
    surface: '#10261F',
    surfaceRaised: '#1C3B2E',
    ink: '#F0FFF7',
    muted: '#9BC2AD',
    accent: '#D8FF6A',
    secondary: '#55E5A3',
    map: 'linear-gradient(145deg,#416D4D,#173A30)',
  },
  {
    id: 'paper-kingdom',
    name: '纸境王国',
    summary: '暖色纸张 · 手绘边框',
    surface: '#302B28',
    surfaceRaised: '#51463E',
    ink: '#FFF8E8',
    muted: '#C8B9A6',
    accent: '#FFB268',
    secondary: '#8FD19D',
    map: 'linear-gradient(145deg,#8B775E,#4F493E)',
  },
]

const EMPHASIS_LABELS: Record<UiEmphasis, string> = {
  quiet: '弱化',
  standard: '标准',
  strong: '强调',
}

function getComponent(ui: TowerDefenseUiConfig, id: TowerDefenseUiComponentId) {
  return ui.components.find((item) => item.id === id)
}

function opacityFor(emphasis: UiEmphasis) {
  return emphasis === 'quiet' ? 0.72 : emphasis === 'strong' ? 1 : 0.88
}

function componentTransform(component: TowerDefenseUiComponentConfig | undefined): CSSProperties {
  return {
    opacity: component ? opacityFor(component.emphasis) : 1,
    scale: (component?.scale ?? 100) / 100,
  }
}

function SelectableSurface({
  id,
  selected,
  label,
  hidden,
  onSelect,
  className,
  style,
  children,
}: {
  id: TowerDefenseUiComponentId
  selected: boolean
  label: string
  hidden?: boolean
  onSelect: (id: TowerDefenseUiComponentId) => void
  className: string
  style?: CSSProperties
  children: ReactNode
}) {
  if (hidden) return null
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-label={`编辑${label}`}
      aria-pressed={selected}
      className={`group relative text-left outline-none transition-[box-shadow,transform] ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#171D1E]' : 'hover:ring-1 hover:ring-white/55'} ${className}`}
      style={style}
    >
      {children}
      <span className={`pointer-events-none absolute -top-2 left-2 z-40 rounded-full px-1.5 py-0.5 text-[6px] font-semibold transition-opacity ${selected ? 'bg-white text-[#161823] opacity-100' : 'bg-black/65 text-white opacity-0 group-hover:opacity-100'}`}>{label}</span>
    </button>
  )
}

export interface TowerDefenseUiWorkspaceProps {
  ui: TowerDefenseUiConfig
  onChange: (ui: TowerDefenseUiConfig) => void
  className?: string
}

export function TowerDefenseUiWorkspace({ ui, onChange, className = '' }: TowerDefenseUiWorkspaceProps) {
  const [mode, setMode] = useState<PreviewMode>('battle')
  const preset = VISUAL_PRESETS.find((item) => item.id === ui.visualPreset) ?? VISUAL_PRESETS[0]
  const radius = ui.cornerRadius

  const selectComponent = (id: TowerDefenseUiComponentId) => {
    if (id === 'result-panel') setMode('result')
    onChange({ ...ui, selectedComponentId: id })
  }

  const hud = getComponent(ui, 'battle-hud')
  const progress = getComponent(ui, 'wave-progress')
  const dock = getComponent(ui, 'tower-dock')
  const controls = getComponent(ui, 'battle-controls')
  const result = getComponent(ui, 'result-panel')

  return (
    <div className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F5F6F7] ${className}`}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[12px] font-semibold text-[#161823]">游戏 UI 生成</h2>
            <span className="rounded-full bg-violet-50 px-2 py-1 text-[8px] font-medium text-violet-700">5 个可编辑组件</span>
          </div>
          <p className="mt-0.5 text-[8px] text-[#161823]/34">点击预览中的 UI 组件，在右侧分拆调整</p>
        </div>
        <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-[#F7F7F8] p-0.5">
          {([['battle', '对局态'], ['result', '结算态']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id)
                if (id === 'battle' && ui.selectedComponentId === 'result-panel') {
                  onChange({ ...ui, selectedComponentId: 'battle-hud' })
                }
              }}
              className={`h-7 rounded-md px-3 text-[9px] font-medium transition-colors ${mode === id ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/42 hover:text-[#161823]/72'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 py-5 sm:px-8">
        <div className="mx-auto flex min-h-full w-full max-w-[980px] items-center justify-center gap-8">
          <div className="hidden w-[170px] shrink-0 space-y-3 lg:block">
            <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-[9px] font-semibold text-[#161823]/70"><Layers className="size-3.5" />生成结果</div>
              <dl className="mt-3 space-y-2 text-[8px]">
                <div className="flex justify-between"><dt className="text-[#161823]/38">已生成</dt><dd className="font-semibold text-[#161823]/68">5 组件</dd></div>
                <div className="flex justify-between"><dt className="text-[#161823]/38">可编辑层</dt><dd className="font-semibold text-[#161823]/68">12 层</dd></div>
                <div className="flex justify-between"><dt className="text-[#161823]/38">页面状态</dt><dd className="font-semibold text-[#161823]/68">2 个</dd></div>
              </dl>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[9px] font-medium text-violet-700"><WandSparkles className="size-3.5" />已绑定游戏状态</div>
              <p className="mt-1.5 text-[8px] leading-[13px] text-violet-900/45">生命、金币、波次与塔卡组都会读取真实对局数据。</p>
            </div>
          </div>

          <div className="w-full max-w-[398px] shrink-0">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="text-[9px] font-medium text-[#161823]/46">9:16 游戏视窗</span>
              <span className="flex items-center gap-1.5 text-[8px] text-[#161823]/38"><i className="size-1.5 rounded-full bg-violet-500" />可点选组件</span>
            </div>
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[28px] border-[5px] border-[#111319] shadow-[0_30px_75px_-28px_rgba(15,23,27,0.48)]" style={{ background: preset.surface, color: preset.ink }}>
              <div className="absolute inset-x-0 bottom-[21%] top-[12%] overflow-hidden" style={{ background: preset.map }}>
                <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at 25% 22%,rgba(255,255,255,.12),transparent 18%),radial-gradient(circle at 70% 62%,rgba(255,255,255,.09),transparent 26%)' }} />
                <svg className="absolute inset-0 size-full opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M12 2 C18 18 33 17 70 23 C88 28 80 42 49 47 C19 52 18 66 47 68 C76 70 83 82 52 96" fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="13" strokeLinecap="round" />
                  <path d="M12 2 C18 18 33 17 70 23 C88 28 80 42 49 47 C19 52 18 66 47 68 C76 70 83 82 52 96" fill="none" stroke="rgba(255,255,255,.11)" strokeWidth="7" strokeLinecap="round" strokeDasharray="1.5 2" />
                </svg>
                {[['28%', '27%', '连', preset.secondary], ['71%', '37%', '冰', '#8CB9FF'], ['36%', '62%', '轰', '#FFB86A'], ['69%', '78%', '+', 'rgba(255,255,255,.14)']].map(([left, top, label, color]) => (
                  <div key={`${left}-${top}`} className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/28 text-[8px] font-bold shadow-md" style={{ left, top, background: color }}>{label}</div>
                ))}
                {[['17%', '11%', '苔'], ['56%', '29%', '灵'], ['43%', '53%', '苔'], ['63%', '73%', '苔']].map(([left, top, label], index) => (
                  <div key={`${left}-${top}`} className="absolute grid size-5 rotate-45 place-items-center rounded-[6px] border border-white/30 text-[5px] font-bold" style={{ left, top, background: index === 1 ? '#80C6E1' : '#A6CB89' }}><span className="-rotate-45 text-[#19231E]">{label}</span></div>
                ))}
              </div>

              <SelectableSurface
                id="battle-hud"
                selected={ui.selectedComponentId === 'battle-hud'}
                label="战斗 HUD"
                hidden={!hud?.visible}
                onSelect={selectComponent}
                className="absolute inset-x-0 top-0 z-20 h-[12%] rounded-none border-b border-white/10 px-4"
                style={{ ...componentTransform(hud), background: `${preset.surface}F2` }}
              >
                <div className="flex h-full items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px]"><Heart className="size-3.5" style={{ color: preset.accent }} /><strong>10</strong></div>
                  <div className="text-center"><p className="text-[10px] font-semibold">月隐林 · 01</p><p className="mt-0.5 text-[6px]" style={{ color: preset.muted }}>守住月光灯塔</p></div>
                  <div className="flex items-center gap-1.5 text-[9px]"><Coins className="size-3.5" style={{ color: preset.accent }} /><strong>268</strong></div>
                </div>
              </SelectableSurface>

              <SelectableSurface
                id="wave-progress"
                selected={ui.selectedComponentId === 'wave-progress'}
                label="波次进度"
                hidden={!progress?.visible}
                onSelect={selectComponent}
                className="absolute left-1/2 top-[14%] z-30 w-[70%] -translate-x-1/2 rounded-full border border-white/12 px-3 py-2"
                style={{ ...componentTransform(progress), background: `${preset.surface}D9`, borderRadius: radius }}
              >
                <div className="flex items-center justify-between text-[6px] font-medium"><span>第 2 波</span><span style={{ color: preset.muted }}>7 / 12</span></div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/12"><i className="block h-full w-[58%] rounded-full" style={{ background: preset.accent }} /></div>
              </SelectableSurface>

              <SelectableSurface
                id="tower-dock"
                selected={ui.selectedComponentId === 'tower-dock'}
                label="防御塔卡组"
                hidden={!dock?.visible}
                onSelect={selectComponent}
                className="absolute inset-x-0 bottom-0 z-30 h-[21%] rounded-none border-t border-white/10 px-3 py-2.5"
                style={{ ...componentTransform(dock), background: preset.surface }}
              >
                <div className="mb-2 flex items-center justify-between text-[6px]" style={{ color: preset.muted }}><span>选择防御塔</span><span>塔位 3 / 6</span></div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: '连射塔', code: '连', price: 80, color: preset.secondary },
                    { name: '冰霜塔', code: '冰', price: 96, color: '#8CB9FF' },
                    { name: '轰击塔', code: '轰', price: 120, color: '#FFB86A' },
                  ].map((tower, index) => (
                    <div key={tower.name} className={`rounded-xl border p-2 ${index === 0 ? 'border-white/34 bg-white/10' : 'border-white/8 bg-white/[0.04]'}`} style={{ borderRadius: radius }}>
                      <div className="flex items-center justify-between"><span className="grid size-5 place-items-center rounded-md text-[7px] font-bold text-[#17201D]" style={{ background: tower.color }}>{tower.code}</span><span className="text-[7px] font-semibold" style={{ color: preset.accent }}>{tower.price}</span></div>
                      <p className="mt-1.5 truncate text-[7px] font-medium">{tower.name}</p>
                    </div>
                  ))}
                </div>
              </SelectableSurface>

              <SelectableSurface
                id="battle-controls"
                selected={ui.selectedComponentId === 'battle-controls'}
                label="对局控件"
                hidden={!controls?.visible}
                onSelect={selectComponent}
                className="absolute right-3 top-[21%] z-30 rounded-2xl border border-white/12 p-1.5"
                style={{ ...componentTransform(controls), background: `${preset.surface}DD`, borderRadius: radius }}
              >
                <div className="grid gap-1.5"><span className="grid size-7 place-items-center rounded-lg bg-white/10"><Pause className="size-3" /></span><span className="grid size-7 place-items-center rounded-lg bg-white/10 text-[7px] font-bold">2×</span><span className="grid size-7 place-items-center rounded-lg" style={{ background: preset.accent, color: preset.surface }}><Zap className="size-3" /></span></div>
              </SelectableSurface>

              {mode === 'result' ? (
                <div className="absolute inset-0 z-40 grid place-items-center bg-black/55 px-8 backdrop-blur-[2px]">
                  <SelectableSurface
                    id="result-panel"
                    selected={ui.selectedComponentId === 'result-panel'}
                    label="结算面板"
                    hidden={!result?.visible}
                    onSelect={selectComponent}
                    className="w-full border border-white/14 p-5 text-center shadow-2xl"
                    style={{ ...componentTransform(result), background: preset.surfaceRaised, borderRadius: Math.max(16, radius + 6) }}
                  >
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl" style={{ background: `${preset.accent}26`, color: preset.accent }}><Trophy className="size-6" /></span>
                    <h3 className="mt-3 text-[16px] font-semibold">守卫成功</h3>
                    <p className="mt-1 text-[7px]" style={{ color: preset.muted }}>月光灯塔再次照亮了林地</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[[12, '消灭'], [3, '波次'], [86, '评分']].map(([value, label]) => <div key={label} className="rounded-lg bg-white/[0.06] py-2"><strong className="block text-[12px]">{value}</strong><span className="text-[6px]" style={{ color: preset.muted }}>{label}</span></div>)}
                    </div>
                    <div className="mt-4 rounded-xl py-2.5 text-[8px] font-semibold" style={{ background: preset.accent, color: preset.surface }}>继续守夜</div>
                  </SelectableSurface>
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden w-[170px] shrink-0 space-y-3 lg:block">
            <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-[9px] font-semibold text-[#161823]/70"><Sparkles className="size-3.5" />编辑方式</div>
              <ol className="mt-2.5 space-y-2 text-[8px] leading-[13px] text-[#161823]/42">
                <li><b className="mr-1 text-[#161823]/70">1.</b>点击组件选中</li>
                <li><b className="mr-1 text-[#161823]/70">2.</b>在右侧调整样式</li>
                <li><b className="mr-1 text-[#161823]/70">3.</b>单组件可再次生成</li>
              </ol>
            </div>
            <div className="rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-sm">
              <p className="text-[8px] text-[#161823]/36">当前选中</p>
              <p className="mt-1.5 text-[10px] font-semibold text-[#161823]/72">{getComponent(ui, ui.selectedComponentId)?.name}</p>
              <p className="mt-1 text-[8px] leading-[13px] text-[#161823]/34">{getComponent(ui, ui.selectedComponentId)?.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditorSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold text-[#161823]/72"><span className="text-[#161823]/44">{icon}</span>{title}</div>
      {children}
    </section>
  )
}

export interface TowerDefenseUiEditorPanelProps {
  ui: TowerDefenseUiConfig
  onChange: (ui: TowerDefenseUiConfig) => void
  onConfirm?: () => void
  className?: string
}

export function TowerDefenseUiEditorPanel({ ui, onChange, onConfirm, className = '' }: TowerDefenseUiEditorPanelProps) {
  const selected = getComponent(ui, ui.selectedComponentId) ?? ui.components[0]

  const updateSelected = (patch: Partial<TowerDefenseUiComponentConfig>) => {
    onChange({
      ...ui,
      components: ui.components.map((item) => item.id === selected.id ? { ...item, ...patch } : item),
    })
  }

  return (
    <aside className={`flex h-full min-h-0 w-full flex-col bg-[#F7F7F8] ${className}`} aria-label="游戏 UI 组件编辑">
      <div className="shrink-0 border-b border-black/[0.07] bg-white px-4 py-4">
        <div className="flex items-center gap-2"><WandSparkles className="size-4 text-violet-600" /><h2 className="text-[12px] font-semibold text-[#161823]">UI 组件编辑</h2></div>
        <p className="mt-1 text-[8px] text-[#161823]/34">保留游戏状态绑定，只调整呈现层</p>
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <EditorSection title="视觉方案" icon={<Palette className="size-3.5" />}>
          <div className="grid grid-cols-1 gap-2">
            {VISUAL_PRESETS.map((preset) => {
              const active = ui.visualPreset === preset.id
              return (
                <button key={preset.id} type="button" onClick={() => onChange({ ...ui, visualPreset: preset.id })} className={`flex items-center gap-3 rounded-xl border bg-white p-2.5 text-left transition ${active ? 'border-[#161823]/42 shadow-sm' : 'border-black/[0.07] hover:border-black/[0.16]'}`} aria-pressed={active}>
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-lg" style={{ background: preset.map }}><i className="absolute bottom-1 right-1 size-2.5 rounded-full border-2 border-white" style={{ background: preset.accent }} /></span>
                  <span className="min-w-0 flex-1"><strong className="block text-[9px] font-semibold text-[#161823]/72">{preset.name}</strong><span className="mt-0.5 block text-[8px] text-[#161823]/34">{preset.summary}</span></span>
                  {active ? <Check className="size-3.5 text-[#161823]/68" /> : null}
                </button>
              )
            })}
          </div>
        </EditorSection>

        <EditorSection title="组件" icon={<Layers className="size-3.5" />}>
          <div className="grid grid-cols-2 gap-2">
            {ui.components.map((component) => {
              const active = component.id === ui.selectedComponentId
              return (
                <button key={component.id} type="button" onClick={() => onChange({ ...ui, selectedComponentId: component.id })} className={`rounded-xl border p-2.5 text-left transition ${active ? 'border-[#161823]/42 bg-white shadow-sm' : 'border-black/[0.07] bg-white hover:border-black/[0.16]'}`} aria-pressed={active}>
                  <div className="flex items-center justify-between gap-2"><span className="truncate text-[8px] font-medium text-[#161823]/68">{component.name}</span><i className={`size-1.5 shrink-0 rounded-full ${component.visible ? 'bg-emerald-500' : 'bg-[#161823]/18'}`} /></div>
                  <span className="mt-1 block text-[7px] text-[#161823]/28">{component.scale}% · {EMPHASIS_LABELS[component.emphasis]}</span>
                </button>
              )
            })}
          </div>
        </EditorSection>

        <EditorSection title={selected.name} icon={<Settings className="size-3.5" />}>
          <div className="space-y-2 rounded-xl border border-black/[0.07] bg-white p-3">
            <button type="button" onClick={() => updateSelected({ visible: !selected.visible })} className="flex w-full items-center justify-between rounded-lg bg-[#F4F5F6] px-3 py-2.5 text-left" aria-pressed={selected.visible}>
              <span><span className="block text-[9px] font-medium text-[#161823]/68">显示组件</span><span className="mt-0.5 block text-[7px] text-[#161823]/30">隐藏后保留数据绑定</span></span>
              <Eye className={`size-3.5 ${selected.visible ? 'text-emerald-600' : 'text-[#161823]/22'}`} />
            </button>

            <div className="pt-1">
              <div className="mb-1.5 flex items-center justify-between"><span className="text-[8px] font-medium text-[#161823]/50">视觉强调</span><span className="text-[8px] text-[#161823]/32">{EMPHASIS_LABELS[selected.emphasis]}</span></div>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#F2F3F4] p-1">
                {(Object.keys(EMPHASIS_LABELS) as UiEmphasis[]).map((emphasis) => (
                  <button key={emphasis} type="button" onClick={() => updateSelected({ emphasis })} className={`h-7 rounded-md text-[8px] font-medium transition ${selected.emphasis === emphasis ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/38 hover:text-[#161823]/64'}`} aria-pressed={selected.emphasis === emphasis}>{EMPHASIS_LABELS[emphasis]}</button>
                ))}
              </div>
            </div>

            <label className="block pt-1">
              <span className="flex items-center justify-between text-[8px] font-medium text-[#161823]/50"><span>组件缩放</span><span>{selected.scale}%</span></span>
              <input type="range" min={85} max={115} step={5} value={selected.scale} onChange={(event) => updateSelected({ scale: Number(event.target.value) })} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E6E7E9] accent-[#161823]" />
            </label>

            <button type="button" className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-black/[0.08] bg-white text-[8px] font-medium text-[#161823]/60 hover:bg-[#F6F6F7]"><Sparkles className="size-3" />重新生成该组件</button>
          </div>
        </EditorSection>

        <EditorSection title="全局密度" icon={<Zap className="size-3.5" />}>
          <div className="rounded-xl border border-black/[0.07] bg-white p-3">
            <button type="button" onClick={() => onChange({ ...ui, compactMode: !ui.compactMode })} className="flex w-full items-center justify-between text-left" aria-pressed={ui.compactMode}>
              <span><span className="block text-[9px] font-medium text-[#161823]/68">紧凑模式</span><span className="mt-0.5 block text-[7px] text-[#161823]/30">缩短对局控件间距</span></span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${ui.compactMode ? 'bg-[#161823]' : 'bg-[#D9DBDE]'}`}><i className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${ui.compactMode ? 'translate-x-[18px]' : 'translate-x-0.5'}`} /></span>
            </button>
            <label className="mt-3 block border-t border-black/[0.06] pt-3"><span className="flex items-center justify-between text-[8px] font-medium text-[#161823]/50"><span>容器圆角</span><span>{ui.cornerRadius}px</span></span><input type="range" min={4} max={24} step={2} value={ui.cornerRadius} onChange={(event) => onChange({ ...ui, cornerRadius: Number(event.target.value) })} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E6E7E9] accent-[#161823]" /></label>
          </div>
        </EditorSection>
      </div>

      {onConfirm ? (
        <div className="shrink-0 border-t border-black/[0.07] bg-white p-4">
          <button type="button" onClick={onConfirm} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#161823] text-[10px] font-semibold text-white transition-colors hover:bg-[#2C2D35]"><CheckCircle2 className="size-4" />确认 UI</button>
        </div>
      ) : null}
    </aside>
  )
}

export default TowerDefenseUiWorkspace
