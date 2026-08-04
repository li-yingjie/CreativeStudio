import { ChevronRight } from '@/shared/icons'

/* ─── 「看看大家的兴趣卡」——「兴趣卡模板」这一栏的案例墙 ───
 *
 * 设计稿 创中 AI创作 3477-14625：252px 玻璃卡片，上面是分类 Tag +
 * 标题 + 一句说明，下面探出一台手机，机身被卡片下沿裁掉。
 * 手机 = UI 截图 + 半透明机身外壳（phone-frame），两层各自定位，
 * 尺寸照设计稿写死，别让容器去拉伸它们。 */

const SHOT = '/assets/workshop'
const PHONE_FRAME = `${SHOT}/phone-frame.webp`

interface InterestCard {
  id: string
  tag: string
  title: string
  desc: string
  ui: string
}

const CARDS: InterestCard[] = [
  {
    id: 'answers',
    tag: '情感心理',
    title: '答案之书',
    desc: '翻开答案之书，为当下困惑抽取一句随机启发。',
    ui: `${SHOT}/phone-ui-answers.webp`,
  },
  {
    id: 'words',
    tag: '语言',
    title: '单词学习',
    desc: '学习雅思高频词汇，结合释义与熟练度反馈巩固记忆。',
    ui: `${SHOT}/phone-ui-words.webp`,
  },
  {
    id: 'color',
    tag: '人文艺术',
    title: '中国色鉴赏',
    desc: '探索中国传统色，每抹颜色背后都是一个诗意故事。',
    ui: `${SHOT}/phone-ui-color.webp`,
  },
  {
    id: 'love-reply',
    tag: '情感心理',
    title: '恋爱回复挑战',
    desc: '这是一场关于“误解”的实战，来练练？',
    ui: `${SHOT}/phone-ui-outfit.webp`,
  },
  {
    id: 'dog',
    tag: '宠物',
    title: '猜猜小狗品种',
    desc: '看图猜狗狗品种，四选一作答，挑战你的萌宠知识。',
    ui: `${SHOT}/phone-ui-dog.webp`,
  },
]

export default function InterestCardShowcase({
  onPick,
}: {
  onPick: (card: { title: string; tag: string }) => void
}) {
  return (
    <section className="flex flex-col gap-[14px]">
      <h3 className="px-1 text-[14px] font-semibold leading-[22px] text-[#0f0f12]">
        看看大家的兴趣卡
      </h3>
      {/* 设计稿是一排五张 252px；这里跟灵感网格用同一套断点，
          卡片跟着列宽收放（手机永远贴左 56px，不受宽度影响）。 */}
      <div className="grid grid-cols-5 gap-3 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2">
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onPick({ title: card.title, tag: card.tag })}
            aria-label={`参考「${card.title}」兴趣卡做同款`}
            className="group relative h-[437px] w-full overflow-hidden rounded-[12px] border border-[rgba(45,66,107,0.06)] text-left shadow-[0_25px_50px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_25px_50px_rgba(0,0,0,0.14)] motion-reduce:transition-none"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[12px] bg-gradient-to-b from-[rgba(255,255,255,0.45)] to-white backdrop-blur-[12px]"
            />
            <div className="relative flex flex-col gap-[11px] pb-2 pl-6 pr-[42px] pt-5">
              <div className="flex flex-col items-start gap-[7px]">
                <span className="rounded-[4px] bg-[#1c1f23] px-1 text-[11px] font-medium leading-4 text-[#fefefe]">
                  {card.tag}
                </span>
                <span className="flex items-center text-[16px] font-semibold leading-5 tracking-[0.1px] text-black">
                  {card.title}
                  <ChevronRight size={14} strokeWidth={1.8} className="shrink-0" />
                </span>
              </div>
              <p className="text-[11px] font-light leading-5 text-black">{card.desc}</p>
            </div>
            {/* 手机：容器只定位，机身与截图各自按设计稿尺寸绝对定位，
                下沿由卡片的 overflow-hidden 裁掉。 */}
            <div
              className="relative ml-[56px] mt-[17px] h-[246px] w-[140.5px]"
              style={{
                filter:
                  'drop-shadow(5px 10px 15px rgba(0,0,0,0.2)) drop-shadow(10px 20px 20px rgba(0,0,0,0.2))',
              }}
            >
              <img
                src={card.ui}
                alt=""
                aria-hidden
                className="absolute left-[5px] top-[3px] h-[281px] w-[130px] rounded-[10.667px] bg-white object-cover"
              />
              <img
                src={PHONE_FRAME}
                alt=""
                aria-hidden
                className="absolute left-[-1px] top-[-2px] h-[286px] w-[141.5px] max-w-none"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
