import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import { Copy, Lock } from '@/shared/icons'
import type { H5LayerId, H5Selection } from './H5LayerEditPanel'
import type { H5CanvasNode } from './H5CanvasModel'
import type { MarketingH5PreviewConfig } from './MarketingH5ConfigData'

const ASSET_ROOT = '/assets/acg-new-year'

const ASSETS = {
  heroBase: `${ASSET_ROOT}/exact-hero-base.png`,
  heroTransition: `${ASSET_ROOT}/exact-hero-transition.svg`,
  wavePattern: `${ASSET_ROOT}/exact-wave-pattern.svg`,
  statusBar: `${ASSET_ROOT}/exact-status-bar.png`,
  titleBar: `${ASSET_ROOT}/exact-title-bar.png`,
  gameSwitcher: `${ASSET_ROOT}/exact-game-switcher.png`,
  mainVideo: `${ASSET_ROOT}/exact-main-video.png`,
  venueEntry: `${ASSET_ROOT}/exact-venue-entry.png`,
  lowerTop: `${ASSET_ROOT}/exact-lower-top.png`,
  lowerBottom: `${ASSET_ROOT}/exact-lower-bottom.png`,
} as const

const CARD_TOPS = [162, 498, 834, 1170, 1506] as const

interface PreviewProps {
  preview?: MarketingH5PreviewConfig
  editing?: boolean
  selected?: H5Selection | null
  onSelect?: (selection: H5Selection | null) => void
  canvasNodes?: H5CanvasNode[]
  selectedCanvasNodeId?: string | null
  onCanvasNodePointerDown?: (
    event: ReactPointerEvent<HTMLElement>,
    node: H5CanvasNode,
    duplicate: boolean,
  ) => void
}

export default function MarketingH5Preview({
  preview,
  editing = false,
  selected = null,
  onSelect,
  canvasNodes,
  selectedCanvasNodeId = null,
  onCanvasNodePointerDown,
}: PreviewProps = {}) {
  // This campaign uses exact Figma node renders so its non-system fonts,
  // illustration crops, masks, and gradients stay identical to the source.
  void preview

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-[#fdf0c3]"
      style={canvasNodes ? { overflow: 'visible' } : undefined}
      onPointerDown={canvasNodes ? () => onSelect?.(null) : undefined}
    >
      <main
        className="thin-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#fdf0c3]"
        style={canvasNodes ? { overflow: 'visible' } : undefined}
        onClick={editing ? () => onSelect?.(null) : undefined}
      >
        <div
          className="relative mx-auto w-full max-w-[750px] overflow-hidden bg-[#fdf0c3]"
          style={{
            aspectRatio: '375 / 1551',
            overflow: canvasNodes ? 'visible' : undefined,
          }}
        >
          {canvasNodes ? (
            <CanvasScene
              nodes={canvasNodes}
              selectedNodeId={selectedCanvasNodeId}
              onPointerDown={onCanvasNodePointerDown}
            />
          ) : (
            <>
          <SelectableLayer
            id="hero"
            label="头图"
            editing={editing}
            selected={selected}
            onSelect={onSelect}
            className="z-[1]"
            style={{ left: 0, top: 0, width: '100%', height: '19.3424%' }}
          >
            <ExactImage src={ASSETS.heroBase} alt="抖音 ACG 游戏新春会主视觉" />
            <ExactImage
              src={ASSETS.statusBar}
              alt=""
              className="absolute inset-x-0 top-0"
            />
            <ExactImage
              src={ASSETS.titleBar}
              alt=""
              className="absolute inset-x-0 top-[18%]"
            />
            <Hotspot
              label="返回"
              style={{ left: '3.2%', top: '20%', width: '8.5334%', height: '10.6667%' }}
            />
            <Hotspot
              label="分享"
              style={{ left: '88.2667%', top: '20%', width: '8.5334%', height: '10.6667%' }}
            />
          </SelectableLayer>

          <ExactImage
            src={ASSETS.heroTransition}
            alt=""
            className="absolute inset-x-0 z-[2]"
            style={{ top: '26.3701%' }}
          />
          <ExactImage
            src={ASSETS.wavePattern}
            alt=""
            className="absolute z-[2]"
            style={{ left: '0.2008%', top: '19.9871%', width: '99.598%' }}
          />

          <SelectableLayer
            id="countdown"
            label="游戏会场"
            editing={editing}
            selected={selected}
            onSelect={onSelect}
            className="z-[5]"
            style={{ left: '2.1333%', top: '14.3778%', width: '97.8667%' }}
          >
            <ExactImage
              src={ASSETS.gameSwitcher}
              alt="地下城与勇士、蛋仔派对、王者荣耀游戏会场切换"
            />
            <Hotspot label="地下城与勇士" style={{ left: 0, top: 0, width: '31.6076%', height: '88.3978%' }} />
            <Hotspot label="蛋仔派对" style={{ left: '33.2425%', top: '4.4199%', width: '29.4278%', height: '79.558%' }} />
            <Hotspot label="王者荣耀" style={{ left: '65.3951%', top: '4.4199%', width: '27.1117%', height: '79.558%' }} />
            <Hotspot label="全部游戏" style={{ right: 0, top: 0, width: '8.7193%', height: '88.3978%' }} />
          </SelectableLayer>

          <SelectableLayer
            id="lottery"
            label="开年高燃"
            editing={editing}
            selected={selected}
            onSelect={onSelect}
            className="z-[3]"
            style={{ left: 0, top: '36.4926%', width: '100%' }}
          >
            <ExactImage src={ASSETS.lowerTop} alt="开年高燃作品榜单" />
            <ExactImage src={ASSETS.lowerBottom} alt="" />
            {CARD_TOPS.flatMap((cardTop, index) => [
              <Hotspot
                key={`minus-${cardTop}`}
                label={`第 ${index + 1} 个作品：放你一马`}
                style={{
                  left: '37.0667%',
                  top: `${((cardTop + 216) / 1970) * 100}%`,
                  width: '28.2667%',
                  height: `${(72 / 1970) * 100}%`,
                }}
              />,
              <Hotspot
                key={`plus-${cardTop}`}
                label={`第 ${index + 1} 个作品：好活加马`}
                style={{
                  left: '64.2667%',
                  top: `${((cardTop + 216) / 1970) * 100}%`,
                  width: '28.2667%',
                  height: `${(72 / 1970) * 100}%`,
                }}
              />,
            ])}
          </SelectableLayer>

          <SelectableLayer
            id="intro"
            label="主会场视频"
            editing={editing}
            selected={selected}
            onSelect={onSelect}
            className="z-[6] overflow-visible"
            style={{ left: '3.2%', top: '20.5674%', width: '93.8667%' }}
          >
            <ExactImage
              src={ASSETS.mainVideo}
              alt="新春会主会场视频与高燃视觉文案"
            />
            <Hotspot
              label="播放主会场视频"
              style={{ left: '44.3182%', top: '32.9854%', width: '11.3637%', height: '16.7015%' }}
            />
            <Hotspot
              label="切换静音"
              style={{ left: '89.4887%', top: '67.2234%', width: '7.9546%', height: '11.6911%' }}
            />
            <div
              className="absolute z-[2]"
              style={{ left: '78.6932%', top: '91.858%', width: '24.4319%' }}
            >
              <ExactImage src={ASSETS.venueEntry} alt="新春会主会场入口" />
              <Hotspot label="去主会场" className="inset-0 size-full" />
            </div>
          </SelectableLayer>

          <SelectableLayer
            id="rules"
            label="查看全部"
            editing={editing}
            selected={selected}
            onSelect={onSelect}
            className="z-[8]"
            style={{
              left: '4.2667%',
              top: '95.9994%',
              width: '91.4667%',
              height: '2.579%',
            }}
          >
            <Hotspot label="查看全部作品" className="inset-0 size-full" />
          </SelectableLayer>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function CanvasScene({
  nodes,
  selectedNodeId,
  onPointerDown,
}: {
  nodes: H5CanvasNode[]
  selectedNodeId: string | null
  onPointerDown?: (
    event: ReactPointerEvent<HTMLElement>,
    node: H5CanvasNode,
    duplicate: boolean,
  ) => void
}) {
  return (
    <>
      <ExactImage
        src={ASSETS.heroTransition}
        alt=""
        className="absolute inset-x-0"
        style={{ top: '26.3701%', zIndex: 22 }}
      />
      <ExactImage
        src={ASSETS.wavePattern}
        alt=""
        className="absolute"
        style={{ left: '0.2008%', top: '19.9871%', width: '99.598%', zIndex: 22 }}
      />
      {[...nodes]
        .sort((a, b) => a.zIndex - b.zIndex)
        .filter((node) => node.visible)
        .map((node) => (
          <CanvasLayer
            key={node.id}
            node={node}
            active={selectedNodeId === node.id}
            onPointerDown={onPointerDown}
          />
        ))}
    </>
  )
}

function CanvasLayer({
  node,
  active,
  onPointerDown,
}: {
  node: H5CanvasNode
  active: boolean
  onPointerDown?: (
    event: ReactPointerEvent<HTMLElement>,
    node: H5CanvasNode,
    duplicate: boolean,
  ) => void
}) {
  return (
    <div
      data-h5-canvas-node={node.id}
      data-h5-active={active || undefined}
      data-h5-locked={node.locked || undefined}
      className="absolute touch-none select-none data-[h5-active]:ring-2 data-[h5-active]:ring-inset data-[h5-active]:ring-sky-500 data-[h5-locked]:cursor-not-allowed"
      style={{
        width: node.width,
        height: node.height,
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        zIndex: node.zIndex * 10,
        cursor: node.locked ? 'not-allowed' : 'move',
      }}
      onPointerDown={(event) => onPointerDown?.(event, node, false)}
    >
      <LayerVisual kind={node.kind} />
      {active && (
        <>
          <span className="pointer-events-none absolute -top-5 left-0 z-40 flex h-5 items-center gap-1 rounded-t bg-sky-500 px-1.5 text-[9px] font-medium leading-none text-white">
            {node.locked && <Lock size={9} strokeWidth={2} />}
            {node.name}
          </span>
          {!node.locked && (
            <button
              type="button"
              aria-label={`拖拽复制${node.name}`}
              title="拖拽生成副本"
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onPointerDown?.(event, node, true)
              }}
              className="absolute -right-6 -top-1 z-40 flex size-5 items-center justify-center rounded bg-sky-500 text-white shadow-sm hover:bg-sky-600"
            >
              <Copy size={10} strokeWidth={2} />
            </button>
          )}
        </>
      )}
    </div>
  )
}

function LayerVisual({ kind }: { kind: H5CanvasNode['kind'] }) {
  if (kind === 'hero') {
    return (
      <>
        <ExactImage src={ASSETS.heroBase} alt="抖音 ACG 游戏新春会主视觉" />
        <ExactImage src={ASSETS.statusBar} alt="" className="absolute inset-x-0 top-0" />
        <ExactImage src={ASSETS.titleBar} alt="" className="absolute inset-x-0 top-[18%]" />
        <Hotspot
          interactive={false}
          label="返回"
          style={{ left: '3.2%', top: '20%', width: '8.5334%', height: '10.6667%' }}
        />
        <Hotspot
          interactive={false}
          label="分享"
          style={{ left: '88.2667%', top: '20%', width: '8.5334%', height: '10.6667%' }}
        />
      </>
    )
  }

  if (kind === 'countdown') {
    return (
      <>
        <ExactImage
          src={ASSETS.gameSwitcher}
          alt="地下城与勇士、蛋仔派对、王者荣耀游戏会场切换"
        />
        <Hotspot interactive={false} label="地下城与勇士" style={{ left: 0, top: 0, width: '31.6076%', height: '88.3978%' }} />
        <Hotspot interactive={false} label="蛋仔派对" style={{ left: '33.2425%', top: '4.4199%', width: '29.4278%', height: '79.558%' }} />
        <Hotspot interactive={false} label="王者荣耀" style={{ left: '65.3951%', top: '4.4199%', width: '27.1117%', height: '79.558%' }} />
        <Hotspot interactive={false} label="全部游戏" style={{ right: 0, top: 0, width: '8.7193%', height: '88.3978%' }} />
      </>
    )
  }

  if (kind === 'intro') {
    return (
      <>
        <ExactImage src={ASSETS.mainVideo} alt="新春会主会场视频与高燃视觉文案" />
        <Hotspot
          interactive={false}
          label="播放主会场视频"
          style={{ left: '44.3182%', top: '32.9854%', width: '11.3637%', height: '16.7015%' }}
        />
        <Hotspot
          interactive={false}
          label="切换静音"
          style={{ left: '89.4887%', top: '67.2234%', width: '7.9546%', height: '11.6911%' }}
        />
        <div
          className="absolute z-[2]"
          style={{ left: '78.6932%', top: '91.858%', width: '24.4319%' }}
        >
          <ExactImage src={ASSETS.venueEntry} alt="新春会主会场入口" />
          <Hotspot interactive={false} label="去主会场" className="inset-0 size-full" />
        </div>
      </>
    )
  }

  if (kind === 'lottery') {
    return (
      <>
        <ExactImage src={ASSETS.lowerTop} alt="开年高燃作品榜单" />
        <ExactImage src={ASSETS.lowerBottom} alt="" />
        {CARD_TOPS.flatMap((cardTop, index) => [
          <Hotspot
            key={`canvas-minus-${cardTop}`}
            interactive={false}
            label={`第 ${index + 1} 个作品：放你一马`}
            style={{
              left: '37.0667%',
              top: `${((cardTop + 216) / 1970) * 100}%`,
              width: '28.2667%',
              height: `${(72 / 1970) * 100}%`,
            }}
          />,
          <Hotspot
            key={`canvas-plus-${cardTop}`}
            interactive={false}
            label={`第 ${index + 1} 个作品：好活加马`}
            style={{
              left: '64.2667%',
              top: `${((cardTop + 216) / 1970) * 100}%`,
              width: '28.2667%',
              height: `${(72 / 1970) * 100}%`,
            }}
          />,
        ])}
      </>
    )
  }

  return (
    <Hotspot
      interactive={false}
      label="查看全部作品"
      className="inset-0 size-full"
    />
  )
}

function ExactImage({
  src,
  alt,
  className = '',
  style,
}: {
  src: string
  alt: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`pointer-events-none block h-auto w-full select-none ${className}`}
      style={style}
    />
  )
}

function Hotspot({
  label,
  className = '',
  style,
  interactive = true,
}: {
  label: string
  className?: string
  style?: CSSProperties
  interactive?: boolean
}) {
  if (!interactive) {
    return (
      <span
        aria-hidden
        className={`pointer-events-none absolute border-0 bg-transparent p-0 ${className}`}
        style={style}
      />
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={`absolute cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${className}`}
      style={style}
    />
  )
}

function SelectableLayer({
  id,
  label,
  editing,
  selected,
  onSelect,
  className = '',
  style,
  children,
}: {
  id: H5LayerId
  label: string
  editing: boolean
  selected: H5Selection | null
  onSelect?: (selection: H5Selection | null) => void
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const active = editing && selected?.type === 'layer' && selected.layer === id

  return (
    <div
      data-h5-active={active || undefined}
      className={`absolute ${editing ? 'cursor-pointer' : ''} ${
        active ? 'ring-2 ring-inset ring-[#7c5cff]' : ''
      } ${className}`}
      style={style}
      onClick={
        editing
          ? (event) => {
              event.stopPropagation()
              onSelect?.({ type: 'layer', layer: id })
            }
          : undefined
      }
    >
      {children}
      {active && (
        <span className="pointer-events-none absolute left-2 top-1 z-40 rounded bg-[#7c5cff] px-1.5 py-0.5 text-[9px] font-medium leading-none text-white">
          {label}
        </span>
      )}
    </div>
  )
}
