import { create } from 'zustand'

/** 「直播管理」是权限菜单，由顶栏头像里的开关控制是否在左侧栏出现。
 *  默认隐藏（可从头像菜单开启）；纯内存态，刷新还原。 */
interface LiveMgmtState {
  enabled: boolean
  toggle: () => void
}

export const useLiveMgmt = create<LiveMgmtState>((set) => ({
  enabled: false,
  toggle: () => set((s) => ({ enabled: !s.enabled })),
}))
