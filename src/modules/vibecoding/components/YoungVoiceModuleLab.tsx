import { Check } from '@/shared/icons'
import './YoungVoiceModuleLab.css'

const collectionItems = [
  { id: '01', name: '同心结', price: '1 钻', image: '/assets/young-voice/gift-heart-knot.png', done: true },
  { id: '02', name: '为你簪花', price: '9 钻', image: '/assets/young-voice/gift-hairpin-flower.png', done: true },
  { id: '03', name: '一丈红', price: '99 钻', image: '/assets/young-voice/gift-red-stage.png', done: false },
]

function VectorPaper({ variant }: { variant: 'intro' | 'sticky' | 'list' | 'footer' | 'tip' }) {
  const shapes = {
    intro: { viewBox: '0 0 380 255', path: 'M8 14 L367 4 L379 15 L376 238 L359 250 L14 245 L3 227 Z' },
    sticky: { viewBox: '0 0 380 168', path: 'M13 8 L352 3 L372 15 L368 151 L351 164 L5 154 L2 22 Z' },
    list: { viewBox: '0 0 380 288', path: 'M7 18 L367 7 L377 18 L374 272 L358 284 L13 278 L3 261 Z' },
    footer: { viewBox: '0 0 380 145', path: 'M4 13 L365 3 L378 16 L373 129 L354 141 L8 135 L2 120 Z' },
    tip: { viewBox: '0 0 380 65', path: 'M8 8 L369 3 L377 11 L372 55 L359 62 L13 60 L4 51 Z' },
  }
  const shape = shapes[variant]
  const roughId = `yvml-rough-${variant}`
  const grainId = `yvml-grain-${variant}`
  return (
    <svg className={`yvml-vector-paper is-${variant}`} viewBox={shape.viewBox} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id={roughId} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.055" numOctaves="2" seed={variant.length * 7} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="B" />
        </filter>
        <filter id={grainId} x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.58" numOctaves="3" seed={variant.length * 11} result="grain" />
          <feColorMatrix in="grain" type="matrix" values=".7 0 0 0 0  0 .7 0 0 0  0 0 .7 0 0  0 0 0 .16 0" result="softGrain" />
          <feBlend in="SourceGraphic" in2="softGrain" mode="multiply" />
        </filter>
      </defs>
      <path className="yvml-vector-shadow" d={shape.path} transform="translate(5 6)" filter={`url(#${roughId})`} />
      <path className="yvml-vector-fill" d={shape.path} filter={`url(#${grainId})`} />
      <path className="yvml-vector-edge is-ghost" d={shape.path} transform="translate(-1 1)" filter={`url(#${roughId})`} />
      <path className="yvml-vector-edge" d={shape.path} filter={`url(#${roughId})`} />
    </svg>
  )
}

function SectionTitleRibbon() {
  return (
    <div className="yvml-section-ribbon">
      <svg viewBox="0 0 380 72" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="yvml-ribbon-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8f7eb" />
            <stop offset=".55" stopColor="#eceee3" />
            <stop offset="1" stopColor="#dfe4dc" />
          </linearGradient>
          <linearGradient id="yvml-ribbon-fold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9d1cc" />
            <stop offset="1" stopColor="#f5f4e8" />
          </linearGradient>
        </defs>
        <path className="yvml-ribbon-shadow" d="M13 12 L299 5 L310 14 L304 45 L15 51 L3 39 Z" transform="translate(4 4)" />
        <path className="yvml-ribbon-paper" d="M13 8 L299 3 L307 11 L301 41 L15 47 L2 35 Z" />
        <path className="yvml-ribbon-fold" d="M2 35 L15 47 L18 34 Z" />
        <path className="yvml-ribbon-fold is-dark" d="M299 3 L307 11 L299 17 Z" />
        <path className="yvml-ribbon-shadow" d="M218 38 L365 34 L373 42 L369 68 L221 72 L210 61 Z" transform="translate(4 3)" />
        <path className="yvml-ribbon-paper" d="M218 34 L365 31 L371 39 L366 65 L222 68 L211 58 Z" />
        <path className="yvml-ribbon-fold" d="M211 58 L222 68 L225 55 Z" />
        <path className="yvml-ribbon-fold is-dark" d="M365 31 L371 39 L364 44 Z" />
        <path className="yvml-ribbon-crease" d="M18 34 L298 29 M225 55 L364 51" />
      </svg>
      <h1 id="yvml-title"><span>2026 Young 声音藏品</span><b>限时收集计划</b></h1>
    </div>
  )
}

function GiftCollectionMotherboard() {
  return (
    <article className="yvml-board yvml-vector-board" aria-labelledby="yvml-title">
      <header className="yvml-vector-intro">
        <VectorPaper variant="intro" />
        <SectionTitleRibbon />
        <div className="yvml-vector-content">
          <p className="yvml-vector-lead">深入音乐现场，唤醒声线能量<br />集齐三件礼物，完成唱歌任务</p>
          <p className="yvml-vector-english">Coming With Your Voice</p>
          <p className="yvml-vector-campaign"><strong>08.28—09.01</strong> 活动期间<br />在唱歌直播间收集 <mark>三件指定礼物</mark><br />同步完成声音浓度任务</p>
        </div>
      </header>

      <section className="yvml-vector-sticky" aria-label="活动奖励">
        <VectorPaper variant="sticky" />
        <span className="yvml-vector-tape" aria-hidden="true" />
        <div className="yvml-vector-content">
          <h2>〔基础收集〕</h2>
          <p><strong>三类礼物，各收一件。</strong>活动期间，在唱歌直播间分别收到以下指定礼物；<mark>顺序不限</mark>，与唱歌浓度任务同步累计。</p>
        </div>
      </section>

      <section className="yvml-vector-list" aria-label="平行礼物收集清单">
        <VectorPaper variant="list" />
        <span className="yvml-vector-corner is-left" aria-hidden="true" />
        <span className="yvml-vector-corner is-right" aria-hidden="true" />
        <div className="yvml-vector-list-content">
        {collectionItems.map((item) => (
          <article className={`yvml-vector-gift ${item.done ? 'is-done' : ''}`} key={item.id}>
            <figure><img src={item.image} alt={`${item.name}礼物`} /></figure>
            <div className="yvml-vector-gift-copy">
              <small>COLLECT {item.id}</small>
              <h3>{item.name}</h3>
              <p>活动期间累计收到 1 件</p>
            </div>
            <div className="yvml-vector-gift-meta"><b>*1</b><span>{item.price}</span><em>{item.done ? <Check size={10} /> : null}{item.done ? '已收集' : '待收集'}</em></div>
          </article>
        ))}
        </div>
      </section>

      <section className="yvml-vector-footer">
        <VectorPaper variant="footer" />
        <div className="yvml-vector-content">
          <h2>〔声音浓度激励〕</h2>
          <p>活动期间，完成有效开播、累计演唱时长与完整歌曲任务，声音浓度将同步增长。</p>
          <strong>72<small>%</small></strong>
        </div>
      </section>

      <aside className="yvml-vector-tip"><VectorPaper variant="tip" /><span>Tips：礼物任务与唱歌任务并行进行，完成时间以系统记录为准。</span></aside>
    </article>
  )
}

export default function YoungVoiceModuleLab() {
  return (
    <main className="yvml-lab">
      <header className="yvml-lab-heading">
        <small>MODULE VALIDATION · 01</small>
        <h1>礼物收集模块母板</h1>
        <p>只验证模块构图、字体角色、资产归属与平行关系；暂不扩展到整页。</p>
      </header>
      <div className="yvml-comparison">
        <figure className="yvml-reference">
          <figcaption><span>REFERENCE</span><b>构图与节奏参照</b></figcaption>
          <img src="/assets/young-voice/benchmark-music-module-reference.jpg" alt="音乐企划 benchmark 内容模块" />
        </figure>
        <section className="yvml-result" aria-label="模块母板结果">
          <div className="yvml-result-label"><span>HYBRID RECONSTRUCTION 02</span><b>SVG 轮廓 + HTML 内容</b></div>
          <GiftCollectionMotherboard />
        </section>
      </div>
    </main>
  )
}
