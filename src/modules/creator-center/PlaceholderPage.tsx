import { motion } from 'framer-motion'
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
  return (
    <div className="flex h-full items-center justify-center bg-[#F5F6F8]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4 rounded-3xl bg-white px-16 py-12 shadow-[0_10px_40px_rgba(0,0,0,0.06)]"
      >
        {entry && <img src={entry.img} alt="" className="h-20 w-[72px] object-contain" />}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-[18px] font-semibold text-[#252632]">{entry?.label}</h2>
            <span className="rounded-full bg-[#EDF3FF] px-2 py-0.5 text-[11px] text-[#4E83FD]">即将上线</span>
          </div>
          <p className="mt-1.5 text-[13px] text-[#252632]/50">{entry?.desc}，敬请期待</p>
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
