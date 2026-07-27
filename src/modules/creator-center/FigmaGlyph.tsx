/** 设计稿导出的单色 SVG 字形：外框固定尺寸,内部按设计 inset 摆放,
 *  CSS mask 着色跟随 currentColor。与 MaskIcon 的区别是保留字形在
 *  图标框内的原始留白(mask contain 会把字形撑满整框)。 */
export default function FigmaGlyph({
  src,
  inset = '0%',
  size = 16,
  className = '',
}: {
  src: string
  /** 字形在图标框内的 CSS inset(来自设计稿),如 '8.33% 12.5%' */
  inset?: string
  size?: number
  className?: string
}) {
  const mask = `url("${encodeURI(src)}")`
  return (
    <span aria-hidden className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span
        className="absolute bg-current"
        style={{
          inset,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      />
    </span>
  )
}
