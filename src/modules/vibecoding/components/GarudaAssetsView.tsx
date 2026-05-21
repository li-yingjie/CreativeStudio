import { useEffect, useRef, useState } from 'react'
import { Music2, Image as ImageIcon, Film, ArrowLeft } from '@/shared/icons'

/**
 * Garuda 资产视图
 *
 * 直接从 /public/garuda/assets/ 读图，分组展示主角 / 敌人 / 道具 /
 * UI / 音效。点击缩略图打开放大预览。音效 / 视频 / 长帧序列只显示一个
 * 代表 + 帧数标签，避免一次性渲染数百张 webp。
 */

type AssetKind = 'image' | 'audio' | 'video'

interface AssetItem {
  src: string
  label: string
  /** Frame count for animation folders — shown as a badge. */
  frames?: number
  kind?: AssetKind
}

interface AssetGroup {
  title: string
  desc?: string
  items: AssetItem[]
}

const GROUPS: AssetGroup[] = [
  {
    title: '主角 · Garuda',
    desc: 'NanoBanana 单帧 + Seedance 2 帧动画',
    items: [
      { src: '/garuda/assets/garuda_fly-webp/garuda_fly_00.webp', label: 'fly', frames: 50 },
      { src: '/garuda/assets/garuda_shield-webp/garuda_shield_000.webp', label: 'shield', frames: 101 },
      { src: '/garuda/assets/garuda_bomb-webp/garuda_bomb_000.webp', label: 'bomb', frames: 152 },
      { src: '/garuda/assets/garuda_special-webp/garuda_special_000.webp', label: 'special', frames: 202 },
      { src: '/garuda/assets/garuda_killer_video-webp/garuda_special_video_000.webp', label: 'killer', frames: 80 },
      { src: '/garuda/assets/garuda_killermove.webp', label: 'killermove' },
      { src: '/garuda/assets/garuda_shell_gif-webp/garuda_shell_gif_00.webp', label: 'shell', frames: 31 },
      { src: '/garuda/assets/garuda_bullet.png', label: 'bullet' },
    ],
  },
  {
    title: '敌人 · Enemies',
    desc: '5 种基础敌型 + boss 帧动画',
    items: [
      { src: '/garuda/assets/enemy/enemy_0.png', label: 'enemy_0' },
      { src: '/garuda/assets/enemy/enemy_1-webp/enemy_1_00.webp', label: 'enemy_1', frames: 24 },
      { src: '/garuda/assets/enemy/enemy_2.png', label: 'enemy_2' },
      { src: '/garuda/assets/enemy/enemy_3.webp', label: 'enemy_3' },
      { src: '/garuda/assets/enemy/enemy_4.webp', label: 'enemy_4' },
      { src: '/garuda/assets/enemy/enemy_boss-webp/enemy_boss_00.webp', label: 'boss', frames: 60 },
      { src: '/garuda/assets/enemy_RapidFire.webp', label: 'RapidFire' },
      { src: '/garuda/assets/enemy_Shield Generator.webp', label: 'Shield Gen' },
      { src: '/garuda/assets/enemy_Physical Armor.webp', label: 'Phys Armor' },
      { src: '/garuda/assets/enemy_Energy Resist.webp', label: 'Energy Res' },
      { src: '/garuda/assets/enemy_Vitality.webp', label: 'Vitality' },
      { src: '/garuda/assets/enemy/enemy_bullet.png', label: 'bullet' },
    ],
  },
  {
    title: '道具 · Items',
    items: [
      { src: '/garuda/assets/item_blood.png', label: '回血' },
      { src: '/garuda/assets/item_bomb.png', label: '炸弹' },
      { src: '/garuda/assets/item_enegy.png', label: '能量' },
      { src: '/garuda/assets/item_laser.png', label: '激光' },
      { src: '/garuda/assets/item_shell.png', label: '护盾' },
      { src: '/garuda/assets/item_speed.png', label: '加速' },
      { src: '/garuda/assets/item_Self-Destruct.webp', label: '自爆' },
      { src: '/garuda/assets/coin.png', label: 'coin' },
    ],
  },
  {
    title: '场景 · UI / FX',
    items: [
      { src: '/garuda/assets/background.jpg', label: 'background' },
      { src: '/garuda/assets/Start.jpg', label: 'Start' },
      { src: '/garuda/assets/logo.jpg', label: 'logo' },
      { src: '/garuda/assets/mission_start.webp', label: 'mission_start' },
      { src: '/garuda/assets/button_start.png', label: 'btn start' },
      { src: '/garuda/assets/button_rank.png', label: 'btn rank' },
      { src: '/garuda/assets/killer.png', label: 'killer' },
      { src: '/garuda/assets/killer_R.png', label: 'killer_R' },
      { src: '/garuda/assets/explosion_clean_0.png', label: 'explosion' },
      { src: '/garuda/assets/blood_full.png', label: 'blood' },
      { src: '/garuda/assets/shield_full.png', label: 'shield' },
      { src: '/garuda/assets/special_full.png', label: 'special' },
    ],
  },
  {
    title: '音频 · Audio',
    items: [
      { src: '/garuda/assets/bgm.mp3', label: 'bgm.mp3', kind: 'audio' },
      { src: '/garuda/assets/trans.mp3', label: 'trans.mp3', kind: 'audio' },
      { src: '/garuda/assets/killer.mp3', label: 'killer.mp3', kind: 'audio' },
      { src: '/garuda/assets/laser.wav', label: 'laser.wav', kind: 'audio' },
      { src: '/garuda/assets/explosion_.wav', label: 'explosion_.wav', kind: 'audio' },
      { src: '/garuda/assets/sfx_bomb_blast.wav', label: 'sfx_bomb_blast.wav', kind: 'audio' },
      { src: '/garuda/assets/sfx_explosion_big.wav', label: 'sfx_explosion_big.wav', kind: 'audio' },
      { src: '/garuda/assets/sfx_explosion_small.wav', label: 'sfx_explosion_small.wav', kind: 'audio' },
      { src: '/garuda/assets/sfx_shield_on.wav', label: 'sfx_shield_on.wav', kind: 'audio' },
    ],
  },
  {
    title: '视频 · Cinematics',
    items: [
      { src: '/garuda/assets/garuda_menu.mp4', label: 'garuda_menu.mp4', kind: 'video' },
      { src: '/garuda/assets/start_anime_compressed.mp4', label: 'start_anime.mp4', kind: 'video' },
    ],
  },
]

export type { AssetGroup, AssetItem, AssetKind }

interface GarudaAssetsViewProps {
  /** Group/items to render. Defaults to the Garuda game's GROUPS so
   *  existing call sites stay unchanged; pass a project-specific list
   *  (e.g. H5 活动素材) to reuse the same layout for other surfaces. */
  groups?: AssetGroup[]
  /** Controlled active kind. When provided, the component renders no
   *  internal kind tab-bar — the parent (toolbar) owns the 图像/音频/视频
   *  switcher and feeds the selection down. */
  activeKind?: AssetKind
  onKindChange?: (k: AssetKind) => void
  /** Controlled selected asset (the one opened on the canvas). When
   *  `onSelectAsset` is provided the parent owns the selection so its
   *  toolbar / edit panel can bind to the specific asset object. */
  selectedAsset?: AssetItem | null
  onSelectAsset?: (a: AssetItem | null) => void
}

/** Derive frame-N's path from the frame-0 src by re-padding the trailing
 *  number, e.g. `..._00.webp` + 7 → `..._07.webp`. */
function framePath(src: string, i: number): string {
  const m = src.match(/^(.*?)(\d+)(\.[a-z0-9]+)$/i)
  if (!m) return src
  const [, prefix, num, ext] = m
  return `${prefix}${String(i).padStart(num.length, '0')}${ext}`
}

/** An <img> that, when `playing` and the item is a frame sequence, loops
 *  through its frames (~15fps). Otherwise shows the static frame-0 src.
 *  Shared by the grid thumb (hover) and the canvas (always playing). */
function FrameImage({
  item,
  playing,
  className,
}: {
  item: AssetItem
  playing: boolean
  className?: string
}) {
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!playing || !item.frames || (item.kind ?? 'image') !== 'image') {
      el.src = item.src
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % item.frames!
      el.src = framePath(item.src, i)
    }, 1000 / 15)
    return () => {
      clearInterval(id)
      if (ref.current) ref.current.src = item.src
    }
  }, [playing, item])
  return <img ref={ref} src={item.src} alt={item.label} loading="lazy" className={className} />
}

/** Which asset kinds the groups actually contain (image/audio/video),
 *  preserving display order. Used by the parent toolbar to build the
 *  kind tabs without re-deriving GROUPS. */
export function garudaKindTabs(groups: AssetGroup[] = GROUPS): AssetKind[] {
  const counts = { image: 0, audio: 0, video: 0 } as Record<AssetKind, number>
  groups.forEach((g) => g.items.forEach((it) => { counts[it.kind ?? 'image'] += 1 }))
  return (['image', 'audio', 'video'] as AssetKind[]).filter((k) => counts[k] > 0)
}

/** Flat list of every image-kind asset across the groups — used by the
 *  canvas editor to lay all images out on a single draggable board. */
export function garudaImageAssets(groups: AssetGroup[] = GROUPS): AssetItem[] {
  return groups.flatMap((g) => g.items.filter((it) => (it.kind ?? 'image') === 'image'))
}

/** Aggregate per-kind / frame counts across the provided groups. When
 *  no category is passed (or `null`), totals span every group; passing
 *  a group title narrows the count to just that bucket so the toolbar
 *  reflects the filter the user has selected. */
function computeStats(groups: AssetGroup[], activeCategory: string | null) {
  const slice = activeCategory
    ? groups.filter((g) => g.title === activeCategory)
    : groups
  return slice.reduce(
    (a, g) => {
      g.items.forEach((it) => {
        const k = it.kind ?? 'image'
        a[k] += 1
        if (it.frames) a.frames += it.frames
      })
      return a
    },
    { image: 0, audio: 0, video: 0, frames: 0 } as Record<string, number>,
  )
}

export const KIND_META: Record<AssetKind, { label: string; icon: typeof ImageIcon }> = {
  image: { label: '图像', icon: ImageIcon },
  audio: { label: '音频', icon: Music2 },
  video: { label: '视频', icon: Film },
}

export default function GarudaAssetsView({
  groups = GROUPS,
  activeKind: controlledKind,
  onKindChange,
  selectedAsset: controlledSel,
  onSelectAsset,
}: GarudaAssetsViewProps = {}) {
  const [internalKind, setInternalKind] = useState<AssetKind>('image')
  const [internalSel, setInternalSel] = useState<AssetItem | null>(null)
  // Controlled when the parent (toolbar) drives the kind selection.
  const controlled = controlledKind !== undefined
  const activeKind = controlled ? controlledKind : internalKind
  const setActiveKind = (k: AssetKind) => {
    onKindChange?.(k)
    if (!controlled) setInternalKind(k)
  }
  // Selection (the asset opened on the canvas) — controlled when the
  // parent passes onSelectAsset so its toolbar / 编辑 panel can bind to it.
  const selControlled = onSelectAsset !== undefined
  const selected = selControlled ? controlledSel ?? null : internalSel
  const setSelected = (a: AssetItem | null) => {
    onSelectAsset?.(a)
    if (!selControlled) setInternalSel(a)
  }

  // Which kinds actually have assets — only those get a tab.
  const kindCounts = groups.reduce(
    (a, g) => {
      g.items.forEach((it) => {
        a[it.kind ?? 'image'] += 1
      })
      return a
    },
    { image: 0, audio: 0, video: 0 } as Record<AssetKind, number>,
  )
  const kindTabs = (['image', 'audio', 'video'] as AssetKind[]).filter(
    (k) => kindCounts[k] > 0,
  )
  const effectiveKind = kindTabs.includes(activeKind) ? activeKind : kindTabs[0]

  // Filter by the selected kind tab, dropping groups that end up empty.
  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => (it.kind ?? 'image') === effectiveKind),
    }))
    .filter((g) => g.items.length > 0)

  // Asset opened → show the inline canvas (not a fullscreen overlay).
  if (selected) {
    return <AssetCanvas item={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[var(--color-surface-0)]">
      <div className="thin-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      {/* Kind tabs — 图像 / 音频 / 视频 (hidden when the parent toolbar
          owns the switcher) */}
      {!controlled && kindTabs.length > 1 && (
        <div className="sticky top-0 z-10 flex shrink-0 items-center gap-1 border-b border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-5 py-2">
          {kindTabs.map((k) => {
            const Icon = KIND_META[k].icon
            const active = k === effectiveKind
            return (
              <button
                key={k}
                type="button"
                onClick={() => setActiveKind(k)}
                className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] transition-colors ${
                  active
                    ? 'bg-[var(--color-ink)]/[0.07] text-[var(--color-ink)]/90'
                    : 'text-[var(--color-ink)]/50 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]/80'
                }`}
              >
                <Icon size={13} strokeWidth={1.8} className="shrink-0 opacity-70" />
                {KIND_META[k].label}
                <span className="text-[10.5px] text-[var(--color-ink)]/40">{kindCounts[k]}</span>
              </button>
            )
          })}
        </div>
      )}
      <div className="space-y-7 px-5 py-5">
        {visibleGroups.map((g) => (
          <section key={g.title}>
            <div className="mb-2.5 flex items-baseline gap-2">
              <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">{g.title}</h3>
              {g.desc && (
                <span className="text-[11px] text-[var(--color-ink)]/45">{g.desc}</span>
              )}
              <span className="ml-auto text-[11px] text-[var(--color-ink)]/35">
                {g.items.length} 项
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
              {g.items.map((it) => (
                <AssetThumb key={it.src} item={it} onOpen={() => setSelected(it)} />
              ))}
            </div>
          </section>
        ))}
      </div>
      </div>
    </div>
  )
}

/** Checkerboard "canvas" detail — the clicked asset shown large, frame
 *  sequences auto-looping. Replaces the old fullscreen overlay. */
function AssetCanvas({ item, onBack }: { item: AssetItem; onBack: () => void }) {
  const kind = item.kind ?? 'image'
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-0)]">
      {/* canvas header — back + asset identity */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-[var(--color-ink)]/60 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          返回素材
        </button>
        <span className="font-mono text-[12px] text-[var(--color-ink)]/85">{item.label}</span>
        {item.frames && (
          <span className="rounded-md bg-[var(--fill-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-ink)]/55">
            {item.frames} 帧
          </span>
        )}
      </div>
      {/* canvas surface */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-8"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage:
            'linear-gradient(45deg,#eceef2 25%,transparent 25%),linear-gradient(-45deg,#eceef2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceef2 75%),linear-gradient(-45deg,transparent 75%,#eceef2 75%)',
          backgroundSize: '22px 22px',
          backgroundPosition: '0 0,0 11px,11px -11px,-11px 0',
        }}
      >
        {kind === 'video' ? (
          <video
            src={item.src}
            controls
            autoPlay
            loop
            className="max-h-full max-w-full rounded-lg shadow-2xl"
          />
        ) : kind === 'audio' ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-black/40 px-8 py-7">
            <Music2 size={40} className="text-white/80" strokeWidth={1.4} />
            <span className="font-mono text-[13px] text-white/85">{item.label}</span>
            <audio src={item.src} controls autoPlay />
          </div>
        ) : (
          <FrameImage
            item={item}
            playing
            className="max-h-full max-w-full object-contain drop-shadow-2xl"
          />
        )}
      </div>
    </div>
  )
}

/** Stats line — exported so the parent preview toolbar can surface
 *  the same image / audio / video / frame counts without re-importing
 *  GROUPS. When `activeCategory` is set (matches a group title), the
 *  counts narrow to that bucket so the toolbar tracks the filter
 *  applied in the side panel. */
export function AssetStatsLine({
  activeCategory = null,
  groups = GROUPS,
}: {
  activeCategory?: string | null
  groups?: AssetGroup[]
} = {}) {
  const stats = computeStats(groups, activeCategory)
  return (
    <span className="flex items-center gap-3 text-[11px] text-[var(--color-ink)]/50">
      <Stat icon={ImageIcon} value={stats.image} label="图像" />
      <Stat icon={Music2} value={stats.audio} label="音频" />
      <Stat icon={Film} value={stats.video} label="视频" />
      {stats.frames > 0 && (
        <span>
          含 <span className="font-mono">{stats.frames}</span> 帧动画
        </span>
      )}
    </span>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof ImageIcon
  value: number
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={11} strokeWidth={1.8} />
      <span className="font-mono text-[var(--color-ink)]/70">{value}</span>
      <span>{label}</span>
    </span>
  )
}

function AssetThumb({ item, onOpen }: { item: AssetItem; onOpen: () => void }) {
  const kind = item.kind ?? 'image'
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group flex flex-col gap-1.5 overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-1.5 text-left transition-colors hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-hover)]"
    >
      <div className="relative aspect-square overflow-hidden rounded bg-[var(--color-ink)]/[0.06]">
        {kind === 'audio' ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--color-ink)]/45">
            <Music2 size={18} strokeWidth={1.6} />
            <span className="text-[10px] uppercase tracking-wider">audio</span>
          </div>
        ) : kind === 'video' ? (
          <video
            src={item.src}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => {
              e.currentTarget.pause()
              e.currentTarget.currentTime = 0
            }}
          />
        ) : (
          // Frame sequences loop-play on hover; static images just sit.
          <FrameImage
            item={item}
            playing={hover}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        {item.frames && (
          <span className="absolute right-1 top-1 rounded-md bg-black/65 px-1.5 py-0.5 font-mono text-[9.5px] text-white/80">
            {item.frames}f
          </span>
        )}
      </div>
      <span className="truncate px-1 text-[11px] text-[var(--color-ink)]/70">
        {item.label}
      </span>
    </button>
  )
}
