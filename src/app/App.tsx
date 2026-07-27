import { Toaster } from 'sonner'
import CreatorCenterShell from '@/modules/creator-center/CreatorCenterShell'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import SideNavLab from '@/dev/SideNavLab'

export default function App() {
  // 组件调试页 — 不进业务导航，直接访问 /sidebar
  if (window.location.pathname === '/sidebar') {
    return <SideNavLab />
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
