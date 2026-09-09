import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  Box as BoxIcon,
  ChevronRight,
  ExternalLink,
  Eye,
  GitBranch,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  MessageSquarePlus,
  Palette,
  Plus,
  RotateCcw,
  Ruler,
  Sparkles,
  Trash2,
  Type as TypeIcon,
  Upload,
  X,
} from '@/shared/icons'
import type { H5LabCase } from './h5-lab-cases'
import {
  h5LabAncestors,
  h5LabElementView,
  type H5LabLayer,
} from './h5-lab-layers'
import {
  linkKey,
  screenFromSuggestion,
  type H5LabHotspot,
  type H5LabPrototype,
  type H5LabTransition,
} from './h5-lab-prototype'
import {
  suggestH5LabScreens,
  type H5LabScreenSuggestion,
} from './h5-lab-suggestions'
import {
  h5LabCountEdits,
  h5LabPatch,
  h5LabReset,
  type H5LabSelection,
  type H5LabStyleOverride,
  type H5LabOverrides,
} from './h5-lab-overrides'
import { useHostTitle } from './useHostTitle'

/* ─── H5 Lab 画布属性面板 ───
 *
 * 结构对齐 OJO 的 Edit section：上半是图层管理（Element view 看当前这一层，
 * Full structure 看整页结构），下半是 Container styles —— 背景 / 不透明度 /
 * 圆角 / 描边 / 阴影，再往下是 Size & layout（位置·旋转·尺寸·内外边距）。
 * 内容和图片这两组只在选中文字 / 图片时出现。字段只写覆盖，不动 case 源码。
 */

interface Props {
  labCase: H5LabCase
  selection: H5LabSelection | null
  overrides: H5LabOverrides
  onOverrides: (next: H5LabOverrides) => void
  /** 当前聚焦状态帧的图层树（由画布现推）。 */
  layers: H5LabLayer[]
  onSelectPath: (path: string) => void
  /** 当前聚焦帧里盘出来的可交互热点。 */
  hotspots: H5LabHotspot[]
  /** 画布上的全部帧（含补出来的界面），做跳转目标选项。 */
  frames: { id: string; label: string; generated?: boolean }[]
  prototype: H5LabPrototype
  onPrototype: (next: H5LabPrototype) => void
  /** 图片下钻素材库画布编辑。 */
  onOpenAssetCanvas: (src?: string) => void
  /** 把当前选中的元素带进对话。 */
  onAddToChat: () => void
  onClose: () => void
}

/* ── 原子控件 ── */

function Row({ label, children, action }: { label: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-ink)]/50">{label}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

function Group({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Eye
  children: ReactNode
}) {
  return (
    <section className="border-t border-[var(--divider-soft)] px-4 py-3.5 first:border-t-0">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon size={12} strokeWidth={1.8} className="text-[var(--color-ink)]/45" />
        <span className="text-[11.5px] font-medium text-[var(--color-ink)]/75">{title}</span>
      </div>
      {children}
    </section>
  )
}

function NumField({
  value,
  placeholder,
  unit,
  prefix,
  onChange,
}: {
  value: number | undefined
  placeholder?: string | number
  unit?: string
  prefix?: string
  onChange: (next: number | undefined) => void
}) {
  return (
    <label className="flex h-7 min-w-0 flex-1 items-center gap-1 rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-1.5 focus-within:border-[#2f6bff]/60">
      {prefix && <span className="shrink-0 text-[10.5px] text-[var(--color-ink)]/35">{prefix}</span>}
      <input
        type="number"
        value={value ?? ''}
        placeholder={placeholder === undefined ? '' : String(placeholder)}
        onChange={(event) =>
          onChange(event.target.value === '' ? undefined : Number(event.target.value))
        }
        className="h-full min-w-0 flex-1 bg-transparent text-[11.5px] tabular-nums text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/25"
      />
      {unit && <span className="shrink-0 text-[10.5px] text-[var(--color-ink)]/35">{unit}</span>}
    </label>
  )
}

function ColorRow({
  value,
  fallback,
  onChange,
  onClear,
}: {
  value: string | undefined
  fallback: string
  onChange: (next: string) => void
  onClear?: () => void
}) {
  const hex = /^#[0-9a-f]{6}$/i.test(value ?? '') ? (value as string) : '#1a1a1a'
  return (
    <div className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-1.5">
      <label className="relative size-[15px] shrink-0 cursor-pointer overflow-hidden rounded-[3px] border border-[var(--color-ink)]/15">
        <span className="absolute inset-0" style={{ background: value ?? fallback }} />
        <input
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="取色"
        />
      </label>
      <input
        type="text"
        value={value ?? ''}
        placeholder={fallback}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-w-0 flex-1 bg-transparent text-[11.5px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/25"
      />
      {onClear && value !== undefined && (
        <button
          type="button"
          onClick={onClear}
          title="清除"
          className="flex size-4 shrink-0 items-center justify-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
        >
          <X size={10} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

function AddRow({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <span className="text-[11px] text-[var(--color-ink)]/50">{label}</span>
      <button
        type="button"
        onClick={onAdd}
        title={`添加${label}`}
        className="flex size-5 items-center justify-center rounded text-[var(--color-ink)]/40 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
  )
}

/* ── 图层行 ── */

const KIND_ICON: Record<H5LabSelection['kind'], typeof TypeIcon> = {
  text: TypeIcon,
  image: ImageIcon,
  button: LayoutTemplate,
  svg: Palette,
  box: BoxIcon,
}

function LayerRow({
  layer,
  depth,
  active,
  onSelect,
  expandable,
  expanded,
  onToggle,
}: {
  layer: H5LabLayer
  depth: number
  active: boolean
  onSelect: () => void
  expandable?: boolean
  expanded?: boolean
  onToggle?: () => void
}) {
  const Icon = KIND_ICON[layer.kind]
  return (
    <div
      className={`flex h-7 items-center gap-1 rounded-md pr-1.5 transition-colors ${
        active
          ? 'bg-[#2f6bff]/10 text-[#2f6bff]'
          : 'text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]'
      }`}
      style={{ paddingLeft: 4 + depth * 10 }}
    >
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? '收起' : '展开'}
          className="flex size-4 shrink-0 items-center justify-center rounded text-current/60 hover:bg-[var(--fill-hover)]"
        >
          <ChevronRight
            size={11}
            strokeWidth={2}
            className={expanded ? 'rotate-90 transition-transform' : 'transition-transform'}
          />
        </button>
      ) : (
        <span className="size-4 shrink-0" />
      )}
      <button
        type="button"
        onClick={onSelect}
        className="flex h-full min-w-0 flex-1 items-center gap-1.5 text-left"
      >
        <Icon size={11} strokeWidth={1.8} className="shrink-0 opacity-60" />
        <span className="min-w-0 truncate text-[11.5px]">{layer.label}</span>
        <span className="ml-auto shrink-0 font-mono text-[9.5px] opacity-35">{layer.tag}</span>
      </button>
    </div>
  )
}

function FullStructure({
  layers,
  selectedPath,
  onSelectPath,
}: {
  layers: H5LabLayer[]
  selectedPath: string | null
  onSelectPath: (path: string) => void
}) {
  // 选中路径上的祖先默认展开，其余收着，长页才不会一屏全是行。
  const [manual, setManual] = useState<Record<string, boolean>>({})
  const autoOpen = useMemo(
    () => new Set(selectedPath ? h5LabAncestors(selectedPath) : []),
    [selectedPath],
  )

  const render = (items: H5LabLayer[], depth: number): ReactNode =>
    items.map((layer) => {
      const expandable = layer.children.length > 0
      const expanded = manual[layer.path] ?? autoOpen.has(layer.path)
      return (
        <div key={layer.path}>
          <LayerRow
            layer={layer}
            depth={depth}
            active={layer.path === selectedPath}
            onSelect={() => onSelectPath(layer.path)}
            expandable={expandable}
            expanded={expanded}
            onToggle={() =>
              setManual((prev) => ({ ...prev, [layer.path]: !expanded }))
            }
          />
          {expandable && expanded && render(layer.children, depth + 1)}
        </div>
      )
    })

  if (layers.length === 0) {
    return <p className="px-1 py-3 text-[11px] text-[var(--color-ink)]/35">暂无图层</p>
  }
  return <div className="-mx-1">{render(layers, 0)}</div>
}

type H5LabLinkDraft = { targetId: string; transition: H5LabTransition }
type PanelMode = 'interaction' | 'design'

/* ── 面板 ── */

export default function H5LabEditPanel({
  labCase,
  selection,
  overrides,
  onOverrides,
  layers,
  onSelectPath,
  hotspots,
  frames,
  prototype,
  onPrototype,
  onOpenAssetCanvas,
  onAddToChat,
  onClose,
}: Props) {
  // 面板在画布 / 素材库两种形态下都常驻，标题守卫挂在这里最稳。
  useHostTitle()
  const fileRef = useRef<HTMLInputElement>(null)
  const [layerTab, setLayerTab] = useState<'element' | 'full'>('element')
  const node = selection ? overrides[selection.stateId]?.[selection.path] : undefined
  const style: H5LabStyleOverride = node?.style ?? {}
  // 底部计数只算当前 case 的状态帧，别把别的 case 的改动算进来。
  const editCount = useMemo(
    () =>
      h5LabCountEdits(
        Object.fromEntries(labCase.states.map((item) => [item.id, overrides[item.id] ?? {}])),
      ),
    [labCase.states, overrides],
  )
  const elementView = useMemo(
    () => h5LabElementView(layers, selection?.path ?? null),
    [layers, selection?.path],
  )
  const breadcrumb = useMemo(() => {
    if (!selection) return []
    return h5LabAncestors(selection.path)
  }, [selection])

  const activeFrameId = selection?.stateId ?? frames[0]?.id ?? ''
  const currentLink = selection
    ? prototype.links[linkKey(selection.stateId, selection.path)]
    : undefined
  const isHotspot =
    selection !== null && hotspots.some((item) => item.path === selection.path)
  const linkedCount = hotspots.filter(
    (item) => prototype.links[linkKey(activeFrameId, item.path)],
  ).length

  const setLink = (patch: Partial<H5LabLinkDraft>) => {
    if (!selection) return
    const key = linkKey(selection.stateId, selection.path)
    const next = { ...prototype.links }
    const merged = {
      targetId: patch.targetId ?? currentLink?.targetId ?? '',
      transition: patch.transition ?? currentLink?.transition ?? 'fade',
    }
    if (!merged.targetId) delete next[key]
    else next[key] = merged
    onPrototype({ ...prototype, links: next })
  }

  /* Stitch 的 new screen：这些 case 只反推了首屏，热点按下去之后原作里就没有。
     现补一屏出来，接上连接关系，之后它和别的帧一样可以在画布上继续改。 */
  const generateScreen = (suggestion: H5LabScreenSuggestion) => {
    if (!selection) return
    const screen = screenFromSuggestion(labCase.id, suggestion, {
      stateId: selection.stateId,
      path: selection.path,
      label: selection.label,
    })
    onPrototype({
      screens: [...prototype.screens, screen],
      links: {
        ...prototype.links,
        [linkKey(selection.stateId, selection.path)]: {
          targetId: screen.id,
          transition: suggestion.kind === 'overlay' ? 'fade' : 'slide',
        },
      },
    })
    toast(`已补出「${screen.label}」，可以直接在画布上改`)
  }
  /* 补屏建议按选中热点的文案推 —— 「测一测」给答题/结果/分享，「领取」给领取
     成功/任务清单，认不出来才退回通用四件套。 */
  const advice = useMemo(
    () => suggestH5LabScreens(selection?.label ?? ''),
    [selection?.label],
  )

  /* 交互 / 设计 是面板的第一层分类。默认按选区给合适的那一档：没有点击行为的
     元素直接落到设计，选中热点或没选东西时停在交互；手动切换只对当前选区生效。 */
  const selectionKey = selection ? `${selection.stateId}|${selection.path}` : ''
  const [modePick, setModePick] = useState<{ key: string; mode: PanelMode } | null>(
    null,
  )
  /* 非热点元素也可以手动开出交互（图片、整块卡片这类）—— 开过或已经连过的，
     下次选中直接给全套控件。 */
  const [forceInteraction, setForceInteraction] = useState<string | null>(null)
  const interactive =
    selection !== null &&
    (isHotspot || Boolean(currentLink) || forceInteraction === selectionKey)
  const autoMode: PanelMode = selection && !interactive ? 'design' : 'interaction'
  const mode = modePick?.key === selectionKey ? modePick.mode : autoMode
  const setMode = (next: PanelMode) => setModePick({ key: selectionKey, mode: next })

  const patchStyle = (patch: H5LabStyleOverride) => {
    if (!selection) return
    onOverrides(h5LabPatch(overrides, selection.stateId, selection.path, { style: patch }))
  }
  const patchNode = (patch: { text?: string; src?: string }) => {
    if (!selection) return
    onOverrides(h5LabPatch(overrides, selection.stateId, selection.path, patch))
  }

  const pickImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      toast.error('图片超过 4MB，请先压缩')
      return
    }
    const reader = new FileReader()
    reader.onload = () => patchNode({ src: String(reader.result) })
    reader.readAsDataURL(file)
  }

  const m = selection?.measured
  const isText = selection?.kind === 'text' || selection?.kind === 'button'
  const isImage = selection?.kind === 'image'
  const activeStateLabel =
    labCase.states.find((item) => item.id === selection?.stateId)?.label ??
    labCase.states[0]?.label ??
    ''

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* Edit section */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">编辑</span>
        {selection ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 rounded bg-[var(--color-ink)]/[0.07] px-1 py-px font-mono text-[10px] text-[var(--color-ink)]/55">
              {selection.tag}
            </span>
            <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/45">
              {selection.label}
            </span>
          </span>
        ) : (
          <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/45">
            {labCase.project}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          title="退出画布编辑"
          className="ml-auto flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto">

        {/* 交互 / 设计 —— 面板的第一层分类 */}
        <div className="sticky top-0 z-10 flex gap-0.5 border-b border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-3 py-2">
          {(
            [
              ['interaction', '交互', GitBranch],
              ['design', '设计', Palette],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[12px] font-medium text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] aria-pressed:bg-[#2f6bff]/10 aria-pressed:text-[#2f6bff]"
            >
              <Icon size={12} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>

        {mode === 'interaction' ? (
          selection ? (
            /* 选中了具体元素：只给这一个元素的交互，不再回显整帧的盘点 */
            <Group title="交互" icon={GitBranch}>
              {interactive ? (
                <>

                <Row label="点击后跳到">
                  <select
                    value={currentLink?.targetId ?? ''}
                    onChange={(event) => setLink({ targetId: event.target.value })}
                    className="h-7 w-full cursor-pointer rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-1.5 text-[11.5px] text-[var(--color-ink)] outline-none focus:border-[#2f6bff]/60"
                  >
                    <option value="">未定义（原作没给）</option>
                    {frames
                      .filter((item) => item.id !== selection.stateId)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.generated ? `＋ ${item.label}` : item.label}
                        </option>
                      ))}
                  </select>
                </Row>
                {currentLink && (
                  <Row label="转场">
                    <div className="flex overflow-hidden rounded-md border border-[var(--color-ink)]/10">
                      {(
                        [
                          ['fade', '淡入'],
                          ['slide', '滑入'],
                          ['none', '无'],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={currentLink.transition === id}
                          onClick={() => setLink({ transition: id })}
                          className="h-7 flex-1 border-r border-[var(--color-ink)]/8 text-[11px] text-[var(--color-ink)]/55 transition-colors last:border-r-0 hover:bg-[var(--fill-hover)] aria-pressed:bg-[#2f6bff]/10 aria-pressed:text-[#2f6bff]"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Row>
                )}
                <div className="mt-3 rounded-md border border-dashed border-[var(--color-ink)]/12 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Sparkles size={11} strokeWidth={1.8} className="text-[#2f6bff]" />
                    <span className="text-[11px] font-medium text-[var(--color-ink)]/75">
                      补一屏交互
                    </span>
                    {!advice.fallback && advice.shouldGenerate && (
                      <span className="rounded-sm bg-[#2f6bff]/10 px-1 text-[10px] leading-[15px] text-[#2f6bff]">
                        按语义推荐
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-[10.5px] leading-[1.6] text-[var(--color-ink)]/45">
                    {advice.reason}
                  </p>
                  {advice.shouldGenerate ? (
                    <ul className="space-y-1.5">
                      {advice.suggestions.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => generateScreen(item)}
                            className="group w-full rounded-md border border-[var(--color-ink)]/10 px-2 py-1.5 text-left transition-colors hover:border-[#2f6bff]/40 hover:bg-[#2f6bff]/[0.05]"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--color-ink)]/80 group-hover:text-[#2f6bff]">
                                {item.label}
                              </span>
                              <Plus
                                size={11}
                                strokeWidth={2}
                                className="shrink-0 text-[var(--color-ink)]/25 group-hover:text-[#2f6bff]"
                              />
                            </span>
                            <span className="mt-0.5 block text-[10.5px] leading-[1.55] text-[var(--color-ink)]/40">
                              {item.why}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10.5px] leading-[1.6] text-[var(--color-ink)]/40">
                      上面的「点击后跳到」里选一个已有的帧就行。
                    </p>
                  )}
                </div>
                </>
              ) : (
                <>
                  <p className="mb-2.5 text-[11.5px] leading-[1.7] text-[var(--color-ink)]/50">
                    「{selection.label}」现在没有点击行为。
                  </p>
                  <button
                    type="button"
                    onClick={() => setForceInteraction(selectionKey)}
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#2f6bff]/35 text-[12px] text-[#2f6bff] transition-colors hover:bg-[#2f6bff]/[0.06]"
                  >
                    <Plus size={12} strokeWidth={2} />
                    给它加点击交互
                  </button>
                  <p className="mt-2 text-[11px] leading-[1.65] text-[var(--color-ink)]/40">
                    只想改样式和文案的话去
                    <button
                      type="button"
                      onClick={() => setMode('design')}
                      className="mx-0.5 text-[#2f6bff] underline underline-offset-2"
                    >
                      设计
                    </button>
                    。
                  </p>
                </>
              )}
            </Group>
          ) : (
            <>
            <Group title="交互盘点" icon={GitBranch}>
              <p className="mb-2 text-[11px] leading-[1.65] text-[var(--color-ink)]/45">
                这些 case 只反推了首屏，热点按下去之后原作没给。已接
                <b className="mx-0.5 font-semibold text-[var(--color-ink)]/70">
                  {linkedCount}/{hotspots.length}
                </b>
                个，其余可以选中后现补一屏。
              </p>
              {hotspots.length === 0 ? (
                <p className="py-1 text-[11px] text-[var(--color-ink)]/35">这一帧没有可交互元素</p>
              ) : (
                <ul className="-mx-1">
                  {hotspots.map((hotspot) => {
                    const link = prototype.links[linkKey(activeFrameId, hotspot.path)]
                    const target = frames.find((item) => item.id === link?.targetId)
                    return (
                      <li key={hotspot.path}>
                        <button
                          type="button"
                          onClick={() => onSelectPath(hotspot.path)}
                          className="flex h-8 w-full items-center gap-1.5 rounded-md px-1.5 text-left transition-colors hover:bg-[var(--fill-hover)]"
                        >
                          <span className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--color-ink)]/75">
                            {hotspot.label}
                          </span>
                          {target ? (
                            <span className="max-w-[92px] shrink-0 truncate rounded-sm bg-[#2f6bff]/10 px-1 text-[10px] leading-[15px] text-[#2f6bff]">
                              → {target.label}
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-sm bg-[var(--color-ink)]/[0.06] px-1 text-[10px] leading-[15px] text-[var(--color-ink)]/45">
                              待补
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Group>

            <Group title="状态帧" icon={Layers}>
              <ul className="space-y-1.5">
                {frames.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-md border border-[var(--color-ink)]/8 px-2.5 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {item.generated && (
                          <span className="shrink-0 rounded-sm bg-[#2f6bff]/12 px-1 text-[10px] leading-[15px] text-[#2f6bff]">
                            新增
                          </span>
                        )}
                        <span className="min-w-0 truncate text-[11.5px] text-[var(--color-ink)]/80">
                          {item.label}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-[var(--color-ink)]/40">
                        已改 {Object.keys(overrides[item.id] ?? {}).length} 个元素
                      </div>
                    </div>
                    {item.generated && (
                      <button
                        type="button"
                        title="删除这一屏"
                        onClick={() => {
                          const links = Object.fromEntries(
                            Object.entries(prototype.links).filter(
                              ([, link]) => link.targetId !== item.id,
                            ),
                          )
                          onPrototype({
                            screens: prototype.screens.filter((s) => s.id !== item.id),
                            links,
                          })
                          toast('已删除补出来的界面')
                        }}
                        className="flex size-6 shrink-0 items-center justify-center rounded text-[var(--color-ink)]/35 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75"
                      >
                        <Trash2 size={11} strokeWidth={1.8} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Group>
            </>
          )
        ) : (
          <>
            {/* ── 图层管理 ── */}
            <section className="border-b border-[var(--divider-soft)] px-4 py-3.5">
              <div className="mb-2.5 flex items-center gap-1.5">
                <Layers size={12} strokeWidth={1.8} className="text-[var(--color-ink)]/45" />
                <span className="text-[11.5px] font-medium text-[var(--color-ink)]/75">图层</span>
                <span className="ml-auto truncate text-[10.5px] text-[var(--color-ink)]/35">
                  {activeStateLabel}
                </span>
              </div>
              <div className="mb-2 flex rounded-md bg-[var(--color-ink)]/[0.05] p-0.5">
                {(
                  [
                    ['element', '当前层级'],
                    ['full', '整页结构'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={layerTab === id}
                    onClick={() => setLayerTab(id)}
                    className="h-6 flex-1 rounded-[5px] text-[11px] text-[var(--color-ink)]/55 transition-colors aria-pressed:bg-[var(--color-surface-0)] aria-pressed:text-[var(--color-ink)] aria-pressed:shadow-[0_1px_2px_rgba(16,18,24,0.08)]"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {layerTab === 'element' ? (
                <>
                  {breadcrumb.length > 1 && (
                    <div className="mb-1.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10.5px] text-[var(--color-ink)]/40">
                      {breadcrumb.slice(0, -1).map((path, index) => (
                        <span key={path} className="flex items-center gap-1">
                          {index > 0 && <span className="opacity-50">/</span>}
                          <button
                            type="button"
                            onClick={() => onSelectPath(path)}
                            className="max-w-[92px] truncate transition-colors hover:text-[#2f6bff]"
                          >
                            {path.split('>').at(-1)?.split('.').at(-1) ?? path}
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mb-1 text-[10.5px] text-[var(--color-ink)]/35">
                    {elementView.title}
                  </p>
                  {elementView.items.length === 0 ? (
                    <p className="py-2 text-[11px] text-[var(--color-ink)]/35">这一层没有子元素</p>
                  ) : (
                    <div className="-mx-1">
                      {elementView.items.map((layer) => (
                        <LayerRow
                          key={layer.path}
                          layer={layer}
                          depth={0}
                          active={layer.path === selection?.path}
                          onSelect={() => onSelectPath(layer.path)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <FullStructure
                  layers={layers}
                  selectedPath={selection?.path ?? null}
                  onSelectPath={onSelectPath}
                />
              )}
            </section>

            {selection ? (
              <>
                {isText && (
                  <Group title="内容" icon={TypeIcon}>
                    <textarea
                      value={node?.text ?? m?.text ?? ''}
                      rows={3}
                      onChange={(event) => patchNode({ text: event.target.value })}
                      className="w-full resize-y rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-2 py-1.5 text-[11.5px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[#2f6bff]/60"
                    />
                  </Group>
                )}

                {isImage && (
                  <Group title="图片" icon={ImageIcon}>
                    {/* 缩略图整张放下：盒子定高、图片撑满盒子再 object-contain
                        留白，别用 max-* 让浏览器自己算（会被裁掉）。 */}
                    <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-2)] p-1">
                      {(node?.src ?? m?.src) ? (
                        <img
                          src={node?.src ?? m?.src}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-[var(--color-ink)]/35">暂无图片</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={node?.src ?? m?.src ?? ''}
                      placeholder="图片地址"
                      onChange={(event) => patchNode({ src: event.target.value })}
                      className="mb-2 h-7 w-full rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-2 text-[11.5px] text-[var(--color-ink)] outline-none focus:border-[#2f6bff]/60"
                    />
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={pickImage}
                      className="hidden"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--color-ink)]/10 text-[11.5px] text-[var(--color-ink)]/70 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
                      >
                        <Upload size={11} strokeWidth={1.8} />
                        上传替换
                      </button>
                      {/* 页面上只能换图；要真的改画面，从这里下钻到素材库画布。 */}
                      <button
                        type="button"
                        onClick={() => onOpenAssetCanvas(node?.src ?? m?.src)}
                        className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-[#2f6bff]/25 bg-[#2f6bff]/[0.06] text-[11.5px] text-[#2f6bff] transition-colors hover:bg-[#2f6bff]/[0.12]"
                      >
                        <ExternalLink size={11} strokeWidth={1.8} />
                        素材库画布编辑
                      </button>
                    </div>
                  </Group>
                )}

                <Group title="容器样式" icon={Eye}>
                  {style.background !== undefined ? (
                    <Row
                      label="背景"
                      action={
                        <button
                          type="button"
                          onClick={() => patchStyle({ background: undefined })}
                          className="flex size-5 items-center justify-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
                        >
                          <X size={11} strokeWidth={2} />
                        </button>
                      }
                    >
                      <ColorRow
                        value={style.background}
                        fallback={m?.background ?? '#ffffff'}
                        onChange={(next) => patchStyle({ background: next })}
                      />
                    </Row>
                  ) : (
                    <AddRow
                      label="背景"
                      onAdd={() => patchStyle({ background: m?.background || '#ffffff' })}
                    />
                  )}
                  <Row label="不透明度">
                    <NumField
                      value={style.opacity}
                      placeholder={100}
                      unit="%"
                      onChange={(next) => patchStyle({ opacity: next })}
                    />
                  </Row>
                  <Row label="圆角">
                    <NumField
                      value={style.radius}
                      placeholder={m?.radius}
                      unit="px"
                      onChange={(next) => patchStyle({ radius: next })}
                    />
                  </Row>
                  <Row label="颜色">
                    <ColorRow
                      value={style.color}
                      fallback={m?.color ?? '#000000'}
                      onChange={(next) => patchStyle({ color: next })}
                      onClear={() => patchStyle({ color: undefined })}
                    />
                  </Row>

                  {style.border ? (
                    <Row
                      label="描边"
                      action={
                        <button
                          type="button"
                          onClick={() => patchStyle({ border: undefined })}
                          className="flex size-5 items-center justify-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
                        >
                          <X size={11} strokeWidth={2} />
                        </button>
                      }
                    >
                      <div className="mb-1.5 flex gap-1.5">
                        <NumField
                          value={style.border.width}
                          unit="px"
                          onChange={(next) =>
                            patchStyle({ border: { ...style.border!, width: next ?? 0 } })
                          }
                        />
                        <select
                          value={style.border.style}
                          onChange={(event) =>
                            patchStyle({
                              border: {
                                ...style.border!,
                                style: event.target.value as 'solid' | 'dashed' | 'dotted',
                              },
                            })
                          }
                          className="h-7 flex-1 cursor-pointer rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-1 text-[11.5px] text-[var(--color-ink)] outline-none"
                        >
                          <option value="solid">实线</option>
                          <option value="dashed">虚线</option>
                          <option value="dotted">点线</option>
                        </select>
                      </div>
                      <ColorRow
                        value={style.border.color}
                        fallback="#000000"
                        onChange={(next) => patchStyle({ border: { ...style.border!, color: next } })}
                      />
                    </Row>
                  ) : (
                    <AddRow
                      label="描边"
                      onAdd={() =>
                        patchStyle({ border: { width: 1, style: 'solid', color: '#1a1a1a' } })
                      }
                    />
                  )}

                  {style.shadow ? (
                    <Row
                      label="阴影"
                      action={
                        <button
                          type="button"
                          onClick={() => patchStyle({ shadow: undefined })}
                          className="flex size-5 items-center justify-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/70"
                        >
                          <X size={11} strokeWidth={2} />
                        </button>
                      }
                    >
                      <div className="mb-1.5 flex gap-1.5">
                        <NumField
                          value={style.shadow.x}
                          prefix="X"
                          onChange={(next) => patchStyle({ shadow: { ...style.shadow!, x: next ?? 0 } })}
                        />
                        <NumField
                          value={style.shadow.y}
                          prefix="Y"
                          onChange={(next) => patchStyle({ shadow: { ...style.shadow!, y: next ?? 0 } })}
                        />
                      </div>
                      <div className="mb-1.5 flex gap-1.5">
                        <NumField
                          value={style.shadow.blur}
                          prefix="模糊"
                          onChange={(next) =>
                            patchStyle({ shadow: { ...style.shadow!, blur: next ?? 0 } })
                          }
                        />
                        <NumField
                          value={style.shadow.spread}
                          prefix="扩展"
                          onChange={(next) =>
                            patchStyle({ shadow: { ...style.shadow!, spread: next ?? 0 } })
                          }
                        />
                      </div>
                      <ColorRow
                        value={style.shadow.color}
                        fallback="rgba(0,0,0,.2)"
                        onChange={(next) => patchStyle({ shadow: { ...style.shadow!, color: next } })}
                      />
                    </Row>
                  ) : (
                    <AddRow
                      label="阴影"
                      onAdd={() =>
                        patchStyle({
                          shadow: { x: 0, y: 4, blur: 16, spread: 0, color: 'rgba(0,0,0,.18)' },
                        })
                      }
                    />
                  )}
                </Group>

                {isText && (
                  <Group title="文字" icon={TypeIcon}>
                    <div className="mb-2.5 flex gap-1.5">
                      <NumField
                        value={style.fontSize}
                        placeholder={m?.fontSize}
                        prefix="字号"
                        onChange={(next) => patchStyle({ fontSize: next })}
                      />
                      <NumField
                        value={style.fontWeight}
                        placeholder="字重"
                        prefix="字重"
                        onChange={(next) => patchStyle({ fontWeight: next })}
                      />
                    </div>
                    <div className="mb-2.5 flex gap-1.5">
                      <NumField
                        value={style.lineHeight}
                        placeholder="行高"
                        prefix="行高"
                        onChange={(next) => patchStyle({ lineHeight: next })}
                      />
                      <NumField
                        value={style.letterSpacing}
                        placeholder="字距"
                        prefix="字距"
                        unit="px"
                        onChange={(next) => patchStyle({ letterSpacing: next })}
                      />
                    </div>
                    <div className="flex overflow-hidden rounded-md border border-[var(--color-ink)]/10">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          aria-pressed={style.textAlign === align}
                          onClick={() =>
                            patchStyle({ textAlign: style.textAlign === align ? undefined : align })
                          }
                          className="h-7 flex-1 border-r border-[var(--color-ink)]/8 text-[11px] text-[var(--color-ink)]/55 transition-colors last:border-r-0 hover:bg-[var(--fill-hover)] aria-pressed:bg-[#2f6bff]/10 aria-pressed:text-[#2f6bff]"
                        >
                          {align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}
                        </button>
                      ))}
                    </div>
                  </Group>
                )}

                <Group title="尺寸与布局" icon={Ruler}>
                  <Row label="位置">
                    <div className="flex gap-1.5">
                      <NumField
                        value={style.offsetX}
                        placeholder={0}
                        prefix="X"
                        onChange={(next) => patchStyle({ offsetX: next })}
                      />
                      <NumField
                        value={style.offsetY}
                        placeholder={0}
                        prefix="Y"
                        onChange={(next) => patchStyle({ offsetY: next })}
                      />
                      <NumField
                        value={style.zIndex}
                        placeholder={0}
                        prefix="Z"
                        onChange={(next) => patchStyle({ zIndex: next })}
                      />
                    </div>
                  </Row>
                  <Row label="旋转">
                    <NumField
                      value={style.rotate}
                      placeholder={0}
                      unit="°"
                      onChange={(next) => patchStyle({ rotate: next })}
                    />
                  </Row>
                  <Row label="尺寸">
                    <div className="flex gap-1.5">
                      <NumField
                        value={style.width}
                        placeholder={m?.width}
                        prefix="W"
                        unit="px"
                        onChange={(next) => patchStyle({ width: next })}
                      />
                      <NumField
                        value={style.height}
                        placeholder={m?.height}
                        prefix="H"
                        unit="px"
                        onChange={(next) => patchStyle({ height: next })}
                      />
                    </div>
                  </Row>
                  <Row label="内边距">
                    <div className="flex gap-1.5">
                      <NumField
                        value={style.paddingX}
                        prefix="横"
                        unit="px"
                        onChange={(next) => patchStyle({ paddingX: next })}
                      />
                      <NumField
                        value={style.paddingY}
                        prefix="纵"
                        unit="px"
                        onChange={(next) => patchStyle({ paddingY: next })}
                      />
                    </div>
                  </Row>
                  <Row label="外边距">
                    <div className="flex gap-1.5">
                      <NumField
                        value={style.marginX}
                        prefix="横"
                        unit="px"
                        onChange={(next) => patchStyle({ marginX: next })}
                      />
                      <NumField
                        value={style.marginY}
                        prefix="纵"
                        unit="px"
                        onChange={(next) => patchStyle({ marginY: next })}
                      />
                    </div>
                  </Row>
                </Group>
              </>
            ) : (
              <>
                <Group title="Case 信息" icon={ImageIcon}>
                  <p className="mb-2 text-[11.5px] leading-[1.65] text-[var(--color-ink)]/60">
                    {labCase.summary}
                  </p>
                  <dl className="space-y-1.5 text-[11px]">
                    <div className="flex gap-2">
                      <dt className="w-14 shrink-0 text-[var(--color-ink)]/40">benchmark</dt>
                      <dd className="min-w-0 text-[var(--color-ink)]/70">{labCase.origin}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-14 shrink-0 text-[var(--color-ink)]/40">设计基准</dt>
                      <dd className="text-[var(--color-ink)]/70">{labCase.width}px</dd>
                    </div>
                    {labCase.route && (
                      <div className="flex gap-2">
                        <dt className="w-14 shrink-0 text-[var(--color-ink)]/40">独立路由</dt>
                        <dd className="min-w-0 truncate font-mono text-[10.5px] text-[var(--color-ink)]/70">
                          {labCase.route}
                        </dd>
                      </div>
                    )}
                  </dl>
                </Group>
                <Group title="怎么改" icon={Ruler}>
                  <ul className="space-y-1 text-[11px] leading-[1.7] text-[var(--color-ink)]/55">
                    <li>· 点状态帧上的元素，或直接点上面的图层</li>
                    <li>· 双击文字就地改文案，回车提交</li>
                    <li>· 拖选中框移动位置，拖四角改尺寸</li>
                    <li>· 改完点顶栏「应用」，回预览里试点触</li>
                  </ul>
                </Group>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 border-t border-[var(--divider-soft)] px-3 py-2.5">
        {selection ? (
          <>
            <button
              type="button"
              aria-pressed={Boolean(style.hidden)}
              onClick={() => patchStyle({ hidden: style.hidden ? undefined : true })}
              className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-[11px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)] aria-pressed:bg-[#2f6bff]/10 aria-pressed:text-[#2f6bff]"
            >
              <Eye size={11} strokeWidth={1.8} />
              {style.hidden ? '已隐藏' : '隐藏'}
            </button>
            {/* 和画布选中框上那颗按钮同一件事：把这块带进对话接着聊着改。 */}
            <button
              type="button"
              onClick={onAddToChat}
              className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-[11px] text-[#2f6bff] transition-colors hover:bg-[#2f6bff]/[0.08]"
            >
              <MessageSquarePlus size={11} strokeWidth={1.8} />
              添加到对话
            </button>
            <button
              type="button"
              onClick={() => {
                onOverrides(h5LabReset(overrides, selection.stateId, selection.path))
                toast('已还原该元素')
              }}
              className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md text-[11px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
            >
              <Trash2 size={11} strokeWidth={1.8} />
              还原该元素
            </button>
          </>
        ) : (
          <>
            <span className="px-1 text-[11px] text-[var(--color-ink)]/45">
              共改动 {editCount} 个元素
            </span>
            <button
              type="button"
              disabled={editCount === 0}
              onClick={() => {
                const next = { ...overrides }
                for (const item of labCase.states) delete next[item.id]
                onOverrides(next)
                toast('已还原到 benchmark 复刻原样')
              }}
              className="ml-auto flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={11} strokeWidth={1.8} />
              全部还原
            </button>
          </>
        )}
      </div>
    </div>
  )
}
