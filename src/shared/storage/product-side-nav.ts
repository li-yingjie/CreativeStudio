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
  hoverExpandedProduct: ProductSideNavId | null
  setCollapsed: (product: ProductSideNavId, collapsed: boolean) => void
  toggleCollapsed: (product: ProductSideNavId) => void
  setHoverExpandedProduct: (product: ProductSideNavId | null) => void
}

export const useProductSideNav = create<ProductSideNavState>((set) => ({
  collapsed: DEFAULT_COLLAPSED,
  hoverExpandedProduct: null,
  setCollapsed: (product, collapsed) =>
    set((state) => ({
      collapsed: { ...state.collapsed, [product]: collapsed },
      hoverExpandedProduct:
        state.hoverExpandedProduct === product
          ? null
          : state.hoverExpandedProduct,
    })),
  toggleCollapsed: (product) =>
    set((state) => ({
      collapsed: {
        ...state.collapsed,
        [product]: !state.collapsed[product],
      },
      hoverExpandedProduct:
        state.hoverExpandedProduct === product
          ? null
          : state.hoverExpandedProduct,
    })),
  setHoverExpandedProduct: (product) => set({ hoverExpandedProduct: product }),
}))

/** L 型方案可临时 hover 展开，不改变用户保存的收起状态。 */
export function useEffectiveProductSideNavCollapsed(product: ProductSideNavId) {
  return useProductSideNav(
    (state) =>
      state.collapsed[product] && state.hoverExpandedProduct !== product,
  )
}
