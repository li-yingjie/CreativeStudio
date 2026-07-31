import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ChevronDown,
  ChevronRight,
  Code2,
  FolderCode,
  Image as ImageIcon,
  PencilLine,
  Sparkles,
  Video,
} from '@/shared/icons'
import ChatComposer from '@/shared/components/ChatComposer'
import ComposerLocalFileButton from '@/shared/components/ComposerLocalFileButton'

/* ─── Platform home (new-project landing) — 按 Figma「统一导航」229:15581 实现 ─── */

/** 兴趣卡展示：hover 时 prompt 灰字预填输入框，点击直接发送。 */
const INTEREST_CARDS = [
  {
    title: '猜猜小狗品种',
    desc: '看图猜狗狗品种，四选一快速作答，挑战你的萌宠知识储备。',
    ui: '/assets/workshop/phone-ui-dog.webp',
    prompt: '帮我做一个「猜猜小狗品种」兴趣卡：看图猜狗狗品种，四选一快速作答，答完即时揭晓答案。',
  },
  {
    title: '单词学习',
    desc: '学习雅思高频词汇，结合释义与熟练度反馈，轻松巩固记忆。',
    ui: '/assets/workshop/phone-ui-words.webp',
    prompt: '帮我做一个「单词学习」兴趣卡：学习雅思高频词汇，结合释义与熟练度反馈巩固记忆。',
  },
  {
    title: '答案之书',
    desc: '翻开专属答案之书，为当下的困惑获取一句随机启发与回应。',
    ui: '/assets/workshop/phone-ui-answers.webp',
    prompt: '帮我做一个「答案之书」兴趣卡：翻开答案之书，为当下的困惑获取一句随机启发。',
  },
  {
    title: '穿搭灵感',
    desc: '根据场景与风格偏好智能推荐搭配，快速找到今天的穿衣灵感。',
    ui: '/assets/workshop/phone-ui-outfit.webp',
    prompt: '帮我做一个「穿搭灵感」兴趣卡：根据场景与风格偏好智能推荐今日穿搭。',
  },
]

const FEATURED_PROJECTS = [
  { title: 'SANGUORUSH', desc: '三国塔防游戏', img: '/assets/workshop/proj-sanguorush.webp' },
  { title: 'Garuda', desc: '太空射击游戏', img: '/assets/workshop/proj-garuda.webp' },
  { title: '蔚蓝守卫 Azure Keepers', desc: '保卫领土的割草游戏', img: '/assets/workshop/proj-azure.webp' },
  { title: '漫画头像生成器', desc: '自动生成二次元漫画头像', img: '/assets/workshop/proj-avatar-gen.webp' },
  { title: '商单评论洞察', desc: '深度解析目标视频的评论区用户画像与情感倾向，精准提炼痛点与购买意向，反哺选品与投流策略', img: '/assets/workshop/proj-comment.webp' },
  { title: '爆款脚本拆解', desc: '一键提取高赞视频的叙事结构与黄金前三秒 Hook，自动生成可复用的分镜脚本，大幅降低内容创作门槛', img: '/assets/workshop/proj-script.webp' },
  { title: '音视频结构化总结', desc: '将播客或长视频快速转化为带有时间戳的思维导图与核心要点，适用于知识付费与泛知识类创作者', img: '/assets/workshop/proj-summary.webp' },
  { title: '家装智能报价', desc: '一键提取高赞视频的叙事结构与黄金前三秒 Hook，自动生成可复用的分镜脚本，大幅降低内容创作门槛', img: '/assets/workshop/proj-quote.webp' },
  { title: '天气预报', desc: '突破传统的天气数据展示。基于实时气象 API 与用户所处环境，AI 自动进行逻辑推理，一键生成个性化生活简报。', img: '/assets/workshop/proj-weather.webp' },
  { title: '冥想时间', desc: '为高压节奏的创作者定制的正念空间，白噪音与呼吸引导帮你快速回到专注状态', img: '/assets/workshop/proj-meditate.webp' },
  { title: '活动收集', desc: '将播客或长视频快速转化为带有时间戳的思维导图与核心要点，适用于知识付费与泛知识类创作者', img: '/assets/workshop/proj-events.webp' },
  { title: '灵感图文种草机', desc: '迎合抖音图文带货趋势的创作沙盒。输入商品名称或核心卖点，AI 自动生成高级质感的轮播图文，100% 可二次编辑。', img: '/assets/workshop/proj-carousel.webp' },
]

const PLACEHOLDER =
  '帮我生成一个「今天吃什么」兴趣卡。用户选择预算、口味、用餐人数等条件后，随机推荐适合的菜品，并支持"再来一个"随机切换结果，帮助用户快速做出选择。'

/** 玻璃手机 mockup — 屏幕截图 + 玻璃边框两层叠加，底部由卡片裁掉。 */
function GlassPhone({ ui }: { ui: string }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[138px] h-[286px] w-[141px] -translate-x-1/2 select-none"
      style={{ filter: 'drop-shadow(5px 10px 15px rgba(0,0,0,0.2)) drop-shadow(10px 20px 20px rgba(0,0,0,0.12))' }}
    >
      <img src={ui} alt="" className="absolute left-[5px] top-[3px] w-[130px] rounded-[11px]" />
      <img src="/assets/workshop/phone-frame.webp" alt="" className="absolute inset-0 w-[141px]" />
    </div>
  )
}

/** 输入框工具条按钮（带文字）。装饰态，与设计稿一致。 */
function ToolChip({ icon: Icon, label }: { icon: typeof Code2; label: string }) {
  return (
    <button
      type="button"
      className="flex h-9 items-center gap-1 rounded-full px-1.5 text-[14px] font-semibold text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
    >
      <Icon size={16} strokeWidth={1.8} />
      {label}
    </button>
  )
}

export default function PlatformHome({
  draft,
  setDraft,
  onSubmit,
}: {
  draft: string
  setDraft: (s: string) => void
  onSubmit: (text: string) => void
}) {
  const [ghostText, setGhostText] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 100%), linear-gradient(180deg, #F2F2F7 0%, #F5F5F5 100%)',
      }}
    >
      {/* ASCII 世界地图纹理 — 设计稿导出，压在渐变底上 */}
      <img
        aria-hidden
        src="/assets/workshop/ascii-map.webp"
        alt=""
        className="pointer-events-none absolute left-1/2 top-[-340px] w-[1537px] max-w-none -translate-x-1/2 select-none opacity-60"
      />

      <div className="relative mx-auto w-full max-w-[1032px] px-6 pb-20">
        {/* Hero */}
        <div className="flex items-center justify-center gap-2 pt-[96px] text-center text-[38px] font-bold text-black">
          <span>AI工坊</span>
          <span>·</span>
          <span>把好想法变成好玩法</span>
          <span className="text-[43px]">💡</span>
        </div>

        {/* 输入框 — 统一 ChatComposer（114px） */}
        <div className="mx-auto mt-[50px] max-w-[800px] rounded-[32px] border-[0.5px] border-[rgba(16,17,18,0.05)] shadow-[0_4px_64px_rgba(30,31,35,0.02)]">
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSend={() => onSubmit(draft)}
            placeholder={ghostText ?? PLACEHOLDER}
            ariaLabel="输入你的创作想法"
            sendDisabled={false}
            skinClassName="rounded-[32px] border border-white bg-gradient-to-b from-[rgba(251,251,251,0.6)] to-white backdrop-blur-[12px]"
            inputClassName="platform-home-composer-input px-1 pt-1 text-[14px] leading-[24px] text-[#1C1F23] placeholder:text-[#1C1F23]/35"
            sendButtonClassName="size-9 bg-[#1C1F23] text-white transition-all hover:-translate-y-[1px] hover:opacity-90"
            footerLeft={
              <>
                <ToolChip icon={Code2} label="兴趣卡" />
                <ToolChip icon={ImageIcon} label="图片" />
                <ToolChip icon={Video} label="视频" />
                <ToolChip icon={PencilLine} label="调研" />
                <span aria-hidden className="h-4 w-px bg-black/10" />
                <ComposerLocalFileButton
                  iconSize={16}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                />
                <button
                  type="button"
                  className="flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-semibold text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                >
                  <FolderCode size={16} strokeWidth={1.8} />
                  扩展
                </button>
              </>
            }
            footerExtra={
              <button
                type="button"
                className="flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-semibold text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
              >
                <Sparkles size={16} strokeWidth={1.8} />
                Auto
                <ChevronDown size={16} strokeWidth={1.8} />
              </button>
            }
          />
        </div>

        {/* 兴趣卡介绍 banner */}
        <div className="relative mx-auto mt-[17px] h-[214px] max-w-[800px] rounded-[32px] border border-[rgba(45,66,107,0.06)]">
          <div className="absolute inset-0 overflow-hidden rounded-[32px] border border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.07)]">
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.45)] to-white backdrop-blur-[12px]" />
            <img
              src="/assets/workshop/banner-vibe.webp"
              alt=""
              className="absolute left-1 top-1 h-[204px] w-[293px] rounded-[28px] object-cover"
            />
            {/* CREATE 栏 */}
            <div className="absolute left-[315px] top-[22px] w-[210px]">
              <div className="text-[9px] font-bold uppercase tracking-[-0.08px] text-black/50">create</div>
              <div className="mt-[13px] text-[16px] font-semibold leading-[22px] text-[#1C1F23]">创造兴趣卡 vibecoding</div>
              <p className="mt-[19px] text-[12px] font-light leading-[18px] text-black">
                抖音兴趣卡，是抖音全新的 Vibe Coding 内容形态。创作者无需代码，即可围绕用户兴趣生成并发布互动卡片，在 Feed 流中精准触达，让每个兴趣点都能被看见、被体验、被分享。
              </p>
            </div>
            <span aria-hidden className="absolute left-[541px] top-[27px] h-[160px] w-px bg-black/10" />
            {/* SEARCH 栏 */}
            <div className="absolute left-[565px] top-[22px] w-[210px]">
              <div className="text-[9px] font-bold uppercase tracking-[-0.08px] text-black/50">search</div>
              <div className="mt-[13px] flex items-center justify-between">
                <span className="text-[16px] font-semibold leading-[22px] text-[#1C1F23]">寻找你的兴趣</span>
                <button
                  type="button"
                  className="flex h-6 items-center gap-1 rounded-full border border-[#E8E8E8] bg-white/70 px-2.5 text-[12px] font-semibold text-[#1C1F23] shadow-[0_8px_15px_rgba(0,0,0,0.02)] transition-colors hover:bg-white"
                >
                  宠物
                  <ChevronDown size={10} strokeWidth={2.5} />
                </button>
              </div>
              <p className="mt-[19px] text-[12px] font-light leading-[18px] text-black">
                通过真实萌宠图片发起趣味识犬挑战，用户可从 4 个品种选项中快速作答，并即时查看答案。轻量有趣、操作简单，在连续挑战中认识更多狗狗品种，增加内容的互动性与探索感。
              </p>
            </div>
          </div>
        </div>

        {/* 兴趣卡 */}
        <section className="mt-[60px]">
          <h2 className="px-1 text-[14px] font-semibold leading-[22px] text-[#0F0F12]">兴趣卡</h2>
          <div className="mt-[11px] grid grid-cols-4 gap-4 max-lg:grid-cols-2">
            {INTEREST_CARDS.map((card) => (
              <button
                key={card.title}
                type="button"
                onMouseEnter={() => setGhostText(card.prompt)}
                onMouseLeave={() => setGhostText(null)}
                onClick={() => onSubmit(card.prompt)}
                className="group relative flex h-[373px] flex-col items-stretch justify-start overflow-hidden rounded-[14px] border border-[rgba(45,66,107,0.06)] text-left shadow-[0_25px_50px_-12px_rgba(0,0,0,0.07)] transition-transform hover:-translate-y-1"
              >
                <div aria-hidden className="absolute inset-0 rounded-[14px] border border-white bg-gradient-to-b from-[rgba(255,255,255,0.45)] to-white backdrop-blur-[12px] shadow-[inset_0_1px_2px_0_white]" />
                <div className="relative p-6">
                  <div className="text-[16.5px] font-semibold leading-5 tracking-[0.14px] text-black">{card.title}</div>
                  <p className="mt-[7px] w-[158px] text-[11px] font-light leading-[20.7px] text-black">{card.desc}</p>
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className="mt-[9px] text-black transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <GlassPhone ui={card.ui} />
              </button>
            ))}
          </div>
        </section>

        {/* 精选项目 */}
        <section className="mt-12">
          <h2 className="px-1 text-[14px] font-semibold leading-[22px] text-[#0F0F12]">精选项目</h2>
          <div className="mt-[11px] grid grid-cols-4 gap-4 max-lg:grid-cols-2">
            {FEATURED_PROJECTS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => toast(`打开「${p.title}」（演示）`)}
                className="relative rounded-[16px] border border-[rgba(45,66,107,0.06)] text-left transition-transform hover:-translate-y-0.5"
              >
                <div className="relative flex flex-col gap-1 overflow-hidden rounded-[16px] border border-white p-[5px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.07)]">
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.45)] to-white backdrop-blur-[12px] shadow-[inset_0_1px_2px_0_white]" />
                  <img src={p.img} alt="" className="relative h-[130px] w-full rounded-[12px] object-cover" />
                  <div className="relative px-[10px] pb-1.5 pt-1">
                    <div className="truncate text-[16px] font-semibold leading-[22px] text-[#1C1F23]">{p.title}</div>
                    <p className="mt-1 truncate text-[12px] leading-[17px] text-[#1C1F23]/35">{p.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  )
}
