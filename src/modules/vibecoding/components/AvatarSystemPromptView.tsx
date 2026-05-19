import MarkdownView from './MarkdownView'

/**
 * 人设指令预览 — a Notion-style document view of an AI 分身's
 * `systemPrompt`. The prompt is markdown-structured free text (# headings
 * + bullet lists); rendered read-only in a clean centered column. Opened
 * as a right-side tab from the product view's 人设指令 entry.
 */
interface AvatarSystemPromptViewProps {
  avatarName: string
  prompt: string
}

export default function AvatarSystemPromptView({
  avatarName,
  prompt,
}: AvatarSystemPromptViewProps) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[680px] flex-col px-10 py-9">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink)]/40">
          人设指令 · systemPrompt
        </p>
        <h1 className="mb-1 mt-1.5 text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
          {avatarName}
        </h1>
        <p className="mb-6 text-[13px] text-[var(--color-ink)]/50">
          这段指令定义分身的角色、风格与边界，决定它如何与用户对话。
        </p>
        <div className="border-t border-[var(--divider-soft)] pt-6 leading-[1.75]">
          <MarkdownView source={prompt} />
        </div>
      </div>
    </div>
  )
}
