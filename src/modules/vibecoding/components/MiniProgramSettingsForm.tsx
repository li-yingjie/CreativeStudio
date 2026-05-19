import { useState } from 'react'
import type { MiniProgramConfig } from './MiniProgramConfigData'

/**
 * 小程序设置 — `project.config.json` rendered as a minimal form.
 * Opened as a right-side tab from the product view's 小程序设置 entry.
 * Prototype: edits live in local state only.
 */
interface MiniProgramSettingsFormProps {
  config: MiniProgramConfig
}

export default function MiniProgramSettingsForm({
  config,
}: MiniProgramSettingsFormProps) {
  const [name, setName] = useState(config.name)
  const [description, setDescription] = useState(config.description)

  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-7 px-8 py-8">
        <header>
          <h1 className="text-[18px] font-semibold text-[var(--color-ink)]">
            小程序设置
          </h1>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink)]/55">
            来自 <code className="rounded bg-[var(--fill-subtle)] px-1 py-0.5 text-[12px]">project.config.json</code>，只保留最关键的几项。
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[var(--color-ink)]/55">
            小程序名称
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="小程序名称"
            className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[13px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[var(--color-ink)]/55">
            简介
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="一句话介绍这个小程序"
            className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[var(--color-ink)]/55">
            系统标识
          </span>
          <div className="flex items-center justify-between rounded-lg bg-[var(--fill-subtle)] px-3 py-2 text-[13px]">
            <span className="text-[var(--color-ink)]/50">AppID</span>
            <span className="font-medium text-[var(--color-ink)]/80">
              {config.appID}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
