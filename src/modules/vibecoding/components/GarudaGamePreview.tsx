import { memo, useState } from 'react'
import { RotateCcw, Play } from '@/shared/icons'

/**
 * Garuda 游戏预览
 *
 * 默认展示 start 页面（静态 Start.jpg），把游戏自身的「LOADING ASSETS」
 * 加载过程藏起来 —— 点击「开始游戏」才挂载 iframe（此时才真正加载并运行
 * /garuda/index.html）。右上角：重新加载。
 */
const START_POSTER = '/garuda/assets/Start.jpg'

function GarudaGamePreview() {
  const [reloadKey, setReloadKey] = useState(0)
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative h-full min-h-0 w-full bg-black">
      {playing ? (
        <iframe
          key={reloadKey}
          src="/garuda/index.html"
          title="Garuda · Apocalypse of Gods"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; gamepad"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex items-center justify-center"
          title="开始游戏"
        >
          <img src={START_POSTER} alt="Garuda 开始页面" className="h-full w-full object-contain" />
          <span className="absolute flex items-center gap-2 rounded-full bg-black/55 px-5 py-2.5 text-[14px] font-medium text-white backdrop-blur-md transition-transform group-hover:scale-105">
            <Play size={16} strokeWidth={2} className="fill-current" />
            开始游戏
          </span>
        </button>
      )}

      {playing && (
        <div className="pointer-events-none absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title="重新加载"
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md bg-black/55 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
          >
            <RotateCcw size={13} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(GarudaGamePreview)
