import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CheckCircle2, CircleAlert, Clock, Film, Image as ImageIcon, ListChecks, Loader2, Sparkles } from '@/shared/icons'
import type { SpriteTask, SpriteTaskStatus, TowerDefenseAsset, TowerDefenseDirection } from './TowerDefenseFlowModel'
import TowerDefenseMotionStandardizerWorkspace from './TowerDefenseMotionStandardizerWorkspace'
import TowerDefenseSpriteMakerWorkspace from './TowerDefenseSpriteMakerWorkspace'

type ToolScreen = 'home' | 'generate' | 'standardize' | 'tasks'
type TaskFilter = 'all' | SpriteTaskStatus
type TaskPatch = Partial<Pick<SpriteTask, 'direction' | 'frameCount'>>

export interface TowerDefenseSpriteToolPanelProps {
  assets: TowerDefenseAsset[]
  tasks: SpriteTask[]
  selectedTaskId?: string | null
  onSelectTask?: (taskId: string) => void
  onStartTask?: (taskId: string) => void
  onRetryTask?: (taskId: string) => void
  onConfirmTask?: (taskId: string) => void
  onUpdateTask?: (taskId: string, patch: TaskPatch) => void
  onBatchStart?: (taskIds: string[]) => void
  launchSource?: SpriteMakerLaunchSource | null
}

export interface SpriteMakerLaunchSource {
  requestId: number
  assetId: string
  url: string
  fileName: string
  mimeType: string
}

const STATUS_META: Record<SpriteTaskStatus, { label: string; className: string }> = {
  queued: { label: '排队中', className: 'bg-[#f2f3f5] text-[#161823]/52' },
  generating: { label: '生成中', className: 'bg-blue-50 text-blue-600' },
  review: { label: '待确认', className: 'bg-amber-50 text-amber-600' },
  completed: { label: '已完成', className: 'bg-emerald-50 text-emerald-600' },
  failed: { label: '失败', className: 'bg-red-50 text-red-500' },
}

const DIRECTION_LABEL: Record<TowerDefenseDirection, string> = { front: '正面', back: '背面', left: '向左', right: '向右', none: '单向' }

function getLaunchScreen(source?: SpriteMakerLaunchSource | null): Exclude<ToolScreen, 'tasks'> {
  if (!source) return 'home'
  return source.mimeType === 'image/gif' || source.mimeType.startsWith('video/')
    ? 'standardize'
    : 'generate'
}

function TaskStatusIcon({ status }: { status: SpriteTaskStatus }) {
  if (status === 'generating') return <Loader2 className="size-4 animate-spin text-blue-500" />
  if (status === 'completed') return <CheckCircle2 className="size-4 text-emerald-500" />
  if (status === 'failed') return <CircleAlert className="size-4 text-red-500" />
  return <Clock className={`size-4 ${status === 'review' ? 'text-amber-500' : 'text-[#161823]/25'}`} />
}

export default function TowerDefenseSpriteToolPanel({ assets, tasks, selectedTaskId, onSelectTask, onStartTask, onRetryTask, onConfirmTask, onBatchStart, launchSource }: TowerDefenseSpriteToolPanelProps) {
  const initialScreen = getLaunchScreen(launchSource)
  const [screen, setScreen] = useState<ToolScreen>(initialScreen)
  const [lastWorkScreen, setLastWorkScreen] = useState<Exclude<ToolScreen, 'tasks'>>(initialScreen)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [internalTaskId, setInternalTaskId] = useState(tasks[0]?.id ?? '')
  const [toolFile, setToolFile] = useState<File | null>(null)
  const [homeError, setHomeError] = useState('')
  const homeFileRef = useRef<HTMLInputElement>(null)
  const currentTaskId = selectedTaskId ?? internalTaskId
  const selectedTask = tasks.find((task) => task.id === currentTaskId) ?? tasks[0]
  const selectedAsset = assets.find((asset) => asset.id === launchSource?.assetId) ?? (selectedTask ? assets.find((asset) => asset.id === selectedTask.assetId) : undefined)
  const selectedState = selectedAsset?.states.find((state) => state.id === selectedTask?.stateId)
  const filteredTasks = useMemo(() => filter === 'all' ? tasks : tasks.filter((task) => task.status === filter), [filter, tasks])
  const runnableTaskIds = useMemo(() => tasks.filter((task) => task.status === 'queued' || task.status === 'failed').map((task) => task.id), [tasks])
  const statusCounts = useMemo(() => tasks.reduce<Record<SpriteTaskStatus, number>>((counts, task) => { counts[task.status] += 1; return counts }, { queued: 0, generating: 0, review: 0, completed: 0, failed: 0 }), [tasks])

  const openScreen = (next: Exclude<ToolScreen, 'tasks'>) => { setLastWorkScreen(next); setScreen(next) }
  const openTasks = () => { setLastWorkScreen(screen === 'tasks' ? lastWorkScreen : screen); setScreen('tasks') }
  const selectTask = (taskId: string) => { setInternalTaskId(taskId); onSelectTask?.(taskId); openScreen('generate') }
  const routeFile = (file?: File | null) => {
    if (!file) return
    const name = file.name.toLowerCase()
    const isMotion = file.type === 'image/gif' || file.type.startsWith('video/') || /\.(gif|mp4|mov|webm|m4v)$/.test(name)
    const isStill = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/.test(name)
    if (!isMotion && !isStill) {
      setHomeError('不支持该文件。请上传 PNG、JPG、WebP、GIF、MP4、MOV 或 WebM。')
      return
    }
    setHomeError('')
    setToolFile(file)
    openScreen(isMotion ? 'standardize' : 'generate')
  }

  useEffect(() => {
    if (!launchSource) return
    const controller = new AbortController()
    fetch(launchSource.url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`素材载入失败（${response.status}）`)
        return response.blob()
      })
      .then((blob) => {
        if (controller.signal.aborted) return
        setToolFile(new File([blob], launchSource.fileName, { type: launchSource.mimeType || blob.type }))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setHomeError(error instanceof Error ? error.message : '素材载入失败，请返回首页重新选择。')
        setScreen('home')
      })
    return () => controller.abort()
  }, [launchSource])

  if (screen === 'generate') return <TowerDefenseSpriteMakerWorkspace initialFile={toolFile} asset={selectedAsset} state={selectedState} task={selectedTask} onBack={() => openScreen('home')} onStart={onStartTask} onRetry={onRetryTask} onImport={onConfirmTask} onOpenTasks={openTasks} />
  if (screen === 'standardize') return <TowerDefenseMotionStandardizerWorkspace initialFile={toolFile} onBack={() => openScreen('home')} onOpenTasks={openTasks} onImportAsset={() => { if (selectedTask) onConfirmTask?.(selectedTask.id) }} />

  if (screen === 'tasks') return (
    <div className="flex h-full min-h-0 flex-col bg-[#f7f7f8] text-[#161823]">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#161823]/8 bg-white px-5"><button type="button" onClick={() => setScreen(lastWorkScreen)} className="flex size-8 items-center justify-center rounded-lg hover:bg-[#161823]/5"><ArrowLeft className="size-4" /></button><div className="min-w-0 flex-1"><h2 className="text-[13px] font-semibold">任务 List</h2><p className="text-[9px] text-[#161823]/40">Sprite Maker II 项目生成任务</p></div><button type="button" disabled={!onBatchStart || runnableTaskIds.length === 0} onClick={() => onBatchStart?.(runnableTaskIds)} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[10px] font-medium text-white disabled:opacity-35"><Sparkles className="size-3.5" />批量生成 {runnableTaskIds.length > 0 && `(${runnableTaskIds.length})`}</button></header>
      <div className="flex shrink-0 items-center gap-1.5 border-b border-[#161823]/8 bg-white px-5 py-2">{(['all', 'queued', 'generating', 'review', 'completed', 'failed'] as TaskFilter[]).map(status => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-lg px-2.5 py-1.5 text-[9px] font-medium ${filter === status ? 'bg-[#161823] text-white' : 'bg-[#f2f3f5] text-[#161823]/50'}`}>{status === 'all' ? `全部 ${tasks.length}` : `${STATUS_META[status].label} ${statusCounts[status]}`}</button>)}</div>
      <main className="thin-scroll min-h-0 flex-1 overflow-y-auto p-5"><div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">{filteredTasks.map(task => { const asset=assets.find(item=>item.id===task.assetId); const visual=asset?.visualVersions?.[asset.selectedVisualVersion??0]; return <button key={task.id} type="button" onClick={()=>selectTask(task.id)} className="rounded-xl border border-[#161823]/8 bg-white p-3 text-left shadow-[0_4px_16px_rgba(22,24,35,.04)] hover:border-[#161823]/25"><div className="flex items-start gap-3"><span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f2f3f5]">{visual?.src?<img src={visual.src} alt="" className="size-full object-contain"/>:<ImageIcon className="size-5 text-[#161823]/25"/>}</span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{asset?.name}</span><span className="mt-1 block truncate text-[9px] text-[#161823]/45">{task.label} · {DIRECTION_LABEL[task.direction]} · {task.frameCount} 帧</span><span className={`mt-2 inline-flex rounded px-1.5 py-0.5 text-[8px] ${STATUS_META[task.status].className}`}>{STATUS_META[task.status].label}</span></span><TaskStatusIcon status={task.status}/></div>{task.progress>0&&task.status!=='completed'&&<div className="mt-3 h-1 overflow-hidden rounded-full bg-[#161823]/7"><div className="h-full rounded-full bg-[#357ef8]" style={{width:`${task.progress}%`}}/></div>}</button>})}</div>{filteredTasks.length===0&&<div className="py-20 text-center text-xs text-[#161823]/35">当前筛选暂无任务</div>}</main>
    </div>
  )

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-white text-[#1c1f23]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#2d426b]/10 px-6"><span className="text-[12px] font-semibold tracking-[.16em] text-[#c94f0b]">SPRITE WORKSHOP</span><div className="flex items-center gap-2"><span className="rounded-full border border-[#2d426b]/10 px-3 py-1 text-[10px] text-[#1c1f23]/45">智能分流</span><button type="button" onClick={openTasks} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#2d426b]/10 px-3 text-[11px] font-medium"><ListChecks className="size-3.5" />任务 List {tasks.length}</button></div></header>
      <main className="mx-auto flex min-h-[calc(100%-56px)] w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-12">
        <p className="text-[10px] uppercase tracking-[.24em] text-[#c94f0b]">One entrance · Two workflows</p>
        <h1 className="mt-4 text-center text-4xl font-semibold">上传素材，开始制作精灵图</h1>
        <p className="mt-4 max-w-xl text-center text-sm leading-6 text-[#1c1f23]/55">静态角色图片会进入 AI 动作生成；GIF 和视频会进入拆帧、宫格标准化流程。</p>
        <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); routeFile(event.dataTransfer.files[0]) }} className="group relative mt-9 flex min-h-72 w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#2d426b]/12 bg-[#f8f9fb] px-6 text-center transition hover:border-[#c94f0b] hover:bg-[#fff8f4]">
          <span className="flex size-16 items-center justify-center rounded-2xl border border-[#2d426b]/10 bg-white text-3xl text-[#c94f0b] transition group-hover:border-[#c94f0b]">＋</span>
          <p className="mt-5 text-lg font-medium">拖放或点击上传</p>
          <p className="mt-2 text-xs text-[#1c1f23]/50">PNG · JPG · WebP · GIF · MP4 · MOV · WebM</p>
          <input ref={homeFileRef} aria-label="上传素材" type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm,video/x-m4v" className="absolute inset-0 size-full cursor-pointer opacity-0" onClick={(event) => { event.currentTarget.value = '' }} onChange={(event) => routeFile(event.target.files?.[0])} />
        </label>
        {homeError && <div className="mt-4 w-full max-w-2xl rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{homeError}</div>}
        <div className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#2d426b]/10 bg-[#f8f9fb] p-4"><div className="flex items-center gap-3"><ImageIcon className="size-6 text-[#c94f0b]" /><div><p className="text-sm font-medium">静态角色图片</p><p className="mt-1 text-xs text-[#1c1f23]/50">选择动作库 → AI 生成精灵图</p></div></div></div>
          <div className="rounded-2xl border border-[#2d426b]/10 bg-[#f8f9fb] p-4"><div className="flex items-center gap-3"><Film className="size-6 text-[#c94f0b]" /><div><p className="text-sm font-medium">GIF 或视频</p><p className="mt-1 text-xs text-[#1c1f23]/50">拆分帧 → 调整宫格 → 导出</p></div></div></div>
        </div>
      </main>
    </div>
  )
}
