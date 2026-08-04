const ASSET_DB_NAME = 'campaign-studio-assets-v1'
const ASSET_STORE_NAME = 'assets'

type CachedAssetRecord = {
  blob?: Blob
}

function readCachedAsset(assetId: string): Promise<CachedAssetRecord | undefined> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(undefined)
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (value: CachedAssetRecord | undefined) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    try {
      const request = window.indexedDB.open(ASSET_DB_NAME, 1)
      request.onerror = () => finish(undefined)
      request.onupgradeneeded = (event) => {
        // The original project owns this schema. Never create a store here;
        // opening it is only useful when the original app already populated it.
        const database = (event.target as IDBOpenDBRequest).result
        if (!database.objectStoreNames.contains(ASSET_STORE_NAME)) {
          database.close()
          finish(undefined)
        }
      }
      request.onsuccess = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(ASSET_STORE_NAME)) {
          database.close()
          finish(undefined)
          return
        }
        try {
          const transaction = database.transaction(ASSET_STORE_NAME, 'readonly')
          const read = transaction.objectStore(ASSET_STORE_NAME).get(assetId)
          read.onerror = () => {
            database.close()
            finish(undefined)
          }
          read.onsuccess = () => {
            const value = read.result as CachedAssetRecord | undefined
            database.close()
            finish(value)
          }
        } catch {
          database.close()
          finish(undefined)
        }
      }
    } catch {
      finish(undefined)
    }
  })
}

/** Resolve only the two known Marketing King Hero video IDs. */
export async function resolveMarketingKingAssetUrl(assetId?: string) {
  if (!assetId?.startsWith('builtin:summer:hero:')) return undefined
  const cached = await readCachedAsset(assetId)
  if (!cached?.blob) return undefined
  return URL.createObjectURL(cached.blob)
}
