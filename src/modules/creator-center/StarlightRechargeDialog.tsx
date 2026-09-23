import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { X } from '@/shared/icons'

interface RechargeOption {
  id: string
  amount?: number
  price?: number
  originalPrice?: number
  recommended?: boolean
  bonus?: string
}

const RECHARGE_OPTIONS: RechargeOption[] = [
  { id: '100', amount: 100, price: 1 },
  { id: '1000', amount: 1000, price: 9, originalPrice: 10, recommended: true },
  { id: '10000', amount: 10000, price: 88, originalPrice: 100 },
  { id: '30000', amount: 30000, price: 278, originalPrice: 300 },
  { id: '60000', amount: 60000, price: 528, originalPrice: 600 },
  { id: '100000', amount: 100000, price: 1688, originalPrice: 1000, bonus: '加赠16%' },
  { id: '200000', amount: 200000, price: 1288, originalPrice: 2000 },
  { id: 'custom' },
]

function isFinderModule(x: number, y: number) {
  const origins = [
    [0, 0],
    [22, 0],
    [0, 22],
  ]

  for (const [left, top] of origins) {
    if (x >= left && x < left + 7 && y >= top && y < top + 7) {
      const localX = x - left
      const localY = y - top
      return (
        localX === 0 ||
        localX === 6 ||
        localY === 0 ||
        localY === 6 ||
        (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4)
      )
    }
  }

  return null
}

const QR_PATH = Array.from({ length: 29 }, (_, y) =>
  Array.from({ length: 29 }, (_, x) => {
    const finder = isFinderModule(x, y)
    const inFinderArea =
      (x < 8 && y < 8) ||
      (x > 20 && y < 8) ||
      (x < 8 && y > 20)
    const timing = (x === 6 || y === 6) && (x + y) % 2 === 0
    const data = ((x * 17 + y * 31 + x * y * 7 + (x ^ y) * 11) % 13) < 6
    const filled = finder ?? (!inFinderArea && (timing || data))
    return filled ? `M${x} ${y}h1v1h-1z` : ''
  }).join(''),
).join('')

function StarlightMark({ size = 18 }: { size?: number }) {
  return (
    <img
      src="/icons/starlight-balance.svg"
      alt=""
      width={size}
      height={size}
      className="shrink-0"
    />
  )
}

function DouyinPayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.125" y="0.125" width="15.75" height="15.75" rx="3.875" fill="black" />
      <rect x="0.125" y="0.125" width="15.75" height="15.75" rx="3.875" stroke="black" strokeWidth="0.25" />
      <path
        d="M11.5063 4.20512C10.8888 3.81871 10.4428 3.20066 10.3036 2.48016C10.2735 2.32428 10.257 2.16405 10.257 2H8.2855L8.28209 9.57895C8.24913 10.4275 7.52077 11.1088 6.6282 11.1088C6.35095 11.1088 6.0896 11.0423 5.8595 10.9262C5.33225 10.6597 4.97091 10.1294 4.97091 9.519C4.97091 8.64262 5.71462 7.9292 6.6282 7.9292C6.79865 7.9292 6.96227 7.95645 7.11738 8.00277V6.07234C6.95716 6.05163 6.79467 6.03855 6.6282 6.03855C4.62775 6.03855 3 7.60001 3 9.51955C3 10.6973 3.6136 11.7394 4.54934 12.3694C5.13851 12.7662 5.85552 13.0005 6.62877 13.0005C8.62979 13.0005 10.2575 11.4391 10.2575 9.51955V5.67611C11.0308 6.20859 11.9779 6.52197 13.0006 6.52197V4.63078C12.45 4.63078 11.937 4.47381 11.5069 4.20458L11.5063 4.20512Z"
        fill="white"
      />
    </svg>
  )
}

function AlipayPayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.541 0H13.5a2.55 2.55 0 0 1 2.54 2.563v8.297c-.006 0-.531-.046-2.978-.813-.412-.14-.916-.327-1.479-.536q-.456-.17-.957-.353a13 13 0 0 0 1.325-3.373H8.822V4.649h3.831v-.634h-3.83V2.121H7.26c-.274 0-.274.273-.274.273v1.621H3.11v.634h3.875v1.136h-3.2v.634H9.99c-.227.789-.532 1.53-.894 2.202-2.013-.67-4.161-1.212-5.51-.878-.864.214-1.42.597-1.746.998-1.499 1.84-.424 4.633 2.741 4.633 1.872 0 3.675-1.053 5.072-2.787 2.08 1.008 6.37 2.738 6.387 2.745v.105A2.55 2.55 0 0 1 13.5 16H2.541A2.55 2.55 0 0 1 0 13.437V2.563A2.55 2.55 0 0 1 2.541 0"
        fill="#1677FF"
      />
      <path
        d="M2.309 9.27c-1.22 1.073-.49 3.034 1.978 3.034 1.434 0 2.868-.925 3.994-2.406-1.602-.789-2.959-1.353-4.425-1.207-.397.04-1.14.217-1.547.58Z"
        fill="#1677FF"
      />
    </svg>
  )
}

function WechatPayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.81911 9.92937C5.74693 9.96586 5.66549 9.98693 5.579 9.98693C5.37907 9.98693 5.20519 9.87677 5.11394 9.71411L5.07895 9.63739L3.62255 6.44172C3.60684 6.40682 3.59701 6.36767 3.59701 6.3295C3.59701 6.18215 3.7164 6.06266 3.86374 6.06266C3.92358 6.06266 3.97876 6.08244 4.0234 6.11563L5.74187 7.33912C5.86753 7.42143 6.01744 7.46956 6.17869 7.46956C6.27513 7.46956 6.36678 7.45165 6.45238 7.42043L14.5346 3.82326C13.0861 2.11593 10.7 1 7.99993 1C3.58159 1 0 3.9847 0 7.66658C0 9.67554 1.07765 11.4837 2.7642 12.7057C2.89959 12.8022 2.98807 12.9609 2.98807 13.14C2.98807 13.1992 2.97535 13.2536 2.96004 13.3099C2.82532 13.8126 2.6096 14.617 2.59955 14.6547C2.58276 14.7177 2.55641 14.7836 2.55641 14.8497C2.55641 14.9969 2.67591 15.1163 2.82326 15.1163C2.8813 15.1163 2.92843 15.0948 2.97734 15.0667L4.72872 14.0557C4.86044 13.9795 4.99993 13.9325 5.15352 13.9325C5.23525 13.9325 5.31428 13.945 5.38875 13.9678C6.20573 14.2028 7.08724 14.3334 7.99995 14.3334C12.4181 14.3334 16 11.3486 16 7.66662C16 6.55152 15.6696 5.50118 15.0888 4.57744L5.87745 9.89566L5.81911 9.92937Z"
        fill="#00C800"
      />
    </svg>
  )
}

function PaymentMethods() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] leading-4 text-[#161823]/50">
      <span className="flex shrink-0 items-center gap-[3px]">
        <DouyinPayIcon />
        <AlipayPayIcon />
        <WechatPayIcon />
      </span>
      <span className="shrink-0 whitespace-nowrap">使用抖音/支付宝/微信支付</span>
    </div>
  )
}

function QrCode() {
  return (
    <div className="flex size-[182px] items-center justify-center rounded-[12px] border border-[#E4E5E9] bg-white">
      <svg
        viewBox="0 0 29 29"
        width="152"
        height="152"
        aria-label="充值支付二维码"
        shapeRendering="crispEdges"
      >
        <rect width="29" height="29" fill="white" />
        <path d={QR_PATH} fill="#161823" />
      </svg>
    </div>
  )
}

function RechargeCard({
  option,
  selected,
  onSelect,
}: {
  option: RechargeOption
  selected: boolean
  onSelect: () => void
}) {
  const isCustom = option.id === 'custom'

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`relative flex h-[92px] min-w-0 flex-col items-center justify-center rounded-[12px] border transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.985] ${
        selected
          ? 'border-[#2D426B]/[0.12] bg-[#F2F4F7]'
          : 'border-[#2D426B]/[0.12] bg-white hover:bg-[rgba(245,247,250,0.5)]'
      }`}
    >
      {option.recommended && (
        <span
          className="absolute -top-px left-0 px-2 py-1 text-[12px] font-medium leading-4 text-white"
          style={{
            borderRadius: '12px 0',
            background: 'linear-gradient(111deg, #646464 1.79%, #000 90.65%)',
          }}
        >
          推荐
        </span>
      )}
      {option.bonus && (
        <span className="absolute right-1 top-1 rounded-full bg-[#0080FF]/[0.12] px-[7px] py-[1.5px] text-[12px] font-medium leading-4 text-[#0080FF]">
          {option.bonus}
        </span>
      )}

      <div className="relative top-[2px] flex flex-col items-center">
        {isCustom ? (
          <>
            <span className="text-[17px] font-semibold leading-6 text-[#161823]">自定义金额</span>
            <span className="mt-1 text-[12px] leading-4 text-[#161823]/35">最高100万元</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-[6px] text-[20px] font-bold leading-7 text-[#161823]">
              <StarlightMark />
              <span className="tabular-nums" style={{ fontFamily: 'Roboto, "Roboto Flex", Arial, sans-serif' }}>
                {option.amount}
              </span>
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[12px] leading-4">
              <span className="font-medium text-[#161823]">¥{option.price}</span>
              {option.originalPrice !== undefined && (
                <span className="text-[#161823]/30 line-through">¥{option.originalPrice}</span>
              )}
            </span>
          </>
        )}
      </div>
    </button>
  )
}

export default function StarlightRechargeDialog({
  open,
  onClose,
  layerClassName = 'z-[300]',
}: {
  open: boolean
  onClose: () => void
  layerClassName?: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const [selectedId, setSelectedId] = useState('60000')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const selected = useMemo(
    () => RECHARGE_OPTIONS.find((option) => option.id === selectedId) ?? RECHARGE_OPTIONS[4],
    [selectedId],
  )

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
          key="starlight-recharge-backdrop"
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
            aria-labelledby="starlight-recharge-title"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[840px] max-w-full rounded-[32px] bg-white p-5 text-[#161823] shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-7 lg:min-h-[414px] lg:p-8"
          >
            <header className="flex min-h-6 items-center gap-3">
              <h2 id="starlight-recharge-title" className="shrink-0 text-[18px] font-semibold leading-6">
                充值星光
              </h2>
              <p className="min-w-0 text-[14px] leading-5 text-[#161823]/40">平台倡导量入为出，理性消费</p>
              <div className="ml-auto hidden items-center gap-2 text-[12px] leading-5 text-[#161823]/45 sm:flex">
                <span className="text-[14px]">星光余额</span>
                <span className="flex h-7 items-center gap-1.5 rounded-full bg-[#F3F4F7] px-3 font-semibold text-[#161823]">
                  <StarlightMark size={16} />
                  <span
                    className="text-[13px] font-black tabular-nums"
                    style={{ fontFamily: '"Starlight Roboto", Roboto, "Roboto Flex", Arial, sans-serif' }}
                  >
                    18402
                  </span>
                </span>
              </div>
              <span aria-hidden className="ml-1 hidden h-4 w-px bg-[#2D426B]/[0.12] sm:block" />
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="关闭充值星光弹窗"
                onClick={onClose}
                className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full outline-none transition-colors duration-150 hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-black/20 sm:ml-0"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </header>

            <div className="mt-7 grid gap-7 lg:grid-cols-[544px_182px] lg:gap-[42px]">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {RECHARGE_OPTIONS.map((option) => (
                  <RechargeCard
                    key={option.id}
                    option={option}
                    selected={selectedId === option.id}
                    onSelect={() => setSelectedId(option.id)}
                  />
                ))}
              </div>

              <div className="relative mx-auto flex w-[182px] flex-col items-center lg:mx-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="6"
                  height="270"
                  viewBox="0 0 6 270"
                  fill="none"
                  aria-hidden
                  className="absolute -left-[22px] top-0 hidden lg:block"
                >
                  <path
                    d="M0.500626 -1.90355e-07L0.500627 127.597L4.85546 131.952L0.500621 136.306L0.500621 270"
                    stroke="url(#starlight-recharge-divider)"
                    strokeOpacity="0.12"
                  />
                  <defs>
                    <linearGradient
                      id="starlight-recharge-divider"
                      x1="1.69817"
                      y1="253.452"
                      x2="1.69703"
                      y2="-3.04836"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#2D426B" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#2D426B" stopOpacity="0.8" />
                      <stop offset="1" stopColor="#2D426B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <QrCode />
                <div className="mt-2 flex items-baseline font-semibold text-[#161823]">
                  {selected.price === undefined ? (
                    <span className="text-[20px] leading-8">待输入</span>
                  ) : (
                    <>
                      <span className="mr-1 text-[14px]">¥</span>
                      <span
                        className="text-[28px] leading-9 tabular-nums"
                        style={{ fontFamily: 'Roboto, "Roboto Flex", Arial, sans-serif' }}
                      >
                        {selected.price}
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <PaymentMethods />
                </div>
                <div className="mt-2 text-center text-[11px] leading-4 text-[#161823]/40">
                  已阅读并同意
                  <button
                    type="button"
                    onClick={() => toast('已打开《抖音星光服务协议》（演示）')}
                    className="ml-1 text-[#3478F6] hover:underline"
                  >
                    《抖音星光服务协议》
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
