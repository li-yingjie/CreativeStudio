import type { ReactNode, Ref } from 'react'
import { ArrowUp } from '@/shared/icons'

/** 对话输入框统一高度（各产品 composer 共用）。 */
export const CHAT_COMPOSER_HEIGHT = 114

/** 统一对话输入框：卡片壳 + textarea + 底部工具条（左自定义、右发送）。
 *  高度固定 CHAT_COMPOSER_HEIGHT；皮肤（圆角/描边/底色/阴影）与文字样式
 *  由挂载处覆写，结构与交互（Enter 发送、Shift+Enter 换行）保持一致。 */
export default function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder,
  ariaLabel,
  textareaRef,
  footerLeft,
  footerExtra,
  className = '',
  skinClassName,
  inputClassName = '',
  sendButtonClassName,
  sendDisabled,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  placeholder: string
  ariaLabel?: string
  textareaRef?: Ref<HTMLTextAreaElement>
  /** 底部工具条左侧（添加素材 / 功能 chips …）。 */
  footerLeft?: ReactNode
  /** 底部工具条右侧、发送按钮之前（如 Auto 选择器）。 */
  footerExtra?: ReactNode
  /** 追加到卡片外层（外边距 / shrink 等，勿放与皮肤冲突的类）。 */
  className?: string
  /** 卡片皮肤，整体替换默认值。 */
  skinClassName?: string
  /** 追加到 textarea（字号 / 行高 / placeholder 色）。 */
  inputClassName?: string
  /** 发送按钮皮肤（尺寸 + 配色），整体替换默认值。 */
  sendButtonClassName?: string
  /** 发送按钮禁用条件，默认输入为空时禁用。 */
  sendDisabled?: boolean
}) {
  return (
    <div
      style={{ height: CHAT_COMPOSER_HEIGHT }}
      className={`flex flex-col p-3 ${
        skinClassName ?? 'rounded-2xl border-[0.5px] border-black/10 bg-white'
      } ${className}`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={`min-h-0 flex-1 resize-none bg-transparent outline-none ${inputClassName}`}
      />
      <div className="flex shrink-0 items-center justify-between pt-2">
        <div className="flex min-w-0 items-center gap-2">{footerLeft}</div>
        <div className="flex shrink-0 items-center gap-2">
          {footerExtra}
          <button
            type="button"
            title="发送"
            aria-label="发送"
            disabled={sendDisabled ?? !value.trim()}
            onClick={onSend}
            className={`flex items-center justify-center rounded-full transition-opacity disabled:opacity-40 ${
              sendButtonClassName ?? 'size-6 bg-[#1c1f23] text-white'
            }`}
          >
            <ArrowUp size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  )
}
