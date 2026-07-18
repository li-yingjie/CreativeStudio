import { motion, useReducedMotion } from 'framer-motion'
import { SMART_CREATE_ENTRIES, type ProductId } from './data'

/** AI分身 / 百科 / 随变 的占位页 — 各自的完整产品后续按设计稿接入。 */
export default function PlaceholderPage({
  product,
  onBackHome,
}: {
  product: ProductId
  onBackHome: () => void
}) {
  const entry = SMART_CREATE_ENTRIES.find((e) => e.id === product)
  const reduceMotion = useReducedMotion()
  return (
    <div className="flex h-full items-center justify-center bg-[#F5F6F8]">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        className="flex w-[400px] flex-col items-center gap-4 rounded-3xl bg-white px-12 py-12 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
      >
        {/* 统一的图标容器：不论产品图是插画还是照片，都用同一个圆角
            浅底框规范，让百科/随变等占位页视觉调性一致。 */}
        {entry && (
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-b from-[#F7F8FA] to-white ring-1 ring-black/5">
            <img src={entry.front} alt="" className="h-[68px] w-[68px] object-contain" />
          </div>
        )}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-balance text-[18px] font-semibold text-[#252632]">{entry?.label}</h2>
            <span className="rounded-full bg-[#EDF3FF] px-2 py-0.5 text-[11px] text-[#4E83FD]">即将上线</span>
          </div>
          <p className="mt-1.5 text-pretty text-[13px] text-[#252632]/60">{entry?.desc}，敬请期待</p>
        </div>
        <button
          type="button"
          onClick={onBackHome}
          className="mt-2 rounded-full bg-[#161823] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#161823]/90"
        >
          返回首页
        </button>
      </motion.div>
    </div>
  )
}
