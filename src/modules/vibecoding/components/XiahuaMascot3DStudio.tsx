import { useEffect, useRef, useState } from 'react'
import * as THREE from '@/vendor/three/three.module.js'
import { GLTFLoader } from '@/vendor/three/GLTFLoader.js'
import { Box, Camera, Check, Download, RotateCcw, Sparkles, Sun } from '@/shared/icons'
import { XIAHUA_MASCOT_MODEL_SRC } from './ProjectAssetCatalog'

const HORSE_SRC = '/assets/xiahua/mascot-horse-v3.png'

type ThreeCamera = ReturnType<typeof THREE.PerspectiveCamera>
type ThreeLight = ReturnType<typeof THREE.DirectionalLight>
type ThreeModel = ReturnType<typeof THREE.Group>
type ThreeRenderer = ReturnType<typeof THREE.WebGLRenderer>
type ThreeScene = ReturnType<typeof THREE.Scene>
type ThreeVector = ReturnType<typeof THREE.Vector3>
type ThreeMaterial = { dispose?: () => void; needsUpdate?: boolean }
type ThreeNode = {
  castShadow?: boolean
  geometry?: { dispose?: () => void } | null
  isMesh?: boolean
  material?: ThreeMaterial | ThreeMaterial[] | null
  receiveShadow?: boolean
}
type ThreeGltf = { scene: ThreeModel }

type BackgroundKey = 'night' | 'cream' | 'mint' | 'paper'
type ModelStatus = 'loading' | 'ready' | 'error'
type OutfitKey = 'original' | 'beach' | 'bird' | 'street'

const BACKGROUNDS: Record<BackgroundKey, { label: string; css: string; export: string }> = {
  night: {
    label: '曜石黑',
    css: 'radial-gradient(circle at 50% 18%, #4a4a4a 0%, #222222 52%, #0d0d0d 100%)',
    export: '#151515',
  },
  cream: {
    label: '柔雾灰',
    css: 'radial-gradient(circle at 50% 18%, #f7f7f7 0%, #d8d8d8 58%, #a8a8a8 100%)',
    export: '#d8d8d8',
  },
  mint: {
    label: '银白',
    css: 'radial-gradient(circle at 50% 18%, #ffffff 0%, #eeeeee 58%, #d4d4d4 100%)',
    export: '#eeeeee',
  },
  paper: {
    label: '纯白',
    css: 'linear-gradient(145deg, #ffffff 0%, #f2f2f2 100%)',
    export: '#f7f7f7',
  },
}

const OUTFITS: Record<OutfitKey, { label: string; caption: string; src: string }> = {
  original: {
    label: '原始 3D',
    caption: '实时模型',
    src: HORSE_SRC,
  },
  beach: {
    label: '海滩度假',
    caption: '蓝白棕榈',
    src: '/assets/xiahua/outfits/beach-vacation.png',
  },
  bird: {
    label: '小鸟运动',
    caption: '白色帽衫',
    src: '/assets/xiahua/outfits/bird-sport.png',
  },
  street: {
    label: '黑白街头',
    caption: '棒球夹克',
    src: '/assets/xiahua/outfits/mono-street.png',
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
  outfit: OutfitKey
  shadow: boolean
  grid: boolean
}

interface ThreeRuntime {
  camera: ThreeCamera
  fillLight: ThreeLight
  keyLight: ThreeLight
  model: ThreeModel | null
  renderer: ThreeRenderer
  scene: ThreeScene
  baseScale: number
  center: ThreeVector
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
  outfit: 'original',
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
        className="h-1.5 w-full cursor-pointer accent-[#111111]"
      />
    </label>
  )
}

export default function XiahuaMascot3DStudio({
  modelSrc = XIAHUA_MASCOT_MODEL_SRC,
}: {
  modelSrc?: string
} = {}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const runtimeRef = useRef<ThreeRuntime | null>(null)
  const outfitImageRef = useRef<HTMLImageElement>(null)
  const [state, setState] = useState<StudioState>(INITIAL)
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading')
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)
  const activeOutfit = OUTFITS[state.outfit]
  const isOutfitPreview = state.outfit !== 'original'

  const update = (patch: Partial<StudioState>) => setState((current) => ({ ...current, ...patch }))
  const reset = () => setState((current) => ({ ...INITIAL, outfit: current.outfit }))

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

  const modelTransform = `translate3d(0, 0, 0) rotateX(${state.pitch * 0.32}deg) rotateY(${state.yaw * 0.32}deg) rotateZ(${state.roll}deg) scale(${state.scale})`
  const modelFilter = `brightness(${0.76 + state.lightStrength / 240}) saturate(${0.9 + state.lightStrength / 180})`

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let active = true
    let frame = 0
    let renderer: ThreeRenderer
    let runtime: ThreeRuntime | null = null

    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100)
      camera.position.set(0, 0.2, 3.8)
      camera.lookAt(0, 0, 0)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15
      mount.appendChild(renderer.domElement)

      const ambient = new THREE.HemisphereLight(0xffffff, 0x161616, 2.1)
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
      const fillLight = new THREE.DirectionalLight(0xdde3ea, 1.2)
      keyLight.position.set(2, 4, 5)
      fillLight.position.set(-3, 1.5, 2)
      scene.add(ambient, keyLight, fillLight)

      runtime = { camera, center: new THREE.Vector3(), fillLight, keyLight, model: null, renderer, scene, baseScale: 1 }
      runtimeRef.current = runtime

      const resize = () => {
        const width = mount.clientWidth || 300
        const height = mount.clientHeight || 330
        renderer.setSize(width, height, true)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      resize()
      window.addEventListener('resize', resize)
      // 预览在左右布局里是弹性的：右栏折叠、面板拖宽都不触发 window.resize，
      // 只盯窗口的话画面会被拉伸。
      const boxObserver = new ResizeObserver(resize)
      boxObserver.observe(mount)

      const loader = new GLTFLoader()
      loader.load(
        encodeURI(modelSrc),
        (gltf: ThreeGltf) => {
          if (!active || !runtime) return
          const model = gltf.scene
          scene.add(model)
          model.updateMatrixWorld(true)
          model.traverse((node: ThreeNode) => {
            if (!node.isMesh) return
            node.castShadow = true
            node.receiveShadow = true
            if (Array.isArray(node.material)) {
              node.material.forEach((material: ThreeMaterial) => { material.needsUpdate = true })
            } else if (node.material) {
              node.material.needsUpdate = true
            }
          })

          const bounds = new THREE.Box3().setFromObject(model)
          const center = bounds.getCenter(new THREE.Vector3())
          const size = bounds.getSize(new THREE.Vector3())
          const maxDimension = Math.max(size.x, size.y, size.z, 0.001)
          runtime.baseScale = 2.35 / maxDimension
          runtime.center.copy(center)

          model.scale.setScalar(runtime.baseScale)
          model.position.copy(center).multiplyScalar(-runtime.baseScale)
          model.updateMatrixWorld(true)
          const fittedBounds = new THREE.Box3().setFromObject(model)
          const fittedSphere = fittedBounds.getBoundingSphere(new THREE.Sphere())
          const fitDistance = fittedSphere.radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.35
          camera.position.set(0, 0.15, Math.max(4.8, fitDistance))
          camera.lookAt(0, 0, 0)

          runtime.model = model
          setModelStatus('ready')
        },
        undefined,
        () => {
          if (active) setModelStatus('error')
        },
      )

      const render = () => {
        if (!active) return
        frame = requestAnimationFrame(render)
        renderer.render(scene, camera)
      }
      render()

      return () => {
        active = false
        cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
        boxObserver.disconnect()
        runtimeRef.current = null
        if (runtime?.model) {
          runtime.model.traverse((node: ThreeNode) => {
            node.geometry?.dispose?.()
            const materials = Array.isArray(node.material) ? node.material : [node.material]
            materials.forEach((material: ThreeMaterial | null | undefined) => material?.dispose?.())
          })
        }
        renderer.dispose()
        renderer.domElement.remove()
      }
    } catch {
      queueMicrotask(() => {
        if (active) setModelStatus('error')
      })
      return () => {
        active = false
        runtimeRef.current = null
        renderer?.dispose?.()
        renderer?.domElement?.remove?.()
      }
    }
  }, [modelSrc])

  useEffect(() => {
    const runtime = runtimeRef.current
    if (!runtime) return

    if (runtime.model) {
      const modelScale = runtime.baseScale * state.scale
      runtime.model.rotation.set(
        THREE.MathUtils.degToRad(state.pitch),
        THREE.MathUtils.degToRad(state.yaw),
        THREE.MathUtils.degToRad(state.roll),
      )
      runtime.model.scale.setScalar(modelScale)
      runtime.model.position.copy(runtime.center).multiplyScalar(-modelScale)
    }

    runtime.keyLight.position.set((state.lightX - 50) / 12, 5 - state.lightY / 18, 4)
    runtime.keyLight.intensity = 0.8 + state.lightStrength / 25
    runtime.fillLight.intensity = 0.4 + (100 - state.lightStrength) / 80
  }, [modelStatus, state.lightStrength, state.lightX, state.lightY, state.pitch, state.roll, state.scale, state.yaw])

  const exportPng = () => {
    if (isOutfitPreview) {
      const image = outfitImageRef.current
      if (!image?.complete) return

      const canvas = document.createElement('canvas')
      canvas.width = 900
      canvas.height = 900
      const context = canvas.getContext('2d')
      if (!context) return

      context.fillStyle = BACKGROUNDS[state.background].export
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.save()
      context.translate(canvas.width / 2, canvas.height / 2)
      context.rotate(THREE.MathUtils.degToRad(state.roll))
      context.scale(state.scale, state.scale)
      context.filter = modelFilter
      context.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
      context.restore()

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `这夏夯爆了-小马IP-${activeOutfit.label}.png`
      link.click()
      return
    }

    const runtime = runtimeRef.current
    const mount = mountRef.current
    if (!runtime?.model || !mount) return

    const { camera, renderer } = runtime
    const width = mount.clientWidth || 300
    const height = mount.clientHeight || 330
    const previousColor = new THREE.Color()
    renderer.getClearColor(previousColor)
    const previousAlpha = renderer.getClearAlpha()
    const previousAspect = camera.aspect

    renderer.setSize(900, 900, false)
    camera.aspect = 1
    camera.updateProjectionMatrix()
    renderer.setClearColor(BACKGROUNDS[state.background].export, 1)
    renderer.render(runtime.scene, camera)
    const dataUrl = renderer.domElement.toDataURL('image/png')

    renderer.setClearColor(previousColor, previousAlpha)
    renderer.setSize(width, height, false)
    camera.aspect = previousAspect
    camera.updateProjectionMatrix()
    renderer.render(runtime.scene, camera)

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = '这夏夯爆了-小马IP-3D截图.png'
    link.click()
  }

  return (
    // 左右布局：预览占满左侧并随面板伸缩，参数与换装收进右侧独立滚动的栏
    <div className="flex h-full min-h-0 bg-[var(--color-surface-0)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3">
        {/* 预览按比例居中，不跟着栏高拉成窄条 —— 这个面板可以很窄 */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
        <div
          className={`relative aspect-[4/5] max-h-full w-full touch-none select-none overflow-hidden rounded-[14px] border border-black/10 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ perspective: '900px', background: BACKGROUNDS[state.background].css }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={isOutfitPreview ? `${activeOutfit.label}换装预览，可拖拽调整角度` : '小马 GLB 3D 模型预览，可拖拽旋转'}
        >
          <div ref={mountRef} className={`absolute inset-0 transition-opacity duration-200 ${isOutfitPreview ? 'opacity-0' : 'opacity-100'}`} />
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
          {isOutfitPreview && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                ref={outfitImageRef}
                src={activeOutfit.src}
                alt={`${activeOutfit.label}换装效果`}
                draggable={false}
                className="h-full max-h-[420px] w-auto max-w-full object-contain transition-[filter,transform] duration-150"
                style={{ transform: modelTransform, filter: `${modelFilter} drop-shadow(0 16px 12px rgba(0,0,0,.22))` }}
              />
            </div>
          )}
          {!isOutfitPreview && modelStatus === 'error' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                src={HORSE_SRC}
                alt="小马 IP 预览图"
                draggable={false}
                className="absolute h-[300px] w-auto object-contain"
                style={{ transform: modelTransform, filter: `${modelFilter} drop-shadow(0 16px 12px rgba(0,0,0,.22))` }}
              />
              <span className="absolute bottom-2 rounded-full bg-black/35 px-2 py-1 text-[10px] text-white/80">GLB 加载失败，已回退预览图</span>
            </div>
          )}
          {!isOutfitPreview && modelStatus === 'loading' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/25 px-3 py-1.5 text-[11px] text-white/85">正在加载小马 3D 模型…</span>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              background: `radial-gradient(circle at ${state.lightX}% ${state.lightY}%, rgba(255,255,255,${0.08 + state.lightStrength / 500}) 0%, rgba(255,255,255,0) 42%)`,
            }}
          />
          <div className="absolute bottom-2 left-2 rounded-full bg-black/25 px-2 py-1 text-[10px] text-white/75">
            {dragging ? '旋转中' : '拖拽旋转'}
          </div>
          <div className="absolute right-2 top-2 rounded-full bg-black/25 px-2 py-1 text-[10px] font-mono text-white/75">
            Y {Math.round(state.yaw)}° · X {Math.round(state.pitch)}°
          </div>
        </div>
        </div>

        <div className="mt-3 flex shrink-0 gap-2">
          <button
            type="button"
            className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-[#111111] text-[12px] font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            onClick={exportPng}
            disabled={!isOutfitPreview && modelStatus !== 'ready'}
          >
            <Camera className="size-3.5" /> 导出 PNG
          </button>
          <button
            type="button"
            className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-[var(--divider-soft)] text-[12px] text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]"
            onClick={reset}
          >
            <RotateCcw className="size-3.5" /> 重置视角
          </button>
        </div>
      </div>

      {/* 面板窄的时候按比例让位，别把预览挤成一条 */}
      <aside className="thin-scroll flex w-[268px] max-w-[46%] shrink-0 flex-col overflow-y-auto border-l border-[var(--divider-soft)] p-3">
        <div className="rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3">
          <div className="mb-3 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-ink)]/75">
            <Box className="size-3.5 text-[var(--color-ink)]" /> 对象变换
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
            <Sun className="size-3.5 text-[var(--color-ink)]" /> 灯光与背景
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
                    className={`cursor-pointer rounded-[7px] border px-1 py-1.5 text-[10px] ${state.background === key ? 'border-black bg-black/[0.06] text-[var(--color-ink)]' : 'border-[var(--divider-soft)] text-[var(--color-ink)]/55 hover:border-black/35'}`}
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
                <input className="accent-[#111111]" type="checkbox" checked={state.shadow} onChange={(event) => update({ shadow: event.target.checked })} />
                地面阴影
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input className="accent-[#111111]" type="checkbox" checked={state.grid} onChange={(event) => update({ grid: event.target.checked })} />
                辅助网格
              </label>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-ink)]/75">
            <Sparkles className="size-3.5 text-[var(--color-ink)]" /> 换装
          </div>
          <p className="mb-2.5 text-[10px] leading-relaxed text-[var(--color-ink)]/45">参考活动素材生成，点击即可切换造型</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(OUTFITS) as OutfitKey[]).map((key) => {
              const outfit = OUTFITS[key]
              const selected = state.outfit === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`group relative cursor-pointer overflow-hidden rounded-[9px] border text-left transition ${selected ? 'border-black bg-black/[0.04] shadow-[0_0_0_1px_rgba(0,0,0,0.7)]' : 'border-[var(--divider-soft)] hover:border-black/35 hover:bg-black/[0.02]'}`}
                  onClick={() => update({ outfit: key })}
                  aria-pressed={selected}
                >
                  <span className="relative block h-[92px] overflow-hidden bg-[linear-gradient(145deg,#f6f6f6,#dedede)]">
                    <img src={outfit.src} alt="" draggable={false} className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]" />
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-black/65 px-1.5 py-0.5 text-[8px] font-medium text-white/90">
                      {key === 'original' ? 'GLB' : 'LOOK'}
                    </span>
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-black text-white">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="block px-2 py-1.5">
                    <span className="block text-[10px] font-semibold text-[var(--color-ink)]/80">{outfit.label}</span>
                    <span className="block text-[9px] text-[var(--color-ink)]/40">{outfit.caption}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-[9px] border border-black/10 bg-black/[0.035] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--color-ink)]/55">
          <Download className="mt-0.5 size-3.5 shrink-0" />
          原始款保留真实 GLB 旋转与灯光；三套换装为参考 Figma 生成的造型预览，支持切换与 PNG 输出。
        </div>
      </aside>
    </div>
  )
}
