import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
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
import StarlightPopoverIcon from './StarlightPopoverIcon'
import StarlightRechargeDialog from './StarlightRechargeDialog'
import { CREATOR_PROFILE, PRODUCTS, STARLIGHT, type ProductId } from './data'

type WorkshopNavTaskStatus = Exclude<
  ReturnType<typeof getWorkshopNavTaskStatus>,
  null
>

const STARLIGHT_RECORDS = [
  { label: '每日登录奖励', time: '2026-10-16 17:16', amount: '+200' },
  { label: 'AI 创作-图片生成', time: '2026-10-15 17:16', amount: '-20' },
  { label: '随变-剧本生成', time: '2026-10-10 17:16', amount: '-20' },
  { label: '随变-角色生成', time: '2026-10-6 17:16', amount: '-20' },
  { label: '随变-道具生成', time: '2026-10-5 17:16', amount: '-20' },
] as const

function StarlightBalancePopover({
  onOpenStarlight,
}: {
  onOpenStarlight?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const clearTimer = (timer: typeof openTimer) => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }
  const showSoon = () => {
    clearTimer(closeTimer)
    clearTimer(openTimer)
    openTimer.current = setTimeout(() => setOpen(true), 120)
  }
  const hideSoon = () => {
    clearTimer(openTimer)
    clearTimer(closeTimer)
    closeTimer.current = setTimeout(() => setOpen(false), 140)
  }
  const showNow = () => {
    clearTimer(openTimer)
    clearTimer(closeTimer)
    setOpen(true)
  }

  useEffect(
    () => () => {
      clearTimer(openTimer)
      clearTimer(closeTimer)
    },
    [],
  )

  useEffect(() => {
    if (!open) return
    const handleMove = (event: PointerEvent) => {
      const target = event.target as Node | null
      const inside =
        triggerRef.current?.contains(target) || contentRef.current?.contains(target)
      clearTimer(closeTimer)
      if (!inside) closeTimer.current = setTimeout(() => setOpen(false), 140)
    }
    document.addEventListener('pointermove', handleMove)
    return () => document.removeEventListener('pointermove', handleMove)
  }, [open])

  const openDetails = () => {
    setOpen(false)
    ;(onOpenStarlight ?? (() => toast(`当前星光余额：${STARLIGHT}`)))()
  }

  return (
    <Popover.Root open={open} modal={false}>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label={`星光余额 ${STARLIGHT}`}
          aria-describedby={open ? 'starlight-balance-popover' : undefined}
          onClick={(event) => {
            event.preventDefault()
            openDetails()
          }}
          onPointerEnter={showSoon}
          onPointerLeave={hideSoon}
          onMouseEnter={showSoon}
          onMouseLeave={hideSoon}
          onFocus={showNow}
          onBlur={(event) => {
            if (!contentRef.current?.contains(event.relatedTarget as Node | null)) hideSoon()
          }}
          className="flex h-7 shrink-0 cursor-pointer items-center gap-1 overflow-hidden rounded-[28px] bg-[#F5F7FA] px-3 text-[12px] leading-[normal] font-black text-black transition-colors duration-150 hover:bg-[#F2F4F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#161823]"
          style={{ fontFamily: 'Starlight Roboto, Roboto, sans-serif' }}
        >
          <img src="/icons/starlight-balance.svg" alt="" className="size-[14px] shrink-0" />
          <span className="shrink-0 whitespace-nowrap">{STARLIGHT}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          id="starlight-balance-popover"
          role="dialog"
          aria-label="星光最近明细"
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerEnter={showNow}
          onPointerLeave={hideSoon}
          onMouseEnter={showNow}
          onMouseLeave={hideSoon}
          onFocus={showNow}
          onBlur={(event) => {
            const next = event.relatedTarget as Node | null
            if (!contentRef.current?.contains(next) && !triggerRef.current?.contains(next)) hideSoon()
          }}
          data-starlight-tooltip
          className="z-[90] flex h-[416px] max-h-[calc(100vh-24px)] w-[300px] max-w-[calc(100vw-24px)] flex-col overflow-y-auto rounded-[24px] border border-black/[0.04] bg-white px-5 pb-4 pt-[18px] text-[#1C1F23] shadow-[0_1px_24px_rgba(0,0,0,0.04)] outline-none"
        >
          <div className="flex items-center">
            <div className="flex min-w-0 items-center gap-[5px]">
              <StarlightPopoverIcon />
              <span
                className="truncate text-[16px] font-black leading-5 text-black tabular-nums"
                style={{ fontFamily: 'Roboto, "Roboto Flex", Arial, sans-serif' }}
              >
                {STARLIGHT}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setRechargeOpen(true)
              }}
              className="ml-auto h-[30px] shrink-0 rounded-[10px] bg-[#1F2024] px-3 text-[12px] font-medium leading-[30px] text-white transition-[background-color,transform] duration-150 hover:bg-black active:scale-[0.98]"
            >
              充值星光
            </button>
          </div>

          <div className="mt-7 text-[12px] leading-[18px] text-[#1C1F23]/35">最近明细</div>
          <div className="mt-2 space-y-1">
            {STARLIGHT_RECORDS.map((record) => (
              <div key={`${record.label}-${record.time}`} className="grid h-12 content-center grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1">
                <span className="truncate text-[12px] font-medium leading-4">{record.label}</span>
                <span
                  className={`row-span-2 self-center text-[12px] font-bold leading-[18px] tabular-nums ${
                    record.amount.startsWith('+') ? 'text-[#1C1F23]' : 'text-[#FE2C55]'
                  }`}
                  style={{ fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif' }}
                >
                  {record.amount}
                </span>
                <span
                  className="truncate text-[11px] leading-4 text-[#1C1F23]/30 tabular-nums"
                  style={{ fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif' }}
                >
                  {record.time}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-[10px] flex justify-center">
            <button
              type="button"
              onClick={openDetails}
              className="h-[30px] rounded-[10px] border border-black/[0.06] bg-white px-3 text-[12px] font-medium leading-[30px] text-[#1C1F23] transition-colors duration-150 hover:bg-black/[0.03] active:bg-black/[0.06]"
            >
              星光明细
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
      <StarlightRechargeDialog
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
      />
    </Popover.Root>
  )
}

/** 创作者中心顶栏 — 左 logo、中间产品切换、右侧星光余额 + 头像。
 *  常驻所有产品页之上（包括 AI 工坊），产品入口统一使用 icon + 文字。
 *  方案 1 由外壳把品牌 logo 放进贯通左栏。 */

export default function TopNav({
  active,
  onSelect,
  showLogo = true,
  fused = false,
  overlay = false,
  scrolled = false,
  glassLeftInset = 0,
  leftSlot,
  onOpenStarlight,
  workshopTaskStatus: workshopTaskStatusProp,
}: {
  active: ProductId
  onSelect: (id: ProductId) => void
  showLogo?: boolean
  /** 方案 1：与左上品牌区、产品侧栏共用同一导航底板。 */
  fused?: boolean
  /** 首页通天内容结构：顶栏覆盖在滚动视口之上，不占据独立布局行。 */
  overlay?: boolean
  /** 覆盖态内容进入顶栏下方后，启用半透明玻璃效果。 */
  scrolled?: boolean
  /** 玻璃层从侧栏右边缘开始，避免影响左侧导航区域。 */
  glassLeftInset?: number
  /** 方案 1 全宽三段顶栏的左侧品牌区。 */
  leftSlot?: ReactNode
  /** 打开星光明细；由外壳切回首页产品面并保留现有导航。 */
  onOpenStarlight?: () => void
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
      className={`${overlay ? 'absolute inset-x-0 top-0 transition-[border-color,box-shadow]' : 'relative transition-[background-color,border-color,box-shadow]'} isolate z-[70] flex h-12 shrink-0 items-center duration-200 ${
        fused
          ? `gap-8 px-4 ${scrolled && !overlay ? 'bg-white/92 backdrop-blur-[22px] shadow-[0_1px_0_rgba(22,24,35,0.035)]' : 'bg-transparent'}`
          : `border-b px-3 backdrop-blur-[18px] backdrop-saturate-150 sm:px-4 lg:px-6 ${
              scrolled
                ? overlay
                  ? 'border-white/50 bg-transparent shadow-[0_1px_0_rgba(22,24,35,0.035)]'
                  : 'border-white/50 bg-white/92 shadow-[0_1px_0_rgba(22,24,35,0.035)]'
                : 'border-black/5 bg-white'
            }`
      }`}
    >
      {overlay && scrolled && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-[-1] bg-white"
            style={{ width: glassLeftInset }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-[-1] bg-white/92 backdrop-blur-[18px] backdrop-saturate-150"
            style={{ left: glassLeftInset }}
          />
        </>
      )}
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
            : 'ml-1.5 flex shrink-0 items-center gap-3 sm:ml-auto'
        }
      >
        {/* 星光余额（创作激励的计量单位，非通知数） */}
        <StarlightBalancePopover onOpenStarlight={onOpenStarlight} />
        <AvatarMenu compact={fused} />
      </div>
    </header>
  )
}

/* 菜单行公共样式 — 16px 图标 + 14px 文字,hover 蓝灰填充(设计稿 semi fill-0) */
const menuRow =
  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-[14px] leading-5 text-[#1c1f23] transition-colors hover:bg-[rgba(83,96,143,0.07)]'

const AVATAR_NAV_VERSIONS = [1, 4, 9, 7] as const satisfies readonly NavVersion[]
const NAV_VERSION_NAMES: Record<NavVersion, string> = {
  1: 'L 型',
  2: '内容区收起',
  3: '底部收起',
  4: '文案 Header',
  5: '底部工具栏',
  6: '搜索工具栏',
  7: '内部抖音 AI 工作台',
  8: '顶部工具栏',
  9: '文案 Header · 图标收起',
}

/** 头像下拉：账号菜单 + 导航方案。带 label 时整行都作为触发区。 */
export function AvatarMenu({
  compact = false,
  label,
  placement = 'header',
}: {
  compact?: boolean
  label?: string
  placement?: 'header' | 'sidebar'
}) {
  const navVersion = useNavVersion((s) => s.version)
  const selectNavVersion = useNavVersion((s) => s.setVersion)
  const placedInSidebar = placement === 'sidebar'
  const contentOverflowClass = placedInSidebar
    ? 'overflow-visible'
    : 'overflow-y-auto'
  const accountSwitcherPositionClass = placedInSidebar
    ? 'absolute left-full top-0 hidden pl-2 group-hover:block group-focus-within:block'
    : 'absolute right-full top-0 hidden pr-2 group-hover:block group-focus-within:block'
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
          side={placedInSidebar ? 'top' : 'bottom'}
          align={placedInSidebar ? 'start' : 'end'}
          sideOffset={8}
          aria-label="账号菜单"
          className={`z-[90] max-h-[var(--radix-popover-content-available-height)] w-[232px] rounded-lg bg-white p-2 shadow-[0_4px_7px_rgba(0,0,0,0.1),0_0_0.5px_rgba(0,0,0,0.3)] ${contentOverflowClass}`}
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
            <button type="button" aria-haspopup="menu" className={menuRow}>
              <FigmaGlyph src="/icons/account-menu/switch.svg" inset="8.33% 12.5%" />
              <span className="flex-1 text-left">切换账号</span>
              <FigmaGlyph src="/icons/account-menu/chevron-right.svg" inset="20.83% 33.33%" className="text-[#1c1f23]/60" />
            </button>
            {/* 二级账号面板跟随头像入口所在边缘向内展开，间距同时作为悬停桥。 */}
            <div className={accountSwitcherPositionClass}>
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
