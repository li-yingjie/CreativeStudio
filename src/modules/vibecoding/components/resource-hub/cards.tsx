import type { ReactNode } from 'react'

/**
 * Resource Hub — small, reusable building blocks shared by every tab so the
 * 工具箱 / 知识库 / 模型库 / 发布器 / 触发器 grids stay visually consistent.
 */

/* ── filters ── */

export function Chips({
  options,
  value,
  onChange,
}: {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`inline-flex h-7 items-center rounded-lg px-3 text-[13px] transition-colors ${
              active
                ? 'border border-[var(--divider)] bg-[var(--color-surface-0)] font-semibold text-[var(--color-ink)]'
                : 'text-[var(--color-ink)]/70 hover:bg-[var(--fill-hover)]'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/** Labeled filter row (label on the left, chips trailing) — used by 模型库. */
export function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1 w-16 shrink-0 text-[13px] text-[var(--color-ink)]/55">{label}</span>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        {options.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`text-[13px] transition-colors ${
                active
                  ? 'rounded-md bg-[var(--fill-subtle)] px-2 py-0.5 font-medium text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/65 hover:text-[var(--color-ink)]'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Section header — title + count badge. */
export function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h2>
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[var(--fill-subtle)] px-1.5 text-[11px] font-medium text-[var(--color-ink)]/55">
        {count}
      </span>
    </div>
  )
}

/* ── card shell + banners ── */

export function CardShell({ children }: { children: ReactNode }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[16px] border border-[var(--divider-soft)] bg-[var(--color-surface-0)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(16,18,24,0.18)]">
      {children}
    </div>
  )
}

/** Preview-image banner — used by 工具箱. */
export function ImageBanner({ src }: { src: string }) {
  return (
    <div className="aspect-[16/7] w-full overflow-hidden bg-[var(--fill-subtle)]">
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      />
    </div>
  )
}

/** 抖音 wordmark in a black circle — source glyph in the 工具箱 footer. */
function DouyinMark() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.073 1h-3.804v15.129h-.002a3.173 3.173 0 0 1-3.168 3.06 3.173 3.173 0 0 1-3.17-3.176 3.173 3.173 0 0 1 4.207-3.002V9.103A7.017 7.017 0 0 0 9.1 9.026c-3.852 0-6.974 3.128-6.974 6.987S5.247 23 9.099 23c3.851 0 6.974-3.128 6.974-6.987V8.476a9.053 9.053 0 0 0 5.302 1.705v-3.81a5.307 5.307 0 0 1-5.302-5.313V1Z"
          fill="#fff"
        />
      </svg>
    </span>
  )
}

/** 工具箱 card footer: 抖音官方 · date · usage. */
export function ToolFooter({ source, date, usage }: { source: string; date: string; usage: string }) {
  const divider = <span className="mx-1.5 h-2.5 w-px shrink-0 bg-[var(--divider)]" />
  return (
    <div className="flex items-center text-[12px] text-[var(--color-ink)]/55">
      <DouyinMark />
      <span className="ml-1 truncate">{source}</span>
      {divider}
      <span className="shrink-0">{date}</span>
      {divider}
      <span className="flex shrink-0 items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-60">
          <path d="M8 10a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Zm9 1a1 1 0 1 0-2 0v3a1 1 0 1 0 2 0v-3Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M17 1a1 1 0 0 1 1 1v2h1a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h1V2a1 1 0 0 1 2 0v2h8V2a1 1 0 0 1 1-1ZM5 6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5Z" fill="currentColor" />
        </svg>
        {usage}
      </span>
    </div>
  )
}

/** Plain gradient banner with a centered glyph/icon — 知识库 / 触发器. */
export function GlyphBanner({
  gradient,
  glyph,
  badge,
}: {
  gradient: string
  glyph: ReactNode
  badge?: string
}) {
  return (
    <div
      className="relative flex aspect-[16/8] items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-[20px] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.25)]">
        {glyph}
      </div>
      {badge && (
        <span className="absolute inset-x-0 bottom-0 bg-[var(--color-ink)]/45 py-1 text-center text-[11px] font-medium text-white backdrop-blur-sm">
          {badge}
        </span>
      )}
    </div>
  )
}

/** Wordmark banner for 模型库 (brand text on a soft / dark gradient). */
export function WordmarkBanner({
  gradient,
  wordmark,
  dark,
}: {
  gradient: string
  wordmark: string
  dark?: boolean
}) {
  return (
    <div
      className="flex aspect-[16/7] items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      <span
        className={`text-[20px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-[#1c1f23]'}`}
      >
        {wordmark}
      </span>
    </div>
  )
}

/** Card body: title (+ optional trailing count) and a 2-line description. */
export function CardBody({
  title,
  desc,
  trailing,
}: {
  title: string
  desc: string
  trailing?: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-3.5 pt-3 pb-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-[14px] font-medium text-[var(--color-ink)]">{title}</h3>
        {trailing}
      </div>
      <p className="line-clamp-2 text-[12px] leading-[1.5] text-[var(--color-ink)]/50">{desc}</p>
    </div>
  )
}

/** Count pill (e.g. usage / item count). */
export function CountPill({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-ink)]/45">
      <span className="inline-block h-3 w-3 rounded-[3px] border border-current opacity-60" />
      {value}
    </span>
  )
}
