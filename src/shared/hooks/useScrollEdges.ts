import { useEffect, useState, type RefObject } from 'react'

/** Reports whether a scroll container is flush against its top / bottom edge.
 *  Useful for hiding the fade mask on edges where no hidden content exists. */
export function useScrollEdges(
  ref: RefObject<HTMLElement | null>
): { atTop: boolean; atBottom: boolean } {
  const [edges, setEdges] = useState({ atTop: true, atBottom: true })

  useEffect(() => {
    let current: HTMLElement | null = null
    let detachCurrent = () => {}

    const bindCurrent = () => {
      const el = ref.current
      if (el === current) return
      detachCurrent()
      current = el
      if (!el) {
        detachCurrent = () => {}
        return
      }

      const update = () => {
        const atTop = el.scrollTop <= 1
        const atBottom =
          Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) <= 1
        setEdges((prev) =>
          prev.atTop === atTop && prev.atBottom === atBottom
            ? prev
            : { atTop, atBottom }
        )
      }
      update()
      el.addEventListener('scroll', update, { passive: true })
      const ro = new ResizeObserver(update)
      ro.observe(el)
      // scrollHeight can grow without the container itself resizing.
      const contentObserver = new MutationObserver(update)
      contentObserver.observe(el, { childList: true, subtree: true, characterData: true })
      detachCurrent = () => {
        el.removeEventListener('scroll', update)
        ro.disconnect()
        contentObserver.disconnect()
      }
    }

    bindCurrent()
    // A RefObject assignment does not trigger a render. Watching mount/unmount
    // mutations lets conditionally-rendered scroll containers bind when ready.
    const mountObserver = new MutationObserver(bindCurrent)
    mountObserver.observe(document.documentElement, { childList: true, subtree: true })
    return () => {
      mountObserver.disconnect()
      detachCurrent()
    }
  }, [ref])

  return edges
}

/** Pick the appropriate fade class based on scroll edges. */
export function fadeClassFromEdges({
  atTop,
  atBottom,
}: {
  atTop: boolean
  atBottom: boolean
}): string {
  if (atTop && atBottom) return ''
  if (atTop) return 'fade-bottom'
  if (atBottom) return 'fade-top'
  return 'fade-y'
}
