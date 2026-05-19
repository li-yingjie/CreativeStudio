import { createRoot } from 'react-dom/client'
import App from './app/App'
import './index.css'
// Side-effect import — eagerly applies the persisted theme class to <html>
// before React mounts.
import '@/shared/storage/theme'

createRoot(document.getElementById('root')!).render(<App />)
