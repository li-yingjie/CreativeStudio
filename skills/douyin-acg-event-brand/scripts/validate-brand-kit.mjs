#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const kitPath = path.resolve(process.argv[2] ?? path.join(scriptDir, '../assets/douyin-acg-experience-kit.v1.json'));
const errors = [];
const warnings = [];

let kit;
try {
  kit = JSON.parse(fs.readFileSync(kitPath, 'utf8'));
} catch (error) {
  console.error(JSON.stringify({ ok: false, errors: [`Cannot read kit: ${error.message}`] }, null, 2));
  process.exit(1);
}

const requireString = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${label} must be a non-empty string`);
};

const requireArray = (value, label, minimum = 1) => {
  if (!Array.isArray(value) || value.length < minimum) {
    errors.push(`${label} must contain at least ${minimum} item(s)`);
    return [];
  }
  return value;
};

const uniqueIds = (items, label) => {
  const ids = new Set();
  for (const [index, item] of items.entries()) {
    requireString(item?.id, `${label}[${index}].id`);
    if (item?.id && ids.has(item.id)) errors.push(`${label}[${index}].id duplicates ${item.id}`);
    if (item?.id) ids.add(item.id);
  }
  return ids;
};

const hexToRgb = (value) => {
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return null;
  const number = Number.parseInt(match[1], 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
};

const luminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const channels = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

requireString(kit.schemaVersion, 'schemaVersion');
requireString(kit.id, 'id');
requireString(kit.version, 'version');
if (kit.version && !/^\d+\.\d+\.\d+$/.test(kit.version)) errors.push('version must use semantic versioning');
if (kit.sourceAuthority !== 'figma-extracted') errors.push('Brand Kit must declare Figma as source authority');
if (kit.figmaExtraction?.fileKey !== 'PxXGus8deG2BZ3xQLUFl0u') errors.push('unexpected Figma source');
if (kit.figmaExtraction?.rootNodeId !== '1:369') errors.push('unexpected Figma root node');
if (kit.figmaExtraction?.previewUsage !== 'evidence-only') errors.push('Figma previews must stay evidence-only');
requireString(kit.presentationManifest, 'presentationManifest');
requireArray(kit.evidence, 'evidence', 3);
requireArray(kit.inheritance?.mustOverride, 'inheritance.mustOverride', 3);
requireArray(kit.inheritance?.mustNotInherit, 'inheritance.mustNotInherit', 3);

const colors = requireArray(kit.tokens?.color, 'tokens.color', 8);
const colorIds = uniqueIds(colors, 'tokens.color');
const colorValues = new Map();
for (const [index, color] of colors.entries()) {
  if (!hexToRgb(color?.value)) errors.push(`tokens.color[${index}].value must be a six-digit hex color`);
  if (color?.id && color?.value) colorValues.set(color.id, color.value.toUpperCase());
}

for (const category of ['typography', 'shape', 'depth', 'motion']) {
  uniqueIds(requireArray(kit.tokens?.[category], `tokens.${category}`, 3), `tokens.${category}`);
}
uniqueIds(requireArray(kit.compositionRecipes, 'compositionRecipes', 3), 'compositionRecipes');
uniqueIds(requireArray(kit.moduleSkins, 'moduleSkins', 5), 'moduleSkins');
const slotIds = uniqueIds(requireArray(kit.assetSlots, 'assetSlots', 7), 'assetSlots');

for (const [index, slot] of kit.assetSlots?.entries?.() ?? []) {
  requireString(slot.family, `assetSlots[${index}].family`);
  requireString(slot.renderer, `assetSlots[${index}].renderer`);
  requireString(slot.safeArea, `assetSlots[${index}].safeArea`);
  requireString(slot.composition, `assetSlots[${index}].composition`);
  requireArray(slot.aspectRatios, `assetSlots[${index}].aspectRatios`);
  if (!Number.isFinite(slot.minimumLongEdgePx) || slot.minimumLongEdgePx < 512) {
    errors.push(`assetSlots[${index}].minimumLongEdgePx must be at least 512`);
  }
}

for (const [index, pair] of (kit.accessibility?.textPairs ?? []).entries()) {
  const resolve = (value) => colorIds.has(value) ? colorValues.get(value) : value;
  const foreground = resolve(pair.foreground);
  const background = resolve(pair.background);
  const ratio = contrast(foreground, background);
  if (ratio === null) {
    errors.push(`accessibility.textPairs[${index}] contains an unknown or invalid color`);
  } else if (ratio + 0.001 < pair.minimum) {
    errors.push(`accessibility.textPairs[${index}] contrast ${ratio.toFixed(2)} is below ${pair.minimum}`);
  }
}

if ((kit.accessibility?.minimumTouchTargetPx ?? 0) < 44) errors.push('minimumTouchTargetPx must be at least 44');
if (!kit.accessibility?.reducedMotionRequired) errors.push('reducedMotionRequired must be true');

for (const field of ['rendering', 'safeArea', 'exclusions']) requireString(kit.promptGrammar?.[field], `promptGrammar.${field}`);
const exclusionText = kit.promptGrammar?.exclusions?.toLowerCase?.() ?? '';
for (const term of ['grain', 'watermark', 'baked interface text']) {
  if (!exclusionText.includes(term)) warnings.push(`promptGrammar.exclusions should explicitly mention ${term}`);
}

if ((kit.qualityGates?.minimumDistinctModuleSkins ?? 0) < 4) errors.push('minimumDistinctModuleSkins must be at least 4');
if ((kit.qualityGates?.minimumAssetFamilies ?? 0) < 7) errors.push('minimumAssetFamilies must be at least 7');
requireArray(kit.qualityGates?.mustPass, 'qualityGates.mustPass', 6);

const presentationManifestPath = path.join(scriptDir, '..', kit.presentationManifest ?? '');
let presentationManifest;
try {
  presentationManifest = JSON.parse(fs.readFileSync(presentationManifestPath, 'utf8'));
} catch (error) {
  errors.push(`Cannot read presentation manifest: ${error.message}`);
}

if (presentationManifest) {
  if (presentationManifest.source?.fileKey !== kit.figmaExtraction?.fileKey) errors.push('presentation and Agent contract must use the same Figma source');
  requireArray(presentationManifest.typography?.families, 'presentation.typography.families', 4);
  requireArray(presentationManifest.typography?.scale, 'presentation.typography.scale', 5);
  requireArray(presentationManifest.colors, 'presentation.colors', 8);
  requireArray(presentationManifest.components, 'presentation.components', 4);
  const displayAssets = [
    presentationManifest.identity?.platformLockup?.asset,
    presentationManifest.identity?.platformLockup?.vectorAsset,
    presentationManifest.identity?.campaignTitle?.asset,
    presentationManifest.hero?.asset,
    ...(presentationManifest.components ?? []).map((component) => component.asset).filter(Boolean),
  ];
  for (const [index, assetPath] of displayAssets.entries()) {
    requireString(assetPath, `presentation.displayAssets[${index}]`);
    if (assetPath && !fs.existsSync(path.join(scriptDir, '..', assetPath))) errors.push(`Missing presentation asset ${assetPath}`);
  }
}

const previewManifestPath = path.join(scriptDir, '../assets/preview-manifest.json');
let previewManifest;
try {
  previewManifest = JSON.parse(fs.readFileSync(previewManifestPath, 'utf8'));
} catch (error) {
  errors.push(`Cannot read preview manifest: ${error.message}`);
}

if (previewManifest) {
  if (previewManifest.usage !== 'evidence-only') errors.push('preview manifest must be evidence-only');
  if (previewManifest.inheritIntoCampaign !== false) errors.push('Figma previews must not inherit into campaigns');
  const previews = requireArray(previewManifest.items, 'previewManifest.items', 5);
  for (const [index, preview] of previews.entries()) {
    requireString(preview.nodeId, `previewManifest.items[${index}].nodeId`);
    requireString(preview.path, `previewManifest.items[${index}].path`);
    const previewPath = path.join(scriptDir, '../assets', preview.path ?? '');
    if (!fs.existsSync(previewPath)) {
      errors.push(`Missing Figma preview ${preview.path}`);
      continue;
    }
    const bytes = fs.readFileSync(previewPath);
    const digest = crypto.createHash('sha256').update(bytes).digest('hex');
    if (digest !== preview.sha256) errors.push(`Checksum mismatch for ${preview.path}`);
    if (bytes.subarray(1, 4).toString('ascii') === 'PNG') {
      const width = bytes.readUInt32BE(16);
      const height = bytes.readUInt32BE(20);
      if (width !== preview.width || height !== preview.height) errors.push(`Dimension mismatch for ${preview.path}`);
    } else {
      errors.push(`${preview.path} is not a PNG export`);
    }
  }
}

console.log(JSON.stringify({
  ok: errors.length === 0,
  kit: kitPath,
  counts: { colors: colors.length, slots: slotIds.size, skins: kit.moduleSkins?.length ?? 0, figmaPreviews: previewManifest?.items?.length ?? 0, presentationComponents: presentationManifest?.components?.length ?? 0 },
  errors,
  warnings,
}, null, 2));
process.exit(errors.length ? 1 : 0);
