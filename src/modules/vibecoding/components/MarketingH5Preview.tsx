import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import { Copy, Lock } from '@/shared/icons'
import type {
  H5ElementSel,
  H5LayerId,
  H5Selection,
} from './H5LayerEditPanel'
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

const ELEMENTS = {
  heroVisual: {
    layer: 'hero',
    id: 'hero.visual',
    kind: 'image',
    label: '头图.png',
    value: ASSETS.heroBase,
    prompt: '春节 ACG 主题活动头图，暖橙红跨次元场景、节日装置与轨道，多款游戏和二次元角色组成热闹群像，中心突出“2026 抖音 ACG 新春会”标题，竖版活动页顶部主视觉，高细节商业活动 KV。',
  },
  statusBar: {
    layer: 'hero',
    id: 'hero.statusbar',
    kind: 'image',
    label: '状态栏.png',
    value: ASSETS.statusBar,
    prompt: '透明背景的移动端系统状态栏，白色时间、网络与电量图标，适配红色新春活动背景，界面干净清晰，750px 宽 UI 切图。',
  },
  titleBar: {
    layer: 'hero',
    id: 'hero.titlebar',
    kind: 'image',
    label: '标题栏.png',
    value: ASSETS.titleBar,
    prompt: '抖音活动 H5 顶部标题栏，包含返回、活动标题与分享入口，白色图标和文字，透明背景，适配红金新春游戏主题，750px 宽 UI 切图。',
  },
  back: { layer: 'hero', id: 'hero.back', kind: 'button', label: '返回按钮', value: '返回' },
  share: { layer: 'hero', id: 'hero.share', kind: 'button', label: '分享按钮', value: '分享' },
  transition: {
    layer: 'hero',
    id: 'hero.transition',
    kind: 'image',
    label: '头图过渡.svg',
    value: ASSETS.heroTransition,
    prompt: '红金新春活动页面的头图过渡装饰，柔和弧形与云纹衔接主视觉和内容区，透明背景，矢量风格。',
  },
  wave: {
    layer: 'hero',
    id: 'hero.wave',
    kind: 'image',
    label: '波浪底纹.svg',
    value: ASSETS.wavePattern,
    prompt: '浅金色新春波浪连续底纹，细线矢量图案，低对比、可平铺、透明背景，用于游戏活动 H5 内容区装饰。',
  },
  switcher: {
    layer: 'countdown',
    id: 'countdown.switcher',
    kind: 'image',
    label: '游戏会场.png',
    value: ASSETS.gameSwitcher,
    prompt: '横向游戏会场切换组件，地下城与勇士、蛋仔派对、王者荣耀三张入口卡片，红金新春节庆边框，包含角色缩略图与全部游戏入口，透明背景，高细节 UI 切图。',
  },
  dnf: { layer: 'countdown', id: 'countdown.dnf', kind: 'card', label: '地下城与勇士卡片', value: '地下城与勇士' },
  eggParty: { layer: 'countdown', id: 'countdown.egg-party', kind: 'card', label: '蛋仔派对卡片', value: '蛋仔派对' },
  honorOfKings: { layer: 'countdown', id: 'countdown.honor-of-kings', kind: 'card', label: '王者荣耀卡片', value: '王者荣耀' },
  allGames: { layer: 'countdown', id: 'countdown.all', kind: 'button', label: '全部游戏按钮', value: '全部游戏' },
  video: {
    layer: 'intro',
    id: 'intro.video',
    kind: 'image',
    label: '主会场视频.png',
    value: ASSETS.mainVideo,
    prompt: '抖音 ACG 新春会主会场视频组件，梦幻游戏画面作为横版封面，叠加红金标题、播放按钮、推荐文案与静音入口，圆角卡片，明亮高饱和游戏宣传视觉。',
  },
  play: { layer: 'intro', id: 'intro.play', kind: 'button', label: '播放按钮', value: '播放主会场视频' },
  mute: { layer: 'intro', id: 'intro.mute', kind: 'button', label: '静音按钮', value: '切换静音' },
  venue: { layer: 'intro', id: 'intro.venue', kind: 'card', label: '主会场入口卡片', value: '去主会场' },
  lowerTop: {
    layer: 'lottery',
    id: 'lottery.upper-image',
    kind: 'image',
    label: '榜单上半区.png',
    value: ASSETS.lowerTop,
    prompt: '开年高燃作品榜单上半区，红金新春标题、游戏内容卡片、作者头像、作品封面与马力值，卡片排列整齐，暖黄色活动背景，竖版 H5 高细节 UI。',
  },
  lowerBottom: {
    layer: 'lottery',
    id: 'lottery.lower-image',
    kind: 'image',
    label: '榜单下半区.png',
    value: ASSETS.lowerBottom,
    prompt: '开年高燃作品榜单下半区，多张游戏内容作品卡连续排列，包含封面、创作者、马力值及“放你一马”“好活加马”双按钮，红金新春节庆 UI，高细节。',
  },
  lotteryTitle: { layer: 'lottery', id: 'lottery.title', kind: 'text', label: '开年高燃标题', value: '开年高燃' },
  viewAll: { layer: 'rules', id: 'rules.all', kind: 'button', label: '查看全部按钮', value: '查看全部作品' },
} satisfies Record<string, H5ElementSel>

const WORK_CARD_TITLES = [
  '地下城与勇士高燃作品',
  '蛋仔派对新春作品',
  '王者荣耀创意作品',
  '热门游戏高光作品',
  '新春会精选作品',
] as const

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
            <ExactImage src={ASSETS.heroBase} alt="2026 抖音 ACG 新春会主视觉" />
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
            <SelectableElement
              element={ELEMENTS.heroVisual}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-0 z-[10] size-full"
            />
            <SelectableElement
              element={ELEMENTS.statusBar}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-x-0 top-0 z-[20]"
              style={{ height: '18%' }}
            />
            <SelectableElement
              element={ELEMENTS.titleBar}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-x-0 top-[18%] z-[20]"
              style={{ height: '14.6667%' }}
            />
            <Hotspot
              label="返回"
              element={ELEMENTS.back}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[30]"
              style={{ left: '3.2%', top: '20%', width: '8.5334%', height: '10.6667%' }}
            />
            <Hotspot
              label="分享"
              element={ELEMENTS.share}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[30]"
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
          <SelectableElement
            element={ELEMENTS.transition}
            editing={editing}
            selected={selected}
            onSelect={onSelect}
            className="inset-x-0 z-[4]"
            style={{ top: '26.3701%', height: '5%' }}
          />
          <SelectableElement
            element={ELEMENTS.wave}
            editing={editing}
            selected={selected}
            onSelect={onSelect}
            className="z-[4]"
            style={{ left: '0.2008%', top: '19.9871%', width: '99.598%', height: '8%' }}
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
            <SelectableElement
              element={ELEMENTS.switcher}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-0 z-[10] size-full"
            />
            <Hotspot
              label="地下城与勇士"
              element={ELEMENTS.dnf}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[20]"
              style={{ left: 0, top: 0, width: '31.6076%', height: '88.3978%' }}
            />
            <Hotspot
              label="蛋仔派对"
              element={ELEMENTS.eggParty}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[20]"
              style={{ left: '33.2425%', top: '4.4199%', width: '29.4278%', height: '79.558%' }}
            />
            <Hotspot
              label="王者荣耀"
              element={ELEMENTS.honorOfKings}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[20]"
              style={{ left: '65.3951%', top: '4.4199%', width: '27.1117%', height: '79.558%' }}
            />
            <Hotspot
              label="全部游戏"
              element={ELEMENTS.allGames}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[20]"
              style={{ right: 0, top: 0, width: '8.7193%', height: '88.3978%' }}
            />
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
            <SelectableElement
              element={ELEMENTS.lowerTop}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-x-0 top-0 z-[5]"
              style={{ height: '50%' }}
            />
            <SelectableElement
              element={ELEMENTS.lowerBottom}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-x-0 bottom-0 z-[5]"
              style={{ height: '50%' }}
            />
            <SelectableElement
              element={ELEMENTS.lotteryTitle}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[15]"
              style={{ left: '22%', top: '1.5%', width: '56%', height: '6%' }}
            />
            {CARD_TOPS.flatMap((cardTop, index) => {
              const card: H5ElementSel = {
                layer: 'lottery',
                id: `lottery.card-${index + 1}`,
                kind: 'card',
                label: `作品卡片 ${index + 1}`,
                value: WORK_CARD_TITLES[index],
              }
              const minus: H5ElementSel = {
                layer: 'lottery',
                id: `lottery.card-${index + 1}.minus`,
                kind: 'button',
                label: `卡片 ${index + 1}·放你一马`,
                value: '放你一马',
              }
              const plus: H5ElementSel = {
                layer: 'lottery',
                id: `lottery.card-${index + 1}.plus`,
                kind: 'button',
                label: `卡片 ${index + 1}·好活加马`,
                value: '好活加马',
              }
              return [
                <SelectableElement
                  key={`card-${cardTop}`}
                  element={card}
                  editing={editing}
                  selected={selected}
                  onSelect={onSelect}
                  className="z-[10]"
                  style={{
                    left: '3.7333%',
                    top: `${(cardTop / 1970) * 100}%`,
                    width: '92.5334%',
                    height: `${(304 / 1970) * 100}%`,
                  }}
                />,
                <Hotspot
                  key={`minus-${cardTop}`}
                  label={`第 ${index + 1} 个作品：放你一马`}
                  element={minus}
                  editing={editing}
                  selected={selected}
                  onSelect={onSelect}
                  className="z-[20]"
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
                  element={plus}
                  editing={editing}
                  selected={selected}
                  onSelect={onSelect}
                  className="z-[20]"
                  style={{
                    left: '64.2667%',
                    top: `${((cardTop + 216) / 1970) * 100}%`,
                    width: '28.2667%',
                    height: `${(72 / 1970) * 100}%`,
                  }}
                />,
              ]
            })}
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
            <SelectableElement
              element={ELEMENTS.video}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-0 z-[10] size-full"
            />
            <Hotspot
              label="播放主会场视频"
              element={ELEMENTS.play}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[20]"
              style={{ left: '44.3182%', top: '32.9854%', width: '11.3637%', height: '16.7015%' }}
            />
            <Hotspot
              label="切换静音"
              element={ELEMENTS.mute}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="z-[20]"
              style={{ left: '89.4887%', top: '67.2234%', width: '7.9546%', height: '11.6911%' }}
            />
            <div
              className="absolute z-[20]"
              style={{ left: '78.6932%', top: '91.858%', width: '24.4319%' }}
            >
              <ExactImage src={ASSETS.venueEntry} alt="新春会主会场入口" />
              <Hotspot
                label="去主会场"
                element={ELEMENTS.venue}
                editing={editing}
                selected={selected}
                onSelect={onSelect}
                className="inset-0 z-[1] size-full"
              />
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
            <Hotspot
              label="查看全部作品"
              element={ELEMENTS.viewAll}
              editing={editing}
              selected={selected}
              onSelect={onSelect}
              className="inset-0 z-[20] size-full"
            />
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
        <ExactImage src={ASSETS.heroBase} alt="2026 抖音 ACG 新春会主视觉" />
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
  element,
  editing = false,
  selected = null,
  onSelect,
  className = '',
  style,
  interactive = true,
}: {
  label: string
  element?: H5ElementSel
  editing?: boolean
  selected?: H5Selection | null
  onSelect?: (selection: H5Selection | null) => void
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

  const active =
    editing &&
    element !== undefined &&
    selected?.type === 'element' &&
    selected.el.id === element.id

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={
        element
          ? (event) => {
              event.stopPropagation()
              onSelect?.({ type: 'element', el: element })
            }
          : undefined
      }
      className={`absolute cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white ${
        active ? 'ring-2 ring-inset ring-[#7c5cff]' : editing && element ? 'hover:ring-1 hover:ring-inset hover:ring-[#7c5cff]/70' : ''
      } ${className}`}
      style={style}
    >
      {active && (
        <span className="pointer-events-none absolute left-0 top-0 z-40 max-w-full truncate rounded-br bg-[#7c5cff] px-1.5 py-0.5 text-[9px] font-medium leading-none text-white">
          {element.label}
        </span>
      )}
    </button>
  )
}

function SelectableElement({
  element,
  editing,
  selected,
  onSelect,
  className = '',
  style,
}: {
  element: H5ElementSel
  editing: boolean
  selected: H5Selection | null
  onSelect?: (selection: H5Selection | null) => void
  className?: string
  style?: CSSProperties
}) {
  if (!editing) {
    return (
      <span
        aria-hidden
        className={`pointer-events-none absolute border-0 bg-transparent p-0 ${className}`}
        style={style}
      />
    )
  }

  const active =
    selected?.type === 'element' &&
    selected.el.id === element.id

  return (
    <button
      type="button"
      aria-label={`选择${element.label}`}
      aria-pressed={active || undefined}
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.({ type: 'element', el: element })
      }}
      className={`pointer-events-auto absolute cursor-pointer border-0 bg-transparent p-0 hover:ring-1 hover:ring-inset hover:ring-[#7c5cff]/70 ${active ? 'ring-2 ring-inset ring-[#7c5cff]' : ''} ${className}`}
      style={style}
    >
      {active && (
        <span className="pointer-events-none absolute left-0 top-0 z-40 max-w-full truncate rounded-br bg-[#7c5cff] px-1.5 py-0.5 text-[9px] font-medium leading-none text-white">
          {element.label}
        </span>
      )}
    </button>
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
  if (!editing) {
    return (
      <div className={`absolute ${className}`} style={style}>
        {children}
      </div>
    )
  }

  const active = editing && selected?.type === 'layer' && selected.layer === id
  const containsActiveElement =
    editing && selected?.type === 'element' && selected.el.layer === id

  return (
    <div
      data-h5-active={active || undefined}
      className={`absolute ${editing ? 'cursor-pointer' : ''} ${
        active
          ? 'ring-2 ring-inset ring-[#7c5cff]'
          : containsActiveElement
            ? 'ring-1 ring-inset ring-[#7c5cff]/45'
            : editing
              ? 'hover:ring-1 hover:ring-inset hover:ring-[#7c5cff]/45'
              : ''
      } ${className}`}
      style={style}
      onClick={
        (event) => {
          event.stopPropagation()
          onSelect?.({ type: 'layer', layer: id })
        }
      }
    >
      {children}
      {editing && (
        <button
          type="button"
          aria-label={`选择${label}组件`}
          aria-pressed={active}
          onClick={(event) => {
            event.stopPropagation()
            onSelect?.({ type: 'layer', layer: id })
          }}
          className={`absolute left-1 top-1 z-[60] rounded px-1.5 py-0.5 text-[9px] font-medium leading-none text-white transition-opacity ${
            active
              ? 'bg-[#7c5cff]'
              : 'bg-[#272b36]/75 opacity-65 hover:bg-[#7c5cff] hover:opacity-100'
          }`}
        >
          组件 · {label}
        </button>
      )}
    </div>
  )
}
