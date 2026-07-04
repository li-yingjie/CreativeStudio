/** 单色 SVG 图标（public/icons 素材）：以 CSS mask 渲染，
 *  颜色跟随 currentColor —— 激活/hover 态无需第二套素材。 */
export default function MaskIcon({ url, size = 14 }: { url: string; size?: number }) {
  const mask = `url("${encodeURI(url)}")`
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}
