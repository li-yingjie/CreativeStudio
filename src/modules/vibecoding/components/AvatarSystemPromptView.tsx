import type { ReactNode } from 'react'
import {
  BookOpen,
  FolderCode,
  Plus,
  Trash2,
  Wrench,
  type LucideIcon,
} from '@/shared/icons'

type PromptCapabilityKind = 'skill' | 'knowledge' | 'tool'

export interface AvatarPromptCapability {
  id: string
  name: string
  kind: PromptCapabilityKind
  parentToolKind?: string
}

interface AvatarSystemPromptViewProps {
  avatarName: string
  prompt: string
  capabilities: AvatarPromptCapability[]
  editing?: boolean
  onPromptChange?: (next: string) => void
  onOpenCapability: (capability: AvatarPromptCapability) => void
}

const KIND_LABEL: Record<PromptCapabilityKind, string> = {
  skill: '技能',
  knowledge: '知识库',
  tool: '工具',
}

const TAG_KIND_MAP: Record<string, PromptCapabilityKind> = {
  技能: 'skill',
  知识库: 'knowledge',
  工具: 'tool',
}

const TAG_META: Record<
  PromptCapabilityKind,
  {
    icon: LucideIcon
    tagClass: string
    iconClass: string
    badgeClass: string
  }
> = {
  skill: {
    icon: FolderCode,
    tagClass:
      'border-sky-500/35 bg-sky-100 text-sky-950 hover:bg-sky-200',
    iconClass: 'text-sky-700',
    badgeClass: 'bg-sky-100 text-sky-950',
  },
  knowledge: {
    icon: BookOpen,
    tagClass:
      'border-emerald-500/35 bg-emerald-100 text-emerald-950 hover:bg-emerald-200',
    iconClass: 'text-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-950',
  },
  tool: {
    icon: Wrench,
    tagClass:
      'border-amber-500/40 bg-amber-100 text-amber-950 hover:bg-amber-200',
    iconClass: 'text-amber-700',
    badgeClass: 'bg-amber-100 text-amber-950',
  },
}

const CAPABILITY_DETAILS: Record<
  string,
  { summary: string; when: string; output: string }
> = {
  星座运势解读: {
    summary: '将星座性格、时间范围和关系对象组合成结构化解读。',
    when: '用户询问星座性格、近期运势、关系匹配或相处建议时调用。',
    output: '性格底色、当前状态、关系互动、行动建议。',
  },
  情感陪伴对话: {
    summary: '先接住情绪，再把关系里的需求、边界和误会拆开。',
    when: '用户表达失恋、暧昧焦虑、冷战、想复合或想放下时调用。',
    output: '情绪复述、关系判断、可执行的 2-3 个小动作。',
  },
  '12 星座性格库': {
    summary: '沉淀 12 星座的性格底色、亲密关系模式和表达习惯。',
    when: '需要解释某个星座为什么这样想、这样回避或这样靠近时引用。',
    output: '星座底层动机、常见关系模式、沟通提醒。',
  },
  情感关系知识库: {
    summary: '覆盖暧昧、冷战、复合、边界感和情绪价值等关系议题。',
    when: '用户的问题更像关系模式分析，而不是单纯星座运势时引用。',
    output: '关系状态判断、风险提示、边界建议。',
  },
  抖音星座内容数据: {
    summary: '沉淀星座情感内容在抖音里的高频话题和互动表达。',
    when: '需要把星座观点转成评论区、私信或短视频口播语言时引用。',
    output: '热点角度、评论话术、内容表达模板。',
  },
  抖音热点查询: {
    summary: '查询抖音近期星座、情感、评论区互动相关热点。',
    when: '用户询问近期热点、选题借势、粉丝互动话题时调用。',
    output: '可借势话题、内容角度、适合互动的表达。',
  },
  多模态内容分析: {
    summary: '分析图片、视频截图、评论截图或聊天记录中的情绪线索。',
    when: '用户上传截图、评论区片段或聊天记录，希望判断语气和关系状态时调用。',
    output: '文本/画面线索、情绪倾向、可回复方向。',
  },
}

export default function AvatarSystemPromptView({
  avatarName,
  prompt,
  capabilities,
  editing = false,
  onPromptChange,
  onOpenCapability,
}: AvatarSystemPromptViewProps) {
  const capabilityByKey = new Map(
    capabilities.map((cap) => [`${KIND_LABEL[cap.kind]}:${cap.name}`, cap]),
  )

  const renderInline = (text: string, keyPrefix: string) => {
    const parts: ReactNode[] = []
    const re = /\[\[(技能|知识库|工具):([^\]]+)\]\]/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = re.exec(text))) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      const label = match[1]
      const name = match[2]
      const kind = TAG_KIND_MAP[label]
      const cap = capabilityByKey.get(`${label}:${name}`) ?? {
        id: `${kind}-${name}`,
        name,
        kind,
      }
      parts.push(
        <CapabilityTag
          key={`${keyPrefix}-${match.index}-${name}`}
          capability={cap}
          onOpen={onOpenCapability}
        />,
      )
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }

  const lines = prompt.split('\n')

  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col px-10 py-9">
        <p className="text-[12px] font-medium uppercase text-[var(--color-ink)]/40">
          人设指令 · systemPrompt
        </p>
        <h1 className="mb-1 mt-1.5 text-balance text-[22px] font-semibold text-[var(--color-ink)]">
          {avatarName}
        </h1>
        <p className="mb-4 text-pretty text-[13px] text-[var(--color-ink)]/50">
          {editing
            ? '正在编辑人设指令。'
            : '这段指令定义分身的角色、风格、边界和能力调度策略。标签可查看能力摘要，并跳转到对应配置。'}
        </p>
        {editing ? (
          <BlockPromptEditor value={prompt} onChange={onPromptChange} />
        ) : (
          <div className="flex flex-col gap-1.5 border-t border-[var(--divider-soft)] pt-4 leading-[1.6]">
            {lines.map((line, index) => {
              const key = `line-${index}`
              if (!line.trim()) return <div key={key} className="h-0.5" />
              if (line.startsWith('## ')) {
                return (
                  <h3
                    key={key}
                    className="mt-2 text-balance text-[15px] font-semibold text-[var(--color-ink)]"
                  >
                    {renderInline(line.slice(3), key)}
                  </h3>
                )
              }
              if (line.startsWith('# ')) {
                return (
                  <h2
                    key={key}
                    className="mt-3 text-balance text-[18px] font-semibold text-[var(--color-ink)]"
                  >
                    {renderInline(line.slice(2), key)}
                  </h2>
                )
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={key} className="flex gap-2 text-pretty text-[14px] text-[var(--color-ink)]/82">
                    <span className="mt-[0.75em] size-1 shrink-0 rounded-full bg-[var(--color-ink)]/35" />
                    <p>{renderInline(line.slice(2), key)}</p>
                  </div>
                )
              }
              return (
                <p key={key} className="text-pretty text-[14px] text-[var(--color-ink)]/82">
                  {renderInline(line, key)}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function BlockPromptEditor({
  value,
  onChange,
}: {
  value: string
  onChange?: (next: string) => void
}) {
  const blocks = value.split('\n')
  const commit = (next: string[]) => onChange?.(next.join('\n'))
  const updateBlock = (index: number, nextValue: string) => {
    const next = [...blocks]
    next[index] = nextValue
    commit(next)
  }
  const insertBlock = (index: number) => {
    const next = [...blocks]
    next.splice(index + 1, 0, '')
    commit(next)
  }
  const deleteBlock = (index: number) => {
    if (blocks.length <= 1) return
    const next = blocks.filter((_, i) => i !== index)
    commit(next)
  }

  return (
    <div className="flex flex-col gap-1.5 border-t border-[var(--divider-soft)] pt-4">
      {blocks.map((block, index) => {
        const isHeading = block.startsWith('# ')
        const isSubheading = block.startsWith('## ')
        const isList = block.startsWith('- ')
        return (
          <div
            key={index}
            className="group relative flex items-start rounded-md transition-colors hover:bg-[var(--fill-subtle)]"
          >
            <div className="absolute -left-9 top-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                title="添加块"
                onClick={() => insertBlock(index)}
                className="grid size-4 place-items-center rounded text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75"
              >
                <Plus size={11} strokeWidth={2} />
              </button>
              <button
                type="button"
                title="删除块"
                onClick={() => deleteBlock(index)}
                className="grid size-4 place-items-center rounded text-[var(--color-ink)]/35 hover:bg-[#e5484d]/10 hover:text-[#e5484d]"
              >
                <Trash2 size={10} strokeWidth={2} />
              </button>
            </div>
            <textarea
              value={block}
              rows={Math.max(1, Math.ceil(block.length / 72))}
              onChange={(e) => updateBlock(index, e.target.value)}
              className={`min-h-[28px] flex-1 resize-none overflow-hidden rounded-md border border-transparent bg-transparent px-0 py-0 leading-7 text-[var(--color-ink)] outline-none transition-colors focus:border-transparent focus:bg-transparent ${
                isHeading
                  ? 'mt-3 text-[18px] font-semibold'
                  : isSubheading
                    ? 'mt-2 text-[15px] font-semibold'
                    : isList
                      ? 'text-[14px]'
                      : 'text-[14px]'
              }`}
            />
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => commit([...blocks, ''])}
        className="mt-1 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-[12px] text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75"
      >
        <Plus size={12} strokeWidth={2} />
        添加块
      </button>
    </div>
  )
}

function CapabilityTag({
  capability,
  onOpen,
}: {
  capability: AvatarPromptCapability
  onOpen: (capability: AvatarPromptCapability) => void
}) {
  const meta = TAG_META[capability.kind]
  const Icon = meta.icon
  const detail = CAPABILITY_DETAILS[capability.name] ?? {
    summary: `${KIND_LABEL[capability.kind]}配置项，可在右侧打开查看详细定义。`,
    when: '当人设指令命中对应业务场景时使用。',
    output: '返回该能力沉淀的结构化信息。',
  }

  return (
    <span className="group relative inline-flex align-baseline">
      <button
        type="button"
        onClick={() => onOpen(capability)}
        className={`mx-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]/35 ${meta.tagClass}`}
      >
        <Icon size={12} strokeWidth={1.9} className={`shrink-0 ${meta.iconClass}`} />
        {KIND_LABEL[capability.kind]} · {capability.name}
      </button>
      <button
        type="button"
        onClick={() => onOpen(capability)}
        className="absolute left-0 top-full z-50 mt-2 hidden w-72 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] p-3 text-left shadow-lg transition-colors hover:bg-[var(--color-surface-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]/35 group-hover:block group-focus-within:block"
      >
        <span className="mb-2 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5">
            <Icon size={14} strokeWidth={1.9} className={`shrink-0 ${meta.iconClass}`} />
            <span className="min-w-0 truncate text-[13px] font-semibold text-[var(--color-ink)]">
              {capability.name}
            </span>
          </span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${meta.badgeClass}`}>
            {capability.parentToolKind ?? KIND_LABEL[capability.kind]}
          </span>
        </span>
        <span className="block text-pretty text-[12px] leading-5 text-[var(--color-ink)]/70">
          {detail.summary}
        </span>
        <span className="mt-2 block text-[11px] font-medium text-[var(--color-ink)]/45">
          调用时机
        </span>
        <span className="block text-pretty text-[12px] leading-5 text-[var(--color-ink)]/70">
          {detail.when}
        </span>
        <span className="mt-2 block text-[11px] font-medium text-[var(--color-ink)]/45">
          典型输出
        </span>
        <span className="block text-pretty text-[12px] leading-5 text-[var(--color-ink)]/70">
          {detail.output}
        </span>
      </button>
    </span>
  )
}
