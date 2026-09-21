export type LayeredArtworkRenderer =
  | 'image-model'
  | 'raster-art'
  | 'true-text'
  | 'brand-asset'
  | 'source-asset'

export type LayeredArtworkLayerType = 'raster' | 'vector' | 'shape' | 'text'

export type LayeredArtworkRedaction = {
  x: number
  y: number
  width: number
  height: number
  fill: string
}

export type LayeredArtworkLayer = {
  id: string
  name: string
  group: string
  type: LayeredArtworkLayerType
  renderer: LayeredArtworkRenderer
  x: number
  y: number
  width: number
  height: number
  z: number
  visible: boolean
  locked: boolean
  opacity?: number
  src?: string
  fill?: string
  text?: string
  color?: string
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  letterSpacing?: number
  lineHeight?: number
  textAlign?: 'left' | 'center' | 'right'
  redactions?: LayeredArtworkRedaction[]
}

export type LayeredArtworkGroup = {
  id: string
  name: string
  layerIds: string[]
  locked?: boolean
}

export type LayeredArtworkDocument = {
  schemaVersion: 1
  id: string
  title: string
  version: string
  canvas: { width: number; height: number }
  templateRef: { id: string; version: string; name: string }
  styleBibleRef: { id: string; version: string; name: string }
  source: {
    generator: string
    mode: 'minimal_hybrid' | 'structured_template'
    benchmark: string
    output: string
  }
  layerTree: LayeredArtworkGroup[]
  layers: LayeredArtworkLayer[]
}

export type ImageHtmlSidecar = {
  version: 1
  canvas: { width: number; height: number }
  html: string
  layerTree: {
    kind: 'group'
    name: string
    children: Array<{
      kind: 'group'
      name: string
      locked?: boolean
      children: Array<{ kind: 'layer'; ref: string; name: string; locked?: boolean }>
    }>
  }
  source: LayeredArtworkDocument['source'] & {
    documentId: string
    documentVersion: string
    environment: 'demo-local'
  }
  demoDocument: LayeredArtworkDocument
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

export const cloneLayeredArtworkDocument = (
  source: LayeredArtworkDocument,
): LayeredArtworkDocument => ({
  ...source,
  canvas: { ...source.canvas },
  templateRef: { ...source.templateRef },
  styleBibleRef: { ...source.styleBibleRef },
  source: { ...source.source },
  layerTree: source.layerTree.map((group) => ({
    ...group,
    layerIds: [...group.layerIds],
  })),
  layers: source.layers.map((layer) => ({
    ...layer,
    redactions: layer.redactions?.map((redaction) => ({ ...redaction })),
  })),
})

const comparableLockedLayer = (layer: LayeredArtworkLayer) => ({
  id: layer.id,
  type: layer.type,
  renderer: layer.renderer,
  x: layer.x,
  y: layer.y,
  width: layer.width,
  height: layer.height,
  z: layer.z,
  src: layer.src,
  fill: layer.fill,
  redactions: layer.redactions,
})

export function validateLayeredArtworkDocument(
  document: LayeredArtworkDocument,
  baseline: LayeredArtworkDocument,
) {
  const errors: string[] = []
  if (
    document.canvas.width !== baseline.canvas.width ||
    document.canvas.height !== baseline.canvas.height
  ) {
    errors.push('画布尺寸与模板版本不一致')
  }
  const ids = new Set<string>()
  for (const layer of document.layers) {
    if (ids.has(layer.id)) errors.push(`图层 ID 重复：${layer.id}`)
    ids.add(layer.id)
    if (layer.width <= 0 || layer.height <= 0) errors.push(`图层尺寸无效：${layer.name}`)
    if (!Number.isFinite(layer.x) || !Number.isFinite(layer.y)) {
      errors.push(`图层坐标无效：${layer.name}`)
    }
    if (
      layer.x < 0 ||
      layer.y < 0 ||
      layer.x + layer.width > document.canvas.width ||
      layer.y + layer.height > document.canvas.height
    ) {
      errors.push(`图层超出画布：${layer.name}`)
    }
  }
  for (const baselineLayer of baseline.layers.filter((layer) => layer.locked)) {
    const current = document.layers.find((layer) => layer.id === baselineLayer.id)
    if (!current) {
      errors.push(`受保护图层缺失：${baselineLayer.name}`)
      continue
    }
    if (
      JSON.stringify(comparableLockedLayer(current)) !==
      JSON.stringify(comparableLockedLayer(baselineLayer))
    ) {
      errors.push(`受保护图层被改写：${baselineLayer.name}`)
    }
  }
  const treeIds = document.layerTree.flatMap((group) => group.layerIds)
  if (treeIds.length !== new Set(treeIds).size) errors.push('图层树包含重复引用')
  for (const id of treeIds) {
    if (!ids.has(id)) errors.push(`图层树引用不存在：${id}`)
  }
  for (const id of ids) {
    if (!treeIds.includes(id)) errors.push(`图层未进入图层树：${id}`)
  }
  return errors
}

function layerStyle(layer: LayeredArtworkLayer) {
  const base = [
    'position:absolute',
    `left:${layer.x}px`,
    `top:${layer.y}px`,
    `width:${layer.width}px`,
    `height:${layer.height}px`,
    `opacity:${layer.opacity ?? 1}`,
  ]
  if (layer.type === 'text') {
    base.push(
      `font-size:${layer.fontSize ?? 32}px`,
      `font-family:${layer.fontFamily ?? 'PingFang SC, sans-serif'}`,
      `font-weight:${layer.fontWeight ?? 600}`,
      `color:${layer.color ?? '#161823'}`,
      `letter-spacing:${layer.letterSpacing ?? 0}px`,
      `line-height:${layer.lineHeight ?? 1}`,
      `text-align:${layer.textAlign ?? 'left'}`,
      'white-space:nowrap',
      'overflow:hidden',
    )
  }
  if (layer.type === 'shape') base.push(`background:${layer.fill ?? 'transparent'}`)
  return base.join(';')
}

export function buildImageHtmlSidecar(
  document: LayeredArtworkDocument,
): ImageHtmlSidecar {
  const children = [...document.layers]
    .sort((a, b) => a.z - b.z)
    .map((layer) => {
      const attributes = `data-ref='${escapeHtml(layer.name)}'${layer.locked ? ' data-locked' : ''}`
      if ((layer.type === 'raster' || layer.type === 'vector') && layer.src) {
        const redactions = (layer.redactions ?? [])
          .map(
            (redaction) =>
              `<span aria-hidden='true' style='position:absolute;left:${redaction.x}px;top:${redaction.y}px;width:${redaction.width}px;height:${redaction.height}px;background:${escapeHtml(redaction.fill)}'></span>`,
          )
          .join('')
        return `<div ${attributes} style='${escapeHtml(layerStyle(layer))}'><img src='${escapeHtml(layer.src)}' alt='' style='display:block;width:100%;height:100%;object-fit:fill' />${redactions}</div>`
      }
      return `<div ${attributes} style='${escapeHtml(layerStyle(layer))}'>${escapeHtml(layer.text ?? '')}</div>`
    })
    .join('')
  return {
    version: 1,
    canvas: { ...document.canvas },
    html: `<div data-image-html style='position:relative;width:${document.canvas.width}px;height:${document.canvas.height}px;overflow:hidden'>${children}</div>`,
    layerTree: {
      kind: 'group',
      name: `${document.title}图层`,
      children: document.layerTree.map((group) => ({
        kind: 'group',
        name: group.name,
        locked: group.locked,
        children: group.layerIds.map((id) => {
          const layer = document.layers.find((candidate) => candidate.id === id)
          return {
            kind: 'layer',
            ref: layer?.name ?? id,
            name: layer?.name ?? id,
            locked: layer?.locked,
          }
        }),
      })),
    },
    source: {
      ...document.source,
      documentId: document.id,
      documentVersion: document.version,
      environment: 'demo-local',
    },
    demoDocument: cloneLayeredArtworkDocument(document),
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`图片加载失败：${src}`))
    image.src = src
  })
}

function fittedFontSize(
  context: CanvasRenderingContext2D,
  layer: LayeredArtworkLayer,
) {
  let fontSize = layer.fontSize ?? 32
  const family = layer.fontFamily ?? 'PingFang SC, sans-serif'
  const weight = layer.fontWeight ?? 600
  const text = layer.text ?? ''
  while (fontSize > 8) {
    context.font = `${weight} ${fontSize}px ${family}`
    if (context.measureText(text).width <= layer.width) return fontSize
    fontSize -= 1
  }
  return fontSize
}

export async function renderLayeredArtworkToCanvas(
  document: LayeredArtworkDocument,
) {
  const canvas = window.document.createElement('canvas')
  canvas.width = document.canvas.width
  canvas.height = document.canvas.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器无法创建画布')
  context.clearRect(0, 0, canvas.width, canvas.height)
  for (const layer of [...document.layers].sort((a, b) => a.z - b.z)) {
    if (!layer.visible) continue
    context.save()
    context.globalAlpha = layer.opacity ?? 1
    if ((layer.type === 'raster' || layer.type === 'vector') && layer.src) {
      const image = await loadImage(layer.src)
      context.drawImage(image, layer.x, layer.y, layer.width, layer.height)
      for (const redaction of layer.redactions ?? []) {
        context.fillStyle = redaction.fill
        context.fillRect(
          redaction.x,
          redaction.y,
          redaction.width,
          redaction.height,
        )
      }
    } else if (layer.type === 'shape') {
      context.fillStyle = layer.fill ?? 'transparent'
      context.fillRect(layer.x, layer.y, layer.width, layer.height)
    } else if (layer.type === 'text') {
      const fontSize = fittedFontSize(context, layer)
      context.font = `${layer.fontWeight ?? 600} ${fontSize}px ${layer.fontFamily ?? 'PingFang SC, sans-serif'}`
      context.fillStyle = layer.color ?? '#161823'
      context.textBaseline = 'middle'
      context.textAlign = layer.textAlign ?? 'left'
      const x =
        layer.textAlign === 'center'
          ? layer.x + layer.width / 2
          : layer.textAlign === 'right'
            ? layer.x + layer.width
            : layer.x
      context.fillText(layer.text ?? '', x, layer.y + layer.height / 2)
    }
    context.restore()
  }
  return canvas
}

export function downloadTextFile(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function downloadLayeredArtworkPng(
  document: LayeredArtworkDocument,
  filename: string,
) {
  const canvas = await renderLayeredArtworkToCanvas(document)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('PNG 编码失败'))
    }, 'image/png')
  })
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
