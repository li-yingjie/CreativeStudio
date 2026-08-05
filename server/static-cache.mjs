import path from 'node:path'

const NO_CACHE = 'no-cache'
const SHORT_CACHE = 'public, max-age=3600'
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'

// Vite's default output is dist/assets/<name>-<8 character hash>.<ext>.
// Keep this deliberately strict: a false negative only shortens caching, while
// a false positive can leave a replaced public asset stale for a year.
const VITE_HASHED_ASSET_NAME = /^.+-[A-Za-z0-9_]{8}\.[^.]+$/

export function staticCacheControl(filePath, distRoot) {
  const name = path.basename(filePath)
  if (path.extname(name).toLowerCase() === '.html' || name === 'sw.js') return NO_CACHE

  const relative = path.relative(path.resolve(distRoot), path.resolve(filePath))
  const parts = relative.split(path.sep)
  const isTopLevelViteAsset =
    parts.length === 2 &&
    parts[0] === 'assets' &&
    !relative.startsWith(`..${path.sep}`) &&
    VITE_HASHED_ASSET_NAME.test(parts[1])

  return isTopLevelViteAsset ? IMMUTABLE_CACHE : SHORT_CACHE
}
