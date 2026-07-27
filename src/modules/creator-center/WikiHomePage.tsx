import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowRight } from '@/shared/icons'

/** 百科（世界书）首页 — 按 Figma「创中版本-世界书」346:57674 实现。
 *  数据全部为演示 mock；素材见 public/assets/wiki 与 public/icons/wiki。 */

/** 设计稿标题用思源宋体，未装机器回退到系统宋体。 */
const SERIF = { fontFamily: '"Source Han Serif CN", "Source Han Serif SC", "Noto Serif SC", "Songti SC", serif' }

const CATEGORIES = ['全部', '奇幻', '灵异', '科幻', '历史', '武侠', '悬疑', '现代都市', '潮流文化']

interface WorldBook {
  id: string
  title: string
  entries: number
  desc: string
  cats: string[]
}

const WORLD_BOOKS: WorldBook[] = [
  { id: 'rulinwaishi', title: '儒林外史', entries: 312, cats: ['历史'], desc: '科举浮沉中的文人群像，笑看功名利禄背后的世情冷暖与人性百态。' },
  { id: 'eyasha', title: '鹅鸭杀', entries: 168, cats: ['潮流文化', '悬疑'], desc: '鹅群中混入了伪装的鸭子，一场谎言与推理交织的太空社交对决。' },
  { id: 'houshi', title: '后室', entries: 452, cats: ['灵异', '悬疑'], desc: '不小心从现实中「切出」，坠入无限延伸的黄色房间与嗡鸣灯光深处。' },
  { id: 'yangjiajiang', title: '杨家将传', entries: 96, cats: ['历史', '武侠'], desc: '杨家满门忠烈镇守边关，金沙滩一役血染征袍，忠魂千古流传。' },
  { id: 'beicanshijie', title: '悲惨世界', entries: 233, cats: ['历史'], desc: '冉·阿让在苦难与救赎间挣扎前行，命运交错于革命前夜的巴黎。' },
  { id: 'jinghuayuan', title: '镜花缘', entries: 147, cats: ['奇幻'], desc: '唐敖远渡海外游历诸国，见证百花仙子谪凡人间的奇幻因缘。' },
  { id: 'xiyouji', title: '西游记', entries: 528, cats: ['奇幻'], desc: '唐僧师徒西天取经，一路历经九九八十一难，降妖伏魔，终成正果。' },
  { id: 'aodexiusi', title: '奥德修斯的故事', entries: 120, cats: ['历史'], desc: '特洛伊战争落幕后，奥德修斯漂泊十年，历尽海妖与巨人的试炼归乡。' },
  { id: 'alice', title: '爱丽丝梦游仙境', entries: 261, cats: ['奇幻'], desc: '跌入兔子洞的爱丽丝，闯进逻辑颠倒、奇趣横生的地下仙境。' },
  { id: 'santi', title: '三体', entries: 342, cats: ['科幻'], desc: '三体文明的舰队正驶向地球，人类文明在黑暗森林中艰难求生。' },
  { id: 'guimie', title: '鬼灭之刃', entries: 189, cats: ['潮流文化', '奇幻'], desc: '少年为拯救至亲踏上讨伐之路，刀锋所指皆是守护的羁绊。' },
  { id: 'zelda', title: '塞尔达传说', entries: 407, cats: ['潮流文化', '奇幻'], desc: '沉睡百年的林克苏醒，踏上广袤的海拉鲁大陆，讨伐灾厄救出公主。' },
]

const BENEFITS = [
  {
    title: '轻松搭建世界',
    desc: '一站式提炼世界核心框架、整合零散素材并收纳整理世界观各类设定，为内容衍生、持续创作夯实基础',
    img: '/assets/wiki/benefit-build.webp',
  },
  {
    title: '开放世界共创',
    desc: '开启多人协同共创模式，完善设定，丰富世界脉络，激发更多创作灵感',
    img: '/assets/wiki/benefit-cocreate.webp',
  },
  {
    title: '随时查阅设定',
    desc: '自由查阅世界书内的全部资料，无需强记繁杂细节，各类剧情角色要素随时可查',
    img: '/assets/wiki/benefit-lookup.webp',
  },
  {
    title: '联动创作工具',
    desc: '世界书直通视频创作工具，创作时自动载入世界观信息，内容设定一脉相承',
    img: '/assets/wiki/benefit-linkage.webp',
  },
]

/** 「- 标题 -」样式的居中区块标题。 */
function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-center gap-4 text-[24px] font-bold text-black" style={SERIF}>
      <span aria-hidden>-</span>
      <span className="tracking-[4px]">{children}</span>
      <span aria-hidden>-</span>
    </div>
  )
}

/** 黑底胶囊 CTA — 右端白圆内箭头。 */
function CreateButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-11 items-center gap-6 self-start rounded-full bg-black py-1.5 pl-4 pr-1.5 transition-opacity hover:opacity-90"
    >
      <span className="text-[16px] font-medium text-white">{label}</span>
      <span className="flex size-8 items-center justify-center rounded-full bg-white transition-transform group-hover:translate-x-0.5">
        <ArrowRight size={18} className="text-[#161823]" />
      </span>
    </button>
  )
}

export default function WikiHomePage({ onCreateWorld }: { onCreateWorld?: () => void }) {
  const reduceMotion = useReducedMotion()
  const [category, setCategory] = useState('全部')
  const [mode, setMode] = useState<'world' | 'role'>('world')

  const shown = category === '全部' ? WORLD_BOOKS : WORLD_BOOKS.filter((w) => w.cats.includes(category))

  return (
    <div className="relative h-full overflow-y-auto bg-[#F5F8FB]">
      {/* 顶部虹彩渐变底图 — 导出自设计稿，向下融入页面底色 */}
      <img
        src="/assets/wiki/hero-bg.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px] w-full select-none object-cover"
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
        className="relative mx-auto max-w-[1201px] px-6 pb-20"
      >
        {/* ── 标题区 ── */}
        <div className="pt-[64px] text-center">
          <h1
            className="text-[32px] font-bold leading-normal text-[#0F0F12]"
            style={{ ...SERIF, wordSpacing: '1em' }}
          >
            服务创作 书写世界
          </h1>
          <p className="mx-auto mt-4 max-w-[1026px] text-[14px] leading-[1.7] text-[#252632]/60">
            这里是无数「世界」的诞生之地。在这里，你可以从零搭建全新世界观，把灵感碎片梳理成体系化设定；也能够深耕现有世界脉络，挖掘细节、延展剧情。每一本世界书，都是灵感相逢、萌发宇宙最初轮廓的土壤，让所有漫无边际的构想拥有永久栖息、持续生长的地方
          </p>
        </div>

        {/* ── 世界书 / 角色档案 入口卡 ── */}
        <div className="mt-9 grid grid-cols-[1fr_381px] gap-8 max-lg:grid-cols-1">
          <div className="relative flex h-[280px] flex-col justify-between overflow-hidden rounded-[24px] border border-white bg-white/90 p-6 shadow-[0_12px_24px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <img src="/icons/wiki/ic-book.svg" alt="" className="size-[30px]" />
                  <span className="text-[24px] font-bold text-black" style={SERIF}>世界书</span>
                </div>
                <p className="text-[14px] leading-[1.7] text-[#252632]/60">
                  囊括玄幻、历史、科幻等多元世界观题材，整合世界设定、剧情事件、角色档案与角色羁绊，让每一片幻想天地开启协同共创，万千思绪碰撞交融，全新故事灵感在这里迸发
                </p>
              </div>
              <div className="h-px w-full bg-[#D9D9D9]/60" />
              <div className="flex items-center gap-1.5">
                <img src="/icons/wiki/ic-diamond.svg" alt="" className="size-4" />
                <span className="text-[12px] leading-[1.7] text-[#252632]/60">原创搭建世界观，拆解原作设定，留存完整故事背景</span>
              </div>
            </div>
            <div className="relative z-10">
              <CreateButton label="创建世界书" onClick={() => onCreateWorld?.()} />
            </div>
            {/* 斜排书封贴片（含阴影，整体导出） */}
            <img
              src="/assets/wiki/book-fan.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-[340px] top-[146px] w-[466px] max-w-none select-none max-lg:left-auto max-lg:right-[-40px]"
            />
          </div>

          <div className="relative flex h-[280px] flex-col justify-between overflow-hidden rounded-[24px] border border-white bg-white/90 p-6 shadow-[0_12px_24px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <img src="/icons/wiki/ic-role.svg" alt="" className="size-[30px]" />
                <span className="text-[24px] font-bold text-black" style={SERIF}>角色档案</span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[14px] leading-[1.7] text-[#252632]/60">
                  汇总角色生平经历、角色羁绊与剧情伏笔，留存丰满立体的角色细节，为续写故事、剧本改编留住独一无二的角色弧光
                </p>
                <div className="h-px w-full bg-[#D9D9D9]/60" />
                <div className="flex items-center gap-1.5">
                  <img src="/icons/wiki/ic-diamond.svg" alt="" className="size-4" />
                  <span className="text-[12px] leading-[1.7] text-[#252632]/60">原创塑造立体角色，拆解现有角色故事线索，续写故事</span>
                </div>
              </div>
            </div>
            <CreateButton label="创建角色档案" onClick={() => toast('创建角色档案功能即将上线（演示）')} />
          </div>
        </div>

        {/* ── 社区权益 ── */}
        <section className="mt-20">
          <SectionTitle>社区权益</SectionTitle>
          <div className="mt-6 grid grid-cols-4 gap-8 max-lg:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <h3 className="text-[16px] font-medium text-[#161823]">{b.title}</h3>
                <p className="mt-2 min-h-[54px] text-[12px] leading-[18px] text-[#252632]/60">{b.desc}</p>
                <img src={b.img} alt={b.title} className="mt-2 w-full select-none" />
              </div>
            ))}
          </div>
        </section>

        {/* ── 发现精彩世界 ── */}
        <section className="mt-20">
          <SectionTitle>发现精彩世界</SectionTitle>

          <div className="mt-4 flex items-center justify-between gap-4">
            {/* 分类 tab */}
            <div className="flex min-w-0 items-center gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((c) => {
                const isActive = c === category
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`relative shrink-0 whitespace-nowrap py-2 text-[16px] transition-colors ${
                      isActive ? 'font-medium text-black' : 'text-black/70 hover:text-black'
                    }`}
                  >
                    {c}
                    {isActive && (
                      <motion.span
                        layoutId="wiki-tab-underline"
                        className="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-[5px] bg-black"
                        transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* 世界书 / 角色档案 切换 */}
            <div className="flex shrink-0 items-center rounded-full border border-white bg-white/40 p-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
              {([
                { key: 'world', label: '世界书', icon: '/icons/wiki/ic-book-white.svg' },
                { key: 'role', label: '角色档案' },
              ] as const).map((m) => {
                const isActive = mode === m.key
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className="relative flex h-8 w-[90px] items-center justify-center gap-1 rounded-full"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="wiki-mode-pill"
                        className="absolute inset-0 rounded-full bg-black/90"
                        transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                      />
                    )}
                    {m.key === 'world' && isActive && (
                      <img src={m.icon} alt="" className="relative z-10 size-[18px]" />
                    )}
                    <span
                      className={`relative z-10 text-[14px] font-bold ${isActive ? 'text-white' : 'text-[#17171F]'}`}
                      style={SERIF}
                    >
                      {m.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 世界书卡片网格 */}
          <div className="mt-4 grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
            {shown.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => onCreateWorld?.()}
                className="group flex h-[123px] gap-3 overflow-hidden rounded-2xl border border-white bg-white p-2 text-left shadow-[0_25px_50px_-12px_rgba(0,0,0,0.07)] transition-transform hover:-translate-y-0.5"
              >
                <img
                  src={`/assets/wiki/covers/${w.id}.webp`}
                  alt={w.title}
                  className="h-[107px] w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1 pr-2 pt-[15px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[20px] font-bold leading-[22px] text-black" style={SERIF}>
                      {w.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-black">
                      {w.entries}篇{mode === 'world' ? '词条' : '档案'}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[14px] leading-[21px] text-[#8F8F93]">{w.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {shown.length === 0 && (
            <div className="flex h-[123px] items-center justify-center text-[13px] text-[#252632]/50">
              该分类下暂无世界书，点击上方按钮创建第一本吧
            </div>
          )}
        </section>
      </motion.div>
    </div>
  )
}
