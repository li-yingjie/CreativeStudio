import { useState } from 'react'
import { ExternalLink, RotateCcw } from '@/shared/icons'

/**
 * Garuda 游戏预览
 *
 * 平台视图下 `web-game` 类目「预览」tab 的产物。直接挂 iframe
 * 跑 `/garuda/index.html` — 不再显示介绍 / 启动 splash，落进 tab
 * 即可玩。右上角浮两枚小按钮：重新加载 + 新窗口打开。
 */
export default function GarudaGamePreview() {
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <div className="relative h-full min-h-0 w-full bg-black">
      <iframe
        key={reloadKey}
        src="/garuda/index.html"
        title="Garuda · Apocalypse of Gods"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; gamepad"
      />
      <div className="pointer-events-none absolute right-3 top-3 flex gap-1.5">
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          title="重新加载"
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md bg-black/55 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
        >
          <RotateCcw size={13} strokeWidth={1.8} />
        </button>
        <a
          href="/garuda/index.html"
          target="_blank"
          rel="noopener noreferrer"
          title="在新窗口打开"
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-md bg-black/55 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
        >
          <ExternalLink size={13} strokeWidth={1.8} />
        </a>
      </div>
    </div>
  )
}
