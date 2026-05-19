import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * User-side echo bubble — used to replay structured form / selection
 * results back into the conversation as if the user "said" them. Keeps
 * the chat scannable: everything the user committed is visible inline,
 * not hidden inside collapsed forms.
 */

interface EchoField {
  label: string
  value: ReactNode
}

interface UserEchoBubbleProps {
  /** Lead-in line (rendered as the bubble's title). */
  title: string
  /** Optional structured fields rendered as a key→value list below the
   *  title. Long values wrap; short values can stay inline. */
  fields?: EchoField[]
  /** Optional free-form footer (e.g. "其余字段已存档"). */
  footer?: ReactNode
}

export default function UserEchoBubble({
  title,
  fields,
  footer,
}: UserEchoBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-end"
    >
      <div className="flex max-w-[85%] flex-col gap-2 rounded-[10px] rounded-br-none bg-[var(--bubble-me-bg)] px-3 py-2.5 text-[13.5px] leading-[1.55] text-[var(--color-ink)]">
        <span className="font-medium">{title}</span>
        {fields && fields.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-[var(--color-ink)]/10 pt-2 text-[12.5px]">
            {fields.map((f) => (
              <div
                key={f.label}
                className="flex items-baseline gap-2"
              >
                <span className="shrink-0 text-[var(--color-ink)]/55">
                  {f.label}
                </span>
                <span className="min-w-0 flex-1 break-words text-[var(--color-ink)]">
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {footer && (
          <div className="text-[11.5px] text-[var(--color-ink)]/55">{footer}</div>
        )}
      </div>
    </motion.div>
  )
}

/** Truncate long string with ellipsis at the given character length. */
export function truncate(s: string, max = 56): string {
  if (s.length <= max) return s
  return s.slice(0, max) + '…'
}
