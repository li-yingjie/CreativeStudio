import { Menu, Search } from '@/shared/icons'
import PhoneStatusBar from '@/modules/editor/components/preview/PhoneStatusBar'

/**
 * 小程序「Feed 卡」预览 — 模拟小程序内容以「抖音信息流卡片」形态出现在
 * 抖音 App 推荐页里的样子。视觉对齐产品给的参考示意：星空底 + 顶部抖音
 * 导航 + 运势卡（今日建议 / 评分柱 / 今日宜忌）+ 底部「不感兴趣 / 查看
 * 详解」+ 抖音底部 Tab。纯展示，无交互逻辑。
 */

const TOP_NAV = ['经验', '同城', '关注', '商城', '推荐'] as const

const SCORES = [
  { label: '爱情', value: 92 },
  { label: '事业', value: 78 },
  { label: '财富', value: 85 },
  { label: '学习', value: 88 },
  { label: '人际', value: 90 },
] as const

export default function XiaohuaFeedPreview() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden text-white">
      {/* 星空 / 星云背景 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 70% 30%, #3a2a4d 0%, #1c1630 38%, #0c0a18 72%, #07060f 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 18% 12%, #fff 50%, transparent), radial-gradient(1px 1px at 32% 26%, #fff 50%, transparent), radial-gradient(1px 1px at 64% 9%, #ffe9c2 50%, transparent), radial-gradient(1px 1px at 82% 20%, #fff 50%, transparent), radial-gradient(1px 1px at 47% 16%, #fff 50%, transparent), radial-gradient(1px 1px at 8% 30%, #fff 50%, transparent), radial-gradient(1.5px 1.5px at 73% 33%, #ffd9a0 50%, transparent), radial-gradient(1px 1px at 90% 38%, #fff 50%, transparent)',
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <PhoneStatusBar />

        {/* 顶部抖音导航 */}
        <div className="flex shrink-0 items-center gap-2.5 px-3 pt-1.5 pb-1 text-[11px]">
          <Menu size={14} className="shrink-0 text-white/85" />
          {TOP_NAV.map((t) => {
            const active = t === '推荐'
            return (
              <span
                key={t}
                className={`relative ${active ? 'font-semibold text-white' : 'text-white/55'}`}
              >
                {t}
                {active && (
                  <span className="absolute -bottom-[3px] left-1/2 h-[2px] w-3.5 -translate-x-1/2 rounded-full bg-[#e8c089]" />
                )}
              </span>
            )
          })}
          <Search size={14} className="ml-auto shrink-0 text-white/85" />
        </div>

        {/* 内容滚动区 */}
        <div className="thin-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pt-3 pb-2">
          {/* 标题 */}
          <div className="flex items-start justify-between">
            <h1
              className="text-[22px] font-semibold leading-tight"
              style={{
                background: 'linear-gradient(100deg, #f6e6c8, #e2b277 55%, #caa06a)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              天秤座·今日运势
            </h1>
            <span className="mt-1.5 shrink-0 rounded-full border border-white/15 px-1.5 py-0.5 text-[8.5px] text-white/45">
              AI生成
            </span>
          </div>

          {/* 今日建议卡 */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
            <div className="mb-1.5 text-[12px] font-medium text-[#e8c089]">今日建议</div>
            <p className="line-clamp-3 text-[11px] leading-[1.7] text-white/80">
              <span className="text-[#e8c089]">✦ </span>
              有一点焦虑，但大事可以稳步推。月亮过境双子，脑子转得快但容易想岔。如果你有重要计划，今天适合先做调研再决定，找信任的人先…
            </p>
            {/* 评分柱 */}
            <div className="mt-3 flex items-end justify-between">
              {SCORES.map((s, i) => {
                const silver = i % 2 === 1
                return (
                  <div key={s.label} className="flex w-9 flex-col items-center">
                    <span className="mb-1 text-[11px] font-semibold tabular-nums text-white/90">
                      {s.value}
                    </span>
                    <div
                      className="w-[14px] rounded-full"
                      style={{
                        height: `${20 + (s.value / 100) * 32}px`,
                        background: silver
                          ? 'linear-gradient(180deg,#eef0f4,#aab0bb)'
                          : 'linear-gradient(180deg,#f6e2c2,#c08a55)',
                      }}
                    />
                    <span className="mt-1.5 text-[10px] text-white/55">{s.label}</span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 今日宜忌卡 */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
            <div className="mb-2 text-[12px] font-medium text-[#e8c089]">今日宜忌</div>
            <div className="flex flex-col gap-2.5">
              <YiJiRow
                glyph="宜"
                tone="good"
                text="今天适合约看、约谈、约比价 —— 行动力强的一天，别浪费在纠结上"
              />
              <YiJiRow
                glyph="忌"
                tone="bad"
                text="任何需要转账或签名的事今天只做调研不做决定。优惠截止今天大概率是套路"
              />
            </div>
          </section>

          {/* 分隔线 */}
          <div className="mx-auto my-0.5 h-[3px] w-12 rounded-full bg-white/25" />

          {/* 操作按钮 */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="h-9 flex-1 rounded-xl border border-white/15 bg-white/[0.04] text-[12px] text-white/75"
            >
              不感兴趣
            </button>
            <button
              type="button"
              className="h-9 flex-[1.4] rounded-xl bg-white/[0.16] text-[12px] font-medium text-white"
            >
              查看运势详解
            </button>
          </div>

          <div className="pt-0.5 text-center text-[10px] text-white/40">
            ︿ 上滑继续看视频
          </div>
        </div>

        {/* 抖音底部 Tab */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-5 py-2 text-[11px]">
          <span className="font-semibold text-white">首页</span>
          <span className="text-white/55">朋友</span>
          <span className="flex h-6 w-9 items-center justify-center rounded-lg border border-white/70 text-[15px] font-light leading-none text-white">
            +
          </span>
          <span className="text-white/55">消息</span>
          <span className="text-white/55">我</span>
        </div>
      </div>
    </div>
  )
}

function YiJiRow({
  glyph,
  tone,
  text,
}: {
  glyph: string
  tone: 'good' | 'bad'
  text: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-medium ${
          tone === 'good'
            ? 'bg-[#e8c089]/15 text-[#e8c089]'
            : 'bg-white/10 text-white/70'
        }`}
      >
        {glyph}
      </span>
      <p className="pt-0.5 text-[11px] leading-[1.6] text-white/75">{text}</p>
    </div>
  )
}
