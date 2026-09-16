import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Sparkles } from '@/shared/icons'
import InspirationCaseDetail, { EARTH_VILLAGE_FULL_PROMPT } from './InspirationCaseDetail'

export interface InspirationItem {
  id: string
  title: string
  author: string
  description: string
  creativeType: string
  publishedAt: string
  sourceUrl: string
  assetCount: number
  mediaType: 'image' | 'video'
  mediaUrl: string
  posterUrl?: string
}

export type InspirationProductCategory =
  | 'all'
  | 'campaign'
  | 'interest'
  | 'creative'
  | 'game'
  | 'app'
  | 'operations'

export type InspirationSourceFilter = 'all' | 'network' | 'magicx' | 'workshop'

const FALLBACK_ITEMS: InspirationItem[] = [
  {
    id: 'fallback-h5',
    title: '选择模板生成海报 H5 案例',
    author: '全网灵感',
    description: '选择模板、上传照片并生成专属海报的互动案例。',
    creativeType: '互动玩法',
    publishedAt: '',
    sourceUrl: '',
    assetCount: 5,
    mediaType: 'image',
    mediaUrl: '/assets/xiahua/head-kv.png',
  },
  {
    id: 'fallback-live',
    title: '直播赛事移动端活动页',
    author: '全网灵感',
    description: '直播赛事活动长页，包含榜单、任务、赛程和奖励模块。',
    creativeType: '活动视觉',
    publishedAt: '',
    sourceUrl: '',
    assetCount: 8,
    mediaType: 'image',
    mediaUrl: '/assets/workshop/resources/ed_11-6.webp',
  },
  {
    id: 'fallback-character',
    title: '月夜幻想角色海报',
    author: '全网灵感',
    description: '东方幻想人物与电影感光影结合的角色视觉。',
    creativeType: 'IP 与角色',
    publishedAt: '',
    sourceUrl: '',
    assetCount: 3,
    mediaType: 'image',
    mediaUrl: '/assets/acg-new-year/cover-moon.jpg',
  },
  {
    id: 'fallback-card',
    title: 'Knight of Wands 卡牌',
    author: '全网灵感',
    description: '复古塔罗构图与游戏收藏卡质感。',
    creativeType: '游戏视觉',
    publishedAt: '',
    sourceUrl: '',
    assetCount: 4,
    mediaType: 'image',
    mediaUrl: '/assets/workshop/inspire/card-knight-of-wands.webp',
  },
]

function isInspirationItem(value: unknown): value is InspirationItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<InspirationItem>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.mediaUrl === 'string' &&
    (item.mediaType === 'image' || item.mediaType === 'video')
  )
}

function itemText(item: InspirationItem) {
  return `${item.title} ${item.description} ${item.creativeType}`.toLowerCase()
}

function productCategoryOf(item: InspirationItem): Exclude<InspirationProductCategory, 'all'> {
  const text = itemText(item)
  if (/游戏|game|card game|character|角色|卡牌|sprite|像素/.test(text)) return 'game'
  if (/兴趣卡|心理|测试|问答|quiz|tarot|推荐卡/.test(text)) return 'interest'
  if (/活动|campaign|营销|互动玩法|社交互动|抽奖|集卡|h5|广告|ecommerce/.test(text)) return 'campaign'
  if (/网站|网页|web|landing|saas|app|应用|小程序|technology|fintech/.test(text)) return 'app'
  if (/提案|策划|报告|脚本|内容与编辑|editorial|research|分析/.test(text)) return 'operations'
  return 'creative'
}

function sourceOf(item: InspirationItem): Exclude<InspirationSourceFilter, 'all'> {
  const text = `${item.id} ${item.author}`.toLowerCase()
  if (text.includes('magicx') || text.includes('magic x')) return 'magicx'
  if (item.sourceUrl || text.includes('motionsites') || text.includes('design radar')) return 'network'
  return 'workshop'
}

const SECONDARY_KEYWORDS: Record<string, RegExp> = {
  集卡抽奖: /集卡|抽卡|抽奖|兑奖|刮奖|摇奖|换赠卡|卡册|拼图|积分兑换|兑好礼/,
  节日会场: /节日|会场|新年|春节|元旦|中秋|端午|七夕|圣诞|双11|双十二/,
  直播互动: /直播|live|弹幕|留言|许愿|祝福/,
  测评答题: /测评|答题|问答|测试|quiz|mbti/,
  榜单投票: /榜单|排行|排名|投票|vote|评选|话题|pk|对战/,
  体育赛事: /体育|赛事|足球|篮球|世界杯|奥运|运动会/,
  年度盘点: /年度|年终|盘点|回顾|总结/,
  兴趣卡模板: /兴趣卡|模板/,
  心理测试: /心理|测试|mbti/,
  知识问答: /知识|问答|答题|单词|鉴赏|猜猜/,
  推荐卡: /推荐|评测|对比/,
  工具卡: /工具|查询|助手/,
  海报: /海报|poster/,
  '活动 KV': /活动|campaign|kv/,
  '资源位 / Banner': /资源位|banner|广告位/,
  直播间背景: /直播|live/,
  社媒视觉: /社媒|social/,
  动效视频: /动效|motion|video|视频/,
  网页游戏: /网页游戏|web game/,
  游戏卡牌: /游戏卡牌|card game|塔罗|卡牌/,
  角色立绘: /角色|character|立绘/,
  场景原画: /场景|environment|原画/,
  '道具与 UI': /道具|图标|ui/,
  动画特效: /动画|特效|sprite|vfx/,
  小程序: /小程序|mini app/,
  '网站 / Web App': /网站|网页|web|landing|saas/,
  'AI 分身': /分身|avatar/,
  自动化工具: /自动化|automation|工具/,
  运营提案: /运营|提案|策划/,
  内容规划: /内容规划|content plan/,
  脚本创作: /脚本|script/,
  分析报告: /分析|报告|report/,
  热点研究: /热点|热榜|research/,
}

function InspirationMedia({ item }: { item: InspirationItem }) {
  if (item.mediaType === 'video') {
    return <InspirationVideo item={item} />
  }

  return (
    <div className="bg-[#F2F3F5]">
      <img
        src={item.mediaUrl}
        alt={item.title}
        loading="lazy"
        className="h-auto max-h-[520px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
      />
    </div>
  )
}

function InspirationVideo({ item }: { item: InspirationItem }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // React sets the muted property after insertion; some browsers evaluate
    // autoplay earlier and reject it. Mark the default state before retrying.
    video.defaultMuted = true
    video.muted = true
    const play = () => video.play().catch(() => undefined)
    if (!('IntersectionObserver' in window)) {
      void play()
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void play()
        else video.pause()
      },
      { rootMargin: '160px 0px' },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [item.mediaUrl])

  return (
    <div className="relative bg-[#F2F3F5]">
      <video
        ref={videoRef}
        src={item.mediaUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={item.posterUrl}
        className="h-auto max-h-[520px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
      />
    </div>
  )
}

export default function MioraInspirationGallery({
  onPick,
  productCategory = 'all',
  secondaryCategory = '全部',
  sourceFilter = 'all',
}: {
  onPick: (item: InspirationItem) => void
  productCategory?: InspirationProductCategory
  secondaryCategory?: string
  sourceFilter?: InspirationSourceFilter
}) {
  const [items, setItems] = useState<InspirationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [detailItem, setDetailItem] = useState<InspirationItem | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const loadSource = async (url: string) => {
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = (await response.json()) as { items?: unknown[] }
      return Array.isArray(payload.items) ? payload.items.filter(isInspirationItem) : []
    }

    Promise.allSettled([loadSource('/api/motionsites'), loadSource('/api/design-radar')])
      .then(([motionSitesResult, designRadarResult]) => {
        const motionSitesItems = motionSitesResult.status === 'fulfilled' ? motionSitesResult.value : []
        const designRadarItems = designRadarResult.status === 'fulfilled' ? designRadarResult.value : []
        const mergedItems: InspirationItem[] = []
        const longest = Math.max(motionSitesItems.length, designRadarItems.length)
        for (let index = 0; index < longest; index += 1) {
          if (motionSitesItems[index]) mergedItems.push(motionSitesItems[index])
          if (designRadarItems[index]) mergedItems.push(designRadarItems[index])
        }
        setItems(mergedItems)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const visibleItems = useMemo(() => {
    const sourceItems = items.length ? items : FALLBACK_ITEMS
    const secondaryMatcher = SECONDARY_KEYWORDS[secondaryCategory]
    return sourceItems.filter((item) => {
      if (productCategory !== 'all' && productCategoryOf(item) !== productCategory) return false
      if (sourceFilter !== 'all' && sourceOf(item) !== sourceFilter) return false
      if (secondaryCategory !== '全部' && secondaryMatcher && !secondaryMatcher.test(itemText(item))) return false
      return true
    })
  }, [items, productCategory, secondaryCategory, sourceFilter])

  if (loading) {
    return (
      <div className="mt-3 columns-2 gap-3 md:columns-3 lg:columns-4" aria-label="正在加载全网灵感">
        {[280, 390, 330, 440, 310, 370, 420, 300, 360, 400].map((height, index) => (
          <div key={`${height}-${index}`} className="mb-3 break-inside-avoid overflow-hidden rounded-[12px] border border-black/[0.05] bg-white">
            <div className="animate-pulse bg-[#EEF0F3]" style={{ height }} />
            <div className="space-y-2 p-3">
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-[#EEF0F3]" />
              <div className="h-3 w-2/5 animate-pulse rounded bg-[#F2F3F5]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!visibleItems.length) {
    return (
      <div className="mt-3 flex min-h-[280px] flex-col items-center justify-center rounded-[16px] border border-dashed border-black/[0.08] bg-white/55 px-6 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-[#F2F4F7] text-[#1664FF]">
          <Sparkles size={19} strokeWidth={1.8} />
        </div>
        <h3 className="mt-4 text-[14px] font-medium text-[#1C1F23]">这个分类的案例正在迁入</h3>
        <p className="mt-1.5 max-w-[360px] text-[12px] leading-5 text-[#1C1F23]/45">
          分类结构已经就位，后续可将 MagicX 和 AI 工坊产物按同一规则接入。
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="mt-3 columns-2 gap-3 md:columns-3 lg:columns-4">
      {visibleItems.map((item) => (
        <article
          key={item.id}
          role={item.id === '6a421671000000001101c042' ? 'button' : undefined}
          tabIndex={item.id === '6a421671000000001101c042' ? 0 : undefined}
          onClick={() => item.id === '6a421671000000001101c042' && setDetailItem(item)}
          onKeyDown={(event) => {
            if (item.id === '6a421671000000001101c042' && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault()
              setDetailItem(item)
            }
          }}
          className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-[12px] border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(31,35,41,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/[0.10] hover:shadow-[0_12px_28px_rgba(31,35,41,0.10)] ${item.id === '6a421671000000001101c042' ? 'cursor-pointer' : ''}`}
        >
          <div className="relative overflow-hidden">
            <InspirationMedia item={item} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onPick(
                  item.id === '6a421671000000001101c042'
                    ? { ...item, description: EARTH_VILLAGE_FULL_PROMPT }
                    : item,
                )
              }}
              className="absolute bottom-3 left-3 right-3 flex h-10 translate-y-2 items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-medium text-[#1C1F23] opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Sparkles size={15} strokeWidth={1.8} />
              参考这个灵感创作
            </button>
          </div>

          <div className="p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-[10px] leading-4 text-[#1C1F23]/40">
              <span className="truncate font-medium text-[#1664FF]">{item.creativeType}</span>
              <span className="shrink-0 tabular-nums">{item.assetCount} 个素材</span>
            </div>
            <h3 className="line-clamp-2 text-[13px] font-medium leading-5 text-[#1C1F23]">{item.title}</h3>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-[11px] leading-[17px] text-[#1C1F23]/45">{item.description}</p>
            )}
            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-black/[0.05] pt-2.5 text-[10px] text-[#1C1F23]/40">
              <span className="min-w-0 truncate">
                @ {item.author} · {sourceOf(item) === 'network' ? '全网' : sourceOf(item) === 'magicx' ? 'MagicX' : 'AI 工坊'}
              </span>
              {item.sourceUrl && (
                <button
                  type="button"
                  aria-label={`打开来源：${item.title}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    window.open(item.sourceUrl, '_blank', 'noopener,noreferrer')
                  }}
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-[#1C1F23]/35 transition-colors hover:bg-[#F2F3F5] hover:text-[#1C1F23]"
                >
                  <ExternalLink size={13} strokeWidth={1.8} />
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
    {detailItem && (
      <InspirationCaseDetail
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onRecreate={(prompt) => {
          setDetailItem(null)
          onPick({ ...detailItem, description: prompt })
        }}
      />
    )}
    </>
  )
}
