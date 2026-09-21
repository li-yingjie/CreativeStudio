import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Share2 } from '@/shared/icons'
import {
  H5LayoutEditorChrome,
  H5LayoutSelectionOverlay,
  useH5LayoutEditor,
  type H5EditableItem,
  type H5LayoutOverrides,
  type H5SelectionBox,
} from './H5LayoutEditor'
import './WinterGatheringH5.css'

/* eslint-disable react-hooks/refs, react-refresh/only-export-components -- the layout editor returns stable ref and render-prop helpers as one controller; the project integration shares its editor metadata */

export const WINTER_GATHERING_EDITABLE_ITEMS: H5EditableItem[] = [
  { id: 'personality-card', name: '冬日探险人格卡片' },
  { id: 'personality-heading', name: '人格卡标题' },
  { id: 'personality-copy', name: '人格卡正文' },
  { id: 'personality-button', name: '人格测试按钮' },
  { id: 'breakout-meta', name: '破冰场说明与日期' },
  { id: 'breakout-route-1', name: '破冰场路线一' },
  { id: 'breakout-route-2', name: '破冰场路线二' },
  { id: 'breakout-route-3', name: '破冰场路线三' },
  { id: 'breakout-route-4', name: '破冰场路线四' },
  { id: 'breakout-action', name: '破冰场任务按钮区' },
  { id: 'diary-copy', name: '雪原日记正文区' },
  { id: 'spa-carousel', name: '温泉轮播组件' },
  { id: 'spa-action', name: '温泉解锁按钮区' },
  { id: 'spa-tasks', name: '温泉任务列表' },
  { id: 'snow-meta', name: '撒点野日期说明' },
  { id: 'snow-copy-1', name: '撒点野说明一' },
  { id: 'snow-copy-2', name: '撒点野说明二' },
  { id: 'snow-copy-3', name: '撒点野说明三' },
  { id: 'snow-action', name: '撒点野解锁按钮' },
  { id: 'gear-subtitle', name: '一路开挂副标题' },
  { id: 'tv-action', name: '电视抽奖按钮' },
  { id: 'search-tail', name: '页尾搜索框' },
]

export const WINTER_GATHERING_LAYOUT_STORAGE_KEY =
  'winter-gathering-layout-v1'

const SPA_SLIDES = [
  { src: '/assets/winter-gathering/spa-module-lockup-v6.jpg', alt: '雪林中的露天岩石温泉' },
  { src: '/assets/winter-gathering/spa-module-lockup-v5.jpg', alt: '暖冬露天温泉体验' },
  { src: '/assets/winter-gathering/spa-module-lockup-v4.jpg', alt: '冬日专属温泉场景' },
]

function WinterGatheringH5({
  embedded = false,
  editing,
  selectedId,
  overrides,
  onSelectedIdChange,
  onOverridesChange,
  onSelectionBoxChange,
  state,
}: {
  embedded?: boolean
  editing?: boolean
  /** 工坊画布用它播种交互态，把「已解锁人格 / 已领取任务」铺成并排的状态帧。 */
  state?: { tested?: boolean; joined?: boolean }
  selectedId?: string | null
  overrides?: H5LayoutOverrides
  onSelectedIdChange?: (id: string | null) => void
  onOverridesChange?: (overrides: H5LayoutOverrides) => void
  onSelectionBoxChange?: (box: H5SelectionBox | null) => void
} = {}) {
  const [tested, setTested] = useState(state?.tested ?? false)
  const [joined, setJoined] = useState(state?.joined ?? false)
  const [spaSlide, setSpaSlide] = useState(0)
  const spaCarouselRef = useRef<HTMLDivElement>(null)
  const editor = useH5LayoutEditor(WINTER_GATHERING_LAYOUT_STORAGE_KEY, {
    enabled: editing,
    selectedId,
    overrides,
    onSelectedIdChange,
    onOverridesChange,
    onSelectionBoxChange,
  })

  useEffect(() => {
    if (embedded) return
    const previousTitle = document.title
    document.title = '冬日召集令｜H5 Benchmark'
    return () => { document.title = previousTitle }
  }, [embedded])

  const sharePage = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url: window.location.href }) } catch { /* dismissed */ }
      return
    }
    await navigator.clipboard?.writeText(window.location.href)
  }

  const goToSpaSlide = (index: number) => {
    const carousel = spaCarouselRef.current
    if (!carousel) return
    carousel.scrollTo({ left: carousel.clientWidth * index, behavior: 'smooth' })
    setSpaSlide(index)
  }

  return (
    <div className={`wgh-shell${embedded ? ' is-embedded' : ''}${editor.enabled ? ' is-editing' : ''}`}>
      <main ref={editor.pageRef} className="wgh-page" onPointerDownCapture={editor.onCanvasPointerDownCapture}>
        <nav className="wgh-nav" aria-label="页面导航">
          <button type="button" aria-label="返回"><ChevronLeft size={20} strokeWidth={2.5} /></button>
          <span aria-hidden="true" />
          <button type="button" aria-label="分享" onClick={sharePage}><Share2 size={18} strokeWidth={2.3} /></button>
        </nav>

        <header className="wgh-hero">
          <img className="wgh-hero-benchmark" src="/assets/winter-gathering/winter-hero-benchmark-v2.jpg" alt="冬日召集令：穿黄色羽绒服的探险者和小狗奔跑在雪地里" />
          <h1 className="sr-only">冬日召集令</h1>
        </header>

        <section className="wgh-paper wgh-personality" {...editor.editProps('personality-card', '冬日探险人格卡片')}>
          <img className="wgh-personality-art" src="/assets/winter-gathering/personality-card-art-v2.png" alt="" aria-hidden="true" />
          <div className="wgh-personality-heading" {...editor.editProps('personality-heading', '人格卡标题')}>
            <h2>「冬日探险人格」</h2>
            <span>Winter Adventure Personality</span>
          </div>
          <p className="wgh-paper-copy" {...editor.editProps('personality-copy', '人格卡正文')}>点击解锁你的「冬日探险人格」<br />开启热血副本！</p>
          <button className="wgh-brown-button" type="button" onClick={() => setTested(true)} {...editor.editProps('personality-button', '人格测试按钮')}>{tested ? '已解锁人格' : '点击测试'} <span aria-hidden="true">▶</span></button>
        </section>

        <section className="wgh-breakout">
          <div className="wgh-breakout-title">
            <img className="wgh-breakout-lockup" src="/assets/winter-gathering/breakout-title-lockup-v4.png" alt="趣味破冰场，开溜！" />
            <h2 className="sr-only">趣味破冰场</h2>
          </div>
          <div className="wgh-breakout-meta" {...editor.editProps('breakout-meta', '破冰场说明与日期')}><p>拒绝冻手冻脚 · 就要动力全开！</p><span><small>时间：</small>[2月28日–2月9日]</span></div>
          <div className="wgh-route-map">
            <div className="wgh-route-item is-one" {...editor.editProps('breakout-route-1', '破冰场路线一')}><i className="wgh-scene-crop" role="img" aria-label="俯瞰蓝紫色雪谷的旅行者" /><span>新手友好：松花湖</span></div>
            <b className="wgh-route-arrow is-one" aria-hidden="true">➜</b>
            <div className="wgh-route-item is-two" {...editor.editProps('breakout-route-2', '破冰场路线二')}><span>落日绝佳：阿勒泰将军山</span><i className="wgh-scene-crop" role="img" aria-label="雪山前的暖光玻璃木屋" /></div>
            <b className="wgh-route-arrow is-two" aria-hidden="true">➜</b>
            <div className="wgh-route-item is-three" {...editor.editProps('breakout-route-3', '破冰场路线三')}><i className="wgh-scene-crop" role="img" aria-label="望向雪山的落地窗木屋" /><span>森林胜地：可可托海</span></div>
            <b className="wgh-route-arrow is-three" aria-hidden="true">➜</b>
            <div className="wgh-route-item is-four" {...editor.editProps('breakout-route-4', '破冰场路线四')}><span>家庭度假：万龙</span><i className="wgh-scene-crop" role="img" aria-label="穿越白色雪坡的滑雪者" /></div>
            <b className="wgh-route-arrow is-four" aria-hidden="true">➜</b>
          </div>
          <div className="wgh-breakout-footer"><div className="wgh-breakout-deer"><img src="/assets/winter-gathering/winter-reindeer.png" alt="两只白色麋鹿" /><i /><i /><i /></div><div className="wgh-breakout-action" {...editor.editProps('breakout-action', '破冰场任务按钮区')}><small>领取任务即得冬日勋章</small><button className="wgh-blue-button" type="button" onClick={() => setJoined(true)}>{joined ? '已领取任务' : '领取任务'} <span aria-hidden="true">▶</span></button></div></div>
        </section>

        <section className="wgh-diary-v2">
          <img src="/assets/winter-gathering/winter-diary-art-v2.jpg" alt="雪原穿越日记：两位冬日伙伴围坐在营火旁" />
          <div className="wgh-diary-copy" {...editor.editProps('diary-copy', '雪原日记正文区')}>
            <h3>把烦恼，冻在外面</h3>
            <small>一份写给冬天的出发邀请</small>
            <p><b>时间</b>｜12月20日—12月29日<br /><b>地点</b>｜北京 · 哈尔滨 · 乌鲁木齐<br /><b>活动方式</b>｜完成雪原任务，记录你的冬日高光。</p>
            <button className="wgh-blue-button" type="button" onClick={() => setJoined(true)}>{joined ? '报名成功' : '点击报名'} <span aria-hidden="true">▶</span></button>
          </div>
        </section>

        <div className="wgh-tail-flow">
          <section className="wgh-tail-module wgh-spa-module">
            <div className="wgh-spa-title-crop"><img src="/assets/winter-gathering/spa-module-lockup-v6.jpg" alt="冬天泉力一赴" /></div>
            <div className="wgh-spa-carousel-wrap" {...editor.editProps('spa-carousel', '温泉轮播组件')}>
              <div
                ref={spaCarouselRef}
                className="wgh-spa-carousel"
                aria-label="温泉场景轮播"
                onScroll={(event) => setSpaSlide(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}
              >
                {SPA_SLIDES.map((slide) => <figure key={slide.src}><img src={slide.src} alt={slide.alt} /></figure>)}
              </div>
              <div className="wgh-spa-dots" aria-label="选择温泉场景">
                {SPA_SLIDES.map((slide, index) => <button key={slide.src} className={spaSlide === index ? 'is-active' : ''} type="button" aria-label={`查看第 ${index + 1} 张温泉场景`} onClick={() => goToSpaSlide(index)} />)}
              </div>
            </div>
            <div className="wgh-spa-action" {...editor.editProps('spa-action', '温泉解锁按钮区')}>
              <button className="wgh-tail-primary" type="button" onClick={() => setJoined(true)}>{joined ? '已解锁体验' : '立即解锁'} <span aria-hidden="true">▶</span></button>
              <p>活动规则<br /><b>当前能量值：0</b></p>
            </div>
            <div className="wgh-tail-task-list" {...editor.editProps('spa-tasks', '温泉任务列表')}>
              <p><span><b>浏览温泉馆</b><small>在雪落的露天汤池打卡 · +2 能量值</small></span><button type="button">去查看</button></p>
              <p><span><b>搜索“冬日探险家召集令”</b><small>收藏一处暖冬目的地 · +3 能量值</small></span><button type="button">去搜索</button></p>
              <p><span><b>分享暖冬地图</b><small>首次分享给同行好友 · +5 能量值</small></span><button type="button">去分享</button></p>
            </div>
          </section>

          <section className="wgh-tail-module wgh-snow-module">
            <div className="wgh-snow-title-crop">
              <img className="wgh-module-lockup" src="/assets/winter-gathering/snow-title-lockup-v6.png" alt="GO！去雪地里撒点野" />
            </div>
            <div className="wgh-module-meta" {...editor.editProps('snow-meta', '撒点野日期说明')}><b>城市公园 ·「社交雪球王」的狂欢节</b><time>1月1日—1月30日</time></div>
            <div className="wgh-snow-route" aria-label="雪地活动亮点">
              <img className="wgh-snow-photo is-one" src="/assets/winter-gathering/snow-scene-snowman-v6.jpg" alt="夜晚雪地里的创意雪人" />
              <div className="wgh-snow-copy is-one" {...editor.editProps('snow-copy-1', '撒点野说明一')}><b>自由组队</b><span>随机匹配冬日搭档<br />领取同伴任务</span></div>
              <i className="wgh-snow-arrow is-one" aria-hidden="true">➜</i>
              <img className="wgh-snow-photo is-two" src="/assets/winter-gathering/snow-scene-friends-v6.jpg" alt="结伴在雪地里玩耍的人们" />
              <div className="wgh-snow-copy is-two" {...editor.editProps('snow-copy-2', '撒点野说明二')}><b>雪人创意赛</b><span>比拼脑洞造型<br />赢取暖冬大奖</span></div>
              <i className="wgh-snow-arrow is-two" aria-hidden="true">➜</i>
              <img className="wgh-snow-photo is-three" src="/assets/winter-gathering/snow-scene-dinner-v6.jpg" alt="雪山下的冬日野餐" />
              <div className="wgh-snow-copy is-three" {...editor.editProps('snow-copy-3', '撒点野说明三')}><b>在雪地里围着篝火野餐</b><span>解锁冬日限定菜单</span></div>
              <i className="wgh-snow-arrow is-three" aria-hidden="true">➜</i>
              <img className="wgh-snow-mascot" src="/assets/winter-gathering/snow-mascot-v6.png" alt="" aria-hidden="true" />
              <button className="wgh-tail-primary" type="button" onClick={() => setJoined(true)} {...editor.editProps('snow-action', '撒点野解锁按钮')}>{joined ? '任务已领取' : '立即解锁'} <span aria-hidden="true">▶</span></button>
            </div>
          </section>

          <section className="wgh-tail-module wgh-gear-module">
            <div className="wgh-gear-visual">
              <img className="wgh-module-lockup" src="/assets/winter-gathering/gear-module-lockup-v5.jpg" alt="一路开挂：冬季户外品牌与滑雪装备陈列板" />
              <p className="wgh-gear-subtitle" {...editor.editProps('gear-subtitle', '一路开挂副标题')}>冬天这个副本<br />没点「物理外挂」怎么行？</p>
              <button className="wgh-tv-action" type="button" onClick={() => setJoined(true)} {...editor.editProps('tv-action', '电视抽奖按钮')}>{joined ? '已抽奖' : '点击抽奖'} <span aria-hidden="true">▶</span></button>
            </div>
          </section>

          <div className="wgh-search-tail" role="search" aria-label="搜索冬日召集令" {...editor.editProps('search-tail', '页尾搜索框')}>
            <span>驴途</span><b aria-hidden="true">⌕</b><strong>冬日召集令</strong>
          </div>
        </div>
      </main>
      {embedded ? (
        <H5LayoutSelectionOverlay
          items={WINTER_GATHERING_EDITABLE_ITEMS}
          enabled={editor.enabled}
          selectedId={editor.selectedId}
          selectionBox={editor.selectionBox}
          onResizePointerDown={editor.onResizePointerDown}
        />
      ) : (
        <H5LayoutEditorChrome
          items={WINTER_GATHERING_EDITABLE_ITEMS}
          {...editor}
        />
      )}
    </div>
  )
}

export default WinterGatheringH5
