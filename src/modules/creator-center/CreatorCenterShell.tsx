import { lazy, Suspense, useState } from 'react'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import CreatorCenterHome from './CreatorCenterHome'
import TopNav from './TopNav'
import type { ProductId } from './data'

/** 顶栏高度：AI 工坊里的 fixed 元素通过 --cc-top 让位给顶栏。 */
const NAV_H = '48px'

const VibeCodingPage = lazy(() => import('@/modules/vibecoding/components/VibeCodingPage'))
const AvatarLandingPage = lazy(() => import('./AvatarLandingPage'))
const PlaceholderPage = lazy(() => import('./PlaceholderPage'))

/** 创作者中心外壳 — 顶部菜单切换各产品；AI 工坊是其中之一，
 *  首次进入后保持挂载（display 切换），切走再切回不丢工作状态。 */
export default function CreatorCenterShell() {
  const [active, setActive] = useState<ProductId>('home')
  const [workshopMounted, setWorkshopMounted] = useState(false)
  // AI 分身开通后（落地页点「去开通」），该 Tab 换成分身版工坊界面；
  // 与工坊同样保持挂载，切走再切回不丢状态。
  const [avatarOpened, setAvatarOpened] = useState(false)
  const selectProduct = (id: ProductId) => {
    if (id === 'workshop') setWorkshopMounted(true)
    setActive(id)
  }

  return (
    <div className="flex h-dvh flex-col" style={{ '--cc-top': NAV_H } as React.CSSProperties}>
      <TopNav active={active} onSelect={selectProduct} />
      {/* overflow-hidden：内容动画的瞬时下移不外溢成文档滚动条（避免顶栏抖动）。
          框架层（外壳/侧栏）不做载入动画，只有各页内容区自己淡入。 */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {active === 'home' && <CreatorCenterHome onOpenProduct={selectProduct} />}
        <Suspense
          fallback={(
            <div className="flex h-full items-center justify-center bg-[#F5F6F8] text-sm text-[#252632]/65" role="status">
              页面加载中…
            </div>
          )}
        >
          {active === 'ai-avatar' && !avatarOpened && (
            <AvatarLandingPage onActivate={() => setAvatarOpened(true)} />
          )}
          {(active === 'wiki' || active === 'suibian') && (
            <PlaceholderPage product={active} onBackHome={() => setActive('home')} />
          )}
        </Suspense>
        {avatarOpened && (
          <div style={{ display: active === 'ai-avatar' ? undefined : 'none' }}>
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
          </div>
        )}
        {workshopMounted && (
          <div style={{ display: active === 'workshop' ? undefined : 'none' }}>
            <ErrorBoundary>
              <Suspense
                fallback={(
                  <div className="flex h-full items-center justify-center bg-[#F5F6F8] text-sm text-[#252632]/65" role="status">
                    AI 工坊加载中…
                  </div>
                )}
              >
                <VibeCodingPage />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  )
}
