import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { usePersonaStore } from '../../store/persona-store'
import { usePublishFlowStore } from '../../store/publish-flow-store'
import PublishForm from './PublishForm'

/** Centered overlay version of the publish flow — used when the user
 *  triggers the flow from the editor's top-right 发布/更新 button. */
export default function PublishFlowModal() {
  const step = usePublishFlowStore((s) => s.step)
  const mode = usePublishFlowStore((s) => s.mode)
  const scenes = usePublishFlowStore((s) => s.scenes)
  const toggleScene = usePublishFlowStore((s) => s.toggleScene)
  const submit = usePublishFlowStore((s) => s.submit)
  const confirm = usePublishFlowStore((s) => s.confirm)
  const closeModal = usePublishFlowStore((s) => s.closeModal)
  const personaName = usePersonaStore((s) => s.name)
  const personaPortrait = usePersonaStore((s) => s.portraitUrl)

  const open = mode === 'modal' && step !== 'idle'

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeModal])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={closeModal}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[520px] max-w-[92vw] overflow-hidden rounded-2xl border border-[var(--divider)] bg-[var(--color-surface-1)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-[var(--color-ink)]">发布 AI 分身</span>
                <span className="text-[11px] text-[var(--color-ink)]/50">
                  选择场景，确认发布信息
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="关闭"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink)]/60 hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="px-5 pb-5">
              <PublishForm
                step={step as 'select' | 'review' | 'confirmed'}
                scenes={scenes}
                personaName={personaName}
                personaPortrait={personaPortrait}
                onToggle={toggleScene}
                onSubmit={submit}
                onConfirm={confirm}
                variant="modal"
              />
              {step === 'confirmed' && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 w-full rounded-md bg-[var(--color-ink)] px-3 py-2 text-[12px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
                >
                  完成
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
