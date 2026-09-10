import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 48px',
      height: '60px',
      background: scrolled ? 'rgba(249,248,246,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
      transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '15px',
        letterSpacing: '0.18em',
        color: 'var(--text-primary)',
      }}>LUNARIS</span>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {['Technology', 'Dataset', 'Team'].map(link => (
          <a key={link} href="#" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
          >{link}</a>
        ))}
      </div>
    </nav>
  )
}
