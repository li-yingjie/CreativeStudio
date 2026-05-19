import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('theme-light', mode === 'light')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (m) => {
        applyThemeClass(m)
        set({ mode: m })
      },
      toggle: () => {
        const next = get().mode === 'dark' ? 'light' : 'dark'
        applyThemeClass(next)
        set({ mode: next })
      },
    }),
    {
      name: 'ip-editor:theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.mode)
      },
    },
  ),
)

// Eager-apply on module load so the `<html>` class is present before React
// renders — prevents a flash of dark content when the persisted mode is
// `light`.
if (typeof window !== 'undefined') {
  let mode: ThemeMode = 'light'
  try {
    const raw = localStorage.getItem('ip-editor:theme')
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { mode?: ThemeMode } }
      const stored = parsed?.state?.mode
      if (stored === 'light' || stored === 'dark') mode = stored
    }
  } catch {
    /* ignore storage read failures */
  }
  applyThemeClass(mode)
}
