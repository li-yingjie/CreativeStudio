import { memo, useMemo, useState } from 'react'
import { ChevronRight, Home, MessageCircle, RefreshCw, Sparkles, User } from '@/shared/icons'
import PhoneStatusBar from '@/modules/editor/components/preview/PhoneStatusBar'
import {
  DEFAULT_MINIPROGRAM_PREVIEW,
  type MiniProgramConfig,
  type MiniProgramPreviewConfig,
} from './MiniProgramConfigData'

/**
 * 小程序 — 手机内预览 UI（config 驱动）
 *
 * A controlled multi-page mini-program preview. Persona/content (nav titles,
 * home / tarot copy, chat, profile, scene + card images) come from
 * `config.preview` so the same renderer shows any mini-program; it falls back
 * to DEFAULT_MINIPROGRAM_PREVIEW (the seeded 第五人格塔罗 surface). `route` is
 * the active page label (首页 / 塔罗 / 聊天 / 个人); `onNavigate` switches pages
 * and stays in sync with the left product view. The gold accent + tarot flip
 * mechanics + layout are the shared framework (not config).
 *
 * 塔罗 page: 3 cards face-down. Tap one → cards spread + the tapped card flips.
 */
const CARD_W = 84
const CARD_H = 122
const CARD_GAP = 5

/** Page labels — order matches the bottom TabBar; labels are the route ids. */
const TABS = [
  { label: '首页', icon: Home },
  { label: '塔罗', icon: Sparkles },
  { label: '聊天', icon: MessageCircle },
  { label: '个人', icon: User },
] as const

interface MiniAppPreviewProps {
  /** The mini-program's config — its `preview` drives the surface content. */
  config?: MiniProgramConfig
  /** Active page label; null falls back to the first page (首页). */
  route: string | null
  onNavigate: (label: string) => void
}

function MiniAppPreview({ config, route, onNavigate }: MiniAppPreviewProps) {
  const p = config?.preview ?? DEFAULT_MINIPROGRAM_PREVIEW
  const active = route ?? '首页'
  return (
    <div className="theme-dark-scope relative flex h-full w-full flex-col overflow-hidden text-[var(--color-ink)]">
      {/* ── Background scene ── */}
      <img
        aria-hidden
        src={p.sceneBg}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
      />
      <img
        aria-hidden
        src={p.sceneBg}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
        style={{
          filter: 'blur(14px)',
          maskImage: 'linear-gradient(to bottom, transparent 30%, black 60%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 30%, black 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/75"
      />

      {/* ── Status bar + nav title ── */}
      <PhoneStatusBar />
      <div className="relative z-10 flex shrink-0 items-center justify-center py-2">
        <span className="text-[11px] font-medium text-[var(--color-ink)]/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          {p.navTitles[active]}
        </span>
      </div>

      {/* ── Routed page ── */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {active === '首页' && <HomeScreen onNavigate={onNavigate} home={p.home} />}
        {active === '塔罗' && <TarotScreen tarot={p.tarot} cardPool={p.cardPool} />}
        {active === '聊天' && <ChatScreen chat={p.chat} portrait={p.portrait} />}
        {active === '个人' && <ProfileScreen profile={p.profile} portrait={p.portrait} />}
      </div>

      {/* ── Bottom TabBar ── */}
      {/* Solid bg (no backdrop-blur): a backdrop-filter element escapes
          the phone's rounded-corner clip and its square corners poke out. */}
      <div className="relative z-10 flex shrink-0 items-stretch border-t border-white/10 bg-[#0c0d11]/95">
        {TABS.map(({ label, icon: Icon }) => {
          const on = label === active
          return (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(label)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                on ? 'text-[#e8c97a]' : 'text-[var(--color-ink)]/45'
              }`}
            >
              <Icon size={15} strokeWidth={on ? 2.2 : 1.8} />
              <span className="text-[9px] tracking-wide">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── 首页 ─── */

function HomeScreen({
  onNavigate,
  home,
}: {
  onNavigate: (label: string) => void
  home: MiniProgramPreviewConfig['home']
}) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      {/* hero card */}
      <button
        type="button"
        onClick={() => onNavigate('塔罗')}
        className="glass-edge relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.02] p-4 text-left backdrop-blur-xl"
        style={{ ['--edge-alpha' as string]: 0.25 }}
      >
        <span className="text-[10px] tracking-[0.2em] text-[#e8c97a]/70">
          {home.dateLabel}
        </span>
        <h3 className="mt-1.5 text-[16px] font-semibold text-[var(--color-ink)]">
          {home.title}
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-ink)]/65">
          {home.desc}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#e8c97a] px-3 py-1.5 text-[11px] font-medium text-[#0a0b0f]">
          {home.cta}
          <ChevronRight size={12} strokeWidth={2.4} />
        </span>
      </button>

      {/* quick entries */}
      <div className="grid grid-cols-2 gap-3">
        {home.quickEntries.map((c) => (
          <div
            key={c.t}
            className="glass-edge rounded-xl bg-white/[0.05] p-3 backdrop-blur-md"
            style={{ ['--edge-alpha' as string]: 0.16 }}
          >
            <h4 className="text-[12px] font-medium text-[var(--color-ink)]/90">{c.t}</h4>
            <p className="mt-0.5 text-[10px] text-[var(--color-ink)]/55">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 塔罗 ─── */

function TarotScreen({
  tarot,
  cardPool,
}: {
  tarot: MiniProgramPreviewConfig['tarot']
  cardPool: string[]
}) {
  const deck = useMemo(
    () => Array.from({ length: 3 }, (_, i) => cardPool[i % cardPool.length]),
    [cardPool],
  )
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false])

  const cards = useMemo(
    () => Array.from({ length: 3 }, (_, i) => deck[(i + shuffleSeed) % deck.length]),
    [deck, shuffleSeed],
  )
  const anyFlipped = flipped.some(Boolean)
  const allFlipped = flipped.every(Boolean)

  const flipCard = (i: number) =>
    setFlipped((prev) => prev.map((v, idx) => (idx === i ? true : v)))
  const reshuffle = () => {
    setFlipped([false, false, false])
    setShuffleSeed((s) => s + 1)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-3">
      <div
        className="relative flex shrink-0 justify-center"
        style={{ width: '100%', height: CARD_H + 12 }}
      >
        {cards.map((url, i) => {
          const isFlipped = flipped[i]
          const stackRot = [-4, 0, 4][i]
          const stackX = (i - 1) * 5
          const stackY = i * -2
          const spreadX = (i - 1) * (CARD_W + CARD_GAP)
          const spreadY = i === 1 ? -4 : 0
          const tx = anyFlipped ? spreadX : stackX
          const ty = anyFlipped ? spreadY : stackY
          const rot = anyFlipped ? 0 : stackRot
          const scale = isFlipped ? 1.04 : 1
          const zIndex = isFlipped ? 20 : 10 - i
          return (
            <button
              key={`${shuffleSeed}-${i}`}
              type="button"
              onClick={() => !flipped[i] && flipCard(i)}
              disabled={flipped[i]}
              aria-label={`翻开第 ${i + 1} 张牌`}
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: CARD_W,
                height: CARD_H,
                zIndex,
                perspective: '720px',
                transform: `translate(calc(-50% + ${tx}px), ${ty}px) rotate(${rot}deg) scale(${scale})`,
                transition: 'transform 520ms cubic-bezier(.33,1,.68,1)',
                ['--edge-alpha' as string]: isFlipped ? 0.38 : 0.22,
              }}
              className="glass-edge rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.16),0_12px_28px_-10px_rgba(0,0,0,0.65)] backdrop-blur-xl active:scale-[0.97]"
            >
              <div
                className="relative h-full w-full"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 620ms cubic-bezier(.33,1,.68,1)',
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="absolute inset-1.5 rounded-xl border border-[#e8c97a]/25" />
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-[22px] text-[#e8c97a]/75 drop-shadow-[0_0_8px_rgba(232,201,122,0.4)]">
                      ✦
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-1.5 text-center text-[6px] tracking-[0.22em] text-[#e8c97a]/45">
                    TAROT
                  </div>
                </div>
                <div
                  className="absolute inset-0 overflow-hidden rounded-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: '50% 15%' }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"
                  />
                  <div className="absolute inset-x-0 bottom-1.5 text-center text-[7px] font-medium tracking-[0.22em] text-[#e8c97a]/90">
                    {tarot.cardLabels[i]}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 text-center">
        <p className="max-w-[92%] text-[11px] leading-relaxed text-[var(--color-ink)]/70">
          {!anyFlipped
            ? tarot.hintInitial
            : allFlipped
              ? tarot.hintAll
              : tarot.hintPartial}
        </p>
      </div>

      <button
        type="button"
        onClick={reshuffle}
        style={{ ['--edge-alpha' as string]: 0.2 }}
        className="glass-edge flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-b from-white/[0.09] to-white/[0.02] px-5 py-2 text-[11px] text-[var(--color-ink)]/75 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-colors hover:text-[var(--color-ink)]"
      >
        <RefreshCw size={11} strokeWidth={2} />
        {tarot.reshuffleLabel}
      </button>
    </div>
  )
}

/* ─── 聊天 ─── */

function ChatScreen({
  chat,
  portrait,
}: {
  chat: MiniProgramPreviewConfig['chat']
  portrait: string
}) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 pb-3 pt-1">
      {chat.map((m, i) =>
        m.from === 'ai' ? (
          <div key={i} className="flex items-end gap-1.5">
            <img
              src={portrait}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
            <div className="glass-edge max-w-[78%] rounded-2xl rounded-bl-md bg-white/[0.1] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-ink)]/90 backdrop-blur-md">
              {m.text}
            </div>
          </div>
        ) : (
          <div key={i} className="flex justify-end">
            <div className="max-w-[78%] rounded-2xl rounded-br-md bg-[#e8c97a] px-3 py-2 text-[11px] leading-relaxed text-[#0a0b0f]">
              {m.text}
            </div>
          </div>
        ),
      )}
    </div>
  )
}

/* ─── 个人 ─── */

function ProfileScreen({
  profile,
  portrait,
}: {
  profile: MiniProgramPreviewConfig['profile']
  portrait: string
}) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      <div className="flex items-center gap-3">
        <img
          src={portrait}
          alt=""
          className="h-12 w-12 rounded-full object-cover ring-1 ring-[#e8c97a]/40"
        />
        <div>
          <div className="text-[14px] font-semibold text-[var(--color-ink)]">{profile.name}</div>
          <div className="mt-0.5 text-[10px] text-[var(--color-ink)]/55">
            {profile.subtitle}
          </div>
        </div>
      </div>

      <div className="glass-edge flex rounded-xl bg-white/[0.05] py-3 backdrop-blur-md" style={{ ['--edge-alpha' as string]: 0.16 }}>
        {profile.stats.map((s) => (
          <div key={s.unit} className="flex flex-1 flex-col items-center">
            <span className="text-[16px] font-semibold text-[var(--color-ink)]">{s.num}</span>
            <span className="mt-0.5 text-[9px] text-[var(--color-ink)]/55">{s.unit}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-px overflow-hidden rounded-xl">
        {profile.menu.map((m) => (
          <div
            key={m}
            className="flex items-center justify-between bg-white/[0.05] px-3.5 py-2.5 text-[11.5px] text-[var(--color-ink)]/85"
          >
            <span>{m}</span>
            <ChevronRight size={13} className="text-[var(--color-ink)]/35" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(MiniAppPreview)
