import { ImagePlus } from 'lucide-react'
import type { MiniProgramAsset } from './MiniProgramConfigData'

/**
 * 静态素材 — icons / images shown as a visual management grid.
 * Opened as a right-side tab from the product view's 静态素材 entry.
 */
interface AssetGridViewProps {
  assets: MiniProgramAsset[]
}

export default function AssetGridView({ assets }: AssetGridViewProps) {
  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="mx-auto flex w-full max-w-[860px] flex-col px-8 py-8">
        <header className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--color-ink)]">
              静态素材
            </h1>
            <p className="mt-1 text-[13px] text-[var(--color-ink)]/55">
              小程序用到的图标与图片，共 {assets.length} 张。
            </p>
          </div>
        </header>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {assets.map((a) => (
            <figure key={a.name} className="group flex flex-col gap-2">
              <div className="aspect-square overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--fill-subtle)]">
                <img
                  src={a.url}
                  alt={a.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className="truncate px-0.5 text-[12px] text-[var(--color-ink)]/70">
                {a.name}
              </figcaption>
            </figure>
          ))}

          {/* upload affordance */}
          <button
            type="button"
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--divider)] text-[var(--color-ink)]/40 transition-colors hover:border-[var(--color-ink)]/30 hover:text-[var(--color-ink)]/60"
          >
            <ImagePlus size={20} strokeWidth={1.6} />
            <span className="text-[12px]">上传素材</span>
          </button>
        </div>
      </div>
    </div>
  )
}
