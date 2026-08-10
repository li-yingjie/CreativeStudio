import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** 导航方案对比测试：
 *  1 = 全宽三段顶栏 + 透明侧栏，共享浅灰蓝渐变底板；
 *  2 = 收起/展开入口移到右侧内容区左上角，所有产品同一位置；首页不提供；
 *  3 = 原始全宽顶栏；
 *  4 = 沿用方案 8 的工具条骨架，但顶部 tab 恢复 icon + 文字，产品侧栏头用「开启创作」；
 *  5 = 沿用方案 3，底部使用 icon-only 收起与项目设置入口；
 *  6 = 沿用方案 8 的骨架，但各产品侧栏顶部统一为搜索工具栏（首页除外）；
 *  7 = 内部抖音 AI 工作台，无全局顶栏，使用工作台原生项目导航；
 *  8 = 全宽顶栏 + icon/文字 tab + 产品侧栏上下文工具条；
 *  9 = 沿用方案 4 的文案 Header，侧栏收起时保留 icon rail。 */
export type NavVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** 默认方案 4「文案 Header」。 */
export const DEFAULT_NAV_VERSION: NavVersion = 4

export function usesSchemeFourLayout(version: NavVersion) {
  return version === 4 || version === 9
}

/** 各方案的收起形态集中在这里，避免工坊 / 百科 / 随变各维护一份列表。 */
export function usesIconRailCollapse(version: NavVersion) {
  return (
    version === 1 ||
    version === 2 ||
    version === 3 ||
    version === 6 ||
    version === 7 ||
    version === 8 ||
    version === 9
  )
}

export function usesSearchToolbarLayout(version: NavVersion) {
  return version === 6
}

export function usesStandaloneWorkshopLayout(version: NavVersion) {
  return version === 7
}

/** 侧栏里不放收起入口，改由外壳在内容区左上角统一渲染一个。 */
export function usesContentToggleLayout(version: NavVersion) {
  return version === 2
}

/** 侧栏顶部是 UnifiedToolbar（收起态只留「收起导航」一颗）。 */
export function usesToolbarHeaderLayout(version: NavVersion) {
  return version === 8
}

export function usesProductHeaderLayout(version: NavVersion) {
  // 内容区收起方案不进这里：侧栏顶部不放产品 logo，收起入口也不在侧栏，
  // 顶部就直接是各产品自己的第一件东西。
  return (
    usesToolbarHeaderLayout(version) ||
    usesSchemeFourLayout(version) ||
    usesSearchToolbarLayout(version)
  )
}

interface NavVersionState {
  version: NavVersion
  setVersion: (v: NavVersion) => void
}

export const useNavVersion = create<NavVersionState>()(
  persist(
    (set) => ({
      version: DEFAULT_NAV_VERSION,
      setVersion: (v) => set({ version: v }),
    }),
    {
      name: 'creator-center:nav-version',
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persistedState, persistedVersion) => {
        const state = persistedState as Partial<NavVersionState>
        // 提升存储版本时让线上旧偏好一次性跟进当前默认方案。
        if (persistedVersion < 5) {
          return { ...state, version: DEFAULT_NAV_VERSION } as NavVersionState
        }
        return state as NavVersionState
      },
    },
  ),
)
