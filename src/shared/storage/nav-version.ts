import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** 导航方案对比测试：
 *  1 = 全宽三段顶栏 + 透明侧栏，共享浅灰蓝渐变底板；
 *  2 = 全宽顶栏 + icon/文字 tab + 产品侧栏上下文工具条；
 *  3 = 原始全宽顶栏；
 *  4 = 沿用方案 2，但顶部 tab 恢复 icon + 文字，产品侧栏头用「开启创作」；
 *  5 = 沿用方案 3，底部使用 icon-only 收起与项目设置入口；
 *  6 = 沿用方案 2，但各产品侧栏顶部统一为搜索工具栏（首页除外）。 */
export type NavVersion = 1 | 2 | 3 | 4 | 5 | 6

export function usesSchemeFourLayout(version: NavVersion) {
  return version === 4
}

export function usesSearchToolbarLayout(version: NavVersion) {
  return version === 6
}

export function usesProductHeaderLayout(version: NavVersion) {
  return (
    version === 2 ||
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
      version: 1,
      setVersion: (v) => set({ version: v }),
    }),
    {
      name: 'creator-center:nav-version',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, persistedVersion) => {
        const state = persistedState as Partial<NavVersionState>
        if (persistedVersion === 0) {
          return {
            ...state,
            version:
              state.version === 3
                ? 1
                : state.version === 1
                  ? 3
                  : state.version ?? 1,
          } as NavVersionState
        }
        return state as NavVersionState
      },
    },
  ),
)
