import type { KeyboardEvent, ReactNode, Ref } from 'react'
import { ArrowUp } from '@/shared/icons'

/** 对话输入框统一高度（各产品 composer 共用）。 */
export const CHAT_COMPOSER_HEIGHT = 114

/** 统一对话输入框：卡片壳 + textarea + 底部工具条（左自定义、右发送）。
 *  高度默认 CHAT_COMPOSER_HEIGHT（可由挂载处覆写）；皮肤（圆角/描边/底色/
 *  阴影）与文字样式由挂载处覆写，结构与交互（Enter 发送、Shift+Enter 换行）
 *  保持一致。 */
export default function ChatComposer({
  value,
  onChange,
  onInputKeyDown,
  onSend,
  placeholder,
  ariaLabel,
  textareaRef,
  attachments,
  inputPrefix,
  inputContent,
  footerLeft,
  footerLeftClassName = '',
  footerExtra,
  className = '',
  skinClassName,
  inputClassName = '',
  sendButtonClassName,
  sendDisabled,
  height = CHAT_COMPOSER_HEIGHT,
}: {
  value: string
  onChange: (v: string) => void
  /** 返回 true 表示按键已由挂载方处理，不再触发默认发送行为。 */
  onInputKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => boolean | void
  onSend: () => void
  placeholder: string
  ariaLabel?: string
  textareaRef?: Ref<HTMLTextAreaElement>
  /** 输入区顶部的附件回显（上传的文档卡等），渲染在 textarea 之上。 */
  attachments?: ReactNode
  /** 与输入内容同行的前置标签（技能、上下文范围等）。 */
  inputPrefix?: ReactNode
  /** 替换默认 textarea 的结构化输入内容（如带槽位的指令模板）。 */
  inputContent?: ReactNode
  /** 底部工具条左侧（添加素材 / 功能 chips …）。 */
  footerLeft?: ReactNode
  /** 左侧工具条的间距与布局覆盖。 */
  footerLeftClassName?: string
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
  /** 卡片总高度，默认 CHAT_COMPOSER_HEIGHT。 */
  height?: number
}) {
  return (
    <div
      style={{ height }}
      className={`flex flex-col p-3 ${
        skinClassName ?? 'rounded-2xl border-[0.5px] border-black/10 bg-white'
      } ${className}`}
    >
      {attachments && <div className="shrink-0 pb-2">{attachments}</div>}
      {inputContent ? (
        <div className="min-h-0 flex-1 overflow-hidden">{inputContent}</div>
      ) : (
        <div className="flex min-h-0 flex-1 items-start gap-1">
          {inputPrefix}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (onInputKeyDown?.(e)) return
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
            placeholder={placeholder}
            aria-label={ariaLabel ?? placeholder}
            className={`min-h-0 flex-1 resize-none bg-transparent outline-none ${inputClassName}`}
          />
        </div>
      )}
      <div className="flex shrink-0 items-center justify-between pt-2">
        <div className={`flex min-w-0 items-center gap-2 ${footerLeftClassName}`}>
          {footerLeft}
        </div>
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
