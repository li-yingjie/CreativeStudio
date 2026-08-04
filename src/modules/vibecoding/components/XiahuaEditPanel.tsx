/* eslint-disable react-refresh/only-export-components -- 选择模型与打点清单需与预览组件共享 */
import { useEffect, useState } from 'react'
import {
  X,
  Image as ImageIcon,
  Type,
  RefreshCw,
  Upload,
  Ruler,
  LayoutGrid,
  Box,
  Film,
  Sparkles,
} from '@/shared/icons'
import { XIAHUA_ASSET_GROUPS } from './ProjectAssetCatalog'
import XiahuaGameplayEditor from './XiahuaGameplayEditor'
import {
  GAMEPLAY_BINDING,
  GAMEPLAY_LABEL,
  type XiahuaGameplay,
} from './XiahuaGameplay'

/* ─── 「这夏夯爆了」编辑面板 ───
 * 预览进入编辑态后，点选页面元素 → 此面板按元素类型给出针对性属性。
 * 除「剩余次数 / 当前阶段」真实回写预览外，其余为本地演示（与 ACG
 * H5LayerEditPanel 同一套约定）。 */

export type XiahuaSelKind = 'image' | 'text' | 'button' | 'component' | 'section'

/** 选中对象的资产类型 — 头部徽标与图标按此对齐。 */
export type XiahuaObjectType = '图片' | '矢量对象' | '视频' | '文本' | '组件'

export interface XiahuaSel {
  id: string
  kind: XiahuaSelKind
  /** 资产类型：图片 / 矢量对象 / 视频 / 文本 / 组件。 */
  objectType: XiahuaObjectType
  label: string
  /** 可在画布上拖动。 */
  movable?: boolean
  /** 选中后直接打开「玩法」页签（玩法总览点进来时用）。 */
  openGameplay?: boolean
  /** 图片类元素的素材地址 — 用于缩略图与生成 prompt 查询。 */
  src?: string
  /** 元素几何（x,y w×h），展示在尺寸行。 */
  rect?: string
}

/** 新插入元素的落位方式。 */
export type XiahuaPlacement = 'flow' | 'overlay'

/** 画布上新插入的元素。 */
export interface XiahuaInserted {
  id: string
  kind: 'image' | 'text' | 'button'
  label: string
  /** flow = 进入文档流参与自动排布；overlay = 绝对叠加在上层。 */
  placement: XiahuaPlacement
  /** flow：插在哪个分区之后 */
  after?: string
  /** overlay：页面坐标 */
  x?: number
  y?: number
  w: number
  h: number
  text?: string
}

/** 编辑面板可真实回写到预览的少量运行时属性。 */
export interface XiahuaOverrides {
  draws?: number
  stage?: 'shun' | 'yeshi'
  /** 画布编辑产生的变换（页面 px 偏移 + 等比缩放），按元素 id 记。 */
  offsets?: Record<string, { x: number; y: number; s?: number }>
  /** 被删除（隐藏）的元素 id。 */
  hidden?: string[]
  /** 画布上新插入的元素。 */
  inserted?: XiahuaInserted[]
}

/** 按素材地址在素材库目录里找生成 prompt。 */
function promptFor(src?: string): string | undefined {
  if (!src) return undefined
  for (const g of XIAHUA_ASSET_GROUPS) {
    const hit = g.items.find((it) => it.src === src)
    if (hit?.prompt) return hit.prompt.text
  }
  return undefined
}

/** 资产类型 → 图标。徽标与头部图标都按对象的真实类型对齐。 */
const TYPE_META: Record<XiahuaObjectType, { icon: typeof Type }> = {
  图片: { icon: ImageIcon },
  矢量对象: { icon: Box },
  视频: { icon: Film },
  文本: { icon: Type },
  组件: { icon: LayoutGrid },
}

/* ─── 小控件 ─── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-[var(--color-ink)]/45">{label}</span>
      {children}
    </label>
  )
}

const INPUT_CLS =
  'w-full rounded-[8px] border border-[var(--divider-soft)] bg-[var(--color-surface-1)] px-2.5 py-1.5 text-[13px] text-[var(--color-ink)] outline-none focus:border-sky-400'

function TextInput({
  value,
  onChange,
}: {
  value: string
  onChange?: (v: string) => void
}) {
  return (
    <input
      className={INPUT_CLS}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5 border-b border-[var(--divider-soft)] px-4 py-3.5">
      <p className="text-[12px] font-semibold text-[var(--color-ink)]/70">{title}</p>
      {children}
    </div>
  )
}

/** 图片类通用块：缩略图 + 生成 prompt + 重新生成 / 上传替换。
 *  以 src 作 key 重挂载，切换选中元素时 prompt 自动重置。 */
function ImageBlock({ src, onDemo }: { src?: string; onDemo: (msg: string) => void }) {
  return <ImageBlockInner key={src ?? 'none'} src={src} onDemo={onDemo} />
}

function ImageBlockInner({ src, onDemo }: { src?: string; onDemo: (msg: string) => void }) {
  const [prompt, setPrompt] = useState(promptFor(src) ?? '')
  return (
    <>
      {src && (
        <div className="flex items-center justify-center rounded-[10px] border border-[var(--divider-soft)] bg-[var(--color-surface-2)] p-2">
          <img src={src} alt="" className="max-h-[120px] max-w-full object-contain" draggable={false} />
        </div>
      )}
      <Field label="生成 Prompt">
        <textarea
          className={`${INPUT_CLS} min-h-[96px] resize-y leading-relaxed`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <button
          className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-[var(--color-ink)] text-[12px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
          onClick={() => onDemo('已提交重新生成，完成后自动替换到预览')}
        >
          <RefreshCw className="size-3.5" /> 重新生成
        </button>
        <button
          className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-[var(--divider-soft)] text-[12px] font-medium text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]"
          onClick={() => onDemo('演示环境暂不支持本地上传')}
        >
          <Upload className="size-3.5" /> 上传替换
        </button>
      </div>
    </>
  )
}

/* ─── 主面板 ─── */

export default function XiahuaEditPanel({
  selection,
  overrides,
  onOverrides,
  onSelect,
  onHover,
  gameplay,
  onGameplay,
  screen = 'main',
  onClose,
}: {
  selection: XiahuaSel | null
  overrides: XiahuaOverrides
  onOverrides: (next: XiahuaOverrides) => void
  /** 面板里的元素清单也可反向选中预览元素；传 null 回到图层列表。 */
  onSelect: (sel: XiahuaSel | null) => void
  /** 悬停图层时高亮预览里的对应热区。 */
  onHover?: (id: string | null) => void
  /** 玩法配置 —— 与 UI 元素通过 GAMEPLAY_BINDING 关联。 */
  gameplay: XiahuaGameplay
  onGameplay: (next: XiahuaGameplay) => void
  /** 当前正在编辑的画板 —— 图层清单按它切换。 */
  screen?: string
  onClose: () => void
}) {
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])
  const demo = (msg: string) => setToast(msg)

  const meta = selection ? TYPE_META[selection.objectType] : null
  const Icon = meta?.icon ?? Sparkles
  // 记住最后一次选中的元素，插入时以它为落位锚点。
  const [lastAnchor, setLastAnchor] = useState<XiahuaSel | null>(null)
  if (selection && selection.id !== lastAnchor?.id) setLastAnchor(selection)
  // 选中元素承载的玩法规则；切换元素时页签回到「外观」。
  const binding = selection ? GAMEPLAY_BINDING[selection.id] : undefined
  const [tab, setTab] = useState<'ui' | 'gameplay'>('ui')
  const [tabOwner, setTabOwner] = useState<string | null>(null)
  const selId = selection?.id ?? null
  if (selId !== tabOwner) {
    setTabOwner(selId)
    const want = selection?.openGameplay && binding ? 'gameplay' : 'ui'
    if (tab !== want) setTab(want)
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-surface-0)]">
      {/* 头部 — h-10 与预览工具栏同高，分隔线对齐 */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--divider-soft)] px-4">
        <Icon className="size-4 text-[var(--color-ink)]/60" />
        <span className="flex-1 truncate text-[13px] font-semibold text-[var(--color-ink)]">
          {selection ? selection.label : '编辑活动页'}
        </span>
        {selection && (
          <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-ink)]/55">
            {selection.objectType}
          </span>
        )}
        <button
          aria-label="关闭编辑"
          className="cursor-pointer rounded-md p-1 text-[var(--color-ink)]/50 hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pb-6">
        {!selection && (
          <EmptyState
            onSelect={onSelect}
            onHover={(id) => onHover?.(id)}
            overrides={overrides}
            onOverrides={onOverrides}
            lastAnchor={lastAnchor}
            screen={screen}
          />
        )}

        {selection && (
              <>
                <div className="flex items-center gap-2 border-b border-[var(--divider-soft)] px-4 py-2.5 text-[12px] text-[var(--color-ink)]/50">
                  {selection.rect && (
                    <>
                      <Ruler className="size-3.5" />
                      <span className="flex-1">位置 {selection.rect}</span>
                    </>
                  )}
                  <button
                    className="shrink-0 cursor-pointer text-[12px] text-[#357ef8] hover:underline"
                    onClick={() => onSelect(null)}
                    title="也可点画布空白处或按 Esc"
                  >
                    取消选择
                  </button>
                  {selection.movable && (
                    <button
                      className="shrink-0 cursor-pointer text-[12px] text-rose-500 hover:underline"
                      onClick={() => {
                        onOverrides({
                          ...overrides,
                          hidden: [...(overrides.hidden ?? []), selection.id],
                        })
                        onSelect(null)
                      }}
                    >
                      删除
                    </button>
                  )}
                </div>
                {/* 外观 / 玩法 页签 — 有玩法绑定的元素才出现 */}
                {binding && (
                  <div className="flex gap-1 border-b border-[var(--divider-soft)] px-4 pt-2.5">
                    {(
                      [
                        ['ui', '外观'],
                        ['gameplay', `玩法 · ${GAMEPLAY_LABEL[binding]}`],
                      ] as const
                    ).map(([k, name]) => (
                      <button
                        key={k}
                        aria-pressed={tab === k}
                        className="cursor-pointer rounded-t-[8px] px-2.5 pb-2 pt-1 text-[12px] font-medium text-[var(--color-ink)]/50 transition-colors hover:text-[var(--color-ink)] aria-pressed:border-b-2 aria-pressed:border-[#357ef8] aria-pressed:text-[#357ef8]"
                        onClick={() => setTab(k)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}

                {binding && tab === 'gameplay' ? (
                  <>
                    <div className="border-b border-[var(--divider-soft)] bg-sky-50/60 px-4 py-2.5">
                      <p className="text-[11px] leading-relaxed text-[#1a5ec7]">
                        这里改的是<b>玩法规则</b>，不是外观 —— 改完预览会按新规则重算
                        （比如增删档位，画面上的档位数量会跟着变）。
                      </p>
                    </div>
                    <XiahuaGameplayEditor value={gameplay} onChange={onGameplay} section={binding} />
                  </>
                ) : (
                  <>
                    {/* 位置与缩放 — 只对可拖动的元素给；弹层内容位置由布局算，给不出真实可改项 */}
                    {!selection.movable ? (
                      <Section title="位置">
                        <Note>
                          这是弹层里的元素，位置由弹层布局决定（居中 / 依次排布），不能单独拖动。
                          想调间距就改上面的样式项。
                        </Note>
                      </Section>
                    ) : (
                      <Section title="位置与缩放">
                        <div className="grid grid-cols-3 gap-2">
                          <Field label="偏移 X">
                            <TextInput
                              value={`${overrides.offsets?.[selection.id]?.x ?? 0} px`}
                              onChange={() => demo('直接在画布上拖动元素调整位置')}
                            />
                          </Field>
                          <Field label="偏移 Y">
                            <TextInput
                              value={`${overrides.offsets?.[selection.id]?.y ?? 0} px`}
                              onChange={() => demo('直接在画布上拖动元素调整位置')}
                            />
                          </Field>
                          <Field label="缩放">
                            <TextInput
                              value={`${Math.round((overrides.offsets?.[selection.id]?.s ?? 1) * 100)}%`}
                              onChange={() => demo('拖动选中框四角手柄调整缩放')}
                            />
                          </Field>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-[var(--color-ink)]/40">按住拖动移动 · 拖四角手柄缩放</p>
                          {overrides.offsets?.[selection.id] && (
                            <button
                              className="cursor-pointer text-[12px] text-[#357ef8] hover:underline"
                              onClick={() => {
                                const next = { ...(overrides.offsets ?? {}) }
                                delete next[selection.id]
                                onOverrides({ ...overrides, offsets: next })
                              }}
                            >
                              重置
                            </button>
                          )}
                        </div>
                      </Section>
                    )}
                    <PanelBody
                      sel={selection}
                      overrides={overrides}
                      onOverrides={onOverrides}
                      demo={demo}
                    />
                    {/* AI 修改入口 — 与聊天链路同款语义 */}
                    <Section title="AI 修改">
                      <AiAskRow demo={demo} />
                    </Section>
                  </>
                )}
              </>
        )}
      </div>

      {toast && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-3 py-1.5 text-[12px] text-white">
          {toast}
        </div>
      )}
    </div>
  )
}

function AiAskRow({ demo }: { demo: (m: string) => void }) {
  const [ask, setAsk] = useState('')
  return (
    <div className="flex gap-2">
      <input
        className={INPUT_CLS}
        placeholder="告诉 AI 怎么改，如：换成蓝色调"
        value={ask}
        onChange={(e) => setAsk(e.target.value)}
      />
      <button
        className="h-8 shrink-0 cursor-pointer rounded-[8px] bg-[var(--color-ink)] px-3 text-[12px] font-medium text-[var(--color-ink-contrast)] transition-opacity hover:opacity-90"
        onClick={() => {
          if (!ask.trim()) return
          setAsk('')
          demo('已把修改意图发给 AI，稍后应用')
        }}
      >
        发送
      </button>
    </div>
  )
}

/** 无选中：选择引导 + 插入 + 图层清单（悬停可高亮预览里的对应热区）。 */
function EmptyState({
  onSelect,
  onHover,
  overrides,
  onOverrides,
  lastAnchor,
  screen,
}: {
  onSelect: (sel: XiahuaSel) => void
  onHover: (id: string | null) => void
  overrides: XiahuaOverrides
  onOverrides: (next: XiahuaOverrides) => void
  lastAnchor: XiahuaSel | null
  screen: string
}) {
  const hidden = overrides.hidden ?? []
  const inserted = overrides.inserted ?? []
  const onMain = screen === 'main'
  // 图层跟着当前画板走：主会场按页面从上到下分组，其余画板列它自己的元素。
  const targets = onMain ? buildTargets(overrides) : (SCREEN_TARGETS[screen] ?? [])
  const groups: { title: string; ids: string[] }[] = onMain
    ? [
        { title: '头部', ids: ['kv', 'title', 'stage-tabs', 'rail'] },
        { title: '主操作', ids: ['btn-draw', 'btn-my-cards', 'btn-my-prizes'] },
        { title: '集卡面板', ids: ['collect-info', 'tier-row', 'card-strip', 'bean-bar'] },
        { title: '下半屏', ids: ['sec-tasks', 'sec-topics', 'sec-banner', 'footer'] },
      ]
    : [{ title: SCREEN_GROUP_TITLE[screen] ?? '本页元素', ids: targets.map((t) => t.id) }]
  const insertedIds = inserted.filter((i) => !hidden.includes(i.id)).map((i) => i.id)
  if (onMain && insertedIds.length) groups.push({ title: '新增元素', ids: insertedIds })

  const decision = decidePlacement(lastAnchor)
  const addElement = (kind: 'image' | 'text' | 'button') => {
    const n = inserted.length + 1
    const label =
      kind === 'image' ? `新增图片 ${n}` : kind === 'text' ? `新增文本 ${n}` : `新增按钮 ${n}`
    const size =
      kind === 'image'
        ? { w: 375, h: 120 }
        : kind === 'text'
          ? { w: 200, h: 28 }
          : { w: 180, h: 44 }
    // 递增编号（纯计算，删除后不会与历史 id 冲突）
    const nextNo = Math.max(0, ...inserted.map((i) => Number(i.id.slice(4)) || 0)) + 1
    const el: XiahuaInserted = {
      id: `ins-${nextNo}`,
      kind,
      label,
      placement: decision.placement,
      after: decision.after,
      x: decision.x,
      y: decision.y,
      // flow 元素满宽，overlay 保持自身尺寸
      w: decision.placement === 'flow' ? 375 : size.w,
      h: kind === 'image' ? 120 : size.h,
      text: kind === 'text' ? '新文本' : kind === 'button' ? '按钮文案' : undefined,
    }
    onOverrides({ ...overrides, inserted: [...inserted, el] })
  }

  return (
    <div className="px-4 py-4">
      {/* 玩法总览 — 进入编辑就能看到这个活动有哪些玩法、分别挂在哪个元素上 */}
      <div className="mb-4 rounded-[10px] border border-[var(--divider-soft)] p-3">
        <p className="mb-1 text-[12px] font-semibold text-[var(--color-ink)]/70">
          玩法 · {Object.keys(GAMEPLAY_BINDING).length} 条规则
        </p>
        <p className="mb-2 text-[11px] leading-relaxed text-[var(--color-ink)]/40">
          画布上带 <span className="rounded-full bg-[#a2ff37] px-1 text-[9px] text-[#2f1912]">⚙</span>{' '}
          的元素都挂着玩法规则，点下面任一条直接进它的玩法编辑。
        </p>
        <div className="space-y-0.5">
          {Object.entries(GAMEPLAY_BINDING).map(([elId, ruleKey]) => {
            const t = targets.find((x) => x.id === elId)
            if (!t) return null
            return (
              <button
                key={elId}
                className="flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 text-left hover:bg-sky-50"
                onMouseEnter={() => onHover(elId)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect({ ...toSel(t), openGameplay: true })}
              >
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[#a2ff37]/25 text-[10px]">
                  ⚙
                </span>
                <span className="flex-1 truncate text-[13px] text-[var(--color-ink)]/85">
                  {GAMEPLAY_LABEL[ruleKey]}
                </span>
                <span className="shrink-0 text-[11px] text-[var(--color-ink)]/35">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 插入元素 — 自动判断落位 */}
      <div className="mb-4 rounded-[10px] border border-[var(--divider-soft)] p-3">
        <p className="mb-2 text-[12px] font-semibold text-[var(--color-ink)]/70">插入元素</p>
        <div className="mb-2 flex gap-2">
          {(
            [
              ['image', '图片'],
              ['text', '文本'],
              ['button', '按钮'],
            ] as const
          ).map(([k, name]) => (
            <button
              key={k}
              className="h-8 flex-1 cursor-pointer rounded-[8px] border border-[var(--divider-soft)] text-[12px] font-medium text-[var(--color-ink)]/75 hover:border-[#357ef8] hover:text-[#357ef8]"
              onClick={() => addElement(k)}
            >
              + {name}
            </button>
          ))}
        </div>
        <div className="flex items-start gap-1.5 rounded-[8px] bg-[var(--color-surface-2)] px-2.5 py-2">
          <span
            className={`mt-[2px] shrink-0 rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold ${
              decision.placement === 'flow'
                ? 'bg-emerald-500/15 text-emerald-600'
                : 'bg-violet-500/15 text-violet-600'
            }`}
          >
            {decision.placement === 'flow' ? '自动排布' : '叠加'}
          </span>
          <p className="text-[11px] leading-relaxed text-[var(--color-ink)]/55">{decision.reason}</p>
        </div>
      </div>

      {/* 已删除 — 可恢复 */}
      {hidden.length > 0 && (
        <div className="mb-4 rounded-[10px] border border-[var(--divider-soft)] p-3">
          <p className="mb-2 text-[12px] font-semibold text-[var(--color-ink)]/70">
            已删除 · {hidden.length}
          </p>
          <div className="space-y-0.5">
            {hidden.map((id) => {
              const t =
                XIAHUA_EDIT_TARGETS.find((x) => x.id === id) ??
                inserted.find((x) => x.id === id)
              return (
                <div key={id} className="flex items-center gap-2 rounded-[8px] px-2 py-1.5">
                  <span className="flex-1 truncate text-[13px] text-[var(--color-ink)]/45 line-through">
                    {t?.label ?? id}
                  </span>
                  <button
                    className="shrink-0 cursor-pointer text-[12px] text-[#357ef8] hover:underline"
                    onClick={() =>
                      onOverrides({ ...overrides, hidden: hidden.filter((h) => h !== id) })
                    }
                  >
                    恢复
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="mb-2 text-[11px] font-semibold text-[var(--color-ink)]/45">
        图层 · {targets.length} 个可编辑对象
      </p>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-1 px-2.5 text-[11px] text-[var(--color-ink)]/35">{g.title}</p>
            <div className="space-y-0.5">
              {g.ids.map((id) => {
                const t = targets.find((x) => x.id === id)
                if (!t) return null
                const MIcon = TYPE_META[t.objectType].icon
                return (
                  <button
                    key={t.id}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left hover:bg-sky-50"
                    onClick={() => onSelect(toSel(t))}
                    onMouseEnter={() => onHover(t.id)}
                    onMouseLeave={() => onHover(null)}
                  >
                    <MIcon className="size-3.5 shrink-0 text-[var(--color-ink)]/45" />
                    <span className="flex-1 truncate text-[13px] text-[var(--color-ink)]/85">{t.label}</span>
                    {GAMEPLAY_BINDING[t.id] && (
                      <span className="shrink-0 rounded-[4px] bg-[#a2ff37]/30 px-1 text-[10px] text-[#4a6b00]">
                        玩法
                      </span>
                    )}
                    <span className="shrink-0 font-mono text-[10px] text-[var(--color-ink)]/30">
                      {t.rect[2]}×{t.rect[3]}
                    </span>
                    <span className="w-[52px] shrink-0 text-right text-[11px] text-[var(--color-ink)]/35">
                      {t.objectType}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── 按元素出针对性属性 ─── */

/** 只读说明行 —— 交代这个元素由什么决定，避免给出假的可编辑项。 */
function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] leading-relaxed text-[var(--color-ink)]/40">{children}</p>
  )
}

/** 行为下拉（演示：固定几个可选项）。 */
function Behavior({
  value,
  options,
  demo,
}: {
  value: string
  options: string[]
  demo: (m: string) => void
}) {
  return (
    <select
      className={`${INPUT_CLS} cursor-pointer`}
      value={value}
      onChange={() => demo('演示环境固定该行为')}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

const RULES_TEXT = `活动时间：6月30日 10:00 — 8月31日 23:59
集齐 2 / 4 / 7 / 9 种夜食卡，分别解锁 2元券、5元券、43元券包与小马黄金转运珠，奖励可叠加领取。
抽卡机会来自每日首次进入、带话题投稿、赠送好友、浏览合作商家。
同一种卡持有 2 张及以上可赠送好友，好友领取后生效。
优惠券每日限量发放，先到先得；实物奖励需填写收货信息，活动结束后 90 天内寄出。`

function PanelBody({
  sel,
  overrides,
  onOverrides,
  demo,
}: {
  sel: XiahuaSel
  overrides: XiahuaOverrides
  onOverrides: (next: XiahuaOverrides) => void
  demo: (m: string) => void
}) {
  switch (sel.id) {
    /* ── 主会场 · 头部 ── */
    case 'kv':
      return (
        <>
          <Section title="画面内容">
            <Field label="主体"><TextInput value="小马 IP + 满桌夜宵" onChange={() => demo('改主体会重新生成整张主视觉')} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="场景"><TextInput value="深夜食堂 · 霓虹窗景" onChange={() => demo('改场景会重新生成')} /></Field>
              <Field label="色调"><TextInput value="暖橙 / 烟火气" onChange={() => demo('改色调会重新生成')} /></Field>
            </div>
            <Field label="安全区">
              <Behavior value="顶部 130px 留给标题" options={['顶部 130px 留给标题', '不留安全区']} demo={demo} />
            </Field>
            <Note>主视觉是整页的底，改它会影响标题和阶段 Tab 的可读性。</Note>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'title':
      return (
        <>
          <Section title="文案">
            <Field label="主标题"><TextInput value="这夏夯爆了" onChange={() => demo('标题是整体生成的艺术字，改文案会重新生成')} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="档期"><TextInput value="6.30-8.31" onChange={() => demo('改档期会重新生成艺术字')} /></Field>
              <Field label="高亮色"><TextInput value="#A2FF37" onChange={() => demo('改颜色会重新生成艺术字')} /></Field>
            </div>
            <Field label="副标题"><TextInput value="集夏日夜食 赢小马黄金转运珠！" onChange={() => demo('改副标题会重新生成艺术字')} /></Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'stage-tabs':
      return (
        <Section title="阶段配置">
          <Field label="当前阶段">
            <div className="flex gap-2">
              {(
                [
                  ['shun', '夏天马上顺'],
                  ['yeshi', '夏日夜食指南'],
                ] as const
              ).map(([id, name]) => (
                <button
                  key={id}
                  aria-pressed={(overrides.stage ?? 'yeshi') === id}
                  className="h-8 flex-1 cursor-pointer rounded-[8px] border border-[var(--divider-soft)] text-[12px] text-[var(--color-ink)]/70 aria-pressed:border-sky-400 aria-pressed:bg-sky-500/10 aria-pressed:text-sky-600"
                  onClick={() => onOverrides({ ...overrides, stage: id })}
                >
                  {name}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="一阶段名称"><TextInput value="夏天马上顺" onChange={() => demo('阶段名称改动仅预览')} /></Field>
            <Field label="二阶段名称"><TextInput value="夏日夜食指南" onChange={() => demo('阶段名称改动仅预览')} /></Field>
          </div>
          <Field label="第三阶段"><TextInput value="敬请期待（未解锁）" onChange={() => demo('第三阶段档期未定，暂不可改')} /></Field>
          <Note>切换阶段只换头部内容，集卡进度与奖励不重置。</Note>
        </Section>
      )
    case 'rail':
      return (
        <Section title="侧栏入口">
          {(
            [
              ['分享', '唤起分享面板'],
              ['规则', '打开活动规则弹窗'],
            ] as const
          ).map(([n, act]) => (
            <div key={n} className="space-y-2 rounded-[8px] border border-[var(--divider-soft)] p-2.5">
              <div className="grid grid-cols-[1fr_72px] gap-2">
                <Field label="文案"><TextInput value={n} onChange={() => demo('侧栏文案改动仅预览')} /></Field>
                <Field label="显示"><Behavior value="开" options={['开', '关']} demo={demo} /></Field>
              </div>
              <Field label="点击行为"><Behavior value={act} options={[act]} demo={demo} /></Field>
            </div>
          ))}
        </Section>
      )

    /* ── 主会场 · 主操作 ── */
    case 'btn-draw':
      return (
        <>
          <Section title="按钮属性">
            <Field label="按钮文案"><TextInput value="抽夏日夜食" onChange={() => demo('按钮是整块素材，改文案会重新生成')} /></Field>
            <Field label="剩余次数角标">
              <input
                type="number"
                min={0}
                max={99}
                className={INPUT_CLS}
                value={overrides.draws ?? 9}
                onChange={(e) => onOverrides({ ...overrides, draws: Math.max(0, Math.min(99, Number(e.target.value) || 0)) })}
              />
            </Field>
            <Field label="次数为 0 时">
              <Behavior value="提示去做任务攒次数" options={['提示去做任务攒次数', '按钮置灰不可点']} demo={demo} />
            </Field>
            <Field label="点击行为"><Behavior value="消耗 1 次 → 抽卡动效 → 开卡结算" options={['消耗 1 次 → 抽卡动效 → 开卡结算']} demo={demo} /></Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'btn-my-cards':
    case 'btn-my-prizes': {
      const isCards = sel.id === 'btn-my-cards'
      return (
        <>
          <Section title="入口属性">
            <Field label="入口文案">
              <TextInput value={isCards ? '我的夜食' : '我的奖品'} onChange={() => demo('入口是整块素材，改文案会重新生成')} />
            </Field>
            <Field label="点击行为">
              <Behavior
                value={isCards ? '打开卡册（我的夜食）' : '打开我的奖品'}
                options={[isCards ? '打开卡册（我的夜食）' : '打开我的奖品']}
                demo={demo}
              />
            </Field>
            <Field label="角标">
              <Behavior
                value={isCards ? '有可赠送的卡时显示红点' : '有未领取奖励时显示红点'}
                options={[isCards ? '有可赠送的卡时显示红点' : '有未领取奖励时显示红点', '不显示']}
                demo={demo}
              />
            </Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    }

    /* ── 主会场 · 集卡面板 ── */
    case 'collect-info':
      return (
        <Section title="进度文案">
          <Field label="主文案模板"><TextInput value="再抽 {N} 种" onChange={() => demo('文案模板在「玩法」页签里改')} /></Field>
          <Field label="副文案模板"><TextInput value="兑 {下一档奖励}" onChange={() => demo('文案模板在「玩法」页签里改')} /></Field>
          <Field label="集满时"><TextInput value="全部集齐！" onChange={() => demo('文案模板在「玩法」页签里改')} /></Field>
          <Field label="数字高亮色"><TextInput value="#FF4D2E" onChange={() => demo('高亮色改动仅预览')} /></Field>
          <Note>{'{N} 会按当前还差几种实时替换，切到「玩法」页签能改模板本身。'}</Note>
        </Section>
      )
    case 'tier-row':
      return (
        <Section title="档位展示">
          <Field label="排布方式"><Behavior value="等距横排 · 自动居中" options={['等距横排 · 自动居中', '左对齐']} demo={demo} /></Field>
          <Field label="可领取时"><Behavior value="放大并上移 + 呼吸动效" options={['放大并上移 + 呼吸动效', '仅高亮不动']} demo={demo} /></Field>
          <Field label="已领取时"><Behavior value="半透明 + ✓已领" options={['半透明 + ✓已领', '直接隐藏']} demo={demo} /></Field>
          <Field label="未解锁时"><Behavior value="🔒 + 还差几种" options={['🔒 + 还差几种', '只显示锁']} demo={demo} /></Field>
          <Note>档位的门槛和奖励内容在「玩法」页签里改 —— 这里只管怎么显示。</Note>
        </Section>
      )
    case 'card-strip':
      return (
        <Section title="卡槽展示">
          <div className="grid grid-cols-2 gap-2">
            <Field label="每屏显示"><TextInput value="5 格 · 可横滑" onChange={() => demo('卡槽按卡池数量自动排布')} /></Field>
            <Field label="未获得样式"><Behavior value="石膏灰" options={['石膏灰', '纯色剪影']} demo={demo} /></Field>
          </div>
          <Field label="数量角标"><Behavior value="持有 ≥2 张时显示 xN" options={['持有 ≥2 张时显示 xN', '始终显示']} demo={demo} /></Field>
          <p className="pt-1 text-[12px] text-[var(--color-ink)]/55">单张卡面：</p>
          {['沸腾火锅', '红火小龙虾', '滋滋烤肉', '鲜烧黄鱼', '浓香披萨', '香脆炸鸡', '冰爽柠檬茶', '解馋卤味', '上头螺蛳粉'].map((n) => (
            <div key={n} className="flex items-center justify-between rounded-[8px] px-2 py-1.5 hover:bg-[var(--fill-hover)]">
              <span className="text-[13px] text-[var(--color-ink)]/85">{n}</span>
              <button
                className="cursor-pointer text-[12px] text-sky-600 hover:underline"
                onClick={() => demo(`已把「${n}」的卡面加入重新生成队列`)}
              >
                重新生成
              </button>
            </div>
          ))}
          <Note>卡的种类和文案在「玩法」页签的卡池里改，加一种这里会自动多一格。</Note>
        </Section>
      )
    case 'bean-bar':
      return (
        <>
          <Section title="金豆条">
            <Field label="主文案"><TextInput value="烹饪得金豆，好礼兑不停" onChange={() => demo('金豆条是整块素材，改文案会重新生成')} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="金豆数"><TextInput value="99999" onChange={() => demo('金豆数由账户实时读取')} /></Field>
              <Field label="按钮文案"><TextInput value="冲!" onChange={() => demo('按钮文案改动仅预览')} /></Field>
            </div>
            <Field label="点击行为"><Behavior value="跳转接金豆小游戏" options={['跳转接金豆小游戏', '暂不跳转（灰态）']} demo={demo} /></Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )

    /* ── 主会场 · 下半屏 ── */
    case 'sec-tasks':
      return (
        <>
          <Section title="任务区">
            <Field label="区块标题"><TextInput value="玩一夏 赚更多" onChange={() => demo('区块是整块素材，改标题会重新生成')} /></Field>
            <Field label="任务来源"><Behavior value="跟随玩法配置的任务发放" options={['跟随玩法配置的任务发放', '固定 4 条']} demo={demo} /></Field>
            <Field label="每条右侧"><Behavior value="显示「去完成 / 已完成」" options={['显示「去完成 / 已完成」', '只显示奖励次数']} demo={demo} /></Field>
            <Note>任务的条目和发放次数在「活动玩法配置 · 任务发放」里改。</Note>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'sec-topics':
      return (
        <>
          <Section title="话题区">
            <Field label="区块标题"><TextInput value="暑期灵感" onChange={() => demo('区块是整块素材，改标题会重新生成')} /></Field>
            <Field label="内容来源"><Behavior value="按话题拉取投稿流" options={['按话题拉取投稿流', '人工精选']} demo={demo} /></Field>
            <Field label="排序"><Behavior value="热度优先" options={['热度优先', '最新优先']} demo={demo} /></Field>
            <Field label="话题"><TextInput value="#这夏夯爆了 #夏日夜食" onChange={() => demo('话题改动需同步内容侧')} /></Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'sec-banner':
      return (
        <>
          <Section title="投放">
            <Field label="投放位"><TextInput value="活动页底部通栏" onChange={() => demo('投放位固定')} /></Field>
            <Field label="跳转链接"><TextInput value="douyin://life/summer-2026" onChange={() => demo('链接改动仅预览')} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="开始"><TextInput value="6.30 10:00" onChange={() => demo('投放时段改动仅预览')} /></Field>
              <Field label="结束"><TextInput value="8.31 23:59" onChange={() => demo('投放时段改动仅预览')} /></Field>
            </div>
            <Note>这一块是可下线的运营位，删掉后下面的内容会自动上提。</Note>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'footer':
      return (
        <>
          <Section title="页脚">
            <Field label="字标"><TextInput value="抖音生活服务" onChange={() => demo('字标改动需走品牌审核')} /></Field>
            <Field label="点击行为"><Behavior value="不可点" options={['不可点', '跳转生活服务主页']} demo={demo} /></Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )

    /* ── 开卡结算 ── */
    case 'rs-title':
      return (
        <>
          <Section title="标题">
            <Field label="文案"><TextInput value="恭喜你获得" onChange={() => demo('标题是艺术字，改文案会重新生成')} /></Field>
            <Field label="入场动效"><Behavior value="从上落下 + 回弹" options={['从上落下 + 回弹', '淡入']} demo={demo} /></Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'rs-card':
      return (
        <Section title="开卡大卡">
          <Field label="卡面来源"><Behavior value="按抽中的品类自动取" options={['按抽中的品类自动取', '固定一张']} demo={demo} /></Field>
          <Field label="入场动效"><Behavior value="放大 + 轻微旋转落定" options={['放大 + 轻微旋转落定', '翻牌', '淡入']} demo={demo} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="尺寸"><TextInput value="260 × 357" onChange={() => demo('大卡尺寸固定，避免不同卡面比例不一致')} /></Field>
            <Field label="投影"><Behavior value="重投影" options={['重投影', '无投影']} demo={demo} /></Field>
          </div>
          <Note>卡面素材在「素材 · 夜食卡面」里逐张改；这里只管结算页怎么展示。</Note>
        </Section>
      )
    case 'rs-badge':
      return (
        <Section title="新卡角标">
          <Field label="文案"><TextInput value="新卡入手!" onChange={() => demo('角标文案改动仅预览')} /></Field>
          <Field label="显示条件"><Behavior value="仅抽到新品类时" options={['仅抽到新品类时', '每次都显示']} demo={demo} /></Field>
          <Field label="重复卡时"><TextInput value="显示「已有 xN」" onChange={() => demo('重复卡文案改动仅预览')} /></Field>
        </Section>
      )
    case 'rs-accept':
      return (
        <Section title="按钮">
          <Field label="文案"><TextInput value="开心收下" onChange={() => demo('按钮文案改动仅预览')} /></Field>
          <Field label="点击行为"><Behavior value="收下并回到主会场" options={['收下并回到主会场', '收下并继续抽']} demo={demo} /></Field>
          <Field label="还有次数时"><Behavior value="文案变「再抽一次」" options={['文案变「再抽一次」', '文案不变']} demo={demo} /></Field>
        </Section>
      )
    case 'rs-close':
      return (
        <Section title="关闭按钮">
          <Field label="样式"><Behavior value="圆形半透明 ✕" options={['圆形半透明 ✕', '文字「跳过」']} demo={demo} /></Field>
          <Field label="点击行为"><Behavior value="直接关闭并入卡册" options={['直接关闭并入卡册']} demo={demo} /></Field>
          <Note>不管从哪个按钮退出，卡都已经入账，不会丢。</Note>
        </Section>
      )

    /* ── 我的夜食（卡册） ── */
    case 'cd-back':
      return (
        <Section title="返回">
          <Field label="点击行为"><Behavior value="回到主会场" options={['回到主会场', '回到上一页']} demo={demo} /></Field>
          <Field label="手势"><Behavior value="支持右滑返回" options={['支持右滑返回', '仅按钮返回']} demo={demo} /></Field>
        </Section>
      )
    case 'cd-tabs':
      return (
        <Section title="卡册页签">
          <div className="grid grid-cols-2 gap-2">
            <Field label="页签一"><TextInput value="装备卡" onChange={() => demo('页签名称改动仅预览')} /></Field>
            <Field label="页签二"><TextInput value="夜食卡" onChange={() => demo('页签名称改动仅预览')} /></Field>
          </div>
          <Field label="默认选中"><Behavior value="夜食卡" options={['夜食卡', '装备卡']} demo={demo} /></Field>
          <Field label="选中态"><Behavior value="加粗 + 下划线" options={['加粗 + 下划线', '胶囊底']} demo={demo} /></Field>
        </Section>
      )
    case 'cd-history':
      return (
        <Section title="交换记录">
          <Field label="入口文案"><TextInput value="交换记录" onChange={() => demo('入口文案改动仅预览')} /></Field>
          <Field label="点击行为"><Behavior value="打开赠送 / 收卡流水" options={['打开赠送 / 收卡流水']} demo={demo} /></Field>
          <Field label="保留时长"><TextInput value="活动结束后 30 天" onChange={() => demo('保留时长由数据侧决定')} /></Field>
        </Section>
      )
    case 'cd-grid':
      return (
        <Section title="卡格列表">
          <div className="grid grid-cols-2 gap-2">
            <Field label="列数"><Behavior value="3 列" options={['3 列', '2 列']} demo={demo} /></Field>
            <Field label="排序"><Behavior value="按卡池顺序" options={['按卡池顺序', '已获得优先']} demo={demo} /></Field>
          </div>
          <Field label="可赠送时按钮"><TextInput value="赠送" onChange={() => demo('按钮文案改动仅预览')} /></Field>
          <Field label="只有 1 张时"><TextInput value="赠送（置灰）" onChange={() => demo('按钮文案改动仅预览')} /></Field>
          <Field label="未获得时"><TextInput value="求赠送" onChange={() => demo('按钮文案改动仅预览')} /></Field>
          <Note>赠送门槛（同种卡至少几张）在「玩法」页签的赠送规则里改。</Note>
        </Section>
      )

    /* ── 兑奖弹窗 ── */
    case 'rd-title':
      return (
        <Section title="标题">
          <Field label="文案模板"><TextInput value="集齐{N}种夜食!" onChange={() => demo('{N} 由当前档位实时替换')} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="字号"><TextInput value="26" onChange={() => demo('字号改动仅预览')} /></Field>
            <Field label="颜色"><TextInput value="#FFE3B8" onChange={() => demo('颜色改动仅预览')} /></Field>
          </div>
        </Section>
      )
    case 'rd-gift':
      return (
        <>
          <Section title="奖励图">
            <Field label="取图方式"><Behavior value="按档位奖励类型自动取" options={['按档位奖励类型自动取', '固定一张']} demo={demo} /></Field>
            <Field label="入场动效"><Behavior value="弹出 + 轻微旋转" options={['弹出 + 轻微旋转', '淡入']} demo={demo} /></Field>
          </Section>
          <Section title="素材">
            <ImageBlock src={sel.src} onDemo={demo} />
          </Section>
        </>
      )
    case 'rd-reward':
      return (
        <Section title="奖励文案">
          <Field label="文案模板"><TextInput value="恭喜获得 {奖励}" onChange={() => demo('{奖励} 取自该档位的奖励名')} /></Field>
          <Field label="奖励名高亮色"><TextInput value="#FFD76E" onChange={() => demo('高亮色改动仅预览')} /></Field>
          <Note>奖励名本身在「玩法」页签的奖励档位里改。</Note>
        </Section>
      )
    case 'rd-accept':
      return (
        <Section title="按钮">
          <Field label="文案"><TextInput value="开心收下" onChange={() => demo('按钮文案改动仅预览')} /></Field>
          <Field label="点击行为"><Behavior value="领取并写入我的奖品" options={['领取并写入我的奖品']} demo={demo} /></Field>
          <Field label="实物奖励时"><Behavior value="先弹收货信息表单" options={['先弹收货信息表单', '直接领取']} demo={demo} /></Field>
        </Section>
      )

    /* ── 活动规则 ── */
    case 'rl-panel':
      return (
        <Section title="弹窗样式">
          <div className="grid grid-cols-2 gap-2">
            <Field label="宽度"><TextInput value="327" onChange={() => demo('弹窗宽度固定左右各留 24')} /></Field>
            <Field label="圆角"><TextInput value="18" onChange={() => demo('圆角改动仅预览')} /></Field>
          </div>
          <Field label="底色"><TextInput value="#FDF6EC" onChange={() => demo('底色改动仅预览')} /></Field>
          <Field label="打开方式"><Behavior value="点右侧「规则」竖栏" options={['点右侧「规则」竖栏', '首次进入自动弹出']} demo={demo} /></Field>
          <Field label="点遮罩"><Behavior value="关闭弹窗" options={['关闭弹窗', '不响应']} demo={demo} /></Field>
        </Section>
      )
    case 'rl-title':
      return (
        <Section title="标题">
          <Field label="文案"><TextInput value="活动规则" onChange={() => demo('标题改动仅预览')} /></Field>
          <Field label="对齐"><Behavior value="居中" options={['居中', '左对齐']} demo={demo} /></Field>
        </Section>
      )
    case 'rl-body':
      return (
        <Section title="规则正文">
          <Field label="正文">
            <textarea
              className={`${INPUT_CLS} min-h-[180px] resize-y leading-relaxed`}
              defaultValue={RULES_TEXT}
              onChange={() => demo('规则正文改动需走法务审核')}
            />
          </Field>
          <Field label="超长时"><Behavior value="正文内滚动，按钮固定在底部" options={['正文内滚动，按钮固定在底部', '整个弹窗滚动']} demo={demo} /></Field>
          <Note>档期、档位、赠送门槛这些数字建议跟玩法配置保持一致，改玩法时记得回来核对。</Note>
        </Section>
      )
    case 'rl-ok':
      return (
        <Section title="按钮">
          <Field label="文案"><TextInput value="我知道了" onChange={() => demo('按钮文案改动仅预览')} /></Field>
          <Field label="点击行为"><Behavior value="关闭弹窗" options={['关闭弹窗', '关闭并标记已读']} demo={demo} /></Field>
        </Section>
      )

    default:
      /* 新插入的元素：按类型给最小可用属性 */
      if (sel.id.startsWith('ins-')) {
        const ins = (overrides.inserted ?? []).find((i) => i.id === sel.id)
        return (
          <Section title="新增元素">
            <Field label="名称"><TextInput value={ins?.label ?? sel.label} onChange={() => demo('名称改动仅预览')} /></Field>
            {ins?.kind !== 'image' && (
              <Field label="文案"><TextInput value={ins?.text ?? ''} onChange={() => demo('文案改动仅预览')} /></Field>
            )}
            <Field label="落位"><TextInput value={ins?.placement === 'flow' ? '自动排布（参与文档流）' : '叠加（绝对定位）'} onChange={() => demo('落位在插入时判定')} /></Field>
            {ins?.kind === 'image' && <ImageBlock src={sel.src} onDemo={demo} />}
          </Section>
        )
      }
      return (
        <Section title="素材">
          <ImageBlock src={sel.src} onDemo={demo} />
        </Section>
      )
  }
}

/* ─── 可编辑元素清单（页面坐标，预览按此打点） ─── */

export interface XiahuaEditTarget {
  id: string
  kind: XiahuaSelKind
  objectType: XiahuaObjectType
  label: string
  /** 页面坐标 [x, y, w, h]，页面宽 375。 */
  rect: [number, number, number, number]
  /** 可在画布上拖动（整段切图 / 满宽分区不可动）。 */
  movable?: boolean
  src?: string
}

const R = '/assets/xiahua'

/** 热区清单（版式固定，素材地址随 preset 换）。 */
export const XIAHUA_EDIT_TARGETS: XiahuaEditTarget[] = [
  { id: 'kv', kind: 'image', objectType: '图片', movable: true, label: '主视觉 KV', rect: [0, 0, 375, 494], src: `${R}/head-kv.png` },
  { id: 'title', kind: 'text', objectType: '矢量对象', label: '活动标题字', rect: [74, 25, 247, 99], movable: true, src: `${R}/title.png` },
  { id: 'stage-tabs', kind: 'component', objectType: '组件', label: '阶段切换 Tab', rect: [94, 126, 185, 28], movable: true },
  { id: 'rail', kind: 'component', objectType: '组件', label: '分享 / 规则栏', rect: [351, 97, 24, 86], movable: true },
  { id: 'btn-draw', kind: 'button', objectType: '图片', label: '抽夜食按钮', rect: [84, 375, 207, 50], movable: true, src: `${R}/btn-draw.png` },
  { id: 'btn-my-cards', kind: 'button', objectType: '图片', label: '我的夜食入口', rect: [0, 379, 56, 42], movable: true, src: `${R}/btn-my-cards.png` },
  { id: 'btn-my-prizes', kind: 'button', objectType: '图片', label: '我的奖品入口', rect: [319, 379, 56, 42], movable: true, src: `${R}/btn-my-prizes.png` },
  { id: 'collect-info', kind: 'text', objectType: '文本', movable: true, label: '集卡进度文案', rect: [22, 452, 110, 44] },
  { id: 'tier-row', kind: 'component', objectType: '组件', movable: true, label: '奖励档位', rect: [118, 422, 236, 62] },
  { id: 'card-strip', kind: 'component', objectType: '组件', label: '夜食卡槽', rect: [14, 502, 347, 82], movable: true },
  { id: 'bean-bar', kind: 'image', objectType: '图片', label: '金豆入口条', rect: [10, 596, 355, 72], movable: true, src: `${R}/bean-bar.png` },
  { id: 'sec-tasks', kind: 'section', objectType: '图片', movable: true, label: '任务区', rect: [0, 692, 375, 449], src: `${R}/sec-tasks.png` },
  { id: 'sec-topics', kind: 'section', objectType: '图片', movable: true, label: '话题区', rect: [0, 1177, 375, 317], src: `${R}/sec-topics.png` },
  { id: 'sec-banner', kind: 'section', objectType: '图片', movable: true, label: '底部 banner', rect: [0, 1530, 375, 158], src: `${R}/sec-banner.png` },
  { id: 'footer', kind: 'image', objectType: '矢量对象', movable: true, label: '页脚字标', rect: [127, 1722, 121, 32], src: `${R}/footer-logo.png` },
]

/** 另外 4 个画板（弹层/整页）的可选中元素 —— 视口坐标，不参与流式排布。
 *  这些是弹层内容，位置由布局决定，所以只可选中、不可拖动。 */
export const SCREEN_TARGETS: Record<string, XiahuaEditTarget[]> = {
  result: [
    { id: 'rs-title', kind: 'image', objectType: '图片', label: '开卡标题', rect: [48, 126, 281, 54], src: `${R}/result-title.png` },
    { id: 'rs-card', kind: 'image', objectType: '图片', label: '开卡大卡', rect: [57, 230, 260, 357] },
    { id: 'rs-badge', kind: 'text', objectType: '文本', label: '新卡角标', rect: [258, 214, 84, 28] },
    { id: 'rs-accept', kind: 'button', objectType: '组件', label: '开心收下按钮', rect: [101, 626, 172, 48] },
    { id: 'rs-close', kind: 'button', objectType: '组件', label: '关闭按钮', rect: [171, 706, 32, 32] },
  ],
  cards: [
    { id: 'cd-back', kind: 'button', objectType: '组件', label: '返回按钮', rect: [10, 16, 26, 26] },
    { id: 'cd-tabs', kind: 'component', objectType: '组件', label: '卡册页签', rect: [96, 14, 183, 30] },
    { id: 'cd-history', kind: 'text', objectType: '文本', label: '交换记录入口', rect: [290, 17, 72, 22] },
    { id: 'cd-grid', kind: 'component', objectType: '组件', label: '卡格列表', rect: [12, 68, 351, 600] },
  ],
  redeem: [
    { id: 'rd-title', kind: 'text', objectType: '文本', label: '集齐提示', rect: [88, 150, 199, 38] },
    { id: 'rd-gift', kind: 'image', objectType: '图片', label: '奖励图', rect: [82, 210, 210, 210], src: `${R}/envelope.png` },
    { id: 'rd-reward', kind: 'text', objectType: '文本', label: '奖励文案', rect: [88, 440, 199, 26] },
    { id: 'rd-accept', kind: 'button', objectType: '组件', label: '开心收下按钮', rect: [101, 498, 172, 48] },
  ],
  rules: [
    { id: 'rl-panel', kind: 'component', objectType: '组件', label: '规则弹窗', rect: [24, 89, 327, 634] },
    { id: 'rl-title', kind: 'text', objectType: '文本', label: '规则标题', rect: [130, 109, 115, 26] },
    { id: 'rl-body', kind: 'text', objectType: '文本', label: '规则正文', rect: [44, 146, 287, 480] },
    { id: 'rl-ok', kind: 'button', objectType: '组件', label: '我知道了按钮', rect: [117, 662, 140, 40] },
  ],
}

/** 非主会场画板的图层分组名。 */
export const SCREEN_GROUP_TITLE: Record<string, string> = {
  result: '开卡结算页',
  cards: '卡册页',
  redeem: '兑奖弹窗',
  rules: '规则弹窗',
}

export function toSel(t: XiahuaEditTarget): XiahuaSel {
  return {
    id: t.id,
    kind: t.kind,
    objectType: t.objectType,
    label: t.label,
    movable: t.movable,
    src: t.src,
    rect: `${t.rect[0]},${t.rect[1]} ${t.rect[2]}×${t.rect[3]}`,
  }
}

/* ─── 文档流布局 ───
 * 头部 668px 之后是一列参与自动排布的分区。插入 flow 元素或删除分区时，
 * 后续内容整体顺延 / 上提 —— 预览与热区都按这里算出的 y 渲染。 */

const HEAD_H = 668
/** 页面底部留白。 */
const PAGE_TAIL = 46
/** 基础流式分区。 */
export const FLOW_SECTIONS: { id: string; gap: number; h: number }[] = [
  { id: 'sec-tasks', gap: 24, h: 449 },
  { id: 'sec-topics', gap: 36, h: 317 },
  { id: 'sec-banner', gap: 36, h: 158 },
  { id: 'footer', gap: 34, h: 32 },
]

export interface FlowSlot {
  id: string
  y: number
  h: number
  /** 该槽位之前需要的外边距 */
  gap: number
  /** 插入元素（基础分区为 undefined） */
  ins?: XiahuaInserted
}

/** 依次排布基础分区与插入元素，算出每个槽位的 y 与页面总高。 */
export function buildFlow(
  inserted: XiahuaInserted[] = [],
  hidden: string[] = [],
): { slots: FlowSlot[]; pageHeight: number } {
  const slots: FlowSlot[] = []
  let y = HEAD_H
  const push = (id: string, gap: number, h: number, ins?: XiahuaInserted) => {
    y += gap
    slots.push({ id, y, h, gap, ins })
    y += h
  }
  for (const sec of FLOW_SECTIONS) {
    if (!hidden.includes(sec.id)) push(sec.id, sec.gap, sec.h)
    for (const ins of inserted) {
      if (ins.placement === 'flow' && ins.after === sec.id && !hidden.includes(ins.id)) {
        push(ins.id, 24, ins.h, ins)
      }
    }
  }
  return { slots, pageHeight: y + PAGE_TAIL }
}

/** 组合出当前全部可编辑对象：静态头部元素 + 流式分区（实时 y）+ 叠加插入。 */
export function buildTargets(overrides: XiahuaOverrides = {}): XiahuaEditTarget[] {
  const hidden = overrides.hidden ?? []
  const inserted = overrides.inserted ?? []
  const flowIds = new Set(FLOW_SECTIONS.map((s) => s.id))
  const out: XiahuaEditTarget[] = []
  for (const t of XIAHUA_EDIT_TARGETS) {
    if (hidden.includes(t.id) || flowIds.has(t.id)) continue
    out.push(t)
  }
  const { slots } = buildFlow(inserted, hidden)
  for (const slot of slots) {
    if (slot.ins) {
      out.push({
        id: slot.ins.id,
        kind: slot.ins.kind === 'text' ? 'text' : slot.ins.kind === 'button' ? 'button' : 'image',
        objectType: slot.ins.kind === 'text' ? '文本' : slot.ins.kind === 'button' ? '组件' : '图片',
        label: slot.ins.label,
        rect: [0, slot.y, slot.ins.w, slot.h],
        movable: true,
      })
      continue
    }
    const base = XIAHUA_EDIT_TARGETS.find((x) => x.id === slot.id)
    if (base) out.push({ ...base, rect: [base.rect[0], slot.y, base.rect[2], slot.h] })
  }
  for (const ins of inserted) {
    if (ins.placement !== 'overlay' || hidden.includes(ins.id)) continue
    out.push({
      id: ins.id,
      kind: ins.kind === 'text' ? 'text' : ins.kind === 'button' ? 'button' : 'image',
      objectType: ins.kind === 'text' ? '文本' : ins.kind === 'button' ? '组件' : '图片',
      label: ins.label,
      rect: [ins.x ?? 0, ins.y ?? 0, ins.w, ins.h],
      movable: true,
    })
  }
  return out
}

/* ─── 插入落位的自动判断 ───
 * 头部是绝对定位的 KV 合成区 → 叠加；下半屏是流式分区列 → 自动排布。 */

export function decidePlacement(anchor: XiahuaSel | null): {
  placement: XiahuaPlacement
  after?: string
  x?: number
  y?: number
  reason: string
} {
  const flowIds = FLOW_SECTIONS.map((s) => s.id)
  if (anchor && flowIds.includes(anchor.id)) {
    return {
      placement: 'flow',
      after: anchor.id,
      reason: `「${anchor.label}」在流式分区列中，新元素自动排布到它之后，后续内容顺延`,
    }
  }
  if (anchor) {
    const [ax, ay] = (anchor.rect ?? '0,0').split(' ')[0].split(',').map(Number)
    return {
      placement: 'overlay',
      x: Math.max(8, Math.min(255, ax)),
      y: ay + 16,
      reason: `「${anchor.label}」位于绝对定位的头部合成区，新元素叠加在它下方`,
    }
  }
  return {
    placement: 'overlay',
    x: 60,
    y: 240,
    reason: '未选中锚点，默认叠加在头部主视觉上，可直接拖到目标位置',
  }
}
