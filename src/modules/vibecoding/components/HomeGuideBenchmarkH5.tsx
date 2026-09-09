import { useEffect, useId, useState, type ReactNode } from 'react'
import { ArrowLeft, Play, Share2 } from '@/shared/icons'
import './HomeGuideBenchmarkH5.css'

const stories = [
  {
    image: '/assets/marketing-king/figma/topic-lake-card.webp',
    duration: '03:03',
    title: '车轮丈量世界，自驾出行邂逅一路的惊喜',
    author: '生活焕新志',
  },
  {
    image: '/assets/marketing-king/figma/content-card-cabin.webp',
    duration: '04:09',
    title: '四季更迭，帐篷不变不同季节的露营体验',
    author: '国货好物局',
  },
  {
    image: '/bg/scenes/lifestyle-studio.png',
    duration: '02:46',
    title: '用一张桌子，把家的松弛感重新布置出来',
    author: '元气家居社',
  },
  {
    image: '/bg/scenes/lifestyle-cafe.png',
    duration: '04:09',
    title: '从灯光到收纳，找到耐看的生活秩序',
    author: '慢慢居所',
  },
]

function DecoratedTitle({ children, className = '' }: { children: string; className?: string }) {
  const uid = useId().replace(/:/g, '')
  return (
    <div className={`hgb-decorated-title ${className}`} aria-label={children}>
      <svg className="hgb-title-mountains" viewBox="0 0 74 24" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-mountain-wash`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7a84e" stopOpacity=".58" />
            <stop offset="1" stopColor="#f7e8af" stopOpacity=".08" />
          </linearGradient>
        </defs>
        <path d="M1 22 C8 20 14 6 23 3 C30 6 34 16 39 20 C43 17 48 11 53 10 C59 11 63 17 67 21 C69 19 71 18 73 18 V24 H1 Z" fill={`url(#${uid}-mountain-wash)`} />
        <path d="M31 22 C35 19 38 15 42 15 C46 15 49 19 52 22" fill="none" stroke="#dfbd78" strokeOpacity=".4" strokeWidth=".8" />
      </svg>
      <h2>{children}</h2>
      <svg className="hgb-title-lines" viewBox="0 0 78 24" aria-hidden="true">
        <path d="M2 7 H76 M14 13 H69 M30 19 H66" />
        <path d="M55 14 C44 14 44 21 55 21 H66" />
      </svg>
    </div>
  )
}

function SectionHeading({ children }: { children: string }) {
  return <DecoratedTitle className="hgb-section-heading">{children}</DecoratedTitle>
}

const panelShapes = {
  intro: {
    viewBox: '0 0 390 160',
    outer: 'M28 4 H362 Q374 4 374 14 V19 H381 Q388 19 388 28 V132 Q388 156 362 156 H28 Q2 156 2 132 V28 Q2 19 9 19 H16 V14 Q16 4 28 4 Z',
    inner: 'M30 10 H360 Q368 10 368 20 V25 H376 Q382 25 382 33 V129 Q382 149 359 149 H31 Q8 149 8 129 V33 Q8 25 14 25 H22 V20 Q22 10 30 10 Z',
  },
  brief: {
    viewBox: '0 0 390 460',
    outer: 'M151 5 H239 Q251 5 258 15 Q263 21 267 37 H332 Q344 37 344 51 V61 H365 Q388 61 388 86 V430 Q388 456 362 456 H28 Q2 456 2 430 V86 Q2 61 25 61 H46 V51 Q46 37 58 37 H123 Q127 21 132 15 Q139 5 151 5 Z',
    inner: 'M153 12 H237 Q246 12 252 21 Q256 27 260 44 H329 Q337 44 337 54 V68 H362 Q381 68 381 88 V427 Q381 449 359 449 H31 Q9 449 9 427 V88 Q9 68 28 68 H53 V54 Q53 44 61 44 H130 Q134 27 138 21 Q144 12 153 12 Z',
  },
  rewards: {
    viewBox: '0 0 390 220',
    outer: 'M26 4 H364 Q379 4 379 19 V27 H386 V193 H379 V201 Q379 216 364 216 H26 Q11 216 11 201 V193 H4 V27 H11 V19 Q11 4 26 4 Z',
    inner: 'M29 11 H361 Q372 11 372 22 V34 H379 V186 H372 V198 Q372 209 361 209 H29 Q18 209 18 198 V186 H11 V34 H18 V22 Q18 11 29 11 Z',
  },
} as const

function OrnatePanel({ variant, className = '', children }: { variant: keyof typeof panelShapes; className?: string; children: ReactNode }) {
  const uid = useId().replace(/:/g, '')
  const shape = panelShapes[variant]
  return (
    <section className={`hgb-ornate-panel is-${variant} ${className}`}>
      <svg viewBox={shape.viewBox} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-wash`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffef8" stopOpacity=".94" />
            <stop offset=".55" stopColor="#fffdf6" stopOpacity=".9" />
            <stop offset="1" stopColor="#f9dda1" stopOpacity=".58" />
          </linearGradient>
          <pattern id={`${uid}-clouds`} width="28" height="18" patternUnits="userSpaceOnUse">
            <path d="M0 17 C1 10 6 5 14 5 C22 5 27 10 28 17" fill="none" stroke="#d6ad61" strokeWidth=".65" opacity=".58" />
            <path d="M6 17 C7 13 10 10 14 10 C18 10 21 13 22 17" fill="none" stroke="#d6ad61" strokeWidth=".52" opacity=".48" />
            <path d="M10 17 C10 15 12 13 14 13 C16 13 18 15 18 17" fill="none" stroke="#d6ad61" strokeWidth=".45" opacity=".42" />
          </pattern>
          <clipPath id={`${uid}-clip`}><path d={shape.outer} /></clipPath>
        </defs>
        <path className="hgb-panel-fill" d={shape.outer} fill={`url(#${uid}-wash)`} />
        <rect className="hgb-panel-clouds" x="0" y="55%" width="390" height="45%" fill={`url(#${uid}-clouds)`} clipPath={`url(#${uid}-clip)`} />
        <path className="hgb-panel-inner" d={shape.inner} />
      </svg>
      <div className="hgb-ornate-content">{children}</div>
    </section>
  )
}

function DirectionTab({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  const uid = useId().replace(/:/g, '')
  return (
    <button className={active ? 'is-active' : ''} type="button" role="tab" aria-selected={active} onClick={onClick}>
      <svg viewBox="0 0 144 32" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-ticket`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={active ? '#fffdf6' : '#ffffff'} stopOpacity={active ? '.98' : '.68'} />
            <stop offset="1" stopColor={active ? '#ffe9a4' : '#fffaf0'} stopOpacity={active ? '.94' : '.52'} />
          </linearGradient>
        </defs>
        <path className="hgb-ticket-fill" d="M10 1 H134 L143 9 V23 L134 31 H10 L1 23 V9 Z" fill={`url(#${uid}-ticket)`} />
        <path className="hgb-ticket-line" d="M11 4 H132 L139 10 V22 L132 28 H11 L5 22 V10 Z" />
        <path className="hgb-ticket-fold" d="M1 9 L10 1 L18 15 L10 31 L1 23 Z" />
        <path className="hgb-ticket-mountains" d="M8 24 L17 12 L23 21 L29 16 L37 25 Z M25 25 L33 18 L41 25 Z" />
      </svg>
      <span>{children}</span>
    </button>
  )
}

/** 可从外部播种的交互态 —— 工坊的状态画布靠它并排铺出同一版的不同状态。 */
export type HomeGuideState = { direction?: 'one' | 'two'; submitted?: boolean }

export default function HomeGuideBenchmarkH5({ state }: { state?: HomeGuideState } = {}) {
  const [direction, setDirection] = useState<'one' | 'two'>(state?.direction ?? 'one')
  const [submitted, setSubmitted] = useState(state?.submitted ?? false)

  useEffect(() => {
    const previousTitle = document.title
    document.title = '双11家居焕新指南｜H5 Benchmark'
    return () => { document.title = previousTitle }
  }, [])

  const sharePage = async () => {
    const payload = { title: document.title, url: window.location.href }
    if (navigator.share) {
      try { await navigator.share(payload) } catch { /* Native share dismissed. */ }
      return
    }
    await navigator.clipboard?.writeText(window.location.href)
  }

  return (
    <div className="hgb-shell">
      <main className="hgb-page">
        <nav className="hgb-nav" aria-label="页面导航">
          <button type="button" aria-label="返回"><ArrowLeft size={18} /></button>
          <div className="hgb-publisher"><b>头条</b><span>今日头条</span><i /> <span>经济观察报</span></div>
          <button type="button" aria-label="分享" onClick={sharePage}><Share2 size={18} /></button>
        </nav>

        <header className="hgb-hero">
          <p className="hgb-kicker">2024 双11美好生活季</p>
          <h1>双11家居焕新指南</h1>
          <span>焕新生活 · 国货正当时</span>
          <div className="hgb-hero-stage">
            <b aria-hidden="true">居</b>
            <img src="/assets/h5-benchmark/home-renewal-hero-alpha-v4.png" alt="奶油色沙发与暖橙色家居陈设" />
          </div>
        </header>

        <OrnatePanel variant="intro" className="hgb-intro">
          <DecoratedTitle className="hgb-panel-heading">活动介绍</DecoratedTitle>
          <p>双十一再度来袭，今日头条联动经济观察报联合发起「双11头条国货精品计划」，输出家居焕新指南，更有双11红包雨，抢赢惊喜好礼。双十一囤货好物大盘点，一起来分享！</p>
        </OrnatePanel>

        <SectionHeading>发文方向</SectionHeading>

        <OrnatePanel variant="brief" className="hgb-brief-card">
          <span className="hgb-pin" aria-hidden="true" />
          <h2>双十一创作赛道已开启<br />流量收益双丰收</h2>
          <div className="hgb-tabs" role="tablist" aria-label="发文方向">
            <DirectionTab active={direction === 'one'} onClick={() => setDirection('one')}>方向一</DirectionTab>
            <DirectionTab active={direction === 'two'} onClick={() => setDirection('two')}>方向二</DirectionTab>
          </div>
          <p>{direction === 'one' ? '分享你推荐的国货居家好物，品类不限；说清体验感受，分享真实使用场景、店铺照片、材质说明、产品型号与购买价格。' : '记录一处真实的家居焕新过程，讲清改造前后的选择、预算与体验，让实用经验帮助更多人。'}</p>
          <div className="hgb-share-reward">
            <img src="/assets/h5-benchmark/home-renewal-hero-alpha-v4.png" alt="家居好物示意" />
            <div><h3>分享得流量券</h3><small>活动时间</small><strong>2024.10.20—2024.11.10</strong><button type="button" onClick={() => setSubmitted(true)}>{submitted ? '已参与' : '点击去分享'}</button></div>
          </div>
        </OrnatePanel>

        <OrnatePanel variant="rewards" className="hgb-rewards">
          <span className="hgb-hanger is-left" aria-hidden="true" />
          <span className="hgb-hanger is-right" aria-hidden="true" />
          <DecoratedTitle className="hgb-panel-heading is-compact">投稿奖励</DecoratedTitle>
          <div className="hgb-reward-grid">
            <article><h3>阳光普惠奖</h3><strong>10000<small>元</small></strong><p>满足投稿要求，且投稿作品累计阅读量≥100</p></article>
            <article><h3>优质内容奖</h3><strong>10000<small>元/人</small></strong><p>内容优质突出<br />共 15 名</p></article>
          </div>
        </OrnatePanel>

        <SectionHeading>精彩内容</SectionHeading>

        <section className="hgb-feed" aria-label="精彩内容">
          {stories.map((story) => (
            <article key={story.title}>
              <div className="hgb-cover"><img src={story.image} alt="" /><span><Play size={10} /></span><small>{story.duration}</small></div>
              <h3>{story.title}</h3>
              <p><i>{story.author.slice(0, 1)}</i>{story.author}</p>
            </article>
          ))}
        </section>

        <button className={`hgb-submit ${submitted ? 'is-submitted' : ''}`} type="button" onClick={() => setSubmitted(true)}>
          {submitted ? '已加入投稿计划' : '立即投稿'}
        </button>

        <footer className="hgb-footer">
          <div className="hgb-footer-brand"><b>头条</b><strong>今日头条</strong></div>
          <p>合作伙伴</p>
          <div className="hgb-partners"><span>经济观察报</span><span>红旗</span><span>顺图</span></div>
          <small>本活动与 Apple Inc. 无关</small>
        </footer>
      </main>
    </div>
  )
}
