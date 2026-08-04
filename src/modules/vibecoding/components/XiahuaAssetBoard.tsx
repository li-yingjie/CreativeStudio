/* eslint-disable react-refresh/only-export-components -- 批次定义与素材板同源 */
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Image as ImageIcon } from '@/shared/icons'
import { assetMap, assetVariants, cardArt, cardArtVariants, type ActivityPreset } from './ActivityPreset'
import GarudaAssetsView, { type AssetItem } from './GarudaAssetsView'
import { resolveAssetPrompt, XIAHUA_ASSET_GROUPS, type AssetGroup } from './ProjectAssetCatalog'

/* ─── 素材生成板（右侧「素材」态） ───
 * 交互框架确认之后才生成素材：按批次产出，每个素材按真实候选逐步解锁，
 * 选中的那版才会被合成进最终活动。这是 0→1 的第二个卡点。 */

/** 最多显示四个真实候选；每个素材实际能解锁几版由 preset 决定。 */
export const MAX_VERSIONS = 4

export interface AssetBatch {
  id: string
  title: string
  note?: string
  items: { key: string; name: string; src?: string; ratio: string }[]
}

/** 素材批次 —— 顺序与搭建阶段一一对应。 */
export function assetBatches(preset: ActivityPreset): AssetBatch[] {
  const A = assetMap(preset)
  const cards = preset.gameplay.cards
  return [
    {
      id: 'kv',
      title: '主视觉',
      items: [{ key: 'headKv', name: '头图 KV', src: A.headKv, ratio: '375 / 494' }],
    },
    {
      id: 'brand',
      title: '品牌与标题',
      items: [
        { key: 'title', name: '活动标题字', src: A.title, ratio: '247 / 68' },
        { key: 'resultTitle', name: '开卡标题', src: A.resultTitle, ratio: '281 / 54' },
        { key: 'footerLogo', name: '页脚字标', src: A.footerLogo, ratio: '121 / 32' },
      ],
    },
    {
      id: 'ui',
      title: '交互组件',
      items: [
        { key: 'btnDraw', name: '主按钮', src: A.btnDraw, ratio: '207 / 50' },
        { key: 'btnMyCards', name: '左侧入口', src: A.btnMyCards, ratio: '56 / 42' },
        { key: 'btnMyPrizes', name: '右侧入口', src: A.btnMyPrizes, ratio: '56 / 42' },
        { key: 'panelBg', name: '集卡面板底', src: A.panelBg, ratio: '355 / 150' },
      ],
    },
    {
      id: 'tier',
      title: '奖励档位',
      items: [
        { key: 'tier1', name: '一档', src: A.tier1, ratio: '1 / 1' },
        { key: 'tier2', name: '二档', src: A.tier2, ratio: '1 / 1' },
        { key: 'tier3', name: '三档', src: A.tier3, ratio: '1 / 1' },
        { key: 'tier4', name: '四档', src: A.tier4, ratio: '1 / 1' },
        { key: 'envelope', name: '兑换红包', src: A.envelope, ratio: '42 / 52' },
      ],
    },
    {
      id: 'cards',
      title: `${cards.length} 张卡面`,
      note: '每张同时产出彩色（已获得）与石膏（未获得）两态',
      items: cards.map((c) => ({
        key: `card-${c.id}`,
        name: c.name,
        src: cardArt(preset, c.id).img,
        ratio: '1 / 1',
      })),
    },
    {
      id: 'sections',
      title: '下半屏分区',
      items: [
        { key: 'secTasks', name: '任务区', src: A.secTasks, ratio: '375 / 152' },
        { key: 'secTopics', name: '话题区', src: A.secTopics, ratio: '375 / 317' },
        { key: 'secBanner', name: '底部 banner', src: A.secBanner, ratio: '375 / 158' },
        { key: 'beanBar', name: '金豆条', src: A.beanBar, ratio: '355 / 62' },
      ],
    },
  ]
}

export default function XiahuaAssetBoard({
  preset,
  /** 已生成到第几批（0 = 都还没开始，等于批次数 = 全部完成） */
  done,
  picks,
  versions,
  onPick,
}: {
  preset: ActivityPreset
  done: number
  picks: Record<string, number>
  /** 每个素材已经产出的版本数（缺省 = 1）。 */
  versions?: Record<string, number>
  onPick: (key: string, v: number) => void
}) {
  const batches = useMemo(() => assetBatches(preset), [preset])
  const total = batches.reduce((n, b) => n + b.items.length, 0)
  // done 可能是 -1（一批都还没开始）—— 不夹一下 slice(0,-1) 会算成「除最后一批都好了」
  const madeCount = batches.slice(0, Math.max(0, done)).reduce((n, b) => n + b.items.length, 0)
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null)

  /* 生成态和正式素材库共用同一套下钻详情：只把已经产出的素材放进侧栏，
     版本来源仍由当前 preset 决定，点击卡片后看到的 Prompt / 版本切换与素材库一致。 */
  const generatedGroups = useMemo<AssetGroup[]>(() => {
    const catalogItems = XIAHUA_ASSET_GROUPS.flatMap((group) => group.items)
    return batches.slice(0, Math.min(batches.length, Math.max(0, done))).map((batch) => ({
      title: batch.title,
      desc: batch.note,
      items: batch.items.map((item) => {
        const sources = item.key.startsWith('card-')
          ? cardArtVariants(preset, item.key.slice(5)).img
          : assetVariants(preset, item.key)
        const count = Math.max(1, Math.min(MAX_VERSIONS, sources.length))
        const generated = sources.slice(0, Math.max(1, Math.min(count, versions?.[item.key] ?? 1)))
        const catalogItem = catalogItems.find(
          (candidate) => candidate.src === generated[0] || candidate.label === item.name,
        )
        return {
          id: `xiahua-${item.key}`,
          src: generated[0] ?? item.src ?? '',
          variants: generated.slice(1),
          label: item.name,
          prompt: catalogItem
            ? resolveAssetPrompt(catalogItem)
            : {
                text: `为「${item.name}」生成与当前活动视觉统一的 H5 素材，保持尺寸比例、材质和构图稳定。`,
                skillLabel: 'H5 活动视觉 skill',
                model: 'NanoBanana',
              },
        }
      }),
    }))
  }, [batches, done, preset, versions])

  const openAsset = (key: string) => {
    const asset = generatedGroups
      .flatMap((group) => group.items)
      .find((item) => item.id === `xiahua-${key}`)
    if (!asset) return
    const sources = [asset.src, ...(asset.variants ?? [])]
    const version = Math.max(0, Math.min(picks[key] ?? 0, sources.length - 1))
    setSelectedAsset({ ...asset, src: sources[version], version: version + 1 })
  }

  const selectAsset = (asset: AssetItem | null) => {
    if (asset?.id?.startsWith('xiahua-')) {
      const key = asset.id.slice('xiahua-'.length)
      onPick(key, Math.max(0, (asset.version ?? 1) - 1))
    }
    setSelectedAsset(asset)
  }

  if (selectedAsset) {
    return (
      <GarudaAssetsView
        groups={generatedGroups}
        selectedAsset={selectedAsset}
        onSelectAsset={selectAsset}
      />
    )
  }

  return (
    // 版式与素材库（GarudaAssetsView）保持一致 —— 生成态和生成完的素材库是同一个
    // 东西的两个阶段，栅格、间距、缩略图卡片都用同一套，只多出批次状态和占位。
    <div className="thin-scroll flex h-full w-full min-w-0 flex-col overflow-y-auto bg-[var(--color-surface-0)]">
      <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <ImageIcon className="size-4 shrink-0 text-[var(--color-ink)]/55" />
          <span className="text-[12px] font-medium text-[var(--color-ink)]">素材生成</span>
          <span className="truncate text-[11px] text-[var(--color-ink)]/45">
            按清单一项项产出 · 完成后同步到素材库
          </span>
        </div>
        <span className="ml-auto shrink-0 rounded bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[11px] tabular-nums text-[var(--color-ink)]/55">
          {madeCount} / {total}
        </span>
      </div>

      <div className="space-y-7 px-5 py-5">
        {batches.map((b, bi) => {
          const state = bi < done ? 'done' : bi === done ? 'running' : 'idle'
          return (
            <section key={b.id} className={state === 'idle' ? 'opacity-45' : undefined}>
              <div className="mb-2.5 flex items-baseline gap-2">
                <h3 className="text-[13px] font-semibold text-[var(--color-ink)]">{b.title}</h3>
                {b.note && (
                  <span className="truncate text-[11px] text-[var(--color-ink)]/45">{b.note}</span>
                )}
                <span className="ml-auto shrink-0 self-center">
                  {state === 'done' ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : state === 'running' ? (
                    <span className="flex items-center gap-1 text-[11px] text-[var(--color-ink)]/55">
                      <motion.span
                        className="size-1.5 rounded-full bg-[var(--color-ink)]/45"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      生成中
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--color-ink)]/35">排队中</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                {b.items.map((it) => {
                    const gen = it.key.startsWith('card-')
                      ? cardArtVariants(preset, it.key.slice(5)).img
                      : assetVariants(preset, it.key)
                    const maxVersions = Math.max(1, Math.min(MAX_VERSIONS, gen.length))
                    const nGen = Math.max(1, Math.min(maxVersions, versions?.[it.key] ?? 1))
                    const sources = gen.slice(0, nGen)
                    const nVer = sources.length
                    const pick = Math.min(picks[it.key] ?? 0, nVer - 1)
                    return (
                      // 卡片规格对齐素材库的 AssetThumb：外框 + 方形缩略图 + 名称行
                      <div
                        key={it.key}
                        className={`group flex min-w-0 flex-col gap-1.5 overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--fill-subtle)] p-1.5 text-left transition-colors ${
                          state === 'done' ? 'hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-hover)]' : ''
                        }`}
                      >
                        <div className="flex min-w-0 items-stretch gap-1">
                          <button
                            type="button"
                            disabled={state !== 'done'}
                            aria-label={state === 'done' ? `打开${it.name}素材详情` : `${it.name}待生成`}
                            onClick={() => openAsset(it.key)}
                            className={`relative flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded ${
                              state === 'done' ? 'cursor-pointer' : 'cursor-default'
                            }`}
                            style={{ background: preset.theme.bg }}
                          >
                            {state === 'done' && sources[pick] ? (
                              <motion.img
                                key={`${it.key}-${pick}`}
                                initial={{ opacity: 0, scale: 1.03 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                src={sources[pick]}
                                alt={it.name}
                                draggable={false}
                                className="h-full w-full object-contain transition-transform duration-150 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <span className="text-[11px] text-white/40">
                                {state === 'running' ? '渲染中…' : '待生成'}
                              </span>
                            )}
                            {/* 版本序号贴在图右上角，跟着图走，不再和名称混在一行 */}
                            {state === 'done' && (
                              <span className="absolute right-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-[1px] text-[10px] font-medium tabular-nums text-white/90 backdrop-blur-[2px]">
                                v{pick + 1}
                                {nVer > 1 && <span className="text-white/50">/{nVer}</span>}
                              </span>
                            )}
                          </button>
                          {state === 'done' && nVer > 1 && (
                            <div className="flex w-[34px] shrink-0 flex-col gap-1" aria-label={`${it.name} 的版本`}>
                              {Array.from({ length: nVer }, (_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  aria-label={`选择 ${it.name} 第 ${i + 1} 版`}
                                  aria-pressed={i === pick}
                                  title={`第 ${i + 1} 版${i === pick ? '（当前选中）' : ''}`}
                                  onClick={() => onPick(it.key, i)}
                                  className={`relative flex min-h-0 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-[5px] border transition-colors ${
                                    i === pick
                                      ? 'border-[#357ef8] bg-[#eaf3ff] ring-1 ring-[#357ef8]/20'
                                      : 'border-[var(--divider)] bg-[var(--color-surface-1)] hover:border-[#357ef8]/50 hover:bg-[#f5f8ff]'
                                  }`}
                                >
                                  {sources[i] ? (
                                    <img
                                      src={sources[i]}
                                      alt={`${it.name} 第 ${i + 1} 版`}
                                      draggable={false}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-[9px] text-[var(--color-ink)]/40">v{i + 1}</span>
                                  )}
                                  <span className="absolute bottom-0.5 left-0.5 rounded-[3px] bg-black/50 px-1 text-[8px] font-medium leading-3 tabular-nums text-white">
                                    v{i + 1}
                                  </span>
                                  {i === pick && (
                                    <span className="absolute right-0.5 top-0.5 flex size-3 items-center justify-center rounded-full bg-[#357ef8] text-white">
                                      <Check className="size-2" strokeWidth={3} />
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 items-center gap-1 px-1">
                          <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--color-ink)]/70">
                            {it.name}
                          </span>
                          {state === 'done' && nVer > 1 && (
                            <span className="shrink-0 text-[10px] tabular-nums text-[var(--color-ink)]/45">
                              v{pick + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
