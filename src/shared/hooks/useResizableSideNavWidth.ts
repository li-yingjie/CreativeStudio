import { useCallback, useState } from 'react'
import {
  SIDE_NAV_NUMERIC_CONSTRAINTS,
  useSideNavConfig,
} from '@/shared/components/side-nav-config'

function clampWidth(width: number) {
  const { min, max } = SIDE_NAV_NUMERIC_CONSTRAINTS.width
  return Math.min(max, Math.max(min, width))
}

/** 页面内导航的临时拖拽宽度；全局规范宽度变化时同步回到新基准。 */
export function useResizableSideNavWidth() {
  const configuredWidth = useSideNavConfig((state) => state.config.width)
  const [widthState, setWidthState] = useState(() => ({
    configuredWidth,
    width: configuredWidth,
  }))

  if (widthState.configuredWidth !== configuredWidth) {
    setWidthState({ configuredWidth, width: configuredWidth })
  }

  const width =
    widthState.configuredWidth === configuredWidth
      ? widthState.width
      : configuredWidth
  const setWidth = useCallback(
    (nextWidth: number) => {
      setWidthState({
        configuredWidth,
        width: clampWidth(nextWidth),
      })
    },
    [configuredWidth],
  )

  return { width, setWidth }
}
