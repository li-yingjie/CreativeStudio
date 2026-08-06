import {
  DEFAULT_SUMMER_SURF_EDIT_CONFIG,
  type SummerSurfEditConfig,
  type SummerSurfHeroMedia,
} from './SummerSurfH5Preview'

type UnknownRecord = Record<string, unknown>

function recordAt(value: unknown, path: string): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} 必须是对象`)
  }
  return value as UnknownRecord
}

function stringAt(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string') throw new Error(`${path} 必须是字符串`)
}

function numberAt(value: unknown, path: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${path} 必须是有效数字`)
  }
}

function booleanAt(value: unknown, path: string): asserts value is boolean {
  if (typeof value !== 'boolean') throw new Error(`${path} 必须是布尔值`)
}

function enumAt<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
): asserts value is T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new Error(`${path} 必须是 ${allowed.join(' / ')} 之一`)
  }
}

function optionalStringAt(value: unknown, path: string): void {
  if (value !== undefined) stringAt(value, path)
}

function sourceAt(value: unknown, path: string): void {
  stringAt(value, path)
  if (value.startsWith('blob:')) {
    throw new Error(`${path} 是已失效的本地临时地址，请重新上传素材`)
  }
}

function mediaAt(value: unknown, path: string): asserts value is SummerSurfHeroMedia {
  const media = recordAt(value, path)
  enumAt(media.type, ['image', 'video'] as const, `${path}.type`)
  sourceAt(media.src, `${path}.src`)
  optionalStringAt(media.assetId, `${path}.assetId`)
  optionalStringAt(media.posterAssetId, `${path}.posterAssetId`)
  if (media.poster !== undefined) sourceAt(media.poster, `${path}.poster`)
  if (media.fit !== undefined) enumAt(media.fit, ['cover', 'contain'] as const, `${path}.fit`)
  optionalStringAt(media.position, `${path}.position`)
  if (media.sourceWidth !== undefined) numberAt(media.sourceWidth, `${path}.sourceWidth`)
  if (media.sourceHeight !== undefined) numberAt(media.sourceHeight, `${path}.sourceHeight`)
}

function stringArrayAt(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value)) throw new Error(`${path} 必须是数组`)
  value.forEach((item, index) => stringAt(item, `${path}[${index}]`))
}

function assertSummerSurfConfig(value: unknown): asserts value is SummerSurfEditConfig {
  const config = recordAt(value, '配置')
  enumAt(config.activeTheme, ['summer', 'night'] as const, 'activeTheme')

  const requiredStrings = [
    'campaignName', 'navLabel', 'accessibleTitle', 'drawLabel',
    'collectionEntryLabel', 'collectionTitle', 'collectionProgressVerb',
    'cardNoun', 'missingCardLabel', 'energyTitle', 'energyEyebrow',
    'energyDescription', 'energyCta', 'energyBadge', 'energyImage',
    'energyVisual', 'energyAnnouncement', 'tasksTitle', 'drawTabLabel',
    'energyTabLabel', 'topicsEyebrow', 'topicsTitle', 'discoveryEyebrow',
    'discoveryTitle',
  ] as const
  requiredStrings.forEach((key) => stringAt(config[key], key))

  mediaAt(config.heroMedia, 'heroMedia')
  const composition = recordAt(config.heroComposition, 'heroComposition')
  booleanAt(composition.enabled, 'heroComposition.enabled')
  stringArrayAt(composition.initialUnlockedCardIds, 'heroComposition.initialUnlockedCardIds')
  if (composition.finalReference !== undefined) {
    mediaAt(composition.finalReference, 'heroComposition.finalReference')
  }
  if (!Array.isArray(composition.layers)) throw new Error('heroComposition.layers 必须是数组')
  composition.layers.forEach((entry, index) => {
    const path = `heroComposition.layers[${index}]`
    const layer = recordAt(entry, path)
    ;['id', 'cardId', 'label'].forEach((key) => stringAt(layer[key], `${path}.${key}`))
    if (layer.unlockMethod !== undefined) enumAt(layer.unlockMethod, ['first-gift', 'draw', 'points'] as const, `${path}.unlockMethod`)
    if (layer.presentation !== undefined) enumAt(layer.presentation, ['image-layer', 'video-transition', 'none'] as const, `${path}.presentation`)
    if (layer.media !== undefined) mediaAt(layer.media, `${path}.media`)
    if (layer.transitionMedia !== undefined) mediaAt(layer.transitionMedia, `${path}.transitionMedia`)
    if (layer.pointsCost !== undefined) numberAt(layer.pointsCost, `${path}.pointsCost`)
    if (layer.embeddedInBase !== undefined) booleanAt(layer.embeddedInBase, `${path}.embeddedInBase`)
    ;['x', 'y', 'width', 'rotation', 'zIndex'].forEach((key) => numberAt(layer[key], `${path}.${key}`))
  })

  const assets = recordAt(config.assets, 'assets')
  Object.entries(assets).forEach(([key, item]) => optionalStringAt(item, `assets.${key}`))
  const colors = recordAt(config.colors, 'colors')
  Object.keys(DEFAULT_SUMMER_SURF_EDIT_CONFIG.colors).forEach((key) => {
    stringAt(colors[key], `colors.${key}`)
  })

  if (!Array.isArray(config.pages) || config.pages.length === 0) throw new Error('pages 必须是非空数组')
  config.pages.forEach((entry, index) => {
    const path = `pages[${index}]`
    const page = recordAt(entry, path)
    ;['id', 'order', 'name', 'route'].forEach((key) => stringAt(page[key], `${path}.${key}`))
    enumAt(page.kind, ['screen', 'overlay'] as const, `${path}.kind`)
    enumAt(page.status, ['ready', 'draft'] as const, `${path}.status`)
  })

  if (!Array.isArray(config.flowEdges)) throw new Error('flowEdges 必须是数组')
  config.flowEdges.forEach((entry, index) => {
    const path = `flowEdges[${index}]`
    const edge = recordAt(entry, path)
    ;['id', 'fromPageId', 'eventKey', 'targetPageId'].forEach((key) => stringAt(edge[key], `${path}.${key}`))
    enumAt(edge.navigation, ['push', 'replace', 'overlay', 'back'] as const, `${path}.navigation`)
    enumAt(edge.transition, ['fade', 'slide', 'none'] as const, `${path}.transition`)
  })

  if (!Array.isArray(config.cards) || config.cards.length === 0) throw new Error('cards 必须是非空数组')
  config.cards.forEach((entry, index) => {
    const path = `cards[${index}]`
    const card = recordAt(entry, path)
    ;['id', 'name', 'emoji', 'accent'].forEach((key) => stringAt(card[key], `${path}.${key}`))
    enumAt(card.rarity, ['普通', '稀有'] as const, `${path}.rarity`)
    if (card.image !== undefined) sourceAt(card.image, `${path}.image`)
    optionalStringAt(card.imageAssetId, `${path}.imageAssetId`)
    ;['imageWidth', 'imageHeight', 'weight'].forEach((key) => {
      if (card[key] !== undefined) numberAt(card[key], `${path}.${key}`)
    })
  })

  if (!Array.isArray(config.tiers) || config.tiers.length === 0) throw new Error('tiers 必须是非空数组')
  config.tiers.forEach((entry, index) => {
    const path = `tiers[${index}]`
    const tier = recordAt(entry, path)
    ;['id', 'amount', 'title', 'condition', 'icon', 'reward'].forEach((key) => stringAt(tier[key], `${path}.${key}`))
    numberAt(tier.threshold, `${path}.threshold`)
    enumAt(tier.kind, ['coupon', 'grand'] as const, `${path}.kind`)
    if (tier.image !== undefined) sourceAt(tier.image, `${path}.image`)
    optionalStringAt(tier.imageAssetId, `${path}.imageAssetId`)
    if (tier.imageWidth !== undefined) numberAt(tier.imageWidth, `${path}.imageWidth`)
    if (tier.imageHeight !== undefined) numberAt(tier.imageHeight, `${path}.imageHeight`)
  })

  if (!Array.isArray(config.tasks)) throw new Error('tasks 必须是数组')
  config.tasks.forEach((entry, index) => {
    const path = `tasks[${index}]`
    const task = recordAt(entry, path)
    ;['id', 'icon', 'title', 'description', 'action'].forEach((key) => stringAt(task[key], `${path}.${key}`))
    numberAt(task.target, `${path}.target`)
    numberAt(task.reward, `${path}.reward`)
    if (task.repeatable !== undefined) booleanAt(task.repeatable, `${path}.repeatable`)
  })

  if (!Array.isArray(config.inspirationCards)) throw new Error('inspirationCards 必须是数组')
  config.inspirationCards.forEach((entry, index) => {
    const path = `inspirationCards[${index}]`
    const card = recordAt(entry, path)
    ;['image', 'emoji', 'eyebrow', 'title', 'action'].forEach((key) => stringAt(card[key], `${path}.${key}`))
    sourceAt(card.image, `${path}.image`)
    optionalStringAt(card.taskId, `${path}.taskId`)
  })

  if (!Array.isArray(config.venues)) throw new Error('venues 必须是数组')
  config.venues.forEach((entry, index) => {
    const path = `venues[${index}]`
    const venue = recordAt(entry, path)
    ;['image', 'location', 'title'].forEach((key) => stringAt(venue[key], `${path}.${key}`))
    sourceAt(venue.image, `${path}.image`)
  })

  if (!Array.isArray(config.activityBanners)) throw new Error('activityBanners 必须是数组')
  config.activityBanners.forEach((entry, index) => {
    const path = `activityBanners[${index}]`
    const banner = recordAt(entry, path)
    stringAt(banner.eyebrow, `${path}.eyebrow`)
    stringAt(banner.title, `${path}.title`)
  })

  stringArrayAt(config.topicChips, 'topicChips')

  const pageIds = new Set(config.pages.map((page) => page.id))
  if (pageIds.size !== config.pages.length) throw new Error('pages 中存在重复 id')
  config.flowEdges.forEach((edge) => {
    if (!pageIds.has(edge.fromPageId) || !pageIds.has(edge.targetPageId)) {
      throw new Error(`跳转 ${edge.id} 引用了不存在的页面`)
    }
  })
  const cardIds = new Set(config.cards.map((card) => card.id))
  if (cardIds.size !== config.cards.length) throw new Error('cards 中存在重复 id')
  const validatedComposition = config.heroComposition as SummerSurfEditConfig['heroComposition']
  validatedComposition.layers.forEach((layer) => {
    if (!cardIds.has(layer.cardId)) throw new Error(`Hero 图层 ${layer.id} 引用了不存在的卡片`)
  })
}

/** 兼容旧 content/pack 包装，但必须完整通过运行时结构与引用校验后才返回。 */
export function parseSummerSurfConfigImport(value: unknown): SummerSurfEditConfig {
  const root = recordAt(value, '导入文件')
  const content = root.content === undefined ? {} : recordAt(root.content, 'content')
  const pack = root.pack === undefined ? {} : recordAt(root.pack, 'pack')
  const source = { ...root, ...content }
  const sourceColors = source.colors === undefined ? {} : recordAt(source.colors, 'colors')
  const packColors = pack.colors === undefined ? {} : recordAt(pack.colors, 'pack.colors')
  const sourceAssets = source.assets === undefined ? {} : recordAt(source.assets, 'assets')
  const packAssets = pack.assets === undefined ? {} : recordAt(pack.assets, 'pack.assets')
  const sourceHeroMedia = source.heroMedia === undefined ? {} : recordAt(source.heroMedia, 'heroMedia')
  const sourceComposition = source.heroComposition === undefined
    ? {}
    : recordAt(source.heroComposition, 'heroComposition')
  const configKeys = new Set(Object.keys(DEFAULT_SUMMER_SURF_EDIT_CONFIG))
  const hasConfigField = Object.keys(source).some((key) => configKeys.has(key))
  const hasPackField = Object.keys(packColors).length > 0 || Object.keys(packAssets).length > 0
  if (!hasConfigField && !hasPackField) {
    throw new Error('未找到活动配置字段，请选择从活动编辑器导出的 JSON')
  }

  const candidate = {
    ...DEFAULT_SUMMER_SURF_EDIT_CONFIG,
    ...source,
    heroMedia: { ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroMedia, ...sourceHeroMedia },
    heroComposition: {
      ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroComposition,
      ...sourceComposition,
      layers: sourceComposition.layers ?? DEFAULT_SUMMER_SURF_EDIT_CONFIG.heroComposition.layers,
    },
    colors: {
      ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.colors,
      ...sourceColors,
      ...packColors,
    },
    assets: {
      ...DEFAULT_SUMMER_SURF_EDIT_CONFIG.assets,
      ...sourceAssets,
      ...packAssets,
    },
  }
  assertSummerSurfConfig(candidate)
  return candidate
}
