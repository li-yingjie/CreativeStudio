import type { H5LabOverrides } from './h5-lab-overrides'
import {
  emptyH5LabPrototype,
  type H5LabPrototype,
} from './h5-lab-prototype'

export interface H5LabPreviewSnapshot {
  overrides: H5LabOverrides
  prototype: H5LabPrototype
}

export interface H5LabPreviousAppliedVersion {
  id: string
  label: string
  versionNumber: number
  createdAt: number
  snapshot: H5LabPreviewSnapshot
}

const STORAGE_KEY = 'vibecoding:h5-lab-preview-previous:v1'

export function initialH5LabPreviewVersion(): H5LabPreviousAppliedVersion {
  return {
    id: 'original-h5-lab',
    label: '原始版本',
    versionNumber: 0,
    createdAt: 0,
    snapshot: {
      overrides: {},
      prototype: emptyH5LabPrototype(),
    },
  }
}

export function loadH5LabPreviousAppliedVersion(): H5LabPreviousAppliedVersion {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialH5LabPreviewVersion()
    const parsed = JSON.parse(raw) as Partial<H5LabPreviousAppliedVersion>
    const snapshot = parsed.snapshot
    if (
      !snapshot ||
      !snapshot.overrides ||
      typeof snapshot.overrides !== 'object' ||
      !snapshot.prototype ||
      typeof snapshot.prototype !== 'object'
    ) {
      return initialH5LabPreviewVersion()
    }
    return {
      id: typeof parsed.id === 'string' ? parsed.id : 'previous-h5-lab',
      label:
        typeof parsed.label === 'string' ? parsed.label : '上次应用前版本',
      versionNumber:
        typeof parsed.versionNumber === 'number'
          ? parsed.versionNumber
          : parsed.createdAt
            ? 1
            : 0,
      createdAt:
        typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
      snapshot: {
        overrides: snapshot.overrides,
        prototype: {
          screens: Array.isArray(snapshot.prototype.screens)
            ? snapshot.prototype.screens
            : [],
          links:
            snapshot.prototype.links &&
            typeof snapshot.prototype.links === 'object'
              ? snapshot.prototype.links
              : {},
          settings:
            snapshot.prototype.settings &&
            typeof snapshot.prototype.settings === 'object'
              ? snapshot.prototype.settings
              : {},
          groups: Array.isArray(snapshot.prototype.groups)
            ? snapshot.prototype.groups
            : [],
        },
      },
    }
  } catch {
    return initialH5LabPreviewVersion()
  }
}

export function saveH5LabPreviousAppliedVersion(
  version: H5LabPreviousAppliedVersion,
): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(version))
    return true
  } catch {
    return false
  }
}
