import type {
  SummerSurfEditConfig,
  SummerSurfHeroMedia,
} from './SummerSurfH5Preview'

const DATABASE_NAME = 'creative-studio-local-assets'
const DATABASE_VERSION = 1
const STORE_NAME = 'summer-surf-assets'

type StoredAsset = {
  id: string
  blob: Blob
  name: string
  type: string
  updatedAt: number
}

const sessionUrls = new Map<string, string>()

function isObjectUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('blob:')
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('当前浏览器不支持本地素材持久化'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('无法打开本地素材库'))
    request.onblocked = () => reject(new Error('本地素材库正在被其他页面占用'))
  })
}

async function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode)
      const request = operation(transaction.objectStore(STORE_NAME))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('本地素材操作失败'))
      transaction.onabort = () => reject(transaction.error ?? new Error('本地素材操作已取消'))
    })
  } finally {
    database.close()
  }
}

function objectUrlFor(assetId: string, blob: Blob): string {
  const existing = sessionUrls.get(assetId)
  if (existing) return existing
  const url = URL.createObjectURL(blob)
  sessionUrls.set(assetId, url)
  return url
}

export function createSummerSurfSessionAssetUrl(assetId: string, blob: Blob): string {
  const previous = sessionUrls.get(assetId)
  if (previous) URL.revokeObjectURL(previous)
  sessionUrls.delete(assetId)
  return objectUrlFor(assetId, blob)
}

/** 每次上传生成新 ID，避免复制方案后替换素材误伤仍引用旧素材的方案。 */
export function createSummerSurfAssetId(draftId: string, slot: string): string {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return `local:${draftId}:${slot}:${suffix}`
}

export async function persistSummerSurfAsset(
  assetId: string,
  file: File,
): Promise<string> {
  const entry: StoredAsset = {
    id: assetId,
    blob: file,
    name: file.name,
    type: file.type,
    updatedAt: Date.now(),
  }
  await runTransaction('readwrite', (store) => store.put(entry))

  return objectUrlFor(assetId, file)
}

async function resolveSummerSurfAsset(assetId: string): Promise<string | null> {
  const existing = sessionUrls.get(assetId)
  if (existing) return existing
  const entry = await runTransaction<StoredAsset | undefined>('readonly', (store) => store.get(assetId))
  return entry?.blob ? objectUrlFor(assetId, entry.blob) : null
}

function stripObjectUrls(value: unknown): unknown {
  if (isObjectUrl(value)) return ''
  if (Array.isArray(value)) return value.map(stripObjectUrls)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, stripObjectUrls(child)]),
  )
}

/** localStorage 只保存 assetId，绝不把刷新即失效的 blob URL 当持久地址。 */
export function summerSurfConfigForStorage(config: SummerSurfEditConfig): SummerSurfEditConfig {
  return stripObjectUrls(config) as SummerSurfEditConfig
}

function countUntrackedObjectUrls(value: unknown): number {
  if (isObjectUrl(value)) return 1
  if (Array.isArray(value)) {
    return value.reduce((total, child) => total + countUntrackedObjectUrls(child), 0)
  }
  if (!value || typeof value !== 'object') return 0
  return Object.values(value).reduce(
    (total: number, child) => total + countUntrackedObjectUrls(child),
    0,
  )
}

export function countSummerSurfObjectUrls(config: SummerSurfEditConfig): number {
  return countUntrackedObjectUrls(config)
}

export function collectSummerSurfAssetIds(config: SummerSurfEditConfig): Set<string> {
  const ids = new Set<string>()
  const addMedia = (media: SummerSurfHeroMedia | undefined) => {
    if (media?.assetId?.startsWith('local:')) ids.add(media.assetId)
    if (media?.posterAssetId?.startsWith('local:')) ids.add(media.posterAssetId)
  }
  addMedia(config.heroMedia)
  addMedia(config.heroComposition.finalReference)
  config.heroComposition.layers.forEach((layer) => {
    addMedia(layer.media)
    addMedia(layer.transitionMedia)
  })
  config.cards.forEach((card) => {
    if (card.imageAssetId?.startsWith('local:')) ids.add(card.imageAssetId)
  })
  config.tiers.forEach((tier) => {
    if (tier.imageAssetId?.startsWith('local:')) ids.add(tier.imageAssetId)
  })
  return ids
}

/** 只清理由本页实际物化过、且已没有任何草稿引用的素材，避免误删其他标签页数据。 */
export async function pruneSummerSurfAssets(referencedIds: ReadonlySet<string>): Promise<void> {
  const staleIds: string[] = []
  sessionUrls.forEach((url, assetId) => {
    if (referencedIds.has(assetId)) return
    URL.revokeObjectURL(url)
    sessionUrls.delete(assetId)
    if (assetId.startsWith('local:')) staleIds.push(assetId)
  })
  await Promise.all(
    staleIds.map((assetId) => runTransaction('readwrite', (store) => store.delete(assetId))),
  )
}

async function hydrateMedia(
  media: SummerSurfHeroMedia | undefined,
  missing: Set<string>,
): Promise<SummerSurfHeroMedia | undefined> {
  if (!media) return undefined
  const next = { ...media }

  if (media.assetId && (media.assetId.startsWith('local:') || !media.src || isObjectUrl(media.src))) {
    const source = await resolveSummerSurfAsset(media.assetId)
    if (source) next.src = source
    else {
      missing.add(media.assetId)
      if (!media.src || isObjectUrl(media.src)) next.src = ''
    }
  } else if (isObjectUrl(media.src)) {
    next.src = ''
  }

  if (media.posterAssetId && (media.posterAssetId.startsWith('local:') || !media.poster || isObjectUrl(media.poster))) {
    const poster = await resolveSummerSurfAsset(media.posterAssetId)
    if (poster) next.poster = poster
    else {
      missing.add(media.posterAssetId)
      if (!media.poster || isObjectUrl(media.poster)) next.poster = undefined
    }
  } else if (isObjectUrl(media.poster)) {
    next.poster = undefined
  }

  return next
}

export async function hydrateSummerSurfConfigAssets(
  config: SummerSurfEditConfig,
): Promise<{ config: SummerSurfEditConfig; missingAssetIds: string[]; expiredUrlCount: number }> {
  const missing = new Set<string>()
  const expiredUrlCount = countUntrackedObjectUrls(config)
  const heroMedia = (await hydrateMedia(config.heroMedia, missing)) ?? config.heroMedia
  const finalReference = await hydrateMedia(config.heroComposition.finalReference, missing)
  const layers = await Promise.all(
    config.heroComposition.layers.map(async (layer) => ({
      ...layer,
      media: await hydrateMedia(layer.media, missing),
      transitionMedia: await hydrateMedia(layer.transitionMedia, missing),
    })),
  )
  const cards = await Promise.all(
    config.cards.map(async (card) => {
      if (!card.imageAssetId || (!card.imageAssetId.startsWith('local:') && card.image && !isObjectUrl(card.image))) {
        return isObjectUrl(card.image) ? { ...card, image: undefined } : card
      }
      const image = await resolveSummerSurfAsset(card.imageAssetId)
      if (!image) missing.add(card.imageAssetId)
      return { ...card, image: image ?? (isObjectUrl(card.image) ? undefined : card.image) }
    }),
  )
  const tiers = await Promise.all(
    config.tiers.map(async (tier) => {
      if (!tier.imageAssetId || (!tier.imageAssetId.startsWith('local:') && tier.image && !isObjectUrl(tier.image))) {
        return isObjectUrl(tier.image) ? { ...tier, image: undefined } : tier
      }
      const image = await resolveSummerSurfAsset(tier.imageAssetId)
      if (!image) missing.add(tier.imageAssetId)
      return { ...tier, image: image ?? (isObjectUrl(tier.image) ? undefined : tier.image) }
    }),
  )

  return {
    config: {
      ...config,
      heroMedia,
      heroComposition: { ...config.heroComposition, finalReference, layers },
      cards,
      tiers,
    },
    missingAssetIds: [...missing],
    expiredUrlCount,
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    sessionUrls.forEach((url) => URL.revokeObjectURL(url))
    sessionUrls.clear()
  })
}
