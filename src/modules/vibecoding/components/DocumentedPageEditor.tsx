import { useState } from 'react'
import { toast } from 'sonner'
import {
  Box,
  Gamepad2,
  Layers,
  RotateCcw,
  Save,
  Settings,
  Type,
} from '@/shared/icons'
import type { DocumentedActivityCase, DocumentedActivityDeliverable } from './DocumentedActivityData'
import {
  PAGE_EDITOR_NODES,
  pageEditorBreadcrumb,
  pageEditorNode,
  pageRuntimeLabel,
  type DocumentedPageEditorState,
  type PageEditorSelectionId,
} from './DocumentedPageEditorState'

const INPUT_CLASS = 'h-8 w-full rounded-lg border border-black/[0.09] bg-white px-2.5 text-[10px] text-[#161823] outline-none focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10'

function ToggleRow({
  label,
  detail,
  enabled,
  onToggle,
}: {
  label: string
  detail: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button type="button" aria-pressed={enabled} onClick={onToggle} className="flex w-full items-center gap-3 rounded-xl border border-black/[0.07] px-3 py-3 text-left hover:border-black/[0.12]">
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium text-[#161823]">{label}</span>
        <span className="mt-0.5 block text-[8px] leading-[13px] text-[#161823]/34">{detail}</span>
      </span>
      <span className={`h-4 w-7 shrink-0 rounded-full p-0.5 transition-colors ${enabled ? 'bg-[#3370FF]' : 'bg-[#C9CBD0]'}`}>
        <i className={`block size-3 rounded-full bg-white transition-transform ${enabled ? 'translate-x-3' : ''}`} />
      </span>
    </button>
  )
}

export default function DocumentedPageEditor({
  activityCase,
  item,
  value,
  selection,
  onSelectionChange,
  onChange,
  onReset,
}: {
  activityCase: DocumentedActivityCase
  item: DocumentedActivityDeliverable
  value: DocumentedPageEditorState
  selection: PageEditorSelectionId
  onSelectionChange: (selection: PageEditorSelectionId) => void
  onChange: (value: DocumentedPageEditorState) => void
  onReset: () => void
}) {
  const [tab, setTab] = useState<'properties' | 'layers' | 'page'>(selection === 'page' ? 'page' : 'properties')
  const update = (patch: Partial<DocumentedPageEditorState>) => onChange({ ...value, ...patch })
  const updateSurface = (patch: Partial<DocumentedPageEditorState['surface']>) =>
    update({ surface: { ...value.surface, ...patch } })
  const selectedNode = pageEditorNode(selection)
  const breadcrumb = pageEditorBreadcrumb(selection)
  const runtimeLabel = pageRuntimeLabel(value.surface.kind)
  const selectedRegion = selectedNode.regionId

  const setRegionVisible = (visible: boolean) => {
    if (!selectedRegion) return
    update({ elements: { ...value.elements, [selectedRegion]: visible } })
  }

  const renderFieldEditor = () => {
    if (selectedNode.field === 'title') {
      return (
        <div>
          <div className="flex items-center justify-between"><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-title">主标题</label><span className="text-[8px] tabular-nums text-[#161823]/28">{value.title.length}/20</span></div>
          <input id="page-editor-title" autoFocus maxLength={20} value={value.title} onChange={(event) => update({ title: event.target.value })} className={`${INPUT_CLASS} mt-1.5`} />
        </div>
      )
    }
    if (selectedNode.field === 'subtitle') {
      return (
        <div>
          <div className="flex items-center justify-between"><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-subtitle">副标题</label><span className="text-[8px] tabular-nums text-[#161823]/28">{value.subtitle.length}/48</span></div>
          <textarea id="page-editor-subtitle" autoFocus maxLength={48} value={value.subtitle} onChange={(event) => update({ subtitle: event.target.value })} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-black/[0.09] bg-white px-2.5 py-2 text-[10px] leading-4 text-[#161823] outline-none focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10" />
        </div>
      )
    }
    if (selectedNode.field === 'cta') {
      return (
        <div>
          <div className="flex items-center justify-between"><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-cta">主要按钮</label><span className="text-[8px] tabular-nums text-[#161823]/28">{value.cta.length}/12</span></div>
          <input id="page-editor-cta" autoFocus maxLength={12} value={value.cta} onChange={(event) => update({ cta: event.target.value })} className={`${INPUT_CLASS} mt-1.5`} />
        </div>
      )
    }
    return null
  }

  return (
    <aside aria-label="页面编辑器" className="flex min-h-0 w-[296px] shrink-0 flex-col border-l border-black/[0.08] bg-white">
      <div className="shrink-0 border-b border-black/[0.07] px-4 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#161823]">{runtimeLabel} 页面编辑器</p>
            <p className="mt-0.5 truncate text-[8px] text-[#161823]/34">{item.label} · 当前页面草稿</p>
          </div>
          <button type="button" onClick={onReset} className="grid size-7 place-items-center rounded-lg text-[#161823]/42 hover:bg-[#F2F3F5] hover:text-[#161823]" aria-label="重置页面编辑"><RotateCcw className="size-3.5" /></button>
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-1 text-[8px] text-[#161823]/34" aria-label="当前选中对象路径">
          {breadcrumb.map((label, index) => (
            <span key={label} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <span className="text-[#161823]/18">/</span> : null}
              <span className={index === breadcrumb.length - 1 ? 'truncate font-medium text-[#175CD3]' : 'truncate'}>{label}</span>
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 rounded-lg bg-[#F2F3F5] p-1">
          {([
            ['properties', '属性', Settings],
            ['layers', '图层', Layers],
            ['page', '页面', Gamepad2],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`flex h-7 items-center justify-center gap-1 rounded-md text-[9px] font-medium ${tab === id ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/44 hover:text-[#161823]'}`}><Icon className="size-3" />{label}</button>
          ))}
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === 'properties' ? (
          <div className="space-y-4">
            <section className="rounded-xl border border-[#3370FF]/18 bg-[#F5F8FF] px-3 py-2.5">
              <div className="flex items-center gap-2">
                {selectedNode.kind === 'text' ? <Type className="size-3.5 text-[#3370FF]" /> : selectedNode.kind === 'action' ? <Box className="size-3.5 text-[#3370FF]" /> : <Layers className="size-3.5 text-[#3370FF]" />}
                <p className="text-[10px] font-semibold text-[#175CD3]">{selectedNode.label}</p>
              </div>
              <p className="mt-1 text-[8px] leading-[13px] text-[#175CD3]/58">{selectedNode.detail}</p>
            </section>

            {renderFieldEditor()}

            {selection === 'hero' ? (
              <div className="space-y-3">
                <button type="button" onClick={() => onSelectionChange('title')} className="flex w-full items-center justify-between rounded-lg border border-black/[0.07] px-3 py-2.5 text-left"><span><span className="block text-[9px] font-medium">主标题</span><span className="mt-0.5 block max-w-[210px] truncate text-[8px] text-[#161823]/36">{value.title}</span></span><Type className="size-3.5 text-[#161823]/28" /></button>
                <button type="button" onClick={() => onSelectionChange('subtitle')} className="flex w-full items-center justify-between rounded-lg border border-black/[0.07] px-3 py-2.5 text-left"><span><span className="block text-[9px] font-medium">副标题</span><span className="mt-0.5 block max-w-[210px] truncate text-[8px] text-[#161823]/36">{value.subtitle}</span></span><Type className="size-3.5 text-[#161823]/28" /></button>
                <button type="button" onClick={() => onSelectionChange('primaryAction')} className="flex w-full items-center justify-between rounded-lg border border-black/[0.07] px-3 py-2.5 text-left"><span><span className="block text-[9px] font-medium">主要按钮</span><span className="mt-0.5 block max-w-[210px] truncate text-[8px] text-[#161823]/36">{value.cta}</span></span><Box className="size-3.5 text-[#161823]/28" /></button>
              </div>
            ) : null}

            {selection === 'navigation' ? (
              <ToggleRow label="导航吸顶" detail="页面滚动时保留当前会场与主要入口" enabled={value.surface.stickyNavigation} onToggle={() => updateSurface({ stickyNavigation: !value.surface.stickyNavigation })} />
            ) : null}

            {selection === 'content' ? (
              <div><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-gameplay-inline">内容绑定</label><input id="page-editor-gameplay-inline" value={value.gameplay.packageName} onChange={(event) => update({ gameplay: { ...value.gameplay, packageName: event.target.value } })} className={`${INPUT_CLASS} mt-1.5`} /></div>
            ) : null}

            {selection === 'footer' ? (
              <div className="space-y-2">
                <ToggleRow label="展示任务模块" detail="控制任务入口、进度与任务列表" enabled={value.gameplay.taskEnabled} onToggle={() => update({ gameplay: { ...value.gameplay, taskEnabled: !value.gameplay.taskEnabled } })} />
                <ToggleRow label="开启分享回流" detail="控制分享动作和回流入口" enabled={value.gameplay.shareEnabled} onToggle={() => update({ gameplay: { ...value.gameplay, shareEnabled: !value.gameplay.shareEnabled } })} />
              </div>
            ) : null}

            {selectedRegion ? (
              <ToggleRow label={`显示${pageEditorNode(selectedRegion).label}`} detail="隐藏后该区域不会参与当前页面渲染" enabled={value.elements[selectedRegion]} onToggle={() => setRegionVisible(!value.elements[selectedRegion])} />
            ) : null}

            <p className="rounded-lg bg-[#F6F7F8] px-3 py-2.5 text-[8px] leading-[14px] text-[#161823]/38">画布和图层树共用同一个选择状态；修改只作用于当前 {runtimeLabel} 页面草稿。</p>
          </div>
        ) : null}

        {tab === 'layers' ? (
          <div>
            <div className="rounded-xl bg-[#F6F7F8] px-3 py-2.5 text-[8px] leading-[13px] text-[#161823]/42">点击图层或画布中的真实节点，右侧属性会同步切换。页面保持结构化布局，不把响应式组件强制改成绝对定位。</div>
            <div className="mt-3 space-y-1" role="tree" aria-label="页面图层树">
              {PAGE_EDITOR_NODES.map((node) => {
                const active = node.id === selection
                const hidden = node.regionId ? !value.elements[node.regionId] : false
                const depth = node.parentId === null ? 0 : node.parentId === 'page' ? 1 : 2
                const Icon = node.kind === 'text' ? Type : node.kind === 'action' ? Box : Layers
                return (
                  <button
                    key={node.id}
                    type="button"
                    role="treeitem"
                    aria-selected={active}
                    onClick={() => onSelectionChange(node.id)}
                    className={`flex h-9 w-full items-center gap-2 rounded-lg pr-2 text-left transition-colors ${active ? 'bg-[#EAF2FF] text-[#175CD3]' : hidden ? 'text-[#161823]/24' : 'text-[#161823]/58 hover:bg-[#F4F5F6] hover:text-[#161823]'}`}
                    style={{ paddingLeft: 8 + depth * 14 }}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-[9px] font-medium">{node.label}</span>
                    {hidden ? <span className="text-[7px]">已隐藏</span> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {tab === 'page' ? (
          <div className="space-y-4">
            <section className="rounded-xl border border-black/[0.07] p-3">
              <div className="flex items-center justify-between"><span className="text-[9px] font-medium text-[#161823]/56">运行容器</span><span className="rounded bg-[#EEF4FF] px-1.5 py-0.5 text-[8px] font-medium text-[#175CD3]">{runtimeLabel}</span></div>
              <p className="mt-2 truncate font-mono text-[8px] text-[#161823]/34">{value.surface.route}</p>
            </section>
            <div><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-route">页面路由</label><input id="page-editor-route" value={value.surface.route} onChange={(event) => updateSurface({ route: event.target.value })} className={`${INPUT_CLASS} mt-1.5 font-mono text-[8px]`} /></div>
            {value.surface.kind === 'h5' ? (
              <>
                <ToggleRow label="响应式布局" detail="在约定移动端宽度内按结构重新排布" enabled={value.surface.responsiveLayout} onToggle={() => updateSurface({ responsiveLayout: !value.surface.responsiveLayout })} />
                <div><div className="flex items-center justify-between text-[9px] text-[#161823]/52"><label htmlFor="page-editor-width">移动端预览宽度</label><span className="font-medium tabular-nums">{value.deviceWidth}px</span></div><input id="page-editor-width" type="range" min="360" max="430" step="10" value={value.deviceWidth} onChange={(event) => update({ deviceWidth: Number(event.target.value) })} className="mt-2 w-full accent-[#3370FF]" /></div>
              </>
            ) : (
              <section className="space-y-3 rounded-xl border border-black/[0.07] p-3">
                <p className="text-[9px] font-medium text-[#161823]/58">Lynx 端容器</p>
                <label className="block"><span className="text-[8px] text-[#161823]/42">DuxTitleBar</span><select value={value.surface.titleBar} onChange={(event) => updateSurface({ titleBar: event.target.value as DocumentedPageEditorState['surface']['titleBar'] })} className={`${INPUT_CLASS} mt-1.5`}><option value="standard">标准标题栏</option><option value="transparent">透明标题栏</option><option value="hidden">隐藏标题栏</option></select></label>
                <label className="block"><span className="text-[8px] text-[#161823]/42">返回策略</span><select value={value.surface.backBehavior} onChange={(event) => updateSurface({ backBehavior: event.target.value as DocumentedPageEditorState['surface']['backBehavior'] })} className={`${INPUT_CLASS} mt-1.5`}><option value="close">关闭当前容器</option><option value="history">返回上一页</option><option value="route">跳转指定业务目标</option></select></label>
                <ToggleRow label="适配系统安全区" detail="保护状态栏、标题栏与底部手势区" enabled={value.surface.safeArea} onToggle={() => updateSurface({ safeArea: !value.surface.safeArea })} />
              </section>
            )}
            <div><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-gameplay">当前玩法组合</label><input id="page-editor-gameplay" value={value.gameplay.packageName} onChange={(event) => update({ gameplay: { ...value.gameplay, packageName: event.target.value } })} className={`${INPUT_CLASS} mt-1.5`} /></div>
            <div><div className="flex items-center justify-between text-[9px] text-[#161823]/52"><label htmlFor="page-editor-limit">每日参与上限</label><span>{value.gameplay.dailyLimit} 次</span></div><input id="page-editor-limit" type="range" min="1" max="10" value={value.gameplay.dailyLimit} onChange={(event) => update({ gameplay: { ...value.gameplay, dailyLimit: Number(event.target.value) } })} className="mt-2 w-full accent-[#3370FF]" /></div>
            <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-[8px] leading-[14px] text-amber-800/68">概率、库存、频控和履约仍是待接业务数据；这里不伪造成已接入。</p>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-black/[0.07] p-3">
        <button type="button" onClick={() => toast.success('已保存到当前页面草稿', { description: `${activityCase.shortName} · ${item.id}` })} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#161823] text-[10px] font-medium text-white hover:bg-[#2C2D35]"><Save className="size-3.5" />保存页面草稿</button>
      </div>
    </aside>
  )
}
