import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/** Shared shell for in-chat collection forms — same outer fill, spacing,
 *  step-number badge, and primary button across flows (需求收集, 发布, 后续
 *  任何对话里嵌入式的表单). Extracted so style drift between forms can't
 *  creep back in. Content inside each step stays fully custom. */

export function ChatFormCard({
  children,
  delay = 0.95,
  className = '',
}: {
  children: ReactNode
  /** Framer-motion stagger offset — defaults align the form entrance
   *  with the assistant bubble that precedes it. */
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl bg-[var(--chat-form-bg)] p-3 space-y-5 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function ChatFormStep({
  number,
  title,
  optional,
  children,
}: {
  number: number | string
  title: ReactNode
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="text-[13px] font-medium text-[var(--color-ink)]/75">
        <span className="mr-1.5 inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-0)] px-1 align-middle text-[10px] font-medium text-[var(--color-ink)]/70">
          {number}
        </span>
        {title}
        {optional && (
          <span className="ml-1 text-[var(--color-ink)]/40">（可选）</span>
        )}
      </div>
      {children}
    </div>
  )
}

export function ChatFormSubmit({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 whitespace-nowrap rounded-lg bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-contrast)] shadow-[0_4px_12px_-4px_rgba(16,18,24,0.25)] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  )
}
