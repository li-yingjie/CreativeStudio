import { create } from 'zustand'

/* ─── SideNav / FileTreeView 的运行时配置 ───
 *
 * 规范画布 /sidebar 上可以实时改这些值（改动立即作用于所有挂载点），
 * 点「保存」写入 localStorage，之后整个应用（含刷新后）都用保存值；
 * 「重置」回到代码默认值。组件侧通过 useSideNavConfig 消费。 */

export type TreeDisclosurePosition = 'left' | 'right'

export interface SideNavConfig {
  /* 布局 */
  width: number
  collapsedWidth: number
  topPadding: number
  listPaddingX: number
  /* 主按钮 */
  buttonHeight: number
  buttonRadius: number
  buttonFontSize: number
  /* 菜单行 */
  rowHeight: number
  rowRadius: number
  rowPaddingX: number
  rowGap: number
  rowSpacing: number
  rowFontSize: number
  menuIconSize: number
  subRowHeight: number
  treeDisclosurePosition: TreeDisclosurePosition
  /* 树 */
  treeRowHeight: number
  treeRowGap: number
  treeIndent: number
  treeSlot: number
  treeGap: number
  treeIconSize: number
  treeFontSize: number
  treeBasePl: number
  /* 配色 */
  bg: string
  activeBg: string
  hoverBg: string
  ink: string
  inkDim: string
  iconColor: string
}

export type SideNavNumericKey = {
  [K in keyof SideNavConfig]: SideNavConfig[K] extends number ? K : never
}[keyof SideNavConfig]

const COLOR_KEYS = [
  'bg',
  'activeBg',
  'hoverBg',
  'ink',
  'inkDim',
  'iconColor',
] as const satisfies readonly (keyof SideNavConfig)[]

export type SideNavColorKey = (typeof COLOR_KEYS)[number]

/** 导航默认底色跟随宿主 Semi 主题；独立运行时回退到设计稿灰。 */
export const SIDE_NAV_DEFAULT_BACKGROUND = 'var(--semi-color-nav-bg, #F2F2F7)'

/** 代码默认值 = 设计稿（统一导航 579-57535）的规格。 */
export const SIDE_NAV_DEFAULTS: SideNavConfig = {
  width: 220,
  collapsedWidth: 60,
  topPadding: 0,
  listPaddingX: 12,
  buttonHeight: 36,
  buttonRadius: 8,
  buttonFontSize: 13,
  rowHeight: 36,
  rowRadius: 8,
  rowPaddingX: 8,
  rowGap: 8,
  rowSpacing: 0,
  rowFontSize: 13,
  menuIconSize: 16,
  subRowHeight: 32,
  treeDisclosurePosition: 'left',
  treeRowHeight: 28,
  treeRowGap: 2,
  treeIndent: 20,
  treeSlot: 16,
  treeGap: 4,
  treeIconSize: 16,
  treeFontSize: 13,
  treeBasePl: 8,
  bg: '#F2F2F7',
  activeBg: 'rgba(83,96,143,0.12)',
  hoverBg: 'rgba(0,0,0,0.03)',
  ink: '#1c1f23',
  inkDim: 'rgba(28,31,35,0.8)',
  iconColor: '#252632',
}

export const SIDE_NAV_WIDTH = SIDE_NAV_DEFAULTS.width
export const SIDE_NAV_COLLAPSED_WIDTH = SIDE_NAV_DEFAULTS.collapsedWidth

/** 配置面板与 store 共用同一组边界，避免 UI 看似受限、存储仍写入异常值。 */
export const SIDE_NAV_NUMERIC_CONSTRAINTS: Record<
  SideNavNumericKey,
  { min: number; max: number; step: number }
> = {
  width: { min: 160, max: 480, step: 1 },
  collapsedWidth: { min: 44, max: 120, step: 1 },
  topPadding: { min: 0, max: 80, step: 1 },
  listPaddingX: { min: 0, max: 64, step: 1 },
  buttonHeight: { min: 24, max: 80, step: 1 },
  buttonRadius: { min: 0, max: 40, step: 1 },
  buttonFontSize: { min: 10, max: 24, step: 1 },
  rowHeight: { min: 24, max: 64, step: 1 },
  rowRadius: { min: 0, max: 40, step: 1 },
  rowPaddingX: { min: 0, max: 40, step: 1 },
  rowGap: { min: 0, max: 32, step: 1 },
  rowSpacing: { min: 0, max: 24, step: 1 },
  rowFontSize: { min: 10, max: 24, step: 1 },
  menuIconSize: { min: 12, max: 32, step: 1 },
  subRowHeight: { min: 24, max: 64, step: 1 },
  treeRowHeight: { min: 24, max: 64, step: 1 },
  treeRowGap: { min: 0, max: 16, step: 1 },
  treeIndent: { min: 8, max: 48, step: 1 },
  treeSlot: { min: 8, max: 32, step: 1 },
  treeGap: { min: 0, max: 24, step: 1 },
  treeIconSize: { min: 12, max: 32, step: 1 },
  treeFontSize: { min: 10, max: 24, step: 1 },
  treeBasePl: { min: 0, max: 48, step: 1 },
}

const NUMERIC_KEYS = Object.keys(SIDE_NAV_NUMERIC_CONSTRAINTS) as SideNavNumericKey[]
const STORAGE_KEY = 'sidenav-config'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidColor(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const color = value.trim()
  if (/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color)) return true

  const match = color.match(
    /^rgba?\(\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*,\s*(-?(?:\d+(?:\.\d*)?|\.\d+))\s*,\s*(-?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*,\s*(-?(?:\d+(?:\.\d*)?|\.\d+)))?\s*\)$/i,
  )
  if (!match) return false
  const [, r, g, b, a] = match
  const channels = [r, g, b].map(Number)
  const alpha = a === undefined ? 1 : Number(a)
  return channels.every((channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255)
    && Number.isFinite(alpha)
    && alpha >= 0
    && alpha <= 1
}

/** 任何入口都只产出完整、有限且可渲染的配置；异常字段回落到 fallback。 */
export function sanitizeSideNavConfig(
  input: unknown,
  fallback: SideNavConfig = SIDE_NAV_DEFAULTS,
): SideNavConfig {
  const source = isRecord(input) ? input : {}
  const next = { ...fallback }

  for (const key of NUMERIC_KEYS) {
    const value = source[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    const { min, max } = SIDE_NAV_NUMERIC_CONSTRAINTS[key]
    next[key] = Math.min(max, Math.max(min, value))
  }

  // `disclosurePosition` was briefly shipped during development; accept it as
  // a legacy alias so any locally saved preview setting migrates losslessly.
  const treeDisclosurePosition =
    source.treeDisclosurePosition ?? source.disclosurePosition
  if (treeDisclosurePosition === 'left' || treeDisclosurePosition === 'right')
    next.treeDisclosurePosition = treeDisclosurePosition

  for (const key of COLOR_KEYS) {
    const value = source[key]
    if (isValidColor(value)) next[key] = value.trim()
  }

  return next
}

function loadSaved(): SideNavConfig {
  try {
    if (typeof localStorage === 'undefined') return SIDE_NAV_DEFAULTS
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SIDE_NAV_DEFAULTS
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value)) return SIDE_NAV_DEFAULTS
    const parsed = { ...value }
    // 旧版代码默认值是白色；只迁移这个历史默认，其他自定义配色继续保留。
    if (typeof parsed.bg === 'string' && ['#ffffff', '#fff'].includes(parsed.bg.trim().toLowerCase()))
      parsed.bg = SIDE_NAV_DEFAULTS.bg
    // 旧版为右描边额外增加 1px；现在描边计入 60px 总宽。
    if (parsed.collapsedWidth === 61) parsed.collapsedWidth = SIDE_NAV_DEFAULTS.collapsedWidth
    // 旧版菜单行默认间距是 4px；迁移到新版的紧凑 0px，其他自定义值不动。
    if (parsed.rowSpacing === 4) parsed.rowSpacing = SIDE_NAV_DEFAULTS.rowSpacing
    // 旧版主按钮默认 40px，比菜单行高一档；统一到和行高一样的 36。
    if (parsed.buttonHeight === 40) parsed.buttonHeight = SIDE_NAV_DEFAULTS.buttonHeight
    // 旧版统一导航默认顶部留白 12px；新规范 Header 从侧栏顶边开始。
    // 只迁移旧默认值，用户主动保存的其他数值继续保留。
    if (parsed.topPadding === 12) parsed.topPadding = SIDE_NAV_DEFAULTS.topPadding
    return sanitizeSideNavConfig(parsed)
  } catch {
    return SIDE_NAV_DEFAULTS
  }
}

interface SideNavConfigStore {
  /** 当前生效值（画布上编辑即改这里，全应用实时跟随）。 */
  config: SideNavConfig
  /** 最近一次保存的快照 — 用来判断「有未保存修改」。 */
  saved: SideNavConfig
  /** 最近一次持久化错误；成功保存/重置后清空。 */
  error: string | null
  patch: (p: Partial<SideNavConfig>) => void
  save: () => void
  reset: () => void
}

const initialConfig = loadSaved()

export const useSideNavConfig = create<SideNavConfigStore>((set, get) => ({
  config: initialConfig,
  saved: initialConfig,
  error: null,
  patch: (p) => set((s) => ({ config: sanitizeSideNavConfig(p, s.config) })),
  save: () => {
    const config = sanitizeSideNavConfig(get().config)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      set({ config, saved: config, error: null })
    } catch {
      // 写失败时保留 dirty，避免面板误报“已同步”。
      set({ config, error: '保存失败，请检查浏览器存储权限后重试。' })
    }
  },
  reset: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      set({ config: SIDE_NAV_DEFAULTS, saved: SIDE_NAV_DEFAULTS, error: null })
    } catch {
      set({
        config: SIDE_NAV_DEFAULTS,
        error: '重置已在当前页面生效，但无法清除浏览器中的已保存配置。',
      })
    }
  },
}))
