import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { Check } from '@/shared/icons'
import StarlightOrderDialog from './StarlightOrderDialog'
import StarlightRechargeDialog from './StarlightRechargeDialog'

type BillingCycle = 'year' | 'quarter' | 'month'

const BILLING_CYCLES: { id: BillingCycle; label: string; discount: string }[] = [
  { id: 'year', label: '连续包年', discount: '限时5折' },
  { id: 'quarter', label: '连续包季', discount: '6.8折' },
  { id: 'month', label: '连续包月', discount: '7折' },
]

const PREMIUM_BENEFITS = [
  ['每日赠送积分 当日清零', '专属通道'],
  ['可充值更多积分', '生成 8折'],
  ['图片4.0', '2K 限时免费'],
  ['基础加速通道', null],
  ['作品去除品牌水印', null],
  ['可使用网页版和APP上全部独家AI功能', null],
  ['高阶模型', null],
  ['批量创作 更多同时生成任务数', null],
] as const

const MEMBERSHIP_PLANS = [
  {
    id: 'gold',
    name: '黄金会员',
    price: '5.99',
    accent: '#202020',
    badge: '限时5折',
    featured: false,
    banner: null,
    benefits: [
      ['每日赠送积分 当日清零', '专属通道'],
      ['可充值更多积分', '年度8折'],
      ['高清无水印导出', '不限次数'],
      ['基础商用授权', '放心使用'],
    ],
  },
  {
    id: 'platinum',
    name: '铂金会员',
    price: '11.99',
    accent: '#202020',
    badge: '限时5折',
    featured: false,
    banner: null,
    benefits: [
      ['每日赠送积分 当日清零', '专属通道'],
      ['可充值更多积分', '年度8折'],
      ['高阶模型优先体验', '优先体验'],
      ['进阶商用授权', '放心使用'],
    ],
  },
  {
    id: 'diamond',
    name: '钻石会员',
    price: '18.99',
    accent: '#0B1D4A',
    badge: '限时5折',
    featured: true,
    banner: 'Seedance 2.5 720P 低至0.42元/秒',
    benefits: PREMIUM_BENEFITS,
  },
  {
    id: 'black',
    name: '黑金会员',
    price: '99',
    accent: '#08183D',
    badge: '限时5折',
    featured: true,
    banner: 'Seedance 2.5 720P 低至0.4元/秒',
    benefits: PREMIUM_BENEFITS,
  },
] as const

const PROMO_IMAGE = '/assets/membership-upgrade-banner.jpg'

function Countdown() {
  const reduceMotion = useReducedMotion() ?? false
  const [seconds, setSeconds] = useState(45)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => (current === 0 ? 59 : current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {[
        ['01', '天'],
        ['15', '时'],
        ['38', '分'],
        [String(seconds).padStart(2, '0'), '秒'],
      ].map(([value, unit]) => (
        <div
          key={unit}
          className="flex h-[58px] w-[50px] flex-col items-center justify-center rounded-[16px] bg-white/80 text-[#161823] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-sm sm:h-[72px] sm:w-[64px]"
        >
          {unit === '秒' ? (
            <span className="relative block h-7 w-full overflow-hidden sm:h-8" aria-live="polite">
              <motion.span
                key={value}
                initial={reduceMotion ? false : { y: 8, opacity: 0.35 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center text-[22px] font-semibold leading-7 tabular-nums sm:text-[28px] sm:leading-8"
              >
                {value}
              </motion.span>
            </span>
          ) : (
            <span className="text-[22px] font-semibold leading-7 tabular-nums sm:text-[28px] sm:leading-8">
              {value}
            </span>
          )}
          <span className="mt-1 text-[10px] leading-3 text-[#161823]/55">{unit}</span>
        </div>
      ))}
    </div>
  )
}

function MembershipCard({
  plan,
}: {
  plan: (typeof MEMBERSHIP_PLANS)[number]
}) {
  const featuredBorder = plan.id === 'black' ? 'border-[#0B1D4A]' : 'border-[#1683FF]'

  return (
    <article
      className="relative flex min-h-[430px] flex-col xl:min-h-[580px]"
    >
      {plan.banner && (
        <div
          className="absolute -top-10 left-0 right-0 flex h-[400px] items-start justify-center rounded-[32px] bg-[linear-gradient(117deg,#0084FF_-1.69%,#296EFF_70.84%)] px-4 pt-3 text-center text-[12px] font-medium leading-4 text-white"
          style={
            plan.id === 'black'
              ? {
                  borderRadius: '34px',
                  background:
                    'linear-gradient(135deg, rgba(41, 110, 255, 0.30) -11.56%, rgba(41, 110, 255, 0.10) 31.56%, rgba(41, 110, 255, 0.60) 63.75%), #000',
                }
              : undefined
          }
        >
          {plan.banner}
        </div>
      )}
      <div
        className={`relative z-[1] flex flex-1 flex-col overflow-hidden rounded-[32px] bg-[#F9F9F9] ${
          plan.featured ? `border-2 ${featuredBorder} p-5` : 'border border-black/[0.06] p-5'
        }`}
      >
        <div className="flex items-center">
          <h3 className="text-[16px] font-semibold leading-6 text-[#161823]">{plan.name}</h3>
          <span className="ml-auto rounded-[6px] bg-[#0080FF]/[0.08] px-1.5 py-0.5 text-[12px] font-medium leading-[17px] text-[#0080FF]">
            {plan.badge}
          </span>
        </div>

        <div className="mt-4 flex items-end text-[#161823]">
          <span className="mb-1 mr-1 text-[14px] font-semibold leading-5">¥</span>
          <span className="text-[34px] font-semibold leading-9 tabular-nums">{plan.price}</span>
          <span className="mb-0.5 ml-2 text-[11px] leading-5 text-[#161823]/45">
            每年&nbsp; ¥659
          </span>
        </div>
        <p className="mt-2 min-h-8 text-[11px] leading-4 text-[#161823]/45">
          首年6折¥393 · 次年续费金额¥659 · 包年可随时取消
        </p>

        <div className="mt-4 rounded-[12px] bg-[#ECECEE] px-4 py-3">
          <div className="text-[13px] font-semibold leading-5 text-[#161823]">660 星光每月</div>
          <div className="mt-0.5 text-[11px] leading-4 text-[#161823]/40">221星光 = ¥10</div>
        </div>

        <button
          type="button"
          onClick={() => toast(`已选择${plan.name}（演示）`)}
          className="mt-4 h-10 w-full rounded-[16px] text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          style={
            plan.featured
              ? {
                  background:
                    'linear-gradient(245deg, rgba(41, 110, 255, 0.24) 44.08%, rgba(41, 110, 255, 0.08) 72.24%, rgba(41, 110, 255, 0.48) 93.27%), #000',
                  boxShadow:
                    '0 0 1px 0 rgba(0, 0, 0, 0.16), 0 2px 4px 0 rgba(0, 0, 0, 0.14)',
                }
              : { backgroundColor: plan.accent }
          }
        >
          ¥393 首年6折
        </button>

        <div className="mt-5 space-y-3">
          {plan.benefits.map(([label, tag]) => (
            <div
              key={label}
              className="flex min-w-0 items-center px-2 text-[12px] leading-4"
            >
              <Check size={15} strokeWidth={2} className="mr-2 shrink-0 text-[#161823]" />
              <span className="min-w-0 truncate text-[#161823]/75">{label}</span>
              {tag && (
                <span className="ml-auto shrink-0 rounded bg-[#ECECEF] px-1.5 py-0.5 text-[9px] font-medium text-[#1C1F23]">
                  {tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function MembershipUpgradePanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion() ?? false
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('year')
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const rechargeOpenRef = useRef(false)
  const orderOpenRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !rechargeOpenRef.current && !orderOpenRef.current) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
      returnFocusRef.current?.focus()
    }
  }, [onClose, open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="membership-upgrade-backdrop"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
          className="fixed inset-0 z-[310] flex items-end bg-[#1C1F23]/30 backdrop-blur-[16px]"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="membership-upgrade-title"
            initial={reduceMotion ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: reduceMotion ? 0 : 0.46, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[calc(100vh-48px)] min-h-[560px] w-full overflow-y-auto rounded-t-[32px] bg-white text-[#161823] shadow-[0_-20px_70px_rgba(0,0,0,0.14)]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="关闭会员升级面板"
              onClick={onClose}
              className="fixed right-5 top-[68px] z-10 flex size-9 items-center justify-center rounded-full bg-[#F1F2F4] text-[#161823]/75 outline-none transition-colors hover:bg-[#E8E9EC] focus-visible:ring-2 focus-visible:ring-black/20 sm:right-8 sm:top-[72px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.41009 4.4107C4.73553 4.08527 5.26317 4.08527 5.5886 4.4107L9.99935 8.82145L14.4101 4.4107C14.7355 4.08527 15.2632 4.08527 15.5886 4.4107C15.914 4.73614 15.914 5.26378 15.5886 5.58922L11.1779 9.99996L15.5886 14.4107C15.914 14.7361 15.914 15.2638 15.5886 15.5892C15.2632 15.9147 14.7355 15.9147 14.4101 15.5892L9.99935 11.1785L5.5886 15.5892C5.26317 15.9147 4.73553 15.9147 4.41009 15.5892C4.08466 15.2638 4.08466 14.7361 4.41009 14.4107L8.82084 9.99996L4.41009 5.58922C4.08466 5.26378 4.08466 4.73614 4.41009 4.4107Z"
                  fill="black"
                />
              </svg>
            </button>

            <div className="mx-auto w-full max-w-[1384px] px-4 pb-12 pt-4 sm:px-8 sm:pt-6">
              <div
                className="relative mx-auto flex min-h-[146px] max-w-[1000px] items-center overflow-hidden rounded-[20px] bg-[#DDEBFF] bg-cover bg-center px-6 py-6 sm:min-h-[170px] sm:px-8"
                style={{ backgroundImage: `url("${PROMO_IMAGE}")` }}
              >
                <div className="relative z-[1] flex w-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-[94px] items-center justify-center rounded-[8px] bg-white/80 text-[12px] font-medium text-[#1C1F23]">
                        Seedance 2.5
                      </span>
                      <span className="flex h-6 w-[52px] items-center justify-center rounded-[8px] bg-white/80 text-[12px] font-medium text-[#1C1F23]">
                        超值价
                      </span>
                    </div>
                    <p className="mt-3 text-[20px] font-semibold leading-7 sm:text-[24px] sm:leading-8">
                      Seedance 2.5 720P 低至0.4元/秒
                    </p>
                    <p className="mt-1 text-[20px] font-semibold leading-7 text-[#3478F6] sm:text-[24px] sm:leading-8">
                      会员低至5折 + 积分消耗4.7折起
                    </p>
                  </div>
                  <Countdown />
                </div>
              </div>

              <div className="mt-9 text-center sm:mt-11">
                <h2 id="membership-upgrade-title" className="text-[22px] font-semibold leading-8">
                  选择合适的会员，助力创作提升
                </h2>
                <p className="mt-2 text-[12px] leading-5 text-[#161823]/40">
                  选择合适的会员，或直接
                  <button
                    type="button"
                    onClick={() => {
                      rechargeOpenRef.current = true
                      setRechargeOpen(true)
                    }}
                    className="mx-1 font-medium text-[#1C1F23]/75 hover:text-[#1C1F23]"
                  >
                    充值星光
                  </button>
                  ｜
                  <button
                    type="button"
                    onClick={() => {
                      orderOpenRef.current = true
                      setOrderOpen(true)
                    }}
                    className="ml-1 font-medium text-[#1C1F23]/75 hover:text-[#1C1F23]"
                  >
                    订单管理
                  </button>
                </p>
              </div>

              <div
                role="tablist"
                aria-label="会员订阅周期"
                className="mx-auto mt-7 grid h-10 max-w-[500px] grid-cols-3 rounded-[10px] bg-[#F4F5F7] p-1"
              >
                {BILLING_CYCLES.map((cycle) => (
                  <button
                    key={cycle.id}
                    type="button"
                    role="tab"
                    aria-selected={billingCycle === cycle.id}
                    onClick={() => setBillingCycle(cycle.id)}
                    className={`flex min-w-0 items-center justify-center gap-1 rounded-[7px] px-2 text-[12px] transition-all duration-180 ${
                      billingCycle === cycle.id
                        ? 'bg-white font-medium text-[#161823] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                        : 'text-[#161823]/45 hover:text-[#161823]/70'
                    }`}
                  >
                    <span className="truncate font-medium">{cycle.label}</span>
                    <span className="shrink-0 font-medium text-[#0080FF]">{cycle.discount}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 items-stretch gap-x-4 gap-y-14 pt-10 sm:grid-cols-2 xl:grid-cols-4 xl:gap-y-4">
                {MEMBERSHIP_PLANS.map((plan) => (
                  <MembershipCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
      <StarlightRechargeDialog
        open={open && rechargeOpen}
        onClose={() => {
          rechargeOpenRef.current = false
          setRechargeOpen(false)
        }}
        layerClassName="z-[320]"
      />
      <StarlightOrderDialog
        open={open && orderOpen}
        onClose={() => {
          orderOpenRef.current = false
          setOrderOpen(false)
        }}
        onUpgrade={() => {
          orderOpenRef.current = false
          setOrderOpen(false)
        }}
        layerClassName="z-[320]"
      />
    </AnimatePresence>,
    document.body,
  )
}
