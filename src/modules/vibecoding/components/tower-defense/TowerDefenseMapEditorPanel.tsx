import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Brush,
  Check,
  Eraser,
  Image,
  Layers,
  Pin,
  Play,
  Target,
  Trash2,
  Upload,
} from '@/shared/icons'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { TowerSlot } from './TowerDefenseFlowModel'
import type {
  TowerDefenseMapEditorState,
  TowerMapArea,
  TowerMapAreaSemantic,
  TowerMapBlockingType,
  TowerMapMarker,
  TowerMapPathSemantic,
  TowerMapPoint,
  TowerMapPointSemantic,
} from './TowerDefenseMapEditorModel'

const clamp = (value: number) => Math.min(97, Math.max(3, value))
const distance = (a: TowerMapPoint, b: TowerMapPoint) =>
  Math.hypot(a.x - b.x, a.y - b.y)

const pointAlongPath = (points: TowerMapPoint[], progress: number) => {
  if (points.length < 2) return points[0] ?? { x: 50, y: 50 }
  const lengths = points.slice(1).map((point, index) => distance(points[index], point))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  if (!total) return points[0]
  let remaining = Math.min(1, Math.max(0, progress)) * total
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]
    if (remaining <= length) {
      const ratio = length ? remaining / length : 0
      return {
        x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
        y: points[index].y + (points[index + 1].y - points[index].y) * ratio,
      }
    }
    remaining -= length
  }
  return points.at(-1) ?? points[0]
}

type SimulationRouteSource = 'explicit' | 'direct'

interface SimulationRoute {
  spawnId: string
  spawnLabel: string
  points: TowerMapPoint[]
  source: SimulationRouteSource
}

interface AreaBounds {
  left: number
  right: number
  top: number
  bottom: number
}

const routeLength = (points: TowerMapPoint[]) =>
  points.slice(1).reduce((total, point, index) => total + distance(points[index], point), 0)

const areaBounds = (area: TowerMapArea): AreaBounds => {
  if (!area.points?.length) {
    return {
      left: area.x,
      right: area.x + area.width,
      top: area.y,
      bottom: area.y + area.height,
    }
  }
  const radius = ((area.brushSize ?? 48) / 768) * 50
  const xs = area.points.map((point) => point.x)
  const ys = area.points.map((point) => point.y)
  return {
    left: Math.min(...xs) - radius,
    right: Math.max(...xs) + radius,
    top: Math.min(...ys) - radius,
    bottom: Math.max(...ys) + radius,
  }
}

const pointInsideBounds = (point: TowerMapPoint, bounds: AreaBounds) =>
  point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.top && point.y <= bounds.bottom

const segmentCrossesBounds = (start: TowerMapPoint, end: TowerMapPoint, bounds: AreaBounds) => {
  const steps = Math.max(12, Math.ceil(distance(start, end)))
  for (let step = 1; step < steps; step += 1) {
    const ratio = step / steps
    if (pointInsideBounds({
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio,
    }, bounds)) return true
  }
  return false
}

const addEndpoint = (points: TowerMapPoint[], point: TowerMapPoint, atStart: boolean) => {
  const endpoint = atStart ? points[0] : points.at(-1)
  if (endpoint && distance(endpoint, point) < 1.5) return points
  return atStart ? [point, ...points] : [...points, point]
}

const createDetour = (start: TowerMapPoint, end: TowerMapPoint, bounds: AreaBounds) => {
  const gap = 2.5
  const left = clamp(bounds.left - gap)
  const right = clamp(bounds.right + gap)
  const top = clamp(bounds.top - gap)
  const bottom = clamp(bounds.bottom + gap)
  const options: TowerMapPoint[][] = [
    [{ x: left, y: top }, { x: right, y: top }],
    [{ x: left, y: bottom }, { x: right, y: bottom }],
    [{ x: left, y: top }, { x: left, y: bottom }],
    [{ x: right, y: top }, { x: right, y: bottom }],
  ]
  return options
    .filter((points) => {
      const route = [start, ...points, end]
      return route.slice(1).every((point, index) => !segmentCrossesBounds(route[index], point, bounds))
    })
    .sort((a, b) => routeLength([start, ...a, end]) - routeLength([start, ...b, end]))[0]
    ?? options.sort((a, b) => routeLength([start, ...a, end]) - routeLength([start, ...b, end]))[0]
}

const routeAroundAreas = (baseRoute: TowerMapPoint[], areas: TowerMapArea[]) => {
  const route = [...baseRoute]
  areas.forEach((area) => {
    const bounds = areaBounds(area)
    for (let index = 0; index < route.length - 1; index += 1) {
      if (!segmentCrossesBounds(route[index], route[index + 1], bounds)) continue
      route.splice(index + 1, 0, ...createDetour(route[index], route[index + 1], bounds))
      index += 2
    }
  })
  return route
}

const routeDistanceToPoint = (points: TowerMapPoint[], point: TowerMapPoint) =>
  Math.min(...points.map((pathPoint) => distance(pathPoint, point)))

const orientRoute = (points: TowerMapPoint[], start: TowerMapPoint, target: TowerMapPoint) => {
  if (points.length < 2) return points
  const forwardScore = distance(start, points[0]) + distance(points.at(-1) ?? points[0], target)
  const reverseScore = distance(start, points.at(-1) ?? points[0]) + distance(points[0], target)
  return forwardScore <= reverseScore ? points : [...points].reverse()
}

const resolveSimulationRoutes = (editor: TowerDefenseMapEditorState): SimulationRoute[] => {
  const spawnMarkers = editor.markers.filter((marker) =>
    marker.semantic === 'enemy_spawn' || marker.semantic === 'boss',
  )
  const towerTargets = editor.markers.filter((marker) => marker.semantic === 'tower_core')
  const targets = towerTargets.length
    ? towerTargets
    : editor.markers.filter((marker) => marker.semantic === 'target')
  if (!spawnMarkers.length || !targets.length) return []
  const blockingAreas = editor.areas.filter((area) =>
    area.semantic === 'collision' && (area.blocking === 'movement' || area.blocking === 'all'),
  )
  const movementRoutes = editor.paths.filter((path) =>
    path.semantic === 'movement_route' && path.points.length > 1,
  )

  return spawnMarkers.map((spawn) => {
    const target = [...targets].sort((a, b) => distance(spawn, a) - distance(spawn, b))[0]
    const explicit = [...movementRoutes].sort((a, b) =>
      routeDistanceToPoint(a.points, spawn) - routeDistanceToPoint(b.points, spawn),
    )[0]
    if (!explicit) {
      const points = blockingAreas.length
        ? routeAroundAreas([spawn, target], blockingAreas)
        : [spawn, target]
      return { spawnId: spawn.id, spawnLabel: spawn.label, points, source: 'direct' }
    }
    let points = orientRoute(explicit.points, spawn, target)
    points = addEndpoint(points, spawn, true)
    points = addEndpoint(points, target, false)
    if (blockingAreas.length) points = routeAroundAreas(points, blockingAreas)
    return { spawnId: spawn.id, spawnLabel: spawn.label, points, source: 'explicit' }
  })
}

const simulationModeLabel = (
  routes: SimulationRoute[],
  editor: TowerDefenseMapEditorState,
) => {
  if (routes.some((route) => route.source === 'explicit')) return '沿用户绘制路线移动'
  const hasMovementBlocking = editor.areas.some((area) =>
    area.semantic === 'collision' && (area.blocking === 'movement' || area.blocking === 'all'),
  )
  return hasMovementBlocking ? '点对点移动 · 自动避让碰撞区' : '点对点移动'
}

const pointSemantics = [
  ['tower', '建造塔位'],
  ['enemy_spawn', '敌人出生点'],
  ['player_spawn', '玩家出生点'],
  ['target', '终点 / 消失点'],
  ['tower_core', '攻击目标点'],
  ['boss', 'Boss 点'],
  ['resource', '资源点'],
] as const
const pathSemantics = [
  ['movement_route', '移动路线'],
  ['patrol_route', '巡逻 / 过场路线'],
] as const
const areaSemantics = [
  ['collision', '碰撞区'],
  ['spawn_area', '敌人刷新区'],
  ['activity_boundary', '活动区'],
  ['placement_tower', '可放置区'],
] as const

const pointColors: Record<TowerMapPointSemantic, string> = {
  tower: '#22c55e',
  enemy_spawn: '#ef4444',
  player_spawn: '#22c55e',
  target: '#3b82f6',
  tower_core: '#06b6d4',
  boss: '#a855f7',
  resource: '#f59e0b',
}
const pathColors: Record<TowerMapPathSemantic, string> = {
  movement_route: '#8b5cf6',
  patrol_route: '#0d9488',
}
const areaColors: Record<TowerMapAreaSemantic, string> = {
  collision: '#ef4444',
  spawn_area: '#f97316',
  activity_boundary: '#14b8a6',
  placement_tower: '#1ca672',
}
const blockingColors: Record<TowerMapBlockingType, string> = {
  movement: '#ef4444',
  projectile: '#f59e0b',
  vision: '#8b5cf6',
  all: '#7f1d1d',
}
const semanticLabel = (semantic: string) => {
  const options: ReadonlyArray<readonly [string, string]> = [
    ...pointSemantics,
    ...pathSemantics,
    ...areaSemantics,
  ]
  return options.find(([id]) => id === semantic)?.[1] ?? semantic
}

const pathData = (points: TowerMapPoint[], mode: 'polyline' | 'curve') => {
  if (!points.length) return ''
  if (mode === 'polyline' || points.length < 3)
    return `M ${points.map((point) => `${point.x} ${point.y}`).join(' L ')}`
  const commands = [`M ${points[0].x} ${points[0].y}`]
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const middle = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 }
    commands.push(`Q ${current.x} ${current.y} ${middle.x} ${middle.y}`)
  }
  const penultimate = points.at(-2)
  const last = points.at(-1)
  if (penultimate && last) commands.push(`Q ${penultimate.x} ${penultimate.y} ${last.x} ${last.y}`)
  return commands.join(' ')
}

interface CanvasProps {
  imageUrl?: string
  enemyImageUrl?: string
  slots: TowerSlot[]
  editor: TowerDefenseMapEditorState
  onSlotsChange: (slots: TowerSlot[]) => void
  onEditorChange: (editor: TowerDefenseMapEditorState) => void
  className?: string
}

export function TowerDefenseMapEditorCanvas({
  imageUrl,
  enemyImageUrl,
  slots,
  editor,
  onSlotsChange,
  onEditorChange,
  className,
}: CanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null)
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null)
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null)
  const [brushCursor, setBrushCursor] = useState<TowerMapPoint | null>(null)
  const [simulationNow, setSimulationNow] = useState(() => Date.now())
  const simulationRoutes = useMemo(() => resolveSimulationRoutes(editor), [editor])
  const simulationUnits = useMemo(() => {
    if (!editor.simulating || !editor.simulationStartedAt || !simulationRoutes.length)
      return []
    const elapsed = Math.max(0, simulationNow - editor.simulationStartedAt)
    const travelDuration = 8200
    const respawnDelay = 1400
    const cycleDuration = travelDuration + respawnDelay
    return simulationRoutes.flatMap((route) => {
      const spawnIndex = Math.floor(elapsed / cycleDuration)
      const age = elapsed - spawnIndex * cycleDuration
      if (age >= travelDuration) return []
      return [{
        id: `sim-enemy-${route.spawnId}-${spawnIndex}`,
        spawnIndex,
        spawnLabel: route.spawnLabel,
        point: pointAlongPath(route.points, age / travelDuration),
      }]
    })
  }, [editor.simulating, editor.simulationStartedAt, simulationNow, simulationRoutes])

  useEffect(() => {
    if (!editor.simulating) return
    const timer = window.setInterval(() => setSimulationNow(Date.now()), 50)
    return () => window.clearInterval(timer)
  }, [editor.simulating])

  const eventPoint = (event: ReactPointerEvent) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100),
    }
  }

  const appendBrushPoint = (point: TowerMapPoint) => {
    if (!activeAreaId) return
    onEditorChange({
      ...editor,
      areas: editor.areas.map((area) => {
        if (area.id !== activeAreaId) return area
        const points = area.points ?? []
        const last = points.at(-1)
        if (last && distance(last, point) < Math.max(0.6, editor.brushSize / 32))
          return area
        const next = [...points, point]
        const xs = next.map((item) => item.x)
        const ys = next.map((item) => item.y)
        const x = Math.min(...xs)
        const y = Math.min(...ys)
        return {
          ...area,
          points: next,
          x,
          y,
          width: Math.max(1, Math.max(...xs) - x),
          height: Math.max(1, Math.max(...ys) - y),
        }
      }),
    })
  }

  const eraseAreaAt = (point: TowerMapPoint) => {
    const hit = [...editor.areas].reverse().find((area) => {
      if (area.points?.length) {
        const radius = Math.max(1.5, (area.brushSize ?? editor.brushSize) / 12)
        return area.points.some((item) => distance(item, point) <= radius)
      }
      return point.x >= area.x && point.x <= area.x + area.width && point.y >= area.y && point.y <= area.y + area.height
    })
    if (!hit) return
    onEditorChange({
      ...editor,
      areas: editor.areas.filter((area) => area.id !== hit.id),
      selectedObjectId: null,
    })
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    const point = eventPoint(event)
    if (!point) return
    if (editor.editObject === 'point') {
      if (editor.pointSemantic === 'tower') {
        const id = `slot-${Date.now().toString(36)}`
        onSlotsChange([
          ...slots,
          {
            id,
            label: String(slots.length + 1).padStart(2, '0'),
            ...point,
            occupiedBy: null,
            level: 1,
          },
        ])
        onEditorChange({ ...editor, selectedObjectId: id })
        return
      }
      const id = `${editor.pointSemantic}-${Date.now().toString(36)}`
      onEditorChange({
        ...editor,
        markers: [
          ...editor.markers,
          {
            id,
            label: semanticLabel(editor.pointSemantic),
            semantic: editor.pointSemantic as TowerMapMarker['semantic'],
            ...point,
          },
        ],
        selectedObjectId: id,
      })
      return
    }
    if (editor.editObject === 'path') {
      onEditorChange({ ...editor, draftPath: [...editor.draftPath, point] })
      return
    }
    if (editor.areaAction === 'erase') {
      eraseAreaAt(point)
      return
    }
    const id = `area-${Date.now().toString(36)}`
    const area: TowerMapArea = {
      id,
      label: `${semanticLabel(editor.areaSemantic)} ${editor.areas.length + 1}`,
      semantic: editor.areaSemantic,
      blocking: editor.blockingType,
      x: point.x,
      y: point.y,
      width: 1,
      height: 1,
      points: [point],
      brushSize: editor.brushSize,
    }
    onEditorChange({ ...editor, areas: [...editor.areas, area], selectedObjectId: id })
    setActiveAreaId(id)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  return (
    <section aria-label="地图编辑画布" className={`relative flex min-h-0 flex-1 overflow-auto bg-[#eef1f5] ${className ?? ''}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(22,24,35,.11) 1px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
      <div className="relative z-10 m-auto flex min-h-full w-full items-center justify-center p-4">
        <div
          ref={mapRef}
          role="application"
          aria-label="塔防地图对象编辑器"
          onPointerDown={handlePointerDown}
          onPointerMove={(event) => {
            const point = eventPoint(event)
            if (!point) return
            setBrushCursor(point)
            if (draggingSlotId) {
              onSlotsChange(slots.map((slot) => slot.id === draggingSlotId ? { ...slot, ...point } : slot))
            } else if (draggingMarkerId) {
              onEditorChange({
                ...editor,
                markers: editor.markers.map((marker) =>
                  marker.id === draggingMarkerId ? { ...marker, ...point } : marker,
                ),
              })
            } else if (activeAreaId) appendBrushPoint(point)
          }}
          onPointerUp={() => { setDraggingSlotId(null); setDraggingMarkerId(null); setActiveAreaId(null) }}
          onPointerCancel={() => { setDraggingSlotId(null); setDraggingMarkerId(null); setActiveAreaId(null) }}
          onPointerLeave={() => setBrushCursor(null)}
          className="relative aspect-[67/120] w-full max-w-[430px] touch-none overflow-hidden rounded-lg border border-black/10 bg-[#d1b377] shadow-[0_18px_48px_rgba(22,24,35,.16)] [container-type:inline-size] cursor-crosshair"
        >
          {imageUrl ? <img src={imageUrl} alt="当前关卡地图" className="pointer-events-none absolute inset-0 size-full object-cover" draggable={false} /> : <div className="absolute inset-0 grid place-items-center text-[12px] text-[#161823]/35">等待地图素材</div>}
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full overflow-visible">
            {editor.paths.map((path) => {
              const color = pathColors[path.semantic as TowerMapPathSemantic] ?? '#8b5cf6'
              const selected = editor.selectedObjectId === path.id
              const d = pathData(path.points, path.mode)
              return <g key={path.id}>{selected && <path d={d} fill="none" stroke="#f59e0b" strokeWidth={(path.width + 8) / 7.68} strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />}<path d={d} fill="none" stroke={color} strokeWidth={path.width / 7.68} strokeLinecap="round" strokeLinejoin="round" opacity="0.95" /></g>
            })}
            {editor.draftPath.length > 1 && <path d={pathData(editor.draftPath, editor.pathMode)} fill="none" stroke={pathColors[editor.pathSemantic]} strokeWidth={editor.pathWidth / 7.68} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.3 1" opacity="0.9" />}
          </svg>
          {editor.areas.flatMap((area) => {
            const color = area.semantic === 'collision' ? blockingColors[area.blocking] : areaColors[area.semantic as TowerMapAreaSemantic] ?? '#64748b'
            const brushSize = area.brushSize ?? editor.brushSize
            const selected = editor.selectedObjectId === area.id
            const points = area.points?.length ? area.points : [{ x: area.x, y: area.y }]
            return points.map((point, index) => <span key={`${area.id}-${index}`} aria-hidden className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ left: `${point.x}%`, top: `${point.y}%`, width: `${(brushSize / 768) * 100}%`, aspectRatio: '1', borderColor: selected ? '#f59e0b' : `color-mix(in srgb, ${color} 58%, transparent)`, borderWidth: selected ? '2px' : '1px', backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`, backgroundImage: `repeating-linear-gradient(135deg, transparent 0 7px, color-mix(in srgb, ${color} 18%, transparent) 7px 8px)` }} />)
          })}
          {editor.draftPath.map((point, index) => <span key={`${point.x}-${point.y}-${index}`} className="pointer-events-none absolute w-[1.56%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${point.x}%`, top: `${point.y}%`, aspectRatio: '1', backgroundColor: pathColors[editor.pathSemantic] }} />)}
          {slots.map((slot) => <button key={slot.id} type="button" aria-label={`建造塔位 ${slot.label}`} onClick={(event) => { event.stopPropagation(); onEditorChange({ ...editor, selectedObjectId: slot.id }) }} onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setDraggingSlotId(slot.id); onEditorChange({ ...editor, selectedObjectId: slot.id }) }} className="absolute flex cursor-grab -translate-y-1/2 items-center gap-1 text-left active:cursor-grabbing" style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-1.3cqw, -50%)' }}><span className={`shrink-0 rounded-full border border-white shadow-[0_1px_3px_rgba(0,0,0,.32)] ${editor.selectedObjectId === slot.id ? 'ring-2 ring-[#f59e0b]' : ''}`} style={{ width: 'clamp(7px, 2.6cqw, 11px)', aspectRatio: '1', backgroundColor: pointColors.tower }} /><span className="whitespace-nowrap text-[7px] font-bold text-[#152033] [text-shadow:0_1px_2px_white,0_0_3px_white]">塔位 {slot.label}</span></button>)}
          {editor.markers.map((marker) => <button key={marker.id} type="button" aria-label={marker.label} onClick={(event) => { event.stopPropagation(); onEditorChange({ ...editor, selectedObjectId: marker.id }) }} onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setDraggingMarkerId(marker.id); onEditorChange({ ...editor, selectedObjectId: marker.id }) }} className="absolute flex cursor-grab -translate-y-1/2 items-center gap-1 text-left active:cursor-grabbing" style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-1.3cqw, -50%)' }}><span className={`shrink-0 rounded-full border border-white shadow-[0_1px_3px_rgba(0,0,0,.32)] ${editor.selectedObjectId === marker.id ? 'ring-2 ring-[#f59e0b]' : ''}`} style={{ width: 'clamp(7px, 2.6cqw, 11px)', aspectRatio: '1', backgroundColor: pointColors[marker.semantic] }} /><span className="whitespace-nowrap text-[7px] font-bold text-[#152033] [text-shadow:0_1px_2px_white,0_0_3px_white]">{marker.label}</span></button>)}
          {simulationUnits.map((unit) => <span key={unit.id} aria-label={`${unit.spawnLabel} 模拟敌兵 ${unit.spawnIndex + 1}`} className="pointer-events-none absolute z-30 grid -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: `${unit.point.x}%`, top: `${unit.point.y}%`, width: 'clamp(18px, 7cqw, 30px)', aspectRatio: '1' }}>{enemyImageUrl ? <img src={enemyImageUrl} alt="" className="size-full object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,.55)]" /> : <span className="grid size-full place-items-center rounded-full border-2 border-white bg-rose-500 text-[8px] font-black text-white shadow-md">兵</span>}<span className="absolute -top-1 left-1/2 h-0.5 w-4 -translate-x-1/2 overflow-hidden rounded-full bg-black/35"><span className="block h-full w-4/5 bg-rose-400" /></span></span>)}
          {editor.editObject === 'area' && brushCursor && <span aria-hidden className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${editor.areaAction === 'erase' ? 'border-rose-500 bg-rose-500/12' : 'border-white bg-white/15'}`} style={{ left: `${brushCursor.x}%`, top: `${brushCursor.y}%`, width: `${(Math.max(16, editor.brushSize) / 768) * 100}%`, aspectRatio: '1' }} />}
          {editor.simulating && simulationRoutes.length > 0 && <div className="pointer-events-none absolute inset-x-4 top-4 z-40 flex items-center gap-2 rounded-lg bg-[#161823]/82 px-3 py-2 text-[10px] text-white backdrop-blur-sm"><span className="size-2 animate-pulse rounded-full bg-[#54D6A4]" />已出兵 {simulationUnits.length} · {simulationRoutes.length} 个出生点 · {simulationModeLabel(simulationRoutes, editor)}</div>}
        </div>
      </div>
    </section>
  )
}

interface PanelProps {
  slots: TowerSlot[]
  editor: TowerDefenseMapEditorState
  onSlotsChange: (slots: TowerSlot[]) => void
  onEditorChange: (editor: TowerDefenseMapEditorState) => void
  onApply?: () => void
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: readonly (readonly [T, string])[]; onChange: (value: T) => void }) {
  return <div className="grid grid-flow-col auto-cols-fr gap-1">{options.map(([id, label]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)} className={`h-8 rounded-lg border px-2 text-[10px] font-medium ${value === id ? 'border-[#161823] bg-[#161823] text-white' : 'border-black/[0.08] bg-white text-[#161823]/52 hover:bg-[#f5f5f6]'}`}>{label}</button>)}</div>
}

function GroupTitle({ icon: Icon, children }: { icon?: typeof Pin; children: string }) {
  return <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#161823]">{Icon ? <Icon className="size-3.5 text-[#161823]/50" /> : <span className="h-3.5 w-[3px] rounded-full bg-[#161823]" />}{children}</div>
}

export default function TowerDefenseMapEditorPanel({ slots, editor, onSlotsChange, onEditorChange, onApply }: PanelProps) {
  const selectedSlot = useMemo(() => slots.find((slot) => slot.id === editor.selectedObjectId) ?? null, [editor.selectedObjectId, slots])
  const selectedPath = useMemo(() => editor.paths.find((path) => path.id === editor.selectedObjectId) ?? null, [editor.paths, editor.selectedObjectId])
  const selectedArea = useMemo(() => editor.areas.find((area) => area.id === editor.selectedObjectId) ?? null, [editor.areas, editor.selectedObjectId])
  const selectedMarker = useMemo(() => editor.markers.find((marker) => marker.id === editor.selectedObjectId) ?? null, [editor.markers, editor.selectedObjectId])
  const simulationRoutes = useMemo(() => resolveSimulationRoutes(editor), [editor])
  const simulationLabel = simulationRoutes.length
    ? `${simulationRoutes.length} 个出生点 · ${simulationModeLabel(simulationRoutes, editor)}`
    : '请至少设置敌人出生点和终点'
  const semantics: ReadonlyArray<readonly [string, string]> = editor.editObject === 'point' ? pointSemantics : editor.editObject === 'path' ? pathSemantics : areaSemantics
  const activeSemantic = editor.editObject === 'point' ? editor.pointSemantic : editor.editObject === 'path' ? editor.pathSemantic : editor.areaSemantic
  const semanticColor = (semantic: string) => editor.editObject === 'point' ? pointColors[semantic as TowerMapPointSemantic] : editor.editObject === 'path' ? pathColors[semantic as TowerMapPathSemantic] : areaColors[semantic as TowerMapAreaSemantic]

  const commitDraftPath = () => {
    if (editor.draftPath.length < 2) return
    const id = `path-${Date.now().toString(36)}`
    onEditorChange({ ...editor, paths: [...editor.paths, { id, label: `${semanticLabel(editor.pathSemantic)} ${editor.paths.length + 1}`, semantic: editor.pathSemantic, mode: editor.pathMode, width: editor.pathWidth, points: editor.draftPath }], draftPath: [], selectedObjectId: id })
  }
  const deleteObject = (id: string) => {
    if (slots.some((slot) => slot.id === id)) onSlotsChange(slots.filter((slot) => slot.id !== id))
    onEditorChange({ ...editor, markers: editor.markers.filter((item) => item.id !== id), paths: editor.paths.filter((item) => item.id !== id), areas: editor.areas.filter((item) => item.id !== id), selectedObjectId: editor.selectedObjectId === id ? null : editor.selectedObjectId })
  }
  const deleteSelected = () => editor.selectedObjectId && deleteObject(editor.selectedObjectId)
  const selectedLabel = selectedSlot ? selectedSlot.label : selectedMarker?.label ?? selectedPath?.label ?? selectedArea?.label ?? ''
  const updateSelectedLabel = (label: string) => {
    if (selectedSlot) { onSlotsChange(slots.map((slot) => slot.id === selectedSlot.id ? { ...slot, label } : slot)); return }
    onEditorChange({ ...editor, markers: editor.markers.map((item) => item.id === editor.selectedObjectId ? { ...item, label } : item), paths: editor.paths.map((item) => item.id === editor.selectedObjectId ? { ...item, label } : item), areas: editor.areas.map((item) => item.id === editor.selectedObjectId ? { ...item, label } : item) })
  }

  return <div className="flex h-full min-h-0 flex-col bg-[#f8fafc]">
    <div className="thin-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
      <section className="rounded-lg border border-black/[0.08] bg-white p-3 shadow-[0_1px_0_rgba(15,23,42,.03)]">
        <GroupTitle icon={Layers}>地图编辑</GroupTitle>
        <p className="mb-3 text-[9px] leading-4 text-[#161823]/42">在中间地图上点击或拖拽；右侧工具会实时回写点位、路线与区域。</p>
        <label className="block text-[9px] font-medium text-[#161823]/48">当前关卡<select value={editor.levelId} onChange={(event) => onEditorChange({ ...editor, levelId: event.target.value })} className="mt-1.5 h-8 w-full rounded-lg border border-black/[0.08] bg-white px-2.5 text-[10px] font-medium text-[#161823] outline-none"><option>第一关 · 月隐林</option><option>第二关 · 西凉古道</option><option>第三关 · 虎牢关</option></select></label>
        <div className="mt-3 text-[9px] font-medium text-[#161823]/48">资源导入</div>
        <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
          <label className="grid size-16 shrink-0 cursor-pointer place-items-center rounded-lg border border-dashed border-black/[0.12] bg-[#fafafa] text-[#161823]/40 hover:bg-[#f5f5f6]"><Upload className="size-4" /><input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => onEditorChange({ ...editor, backgroundName: file.name, backgroundUrl: String(reader.result) }); reader.readAsDataURL(file) }} /></label>
          <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#2979ff] bg-white text-[9px] font-semibold text-[#161823] ring-2 ring-[#2979ff]/10"><Image className="size-4 text-[#161823]/45" /><span className="absolute inset-x-1 bottom-1 truncate text-center">{editor.backgroundName}</span></div>
        </div>
        <FieldLabel>地图运动</FieldLabel><Segmented value={editor.motionMode} options={[[ 'static', '静止' ], [ 'scroll', '滚动' ]]} onChange={(motionMode) => onEditorChange({ ...editor, motionMode })} />
        {editor.motionMode === 'scroll' && <div className="mt-2 grid grid-cols-2 gap-2"><select value={editor.scrollDirection} onChange={(event) => onEditorChange({ ...editor, scrollDirection: event.target.value as 'vertical' | 'horizontal' })} className="h-8 rounded-lg border border-black/[0.08] bg-white px-2 text-[10px] outline-none"><option value="vertical">纵向卷轴</option><option value="horizontal">横向卷轴</option></select><select value={editor.scrollSpeed} onChange={(event) => onEditorChange({ ...editor, scrollSpeed: event.target.value as 'slow' | 'medium' | 'fast' })} className="h-8 rounded-lg border border-black/[0.08] bg-white px-2 text-[10px] outline-none"><option value="slow">慢速</option><option value="medium">中速</option><option value="fast">快速</option></select></div>}
        <FieldLabel>编辑对象</FieldLabel><Segmented value={editor.editObject} options={[[ 'point', '点位' ], [ 'path', '路线' ], [ 'area', '区域' ]]} onChange={(editObject) => onEditorChange({ ...editor, editObject, selectedObjectId: null, draftPath: [] })} />
        <FieldLabel>对象类型</FieldLabel>
        <div className="grid grid-cols-4 gap-1.5">{semantics.map(([id, label]) => <button key={id} type="button" aria-pressed={activeSemantic === id} onClick={() => editor.editObject === 'point' ? onEditorChange({ ...editor, pointSemantic: id as TowerMapPointSemantic, selectedObjectId: null }) : editor.editObject === 'path' ? onEditorChange({ ...editor, pathSemantic: id as TowerMapPathSemantic, selectedObjectId: null, draftPath: [] }) : onEditorChange({ ...editor, areaSemantic: id as TowerMapAreaSemantic, selectedObjectId: null })} className={`relative min-h-8 rounded-lg border py-1 pl-4 pr-1 text-[8px] leading-3 ${activeSemantic === id ? 'font-semibold text-[#161823]' : 'border-black/[0.08] bg-white text-[#161823]/52 hover:bg-[#f5f5f6]'}`} style={activeSemantic === id ? { borderColor: semanticColor(id), backgroundColor: `color-mix(in srgb, ${semanticColor(id)} 11%, white)` } : undefined}><span className="absolute left-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full" style={{ backgroundColor: semanticColor(id) }} />{label}</button>)}</div>
      </section>

      {editor.editObject === 'point' && <ToolSection title="点位设置" icon={Pin}><p className="text-[9px] leading-4 text-[#161823]/42">点击空白处新增点位；按住已有点位可直接拖动，点击后也可在对象属性中精确修改坐标。</p></ToolSection>}
      {editor.editObject === 'path' && <ToolSection title="路线设置" icon={Target}>
        <p className="mb-3 text-[9px] leading-4 text-[#161823]/42">从起点开始点击途经点，最后点击“完成路线”；节点会按顺序连接。</p>
        <FieldText>画线方式</FieldText><Segmented value={editor.pathMode} options={[[ 'polyline', '折线' ], [ 'curve', '曲线' ]]} onChange={(pathMode) => onEditorChange({ ...editor, pathMode })} />
        <RangeControl label="路径宽度" value={editor.pathWidth} min={4} max={96} step={2} onChange={(pathWidth) => onEditorChange({ ...editor, pathWidth })} />
        <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={editor.draftPath.length < 2} onClick={commitDraftPath} className="h-8 rounded-lg bg-[#161823] text-[10px] font-medium text-white disabled:cursor-default disabled:opacity-30">完成路线 ({editor.draftPath.length})</button><button type="button" disabled={!editor.draftPath.length} onClick={() => onEditorChange({ ...editor, draftPath: [] })} className="h-8 rounded-lg border border-black/[0.08] bg-white text-[10px] text-[#161823]/55 disabled:cursor-default disabled:opacity-30">清除草稿</button></div>
      </ToolSection>}
      {editor.editObject === 'area' && <ToolSection title="区域笔刷设置" icon={Brush}>
        <p className="mb-3 text-[9px] leading-4 text-[#161823]/42">选择区域类型后，在地图上按住拖动连续绘制；擦除会删除命中的整段标记。</p>
        <FieldText>区域操作</FieldText><div className="grid grid-cols-2 gap-1.5"><BrushAction active={editor.areaAction === 'brush'} onClick={() => onEditorChange({ ...editor, areaAction: 'brush' })} icon={Brush}>画笔</BrushAction><BrushAction active={editor.areaAction === 'erase'} onClick={() => onEditorChange({ ...editor, areaAction: 'erase' })} icon={Eraser}>擦除</BrushAction></div>
        {editor.areaSemantic === 'collision' && <><FieldLabel>阻挡类型</FieldLabel><div className="grid grid-cols-4 gap-1.5">{([['movement','移动'],['projectile','弹道'],['vision','视野'],['all','全部']] as const).map(([id,label]) => <button key={id} type="button" onClick={() => onEditorChange({ ...editor, blockingType: id })} className={`relative h-8 rounded-lg border pl-3 text-[9px] ${editor.blockingType === id ? 'font-semibold text-[#161823]' : 'border-black/[0.08] bg-white text-[#161823]/48'}`} style={editor.blockingType === id ? { borderColor: blockingColors[id], backgroundColor: `color-mix(in srgb, ${blockingColors[id]} 10%, white)` } : undefined}><span className="absolute left-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full" style={{ backgroundColor: blockingColors[id] }} />{label}</button>)}</div></>}
        <RangeControl label="笔刷大小" value={editor.brushSize} min={16} max={120} step={4} onChange={(brushSize) => onEditorChange({ ...editor, brushSize })} />
      </ToolSection>}

      {(selectedSlot || selectedMarker || selectedPath || selectedArea) && <ToolSection title="对象属性" icon={Target} action={<button type="button" aria-label="删除当前对象" onClick={deleteSelected} className="grid size-7 place-items-center rounded-lg text-[#161823]/36 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="size-3.5" /></button>}>
        <label className="block text-[9px] font-medium text-[#161823]/48">标注名称<input value={selectedLabel} onChange={(event) => updateSelectedLabel(event.target.value)} className="mt-1.5 h-8 w-full rounded-lg border border-black/[0.08] bg-white px-2.5 text-[10px] text-[#161823] outline-none focus:border-black/25" /></label>
        <div className="mt-2 rounded-lg bg-[#f7f7f8] px-2.5 py-2 text-[9px] text-[#161823]/42">类型 · {selectedSlot ? '建造塔位' : semanticLabel(selectedMarker?.semantic ?? selectedPath?.semantic ?? selectedArea?.semantic ?? '')}</div>
        {(selectedSlot || selectedMarker) && <div className="mt-2 grid grid-cols-2 gap-2">{(['x','y'] as const).map((axis) => { const item = selectedSlot ?? selectedMarker; if (!item) return null; return <label key={axis} className="rounded-lg bg-[#f7f7f8] px-2.5 py-2 text-[9px] text-[#161823]/42">{axis === 'x' ? '横向位置' : '纵向位置'}<input type="number" min={3} max={97} value={Math.round(item[axis])} onChange={(event) => { const value = clamp(Number(event.target.value)); if (selectedSlot) onSlotsChange(slots.map((slot) => slot.id === selectedSlot.id ? { ...slot, [axis]: value } : slot)); else onEditorChange({ ...editor, markers: editor.markers.map((marker) => marker.id === selectedMarker?.id ? { ...marker, [axis]: value } : marker) }) }} className="mt-1 block w-full bg-transparent text-[11px] font-medium text-[#161823] outline-none" /></label>})}</div>}
      </ToolSection>}

      <ToolSection title="图层列表" icon={Layers} action={<button type="button" onClick={() => { onSlotsChange([]); onEditorChange({ ...editor, markers: [], paths: [], areas: [], draftPath: [], selectedObjectId: null }) }} className="h-7 rounded-lg border border-rose-200 px-2 text-[9px] text-rose-500 hover:bg-rose-50">清空草稿层</button>}>
        <div className="mb-2 text-[9px] text-[#161823]/38">{slots.length + editor.markers.length} 点位 · {editor.paths.length} 路线 · {editor.areas.length} 区域</div>
        <div className="space-y-1">{[
          ...slots.map((item) => ({ id:item.id,label:`塔位 ${item.label}`,kind:'点位',color:pointColors.tower })),
          ...editor.markers.map((item) => ({ id:item.id,label:item.label,kind:'点位',color:pointColors[item.semantic] })),
          ...editor.paths.map((item) => ({ id:item.id,label:item.label,kind:'路线',color:pathColors[item.semantic as TowerMapPathSemantic] ?? '#8b5cf6' })),
          ...editor.areas.map((item) => ({ id:item.id,label:item.label,kind:'区域',color:item.semantic === 'collision' ? blockingColors[item.blocking] : areaColors[item.semantic as TowerMapAreaSemantic] ?? '#64748b' })),
        ].filter((item) => editor.editObject === 'point' ? item.kind === '点位' : editor.editObject === 'path' ? item.kind === '路线' : item.kind === '区域').map((item) => <div key={item.id} role="button" tabIndex={0} onClick={() => onEditorChange({ ...editor, selectedObjectId: item.id })} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onEditorChange({ ...editor, selectedObjectId: item.id }) }} className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-left text-[10px] ${editor.selectedObjectId === item.id ? 'border-amber-400 bg-amber-50 text-[#161823]' : 'border-black/[0.06] bg-white text-[#161823]/62 hover:bg-[#f7f7f8]'}`}><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor:item.color }} /><span className="min-w-0 flex-1 truncate">{item.label}</span><span className="text-[8px] opacity-45">{item.kind}</span><button type="button" aria-label={`删除${item.label}`} onClick={(event) => { event.stopPropagation(); deleteObject(item.id) }} className="grid size-6 shrink-0 place-items-center rounded-md text-[#161823]/34 hover:bg-rose-50 hover:text-rose-500"><Trash2 className="size-3" /></button></div>)}</div>
      </ToolSection>
    </div>
    <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--divider-soft)] bg-white p-3 shadow-[0_-8px_18px_rgba(15,23,42,.04)]"><button type="button" aria-pressed={editor.simulating} disabled={!simulationRoutes.length} title={simulationLabel} onClick={() => { const simulating = !editor.simulating; onEditorChange({ ...editor, simulating, simulationStartedAt: simulating ? Date.now() : null }) }} className={`flex h-10 items-center justify-center gap-1.5 rounded-full text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-35 ${editor.simulating ? 'bg-amber-500 text-white' : 'bg-[#e9eef6] text-[#526174] hover:bg-[#dde4ee]'}`}><Play className="size-3.5" />{editor.simulating ? '停止模拟' : '开始模拟'}</button><button type="button" disabled={!onApply || slots.length === 0} onClick={onApply} className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#161823] text-[11px] font-medium text-white hover:bg-black disabled:cursor-default disabled:opacity-35"><Check className="size-3.5" />应用到预览</button></div>
  </div>
}

function FieldLabel({ children }: { children: string }) { return <div className="mb-1.5 mt-3 text-[9px] font-medium text-[#161823]/48">{children}</div> }
function FieldText({ children }: { children: string }) { return <div className="mb-1.5 text-[9px] font-medium text-[#161823]/48">{children}</div> }
function ToolSection({ title, icon, action, children }: { title: string; icon?: typeof Pin; action?: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-lg border border-black/[0.08] bg-white p-3 shadow-[0_1px_0_rgba(15,23,42,.03)]"><div className="flex items-start justify-between"><GroupTitle icon={icon}>{title}</GroupTitle>{action}</div>{children}</section> }
function BrushAction({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Brush; children: string }) { return <button type="button" aria-pressed={active} onClick={onClick} className="flex h-8 items-center justify-center gap-1 rounded-lg border border-black/[0.08] bg-white text-[10px] text-[#161823]/58 aria-pressed:border-[#161823] aria-pressed:bg-[#161823] aria-pressed:text-white"><Icon className="size-3.5" />{children}</button> }
function RangeControl({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) { return <label className="mt-3 block text-[9px] font-medium text-[#161823]/48">{label}<div className="mt-1.5 grid grid-cols-[1fr_34px] items-center gap-2"><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#161823]" /><span className="text-right text-[10px] font-semibold text-[#161823]">{value}</span></div></label> }
