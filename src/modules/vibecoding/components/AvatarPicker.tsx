import { useRef, useState } from 'react'
import { Loader2, SquareUser, Sparkles, Upload } from '@/shared/icons'

/**
 * 头像选择器 — 三种来源：手填图片地址、真实本地上传（读成 data URL）、
 * AI 生成（按分身名称/描述当 seed 调免费头像服务 DiceBear 出图，每次点击
 * 换一张）。Kimi 无文生图能力，故 AI 生成走 seed 头像服务而非真·文生图。
 * 共用于右侧「编辑」面板与「基础信息」表单两处。
 */

const DICEBEAR_STYLE = 'adventurer'
const DICEBEAR_BG = 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,d1f4e0'

function dicebearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(
    seed,
  )}&backgroundColor=${DICEBEAR_BG}`
}

export default function AvatarPicker({
  value,
  onChange,
  seedBase,
  size = 'md',
  showUrlInput = true,
}: {
  value: string
  onChange: (url: string) => void
  /** 用作 AI 生成的 seed 基底（分身名称 / 描述），让头像贴合人设。 */
  seedBase?: string
  size?: 'sm' | 'md'
  /** 是否展示「图片地址」输入行（右侧编辑面板里隐藏，只留上传/生成）。 */
  showUrlInput?: boolean
}) {
  const url = String(value || '')
  const fileRef = useRef<HTMLInputElement>(null)
  const genCount = useRef(0)
  const [loading, setLoading] = useState(false)

  const thumb = size === 'sm' ? 'h-14 w-14' : 'h-16 w-16'

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
  }

  const onGenerate = () => {
    const base = (seedBase || '').trim() || 'ai-avatar'
    // 每次点击换一张：name/desc 当基底 + 自增计数。
    const seed = `${base}-${genCount.current++}`
    setLoading(true)
    onChange(dicebearUrl(seed))
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
          <input
            value={url}
            placeholder="图片地址"
            onChange={(e) => onChange(e.target.value)}
            className="min-w-0 rounded-md border border-[var(--divider)] bg-[var(--color-surface-0)] px-3 py-2 text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-ink)]/40"
          />
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
      </div>
    </div>
  )
}
