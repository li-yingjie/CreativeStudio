import { H5_LAB_PROJECT_NAMES } from './h5-lab/h5-lab-cases'
import type { ProjectKind } from './ProjectProductView'

/** 首页两个主 tab 对应的功能线。素材库等共用模块先各走各的。 */
export type WorkshopLane = 'marketing' | 'game'

export function laneFromHomeScene(scene?: string): WorkshopLane {
  return scene === 'game' || scene === 'game-assets' ? 'game' : 'marketing'
}

export function laneFromKind(kind: ProjectKind): WorkshopLane | undefined {
  if (kind === 'web-game') return 'game'
  if (kind === 'marketing-h5') return 'marketing'
  return undefined
}

const SEEDED_PROJECT_LANES: Record<string, WorkshopLane> = {
  射击小游戏: 'game',
  '抖音 ACG 游戏新春会': 'marketing',
  '夯爆了 已上线': 'marketing',
  '夏日冲浪 · 顺风顺水': 'marketing',
  ...Object.fromEntries(
    H5_LAB_PROJECT_NAMES.map((name) => [name, 'marketing' as const]),
  ),
}

export function seededProjectLane(name: string): WorkshopLane | undefined {
  return SEEDED_PROJECT_LANES[name]
}
