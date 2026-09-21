import type { TowerDefenseUiConfig } from './TowerDefenseFlowModel'
import type {
  GameUiArtifact,
  GameUiNode,
  GameUiScreen,
  GameUiScreenId,
  GameUiScreenKind,
  GameUiStyleLock,
} from './GameUiModel'

/* 生成用的风格 skill，不是 CSS 页的实时主题。目录可以继续往下加。 */
export type GameUiStyleSkillId = TowerDefenseUiConfig['visualPreset']

export interface GameUiStyleSkill {
  id: GameUiStyleSkillId
  name: string
  summary: string
  cover: string
}

export const GAME_UI_STYLE_SKILLS: GameUiStyleSkill[] = [
  {
    id: 'night-watch',
    name: '守夜灯塔',
    summary: '深色森林 · 金色引导',
    cover: '/assets/tower-defense-demo/visual-style/world-style/v1.webp',
  },
  {
    id: 'forest-signal',
    name: '林间信号',
    summary: '鲜明植物 · 高对比战斗',
    cover: '/assets/tower-defense-demo/visual-style/world-style/v2.webp',
  },
  {
    id: 'paper-kingdom',
    name: '纸境王国',
    summary: '暖色纸张 · 手绘边框',
    cover: '/assets/tower-defense-demo/visual-style/world-style/v3.webp',
  },
]

export const GAME_UI_STYLE_PRESETS = GAME_UI_STYLE_SKILLS.map(
  (item) => [item.id, item.name, item.summary] as const,
)

export const STYLE_PRESET_COVERS = Object.fromEntries(
  GAME_UI_STYLE_SKILLS.map((item) => [item.id, item.cover]),
) as Record<GameUiStyleSkillId, string>

/* CSS 标注页只用这一套底色，不跟生成 skill 连动。 */
export const CSS_LAYOUT_PRESET: GameUiStyleSkillId = 'night-watch'

export const DEFAULT_STYLE_LOCK: GameUiStyleLock = {
  mode: 'preset',
  keywords: ['暗夜', '森林', '月光', '木质UI'],
  refs: [],
  prompt: '',
}

export const STYLE_LOCK_COVER = STYLE_PRESET_COVERS['night-watch']

export function styleLockFromUi(ui: TowerDefenseUiConfig): GameUiStyleLock {
  return {
    mode: ui.styleLock?.mode === 'custom' ? 'custom' : 'preset',
    keywords: ui.styleLock?.keywords?.length
      ? [...ui.styleLock.keywords]
      : [...DEFAULT_STYLE_LOCK.keywords],
    refs: ui.styleLock?.refs ? [...ui.styleLock.refs] : [],
    prompt: ui.styleLock?.prompt ?? '',
  }
}

export function styleLockKey(
  preset: TowerDefenseUiConfig['visualPreset'],
  lock: GameUiStyleLock,
) {
  if ((lock.mode ?? 'preset') === 'custom') {
    return `custom|${lock.prompt ?? ''}|${lock.keywords.join(',')}|${lock.refs.length}`
  }
  return `preset|${preset}`
}

export function annotationHash(nodes: GameUiNode[], screenId: string) {
  return JSON.stringify(
    nodes
      .filter((node) => node.screen === screenId)
      .map((node) => ({
        id: node.id,
        kind: node.kind,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        visible: node.visible,
        text: node.text ?? '',
        hasText: Boolean(node.hasText),
        hasFrame: Boolean(node.hasFrame),
        iconName: node.iconName ?? '',
      })),
  )
}

/* 也接屏 id：胜利/失败两屏共用同一张 result 图。 */
export function artifactFamily(kind: GameUiScreenKind | GameUiScreenId) {
  if (kind === 'win' || kind === 'lose') return 'result'
  if (kind === 'custom') return 'list'
  return kind
}

export function artifactSrc(
  kind: GameUiScreenKind | GameUiScreenId,
  version: GameUiArtifact['versionId'],
) {
  if (kind === 'start' && version === 'v1') return '/tower-defense/ui-art/start/page-v1.jpg'
  return `/tower-defense/ui-art/${artifactFamily(kind)}-${version}.svg`
}

export function currentArtifact(screen: GameUiScreen | undefined) {
  if (!screen?.artifact) return null
  return (
    screen.artifact.versions.find((item) => item.id === screen.artifact?.versionId) ??
    screen.artifact.versions[0] ??
    null
  )
}

export function artifactStale(
  screen: GameUiScreen | undefined,
  nodes: GameUiNode[],
  preset: TowerDefenseUiConfig['visualPreset'],
  lock: GameUiStyleLock,
) {
  const current = currentArtifact(screen)
  if (!current || !screen) return false
  return (
    current.generatedFromHash !== annotationHash(nodes, screen.id) ||
    current.styleKey !== styleLockKey(preset, lock)
  )
}

export function nextArtifactVersion(
  artifact: GameUiArtifact | undefined,
): GameUiArtifact['versionId'] {
  if (!artifact) return 'v1'
  const hasV2 = artifact.versions.some((item) => item.id === 'v2')
  const hasV1 = artifact.versions.some((item) => item.id === 'v1')
  if (!hasV2) return 'v2'
  if (!hasV1) return 'v1'
  return artifact.versionId === 'v1' ? 'v2' : 'v1'
}

export function buildArtifact(
  screen: GameUiScreen,
  nodes: GameUiNode[],
  preset: TowerDefenseUiConfig['visualPreset'],
  lock: GameUiStyleLock,
  prefer: GameUiArtifact['versionId'] = 'v1',
  note?: string,
): GameUiArtifact {
  const hash = annotationHash(nodes, screen.id)
  const styleKey = styleLockKey(preset, lock)
  const nextVersion = {
    id: prefer,
    src: artifactSrc(screen.kind, prefer),
    generatedFromHash: hash,
    styleKey,
    note: note?.trim() || undefined,
  }
  const existing = screen.artifact?.versions ?? []
  const versions = existing.some((item) => item.id === prefer)
    ? existing.map((item) => (item.id === prefer ? nextVersion : item))
    : [...existing, nextVersion]
  return {
    versionId: prefer,
    primaryId: screen.artifact?.primaryId ?? prefer,
    collapsed: false,
    versions,
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('artifact-load-failed'))
    image.src = src
  })
}

export async function cropArtifactToDataUrl(src: string, node: GameUiNode) {
  const image = await loadImage(src)
  const width = image.naturalWidth || 750
  const height = image.naturalHeight || 1643
  const canvasWidth = 390
  const canvasHeight = 853
  const x = Math.max(0, Math.min(width - 1, Math.round((node.x * width) / canvasWidth)))
  const y = Math.max(0, Math.min(height - 1, Math.round((node.y * height) / canvasHeight)))
  const box = {
    x,
    y,
    width: Math.max(1, Math.min(width - x, Math.round((node.width * width) / canvasWidth))),
    height: Math.max(1, Math.min(height - y, Math.round((node.height * height) / canvasHeight))),
  }
  const page = document.createElement('canvas')
  page.width = width
  page.height = height
  const pageCtx = page.getContext('2d')
  if (!pageCtx) throw new Error('canvas-unavailable')
  pageCtx.drawImage(image, 0, 0, width, height)
  const cut = document.createElement('canvas')
  cut.width = box.width
  cut.height = box.height
  const cutCtx = cut.getContext('2d')
  if (!cutCtx) throw new Error('canvas-unavailable')
  cutCtx.drawImage(page, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height)
  return cut.toDataURL('image/png')
}
