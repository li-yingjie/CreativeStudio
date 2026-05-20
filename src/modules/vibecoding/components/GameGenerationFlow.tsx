import { motion } from 'framer-motion'
import {
  Sparkles,
  Music2,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
} from '@/shared/icons'
import Stream, { RevealAfter, Sequential } from './Stream'
import { ArtifactCard, ArtifactCardGroup } from './ProposalChips'
import GameConfirmCard, { type GameSpecDraft } from './GameConfirmCard'
import UserEchoBubble from './UserEchoBubble'

/** Steps in the mocked Garuda generation flow. Driven by the parent
 *  `gameStep` state machine in VibeCodingPage. */
export type GameStep =
  | 'idle'
  | 'confirming'
  | 'analyzing'
  | 'scaffolding'
  | 'art'
  | 'gameplay'
  | 'audio'
  | 'done'

const ORDER: GameStep[] = [
  'idle',
  'confirming',
  'analyzing',
  'scaffolding',
  'art',
  'gameplay',
  'audio',
  'done',
]

const atOrPast = (current: GameStep, target: GameStep) =>
  ORDER.indexOf(current) >= ORDER.indexOf(target)

const BUILDS = [
  { label: '弹幕海', desc: '射速 × 弹幕覆盖' },
  { label: '激光反射', desc: '折返链式清场' },
  { label: '无尽护盾', desc: '回能 + 反伤' },
  { label: '粒子 AOE', desc: '全场持续打击' },
  { label: '导弹追踪', desc: '锁定 × 群伤' },
  { label: '冰冻流', desc: '减速 + 暴击' },
]

const SFX = [
  'sfx_bomb_blast.wav',
  'sfx_explosion_big.wav',
  'sfx_explosion_small.wav',
  'sfx_shield_on.wav',
  'laser.wav',
  'killer.mp3',
]

const ART_THUMBS = [
  { src: '/garuda/docs/garuda-key-art.png', label: 'Key Art' },
  { src: '/garuda/assets/garuda_killermove.webp', label: '必杀技帧' },
  { src: '/garuda/assets/enemy_RapidFire.webp', label: '敌人 · 速射型' },
  { src: '/garuda/assets/enemy_Shield Generator.webp', label: '敌人 · 护盾源' },
  { src: '/garuda/assets/item_laser.png', label: '道具 · 激光' },
  { src: '/garuda/assets/item_shell.png', label: '道具 · 护盾' },
]

interface Props {
  step: GameStep
  /** Spec the user confirmed in the confirm card. When present, the
   *  flow echoes it back as a user-echo bubble before continuing. */
  spec?: GameSpecDraft | null
  /** Called when the user clicks the final product card to jump into the
   *  playable game preview. */
  onOpenGame?: () => void
  /** Called when the user clicks 开始生成 on the confirm card. Drives
   *  gameStep from `confirming` → `analyzing`. */
  onConfirmSpec?: (spec: GameSpecDraft) => void
}

export default function GameGenerationFlow({ step, spec, onOpenGame, onConfirmSpec }: Props) {
  return (
    <div className="space-y-6">
      {/* ── Step 0: 确认方案 — only shown while the user is still picking.
           Once they confirm (gameStep advances past 'confirming') we swap
           the card for a UserEchoBubble that shows what they chose, so
           the chat reads like a normal user-message reply. */}
      {step === 'confirming' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5"
        >
          <Sequential>
            {(s, next) => (
              <>
                <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                  <Stream onDone={next}>
                    {'我已经把你的需求拆成了一份生成方案，先看看下面这些选项有没有要调整的，确认后我再开始构建。'}
                  </Stream>
                </p>
                {s >= 2 && (
                  <RevealAfter delay={120}>
                    <GameConfirmCard
                      locked={false}
                      onConfirm={(picked) => onConfirmSpec?.(picked)}
                    />
                  </RevealAfter>
                )}
              </>
            )}
          </Sequential>
        </motion.div>
      )}

      {/* ── Confirmed echo — once the user confirms, we render their
           selections as a user-side bubble so the chat reads top-down. */}
      {step !== 'confirming' && step !== 'idle' && spec && (
        <UserEchoBubble
          title="已确认生成方案"
          fields={[
            { label: '玩法风格', value: spec.labels.genre },
            { label: '美术风格', value: spec.labels.art },
            { label: '难度曲线', value: spec.labels.difficulty },
            {
              label: '可选模块',
              value:
                spec.labels.modules.length > 0
                  ? spec.labels.modules.join(' · ')
                  : '未启用',
            },
          ]}
          footer="开始构建项目"
        />
      )}

      {/* ── Step 1: 分析 ── */}
      {atOrPast(step, 'analyzing') && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5"
        >
          <Sequential>
            {(s, next) => (
              <>
                <p className="text-[14px] leading-[20px] text-[var(--color-ink)]">
                  <Stream onDone={next}>
                    {'我已经解析了你的需求，准备按这条流水线把它做出来：'}
                    <strong>STG + Roguelike</strong>
                    {' · 60fps · HTML5 跨端 · 浏览器即开即玩。'}
                  </Stream>
                </p>
                {s >= 2 && (
                  <RevealAfter delay={120} onDone={next}>
                    <PlanGrid />
                  </RevealAfter>
                )}
              </>
            )}
          </Sequential>
        </motion.div>
      )}

      {/* ── Step 2: 搭骨架 ── */}
      {atOrPast(step, 'scaffolding') && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5"
        >
          <Sequential>
            {(s, next) => (
              <>
                <Phase
                  done={atOrPast(step, 'art')}
                  text={
                    <Stream onDone={next}>
                      {'调用 '}
                      <strong>代码生成工具</strong>
                      {' 搭建项目骨架 — 单页入口 + 主循环 + 资源加载器 + Service Worker 离线缓存。'}
                    </Stream>
                  }
                />
                {s >= 2 && (
                  <RevealAfter delay={120} onDone={next}>
                    <ArtifactCardGroup>
                      <ArtifactCard
                        filename="index.html"
                        summary="入口 · canvas + 控件 + 加载界面"
                        kind="code"
                        onOpen={() => {}}
                      />
                      <ArtifactCard
                        filename="garuda.js"
                        summary="主循环 · 角色 · 弹幕 · 敌人 AI · 碰撞 · Roguelike 流派"
                        kind="code"
                        onOpen={() => {}}
                      />
                      <ArtifactCard
                        filename="sw.js"
                        summary="离线缓存 — 重复访问直接读静态资源"
                        kind="code"
                        onOpen={() => {}}
                      />
                    </ArtifactCardGroup>
                  </RevealAfter>
                )}
              </>
            )}
          </Sequential>
        </motion.div>
      )}

      {/* ── Step 3: 跑美术 ── */}
      {atOrPast(step, 'art') && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5"
        >
          <Sequential>
            {(s, next) => (
              <>
                <Phase
                  done={atOrPast(step, 'gameplay')}
                  text={
                    <Stream onDone={next}>
                      {'调用 '}
                      <strong>图像生成工具</strong>
                      {' 生成主角 / 敌人 / 道具单帧，'}
                      <strong>帧动画工具</strong>
                      {' 把单帧扩成 50–200 帧的连续动画 — 风格统一、可迭代。'}
                    </Stream>
                  }
                />
                {s >= 2 && (
                  <RevealAfter delay={120} onDone={next}>
                    <ArtGrid />
                  </RevealAfter>
                )}
              </>
            )}
          </Sequential>
        </motion.div>
      )}

      {/* ── Step 4: 写玩法 ── */}
      {atOrPast(step, 'gameplay') && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5"
        >
          <Sequential>
            {(s, next) => (
              <>
                <Phase
                  done={atOrPast(step, 'audio')}
                  text={
                    <Stream onDone={next}>
                      {'调用 '}
                      <strong>玩法编排工具</strong>
                      {' 注入 '}
                      <strong>6 套 Roguelike 流派</strong>
                      {' — 每局随机抽取，碰撞 / 反射 / AOE / 群伤逻辑彼此可叠加。'}
                    </Stream>
                  }
                />
                {s >= 2 && (
                  <RevealAfter delay={120} onDone={next}>
                    <BuildsGrid />
                  </RevealAfter>
                )}
              </>
            )}
          </Sequential>
        </motion.div>
      )}

      {/* ── Step 5: 音效 ── */}
      {atOrPast(step, 'audio') && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5"
        >
          <Sequential>
            {(s, next) => (
              <>
                <Phase
                  done={atOrPast(step, 'done')}
                  text={
                    <Stream onDone={next}>
                      {'调用 '}
                      <strong>音效生成工具</strong>
                      {' 编排爆破 / 激光 / 护盾启动等程序化音效，主菜单 BGM 直接走 mp3。'}
                    </Stream>
                  }
                />
                {s >= 2 && (
                  <RevealAfter delay={120}>
                    <SfxStrip />
                  </RevealAfter>
                )}
              </>
            )}
          </Sequential>
        </motion.div>
      )}

      {/* ── Step 6: 完成 ── */}
      {atOrPast(step, 'done') && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <Sequential>
            {(s, next) => (
              <>
                <div className="flex items-start gap-2 text-[14px] leading-[20px] text-[var(--color-ink)]">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-500"
                    strokeWidth={2}
                  />
                  <p>
                    <Stream onDone={next}>
                      {'游戏已生成完成，可以先在本地试玩，确认无误后再点右上「发布」 — 点下方产物卡片或右侧 '}
                      <strong>预览</strong>
                      {' 即可开玩，方向键移动、空格射击、Q 护盾、E 炸弹、R 必杀。'}
                    </Stream>
                  </p>
                </div>
                {s >= 2 && (
                  <RevealAfter delay={120}>
                    <GameProductCard onOpen={onOpenGame} />
                  </RevealAfter>
                )}
              </>
            )}
          </Sequential>
        </motion.div>
      )}
    </div>
  )
}

/* ─── Sub-components ─── */

function Phase({
  done,
  text,
}: {
  done: boolean
  text: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2 text-[14px] leading-[20px] text-[var(--color-ink)]">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[var(--color-ink)]/70">
        {done ? (
          <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={2} />
        ) : (
          <Loader2 size={14} className="animate-spin" strokeWidth={1.8} />
        )}
      </span>
      <span className="min-w-0 flex-1">{text}</span>
    </div>
  )
}

function PlanGrid() {
  const ROWS: { k: string; v: string }[] = [
    { k: '玩法', v: 'STG 弹幕 · Roguelike 成长' },
    { k: '平台', v: 'HTML5 · 浏览器即开即玩' },
    { k: '帧率', v: '60fps · 高速对抗' },
    { k: '操作', v: '方向键 / WASD + 空格 / Q / E / R' },
    { k: '工具', v: '代码 · 图像 · 帧动画 · 音效 四类生成工具协同' },
  ]
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      {ROWS.map((r, i) => (
        <div
          key={r.k}
          className={`grid grid-cols-[88px_1fr] gap-3 px-3 py-2 text-[12px] leading-[1.6] ${
            i === 0 ? '' : 'border-t border-[var(--divider-soft)]'
          }`}
        >
          <div className="text-[var(--color-ink)]/45">{r.k}</div>
          <div className="text-[var(--color-ink)]/85">{r.v}</div>
        </div>
      ))}
    </div>
  )
}

function ArtGrid() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ART_THUMBS.map((a) => (
        <div
          key={a.src}
          className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-black/40"
        >
          <img
            src={a.src}
            alt={a.label}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
            }}
          />
          <div className="absolute inset-x-1.5 bottom-1.5 text-[10px] font-medium leading-tight text-white/85">
            {a.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function BuildsGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {BUILDS.map((b) => (
        <div
          key={b.label}
          className="flex items-center gap-2 rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-3 py-2"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--fill-subtle)] text-[var(--color-ink)]/75">
            <Sparkles size={13} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-[var(--color-ink)]">
              {b.label}
            </div>
            <div className="truncate text-[10.5px] text-[var(--color-ink)]/55">
              {b.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 产物卡片 — 生成流跑到最后一步时显示。比 ArtifactCard 重一点：左侧
 * 真实 key art 缩略图 + 标题 / 标签 / 元信息，右上一个圆按钮指引点击。
 * 点击调用上层传入的 `onOpen`，把右侧 tab 切到「预览」并进入游戏 iframe。
 */
function GameProductCard({ onOpen }: { onOpen?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-3 overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-2 text-left transition-all hover:-translate-y-[1px] hover:border-[var(--color-ink)]/30 hover:bg-[var(--fill-subtle)]"
    >
      <div className="relative h-[64px] w-[96px] shrink-0 overflow-hidden rounded-lg bg-black">
        <img
          src="/garuda/docs/garuda-key-art.png"
          alt=""
          aria-hidden
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        <span className="absolute left-1.5 bottom-1 inline-flex items-center gap-0.5 rounded-sm bg-white/20 px-1 py-[1px] font-mono text-[9.5px] uppercase tracking-wider text-white backdrop-blur-sm">
          HTML5
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13.5px] font-semibold text-[var(--color-ink)]">
            肉鸽小游戏
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-ink)]/65">
            <CheckCircle2 size={9} strokeWidth={2.4} />
            已生成 · 待发布
          </span>
        </div>
        <p className="line-clamp-1 text-[11.5px] leading-[1.5] text-[var(--color-ink)]/55">
          STG + Roguelike · 60fps · 6 套流派 · ~620 张帧动画 · 9 段音效
        </p>
        <div className="flex min-w-0 items-center gap-1 overflow-hidden pt-0.5">
          {['弹幕海', '激光反射', '无尽护盾', '粒子 AOE'].map((t) => (
            <span
              key={t}
              className="shrink-0 truncate rounded-md bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--color-ink)]/65"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <span className="ml-1 mr-2 inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 text-[12px] text-[var(--color-ink)]/75 transition-colors group-hover:border-[var(--color-ink)]/30 group-hover:bg-[var(--fill-hover)] group-hover:text-[var(--color-ink)]">
        打开
        <ArrowUpRight size={11} strokeWidth={1.8} />
      </span>
    </button>
  )
}

function SfxStrip() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SFX.map((f) => (
        <span
          key={f}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2 py-1 text-[10.5px] text-[var(--color-ink)]/75"
        >
          <Music2 size={10} strokeWidth={1.8} className="text-[var(--color-ink)]/45" />
          {f}
        </span>
      ))}
    </div>
  )
}

/**
 * Right-side build progress — what the user sees during the mock-generation
 * before the playable game lands. Plain surface with a checklist of
 * generation phases; no key-art bleeding through so the screen reads as
 * "still building" instead of "already shipped".
 */
const PROGRESS_STAGES: { step: GameStep; label: string }[] = [
  { step: 'analyzing', label: '解析需求 · 玩法 / 平台 / 操作' },
  { step: 'scaffolding', label: '搭建项目骨架 · index.html · garuda.js · sw.js' },
  { step: 'art', label: '生成美术 · NanoBanana 单帧 + Seedance 2 帧动画' },
  { step: 'gameplay', label: '注入 6 套 Roguelike 流派 · 弹幕 / 激光 / 护盾 / AOE / 导弹 / 冰冻' },
  { step: 'audio', label: '编排音效 · jsfxr 爆破 / 激光 / 护盾 + 主菜单 BGM' },
  { step: 'done', label: '生成完成 · 主循环以 60fps 启动' },
]

export function GameBuildProgress({ step }: { step: GameStep }) {
  const isWaiting = step === 'confirming'
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-0)] text-[var(--color-ink)]">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-[520px] rounded-2xl border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Loader2
              size={14}
              className={`text-[var(--color-ink)]/65 ${isWaiting ? '' : 'animate-spin'}`}
              strokeWidth={2}
            />
            <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-ink)]/55">
              {isWaiting
                ? '等待确认方案'
                : '正在生成 肉鸽小游戏'}
            </span>
          </div>
          {isWaiting ? (
            <p className="text-[13px] leading-[1.65] text-[var(--color-ink)]/65">
              你在左侧的对话里调整完玩法 / 美术 / 难度 / 模块后，点击「开始生成」，
              这里会显示实际的构建进度。
            </p>
          ) : (
            <div className="space-y-2.5">
              {PROGRESS_STAGES.map((s) => {
                const idx = ORDER.indexOf(s.step)
                const cur = ORDER.indexOf(step)
                const state = idx < cur ? 'done' : idx === cur ? 'active' : 'pending'
                return (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      {state === 'done' ? (
                        <CheckCircle2 size={14} className="text-emerald-500" strokeWidth={2} />
                      ) : state === 'active' ? (
                        <Loader2
                          size={13}
                          className="animate-spin text-[var(--color-ink)]/75"
                          strokeWidth={2}
                        />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]/15" />
                      )}
                    </span>
                    <span
                      className={`text-[13px] leading-[1.55] ${
                        state === 'done'
                          ? 'text-[var(--color-ink)]/45 line-through decoration-[var(--color-ink)]/20'
                          : state === 'active'
                            ? 'text-[var(--color-ink)]'
                            : 'text-[var(--color-ink)]/30'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
