import { useEffect, useRef } from 'react'

/** Call `onBack` when the user presses Escape twice within `windowMs`.
 *  Single Esc presses are ignored so inline editors / modals can still
 *  claim one Esc without losing the full exit gesture. */
export function useDoubleEscBack(onBack: () => void, windowMs = 500) {
  const backRef = useRef(onBack)
  backRef.current = onBack

  useEffect(() => {
    let lastAt = 0
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const now = Date.now()
      if (now - lastAt <= windowMs) {
        lastAt = 0
        backRef.current()
      } else {
        lastAt = now
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [windowMs])
}
