import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  Archive,
  ChevronRight,
  Clock,
  Info,
  Music,
  Share2,
  Sparkles,
  Star,
} from '@/shared/icons'
import './YoungVoiceArchiveH5Claude.css'

const gifts = [
  { id: 'heart-knot', name: '同心结', price: '1钻', caption: '收下一份默契，让今晚的歌声有了回应。' },
  { id: 'hairpin-flower', name: '为你簪花', price: '9钻', caption: '为喜欢的歌声，簪上一朵花。' },
  { id: 'red-stage', name: '一丈红', price: '99钻', caption: '把舞台点亮，将高光时刻收藏进档案。' },
] as const

const collectedCount = 2 // demo state: first two gifts already collected

const singingTasks = [
  { name: '有效唱歌开播', detail: '活动期内完成 1 场有效唱歌直播', value: 1, total: 1, unit: '场' },
  { name: '累计演唱时长', detail: '直播间唱歌时长累计达到 60 分钟', value: 42, total: 60, unit: '分钟' },
  { name: '完成歌曲演唱', detail: '完整演唱 5 首歌曲', value: 3, total: 5, unit: '首' },
] as const

const ranking = [
  { rank: 1, name: '晚风唱片机', time: '08.28 20:16', color: '#f07a64' },
  { rank: 2, name: '小岛来信', time: '08.28 20:34', color: '#3f70b7' },
  { rank: 3, name: '橘子海Live', time: '08.28 20:47', color: '#d09b2c' },
] as const

const giftArtwork = [
  '/assets/young-voice/gift-heart-knot.png',
  '/assets/young-voice/gift-hairpin-flower.png',
  '/assets/young-voice/gift-red-stage.png',
] as const

function GiftArtwork({ index, name }: { index: number; name: string }) {
  return <img className="yc-gift-art" src={giftArtwork[index - 1]} alt={`${name}礼物`} loading="lazy" />
}

/** Reusable arched "signpost" plaque — the campaign's recurring module-kicker shape. */
function CraftPlaque({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'red' }) {
  return <span className={`craft-plaque craft-plaque--${tone}`}>{children}</span>
}

/** Fence-and-float decorative divider, echoing the benchmark's page-bottom motif. */
function CraftFence() {
  return (
    <svg className="craft-fence" viewBox="0 0 240 34" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="craft-fence-picket" width="24" height="34" patternUnits="userSpaceOnUse">
          <path d="M3 34V16L12 5L21 16V34Z" fill="#c98a52" />
          <rect x="3" y="19" width="18" height="3" fill="#a86f3d" />
        </pattern>
      </defs>
      <rect x="0" y="6" width="240" height="28" fill="url(#craft-fence-picket)" />
      <circle cx="46" cy="9" r="7" fill="var(--c-yellow)" stroke="#fff" strokeWidth="1.5" />
      <circle cx="176" cy="11" r="5.5" fill="var(--c-red)" opacity=".85" />
    </svg>
  )
}

function SectionHeading({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="yc-section-heading">
      <div className="yc-section-folio"><strong>{number}</strong></div>
      <div className="yc-section-heading-copy">
        <span className="yc-kicker">{eyebrow}</span>
        <h2>{title}</h2>
        <div className="yc-section-deck">{children}</div>
      </div>
    </header>
  )
}

/** 可从外部播种的交互态 —— 工坊的状态画布靠它并排铺出同一版的不同状态。 */
export type YoungVoiceClaudeState = {
  activePanel?: 'archive' | 'ranking'
  rulesOpen?: boolean
}

export default function YoungVoiceArchiveH5Claude({
  state,
}: { state?: YoungVoiceClaudeState } = {}) {
  const [activePanel, setActivePanel] = useState<'archive' | 'ranking'>(
    state?.activePanel ?? 'archive',
  )
  const [rulesOpen, setRulesOpen] = useState(state?.rulesOpen ?? false)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Young 声音藏品计划 · Claude 复刻版'
    return () => { document.title = previousTitle }
  }, [])

  const shareCampaign = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Young 声音藏品计划', text: '集齐三件声音藏品，解锁 Young 播派对候选席位。', url: window.location.href })
      } catch {
        // Native share sheets may be dismissed without an error surface.
      }
      return
    }
    await navigator.clipboard?.writeText(window.location.href)
    toast.success('活动链接已复制')
  }

  const openRules = () => {
    setRulesOpen(true)
    document.querySelector('#yc-rules')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="yc-page-shell">
      <main className="yc-page">
        <section className="yc-hero" aria-labelledby="yc-title">
          <img className="yc-hero-kv" src="/assets/young-voice/hero-kv.jpg" alt="" />
          <div className="yc-hero-kv-shade" aria-hidden="true" />
          <div className="yc-topbar">
            <span className="yc-topbar-mark">YOUNG ARCHIVE · 2026</span>
            <button type="button" className="yc-icon-button" aria-label="分享活动" onClick={shareCampaign}><Share2 size={19} /></button>
          </div>

          <div className="yc-hero-copy">
            <span className="yc-file-chip">声音收藏档案 · NO. 0828</span>
            <p className="yc-hero-overline">唱歌主播限定活动</p>
            <h1 id="yc-title" aria-label="Young 声音藏品计划">
              <img className="yc-title-lockup" src="/assets/young-voice/title-lockup.png" alt="" />
            </h1>
            <p className="yc-hero-lead">集齐三件声音藏品，完成声音浓度鉴定，最快封存档案的主播有机会登上 9.3 Young 播派对。</p>
          </div>

          <div className="yc-date-strip">
            <div><small>COLLECT</small><strong>08.28—09.01</strong></div><span />
            <div><small>PARTY</small><strong>09.03</strong></div>
          </div>
          <button type="button" className="craft-pill craft-pill--solid yc-primary-button" onClick={() => document.querySelector('#yc-progress')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            查看我的收集进度 <ChevronRight size={18} />
          </button>
          <p className="yc-hero-footnote">完成越快，离派对舞台越近</p>
        </section>

        <section className="yc-section yc-collection" aria-labelledby="collection-title">
          <SectionHeading number="01" eyebrow="LIMITED COLLECTION" title="三件声音藏品">
            <p id="collection-title">每一份礼物，都是观众为歌声留下的收藏凭证。</p>
          </SectionHeading>

          <section className="craft-panel yc-collect-plan" aria-label="声音藏品打卡计划">
            <header className="yc-collect-plan-head">
              <CraftPlaque>玩法 01</CraftPlaque>
              <h3>声音藏品<br />打卡计划</h3>
              <span className="craft-ribbon">收下三件礼物 · 解锁派对候选资格</span>
            </header>

            <ol className="yc-collect-track">
              {gifts.map((gift, index) => {
                const collected = index < collectedCount
                return (
                  <li key={gift.id} className={collected ? 'is-collected' : ''}>
                    <div className="yc-collect-node"><span>{index + 1}</span></div>
                    <figure className="craft-tile yc-collect-tile">
                      <GiftArtwork index={index + 1} name={gift.name} />
                      <figcaption>{gift.name}<small>{gift.price}</small></figcaption>
                    </figure>
                    <p className="yc-collect-status">{collected ? '已收下' : '未解锁'}</p>
                  </li>
                )
              })}
            </ol>

            <div className="yc-collect-showcase">
              <img className="yc-collect-showcase-art" src="/assets/young-voice/party-invitation-collage.png" alt="" />
              <div className="yc-collect-showcase-copy">
                <span>集齐 {collectedCount}/{gifts.length}</span>
                <strong>解锁 Young 播派对候选资格</strong>
                <p>三件礼物全部收下后，自动进入声音浓度鉴定环节</p>
              </div>
            </div>

            <div className="craft-rulecard">
              <span className="craft-rulecard-tag">COLLECT RULES</span>
              <ol>
                <li>直播间收到指定礼物，即记为收下 1 件声音藏品。</li>
                <li>三类礼物需分别收下，每类只需 1 次即可点亮。</li>
                <li>礼物记录以直播间实时数据为准，存在短暂延迟。</li>
              </ol>
            </div>

            <div className="yc-collect-actions">
              <button type="button" className="craft-pill" onClick={openRules}>详细规则</button>
              <button type="button" className="craft-pill craft-pill--solid" onClick={() => toast('收礼入口已唤起', { icon: <Sparkles size={16} /> })}>
                立即收集 <ChevronRight size={16} />
              </button>
              <a className="yc-collect-link" href="#yc-progress">查看我的礼物 ›</a>
            </div>

            <CraftFence />
          </section>
        </section>

        <section className="yc-section yc-progress-section" id="yc-progress" aria-labelledby="progress-title">
          <SectionHeading number="02" eyebrow="MY ARCHIVE" title="我的声音档案">
            <p id="progress-title">礼物收集与声音任务全部完成后，才会记录最终封存时间。</p>
          </SectionHeading>
          <div className="craft-segmented" role="tablist" aria-label="档案查看方式">
            <button type="button" role="tab" aria-selected={activePanel === 'archive'} className={activePanel === 'archive' ? 'is-active' : ''} onClick={() => setActivePanel('archive')}>我的进度</button>
            <button type="button" role="tab" aria-selected={activePanel === 'ranking'} className={activePanel === 'ranking' ? 'is-active' : ''} onClick={() => setActivePanel('ranking')}>封存榜</button>
          </div>

          {activePanel === 'archive' ? (
            <div className="craft-panel yc-archive-panel" role="tabpanel">
              <div className="yc-progress-summary">
                <div className="yc-progress-ring"><strong>{collectedCount}</strong><span>/{gifts.length}</span></div>
                <div><span className="yc-kicker">COLLECTION STATUS</span><h3>还差「一丈红」</h3><p>集齐后继续完成声音浓度鉴定</p></div>
              </div>
              <div className="yc-mini-collection">
                {gifts.map((gift, index) => {
                  const collected = index < collectedCount
                  return (
                    <figure className={`craft-tile ${collected ? 'is-collected' : ''}`} key={gift.id}>
                      <GiftArtwork index={index + 1} name={gift.name} />
                      <figcaption>{gift.name}<small>{collected ? '1/1' : '0/1'}</small></figcaption>
                    </figure>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="craft-panel yc-ranking-panel" role="tabpanel">
              {ranking.map((item) => (
                <div className="yc-ranking-row" key={item.rank}>
                  <strong>0{item.rank}</strong><span className="yc-avatar" style={{ background: item.color }}>{item.name.slice(0, 1)}</span>
                  <div><b>{item.name}</b><small>档案封存完成</small></div><time>{item.time}</time>
                </div>
              ))}
              <div className="yc-my-rank"><span>我的档案</span><strong>尚未封存</strong><small>完成全部任务后参与排序</small></div>
            </div>
          )}
        </section>

        <section className="yc-section yc-density" aria-labelledby="density-title">
          <SectionHeading number="03" eyebrow="VOICE DENSITY TEST" title="声音浓度鉴定">
            <p id="density-title">真实任务数据将在活动期间自动同步，预计存在短暂延迟。</p>
          </SectionHeading>
          <img className="yc-density-visual" src="/assets/young-voice/sound-density-collage.png" alt="" />
          <div className="craft-panel craft-panel--dark yc-density-sheet">
            <div className="yc-density-header"><div><span>鉴定编号</span><strong>YV-0828-066</strong></div><span className="craft-plaque craft-plaque--red">鉴定中</span></div>
            {singingTasks.map((task, index) => {
              const percent = Math.round((task.value / task.total) * 100)
              return (
                <div className="yc-task" key={task.name}>
                  <span className="yc-task-label">TEST · {String(index + 1).padStart(2, '0')}</span>
                  <div className="yc-task-topline"><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{task.name}</h3><p>{task.detail}</p></div><strong>{task.value}/{task.total}<small>{task.unit}</small></strong></div>
                  <div className="yc-task-track"><span style={{ width: `${percent}%` }} /></div>
                </div>
              )
            })}
            <div className="yc-density-result"><span>当前声音浓度</span><strong>72%</strong><div className="yc-wave-bars" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div></div>
          </div>
        </section>

        <section className="yc-section yc-party" aria-labelledby="party-title">
          <div className="craft-panel yc-party-ticket">
            <div className="yc-party-ticket-side"><span>Y</span><span>O</span><span>U</span><span>N</span><span>G</span></div>
            <div className="yc-party-ticket-main">
              <img className="yc-party-art" src="/assets/young-voice/party-invitation-collage.png" alt="" />
              <CraftPlaque>SPECIAL · 09.03</CraftPlaque>
              <h2 id="party-title">Young<br />播派对</h2>
              <p>最快完成声音档案且通过平台审核的主播，将有机会收到派对邀请。</p>
              <div className="yc-ticket-status"><Clock size={15} /><span>我的状态</span><strong>任务进行中</strong></div>
              <small>* 实时排名不代表最终入选结果</small>
            </div>
          </div>
          <div className="craft-panel yc-party-note">
            <span className="craft-rulecard-tag yc-party-note-tag">CURATOR&apos;S NOTE</span>
            <Sparkles size={18} />
            <p><strong>完成时间如何记录？</strong>三件礼物和全部唱歌任务首次同时达成时，系统会自动记录你的档案封存时间。</p>
          </div>
        </section>

        <section className="yc-section yc-rules" id="yc-rules" aria-labelledby="rules-title">
          <button type="button" className="craft-pill yc-rules-toggle" aria-expanded={rulesOpen} onClick={() => setRulesOpen((open) => !open)}>
            <span><Info size={18} /><strong id="rules-title">活动规则与资格说明</strong></span><ChevronRight className={rulesOpen ? 'is-open' : ''} size={18} />
          </button>
          {rulesOpen ? (
            <div className="craft-panel yc-rules-content">
              <p><b>活动时间</b>8月28日 00:00—9月1日 23:59，以活动页面时间为准。</p>
              <p><b>任务口径</b>活动期内收集三类指定礼物，并完成页面展示的有效唱歌任务。</p>
              <p><b>完成排序</b>以两类任务全部达成的首次时间排序；同一时刻完成时，以平台记录顺序为准。</p>
              <p><b>资格审核</b>活动结束后平台将结合完成时间、直播内容质量及合规情况进行审核。</p>
              <p><b>异常处理</b>异常互动、数据作弊或违规直播将被取消活动及派对候选资格。</p>
            </div>
          ) : null}
        </section>

        <footer className="yc-footer"><div><Archive size={18} /><span>Young 声音藏品计划</span></div><p>让每一份被喜欢的歌声，都值得收藏。</p><span>YOUNG ARCHIVE © 2026 · CLAUDE DRAFT</span></footer>
      </main>

      <div className="yc-sticky-action">
        <div><Music size={18} /><span><small>当前声音浓度</small><strong>72%</strong></span></div>
        <button type="button" className="craft-pill craft-pill--solid" onClick={() => toast('开播入口已唤起', { icon: <Star size={16} /> })}>去开播完成任务 <ChevronRight size={17} /></button>
      </div>
    </div>
  )
}
