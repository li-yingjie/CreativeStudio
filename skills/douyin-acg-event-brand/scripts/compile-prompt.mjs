#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const [slotId, subject, aspectOverride] = process.argv.slice(2);
if (!slotId || !subject) {
  console.error('Usage: node compile-prompt.mjs <slot-id> "<subject>" [aspect-ratio]');
  process.exit(2);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const kitPath = path.join(scriptDir, '../assets/douyin-acg-experience-kit.v1.json');
const kit = JSON.parse(fs.readFileSync(kitPath, 'utf8'));
const slot = kit.assetSlots.find((item) => item.id === slotId);

if (!slot) {
  console.error(`Unknown slot ${slotId}. Available: ${kit.assetSlots.map((item) => item.id).join(', ')}`);
  process.exit(1);
}

const aspect = aspectOverride ?? slot.aspectRatios[0];
if (!slot.aspectRatios.includes(aspect)) {
  console.error(`Aspect ${aspect} is not allowed for ${slotId}. Allowed: ${slot.aspectRatios.join(', ')}`);
  process.exit(1);
}

const prompt = [
  `Asset slot: ${slot.id}; family: ${slot.family}; aspect ratio ${aspect}; ${slot.renderer} output.`,
  `Subject: ${subject}.`,
  `Composition: ${slot.composition}.`,
  `Safe area and editability: ${slot.safeArea}; ${kit.promptGrammar.safeArea}.`,
  `Rendering: ${kit.promptGrammar.rendering}.`,
  `Exclusions: ${kit.promptGrammar.exclusions}.`,
  `Brand contract: ${kit.id}@${kit.version}; create a campaign-specific child direction and do not copy reference campaign identity.`,
].join(' ');

console.log(prompt);
