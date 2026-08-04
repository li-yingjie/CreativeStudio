/* eslint-disable react-refresh/only-export-components -- 画面清单需与画板组件共享 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  GAMEPLAY_BINDING,
  renderProgress,
  type XiahuaGameplay,
} from './XiahuaGameplay'
import { stageReached, type BuildStage } from './XiahuaBuildScript'
import {
  XIAHUA_PRESET,
  assetMap,
  assetVariants,
  cardArtVariants,
  kvLayerSrc,
  type ActivityPreset,
  type KvLayer,
} from './ActivityPreset'
import {
  SCREEN_TARGETS,
  buildFlow,
  buildTargets,
  toSel,
  type XiahuaInserted,
  type XiahuaOverrides,
  type XiahuaSel,
} from './XiahuaEditPanel'

/* ─── 「这夏夯爆了」夏日集卡 H5 — 高保真还原 ───
 * 视觉稿：Figma d3UTgLIbzlPRGNHw3DtToX（主页面 1-1321 / 卡片浏览 1-9309 / 开卡 1-15400）。
 * 装饰位整块用设计稿导出图；文案、状态与玩法（抽卡 → 集卡点亮 → 兑券/红包）为真实交互。 */

/* 素材与主题全部来自 ActivityPreset —— 换活动只需换 preset + 素材目录。 */

/** 档位图标按序取；超出的档位复用最后一枚。 */
const TIER_ART = ['tier1', 'tier2', 'tier3', 'tier4'] as const

type Food = { id: string; name: string; motto: string; img?: string; imgGrey?: string }

/** 由玩法配置派生的档位（含展示用 label 与图标 key）。 */
type Tier = { need: number; label: string; reward: string; img: string }

type Overlay =
  | { kind: 'none' }
  | { kind: 'drawing' }
  | { kind: 'result'; food: Food; isNew: boolean }
  | { kind: 'cards' }
  | { kind: 'viewer'; index: number }
  | { kind: 'prizes' }
  | { kind: 'redeem'; tier: Tier }
  | { kind: 'rules' }

/** 缺素材时显示带文件名的占位框 —— 换活动可以边补图边看效果，不会白屏。 */
function ImgOrPlaceholder({
  src,
  label,
  className,
  style,
}: {
  src?: string
  label: string
  className?: string
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed)
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-white/25 bg-white/[0.06] px-1 text-center text-[10px] leading-tight text-white/50 ${className ?? ''}`}
        style={style}
      >
        {label}
      </div>
    )
  return (
    <img
      src={src}
      alt={label}
      className={className}
      style={style}
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

/* ─── 头图 KV：Figma「活动收集/head」里就是底景 + 角色 + 贴片的多素材
 * 合成，不是一张整图。换皮（模板复刻）只换其中某几层。贴片 404 时静默
 * 隐藏（空模板/换皮中缺件不糊屏），底景缺失才显示占位框。 ─── */

function KvPiece({ src, layer }: { src: string; layer: KvLayer }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={src}
      alt={layer.label}
      draggable={false}
      className="absolute object-contain"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.w,
        height: layer.h,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))',
      }}
      onError={() => setFailed(true)}
    />
  )
}

function KvComposite({ preset, style }: { preset: ActivityPreset; style?: React.CSSProperties }) {
  return (
    <div className="absolute h-[494px] w-full overflow-hidden" style={style}>
      {(preset.kvLayers ?? []).map((l) =>
        l.base ? (
          <ImgOrPlaceholder
            key={`${l.id}-${l.file}`}
            src={kvLayerSrc(preset, l)}
            label={l.label}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <KvPiece key={`${l.id}-${l.file}`} src={kvLayerSrc(preset, l)} layer={l} />
        ),
      )}
    </div>
  )
}

/* ─── 卡面：每个品类的设计稿专属卡图 ─── */

function FoodCardFace({
  food,
  owned,
  className,
}: {
  food: Food
  owned: boolean
  className?: string
}) {
  /* img/imgGrey 是按约定拼出来的路径，文件在不在只有加载了才知道
   * （卤味/螺蛳粉暂无彩色版、多数品类暂无石膏版）。所以按加载结果回退：
   * 主选态 404 → 换另一态并用滤镜近似（缺石膏 → 彩卡灰化；缺彩卡 →
   * 石膏暖化），两态都没有才落到占位框。 */
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const primary = owned ? food.img : food.imgGrey
  const alt = owned ? food.imgGrey : food.img
  const primaryOk = !!primary && !failed[primary]
  const src = primaryOk ? primary : alt && !failed[alt] ? alt : undefined
  const filter = primaryOk
    ? undefined
    : owned
      ? 'sepia(0.55) saturate(1.7) hue-rotate(-14deg) brightness(1.06)'
      : 'grayscale(1) sepia(0.3) brightness(0.92) contrast(0.92)'
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {src ? (
        <img
          src={src}
          alt={food.name}
          draggable={false}
          className="block h-full w-full object-cover"
          style={{ filter }}
          onError={() => setFailed((f) => ({ ...f, [src]: true }))}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-white/25 bg-white/[0.06] px-1 text-center text-[10px] leading-tight text-white/50">
          {food.name}
        </div>
      )}
    </div>
  )
}

/* ─── 大卡卡面：火锅有专属大卡图，其余品类放大专属中卡 ─── */

function BigCardFace({ food, bigCardSrc }: { food: Food; bigCardSrc?: string }) {
  if (bigCardSrc) {
    return <ImgOrPlaceholder src={bigCardSrc} label={food.name} className="h-full w-full" />
  }
  return <FoodCardFace food={food} owned className="h-full w-full" />
}

/** 画布上新插入的元素 — 图片给占位框，文本 / 按钮给可见样式。 */
function InsertedBlock({
  ins,
  style,
}: {
  ins: XiahuaInserted
  style?: React.CSSProperties
}) {
  if (ins.kind === 'image')
    return (
      <div
        style={style}
        className="flex items-center justify-center border border-dashed border-white/30 bg-white/[0.06] text-[12px] text-white/55"
      >
        {ins.label} · 待生成素材
      </div>
    )
  if (ins.kind === 'button')
    return (
      <div style={style} className="flex items-center justify-center">
        <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#ff5a36] to-[#f52b0f] text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(245,43,15,0.4)]">
          {ins.text ?? '按钮'}
        </span>
      </div>
    )
  return (
    <div style={style} className="flex items-center justify-center px-3 text-[15px] font-semibold text-white">
      {ins.text ?? '新文本'}
    </div>
  )
}

/** 编辑态画板铺开的关键页面。 */
export type XiahuaScreen = 'main' | 'result' | 'cards' | 'redeem' | 'rules'

export function activityScreens(p: ActivityPreset): { id: XiahuaScreen; label: string; desc: string }[] {
  const c = p.copy.screens
  return [
    { id: 'main', label: c.main, desc: '可编辑 · 集卡与入口' },
    { id: 'result', label: c.result, desc: '抽中后的展示页' },
    { id: 'cards', label: c.cards, desc: '卡册与赠送' },
    { id: 'redeem', label: c.redeem, desc: '集齐档位领奖' },
    { id: 'rules', label: c.rules, desc: '玩法说明' },
  ]
}

/* ─── 主组件 ─── */

function XiahuaH5PreviewBase({
  editing = false,
  selected = null,
  onSelect,
  hoveredId = null,
  onOffsetsCommit,
  overrides,
  gameplay,
  screen = 'main',
  readOnly = false,
  build,
  preset,
  wireframe = false,
  picks,
}: {
  /** 编辑态：预览元素变为可点选，玩法交互暂停。 */
  editing?: boolean
  selected?: XiahuaSel | null
  onSelect?: (sel: XiahuaSel | null) => void
  /** 属性面板悬停图层时高亮对应热区。 */
  hoveredId?: string | null
  /** 拖动结束时提交全部位置偏移（供面板显示 / 重置）。 */
  onOffsetsCommit?: (offsets: Record<string, { x: number; y: number }>) => void
  /** 编辑面板可真实回写的运行时属性（剩余次数 / 当前阶段）。 */
  overrides?: XiahuaOverrides
  /** 玩法配置 —— 卡池 / 档位 / 抽卡规则 / 赠送，改动即时反映到 UI。 */
  gameplay?: XiahuaGameplay
  /** 强制展示某个关键页面（编辑态画板用）。 */
  screen?: XiahuaScreen
  /** 只读画板：不接受任何指针交互。 */
  readOnly?: boolean
  /** 0→1 搭建阶段：控制页面各层是否已长出（不传 = 完整页面）。 */
  build?: BuildStage
  /** 活动模板：素材目录 / 主题 / 阶段 / 文案。换活动只换它。 */
  preset?: ActivityPreset
  /** 交互框架态：只有版式与热区，所有素材位显示占位框。 */
  wireframe?: boolean
  /** 素材版本选择（素材板里挑的那版会落到成品上）。 */
  picks?: Record<string, number>
} = {}) {
  const ps = preset ?? XIAHUA_PRESET
  // 线框态把所有素材地址清空 —— 占位框由 ImgOrPlaceholder 自己兜底。
  const A = useMemo(() => {
    const m = assetMap(ps)
    if (!wireframe) return m
    const blank = {} as typeof m
    ;(Object.keys(m) as (keyof typeof m)[]).forEach((k) => {
      blank[k] = ''
    })
    return blank
  }, [ps, wireframe])
  const TH = ps.theme
  const STAGES = ps.stages
  const railCls =
    'flex h-[40px] w-full cursor-pointer flex-col items-center justify-center rounded-l-[10px] text-[12px] leading-[13px] backdrop-blur-[2px]'
  const railStyle = { background: TH.rail, color: TH.railText }
  const gp = gameplay ?? ps.gameplay
  /** 素材板选中的候选会直接落到预览，不再用颜色滤镜伪造版本。 */
  const pickedAsset = (key: string) => {
    if (wireframe) return ''
    const sources = assetVariants(ps, key)
    return sources[Math.min(picks?.[key] ?? 0, Math.max(0, sources.length - 1))] ?? sources[0]
  }
  /** 卡池：玩法定义 id/文案，UI 层补卡面素材。 */
  const FOODS: Food[] = useMemo(
    () =>
      gp.cards.map((c) => {
        if (wireframe) return { ...c }
        const art = cardArtVariants(ps, c.id)
        const pick = Math.min(picks?.[`card-${c.id}`] ?? 0, art.img.length - 1)
        return { ...c, img: art.img[pick] ?? art.img[0], imgGrey: art.grey[0] }
      }),
    [gp.cards, ps, picks, wireframe],
  )
  /** 档位：按 need 排序，图标按序取。 */
  const TIERS: Tier[] = useMemo(
    () =>
      [...gp.tiers]
        .sort((a, b) => a.need - b.need)
        .map((t, i) => ({
          need: t.need,
          label: `${t.need}种`,
          reward: t.reward,
          img: TIER_ART[Math.min(i, TIER_ART.length - 1)],
        })),
    [gp.tiers],
  )
  // owned: foodId → 张数。初始 3 种（对齐设计稿集卡条 3 张点亮）。
  // 初始持有前 3 种（跟随卡池，换活动不会失配）
  const [owned, setOwned] = useState<Record<string, number>>(() => {
    const cards = (gameplay ?? (preset ?? XIAHUA_PRESET).gameplay).cards
    const seed: Record<string, number> = {}
    ;[5, 2, 1].forEach((n, i) => {
      if (cards[i]) seed[cards[i].id] = n
    })
    return seed
  })
  const [draws, setDraws] = useState(() => (gameplay ?? (preset ?? XIAHUA_PRESET).gameplay).draw.initialChances)
  const [stage, setStage] = useState<string>(ps.stages[ps.stages.length - 1]?.id ?? '')
  const [claimed, setClaimed] = useState<Record<number, boolean>>({})
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' })

  /* 画布拖动的位置偏移（设计稿 px）。拖动中本地更新，松手后经
   * onOffsetsCommit 提交给编辑面板，面板重置时经 overrides 同步回来。 */
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number; s?: number }>>({})
  const dragRef = useRef<{
    id: string
    mode: 'move' | 'resize'
    /** 屏幕像素 → 设计稿像素换算比例 */
    scale: number
    px: number
    py: number
    ox: number
    oy: number
    /** 起始缩放 */
    os: number
    /** 元素设计稿尺寸（缩放锚点换算用） */
    w: number
    h: number
    /** resize：被拖角的对角锚点（屏幕坐标）与起始距离 */
    ax: number
    ay: number
    d0: number
    corner: 'tl' | 'tr' | 'bl' | 'br' | null
    moved: boolean
  } | null>(null)

  /* 编辑面板回写（渲染期比对，避免 effect 级联）：次数角标 / 当前阶段 / 位置。 */
  const [appliedOverrides, setAppliedOverrides] = useState(overrides)
  if (overrides !== appliedOverrides) {
    setAppliedOverrides(overrides)
    if (overrides?.draws != null) setDraws(overrides.draws)
    if (overrides?.stage != null) setStage(overrides.stage)
    if (overrides?.offsets != null) setOffsets(overrides.offsets)
  }

  /* 变换实时上报给编辑面板（同引用时跳过，避免与回写形成回路）。 */
  useEffect(() => {
    if (offsets === overrides?.offsets) return
    if (!Object.keys(offsets).length && !overrides?.offsets) return
    onOffsetsCommit?.(offsets)
  }, [offsets, overrides?.offsets, onOffsetsCommit])

  /** 绝对定位元素随画布编辑的样式：基准坐标 + 偏移 + 等比缩放（锚点左上）。 */
  const pos = (id: string, baseX: number, baseY: number) => {
    const o = offsets[id]
    const s = o?.s ?? 1
    return {
      left: baseX + (o?.x ?? 0),
      top: baseY + (o?.y ?? 0),
      ...(s !== 1 ? { transform: `scale(${s})`, transformOrigin: 'top left' } : {}),
    }
  }
  /** 搭建阶段门禁：未到该阶段的部分先不渲染。 */
  const has = (need: BuildStage) => !build || stageReached(build, need)

  /* 删除（隐藏）与插入 —— 直接读 overrides，随面板变化即时生效。 */
  const hidden = overrides?.hidden ?? []
  const inserted = overrides?.inserted ?? []
  const isHidden = (id: string) => hidden.includes(id)
  const { slots } = buildFlow(inserted, hidden)
  /** 当前全部可编辑对象：静态元素 + 实时排布的流式分区 + 插入元素。 */
  const editTargets = buildTargets(overrides ?? {})

  /** 文档流元素（满宽分区）用 transform 平移 + 缩放，占位不变。 */
  const mvFlow = (id: string) => {
    const o = offsets[id]
    if (!o) return undefined
    const s = o.s ?? 1
    return {
      transform: `translate(${o.x}px, ${o.y}px)${s !== 1 ? ` scale(${s})` : ''}`,
      transformOrigin: 'top left',
    }
  }
  /* 进入编辑态时收起所有玩法浮层，回到主会场画面。 */
  const [wasEditing, setWasEditing] = useState(editing)
  if (editing !== wasEditing) {
    setWasEditing(editing)
    if (editing && overlay.kind !== 'none') setOverlay({ kind: 'none' })
  }
  const [toast, setToast] = useState<string | null>(null)
  const [justLit, setJustLit] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const kinds = useMemo(
    () => FOODS.filter((f) => (owned[f.id] ?? 0) > 0).length,
    [owned, FOODS],
  )
  const nextTier = TIERS.find((t) => kinds < t.need)
  const remaining = nextTier ? nextTier.need - kinds : 0

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }, [])
  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  /* 抽卡：未拥有的品类权重更高，保证集卡有推进感 */
  const startDraw = useCallback(() => {
    if (overlay.kind !== 'none') return
    if (draws <= 0) {
      showToast('抽卡机会用完啦，去做任务赚机会吧')
      return
    }
    setDraws((d) => d - 1)
    setOverlay({ kind: 'drawing' })
    const unowned = FOODS.filter((f) => !(owned[f.id] ?? 0))
    const pool = unowned.length && Math.random() < gp.draw.newCardBias ? unowned : FOODS
    const food = pool[Math.floor(Math.random() * pool.length)]
    const isNew = !(owned[food.id] ?? 0)
    window.setTimeout(() => setOverlay({ kind: 'result', food, isNew }), 1750)
  }, [draws, overlay.kind, owned, showToast, FOODS, gp.draw.newCardBias])

  const acceptResult = useCallback(() => {
    if (overlay.kind !== 'result') return
    const { food, isNew } = overlay
    setOwned((prev) => ({ ...prev, [food.id]: (prev[food.id] ?? 0) + 1 }))
    setOverlay({ kind: 'none' })
    if (isNew) {
      setJustLit(food.id)
      window.setTimeout(() => setJustLit(null), 1600)
    }
  }, [overlay])

  const claimTier = useCallback(
    (tier: Tier) => {
      setClaimed((prev) => ({ ...prev, [tier.need]: true }))
      setOverlay({ kind: 'none' })
      showToast(`已放入「我的奖品」：${tier.reward}`)
    },
    [showToast],
  )

  const giftCard = useCallback(
    (food: Food) => {
      setOwned((prev) => {
        const n = prev[food.id] ?? 0
        if (n < gp.gift.minHold) return prev
        return { ...prev, [food.id]: n - 1 }
      })
      if ((owned[food.id] ?? 0) < gp.gift.minHold) showToast('留一张给自己，送不了啦')
      else showToast(`已把「${food.name}」送给好友，领取后生效`)
    },
    [owned, showToast, gp.gift.minHold],
  )

  const ownedList = FOODS.filter((f) => (owned[f.id] ?? 0) > 0)

  /* 画板模式：按 screen 直接定格到对应关键页面。 */
  const shownOverlay: Overlay =
    screen === 'main'
      ? overlay
      : screen === 'result'
        ? { kind: 'result', food: FOODS[1] ?? FOODS[0], isNew: true }
        : screen === 'cards'
          ? { kind: 'cards' }
          : screen === 'redeem'
            ? { kind: 'redeem', tier: TIERS[0] }
            : { kind: 'rules' }

  return (
    <div
      className={`relative h-full w-full select-none overflow-hidden font-[system-ui] ${
        readOnly ? 'pointer-events-none' : ''
      }`}
      style={{
        background: TH.bg,
        // 线框态 = 黑白线框图：素材位已全部置空，整层去色 + 反相后，
        // 深色活动皮肤变浅灰底、白字变深字、彩色按钮变中灰 —— 只剩版式。
        ...(wireframe ? { filter: 'grayscale(1) invert(0.92) contrast(1.02)' } : {}),
      }}
    >
      {/* ── 可滚动页面 ── */}
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative w-full">
          {/* 下半区渐变底 — 设计稿 1:3856 (0,1154) 375×676 */}
          <div
            className="pointer-events-none absolute left-0 top-[1154px] h-[676px] w-full"
            style={{
              background: `linear-gradient(180deg,${TH.bg} 0%,${TH.bgLower} 10%,${TH.bgLower} 100%)`,
            }}
          />
          {/* ── 活动面板 — 从顶部撑满，无系统栏/地图条 ── */}
          <div className="relative w-full">
            {/* 头部 KV（含阶段 tab、深夜食堂场景） */}
            <div className="relative h-[668px] w-full">
              {has('kv') && !isHidden('kv') && (
                // v1 默认态 = 多素材图层合成；挑了整图候选（v2+）或线框态才退回单图
                !wireframe && (picks?.headKv ?? 0) === 0 && ps.kvLayers ? (
                  <KvComposite preset={ps} style={pos('kv', 0, 0)} />
                ) : (
                  <ImgOrPlaceholder src={pickedAsset('headKv')} label="头图 KV" className="absolute h-[494px] w-full object-cover" style={pos('kv', 0, 0)} />
                )
              )}
              {/* 标题字压在 KV 上（透明底），位置对齐设计稿 1:4914 */}
              {has('title') && !isHidden('title') && (
              <ImgOrPlaceholder src={pickedAsset('title')} label="活动标题" className="absolute h-[68px] w-[247px] object-contain" style={pos('title', 74, 25)} />
              )}

              {/* 阶段 Tab — 设计稿 1:4902：半透明棕底容器 + 选中态白胶囊 */}
              {has('title') && !isHidden('stage-tabs') && (
              <div className="absolute flex h-[28px] w-[185px] items-center rounded-full p-[3px] backdrop-blur-[2px]" style={{ ...pos('stage-tabs', 94, 126), background: TH.tabBar }}>
                {STAGES.map((s) => {
                  const active = s.id === stage
                  return (
                    <button
                      key={s.id}
                      className={`flex h-[22px] cursor-pointer items-center justify-center gap-[3px] rounded-full text-[13px] transition-colors ${
                        active ? 'bg-white font-semibold' : 'font-medium'
                      }`}
                      style={{ width: s.w, color: active ? TH.tabActiveText : TH.tabIdleText }}
                      onClick={() => {
                        if (s.locked) showToast('该阶段尚未解锁，敬请期待')
                        else setStage(s.id)
                      }}
                    >
                      {s.locked && (
                        <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" className="shrink-0">
                          <rect x="0" y="4" width="9" height="6" rx="1.5" />
                          <path d="M2 4V3a2.5 2.5 0 0 1 5 0v1" fill="none" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                      )}
                      {s.label}
                    </button>
                  )
                })}
              </div>
              )}

              {/* 分享 / 规则侧栏 — 设计稿 1:5325：两枚半透明胶囊贴右边缘 */}
              {has('title') && !isHidden('rail') && (
              <div className="absolute flex w-[24px] flex-col gap-[6px]" style={pos('rail', 351, 97)}>
                <button className={railCls} style={railStyle} onClick={() => showToast('分享链接已复制')}>
                  <span>分</span>
                  <span>享</span>
                </button>
                <button className={railCls} style={railStyle} onClick={() => setOverlay({ kind: 'rules' })}>
                  <span>规</span>
                  <span>则</span>
                </button>
              </div>
              )}

              {/* 主 CTA：抽夏日夜食 — 外层承载画布变换，内层留给 framer 动效 */}
              {has('actions') && !isHidden('btn-draw') && (
              <div className="absolute h-[50px] w-[207px]" style={pos('btn-draw', 84, 375)}>
              <motion.button
                whileTap={{ scale: 0.94 }}
                className="relative h-full w-full cursor-pointer"
                onClick={startDraw}
              >
                <motion.div
                  className="h-full w-full"
                  animate={readOnly ? undefined : { scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ImgOrPlaceholder src={pickedAsset('btnDraw')} label="抽卡按钮" className="h-full w-full rounded-full" />
                </motion.div>
                {/* 剩余次数角标 — 设计稿 1:4891：(178,-6) 29×18 */}
                <span className="absolute left-[178px] top-[-6px] flex h-[18px] min-w-[29px] items-center justify-center rounded-full border-2 border-white bg-[#a2ff37] px-1 text-[11px] font-bold text-[#3d6b00]">
                  {draws}
                </span>
              </motion.button>
              </div>
              )}

              {/* 我的夜食 / 我的奖品 */}
              {has('actions') && !isHidden('btn-my-cards') && (
              <button className="absolute h-[42px] w-[56px] cursor-pointer active:brightness-90" style={pos('btn-my-cards', 0, 379)} onClick={() => setOverlay({ kind: 'cards' })}>
                <ImgOrPlaceholder src={A.btnMyCards} label={ps.copy.screens.cards} className="h-full w-full" />
              </button>
              )}
              {has('actions') && !isHidden('btn-my-prizes') && (
              <button className="absolute h-[42px] w-[56px] cursor-pointer active:brightness-90" style={pos('btn-my-prizes', 319, 379)} onClick={() => setOverlay({ kind: 'prizes' })}>
                <ImgOrPlaceholder src={A.btnMyPrizes} label="我的奖品" className="h-full w-full" />
              </button>
              )}

              {/* ── 集卡面板 ── */}
              {has('collect') && (
              <div className="absolute left-[10px] top-[438px] h-[230px] w-[355px]">
                <ImgOrPlaceholder src={pickedAsset('panelBg')} label="集卡面板底" className="absolute left-0 top-0 h-[150px] w-full" />

                {/* 进度文案 — 编组承载画布变换（面板坐标 16,18） */}
                <div className="absolute h-[38px] w-[150px]" style={pos('collect-info', 16, 18)}>
                  <div className="absolute left-0 top-0 whitespace-nowrap text-[16px] font-bold text-white">
                    {(() => {
                      const { main } = renderProgress(gp.copy, remaining, nextTier?.reward, FOODS.length)
                      // 模板里的数字高亮成红色（对齐设计稿）
                      const parts = main.split(String(remaining))
                      return nextTier && parts.length === 2 ? (
                        <>
                          {parts[0]}
                          <span className="px-[1px]" style={{ color: TH.accent }}>{remaining}</span>
                          {parts[1]}
                        </>
                      ) : (
                        main
                      )
                    })()}
                  </div>
                  <p className="absolute left-0 top-[21px] whitespace-nowrap text-[12px]" style={{ color: TH.subText }}>
                    {renderProgress(gp.copy, remaining, nextTier?.reward, FOODS.length).sub}
                  </p>
                </div>

                {/* 奖励档位 — 设计稿 1:4996/5028/5071/5058：中心固定在
                    137/197/257/317（编组内 26/86/146/206），待领取的一档
                    放大到 52px 并上移。编组承载画布变换。 */}
                <div className="absolute h-[64px] w-[232px]" style={pos('tier-row', 111, -14)}>
                {TIERS.map((t, i) => {
                  const reached = kinds >= t.need
                  const isClaimed = !!claimed[t.need]
                  const claimable = reached && !isClaimed
                  const size = claimable ? 52 : 44
                  return (
                    <button
                      key={t.need}
                      className={`absolute flex flex-col items-center ${claimable ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{ left: 26 + i * 60 - size / 2, top: claimable ? 0 : 12 }}
                      onClick={() => claimable && setOverlay({ kind: 'redeem', tier: t })}
                    >
                      <motion.div
                        style={{ width: size, height: size, opacity: isClaimed ? 0.5 : 1 }}
                        animate={claimable && !readOnly ? { y: [0, -3, 0] } : {}}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ImgOrPlaceholder
                          src={pickedAsset(t.img)}
                          label={t.reward}
                          className="h-full w-full rounded-full object-contain"
                        />
                      </motion.div>
                      <span className="mt-[-2px] flex h-[14px] items-center gap-[2px] whitespace-nowrap text-[11px] font-semibold text-[#ffd2a4]">
                        {isClaimed ? (
                          <>✓ 已领</>
                        ) : claimable ? (
                          <span className="rounded-full bg-gradient-to-b from-[#ff5a36] to-[#f52b0f] px-2 py-[1px] text-white">领取</span>
                        ) : (
                          <>
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" opacity="0.9"><rect x="0" y="4" width="9" height="6" rx="1.5"/><path d="M2 4V3a2.5 2.5 0 0 1 5 0v1" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>
                            {t.label}
                          </>
                        )}
                      </span>
                    </button>
                  )
                })}
                </div>

                {/* 卡槽横条：9 格，未获得为石膏态 */}
                <div className="absolute w-[347px] overflow-x-auto rounded-[16px] px-[8px] py-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={pos('card-strip', 4, 64)}>
                  <div className="flex w-max items-center gap-[4px]">
                    {FOODS.map((f) => {
                      const n = owned[f.id] ?? 0
                      return (
                        <motion.div
                          key={f.id}
                          className="relative h-[70px] w-[60px] shrink-0 cursor-pointer overflow-hidden rounded-[8px]"
                          animate={
                            justLit === f.id
                              ? { scale: [1, 1.22, 1], rotate: [0, -4, 4, 0] }
                              : {}
                          }
                          transition={{ duration: 0.7 }}
                          onClick={() => setOverlay({ kind: 'cards' })}
                        >
                          <FoodCardFace food={f} owned={n > 0} className="h-full w-full" />
                          {n > 1 && (
                            <span className="absolute right-[2px] top-[2px] rounded-full bg-[#ff2e1a] px-[5px] text-[10px] font-bold leading-[14px] text-white">
                              x{n}
                            </span>
                          )}
                          {justLit === f.id && (
                            <motion.div
                              className="pointer-events-none absolute inset-0 rounded-[8px]"
                              initial={{ boxShadow: '0 0 0 0 rgba(255,214,120,0)' }}
                              animate={{ boxShadow: ['0 0 18px 6px rgba(255,214,120,0.9)', '0 0 0 0 rgba(255,214,120,0)'] }}
                              transition={{ duration: 1.4 }}
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* 金豆条（导出整图 + 热区） */}
                <div className="absolute h-[72px] w-full" style={pos('bean-bar', 0, 158)}>
                  <ImgOrPlaceholder src={pickedAsset('beanBar')} label="任务条底" className="h-full w-full" />
                  <button
                    className="absolute right-[10px] top-[14px] h-[44px] w-[64px] cursor-pointer"
                    aria-label="接金豆"
                    onClick={() => showToast('接金豆玩法在下一阶段开启，敬请期待')}
                  />
                </div>
              </div>
              )}
            </div>

            {/* ── 下半屏：按 buildFlow 的槽位顺序渲染，插入 / 删除后自动顺延 ── */}
            {has('sections') && slots.map((slot) => {
              const mt = { marginTop: slot.gap }
              if (slot.ins) return <InsertedBlock key={slot.id} ins={slot.ins} style={{ ...mt, ...mvFlow(slot.id) }} />
              if (slot.id === 'sec-tasks')
                return (
                  <div key={slot.id} className="relative h-[449px] w-full" style={{ ...mt, ...mvFlow('sec-tasks') }}>
                    <ImgOrPlaceholder src={pickedAsset('secTasks')} label="任务区" className="block h-full w-full" />
                    {/* 去投稿 ×2 / 去赠送 — 位置按设计稿比例落点 */}
                    <button className="absolute left-[6.4%] top-[46.5%] h-[7%] w-[19%] cursor-pointer" aria-label="去投稿" onClick={() => showToast('投稿任务完成！+2 次抽卡机会')} />
                    <button className="absolute left-[91%] top-[46.5%] h-[7%] w-[9%] cursor-pointer" aria-label="去投稿" onClick={() => showToast('投稿任务完成！+2 次抽卡机会')} />
                    <button className="absolute left-[73%] top-[62%] h-[6.5%] w-[21%] cursor-pointer" aria-label="去赠送" onClick={() => setOverlay({ kind: 'cards' })} />
                  </div>
                )
              if (slot.id === 'sec-topics')
                return <ImgOrPlaceholder key={slot.id} src={pickedAsset('secTopics')} label="话题区" className="block h-[317px] w-full" style={{ ...mt, ...mvFlow('sec-topics') }} />
              if (slot.id === 'sec-banner')
                return <ImgOrPlaceholder key={slot.id} src={pickedAsset('secBanner')} label="底部 banner" className="block h-[158px] w-full" style={{ ...mt, ...mvFlow('sec-banner') }} />
              return (
                <div key={slot.id} className="flex w-full justify-center" style={mt}>
                  <ImgOrPlaceholder src={A.footerLogo} label="页脚 logo" className="h-[32px] w-[121px]" style={mvFlow('footer')} />
                </div>
              )
            })}
            <div className="h-[46px]" />
          </div>

          {/* 叠加插入的元素 — 绝对定位在页面坐标系上 */}
          {inserted
            .filter((ins) => ins.placement === 'overlay' && !isHidden(ins.id))
            .map((ins) => (
              <InsertedBlock
                key={ins.id}
                ins={ins}
                style={{ position: 'absolute', ...pos(ins.id, ins.x ?? 0, ins.y ?? 0), width: ins.w, height: ins.h }}
              />
            ))}

          {/* ── 编辑态打点层：热区常显（虚线框），点选出蓝色实框 ── */}
          {editing && (
            <div
              className="absolute inset-0 z-20"
              onClick={() => onSelect?.(null)}
            >
              {/* dragRef 只在 pointer 事件里读写（拖拽会话态，不参与渲染），
                  编译器无法判定嵌套 map 内的闭包只在事件触发，故此处豁免。 */}
              {/* eslint-disable-next-line react-hooks/refs */}
              {editTargets.map((t) => {
                const active = selected?.id === t.id
                const peeked = hoveredId === t.id
                const off = offsets[t.id]
                const s = off?.s ?? 1
                const zw = t.rect[2] * s
                const zh = t.rect[3] * s
                return (
                  <div
                    key={t.id}
                    role="button"
                    aria-label={`选中${t.label}`}
                    className={`group absolute cursor-move rounded-[4px] transition-colors ${
                      active
                        ? 'border-2 border-[#357ef8] bg-[#357ef8]/10'
                        : peeked
                          ? 'border-2 border-[#357ef8] bg-[#357ef8]/10'
                          : 'border border-dashed border-white/45 hover:border-solid hover:border-[#357ef8] hover:bg-[#357ef8]/10'
                    }`}
                    style={{
                      left: t.rect[0] + (off?.x ?? 0),
                      top: t.rect[1] + (off?.y ?? 0),
                      width: zw,
                      height: zh,
                      touchAction: 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect?.(toSel(t))
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      onSelect?.(toSel(t))
                      dragRef.current = {
                        id: t.id,
                        mode: 'move',
                        // 屏幕像素 → 设计稿像素换算（手机整体被缩放过）
                        scale: e.currentTarget.getBoundingClientRect().width / zw,
                        px: e.clientX,
                        py: e.clientY,
                        ox: off?.x ?? 0,
                        oy: off?.y ?? 0,
                        os: s,
                        w: t.rect[2],
                        h: t.rect[3],
                        ax: 0,
                        ay: 0,
                        d0: 1,
                        corner: null,
                        moved: false,
                      }
                      e.currentTarget.setPointerCapture(e.pointerId)
                    }}
                    onPointerMove={(e) => {
                      const d = dragRef.current
                      if (!d || d.id !== t.id) return
                      if (d.mode === 'move') {
                        const dx = (e.clientX - d.px) / d.scale
                        const dy = (e.clientY - d.py) / d.scale
                        if (Math.abs(dx) + Math.abs(dy) > 1) d.moved = true
                        if (!d.moved) return
                        setOffsets((prev) => ({
                          ...prev,
                          [t.id]: {
                            ...prev[t.id],
                            x: Math.round(d.ox + dx),
                            y: Math.round(d.oy + dy),
                            s: d.os,
                          },
                        }))
                        return
                      }
                      // resize：与对角锚点的距离比即新缩放；锚点侧反向补偏移
                      const d1 = Math.hypot(e.clientX - d.ax, e.clientY - d.ay)
                      const ns = Math.min(3, Math.max(0.3, (d.os * d1) / d.d0))
                      d.moved = true
                      const nx = d.corner === 'tl' || d.corner === 'bl' ? d.ox + d.w * (d.os - ns) : d.ox
                      const ny = d.corner === 'tl' || d.corner === 'tr' ? d.oy + d.h * (d.os - ns) : d.oy
                      setOffsets((prev) => ({
                        ...prev,
                        [t.id]: { x: Math.round(nx), y: Math.round(ny), s: Math.round(ns * 100) / 100 },
                      }))
                    }}
                    onPointerUp={() => {
                      dragRef.current = null
                    }}
                  >
                    {/* 四角缩放手柄 — 仅选中时出现 */}
                    {active &&
                      (['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                        <span
                          key={c}
                          className={`absolute z-10 size-[8px] rounded-[2px] border-2 border-[#357ef8] bg-white ${
                            c === 'tl'
                              ? 'left-[-5px] top-[-5px] cursor-nwse-resize'
                              : c === 'tr'
                                ? 'right-[-5px] top-[-5px] cursor-nesw-resize'
                                : c === 'bl'
                                  ? 'bottom-[-5px] left-[-5px] cursor-nesw-resize'
                                  : 'bottom-[-5px] right-[-5px] cursor-nwse-resize'
                          }`}
                          onPointerDown={(e) => {
                            e.stopPropagation()
                            const zone = e.currentTarget.parentElement
                            if (!zone) return
                            const box = zone.getBoundingClientRect()
                            // 被拖角的对角 = 缩放锚点（屏幕坐标）
                            const ax = c === 'tl' || c === 'bl' ? box.right : box.left
                            const ay = c === 'tl' || c === 'tr' ? box.bottom : box.top
                            dragRef.current = {
                              id: t.id,
                              mode: 'resize',
                              scale: box.width / zw,
                              px: e.clientX,
                              py: e.clientY,
                              ox: off?.x ?? 0,
                              oy: off?.y ?? 0,
                              os: s,
                              w: t.rect[2],
                              h: t.rect[3],
                              ax,
                              ay,
                              d0: Math.max(4, Math.hypot(e.clientX - ax, e.clientY - ay)),
                              corner: c,
                              moved: false,
                            }
                            zone.setPointerCapture(e.pointerId)
                          }}
                        />
                      ))}
                    <span
                      className={`absolute -top-[15px] left-[-1px] whitespace-nowrap rounded-t-[3px] px-1 text-[9px] font-medium leading-[15px] transition-opacity ${
                        active || peeked
                          ? 'bg-[#357ef8] text-white opacity-100'
                          : 'bg-[#357ef8] text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {t.label}
                      {GAMEPLAY_BINDING[t.id] && (
                        <span className="ml-1 rounded-[2px] bg-white/25 px-[3px] text-[8px]">玩法</span>
                      )}
                    </span>
                    {/* 承载玩法规则的元素常驻一枚齿轮角标，编辑态一眼看出哪些能改玩法 */}
                    {GAMEPLAY_BINDING[t.id] && !active && (
                      <span className="absolute -right-[6px] -top-[6px] flex size-[14px] items-center justify-center rounded-full bg-[#a2ff37] text-[9px] leading-none text-[#2f1912] shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                        ⚙
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 覆盖层 ── */}
      <AnimatePresence>
        {shownOverlay.kind === 'drawing' && <DrawingOverlay key="drawing" foods={FOODS} />}
        {shownOverlay.kind === 'result' && (
          <ResultOverlay key="result" food={shownOverlay.food} isNew={shownOverlay.isNew} spin={!readOnly} art={{ resultTitle: A.resultTitle, bigCard: shownOverlay.food.id === FOODS[0]?.id ? pickedAsset('bigCard') : undefined }} onAccept={acceptResult} onClose={acceptResult} />
        )}
        {shownOverlay.kind === 'cards' && (
          <CardsDrawer
            key="cards"
            foods={FOODS}
            tabs={ps.copy.cardsTabs}
            minHold={gp.gift.minHold}
            owned={owned}
            onClose={() => setOverlay({ kind: 'none' })}
            onOpenViewer={(index) => setOverlay({ kind: 'viewer', index })}
            onGift={giftCard}
            onToast={showToast}
          />
        )}
        {shownOverlay.kind === 'viewer' && (
          <CardViewer
            key="viewer"
            index={shownOverlay.index}
            ownedList={ownedList}
            owned={owned}
            onIndex={(index) => setOverlay({ kind: 'viewer', index })}
            onClose={() => setOverlay({ kind: 'cards' })}
            onGift={giftCard}
          />
        )}
        {shownOverlay.kind === 'prizes' && (
          <PrizesOverlay key="prizes" tiers={TIERS} art={{ mascot: A.mascot, envelope: A.envelope }} emptyText={ps.copy.prizesEmpty} claimed={claimed} onClose={() => setOverlay({ kind: 'none' })} />
        )}
        {shownOverlay.kind === 'redeem' && (
          <RedeemOverlay key="redeem" tier={shownOverlay.tier} giftSrc={A.envelope} onAccept={() => claimTier(shownOverlay.tier)} onClose={() => setOverlay({ kind: 'none' })} />
        )}
        {shownOverlay.kind === 'rules' && <RulesOverlay key="rules" onClose={() => setOverlay({ kind: 'none' })} />}
      </AnimatePresence>

      {/* 非主会场画板的热区层 —— 盖在弹层之上，只可选中（弹层内容位置由布局决定） */}
      {editing && screen !== 'main' && (
        <div className="absolute inset-0 z-50" onClick={() => onSelect?.(null)}>
          {(SCREEN_TARGETS[screen] ?? []).map((t) => {
            const active = selected?.id === t.id
            const peeked = hoveredId === t.id
            return (
              <div
                key={t.id}
                role="button"
                aria-label={`选中${t.label}`}
                className={`absolute cursor-pointer rounded-[4px] transition-colors ${
                  active || peeked
                    ? 'border-2 border-[#357ef8] bg-[#357ef8]/10'
                    : 'border border-dashed border-white/45 hover:border-solid hover:border-[#357ef8] hover:bg-[#357ef8]/10'
                }`}
                style={{ left: t.rect[0], top: t.rect[1], width: t.rect[2], height: t.rect[3] }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect?.(toSel(t))
                }}
              />
            )
          })}
        </div>
      )}

      {/* 页内 toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-[45%] z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-4 py-2 text-[13px] text-white backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── 抽卡动效：扇形卡阵旋开 → 收拢 ─── */

function DrawingOverlay({ foods }: { foods: Food[] }) {
  const N = Math.max(1, foods.length)
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-[6px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative h-[240px] w-[240px]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 1.75, ease: [0.45, 0, 0.2, 1] }}
      >
        {Array.from({ length: N }, (_, i) => {
          const angle = (i / N) * 360
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 h-[96px] w-[72px] overflow-hidden rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              style={{ marginLeft: -36, marginTop: -48 }}
              initial={{ rotate: angle, x: 0, y: 0, opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 1],
                rotate: [angle, angle + 20, angle + 20, 0],
                x: [0, Math.cos(((angle - 90) * Math.PI) / 180) * 92, Math.cos(((angle - 90) * Math.PI) / 180) * 92, 0],
                y: [0, Math.sin(((angle - 90) * Math.PI) / 180) * 92, Math.sin(((angle - 90) * Math.PI) / 180) * 92, 0],
                scale: [0.4, 1, 1, 0.72],
              }}
              transition={{ duration: 1.7, times: [0, 0.28, 0.62, 1], ease: 'easeInOut' }}
            >
              <FoodCardFace food={foods[i % foods.length]} owned={false} className="h-full w-full" />
            </motion.div>
          )
        })}
      </motion.div>
      <p className="absolute bottom-[18%] text-[14px] tracking-[0.2em] text-white/80">夜食出锅中…</p>
    </motion.div>
  )
}

/* ─── 开卡结算：恭喜你获得 ─── */

function ResultOverlay({
  food,
  isNew,
  art,
  spin = true,
  onAccept,
  onClose,
}: {
  food: Food
  isNew: boolean
  /** bigCard 只对首张卡生效（只产出了那一张大卡图）。 */
  art: { resultTitle: string; bigCard?: string }
  /** 只读画板关掉常驻旋转光环，省帧。 */
  spin?: boolean
  onAccept: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      className="absolute inset-0 z-40 overflow-hidden bg-[#1c0d05]/[0.92] backdrop-blur-[8px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 光环 */}
      <motion.div
        className="absolute left-1/2 top-[47%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,180,90,0.28) 0%, rgba(255,140,60,0.12) 34%, transparent 62%)',
        }}
        animate={{ scale: [0.9, 1.05, 0.98, 1] }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="absolute left-1/2 top-[47%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        animate={spin ? { rotate: 360 } : undefined}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(255,214,150,0.10) 40deg, transparent 90deg, rgba(255,214,150,0.08) 200deg, transparent 260deg)',
        }}
      />

      <motion.div
        className="absolute left-[48px] top-[126px] w-[281px]"
        initial={{ opacity: 0, y: -18, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
      >
        <ImgOrPlaceholder src={art.resultTitle} label="恭喜你获得" className="h-[54px] w-full object-contain" />
      </motion.div>

      {/* 大卡 */}
      <motion.div
        className="absolute left-1/2 top-[230px] h-[357px] w-[260px] -translate-x-1/2"
        initial={{ opacity: 0, scale: 0.55, rotate: -8, y: 40 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 190, damping: 16 }}
      >
        <div className="relative h-full w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
          <BigCardFace food={food} bigCardSrc={art.bigCard} />
        </div>
        {isNew && (
          <motion.span
            className="absolute -right-2 -top-3 rounded-full bg-gradient-to-b from-[#ffd76e] to-[#ffb83d] px-2.5 py-1 text-[12px] font-bold text-[#7a3c00] shadow"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 320, damping: 14 }}
          >
            新卡入手!
          </motion.span>
        )}
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="absolute left-1/2 top-[626px] h-[48px] w-[172px] -translate-x-1/2 cursor-pointer rounded-full bg-gradient-to-b from-[#ff5a36] to-[#f52b0f] text-[16px] font-bold text-white shadow-[0_6px_18px_rgba(245,43,15,0.45)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onAccept}
      >
        开心收下
      </motion.button>
      <motion.button
        className="absolute left-1/2 top-[706px] flex h-8 w-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-[16px] text-white/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onClose}
      >
        ✕
      </motion.button>
    </motion.div>
  )
}

/* ─── 我的夜食（对齐设计稿「夜食卡页」23-3784）：深棕底 + 页签 + 3×3 卡格 ─── */

function CardsDrawer({
  foods,
  tabs,
  minHold,
  owned,
  onClose,
  onOpenViewer,
  onGift,
  onToast,
}: {
  foods: Food[]
  tabs: { other: string; current: string; history: string }
  minHold: number
  owned: Record<string, number>
  onClose: () => void
  onOpenViewer: (index: number) => void
  onGift: (food: Food) => void
  onToast: (msg: string) => void
}) {
  const ownedList = foods.filter((f) => (owned[f.id] ?? 0) > 0)
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col bg-gradient-to-b from-[#5c3418] via-[#452509] to-[#331a06]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      {/* 标题栏：返回 + 装备卡/夜食卡页签 + 交换记录 */}
      <div className="relative flex h-[56px] shrink-0 items-center justify-center">
        <button className="absolute left-3 cursor-pointer rounded-full p-1.5 text-white" onClick={onClose} aria-label="返回">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11.5 3.5 6 9l5.5 5.5" /></svg>
        </button>
        <div className="flex items-center gap-7">
          <button
            className="cursor-pointer text-[15px] font-medium text-white/55"
            onClick={() => onToast(`${tabs.other}属于其他阶段`)}
          >
            {tabs.other}
          </button>
          <div className="relative">
            <span className="text-[16px] font-bold text-white">{tabs.current}</span>
            <span className="absolute -bottom-[7px] left-1/2 h-[3px] w-[16px] -translate-x-1/2 rounded-full bg-white" />
          </div>
        </div>
        <button
          className="absolute right-3 cursor-pointer text-[13px] text-white/80"
          onClick={() => onToast(`${tabs.history}建设中`)}
        >
          {tabs.history}
        </button>
      </div>

      <div className="grid flex-1 grid-cols-3 content-start gap-x-[13px] gap-y-5 overflow-y-auto px-3 pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {foods.map((f) => {
          const n = owned[f.id] ?? 0
          const has = n > 0
          const viewerIndex = ownedList.findIndex((x) => x.id === f.id)
          return (
            <div key={f.id} className="flex flex-col items-center">
              <div
                className={`relative w-full ${has ? 'cursor-pointer' : ''}`}
                onClick={() => has && onOpenViewer(viewerIndex)}
              >
                <FoodCardFace food={f} owned={has} className="aspect-[109/145] w-full" />
                {has && (
                  <span className="absolute right-0 top-0 rounded-full border border-white/70 bg-[#04ce6c] px-[6px] text-[11px] font-bold leading-[16px] text-white shadow-sm">
                    x{n}
                  </span>
                )}
              </div>
              <button
                className={`mt-2 h-[30px] w-[68px] rounded-full text-[13px] font-semibold ${
                  has && n >= minHold
                    ? 'cursor-pointer bg-gradient-to-b from-[#ff5a36] to-[#f52b0f] text-white shadow-[0_3px_8px_rgba(245,43,15,0.4)]'
                    : has
                      ? 'cursor-default bg-[#7e3020]/70 text-white/45'
                      : 'cursor-pointer bg-[#fdf3e4] text-[#a05c2c]'
                }`}
                onClick={() =>
                  has
                    ? n >= minHold
                      ? onGift(f)
                      : onToast('只有一张啦，留给自己吧')
                    : onToast(`已向好友发出「${f.name}」求赠送`)
                }
              >
                {has ? '赠送' : '求赠送'}
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─── 卡片浏览（1-9309）：横滑大卡 + 赠送 ─── */

function CardViewer({
  index,
  ownedList,
  owned,
  onIndex,
  onClose,
  onGift,
}: {
  index: number
  ownedList: Food[]
  owned: Record<string, number>
  onIndex: (i: number) => void
  onClose: () => void
  onGift: (food: Food) => void
}) {
  const food = ownedList[Math.max(0, Math.min(index, ownedList.length - 1))]
  if (!food) return null
  const n = owned[food.id] ?? 0
  const prev = index > 0
  const next = index < ownedList.length - 1
  return (
    <motion.div
      className="absolute inset-0 z-40 bg-[#241206]/[0.94] backdrop-blur-[8px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        className="absolute right-[24px] top-[68px] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 text-[15px] text-white"
        onClick={onClose}
      >
        ✕
      </button>

      {/* 三联卡：中间为当前卡，两侧露边 */}
      <div className="absolute left-0 top-[157px] h-[357px] w-full">
        {prev && (
          <button className="absolute left-[-226px] top-0 h-full w-[260px] cursor-pointer opacity-80" onClick={() => onIndex(index - 1)}>
            <BigCardFace food={ownedList[index - 1]} />
          </button>
        )}
        <motion.div
          key={food.id}
          className="absolute left-1/2 top-0 h-full w-[260px] -translate-x-1/2 drop-shadow-[0_16px_36px_rgba(0,0,0,0.5)]"
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <BigCardFace food={food} />
        </motion.div>
        {next && (
          <button className="absolute right-[-226px] top-0 h-full w-[260px] cursor-pointer opacity-80" onClick={() => onIndex(index + 1)}>
            <BigCardFace food={ownedList[index + 1]} />
          </button>
        )}
      </div>

      {/* 圆点 */}
      <div className="absolute left-1/2 top-[535px] flex -translate-x-1/2 items-center gap-[6px]">
        {ownedList.map((f, i) => (
          <button
            key={f.id}
            className={`cursor-pointer rounded-full transition-all ${i === index ? 'h-[6px] w-[16px] bg-white' : 'h-[5px] w-[5px] bg-white/40'}`}
            onClick={() => onIndex(i)}
          />
        ))}
      </div>
      <p className="absolute left-0 top-[583px] w-full text-center text-[13px] text-white/60">
        {n > 1 ? `（多了${n - 1}张）` : '（就这一张啦）'}
      </p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`absolute left-1/2 top-[615px] h-[48px] w-[172px] -translate-x-1/2 rounded-full text-[16px] font-bold ${
          n > 1
            ? 'cursor-pointer bg-gradient-to-b from-[#ff5a36] to-[#f52b0f] text-white shadow-[0_6px_18px_rgba(245,43,15,0.45)]'
            : 'cursor-default bg-white/20 text-white/60'
        }`}
        onClick={() => n > 1 && onGift(food)}
      >
        赠送
      </motion.button>
    </motion.div>
  )
}

/* ─── 兑红包 ─── */

function RedeemOverlay({
  tier,
  giftSrc,
  onAccept,
  onClose,
}: {
  tier: Tier
  giftSrc: string
  onAccept: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center bg-[#1c0d05]/[0.92] backdrop-blur-[8px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute left-1/2 top-[46%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,120,80,0.3) 0%, rgba(255,90,54,0.12) 36%, transparent 64%)' }}
        animate={{ scale: [0.9, 1.06, 1] }}
        transition={{ duration: 1 }}
      />
      <motion.p
        className="mt-[150px] text-[26px] font-black tracking-wide text-[#ffe3b8]"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        集齐{tier.need}种夜食!
      </motion.p>
      <motion.img
        src={giftSrc}
        alt="奖励"
        className="mt-6 w-[210px] drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
        initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
        animate={{ scale: [0.4, 1.08, 1], rotate: [-12, 3, 0], opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        draggable={false}
      />
      <motion.p
        className="mt-5 text-[17px] font-semibold text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        恭喜获得 <span className="text-[#ffd76e]">{tier.reward}</span>
      </motion.p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="mt-8 h-[48px] w-[172px] cursor-pointer rounded-full bg-gradient-to-b from-[#ff5a36] to-[#f52b0f] text-[16px] font-bold text-white shadow-[0_6px_18px_rgba(245,43,15,0.45)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onAccept}
      >
        开心收下
      </motion.button>
      <button className="mt-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 text-[15px] text-white/90" onClick={onClose}>
        ✕
      </button>
    </motion.div>
  )
}

/* ─── 我的奖品 ─── */

function PrizesOverlay({
  tiers,
  art,
  emptyText,
  claimed,
  onClose,
}: {
  tiers: Tier[]
  art: { mascot: string; envelope: string }
  emptyText: string
  claimed: Record<number, boolean>
  onClose: () => void
}) {
  const got = tiers.filter((t) => claimed[t.need])
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col bg-[#f7ecdc]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
    >
      <div className="relative flex h-[88px] shrink-0 items-end justify-center bg-gradient-to-b from-[#ffe1b8] to-[#f7ecdc] pb-2">
        <button className="absolute bottom-1.5 left-3 cursor-pointer rounded-full p-1.5 text-[#6b4a2b]" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11.5 3.5 6 9l5.5 5.5" /></svg>
        </button>
        <h2 className="text-[17px] font-bold text-[#4a2c12]">我的奖品</h2>
      </div>
      {got.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
          <ImgOrPlaceholder src={art.mascot} label="IP" className="w-[120px] opacity-90" />
          <p className="text-[14px] text-[#9a7b58]">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-4">
          {got.map((t) => (
            <div key={t.need} className="flex items-center gap-3 rounded-[14px] bg-white/80 p-3 shadow-[0_2px_8px_rgba(90,52,18,0.1)]">
              <ImgOrPlaceholder src={art.envelope} label="奖励" className="h-[52px] w-[42px] object-contain" />
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#4a2c12]">{t.reward}</p>
                <p className="text-[12px] text-[#9a7b58]">集齐{t.need}种夜食兑换 · 有效期至 8.31</p>
              </div>
              <span className="rounded-full bg-[#eee2cf] px-2.5 py-1 text-[12px] font-semibold text-[#8a6b47]">已到账</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─── 活动规则 ─── */

function RulesOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-6 backdrop-blur-[4px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex max-h-[78%] w-full flex-col rounded-[18px] bg-[#fdf6ec] p-5"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 shrink-0 text-center text-[17px] font-black text-[#4a2c12]">活动规则</h3>
        {/* 正文滚动，按钮固定在弹窗底部 —— 否则按钮会被卷进滚动区裁掉 */}
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto text-[13px] leading-relaxed text-[#6b4a2b] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p><b>活动时间：</b>6月30日 10:00 — 8月31日 23:59（北京时间）</p>
          <p><b>集美食卡 领奖励：</b>活动设有「沸腾火锅」「红火小龙虾」「滋滋烤肉」「鲜烧黄鱼」「浓香披萨」「香脆炸鸡」「冰爽柠檬茶」「解馋卤味」「上头螺蛳粉」9 种虚拟夜食卡。</p>
          <p>集齐 <b>2 / 4 / 7 / 9</b> 种，可分别解锁 <b>2元夜食券、5元夜食券、43元夜食券包</b> 及实物奖励 <b>小马黄金转运珠</b>。奖励可叠加领取。</p>
          <p><b>获得抽卡机会：</b>带定位&话题投稿（每日上限 5 次）、给朋友赠送美食卡（每日上限 3 次）、每日首次浏览活动页等任务均可获得抽卡机会。</p>
          <p><b>赠送规则：</b>同一种卡持有 2 张及以上时可赠送好友，好友领取后生效。</p>
          <p>优惠券每日限量发放，先到先得；实物奖励需在活动页填写收货信息，活动结束后 90 天内寄出。</p>
          <p className="text-[#9a7b58]">本活动与 Apple Inc. 无关。最终解释权归平台所有。</p>
        </div>
        <button
          className="mx-auto mt-4 block h-[40px] w-[140px] shrink-0 cursor-pointer rounded-full bg-gradient-to-b from-[#ff5a36] to-[#f52b0f] text-[15px] font-bold text-white"
          onClick={onClose}
        >
          我知道了
        </button>
      </motion.div>
    </motion.div>
  )
}

/* 画布上同时挂 5 个实例，平移缩放时靠 memo 避免整树重渲。 */
export default memo(XiahuaH5PreviewBase)
