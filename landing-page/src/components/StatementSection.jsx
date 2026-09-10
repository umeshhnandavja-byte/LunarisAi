import { motion } from 'framer-motion'

const lines = [
  { text: 'Different images.', delay: 0 },
  { text: 'Different conditions.', delay: 0.2 },
  { text: 'The same place.', delay: 0.4, accent: true },
]

export default function StatementSection() {
  return (
    <section style={{
      background: 'var(--bg)',
      padding: '180px 48px',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        {/* Big statement */}
        <div style={{ marginBottom: '80px' }}>
          {lines.map(({ text, delay, accent }) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-60px' }}
            >
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 7vw, 96px)',
                fontWeight: 500,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: accent ? 'var(--text-primary)' : 'var(--moon-grey)',
                display: 'block',
              }}>
                {text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Thin divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          style={{
            height: '1px',
            background: 'var(--border)',
            maxWidth: '200px',
            margin: '0 auto 60px',
          }}
        />

        {/* LUNARIS wordmark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(18px, 3vw, 32px)',
            letterSpacing: '0.2em',
            color: 'var(--text-primary)',
            display: 'block',
            marginBottom: '14px',
          }}>LUNARIS</span>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
          }}>
            Mapping correspondence across the Moon.
          </p>
        </motion.div>
          <button
  style={{
    marginTop: '24px',
    padding: '12px 22px',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-primary)',
    background: 'transparent',
    border: '1px solid var(--border-light)',
    borderRadius: '2px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = 'var(--text-primary)'
    e.currentTarget.style.color = 'var(--bg)'
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'transparent'
    e.currentTarget.style.color = 'var(--text-primary)'
  }}
>
  Try it out →
</button>
        {/* Decorative orbital arc */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          viewport={{ once: true }}
          style={{ marginTop: '60px' }}
        >
          <svg viewBox="0 0 400 40" width="260" style={{ display: 'block', margin: '0 auto', opacity: 0.25 }}>
            <ellipse cx="200" cy="60" rx="190" ry="50" fill="none" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="5 6" />
            <circle cx="200" cy="10" r="2.5" fill="var(--accent)" />
          </svg>
        </motion.div>

        {/* Tiny labels */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            marginTop: '40px',
            flexWrap: 'wrap',
          }}
        >
          {['CHANDRAYAAN-2', 'OHRC', 'TMC-2', 'IIRS', 'CORRESPONDENCE ENGINE'].map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
              opacity: 0.6,
            }}>{tag}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
