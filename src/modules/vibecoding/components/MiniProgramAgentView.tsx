import { Cpu } from '@/shared/icons'
import MarkdownView from './MarkdownView'
import type { MiniProgramConfig } from './MiniProgramConfigData'

/**
 * 智能体 — the mini-program's backing agent config: LLM + prompt.
 * Opened as a right-side tab from the product view's 智能体 entry.
 * Read-only preview; the prompt is markdown-structured free text.
 */
interface MiniProgramAgentViewProps {
  config: MiniProgramConfig
}

export default function MiniProgramAgentView({ config }: MiniProgramAgentViewProps) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[680px] flex-col px-10 py-9">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink)]/40">
          智能体配置
        </p>
        <h1 className="mb-1 mt-1.5 text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
          {config.name} · 智能体
        </h1>
        <p className="mb-6 text-[13px] text-[var(--color-ink)]/50">
          小程序背后的智能体——它的大模型与 Prompt 决定对话与生成的行为。
        </p>

        {/* 大模型 */}
        <div className="flex items-center gap-3 rounded-xl border border-[var(--divider)] bg-[var(--fill-subtle)] px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-0)] text-[var(--color-ink)]/70">
            <Cpu size={17} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] text-[var(--color-ink)]/45">大模型</div>
            <div className="text-[14px] font-medium text-[var(--color-ink)]">
              {config.agent.modelName}
            </div>
          </div>
          <code className="ml-auto shrink-0 rounded-md bg-[var(--color-surface-0)] px-2 py-1 text-[11px] text-[var(--color-ink)]/50">
            {config.agent.modelKey}
          </code>
        </div>

        {/* Prompt */}
        <div className="mt-7">
          <p className="mb-3 text-[12px] font-medium text-[var(--color-ink)]/55">
            Prompt
          </p>
          <div className="border-t border-[var(--divider-soft)] pt-5 leading-[1.75]">
            <MarkdownView source={config.agent.systemPrompt} />
          </div>
        </div>
      </div>
    </div>
  )
}
