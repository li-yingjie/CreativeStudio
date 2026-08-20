/* eslint-disable react-refresh/only-export-components -- stage metadata is shared with chat attachments and tabs */
import {
  CheckCircle2,
  CircleAlert,
  FileJson,
  FileText,
  Gamepad2,
  Gauge,
  LayoutTemplate,
  ListChecks,
  Palette,
} from '@/shared/icons'
import type { ReactNode } from 'react'
import {
  TOWER_ARCHETYPES,
  TOWER_DEFENSE_PROJECT_NAME,
  getTowerDefenseDirectionLabel,
  type SpriteTaskStatus,
  type TowerDefenseAsset,
  type TowerDefenseAssetCategory,
  type TowerDefenseFlowState,
  type TowerDefenseStage,
  type TowerDefenseUiComponentConfig,
} from './TowerDefenseFlowModel'

export type TowerDefenseDeliverableFileType = 'markdown' | 'json'

export interface TowerDefenseDeliverableMeta {
  readonly stage: TowerDefenseStage
  readonly fileName: string
  readonly fileType: TowerDefenseDeliverableFileType
  readonly mimeType: 'text/markdown' | 'application/json'
  readonly title: string
  readonly summary: string
}

const DELIVERABLE_META: Readonly<Record<TowerDefenseStage, TowerDefenseDeliverableMeta>> = {
  gameplay: {
    stage: 'gameplay',
    fileName: '塔防玩法方案.md',
    fileType: 'markdown',
    mimeType: 'text/markdown',
    title: '塔防玩法方案',
    summary: '记录核心循环、Fast 模式数值与可建造区域，作为几何体 Demo 的验收基线。',
  },
  'art-direction': {
    stage: 'art-direction',
    fileName: '游戏美术设定.md',
    fileType: 'markdown',
    mimeType: 'text/markdown',
    title: '游戏美术设定',
    summary: '汇总世界观方向、全量资产基础形象及后续动态状态规划。',
  },
  'asset-production': {
    stage: 'asset-production',
    fileName: '资产生产清单.json',
    fileType: 'json',
    mimeType: 'application/json',
    title: '游戏资产生产清单',
    summary: '记录实体、状态、方向、帧数与 Sprite Maker II 任务进度。',
  },
  'ui-generation': {
    stage: 'ui-generation',
    fileName: '游戏 UI 规范.md',
    fileType: 'markdown',
    mimeType: 'text/markdown',
    title: '游戏 UI 规范',
    summary: '记录界面预设、组件显隐、信息层级与当前可编辑参数。',
  },
  balance: {
    stage: 'balance',
    fileName: '平衡性报告.md',
    fileType: 'markdown',
    mimeType: 'text/markdown',
    title: '试玩与平衡性报告',
    summary: '记录当前数值版本、折算结果与仍需通过成品试玩验证的项目。',
  },
}

/** Stable stage-to-file metadata for tabs, chat attachments and document views. */
export function getTowerDefenseDeliverableMeta(
  stage: TowerDefenseStage,
): TowerDefenseDeliverableMeta {
  return DELIVERABLE_META[stage]
}

export interface TowerDefenseDeliverableViewProps {
  stage: TowerDefenseStage
  flow: TowerDefenseFlowState
  className?: string
}

const CATEGORY_LABELS: Record<TowerDefenseAssetCategory, string> = {
  'visual-style': '视觉风格',
  map: '地图',
  hero: '英雄',
  enemy: '敌人',
  tower: '防御塔',
}

const TASK_STATUS_LABELS: Record<SpriteTaskStatus, string> = {
  queued: '排队中',
  generating: '生成中',
  review: '待确认',
  completed: '已完成',
  failed: '失败',
}

const UI_EMPHASIS_LABELS: Record<TowerDefenseUiComponentConfig['emphasis'], string> = {
  quiet: '弱强调',
  standard: '标准',
  strong: '强强调',
}

const UI_PRESET_LABELS: Record<TowerDefenseFlowState['ui']['visualPreset'], string> = {
  'night-watch': '暗夜守望',
  'forest-signal': '森林信号',
  'paper-kingdom': '纸艺王国',
}

const STAGE_ICONS = {
  gameplay: Gamepad2,
  'art-direction': Palette,
  'asset-production': ListChecks,
  'ui-generation': LayoutTemplate,
  balance: Gauge,
} satisfies Record<TowerDefenseStage, typeof Gamepad2>

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits }).format(value)
}

function DocumentSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-[var(--divider-soft)] py-6 first:border-t-0 first:pt-0">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-[11.5px] leading-[18px] text-[var(--color-ink)]/48">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-3.5 py-3">
      <div className="text-[10.5px] text-[var(--color-ink)]/42">{label}</div>
      <div className="mt-1 truncate text-[17px] font-semibold tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
      {note ? <div className="mt-0.5 truncate text-[10px] text-[var(--color-ink)]/36">{note}</div> : null}
    </div>
  )
}

function DefinitionRows({
  rows,
}: {
  rows: Array<{ label: string; value: ReactNode; note?: string }>
}) {
  return (
    <dl className="overflow-hidden rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[132px_minmax(0,1fr)] gap-4 border-t border-[var(--divider-soft)] px-3.5 py-2.5 first:border-t-0 max-sm:grid-cols-1 max-sm:gap-1"
        >
          <dt className="text-[11px] text-[var(--color-ink)]/42">{row.label}</dt>
          <dd className="min-w-0 text-[11.5px] leading-[18px] text-[var(--color-ink)]/76">
            {row.value}
            {row.note ? (
              <span className="ml-2 text-[10.5px] text-[var(--color-ink)]/36">{row.note}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function GameplayDocument({ flow }: { flow: TowerDefenseFlowState }) {
  const config = flow.gameplay
  const occupiedSlots = flow.towerSlots.filter((slot) => slot.occupiedBy).length

  return (
    <>
      <DocumentSection title="玩法结论" description="以下内容来自当前 Fast 配置与可操作 Demo，不包含尚未发生的试玩结论。">
        <div className="rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4 py-3.5">
          <div className="text-[10.5px] font-medium text-[var(--color-ink)]/42">创作输入</div>
          <p className="mt-1.5 text-[12px] leading-[19px] text-[var(--color-ink)]/78">{flow.prompt}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5 max-md:grid-cols-2">
          <MetricCard label="单波敌人" value={`${config.waveSize} 个`} note={`每 ${config.waveInterval} 秒刷新`} />
          <MetricCard label="初始资源" value={formatNumber(config.startingCoins)} note={`基础塔消耗 ${config.towerCost}`} />
          <MetricCard label="基地生命" value={formatNumber(config.baseHealth)} note="降至 0 时本局失败" />
          <MetricCard label="可建塔位" value={`${flow.towerSlots.length} 个`} note={`Demo 已建造 ${occupiedSlots} 个`} />
          <MetricCard label="基础塔伤害" value={formatNumber(config.towerDamage)} note="未叠加平衡系数" />
          <MetricCard label="基础敌人生命" value={formatNumber(config.enemyHealth)} note={`移速系数 ${config.enemySpeed}×`} />
        </div>
      </DocumentSection>

      <DocumentSection title="核心循环与可操作范围">
        <DefinitionRows
          rows={[
            { label: '核心循环', value: '观察来敌 → 选择塔型 → 在固定塔位建造 → 击败敌人回收资源 → 防守后续波次' },
            { label: '失败条件', value: `敌人突破防线并将基地生命从 ${config.baseHealth} 降至 0` },
            { label: '经济基线', value: `初始 ${config.startingCoins} 资源；基础建造成本 ${config.towerCost}` },
            { label: 'Demo 边界', value: '仅验证建造、出怪、攻击、资源与基地生命；美术表现和最终 UI 不在本阶段验收' },
          ]}
        />
      </DocumentSection>

      <DocumentSection title="防御塔方案" description="三种塔共享 Fast 模式基础参数，并通过倍率形成职能差异。">
        <div className="grid grid-cols-3 gap-2.5 max-md:grid-cols-1">
          {TOWER_ARCHETYPES.map((tower) => (
            <article key={tower.id} className="rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)] p-3.5">
              <h3 className="text-[12px] font-semibold text-[var(--color-ink)]">{tower.name}</h3>
              <dl className="mt-2.5 space-y-1.5 text-[10.5px] text-[var(--color-ink)]/52">
                <div className="flex justify-between gap-2"><dt>建造成本</dt><dd className="font-medium tabular-nums text-[var(--color-ink)]/76">{formatNumber(config.towerCost * tower.costMultiplier)}</dd></div>
                <div className="flex justify-between gap-2"><dt>单次伤害</dt><dd className="font-medium tabular-nums text-[var(--color-ink)]/76">{formatNumber(config.towerDamage * tower.damageMultiplier)}</dd></div>
                <div className="flex justify-between gap-2"><dt>攻击间隔</dt><dd className="font-medium tabular-nums text-[var(--color-ink)]/76">{tower.attackInterval} 秒</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </DocumentSection>
    </>
  )
}

function assetFrameCount(asset: TowerDefenseAsset) {
  return asset.states.reduce(
    (total, state) => total + state.framesPerDirection * state.directions.length,
    0,
  )
}

function AssetSpecificationList({ assets }: { assets: TowerDefenseAsset[] }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      {assets.map((asset) => (
        <article key={asset.id} className="border-t border-[var(--divider-soft)] px-3.5 py-3 first:border-t-0">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 shrink-0 rounded-[5px] bg-[var(--fill-subtle)] px-2 py-1 text-[9.5px] font-medium text-[var(--color-ink)]/52">
              {CATEGORY_LABELS[asset.category]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className="text-[11.5px] font-semibold text-[var(--color-ink)]">{asset.name}</h3>
                <span className="text-[10px] text-[var(--color-ink)]/38">{asset.role}</span>
              </div>
              <p className="mt-1 text-[10.5px] leading-[16px] text-[var(--color-ink)]/52">{asset.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {asset.category === 'map' ? (
                  <span className="rounded-[5px] border border-[var(--divider-soft)] px-2 py-1 text-[9.5px] text-[var(--color-ink)]/48">静态地图 · 不生产序列帧</span>
                ) : asset.states.map((state) => (
                  <span key={state.id} className="rounded-[5px] border border-[var(--divider-soft)] px-2 py-1 text-[9.5px] text-[var(--color-ink)]/48">
                    {state.name} · {state.directions.length} 向 × {state.framesPerDirection} 帧
                  </span>
                ))}
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[9.5px] font-medium ${asset.baseVisualStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {asset.baseVisualStatus === 'confirmed' ? '基础形象已确认' : '基础形象待确认'}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}

function ArtDirectionDocument({ flow }: { flow: TowerDefenseFlowState }) {
  const confirmed = flow.assets.filter((asset) => asset.baseVisualStatus === 'confirmed').length
  const dynamicAssets = flow.assets.filter((asset) => asset.category !== 'map')
  const stateCount = dynamicAssets.reduce((total, asset) => total + asset.states.length, 0)
  const plannedFrames = dynamicAssets.reduce((total, asset) => total + assetFrameCount(asset), 0)
  const worldViewAnchors = flow.assets
    .filter((asset) => ['map', 'hero', 'enemy'].includes(asset.category))
    .map((asset) => asset.name)
    .join('、')

  return (
    <>
      <DocumentSection title="设定结论" description="世界观方向从创作输入与当前资产命名、职能中归纳；基础形象状态以资产库为准。">
        <DefinitionRows
          rows={[
            { label: '创作输入', value: flow.prompt },
            { label: '世界观锚点', value: worldViewAnchors || '等待基础资产设定' },
            { label: '视觉统一范围', value: '地图、角色、敌人、防御塔、局内道具与主动技能' },
            { label: '制作边界', value: '本阶段确认基础形象与状态需求；序列帧实际生成进入游戏资产制作阶段' },
          ]}
        />
        <div className="mt-3 grid grid-cols-3 gap-2.5 max-md:grid-cols-1">
          <MetricCard label="基础资产" value={`${flow.assets.length} 项`} note={`${confirmed} 项已确认`} />
          <MetricCard label="动态状态" value={`${stateCount} 组`} note="地图不计入动态状态" />
          <MetricCard label="计划序列帧" value={`${formatNumber(plannedFrames)} 帧`} note="按状态 × 方向汇总" />
        </div>
      </DocumentSection>
      <DocumentSection title="全量资产设定" description="每项资产确认基础形象后，再按已列状态拆分生产任务。">
        <AssetSpecificationList assets={flow.assets} />
      </DocumentSection>
    </>
  )
}

function createProductionReport(flow: TowerDefenseFlowState) {
  const statusCounts = flow.tasks.reduce<Record<SpriteTaskStatus, number>>(
    (counts, task) => ({ ...counts, [task.status]: counts[task.status] + 1 }),
    { queued: 0, generating: 0, review: 0, completed: 0, failed: 0 },
  )

  return {
    schemaVersion: '1.0',
    project: TOWER_DEFENSE_PROJECT_NAME,
    sourcePrompt: flow.prompt,
    summary: {
      assetCount: flow.assets.length,
      spriteTaskCount: flow.tasks.length,
      statusCounts,
    },
    map: {
      assetId: flow.assets.find((asset) => asset.category === 'map')?.id ?? null,
      towerBuildSlots: flow.towerSlots.map(({ id, label, x, y }) => ({ id, label, x, y })),
      note: '地图仅标记可建造塔位；当前阶段不配置碰撞、出生点或路线。',
    },
    assets: flow.assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      baseVisualStatus: asset.baseVisualStatus,
      states: asset.states.map((state) => ({
        id: state.id,
        name: state.name,
        directions: state.directions,
        framesPerDirection: state.framesPerDirection,
        fps: state.fps ?? null,
        loopMode: state.loopMode ?? null,
        status: state.status,
      })),
    })),
    tasks: flow.tasks.map((task) => ({
      id: task.id,
      assetId: task.assetId,
      stateId: task.stateId,
      direction: task.direction,
      frameCount: task.frameCount,
      fps: task.fps ?? null,
      loopMode: task.loopMode ?? null,
      status: task.status,
      progress: task.progress,
      output: task.output ?? null,
      error: task.error ?? null,
    })),
  }
}

function AssetProductionDocument({ flow }: { flow: TowerDefenseFlowState }) {
  const completed = flow.tasks.filter((task) => task.status === 'completed').length
  const inProgress = flow.tasks.filter((task) => task.status === 'generating').length
  const needsReview = flow.tasks.filter((task) => task.status === 'review').length
  const failed = flow.tasks.filter((task) => task.status === 'failed').length
  const totalFrames = flow.tasks.reduce((total, task) => total + task.frameCount, 0)
  const report = createProductionReport(flow)

  return (
    <>
      <DocumentSection title="生产结论" description="统计来自当前 Sprite Maker II 任务列表；空任务不会被记为已完成。">
        <div className="grid grid-cols-5 gap-2.5 max-lg:grid-cols-3 max-sm:grid-cols-2">
          <MetricCard label="生产任务" value={`${flow.tasks.length} 项`} note={`共 ${formatNumber(totalFrames)} 帧`} />
          <MetricCard label="已完成" value={`${completed} 项`} />
          <MetricCard label="生成中" value={`${inProgress} 项`} />
          <MetricCard label="待确认" value={`${needsReview} 项`} />
          <MetricCard label="失败" value={`${failed} 项`} />
        </div>
        {flow.tasks.length === 0 ? (
          <div className="mt-3 flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-[17px] text-amber-800">
            <CircleAlert size={15} className="mt-0.5 shrink-0" />
            尚未创建生产任务。资产状态规划已保留，但不能将计划帧数视为已生成产物。
          </div>
        ) : null}
      </DocumentSection>

      <DocumentSection title="地图建造位" description="地图仅记录防御塔可建造位置，不扩展碰撞、路线和出生定位。">
        <div className="grid grid-cols-3 gap-2 max-md:grid-cols-2">
          {flow.towerSlots.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between rounded-[8px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-3 py-2.5 text-[10.5px]">
              <span className="font-medium text-[var(--color-ink)]/72">塔位 {slot.label}</span>
              <span className="font-mono text-[var(--color-ink)]/42">x {slot.x}% · y {slot.y}%</span>
            </div>
          ))}
        </div>
      </DocumentSection>

      <DocumentSection title="任务明细" description="状态、方向与任务进度均来自当前 flow；已生成文件仅在 output 中存在。">
        {flow.tasks.length > 0 ? (
          <div className="overflow-hidden rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
            {flow.tasks.map((task) => {
              const asset = flow.assets.find((item) => item.id === task.assetId)
              const state = asset?.states.find((item) => item.id === task.stateId)
              return (
                <div key={task.id} className="grid grid-cols-[minmax(0,1fr)_80px_80px_72px] items-center gap-3 border-t border-[var(--divider-soft)] px-3.5 py-2.5 first:border-t-0 max-md:grid-cols-[minmax(0,1fr)_72px]">
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-medium text-[var(--color-ink)]/76">{asset?.name ?? task.assetId} · {state?.name ?? task.stateId}</div>
                    <div className="mt-0.5 truncate text-[9.5px] text-[var(--color-ink)]/34">{task.id}</div>
                  </div>
                  <span className="text-[10px] text-[var(--color-ink)]/48 max-md:text-right">{getTowerDefenseDirectionLabel(task.direction)}</span>
                  <span className="text-[10px] tabular-nums text-[var(--color-ink)]/48 max-md:hidden">{task.frameCount} 帧 · {task.fps ?? '—'} fps</span>
                  <span className={`text-right text-[10px] font-medium ${task.status === 'failed' ? 'text-red-600' : task.status === 'completed' ? 'text-emerald-700' : 'text-[var(--color-ink)]/52'}`}>{TASK_STATUS_LABELS[task.status]}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-[var(--divider)] px-4 py-8 text-center text-[11px] text-[var(--color-ink)]/42">等待从资产状态规划生成任务</div>
        )}
      </DocumentSection>

      <DocumentSection title="JSON 交付内容" description="该结构可供任务系统、运行时资产装配或后续导出使用。">
        <pre className="thin-scroll max-h-[420px] overflow-auto rounded-[10px] bg-[#161823] p-4 font-mono text-[10.5px] leading-[17px] text-white/78">
          {JSON.stringify(report, null, 2)}
        </pre>
      </DocumentSection>
    </>
  )
}

function UiGenerationDocument({ flow }: { flow: TowerDefenseFlowState }) {
  const visibleComponents = flow.ui.components.filter((component) => component.visible)
  const selected = flow.ui.components.find((component) => component.id === flow.ui.selectedComponentId)

  return (
    <>
      <DocumentSection title="UI 结论" description="规范只记录当前预设与组件配置，不替代可交互预览验收。">
        <div className="grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
          <MetricCard label="视觉预设" value={UI_PRESET_LABELS[flow.ui.visualPreset]} />
          <MetricCard label="启用组件" value={`${visibleComponents.length} / ${flow.ui.components.length}`} />
          <MetricCard label="紧凑模式" value={flow.ui.compactMode ? '开启' : '关闭'} />
          <MetricCard label="组件圆角" value={`${flow.ui.cornerRadius} px`} />
        </div>
      </DocumentSection>

      <DocumentSection title="组件规范" description={`当前编辑对象：${selected?.name ?? '未选择'}`}>
        <div className="overflow-hidden rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
          {flow.ui.components.map((component) => (
            <article key={component.id} className="grid grid-cols-[minmax(0,1fr)_78px_72px_64px] items-center gap-3 border-t border-[var(--divider-soft)] px-3.5 py-3 first:border-t-0 max-md:grid-cols-[minmax(0,1fr)_70px]">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-[11.5px] font-semibold text-[var(--color-ink)]">{component.name}</h3>
                  {component.id === flow.ui.selectedComponentId ? <span className="rounded-[4px] bg-[var(--fill-subtle)] px-1.5 py-0.5 text-[9px] text-[var(--color-ink)]/48">当前编辑</span> : null}
                </div>
                <p className="mt-0.5 truncate text-[10px] text-[var(--color-ink)]/42">{component.description}</p>
              </div>
              <span className="text-[10px] text-[var(--color-ink)]/48 max-md:text-right">{component.visible ? '显示' : '隐藏'}</span>
              <span className="text-[10px] text-[var(--color-ink)]/48 max-md:hidden">{UI_EMPHASIS_LABELS[component.emphasis]}</span>
              <span className="text-right text-[10px] tabular-nums text-[var(--color-ink)]/48 max-md:hidden">{component.scale}%</span>
            </article>
          ))}
        </div>
      </DocumentSection>

      <DocumentSection title="交互与信息层级">
        <DefinitionRows
          rows={[
            { label: '常驻信息', value: visibleComponents.filter((item) => ['battle-hud', 'wave-progress'].includes(item.id)).map((item) => item.name).join('、') || '无' },
            { label: '主要操作', value: visibleComponents.filter((item) => ['tower-dock', 'battle-controls'].includes(item.id)).map((item) => item.name).join('、') || '无' },
            { label: '结果反馈', value: flow.ui.components.find((item) => item.id === 'result-panel')?.visible ? '结算面板已启用' : '结算面板当前隐藏' },
            { label: '验收方式', value: '在 9:16 成品视窗中检查信息可读性、建塔触达、战斗遮挡与结算闭环' },
          ]}
        />
      </DocumentSection>
    </>
  )
}

function BalanceDocument({ flow }: { flow: TowerDefenseFlowState }) {
  const gameplay = flow.gameplay
  const balance = flow.balance
  const effectiveDamage = gameplay.towerDamage * balance.towerDamageMultiplier
  const effectiveHealth = gameplay.enemyHealth * balance.enemyHealthMultiplier
  const effectiveSpeed = gameplay.enemySpeed * balance.enemySpeedMultiplier

  return (
    <>
      <DocumentSection title="当前数值结论" description="折算值由玩法基线与平衡系数直接计算，不代表尚未记录的对局结果。">
        <div className="grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
          <MetricCard label="塔伤害折算" value={formatNumber(effectiveDamage)} note={`${balance.towerDamageMultiplier}× 系数`} />
          <MetricCard label="塔攻速系数" value={`${formatNumber(balance.towerFireRateMultiplier)}×`} />
          <MetricCard label="敌人生命折算" value={formatNumber(effectiveHealth)} note={`${balance.enemyHealthMultiplier}× 系数`} />
          <MetricCard label="敌人移速折算" value={`${formatNumber(effectiveSpeed)}×`} />
        </div>
      </DocumentSection>

      <DocumentSection title="版本参数">
        <DefinitionRows
          rows={[
            { label: '初始资源', value: formatNumber(balance.startingCoins), note: `玩法基线 ${gameplay.startingCoins}` },
            { label: '波次成长', value: `${formatNumber(balance.waveGrowth)}× / 波` },
            { label: 'Boss 间隔', value: `每 ${balance.bossEvery} 波` },
            { label: '塔伤害倍率', value: `${formatNumber(balance.towerDamageMultiplier)}×` },
            { label: '塔攻速倍率', value: `${formatNumber(balance.towerFireRateMultiplier)}×` },
            { label: '敌人生命倍率', value: `${formatNumber(balance.enemyHealthMultiplier)}×` },
            { label: '敌人移速倍率', value: `${formatNumber(balance.enemySpeedMultiplier)}×` },
          ]}
        />
      </DocumentSection>

      <DocumentSection title="试玩验收项" description="TowerDefenseFlowState 当前未保存对局遥测，因此报告明确保留这些待验证项。">
        <div className="overflow-hidden rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
          {[
            '首座塔建造时间与前两波资源压力',
            '三种塔在单体、减速和范围场景中的使用率',
            'Boss 波前的资源储备与失败率',
            '基地首次受击波次、通关时长与剩余生命',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 border-t border-[var(--divider-soft)] px-3.5 py-3 first:border-t-0">
              <span className="size-3.5 shrink-0 rounded-[4px] border border-[var(--color-ink)]/20" />
              <span className="text-[11px] text-[var(--color-ink)]/64">{item}</span>
              <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-medium text-amber-700">待试玩记录</span>
            </div>
          ))}
        </div>
      </DocumentSection>
    </>
  )
}

function DeliverableContent({ stage, flow }: { stage: TowerDefenseStage; flow: TowerDefenseFlowState }) {
  switch (stage) {
    case 'gameplay':
      return <GameplayDocument flow={flow} />
    case 'art-direction':
      return <ArtDirectionDocument flow={flow} />
    case 'asset-production':
      return <AssetProductionDocument flow={flow} />
    case 'ui-generation':
      return <UiGenerationDocument flow={flow} />
    case 'balance':
      return <BalanceDocument flow={flow} />
  }
}

export default function TowerDefenseDeliverableView({
  stage,
  flow,
  className = '',
}: TowerDefenseDeliverableViewProps) {
  const meta = getTowerDefenseDeliverableMeta(stage)
  const StageIcon = STAGE_ICONS[stage]
  const FileIcon = meta.fileType === 'json' ? FileJson : FileText

  return (
    <article className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--color-surface-1)] ${className}`}>
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-[var(--fill-subtle)] text-[var(--color-ink)]/62">
            <StageIcon size={15} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold text-[var(--color-ink)]">{meta.title}</div>
            <div className="truncate text-[9.5px] text-[var(--color-ink)]/38">当前项目状态生成 · 随编辑实时更新</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-[7px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2.5 py-1.5 text-[10px] text-[var(--color-ink)]/52">
          <FileIcon size={13} strokeWidth={1.8} />
          <span>{meta.fileName}</span>
        </div>
      </header>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[920px] px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-7 border-b border-[var(--divider-soft)] pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--color-ink)] px-2.5 py-1 text-[9.5px] font-medium text-[var(--color-ink-contrast)]">
                可交付
              </span>
              <span className="rounded-full bg-[var(--fill-subtle)] px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.06em] text-[var(--color-ink)]/42">
                {meta.fileType}
              </span>
            </div>
            <h1 className="mt-4 text-[24px] font-semibold tracking-[-0.025em] text-[var(--color-ink)] sm:text-[28px]">
              {meta.title}
            </h1>
            <p className="mt-2 max-w-[680px] text-[12px] leading-[19px] text-[var(--color-ink)]/50">
              {meta.summary}
            </p>
          </div>

          <DeliverableContent stage={stage} flow={flow} />

          <footer className="flex items-start gap-2 border-t border-[var(--divider-soft)] pt-5 text-[10px] leading-[16px] text-[var(--color-ink)]/34">
            <CheckCircle2 size={14} className="mt-px shrink-0" />
            本文档仅汇总当前项目状态中的输入、配置和任务结果；未保存的推理过程、生成结果或试玩数据不会被写入交付物。
          </footer>
        </div>
      </div>
    </article>
  )
}
