import { useState } from 'react'
import VibeCodingPage from '@/modules/vibecoding/components/VibeCodingPage'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import AvatarLandingPage from './AvatarLandingPage'
import CreatorCenterHome from './CreatorCenterHome'
import PlaceholderPage from './PlaceholderPage'
import TopNav from './TopNav'
import type { ProductId } from './data'

/** 顶栏高度：AI 工坊里的 fixed 元素通过 --cc-top 让位给顶栏。 */
const NAV_H = '48px'

/** 创作者中心外壳 — 顶部菜单切换各产品；AI 工坊是其中之一，
 *  首次进入后保持挂载（display 切换），切走再切回不丢工作状态。 */
export default function CreatorCenterShell() {
  const [active, setActive] = useState<ProductId>('home')
  // 首次进入 AI 工坊后置真且不再回落（渲染期派生，避免 effect setState）
  const [workshopMounted, setWorkshopMounted] = useState(false)
  if (active === 'workshop' && !workshopMounted) setWorkshopMounted(true)

  return (
    <div className="flex h-dvh flex-col" style={{ '--cc-top': NAV_H } as React.CSSProperties}>
      <TopNav active={active} onSelect={setActive} />
      {/* overflow-hidden：内容动画的瞬时下移不外溢成文档滚动条（避免顶栏抖动）。
          框架层（外壳/侧栏）不做载入动画，只有各页内容区自己淡入。 */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {active === 'home' && <CreatorCenterHome onOpenProduct={setActive} />}
        {active === 'ai-avatar' && <AvatarLandingPage />}
        {(active === 'wiki' || active === 'suibian') && (
          <PlaceholderPage product={active} onBackHome={() => setActive('home')} />
        )}
        {workshopMounted && (
          <div style={{ display: active === 'workshop' ? undefined : 'none' }}>
            <ErrorBoundary>
              <VibeCodingPage />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  )
}
