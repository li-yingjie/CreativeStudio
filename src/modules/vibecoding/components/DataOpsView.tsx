import { memo, useEffect, useState } from 'react'
import {
  SquareUser,
  LayoutGrid,
  Globe,
  Gamepad2,
  Megaphone,
  type LucideIcon,
} from '@/shared/icons'
import type { ProjectKind } from './ProjectProductView'
import OpsDataDashboard from './OpsDataContent'
import {
  getPublishObjectVisual,
  PublishObjectVisualThumb,
} from './PublishDrawer'

/**
 * 运营数据菜单页 — 左侧「已发布的项目」列表，右侧复用 OpsDataDashboard
 * （与「运营数据」抽屉同款样式：运营数据 / 用户画像 / 性能数据三个 Tab）。
 */

export interface DataOpsProject {
  name: string
  label: string
  kind: ProjectKind
}

const KIND_ICON: Record<ProjectKind, LucideIcon> = {
  'mini-program': LayoutGrid,
  'ai-avatar': SquareUser,
  'web-app': Globe,
  'web-game': Gamepad2,
  'marketing-h5': Megaphone,
  'ops-proposal': LayoutGrid,
}

const KIND_LABEL: Record<ProjectKind, string> = {
  'mini-program': '小程序',
  'ai-avatar': 'AI 分身',
  'web-app': '网站',
  'web-game': '小游戏',
  'marketing-h5': '营销 H5',
  'ops-proposal': '运营提案',
}

function DataOpsView({
  projects,
  focusName,
}: {
  projects: DataOpsProject[]
  /** Pre-select this project (the one the user jumped in from). */
  focusName?: string | null
}) {
  const [activeName, setActiveName] = useState(
    focusName && projects.some((p) => p.name === focusName)
      ? focusName
      : projects[0]?.name ?? '',
  )
  // Follow the focus target when the user re-enters via「查看完整数据」.
  useEffect(() => {
    if (focusName && projects.some((p) => p.name === focusName)) {
      setActiveName(focusName)
    }
  }, [focusName, projects])
  const active = projects.find((p) => p.name === activeName) ?? projects[0]

  if (!active) {
    return (
      <div className="grid h-full place-items-center text-[13px] text-[var(--color-ink)]/40">
        暂无已发布的项目
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-[var(--color-surface-0)]">
      {/* ── Left: published project list ── */}
      <aside className="flex w-[230px] shrink-0 flex-col border-r border-[var(--divider-soft)]">
        <div className="shrink-0 px-4 pt-4 pb-2">
          <h2 className="text-[13px] font-semibold text-[var(--color-ink)]">已发布项目</h2>
          <p className="mt-0.5 text-[11px] text-[var(--color-ink)]/45">{projects.length} 个已上线</p>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {projects.map((p) => {
            const on = p.name === activeName
            // Published projects show their real产物 icon — same visual as the
            // 发布 drawer (avatar/logo/cover image, or kind badge fallback).
            const visual = getPublishObjectVisual(p.kind, p.name, KIND_ICON[p.kind])
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setActiveName(p.name)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  on ? 'bg-[var(--color-ink)]/[0.07]' : 'hover:bg-[var(--fill-hover)]'
                }`}
              >
                <PublishObjectVisualThumb visual={visual} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[12.5px] ${on ? 'font-medium text-[var(--color-ink)]' : 'text-[var(--color-ink)]/80'}`}>
                    {p.label}
                  </span>
                  <span className="block text-[10.5px] text-[var(--color-ink)]/40">{KIND_LABEL[p.kind]}</span>
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Right: shared dashboard (keyed so state resets per project) ── */}
      <OpsDataDashboard key={active.name} projectName={active.label} />
    </div>
  )
}

export default memo(DataOpsView)
