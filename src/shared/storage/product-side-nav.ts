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

export const useProductSideNav = create<ProductSideNavState>((set) => ({
  collapsed: DEFAULT_COLLAPSED,
  setCollapsed: (product, collapsed) =>
    set((state) => ({
      collapsed: { ...state.collapsed, [product]: collapsed },
    })),
  toggleCollapsed: (product) =>
    set((state) => ({
      collapsed: {
        ...state.collapsed,
        [product]: !state.collapsed[product],
      },
    })),
}))
