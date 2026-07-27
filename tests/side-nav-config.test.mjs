import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

import {
  SIDE_NAV_DEFAULTS,
  sanitizeSideNavConfig,
  useSideNavConfig,
} from '../src/shared/components/side-nav-config.ts'

afterEach(() => {
  delete globalThis.localStorage
  useSideNavConfig.setState({
    config: SIDE_NAV_DEFAULTS,
    saved: SIDE_NAV_DEFAULTS,
    error: null,
  })
})

test('side nav config sanitizes persisted and runtime values', () => {
  assert.equal(SIDE_NAV_DEFAULTS.rowSpacing, 0)

  const sanitized = sanitizeSideNavConfig({
    width: 999,
    collapsedWidth: -3,
    rowHeight: Number.POSITIVE_INFINITY,
    treeFontSize: 9,
    treeDisclosurePosition: 'right',
    bg: 'not-a-color',
    activeBg: 'rgba(83, 96, 143, 0.12)',
  })

  assert.equal(sanitized.width, 480)
  assert.equal(sanitized.collapsedWidth, 44)
  assert.equal(sanitized.rowHeight, SIDE_NAV_DEFAULTS.rowHeight)
  assert.equal(sanitized.treeFontSize, 10)
  assert.equal(sanitized.treeDisclosurePosition, 'right')
  assert.equal(sanitized.bg, SIDE_NAV_DEFAULTS.bg)
  assert.equal(sanitized.activeBg, 'rgba(83, 96, 143, 0.12)')

  const invalidDisclosure = sanitizeSideNavConfig({ treeDisclosurePosition: 'center' })
  assert.equal(
    invalidDisclosure.treeDisclosurePosition,
    SIDE_NAV_DEFAULTS.treeDisclosurePosition,
  )

  const migratedDisclosure = sanitizeSideNavConfig({ disclosurePosition: 'right' })
  assert.equal(migratedDisclosure.treeDisclosurePosition, 'right')
})

test('tree disclosure position patches, persists, migrates, and rejects invalid values', () => {
  let persisted = ''
  globalThis.localStorage = {
    setItem(_key, value) {
      persisted = value
    },
    removeItem() {},
  }

  useSideNavConfig.getState().patch({ treeDisclosurePosition: 'right' })
  assert.equal(useSideNavConfig.getState().config.treeDisclosurePosition, 'right')
  assert.equal(useSideNavConfig.getState().saved.treeDisclosurePosition, 'left')

  useSideNavConfig.getState().patch({ treeDisclosurePosition: 'center' })
  assert.equal(useSideNavConfig.getState().config.treeDisclosurePosition, 'right')

  useSideNavConfig.getState().save()
  assert.equal(useSideNavConfig.getState().saved.treeDisclosurePosition, 'right')
  assert.equal(JSON.parse(persisted).treeDisclosurePosition, 'right')
})

test('side nav store keeps dirty state when persistence fails', () => {
  useSideNavConfig.setState({
    config: { ...SIDE_NAV_DEFAULTS, width: 480 },
    saved: SIDE_NAV_DEFAULTS,
    error: null,
  })
  globalThis.localStorage = {
    setItem() {
      throw new Error('storage denied')
    },
    removeItem() {},
  }

  useSideNavConfig.getState().save()
  const state = useSideNavConfig.getState()

  assert.equal(state.config.width, 480)
  assert.equal(state.saved.width, SIDE_NAV_DEFAULTS.width)
  assert.match(state.error, /保存失败/)
})
