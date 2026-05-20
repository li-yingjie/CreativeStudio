import { motion } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Mail,
  MessageCircle,
  MessagesSquare,
  Users,
  type LucideIcon,
} from '@/shared/icons'
import {
  PUBLISH_SCENES,
  PUBLISH_SCENE_DESCRIPTIONS,
  type PublishStep,
} from '../../store/publish-flow-store'

interface PublishFormProps {
  step: Exclude<PublishStep, 'idle'>
  scenes: string[]
  personaName: string
  personaPortrait: string
  onToggle: (s: string) => void
  onSubmit: () => void
  onConfirm: () => void
  /** 'chat' renders compact pills for in-chat context; 'modal' renders a
   *  2-col card grid that showcases each scene more prominently. */
  variant?: 'chat' | 'modal'
}

const SCENE_ICONS: Record<string, LucideIcon> = {
  'AI 聊天': MessageCircle,
  '评论区': MessagesSquare,
  '群聊': Users,
  '私信': Mail,
}

/** The form body shared by the chat-embedded turn and the modal — single
 *  card with a cascading layout (step 1 collects scenes, step 2 confirms). */
export default function PublishForm({
  step,
  scenes,
  personaName,
  personaPortrait,
  onToggle,
  onSubmit,
  onConfirm,
  variant = 'chat',
}: PublishFormProps) {
  const showReview = step === 'review' || step === 'confirmed'
  const isModal = variant === 'modal'
  // Both variants now cascade — step 1 stays visible (locked once submitted)
  // and step 2 reveals below it when the user clicks 下一步.
  const showSelectStep = true
  const showReviewStep = showReview

  return (
    <div
      className={
        isModal
          ? 'space-y-5'
          : 'space-y-5 rounded-xl bg-[var(--fill-subtle)] p-4 ring-1 ring-[var(--divider-soft)]'
      }
    >
      {/* Step 1 — pick scenes */}
      {showSelectStep && (
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-[13px] font-medium text-[var(--color-ink)]/75">
            1&nbsp; 选择抖音场景
          </div>
          {isModal && (
            <div className="text-[11px] text-[var(--color-ink)]/45">
              可多选 · 已选 {scenes.length}/{PUBLISH_SCENES.length}
            </div>
          )}
        </div>
        {isModal ? (
          <div className="grid grid-cols-2 gap-2">
            {PUBLISH_SCENES.map((s) => {
              const checked = scenes.includes(s)
              const locked = step !== 'select'
              const Icon = SCENE_ICONS[s] ?? MessageCircle
              return (
                <button
                  key={s}
                  type="button"
                  disabled={locked}
                  onClick={() => onToggle(s)}
                  className={`group relative flex items-start gap-2.5 rounded-xl p-3 text-left transition-all ${
                    checked
                      ? 'bg-[var(--fill-medium)] ring-1 ring-[var(--divider)]'
                      : 'bg-[var(--fill-subtle)] ring-1 ring-[var(--divider-soft)] hover:bg-[var(--fill-soft)] hover:ring-[var(--divider)]'
                  } ${locked ? 'cursor-default' : ''}`}
                >
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                      checked ? 'bg-[var(--fill-strong)] text-[var(--color-ink)]' : 'bg-[var(--fill-soft)] text-[var(--color-ink)]/55'
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 pr-6">
                    <span className={`text-[13px] font-medium ${checked ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink)]/85'}`}>
                      {s}
                    </span>
                    <span className="text-[11px] leading-[1.55] text-[var(--color-ink)]/55">
                      {PUBLISH_SCENE_DESCRIPTIONS[s] ?? '即将上线'}
                    </span>
                  </div>
                  <span
                    className={`absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded transition-all ${
                      checked
                        ? 'bg-[var(--color-ink)] text-[var(--color-ink-contrast)]'
                        : 'bg-transparent ring-1 ring-[var(--divider)] group-hover:ring-[var(--divider)]'
                    }`}
                  >
                    {checked && <Check size={10} strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {PUBLISH_SCENES.map((s) => {
              const checked = scenes.includes(s)
              const locked = step !== 'select'
              return (
                <button
                  key={s}
                  type="button"
                  disabled={locked}
                  onClick={() => onToggle(s)}
                  className={`rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                    checked
                      ? 'bg-[var(--fill-strong)] text-[var(--color-ink)] ring-1 ring-[var(--divider)]'
                      : 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/60 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]/85'
                  } ${locked ? 'cursor-default' : ''}`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        )}
        {step === 'select' && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={scenes.length === 0}
            className={`${
              isModal
                ? 'w-full rounded-md bg-[var(--color-ink)] px-3 py-2 text-[12px] font-medium'
                : 'rounded-md bg-[var(--color-ink)] px-3 py-1 text-[11px] font-medium'
            } text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90 disabled:opacity-40`}
          >
            下一步
          </button>
        )}
      </div>
      )}

      {/* Step 2 — review (cascades in chat; split from step 1 in modal) */}
      {showReviewStep && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className={isModal ? 'space-y-4' : 'space-y-2'}
        >
          <div className="text-[13px] font-medium text-[var(--color-ink)]/75">
            2&nbsp; 确认发布信息
          </div>
          <div className="overflow-hidden rounded-xl bg-[var(--fill-subtle)] ring-1 ring-[var(--divider-soft)]">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--divider)]">
                <img
                  src={personaPortrait}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: '50% 25%' }}
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[10px] text-[var(--color-ink)]/50">AI 分身账号</span>
                <span className="truncate text-[12px] font-medium text-[var(--color-ink)]">
                  {personaName || 'AI 分身'}
                </span>
              </div>
              <span className="ml-auto text-[10.5px] text-[var(--color-ink)]/40">
                发布至 {scenes.length} 个场景
              </span>
            </div>
            <div className="h-px bg-[var(--fill-soft)]" />
            <div className="flex flex-col">
              {scenes.map((s, i) => {
                const Icon = SCENE_ICONS[s] ?? MessageCircle
                return (
                  <div
                    key={s}
                    className={`flex items-start gap-2.5 px-3 py-2.5 ${
                      i > 0 ? 'border-t border-[var(--divider-soft)]' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--fill-soft)] text-[var(--color-ink)]/70">
                      <Icon size={13} strokeWidth={1.8} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[12px] font-medium text-[var(--color-ink)]">{s}</span>
                      <span className="text-[10.5px] leading-[1.5] text-[var(--color-ink)]/55">
                        {PUBLISH_SCENE_DESCRIPTIONS[s] ?? '即将上线'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            disabled={step !== 'review'}
            className={`${
              isModal
                ? 'w-full rounded-md bg-[var(--color-ink)] px-3 py-2 text-[12px] font-medium'
                : 'rounded-md bg-[var(--color-ink)] px-3 py-1 text-[11px] font-medium'
            } text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60`}
          >
            {step === 'review' ? '确认发布' : '已确认'}
          </button>
          {step === 'confirmed' && (
            <div className="flex items-center gap-1.5 pt-1 text-[12px] text-[var(--color-ink)]/55">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>已提交发布～发布记录可点击右上角查看</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
