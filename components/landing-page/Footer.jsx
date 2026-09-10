export default function Footer() {
  const sensors = ['Chandrayaan-2', 'OHRC', 'TMC-2', 'IIRS', 'LRO NAC', 'SELENE']
  const links = ['Technology', 'Dataset', 'Team']

  return (
    <footer style={{
      background: 'var(--bg)',
      borderTop: '1px solid var(--border-light)',
      padding: '60px 48px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '48px',
        alignItems: 'start',
      }}>
        {/* Left: wordmark */}
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '15px',
            letterSpacing: '0.18em',
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}>LUNARIS</div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            maxWidth: '240px',
          }}>
            Multi-modal lunar image correspondence
          </p>
          <div style={{
            marginTop: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            opacity: 0.6,
          }}>
            CORRESPONDENCE ENGINE v1.0
          </div>
        </div>

        {/* Center: sensor list */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            color: 'var(--text-muted)',
            marginBottom: '14px',
            textTransform: 'uppercase',
          }}>Sensors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            {sensors.map(s => (
              <span key={s} style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                opacity: 0.7,
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Right: links */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            color: 'var(--text-muted)',
            marginBottom: '14px',
            textTransform: 'uppercase',
          }}>Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            {links.map(l => (
              <a key={l} href="#" style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          opacity: 0.5,
          letterSpacing: '0.06em',
        }}>
          © 2026 LUNARIS — Smart India Hackathon Prototype
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          opacity: 0.4,
          letterSpacing: '0.1em',
        }}>
          23.4°N 47.2°E — LUNAR SURFACE
        </span>
      </div>
    </footer>
  )
}
