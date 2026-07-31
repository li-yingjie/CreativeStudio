import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Eye,
  Layers,
  Lock,
} from '@/shared/icons'
import { H5_LAYER_META, type H5ElementSel, type H5Selection } from './H5LayerEditPanel'
import { useH5CanvasStore } from './H5CanvasStore'
import type { H5CanvasLayerKind, H5CanvasNode } from './H5CanvasModel'

const CHILDREN_BY_KIND: Record<H5CanvasLayerKind, H5ElementSel[]> = {
  hero: [
    { layer: 'hero', id: 'hero.visual', kind: 'image', label: '头图.png', value: '/assets/acg-new-year/exact-hero-base.png' },
    { layer: 'hero', id: 'hero.statusbar', kind: 'image', label: '状态栏.png', value: '/assets/acg-new-year/exact-status-bar.png' },
    { layer: 'hero', id: 'hero.titlebar', kind: 'image', label: '标题栏.png', value: '/assets/acg-new-year/exact-title-bar.png' },
    { layer: 'hero', id: 'hero.back', kind: 'button', label: '返回热区', value: '返回' },
    { layer: 'hero', id: 'hero.share', kind: 'button', label: '分享热区', value: '分享' },
  ],
  countdown: [
    { layer: 'countdown', id: 'countdown.switcher', kind: 'image', label: '游戏会场.png', value: '/assets/acg-new-year/exact-game-switcher.png' },
    { layer: 'countdown', id: 'countdown.all', kind: 'button', label: '全部游戏', value: '全部游戏' },
  ],
  intro: [
    { layer: 'intro', id: 'intro.video', kind: 'image', label: '主会场视频.png', value: '/assets/acg-new-year/exact-main-video.png' },
    { layer: 'intro', id: 'intro.play', kind: 'button', label: '播放热区', value: '播放视频' },
    { layer: 'intro', id: 'intro.venue', kind: 'button', label: '会场入口', value: '去主会场' },
  ],
  lottery: [
    { layer: 'lottery', id: 'lottery.upper-image', kind: 'image', label: '榜单上半区.png', value: '/assets/acg-new-year/exact-lower-top.png' },
    { layer: 'lottery', id: 'lottery.lower-image', kind: 'image', label: '榜单下半区.png', value: '/assets/acg-new-year/exact-lower-bottom.png' },
    { layer: 'lottery', id: 'lottery.vote', kind: 'button', label: '好活加马', value: '好活加马' },
  ],
  rules: [
    { layer: 'rules', id: 'rules.all', kind: 'button', label: '查看全部', value: '查看全部作品' },
  ],
}

interface H5CanvasLayerTreeProps {
  selection: H5Selection | null
  onSelect: (selection: H5Selection | null) => void
}

export default function H5CanvasLayerTree({
  selection,
  onSelect,
}: H5CanvasLayerTreeProps) {
  const nodes = useH5CanvasStore((state) => state.nodes)
  const selectedNodeId = useH5CanvasStore((state) => state.selectedNodeId)
  const selectNode = useH5CanvasStore((state) => state.selectNode)
  const reorderNode = useH5CanvasStore((state) => state.reorderNode)
  const toggleNodeVisible = useH5CanvasStore((state) => state.toggleNodeVisible)
  const toggleNodeLocked = useH5CanvasStore((state) => state.toggleNodeLocked)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['page-1', ...nodes.map((node) => node.id)]),
  )

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectLayer = (node: H5CanvasNode) => {
    selectNode(node.id)
    onSelect({ type: 'layer', layer: node.kind })
  }

  const selectElement = (node: H5CanvasNode, element: H5ElementSel) => {
    selectNode(node.id)
    onSelect({ type: 'element', el: element })
  }

  const orderedNodes = [...nodes].sort((a, b) => b.zIndex - a.zIndex)

  return (
    <div
      id="h5-canvas-layers-panel"
      role="tabpanel"
      aria-labelledby="h5-canvas-layers-tab"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-3">
        <Layers size={14} strokeWidth={1.8} className="text-[var(--color-ink)]/55" />
        <span className="text-[12px] font-medium text-[var(--color-ink)]/75">页面图层</span>
        <span className="ml-auto text-[10.5px] tabular-nums text-[var(--color-ink)]/40">
          {nodes.length} 个对象
        </span>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto px-2 py-2" role="tree" aria-label="H5 页面图层树">
        <div role="treeitem" aria-expanded={expanded.has('page-1')}>
          <button
            type="button"
            onClick={() => toggleExpanded('page-1')}
            className="flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-left text-[12px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)]"
          >
            {expanded.has('page-1') ? (
              <ChevronDown size={13} strokeWidth={1.8} />
            ) : (
              <ChevronRight size={13} strokeWidth={1.8} />
            )}
            <Layers size={13} strokeWidth={1.8} />
            <span className="truncate">活动首页</span>
            <span className="ml-auto text-[10px] tabular-nums text-[var(--color-ink)]/35">
              375 × 1551
            </span>
          </button>

          {expanded.has('page-1') && (
            <div role="group" className="ml-3 border-l border-[var(--divider-soft)] pl-1.5">
              {orderedNodes.map((node) => {
                const meta = H5_LAYER_META[node.kind]
                const Icon = meta.icon
                const isSelected = selectedNodeId === node.id
                const isExpanded = expanded.has(node.id)
                const children = CHILDREN_BY_KIND[node.kind]
                return (
                  <div key={node.id} role="treeitem" aria-expanded={isExpanded}>
                    <div
                      data-selected={isSelected || undefined}
                      className="group flex min-h-8 items-center rounded-md text-[var(--color-ink)]/65 transition-colors hover:bg-[var(--fill-hover)] data-[selected]:bg-sky-50 data-[selected]:text-sky-700"
                    >
                      <button
                        type="button"
                        aria-label={`${isExpanded ? '收起' : '展开'}${node.name}`}
                        onClick={() => toggleExpanded(node.id)}
                        className="flex size-7 shrink-0 items-center justify-center rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown size={12} strokeWidth={1.8} />
                        ) : (
                          <ChevronRight size={12} strokeWidth={1.8} />
                        )}
                      </button>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => selectLayer(node)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left text-[11.5px]"
                      >
                        <Icon size={12} strokeWidth={1.8} className="shrink-0" />
                        <span className="truncate">{node.name}</span>
                      </button>
                      <div className="mr-1 flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <button
                          type="button"
                          aria-label={`${node.visible ? '隐藏' : '显示'}${node.name}`}
                          title={node.visible ? '隐藏图层' : '显示图层'}
                          onClick={() => toggleNodeVisible(node.id)}
                          className="flex size-6 items-center justify-center rounded hover:bg-[var(--color-ink)]/5"
                        >
                          <Eye
                            size={11}
                            strokeWidth={1.8}
                            className={node.visible ? '' : 'opacity-30'}
                          />
                        </button>
                        <button
                          type="button"
                          aria-label={`${node.locked ? '解锁' : '锁定'}${node.name}`}
                          title={node.locked ? '解锁图层' : '锁定图层'}
                          onClick={() => toggleNodeLocked(node.id)}
                          className="flex size-6 items-center justify-center rounded hover:bg-[var(--color-ink)]/5"
                        >
                          <Lock
                            size={11}
                            strokeWidth={1.8}
                            className={node.locked ? '' : 'opacity-30'}
                          />
                        </button>
                        <button
                          type="button"
                          aria-label={`上移${node.name}`}
                          title="上移一层"
                          onClick={() => reorderNode(node.id, 'forward')}
                          className="flex size-6 items-center justify-center rounded hover:bg-[var(--color-ink)]/5"
                        >
                          <ArrowUp size={11} strokeWidth={1.8} />
                        </button>
                        <button
                          type="button"
                          aria-label={`下移${node.name}`}
                          title="下移一层"
                          onClick={() => reorderNode(node.id, 'backward')}
                          className="flex size-6 items-center justify-center rounded hover:bg-[var(--color-ink)]/5"
                        >
                          <ArrowDown size={11} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div role="group" className="ml-7 border-l border-[var(--divider-soft)] pl-1">
                        {children.map((element) => {
                          const elementSelected =
                            isSelected &&
                            selection?.type === 'element' &&
                            selection.el.id === element.id
                          return (
                            <button
                              key={element.id}
                              type="button"
                              role="treeitem"
                              aria-selected={elementSelected}
                              onClick={() => selectElement(node, element)}
                              className="flex h-7 w-full items-center gap-1.5 rounded-md px-2 text-left text-[11px] text-[var(--color-ink)]/50 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/75 aria-selected:bg-sky-50 aria-selected:text-sky-700"
                            >
                              <span className="size-1 rounded-full bg-current opacity-50" />
                              <span className="truncate">{element.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <p className="border-t border-[var(--divider-soft)] px-3 py-2.5 text-pretty text-[10.5px] leading-4 text-[var(--color-ink)]/45">
        图层顺序与画布叠放同步；可隐藏、锁定或逐层调整。
      </p>
    </div>
  )
}
