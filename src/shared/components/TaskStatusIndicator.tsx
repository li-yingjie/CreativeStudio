import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Loader2 } from '@/shared/icons'
import {
  workshopTaskStatusLabel,
  type WorkshopTaskStatus,
} from '@/shared/storage/workshop-task-status'

export default function TaskStatusIndicator({
  status,
  subject = '任务',
  decorative = false,
}: {
  status: WorkshopTaskStatus
  subject?: string
  decorative?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { margin: '48px' })
  const reduceMotion = useReducedMotion() ?? false
  const accessibilityProps = decorative
    ? { 'aria-hidden': true as const }
    : {
        role: 'status' as const,
        'aria-label': `${subject}${workshopTaskStatusLabel(status)}`,
        title: `${subject}${workshopTaskStatusLabel(status)}`,
      }

  if (status === 'running') {
    return (
      <span
        ref={ref}
        {...accessibilityProps}
        className="flex size-4 shrink-0 items-center justify-center text-[#5f6368]"
      >
        <motion.span
          animate={
            inView && !reduceMotion ? { rotate: 360 } : { rotate: 0 }
          }
          transition={
            inView && !reduceMotion
              ? { duration: 0.8, ease: 'linear', repeat: Infinity }
              : { duration: 0 }
          }
          className="flex size-3.5 items-center justify-center"
        >
          <Loader2 aria-hidden size={14} strokeWidth={2} />
        </motion.span>
      </span>
    )
  }

  if (status === 'waiting-confirmation') {
    return (
      <span
        ref={ref}
        {...accessibilityProps}
        className="flex size-4 shrink-0 items-center justify-center"
      >
        <span aria-hidden className="size-2 rounded-full bg-orange-500" />
      </span>
    )
  }

  return (
    <span
      ref={ref}
      {...accessibilityProps}
      className="flex size-4 shrink-0 items-center justify-center"
    >
      <span aria-hidden className="size-2 rounded-full bg-blue-500" />
    </span>
  )
}
