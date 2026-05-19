import { useState } from 'react'
import type { AvatarAppConfig } from './AvatarConfigData'

/**
 * 基础信息表单 — the generated config form for an AI 分身.
 *
 * Renders the avatar's app config as a friendly editable form (name /
 * description / icon) instead of raw JSON, plus read-only system fields
 * (model / space / appID). Opened as a right-side tab from the product
 * view's 基础信息 entry. Prototype: edits live in local state only.
 */
interface AvatarBasicInfoFormProps {
  config: AvatarAppConfig
}

export default function AvatarBasicInfoForm({ config }: AvatarBasicInfoFormProps) {
  const [name, setName] = useState(config.name)
  const [description, setDescription] = useState(config.description)
  const [iconURL, setIconURL] = useState(config.iconURL)

  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-7 px-8 py-8">
        <header>
          <h1 className="text-[18px] font-semibold text-[var(--color-ink)]">基础信息</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink)]/55">
            配置 AI 分身的名称、描述与头像。模型与系统标识由平台分配。
          </p>
        </header>

        {/* 头像 */}
        <Section title="头像">
          <div className="flex items-center gap-4">
            <img
              src={iconURL}
              alt=""
              className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-[var(--divider)]"
            />
            <input
              value={iconURL}
              onChange={(e) => setIconURL(e.target.value)}
              placeholder="图片地址"
              className="min-w-0 flex-1 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[13px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
            />
          </div>
        </Section>

        {/* 名称 */}
        <Section title="名称">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="给你的 AI 分身起个名字"
            className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[13px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
          />
        </Section>

        {/* 描述 */}
        <Section title="描述">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="一句话介绍这个分身是做什么的"
            className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
          />
        </Section>

        {/* 模型 */}
        <Section title="模型">
          <InfoRow label="模型" value={config.modelInfo.modelName} />
        </Section>

        {/* 系统标识 — 只读 */}
        <Section title="系统标识">
          <div className="flex flex-col gap-px overflow-hidden rounded-lg border border-[var(--divider)]">
            <InfoRow label="空间" value={config.space} flush />
            <InfoRow label="应用 ID" value={config.appID} flush />
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-[var(--color-ink)]/55">{title}</span>
      {children}
    </section>
  )
}

/** Read-only label/value row. `flush` drops the standalone border so the
 *  row can stack inside a shared bordered container. */
function InfoRow({
  label,
  value,
  flush,
}: {
  label: string
  value: string
  flush?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between bg-[var(--fill-subtle)] px-3 py-2 text-[13px] ${
        flush ? '' : 'rounded-lg'
      }`}
    >
      <span className="text-[var(--color-ink)]/50">{label}</span>
      <span className="font-medium text-[var(--color-ink)]/80">{value}</span>
    </div>
  )
}
