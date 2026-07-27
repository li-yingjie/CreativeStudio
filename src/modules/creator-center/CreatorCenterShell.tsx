import { lazy, Suspense, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import CreatorCenterHome from './CreatorCenterHome'
import TopNav from './TopNav'
import type { ProductId } from './data'

/** 顶栏高度：AI 工坊里的 fixed 元素通过 --cc-top 让位给顶栏。 */
const NAV_H = '48px'
const AVATAR_OPENED_STORAGE_KEY = 'creator-center:ai-avatar-opened'

const VibeCodingPage = lazy(() => import('@/modules/vibecoding/components/VibeCodingPage'))
const AvatarLandingPage = lazy(() => import('./AvatarLandingPage'))
const WikiHomePage = lazy(() => import('./WikiHomePage'))
const WikiEditorPage = lazy(() => import('./WikiEditorPage'))
const SuibianPage = lazy(() => import('./SuibianPage'))

function readAvatarOpened() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(AVATAR_OPENED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function rememberAvatarOpened() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AVATAR_OPENED_STORAGE_KEY, '1')
  } catch {
    // 存储不可用时仍保留本次会话里的开通状态。
  }
}

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
      style={{ pointerEvents: active ? 'auto' : 'none', zIndex: active ? 10 : 0 }}
      className="absolute inset-0 min-h-0 overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

/** 创作者中心外壳 — 顶部菜单切换各产品；AI 工坊是其中之一，
 *  首次进入后保持挂载，以产品层交叉淡化，切走再切回不丢工作状态。 */
export default function CreatorCenterShell() {
  const [active, setActive] = useState<ProductId>('home')
  const reduceMotion = useReducedMotion() ?? false
  const [workshopMounted, setWorkshopMounted] = useState(false)
  // AI 分身开通后（落地页点「去开通」），该 Tab 换成分身版工坊界面；
  // 与工坊同样保持挂载，切走再切回不丢状态。
  const [avatarOpened, setAvatarOpened] = useState(readAvatarOpened)
  // 百科：首页 ↔ 世界书编辑页（创建世界书 / 点开某本世界书进入）
  const [wikiEditing, setWikiEditing] = useState(false)
  const activateAvatar = () => {
    rememberAvatarOpened()
    setAvatarOpened(true)
  }
  const selectProduct = (id: ProductId) => {
    if (id === 'workshop') setWorkshopMounted(true)
    setActive(id)
  }

  return (
    <div className="flex h-dvh flex-col" style={{ '--cc-top': NAV_H } as React.CSSProperties}>
      <TopNav active={active} onSelect={selectProduct} />
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
          {active === 'ai-avatar' && !avatarOpened && (
            <ProductSurface active reduceMotion={reduceMotion}>
              <AvatarLandingPage onActivate={activateAvatar} />
            </ProductSurface>
          )}
          {active === 'wiki' && (
            <ProductSurface active reduceMotion={reduceMotion}>
              {wikiEditing ? (
                <WikiEditorPage onBackHome={() => setWikiEditing(false)} />
              ) : (
                <WikiHomePage onCreateWorld={() => setWikiEditing(true)} />
              )}
            </ProductSurface>
          )}
          {active === 'suibian' && (
            <ProductSurface active reduceMotion={reduceMotion}>
              <SuibianPage />
            </ProductSurface>
          )}
        </Suspense>
        {avatarOpened && (
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
                <VibeCodingPage />
              </Suspense>
            </ErrorBoundary>
          </ProductSurface>
        )}
      </div>
    </div>
  )
}
