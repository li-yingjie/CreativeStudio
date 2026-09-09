import type { CSSProperties } from 'react'
import type { H5LabScreen } from './h5-lab-prototype'
import './H5LabGeneratedScreen.css'

/* 补交互时现生成的一屏。刻意用最朴素的排版 —— 它是接口补丁，不是复刻件，
   排版留白、字号、按钮全部是真 DOM，交给画布的覆盖机制继续改。 */

interface Props {
  screen: H5LabScreen
  /** case 的底色，让新屏和原页面在同一个色系里。 */
  tone: string
}

export default function H5LabGeneratedScreen({ screen, tone }: Props) {
  const style = { '--gen-tone': tone } as CSSProperties
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
      <div className="h5gen-shell h5gen-overlay" style={style}>
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
    <div className={`h5gen-shell h5gen-${screen.kind}`} style={style}>
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
