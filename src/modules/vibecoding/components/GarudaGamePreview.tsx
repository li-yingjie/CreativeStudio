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
const GAMEPLAY_POSTER = '/garuda/docs/garuda-gameplay-showcase.png'
const RESULT_POSTER = '/garuda/docs/garuda-key-art.png'

type GameScreen = '开始界面' | '游戏进行中' | '结算界面'

function GameScreenArtwork({ screen }: { screen: GameScreen }) {
  if (screen === '开始界面') {
    return (
      <div className="relative h-full min-h-0 w-full overflow-hidden bg-black">
        <img
          src={START_POSTER}
          alt="Garuda 游戏开始界面"
          className="h-full w-full object-contain"
        />
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2">
          <span className="rounded-full bg-orange-500 px-6 py-2.5 text-[14px] font-semibold text-black shadow-lg">
            开始游戏
          </span>
          <span className="rounded-full bg-black/75 px-4 py-1.5 text-[12px] text-white/85">
            查看排行榜
          </span>
        </div>
      </div>
    )
  }

  if (screen === '游戏进行中') {
    return (
      <div className="relative h-full min-h-0 w-full overflow-hidden bg-black">
        <img
          src={GAMEPLAY_POSTER}
          alt="Garuda 游戏进行中的实机画面"
          className="absolute left-1/2 top-0 h-full max-w-none -translate-x-1/2"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white/90">
          实机画面
        </span>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-black text-white">
      <img
        src={RESULT_POSTER}
        alt="Garuda 游戏结算界面背景"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute left-1/2 top-1/2 w-4/5 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/80 p-6 text-center shadow-xl">
        <p className="text-balance text-[13px] font-semibold text-orange-400">
          MISSION COMPLETE
        </p>
        <h3 className="mt-2 text-balance text-2xl font-bold">任务完成</h3>
        <p className="mt-1 text-pretty text-[12px] text-white/60">本次行动数据</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ['128,450', '本局得分'],
            ['12', '到达波次'],
            ['10:14', '存活时间'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-white/10 px-2 py-3">
              <div className="tabular-nums text-[17px] font-semibold text-orange-300">{value}</div>
              <div className="mt-1 text-[10px] text-white/50">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-2">
          <span className="rounded-full bg-orange-500 px-5 py-2 text-[12px] font-semibold text-black">
            再来一局
          </span>
          <span className="rounded-full border border-white/20 bg-black/60 px-5 py-2 text-[12px] text-white/80">
            返回首页
          </span>
        </div>
      </div>
    </div>
  )
}

function GarudaGamePreview({ screen }: { screen?: string | null }) {
  const [reloadKey, setReloadKey] = useState(0)
  const [playing, setPlaying] = useState(false)

  const visualScreen: GameScreen | null =
    screen === '开始界面' || screen === '游戏进行中' || screen === '结算界面'
      ? screen
      : null

  if (visualScreen) return <GameScreenArtwork screen={visualScreen} />

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
