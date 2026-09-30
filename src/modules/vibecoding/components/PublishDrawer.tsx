import { useState } from 'react'
import { Button } from '@douyin-ai/ui'
import {
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  Gamepad2,
  Globe,
  LayoutGrid,
  Megaphone,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from '@/shared/icons'
import type { ProjectKind } from './ProjectProductView'
import PublishObjectVisualThumb from './PublishObjectVisualThumb'
import { getPublishObjectVisual } from './publish-object-visual'

/**
 * Workspace 发布配置。外层「发布」Tab 负责配置 / 历史切换，
 * 这里仅渲染配置表单和提交结果。
 *
 *  先确认发布产物对象，再按产物类型渲染字段。
 *    · AI 分身 / 小程序 → 应用场景开关列表（抖音APP / 抖音小花 两组）。
 *    · 其它产物 → 版本 / 渠道 / 环境 / 活动等表单字段。
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

export default function PublishDrawer({
  projectName,
  projectKey = projectName,
  projectKind,
  pageName = projectName,
  publishedVersionLabel,
  onConfirmPublish,
  onCancel,
}: {
  projectName: string
  projectKey?: string
  projectKind: ProjectKind
  pageName?: string
  publishedVersionLabel?: string
  onConfirmPublish?: () => void
  onCancel?: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)
  const [magicXOpen, setMagicXOpen] = useState(false)

  // AI 分身 / 小程序 share the application-scene toggle list.
  const isSceneKind = projectKind === 'ai-avatar' || projectKind === 'mini-program'

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

  const confirmPublish = () => {
    onConfirmPublish?.()
    setConfirmed(true)
  }

  const meta = KIND_META[projectKind]
  const objectVisual = getPublishObjectVisual(projectKind, projectKey, meta.icon)

  const renderSceneGroups = () => (
    <div className="space-y-3.5">
      {SCENE_GROUPS.map((group) => (
        <div key={group.platform}>
          <div className="mb-1.5 text-[11.5px] text-[var(--color-ink)]/45">{group.platform}</div>
          <div className="space-y-1">
            {group.scenes.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2.5 rounded-lg bg-[var(--fill-subtle)] px-3 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-[var(--color-ink)]">{s.title}</div>
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

  if (confirmed) {
    return (
      <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <CheckCircle2 size={44} className="text-emerald-500" strokeWidth={1.6} />
        <div className="text-[15px] font-semibold text-[var(--color-ink)]">
          已提交发布
        </div>
        <div className="text-[12.5px] leading-[1.6] text-[var(--color-ink)]/55">
          「{projectName}」已提交发布，可切换到「发布历史」查看。
        </div>
        <Button
          onClick={() => setConfirmed(false)}
          theme="solid"
          type="primary"
          size="small"
          className="mt-2"
        >
          返回发布配置
        </Button>
      </div>
    )
  }

  if (projectKind === 'marketing-h5') {
    return (
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[980px]">
          <section>
            <h2 className="mb-4 text-[16px] font-semibold text-[var(--color-ink)]">
              发布内容
            </h2>
            <div className="overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)]">
              <div className="flex items-center gap-3 border-b border-[var(--divider-soft)] bg-[var(--fill-subtle)] px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600">
                  <Megaphone size={22} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">
                    {projectName}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[var(--color-ink)]/45">
                    活动项目
                  </div>
                </div>
                <ChevronDown size={17} className="text-[var(--color-ink)]/38" />
              </div>
              <div className="flex items-center gap-3 px-7 py-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--fill-subtle)] text-[var(--color-ink)]/55">
                  <Smartphone size={20} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">
                    {pageName}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[var(--color-ink)]/45">
                    H5 页面
                  </div>
                </div>
                {publishedVersionLabel && (
                  <div className="shrink-0 text-right">
                    <div className="text-[10.5px] text-[var(--color-ink)]/38">
                      已发布版本
                    </div>
                    <div className="mt-1 rounded bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
                      {publishedVersionLabel}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-7">
            <h2 className="mb-4 text-[16px] font-semibold text-[var(--color-ink)]">
              发布渠道
            </h2>
            <div className="overflow-hidden rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)]">
              <div className="px-5 pb-2 pt-4 text-[13px] font-semibold text-[var(--color-ink)]">
                抖音 AI 平台
              </div>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[var(--fill-subtle)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--divider-soft)] bg-white text-[var(--color-ink)]">
                  <LayoutGrid size={20} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[var(--color-ink)]">
                    抖音 AI 工作台
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-[var(--color-ink)]/45">
                    发布为对话应用或上架创意广场
                  </span>
                </span>
                <span className="rounded bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
                  已发布
                </span>
                <ChevronRight size={17} className="text-[var(--color-ink)]/35" />
              </button>

              <div className="mx-5 border-t border-[var(--divider-soft)]" />
              <div className="px-5 pb-2 pt-4 text-[13px] font-semibold text-[var(--color-ink)]">
                MagicX
              </div>
              <button
                type="button"
                aria-expanded={magicXOpen}
                onClick={() => setMagicXOpen((open) => !open)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[var(--fill-subtle)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-violet-500/15 bg-violet-500/[0.06] text-violet-600">
                  <Sparkles size={20} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[var(--color-ink)]">
                    发布到抖音投放端
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-[var(--color-ink)]/45">
                    将 H5 页面发布至抖音直播端、非直播端
                  </span>
                </span>
                <span className="rounded bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700">
                  待发布
                </span>
                {magicXOpen ? (
                  <ChevronDown size={17} className="text-[var(--color-ink)]/35" />
                ) : (
                  <ChevronRight size={17} className="text-[var(--color-ink)]/35" />
                )}
              </button>

              {magicXOpen && (
                <div className="border-t border-[var(--divider-soft)] bg-[var(--fill-subtle)] px-5 py-5">
                  {renderFields()}
                  <div className="mt-6 flex items-center justify-end gap-2">
                    <Button
                      onClick={() => setMagicXOpen(false)}
                      theme="light"
                      type="tertiary"
                      size="small"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={confirmPublish}
                      theme="solid"
                      type="primary"
                      size="small"
                    >
                      确认发布
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="mb-5">
          <div className="mb-2 text-[12px] font-medium text-[var(--color-ink)]/55">
            发布产物
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] px-4 py-3">
            <PublishObjectVisualThumb visual={objectVisual} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-[var(--color-ink)]">
                {projectName}
              </div>
              <div className="truncate text-[11.5px] text-[var(--color-ink)]/50">
                {meta.label} · {meta.objectHint}
              </div>
            </div>
            <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
              <Check size={11} strokeWidth={2.6} />
              待发布
            </span>
          </div>
        </div>

        {isSceneKind && (
          <div className="mb-2 text-[12px] text-[var(--color-ink)]/45">应用场景</div>
        )}
        {renderFields()}

        <footer className="mt-8 flex items-center justify-end gap-2 border-t border-[var(--divider-soft)] pt-4">
          <Button
            onClick={onCancel}
            theme="light"
            type="tertiary"
            size="small"
          >
            取消
          </Button>
          <Button
            onClick={confirmPublish}
            theme="solid"
            type="primary"
            size="small"
          >
            确认发布
          </Button>
        </footer>
      </div>
    </div>
  )
}

/* ─── small form primitives ─── */

/** macOS-style toggle — compact (31×19), green when on, knob slides. */
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors duration-200 ${
        on ? 'bg-[#34c759]' : 'bg-[var(--color-ink)]/20'
      }`}
    >
      <span
        className={`absolute top-[1.5px] h-[15px] w-[15px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-200 ${
          on ? 'left-[13px]' : 'left-[1.5px]'
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
