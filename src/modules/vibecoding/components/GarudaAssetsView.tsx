import { useState } from 'react'
import { Music2, Image as ImageIcon, Film, Check } from 'lucide-react'

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
      { src: '/garuda/assets/garuda_killer_video-webp/garuda_killer_video_000.webp', label: 'killer', frames: 80 },
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

export type { AssetGroup, AssetItem }

interface GarudaAssetsViewProps {
  /** When true, the left category-filter side panel is mounted. The
   *  parent toolbar's list-icon button toggles this. */
  panelOpen?: boolean
  /** Which group is currently filtered to. `null` shows every group. */
  activeCategory?: string | null
  /** Click handler for category rows in the side panel. */
  onSelectCategory?: (category: string | null) => void
  /** Group/items to render. Defaults to the Garuda game's GROUPS so
   *  existing call sites stay unchanged; pass a project-specific list
   *  (e.g. H5 活动素材) to reuse the same layout for other surfaces. */
  groups?: AssetGroup[]
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

export default function GarudaAssetsView({
  panelOpen = false,
  activeCategory = null,
  onSelectCategory,
  groups = GROUPS,
}: GarudaAssetsViewProps = {}) {
  const [zoomed, setZoomed] = useState<AssetItem | null>(null)

  const visibleGroups = activeCategory
    ? groups.filter((g) => g.title === activeCategory)
    : groups

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[var(--color-surface-0)]">
      {panelOpen && (
        <aside className="thin-scroll flex w-[180px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-[var(--divider-soft)] bg-[var(--color-surface-1)] py-2">
          <button
            type="button"
            onClick={() => onSelectCategory?.(null)}
            className={`mx-2 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors ${
              activeCategory === null
                ? 'bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]'
                : 'text-[var(--color-ink)]/70 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]'
            }`}
          >
            <span className="truncate">全部</span>
            {activeCategory === null && (
              <Check size={12} className="shrink-0 text-[var(--color-ink)]/60" />
            )}
          </button>
          <div className="mx-3 my-1 h-px bg-[var(--divider-soft)]" />
          {groups.map((g) => {
            const isActive = activeCategory === g.title
            return (
              <button
                key={g.title}
                type="button"
                onClick={() => onSelectCategory?.(g.title)}
                className={`mx-2 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                  isActive
                    ? 'bg-[var(--color-ink)]/[0.08] text-[var(--color-ink)]'
                    : 'text-[var(--color-ink)]/70 hover:bg-[var(--color-ink)]/[0.04] hover:text-[var(--color-ink)]'
                }`}
              >
                <span className="truncate">{g.title}</span>
                <span className="shrink-0 text-[10px] text-[var(--color-ink)]/40">
                  {g.items.length}
                </span>
              </button>
            )
          })}
        </aside>
      )}
      <div className="thin-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
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
                <AssetThumb key={it.src} item={it} onZoom={() => setZoomed(it)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {zoomed && (
        <button
          type="button"
          onClick={() => setZoomed(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <div className="max-h-[80vh] max-w-[80vw] overflow-hidden rounded-xl border border-white/10 bg-black/50">
            {(zoomed.kind ?? 'image') === 'video' ? (
              <video
                src={zoomed.src}
                controls
                autoPlay
                className="max-h-[80vh] max-w-[80vw]"
              />
            ) : (zoomed.kind ?? 'image') === 'audio' ? (
              <div className="flex flex-col items-center gap-3 p-6">
                <Music2 size={32} className="text-white/80" strokeWidth={1.5} />
                <span className="text-[13px] font-mono text-white/85">{zoomed.label}</span>
                <audio src={zoomed.src} controls autoPlay />
              </div>
            ) : (
              <img
                src={zoomed.src}
                alt={zoomed.label}
                className="block max-h-[80vh] max-w-[80vw] object-contain"
              />
            )}
          </div>
          <span className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/70 backdrop-blur">
            点击关闭
          </span>
        </button>
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

function AssetThumb({ item, onZoom }: { item: AssetItem; onZoom: () => void }) {
  const kind = item.kind ?? 'image'
  return (
    <button
      type="button"
      onClick={onZoom}
      className="group flex flex-col gap-1.5 overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-1.5 text-left transition-colors hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-hover)]"
    >
      <div className="relative aspect-square overflow-hidden rounded bg-black/60">
        {kind === 'audio' ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-white/55">
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
          <img
            src={item.src}
            alt={item.label}
            loading="lazy"
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
