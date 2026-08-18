import { createElement, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronRight,
  Download,
  ExternalLink,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  WandSparkles,
  X,
} from '@/shared/icons'
import { getDeliverableIcon } from './ProjectProductView'
import {
  DOCUMENTED_ACTIVITY_MATERIALS,
  DOCUMENTED_ACTIVITY_OVERVIEW,
  DOCUMENTED_ACTIVITY_PAGES,
  documentedImageCanvases,
  type DocumentedActivityCase,
  type DocumentedActivityDeliverable,
  type DocumentedImageCanvas,
} from './DocumentedActivityData'
import DocumentedPageEditor from './DocumentedPageEditor'
import {
  createDocumentedPageEditorState,
  type DocumentedPageEditorState,
  type PageEditorSelectionId,
} from './DocumentedPageEditorState'
import InteractiveDeliverableRuntime from './InteractiveDeliverableRuntime'
import { interactiveDeliverableContract } from './InteractiveDeliverableContracts'
import GarudaAssetsView, { type AssetGroup } from './GarudaAssetsView'

const CANVAS_STYLE = {
  backgroundColor: '#EEF0F3',
  backgroundImage: 'radial-gradient(circle, rgba(22, 24, 35, 0.12) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

function isInteractiveDeliverable(item: DocumentedActivityDeliverable) {
  return /^(?:H5|Lynx)\b/.test(item.label) || /^(?:H5|Lynx)\b/.test(item.surface)
}

function nodeUrl(item: DocumentedActivityDeliverable) {
  return `https://www.figma.com/design/${item.figma.fileKey}?node-id=${item.figma.nodeId.replace(':', '-')}`
}

function sourceSize(item: DocumentedActivityDeliverable) {
  return `${item.figma.width} × ${item.figma.height}`
}

function downloadName(activityCase: DocumentedActivityCase, item: DocumentedActivityDeliverable) {
  return `${activityCase.shortName}-${item.id}-${item.figma.nodeName.replace(/[\\/:*?"<>|]/g, '-')}.png`
}

function DeliverableTypeIcon({ label, className = 'size-4' }: { label: string; className?: string }) {
  const Icon = getDeliverableIcon(label)
  return Icon ? createElement(Icon, { className }) : null
}

function SourceLink({ activityCase, item }: { activityCase: DocumentedActivityCase; item?: DocumentedActivityDeliverable }) {
  return (
    <a
      href={item ? nodeUrl(item) : activityCase.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[9px] font-medium text-[#161823]/58 transition-colors hover:border-black/[0.16] hover:text-[#161823]"
    >
      {item ? '查看源文件' : '打开源文件'}
      <ExternalLink className="size-3" />
    </a>
  )
}

function canvasBaseWidth(item: DocumentedActivityDeliverable) {
  const ratio = item.figma.height / item.figma.width
  if (item.category === '页面' || ratio >= 2.4) return Math.min(item.figma.width, 430)
  if (ratio >= 1.25) return Math.min(item.figma.width, 560)
  return Math.min(item.figma.width, 1120)
}

function InfiniteDeliverableCanvas({ activityCase, item }: { activityCase: DocumentedActivityCase; item: DocumentedActivityDeliverable }) {
  const [zoom, setZoom] = useState(1)
  const width = Math.round(canvasBaseWidth(item) * zoom)
  const zoomLabel = `${Math.round(zoom * 100)}%`

  return (
    <div className="min-h-0 flex-1 overflow-auto" style={CANVAS_STYLE}>
      <div className="sticky left-0 top-0 z-20 flex h-11 min-w-full items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F7F7F8]/92 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-[9px] text-[#161823]/46">
          <DeliverableTypeIcon label={item.label} className="size-3.5 shrink-0" />
          <span className="truncate font-medium text-[#161823]/72">{item.label}</span>
          <span className="hidden shrink-0 sm:inline">{sourceSize(item)}</span>
          {item.figma.exportScale !== 1 ? <span className="shrink-0 rounded bg-[#E6E7EA] px-1.5 py-0.5 text-[8px]">导出 {item.figma.exportScale}×</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-white p-0.5">
            <button type="button" aria-label="缩小" onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3" /></button>
            <button type="button" onClick={() => setZoom(1)} className="min-w-12 px-1 text-[9px] font-medium text-[#161823]/54" title="恢复适合画布的默认比例">{zoomLabel}</button>
            <button type="button" aria-label="放大" onClick={() => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3" /></button>
          </div>
          <SourceLink activityCase={activityCase} item={item} />
          <a href={item.preview} download={downloadName(activityCase, item)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[9px] font-medium text-white hover:bg-[#2C2D35]">
            <Download className="size-3" />下载原图
          </a>
        </div>
      </div>

      <div className="w-max min-w-full px-8 py-8 sm:px-12 sm:py-10">
        <a
          href={item.preview}
          download={downloadName(activityCase, item)}
          className="group relative mx-auto block transition-[width] duration-150"
          style={{ width }}
          title="点击下载原图"
        >
          <img
            src={item.preview}
            alt={item.previewAlt}
            className="block h-auto w-full bg-white shadow-[0_22px_64px_rgba(31,35,41,0.16)]"
          />
          <span className="pointer-events-none sticky bottom-5 ml-auto mr-4 mt-[-44px] flex h-8 w-max translate-y-[-12px] items-center gap-1.5 rounded-lg bg-black/70 px-3 text-[9px] font-medium text-white opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100">
            <Download className="size-3" />点击下载原图
          </span>
        </a>
        <div className="mx-auto mt-5 flex max-w-[720px] items-center justify-center text-[8px] text-[#161823]/34">
          原始规格 {sourceSize(item)} · 可下载完整原图
        </div>
      </div>
    </div>
  )
}

function groupedBoardWidth(item: DocumentedActivityDeliverable) {
  const ratio = item.figma.height / item.figma.width
  if (ratio >= 2.2) return 200
  if (ratio >= 1.2) return 240
  if (ratio <= 0.72) return 340
  return 280
}

function InfiniteImageGroupCanvas({ activityCase, canvas }: { activityCase: DocumentedActivityCase; canvas: DocumentedImageCanvas }) {
  const [zoom, setZoom] = useState(1)
  const zoomLabel = `${Math.round(zoom * 100)}%`

  return (
    <div className="min-h-0 flex-1 overflow-auto" style={CANVAS_STYLE}>
      <div className="sticky left-0 top-0 z-30 flex h-11 min-w-full items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F7F7F8]/94 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-[9px] text-[#161823]/44">
          <DeliverableTypeIcon label={canvas.label} className="size-3.5 shrink-0" />
          <span className="truncate font-medium text-[#161823]/72">{canvas.label}</span>
          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[8px] shadow-sm">{canvas.items.length} 张图片</span>
          <span className="hidden max-w-[460px] truncate xl:inline">{canvas.description}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-white p-0.5">
            <button type="button" aria-label="缩小画布" onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3" /></button>
            <button type="button" onClick={() => setZoom(1)} className="min-w-12 px-1 text-[9px] font-medium text-[#161823]/54">{zoomLabel}</button>
            <button type="button" aria-label="放大画布" onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3" /></button>
          </div>
          <SourceLink activityCase={activityCase} />
        </div>
      </div>

      <div className="w-max min-w-full p-8 sm:p-10">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-start justify-center gap-8">
          {canvas.items.map((item) => {
            const width = Math.round(groupedBoardWidth(item) * zoom)
            return (
              <figure key={item.id} className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-[0_18px_48px_rgba(31,35,41,0.12)] transition-[width] duration-150" style={{ width }}>
                <figcaption className="flex h-11 items-center gap-2 border-b border-black/[0.06] px-3">
                  <DeliverableTypeIcon label={item.label} className="size-3.5 shrink-0 text-[#161823]/38" />
                  <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-[#161823]/68">{item.label}</span>
                  <span className="shrink-0 text-[8px] text-[#161823]/28">{sourceSize(item)}</span>
                  <a href={nodeUrl(item)} target="_blank" rel="noreferrer" aria-label={`查看源文件：${item.label}`} className="grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><ExternalLink className="size-3" /></a>
                  <a href={item.preview} download={downloadName(activityCase, item)} aria-label={`下载原图：${item.label}`} className="grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><Download className="size-3" /></a>
                </figcaption>
                <a href={item.preview} download={downloadName(activityCase, item)} className="group relative flex min-h-[180px] items-center justify-center bg-[#F6F7F8] p-3" title="点击下载原图">
                  <img src={item.preview} alt={item.previewAlt} className="max-h-[520px] w-full object-contain object-top shadow-[0_8px_24px_rgba(31,35,41,0.1)]" />
                  <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/68 px-2 py-1 text-[8px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">下载原图</span>
                </a>
                <div className="px-3 py-2.5"><p className="line-clamp-2 text-[8px] leading-[13px] text-[#161823]/42">{item.summary}</p><p className="mt-1.5 truncate text-[7px] text-[#161823]/26">{item.figma.page} / {item.figma.nodeId} · {item.figma.nodeName}</p></div>
              </figure>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PageCanvasAiPanel({
  value,
  onChange,
  onClose,
}: {
  value: DocumentedPageEditorState
  onChange: (value: DocumentedPageEditorState) => void
  onClose: () => void
}) {
  const [instruction, setInstruction] = useState('')
  const [target, setTarget] = useState<'page' | 'hero' | 'navigation' | 'content' | 'footer'>('page')
  const targetLabel = {
    page: '当前页面',
    hero: '主视觉区',
    navigation: '导航与入口',
    content: '核心内容区',
    footer: '任务与回流区',
  }[target]

  const apply = () => {
    const prompt = instruction.trim()
    if (!prompt) {
      toast.error('请先描述要修改的内容')
      return
    }
    let next = value
    if (/隐藏|去掉|移除/.test(prompt) && target !== 'page') {
      next = { ...value, elements: { ...value.elements, [target]: false } }
    } else if (/按钮|CTA|行动点/i.test(prompt)) {
      next = { ...value, cta: /报名|参与/.test(prompt) ? '立即参与活动' : '进入活动会场' }
    } else if (/标题|节日|春节|新春/.test(prompt)) {
      next = { ...value, title: /高燃|燃/.test(prompt) ? '新春高燃时刻' : '新春好戏开场' }
    } else {
      next = { ...value, subtitle: prompt.slice(0, 48) }
    }
    onChange(next)
    setInstruction('')
    toast.success(`已应用到${targetLabel}`, { description: '仅更新当前页面草稿，可继续在右侧精确调整。' })
  }

  return (
    <section aria-label="画布 AI 修改" className="absolute right-4 top-[56px] z-40 w-[320px] overflow-hidden rounded-2xl border border-black/[0.09] bg-white shadow-[0_20px_60px_-18px_rgba(22,24,35,0.35)]">
      <div className="flex items-start justify-between border-b border-black/[0.07] px-4 py-3.5">
        <div><p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#161823]"><WandSparkles className="size-3.5 text-[#3370FF]" />画布 AI 修改</p><p className="mt-1 text-[8px] text-[#161823]/38">先指定作用对象，再生成受控修改</p></div>
        <button type="button" onClick={onClose} aria-label="关闭画布 AI 修改" className="grid size-7 place-items-center rounded-lg text-[#161823]/38 hover:bg-[#F2F3F5] hover:text-[#161823]"><X className="size-3.5" /></button>
      </div>
      <div className="space-y-3.5 p-4">
        <div><p className="text-[8px] font-medium text-[#161823]/46">作用对象</p><div className="mt-2 flex flex-wrap gap-1.5">{([
          ['page', '当前页面'], ['hero', '主视觉'], ['navigation', '导航'], ['content', '内容'], ['footer', '任务与回流'],
        ] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={target === id} onClick={() => setTarget(id)} className={`rounded-full border px-2 py-1 text-[8px] ${target === id ? 'border-[#3370FF]/30 bg-[#EEF4FF] font-medium text-[#175CD3]' : 'border-black/[0.08] text-[#161823]/48 hover:bg-[#F6F7F8]'}`}>{label}</button>)}</div></div>
        <label className="block"><span className="text-[8px] font-medium text-[#161823]/46">修改要求</span><textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} rows={4} placeholder="例如：主标题更有新春氛围，保留高燃感" className="mt-1.5 w-full resize-none rounded-xl border border-black/[0.09] px-3 py-2.5 text-[10px] leading-4 text-[#161823] outline-none placeholder:text-[#161823]/25 focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10" /></label>
        <button type="button" onClick={apply} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#3370FF] text-[9px] font-medium text-white hover:bg-[#2864DC]"><WandSparkles className="size-3.5" />生成并应用修改</button>
        <p className="rounded-lg bg-[#F6F7F8] px-2.5 py-2 text-[8px] leading-[13px] text-[#161823]/38">AI 修改属于画布能力；右侧编辑器只保留确定性字段。</p>
      </div>
    </section>
  )
}

function InteractiveDeliverableCanvas({ activityCase, item }: { activityCase: DocumentedActivityCase; item: DocumentedActivityDeliverable }) {
  const [zoom, setZoom] = useState(1)
  const [runtimeSession, setRuntimeSession] = useState(0)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [editor, setEditor] = useState<DocumentedPageEditorState>(() => createDocumentedPageEditorState(activityCase, item))
  const [selectionState, setSelectionState] = useState<{ itemId: string; selection: PageEditorSelectionId }>({ itemId: item.id, selection: 'hero' })
  // H5 / Lynx are editable product surfaces in every project. The editor
  // state is page-scoped; changing one page never mutates its template or a
  // sibling page. ACG keeps its project-specific defaults, while the other
  // documented cases fall back to their own item copy.
  const editorEnabled = isInteractiveDeliverable(item)
  const contract = interactiveDeliverableContract(item.id)
  const selection = selectionState.itemId === item.id ? selectionState.selection : 'hero'
  const setSelection = (nextSelection: PageEditorSelectionId) => setSelectionState({ itemId: item.id, selection: nextSelection })
  const runtimeWidth = Math.round((editorEnabled ? editor.deviceWidth : 390) * zoom)
  const zoomLabel = `${Math.round(zoom * 100)}%`

  useEffect(() => {
    const clearSelection = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return
      setSelectionState({ itemId: item.id, selection: 'page' })
    }
    window.addEventListener('keydown', clearSelection)
    return () => window.removeEventListener('keydown', clearSelection)
  }, [item.id])

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="relative min-h-0 min-w-0 flex-1 overflow-auto" style={CANVAS_STYLE}>
        <div className="sticky left-0 top-0 z-30 flex h-11 min-w-full items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F7F7F8]/94 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-[9px] text-[#161823]/46">
          <DeliverableTypeIcon label={item.label} className="size-3.5 shrink-0" />
          <span className="truncate font-medium text-[#161823]/72">{item.label}</span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700"><i className="size-1.5 rounded-full bg-emerald-500" />可交互运行态</span>
          {contract ? <span className="hidden max-w-[360px] truncate xl:inline">{contract.experience}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="inline-flex h-8 items-center rounded-lg bg-[#161823] px-3 text-[9px] font-medium text-white">页面预览</span>
          <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-white p-0.5">
            <button type="button" aria-label="缩小" onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3" /></button>
            <button type="button" onClick={() => setZoom(1)} className="min-w-12 px-1 text-[9px] font-medium text-[#161823]/54">{zoomLabel}</button>
            <button type="button" aria-label="放大" onClick={() => setZoom((value) => Math.min(1.5, Number((value + 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3" /></button>
          </div>
          <button type="button" onClick={() => setRuntimeSession((value) => value + 1)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-2.5 text-[9px] font-medium text-[#161823]/52 hover:bg-[#F2F2F4] hover:text-[#161823]">
            <RotateCcw className="size-3" />重置试玩
          </button>
          {editorEnabled ? <button type="button" aria-pressed={aiPanelOpen} onClick={() => setAiPanelOpen((open) => !open)} className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[9px] font-medium ${aiPanelOpen ? 'bg-[#3370FF] text-white' : 'border border-[#3370FF]/18 bg-[#EEF4FF] text-[#175CD3] hover:bg-[#E3EDFF]'}`}><WandSparkles className="size-3" />AI 修改</button> : null}
        </div>
        </div>

        <div className="w-max min-w-full px-8 py-8 sm:px-12 sm:py-10">
          <div className="mx-auto origin-top transition-[width] duration-150" style={{ width: runtimeWidth }}>
            <div
              data-testid="interactive-deliverable-runtime"
              data-deliverable-id={item.id}
              className="w-[390px] [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[#4F46E5]"
              style={{ zoom: zoom * (editorEnabled ? editor.deviceWidth : 390) / 390 }}
            >
              <InteractiveDeliverableRuntime
                key={`${item.id}-${runtimeSession}`}
                activityCase={activityCase}
                item={item}
                editor={editorEnabled ? editor : undefined}
                selection={editorEnabled ? selection : undefined}
                onSelectionChange={editorEnabled ? setSelection : undefined}
              />
            </div>
          </div>
          <div className="mx-auto mt-5 flex max-w-[760px] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[8px] text-[#161823]/34">
            <span>点击页面元素即可选择</span>{contract ? <span>{contract.primaryAction}</span> : null}{editorEnabled ? <span>选中框、图层树与右侧属性保持同步</span> : null}
          </div>
        </div>
        {editorEnabled && aiPanelOpen ? <PageCanvasAiPanel value={editor} onChange={setEditor} onClose={() => setAiPanelOpen(false)} /> : null}
      </div>
      {editorEnabled ? (
        <DocumentedPageEditor
          key={`${item.id}-${selection}`}
          activityCase={activityCase}
          item={item}
          value={editor}
          selection={selection}
          onSelectionChange={setSelection}
          onChange={setEditor}
          onReset={() => {
            setEditor(createDocumentedPageEditorState(activityCase, item))
            setSelection('hero')
          }}
        />
      ) : null}
    </div>
  )
}

function OverviewCard({ item, onOpen }: { item: DocumentedActivityDeliverable; onOpen: (label: string) => void }) {
  const interactive = isInteractiveDeliverable(item)
  return (
    <button
      type="button"
      onClick={() => onOpen(item.label)}
      className="group overflow-hidden rounded-xl border border-black/[0.07] bg-white text-left shadow-[0_1px_0_rgba(22,24,35,0.02)] transition hover:-translate-y-0.5 hover:border-black/[0.15] hover:shadow-[0_10px_28px_rgba(22,24,35,0.08)]"
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden p-3" style={CANVAS_STYLE}>
        <img src={item.preview} alt={item.previewAlt} className="max-h-full max-w-full object-contain shadow-[0_8px_20px_rgba(31,35,41,0.12)]" />
        {interactive ? <span className="absolute ml-[-8px] mt-[-136px] flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[7px] font-medium text-white shadow"><i className="size-1 rounded-full bg-white" />可交互</span> : null}
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-2">
          <DeliverableTypeIcon label={item.label} className="size-3.5 shrink-0 text-[#161823]/42" />
          <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-[#161823]/78">{item.label}</span>
          <ChevronRight className="size-3 shrink-0 text-[#161823]/20 transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="mt-1.5 line-clamp-2 text-[8px] leading-[13px] text-[#161823]/38">{item.summary}</p>
        <p className="mt-2 truncate text-[8px] text-[#161823]/26">{sourceSize(item)} · 已完成</p>
      </div>
    </button>
  )
}

function PageRuntimeOverviewCard({ activityCase, item, onOpen }: { activityCase: DocumentedActivityCase; item: DocumentedActivityDeliverable; onOpen: (label: string) => void }) {
  if (!isInteractiveDeliverable(item)) return <OverviewCard item={item} onOpen={onOpen} />
  const runtimeKind = item.label.startsWith('Lynx') ? 'Lynx' : item.label.startsWith('Native') ? 'Native' : 'H5'
  return (
    <article className="w-[390px] max-w-full overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_12px_34px_rgba(31,35,41,0.09)]">
      <button
        type="button"
        onClick={() => onOpen(item.label)}
        className="group flex h-12 w-full items-center gap-3 border-b border-black/[0.07] bg-white px-4 text-left hover:bg-[#FAFAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]"
        aria-label={`编辑页面：${item.label}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-semibold text-[#161823]/78">{item.label}</span>
          <span className="mt-0.5 block text-[8px] text-[#161823]/34">{runtimeKind} 页面</span>
        </span>
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-[#161823] px-2.5 text-[8px] font-medium text-white transition-colors group-hover:bg-[#2C2D35]">
          <Pencil className="size-3" />编辑页面
        </span>
      </button>
      <div className="w-[390px] max-w-full overflow-hidden">
        <InteractiveDeliverableRuntime activityCase={activityCase} item={item} />
      </div>
    </article>
  )
}

function FinishedPagesCanvas({ activityCase, onOpen }: { activityCase: DocumentedActivityCase; onOpen: (label: string) => void }) {
  const pageItems = useMemo(() => activityCase.deliverables.filter((item) => item.category === '页面'), [activityCase])

  return (
    <div className="min-h-0 flex-1 overflow-auto" style={CANVAS_STYLE}>
      <div className="sticky left-0 top-0 z-30 flex h-11 min-w-full items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F7F7F8]/94 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-[9px] text-[#161823]/44">
          <DeliverableTypeIcon label={DOCUMENTED_ACTIVITY_PAGES} className="size-3.5 shrink-0" />
          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[8px] font-medium text-[#161823]/62 shadow-sm">{pageItems.length} 个页面</span>
        </div>
        <SourceLink activityCase={activityCase} />
      </div>
      <div className="w-max min-w-full p-8 sm:p-10">
        <div className="mx-auto flex max-w-[1760px] flex-wrap items-start justify-center gap-8">
          {pageItems.map((item) => <PageRuntimeOverviewCard key={item.id} activityCase={activityCase} item={item} onOpen={onOpen} />)}
        </div>
      </div>
    </div>
  )
}

export default function DocumentedActivityWorkspace({
  activityCase,
  activeLabel,
  materialGroups,
  onOpen,
}: {
  activityCase: DocumentedActivityCase
  activeLabel: string
  materialGroups: AssetGroup[]
  onOpen: (label: string) => void
}) {
  const item = activityCase.deliverables.find((candidate) => candidate.label === activeLabel)
  const imageCanvas = documentedImageCanvases(activityCase).find((canvas) => canvas.label === activeLabel)
  if (activeLabel === DOCUMENTED_ACTIVITY_MATERIALS) return <GarudaAssetsView groups={materialGroups} />
  if (activeLabel === DOCUMENTED_ACTIVITY_PAGES || activeLabel === DOCUMENTED_ACTIVITY_OVERVIEW) return <FinishedPagesCanvas activityCase={activityCase} onOpen={onOpen} />
  if (imageCanvas) return <InfiniteImageGroupCanvas key={imageCanvas.label} activityCase={activityCase} canvas={imageCanvas} />
  if (!item) return <FinishedPagesCanvas activityCase={activityCase} onOpen={onOpen} />
  if (isInteractiveDeliverable(item)) return <InteractiveDeliverableCanvas key={item.id} activityCase={activityCase} item={item} />
  const containingCanvas = documentedImageCanvases(activityCase).find((canvas) => canvas.items.some((candidate) => candidate.id === item.id))
  if (containingCanvas) return <InfiniteImageGroupCanvas key={containingCanvas.label} activityCase={activityCase} canvas={containingCanvas} />
  return <InfiniteDeliverableCanvas key={item.id} activityCase={activityCase} item={item} />
}
