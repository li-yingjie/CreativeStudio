import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '@/shared/storage/theme'
import {
  AppWindow,
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronRight,
  FolderCode,
  Gamepad2,
  Image as ImageIcon,
  LayoutGrid,
  Paperclip,
  X,
  type LucideIcon,
} from '@/shared/icons'
import FigmaIcon from './FigmaIcon'

/* ─── Platform home (new-project landing) ─── */

/** Scene pills under the home composer. Clicking a pill opens a flyout of
 *  that scene's quick commands; each command's `prompt` ghost-fills the
 *  composer on hover and is sent on click. */
type SceneCommand = { label: string; prompt: string }
type HomeScene = { label: string; icon: LucideIcon; svg?: string; commands: SceneCommand[] }
const HOME_SCENES: HomeScene[] = [
  {
    label: 'AI 分身',
    icon: Bot,
    svg: '/icons/bot-smile.svg',
    commands: [
      { label: '生成运营活动社群的 AI 分身', prompt: '帮我生成一个用于运营活动社群的 AI 分身，能在群里答疑、发活动通知、活跃气氛。' },
      { label: '生成评论区回复用户问题的 AI 分身', prompt: '帮我生成一个能在评论区自动回复用户问题的 AI 分身。' },
      { label: '做一个会聊星座情感的 AI 分身', prompt: '帮我做一个会聊星座和情感话题的 AI 分身，语气温柔治愈。' },
      { label: '给分身配置自动欢迎语', prompt: '帮我给 AI 分身配置一套关注 / 进群时的自动欢迎语。' },
      { label: '做一个客服答疑 AI 分身', prompt: '帮我做一个客服答疑 AI 分身，能回答常见售前售后问题。' },
    ],
  },
  {
    label: '小程序',
    icon: LayoutGrid,
    svg: '/icons/mini-programs.svg',
    commands: [
      { label: '做一个每日打卡小程序', prompt: '帮我做一个每日打卡小程序，支持连续打卡、提醒和成就徽章。' },
      { label: '做一个第五人格主题塔罗小程序', prompt: '帮我做一个第五人格主题的塔罗运势小程序，每天可抽一张牌。' },
      { label: '做一个抽奖小程序', prompt: '帮我做一个抽奖小程序，支持每日抽奖、分享得机会。' },
      { label: '做一个会员积分小程序', prompt: '帮我做一个会员积分小程序，支持积分累计与兑换。' },
      { label: '做一个预约报名小程序', prompt: '帮我做一个预约报名小程序，支持选时段、填信息和提醒。' },
    ],
  },
  {
    label: '营销设计',
    icon: ImageIcon,
    svg: '/icons/image-03.svg',
    commands: [
      { label: '做一张新品促销主视觉海报', prompt: '帮我做一张新品促销主视觉海报。' },
      { label: '生成推广《剑来》动画的异形卡', prompt: '帮我生成一张推广《剑来》动画的异形卡海报。' },
      { label: '做一个节日抽奖 H5 活动页', prompt: '帮我做一个节日主题的抽奖 H5 活动页，含倒计时、奖品楼层和分享。' },
      { label: '生成一条新品种草短视频脚本', prompt: '帮我生成一条新品种草短视频脚本，含分镜、口播和字幕。' },
      { label: '做一组朋友圈九宫格海报', prompt: '帮我做一组朋友圈九宫格拼图海报。' },
    ],
  },
  {
    label: '产品设计',
    icon: AppWindow,
    svg: '/icons/browser.svg',
    commands: [
      { label: '做一个产品落地页', prompt: '帮我做一个产品落地页，突出卖点和转化。' },
      { label: '设计一套产品 UI 界面与组件规范', prompt: '帮我设计一套产品 UI 界面与组件规范，含配色、字体和常用组件。' },
      { label: '设计一个产品功能原型图', prompt: '帮我设计一个产品核心功能的交互原型图。' },
      { label: '做一个个人作品集网站', prompt: '帮我做一个个人作品集网站，含首页、作品、关于和联系页。' },
      { label: '做一个公司官网首页', prompt: '帮我做一个公司官网首页，含品牌介绍与业务板块。' },
    ],
  },
  {
    label: '游戏设计',
    icon: Gamepad2,
    svg: '/icons/gaming-pad-01.svg',
    commands: [
      { label: '做一款竖版弹幕射击 + Roguelike 太空游戏', prompt: '帮我做一款竖版弹幕射击 + Roguelike 的太空小游戏。' },
      { label: '做一个翻牌记忆小游戏', prompt: '帮我做一个翻牌记忆配对小游戏。' },
      { label: '做一个跑酷小游戏', prompt: '帮我做一个横版跑酷小游戏。' },
      { label: '做一个答题闯关小游戏', prompt: '帮我做一个答题闯关小游戏。' },
      { label: '做一个消除类小游戏', prompt: '帮我做一个三消消除类小游戏。' },
    ],
  },
]

/** Scene icon — renders the project-provided SVG via a CSS mask so it picks
 *  up the ink color (theme-adaptive) regardless of the file's own fills.
 *  Falls back to the lucide/Tabler icon when no SVG is supplied. */
function SceneGlyph({ scene }: { scene: HomeScene }) {
  if (scene.svg) {
    return (
      <span
        aria-hidden
        className="h-[15px] w-[15px] shrink-0 bg-[var(--color-ink)]/55"
        style={{
          maskImage: `url(${scene.svg})`,
          WebkitMaskImage: `url(${scene.svg})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
    )
  }
  const Icon = scene.icon
  return <Icon size={14} strokeWidth={1.8} className="shrink-0 text-[var(--color-ink)]/55" />
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
  const isLight = useThemeStore((s) => s.mode) === 'light'

  /* Scene quick-command flyout. Clicking a scene pill opens a popover of
   * that scene's commands; hovering a command ghost-fills the composer (via
   * the placeholder, which renders grey), clicking sends it. */
  const [activeScene, setActiveScene] = useState<string | null>(null)
  const [ghostText, setGhostText] = useState<string | null>(null)
  const sceneAreaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!activeScene) return
    const handler = (e: PointerEvent) => {
      if (sceneAreaRef.current && !sceneAreaRef.current.contains(e.target as Node)) {
        setActiveScene(null)
        setGhostText(null)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [activeScene])
  const openScene = HOME_SCENES.find((s) => s.label === activeScene)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`relative my-3 mr-3 flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[16px] px-6 pb-48 pt-6 ${
        isLight ? 'bg-white' : 'bg-[var(--color-surface-0)]'
      }`}
    >
      {/* Ambient illustration — grainy pastel glow pinned to the top-right.
           Only shown in light mode; dark mode keeps the flat surface. */}
      {isLight && (
        <img
          aria-hidden
          src="/bg/platform-home-glow.png"
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-auto w-[720px] max-w-[70%] select-none object-contain object-right-top"
        />
      )}

      {/* Hero */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="text-center font-semibold tracking-[0.64px] text-[var(--color-ink)]">
          <span className="text-[32px]">抖音</span>
          <span className="text-[16px]"> </span>
          <span className="text-[32px]">AI</span>
          <span className="text-[16px]"> </span>
          <span className="text-[32px]">打开无限可能</span>
        </div>
        <p className="text-[16px] leading-[22px] text-[var(--color-ink)]/60">
          所见即所得，链接抖音生态
        </p>
      </div>

      {/* Prompt composer — h-[140px] fixed card, content justified to the
           bottom (textarea grows upward from the action row). */}
      <div className="relative mt-6 w-full max-w-[810px]">
        <div className="relative flex h-[140px] flex-col justify-end gap-2 overflow-hidden rounded-[16px] bg-[var(--color-surface-0)] p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_10px_15px_-5px_rgba(0,0,0,0.05)]">
          {/* rainbow tint */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-4 blur-[20px]"
            style={{
              backgroundImage:
                'linear-gradient(0deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%), linear-gradient(98deg, rgba(255,186,51,0.15) 7.59%, rgba(78,217,44,0.15) 23.2%, rgba(69,146,242,0.15) 44.7%, rgba(110,124,253,0.15) 66.3%, rgba(225,53,248,0.15) 92.3%)',
            }}
          />

          <div className="relative flex min-h-0 flex-1 flex-col pl-3 pt-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSubmit(draft)
                }
              }}
              placeholder={ghostText ?? '请描述你的需求，我来帮你完成～'}
              rows={1}
              className="block h-full w-full flex-1 resize-none bg-transparent text-[14px] leading-[22px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/45"
            />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 items-center gap-1 rounded-full border border-[var(--divider)] px-4 text-[14px] font-semibold text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <FolderCode size={16} strokeWidth={1.8} />
                扩展
              </button>
              <button
                type="button"
                aria-label="附件"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--divider)] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <Paperclip size={16} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="Figma"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--divider)] text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                <FigmaIcon size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-semibold text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                Auto
                <ChevronDown size={16} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                aria-label="发送"
                onClick={() => onSubmit(draft)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-ink-contrast)] transition-all hover:-translate-y-[1px] hover:opacity-90"
              >
                <ArrowUp size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scene pills + per-scene quick-command flyout. The flyout is
           absolutely positioned so opening it never shifts the composer. */}
      <div
        ref={sceneAreaRef}
        className="relative z-20 mt-5 flex w-full max-w-[920px] flex-col items-center"
      >
        <div
          className={`tab-scroll flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-x-auto transition-opacity duration-150 ${
            openScene ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          {HOME_SCENES.map((scene) => {
            const { label } = scene
            const active = activeScene === label
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActiveScene(active ? null : label)
                  setGhostText(null)
                }}
                className={`flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors ${
                  active
                    ? 'border-[var(--color-ink)]/30 bg-[var(--fill-subtle)] text-[var(--color-ink)]'
                    : 'border-[var(--divider)] bg-[var(--color-surface-0)] text-[var(--color-ink)]/80 hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]'
                }`}
              >
                <SceneGlyph scene={scene} />
                {label}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
        {openScene && (() => {
          return (
            <motion.div
              key={openScene.label}
              initial={{ opacity: 0, y: -6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.985 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'top center' }}
              onClick={() => {
                setActiveScene(null)
                setGhostText(null)
              }}
              className="absolute left-1/2 top-0 z-30 w-[810px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-2xl bg-[var(--color-surface-0)]"
            >
              <div className="flex items-center justify-between px-5 py-3">
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-ink)]/55">
                  <SceneGlyph scene={openScene} />
                  {openScene.label}
                </span>
                <button
                  type="button"
                  aria-label="关闭"
                  onClick={() => {
                    setActiveScene(null)
                    setGhostText(null)
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-ink)]/45 transition-colors hover:bg-[var(--fill-soft)] hover:text-[var(--color-ink)]"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
              <div className="flex flex-col px-2 pb-2">
                {openScene.commands.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onMouseEnter={() => setGhostText(c.prompt)}
                    onMouseLeave={() => setGhostText(null)}
                    onClick={() => {
                      onSubmit(c.prompt)
                      setActiveScene(null)
                      setGhostText(null)
                    }}
                    className="group flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] text-[var(--color-ink)] transition-colors hover:bg-[var(--fill-subtle)]"
                  >
                    <span className="min-w-0 truncate">{c.label}</span>
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-[var(--color-ink)]/35 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )
        })()}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
