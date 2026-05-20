import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CircleHelp,
  FileText,
  Gamepad2,
  Globe,
  LayoutGrid,
  MoreHorizontal,
  RotateCcw,
  Rocket,
  Sparkles,
  Tag,
  X,
  type LucideIcon,
} from '@/shared/icons'
import { usePublishFlowStore } from '@/modules/editor/store/publish-flow-store'
import type { ProjectKind } from './ProjectProductView'

/**
 * 统一发布抽屉 — 所有「发布」按钮点击后从右侧滑出。顶部切换「发布配置 /
 * 发布历史」。
 *
 *  发布配置：先确认发布产物对象，再按产物类型渲染字段。
 *    · AI 分身 / 小程序 → 应用场景开关列表（抖音APP / 抖音小花 两组）。
 *    · 其它产物 → 版本 / 渠道 / 环境 / 活动等表单字段。
 *  发布历史：按版本倒序的发布时间线（产物 + 场景开通结果）。
 *
 * 表单状态仅本地维护（demo 不落库），只为让流程看起来真实可点。
 */

const KIND_META: Record<
  ProjectKind,
  { label: string; icon: LucideIcon; objectHint: string }
> = {
  'mini-program': { label: '小程序', icon: LayoutGrid, objectHint: '抖音小程序产物' },
  'ai-avatar': { label: 'AI 分身', icon: Bot, objectHint: 'AI 分身产物' },
  'web-app': { label: '网站', icon: Globe, objectHint: '前端网站产物' },
  'web-game': { label: '网页游戏', icon: Gamepad2, objectHint: '网页游戏产物' },
  'marketing-h5': { label: '营销 H5', icon: Sparkles, objectHint: 'H5 活动页产物' },
  'ops-proposal': { label: '运营提案', icon: FileText, objectHint: '运营提案产物' },
}

/** 应用场景开关 — AI 分身 / 小程序 类产物的发布配置，按投放平台分组。 */
type SceneItem = { id: string; title: string; desc: string; on: boolean }
const SCENE_GROUPS: { platform: string; scenes: SceneItem[] }[] = [
  {
    platform: '抖音APP',
    scenes: [
      { id: 'comment', title: '评论区', desc: '允许抖音用户在评论区@分身回答问题', on: false },
      { id: 'ai-chat', title: 'AI 聊天', desc: '在个人页展示 AI 聊天入口，提供1对1互动', on: false },
      { id: 'group', title: '群聊', desc: '支持将分身添加至抖音群，允许分身回复群聊信息', on: false },
      { id: 'dm', title: '私信', desc: '允许AI 分身接管并回复用户私信咨询', on: false },
    ],
  },
  {
    platform: '抖音小花',
    scenes: [
      { id: 'search', title: '抖音搜索', desc: '允许用户通过抖音搜索检索分身', on: true },
      { id: 'bottombar', title: '底bar', desc: '允许抖音AI小花在评论区调度分身集合评论解析抖音视频', on: true },
      { id: 'flower-comment', title: '评论区', desc: '允许抖音AI小花在评论区调度分身集合评论解析抖音视频', on: true },
      { id: 'flower-im', title: '抖音小花IM', desc: '发布至抖音小花，支持抖音小花调度分身与用户互动、支持用户直接@分身', on: true },
    ],
  },
]

const SCENE_DEFAULTS: Record<string, boolean> = Object.fromEntries(
  SCENE_GROUPS.flatMap((g) => g.scenes.map((s) => [s.id, s.on])),
)

/** 发布历史时间线（按版本倒序，第一条为当前版本）。 */
type HistoryEntry = {
  time: string
  author: string
  current?: boolean
  scenes?: { label: string; ok: boolean }[]
}
const PUBLISH_HISTORY: HistoryEntry[] = [
  { time: '2026-01-09 11:33:44', author: '莉莉安', current: true },
  {
    time: '2026-01-01 11:33:44',
    author: '莉莉安',
    scenes: [
      { label: '搜索', ok: true },
      { label: '底bar', ok: true },
      { label: '评论区', ok: true },
      { label: '抖音小花', ok: false },
    ],
  },
  {
    time: '2023-01-09 11:33:44',
    author: '莉莉安',
    scenes: [{ label: '侧边栏', ok: true }],
  },
]

export default function PublishDrawer({
  projectName,
  projectKind,
}: {
  projectName: string
  projectKind: ProjectKind
}) {
  const step = usePublishFlowStore((s) => s.step)
  const mode = usePublishFlowStore((s) => s.mode)
  const anchor = usePublishFlowStore((s) => s.anchor)
  const confirm = usePublishFlowStore((s) => s.confirm)
  const closeModal = usePublishFlowStore((s) => s.closeModal)

  const open = mode === 'modal' && step !== 'idle'
  const confirmed = step === 'confirmed'

  // AI 分身 / 小程序 share the application-scene toggle list.
  const isSceneKind = projectKind === 'ai-avatar' || projectKind === 'mini-program'

  const [tab, setTab] = useState<'config' | 'history'>('config')
  const [sceneOn, setSceneOn] = useState<Record<string, boolean>>(SCENE_DEFAULTS)

  // Per-kind form scaffolding (non-scene kinds).
  const [version, setVersion] = useState('v1.0.0')
  const [note, setNote] = useState('')
  const [env, setEnv] = useState<'preview' | 'prod'>('preview')
  const [domain, setDomain] = useState('')
  const [branch, setBranch] = useState('main')
  const [gamePlatform, setGamePlatform] = useState('抖音小游戏')
  const [exportFmt, setExportFmt] = useState('在线链接')
  const [receiver, setReceiver] = useState('')
  const [activityTarget, setActivityTarget] = useState<'existing' | 'new'>('new')
  const [activityName, setActivityName] = useState('')

  // Reset to the config tab each time the drawer reopens.
  useEffect(() => {
    if (open) setTab('config')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeModal])

  if (typeof document === 'undefined') return null

  const meta = KIND_META[projectKind]
  const ObjectIcon = meta.icon

  // Float the popover just below the triggering 发布 button, right-aligned to
  // it. Clamp within the viewport so it never spills off-screen. Falls back to
  // the top-right corner when no anchor was captured.
  const POPOVER_W = 320
  const GAP = 8
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const top = anchor ? anchor.bottom + GAP : 56
  const rightEdge = anchor ? anchor.right : vw - 16
  const left = Math.max(12, Math.min(rightEdge - POPOVER_W, vw - POPOVER_W - 12))
  const maxH = Math.min(460, vh - top - 16)

  const renderSceneGroups = () => (
    <div className="space-y-3.5">
      {SCENE_GROUPS.map((group) => (
        <div key={group.platform}>
          <div className="mb-1.5 text-[11.5px] text-[var(--color-ink)]/45">{group.platform}</div>
          <div className="space-y-1.5">
            {group.scenes.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-2.5 rounded-lg bg-[var(--fill-subtle)] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-[var(--color-ink)]">{s.title}</div>
                  <div className="mt-0.5 text-[11px] leading-[1.45] text-[var(--color-ink)]/45">
                    {s.desc}
                  </div>
                </div>
                <Switch
                  on={sceneOn[s.id]}
                  onChange={(v) => setSceneOn((prev) => ({ ...prev, [s.id]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderFields = () => {
    if (isSceneKind) return renderSceneGroups()
    switch (projectKind) {
      case 'web-app':
        return (
          <>
            <Field label="部署环境" required className="mt-0">
              <Seg
                options={[
                  { value: 'preview', label: '预览环境' },
                  { value: 'prod', label: '生产环境' },
                ]}
                value={env}
                onChange={(v) => setEnv(v as 'preview' | 'prod')}
              />
            </Field>
            <Field label="自定义域名" hint className="mt-5">
              <TextInput value={domain} onChange={setDomain} placeholder="example.com（留空使用默认域名）" />
            </Field>
            <Field label="构建分支" className="mt-5">
              <TextInput value={branch} onChange={setBranch} placeholder="main" />
            </Field>
          </>
        )
      case 'web-game':
        return (
          <>
            <Field label="发布平台" required className="mt-0">
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setGamePlatform('抖音小游戏')}>
                  <Chip label="抖音小游戏" tone={gamePlatform === '抖音小游戏' ? 'strong' : 'soft'} />
                </button>
                <button type="button" onClick={() => setGamePlatform('H5 链接')}>
                  <Chip label="H5 链接" tone={gamePlatform === 'H5 链接' ? 'strong' : 'soft'} />
                </button>
              </div>
            </Field>
            <Field label="版本号" required className="mt-5">
              <TextInput value={version} onChange={setVersion} placeholder="v1.0.0" />
            </Field>
            <Field label="更新说明" className="mt-5">
              <TextArea value={note} onChange={setNote} placeholder="本次版本的改动…" />
            </Field>
          </>
        )
      case 'ops-proposal':
        return (
          <>
            <Field label="导出格式" required className="mt-0">
              <Seg options={['在线链接', 'PDF', 'PPT']} value={exportFmt} onChange={setExportFmt} />
            </Field>
            <Field label="接收人" hint className="mt-5">
              <div className="flex items-center gap-2 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px]">
                <input
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder="搜索邮箱添加接收人"
                  className="min-w-0 flex-1 bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35"
                />
                <ChevronDown size={14} className="shrink-0 text-[var(--color-ink)]/45" strokeWidth={1.8} />
              </div>
            </Field>
            <Field label="备注" className="mt-5">
              <TextArea value={note} onChange={setNote} placeholder="给接收人的说明…" />
            </Field>
          </>
        )
      case 'marketing-h5':
        return (
          <>
            <Field label="关联活动" className="mt-0">
              <div className="rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)]">
                {projectName}
              </div>
            </Field>
            <Field label="目标活动" className="mt-5">
              <Seg
                options={[
                  { value: 'existing', label: '选择已有活动' },
                  { value: 'new', label: '新建活动' },
                ]}
                value={activityTarget}
                onChange={(v) => setActivityTarget(v as 'existing' | 'new')}
              />
            </Field>
            <Field label="活动名称" required className="mt-5">
              <TextInput value={activityName} onChange={setActivityName} placeholder="请输入" />
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
                <Chip label="抖音" tone="strong" />
                <Chip label="非直播场景" />
                <Chip label="直播场景" />
                <ChevronDown size={14} className="ml-auto shrink-0 text-[var(--color-ink)]/45" strokeWidth={1.8} />
              </div>
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
          </>
        )
      default:
        return null
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Transparent click-catcher — dismiss on outside click without a
              page dim, so it reads as a lightweight popover. */}
          <div
            onClick={closeModal}
            className="fixed inset-0 z-[290]"
          />
          <motion.aside
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{
              top,
              left,
              width: POPOVER_W,
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: maxH,
              transformOrigin: 'top right',
            }}
            className="fixed z-[300] flex flex-col overflow-hidden rounded-2xl border border-[var(--divider)] bg-[var(--color-surface-1)] shadow-[0_20px_50px_-16px_rgba(0,0,0,0.4)]"
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between px-4 pt-3">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ink)]">
                <Rocket size={15} strokeWidth={2} className="text-[var(--color-ink)]/70" />
                发布
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="关闭"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink)]/55 hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </header>

            {/* Tabs — 发布配置 / 发布历史 (hidden in the success state) */}
            {!confirmed && (
              <div className="flex shrink-0 items-center gap-1 border-b border-[var(--divider-soft)] px-3 pb-2 pt-2">
                <TabPill active={tab === 'config'} onClick={() => setTab('config')}>
                  发布配置
                </TabPill>
                <TabPill active={tab === 'history'} onClick={() => setTab('history')}>
                  发布历史
                </TabPill>
              </div>
            )}

            {confirmed ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <CheckCircle2 size={44} className="text-emerald-500" strokeWidth={1.6} />
                <div className="text-[15px] font-semibold text-[var(--color-ink)]">已提交发布</div>
                <div className="text-[12.5px] leading-[1.6] text-[var(--color-ink)]/55">
                  「{projectName}」已提交发布，发布记录可在「发布历史」中查看。
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-2 rounded-md bg-[var(--color-ink)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
                >
                  完成
                </button>
              </div>
            ) : tab === 'history' ? (
              <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <HistoryTimeline productLabel={meta.label} />
              </div>
            ) : (
              <>
                {/* Body — config */}
                <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
                  {/* 1) 发布产物对象确认 */}
                  <div className="mb-3.5">
                    <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink)]/45">
                      发布产物
                    </div>
                    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--fill-subtle)] text-[var(--color-ink)]/70">
                        <ObjectIcon size={16} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-[var(--color-ink)]">
                          {projectName}
                        </div>
                        <div className="truncate text-[11.5px] text-[var(--color-ink)]/50">
                          {meta.label} · {meta.objectHint}
                        </div>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                        <Check size={11} strokeWidth={2.6} />
                        待发布
                      </span>
                    </div>
                  </div>

                  {/* 2) 配置字段 */}
                  {isSceneKind && (
                    <div className="mb-2 text-[12px] text-[var(--color-ink)]/45">应用场景</div>
                  )}
                  {renderFields()}
                </div>

                {/* Footer */}
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
                    onClick={confirm}
                    className="rounded-md bg-[var(--color-ink)] px-3.5 py-1.5 text-[12.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
                  >
                    确认发布
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ─── publish history ─── */

function HistoryTimeline({ productLabel }: { productLabel: string }) {
  return (
    <div className="relative">
      {PUBLISH_HISTORY.map((entry, i) => {
        const last = i === PUBLISH_HISTORY.length - 1
        return (
          <div key={i} className="relative flex gap-3 pb-6 last:pb-0">
            {/* rail + node */}
            <div className="relative flex w-3 shrink-0 justify-center">
              {!last && (
                <span className="absolute top-3 bottom-[-12px] w-px bg-[var(--divider)]" />
              )}
              <span
                className={`relative z-10 mt-1 h-2.5 w-2.5 rounded-full ${
                  entry.current ? 'bg-[var(--color-ink)]' : 'bg-[var(--color-ink)]/25'
                }`}
              />
            </div>
            {/* content */}
            <div className="min-w-0 flex-1">
              {entry.current ? (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--fill-subtle)] px-3 py-2">
                  <span className="text-[13px] font-medium text-[var(--color-ink)]">{entry.time}</span>
                  <Author name={entry.author} />
                  <button
                    type="button"
                    className="ml-auto flex items-center gap-1 text-[12.5px] text-[var(--color-ink)]/70 hover:text-[var(--color-ink)]"
                  >
                    <RotateCcw size={12} strokeWidth={2} />
                    查看当前版本发布进展
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[var(--color-ink)]">{entry.time}</span>
                    <Author name={entry.author} />
                    <button
                      type="button"
                      className="ml-auto flex h-6 w-6 items-center justify-center rounded text-[var(--color-ink)]/40 hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]/70"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                  <div className="mt-2 text-[12px] text-[var(--color-ink)]/45">产物发布</div>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-[var(--divider)] px-2 py-1 text-[12px] text-[var(--color-ink)]/75">
                      <Tag size={11} strokeWidth={1.8} className="text-[var(--color-ink)]/45" />
                      {productLabel}
                    </span>
                  </div>
                  {entry.scenes && (
                    <>
                      <div className="mt-2.5 text-[12px] text-[var(--color-ink)]/45">场景开通</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {entry.scenes.map((sc) => (
                          <span
                            key={sc.label}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--divider)] px-2.5 py-1 text-[12px] text-[var(--color-ink)]/75"
                          >
                            {sc.label}
                            {sc.ok ? (
                              <CheckCircle2 size={13} className="text-emerald-500" />
                            ) : (
                              <CircleAlert size={13} className="text-[#ff4d4f]" />
                            )}
                          </span>
                        ))}
                        {entry.scenes.some((s) => !s.ok) && (
                          <button
                            type="button"
                            className="text-[12.5px] text-[#3478ff] underline-offset-2 hover:underline"
                          >
                            查看失败原因
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Author({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[12px] text-[var(--color-ink)]/70">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)]/15 text-[9px] text-[var(--color-ink)]/70">
        {name.slice(0, 1)}
      </span>
      {name}
    </span>
  )
}

/* ─── small form primitives ─── */

function TabPill({
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
      className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? 'bg-[var(--fill-subtle)] text-[var(--color-ink)]'
          : 'text-[var(--color-ink)]/50 hover:text-[var(--color-ink)]/80'
      }`}
    >
      {children}
    </button>
  )
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative mt-0.5 h-[22px] w-[40px] shrink-0 rounded-full transition-colors ${
        on ? 'bg-[#3478ff]' : 'bg-[var(--color-ink)]/20'
      }`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-all ${
          on ? 'left-[20px]' : 'left-[2px]'
        }`}
      />
    </button>
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

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
    />
  )
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
    />
  )
}

type SegOption = string | { value: string; label: string }

function Seg({
  options,
  value,
  onChange,
}: {
  options: SegOption[]
  value: string
  onChange: (v: string) => void
}) {
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <div
      className="grid gap-0 overflow-hidden rounded-md border border-[var(--divider)] bg-[var(--fill-subtle)] p-1"
      style={{ gridTemplateColumns: `repeat(${norm.length}, minmax(0, 1fr))` }}
    >
      {norm.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex h-7 items-center justify-center rounded text-[12.5px] transition-colors ${
            value === o.value
              ? 'bg-[var(--color-surface-0)] font-medium text-[var(--color-ink)] shadow-sm'
              : 'text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Chip({ label, tone = 'soft' }: { label: string; tone?: 'soft' | 'strong' }) {
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
