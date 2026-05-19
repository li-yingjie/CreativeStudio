import React from 'react'

/**
 * Minimal markdown renderer covering the syntax we use in capability docs:
 *   - `#` / `##` / `###` headings
 *   - paragraphs (consecutive non-blank lines joined with a space)
 *   - bulleted lists (`-` / `*`)
 *   - numbered lists (`1. `)
 *   - blockquotes (`> `)
 *   - fenced code blocks (```)
 *   - inline `**bold**`, `*italic*`, `` `code` ``, `[text](url)`
 * Built in-house (no extra dep) and renders to React nodes so it picks up
 * Tailwind tokens for theme support.
 */
export default function MarkdownView({
  source,
  className = '',
}: {
  source: string
  className?: string
}) {
  return <div className={className}>{renderBlocks(source)}</div>
}

function renderBlocks(md: string): React.ReactNode[] {
  const lines = md.split('\n')
  const out: React.ReactNode[] = []
  let i = 0
  let key = 0

  const isStructuralLine = (s: string) =>
    s.startsWith('#') ||
    s.startsWith('```') ||
    s.startsWith('> ') ||
    s.startsWith('- ') ||
    s.startsWith('* ') ||
    /^\d+\. /.test(s) ||
    isTableRow(s) ||
    s.trim() === ''

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      out.push(
        <pre
          key={key++}
          className="my-3 overflow-x-auto rounded-lg bg-[var(--fill-subtle)] p-3 text-[12.5px]"
        >
          <code className="font-mono leading-[1.6] text-[var(--color-ink)]/85">
            {codeLines.join('\n')}
          </code>
        </pre>,
      )
      continue
    }

    if (line.startsWith('### ')) {
      out.push(
        <h3
          key={key++}
          className="mt-5 mb-2 text-[14px] font-semibold text-[var(--color-ink)]"
        >
          {renderInline(line.slice(4))}
        </h3>,
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      out.push(
        <h2
          key={key++}
          className="mt-6 mb-2 text-[16px] font-semibold text-[var(--color-ink)]"
        >
          {renderInline(line.slice(3))}
        </h2>,
      )
      i++
      continue
    }
    if (line.startsWith('# ')) {
      out.push(
        <h1
          key={key++}
          className="mt-6 mb-3 text-[18px] font-semibold text-[var(--color-ink)]"
        >
          {renderInline(line.slice(2))}
        </h1>,
      )
      i++
      continue
    }

    // GitHub-style table:
    //   | h1 | h2 |
    //   | --- | :---: |
    //   | a   | b    |
    if (
      isTableRow(line) &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      const headerCells = splitTableRow(line)
      const aligns = parseTableAligns(lines[i + 1], headerCells.length)
      i += 2
      const bodyRows: string[][] = []
      while (i < lines.length && isTableRow(lines[i])) {
        bodyRows.push(splitTableRow(lines[i]))
        i++
      }
      out.push(
        <div key={key++} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-[13px] leading-[1.6] text-[var(--color-ink)]/85">
            <thead>
              <tr className="border-b border-[var(--divider-soft)]">
                {headerCells.map((cell, j) => (
                  <th
                    key={j}
                    className="px-3 py-2 text-[12.5px] font-semibold text-[var(--color-ink)]"
                    style={{ textAlign: aligns[j] ?? 'left' }}
                  >
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, r) => (
                <tr
                  key={r}
                  className="border-b border-[var(--divider-soft)]/60 last:border-b-0"
                >
                  {headerCells.map((_, c) => (
                    <td
                      key={c}
                      className="px-3 py-2 align-top"
                      style={{ textAlign: aligns[c] ?? 'left' }}
                    >
                      {renderInline(row[c] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      out.push(
        <blockquote
          key={key++}
          className="my-3 rounded-r border-l-2 border-[var(--color-ink)]/25 bg-[var(--fill-subtle)] py-2 pl-3 pr-2 text-[13px] leading-[1.7] text-[var(--color-ink)]/70"
        >
          {quoteLines.map((q, j) => (
            <p key={j}>{renderInline(q)}</p>
          ))}
        </blockquote>,
      )
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (
        i < lines.length &&
        (lines[i].startsWith('- ') || lines[i].startsWith('* '))
      ) {
        items.push(lines[i].slice(2))
        i++
      }
      out.push(
        <ul
          key={key++}
          className="my-2 flex flex-col gap-1.5 text-[13px] leading-[1.7] text-[var(--color-ink)]/85"
        >
          {items.map((item, j) => (
            <li
              key={j}
              className="relative pl-4 before:absolute before:left-1 before:top-[10px] before:h-1 before:w-1 before:rounded-full before:bg-[var(--color-ink)]/40"
            >
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      out.push(
        <ol
          key={key++}
          className="my-2 ml-5 flex list-decimal flex-col gap-1.5 text-[13px] leading-[1.7] text-[var(--color-ink)]/85"
        >
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    // Paragraph — collect until next structural line.
    const paraLines: string[] = []
    while (i < lines.length && !isStructuralLine(lines[i])) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      out.push(
        <p
          key={key++}
          className="my-2 text-[13px] leading-[1.7] text-[var(--color-ink)]/85"
        >
          {renderInline(paraLines.join(' '))}
        </p>,
      )
    }
  }

  return out
}

function isTableRow(s: string): boolean {
  const t = s.trim()
  return t.startsWith('|') && t.endsWith('|') && t.length >= 2
}

function isTableSeparator(s: string): boolean {
  if (!isTableRow(s)) return false
  return splitTableRow(s).every((cell) => /^:?-{3,}:?$/.test(cell.trim()))
}

function splitTableRow(s: string): string[] {
  const trimmed = s.trim().slice(1, -1)
  return trimmed.split('|').map((c) => c.trim())
}

function parseTableAligns(
  separator: string,
  cols: number,
): Array<'left' | 'center' | 'right'> {
  const cells = splitTableRow(separator)
  const out: Array<'left' | 'center' | 'right'> = []
  for (let i = 0; i < cols; i++) {
    const c = (cells[i] ?? '').trim()
    if (c.startsWith(':') && c.endsWith(':')) out.push('center')
    else if (c.endsWith(':')) out.push('right')
    else out.push('left')
  }
  return out
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let key = 0
  const regex = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index))
    const token = m[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong
          key={key++}
          className="font-semibold text-[var(--color-ink)]"
        >
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-[var(--fill-subtle)] px-1 py-0.5 font-mono text-[12px] text-[var(--color-ink)]"
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-ink)] underline decoration-[var(--color-ink)]/40 underline-offset-2 hover:decoration-[var(--color-ink)]"
          >
            {linkMatch[1]}
          </a>,
        )
      } else {
        parts.push(token)
      }
    } else if (token.startsWith('*')) {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    }
    lastIdx = m.index + token.length
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx))
  return parts
}
