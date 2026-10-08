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
  /** 水平 / 垂直翻转，Figma Rotation 旁边那两颗键。 */
  flipX?: boolean
  flipY?: boolean
  zIndex?: number
  paddingX?: number
  paddingY?: number
  marginX?: number
  marginY?: number
  /** Figma Auto layout 对应的容器流。normal 会显式退出 flex 布局。 */
  layoutMode?: 'normal' | 'vertical' | 'horizontal' | 'wrap'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  gap?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  widthSizing?: 'fixed' | 'fill' | 'hug'
  heightSizing?: 'fixed' | 'fill' | 'hug'
  clipContent?: boolean
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  fontStyle?: 'normal' | 'italic'
  lineHeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  textDecoration?: 'none' | 'underline' | 'line-through'
  hidden?: boolean
}

export interface H5LabNodeOverride {
  /** 同一父容器内的 DOM 顺序；用于图层前移、后移和拖拽排序。 */
  siblingOrder?: number
  /** 文案覆盖（纯文本节点）。 */
  text?: string
  /** 元素内部 HTML 覆盖；应用时会移除脚本、事件属性和危险 URL。 */
  html?: string
  /** 作用于当前元素的原始 CSS 声明，不接受选择器或 at-rule。 */
  css?: string
  /** 图片地址覆盖（img / 背景图）。 */
  src?: string
  style?: H5LabStyleOverride
}

/** 状态帧 id → 元素路径 → 覆盖。同一 case 的状态帧可通过同路径共享槽位改动。 */
export type H5LabOverrides = Record<string, Record<string, H5LabNodeOverride>>

/** 设计态创建的虚拟组。子元素仍保留原 DOM path，组本身用 `@group:` path
 *  参与选区、样式覆盖和历史记录。 */
export interface H5LabGroup {
  id: string
  caseId: string
  stateId: string
  parentPath: string
  childPaths: string[]
  label: string
}

export type H5LabInsertedElementKind =
  | 'heading'
  | 'paragraph'
  | 'section'
  | 'card'
  | 'image-card'
  | 'image'
  | 'html'
  | 'button'
  | 'divider'
  | 'container'

/** 设计态插入的真实 DOM 组件。内容落在当前帧内，后续仍可选中并使用覆盖模型编辑。 */
export interface H5LabInsertedElement {
  id: string
  caseId: string
  stateId: string
  parentPath: string
  kind: H5LabInsertedElementKind
  label: string
  html: string
}

export const h5LabGroupPath = (id: string) => `@group:${id}`

export function h5LabGroupId(path: string): string | null {
  return path.startsWith('@group:') ? path.slice('@group:'.length) : null
}

/** 选中的元素 —— 面板和状态画布共用这一份描述。 */
export interface H5LabSelection {
  stateId: string
  path: string
  /** 展示名：优先取语义标签，其次首个类名。 */
  label: string
  tag: string
  /** 元素类型，决定面板给哪几组字段。 */
    kind: 'text' | 'image' | 'video' | 'button' | 'box' | 'svg' | 'group'
  /** 选中瞬间的实测值，用于面板字段预填。 */
  measured: {
    width: number
    height: number
    x: number
    y: number
    /** 在父容器里的位置，不含平移（Position 面板的基准）。 */
    layoutX: number
    layoutY: number
    /** 当前生效的平移（页面自己的或覆盖的）。 */
    translateX: number
    translateY: number
    parentWidth: number
    parentHeight: number
    text: string
    html: string
    className: string
    src: string
    color: string
    background: string
    radius: number
    fontFamily: string
    fontSize: number
    fontWeight: number
    fontStyle: 'normal' | 'italic'
    lineHeight: number
    letterSpacing: number
    textAlign: 'left' | 'center' | 'right'
    textDecoration: 'none' | 'underline' | 'line-through'
    childCount: number
    layoutMode: 'normal' | 'vertical' | 'horizontal' | 'wrap'
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between'
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch'
    gap: number
    paddingTop: number
    paddingRight: number
    paddingBottom: number
    paddingLeft: number
    widthSizing: 'fixed' | 'fill' | 'hug'
    heightSizing: 'fixed' | 'fill' | 'hug'
    clipContent: boolean
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
  const sourcePath =
    el.getAttribute('data-h5-group-child-path') ??
    el.getAttribute('data-h5-source-path')
  if (sourcePath) return sourcePath
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
  const groupId = h5LabGroupId(path)
  if (groupId) {
    return (
      Array.from(root.querySelectorAll<HTMLElement>('[data-h5-group]')).find(
        (node) => node.dataset.h5Group === groupId,
      ) ?? null
    )
  }
  const groupedChild = Array.from(
    root.querySelectorAll<HTMLElement>('[data-h5-group-child-path]'),
  ).find((node) => node.dataset.h5GroupChildPath === path)
  if (groupedChild) return groupedChild
  const orderedNode = Array.from(
    root.querySelectorAll<HTMLElement>('[data-h5-source-path]'),
  ).find((node) => node.dataset.h5SourcePath === path)
  if (orderedNode) return orderedNode
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
  video: '视频',
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

const TEXT_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'span', 'strong', 'small', 'em', 'label',
  'figcaption', 'li', 'dt', 'dd', 'blockquote', 'a',
])

export function h5LabKindOf(el: HTMLElement): H5LabSelection['kind'] {
  if (el.hasAttribute('data-h5-group')) return 'group'
  const tag = el.tagName.toLowerCase()
  if (tag === 'img') return 'image'
  if (tag === 'video') return 'video'
  if (tag === 'svg' || el.namespaceURI === 'http://www.w3.org/2000/svg') return 'svg'
  if (tag === 'button' || el.getAttribute('role') === 'button') return 'button'
  // 标题和正文常用 br / span 拆行或着色；它们仍应作为一个文字对象编辑。
  if (
    (TEXT_TAGS.has(tag) || el.children.length === 0) &&
    (el.textContent ?? '').trim().length > 0
  ) {
    return 'text'
  }
  return 'box'
}

export function h5LabLabelOf(el: HTMLElement): string {
  if (el.hasAttribute('data-h5-group')) {
    return el.getAttribute('aria-label')?.trim() || '编组'
  }
  const tag = el.tagName.toLowerCase()
  const aria = el.getAttribute('aria-label')?.trim()
  if (aria) return aria
  if (tag === 'img') {
    const alt = (el as HTMLImageElement).alt?.trim()
    return alt ? `图片 · ${alt.slice(0, 12)}` : '图片'
  }
  if (tag === 'video') {
    const title = el.getAttribute('title')?.trim()
    const aria = el.getAttribute('aria-label')?.trim()
    return title || aria || '视频'
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
  if (style.layoutMode) {
    if (style.layoutMode === 'normal') {
      push('display', 'block')
    } else {
      push('display', 'flex')
      push('flex-direction', style.layoutMode === 'vertical' ? 'column' : 'row')
      push('flex-wrap', style.layoutMode === 'wrap' ? 'wrap' : 'nowrap')
    }
  }
  if (style.justifyContent) push('justify-content', style.justifyContent)
  if (style.alignItems) push('align-items', style.alignItems)
  if (style.gap !== undefined) push('gap', `${style.gap}px`)
  if (style.paddingTop !== undefined) push('padding-top', `${style.paddingTop}px`)
  if (style.paddingRight !== undefined) push('padding-right', `${style.paddingRight}px`)
  if (style.paddingBottom !== undefined) push('padding-bottom', `${style.paddingBottom}px`)
  if (style.paddingLeft !== undefined) push('padding-left', `${style.paddingLeft}px`)
  if (style.widthSizing === 'fill') {
    push('width', '100%')
    push('max-width', '100%')
    push('box-sizing', 'border-box')
  } else if (style.widthSizing === 'hug') {
    push('width', 'max-content')
    push('max-width', '100%')
  }
  if (style.heightSizing === 'fill') push('height', '100%')
  else if (style.heightSizing === 'hug') push('height', 'fit-content')
  if (style.clipContent !== undefined) {
    push('overflow', style.clipContent ? 'hidden' : 'visible')
  }
  // hidden 放在布局声明之后，避免 auto layout 的 display 把隐藏状态顶掉。
  if (style.hidden) push('display', 'none')
  if (style.fontFamily) push('font-family', style.fontFamily)
  if (style.fontSize !== undefined) push('font-size', `${style.fontSize}px`)
  if (style.fontWeight !== undefined) push('font-weight', String(style.fontWeight))
  if (style.fontStyle) push('font-style', style.fontStyle)
  if (style.lineHeight !== undefined) push('line-height', `${style.lineHeight}px`)
  if (style.letterSpacing !== undefined) {
    push('letter-spacing', `${style.letterSpacing}px`)
  }
  if (style.textAlign) push('text-align', style.textAlign)
  if (style.textDecoration) push('text-decoration', style.textDecoration)
  if (style.zIndex !== undefined) {
    push('z-index', String(style.zIndex))
    push('position', 'relative')
  }

  const transform: string[] = []
  // 显式设成 0 也要写：Position 面板里「X=0」意思是贴左边，不能退回页面自己的平移
  if (style.offsetX !== undefined || style.offsetY !== undefined) {
    transform.push(`translate(${style.offsetX ?? 0}px, ${style.offsetY ?? 0}px)`)
  }
  if (style.rotate) transform.push(`rotate(${style.rotate}deg)`)
  if (style.flipX || style.flipY) {
    transform.push(`scale(${style.flipX ? -1 : 1}, ${style.flipY ? -1 : 1})`)
  }
  if (transform.length > 0) push('transform', transform.join(' '))

  return out
}

/** 代码面板只接收 declaration list，禁止借 `}` / at-rule 逃出当前元素作用域。 */
function rawDecls(css: string | undefined): string[] {
  if (!css) return []
  return css
    .replace(/[{}]/g, '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      const colon = item.indexOf(':')
      if (colon <= 0) return []
      const prop = item.slice(0, colon).trim()
      const value = item.slice(colon + 1).trim()
      if (!/^(?:--)?[a-z][a-z0-9-]*$/i.test(prop)) return []
      if (!value || /(?:@import|expression\s*\(|javascript\s*:)/i.test(value)) return []
      return [`${prop}:${value}${/!important\s*$/i.test(value) ? '' : ' !important'}`]
    })
}

/** 把整份覆盖编译成一段作用域 CSS，注入画板容器。 */
export function h5LabCss(overrides: H5LabOverrides): string {
  const rules: string[] = []
  for (const [stateId, nodes] of Object.entries(overrides)) {
    for (const [path, override] of Object.entries(nodes)) {
      const groupId = h5LabGroupId(path)
      // 虚拟组的自由态继续用 wrapper 自带的 display:contents，子元素保持原位置。
      const style =
        groupId && override.style?.layoutMode === 'normal'
          ? { ...override.style, layoutMode: undefined }
          : override.style
      const body = [
        ...(style ? decls(style) : []),
        ...rawDecls(override.css),
      ]
      if (body.length === 0) continue
      const target = groupId
        ? `[data-h5-group=${JSON.stringify(groupId)}]`
        : `[data-h5el=${JSON.stringify(path)}]`
      const scope = `[data-h5-frame="${stateId}"] ${target}`
      rules.push(`${scope}{${body.join(';')}}`)
    }
  }
  return rules.join('\n')
}

function safeInnerHtml(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html
  for (const node of Array.from(
    template.content.querySelectorAll('script,style,iframe,object,embed,link,meta'),
  )) {
    node.remove()
  }
  for (const node of Array.from(template.content.querySelectorAll('*'))) {
    for (const attr of Array.from(node.attributes)) {
      if (/^on/i.test(attr.name)) node.removeAttribute(attr.name)
      if (
        ['href', 'src', 'xlink:href'].includes(attr.name.toLowerCase()) &&
        /^\s*javascript:/i.test(attr.value)
      ) {
        node.removeAttribute(attr.name)
      }
    }
  }
  return template.innerHTML
}

/** 把设计态新增组件投影到页面 DOM。节点带唯一语义类名，因此可继续被选中和覆盖。 */
export function applyH5LabInsertedElements(
  root: HTMLElement,
  elements: H5LabInsertedElement[],
) {
  const wanted = new Set(elements.map((element) => element.id))
  for (const stale of Array.from(
    root.querySelectorAll<HTMLElement>('[data-h5-inserted]'),
  )) {
    if (!wanted.has(stale.dataset.h5Inserted ?? '')) stale.remove()
  }

  for (const element of elements) {
    let node = root.querySelector<HTMLElement>(
      `[data-h5-inserted="${CSS.escape(element.id)}"]`,
    )
    const parent = element.parentPath
      ? h5LabNodeAt(root, element.parentPath)
      : root
    if (!parent) continue
    if (!node) {
      node = document.createElement('div')
      node.dataset.h5Inserted = element.id
      node.className = `h5-added-${element.id}`
      node.setAttribute('aria-label', element.label)
      parent.appendChild(node)
    }
    const html = safeInnerHtml(element.html)
    if (node.innerHTML !== html) node.innerHTML = html
    if (!node.hasAttribute('data-h5-free-position')) {
      // 新增组件先按文档流得出自然落点，再脱离文档流。后续 transform 移动
      // 只改变视觉位置，不会在页面末尾留下原始占位。
      node.style.display = 'flow-root'
      const naturalRect = node.getBoundingClientRect()
      const naturalOffsetParent = node.offsetParent
      const naturalLeft = node.offsetLeft
      const naturalTop = node.offsetTop
      const naturalWidth = node.offsetWidth
      const naturalHeight = node.offsetHeight
      node.style.position = 'absolute'
      const offsetParent =
        node.offsetParent instanceof HTMLElement ? node.offsetParent : root
      const sameOffsetParent = naturalOffsetParent === offsetParent
      const offsetRect = offsetParent.getBoundingClientRect()
      const scaleX =
        offsetParent.offsetWidth > 0
          ? offsetRect.width / offsetParent.offsetWidth
          : 1
      const scaleY =
        offsetParent.offsetHeight > 0
          ? offsetRect.height / offsetParent.offsetHeight
          : scaleX
      const staticLeft = sameOffsetParent
        ? naturalLeft
        : (naturalRect.left - offsetRect.left) / (scaleX || 1) +
          offsetParent.scrollLeft
      const staticTop = sameOffsetParent
        ? naturalTop
        : (naturalRect.top - offsetRect.top) / (scaleY || 1) +
          offsetParent.scrollTop
      const siblings = Array.from(
        offsetParent.querySelectorAll<HTMLElement>(
          '[data-h5-inserted][data-h5-free-position]',
        ),
      ).filter(
        (sibling) => sibling !== node && sibling.offsetParent === offsetParent,
      )
      const rootRect = root.getBoundingClientRect()
      const frameTop =
        (rootRect.top - offsetRect.top) / (scaleY || 1) +
        offsetParent.scrollTop
      const frameBottom =
        (rootRect.bottom - offsetRect.top) / (scaleY || 1) +
        offsetParent.scrollTop
      const height = naturalHeight || naturalRect.height / (scaleY || 1)
      const minTop = frameTop + 16
      const maxTop = Math.max(minTop, frameBottom - height - 16)
      const previousBottom = siblings.reduce(
        (bottom, sibling) =>
          Math.max(bottom, sibling.offsetTop + sibling.offsetHeight),
        0,
      )
      const previousTop = siblings.reduce(
        (top, sibling) => Math.min(top, sibling.offsetTop),
        Number.POSITIVE_INFINITY,
      )
      const afterPrevious = previousBottom + 8
      const targetTop =
        siblings.length === 0
          ? Math.min(Math.max(staticTop, minTop), maxTop)
          : afterPrevious <= maxTop
            ? afterPrevious
            : Math.max(minTop, previousTop - height - 8)
      node.style.left = `${Math.round(staticLeft)}px`
      node.style.top = `${Math.round(targetTop)}px`
      node.style.width = `${Math.round(naturalWidth || naturalRect.width / (scaleX || 1))}px`
      node.dataset.h5FreePosition = 'true'
    }
  }
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
    if (override.siblingOrder !== undefined && node.parentElement) {
      const siblings = Array.from(node.parentElement.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          !['STYLE', 'SCRIPT', 'BR'].includes(child.tagName),
      )
      for (const [index, sibling] of siblings.entries()) {
        if (!sibling.dataset.h5SourcePath) {
          const siblingPath = h5LabPathOf(root, sibling)
          if (siblingPath) sibling.dataset.h5SourcePath = siblingPath
        }
        if (!sibling.dataset.h5SourceOrder) {
          sibling.dataset.h5SourceOrder = String(index)
        }
      }
    }
    if (node.getAttribute('data-h5el') !== path) {
      node.setAttribute('data-h5el', path)
    }
    if (override.html !== undefined) {
      const html = safeInnerHtml(override.html)
      if (node.innerHTML !== html) node.innerHTML = html
    } else if (override.text !== undefined && node.textContent !== override.text) {
      node.textContent = override.text
    }
    if (override.src === undefined) continue
    if (node instanceof HTMLImageElement || node instanceof HTMLVideoElement) {
      if (node.getAttribute('src') !== override.src) {
        node.setAttribute('src', override.src)
        if (node instanceof HTMLVideoElement) node.load()
      }
    } else if (!node.style.backgroundImage.includes(override.src)) {
      node.style.backgroundImage = `url("${override.src}")`
      node.style.backgroundSize = node.style.backgroundSize || 'cover'
    }
  }

  const orderedParents = new Set<HTMLElement>()
  for (const node of Array.from(
    root.querySelectorAll<HTMLElement>('[data-h5-source-order]'),
  )) {
    if (node.parentElement) orderedParents.add(node.parentElement)
  }
  for (const parent of orderedParents) {
    const orderedChildren = Array.from(parent.children)
      .filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          child.dataset.h5SourceOrder !== undefined,
      )
      .sort((a, b) => {
        const aPath = a.dataset.h5SourcePath ?? ''
        const bPath = b.dataset.h5SourcePath ?? ''
        const aOrder =
          board[aPath]?.siblingOrder ?? Number(a.dataset.h5SourceOrder)
        const bOrder =
          board[bPath]?.siblingOrder ?? Number(b.dataset.h5SourceOrder)
        return aOrder - bOrder
      })
    for (const child of orderedChildren) parent.appendChild(child)
  }
}

/** 把虚拟组投影为 DOM wrapper。默认 display:contents，不改变原页面排版；开启
 *  自动布局后，覆盖 CSS 会把 wrapper 切成 flex 容器。 */
export function applyH5LabGroups(root: HTMLElement, groups: H5LabGroup[]) {
  const wanted = new Set(groups.map((group) => group.id))
  for (const wrapper of Array.from(
    root.querySelectorAll<HTMLElement>('[data-h5-group]'),
  )) {
    if (wanted.has(wrapper.dataset.h5Group ?? '')) continue
    const parent = wrapper.parentElement
    if (!parent) continue
    while (wrapper.firstChild) {
      const child = wrapper.firstChild
      if (child instanceof HTMLElement) child.removeAttribute('data-h5-group-child-path')
      parent.insertBefore(child, wrapper)
    }
    wrapper.remove()
  }

  for (const group of groups) {
    if (h5LabNodeAt(root, h5LabGroupPath(group.id))) continue
    const parent = group.parentPath ? h5LabNodeAt(root, group.parentPath) : root
    if (!parent) continue
    const children = group.childPaths
      .map((path) => h5LabNodeAt(root, path))
      .filter((node): node is HTMLElement => Boolean(node))
    if (children.length < 2 || children.some((node) => node.parentElement !== parent)) {
      continue
    }
    const wrapper = document.createElement('div')
    wrapper.dataset.h5Group = group.id
    wrapper.setAttribute('aria-label', group.label)
    wrapper.style.display = 'contents'
    parent.insertBefore(wrapper, children[0])
    for (const [index, child] of children.entries()) {
      child.dataset.h5GroupChildPath = group.childPaths[index]
      wrapper.appendChild(child)
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
