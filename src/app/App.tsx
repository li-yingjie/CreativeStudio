import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import CreatorCenterShell from '@/modules/creator-center/CreatorCenterShell'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

// 调试画布只在开发环境按需下载，避免它把各产品页面拉回生产入口包。
const SideNavLab = import.meta.env.DEV
  ? lazy(() => import('@/dev/SideNavLab'))
  : null

const YoungVoiceXhsRebuild = lazy(
  () => import('@/modules/vibecoding/components/YoungVoiceXhsRebuild'),
)

const YoungVoiceArchiveH5Claude = lazy(
  () => import('@/modules/vibecoding/components/YoungVoiceArchiveH5Claude'),
)

const YoungVoiceModuleLab = lazy(
  () => import('@/modules/vibecoding/components/YoungVoiceModuleLab'),
)

const WinterGatheringH5 = lazy(
  () => import('@/modules/vibecoding/components/WinterGatheringH5'),
)

export default function App() {
  if (window.location.pathname === '/h5-reference-lab') {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-[#0799ED]" />}>
        <WinterGatheringH5 />
      </Suspense>
    )
  }

  if (window.location.pathname === '/young-voice-archive') {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-[#123D78]" />}>
        <YoungVoiceXhsRebuild />
        <Toaster position="top-center" theme="dark" />
      </Suspense>
    )
  }

  // Claude 复刻版对照页 — 与 /young-voice-archive 并行，便于 benchmark 复刻效果比对
  if (window.location.pathname === '/young-voice-archive-claude') {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-[#123D78]" />}>
        <YoungVoiceArchiveH5Claude />
        <Toaster position="top-center" theme="dark" />
      </Suspense>
    )
  }

  if (window.location.pathname === '/young-voice-module-lab') {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-[#0B2266]" />}>
        <YoungVoiceModuleLab />
      </Suspense>
    )
  }

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
