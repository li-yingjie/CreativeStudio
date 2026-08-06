import type { AssetItem, AssetLayerManifest } from './ProjectAssetCatalog'

function inferredCanvas(item: AssetItem) {
  if (/Banner|banner/.test(item.label)) return { width: 1170, height: 330 }
  if (/KV|主视觉/.test(item.label)) return { width: 750, height: 1000 }
  if (/入口条|横条/.test(item.label)) return { width: 1125, height: 210 }
  return { width: 1024, height: 1024 }
}

/** Every image has an editable source. A flat image is represented by one raster root layer. */
export function resolveLayerManifest(item: AssetItem): AssetLayerManifest {
  if (item.layerManifest) {
    return {
      ...item.layerManifest,
      canvas: { ...item.layerManifest.canvas },
      layers: item.layerManifest.layers.map((layer) => ({ ...layer })),
    }
  }
  const canvas = inferredCanvas(item)
  return {
    canvas,
    layers: [
      {
        id: 'flat-root',
        name: '整图',
        type: 'raster',
        renderer: 'source-asset',
        src: item.src,
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        z: 0,
        visible: true,
        locked: true,
      },
    ],
  }
}
