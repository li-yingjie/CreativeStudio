import { useMemo, useState } from 'react'
import { ChevronRight, Home, MessageCircle, RefreshCw, Sparkles, User } from '@/shared/icons'
import PhoneStatusBar from '@/modules/editor/components/preview/PhoneStatusBar'
import { getWorld } from '@/modules/editor/data/worlds'

/**
 * 第五人格塔罗运势小程序 — 手机内预览 UI
 *
 * A controlled multi-page mini-program preview. `route` is the active
 * page label (首页 / 塔罗 / 聊天 / 个人); `onNavigate` switches pages and
 * is wired to the same state the left product view drives, so the bottom
 * TabBar and the product tree stay in sync.
 *
 * 塔罗 page: 3 cards face-down. Tap one → cards spread + the tapped card
 * flips. Cards are pinned to Identity V world assets.
 */
const CARD_LABELS = ['PAST', 'NOW', 'NEXT'] as const
const SCENE_BG = '/场景/约瑟夫暗房.png'

const CARD_W = 84
const CARD_H = 122
const CARD_GAP = 5

const IDENTITY_V_WORLD = getWorld('identity-v')
const IDENTITY_V_DEFAULT_CARDS = [
  ...(IDENTITY_V_WORLD.defaults.gallery ?? []),
  IDENTITY_V_WORLD.defaults.portraitUrl,
]
const CARD_POOL: string[] = IDENTITY_V_DEFAULT_CARDS.length > 0
  ? IDENTITY_V_DEFAULT_CARDS
  : ['/bg/identity-v-portrait.png']
const PORTRAIT = IDENTITY_V_WORLD.defaults.portraitUrl

/** Page labels — order matches the bottom TabBar. */
const TABS = [
  { label: '首页', icon: Home },
  { label: '塔罗', icon: Sparkles },
  { label: '聊天', icon: MessageCircle },
  { label: '个人', icon: User },
] as const

const NAV_TITLE: Record<string, string> = {
  首页: '第五人格 · 今日运势',
  塔罗: '今日塔罗',
  聊天: '约瑟夫',
  个人: '我的',
}

interface MiniAppPreviewProps {
  /** Active page label; null falls back to the first page (首页). */
  route: string | null
  onNavigate: (label: string) => void
}

export default function MiniAppPreview({ route, onNavigate }: MiniAppPreviewProps) {
  const active = route ?? '首页'
  return (
    <div className="theme-dark-scope relative flex h-full w-full flex-col overflow-hidden text-[var(--color-ink)]">
      {/* ── Background scene ── */}
      <img
        aria-hidden
        src={SCENE_BG}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
      />
      <img
        aria-hidden
        src={SCENE_BG}
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
          {NAV_TITLE[active]}
        </span>
      </div>

      {/* ── Routed page ── */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {active === '首页' && <HomeScreen onNavigate={onNavigate} />}
        {active === '塔罗' && <TarotScreen />}
        {active === '聊天' && <ChatScreen />}
        {active === '个人' && <ProfileScreen />}
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

function HomeScreen({ onNavigate }: { onNavigate: (label: string) => void }) {
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
          TODAY · 5 月 18 日
        </span>
        <h3 className="mt-1.5 text-[16px] font-semibold text-[var(--color-ink)]">
          为你显影今日运势
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-ink)]/65">
          抽出过去、当下与下一张牌，让约瑟夫的快门替你解读。
        </p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#e8c97a] px-3 py-1.5 text-[11px] font-medium text-[#0a0b0f]">
          开始今日占卜
          <ChevronRight size={12} strokeWidth={2.4} />
        </span>
      </button>

      {/* quick entries */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { t: '运势日记', d: '回看历史牌面' },
          { t: '牌意词典', d: '78 张牌全解' },
        ].map((c) => (
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

function TarotScreen() {
  const deck = useMemo(
    () => Array.from({ length: 3 }, (_, i) => CARD_POOL[i % CARD_POOL.length]),
    [],
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
                    {CARD_LABELS[i]}
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
            ? '点击牌堆，抽出今日的第一张牌'
            : allFlipped
              ? '三张牌已为你显影 —— 过去、当下、下一张等你按下快门。'
              : '继续点未翻开的牌，让约瑟夫的快门替你显影。'}
        </p>
      </div>

      <button
        type="button"
        onClick={reshuffle}
        style={{ ['--edge-alpha' as string]: 0.2 }}
        className="glass-edge flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-b from-white/[0.09] to-white/[0.02] px-5 py-2 text-[11px] text-[var(--color-ink)]/75 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-colors hover:text-[var(--color-ink)]"
      >
        <RefreshCw size={11} strokeWidth={2} />
        重新抽卡
      </button>
    </div>
  )
}

/* ─── 聊天 ─── */

function ChatScreen() {
  const MESSAGES = [
    { from: 'ai', text: '今晚的暗房很安静，想聊聊你抽到的牌吗？' },
    { from: 'me', text: '我抽到了「NOW」是一张倒置的牌。' },
    { from: 'ai', text: '倒置常意味着「尚未释放的能量」。别急，先按下快门，再谈显影。' },
    { from: 'me', text: '那我下一步该注意什么？' },
  ] as const
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 pb-3 pt-1">
      {MESSAGES.map((m, i) =>
        m.from === 'ai' ? (
          <div key={i} className="flex items-end gap-1.5">
            <img
              src={PORTRAIT}
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

function ProfileScreen() {
  const STATS = [
    { num: '36', unit: '次占卜' },
    { num: '12', unit: '连续天' },
    { num: '5', unit: '收藏牌' },
  ]
  const MENU = ['我的运势日记', '收藏的牌意', '提醒设置']
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      <div className="flex items-center gap-3">
        <img
          src={PORTRAIT}
          alt=""
          className="h-12 w-12 rounded-full object-cover ring-1 ring-[#e8c97a]/40"
        />
        <div>
          <div className="text-[14px] font-semibold text-[var(--color-ink)]">深夜旅人</div>
          <div className="mt-0.5 text-[10px] text-[var(--color-ink)]/55">
            与约瑟夫同行 12 天
          </div>
        </div>
      </div>

      <div className="glass-edge flex rounded-xl bg-white/[0.05] py-3 backdrop-blur-md" style={{ ['--edge-alpha' as string]: 0.16 }}>
        {STATS.map((s) => (
          <div key={s.unit} className="flex flex-1 flex-col items-center">
            <span className="text-[16px] font-semibold text-[var(--color-ink)]">{s.num}</span>
            <span className="mt-0.5 text-[9px] text-[var(--color-ink)]/55">{s.unit}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-px overflow-hidden rounded-xl">
        {MENU.map((m) => (
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
