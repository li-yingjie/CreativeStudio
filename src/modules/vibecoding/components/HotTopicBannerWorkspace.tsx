import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  Eye,
  Image as ImageIcon,
  Layers,
  Lock,
  RotateCcw,
  Save,
  Type,
} from '@/shared/icons'
import type { AssetLayer, AssetLayerManifest } from './ProjectAssetCatalog'

type BannerLayer = AssetLayer & {
  color?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
}

type BannerManifest = Omit<AssetLayerManifest, 'layers'> & { layers: BannerLayer[] }

type ArtworkId = 'banner' | 'poster'

type ArtworkDefinition = {
  id: ArtworkId
  label: string
  shortLabel: string
  version: string
  manifest: BannerManifest
  maxWidth: number
  specRows: readonly [string, string][]
  notes: readonly string[]
}

const INITIAL_MANIFEST: BannerManifest = {
  canvas: { width: 1170, height: 330 },
  templateRef: {
    id: 'template.hot-topic-banner',
    version: '6.7.8',
    name: '无 IP 热点话题 Banner',
  },
  styleBibleRef: {
    id: 'brand.douyin-life-service-resource-spec',
    version: '1.0.0',
    name: '生活服务资源位规范',
  },
  layers: [
    {
      id: 'scene',
      name: '主题画面与固定件',
      type: 'raster',
      renderer: 'image-model',
      src: '/assets/hot-topic-banner/industry-showcase-base-1170x330.png',
      x: 0,
      y: 0,
      width: 1170,
      height: 330,
      z: 0,
      visible: true,
      locked: true,
    },
    {
      id: 'brand-logo',
      name: '抖音生活服务 Logo',
      type: 'raster',
      renderer: 'brand-asset',
      src: '/assets/hot-topic-banner/douyin-life-service-logo.png',
      x: 27,
      y: 25,
      width: 192,
      height: 32.5,
      z: 1,
      visible: true,
      locked: true,
    },
    {
      id: 'title',
      name: '主标题',
      type: 'text',
      renderer: 'true-text',
      text: '行业热点专项',
      fontRef: {
        id: 'font.fangfang-xianfeng',
        version: '100',
        family: '字魂100号-方方先锋体',
      },
      color: '#FF5239',
      fontSize: 105,
      fontWeight: 400,
      letterSpacing: -7.35,
      textAlign: 'left',
      x: 66.5,
      y: 105.5,
      width: 585,
      height: 99,
      z: 2,
      visible: true,
      locked: false,
    },
    {
      id: 'subtitle',
      name: '副标题',
      type: 'text',
      renderer: 'true-text',
      text: '今天又拿捏“热点”了',
      fontRef: {
        id: 'font.fangfang-xianfeng',
        version: '100',
        family: '字魂100号-方方先锋体',
      },
      color: '#FF5239',
      fontSize: 36,
      fontWeight: 400,
      letterSpacing: -1.8,
      textAlign: 'center',
      x: 199.8,
      y: 224.5,
      width: 308.5,
      height: 34,
      z: 3,
      visible: true,
      locked: false,
    },
  ],
}

const POSTER_MANIFEST: BannerManifest = {
  canvas: { width: 536, height: 800 },
  templateRef: {
    id: 'template.creative-poster',
    version: '1.0.0',
    name: '星河灵感创意海报',
  },
  styleBibleRef: {
    id: 'brand.poster-editor-demo',
    version: '1.0.0',
    name: '创意海报视觉规范',
  },
  layers: [
    {
      id: 'scene',
      name: '星河雄狮主题画面',
      type: 'raster',
      renderer: 'image-model',
      src: '/assets/workshop/magicx-cases/poster-redfox.jpg',
      x: 0,
      y: 0,
      width: 536,
      height: 800,
      z: 0,
      visible: true,
      locked: true,
    },
    {
      id: 'atmosphere',
      name: '文字可读性氛围层',
      type: 'vector',
      renderer: 'source-asset',
      src: '/assets/hot-topic-banner/poster-vignette.svg',
      x: 0,
      y: 0,
      width: 536,
      height: 800,
      z: 1,
      visible: true,
      locked: true,
    },
    {
      id: 'eyebrow',
      name: '栏目与日期',
      type: 'text',
      renderer: 'true-text',
      text: 'WILD IMAGINATION · 08/14',
      fontRef: { id: 'font.douyin-sans', version: '1', family: 'Douyin Sans' },
      color: '#B8F3FF',
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: 2.2,
      textAlign: 'center',
      x: 62,
      y: 42,
      width: 412,
      height: 28,
      z: 2,
      visible: true,
      locked: false,
    },
    {
      id: 'title',
      name: '主标题',
      type: 'text',
      renderer: 'true-text',
      text: '向旷野，重新想象',
      fontRef: { id: 'font.source-han-sans', version: 'VF', family: '思源黑体' },
      color: '#FFFFFF',
      fontSize: 43,
      fontWeight: 900,
      letterSpacing: -1.8,
      textAlign: 'center',
      x: 48,
      y: 650,
      width: 440,
      height: 56,
      z: 3,
      visible: true,
      locked: false,
    },
    {
      id: 'subtitle',
      name: '副标题',
      type: 'text',
      renderer: 'true-text',
      text: '灵感不设边界 · 创作自有回响',
      fontRef: { id: 'font.douyin-sans', version: '1', family: 'Douyin Sans' },
      color: '#D9F8FF',
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: 1,
      textAlign: 'center',
      x: 66,
      y: 716,
      width: 404,
      height: 32,
      z: 4,
      visible: true,
      locked: false,
    },
  ],
}

const ARTWORKS: Record<ArtworkId, ArtworkDefinition> = {
  banner: {
    id: 'banner',
    label: '行业热点专项 · 1170×330',
    shortLabel: '热点 Banner',
    version: 'v6.7.8',
    manifest: INITIAL_MANIFEST,
    maxWidth: 1170,
    notes: ['主标题 3–14 字', '副标题 ≤ 16 字', '右侧主题画面受保护', '同步输出 780×220'],
    specRows: [
      ['画布', '1170 × 330，RGB PNG'],
      ['同步规格', '780 × 220，等比缩制一次'],
      ['主标题', '3–14 个可见字符；超规阻断'],
      ['副标题', '选填，建议不超过 16 字'],
      ['文字安全区', 'x 80–650；不侵入主题画面'],
      ['保护区', '右侧场景与固定件像素不可改写'],
    ],
  },
  poster: {
    id: 'poster',
    label: '向旷野，重新想象 · 536×800',
    shortLabel: '创意海报',
    version: 'v1.0.0',
    manifest: POSTER_MANIFEST,
    maxWidth: 536,
    notes: ['竖版 2:3', '标题 ≤ 12 字', '主题画面受保护', '文字保持真实图层'],
    specRows: [
      ['画布', '536 × 800，RGB JPG / PNG'],
      ['主标题', '建议 4–12 字，最多两行'],
      ['栏目行', '英文大写；字距 2–3px'],
      ['副标题', '选填，不超过 20 字'],
      ['文字安全区', '左右各 48px；底部保留 44px'],
      ['保护区', '雄狮、月亮与动物主体不可改写'],
    ],
  },
}

const deepCopyManifest = (source: BannerManifest): BannerManifest => ({
  ...source,
  canvas: { ...source.canvas },
  templateRef: source.templateRef
    ? { ...source.templateRef }
    : undefined,
  styleBibleRef: source.styleBibleRef
    ? { ...source.styleBibleRef }
    : undefined,
  layers: source.layers.map((layer) => ({ ...layer })),
})

const layerIcon = (layer: BannerLayer) => {
  if (layer.type === 'text') return Type
  if (layer.type === 'vector') return Layers
  return ImageIcon
}

function LayerPreview({
  layer,
  active,
  canvas,
  onSelect,
}: {
  layer: BannerLayer
  active: boolean
  canvas: BannerManifest['canvas']
  onSelect: () => void
}) {
  if (!layer.visible) return null
  const commonStyle = {
    left: `${(layer.x / canvas.width) * 100}%`,
    top: `${(layer.y / canvas.height) * 100}%`,
    width: `${(layer.width / canvas.width) * 100}%`,
    height: `${(layer.height / canvas.height) * 100}%`,
    opacity: layer.opacity ?? 1,
    zIndex: layer.z,
  }
  return (
    <button
      type="button"
      aria-label={`选择图层：${layer.name}`}
      aria-pressed={active}
      onClick={onSelect}
      className={`absolute overflow-hidden text-left outline-none ${
        active
          ? 'ring-2 ring-inset ring-[#3370FF]'
          : 'hover:ring-1 hover:ring-inset hover:ring-[#3370FF]/55'
      }`}
      style={commonStyle}
    >
      {layer.type === 'text' ? (
        <span
          className="flex size-full items-center overflow-hidden leading-[1.05]"
          style={{
            color: layer.color ?? '#161823',
            fontSize: `${((layer.fontSize ?? 32) / canvas.width) * 100}cqw`,
            fontWeight: layer.fontWeight ?? 700,
            fontFamily:
              layer.fontRef?.id === 'font.fangfang-xianfeng'
                ? '"FangFang XianFeng", sans-serif'
                : undefined,
            letterSpacing: `${((layer.letterSpacing ?? 0) / canvas.width) * 100}cqw`,
            lineHeight: 1,
            whiteSpace: 'pre',
            justifyContent:
              layer.textAlign === 'center'
                ? 'center'
                : layer.textAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
            textAlign: layer.textAlign ?? 'left',
          }}
        >
          {layer.text}
        </span>
      ) : layer.src ? (
        <img
          src={layer.src}
          alt=""
          draggable={false}
          className={`size-full ${layer.id === 'scene' ? 'object-cover' : 'object-contain'}`}
        />
      ) : null}
    </button>
  )
}

export default function HotTopicBannerWorkspace() {
  const [artworkId, setArtworkId] = useState<ArtworkId>('banner')
  const artwork = ARTWORKS[artworkId]
  const [manifests, setManifests] = useState<Record<ArtworkId, BannerManifest>>(() => ({
    banner: deepCopyManifest(ARTWORKS.banner.manifest),
    poster: deepCopyManifest(ARTWORKS.poster.manifest),
  }))
  const manifest = manifests[artworkId]
  const [selectedId, setSelectedId] = useState('title')
  const [editorTab, setEditorTab] = useState<'layers' | 'spec'>('layers')
  const selected = manifest.layers.find((layer) => layer.id === selectedId) ?? null
  const orderedLayers = useMemo(
    () => [...manifest.layers].sort((a, b) => b.z - a.z),
    [manifest.layers],
  )

  const updateLayer = (id: string, patch: Partial<BannerLayer>) => {
    setManifests((current) => ({
      ...current,
      [artworkId]: {
        ...current[artworkId],
        layers: current[artworkId].layers.map((layer) =>
          layer.id === id ? { ...layer, ...patch } : layer,
        ),
      },
    }))
  }

  const reset = () => {
    setManifests((current) => ({
      ...current,
      [artworkId]: deepCopyManifest(artwork.manifest),
    }))
    setSelectedId('title')
    toast(`已恢复到 ${artwork.version} 初始版本`)
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#F5F6F7]">
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-black/[0.07] bg-white px-4">
          <Layers className="size-3.5 text-[#161823]/45" />
          <span className="text-[11px] font-semibold text-[#161823]">素材库</span>
          <span className="text-[10px] text-[#161823]/32">/</span>
          <span className="min-w-0 truncate text-[10px] text-[#161823]/58">
            {artwork.label}
          </span>
          <span className="ml-1 shrink-0 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-medium text-emerald-700">
            {manifest.layers.length} 个图层
          </span>
          <button
            type="button"
            onClick={reset}
            className="ml-auto grid size-7 place-items-center rounded-lg text-[#161823]/42 hover:bg-[#F2F3F5] hover:text-[#161823]"
            aria-label={`重置${artwork.shortLabel}`}
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              toast.success('已保存为新版本', {
                description: '扁平交付图和可编辑图层清单已同步更新。',
              })
            }
            className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-[#161823] px-3 text-[9px] font-medium text-white hover:bg-[#2C2D35]"
          >
            <Save className="size-3" />保存版本
          </button>
        </header>

        <div
          className="relative min-h-0 flex-1 overflow-auto p-8"
          style={{
            backgroundColor: '#EEF0F3',
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(22,24,35,0.11) 1px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        >
          <div className="flex min-h-full min-w-0 items-center justify-center">
            <div className="min-w-0 w-full" style={{ maxWidth: artwork.maxWidth }}>
              <div className="mb-4 space-y-2.5">
                <div aria-label="图片产物" className="grid grid-cols-2 rounded-xl bg-black/[0.055] p-1">
                  {(Object.values(ARTWORKS) as ArtworkDefinition[]).map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      aria-pressed={artworkId === candidate.id}
                      onClick={() => {
                        setArtworkId(candidate.id)
                        setSelectedId('title')
                        setEditorTab('layers')
                      }}
                      className={`h-8 rounded-lg text-[9px] font-medium transition-colors ${
                        artworkId === candidate.id
                          ? 'bg-white text-[#161823] shadow-sm'
                          : 'text-[#161823]/45 hover:text-[#161823]'
                      }`}
                    >
                      {candidate.shortLabel}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 text-[9px] text-[#161823]/38">
                  <span className="truncate">成品画布 · 点击元素选择图层</span>
                  <span className="shrink-0">100% · RGB PNG</span>
                </div>
              </div>
              <div
                className="relative w-full overflow-hidden bg-white shadow-[0_18px_50px_rgba(31,35,41,0.16)]"
                style={{
                  aspectRatio: `${manifest.canvas.width} / ${manifest.canvas.height}`,
                  containerType: 'inline-size',
                }}
              >
                {[...manifest.layers]
                  .sort((a, b) => a.z - b.z)
                  .map((layer) => (
                    <LayerPreview
                      key={layer.id}
                      layer={layer}
                      active={selectedId === layer.id}
                      canvas={manifest.canvas}
                      onSelect={() => {
                        setSelectedId(layer.id)
                        setEditorTab('layers')
                      }}
                    />
                  ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[8px] text-[#161823]/38">
                {artwork.notes.map((note) => (
                  <span key={note} className="rounded bg-white px-2 py-1 shadow-sm">{note}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside aria-label="图片编辑器" className="flex w-[320px] shrink-0 flex-col border-l border-black/[0.08] bg-white">
        <div className="shrink-0 border-b border-black/[0.07] px-4 pb-3 pt-3.5">
          <p className="text-[12px] font-semibold text-[#161823]">编辑器</p>
          <p className="mt-0.5 text-[8px] text-[#161823]/34">{artwork.shortLabel} · {artwork.version}</p>
          <div className="mt-3 grid grid-cols-2 rounded-lg bg-[#F2F3F5] p-1">
            {([
              ['layers', '图层与属性'],
              ['spec', '交付规范'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setEditorTab(id)}
                className={`h-7 rounded-md text-[9px] font-medium ${
                  editorTab === id
                    ? 'bg-white text-[#161823] shadow-sm'
                    : 'text-[#161823]/44 hover:text-[#161823]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-3.5">
          {editorTab === 'layers' ? (
            <>
              <div className="space-y-1">
                {orderedLayers.map((layer) => {
                  const Icon = layerIcon(layer)
                  const active = selectedId === layer.id
                  return (
                    <div
                      key={layer.id}
                      className={`flex items-center rounded-lg pr-1 ${
                        active ? 'bg-[#EAF3FF] text-[#175CD3]' : 'text-[#161823]/62 hover:bg-[#F5F6F7]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(layer.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left"
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate text-[9px] font-medium">{layer.name}</span>
                        {layer.locked ? <Lock className="size-3 opacity-45" /> : null}
                      </button>
                      <button
                        type="button"
                        aria-label={`${layer.visible ? '隐藏' : '显示'}${layer.name}`}
                        disabled={layer.locked}
                        onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                        className={`grid size-6 place-items-center rounded disabled:cursor-not-allowed disabled:opacity-25 ${layer.visible ? '' : 'opacity-30'}`}
                      >
                        <Eye className="size-3" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {selected ? (
                <section className="mt-4 border-t border-black/[0.07] pt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-semibold text-[#161823]">{selected.name}</p>
                    {selected.locked ? (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[7px] font-medium text-amber-700">受保护</span>
                    ) : (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[7px] font-medium text-emerald-700">可编辑</span>
                    )}
                  </div>

                  {selected.type === 'text' ? (
                    <div className="mt-3 space-y-3">
                      <label className="block">
                        <span className="text-[8px] font-medium text-[#161823]/48">文字内容</span>
                        <textarea
                          value={selected.text ?? ''}
                          onChange={(event) => updateLayer(selected.id, { text: event.target.value })}
                          rows={3}
                          className="mt-1.5 w-full resize-none rounded-lg border border-black/[0.09] px-2.5 py-2 text-[10px] leading-4 text-[#161823] outline-none focus:border-[#3370FF]/45 focus:ring-2 focus:ring-[#3370FF]/10"
                        />
                      </label>
                      <div className="grid grid-cols-[1fr_78px] gap-2">
                        <label className="block">
                          <span className="text-[8px] font-medium text-[#161823]/48">字色</span>
                          <div className="mt-1.5 flex h-8 items-center gap-2 rounded-lg border border-black/[0.09] px-2">
                            <input
                              type="color"
                              value={selected.color ?? '#161823'}
                              onChange={(event) => updateLayer(selected.id, { color: event.target.value })}
                              className="size-4 cursor-pointer border-0 bg-transparent p-0"
                            />
                            <span className="text-[8px] uppercase text-[#161823]/52">{selected.color}</span>
                          </div>
                        </label>
                        <label className="block">
                          <span className="text-[8px] font-medium text-[#161823]/48">字号</span>
                          <input
                            type="number"
                            min="24"
                            max="130"
                            value={selected.fontSize ?? 32}
                            onChange={(event) => updateLayer(selected.id, { fontSize: Number(event.target.value) })}
                            className="mt-1.5 h-8 w-full rounded-lg border border-black/[0.09] px-2 text-[9px] outline-none focus:border-[#3370FF]/45"
                          />
                        </label>
                      </div>
                      <label className="block text-[8px] text-[#161823]/44">
                        不透明度 {Math.round((selected.opacity ?? 1) * 100)}%
                        <input
                          type="range"
                          min="0.2"
                          max="1"
                          step="0.05"
                          value={selected.opacity ?? 1}
                          onChange={(event) => updateLayer(selected.id, { opacity: Number(event.target.value) })}
                          className="mt-1.5 w-full accent-[#3370FF]"
                        />
                      </label>
                      <p className="rounded-lg bg-[#F6F7F8] px-2.5 py-2 text-[8px] leading-[13px] text-[#161823]/38">
                        字体：{selected.fontRef?.family} v{selected.fontRef?.version}。位置和安全区由模板锁定，文案与样式可编辑。
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-black/[0.07] bg-[#F7F8F9] p-3">
                      <p className="text-[8px] leading-[13px] text-[#161823]/42">
                        {selected.id === 'scene'
                          ? artworkId === 'poster'
                            ? '雄狮、月亮、星云和动物群属于同一受保护主题画面；可整体替换，不在编辑器内破坏性抠图。'
                            : '主题实物、Hot!、#、爱心和心内音符属于同一受保护画面，返修时整图重生，不做局部抠图。'
                          : selected.id === 'brand-logo'
                            ? 'Logo 原形、顺序与安全距离固定，不允许拉伸或改色。'
                            : artworkId === 'poster'
                              ? '氛围层仅保障标题对比度和底部安全线，不改变主题画面内容。'
                              : '底板定义左侧文字安全区和固定波浪线，不允许越界移动。'}
                      </p>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-[8px]">
                        <div><dt className="text-[#161823]/30">位置</dt><dd className="mt-0.5 text-[#161823]/58">{selected.x}, {selected.y}</dd></div>
                        <div><dt className="text-[#161823]/30">尺寸</dt><dd className="mt-0.5 text-[#161823]/58">{selected.width} × {selected.height}</dd></div>
                      </dl>
                    </div>
                  )}
                </section>
              ) : null}
            </>
          ) : (
            <div className="space-y-3">
              {artwork.specRows.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-black/[0.07] p-3">
                  <p className="text-[8px] text-[#161823]/34">{label}</p>
                  <p className="mt-1 text-[9px] font-medium text-[#161823]/72">{value}</p>
                </div>
              ))}
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800/70">
                <p className="flex items-center gap-1.5 text-[9px] font-semibold"><Check className="size-3" />已绑定生产规则</p>
                <p className="mt-1.5 text-[8px] leading-[13px]">文案门禁、四色语义路由、固定件检查、锐度检查和保护像素校验均随版本保存。</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
