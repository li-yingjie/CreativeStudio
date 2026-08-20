import { Check, Image as ImageIcon, Palette, RefreshCw, Sparkles } from '@/shared/icons'
import type { TowerDefenseAsset } from './TowerDefenseFlowModel'

interface TowerDefenseArtDirectionPanelProps {
  assets: TowerDefenseAsset[]
  selectedAssetId?: string | null
  onConfirm: (assetId: string) => void
  onRegenerate?: (assetId: string) => void
}

export default function TowerDefenseArtDirectionPanel({
  assets,
  selectedAssetId,
  onConfirm,
  onRegenerate,
}: TowerDefenseArtDirectionPanelProps) {
  const asset = assets.find((item) => item.id === selectedAssetId) ?? assets[0]
  if (!asset) return null
  const confirmed = asset.baseVisualStatus === 'confirmed'

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-[var(--color-surface-0)]">
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--divider-soft)] px-3.5">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-[var(--color-ink)] text-[var(--color-ink-contrast)]">
          <Palette className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[12px] font-semibold text-[var(--color-ink)]">
            美术设定
          </h2>
          <p className="truncate text-[9px] text-[var(--color-ink)]/40">
            世界观 Skill · 当前资产
          </p>
        </div>
      </header>

      <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto bg-[var(--color-surface-1)] p-3">
        <section className="rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-3">
          <div className="flex items-start gap-2.5">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-[11px] text-white"
              style={{
                background: `linear-gradient(145deg, ${asset.accent}, #252a31)`,
              }}
            >
              <ImageIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-[var(--color-ink)]">
                {asset.name}
              </div>
              <div className="mt-0.5 text-[9px] text-[var(--color-ink)]/42">
                {asset.role}
              </div>
              <span className="mt-2 inline-flex rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[9px] text-[var(--color-ink)]/50">
                {confirmed ? '基准视觉已确认' : '待确认'}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-4 text-[var(--color-ink)]/52">
            {asset.description}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-3">
          <h3 className="text-[10px] font-semibold text-[var(--color-ink)]">
            全局视觉语言
          </h3>
          <dl className="mt-3 grid grid-cols-[56px_minmax(0,1fr)] gap-x-2 gap-y-2 text-[9px] leading-4">
            <dt className="text-[var(--color-ink)]/36">世界观</dt>
            <dd className="text-[var(--color-ink)]/68">月隐森林 · 守夜灯塔</dd>
            <dt className="text-[var(--color-ink)]/36">造型</dt>
            <dd className="text-[var(--color-ink)]/68">圆角剪影、木石结构、发光符文</dd>
            <dt className="text-[var(--color-ink)]/36">视角</dt>
            <dd className="text-[var(--color-ink)]/68">竖屏俯视 · 统一四分之三视角</dd>
            <dt className="text-[var(--color-ink)]/36">动效</dt>
            <dd className="text-[var(--color-ink)]/68">柔光粒子、短前摇、清晰命中反馈</dd>
          </dl>
        </section>

        {asset.category !== 'map' ? (
          <section className="rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-semibold text-[var(--color-ink)]">
                动态资产规划
              </h3>
              <span className="text-[9px] text-[var(--color-ink)]/40">
                {asset.states.length} 个状态
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {asset.states.map((state) => (
                <div
                  key={state.id}
                  className="flex items-center justify-between rounded-lg bg-[var(--fill-subtle)] px-2.5 py-2 text-[9px]"
                >
                  <span className="font-medium text-[var(--color-ink)]/70">
                    {state.name}
                  </span>
                  <span className="text-[var(--color-ink)]/38">
                    {state.directions.length} 方向 · {state.framesPerDirection} 帧
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <footer className="space-y-2 border-t border-[var(--divider-soft)] p-3">
        <button
          type="button"
          disabled={!onRegenerate}
          onClick={() => onRegenerate?.(asset.id)}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--divider)] text-[10px] font-medium text-[var(--color-ink)]/65 hover:bg-[var(--fill-subtle)]"
        >
          <RefreshCw className="size-3.5" /> 重新生成当前设定
        </button>
        <button
          type="button"
          disabled={confirmed}
          onClick={() => onConfirm(asset.id)}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-ink)] text-[10px] font-medium text-[var(--color-ink-contrast)] hover:opacity-90 disabled:cursor-default disabled:opacity-45"
        >
          {confirmed ? <Check className="size-3.5" /> : <Sparkles className="size-3.5" />}
          {confirmed ? '基准视觉已确认' : '确认基准视觉'}
        </button>
      </footer>
    </aside>
  )
}
