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

export type GameScreen = '开始界面' | '游戏进行中' | '结算界面'

export type GameEditTarget =
  | 'background'
  | 'primary-action'
  | 'secondary-action'
  | 'player'
  | 'enemies'
  | 'hud'
  | 'result-panel'
  | 'score-stats'

export interface GameEditSelection {
  screen: GameScreen
  target: GameEditTarget
  label: string
}

interface GarudaGamePreviewProps {
  screen?: string | null
  editing?: boolean
  selection?: GameEditSelection | null
  onSelect?: (selection: GameEditSelection | null) => void
}

function GameScreenArtwork({
  screen,
  editing = false,
  selection,
  onSelect,
}: {
  screen: GameScreen
  editing?: boolean
  selection?: GameEditSelection | null
  onSelect?: (selection: GameEditSelection | null) => void
}) {
  const selectTarget = (
    event: React.MouseEvent,
    target: GameEditTarget,
    label: string,
  ) => {
    if (!editing) return
    event.stopPropagation()
    onSelect?.({ screen, target, label })
  }
  const targetClass = (target: GameEditTarget) =>
    editing
      ? `cursor-pointer transition-[outline,box-shadow] hover:outline hover:outline-1 hover:outline-[#2e90fa]/80 ${
          selection?.target === target
            ? 'outline outline-2 outline-[#2e90fa] outline-offset-2'
            : ''
        }`
      : ''

  if (screen === '开始界面') {
    return (
      <div
        className={`relative h-full min-h-0 w-full overflow-hidden bg-black ${targetClass('background')}`}
        onClick={
          editing
            ? (event) => selectTarget(event, 'background', '开始页背景')
            : undefined
        }
      >
        <img
          src={START_POSTER}
          alt="Garuda 游戏开始界面"
          className="h-full w-full object-contain"
        />
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(event) => selectTarget(event, 'primary-action', '开始游戏按钮')}
            className={`rounded-full bg-orange-500 px-6 py-2.5 text-[14px] font-semibold text-black shadow-lg ${targetClass('primary-action')}`}
          >
            开始游戏
          </button>
          <button
            type="button"
            onClick={(event) => selectTarget(event, 'secondary-action', '排行榜按钮')}
            className={`rounded-full bg-black/75 px-4 py-1.5 text-[12px] text-white/85 ${targetClass('secondary-action')}`}
          >
            查看排行榜
          </button>
        </div>
      </div>
    )
  }

  if (screen === '游戏进行中') {
    return (
      <div
        className={`relative h-full min-h-0 w-full overflow-hidden bg-black ${targetClass('background')}`}
        onClick={
          editing
            ? (event) => selectTarget(event, 'background', '战斗场景')
            : undefined
        }
      >
        <img
          src={GAMEPLAY_POSTER}
          alt="Garuda 游戏进行中的实机画面"
          className="absolute left-1/2 top-0 h-full max-w-none -translate-x-1/2"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white/90">
          实机画面
        </span>
        {editing && (
          <>
            <button
              type="button"
              onClick={(event) => selectTarget(event, 'hud', '战斗 HUD')}
              className={`absolute inset-x-[8%] top-[3%] h-[13%] rounded-lg border border-dashed border-white/35 bg-black/10 text-[11px] text-white/80 ${targetClass('hud')}`}
            >
              HUD
            </button>
            <button
              type="button"
              onClick={(event) => selectTarget(event, 'enemies', '敌人与弹幕')}
              className={`absolute left-[18%] right-[18%] top-[24%] h-[32%] rounded-xl border border-dashed border-white/35 bg-black/10 text-[11px] text-white/80 ${targetClass('enemies')}`}
            >
              敌人与弹幕
            </button>
            <button
              type="button"
              onClick={(event) => selectTarget(event, 'player', '主角战机')}
              className={`absolute bottom-[12%] left-1/2 h-[24%] w-[30%] -translate-x-1/2 rounded-xl border border-dashed border-white/35 bg-black/10 text-[11px] text-white/80 ${targetClass('player')}`}
            >
              主角
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative h-full min-h-0 w-full overflow-hidden bg-black text-white ${targetClass('background')}`}
      onClick={
        editing
          ? (event) => selectTarget(event, 'background', '结算页背景')
          : undefined
      }
    >
      <img
        src={RESULT_POSTER}
        alt="Garuda 游戏结算界面背景"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div
        onClick={(event) => selectTarget(event, 'result-panel', '结算面板')}
        className={`absolute left-1/2 top-1/2 w-4/5 max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/80 p-6 text-center shadow-xl ${targetClass('result-panel')}`}
      >
        <p className="text-balance text-[13px] font-semibold text-orange-400">
          MISSION COMPLETE
        </p>
        <h3 className="mt-2 text-balance text-2xl font-bold">任务完成</h3>
        <p className="mt-1 text-pretty text-[12px] text-white/60">本次行动数据</p>
        <div
          onClick={(event) => selectTarget(event, 'score-stats', '结算数据')}
          className={`mt-5 grid grid-cols-3 gap-2 rounded-lg ${targetClass('score-stats')}`}
        >
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
          <button
            type="button"
            onClick={(event) => selectTarget(event, 'primary-action', '再来一局按钮')}
            className={`rounded-full bg-orange-500 px-5 py-2 text-[12px] font-semibold text-black ${targetClass('primary-action')}`}
          >
            再来一局
          </button>
          <button
            type="button"
            onClick={(event) => selectTarget(event, 'secondary-action', '返回首页按钮')}
            className={`rounded-full border border-white/20 bg-black/60 px-5 py-2 text-[12px] text-white/80 ${targetClass('secondary-action')}`}
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}

function GarudaGamePreview({
  screen,
  editing = false,
  selection,
  onSelect,
}: GarudaGamePreviewProps) {
  const [reloadKey, setReloadKey] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [editingScreen, setEditingScreen] = useState<GameScreen>('开始界面')

  const visualScreen: GameScreen | null =
    screen === '开始界面' || screen === '游戏进行中' || screen === '结算界面'
      ? screen
      : null

  if (visualScreen || editing) {
    const displayedScreen = visualScreen ?? editingScreen
    return (
      <div className="relative h-full min-h-0 w-full overflow-hidden">
        <GameScreenArtwork
          screen={displayedScreen}
          editing={editing}
          selection={selection}
          onSelect={onSelect}
        />
        {editing && !visualScreen && (
          <div
            role="group"
            aria-label="快速编辑页面"
            className="absolute left-3 top-3 z-50 flex rounded-lg border border-white/15 bg-black/65 p-0.5 text-white shadow-lg backdrop-blur-md"
          >
            {(['开始界面', '游戏进行中', '结算界面'] as GameScreen[]).map(
              (candidate) => (
                <button
                  key={candidate}
                  type="button"
                  aria-pressed={displayedScreen === candidate}
                  onClick={() => {
                    setEditingScreen(candidate)
                    onSelect?.(null)
                  }}
                  className="h-7 rounded-md px-2 text-[11px] text-white/60 transition-colors hover:text-white aria-pressed:bg-white/15 aria-pressed:text-white"
                >
                  {candidate === '游戏进行中' ? '战斗' : candidate.replace('界面', '')}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    )
  }

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
