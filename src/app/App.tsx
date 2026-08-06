import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import CreatorCenterShell from '@/modules/creator-center/CreatorCenterShell'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

// 调试画布只在开发环境按需下载，避免它把各产品页面拉回生产入口包。
const SideNavLab = import.meta.env.DEV
  ? lazy(() => import('@/dev/SideNavLab'))
  : null

export default function App() {
  // 组件调试页 — 不进业务导航，直接访问 /sidebar
  if (window.location.pathname === '/sidebar' && SideNavLab) {
    return (
      <Suspense
        fallback={(
          <div className="flex h-dvh items-center justify-center bg-[#F5F6F8] text-sm text-[#252632]/65" role="status">
            调试画布加载中…
          </div>
        )}
      >
        <SideNavLab />
      </Suspense>
    )
  }
  return (
    <>
      <ErrorBoundary>
        <CreatorCenterShell />
      </ErrorBoundary>
      <Toaster position="top-center" theme="dark" />
    </>
  )
}
