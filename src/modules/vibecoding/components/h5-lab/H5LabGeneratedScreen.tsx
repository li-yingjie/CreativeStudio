import type { CSSProperties } from 'react'
import type { H5LabDesign } from './h5-lab-cases'
import type { H5LabScreen } from './h5-lab-prototype'
import './H5LabGeneratedScreen.css'

/* 补交互时现生成的一屏。排版和取色全部走 case 自己的设计系统（`H5LabDesign`，
   值抄自各自那份 CSS），不另起一套 —— 否则一屏生成页夹在复刻页中间会很出戏。 */

interface Props {
  screen: H5LabScreen
  design: H5LabDesign
}

export default function H5LabGeneratedScreen({ screen, design }: Props) {
  const style = {
    '--gen-page-bg': design.pageBg,
    '--gen-page-ink': design.pageInk,
    '--gen-page-muted': design.pageMuted,
    '--gen-paper': design.paper,
    '--gen-paper-ink': design.paperInk,
    '--gen-paper-muted': design.paperMuted,
    '--gen-border': design.border,
    '--gen-accent': design.accent,
    '--gen-accent-ink': design.accentInk,
    '--gen-radius': `${design.radius}px`,
    '--gen-radius-lg': `${design.radiusLg}px`,
    '--gen-shadow': design.shadow,
    '--gen-display': design.displayFont,
    '--gen-body': design.bodyFont,
  } as CSSProperties
  const rowAction = screen.rowAction ?? '去完成'

  const actions = (
    <div className="h5gen-actions">
      <button type="button" className="h5gen-primary">
        {screen.primaryAction}
      </button>
      {screen.secondaryAction && (
        <button type="button" className="h5gen-secondary">
          {screen.secondaryAction}
        </button>
      )}
    </div>
  )

  if (screen.kind === 'overlay') {
    return (
      <div className="h5gen-shell h5gen-kind-overlay" style={style}>
        <div className="h5gen-scrim" aria-hidden="true" />
        <div className="h5gen-card">
          <span className="h5gen-eyebrow">{screen.fromLabel}</span>
          <h2 className="h5gen-title">{screen.title}</h2>
          <p className="h5gen-body">{screen.body}</p>
          {actions}
        </div>
      </div>
    )
  }

  return (
    <div className={`h5gen-shell h5gen-kind-${screen.kind}`} style={style}>
      <header className="h5gen-head">
        <span className="h5gen-eyebrow">{screen.fromLabel}</span>
        <h2 className="h5gen-title">{screen.title}</h2>
        <p className="h5gen-body">{screen.body}</p>
      </header>

      {screen.kind === 'form' && (
        <div className="h5gen-form">
          {screen.rows.map((row, index) => (
            <label key={`${row}-${index}`} className="h5gen-field">
              <span>{row}</span>
              <i className="h5gen-input" />
            </label>
          ))}
        </div>
      )}

      {screen.kind === 'list' && (
        <ul className="h5gen-list">
          {screen.rows.map((row, index) => (
            <li key={`${row}-${index}`} className="h5gen-row">
              <b>{String(index + 1).padStart(2, '0')}</b>
              <span>{row}</span>
              {rowAction && <em>{rowAction}</em>}
            </li>
          ))}
        </ul>
      )}

      {screen.kind === 'result' && (
        <div className="h5gen-badge" aria-hidden="true">
          <span />
        </div>
      )}

      <footer className="h5gen-foot">{actions}</footer>
    </div>
  )
}
