import type { TowerDefenseAsset } from './TowerDefenseFlowModel'
import type { TowerDefenseUploadImage } from './TowerDefenseUpload'

export const CATALOG_SPARE_BIN_ID = 'catalog-spare-bin'
export const CATALOG_SPARE_BIN_TITLE = '备选'

export type CanvasSpareRecord =
  | { id: string; kind: 'visual'; versionIndex: number; label: string; src?: string; width?: number; height?: number }
  | { id: string; kind: 'dynamic'; taskId: string; label: string; src: string; width?: number; height?: number; detail: string }

export type CanvasSpareTile = {
  id: string
  record: CanvasSpareRecord
  sourceAssetId?: string
}

export function canvasVisualRecordId(versionIndex: number) {
  return `visual-${versionIndex}`
}

export function spareRequiresAssetImport(spare: CanvasSpareTile, targetAssetId: string) {
  if (spare.record.kind !== 'visual' || !spare.record.src) return false
  if (!spare.sourceAssetId || spare.sourceAssetId !== targetAssetId) return true
  return spare.record.versionIndex < 0
}

export function createCanvasSpareFromUpload(image: TowerDefenseUploadImage): CanvasSpareTile {
  const stamp = Date.now()
  return {
    id: `spare-upload-${stamp}`,
    record: {
      id: `upload-${stamp}`,
      kind: 'visual',
      versionIndex: -1,
      label: image.label,
      src: image.src,
      width: image.width,
      height: image.height,
    },
  }
}

export function buildCatalogSpareAsset(spares: CanvasSpareTile[]): TowerDefenseAsset {
  return {
    id: CATALOG_SPARE_BIN_ID,
    name: CATALOG_SPARE_BIN_TITLE,
    category: 'visual-style',
    role: '未分配槽位',
    description: '画布载入但尚未分配到槽位的素材',
    accent: '#357ef8',
    baseVisualStatus: 'draft',
    selectedVisualVersion: 0,
    visualVersions: spares.flatMap((spare) => spare.record.src
      ? [{
          id: spare.id,
          src: spare.record.src,
          width: spare.record.width ?? 512,
          height: spare.record.height ?? 512,
          source: 'upload' as const,
          label: spare.record.label,
        }]
      : []),
    states: [],
  }
}
