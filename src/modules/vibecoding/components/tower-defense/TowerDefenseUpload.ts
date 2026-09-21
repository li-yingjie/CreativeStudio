import { fitTowerDefenseUploadSize } from './TowerDefenseVisualVersion'

export interface TowerDefenseUploadImage {
  src: string
  width: number
  height: number
  label: string
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('无法读取本地图片'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('无法读取本地图片'))
    reader.readAsDataURL(file)
  })
}

function imageNaturalSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    })
    image.onerror = () => reject(new Error('无法解析本地图片'))
    image.src = src
  })
}

function resizeImageDataUrl(src: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('无法压缩本地图片'))
        return
      }
      context.drawImage(image, 0, 0, width, height)
      resolve(canvas.toDataURL('image/webp', 0.86))
    }
    image.onerror = () => reject(new Error('无法压缩本地图片'))
    image.src = src
  })
}

function uploadLabel(file: File) {
  return file.name.replace(/\.[^.]+$/u, '').trim() || '本地上传'
}

export async function readTowerDefenseUploadImage(file: File): Promise<TowerDefenseUploadImage> {
  const src = await fileToDataUrl(file)
  const natural = await imageNaturalSize(src)
  const label = uploadLabel(file)
  if (file.type === 'image/gif' || Math.max(natural.width, natural.height) <= 1600) {
    return { src, width: natural.width, height: natural.height, label }
  }
  const fitted = fitTowerDefenseUploadSize(natural.width, natural.height)
  return {
    src: await resizeImageDataUrl(src, fitted.width, fitted.height),
    width: fitted.width,
    height: fitted.height,
    label,
  }
}
