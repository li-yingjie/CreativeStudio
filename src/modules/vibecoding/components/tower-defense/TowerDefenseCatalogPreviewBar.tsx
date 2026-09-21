import attachCoverGlyph from './catalog-cover-icons/attach.svg'
import coinsCoverGlyph from './catalog-cover-icons/coins.svg'
import downloadCoverGlyph from './catalog-cover-icons/download.svg'
import refreshCoverGlyph from './catalog-cover-icons/refresh.svg'
import compressGlyph from './catalog-detail-icons/compress.svg'
import cropGlyph from './catalog-detail-icons/crop.svg'
import flipGlyph from './catalog-detail-icons/flip.svg'
import infoGlyph from './catalog-detail-icons/info.svg'
import ratioGlyph from './catalog-detail-icons/ratio.svg'
import rotateGlyph from './catalog-detail-icons/rotate.svg'

export const CATALOG_PREVIEW_TOOLS = [
  { id: 'crop', label: '裁剪', src: cropGlyph },
  { id: 'rotate', label: '旋转', src: rotateGlyph },
  { id: 'flip', label: '翻转', src: flipGlyph },
  { id: 'compress', label: '压缩', src: compressGlyph },
  { id: 'ratio', label: '切换为 1:1', src: ratioGlyph },
  { id: 'info', label: '文件信息', src: infoGlyph },
] as const

export const CATALOG_COVER_ACTIONS = [
  { id: 'sprite', label: '生成动态帧', src: coinsCoverGlyph },
  { id: 'regenerate', label: '重新生成', src: refreshCoverGlyph },
  { id: 'attach', label: '添加到会话', src: attachCoverGlyph },
  { id: 'download', label: '下载', src: downloadCoverGlyph },
] as const

export type CatalogPreviewToolId = (typeof CATALOG_PREVIEW_TOOLS)[number]['id']
export type CatalogCoverActionId = (typeof CATALOG_COVER_ACTIONS)[number]['id']

export function CatalogDetailGlyph({ src, size, ink = false }: { src: string; size: number; ink?: boolean }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`block max-w-none ${ink ? 'brightness-0 opacity-55' : ''}`}
      style={{ width: size, height: size }}
    />
  )
}

export function downloadNamedSrc(src: string | undefined, filename: string) {
  if (!src) return
  const link = document.createElement('a')
  link.href = src
  link.download = filename
  link.click()
}

export function CatalogCoverActionBar({
  title,
  variant = 'overlay',
  hide = [],
  disabled,
  onAction,
}: {
  title: string
  variant?: 'overlay' | 'header' | 'toolbar'
  hide?: CatalogCoverActionId[]
  disabled?: Partial<Record<CatalogCoverActionId, boolean>>
  onAction: (id: CatalogCoverActionId) => void
}) {
  const actions = CATALOG_COVER_ACTIONS.filter((action) => !hide.includes(action.id))
  if (variant === 'overlay') {
    return (
      <div data-catalog-cover-actions className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="pointer-events-auto flex items-center gap-1.5">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              aria-label={`${action.label}：${title}`}
              disabled={disabled?.[action.id]}
              onClick={(event) => {
                event.stopPropagation()
                onAction(action.id)
              }}
              className="group/action relative grid size-7 cursor-pointer place-items-center rounded-full bg-white/94 shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:bg-white disabled:cursor-default disabled:opacity-40"
            >
              <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#222] px-2.5 py-1 text-[11px] leading-4 text-white opacity-0 shadow-sm group-hover/action:opacity-100">
                {action.label}
              </span>
              <CatalogDetailGlyph src={action.src} size={16} ink />
            </button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div data-catalog-cover-actions={variant} className="flex items-center gap-1">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          aria-label={`${action.label}：${title}`}
          title={action.label}
          disabled={disabled?.[action.id]}
          onClick={(event) => {
            event.stopPropagation()
            onAction(action.id)
          }}
          className={`grid cursor-pointer place-items-center rounded-full hover:bg-[#f5f7fa] disabled:cursor-default disabled:opacity-40 ${variant === 'header' ? 'size-6' : 'size-6'}`}
        >
          <CatalogDetailGlyph src={action.src} size={14} ink />
        </button>
      ))}
    </div>
  )
}

export function SetCurrentChip({
  current,
  onSet,
}: {
  current: boolean
  onSet: () => void
}) {
  return (
    <button
      type="button"
      data-set-current={current ? 'true' : 'false'}
      aria-pressed={current}
      aria-label="设为当前"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        if (!current) onSet()
      }}
      className={`h-6 cursor-pointer rounded-md border px-1.5 text-[8px] font-medium shadow-sm ${
        current
          ? 'border-black/[0.08] bg-white/94 text-[#161823]/80'
          : 'border-black/[0.08] bg-white/94 text-[#161823]/70 opacity-0 group-hover:opacity-100'
      }`}
    >
      设为当前
    </button>
  )
}

export function CatalogPreviewToolBar({
  orientation = 'horizontal',
  flipped,
  squarePreview,
  showInfo,
  onTool,
}: {
  orientation?: 'horizontal' | 'vertical'
  flipped?: boolean
  squarePreview?: boolean
  showInfo?: boolean
  onTool: (id: CatalogPreviewToolId) => void
}) {
  return (
    <div
      data-catalog-preview-bar={orientation}
      className={`pointer-events-auto flex items-center gap-1 rounded-full border border-[rgba(83,96,143,0.12)] bg-white px-1.5 py-1 shadow-[0_1px_1px_rgba(0,0,0,0.05)] ${orientation === 'vertical' ? 'h-auto w-[34px] flex-col' : 'h-[34px]'}`}
    >
      {CATALOG_PREVIEW_TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          aria-label={tool.label}
          aria-pressed={tool.id === 'flip' ? flipped : tool.id === 'ratio' ? squarePreview : tool.id === 'info' ? showInfo : undefined}
          onClick={() => onTool(tool.id)}
          className="grid size-6 cursor-pointer place-items-center rounded-full hover:bg-[#f5f7fa]"
        >
          <span className="grid size-[14px] place-items-center">
            <CatalogDetailGlyph src={tool.src} size={14} />
          </span>
        </button>
      ))}
    </div>
  )
}

export function CatalogFollowToolBar({
  title,
  flipped,
  squarePreview,
  showInfo,
  disabledCover,
  onCoverAction,
  onTool,
}: {
  title: string
  flipped?: boolean
  squarePreview?: boolean
  showInfo?: boolean
  disabledCover?: Partial<Record<CatalogCoverActionId, boolean>>
  onCoverAction: (id: CatalogCoverActionId) => void
  onTool: (id: CatalogPreviewToolId) => void
}) {
  return (
    <div
      data-catalog-follow-bar
      className="pointer-events-auto flex h-[34px] items-center gap-1 rounded-full border border-[rgba(83,96,143,0.12)] bg-white px-1.5 py-1 shadow-[0_8px_24px_rgba(31,35,41,0.12)]"
    >
      <CatalogCoverActionBar variant="toolbar" title={title} disabled={disabledCover} onAction={onCoverAction} />
      <span className="mx-0.5 h-4 w-px bg-black/[0.08]" />
      {CATALOG_PREVIEW_TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          aria-label={tool.label}
          aria-pressed={tool.id === 'flip' ? flipped : tool.id === 'ratio' ? squarePreview : tool.id === 'info' ? showInfo : undefined}
          onClick={() => onTool(tool.id)}
          className="grid size-6 cursor-pointer place-items-center rounded-full hover:bg-[#f5f7fa]"
        >
          <CatalogDetailGlyph src={tool.src} size={14} />
        </button>
      ))}
    </div>
  )
}

export function applyCatalogPreviewTool(
  id: CatalogPreviewToolId,
  setRotation: (value: (current: number) => number) => void,
  setFlipped: (value: (current: boolean) => boolean) => void,
  setSquarePreview: (value: (current: boolean) => boolean) => void,
  setShowInfo: (value: (current: boolean) => boolean) => void,
) {
  if (id === 'rotate') setRotation((value) => (value + 90) % 360)
  else if (id === 'flip') setFlipped((value) => !value)
  else if (id === 'ratio') setSquarePreview((value) => !value)
  else if (id === 'info') setShowInfo((value) => !value)
}
