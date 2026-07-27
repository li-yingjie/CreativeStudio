import { motion, useReducedMotion } from 'framer-motion'
import * as Popover from '@radix-ui/react-popover'
import { toast } from 'sonner'
import { Video } from '@/shared/icons'
import AccountSwitcherPanel from './AccountSwitcher'
import FigmaGlyph from './FigmaGlyph'
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
                {/* 图标不吃文字的 70% 透明度 — 未激活也用实色 */}
                <span className={`flex items-center ${isActive ? 'text-white' : 'text-[#161823]'}`}>
                  <MaskIcon url={p.icon} />
                </span>
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

/* 菜单行公共样式 — 16px 图标 + 14px 文字,hover 蓝灰填充(设计稿 semi fill-0) */
const menuRow =
  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-[14px] leading-5 text-[#1c1f23] transition-colors hover:bg-[rgba(83,96,143,0.07)]'

/** 头像下拉：账号菜单 + 权限开关（直播管理）。 */
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
        {/* 设计稿 创作者中心26.7 788-20791:身份认证/通知中心/切换账号/退出登录;
            权限管理(直播管理开关)保留在菜单底部。切换账号 hover 出二级账号面板。 */}
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          aria-label="账号菜单"
          className="z-[90] w-[200px] rounded-lg bg-white p-2 shadow-[0_4px_7px_rgba(0,0,0,0.1),0_0_0.5px_rgba(0,0,0,0.3)]"
        >
          <button type="button" onClick={() => toast('身份认证（演示）')} className={menuRow}>
            <FigmaGlyph src="/icons/account-menu/certificate.svg" inset="3.57%" />
            <span className="flex-1 text-left">身份认证</span>
          </button>
          <button type="button" onClick={() => toast('通知中心（演示）')} className={menuRow}>
            <FigmaGlyph src="/icons/account-menu/notification.svg" inset="8.33%" />
            <span className="flex flex-1 items-center gap-1 text-left">
              通知中心
              <span className="rounded-full bg-[#ff2c55] px-1 py-px text-[10px] leading-[14px] text-white">12</span>
            </span>
          </button>
          <div className="group relative">
            <button type="button" className={menuRow}>
              <FigmaGlyph src="/icons/account-menu/switch.svg" inset="8.33% 12.5%" />
              <span className="flex-1 text-left">切换账号</span>
              <FigmaGlyph src="/icons/account-menu/chevron-right.svg" inset="20.83% 33.33%" className="text-[#1c1f23]/60" />
            </button>
            {/* 二级账号面板 — 悬停展开,pr 作为鼠标移动的悬停桥 */}
            <div className="absolute right-full top-0 hidden pr-2 group-hover:block">
              <AccountSwitcherPanel />
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast('退出登录（演示）')}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-[14px] leading-5 text-[#f74331] transition-colors hover:bg-[rgba(83,96,143,0.07)]"
          >
            <FigmaGlyph src="/icons/account-menu/login.svg" inset="8.33%" />
            <span className="flex-1 text-left">退出登录</span>
          </button>
          <div className="mx-2 my-1.5 h-px bg-black/5" />
          <div className="px-2 pb-1 text-[11px] font-medium text-[#252632]/40">权限管理</div>
          <button
            type="button"
            onClick={toggleLive}
            role="switch"
            aria-checked={liveEnabled}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-[rgba(83,96,143,0.07)]"
          >
            <Video size={15} className="text-[#252632]/60" />
            <span className="flex-1 text-[13px] text-[#252632]">直播管理</span>
            <Switch on={liveEnabled} />
          </button>
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
