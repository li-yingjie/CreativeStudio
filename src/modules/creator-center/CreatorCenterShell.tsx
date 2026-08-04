import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { SIDE_NAV_MOTION_DURATION } from '@/shared/components/SideNav'
import SideNavPanelStateIcon from '@/shared/components/SideNavPanelStateIcon'
import { useSideNavConfig } from '@/shared/components/side-nav-config'
import {
  useNavVersion,
  usesStandaloneWorkshopLayout,
  usesContentToggleLayout,
} from '@/shared/storage/nav-version'
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

/** 方案 1 把品牌区放进全宽顶栏的左段；展开态用完整品牌，
 *  收起态用纯图形，hover / focus 时原位切换为展开入口。 */
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
  const reduceMotion = useReducedMotion() ?? false
  const transition = {
    duration: reduceMotion ? 0 : SIDE_NAV_MOTION_DURATION,
    ease: 'easeOut' as const,
  }

  return (
    <div
      className="relative z-[70] h-12 shrink-0"
      style={{ width }}
    >
      {width > 0 && (
        <>
          {/* 纯 logo 常驻：收展两态同位同图，既不换位置也不参与淡化。
              旧写法是两层交叉淡化 + 收起层在展开宽度里重新居中 —— 展开时
              这枚 logo 会先往右窜 80px 再淡出，中途两层各 50% 还会发灰。
              「带文字」字标里的音符路径与纯 logo 完全同坐标同尺寸，所以
              字标淡入盖上来时，音符那块像素前后是同一个颜色，不会闪。 */}
          <button
            type="button"
            aria-label="展开导航"
            title="展开导航"
            onClick={onToggle}
            aria-hidden={!collapsed}
            inert={!collapsed}
            className={`group absolute inset-y-0 left-0 -ml-0.5 my-auto flex size-8 items-center justify-center rounded-md text-[#565A60] transition-colors duration-150 hover:bg-black/[0.03] hover:text-[#161823] focus-visible:bg-black/[0.03] motion-reduce:transition-none ${
              collapsed ? '' : 'pointer-events-none'
            }`}
          >
            <img
              src="/纯 logo.svg"
              alt=""
              aria-hidden
              className={`h-[22px] w-auto shrink-0 transition-opacity duration-150 motion-reduce:transition-none ${
                collapsed
                  ? 'group-hover:opacity-0 group-focus-visible:opacity-0'
                  : ''
              }`}
            />
            {collapsed && (
              <SideNavPanelStateIcon
                collapsed
                className="absolute size-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              />
            )}
          </button>
          {/* 展开态字标 + 收起按钮：单向淡化盖在常驻 logo 之上 */}
          <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={transition}
            aria-hidden={collapsed}
            inert={collapsed}
            style={{ pointerEvents: collapsed ? 'none' : 'auto' }}
            className="absolute inset-0 flex items-center gap-6"
          >
            <button
              type="button"
              aria-label="返回创作者中心首页"
              onClick={onHome}
              className="flex h-6 min-w-0 flex-1 items-center overflow-hidden pl-[4.4px]"
            >
              <img
                src="/带文字.svg"
                alt=""
                className="h-[22px] max-w-full w-auto object-contain object-left"
              />
            </button>
            <button
              type="button"
              aria-label="收起导航"
              title="收起导航"
              onClick={onToggle}
              className="relative mr-8 flex size-6 shrink-0 items-center justify-center rounded-md text-[#565A60] transition-colors before:absolute before:-inset-1 before:content-[''] hover:bg-black/[0.03] hover:text-[#161823]"
            >
              <SideNavPanelStateIcon />
            </button>
          </motion.div>
        </>
      )}
    </div>
  )
}

const VibeCodingPage = lazy(() => import('@/modules/vibecoding/components/VibeCodingPage'))
const WikiWorkspacePage = lazy(() => import('./WikiWorkspacePage'))
const SuibianPage = lazy(() => import('./SuibianPage'))

/** 产品层只交叉淡化透明度，保留已挂载工坊的内部状态。 */
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
  const navVersion = useNavVersion((s) => s.version)
  const standaloneWorkshop = usesStandaloneWorkshopLayout(navVersion)
  const [active, setActive] = useState<ProductId>(() =>
    standaloneWorkshop ? 'workshop' : 'home',
  )
  const reduceMotion = useReducedMotion() ?? false
  const [workshopMounted, setWorkshopMounted] = useState(standaloneWorkshop)
  const [workshopCanvasMode, setWorkshopCanvasMode] = useState(false)
  const configuredSideNavWidth = useSideNavConfig((state) => state.config.width)
  const configuredCollapsedWidth = useSideNavConfig((state) => state.config.collapsedWidth)
  const activeSideNavCollapsed = useProductSideNav(
    (state) => state.collapsed[active],
  )
  const setProductSideNavCollapsed = useProductSideNav((state) => state.setCollapsed)
  const activeSideNavWidth = useActiveSideNavWidth(
    navVersion === 1,
    active,
    configuredSideNavWidth,
  )
  const [expandedSideNavWidths, setExpandedSideNavWidths] =
    useState<Partial<Record<ProductId, number>>>({})
  useEffect(() => {
    if (activeSideNavCollapsed || activeSideNavWidth <= configuredCollapsedWidth) return
    const frame = requestAnimationFrame(() => {
      setExpandedSideNavWidths((current) =>
        current[active] === activeSideNavWidth
          ? current
          : { ...current, [active]: activeSideNavWidth },
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [active, activeSideNavCollapsed, activeSideNavWidth, configuredCollapsedWidth])
  const visualSideNavWidth = activeSideNavCollapsed
    ? configuredCollapsedWidth
    : activeSideNavWidth > configuredCollapsedWidth
      ? activeSideNavWidth
      : expandedSideNavWidths[active] ?? configuredSideNavWidth
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
  const topNavHidden = workshopImmersive || standaloneWorkshop
  const contentToggleLayout = usesContentToggleLayout(navVersion)

  useEffect(() => {
    if (!standaloneWorkshop) return
    const frame = requestAnimationFrame(() => {
      setWorkshopMounted(true)
      setActive('workshop')
    })
    return () => cancelAnimationFrame(frame)
  }, [standaloneWorkshop])

  return (
    <div
      data-nav-version={navVersion}
      className="flex h-dvh flex-col"
      style={{
        '--cc-top': topNavHidden ? '0px' : NAV_H,
        '--l-shaped-background-image': L_SHAPED_BACKGROUND,
        backgroundImage: navVersion === 1 ? L_SHAPED_BACKGROUND : undefined,
      } as React.CSSProperties}
    >
      {!topNavHidden && (
        navVersion === 1 ? (
          <TopNav
            active={active}
            onSelect={selectProduct}
            showLogo={false}
            fused
            leftSlot={(
              <SideNavBrandHeader
                width={visualSideNavWidth}
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
          <LShapedContentCorner left={visualSideNavWidth} />
        )}
        {/* ── 方案 8：收起/展开唯一入口，钉在内容区左上角 ──
             由外壳统一渲染而不是各产品各放一个，位置才能真的一致；
             首页按约定不提供收起。 */}
        {contentToggleLayout && active !== 'home' && (
          <motion.button
            type="button"
            initial={false}
            animate={{ left: visualSideNavWidth + 12 }}
            transition={{
              duration: reduceMotion ? 0 : SIDE_NAV_MOTION_DURATION,
              ease: 'easeOut',
            }}
            onClick={() =>
              setProductSideNavCollapsed(active, !activeSideNavCollapsed)
            }
            aria-label={activeSideNavCollapsed ? '展开导航' : '收起导航'}
            title={activeSideNavCollapsed ? '展开导航' : '收起导航'}
            /* size-6 + top-2：各产品 Header 统一 40 高，按钮在里面正好垂直居中 */
            className="absolute top-2 z-[60] flex size-6 items-center justify-center rounded-md text-[#565A60] transition-colors hover:bg-black/[0.05] hover:text-[#161823]"
          >
            <SideNavPanelStateIcon collapsed={activeSideNavCollapsed} />
          </motion.button>
        )}
      </div>
    </div>
  )
}
