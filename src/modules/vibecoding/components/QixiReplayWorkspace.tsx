import { useEffect, useRef, useState } from 'react'
import MarkdownView from './MarkdownView'
import type { QixiReplayTarget } from './QixiGenerationReplayScript'

type DocumentId = 'source' | 'blueprint' | 'decisions'
type EditableDocumentId = Exclude<DocumentId, 'source'>
type DocumentMode = 'rendered' | 'markdown'

const DOCUMENTS: { id: DocumentId; label: string; meta: string }[] = [
  { id: 'source', label: '需求原文', meta: '只读' },
  { id: 'blueprint', label: '活动方案', meta: '持续更新' },
  { id: 'decisions', label: '确认结果', meta: '3 项' },
]

const QIXI_DOC_TAB_KEY = 'creative-studio.qixi-document-tab.v2'
const QIXI_DOC_CONTENT_KEY = 'creative-studio.qixi-document-content.v3'
const QIXI_CUSTOM_CONFIRMATIONS_KEY =
  'creative-studio.qixi-custom-confirmations.v1'

const SOURCE_MARKDOWN = `# 七夕「搭建鹊桥」互动活动需求

## 活动目标

用户通过找到场景中的喜鹊逐关搭成鹊桥，并在闯关、任务和奖励之间形成完整的参与循环。

## 用户参与方式

- 首次参与获得闯关机会。
- 每日签到获得 2 次机会。
- 好友助力每人获得 2 次，每日最多 10 人。

## 核心玩法

- 活动共 7 关，单关时长 90 秒。
- 每关需要找到的喜鹊数量为 5 / 6 / 6 / 7 / 7 / 8 / 8。
- 每完成一关获得 1 次抽奖机会。
- 完成第 3 关和第 7 关时分别解锁消费券。

## 页面需求

需要首页、找喜鹊关卡、通关与失败结果、机会任务、抽奖、奖品、参与明细和活动规则等页面。

## 待确认信息

奖励金额在原始资料中同时出现 X、480 和 680 三种口径。在业务确认唯一金额前，页面和图片不展示任何候选数字。`

function readDocumentTab(): DocumentId {
  try {
    const stored = window.sessionStorage.getItem(QIXI_DOC_TAB_KEY)
    if (DOCUMENTS.some((document) => document.id === stored))
      return stored as DocumentId
  } catch {
    // Keep the default tab when session storage is unavailable.
  }
  return 'source'
}

function readStoredDocuments(): Partial<Record<EditableDocumentId, string>> {
  try {
    return JSON.parse(window.localStorage.getItem(QIXI_DOC_CONTENT_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function includesAny(pathIds: string[], ids: string[]) {
  return ids.some((id) => pathIds.includes(id))
}

function mergeNewSections(current: string | undefined, generated: string) {
  if (!current?.trim()) return generated

  const currentHeadings = new Set(
    [...current.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim()),
  )
  const sections = generated.split(/(?=^##\s+)/m).slice(1)
  const missingSections = sections.filter((section) => {
    const heading = section.match(/^##\s+(.+)$/m)?.[1].trim()
    return heading && !currentHeadings.has(heading)
  })

  if (!missingSections.length) return current
  return `${current.trimEnd()}\n\n${missingSections.join('\n').trim()}`
}

function saveDocuments(documents: Record<EditableDocumentId, string>) {
  try {
    window.localStorage.setItem(QIXI_DOC_CONTENT_KEY, JSON.stringify(documents))
  } catch {
    // Editing still works for the current session when storage is unavailable.
  }
}

function readCustomConfirmations(): Partial<
  Record<'scope' | 'gameplay' | 'visual', string>
> {
  try {
    return JSON.parse(
      window.localStorage.getItem(QIXI_CUSTOM_CONFIRMATIONS_KEY) ?? '{}',
    )
  } catch {
    return {}
  }
}

export default function QixiReplayWorkspace({
  target,
  stepId,
  pathIds,
}: {
  target: QixiReplayTarget
  stepId: string
  pathIds: string[]
}) {
  const [activeDocument, setActiveDocument] =
    useState<DocumentId>(readDocumentTab)
  const [mode, setMode] = useState<DocumentMode>('rendered')
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const completedSnapshot = target === 'current-result' && pathIds.length === 0
  const reached = (...ids: string[]) =>
    completedSnapshot || includesAny(pathIds, ids)
  const customConfirmations = readCustomConfirmations()
  const scopeSummary = reached('qixi-scope-custom-selected')
    ? customConfirmations.scope || '用户自定义边界'
    : reached('qixi-scope-minimal-selected')
      ? '只做找喜鹊 MVP'
      : reached('qixi-scope-group-selected')
        ? '加入组队玩法'
        : '单人完整闭环'
  const gameplaySummary = reached('qixi-gameplay-custom-selected')
    ? customConfirmations.gameplay || '用户自定义玩法'
    : reached('qixi-gameplay-fast-selected')
      ? '60 秒高压挑战'
      : reached('qixi-gameplay-calm-selected')
        ? '无倒计时休闲找图'
        : '90 秒渐进挑战'
  const visualSummary = reached('qixi-visual-custom-selected')
    ? customConfirmations.visual || '用户自定义风格'
    : reached('qixi-visual-sweet-selected')
      ? '甜美元气粉紫'
      : reached('qixi-visual-real-selected')
        ? '写实城市夜景'
        : '现代东方月夜剪纸'

  const blueprintSections = [
    reached('qixi-parse')
      ? `## 本期目标

活动以“获得机会 → 找喜鹊 → 搭鹊桥 → 领取奖励”为主线。本期只实现前端可交互效果，真实发奖、库存、风控和后端接口不在本期范围。`
      : '',
    reached(
      'qixi-scope-complete-selected',
      'qixi-scope-minimal-selected',
      'qixi-scope-group-selected',
      'qixi-scope-custom-selected',
    )
      ? `## 活动边界

已确认：**${scopeSummary}**。页面需求和后续灰模都以此为本期范围。`
      : '',
    reached('qixi-wireframe-choice', 'qixi-wireframe-reuse-applied')
      ? `## 页面框架

已生成可点击灰模，并串联以下用户路径：

1. 首页查看鹊桥进度、闯关机会和任务。
2. 进入关卡找到喜鹊，完成或中途退出。
3. 回到首页查看进度，继续闯关或参与抽奖。
4. 随时查看活动规则、奖品和参与明细。`
      : '',
    reached(
      'qixi-gameplay-baseline-selected',
      'qixi-gameplay-fast-selected',
      'qixi-gameplay-calm-selected',
      'qixi-gameplay-custom-selected',
    )
      ? `## 玩法主线

已确认：**${gameplaySummary}**。该结果已写入玩法配置，页面的倒计时、难度和结果反馈会保持一致。`
      : '',
    reached(
      'qixi-visual-eastern-selected',
      'qixi-visual-sweet-selected',
      'qixi-visual-real-selected',
      'qixi-visual-custom-selected',
    )
      ? `## 设计风格

已确认：**${visualSummary}**。首页、关卡和奖励素材都会沿同一视觉方向生成。`
      : '',
    reached('qixi-current-build', 'qixi-current-result')
      ? `## 页面产物与自检

- 首页主 KV 与第 1 关样张已落位。
- 第 1 关可查找 5 只喜鹊，热区、误点反馈和机会不足去向已检查。
- 页面可纵向滚动，标题、按钮和任务卡可作为单独组件编辑。
- 其余 6 关与奖励、抽奖、分享素材待第 1 关验收后批量生成。`
      : '',
    reached('qixi-current-build', 'qixi-current-result')
      ? `## 发布前待补资料

- 确认奖励的唯一金额口径。
- 接入真实库存、发奖、风控和参与明细接口。`
      : '',
  ].filter(Boolean)

  const generatedBlueprint = `# 七夕「搭建鹊桥」活动方案

> 这份文档会随确认和生成结果持续向下增加，已有内容不会被下一阶段替换。

${blueprintSections.join('\n\n')}`

  const decisionSections = [
    reached(
      'qixi-scope-complete-selected',
      'qixi-scope-minimal-selected',
      'qixi-scope-group-selected',
      'qixi-scope-custom-selected',
    )
      ? `## 1. 本期边界

**已确认：${scopeSummary}**

已追加到《页面需求》，并作为灰模生成边界。`
      : '',
    reached(
      'qixi-gameplay-baseline-selected',
      'qixi-gameplay-fast-selected',
      'qixi-gameplay-calm-selected',
      'qixi-gameplay-custom-selected',
    )
      ? `## 2. 玩法节奏

**已确认：${gameplaySummary}**

已追加到《玩法信息》，并同步到玩法配置。`
      : '',
    reached(
      'qixi-visual-eastern-selected',
      'qixi-visual-sweet-selected',
      'qixi-visual-real-selected',
      'qixi-visual-custom-selected',
    )
      ? `## 3. 设计风格

**已确认：${visualSummary}**

已用于主 KV 和第 1 关样张生成。`
      : '',
    reached('qixi-current-build', 'qixi-current-result')
      ? `## 发布前待补资料

奖励金额尚未确认唯一口径。这是待补资料，不是第四次活动方案确认。`
      : '',
  ].filter(Boolean)

  const generatedDecisions = `# 已确认方案

> 用户只需确认会改变活动本身的 3 件事：边界、玩法和设计风格。Agent 的页面组织与质量修复不占用用户确认。

${decisionSections.join('\n\n')}`

  const [editableDocuments, setEditableDocuments] = useState<
    Record<EditableDocumentId, string>
  >(() => {
    const stored = readStoredDocuments()
    return {
      blueprint: mergeNewSections(stored.blueprint, generatedBlueprint),
      decisions: mergeNewSections(stored.decisions, generatedDecisions),
    }
  })

  const mergedBlueprint = mergeNewSections(
    editableDocuments.blueprint,
    generatedBlueprint,
  )
  const mergedDecisions = mergeNewSections(
    editableDocuments.decisions,
    generatedDecisions,
  )

  useEffect(() => {
    saveDocuments({
      blueprint: mergedBlueprint,
      decisions: mergedDecisions,
    })
  }, [mergedBlueprint, mergedDecisions])

  const currentSource =
    activeDocument === 'source'
      ? SOURCE_MARKDOWN
      : activeDocument === 'blueprint'
        ? mergedBlueprint
        : mergedDecisions
  const isEditable = activeDocument !== 'source'

  const updateCurrentDocument = (value: string) => {
    if (!isEditable) return
    const next = {
      blueprint: mergedBlueprint,
      decisions: mergedDecisions,
      [activeDocument]: value,
    }
    saveDocuments(next)
    setEditableDocuments(next)
  }

  const openEditor = () => {
    if (!isEditable) return
    setMode('markdown')
    window.requestAnimationFrame(() => editorRef.current?.focus())
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--color-surface-1)] text-[var(--color-ink)]">
      <header className="flex min-h-12 shrink-0 items-center gap-4 border-b border-[var(--divider-soft)] px-5">
        <div
          role="tablist"
          aria-label="项目文档"
          className="thin-scroll flex min-w-0 flex-1 self-stretch gap-5 overflow-x-auto"
        >
          {DOCUMENTS.map((document) => (
            <button
              key={document.id}
              type="button"
              role="tab"
              aria-selected={activeDocument === document.id}
              onClick={() => {
                setActiveDocument(document.id)
                try {
                  window.sessionStorage.setItem(QIXI_DOC_TAB_KEY, document.id)
                } catch {
                  // The documents remain usable without persisted tab selection.
                }
              }}
              className="relative flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink)]/42 transition-colors hover:text-[var(--color-ink)]/72 aria-selected:text-[var(--color-ink)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent aria-selected:after:bg-sky-500"
            >
              {document.label}
              <span className="text-[8px] font-normal text-[var(--color-ink)]/28">
                {document.meta}
              </span>
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex rounded-lg bg-[var(--fill-subtle)] p-0.5">
            <button
              type="button"
              aria-pressed={mode === 'rendered'}
              onClick={() => setMode('rendered')}
              className="rounded-md px-2.5 py-1 text-[10px] text-[var(--color-ink)]/48 transition-colors aria-pressed:bg-[var(--color-surface-0)] aria-pressed:text-[var(--color-ink)] aria-pressed:shadow-sm"
            >
              阅读
            </button>
            <button
              type="button"
              aria-pressed={mode === 'markdown'}
              onClick={() => setMode('markdown')}
              className="rounded-md px-2.5 py-1 text-[10px] text-[var(--color-ink)]/48 transition-colors aria-pressed:bg-[var(--color-surface-0)] aria-pressed:text-[var(--color-ink)] aria-pressed:shadow-sm"
            >
              Markdown
            </button>
          </div>
          {isEditable ? (
            <button
              type="button"
              onClick={openEditor}
              className="rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-1.5 text-[10px] font-medium text-[var(--color-ink)]/70 transition-colors hover:border-[var(--color-ink)]/25 hover:text-[var(--color-ink)]"
            >
              编辑
            </button>
          ) : (
            <span className="px-2 text-[9px] text-[var(--color-ink)]/32">
              原文只读
            </span>
          )}
        </div>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-7 py-6">
        <div className="mx-auto max-w-[820px]">
          {mode === 'rendered' ? (
            <article className="rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-7 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <MarkdownView source={currentSource} />
            </article>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[var(--divider)] bg-[#111827] shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[9px] text-white/45">
                <span>
                  {DOCUMENTS.find((doc) => doc.id === activeDocument)?.label}.md
                </span>
                <span>{isEditable ? '自动保存' : '只读'}</span>
              </div>
              <textarea
                ref={editorRef}
                aria-label={`${DOCUMENTS.find((doc) => doc.id === activeDocument)?.label} Markdown`}
                readOnly={!isEditable}
                spellCheck={false}
                value={currentSource}
                onChange={(event) => updateCurrentDocument(event.target.value)}
                className="block min-h-[560px] w-full resize-none bg-transparent p-5 font-mono text-[12px] leading-6 text-slate-100 outline-none read-only:text-slate-300"
              />
            </div>
          )}

          <footer className="mt-4 flex items-center justify-between text-[9px] text-[var(--color-ink)]/30">
            <span>当前阶段：{stepId}</span>
            <span>
              {isEditable
                ? '修改会保留，新阶段只追加'
                : '原始输入不随回放改写'}
            </span>
          </footer>
        </div>
      </div>
    </div>
  )
}
