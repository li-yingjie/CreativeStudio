import { useEffect, useMemo, useRef, useState } from 'react'
import { FileCode2, FileText } from 'lucide-react'

/**
 * Garuda 代码视图
 *
 * 左侧固定文件列表，右侧抓 /public/garuda/<file> 直接显示真实代码。
 * 大文件 (garuda.js 5090 行) 在客户端做按需 fetch + 首屏只渲染前
 * MAX_PREVIEW_LINES 行，剩余通过一个「显示全部」按钮展开；避免一次性
 * 注入 5k+ DOM 节点拖慢标签切换。
 */

const FILES = [
  { path: 'index.html', label: 'index.html', lang: 'html', size: '64 KB' },
  { path: 'garuda.js', label: 'garuda.js', lang: 'javascript', size: '184 KB' },
  { path: 'jsfxr.js', label: 'jsfxr.js', lang: 'javascript', size: '15 KB' },
  { path: 'sw.js', label: 'sw.js', lang: 'javascript', size: '2 KB' },
  { path: 'README.md', label: 'README.md', lang: 'markdown', size: '5 KB' },
  { path: 'WEB_RELEASE.md', label: 'WEB_RELEASE.md', lang: 'markdown', size: '2 KB' },
] as const

type FilePath = (typeof FILES)[number]['path']

const MAX_PREVIEW_LINES = 400

export default function GarudaCodeView() {
  const [active, setActive] = useState<FilePath>('garuda.js')
  const [cache, setCache] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch on tab change; cached so flipping back is instant.
  useEffect(() => {
    if (cache[active] !== undefined) return
    let cancelled = false
    setLoading(true)
    fetch(`/garuda/${active}`)
      .then((r) => r.text())
      .then((txt) => {
        if (!cancelled) setCache((c) => ({ ...c, [active]: txt }))
      })
      .catch(() => {
        if (!cancelled) setCache((c) => ({ ...c, [active]: '[加载失败]' }))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [active, cache])

  // Reset scroll to top when switching files.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [active])

  const meta = FILES.find((f) => f.path === active)!
  const fullText = cache[active] ?? ''
  const allLines = useMemo(() => fullText.split('\n'), [fullText])
  const isExpanded = expanded[active] ?? false
  const visibleLines = isExpanded ? allLines : allLines.slice(0, MAX_PREVIEW_LINES)
  const truncated = !isExpanded && allLines.length > MAX_PREVIEW_LINES

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[var(--color-surface-0)]">
      {/* ── Left: file list ── */}
      <aside className="thin-scroll flex w-[220px] shrink-0 flex-col overflow-y-auto border-r border-[var(--divider-soft)] py-2">
        <div className="px-3 pb-1.5 text-[10.5px] font-mono uppercase tracking-[0.14em] text-[var(--color-ink)]/40">
          源文件
        </div>
        {FILES.map((f) => {
          const Icon = f.lang === 'markdown' ? FileText : FileCode2
          const isActive = f.path === active
          return (
            <button
              key={f.path}
              type="button"
              onClick={() => setActive(f.path)}
              className={`flex items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors ${
                isActive
                  ? 'bg-[var(--color-ink)]/[0.06] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/65 hover:bg-[var(--fill-subtle)] hover:text-[var(--color-ink)]/85'
              }`}
            >
              <Icon
                size={13}
                strokeWidth={1.7}
                className={`shrink-0 ${isActive ? 'text-[var(--color-ink)]/85' : 'text-[var(--color-ink)]/45'}`}
              />
              <span className="min-w-0 flex-1 truncate font-mono">{f.label}</span>
              <span className="shrink-0 text-[10px] text-[var(--color-ink)]/40">
                {f.size}
              </span>
            </button>
          )
        })}
        <div className="mt-4 px-3 text-[10.5px] leading-[1.6] text-[var(--color-ink)]/40">
          单页 HTML5 项目 — 入口 index.html 直接挂载 garuda.js 主循环；
          jsfxr 程序化生成音效；sw.js 缓存全部资源做离线访问。
        </div>
      </aside>

      {/* ── Right: code body ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-3 border-b border-[var(--divider-soft)] bg-[var(--color-surface-0)]/85 px-4 py-2 backdrop-blur-sm">
          <span className="font-mono text-[12px] text-[var(--color-ink)]/85">
            public/garuda/{meta.path}
          </span>
          <span className="text-[10.5px] text-[var(--color-ink)]/40">
            {meta.lang} · {meta.size}
          </span>
          <span className="ml-auto text-[10.5px] text-[var(--color-ink)]/40">
            {loading ? '加载中…' : `${allLines.length.toLocaleString()} 行`}
          </span>
        </div>

        <div ref={scrollRef} className="thin-scroll flex-1 overflow-auto">
          {loading && !fullText ? (
            <div className="flex h-full items-center justify-center text-[12px] text-[var(--color-ink)]/40">
              正在读取 {meta.path}…
            </div>
          ) : (
            <table className="w-full border-collapse font-mono text-[12.5px] leading-[1.55]">
              <tbody>
                {visibleLines.map((line, i) => (
                  <tr key={i} className="group hover:bg-[var(--color-ink)]/[0.03]">
                    <td className="sticky left-0 w-12 select-none whitespace-nowrap bg-[var(--color-surface-0)] pl-3 pr-3 text-right align-top text-[var(--color-ink)]/25 group-hover:text-[var(--color-ink)]/45">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre pr-6 align-top text-[var(--color-ink)]/85">
                      {line.length === 0 ? <span>&nbsp;</span> : line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {truncated && (
            <div className="border-t border-[var(--divider-soft)] bg-[var(--color-surface-0)]/85 px-4 py-3 text-center">
              <span className="text-[11.5px] text-[var(--color-ink)]/50">
                仅显示前 {MAX_PREVIEW_LINES.toLocaleString()} 行，剩余{' '}
                {(allLines.length - MAX_PREVIEW_LINES).toLocaleString()} 行未渲染。
              </span>
              <button
                type="button"
                onClick={() => setExpanded((m) => ({ ...m, [active]: true }))}
                className="ml-3 rounded-md border border-[var(--divider)] bg-[var(--color-surface-1)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--color-ink)]/80 transition-colors hover:bg-[var(--fill-hover)] hover:text-[var(--color-ink)]"
              >
                显示全部
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
