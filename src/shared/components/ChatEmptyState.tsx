import { motion } from 'framer-motion'
import { useThemeStore } from '@/shared/storage/theme'
import LogoIconSpinOnce from './LogoIconSpinOnce'

/** 聊天空态 — logo + 欢迎语 + 建议 chips。AI 工坊聊天栏与系统级
 *  AI 助手面板共用；文案可按宿主覆盖。`forceLight` 用于嵌在浅色
 *  子树（.light-scope）里的场景：跳过深色 halo 光晕。 */
export function ChatEmptyState({
  suggestions,
  onPick,
  title = '嗨，我是你的创作助手',
  subtitle = '你可以让我调整这个项目，下面这些你可以试试',
  forceLight = false,
}: {
  suggestions: string[]
  onPick: (text: string) => void
  title?: string
  subtitle?: string
  forceLight?: boolean
}) {
  const themeMode = useThemeStore((s) => s.mode)
  const isLight = forceLight || themeMode === 'light'
  const visibleSuggestions = suggestions.slice(0, 4)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-full flex-col items-center justify-center gap-8 px-3 text-center"
    >
      <div className="relative z-0 flex h-14 w-14 items-center justify-center">
        {/* Halo glow PNG behind the logo. Rendered only in dark mode —
             the light panel doesn't need it and the PNG's dark backdrop
             reads like an ink blot there. */}
        {!isLight && (
          <motion.img
            src="/bg/chat-empty-halo.png"
            alt=""
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[420px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          <LogoIconSpinOnce className="h-14 w-14 text-[var(--color-ink)]" />
        </motion.div>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <h2 className="text-[20px] font-medium leading-[24px] text-[var(--color-ink)]">
          {title}
        </h2>
        <p className="text-[14px] leading-[24px] text-[var(--color-ink)]/60">
          {subtitle}
        </p>
      </div>
      <div className="relative z-10 flex max-w-full flex-col items-center justify-center gap-2">
        {visibleSuggestions.map((s, i) => (
          <motion.button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
            whileHover={{ y: -1 }}
            className="max-w-full rounded-full bg-[var(--fill-subtle)] px-[15px] py-2 text-center text-[13px] leading-[18px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
