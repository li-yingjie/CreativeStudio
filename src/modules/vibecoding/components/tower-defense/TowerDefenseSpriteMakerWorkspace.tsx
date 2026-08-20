import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  Download,
  Image as ImageIcon,
  Loader2,
  Moon,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  Upload,
  ListChecks,
} from '@/shared/icons'
import type {
  SpriteTask,
  TowerDefenseAsset,
  TowerDefenseAssetState,
} from './TowerDefenseFlowModel'

interface Props {
  initialFile?: File | null
  asset?: TowerDefenseAsset
  state?: TowerDefenseAssetState
  task?: SpriteTask
  onBack?: () => void
  onStart?: (taskId: string) => void
  onRetry?: (taskId: string) => void
  onImport?: (taskId: string) => void
  onOpenTasks?: () => void
}

type PreviewMode = 'static' | 'motion'
type SpriteTheme = 'light' | 'dark'

const ACTION_COVERS: Record<string, string> = {
  idle: '待机呼吸', move: '跑步移动', attack: '挥砍攻击', hit: '受击反馈', death: '死亡倒地', upgrade: '升级演出',
}

const checkerboard = {
  backgroundColor: '#f3f4f6',
  backgroundImage: 'linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)',
  backgroundPosition: '0 0,0 7px,7px -7px,-7px 0',
  backgroundSize: '14px 14px',
}

function ToolCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[16px] border border-[var(--sm-line)] bg-[var(--sm-panel)] p-3 ${className}`}>{children}</section>
}

export default function TowerDefenseSpriteMakerWorkspace({ initialFile, asset, state, task, onBack, onStart, onRetry, onImport, onOpenTasks }: Props) {
  const [theme, setTheme] = useState<SpriteTheme>('light')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('static')
  const [frame, setFrame] = useState(0)
  const [fps, setFps] = useState(task?.fps ?? state?.fps ?? 12)
  const [search, setSearch] = useState('')
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [backgroundTransparent, setBackgroundTransparent] = useState(true)
  const [chromaEnabled, setChromaEnabled] = useState(false)
  const [chromaTolerance, setChromaTolerance] = useState(18)
  const uploadRef = useRef<HTMLInputElement>(null)

  const selectedVisual = asset?.visualVersions?.[asset.selectedVisualVersion ?? 0]
  const sourceUrl = localPreview ?? task?.output?.previewUrl ?? task?.output?.spriteSheetUrl ?? selectedVisual?.src
  const ready = task?.status === 'review' || task?.status === 'completed'
  const busy = task?.status === 'generating'
  const visibleStates = useMemo(() => (asset?.states ?? []).filter((item) => {
    const keyword = search.trim().toLowerCase()
    return !keyword || item.name.toLowerCase().includes(keyword) || item.id.includes(keyword)
  }), [asset?.states, search])

  useEffect(() => {
    if (previewMode !== 'motion' || !task) return
    const timer = window.setInterval(() => setFrame((value) => (value + 1) % Math.max(1, task.frameCount)), Math.round(1000 / Math.max(1, fps)))
    return () => window.clearInterval(timer)
  }, [fps, previewMode, task])

  const chooseFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setLocalPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!initialFile || !initialFile.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setLocalPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(initialFile)
  }, [initialFile])

  const run = () => {
    if (!task) return
    if (task.status === 'failed') onRetry?.(task.id)
    else onStart?.(task.id)
  }

  return (
    <div
      data-theme={theme}
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--sm-bg)] text-[var(--sm-ink)]"
      style={{
        '--sm-bg': theme === 'light' ? '#ffffff' : '#0c0c0d',
        '--sm-sidebar': theme === 'light' ? '#f5f7fa' : '#111113',
        '--sm-panel': theme === 'light' ? '#ffffff' : 'rgba(255,255,255,.045)',
        '--sm-line': theme === 'light' ? 'rgba(45,66,107,.10)' : 'rgba(255,255,255,.09)',
        '--sm-ink': theme === 'light' ? '#1c1f23' : '#eeeae2',
        '--sm-muted': theme === 'light' ? 'rgba(28,31,35,.60)' : '#7a7672',
        '--sm-control': theme === 'light' ? '#f5f7fa' : 'rgba(0,0,0,.20)',
        '--sm-subtle': theme === 'light' ? '#f8f9fb' : 'rgba(255,255,255,.025)',
        '--sm-accent': '#f46f24',
      } as React.CSSProperties}
    >
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,1fr)_clamp(300px,36%,410px)] overflow-hidden max-[1120px]:flex max-[1120px]:flex-col max-[1120px]:overflow-y-auto">
        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--sm-bg)] px-5 py-4 max-[1120px]:min-h-[500px]">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onBack} className="text-[10px] text-[var(--sm-muted)] transition hover:text-[var(--sm-ink)]">← 返回首页</button>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--sm-accent)]">Output preview</p>
              </div>
              <h3 className="mt-1 text-sm font-medium">AI 生成结果</h3>
            </div>
            <div className="flex items-center gap-2"><p className="text-right text-[11px] text-[var(--sm-muted)]">当前动作 · {state?.name ?? '未选择'}</p><button type="button" onClick={onOpenTasks} className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--sm-line)] bg-[var(--sm-panel)] px-3 text-[11px] font-medium text-[var(--sm-ink)] shadow-sm"><ListChecks className="size-3.5" />任务 List</button></div>
          </div>

          <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[18px] border border-[var(--sm-line)]" style={backgroundTransparent ? checkerboard : { background: theme === 'light' ? '#fff' : '#111' }}>
            {sourceUrl ? (
              <img
                src={sourceUrl}
                alt={`${asset?.name ?? ''}${state?.name ?? ''}`}
                className="max-h-[72%] max-w-[76%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,.12)]"
                style={previewMode === 'motion' ? { transform: `translateY(${Math.sin(frame / 2) * 3}px) scale(${1 + Math.sin(frame / 3) * .01})` } : undefined}
              />
            ) : (
              <div className="text-center text-[var(--sm-muted)]">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[var(--sm-line)] bg-[var(--sm-panel)]"><Sparkles className="size-6" /></span>
                <p className="mt-5 text-sm">选择动作并生成精灵图</p>
                <p className="mt-2 text-[11px] opacity-65">结果会在当前区域完整显示</p>
              </div>
            )}
            {busy && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--sm-bg)]/80 backdrop-blur-sm"><Loader2 className="size-7 animate-spin text-[var(--sm-accent)]" /><p className="mt-3 text-xs">正在生成 {state?.name} 动态帧</p><p className="mt-1 text-[10px] text-[var(--sm-muted)]">{task?.progress ?? 0}%</p></div>}
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-[var(--sm-line)] pt-3 text-[11px] text-[var(--sm-muted)]">
            <span className="truncate">{ready ? `${task?.frameCount ?? 0} 帧 · ${fps} fps` : '生成完成后可切换静态与动态预览'}</span>
            <div className="flex shrink-0 rounded-[9px] border border-[var(--sm-line)] bg-[var(--sm-control)] p-0.5">
              {(['static', 'motion'] as PreviewMode[]).map((mode) => <button key={mode} type="button" aria-pressed={previewMode === mode} onClick={() => setPreviewMode(mode)} className={`rounded-[7px] px-3 py-1 text-[10px] ${previewMode === mode ? 'bg-[#ffc9b0] text-[#6f2600]' : 'text-[var(--sm-muted)]'}`}>{mode === 'static' ? '静态预览' : '动态预览'}</button>)}
            </div>
          </div>
        </main>

        <aside className="thin-scroll min-h-0 overflow-y-auto border-l border-[var(--sm-line)] bg-[var(--sm-sidebar)] p-3.5 max-[1120px]:overflow-visible max-[1120px]:border-l-0 max-[1120px]:border-t">
          <ToolCard className="flex items-center justify-between">
            <span className="text-sm font-medium">界面主题</span>
            <div className="flex rounded-xl bg-[var(--sm-control)] p-1">
              <button type="button" onClick={() => setTheme('light')} className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs ${theme === 'light' ? 'bg-white shadow-sm' : 'text-[var(--sm-muted)]'}`}><Sun className="size-4" />浅色</button>
              <button type="button" onClick={() => setTheme('dark')} className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs ${theme === 'dark' ? 'bg-[#29292c] shadow-sm' : 'text-[var(--sm-muted)]'}`}><Moon className="size-4" />深色</button>
            </div>
          </ToolCard>

          <ToolCard className="mt-3">
            <button type="button" onClick={() => uploadRef.current?.click()} className="flex w-full items-center gap-3 text-left">
              <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--sm-line)] bg-[var(--sm-control)] text-[var(--sm-accent)]"><Upload className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">上传角色图片</span><span className="mt-1 block text-xs text-[var(--sm-muted)]">PNG / JPG / WebP · 最大 8MB</span></span>
              <span className="text-xs text-[var(--sm-accent)]">选择</span>
            </button>
            <input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
          </ToolCard>

          <ToolCard className="mt-3">
            <div className="flex items-center justify-between"><span className="text-xs text-[var(--sm-muted)]">角色三视图</span><span className="text-[10px] text-[var(--sm-muted)]">{sourceUrl ? '已识别' : '等待上传'}</span></div>
            <div className="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-[var(--sm-control)]">
              {sourceUrl ? <div className="flex h-full w-full items-center justify-around gap-2 p-2">{[0, 1, 2].map((index) => <img key={index} src={sourceUrl} alt="" className="h-[82%] w-[30%] object-contain" style={{ transform: index === 1 ? 'scaleX(-1)' : undefined, opacity: index === 2 ? .72 : 1 }} />)}</div> : <span className="text-xs text-[var(--sm-muted)]">上传后自动识别或生成三视图</span>}
            </div>
          </ToolCard>

          <ToolCard className="mt-3">
            <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.18em] text-[var(--sm-accent)]">Motion library</p><h4 className="mt-1 text-base font-semibold">动作库</h4></div><span className="text-[10px] text-[var(--sm-muted)]">已同步任务规划</span></div>
            <label className="mt-3 flex h-9 items-center gap-2 rounded-xl border border-[var(--sm-line)] bg-[var(--sm-control)] px-3"><Search className="size-3.5 text-[var(--sm-muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索动作名称" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--sm-muted)]" /></label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {visibleStates.map((item) => {
                const active = item.id === state?.id
                return <button key={item.id} type="button" aria-pressed={active} className={`overflow-hidden rounded-xl border text-left ${active ? 'border-[var(--sm-accent)] bg-[#fff3ed]' : 'border-[var(--sm-line)] bg-[var(--sm-panel)]'}`}><div className="flex h-20 items-center justify-center" style={checkerboard}>{sourceUrl ? <img src={sourceUrl} alt="" className="h-[76%] w-[76%] object-contain" /> : <ImageIcon className="size-6 text-[var(--sm-muted)]" />}</div><div className="flex items-center justify-between px-2.5 py-2"><span className="text-xs font-medium">{ACTION_COVERS[item.id] ?? item.name}</span>{active && <span className="size-2 rounded-full bg-[var(--sm-accent)]" />}</div></button>
              })}
            </div>
            <button type="button" disabled={!task || busy || task.status === 'completed'} onClick={run} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ffc9b0] text-sm font-semibold text-[#6f2600] disabled:cursor-not-allowed disabled:opacity-45">{busy ? <Loader2 className="size-4 animate-spin" /> : task?.status === 'failed' ? <RefreshCw className="size-4" /> : <Play className="size-4" />}{busy ? '生成中' : task?.status === 'failed' ? '重新生成' : '生成'}</button>
          </ToolCard>

          <ToolCard className={`mt-3 ${ready ? '' : 'opacity-55'}`}>
            <div className="flex items-center justify-between"><p className="text-[11px] font-medium uppercase tracking-[.2em] text-[var(--sm-muted)]">导出</p><span className={`rounded-full px-2 py-0.5 text-[9px] ${ready ? 'bg-emerald-50 text-emerald-600' : 'border border-[var(--sm-line)] text-[var(--sm-muted)]'}`}>{ready ? '已解锁' : '生成后解锁'}</span></div>
            <fieldset disabled={!ready} className="mt-2 space-y-2 disabled:cursor-not-allowed">
              <div className="grid grid-cols-2 gap-2"><label className="text-[9px] text-[var(--sm-muted)]">帧率 (FPS)<input type="number" min={1} max={60} value={fps} onChange={(event) => setFps(Math.max(1, Math.min(60, Number(event.target.value) || 1)))} className="mt-1 h-8 w-full rounded-lg border border-[var(--sm-line)] bg-[var(--sm-control)] px-2.5 text-xs text-[var(--sm-ink)] outline-none" /></label><label className="text-[9px] text-[var(--sm-muted)]">导出缩放<select className="mt-1 h-8 w-full rounded-lg border border-[var(--sm-line)] bg-[var(--sm-control)] px-2 text-xs text-[var(--sm-ink)]"><option>1x (原始大小)</option><option>2x</option></select></label></div>
              <label className="flex min-h-10 items-center gap-2 rounded-[10px] border border-[var(--sm-line)] bg-[var(--sm-subtle)] px-2.5 py-2"><input type="checkbox" checked={backgroundTransparent} onChange={(event) => setBackgroundTransparent(event.target.checked)} className="size-4 accent-[var(--sm-accent)]" /><span><span className="block text-[10px] font-medium">导出透明背景</span><span className="block text-[8px] text-[var(--sm-muted)]">保持透明通道 (PNG) 或移除背景</span></span></label>
              <div className="rounded-[10px] border border-[var(--sm-line)] bg-[var(--sm-subtle)] px-2.5 py-2"><label className="flex items-center gap-2"><input type="checkbox" checked={chromaEnabled} onChange={(event) => setChromaEnabled(event.target.checked)} className="size-4 accent-[var(--sm-accent)]" /><span className="text-[10px] font-medium">背景移除（抠像）</span></label>{chromaEnabled && <label className="mt-2 block text-[9px] text-[var(--sm-muted)]"><span className="flex justify-between"><span>容差</span><span>{chromaTolerance}%</span></span><input type="range" min={0} max={100} value={chromaTolerance} onChange={(event) => setChromaTolerance(Number(event.target.value))} className="mt-1 w-full accent-[var(--sm-accent)]" /></label>}</div>
              <div className="grid grid-cols-2 gap-2"><button type="button" className="rounded-[10px] border border-[var(--sm-line)] bg-[var(--sm-subtle)] px-2 py-2 text-left"><span className="flex items-center gap-1 text-[11px] font-medium"><Download className="size-3" />宫格图 PNG</span><span className="mt-0.5 block text-[9px] text-[var(--sm-muted)]">{task?.frameCount} 帧 · {fps} fps</span></button><button type="button" className="rounded-[10px] border border-[var(--sm-line)] bg-[var(--sm-subtle)] px-2 py-2 text-left"><span className="flex items-center gap-1 text-[11px] font-medium"><Download className="size-3" />动画 GIF</span><span className="mt-0.5 block text-[9px] text-[var(--sm-muted)]">循环预览</span></button></div>
              <button type="button" onClick={() => task && onImport?.(task.id)} className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--sm-ink)] text-xs font-semibold text-[var(--sm-bg)]"><Check className="size-4" />导入游戏资产库</button>
            </fieldset>
          </ToolCard>
        </aside>
      </div>
    </div>
  )
}
