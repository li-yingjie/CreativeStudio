import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** 导航方案对比测试：
 *  1 = 原始全宽顶栏；
 *  2 = 全宽顶栏 + icon/文字 tab + 产品侧栏上下文工具条；
 *  3 = 全宽三段顶栏 + 透明侧栏，共享浅灰蓝渐变底板；
 *  4 = 沿用方案 2，但顶部 tab 恢复 icon + 文字，产品侧栏头用「开启创作」；
 *  5 = 沿用方案 1，底部使用 icon-only 收起与项目设置入口；
 *  6 = 沿用方案 4，AI 分身产品侧栏头改为搜索框。 */
export type NavVersion = 1 | 2 | 3 | 4 | 5 | 6

export function usesSchemeFourLayout(version: NavVersion) {
  return version === 4 || version === 6
}

export function usesProductHeaderLayout(version: NavVersion) {
  return version === 2 || usesSchemeFourLayout(version)
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
    },
  ),
)
