#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const manifestPath = process.argv[2];

if (!manifestPath) {
  console.error('Usage: node audit-activity-manifest.mjs <manifest.json>');
  process.exit(2);
}

const absoluteManifestPath = path.resolve(manifestPath);
const manifestDir = path.dirname(absoluteManifestPath);
const errors = [];
const warnings = [];

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(absoluteManifestPath, 'utf8'));
} catch (error) {
  console.error(JSON.stringify({ ok: false, errors: [`Cannot read manifest: ${error.message}`] }, null, 2));
  process.exit(1);
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${label} must be a non-empty string`);
  }
}

function requireArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} must be a non-empty array`);
    return [];
  }
  return value;
}

requireString(manifest.schemaVersion, 'schemaVersion');
requireString(manifest.project, 'project');
requireString(manifest.decisions?.boundary, 'decisions.boundary');
requireString(manifest.decisions?.gameplay, 'decisions.gameplay');
requireString(manifest.decisions?.brandKit, 'decisions.brandKit');

const pages = requireArray(manifest.pages, 'pages');
const componentRefs = new Set();

for (const [pageIndex, page] of pages.entries()) {
  requireString(page?.id, `pages[${pageIndex}].id`);
  const components = requireArray(page?.components, `pages[${pageIndex}].components`);
  for (const [componentIndex, component] of components.entries()) {
    const label = `pages[${pageIndex}].components[${componentIndex}]`;
    requireString(component?.ref, `${label}.ref`);
    requireString(component?.kind, `${label}.kind`);
    requireString(component?.source, `${label}.source`);
    if (component?.source === 'registry') {
      requireString(component?.registryId, `${label}.registryId`);
      requireString(component?.version, `${label}.version`);
    }
    if (component?.ref) {
      if (componentRefs.has(component.ref)) {
        errors.push(`${label}.ref duplicates ${component.ref}`);
      }
      componentRefs.add(component.ref);
    }
  }
}

const assets = requireArray(manifest.assets, 'assets');
const assetIds = new Set();
const projectRoot = manifest.projectRoot
  ? path.resolve(manifestDir, manifest.projectRoot)
  : manifestDir;

for (const [index, asset] of assets.entries()) {
  const label = `assets[${index}]`;
  requireString(asset?.id, `${label}.id`);
  requireString(asset?.slot, `${label}.slot`);
  requireString(asset?.src, `${label}.src`);
  requireString(asset?.ownerComponent, `${label}.ownerComponent`);
  requireString(asset?.stage, `${label}.stage`);
  requireString(asset?.status, `${label}.status`);

  if (asset?.id) {
    if (assetIds.has(asset.id)) {
      errors.push(`${label}.id duplicates ${asset.id}`);
    }
    assetIds.add(asset.id);
  }

  if (asset?.ownerComponent && !componentRefs.has(asset.ownerComponent)) {
    errors.push(`${label}.ownerComponent references unknown component ${asset.ownerComponent}`);
  }

  if (!asset?.provenance) {
    warnings.push(`${label}.provenance is missing`);
  }
  if (!asset?.renderer) {
    warnings.push(`${label}.renderer is missing`);
  }

  if (asset?.stage === 'final') {
    if (asset.status !== 'ready') {
      errors.push(`${label} is final but status is ${asset.status ?? 'missing'}, expected ready`);
    }
    if (asset.src) {
      const assetPath = path.resolve(projectRoot, asset.src);
      if (!fs.existsSync(assetPath)) {
        errors.push(`${label}.src does not exist: ${assetPath}`);
      }
    }
  }
}

const requiredGates = [
  'noHorizontalOverflow',
  'noBrokenImages',
  'contrastReviewed',
  'geometryStable',
  'componentEditable',
  'coreLoopPlayable',
  'noPlaceholderCopy',
];

for (const gate of requiredGates) {
  if (manifest.quality?.[gate] !== true) {
    errors.push(`quality.${gate} must be true`);
  }
}

const report = {
  ok: errors.length === 0,
  manifest: absoluteManifestPath,
  counts: {
    pages: pages.length,
    components: componentRefs.size,
    assets: assets.length,
  },
  errors,
  warnings,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
