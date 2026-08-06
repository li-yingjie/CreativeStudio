import { useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eye,
  Image as ImageIcon,
  Layers,
  Lock,
  Save,
  Sparkles,
  Type,
  Upload,
} from '@/shared/icons'
import type {
  AssetItem,
  AssetLayer,
  AssetLayerManifest,
} from './ProjectAssetCatalog'

const RENDERER_LABEL = {
  'image-model': '图像模型',
  'raster-art': '艺术字 / 栅格',
  'true-text': '真文字',
  'brand-asset': '品牌资产',
  'source-asset': '已有素材',
} as const

function suggestedManifest(item: AssetItem, current: AssetLayerManifest): AssetLayerManifest {
  const { width, height } = current.canvas
  return {
    ...current,
    templateRef: {
      id: /Banner|banner/.test(item.label)
        ? 'template.campaign-kv-layered'
        : 'template.interest-card-layered',
      version: /Banner|banner/.test(item.label) ? '1.2.0' : '1.0.0',
      name: /Banner|banner/.test(item.label)
        ? '活动主视觉分层模板'
        : '兴趣卡图文分层模板',
    },
    layers: [
      {
        ...current.layers[0],
        id: 'suggested-background',
        name: '其余画面 · 整图背景',
        locked: true,
        z: 0,
      },
      {
        id: 'suggested-title',
        name: '标题文案',
        type: 'text',
        renderer: 'true-text',
        text: '夏日好礼放送中',
        fontRef: { id: 'font.douyin-sans', version: '2.0', family: '抖音 Sans' },
        x: Math.round(width * 0.08),
        y: Math.round(height * 0.1),
        width: Math.round(width * 0.56),
        height: Math.round(height * 0.16),
        z: 1,
        visible: true,
        locked: false,
      },
      {
        id: 'suggested-cta',
        name: '行动文案',
        type: 'text',
        renderer: 'true-text',
        text: '立即参与',
        fontRef: { id: 'font.douyin-sans', version: '2.0', family: '抖音 Sans' },
        x: Math.round(width * 0.68),
        y: Math.round(height * 0.7),
        width: Math.round(width * 0.22),
        height: Math.round(height * 0.12),
        z: 2,
        visible: true,
        locked: false,
      },
      {
        id: 'suggested-brand',
        name: '品牌标识',
        type: 'vector',
        renderer: 'brand-asset',
        src: '/assets/xiahua/footer-logo.png',
        x: Math.round(width * 0.72),
        y: Math.round(height * 0.08),
        width: Math.round(width * 0.2),
        height: Math.round(height * 0.09),
        z: 3,
        visible: true,
        locked: true,
      },
    ],
  }
}

function layerIcon(layer: AssetLayer) {
  if (layer.type === 'text') return Type
  if (layer.type === 'vector') return Layers
  return ImageIcon
}

export default function LayeredAssetEditor({
  item,
  initialManifest,
  onBack,
  onSave,
}: {
  item: AssetItem
  initialManifest: AssetLayerManifest
  onBack: () => void
  onSave: (manifest: AssetLayerManifest) => Promise<void> | void
}) {
  const [manifest, setManifest] = useState(() => ({
    ...initialManifest,
    canvas: { ...initialManifest.canvas },
    layers: initialManifest.layers.map((layer) => ({ ...layer })),
  }))
  const [selectedId, setSelectedId] = useState(initialManifest.layers.at(-1)?.id ?? null)
  const [analysisState, setAnalysisState] = useState<'idle' | 'running' | 'ready'>('idle')
  const [saving, setSaving] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const selected = manifest.layers.find((layer) => layer.id === selectedId) ?? null
  const orderedLayers = useMemo(
    () => [...manifest.layers].sort((a, b) => b.z - a.z),
    [manifest.layers],
  )
  const isSingleLayer = manifest.layers.length === 1

  const updateLayer = (id: string, patch: Partial<AssetLayer>) => {
    setManifest((current) => ({
      ...current,
      layers: current.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer),
    }))
  }

  const moveLayer = (direction: -1 | 1) => {
    if (!selected || selected.locked) return
    const layers = [...manifest.layers].sort((a, b) => a.z - b.z)
    const index = layers.findIndex((layer) => layer.id === selected.id)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= layers.length) return
    const target = layers[targetIndex]
    const currentZ = layers[index].z
    layers[index] = { ...layers[index], z: target.z }
    layers[targetIndex] = { ...target, z: currentZ }
    setManifest((current) => ({ ...current, layers }))
  }

  const analyze = () => {
    setAnalysisState('running')
    window.setTimeout(() => setAnalysisState('ready'), 650)
  }

  const adoptSuggestion = () => {
    const next = suggestedManifest(item, manifest)
    setManifest(next)
    setSelectedId(next.layers[1]?.id ?? next.layers[0]?.id ?? null)
    setAnalysisState('idle')
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 450))
      await onSave(manifest)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file || !selected) return
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              updateLayer(selected.id, { src: reader.result, type: 'upload', renderer: 'source-asset' })
            }
          }
          reader.readAsDataURL(file)
          event.currentTarget.value = ''
        }}
      />

      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3">
        <button type="button" onClick={onBack} className="flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)]">
          <ArrowLeft className="size-3.5" /> 返回素材详情
        </button>
        <span className="h-4 w-px bg-[var(--divider)]" />
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-[var(--color-ink)]">{item.label}</p>
          <p className="truncate text-[9px] text-[var(--color-ink)]/38">
            {manifest.templateRef ? `${manifest.templateRef.name} v${manifest.templateRef.version}` : '单图 manifest · 未引用分层模板'}
          </p>
        </div>
        <span className="ml-1 rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ink)]/55">{manifest.layers.length} 层</span>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="ml-auto flex h-7 items-center gap-1.5 rounded-lg bg-[var(--color-ink)] px-3 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Save className="size-3.5" /> {saving ? '正在生成扁平图…' : '保存为新版本'}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="thin-scroll w-[184px] shrink-0 overflow-y-auto border-r border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-2.5">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold text-[var(--color-ink)]/65">图层</span>
            <span className="text-[9px] text-[var(--color-ink)]/34">从上到下</span>
          </div>
          <div className="space-y-1">
            {orderedLayers.map((layer) => {
              const Icon = layerIcon(layer)
              const active = selectedId === layer.id
              return (
                <div
                  key={layer.id}
                  className={`flex w-full items-center gap-1 rounded-lg pr-1 ${active ? 'bg-[#EAF3FF] text-[#175CD3]' : 'text-[var(--color-ink)]/62 hover:bg-[var(--fill-hover)]'}`}
                >
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedId(layer.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left"
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{layer.name}</span>
                    {layer.locked ? <Lock className="size-3 shrink-0 opacity-45" /> : null}
                  </button>
                  <button
                    type="button"
                    aria-label={`${layer.visible ? '隐藏' : '显示'}${layer.name}`}
                    aria-pressed={layer.visible}
                    title={layer.locked ? '该图层由模板锁定' : undefined}
                    disabled={layer.locked}
                    onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                    className={`flex size-5 shrink-0 items-center justify-center rounded hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 ${layer.visible ? '' : 'opacity-25'}`}
                  >
                    <Eye className="size-3" />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-2.5">
            <p className="text-[9px] font-semibold text-[var(--color-ink)]/60">布局受模板保护</p>
            <p className="mt-1 text-[8px] leading-3.5 text-[var(--color-ink)]/38">本版先编辑内容、显隐和层序，不允许自由拖拽改变安全区。</p>
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F3F4F6]">
          {isSingleLayer && (
            <div className="m-3 mb-0 rounded-xl border border-[#D8CCFF] bg-[#F5F1FF] p-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-[#6C5CE7]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-[#493F7A]">当前保持单图最稳定</p>
                  <p className="mt-0.5 text-[9px] leading-4 text-[#493F7A]/65">{item.layeringHint?.reason ?? 'Agent 只会建议拆出高价值的真文字、Logo、价格和行动按钮，其余画面保留为整图背景。'}</p>
                </div>
                <button
                  type="button"
                  onClick={analysisState === 'ready' ? adoptSuggestion : analyze}
                  disabled={analysisState === 'running'}
                  className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-[#6C5CE7] px-2.5 text-[10px] font-medium text-white disabled:opacity-55"
                >
                  {analysisState === 'running' ? '分析中…' : analysisState === 'ready' ? '采用 3 个建议图层' : '分析可拆分元素'}
                </button>
              </div>
              {analysisState === 'ready' && (
                <div className="mt-2 flex items-center gap-1.5 border-t border-[#6C5CE7]/15 pt-2 text-[8px] text-[#493F7A]/60">
                  <Check className="size-3 text-emerald-600" /> 高置信候选：标题文案、行动文案、品牌标识；艺术字与插画区不拆。
                </div>
              )}
            </div>
          )}

          <div className="thin-scroll flex min-h-0 flex-1 items-center justify-center overflow-auto p-5">
            <div
              className="relative max-h-full overflow-hidden rounded-md bg-[#2E211D] shadow-[0_14px_36px_rgba(22,25,33,0.18)]"
              style={{
                aspectRatio: `${manifest.canvas.width} / ${manifest.canvas.height}`,
                width: manifest.canvas.width >= manifest.canvas.height ? 'min(100%, 680px)' : 'min(72%, 430px)',
              }}
            >
              {[...manifest.layers].sort((a, b) => a.z - b.z).map((layer) => {
                if (!layer.visible) return null
                const active = layer.id === selectedId
                const style = {
                  left: `${layer.x / manifest.canvas.width * 100}%`,
                  top: `${layer.y / manifest.canvas.height * 100}%`,
                  width: `${layer.width / manifest.canvas.width * 100}%`,
                  height: `${layer.height / manifest.canvas.height * 100}%`,
                  opacity: layer.opacity ?? 1,
                  zIndex: layer.z,
                }
                return (
                  <button
                    key={layer.id}
                    type="button"
                    aria-label={`选中图层：${layer.name}`}
                    onClick={() => setSelectedId(layer.id)}
                    className={`absolute overflow-hidden text-left ${active ? 'ring-2 ring-[#3478FF] ring-inset' : 'hover:ring-1 hover:ring-[#3478FF]/55 hover:ring-inset'}`}
                    style={style}
                  >
                    {layer.type === 'text' ? (
                      <span className="flex size-full items-center justify-center overflow-hidden px-1 text-center text-[clamp(8px,1.8vw,24px)] font-semibold leading-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">{layer.text}</span>
                    ) : layer.src ? (
                      <img src={layer.src} alt="" draggable={false} className={`size-full ${layer.id.includes('base') || layer.id === 'flat-root' || layer.id === 'suggested-background' ? 'object-cover' : 'object-contain'}`} />
                    ) : (
                      <span className="flex size-full items-center justify-center bg-black/10 text-[8px] text-white/65">{layer.name}</span>
                    )}
                  </button>
                )
              })}
              {analysisState === 'ready' && isSingleLayer ? (
                <div className="pointer-events-none absolute inset-0 z-50">
                  <span className="absolute left-[8%] top-[10%] h-[16%] w-[56%] rounded border border-dashed border-[#B8A6FF] bg-[#6C5CE7]/15" />
                  <span className="absolute left-[68%] top-[70%] h-[12%] w-[22%] rounded border border-dashed border-[#B8A6FF] bg-[#6C5CE7]/15" />
                  <span className="absolute left-[72%] top-[8%] h-[9%] w-[20%] rounded border border-dashed border-[#B8A6FF] bg-[#6C5CE7]/15" />
                </div>
              ) : null}
            </div>
          </div>
        </main>

        <aside className="thin-scroll w-[238px] shrink-0 overflow-y-auto border-l border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-3">
          <h2 className="text-[11px] font-semibold text-[var(--color-ink)]">图层属性</h2>
          {selected ? (
            <div className="mt-3 space-y-4">
              <section>
                <p className="text-[10px] font-medium text-[var(--color-ink)]/65">{selected.name}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded bg-[var(--fill-subtle)] px-1.5 py-1 text-[8px] text-[var(--color-ink)]/52">{RENDERER_LABEL[selected.renderer]}</span>
                  {selected.locked ? <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-1 text-[8px] text-amber-700"><Lock className="size-2.5" /> 锁定</span> : null}
                </div>
              </section>

              {selected.type === 'text' ? (
                <label className="block">
                  <span className="text-[9px] font-medium text-[var(--color-ink)]/48">文字内容</span>
                  <textarea
                    value={selected.text ?? ''}
                    disabled={selected.locked}
                    onChange={(event) => updateLayer(selected.id, { text: event.target.value })}
                    className="mt-1.5 h-20 w-full resize-none rounded-lg border border-[var(--divider)] bg-white px-2.5 py-2 text-[10px] leading-4 text-[var(--color-ink)] outline-none focus:border-[#3478FF]/55 disabled:cursor-not-allowed disabled:bg-[var(--fill-subtle)] disabled:text-[var(--color-ink)]/42"
                  />
                  <span className="mt-1 block text-[8px] text-[var(--color-ink)]/34">{selected.fontRef ? `${selected.fontRef.family} v${selected.fontRef.version}` : '未绑定字体版本'}</span>
                </label>
              ) : (
                <section>
                  <p className="text-[9px] font-medium text-[var(--color-ink)]/48">图像内容</p>
                  <div className="mt-1.5 rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-2">
                    <p className="truncate text-[8px] text-[var(--color-ink)]/45">{selected.src ?? '待绑定资产'}</p>
                    {!selected.locked ? (
                      <button type="button" onClick={() => uploadInputRef.current?.click()} className="mt-2 flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-[var(--divider)] bg-white text-[9px] font-medium text-[var(--color-ink)]/58 hover:bg-[var(--fill-hover)]">
                        <Upload className="size-3" /> 替换当前图层
                      </button>
                    ) : null}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-medium text-[var(--color-ink)]/48">层序与显示</p>
                  <div className="flex gap-1">
                    <button type="button" aria-label="下移图层" disabled={selected.locked} onClick={() => moveLayer(-1)} className="flex size-6 items-center justify-center rounded border border-[var(--divider)] disabled:opacity-30"><ArrowDown className="size-3" /></button>
                    <button type="button" aria-label="上移图层" disabled={selected.locked} onClick={() => moveLayer(1)} className="flex size-6 items-center justify-center rounded border border-[var(--divider)] disabled:opacity-30"><ArrowUp className="size-3" /></button>
                  </div>
                </div>
                <label className="mt-2 block text-[8px] text-[var(--color-ink)]/38">
                  不透明度 {Math.round((selected.opacity ?? 1) * 100)}%
                  <input type="range" min="0.1" max="1" step="0.05" value={selected.opacity ?? 1} disabled={selected.locked} onChange={(event) => updateLayer(selected.id, { opacity: Number(event.target.value) })} className="mt-1 w-full accent-[#3478FF] disabled:cursor-not-allowed disabled:opacity-35" />
                </label>
              </section>

              <section className="rounded-xl border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-2.5">
                <p className="text-[9px] font-semibold text-[var(--color-ink)]/58">位置由模板锁定</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[8px]">
                  <div><dt className="text-[var(--color-ink)]/30">X / Y</dt><dd className="mt-0.5 text-[var(--color-ink)]/52">{selected.x} / {selected.y}</dd></div>
                  <div><dt className="text-[var(--color-ink)]/30">宽 / 高</dt><dd className="mt-0.5 text-[var(--color-ink)]/52">{selected.width} / {selected.height}</dd></div>
                </dl>
              </section>

              <section className="border-t border-[var(--divider-soft)] pt-3">
                <p className="text-[9px] font-semibold text-[var(--color-ink)]/58">生成与校验依据</p>
                <p className="mt-1 text-[8px] leading-3.5 text-[var(--color-ink)]/38">
                  {manifest.templateRef ? `${manifest.templateRef.name} v${manifest.templateRef.version}` : '未引用模板'}
                  {manifest.styleBibleRef ? ` · ${manifest.styleBibleRef.name} v${manifest.styleBibleRef.version}` : ''}
                </p>
              </section>
            </div>
          ) : (
            <p className="mt-3 text-[9px] text-[var(--color-ink)]/35">选中一个图层查看可编辑内容。</p>
          )}
        </aside>
      </div>
    </div>
  )
}
