import type { AssetCatalogItem, AssetVisualReference } from '../../assets/assetCatalog'

export function assetMediaReferences(item: AssetCatalogItem): readonly AssetVisualReference[] {
  if (item.visualReferences?.length) return item.visualReferences
  if (!item.thumbnail) return []
  return [{
    src: item.thumbnail,
    label: `${item.name}预览`,
    specification: item.metrics.map((metric) => `${metric.label} ${metric.value}`).join(' · '),
  }]
}
