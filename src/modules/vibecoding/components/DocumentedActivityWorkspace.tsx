import { createElement, useMemo, useState } from 'react'
import {
  ChevronRight,
  Download,
  ExternalLink,
  Minus,
  Plus,
  RotateCcw,
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
} from './DocumentedPageEditorState'
import InteractiveDeliverableRuntime from './InteractiveDeliverableRuntime'
import { interactiveDeliverableContract } from './InteractiveDeliverableContracts'

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
      {item ? '在 Figma 定位' : '打开源文件'}
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
          <span className="hidden shrink-0 sm:inline">{sourceSize(item)} · {item.figma.page} / {item.figma.nodeId}</span>
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
          title="点击下载这张 Figma 交付原图"
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
        <div className="mx-auto mt-5 flex max-w-[720px] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[8px] text-[#161823]/34">
          <span>Figma page：{item.figma.page}</span>
          <span>node：{item.figma.nodeId}</span>
          <span>画板：{item.figma.nodeName}</span>
          <span>源尺寸：{sourceSize(item)}</span>
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
                  <a href={nodeUrl(item)} target="_blank" rel="noreferrer" aria-label={`在 Figma 定位：${item.label}`} className="grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><ExternalLink className="size-3" /></a>
                  <a href={item.preview} download={downloadName(activityCase, item)} aria-label={`下载原图：${item.label}`} className="grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><Download className="size-3" /></a>
                </figcaption>
                <a href={item.preview} download={downloadName(activityCase, item)} className="group relative flex min-h-[180px] items-center justify-center bg-[#F6F7F8] p-3" title="点击下载 Figma 原图">
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

function InteractiveDeliverableCanvas({ activityCase, item }: { activityCase: DocumentedActivityCase; item: DocumentedActivityDeliverable }) {
  const [zoom, setZoom] = useState(1)
  const [mode, setMode] = useState<'runtime' | 'design'>('runtime')
  const [runtimeSession, setRuntimeSession] = useState(0)
  const [editor, setEditor] = useState<DocumentedPageEditorState>(() => createDocumentedPageEditorState(activityCase, item))
  // H5 / Lynx are editable product surfaces in every project. The editor
  // state is page-scoped; changing one page never mutates its template or a
  // sibling page. ACG keeps its project-specific defaults, while the other
  // documented cases fall back to their own item copy.
  const editorEnabled = isInteractiveDeliverable(item)
  const contract = interactiveDeliverableContract(item.id)
  const runtimeWidth = Math.round((editorEnabled ? editor.deviceWidth : 390) * zoom)
  const designWidth = Math.round(canvasBaseWidth(item) * zoom)
  const zoomLabel = `${Math.round(zoom * 100)}%`

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto" style={CANVAS_STYLE}>
        <div className="sticky left-0 top-0 z-30 flex h-11 min-w-full items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F7F7F8]/94 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-[9px] text-[#161823]/46">
          <DeliverableTypeIcon label={item.label} className="size-3.5 shrink-0" />
          <span className="truncate font-medium text-[#161823]/72">{item.label}</span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700"><i className="size-1.5 rounded-full bg-emerald-500" />可交互运行态</span>
          {contract ? <span className="hidden max-w-[360px] truncate xl:inline">体验目标：{contract.experience}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-white p-0.5">
            {([['runtime', '运行态'], ['design', '设计对照']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setMode(value)} className={`h-7 rounded-md px-2.5 text-[9px] font-medium ${mode === value ? 'bg-[#161823] text-white' : 'text-[#161823]/46 hover:bg-[#F2F2F4]'}`}>{label}</button>
            ))}
          </div>
          <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-white p-0.5">
            <button type="button" aria-label="缩小" onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3" /></button>
            <button type="button" onClick={() => setZoom(1)} className="min-w-12 px-1 text-[9px] font-medium text-[#161823]/54">{zoomLabel}</button>
            <button type="button" aria-label="放大" onClick={() => setZoom((value) => Math.min(1.5, Number((value + 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3" /></button>
          </div>
          {mode === 'runtime' ? (
            <button type="button" onClick={() => setRuntimeSession((value) => value + 1)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-2.5 text-[9px] font-medium text-[#161823]/52 hover:bg-[#F2F2F4] hover:text-[#161823]">
              <RotateCcw className="size-3" />重置试玩
            </button>
          ) : null}
          <SourceLink activityCase={activityCase} item={item} />
          <a href={item.preview} download={downloadName(activityCase, item)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[9px] font-medium text-white hover:bg-[#2C2D35]"><Download className="size-3" />下载设计稿</a>
        </div>
        </div>

        <div className="w-max min-w-full px-8 py-8 sm:px-12 sm:py-10">
          {mode === 'runtime' ? (
            <div className="mx-auto origin-top transition-[width] duration-150" style={{ width: runtimeWidth }}>
              <div
                data-testid="interactive-deliverable-runtime"
                data-deliverable-id={item.id}
                className="w-[390px] [&_button]:focus-visible:outline [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[#4F46E5]"
                style={{ zoom: zoom * (editorEnabled ? editor.deviceWidth : 390) / 390 }}
              >
                <InteractiveDeliverableRuntime key={`${item.id}-${runtimeSession}`} activityCase={activityCase} item={item} editor={editorEnabled ? editor : undefined} />
              </div>
            </div>
          ) : (
            <a href={item.preview} download={downloadName(activityCase, item)} className="group mx-auto block transition-[width] duration-150" style={{ width: designWidth }} title="点击下载这张 Figma 设计稿">
              <img src={item.preview} alt={item.previewAlt} className="block h-auto w-full bg-white shadow-[0_22px_64px_rgba(31,35,41,0.16)]" />
            </a>
          )}
          <div className="mx-auto mt-5 flex max-w-[760px] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[8px] text-[#161823]/34">
            {mode === 'runtime' ? <><span>真实 DOM 运行态</span>{contract ? <span>{contract.primaryAction}</span> : <span>按钮、Tab、弹层与业务状态可操作</span>}{editorEnabled ? <span>右侧编辑器实时作用于当前页面实例</span> : null}</> : <><span>Figma page：{item.figma.page}</span><span>node：{item.figma.nodeId}</span><span>源尺寸：{sourceSize(item)}</span></>}
          </div>
        </div>
      </div>
      {editorEnabled ? (
        <DocumentedPageEditor
          activityCase={activityCase}
          item={item}
          value={editor}
          onChange={setEditor}
          onReset={() => setEditor(createDocumentedPageEditorState(activityCase, item))}
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
        <p className="mt-2 truncate text-[8px] text-[#161823]/26">{sourceSize(item)} · {item.figma.page} / {item.figma.nodeId}</p>
      </div>
    </button>
  )
}

function PageRuntimeOverviewCard({ activityCase, item, onOpen }: { activityCase: DocumentedActivityCase; item: DocumentedActivityDeliverable; onOpen: (label: string) => void }) {
  if (!isInteractiveDeliverable(item)) return <OverviewCard item={item} onOpen={onOpen} />
  return (
    <article className="w-[390px] max-w-full overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[0_12px_34px_rgba(31,35,41,0.09)]">
      <div className="w-[390px] max-w-full overflow-hidden">
        <InteractiveDeliverableRuntime activityCase={activityCase} item={item} />
      </div>
      <button type="button" onClick={() => onOpen(item.label)} className="flex w-full items-center gap-3 border-t border-black/[0.07] px-4 py-3.5 text-left hover:bg-[#FAFAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3370FF]">
        <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-[#161823]/78">{item.label}</span><span className="mt-1 block truncate text-[8px] text-[#161823]/34">真实页面 · 390px · 100% 原尺寸</span></span>
        <ChevronRight className="size-3.5 shrink-0 text-[#161823]/24" />
      </button>
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

function ProjectMaterialsCanvas({ activityCase }: { activityCase: DocumentedActivityCase }) {
  const [zoom, setZoom] = useState(1)
  const canvases = useMemo(() => documentedImageCanvases(activityCase), [activityCase])
  const imageCount = canvases.reduce((count, canvas) => count + canvas.items.length, 0)

  return (
    <div className="min-h-0 flex-1 overflow-auto" style={CANVAS_STYLE}>
      <div className="sticky left-0 top-0 z-30 flex h-11 min-w-full items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F7F7F8]/94 px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-[9px] text-[#161823]/44">
          <DeliverableTypeIcon label={DOCUMENTED_ACTIVITY_MATERIALS} className="size-3.5 shrink-0" />
          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[8px] font-medium text-[#161823]/62 shadow-sm">{imageCount} 张图片</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex h-8 items-center rounded-lg border border-black/[0.08] bg-white p-0.5">
            <button type="button" aria-label="缩小素材" onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Minus className="size-3" /></button>
            <button type="button" onClick={() => setZoom(1)} className="min-w-12 px-1 text-[9px] font-medium text-[#161823]/54">{Math.round(zoom * 100)}%</button>
            <button type="button" aria-label="放大素材" onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(1))))} className="grid size-7 place-items-center rounded-md text-[#161823]/48 hover:bg-[#F2F2F4] hover:text-[#161823]"><Plus className="size-3" /></button>
          </div>
          <SourceLink activityCase={activityCase} />
        </div>
      </div>
      <div className="w-max min-w-full p-8 sm:p-10">
        <div className="mx-auto max-w-[1680px] space-y-10">
          {canvases.map((canvas) => (
            <section key={canvas.label} aria-label={canvas.label}>
              <div className="mb-4 flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[12px] font-semibold text-[#161823]/76">{canvas.label}</h2>
                  <p className="mt-1 text-[8px] text-[#161823]/34">{canvas.description}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[8px] text-[#161823]/42 shadow-sm">{canvas.items.length} 张</span>
              </div>
              <div className="flex flex-wrap items-start gap-7">
                {canvas.items.map((item) => {
                  const width = Math.round(groupedBoardWidth(item) * zoom)
                  return (
                    <figure key={item.id} className="overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-[0_18px_48px_rgba(31,35,41,0.12)] transition-[width] duration-150" style={{ width }}>
                      <figcaption className="flex h-11 items-center gap-2 border-b border-black/[0.06] px-3">
                        <DeliverableTypeIcon label={item.label} className="size-3.5 shrink-0 text-[#161823]/38" />
                        <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-[#161823]/68">{item.label}</span>
                        <span className="shrink-0 text-[8px] text-[#161823]/28">{sourceSize(item)}</span>
                        <a href={nodeUrl(item)} target="_blank" rel="noreferrer" aria-label={`在 Figma 定位：${item.label}`} className="grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><ExternalLink className="size-3" /></a>
                        <a href={item.preview} download={downloadName(activityCase, item)} aria-label={`下载原图：${item.label}`} className="grid size-6 place-items-center rounded-md text-[#161823]/36 hover:bg-[#F2F3F5] hover:text-[#161823]"><Download className="size-3" /></a>
                      </figcaption>
                      <a href={item.preview} download={downloadName(activityCase, item)} className="group relative flex min-h-[180px] items-center justify-center bg-[#F6F7F8] p-3" title="点击下载 Figma 原图">
                        <img src={item.preview} alt={item.previewAlt} className="max-h-[520px] w-full object-contain object-top shadow-[0_8px_24px_rgba(31,35,41,0.1)]" />
                        <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/68 px-2 py-1 text-[8px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">下载原图</span>
                      </a>
                    </figure>
                  )
                })}
              </div>
            </section>
          ))}
          {!canvases.length ? <div className="grid min-h-[320px] place-items-center text-[11px] text-[#161823]/38">这个项目还没有图片素材</div> : null}
        </div>
      </div>
    </div>
  )
}

export default function DocumentedActivityWorkspace({ activityCase, activeLabel, onOpen }: { activityCase: DocumentedActivityCase; activeLabel: string; onOpen: (label: string) => void }) {
  const item = activityCase.deliverables.find((candidate) => candidate.label === activeLabel)
  const imageCanvas = documentedImageCanvases(activityCase).find((canvas) => canvas.label === activeLabel)
  if (activeLabel === DOCUMENTED_ACTIVITY_MATERIALS) return <ProjectMaterialsCanvas activityCase={activityCase} />
  if (activeLabel === DOCUMENTED_ACTIVITY_PAGES || activeLabel === DOCUMENTED_ACTIVITY_OVERVIEW) return <FinishedPagesCanvas activityCase={activityCase} onOpen={onOpen} />
  if (imageCanvas) return <InfiniteImageGroupCanvas key={imageCanvas.label} activityCase={activityCase} canvas={imageCanvas} />
  if (!item) return <FinishedPagesCanvas activityCase={activityCase} onOpen={onOpen} />
  if (isInteractiveDeliverable(item)) return <InteractiveDeliverableCanvas key={item.id} activityCase={activityCase} item={item} />
  const containingCanvas = documentedImageCanvases(activityCase).find((canvas) => canvas.items.some((candidate) => candidate.id === item.id))
  if (containingCanvas) return <InfiniteImageGroupCanvas key={containingCanvas.label} activityCase={activityCase} canvas={containingCanvas} />
  return <InfiniteDeliverableCanvas key={item.id} activityCase={activityCase} item={item} />
}
