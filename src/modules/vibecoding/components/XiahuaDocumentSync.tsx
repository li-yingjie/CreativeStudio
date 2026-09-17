import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  RefreshCw,
  Sparkles,
} from '@/shared/icons'
import {
  DEFAULT_XIAHUA_PARTICIPATION_POLICY,
  type XiahuaGameplay,
  type XiahuaTaskDef,
} from './XiahuaGameplay'

type DocumentSource = {
  blockId: string
  text: string
  url: string
}

type ParsedChange = {
  id: string
  kind: 'schedule' | 'task' | 'tiers'
  title: string
  targetId?: string
  value: Record<string, unknown>
  confidence: number
  blocked?: boolean
  blockedReason?: string
  source: DocumentSource
}

type ParsedConflict = {
  id: string
  severity: 'blocking' | 'warning'
  title: string
  description: string
  options: string[]
  sources: DocumentSource[]
}

type DocumentAnalysis = {
  document: {
    token: string
    url: string
    title: string
    revision: number
    fetchedAt: string
  }
  summary: {
    goal: string
    schedule: { startAt: string; endAt: string } | null
    themes: Array<{ name: string; scene: string; partner: string; schedule: string }>
    loops: Array<{ id: string; name: string; route: string; detected: boolean }>
    lifecycle: string
    declaredCardCount: number
    listedCardCount: number
  }
  changes: ParsedChange[]
  conflicts: ParsedConflict[]
  syncMode: 'live' | 'snapshot'
  warning?: string
}

type VisibleChange = ParsedChange & {
  before: string
  after: string
  same: boolean
}

const DOCUMENT_TOKEN = 'KIkmdQBwdo8Ilmx7vzpcZKEwnjg'

function shortDate(value: string) {
  if (!value) return '未设置'
  return value.replace('T', ' ').replace(' 00:00', '').replace(' 23:59', '')
}

function taskSummary(task: XiahuaTaskDef | undefined) {
  if (!task) return '当前活动未配置'
  return `每日 ${task.dailyLimit} 次 · 每次 ${task.reward} 次机会`
}

function describeChange(change: ParsedChange, gameplay: XiahuaGameplay): VisibleChange {
  if (change.kind === 'schedule') {
    const policy = gameplay.participation ?? DEFAULT_XIAHUA_PARTICIPATION_POLICY
    const startAt = String(change.value.startAt ?? '')
    const endAt = String(change.value.endAt ?? '')
    return {
      ...change,
      before: `${shortDate(policy.startAt)} — ${shortDate(policy.endAt)}`,
      after: `${shortDate(startAt)} — ${shortDate(endAt)}`,
      same: policy.startAt === startAt && policy.endAt === endAt,
    }
  }
  if (change.kind === 'task') {
    const current = gameplay.tasks.find((task) => task.id === change.targetId)
    const dailyLimit = Number(change.value.dailyLimit ?? 1)
    const reward = Number(change.value.reward ?? 1)
    return {
      ...change,
      before: taskSummary(current),
      after: `每日 ${dailyLimit} 次 · 每次 ${reward} 次机会`,
      same: Boolean(current && current.dailyLimit === dailyLimit && current.reward === reward),
    }
  }
  const needs = Array.isArray(change.value.needs) ? change.value.needs.map(Number) : []
  const currentNeeds = gameplay.tiers.map((tier) => tier.need)
  return {
    ...change,
    before: currentNeeds.join(' / ') || '未配置',
    after: needs.join(' / ') || '未识别',
    same: JSON.stringify(currentNeeds) === JSON.stringify(needs),
  }
}

function createPoiLightTask(change: ParsedChange): XiahuaTaskDef {
  return {
    id: 'poi-light',
    label: '在指定商户下完成一次点亮',
    subtitle: '点亮成功后自动发放',
    taskType: 'custom',
    reward: Number(change.value.reward ?? 1),
    dailyLimit: Number(change.value.dailyLimit ?? 10),
    eventSource: '活动埋点',
    eventKey: 'poi.light.success',
    resetCycle: 'daily',
    audience: 'all',
    countDimension: 'UID',
    claimMode: 'auto',
    cooldownSeconds: 30,
    validFrom: '2026-06-30 00:00',
    validTo: '2026-08-31 23:59',
    jumpSchema: 'snssdk1128://activity/night-food/cards',
    completedCopy: '已点亮',
    expiredCopy: '已结束',
    enabled: true,
    assetKey: 'secTasks',
  }
}

function applyChanges(gameplay: XiahuaGameplay, changes: ParsedChange[]) {
  let next = gameplay
  for (const change of changes) {
    if (change.blocked) continue
    if (change.kind === 'schedule') {
      const policy = next.participation ?? DEFAULT_XIAHUA_PARTICIPATION_POLICY
      next = {
        ...next,
        participation: {
          ...policy,
          startAt: String(change.value.startAt ?? policy.startAt),
          endAt: String(change.value.endAt ?? policy.endAt),
        },
      }
    }
    if (change.kind === 'task' && change.targetId) {
      const index = next.tasks.findIndex((task) => task.id === change.targetId)
      if (index === -1 && change.targetId === 'poi-light') {
        next = { ...next, tasks: [...next.tasks, createPoiLightTask(change)] }
      } else if (index >= 0) {
        next = {
          ...next,
          tasks: next.tasks.map((task, taskIndex) =>
            taskIndex === index
              ? {
                  ...task,
                  dailyLimit: Number(change.value.dailyLimit ?? task.dailyLimit),
                  reward: Number(change.value.reward ?? task.reward),
                }
              : task,
          ),
        }
      }
    }
  }
  return next
}

function SourceLink({ source, label = '查看原文' }: { source: DocumentSource; label?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      title={source.text}
      className="inline-flex items-center gap-1 text-[10px] font-medium text-[#357ef8] hover:underline"
    >
      {label}
      <ExternalLink className="size-3" />
    </a>
  )
}

export default function XiahuaDocumentSync({
  value,
  onChange,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
}) {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [resolutions, setResolutions] = useState<Record<string, string>>({})
  const [appliedRevision, setAppliedRevision] = useState<number | null>(null)

  const load = useCallback(async (refresh = false) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/activity-doc?token=${encodeURIComponent(DOCUMENT_TOKEN)}${refresh ? '&refresh=1' : ''}`)
      const payload = await response.json() as { ok: boolean; data?: DocumentAnalysis; error?: string }
      if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error || '文档解析失败')
      setAnalysis(payload.data)
      const candidates = payload.data.changes.filter((item) => !item.blocked).map((item) => item.id)
      setSelected(candidates)
      setResolutions({})
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '文档解析失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(false), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const visibleChanges = useMemo(
    () => (analysis?.changes ?? []).map((change) => describeChange(change, value)),
    [analysis, value],
  )
  const changedItems = visibleChanges.filter((change) => !change.same)
  const selectedChanges = changedItems.filter((change) => selected.includes(change.id) && !change.blocked)

  const toggleChange = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const apply = () => {
    if (!analysis || !selectedChanges.length) return
    onChange(applyChanges(value, selectedChanges))
    setAppliedRevision(analysis.document.revision)
    setSelected([])
    toast.success('已生成配置草稿并同步至试玩', {
      description: `应用 ${selectedChanges.length} 组安全变更；冲突项保持不变。`,
    })
  }

  return (
    <main className="thin-scroll h-full overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto w-full max-w-[900px] space-y-5 px-5 py-6">
        <section className="rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#3370ff]/10 text-[#3370ff]">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[15px] font-semibold text-[var(--color-ink)]">
                    {analysis?.document.title ?? '「这夏夯爆了」生服 UGC 暑期活动方案'}
                  </h2>
                  {analysis ? (
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${analysis.syncMode === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {analysis.syncMode === 'live' ? '飞书实时读取' : '基线快照'}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[var(--color-ink)]/42">
                  <span>玩法事实源 · 飞书文档</span>
                  {analysis ? <span>Revision {analysis.document.revision}</span> : null}
                  {analysis ? <span>{new Date(analysis.document.fetchedAt).toLocaleString('zh-CN', { hour12: false })}</span> : null}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={analysis?.document.url ?? `https://bytedance.larkoffice.com/docx/${DOCUMENT_TOKEN}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--divider-soft)] px-3 text-[10px] font-medium text-[var(--color-ink)]/62 hover:bg-[var(--fill-subtle)]"
              >
                查看飞书 <ExternalLink className="size-3" />
              </a>
              <button
                type="button"
                disabled={loading}
                onClick={() => void load(true)}
                className="inline-flex h-8 whitespace-nowrap items-center gap-1.5 rounded-lg bg-[var(--color-ink)] px-3 text-[10px] font-medium text-white disabled:cursor-wait disabled:opacity-50"
              >
                <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '正在解析' : '解析最新版本'}
              </button>
            </div>
          </div>
          {analysis?.warning ? (
            <div className="mt-4 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <span>{analysis.warning}</span>
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-[10px] text-rose-700">{error}</div>
          ) : null}
        </section>

        {loading && !analysis ? (
          <section className="flex min-h-64 items-center justify-center rounded-2xl border border-[var(--divider-soft)]">
            <div className="text-center">
              <RefreshCw className="mx-auto size-5 animate-spin text-[#357ef8]" />
              <p className="mt-3 text-[11px] text-[var(--color-ink)]/48">正在读取文档并编译玩法意图…</p>
            </div>
          </section>
        ) : null}

        {analysis ? (
          <>
            <section className="rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">系统理解的活动结构</h3>
                  <p className="mt-0.5 text-[10px] text-[var(--color-ink)]/42">先确认系统是否读懂，再处理字段变化。</p>
                </div>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-medium text-violet-700">受控解析 Demo</span>
              </div>
              <div className="grid gap-3 @[620px]:grid-cols-2">
                <div className="rounded-xl bg-[var(--fill-subtle)] p-3.5">
                  <p className="text-[9px] font-medium text-[var(--color-ink)]/38">活动目标</p>
                  <p className="mt-1.5 line-clamp-3 text-[11px] leading-[18px] text-[var(--color-ink)]/72">{analysis.summary.goal}</p>
                </div>
                <div className="rounded-xl bg-[var(--fill-subtle)] p-3.5">
                  <p className="text-[9px] font-medium text-[var(--color-ink)]/38">活动周期与主题</p>
                  <p className="mt-1.5 text-[11px] font-medium text-[var(--color-ink)]/72">
                    {analysis.summary.schedule ? `${shortDate(analysis.summary.schedule.startAt)} — ${shortDate(analysis.summary.schedule.endAt)}` : '未识别'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {analysis.summary.themes.map((theme) => (
                      <span key={theme.name} title={`${theme.partner} · ${theme.schedule}`} className="rounded-md bg-white px-2 py-1 text-[9px] text-[var(--color-ink)]/58">
                        {theme.name} · {theme.schedule}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-[var(--divider-soft)] p-3.5">
                <p className="text-[9px] font-medium text-[var(--color-ink)]/38">并行玩法回路</p>
                <div className="mt-2 grid gap-2 @[620px]:grid-cols-2">
                  {analysis.summary.loops.filter((loop) => loop.detected).map((loop) => (
                    <div key={loop.id} className="flex items-center gap-2.5 rounded-lg bg-[var(--color-surface-1)] px-3 py-2.5">
                      <Sparkles className="size-3.5 shrink-0 text-[#357ef8]" />
                      <div>
                        <p className="text-[10px] font-medium text-[var(--color-ink)]/75">{loop.name}</p>
                        <p className="mt-0.5 text-[9px] text-[var(--color-ink)]/40">{loop.route}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--divider-soft)] px-5 py-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">文档 → 当前试玩</h3>
                  <p className="mt-0.5 text-[10px] text-[var(--color-ink)]/42">
                    {changedItems.length} 组变化 · {changedItems.filter((item) => item.blocked).length} 组暂不可执行
                  </p>
                </div>
                {appliedRevision === analysis.document.revision ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-medium text-emerald-700">
                    <CheckCircle2 className="size-3" /> 已同步 Revision {analysis.document.revision}
                  </span>
                ) : null}
              </div>
              <div className="divide-y divide-[var(--divider-soft)]">
                {changedItems.map((change) => {
                  const checked = selected.includes(change.id)
                  return (
                    <div key={change.id} className={`px-5 py-4 ${change.blocked ? 'bg-amber-50/35' : ''}`}>
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          disabled={change.blocked}
                          aria-label={`${checked ? '取消' : '选择'}${change.title}`}
                          onClick={() => toggleChange(change.id)}
                          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${change.blocked ? 'cursor-not-allowed border-amber-300 bg-amber-100' : checked ? 'border-[#357ef8] bg-[#357ef8] text-white' : 'border-[var(--color-ink)]/20 bg-white'}`}
                        >
                          {checked && !change.blocked ? <Check className="size-3" /> : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-semibold text-[var(--color-ink)]/78">{change.title}</p>
                            <span className="rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 font-mono text-[8px] text-[var(--color-ink)]/42">
                              置信度 {Math.round(change.confidence * 100)}%
                            </span>
                            {change.blocked ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-medium text-amber-800">需补充文档</span> : null}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                            <span className="rounded-md bg-[var(--fill-subtle)] px-2 py-1 text-[var(--color-ink)]/48">{change.before}</span>
                            <ArrowRight className="size-3 text-[var(--color-ink)]/28" />
                            <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">{change.after}</span>
                          </div>
                          {change.blockedReason ? <p className="mt-2 text-[9px] text-amber-800">{change.blockedReason}</p> : null}
                          <div className="mt-2"><SourceLink source={change.source} /></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {!changedItems.length ? (
                  <div className="px-5 py-10 text-center text-[10px] text-[var(--color-ink)]/42">当前试玩与可执行文档规则一致。</div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--divider-soft)] bg-[var(--color-surface-1)] px-5 py-3.5">
                <p className="text-[9px] text-[var(--color-ink)]/40">只应用已勾选的安全变更，冲突项不会覆盖当前配置。</p>
                <button
                  type="button"
                  disabled={!selectedChanges.length}
                  onClick={apply}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#357ef8] px-3.5 text-[10px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Sparkles className="size-3" /> 生成配置草稿并同步试玩
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white">
              <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50/60 px-5 py-4">
                <AlertTriangle className="size-4 text-amber-700" />
                <div>
                  <h3 className="text-[13px] font-semibold text-amber-950">待确认问题</h3>
                  <p className="mt-0.5 text-[10px] text-amber-800/65">系统不替运营猜答案；选择仅记录决策，不会自动上线。</p>
                </div>
              </div>
              <div className="divide-y divide-amber-100">
                {analysis.conflicts.map((conflict, index) => (
                  <div key={conflict.id} className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-semibold text-amber-800">{index + 1}</span>
                      <p className="text-[11px] font-semibold text-[var(--color-ink)]/78">{conflict.title}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-medium ${conflict.severity === 'blocking' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                        {conflict.severity === 'blocking' ? '阻塞对应配置' : '需要说明'}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] leading-4 text-[var(--color-ink)]/55">{conflict.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {conflict.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setResolutions((current) => ({ ...current, [conflict.id]: option }))}
                          className={`h-7 rounded-lg border px-2.5 text-[9px] font-medium ${resolutions[conflict.id] === option ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-[var(--divider-soft)] text-[var(--color-ink)]/52 hover:bg-[var(--fill-subtle)]'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-3">
                      {conflict.sources.map((item, sourceIndex) => <SourceLink key={`${item.blockId}-${sourceIndex}`} source={item} label={`依据 ${sourceIndex + 1}`} />)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex items-start gap-3 rounded-xl bg-[var(--fill-subtle)] px-4 py-3">
              <Clock className="mt-0.5 size-3.5 shrink-0 text-[var(--color-ink)]/38" />
              <p className="text-[9px] leading-4 text-[var(--color-ink)]/45">
                当前只生成本地配置草稿。线上版本不会跟随飞书正文自动变化；发布、审批、灰度与回滚不在本轮 Demo 范围内。
              </p>
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}
