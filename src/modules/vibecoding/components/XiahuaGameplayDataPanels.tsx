import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { ChevronDown, Image as ImageIcon, Loader2, Upload } from '@/shared/icons'
import { ASSET_FILES, assetMap, cardArt, type ActivityPreset, type AssetKey } from './ActivityPreset'
import {
  importBoolean,
  importNumber,
  importString,
  importStringArray,
  parseGameplayImport,
  type ImportedGameplayRow,
} from './GameplayConfigImport'
import {
  DEFAULT_XIAHUA_GAMEPLAY_MODULES,
  DEFAULT_XIAHUA_PARTICIPATION_POLICY,
  type XiahuaActivityPlatform,
  type XiahuaCardDef,
  type XiahuaEntryChannel,
  type XiahuaGameplay,
  type XiahuaParticipationPolicy,
  type XiahuaPrizeDef,
  type XiahuaQuizQuestionDef,
  type XiahuaTaskDef,
  type XiahuaVoteCandidateDef,
} from './XiahuaGameplay'

const INPUT =
  'h-8 w-full rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-0)] px-2.5 text-[11px] text-[var(--color-ink)] outline-none transition-colors focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50'

function DataPanel({
  title,
  summary,
  description,
  actions,
  defaultOpen = true,
  children,
}: {
  title: string
  summary?: string
  description?: string
  actions?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--divider-soft)] bg-[var(--color-surface-0)]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={() => setOpen((current) => !current)} className="min-w-0 flex-1 text-left">
          <h3 className="text-[12px] font-semibold text-[var(--color-ink)]/82">{title}</h3>
          {summary || description ? (
            <p className="mt-0.5 truncate text-[11px] leading-[18px] text-[var(--color-ink)]/45">
              {open ? description ?? summary : summary ?? description}
            </p>
          ) : null}
        </button>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[10px] font-medium text-[var(--color-ink)]/52 transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]/75"
        >
          {open ? '收起' : '展开'}
          <ChevronDown className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open ? <div className="border-t border-[var(--divider-soft)] px-4 py-4">{children}</div> : null}
    </section>
  )
}

function QuietButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 items-center gap-1 rounded-md border border-[var(--divider-soft)] px-2 text-[10px] text-[var(--color-ink)]/58 transition-colors hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]"
    >
      {children}
    </button>
  )
}

function ImportButton({
  label,
  template,
  onRows,
}: {
  label: string
  template: string
  onRows: (rows: ImportedGameplayRow[]) => number
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('导入失败', { description: '文件不能超过 2 MB。' })
      return
    }
    setLoading(true)
    try {
      const rows = parseGameplayImport(await file.text(), file.name)
      const count = onRows(rows)
      if (!count) throw new Error('没有识别到有效内容，请核对字段名')
      toast.success(`已导入并合并 ${count} 项`, {
        description: '相同编号的内容已更新，文件中未出现的原内容继续保留。',
      })
    } catch (error) {
      toast.error('导入失败', {
        description: error instanceof Error ? error.message : '文件格式无法识别',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        className="hidden"
        onChange={importFile}
      />
      <button
        type="button"
        disabled={loading}
        title={`支持 CSV / JSON；字段：${template}`}
        onClick={() => inputRef.current?.click()}
        className="flex h-7 items-center gap-1 rounded-md border border-[var(--divider-soft)] px-2 text-[10px] text-[var(--color-ink)]/58 transition-colors hover:bg-[var(--fill-subtle)] disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
        {loading ? '导入中' : label}
      </button>
    </>
  )
}

function AssetThumb({ src, label }: { src?: string; label: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--divider-soft)] bg-[var(--fill-subtle)]">
      {src && !failed ? (
        <img src={src} alt={label} className="size-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <ImageIcon className="size-3.5 text-[var(--color-ink)]/25" />
      )}
    </span>
  )
}

type AssetUsage = 'all' | 'card' | 'prize' | 'task'

function availableAssetKeys(preset: ActivityPreset, usage: AssetUsage): string[] {
  const keys = [...new Set([...Object.keys(ASSET_FILES), ...Object.keys(preset.assetOverrides ?? {})])]
  if (usage === 'card') return keys.filter((key) => key.startsWith('card-') && !key.endsWith('-grey'))
  if (usage === 'prize') return keys.filter((key) => /^tier\d$/.test(key) || key === 'envelope')
  if (usage === 'task') {
    return keys.filter((key) => ['secTasks', 'secTopics', 'btnMyCards', 'btnDraw', 'mascot'].includes(key))
  }
  return keys
}

function assetSource(preset: ActivityPreset, key?: string): string | undefined {
  if (!key) return undefined
  if (key.startsWith('card-')) return cardArt(preset, key.slice(5)).img
  return assetMap(preset)[key as AssetKey]
}

const ASSET_DISPLAY_NAMES: Record<string, string> = {
  headKv: '活动头图',
  title: '活动标题',
  btnDraw: '抽卡按钮',
  btnMyCards: '我的卡片入口',
  btnMyPrizes: '我的奖品入口',
  panelBg: '卡册面板背景',
  tier1: '第一档奖励图',
  tier2: '第二档奖励图',
  tier3: '第三档奖励图',
  tier4: '终极奖励图',
  bigCard: '开卡主画面',
  resultTitle: '开卡结果标题',
  secTasks: '任务区标题',
  secTopics: '话题区标题',
  secBanner: '活动横幅',
  footerLogo: '页尾品牌标识',
  beanBar: '活动积分栏',
  envelope: '兑奖礼物图',
  mascot: '活动 IP 形象',
}

function assetDisplayName(preset: ActivityPreset, key: string) {
  if (key.startsWith('card-')) {
    const card = preset.gameplay.cards.find((item) => item.id === key.slice(5))
    return card ? `${card.name}卡面` : '卡面素材'
  }
  return ASSET_DISPLAY_NAMES[key] ?? '活动素材'
}

function inclusiveDays(from?: string, to?: string) {
  if (!from || !to) return 1
  const start = new Date(from.replace(' ', 'T')).getTime()
  const end = new Date(to.replace(' ', 'T')).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1
  return Math.max(1, Math.ceil((end - start) / 86_400_000))
}

function activityDays(value: XiahuaGameplay) {
  const policy = value.participation ?? DEFAULT_XIAHUA_PARTICIPATION_POLICY
  return inclusiveDays(policy.startAt, policy.endAt)
}

function AssetKeySelect({
  value,
  preset,
  label,
  usage = 'all',
  onChange,
}: {
  value?: string
  preset: ActivityPreset
  label: string
  usage?: AssetUsage
  onChange: (next: string) => void
}) {
  const keys = availableAssetKeys(preset, usage)
  return (
    <select className={INPUT} value={value ?? ''} aria-label={label} onChange={(event) => onChange(event.target.value)}>
      <option value="">未绑定素材</option>
      {value && !keys.includes(value) ? <option value={value}>{assetDisplayName(preset, value)}</option> : null}
      {keys.map((key) => (
        <option key={key} value={key}>
          {assetDisplayName(preset, key)}
        </option>
      ))}
    </select>
  )
}

function mergeById<T extends { id: string }>(current: T[], imported: T[]): T[] {
  const next = new Map(current.map((item) => [item.id, item]))
  imported.forEach((item) => next.set(item.id, { ...next.get(item.id), ...item }))
  return [...next.values()]
}

export function ContentPoolPanel({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
  context = 'lottery',
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
  context?: 'lottery' | 'collection'
}) {
  const enabledCards = value.cards.filter((card) => card.enabled !== false)
  const totalWeight = enabledCards.reduce((sum, card) => sum + (card.weight ?? 100), 0)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  const importCards = (rows: ImportedGameplayRow[]) => {
    const imported = rows
      .map((row): XiahuaCardDef | null => {
        const id = importString(row, 'id')
        const name = importString(row, 'name')
        if (!id || !name) return null
        const rarity = importString(row, 'rarity', 'common')
        return {
          id,
          name,
          motto: importString(row, 'motto', '待补充文案'),
          weight: Math.max(1, importNumber(row, 'weight', 100)),
          rarity: rarity === 'rare' || rarity === 'epic' ? rarity : 'common',
          assetKey: importString(row, 'assetKey', `card-${id}`),
          enabled: importBoolean(row, 'enabled', true),
        }
      })
      .filter((card): card is XiahuaCardDef => card !== null)
    if (imported.length) onChange({ ...value, cards: mergeById(value.cards, imported) })
    return imported.length
  }

  const setCard = (id: string, patch: Partial<XiahuaCardDef>) =>
    onChange({
      ...value,
      cards: value.cards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
    })

  return (
    <DataPanel
      title={context === 'lottery' ? '抽取卡片' : '卡册内容'}
      summary={
        context === 'lottery'
          ? `每次抽中 1 张夜食卡 · ${enabledCards.length} 张生效 · 基础权重合计 ${totalWeight}`
          : `卡册共收集 ${enabledCards.length} 种夜食卡 · 普通 ${enabledCards.filter((card) => (card.rarity ?? 'common') === 'common').length} / 稀有 ${enabledCards.filter((card) => card.rarity === 'rare').length} / 史诗 ${enabledCards.filter((card) => card.rarity === 'epic').length}`
      }
      description={
        context === 'lottery'
          ? '管理一次抽取可能返回的卡片、卡面素材和分池内相对权重。'
          : '管理卡册需要收集的卡片；卡片名称、稀有度和素材会同步用于抽取结果展示。'
      }
      actions={
        <>
          <ImportButton label="导入内容" template="id,name,motto,rarity,weight,assetKey,enabled" onRows={importCards} />
          <QuietButton onClick={onOpenAssetLibrary}>
            <ImageIcon className="size-3" /> 素材库
          </QuietButton>
        </>
      }
    >
      <div className="space-y-2">
        {value.cards.map((card) => {
          const weight = card.weight ?? 100
          const chance = totalWeight && card.enabled !== false ? ((weight / totalWeight) * 100).toFixed(1) : '0.0'
          const editing = editingCardId === card.id
          const rarityLabel = card.rarity === 'epic' ? '史诗' : card.rarity === 'rare' ? '稀有' : '普通'
          return (
            <div
              key={card.id}
              className={`overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-1)] ${card.enabled === false ? 'opacity-55' : ''}`}
            >
              <div className="grid grid-cols-[36px_minmax(0,1fr)_42px_48px_44px_48px] items-center gap-2 px-3 py-2.5">
                <AssetThumb src={assetSource(preset, card.assetKey) ?? cardArt(preset, card.id).img} label={card.name} />
                <button type="button" onClick={() => setEditingCardId(editing ? null : card.id)} className="min-w-0 text-left">
                  <p className="truncate text-[11px] font-medium text-[var(--color-ink)]/78">{card.name}</p>
                  <p className="mt-0.5 truncate text-[9px] text-[var(--color-ink)]/38">{card.motto}</p>
                </button>
                <span className="text-center text-[9px] text-[var(--color-ink)]/48">{rarityLabel}</span>
                <span className="text-right font-mono text-[9px] text-[var(--color-ink)]/48">{chance}%</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={card.enabled !== false}
                  aria-label={`${card.name}启用状态`}
                  onClick={() => setCard(card.id, { enabled: card.enabled === false })}
                  className={`h-6 rounded-md text-[9px] font-medium ${card.enabled === false ? 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/38' : 'bg-emerald-50 text-emerald-700'}`}
                >
                  {card.enabled === false ? '停用' : '启用'}
                </button>
                <button
                  type="button"
                  aria-expanded={editing}
                  onClick={() => setEditingCardId(editing ? null : card.id)}
                  className="flex h-7 items-center justify-center gap-1 rounded-md text-[9px] font-medium text-[var(--color-ink)]/48 hover:bg-white"
                >
                  {editing ? '收起' : '编辑'}
                </button>
              </div>
              {editing ? (
                <div className="grid gap-3 border-t border-[var(--divider-soft)] bg-white p-3 @[620px]:grid-cols-[1.3fr_1fr]">
                  <div>
                    <label>
                      <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">卡片名称</span>
                      <input
                        className={INPUT}
                        value={card.name}
                        onChange={(event) => setCard(card.id, { name: event.target.value })}
                      />
                    </label>
                    <label className="mt-2 block">
                      <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">卡面短句</span>
                      <input
                        className={INPUT}
                        value={card.motto}
                        placeholder="卡面短句 / 内容描述"
                        onChange={(event) => setCard(card.id, { motto: event.target.value })}
                      />
                    </label>
                  </div>
                  <div>
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-2">
                      <label>
                        <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">稀有度</span>
                        <select
                          className={INPUT}
                          value={card.rarity ?? 'common'}
                          onChange={(event) => setCard(card.id, { rarity: event.target.value as XiahuaCardDef['rarity'] })}
                        >
                          <option value="common">普通</option>
                          <option value="rare">稀有</option>
                          <option value="epic">史诗</option>
                        </select>
                      </label>
                      <label>
                        <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">卡面素材</span>
                        <AssetKeySelect
                          value={card.assetKey}
                          preset={preset}
                          label={`${card.name}卡面素材`}
                          usage="card"
                          onChange={(assetKey) => setCard(card.id, { assetKey: assetKey || undefined })}
                        />
                      </label>
                    </div>
                    <label className="mt-3 block">
                      <span className="mb-1.5 flex items-center justify-between text-[9px] text-[var(--color-ink)]/38">
                        <span>抽中权重</span>
                        <span>{weight} · 当前概率 {chance}%</span>
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={200}
                        value={weight}
                        aria-label={`${card.name}权重`}
                        onChange={(event) => setCard(card.id, { weight: Number(event.target.value) })}
                        className="h-1 w-full cursor-ew-resize appearance-none rounded-full bg-[var(--fill-subtle)] accent-[#357ef8]"
                      />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </DataPanel>
  )
}

export function CopyManagementPanel({
  value,
  onChange,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
}) {
  const setCopy = (key: keyof XiahuaGameplay['copy'], next: string) =>
    onChange({ ...value, copy: { ...value.copy, [key]: next } })
  const previews = {
    progress: value.copy.progress.replace('{n}', '3'),
    progressSub: value.copy.progressSub.replace('{reward}', '当前档奖励'),
    allDone: value.copy.allDone.replace('{total}', String(value.cards.length)),
  }
  const templateWarning =
    !value.copy.progress.includes('{n}') ||
    !value.copy.progressSub.includes('{reward}') ||
    !value.copy.allDone.includes('{total}')

  return (
    <DataPanel
      title="玩法文案"
      summary={`进度「${previews.progress}」· 集齐「${previews.allDone}」· 另有机会不足、空态和赠送反馈`}
      description="文案与规则分开管理；占位符在运行时用真实进度和奖品名替换。"
      actions={templateWarning ? <span className="text-[10px] text-amber-600">占位符不完整</span> : null}
      defaultOpen={false}
    >
      <div className="grid gap-3 @[580px]:grid-cols-2">
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">进度主文案 · 需保留 {'{n}'}</span>
          <input
            className={INPUT}
            value={value.copy.progress}
            onChange={(event) => setCopy('progress', event.target.value)}
          />
          <span className="mt-1 block text-[9px] text-[var(--color-ink)]/32">预览：{previews.progress}</span>
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">进度副文案 · 需保留 {'{reward}'}</span>
          <input
            className={INPUT}
            value={value.copy.progressSub}
            onChange={(event) => setCopy('progressSub', event.target.value)}
          />
          <span className="mt-1 block text-[9px] text-[var(--color-ink)]/32">预览：{previews.progressSub}</span>
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">全部集齐 · 需保留 {'{total}'}</span>
          <input
            className={INPUT}
            value={value.copy.allDone}
            onChange={(event) => setCopy('allDone', event.target.value)}
          />
          <span className="mt-1 block text-[9px] text-[var(--color-ink)]/32">预览：{previews.allDone}</span>
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">机会不足提示</span>
          <input
            className={INPUT}
            value={value.copy.chancesInsufficient ?? ''}
            onChange={(event) => setCopy('chancesInsufficient', event.target.value)}
          />
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">奖品空态</span>
          <input
            className={INPUT}
            value={value.copy.prizeEmpty ?? ''}
            onChange={(event) => setCopy('prizeEmpty', event.target.value)}
          />
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">赠送成功提示</span>
          <input
            className={INPUT}
            value={value.copy.giftSuccess ?? ''}
            onChange={(event) => setCopy('giftSuccess', event.target.value)}
          />
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">规则页标题</span>
          <input
            className={INPUT}
            value={value.copy.rulesTitle ?? ''}
            onChange={(event) => setCopy('rulesTitle', event.target.value)}
          />
        </label>
      </div>
    </DataPanel>
  )
}

export function PrizeInventoryPanel({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const prizes = value.prizes ?? []
  const totalActivityDays = activityDays(value)
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null)

  const setPrize = (id: string, patch: Partial<XiahuaPrizeDef>) => {
    const nextPrizes = prizes.map((prize) => (prize.id === id ? { ...prize, ...patch } : prize))
    onChange({
      ...value,
      prizes: nextPrizes,
      tiers: value.tiers.map((tier) =>
        tier.prizeId === id
          ? {
              ...tier,
              reward: patch.name ?? tier.reward,
              stock: patch.dailyStock ?? tier.stock,
              totalStock: patch.totalStock ?? tier.totalStock,
              perUserLimit: patch.perUserLimit ?? tier.perUserLimit,
              assetKey: patch.assetKey ?? tier.assetKey,
            }
          : tier,
      ),
    })
  }

  const importPrizes = (rows: ImportedGameplayRow[]) => {
    const imported = rows
      .map((row): XiahuaPrizeDef | null => {
        const id = importString(row, 'id')
        const name = importString(row, 'name')
        if (!id || !name) return null
        const type = importString(row, 'type', 'coupon')
        return {
          id,
          name,
          type: type === 'goods' || type === 'points' || type === 'virtual' ? type : 'coupon',
          valueLabel: importString(row, 'valueLabel'),
          dailyStock: Math.max(0, importNumber(row, 'dailyStock', 0)),
          totalStock: Math.max(0, importNumber(row, 'totalStock', 0)),
          perUserLimit: Math.max(1, importNumber(row, 'perUserLimit', 1)),
          fulfillmentId: importString(row, 'fulfillmentId'),
          assetKey: importString(row, 'assetKey'),
          fallbackPrizeId: importString(row, 'fallbackPrizeId') || undefined,
          enabled: importBoolean(row, 'enabled', true),
          fulfillmentMode:
            importString(row, 'fulfillmentMode') === 'scheduled' ||
            importString(row, 'fulfillmentMode') === 'manual' ||
            importString(row, 'fulfillmentMode') === 'offline'
              ? (importString(row, 'fulfillmentMode') as XiahuaPrizeDef['fulfillmentMode'])
              : 'instant',
          validityDays: Math.max(0, importNumber(row, 'validityDays', 30)),
          stockReset:
            importString(row, 'stockReset') === 'weekly' || importString(row, 'stockReset') === 'none'
              ? (importString(row, 'stockReset') as XiahuaPrizeDef['stockReset'])
              : 'daily',
          refundPolicy: importString(row, 'refundPolicy') === 'revoke' ? 'revoke' : 'retain',
          shippingRequired: importBoolean(row, 'shippingRequired', false),
        }
      })
      .filter((prize): prize is XiahuaPrizeDef => prize !== null)
    if (imported.length) onChange({ ...value, prizes: mergeById(prizes, imported) })
    return imported.length
  }

  return (
    <DataPanel
      title="奖品、库存与履约"
      summary={`${prizes.filter((prize) => prize.enabled).length} 个奖品启用 · ${prizes.filter((prize) => prize.enabled && prize.stockReset === 'daily' && prize.dailyStock * totalActivityDays > prize.totalStock).length} 个存在活动期库存缺口 · 支持缺货替代`}
      description="统一维护奖品内容、每日发放量、活动总量和缺货替代方案；库存修改会同步到所有兑换档位。"
      actions={
        <>
          <ImportButton
            label="导入奖品"
            template="id,name,type,valueLabel,dailyStock,totalStock,perUserLimit,fulfillmentId,fulfillmentMode,validityDays,stockReset,refundPolicy,shippingRequired,assetKey,fallbackPrizeId,enabled"
            onRows={importPrizes}
          />
          <QuietButton onClick={onOpenAssetLibrary}>
            <ImageIcon className="size-3" /> 素材库
          </QuietButton>
        </>
      }
    >
      <div className="space-y-3">
        {prizes.map((prize) => {
          const src = assetSource(preset, prize.assetKey)
          const coverageDays = prize.dailyStock > 0 ? Math.floor(prize.totalStock / prize.dailyStock) : 0
          const expectedStock = prize.dailyStock * totalActivityDays
          const stockGap = Math.max(0, expectedStock - prize.totalStock)
          const stockIsShort = prize.enabled && prize.stockReset === 'daily' && stockGap > 0
          const editing = editingPrizeId === prize.id
          return (
            <div
              key={prize.id}
              className={`overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-1)] ${prize.enabled ? '' : 'opacity-55'}`}
            >
              <div className="grid grid-cols-[36px_minmax(0,1fr)_96px_44px_48px] items-center gap-2 px-3 py-2.5">
                <AssetThumb src={src} label={prize.name} />
                <input
                  className={`${INPUT} min-w-0 font-medium`}
                  value={prize.name}
                  aria-label={`${prize.id}奖品名称`}
                  onChange={(event) => setPrize(prize.id, { name: event.target.value })}
                />
                <select
                  className={INPUT}
                  value={prize.type}
                  aria-label={`${prize.name}奖品类型`}
                  onChange={(event) =>
                    setPrize(prize.id, {
                      type: event.target.value as XiahuaPrizeDef['type'],
                    })
                  }
                >
                  <option value="coupon">优惠券</option>
                  <option value="goods">实物</option>
                  <option value="points">积分</option>
                  <option value="virtual">虚拟物品</option>
                </select>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prize.enabled}
                  aria-label={`${prize.name}启用状态`}
                  onClick={() => setPrize(prize.id, { enabled: !prize.enabled })}
                  className={`h-7 w-11 rounded-md text-[9px] ${prize.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/38'}`}
                >
                  {prize.enabled ? '启用' : '停用'}
                </button>
                <button
                  type="button"
                  aria-expanded={editing}
                  onClick={() => setEditingPrizeId(editing ? null : prize.id)}
                  className="flex h-7 items-center justify-center gap-1 rounded-md text-[9px] font-medium text-[var(--color-ink)]/48 hover:bg-white"
                >
                  {editing ? '收起' : '编辑'}
                </button>
              </div>
              {editing ? (
                <div className="border-t border-[var(--divider-soft)] bg-white p-3">
              <div className="grid gap-2 @[520px]:grid-cols-4">
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">展示价值</span>
                  <input
                    className={INPUT}
                    value={prize.valueLabel}
                    onChange={(event) => setPrize(prize.id, { valueLabel: event.target.value })}
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">日库存</span>
                  <input
                    type="number"
                    min={0}
                    className={INPUT}
                    value={prize.dailyStock}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        dailyStock: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">总库存</span>
                  <input
                    type="number"
                    min={0}
                    className={INPUT}
                    value={prize.totalStock}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        totalStock: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">人均上限</span>
                  <input
                    type="number"
                    min={1}
                    className={INPUT}
                    value={prize.perUserLimit}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        perUserLimit: Math.max(1, Number(event.target.value) || 1),
                      })
                    }
                  />
                </label>
              </div>
              <div className="mt-2 grid gap-2 @[620px]:grid-cols-[1fr_150px_150px]">
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">券模板 / 商品 SKU</span>
                  <input
                    className={INPUT}
                    value={prize.fulfillmentId}
                    onChange={(event) => setPrize(prize.id, { fulfillmentId: event.target.value })}
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">奖品素材</span>
                  <AssetKeySelect
                    value={prize.assetKey}
                    preset={preset}
                    label={`${prize.name}素材`}
                    usage="prize"
                    onChange={(assetKey) => setPrize(prize.id, { assetKey })}
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">缺货兜底</span>
                  <select
                    className={INPUT}
                    value={prize.fallbackPrizeId ?? ''}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        fallbackPrizeId: event.target.value || undefined,
                      })
                    }
                  >
                    <option value="">无兜底</option>
                    {prizes
                      .filter((item) => item.id !== prize.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="mt-2 grid gap-2 @[620px]:grid-cols-5">
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">发放方式</span>
                  <select
                    className={INPUT}
                    value={prize.fulfillmentMode ?? 'instant'}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        fulfillmentMode: event.target.value as XiahuaPrizeDef['fulfillmentMode'],
                      })
                    }
                  >
                    <option value="instant">即时发放</option>
                    <option value="scheduled">定时结算</option>
                    <option value="manual">人工发放</option>
                    <option value="offline">线下发放</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">有效天数</span>
                  <input
                    type="number"
                    min={0}
                    className={INPUT}
                    value={prize.validityDays ?? 0}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        validityDays: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">库存刷新</span>
                  <select
                    className={INPUT}
                    value={prize.stockReset ?? 'none'}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        stockReset: event.target.value as XiahuaPrizeDef['stockReset'],
                      })
                    }
                  >
                    <option value="none">不刷新</option>
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">退款处理</span>
                  <select
                    className={INPUT}
                    value={prize.refundPolicy ?? 'retain'}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        refundPolicy: event.target.value as XiahuaPrizeDef['refundPolicy'],
                      })
                    }
                  >
                    <option value="retain">保留奖励</option>
                    <option value="revoke">撤回奖励</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">履约信息</span>
                  <select
                    className={INPUT}
                    value={prize.shippingRequired ? 'shipping' : 'none'}
                    onChange={(event) =>
                      setPrize(prize.id, {
                        shippingRequired: event.target.value === 'shipping',
                      })
                    }
                  >
                    <option value="none">无需收集</option>
                    <option value="shipping">收集邮寄地址</option>
                  </select>
                </label>
              </div>
              <div
                className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[10px] ${stockIsShort ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}
              >
                <span>
                  活动共 {totalActivityDays} 天 · 每日上限 {prize.dailyStock.toLocaleString('zh-CN')} 份 · 总库存{' '}
                  {prize.totalStock.toLocaleString('zh-CN')} 份
                </span>
                <span className="font-medium">
                  {stockIsShort
                    ? `按每日上限仅覆盖 ${coverageDays} 天，还差 ${stockGap.toLocaleString('zh-CN')} 份`
                    : prize.stockReset === 'daily'
                      ? '库存可覆盖整个活动期'
                      : '按活动总库存控制'}
                </span>
              </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingPrizeId(prize.id)}
                  className={`flex w-full flex-wrap items-center justify-between gap-2 border-t border-[var(--divider-soft)] px-3 py-2 text-left text-[9px] ${stockIsShort ? 'text-amber-700' : 'text-[var(--color-ink)]/42'}`}
                >
                  <span>每日 {prize.dailyStock.toLocaleString('zh-CN')} 份 · 总量 {prize.totalStock.toLocaleString('zh-CN')} 份 · 每人限领 {prize.perUserLimit} 份</span>
                  <span className="font-medium">
                    {stockIsShort ? `仅覆盖 ${coverageDays}/${totalActivityDays} 天` : '库存覆盖正常'}
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </DataPanel>
  )
}

export function TaskDefinitionPanel({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const policy = value.participation ?? DEFAULT_XIAHUA_PARTICIPATION_POLICY
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const setTask = (id: string, patch: Partial<XiahuaTaskDef>) =>
    onChange({
      ...value,
      tasks: value.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    })

  const importTasks = (rows: ImportedGameplayRow[]) => {
    const imported = rows
      .map((row): XiahuaTaskDef | null => {
        const id = importString(row, 'id')
        const label = importString(row, 'label')
        if (!id || !label) return null
        const audience = importString(row, 'audience', 'all')
        return {
          id,
          label,
          reward: Math.max(1, importNumber(row, 'reward', 1)),
          dailyLimit: Math.max(1, importNumber(row, 'dailyLimit', 1)),
          eventSource: importString(row, 'eventSource'),
          eventKey: importString(row, 'eventKey'),
          resetCycle: importString(row, 'resetCycle') === 'activity' ? 'activity' : 'daily',
          audience: audience === 'new_creator' || audience === 'returning_creator' ? audience : 'all',
          enabled: importBoolean(row, 'enabled', true),
          assetKey: importString(row, 'assetKey') || undefined,
          taskType: ['post', 'gift', 'visit', 'share'].includes(importString(row, 'taskType'))
            ? (importString(row, 'taskType') as XiahuaTaskDef['taskType'])
            : 'custom',
          subtitle: importString(row, 'subtitle'),
          countDimension: ['DID', 'ACTID'].includes(importString(row, 'countDimension'))
            ? (importString(row, 'countDimension') as XiahuaTaskDef['countDimension'])
            : 'UID',
          claimMode: importString(row, 'claimMode') === 'manual' ? 'manual' : 'auto',
          cooldownSeconds: Math.max(0, importNumber(row, 'cooldownSeconds', 0)),
          validFrom: importString(row, 'validFrom'),
          validTo: importString(row, 'validTo'),
          jumpSchema: importString(row, 'jumpSchema'),
          completedCopy: importString(row, 'completedCopy', '已完成'),
          expiredCopy: importString(row, 'expiredCopy', '已结束'),
        }
      })
      .filter((task): task is XiahuaTaskDef => task !== null)
    if (imported.length) onChange({ ...value, tasks: mergeById(value.tasks, imported) })
    return imported.length
  }

  return (
    <DataPanel
      title="任务与机会发放"
      summary={`${value.tasks.filter((task) => task.enabled !== false).length} 个任务生效 · 每日最多发放 ${value.tasks.filter((task) => task.enabled !== false && task.resetCycle !== 'activity').reduce((total, task) => total + task.dailyLimit * task.reward, 0)} 次抽卡机会 · 支持分人群和分时段`}
      description="配置用户要完成什么、完成几次、何时生效，以及每次获得多少抽卡机会。"
      actions={
        <>
          <ImportButton
            label="导入任务"
            template="id,label,subtitle,taskType,eventSource,eventKey,audience,countDimension,resetCycle,dailyLimit,reward,claimMode,cooldownSeconds,validFrom,validTo,jumpSchema,completedCopy,expiredCopy,assetKey,enabled"
            onRows={importTasks}
          />
          <QuietButton onClick={onOpenAssetLibrary}>
            <ImageIcon className="size-3" /> 素材库
          </QuietButton>
        </>
      }
    >
      <div className="space-y-3">
        {value.tasks.map((task) => {
          const effectiveDays =
            task.resetCycle === 'activity'
              ? 1
              : inclusiveDays(task.validFrom || policy.startAt, task.validTo || policy.endAt)
          const maximumReward = task.dailyLimit * task.reward * effectiveDays
          const audienceLabel =
            task.audience === 'new_creator'
              ? '新作者'
              : task.audience === 'returning_creator'
                ? '回流作者'
                : '用户'
          const editing = editingTaskId === task.id
          const cycleLabel = task.resetCycle === 'activity' ? '活动期' : '每日'
          return (
          <div
            key={task.id}
            className={`overflow-hidden rounded-lg border border-[var(--divider-soft)] bg-[var(--color-surface-1)] ${task.enabled === false ? 'opacity-55' : ''}`}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setEditingTaskId(editing ? null : task.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-[11px] font-medium text-[var(--color-ink)]/78">{task.label}</p>
                <p className="mt-0.5 truncate text-[9px] text-[var(--color-ink)]/40">
                  {task.subtitle || '尚未填写完成说明'} · {cycleLabel}最多 {task.dailyLimit} 次 · 每次奖励 {task.reward} 次机会
                </p>
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={task.enabled !== false}
                onClick={() => setTask(task.id, { enabled: task.enabled === false })}
                className={`h-7 w-11 shrink-0 rounded-md text-[9px] ${task.enabled === false ? 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/38' : 'bg-emerald-50 text-emerald-700'}`}
              >
                {task.enabled === false ? '停用' : '启用'}
              </button>
              <button
                type="button"
                aria-expanded={editing}
                onClick={() => setEditingTaskId(editing ? null : task.id)}
                className="flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[9px] font-medium text-[var(--color-ink)]/48 hover:bg-white"
              >
                {editing ? '收起' : '编辑'}
                <ChevronDown className={`size-3 transition-transform ${editing ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {editing ? (
              <div className="border-t border-[var(--divider-soft)] bg-white p-3">
            <input
              className={`${INPUT} font-medium`}
              value={task.label}
              aria-label={`${task.label}任务名称`}
              onChange={(event) => setTask(task.id, { label: event.target.value })}
            />
            <input
              className={`${INPUT} mt-2`}
              value={task.subtitle ?? ''}
              placeholder="任务副标题 / 完成口径说明"
              onChange={(event) => setTask(task.id, { subtitle: event.target.value })}
            />
            <div className="mt-2 grid gap-2 @[520px]:grid-cols-2 @[760px]:grid-cols-4">
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">完成依据</span>
                <select
                  className={INPUT}
                  value={task.eventSource ?? ''}
                  onChange={(event) => setTask(task.id, { eventSource: event.target.value })}
                >
                  <option value="内容投稿">投稿审核结果</option>
                  <option value="赠送服务">好友赠卡领取结果</option>
                  <option value="活动埋点">有效访问完成</option>
                  <option value="交易核销结果">交易 / 核销完成</option>
                  <option value="人工确认">人工确认</option>
                </select>
              </label>
              <label className="@[760px]:col-span-2">
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">具体完成动作</span>
                <select
                  className={INPUT}
                  value={task.eventKey ?? ''}
                  onChange={(event) => setTask(task.id, { eventKey: event.target.value })}
                >
                  {!['video.publish.approved', 'collectible.gift.received', 'activity.page.valid_view', 'poi.light.success', 'invite.accepted'].includes(task.eventKey ?? '') ? (
                    <option value={task.eventKey ?? ''}>{task.eventKey ? '自定义完成动作（已绑定）' : '请选择完成动作'}</option>
                  ) : null}
                  <option value="video.publish.approved">投稿审核通过</option>
                  <option value="collectible.gift.received">好友领取赠卡</option>
                  <option value="activity.page.valid_view">活动页有效浏览</option>
                  <option value="poi.light.success">商家点亮成功</option>
                  <option value="invite.accepted">邀请好友成功</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">适用人群</span>
                <select
                  className={INPUT}
                  value={task.audience ?? 'all'}
                  onChange={(event) =>
                    setTask(task.id, {
                      audience: event.target.value as XiahuaTaskDef['audience'],
                    })
                  }
                >
                  <option value="all">全部用户</option>
                  <option value="new_creator">新作者</option>
                  <option value="returning_creator">回流作者</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">重置周期</span>
                <select
                  className={INPUT}
                  value={task.resetCycle ?? 'daily'}
                  onChange={(event) =>
                    setTask(task.id, {
                      resetCycle: event.target.value as XiahuaTaskDef['resetCycle'],
                    })
                  }
                >
                  <option value="daily">每日</option>
                  <option value="activity">活动期</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">
                  {task.resetCycle === 'activity' ? '活动期完成上限' : '每日完成上限'}
                </span>
                <input
                  type="number"
                  min={1}
                  className={INPUT}
                  value={task.dailyLimit}
                  onChange={(event) =>
                    setTask(task.id, {
                      dailyLimit: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">每次奖励（抽卡机会）</span>
                <input
                  type="number"
                  min={1}
                  className={INPUT}
                  value={task.reward}
                  onChange={(event) =>
                    setTask(task.id, {
                      reward: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">任务图标</span>
                <AssetKeySelect
                  value={task.assetKey}
                  preset={preset}
                  label={`${task.label}素材`}
                  usage="task"
                  onChange={(assetKey) => setTask(task.id, { assetKey: assetKey || undefined })}
                />
              </label>
            </div>
            <div className="mt-2 grid gap-2 @[520px]:grid-cols-2 @[760px]:grid-cols-4">
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">任务类型</span>
                <select
                  className={INPUT}
                  value={task.taskType ?? 'custom'}
                  onChange={(event) =>
                    setTask(task.id, {
                      taskType: event.target.value as XiahuaTaskDef['taskType'],
                    })
                  }
                >
                  <option value="post">投稿</option>
                  <option value="gift">赠送</option>
                  <option value="visit">浏览</option>
                  <option value="share">分享</option>
                  <option value="custom">自定义</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">计数维度</span>
                <select
                  className={INPUT}
                  value={task.countDimension ?? 'UID'}
                  onChange={(event) =>
                    setTask(task.id, {
                      countDimension: event.target.value as XiahuaTaskDef['countDimension'],
                    })
                  }
                >
                  <option value="UID">按账号</option>
                  <option value="DID">按设备</option>
                  <option value="ACTID">按活动内参与记录</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">领取方式</span>
                <select
                  className={INPUT}
                  value={task.claimMode ?? 'auto'}
                  onChange={(event) =>
                    setTask(task.id, {
                      claimMode: event.target.value as XiahuaTaskDef['claimMode'],
                    })
                  }
                >
                  <option value="auto">自动到账</option>
                  <option value="manual">用户领取</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">重复完成间隔（秒）</span>
                <input
                  type="number"
                  min={0}
                  className={INPUT}
                  value={task.cooldownSeconds ?? 0}
                  onChange={(event) =>
                    setTask(task.id, {
                      cooldownSeconds: Math.max(0, Number(event.target.value) || 0),
                    })
                  }
                />
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">开始时间</span>
                <input
                  type="datetime-local"
                  className={INPUT}
                  value={(task.validFrom ?? '').replace(' ', 'T')}
                  onChange={(event) => setTask(task.id, { validFrom: event.target.value })}
                />
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">结束时间</span>
                <input
                  type="datetime-local"
                  className={INPUT}
                  value={(task.validTo ?? '').replace(' ', 'T')}
                  onChange={(event) => setTask(task.id, { validTo: event.target.value })}
                />
              </label>
              <label className="@[760px]:col-span-2">
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">完成后去向</span>
                <select
                  className={INPUT}
                  value={task.jumpSchema ?? ''}
                  onChange={(event) => setTask(task.id, { jumpSchema: event.target.value })}
                >
                  {!['snssdk1128://challenge/detail?cid=night_food', 'snssdk1128://activity/night-food/cards', 'https://www.douyin.com/activities/night-food'].includes(task.jumpSchema ?? '') ? (
                    <option value={task.jumpSchema ?? ''}>{task.jumpSchema ? '自定义页面（已绑定）' : '完成后停留当前页'}</option>
                  ) : null}
                  <option value="snssdk1128://challenge/detail?cid=night_food">去活动投稿页</option>
                  <option value="snssdk1128://activity/night-food/cards">去我的夜食卡册</option>
                  <option value="https://www.douyin.com/activities/night-food">回到活动主会场</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">完成态文案</span>
                <input
                  className={INPUT}
                  value={task.completedCopy ?? ''}
                  onChange={(event) => setTask(task.id, { completedCopy: event.target.value })}
                />
              </label>
              <label>
                <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">过期态文案</span>
                <input
                  className={INPUT}
                  value={task.expiredCopy ?? ''}
                  onChange={(event) => setTask(task.id, { expiredCopy: event.target.value })}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-sky-50 px-2.5 py-2 text-[10px] text-sky-800">
              <span>
                {task.resetCycle === 'daily' ? `${effectiveDays} 天内每日最多完成 ${task.dailyLimit} 次` : `活动期最多完成 ${task.dailyLimit} 次`}
                {' · '}每次到账 {task.reward} 次机会
              </span>
              <span className="font-medium">每位{audienceLabel}最多可得 {maximumReward} 次抽卡机会</span>
            </div>
              </div>
            ) : null}
          </div>
          )
        })}
      </div>
    </DataPanel>
  )
}

const PLATFORM_OPTIONS: Array<{ value: XiahuaActivityPlatform; label: string }> = [
  { value: 'douyin', label: '抖音' },
  { value: 'douyin_lite', label: '抖音极速版' },
  { value: 'external_h5', label: '站外 H5' },
]

const ENTRY_OPTIONS: Array<{ value: XiahuaEntryChannel; label: string }> = [
  { value: 'activity_home', label: '活动主会场' },
  { value: 'task_center', label: '任务中心' },
  { value: 'search', label: '搜索结果' },
  { value: 'poi', label: '商家 / POI 页' },
]

function PolicyChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ value: T; label: string }>
  value: T[]
  onChange: (next: T[]) => void
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] text-[var(--color-ink)]/42">{label}</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = value.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                onChange(
                  selected
                    ? value.filter((item) => item !== option.value)
                    : [...value, option.value],
                )
              }
              className={`h-7 rounded-lg px-2.5 text-[10px] transition-colors ${
                selected
                  ? 'bg-[var(--color-ink)] text-[var(--color-surface-0)]'
                  : 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/55 hover:text-[var(--color-ink)]'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PolicySwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--fill-subtle)] px-3 py-2.5">
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-[var(--color-ink)]/72">{label}</span>
        <span className="mt-0.5 block text-[9px] leading-4 text-[var(--color-ink)]/38">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#357ef8]' : 'bg-[var(--color-ink)]/18'
        }`}
      >
        <span
          className={`absolute top-[1.5px] size-[15px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.24)] transition-[left] ${
            checked ? 'left-[13px]' : 'left-[1.5px]'
          }`}
        />
      </button>
    </div>
  )
}

export function ParticipationPolicyPanel({
  value,
  onChange,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
}) {
  const policy = value.participation ?? DEFAULT_XIAHUA_PARTICIPATION_POLICY
  const update = (patch: Partial<XiahuaParticipationPolicy>) =>
    onChange({ ...value, participation: { ...policy, ...patch } })

  return (
    <DataPanel
      title="活动生效与参与范围"
      summary={`${policy.startAt.slice(5, 10).replace('-', '/')}–${policy.endAt.slice(5, 10).replace('-', '/')} · ${policy.platforms.length} 个开放平台 · ${policy.regionScope === 'nationwide' ? '全国' : policy.regions || '指定地区'} · ${policy.audienceDescription}`}
      description="定义活动何时开放、谁能参加、从哪里进入，以及风险用户如何处理。"
      defaultOpen
    >
      <div className="grid gap-3 @[560px]:grid-cols-2 @[760px]:grid-cols-4">
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">开始时间</span>
          <input
            type="datetime-local"
            className={INPUT}
            value={policy.startAt}
            onChange={(event) => update({ startAt: event.target.value })}
          />
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">结束时间</span>
          <input
            type="datetime-local"
            className={INPUT}
            value={policy.endAt}
            onChange={(event) => update({ endAt: event.target.value })}
          />
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">活动时区</span>
          <select
            className={INPUT}
            value={policy.timezone}
            onChange={(event) =>
              update({ timezone: event.target.value as XiahuaParticipationPolicy['timezone'] })
            }
          >
            <option value="Asia/Shanghai">北京时间</option>
            <option value="Asia/Tokyo">日本时间</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">每日次数重置</span>
          <input
            type="number"
            min={0}
            max={23}
            className={INPUT}
            value={policy.dailyResetHour}
            onChange={(event) =>
              update({ dailyResetHour: Math.max(0, Math.min(23, Number(event.target.value) || 0)) })
            }
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 border-t border-[var(--divider-soft)] pt-4 @[640px]:grid-cols-2">
        <PolicyChoiceGroup
          label="开放平台"
          options={PLATFORM_OPTIONS}
          value={policy.platforms}
          onChange={(platforms) => update({ platforms })}
        />
        <PolicyChoiceGroup
          label="活动入口"
          options={ENTRY_OPTIONS}
          value={policy.entryChannels}
          onChange={(entryChannels) => update({ entryChannels })}
        />
      </div>

      <div className="mt-4 grid gap-3 border-t border-[var(--divider-soft)] pt-4 @[560px]:grid-cols-2">
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">目标人群</span>
          <select
            className={INPUT}
            value={policy.audience}
            onChange={(event) =>
              update({ audience: event.target.value as XiahuaParticipationPolicy['audience'] })
            }
          >
            <option value="all">全部符合资格的用户</option>
            <option value="activity_creators">完成活动投稿的作者</option>
            <option value="new_users">活动期新用户</option>
            <option value="custom">指定人群</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">人群说明</span>
          <input
            className={INPUT}
            value={policy.audienceDescription}
            onChange={(event) => update({ audienceDescription: event.target.value })}
          />
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">地域范围</span>
          <select
            className={INPUT}
            value={policy.regionScope}
            onChange={(event) =>
              update({ regionScope: event.target.value as XiahuaParticipationPolicy['regionScope'] })
            }
          >
            <option value="nationwide">全国</option>
            <option value="selected">指定地区</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">指定地区</span>
          <input
            className={INPUT}
            disabled={policy.regionScope !== 'selected'}
            placeholder={policy.regionScope === 'selected' ? '如：北京、上海、杭州' : '全国生效，无需填写'}
            value={policy.regions}
            onChange={(event) => update({ regions: event.target.value })}
          />
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">同一参与人认定</span>
          <select
            className={INPUT}
            value={policy.participantIdentity}
            onChange={(event) =>
              update({ participantIdentity: event.target.value as XiahuaParticipationPolicy['participantIdentity'] })
            }
          >
            <option value="account">按账号计算</option>
            <option value="account_device">账号与设备同时校验</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">最低参与年龄</span>
          <input
            type="number"
            min={0}
            max={99}
            className={INPUT}
            value={policy.minAge}
            onChange={(event) =>
              update({ minAge: Math.max(0, Math.min(99, Number(event.target.value) || 0)) })
            }
          />
        </label>
        <label className="@[560px]:col-span-2">
          <span className="mb-1 block text-[9px] text-[var(--color-ink)]/38">命中风险后的处理</span>
          <select
            className={INPUT}
            value={policy.riskAction}
            onChange={(event) =>
              update({ riskAction: event.target.value as XiahuaParticipationPolicy['riskAction'] })
            }
          >
            <option value="verify">触发二次验证，通过后继续</option>
            <option value="block">禁止继续参与</option>
            <option value="participate_without_reward">可继续体验，但不发放奖励</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-2 @[620px]:grid-cols-3">
        <PolicySwitch
          label="要求登录"
          description="未登录用户先完成登录再参与。"
          checked={policy.loginRequired}
          onChange={(loginRequired) => update({ loginRequired })}
        />
        <PolicySwitch
          label="要求实名认证"
          description="适用于高价值奖品或线下领奖。"
          checked={policy.realNameRequired}
          onChange={(realNameRequired) => update({ realNameRequired })}
        />
        <PolicySwitch
          label="账号状态正常"
          description="封禁、注销和受限账号不能领奖。"
          checked={policy.accountStatusRequired}
          onChange={(accountStatusRequired) => update({ accountStatusRequired })}
        />
      </div>
    </DataPanel>
  )
}

export function VoteCandidatePanel({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const candidates = modules.voting.candidates ?? []
  const setCandidates = (next: XiahuaVoteCandidateDef[]) =>
    onChange({
      ...value,
      modules: {
        ...modules,
        voting: {
          ...modules.voting,
          candidates: next,
          candidateCount: next.filter((item) => item.enabled).length,
        },
      },
    })
  const importCandidates = (rows: ImportedGameplayRow[]) => {
    const imported = rows
      .map((row): XiahuaVoteCandidateDef | null => {
        const id = importString(row, 'id')
        const name = importString(row, 'name')
        return id && name
          ? {
              id,
              name,
              description: importString(row, 'description'),
              assetKey: importString(row, 'assetKey') || undefined,
              enabled: importBoolean(row, 'enabled', true),
            }
          : null
      })
      .filter((item): item is XiahuaVoteCandidateDef => item !== null)
    if (imported.length) setCandidates(mergeById(candidates, imported))
    return imported.length
  }
  return (
    <DataPanel
      title="候选内容"
      summary={`${candidates.filter((candidate) => candidate.enabled).length} 个候选项启用 · 可批量导入并绑定展示素材`}
      description="候选对象独立于投票规则，可批量导入并绑定封面、视频或卡片素材。"
      actions={
        <>
          <ImportButton label="导入候选项" template="id,name,description,assetKey,enabled" onRows={importCandidates} />
          <QuietButton onClick={onOpenAssetLibrary}>
            <ImageIcon className="size-3" /> 素材库
          </QuietButton>
        </>
      }
    >
      {candidates.length ? (
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="grid gap-2 rounded-lg bg-[var(--color-surface-1)] p-2.5 @[620px]:grid-cols-[36px_1fr_1.4fr_130px_48px]"
            >
              <AssetThumb src={assetSource(preset, candidate.assetKey)} label={candidate.name} />
              <input
                className={INPUT}
                value={candidate.name}
                onChange={(event) =>
                  setCandidates(
                    candidates.map((item) => (item.id === candidate.id ? { ...item, name: event.target.value } : item)),
                  )
                }
              />
              <input
                className={INPUT}
                value={candidate.description}
                onChange={(event) =>
                  setCandidates(
                    candidates.map((item) =>
                      item.id === candidate.id ? { ...item, description: event.target.value } : item,
                    ),
                  )
                }
              />
              <AssetKeySelect
                value={candidate.assetKey}
                preset={preset}
                label={`${candidate.name}素材`}
                onChange={(assetKey) =>
                  setCandidates(
                    candidates.map((item) =>
                      item.id === candidate.id ? { ...item, assetKey: assetKey || undefined } : item,
                    ),
                  )
                }
              />
              <button
                type="button"
                onClick={() =>
                  setCandidates(
                    candidates.map((item) => (item.id === candidate.id ? { ...item, enabled: !item.enabled } : item)),
                  )
                }
                className={`rounded-md text-[9px] ${candidate.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--fill-subtle)] text-[var(--color-ink)]/38'}`}
              >
                {candidate.enabled ? '启用' : '停用'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-[11px] text-[var(--color-ink)]/38">
          尚无候选项。请导入 CSV / JSON，或先到素材库准备候选内容。
        </p>
      )}
    </DataPanel>
  )
}

export function QuizQuestionPanel({
  value,
  onChange,
  preset,
  onOpenAssetLibrary,
}: {
  value: XiahuaGameplay
  onChange: (next: XiahuaGameplay) => void
  preset: ActivityPreset
  onOpenAssetLibrary: () => void
}) {
  const modules = value.modules ?? DEFAULT_XIAHUA_GAMEPLAY_MODULES
  const questions = modules.quiz.questions ?? []
  const setQuestions = (next: XiahuaQuizQuestionDef[]) =>
    onChange({
      ...value,
      modules: {
        ...modules,
        quiz: {
          ...modules.quiz,
          questions: next,
          questionCount: Math.min(modules.quiz.questionCount, Math.max(1, next.filter((item) => item.enabled).length)),
        },
      },
    })
  const importQuestions = (rows: ImportedGameplayRow[]) => {
    const imported = rows
      .map((row): XiahuaQuizQuestionDef | null => {
        const id = importString(row, 'id')
        const question = importString(row, 'question')
        const options = importStringArray(row, 'options')
        if (!id || !question || options.length < 2) return null
        const difficulty = importString(row, 'difficulty', 'medium')
        return {
          id,
          question,
          options,
          answer: Math.max(0, Math.min(options.length - 1, importNumber(row, 'answer', 0))),
          difficulty: difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium',
          assetKey: importString(row, 'assetKey') || undefined,
          enabled: importBoolean(row, 'enabled', true),
        }
      })
      .filter((item): item is XiahuaQuizQuestionDef => item !== null)
    if (imported.length) setQuestions(mergeById(questions, imported))
    return imported.length
  }
  return (
    <DataPanel
      title="题库内容"
      summary={`${questions.filter((question) => question.enabled).length} 道题启用 · 含 ${questions.filter((question) => question.difficulty === 'hard').length} 道困难题 · 支持批量导入`}
      description="题目、选项、答案和素材是内容对象；一局抽多少题由答题规则单独控制。"
      actions={
        <>
          <ImportButton
            label="导入题库"
            template="id,question,options(|分隔),answer,difficulty,assetKey,enabled"
            onRows={importQuestions}
          />
          <QuietButton onClick={onOpenAssetLibrary}>
            <ImageIcon className="size-3" /> 素材库
          </QuietButton>
        </>
      }
    >
      {questions.length ? (
        <div className="space-y-2">
          {questions.map((item, index) => (
            <div key={item.id} className="rounded-lg bg-[var(--color-surface-1)] p-3">
              <div className="flex gap-2">
                <AssetThumb src={assetSource(preset, item.assetKey)} label={item.question} />
                <span className="pt-2 font-mono text-[9px] text-[var(--color-ink)]/32">Q{index + 1}</span>
                <input
                  className={`${INPUT} flex-1`}
                  value={item.question}
                  onChange={(event) =>
                    setQuestions(
                      questions.map((question) =>
                        question.id === item.id ? { ...question, question: event.target.value } : question,
                      ),
                    )
                  }
                />
              </div>
              <div className="ml-[52px] mt-2 grid gap-2 @[560px]:grid-cols-[1fr_150px]">
                <p className="pt-2 text-[9px] text-[var(--color-ink)]/42">
                  答案 {item.answer + 1} · {item.options.join(' / ')} · {item.difficulty}
                </p>
                <AssetKeySelect
                  value={item.assetKey}
                  preset={preset}
                  label={`${item.question}素材`}
                  onChange={(assetKey) =>
                    setQuestions(
                      questions.map((question) =>
                        question.id === item.id ? { ...question, assetKey: assetKey || undefined } : question,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-[11px] text-[var(--color-ink)]/38">
          尚无题目。导入 CSV / JSON 后会生成可编辑题库。
        </p>
      )}
    </DataPanel>
  )
}
