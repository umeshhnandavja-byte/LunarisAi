import { motion } from 'framer-motion'

/* ── Elevation contour data ────────────────────────────── */
// Concentric ellipses for crater + surrounding terrain
const CONTOURS = [
  // Outer terrain — high plateau
  { cx: 300, cy: 220, rx: 260, ry: 200, elevation: '+120m', color: '#C8B890', strokeOpacity: 0.35 },
  { cx: 300, cy: 220, rx: 220, ry: 168, elevation: null, color: '#C0AE84', strokeOpacity: 0.3 },
  { cx: 300, cy: 220, rx: 180, ry: 137, elevation: '+64m', color: '#B0A076', strokeOpacity: 0.28 },
  { cx: 300, cy: 220, rx: 145, ry: 110, elevation: null, color: '#A09068', strokeOpacity: 0.25 },
  { cx: 300, cy: 220, rx: 112, ry: 85, elevation: '+12m', color: '#8C7E5A', strokeOpacity: 0.25 },
  // Inner crater bowl — depressions
  { cx: 300, cy: 220, rx: 82, ry: 62, elevation: null, color: '#786C50', strokeOpacity: 0.3 },
  { cx: 300, cy: 220, rx: 56, ry: 42, elevation: '-18m', color: '#5C5440', strokeOpacity: 0.35 },
  { cx: 300, cy: 220, rx: 34, ry: 26, elevation: null, color: '#484038', strokeOpacity: 0.4 },
  { cx: 300, cy: 220, rx: 16, ry: 12, elevation: null, color: '#38342E', strokeOpacity: 0.5 },
]

const SECONDARY_CRATER = { cx: 120, cy: 120, rx: 58, ry: 44 }
const SEC_CONTOURS = [
  { rx: 58, ry: 44, opacity: 0.25 },
  { rx: 44, ry: 33, opacity: 0.3 },
  { rx: 30, ry: 23, opacity: 0.38 },
  { rx: 18, ry: 13, opacity: 0.45 },
]

export default function TerrainSection() {
  return (
    <section style={{ background: 'var(--bg)', padding: '140px 48px', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          style={{ marginBottom: '64px' }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '16px',
          }}>Section 07</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>From images to terrain.</h2>
          <p style={{
            color: 'var(--text-secondary)',
            maxWidth: '460px',
            fontSize: '16px',
            lineHeight: 1.7,
          }}>
            Correspondence data unlocks terrain modelling. LUNARIS generates elevation maps
            from registered multi-sensor imagery.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Main elevation map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#F0EDE8',
              position: 'relative',
            }}
          >
            <svg
              viewBox="0 0 600 440"
              width="100%"
              style={{ display: 'block' }}
            >
              <defs>
                {/* Terrain fill gradient */}
                <radialGradient id="terrain-fill" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#4A4238" />
                  <stop offset="25%" stopColor="#786858" />
                  <stop offset="60%" stopColor="#B0A076" />
                  <stop offset="100%" stopColor="#D4C8A8" />
                </radialGradient>
                <radialGradient id="sec-fill" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#4A4440" />
                  <stop offset="100%" stopColor="#B0A888" />
                </radialGradient>
                {/* Subtle noise/texture */}
                <filter id="terrain-texture">
                  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
                  <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
                  <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
                  <feComposite in="blended" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>

              {/* Background */}
              <rect width="600" height="440" fill="#E8E4DC" />

              {/* Grid */}
              {Array.from({ length: 12 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 40} x2="600" y2={i * 40}
                  stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
              ))}
              {Array.from({ length: 16 }, (_, i) => (
                <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="440"
                  stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
              ))}

              {/* Main crater filled */}
              <ellipse cx="300" cy="220" rx="260" ry="200" fill="url(#terrain-fill)" />

              {/* Contour lines */}
              {CONTOURS.map((c, i) => (
                <motion.ellipse
                  key={i}
                  cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={i < 4 ? 1 : 1.2}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: c.strokeOpacity * 2 }}
                  transition={{ delay: i * 0.07, duration: 0.8 }}
                  viewport={{ once: true }}
                />
              ))}

              {/* Secondary crater */}
              <ellipse cx={120} cy={120} rx={58} ry={44} fill="url(#sec-fill)" />
              {SEC_CONTOURS.map((c, i) => (
                <ellipse key={i} cx={120} cy={120} rx={c.rx} ry={c.ry}
                  fill="none" stroke="#787068" strokeWidth="1" opacity={c.opacity} />
              ))}

              {/* Third small crater */}
              <ellipse cx="490" cy="340" rx="38" ry="28" fill="#6C6458" opacity="0.7" />
              {[38, 28, 18, 10].map((rx, i) => (
                <ellipse key={i} cx="490" cy="340" rx={rx} ry={rx * 0.74}
                  fill="none" stroke="#787068" strokeWidth="1" opacity={0.2 + i * 0.05} />
              ))}

              {/* Elevation labels */}
              {[
                { x: 44, y: 45, label: '+120m' },
                { x: 490, y: 100, label: '+64m' },
                { x: 460, y: 180, label: '+12m' },
                { x: 310, y: 228, label: '-18m' },
              ].map(({ x, y, label }, i) => (
                <motion.g
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <rect x={x - 4} y={y - 10} width={label.length * 7} height="14" rx="2" fill="rgba(255,255,255,0.75)" />
                  <text x={x} y={y} fontFamily="ui-monospace, monospace" fontSize="10" fill="#5A5048" letterSpacing="0.5">{label}</text>
                </motion.g>
              ))}

              {/* Coordinate annotation */}
              <motion.g
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <line x1="300" y1="220" x2="360" y2="170" stroke="#3B6FBF" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.6" />
                <circle cx="300" cy="220" r="3" fill="#3B6FBF" opacity="0.8" />
                <rect x="360" y="157" width="100" height="16" rx="2" fill="rgba(59,111,191,0.1)" stroke="rgba(59,111,191,0.3)" strokeWidth="0.8" />
                <text x="365" y="169" fontFamily="ui-monospace, monospace" fontSize="9" fill="#3B6FBF" letterSpacing="0.5">23.4°N 47.2°E</text>
              </motion.g>

              {/* Title label */}
              <text x="16" y="430" fontFamily="ui-monospace, monospace" fontSize="10" fill="#9898A0" letterSpacing="1">
                ELEVATION MAP — CRATER REGION 004821
              </text>
            </svg>
          </motion.div>

          {/* Right: elevation profile + legend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Color legend */}
            <div style={{
              padding: '20px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                color: 'var(--text-muted)',
                marginBottom: '14px',
              }}>ELEVATION LEGEND</div>
              <div style={{
                height: '12px',
                borderRadius: '2px',
                background: 'linear-gradient(to right, #38342E, #786858, #B0A076, #D4C8A8)',
                marginBottom: '8px',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {['-18m', '0m', '+64m', '+120m'].map(l => (
                  <span key={l} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                  }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Vertical elevation profile */}
            <div style={{
              padding: '20px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                color: 'var(--text-muted)',
                marginBottom: '14px',
              }}>ELEVATION PROFILE — A→B</div>
              <svg viewBox="0 0 260 120" width="100%" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="profile-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59,111,191,0.3)" />
                    <stop offset="100%" stopColor="rgba(59,111,191,0.03)" />
                  </linearGradient>
                </defs>
                {/* Grid */}
                {[30, 60, 90].map(y => (
                  <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="var(--border)" strokeWidth="1" />
                ))}
                {/* Elevation curve */}
                <motion.path
                  d="M 0 95 C 30 95, 50 85, 80 65 C 100 50, 115 25, 130 20 C 145 25, 160 50, 180 65 C 210 85, 230 95, 260 95"
                  fill="url(#profile-fill)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                />
                {/* Baseline */}
                <line x1="0" y1="95" x2="260" y2="95" stroke="var(--border)" strokeWidth="1" />
                {/* Labels */}
                <text x="2" y="115" fontFamily="ui-monospace, monospace" fontSize="8" fill="var(--text-muted)">A</text>
                <text x="250" y="115" fontFamily="ui-monospace, monospace" fontSize="8" fill="var(--text-muted)">B</text>
                <text x="118" y="17" fontFamily="ui-monospace, monospace" fontSize="8" fill="var(--accent)">+120m</text>
              </svg>
            </div>

            {/* Stats */}
            {[
              { label: 'AREA COVERED', value: '4.2 km²' },
              { label: 'ELEVATION RANGE', value: '138 m' },
              { label: 'RESOLUTION', value: '0.25 m/px' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '14px 20px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                }}>{label}</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
