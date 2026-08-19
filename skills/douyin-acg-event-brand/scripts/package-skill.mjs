#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(scriptDir, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(skillRoot, 'assets/douyin-acg-experience-kit.v1.json'), 'utf8'));
const output = path.resolve(process.argv[2] ?? `/tmp/douyin-acg-event-brand-${manifest.version}.skill.tgz`);

const validation = spawnSync(process.execPath, [path.join(scriptDir, 'validate-brand-kit.mjs')], { stdio: 'inherit' });
if (validation.status !== 0) process.exit(validation.status ?? 1);

fs.mkdirSync(path.dirname(output), { recursive: true });
const packed = spawnSync('tar', [
  '-czf', output,
  '--exclude=.DS_Store',
  '--exclude=*.skill.tgz',
  '-C', path.dirname(skillRoot),
  path.basename(skillRoot),
], { stdio: 'inherit' });
if (packed.status !== 0) process.exit(packed.status ?? 1);

console.log(JSON.stringify({ ok: true, output, bytes: fs.statSync(output).size }, null, 2));
