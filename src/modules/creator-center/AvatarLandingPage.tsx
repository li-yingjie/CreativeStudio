import { motion } from 'framer-motion'

/* ─── AI 分身落地页（Figma 891-22823）───
 * ASCII 世界地图纹理打底，3D 分身主视觉 + 彩色光斑，账号开通卡与
 * 两张应用场景卡（AI 聊天 / 互动空间）。图片素材取自设计稿。 */

const ASSETS = '/icons/creator-center'

function FeatureCard({ thumb, title, desc }: { thumb: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-[#F7F8FA]/80 p-2 backdrop-blur-sm transition-transform hover:-translate-y-0.5">
      <img src={thumb} alt="" className="h-[125px] w-[125px] shrink-0 rounded-xl bg-white object-cover shadow-[0_2px_8px_rgba(0,0,0,0.05)]" />
      <div className="min-w-0 pr-4">
        <h3 className="text-[15px] font-semibold text-[#252632]">{title}</h3>
        <p className="mt-2 text-[13px] leading-5 text-[#252632]/55">{desc}</p>
      </div>
    </div>
  )
}

export default function AvatarLandingPage({
  onActivate,
}: {
  /** 点击「去开通」— 外壳切换到分身版工坊界面。 */
  onActivate?: () => void
}) {
  return (
    <main className="relative h-full overflow-y-auto bg-white">
      {/* ASCII 世界地图纹理 */}
      <img
        src={`${ASSETS}/ascii-map.png`}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />

      <div className="relative mx-auto max-w-[760px] px-6 pb-16">
        {/* 主视觉：彩色光斑 + 3D 分身 */}
        <div className="relative flex flex-col items-center pt-5">
          <div className="relative h-[300px] w-full max-w-[560px]">
            {/* 光斑（设计稿中的青/绿渐变团） */}
            <div aria-hidden className="absolute left-[6%] top-[38%] h-[150px] w-[190px] rounded-full bg-[#7FD8E8]/70 blur-[46px]" />
            <div aria-hidden className="absolute right-[8%] top-[30%] h-[140px] w-[170px] rounded-full bg-[#D8EBA5]/70 blur-[48px]" />
            <div aria-hidden className="absolute left-[24%] top-[62%] h-[90px] w-[130px] rounded-full bg-[#BFE8F2]/60 blur-[40px]" />
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              src={`${ASSETS}/avatar-hero.png`}
              alt="AI 分身"
              // multiply：素材白底烘死在像素里（alpha 全 255），正片叠底让白色
              // 视同透明、露出纹理与光斑；头像灰阶保留
              className="absolute inset-x-0 top-0 mx-auto h-full object-contain mix-blend-multiply"
            />
            {/* 头像下的柔和投影 */}
            <div aria-hidden className="absolute inset-x-[18%] bottom-[-8px] h-[26px] rounded-[50%] bg-black/[0.06] blur-[10px]" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="mt-2 text-center"
          >
            <h1 className="text-[28px] font-bold leading-9 text-[#161823]">创所未见 · AI分身</h1>
            <p className="mt-2 text-[14px] text-[#252632]/55">所见即所得，链接抖音生态</p>
          </motion.div>
        </div>

        {/* 账号开通卡 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18, ease: 'easeOut' }}
          className="mt-9 rounded-2xl border border-black/5 bg-white/90 p-5 shadow-[0_10px_36px_rgba(0,0,0,0.06)] backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <img src={`${ASSETS}/ailee-avatar.png`} alt="Ailee" className="h-12 w-12 rounded-full object-cover ring-1 ring-black/5" />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-[#252632]">Ailee</div>
              <div className="mt-0.5 text-[12px] text-[#252632]/50">12.8w 粉丝 · 86 个作品</div>
            </div>
            <button
              type="button"
              onClick={() => onActivate?.()}
              className="rounded-xl bg-[#161823] px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#161823]/90"
            >
              去开通
            </button>
          </div>
          <div className="mt-5 border-t border-black/5 pt-4">
            <div className="flex items-center gap-2">
              <img src="/icons/AI.svg" alt="" className="h-4 w-4" />
              <h2 className="text-[15px] font-semibold text-[#252632]">从你的账号生成初始分身</h2>
            </div>
            <p className="mt-2 text-[13px] text-[#252632]/55">
              我们会分析你的视频与风格，自动搭好人设、语气、音色与知识技能
            </p>
          </div>
        </motion.section>

        {/* 应用场景 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.26, ease: 'easeOut' }}
          className="mt-4 grid grid-cols-2 gap-3"
        >
          <FeatureCard
            thumb={`${ASSETS}/avatar-feature-chat.png`}
            title="AI 聊天"
            desc="1 对 1 陪粉丝聊天、答疑互动，私信与聊天窗随时在线。"
          />
          <FeatureCard
            thumb={`${ASSETS}/avatar-feature-space.png`}
            title="互动空间"
            desc="分身开播互动；按评论自动播放对应视频切片，边看边聊。"
          />
        </motion.div>
      </div>
    </main>
  )
}
