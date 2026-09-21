import { copyFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const serverDirectory = resolve(root, 'dist/server')

await mkdir(serverDirectory, { recursive: true })
await copyFile(resolve(root, 'sites/worker.mjs'), resolve(serverDirectory, 'index.js'))

// The playable Garuda bundle remains in the source repository. Sites serves it
// from the pinned public snapshot so the temporary deployment stays lightweight.
await rm(resolve(root, 'dist/garuda'), { recursive: true, force: true })
