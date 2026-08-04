import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  LayoutTemplate,
  MoreHorizontal,
  Palette,
  Plus,
  Presentation,
  Puzzle,
  Smartphone,
  Sparkles,
  Star,
  X,
} from '@/shared/icons'
import ChatComposer from '@/shared/components/ChatComposer'
import AsciiTexture from './AsciiTexture'
import InterestCardShowcase from './InterestCardShowcase'
import { XIAHUA_TEMPLATE_TOKEN } from './XiahuaBuildScript'

/* ─── AI 工坊首页 — 按 Figma 探索 151:12832「首页入口（方案2）」实现 ───
 *
 * 结构：hero 椭圆图片簇 + 标题 → 输入框 → 灵感需求 chips
 * → 分类 tab → 灵感作品网格（hover 出「做同款」）。 */

/** 顶部椭圆图片簇 —— 直接用 AI 平台 (ai_design) 线上那张 hero ring：
 *  同一个构图，但带磨砂玻璃质感（Figma 单节点导出会把左下那颗渲染成
 *  生硬的深色照片，跟画板里看到的不一样）。尺寸/定位也照搬它的
 *  .heroRing：945 宽、top -24、居中。 */
const HERO_RING = '/assets/workshop/hero-ring.webp'

const INSPIRE = '/assets/workshop/inspire'

const PLACEHOLDER = '说说你想做什么，例如：生成一套炉石风格的游戏卡牌'

/** 选中态主色（抖音蓝）。 */
const BLUE = '#1664FF'

/** 快捷入口。选中后工具条只留这枚蓝色入口，后面跟该类型的下拉槽位
 *  （豆包那套交互）：第一个槽是做什么，后面是参数。 */
/** 已存成活动模板的那个活动 —— 营销活动入口的「模板」槽位里选它。 */
const TEMPLATE_OPTION = '夯爆了 · 集卡 H5 模板'

const TOOLS = [
  {
    key: 'card',
    label: '兴趣卡',
    Icon: ImageIcon,
    placeholder: '说说你的兴趣卡，例如：第五人格主题的塔罗运势兴趣卡',
    params: [
      { label: '玩法', options: ['塔罗运势', '心理测验', '榜单盘点', '点单卡'] },
      { label: '卡片比例', options: ['9:16', '3:4', '1:1'] },
      { label: '模板', options: ['默认', '简约', '潮玩', '国风'] },
      { label: '互动', options: ['点击翻牌', '滑动切换', '无'] },
    ],
  },
  {
    key: 'marketing',
    label: '营销活动',
    Icon: LayoutTemplate,
    placeholder: '说说你的活动，例如：做一个新春抽奖 H5，红金国风主视觉',
    params: [
      { label: '玩法', options: ['集卡兑奖', '抽奖玩法', '报名表单', '榜单排名', '分享裂变'] },
      { label: '活动形态', options: ['H5 活动页', '原生活动页', '小程序'] },
      // 存过的活动模板挂在这里：选中之后按模板换素材换玩法生成新活动
      { label: '模板', options: ['不使用模板', TEMPLATE_OPTION] },
      { label: '活动周期', options: ['3 天', '7 天', '14 天'] },
    ],
  },
  {
    key: 'design',
    label: '设计素材',
    Icon: Palette,
    placeholder: '说说你要的素材，例如：一张国风金龙主题的活动 KV',
    params: [
      { label: '素材类型', options: ['海报', '资源位图片', '活动 KV', '直播间背景'] },
      { label: '比例', options: ['1:1', '3:4', '16:9', '9:16'] },
      { label: '风格', options: ['通用', '国风', '赛博', '手绘'] },
      { label: '数量', options: ['×1', '×2', '×4'] },
    ],
  },
  {
    key: 'game',
    label: '游戏素材',
    Icon: Gamepad2,
    placeholder: '说说你要的游戏素材，例如：一套 8 帧的像素小人跑步精灵帧',
    params: [
      {
        label: '素材类型',
        options: ['精灵帧动画', '序列帧特效', '游戏卡牌', '角色立绘', '场景原画', '道具图标', 'UI 图标'],
      },
      { label: '画风', options: ['像素', '二次元', '卡通', '写实'] },
      { label: '帧数', options: ['4 帧', '8 帧', '12 帧', '单图'] },
      { label: '交付', options: ['精灵图集', '逐帧序列', 'PNG 透明底'] },
    ],
  },
  /* ── 以下收在「更多」里 ── */
  {
    key: 'web-game',
    label: '网页游戏',
    Icon: Puzzle,
    more: true,
    placeholder: '说说你的小游戏，例如：一个新春主题的三消，竖屏、60 秒一局',
    params: [
      { label: '玩法', options: ['三消', '跑酷', '答题', '塔防'] },
      { label: '屏幕', options: ['竖屏', '横屏'] },
      { label: '单局时长', options: ['60 秒', '3 分钟', '不限'] },
      { label: '排行榜', options: ['带排行榜', '无排行榜'] },
    ],
  },
  {
    key: 'mini-program',
    label: '小程序',
    Icon: Smartphone,
    more: true,
    placeholder: '说说你的小程序，例如：一个粉丝专属的周边预约小程序',
    params: [
      { label: '类型', options: ['工具', '内容', '电商', '服务预约'] },
      { label: '页面数', options: ['3 页', '5 页', '8 页'] },
      { label: '登录', options: ['需登录', '免登录'] },
      { label: '数据库', options: ['带数据库', '无数据库'] },
    ],
  },
  {
    key: 'ai-avatar',
    label: 'AI 分身',
    Icon: Bot,
    more: true,
    placeholder: '说说你的分身，例如：一个替我回私信的游戏区达人分身',
    params: [
      { label: '人设', options: ['专业', '亲和', '幽默'] },
      { label: '声音', options: ['声音克隆', '女声', '男声'] },
      { label: '回复长度', options: ['简短', '适中', '详细'] },
      { label: '接管场景', options: ['私信', '评论', '直播'] },
    ],
  },
  {
    key: 'ops-proposal',
    label: '运营提案',
    Icon: Presentation,
    more: true,
    placeholder: '说说你的提案，例如：暑期游戏区涨粉活动的策划案',
    params: [
      { label: '提案类型', options: ['活动策划', '内容规划', '增长复盘'] },
      { label: '篇幅', options: ['一页纸', '3 页', '完整方案'] },
      { label: '数据', options: ['带数据', '不带数据'] },
      { label: '交付', options: ['文档', '幻灯片'] },
    ],
  },
] as const

type Tool = (typeof TOOLS)[number]

/** 工具条上平铺的入口；其余收进「更多」。 */
const PRIMARY_TOOLS = TOOLS.filter((t) => !('more' in t))
const MORE_TOOLS = TOOLS.filter((t) => 'more' in t)

const SUGGESTIONS = [
  '生成第五人格主题的塔罗运势兴趣卡',
  '生成同城咖啡点单兴趣卡',
  '制作 MBTI 心理测验',
  '写脚本定时爬取热榜',
  '长视频自动提取逐字稿',
  '看评测视频生成对比兴趣卡',
]

const TABS = [
  '全网灵感',
  '海报',
  '资源位图片',
  '活动KV',
  '直播间背景',
  '游戏卡牌',
  '游戏角色',
  'H5活动页',
  '原生化活动页',
  '兴趣卡模板',
]

interface Work {
  id: string
  img: string
  author: string
  likes: number
  /** 自己存的活动模板 —— 排在最前面，hover 是「用这个模板」 */
  template?: boolean
}

/** 灵感作品 —— 卡面来自设计稿导出；author/likes 为演示数据。 */
const WORKS: Work[] = [
  { id: 'knight-of-wands', img: `${INSPIRE}/card-knight-of-wands.webp`, author: '用户名', likes: 334 },
  { id: 'likui', img: `${INSPIRE}/card-likui.webp`, author: '三国研究所', likes: 281 },
  { id: 'valeera', img: `${INSPIRE}/card-valeera.webp`, author: '卡牌铺子', likes: 512 },
  { id: 'yanqing', img: `${INSPIRE}/card-yanqing.webp`, author: '燕青不燕', likes: 197 },
  { id: 'three-of-cups', img: `${INSPIRE}/card-three-of-cups.webp`, author: '塔罗小馆', likes: 426 },
  { id: 'page-of-cups', img: `${INSPIRE}/card-page-of-cups.webp`, author: '塔罗小馆', likes: 158 },
  { id: 'five-of-swords', img: `${INSPIRE}/card-five-of-swords.webp`, author: '牌灵', likes: 243 },
  { id: 'yanqing-2', img: `${INSPIRE}/card-yanqing.webp`, author: '水浒星卡', likes: 88 },
  { id: 'valeera-2', img: `${INSPIRE}/card-valeera.webp`, author: '炉石同人', likes: 365 },
  { id: 'likui-2', img: `${INSPIRE}/card-likui.webp`, author: '黑旋风', likes: 132 },
]

const AUTHOR_AVATAR = `${INSPIRE}/author.webp`

/** 工具行按钮（icon + 文字）。 */
function ToolChip({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Palette
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2 text-[14px] text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
    >
      <Icon size={16} strokeWidth={1.8} />
      {label}
    </button>
  )
}

/** 工具条上的小浮层：点外面关掉。 */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  return { open, setOpen, ref }
}

/** 浮层皮肤 —— 向上展开、贴住触发器左边。 */
const POPOVER =
  'absolute bottom-full left-0 z-30 mb-2 min-w-[132px] rounded-[12px] border border-black/5 bg-white p-1 shadow-[0_8px_28px_rgba(30,31,35,0.14)]'

/** 参数下拉 —— 收起时只显示当前值，工具条才放得下四个。 */
function ParamSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  const { open, setOpen, ref } = usePopover()

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[13px] transition-colors ${
          open ? 'bg-black/5 text-[#1C1F23]' : 'text-[#1C1F23]/70 hover:bg-black/5 hover:text-[#1C1F23]'
        }`}
      >
        {value}
        <ChevronDown size={14} strokeWidth={1.8} />
      </button>
      {open && (
        <div className={POPOVER}>
          <div className="px-2 py-1 text-[11px] text-[#1C1F23]/40">{label}</div>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-4 whitespace-nowrap rounded-[8px] px-2 py-1.5 text-[13px] text-[#1C1F23] transition-colors hover:bg-black/5"
            >
              {o}
              {o === value && <Check size={14} strokeWidth={2.2} style={{ color: BLUE }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** 「更多」—— 平铺不下的入口收在这儿，选中后和平铺入口完全一样。 */
function MoreTools({ onPick }: { onPick: (t: Tool) => void }) {
  const { open, setOpen, ref } = usePopover()

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="更多入口"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1.5 rounded-full px-2 text-[14px] transition-colors ${
          open ? 'bg-black/5 text-[#1C1F23]' : 'text-[#1C1F23]/80 hover:bg-black/5 hover:text-[#1C1F23]'
        }`}
      >
        <MoreHorizontal size={16} strokeWidth={1.8} />
        更多
      </button>
      {open && (
        <div className={POPOVER}>
          {MORE_TOOLS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                onPick(t)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] text-[#1C1F23] transition-colors hover:bg-black/5"
            >
              <t.Icon size={15} strokeWidth={1.8} className="shrink-0 opacity-70" />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlatformHome({
  draft,
  setDraft,
  onSubmit,
}: {
  draft: string
  setDraft: (s: string) => void
  onSubmit: (
    text: string,
    attachment?: { name: string; size: number; type: string },
  ) => void
}) {
  const [activeTab, setActiveTab] = useState('游戏卡牌')
  /* 快捷入口：选中一个类型后，右侧换成它自己的下拉槽位。 */
  const [tool, setTool] = useState<Tool | null>(null)
  /* 槽位按 `${tool.key}.${槽位名}` 存，切换类型时各自的选择还在。 */
  const [params, setParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      TOOLS.flatMap((t) => t.params.map((p) => [`${t.key}.${p.label}`, p.options[0]])),
    ),
  )
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  /* 输入 @ 弹出模板引用：选中后 token 进输入框，提交时由工坊识别并复刻。 */
  const [mentionOpen, setMentionOpen] = useState(false)
  const mentionRef = useRef<HTMLDivElement>(null)
  const templateRegistered =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('xiahua-template-registered') === '1'

  useEffect(() => {
    if (!mentionOpen) return
    const close = (e: PointerEvent) => {
      if (!mentionRef.current?.contains(e.target as Node)) setMentionOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [mentionOpen])

  /* 「H5活动页」这一栏把存好的活动模板排在最前面。 */
  const works = useMemo(
    () =>
      activeTab === 'H5活动页' && templateRegistered
        ? [
            {
              id: 'tpl-xiahua',
              img: '/assets/xiahua/head-kv.png',
              author: '夯爆了 · 集卡 H5 模板',
              likes: 0,
              template: true,
            },
            ...WORKS,
          ]
        : WORKS,
    [activeTab, templateRegistered],
  )

  /* 选中的类型 + 各槽位作为前缀带进 prompt，别只是装饰。 */
  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed && !attachedFile) return
    const request = trimmed || '请根据这份策划文档完整搭建活动'
    const attachment = attachedFile
      ? { name: attachedFile.name, size: attachedFile.size, type: attachedFile.type }
      : undefined
    setAttachedFile(null)
    if (!tool) return onSubmit(request, attachment)
    const picked = tool.params.map((p) => params[`${tool.key}.${p.label}`])
    // 选了活动模板 = 引用它复刻：把 token 带进 prompt，工坊按模板拆替换清单
    const usesTemplate =
      tool.key === 'marketing' && params['marketing.模板'] === TEMPLATE_OPTION
    const ps = picked.filter((v) => v !== '不使用模板').join(' / ')
    const body = usesTemplate ? `${XIAHUA_TEMPLATE_TOKEN} ${request}` : request
    onSubmit(`【${tool.label}｜${ps}】${body}`, attachment)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      /* isolate 不能少 —— ASCII 底纹是 z-[-2] 的 canvas，只有本层自己成为
         层叠上下文，它才会画在这层背景之上、内容之下；否则会被祖先的
         背景盖掉（AI 平台那边同样靠 .page 的 isolation: isolate）。 */
      className="relative isolate min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 100%), linear-gradient(180deg, #F2F2F7 0%, #F5F5F5 100%)',
      }}
    >
      {/* ASCII 底纹 —— 与 AI 平台同一套 canvas 实现（原来是一张静态贴图） */}
      <AsciiTexture />

      <div className="relative mx-auto flex w-full max-w-[1308px] flex-col items-center px-6 pb-20">
        {/* ── Hero ──
             纵向节奏全部按内容面板（Figma 151:12862）的绝对坐标还原：
             椭圆簇 top 89.6（538×260，居中），标题组 top 274（=48 顶部内距
             + 226），输入框 top 368 —— 所以簇底 349.6 到输入框正好 18。 */}
        <div className="relative flex h-[350px] w-full flex-col items-center">
          <img
            aria-hidden
            src={HERO_RING}
            alt=""
            className="pointer-events-none absolute top-[-24px] z-0 w-[945px] max-w-none select-none"
          />
          <div className="relative z-10 flex flex-col items-center gap-4 pt-[274px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[24px] font-bold leading-none text-[#1C1F23]">创所未见</span>
              <span aria-hidden className="size-1 rounded-full bg-[#1C1F23]" />
              <span className="text-[24px] font-bold leading-none text-[#1C1F23]">AI工坊</span>
            </div>
            <p className="flex items-center gap-1 text-[16px] tracking-[0.32px] text-[#1C1F23]/60">
              把好想法变成好玩法 <span aria-hidden>💡</span>
            </p>
          </div>
        </div>

        {/* ── 输入框 ── */}
        <div className="relative mt-[18px] w-full max-w-[800px]">
          {/* 设计稿：输入框背后的深色光晕。用 box-shadow 而不是模糊方块——
              外阴影会被裁在 border-box 之外，不会从磨砂输入框里透出来。 */}
          <div className="relative rounded-[32px] border-[0.5px] border-[rgba(16,17,18,0.05)] shadow-[0_4px_64px_rgba(30,31,35,0.02),0_28px_88px_-28px_rgba(27,48,81,0.45)]">
            {/* @模板 引用弹层 —— 输入 @ 时贴在输入框上方 */}
            {mentionOpen && (
              <div
                ref={mentionRef}
                className="absolute -top-2 left-8 z-40 w-[340px] -translate-y-full rounded-[12px] border border-black/5 bg-white p-1.5 shadow-[0_8px_28px_rgba(30,31,35,0.14)]"
              >
                <div className="px-2 py-1 text-[11px] text-[#1C1F23]/40">引用模板</div>
                {templateRegistered ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(`${draft.replace(/@$/, '')}${XIAHUA_TEMPLATE_TOKEN} `)
                      setMentionOpen(false)
                    }}
                    className="flex w-full items-start gap-2.5 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-black/5"
                  >
                    <span className="mt-[1px] flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#7C4DFF]/10 text-[12px] font-bold text-[#7C4DFF]">
                      TPL
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] leading-[18px] text-[#1C1F23]">
                        夯爆了 · 集卡 H5 模板
                      </span>
                      <span className="block text-[11px] leading-[16px] text-[#1C1F23]/45">
                        基于夯爆了活动方案抽象 · 先确认模板文档，再换素材和玩法
                      </span>
                    </span>
                  </button>
                ) : (
                  <div className="px-2 py-2 text-[12px] leading-[18px] text-[#1C1F23]/45">
                    还没有可引用的模板 —— 打开做完的活动，在预览工具条点「存为活动模板」
                  </div>
                )}
              </div>
            )}
            <ChatComposer
              /* 传附件不撑高 —— 附件卡挤占输入区，输入框整体高度不动。 */
              height={166}
              value={draft}
              onChange={(v) => {
                setDraft(v)
                setMentionOpen(v.endsWith('@'))
              }}
              onSend={() => submit(draft)}
              placeholder={tool?.placeholder ?? PLACEHOLDER}
              ariaLabel="输入你的创作想法"
              sendDisabled={!draft.trim() && !attachedFile}
              skinClassName="rounded-[32px] border border-white bg-gradient-to-b from-[rgba(251,251,251,0.6)] to-white backdrop-blur-[12px]"
              inputClassName="platform-home-composer-input px-3 pt-2 text-[14px] leading-[20px] text-[#1C1F23] placeholder:text-[#1C1F23]/35"
              sendButtonClassName="size-9 bg-[#1C1F23] text-white transition-all hover:-translate-y-[1px] hover:opacity-90"
              attachments={
                attachedFile && (
                  // 上传的文档回显在输入区顶部（豆包式附件卡），不挤工具行
                  <div className="mx-1 mt-1 flex w-fit max-w-[320px] items-center gap-2.5 rounded-[12px] border border-black/5 bg-white px-2.5 py-2 shadow-[0_1px_4px_rgba(30,31,35,0.06)]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[#3370FF]/10 text-[#3370FF]">
                      <FileText size={18} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] leading-[18px] text-[#1C1F23]" title={attachedFile.name}>
                        {attachedFile.name}
                      </span>
                      <span className="block text-[11px] leading-[16px] text-[#1C1F23]/45">
                        {attachedFile.name.split('.').pop()?.toUpperCase()} ·{' '}
                        {attachedFile.size >= 1024 * 1024
                          ? `${(attachedFile.size / 1024 / 1024).toFixed(1)} MB`
                          : `${Math.max(1, Math.round(attachedFile.size / 1024))} KB`}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="移除上传文档"
                      onClick={() => setAttachedFile(null)}
                      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[#1C1F23]/50 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                    >
                      <X size={13} strokeWidth={2} />
                    </button>
                  </div>
                )
              }
              footerLeft={
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx,.pdf,.md,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/markdown,text/plain"
                    className="hidden"
                    onChange={(event) => {
                      setAttachedFile(event.target.files?.[0] ?? null)
                      event.currentTarget.value = ''
                    }}
                  />
                  <button
                    type="button"
                    aria-label="上传文档"
                    title="上传文档"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                  >
                    <Plus size={16} strokeWidth={1.8} />
                  </button>
                  <span aria-hidden className="h-4 w-px bg-black/10" />
                  {tool ? (
                    <>
                      {/* 选中的入口：蓝色，带 ✕ 退回默认工具条 */}
                      <span
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-full pl-2 pr-1.5 text-[14px]"
                        style={{ color: BLUE, backgroundColor: 'rgba(22,100,255,0.08)' }}
                      >
                        <tool.Icon size={16} strokeWidth={1.8} />
                        {tool.label}
                        <button
                          type="button"
                          aria-label={`退出${tool.label}`}
                          onClick={() => setTool(null)}
                          className="flex size-5 items-center justify-center rounded-full transition-colors hover:bg-[rgba(22,100,255,0.14)]"
                        >
                          <X size={13} strokeWidth={2.2} />
                        </button>
                      </span>
                      {/* 下拉槽位紧跟在入口后面左对齐，别甩到右边留一大段空 */}
                      {tool.params.map((p) => (
                        <ParamSelect
                          key={p.label}
                          label={p.label}
                          // 没存过模板就没这个选项，不给空的模板槽位
                          options={
                            templateRegistered
                              ? p.options
                              : p.options.filter((o) => o !== TEMPLATE_OPTION)
                          }
                          value={params[`${tool.key}.${p.label}`]}
                          onChange={(v) =>
                            setParams((cur) => ({ ...cur, [`${tool.key}.${p.label}`]: v }))
                          }
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {PRIMARY_TOOLS.map((t) => (
                        <ToolChip
                          key={t.key}
                          icon={t.Icon}
                          label={t.label}
                          onClick={() => setTool(t)}
                        />
                      ))}
                      <MoreTools onPick={setTool} />
                    </>
                  )}
                </>
              }
              footerExtra={
                tool ? null : (
                  <button
                    type="button"
                    onClick={() => toast('切换模型（演示）')}
                    className="flex h-9 items-center gap-1 rounded-full px-3 text-[14px] text-[#1C1F23]/80 transition-colors hover:bg-black/5 hover:text-[#1C1F23]"
                  >
                    <Sparkles size={16} strokeWidth={1.8} />
                    Auto
                    <ChevronDown size={16} strokeWidth={1.8} />
                  </button>
                )
              }
            />
          </div>
        </div>

        {/* ── 没有灵感？ ── */}
        <div className="mt-[30px] flex w-full max-w-[779px] flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[14px] leading-[22px] text-[rgba(28,31,35,0.6)]">
            <Sparkles size={12} strokeWidth={1.8} />
            没有灵感？试试点击以下需求
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSubmit(s)}
                className="flex h-[42px] items-center gap-2 rounded-[12px] bg-[#F5F7FA] px-4 text-[14px] leading-5 text-[#090C14] transition-colors hover:bg-[#ECEFF5]"
              >
                {s}
                <ArrowUpRight size={12} strokeWidth={2} className="shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 分类 tab + 灵感作品 ── */}
        <div className="mt-[72px] w-full">
          <div className="flex flex-wrap items-center gap-1 pb-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-current={tab === activeTab ? 'true' : undefined}
                className={`flex h-9 items-center rounded-[3px] px-3 text-[14px] leading-5 transition-colors ${
                  tab === activeTab
                    ? 'bg-[rgba(49,46,56,0.05)] font-semibold text-[#1F1C23]'
                    : 'text-[rgba(31,28,35,0.6)] hover:text-[#1F1C23]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 「兴趣卡模板」换成案例墙 —— 卡面网格是给卡牌类看的，
              兴趣卡要看的是它在 Feed 里长什么样。 */}
          {activeTab === '兴趣卡模板' ? (
            <div className="mt-2">
              <InterestCardShowcase
                onPick={({ title }) =>
                  onSubmit(`参考「${title}」这张兴趣卡，帮我做同款`)
                }
              />
            </div>
          ) : (
          <div className="mt-2 grid grid-cols-5 gap-3 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2">
            {/* 存过的活动模板挂在「H5活动页」这一栏的最前面 —— 存完就该能在
                首页看到它，而不是只藏在输入框的 @ 里 */}
            {works.map((w) => (
              <div
                key={w.id}
                className="group relative flex h-[331px] flex-col items-center overflow-hidden rounded-[12px] border border-[rgba(45,66,107,0.06)] shadow-[inset_0_1px_2px_0_white]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[12px] bg-gradient-to-b from-[rgba(255,255,255,0.45)] to-white backdrop-blur-[12px]"
                />
                {/* 卡面：设计稿里是 179×322 居中、带双层投影 */}
                <div
                  className="relative mt-[5px] h-[322px] w-[179px] shrink-0 overflow-hidden rounded-[12px]"
                  style={{
                    filter:
                      'drop-shadow(5px 10px 15px rgba(0,0,0,0.2)) drop-shadow(10px 20px 20px rgba(0,0,0,0.2))',
                  }}
                >
                  <img src={w.img} alt="" className="size-full object-cover" />
                  {/* 底部压暗，托住作者行 */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-black/55 to-transparent"
                  />
                  <div className="absolute inset-x-[13px] bottom-[13px] flex items-center justify-between text-[12px] leading-4 text-white">
                    <span className="flex min-w-0 items-center gap-[5px]">
                      <img
                        src={AUTHOR_AVATAR}
                        alt=""
                        className="size-4 shrink-0 rounded-full object-cover"
                      />
                      <span className="truncate">{w.author}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-px tabular-nums">
                      <Star size={11} strokeWidth={2} />
                      {w.likes}
                    </span>
                  </div>
                </div>
                {/* hover：做同款 */}
                {w.template && (
                  <span className="absolute left-[18px] top-[10px] rounded-[6px] bg-[#1C1F23]/75 px-1.5 py-[2px] text-[11px] font-medium text-white backdrop-blur-[2px]">
                    我的模板
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    w.template
                      ? onSubmit(`${XIAHUA_TEMPLATE_TOKEN} 参考这个模板帮我生成一个新活动`)
                      : onSubmit(`参考这张卡面，帮我做同款「${activeTab}」`)
                  }
                  className="absolute inset-x-[13px] bottom-[13px] flex h-10 translate-y-2 items-center justify-center gap-2 rounded-[100px] bg-[#1C1F23] text-[14px] font-medium text-[#F5F7FA] opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none"
                >
                  <Sparkles size={16} strokeWidth={1.8} />
                  {w.template ? '用这个模板' : '做同款'}
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
