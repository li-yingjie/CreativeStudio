import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box as BoxIcon,
  ChevronDown,
  Download,
  Eye,
  GitBranch,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Library,
  Palette,
  Pin,
  Plus,
  RefreshCw,
  Scissors,
  Sparkles,
  Trash2,
  Upload,
  X,
} from '@/shared/icons'
import type { TowerDefenseUiConfig } from './TowerDefenseFlowModel'
import {
  currentArtifact,
  GAME_UI_STYLE_PRESETS,
  GAME_UI_STYLE_SKILLS,
  styleLockFromUi,
} from './GameUiArtifact'
import {
  artMark,
  canSliceNode,
  GAME_UI_BATTLE_TRIGGERS,
  GAME_UI_BUTTON_VARIANTS,
  GAME_UI_KIND_LABEL,
  isHotspot,
  linkKey,
  nodeAlignX,
  nodeAlignY,
  nodeButtonVariant,
  placementFromAlign,
  type GameUiAlignX,
  type GameUiAlignY,
  type GameUiButtonVariant,
  type GameUiTransition,
} from './GameUiModel'
import { suggestGameUiScreens } from './GameUiSuggestions'
import {
  groupLibrarySlices,
  pickerSlicesForNode,
  sliceMatchCount,
  slicesForVersion,
  uiSliceGroupTitle,
} from './GameUiSlices'
import { readTowerDefenseUploadImage } from './TowerDefenseUpload'
import { TowerDefenseUiMaterialShelf } from './TowerDefenseUiMaterialShelf'
import type { TowerUiEditor } from './useTowerUiEditor'

const ALIGN_X: Array<[GameUiAlignX, string]> = [
  ['left', '左对齐'],
  ['center', '水平居中'],
  ['right', '右对齐'],
]
const ALIGN_Y: Array<[GameUiAlignY, string]> = [
  ['top', '顶对齐'],
  ['middle', '垂直居中'],
  ['bottom', '底对齐'],
]

function AlignGlyph({ id }: { id: GameUiAlignX | GameUiAlignY }) {
  if (id === 'left') {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 3.5h12M2 8h8M2 12.5h12" />
      </svg>
    )
  }
  if (id === 'center') {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 3.5h12M4 8h8M2 12.5h12" />
      </svg>
    )
  }
  if (id === 'right') {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 3.5h12M6 8h8M2 12.5h12" />
      </svg>
    )
  }
  if (id === 'top') {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 3h10M8 3v10M5 13h6" />
      </svg>
    )
  }
  if (id === 'bottom') {
    return (
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 13h10M8 3v10M5 3h6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 8h10M8 3v10" />
    </svg>
  )
}

/* 交互只属于页面帧；成品图没有跳转可配，换成元素（切片）。 */
type PanelMode = 'interaction' | 'element' | 'design'

interface Props {
  editor: TowerUiEditor
  ui: TowerDefenseUiConfig
  onUiChange: (ui: TowerDefenseUiConfig) => void
  onApply: () => void
  onClose: () => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 text-[11px] text-[var(--color-ink)]/50">{label}</div>
      {children}
    </div>
  )
}

function Group({
  title,
  icon: Icon,
  extra,
  children,
}: {
  title: string
  icon: typeof Eye
  extra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-[var(--divider-soft)] px-4 py-3.5 first:border-t-0">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon size={12} strokeWidth={1.8} className="text-[var(--color-ink)]/45" />
        <span className="text-[11.5px] font-medium text-[var(--color-ink)]/75">{title}</span>
        {extra}
      </div>
      {children}
    </section>
  )
}

function NumField({
  value,
  onChange,
  prefix,
}: {
  value: number
  onChange: (next: number) => void
  prefix?: string
}) {
  return (
    <label className="flex h-7 min-w-0 w-full items-center gap-1 rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-1.5 focus-within:border-[var(--color-ink)]/30">
      {prefix ? (
        <span className="w-3 shrink-0 text-[10.5px] text-[var(--color-ink)]/35">{prefix}</span>
      ) : null}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-full min-w-0 w-full bg-transparent text-[11.5px] tabular-nums text-[var(--color-ink)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  )
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="h-7 rounded-md border border-[var(--color-ink)]/10 px-2 text-[11px] text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)] aria-pressed:border-[#161823] aria-pressed:bg-[#161823] aria-pressed:text-white"
    >
      {children}
    </button>
  )
}

export function TowerDefenseEditPanel({
  editor,
  ui,
  onUiChange,
  onApply,
  onClose,
}: Props) {
  const selected = editor.selected
  const frame = editor.screens.find((item) => item.id === editor.focus)
  const frameLabel = frame?.label ?? ''
  const currentLink = selected
    ? editor.links[linkKey(selected.screen, selected.id)]
    : undefined
  const selectionKey = selected
    ? `node:${selected.screen}|${selected.id}`
    : editor.surface === 'artifact'
      ? `artifact:${editor.focus}`
      : `css:${editor.focus}`
  const [modePick, setModePick] = useState<{ key: string; mode: PanelMode } | null>(null)
  const [forceInteraction, setForceInteraction] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const persistAfter = useRef<'generate' | 'split' | null>(null)
  const [layersOpen, setLayersOpen] = useState(true)
  const [skillOpen, setSkillOpen] = useState(false)
  const [skillQuery, setSkillQuery] = useState('')
  const [replaceArmed, setReplaceArmed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const nodeFileRef = useRef<HTMLInputElement>(null)
  const sliceFileRef = useRef<HTMLInputElement>(null)
  const layerListRef = useRef<HTMLDivElement>(null)
  const interactive =
    selected !== null &&
    (isHotspot(selected) || Boolean(currentLink) || forceInteraction === selectionKey)
  const autoMode: PanelMode =
    editor.surface === 'artifact'
      ? 'element'
      : !selected || selected.id === editor.justAddedId || !interactive
        ? 'design'
        : 'interaction'
  const mode = modePick?.key === selectionKey ? modePick.mode : autoMode
  const setMode = (next: PanelMode) => setModePick({ key: selectionKey, mode: next })
  const tabs =
    editor.surface === 'artifact'
      ? ([
          ['element', '元素', BoxIcon],
          ['design', '设计', Palette],
        ] as const)
      : ([
          ['interaction', '交互', GitBranch],
          ['design', '设计', Palette],
        ] as const)
  const advice = useMemo(
    () => suggestGameUiScreens(selected?.text || selected?.name || ''),
    [selected?.name, selected?.text],
  )
  const linkedCount = editor.hotspots.filter(
    (item) => editor.links[linkKey(editor.focus, item.id)],
  ).length
  const battleFocus = editor.focus === 'battle'
  const lock = styleLockFromUi(ui)
  const artifact = currentArtifact(frame)
  const stale = editor.artifactStale(editor.focus, ui.visualPreset)
  const generating = editor.generatingId === editor.focus
  const versionSlices = artifact
    ? slicesForVersion(editor.slices, editor.focus, artifact.id)
    : []
  const match = sliceMatchCount(versionSlices)
  const splitting = editor.slicingId === editor.focus
  const picker = selected ? pickerSlicesForNode(editor.slices, selected) : []
  const libraryGroups = groupLibrarySlices(editor.slices).map((group) => ({
    key: group.key,
    title: uiSliceGroupTitle(group.screenId, group.versionId, editor.screens),
    items: group.items,
  }))
  const ingestedCount = versionSlices.filter((item) => item.inLibrary).length
  const backfilledCount = editor.nodes.filter(
    (item) => item.screen === editor.focus && item.artSource === 'slice',
  ).length
  const artifactNodeSelected = editor.surface === 'artifact' && Boolean(selected)

  const patchLock = (next: Partial<typeof lock>) => {
    onUiChange({ ...ui, styleLock: { ...lock, ...next } })
  }

  const customStyle = lock.mode === 'custom'
  const customReady = Boolean(lock.refs.length || lock.prompt?.trim())
  const runGenerate = () => {
    persistAfter.current = 'generate'
    const note = customStyle
      ? lock.prompt
      : GAME_UI_STYLE_PRESETS.find(([id]) => id === ui.visualPreset)?.[1]
    editor.generateArtifact(editor.focus, ui.visualPreset, lock, note)
  }

  const runSplit = () => {
    persistAfter.current = 'split'
    setMode('element')
    void editor.splitScreen(editor.focus)
  }

  useEffect(() => {
    setPicking(false)
    setReplaceArmed(false)
    if (selected?.id) setLayersOpen(false)
  }, [selected?.id])

  useEffect(() => {
    if (!selected?.id || !layersOpen) return
    const row = layerListRef.current?.querySelector(`[data-layer-id="${selected.id}"]`)
    if (row instanceof HTMLElement) row.scrollIntoView({ block: 'nearest' })
  }, [layersOpen, selected?.id])

  const persistBusy = Boolean(editor.generatingId || editor.slicingId)
  useEffect(() => {
    if (persistBusy || !persistAfter.current) return
    const kind = persistAfter.current
    persistAfter.current = null
    onApply()
    if (kind === 'generate' || kind === 'split') setMode('element')
  }, [persistBusy, onApply])

  const addRef = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (!files.length) return
    void Promise.all(files.map((file) => readTowerDefenseUploadImage(file))).then((images) => {
      patchLock({ refs: [...lock.refs, ...images.map((image) => image.src)] })
    })
  }

  const addNodeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selected) return
    const image = await readTowerDefenseUploadImage(file)
    editor.uploadNodeArt(selected.id, image.src)
  }

  const downloadSrc = (src: string, name: string) => {
    const link = document.createElement('a')
    link.href = src
    link.download = name
    link.click()
  }

  /* 风格 skill 只在生成时用，目录收在更换面板里，不铺在设计 tab 上。 */
  const currentSkill =
    GAME_UI_STYLE_SKILLS.find((item) => item.id === ui.visualPreset) ?? GAME_UI_STYLE_SKILLS[0]
  const skillMatches = GAME_UI_STYLE_SKILLS.filter((item) => {
    const query = skillQuery.trim()
    if (!query) return true
    return `${item.name}${item.summary}`.includes(query)
  })
  const pickSkill = (id: (typeof GAME_UI_STYLE_SKILLS)[number]['id']) => {
    onUiChange({
      ...ui,
      visualPreset: id,
      styleLock: { ...lock, mode: 'preset' },
    })
    setSkillOpen(false)
    setSkillQuery('')
  }
  const pickCustom = () => {
    patchLock({ mode: 'custom' })
    setSkillOpen(false)
    setSkillQuery('')
  }
  const styleSection = (
    <Group title="风格模版" icon={Palette}>
      <button
        type="button"
        aria-expanded={skillOpen}
        onClick={() => setSkillOpen((open) => !open)}
        className="mb-2 flex w-full items-center gap-2 rounded-md border border-[var(--color-ink)]/10 px-2 py-1.5 text-left hover:bg-[var(--fill-hover)]"
      >
        {customStyle ? (
          <span className="grid size-9 shrink-0 place-items-center rounded border border-dashed border-[var(--color-ink)]/18 text-[var(--color-ink)]/40">
            <ImagePlus size={14} />
          </span>
        ) : (
          <img
            src={currentSkill.cover}
            alt=""
            className="size-9 shrink-0 rounded object-cover"
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-medium text-[var(--color-ink)]/80">
            {customStyle ? '自定义' : currentSkill.name}
          </span>
          <span className="block truncate text-[10.5px] text-[var(--color-ink)]/40">
            {customStyle
              ? lock.refs.length
                ? `${lock.refs.length} 张参考图`
                : '用参考图和说明生成'
              : '生成时套用，不改当前页面'}
          </span>
        </span>
        <span className="shrink-0 text-[11px] text-[#2f6bff]">更换</span>
      </button>
      {skillOpen ? (
        <div className="mb-2.5 overflow-hidden rounded-md border border-[var(--color-ink)]/10">
          <input
            value={skillQuery}
            onChange={(event) => setSkillQuery(event.target.value)}
            placeholder="搜索风格模版"
            className="h-8 w-full border-b border-[var(--color-ink)]/8 bg-transparent px-2.5 text-[12px] outline-none placeholder:text-[var(--color-ink)]/30"
          />
          <div className="thin-scroll max-h-[220px] overflow-y-auto p-1">
            {skillMatches.map((item) => {
              const pressed = !customStyle && ui.visualPreset === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => pickSkill(item.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left ${
                    pressed ? 'bg-[#2f6bff]/8' : 'hover:bg-[var(--fill-hover)]'
                  }`}
                >
                  <img src={item.cover} alt="" className="size-8 shrink-0 rounded object-cover" />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[12px] ${
                        pressed ? 'font-medium text-[#2f6bff]' : 'text-[var(--color-ink)]/80'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="block truncate text-[10.5px] text-[var(--color-ink)]/40">
                      {item.summary}
                    </span>
                  </span>
                </button>
              )
            })}
            <button
              type="button"
              aria-pressed={customStyle}
              onClick={pickCustom}
              className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left ${
                customStyle ? 'bg-[#2f6bff]/8' : 'hover:bg-[var(--fill-hover)]'
              }`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded border border-dashed border-[var(--color-ink)]/18 text-[var(--color-ink)]/40">
                <ImagePlus size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[12px] ${
                    customStyle ? 'font-medium text-[#2f6bff]' : 'text-[var(--color-ink)]/80'
                  }`}
                >
                  自定义
                </span>
                <span className="block text-[10.5px] text-[var(--color-ink)]/40">
                  上传参考图或写风格说明
                </span>
              </span>
            </button>
            {skillMatches.length ? null : (
              <p className="px-2 py-3 text-[11px] text-[var(--color-ink)]/40">没有匹配的模版</p>
            )}
          </div>
        </div>
      ) : null}
      {customStyle ? (
        <>
          <Row label="参考图">
            <div className="flex flex-wrap gap-1.5">
              {lock.refs.map((src, index) => (
                <button
                  key={`${src.slice(0, 24)}-${index}`}
                  type="button"
                  title="移除参考图"
                  onClick={() => patchLock({ refs: lock.refs.filter((_, i) => i !== index) })}
                  className="size-11 overflow-hidden rounded-md border border-[var(--color-ink)]/10"
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
              <button
                type="button"
                title="上传本地参考图"
                onClick={() => fileRef.current?.click()}
                className="grid size-11 place-items-center rounded-md border border-dashed border-[var(--color-ink)]/20 text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)]"
              >
                <ImagePlus size={14} />
              </button>
            </div>
          </Row>
          <Row label="风格说明">
            <textarea
              value={lock.prompt ?? ''}
              rows={2}
              placeholder="暗金按钮、木质边框、夜间森林"
              onChange={(event) => patchLock({ prompt: event.target.value })}
              className="w-full resize-y rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-2 py-1.5 text-[11.5px] leading-[1.6] text-[var(--color-ink)] outline-none focus:border-[#2f6bff]/60"
            />
          </Row>
        </>
      ) : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={addRef}
      />
    </Group>
  )

  const versionSection =
    frame?.artifact && frame.artifact.versions.length ? (
      <Group title="版本" icon={Layers}>
        <ul className="-mx-1 space-y-0.5">
          {frame.artifact.versions.map((item) => {
            const current = frame.artifact?.versionId === item.id
            const primary =
              (frame.artifact?.primaryId ?? frame.artifact?.versions[0]?.id) === item.id
            return (
              <li
                key={item.id}
                className={`flex items-center gap-1 rounded-md px-1.5 py-1 ${
                  current ? 'bg-[#2f6bff]/10' : 'hover:bg-[var(--fill-hover)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => editor.setArtifactVersion(editor.focus, item.id)}
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                >
                  <span
                    className={`text-[11.5px] font-medium ${
                      current ? 'text-[#2f6bff]' : 'text-[var(--color-ink)]/75'
                    }`}
                  >
                    {item.id.toUpperCase()}
                  </span>
                  {primary ? (
                    <span className="rounded-sm bg-[var(--color-ink)]/[0.06] px-1 text-[9.5px] leading-[15px] text-[var(--color-ink)]/50">
                      主
                    </span>
                  ) : null}
                  <span className="min-w-0 truncate text-[10px] text-[var(--color-ink)]/40">
                    {item.note || ''}
                  </span>
                </button>
                {primary ? null : (
                  <button
                    type="button"
                    title="设为主版本"
                    onClick={() => editor.setPrimaryVersion(editor.focus, item.id)}
                    className="grid size-6 place-items-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)]"
                  >
                    <Pin size={11} />
                  </button>
                )}
                <button
                  type="button"
                  title="下载这一版"
                  onClick={() => downloadSrc(item.src, `${frameLabel}-${item.id}.png`)}
                  className="grid size-6 place-items-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)]"
                >
                  <Download size={11} />
                </button>
                {frame.artifact && frame.artifact.versions.length > 1 ? (
                  <button
                    type="button"
                    title="删除这一版"
                    onClick={() => editor.deleteArtifactVersion(editor.focus, item.id)}
                    className="grid size-6 place-items-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)]"
                  >
                    <Trash2 size={11} />
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      </Group>
    ) : null

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5">
        <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">编辑</span>
        {selected ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 rounded bg-[var(--color-ink)]/[0.07] px-1 py-px font-mono text-[10px] text-[var(--color-ink)]/55">
              {GAME_UI_KIND_LABEL[selected.kind]}
            </span>
            <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/45">
              {selected.name}
            </span>
          </span>
        ) : (
          <span className="min-w-0 truncate text-[11px] text-[var(--color-ink)]/45">
            {artifact
              ? `${frameLabel} · ${artifact.id.toUpperCase()}`
              : frameLabel}
          </span>
        )}
        <button
          type="button"
          disabled={!editor.pending}
          onClick={onApply}
          className="ml-auto flex h-7 items-center rounded-md bg-[#161823] px-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#1c1f23]/10 disabled:text-[#1c1f23]/35"
        >
          应用
        </button>
        <button
          type="button"
          onClick={onClose}
          title="退出画布编辑"
          className="flex size-7 items-center justify-center rounded-md text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex shrink-0 gap-0.5 border-b border-[var(--divider-soft)] px-3 py-2">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[12px] font-medium text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] aria-pressed:bg-[#161823] aria-pressed:text-white"
          >
            <Icon size={12} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'design' && editor.surface === 'css' ? (
        <section className="shrink-0 border-b border-[var(--divider-soft)] px-4 py-2.5">
          <button
            type="button"
            aria-expanded={layersOpen}
            onClick={() => setLayersOpen((open) => !open)}
            className="flex w-full items-center gap-1.5"
          >
            <Layers size={12} strokeWidth={1.8} className="text-[var(--color-ink)]/45" />
            <span className="text-[11.5px] font-medium text-[var(--color-ink)]/75">图层</span>
            <ChevronDown
              size={12}
              className={`text-[var(--color-ink)]/40 transition-transform ${layersOpen ? '' : '-rotate-90'}`}
            />
            <select
              value={editor.focus}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => editor.select(null, event.target.value)}
              className="ml-auto h-6 max-w-[140px] cursor-pointer truncate rounded border-0 bg-transparent text-[11px] text-[var(--color-ink)]/55 outline-none"
            >
              {editor.screens.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.generated ? `＋ ${item.label}` : item.label}
                </option>
              ))}
            </select>
          </button>
          {layersOpen ? (
            <div ref={layerListRef} className="-mx-1 mt-1.5 max-h-[140px] overflow-y-auto">
              {editor.layers.map((item) => {
                const active = item.id === editor.selectedId
                const mark = artMark(item)
                return (
                  <div
                    key={item.id}
                    data-layer-id={item.id}
                    className={`flex h-7 items-center gap-1 rounded-md px-1.5 ${
                      active
                        ? 'bg-[#161823]/8 text-[#161823]'
                        : 'text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => editor.select(item.id, item.screen)}
                      className="flex h-full min-w-0 flex-1 items-center gap-1.5 text-left"
                    >
                      <BoxIcon size={11} strokeWidth={1.8} className="shrink-0 opacity-60" />
                      <span className="min-w-0 truncate text-[11.5px]">{item.name}</span>
                      {mark ? (
                        <span className="shrink-0 rounded-sm bg-[#2f6bff]/10 px-1 text-[9.5px] leading-[15px] text-[#2f6bff]">
                          {mark}
                        </span>
                      ) : null}
                      <span className="ml-auto shrink-0 font-mono text-[9.5px] opacity-35">
                        {GAME_UI_KIND_LABEL[item.kind]}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={item.visible ? '隐藏图层' : '显示图层'}
                      onClick={() => editor.patch(item.id, { visible: !item.visible })}
                      className="grid size-5 place-items-center rounded text-current/60 hover:bg-[var(--fill-hover)]"
                    >
                      <Eye size={11} className={item.visible ? '' : 'opacity-25'} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {mode === 'interaction' ? (
          selected ? (
            <Group title="交互" icon={GitBranch}>
              {interactive ? (
                <>
                  <Row label="点击后跳到">
                    <select
                      value={currentLink?.targetId ?? ''}
                      onChange={(event) =>
                        editor.setLink(selected.screen, selected.id, {
                          targetId: event.target.value,
                        })
                      }
                      className="h-7 w-full cursor-pointer rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-1.5 text-[11.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/30"
                    >
                      <option value="">未定义</option>
                      {editor.screens
                        .filter((item) => item.id !== selected.screen)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.generated ? `＋ ${item.label}` : item.label}
                          </option>
                        ))}
                    </select>
                  </Row>
                  {currentLink ? (
                    <Row label="转场">
                      <div className="flex overflow-hidden rounded-md border border-[var(--color-ink)]/10">
                        {(
                          [
                            ['fade', '淡入'],
                            ['slide', '滑入'],
                            ['none', '无'],
                          ] as const satisfies Array<[GameUiTransition, string]>
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={currentLink.transition === id}
                            onClick={() =>
                              editor.setLink(selected.screen, selected.id, {
                                transition: id,
                              })
                            }
                            className="h-7 flex-1 border-r border-[var(--color-ink)]/8 text-[11px] text-[var(--color-ink)]/55 last:border-r-0 hover:bg-[var(--fill-hover)] aria-pressed:bg-[#161823] aria-pressed:text-white"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </Row>
                  ) : null}
                  <div className="mt-3 rounded-md border border-dashed border-[var(--color-ink)]/12 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Sparkles size={11} strokeWidth={1.8} className="text-[#2f6bff]" />
                      <span className="text-[11px] font-medium text-[var(--color-ink)]/75">
                        补一屏交互
                      </span>
                      {!advice.fallback && advice.shouldGenerate ? (
                        <span className="rounded-sm bg-[#2f6bff]/10 px-1 text-[10px] leading-[15px] text-[#2f6bff]">
                          按语义推荐
                        </span>
                      ) : null}
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
                              onClick={() =>
                                editor.generateScreen(item, {
                                  screenId: selected.screen,
                                  nodeId: selected.id,
                                  label: selected.text || selected.name,
                                })
                              }
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
                    「{selected.name}」现在没有点击行为。
                  </p>
                  <button
                    type="button"
                    onClick={() => setForceInteraction(selectionKey)}
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#2f6bff]/35 text-[12px] text-[#2f6bff] hover:bg-[#2f6bff]/[0.06]"
                  >
                    <Plus size={12} strokeWidth={2} />
                    给它加点击交互
                  </button>
                </>
              )}
            </Group>
          ) : (
            <Group title="交互盘点" icon={GitBranch}>
              <p className="mb-2 text-[11px] leading-[1.65] text-[var(--color-ink)]/45">
                这一帧已接
                <b className="mx-0.5 font-semibold text-[var(--color-ink)]/70">
                  {linkedCount}/{editor.hotspots.length}
                </b>
                个热点。
              </p>
              {battleFocus ? (
                <div className="mb-2.5 rounded-md bg-[var(--color-ink)]/[0.04] px-2.5 py-2">
                  <p className="mb-1.5 text-[10.5px] text-[var(--color-ink)]/45">
                    对局跳转由游戏状态机触发
                  </p>
                  <ul className="space-y-1">
                    {GAME_UI_BATTLE_TRIGGERS.map((item) => {
                      const target = editor.screens.find((screen) => screen.id === item.targetId)
                      return (
                        <li
                          key={item.id}
                          className="flex items-center justify-between text-[11px] text-[var(--color-ink)]/70"
                        >
                          <span>{item.label}</span>
                          <span className="text-[10px] text-[#2f6bff]">→ {target?.label}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
              {editor.hotspots.length === 0 ? (
                <p className="py-1 text-[11px] text-[var(--color-ink)]/35">这一帧没有可交互元素</p>
              ) : (
                <ul className="-mx-1">
                  {editor.hotspots.map((item) => {
                    const link = editor.links[linkKey(editor.focus, item.id)]
                    const target = editor.screens.find((screen) => screen.id === link?.targetId)
                    return (
                      <li key={item.id} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => editor.select(item.id, item.screen)}
                          className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 text-left hover:bg-[var(--fill-hover)]"
                        >
                          <span className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--color-ink)]/75">
                            {item.text || item.name}
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
                        {target?.generated ? (
                          <button
                            type="button"
                            title="删除补出来的屏"
                            onClick={() => editor.deleteScreen(target.id)}
                            className="grid size-6 place-items-center rounded text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75"
                          >
                            <Trash2 size={11} strokeWidth={1.8} />
                          </button>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </Group>
          )
        ) : mode === 'element' && artifactNodeSelected && selected ? (
          <Group title="裁切回页面" icon={Scissors}>
            {canSliceNode(selected) ? (
              <>
                <p className="mb-2 text-[11px] leading-[1.6] text-[var(--color-ink)]/45">
                  拖成品帧上的框改裁切区。切回去只改这一个节点。
                </p>
                <div className="mb-2 overflow-hidden rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-ink)]/[0.04]">
                  <img
                    src={
                      versionSlices.find((item) => item.nodeId === selected.id)?.src ??
                      selected.artSlot ??
                      artifact?.src
                    }
                    alt=""
                    className="mx-auto max-h-24 object-contain"
                  />
                </div>
                <div className="mb-2.5 grid min-w-0 grid-cols-2 gap-2">
                  <NumField
                    prefix="X"
                    value={selected.x}
                    onChange={(x) => editor.patch(selected.id, { x })}
                  />
                  <NumField
                    prefix="Y"
                    value={selected.y}
                    onChange={(y) => editor.patch(selected.id, { y })}
                  />
                  <NumField
                    prefix="W"
                    value={selected.width}
                    onChange={(width) => editor.patch(selected.id, { width })}
                  />
                  <NumField
                    prefix="H"
                    value={selected.height}
                    onChange={(height) => editor.patch(selected.id, { height })}
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (selected.artPinned && !replaceArmed) {
                        setReplaceArmed(true)
                        return
                      }
                      void editor.applyArtifactCrop(selected.id, replaceArmed)
                      setReplaceArmed(false)
                    }}
                    className="flex h-8 flex-1 items-center justify-center rounded-md bg-[#161823] text-[12px] font-medium text-white"
                  >
                    {selected.artPinned && !replaceArmed ? '替换本地素材？确认' : '应用到页面'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadSrc(
                        versionSlices.find((item) => item.nodeId === selected.id)?.src ??
                          selected.artSlot ??
                          artifact?.src ??
                          '',
                        `${selected.name}.png`,
                      )
                    }
                    className="grid size-8 place-items-center rounded-md border border-[var(--color-ink)]/12 text-[var(--color-ink)]/55 hover:bg-[var(--fill-hover)]"
                    title="下载这块"
                  >
                    <Download size={12} />
                  </button>
                </div>
              </>
            ) : (
              <p className="text-[11px] leading-[1.6] text-[var(--color-ink)]/45">
                文字保持可编辑，不从成品图裁。
              </p>
            )}
          </Group>
        ) : mode === 'design' && editor.surface === 'css' && selected ? (
          (() => {
            const variant = nodeButtonVariant(selected)
            const alignX = nodeAlignX(selected)
            const alignY = nodeAlignY(selected)
            const showText =
              selected.kind === 'text' ||
              (selected.kind === 'button' && variant !== 'plain') ||
              (selected.kind !== 'button' && Boolean(selected.hasText))
            const showAlign = showText || selected.kind === 'button'
            const copy = selected.text ?? ''
            const applyVariant = (next: GameUiButtonVariant) => {
              editor.patch(selected.id, {
                buttonVariant: next,
                hasText: next !== 'plain',
                iconName: next === 'titled-icon' ? selected.iconName || '图标' : undefined,
              })
            }
            const applyAlign = (nextX: GameUiAlignX, nextY: GameUiAlignY) => {
              editor.patch(selected.id, {
                alignX: nextX,
                alignY: nextY,
                textPlacement: placementFromAlign(nextX, nextY),
              })
            }
            return (
              <>
                <Group title="显示" icon={BoxIcon}>
                  {selected.kind === 'button' ? (
                    <Row label="按钮类型">
                      <div className="flex min-w-0 flex-wrap gap-1">
                        {GAME_UI_BUTTON_VARIANTS.map(([id, label]) => (
                          <Chip
                            key={id}
                            pressed={variant === id}
                            onClick={() => applyVariant(id)}
                          >
                            {label}
                          </Chip>
                        ))}
                      </div>
                    </Row>
                  ) : null}
                  {showText ? (
                    <Row label={`文字(${copy.length}/20)`}>
                      <input
                        value={copy}
                        maxLength={20}
                        autoFocus={selected.id === editor.justAddedId}
                        onChange={(event) =>
                          editor.patch(selected.id, { text: event.target.value })
                        }
                        className="h-7 w-full min-w-0 rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-2 text-[11.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]/30"
                      />
                    </Row>
                  ) : null}
                  {variant === 'titled-icon' || selected.kind === 'icon' ? (
                    <Row label="图标名">
                      <input
                        value={selected.iconName ?? ''}
                        maxLength={10}
                        onChange={(event) =>
                          editor.patch(selected.id, { iconName: event.target.value })
                        }
                        className="h-7 w-full min-w-0 rounded-md border border-[var(--color-ink)]/10 bg-[var(--color-surface-0)] px-2 text-[11.5px] outline-none focus:border-[var(--color-ink)]/30"
                      />
                    </Row>
                  ) : null}
                  {showAlign ? (
                    <Row label="文字排列">
                      <div className="grid min-w-0 grid-cols-6 gap-1">
                        {[...ALIGN_X, ...ALIGN_Y].map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            title={label}
                            aria-pressed={
                              ALIGN_X.some(([key]) => key === id)
                                ? alignX === id
                                : alignY === id
                            }
                            onClick={() =>
                              ALIGN_X.some(([key]) => key === id)
                                ? applyAlign(id as GameUiAlignX, alignY)
                                : applyAlign(alignX, id as GameUiAlignY)
                            }
                            className="grid h-7 min-w-0 place-items-center rounded-md border border-[var(--color-ink)]/10 text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)] aria-pressed:border-[#161823] aria-pressed:bg-[#161823] aria-pressed:text-white"
                          >
                            <AlignGlyph id={id} />
                          </button>
                        ))}
                      </div>
                    </Row>
                  ) : null}
                </Group>
                <Group title="位置与尺寸" icon={BoxIcon}>
                  <div className="grid min-w-0 grid-cols-2 gap-2">
                    <NumField
                      prefix="X"
                      value={Math.round(selected.x)}
                      onChange={(x) => editor.patch(selected.id, { x })}
                    />
                    <NumField
                      prefix="Y"
                      value={Math.round(selected.y)}
                      onChange={(y) => editor.patch(selected.id, { y })}
                    />
                    <NumField
                      prefix="W"
                      value={Math.round(selected.width)}
                      onChange={(width) => editor.patch(selected.id, { width })}
                    />
                    <NumField
                      prefix="H"
                      value={Math.round(selected.height)}
                      onChange={(height) => editor.patch(selected.id, { height })}
                    />
                  </div>
                </Group>
                {canSliceNode(selected) ? (
                  <Group title="图片" icon={ImageIcon}>
                    <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-md border border-[var(--color-ink)]/8 bg-[var(--color-ink)]/[0.03] p-1">
                      {selected.artSlot ? (
                        <img
                          src={selected.artSlot}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-[var(--color-ink)]/35">暂无图片</span>
                      )}
                    </div>
                    <input
                      ref={nodeFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void addNodeUpload(event)}
                    />
                    <div className="grid min-w-0 grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => nodeFileRef.current?.click()}
                        className="flex h-7 min-w-0 items-center justify-center gap-1 rounded-md border border-[var(--color-ink)]/10 text-[11.5px] text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]"
                      >
                        <Upload size={11} />
                        上传替换
                      </button>
                      <button
                        type="button"
                        aria-pressed={picking}
                        onClick={() => setPicking((open) => !open)}
                        className="flex h-7 min-w-0 items-center justify-center gap-1 rounded-md bg-[#161823] text-[11.5px] text-white hover:bg-[#161823]/90"
                      >
                        <Sparkles size={11} />
                        素材库编辑
                      </button>
                    </div>
                    {picking ? (
                      <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-[var(--color-ink)]/10 p-2">
                        {libraryGroups.length ? (
                          <TowerDefenseUiMaterialShelf
                            groups={libraryGroups}
                            selectedId={selected.artSliceId}
                            compact
                            onAssign={(id) => {
                              editor.applySliceToNode(selected.id, id)
                              setPicking(false)
                            }}
                            onDownload={(item) => downloadSrc(item.src, `${item.name}.png`)}
                          />
                        ) : picker.length ? (
                          picker.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                editor.applySliceToNode(selected.id, item.id)
                                setPicking(false)
                              }}
                              className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-[var(--fill-hover)]"
                            >
                              <img src={item.src} alt="" className="size-8 rounded object-contain" />
                              <span className="min-w-0 flex-1 truncate text-[11.5px]">{item.name}</span>
                            </button>
                          ))
                        ) : (
                          <p className="px-2 py-3 text-[11px] text-[var(--color-ink)]/40">
                            先拆分并入库，素材会出现在这里。
                          </p>
                        )}
                      </div>
                    ) : null}
                    {selected.render === 'art' ? (
                      <button
                        type="button"
                        onClick={() => editor.restoreNode(selected.id)}
                        className="mt-2 h-7 w-full rounded-md border border-[var(--color-ink)]/10 text-[12px] text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)]"
                      >
                        还原页面样式
                      </button>
                    ) : null}
                  </Group>
                ) : null}
                <div className="border-t border-[var(--divider-soft)] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => editor.deleteNode(selected.id)}
                    className="flex h-8 w-full items-center justify-center rounded-md bg-[#c62828]/8 text-[12px] font-medium text-[#c62828] hover:bg-[#c62828]/12"
                  >
                    删除
                  </button>
                </div>
              </>
            )
          })()
        ) : mode === 'element' && versionSlices.length ? (
          <section className="px-3 py-3">
            <div className="mb-2.5 flex items-baseline gap-2 px-1">
              <span className="text-[12px] font-medium text-[var(--color-ink)]/80">
                拆分结果
              </span>
              <span className="text-[10.5px] text-[var(--color-ink)]/40">
                {versionSlices.length} 件 · 待分配 {match.pending} · 已回填 {backfilledCount}
              </span>
            </div>
            <ul className="space-y-2">
              {versionSlices.map((item) => {
                const bound = editor.nodes.find((node) => node.id === item.nodeId)
                const active = editor.selectedSliceId === item.id
                return (
                  <li
                    key={item.id}
                    className={`rounded-xl border px-2 py-2 ${
                      active
                        ? 'border-[#2f6bff]/35 bg-[#2f6bff]/[0.06]'
                        : 'border-[var(--color-ink)]/8 bg-[var(--color-surface-0)]'
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => editor.selectSlice(item.id)}
                        className="size-[72px] shrink-0 overflow-hidden rounded-lg border border-[var(--color-ink)]/8 bg-[var(--color-ink)]/[0.04]"
                      >
                        <img src={item.src} alt="" className="size-full object-contain" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-medium text-[var(--color-ink)]/85">
                          {item.name}
                        </div>
                        <div className="mt-0.5 truncate text-[10.5px] text-[var(--color-ink)]/40">
                          {bound ? `→ ${bound.name}` : '待分配'}
                          {item.score ? ` · ${Math.round(item.score * 100)}%` : ''}
                          {item.inLibrary ? ' · 已存入' : ''}
                          {bound?.render === 'art' ? ` · ${artMark(bound)}` : ''}
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <select
                            value={item.nodeId ?? ''}
                            onChange={(event) =>
                              editor.bindSlice(item.id, event.target.value || null)
                            }
                            className="h-7 min-w-0 flex-1 cursor-pointer rounded-md border border-[var(--color-ink)]/10 bg-transparent px-1.5 text-[11px] outline-none"
                          >
                            <option value="">待分配</option>
                            {editor.layers
                              .filter((node) => canSliceNode(node))
                              .map((node) => (
                                <option key={node.id} value={node.id}>
                                  {node.name}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            title="上传替换"
                            onClick={() => {
                              editor.selectSlice(item.id)
                              sliceFileRef.current?.click()
                            }}
                            className="grid size-7 shrink-0 place-items-center rounded-md text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)]"
                          >
                            <Upload size={13} />
                          </button>
                          <button
                            type="button"
                            title="下载"
                            onClick={() => downloadSrc(item.src, `${item.name}.png`)}
                            className="grid size-7 shrink-0 place-items-center rounded-md text-[var(--color-ink)]/40 hover:bg-[var(--fill-hover)]"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            type="button"
                            title="删除"
                            onClick={() => editor.deleteSlice(item.id)}
                            className="grid size-7 shrink-0 place-items-center rounded-md text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)]"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <input
              ref={sliceFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file || !editor.selectedSliceId) return
                void readTowerDefenseUploadImage(file).then((image) => {
                  editor.replaceSliceSrc(editor.selectedSliceId!, image.src)
                })
              }}
            />
          </section>
        ) : mode === 'element' ? (
          <Group title="拆分 UI" icon={Scissors}>
            <p className="text-[11px] leading-[1.65] text-[var(--color-ink)]/45">
              把这一版成品图切成可用的元素图。切完在这里绑定图层，底部按钮负责入库、回填和下载。
            </p>
          </Group>
        ) : (
          <>
            {styleSection}
            {versionSection}
          </>
        )}
      </div>
      {mode === 'design' && !selected ? (
        <div className="shrink-0 border-t border-[var(--divider-soft)] px-3 py-2.5">
          {stale ? (
            <p className="mb-2 text-[10.5px] leading-[1.55] text-[#c27a2d]">
              页面或风格已变，生成会挂一个新版本。
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={!artifact || splitting}
              onClick={runSplit}
              className="flex h-9 items-center justify-center gap-1.5 rounded-md border border-[var(--color-ink)]/12 text-[12.5px] font-medium text-[var(--color-ink)]/80 hover:bg-[var(--fill-hover)] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {splitting ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Scissors size={13} />
              )}
              拆分 UI
            </button>
            <button
              type="button"
              disabled={generating || (customStyle && !customReady)}
              onClick={runGenerate}
              className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#161823] text-[12.5px] font-medium text-white disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              {artifact ? '重新生成' : '生成 UI'}
            </button>
          </div>
        </div>
      ) : mode === 'element' && !artifactNodeSelected && versionSlices.length ? (
        <div className="shrink-0 border-t border-[var(--divider-soft)] px-3 py-2.5">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              disabled={ingestedCount === versionSlices.length}
              onClick={() => {
                editor.ingestSlices(versionSlices.map((item) => item.id))
                onApply()
              }}
              className="flex h-9 items-center justify-center gap-1 rounded-md border border-[var(--color-ink)]/12 text-[11px] font-medium text-[var(--color-ink)]/75 hover:bg-[var(--fill-hover)] disabled:opacity-40"
            >
              <Library size={12} />
              存入素材库
            </button>
            <button
              type="button"
              disabled={!match.matched}
              onClick={() => editor.backfillMatched(editor.focus)}
              className="flex h-9 items-center justify-center gap-1 rounded-md bg-[#161823] text-[11px] font-medium text-white disabled:opacity-40"
            >
              一键回填
            </button>
            <button
              type="button"
              onClick={() =>
                versionSlices.forEach((item) => downloadSrc(item.src, `${item.name}.png`))
              }
              className="flex h-9 items-center justify-center gap-1 rounded-md border border-[var(--color-ink)]/12 text-[11px] font-medium text-[var(--color-ink)]/75 hover:bg-[var(--fill-hover)]"
            >
              <Download size={12} />
              下载全部
            </button>
          </div>
          {editor.backfillNote?.screenId === editor.focus && editor.backfillNote.skipped ? (
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-[#c27a2d]/10 px-2 py-1.5 text-[10.5px] text-[#c27a2d]">
              <span className="min-w-0 flex-1">
                已跳过 {editor.backfillNote.skipped} 个本地素材
              </span>
              <button
                type="button"
                onClick={() =>
                  editor.backfillNote?.kind === 'recut'
                    ? editor.recutFromVersion(editor.focus, true)
                    : editor.backfillMatched(editor.focus, true)
                }
                className="shrink-0 font-medium underline"
              >
                连本地素材一起覆盖
              </button>
            </div>
          ) : (
            <p className="mt-2 px-0.5 text-[10.5px] leading-[1.55] text-[var(--color-ink)]/40">
              存入后会把分拆图层填进「UI-{frameLabel}」对应槽位。回填跳过钉住的本地图。
            </p>
          )}
        </div>
      ) : mode === 'element' && !artifactNodeSelected ? (
        <div className="shrink-0 border-t border-[var(--divider-soft)] px-3 py-2.5">
          <button
            type="button"
            disabled={!artifact || splitting}
            onClick={runSplit}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#161823] text-[12.5px] font-medium text-white disabled:opacity-50"
          >
            {splitting ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Scissors size={13} />
            )}
            拆分 UI
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default TowerDefenseEditPanel
