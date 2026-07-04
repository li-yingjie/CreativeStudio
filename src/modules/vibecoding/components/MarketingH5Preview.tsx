import { ChevronLeft, Search, Share2 } from '@/shared/icons'
import type { H5ElementKind, H5LayerId, H5Selection } from './H5LayerEditPanel'
import {
  DEFAULT_MARKETING_H5_PREVIEW,
  type MarketingH5PreviewConfig,
} from './MarketingH5ConfigData'

/** Selection context threaded into each layer so inner elements are pickable. */
interface PickCtx {
  editing: boolean
  selected: H5Selection | null
  onSelect: (s: H5Selection | null) => void
}

type LayerProps = { p: MarketingH5PreviewConfig; ctx: PickCtx }

const LAYERS: {
  id: H5LayerId
  label: string
  Comp: (props: LayerProps) => React.ReactElement
}[] = [
  { id: 'hero', label: '头图', Comp: HeroBanner },
  { id: 'countdown', label: '倒计时', Comp: CountdownCard },
  { id: 'intro', label: '活动介绍', Comp: IntroCard },
  { id: 'lottery', label: '幸运抽奖', Comp: LotteryCard },
  { id: 'task', label: '参与任务', Comp: TaskCard },
  { id: 'rules', label: '活动规则', Comp: RulesCard },
]

export default function MarketingH5Preview({
  preview,
  editing = false,
  selected = null,
  onSelect,
}: {
  /** Activity content; falls back to DEFAULT_MARKETING_H5_PREVIEW. */
  preview?: MarketingH5PreviewConfig
  /** When true, layers + their inner elements become selectable (edit mode). */
  editing?: boolean
  /** Current selection (layer / element); null = 整体活动配置. */
  selected?: H5Selection | null
  onSelect?: (s: H5Selection | null) => void
} = {}) {
  const p = preview ?? DEFAULT_MARKETING_H5_PREVIEW
  const ctx: PickCtx = { editing, selected, onSelect: (s) => onSelect?.(s) }
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#251517] text-[#35151d]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent)]" />

      <main
        className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-5 pt-3"
        // Clicking the background (not a layer/element) deselects → 整体活动配置.
        onClick={editing ? () => onSelect?.(null) : undefined}
      >
        {LAYERS.map((L, i) => (
          <Selectable key={L.id} ctx={ctx} id={L.id} label={L.label} className={i > 0 ? 'mt-8' : ''}>
            <L.Comp p={p} ctx={ctx} />
          </Selectable>
        ))}
        <FooterSearch p={p} />
      </main>
    </div>
  )
}

/** Floor-level wrapper. In edit mode the floor gets a hover/selected ring +
 *  corner handles + label badge. Unlike a full-cover overlay, this keeps inner
 *  elements clickable: the ring sits on the wrapper and inner <El> stop
 *  propagation, so element clicks win and floor clicks fall through to here. */
function Selectable({
  ctx,
  id,
  label,
  className = '',
  children,
}: {
  ctx: PickCtx
  id: H5LayerId
  label: string
  className?: string
  children: React.ReactNode
}) {
  if (!ctx.editing) return <div className={className}>{children}</div>
  const sel = ctx.selected
  const layerSelected = sel?.type === 'layer' && sel.layer === id
  const elementInside = sel?.type === 'element' && sel.el.layer === id
  return (
    <div
      data-h5-active={layerSelected || undefined}
      onClick={(e) => {
        e.stopPropagation()
        ctx.onSelect({ type: 'layer', layer: id })
      }}
      className={`relative cursor-pointer rounded-3xl transition-shadow ${className} ${
        layerSelected
          ? 'ring-2 ring-[#7c5cff]'
          : elementInside
            ? 'ring-1 ring-[#7c5cff]/30'
            : 'ring-1 ring-transparent hover:ring-2 hover:ring-[#7c5cff]/40'
      }`}
    >
      {children}
      <span
        className={`pointer-events-none absolute -top-2.5 left-2 z-40 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none text-white transition-opacity ${
          layerSelected ? 'bg-[#7c5cff] opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </span>
      {layerSelected &&
        ['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos) => (
          <span
            key={pos}
            className={`pointer-events-none absolute ${pos} z-40 h-2 w-2 rounded-[2px] border border-[#7c5cff] bg-white`}
          />
        ))}
    </div>
  )
}

/** Element-level pickable. Wraps a single atom (text/button/image) inside a
 *  floor; in edit mode it gets its own ring + label and selects the element
 *  (stopping propagation so the parent floor isn't selected too). Outside edit
 *  mode it renders children verbatim — preview stays pixel-identical. */
function El({
  ctx,
  layer,
  id,
  kind,
  label,
  value,
  children,
  inline = false,
  className = '',
}: {
  ctx: PickCtx
  layer: H5LayerId
  id: string
  kind: H5ElementKind
  label: string
  value?: string
  children: React.ReactNode
  inline?: boolean
  className?: string
}) {
  if (!ctx.editing) return <>{children}</>
  const active = ctx.selected?.type === 'element' && ctx.selected.el.id === id
  const tone = active
    ? 'z-20 ring-2 ring-[#7c5cff]'
    : 'ring-1 ring-transparent hover:z-20 hover:ring-2 hover:ring-[#7c5cff]/50'
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    ctx.onSelect({ type: 'element', el: { layer, id, kind, label, value } })
  }
  const badge = active ? (
    <span className="pointer-events-none absolute -top-2 left-1 z-40 rounded bg-[#7c5cff] px-1 py-px text-[9px] font-medium leading-tight text-white">
      {label}
    </span>
  ) : null
  if (inline) {
    return (
      <span
        data-h5-active={active || undefined}
        data-h5-element-id={id}
        data-h5-layer-id={layer}
        onClick={onClick}
        className={`relative inline-flex cursor-pointer rounded-md ${tone} ${className}`}
      >
        {children}
        {badge}
      </span>
    )
  }
  return (
    <div
      data-h5-active={active || undefined}
      data-h5-element-id={id}
      data-h5-layer-id={layer}
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg ${tone} ${className}`}
    >
      {children}
      {badge}
    </div>
  )
}

function HeroBanner({ p, ctx }: LayerProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white shadow-lg">
      <El ctx={ctx} layer="hero" id="hero.image" kind="image" label="头图" value={p.heroImage} className="block w-full">
        <img
          src={p.heroImage}
          alt="六一童趣抽奖活动礼盒彩色横幅"
          className="h-40 w-full object-cover object-center"
        />
      </El>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-[56%] flex-col justify-center px-5">
        <div className="mb-1 flex items-center gap-2 text-[#f7b85c]">
          <span className="text-[28px] font-black leading-none">{p.hero.badge}</span>
          <span className="h-1.5 w-8 rounded-full bg-[#f7b85c]" />
        </div>
        <h1 className="text-balance text-[26px] font-black leading-tight text-[#ff7186]">
          <El
            ctx={ctx}
            layer="hero"
            id="hero.title"
            kind="text"
            label="主标题"
            value={p.hero.accentTitle}
            inline
            className="pointer-events-auto"
          >
            {p.hero.accentTitle}
          </El>
        </h1>
      </div>
      <button
        type="button"
        aria-label="返回"
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700/45 text-white shadow-sm"
      >
        <ChevronLeft size={22} strokeWidth={3} />
      </button>
      <button
        type="button"
        aria-label="分享活动"
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700/45 text-white shadow-sm"
      >
        <Share2 size={18} strokeWidth={2.5} />
      </button>
    </section>
  )
}

function CountdownCard({ p }: LayerProps) {
  return (
    <section className="rounded-[24px] bg-white px-4 py-4 text-center shadow-sm">
      <div className="flex items-center justify-center gap-1.5 text-[15px] font-semibold text-[#2d2930]">
        <span className="mr-1">倒计时:</span>
        {p.countdown.map((item) => (
          <span key={item.unit} className="inline-flex items-center gap-1 tabular-nums">
            <span className="rounded-md bg-[#65cfc8] px-1.5 py-0.5 text-[22px] leading-none text-white">
              {item.value}
            </span>
            <span>{item.unit}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function IntroCard({ p, ctx }: LayerProps) {
  return (
    <DecoratedCard className="px-5 pb-6 pt-5">
      <h2 className="text-balance text-center text-[20px] font-black">
        <El ctx={ctx} layer="intro" id="intro.title" kind="text" label="主标题" value={p.intro.title} inline>
          {p.intro.title}
        </El>
      </h2>
      <El
        ctx={ctx}
        layer="intro"
        id="intro.body"
        kind="text"
        label="正文"
        value={p.intro.paragraphs.join('\n')}
        className="mt-5"
      >
        <div className="space-y-2.5 text-pretty text-[14px] font-medium leading-relaxed text-[#695158]">
          {p.intro.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </El>
    </DecoratedCard>
  )
}

function LotteryCard({ p, ctx }: LayerProps) {
  return (
    <DecoratedCard className="px-5 pb-8 pt-5">
      <h2 className="text-center text-[20px] font-black">
        <El ctx={ctx} layer="lottery" id="lottery.title" kind="text" label="标题" value={p.lottery.title} inline>
          {p.lottery.title}
        </El>
      </h2>
      <El
        ctx={ctx}
        layer="lottery"
        id="lottery.winners"
        kind="text"
        label="中奖名单"
        value={p.lottery.winners.join('  ')}
        className="mx-auto mt-8 w-[78%]"
      >
        <div className="flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-500 shadow-sm">
          {p.lottery.winners.map((winner) => (
            <span key={winner} className="truncate">
              {winner}
            </span>
          ))}
        </div>
      </El>
      <div className="relative mx-auto mt-8 w-[92%]">
        <El ctx={ctx} layer="lottery" id="lottery.image" kind="image" label="抽奖机" value={p.lotteryImage} className="block">
          <img
            src={p.lotteryImage}
            alt="儿童节幸运抽奖机"
            className="relative z-10 w-full object-contain drop-shadow-xl"
          />
        </El>
        <El
          ctx={ctx}
          layer="lottery"
          id="lottery.drawBtn"
          kind="button"
          label="抽奖按钮"
          value={p.lottery.drawLabel}
          inline
          className="absolute bottom-[28%] left-1/2 z-20 -translate-x-1/2"
        >
          <button
            type="button"
            className="rounded-full bg-[#8bdc9c] px-4 py-1.5 text-[13px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
          >
            {p.lottery.drawLabel}
          </button>
        </El>
      </div>
      <p className="mt-6 text-center text-[13px] font-semibold text-slate-500">{p.lottery.remainLabel}</p>
      <div className="mt-5 text-center">
        <El
          ctx={ctx}
          layer="lottery"
          id="lottery.myPrizeBtn"
          kind="button"
          label="我的奖品按钮"
          value={p.lottery.myPrizeLabel}
          inline
        >
          <button
            type="button"
            className="flex h-11 min-w-36 items-center justify-center rounded-full bg-[#f23555] px-8 text-[15px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
          >
            {p.lottery.myPrizeLabel}
          </button>
        </El>
      </div>
    </DecoratedCard>
  )
}

function TaskCard({ p, ctx }: LayerProps) {
  return (
    <DecoratedCard className="px-5 pb-7 pt-5">
      <h2 className="text-center text-[20px] font-black">
        <El ctx={ctx} layer="task" id="task.title" kind="text" label="标题" value={p.task.title} inline>
          {p.task.title}
        </El>
      </h2>
      <div className="mt-8 flex items-center gap-4">
        <div className="size-16 shrink-0 rounded-lg bg-slate-100 shadow-inner" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-black text-[#f23555]">
            <El ctx={ctx} layer="task" id="task.name" kind="text" label="任务名" value={p.task.name} inline>
              {p.task.name}
            </El>
          </h3>
          <p className="mt-1 text-[13px] font-medium text-[#8a6f76]">{p.task.desc}</p>
        </div>
        <div className="shrink-0 text-center">
          <El ctx={ctx} layer="task" id="task.cta" kind="button" label="按钮" value={p.task.cta} inline>
            <button
              type="button"
              className="rounded-full bg-[#f23555] px-5 py-2 text-[14px] font-bold text-white shadow-md transition-opacity hover:opacity-90"
            >
              {p.task.cta}
            </button>
          </El>
          <p className="mt-1.5 text-[13px] font-semibold text-[#8a6f76]">{p.task.reward}</p>
        </div>
      </div>
    </DecoratedCard>
  )
}

function RulesCard({ p, ctx }: LayerProps) {
  return (
    <DecoratedCard className="px-5 pb-7 pt-5">
      <h2 className="text-center text-[20px] font-black">
        <El ctx={ctx} layer="rules" id="rules.title" kind="text" label="标题" value={p.rules.title} inline>
          {p.rules.title}
        </El>
      </h2>
      <El ctx={ctx} layer="rules" id="rules.body" kind="text" label="规则正文" className="mt-7">
        <div className="space-y-5 text-pretty text-[14px] leading-relaxed text-[#6c545b]">
          {p.rules.sections.map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 text-[16px] font-black text-[#35151d]">{section.title}</h3>
              {section.lines.length === 1 ? (
                <p>{section.lines[0]}</p>
              ) : (
                <ul className="space-y-1.5 pl-5">
                  {section.lines.map((line) => (
                    <li key={line} className="list-disc">
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section>
            <h3 className="mb-2 text-[16px] font-black text-[#35151d]">{p.rules.contact.title}</h3>
            <p>{p.rules.contact.text}</p>
          </section>
        </div>
      </El>
    </DecoratedCard>
  )
}

function DecoratedCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`relative overflow-hidden rounded-[24px] bg-white shadow-sm ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(to_bottom,#fff0f4,rgba(255,255,255,0))]"
      />
      <span aria-hidden className="absolute left-4 top-4 text-[16px] text-[#ff87ac]">
        ★
      </span>
      <span aria-hidden className="absolute left-20 top-5 text-[15px] text-[#ffb39f]">
        ★
      </span>
      <span aria-hidden className="absolute right-14 top-4 text-[16px] text-[#91d7ea]">
        ★
      </span>
      <span aria-hidden className="absolute right-6 top-3 text-[22px]">
        🎈
      </span>
      <span aria-hidden className="absolute left-7 top-5 text-[22px]">
        🎁
      </span>
      <div className="relative z-10">{children}</div>
    </section>
  )
}

function FooterSearch({ p }: { p: MarketingH5PreviewConfig }) {
  return (
    <footer className="pb-[max(12px,env(safe-area-inset-bottom))] pt-6 text-center">
      <div className="mx-auto flex h-8 w-40 items-center rounded-md border border-black/35 bg-black/25 px-2 text-[13px] text-white">
        <span className="rounded bg-black px-1.5 py-0.5">{p.footer.searchTag}</span>
        <span className="min-w-0 flex-1 truncate px-2 text-[#2b171b]">{p.footer.keyword}</span>
        <Search size={15} className="text-black" strokeWidth={2.2} />
      </div>
      <p className="mt-2 text-[12px] text-white/35">{p.footer.disclaimer}</p>
    </footer>
  )
}
