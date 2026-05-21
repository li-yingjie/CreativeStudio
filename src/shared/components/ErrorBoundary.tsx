import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Catches render errors in its subtree so one broken view (a preview, a panel)
 * can't white-screen the whole app. Renders a small fallback with a retry that
 * resets the boundary; pass a `resetKey` that changes on navigation to clear a
 * stale error automatically (e.g. when the user switches project / tab).
 */
type Props = {
  children: ReactNode
  /** Label shown in the fallback, e.g. "预览". */
  label?: string
  /** When this value changes, a previously-caught error is cleared. */
  resetKey?: unknown
  /** Optional custom fallback. */
  fallback?: ReactNode
}
type State = { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging; in a real app this would go to a logger.
    console.error('[ErrorBoundary]', this.props.label ?? '', error, info.componentStack)
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback
    return (
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-[14px] font-semibold text-[var(--color-ink)]">
          {this.props.label ? `${this.props.label}出错了` : '这里出错了'}
        </div>
        <p className="max-w-[320px] text-[12.5px] leading-5 text-[var(--color-ink)]/55">
          这部分内容渲染失败，应用其它区域仍可使用。可以重试，或切换到其它项目。
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="rounded-full border border-[var(--divider)] bg-[var(--color-surface-0)] px-4 py-1.5 text-[12.5px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
        >
          重试
        </button>
      </div>
    )
  }
}
