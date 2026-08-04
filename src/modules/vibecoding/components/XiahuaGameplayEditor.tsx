import { useState } from 'react'
import { Image as ImageIcon, Plus, Trash2 } from '@/shared/icons'
import { cardArt, type ActivityPreset } from './ActivityPreset'
import {
  GAMEPLAY_LABEL,
  type XiahuaGameplay,
  type XiahuaTaskDef,
  type XiahuaTierDef,
} from './XiahuaGameplay'

/* ─── 玩法编辑器 ───
 * 同一份编辑逻辑供两处复用：编辑面板选中元素后的「玩法」页签（section 指定
 * 只显示对应那段），以及项目目录里的「活动玩法配置」整页（section 省略）。 */

const INPUT =
  'w-full rounded-[8px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] px-2.5 py-1.5 text-[13px] text-[var(--color-ink)] outline-none focus:border-sky-400'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-[var(--color-ink)]/45">{label}</span>
      {children}
    </label>
  )
}

function Group({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5 border-b border-[var(--divider-soft)] px-4 py-3.5 last:border-b-0">
      <div>
        <p className="text-[12px] font-semibold text-[var(--color-ink)]/70">{title}</p>
        {desc && <p className="mt-0.5 text-[11px] text-[var(--color-ink)]/40">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function IconBtn({
  label,
  onClick,
  tone = 'ink',
}: {
  label: string
  onClick: () => void
  tone?: 'ink' | 'danger'
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[6px] transition-colors ${
        tone === 'danger'
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-[var(--color-ink)]/45 hover:bg-[var(--fill-hover)]'
      }`}
      onClick={onClick}
    >
      {tone === 'danger' ? <Trash2 className="size-3.5" /> : <Plus className="size-3.5" />}
    </button>
  )
}

/** 卡池行尾的卡面缩略图。素材没出（或这一版没这张）时是空槽 —— 玩法配置
 *  要能看出「这张卡长什么样」，缺图本身也是信息。 */
function CardArtSlot({
  preset,
  id,
  name,
}: {
  preset?: ActivityPreset
  id: string
  name: string
}) {
  const src = preset ? cardArt(preset, id).img : undefined
  const [failed, setFailed] = useState(false)
  const empty = !src || failed
  return (
    <span
      title={empty ? `${name} · 卡面待生成` : `${name} · 卡面`}
      className={`flex h-[34px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] border ${
        empty
          ? 'border-dashed border-[var(--divider)] bg-[var(--color-surface-1)]'
          : 'border-[var(--divider-soft)] bg-[var(--color-surface-1)]'
      }`}
    >
      {empty ? (
        <ImageIcon className="size-3 text-[var(--color-ink)]/25" />
      ) : (
        <img
          src={src}
          alt={`${name} 卡面`}
          draggable={false}
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </span>
  )
}

export type GameplaySection = keyof XiahuaGameplay | 'gift'

export default function XiahuaGameplayEditor({
  value,
  onChange,
  section,
  preset,
  assetsReady = true,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  /** 只渲染某一段（编辑面板用）；省略则渲染全部（项目配置页用）。 */
  section?: GameplaySection
  /** 当前活动模板 —— 卡池行据此取卡面；不传就都显示空槽。 */
  preset?: ActivityPreset
  /** 素材是否已经生成 —— 搭建过程中素材还没出的时候，卡面一律显示空槽，
   *  不能提前把成品图摆出来。 */
  assetsReady?: boolean
}) {
  const show = (s: GameplaySection) => !section || section === s
  const patch = (p: Partial<XiahuaGameplay>) => onChange({ ...value, ...p })

  const setTier = (i: number, p: Partial<XiahuaTierDef>) =>
    patch({ tiers: value.tiers.map((t, k) => (k === i ? { ...t, ...p } : t)) })
  const setTask = (i: number, p: Partial<XiahuaTaskDef>) =>
    patch({ tasks: value.tasks.map((t, k) => (k === i ? { ...t, ...p } : t)) })

  return (
    <div>
      {/* 整页模式先用一段话把这个活动讲清楚 —— 下面全是参数，光看参数拼不出玩法 */}
      {!section && (
        <div className="border-b border-[var(--divider-soft)] px-4 py-3.5">
          <p className="text-[12px] font-semibold text-[var(--color-ink)]/70">这个活动怎么玩</p>
          <p className="mt-1 text-[12px] leading-[20px] text-[var(--color-ink)]/60">
            用户进活动先拿 {value.draw.initialChances} 次抽卡机会，从 {value.cards.length}{' '}
            种夜食卡里抽，抽到的卡点亮卡槽；集齐{' '}
            {value.tiers.map((t) => t.need).join(' / ')} 种分别兑{' '}
            {value.tiers.map((t) => t.reward).join('、')}。
            次数抽完了靠 {value.tasks.length} 个任务再挣，重复的卡可以送朋友。
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              `${value.cards.length} 种卡`,
              `${value.tiers.length} 档奖励`,
              `${value.tasks.length} 个抽卡任务`,
              `新卡权重 ${Math.round(value.draw.newCardBias * 100)}%`,
            ].map((t) => (
              <span
                key={t}
                className="rounded-[5px] bg-[var(--color-ink)]/[0.05] px-1.5 py-[2px] text-[11px] text-[var(--color-ink)]/55"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 抽卡规则 */}
      {show('draw') && (
        <Group title={GAMEPLAY_LABEL.draw} desc="控制点击「抽夜食」时的次数消耗与出卡概率">
          <div className="grid grid-cols-2 gap-2">
            <Row label="初始抽卡次数">
              <input
                type="number"
                min={0}
                max={99}
                className={INPUT}
                value={value.draw.initialChances}
                onChange={(e) =>
                  patch({
                    draw: {
                      ...value.draw,
                      initialChances: Math.max(0, Math.min(99, Number(e.target.value) || 0)),
                    },
                  })
                }
              />
            </Row>
            <Row label={`新卡权重 ${Math.round(value.draw.newCardBias * 100)}%`}>
              <input
                type="range"
                min={0}
                max={100}
                className="mt-2 w-full accent-[#357ef8]"
                value={Math.round(value.draw.newCardBias * 100)}
                onChange={(e) =>
                  patch({ draw: { ...value.draw, newCardBias: Number(e.target.value) / 100 } })
                }
              />
            </Row>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--color-ink)]/40">
            新卡权重越高，越容易抽到还没集齐的品类（0% 完全随机，100% 必出新卡）。
          </p>
        </Group>
      )}

      {/* 奖励档位 */}
      {show('tiers') && (
        <Group
          title={GAMEPLAY_LABEL.tiers}
          desc={`集齐指定种类解锁对应奖励 · 当前 ${value.tiers.length} 档，改动会即时反映到预览的档位排布`}
        >
          <div className="space-y-2">
            {value.tiers.map((t, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="w-[56px] shrink-0">
                  <Row label="集齐">
                    <input
                      type="number"
                      min={1}
                      max={value.cards.length}
                      className={INPUT}
                      value={t.need}
                      onChange={(e) => setTier(i, { need: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </Row>
                </div>
                <div className="min-w-0 flex-1">
                  <Row label="奖励">
                    <input
                      className={INPUT}
                      value={t.reward}
                      onChange={(e) => setTier(i, { reward: e.target.value })}
                    />
                  </Row>
                </div>
                <div className="mb-[6px]">
                  <IconBtn
                    label="删除该档"
                    tone="danger"
                    onClick={() => patch({ tiers: value.tiers.filter((_, k) => k !== i) })}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-[8px] border border-dashed border-[var(--divider-soft)] text-[12px] text-[var(--color-ink)]/60 hover:border-[#357ef8] hover:text-[#357ef8]"
            onClick={() =>
              patch({
                tiers: [
                  ...value.tiers,
                  {
                    need: Math.min(
                      value.cards.length,
                      (value.tiers.at(-1)?.need ?? 0) + 2,
                    ),
                    reward: '新奖励',
                    kind: 'coupon',
                  },
                ],
              })
            }
          >
            <Plus className="size-3.5" /> 增加档位
          </button>
        </Group>
      )}

      {/* 夜食卡池 */}
      {show('cards') && (
        <Group
          title={GAMEPLAY_LABEL.cards}
          desc={`卡池 ${value.cards.length} 种 · 增删会同步影响卡槽格数与集齐条件`}
        >
          <div className="space-y-1.5">
            {value.cards.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-[16px] shrink-0 text-right text-[11px] text-[var(--color-ink)]/30">
                  {i + 1}
                </span>
                <input
                  className={`${INPUT} flex-[3]`}
                  value={c.name}
                  onChange={(e) =>
                    patch({
                      cards: value.cards.map((x, k) =>
                        k === i ? { ...x, name: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  className={`${INPUT} flex-[4]`}
                  value={c.motto}
                  onChange={(e) =>
                    patch({
                      cards: value.cards.map((x, k) =>
                        k === i ? { ...x, motto: e.target.value } : x,
                      ),
                    })
                  }
                />
                {/* 卡面放在行尾 —— 素材还没生成时是空槽，一眼看得出缺哪张 */}
                <CardArtSlot
                  preset={assetsReady ? preset : undefined}
                  id={c.id}
                  name={c.name}
                />
                <IconBtn
                  label="删除该卡"
                  tone="danger"
                  onClick={() => patch({ cards: value.cards.filter((_, k) => k !== i) })}
                />
              </div>
            ))}
          </div>
          <button
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-[8px] border border-dashed border-[var(--divider-soft)] text-[12px] text-[var(--color-ink)]/60 hover:border-[#357ef8] hover:text-[#357ef8]"
            onClick={() =>
              patch({
                cards: [
                  ...value.cards,
                  {
                    id: `card-${value.cards.length + 1}`,
                    name: `新夜食 ${value.cards.length + 1}`,
                    motto: '待补充文案',
                  },
                ],
              })
            }
          >
            <Plus className="size-3.5" /> 增加夜食卡
          </button>
          <p className="text-[11px] leading-relaxed text-[var(--color-ink)]/40">
            新增卡默认没有卡面素材，会以石膏占位显示；到「素材库 · 夜食卡面」生成后自动替换。
          </p>
        </Group>
      )}

      {/* 进度文案 */}
      {show('copy') && (
        <Group title={GAMEPLAY_LABEL.copy} desc="{n} = 还差几种，{reward} = 下一档奖励，{total} = 卡池总数">
          <Row label="主文案">
            <input
              className={INPUT}
              value={value.copy.progress}
              onChange={(e) => patch({ copy: { ...value.copy, progress: e.target.value } })}
            />
          </Row>
          <Row label="副文案">
            <input
              className={INPUT}
              value={value.copy.progressSub}
              onChange={(e) => patch({ copy: { ...value.copy, progressSub: e.target.value } })}
            />
          </Row>
          <Row label="集齐后">
            <input
              className={INPUT}
              value={value.copy.allDone}
              onChange={(e) => patch({ copy: { ...value.copy, allDone: e.target.value } })}
            />
          </Row>
        </Group>
      )}

      {/* 任务发放 */}
      {show('tasks') && (
        <Group title={GAMEPLAY_LABEL.tasks} desc="完成任务发放抽卡机会">
          <div className="space-y-2">
            {value.tasks.map((t, i) => (
              <div key={t.id} className="space-y-1.5 rounded-[8px] bg-[var(--color-surface-2)] p-2">
                <div className="flex items-center gap-2">
                  <input
                    className={`${INPUT} flex-1`}
                    value={t.label}
                    onChange={(e) => setTask(i, { label: e.target.value })}
                  />
                  <IconBtn
                    label="删除任务"
                    tone="danger"
                    onClick={() => patch({ tasks: value.tasks.filter((_, k) => k !== i) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Row label="每次奖励（次）">
                    <input
                      type="number"
                      min={1}
                      className={INPUT}
                      value={t.reward}
                      onChange={(e) => setTask(i, { reward: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </Row>
                  <Row label="每日上限">
                    <input
                      type="number"
                      min={1}
                      className={INPUT}
                      value={t.dailyLimit}
                      onChange={(e) =>
                        setTask(i, { dailyLimit: Math.max(1, Number(e.target.value) || 1) })
                      }
                    />
                  </Row>
                </div>
              </div>
            ))}
          </div>
          <button
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-[8px] border border-dashed border-[var(--divider-soft)] text-[12px] text-[var(--color-ink)]/60 hover:border-[#357ef8] hover:text-[#357ef8]"
            onClick={() =>
              patch({
                tasks: [
                  ...value.tasks,
                  {
                    id: `task-${value.tasks.length + 1}`,
                    label: '新任务',
                    reward: 1,
                    dailyLimit: 1,
                  },
                ],
              })
            }
          >
            <Plus className="size-3.5" /> 增加任务
          </button>
        </Group>
      )}

      {/* 赠送规则 */}
      {show('gift') && (
        <Group title={GAMEPLAY_LABEL.gift} desc="控制「我的夜食」里能否把重复卡送给好友">
          <Row label="可赠送的最少持有张数">
            <input
              type="number"
              min={1}
              className={INPUT}
              value={value.gift.minHold}
              onChange={(e) =>
                patch({ gift: { minHold: Math.max(1, Number(e.target.value) || 1) } })
              }
            />
          </Row>
          <p className="text-[11px] leading-relaxed text-[var(--color-ink)]/40">
            持有数达到该值才出现「赠送」按钮，低于时置灰提示留一张给自己。
          </p>
        </Group>
      )}
    </div>
  )
}
