import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Gamepad2,
  Layers,
  Palette,
  Sparkles,
  WandSparkles,
  X,
} from '@/shared/icons'
import type { InspirationItem } from './MioraInspirationGallery'

interface BreakdownSection {
  id: 'gameplay' | 'creative' | 'motion' | 'design-system' | 'engineering'
  title: string
  subtitle: string
  icon: typeof Gamepad2
  prompt: string
  content: React.ReactNode
}

export const EARTH_VILLAGE_FULL_PROMPT = `复刻一个「地球村直播大赏」风格的移动端直播活动，但不要照搬品牌与素材。

实现目标：把多赛道直播赛事包装成“宇宙村落探索 + 定时抽奖”的活动体验，让用户快速理解赛道、任务、抽奖和榜单关系，并持续回访。

玩法：设置 12 个直播赛道；用户进入赛道观看直播、完成互动任务获得活动值；每开播满 30 分钟获得一次抽奖机会；提供赛道榜、个人进度、奖励记录和规则页。

创意：以深空中的地球村为核心舞台，运动、音乐、汽车等拟人化 3D 角色像卫星一样环绕地球；用舞台追光串联“全民开播”与“全球村落”的概念。

动效：星尘缓慢纵深漂移，主角色做 6–10px 错峰悬浮，追光每 4 秒扫过一次，CTA 采用轻微呼吸高光；页面切换使用 240ms 上推淡入，遵守 prefers-reduced-motion。

Design System：深空蓝 #071226、舞台蓝 #0B4FB3、电光蓝 #20A7FF、奖励黄 #FFD334、品牌红 #FF2442；标题使用重字重无衬线，数字使用等宽字体；卡片 16px 圆角、按钮胶囊形、蓝色外发光只用于关键进度与 CTA。

工程：输出 campaign.config.json、tokens.css、motion.spec.json，以及首页、赛道页、任务抽奖页、榜单页、奖励记录页、规则页的 React + TypeScript 页面骨架。业务规则与视觉 Token 分离，所有赛道和奖励均由配置驱动。`

const GAMEPLAY_PROMPT = `为移动端直播赛事设计可配置玩法：12 个赛道；观看直播与互动任务累计活动值；每开播满 30 分钟发放一次抽奖机会；包含赛道榜、个人进度、奖励记录、规则页。请输出状态机、配置字段、异常状态和埋点。`
const CREATIVE_PROMPT = `以“地球村直播大赏”为概念设计移动端活动 KV：深空地球作为舞台，运动、音乐、汽车等拟人化 3D 角色环绕地球，顶部追光聚焦直播入口。氛围年轻、热闹、有全球盛典感，避免复制现有品牌与角色。`
const MOTION_PROMPT = `为深空直播活动定义动效规范：星尘纵深漂移；角色 6–10px 错峰悬浮；舞台追光每 4 秒扫过；CTA 轻微呼吸；进度达成时爆发粒子；页面切换 240ms 上推淡入。输出时长、缓动、触发条件、降级策略和 reduced-motion 方案。`
const DESIGN_SYSTEM_PROMPT = `生成一套直播盛典 Design System：主色 #071226 / #0B4FB3 / #20A7FF，奖励色 #FFD334，强调色 #FF2442；标题重字重无衬线、数字等宽；卡片圆角 16px、胶囊 CTA、分层蓝色外发光。输出 tokens、排版层级、间距、组件状态和可访问性约束。`

const TOKENS = [
  ['深空背景', '#071226'],
  ['舞台蓝', '#0B4FB3'],
  ['电光蓝', '#20A7FF'],
  ['奖励黄', '#FFD334'],
  ['直播红', '#FF2442'],
  ['高亮白', '#F7FBFF'],
]

function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label}已复制`))
    .catch(() => toast.error('复制失败，请重试'))
}

function downloadBlueprint() {
  const blueprint = {
    name: 'global-village-live-awards',
    version: '0.1.0',
    source: 'inspiration-framework-demo',
    goal: '把多赛道直播赛事包装成宇宙村落探索与定时抽奖体验',
    gameplay: {
      tracks: 12,
      earnMethods: ['watch_live', 'interactive_task', 'invite'],
      drawRule: { unit: 'live_minutes', threshold: 30, reward: 'draw_chance' },
      surfaces: ['home', 'track', 'tasks-and-draw', 'leaderboard', 'rewards', 'rules'],
    },
    designSystem: {
      colors: Object.fromEntries(TOKENS),
      radius: { card: 16, button: 999, modal: 24 },
      typography: { display: 'Douyin Sans / PingFang SC', numeric: 'DIN Alternate / monospace' },
    },
    files: [
      'campaign.config.json',
      'tokens.css',
      'motion.spec.json',
      'src/pages/Home.tsx',
      'src/pages/Track.tsx',
      'src/pages/TasksAndDraw.tsx',
      'src/pages/Leaderboard.tsx',
      'src/pages/Rewards.tsx',
      'src/pages/Rules.tsx',
    ],
    prompt: EARTH_VILLAGE_FULL_PROMPT,
  }
  const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'global-village-recreation-blueprint.json'
  anchor.click()
  URL.revokeObjectURL(url)
  toast.success('复刻蓝图已下载')
}

function SectionRow({ section }: { section: BreakdownSection }) {
  const [open, setOpen] = useState(section.id === 'gameplay')
  const Icon = section.icon
  return (
    <section className="overflow-hidden rounded-[12px] border border-black/[0.06] bg-white">
      <div className="flex min-h-14 items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#1664FF]/[0.08] text-[#1664FF]">
            <Icon size={16} strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-[#1C1F23]">{section.title}</span>
            <span className="mt-0.5 block truncate text-[10px] text-[#1C1F23]/40">{section.subtitle}</span>
          </span>
          <ChevronDown
            size={15}
            strokeWidth={1.8}
            className={`shrink-0 text-[#1C1F23]/35 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={() => copyText(section.prompt, `${section.title} Prompt`)}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border border-black/[0.08] px-2.5 text-[11px] font-medium text-[#1C1F23]/60 hover:bg-[#F5F6F7] hover:text-[#1C1F23]"
        >
          <Copy size={13} strokeWidth={1.8} />
          复制
        </button>
      </div>
      {open && <div className="border-t border-black/[0.05] bg-[#FAFAFB] px-4 py-4">{section.content}</div>}
    </section>
  )
}

export default function InspirationCaseDetail({
  item,
  onClose,
  onRecreate,
}: {
  item: InspirationItem
  onClose: () => void
  onRecreate: (prompt: string) => void
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const sections = useMemo<BreakdownSection[]>(
    () => [
      {
        id: 'gameplay',
        title: '玩法',
        subtitle: '赛道、任务、抽奖与榜单的配置骨架',
        icon: Gamepad2,
        prompt: GAMEPLAY_PROMPT,
        content: (
          <div className="grid grid-cols-2 gap-2 text-[11px] leading-[17px] text-[#1C1F23]/65">
            {[
              ['入口', '选择 12 个直播赛道进入分会场'],
              ['积累', '观看与互动任务累计活动值'],
              ['激励', '每开播 30 分钟获得一次抽奖'],
              ['反馈', '赛道榜、个人进度与奖励记录'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[9px] border border-black/[0.05] bg-white p-3">
                <div className="mb-1 font-semibold text-[#1C1F23]">{title}</div>
                {description}
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'creative',
        title: '创意',
        subtitle: '地球村、舞台追光与拟人角色的视觉隐喻',
        icon: WandSparkles,
        prompt: CREATIVE_PROMPT,
        content: (
          <p className="text-[11px] leading-[19px] text-[#1C1F23]/65">
            用“所有赛道汇聚同一个地球村”解释全民开播；球类、音乐、汽车等角色代表不同内容赛道，环地球轨道建立全球联结感，追光承担直播入口的视觉指引。
          </p>
        ),
      },
      {
        id: 'motion',
        title: '动效',
        subtitle: '漂浮、追光、粒子与页面转场规范',
        icon: Sparkles,
        prompt: MOTION_PROMPT,
        content: (
          <div className="space-y-2 text-[11px] text-[#1C1F23]/65">
            {['星尘：18–24s 纵深慢循环', '角色：2.8–4.2s 错峰悬浮', '追光：4s 扫过并停留 CTA', '达成：粒子爆发 600ms', '转场：上推淡入 240ms'].map((line) => (
              <div key={line} className="flex items-center gap-2"><span className="size-1 rounded-full bg-[#1664FF]" />{line}</div>
            ))}
          </div>
        ),
      },
      {
        id: 'design-system',
        title: 'Design System',
        subtitle: '颜色、排版、圆角、光效与核心组件',
        icon: Palette,
        prompt: DESIGN_SYSTEM_PROMPT,
        content: (
          <div>
            <div className="grid grid-cols-3 gap-2">
              {TOKENS.map(([name, value]) => (
                <div key={value} className="rounded-[8px] border border-black/[0.05] bg-white p-2">
                  <div className="h-7 rounded-[5px]" style={{ backgroundColor: value }} />
                  <div className="mt-1.5 text-[9px] font-medium text-[#1C1F23]">{name}</div>
                  <div className="font-mono text-[8px] text-[#1C1F23]/35">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-[8px] bg-white p-3 text-[10px] leading-[17px] text-[#1C1F23]/55">
              Display 32/38 Heavy · H1 24/30 Bold · Body 14/22 Regular · Card R16 · CTA Full · Glow 0 0 24 / 24% Blue
            </div>
          </div>
        ),
      },
      {
        id: 'engineering',
        title: '工程交付',
        subtitle: '配置、Token、动效规范与 6 个页面骨架',
        icon: FileCode2,
        prompt: EARTH_VILLAGE_FULL_PROMPT,
        content: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[9px] text-[#1C1F23]/55">
              {['campaign.config.json', 'tokens.css', 'motion.spec.json', 'Home.tsx', 'Track.tsx', 'TasksAndDraw.tsx', 'Leaderboard.tsx', 'Rewards.tsx', 'Rules.tsx'].map((file) => (
                <div key={file} className="truncate">/{file}</div>
              ))}
            </div>
            <button
              type="button"
              onClick={downloadBlueprint}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-[8px] bg-[#1C1F23] text-[11px] font-medium text-white hover:bg-black"
            >
              <Download size={14} strokeWidth={1.8} />
              下载复刻蓝图 JSON
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1C1F23]/55 p-4 backdrop-blur-[6px]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${item.title} 复刻拆解`}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex h-[min(900px,calc(100vh-32px))] w-[min(1480px,calc(100vw-32px))] overflow-hidden rounded-[24px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.24)] max-lg:flex-col"
      >
        <aside className="flex w-[440px] shrink-0 flex-col border-r border-black/[0.06] max-lg:h-1/2 max-lg:w-full max-lg:border-b max-lg:border-r-0">
          <div className="flex items-center justify-between px-5 py-4">
            <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-full hover:bg-[#F2F3F5]" aria-label="关闭详情">
              <X size={17} strokeWidth={1.8} />
            </button>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => copyText(EARTH_VILLAGE_FULL_PROMPT, '完整 Prompt')} className="flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[11px] text-[#1C1F23]/55 hover:bg-[#F2F3F5] hover:text-[#1C1F23]">
                <Copy size={13} strokeWidth={1.8} /> 完整 Prompt
              </button>
              <button type="button" onClick={() => window.open(item.sourceUrl, '_blank', 'noopener,noreferrer')} className="flex size-8 items-center justify-center rounded-full text-[#1C1F23]/45 hover:bg-[#F2F3F5] hover:text-[#1C1F23]" aria-label="打开原始案例">
                <ExternalLink size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <div className="mb-5">
              <div className="mb-2 inline-flex rounded-full bg-[#1664FF]/[0.08] px-2.5 py-1 text-[10px] font-medium text-[#1664FF]">活动复刻框架 · Demo</div>
              <h2 className="text-[21px] font-semibold leading-7 text-[#1C1F23]">地球村直播大赏</h2>
              <p className="mt-2 text-[11px] leading-[18px] text-[#1C1F23]/48">来源 @{item.author} · 基于公开素材进行结构化拆解，不复制原品牌资产</p>
            </div>

            <div className="mb-3 rounded-[12px] bg-[#F5F7FA] p-4">
              <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#1C1F23]"><Layers size={14} strokeWidth={1.8} />复刻目标</div>
              <p className="text-[11px] leading-[19px] text-[#1C1F23]/60">把 12 赛道直播赛事转译成“宇宙村落探索 + 定时抽奖”的移动端体验，让用户一眼理解赛道、任务、抽奖与榜单，并形成持续回访。</p>
            </div>

            <div className="space-y-2">{sections.map((section) => <SectionRow key={section.id} section={section} />)}</div>
          </div>

          <div className="border-t border-black/[0.06] bg-white p-4">
            <button
              type="button"
              onClick={() => onRecreate(EARTH_VILLAGE_FULL_PROMPT)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1664FF] text-[13px] font-semibold text-white shadow-[0_8px_22px_rgba(22,100,255,0.24)] hover:bg-[#0E55DF]"
            >
              <Sparkles size={15} strokeWidth={1.8} />
              带入输入框继续修改
            </button>
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#F4F5F7] p-8 max-lg:min-h-0 max-lg:p-4">
          <div className="absolute left-6 top-5 text-[11px] font-medium text-[#1C1F23]/45">效果预览</div>
          <div className="absolute right-6 top-4 flex items-center gap-2 rounded-[10px] bg-white p-1 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <span className="rounded-[7px] bg-[#F2F3F5] px-3 py-1.5 text-[10px] font-medium text-[#1C1F23]">移动端</span>
            <span className="px-3 py-1.5 text-[10px] text-[#1C1F23]/35">活动页</span>
          </div>
          <div className="relative mt-7 h-[min(780px,calc(100vh-120px))] aspect-[9/16] overflow-hidden rounded-[22px] border-[7px] border-[#1C1F23] bg-[#071226] shadow-[0_24px_70px_rgba(7,18,38,0.28)] max-lg:h-full">
            <video src={item.mediaUrl} autoPlay muted loop playsInline poster={item.posterUrl} className="h-full w-full object-cover" />
          </div>
        </main>
      </div>
    </div>,
    document.body,
  )
}
