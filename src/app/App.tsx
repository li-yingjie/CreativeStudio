import { Toaster } from 'sonner'
import VibeCodingPage from '@/modules/vibecoding/components/VibeCodingPage'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

export default function App() {
  return (
    <>
      <ErrorBoundary>
        <VibeCodingPage />
      </ErrorBoundary>
      <Toaster position="top-center" theme="dark" />
    </>
  )
}
