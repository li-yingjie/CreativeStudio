import type { TowerDefenseAsset } from './TowerDefenseFlowModel'

export function visualVersionLabel(
  version: NonNullable<TowerDefenseAsset['visualVersions']>[number] | undefined,
  versionIndex: number,
): string {
  if (version?.label) return version.label
  if (version?.source === 'upload') return '本地上传'
  return `方案 ${String.fromCharCode(65 + versionIndex)}`
}

export function fitTowerDefenseUploadSize(width: number, height: number, maxLongSide = 1600) {
  const longSide = Math.max(width, height)
  if (longSide <= maxLongSide || longSide === 0) return { width, height }
  const scale = maxLongSide / longSide
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function appendTowerDefenseVisualVersion(
  assets: readonly TowerDefenseAsset[],
  assetId: string,
  version: NonNullable<TowerDefenseAsset['visualVersions']>[number],
): { assets: TowerDefenseAsset[]; versionIndex: number } {
  const targetIndex = assets.findIndex((asset) => asset.id === assetId)
  if (targetIndex < 0) return { assets: assets as TowerDefenseAsset[], versionIndex: -1 }
  const target = assets[targetIndex]
  const visualVersions = [...(target.visualVersions ?? [])]
  const versionIndex = visualVersions.length
  visualVersions.push({
    ...version,
    id: version.id || `upload-${versionIndex + 1}`,
  })
  const nextAssets = assets.slice() as TowerDefenseAsset[]
  nextAssets[targetIndex] = { ...target, visualVersions }
  return { assets: nextAssets, versionIndex }
}
