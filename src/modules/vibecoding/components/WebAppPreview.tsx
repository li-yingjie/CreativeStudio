import { ArrowUpRight } from '@/shared/icons'
import { WEB_PAGES } from './ProjectProductView'

/**
 * 通用 React 站点 — 浏览器内预览 UI
 *
 * A self-contained mock of a generic multi-page React + Vite site
 * (首页 / 作品 / 关于 / 联系). Controlled by `route` (the active page
 * label) and `onNavigate`; rendered as the right-side 产物预览 for
 * `web-app` projects. Page switching is driven both by the left product
 * view and by this site's own nav. Static, no real data.
 */
const WORKS = [
  { tag: '品牌官网', title: '微光设计工作室', desc: '以排版为核心的极简官网', year: '2026' },
  { tag: '数据看板', title: '增长分析控制台', desc: '实时指标 + 多维下钻可视化', year: '2025' },
  { tag: '互动 H5', title: '春日限定活动页', desc: '滚动叙事 + 轻交互落地页', year: '2025' },
  { tag: '电商', title: '生活方式选物店', desc: '克制的商品陈列与结算流', year: '2024' },
  { tag: '作品集', title: '摄影师个人站', desc: '全屏图片网格 + 懒加载', year: '2024' },
  { tag: '工具', title: '配色灵感生成器', desc: '一键生成可访问的配色板', year: '2024' },
] as const

interface WebAppPreviewProps {
  /** Active page label; null falls back to the first page (首页). */
  route: string | null
  /** Navigate to another page — wired to the same state the left
   *  product view drives, so both stay in sync. */
  onNavigate: (label: string) => void
}

export default function WebAppPreview({ route, onNavigate }: WebAppPreviewProps) {
  const active = route ?? '首页'
  return (
    <div className="flex min-h-full flex-col bg-white text-[#16161a]">
      {/* ── Nav ── */}
      <header className="flex shrink-0 items-center justify-between px-10 py-5">
        <span className="text-[15px] font-semibold tracking-tight">STUDIO°</span>
        <nav className="flex items-center gap-7 text-[13px]">
          {WEB_PAGES.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onNavigate(p.label)}
              className={`transition-colors ${
                p.label === active
                  ? 'text-[#16161a]'
                  : 'text-[#16161a]/45 hover:text-[#16161a]/75'
              }`}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Routed page ── */}
      <div className="flex-1">
        {active === '首页' && <HomePage onNavigate={onNavigate} />}
        {active === '作品' && <WorksPage />}
        {active === '关于' && <AboutPage />}
        {active === '联系' && <ContactPage />}
      </div>

      {/* ── Footer ── */}
      <footer className="flex shrink-0 items-center justify-between border-t border-black/[0.07] px-10 py-6 text-[12px] text-[#16161a]/40">
        <span>© 2026 STUDIO°</span>
        <span>用 React 构建</span>
      </footer>
    </div>
  )
}

/* ─── Routes ─── */

function HomePage({ onNavigate }: { onNavigate: (label: string) => void }) {
  return (
    <>
      <section className="px-10 pb-16 pt-14">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#16161a]/35">
          React · Vite · TypeScript
        </p>
        <h1 className="max-w-[560px] text-[40px] font-semibold leading-[1.12] tracking-tight">
          用代码，把每一个想法打磨成作品。
        </h1>
        <p className="mt-5 max-w-[420px] text-[14px] leading-relaxed text-[#16161a]/55">
          一个通用 React 站点模板 —— 首页、作品、关于、联系，开箱即用的多页结构。
        </p>
        <button
          type="button"
          onClick={() => onNavigate('作品')}
          className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#16161a] px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          查看作品
          <ArrowUpRight size={15} strokeWidth={2} />
        </button>
      </section>

      <section className="border-t border-black/[0.07] px-10 py-12">
        <div className="mb-7 flex items-baseline justify-between">
          <h2 className="text-[19px] font-semibold tracking-tight">精选作品</h2>
          <button
            type="button"
            onClick={() => onNavigate('作品')}
            className="text-[12px] text-[#16161a]/40 transition-colors hover:text-[#16161a]/70"
          >
            全部 →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {WORKS.slice(0, 3).map((w) => (
            <WorkCard key={w.title} {...w} />
          ))}
        </div>
      </section>
    </>
  )
}

function WorksPage() {
  return (
    <section className="px-10 pb-14 pt-12">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#16161a]/35">
        Selected Works · 2024 — 2026
      </p>
      <h1 className="mb-9 text-[30px] font-semibold tracking-tight">作品</h1>
      <div className="grid grid-cols-3 gap-5">
        {WORKS.map((w) => (
          <WorkCard key={w.title} {...w} />
        ))}
      </div>
    </section>
  )
}

function AboutPage() {
  const STATS = [
    { num: '48', unit: '个项目' },
    { num: '6', unit: '年经验' },
    { num: '12', unit: '位伙伴' },
  ]
  return (
    <section className="px-10 pb-14 pt-12">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#16161a]/35">
        About
      </p>
      <h1 className="max-w-[480px] text-[30px] font-semibold leading-[1.18] tracking-tight">
        我们是一支相信「克制」的小工作室。
      </h1>
      <p className="mt-5 max-w-[460px] text-[14px] leading-[1.8] text-[#16161a]/55">
        STUDIO° 专注于品牌官网、数据产品与互动体验。我们偏爱清晰的排版、
        恰当的留白，以及经得起推敲的细节——好设计应当安静地解决问题。
      </p>
      <div className="mt-10 flex gap-12 border-t border-black/[0.07] pt-8">
        {STATS.map((s) => (
          <div key={s.unit}>
            <div className="text-[28px] font-semibold tracking-tight">{s.num}</div>
            <div className="mt-0.5 text-[12px] text-[#16161a]/45">{s.unit}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ContactPage() {
  const CHANNELS = [
    { k: '邮箱', v: 'hello@studio.design' },
    { k: '微信', v: 'studio-degree' },
    { k: '所在地', v: '上海 · 徐汇' },
  ]
  return (
    <section className="px-10 pb-14 pt-12">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#16161a]/35">
        Contact
      </p>
      <h1 className="max-w-[460px] text-[30px] font-semibold leading-[1.18] tracking-tight">
        有想法？聊聊看。
      </h1>
      <p className="mt-5 max-w-[420px] text-[14px] leading-relaxed text-[#16161a]/55">
        无论是一个完整的产品，还是一页设计，我们都乐意倾听。
      </p>
      <div className="mt-9 flex flex-col gap-px overflow-hidden rounded-xl border border-black/[0.07]">
        {CHANNELS.map((c) => (
          <div
            key={c.k}
            className="flex items-center justify-between bg-[#fafafa] px-5 py-3.5 text-[13px]"
          >
            <span className="text-[#16161a]/45">{c.k}</span>
            <span className="font-medium">{c.v}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function WorkCard({
  tag,
  title,
  desc,
  year,
}: {
  tag: string
  title: string
  desc: string
  year: string
}) {
  return (
    <article>
      <div className="mb-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-[#f1f1f4] to-[#e2e2ea]" />
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-medium uppercase tracking-wider text-[#16161a]/40">
          {tag}
        </span>
        <span className="text-[10.5px] text-[#16161a]/30">{year}</span>
      </div>
      <h3 className="mt-1 text-[14px] font-medium">{title}</h3>
      <p className="mt-0.5 text-[12px] leading-relaxed text-[#16161a]/50">{desc}</p>
    </article>
  )
}
