import { useEffect, useRef } from 'react'

/* ─── ASCII 底纹 ───
 *
 * 从 AI 平台 (ai_design) 的 CreatorAsciiTexture 原样搬过来：不是一张静态
 * 贴图，而是用 1024² 的 alpha 遮罩逐格采样、canvas 画出的 ASCII 字符场，
 * 12fps 轻微流动。参数（字符集 / 格子 / 阈值 / 透明度）保持一致，换掉的
 * 只有遮罩图路径和 class 写法（那边用 CSS Module，这里走 Tailwind）。 */

const MASK = '/assets/workshop/ascii-mask.webp'
const GLYPHS = ['0', '8', '@', 'S', 'X', '#', '+']
const CELL_SIZE = 9
const FRAME_INTERVAL = 1000 / 12
const MASK_SIZE = 1024
const TEXTURE_TOP = -380

/** 以 (centerX, centerY) 为中心取 6×6 个样，返回峰值与均值覆盖度。 */
function sampleMask(pixels: Uint8ClampedArray, centerX: number, centerY: number) {
  let maximum = 0
  let total = 0
  let samples = 0

  for (let offsetY = -5; offsetY <= 5; offsetY += 2) {
    const y = centerY + offsetY
    if (y < 0 || y >= MASK_SIZE) continue

    for (let offsetX = -5; offsetX <= 5; offsetX += 2) {
      const x = centerX + offsetX
      if (x < 0 || x >= MASK_SIZE) continue

      const alpha = pixels[(y * MASK_SIZE + x) * 4 + 3] / 255
      maximum = Math.max(maximum, alpha)
      total += alpha
      samples += 1
    }
  }

  return { coverage: maximum, density: samples > 0 ? total / samples : 0 }
}

export default function AsciiTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return

    const context = canvas.getContext('2d')
    const maskCanvas = document.createElement('canvas')
    const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true })
    const image = new Image()
    let animationFrame = 0
    let lastFrame = 0
    let maskPixels: Uint8ClampedArray | undefined
    let width = 0
    let height = 0

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.round(container.clientWidth)
      height = Math.round(Math.max(container.clientHeight, container.scrollHeight))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const render = (time: number) => {
      animationFrame = window.requestAnimationFrame(render)

      if (!context || !maskPixels || time - lastFrame < FRAME_INTERVAL || document.hidden) {
        return
      }

      lastFrame = time
      context.clearRect(0, 0, width, height)
      context.font = '600 9px JetBrains Mono, monospace'
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      const textureWidth = width * 1.34
      const textureHeight = Math.max(textureWidth, height - TEXTURE_TOP)
      const textureLeft = (width - textureWidth) / 2
      const columns = Math.ceil(width / CELL_SIZE)
      const rows = Math.ceil(height / CELL_SIZE)
      const phase = Math.floor(time / 280)

      for (let row = 0; row < rows; row += 1) {
        const y = row * CELL_SIZE + CELL_SIZE / 2
        const maskY = Math.floor(((y - TEXTURE_TOP) / textureHeight) * MASK_SIZE)
        if (maskY < 0 || maskY >= MASK_SIZE) continue

        for (let column = 0; column < columns; column += 1) {
          const x = column * CELL_SIZE + CELL_SIZE / 2
          const maskX = Math.floor(((x - textureLeft) / textureWidth) * MASK_SIZE)
          if (maskX < 0 || maskX >= MASK_SIZE) continue

          const { coverage, density } = sampleMask(maskPixels, maskX, maskY)
          if (coverage < 0.14) continue

          const wave = (Math.sin(column * 0.18 + row * 0.12 + time / 920) + 1) / 2
          const noise = (Math.sin(column * 1.73 + row * 2.11 + phase * 0.68) + 1) / 2
          const isDenseInterior = density > 0.14
          const dropoutThreshold = 0.58 + wave * 0.36

          if (isDenseInterior && noise < dropoutThreshold) continue

          const glyphIndex = (column * 3 + row * 5 + phase) % GLYPHS.length
          const opacity = 0.035 + coverage * 0.035 + wave * 0.018
          context.fillStyle = `rgb(28 31 35 / ${opacity})`
          context.fillText(GLYPHS[glyphIndex], x, y)
        }
      }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    for (const child of Array.from(container.children)) {
      if (child !== canvas) observer.observe(child)
    }
    resize()

    image.onload = () => {
      if (!maskContext) return
      maskCanvas.width = MASK_SIZE
      maskCanvas.height = MASK_SIZE
      maskContext.drawImage(image, 0, 0, MASK_SIZE, MASK_SIZE)
      maskPixels = maskContext.getImageData(0, 0, MASK_SIZE, MASK_SIZE).data
      animationFrame = window.requestAnimationFrame(render)
    }
    image.src = MASK

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationFrame)
      image.onload = null
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-[-2] h-full w-full motion-reduce:hidden"
    />
  )
}
