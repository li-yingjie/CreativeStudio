import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { X } from '@/shared/icons'

type OrderTab = 'recharge' | 'membership'

const RECHARGE_ORDERS = [
  {
    id: '20260915214117-1',
    type: '充值 10000 星光',
    time: '2026/09/15 21:41:17',
    amount: '¥88',
    invoice: '开发票',
    invoiced: false,
  },
  {
    id: '20260915214117-2',
    type: '充值 1000 星光',
    time: '2026/09/15 21:41:17',
    amount: '¥9',
    invoice: '已发票',
    invoiced: true,
  },
  {
    id: '20260915214117-3',
    type: '充值 10000 星光',
    time: '2026/09/15 21:41:17',
    amount: '¥88',
    invoice: '已发票',
    invoiced: true,
  },
  {
    id: '20260915214117-4',
    type: '充值 10000 星光',
    time: '2026/09/15 21:41:17',
    amount: '¥88',
    invoice: '已发票',
    invoiced: true,
  },
] as const

export function StarlightEmptyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="51"
      height="49"
      viewBox="0 0 51 49"
      fill="none"
      aria-hidden="true"
    >
      <foreignObject x="-3.88563" y="-7.08613" width="59.3396" height="60.1639">
        <div
          style={{
            backdropFilter: 'blur(3.78px)',
            clipPath: 'url(#membership-empty-bg-blur-0)',
            height: '100%',
            width: '100%',
          }}
        />
      </foreignObject>
      <path
        data-figma-bg-blur-radius="7.55556"
        d="M43.6695 3.87389L12.386 0.50072C9.82128 0.22418 7.54676 1.81245 7.30568 4.04823L3.6913 37.5688C3.45023 39.8046 5.33389 41.8412 7.89858 42.1178L39.1821 45.4909C41.7468 45.7675 44.0213 44.1792 44.2624 41.9434L47.8767 8.42283C48.1178 6.18706 46.2342 4.15043 43.6695 3.87389Z"
        fill="url(#membership-empty-gradient-0)"
        fillOpacity="0.2"
      />
      <path
        d="M4.52734 11.0781H20.3223C21.6375 11.0782 22.8721 11.7002 23.665 12.75L25.4971 15.1787C26.4189 16.4057 27.8569 17.125 29.3896 17.125H46.4727C48.7831 17.1253 50.6562 18.9991 50.6562 21.3096V43.9658C50.6562 46.2763 48.7831 48.1501 46.4727 48.1504H4.52734C2.21695 48.1501 0.34375 46.2763 0.34375 43.9658V15.2617C0.344006 12.9515 2.21711 11.0784 4.52734 11.0781Z"
        fill="url(#membership-empty-gradient-1)"
        stroke="url(#membership-empty-gradient-2)"
        strokeWidth="0.687102"
      />
      <foreignObject x="11.0694" y="19.6339" width="23.6287" height="23.6281">
        <div
          style={{
            backdropFilter: 'blur(3.78px)',
            clipPath: 'url(#membership-empty-bg-blur-1)',
            height: '100%',
            width: '100%',
          }}
        />
      </foreignObject>
      <circle
        data-figma-bg-blur-radius="7.55556"
        cx="22.8835"
        cy="31.4479"
        r="4.25847"
        fill="url(#membership-empty-gradient-3)"
        fillOpacity="0.2"
      />
      <foreignObject x="21.4757" y="23.8937" width="19.3689" height="19.3696">
        <div
          style={{
            backdropFilter: 'blur(3.78px)',
            clipPath: 'url(#membership-empty-bg-blur-2)',
            height: '100%',
            width: '100%',
          }}
        />
      </foreignObject>
      <circle
        data-figma-bg-blur-radius="7.55556"
        cx="31.1605"
        cy="33.5785"
        r="2.12924"
        fill="url(#membership-empty-gradient-4)"
        fillOpacity="0.2"
      />
      <defs>
        <clipPath id="membership-empty-bg-blur-0" transform="translate(3.88563 7.08613)">
          <path d="M43.6695 3.87389L12.386 0.50072C9.82128 0.22418 7.54676 1.81245 7.30568 4.04823L3.6913 37.5688C3.45023 39.8046 5.33389 41.8412 7.89858 42.1178L39.1821 45.4909C41.7468 45.7675 44.0213 44.1792 44.2624 41.9434L47.8767 8.42283C48.1178 6.18706 46.2342 4.15043 43.6695 3.87389Z" />
        </clipPath>
        <clipPath id="membership-empty-bg-blur-1" transform="translate(-11.0694 -19.6339)">
          <circle cx="22.8835" cy="31.4479" r="4.25847" />
        </clipPath>
        <clipPath id="membership-empty-bg-blur-2" transform="translate(-21.4757 -23.8937)">
          <circle cx="31.1605" cy="33.5785" r="2.12924" />
        </clipPath>
        <linearGradient
          id="membership-empty-gradient-0"
          x1="6.13737"
          y1="-1.41667"
          x2="10.3874"
          y2="29.2778"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#666666" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="membership-empty-gradient-1"
          x1="-0.532324"
          y1="14.8873"
          x2="44.2711"
          y2="78.3468"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F2F2F3" />
          <stop offset="0.350715" stopColor="#FAFAFA" />
          <stop offset="1" stopColor="#E9EAEB" />
        </linearGradient>
        <linearGradient
          id="membership-empty-gradient-2"
          x1="25.5"
          y1="10.7344"
          x2="25.5"
          y2="48.4938"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#F4F4F4" />
        </linearGradient>
        <linearGradient
          id="membership-empty-gradient-3"
          x1="17.9887"
          y1="28.8823"
          x2="29.3337"
          y2="37.3354"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#666666" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="membership-empty-gradient-4"
          x1="28.7131"
          y1="32.2956"
          x2="34.3856"
          y2="36.5222"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#666666" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function StarlightOrderDialog({
  open,
  onClose,
  onUpgrade,
  layerClassName = 'z-[300]',
}: {
  open: boolean
  onClose: () => void
  onUpgrade: () => void
  layerClassName?: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const [tab, setTab] = useState<OrderTab>('recharge')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
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
          key="starlight-order-backdrop"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
          className={`fixed inset-0 flex items-center justify-center overflow-y-auto bg-[#1C1F23]/20 p-3 backdrop-blur-[16px] sm:p-6 ${layerClassName}`}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="starlight-order-title"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-[436px] max-h-[calc(100vh-24px)] w-[700px] max-w-full flex-col overflow-hidden rounded-[32px] bg-white px-6 pb-8 pt-6 text-[#1C1F23] shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:px-9 sm:pb-9 sm:pt-8"
          >
            <header className="flex h-7 shrink-0 items-center">
              <h2 id="starlight-order-title" className="text-[18px] font-semibold leading-6">
                订单管理
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="关闭订单管理弹窗"
                onClick={onClose}
                className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-150 hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-black/20"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </header>

            <div
              role="tablist"
              aria-label="订单类型"
              className="mt-[18px] flex h-11 shrink-0 items-end gap-10 border-b border-[#2D426B]/[0.08]"
            >
              {([
                ['recharge', '充值记录'],
                ['membership', '会员计划'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`relative h-11 shrink-0 text-[14px] leading-5 transition-colors duration-150 ${
                    tab === id
                      ? 'font-semibold text-[#1C1F23]'
                      : 'text-[#1C1F23]/60 hover:text-[#1C1F23]/75'
                  }`}
                >
                  {label}
                  {tab === id && (
                    <motion.span
                      layoutId="starlight-order-tab-indicator"
                      className="absolute inset-x-0 bottom-0 h-[3px] bg-[#1C1F23]"
                      transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {tab === 'recharge' ? (
              <div className="min-h-0 overflow-x-auto pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="min-w-[628px]">
                  <div className="grid grid-cols-[184px_264px_90px_90px] text-[14px] leading-5 text-[#1C1F23]/45">
                    <span>类型</span>
                    <span>时间</span>
                    <span>金额</span>
                    <span className="text-right">其他</span>
                  </div>
                  <div className="mt-2">
                    {RECHARGE_ORDERS.map((order) => (
                      <div
                        key={order.id}
                        className="grid h-12 grid-cols-[184px_264px_90px_90px] items-center text-[14px] leading-5"
                      >
                        <span className="font-medium">{order.type}</span>
                        <span
                          className="tabular-nums text-[#1C1F23]/80"
                          style={{ fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif' }}
                        >
                          {order.time}
                        </span>
                        <span className="font-semibold tabular-nums">{order.amount}</span>
                        {order.invoiced ? (
                          <span className="text-right text-[#1C1F23]/25">{order.invoice}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toast('发票申请功能即将开放（演示）')}
                            className="justify-self-end text-[#1C1F23]/65 transition-colors hover:text-[#1C1F23]"
                          >
                            {order.invoice}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex h-10 items-center justify-center text-center text-[13px] leading-5 text-[#1C1F23]/20">
                    没有更多了
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center">
                <StarlightEmptyIcon />
                <div className="mt-6 flex items-center text-[14px] leading-5">
                  <span className="text-[#1C1F23]/35">暂无会员计划</span>
                  <button
                    type="button"
                    onClick={onUpgrade}
                    className="ml-1 font-medium text-[#4E83FD] transition-colors hover:text-[#3478F6]"
                  >
                    升级会员
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
