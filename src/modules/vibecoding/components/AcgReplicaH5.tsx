import { useEffect, useRef, useState } from 'react'
import './AcgReplicaH5.css'

/* ─── 「ACG 新春会」主会场 — 一比一复刻 ───
 * 视觉稿：Figma PxXGus8deG2BZ3xQLUFl0u（主画板 1-369，750 × 9776）。
 * 做法与「这夏夯爆了」一致：设计稿原始分辨率切片装配画面，交互热区
 * 叠在切片之上；坐标一律用设计稿像素，渲染时按 750→375 折半换算。 */

const S = 0.5

const STRIP_HEIGHTS = [1600, 1600, 1600, 1600, 1600, 1600, 176]
const PAGE_H = STRIP_HEIGHTS.reduce((a, b) => a + b, 0)

type HotKind = 'press' | 'vote-down' | 'vote-up' | 'follow'

type Hotspot = {
  id: string
  x: number
  y: number
  w: number
  h: number
  kind: HotKind
  toast?: string
  round?: boolean
}

/** 抓马榜 TOP3 + 抓马赛场 5 张卡的投票按钮行 y 坐标（设计稿像素）。 */
const VOTE_ROWS = [2938, 3274, 3610, 4126, 4462, 4798, 5134, 5470]

/** 任务区 6 行「去关注」按钮的行 y 坐标。 */
const FOLLOW_ROWS = [8036, 8196, 8356, 8516, 8676, 8836]

const HOTSPOTS: Hotspot[] = [
  { id: 'back', x: 20, y: 108, w: 84, h: 84, kind: 'press', toast: '返回上一页', round: true },
  { id: 'share', x: 646, y: 108, w: 84, h: 84, kind: 'press', toast: '唤起分享面板', round: true },
  { id: 'rules', x: 662, y: 212, w: 64, h: 64, kind: 'press', toast: '活动规则', round: true },
  { id: 'hall-game', x: 0, y: 578, w: 172, h: 152, kind: 'press', toast: '前往游戏会场' },
  { id: 'hall-acg', x: 576, y: 578, w: 174, h: 152, kind: 'press', toast: '前往二次元会场' },
  { id: 'phase-gala', x: 20, y: 770, w: 200, h: 110, kind: 'press', toast: '新春晚会 2月9日开启' },
  { id: 'phase-now', x: 270, y: 756, w: 210, h: 130, kind: 'press', toast: '当前阶段：开年高燃' },
  { id: 'phase-wanxiang', x: 530, y: 770, w: 200, h: 110, kind: 'press', toast: '万象风华 1月20日开启' },
  { id: 'video', x: 20, y: 958, w: 710, h: 400, kind: 'press', toast: '播放篇章视频' },
  { id: 'rank-btn-1', x: 64, y: 1786, w: 300, h: 96, kind: 'press', toast: '游戏年度榜单' },
  { id: 'rank-btn-2', x: 386, y: 1786, w: 300, h: 96, kind: 'press', toast: '游戏年度榜单' },
  ...VOTE_ROWS.flatMap((y, i): Hotspot[] => [
    { id: `vote-down-${i}`, x: 280, y, w: 190, h: 68, kind: 'vote-down' },
    { id: `vote-up-${i}`, x: 472, y, w: 220, h: 68, kind: 'vote-up' },
  ]),
  { id: 'send-work', x: 62, y: 5598, w: 268, h: 80, kind: 'press', toast: '去发布作品' },
  { id: 'view-work', x: 420, y: 5598, w: 268, h: 80, kind: 'press', toast: '查看入围作品' },
  { id: 'wish-rule', x: 566, y: 5984, w: 122, h: 52, kind: 'press', toast: '许愿奖励规则' },
  { id: 'like-1', x: 326, y: 6236, w: 136, h: 72, kind: 'press', toast: '已点赞这条愿望 ❤' },
  { id: 'like-2', x: 178, y: 6486, w: 136, h: 72, kind: 'press', toast: '已点赞这条愿望 ❤' },
  { id: 'book-live', x: 62, y: 6618, w: 288, h: 84, kind: 'press', toast: '已预约春晚直播' },
  { id: 'make-wish', x: 404, y: 6618, w: 288, h: 84, kind: 'press', toast: '打开许愿编辑器' },
  { id: 'pool-info', x: 278, y: 7058, w: 194, h: 60, kind: 'press', toast: '查看奖池信息' },
  { id: 'my-prizes', x: 404, y: 7484, w: 168, h: 64, kind: 'press', toast: '我的奖品' },
  { id: 'draw', x: 206, y: 7576, w: 338, h: 136, kind: 'press', toast: '抽中「新春限定头像挂件」（演示）' },
  ...FOLLOW_ROWS.map((y, i): Hotspot => ({ id: `follow-${i}`, x: 574, y, w: 130, h: 66, kind: 'follow' })),
  { id: 'expand-tasks', x: 264, y: 8944, w: 222, h: 66, kind: 'press', toast: '已完成任务（演示为空）' },
  { id: 'entry-game', x: 32, y: 9118, w: 686, h: 146, kind: 'press', toast: '跳转游戏榜单' },
  { id: 'entry-acg', x: 32, y: 9288, w: 686, h: 146, kind: 'press', toast: '跳转二次元榜单' },
  { id: 'pc-search', x: 288, y: 9552, w: 434, h: 96, kind: 'press', toast: '抖音搜索：新春环游记' },
]

type Bubble = { key: number; x: number; y: number; text: string; tone: 'up' | 'down' }

export default function AcgReplicaH5() {
  const [followed, setFollowed] = useState<Set<number>>(() => new Set())
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const bubbleKey = useRef(0)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const showToast = (text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1600)
  }

  const spawnBubble = (spot: Hotspot, text: string, tone: Bubble['tone']) => {
    const key = ++bubbleKey.current
    setBubbles((prev) => [
      ...prev,
      { key, x: (spot.x + spot.w / 2) * S, y: spot.y * S, text, tone },
    ])
    window.setTimeout(
      () => setBubbles((prev) => prev.filter((b) => b.key !== key)),
      950,
    )
  }

  const onHot = (spot: Hotspot) => {
    if (spot.kind === 'vote-up') {
      spawnBubble(spot, '+3 马力', 'up')
      return
    }
    if (spot.kind === 'vote-down') {
      spawnBubble(spot, '-1 马力', 'down')
      return
    }
    if (spot.kind === 'follow') {
      const index = FOLLOW_ROWS.indexOf(spot.y)
      setFollowed((prev) => {
        const next = new Set(prev)
        if (!next.has(index)) next.add(index)
        return next
      })
      showToast('关注成功，抽奖机会 +1')
      return
    }
    if (spot.toast) showToast(spot.toast)
  }

  return (
    <div className="acgr-root">
      <div className="acgr-page" style={{ height: PAGE_H * S }}>
        {STRIP_HEIGHTS.map((h, i) => (
          <img
            key={i}
            className="acgr-strip"
            src={`/assets/acg-replica/strip-${String(i + 1).padStart(2, '0')}.webp`}
            alt={`主会场切片 ${i + 1}`}
            style={{ height: h * S }}
            draggable={false}
            loading={i > 1 ? 'lazy' : 'eager'}
          />
        ))}

        {HOTSPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            className={`acgr-hot${spot.round ? ' is-round' : ''}`}
            aria-label={spot.toast ?? spot.id}
            style={{
              left: spot.x * S,
              top: spot.y * S,
              width: spot.w * S,
              height: spot.h * S,
            }}
            onClick={() => onHot(spot)}
          />
        ))}

        {/* 关注后的状态盖层：盖住切片里烘死的红色「去关注」。 */}
        {FOLLOW_ROWS.map((y, i) =>
          followed.has(i) ? (
            <span
              key={`followed-${i}`}
              className="acgr-followed"
              style={{ left: 570 * S, top: (y - 4) * S, width: 138 * S, height: 74 * S }}
            >
              <i>已关注</i>
            </span>
          ) : null,
        )}

        {bubbles.map((b) => (
          <span
            key={b.key}
            className={`acgr-bubble is-${b.tone}`}
            style={{ left: b.x, top: b.y }}
          >
            {b.text}
          </span>
        ))}
      </div>

      {toast ? <div className="acgr-toast">{toast}</div> : null}
    </div>
  )
}
