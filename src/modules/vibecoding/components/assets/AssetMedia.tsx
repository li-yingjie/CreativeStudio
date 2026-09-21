import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Download, Maximize2, Minus, Plus, X } from '@/shared/icons'
import type { AssetVisualReference } from '../../assets/assetCatalog'

function downloadName(reference: AssetVisualReference) {
  const sourceName = reference.src.split('/').pop()?.split('?')[0]
  if (sourceName?.includes('.')) return sourceName
  return `${reference.label.replace(/[\\/:*?"<>|]/g, '-').trim() || 'asset'}.png`
}

export function AssetMediaSurface({
  reference,
  onPreview,
  className = '',
  imageClassName = '',
}: {
  reference: AssetVisualReference
  onPreview?: (reference: AssetVisualReference) => void
  className?: string
  imageClassName?: string
}) {
  const image = (
    <img
      src={reference.src}
      alt={onPreview ? '' : reference.label}
      className={`relative size-full object-contain object-center ${imageClassName}`}
    />
  )

  return (
    <div className={`group/media relative isolate overflow-hidden bg-[#F4F5F7] ${className}`}>
      <div aria-hidden className="absolute inset-0 opacity-55 [background-image:linear-gradient(45deg,#E5E7EA_25%,transparent_25%),linear-gradient(-45deg,#E5E7EA_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E5E7EA_75%),linear-gradient(-45deg,transparent_75%,#E5E7EA_75%)] [background-position:0_0,0_7px,7px_-7px,-7px_0] [background-size:14px_14px]" />
      {onPreview ? (
        <button
          type="button"
          onClick={() => onPreview(reference)}
          aria-label={`放大预览：${reference.label}`}
          className="absolute inset-0 z-[1] cursor-zoom-in p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#357EF8]"
        >
          {image}
        </button>
      ) : (
        <div className="absolute inset-0 z-[1] p-3">{image}</div>
      )}

      <div className="absolute right-2.5 top-2.5 z-[3] flex translate-y-[-2px] items-center gap-1 rounded-lg border border-black/10 bg-white/94 p-1 opacity-0 shadow-[0_5px_18px_rgba(22,24,35,0.16)] backdrop-blur-sm transition-[opacity,transform] group-hover/media:translate-y-0 group-hover/media:opacity-100 group-focus-within/media:translate-y-0 group-focus-within/media:opacity-100">
        {onPreview ? (
          <button
            type="button"
            onClick={() => onPreview(reference)}
            className="grid size-7 place-items-center rounded-md text-[#161823]/58 hover:bg-[#F0F1F3] hover:text-[#161823] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#357EF8]/55"
            aria-label={`快速预览：${reference.label}`}
            title="快速预览"
          >
            <Maximize2 className="size-3.5" />
          </button>
        ) : null}
        <a
          href={reference.src}
          download={downloadName(reference)}
          className="grid size-7 place-items-center rounded-md text-[#161823]/58 hover:bg-[#F0F1F3] hover:text-[#161823] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#357EF8]/55"
          aria-label={`下载原图：${reference.label}`}
          title="下载原图"
        >
          <Download className="size-3.5" />
        </a>
      </div>
    </div>
  )
}

export function AssetImageDialog({
  reference,
  onClose,
  returnLabel = '返回资产中心',
}: {
  reference: AssetVisualReference
  onClose: () => void
  returnLabel?: string
}) {
  const [fit, setFit] = useState(true)
  const [scale, setScale] = useState(1)
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const dialogRef = useRef<HTMLDivElement>(null)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const longForm = naturalSize.width > 0 && naturalSize.height / naturalSize.width > 2.4

  useEffect(() => {
    const appRoot = document.getElementById('root')
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden') ?? null
    const rootWasInert = appRoot?.hasAttribute('inert') ?? false

    document.body.style.overflow = 'hidden'
    appRoot?.setAttribute('aria-hidden', 'true')
    appRoot?.setAttribute('inert', '')

    const focusFrame = window.requestAnimationFrame(() => backButtonRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((element) => !element.hasAttribute('disabled'))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousAriaHidden === null) appRoot?.removeAttribute('aria-hidden')
      else appRoot?.setAttribute('aria-hidden', previousAriaHidden)
      if (!rootWasInert) appRoot?.removeAttribute('inert')
      previouslyFocused?.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${reference.label}大图预览`}
      className="fixed inset-0 z-[1000] flex flex-col bg-[#0D0E12]/96 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-[#121318] px-4 text-white sm:px-5">
        <button
          ref={backButtonRef}
          type="button"
          onClick={onClose}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 text-[11px] font-medium text-white/88 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <ArrowLeft className="size-4" />
          {returnLabel}
        </button>
        <div className="min-w-0 flex-1 max-sm:hidden">
          <p className="truncate text-[13px] font-medium">{reference.label}</p>
          <p className="mt-1 truncate text-[9px] text-white/42">{reference.specification}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.06] p-1">
          <button type="button" disabled={!fit && scale <= 0.25} onClick={() => { setFit(false); setScale((value) => Math.max(0.25, value - 0.25)) }} className="grid size-7 place-items-center rounded-md text-white/62 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25" aria-label="缩小预览"><Minus className="size-3.5" /></button>
          <button type="button" aria-pressed={fit} onClick={() => setFit(true)} className={`h-7 rounded-md px-2.5 text-[9px] font-medium ${fit ? 'bg-white text-[#161823]' : 'text-white/62 hover:bg-white/10 hover:text-white'}`}>适应</button>
          <button type="button" aria-pressed={!fit && scale === 1} onClick={() => { setFit(false); setScale(1) }} className={`h-7 min-w-10 rounded-md px-2 text-[9px] font-medium ${!fit && scale === 1 ? 'bg-white text-[#161823]' : 'text-white/62 hover:bg-white/10 hover:text-white'}`}>{fit ? '1:1' : `${Math.round(scale * 100)}%`}</button>
          <button type="button" disabled={!fit && scale >= 2} onClick={() => { setFit(false); setScale((value) => Math.min(2, value + 0.25)) }} className="grid size-7 place-items-center rounded-md text-white/62 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25" aria-label="放大预览"><Plus className="size-3.5" /></button>
        </div>
        <a href={reference.src} download={downloadName(reference)} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-[10px] font-medium text-[#161823] hover:bg-white/90"><Download className="size-3.5" /><span className="max-sm:hidden">下载原图</span></a>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="关闭大图预览"><X className="size-4" /></button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
        <div className={`flex min-h-full min-w-full ${fit && !longForm ? 'items-center' : 'items-start'} justify-center`}>
          <div className="inline-block overflow-hidden bg-white leading-none shadow-[0_18px_70px_rgba(0,0,0,0.5)] [background-image:linear-gradient(45deg,#E3E5E8_25%,transparent_25%),linear-gradient(-45deg,#E3E5E8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#E3E5E8_75%),linear-gradient(-45deg,transparent_75%,#E3E5E8_75%)] [background-position:0_0,0_10px,10px_-10px,-10px_0] [background-size:20px_20px]">
            <img
              src={reference.src}
              alt={reference.label}
              onLoad={(event) => setNaturalSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
              className={`block h-auto object-contain ${fit && !longForm ? 'max-h-[calc(100vh-112px)] max-w-[calc(100vw-48px)]' : 'max-h-none max-w-none'}`}
              style={
                fit && longForm
                  ? { width: 'min(520px, calc(100vw - 48px))' }
                  : !fit && naturalSize.width
                    ? { width: naturalSize.width * scale }
                    : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
