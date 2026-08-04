import { create } from 'zustand'

export type ProductSideNavId =
  | 'home'
  | 'ai-avatar'
  | 'wiki'
  | 'suibian'
  | 'workshop'

const DEFAULT_COLLAPSED: Record<ProductSideNavId, boolean> = {
  home: false,
  'ai-avatar': false,
  wiki: false,
  suibian: false,
  workshop: false,
}

interface ProductSideNavState {
  collapsed: Record<ProductSideNavId, boolean>
  setCollapsed: (product: ProductSideNavId, collapsed: boolean) => void
  toggleCollapsed: (product: ProductSideNavId) => void
}

// 收起/展开是全局偏好:在任一页面操作后,所有页面同步同一状态。
const syncAll = (collapsed: boolean): Record<ProductSideNavId, boolean> => ({
  home: collapsed,
  'ai-avatar': collapsed,
  wiki: collapsed,
  suibian: collapsed,
  workshop: collapsed,
})

export const useProductSideNav = create<ProductSideNavState>((set) => ({
  collapsed: DEFAULT_COLLAPSED,
  setCollapsed: (_product, collapsed) => set(() => ({ collapsed: syncAll(collapsed) })),
  toggleCollapsed: (product) =>
    set((state) => ({ collapsed: syncAll(!state.collapsed[product]) })),
}))
