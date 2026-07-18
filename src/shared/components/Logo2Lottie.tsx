import { useEffect, useRef, useState } from 'react'
import type { AnimationItem, LottiePlayer } from 'lottie-web'

/** 旋转圆圈 Logo（Lottie）— 素材 public/assets/logo2.json
 *  (rotating_circles_lottie_loop)。默认静止在第 0 帧；hover 时播放循环
 *  旋转，移开停回第 0 帧。`autoplay` 让它一直循环。`white` 反色成白色，
 *  用于深色/渐变底（如收起悬浮球）。
 *
 *  直接用 lottie-web 的 loadAnimation（在 effect 里 dynamic import），
 *  绕开 lottie-react 在 vite 下的 CJS/ESM interop 问题。 */
export default function Logo2Lottie({
  className,
  white = false,
  autoplay = false,
}: {
  className?: string
  white?: boolean
  autoplay?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationItem | null>(null)
  const [ready, setReady] = useState(false)
  const filterClassName = white ? 'brightness-0 invert' : ''

  useEffect(() => {
    let destroyed = false
    let anim: AnimationItem | null = null
    Promise.all([
      import('lottie-web'),
      fetch('/assets/logo2.json').then((r) => r.json()),
    ])
      .then(([mod, data]) => {
        if (destroyed || !containerRef.current) return
        const lottie =
          (mod as unknown as { default?: LottiePlayer }).default ??
          (mod as unknown as LottiePlayer)
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay,
          animationData: data,
        })
        animRef.current = anim
        setReady(true)
      })
      .catch(() => {})
    return () => {
      destroyed = true
      anim?.destroy()
      animRef.current = null
    }
    // autoplay 固定不变；仅初始加载一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={['relative', className, filterClassName].filter(Boolean).join(' ')}
      onMouseEnter={() => {
        if (!autoplay) animRef.current?.goToAndPlay(0, true)
      }}
      onMouseLeave={() => {
        if (!autoplay) animRef.current?.goToAndStop(0, true)
      }}
    >
      {/* 素材四周留白较大，scale 放大裁掉边缘让圆圈铺满。 */}
      <div className="h-full w-full overflow-hidden">
        <div ref={containerRef} className="h-full w-full scale-[2.15]" />
      </div>
      {/* 加载完成前用静态 svg 占位（避免闪空）。 */}
      {!ready && (
        <img
          alt=""
          aria-hidden
          src="/assets/logo2.svg"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
    </div>
  )
}
