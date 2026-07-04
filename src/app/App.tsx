import { Toaster } from 'sonner'
import CreatorCenterShell from '@/modules/creator-center/CreatorCenterShell'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

export default function App() {
  return (
    <>
      <ErrorBoundary>
        <CreatorCenterShell />
      </ErrorBoundary>
      <Toaster position="top-center" theme="dark" />
    </>
  )
}
