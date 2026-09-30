import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Check, ChevronRight, Clock, Info, Share2 } from '@/shared/icons'
import './YoungVoiceXhsRebuild.css'

const giftCollection = [
  { code: '01', name: '同心结', price: '1 钻', image: '/assets/young-voice/gift-heart-knot.png', complete: true },
  { code: '02', name: '为你簪花', price: '9 钻', image: '/assets/young-voice/gift-hairpin-flower.png', complete: true },
  { code: '03', name: '一丈红', price: '99 钻', image: '/assets/young-voice/gift-red-stage.png', complete: false },
]

const singingTasks = [
  { code: '01', name: '有效开播', detail: '完成 1 场有效唱歌直播', value: '1 / 1', progress: 100 },
  { code: '02', name: '累计演唱', detail: '唱歌时长累计达到 60 分钟', value: '42 / 60', progress: 70 },
  { code: '03', name: '完整唱完', detail: '完整演唱 5 首歌曲', value: '3 / 5', progress: 60 },
]

function TornPanel({
  className,
  tone,
  children,
}: {
  className: string
  tone: 'blue' | 'navy' | 'yellow' | 'paper'
  children: ReactNode
}) {
  const filterId = `xhs-grain-${tone}`
  return (
    <section className={`xhs-torn ${className} is-${tone}`}>
      <svg viewBox="0 0 380 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-5%" y="-8%" width="110%" height="116%">
            <feTurbulence type="fractalNoise" baseFrequency="0.46" numOctaves="3" seed={tone.length * 9} result="grain" />
            <feColorMatrix in="grain" type="matrix" values=".62 0 0 0 0  0 .62 0 0 0  0 0 .62 0 0  0 0 0 .14 0" result="softGrain" />
            <feBlend in="SourceGraphic" in2="softGrain" mode="multiply" />
          </filter>
        </defs>
        <path className="xhs-torn-shadow" d="M9 15 L43 7 L83 12 L121 5 L163 10 L204 4 L246 9 L285 5 L326 12 L368 7 L376 26 L371 59 L376 93 L372 132 L378 166 L369 210 L329 215 L287 211 L245 217 L204 212 L164 218 L124 211 L84 216 L43 210 L7 214 L3 178 L8 141 L4 104 L9 67 L4 31 Z" transform="translate(5 6)" />
        <path className="xhs-torn-fill" d="M9 15 L43 7 L83 12 L121 5 L163 10 L204 4 L246 9 L285 5 L326 12 L368 7 L376 26 L371 59 L376 93 L372 132 L378 166 L369 210 L329 215 L287 211 L245 217 L204 212 L164 218 L124 211 L84 216 L43 210 L7 214 L3 178 L8 141 L4 104 L9 67 L4 31 Z" filter={`url(#${filterId})`} />
        <path className="xhs-torn-edge xhs-torn-edge-back" d="M9 15 L43 7 L83 12 L121 5 L163 10 L204 4 L246 9 L285 5 L326 12 L368 7 L376 26 L371 59 L376 93 L372 132 L378 166 L369 210 L329 215 L287 211 L245 217 L204 212 L164 218 L124 211 L84 216 L43 210 L7 214 L3 178 L8 141 L4 104 L9 67 L4 31 Z" transform="translate(-1 2)" />
        <path className="xhs-torn-edge" d="M9 15 L43 7 L83 12 L121 5 L163 10 L204 4 L246 9 L285 5 L326 12 L368 7 L376 26 L371 59 L376 93 L372 132 L378 166 L369 210 L329 215 L287 211 L245 217 L204 212 L164 218 L124 211 L84 216 L43 210 L7 214 L3 178 L8 141 L4 104 L9 67 L4 31 Z" />
      </svg>
      <div className="xhs-torn-content">{children}</div>
    </section>
  )
}

function FoldedHeading({ eyebrow, subline, children, align = 'left' }: { eyebrow: string; subline: string; children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <header className={`xhs-folded-heading is-${align}`}>
      <svg viewBox="0 0 360 84" preserveAspectRatio="none" aria-hidden="true">
        <path className="xhs-fold-shadow" d="M15 15 L307 7 L316 15 L309 49 L18 56 L6 44 Z" transform="translate(5 6)" />
        <path className="xhs-fold-paper" d="M15 9 L307 3 L314 11 L307 45 L18 51 L5 39 Z" />
        <path className="xhs-fold-face" d="M5 39 L18 51 L21 37 Z M307 3 L314 11 L306 17 Z" />
        <path className="xhs-fold-shadow" d="M205 46 L346 41 L354 49 L350 77 L211 81 L198 69 Z" transform="translate(5 4)" />
        <path className="xhs-fold-paper" d="M205 42 L346 38 L352 46 L347 73 L211 77 L199 65 Z" />
        <path className="xhs-fold-face" d="M199 65 L211 77 L215 63 Z M346 38 L352 46 L345 51 Z" />
        <path className="xhs-fold-crease" d="M21 38 L306 33 M215 64 L345 59" />
      </svg>
      <small>{eyebrow}</small>
      <h2>{children}</h2>
      <span className="xhs-folded-subtitle">{subline}</span>
    </header>
  )
}

function Tape({ className = '' }: { className?: string }) {
  return <span className={`xhs-tape ${className}`} aria-hidden="true" />
}

/** 可从外部播种的交互态 —— 工坊的状态画布靠它并排铺出同一版的不同状态。 */
export type YoungVoiceXhsState = { rulesOpen?: boolean }

export default function YoungVoiceXhsRebuild({ state }: { state?: YoungVoiceXhsState } = {}) {
  const [rulesOpen, setRulesOpen] = useState(state?.rulesOpen ?? false)

  useEffect(() => {
    const oldTitle = document.title
    document.title = 'Young 声音藏品限时收集计划'
    return () => { document.title = oldTitle }
  }, [])

  const shareCampaign = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Young 声音藏品限时收集计划', text: '集齐声音藏品，完成唱歌任务，冲刺 9.3 Young 播派对。', url: window.location.href })
      } catch {
        // Closing a native share sheet is not an error state.
      }
      return
    }
    await navigator.clipboard?.writeText(window.location.href)
    toast.success('活动链接已复制')
  }

  return (
    <div className="xhs-shell">
      <main className="xhs-page">
        <section className="xhs-hero" aria-labelledby="xhs-page-title">
          <img className="xhs-hero-art" src="/assets/young-voice/hero-anime-room-title-v2.jpg" alt="" />
          <div className="xhs-hero-vignette" aria-hidden="true" />
          <div className="xhs-hero-brand"><span>YOUNG</span><b>MUSIC</b></div>
          <button className="xhs-share" type="button" onClick={shareCampaign} aria-label="分享活动"><Share2 size={19} /></button>
          <h1 className="xhs-hero-heading-sr" id="xhs-page-title">Young 声音藏品收集计划</h1>
          <span className="xhs-xhs-tag">唱歌主播限定</span>
          <div className="xhs-hero-bottom"><b>“</b><span>一起唱回属于我们的音乐客厅</span><b>”</b></div>
        </section>

        <div className="xhs-story">
          <section className="xhs-prologue">
            <FoldedHeading eyebrow="2026 · YOUNG MUSIC ARCHIVE" subline="08.28—09.01">限时声音藏品计划</FoldedHeading>
            <TornPanel className="xhs-prologue-card" tone="blue">
              <span className="xhs-detail-bracket is-left" aria-hidden="true" />
              <span className="xhs-detail-bracket is-right" aria-hidden="true" />
              <p className="xhs-lead">深入音乐现场，唤醒声线能量<br />集齐三件礼物，<mark>完成唱歌任务</mark></p>
              <p className="xhs-english">Coming With Your Voice</p>
              <p className="xhs-period"><strong>08.28—09.01</strong> 活动期间</p>
              <p>最快完成全部任务的主播<br />有机会参与 <mark>09.03 Young 播派对</mark></p>
            </TornPanel>
          </section>

          <section className="xhs-collection" id="xhs-collection">
            <span className="xhs-paper-plane is-collection-plane" aria-hidden="true" />
            <div className="xhs-yellow-note">
              <Tape className="is-blue" />
              <small>ACTIVITY NOTE</small>
              <h2>〔基础收集〕</h2>
              <p><b>三类礼物，各收一件。</b>活动期间，在唱歌直播间分别收到以下指定礼物；<mark>顺序不限</mark>，与声音浓度任务同步累计。</p>
            </div>

            <TornPanel className="xhs-gift-board" tone="navy">
              <Tape className="is-left" />
              <Tape className="is-right" />
              <span className="xhs-gift-board-label">COLLECT LIST</span>
              <span className="xhs-gift-board-date">08.28—09.01</span>
              <div className="xhs-gift-list">
                {giftCollection.map((gift, index) => (
                  <article className={`xhs-gift-row is-${index + 1}`} key={gift.code}>
                    <figure><img src={gift.image} alt={`${gift.name}礼物`} /></figure>
                    <div className="xhs-gift-copy"><small>COLLECT {gift.code}</small><h3>{gift.name}</h3><p>活动期间累计收到 1 件</p></div>
                    <div className="xhs-gift-meta"><b>×1</b><span>{gift.price}</span><em className={gift.complete ? 'is-done' : ''}>{gift.complete && <Check size={10} />}{gift.complete ? '已收集' : '待收集'}</em></div>
                  </article>
                ))}
              </div>
            </TornPanel>

            <TornPanel className="xhs-density-summary" tone="blue">
              <div><small>PARALLEL MISSION</small><h2>声音浓度同步累计</h2><p>礼物收集和唱歌任务并行完成</p></div>
              <strong>72<small>%</small></strong>
            </TornPanel>
          </section>

          <section className="xhs-missions">
            <FoldedHeading eyebrow="VOICE DENSITY · 02" subline="三项同步累计" align="right">唱歌浓度任务</FoldedHeading>
            <div className="xhs-mission-intro"><span>任务进行中</span><p><mark>有效开播、演唱时长</mark>和完整歌曲共同形成你的声音浓度。</p></div>
            <div className="xhs-task-stack">
              {singingTasks.map((task, index) => (
                <article className={`xhs-task-card is-${index + 1}`} key={task.code}>
                  <span className="xhs-task-code">{task.code}</span>
                  <div><small>TEST ITEM · {task.code}</small><h3>{task.name}</h3><p>{task.detail}</p><i><b style={{ width: `${task.progress}%` }} /></i></div>
                  <strong>{task.value}</strong>
                </article>
              ))}
            </div>
            <div className="xhs-score-strip"><small>CURRENT VOICE DENSITY</small><strong>72%</strong><span>距离完成还差两项进度</span></div>
          </section>

          <section className="xhs-archive">
            <FoldedHeading eyebrow="MY MUSIC ARCHIVE · 03" subline="当前进度 2/3">封存我的声音档案</FoldedHeading>
            <TornPanel className="xhs-archive-card" tone="blue">
              <div className="xhs-record" aria-hidden="true"><i /><b>Y</b></div>
              <div className="xhs-archive-copy"><small>COLLECTION STATUS</small><strong>2<em>/3</em></strong><h3>还差「一丈红」</h3><p>声音浓度任务正在同步累计</p></div>
              <div className="xhs-archive-stamps">
                {giftCollection.map((gift) => <figure className={gift.complete ? 'is-done' : ''} key={gift.code}><img src={gift.image} alt="" /><figcaption>{gift.name}</figcaption></figure>)}
              </div>
            </TornPanel>
            <div className="xhs-curator-note"><Tape /><small>CURATOR'S NOTE</small><h3>完成时间如何记录？</h3><p>三件礼物和全部唱歌任务首次同时达成时，系统自动记录档案封存时间。</p></div>
          </section>

          <section className="xhs-party">
            <div className="xhs-party-date"><span>09.03</span><small>SPECIAL INVITATION</small></div>
            <TornPanel className="xhs-party-card" tone="navy">
              <div className="xhs-ticket-art" aria-hidden="true"><span>YOUNG</span><b>09<br />03</b><i /></div>
              <div className="xhs-party-copy"><small>FINAL DESTINATION</small><h2>Young<br />播派对</h2><p>最快完成声音档案且通过平台审核的主播，将有机会收到派对邀请。</p></div>
              <div className="xhs-party-status"><Clock size={15} /><span>我的状态</span><strong>任务进行中</strong></div>
              <p className="xhs-disclaimer">* 完成顺序不代表最终入选结果</p>
            </TornPanel>
          </section>

          <button className="xhs-rules-toggle" type="button" aria-expanded={rulesOpen} onClick={() => setRulesOpen((open) => !open)}>
            <span><Info size={16} />活动规则与资格说明</span><ChevronRight className={rulesOpen ? 'is-open' : ''} size={18} />
          </button>
          {rulesOpen && <div className="xhs-rules"><p><b>活动周期</b>8月28日 00:00—9月1日 23:59。</p><p><b>完成口径</b>三类指定礼物各 1 件，并完成全部唱歌浓度任务。</p><p><b>邀请资格</b>平台将结合完成时间、内容质量及合规情况综合审核。</p></div>}

          <footer className="xhs-footer"><b>YOUNG MUSIC ARCHIVE</b><span>和每一个爱唱歌的你</span><small>2026 · YOUNG</small></footer>
        </div>
      </main>

      <div className="xhs-sticky-bar"><div><small>当前进度</small><strong>2/3 · 72%</strong></div><button type="button" onClick={() => document.querySelector('#xhs-collection')?.scrollIntoView({ behavior: 'smooth' })}>查看我的声音档案 <ChevronRight size={17} /></button></div>
    </div>
  )
}
