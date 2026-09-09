import {
  h5LabKindOf,
  h5LabLabelOf,
  h5LabPathOf,
  type H5LabSelection,
} from './h5-lab-overrides'

/* ─── 图层树 ───
 *
 * case 页面没有图层模型，图层树只能从渲染后的 DOM 现推。跳过纯排版壳和不可见节点，
 * 让列表读起来接近设计工具里的图层，而不是一棵原样的 DOM。
 */

export interface H5LabLayer {
  path: string
  label: string
  tag: string
  kind: H5LabSelection['kind']
  children: H5LabLayer[]
}

const SKIP_TAGS = new Set(['style', 'script', 'br', 'noscript', 'template'])

function visible(el: Element) {
  if (SKIP_TAGS.has(el.tagName.toLowerCase())) return false
  const style = window.getComputedStyle(el)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

/** 页面外面通常套着 shell / page 两层排版壳，图层列表从它们里面开始才有意义。 */
function unwrap(root: HTMLElement, limit = 3): HTMLElement {
  let node = root
  for (let i = 0; i < limit; i += 1) {
    const kids = Array.from(node.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && visible(child),
    )
    if (kids.length !== 1) break
    node = kids[0]
  }
  return node
}

/** 从一帧的根节点推出图层树。`maxDepth` 兜住长页的递归成本。 */
export function buildH5LabLayers(root: HTMLElement, maxDepth = 8): H5LabLayer[] {
  const walk = (el: Element, depth: number): H5LabLayer[] =>
    Array.from(el.children).flatMap((child): H5LabLayer[] => {
      if (!(child instanceof HTMLElement) && !(child instanceof SVGElement)) return []
      if (!visible(child)) return []
      const path = h5LabPathOf(root, child as HTMLElement)
      if (!path) return []
      const tag = child.tagName.toLowerCase()
      return [
        {
          path,
          label: h5LabLabelOf(child as HTMLElement),
          tag,
          kind: h5LabKindOf(child as HTMLElement),
          // svg 内部不展开成图层 —— 整块矢量图就是一个对象。
          children: depth >= maxDepth || tag === 'svg' ? [] : walk(child, depth + 1),
        },
      ]
    })

  return walk(unwrap(root), 0)
}

/** 选中路径上的每一级 —— 面包屑和 Full structure 的自动展开都用它。 */
export function h5LabAncestors(path: string): string[] {
  const parts = path.split('>')
  return parts.map((_, index) => parts.slice(0, index + 1).join('>'))
}

/** 在树里找一个节点。 */
export function findH5LabLayer(
  layers: H5LabLayer[],
  path: string,
): H5LabLayer | null {
  for (const layer of layers) {
    if (layer.path === path) return layer
    const hit = findH5LabLayer(layer.children, path)
    if (hit) return hit
  }
  return null
}

/** Element view 用：选中节点的下一层；叶子节点退回同级，免得面板空着。 */
export function h5LabElementView(
  layers: H5LabLayer[],
  path: string | null,
): { title: string; items: H5LabLayer[] } {
  if (!path) return { title: '页面根层级', items: layers }
  const node = findH5LabLayer(layers, path)
  if (!node) return { title: '页面根层级', items: layers }
  if (node.children.length > 0) {
    return { title: `${node.label} 的子层`, items: node.children }
  }
  const parentPath = path.split('>').slice(0, -1).join('>')
  const parent = parentPath ? findH5LabLayer(layers, parentPath) : null
  const siblings = parent ? parent.children : layers
  return { title: parent ? `${parent.label} 的子层` : '页面根层级', items: siblings }
}
