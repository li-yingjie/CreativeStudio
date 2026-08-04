import { useRef, useState } from 'react'
import { Box, Camera, Download, RotateCcw, Sun } from '@/shared/icons'

const HORSE_SRC = '/assets/xiahua/mascot-horse-v3.png'

type BackgroundKey = 'night' | 'cream' | 'mint' | 'paper'

const BACKGROUNDS: Record<BackgroundKey, { label: string; css: string; export: string }> = {
  night: {
    label: '夜食棕',
    css: 'radial-gradient(circle at 50% 18%, #8a4b2c 0%, #412018 48%, #24100d 100%)',
    export: '#2f1912',
  },
  cream: {
    label: '暖奶油',
    css: 'radial-gradient(circle at 50% 18%, #fff4df 0%, #f2c999 52%, #c97848 100%)',
    export: '#f2c999',
  },
  mint: {
    label: '薄荷绿',
    css: 'radial-gradient(circle at 50% 18%, #effff5 0%, #b8ead5 55%, #65ae9f 100%)',
    export: '#b8ead5',
  },
  paper: {
    label: '纸张白',
    css: 'linear-gradient(145deg, #fffdf8 0%, #f4efe7 100%)',
    export: '#f4efe7',
  },
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

interface StudioState {
  yaw: number
  pitch: number
  roll: number
  scale: number
  lightX: number
  lightY: number
  lightStrength: number
  background: BackgroundKey
  shadow: boolean
  grid: boolean
}

const INITIAL: StudioState = {
  yaw: -12,
  pitch: 6,
  roll: 0,
  scale: 0.86,
  lightX: 62,
  lightY: 22,
  lightStrength: 72,
  background: 'night',
  shadow: true,
  grid: false,
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '°',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[11px] text-[var(--color-ink)]/55">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-[var(--color-ink)]/75">
          {Number.isInteger(value) ? value : value.toFixed(2)}{suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer accent-[#f15b35]"
      />
    </label>
  )
}

export default function XiahuaMascot3DStudio() {
  const [state, setState] = useState<StudioState>(INITIAL)
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)

  const update = (patch: Partial<StudioState>) => setState((current) => ({ ...current, ...patch }))
  const reset = () => setState(INITIAL)

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragOrigin.current = { x: event.clientX, y: event.clientY, yaw: state.yaw, pitch: state.pitch }
    setDragging(true)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current
    if (!origin) return
    update({
      yaw: clamp(origin.yaw + (event.clientX - origin.x) * 0.45, -55, 55),
      pitch: clamp(origin.pitch - (event.clientY - origin.y) * 0.35, -30, 30),
    })
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragOrigin.current = null
    setDragging(false)
  }

  const modelTransform = `translate3d(0, 0, 0) rotateX(${state.pitch}deg) rotateY(${state.yaw}deg) rotateZ(${state.roll}deg) scale(${state.scale})`
  const modelFilter = `brightness(${0.76 + state.lightStrength / 240}) saturate(${0.9 + state.lightStrength / 180})`

  const exportPng = () => {
    const canvas = document.createElement('canvas')
    const width = 900
    const height = 900
    const dpr = 2
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const bg = BACKGROUNDS[state.background].export
    const gradient = ctx.createRadialGradient(width * 0.52, height * 0.15, 10, width * 0.5, height * 0.55, width * 0.8)
    gradient.addColorStop(0, state.background === 'night' ? '#8a4b2c' : '#fff8ed')
    gradient.addColorStop(1, bg)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    if (state.grid) {
      ctx.strokeStyle = state.background === 'paper' ? 'rgba(120,90,55,.08)' : 'rgba(255,255,255,.10)'
      ctx.lineWidth = 1
      for (let x = 0; x <= width; x += 36) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y <= height; y += 36) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    if (state.shadow) {
      ctx.save()
      ctx.translate(width / 2 + state.yaw * 1.5, 770)
      ctx.scale(1 + Math.abs(state.yaw) / 90, 0.22)
      const shadow = ctx.createRadialGradient(0, 0, 12, 0, 0, 220)
      shadow.addColorStop(0, 'rgba(22,11,8,.48)')
      shadow.addColorStop(1, 'rgba(22,11,8,0)')
      ctx.fillStyle = shadow
      ctx.beginPath()
      ctx.arc(0, 0, 220, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const image = new Image()
    image.onload = () => {
      const drawHeight = 670 * state.scale
      const drawWidth = (image.width / image.height) * drawHeight
      const x = width / 2 - drawWidth / 2 + state.yaw * 1.3
      const y = 440 - drawHeight / 2 + state.pitch * 1.1
      const yawScale = Math.max(0.48, Math.cos((state.yaw * Math.PI) / 180))
      const pitchSkew = Math.sin((state.pitch * Math.PI) / 180) * 0.08

      ctx.save()
      ctx.filter = modelFilter
      for (let i = 5; i >= 1; i -= 1) {
        ctx.globalAlpha = 0.045
        ctx.setTransform(dpr * yawScale, dpr * pitchSkew, 0, dpr, dpr * (x + i * 2.2), dpr * (y + i * 1.1))
        ctx.drawImage(image, 0, 0, drawWidth, drawHeight)
      }
      ctx.globalAlpha = 1
      ctx.setTransform(dpr * yawScale, dpr * pitchSkew, 0, dpr, dpr * x, dpr * y)
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight)
      ctx.restore()

      const glow = ctx.createRadialGradient(width * (state.lightX / 100), height * (state.lightY / 100), 0, width * (state.lightX / 100), height * (state.lightY / 100), 360)
      glow.addColorStop(0, `rgba(255,184,106,${0.1 + state.lightStrength / 900})`)
      glow.addColorStop(1, 'rgba(255,184,106,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      canvas.toBlob((blob) => {
        if (!blob) return
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = '这夏夯爆了-小马IP-3D截图.png'
        link.click()
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000)
      }, 'image/png')
    }
    image.src = HORSE_SRC
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--color-surface-0)]">
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <div
          className={`relative h-[330px] touch-none select-none overflow-hidden rounded-[14px] border border-black/10 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ perspective: '900px', background: BACKGROUNDS[state.background].css }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="小马 3D 对象预览，可拖拽旋转"
        >
          {state.grid && (
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
          )}
          {state.shadow && (
            <div className="pointer-events-none absolute bottom-5 left-1/2 h-7 w-48 -translate-x-1/2 rounded-[50%] bg-black/35 blur-xl" />
          )}
          <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
            {Array.from({ length: 6 }, (_, index) => (
              <img
                key={index}
                src={HORSE_SRC}
                alt=""
                draggable={false}
                className="pointer-events-none absolute h-[300px] w-auto object-contain"
                style={{
                  transform: `translate3d(${index * 1.8}px, ${index * 1.1}px, ${index * 2}px) ${modelTransform}`,
                  opacity: 0.055,
                  filter: 'brightness(.54) saturate(.8)',
                }}
              />
            ))}
            <img
              src={HORSE_SRC}
              alt="小马 IP 3D 对象"
              draggable={false}
              className="pointer-events-none absolute h-[300px] w-auto object-contain"
              style={{ transform: modelTransform, filter: `${modelFilter} drop-shadow(0 16px 12px rgba(38,16,7,.22))` }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              background: `radial-gradient(circle at ${state.lightX}% ${state.lightY}%, rgba(255,194,128,${0.08 + state.lightStrength / 500}) 0%, rgba(255,194,128,0) 42%)`,
            }}
          />
          <div className="absolute bottom-2 left-2 rounded-full bg-black/25 px-2 py-1 text-[10px] text-white/75">
            {dragging ? '旋转中' : '拖拽旋转'}
          </div>
          <div className="absolute right-2 top-2 rounded-full bg-black/25 px-2 py-1 text-[10px] font-mono text-white/75">
            Y {Math.round(state.yaw)}° · X {Math.round(state.pitch)}°
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-[#f15b35] text-[12px] font-semibold text-white shadow-sm hover:bg-[#d94c29]"
            onClick={exportPng}
          >
            <Camera className="size-3.5" /> 导出 PNG
          </button>
          <button
            type="button"
            className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-[var(--divider-soft)] text-[12px] text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]"
            onClick={reset}
          >
            <RotateCcw className="size-3.5" /> 重置视角
          </button>
        </div>

        <div className="mt-3 rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-ink)]/75">
            <Box className="size-3.5 text-[#f15b35]" /> 对象变换
          </div>
          <div className="space-y-3">
            <Slider label="水平旋转 Y" value={state.yaw} min={-55} max={55} onChange={(yaw) => update({ yaw })} />
            <Slider label="俯仰旋转 X" value={state.pitch} min={-30} max={30} onChange={(pitch) => update({ pitch })} />
            <Slider label="平面旋转 Z" value={state.roll} min={-20} max={20} onChange={(roll) => update({ roll })} />
            <Slider label="对象大小" value={state.scale} min={0.55} max={1.15} step={0.01} suffix="×" onChange={(scale) => update({ scale })} />
          </div>
        </div>

        <div className="mt-3 rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-ink)]/75">
            <Sun className="size-3.5 text-[#f59e0b]" /> 灯光与背景
          </div>
          <div className="space-y-3">
            <Slider label="灯光横向位置" value={state.lightX} min={0} max={100} suffix="%" onChange={(lightX) => update({ lightX })} />
            <Slider label="灯光纵向位置" value={state.lightY} min={0} max={100} suffix="%" onChange={(lightY) => update({ lightY })} />
            <Slider label="灯光强度" value={state.lightStrength} min={0} max={100} suffix="%" onChange={(lightStrength) => update({ lightStrength })} />
            <div>
              <p className="mb-1.5 text-[11px] text-[var(--color-ink)]/55">截图背景</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(BACKGROUNDS) as BackgroundKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`cursor-pointer rounded-[7px] border px-1 py-1.5 text-[10px] ${state.background === key ? 'border-[#f15b35] bg-[#fff0ea] text-[#d94c29]' : 'border-[var(--divider-soft)] text-[var(--color-ink)]/55 hover:border-[#f15b35]/50'}`}
                    onClick={() => update({ background: key })}
                  >
                    <span className="mx-auto mb-1 block size-4 rounded-full border border-black/10" style={{ background: BACKGROUNDS[key].css }} />
                    {BACKGROUNDS[key].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 text-[11px] text-[var(--color-ink)]/60">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={state.shadow} onChange={(event) => update({ shadow: event.target.checked })} />
                地面阴影
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={state.grid} onChange={(event) => update({ grid: event.target.checked })} />
                辅助网格
              </label>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-[9px] bg-[#fff5ee] px-2.5 py-2 text-[11px] leading-relaxed text-[#a34c2e]">
          <Download className="mt-0.5 size-3.5 shrink-0" />
          这是可运营截图的 2.5D 对象工作台：当前 IP 是透明底 3D 渲染图，支持视角、灯光、背景和 PNG 输出；后续如果接入 GLB 模型，可沿用这套控制面板。
        </div>
      </div>
    </div>
  )
}
