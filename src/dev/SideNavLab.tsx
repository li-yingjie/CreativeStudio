import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import SideNav, {
  SideNavActionButton,
  type SideNavItem,
} from '@/shared/components/SideNav'
import { SIDE_MENU } from '@/modules/creator-center/data'
import { SuibianSideNav } from '@/modules/creator-center/SuibianPage'
import { WikiSideNav } from '@/modules/creator-center/WikiEditorPage'
import { Add01LinearIcon } from 'master-icon/react/Add01LinearIcon'
import { SlideWideAddLinearIcon } from 'master-icon/react/SlideWideAddLinearIcon'
import { FolderCodeLinearIcon } from 'master-icon/react/FolderCodeLinearIcon'
import { InboxLinearIcon } from 'master-icon/react/InboxLinearIcon'
import { FolderLibraryLinearIcon } from 'master-icon/react/FolderLibraryLinearIcon'
import { CircleLinearIcon } from 'master-icon/react/CircleLinearIcon'
import { SquareLinearIcon } from 'master-icon/react/SquareLinearIcon'
import { DiamondLinearIcon } from 'master-icon/react/DiamondLinearIcon'
import { Menu01LinearIcon } from 'master-icon/react/Menu01LinearIcon'
import { LayoutGrid1LinearIcon } from 'master-icon/react/LayoutGrid1LinearIcon'
import { Notebook01LinearIcon } from 'master-icon/react/Notebook01LinearIcon'
import { HistoryLinearIcon } from 'master-icon/react/HistoryLinearIcon'
import { ChangesLinearIcon } from 'master-icon/react/ChangesLinearIcon'
import { Edit01LinearIcon } from 'master-icon/react/Edit01LinearIcon'
import TopNav from '@/modules/creator-center/TopNav'
import type { ProductId } from '@/modules/creator-center/data'
import { Disclosure, FileTreeView } from '@/modules/vibecoding/components/FileTreeView'
import SideNavDisclosureIcon from '@/shared/components/SideNavDisclosureIcon'
import SideNavPanelStateIcon from '@/shared/components/SideNavPanelStateIcon'
import SideNavProductHeader from '@/shared/components/SideNavProductHeader'
import { Settings01LinearIcon } from 'master-icon/react/Settings01LinearIcon'
import {
  SIDE_NAV_NUMERIC_CONSTRAINTS,
  useSideNavConfig,
  type SideNavColorKey,
  type SideNavNumericKey,
} from '@/shared/components/side-nav-config'
import {
  PRODUCT_CATEGORY_BADGES,
  PRODUCT_CATEGORY_ICONS,
  type FileNode,
} from '@/modules/vibecoding/components/ProjectProductView'

/* ─── SideNav 规范 / 调试画布 ───
 *
 * 访问 /sidebar。左侧是带尺寸标注的主组件，右侧平铺各业务场景。
 * 所有产品共用 src/shared/components/SideNav.tsx，只通过 header / footer /
 * children 注入内容；尺寸与配色不要在挂载处覆写。 */

const WORKSHOP_ITEMS: SideNavItem[] = [
  { key: 'Skills', label: 'Skills', Icon: FolderCodeLinearIcon },
  { key: '资源库', label: '资源库', Icon: InboxLinearIcon },
  { key: '项目库', label: '项目库', Icon: FolderLibraryLinearIcon },
]

const AVATAR_ITEMS: SideNavItem[] = [
  { key: 'Skills', label: '技能库', Icon: FolderCodeLinearIcon },
  { key: '资源库', label: '资源库', Icon: InboxLinearIcon },
]

/** 全局布局蓝图里的完整导航与收藏区。 */
const LAYOUT_ITEMS: SideNavItem[] = [
  { key: 'overview', label: '总览', Icon: Menu01LinearIcon },
  { key: 'workspace', label: '工作区', Icon: LayoutGrid1LinearIcon },
  { key: 'knowledge', label: '知识库', Icon: Notebook01LinearIcon },
]

const LAYOUT_FAVORITES = [
  { key: 'favorite-circle', label: '收藏项目 A', Icon: CircleLinearIcon },
  { key: 'favorite-square', label: '收藏项目 B', Icon: SquareLinearIcon },
  { key: 'favorite-diamond', label: '收藏项目 C', Icon: DiamondLinearIcon },
] satisfies Array<SideNavItem & { Icon: NonNullable<SideNavItem['Icon']> }>

type LayoutSelection = {
  area: 'menu' | 'favorite' | 'tree'
  key: string
}

/** 产物树一级 —— 前四项是「模块」（可选中、不展开）；
 *  项目文件是「文件夹」，可展开出真实源码目录。 */
const MODULE_TREE: FileNode[] = [
  { name: '基础信息', type: 'file' },
  { name: '能力配置', type: 'dir', children: [{ name: '智能体', type: 'file' }] },
  { name: '页面配置', type: 'dir', children: [{ name: '首页', type: 'file' }] },
  { name: '数据配置', type: 'file' },
  {
    name: '项目文件',
    type: 'dir',
    children: [
      { name: 'project.config.json', type: 'file' },
      {
        name: 'src',
        type: 'dir',
        children: [
          { name: 'index.tsx', type: 'file' },
          { name: 'store.ts', type: 'file' },
        ],
      },
    ],
  },
]

/** 一级只有「项目文件」是文件夹可展开；更深层回落为普通文件夹。 */
const productCanExpand = (n: FileNode, _p: string, d: number) =>
  d === 1 ? n.name === '项目文件' : undefined

/** 分身一级菜单展开后的产物项；规范画布里统一走图标。 */
const AVATAR_TREE: FileNode[] = [
  { name: '基础信息', type: 'file' },
  { name: '技能库', type: 'dir', children: [{ name: '星座运势解读', type: 'file' }] },
  { name: '知识库', type: 'dir', children: [{ name: '12 星座性格库', type: 'file' }] },
  { name: '触发器', type: 'dir', children: [{ name: '用户关注账号', type: 'file' }] },
]

/** 文件夹树 —— 真实源码目录，可展开、不可选中。 */
const FOLDER_TREE: FileNode[] = [
  { name: 'project.config.json', type: 'file' },
  { name: 'app.tsx', type: 'file' },
  {
    name: 'src',
    type: 'dir',
    children: [
      {
        name: 'pages',
        type: 'dir',
        children: [
          { name: 'index.tsx', type: 'file' },
          { name: 'chat.tsx', type: 'file' },
        ],
      },
      { name: 'store.ts', type: 'file' },
    ],
  },
]

/** 主操作按钮 —— dark（首页发布作品）/ light（工坊 AI 创作），
 *  两者几何完全一致，只有配色不同。 */
function ActionButton({
  variant,
  label,
  collapsed,
  withChevron,
  Icon = Add01LinearIcon,
}: {
  variant?: 'light' | 'dark'
  label: string
  collapsed?: boolean
  withChevron?: boolean
  Icon?: typeof Add01LinearIcon
}) {
  return (
    <div className="px-[var(--sn-px)] pb-3">
      <SideNavActionButton
        aria-label={label}
        variant={variant}
        collapsed={collapsed}
        className={collapsed || !withChevron ? '' : 'justify-between'}
      >
        <span className="flex items-center gap-[var(--sn-rgap)]">
          <Icon size={16} />
          {!collapsed && label}
        </span>
        {!collapsed && withChevron && <SideNavDisclosureIcon className="opacity-70" />}
      </SideNavActionButton>
    </div>
  )
}

/** 顶部产品头 —— 左侧业务文案，右侧收起入口（设计稿 统一导航 583-5262）。
 *  收起入口只有这一处；底部不再放。 */
const PRODUCT_HEADER_HEIGHT = 40

function ProductHeaderRow({ text, collapsed }: { text: string; collapsed?: boolean }) {
  return (
    <div className="px-[var(--sn-px)]">
      <SideNavProductHeader leadingText={text} collapsed={collapsed} onToggle={() => {}} />
    </div>
  )
}

/** 底部业务自定义区 —— 组件本身不规定放什么，各产品自己注入
 *  （工坊/首页放「偏好设置」，百科放「我的词条」…）。 */
function BusinessFooterRow({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className={collapsed ? 'px-[var(--sn-px)] pb-3' : 'pb-3'}>
      <button
        type="button"
        aria-label="偏好设置"
        title={collapsed ? '偏好设置' : undefined}
        className={`flex h-8 w-full items-center gap-1.5 rounded-lg text-[12px] font-medium text-[#252632]/80 transition-colors hover:bg-black/[0.03] ${
          collapsed ? 'justify-center' : 'pl-[22px] pr-2'
        }`}
      >
        <Settings01LinearIcon className="size-4 shrink-0" />
        {!collapsed && '偏好设置'}
      </button>
    </div>
  )
}

/* ─── 配置面板 —— SideNav / 树的属性抽成可编辑配置：
 *   改动实时写入 useSideNavConfig（画布与全应用即时跟随），
 *   「保存」落 localStorage（刷新后仍生效），「重置」回代码默认值。 ─── */

const NUM_FIELDS: Array<{ group: string; items: Array<[SideNavNumericKey, string]> }> = [
  { group: '布局', items: [['width', '宽度'], ['collapsedWidth', '收起宽度'], ['topPadding', '上内边距'], ['listPaddingX', '左右内边距']] },
  { group: '主按钮', items: [['buttonHeight', '高度'], ['buttonRadius', '圆角']] },
  { group: '菜单行', items: [['rowHeight', '行高'], ['rowRadius', '圆角'], ['rowPaddingX', '左右内边距'], ['rowGap', '图标→文字'], ['rowSpacing', '行间距'], ['rowFontSize', '字号'], ['menuIconSize', '图标'], ['subRowHeight', '子菜单行高']] },
  { group: '树', items: [['treeRowHeight', '行高'], ['treeIndent', '每级缩进'], ['treeSlot', '箭头槽'], ['treeGap', '元素间距'], ['treeIconSize', '图标'], ['treeFontSize', '字号'], ['treeBasePl', '基础左边距']] },
]

const COLOR_FIELDS: Array<[SideNavColorKey, string]> = [
  ['bg', '侧栏底色'],
  ['activeBg', '选中底色'],
  ['hoverBg', '悬停底色'],
  ['ink', '选中文字'],
  ['inkDim', '未选中文字'],
  ['iconColor', '图标色'],
]

/** 配置颜色串（hex 或 rgba）⇄ 原生取色器能吃的 #rrggbb + 透明度。 */
function parseColor(v: string): { hex: string; alpha: number } {
  const t = v.trim()
  const m = t.match(/^rgba?\(([^)]+)\)$/i)
  if (m) {
    const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim())
    const toHex = (n: string) =>
      Math.max(0, Math.min(255, Math.round(Number(n)))).toString(16).padStart(2, '0')
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, alpha: Number(a) }
  }
  if (/^#[0-9a-f]{3}$/i.test(t)) {
    const s = t.slice(1)
    return { hex: `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`, alpha: 1 }
  }
  if (/^#[0-9a-f]{6}$/i.test(t)) return { hex: t, alpha: 1 }
  return { hex: '#000000', alpha: 1 }
}

function composeColor(hex: string, alpha: number): string {
  if (alpha >= 1) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${Math.round(alpha * 100) / 100})`
}

function numericFieldLabel(key: SideNavNumericKey): string {
  for (const { group, items } of NUM_FIELDS) {
    const field = items.find(([fieldKey]) => fieldKey === key)
    if (field) return `${group}${field[1]}`
  }
  return key
}

function ConfigNumberInput({
  fieldKey,
  label,
  value,
}: {
  fieldKey: SideNavNumericKey
  label: string
  value: number
}) {
  const patch = useSideNavConfig((s) => s.patch)
  const [fieldState, setFieldState] = useState({ draft: String(value), syncedValue: value })
  const cancelOnBlur = useRef(false)
  const { min, max, step } = SIDE_NAV_NUMERIC_CONSTRAINTS[fieldKey]

  // 外部重置/标注编辑后同步；保留未完成的本地数字草稿，避免逐字输入时被 min 夹断。
  if (fieldState.syncedValue !== value)
    setFieldState({ draft: String(value), syncedValue: value })

  const commit = () => {
    const parsed = fieldState.draft.trim() === '' ? Number.NaN : Number(fieldState.draft)
    const next = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : value
    patch({ [fieldKey]: next })
    setFieldState({ draft: String(next), syncedValue: next })
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      aria-label={label}
      value={fieldState.draft}
      onChange={(e) => {
        const raw = e.currentTarget.value
        const parsed = e.currentTarget.valueAsNumber
        setFieldState({ draft: raw, syncedValue: value })
        if (Number.isFinite(parsed) && parsed >= min && parsed <= max)
          patch({ [fieldKey]: parsed })
      }}
      onBlur={() => {
        if (cancelOnBlur.current) {
          cancelOnBlur.current = false
          setFieldState({ draft: String(value), syncedValue: value })
          return
        }
        commit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          cancelOnBlur.current = true
          setFieldState({ draft: String(value), syncedValue: value })
          e.currentTarget.blur()
        }
      }}
      className="side-nav-config-input w-16 shrink-0 rounded-md border border-black/10 px-1.5 py-0.5 text-right font-mono text-[11px] tabular-nums text-[#161823] outline-none focus:border-[var(--semi-color-focus-border,#0064FA)]"
    />
  )
}

function ConfigPanel({ onCollapse }: { onCollapse: () => void }) {
  const { config, saved, error, patch, save, reset } = useSideNavConfig()
  const dirty = JSON.stringify(config) !== JSON.stringify(saved)
  const status = error ? '保存失败' : dirty ? '未保存' : '已同步'
  const statusColor = error ? '#b42318' : dirty ? '#9a4f00' : 'rgba(37,38,50,0.7)'

  return (
    <aside
      id="side-nav-config-panel"
      aria-label="组件配置"
      className="sticky top-0 flex h-dvh w-96 shrink-0 flex-col border-l border-black/10 bg-white"
    >
      <div className="shrink-0 border-b border-black/5 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-balance text-[14px] font-semibold text-[#161823]">组件配置</h2>
              <span
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="text-[10px]"
                style={{ color: statusColor }}
              >
                {status}
                {error && <span className="sr-only">：{error}</span>}
              </span>
            </div>
            <p className={`mt-1 text-pretty text-[10px] ${error ? 'text-[#b42318]' : 'text-[#252632]/70'}`}>
              {error ?? '修改实时生效；保存后刷新仍保留'}
            </p>
          </div>
          <button
            type="button"
            aria-label="收起组件配置"
            title="收起组件配置"
            aria-controls="side-nav-config-panel"
            aria-expanded="true"
            onClick={onCollapse}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#252632]/65 transition-colors hover:bg-black/[0.05] hover:text-[#161823]"
          >
            <SideNavPanelStateIcon side="right" />
          </button>
        </div>
      </div>

      <div className="thin-scroll-light min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-5">
          {NUM_FIELDS.map(({ group, items }) => (
            <div key={group} className="min-w-0">
              <div className="mb-2 text-[11px] font-medium text-[#252632]/70">{group}</div>
              <div className="flex flex-col gap-1.5">
                {items.map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#252632]/70">{label}</span>
                    <ConfigNumberInput
                      fieldKey={key}
                      label={`${group}${label}`}
                      value={config[key]}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="col-span-2 min-w-0">
            <div className="mb-2 text-[11px] font-medium text-[#252632]/70">树展开箭头</div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#252632]/70">位置</span>
              <div
                role="radiogroup"
                aria-label="树展开箭头位置"
                className="flex rounded-lg bg-black/[0.04] p-0.5"
              >
                {([
                  ['left', '左侧'],
                  ['right', '右侧'],
                ] as const).map(([position, label]) => {
                  const selected = config.treeDisclosurePosition === position
                  return (
                    <button
                      key={position}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => patch({ treeDisclosurePosition: position })}
                      className={`h-7 rounded-md px-3 text-[11px] transition-colors ${
                        selected
                          ? 'bg-white font-medium text-[#161823] shadow-sm'
                          : 'text-[#252632]/60 hover:text-[#161823]'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="col-span-2 min-w-0">
            <div className="mb-2 text-[11px] font-medium text-[#252632]/70">配色</div>
            <div className="flex flex-col gap-1.5">
              {COLOR_FIELDS.map(([key, label]) => {
                const { hex, alpha } = parseColor(config[key] as string)
                return (
                  <div key={key} className="flex items-center gap-2">
                    {/* 原生取色器就是色块本体；透明度单独一个百分比输入 */}
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => patch({ [key]: composeColor(e.target.value, alpha) })}
                      aria-label={`${label}取色`}
                      title={`${label}取色`}
                      className="side-nav-config-input h-6 w-8 shrink-0 cursor-pointer rounded border border-black/10 bg-white p-0.5 outline-none focus:border-[var(--semi-color-focus-border,#0064FA)]"
                    />
                    <span className="flex-1 text-[11px] text-[#252632]/70">{label}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(alpha * 100)}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (Number.isFinite(v))
                          patch({ [key]: composeColor(hex, Math.max(0, Math.min(100, v)) / 100) })
                      }}
                      aria-label={`${label}透明度`}
                      title={`${label}透明度`}
                      className="side-nav-config-input w-12 shrink-0 rounded-md border border-black/10 px-1 py-0.5 text-right font-mono text-[11px] tabular-nums text-[#161823] outline-none focus:border-[var(--semi-color-focus-border,#0064FA)]"
                    />
                    <span className="text-[10px] text-[#252632]/70">%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-black/5 px-5 py-4">
        <button
          type="button"
          onClick={reset}
          className="h-8 rounded-lg px-3 text-[12px] text-[#252632]/70 ring-1 ring-black/10 transition-colors hover:bg-black/[0.03]"
        >
          重置
        </button>
        <button
          type="button"
          disabled={!dirty}
          onClick={save}
          className="h-8 rounded-lg bg-[#1c1f23] px-4 text-[12px] font-medium text-white transition-opacity hover:bg-[#2b2e33] disabled:opacity-30"
        >
          保存
        </button>
      </div>
    </aside>
  )
}

/* ─── 标注件 —— 对齐移动端标注稿的画法：
 *   高度 = 左侧黑 chip + 上下两条贯穿的虚线延长线；
 *   间距/缩进 = 贯穿的半透明色带 + 彩色 chip；
 *   图标 = 虚线框 + 黑 chip；文字属性 = 白底小框 + 虚线引线。
 *   所有位置由运行时配置推导（改配置标注跟着走），带 editKey 的读数
 *   可以点击后就地输入，直接改配置。 ─── */

const LINE = '#4E83FD'
const CHIP_INK = '#1c1f23'
const GAP_GREEN = '#16a34a'
const IND_PINK = '#db2777'

/** 就地编辑的小输入框 —— 提交即写配置。 */
function ChipInput({
  editKey,
  value,
  onDone,
}: {
  editKey: SideNavNumericKey
  value: number
  onDone: (restoreFocus: boolean) => void
}) {
  const patch = useSideNavConfig((s) => s.patch)
  const restoreOnBlur = useRef(false)
  const { min, max, step } = SIDE_NAV_NUMERIC_CONSTRAINTS[editKey]
  return (
    <input
      autoFocus
      type="number"
      min={min}
      max={max}
      step={step}
      aria-label={`编辑${numericFieldLabel(editKey)}`}
      defaultValue={value}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => {
        const v = Number(e.currentTarget.value)
        if (Number.isFinite(v)) patch({ [editKey]: v })
        onDone(restoreOnBlur.current)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          restoreOnBlur.current = true
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          onDone(true)
        }
      }}
      className="side-nav-config-input h-[16px] w-[42px] rounded-[3px] border border-black/40 bg-white px-0.5 text-center font-mono text-[10px] text-[#161823] outline-none"
    />
  )
}

/** 尺寸 chip：深色/彩色小方块 + 白字读数；带 editKey 时点击直改配置。 */
function Chip({ value, bg = CHIP_INK, style, editKey }:
  { value: number; bg?: string; style?: CSSProperties; editKey?: SideNavNumericKey }) {
  const [editing, setEditing] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeEditor = (restoreFocus: boolean) => {
    setEditing(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }
  if (editKey && editing)
    return (
      <span className="absolute z-20" style={style}>
        <ChipInput editKey={editKey} value={value} onDone={closeEditor} />
      </span>
    )

  const className =
    'absolute z-10 whitespace-nowrap rounded-[3px] px-1 font-mono text-[9px] font-semibold leading-[14px] text-white'
  if (!editKey)
    return (
      <span
        aria-hidden
        className={`${className} pointer-events-none`}
        style={{ background: bg, ...style }}
      >
        {value}px
      </span>
    )

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setEditing(true)}
      aria-label={`修改${numericFieldLabel(editKey)}，当前 ${value} 像素`}
      title="点击修改"
      className={`${className} cursor-pointer hover:ring-2 hover:ring-black/25`}
      style={{ background: bg, ...style }}
    >
      {value}px
    </button>
  )
}

/** 高度量：上下两条虚线横贯组件并向左延伸，左侧一条竖向尺寸线把
 *  两条虚线连起来（一眼看出 chip 量的是哪一段），chip 挂在尺寸线上。 */
function HMeasure({ top, height, editKey }:
  { top: number; height: number; editKey?: SideNavNumericKey }) {
  const w = useSideNavConfig((s) => s.config.width)
  return (
    <>
      {/* key 用位置名而不是 y —— 高度为 0（如行间距调到 0）时两条线同 y */}
      {[['t', top], ['b', top + height]].map(([k, y]) => (
        <span
          key={k}
          aria-hidden
          className="pointer-events-none absolute border-t border-dashed border-black/30"
          style={{ top: y, left: -40, width: 40 + w }}
        />
      ))}
      <span
        aria-hidden
        className="pointer-events-none absolute border-l"
        style={{ top, height, left: -24, borderColor: 'rgba(0,0,0,0.5)' }}
      />
      <Chip value={height} editKey={editKey} style={{ top: top + height / 2, left: -28, transform: 'translate(-100%, -50%)' }} />
    </>
  )
}

/** 竖向量（左右边距 / 图标间距 / 缩进）：被量的那段铺半透明色带，
 *  chip 就压在色带上（chipY 选一个不挡内容的行，缺省色带纵向中点）。
 *  缩进用粉色与普通间距（绿）区分。 */
function VMeasure({ left, width, top, height, color = GAP_GREEN, chipY, editKey }:
  { left: number; width: number; top: number; height: number; color?: string; chipY?: number; editKey?: SideNavNumericKey }) {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left, width, top, height, background: color, opacity: 0.18 }}
      />
      <Chip
        value={width}
        bg={color}
        editKey={editKey}
        style={{
          top: chipY ?? top + height / 2,
          left: left + width / 2,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  )
}

/** 图标量：图标外一圈虚线框，chip 默认挂框下方；行左侧有空
 *  （树行的空箭头槽）时用 chipLeft 挂到框左边，不压下一行。 */
function IconMeasure({ left, top, size, chipLeft, editKey }:
  { left: number; top: number; size: number; chipLeft?: boolean; editKey?: SideNavNumericKey }) {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute border border-dashed"
        style={{ left: left - 2, top: top - 2, width: size + 4, height: size + 4, borderColor: CHIP_INK }}
      />
      <Chip
        value={size}
        editKey={editKey}
        style={
          chipLeft
            ? { top: top + size / 2, left: left - 5, transform: 'translate(-100%, -50%)' }
            : { top: top + size + 4, left: left + size / 2, transform: 'translateX(-50%)' }
        }
      />
    </>
  )
}

/** 文字属性说明：白底描边小框收在组件内右侧，虚线引线连到目标 x；
 *  数字可点击就地修改。 */
function Note({ y, fromX, label, value, editKey }:
  { y: number; fromX: number; label: string; value: number; editKey: SideNavNumericKey }) {
  const w = useSideNavConfig((s) => s.config.width)
  const noteReserve = 68
  const [editing, setEditing] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeEditor = (restoreFocus: boolean) => {
    setEditing(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute border-t border-dashed border-black/40"
        style={{ top: y, left: fromX, width: Math.max(0, w - noteReserve - fromX) }}
      />
      <span
        className="absolute z-10 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-[3px] border border-black/30 bg-white px-1.5 font-mono text-[9px] leading-[16px] text-[#1c1f23]"
        style={{ top: y, right: 6 }}
      >
        {label}
        {editing ? (
          <ChipInput editKey={editKey} value={value} onDone={closeEditor} />
        ) : (
          <button
            ref={triggerRef}
            type="button"
            title="点击修改"
            aria-label={`修改${numericFieldLabel(editKey)}，当前 ${value} 像素`}
            onClick={() => setEditing(true)}
            className="cursor-pointer font-semibold"
          >
            {value}px
          </button>
        )}
      </span>
    </>
  )
}

/** 宽度标尺的读数 —— 点击直改宽度。 */
function RulerWidth() {
  const w = useSideNavConfig((s) => s.config.width)
  const [editing, setEditing] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeEditor = (restoreFocus: boolean) => {
    setEditing(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }
  if (editing) return <ChipInput editKey="width" value={w} onDone={closeEditor} />
  return (
    <button
      ref={triggerRef}
      type="button"
      title="点击修改"
      aria-label={`修改${numericFieldLabel('width')}，当前 ${w} 像素`}
      onClick={() => setEditing(true)}
      className="cursor-pointer whitespace-nowrap"
    >
      {w}px
    </button>
  )
}

/** 工坊侧栏的 children —— 项目列表 + 项目行 + 展开出的模块（产物树）。
 *  模块用 showDirChildren=false：可选中、不在左侧展开。 */
function WorkshopTree({ picked, onPick }: { picked: string; onPick: (n: string) => void }) {
  const cfg = useSideNavConfig((s) => s.config)
  // 项目行可展开/收起它的模块列表 —— 与线上工坊一致。
  const [open, setOpen] = useState(true)
  // 「项目文件」是文件夹，自己维护展开路径
  const [dirs, setDirs] = useState<Set<string>>(() => new Set(['__ws__/项目文件']))
  const toggleDir = (p: string) =>
    setDirs((s) => {
      const n = new Set(s)
      if (!n.delete(p)) n.add(p)
      return n
    })
  return (
    <>
      <div className="mt-0 px-[var(--sn-px)] py-1.5 text-[12px] text-[#252632]/70">项目列表</div>
      {/* 项目行（设计稿 249-18701）：箭头 + 名称，不占图标列；
          行高与左边距跟树的配置走，子级按配置的缩进一级级右移。 */}
      <div
        className="mx-[var(--sn-px)] flex items-center rounded-md pr-2 hover:bg-black/[0.03]"
        style={{ minHeight: cfg.treeRowHeight, paddingLeft: cfg.treeBasePl }}
      >
        <Disclosure expanded={open} visible label="塔罗兴趣卡" onToggle={() => setOpen((v) => !v)} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center pl-2.5 text-left font-medium text-[#161823]"
          style={{ fontSize: cfg.treeFontSize }}
        >
          <span className="min-w-0 truncate">塔罗兴趣卡</span>
        </button>
      </div>
      {open && (
        <div className="mx-[var(--sn-px)]">
          <FileTreeView
            nodes={MODULE_TREE}
            expanded={dirs}
            onToggleDir={toggleDir}
            onOpenFile={onPick}
            onOpenDir={(n) => onPick(n.name)}
            showDirChildren={false}
            canExpandDir={productCanExpand}
            roundedRows
            depth={1}
            parentPath="__ws__"
            iconFor={(n) => PRODUCT_CATEGORY_ICONS[n.name]}
            badgeFor={(n, _p, d) => (d === 1 ? PRODUCT_CATEGORY_BADGES[n.name] : undefined)}
            isActive={(n) => n.name === picked}
          />
        </div>
      )}
    </>
  )
}

/** 分身侧栏的 children —— 我的AI分身一级菜单 + 平铺产物项。 */
function AvatarTree({ picked, onPick }: { picked: string; onPick: (n: string) => void }) {
  const cfg = useSideNavConfig((s) => s.config)
  const [open, setOpen] = useState(true)
  return (
    <>
      <div
        className="mx-[var(--sn-px)] flex items-center rounded-md pr-2 hover:bg-black/[0.03]"
        style={{ minHeight: cfg.treeRowHeight, paddingLeft: cfg.treeBasePl }}
      >
        <Disclosure
          expanded={open}
          visible
          label="我的AI分身"
          onToggle={() => setOpen((value) => !value)}
        />
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center pl-2.5 text-left font-medium text-[#161823]"
          style={{ fontSize: cfg.treeFontSize }}
        >
          <span className="min-w-0 truncate">我的AI分身</span>
        </button>
      </div>
      {open && (
        <div className="mx-[var(--sn-px)]">
          <FileTreeView
            nodes={AVATAR_TREE}
            expanded={new Set()}
            onToggleDir={() => {}}
            onOpenFile={onPick}
            onOpenDir={(n) => onPick(n.name)}
            showDirChildren={false}
            roundedRows
            depth={1}
            parentPath="__av__"
            iconFor={(n) => PRODUCT_CATEGORY_ICONS[n.name]}
            badgeFor={(n, _p, d) => (d === 1 ? PRODUCT_CATEGORY_BADGES[n.name] : undefined)}
            isActive={(n) => n.name === picked}
          />
        </div>
      )}
    </>
  )
}

/** 画布上组件的展示高度 —— 主组件与所有场景卡共用这一个值。 */
const CANVAS_H = 600

/** 场景卡片 —— 右侧平铺用；主组件也走它，高度只写这一处。 */
function VariantCard({
  title,
  width,
  children,
}: {
  title: string
  width?: number
  children: ReactNode
}) {
  const liveWidth = useSideNavConfig((s) => s.config.width)
  return (
    <div className="flex flex-col">
      <div className="text-[12.5px] font-medium text-[#161823]">{title}</div>
      <div
        // 卡片 ring 就是外框，组件自己的右描边在框内会叠成两层 —— 关掉
        className="mt-2 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-black/10 [&_aside]:border-r-0"
        style={{ width: width ?? liveWidth, height: CANVAS_H }}
      >
        {children}
      </div>
    </div>
  )
}

/** 全局布局蓝图共用同一套侧栏内容，只改变中间内容与对话列的顺序。 */
function GlobalLayoutSideNav({
  ariaLabel,
  selection,
  onSelect,
}: {
  ariaLabel: string
  selection: LayoutSelection
  onSelect: (selection: LayoutSelection) => void
}) {
  const cfg = useSideNavConfig((s) => s.config)
  return (
    <SideNav
      ariaLabel={ariaLabel}
      items={LAYOUT_ITEMS}
      activeKey={selection.area === 'menu' ? selection.key : null}
      onSelect={(key) => onSelect({ area: 'menu', key })}
      header={
        <>
          <ProductHeaderRow text="开启创作" />
          <ActionButton label="主操作" />
        </>
      }
      footer={<BusinessFooterRow />}
    >
      <div className="mt-2 flex flex-col">
        <div className="px-[var(--sn-px)] pb-1 text-[11px] text-[#252632]/70">我的收藏</div>
        <div className="flex flex-col gap-[var(--sn-rsp)] px-[var(--sn-px)]">
          {LAYOUT_FAVORITES.map((favorite) => (
            <button
              key={favorite.key}
              type="button"
              onClick={() => onSelect({ area: 'favorite', key: favorite.key })}
              className={`flex h-[var(--sn-rh)] w-full items-center gap-[var(--sn-rgap)] rounded-[var(--sn-rr)] px-[var(--sn-rpx)] text-[length:var(--sn-rfs)] font-medium transition-colors ${
                selection.area === 'favorite' && selection.key === favorite.key
                  ? 'bg-[var(--sidenav-active)] text-[var(--sidenav-ink)]'
                  : 'text-[var(--sidenav-ink-dim)] hover:bg-[var(--sidenav-hover)]'
              }`}
            >
              <favorite.Icon
                size={cfg.menuIconSize}
                className="shrink-0 text-[var(--sidenav-icon)]"
              />
              <span className="truncate">{favorite.label}</span>
            </button>
          ))}
        </div>
        <WorkshopTree
          picked={selection.area === 'tree' ? selection.key : ''}
          onPick={(key) => onSelect({ area: 'tree', key })}
        />
      </div>
    </SideNav>
  )
}

/** 440px 对话列在两种全局布局里完全复用，仅切换分隔线方向。 */
function GlobalLayoutChat({ side }: { side: 'left' | 'right' }) {
  return (
    <section
      aria-label={side === 'left' ? '左侧对话栏' : '右侧对话栏'}
      className={`flex w-[440px] shrink-0 flex-col ${
        side === 'left' ? 'border-r' : 'border-l'
      } border-black/[0.06]`}
    >
      <div className="flex h-10 shrink-0 items-center justify-between px-2">
        <span className="rounded-md px-2 py-1 text-[13px] font-medium text-[#161823] ring-1 ring-black/10">
          对话
        </span>
        <span className="font-mono text-[10px] text-[#252632]/40">Header 40</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
        <div className="ml-auto flex h-[42px] max-w-[75%] items-center rounded-xl bg-black/[0.05] px-3 text-[14px] text-[#161823]">
          用户气泡 高 42 · 字 14
        </div>
        <span className="text-[12px] text-[#252632]/45">已思考 25s ›</span>
        <span className="text-[13px] text-[#161823]">AI 消息撑满列宽</span>
        <div className="h-[22px] w-[240px] rounded bg-black/[0.06]" />
        <div className="h-[196px] w-full rounded-lg bg-black/[0.06]" />
      </div>
      <div className="shrink-0 px-4 pb-4">
        <div className="flex h-[120px] flex-col rounded-xl bg-black/[0.04] p-3 ring-1 ring-black/[0.06]">
          <span className="text-[12px] text-[#252632]/50">
            Composer 120 · 左右内边距 16
          </span>
        </div>
      </div>
    </section>
  )
}

/** 内容列保留一级视图栏；右侧对话样式按参考稿默认不展示对象工具条。 */
function GlobalLayoutContent({ showObjectToolbar }: { showObjectToolbar: boolean }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col" aria-label="内容区">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-black/[0.06] px-3">
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-[#252632]/55">预览</span>
          <span className="rounded-md bg-black/[0.05] px-2 py-1 font-medium text-[#161823]">
            视图名称
          </span>
          <span className="text-[#252632]/35">+</span>
        </div>
        <span className="rounded-lg bg-[#1c1f23] px-3 py-1 text-[12px] font-medium text-white">
          发布
        </span>
      </div>
      {showObjectToolbar && (
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-black/[0.06] px-3">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="rounded-md bg-black/[0.05] px-2 py-1 font-medium text-[#161823]">
              对象 1
            </span>
            <span className="text-[#252632]/55">对象 2</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[
              { label: '版本记录', Icon: HistoryLinearIcon },
              { label: '查看 Diff', Icon: ChangesLinearIcon },
              { label: '编辑', Icon: Edit01LinearIcon },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                title={label}
                className="flex size-7 items-center justify-center rounded-md text-[#252632]/55 transition-colors hover:bg-black/[0.05] hover:text-[#161823]"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="min-h-0 flex-1 p-4">
        <div className="flex h-full items-center justify-center rounded-lg bg-black/[0.06]">
          <span className="font-mono text-[11px] text-[#252632]/45">
            内容区 自适应（1440 下 780）· 四周内边距 16
          </span>
        </div>
      </div>
    </section>
  )
}

function GlobalLayoutBlueprint({
  title,
  badge,
  chatSide,
  activeNav,
  onSelectNav,
  sidebar,
}: {
  title: string
  badge: string
  chatSide: 'left' | 'right'
  activeNav: ProductId
  onSelectNav: (product: ProductId) => void
  sidebar: ReactNode
}) {
  return (
    <section className="flex flex-col" aria-label={title}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#161823]">{title}</span>
        <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium text-[#252632]/55">
          {badge}
        </span>
      </div>
      <div
        className="flex min-w-max flex-col overflow-hidden rounded-lg bg-white ring-1 ring-black/10"
        style={{ width: 1440, height: 900 }}
      >
        <TopNav active={activeNav} onSelect={onSelectNav} />
        <div className="flex min-h-0 flex-1">
          {sidebar}
          {chatSide === 'left' ? (
            <>
              <GlobalLayoutChat side="left" />
              <GlobalLayoutContent showObjectToolbar />
            </>
          ) : (
            <>
              <GlobalLayoutContent showObjectToolbar={false} />
              <GlobalLayoutChat side="right" />
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function SideNavLab() {
  const [configPanelOpen, setConfigPanelOpen] = useState(false)
  const [specSelection, setSpecSelection] = useState<{
    area: 'menu' | 'tree'
    key: string
  }>({ area: 'tree', key: '能力配置' })
  const [homeActive, setHomeActive] = useState('content')
  const [shopSelection, setShopSelection] = useState<{
    area: 'menu' | 'tree'
    key: string
  }>({ area: 'menu', key: 'Skills' })
  const [avatarSelection, setAvatarSelection] = useState<{
    area: 'menu' | 'tree'
    key: string
  }>({ area: 'menu', key: 'Skills' })
  const [railActive, setRailActive] = useState('datacenter')
  const [layoutNav, setLayoutNav] = useState<ProductId>('workshop')
  const [wikiLayoutNav, setWikiLayoutNav] = useState<ProductId>('wiki')
  const [layoutSelection, setLayoutSelection] = useState<LayoutSelection>({
    area: 'menu',
    key: 'overview',
  })
  const [folderExpanded, setFolderExpanded] = useState<Set<string>>(
    // 两棵文件夹树的 parentPath 不同（'' 与 '__f__'），两套 key 都放进来
    () => new Set(['src', 'src/pages', '__f__/src', '__f__/src/pages']),
  )
  const [pickedModule, setPickedModule] = useState('能力配置')
  const [moduleDirs, setModuleDirs] = useState<Set<string>>(() => new Set(['__m__/项目文件']))
  const [pickedFile, setPickedFile] = useState('')
  const [wikiDoc, setWikiDoc] = useState('未命名设定')
  // 面板改配置时，标注读数与规格表实时跟随
  const liveCfg = useSideNavConfig((s) => s.config)
  // 主组件标注的几何 —— 全部由配置推导：改配置，标注跟着组件一起动。
  // 常量 12/30 分别是主按钮外壳的 pb-3、「项目列表」小标题高。
  // 菜单到项目列表已无额外间距。
  const g = (() => {
    const c = liveCfg
    const navTop = c.topPadding + PRODUCT_HEADER_HEIGHT + c.buttonHeight + 12
    const menuRow = (i: number) => navTop + i * (c.rowHeight + c.rowSpacing)
    const projTop = menuRow(2) + c.rowHeight + 30
    const treeRow = (i: number) => projTop + c.treeRowHeight + i * c.treeRowHeight
    const menuIconX = c.listPaddingX + c.rowPaddingX
    const menuTextX = menuIconX + c.menuIconSize + c.rowGap
    const treeArrowX = (d: number) => c.listPaddingX + c.treeBasePl + d * c.treeIndent
    const treeIconX =
      treeArrowX(1) +
      (c.treeDisclosurePosition === 'left' ? c.treeSlot + c.treeGap : 0)
    const treeTextX = treeIconX + c.treeIconSize + c.treeGap
    return { menuRow, treeRow, menuIconX, menuTextX, treeArrowX, treeIconX, treeTextX }
  })()

  return (
    <div className="flex min-h-dvh bg-white font-[var(--font-sans)]">
      <main className="min-w-0 flex-1 px-8 py-10">
        <h1 className="text-balance text-[22px] font-bold text-[#161823]">SideNav 规范画布</h1>
        <p className="mt-2 text-pretty text-[13px] leading-relaxed text-[#252632]/60">
        组件源码 <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[12px]">src/shared/components/SideNav.tsx</code>
        ，统一宽度 {liveCfg.width}px。所有产品共用同一组件，
        <b className="font-medium text-[#161823]">只通过 header / footer / children 注入内容</b>
        ；尺寸与配色不要在挂载处覆写。
        </p>

      {/* ── 画布一：SideNav，主组件 + 4 个场景并排 ── */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-[#f7f7f8] p-10 ring-1 ring-black/[0.08]">
        <div className="flex min-w-max items-start gap-8">
          {/* 主组件：量度直接画在元素上（F12 高亮盒），右侧只留一点数字位 */}
          <div className="shrink-0" style={{ width: liveCfg.width + 84 }}>
            <div className="text-[12.5px] font-medium text-[#161823]">主组件 · 尺寸标注（以 AI 工坊为例）</div>

            <div className="relative ml-[84px] mt-2" style={{ width: liveCfg.width }}>
              <div className="overflow-hidden rounded-lg ring-1 ring-black/10 [&_aside]:border-r-0" style={{ height: CANVAS_H }}>
                <SideNav
                  ariaLabel="规范标注示例"
                  items={WORKSHOP_ITEMS}
                  activeKey={specSelection.area === 'menu' ? specSelection.key : null}
                  onSelect={(key) => setSpecSelection({ area: 'menu', key })}
                  header={
                    <>
                      <ProductHeaderRow text="开启创作" />
                      <ActionButton label="AI 创作" />
                    </>
                  }
                  footer={<BusinessFooterRow />}
                >
                  <WorkshopTree
                    picked={specSelection.area === 'tree' ? specSelection.key : ''}
                    onPick={(key) => setSpecSelection({ area: 'tree', key })}
                  />
                </SideNav>
              </div>

              {/* 位置全部由配置推导（g.*），改配置时标注跟着组件一起动；
                  每个读数都可点击就地修改。高度：上内边距 / 主按钮 / 菜单行 /
                  行间距 / 树行 —— 一个尺寸只标一次 */}
              <HMeasure top={0} height={liveCfg.topPadding} editKey="topPadding" />
              {/* 产品头是固定 40px 行（文案 + 收起），不进配置。 */}
              <HMeasure top={liveCfg.topPadding} height={PRODUCT_HEADER_HEIGHT} />
              <HMeasure
                top={liveCfg.topPadding + PRODUCT_HEADER_HEIGHT}
                height={liveCfg.buttonHeight}
                editKey="buttonHeight"
              />
              <HMeasure top={g.menuRow(0)} height={liveCfg.rowHeight} editKey="rowHeight" />
              <HMeasure top={g.menuRow(0) + liveCfg.rowHeight} height={liveCfg.rowSpacing} editKey="rowSpacing" />
              <HMeasure top={g.treeRow(0)} height={liveCfg.treeRowHeight} editKey="treeRowHeight" />
              {/* 图标→文字：绿色竖带 */}
              <VMeasure left={g.menuIconX + liveCfg.menuIconSize} width={liveCfg.rowGap} top={g.menuRow(1)} height={2 * liveCfg.rowHeight + liveCfg.rowSpacing} chipY={g.menuRow(2) + liveCfg.rowHeight / 2} editKey="rowGap" />
              {/* 缩进：粉色竖带，一级（项目→模块）与二级（项目文件→子级）各标一次 */}
              <VMeasure left={g.treeArrowX(0)} width={liveCfg.treeIndent} top={g.treeRow(1)} height={4 * liveCfg.treeRowHeight} color={IND_PINK} chipY={g.treeRow(1) + liveCfg.treeRowHeight / 2} editKey="treeIndent" />
              <VMeasure left={g.treeArrowX(1)} width={liveCfg.treeIndent} top={g.treeRow(5)} height={2 * liveCfg.treeRowHeight} color={IND_PINK} chipY={g.treeRow(5) + liveCfg.treeRowHeight / 2} editKey="treeIndent" />
              {/* 图标本尺寸：虚线框（菜单 / 树） */}
              <IconMeasure left={g.menuIconX} top={g.menuRow(1) + (liveCfg.rowHeight - liveCfg.menuIconSize) / 2} size={liveCfg.menuIconSize} editKey="menuIconSize" />
              <IconMeasure left={g.treeIconX} top={g.treeRow(0) + (liveCfg.treeRowHeight - liveCfg.treeIconSize) / 2} size={liveCfg.treeIconSize} chipLeft editKey="treeIconSize" />
              {/* 字号：白框 + 虚线引线，数字可点改 */}
              <Note y={g.menuRow(2) + liveCfg.rowHeight / 2} fromX={g.menuTextX + 3 * liveCfg.rowFontSize + 6} label="字号" value={liveCfg.rowFontSize} editKey="rowFontSize" />
              <Note y={g.treeRow(0) + liveCfg.treeRowHeight / 2} fromX={g.treeTextX + 4 * liveCfg.treeFontSize + 6} label="字号" value={liveCfg.treeFontSize} editKey="treeFontSize" />

              {/* 宽度标尺放到底部，让主组件上沿与右侧场景卡对齐。 */}
              <div
                className="mt-3 flex items-center gap-1 text-[11px] font-medium"
                style={{ width: liveCfg.width, color: LINE }}
              >
                <span className="h-2 w-px" style={{ background: LINE }} />
                <span className="h-px flex-1" style={{ background: LINE }} />
                <RulerWidth />
                <span className="h-px flex-1" style={{ background: LINE }} />
                <span className="h-2 w-px" style={{ background: LINE }} />
              </div>
            </div>
          </div>

          {/* 4 个业务场景，与主组件并排 */}
          <VariantCard title="创作者中心">
              <SideNav
                ariaLabel="创作者中心侧栏"
                items={SIDE_MENU as SideNavItem[]}
                activeKey={homeActive}
                onSelect={setHomeActive}
                /* 首页没有产品头（不提供收起、无业务文案），底部也不挂东西。 */
                header={
                  <ActionButton
                    variant="dark"
                    label="发布作品"
                    withChevron
                    Icon={SlideWideAddLinearIcon}
                  />
                }
              />
            </VariantCard>

            <VariantCard title="AI 工坊">
              <SideNav
                ariaLabel="AI 工坊侧栏"
                items={WORKSHOP_ITEMS}
                activeKey={shopSelection.area === 'menu' ? shopSelection.key : null}
                onSelect={(key) => setShopSelection({ area: 'menu', key })}
                header={
                  <>
                    <ProductHeaderRow text="开启创作" />
                    <ActionButton label="AI 创作" />
                  </>
                }
                footer={<BusinessFooterRow />}
              >
                <WorkshopTree
                  picked={shopSelection.area === 'tree' ? shopSelection.key : ''}
                  onPick={(key) => setShopSelection({ area: 'tree', key })}
                />
              </SideNav>
            </VariantCard>

            <VariantCard title="AI 分身">
              <SideNav
                ariaLabel="AI 分身侧栏"
                items={AVATAR_ITEMS}
                activeKey={avatarSelection.area === 'menu' ? avatarSelection.key : null}
                onSelect={(key) => setAvatarSelection({ area: 'menu', key })}
                header={<ProductHeaderRow text="管理分身" />}
                footer={<BusinessFooterRow />}
              >
                <AvatarTree
                  picked={avatarSelection.area === 'tree' ? avatarSelection.key : ''}
                  onPick={(key) => setAvatarSelection({ area: 'tree', key })}
                />
              </SideNav>
            </VariantCard>

            {/* 世界书目录与页面同一份组件；树几何走 FileTreeView 的
                Disclosure / 缩进常量。 */}
            <VariantCard title="百科世界书">
              <div className="flex h-full">
                <WikiSideNav activeDoc={wikiDoc} onPickDoc={setWikiDoc} />
              </div>
            </VariantCard>

            {/* 随变没走 SideNav —— 它是缩略图列表，不是菜单。放进来是为了
                对齐可共享的部分：统一配置宽度 + 可拖拽 + 同一条顶部产品头。 */}
            <VariantCard title="随变">
              <div className="flex h-full">
                <SuibianSideNav />
              </div>
            </VariantCard>

          <VariantCard title="收起态 icon rail" width={liveCfg.collapsedWidth}>
            <SideNav
              ariaLabel="收起态"
              collapsed
              items={SIDE_MENU as SideNavItem[]}
              activeKey={railActive}
              onSelect={setRailActive}
              header={
                <>
                  <ProductHeaderRow text="开启创作" collapsed />
                  <ActionButton
                    variant="dark"
                    label="发布作品"
                    collapsed
                    Icon={SlideWideAddLinearIcon}
                  />
                </>
              }
              footer={<BusinessFooterRow collapsed />}
            />
          </VariantCard>
        </div>
      </div>

      {/* ── 画布二：树组件 ── */}
      <h2 className="mt-12 text-[18px] font-bold text-[#161823]">FileTreeView 树组件</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#252632]/60">
        组件源码 <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[12px]">src/modules/vibecoding/components/FileTreeView.tsx</code>
        。macOS Finder 风格：<b className="font-medium text-[#161823]">层级只靠缩进 + 披露箭头表达，不画连接线</b>。
        四级分类里，<b className="font-medium text-[#161823]">模块</b>只「选中查看」（<code className="font-mono text-[11px]">showDirChildren=false</code>，无箭头、点击开页签），
        <b className="font-medium text-[#161823]">文件夹</b>只展开不可选中，<b className="font-medium text-[#161823]">文件</b>是叶子。
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-[#f7f7f8] p-10 ring-1 ring-black/[0.08]">
        <div className="flex min-w-max items-start gap-8">
          {/* 主：带标注的文件夹树 */}
          <div className="w-[320px] shrink-0">
            <div className="text-[12.5px] font-medium text-[#161823]">文件夹树 · 尺寸标注</div>
            <div className="relative ml-[84px] mt-2 rounded-lg bg-white py-2 ring-1 ring-black/10" style={{ width: liveCfg.width }}>
              <FileTreeView
                nodes={FOLDER_TREE}
                expanded={folderExpanded}
                onToggleDir={(p) =>
                  setFolderExpanded((s) => {
                    const n = new Set(s)
                    if (!n.delete(p)) n.add(p)
                    return n
                  })
                }
                onOpenFile={() => {}}
                depth={0}
                parentPath=""
              />
              {/* 行高 / 左边距 / 每级缩进（图标已在上方主组件标过），
                  位置由配置推导，读数可点改 */}
              <HMeasure top={8} height={liveCfg.treeRowHeight} editKey="treeRowHeight" />
              <VMeasure left={0} width={liveCfg.treeBasePl} top={8 + liveCfg.treeRowHeight} height={liveCfg.treeRowHeight} editKey="treeBasePl" />
              <VMeasure left={liveCfg.treeBasePl} width={liveCfg.treeIndent} top={8 + 3 * liveCfg.treeRowHeight} height={2 * liveCfg.treeRowHeight} color={IND_PINK} editKey="treeIndent" />
            </div>
          </div>

          {/* 模块列表（产物树） */}
          <VariantCard title="模块（产物树）">
            <div className="px-3 py-2">
              <FileTreeView
                nodes={MODULE_TREE}
                expanded={moduleDirs}
                onToggleDir={(p) =>
                  setModuleDirs((s) => {
                    const n = new Set(s)
                    if (!n.delete(p)) n.add(p)
                    return n
                  })
                }
                onOpenFile={setPickedModule}
                onOpenDir={(n) => setPickedModule(n.name)}
                showDirChildren={false}
                canExpandDir={(n, _p, d) => (d === 0 ? n.name === '项目文件' : undefined)}
                roundedRows
                depth={0}
                parentPath="__m__"
                iconFor={(n) => PRODUCT_CATEGORY_ICONS[n.name]}
                badgeFor={(n, _p, d) => (d === 0 ? PRODUCT_CATEGORY_BADGES[n.name] : undefined)}
                isActive={(n) => n.name === pickedModule}
              />
            </div>
          </VariantCard>

          {/* 文件夹树（项目文件） */}
          <VariantCard title="文件夹（项目文件）">
            <div className="px-3 py-2">
              <FileTreeView
                nodes={FOLDER_TREE}
                expanded={folderExpanded}
                onToggleDir={(p) =>
                  setFolderExpanded((s) => {
                    const n = new Set(s)
                    if (!n.delete(p)) n.add(p)
                    return n
                  })
                }
                onOpenFile={(_name, path) => setPickedFile(path)}
                roundedRows
                depth={0}
                parentPath="__f__"
                isActive={(_node, path) => path === pickedFile}
              />
            </div>
          </VariantCard>
        </div>
      </div>

      {/* ── 画布三：全局整体布局（统一导航 321-41651，1440×900 基准） ── */}
      <h2 className="mt-12 text-[18px] font-bold text-[#161823]">全局整体布局</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#252632]/60">
        1440×900 基准。两种排列共用线上顶部导航、{liveCfg.width}px 侧栏、440px
        对话列与自适应内容区；右侧对话样式默认省略对象工具条。
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-[#f7f7f8] p-10 ring-1 ring-black/[0.08]">
        <div className="flex min-w-max flex-col gap-10">
          <GlobalLayoutBlueprint
            title="样式一｜左侧对话 · 右侧内容"
            badge="现有"
            chatSide="left"
            activeNav={layoutNav}
            onSelectNav={setLayoutNav}
            sidebar={
              <GlobalLayoutSideNav
                ariaLabel="样式一侧栏"
                selection={layoutSelection}
                onSelect={setLayoutSelection}
              />
            }
          />
          <GlobalLayoutBlueprint
            title="样式二｜左侧内容 · 右侧对话"
            badge="百科示例"
            chatSide="right"
            activeNav={wikiLayoutNav}
            onSelectNav={setWikiLayoutNav}
            sidebar={<WikiSideNav activeDoc={wikiDoc} onPickDoc={setWikiDoc} />}
          />
        </div>
      </div>
      </main>
      {configPanelOpen ? (
        <ConfigPanel onCollapse={() => setConfigPanelOpen(false)} />
      ) : (
        <button
          type="button"
          aria-label="展开组件配置"
          title="展开组件配置"
          aria-controls="side-nav-config-panel"
          aria-expanded="false"
          onClick={() => setConfigPanelOpen(true)}
          className="fixed right-4 top-4 z-50 flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-[12px] font-medium text-[#161823] shadow-[0_8px_28px_rgba(0,0,0,0.14)] ring-1 ring-black/10 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(0,0,0,0.18)]"
        >
          <SideNavPanelStateIcon side="right" collapsed />
          组件配置
        </button>
      )}
    </div>
  )
}
