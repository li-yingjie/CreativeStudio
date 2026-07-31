import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import SideNavPanelStateIcon from '@/shared/components/SideNavPanelStateIcon'
import { useSideNavConfig } from '@/shared/components/side-nav-config'
import { useNavVersion } from '@/shared/storage/nav-version'
import { useProductSideNav } from '@/shared/storage/product-side-nav'
import CreatorCenterHome from './CreatorCenterHome'
import TopNav from './TopNav'
import type { ProductId } from './data'

/** 顶栏高度：AI 工坊里的 fixed 元素通过 --cc-top 让位给顶栏。 */
const NAV_H = '48px'
/** Figma 425:30414 的根画布底板；顶栏和侧栏本身均为透明。 */
const L_SHAPED_BACKGROUND =
  'linear-gradient(170deg, #F8F8F9 4.37%, #F1F3F8 100%)'
/** 取当前产品实际可见的侧栏宽度，让顶部品牌段跟随拖拽与收起。 */
function useActiveSideNavWidth(enabled: boolean, activeProduct: ProductId, fallback: number) {
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    if (!enabled) return
    const root = document.getElementById('root')
    if (!root) return

    let sawSideNav = false
    let observedElements = new Set<Element>()
    const resizeObserver = new ResizeObserver(() => measure())
    const syncObservedElements = (elements: Element[]) => {
      const nextElements = new Set(elements)
      for (const element of observedElements) {
        if (!nextElements.has(element)) resizeObserver.unobserve(element)
      }
      for (const element of nextElements) {
        if (!observedElements.has(element)) resizeObserver.observe(element)
      }
      observedElements = nextElements
    }
    const measure = () => {
      const surface = document.querySelector<HTMLElement>('[data-product-surface-active="true"]')
      if (!surface) {
        syncObservedElements([])
        setWidth(fallback)
        return
      }
      const sideNav = surface.querySelector<HTMLElement>('aside')
      if (!sideNav) {
        syncObservedElements([])
        setWidth(sawSideNav ? 0 : fallback)
        return
      }

      sawSideNav = true
      const measuredElements: Element[] = [sideNav]
      let visibleWidth = sideNav.getBoundingClientRect().width
      for (let parent = sideNav.parentElement; parent && parent !== surface; parent = parent.parentElement) {
        measuredElements.push(parent)
        const overflowX = window.getComputedStyle(parent).overflowX
        const collapsedMotionWrapper =
          parent.hasAttribute('data-side-nav-motion') &&
          parent.dataset.state === 'collapsed'
        if (overflowX === 'hidden' || overflowX === 'clip' || collapsedMotionWrapper) {
          visibleWidth = Math.min(visibleWidth, parent.getBoundingClientRect().width)
        }
      }
      syncObservedElements(measuredElements)
      const nextWidth = Math.max(0, Math.round(visibleWidth))
      setWidth((current) => (current === nextWidth ? current : nextWidth))
    }
    const mutationObserver = new MutationObserver(measure)
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-product-surface-active'],
    })
    measure()

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [activeProduct, enabled, fallback])

  return width
}

/** 方案 1 把品牌区放进全宽顶栏的左段，收起入口紧邻 logo。 */
function SideNavBrandHeader({
  width,
  collapsed,
  onHome,
  onToggle,
}: {
  width: number
  collapsed: boolean
  onHome: () => void
  onToggle: () => void
}) {
  return (
    <div
      className={`relative z-[70] flex h-12 shrink-0 items-center ${
        collapsed ? 'justify-center' : 'gap-6'
      }`}
      style={{ width }}
    >
      {width > 0 && (
        <>
          {!collapsed && (
            <button
              type="button"
              aria-label="返回创作者中心首页"
              onClick={onHome}
              className="flex h-6 w-[136px] shrink-0 items-center overflow-hidden"
            >
              <img src="/logo.png" alt="" className="h-[22px] max-w-full w-auto object-contain object-left" />
            </button>
          )}
          <button
            type="button"
            aria-label={collapsed ? '展开导航' : '收起导航'}
            title={collapsed ? '展开导航' : '收起导航'}
            onClick={onToggle}
            className="relative flex size-6 shrink-0 items-center justify-center rounded-md text-[#252632]/45 transition-colors before:absolute before:-inset-1 before:content-[''] hover:bg-black/[0.03] hover:text-[#252632]/70"
          >
            <SideNavPanelStateIcon collapsed={collapsed} />
          </button>
        </>
      )}
    </div>
  )
}

const VibeCodingPage = lazy(() => import('@/modules/vibecoding/components/VibeCodingPage'))
const WikiWorkspacePage = lazy(() => import('./WikiWorkspacePage'))
const SuibianPage = lazy(() => import('./SuibianPage'))

/** 产品层只交叉淡化透明度与位移，保留已挂载工坊的内部状态。 */
function ProductSurface({
  active,
  reduceMotion,
  children,
}: {
  active: boolean
  reduceMotion: boolean
  children: ReactNode
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={active ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
      aria-hidden={!active}
      inert={!active}
      data-product-surface-active={active}
      style={{ pointerEvents: active ? 'auto' : 'none', zIndex: active ? 10 : 0 }}
      className="absolute inset-0 min-h-0 overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

/** L 型导航内角：遮住内容左上角，让顶部与侧栏包住 20px 圆角内容面。 */
function LShapedContentCorner({ left }: { left: number }) {
  const offset = Math.max(0, left - 1)
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 z-20 h-5 w-[21px]"
      style={{
        left: offset,
        backgroundImage: 'var(--l-shaped-background-image)',
        backgroundPosition: `-${offset}px calc(0px - var(--cc-top, 48px))`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100vw 100dvh',
        clipPath: 'path("M0 0H21A20 20 0 0 0 1 20H0Z")',
      }}
    />
  )
}

/** 创作者中心外壳 — 顶部菜单切换各产品；AI 工坊是其中之一，
 *  首次进入后保持挂载，以产品层交叉淡化，切走再切回不丢工作状态。 */
export default function CreatorCenterShell() {
  const [active, setActive] = useState<ProductId>('home')
  const reduceMotion = useReducedMotion() ?? false
  const [workshopMounted, setWorkshopMounted] = useState(false)
  const [workshopCanvasMode, setWorkshopCanvasMode] = useState(false)
  const navVersion = useNavVersion((s) => s.version)
  const configuredSideNavWidth = useSideNavConfig((state) => state.config.width)
  const configuredCollapsedWidth = useSideNavConfig((state) => state.config.collapsedWidth)
  const activeSideNavCollapsed = useProductSideNav((state) => state.collapsed[active])
  const setProductSideNavCollapsed = useProductSideNav((state) => state.setCollapsed)
  const activeSideNavWidth = useActiveSideNavWidth(
    navVersion === 1,
    active,
    configuredSideNavWidth,
  )
  const brandHeaderWidth = activeSideNavCollapsed
    ? configuredCollapsedWidth
    : activeSideNavWidth || configuredSideNavWidth
  // AI 分身默认视为已开通（开通落地页暂时隐藏），进入即分身版工坊界面；
  // 与工坊同样首次进入后保持挂载，切走再切回不丢状态。
  const [avatarMounted, setAvatarMounted] = useState(false)
  const handleWorkshopCanvasModeChange = useCallback((open: boolean) => {
    setWorkshopCanvasMode(open)
  }, [])
  const selectProduct = (id: ProductId) => {
    if (id === 'workshop') setWorkshopMounted(true)
    if (id === 'ai-avatar') setAvatarMounted(true)
    setActive(id)
  }
  const workshopImmersive =
    active === 'workshop' && workshopCanvasMode

  return (
    <div
      data-nav-version={navVersion}
      className="flex h-dvh flex-col"
      style={{
        '--cc-top': workshopImmersive ? '0px' : NAV_H,
        '--l-shaped-background-image': L_SHAPED_BACKGROUND,
        backgroundImage: navVersion === 1 ? L_SHAPED_BACKGROUND : undefined,
      } as React.CSSProperties}
    >
      {!workshopImmersive && (
        navVersion === 1 ? (
          <TopNav
            active={active}
            onSelect={selectProduct}
            showLogo={false}
            fused
            leftSlot={(
              <SideNavBrandHeader
                width={brandHeaderWidth}
                collapsed={activeSideNavCollapsed}
                onHome={() => selectProduct('home')}
                onToggle={() => setProductSideNavCollapsed(active, !activeSideNavCollapsed)}
              />
            )}
          />
        ) : (
          <TopNav active={active} onSelect={selectProduct} />
        )
      )}
      {/* overflow-hidden：产品层的轻位移不外溢成文档滚动条（避免顶栏抖动）。 */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ProductSurface active={active === 'home'} reduceMotion={reduceMotion}>
          <CreatorCenterHome
            active={active === 'home'}
            onOpenProduct={selectProduct}
          />
        </ProductSurface>
        <Suspense
          fallback={(
            <div className="flex h-full items-center justify-center bg-[#F5F6F8] text-sm text-[#252632]/65" role="status">
              页面加载中…
            </div>
          )}
        >
          {active === 'wiki' && (
            <ProductSurface active reduceMotion={reduceMotion}>
              <WikiWorkspacePage />
            </ProductSurface>
          )}
          {active === 'suibian' && (
            <ProductSurface active reduceMotion={reduceMotion}>
              <SuibianPage />
            </ProductSurface>
          )}
        </Suspense>
        {avatarMounted && (
          <ProductSurface active={active === 'ai-avatar'} reduceMotion={reduceMotion}>
            <ErrorBoundary>
              <Suspense
                fallback={(
                  <div className="flex h-full items-center justify-center bg-[#F5F6F8] text-sm text-[#252632]/65" role="status">
                    AI 分身加载中…
                  </div>
                )}
              >
                <VibeCodingPage variant="avatar" />
              </Suspense>
            </ErrorBoundary>
          </ProductSurface>
        )}
        {workshopMounted && (
          <ProductSurface active={active === 'workshop'} reduceMotion={reduceMotion}>
            <ErrorBoundary>
              <Suspense
                fallback={(
                  <div className="flex h-full items-center justify-center bg-[#F5F6F8] text-sm text-[#252632]/65" role="status">
                    AI 工坊加载中…
                  </div>
                )}
              >
                <VibeCodingPage
                  onCanvasModeChange={handleWorkshopCanvasModeChange}
                />
              </Suspense>
            </ErrorBoundary>
          </ProductSurface>
        )}
        {navVersion === 1 && !workshopImmersive && (
          <LShapedContentCorner left={activeSideNavWidth} />
        )}
      </div>
    </div>
  )
}
