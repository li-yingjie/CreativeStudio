import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@/shared/icons'
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
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="publish-flow-title"
      aria-describedby="publish-flow-description"
      onCancel={(event) => {
        event.preventDefault()
        closeModal()
      }}
      onMouseDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const inside = event.clientX >= rect.left && event.clientX <= rect.right
          && event.clientY >= rect.top && event.clientY <= rect.bottom
        if (!inside) closeModal()
      }}
      className="fixed m-auto max-h-[calc(100dvh-32px)] w-[520px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl border border-[var(--divider)] bg-[var(--color-surface-1)] p-0 text-[var(--color-ink)] shadow-2xl backdrop:bg-black/55"
    >
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="publish-flow-title" className="text-balance text-[14px] font-semibold text-[var(--color-ink)]">发布 AI 分身</h2>
          <p id="publish-flow-description" className="text-pretty text-[11px] text-[var(--color-ink)]/60">
            选择场景，确认发布信息
          </p>
        </div>
        <button
          type="button"
          autoFocus
          onClick={closeModal}
          aria-label="关闭发布窗口"
          className="flex size-7 items-center justify-center rounded-full text-[var(--color-ink)]/60 hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]"
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
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
    </dialog>,
    document.body,
  )
}
