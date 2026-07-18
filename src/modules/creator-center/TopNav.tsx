import { motion, useReducedMotion } from 'framer-motion'
import * as Popover from '@radix-ui/react-popover'
import { toast } from 'sonner'
import { Video } from '@/shared/icons'
import MaskIcon from './MaskIcon'
import { useLiveMgmt } from './live-store'
import { CREATOR_PROFILE, PRODUCTS, STARLIGHT, type ProductId } from './data'

/** 创作者中心顶栏 — 左 logo、中间产品切换、右侧星光余额 + 头像。
 *  常驻所有产品页之上（包括 AI 工坊）。图标为 public/icons 下的 SVG 素材。 */

export default function TopNav({
  active,
  onSelect,
}: {
  active: ProductId
  onSelect: (id: ProductId) => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <header className="relative z-[70] flex h-12 shrink-0 items-center border-b border-black/5 bg-white px-3 sm:px-4 lg:px-6">
      {/* logo */}
      <button type="button" aria-label="返回创作者中心首页" onClick={() => onSelect('home')} className="flex shrink-0 items-center">
        <img src="/icons/logo.svg" alt="" className="h-7 lg:h-8" />
      </button>

      {/* 窄屏在两侧内容之间横向滚动，避免绝对居中菜单与账号区重叠。 */}
      <nav aria-label="产品导航" className="ml-2 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:absolute md:left-1/2 md:ml-0 md:-translate-x-1/2 md:gap-1 md:overflow-visible">
        {PRODUCTS.map((p) => {
          const isActive = p.id === active
          return (
            <button
              key={p.id}
              type="button"
              aria-label={p.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelect(p.id)}
              className={`relative flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-2 text-[13px] font-medium transition-colors duration-200 md:px-3.5 ${
                isActive
                  ? 'text-white'
                  : 'text-[#161823]/70 hover:bg-black/5 hover:text-[#161823]'
              }`}
            >
              {/* 激活胶囊 — 共享 layoutId，切 tab 时在按钮间平滑滑动 */}
              {isActive && (
                <motion.span
                  layoutId="topnav-active-pill"
                  className="absolute inset-0 bg-[#161823]"
                  // borderRadius 放 style 里，framer 在缩放插值时才能实时校正圆角
                  style={{ borderRadius: 9999 }}
                  // tween 不过冲：spring 会滑过头再回弹，看起来像晃动
                  transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <MaskIcon url={p.icon} />
                <span className="hidden md:inline">{p.label}</span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="ml-1.5 flex shrink-0 items-center gap-1.5 sm:ml-auto sm:gap-3">
        {/* 星光余额（创作激励的计量单位，非通知数） */}
        <button
          type="button"
          aria-label={`星光余额 ${STARLIGHT}`}
          onClick={() => toast(`当前星光余额：${STARLIGHT}`)}
          className="flex h-7 items-center gap-1 rounded-full px-1.5 text-[13px] font-medium tabular-nums text-[#161823] hover:bg-black/5 sm:px-2"
        >
          <img src="/icons/AI.svg" alt="" className="size-4" />
          {STARLIGHT}
        </button>
        <AvatarMenu />
      </div>
    </header>
  )
}

/** 头像下拉：账号信息 + 权限开关（直播管理）。 */
function AvatarMenu() {
  const liveEnabled = useLiveMgmt((s) => s.enabled)
  const toggleLive = useLiveMgmt((s) => s.toggle)
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" aria-label="打开账号菜单" className="rounded-full">
          <img
            src={CREATOR_PROFILE.avatar}
            alt=""
            className="size-7 rounded-full object-cover ring-1 ring-black/10 hover:ring-black/25"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          aria-label="账号与权限"
          className="z-[90] w-[240px] overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-3 border-b border-black/5 p-4">
            <img src={CREATOR_PROFILE.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-[#252632]">{CREATOR_PROFILE.name}</div>
              <div className="truncate text-[11px] text-[#252632]/45">{CREATOR_PROFILE.douyinId}</div>
            </div>
          </div>
          <div className="px-2 py-1.5">
            <div className="px-2 pb-1 pt-1 text-[11px] font-medium text-[#252632]/40">权限管理</div>
            <button
              type="button"
              onClick={toggleLive}
              role="switch"
              aria-checked={liveEnabled}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-black/[0.03]"
            >
              <Video size={15} className="text-[#252632]/60" />
              <span className="flex-1 text-[13px] text-[#252632]">直播管理</span>
              <Switch on={liveEnabled} />
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/** iOS 风格开关（受控展示，点击由父按钮处理）。 */
function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex h-[18px] w-[30px] shrink-0 items-center rounded-full transition-colors duration-200 ${on ? 'bg-[#161823]' : 'bg-black/20'}`}>
      <span className={`absolute size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-[13px]' : 'translate-x-0.5'}`} />
    </span>
  )
}
