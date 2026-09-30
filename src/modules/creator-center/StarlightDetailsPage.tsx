import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import { toast } from 'sonner'
import { STARLIGHT } from './data'
import MembershipUpgradePanel from './MembershipUpgradePanel'
import StarlightCustomerServiceIcon from './StarlightCustomerServiceIcon'
import StarlightOrderDialog, { StarlightEmptyIcon } from './StarlightOrderDialog'
import StarlightOrderIcon from './StarlightOrderIcon'
import StarlightRechargeDialog from './StarlightRechargeDialog'

type DetailKind = 'all' | 'recharge' | 'reward' | 'spend'

interface StarlightRecord {
  id: number
  time: string
  scene: string
  category: string
  amount: number
  kind: Exclude<DetailKind, 'all'>
}

const DETAIL_TABS: { id: DetailKind; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'recharge', label: '充值' },
  { id: 'reward', label: '奖励' },
  { id: 'spend', label: '消耗' },
]

const CATEGORY_FILTERS = [
  '全部',
  'AI 特效创作',
  '世界玩法',
  '火人形象',
  '聊天小店',
  '火花道具',
  '妙响 AI MV',
] as const

const RECORDS: StarlightRecord[] = [
  { id: 1, time: '2026/09/16 23:59', scene: 'AI 创作-图片生成', category: 'AI 特效创作', amount: -8, kind: 'spend' },
  { id: 2, time: '2026/09/16 23:59', scene: '随变-角色生成', category: '世界玩法', amount: -20, kind: 'spend' },
  { id: 3, time: '2026/09/16 23:59', scene: '随变-剧本生成', category: '世界玩法', amount: -20, kind: 'spend' },
  { id: 4, time: '2026/09/16 23:59', scene: '随变-道具生成', category: '世界玩法', amount: -20, kind: 'spend' },
  { id: 5, time: '2026/09/16 23:59', scene: '随变-分镜生成', category: '世界玩法', amount: -20, kind: 'spend' },
  { id: 6, time: '2026/09/16 23:59', scene: '星光到期清零', category: '世界玩法', amount: -288, kind: 'spend' },
  { id: 7, time: '2026/09/16 23:59', scene: '星光到期清零', category: '世界玩法', amount: -288, kind: 'spend' },
  { id: 8, time: '2026/09/16 23:59', scene: '星光到期清零', category: '世界玩法', amount: -288, kind: 'spend' },
  { id: 9, time: '2026/09/15 16:20', scene: '充值星光', category: '星光充值', amount: 3000, kind: 'recharge' },
  { id: 10, time: '2026/09/12 10:00', scene: '创作活动奖励', category: '平台奖励', amount: 100, kind: 'reward' },
]

function MembershipUpgradeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath="url(#membership-upgrade-icon-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.0013 0.666504C8.27715 0.666504 8.52451 0.83639 8.62353 1.09385L9.96484 4.58124C10.1651 5.10194 10.228 5.25199 10.3141 5.37305C10.4005 5.49452 10.5066 5.60065 10.6281 5.68702C10.7492 5.7731 10.8992 5.83604 11.4199 6.0363L14.9073 7.37761C15.1647 7.47663 15.3346 7.72399 15.3346 7.99984C15.3346 8.27569 15.1647 8.52304 14.9073 8.62207L11.4199 9.96337C10.8992 10.1636 10.7492 10.2266 10.6281 10.3127C10.5066 10.399 10.4005 10.5052 10.3141 10.6266C10.228 10.7477 10.1651 10.8977 9.96484 11.4184L8.62353 14.9058C8.52451 15.1633 8.27715 15.3332 8.0013 15.3332C7.72546 15.3332 7.4781 15.1633 7.37907 14.9058L6.03777 11.4184C5.8375 10.8977 5.77457 10.7477 5.68849 10.6266C5.60211 10.5052 5.49598 10.399 5.37451 10.3127C5.25345 10.2266 5.1034 10.1636 4.58271 9.96337L1.09532 8.62207C0.837855 8.52304 0.667969 8.27569 0.667969 7.99984C0.667969 7.72399 0.837855 7.47663 1.09532 7.37761L4.58271 6.0363C5.1034 5.83604 5.25345 5.7731 5.37451 5.68702C5.49598 5.60065 5.60211 5.49452 5.68849 5.37305C5.77457 5.25198 5.8375 5.10194 6.03777 4.58124L7.37907 1.09385C7.4781 0.83639 7.72545 0.666504 8.0013 0.666504Z"
          fill="url(#membership-upgrade-icon-gradient-main)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.75 1C2.81583 1 2.87486 1.04054 2.89849 1.10198L3.21857 1.9342C3.26636 2.05846 3.28138 2.09426 3.30192 2.12315C3.32253 2.15214 3.34786 2.17747 3.37685 2.19808C3.40574 2.21862 3.44154 2.23364 3.5658 2.28143L4.39802 2.60151C4.45946 2.62514 4.5 2.68417 4.5 2.75C4.5 2.81583 4.45946 2.87486 4.39802 2.89849L3.5658 3.21857C3.44154 3.26636 3.40574 3.28138 3.37685 3.30192C3.34786 3.32253 3.32253 3.34786 3.30192 3.37685C3.28138 3.40574 3.26636 3.44154 3.21857 3.5658L2.89849 4.39802C2.87486 4.45946 2.81583 4.5 2.75 4.5C2.68417 4.5 2.62514 4.45946 2.60151 4.39802L2.28143 3.5658C2.23364 3.44154 2.21862 3.40574 2.19808 3.37685C2.17747 3.34786 2.15214 3.32253 2.12315 3.30192C2.09426 3.28138 2.05846 3.26636 1.9342 3.21857L1.10198 2.89849C1.04054 2.87486 1 2.81583 1 2.75C1 2.68417 1.04054 2.62514 1.10198 2.60151L1.9342 2.28143C2.05846 2.23364 2.09426 2.21862 2.12315 2.19808C2.15214 2.17747 2.17747 2.15214 2.19808 2.12315C2.21862 2.09426 2.23364 2.05846 2.28143 1.9342L2.60151 1.10198C2.62514 1.04054 2.68417 1 2.75 1Z"
          fill="url(#membership-upgrade-icon-gradient-small)"
        />
      </g>
      <defs>
        <linearGradient
          id="membership-upgrade-icon-gradient-main"
          x1="8.0013"
          y1="0.221842"
          x2="8.0013"
          y2="14.444"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#575757" />
          <stop offset="1" stopColor="#151515" />
        </linearGradient>
        <linearGradient
          id="membership-upgrade-icon-gradient-small"
          x1="2.75"
          y1="0.893888"
          x2="2.75"
          y2="4.28782"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#575757" />
          <stop offset="1" stopColor="#151515" />
        </linearGradient>
        <clipPath id="membership-upgrade-icon-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function DetailArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="ml-1 shrink-0"
    >
      <path
        d="M4.21967 1.21967C4.51256 0.926777 4.98744 0.926777 5.28033 1.21967L9.53033 5.46967C9.82322 5.76256 9.82322 6.23744 9.53033 6.53033L5.28033 10.7803C4.98744 11.0732 4.51256 11.0732 4.21967 10.7803C3.92678 10.4874 3.92678 10.0126 4.21967 9.71967L7.93934 6L4.21967 2.28033C3.92678 1.98744 3.92678 1.51256 4.21967 1.21967Z"
        fill="#161823"
        fillOpacity="0.6"
      />
    </svg>
  )
}

function BalanceItem({
  label,
  value,
  icon,
  suffix,
  align = 'center',
  gapClassName = 'gap-2',
  valueClassName = 'text-[20pt]',
}: {
  label: string
  value: string
  icon?: boolean
  suffix?: React.ReactNode
  align?: 'left' | 'center'
  gapClassName?: string
  valueClassName?: string
}) {
  return (
    <div className="min-w-[142px]">
      <div className={`w-fit text-left ${align === 'center' ? 'mx-auto' : 'ml-2'}`}>
        <div className="text-[13px] leading-5 text-[#161823]/55">{label}</div>
        <div className={`mt-1 flex h-8 items-center ${gapClassName} text-[24px] font-semibold leading-8 text-[#161823]`}>
          {icon && <img src="/icons/starlight-balance.svg" alt="" className="size-6 shrink-0" />}
          <span
            className={`${valueClassName} leading-8 tabular-nums`}
            style={{ fontFamily: 'Roboto, "Roboto Flex", Arial, sans-serif' }}
          >
            {value}
          </span>
          {suffix}
        </div>
      </div>
    </div>
  )
}

function RewardStarlightTooltip() {
  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={120}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label="查看奖励星光有效期"
            className="flex size-5 shrink-0 cursor-help items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#161823]/25"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.00065 1.75004C4.10116 1.75004 1.75065 4.10055 1.75065 7.00004C1.75065 9.89954 4.10116 12.25 7.00065 12.25C9.90015 12.25 12.2507 9.89954 12.2507 7.00004C12.2507 4.10055 9.90015 1.75004 7.00065 1.75004ZM0.583984 7.00004C0.583984 3.45621 3.45682 0.583374 7.00065 0.583374C10.5445 0.583374 13.4173 3.45621 13.4173 7.00004C13.4173 10.5439 10.5445 13.4167 7.00065 13.4167C3.45682 13.4167 0.583984 10.5439 0.583984 7.00004ZM6.41732 4.66671C6.41732 4.34454 6.67849 4.08337 7.00065 4.08337H7.00648C7.32865 4.08337 7.58982 4.34454 7.58982 4.66671C7.58982 4.98887 7.32865 5.25004 7.00648 5.25004H7.00065C6.67849 5.25004 6.41732 4.98887 6.41732 4.66671ZM7.00065 6.41671C7.32282 6.41671 7.58398 6.67787 7.58398 7.00004V9.33337C7.58398 9.65554 7.32282 9.91671 7.00065 9.91671C6.67849 9.91671 6.41732 9.65554 6.41732 9.33337V7.00004C6.41732 6.67787 6.67849 6.41671 7.00065 6.41671Z"
                fill="#1C1F23"
                fillOpacity="0.6"
              />
            </svg>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            align="start"
            alignOffset={-48}
            sideOffset={10}
            collisionPadding={12}
            data-starlight-tooltip
            className="z-[90] min-h-[148px] w-[410px] max-w-[calc(100vw-24px)] rounded-[20px] border border-black/[0.06] bg-white px-5 py-[18px] text-[#1C1F23] shadow-[0_1px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="text-[14px] font-semibold leading-5">奖励星光</div>
            <div className="mt-4 grid grid-cols-[minmax(108px,1.05fr)_minmax(90px,1fr)_minmax(132px,1.25fr)] gap-x-3 text-[12px] leading-[18px]">
              <span className="leading-6 text-[#1C1F23]/60">名称</span>
              <span className="leading-6 text-[#1C1F23]/60">奖励星光</span>
              <span className="leading-6 text-[#1C1F23]/60">星光有效期</span>
              <span className="mt-2 font-medium">每日免费星光</span>
              <span className="mt-2 font-medium tabular-nums">200</span>
              <span className="mt-2 tabular-nums" style={{ fontFamily: '"PingFang SC", sans-serif' }}>
                2026-10-16 17:16
              </span>
              <span className="mt-2 font-medium">注册奖励</span>
              <span className="mt-2 font-medium tabular-nums">2800</span>
              <span className="mt-2 tabular-nums" style={{ fontFamily: '"PingFang SC", sans-serif' }}>
                2026-10-16 17:16
              </span>
            </div>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default function StarlightDetailsPage() {
  const reduceMotion = useReducedMotion() ?? false
  const [tab, setTab] = useState<DetailKind>('all')
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('全部')
  const [orderOpen, setOrderOpen] = useState(false)
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const [membershipUpgradeOpen, setMembershipUpgradeOpen] = useState(false)

  const records = useMemo(
    () =>
      RECORDS.filter((record) => tab === 'all' || record.kind === tab).filter(
        (record) => category === '全部' || record.category === category,
      ),
    [category, tab],
  )

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#F6F6F8]">
      <div className="flex min-h-full w-full flex-col px-4 pb-6 pt-[calc(var(--cc-top)+24px)] sm:px-6">
        <div className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-[20px] font-semibold leading-7 text-[#161823]">星光明细</h1>
          <p className="text-[14px] leading-5 text-[#161823]/45">
            查看星光余额、收支明细与消耗分析
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMembershipUpgradeOpen(true)}
              className="flex h-9 min-w-[112px] items-center justify-center gap-[6px] whitespace-nowrap rounded-[10px] border border-black/10 bg-white px-[10px] text-[14px] font-medium leading-5 text-[#1C1F23] transition-colors duration-150 hover:bg-black/[0.025] active:bg-black/[0.05]"
            >
              <MembershipUpgradeIcon />
              升级会员
            </button>
            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="flex h-9 min-w-[112px] items-center justify-center gap-[6px] rounded-[10px] border border-black/10 bg-white px-[10px] text-[14px] font-medium leading-5 text-[#1C1F23] transition-colors duration-150 hover:bg-black/[0.025] active:bg-black/[0.05]"
            >
              <StarlightOrderIcon />
              订单管理
            </button>
            <button
              type="button"
              onClick={() => toast('已为你联系星光客服（演示）')}
              className="flex h-9 min-w-[112px] items-center justify-center gap-[6px] whitespace-nowrap rounded-[10px] border border-black/10 bg-white px-[10px] text-[14px] font-medium leading-5 text-[#1C1F23] transition-colors duration-150 hover:bg-black/[0.025] active:bg-black/[0.05]"
            >
              <StarlightCustomerServiceIcon />
              联系客服
            </button>
          </div>
        </div>

        <section className="mt-4 flex min-h-[112px] flex-wrap items-center gap-5 rounded-[16px] border border-black/[0.08] bg-white px-7 py-5 lg:flex-nowrap lg:gap-8">
          <BalanceItem
            label="星光余额"
            value={String(STARLIGHT)}
            icon
            align="left"
            valueClassName="text-[24px]"
          />
          <span aria-hidden className="hidden text-[18px] text-[#161823]/35 sm:block">=</span>
          <BalanceItem label="充值星光" value="18000" valueClassName="text-[20px] font-medium" />
          <span aria-hidden className="hidden text-[18px] text-[#161823]/35 sm:block">+</span>
          <BalanceItem
            label="奖励星光"
            value="402"
            gapClassName="gap-[6px]"
            valueClassName="text-[20px] font-medium"
            suffix={<RewardStarlightTooltip />}
          />
          <button
            type="button"
            onClick={() => {
              setRechargeOpen(true)
            }}
            className="ml-auto h-10 shrink-0 rounded-[10px] bg-[#1C1F23] px-6 text-[14px] font-medium text-white transition-[background-color,transform] duration-150 hover:bg-black active:scale-[0.98]"
          >
            充值星光
          </button>
        </section>

        <section className="mt-5 min-h-[530px] flex-1 overflow-hidden rounded-[16px] border border-black/[0.08] bg-white px-6 pb-3 pt-5">
          <div
            role="tablist"
            aria-label="星光明细类型"
            className="mx-3 flex h-11 items-start gap-12 border-b border-[#2D426B]/[0.08]"
          >
            {DETAIL_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => {
                  setTab(item.id)
                  setCategory('全部')
                }}
                className={`relative h-11 shrink-0 text-[14px] leading-5 transition-colors duration-150 ${
                  tab === item.id
                    ? 'font-semibold text-[#1C1F23]'
                    : 'text-[#1C1F23]/60 hover:text-[#1C1F23]/75'
                }`}
              >
                {item.label}
                {tab === item.id && (
                  <motion.span
                    layoutId="starlight-detail-tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[3px] bg-[#1C1F23]"
                    transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>

          {tab === 'spend' && (
            <div className="mt-5 flex min-w-0 gap-2 overflow-x-auto pl-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORY_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  className={`h-7 shrink-0 rounded-lg border px-3 text-[12px] transition-colors duration-150 ${
                    category === item
                      ? 'border-transparent bg-[#F0F1F3] font-medium text-[#161823]'
                      : 'border-black/[0.08] bg-white text-[#161823]/50 hover:bg-black/[0.02] hover:text-[#161823]/75'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <div className={`${tab === 'spend' ? 'mt-4' : 'mt-5'} overflow-x-auto`}>
            <div className="min-w-[1090px]">
              <div className="grid grid-cols-[320px_minmax(0,1fr)_260px_260px] items-center px-3 py-2 text-[13px] leading-5 text-[#161823]/45">
                <span>时间</span>
                <span>场景</span>
                <span>类别</span>
                <span className="text-right">{tab === 'spend' ? '消耗积分' : '星光变动'}</span>
              </div>
              <motion.div className="relative">
                {records.length > 0 ? (
                  <>
                    {records.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.18,
                          delay: reduceMotion ? 0 : Math.min(index * 0.018, 0.1),
                          ease: 'linear',
                        }}
                        className="grid min-h-14 grid-cols-[320px_minmax(0,1fr)_260px_260px] items-center px-3 text-[13px] leading-5 text-[#161823]"
                      >
                        <span
                          className="tabular-nums text-[#161823]/65"
                          style={{ fontFamily: '"PingFang SC", sans-serif' }}
                        >
                          {record.time}
                        </span>
                        <span className="flex items-center font-medium">
                          {record.scene}
                          {record.kind === 'spend' && <DetailArrowIcon />}
                        </span>
                        <span className="text-[#161823]/75">{record.category}</span>
                        <span
                          className={`text-right font-medium tabular-nums ${
                            record.amount < 0 ? 'text-[#FE2C55]' : 'text-[#00A870]'
                          }`}
                        >
                          {record.amount > 0 ? '+' : ''}
                          {record.amount}
                        </span>
                      </motion.div>
                    ))}
                    <div className="flex h-10 items-center justify-center text-center text-[13px] leading-5 text-[#1C1F23]/20">
                      没有更多了
                    </div>
                  </>
                ) : (
                  <div className="flex h-[320px] flex-col items-center justify-center">
                    <StarlightEmptyIcon />
                    <span className="mt-3 text-[13px] leading-5 text-[#1C1F23]/35">暂无明细</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <StarlightOrderDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        onUpgrade={() => {
          setOrderOpen(false)
          setMembershipUpgradeOpen(true)
        }}
      />
      <StarlightRechargeDialog open={rechargeOpen} onClose={() => setRechargeOpen(false)} />
      <MembershipUpgradePanel
        open={membershipUpgradeOpen}
        onClose={() => setMembershipUpgradeOpen(false)}
      />
    </main>
  )
}
