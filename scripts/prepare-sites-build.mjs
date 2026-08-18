import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const serverDirectory = resolve(root, 'dist/server')

await mkdir(serverDirectory, { recursive: true })
await copyFile(resolve(root, 'sites/worker.mjs'), resolve(serverDirectory, 'index.js'))
