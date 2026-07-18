import { useRef, useState } from 'react'
import { Loader2, SquareUser, Sparkles, Upload } from '@/shared/icons'

/**
 * 头像选择器 — 三种来源：手填图片地址、真实本地上传（读成 data URL）、
 * 智能生成（在浏览器本地组合抽象 SVG，每次点击换一张）。
 * 不会将分身名称或描述发送给第三方头像服务。
 * 共用于右侧「编辑」面板与「基础信息」表单两处。
 */

const AVATAR_PALETTES = [
  ['#dbeafe', '#7c3aed', '#312e81'],
  ['#ffe4e6', '#e11d48', '#881337'],
  ['#dcfce7', '#059669', '#064e3b'],
  ['#fef3c7', '#d97706', '#78350f'],
  ['#e0e7ff', '#2563eb', '#1e3a8a'],
] as const

function generatedAvatarDataUrl(seed: string): string {
  let hash = 0
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  const [background, accent, ink] = AVATAR_PALETTES[hash % AVATAR_PALETTES.length]
  const eyeOffset = 21 + (hash % 5)
  const mouthY = 61 + (hash % 4)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="24" fill="${background}"/><circle cx="48" cy="43" r="27" fill="${accent}" opacity=".16"/><path d="M18 94c3-22 15-33 30-33s27 11 30 33" fill="${accent}"/><circle cx="${eyeOffset + 10}" cy="43" r="3" fill="${ink}"/><circle cx="${76 - eyeOffset}" cy="43" r="3" fill="${ink}"/><path d="M38 ${mouthY}c7 6 13 6 20 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M25 37c2-19 13-28 25-28 14 0 24 10 25 29-11-9-28-13-50-1Z" fill="${ink}" opacity=".88"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function AvatarPicker({
  value,
  onChange,
  size = 'md',
  showUrlInput = true,
}: {
  value: string
  onChange: (url: string) => void
  /** 为兼容旧调用保留；出于隐私考量，不会发送或编入生成结果。 */
  seedBase?: string
  size?: 'sm' | 'md'
  /** 是否展示「图片地址」输入行（右侧编辑面板里隐藏，只留上传/生成）。 */
  showUrlInput?: boolean
}) {
  const url = String(value || '')
  const fileRef = useRef<HTMLInputElement>(null)
  const genCount = useRef(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const thumb = size === 'sm' ? 'h-14 w-14' : 'h-16 w-16'

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('图片不能超过 5 MB')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
  }

  const onGenerate = () => {
    // 只使用本地随机值，不把人设内容编入 URL 或发往第三方。
    const seed = `${crypto.randomUUID?.() ?? Date.now()}-${genCount.current++}`
    setLoading(true)
    setError('')
    onChange(generatedAvatarDataUrl(seed))
  }

  return (
    <div className={`flex gap-3 ${showUrlInput ? 'items-start' : 'items-center'}`}>
      <div className={`relative shrink-0 ${thumb}`}>
        {url ? (
          <img
            src={url}
            alt=""
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            className="h-full w-full rounded-2xl bg-[var(--fill-subtle)] object-cover ring-1 ring-[var(--divider)]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[var(--fill-subtle)] text-[var(--color-ink)]/30">
            <SquareUser size={20} strokeWidth={1.6} />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 text-white">
            <Loader2 size={18} strokeWidth={2} className="animate-spin" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {showUrlInput && (
          <label className="flex flex-col gap-1">
            <span className="sr-only">图片地址</span>
            <input
              value={url}
              placeholder="图片地址"
              onChange={(e) => onChange(e.target.value)}
              className="min-w-0 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
            />
          </label>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <Upload size={12} strokeWidth={1.8} />
            本地上传
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-2.5 text-[11.5px] text-[var(--color-ink)]/75 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
          >
            <Sparkles size={12} strokeWidth={1.8} />
            AI 生成
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />
        {error && (
          <p role="alert" className="text-[11px] text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
