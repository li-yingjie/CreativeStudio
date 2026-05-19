import { Toaster } from 'sonner'
import VibeCodingPage from '@/modules/vibecoding/components/VibeCodingPage'

export default function App() {
  return (
    <>
      <VibeCodingPage />
      <Toaster position="top-center" theme="dark" />
    </>
  )
}
