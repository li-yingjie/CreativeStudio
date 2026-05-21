// Compress + downscale oversized images in public/ via the TinyPNG API.
// Overwrites files in place (same name/format → no source changes). Skips the
// third-party garuda/ game dir. Requires TINYPNG_API_KEY in .env.
//
//   node scripts/compress-images.mjs [--min=BYTES] [--dry]
//
// Defaults: process .png/.jpg/.jpeg/.webp in public/bg + public/assets that are
// >= 120KB. Avatars are capped at 512px on the long side, everything else 1600px
// (TinyPNG "fit" only scales down, never up).

import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)
const tinify = require('tinify')

try {
  process.loadEnvFile()
} catch {
  /* rely on process env */
}

if (!process.env.TINYPNG_API_KEY) {
  console.error('TINYPNG_API_KEY is not set (put it in .env)')
  process.exit(1)
}
tinify.key = process.env.TINYPNG_API_KEY

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const minArg = args.find((a) => a.startsWith('--min='))
const MIN_BYTES = minArg ? Number(minArg.split('=')[1]) : 120 * 1024

const ROOTS = ['public/bg', 'public/assets']
const EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const capFor = (rel) => (rel.includes('/avatar/') ? 512 : 1600)
const kb = (b) => (b / 1024).toFixed(0) + 'K'

function collect(dir, out) {
  if (!fs.existsSync(dir)) return
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const s = fs.statSync(p)
    if (s.isDirectory()) {
      if (name === 'garuda') continue
      collect(p, out)
    } else if (EXT.has(path.extname(name).toLowerCase()) && s.size >= MIN_BYTES) {
      out.push({ p, size: s.size })
    }
  }
}

const files = []
ROOTS.forEach((r) => collect(r, files))
files.sort((a, b) => b.size - a.size)

console.log(`${files.length} images ≥ ${kb(MIN_BYTES)} to process${dry ? ' (dry run)' : ''}\n`)

let before = 0
let after = 0
let done = 0
let failed = 0

for (const f of files) {
  const rel = '/' + path.relative('public', f.p).split(path.sep).join('/')
  const cap = capFor(rel)
  before += f.size
  if (dry) {
    console.log(`  ${kb(f.size).padStart(6)}  cap${cap}  ${rel}`)
    continue
  }
  try {
    await tinify
      .fromFile(f.p)
      .resize({ method: 'fit', width: cap, height: cap })
      .toFile(f.p)
    const ns = fs.statSync(f.p).size
    after += ns
    done++
    console.log(`  ${kb(f.size).padStart(6)} → ${kb(ns).padStart(6)}  ${rel}`)
  } catch (err) {
    failed++
    console.warn(`  FAILED ${rel}: ${err.message}`)
  }
}

if (!dry) {
  console.log(
    `\nDone: ${done} ok, ${failed} failed. ${kb(before)} → ${kb(after)} ` +
      `(saved ${kb(before - after)}). Compressions used this run: ${tinify.compressionCount ?? '?'}`,
  )
}
