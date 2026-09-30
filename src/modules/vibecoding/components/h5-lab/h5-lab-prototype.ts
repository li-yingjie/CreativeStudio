import {
  h5LabLabelOf,
  h5LabPathOf,
  type H5LabGroup,
} from './h5-lab-overrides'
import type { H5LabDesign } from './h5-lab-cases'

/* ─── 原型交互层 ───
 *
 * 这些 case 是照着 benchmark 首屏反推出来的，只有第一屏 —— 「点击测试人格」
 * 「领取任务」按下去之后是什么，原作里就没有。所以状态帧只能切出很薄的几种。
 *
 * 这里把缺口显性化：先把页面里的可交互热点盘出来（`findH5LabHotspots`），
 * 每个热点要么连到已有的帧，要么现生成一屏补上（`H5LabScreen`），生成的屏
 * 是真 DOM，照样能被画布的覆盖机制编辑。连接关系存在 `links` 里，手机框预览
 * 按它跳转，静态多屏就咬合成可点触原型。
 */

export interface H5LabHotspot {
  path: string
  label: string
  tag: string
}

const HOTSPOT_SELECTOR = 'button, a[href], [role="button"], input[type="submit"]'
const PLATFORM_CONTROL_LABEL = /^(返回|分享)$/

/** 盘出一帧里的可交互热点。 */
export function findH5LabHotspots(root: HTMLElement): H5LabHotspot[] {
  const out: H5LabHotspot[] = []
  const seen = new Set<string>()
  for (const el of Array.from(root.querySelectorAll(HOTSPOT_SELECTOR))) {
    if (!(el instanceof HTMLElement)) continue
    if (el.offsetParent === null && el.getClientRects().length === 0) continue
    const path = h5LabPathOf(root, el)
    if (!path || seen.has(path)) continue
    // 返回 / 分享属于端内能力，不进入业务热点补屏流程。
    const label = h5LabLabelOf(el)
    if (PLATFORM_CONTROL_LABEL.test(label)) continue
    seen.add(path)
    out.push({ path, label, tag: el.tagName.toLowerCase() })
  }
  return out
}

/** 从画布带进对话的一个元素引用 —— 聊天里继续改这块时的上下文。 */
export interface H5LabChatRef {
  frameId: string
  frameLabel: string
  path: string
  label: string
  tag: string
  /** 文案 / 图片地址，写进给模型的上下文行。 */
  text?: string
  src?: string
}

/** 对话里的同名元素必须能区分；保留语义名，并用路径末两级作稳定定位。 */
export function h5LabRefDisplayLabel(ref: H5LabChatRef): string {
  const pathSegments = ref.path.split('>').filter(Boolean)
  const locator = pathSegments.slice(-2).join(' > ') || ref.path
  return `${ref.label} · ${locator}`
}

/** 带进对话的元素写给模型的那行上下文。 */
export function h5LabRefContext(ref: H5LabChatRef): string {
  const bits = [
    `状态帧「${ref.frameLabel}」里的「${ref.label}」(${ref.tag})`,
    `元素路径：${ref.path}`,
  ]
  if (ref.text) bits.push(`当前文案：${ref.text.slice(0, 60)}`)
  if (ref.src) bits.push(`当前图片：${ref.src}`)
  return `【画布选中】${bits.join('｜')}`
}

/* ─── 生成的界面 ─── */

export type H5LabScreenKind = 'overlay' | 'result' | 'form' | 'list'

export const H5_LAB_SCREEN_KINDS: {
  id: H5LabScreenKind
  label: string
  hint: string
}[] = [
  { id: 'overlay', label: '结果弹层', hint: '压在当前页上的确认 / 结果卡片' },
  { id: 'result', label: '结果页', hint: '整屏结果，带主行动' },
  { id: 'form', label: '填写页', hint: '报名 / 提交信息' },
  { id: 'list', label: '列表页', hint: '任务、奖励、榜单这类清单' },
]

export interface H5LabScreen {
  id: string
  caseId: string
  kind: H5LabScreenKind
  /** 帧标题。 */
  label: string
  title: string
  body: string
  primaryAction: string
  secondaryAction?: string
  /** form / list 用的行。 */
  rows: string[]
  /** 列表行尾那个小动作文案；空串表示不显示（规则页这种就不该有）。 */
  rowAction?: string
  /** 从哪个热点生出来的，用于在画布上标出来源。 */
  fromStateId: string
  fromPath: string
  fromLabel: string
}

export type H5LabTransition = 'fade' | 'slide' | 'none'

export interface H5LabLink {
  targetId: string
  transition: H5LabTransition
}

export interface H5LabPageSettings {
  shareButton: boolean
  backButton: boolean
  swipeBack: boolean
  shareTitle: string
  shareDescription: string
  /** 空字符串表示始终跟随当前头图。 */
  shareImage: string
  /** 整页设计系统相对 case 原稿的改动；空对象就是原稿。 */
  design: Partial<H5LabDesign>
  /** 当前风格名（预设 / 随机），只做面板展示。 */
  designName: string
  /** 换主色时图片是否跟着转色相。 */
  designTintImages: boolean
}

export const DEFAULT_H5_LAB_PAGE_SETTINGS: H5LabPageSettings = {
  shareButton: true,
  backButton: true,
  swipeBack: true,
  shareTitle: '',
  shareDescription: '',
  shareImage: '',
  design: {},
  designName: '',
  designTintImages: true,
}

export interface H5LabPrototype {
  screens: H5LabScreen[]
  /** `${stateId}||${path}` → 连接。 */
  links: Record<string, H5LabLink>
  /** case id → 端内导航与分享配置。 */
  settings: Record<string, Partial<H5LabPageSettings>>
  /** 设计师在画布里创建的 Figma 式编组。 */
  groups: H5LabGroup[]
}

export const emptyH5LabPrototype = (): H5LabPrototype => ({
  screens: [],
  links: {},
  settings: {},
  groups: [],
})

export function h5LabPageSettings(
  prototype: H5LabPrototype,
  caseId: string,
): H5LabPageSettings {
  return {
    ...DEFAULT_H5_LAB_PAGE_SETTINGS,
    ...(prototype.settings[caseId] ?? {}),
  }
}

/** 把端内返回 / 分享的显隐同步到 benchmark 页面自带的按钮。 */
export function applyH5LabPageSettings(
  root: HTMLElement,
  settings: H5LabPageSettings,
) {
  for (const el of Array.from(root.querySelectorAll(HOTSPOT_SELECTOR))) {
    if (!(el instanceof HTMLElement)) continue
    const label = h5LabLabelOf(el)
    const visible =
      label === '返回'
        ? settings.backButton
        : label === '分享'
          ? settings.shareButton
          : null
    if (visible === null) continue
    el.toggleAttribute('hidden', !visible)
    el.setAttribute('data-h5-platform-control', label)
  }
}

export function linkKey(stateId: string, path: string) {
  return `${stateId}||${path}`
}

/** 把一条补屏建议落成真的一帧。文案已经贴着热点语义写好了，生成出来就能看，
 *  不满意再在画布上改。 */
export function screenFromSuggestion(
  caseId: string,
  suggestion: {
    id: string
    kind: H5LabScreenKind
    label: string
    title: string
    body: string
    primaryAction: string
    secondaryAction?: string
    rows: string[]
    rowAction?: string
  },
  hotspot: { stateId: string; path: string; label: string },
): H5LabScreen {
  return {
    id: `gen:${caseId}:${suggestion.id}:${Date.now().toString(36)}`,
    caseId,
    kind: suggestion.kind,
    label: suggestion.label,
    title: suggestion.title,
    body: suggestion.body,
    primaryAction: suggestion.primaryAction,
    secondaryAction: suggestion.secondaryAction,
    rows: suggestion.rows,
    rowAction: suggestion.rowAction,
    fromStateId: hotspot.stateId,
    fromPath: hotspot.path,
    fromLabel: hotspot.label,
  }
}

/** 原型侧的待应用改动数 —— 和覆盖那边的计数一起凑成「应用 N」。
 *  `frameIds` 是这个 case 的全部帧，用来把连接过滤到自己名下。 */
export function h5LabPrototypeDiffCount(
  draft: H5LabPrototype,
  committed: H5LabPrototype,
  caseId: string,
  frameIds: string[],
): number {
  const own = (p: H5LabPrototype) => p.screens.filter((s) => s.caseId === caseId)
  const draftScreens = own(draft)
  const committedScreens = own(committed)
  let count = 0
  for (const screen of draftScreens) {
    const before = committedScreens.find((s) => s.id === screen.id)
    if (!before || JSON.stringify(before) !== JSON.stringify(screen)) count += 1
  }
  const draftIds = new Set(draftScreens.map((s) => s.id))
  for (const screen of committedScreens) if (!draftIds.has(screen.id)) count += 1

  const mine = new Set(frameIds)
  const scoped = (p: H5LabPrototype) =>
    new Map(
      Object.entries(p.links).filter(([key]) => mine.has(key.split('||')[0])),
    )
  const a = scoped(draft)
  const b = scoped(committed)
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    if (JSON.stringify(a.get(key)) !== JSON.stringify(b.get(key))) count += 1
  }
  if (
    JSON.stringify(h5LabPageSettings(draft, caseId)) !==
    JSON.stringify(h5LabPageSettings(committed, caseId))
  ) {
    count += 1
  }
  const ownGroups = (p: H5LabPrototype) =>
    (p.groups ?? []).filter((group) => group.caseId === caseId)
  if (JSON.stringify(ownGroups(draft)) !== JSON.stringify(ownGroups(committed))) {
    count += 1
  }
  return count
}

/* ─── 读写 ─── */

const STORAGE_KEY = 'vibecoding:h5-lab-prototype:v1'

export function loadH5LabPrototype(): H5LabPrototype {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyH5LabPrototype()
    const parsed = JSON.parse(raw) as Partial<H5LabPrototype>
    return {
      screens: Array.isArray(parsed.screens) ? parsed.screens : [],
      links: parsed.links && typeof parsed.links === 'object' ? parsed.links : {},
      settings:
        parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {},
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
    }
  } catch {
    return emptyH5LabPrototype()
  }
}

export function saveH5LabPrototype(prototype: H5LabPrototype): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prototype))
    return true
  } catch {
    return false
  }
}
