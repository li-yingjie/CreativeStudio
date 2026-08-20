import { ArrowRight } from '@/shared/icons'
import {
  AssistantMessage,
  ToolStatus,
  type BuildCard,
} from '../XiahuaChatUI'
import type {
  TowerDefenseFlowState,
  TowerDefenseStage,
} from './TowerDefenseFlowModel'

interface TowerDefenseFlowChatProps {
  stage: TowerDefenseStage
  onOpenStage: (stage: TowerDefenseStage) => void
  /** 打开该阶段沉淀的文档；旧调用方缺省时仍回到对应工作区。 */
  onOpenDeliverable?: (stage: TowerDefenseStage) => void
  /** 有运行态数据时，摘要与交付物信息使用真实配置。 */
  flow?: TowerDefenseFlowState
}

interface Recommendation {
  label: string
  target: TowerDefenseStage
  primary?: boolean
}

interface StageCopy {
  stage: TowerDefenseStage
  statusTitle: string
  lead: string
  analysis: string[]
  conclusion: string
  completedConclusion: string
  document: BuildCard
  preview: BuildCard
  recommendations: Recommendation[]
}

interface RuntimeCopy {
  analysis: string[]
  conclusion: string
  completedConclusion: string
  documentDescription: string
  previewDescription: string
}

const STAGES: StageCopy[] = [
  {
    stage: 'gameplay',
    statusTitle: '完成玩法意图拆解',
    lead: '我先把创作目标收敛成可验证的塔防核心循环，不直接进入美术和复杂关卡制作。',
    analysis: [
      '模板判断：这是路径防守型塔防，第一轮优先验证“建塔—拦截—赚取资源—强化防线”的闭环。',
      '范围约束：只开放 Fast 参数，并用几何体代替美术资产，避免视觉效果干扰游戏性判断。',
      '验收重点：首轮建造是否顺畅、不同塔是否有选择差异、波次压力是否逐步上升。',
    ],
    conclusion: '已形成第一版 Fast 玩法基线，可以直接试玩并调整关键参数。',
    completedConclusion: 'Fast 核心循环已通过试玩确认',
    document: {
      badge: 'MD',
      title: '塔防玩法方案.md',
      desc: '核心循环、塔与敌人规则、Fast 参数基线',
      type: 'doc',
    },
    preview: {
      badge: '可试玩',
      title: '几何体塔防 Demo',
      desc: '建塔、波次、经济与基地血量均可操作',
      type: 'play',
    },
    recommendations: [
      { label: '试玩游戏性', target: 'gameplay', primary: true },
      { label: '下一步：游戏视觉设定', target: 'art-direction' },
    ],
  },
  {
    stage: 'art-direction',
    statusTitle: '完成资产范围分析',
    lead: '玩法闭环已经成立。现在先统一世界观和基础形象，再展开动态状态，避免角色、塔和场景各自生成。',
    analysis: [
      '资产拆分：地图、角色、敌人、建筑塔、道具和技能共用同一套世界观与材质语言。',
      '确认顺序：先看每类资产的基础形象，确认整体方向后再规划动作状态和动态帧。',
      '地图边界：本阶段只确认战场视觉与塔位表达，不增加碰撞、出生点等地图逻辑。',
    ],
    conclusion: '已建立全量资产设定框架，可逐项确认基础形象与视觉一致性。',
    completedConclusion: '世界观与全量基础形象已锁定',
    document: {
      badge: 'MD',
      title: '游戏美术设定.md',
      desc: '世界观、色彩材质、资产角色与状态规划',
      type: 'doc',
    },
    preview: {
      badge: '可编辑',
      title: '游戏资产设定板',
      desc: '逐项确认地图、角色、敌人、塔、道具与技能',
      type: 'asset',
    },
    recommendations: [
      { label: '查看资产设定', target: 'art-direction', primary: true },
      { label: '调整世界观风格', target: 'art-direction' },
      { label: '继续确认基础形象', target: 'art-direction' },
    ],
  },
  {
    stage: 'asset-production',
    statusTitle: '完成动态资产生产规划',
    lead: '基础形象已经锁定。我把非地图资产继续拆成状态、方向和帧数，作为可执行的动态素材规格。',
    analysis: [
      '生产粒度：角色与建筑按“资产—状态—方向—帧”组织，可单项生成，也可按整项或全量批量生成。',
      '工具衔接：游戏资产库只展示状态容器和生成结果；任务管理集中在独立的 Sprite Maker II 工具内。',
      '地图处理：地图保持单张图，只开放建造塔位标记，不进入序列帧生产。',
    ],
    conclusion: '动态资产规格已形成统一生产清单，可在资产库中调整方向并直接批量生成。',
    completedConclusion: '动态素材与地图塔位已生产完成',
    document: {
      badge: 'JSON',
      title: '资产生产清单.json',
      desc: '状态、方向、帧数及 Sprite Maker II 任务状态',
      type: 'list',
    },
    preview: {
      badge: '独立工具',
      title: 'Sprite Maker II',
      desc: '查看单素材与批量生成、审核和返工任务',
      type: 'app',
    },
    recommendations: [
      { label: '打开 Sprite Maker II', target: 'asset-production', primary: true },
      { label: '批量生成动态帧', target: 'asset-production' },
      { label: '继续完成生成任务', target: 'asset-production' },
    ],
  },
  {
    stage: 'ui-generation',
    statusTitle: '完成界面信息架构分析',
    lead: '玩法和资产都已经确定。现在按真实对局动线组装 HUD、波次、建造操作和结算反馈。',
    analysis: [
      '信息优先级：战斗资源和基地状态常驻，波次进度用于预判，建造操作保持单手可达。',
      '组件边界：HUD、波次、建造栏、战斗控制与结算面板分别生成，可独立开关和二次调整。',
      '验证方式：所有界面直接覆盖到可玩战场上检查，不单独制作脱离游戏场景的静态稿。',
    ],
    conclusion: '已生成可拆分的游戏 UI 方案，可以在实战预览中逐组件检查和调整。',
    completedConclusion: '游戏 UI 已在实战场景中确认',
    document: {
      badge: 'MD',
      title: '游戏 UI 规范.md',
      desc: '信息层级、组件状态、操作反馈与界面规则',
      type: 'doc',
    },
    preview: {
      badge: '可编辑',
      title: '游戏 UI 实战预览',
      desc: '逐项编辑 HUD、波次、建造栏、控制与结算',
      type: 'wire',
    },
    recommendations: [
      { label: '编辑 UI 组件', target: 'ui-generation', primary: true },
      { label: '查看实战预览', target: 'ui-generation' },
      { label: '在右侧确认 UI', target: 'ui-generation' },
    ],
  },
  {
    stage: 'balance',
    statusTitle: '完成首轮对局指标分析',
    lead: '现在用完整成品对局检查塔、敌人、资源和波次之间的真实关系，并收敛最终数值。',
    analysis: [
      '观察指标：首塔建造时机、漏怪位置、资源盈余、塔型使用率与通关剩余生命。',
      '调整顺序：先校准经济和敌人压力，再处理单塔强度，避免多项参数同时变化造成误判。',
      '验收目标：不同塔都有明确使用窗口，难度可预判，失败原因能从对局反馈中理解。',
    ],
    conclusion: '成品试玩与平衡参数已经汇总到同一工作区，可边玩边调并沉淀最终报告。',
    completedConclusion: '成品数值已完成最终验收',
    document: {
      badge: 'MD',
      title: '平衡性报告.md',
      desc: '对局指标、数值变更、问题定位与发布基线',
      type: 'doc',
    },
    preview: {
      badge: '成品试玩',
      title: '暮光防线 · Release Candidate',
      desc: '使用完整资产和 UI 试玩最终关卡',
      type: 'play',
    },
    recommendations: [
      { label: '试玩完整关卡', target: 'balance', primary: true },
      { label: '调整平衡参数', target: 'balance' },
      { label: '复核发布版本', target: 'balance' },
    ],
  },
]

function decimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '')
}

function runtimeCopyFor(stage: TowerDefenseStage, flow?: TowerDefenseFlowState): RuntimeCopy | null {
  if (!flow) return null

  if (stage === 'gameplay') {
    const { gameplay, towerSlots } = flow
    const affordableTowers = Math.max(0, Math.floor(gameplay.startingCoins / gameplay.towerCost))
    const occupiedSlots = towerSlots.filter((slot) => slot.occupiedBy !== null).length
    return {
      analysis: [
        `玩法基线：每波 ${gameplay.waveSize} 名敌人、波次间隔 ${gameplay.waveInterval} 秒、基地生命 ${gameplay.baseHealth}。`,
        `经济校验：初始资源 ${gameplay.startingCoins}、基础塔成本 ${gameplay.towerCost}，开局可连续建造 ${affordableTowers} 座基础塔。`,
        `试玩范围：地图提供 ${towerSlots.length} 个建造位，当前已有 ${occupiedSlots} 个塔位被占用；三类塔共享同一套 Fast 调试参数。`,
      ],
      conclusion: `当前参数已经形成“${gameplay.startingCoins} 初始资源—${gameplay.waveSize} 敌人/波”的可试玩闭环，可从建造节奏和首波压力开始验证。`,
      completedConclusion: `Fast 基线已确认：${gameplay.waveSize} 敌人/波，${towerSlots.length} 个塔位`,
      documentDescription: `核心循环与 ${gameplay.waveSize} 敌人/波、${gameplay.towerCost} 建造成本等 Fast 基线`,
      previewDescription: `${towerSlots.length} 个塔位、三类塔和完整波次均可操作`,
    }
  }

  if (stage === 'art-direction') {
    const totalAssets = flow.assets.length
    const confirmedAssets = flow.assets.filter((asset) => asset.baseVisualStatus === 'confirmed').length
    const categoryCount = new Set(flow.assets.map((asset) => asset.category)).size
    const stateCount = flow.assets.reduce((total, asset) => total + asset.states.length, 0)
    const remaining = totalAssets - confirmedAssets
    return {
      analysis: [
        `资产范围：已规划 ${totalAssets} 项基础资产，覆盖 ${categoryCount} 类视觉对象。`,
        `确认进度：${confirmedAssets}/${totalAssets} 项基础形象已锁定${remaining > 0 ? `，还有 ${remaining} 项待确认` : '，可以进入动态制作'}。`,
        `动态规划：非地图资产已经拆出 ${stateCount} 个动作状态；地图保持单图并只承载塔位标记。`,
      ],
      conclusion: remaining > 0
        ? `当前世界观方向已经建立，先确认剩余 ${remaining} 项基础形象，再批量展开动态状态会更稳定。`
        : `全量 ${totalAssets} 项基础形象已经确认，可以按 ${stateCount} 个动作状态进入资产制作。`,
      completedConclusion: `${confirmedAssets}/${totalAssets} 项基础形象已锁定，规划 ${stateCount} 个状态`,
      documentDescription: `${totalAssets} 项资产的世界观、视觉角色与 ${stateCount} 个状态规划`,
      previewDescription: `${confirmedAssets}/${totalAssets} 项基础形象已确认，可逐项编辑`,
    }
  }

  if (stage === 'asset-production') {
    const completed = flow.tasks.filter((task) => task.status === 'completed').length
    const active = flow.tasks.filter((task) => task.status === 'generating' || task.status === 'review').length
    const failed = flow.tasks.filter((task) => task.status === 'failed').length
    const queued = flow.tasks.filter((task) => task.status === 'queued').length
    const totalFrames = flow.tasks.reduce((total, task) => total + task.frameCount, 0)
    const progress = flow.tasks.length > 0 ? Math.round((completed / flow.tasks.length) * 100) : 0
    return {
      analysis: [
        `任务规模：Sprite Maker II 已建立 ${flow.tasks.length} 个方向任务，共规划 ${totalFrames} 帧。`,
        `当前进度：${completed} 个完成、${active} 个生成或待审、${queued} 个排队${failed > 0 ? `、${failed} 个需要返工` : ''}。`,
        `生产边界：角色和建筑按状态、方向、帧数执行；地图不进入动态任务，只编辑 ${flow.towerSlots.length} 个建造塔位。`,
      ],
      conclusion: flow.tasks.length === 0
        ? '动态状态已经规划，但还没有创建生成任务；可以先试制单素材，再批量展开。'
        : `资产生产清单已执行到 ${progress}%；资产库同步展示结果，任务管理可在 Sprite Maker II 中继续。`,
      completedConclusion: `${completed}/${flow.tasks.length} 个动态任务完成，地图保留 ${flow.towerSlots.length} 个塔位`,
      documentDescription: `${flow.tasks.length} 个任务、${totalFrames} 帧及实时生产状态`,
      previewDescription: `${completed} 已完成 · ${active} 生成/待审 · ${queued} 排队`,
    }
  }

  if (stage === 'ui-generation') {
    const visibleComponents = flow.ui.components.filter((component) => component.visible).length
    const selectedComponent = flow.ui.components.find(
      (component) => component.id === flow.ui.selectedComponentId,
    )
    const presetNames: Record<TowerDefenseFlowState['ui']['visualPreset'], string> = {
      'night-watch': '暗夜守望',
      'forest-signal': '森林信号',
      'paper-kingdom': '纸境王国',
    }
    return {
      analysis: [
        `界面结构：${visibleComponents}/${flow.ui.components.length} 个游戏组件当前可见，覆盖战斗信息、波次、建造和结算。`,
        `视觉基线：采用“${presetNames[flow.ui.visualPreset]}”预设，圆角 ${flow.ui.cornerRadius}px${flow.ui.compactMode ? '，已开启紧凑模式' : ''}。`,
        `当前焦点：正在编辑“${selectedComponent?.name ?? '战斗 HUD'}”，调整结果会直接叠加到实战预览。`,
      ],
      conclusion: `游戏 UI 已按“${presetNames[flow.ui.visualPreset]}”组装，${visibleComponents} 个可见组件均可在对局场景中独立调整。`,
      completedConclusion: `${visibleComponents}/${flow.ui.components.length} 个 UI 组件已在实战预览中确认`,
      documentDescription: `${flow.ui.components.length} 个组件的信息层级、状态和操作反馈规则`,
      previewDescription: `当前编辑“${selectedComponent?.name ?? '战斗 HUD'}”，改动实时呈现`,
    }
  }

  const { balance } = flow
  return {
    analysis: [
      `防守侧：塔伤害 ×${decimal(balance.towerDamageMultiplier)}、射速 ×${decimal(balance.towerFireRateMultiplier)}，初始资源 ${balance.startingCoins}。`,
      `进攻侧：敌人生命 ×${decimal(balance.enemyHealthMultiplier)}、移速 ×${decimal(balance.enemySpeedMultiplier)}，每波成长 ${decimal(balance.waveGrowth)}。`,
      `关卡节奏：每 ${balance.bossEvery} 波出现首领；建议优先观察首塔时机、漏怪位置和通关剩余生命。`,
    ],
    conclusion: `当前平衡基线以 ${balance.startingCoins} 初始资源和每 ${balance.bossEvery} 波首领为节奏锚点，可直接通过完整对局继续收敛。`,
    completedConclusion: `平衡基线已锁定：${balance.startingCoins} 初始资源，每 ${balance.bossEvery} 波首领`,
    documentDescription: `塔、敌人、经济和波次的最终数值基线与试玩结论`,
    previewDescription: `使用完整资产、UI 与当前平衡参数试玩最终关卡`,
  }
}

export default function TowerDefenseFlowChat({
  stage,
  onOpenStage,
  onOpenDeliverable,
  flow,
}: TowerDefenseFlowChatProps) {
  const activeIndex = Math.max(0, STAGES.findIndex((item) => item.stage === stage))
  const visibleStages = STAGES.slice(0, activeIndex + 1)
  const openDeliverable = onOpenDeliverable ?? onOpenStage

  return (
    <section aria-label="塔防游戏生成流程" className="max-w-[450px] pb-1">
      <div aria-label="阶段对话记录">
        {visibleStages.map((item, index) => {
          const runtime = runtimeCopyFor(item.stage, flow)
          const isCurrent = index === activeIndex
          const documentCard: BuildCard = {
            ...item.document,
            id: `${item.stage}:document`,
            desc: runtime?.documentDescription ?? item.document.desc,
          }
          const previewCard: BuildCard = {
            ...item.preview,
            id: `${item.stage}:workspace`,
            desc: runtime?.previewDescription ?? item.preview.desc,
          }
          const conclusion = isCurrent
            ? runtime?.conclusion ?? item.conclusion
            : `${runtime?.completedConclusion ?? item.completedConclusion}。`

          return (
            <div
              key={item.stage}
              className={index > 0 ? 'border-t border-[var(--divider-soft)] pt-4' : ''}
            >
              <ToolStatus
                title={item.statusTitle}
                lines={runtime?.analysis ?? item.analysis}
                running={false}
              />
              <AssistantMessage
                index={index + 2}
                text={`${item.lead}\n结论：${conclusion}`}
                cards={[documentCard, previewCard]}
                onOpenCard={(card) => {
                  if (card.id === documentCard.id) {
                    openDeliverable(item.stage)
                    return
                  }
                  onOpenStage(item.stage)
                }}
                footer={
                  isCurrent ? (
                    <div className="mt-3">
                      <p className="mb-2 text-[11px] font-medium text-[var(--color-ink)]/42">
                        推荐继续
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.recommendations.map((recommendation) => (
                          <button
                            key={`${recommendation.target}-${recommendation.label}`}
                            type="button"
                            onClick={() => onOpenStage(recommendation.target)}
                            className={`flex h-8 cursor-pointer items-center gap-1 rounded-[8px] border px-2.5 text-[11.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
                              recommendation.primary
                                ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ink-contrast)] hover:opacity-90'
                                : 'border-[var(--divider)] bg-[var(--color-surface-0)] text-[var(--color-ink)]/68 hover:border-[var(--color-ink)]/25 hover:bg-[var(--fill-subtle)]'
                            }`}
                          >
                            {recommendation.label}
                            {recommendation.primary ? (
                              <ArrowRight size={12} strokeWidth={1.8} />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : undefined
                }
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
