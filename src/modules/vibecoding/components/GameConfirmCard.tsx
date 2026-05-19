import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

/**
 * 游戏生成 — 用户确认卡
 *
 * 在正式跑生成流之前，先让用户对 AI 解析出来的几项关键选择做确认 /
 * 调整（玩法、美术、难度、可选模块）。点击「开始生成」才会驱动
 * gameStep 从 confirming → analyzing。
 */

interface OptionItem {
  id: string
  label: string
  hint?: string
}

interface SingleGroup {
  key: 'genre' | 'art' | 'difficulty'
  title: string
  options: OptionItem[]
}

const SINGLE_GROUPS: SingleGroup[] = [
  {
    key: 'genre',
    title: '玩法风格',
    options: [
      { id: 'shmup', label: '竖版弹幕', hint: '推荐' },
      { id: 'side', label: '横版射击' },
      { id: 'pinball', label: '弹球类' },
    ],
  },
  {
    key: 'art',
    title: '美术风格',
    options: [
      { id: 'scifi', label: '写实科幻', hint: '推荐' },
      { id: 'pixel', label: '像素风' },
      { id: 'cartoon', label: '卡通' },
    ],
  },
  {
    key: 'difficulty',
    title: '难度曲线',
    options: [
      { id: 'casual', label: '休闲' },
      { id: 'standard', label: '标准', hint: '推荐' },
      { id: 'hardcore', label: '硬核' },
    ],
  },
]

const MULTI_MODULES: OptionItem[] = [
  { id: 'roguelike', label: 'Roguelike 流派', hint: '推荐' },
  { id: 'leaderboard', label: '排行榜' },
  { id: 'coop', label: '多人合作' },
  { id: 'iap', label: '内购' },
]

const DEFAULT_SINGLE: Record<SingleGroup['key'], string> = {
  genre: 'shmup',
  art: 'scifi',
  difficulty: 'standard',
}

const DEFAULT_MULTI = new Set(['roguelike', 'leaderboard'])

export interface GameSpecDraft {
  genre: string
  art: string
  difficulty: string
  modules: string[]
  /** Pretty labels resolved by name, in the same order as the
   *  selection groups — used by the user-echo bubble. */
  labels: {
    genre: string
    art: string
    difficulty: string
    modules: string[]
  }
}

interface Props {
  /** Disabled / locked state — once the user confirms we lock the
   *  selections so they can't be flipped mid-build. */
  locked?: boolean
  /** Called when the user clicks 开始生成. Receives the resolved spec
   *  draft so the host can echo it back as a user message. */
  onConfirm: (spec: GameSpecDraft) => void
}

export default function GameConfirmCard({ locked = false, onConfirm }: Props) {
  const [singles, setSingles] = useState<Record<SingleGroup['key'], string>>(DEFAULT_SINGLE)
  const [multi, setMulti] = useState<Set<string>>(new Set(DEFAULT_MULTI))

  const buildSpec = (): GameSpecDraft => {
    const labelFor = (key: SingleGroup['key']) =>
      SINGLE_GROUPS.find((g) => g.key === key)?.options.find((o) => o.id === singles[key])?.label ?? ''
    const moduleLabels = MULTI_MODULES.filter((m) => multi.has(m.id)).map((m) => m.label)
    return {
      genre: singles.genre,
      art: singles.art,
      difficulty: singles.difficulty,
      modules: Array.from(multi),
      labels: {
        genre: labelFor('genre'),
        art: labelFor('art'),
        difficulty: labelFor('difficulty'),
        modules: moduleLabels,
      },
    }
  }

  const toggleMulti = (id: string) =>
    setMulti((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      <div className="border-b border-[var(--divider-soft)] px-3.5 py-2.5">
        <div className="text-[13px] font-semibold text-[var(--color-ink)]">
          确认生成方案
        </div>
        <div className="mt-0.5 text-[11.5px] text-[var(--color-ink)]/55">
          已根据你的描述预选一套配置，可调整后再开始生成
        </div>
      </div>

      <div className="space-y-3 p-3.5">
        {SINGLE_GROUPS.map((g) => (
          <div key={g.key}>
            <div className="mb-1.5 text-[11.5px] text-[var(--color-ink)]/55">
              {g.title}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.options.map((opt) => {
                const on = singles[g.key] === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      setSingles((s) => ({ ...s, [g.key]: opt.id }))
                    }
                    className={`flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[12px] transition-colors ${
                      on
                        ? 'border-[var(--color-ink)]/15 bg-[var(--fill-subtle)] text-[var(--color-ink)]/90'
                        : 'border-[var(--divider-soft)] text-[var(--color-ink)]/65 hover:border-[var(--color-ink)]/15 hover:text-[var(--color-ink)]/85'
                    } ${locked ? 'opacity-70' : ''}`}
                  >
                    {opt.label}
                    {opt.hint && (
                      <span className="rounded-sm bg-[var(--color-ink)]/[0.06] px-1 py-px text-[9.5px] font-medium text-[var(--color-ink)]/55">
                        {opt.hint}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div>
          <div className="mb-1.5 text-[11.5px] text-[var(--color-ink)]/55">
            可选模块 · 多选
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MULTI_MODULES.map((opt) => {
              const on = multi.has(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={locked}
                  onClick={() => toggleMulti(opt.id)}
                  className={`flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[12px] transition-colors ${
                    on
                      ? 'border-[var(--color-ink)]/15 bg-[var(--fill-subtle)] text-[var(--color-ink)]/90'
                      : 'border-[var(--divider-soft)] text-[var(--color-ink)]/65 hover:border-[var(--color-ink)]/15 hover:text-[var(--color-ink)]/85'
                  } ${locked ? 'opacity-70' : ''}`}
                >
                  {on && (
                    <Check
                      size={11}
                      strokeWidth={2.4}
                      className="text-[var(--color-ink)]/55"
                    />
                  )}
                  {opt.label}
                  {opt.hint && (
                    <span className="rounded-sm bg-[var(--color-ink)]/[0.06] px-1 py-px text-[9.5px] font-medium text-[var(--color-ink)]/55">
                      {opt.hint}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--divider-soft)] bg-[var(--fill-subtle)] px-3.5 py-2.5">
        <span className="text-[11px] text-[var(--color-ink)]/45">
          {locked ? '已确认 · 生成中…' : '调整完成后即可开始生成'}
        </span>
        <button
          type="button"
          disabled={locked}
          onClick={() => onConfirm(buildSpec())}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-opacity ${
            locked
              ? 'cursor-default bg-[var(--color-ink)]/40 text-[var(--color-ink-contrast)]'
              : 'bg-[var(--color-ink)] text-[var(--color-ink-contrast)] hover:opacity-90'
          }`}
        >
          {locked ? '已确认' : '开始生成'}
          {!locked && <ArrowRight size={12} strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  )
}
