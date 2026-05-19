import { useEffect, useRef } from 'react'
import { Pencil, Zap } from 'lucide-react'

interface TriggerConfig {
  id: string
  name: string
  event: {
    id: string
    label: string
    scene: string
    supportedApps: string[]
  }
  action: {
    executorApps: string[]
    executionScene: string
    description: string
  }
}

/**
 * 触发器详情 — structured config view rendered inside the right-side
 * preview tabs. Mirrors the Figma layout: editable title, 事件信息 /
 * 执行信息 section cards, a destructive 删除事件 button. Values render
 * as small rounded pills matching the chat-form option styling.
 */
export default function TriggerDetailView({
  trigger,
  editingName,
  onStartEditName,
  onStopEditName,
  onRename,
  onDelete,
}: {
  trigger: TriggerConfig
  editingName: boolean
  onStartEditName: () => void
  onStopEditName: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (editingName) inputRef.current?.focus()
  }, [editingName])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <div className="thin-scroll flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <SectionIcon />
            <span className="text-[13px] text-[var(--color-ink)]/55">
              触发器名称
            </span>
            {editingName ? (
              <input
                ref={inputRef}
                defaultValue={trigger.name}
                onBlur={(e) => {
                  onRename(trigger.id, e.target.value)
                  onStopEditName()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRename(trigger.id, e.currentTarget.value)
                    onStopEditName()
                  } else if (e.key === 'Escape') {
                    onStopEditName()
                  }
                }}
                className="ml-2 flex-1 rounded-md border border-[var(--divider)] bg-transparent px-2 py-1 text-[14px] font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
              />
            ) : (
              <button
                type="button"
                onClick={onStartEditName}
                className="ml-2 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[14px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-hover)]"
              >
                <Pencil
                  size={12}
                  strokeWidth={1.8}
                  className="text-[var(--color-ink)]/40"
                />
              </button>
            )}
          </div>
          <p className="pl-7 text-[14px] text-[var(--color-ink)]/85">
            {trigger.name}
          </p>

          {/* 事件信息 */}
          <Section title="事件信息">
            <FieldRow label="事件名称">
              <Pill>{trigger.event.label}</Pill>
            </FieldRow>
            <FieldRow label="事件场景">
              <Pill>{trigger.event.scene}</Pill>
            </FieldRow>
            <FieldRow label="支持应用">
              <div className="flex flex-wrap gap-1.5">
                {trigger.event.supportedApps.map((app) => (
                  <Pill key={app}>{app}</Pill>
                ))}
              </div>
            </FieldRow>
          </Section>

          {/* 执行信息 */}
          <Section title="执行信息">
            <FieldRow label="执行应用">
              <div className="flex flex-wrap items-center gap-1.5">
                {trigger.action.executorApps.map((app, i) => (
                  <span key={app} className="flex items-center gap-1.5">
                    {i === 0 ? (
                      <span className="text-[13px] text-[var(--color-ink)]/85">
                        {app}
                      </span>
                    ) : (
                      <Pill>{app}</Pill>
                    )}
                  </span>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="执行场景">
              <Pill>{trigger.action.executionScene}</Pill>
            </FieldRow>
            <FieldRow label="执行动作" align="start">
              <p className="text-[13px] leading-[1.6] text-[var(--color-ink)]/85">
                {trigger.action.description}
              </p>
            </FieldRow>
          </Section>

          {/* Delete button */}
          <div>
            <button
              type="button"
              onClick={() => onDelete(trigger.id)}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[#e5484d] transition-colors hover:bg-[#e5484d]/10"
            >
              删除事件
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--fill-subtle)] text-[var(--color-ink)]/55">
      <Zap size={11} strokeWidth={2} />
    </span>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SectionIcon />
        <h3 className="text-[13px] font-semibold text-[var(--color-ink)]/85">
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-2.5 rounded-xl bg-[var(--fill-subtle)] px-5 py-4">
        {children}
      </div>
    </div>
  )
}

function FieldRow({
  label,
  align = 'center',
  children,
}: {
  label: string
  align?: 'center' | 'start'
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex gap-6 text-[13px] ${
        align === 'start' ? 'items-start' : 'items-center'
      }`}
    >
      <span className="w-[72px] shrink-0 text-[var(--color-ink)]/45">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[var(--chat-form-option-bg)] px-2 py-0.5 text-[13px] text-[var(--color-ink)]">
      {children}
    </span>
  )
}
