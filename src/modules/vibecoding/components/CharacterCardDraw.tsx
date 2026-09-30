import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from '@/shared/icons'
import './CharacterCardDraw.css'

interface Character {
  id: string
  name: string
  role: string
  cue: string
  description: string
  image: string
}

const ASSET = '/assets/character-card-draw'
const CHARACTERS: Character[] = [
  {
    id: 'night',
    name: '夜航旅人',
    role: '月光与远行',
    cue: '为深色穿搭留一处银色亮点',
    description: '银发、旧斗篷与月色徽章，拼出一位静静观察城市的旅人。试试以深蓝和银白，设计属于你的夜行角色。',
    image: `${ASSET}/night-traveler-v1.webp`,
  },
  {
    id: 'sky',
    name: '云端领航员',
    role: '晴空与冒险',
    cue: '给角色一枚随身的黄铜罗盘',
    description: '风吹起的红棕头发、黄铜罗盘和轻便外套，让她随时准备开启下一段旅程。用暖金与天空蓝画出新的方向。',
    image: `${ASSET}/sky-navigator-v1.webp`,
  },
  {
    id: 'garden',
    name: '花园守护者',
    role: '花影与新生',
    cue: '用一小簇花点亮柔和的轮廓',
    description: '淡紫色发丝与藤蔓花环，像午后花园里的一段安静故事。把叶片、花瓣和浅色布料组合成你的角色语言。',
    image: `${ASSET}/garden-keeper-v1.webp`,
  },
  {
    id: 'tide',
    name: '潮汐倾听者',
    role: '海风与回响',
    cue: '让贝壳和蓝色吊坠成为线索',
    description: '深色长发、海蓝吊坠与浪花纹样，记录他沿海岸寻找灵感的时刻。尝试用岩灰与潮蓝勾勒沉静的力量。',
    image: `${ASSET}/tide-listener-v1.webp`,
  },
]

const FAN = [-36, -25, -14, 0, 14, 25, 36]
const STORAGE_KEY = 'character-card-draw-collected-v2'

function readCollected(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter((id) => CHARACTERS.some((card) => card.id === id)) : []
  } catch {
    return []
  }
}

function CardBack({ className = '' }: { className?: string }) {
  return (
    <span className={`character-draw-card-back ${className}`} aria-hidden="true">
      <img src={`${ASSET}/card-back-v2.svg`} alt="" draggable="false" />
    </span>
  )
}

export default function CharacterCardDraw() {
  const [picked, setPicked] = useState<Character | null>(null)
  const [pending, setPending] = useState<{ index: number; card: Character } | null>(null)
  const [phase, setPhase] = useState<'fan' | 'lift' | 'back' | 'flipping' | 'revealed'>('fan')
  const [faceVisible, setFaceVisible] = useState(true)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [spreadProgress, setSpreadProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; moved: boolean; spread: number; focus: number } | null>(null)
  const suppressClick = useRef(false)
  const [collected, setCollected] = useState<string[]>(readCollected)
  const [view, setView] = useState<'feed' | 'album'>('feed')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const previousTitle = document.title
    document.title = '角色灵感抽卡'
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => {
    if (pending === null) return
    const finish = () => {
      setPicked(pending.card)
      setCollected((previous) => {
        if (previous.includes(pending.card.id)) return previous
        const next = [...previous, pending.card.id]
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* the draw still works without storage */ }
        return next
      })
      setPending(null)
      setPhase('revealed')
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = window.setTimeout(finish, 180)
      return () => window.clearTimeout(timer)
    }
    const liftTimer = window.setTimeout(() => setPhase('back'), 520)
    const flipTimer = window.setTimeout(() => setPhase('flipping'), 1550)
    const finishTimer = window.setTimeout(finish, 2350)
    return () => {
      window.clearTimeout(liftTimer)
      window.clearTimeout(flipTimer)
      window.clearTimeout(finishTimer)
    }
  }, [pending])

  const choose = (index: number) => {
    if (suppressClick.current) { suppressClick.current = false; return }
    if (pending !== null || picked) return
    if (spreadProgress < .85) {
      setSpreadProgress(1)
      setFocusedIndex(index)
      return
    }
    setFocusedIndex(index)
    setPhase('lift')
    setPending({ index, card: CHARACTERS[(index + collected.length) % CHARACTERS.length] })
  }

  const resetDraw = () => {
    setPicked(null)
    setPending(null)
    setPhase('fan')
    setFaceVisible(true)
    setFocusedIndex(null)
    setSpreadProgress(0)
    setDragging(false)
  }

  const beginSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'fan') return
    dragStart.current = { x: event.clientX, y: event.clientY, moved: false, spread: spreadProgress, focus: focusedIndex ?? 3 }
  }

  const moveSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start || phase !== 'fan') return
    const dx = event.clientX - start.x
    if (!start.moved && (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(event.clientY - start.y))) return
    if (!start.moved) event.currentTarget.setPointerCapture(event.pointerId)
    start.moved = true
    setDragging(true)
    if (start.spread < .85) {
      setSpreadProgress(Math.max(0, Math.min(1, start.spread + dx / 185)))
    } else {
      const step = Math.round(dx / 65)
      setFocusedIndex(Math.max(0, Math.min(6, start.focus - step)))
    }
  }

  const endSwipe = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start) return
    if (start.moved) {
      if (start.spread < .85) setSpreadProgress((current) => current > .34 ? 1 : 0)
      suppressClick.current = true
      window.setTimeout(() => { suppressClick.current = false }, 80)
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    dragStart.current = null
    setDragging(false)
  }

  return (
    <main className="character-draw-page">
      <div className="character-draw-device">
        <div className="character-draw-screen">
          {view === 'feed' ? (
            <>
              <header className="character-draw-header">
                <h1>角色灵感抽卡</h1>
              </header>

              <section className={`character-draw-play${phase === 'fan' || phase === 'lift' ? '' : ' is-drawing'}`} aria-label="角色灵感抽卡互动区域">
                <div className="character-draw-play__ornament" aria-hidden="true">
                  <span className="character-draw-play__ring" />
                  <span className="character-draw-play__sigil">✧</span>
                </div>
                <div className="character-draw-play__lead">
                  <span>CHARACTER CONCEPT / 01</span>
                  <h2>{picked ? '这张牌属于你' : phase === 'fan' ? spreadProgress >= .85 ? '选一张，揭晓角色' : '滑动展开卡牌' : phase === 'lift' ? '正在抽出卡牌' : '即将揭晓角色'}</h2>
                  <p>{picked ? '让这个角色成为下一段创作的起点' : phase === 'fan' ? spreadProgress >= .85 ? '轻点卡背，发现你的下一位幻想角色' : '从左侧向右滑动，让七张牌逐张铺开' : '看卡背翻转，遇见原创角色'}</p>
                </div>
                <div className="character-draw-play__divider" aria-hidden="true"><span>◇</span></div>

                {phase === 'fan' || phase === 'lift' ? (
                  <div className={`character-draw-fan${dragging ? ' is-dragging' : ''}`} aria-label="七张可抽取的卡牌" onPointerDown={beginSwipe} onPointerMove={moveSwipe} onPointerUp={endSwipe} onPointerCancel={endSwipe}>
                    <div className="character-draw-fan__deck">
                      {FAN.map((angle, index) => {
                        const spread = Math.max(0, Math.min(1, spreadProgress * 1.8 - (6 - index) * .13))
                        const stackOffset = -115 + index * 6
                        const offset = stackOffset + spread * ((index - 3) * 22 - stackOffset)
                        const centered = focusedIndex === index || pending?.index === index
                        return (
                          <button
                            className={`character-draw-fan__card${centered ? ' is-focused' : ''}${pending?.index === index ? ' is-picking' : ''}`}
                            key={index}
                            type="button"
                            style={{
                              '--card-transform': `translateX(-50%) translateY(${centered && spreadProgress >= .85 ? -15 : 0}px) rotate(${angle * spread + (index - 3) * .7 * (1 - spread)}deg)`,
                              left: `calc(50% + ${offset}px)`,
                              bottom: `${93 - index * 1.2 * (1 - spread) - Math.abs(index - 3) * 7 * spread}px`,
                              zIndex: centered ? 10 : spreadProgress < .7 ? 7 - index : 7 - Math.abs(index - 3),
                            } as React.CSSProperties}
                            aria-label={`抽取第 ${index + 1} 张卡牌`}
                            disabled={pending !== null}
                            onClick={() => choose(index)}
                          >
                            <CardBack />
                          </button>
                        )
                      })}
                    </div>
                    {pending === null && spreadProgress < .85 ? (
                      <button className="character-draw-fan__hint" type="button" onClick={() => setSpreadProgress(1)}>向右滑动展开 · 或点击展开</button>
                    ) : <p className="character-draw-fan__hint">{pending === null ? '滑动选牌 · 点击卡背揭晓' : '正在抽出卡牌…'}</p>}
                  </div>
                ) : (
                  <div className={`character-draw-flip-stage${picked ? ' is-complete' : ' is-pending'}`} role="status" aria-live="polite">
                    <button
                      className={`character-draw-flip-card${phase === 'flipping' || (picked && faceVisible) ? ' is-flipped' : ''}`}
                      type="button"
                      disabled={!picked}
                      aria-label={picked ? faceVisible ? '翻到卡背' : '翻到卡面' : '卡牌正在翻面'}
                      onClick={() => setFaceVisible((visible) => !visible)}
                    >
                      <span className="character-draw-flip-card__inner">
                        <CardBack className="character-draw-flip-card__back" />
                        <span className="character-draw-flip-card__front">
                          <img src={(picked ?? pending?.card)?.image} alt="" />
                          <span>{(picked ?? pending?.card)?.name}</span>
                        </span>
                      </span>
                    </button>
                    <div className="character-draw-flip-stage__caption">
                      {picked ? <><strong>你抽中了 · {picked.name}</strong><span>{picked.cue}</span></> : <span>{phase === 'back' ? '卡牌正在放大…' : '正在揭晓角色…'}</span>}
                    </div>
                    {picked && (
                      <button className="character-draw-retry" type="button" onClick={resetDraw}>
                        <span aria-hidden="true" />再抽一张<span aria-hidden="true">↻</span>
                      </button>
                    )}
                  </div>
                )}
              </section>

              <footer className="character-draw-feed-actions">
                <button className="character-draw-dismiss" type="button" onClick={() => setDismissed(true)}>
                  {dismissed ? '已记录偏好' : '不感兴趣'}
                </button>
                <button className="character-draw-main-action" type="button" onClick={() => setView('album')}>
                  <span aria-hidden="true" />前往活动<span aria-hidden="true"><ArrowRight size={17} /></span>
                </button>
              </footer>
            </>
          ) : (
            <div className="character-draw-album">
              <header className="character-draw-album__header">
                <button type="button" aria-label="返回兴趣卡" onClick={() => setView('feed')}><ArrowLeft size={20} /></button>
                <span>角色灵感卡册</span>
                <button type="button" aria-label="关闭卡册" onClick={() => setView('feed')}><X size={20} /></button>
              </header>
              <div className="character-draw-album__intro">
                <span>THE CHARACTER ARCHIVE</span>
                <h2>让灵感继续生长</h2>
                <p>已发现 {collected.length} / {CHARACTERS.length} 位角色。浏览卡片中的服饰、色彩和故事线索。</p>
              </div>
              <div className="character-draw-album__grid">
                {CHARACTERS.map((card) => (
                  <article className={`character-draw-album-card${collected.includes(card.id) ? '' : ' is-locked'}`} key={card.id}>
                    <img src={card.image} alt={collected.includes(card.id) ? `${card.name}原创插画` : '待发现角色卡'} />
                    <div>
                      <span>{collected.includes(card.id) ? card.role : '尚未抽到'}</span>
                      <h3>{collected.includes(card.id) ? card.name : '待发现'}</h3>
                    </div>
                  </article>
                ))}
              </div>
              <div className="character-draw-album__story">
                <h3>把抽到的角色变成你的作品</h3>
                <p>{picked?.description ?? '回到卡片抽取第一张角色牌，收集一个可用的配色、造型和故事线索。'}</p>
                <button type="button" onClick={() => { setView('feed'); resetDraw() }}>
                  <span aria-hidden="true" />继续抽卡<span aria-hidden="true"><ArrowRight size={17} /></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
