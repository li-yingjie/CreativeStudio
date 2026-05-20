import { useState } from 'react'
import {
  X,
  Palette,
  Settings,
  Layers,
  Sparkles,
  SquareUser,
  ScrollText,
  LayoutGrid,
  FileText,
  Save,
  RefreshCw,
  type LucideIcon,
} from '@/shared/icons'
import type { ProjectKind } from './ProjectProductView'

/**
 * 通用可视化编辑面板 — 非游戏类产物（小程序 / AI 分身 / 网站 / 营销 H5 /
 * 运营提案）的「编辑」入口。每种产物给出不同的可视化编辑分区（配置由
 * EDIT_CONFIG 驱动）。全部本地状态，仅作「我能怎么改它」的演示入口。
 * 游戏类仍走 GarudaEditPanel。
 */

const THEME_COLORS = [
  { id: 'violet', label: '梦幻紫', color: '#7c5cff' },
  { id: 'blue', label: '科技蓝', color: '#3478ff' },
  { id: 'rose', label: '活力粉', color: '#ff4d8d' },
  { id: 'green', label: '清新绿', color: '#22c55e' },
  { id: 'amber', label: '暖阳橙', color: '#f59e0b' },
  { id: 'slate', label: '高级灰', color: '#475569' },
]

type Control =
  | { type: 'swatches'; key: string; label: string; default: string }
  | { type: 'slider'; key: string; label: string; min: number; max: number; step?: number; unit?: string; default: number }
  | { type: 'toggle'; key: string; label: string; hint?: string; default: boolean }
  | { type: 'chips'; key: string; label: string; options: { id: string; label: string }[]; default: string }
  | { type: 'text'; key: string; label: string; placeholder?: string; default: string }
  | { type: 'textarea'; key: string; label: string; placeholder?: string; default: string }
  | { type: 'avatar'; key: string; label: string; default: string }

type EditGroup = { title: string; icon: LucideIcon; controls: Control[] }
type EditSection = { id: string; label: string; icon: LucideIcon; groups: EditGroup[] }

const appearanceGroup: EditGroup = {
  title: '主题外观',
  icon: Palette,
  controls: [
    { type: 'swatches', key: 'theme', label: '主题色', default: 'violet' },
    { type: 'slider', key: 'radius', label: '圆角', min: 0, max: 24, unit: 'px', default: 12 },
    { type: 'slider', key: 'fontScale', label: '字号', min: 80, max: 120, unit: '%', default: 100 },
    { type: 'toggle', key: 'dark', label: '暗色模式', hint: '跟随产物主题', default: false },
  ],
}

const EDIT_CONFIG: Partial<Record<ProjectKind, EditSection[]>> = {
  'mini-program': [
    { id: 'look', label: '外观', icon: Palette, groups: [appearanceGroup] },
    {
      id: 'feature',
      label: '功能',
      icon: Settings,
      groups: [
        {
          title: '页面能力',
          icon: Layers,
          controls: [
            { type: 'toggle', key: 'search', label: '顶部搜索', default: true },
            { type: 'toggle', key: 'tabbar', label: '底部 Tab 栏', default: true },
            { type: 'toggle', key: 'checkin', label: '每日签到', default: false },
            { type: 'toggle', key: 'share', label: '分享按钮', default: true },
          ],
        },
      ],
    },
  ],
  'ai-avatar': [
    {
      id: 'basic',
      label: '基础信息',
      icon: SquareUser,
      groups: [
        {
          title: '基础信息',
          icon: SquareUser,
          controls: [
            { type: 'avatar', key: 'avatar', label: '头像', default: '' },
            { type: 'text', key: 'name', label: '分身名称', placeholder: '给你的 AI 分身起个名字', default: '' },
            { type: 'textarea', key: 'desc', label: '描述', placeholder: '一句话介绍这个分身是做什么的', default: '' },
          ],
        },
      ],
    },
    {
      id: 'persona',
      label: '人设',
      icon: ScrollText,
      groups: [
        {
          title: '语气风格',
          icon: ScrollText,
          controls: [
            { type: 'slider', key: 'tone', label: '语气（严肃 ↔ 活泼）', min: 0, max: 100, default: 60 },
            { type: 'slider', key: 'length', label: '回复长度（简洁 ↔ 详细）', min: 0, max: 100, default: 50 },
            { type: 'toggle', key: 'emoji', label: '使用 Emoji', default: true },
          ],
        },
      ],
    },
    {
      id: 'ability',
      label: '能力',
      icon: Sparkles,
      groups: [
        {
          title: '调用能力',
          icon: Sparkles,
          controls: [
            { type: 'toggle', key: 'kb', label: '知识库检索', hint: '回答时引用知识库', default: true },
            { type: 'toggle', key: 'skill', label: '技能调用', default: true },
            { type: 'toggle', key: 'recommend', label: '主动推荐内容', default: false },
          ],
        },
      ],
    },
  ],
  'web-app': [
    { id: 'look', label: '外观', icon: Palette, groups: [appearanceGroup] },
    {
      id: 'layout',
      label: '布局',
      icon: LayoutGrid,
      groups: [
        {
          title: '布局风格',
          icon: LayoutGrid,
          controls: [
            { type: 'slider', key: 'density', label: '内容密度', min: 0, max: 100, default: 50 },
            {
              type: 'chips',
              key: 'nav',
              label: '导航样式',
              options: [
                { id: 'top', label: '顶部导航' },
                { id: 'side', label: '侧边导航' },
              ],
              default: 'top',
            },
          ],
        },
      ],
    },
  ],
  'marketing-h5': [
    {
      id: 'color',
      label: '配色',
      icon: Palette,
      groups: [
        {
          title: '主题配色',
          icon: Palette,
          controls: [
            { type: 'swatches', key: 'theme', label: '主题色', default: 'rose' },
            { type: 'slider', key: 'gradient', label: '渐变强度', min: 0, max: 100, default: 60 },
          ],
        },
      ],
    },
    {
      id: 'floors',
      label: '楼层',
      icon: Layers,
      groups: [
        {
          title: '页面楼层',
          icon: Layers,
          controls: [
            { type: 'toggle', key: 'timer', label: '倒计时', default: true },
            { type: 'toggle', key: 'prize', label: '奖品楼层', default: true },
            { type: 'toggle', key: 'howto', label: '参与方式', default: true },
            { type: 'toggle', key: 'rule', label: '活动规则', default: true },
          ],
        },
      ],
    },
    {
      id: 'copy',
      label: '文案',
      icon: FileText,
      groups: [
        {
          title: '关键文案',
          icon: FileText,
          controls: [
            { type: 'text', key: 'title', label: '主标题', placeholder: '六一童趣节，好礼送不停', default: '' },
            { type: 'text', key: 'cta', label: '按钮文案', placeholder: '立即参与', default: '' },
          ],
        },
      ],
    },
  ],
  'ops-proposal': [
    {
      id: 'template',
      label: '模板',
      icon: LayoutGrid,
      groups: [
        {
          title: '提案模板',
          icon: LayoutGrid,
          controls: [
            {
              type: 'chips',
              key: 'template',
              label: '模板风格',
              options: [
                { id: 'minimal', label: '简约' },
                { id: 'business', label: '商务' },
                { id: 'vivid', label: '活力' },
              ],
              default: 'business',
            },
            { type: 'swatches', key: 'theme', label: '主题色', default: 'blue' },
          ],
        },
      ],
    },
    {
      id: 'modules',
      label: '模块',
      icon: Layers,
      groups: [
        {
          title: '提案模块',
          icon: Layers,
          controls: [
            { type: 'toggle', key: 'diagnosis', label: '人群诊断', default: true },
            { type: 'toggle', key: 'pack', label: '达人包', default: true },
            { type: 'toggle', key: 'report', label: '提案报告', default: true },
            { type: 'toggle', key: 'dashboard', label: '数据看板', default: true },
          ],
        },
      ],
    },
  ],
}

function fallbackSections(): EditSection[] {
  return [{ id: 'look', label: '外观', icon: Palette, groups: [appearanceGroup] }]
}

export default function ProductEditPanel({
  kind,
  projectName,
  onClose,
  prefill,
}: {
  kind: ProjectKind
  projectName: string
  onClose: () => void
  /** Seed real values into matching control keys (e.g. an AI 分身's
   *  头像 / 名称 / 描述) so the panel reflects the actual product. */
  prefill?: Record<string, string | number | boolean>
}) {
  const sections = EDIT_CONFIG[kind] ?? fallbackSections()
  // No section tabs — every group from every section is flattened into one
  // scrolling list so the common controls read top-to-bottom.
  const groups = sections.flatMap((s) => s.groups)
  const [values, setValues] = useState<Record<string, string | number | boolean>>(() => {
    const v: Record<string, string | number | boolean> = {}
    for (const g of groups)
      for (const c of g.controls) v[c.key] = c.type === 'text' && !c.default ? projectName ?? '' : c.default
    if (prefill)
      for (const k of Object.keys(prefill)) if (k in v) v[k] = prefill[k]
    return v
  })
  const set = (k: string, val: string | number | boolean) =>
    setValues((p) => ({ ...p, [k]: val }))

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">编辑</span>
        <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/40">{projectName}</span>
        <button
          type="button"
          onClick={onClose}
          title="关闭"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Body — all groups flattened into one scroll (no section tabs) */}
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-5">
          {groups.map((g) => {
            const GIcon = g.icon
            return (
              <section key={g.title}>
                <div className="mb-2 flex items-center gap-1.5">
                  <GIcon size={12} strokeWidth={1.8} className="text-[var(--color-ink)]/55" />
                  <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink)]/65">
                    {g.title}
                  </h3>
                </div>
                <div className="space-y-3.5">
                  {g.controls.map((c) => (
                    <Control key={c.key} control={c} value={values[c.key]} onChange={(v) => set(c.key, v)} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">配置仅本地预览</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <RefreshCw size={11} strokeWidth={1.8} />
            重置
          </button>
          <button
            type="button"
            className="flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
          >
            <Save size={11} strokeWidth={2} />
            应用
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── control renderer ─── */

function Control({
  control,
  value,
  onChange,
}: {
  control: Control
  value: string | number | boolean
  onChange: (v: string | number | boolean) => void
}) {
  if (control.type === 'swatches') {
    return (
      <div>
        <div className="mb-1.5 text-[12px] text-[var(--color-ink)]/80">{control.label}</div>
        <div className="flex flex-wrap gap-2">
          {THEME_COLORS.map((c) => {
            const on = value === c.id
            return (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() => onChange(c.id)}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${
                  on ? 'scale-110 border-[var(--color-ink)]/40' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.color }}
              />
            )
          })}
        </div>
      </div>
    )
  }
  if (control.type === 'slider') {
    return (
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[12px] text-[var(--color-ink)]/80">{control.label}</span>
          <span className="font-mono text-[11px] text-[var(--color-ink)]/55">
            {value}
            {control.unit ?? ''}
          </span>
        </div>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={Number(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--fill-subtle)] accent-[var(--color-ink)]"
        />
      </div>
    )
  }
  if (control.type === 'toggle') {
    const on = Boolean(value)
    return (
      <button
        type="button"
        onClick={() => onChange(!on)}
        className="flex w-full items-center gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[12px] text-[var(--color-ink)]/85">{control.label}</div>
          {control.hint && <div className="text-[10.5px] text-[var(--color-ink)]/45">{control.hint}</div>}
        </div>
        <span
          className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
            on ? 'bg-[#3478ff]' : 'bg-[var(--color-ink)]/20'
          }`}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
              on ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>
    )
  }
  if (control.type === 'chips') {
    return (
      <div>
        <div className="mb-1.5 text-[12px] text-[var(--color-ink)]/80">{control.label}</div>
        <div className="flex flex-wrap gap-2">
          {control.options.map((o) => {
            const on = value === o.id
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onChange(o.id)}
                className={`rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${
                  on
                    ? 'border-[var(--color-ink)]/30 bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]'
                    : 'border-[var(--divider-soft)] text-[var(--color-ink)]/55 hover:border-[var(--color-ink)]/15'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
  if (control.type === 'avatar') {
    const url = String(value || '')
    return (
      <div>
        <div className="mb-1.5 text-[12px] text-[var(--color-ink)]/80">{control.label}</div>
        <div className="flex items-center gap-3">
          {url ? (
            <img
              src={url}
              alt=""
              className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-[var(--divider)]"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--fill-subtle)] text-[var(--color-ink)]/30">
              <SquareUser size={20} strokeWidth={1.6} />
            </div>
          )}
          <input
            value={url}
            placeholder="图片地址"
            onChange={(e) => onChange(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
          />
        </div>
      </div>
    )
  }
  if (control.type === 'textarea') {
    return (
      <div>
        <div className="mb-1.5 text-[12px] text-[var(--color-ink)]/80">{control.label}</div>
        <textarea
          value={String(value)}
          placeholder={control.placeholder}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
        />
      </div>
    )
  }
  // text
  return (
    <div>
      <div className="mb-1.5 text-[12px] text-[var(--color-ink)]/80">{control.label}</div>
      <input
        value={String(value)}
        placeholder={control.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
      />
    </div>
  )
}
