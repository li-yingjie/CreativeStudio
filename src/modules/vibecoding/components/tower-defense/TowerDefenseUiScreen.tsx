import type { CSSProperties, ReactNode } from 'react'
import { Coins, Heart, Mail, Music, Pause, Play, ShieldCheck, Trophy, Volume2, Zap } from '@/shared/icons'
import type { TowerDefenseFlowState } from './TowerDefenseFlowModel'
import {
  GAME_UI_HEIGHT,
  GAME_UI_WIDTH,
  isHotspot,
  linkKey,
  nodeAlignX,
  nodeAlignY,
  nodeButtonVariant,
  nodesForScreen,
  type GameUiLink,
  type GameUiNode,
  type GameUiScreen,
  type GameUiScreenId,
} from './GameUiModel'

const PRESETS: Record<
  TowerDefenseFlowState['ui']['visualPreset'],
  {
    surface: string
    surfaceRaised: string
    ink: string
    muted: string
    accent: string
    secondary: string
    map: string
  }
> = {
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

export interface TowerDefenseUiScreenProps {
  screen: GameUiScreenId
  screenMeta?: GameUiScreen
  nodes: GameUiNode[]
  ui: TowerDefenseFlowState['ui']
  selectedId?: string | null
  links?: Record<string, GameUiLink>
  interactive?: boolean
  fill?: boolean
  onSelect?: (id: string | null) => void
  onMoveStart?: (id: string, clientX: number, clientY: number) => void
  onActivate?: (id: string) => void
}

function BattleMap({ map }: { map: string }) {
  return (
    <div className="absolute inset-x-0 bottom-[17%] top-[8%] overflow-hidden" style={{ background: map }}>
      <div className="absolute inset-0 opacity-75" style={{ backgroundImage: 'radial-gradient(circle at 25% 22%,rgba(255,255,255,.12),transparent 18%),radial-gradient(circle at 70% 62%,rgba(255,255,255,.09),transparent 26%)' }} />
      <svg className="absolute inset-0 size-full opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M12 3 C18 17 33 18 65 21 C87 23 84 36 55 45 C34 51 17 49 18 62 C20 70 62 63 70 68 C86 75 72 88 46 95" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="13" strokeLinecap="round" />
        <path d="M12 3 C18 17 33 18 65 21 C87 23 84 36 55 45 C34 51 17 49 18 62 C20 70 62 63 70 68 C86 75 72 88 46 95" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="7" strokeLinecap="round" strokeDasharray="1.5 2" />
      </svg>
      {[
        [30, 23, '连', '#6FD0A5'],
        [69, 31, '冰', '#8CB9FF'],
        [42, 48, '+', 'rgba(255,255,255,.14)'],
      ].map(([left, top, label, color]) => (
        <div
          key={`${left}-${top}`}
          className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/28 text-[11px] font-bold shadow-md"
          style={{ left: `${left}%`, top: `${top}%`, background: String(color) }}
        >
          {label}
        </div>
      ))}
    </div>
  )
}

function iconFor(node: GameUiNode): ReactNode {
  const key = `${node.iconName ?? ''} ${node.name} ${node.id}`.toLowerCase()
  if (/mail|邮件|信/.test(key)) return <Mail className="size-5" />
  if (/music|音乐|♪/.test(key)) return <Music className="size-5" />
  if (/sound|音效|volume|🔊/.test(key)) return <Volume2 className="size-5" />
  if (/rank|trophy|奖杯|榜/.test(key)) return <Trophy className="size-5" />
  return <ShieldCheck className="size-5" />
}

function contentAlign(node: GameUiNode) {
  const x = nodeAlignX(node)
  const y = nodeAlignY(node)
  return {
    justifyContent: x === 'left' ? 'flex-start' : x === 'right' ? 'flex-end' : 'center',
    alignItems: y === 'top' ? 'flex-start' : y === 'bottom' ? 'flex-end' : 'center',
    textAlign: x,
    paddingInline: x === 'center' ? 0 : 12,
    paddingBlock: y === 'middle' ? 0 : 8,
  } as const
}

function CodeBody({
  node,
  preset,
  radius,
}: {
  node: GameUiNode
  preset: (typeof PRESETS)[keyof typeof PRESETS]
  radius: number
}) {
  const r = Math.max(12, radius)
  if (node.id === 'battle-hud' || node.id === 'pause-hud') {
    return (
      <div className="flex h-full items-center justify-between border-b border-white/10 px-4" style={{ background: preset.surface, color: preset.ink }}>
        <span className="flex items-center gap-1.5 text-[14px]"><Heart className="size-4" style={{ color: preset.accent }} /><strong>10</strong></span>
        <span className="text-center"><strong className="block text-[13px]">月隐林 · 01</strong><small className="text-[10px]" style={{ color: preset.muted }}>守住月光灯塔</small></span>
        <span className="flex items-center gap-1.5 text-[14px]"><Coins className="size-4" style={{ color: preset.accent }} /><strong>268</strong></span>
      </div>
    )
  }
  if (node.id === 'battle-wave') {
    return (
      <div className="flex h-full flex-col justify-center border border-white/12 px-3" style={{ background: `${preset.surface}D9`, borderRadius: r, color: preset.ink }}>
        <div className="flex items-center justify-between text-[11px]"><span>{node.text || '第 2 波'}</span><span style={{ color: preset.muted }}>7 / 12</span></div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/12"><i className="block h-full w-[58%] rounded-full" style={{ background: preset.accent }} /></div>
      </div>
    )
  }
  if (node.id === 'battle-controls') {
    return (
      <div className="grid h-full gap-1.5 border border-white/12 p-1" style={{ background: `${preset.surface}DD`, borderRadius: r, color: preset.ink }}>
        <span className="grid place-items-center rounded-lg bg-white/10"><Pause className="size-3.5" /></span>
        <span className="grid place-items-center rounded-lg bg-white/10 text-[11px] font-bold">2×</span>
        <span className="grid place-items-center rounded-lg" style={{ background: preset.accent, color: preset.surface }}><Zap className="size-3.5" /></span>
      </div>
    )
  }
  if (node.id === 'battle-dock' || node.id === 'pause-dock') {
    return (
      <div className="flex h-full flex-col border-t border-white/10 px-3 py-2.5" style={{ background: preset.surface, color: preset.ink }}>
        <div className="mb-2 flex justify-between text-[10px]" style={{ color: preset.muted }}><span>选择防御塔</span><span>塔位 3 / 6</span></div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['连射塔', '连', preset.secondary],
            ['冰霜塔', '冰', '#8CB9FF'],
            ['轰击塔', '轰', '#FFB86A'],
          ].map(([name, code, color]) => (
            <div key={name} className="border border-white/10 bg-white/[0.04] p-2" style={{ borderRadius: r }}>
              <span className="grid size-7 place-items-center rounded-md text-[11px] font-bold text-[#17201D]" style={{ background: color }}>{code}</span>
              <p className="mt-1.5 truncate text-[12px]">{name}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (node.id.endsWith('-bg') || node.name === '页面背景') {
    return <div className="size-full" style={{ background: preset.surface }} />
  }
  if (node.kind === 'image' || node.id === 'start-logo') {
    return (
      <div className="grid h-full place-items-center">
        <span className="grid size-[72%] max-h-36 max-w-36 place-items-center rounded-[28px]" style={{ background: `${preset.accent}24`, color: preset.accent }}>
          <ShieldCheck className="size-16" />
        </span>
      </div>
    )
  }
  if (node.id === 'start-title' || (node.kind === 'text' && node.id.endsWith('-title') && node.height >= 32)) {
    return (
      <div
        className="flex h-full text-[28px] font-semibold tracking-wide"
        style={{ color: preset.ink, ...contentAlign(node) }}
      >
        {node.text}
      </div>
    )
  }
  if (node.id === 'start-subtitle' || node.kind === 'text') {
    return (
      <div
        className="flex h-full text-[13px] leading-[1.4]"
        style={{ color: preset.muted, ...contentAlign(node) }}
      >
        {node.text}
      </div>
    )
  }
  if (node.kind === 'button') {
    const variant = nodeButtonVariant(node)
    return (
      <div
        className="flex h-full gap-1.5 border border-white/16 text-[16px] font-semibold"
        style={{ background: preset.accent, color: preset.surface, borderRadius: r, ...contentAlign(node) }}
      >
        {variant === 'titled-icon' ? (
          <span className="grid size-5 shrink-0 place-items-center">{iconFor(node)}</span>
        ) : null}
        {variant === 'plain' ? null : <span className="truncate">{node.text || node.name}</span>}
      </div>
    )
  }
  if (node.kind === 'icon') {
    return (
      <div className="grid h-full place-items-center border border-white/16 bg-black/35 text-white" style={{ borderRadius: r }}>
        {iconFor(node)}
      </div>
    )
  }
  if (node.kind === 'progress') {
    return (
      <div className="flex h-full flex-col justify-center" style={{ color: preset.ink }}>
        {node.hasText ? <span className="mb-1 text-[10px]" style={{ color: preset.muted }}>{node.text}</span> : null}
        <div className="h-1.5 overflow-hidden rounded-full bg-white/12"><i className="block h-full w-[65%] rounded-full" style={{ background: preset.accent }} /></div>
      </div>
    )
  }
  if (node.id.endsWith('-panel') || (node.kind === 'container' && node.hasFrame && node.height >= 120 && !node.id.includes('-row-'))) {
    const generated = node.id.startsWith('gen:')
    return (
      <div className="flex h-full flex-col items-center justify-center border border-white/14 px-5 text-center shadow-2xl" style={{ background: preset.surfaceRaised, color: preset.ink, borderRadius: Math.max(16, r + 4) }}>
        {generated ? null : (
          <>
            <span className="grid size-12 place-items-center rounded-2xl" style={{ background: `${preset.accent}26`, color: preset.accent }}><ShieldCheck className="size-6" /></span>
            <h3 className="mt-3 text-[18px] font-semibold">{node.text || node.name}</h3>
            <p className="mt-1.5 text-[12px]" style={{ color: preset.muted }}>
              {node.id === 'lose-panel' ? '调整塔位与经济后再次挑战' : node.id === 'win-panel' ? '月光灯塔再次照亮了林地' : node.text}
            </p>
            {node.id === 'win-panel' || node.id === 'lose-panel' ? (
              <div className="mt-4 grid w-full grid-cols-3 gap-2">
                {[['12', '消灭'], ['3', '波次'], ['86', '评分']].map(([value, label]) => (
                  <div key={label} className="rounded-lg bg-white/[0.06] py-2.5"><strong className="block text-[16px]">{value}</strong><span className="text-[10px]" style={{ color: preset.muted }}>{label}</span></div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    )
  }
  if (node.kind === 'container' && node.id.includes('-row-')) {
    return (
      <div className="flex h-full items-center justify-between border border-white/12 px-3" style={{ background: `${preset.surfaceRaised}E6`, borderRadius: r, color: preset.ink }}>
        <span className="truncate text-[13px]">{node.text || node.name}</span>
        <span className="text-[12px]" style={{ color: preset.muted }}>查看</span>
      </div>
    )
  }
  return (
    <div className="grid h-full place-items-center border border-white/10 bg-black/40 text-[13px] font-medium" style={{ color: preset.ink, borderRadius: r }}>
      {node.text || node.name}
    </div>
  )
}

export function TowerDefenseUiScreen({
  screen,
  screenMeta,
  nodes,
  ui,
  selectedId = null,
  links,
  interactive = false,
  fill = false,
  onSelect,
  onMoveStart,
  onActivate,
}: TowerDefenseUiScreenProps) {
  const preset = PRESETS[ui.visualPreset]
  const visible = nodesForScreen(nodes, screen)
  const kind = screenMeta?.kind ?? screen
  const showMap = screen === 'battle' || screen === 'pause' || screen === 'win' || screen === 'lose'
  const dimmed = kind === 'overlay' || screen === 'pause' || screen === 'win' || screen === 'lose'

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: fill ? '100%' : GAME_UI_WIDTH,
        height: fill ? '100%' : GAME_UI_HEIGHT,
        background: preset.surface,
        color: preset.ink,
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onSelect?.(null)
      }}
    >
      {showMap ? <BattleMap map={preset.map} /> : null}
      {dimmed ? <div className="absolute inset-0 z-10 bg-black/35" /> : null}

      {visible.map((item) => {
        const selected = selectedId === item.id
        const linked = Boolean(links?.[linkKey(screen, item.id)])
        const box: CSSProperties = {
          left: `${(item.x / GAME_UI_WIDTH) * 100}%`,
          top: `${(item.y / GAME_UI_HEIGHT) * 100}%`,
          width: `${(item.width / GAME_UI_WIDTH) * 100}%`,
          height: `${(item.height / GAME_UI_HEIGHT) * 100}%`,
          zIndex: item.z,
        }
        return (
          <div
            key={item.id}
            data-game-ui-node={item.id}
            role="button"
            aria-label={`${interactive ? '打开' : '编辑'}${item.name}`}
            aria-pressed={selected}
            className={`absolute cursor-pointer ${selected ? 'z-50' : ''}`}
            style={box}
            onPointerDown={(event) => {
              event.stopPropagation()
              onSelect?.(item.id)
              if (interactive && (isHotspot(item) || linked)) {
                onActivate?.(item.id)
                return
              }
              if (!item.locked) onMoveStart?.(item.id, event.clientX, event.clientY)
            }}
          >
            {item.render === 'art' && item.artSlot ? (
              <img
                src={item.artSlot}
                alt=""
                className={`size-full ${item.id.endsWith('-bg') ? 'object-cover' : 'object-fill'}`}
              />
            ) : (
              <CodeBody node={item} preset={preset} radius={ui.cornerRadius} />
            )}
            {item.render === 'art' && !interactive ? (
              <span className="pointer-events-none absolute left-0 top-0 rounded-br-sm bg-[#2f6bff] px-1 text-[8px] leading-[14px] text-white">
                {item.artSource === 'upload' ? '图·传' : '图·切'}
              </span>
            ) : null}
            {linked && !interactive ? (
              <span className="pointer-events-none absolute -right-1 -top-1 size-1.5 rounded-full bg-[#2f6bff] shadow-[0_0_0_2px_rgba(47,107,255,.2)]" />
            ) : null}
          </div>
        )
      })}

      {screen === 'pause' ? (
        <span className="pointer-events-none absolute left-1/2 top-[34%] z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[12px] text-white">
          <Play className="size-3.5" />已暂停
        </span>
      ) : null}
    </div>
  )
}

export default TowerDefenseUiScreen
