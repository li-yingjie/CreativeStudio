import type { PublishObjectVisual } from './publish-object-visual'

export default function PublishObjectVisualThumb({
  visual,
  size = 'sm',
}: {
  visual: PublishObjectVisual
  size?: 'sm' | 'lg'
}) {
  const sizeClass = size === 'lg' ? 'h-8 w-8' : 'h-[18px] w-[18px]'
  const roundedClass = visual.rounded === 'full' ? 'rounded-full' : 'rounded-md'

  if (visual.type === 'image') {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-[var(--fill-subtle)] ${sizeClass} ${roundedClass}`}
      >
        <img
          src={visual.src}
          alt={visual.alt}
          className={`h-full w-full ${visual.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
      </div>
    )
  }

  if (visual.type === 'text') {
    return (
      <div
        className={`flex shrink-0 items-center justify-center text-[10px] font-semibold tracking-tight ${sizeClass} ${roundedClass} ${visual.className}`}
        aria-label={visual.alt}
        title={visual.alt}
      >
        {visual.text}
      </div>
    )
  }

  const Icon = visual.icon
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-[var(--fill-subtle)] text-[var(--color-ink)]/70 ${sizeClass} ${roundedClass} ${visual.className ?? ''}`}
      aria-label={visual.alt}
      title={visual.alt}
    >
      <Icon size={size === 'lg' ? 16 : 11} strokeWidth={1.8} />
    </div>
  )
}
