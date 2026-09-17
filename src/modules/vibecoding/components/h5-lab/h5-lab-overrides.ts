/* ─── H5 Lab 覆盖模型 ───
 *
 * h5-reference-lab 的 case 是普通 React 页面组件（语义 HTML + 一份 CSS），
 * 没有配置化的图层模型。要让它们在工坊里"点哪改哪"，这里不去重写页面，
 * 而是给渲染后的 DOM 建一套「路径 → 覆盖」的旁路层：
 *
 *   - 路径由 `标签.首个类名[同签名序号]` 逐级拼出，兄弟节点增删只影响同签名的，
 *     所以页面自身的 useState 切换不会把已有覆盖冲掉。
 *   - 样式覆盖编译成 `[data-h5el="…"]{…!important}` 注入画板，声明式、抗重渲染。
 *   - 文案 / 图片这类内容覆盖只能命令式写回，由 stage 的 apply pass 负责补写。
 */

export interface H5LabBorder {
  width: number
  style: 'solid' | 'dashed' | 'dotted'
  color: string
}

export interface H5LabShadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
}

/** 单个元素的可视覆盖 —— 与右侧面板的字段一一对应。 */
export interface H5LabStyleOverride {
  opacity?: number
  radius?: number
  color?: string
  background?: string
  border?: H5LabBorder
  shadow?: H5LabShadow
  width?: number
  height?: number
  offsetX?: number
  offsetY?: number
  rotate?: number
  zIndex?: number
  paddingX?: number
  paddingY?: number
  marginX?: number
  marginY?: number
  fontSize?: number
  fontWeight?: number
  lineHeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  hidden?: boolean
}

export interface H5LabNodeOverride {
  /** 文案覆盖（纯文本节点）。 */
  text?: string
  /** 图片地址覆盖（img / 背景图）。 */
  src?: string
  style?: H5LabStyleOverride
}

/** 状态帧 id → 元素路径 → 覆盖。同一 case 的状态帧可通过同路径共享槽位改动。 */
export type H5LabOverrides = Record<string, Record<string, H5LabNodeOverride>>

/** 选中的元素 —— 面板和状态画布共用这一份描述。 */
export interface H5LabSelection {
  stateId: string
  path: string
  /** 展示名：优先取语义标签，其次首个类名。 */
  label: string
  tag: string
  /** 元素类型，决定面板给哪几组字段。 */
  kind: 'text' | 'image' | 'button' | 'box' | 'svg'
  /** 选中瞬间的实测值，用于面板字段预填。 */
  measured: {
    width: number
    height: number
    x: number
    y: number
    text: string
    src: string
    color: string
    background: string
    radius: number
    fontSize: number
  }
}

/* ─── 路径 ─── */

function signature(el: Element) {
  const tag = el.tagName.toLowerCase()
  const raw = typeof el.className === 'string' ? el.className : ''
  // Tailwind 那种一长串工具类不适合当签名，只取第一个语义类名。
  const cls = raw.trim().split(/\s+/).filter(Boolean)[0]
  return cls ? `${tag}.${cls}` : tag
}

/** 从画板根算出元素路径；元素不在这棵树里时返回 null。 */
export function h5LabPathOf(root: HTMLElement, el: HTMLElement): string | null {
  const chain: string[] = []
  let node: Element | null = el
  while (node && node !== root) {
    const parent: Element | null = node.parentElement
    if (!parent) return null
    const sig = signature(node)
    let index = 0
    for (const sib of Array.from(parent.children)) {
      if (sib === node) break
      if (signature(sib) === sig) index += 1
    }
    chain.push(index > 0 ? `${sig}[${index}]` : sig)
    node = parent
  }
  if (node !== root) return null
  return chain.reverse().join('>')
}

/** 路径反查元素 —— 页面重渲染后 apply pass 靠它把覆盖补回去。 */
export function h5LabNodeAt(root: HTMLElement, path: string): HTMLElement | null {
  let node: Element = root
  for (const seg of path.split('>')) {
    const match = /^(.*?)(?:\[(\d+)\])?$/.exec(seg)
    if (!match) return null
    const sig = match[1]
    const want = match[2] ? Number(match[2]) : 0
    let seen = 0
    let found: Element | null = null
    for (const child of Array.from(node.children)) {
      if (signature(child) !== sig) continue
      if (seen === want) {
        found = child
        break
      }
      seen += 1
    }
    if (!found) return null
    node = found
  }
  return node as HTMLElement
}

/* ─── 元素分类 / 展示名 ─── */

const TAG_LABELS: Record<string, string> = {
  h1: '标题',
  h2: '标题',
  h3: '小标题',
  h4: '小标题',
  p: '正文',
  span: '文字',
  strong: '强调文字',
  small: '注释文字',
  em: '强调文字',
  li: '列表项',
  a: '链接',
  button: '按钮',
  img: '图片',
  svg: '矢量图',
  section: '区块',
  header: '页头',
  footer: '页脚',
  nav: '导航',
  main: '主区',
  ul: '列表',
  ol: '列表',
  figure: '图组',
  figcaption: '图注',
}

export function h5LabKindOf(el: HTMLElement): H5LabSelection['kind'] {
  const tag = el.tagName.toLowerCase()
  if (tag === 'img') return 'image'
  if (tag === 'svg' || el.namespaceURI === 'http://www.w3.org/2000/svg') return 'svg'
  if (tag === 'button' || el.getAttribute('role') === 'button') return 'button'
  // 只含文本的叶子当文字处理，容器仍然是盒子。
  if (el.children.length === 0 && (el.textContent ?? '').trim().length > 0) {
    return 'text'
  }
  return 'box'
}

export function h5LabLabelOf(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const aria = el.getAttribute('aria-label')?.trim()
  if (aria) return aria
  if (tag === 'img') {
    const alt = (el as HTMLImageElement).alt?.trim()
    return alt ? `图片 · ${alt.slice(0, 12)}` : '图片'
  }
  const base = TAG_LABELS[tag] ?? tag
  const text = (el.textContent ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    // 按钮里常塞一个 ▶ 之类的装饰 span，去掉它文案才认得出来。
    .replace(/[▶▷►»›→>]+$/, '')
    .trim()
  if (!text) return base
  // 按钮 / 链接就算套了子元素，也该按文案认，交互盘点里才分得清哪个是哪个。
  const byText = el.children.length === 0 || tag === 'button' || tag === 'a'
  if (byText && text.length <= 16) return text
  if (byText && text.length > 16) return `${text.slice(0, 14)}…`
  return base
}

/* ─── 样式编译 ─── */

function decls(style: H5LabStyleOverride): string[] {
  const out: string[] = []
  const push = (prop: string, value: string) => out.push(`${prop}:${value} !important`)

  if (style.hidden) push('display', 'none')
  if (style.opacity !== undefined) push('opacity', String(style.opacity / 100))
  if (style.radius !== undefined) push('border-radius', `${style.radius}px`)
  if (style.color) push('color', style.color)
  if (style.background) push('background', style.background)
  if (style.border) {
    push('border', `${style.border.width}px ${style.border.style} ${style.border.color}`)
  }
  if (style.shadow) {
    const s = style.shadow
    push('box-shadow', `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
  }
  if (style.width !== undefined) push('width', `${style.width}px`)
  if (style.height !== undefined) push('height', `${style.height}px`)
  if (style.paddingX !== undefined) {
    push('padding-left', `${style.paddingX}px`)
    push('padding-right', `${style.paddingX}px`)
  }
  if (style.paddingY !== undefined) {
    push('padding-top', `${style.paddingY}px`)
    push('padding-bottom', `${style.paddingY}px`)
  }
  if (style.marginX !== undefined) {
    push('margin-left', `${style.marginX}px`)
    push('margin-right', `${style.marginX}px`)
  }
  if (style.marginY !== undefined) {
    push('margin-top', `${style.marginY}px`)
    push('margin-bottom', `${style.marginY}px`)
  }
  if (style.fontSize !== undefined) push('font-size', `${style.fontSize}px`)
  if (style.fontWeight !== undefined) push('font-weight', String(style.fontWeight))
  if (style.lineHeight !== undefined) push('line-height', String(style.lineHeight))
  if (style.letterSpacing !== undefined) {
    push('letter-spacing', `${style.letterSpacing}px`)
  }
  if (style.textAlign) push('text-align', style.textAlign)
  if (style.zIndex !== undefined) {
    push('z-index', String(style.zIndex))
    push('position', 'relative')
  }

  const transform: string[] = []
  if (style.offsetX || style.offsetY) {
    transform.push(`translate(${style.offsetX ?? 0}px, ${style.offsetY ?? 0}px)`)
  }
  if (style.rotate) transform.push(`rotate(${style.rotate}deg)`)
  if (transform.length > 0) push('transform', transform.join(' '))

  return out
}

/** 把整份覆盖编译成一段作用域 CSS，注入画板容器。 */
export function h5LabCss(overrides: H5LabOverrides): string {
  const rules: string[] = []
  for (const [stateId, nodes] of Object.entries(overrides)) {
    for (const [path, override] of Object.entries(nodes)) {
      if (!override.style) continue
      const body = decls(override.style)
      if (body.length === 0) continue
      const scope = `[data-h5-frame="${stateId}"] [data-h5el=${JSON.stringify(path)}]`
      rules.push(`${scope}{${body.join(';')}}`)
    }
  }
  return rules.join('\n')
}

/** 把一块画板的内容覆盖写回 DOM，并给命中的节点补 `data-h5el`（样式 CSS 靠它
 *  命中）。样式是声明式的，文案 / 图片只能命令式补写，所以页面每次重渲染后都要
 *  再跑一次。 */
export function applyH5LabBoard(
  root: HTMLElement,
  board: Record<string, H5LabNodeOverride>,
) {
  const wanted = new Set(Object.keys(board))
  for (const stale of Array.from(root.querySelectorAll('[data-h5el]'))) {
    const path = stale.getAttribute('data-h5el')
    if (!path || !wanted.has(path)) stale.removeAttribute('data-h5el')
  }
  for (const [path, override] of Object.entries(board)) {
    const node = h5LabNodeAt(root, path)
    if (!node) continue
    if (node.getAttribute('data-h5el') !== path) {
      node.setAttribute('data-h5el', path)
    }
    if (override.text !== undefined && node.textContent !== override.text) {
      node.textContent = override.text
    }
    if (override.src === undefined) continue
    if (node instanceof HTMLImageElement) {
      if (node.getAttribute('src') !== override.src) {
        node.setAttribute('src', override.src)
      }
    } else if (!node.style.backgroundImage.includes(override.src)) {
      node.style.backgroundImage = `url("${override.src}")`
      node.style.backgroundSize = node.style.backgroundSize || 'cover'
    }
  }
}

/* ─── 读写 ─── */

export function h5LabPatch(
  overrides: H5LabOverrides,
  stateId: string,
  path: string,
  patch: H5LabNodeOverride,
): H5LabOverrides {
  const board = overrides[stateId] ?? {}
  const prev = board[path] ?? {}
  const next: H5LabNodeOverride = {
    ...prev,
    ...patch,
    style: patch.style ? { ...prev.style, ...patch.style } : prev.style,
  }
  return { ...overrides, [stateId]: { ...board, [path]: next } }
}

/** 同一 case 里相同 DOM 路径就是同一个内容槽位。一次写入所有状态帧，
 * 让文案、图片和样式在多帧间保持一致；补出的新页面不在 stateIds 中，不会被误改。 */
export function h5LabPatchSlot(
  overrides: H5LabOverrides,
  stateIds: string[],
  path: string,
  patch: H5LabNodeOverride,
): H5LabOverrides {
  return stateIds.reduce(
    (next, stateId) => h5LabPatch(next, stateId, path, patch),
    overrides,
  )
}

export function h5LabReset(
  overrides: H5LabOverrides,
  stateId: string,
  path: string,
): H5LabOverrides {
  const board = { ...(overrides[stateId] ?? {}) }
  delete board[path]
  return { ...overrides, [stateId]: board }
}

/** 还原同一槽位时也同步清掉各状态帧的覆盖。 */
export function h5LabResetSlot(
  overrides: H5LabOverrides,
  stateIds: string[],
  path: string,
): H5LabOverrides {
  return stateIds.reduce(
    (next, stateId) => h5LabReset(next, stateId, path),
    overrides,
  )
}

export function h5LabCountEdits(overrides: H5LabOverrides): number {
  return Object.values(overrides).reduce(
    (sum, board) => sum + Object.keys(board).length,
    0,
  )
}

/** 编辑态是草稿，点「应用」才落到预览和本地存储 —— 这里数一下差了多少处，
 *  给「应用 N」用（对齐 OJO 顶栏的 Apply N 攒批提交）。 */
export function h5LabDiffCount(
  draft: H5LabOverrides,
  committed: H5LabOverrides,
  ids: string[],
): number {
  let count = 0
  for (const id of ids) {
    const a = draft[id] ?? {}
    const b = committed[id] ?? {}
    const paths = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const path of paths) {
      if (JSON.stringify(a[path]) !== JSON.stringify(b[path])) count += 1
    }
  }
  return count
}

const STORAGE_KEY = 'vibecoding:h5-lab-overrides:v1'

export function loadH5LabOverrides(): H5LabOverrides {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as H5LabOverrides) : {}
  } catch {
    return {}
  }
}

export function saveH5LabOverrides(overrides: H5LabOverrides): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
    return true
  } catch {
    return false
  }
}
