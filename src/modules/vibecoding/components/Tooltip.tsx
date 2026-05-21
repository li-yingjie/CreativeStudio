import type { ReactNode } from 'react'
import * as RT from '@radix-ui/react-tooltip'

/**
 * Black tooltip — replaces the browser-native `title=` attribute everywhere.
 * Portaled (never clipped), keyboard/touch aware, with a short open delay.
 * Usage: <Tooltip label="搜索"><button>…</button></Tooltip>
 */
export function Tooltip({
  label,
  children,
  side = 'top',
}: {
  label: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <RT.Provider delayDuration={200} skipDelayDuration={300}>
      <RT.Root>
        <RT.Trigger asChild>{children}</RT.Trigger>
        <RT.Portal>
          <RT.Content
            side={side}
            sideOffset={6}
            collisionPadding={8}
            className="z-[80] flex h-6 select-none items-center rounded-md bg-[#1c1f23] px-2.5 text-[12px] font-medium text-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.45)]"
          >
            {label}
            <RT.Arrow className="fill-[#1c1f23]" width={10} height={5} />
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  )
}
