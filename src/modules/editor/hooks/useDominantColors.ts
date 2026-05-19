import { useEffect, useState } from 'react'

export type RGB = [number, number, number]

const FALLBACK: RGB[] = [
  [96, 60, 160],
  [32, 28, 72],
]

const BUCKET = 24

function quantKey(r: number, g: number, b: number) {
  return `${Math.floor(r / BUCKET)}-${Math.floor(g / BUCKET)}-${Math.floor(b / BUCKET)}`
}

/** Extract the N most dominant (vibrant) colors from an image. Samples a
 *  downscaled canvas, drops near-white/black and low-saturation pixels, and
 *  deduplicates near-identical buckets. Works with data URLs and same-origin
 *  URLs; cross-origin images will taint the canvas and fall back. */
export function useDominantColors(imageUrl: string, count = 2): RGB[] {
  const [colors, setColors] = useState<RGB[]>(FALLBACK)

  useEffect(() => {
    if (!imageUrl) {
      setColors(FALLBACK)
      return
    }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        const w = 48
        const h = Math.max(
          1,
          Math.round((img.naturalHeight / img.naturalWidth) * w)
        )
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          setColors(FALLBACK)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const { data } = ctx.getImageData(0, 0, w, h)
        const buckets = new Map<
          string,
          { count: number; r: number; g: number; b: number }
        >()
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          if (a < 128) continue
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const sat = max === 0 ? 0 : (max - min) / max
          const lum = (r + g + b) / 3
          if (lum > 230 || lum < 30) continue
          if (sat < 0.22) continue
          const key = quantKey(r, g, b)
          const ex = buckets.get(key)
          if (ex) {
            ex.count++
            ex.r += r
            ex.g += g
            ex.b += b
          } else {
            buckets.set(key, { count: 1, r, g, b })
          }
        }
        const ranked = [...buckets.values()]
          .map((b) => {
            const avgR = b.r / b.count
            const avgG = b.g / b.count
            const avgB = b.b / b.count
            const mx = Math.max(avgR, avgG, avgB)
            const mn = Math.min(avgR, avgG, avgB)
            const bucketSat = mx === 0 ? 0 : (mx - mn) / mx
            return {
              count: b.count,
              // Weighted score biases toward vibrant buckets so a chromatic
              // outfit (e.g. purple) beats a big pool of near-neutral pixels.
              score: b.count * (0.3 + bucketSat),
              color: [
                Math.round(avgR),
                Math.round(avgG),
                Math.round(avgB),
              ] as RGB,
            }
          })
          .sort((a, b) => b.score - a.score)

        if (ranked.length === 0) {
          setColors(FALLBACK)
          return
        }

        const picked: RGB[] = []
        for (const c of ranked) {
          if (picked.length >= count) break
          const dup = picked.some(
            (p) =>
              Math.abs(p[0] - c.color[0]) +
                Math.abs(p[1] - c.color[1]) +
                Math.abs(p[2] - c.color[2]) <
              90
          )
          if (!dup) picked.push(c.color)
        }
        while (picked.length < count) {
          picked.push(picked[picked.length - 1] ?? FALLBACK[0])
        }
        setColors(picked)
      } catch {
        setColors(FALLBACK)
      }
    }
    img.onerror = () => {
      if (!cancelled) setColors(FALLBACK)
    }
    img.src = imageUrl
    return () => {
      cancelled = true
    }
  }, [imageUrl, count])

  return colors
}

export function rgbString([r, g, b]: RGB, alpha = 1): string {
  return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}
