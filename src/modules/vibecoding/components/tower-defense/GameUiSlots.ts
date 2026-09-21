import {
  canSliceNode,
  createDefaultGameUiLayout,
  GAME_UI_KIND_LABEL,
  GAME_UI_SCREENS,
  type GameUiNode,
  type GameUiScreen,
} from './GameUiModel.ts'
import type { TowerDefenseAsset } from './TowerDefenseFlowModel.ts'

export const CATALOG_UI_SLOT_PREFIX = 'catalog-ui-slot:'

export function catalogUiGroupTitle(label: string) {
  const name = label.trim() || '界面'
  return name.startsWith('UI-') ? name : `UI-${name}`
}

export function catalogUiSlotAssetId(nodeId: string) {
  return `${CATALOG_UI_SLOT_PREFIX}${nodeId}`
}

export function isCatalogUiSlotAssetId(id: string) {
  return id.startsWith(CATALOG_UI_SLOT_PREFIX)
}

export function parseCatalogUiSlotNodeId(id: string) {
  return isCatalogUiSlotAssetId(id) ? id.slice(CATALOG_UI_SLOT_PREFIX.length) : null
}

/** Only a confirmed page-art replacement fills the slot; CSS/code stays empty. */
export function nodeSlotCurrentSrc(node: GameUiNode) {
  return node.render === 'art' && node.artSlot ? node.artSlot : undefined
}

export function slottableUiNodes(nodes: GameUiNode[]) {
  return nodes.filter(canSliceNode)
}

export function resolveUiSlotScreens(screens?: GameUiScreen[]) {
  return screens?.length ? screens : GAME_UI_SCREENS.map((item) => ({ ...item }))
}

export function resolveUiSlotNodes(nodes?: GameUiNode[]) {
  return nodes?.length ? nodes : createDefaultGameUiLayout()
}

export function buildCatalogUiSlotAsset(
  node: GameUiNode,
  screenLabel: string,
): TowerDefenseAsset {
  const src = nodeSlotCurrentSrc(node)
  return {
    id: catalogUiSlotAssetId(node.id),
    name: node.name,
    category: 'ui',
    role: screenLabel,
    description: `${screenLabel} · ${GAME_UI_KIND_LABEL[node.kind]}`,
    accent: '#161823',
    baseVisualStatus: src ? 'confirmed' : 'draft',
    selectedVisualVersion: src ? 0 : undefined,
    visualVersions: src
      ? [
          {
            id: node.artSliceId ?? node.artVersionId ?? 'current',
            src,
            width: Math.max(1, Math.round(node.width)),
            height: Math.max(1, Math.round(node.height)),
            source: node.artSource === 'upload' ? 'upload' : 'generated',
            label: node.name,
          },
        ]
      : [],
    states: [],
  }
}

export interface UiSlotGroupItem {
  asset: TowerDefenseAsset
  nodeId: string
  filled: boolean
}

export interface UiSlotGroup {
  screenId: string
  title: string
  items: UiSlotGroupItem[]
}

export function groupUiSlotsByScreen(
  nodes?: GameUiNode[],
  screens?: GameUiScreen[],
): UiSlotGroup[] {
  const resolvedNodes = slottableUiNodes(resolveUiSlotNodes(nodes))
  const resolvedScreens = resolveUiSlotScreens(screens)
  const seen = new Set<string>()
  const groups: UiSlotGroup[] = []

  const pushGroup = (screenId: string, title: string) => {
    const items = resolvedNodes
      .filter((node) => node.screen === screenId)
      .map((node) => ({
        asset: buildCatalogUiSlotAsset(node, title),
        nodeId: node.id,
        filled: Boolean(nodeSlotCurrentSrc(node)),
      }))
    if (!items.length) return
    seen.add(screenId)
    groups.push({ screenId, title, items })
  }

  resolvedScreens.forEach((screen) => pushGroup(screen.id, catalogUiGroupTitle(screen.label)))
  const leftover = [...new Set(resolvedNodes.map((node) => node.screen))].filter((id) => !seen.has(id))
  leftover.forEach((screenId) => pushGroup(screenId, catalogUiGroupTitle(screenId)))
  return groups
}

export function flattenUiSlotAssets(groups: UiSlotGroup[]) {
  return groups.flatMap((group) => group.items.map((item) => item.asset))
}
