import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Gift,
  Heart,
  Home,
  Lock,
  Play,
  RefreshCw,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  WandSparkles,
  X,
} from '@/shared/icons'
import {
  ACG_FROM_DOC_CHAPTERS,
  type AcgFromDocElement,
  type AcgFromDocPageContent,
  type AcgFromDocSection,
  type AcgFromDocSelection,
} from './AcgFromDocData'
import {
  ACG_EXPERIENCE_BRAND_KIT,
  ACG_FROM_DOC_BRAND_KIT_CANDIDATES,
} from '../assets/acgExperienceBrandKit.ts'
import DouyinMark from './icons/DouyinMark'
import './AcgFromDocH5.css'

type VoteSide = 'positive' | 'negative'
type VenueId = 'main' | 'game' | 'anime'

const ACG_BRAND_STYLE = ACG_EXPERIENCE_BRAND_KIT.cssVars as CSSProperties

type Work = {
  id: string
  title: string
  creator: string
  badge: string
  duration: string
  desc: string
  color: string
  accent: string
  positive: number
  negative: number
  glyph: string
  image: string
}

const MAIN_WORKS: Work[] = [
  {
    id: 'gravity',
    title: '重力失控 48 小时',
    creator: '@轨道放映室',
    badge: '主理人推荐',
    duration: '03:28',
    desc: '当整座城市忽然失去重力，最抽象的日常反而成了生存指南。',
    color: '#ff765d',
    accent: '#ffd09f',
    positive: 128420,
    negative: 6840,
    glyph: '↗',
    image: '/assets/acg-from-doc/generated/work-gravity.webp',
  },
  {
    id: 'moon',
    title: '纸月亮舞会',
    creator: '@凌晨合成器',
    badge: '美学实验',
    duration: '02:46',
    desc: '纸雕、定格与电子旋律一起搭成一场月面舞会。',
    color: '#72e1d1',
    accent: '#c8fff6',
    positive: 114380,
    negative: 7920,
    glyph: '◐',
    image: '/assets/acg-from-doc/generated/work-moon.webp',
  },
  {
    id: 'npc',
    title: 'NPC 决定今天休假',
    creator: '@第四面墙事务所',
    badge: '剧情实验',
    duration: '04:12',
    desc: '游戏里的路人第一次拒绝发布任务，主角只好自己生活。',
    color: '#ffcf5a',
    accent: '#fff1a4',
    positive: 97330,
    negative: 12860,
    glyph: '◇',
    image: '/assets/acg-from-doc/generated/work-npc.webp',
  },
  {
    id: 'save',
    title: '给十年前的存档写封信',
    creator: '@存档回声',
    badge: '年度回忆',
    duration: '05:08',
    desc: '一次跨越十年的存档重启，也是一封写给旧朋友的信。',
    color: '#8aa9ff',
    accent: '#d5deff',
    positive: 82640,
    negative: 5180,
    glyph: '∞',
    image: '/assets/acg-from-doc/generated/work-save.webp',
  },
  {
    id: 'monster',
    title: '今天也要拯救小怪兽',
    creator: '@绿洲观察站',
    badge: '治愈短片',
    duration: '03:03',
    desc: '被英雄追赶的小怪兽，在城市角落第一次交到朋友。',
    color: '#8ce6a5',
    accent: '#d8ffe1',
    positive: 76190,
    negative: 4320,
    glyph: '✿',
    image: '/assets/acg-from-doc/generated/work-monster.webp',
  },
  {
    id: 'combo',
    title: '必杀技也会放空',
    creator: '@热血补完计划',
    badge: '燃向混剪',
    duration: '02:19',
    desc: '高燃名场面之外，那些没接住招的瞬间同样值得欢呼。',
    color: '#ff5e73',
    accent: '#ffb8c1',
    positive: 70840,
    negative: 15940,
    glyph: '▲',
    image: '/assets/acg-from-doc/generated/work-combo.webp',
  },
]

const WISHES = [
  '想看王小瓜 cos 不知火舞',
  '想看全明星角色来一场方言配音秀',
  '想把十年前的游戏存档搬上春晚舞台',
]

const VENUE_META: Record<
  Exclude<VenueId, 'main'>,
  { title: string; subtitle: string; categories: string[]; score: string; pull: string }
> = {
  game: {
    title: '游戏分会场',
    subtitle: '玩家一起决定，哪些二创能站上年度高光位。',
    categories: ['王者荣耀', '和平精英', '三角洲行动'],
    score: '28万',
    pull: '3万',
  },
  anime: {
    title: '二次元分会场',
    subtitle: '按 IP 与内容类型逛完六篇章，把好作品送进 Big Day。',
    categories: ['国创动画', '游戏二创', '虚拟艺人'],
    score: '31万',
    pull: '2.4万',
  },
}

function selectionKey(selection: AcgFromDocSelection | null) {
  if (!selection) return ''
  return selection.type === 'section'
    ? `section:${selection.section}`
    : `element:${selection.element}${selection.instance ? `:${selection.instance}` : ''}`
}

function formatScore(score: number) {
  if (score >= 10000) return `${(score / 10000).toFixed(1)}w`
  return score.toLocaleString()
}

export default function AcgFromDocH5({
  editing,
  selected,
  onSelect,
  content,
  brandKitId,
}: {
  editing?: boolean
  selected: AcgFromDocSelection | null
  onSelect: (selection: AcgFromDocSelection | null) => void
  content: AcgFromDocPageContent
  brandKitId?: string
}) {
  const [venue, setVenue] = useState<VenueId>('main')
  const [activeChapter, setActiveChapter] = useState('abstract')
  const [activeWork, setActiveWork] = useState(0)
  const [rankMode, setRankMode] = useState<VoteSide>('positive')
  const [votes, setVotes] = useState<Record<string, VoteSide>>({})
  const [wish, setWish] = useState('')
  const [wishSent, setWishSent] = useState(false)
  const [wishLikes, setWishLikes] = useState<string[]>([])
  const [followed, setFollowed] = useState(false)
  const [shared, setShared] = useState(false)
  const [reserved, setReserved] = useState(false)
  const [visitedVenues, setVisitedVenues] = useState<
    Exclude<VenueId, 'main'>[]
  >([])
  const [usedDraws, setUsedDraws] = useState(0)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [rewardOpen, setRewardOpen] = useState(false)
  const [submissionOpen, setSubmissionOpen] = useState(false)
  const [detailWork, setDetailWork] = useState<Work | null>(null)
  const [notice, setNotice] = useState('')
  const [activeCategory, setActiveCategory] = useState(0)
  const [feedSeed, setFeedSeed] = useState(0)
  const [overlayTop, setOverlayTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeChapterData =
    ACG_FROM_DOC_CHAPTERS.find((chapter) => chapter.id === activeChapter) ??
    ACG_FROM_DOC_CHAPTERS[0]
  const activeWorkData = MAIN_WORKS[activeWork]
  const campaignBrandKit =
    ACG_FROM_DOC_BRAND_KIT_CANDIDATES.find((kit) => kit.id === brandKitId) ??
    ACG_FROM_DOC_BRAND_KIT_CANDIDATES[0]
  const heroArt =
    campaignBrandKit.id === ACG_FROM_DOC_BRAND_KIT_CANDIDATES[0].id
      ? '/assets/acg-from-doc/generated/hero-kv.webp'
      : campaignBrandKit.previewSrc
  const selectedKey = selectionKey(selected)
  const hasOpenOverlay =
    rulesOpen || rewardOpen || submissionOpen || Boolean(detailWork)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasOpenOverlay) return
    const previousOverflow = container.style.overflowY
    container.style.overflowY = 'hidden'
    return () => {
      container.style.overflowY = previousOverflow
    }
  }, [hasOpenOverlay])

  const visitedBothVenues =
    visitedVenues.includes('game') && visitedVenues.includes('anime')
  const completedTasks = useMemo(
    () =>
      Number(wishSent) +
      Number(Object.keys(votes).length > 0) +
      Number(followed) +
      Number(visitedBothVenues) +
      Number(shared) +
      Number(reserved),
    [followed, reserved, shared, visitedBothVenues, votes, wishSent],
  )
  const availableDraws = Math.max(0, completedTasks - usedDraws)

  const positiveRank = useMemo(
    () => [...MAIN_WORKS].sort((a, b) => b.positive - a.positive).slice(0, 5),
    [],
  )
  const negativeRank = useMemo(
    () => [...MAIN_WORKS].sort((a, b) => b.negative - a.negative).slice(0, 5),
    [],
  )
  const arenaWorks = useMemo(
    () =>
      Array.from(
        { length: 5 },
        (_, index) => MAIN_WORKS[(index + 3 + feedSeed) % MAIN_WORKS.length],
      ),
    [feedSeed],
  )

  const choose = (
    event: MouseEvent,
    selection: AcgFromDocSelection,
    action?: () => void,
  ) => {
    if (editing) {
      event.preventDefault()
      event.stopPropagation()
      onSelect(selection)
      return
    }
    action?.()
  }

  const sectionProps = (section: AcgFromDocSection) => ({
    'data-editable': editing || undefined,
    'data-selected': selectedKey === `section:${section}` ? 'true' : undefined,
    onClick: (event: MouseEvent) =>
      choose(event, { type: 'section', section }),
  })

  const elementProps = (
    section: AcgFromDocSection,
    element: AcgFromDocElement,
    instance?: string,
  ) => ({
    'data-editable': editing || undefined,
    'data-selected':
      selectedKey === `element:${element}${instance ? `:${instance}` : ''}` ? 'true' : undefined,
    onClick: (event: MouseEvent) =>
      choose(event, { type: 'element', section, element, instance }),
  })

  const scrollToId = (id: string) => {
    const container = containerRef.current
    const target = container?.querySelector<HTMLElement>(
      `[data-acg-anchor="${id}"]`,
    )
    if (!container || !target) return

    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    container.scrollTo({
      top: container.scrollTop + targetRect.top - containerRect.top,
      behavior: 'smooth',
    })
  }

  const changeVenue = (nextVenue: VenueId) => {
    if (nextVenue !== 'main') {
      setVisitedVenues((current) =>
        current.includes(nextVenue) ? current : [...current, nextVenue],
      )
    }
    setVenue(nextVenue)
    setNotice('')
    window.requestAnimationFrame(() => {
      if (containerRef.current) containerRef.current.scrollTop = 0
    })
  }

  const castVote = (work: Work, side: VoteSide) => {
    setVotes((current) => ({ ...current, [work.id]: side }))
    setNotice(
      side === 'positive'
        ? '这一夯已计入篇章榜单，并解锁 1 次福利进度'
        : '已记下你的真实判断，拉榜正在刷新',
    )
  }

  const openOverlay = (action: () => void) => {
    setOverlayTop(containerRef.current?.scrollTop ?? 0)
    action()
  }

  const shareActivity = () => {
    setShared(true)
    setNotice('活动分享卡已生成，抽奖进度 +1')
  }

  const reserveLive = () => {
    setReserved(true)
    setNotice('已预约春晚直播，开播前会收到提醒')
  }

  const drawReward = () => {
    if (availableDraws <= 0) return
    setUsedDraws((current) => current + 1)
    openOverlay(() => setRewardOpen(true))
  }

  const openWork = (work: Work) =>
    openOverlay(() => setDetailWork(work))

  const openChapter = (chapterId: string) => {
    if (chapterId !== 'abstract') {
      const chapter = ACG_FROM_DOC_CHAPTERS.find((item) => item.id === chapterId)
      setNotice(`${chapter?.title ?? '该篇章'}将在 ${chapter?.unlockDate ?? '稍后'} 解锁`)
      return
    }
    setActiveChapter(chapterId)
    scrollToId('chapter')
  }

  const venueTabs = (
    <div
      className="acg-doc-venue-tabs"
      {...elementProps('hero', 'hero.venue-nav')}
    >
      {(
        [
          ['game', '游戏会场'],
          ['main', '开年高燃'],
          ['anime', '二次元会场'],
        ] as const
      ).map(([id, label]) => (
        <button
          type="button"
          key={id}
          aria-pressed={venue === id}
          onClick={(event) =>
            choose(
              event,
              { type: 'element', section: 'hero', element: 'hero.venue-nav' },
              () => changeVenue(id),
            )
          }
        >
          {label}
        </button>
      ))}
    </div>
  )

  const figmaMainVenue = (
    <>
      <section
        className="acg-fg-hero"
        data-acg-anchor="home"
        {...sectionProps('hero')}
      >
        <img className="acg-fg-hero__art" src={heroArt} alt="原创 ACG 角色乘新春轨道车前往三大会场" />
        <div className="acg-fg-hero__wash" />
        <div className="acg-fg-status" aria-hidden="true">
          <b>9:41</b><span>▮▮▮ ⌁ ▰</span>
        </div>
        <header className="acg-fg-topbar">
          <button type="button" aria-label="返回"><ChevronLeft size={18} /></button>
          <div className="acg-fg-platform-lockup"><DouyinMark size={15} /><b>抖音游戏</b><i>×</i><DouyinMark size={15} /><b>抖音精选</b></div>
          <button type="button" aria-label="分享" aria-pressed={shared} onClick={() => { if (!editing) shareActivity() }}><Share2 size={17} /></button>
        </header>
        <button type="button" className="acg-fg-rules" onClick={() => openOverlay(() => setRulesOpen(true))}>规则</button>
        <div className="acg-fg-title-art" {...elementProps('hero', 'hero.title')}>
          <img
            className="acg-fg-title-art__base"
            src="/assets/acg-from-doc/generated/title-lockup-base.svg"
            alt=""
          />
          <img
            className="acg-fg-title-art__glyphs"
            src="/assets/acg-from-doc/generated/title-lockup-glyphs.svg"
            alt=""
          />
          <span className="acg-fg-title-art__label">抖音 ACG</span>
          <h1 className="acg-doc-sr-only">抖音 ACG 新春会</h1>
        </div>
        <div className="acg-fg-venue-stage" {...elementProps('hero', 'hero.venue-nav')}>
          {venueTabs}
          <div className="acg-fg-stage-track"><i /><b /><i /></div>
        </div>
      </section>

      <main className="acg-fg-page">
        <section className="acg-fg-section acg-fg-intro" {...sectionProps('journey')}>
          <article className="acg-fg-feature" {...elementProps('journey', 'journey.progress')}>
            <button type="button" className="acg-fg-feature__media" onClick={(event) => choose(event, { type: 'element', section: 'journey', element: 'journey.progress' }, () => openWork(activeWorkData))}>
              <img src={activeChapterData.image} alt={`${activeChapterData.title}篇章视觉`} />
              <span><Play size={18} /></span>
            </button>
            <p><i>“</i> 画面与音乐无缝契合，碰撞出高燃炸裂的顶级视觉火花 <i>”</i></p>
          </article>

          <div className="acg-fg-heading acg-fg-heading--authors">
            <h2>〈 篇章主理人 〉</h2>
            <p>由 25 年年度榜单作者联合创作</p>
          </div>
          <div className="acg-fg-authors" {...elementProps('chapter', 'chapter.host')}>
            {ACG_FROM_DOC_CHAPTERS.map((chapter) => (
              <button
                type="button"
                key={chapter.id}
                aria-pressed={activeChapter === chapter.id}
                onClick={(event) => choose(event, { type: 'element', section: 'chapter', element: 'chapter.host', instance: chapter.host }, () => setActiveChapter(chapter.id))}
              >
                <span><img src={chapter.hostImage} alt="" /><b>{activeChapter === chapter.id ? '✓' : '+'}</b></span>
                <small>{chapter.host.replace('@', '')}</small>
              </button>
            ))}
          </div>
          <div className="acg-fg-rank-entries">
            <button type="button" onClick={() => scrollToId('battle')}><Trophy size={18} /><b>游戏年度榜单</b><ChevronRight size={15} /></button>
            <button type="button" onClick={() => scrollToId('battle')}><Sparkles size={18} /><b>二次元年度榜单</b><ChevronRight size={15} /></button>
          </div>
        </section>

        <section className="acg-fg-section acg-fg-battle" data-acg-anchor="battle" {...sectionProps('battle')}>
          <div className="acg-fg-sticker-title">
            <span>ACG 新春会</span>
            <h2>抓马大战</h2>
            <i>Drama</i>
          </div>
          <p className="acg-fg-lead">马力最高的皇阿“马” or 马力为负的负“马”爷？<br />为你喜欢的有活作品 Pick 一下吧！</p>
          <div className="acg-fg-duel" {...elementProps('battle', 'battle.vote')}>
            <button type="button" aria-pressed={votes[activeWorkData.id] === 'negative'} onClick={(event) => choose(event, { type: 'element', section: 'battle', element: 'battle.vote', instance: '放你一马' }, () => castVote(activeWorkData, 'negative'))}>
              <small>每票 <b>-1 马力</b></small><strong>放你 <i>−</i> 马</strong><span>太夯了！对好活作品的强烈安利</span>
            </button>
            <em aria-hidden="true">ϟ</em>
            <button type="button" aria-pressed={votes[activeWorkData.id] === 'positive'} onClick={(event) => choose(event, { type: 'element', section: 'battle', element: 'battle.vote', instance: '好活加马' }, () => castVote(activeWorkData, 'positive'))}>
              <small>每票 <b>+3 马力</b></small><strong>好活 <i>＋</i> 马</strong><span>味道还不够，下次多加点料～</span>
            </button>
          </div>
          {notice && <div className="acg-fg-notice"><Check size={12} /> {notice}</div>}

          <div className="acg-fg-heading"><h2>〈 抓马榜 〉</h2></div>
          <div className="acg-fg-work-list" {...elementProps('battle', 'battle.ranking')}>
            {positiveRank.slice(0, 3).map((work, index) => (
              <div key={work.id} {...elementProps('battle', 'battle.ranking', `榜单作品 ${index + 1}`)}>
                <CampaignWorkCard work={work} rank={index + 1} current={votes[work.id]} editing={editing} onOpen={openWork} onVote={castVote} />
              </div>
            ))}
          </div>
        </section>

        <section className="acg-fg-section acg-fg-field" data-acg-anchor="content" {...sectionProps('content')}>
          <div className="acg-fg-heading"><h2>〈 抓马赛场 〉</h2></div>
          <div className="acg-fg-work-list" {...elementProps('content', 'content.feed')}>
            {arenaWorks.map((work, index) => (
              <div key={`${work.id}-${index}`} {...elementProps('content', 'content.feed', `赛场作品 ${index + 1}`)}>
                <CampaignWorkCard work={work} current={votes[work.id]} editing={editing} onOpen={openWork} onVote={castVote} />
              </div>
            ))}
          </div>
          <div className="acg-fg-paired-actions">
            <button type="button" onClick={() => { if (!editing) openOverlay(() => setSubmissionOpen(true)) }}>我也要发作品</button>
            <button type="button" onClick={() => setFeedSeed((seed) => seed + 1)}>{feedSeed > 0 ? `已刷新 · 第 ${feedSeed + 1} 批` : '查看入围作品'}</button>
          </div>
        </section>

        <section className="acg-fg-section acg-fg-wish" data-acg-anchor="wish" {...sectionProps('wish')}>
          <div className="acg-fg-sticker-title acg-fg-sticker-title--wish"><span>ACG 新春会</span><h2>春晚节目许愿</h2><i>Wishing Well</i></div>
          <p className="acg-fg-lead">你许愿我实现，愿望点赞破 <b>百瓜分 5 万现金</b></p>
          <div className="acg-fg-wish-board" {...elementProps('wish', 'wish.wall')}>
            {[...WISHES, '想看六位主理人合作一支新春混剪'].map((item, index) => (
              <article key={item}>
                <p>{item} 😈 {index % 2 ? '这个脑洞我先蹲住' : '我真的好想看！'}</p>
                <footer><span><img src={ACG_FROM_DOC_CHAPTERS[index % ACG_FROM_DOC_CHAPTERS.length].hostImage} alt="" />旺仔</span><button type="button" aria-pressed={wishLikes.includes(item)} onClick={() => setWishLikes((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}>{wishLikes.includes(item) ? '已点赞' : '去点赞'}</button></footer>
              </article>
            ))}
          </div>
          <label className="acg-fg-wish-input" {...elementProps('wish', 'wish.input')}>
            <input value={wish} maxLength={40} placeholder={content.wishPlaceholder} onChange={(event) => { setWish(event.target.value); setWishSent(false) }} />
            <span>{wish.length}/40</span>
          </label>
          <div className="acg-fg-paired-actions">
            <button type="button" aria-pressed={reserved} onClick={() => { if (!editing) reserveLive() }}><Clock size={15} />{reserved ? '已预约春晚直播' : '预约春晚直播'}</button>
            <button type="button" disabled={!editing && !wish.trim()} {...elementProps('wish', 'wish.action')} onClick={(event) => choose(event, { type: 'element', section: 'wish', element: 'wish.action' }, () => { if (wish.trim()) setWishSent(true) })}>{wishSent ? '心愿已提交' : '我也要许愿'}</button>
          </div>
          <p className="acg-fg-countdown">距春晚惊喜之夜还剩 <b>12</b> 天</p>
        </section>

        <section className="acg-fg-section acg-fg-benefits" {...sectionProps('benefits')}>
          <div className="acg-fg-sticker-title acg-fg-sticker-title--benefit"><h2>抽新春福利</h2><i>Lottery Draw</i></div>
          <div className="acg-fg-lottery" {...elementProps('benefits', 'benefits.lottery')}>
            <button type="button" className="acg-fg-lottery__rules" onClick={() => openOverlay(() => setRulesOpen(true))}>查看奖池信息 <b>?</b></button>
            <div className="acg-fg-lottery__machine">
              <div className="acg-fg-lottery__glass">
                {['reward-red-packet.webp','reward-frame.webp','reward-pass.webp','reward-firework.webp','reward-ticket.webp','reward-capsule.webp'].map((asset, index) => <span key={asset} style={{ '--ball-index': index } as CSSProperties}><img src={`/assets/acg-from-doc/generated/${asset}`} alt="" /></span>)}
              </div>
              <div className="acg-fg-lottery__console"><i /><b>我的奖品 ›</b><em /></div>
              <button type="button" disabled={!editing && availableDraws === 0} onClick={(event) => choose(event, { type: 'element', section: 'benefits', element: 'benefits.lottery' }, drawReward)}><strong>点击抽奖</strong><span>剩余抽奖次数 {availableDraws}</span></button>
            </div>
          </div>
          <div className="acg-fg-heading"><h2>〈 做任务领抽奖机会 〉</h2></div>
          <div className="acg-fg-task-list" {...elementProps('benefits', 'benefits.tasks')}>
            <TaskRow done={followed} image="/assets/acg-from-doc/generated/reward-frame.webp" title="关注当前篇章主理人" action="去关注" onAction={() => setFollowed(true)} />
            <TaskRow done={Object.keys(votes).length > 0} image="/assets/acg-from-doc/generated/reward-firework.webp" title="为任意作品投出 1 票" action="去投票" onAction={() => scrollToId('battle')} />
            <TaskRow done={wishSent} image="/assets/acg-from-doc/generated/reward-ticket.webp" title="发布 1 条春晚心愿" action="去许愿" onAction={() => scrollToId('wish')} />
            <TaskRow done={visitedBothVenues} image="/assets/acg-from-doc/generated/reward-pass.webp" title="浏览游戏与二次元双会场" action={visitedVenues.length > 0 ? '继续浏览' : '去浏览'} onAction={() => changeVenue(visitedVenues.includes('game') ? 'anime' : 'game')} />
            <TaskRow done={shared} image="/assets/acg-from-doc/generated/reward-red-packet.webp" title="分享新春会给一位朋友" action="去分享" onAction={shareActivity} />
            <TaskRow done={reserved} image="/assets/acg-from-doc/generated/reward-capsule.webp" title="预约新春惊喜直播" action="去预约" onAction={reserveLive} />
          </div>
        </section>

        <footer className="acg-fg-footer">
          <button type="button" onClick={() => changeVenue('game')}><img src="/assets/acg-from-doc/generated/chapter-battle.webp" alt="" /><span>游戏榜单入口</span></button>
          <button type="button" onClick={() => changeVenue('anime')}><img src="/assets/acg-from-doc/generated/chapter-aesthetic.webp" alt="" /><span>二次元榜单入口</span></button>
          <div><DouyinMark size={18} /><b>抖音电脑版</b><DouyinMark size={18} /><b>抖音精选</b></div>
          <p>抖音搜索 <b>新春环游记</b> ⌕</p>
          <small>用电脑，大屏看更爽</small>
        </footer>
      </main>
    </>
  )

  return (
    <div
      ref={containerRef}
      className="acg-doc-h5 thin-scroll"
      style={ACG_BRAND_STYLE}
      data-brand-kit={`${ACG_EXPERIENCE_BRAND_KIT.id}@${ACG_EXPERIENCE_BRAND_KIT.version}`}
      data-campaign-brand-kit={campaignBrandKit.id}
      onClick={(event) => {
        if (editing && event.currentTarget === event.target) onSelect(null)
      }}
    >
      {venue === 'main' ? (
        <>
          {figmaMainVenue}
          {import.meta.env.MODE === '__legacy_acg_mock__' && (
          <>
          <section
            className="acg-doc-hero"
            data-acg-anchor="home"
            {...sectionProps('hero')}
          >
            <img
              src={heroArt}
              alt="六个幻想世界围绕星轨相连，一位旅行者准备出发"
              className="acg-doc-hero__art"
            />
            <div className="acg-doc-hero__shade" />
            <header className="acg-doc-hero__nav">
              <span className="acg-doc-hero__brand">
                <DouyinMark size={14} />
                <b>抖音 ACG</b>
                <i>×</i>
                <span>2026 新春会</span>
              </span>
              <div className="acg-doc-hero__nav-actions">
                <button type="button" aria-label="分享活动">
                  <Share2 size={14} />
                </button>
                <button type="button" onClick={() => openOverlay(() => setRulesOpen(true))}>
                  规则
                </button>
              </div>
            </header>
            {venueTabs}
            <div className="acg-doc-hero__copy">
              <div className="acg-doc-kicker">
                <Sparkles size={12} />
                {content.eventBadge}
              </div>
              <div
                className="acg-doc-title-art"
                {...elementProps('hero', 'hero.title')}
              >
                <img
                  src="/assets/acg-from-doc/generated/title-art.webp"
                  alt={content.heroTitle}
                />
                <h1 className="acg-doc-sr-only">{content.heroTitle}</h1>
              </div>
              <p {...elementProps('hero', 'hero.subtitle')}>
                {content.heroSubtitle}
              </p>
              <div className="acg-doc-hero__meta">
                <span>01.14—02.14</span>
                <span>六大篇章</span>
                <span>全民共创</span>
              </div>
              <button
                type="button"
                className="acg-doc-primary"
                {...elementProps('hero', 'hero.action')}
                onClick={(event) =>
                  choose(
                    event,
                    { type: 'element', section: 'hero', element: 'hero.action' },
                    () => scrollToId('journey'),
                  )
                }
              >
                <span>{content.heroAction}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          <main className="acg-doc-main">
            <section
              className="acg-doc-section acg-doc-journey"
              data-acg-anchor="journey"
              {...sectionProps('journey')}
            >
              <div
                className="acg-doc-now-card"
                {...elementProps('journey', 'journey.progress')}
              >
                <div className="acg-doc-now-card__top">
                  <span>旅程进行中</span>
                  <strong>1 / 6</strong>
                </div>
                <div className="acg-doc-now-card__body">
                  <div className="acg-doc-now-card__glyph">
                    <img src={activeChapterData.image} alt="" />
                  </div>
                  <div>
                    <small>第一篇章 · {activeChapterData.dateRange}</small>
                    <h2>{activeChapterData.title}</h2>
                    <p>现在可看作品、投夯拉票，投票即得篇章头像框。</p>
                    <span className="acg-doc-now-card__reward">
                      <img
                        src="/assets/acg-from-doc/generated/reward-pass.webp"
                        alt=""
                      />
                      完成本篇解锁星轨通行证
                    </span>
                  </div>
                  <button type="button" onClick={() => scrollToId('chapter')}>
                    进入 <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              <div className="acg-doc-section__head">
                <span className="acg-doc-index">01 / JOURNEY MAP</span>
                <h2>{content.journeyTitle}</h2>
                <p>{content.journeySubtitle}</p>
              </div>

              {notice.includes('解锁') && (
                <div className="acg-doc-journey-notice">
                  <Clock size={12} /> {notice}
                </div>
              )}

              <div
                className="acg-doc-route"
                aria-label="六大篇章解锁进度"
                {...elementProps('journey', 'journey.chapter')}
              >
                {ACG_FROM_DOC_CHAPTERS.map((chapter, index) => {
                  const current = chapter.id === 'abstract'
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      aria-current={current ? 'step' : undefined}
                      onClick={(event) =>
                        choose(
                          event,
                          {
                            type: 'element',
                            section: 'journey',
                            element: 'journey.chapter',
                          },
                          () => openChapter(chapter.id),
                        )
                      }
                      style={
                        {
                          '--chapter-accent': chapter.accent,
                          '--chapter-glow': chapter.glow,
                        } as CSSProperties
                      }
                    >
                      <span className="acg-doc-route__track" />
                      <span className="acg-doc-route__node">
                        <img src={chapter.image} alt="" />
                        {!current && <Lock size={11} />}
                      </span>
                      <span className="acg-doc-route__copy">
                        <small>{current ? '进行中' : `${chapter.unlockDate} 解锁`}</small>
                        <strong>{chapter.title}</strong>
                      </span>
                      <span className="acg-doc-route__index">{String(index + 1).padStart(2, '0')}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section
              className="acg-doc-section acg-doc-chapter"
              data-acg-anchor="chapter"
              {...sectionProps('chapter')}
            >
              <img
                className="acg-doc-chapter__art"
                src={activeChapterData.image}
                alt=""
              />
              <div className="acg-doc-chapter__halo" />
              <div className="acg-doc-section__head acg-doc-section__head--light">
                <span className="acg-doc-index">CURRENT CHAPTER · {activeChapterData.order}</span>
                <h2>{activeChapterData.title}</h2>
                <p>{activeChapterData.summary}</p>
              </div>
              <div
                className="acg-doc-host-card"
                {...elementProps('chapter', 'chapter.host')}
              >
                <img
                  className="acg-doc-host-card__avatar"
                  src={activeChapterData.hostImage}
                  alt={`${activeChapterData.host} 主理人头像`}
                />
                <div>
                  <small>本篇章主理人</small>
                  <strong>{activeChapterData.host}</strong>
                  <span>已发布 12 条抽象征集启示</span>
                </div>
                <button
                  type="button"
                  aria-pressed={followed}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!editing) setFollowed((value) => !value)
                  }}
                >
                  {followed ? '已关注' : '+ 关注'}
                </button>
              </div>
              <article
                className="acg-doc-callout"
                {...elementProps('chapter', 'chapter.submit')}
              >
                <span>OPEN CALL / 公开征集</span>
                <h3>如果抽象是一种超能力</h3>
                <p>带 #ACG新春会 发布你的作品，优质内容有机会进入主会场、线下大屏和年度混剪。</p>
                <div>
                  <button type="button">查看征集要求</button>
                  <button type="button" className="acg-doc-callout__primary">
                    发布作品 <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            </section>

            <section
              className="acg-doc-section acg-doc-battle"
              data-acg-anchor="battle"
              {...sectionProps('battle')}
            >
              <div className="acg-doc-section__head acg-doc-section__head--light">
                <span className="acg-doc-index">02 / HANG OR LA</span>
                <h2>{content.battleTitle}</h2>
                <p>{content.battleSubtitle}</p>
              </div>

              <div className="acg-doc-work-tabs">
                {MAIN_WORKS.slice(0, 3).map((work, index) => (
                  <button
                    type="button"
                    key={work.id}
                    aria-pressed={activeWork === index}
                    onClick={() => setActiveWork(index)}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>

              <article
                className="acg-doc-spotlight"
                {...elementProps('battle', 'battle.spotlight')}
              >
                <button
                  type="button"
                  className="acg-doc-work-cover acg-doc-work-cover--hero"
                  style={
                    {
                      '--work-color': activeWorkData.color,
                      '--work-accent': activeWorkData.accent,
                    } as CSSProperties
                  }
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!editing) openWork(activeWorkData)
                  }}
                >
                  <img
                    className="acg-doc-work-cover__art"
                    src={activeWorkData.image}
                    alt=""
                  />
                  <span className="acg-doc-work-cover__glyph">{activeWorkData.glyph}</span>
                  <span className="acg-doc-work-cover__play"><Play size={15} /></span>
                  <span className="acg-doc-work-cover__duration">{activeWorkData.duration}</span>
                </button>
                <div className="acg-doc-spotlight__body">
                  <span>{activeWorkData.badge}</span>
                  <h3>{activeWorkData.title}</h3>
                  <p>{activeWorkData.desc}</p>
                  <small>{activeWorkData.creator}</small>
                </div>
              </article>

              <VoteButtons
                work={activeWorkData}
                current={votes[activeWorkData.id]}
                labels={[content.positiveVoteLabel, content.negativeVoteLabel]}
                editing={editing}
                onSelect={onSelect}
                onVote={castVote}
              />

              {notice && <div className="acg-doc-inline-notice"><Check size={12} /> {notice}</div>}

              <div
                className="acg-doc-rank-card"
                {...elementProps('battle', 'battle.ranking')}
              >
                <div className="acg-doc-rank-card__head">
                  <div>
                    <span>实时榜单</span>
                    <strong>{rankMode === 'positive' ? '本篇最夯 TOP 5' : '本篇最拉 TOP 5'}</strong>
                  </div>
                  <div>
                    <button
                      type="button"
                      aria-pressed={rankMode === 'positive'}
                      onClick={() => setRankMode('positive')}
                    >
                      夯榜
                    </button>
                    <button
                      type="button"
                      aria-pressed={rankMode === 'negative'}
                      onClick={() => setRankMode('negative')}
                    >
                      拉榜
                    </button>
                  </div>
                </div>
                {(rankMode === 'positive' ? positiveRank : negativeRank).map((work, index) => (
                  <button
                    type="button"
                    className="acg-doc-rank-row"
                    key={work.id}
                    onClick={() => openWork(work)}
                  >
                    <span>{index + 1}</span>
                    <i style={{ '--work-color': work.color } as CSSProperties}>
                      <img src={work.image} alt="" />
                    </i>
                    <strong>{work.title}</strong>
                    <small>
                      {formatScore(rankMode === 'positive' ? work.positive : work.negative)}
                    </small>
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </section>

            <section
              className="acg-doc-section acg-doc-content"
              data-acg-anchor="content"
              {...sectionProps('content')}
            >
              <div className="acg-doc-section__head acg-doc-section__head--split">
                <div>
                  <span className="acg-doc-index">03 / DISCOVER</span>
                  <h2>{content.contentTitle}</h2>
                  <p>{content.contentSubtitle}</p>
                </div>
                <button type="button" onClick={() => setFeedSeed((seed) => seed + 1)}>
                  <RefreshCw size={13} /> 换一批
                </button>
              </div>
              <div
                className="acg-doc-feed"
                {...elementProps('content', 'content.feed')}
              >
                {[...MAIN_WORKS.slice(1), MAIN_WORKS[0]]
                  .slice(feedSeed % 2, 4 + (feedSeed % 2))
                  .map((work) => (
                    <WorkTile
                      key={work.id}
                      work={work}
                      vote={votes[work.id]}
                      labels={[content.positiveVoteLabel, content.negativeVoteLabel]}
                      editing={editing}
                      onOpen={openWork}
                      onVote={castVote}
                    />
                  ))}
              </div>
              <button type="button" className="acg-doc-more">
                查看本篇全部作品 <ChevronRight size={13} />
              </button>
            </section>

            <section
              className="acg-doc-section acg-doc-wish"
              data-acg-anchor="wish"
              {...sectionProps('wish')}
            >
              <span className="acg-doc-index">04 / CO-CREATE BIG DAY</span>
              <WandSparkles size={27} />
              <h2>{content.wishTitle}</h2>
              <p>{content.wishSubtitle}</p>
              <div
                className="acg-doc-wish-wall"
                {...elementProps('wish', 'wish.wall')}
              >
                {WISHES.map((item, index) => (
                  <div key={item}>
                    <span>{['瓜', '喵', '存'][index]}</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
              <label
                className="acg-doc-wish__input"
                {...elementProps('wish', 'wish.input')}
              >
                <textarea
                  value={wish}
                  maxLength={80}
                  placeholder={content.wishPlaceholder}
                  onChange={(event) => {
                    setWishSent(false)
                    setWish(event.target.value)
                  }}
                  onClick={(event) => {
                    if (editing) {
                      event.preventDefault()
                      event.stopPropagation()
                      onSelect({ type: 'element', section: 'wish', element: 'wish.input' })
                    }
                  }}
                />
                <span>{wish.length}/80</span>
              </label>
              <button
                type="button"
                className="acg-doc-wish__action"
                disabled={!editing && !wish.trim()}
                {...elementProps('wish', 'wish.action')}
                onClick={(event) =>
                  choose(
                    event,
                    { type: 'element', section: 'wish', element: 'wish.action' },
                    () => {
                      if (wish.trim()) setWishSent(true)
                    },
                  )
                }
              >
                {wishSent ? '心愿已进入候选池' : content.wishAction}
                {wishSent ? <Check size={14} /> : <ArrowRight size={14} />}
              </button>
            </section>

            <section
              className="acg-doc-section acg-doc-benefits"
              {...sectionProps('benefits')}
            >
              <div className="acg-doc-section__head">
                <span className="acg-doc-index">05 / REWARDS</span>
                <h2>{content.benefitsTitle}</h2>
                <p>完成 3 项任务，可获得 3 次抽奖机会和篇章限定头像框。</p>
              </div>
              <div className="acg-doc-benefit-summary">
                <div><img src="/assets/acg-from-doc/generated/reward-capsule.webp" alt="" /><span><small>当前机会</small><strong>{availableDraws} 次</strong></span></div>
                <button
                  type="button"
                  disabled={!editing && availableDraws === 0}
                  {...elementProps('benefits', 'benefits.lottery')}
                  onClick={(event) =>
                    choose(
                      event,
                      { type: 'element', section: 'benefits', element: 'benefits.lottery' },
                      drawReward,
                    )
                  }
                >
                  立即抽奖
                </button>
              </div>
              <div
                className="acg-doc-task-list"
                {...elementProps('benefits', 'benefits.tasks')}
              >
                <TaskRow done={wishSent} image="/assets/acg-from-doc/generated/reward-ticket.webp" title="发布 1 条春晚心愿" action="去发布" onAction={() => scrollToId('wish')} />
                <TaskRow done={Object.keys(votes).length > 0} image="/assets/acg-from-doc/generated/reward-firework.webp" title="为本篇作品投出夯拉票" action="去投票" onAction={() => scrollToId('battle')} />
                <TaskRow done={followed} image="/assets/acg-from-doc/generated/reward-frame.webp" title="关注本篇章主理人" action="去关注" onAction={() => setFollowed(true)} />
              </div>
            </section>

            <section className="acg-doc-bigday">
              <div>
                <span>02.14 / BIG DAY</span>
                <h2>惊喜晚会，等你来兑现心愿</h2>
                <p>年度 Top 内容混剪、心愿定制节目与福利结果将在直播中揭晓。</p>
              </div>
              <button type="button"><Clock size={14} /> 预约提醒</button>
            </section>
          </main>

          <nav className="acg-doc-bottom-nav" aria-label="页面快捷导航">
            <button type="button" onClick={() => scrollToId('home')}><Home size={14} />首页</button>
            <button type="button" onClick={() => scrollToId('journey')}><Sparkles size={14} />篇章</button>
            <button type="button" onClick={() => scrollToId('battle')}><Flame size={14} />夯拉</button>
            <button type="button" onClick={() => scrollToId('wish')}><Heart size={14} />许愿</button>
          </nav>
          </>
          )}
        </>
      ) : (
        <SubVenue
          venue={venue}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          venueTabs={venueTabs}
          content={content}
          editing={editing}
          votes={votes}
          onVote={castVote}
          onOpenWork={openWork}
          sectionProps={sectionProps}
          elementProps={elementProps}
          onBack={() => changeVenue('main')}
        />
      )}

      {rulesOpen && !editing && (
        <Overlay title="活动规则" top={overlayTop} onClose={() => setRulesOpen(false)}>
          <div className="acg-doc-rules">
            <p><strong>活动时间</strong><span>1 月 14 日—2 月 14 日</span></p>
            <p><strong>篇章解锁</strong><span>六大篇章每 5 天开放一篇，开放后可浏览、投票和完成任务。</span></p>
            <p><strong>夯拉投票</strong><span>每条作品可选择“太夯了”或“有点拉”，再次选择可修改判断；票数进入篇章与分会场榜单。</span></p>
            <p><strong>奖励说明</strong><span>完成关注、投票、心愿、双会场浏览、分享与预约任务可获得抽奖机会；实物与虚拟奖励以最终上线说明为准。</span></p>
            <p><strong>内容激励</strong><span>Top 作品有机会获得主会场、线下大屏与 2 月 14 日年度混剪露出。</span></p>
          </div>
        </Overlay>
      )}

      {rewardOpen && !editing && (
        <Overlay title="春晚福利" top={overlayTop} onClose={() => setRewardOpen(false)} compact>
          <div className="acg-doc-reward">
            <div><img src="/assets/acg-from-doc/generated/reward-red-packet.webp" alt="星轨新春红包" /></div>
            <span>恭喜获得</span>
            <h3>抽象奇境 · 限定头像框</h3>
            <p>奖励将保存在“我的活动奖励”中，正式活动以真实发放结果为准。</p>
            <button type="button" onClick={() => setRewardOpen(false)}>收下奖励</button>
          </div>
        </Overlay>
      )}

      {submissionOpen && !editing && (
        <Overlay title="发布作品" top={overlayTop} onClose={() => setSubmissionOpen(false)} compact>
          <div className="acg-doc-reward">
            <div><img src="/assets/acg-from-doc/generated/work-npc.webp" alt="新春作品投稿入口" /></div>
            <span>新春共创计划</span>
            <h3>发布你的 ACG 新春作品</h3>
            <p>选择游戏或二次元分会场，补充作品链接与篇章标签；当前预览将以本地草稿模拟投稿流程。</p>
            <button type="button" onClick={() => { setSubmissionOpen(false); setNotice('投稿草稿已创建，可继续补充作品信息') }}>创建投稿草稿</button>
          </div>
        </Overlay>
      )}

      {detailWork && !editing && (
        <Overlay title="作品详情" top={overlayTop} onClose={() => setDetailWork(null)} compact>
          <div className="acg-doc-detail">
            <div
              className="acg-doc-work-cover acg-doc-work-cover--detail"
              style={{ '--work-color': detailWork.color, '--work-accent': detailWork.accent } as CSSProperties}
            >
              <img className="acg-doc-work-cover__art" src={detailWork.image} alt="" />
              <span className="acg-doc-work-cover__glyph">{detailWork.glyph}</span>
              <span className="acg-doc-work-cover__play"><Play size={15} /></span>
            </div>
            <span>{detailWork.badge}</span>
            <h3>{detailWork.title}</h3>
            <p>{detailWork.desc}</p>
            <small>{detailWork.creator} · {detailWork.duration}</small>
            <VoteButtons
              work={detailWork}
              current={votes[detailWork.id]}
              labels={[content.positiveVoteLabel, content.negativeVoteLabel]}
              editing={false}
              onSelect={onSelect}
              onVote={castVote}
            />
          </div>
        </Overlay>
      )}
    </div>
  )
}

function CampaignWorkCard({
  work,
  rank,
  current,
  editing,
  onOpen,
  onVote,
}: {
  work: Work
  rank?: number
  current?: VoteSide
  editing?: boolean
  onOpen: (work: Work) => void
  onVote: (work: Work, side: VoteSide) => void
}) {
  const horsepower =
    work.positive * 3 -
    work.negative +
    (current === 'positive' ? 3 : current === 'negative' ? -1 : 0)
  return (
    <article className="acg-fg-work-card">
      {rank && <b className="acg-fg-work-card__rank">TOP {rank}</b>}
      <button type="button" className="acg-fg-work-card__cover" onClick={(event) => { event.stopPropagation(); if (!editing) onOpen(work) }}>
        <img src={work.image} alt="" />
        <span><img src="/assets/acg-from-doc/generated/host-trickster.webp" alt="" />{work.creator.replace('@', '')}</span>
      </button>
      <div className="acg-fg-work-card__body">
        <h3>{work.title}</h3>
        <div className="acg-fg-horsepower"><small>马力值</small><strong>{horsepower.toLocaleString()}</strong></div>
        <div className="acg-fg-work-card__actions">
          <button type="button" aria-pressed={current === 'negative'} onClick={(event) => { event.stopPropagation(); if (!editing) onVote(work, 'negative') }}>放你 <i>−</i> 马</button>
          <button type="button" aria-pressed={current === 'positive'} onClick={(event) => { event.stopPropagation(); if (!editing) onVote(work, 'positive') }}>好活 <i>＋</i> 马</button>
        </div>
      </div>
    </article>
  )
}

function VoteButtons({
  work,
  current,
  labels,
  editing,
  onSelect,
  onVote,
}: {
  work: Work
  current?: VoteSide
  labels: [string, string]
  editing?: boolean
  onSelect: (selection: AcgFromDocSelection | null) => void
  onVote: (work: Work, side: VoteSide) => void
}) {
  return (
    <div
      className="acg-doc-vote"
      data-editable={editing || undefined}
      onClick={(event) => {
        if (!editing) return
        event.preventDefault()
        event.stopPropagation()
        onSelect({ type: 'element', section: 'battle', element: 'battle.vote' })
      }}
    >
      <button
        type="button"
        aria-pressed={current === 'positive'}
        onClick={(event) => {
          event.stopPropagation()
          if (editing) onSelect({ type: 'element', section: 'battle', element: 'battle.vote' })
          else onVote(work, 'positive')
        }}
      >
        <ThumbsUp size={16} />
        <span>{labels[0]}</span>
        <strong>{formatScore(work.positive + Number(current === 'positive'))}</strong>
      </button>
      <button
        type="button"
        aria-pressed={current === 'negative'}
        onClick={(event) => {
          event.stopPropagation()
          if (editing) onSelect({ type: 'element', section: 'battle', element: 'battle.vote' })
          else onVote(work, 'negative')
        }}
      >
        <ThumbsDown size={16} />
        <span>{labels[1]}</span>
        <strong>{formatScore(work.negative + Number(current === 'negative'))}</strong>
      </button>
    </div>
  )
}

function WorkTile({
  work,
  vote,
  labels,
  editing,
  onOpen,
  onVote,
}: {
  work: Work
  vote?: VoteSide
  labels: [string, string]
  editing?: boolean
  onOpen: (work: Work) => void
  onVote: (work: Work, side: VoteSide) => void
}) {
  return (
    <article className="acg-doc-work-tile">
      <button
        type="button"
        className="acg-doc-work-cover"
        style={{ '--work-color': work.color, '--work-accent': work.accent } as CSSProperties}
        onClick={() => !editing && onOpen(work)}
      >
        <img className="acg-doc-work-cover__art" src={work.image} alt="" />
        <span className="acg-doc-work-cover__glyph">{work.glyph}</span>
        <span className="acg-doc-work-cover__play"><Play size={12} /></span>
        <span className="acg-doc-work-cover__duration">{work.duration}</span>
      </button>
      <div className="acg-doc-work-tile__copy">
        <small>{work.badge}</small>
        <h3>{work.title}</h3>
        <span>{work.creator}</span>
      </div>
      <div className="acg-doc-work-tile__vote">
        <button type="button" aria-pressed={vote === 'positive'} onClick={() => !editing && onVote(work, 'positive')}>
          <ThumbsUp size={11} /> {labels[0]}
        </button>
        <button type="button" aria-pressed={vote === 'negative'} onClick={() => !editing && onVote(work, 'negative')}>
          <ThumbsDown size={11} /> {labels[1]}
        </button>
      </div>
    </article>
  )
}

function TaskRow({
  done,
  image,
  title,
  action,
  onAction,
}: {
  done: boolean
  image: string
  title: string
  action: string
  onAction: () => void
}) {
  return (
    <div className="acg-doc-task-row">
      <span>{done ? <Check size={14} /> : <img src={image} alt="" />}</span>
      <div><strong>{title}</strong><small>{done ? '已完成 · 抽奖机会 +1' : '完成后获得 1 次抽奖机会'}</small></div>
      <button type="button" disabled={done} onClick={onAction}>{done ? '完成' : action}</button>
    </div>
  )
}

function SubVenue({
  venue,
  activeCategory,
  setActiveCategory,
  venueTabs,
  content,
  editing,
  votes,
  onVote,
  onOpenWork,
  sectionProps,
  elementProps,
  onBack,
}: {
  venue: Exclude<VenueId, 'main'>
  activeCategory: number
  setActiveCategory: (index: number) => void
  venueTabs: React.ReactNode
  content: AcgFromDocPageContent
  editing?: boolean
  votes: Record<string, VoteSide>
  onVote: (work: Work, side: VoteSide) => void
  onOpenWork: (work: Work) => void
  sectionProps: (section: AcgFromDocSection) => Record<string, unknown>
  elementProps: (section: AcgFromDocSection, element: AcgFromDocElement) => Record<string, unknown>
  onBack: () => void
}) {
  const meta = VENUE_META[venue]
  const venueWorks = ACG_FROM_DOC_CHAPTERS.flatMap((chapter, chapterIndex) =>
    [0, 1].map((offset) => {
      const source = MAIN_WORKS[(chapterIndex + offset) % MAIN_WORKS.length]
      return {
        ...source,
        id: `${venue}-${activeCategory}-${chapter.id}-${offset}`,
        title:
          venue === 'game'
            ? [`逆风局也要放大招`, `峡谷里的春节彩蛋`, `撤离前的最后一支舞`][(chapterIndex + offset + activeCategory) % 3]
            : [`角色下班后的秘密`, `一帧入坑的年度名场面`, `跨次元拜年计划`][(chapterIndex + offset + activeCategory) % 3],
        creator: `@${meta.categories[activeCategory]}创作组${chapterIndex + 1}`,
      }
    }),
  )

  return (
    <div className="acg-doc-subvenue" data-acg-anchor="home">
      <section className="acg-doc-subhero" {...sectionProps('hero')}>
        <img src="/assets/acg-from-doc/generated/hero-kv.webp" alt="ACG 新春会分会场" />
        <div className="acg-doc-subhero__shade" />
        <header>
          <button type="button" onClick={onBack}><ChevronLeft size={15} /></button>
          <strong>ACG / 2026</strong>
          <button type="button"><Share2 size={14} /></button>
        </header>
        {venueTabs}
        <div className="acg-doc-subhero__copy">
          <span>SUB VENUE / 年度内容战</span>
          <h1>{venue === 'game' ? content.venueTitle : meta.title}</h1>
          <p>{venue === 'game' ? content.venueSubtitle : meta.subtitle}</p>
        </div>
      </section>
      <main>
        <section className="acg-doc-section acg-doc-venue-score" {...sectionProps('venue')}>
          <div className="acg-doc-category-tabs">
            {meta.categories.map((category, index) => (
              <button type="button" key={category} aria-pressed={activeCategory === index} onClick={() => setActiveCategory(index)}>{category}</button>
            ))}
          </div>
          <div className="acg-doc-score-card" {...elementProps('venue', 'venue.score')}>
            <span>截至今日 00:00</span>
            <h2>{meta.categories[activeCategory]}夯拉积分</h2>
            <div className="acg-doc-score-card__numbers">
              <div><small>累计夯分</small><strong>{meta.score}</strong><ThumbsUp size={14} /></div>
              <div><small>累计拉分</small><strong>{meta.pull}</strong><ThumbsDown size={14} /></div>
            </div>
            <div className="acg-doc-score-card__bar"><i /><b /></div>
            <p>当前分会场排名第 <strong>2</strong> 位，距离上一名还差 3 万夯分。</p>
          </div>
        </section>

        <section className="acg-doc-section acg-doc-venue-feed" {...sectionProps('venue')}>
          <div className="acg-doc-section__head">
            <span className="acg-doc-index">ALL CHAPTERS / RANDOM FEED</span>
            <h2>把喜欢的作品送上高光位</h2>
            <p>每个篇章的 Top 内容将进入主会场、年度混剪与线下大屏候选。</p>
          </div>
          <div {...elementProps('venue', 'venue.feed')}>
            {ACG_FROM_DOC_CHAPTERS.map((chapter, chapterIndex) => (
              <section className="acg-doc-venue-group" key={chapter.id}>
                <header style={{ '--chapter-accent': chapter.accent } as CSSProperties}>
                  <span>{chapter.glyph}</span>
                  <div><small>{chapter.dateRange}</small><h3>{chapter.title}</h3></div>
                  <button type="button">全部 <ChevronRight size={11} /></button>
                </header>
                <div className="acg-doc-feed">
                  {venueWorks.slice(chapterIndex * 2, chapterIndex * 2 + 2).map((work) => (
                    <WorkTile
                      key={work.id}
                      work={work}
                      vote={votes[work.id]}
                      labels={[content.positiveVoteLabel, content.negativeVoteLabel]}
                      editing={editing}
                      onOpen={onOpenWork}
                      onVote={onVote}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="acg-doc-full-film">
          <Play size={20} />
          <div><span>2 月 14 日解锁</span><h2>ACG 新春会完整正片</h2><p>分会场 Top 内容将汇入年度混剪</p></div>
          <ChevronRight size={14} />
        </section>
      </main>
      <nav className="acg-doc-bottom-nav">
        <button type="button" onClick={onBack}><Home size={14} />主会场</button>
        <button type="button"><Trophy size={14} />积分</button>
        <button type="button"><Flame size={14} />投票</button>
        <button type="button"><Gift size={14} />奖励</button>
      </nav>
    </div>
  )
}

function Overlay({
  title,
  top,
  onClose,
  compact,
  children,
}: {
  title: string
  top: number
  onClose: () => void
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="acg-doc-overlay" style={{ top }} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="acg-doc-overlay__backdrop" onClick={onClose} aria-label="关闭" />
      <div className={`acg-doc-overlay__sheet${compact ? ' is-compact' : ''}`}>
        <header><strong>{title}</strong><button type="button" onClick={onClose}><X size={16} /></button></header>
        <div className="thin-scroll">{children}</div>
      </div>
    </div>
  )
}
