import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { toast } from 'sonner'
import TaskStatusIndicator from '@/shared/components/TaskStatusIndicator'
import {
  getWorkshopNavTaskStatus,
  useWorkshopTaskStatus,
  workshopTaskStatusLabel,
} from '@/shared/storage/workshop-task-status'
import { useNavVersion, type NavVersion } from '@/shared/storage/nav-version'
import AccountSwitcherPanel from './AccountSwitcher'
import FigmaGlyph from './FigmaGlyph'
import MaskIcon from './MaskIcon'
import { CREATOR_PROFILE, PRODUCTS, STARLIGHT, type ProductId } from './data'

type WorkshopNavTaskStatus = Exclude<
  ReturnType<typeof getWorkshopNavTaskStatus>,
  null
>

/** 创作者中心顶栏 — 左 logo、中间产品切换、右侧星光余额 + 头像。
 *  常驻所有产品页之上（包括 AI 工坊），产品入口统一使用 icon + 文字。
 *  方案 1 由外壳把品牌 logo 放进贯通左栏。 */

export default function TopNav({
  active,
  onSelect,
  showLogo = true,
  fused = false,
  leftSlot,
  workshopTaskStatus: workshopTaskStatusProp,
}: {
  active: ProductId
  onSelect: (id: ProductId) => void
  showLogo?: boolean
  /** 方案 1：与左上品牌区、产品侧栏共用同一导航底板。 */
  fused?: boolean
  /** 方案 1 全宽三段顶栏的左侧品牌区。 */
  leftSlot?: ReactNode
  /** 不传时读取全局任务状态；规范/隔离预览可显式传状态，null 表示隐藏。 */
  workshopTaskStatus?: WorkshopNavTaskStatus | null
}) {
  const reduceMotion = useReducedMotion()
  const storedWorkshopTaskStatus = useWorkshopTaskStatus((state) =>
    getWorkshopNavTaskStatus(state.tasksByProject),
  )
  const workshopTaskStatus =
    workshopTaskStatusProp === undefined
      ? storedWorkshopTaskStatus
      : workshopTaskStatusProp
  const centeredNavClass = showLogo
    ? 'md:absolute md:left-1/2 md:ml-0 md:-translate-x-1/2 md:gap-1 md:overflow-visible'
    : 'lg:absolute lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:gap-1 lg:overflow-visible'

  return (
    <header
      data-fused-nav={fused || undefined}
      className={`relative z-[70] flex h-12 shrink-0 items-center ${
        fused
          ? 'gap-8 bg-transparent px-4 backdrop-blur-[22px]'
          : 'border-b border-black/5 bg-white px-3 sm:px-4 lg:px-6'
      }`}
    >
      {fused && (
        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          {leftSlot}
        </div>
      )}

      {/* logo */}
      {showLogo && (
        <button type="button" aria-label="返回创作者中心首页" onClick={() => onSelect('home')} className="flex shrink-0 items-center">
          <img src="/logo.png" alt="" className="h-6 w-auto" />
        </button>
      )}

      {/* 窄屏在两侧内容之间横向滚动，避免绝对居中菜单与账号区重叠。 */}
      <nav
        aria-label="产品导航"
        className={`flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          fused
            ? 'shrink-0 gap-0.5 overflow-visible md:gap-1'
            : `${showLogo ? 'ml-2' : ''} flex-1 gap-0.5 ${centeredNavClass}`
        }`}
      >
        {PRODUCTS.map((p) => {
          const isActive = p.id === active
          const productTaskStatus =
            p.id === 'workshop' ? workshopTaskStatus : null
          const showProductTaskStatus = Boolean(productTaskStatus && !isActive)
          return (
            <button
              key={p.id}
              type="button"
              aria-label={
                showProductTaskStatus && productTaskStatus
                  ? `${p.label}，${workshopTaskStatusLabel(productTaskStatus)}`
                  : p.label
              }
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
                  style={{ borderRadius: 10 }}
                  // tween 不过冲，快速收束时不会产生回弹晃动。
                  transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {/* 图标不吃文字的 70% 透明度 — 未激活也用实色 */}
                <span className={`flex items-center ${isActive ? 'text-white' : 'text-[#161823]'}`}>
                  <MaskIcon url={p.icon} />
                </span>
                <span className="hidden md:inline">{p.label}</span>
                {productTaskStatus && (
                  <span className={isActive ? 'invisible' : undefined}>
                    <TaskStatusIndicator
                      status={productTaskStatus}
                      subject={p.label}
                      decorative
                    />
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </nav>

      <div
        className={
          fused
            ? 'flex min-w-0 flex-1 items-center justify-end gap-3'
            : 'ml-1.5 flex shrink-0 items-center gap-1.5 sm:ml-auto sm:gap-3'
        }
      >
        {/* 星光余额（创作激励的计量单位，非通知数） */}
        <button
          type="button"
          aria-label={`星光余额 ${STARLIGHT}`}
          onClick={() => toast(`当前星光余额：${STARLIGHT}`)}
          className={`flex items-center gap-1 rounded-full text-[13px] font-medium tabular-nums text-[#161823] hover:bg-black/5 ${
            fused ? 'h-6 px-1' : 'h-7 px-1.5 sm:px-2'
          }`}
        >
          <img src="/icons/AI.svg" alt="" className="size-4" />
          {STARLIGHT}
        </button>
        <AvatarMenu compact={fused} />
      </div>
    </header>
  )
}

/* 菜单行公共样式 — 16px 图标 + 14px 文字,hover 蓝灰填充(设计稿 semi fill-0) */
const menuRow =
  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-[14px] leading-5 text-[#1c1f23] transition-colors hover:bg-[rgba(83,96,143,0.07)]'

const AVATAR_NAV_VERSIONS = [1, 4, 7] as const satisfies readonly NavVersion[]
const NAV_VERSION_NAMES: Record<NavVersion, string> = {
  1: 'L 型',
  2: '内容区收起',
  3: '底部收起',
  4: '文案 Header',
  5: '底部工具栏',
  6: '搜索工具栏',
  7: '内部抖音 AI 工作台',
  8: '顶部工具栏',
}

/** 头像下拉：账号菜单 + 导航方案。带 label 时整行都作为触发区。 */
export function AvatarMenu({
  compact = false,
  label,
}: {
  compact?: boolean
  label?: string
}) {
  const navVersion = useNavVersion((s) => s.version)
  const selectNavVersion = useNavVersion((s) => s.setVersion)
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="打开账号菜单"
          className={
            label
              ? 'flex h-8 w-full items-center gap-2 rounded-md pl-1.5 pr-1 text-left text-[12px] font-medium text-[#34373D] hover:bg-black/[0.03]'
              : 'rounded-full'
          }
        >
          <img
            src={CREATOR_PROFILE.avatar}
            alt=""
            className={`${compact ? 'size-6' : 'size-7'} rounded-full object-cover ring-1 ring-black/10 hover:ring-black/25`}
          />
          {label && <span className="min-w-0 truncate">{label}</span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        {/* 设计稿 创作者中心26.7 788-20791：身份认证 / 通知中心 /
            切换账号 / 退出登录；切换账号 hover 出二级账号面板。 */}
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          aria-label="账号菜单"
          className="z-[90] max-h-[var(--radix-popover-content-available-height)] w-[232px] overflow-y-auto rounded-lg bg-white p-2 shadow-[0_4px_7px_rgba(0,0,0,0.1),0_0_0.5px_rgba(0,0,0,0.3)]"
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
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[11px] font-medium text-[#252632]/40">导航方案</span>
            <span className="text-[10px] text-[#252632]/35">
              当前：{NAV_VERSION_NAMES[navVersion]}
            </span>
          </div>
          <div
            role="radiogroup"
            aria-label="导航方案切换"
            className="flex flex-col gap-1 px-2 pb-1"
          >
            {AVATAR_NAV_VERSIONS.map((version) => (
              <Popover.Close asChild key={version}>
                <button
                  type="button"
                  role="radio"
                  aria-label={NAV_VERSION_NAMES[version]}
                  aria-checked={navVersion === version}
                  title={NAV_VERSION_NAMES[version]}
                  onClick={() => selectNavVersion(version)}
                  className={`flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[11px] font-medium transition-colors ${
                    navVersion === version
                      ? 'bg-[#161823] text-white shadow-sm'
                      : 'bg-[#f4f5f7] text-[#252632]/60 hover:bg-[#eceef2] hover:text-[#252632]'
                  }`}
                >
                  <span className="whitespace-nowrap">{NAV_VERSION_NAMES[version]}</span>
                </button>
              </Popover.Close>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
