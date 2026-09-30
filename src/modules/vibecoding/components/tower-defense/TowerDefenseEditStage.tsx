import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Maximize2,
  Minimize2,
  Minus,
  Move,
  Plus,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
} from '@/shared/icons'
import type { TowerDefenseUiConfig } from './TowerDefenseFlowModel'
import { CSS_LAYOUT_PRESET, currentArtifact } from './GameUiArtifact'
import {
  GAME_UI_CORNER_RADIUS,
  GAME_UI_FIT_ZOOM,
  GAME_UI_HEIGHT,
  GAME_UI_KIND_LABEL,
  GAME_UI_WIDTH,
  screenArtBackfilled,
  type GameUiNodeKind,
  moveNode,
  resizeNode,
} from './GameUiModel'
import type { TowerUiEditor } from './useTowerUiEditor'
import { TowerDefenseArtifactFrame } from './TowerDefenseArtifactFrame'
import { TowerDefenseUiScreen } from './TowerDefenseUiScreen'

const MIN_ZOOM = 0.15
const MAX_ZOOM = 3
const ADD_KINDS: GameUiNodeKind[] = ['button', 'icon', 'text', 'progress', 'image', 'container']
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function PhoneArtboard({
  zoom,
  focused,
  children,
  onPointerDown,
}: {
  zoom: number
  focused: boolean
  children: ReactNode
  onPointerDown: () => void
}) {
  return (
    <div
      className="relative overflow-hidden bg-black shadow-[0_8px_30px_rgba(16,18,24,0.16)]"
      style={{
        width: GAME_UI_WIDTH * zoom,
        height: GAME_UI_HEIGHT * zoom,
        borderRadius: GAME_UI_CORNER_RADIUS * zoom,
        outline: focused ? '2px solid #357ef8' : '1px solid rgba(16,18,24,0.10)',
        outlineOffset: focused ? 2 : 0,
      }}
      onPointerDown={onPointerDown}
    >
      <div
        className="origin-top-left"
        style={{
          width: GAME_UI_WIDTH,
          height: GAME_UI_HEIGHT,
          transform: `scale(${zoom})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ArtboardChrome({
  width,
  leading,
  trailing,
}: {
  width: number
  leading: ReactNode
  trailing: ReactNode
}) {
  return (
    <div className="mb-2 flex h-6 w-full flex-nowrap items-center gap-1" style={{ width }}>
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
        {leading}
      </div>
      <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-1">{trailing}</div>
    </div>
  )
}

interface View {
  zoom: number
  x: number
  y: number
}

export interface TowerDefenseEditStageProps {
  editor: TowerUiEditor
  ui: TowerDefenseUiConfig
  onExit: () => void
}

export function TowerDefenseEditStage({
  editor,
  ui,
  onExit,
}: TowerDefenseEditStageProps) {
  const [view, setView] = useState<View>({ zoom: GAME_UI_FIT_ZOOM, x: 36, y: 24 })
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [panning, setPanning] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)
  const dragRef = useRef<{
    id: string
    mode: 'move' | 'resize'
    startX: number
    startY: number
    baseX: number
    baseY: number
    baseW: number
    baseH: number
    moved: boolean
  } | null>(null)
  const viewRef = useRef(view)
  viewRef.current = view

  useLayoutEffect(() => {
    const root = stageRef.current
    if (!root || !editor.selectedId || editor.selected?.screen !== editor.focus) {
      setSelectionBox(null)
      return
    }
    const node = root.querySelector(
      editor.surface === 'artifact'
        ? `[data-game-ui-artifact-node="${editor.selectedId}"]`
        : `[data-game-ui-node="${editor.selectedId}"]`,
    )
    if (!(node instanceof HTMLElement)) {
      setSelectionBox(null)
      return
    }
    const rootBox = root.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    setSelectionBox({
      left: box.left - rootBox.left,
      top: box.top - rootBox.top,
      width: box.width,
      height: box.height,
    })
  }, [editor.focus, editor.nodes, editor.selected, editor.selectedId, editor.surface, view])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) editor.redo()
        else editor.undo()
        return
      }
      if (event.code === 'Space' && !event.repeat && !typing) {
        event.preventDefault()
        setSpaceHeld(true)
        return
      }
      if ((event.key === 'Backspace' || event.key === 'Delete') && !typing) {
        if (editor.surface === 'css' && editor.selectedId && !editor.selected?.locked) {
          event.preventDefault()
          editor.deleteNode(editor.selectedId)
        }
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        if (addingFor) {
          setAddingFor(null)
          return
        }
        if (editor.selectedId) editor.select(null)
        else if (editor.surface === 'artifact') editor.select(null)
        else onExit()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpaceHeld(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [addingFor, editor, onExit])

  useEffect(() => {
    if (!addingFor) return
    const onPointerDown = (event: PointerEvent) => {
      if (addMenuRef.current?.contains(event.target as Node)) return
      setAddingFor(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [addingFor])

  const beginDrag = useCallback(
    (mode: 'move' | 'resize', id: string, clientX: number, clientY: number) => {
      const node = editor.nodes.find((item) => item.id === id)
      if (!node || node.locked) return
      dragRef.current = {
        id,
        mode,
        startX: clientX,
        startY: clientY,
        baseX: node.x,
        baseY: node.y,
        baseW: node.width,
        baseH: node.height,
        moved: false,
      }
    },
    [editor.nodes],
  )

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const zoom = viewRef.current.zoom
      const dx = (event.clientX - drag.startX) / zoom
      const dy = (event.clientY - drag.startY) / zoom
      if (!drag.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return
      drag.moved = true
      event.preventDefault()
      editor.replaceLive({
        nodes:
          drag.mode === 'move'
            ? moveNode(editor.nodes, drag.id, drag.baseX + dx, drag.baseY + dy)
            : resizeNode(editor.nodes, drag.id, drag.baseW + dx, drag.baseH + dy),
        screens: editor.screens,
        links: editor.links,
        slices: editor.slices,
      })
    }
    const onUp = () => {
      const drag = dragRef.current
      dragRef.current = null
      if (drag?.moved) {
        editor.commit({
          nodes: editor.nodes,
          screens: editor.screens,
          links: editor.links,
          slices: editor.slices,
        })
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [editor])

  const zoomFromCenter = (factor: number) => {
    setView((current) => ({
      ...current,
      zoom: clamp(Number((current.zoom * factor).toFixed(3)), MIN_ZOOM, MAX_ZOOM),
    }))
  }

  return (
    <div ref={stageRef} className="relative h-full min-h-0 w-full overflow-hidden">
      <div
        className={`h-full w-full overflow-hidden ${spaceHeld || panning ? (panning ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        onPointerDownCapture={(event) => {
          if (spaceHeld || event.button === 1) {
            event.preventDefault()
            panRef.current = { px: event.clientX, py: event.clientY, ox: view.x, oy: view.y }
            setPanning(true)
            event.currentTarget.setPointerCapture(event.pointerId)
          }
        }}
        onPointerMove={(event) => {
          const pan = panRef.current
          if (!pan) return
          setView((current) => ({
            ...current,
            x: pan.ox + event.clientX - pan.px,
            y: pan.oy + event.clientY - pan.py,
          }))
        }}
        onPointerUp={() => {
          panRef.current = null
          setPanning(false)
        }}
        onWheel={(event) => {
          if (!(event.metaKey || event.ctrlKey)) return
          event.preventDefault()
          zoomFromCenter(event.deltaY > 0 ? 1 / 1.12 : 1.12)
        }}
      >
        <div
          className="absolute left-0 top-0 flex w-max items-start px-8 pb-16 pt-4"
          style={{
            transform: `translate(${view.x}px, ${view.y}px)`,
            gap: Math.max(48, 32 * view.zoom),
          }}
        >
          {editor.screens.map((screen) => {
            const focused = screen.id === editor.focus
            const artifact = currentArtifact(screen)
            const stale = editor.artifactStale(screen.id, ui.visualPreset)
            const generating = editor.generatingId === screen.id
            return (
              <div
                key={screen.id}
                className="flex items-start"
                style={{ gap: Math.max(20, 16 * view.zoom) }}
              >
                  <div style={{ width: GAME_UI_WIDTH * view.zoom }}>
                    <ArtboardChrome
                      width={GAME_UI_WIDTH * view.zoom}
                      leading={
                        <button
                          type="button"
                          onClick={() => editor.select(null, screen.id)}
                          className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden text-left"
                        >
                          <span className={`shrink-0 whitespace-nowrap text-[13px] ${focused ? 'font-semibold text-[var(--color-ink)]' : 'font-medium text-[var(--color-ink)]/50'}`}>
                            {screen.label}
                          </span>
                          <span className="min-w-0 truncate whitespace-nowrap text-[11px] text-[var(--color-ink)]/35">{screen.note}</span>
                          {screen.generated ? (
                            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#2f6bff]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#2f6bff]">
                              新增
                            </span>
                          ) : null}
                          {focused && editor.surface === 'css' ? (
                            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#d4ebff] px-1.5 py-0.5 text-[10px] font-semibold text-[#357ef8]">
                              编辑中
                            </span>
                          ) : null}
                          {stale ? (
                            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#c27a2d]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#c27a2d]">
                              标注已变
                            </span>
                          ) : null}
                        </button>
                      }
                      trailing={
                        <>
                          <div
                            className="relative"
                            ref={addingFor === screen.id ? addMenuRef : undefined}
                          >
                            <button
                              type="button"
                              aria-expanded={addingFor === screen.id}
                              onClick={(event) => {
                                event.stopPropagation()
                                setAddingFor((current) => (current === screen.id ? null : screen.id))
                              }}
                              className="flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--divider-soft)] bg-white px-2 text-[11px] text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]"
                            >
                              <Plus size={11} />
                              添加元素
                            </button>
                            {addingFor === screen.id ? (
                              <div className="absolute right-0 top-8 z-20 flex w-[168px] flex-col rounded-lg border border-[var(--divider-soft)] bg-white p-1 shadow-[0_8px_24px_rgba(16,18,24,0.14)]">
                                {ADD_KINDS.map((kind) => (
                                  <button
                                    key={kind}
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      editor.addNode(screen.id, kind)
                                      setAddingFor(null)
                                    }}
                                    className="flex h-7 items-center rounded-md px-2 text-left text-[11.5px] text-[var(--color-ink)]/75 hover:bg-[var(--fill-hover)]"
                                  >
                                    {GAME_UI_KIND_LABEL[kind]}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          {focused &&
                          editor.surface === 'css' &&
                          editor.selected?.screen === screen.id &&
                          editor.selectedId &&
                          !editor.selected.locked ? (
                            <button
                              type="button"
                              title="删除元素"
                              onClick={() => editor.deleteNode(editor.selectedId as string)}
                              className="flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--divider-soft)] bg-white px-2 text-[11px] text-[#c62828] hover:bg-[#c62828]/8"
                            >
                              <Trash2 size={11} />
                              删除
                            </button>
                          ) : null}
                          {screen.generated ? (
                            <button
                              type="button"
                              title="删除这一屏"
                              onClick={() => editor.deleteScreen(screen.id)}
                              className="grid size-6 shrink-0 place-items-center rounded-full text-[var(--color-ink)]/35 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75"
                            >
                              <Trash2 size={12} />
                            </button>
                          ) : null}
                        </>
                      }
                    />
                    <PhoneArtboard
                      zoom={view.zoom}
                      focused={focused && editor.surface === 'css'}
                      onPointerDown={() => editor.select(null, screen.id)}
                    >
                      <TowerDefenseUiScreen
                        screen={screen.id}
                        screenMeta={screen}
                        nodes={editor.nodes}
                        ui={{ ...ui, visualPreset: CSS_LAYOUT_PRESET }}
                        links={editor.links}
                        selectedId={focused ? editor.selectedId : null}
                        onSelect={(id) => editor.select(id, screen.id)}
                        onMoveStart={(id, x, y) => beginDrag('move', id, x, y)}
                      />
                    </PhoneArtboard>
                  </div>
                  {artifact && screen.artifact?.collapsed ? (
                    <button
                      type="button"
                      aria-expanded={false}
                      aria-label={`展开${screen.label}生成结果`}
                      onClick={() => {
                        editor.setArtifactCollapsed(screen.id, false)
                        editor.selectArtifact(screen.id)
                      }}
                      className="relative shrink-0 self-center overflow-hidden bg-black text-left shadow-[0_10px_28px_rgba(16,18,24,0.18)]"
                      style={{
                        width: 112,
                        borderRadius: (GAME_UI_CORNER_RADIUS * 112) / GAME_UI_WIDTH,
                      }}
                    >
                      <span
                        aria-hidden
                        className="absolute -right-2 top-3 h-[calc(100%-24px)] w-3 rounded-r-[10px] bg-[#2a2d33] shadow-[-4px_0_12px_rgba(16,18,24,0.18)]"
                      />
                      <img
                        src={artifact.src}
                        alt=""
                        className="relative z-10 block aspect-[390/853] w-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-2.5 pb-2.5 pt-8">
                        <span className="block text-[11px] font-semibold text-white">
                          {artifact.id.toUpperCase()}
                          {screenArtBackfilled(editor.nodes, screen.id) ? ' · 已回填' : ''}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-white/70">点击展开</span>
                      </span>
                    </button>
                  ) : artifact ? (
                    <div style={{ width: GAME_UI_WIDTH * view.zoom }}>
                      <ArtboardChrome
                        width={GAME_UI_WIDTH * view.zoom}
                        leading={
                          <>
                            {screen.artifact?.versions.map((item) => {
                              const current = screen.artifact?.versionId === item.id
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  aria-pressed={current}
                                  onClick={() => {
                                    if (current) editor.selectArtifact(screen.id)
                                    else editor.setArtifactVersion(screen.id, item.id)
                                  }}
                                  className={`h-6 shrink-0 whitespace-nowrap rounded-full px-2 text-[10px] font-semibold ${
                                    current && focused && editor.surface === 'artifact'
                                      ? 'bg-[#161823] text-white'
                                      : 'border border-[var(--color-ink)]/12 bg-white text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]'
                                  }`}
                                >
                                  {item.id.toUpperCase()}
                                </button>
                              )
                            })}
                          </>
                        }
                        trailing={
                          <button
                            type="button"
                            title="收起生成结果"
                            onClick={() => {
                              editor.setArtifactCollapsed(screen.id, true)
                              editor.select(null, screen.id)
                            }}
                            className="flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[var(--color-ink)]/12 bg-white px-2 text-[11px] text-[var(--color-ink)]/65 hover:bg-[var(--fill-hover)]"
                          >
                            <Minimize2 size={11} />
                            收起
                          </button>
                        }
                      />
                      <PhoneArtboard
                        zoom={view.zoom}
                        focused={focused && editor.surface === 'artifact'}
                        onPointerDown={() => editor.selectArtifact(screen.id)}
                      >
                        <div className="cursor-pointer">
                          <TowerDefenseArtifactFrame
                            screen={screen.id}
                            src={artifact.src}
                            stale={stale}
                            generating={generating}
                            nodes={editor.nodes}
                            slices={editor.slices.filter(
                              (item) =>
                                item.screenId === screen.id &&
                                item.versionId === screen.artifact?.versionId,
                            )}
                            selectedId={
                              focused && editor.surface === 'artifact' ? editor.selectedId : null
                            }
                            onSelect={(id) =>
                              id
                                ? editor.selectFromArtifact(id, screen.id)
                                : editor.selectArtifact(screen.id)
                            }
                            onSelectArtifact={() => editor.selectArtifact(screen.id)}
                          />
                        </div>
                      </PhoneArtboard>
                    </div>
                  ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {editor.selected && selectionBox ? (
        <div
          className="pointer-events-none absolute z-20"
          style={selectionBox}
        >
          <div className="absolute inset-0 border-[1.5px] border-[#2f6bff]" />
          {(['-left-[4px] -top-[4px]', '-right-[4px] -top-[4px]', '-left-[4px] -bottom-[4px]', '-right-[4px] -bottom-[4px]'] as const).map((pos) => (
            <div
              key={pos}
              className={`pointer-events-auto absolute size-2 rounded-[1px] border border-[#2f6bff] bg-white ${pos}`}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                beginDrag('resize', editor.selectedId!, event.clientX, event.clientY)
              }}
            />
          ))}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex flex-wrap items-center justify-center gap-2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[var(--divider-soft)] bg-white px-2 py-1 shadow-[0_2px_10px_rgba(16,18,24,0.12)]">
          <span className="px-1 text-[11px] text-[var(--color-ink)]/55">
            {editor.screens.length} 屏
          </span>
          {editor.pending ? (
            <button
              type="button"
              onClick={editor.discard}
              className="ml-1 flex h-5 items-center gap-1 border-l border-[var(--divider-soft)] pl-2 text-[11px] text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]"
            >
              <RotateCcw size={10} strokeWidth={1.8} />
              放弃
            </button>
          ) : null}
        </div>
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-[var(--divider-soft)] bg-white px-1 py-1 shadow-[0_2px_10px_rgba(16,18,24,0.12)]">
          <button type="button" disabled={!editor.canUndo} onClick={editor.undo} className="grid size-6 place-items-center rounded-full text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)] disabled:opacity-30">
            <Undo2 size={13} strokeWidth={1.8} />
          </button>
          <button type="button" disabled={!editor.canRedo} onClick={editor.redo} className="grid size-6 place-items-center rounded-full text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)] disabled:opacity-30">
            <Redo2 size={13} strokeWidth={1.8} />
          </button>
        </div>
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[var(--divider-soft)] bg-white px-2 py-1 text-[11px] text-[var(--color-ink)]/55 shadow-[0_2px_10px_rgba(16,18,24,0.12)]">
          <Move size={12} strokeWidth={1.8} />
          拖动改位置 · 回格删除 · ESC 退出
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-0.5 rounded-full border border-[var(--divider-soft)] bg-white px-1 py-1 shadow-[0_2px_8px_rgba(16,18,24,0.10)]">
        <button type="button" onClick={() => setView({ zoom: GAME_UI_FIT_ZOOM, x: 36, y: 24 })} className="grid size-6 place-items-center rounded-full text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)]">
          <Maximize2 size={12} strokeWidth={1.8} />
        </button>
        <button type="button" onClick={() => zoomFromCenter(1 / 1.2)} className="grid size-6 place-items-center rounded-full text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)]">
          <Minus size={13} />
        </button>
        <button type="button" onClick={() => zoomFromCenter(1 / view.zoom)} className="min-w-[42px] text-[11px] tabular-nums text-[var(--color-ink)]/70">
          {Math.round(view.zoom * 100)}%
        </button>
        <button type="button" onClick={() => zoomFromCenter(1.2)} className="grid size-6 place-items-center rounded-full text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)]">
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

export default TowerDefenseEditStage
