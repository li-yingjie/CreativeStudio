export type TowerMapEditObject = 'point' | 'path' | 'area'
export type TowerMapMotionMode = 'static' | 'scroll'
export type TowerMapPathMode = 'polyline' | 'curve'
export type TowerMapAreaAction = 'brush' | 'erase'
export type TowerMapPointSemantic =
  | 'tower'
  | 'enemy_spawn'
  | 'player_spawn'
  | 'target'
  | 'tower_core'
  | 'boss'
  | 'resource'
export type TowerMapPathSemantic = 'movement_route' | 'patrol_route'
export type TowerMapAreaSemantic =
  | 'collision'
  | 'spawn_area'
  | 'activity_boundary'
  | 'placement_tower'
export type TowerMapBlockingType = 'movement' | 'projectile' | 'vision' | 'all'

export interface TowerMapPoint {
  x: number
  y: number
}

export interface TowerMapMarker extends TowerMapPoint {
  id: string
  label: string
  semantic: Exclude<TowerMapPointSemantic, 'tower'>
}

export interface TowerMapPath {
  id: string
  label: string
  semantic: string
  mode: TowerMapPathMode
  width: number
  points: TowerMapPoint[]
}

export interface TowerMapArea {
  id: string
  label: string
  semantic: string
  blocking: TowerMapBlockingType
  x: number
  y: number
  width: number
  height: number
  points?: TowerMapPoint[]
  brushSize?: number
}

export interface TowerDefenseMapEditorState {
  levelId: string
  backgroundUrl?: string
  backgroundName: string
  motionMode: TowerMapMotionMode
  scrollDirection: 'vertical' | 'horizontal'
  scrollSpeed: 'slow' | 'medium' | 'fast'
  editObject: TowerMapEditObject
  pointSemantic: TowerMapPointSemantic
  pathSemantic: TowerMapPathSemantic
  areaSemantic: TowerMapAreaSemantic
  pathMode: TowerMapPathMode
  pathWidth: number
  areaAction: TowerMapAreaAction
  blockingType: TowerMapBlockingType
  brushSize: number
  selectedObjectId: string | null
  markers: TowerMapMarker[]
  paths: TowerMapPath[]
  areas: TowerMapArea[]
  draftPath: TowerMapPoint[]
  simulating: boolean
  simulationStartedAt: number | null
}

export function createDefaultTowerDefenseMapEditorState(): TowerDefenseMapEditorState {
  return {
    levelId: '第一关 · 月隐林',
    backgroundName: '当前引用地图',
    motionMode: 'static',
    scrollDirection: 'vertical',
    scrollSpeed: 'medium',
    editObject: 'point',
    pointSemantic: 'tower',
    pathSemantic: 'movement_route',
    areaSemantic: 'collision',
    pathMode: 'curve',
    pathWidth: 16,
    areaAction: 'brush',
    blockingType: 'movement',
    brushSize: 48,
    selectedObjectId: null,
    markers: [
      { id: 'entry-anchor', label: '敌人出生点', semantic: 'enemy_spawn', x: 57, y: 4 },
      { id: 'base-anchor', label: '终点 / 消失点', semantic: 'target', x: 48, y: 96 },
      { id: 'hero-anchor', label: '玩家出生点', semantic: 'player_spawn', x: 52, y: 88 },
    ],
    paths: [
      {
        id: 'path-enemy-main',
        label: '主进攻路线',
        semantic: 'movement_route',
        mode: 'curve',
        width: 16,
        points: [
          { x: 57, y: 3 },
          { x: 65, y: 17 },
          { x: 44, y: 31 },
          { x: 65, y: 48 },
          { x: 42, y: 64 },
          { x: 55, y: 81 },
          { x: 48, y: 96 },
        ],
      },
    ],
    areas: [],
    draftPath: [],
    simulating: false,
    simulationStartedAt: null,
  }
}
