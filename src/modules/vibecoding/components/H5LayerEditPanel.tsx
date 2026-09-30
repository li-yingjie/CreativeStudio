import { useState } from 'react'
import {
  X,
  Image as ImageIcon,
  RefreshCw,
  Type,
  Upload,
  Ruler,
  Play,
  Crop,
  Box,
  Move,
  Copy,
  Eye,
  Lock,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Clock,
  History,
  FileText,
  Gift,
  ListChecks,
  ScrollText,
  type LucideIcon,
} from '@/shared/icons'
import type { H5CanvasNode } from './H5CanvasModel'

/**
 * H5 图层编辑面板 — 跟随左侧预览选中的对象刷新不同的编辑属性。两级选择：
 * 选中「楼层」给整楼层属性（头图那套 / 倒计时 / 介绍 …），选中楼层内的
 * 「元素」（主标题 / 正文 / 按钮 / 图片）给该元素的细粒度属性（文案·字号·
 * 颜色 / 按钮文案·底色 / 图片替换）。无选中 ⇒ 整体活动配置。纯本地演示。
 */

export type H5LayerId =
  | 'hero'
  | 'countdown'
  | 'intro'
  | 'lottery'
  | 'task'
  | 'rules'

/** 楼层内可单独选中的元素类型。 */
export type H5ElementKind = 'text' | 'button' | 'image' | 'card'

/** 一个被选中的楼层内元素。`value` 携带当前文案 / 图片地址，便于编辑器预填。 */
export interface H5ElementSel {
  layer: H5LayerId
  /** 楼层内唯一 id，如 'intro.title'。 */
  id: string
  kind: H5ElementKind
  /** 展示名：主标题 / 正文 / 按钮 / 图片 … */
  label: string
  /** 当前内容：文本（text/button）或图片地址（image）。 */
  value?: string
  /** 图片生成提示词；图片对象会直接在预览图下方展示。 */
  prompt?: string
}

/** 当前选择：楼层级 / 元素级；null ⇒ 整体活动配置。 */
export type H5Selection =
  | { type: 'layer'; layer: H5LayerId }
  | { type: 'element'; el: H5ElementSel }

const HERO_IMG = '/assets/acg-new-year/hero.jpg'
const LOTTERY_IMG = '/assets/acg-new-year/main-video.jpg'

// Shared with the preview/editor shell; keeping this map beside its layer
// types avoids two sources of truth for the H5 editing model.
// eslint-disable-next-line react-refresh/only-export-components
export const H5_LAYER_META: Record<H5LayerId, { label: string; icon: LucideIcon }> = {
  hero: { label: '头图', icon: ImageIcon },
  countdown: { label: '游戏会场', icon: Clock },
  intro: { label: '主会场视频', icon: FileText },
  lottery: { label: '开年高燃', icon: Gift },
  task: { label: '榜单互动', icon: ListChecks },
  rules: { label: '页面尾部', icon: ScrollText },
}

type H5ObjectDisplayKind = 'page' | 'component' | H5ElementKind

type H5ComponentPreviewCrop = {
  sources: Array<{ src: string; top: number }>
  sourceWidth: number
  sourceHeight: number
  x: number
  y: number
  width: number
  height: number
}

const GAME_SWITCHER_PREVIEW = '/assets/acg-new-year/exact-game-switcher.png'
const WORK_CARD_PREVIEW_SOURCES = [
  { src: '/assets/acg-new-year/exact-lower-top.png', top: 0 },
  { src: '/assets/acg-new-year/exact-lower-bottom.png', top: 985 },
] as const

const CARD_COMPONENT_PREVIEWS: Record<string, H5ComponentPreviewCrop> = {
  'countdown.dnf': {
    sources: [{ src: GAME_SWITCHER_PREVIEW, top: 0 }],
    sourceWidth: 734,
    sourceHeight: 181,
    x: 0,
    y: 0,
    width: 232,
    height: 160,
  },
  'countdown.egg-party': {
    sources: [{ src: GAME_SWITCHER_PREVIEW, top: 0 }],
    sourceWidth: 734,
    sourceHeight: 181,
    x: 244,
    y: 8,
    width: 216,
    height: 144,
  },
  'countdown.honor-of-kings': {
    sources: [{ src: GAME_SWITCHER_PREVIEW, top: 0 }],
    sourceWidth: 734,
    sourceHeight: 181,
    x: 480,
    y: 8,
    width: 199,
    height: 144,
  },
  'intro.venue': {
    sources: [{ src: '/assets/acg-new-year/exact-venue-entry.png', top: 0 }],
    sourceWidth: 172,
    sourceHeight: 120,
    x: 0,
    y: 0,
    width: 172,
    height: 120,
  },
  ...Object.fromEntries(
    [162, 498, 834, 1170, 1506].map((y, index) => [
      `lottery.card-${index + 1}`,
      {
        sources: [...WORK_CARD_PREVIEW_SOURCES],
        sourceWidth: 750,
        sourceHeight: 1970,
        x: 28,
        y,
        width: 694,
        height: 304,
      },
    ]),
  ),
}

const LAYER_COMPONENT_PREVIEWS: Partial<Record<H5LayerId, H5ComponentPreviewCrop>> = {
  hero: {
    sources: [{ src: '/assets/acg-new-year/exact-hero-base.png', top: 0 }],
    sourceWidth: 750,
    sourceHeight: 600,
    x: 0,
    y: 0,
    width: 750,
    height: 600,
  },
  countdown: {
    sources: [{ src: GAME_SWITCHER_PREVIEW, top: 0 }],
    sourceWidth: 734,
    sourceHeight: 181,
    x: 0,
    y: 0,
    width: 734,
    height: 181,
  },
  intro: {
    sources: [{ src: '/assets/acg-new-year/exact-main-video.png', top: 0 }],
    sourceWidth: 705,
    sourceHeight: 480,
    x: 0,
    y: 0,
    width: 705,
    height: 480,
  },
  lottery: {
    sources: [...WORK_CARD_PREVIEW_SOURCES],
    sourceWidth: 750,
    sourceHeight: 1970,
    x: 0,
    y: 0,
    width: 750,
    height: 600,
  },
  rules: {
    sources: [{ src: '/assets/acg-new-year/exact-lower-bottom.png', top: 0 }],
    sourceWidth: 750,
    sourceHeight: 985,
    x: 0,
    y: 820,
    width: 750,
    height: 165,
  },
}

export default function H5LayerEditPanel({
  selection,
  onClose,
  title,
  floating = false,
  onHeaderPointerDown,
  canvasNode,
  onCanvasNodeChange,
  onDuplicate,
  onMoveLayer,
  onToggleVisible,
  onToggleLocked,
}: {
  /** 当前选择：楼层 / 元素；null ⇒ 整体活动配置。 */
  selection: H5Selection | null
  onClose: () => void
  /** 可选面板标题；普通快速编辑不显示，沉浸式画布保留「属性」。 */
  title?: string
  /** 浮层模式：header 变成可拖拽手柄（带 grip 图标 + move 光标）。 */
  floating?: boolean
  onHeaderPointerDown?: (e: React.PointerEvent) => void
  /** 画布模式下的实例属性；普通快速编辑不传。 */
  canvasNode?: H5CanvasNode
  onCanvasNodeChange?: (
    patch: Partial<Omit<H5CanvasNode, 'id' | 'kind' | 'parentId'>>,
  ) => void
  onDuplicate?: () => void
  onMoveLayer?: (direction: 'forward' | 'backward') => void
  onToggleVisible?: () => void
  onToggleLocked?: () => void
}) {
  const layerId =
    selection?.type === 'layer'
      ? selection.layer
      : selection?.type === 'element'
        ? selection.el.layer
        : null
  const layerMeta = layerId ? H5_LAYER_META[layerId] : null
  const el = selection?.type === 'element' ? selection.el : null
  const layerComponentPreview =
    selection?.type === 'layer' ? LAYER_COMPONENT_PREVIEWS[selection.layer] : undefined
  const cardComponentPreview =
    el?.kind === 'card' ? CARD_COMPONENT_PREVIEWS[el.id] : undefined
  const componentPreview = layerComponentPreview
    ? { label: layerMeta?.label ?? '当前组件', preview: layerComponentPreview }
    : cardComponentPreview && el
      ? { label: el.label, preview: cardComponentPreview }
      : null
  const [historyOpen, setHistoryOpen] = useState(false)

  // Breadcrumb: 楼层 / 元素 — falls back to 活动配置 when nothing is picked.
  const crumb = el
    ? `${layerMeta?.label ?? ''} / ${el.label}`
    : layerMeta
      ? layerMeta.label
      : '活动配置'

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Header — drag handle when floating */}
      <div
        onPointerDown={floating ? onHeaderPointerDown : undefined}
        className={`flex h-10 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3 ${
          floating ? 'cursor-move touch-none select-none' : ''
        }`}
      >
        {floating && (
          <Move size={13} strokeWidth={1.8} className="-ml-1 shrink-0 text-[var(--color-ink)]/35" />
        )}
        {title && (
          <span className="text-[12px] font-semibold text-[var(--color-ink)]">{title}</span>
        )}
        <ObjectTypeBadge kind={selectionObjectKind(selection)} />
        <span className={`min-w-0 truncate ${
          title
            ? 'text-[11px] text-[var(--color-ink)]/40'
            : 'text-[12px] font-medium text-[var(--color-ink)]/75'
        }`}>
          {crumb}
        </span>
        <button
          type="button"
          aria-pressed={historyOpen}
          onClick={() => setHistoryOpen((open) => !open)}
          onPointerDown={(event) => event.stopPropagation()}
          className="ml-auto flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/80 aria-pressed:bg-[var(--fill-subtle)] aria-pressed:text-[var(--color-ink)]"
        >
          <History size={12} strokeWidth={1.8} />
          历史记录
        </button>
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="关闭编辑栏"
          title="关闭"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {historyOpen && (
        <ObjectHistoryPopover
          selection={selection}
          layerLabel={layerMeta?.label}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {/* Body — element editor when an element is picked; else per-layer; else overall */}
      <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
        {componentPreview && (
          <SelectedComponentPreview
            label={componentPreview.label}
            preview={componentPreview.preview}
          />
        )}
        {canvasNode && onCanvasNodeChange && (
          <div
            className={
              componentPreview
                ? 'mt-5 border-t border-[var(--divider-soft)] pt-5'
                : undefined
            }
          >
            <CanvasTransformEditor
              node={canvasNode}
              onChange={onCanvasNodeChange}
              onDuplicate={onDuplicate}
              onMoveLayer={onMoveLayer}
              onToggleVisible={onToggleVisible}
              onToggleLocked={onToggleLocked}
            />
          </div>
        )}
        <div
          className={
            componentPreview || (canvasNode && onCanvasNodeChange)
              ? 'mt-5 border-t border-[var(--divider-soft)] pt-5'
              : undefined
          }
        >
          {el ? (
            <ElementEditor key={el.id} el={el} />
          ) : layerId === null ? (
            <OverallEditor />
          ) : layerId === 'hero' ? (
            <HeroEditor />
          ) : layerId === 'countdown' ? (
            <CountdownEditor />
          ) : layerId === 'intro' ? (
            <IntroEditor />
          ) : layerId === 'lottery' ? (
            <LotteryEditor />
          ) : layerId === 'task' ? (
            <TaskEditor />
          ) : (
            <RulesEditor />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">
          {el
            ? `编辑「${el.label}」元素`
            : layerMeta
              ? `编辑「${layerMeta.label}」图层`
              : '选中左侧元素可单独编辑'}
        </span>
        <div className="flex items-center gap-1.5">
          <button className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--divider)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)]">
            重置
          </button>
          <button className="flex h-7 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 text-[11.5px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90">
            应用
          </button>
        </div>
      </div>
    </div>
  )
}

function selectionObjectKind(selection: H5Selection | null): H5ObjectDisplayKind {
  if (!selection) return 'page'
  if (selection.type === 'layer') return 'component'
  return selection.el.kind
}

function ObjectTypeBadge({ kind }: { kind: H5ObjectDisplayKind }) {
  const meta: Record<H5ObjectDisplayKind, { label: string; className: string }> = {
    page: {
      label: '页面',
      className: 'bg-slate-100 text-slate-600',
    },
    component: {
      label: '组件',
      className: 'bg-violet-50 text-violet-700',
    },
    image: {
      label: '图片',
      className: 'bg-fuchsia-50 text-fuchsia-700',
    },
    card: {
      label: '组件',
      className: 'bg-violet-50 text-violet-700',
    },
    button: {
      label: '按钮',
      className: 'bg-sky-50 text-sky-700',
    },
    text: {
      label: '文本',
      className: 'bg-emerald-50 text-emerald-700',
    },
  }
  const current = meta[kind]

  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-semibold leading-none ${current.className}`}>
      {current.label}
    </span>
  )
}

function SelectedComponentPreview({
  label,
  preview,
}: {
  label: string
  preview: H5ComponentPreviewCrop
}) {
  return (
    <section aria-label={`${label}组件预览`}>
      <div className="flex justify-start">
        <ComponentCropPreview preview={preview} label={label} />
      </div>
    </section>
  )
}

function ComponentCropPreview({
  preview,
  label,
}: {
  preview: H5ComponentPreviewCrop
  label: string
}) {
  return (
    <div
      role="img"
      aria-label={`${label}预览`}
      className="relative w-full max-w-[280px] overflow-hidden rounded-xl bg-[var(--fill-subtle)] ring-1 ring-inset ring-[var(--divider-soft)]"
      style={{ aspectRatio: `${preview.width} / ${preview.height}` }}
    >
      <div
        className="absolute"
        style={{
          left: `${(-preview.x / preview.width) * 100}%`,
          top: `${(-preview.y / preview.height) * 100}%`,
          width: `${(preview.sourceWidth / preview.width) * 100}%`,
          height: `${(preview.sourceHeight / preview.height) * 100}%`,
        }}
      >
        {preview.sources.map((source) => (
          <img
            key={`${source.src}-${source.top}`}
            src={source.src}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute left-0 w-full max-w-none select-none"
            style={{ top: `${(source.top / preview.sourceHeight) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}

const IMAGE_HISTORY_SOURCES: Record<string, string[]> = {
  'hero.visual': [
    '/assets/acg-new-year/exact-hero-base.png',
    '/assets/acg-new-year/materials/01-activity-hero.png',
    '/assets/acg-new-year/hero.jpg',
  ],
  'hero.transition': [
    '/assets/acg-new-year/exact-hero-transition.svg',
    '/assets/acg-new-year/exact-wave-pattern.svg',
  ],
  'hero.wave': [
    '/assets/acg-new-year/exact-wave-pattern.svg',
    '/assets/acg-new-year/exact-hero-transition.svg',
  ],
  'countdown.switcher': [
    '/assets/acg-new-year/exact-game-switcher.png',
    '/assets/acg-new-year/materials/03-dungeon-character.png',
    '/assets/acg-new-year/materials/05-egg-party-keyboard.png',
  ],
  'intro.video': [
    '/assets/acg-new-year/exact-main-video.png',
    '/assets/acg-new-year/materials/07-focus-video-cover.png',
    '/assets/acg-new-year/main-video.jpg',
  ],
  'lottery.upper-image': [
    '/assets/acg-new-year/exact-lower-top.png',
    '/assets/acg-new-year/materials/08-content-cover-party.png',
    '/assets/acg-new-year/materials/09-content-cover-action.png',
  ],
  'lottery.lower-image': [
    '/assets/acg-new-year/exact-lower-bottom.png',
    '/assets/acg-new-year/materials/10-content-cover-sunset.png',
    '/assets/acg-new-year/materials/11-content-cover-field.png',
  ],
}

function ObjectHistoryPopover({
  selection,
  layerLabel,
  onClose,
}: {
  selection: H5Selection | null
  layerLabel?: string
  onClose: () => void
}) {
  const el = selection?.type === 'element' ? selection.el : null
  const objectLabel =
    el?.label ??
    (selection?.type === 'layer' ? layerLabel ?? '当前组件' : '活动配置')

  return (
    <div className="absolute left-3 right-3 top-11 z-[80] overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--color-surface-0)] shadow-[0_16px_40px_-12px_rgba(16,18,24,0.28)]">
      <div className="flex h-10 items-center border-b border-[var(--divider-soft)] px-3">
        <History size={13} strokeWidth={1.8} className="mr-1.5 text-[var(--color-ink)]/55" />
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--color-ink)]">
          {objectLabel} · 历史记录
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭历史记录"
          className="flex size-6 items-center justify-center rounded-md text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75"
        >
          <X size={12} strokeWidth={1.8} />
        </button>
      </div>
      <div className="thin-scroll max-h-[420px] overflow-y-auto p-2.5">
        {el?.kind === 'image' ? (
          <ImageGenerationHistory element={el} />
        ) : (
          <ObjectEditHistory objectLabel={objectLabel} kind={el?.kind} />
        )}
      </div>
    </div>
  )
}

function ImageGenerationHistory({ element }: { element: H5ElementSel }) {
  const sources = IMAGE_HISTORY_SOURCES[element.id] ?? [element.value ?? '']
  const basePrompt =
    element.prompt ??
    `保持 2026 抖音 ACG 新春会的暖橙新春视觉语言，重新生成「${element.label.replace(/\.(png|jpe?g|webp|svg)$/i, '')}」，保持当前构图、尺寸比例与透明关系。`
  const images = [element.value ?? sources[0], ...sources]
    .filter(Boolean)
    .filter((source, index, all) => all.indexOf(source) === index)
  while (images.length < 3 && images[0]) images.push(images[0])

  const records = images.slice(0, 3).map((src, index) => ({
    src,
    version: index === 0 ? '当前版本' : `生成版本 ${3 - index}`,
    time: index === 0 ? '刚刚' : index === 1 ? '今天 14:32' : '昨天 18:06',
    model: index === 2 ? 'NanoBanana' : 'NanoBanana Pro',
    prompt:
      index === 0
        ? basePrompt
        : `${basePrompt} ${index === 1 ? '强化主体层次与节庆光效，保持现有构图。' : '探索更轻盈的色彩与装饰细节，保持原始尺寸。'}`,
  }))

  return (
    <div className="space-y-2">
      {records.map((record, index) => (
        <div
          key={`${record.src}-${index}`}
          className="group flex gap-2.5 rounded-lg border border-[var(--divider-soft)] p-2 transition-colors hover:border-[var(--color-ink)]/15 hover:bg-[var(--fill-subtle)]"
        >
          <div className="h-[58px] w-[72px] shrink-0 overflow-hidden rounded-md bg-[var(--fill-subtle)] ring-1 ring-[var(--divider-soft)]">
            <img src={record.src} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11.5px] font-medium text-[var(--color-ink)]/85">
                {record.version}
              </span>
              {index === 0 && (
                <span className="rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-medium text-emerald-700">
                  已应用
                </span>
              )}
              <span className="ml-auto text-[9.5px] text-[var(--color-ink)]/35">
                {record.time}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[var(--color-ink)]/45">
              {record.prompt}
            </p>
            <div className="mt-1 flex items-center text-[9.5px] text-[var(--color-ink)]/35">
              {record.model}
              {index > 0 && (
                <button
                  type="button"
                  className="ml-auto rounded px-1.5 py-0.5 text-[10px] text-[#5f4bd8] opacity-0 transition-opacity hover:bg-[#7c5cff]/10 group-hover:opacity-100"
                >
                  恢复此版本
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ObjectEditHistory({
  objectLabel,
  kind,
}: {
  objectLabel: string
  kind?: H5ElementKind
}) {
  const kindLabel =
    kind === 'card'
      ? '卡片'
      : kind === 'button'
        ? '按钮'
        : kind === 'text'
          ? '文案'
          : '组件'
  const entries = [
    { action: `更新${kindLabel}内容`, detail: `调整「${objectLabel}」的字段与展示样式`, time: '刚刚' },
    { action: `优化${kindLabel}样式`, detail: '统一圆角、间距与活动主题色', time: '今天 13:48' },
    { action: '创建对象', detail: `加入「${objectLabel}」并完成初始配置`, time: '昨天 17:26' },
  ]

  return (
    <div className="space-y-1">
      {entries.map((entry, index) => (
        <div key={entry.action} className="relative flex gap-2.5 rounded-lg px-2 py-2 hover:bg-[var(--fill-subtle)]">
          <span className={`mt-1.5 size-2 shrink-0 rounded-full ${index === 0 ? 'bg-[#7c5cff]' : 'bg-[var(--color-ink)]/15'}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[11.5px] font-medium text-[var(--color-ink)]/80">
                {entry.action}
              </span>
              <span className="ml-auto shrink-0 text-[9.5px] text-[var(--color-ink)]/35">
                {entry.time}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] leading-4 text-[var(--color-ink)]/45">
              {entry.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CanvasTransformEditor({
  node,
  onChange,
  onDuplicate,
  onMoveLayer,
  onToggleVisible,
  onToggleLocked,
}: {
  node: H5CanvasNode
  onChange: (
    patch: Partial<Omit<H5CanvasNode, 'id' | 'kind' | 'parentId'>>,
  ) => void
  onDuplicate?: () => void
  onMoveLayer?: (direction: 'forward' | 'backward') => void
  onToggleVisible?: () => void
  onToggleLocked?: () => void
}) {
  return (
    <div className="space-y-4">
      <SectionTitle icon={Move}>位置与尺寸</SectionTitle>
      <Field label="图层名称">
        <input
          type="text"
          value={node.name}
          onChange={(event) => onChange({ name: event.target.value })}
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <GeometryField
          label="X"
          value={node.x}
          onChange={(value) => onChange({ x: value })}
        />
        <GeometryField
          label="Y"
          value={node.y}
          onChange={(value) => onChange({ y: value })}
        />
        <GeometryField
          label="宽"
          value={node.width}
          min={16}
          onChange={(value) => onChange({ width: value })}
        />
        <GeometryField
          label="高"
          value={node.height}
          min={16}
          onChange={(value) => onChange({ height: value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onDuplicate}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--divider)] text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)]"
        >
          <Copy size={12} strokeWidth={1.8} />
          复制图层
        </button>
        <button
          type="button"
          onClick={onToggleLocked}
          aria-pressed={node.locked}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--divider)] text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] aria-pressed:bg-[var(--fill-subtle)] aria-pressed:text-[var(--color-ink)]"
        >
          <Lock size={12} strokeWidth={1.8} />
          {node.locked ? '已锁定' : '锁定'}
        </button>
        <button
          type="button"
          onClick={onToggleVisible}
          aria-pressed={!node.visible}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--divider)] text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] aria-pressed:bg-[var(--fill-subtle)] aria-pressed:text-[var(--color-ink)]"
        >
          <Eye size={12} strokeWidth={1.8} />
          {node.visible ? '隐藏' : '显示'}
        </button>
        <div className="flex overflow-hidden rounded-md border border-[var(--divider)]">
          <button
            type="button"
            aria-label="图层上移一层"
            title="上移一层"
            onClick={() => onMoveLayer?.('forward')}
            className="flex h-8 flex-1 items-center justify-center text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)]"
          >
            <ArrowUp size={12} strokeWidth={1.8} />
          </button>
          <div className="w-px bg-[var(--divider)]" />
          <button
            type="button"
            aria-label="图层下移一层"
            title="下移一层"
            onClick={() => onMoveLayer?.('backward')}
            className="flex h-8 flex-1 items-center justify-center text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)]"
          >
            <ArrowDown size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  )
}

function GeometryField({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex h-8 items-center gap-2 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2">
      <span className="w-4 shrink-0 text-[10.5px] text-[var(--color-ink)]/40">{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        min={min}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isFinite(next)) onChange(min == null ? next : Math.max(min, next))
        }}
        className="min-w-0 flex-1 bg-transparent text-right text-[11.5px] tabular-nums text-[var(--color-ink)]/75 outline-none"
      />
    </label>
  )
}

/* ─────────── 整体活动配置（默认，无选中元素时） ─────────── */
function OverallEditor() {
  const [theme, setTheme] = useState('rose')
  const [gradient, setGradient] = useState(60)
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle icon={ImageIcon}>活动信息</SectionTitle>
        <div className="mt-3 space-y-3.5">
          <Field label="活动名称">
            <input
              type="text"
              defaultValue="2026 抖音 ACG 新春会"
              className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
            />
          </Field>
          <Field label="活动时间">
            <input
              type="text"
              defaultValue="2026-02-01 ~ 2026-02-24"
              className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={Gift}>主题配色</SectionTitle>
        <div className="mt-3 space-y-3.5">
          <Field label="主题色">
            <Swatches value={theme} onChange={setTheme} />
          </Field>
          <Slider label="渐变强度" value={gradient} min={0} max={100} onChange={setGradient} unit="%" />
        </div>
      </div>

      <div>
        <SectionTitle icon={ListChecks}>页面楼层</SectionTitle>
        <div className="mt-3 space-y-3">
          <ToggleRow label="游戏会场" defaultOn />
          <ToggleRow label="主会场视频" defaultOn />
          <ToggleRow label="开年高燃榜单" defaultOn />
          <ToggleRow label="榜单互动" defaultOn />
          <ToggleRow label="页面尾部" defaultOn />
        </div>
      </div>
    </div>
  )
}

/* ─────────── 头图 ─────────── */
function HeroEditor() {
  const [recordOpen, setRecordOpen] = useState(true)
  return (
    <div className="space-y-5">
      <SectionTitle icon={ImageIcon}>头图</SectionTitle>

      {/* quick actions */}
      <div className="grid grid-cols-3 gap-2">
        <ActionPill icon={RefreshCw} label="再次生成" />
        <ActionPill icon={Type} label="识图改字" />
        <ActionPill icon={Upload} label="上传头图" />
      </div>

      {/* feature cards */}
      <div className="space-y-2.5">
        <FeatureCard icon={Ruler} label="资源位扩展">
          <div className="flex items-center gap-1">
            <img src={HERO_IMG} alt="" className="h-9 w-9 rounded object-cover" />
            <span className="text-[var(--color-ink)]/30">→</span>
            <img src={HERO_IMG} alt="" className="h-9 w-14 rounded object-cover" />
          </div>
        </FeatureCard>
        <FeatureCard icon={Play} label="动态头图">
          <div className="relative">
            <img src={HERO_IMG} alt="" className="h-9 w-16 rounded object-cover" />
            <span className="absolute left-1 top-1 rounded bg-black/55 px-1 text-[8px] font-medium text-white">
              MP4
            </span>
          </div>
        </FeatureCard>
        <FeatureCard icon={Crop} label="裁剪画面">
          <img src={HERO_IMG} alt="" className="h-9 w-16 rounded object-cover ring-1 ring-[#7c5cff]/60" />
        </FeatureCard>
      </div>

      {/* history */}
      <div>
        <button
          type="button"
          onClick={() => setRecordOpen((v) => !v)}
          className="flex w-full items-center text-[12.5px] font-semibold text-[var(--color-ink)]/70"
        >
          头图记录
          <ChevronDown
            size={14}
            className={`ml-auto transition-transform ${recordOpen ? '' : '-rotate-90'}`}
          />
        </button>
        {recordOpen && (
          <div className="mt-3 flex gap-2.5">
            {[HERO_IMG, LOTTERY_IMG, HERO_IMG].map((src, i) => (
              <div
                key={i}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ${
                  i === 2 ? 'ring-2 ring-[#7c5cff]' : 'ring-1 ring-[var(--divider)]'
                }`}
              >
                <img src={src} className="h-full w-full object-cover" />
                <span className="absolute left-1 top-1 rounded bg-black/50 px-1 text-[8px] font-bold text-white">
                  H5
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────── 游戏会场 ─────────── */
function CountdownEditor() {
  const [color, setColor] = useState('mint')
  return (
    <div className="space-y-5">
      <SectionTitle icon={Clock}>游戏会场</SectionTitle>
      <Field label="默认游戏">
        <input
          type="text"
          defaultValue="地下城与勇士"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Field label="选中态颜色">
        <Swatches value={color} onChange={setColor} />
      </Field>
      <ToggleRow label="展示全部游戏入口" defaultOn />
    </div>
  )
}

/* ─────────── 主会场视频 ─────────── */
function IntroEditor() {
  return (
    <div className="space-y-5">
      <SectionTitle icon={FileText}>主会场视频</SectionTitle>
      <Field label="推荐语">
        <input
          type="text"
          defaultValue="画面与音乐无缝契合，碰撞出高燃炸裂的顶级视觉火花"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Field label="视频说明">
        <textarea
          rows={5}
          defaultValue={'好游戏一起过新年。\n汇聚热门游戏厂商与玩家创作的新春特别内容。'}
          className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
    </div>
  )
}

/* ─────────── 开年高燃 ─────────── */
function LotteryEditor() {
  const [prizes, setPrizes] = useState(4)
  return (
    <div className="space-y-5">
      <SectionTitle icon={Gift}>开年高燃</SectionTitle>
      <Field label="按钮文案">
        <input
          type="text"
          defaultValue="好活加马"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Slider label="默认榜单条数" value={prizes} min={1} max={8} onChange={setPrizes} />
      <ToggleRow label="展示马力值" defaultOn />
      <ToggleRow label="展示创作者" defaultOn />
    </div>
  )
}

/* ─────────── 榜单互动 ─────────── */
function TaskEditor() {
  const [coins, setCoins] = useState(1000)
  return (
    <div className="space-y-5">
      <SectionTitle icon={ListChecks}>榜单互动</SectionTitle>
      <Field label="互动名称">
        <input
          type="text"
          defaultValue="为高燃作品加马"
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Slider label="基础马力值" value={coins} min={100} max={5000} step={100} onChange={setCoins} unit="" />
      <ToggleRow label="每人每日限投一次" defaultOn />
    </div>
  )
}

/* ─────────── 页面尾部 ─────────── */
function RulesEditor() {
  return (
    <div className="space-y-5">
      <SectionTitle icon={ScrollText}>页面尾部</SectionTitle>
      <ToggleRow label="展示活动口号" defaultOn />
      <ToggleRow label="展示抖音游戏品牌" defaultOn />
      <Field label="尾注文案">
        <textarea
          rows={4}
          defaultValue={'2026 抖音 ACG 新春会\n游戏动漫一起过新年'}
          className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
    </div>
  )
}

/* ═════════════ 元素级编辑（楼层内单个元素） ═════════════ */
function ElementEditor({ el }: { el: H5ElementSel }) {
  if (el.kind === 'card') return <CardElementEditor el={el} />
  if (el.kind === 'button') return <ButtonElementEditor el={el} />
  if (el.kind === 'image') return <ImageElementEditor el={el} />
  return <TextElementEditor el={el} />
}

/* ─────────── 卡片元素（游戏入口 / 作品卡片） ─────────── */
function CardElementEditor({ el }: { el: H5ElementSel }) {
  const isWorkCard = el.id.startsWith('lottery.card-')
  const [title, setTitle] = useState(el.value ?? el.label)
  const [subtitle, setSubtitle] = useState(
    isWorkCard ? '高燃游戏内容 · 新春特别作品' : '进入专属游戏会场',
  )
  const [color, setColor] = useState('rose')
  const [radius, setRadius] = useState(12)
  return (
    <div className="space-y-5">
      <Field label={isWorkCard ? '作品标题' : '入口名称'}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Field label={isWorkCard ? '作品描述' : '入口说明'}>
        <textarea
          rows={3}
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <ActionPill icon={Upload} label="上传封面" />
        <ActionPill icon={RefreshCw} label="重新生成" />
        <ActionPill icon={Crop} label="裁剪封面" />
      </div>
      <Field label="卡片底色">
        <Swatches value={color} onChange={setColor} />
      </Field>
      <Slider label="卡片圆角" value={radius} min={0} max={28} onChange={setRadius} unit="px" />
      {isWorkCard && (
        <>
          <ToggleRow label="展示创作者信息" defaultOn />
          <ToggleRow label="展示马力值" defaultOn />
          <ToggleRow label="展示互动按钮" defaultOn />
        </>
      )}
    </div>
  )
}

/* ─────────── 文本元素（主标题 / 正文 / 名单 …） ─────────── */
function TextElementEditor({ el }: { el: H5ElementSel }) {
  const [text, setText] = useState(el.value ?? '')
  const [size, setSize] = useState(20)
  const [color, setColor] = useState('rose')
  const [align, setAlign] = useState('center')
  // 正文之类的长文本用多行输入。
  const multiline = el.id.endsWith('body') || (el.value ?? '').length > 16
  return (
    <div className="space-y-5">
      <SectionTitle icon={Type}>{el.label}</SectionTitle>
      <Field label="文案">
        {multiline ? (
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
          />
        ) : (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
          />
        )}
      </Field>
      <Slider label="字号" value={size} min={12} max={36} onChange={setSize} unit="px" />
      <Field label="文字颜色">
        <Swatches value={color} onChange={setColor} />
      </Field>
      <Field label="对齐">
        <Chips
          value={align}
          onChange={setAlign}
          options={[
            { id: 'left', label: '左对齐' },
            { id: 'center', label: '居中' },
            { id: 'right', label: '右对齐' },
          ]}
        />
      </Field>
      <ToggleRow label="加粗" defaultOn />
    </div>
  )
}

/* ─────────── 按钮元素（立即抽奖 / 我的奖品 / 任务 CTA …） ─────────── */
function ButtonElementEditor({ el }: { el: H5ElementSel }) {
  const [label, setLabel] = useState(el.value ?? '')
  const [bg, setBg] = useState('rose')
  const [textColor, setTextColor] = useState('slate')
  const [radius, setRadius] = useState(24)
  return (
    <div className="space-y-5">
      <SectionTitle icon={Box}>{el.label}</SectionTitle>
      <Field label="按钮文案">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
        />
      </Field>
      <Field label="底色">
        <Swatches value={bg} onChange={setBg} />
      </Field>
      <Field label="文字颜色">
        <Swatches value={textColor} onChange={setTextColor} />
      </Field>
      <Slider label="圆角" value={radius} min={0} max={28} onChange={setRadius} unit="px" />
      <ToggleRow label="点击埋点" defaultOn />
    </div>
  )
}

/* ─────────── 图片元素（头图 / 抽奖机 …） ─────────── */
function ImageElementEditor({ el }: { el: H5ElementSel }) {
  const [fit, setFit] = useState('cover')
  const [prompt, setPrompt] = useState(
    el.prompt ??
      `保持 2026 抖音 ACG 新春会的暖橙新春视觉语言，重新生成「${el.label.replace(/\.(png|jpe?g|webp|svg)$/i, '')}」，保持当前构图、尺寸比例与透明关系，高细节商业活动素材。`,
  )
  return (
    <div className="space-y-5">
      <SectionTitle icon={ImageIcon}>{el.label}</SectionTitle>
      {el.value && (
        <>
          <div className="overflow-hidden rounded-xl ring-1 ring-[var(--divider)]">
            <img src={el.value} alt="" className="max-h-40 w-full object-cover" />
          </div>
          <Field label="Prompt">
            <textarea
              rows={6}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="thin-scroll w-full resize-none rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[12.5px] leading-[1.65] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/40"
            />
          </Field>
        </>
      )}
      <div className="grid grid-cols-3 gap-2">
        <ActionPill icon={Upload} label="上传图片" />
        <ActionPill icon={RefreshCw} label="再次生成" />
        <ActionPill icon={Crop} label="裁剪图片" />
      </div>
      <Field label="适配方式">
        <Chips
          value={fit}
          onChange={setFit}
          options={[
            { id: 'cover', label: '填充' },
            { id: 'contain', label: '包含' },
            { id: 'fill', label: '拉伸' },
          ]}
        />
      </Field>
    </div>
  )
}

/* ─────────── shared atoms ─────────── */
function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink)]">
      <Icon size={15} strokeWidth={1.8} className="text-[var(--color-ink)]/65" />
      {children}
    </div>
  )
}

function ActionPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--divider)] bg-[var(--color-surface-0)] text-[12px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </button>
  )
}

function FeatureCard({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-2.5 text-left transition-colors hover:border-[var(--color-ink)]/20 hover:bg-[var(--fill-hover)]"
    >
      <Icon size={15} strokeWidth={1.7} className="shrink-0 text-[var(--color-ink)]/60" />
      <span className="flex-1 text-[13px] font-medium text-[var(--color-ink)]/85">{label}</span>
      <div className="shrink-0 overflow-hidden rounded-md bg-[var(--fill-subtle)]">{children}</div>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] text-[var(--color-ink)]/65">{label}</div>
      {children}
    </div>
  )
}

function Chips({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => {
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
  )
}

const SWATCHES = [
  { id: 'mint', color: '#65cfc8' },
  { id: 'rose', color: '#ff7186' },
  { id: 'amber', color: '#f7b85c' },
  { id: 'violet', color: '#7c5cff' },
  { id: 'slate', color: '#475569' },
]
function Swatches({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {SWATCHES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`h-7 w-7 rounded-full border-2 transition-transform ${
            value === s.id ? 'scale-110 border-[var(--color-ink)]/40' : 'border-transparent hover:scale-105'
          }`}
          style={{ backgroundColor: s.color }}
        />
      ))}
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] text-[var(--color-ink)]/80">{label}</span>
        <span className="font-mono text-[11px] text-[var(--color-ink)]/55">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--fill-subtle)] accent-[var(--color-ink)]"
      />
    </div>
  )
}

function ToggleRow({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button type="button" onClick={() => setOn((v) => !v)} className="flex w-full items-center gap-3 text-left">
      <span className="min-w-0 flex-1 text-[12px] text-[var(--color-ink)]/85">{label}</span>
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
