import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronDown, ChevronUp, CircleHelp, Plus, X } from '@/shared/icons'
import { usePublishFlowStore } from '@/modules/editor/store/publish-flow-store'

/**
 * H5 活动发布 — right-side slide panel that opens when the publish flow
 * is kicked off for a marketing-h5 project. Holds the activity-binding
 * form fields (关联活动 / 活动时间 / 投放场景 / 关联盖亚项目 / 协作人).
 *
 * Form state lives locally — the demo doesn't persist publish data; the
 * panel just needs to look real so designers can iterate on the flow.
 */
export default function MarketingH5PublishPanel() {
  const step = usePublishFlowStore((s) => s.step)
  const mode = usePublishFlowStore((s) => s.mode)
  const closeModal = usePublishFlowStore((s) => s.closeModal)

  const open = mode === 'modal' && step !== 'idle'

  const [collapsed, setCollapsed] = useState(false)
  const [target, setTarget] = useState<'existing' | 'new'>('new')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeModal])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-y-0 right-0 z-[300] flex w-[380px] max-w-[92vw] flex-col border-l border-[var(--divider)] bg-[var(--color-surface-1)] shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.25)]"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--divider-soft)] px-4 py-3">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink)]"
            >
              {collapsed ? (
                <ChevronDown size={14} className="text-[var(--color-ink)]/60" strokeWidth={2.2} />
              ) : (
                <ChevronUp size={14} className="text-[var(--color-ink)]/60" strokeWidth={2.2} />
              )}
              当前页面待关联活动
            </button>
            <button
              type="button"
              onClick={closeModal}
              aria-label="关闭"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink)]/55 hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </header>

          {/* Body — scrollable form */}
          {!collapsed && (
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <Field label="关联活动">
                <div className="rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)]">
                  六一儿童节抽奖活动
                </div>
              </Field>

              <Field label="目标活动" className="mt-5">
                <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-md border border-[var(--divider)] bg-[var(--fill-subtle)] p-1">
                  <SegButton
                    active={target === 'existing'}
                    onClick={() => setTarget('existing')}
                  >
                    选择已有活动
                  </SegButton>
                  <SegButton
                    active={target === 'new'}
                    onClick={() => setTarget('new')}
                  >
                    新建活动
                  </SegButton>
                </div>
              </Field>

              <Field label="活动名称" required className="mt-5">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入"
                  className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
                />
              </Field>

              <Field label="活动时间" required hint className="mt-5">
                <div className="flex items-center gap-2 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px]">
                  <input
                    type="text"
                    placeholder="开始日期"
                    className="min-w-0 flex-1 bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35"
                  />
                  <span className="text-[var(--color-ink)]/35">~</span>
                  <input
                    type="text"
                    placeholder="结束日期"
                    className="min-w-0 flex-1 bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35"
                  />
                  <Calendar size={14} className="shrink-0 text-[var(--color-ink)]/45" strokeWidth={1.8} />
                </div>
              </Field>

              <Field label="活动投放端及场景" required hint className="mt-5">
                <div className="flex items-center gap-1.5 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2 py-1.5">
                  <ScopeChip label="抖音" tone="strong" />
                  <ScopeChip label="非直播场景" />
                  <ScopeChip label="直播场景" />
                  <ChevronDown size={14} className="ml-auto shrink-0 text-[var(--color-ink)]/45" strokeWidth={1.8} />
                </div>
                <button
                  type="button"
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#7c5cff]/40 bg-[#7c5cff]/[0.06] py-2 text-[13px] font-medium text-[#7c5cff] transition-colors hover:bg-[#7c5cff]/[0.1]"
                >
                  <Plus size={14} strokeWidth={2.2} />
                  添加
                </button>
              </Field>

              <Field label="关联盖亚项目" className="mt-5">
                <p className="mb-2 text-[12px] leading-[1.6] text-[var(--color-ink)]/55">
                  盖亚项目下通过审批的资源可作为抖音端活动奖励，创建活动后不支持修改关联项目。未立项可{' '}
                  <a className="text-[#3478ff] underline-offset-2 hover:underline" href="#">
                    前往盖亚立项
                  </a>
                </p>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-1.5 text-[13px] text-[var(--color-ink)]/75 transition-colors hover:border-[var(--color-ink)]/30 hover:text-[var(--color-ink)]"
                >
                  <Plus size={13} strokeWidth={2} className="text-[var(--color-ink)]/55" />
                  关联项目
                </button>
              </Field>

              <Field label="协作人" hint className="mt-5">
                <div className="flex items-center gap-2 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px]">
                  <input
                    type="text"
                    placeholder="搜索邮箱添加协作人"
                    className="min-w-0 flex-1 bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35"
                  />
                  <ChevronDown size={14} className="shrink-0 text-[var(--color-ink)]/45" strokeWidth={1.8} />
                </div>
              </Field>
            </div>
          )}

          {/* Footer — actions */}
          {!collapsed && (
            <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--divider-soft)] px-4 py-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md px-3 py-1.5 text-[12.5px] text-[var(--color-ink)]/70 hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md bg-[var(--color-ink)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
              >
                确认发布
              </button>
            </footer>
          )}
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function Field({
  label,
  required = false,
  hint = false,
  className = '',
  children,
}: {
  label: string
  required?: boolean
  hint?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center gap-1 text-[12.5px] font-medium text-[var(--color-ink)]/85">
        <span>{label}</span>
        {hint && <CircleHelp size={12} className="text-[var(--color-ink)]/40" strokeWidth={1.8} />}
        {required && <span className="text-[#ff4d4f]">*</span>}
      </div>
      {children}
    </div>
  )
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7 items-center justify-center rounded text-[12.5px] transition-colors ${
        active
          ? 'bg-[var(--color-surface-0)] font-medium text-[var(--color-ink)] shadow-sm'
          : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]'
      }`}
    >
      {children}
    </button>
  )
}

function ScopeChip({
  label,
  tone = 'soft',
}: {
  label: string
  tone?: 'soft' | 'strong'
}) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded px-2 text-[12px] ${
        tone === 'strong'
          ? 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/85'
          : 'border border-[var(--divider)] bg-[var(--color-surface-0)] text-[var(--color-ink)]/70'
      }`}
    >
      {label}
    </span>
  )
}
