import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Monitor, ChevronRight } from '@/shared/icons'
import OpsDataDashboard from './OpsDataContent'

/**
 * 运营数据抽屉 — 「发布」按钮左侧入口点开后从右侧滑出。内容复用
 * OpsDataDashboard（与「运营数据」菜单页同款）。头部带「查看完整数据」
 * 跳转入口，跳到运营数据菜单看更详细的数据。
 */
export default function OpsDataDrawer({
  open,
  onClose,
  projectName,
  onViewMore,
}: {
  open: boolean
  onClose: () => void
  projectName: string
  /** Jump to the full 运营数据 menu page. */
  onViewMore?: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[290] bg-black/20"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[300] flex w-[680px] max-w-[96vw] flex-col border-l border-[var(--divider)] bg-[var(--color-surface-1)] shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.25)]"
          >
            {/* Title row */}
            <header className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
              <Monitor size={15} strokeWidth={1.9} className="text-[var(--color-ink)]/70" />
              <span className="text-[14px] font-semibold text-[var(--color-ink)]">运营数据</span>
              {onViewMore && (
                <button
                  type="button"
                  onClick={onViewMore}
                  className="ml-auto flex items-center gap-0.5 rounded-md px-2 py-1 text-[12px] text-[#3478ff] transition-colors hover:bg-[#3478ff]/[0.08]"
                >
                  查看完整数据
                  <ChevronRight size={13} strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink)]/55 hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)] ${onViewMore ? '' : 'ml-auto'}`}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </header>

            <OpsDataDashboard projectName={projectName} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
