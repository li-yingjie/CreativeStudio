import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gift,
  Pause,
  Play,
  Sparkles,
  X,
} from '@/shared/icons'
import type {
  DocumentedActivityCase,
  DocumentedActivityDeliverable,
} from './DocumentedActivityData'
import type { DocumentedPageEditorState, PageEditorElementId } from './DocumentedPageEditorState'

function editorElementVisible(editor: DocumentedPageEditorState | undefined, id: PageEditorElementId) {
  return editor?.elements[id] ?? true
}

function RuntimeNotice({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="pointer-events-none sticky top-3 z-50 mx-auto -mb-12 flex w-max max-w-[calc(100%-24px)] items-center gap-2 rounded-full bg-[#161823]/90 px-3.5 py-2 text-[10px] font-medium text-white shadow-xl backdrop-blur-md">
      <CheckCircle2 className="size-3.5 text-emerald-300" />
      <span className="truncate">{message}</span>
    </div>
  )
}

function useRuntimeNotice() {
  const [notice, setNotice] = useState('')
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 1800)
    return () => window.clearTimeout(timer)
  }, [notice])
  return [notice, setNotice] as const
}

function PhoneStatus({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <div className={`relative z-20 flex h-11 items-center justify-between px-4 text-[10px] font-medium ${dark ? 'text-white' : 'text-[#161823]'}`}>
      <span>9:41</span>
      <span className="absolute left-1/2 max-w-[180px] -translate-x-1/2 truncate text-[9px] opacity-78">{title}</span>
      <span className="tracking-[0.18em]">▮▮⌁</span>
    </div>
  )
}

function AcgVenueRuntime({ item, editor }: { item: DocumentedActivityDeliverable; editor?: DocumentedPageEditorState }) {
  const initialVenue = item.id === 'DLV-ACG-002' ? '二次元会场' : '游戏会场'
  const [venue, setVenue] = useState(initialVenue)
  const [ranking, setRanking] = useState<'热门' | '新锐'>('热门')
  const [category, setCategory] = useState(initialVenue === '游戏会场' ? '全部游戏' : '全部内容')
  const [assisted, setAssisted] = useState<Record<string, number>>({})
  const [selectedEntry, setSelectedEntry] = useState<{ title: string; src: string; heat: string } | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [visitedContent, setVisitedContent] = useState(false)
  const [notice, setNotice] = useRuntimeNotice()
  const gameEntries = [
    ['地下城新春整活', '/assets/acg-new-year/materials/03-dungeon-character.png', '12.8万'],
    ['蛋仔马上开冲', '/assets/acg-new-year/materials/05-egg-party-keyboard.png', '9.6万'],
    ['峡谷高燃名场面', '/assets/acg-new-year/materials/04-king-character.png', '8.4万'],
  ]
  const animeEntries = [
    ['新春番剧角色企划', '/assets/acg-new-year/materials/08-content-cover-party.png', '11.2万'],
    ['年度人气名场面', '/assets/acg-new-year/materials/10-content-cover-sunset.png', '7.9万'],
    ['同人创作接力', '/assets/acg-new-year/materials/11-content-cover-field.png', '6.8万'],
  ]
  const entries = venue === '游戏会场' ? gameEntries : animeEntries

  const categories = venue === '游戏会场'
    ? ['全部游戏', '地下城与勇士', '蛋仔派对', '王者荣耀']
    : ['全部内容', '番剧', '国创', '同人']

  const assist = (title: string, action: '放你一马' | '好活加马') => {
    const key = `${title}:${action}`
    setAssisted((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }))
    setNotice(`已为「${title}」${action}`)
  }

  const switchVenue = (nextVenue: '游戏会场' | '二次元会场') => {
    setVenue(nextVenue)
    setCategory(nextVenue === '游戏会场' ? '全部游戏' : '全部内容')
    setNotice(`已切换到${nextVenue}`)
  }
  const interactionCount = Object.values(assisted).reduce((total, count) => total + count, 0)
  const tasks = [
    { label: '浏览 1 个榜单作品', done: visitedContent, detail: visitedContent ? '已浏览内容详情' : '点击任一作品查看详情' },
    { label: '完成 1 次榜单互动', done: interactionCount > 0, detail: interactionCount > 0 ? `已完成 ${interactionCount} 次` : '选择“放你一马”或“好活加马”' },
    { label: '查看新锐内容榜', done: ranking === '新锐', detail: ranking === '新锐' ? '当前正在查看' : '切换榜单 Tab 完成' },
  ]

  return (
    <div className="relative mx-auto w-[390px] max-w-full overflow-hidden bg-[#FFF4DE] text-[#542B1E] shadow-[0_28px_72px_rgba(31,35,41,0.18)]">
      <RuntimeNotice message={notice} />
      {editorElementVisible(editor, 'hero') ? <div className="relative h-[360px] overflow-hidden bg-[#E95838]">
        <img
          src={venue === '游戏会场' ? '/assets/acg-new-year/exact-hero-base.png' : '/assets/acg-new-year/cover-anime.jpg'}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#A82D1A]/90" />
        <PhoneStatus title="抖音 ACG 新春会" dark />
        <div className="absolute right-3 top-12 z-10 flex gap-1.5">
          <button type="button" onClick={() => setRulesOpen(true)} className="rounded-full bg-black/36 px-3 py-2 text-[9px] text-white backdrop-blur">规则</button>
          {editor?.gameplay.shareEnabled ?? true ? <button type="button" onClick={() => setShareOpen(true)} className="rounded-full bg-black/36 px-3 py-2 text-[9px] text-white backdrop-blur">分享</button> : null}
        </div>
        <div className="absolute inset-x-5 bottom-5 text-white">
          <p className="text-[10px] font-medium text-white/76">{editor?.subtitle ?? '抖音 ACG 新春会 · 01.09—02.28'}</p>
          <h2 className="mt-1 text-[30px] font-black tracking-[-0.05em]">{editor?.title ?? '开年高燃'}</h2>
          <p className="mt-1 text-[11px] text-white/80">正在浏览 {venue}</p>
          {editor ? <button type="button" onClick={() => setNotice(editor.cta)} className="mt-3 rounded-full bg-white px-3 py-2 text-[9px] font-bold text-[#B43A23]">{editor.cta}</button> : null}
        </div>
      </div> : null}

      <div className="relative -mt-1 px-4 pb-8">
        {editorElementVisible(editor, 'navigation') ? <><div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-[0_10px_24px_rgba(128,55,27,0.12)]">
          {(['游戏会场', '二次元会场'] as const).map((label) => (
            <button key={label} type="button" onClick={() => switchVenue(label)} className={`h-10 rounded-xl text-[11px] font-semibold transition ${venue === label ? 'bg-[#EA5B37] text-white shadow-sm' : 'text-[#7B5548] hover:bg-[#FFF2EA]'}`}>{label}</button>
          ))}
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((label) => (
            <button key={label} type="button" onClick={() => { setCategory(label); setNotice(`已筛选：${label}`) }} className={`shrink-0 rounded-full border px-3 py-2 text-[9px] font-medium ${category === label ? 'border-[#5B2A1D] bg-[#5B2A1D] text-white' : 'border-[#E7D8CE] bg-white text-[#7B5548]'}`}>{label}</button>
          ))}
        </div></> : null}

        {editorElementVisible(editor, 'content') ? <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_8px_22px_rgba(128,55,27,0.09)]">
          <div className="flex items-center gap-2 px-4 pb-3 pt-4">
            <div>
              <p className="text-[9px] text-[#A16F5A]">{editor?.gameplay.packageName ?? '实时更新 · 每 10 分钟'}</p>
              <h3 className="mt-0.5 text-[17px] font-bold">开年高燃作品榜</h3>
            </div>
            <div className="ml-auto flex rounded-full bg-[#F7EEE9] p-1">
              {(['热门', '新锐'] as const).map((label) => <button key={label} type="button" onClick={() => setRanking(label)} className={`rounded-full px-3 py-1.5 text-[9px] ${ranking === label ? 'bg-[#5B2A1D] text-white' : 'text-[#7B5548]'}`}>{label}</button>)}
            </div>
          </div>
          <div className="divide-y divide-[#F2E7E0]">
            {entries.map(([title, src, heat], index) => (
              <article key={title} className="grid grid-cols-[20px_48px_minmax(0,1fr)] items-center gap-3 px-3 py-3">
                <span className={`w-5 text-center text-[15px] font-black ${index === 0 ? 'text-[#F15B3A]' : 'text-[#B68B78]'}`}>{index + 1}</span>
                <button type="button" onClick={() => { setSelectedEntry({ title, src, heat }); setVisitedContent(true) }} aria-label={`查看${title}`} className="size-12 overflow-hidden rounded-xl bg-[#F8EEE7]"><img src={src} alt="" className="size-full object-cover" /></button>
                <div className="min-w-0">
                  <button type="button" onClick={() => { setSelectedEntry({ title, src, heat }); setVisitedContent(true) }} className="block max-w-full truncate text-left text-[11px] font-semibold">{title}</button>
                  <p className="mt-1 text-[9px] text-[#9A7564]">{ranking}热度 {heat}</p>
                  <div className="mt-2 flex gap-1.5">
                    {(['放你一马', '好活加马'] as const).map((action) => {
                      const count = assisted[`${title}:${action}`] ?? 0
                      return <button key={action} type="button" onClick={() => assist(title, action)} className={`rounded-full px-2.5 py-1.5 text-[8px] font-semibold ${count ? 'bg-[#FFF0E9] text-[#E95635]' : action === '放你一马' ? 'bg-[#EA5B37] text-white' : 'border border-[#E9B39F] text-[#B94A2E]'}`}>{count ? `${action} ${count}` : action}</button>
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section> : null}

        {editorElementVisible(editor, 'footer') && (editor?.gameplay.taskEnabled ?? true) ? <section className="mt-4 rounded-2xl bg-[#5A2C22] p-4 text-white">
          <div className="flex items-end justify-between"><div><p className="text-[9px] text-white/58">会场任务</p><h3 className="mt-1 text-[17px] font-bold">跟着榜单完成参与</h3></div><span className="text-[9px] text-white/50">{tasks.filter((task) => task.done).length}/{tasks.length}</span></div>
          <div className="mt-3 space-y-2">
            {tasks.map((task) => <button key={task.label} type="button" onClick={() => setNotice(task.done ? `${task.label} · 已完成` : task.detail)} className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-left hover:bg-white/16"><span className={`grid size-6 shrink-0 place-items-center rounded-full text-[9px] ${task.done ? 'bg-emerald-400 text-[#173A29]' : 'bg-white/10 text-white/60'}`}>{task.done ? '✓' : '·'}</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold">{task.label}</span><span className="mt-0.5 block text-[8px] text-white/50">{task.detail}</span></span></button>)}
          </div>
          <p className="mt-3 text-[8px] leading-4 text-white/42">每日参与上限 {editor?.gameplay.dailyLimit ?? 3} 次；奖励方案尚未确认，不在演示中虚构权益。</p>
        </section>
        : null}
      </div>

      {selectedEntry ? (
        <div role="dialog" aria-modal="true" aria-label="榜单作品详情" className="absolute inset-0 z-40 flex items-start justify-center bg-[#2F160F]/64 px-4 pt-24 backdrop-blur-sm">
          <div className="w-full overflow-hidden rounded-[28px] bg-[#FFF8EF] shadow-2xl">
            <div className="relative h-56 overflow-hidden bg-[#E95A39]">
              <img src={selectedEntry.src} alt={selectedEntry.title} className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3B1710]/85 via-transparent to-black/10" />
              <button type="button" onClick={() => setSelectedEntry(null)} aria-label="关闭作品详情" className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur"><X className="size-4" /></button>
              <div className="absolute inset-x-5 bottom-4 text-white">
                <p className="text-[9px] text-white/66">{venue} · {category}</p>
                <h3 className="mt-1 text-[22px] font-black">{selectedEntry.title}</h3>
                <p className="mt-1 text-[9px] text-white/72">{ranking}榜热度 {selectedEntry.heat}</p>
              </div>
            </div>
            <div className="p-5 text-[#542B1E]">
              <p className="text-[10px] leading-5 text-[#8A6658]">浏览作品后可选择一种榜单互动。互动会立即回写当前演示的任务进度，但不虚构正式票数、奖品或权益。</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(['放你一马', '好活加马'] as const).map((action) => {
                  const count = assisted[`${selectedEntry.title}:${action}`] ?? 0
                  return (
                    <button key={action} type="button" onClick={() => assist(selectedEntry.title, action)} className={`h-11 rounded-full text-[10px] font-bold ${action === '放你一马' ? 'bg-[#EA5B37] text-white' : 'border border-[#D78C73] bg-white text-[#AF4027]'}`}>
                      {action}{count > 0 ? ` · ${count}` : ''}
                    </button>
                  )
                })}
              </div>
              <button type="button" onClick={() => setSelectedEntry(null)} className="mt-3 h-10 w-full rounded-full bg-[#F2E7DF] text-[9px] font-semibold text-[#795548]">返回榜单</button>
            </div>
          </div>
        </div>
      ) : null}

      {rulesOpen ? (
        <div role="dialog" aria-modal="true" aria-label="活动规则" className="absolute inset-0 z-40 bg-[#FFF8EF] text-[#542B1E]">
          <div className="flex h-14 items-center justify-between border-b border-[#EEDFD5] px-4">
            <span className="size-8" />
            <h3 className="text-[14px] font-black">活动规则</h3>
            <button type="button" onClick={() => setRulesOpen(false)} aria-label="关闭活动规则" className="grid size-8 place-items-center rounded-full bg-black/5"><X className="size-4" /></button>
          </div>
          <div className="px-5 py-6">
            <img src="/assets/figma-deliverables/acg/topic-header-banner.png" alt="抖音 ACG 新春会" className="aspect-[4/1.28] w-full rounded-2xl object-cover" />
            <p className="mt-5 text-[9px] font-semibold text-[#D94F31]">本演示已还原的核心流程</p>
            <div className="mt-3 space-y-3">
              {[
                ['01', '选择内容会场', '在游戏与二次元两个分会场间切换，并按内容分类浏览。'],
                ['02', '浏览榜单作品', '查看热门或新锐榜单，进入具体作品详情了解当前内容。'],
                ['03', '完成榜单互动', '通过“放你一马”或“好活加马”表达偏好，互动结果回写任务进度。'],
              ].map(([num, title, detail]) => (
                <div key={num} className="flex gap-3 rounded-2xl border border-[#EDDED5] bg-white p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#EA5B37] text-[9px] font-bold text-white">{num}</span>
                  <div><p className="text-[11px] font-bold">{title}</p><p className="mt-1 text-[9px] leading-4 text-[#8D6C5D]">{detail}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-[#5A2C22] p-4 text-white">
              <p className="text-[10px] font-semibold">奖励与频控尚待业务确认</p>
              <p className="mt-1 text-[8px] leading-4 text-white/56">当前设计证据没有给出奖品、库存、每日次数与反刷阈值，因此这些字段不会在演示中伪造成已配置。</p>
            </div>
            <button type="button" onClick={() => setRulesOpen(false)} className="mt-5 h-11 w-full rounded-full bg-[#EA5B37] text-[11px] font-bold text-white">知道了，去看榜单</button>
          </div>
        </div>
      ) : null}

      {shareOpen ? (
        <div role="dialog" aria-modal="true" aria-label="分享活动" className="absolute inset-0 z-40 flex items-start justify-center bg-[#2F160F]/68 px-5 pt-24 backdrop-blur-sm">
          <div className="w-full rounded-[28px] bg-[#FFF8EF] p-5 text-center text-[#542B1E] shadow-2xl">
            <button type="button" onClick={() => setShareOpen(false)} aria-label="关闭分享面板" className="ml-auto grid size-8 place-items-center rounded-full bg-black/5"><X className="size-4" /></button>
            <img src="/assets/figma-deliverables/acg/topic-header-banner.png" alt="ACG 新春会分享卡" className="mt-1 aspect-[4/1.28] w-full rounded-2xl object-cover" />
            <p className="mt-5 text-[9px] text-[#9A7564]">抖音 ACG 新春会</p>
            <h3 className="mt-1 text-[21px] font-black">分享开年高燃会场</h3>
            <p className="mt-2 text-[9px] leading-4 text-[#8A6658]">分享卡复用已提取的真实活动资源位，不另造一张与项目无关的示意图。</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setNotice('活动口令已复制'); setShareOpen(false) }} className="h-11 rounded-full border border-[#DFA18B] bg-white text-[10px] font-bold text-[#B6452B]">复制活动口令</button>
              <button type="button" onClick={() => { setNotice('分享卡已生成'); setShareOpen(false) }} className="h-11 rounded-full bg-[#EA5B37] text-[10px] font-bold text-white">生成分享卡</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const FOOD_CARDS = [
  ['/assets/xiahua/food-huoguo.png', '沸腾火锅'],
  ['/assets/xiahua/food-longxia.png', '红火小龙虾'],
  ['/assets/xiahua/food-kaorou.png', '滋滋烤肉'],
  ['/assets/xiahua/food-huangyu.png', '鲜烧黄鱼'],
  ['/assets/xiahua/food-pisa.png', '浓香披萨'],
  ['/assets/xiahua/food-zhaji.png', '香脆炸鸡'],
  ['/assets/xiahua/food-ningcha.png', '清凉柠茶'],
  ['/assets/xiahua/food-luwei-grey.png', '解馋卤味'],
  ['/assets/xiahua/food-luosifen-grey.png', '上头螺蛳粉'],
] as const

const WATER_CARDS = [
  ['/assets/xiahua/outfits/beach-vacation.png', '海边度假装'],
  ['/assets/xiahua/outfits/bird-sport.png', '飞鸟运动装'],
  ['/assets/xiahua/outfits/mono-street.png', '黑白街头装'],
] as const

function XiahuaRuntime({ item, editor }: { item: DocumentedActivityDeliverable; editor?: DocumentedPageEditorState }) {
  const isFood = ['DLV-XIA-011', 'DLV-XIA-012', 'DLV-XIA-013'].includes(item.id)
  const isWaterStageB = item.id === 'DLV-XIA-002'
  const isWaterFull = item.id === 'DLV-XIA-003'
  const [notice, setNotice] = useRuntimeNotice()
  const [draws, setDraws] = useState(isFood ? 5 : 4)
  const [owned, setOwned] = useState(isFood ? 3 : 1)
  const [taskCompleted, setTaskCompleted] = useState<Record<string, boolean>>({ 浏览活动主会场: true })
  const [claimedTiers, setClaimedTiers] = useState<number[]>([])
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(item.id === 'DLV-XIA-009')
  const [selectedHorse, setSelectedHorse] = useState(1)
  const [horseConfirmed, setHorseConfirmed] = useState(false)
  const [arStamped, setArStamped] = useState(false)
  const [exchangeDone, setExchangeDone] = useState(false)
  const [infoPanel, setInfoPanel] = useState<'rules' | 'share' | null>(null)

  if (item.id === 'DLV-XIA-012') {
    const horses = ['/assets/xiahua/mascot-horse-v2.png', '/assets/xiahua/mascot-horse-v3.png', '/assets/xiahua/mascot.png']
    return (
      <div className="relative mx-auto min-h-[820px] w-[390px] max-w-full overflow-hidden bg-[radial-gradient(circle_at_50%_12%,#FFE990,#FF8156_48%,#632E1E)] text-white shadow-[0_28px_72px_rgba(31,35,41,0.18)]">
        <RuntimeNotice message={notice} /><PhoneStatus title={editor?.title ?? '选择你的夏日搭子'} dark />
        {editorElementVisible(editor, 'hero') ? <div className="px-5 pb-10 pt-8 text-center"><p className="text-[10px] text-white/70">进入夜食会场前</p><h2 className="mt-2 text-[30px] font-black">{editor?.title ?? '选择一匹小马'}</h2><p className="mt-2 text-[11px] text-white/68">{editor?.subtitle ?? '不同角色会带来专属开场动作'}</p></div> : null}
        <div className="flex items-end justify-center gap-1 px-3">
          {horses.map((src, index) => <button key={src} type="button" onClick={() => setSelectedHorse(index)} aria-label={`选择第 ${index + 1} 匹小马`} className={`relative h-[300px] flex-1 rounded-[28px] border transition ${selectedHorse === index ? 'border-white bg-white/20 -translate-y-3 shadow-xl' : 'border-white/15 bg-black/8 opacity-72'}`}><img src={src} alt="" className="absolute inset-x-0 bottom-0 mx-auto max-h-[94%] max-w-[118%] object-contain" /><span className="absolute inset-x-3 bottom-3 rounded-full bg-black/28 py-2 text-[10px] backdrop-blur">{['夜市主理马', '清凉冲浪马', '心仔搭档'][index]}</span></button>)}
        </div>
        <button type="button" onClick={() => { setHorseConfirmed(true); setNotice(`已选择${['夜市主理马', '清凉冲浪马', '心仔搭档'][selectedHorse]}，即将进入会场`) }} className="mx-auto mt-8 block h-12 w-[260px] rounded-full bg-white text-[13px] font-bold text-[#D94D30] shadow-xl">{horseConfirmed ? '✓ 已选好，进入夜食会场' : editor?.cta ?? '带它出发'}</button>
        {horseConfirmed ? <p className="mt-3 text-center text-[9px] text-white/68">角色状态已确认 · 后续会场将沿用当前搭子</p> : null}
      </div>
    )
  }

  if (item.id === 'DLV-XIA-013') {
    return (
      <div className="relative mx-auto min-h-[820px] w-[390px] max-w-full overflow-hidden bg-[#1A1010] text-white shadow-[0_28px_72px_rgba(31,35,41,0.18)]">
        <RuntimeNotice message={notice} />
        <img src="/assets/figma-deliverables/xiahua/food-ar-venue.png" alt="夜食 AR 场景" className="absolute inset-0 size-full object-cover opacity-78" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" /><PhoneStatus title="夜食 AR 会场" dark />
        <div className="absolute inset-x-5 top-20 rounded-2xl border border-white/20 bg-black/30 p-4 backdrop-blur"><p className="text-[9px] text-white/64">AR 识别状态</p><p className="mt-1 text-[13px] font-semibold">{arStamped ? '打卡已完成：夜市餐桌' : '镜头已识别：夜市餐桌'}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/14"><span className={`block h-full rounded-full bg-emerald-400 transition-all ${arStamped ? 'w-full' : 'w-2/3'}`} /></div></div>
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center"><div className={`mb-4 rounded-full px-4 py-2 text-[10px] backdrop-blur ${arStamped ? 'bg-emerald-500/90' : 'bg-black/45'}`}>{arStamped ? '已完成 AR 打卡 · 抽卡次数 +2' : editor?.subtitle ?? '移动镜头，把小马放到餐桌上'}</div><button type="button" onClick={() => { setArStamped(true); setNotice('AR 夜食打卡成功，获得 2 次抽卡机会') }} className="grid size-16 place-items-center rounded-full border-4 border-white bg-white/30 shadow-xl"><span className="size-11 rounded-full bg-white" /></button><p className="mt-2 text-[10px]">{arStamped ? '重新拍摄' : editor?.cta ?? '打卡拍照'}</p></div>
      </div>
    )
  }

  const cards = isFood ? FOOD_CARDS : WATER_CARDS
  const tiers = isFood ? [2, 4, 7] : [1, 2, 3]
  const tierLabels = isFood ? ['5 元夜食券', '43 元券包', '黄金汉堡奖励'] : ['清凉贴纸', '玩水装备券', '夏日限定装扮']
  const nextTier = tiers.find((tier) => owned < tier)

  const drawCard = () => {
    if (draws <= 0) { setNotice('抽卡次数不足，完成任务可继续获得'); return }
    setDraws((value) => value - 1)
    const nextIndex = owned % cards.length
    setOwned((value) => Math.min(cards.length, value + 1))
    setNotice(owned < cards.length ? `抽到「${cards[nextIndex][1]}」，图鉴已点亮` : `抽到重复的「${cards[nextIndex][1]}」，可赠送给好友`)
  }

  const finishTask = (label: string) => {
    if (taskCompleted[label]) return
    setTaskCompleted((current) => ({ ...current, [label]: true }))
    setDraws((value) => value + 1)
    setNotice(`${label}完成，抽卡机会 +1`)
  }

  const claimTier = (tier: number, label: string) => {
    if (owned < tier || claimedTiers.includes(tier)) return
    setClaimedTiers((current) => [...current, tier])
    setNotice(`${label}已放入我的奖品`)
  }

  return (
    <div className={`relative mx-auto w-[390px] max-w-full overflow-hidden text-[#4B251D] shadow-[0_28px_72px_rgba(31,35,41,0.18)] ${isFood ? 'bg-[#5B2F20]' : 'bg-[#DDF5FF]'}`}>
      <RuntimeNotice message={notice} />
      <PhoneStatus title={editor?.title ?? (isFood ? '夏日夜食指南' : isWaterStageB ? '一起去玩水 · 交换季' : '一起去玩水')} dark={isFood} />
      {editorElementVisible(editor, 'hero') ? <div className={`relative h-[420px] overflow-hidden ${isFood ? 'bg-[#421F18]' : 'bg-gradient-to-b from-[#7BD8FF] to-[#E9FBFF]'}`}>
        {isFood ? <img src="/assets/xiahua/head-kv.png" alt="夏日夜食活动主视觉" className="absolute inset-0 size-full object-cover object-top" /> : <><div className="absolute inset-x-0 top-10 text-center"><p className="text-[11px] font-semibold text-[#0E6F98]">6.30—8.31 · 夏日玩水季</p><h2 className="mt-2 text-[36px] font-black tracking-[-0.08em] text-white [text-shadow:0_3px_0_#159AC8]">这夏夯爆了</h2></div><img src="/assets/xiahua/outfits/beach-vacation.png" alt="夏日玩水角色" className="absolute bottom-0 left-1/2 h-[300px] -translate-x-1/2 object-contain" /></>}
        {editor ? <div className="absolute inset-x-5 bottom-16 text-center text-white"><h2 className="text-[28px] font-black drop-shadow">{editor.title}</h2><p className="mt-1 text-[10px] text-white/76">{editor.subtitle}</p></div> : null}
        {editorElementVisible(editor, 'navigation') ? <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2"><button type="button" onClick={() => setInfoPanel('rules')} className="rounded-full bg-black/35 px-4 py-2 text-[9px] text-white backdrop-blur">规则</button>{editor?.gameplay.shareEnabled ?? true ? <button type="button" onClick={() => setInfoPanel('share')} className="rounded-full bg-black/35 px-4 py-2 text-[9px] text-white backdrop-blur">分享</button> : null}</div> : null}
      </div> : null}

      <div className={`relative px-4 pb-9 ${isFood ? 'bg-[#5B2F20]' : 'bg-[#DDF5FF]'}`}>
        {editorElementVisible(editor, 'content') ? <section className={`-mt-1 rounded-2xl p-4 shadow-xl ${isFood ? 'bg-[#F7C89D]' : 'bg-white'}`}>
          <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] opacity-55">{editor?.gameplay.packageName ?? '当前进度'}</p><h3 className="mt-1 text-[17px] font-black">{nextTier ? `还差 ${Math.max(0, nextTier - owned)} 种，兑${tierLabels[tiers.indexOf(nextTier)]}` : '全部档位已解锁'}</h3></div><button type="button" onClick={() => setCollectionOpen(true)} className="shrink-0 rounded-full bg-[#4B251D] px-3 py-2 text-[9px] text-white">查看图鉴 {owned}/{cards.length}</button></div>
          <div className="mt-4 grid grid-cols-3 gap-2">{cards.map(([src, name], index) => <button key={name} type="button" onClick={() => setNotice(index < owned ? `${name} · 已获得${index === 0 ? ' 2 张，可赠送' : ''}` : `${name} · 尚未解锁`)} className={`aspect-square overflow-hidden rounded-xl border ${index < owned ? 'border-[#FF5038] bg-white' : 'border-black/8 bg-black/12 grayscale'}`}><img src={src} alt={name} className="size-full object-contain" /></button>)}</div>
          <button type="button" onClick={drawCard} className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#FF3F2D] text-[14px] font-black text-white shadow-[0_8px_18px_rgba(255,63,45,0.28)]"><Gift className="mr-2 size-4" />{editor?.cta ?? (isFood ? `抽夏日夜食 · ${draws} 次` : `抽夏日装备 · ${draws} 次`)}</button>
          <div className="mt-3 grid grid-cols-3 gap-2">{tiers.map((tier, index) => { const unlocked = owned >= tier; const claimed = claimedTiers.includes(tier); return <button key={tier} type="button" disabled={!unlocked || claimed} onClick={() => claimTier(tier, tierLabels[index])} className={`rounded-xl border px-2 py-2.5 text-left ${claimed ? 'border-emerald-200 bg-emerald-50' : unlocked ? 'border-[#FF8A65] bg-white' : 'border-black/6 bg-black/[0.04] opacity-52'}`}><span className="block text-[8px] opacity-52">集齐 {tier} 种</span><span className="mt-1 block truncate text-[9px] font-bold">{tierLabels[index]}</span><span className="mt-1 block text-[7px]">{claimed ? '✓ 已领取' : unlocked ? '可领取' : `还差 ${tier - owned} 种`}</span></button> })}</div>
        </section> : null}

        {isWaterStageB ? <section className="mt-4 rounded-2xl bg-[#0B789E] p-4 text-white"><div className="flex items-end justify-between"><div><p className="text-[9px] text-white/55">阶段 B · 交换开放</p><h3 className="mt-1 text-[17px] font-black">重复夏装，送给朋友</h3></div><span className="rounded-full bg-white/12 px-2 py-1 text-[8px]">1 张可赠送</span></div><div className="mt-3 flex items-center gap-3 rounded-xl bg-white/10 p-3"><img src={WATER_CARDS[0][0]} alt={WATER_CARDS[0][1]} className="size-14 rounded-xl bg-white object-contain" /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold">{WATER_CARDS[0][1]}</p><p className="mt-1 text-[8px] text-white/52">持有 2 张 · 可赠送 1 张</p></div><button type="button" disabled={exchangeDone} onClick={() => { setExchangeDone(true); finishTask('赠送一张重复卡') }} className="rounded-full bg-white px-3 py-2 text-[9px] font-bold text-[#0B789E] disabled:opacity-55">{exchangeDone ? '✓ 已赠送' : '赠送'}</button></div></section> : null}

        {editorElementVisible(editor, 'footer') && (editor?.gameplay.taskEnabled ?? true) ? <section className={`mt-4 rounded-2xl p-4 ${isFood ? 'bg-[#FFF0D9]' : 'bg-white'}`}><div className="flex items-center justify-between"><div><p className="text-[9px] opacity-48">TASKS</p><h3 className="mt-1 text-[17px] font-black">玩一夏，赚更多</h3></div><span className="text-[9px] opacity-48">每日上限 {editor?.gameplay.dailyLimit ?? 3} 次</span></div><div className="mt-3 space-y-2">{['浏览活动主会场', '发布一条夏日投稿', '赠送一张重复卡'].map((label) => { const done = Boolean(taskCompleted[label]); return <div key={label} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white/72 px-3 py-3"><span className={`grid size-7 place-items-center rounded-full text-[11px] ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFE6D1] text-[#D65A30]'}`}>{done ? '✓' : '+1'}</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold">{label}</p><p className="mt-0.5 text-[8px] opacity-48">完成后获得 1 次抽卡机会</p></div><button type="button" disabled={done} onClick={() => finishTask(label)} className={`rounded-full px-3 py-2 text-[9px] ${done ? 'bg-black/5 opacity-40' : 'bg-[#FF4A32] text-white'}`}>{done ? '已完成' : '去完成'}</button></div> })}</div></section> : null}

        {!isFood && (isWaterFull || !isWaterStageB) ? <section className="mt-4 rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><h3 className="text-[17px] font-black">夏日灵感现场</h3>{isWaterFull ? <span className="text-[8px] opacity-42">完整内容承接</span> : null}</div><div className="mt-3 grid grid-cols-2 gap-2">{['/assets/xiahua/case-evidence/search-entry-1.webp', '/assets/xiahua/case-evidence/search-entry-2.webp'].map((src, index) => <button key={src} type="button" onClick={() => setNotice(`已打开第 ${index + 1} 个夏日话题`)} className="overflow-hidden rounded-xl text-left"><img src={src} alt="" className="aspect-[4/3] w-full object-cover" /><span className="block px-1 py-2 text-[9px] font-semibold"># 夏日跟我一起玩</span></button>)}</div>{isWaterFull ? <button type="button" onClick={() => finishTask('发布一条夏日投稿')} className="mt-3 h-10 w-full rounded-full bg-[#0B92BD] text-[10px] font-bold text-white">发布我的玩水瞬间</button> : null}</section> : null}
      </div>

      {guideOpen ? <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/56 p-6 backdrop-blur-sm"><div className="w-full rounded-[28px] bg-[#FFF5E9] p-5 text-center text-[#5B2F20] shadow-2xl"><button type="button" onClick={() => setGuideOpen(false)} aria-label="关闭新手引导" className="ml-auto grid size-7 place-items-center rounded-full bg-black/6"><X className="size-3.5" /></button><img src="/assets/xiahua/mascot-horse-v3.png" alt="" className="mx-auto h-36 object-contain" /><h3 className="mt-2 text-[22px] font-black">三步玩懂这夏夯爆了</h3><div className="mt-4 grid grid-cols-3 gap-2">{[['1', '做任务'], ['2', '抽装备'], ['3', '集齐兑换']].map(([num, label]) => <div key={num} className="rounded-xl bg-white px-2 py-3"><span className="mx-auto grid size-6 place-items-center rounded-full bg-[#FF4A32] text-[9px] text-white">{num}</span><p className="mt-2 text-[9px] font-semibold">{label}</p></div>)}</div><button type="button" onClick={() => { setGuideOpen(false); setNotice('新手引导完成，已获得 1 次抽卡机会'); setDraws((value) => value + 1) }} className="mt-5 h-11 w-full rounded-full bg-[#FF4A32] text-[12px] font-bold text-white">开始玩</button></div></div> : null}

      {collectionOpen ? <div className="absolute inset-0 z-40 overflow-y-auto bg-[#FFF5E9] px-4 pb-8 text-[#5B2F20]"><div className="sticky top-0 z-10 flex h-14 items-center justify-between bg-[#FFF5E9]/95 backdrop-blur"><button type="button" onClick={() => setCollectionOpen(false)} aria-label="返回活动会场" className="grid size-8 place-items-center rounded-full bg-black/6"><ChevronLeft className="size-4" /></button><h3 className="text-[15px] font-black">{isFood ? '我的夜食' : '我的夏装'} · {owned}/{cards.length}</h3><span className="size-8" /></div><div className={`grid gap-3 ${cards.length > 6 ? 'grid-cols-3' : 'grid-cols-2'}`}>{cards.map(([src, name], index) => <button key={name} type="button" onClick={() => setNotice(index < owned ? `${name}${index === 0 ? '有 2 张，可以赠送给好友' : '仅 1 张，保留自用'}` : `已发起求赠送：${name}`)} className={`rounded-2xl border bg-white p-3 text-left ${index < owned ? 'border-[#FF5A3C]' : 'border-black/8 grayscale'}`}><img src={src} alt={name} className="aspect-square w-full object-contain" /><p className="mt-2 truncate text-[9px] font-bold">{name}</p><p className="mt-1 text-[7px] opacity-48">{index < owned ? index === 0 ? '持有 2 · 可赠送' : '持有 1 · 自用' : '未获得 · 求赠送'}</p></button>)}</div></div> : null}

      {infoPanel ? <div role="dialog" aria-modal="true" aria-label={infoPanel === 'rules' ? '活动规则' : '活动分享'} className="absolute inset-0 z-40 flex items-start justify-center bg-[#2D160F]/68 px-5 pt-24 backdrop-blur-sm"><div className="w-full rounded-[28px] bg-[#FFF7EC] p-5 text-[#5B2F20] shadow-2xl"><button type="button" onClick={() => setInfoPanel(null)} aria-label="关闭面板" className="ml-auto grid size-8 place-items-center rounded-full bg-black/6"><X className="size-4" /></button>{infoPanel === 'rules' ? <><p className="text-[9px] font-semibold text-[#FF4A32]">三步参与</p><h3 className="mt-1 text-[22px] font-black">{isFood ? '做任务、抽夜食、集卡兑券' : '做任务、抽夏装、集齐领奖'}</h3><div className="mt-4 space-y-2">{['完成任务获得抽取次数', `抽取并点亮 ${cards.length} 种${isFood ? '夜食' : '夏装'}`, `集齐 ${tiers.join(' / ')} 种时解锁对应档位`].map((text, index) => <div key={text} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3"><span className="grid size-6 place-items-center rounded-full bg-[#FF4A32] text-[9px] text-white">{index + 1}</span><span className="text-[9px] font-semibold">{text}</span></div>)}</div><p className="mt-4 text-[8px] leading-4 opacity-48">本页为可交互 Demo；正式库存、履约与核销需接入业务数据后发布。</p><button type="button" onClick={() => setInfoPanel(null)} className="mt-4 h-11 w-full rounded-full bg-[#FF4A32] text-[11px] font-bold text-white">我知道了</button></> : <><img src={isFood ? '/assets/xiahua/head-kv.png' : '/assets/xiahua/case-evidence/search-entry-1.webp'} alt="活动分享卡" className="mt-1 aspect-[16/9] w-full rounded-2xl object-cover" /><p className="mt-4 text-center text-[9px] opacity-48">分享我的当前进度</p><h3 className="mt-1 text-center text-[21px] font-black">已点亮 {owned}/{cards.length} 种</h3><button type="button" onClick={() => { setInfoPanel(null); setNotice('分享卡已生成，可发送给好友') }} className="mt-4 h-11 w-full rounded-full bg-[#FF4A32] text-[11px] font-bold text-white">生成分享卡</button></>}</div></div> : null}
    </div>
  )
}

function SpringGalaRuntime({ item, editor }: { item: DocumentedActivityDeliverable; editor?: DocumentedPageEditorState }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [channel, setChannel] = useState<'主机位' | '竖屏' | '手语'>('主机位')
  const [lotteryOpen, setLotteryOpen] = useState(false)
  const [prize, setPrize] = useState('')
  const [followed, setFollowed] = useState(false)
  const [remainingChances, setRemainingChances] = useState(1)
  const [programExpanded, setProgramExpanded] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2024')
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useRuntimeNotice()
  const full = item.id === 'DLV-GALA-002'
  const channelCover = {
    主机位: '/assets/figma-deliverables/spring-gala/live-main-camera.png',
    竖屏: '/assets/figma-deliverables/spring-gala/live-vertical-cover.png',
    手语: '/assets/figma-deliverables/spring-gala/live-sign-language-cover.png',
  }[channel]
  return (
    <div className="relative mx-auto w-[390px] max-w-full overflow-hidden bg-[#FFF0DF] text-[#6D201C] shadow-[0_28px_72px_rgba(31,35,41,0.18)]">
      <RuntimeNotice message={notice} />
      {editorElementVisible(editor, 'hero') ? <div className="relative h-[405px] overflow-hidden bg-[#F33C35]"><img src="/assets/figma-deliverables/spring-gala/activity-header.png" alt="春晚活动主视觉" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#BD2A24]/72" /><PhoneStatus title={editor?.title ?? '上抖音 看春晚'} dark /><div className="absolute inset-x-5 bottom-6 text-white"><p className="text-[10px] text-white/74">{editor?.subtitle ?? '2026 年 2 月 16 日 20:00 直播'}</p><h2 className="mt-1 text-[32px] font-black tracking-[-0.05em]">{editor?.title ?? '上抖音 看春晚'}</h2>{editor ? <button type="button" onClick={() => setNotice(editor.cta)} className="mt-3 rounded-full bg-white px-3 py-2 text-[9px] font-bold text-[#B62925]">{editor.cta}</button> : null}</div></div> : null}
      <div className="px-4 pb-9">
        {editorElementVisible(editor, 'navigation') ? <section className="relative -mt-3 overflow-hidden rounded-2xl bg-[#741514] p-3 text-white shadow-xl"><div className="flex items-center justify-between pb-3"><div><span className="rounded bg-[#FF3C44] px-2 py-1 text-[8px]">演示状态 · 直播中</span><p className="mt-2 text-[12px] font-bold">春节联欢晚会节目单</p></div><button type="button" onClick={() => { setFollowed((value) => !value); setNotice(followed ? '已取消关注' : '已关注官方春晚直播') }} className={`rounded-full border px-3 py-2 text-[8px] ${followed ? 'border-white bg-white text-[#7B1A18]' : 'border-white/24'}`}>{followed ? '✓ 已关注' : '＋ 关注'}</button></div><button type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? '暂停直播' : '播放直播'} className="group relative block aspect-video w-full overflow-hidden rounded-xl"><img src={channelCover} alt={`${channel}直播画面`} className="size-full object-cover" /><span className="absolute inset-0 bg-black/18" /><span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#D52F2A] shadow-lg">{isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}</span>{isPlaying ? <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[8px]"><i className="size-1.5 animate-pulse rounded-full bg-red-500" />正在播放 · {channel}</span> : null}</button><div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-black/15 p-1">{(['主机位', '竖屏', '手语'] as const).map((label) => <button key={label} type="button" onClick={() => { setChannel(label); setNotice(`已切换到${label}频道`) }} className={`rounded-lg py-2 text-[8px] ${channel === label ? 'bg-white text-[#7B1A18]' : 'text-white/72'}`}>{label}</button>)}</div></section> : null}

        {editorElementVisible(editor, 'content') ? <section className="mt-4 rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] text-[#B17B6E]">{editor?.gameplay.packageName ?? '同一节目数据源'}</p><h3 className="mt-1 text-[17px] font-black">今晚节目单</h3></div><button type="button" onClick={() => setProgramExpanded((value) => !value)} className="text-[8px] font-semibold text-[#D63A31]">{programExpanded ? '收起' : '查看完整节目单'}</button></div><div className="mt-3 divide-y divide-[#F2E4DD]">{[['20:00', '开场秀 · 万马奔腾'], ['20:18', '相声 · 马上有福'], ['20:42', '歌曲 · 春风到家'], ['21:10', '特别节目 · 温暖上线']].slice(0, programExpanded || full ? 4 : 2).map(([time, title], index) => <button key={time} type="button" onClick={() => setNotice(`已预约：${title}`)} className="flex w-full items-center gap-3 py-3 text-left"><span className="w-9 text-[9px] font-semibold text-[#D63A31]">{time}</span><span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{title}</span><span className="text-[8px] text-[#6D201C]/34">{index === 0 && isPlaying ? '直播中' : '预约'}</span></button>)}</div></section> : null}

        {editorElementVisible(editor, 'content') && (editor?.gameplay.taskEnabled ?? true) ? <section className="mt-4 rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] text-[#B17B6E]">互动进行中</p><h3 className="mt-1 text-[18px] font-black">骏马迎新春 开运福满抽</h3></div><span className="rounded-full bg-[#FFF0E9] px-2 py-1 text-[8px] text-[#D63A31]">剩余 {remainingChances} 次</span></div><div className="mt-4 flex justify-between gap-2">{['豆包 AI 耳机', '火山抱枕', '限定键盘', '新春红包'].map((label, index) => <div key={label} className="min-w-0 flex-1 text-center"><div className={`mx-auto grid aspect-square w-full place-items-center rounded-xl ${index === 3 ? 'bg-[#FFE5AA]' : 'bg-[#FFF4EE]'}`}><Gift className="size-5 text-[#F04D43]" /></div><p className="mt-1 truncate text-[7px]">{label}</p></div>)}</div><button type="button" disabled={remainingChances === 0} onClick={() => setLotteryOpen(true)} className="mt-4 h-12 w-full rounded-full bg-gradient-to-r from-[#FF3D66] to-[#FF5B48] text-[13px] font-black text-white shadow-[0_8px_18px_rgba(255,61,102,0.22)] disabled:cursor-not-allowed disabled:opacity-48">{remainingChances ? '开始抽奖' : '本次机会已使用'}</button><p className="mt-2 text-center text-[8px] text-[#6D201C]/36">每日参与上限 {editor?.gameplay.dailyLimit ?? 1} 次；正式发布前必须绑定库存与履约</p></section> : null}

        {editorElementVisible(editor, 'footer') ? <section className="mt-4 rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><h3 className="text-[17px] font-black">往年春晚</h3><span className="text-[8px] text-[#6D201C]/38">结束态回放</span></div><div className="mt-3 grid grid-cols-4 gap-2">{['2024', '2023', '2022', '2021'].map((year) => <button key={year} type="button" onClick={() => { setSelectedYear(year); setNotice(`正在打开 ${year} 春晚回放`) }} className={`overflow-hidden rounded-lg text-white ${selectedYear === year ? 'bg-[#FF3C44] ring-2 ring-[#FFB29E]' : 'bg-[#AA1522]'}`}><div className="grid aspect-[3/4] place-items-center text-[18px] font-black">春</div><p className="bg-white py-1.5 text-[8px] text-[#6D201C]">{year} 春晚</p></button>)}</div></section> : null}

        {full ? <section className="mt-4 rounded-2xl bg-white p-4"><p className="text-[9px] text-[#B17B6E]">马年新春 · 年味瞬间</p><h3 className="mt-1 text-[17px] font-black">边看边聊，参与话题投稿</h3><div className="mt-3 flex gap-2">{['#为新年注入马力', '#我的温暖已上线', '#全家福时刻'].map((tag, index) => <button key={tag} type="button" onClick={() => setNotice(`已选择话题 ${tag}`)} className={`rounded-full px-3 py-2 text-[8px] ${index === 0 ? 'bg-[#FFE0C7] text-[#C6362D]' : 'bg-[#F5F3F1] text-[#806B64]'}`}>{tag}</button>)}</div><div className="mt-3 grid grid-cols-2 gap-2">{['/assets/figma-deliverables/spring-gala/program-cover-portrait.png','/assets/figma-deliverables/spring-gala/live-year-after-year.png'].map((src, index) => <button key={src} type="button" onClick={() => setNotice(`已播放第 ${index + 1} 条春晚内容`)} className="relative aspect-[4/5] overflow-hidden rounded-xl"><img src={src} alt="" className="size-full object-cover" /><Play className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" /></button>)}</div><button type="button" disabled={submitted} onClick={() => { setSubmitted(true); setNotice('投稿草稿已创建；正式发布仍需用户确认') }} className="mt-4 h-11 w-full rounded-full bg-[#FF4C57] text-[11px] font-bold text-white disabled:opacity-52">{submitted ? '✓ 投稿草稿已创建' : '去投稿'}</button></section> : null}
      </div>

      {lotteryOpen ? <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#48100F]/72 p-6 backdrop-blur-sm"><div className="w-full rounded-[28px] bg-white p-5 text-center shadow-2xl"><button type="button" onClick={() => setLotteryOpen(false)} aria-label="关闭抽奖" className="ml-auto grid size-7 place-items-center rounded-full bg-black/5"><X className="size-3.5" /></button>{prize ? <><div className="mx-auto grid size-28 place-items-center rounded-full bg-[#FFF0D5]"><Gift className="size-12 text-[#EE3D4F]" /></div><p className="mt-4 text-[9px] text-[#A87A6D]">演示抽奖结果</p><h3 className="mt-1 text-[22px] font-black">{prize}</h3><p className="mt-2 text-[8px] text-[#A87A6D]">正式奖品需接入库存、资格和履约服务</p><button type="button" onClick={() => setLotteryOpen(false)} className="mt-5 h-11 w-full rounded-full bg-[#FF4C57] text-[11px] font-bold text-white">收下奖品</button></> : <><Sparkles className="mx-auto mt-3 size-10 text-[#FFB62C]" /><h3 className="mt-3 text-[22px] font-black">开运福袋已准备</h3><p className="mt-2 text-[10px] text-[#A87A6D]">这是 Demo 抽奖，不代表真实库存</p><button type="button" onClick={() => { setPrize('新春限定红包'); setRemainingChances(0) }} className="mt-5 h-11 w-full rounded-full bg-[#FF4C57] text-[11px] font-bold text-white">立即开启</button></>}</div></div> : null}
    </div>
  )
}

function EvernightRuntime({ item, editor }: { item: DocumentedActivityDeliverable; editor?: DocumentedPageEditorState }) {
  const taskOnly = item.id === 'DLV-EVN-016'
  const startsInTasks = item.id === 'DLV-EVN-002' || taskOnly
  const [tab, setTab] = useState<'抽卡' | '任务' | '图鉴'>(startsInTasks ? '任务' : '抽卡')
  const [chances, setChances] = useState(9)
  const [collected, setCollected] = useState(3)
  const [tasks, setTasks] = useState([true, false, false, false])
  const [resultOpen, setResultOpen] = useState(false)
  const [lastDrawCount, setLastDrawCount] = useState(1)
  const [shared, setShared] = useState(false)
  const [notice, setNotice] = useRuntimeNotice()
  const draw = (count: number) => {
    if (chances < count) { setNotice(`还差 ${count - chances} 次机会，完成任务即可获得`); return }
    setChances((value) => value - count)
    setCollected((value) => Math.min(7, value + (count === 10 ? 2 : 1)))
    setLastDrawCount(count)
    setResultOpen(true)
  }
  const taskLabels = ['活动页面签到', '给《永夜星河》标记想看', '关注《永夜星河》官方账号', '观看宣传视频 5 秒']
  return (
    <div className="relative mx-auto w-[390px] max-w-full overflow-hidden bg-[#21115C] text-white shadow-[0_28px_72px_rgba(31,35,41,0.2)]">
      <RuntimeNotice message={notice} />
      {editorElementVisible(editor, 'hero') ? <div className={`relative overflow-hidden bg-[#301879] ${taskOnly ? 'h-[300px]' : 'h-[480px]'}`}><img src="/assets/figma-deliverables/evernight/campaign-cover.png" alt="永夜星河抽卡活动主视觉" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/18 via-transparent to-[#2A146D]" /><PhoneStatus title={editor?.title ?? (taskOnly ? '永夜星河 · 任务中心' : '永夜星河 · 独星河小卡')} dark /><div className="absolute inset-x-6 bottom-8 text-center"><p className="text-[10px] text-[#E5D8FF]">{editor?.subtitle ?? '《永夜星河》抖音抽卡活动'}</p><h2 className={`${taskOnly ? 'text-[25px]' : 'text-[30px]'} mt-2 font-black tracking-[-0.04em] text-white [text-shadow:0_0_20px_#A76CFF]`}>{editor?.title ?? (taskOnly ? '完成任务，领取抽卡次数' : <>独星河小卡<br />开启快乐征途</>)}</h2></div></div> : null}
      <div className="relative -mt-4 px-4 pb-10">
        {editorElementVisible(editor, 'navigation') ? <div className={`grid rounded-full bg-[#2A1269] p-1 shadow-lg ${taskOnly ? 'grid-cols-2' : 'grid-cols-3'}`}>{(taskOnly ? ['任务', '图鉴'] as const : ['抽卡', '任务', '图鉴'] as const).map((label) => <button key={label} type="button" onClick={() => setTab(label)} className={`h-10 rounded-full text-[11px] font-bold ${tab === label ? 'bg-[#8F5CFF] text-white' : 'text-white/60'}`}>{label}</button>)}</div> : null}

        {editorElementVisible(editor, 'content') && tab === '抽卡' && !taskOnly ? <><section className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4 text-center backdrop-blur"><div className="relative mx-auto h-[260px]"><img src="/assets/evernight/card-collection.webp" alt="独星河卡池" className="size-full object-contain" /><button type="button" onClick={() => setNotice('已切换到下一张卡池主卡')} aria-label="下一张卡" className="absolute right-0 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/30"><ChevronRight className="size-5" /></button></div><p className="mt-2 text-[11px] text-[#E8DEFF]">{editor?.gameplay.packageName ?? '抖音独占卡 DYR'} · 已收集 {collected}/7</p><div className="mt-4 grid grid-cols-7 gap-1">{Array.from({ length: 7 }).map((_, index) => <button key={index} type="button" onClick={() => setNotice(index < collected ? `第 ${index + 1} 张卡已收集` : '这张卡尚未解锁')} className={`aspect-[3/4] rounded-md border ${index < collected ? 'border-[#74E2FF] bg-gradient-to-b from-[#7C5EFF] to-[#25144F]' : 'border-white/8 bg-black/38'}`}>{index < collected ? <Sparkles className="mx-auto size-3 text-[#8DEBFF]" /> : <span className="text-[9px] text-white/30">🔒</span>}</button>)}</div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => draw(1)} className="h-12 rounded-full bg-gradient-to-r from-[#8C62FF] to-[#B05CFF] text-[13px] font-black">{editor?.cta ?? '单次抽卡'}</button><button type="button" onClick={() => draw(10)} className="h-12 rounded-full bg-gradient-to-r from-[#FFD85A] to-[#FFB743] text-[13px] font-black text-[#4B2C00]">十次连抽</button></div><p className="mt-3 text-[10px] text-white/62">你有 <strong className="text-[#FFD45C]">{chances}</strong> 次抽卡机会</p><p className="mt-2 text-[8px] text-white/38">概率、保底与库存为待接入业务数据，不在 Demo 中伪造</p></section></> : null}

        {editorElementVisible(editor, 'content') && tab === '图鉴' ? <section className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] text-[#C8B5F8]">COLLECTION</p><h3 className="mt-1 text-[18px] font-black">独星河图鉴 {collected}/7</h3></div><span className="rounded-full bg-[#8F5CFF] px-3 py-1.5 text-[9px]">{Math.round(collected / 7 * 100)}%</span></div><div className="mt-4 grid grid-cols-2 gap-3">{['DYR 独占', 'SSR 星河', 'SP 联名', 'SR 角色', 'R 剧照', '限定签名'].map((label, index) => <button key={label} type="button" onClick={() => setNotice(index < collected ? `${label}卡 · 已收藏` : `${label}卡 · 可在卡池获得`)} className={`relative aspect-[3/4] overflow-hidden rounded-xl border p-3 text-left ${index < collected ? 'border-[#77DEFF] bg-gradient-to-br from-[#7D5EFF] via-[#4C2A9C] to-[#1F124E]' : 'border-white/8 bg-black/28 grayscale'}`}><img src={`/assets/figma-deliverables/evernight/card-frame-${index === 0 ? 'dyr' : index === 1 ? 'ssr' : index === 2 ? 'sp' : index === 3 ? 'sr' : 'r'}.png`} alt="" className="absolute inset-0 size-full object-cover opacity-55" /><span className="relative text-[9px] font-bold">{label}</span><span className="absolute bottom-3 left-3 text-[8px] text-white/58">{index < collected ? '已获得' : '未解锁'}</span></button>)}</div>{editor?.gameplay.shareEnabled ?? true ? <button type="button" disabled={shared || collected === 0} onClick={() => { setShared(true); setNotice('分享卡已生成，可带已获得卡片回流') }} className="mt-4 h-11 w-full rounded-full border border-[#A98BFF] bg-white/8 text-[10px] font-bold disabled:opacity-42">{shared ? '✓ 分享卡已生成' : '用已获得卡片生成分享卡'}</button> : null}</section> : null}

        {editorElementVisible(editor, 'footer') && (editor?.gameplay.taskEnabled ?? true) && tab === '任务' ? <section className="mt-4 rounded-2xl bg-[#49318A] p-4"><div className="flex items-end justify-between"><div><p className="text-[9px] text-[#C8B5F8]">TASKS · 每日上限 {editor?.gameplay.dailyLimit ?? 3} 次</p><h3 className="mt-1 text-[18px] font-black">做任务得抽卡机会</h3></div><span className="text-[9px] text-white/48">{tasks.filter(Boolean).length}/{tasks.length} 已完成</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#F177D7] transition-all" style={{ width: `${tasks.filter(Boolean).length / tasks.length * 100}%` }} /></div><div className="mt-3 space-y-2">{taskLabels.map((label, index) => <div key={label} className="flex items-center gap-3 rounded-xl bg-white/8 px-3 py-3"><span className={`grid size-8 place-items-center rounded-xl ${tasks[index] ? 'bg-[#F177D7]' : 'bg-white/10'}`}>{tasks[index] ? '✓' : index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold">{label}</p><p className="mt-0.5 text-[8px] text-white/46">完成后抽卡机会 +{index === 0 ? 3 : 10}</p></div><button type="button" disabled={tasks[index]} onClick={() => { setTasks((current) => current.map((value, taskIndex) => taskIndex === index ? true : value)); setChances((value) => value + (index === 0 ? 3 : 10)); setNotice(`${label}完成，抽卡机会已到账`) }} className={`rounded-full px-3 py-2 text-[9px] ${tasks[index] ? 'bg-white/8 text-white/30' : 'bg-[#925CFF] text-white'}`}>{tasks[index] ? '已完成' : '去完成'}</button></div>)}</div>{!taskOnly ? <button type="button" onClick={() => setTab('抽卡')} className="mt-4 h-11 w-full rounded-full bg-white text-[10px] font-bold text-[#5C36A8]">带着 {chances} 次机会去抽卡</button> : <button type="button" onClick={() => setTab('图鉴')} className="mt-4 h-11 w-full rounded-full bg-white text-[10px] font-bold text-[#5C36A8]">查看图鉴进度 {collected}/7</button>}</section> : null}
      </div>

      {resultOpen ? <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#13082F]/82 p-7 backdrop-blur-md"><div className="w-full text-center"><button type="button" onClick={() => setResultOpen(false)} aria-label="关闭抽卡结果" className="ml-auto grid size-8 place-items-center rounded-full bg-white/10"><X className="size-4" /></button><p className="mt-4 text-[10px] text-[#D6C6FF]">{lastDrawCount === 10 ? '十连结果 · 新增 2 张' : '恭喜获得新卡'}</p><div className="relative mx-auto mt-4 aspect-[492/676] w-[240px] overflow-hidden rounded-2xl shadow-[0_0_52px_rgba(155,96,255,0.7)]"><img src="/assets/figma-deliverables/evernight/card-frame-dyr.png" alt="DYR 独占卡" className="size-full object-cover" /><Sparkles className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_0_18px_#fff]" />{lastDrawCount === 10 ? <span className="absolute right-3 top-3 rounded-full bg-[#FFD85A] px-2 py-1 text-[8px] font-bold text-[#4B2C00]">10 连</span> : null}</div><h3 className="mt-4 text-[21px] font-black">抖音独占卡 · DYR</h3><button type="button" onClick={() => { setResultOpen(false); setTab('图鉴') }} className="mt-5 h-12 w-full rounded-full bg-gradient-to-r from-[#9B67FF] to-[#E05CFF] text-[12px] font-black">收入图鉴并查看</button></div></div> : null}
    </div>
  )
}

export default function InteractiveDeliverableRuntime({
  activityCase,
  item,
  editor,
}: {
  activityCase: DocumentedActivityCase
  item: DocumentedActivityDeliverable
  editor?: DocumentedPageEditorState
}) {
  if (activityCase.code === 'CASE-ACG-CNY-2026') return <AcgVenueRuntime item={item} editor={editor} />
  if (activityCase.code === 'CASE-UGC-SUMMER-2026') return <XiahuaRuntime item={item} editor={editor} />
  if (activityCase.code === 'CASE-GALA-2026') return <SpringGalaRuntime item={item} editor={editor} />
  return <EvernightRuntime item={item} editor={editor} />
}
