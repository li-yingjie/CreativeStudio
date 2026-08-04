import { Check, FileText, Lock, Sparkles } from '@/shared/icons'
import {
  CLONE_ASSET_DIFF,
  XIAHUA_TEMPLATE_DOCUMENT,
  type XiahuaTemplateDocument,
} from './XiahuaBuildScript'
import { XIAHUA_PRESET } from './ActivityPreset'
import XiahuaH5Preview, { activityScreens } from './XiahuaH5Preview'

/** 模板复刻前的确认文档：把成品方案翻译成「哪些固定、哪些可换、怎么用」。 */
export default function XiahuaTemplateDoc({
  document = XIAHUA_TEMPLATE_DOCUMENT,
  confirmed = false,
  variant = 'template',
}: {
  document?: XiahuaTemplateDocument
  confirmed?: boolean
  variant?: 'template' | 'project'
}) {
  const screens = activityScreens(XIAHUA_PRESET)
  const isProject = variant === 'project'

  return (
    <div className="thin-scroll h-full w-full overflow-y-auto bg-[var(--color-surface-0)] px-6 py-6">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-start gap-3 border-b border-[var(--divider-soft)] pb-4">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-sky-500/10 text-sky-600">
            <FileText className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[17px] font-semibold leading-6 text-[var(--color-ink)]">
                {document.title}
              </h2>
              <span className="rounded-full bg-[var(--color-ink)]/[0.06] px-2 py-0.5 text-[10px] text-[var(--color-ink)]/50">
                {isProject ? '项目文档' : '模板文档'}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[var(--color-ink)]/50">
              {document.source} · {document.version}
            </p>
          </div>
          <span
            className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
              confirmed
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-amber-500/10 text-amber-600'
            }`}
          >
            {confirmed ? <Check className="size-3" /> : <Lock className="size-3" />}
            {confirmed ? '已确认' : '待确认'}
          </span>
        </div>

        <div className="mt-4 rounded-[10px] border border-sky-500/15 bg-sky-500/[0.045] px-3.5 py-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-sky-600" />
            <p className="text-[13px] leading-[21px] text-[var(--color-ink)]/75">{document.summary}</p>
          </div>
        </div>

        <TemplateSection
          title={isProject ? '本期页面与玩法' : '模板页面框架'}
          hint={isProject ? '继承模板结构 · 配置本期内容' : '5 个页面 · 编号对应替换位'}
        >
          <p className="mb-3 text-[11.5px] leading-[18px] text-[var(--color-ink)]/55">
            {isProject
              ? '页面结构和交互沿用已生成的活动模板，灰阶图只用于确认页面关系；本期主题素材和玩法参数按项目文档配置。'
              : '这里先用灰阶占位图展示模板的页面结构和素材槽位，不是最终视觉。使用新活动时按编号替换素材，版式、热区和交互保持不变。'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {screens.map((screen, index) => (
              <div
                key={screen.id}
                className="rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="flex size-[20px] shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)]/[0.08] text-[10px] font-medium text-[var(--color-ink)]/65">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[var(--color-ink)]/75">{screen.label}</p>
                    <p className="mt-0.5 text-[10.5px] leading-[16px] text-[var(--color-ink)]/45">{screen.desc}</p>
                  </div>
                </div>
                <div className="mt-3 flex h-[292px] items-start justify-center overflow-hidden rounded-[8px] bg-[#e9e9e9] pt-2">
                  <div className="h-[282px] w-[130px] overflow-hidden rounded-[15px] border-[4px] border-[#1c1f23] bg-[#f2f2f2] shadow-[0_7px_14px_rgba(16,18,24,0.14)]">
                    <div className="h-[812px] w-[375px] origin-top-left scale-[0.347]">
                      <XiahuaH5Preview
                        preset={XIAHUA_PRESET}
                        gameplay={XIAHUA_PRESET.gameplay}
                        screen={screen.id}
                        build="playable"
                        wireframe
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3">
            <p className="mb-2 text-[11px] font-medium text-[var(--color-ink)]/55">
              {isProject ? '本期素材配置（对应 1–8 号）' : '素材替换位（对应 1–8 号）'}
            </p>
            <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {CLONE_ASSET_DIFF.map((item, index) => (
                <div key={item.id} className="flex items-start gap-2 text-[11.5px] leading-[17px]">
                  <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)]/[0.08] text-[10px] font-medium text-[var(--color-ink)]/65">
                    {index + 1}
                  </span>
                  <span className="min-w-0 text-[var(--color-ink)]/70">
                    <span className="font-medium">{item.from}</span>
                    <span className="mx-1 text-[var(--color-ink)]/35">→</span>
                    {item.to}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TemplateSection>

        <TemplateSection
          title={isProject ? '继承模板' : '固定继承'}
          hint={isProject ? '本期不改的页面与交互' : '每次使用模板都会保留'}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {document.fixed.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-[8px] border border-[var(--divider-soft)] px-3 py-2.5"
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                <span className="text-[12.5px] leading-[19px] text-[var(--color-ink)]/75">{item}</span>
              </div>
            ))}
          </div>
        </TemplateSection>

        <TemplateSection
          title={isProject ? '本期配置项' : '可替换槽位'}
          hint={isProject ? '根据用户需求整理' : '生成新活动前逐项确认'}
        >
          <div className="overflow-hidden rounded-[8px] border border-[var(--divider-soft)]">
            <div className="grid grid-cols-[104px_150px_minmax(0,1fr)] gap-3 bg-[var(--color-surface-1)] px-3 py-2 text-[11px] text-[var(--color-ink)]/45">
              <span>槽位</span>
              <span>{isProject ? '本期内容' : '模板当前内容'}</span>
              <span>{isProject ? '生成方式' : '新活动怎么用'}</span>
            </div>
            {document.replaceable.map((row, index) => (
              <div
                key={row.slot}
                className={`grid grid-cols-[104px_150px_minmax(0,1fr)] gap-3 px-3 py-2.5 text-[12px] leading-[18px] ${
                  index ? 'border-t border-[var(--divider-soft)]' : ''
                }`}
              >
                <span className="font-medium text-[var(--color-ink)]/75">{row.slot}</span>
                <span className="text-[var(--color-ink)]/55">{row.current}</span>
                <span className="text-[var(--color-ink)]/65">{row.usage}</span>
              </div>
            ))}
          </div>
        </TemplateSection>

        <TemplateSection
          title={isProject ? '生成计划' : '使用流程'}
          hint={isProject ? '确认后开始生成' : '确认后才进入替换清单'}
        >
          <ol className="space-y-2">
            {document.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="flex size-[19px] shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)]/[0.07] text-[10px] font-medium text-[var(--color-ink)]/60">
                  {index + 1}
                </span>
                <span className="text-[12.5px] leading-[19px] text-[var(--color-ink)]/70">{step}</span>
              </li>
            ))}
          </ol>
        </TemplateSection>

        <TemplateSection
          title={isProject ? '需求与模板约定' : '本次使用约定'}
          hint={isProject ? '本次活动' : '夏日冲浪'}
        >
          <div className="space-y-1.5 rounded-[8px] bg-[var(--color-surface-1)] px-3 py-2.5">
            {document.confirm.map((item) => (
              <p key={item} className="flex items-start gap-2 text-[12.5px] leading-[19px] text-[var(--color-ink)]/65">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-sky-500" />
                {item}
              </p>
            ))}
          </div>
        </TemplateSection>
      </div>
    </div>
  )
}

function TemplateSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-5 border-t border-[var(--divider-soft)] pt-4">
      <div className="mb-2.5 flex items-baseline gap-2">
        <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">{title}</h3>
        {hint && <span className="text-[11px] text-[var(--color-ink)]/40">{hint}</span>}
      </div>
      {children}
    </section>
  )
}
