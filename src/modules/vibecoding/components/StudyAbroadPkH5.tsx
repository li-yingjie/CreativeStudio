import { useEffect, useState } from 'react'
import { Check, ChevronRight, Gift, Sparkles } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import {
  H5LayoutEditorChrome,
  H5LayoutSelectionOverlay,
  useH5LayoutEditor,
  type H5LayoutOverrides,
  type H5SelectionBox,
} from './H5LayoutEditor'
import {
  STUDY_ABROAD_PK_EDITABLE_ITEMS,
  STUDY_ABROAD_PK_LAYOUT_STORAGE_KEY,
} from './StudyAbroadPkH5Model'
import './StudyAbroadPkH5.css'

/* eslint-disable react-hooks/refs -- the shared layout editor exposes stable ref/render helpers */

const ASSET_ROOT = '/assets/study-abroad-pk'

const taskLevels = [
  { className: 'basic', title: '基础任务', day: '7', detail: '7天内发布\n视频笔记数 ≥ 3', reward: '5000' },
  { className: 'advanced', title: '进阶任务', day: '14', detail: '14天内发布\n视频笔记数 ≥ 7', reward: '15000' },
  { className: 'sprint', title: '冲刺任务', day: '21', detail: '21天内发布\n视频笔记数 ≥ 10', reward: '20000' },
]

const lotteryItems = [
  { title: '留学生活记录奖', detail: '完成一篇真实、有信息量的留学生活笔记', category: '内容奖' },
  { title: '21 天连更挑战奖', detail: '完成活动期内的连续创作任务', category: '任务奖' },
  { title: '留学搭子同行奖', detail: '邀请朋友参与并完成一次有效互动', category: '互动奖' },
  { title: '百万播放冲刺奖', detail: '优质视频内容进入人气候选池', category: '内容奖' },
  { title: '年度留学创作者奖', detail: '综合内容相关性与互动数据评选', category: '任务奖' },
]

const filters = ['全部', '任务奖', '内容奖'] as const

export default function StudyAbroadPkH5({
  embedded = false,
  editing,
  state,
  selectedId,
  overrides,
  onSelectedIdChange,
  onOverridesChange,
  onSelectionBoxChange,
}: {
  embedded?: boolean
  editing?: boolean
  /** 工坊画布用它播种交互态，把「已报名 / 已领取」铺成并排的状态帧。 */
  state?: { registered?: boolean; claimed?: boolean }
  selectedId?: string | null
  overrides?: H5LayoutOverrides
  onSelectedIdChange?: (id: string | null) => void
  onOverridesChange?: (overrides: H5LayoutOverrides) => void
  onSelectionBoxChange?: (box: H5SelectionBox | null) => void
} = {}) {
  const [registered, setRegistered] = useState(state?.registered ?? false)
  const [claimed, setClaimed] = useState(state?.claimed ?? false)
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('全部')
  const editor = useH5LayoutEditor(STUDY_ABROAD_PK_LAYOUT_STORAGE_KEY, {
    enabled: editing,
    selectedId,
    overrides,
    onSelectedIdChange,
    onOverridesChange,
    onSelectionBoxChange,
  })

  useEffect(() => {
    if (embedded) return
    const previousTitle = document.title
    document.title = '留学 PK 赛｜H5 Benchmark'
    return () => { document.title = previousTitle }
  }, [embedded])

  const visibleItems = lotteryItems.filter(
    (item) => activeFilter === '全部' || item.category === activeFilter,
  )

  const register = () => {
    setRegistered(true)
    toast.success('报名成功，创作启动金已为你锁定')
  }

  const claimTask = () => {
    setClaimed(true)
    toast.success('任务已领取，去记录你的留学生活吧')
  }

  return (
    <div className={`study-pk-shell${embedded ? ' is-embedded' : ''}${editor.enabled ? ' is-editing' : ''}`}>
      <main ref={editor.pageRef} className="study-pk-page" onPointerDownCapture={editor.onCanvasPointerDownCapture}>
        <h1 className="study-pk-sr-only">小红书第一届留学 PK 赛</h1>

        <section className="study-pk-hero" aria-label="活动主视觉">
          <img
            src={`${ASSET_ROOT}/study-pk-hero-v1.jpg`}
            alt="小红书第一届留学 PK 赛，留子时髦生与独居老鼠留对决"
          />
        </section>

        <section className="study-pk-layer study-pk-recruitment" aria-labelledby="recruit-title">
          <img
            className="study-pk-foundation"
            src={`${ASSET_ROOT}/study-pk-recruitment-v1.jpg`}
            alt=""
            aria-hidden="true"
          />
          <div className="study-pk-intro-copy" {...editor.editProps('recruitment-copy', '招募介绍文案')}>
            <h2 id="recruit-title" className="study-pk-sr-only">注意，向全世界摇人</h2>
            <p>嘿留学生，</p>
            <p>无论你是特立独行“老鼠人”、</p>
            <p>海外分舵“中华小当家”</p>
            <p>还是旷野撒欢“街溜子”</p>
            <p className="study-pk-ellipsis">……</p>
            <strong>在小红书，让我们「留」在一起！</strong>
          </div>
          <div className="study-pk-recruit-copy" {...editor.editProps('audience-copy', '招募对象与权益')}>
            <strong>在读留学生 · 不限专业、不限地域</strong>
            <span>用 vlog 记录生活，分享真实的留学日常</span>
            <b>宗旨：整活、有创意、爱记录</b>
            <span>报名成功可获 5000 流量券，限量 1000 份</span>
          </div>
          <button
            type="button"
            className={`study-pk-image-button study-pk-register-button${registered ? ' is-done' : ''}`}
            onClick={register}
            {...editor.editProps('register-button', '报名按钮')}
          >
            <span className={`study-pk-state-icon${registered ? ' is-visible' : ''}`} aria-hidden="true">
              <Check size={17} />
            </span>
            <span>{registered ? '已报名' : '点击报名'}</span>
            <span className="study-pk-state-balance" aria-hidden="true" />
          </button>
        </section>

        <section className="study-pk-layer study-pk-howto" aria-labelledby="howto-title">
          <img
            className="study-pk-foundation study-pk-transparent-foundation"
            src={`${ASSET_ROOT}/study-pk-howto-tasks-v1.png`}
            alt=""
            aria-hidden="true"
          />
          <div className="study-pk-challenge-copy" {...editor.editProps('challenge-title', '21 天挑战标题')}>
            <span>随手就拍 · 连更挑战</span>
            <strong id="howto-title">#21天留学生存挑战</strong>
          </div>
          <div className="study-pk-pillow-copy study-pk-participation-copy" {...editor.editProps('participation-copy', '参与方式文案')}>
            <p>连续 21 天用视频记录留学生活碎片</p>
            <p>带话题 <b>#21天留学生存挑战</b> 发布 2 分钟以上视频笔记</p>
            <p>完成发稿任务，即可解锁对应惊喜奖励</p>
          </div>
          <div className="study-pk-pillow-copy study-pk-direction-copy" {...editor.editProps('direction-copy', '内容方向文案')}>
            <p>不限赛道、不限方向，随手即拍</p>
            <p>学习、租房、美食、通勤、文化碰撞都可以</p>
            <p>重要的是动起来，记录真实的你</p>
          </div>
        </section>

        <section className="study-pk-layer study-pk-rewards" aria-label="任务奖励">
          <img
            className="study-pk-foundation"
            src={`${ASSET_ROOT}/study-pk-task-rewards-v2.jpg`}
            alt=""
            aria-hidden="true"
          />
          <div className="study-pk-task-grid" {...editor.editProps('task-grid', '任务奖励三列')}>
            {taskLevels.map((task) => (
              <article className={`study-pk-task ${task.className}`} key={task.title}>
                <h3>{task.title}</h3>
                <b>{task.day}</b>
                <p>{task.detail}</p>
                <strong>{task.reward}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="study-pk-layer study-pk-gift" aria-labelledby="gift-title">
          <img
            className="study-pk-foundation"
            src={`${ASSET_ROOT}/study-pk-gift-v1.jpg`}
            alt=""
            aria-hidden="true"
          />
          <h2 id="gift-title" className="study-pk-sr-only">Bonus 奖励放送</h2>
          <div className="study-pk-gift-note study-pk-gift-note-one" {...editor.editProps('gift-note-1', '礼包条件一')}><Check />加入 vlog 薯官方<br />活动社群</div>
          <div className="study-pk-gift-note study-pk-gift-note-two" {...editor.editProps('gift-note-2', '礼包条件二')}><Check />活动期间粉丝量<br />实现 5w / 10w / 50w 跨级</div>
          <div className="study-pk-gift-note study-pk-gift-note-three" {...editor.editProps('gift-note-3', '礼包条件三')}><Check />完成挑战中的<br />任意创作任务</div>
          <div className="study-pk-gift-note study-pk-gift-note-four" {...editor.editProps('gift-note-4', '礼包说明')}>
            <strong>“vlog 作者官方礼包”</strong>
            <span>生活基金 · 创作周边 · 编辑推荐</span>
          </div>
          <button
            type="button"
            className={`study-pk-image-button study-pk-claim-button${claimed ? ' is-done' : ''}`}
            onClick={claimTask}
            {...editor.editProps('claim-button', '领取任务按钮')}
          >
            <span className={`study-pk-state-icon${claimed ? ' is-visible' : ''}`} aria-hidden="true">
              <Check size={17} />
            </span>
            <span>{claimed ? '已领取' : '点击领取任务'}</span>
            <span className="study-pk-state-balance" aria-hidden="true" />
          </button>
        </section>

        <section className="study-pk-layer study-pk-pk-panel" aria-labelledby="pk-title">
          <img
            className="study-pk-foundation"
            src={`${ASSET_ROOT}/study-pk-challenge-v1.jpg`}
            alt=""
            aria-hidden="true"
          />
          <h2 id="pk-title" className="study-pk-sr-only">留学 PK 赛进阶挑战</h2>
          <div className="study-pk-pk-rules" {...editor.editProps('pk-rules', '进阶挑战规则')}>
            <strong>区域个人奖评选规则</strong>
            <p>视频时长满足 2 分钟以上要求</p>
            <p>活动期间账号涨粉 1w+</p>
            <p>至少 1 篇视频达到百万播放</p>
            <small>* 内容相关性、互动质量与活动合规性将综合评选</small>
          </div>
        </section>

        <section className="study-pk-lottery" aria-labelledby="lottery-title">
          <div className="study-pk-layer study-pk-lottery-visual">
            <img
              className="study-pk-foundation"
              src={`${ASSET_ROOT}/study-pk-lottery-v1.jpg`}
              alt=""
              aria-hidden="true"
            />
            <h2 id="lottery-title" className="study-pk-sr-only">抽奖赢好礼</h2>
            <div className="study-pk-filter-tabs" aria-label="奖项筛选" {...editor.editProps('lottery-tabs', '奖项筛选标签')}>
              {filters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={activeFilter === filter ? 'is-active' : ''}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="study-pk-prize-list" {...editor.editProps('prize-list', '奖项列表')}>
            {visibleItems.map((item) => (
              <article className="study-pk-prize-row" key={item.title}>
                <span className="study-pk-prize-icon"><Gift size={18} /></span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                <button type="button" onClick={() => toast(`${item.title}：活动进行中`)}>
                  去查看<ChevronRight size={13} />
                </button>
              </article>
            ))}
          </div>

          <div className="study-pk-lottery-footer" {...editor.editProps('lottery-action', '抽奖行动区')}>
            <p>累计抽奖：0</p>
            <button type="button" onClick={() => toast('完成任一任务即可获得抽奖机会')}>
              <Sparkles size={16} /> 去抽奖
            </button>
            <small>活动奖品以实际发放为准</small>
          </div>
        </section>
      </main>
      {embedded ? (
        <H5LayoutSelectionOverlay
          items={STUDY_ABROAD_PK_EDITABLE_ITEMS}
          enabled={editor.enabled}
          selectedId={editor.selectedId}
          selectionBox={editor.selectionBox}
          onResizePointerDown={editor.onResizePointerDown}
        />
      ) : (
        <H5LayoutEditorChrome items={STUDY_ABROAD_PK_EDITABLE_ITEMS} {...editor} />
      )}
      <Toaster position="top-center" />
    </div>
  )
}
