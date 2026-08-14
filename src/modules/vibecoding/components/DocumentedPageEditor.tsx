import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, Gamepad2, Layers, RotateCcw, Save, Type } from '@/shared/icons'
import type { DocumentedActivityCase, DocumentedActivityDeliverable } from './DocumentedActivityData'
import type { DocumentedPageEditorState, PageEditorElementId } from './DocumentedPageEditorState'

const INPUT_CLASS = 'h-8 w-full rounded-lg border border-black/[0.09] bg-white px-2.5 text-[10px] text-[#161823] outline-none focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10'

export default function DocumentedPageEditor({
  activityCase,
  item,
  value,
  onChange,
  onReset,
}: {
  activityCase: DocumentedActivityCase
  item: DocumentedActivityDeliverable
  value: DocumentedPageEditorState
  onChange: (value: DocumentedPageEditorState) => void
  onReset: () => void
}) {
  const [tab, setTab] = useState<'text' | 'elements' | 'gameplay'>('text')
  const update = (patch: Partial<DocumentedPageEditorState>) => onChange({ ...value, ...patch })
  const elementRows: readonly { id: PageEditorElementId; label: string; detail: string }[] = [
    { id: 'hero', label: '主视觉区', detail: '活动标题、时间和核心画面' },
    { id: 'navigation', label: '导航与入口', detail: '会场切换、频道或页面 Tab' },
    { id: 'content', label: '核心内容区', detail: '榜单、节目、卡池或内容列表' },
    { id: 'footer', label: '任务与回流区', detail: '任务、规则、分享和页尾信息' },
  ]

  return (
    <aside aria-label="页面编辑器" className="flex min-h-0 w-[296px] shrink-0 flex-col border-l border-black/[0.08] bg-white">
      <div className="shrink-0 border-b border-black/[0.07] px-4 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><p className="text-[12px] font-semibold text-[#161823]">页面编辑器</p><p className="mt-0.5 truncate text-[8px] text-[#161823]/34">{item.label} · 实时预览</p></div>
          <button type="button" onClick={onReset} className="grid size-7 place-items-center rounded-lg text-[#161823]/42 hover:bg-[#F2F3F5] hover:text-[#161823]" aria-label="重置页面编辑"><RotateCcw className="size-3.5" /></button>
        </div>
        <div className="mt-3 grid grid-cols-3 rounded-lg bg-[#F2F3F5] p-1">
          {([
            ['text', '文字', Type],
            ['elements', '元素', Layers],
            ['gameplay', '玩法', Gamepad2],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`flex h-7 items-center justify-center gap-1 rounded-md text-[9px] font-medium ${tab === id ? 'bg-white text-[#161823] shadow-sm' : 'text-[#161823]/44 hover:text-[#161823]'}`}><Icon className="size-3" />{label}</button>
          ))}
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === 'text' ? (
          <div className="space-y-4">
            <div><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-title">主标题</label><input id="page-editor-title" value={value.title} onChange={(event) => update({ title: event.target.value })} className={`${INPUT_CLASS} mt-1.5`} /></div>
            <div><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-subtitle">副标题</label><textarea id="page-editor-subtitle" value={value.subtitle} onChange={(event) => update({ subtitle: event.target.value })} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-black/[0.09] bg-white px-2.5 py-2 text-[10px] leading-4 text-[#161823] outline-none focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10" /></div>
            <div><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-cta">主要按钮</label><input id="page-editor-cta" value={value.cta} onChange={(event) => update({ cta: event.target.value })} className={`${INPUT_CLASS} mt-1.5`} /></div>
            <p className="rounded-lg bg-[#F6F7F8] px-3 py-2.5 text-[8px] leading-[14px] text-[#161823]/38">文字只改当前页面实例，不会反写 Brand Kit 或活动项目模板。</p>
          </div>
        ) : null}

        {tab === 'elements' ? (
          <div>
            <p className="text-[9px] font-medium text-[#161823]/56">页面区域</p>
            <div className="mt-2 space-y-1.5">
              {elementRows.map((row) => {
                const visible = value.elements[row.id]
                return (
                  <button key={row.id} type="button" aria-pressed={visible} onClick={() => update({ elements: { ...value.elements, [row.id]: !visible } })} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${visible ? 'border-black/[0.07] bg-white' : 'border-transparent bg-[#F4F5F6] opacity-55'}`}>
                    <Eye className="size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-[#161823]">{row.label}</span><span className="mt-0.5 block truncate text-[8px] text-[#161823]/34">{row.detail}</span></span>
                    <span className={`h-4 w-7 rounded-full p-0.5 transition-colors ${visible ? 'bg-[#3370FF]' : 'bg-[#C9CBD0]'}`}><i className={`block size-3 rounded-full bg-white transition-transform ${visible ? 'translate-x-3' : ''}`} /></span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4"><div className="flex items-center justify-between text-[9px] text-[#161823]/52"><label htmlFor="page-editor-width">预览宽度</label><span className="font-medium tabular-nums">{value.deviceWidth}px</span></div><input id="page-editor-width" type="range" min="360" max="430" step="10" value={value.deviceWidth} onChange={(event) => update({ deviceWidth: Number(event.target.value) })} className="mt-2 w-full accent-[#3370FF]" /></div>
          </div>
        ) : null}

        {tab === 'gameplay' ? (
          <div className="space-y-4">
            <div><label className="text-[9px] font-medium text-[#161823]/56" htmlFor="page-editor-gameplay">当前玩法组合</label><input id="page-editor-gameplay" value={value.gameplay.packageName} onChange={(event) => update({ gameplay: { ...value.gameplay, packageName: event.target.value } })} className={`${INPUT_CLASS} mt-1.5`} /></div>
            <div className="space-y-2">
              {([
                ['taskEnabled', '展示任务模块', '控制任务入口和任务列表'],
                ['shareEnabled', '开启分享回流', '控制页面分享与回流动作'],
              ] as const).map(([key, label, detail]) => {
                const enabled = value.gameplay[key]
                return <button key={key} type="button" aria-pressed={enabled} onClick={() => update({ gameplay: { ...value.gameplay, [key]: !enabled } })} className="flex w-full items-center gap-3 rounded-xl border border-black/[0.07] px-3 py-3 text-left"><span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-[#161823]">{label}</span><span className="mt-0.5 block text-[8px] text-[#161823]/34">{detail}</span></span><span className={`h-4 w-7 rounded-full p-0.5 ${enabled ? 'bg-[#3370FF]' : 'bg-[#C9CBD0]'}`}><i className={`block size-3 rounded-full bg-white transition-transform ${enabled ? 'translate-x-3' : ''}`} /></span></button>
              })}
            </div>
            <div><div className="flex items-center justify-between text-[9px] text-[#161823]/52"><label htmlFor="page-editor-limit">每日参与上限</label><span>{value.gameplay.dailyLimit} 次</span></div><input id="page-editor-limit" type="range" min="1" max="10" value={value.gameplay.dailyLimit} onChange={(event) => update({ gameplay: { ...value.gameplay, dailyLimit: Number(event.target.value) } })} className="mt-2 w-full accent-[#3370FF]" /></div>
            <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-[8px] leading-[14px] text-amber-800/68">概率、库存、频控和履约仍是待接业务数据；这里只编辑已登记的页面玩法实例。</p>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-black/[0.07] p-3">
        <button type="button" onClick={() => toast.success('已保存到当前页面草稿', { description: `${activityCase.shortName} · ${item.id}` })} className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#161823] text-[10px] font-medium text-white hover:bg-[#2C2D35]"><Save className="size-3.5" />保存页面草稿</button>
      </div>
    </aside>
  )
}
