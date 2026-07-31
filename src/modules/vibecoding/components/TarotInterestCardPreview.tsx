import PhoneStatusBar from '@/modules/editor/components/preview/PhoneStatusBar'
import type { TarotInterestCardConfig } from './TarotInterestCardModel'

type TarotInterestCardView = 'card' | 'landing'

export type TarotEditTarget =
  | 'feed-card'
  | 'heading'
  | 'zodiac-copy'
  | 'keyword'
  | 'card-image'
  | 'interpretation'
  | 'feed-actions'
  | 'landing-title'
  | 'landing-card'
  | 'landing-action'

export interface TarotEditSelection {
  view: TarotInterestCardView
  target: TarotEditTarget
  label: string
}

interface TarotInterestCardPreviewProps {
  view: TarotInterestCardView
  onViewChange: (view: TarotInterestCardView) => void
  config: TarotInterestCardConfig
  editing?: boolean
  selection?: TarotEditSelection | null
  onSelect?: (selection: TarotEditSelection | null) => void
}

const ASSET_ROOT = '/assets/tarot-interest-card'
const DISPLAY_FONT =
  '"American Typewriter", "Rockwell", "Times New Roman", serif'
const CHINESE_SERIF =
  '"Songti SC", "STSong", "Source Han Serif SC", "Noto Serif CJK SC", serif'

function FeedInterestCard({
  onViewChange,
  config,
  editing = false,
  selection,
  onSelect,
}: Pick<
  TarotInterestCardPreviewProps,
  'onViewChange' | 'config' | 'editing' | 'selection' | 'onSelect'
>) {
  const selectTarget = (
    event: React.MouseEvent,
    target: TarotEditTarget,
    label: string,
  ) => {
    if (!editing) return
    event.stopPropagation()
    onSelect?.({ view: 'card', target, label })
  }
  const targetClass = (target: TarotEditTarget) =>
    editing
      ? `cursor-pointer transition-[outline,box-shadow] hover:outline hover:outline-1 hover:outline-[#2e90fa]/70 ${
          selection?.target === target
            ? 'outline outline-2 outline-[#2e90fa] outline-offset-2'
            : ''
        }`
      : ''

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black text-white"
      onClick={editing ? () => onSelect?.(null) : undefined}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-[612.051px]">
        <img
          src={`${ASSET_ROOT}/feed-bg.png`}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-x-0 top-0 h-[76px] bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"
      />
      <p
        aria-hidden
        className="absolute left-[18.3px] top-[141px] text-[43.7px] leading-[38px] text-[#c5986e] opacity-20 mix-blend-overlay"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        ASTROLOGY
      </p>
      <p
        aria-hidden
        className="absolute left-[18.3px] top-[447px] text-[44px] leading-[38px] text-[#c5986e] opacity-20 mix-blend-overlay"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        ASTROLOGY
      </p>

      <div className="absolute inset-x-0 top-0 z-20 h-[43.432px]">
        <PhoneStatusBar />
      </div>

      <nav
        aria-label="抖音频道"
        className="absolute inset-x-0 top-[43.432px] z-20 h-[35.389px]"
      >
        <img
          src={`${ASSET_ROOT}/feed-menu.svg`}
          alt=""
          aria-hidden
          className="absolute left-[16.1px] top-[9.4px] h-[12px] w-[16px]"
        />
        <div className="absolute left-[44px] top-[5.8px] flex items-start gap-[15px] text-[13.67px] font-medium leading-[18px] text-white/75">
          <span>经验</span>
          <span>同城</span>
          <span>关注</span>
          <span>商城</span>
          <span className="relative text-white/90">
            推荐
            <span
              aria-hidden
              className="absolute left-[7px] top-[16px] text-[7px] leading-none text-white/80"
            >
              ⌃
            </span>
          </span>
        </div>
        <img
          src={`${ASSET_ROOT}/feed-search.svg`}
          alt=""
          aria-hidden
          className="absolute right-[16.8px] top-[9.8px] h-[17px] w-[17px]"
        />
      </nav>

      <div
        aria-hidden
        className="absolute left-[260px] top-[106.5px] z-10 flex size-[26.7px] items-center justify-center text-[24px] font-light text-[#e8c093]/70"
      >
        ✦
      </div>

      <header
        onClick={(event) => selectTarget(event, 'heading', '标题与生成标记')}
        className={`absolute left-[17.49px] top-[135.92px] z-20 flex h-[31.8px] w-[275px] items-center justify-between rounded ${targetClass('heading')}`}
      >
        <h2 className="text-balance text-[22.256px] font-bold leading-[31.795px] tracking-[-0.35px] text-[#fbd1a4]">
          {config.signName} · 今日关键词
        </h2>
        <span className="flex h-[15.897px] w-[34.179px] items-center justify-center rounded-[3.179px] border border-white/10 text-[9.538px] leading-none text-white/40">
          {config.aiLabel}
        </span>
      </header>

      <img
        src={`${ASSET_ROOT}/feed-card-shell.png`}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute left-[12.72px] top-[177.26px] z-10 h-[319.538px] w-[284.564px]"
      />

      <section
        aria-label={`${config.signName}今日${config.keyword}关键词`}
        onClick={(event) => selectTarget(event, 'feed-card', '兴趣卡整体')}
        className={`absolute left-[12.72px] top-[177.26px] z-20 h-[238.5px] w-[284.564px] overflow-hidden rounded-[12.718px] border-[0.715px] border-[#fbc5a4] ${targetClass('feed-card')}`}
      >
        <img
          src={`${ASSET_ROOT}/feed-bg.png`}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-black/60" />

        <div
          onClick={(event) => selectTarget(event, 'zodiac-copy', '星座文案')}
          className={`absolute left-[15.9px] top-[15.8px] rounded text-[31.795px] uppercase leading-[28.615px] text-[#fbc5a4] ${targetClass('zodiac-copy')}`}
          style={{ fontFamily: DISPLAY_FONT }}
        >
          <p>ZODIAC</p>
          <p>{config.signEnglish}</p>
        </div>

        <p
          onClick={(event) => selectTarget(event, 'zodiac-copy', '星座文案')}
          className={`absolute left-[15.9px] top-[75.8px] rounded text-[12.718px] font-black leading-none text-[#fbc5a4] ${targetClass('zodiac-copy')}`}
          style={{ fontFamily: CHINESE_SERIF }}
        >
          {config.dateRange}
        </p>

        <div
          onClick={(event) => selectTarget(event, 'keyword', '今日关键词')}
          className={`absolute left-[34.2px] top-[128.7px] rounded text-center text-[31.795px] font-bold leading-[45.308px] text-[#fbc5a4] ${targetClass('keyword')}`}
          style={{ fontFamily: CHINESE_SERIF }}
        >
          {Array.from(config.keyword).map((character, index) => (
            <p key={`${character}-${index}`}>{character}</p>
          ))}
        </div>
        <div
          className="absolute left-[15.9px] top-[177.1px] text-center text-[11.923px] font-black leading-[15.103px] text-[#fbc5a4]"
          style={{ fontFamily: CHINESE_SERIF }}
        >
          <p>关</p>
          <p>键</p>
          <p>词</p>
        </div>

        <div
          onClick={(event) => selectTarget(event, 'card-image', '星座牌面')}
          className={`absolute left-[141.49px] top-[15.89px] h-[205.872px] w-[127.64px] rounded-[9.538px] border-[1.59px] border-[#f5d7b3] bg-[#f5d7b3] ${targetClass('card-image')}`}
        >
          <div className="absolute left-[2.4px] top-[2.39px] h-[175.667px] w-[119.2px] overflow-hidden rounded-[6.359px] border-[1.192px] border-[#150100]">
            <img
              src={config.cardImage}
              alt={`${config.signName}卡面插画`}
              draggable={false}
              className="absolute left-0 top-[-5.7px] h-[212.75px] w-full object-cover"
            />
          </div>
          <p
            className="absolute inset-x-0 bottom-[4.6px] text-center text-[12.718px] leading-none tracking-[0.76px] text-[#2a241c]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {config.signEnglish}
          </p>
        </div>
      </section>

      <div
        onClick={(event) => selectTarget(event, 'interpretation', '关键词解读')}
        className={`absolute left-[28.62px] top-[428.44px] z-20 w-[252.769px] rounded text-pretty text-[11.13px] leading-[16px] ${targetClass('interpretation')}`}
      >
        <p className="flex items-start">
          <img
            src={`${ASSET_ROOT}/feed-keyword.svg`}
            alt=""
            aria-hidden
            className="mr-[4px] mt-[1px] size-[12.718px] shrink-0"
          />
          <span className="mr-[3px] shrink-0 font-medium text-[#fbc5a4]">
            关键词解读：
          </span>
          <span className="text-white/75">{config.interpretation}</span>
        </p>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-[-2px] bottom-[66px] z-10 h-[232px] bg-gradient-to-b from-transparent via-transparent to-[#10100f]"
      />

      <div
        aria-label="卡片进度，第 1 张，共 4 张"
        className="absolute left-[15.897px] top-[519.05px] z-20 flex w-[278.206px] gap-[3.974px]"
      >
        <span className="h-[2.385px] flex-1 rounded-full bg-white/50" />
        <span className="h-[2.385px] flex-1 rounded-full bg-white/15" />
        <span className="h-[2.385px] flex-1 rounded-full bg-white/15" />
        <span className="h-[2.385px] flex-1 rounded-full bg-white/15" />
      </div>

      <div
        onClick={(event) => selectTarget(event, 'feed-actions', '操作按钮')}
        className={`absolute left-[12.718px] top-[537.338px] z-20 flex gap-[9.538px] rounded-lg ${targetClass('feed-actions')}`}
      >
        <button
          type="button"
          className="flex h-[34.974px] w-[137.513px] items-center justify-center rounded-[8px] bg-white/[0.08] text-[11.92px] font-medium text-[#ffecd3]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fbc5a4]"
        >
          {config.dismissLabel}
        </button>
        <button
          type="button"
          onClick={(event) => {
            if (editing) {
              selectTarget(event, 'feed-actions', '操作按钮')
              return
            }
            onViewChange('landing')
          }}
          className="flex h-[34.974px] w-[137.513px] items-center justify-center rounded-[8px] bg-white/20 text-[11.92px] font-medium text-[#fbc5a4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fbc5a4]"
        >
          {config.ctaLabel}
        </button>
      </div>

      <div className="absolute inset-x-0 top-[572.31px] z-20 flex h-[32.59px] items-center justify-center gap-[4px] text-[9.54px] font-medium text-[#ffecd3]/40">
        <span>上滑看更多</span>
        <img
          src={`${ASSET_ROOT}/feed-chevron.svg`}
          alt=""
          aria-hidden
          className="h-[8px] w-[8px]"
        />
      </div>

      <nav
        aria-label="抖音底部导航"
        className="absolute inset-x-0 bottom-0 z-30 h-[65.974px] bg-[#161616]"
      >
        <div className="grid h-[39.7px] grid-cols-[1fr_1fr_62px_1fr_1fr] items-center text-center text-[13.51px] font-medium">
          <span className="text-white">首页</span>
          <span className="text-white/50">朋友</span>
          <span className="flex items-center justify-center">
            <img
              src={`${ASSET_ROOT}/feed-create.svg`}
              alt="创作"
              className="h-[23.846px] w-[29.246px]"
            />
          </span>
          <span className="text-white/50">消息</span>
          <span className="text-white/50">我</span>
        </div>
        <div className="absolute bottom-[6.36px] left-1/2 h-[3.974px] w-[105.718px] -translate-x-1/2 rounded-full bg-white" />
      </nav>
    </div>
  )
}

function TarotLanding({
  onViewChange,
  config,
  editing = false,
  selection,
  onSelect,
}: Pick<
  TarotInterestCardPreviewProps,
  'onViewChange' | 'config' | 'editing' | 'selection' | 'onSelect'
>) {
  const selectTarget = (
    event: React.MouseEvent,
    target: TarotEditTarget,
    label: string,
  ) => {
    if (!editing) return
    event.stopPropagation()
    onSelect?.({ view: 'landing', target, label })
  }
  const targetClass = (target: TarotEditTarget) =>
    editing
      ? `cursor-pointer transition-[outline,box-shadow] hover:outline hover:outline-1 hover:outline-[#2e90fa]/70 ${
          selection?.target === target
            ? 'outline outline-2 outline-[#2e90fa] outline-offset-2'
            : ''
        }`
      : ''

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#24150e] text-white"
      onClick={editing ? () => onSelect?.(null) : undefined}
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <img
          src={`${ASSET_ROOT}/landing-bg.png`}
          alt=""
          draggable={false}
          className="absolute left-[-5.46%] top-0 h-full w-[110.95%]"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[86px] bg-gradient-to-b from-black/35 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[212px] bg-gradient-to-b from-transparent to-black/55"
      />

      <div className="absolute inset-x-0 top-0 z-20 h-[35px]">
        <PhoneStatusBar />
      </div>

      <div className="absolute right-[12.72px] top-[44.51px] z-20 flex h-[25.436px] w-[60.41px] items-center rounded-full border-[0.397px] border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.09] backdrop-blur-[10px]">
        <button
          type="button"
          aria-label="更多选项"
          className="flex h-full w-[30.2px] items-center justify-center rounded-l-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
        >
          <img
            src={`${ASSET_ROOT}/landing-more.svg`}
            alt=""
            aria-hidden
            className="h-[12.718px] w-[12.718px]"
          />
        </button>
        <img
          src={`${ASSET_ROOT}/landing-separator.svg`}
          alt=""
          aria-hidden
          className="h-[9.538px] w-px"
        />
        <button
          type="button"
          aria-label="返回兴趣卡"
          title="返回兴趣卡"
          onClick={() => onViewChange('card')}
          className="flex h-full w-[30.2px] items-center justify-center rounded-r-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
        >
          <img
            src={`${ASSET_ROOT}/landing-close.svg`}
            alt=""
            aria-hidden
            className="h-[12.718px] w-[12.718px]"
          />
        </button>
      </div>

      <p
        onClick={(event) => selectTarget(event, 'landing-title', '落地页标题')}
        className={`absolute left-[127.18px] top-[114.46px] z-20 rounded text-[11.128px] font-medium leading-none ${targetClass('landing-title')}`}
      >
        {config.landingAuthor}
      </p>
      <h2
        onClick={(event) => selectTarget(event, 'landing-title', '落地页标题')}
        className={`absolute inset-x-0 top-[136.72px] z-20 text-balance text-center text-[17.487px] font-semibold leading-[28.615px] [text-shadow:0_0.827px_0.827px_rgba(0,0,0,0.15)] ${targetClass('landing-title')}`}
      >
        {config.landingTitle}
      </h2>

      <div
        onClick={(event) => selectTarget(event, 'landing-card', '落地页牌面')}
        className={`absolute left-[26.67%] right-[26.67%] top-[196.33px] z-20 aspect-[540/926] overflow-hidden rounded-[9.538px] border-[0.795px] border-[#fbc5a4] bg-[#e4bb81] shadow-[0_13px_28px_rgba(43,19,5,0.34)] ${targetClass('landing-card')}`}
      >
        <img
          src={config.landingCardImage}
          alt="圣杯二塔罗牌"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <button
        type="button"
        onClick={(event) => selectTarget(event, 'landing-action', '解读按钮')}
        className={`absolute left-1/2 top-[494.41px] z-20 flex h-[37.359px] w-[262.307px] -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.12] text-[13.109px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${targetClass('landing-action')}`}
      >
        {config.landingButtonLabel}
      </button>

      <div
        aria-hidden
        className="absolute bottom-[6.36px] left-1/2 z-20 h-[3.974px] w-[105.718px] -translate-x-1/2 rounded-full bg-white"
      />
    </div>
  )
}

export default function TarotInterestCardPreview({
  view,
  onViewChange,
  config,
  editing,
  selection,
  onSelect,
}: TarotInterestCardPreviewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[47px] bg-black">
      {view === 'landing' ? (
        <TarotLanding
          onViewChange={onViewChange}
          config={config}
          editing={editing}
          selection={selection}
          onSelect={onSelect}
        />
      ) : (
        <FeedInterestCard
          onViewChange={onViewChange}
          config={config}
          editing={editing}
          selection={selection}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}
