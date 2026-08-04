import { LayoutGrid } from '@/shared/icons'
import { activityScreens } from './XiahuaH5Preview'
import type { ActivityPreset } from './ActivityPreset'

/* ─── 页面框架面板（右侧产物栏的「页面框架」态） ───
 * 这一步左边是灰框，看不出「一共要做几个页面、每个页面装什么」。列在这儿，
 * 顺便让右侧那条产物栏在框架阶段也在 —— 栏时有时无，预览会跟着左右跳。 */

/** 每个画板里装了什么 —— 与 XIAHUA_EDIT_TARGETS / SCREEN_TARGETS 的分组对应。 */
const CONTENT: Record<string, string[]> = {
  main: ['头图 KV + 标题', '抽卡主按钮 + 两侧入口', '集卡面板：进度 / 档位 / 卡槽', '任务区 · 话题区 · 运营位'],
  result: ['开卡标题', '开卡大卡 + 新卡角标', '收下按钮'],
  cards: ['卡册页签', '3×3 卡格（三态）', '交换记录入口'],
  redeem: ['集齐提示', '奖励图 + 文案', '收下按钮'],
  rules: ['规则弹窗', '正文（可滚动）', '我知道了'],
}

export default function XiahuaFramePanel({ preset }: { preset: ActivityPreset }) {
  const screens = activityScreens(preset)
  return (
    <div className="thin-scroll h-full w-full overflow-y-auto px-4 py-4">
      <div className="mb-3">
        <h2 className="flex items-center gap-1.5 text-[14px] font-semibold leading-[20px] text-[var(--color-ink)]">
          <LayoutGrid className="size-4 text-violet-500" />
          页面框架
        </h2>
        <p className="mt-0.5 text-[11px] leading-[16px] text-[var(--color-ink)]/50">
          {screens.length} 个页面 · 只有版式与热区，视觉后面才出。左边可以直接点和拖
        </p>
      </div>
      <ol className="space-y-2">
        {screens.map((s, i) => (
          <li key={s.id} className="rounded-[10px] border border-[var(--divider-soft)] p-2.5">
            <div className="flex items-center gap-1.5">
              <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-ink)]/[0.06] text-[10px] font-medium tabular-nums text-[var(--color-ink)]/50">
                {i + 1}
              </span>
              <span className="text-[13px] font-medium text-[var(--color-ink)]">{s.label}</span>
              <span className="ml-auto truncate text-[11px] text-[var(--color-ink)]/40">
                {s.desc}
              </span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {(CONTENT[s.id] ?? []).map((t) => (
                <li
                  key={t}
                  className="flex gap-1.5 text-[11px] leading-[16px] text-[var(--color-ink)]/55"
                >
                  <span className="mt-[5px] size-1 shrink-0 rounded-full bg-[var(--color-ink)]/20" />
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-3 rounded-[8px] bg-[var(--color-ink)]/[0.03] px-2.5 py-2 text-[11px] leading-[17px] text-[var(--color-ink)]/50">
        结构上要动的现在说最省事 —— 素材还没生成，改了不用重做。
      </p>
    </div>
  )
}
