import { create } from 'zustand'

/** 「直播管理」是权限菜单，由顶栏头像里的开关控制是否在左侧栏出现。
 *  默认开启（与设计稿一致）；纯内存态，刷新还原。 */
interface LiveMgmtState {
  enabled: boolean
  toggle: () => void
}

export const useLiveMgmt = create<LiveMgmtState>((set) => ({
  enabled: true,
  toggle: () => set((s) => ({ enabled: !s.enabled })),
}))
