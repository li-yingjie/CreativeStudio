import { ArrowRight, Check, Image as ImageIcon, Gamepad2 } from '@/shared/icons'
import {
  CLONE_ASSET_DIFF,
  CLONE_BATCH_TITLE,
  CLONE_GAMEPLAY_DIFF,
  type CloneDiffItem,
} from './XiahuaBuildScript'
import { DEFAULT_SUMMER_SURF_EDIT_CONFIG } from './SummerSurfH5Preview'

type TemplateAssetPreview = { src?: string; label: string; text?: string }

const TEMPLATE_ASSET_PREVIEWS: Record<string, TemplateAssetPreview> = {
  'a-kv': { src: '/assets/xiahua/head-kv.png', label: '头图 KV' },
  'a-mascot': { src: '/assets/xiahua/mascot-horse-v3.png', label: '主角' },
  'a-title': { src: '/assets/xiahua/title.png', label: '活动标题字' },
  'a-btn': { src: '/assets/xiahua/btn-draw.png', label: '主按钮' },
  'a-cards': { src: '/assets/xiahua/food-huoguo.png', label: '卡面示例' },
  'a-tier': { src: '/assets/xiahua/tier-2.png', label: '奖励档位图' },
  'a-sections': { src: '/assets/xiahua/sec-tasks.png', label: '任务区底图' },
  'a-footer': { src: '/assets/xiahua/footer-logo.png', label: '页脚字标' },
}

const SUMMER_SURF_ASSET_PREVIEWS: Record<string, TemplateAssetPreview> = {
  'a-kv': {
    src: DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroComposition.finalReference?.src ?? DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroMedia.src,
    label: '头图 KV · 夏日海边',
  },
  'a-mascot': { src: DEFAULT_SUMMER_SURF_EDIT_CONFIG.energyImage, label: '主角 · 泳圈小马' },
  'a-title': { text: DEFAULT_SUMMER_SURF_EDIT_CONFIG.campaignName, label: '活动标题字 · 夏日冷调' },
  'a-btn': { text: DEFAULT_SUMMER_SURF_EDIT_CONFIG.drawLabel, label: '主按钮' },
  'a-cards': { src: DEFAULT_SUMMER_SURF_EDIT_CONFIG.cards[0]?.image, label: '玩水装备卡面' },
  'a-tier': { src: DEFAULT_SUMMER_SURF_EDIT_CONFIG.assets.grandRewardImage, label: '足金顺顺马' },
  'a-sections': { src: DEFAULT_SUMMER_SURF_EDIT_CONFIG.inspirationCards[0]?.image, label: '夏日话题区' },
  'a-footer': { src: '/assets/marketing-king/figma/brand-logo.png', label: '品牌字标' },
}

function AssetThumb({ asset }: { asset: TemplateAssetPreview }) {
  return (
    <span className="flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)]">
      {asset.src ? (
        <img
          src={asset.src}
          alt={asset.label}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />
      ) : (
        <span className="line-clamp-3 px-1 text-center text-[8px] font-medium leading-[11px] text-[var(--color-ink)]/65">
          {asset.text ?? asset.label}
        </span>
      )}
    </span>
  )
}

/* ─── 模板复刻的替换清单（右侧「替换清单」态的右半边） ───
 * 左半边是被引用的模板本身（由 VibeCodingPage 摆一台手机），这里是挨着它的
 * 清单：模板里现在是什么 → 新活动换成什么，可勾选、分批执行、换完打勾。
 * 对着页面看清单，才判断得出「这项到底动的是画面上的哪块」。 */

function Section({
  icon: Icon,
  title,
  items,
  selected,
  onToggle,
  doneBatches,
  assetPreviews,
  replacementPreviews,
}: {
  icon: typeof ImageIcon
  title: string
  items: CloneDiffItem[]
  selected: Record<string, boolean>
  onToggle: (id: string) => void
  doneBatches: number
  assetPreviews?: Record<string, TemplateAssetPreview>
  replacementPreviews?: Record<string, TemplateAssetPreview>
}) {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="size-3.5 text-[var(--color-ink)]/45" />
        <span className="text-[12px] font-medium text-[var(--color-ink)]">{title}</span>
        <span className="text-[11px] tabular-nums text-[var(--color-ink)]/40">
          {items.filter((d) => d.batch > 0).length} 项
        </span>
      </div>
      <div className="overflow-hidden rounded-[8px] border border-[var(--divider-soft)]">
        {assetPreviews && (
          <div className="grid grid-cols-[minmax(0,1.1fr)_18px_minmax(0,1fr)] items-center gap-1.5 bg-[var(--color-surface-1)] px-2.5 py-1.5 text-[10px] text-[var(--color-ink)]/40">
            <span>模板原始素材</span>
            <span />
            <span>新活动替换为</span>
          </div>
        )}
        {items.map((d, i) => {
          const inherit = d.batch === 0
          const done = !inherit && d.batch <= doneBatches && selected[d.id] !== false
          const on = selected[d.id] !== false
          const preview = assetPreviews?.[d.id]
          return (
            <div
              key={d.id}
              className={`px-2.5 py-2 ${i > 0 ? 'border-t border-[var(--divider-soft)]' : ''} ${
                done ? 'bg-emerald-500/[0.05]' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                {inherit ? (
                  <span className="mt-[3px] shrink-0 rounded-[4px] bg-[var(--color-ink)]/[0.06] px-1 text-[10px] leading-[15px] text-[var(--color-ink)]/45">
                    继承
                  </span>
                ) : (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={`替换 ${d.from}`}
                    disabled={done}
                    onClick={() => onToggle(d.id)}
                    className={`mt-[2px] flex size-[15px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                      done
                        ? 'cursor-default border-emerald-500 bg-emerald-500 text-white'
                        : on
                          ? 'cursor-pointer border-[#357ef8] bg-[#357ef8] text-white'
                          : 'cursor-pointer border-[var(--divider)] bg-[var(--color-surface-0)]'
                    }`}
                  >
                    {(on || done) && <Check className="size-2.5" strokeWidth={3.5} />}
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <div className="grid grid-cols-[minmax(0,1.1fr)_18px_minmax(0,1fr)] items-center gap-1.5">
                    <div className="flex min-w-0 items-center gap-1.5">
                      {preview && <AssetThumb asset={preview} />}
                      <span
                        className={`min-w-0 text-[11.5px] leading-[16px] ${
                          on || inherit
                            ? 'text-[var(--color-ink)]/50 line-through decoration-[var(--color-ink)]/20'
                            : 'text-[var(--color-ink)]/45'
                        }`}
                      >
                        {d.from}
                      </span>
                    </div>
                    <ArrowRight className="size-3 shrink-0 text-[var(--color-ink)]/25" />
                    <div className="flex min-w-0 items-center gap-1.5">
                      {replacementPreviews?.[d.id] && <AssetThumb asset={replacementPreviews[d.id]} />}
                      <span
                        className={`min-w-0 text-[11.5px] leading-[16px] ${
                          on || inherit ? 'font-medium text-[var(--color-ink)]' : 'text-[var(--color-ink)]/30'
                        }`}
                      >
                        {on || inherit ? d.to : '不换'}
                      </span>
                    </div>
                  </div>
                  {d.note && (
                    <p className="mt-0.5 text-[11px] leading-[16px] text-[var(--color-ink)]/40">
                      {d.note}
                    </p>
                  )}
                </div>
                {!inherit && done && (
                  <span
                    className="mt-[2px] shrink-0 rounded-[4px] bg-emerald-500/12 px-1 text-[10px] leading-[15px] text-emerald-600"
                  >
                    已替换
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function XiahuaCloneDiff({
  templateName,
  selected,
  onToggle,
  doneBatches,
}: {
  templateName: string
  /** 未出现在表里 = 默认勾选 */
  selected: Record<string, boolean>
  onToggle: (id: string) => void
  /** 已经执行完的批次数（0 = 还没开始换） */
  doneBatches: number
}) {
  const all = [...CLONE_ASSET_DIFF, ...CLONE_GAMEPLAY_DIFF].filter((d) => d.batch > 0)
  const picked = all.filter((d) => selected[d.id] !== false)
  const done = picked.filter((d) => d.batch <= doneBatches)

  return (
    <div className="thin-scroll flex h-full w-full flex-col overflow-y-auto border-l border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4 py-4">
      <div className="mb-3">
        <h2 className="text-[14px] font-semibold leading-[20px] text-[var(--color-ink)]">
          替换清单
        </h2>
        <p className="mt-0.5 text-[11px] leading-[16px] text-[var(--color-ink)]/50">
          左边是模板「{templateName}」· 勾选要替换的项，按顺序执行
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-ink)]/[0.08]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${picked.length ? (done.length / picked.length) * 100 : 0}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] tabular-nums text-[var(--color-ink)]/50">
            {done.length} / {picked.length}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {[1, 2, 3].map((b) => (
            <span
              key={b}
              className={`rounded-[5px] px-1.5 py-[2px] text-[10px] leading-[15px] ${
                b <= doneBatches
                  ? 'bg-emerald-500/12 text-emerald-600'
                  : b === doneBatches + 1
                    ? 'bg-[#357ef8]/12 text-[#357ef8]'
                    : 'bg-[var(--color-ink)]/[0.05] text-[var(--color-ink)]/40'
              }`}
            >
              {CLONE_BATCH_TITLE[b]}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Section
          icon={ImageIcon}
          title="素材"
          items={CLONE_ASSET_DIFF}
          selected={selected}
          onToggle={onToggle}
          doneBatches={doneBatches}
          assetPreviews={TEMPLATE_ASSET_PREVIEWS}
          replacementPreviews={SUMMER_SURF_ASSET_PREVIEWS}
        />
        <Section
          icon={Gamepad2}
          title="玩法"
          items={CLONE_GAMEPLAY_DIFF}
          selected={selected}
          onToggle={onToggle}
          doneBatches={doneBatches}
        />
      </div>

      <p className="mt-3 rounded-[8px] bg-[var(--color-ink)]/[0.03] px-2.5 py-2 text-[11px] leading-[17px] text-[var(--color-ink)]/50">
        没列出来的都原样继承：5 个页面的版式与热区、抽卡 → 集卡 → 解锁档位 → 领奖的主链路、
        赠送与卡册规则。这些是模板抽象掉的结构，换活动不用重做。
      </p>
    </div>
  )
}
