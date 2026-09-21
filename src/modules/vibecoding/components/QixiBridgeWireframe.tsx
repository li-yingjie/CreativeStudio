import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Gift,
  RotateCcw,
  Share2,
  Users,
  X,
} from '@/shared/icons'
import {
  DEFAULT_QIXI_PAGE_CONTENT,
  type QixiPageContent,
  type QixiPageElementId,
  type QixiPageSelection,
  type QixiPageSection,
} from './QixiPageModel'
import { QIXI_LEVEL_ONE_TARGETS } from './QixiBridgeData'
import './QixiBridgeWireframe.css'

type Screen = 'home' | 'stage' | 'lottery' | 'details' | 'rules'
type EdgeState = 'loading' | 'network' | 'ended' | 'risk' | null
type StageResult = 'success' | 'failure' | null

type ActivityLog = {
  id: number
  label: string
  meta: string
  delta: string
}

const TARGETS = [
  { x: 16, y: 35 },
  { x: 73, y: 24 },
  { x: 45, y: 51 },
  { x: 84, y: 63 },
  { x: 24, y: 73 },
  { x: 57, y: 79 },
  { x: 9, y: 57 },
  { x: 68, y: 43 },
]

const LEVEL_TARGETS = [5, 6, 6, 7, 7, 8, 8]

function PlaceholderLines({ rows = 3 }: { rows?: number }) {
  return (
    <div className="qixi-wf-lines" aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <i key={index} style={{ width: `${92 - index * 12}%` }} />
      ))}
    </div>
  )
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="qixi-wf-subheader">
      <button type="button" onClick={onBack} aria-label="返回活动首页">
        <ArrowLeft />
      </button>
      <strong>{title}</strong>
      <span />
    </header>
  )
}

export default function QixiBridgeWireframe({
  editing = false,
  debugTools = false,
  selected = null,
  onSelect,
  content = DEFAULT_QIXI_PAGE_CONTENT,
}: {
  editing?: boolean
  /** Workbench-only state controls. Never expose production notes inside the activity UI. */
  debugTools?: boolean
  selected?: QixiPageSelection | null
  onSelect?: (selection: QixiPageSelection | null) => void
  content?: QixiPageContent
} = {}) {
  const stageSettledRef = useRef(false)
  const taskSectionRef = useRef<HTMLElement>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [edgeState, setEdgeState] = useState<EdgeState>(null)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareSent, setShareSent] = useState(false)
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const [stageResult, setStageResult] = useState<StageResult>(null)
  const [lotteryResult, setLotteryResult] = useState<'win' | 'empty' | null>(
    null,
  )
  const [notice, setNotice] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(1)
  const [lotteryChances, setLotteryChances] = useState(0)
  const [cleared, setCleared] = useState(0)
  const [level, setLevel] = useState(1)
  const [found, setFound] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(90)
  const [signed, setSigned] = useState(false)
  const [assistedFriends, setAssistedFriends] = useState(0)
  const [wrongTap, setWrongTap] = useState<{
    id: number
    x: number
    y: number
  } | null>(null)
  const [drawCount, setDrawCount] = useState(0)
  const [prizes, setPrizes] = useState<string[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([
    { id: 1, label: '首次参与奖励', meta: '刚刚', delta: '闯关机会 +1' },
  ])

  const targetCount = LEVEL_TARGETS[level - 1]
  const targetPositions = level === 1 ? QIXI_LEVEL_ONE_TARGETS : TARGETS
  const currentLevel = Math.min(cleared + 1, 7)
  const couponCount = Number(cleared >= 3) + Number(cleared >= 7)

  const addLog = useCallback((label: string, delta: string) => {
    setLogs((current) => [
      { id: Date.now(), label, meta: '刚刚', delta },
      ...current,
    ])
  }, [])

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 1800)
  }, [])

  const finishStage = useCallback(
    (result: Exclude<StageResult, null>) => {
      if (stageSettledRef.current) return
      stageSettledRef.current = true
      setStageResult(result)
      if (result === 'success') {
        setCleared((value) => Math.max(value, level))
        setLotteryChances((value) => value + 1)
        addLog(
          `完成第 ${level} 关`,
          level === 3 || level === 7 ? '优惠券 +1 · 抽奖 +1' : '抽奖次数 +1',
        )
      } else {
        addLog(`第 ${level} 关未完成`, '本次机会不返还')
      }
    },
    [addLog, level],
  )

  useEffect(() => {
    if (editing || screen !== 'stage' || stageResult || exitConfirmOpen) return
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0)
        finishStage('failure')
        return
      }
      setTimeLeft(timeLeft - 1)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [editing, exitConfirmOpen, finishStage, screen, stageResult, timeLeft])

  const startStage = (nextLevel = currentLevel) => {
    if (attempts <= 0) {
      showNotice('闯关机会不足，先完成任务')
      return
    }
    setAttempts((value) => value - 1)
    setLevel(nextLevel)
    setFound(new Set())
    setTimeLeft(90)
    stageSettledRef.current = false
    setStageResult(null)
    setExitConfirmOpen(false)
    setScreen('stage')
    addLog(`进入第 ${nextLevel} 关`, '闯关机会 -1')
  }

  const tapTarget = (index: number) => {
    if (stageResult || found.has(index)) return
    const next = new Set(found).add(index)
    setFound(next)
    if (next.size === targetCount) {
      window.setTimeout(() => finishStage('success'), 220)
    }
  }

  const tapWrongArea = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (stageResult) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const marker = {
      id: Date.now(),
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    }
    setWrongTap(marker)
    window.setTimeout(() => {
      setWrongTap((current) => (current?.id === marker.id ? null : current))
    }, 520)
  }

  const handlePrimaryAction = () => {
    if (cleared >= 7) {
      setScreen('details')
      return
    }
    if (attempts <= 0) {
      taskSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      showNotice('先完成签到或邀请，获得闯关机会')
      return
    }
    startStage()
  }

  const finishShare = () => {
    setShareOpen(false)
    setShareSent(false)
    if (assistedFriends >= 10) {
      showNotice('今日好友助力已达 10 人上限')
      return
    }
    setAssistedFriends((value) => value + 1)
    setAttempts((value) => value + 2)
    addLog('小舟帮你助力 1 次', '闯关机会 +2')
    showNotice('收到 1 位好友助力，闯关机会 +2')
  }

  const signIn = () => {
    if (signed) {
      showNotice('今日已签到，请明日再来')
      return
    }
    setSigned(true)
    setAttempts((value) => value + 2)
    addLog('完成每日签到', '闯关机会 +2')
    showNotice('签到成功，闯关机会 +2')
  }

  const drawLottery = () => {
    if (lotteryChances <= 0) {
      showNotice('暂无抽奖次数，通关后再来')
      return
    }
    const won = drawCount % 2 === 0
    setDrawCount((value) => value + 1)
    setLotteryChances((value) => value - 1)
    setLotteryResult(won ? 'win' : 'empty')
    if (won) setPrizes((value) => ['七夕心意礼', ...value])
    addLog('参与抽奖', won ? '获得七夕心意礼' : '谢谢参与')
  }

  const resetDemo = () => {
    setScreen('home')
    setEdgeState(null)
    setOnboardingOpen(true)
    setShareOpen(false)
    setShareSent(false)
    setExitConfirmOpen(false)
    setStageResult(null)
    setLotteryResult(null)
    setAttempts(1)
    setLotteryChances(0)
    setCleared(0)
    setLevel(1)
    setFound(new Set())
    setTimeLeft(90)
    stageSettledRef.current = false
    setSigned(false)
    setAssistedFriends(0)
    setDrawCount(0)
    setPrizes([])
    setLogs([
      {
        id: Date.now(),
        label: '首次参与奖励',
        meta: '刚刚',
        delta: '闯关机会 +1',
      },
    ])
  }

  const editSectionProps = (section: QixiPageSection) =>
    editing
      ? {
          'data-qixi-edit-section': section,
          'data-ref': `section.${section}`,
          'data-selected-section':
            selected?.type === 'section' && selected.section === section
              ? true
              : undefined,
          onClick: (event: ReactMouseEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            onSelect?.({ type: 'section', section })
          },
          onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            onSelect?.({ type: 'section', section })
          },
        }
      : {}

  const editElementProps = (
    section: QixiPageSection,
    element: QixiPageElementId,
    label: string,
  ) =>
    editing
      ? {
          'data-qixi-edit-element': element,
          'data-qixi-edit-label': label,
          'data-ref': element,
          'data-selected-element':
            selected?.type === 'element' && selected.element === element
              ? true
              : undefined,
          onClick: (event: ReactMouseEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            onSelect?.({ type: 'element', section, element })
          },
          onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            onSelect?.({ type: 'element', section, element })
          },
        }
      : {}

  const home = (
    <div className="qixi-wf-home">
      <section className="qixi-wf-hero" {...editSectionProps('hero')}>
        <div className="qixi-wf-top-actions">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            {...editElementProps('hero', 'hero.share', '分享按钮')}
          >
            <Share2 />
            {content.shareLabel}
          </button>
          <button
            type="button"
            onClick={() => setScreen('rules')}
            {...editElementProps('hero', 'hero.rules', '规则按钮')}
          >
            <FileText />
            {content.rulesLabel}
          </button>
        </div>
        <span
          className="qixi-wf-eyebrow"
          {...editElementProps('hero', 'hero.eyebrow', '活动日期')}
        >
          {content.eyebrow}
        </span>
        <h1 {...editElementProps('hero', 'hero.title', '活动主标题')}>
          {content.titleLine1}
          <br />
          {content.titleLine2}
        </h1>
        <span
          className="qixi-wf-kv-sample-tag"
          {...editElementProps('hero', 'hero.meta', '活动说明')}
        >
          {content.heroMeta}
        </span>
      </section>

      <section className="qixi-wf-bridge-card" {...editSectionProps('bridge')}>
        <div
          className="qixi-wf-section-title"
          {...editElementProps('bridge', 'bridge.header', '进度标题')}
        >
          <div>
            <span>{content.bridgeTitle}</span>
            <strong>{cleared} / 7 关</strong>
          </div>
          <button
            type="button"
            onClick={() => setScreen('details')}
            {...editElementProps('bridge', 'bridge.details', '活动明细按钮')}
          >
            {content.detailsLabel}
            <ChevronRight />
          </button>
        </div>
        <div
          className="qixi-wf-bridge"
          aria-label={`已完成 ${cleared} 关，共 7 关`}
          {...editElementProps('bridge', 'bridge.progress', '鹊桥进度组件')}
        >
          {Array.from({ length: 7 }, (_, index) => {
            const step = index + 1
            const complete = step <= cleared
            const reward = step === 3 || step === 7
            return (
              <div key={step} className={complete ? 'is-complete' : ''}>
                <i>{complete ? <Check /> : step}</i>
                {reward ? <small>{step === 3 ? '券 1' : '券 2'}</small> : null}
              </div>
            )
          })}
        </div>
        <div className="qixi-wf-primary-row">
          <button
            type="button"
            className="qixi-wf-primary"
            onClick={handlePrimaryAction}
            style={{
              background: content.primaryButtonBackground,
              color: content.primaryButtonColor,
              borderRadius: content.primaryButtonRadius,
            }}
            {...editElementProps('bridge', 'bridge.primary', '找喜鹊按钮')}
          >
            <strong>
              {cleared >= 7
                ? '查看活动结果'
                : attempts <= 0
                  ? '去得闯关机会'
                  : content.primaryLabel}
            </strong>
            <span>
              {cleared >= 7
                ? '7 关已全部完成'
                : attempts <= 0
                  ? '完成下方任务后再闯关'
                  : `当前闯关机会：${attempts} 次`}
            </span>
          </button>
          <button
            type="button"
            className="qixi-wf-lottery-entry"
            onClick={() => setScreen('lottery')}
            style={{
              background: content.lotteryButtonBackground,
              color: content.lotteryButtonColor,
              borderRadius: content.lotteryButtonRadius,
            }}
            {...editElementProps('bridge', 'bridge.lottery', '立即抽奖按钮')}
          >
            <Gift />
            <span>{content.lotteryLabel}</span>
            {lotteryChances > 0 ? <b>{lotteryChances}</b> : null}
          </button>
        </div>
      </section>

      <section
        ref={taskSectionRef}
        className="qixi-wf-card qixi-wf-tasks"
        {...editSectionProps('tasks')}
      >
        <div
          className="qixi-wf-section-title"
          {...editElementProps('tasks', 'tasks.header', '任务标题')}
        >
          <strong>{content.taskTitle}</strong>
          <span>{attempts} 次可用</span>
        </div>
        <div
          className="qixi-wf-task-row"
          {...editElementProps('tasks', 'tasks.signin', '每日签到任务')}
        >
          <span className="qixi-wf-task-icon">
            <Clock />
          </span>
          <div>
            <strong>{content.signInTitle}</strong>
            <small>{content.signInDescription}</small>
          </div>
          <button
            type="button"
            className={signed ? 'is-done' : ''}
            onClick={signIn}
            style={
              signed
                ? undefined
                : {
                    background: content.signInButtonBackground,
                    color: content.signInButtonColor,
                    borderRadius: content.signInButtonRadius,
                  }
            }
            {...editElementProps(
              'tasks',
              'tasks.signin.action',
              '签到按钮',
            )}
          >
            {signed ? '签到成功' : content.signInAction}
          </button>
        </div>
        <div
          className="qixi-wf-task-row"
          {...editElementProps('tasks', 'tasks.assist', '好友助力任务')}
        >
          <span className="qixi-wf-task-icon">
            <Users />
          </span>
          <div>
            <strong>
              {content.assistTitle}（{assistedFriends}/10）
            </strong>
            <small>{content.assistDescription}</small>
          </div>
          <button
            type="button"
            className={assistedFriends >= 10 ? 'is-done' : ''}
            style={
              assistedFriends >= 10
                ? undefined
                : {
                    background: content.assistButtonBackground,
                    color: content.assistButtonColor,
                    borderRadius: content.assistButtonRadius,
                  }
            }
            onClick={() =>
              assistedFriends >= 10
                ? showNotice('今日好友助力已达上限')
                : setShareOpen(true)
            }
            {...editElementProps(
              'tasks',
              'tasks.assist.action',
              '邀请按钮',
            )}
          >
            {assistedFriends >= 10 ? '已达上限' : content.assistAction}
          </button>
        </div>
      </section>

      <section
        className="qixi-wf-card qixi-wf-feed"
        {...editSectionProps('feed')}
      >
        <div
          className="qixi-wf-section-title"
          {...editElementProps('feed', 'feed.header', '助力动态标题')}
        >
          <strong>{content.feedTitle}</strong>
          <span>今日助力 {assistedFriends} 人</span>
        </div>
        {assistedFriends > 0 ? (
          <div
            className="qixi-wf-feed-row"
            {...editElementProps('feed', 'feed.content', '助力动态内容')}
          >
            <span className="qixi-wf-feed-avatar">舟</span>
            <div>
              <strong>小舟已完成助力</strong>
              <small>刚刚 · 今日第 {assistedFriends} 位好友</small>
            </div>
            <b>+2 次</b>
          </div>
        ) : (
          <div
            className="qixi-wf-feed-empty"
            {...editElementProps('feed', 'feed.content', '助力空状态')}
          >
            <span>
              <Users />
            </span>
            <div>
              <strong>{content.feedEmptyTitle}</strong>
              <small>{content.feedEmptyDescription}</small>
            </div>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              style={{
                background: content.feedButtonBackground,
                color: content.feedButtonColor,
                borderRadius: content.feedButtonRadius,
              }}
              {...editElementProps('feed', 'feed.action', '空状态邀请按钮')}
            >
              {content.feedAction}
            </button>
          </div>
        )}
      </section>
    </div>
  )

  const stage = (
    <div className="qixi-wf-stage">
      <header>
        <button
          type="button"
          onClick={() => setExitConfirmOpen(true)}
          aria-label="退出本关"
        >
          <ArrowLeft />
        </button>
        <div>
          <strong>第 {level} 关</strong>
          <span>
            已找到 {found.size} / {targetCount}
          </span>
        </div>
        <div className={timeLeft <= 10 ? 'is-urgent' : ''}>
          <Clock />
          <strong>{timeLeft}s</strong>
        </div>
      </header>
      <div
        className={`qixi-wf-stage-scene ${level === 1 ? 'is-visual-sample' : ''}`}
        onClick={tapWrongArea}
      >
        <span className="qixi-wf-scene-label">
          第 {level} 关 · {level === 1 ? '月下庭院' : '鹊影迷踪'}
        </span>
        {level === 1 ? null : (
          <>
            <div className="qixi-wf-branch qixi-wf-branch-a" />
            <div className="qixi-wf-branch qixi-wf-branch-b" />
          </>
        )}
        {targetPositions.slice(0, targetCount).map((position, index) => (
          <button
            type="button"
            key={index}
            className={`qixi-wf-target ${level === 1 ? 'is-baked-target' : ''} ${found.has(index) ? 'is-found' : ''}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            aria-label={`喜鹊 ${index + 1}${found.has(index) ? '，已找到' : ''}`}
            onClick={(event) => {
              event.stopPropagation()
              tapTarget(index)
            }}
          >
            <span>{level === 1 ? (found.has(index) ? '✓' : '') : '鹊'}</span>
          </button>
        ))}
        {wrongTap ? (
          <div
            className="qixi-wf-wrong"
            style={{ left: `${wrongTap.x}%`, top: `${wrongTap.y}%` }}
          >
            ×
          </div>
        ) : null}
      </div>
      <footer>小贴士：找到图中所有喜鹊即可闯关成功</footer>
    </div>
  )

  const lottery = (
    <div className="qixi-wf-page">
      <Header title="七夕好礼抽奖" onBack={() => setScreen('home')} />
      <section className="qixi-wf-lottery-hero">
        <span>可获得以下奖品</span>
        <div>
          {['特等奖', '一等奖', '二等奖'].map((item) => (
            <i key={item}>
              <Gift />
              <strong>{item}</strong>
            </i>
          ))}
        </div>
      </section>
      <section className="qixi-wf-draw-machine">
        {Array.from({ length: 6 }, (_, index) => (
          <i key={index}>{index === 1 ? <Gift /> : index + 1}</i>
        ))}
        <button type="button" onClick={drawLottery}>
          <strong>立即抽奖</strong>
          <span>剩余 {lotteryChances} 次</span>
        </button>
      </section>
      <section className="qixi-wf-card qixi-wf-prizes">
        <div className="qixi-wf-section-title">
          <strong>我的奖品</strong>
          <span>全部</span>
        </div>
        {prizes.length === 0 ? (
          <div className="qixi-wf-empty">
            <Gift />
            <span>暂未获得奖品</span>
            <small>通关后获得抽奖机会</small>
          </div>
        ) : (
          prizes.map((prize, index) => (
            <div className="qixi-wf-prize-row" key={`${prize}-${index}`}>
              <i>
                <Gift />
              </i>
              <div>
                <strong>{prize}</strong>
                <small>使用期限以奖品详情为准</small>
              </div>
              <button type="button">去使用</button>
            </div>
          ))
        )}
      </section>
    </div>
  )

  const details = (
    <div className="qixi-wf-page">
      <Header title="活动明细" onBack={() => setScreen('home')} />
      <div className="qixi-wf-detail-summary">
        <div>
          <strong>{attempts}</strong>
          <span>闯关机会</span>
        </div>
        <div>
          <strong>{lotteryChances}</strong>
          <span>抽奖次数</span>
        </div>
        <div>
          <strong>{couponCount}</strong>
          <span>已得优惠券</span>
        </div>
      </div>
      <section className="qixi-wf-detail-list">
        {logs.map((item) => (
          <div key={item.id}>
            <i />
            <span>
              <strong>{item.label}</strong>
              <small>{item.meta}</small>
            </span>
            <b>{item.delta}</b>
          </div>
        ))}
      </section>
    </div>
  )

  const rules = (
    <div className="qixi-wf-page">
      <Header title="活动规则" onBack={() => setScreen('home')} />
      <article className="qixi-wf-rules">
        <section className="qixi-wf-rules-hero">
          <span>活动时间</span>
          <strong>8 月 15 日—8 月 19 日</strong>
          <h2>找到喜鹊，搭成鹊桥</h2>
          <p>
            获得闯关机会后，在 90 秒内找出场景中的全部喜鹊。完成 7
            关，即可搭成完整鹊桥。
          </p>
          <div>
            <span>
              <b>7</b> 个关卡
            </span>
            <span>
              <b>90</b> 秒 / 关
            </span>
            <span>
              <b>2</b> 个券奖励节点
            </span>
          </div>
        </section>

        <section className="qixi-wf-rule-section">
          <h3>
            <i>01</i> 如何获得闯关机会
          </h3>
          <ul className="qixi-wf-rule-list">
            <li>
              <strong>首次参与</strong>
              <span>首次进入活动可获得 1 次闯关机会。</span>
            </li>
            <li>
              <strong>每日签到</strong>
              <span>每天完成签到可获得 2 次闯关机会。</span>
            </li>
            <li>
              <strong>好友助力</strong>
              <span>每位好友助力可获得 2 次，每日最多计入 10 位好友。</span>
            </li>
          </ul>
        </section>

        <section className="qixi-wf-rule-section">
          <h3>
            <i>02</i> 闯关与奖励
          </h3>
          <ol className="qixi-wf-rule-steps">
            <li>
              <span>1</span>
              <div>
                <strong>进入关卡</strong>
                <p>
                  每次进入消耗 1
                  次闯关机会；中途退出或倒计时结束，本次机会不返还。
                </p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>完成找鹊</strong>
                <p>
                  在规定时间内找到本关全部喜鹊即为通关，并获得 1 次抽奖机会。
                </p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>解锁阶段奖励</strong>
                <p>
                  完成第 3 关解锁第一张消费券，完成第 7 关解锁第二张消费券。
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="qixi-wf-rule-section">
          <h3>
            <i>03</i> 抽奖与奖品
          </h3>
          <p>
            通关后获得的抽奖机会可在“立即抽奖”页面使用。中奖结果与已获得奖品会保存在“我的奖品”中，优惠券面额、适用范围与有效期以领取后的券面说明为准。
          </p>
        </section>

        <section className="qixi-wf-rule-section">
          <h3>
            <i>04</i> 记录与说明
          </h3>
          <ul className="qixi-wf-rule-notes">
            <li>闯关机会、通关、奖励和抽奖结果均可在活动明细中查看。</li>
            <li>同一账号每日获得的好友助力次数以活动页面实际记录为准。</li>
            <li>如遇网络异常，请重新进入活动后查看最新记录。</li>
          </ul>
        </section>

        <footer className="qixi-wf-rules-footer">
          <div>
            <strong>想确认机会或奖励记录？</strong>
            <span>进入活动明细查看每一次变化</span>
          </div>
          <button type="button" onClick={() => setScreen('details')}>
            查看活动明细
            <ChevronRight />
          </button>
        </footer>
      </article>
    </div>
  )

  const displayScreen = editing ? 'home' : screen
  const activeScreen =
    displayScreen === 'home'
      ? home
      : displayScreen === 'stage'
        ? stage
        : displayScreen === 'lottery'
          ? lottery
          : displayScreen === 'details'
            ? details
            : rules

  const edgeContent = useMemo(() => {
    if (!edgeState) return null
    if (edgeState === 'loading') {
      return (
        <div className="qixi-wf-edge qixi-wf-edge-loading">
          <RotateCcw />
          <strong>活动加载中</strong>
          <PlaceholderLines rows={4} />
          <button type="button" onClick={() => setEdgeState(null)}>
            完成加载
          </button>
        </div>
      )
    }
    const copy = {
      network: ['网络连接异常', '请检查网络后重试', '重新加载'],
      ended: ['活动已结束', '获得的奖品仍可在活动明细中查看', '查看活动明细'],
      risk: ['活动太火爆了', '请稍后再试', '返回正常状态'],
    }[edgeState]
    return (
      <div className="qixi-wf-edge">
        <span>!</span>
        <strong>{copy[0]}</strong>
        <p>{copy[1]}</p>
        <button
          type="button"
          onClick={() => {
            setEdgeState(null)
            if (edgeState === 'ended') setScreen('details')
          }}
        >
          {copy[2]}
        </button>
      </div>
    )
  }, [edgeState])

  return (
    <div
      className={`qixi-wf-root ${editing ? 'is-editing' : ''} ${debugTools ? 'has-debug-tools' : ''}`}
    >
      {debugTools ? (
        <div className="qixi-wf-prototype-bar">
          <span>活动调试</span>
          <div>
            <button
              type="button"
              onClick={() => setStatusMenuOpen((value) => !value)}
            >
              状态
            </button>
            <button
              type="button"
              aria-label="重置活动状态"
              title="重置活动状态"
              onClick={resetDemo}
            >
              <RotateCcw />
            </button>
          </div>
          {!editing && statusMenuOpen ? (
            <div className="qixi-wf-status-menu">
              <strong>边际状态预览</strong>
              {(
                [
                  ['loading', '加载中'],
                  ['network', '网络异常'],
                  ['ended', '活动结束'],
                  ['risk', '风控兜底'],
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => {
                    setEdgeState(value)
                    setStatusMenuOpen(false)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="qixi-wf-body">{activeScreen}</div>
      {editing ? null : edgeContent}
      {!editing && notice ? (
        <div className="qixi-wf-toast" role="status">
          {notice}
        </div>
      ) : null}

      {!editing && onboardingOpen ? (
        <div
          className="qixi-wf-modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="首次参与奖励"
        >
          <div className="qixi-wf-modal">
            <span className="qixi-wf-modal-mark">+1</span>
            <h2>恭喜获得首次奖励</h2>
            <p>送你 1 次闯关机会</p>
            <button
              type="button"
              className="qixi-wf-confirm"
              onClick={() => setOnboardingOpen(false)}
            >
              收下机会
            </button>
          </div>
        </div>
      ) : null}

      {!editing && exitConfirmOpen ? (
        <div
          className="qixi-wf-modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="确认退出本关"
        >
          <div className="qixi-wf-modal">
            <button
              type="button"
              className="qixi-wf-modal-close"
              onClick={() => setExitConfirmOpen(false)}
              aria-label="关闭"
            >
              <X />
            </button>
            <h2>确认退出本关？</h2>
            <p>退出将视为闯关失败，本次闯关机会不会返还。</p>
            <div className="qixi-wf-modal-actions">
              <button type="button" onClick={() => setExitConfirmOpen(false)}>
                继续找
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => {
                  setExitConfirmOpen(false)
                  finishStage('failure')
                }}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!editing && stageResult ? (
        <div
          className="qixi-wf-modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label={stageResult === 'success' ? '闯关成功' : '闯关失败'}
        >
          <div className="qixi-wf-modal qixi-wf-result-modal">
            <span className="qixi-wf-modal-mark">
              {stageResult === 'success' ? '✓' : '—'}
            </span>
            <h2>
              {stageResult === 'success'
                ? '太棒了，解救成功'
                : '差一点就成功了'}
            </h2>
            <p>
              {stageResult === 'success'
                ? level === 3 || level === 7
                  ? '获得优惠券和 1 次抽奖机会'
                  : '获得 1 次抽奖机会'
                : '再接再厉，离找到所有喜鹊就差一步啦'}
            </p>
            <div className="qixi-wf-modal-actions">
              <button
                type="button"
                onClick={() => {
                  setStageResult(null)
                  setScreen('home')
                }}
              >
                回首页查看
              </button>
              <button
                type="button"
                className="qixi-wf-confirm"
                onClick={() => {
                  const completedFinalLevel =
                    stageResult === 'success' && level >= 7
                  setStageResult(null)
                  if (completedFinalLevel) setScreen('home')
                  else if (attempts > 0)
                    startStage(stageResult === 'success' ? level + 1 : level)
                  else setScreen('home')
                }}
              >
                {stageResult === 'success' && level >= 7
                  ? '查看活动结果'
                  : attempts > 0
                    ? stageResult === 'success'
                      ? '继续下一关'
                      : '再试一次'
                    : '去得闯关机会'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!editing && shareOpen ? (
        <div
          className="qixi-wf-sheet-layer"
          role="dialog"
          aria-modal="true"
          aria-label="邀请好友助力"
        >
          <button
            type="button"
            className="qixi-wf-sheet-mask"
            onClick={() => setShareOpen(false)}
            aria-label="关闭分享面板"
          />
          <div className="qixi-wf-sheet">
            <div className="qixi-wf-sheet-handle" />
            <h2>{shareSent ? '邀请已发出' : '邀请好友助力'}</h2>
            {shareSent ? (
              <>
                <p>好友完成助力后，再次进入活动会收到机会。</p>
                <button
                  type="button"
                  className="qixi-wf-confirm"
                  onClick={() => {
                    setShareOpen(false)
                    setShareSent(false)
                    showNotice('邀请已发出，好友助力后会通知你')
                  }}
                >
                  完成
                </button>
                {debugTools ? (
                  <button
                    type="button"
                    className="qixi-wf-debug-link"
                    onClick={finishShare}
                  >
                    模拟好友回流
                  </button>
                ) : null}
              </>
            ) : (
              <div className="qixi-wf-share-options">
                {['抖音好友', '复制口令', '保存二维码'].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setShareSent(true)}
                  >
                    <span>
                      <Share2 />
                    </span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {!editing && lotteryResult ? (
        <div
          className="qixi-wf-modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="抽奖结果"
        >
          <div className="qixi-wf-modal">
            <span className="qixi-wf-modal-mark">
              <Gift />
            </span>
            <h2>
              {lotteryResult === 'win' ? '恭喜抽中七夕心意礼' : '谢谢参与'}
            </h2>
            <p>
              {lotteryResult === 'win'
                ? '奖品已放入“我的奖品”'
                : '完成下一关可再获得抽奖机会'}
            </p>
            <button
              type="button"
              className="qixi-wf-confirm"
              onClick={() => setLotteryResult(null)}
            >
              {lotteryResult === 'win' ? '立即查看' : '我知道了'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const PAGE_SPECS = [
  ['活动首页', '进度 · 任务 · 抽奖入口'],
  ['找喜鹊关卡', '7 个场景共用页面模板'],
  ['通关结果', '普通奖励 / 券奖励'],
  ['失败结果', '重试 / 去得机会'],
  ['任务与分享', '签到 · 邀好友 · 回流'],
  ['抽奖页面', '奖池 · 抽奖 · 我的奖品'],
  ['明细与规则', '记录 · 规则 · 边际状态'],
] as const

export function QixiWireframeBoard() {
  return (
    <div className="qixi-wf-board">
      <header>
        <div>
          <span>交互框架</span>
          <h1>七夕搭鹊桥 · 页面矩阵</h1>
        </div>
        <p>7 个页面族 · 1 套复用模板 · 主 KV / 第 1 关样张已生成</p>
      </header>
      <div className="qixi-wf-board-grid">
        {PAGE_SPECS.map(([title, description], index) => (
          <article key={title}>
            <div className="qixi-wf-mini-frame">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <i />
              <i />
              <div>
                <i />
                <i />
                <i />
              </div>
              <button type="button" tabIndex={-1}>
                主操作
              </button>
            </div>
            <strong>{title}</strong>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <footer>
        <span>下一确认点</span>
        <strong>
          先试玩第 1 关的识别度与命中反馈，通过后再批量生成其余 6 关。
        </strong>
      </footer>
    </div>
  )
}

export function QixiAssetPlaceholder({
  directionLocked = true,
  sampleReady = true,
}: {
  directionLocked?: boolean
  sampleReady?: boolean
}) {
  if (directionLocked && sampleReady) {
    return (
      <div className="qixi-wf-assets-empty qixi-wf-assets-sample">
        <span>当前阶段 · 联合样张已落位</span>
        <h1>主 KV + 第 1 关已生成，尚未批量出图</h1>
        <p>
          这两张样张只用来共同验证活动识别与找图体验。当前完成 1 / 7
          关；通过试玩后，再沿同一约束生成其余素材。
        </p>
        <section className="qixi-wf-sample-grid">
          <figure>
            <img
              src="/assets/qixi/home-kv-v1.webp"
              alt="现代东方月夜剪纸主视觉样张"
            />
            <figcaption>
              <strong>活动主 KV · v1</strong>
              <span>标题安全区 · 鹊羽叠桥 · 金额不入图</span>
            </figcaption>
          </figure>
          <figure>
            <img
              src="/assets/qixi/level-01-v1.webp"
              alt="月夜园林找喜鹊第一关样张"
            />
            <figcaption>
              <strong>第 1 关 · v1</strong>
              <span>5 只喜鹊 · 背景内融合 · 热区前端分离</span>
            </figcaption>
          </figure>
        </section>
        <div>
          {[
            ['活动主视觉 KV', '样张已生成'],
            ['7 张找喜鹊关卡场景', '1 / 7 已生成'],
            ['鹊桥进度与奖励节点', '待生成'],
            ['抽奖奖品与弹窗', '待生成'],
            ['分享图与入口资源位', '待生成'],
          ].map(([item, status]) => (
            <i key={item}>
              {item}
              <small>{status}</small>
            </i>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="qixi-wf-assets-empty">
      <span>
        {directionLocked
          ? '当前阶段 · 视觉方向提案已采用'
          : '设计风格确认 · 3 个候选方向'}
      </span>
      <h1>
        {directionLocked
          ? '方向已选，联合样张尚未生成'
          : '先看图，再确定活动的整体气质'}
      </h1>
      <p>
        {directionLocked
          ? 'Agent 推荐现代东方月夜剪纸。下一步先出主 KV 与第 1 关联合样张，通过后再按页面槽位批量生成。'
          : '三张图只用于比较色彩、材质和氛围，不是正式 KV。确认后，首页、关卡和奖励素材都会沿同一方向继续生成。'}
      </p>
      {directionLocked ? (
        <section className="qixi-wf-direction-card">
          <span>Agent 方向提案已采用</span>
          <strong>现代东方月夜剪纸</strong>
          <p>黛蓝月夜 · 米白月盘 · 朱砂奖励节点 · 鹊羽层层叠成桥</p>
        </section>
      ) : (
        <section className="qixi-wf-style-candidates" aria-label="设计风格候选素材">
          {[
            {
              title: '现代东方月夜剪纸',
              image: '/assets/qixi/level-01-v1.webp',
              desc: '黛蓝月夜 · 纸雕层次 · 鹊羽叠桥',
              recommended: true,
            },
            {
              title: '甜美元气粉紫',
              image: '/assets/qixi/style-sweet-v1.jpg',
              desc: '粉紫灯彩 · Q 版喜鹊 · 轻社交',
            },
            {
              title: '写实城市夜景',
              image: '/assets/qixi/style-city-v1.jpg',
              desc: '城市蓝调 · 写实光影 · 成熟沉浸',
            },
          ].map((candidate) => (
            <figure key={candidate.title}>
              <img src={candidate.image} alt={`${candidate.title}风格样张`} />
              <figcaption>
                <span>{candidate.recommended ? 'Agent 推荐' : '备选方向'}</span>
                <strong>{candidate.title}</strong>
                <small>{candidate.desc}</small>
              </figcaption>
            </figure>
          ))}
        </section>
      )}
      {directionLocked ? (
        <div>
          {[
            '活动主视觉 KV',
            '7 张找喜鹊关卡场景',
            '鹊桥进度与奖励节点',
            '抽奖奖品与弹窗',
            '分享图与入口资源位',
          ].map((item) => (
            <i key={item}>
              {item}
              <small>待视觉确认</small>
            </i>
          ))}
        </div>
      ) : null}
    </div>
  )
}
