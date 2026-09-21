import type { H5LabDesign } from './h5-lab-cases'

/* ─── 整页设计系统 ───
 *
 * 复刻页的 CSS 全是写死的色值，没有 token 可换。这里反过来做：扫一遍帧里每个
 * 元素的计算样式，谁的颜色 / 字体和 case 原始 token 对得上，就打上
 * `data-h5ds` 角色标记，再注入一段按角色换值的 CSS。标记只基于原始样式打一次
 * （`data-h5ds-seen`），换风格时只重算 CSS，不再扫。
 */

type ColorToken =
  | 'pageBg'
  | 'pageInk'
  | 'pageMuted'
  | 'paper'
  | 'paperInk'
  | 'paperMuted'
  | 'border'
  | 'accent'
  | 'accentInk'

export const H5_LAB_COLOR_TOKENS: { group: string; items: { key: ColorToken; label: string }[] }[] = [
  {
    group: '页面',
    items: [
      { key: 'pageBg', label: '底色' },
      { key: 'pageInk', label: '文字' },
      { key: 'pageMuted', label: '辅助' },
    ],
  },
  {
    group: '卡片',
    items: [
      { key: 'paper', label: '纸面' },
      { key: 'paperInk', label: '文字' },
      { key: 'paperMuted', label: '辅助' },
      { key: 'border', label: '描边' },
    ],
  },
  {
    group: '主行动',
    items: [
      { key: 'accent', label: '主色' },
      { key: 'accentInk', label: '按钮字' },
    ],
  },
]

export const H5_LAB_FONTS: { label: string; value: string }[] = [
  { label: '苹方 · 无衬线', value: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' },
  { label: '宋体 · 衬线', value: '"Songti SC", STSong, "Noto Serif CJK SC", SimSun, serif' },
  { label: '楷体 · 手写', value: '"Kaiti SC", STKaiti, KaiTi, serif' },
  { label: '圆体 · 可爱', value: '"Yuanti SC", "YouYuan", "PingFang SC", sans-serif' },
  { label: '窄体 · 海报', value: '"Arial Narrow", "PingFang SC", "Hiragino Sans GB", sans-serif' },
]

export interface H5LabDesignPreset {
  id: string
  name: string
  hint: string
  design: Omit<H5LabDesign, 'shadow'>
}

export const H5_LAB_DESIGN_PRESETS: H5LabDesignPreset[] = [
  {
    id: 'sakura',
    name: '樱花奶油',
    hint: '柔粉 + 奶白，适合女性向 / 节日',
    design: {
      pageBg: '#fff4f6', pageInk: '#b0345a', pageMuted: '#a07c86',
      paper: '#fffaf8', paperInk: '#b0345a', paperMuted: '#c9a3ad', border: '#f5c2d0',
      accent: '#ff6f9a', accentInk: '#ffffff', radius: 20, radiusLg: 30,
      displayFont: H5_LAB_FONTS[3].value, bodyFont: H5_LAB_FONTS[0].value,
    },
  },
  {
    id: 'forest',
    name: '森林露营',
    hint: '苔绿 + 米杏，户外 / 自然',
    design: {
      pageBg: '#f3f1e4', pageInk: '#2f5d3a', pageMuted: '#7d7a62',
      paper: '#fbf8ec', paperInk: '#2f5d3a', paperMuted: '#a8a283', border: '#c9d6a8',
      accent: '#3f8f4e', accentInk: '#fffdf2', radius: 14, radiusLg: 24,
      displayFont: H5_LAB_FONTS[1].value, bodyFont: H5_LAB_FONTS[0].value,
    },
  },
  {
    id: 'neon',
    name: '赛博夜场',
    hint: '深紫 + 霓虹，潮流 / 游戏',
    design: {
      pageBg: '#120b2e', pageInk: '#f4ecff', pageMuted: '#a898d6',
      paper: '#1f1547', paperInk: '#f4ecff', paperMuted: '#9486c4', border: '#6b4dff',
      accent: '#21e6c1', accentInk: '#120b2e', radius: 10, radiusLg: 18,
      displayFont: H5_LAB_FONTS[4].value, bodyFont: H5_LAB_FONTS[0].value,
    },
  },
  {
    id: 'festive',
    name: '新春红金',
    hint: '中国红 + 金，年节 / 大促',
    design: {
      pageBg: '#fff3e2', pageInk: '#b3201c', pageMuted: '#946650',
      paper: '#fffaf0', paperInk: '#b3201c', paperMuted: '#c79c73', border: '#f0c47a',
      accent: '#e2261f', accentInk: '#ffe9b0', radius: 12, radiusLg: 22,
      displayFont: H5_LAB_FONTS[2].value, bodyFont: H5_LAB_FONTS[0].value,
    },
  },
  {
    id: 'mono',
    name: '极简黑白',
    hint: '克制留白，品牌 / 发布会',
    design: {
      pageBg: '#f5f5f3', pageInk: '#141414', pageMuted: '#6e6e6a',
      paper: '#ffffff', paperInk: '#141414', paperMuted: '#8a8a86', border: '#dcdcd8',
      accent: '#141414', accentInk: '#ffffff', radius: 6, radiusLg: 12,
      displayFont: H5_LAB_FONTS[0].value, bodyFont: H5_LAB_FONTS[0].value,
    },
  },
  {
    id: 'citrus',
    name: '橘子汽水',
    hint: '橙黄 + 海蓝，夏日 / 活力',
    design: {
      pageBg: '#fff7df', pageInk: '#0c5a8a', pageMuted: '#8a7a55',
      paper: '#fffdf4', paperInk: '#0c5a8a', paperMuted: '#b8a46e', border: '#ffd27a',
      accent: '#ff8a1f', accentInk: '#ffffff', radius: 22, radiusLg: 32,
      displayFont: H5_LAB_FONTS[3].value, bodyFont: H5_LAB_FONTS[0].value,
    },
  },
]

/* ── 颜色工具 ── */

type Rgb = [number, number, number, number]

function parseColor(input: string): Rgb | null {
  const s = input.trim().toLowerCase()
  const hex = s.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16)
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1]
  }
  const fn = s.match(/^rgba?\(([^)]+)\)$/)
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    if (parts.length < 3 || parts.some(Number.isNaN)) return null
    return [parts[0], parts[1], parts[2], parts[3] ?? 1]
  }
  return null
}

function near(a: Rgb, b: Rgb) {
  // 透明度差太大就不算同一个 token，免得把半透明遮罩认成纸面。
  if (Math.abs(a[3] - b[3]) > 0.12) return false
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= 18
}

function hueSat([r, g, b]: Rgb): [number, number] {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const d = max - min
  if (d === 0) return [0, 0]
  const l = (max + min) / 2
  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === r / 255) h = ((g - b) / 255 / d) % 6
  else if (max === g / 255) h = (b - r) / 255 / d + 2
  else h = (r - g) / 255 / d + 4
  return [(h * 60 + 360) % 360, s * 100]
}

function hsl(h: number, s: number, l: number) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** 随机生成一套配色：取一个主色相，页面走浅色调，主色饱和，互补色做描边点缀。 */
export function randomH5LabDesign(base: H5LabDesign): Omit<H5LabDesign, 'shadow'> {
  const h = Math.floor(Math.random() * 360)
  const dark = Math.random() < 0.25
  const fonts = H5_LAB_FONTS
  return {
    pageBg: dark ? hsl(h, 45, 10) : hsl(h, 70, 96),
    pageInk: dark ? hsl(h, 30, 94) : hsl(h, 65, 30),
    pageMuted: dark ? hsl(h, 20, 68) : hsl(h, 15, 48),
    paper: dark ? hsl(h, 40, 16) : hsl(h, 60, 99),
    paperInk: dark ? hsl(h, 30, 94) : hsl(h, 65, 30),
    paperMuted: dark ? hsl(h, 18, 62) : hsl(h, 20, 62),
    border: hsl((h + 30) % 360, 70, dark ? 45 : 82),
    accent: hsl((h + 180 + Math.floor(Math.random() * 40) - 20) % 360, 85, dark ? 60 : 52),
    accentInk: dark ? hsl(h, 45, 10) : '#ffffff',
    radius: [6, 12, 16, 20][Math.floor(Math.random() * 4)],
    radiusLg: [12, 22, 28, 999][Math.floor(Math.random() * 4)],
    displayFont: fonts[Math.floor(Math.random() * fonts.length)].value,
    bodyFont: base.bodyFont,
  }
}

/* ── 标记与 CSS ── */

// 同色时按这个顺序认领角色：主行动最醒目，优先归它。
const TEXT_TOKENS: ColorToken[] = ['accentInk', 'accent', 'paperInk', 'pageInk', 'paperMuted', 'pageMuted']
const BG_TOKENS: ColorToken[] = ['accent', 'paper', 'pageBg', 'border']
const BORDER_TOKENS: ColorToken[] = ['border', 'accent']

const normFont = (f: string) => f.replace(/["']/g, '').replace(/\s*,\s*/g, ',').trim().toLowerCase()

function match(value: string, tokens: ColorToken[], base: H5LabDesign): ColorToken | null {
  const c = parseColor(value)
  if (!c || c[3] === 0) return null
  for (const token of tokens) {
    const t = parseColor(base[token])
    if (t && near(c, t)) return token
  }
  return null
}

/** 给帧里没扫过的元素按原始计算样式打角色标记。 */
export function markH5LabDesign(root: HTMLElement, base: H5LabDesign) {
  const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  for (const el of nodes) {
    if (!(el instanceof HTMLElement) || el.hasAttribute('data-h5ds-seen')) continue
    el.setAttribute('data-h5ds-seen', '')
    const cs = getComputedStyle(el)
    const roles: string[] = []
    const text = match(cs.color, TEXT_TOKENS, base)
    if (text) roles.push(`c-${text}`)
    const bg = match(cs.backgroundColor, BG_TOKENS, base)
    if (bg) roles.push(`bg-${bg}`)
    if (parseFloat(cs.borderTopWidth) > 0) {
      const bd = match(cs.borderTopColor, BORDER_TOKENS, base)
      if (bd) roles.push(`bd-${bd}`)
    }
    const font = normFont(cs.fontFamily)
    if (font === normFont(base.displayFont) && base.displayFont !== base.bodyFont) roles.push('f-display')
    else if (font === normFont(base.bodyFont)) roles.push('f-body')
    if (el instanceof HTMLImageElement || /url\(/.test(cs.backgroundImage)) roles.push('img')
    const radius = parseFloat(cs.borderTopLeftRadius)
    if (radius > 0 && radius === base.radius) roles.push('r-sm')
    else if (radius > 0 && radius === base.radiusLg) roles.push('r-lg')
    if (roles.length) el.setAttribute('data-h5ds', roles.join(' '))
    else el.removeAttribute('data-h5ds')
  }
}

/** 图片没法按 token 换色：主色变了就把图片整体转到新主色的色相上，
 *  目标是黑白灰时退成去色。 */
function imageFilter(base: H5LabDesign, next: H5LabDesign): string | null {
  const from = parseColor(base.accent)
  const to = parseColor(next.accent)
  if (!from || !to || base.accent === next.accent) return null
  const [h0] = hueSat(from)
  const [h1, s1] = hueSat(to)
  if (s1 < 15) return 'grayscale(.9)'
  return `hue-rotate(${Math.round(h1 - h0)}deg)`
}

/** 只对和原稿不一样的 token 出规则；`:where` 压到零特异性，逐元素覆盖照样赢。 */
export function h5LabDesignCss(
  base: H5LabDesign,
  next: H5LabDesign,
  tintImages = false,
): string {
  const out: string[] = []
  const rule = (role: string, decl: string) =>
    out.push(`:where([data-h5ds~="${role}"]){${decl} !important}`)
  for (const token of TEXT_TOKENS) if (next[token] !== base[token]) rule(`c-${token}`, `color:${next[token]}`)
  for (const token of BG_TOKENS) if (next[token] !== base[token]) rule(`bg-${token}`, `background-color:${next[token]}`)
  for (const token of BORDER_TOKENS) if (next[token] !== base[token]) rule(`bd-${token}`, `border-color:${next[token]}`)
  if (next.displayFont !== base.displayFont) rule('f-display', `font-family:${next.displayFont}`)
  if (next.bodyFont !== base.bodyFont) rule('f-body', `font-family:${next.bodyFont}`)
  if (next.radius !== base.radius) rule('r-sm', `border-radius:${next.radius}px`)
  if (next.radiusLg !== base.radiusLg) rule('r-lg', `border-radius:${next.radiusLg}px`)
  const filter = tintImages ? imageFilter(base, next) : null
  if (filter) rule('img', `filter:${filter}`)
  return out.join('\n')
}

export function h5LabMergeDesign(base: H5LabDesign, patch: Partial<H5LabDesign>): H5LabDesign {
  return { ...base, ...patch }
}
