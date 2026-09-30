import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ChevronRight, Clock, Info, Music, Share2, Sparkles, Star } from '@/shared/icons'
import './YoungVoiceArchiveRebuild.css'

const gifts = [
  { name: '同心结', price: '1钻', image: '/assets/young-voice/gift-heart-knot.png', done: true },
  { name: '为你簪花', price: '9钻', image: '/assets/young-voice/gift-hairpin-flower.png', done: true },
  { name: '一丈红', price: '99钻', image: '/assets/young-voice/gift-red-stage.png', done: false },
]

const voiceTasks = [
  { number: '01', title: '有效唱歌开播', description: '活动期内完成 1 场有效唱歌直播', value: '1/1', progress: 100 },
  { number: '02', title: '累计演唱时长', description: '直播间唱歌时长累计达到 60 分钟', value: '42/60', progress: 70 },
  { number: '03', title: '完成歌曲演唱', description: '完整演唱 5 首歌曲', value: '3/5', progress: 60 },
]

function Tape({ tone = 'blue' }: { tone?: 'blue' | 'yellow' }) {
  return <span className={`yvr-tape is-${tone}`} aria-hidden="true" />
}

function DoodleTitle({ number, english, children }: { number: string; english: string; children: ReactNode }) {
  return (
    <header className="yvr-section-title">
      <span className="yvr-section-number">{number}</span>
      <div><small>{english}</small><h2>{children}</h2></div>
    </header>
  )
}

export default function YoungVoiceArchiveH5() {
  const [rulesOpen, setRulesOpen] = useState(false)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Young 声音藏品计划'
    return () => { document.title = previousTitle }
  }, [])

  const shareCampaign = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Young 声音藏品计划', text: '集齐三件声音藏品，冲刺 9.3 Young 播派对。', url: window.location.href })
      } catch {
        // Native share sheets may be dismissed without an error surface.
      }
      return
    }
    await navigator.clipboard?.writeText(window.location.href)
    toast.success('活动链接已复制')
  }

  return (
    <div className="yvr-shell">
      <main className="yvr-page">
        <section className="yvr-hero" aria-labelledby="yvr-title">
          <img src="/assets/young-voice/hero-anime-room-v1.jpg" alt="深夜音乐房间插画" />
          <div className="yvr-hero-wash" aria-hidden="true" />
          <div className="yvr-topbar">
            <span>YOUNG MUSIC ROOM</span>
            <button type="button" aria-label="分享活动" onClick={shareCampaign}><Share2 size={19} /></button>
          </div>
          <div className="yvr-hero-title">
            <small>唱歌主播限定活动</small>
            <h1 id="yvr-title"><i>Young</i><span>声音</span><span>藏品计划</span></h1>
            <p>把今晚的歌声<br />收藏进一张唱片里</p>
          </div>
          <div className="yvr-hero-caption"><span>R&amp;B NIGHT</span><b>和每一个爱唱歌的你</b></div>
        </section>

        <section className="yvr-opening">
          <Tape tone="yellow" />
          <div className="yvr-opening-title"><small>2026 YOUNG SOUL POWER</small><strong>声音藏品收集企划</strong></div>
          <p>活动期内集齐三件指定礼物，并完成唱歌浓度任务。最快完成全部任务的主播，有机会参与 <mark>9.3 Young 播派对</mark>。</p>
          <div className="yvr-dates">
            <div><small>COLLECT</small><strong>08.28—09.01</strong></div>
            <span />
            <div><small>PARTY</small><strong>09.03</strong></div>
          </div>
          <button type="button" className="yvr-main-cta" onClick={() => document.querySelector('#yvr-collection')?.scrollIntoView({ behavior: 'smooth' })}>
            故事和好歌都太多，现在就收集 <ChevronRight size={19} />
          </button>
        </section>

        <section className="yvr-section yvr-collection" id="yvr-collection">
          <DoodleTitle number="01" english="LIMITED COLLECTION">三件声音藏品</DoodleTitle>
          <div className="yvr-note yvr-note-yellow">
            <Tape />
            <span className="yvr-note-label">活动玩法</span>
            <h3>三类礼物，平行收集</h3>
            <p>在唱歌直播间分别收到以下三类指定礼物各 1 件，顺序不限；礼物收集与唱歌浓度任务同时累计。</p>
          </div>
          <div className="yvr-gift-grid">
            {gifts.map((gift, index) => (
              <article className={`yvr-gift-card card-${index + 1}`} key={gift.name}>
                <Tape tone={index === 1 ? 'yellow' : 'blue'} />
                <small>COLLECT 0{index + 1}</small>
                <div className="yvr-gift-picture"><img src={gift.image} alt={`${gift.name}礼物`} /></div>
                <h3>{gift.name}</h3><b>{gift.price}</b>
                <span className={gift.done ? 'is-done' : ''}>{gift.done ? '已收集' : '待收集'}</span>
              </article>
            ))}
          </div>
          <div className="yvr-progress-note"><span>COLLECTION PROGRESS</span><strong>2<small>/3</small></strong><p>还差一份「一丈红」</p></div>
        </section>

        <section className="yvr-section yvr-density">
          <DoodleTitle number="02" english="VOICE DENSITY TEST">唱歌浓度任务</DoodleTitle>
          <div className="yvr-density-intro"><Music size={18} /><p>真实任务数据将在活动期间自动同步，三项任务与礼物收集并行完成。</p></div>
          <div className="yvr-task-stack">
            {voiceTasks.map((task) => (
              <article className="yvr-task-note" key={task.number}>
                <span className="yvr-task-number">{task.number}</span>
                <div className="yvr-task-copy"><small>TEST ITEM</small><h3>{task.title}</h3><p>{task.description}</p><div><i style={{ width: `${task.progress}%` }} /></div></div>
                <strong>{task.value}</strong>
              </article>
            ))}
          </div>
          <div className="yvr-density-score"><span>当前唱歌浓度</span><strong>72%</strong><div aria-hidden="true">▂▅▃▆▄▇▃▅</div></div>
        </section>

        <section className="yvr-section yvr-archive">
          <DoodleTitle number="03" english="MY MUSIC ARCHIVE">我的声音档案</DoodleTitle>
          <div className="yvr-archive-board">
            <Tape tone="yellow" />
            <div className="yvr-archive-summary"><span>ARCHIVE STATUS</span><strong>2<small>/3</small></strong><h3>待收集「一丈红」</h3><p>唱歌浓度任务同步累计中</p></div>
            <div className="yvr-archive-gifts">
              {gifts.map((gift) => <div className={gift.done ? 'is-done' : ''} key={gift.name}><img src={gift.image} alt="" /><span>{gift.name}</span><small>{gift.done ? '1/1' : '0/1'}</small></div>)}
            </div>
          </div>
          <div className="yvr-note yvr-note-blue"><Sparkles size={17} /><h3>封存时间如何记录？</h3><p>礼物与唱歌任务首次全部达成时，系统会记录你的档案封存时间，完成越快，越有机会进入派对候选名单。</p></div>
        </section>

        <section className="yvr-section yvr-party">
          <div className="yvr-party-card">
            <Tape />
            <span>SPECIAL INVITATION · 09.03</span>
            <h2><i>Young</i>播派对</h2>
            <p>最快完成声音档案且通过平台审核的主播，将有机会收到 9.3 Young 播派对邀请。</p>
            <div className="yvr-ticket-status"><Clock size={16} /><span>我的状态</span><strong>任务进行中</strong></div>
            <small>* 完成顺序不代表最终入选结果</small>
          </div>
          <button type="button" className="yvr-rules-button" aria-expanded={rulesOpen} onClick={() => setRulesOpen((open) => !open)}>
            <span><Info size={17} />活动规则与资格说明</span><ChevronRight className={rulesOpen ? 'is-open' : ''} size={18} />
          </button>
          {rulesOpen && <div className="yvr-rules"><p><b>活动周期</b>8月28日 00:00—9月1日 23:59。</p><p><b>完成口径</b>收集三类指定礼物各 1 件，并完成全部唱歌浓度任务。</p><p><b>候选资格</b>平台将结合完成时间、内容质量及合规情况进行审核。</p></div>}
        </section>

        <footer className="yvr-footer"><strong>Young 声音藏品计划</strong><span>和每一个爱唱歌的你</span></footer>
      </main>
      <div className="yvr-sticky"><div><small>当前浓度</small><strong>72%</strong></div><button type="button" onClick={() => toast('开播入口已唤起', { icon: <Star size={16} /> })}>去开播完成任务 <ChevronRight size={17} /></button></div>
    </div>
  )
}
