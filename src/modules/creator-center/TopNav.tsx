import { motion } from 'framer-motion'
import * as Popover from '@radix-ui/react-popover'
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
  return (
    <header className="relative z-[70] flex h-12 shrink-0 items-center border-b border-black/5 bg-white px-4">
      {/* logo */}
      <button type="button" onClick={() => onSelect('home')} className="flex items-center">
        <img src="/icons/logo.svg" alt="抖音创作者中心" className="h-7" />
      </button>

      {/* 产品菜单（绝对居中，与两侧内容无关） */}
      <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
        {PRODUCTS.map((p) => {
          const isActive = p.id === active
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`relative flex h-8 items-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors duration-300 ${
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
                  transition={{ type: 'tween', duration: 0.25, ease: [0.25, 0.8, 0.3, 1] }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <MaskIcon url={p.icon} />
                {p.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {/* 星光余额（创作激励的计量单位，非通知数） */}
        <button
          type="button"
          title="星光"
          className="flex h-7 items-center gap-1 rounded-full px-2 text-[13px] font-medium text-[#161823] hover:bg-black/5"
        >
          <img src="/icons/AI.svg" alt="星光" className="h-4 w-4" />
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
        <img
          src={CREATOR_PROFILE.avatar}
          alt="我的头像"
          className="h-7 w-7 cursor-pointer rounded-full object-cover ring-1 ring-black/10 hover:ring-black/25"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
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
    <span className={`relative inline-flex h-[18px] w-[30px] shrink-0 items-center rounded-full transition-colors ${on ? 'bg-[#161823]' : 'bg-black/15'}`}>
      <span className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-[13px]' : 'translate-x-0.5'}`} />
    </span>
  )
}
