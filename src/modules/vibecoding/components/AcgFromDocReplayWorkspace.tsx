import { useEffect, useMemo, useState } from 'react'
import { Check, Code2, Eye, Pencil, Save } from '@/shared/icons'
import MarkdownView from './MarkdownView'
import {
  ACG_FROM_DOC_CHAPTERS,
  ACG_FROM_DOC_DECISIONS_MD,
  ACG_FROM_DOC_PLAN_MD,
  ACG_FROM_DOC_SOURCE_MD,
} from './AcgFromDocData'
import type { AcgFromDocReplayTarget } from './AcgFromDocGenerationReplayScript'

type DocumentId = 'source' | 'plan' | 'decisions'
type DocumentMode = 'rendered' | 'markdown'

const DOC_CONTENT_KEY = 'creative-studio.acg-from-doc-documents.v2'
const DOC_TAB_KEY = 'creative-studio.acg-from-doc-document-tab.v2'

const DOCUMENTS: {
  id: DocumentId
  label: string
  meta: string
  readOnly?: boolean
}[] = [
  { id: 'source', label: '需求原文', meta: '只读', readOnly: true },
  { id: 'plan', label: '页面需求', meta: '持续更新' },
  { id: 'decisions', label: '确认结果', meta: '只追加' },
]

function readDocuments() {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(DOC_CONTENT_KEY) ?? 'null',
    ) as Partial<Record<DocumentId, string>> | null
    return {
      source: ACG_FROM_DOC_SOURCE_MD,
      plan: stored?.plan ?? ACG_FROM_DOC_PLAN_MD,
      decisions: stored?.decisions ?? ACG_FROM_DOC_DECISIONS_MD,
    }
  } catch {
    return {
      source: ACG_FROM_DOC_SOURCE_MD,
      plan: ACG_FROM_DOC_PLAN_MD,
      decisions: ACG_FROM_DOC_DECISIONS_MD,
    }
  }
}

function readActiveDocument(): DocumentId {
  try {
    const stored = window.sessionStorage.getItem(DOC_TAB_KEY)
    if (DOCUMENTS.some((document) => document.id === stored))
      return stored as DocumentId
  } catch {
    // Fall through to the planning document.
  }
  return 'plan'
}

export function AcgFromDocDocumentsWorkspace({
  target,
  stepId,
  pathIds,
}: {
  target: AcgFromDocReplayTarget
  stepId: string
  pathIds: string[]
}) {
  const [documents, setDocuments] = useState(readDocuments)
  const [activeDocument, setActiveDocument] =
    useState<DocumentId>(readActiveDocument)
  const [mode, setMode] = useState<DocumentMode>('rendered')
  const [editing, setEditing] = useState(false)
  const document = DOCUMENTS.find((item) => item.id === activeDocument)!
  const currentText = documents[activeDocument]

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (target === 'source-understanding') setActiveDocument('source')
      else if (target === 'scope-decision' || target === 'wireframe')
        setActiveDocument('plan')
      else if (
        target === 'gameplay-decision' ||
        target === 'visual-decision' ||
        target === 'current-result'
      )
        setActiveDocument('decisions')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [target])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DOC_TAB_KEY, activeDocument)
    } catch {
      // Tab selection is non-critical.
    }
  }, [activeDocument])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DOC_CONTENT_KEY,
        JSON.stringify({ plan: documents.plan, decisions: documents.decisions }),
      )
    } catch {
      // The editor remains usable in memory.
    }
  }, [documents.decisions, documents.plan])

  const progress = [
    ['定边界', pathIds.some((id) => id.includes('scope-main-applied'))],
    ['页面框架', pathIds.includes('acg-doc-wireframe-ready')],
    [
      '定玩法',
      pathIds.some((id) => id.includes('gameplay-journey-applied')),
    ],
    ['定风格', pathIds.some((id) => id.includes('visual-star-applied'))],
    ['生成审查', pathIds.includes('acg-doc-review-applied')],
  ] as const

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--color-surface-0)]">
      <div className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--divider-soft)] px-4">
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-2">
          {DOCUMENTS.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={activeDocument === item.id}
              onClick={() => {
                setActiveDocument(item.id)
                setEditing(false)
              }}
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] aria-pressed:bg-[var(--fill-hover)] aria-pressed:text-[var(--color-ink)]"
            >
              <span>{item.label}</span>
              <span className="text-[9px] text-[var(--color-ink)]/32">
                {item.meta}
              </span>
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--divider-soft)] p-0.5">
          <button
            type="button"
            title="阅读态"
            aria-pressed={mode === 'rendered'}
            onClick={() => setMode('rendered')}
            className="grid size-6 place-items-center rounded-md text-[var(--color-ink)]/42 hover:text-[var(--color-ink)] aria-pressed:bg-[var(--fill-hover)] aria-pressed:text-[var(--color-ink)]"
          >
            <Eye size={12} />
          </button>
          <button
            type="button"
            title="Markdown"
            aria-pressed={mode === 'markdown'}
            onClick={() => setMode('markdown')}
            className="grid size-6 place-items-center rounded-md text-[var(--color-ink)]/42 hover:text-[var(--color-ink)] aria-pressed:bg-[var(--fill-hover)] aria-pressed:text-[var(--color-ink)]"
          >
            <Code2 size={12} />
          </button>
          {!document.readOnly && (
            <button
              type="button"
              title={editing ? '保存' : '编辑'}
              aria-pressed={editing}
              onClick={() => setEditing((value) => !value)}
              className="grid size-6 place-items-center rounded-md text-[var(--color-ink)]/42 hover:text-[var(--color-ink)] aria-pressed:bg-[#357ef8]/10 aria-pressed:text-[#357ef8]"
            >
              {editing ? <Save size={12} /> : <Pencil size={12} />}
            </button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-[var(--divider-soft)] bg-[var(--fill-subtle)]/50 px-4 py-2">
        {progress.map(([label, done]) => (
          <span
            key={label}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] ${
              done
                ? 'bg-emerald-500/10 text-emerald-700'
                : 'bg-[var(--color-surface-0)] text-[var(--color-ink)]/34'
            }`}
          >
            {done && <Check size={9} />}
            {label}
          </span>
        ))}
        <span className="ml-auto self-center text-[9px] text-[var(--color-ink)]/30">
          {stepId}
        </span>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {editing ? (
          <textarea
            autoFocus
            value={currentText}
            onChange={(event) =>
              setDocuments((current) => ({
                ...current,
                [activeDocument]: event.target.value,
              }))
            }
            className="min-h-full w-full resize-none bg-[var(--color-surface-0)] px-8 py-7 font-mono text-[12px] leading-6 text-[var(--color-ink)] outline-none"
          />
        ) : mode === 'markdown' ? (
          <pre className="min-h-full whitespace-pre-wrap px-8 py-7 font-mono text-[12px] leading-6 text-[var(--color-ink)]/78">
            {currentText}
          </pre>
        ) : (
          <div className="mx-auto w-full max-w-[760px] px-8 py-8">
            <MarkdownView source={currentText} />
          </div>
        )}
      </div>
    </div>
  )
}

export function AcgFromDocGameplayWorkspace() {
  const [activeChapter, setActiveChapter] = useState('abstract')
  const active = useMemo(
    () =>
      ACG_FROM_DOC_CHAPTERS.find((chapter) => chapter.id === activeChapter) ??
      ACG_FROM_DOC_CHAPTERS[0],
    [activeChapter],
  )
  const [voteMode, setVoteMode] = useState<'single' | 'repeat'>('single')
  const [wishMax, setWishMax] = useState(80)

  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[var(--color-surface-0)] p-5">
      <div className="mx-auto grid w-full max-w-[900px] gap-4">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ff765d]">
            PLAY CONFIG / FRONTEND MOCK
          </p>
          <h2 className="mt-1 text-[20px] font-semibold text-[var(--color-ink)]">
            篇章解锁 + 单作品夯拉 + 奖励回路
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-[var(--color-ink)]/48">
            这里维护主会场与分会场共享的玩法状态；页面文案和视觉不复制这些字段。
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">
                六篇章顺序
              </h3>
              <p className="text-[10px] text-[var(--color-ink)]/40">
                1.14 起每 5 日解锁一个篇章
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-700">
              已统一为 6 篇
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ACG_FROM_DOC_CHAPTERS.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                aria-pressed={chapter.id === activeChapter}
                onClick={() => setActiveChapter(chapter.id)}
                className="rounded-xl border border-[var(--divider-soft)] px-2 py-3 text-left transition-colors hover:bg-[var(--fill-subtle)] aria-pressed:border-[#357ef8]/40 aria-pressed:bg-[#357ef8]/[0.06]"
              >
                <span
                  className="mb-2 grid size-6 place-items-center rounded-full text-[11px] font-bold"
                  style={{ background: chapter.accent, color: '#11142f' }}
                >
                  {chapter.glyph}
                </span>
                <strong className="block text-[10px] text-[var(--color-ink)]/78">
                  {chapter.title}
                </strong>
                <span className="text-[9px] text-[var(--color-ink)]/38">
                  {chapter.keyword}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[var(--fill-subtle)] px-3 py-2.5 text-[11px] leading-5 text-[var(--color-ink)]/58">
            当前：第 {active.order} 站「{active.title}」— {active.summary}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[var(--divider-soft)] p-4">
            <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">
              夯 / 拉投票
            </h3>
            <p className="mt-1 text-[10px] text-[var(--color-ink)]/40">
              主会场与分会场共享同一作品状态
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['single', 'repeat'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={voteMode === mode}
                  onClick={() => setVoteMode(mode)}
                  className="rounded-xl border border-[var(--divider-soft)] px-3 py-3 text-left text-[11px] text-[var(--color-ink)]/60 aria-pressed:border-[#ff765d]/50 aria-pressed:bg-[#ff765d]/[0.06] aria-pressed:text-[var(--color-ink)]"
                >
                  <strong className="block text-[12px]">
                    {mode === 'single' ? '每作品 1 票' : '允许改票'}
                  </strong>
                    {mode === 'single' ? '投后锁定' : '再次点击可切换夯 / 拉'}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--divider-soft)] p-4">
            <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">
              晚会许愿
            </h3>
            <p className="mt-1 text-[10px] text-[var(--color-ink)]/40">
              空输入禁用提交，成功后保留反馈
            </p>
            <label className="mt-3 grid gap-1.5 text-[10px] text-[var(--color-ink)]/48">
              最大字数
              <input
                type="number"
                min={20}
                max={200}
                value={wishMax}
                onChange={(event) =>
                  setWishMax(Math.max(20, Math.min(200, Number(event.target.value))))
                }
                className="h-9 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 text-[12px] text-[var(--color-ink)] outline-none focus:border-[#357ef8]"
              />
            </label>
          </section>
        </div>

        <section className="rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-900">
          当前均为前端 mock：篇章开放、作品、票数、排行榜、任务、抽奖和心愿提交不会请求真实接口；UI 已覆盖未投 / 已投、锁定、完成、禁用和成功反馈。
        </section>
      </div>
    </div>
  )
}
