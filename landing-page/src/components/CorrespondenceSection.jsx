import { motion } from 'framer-motion'

/* ── Match point data ──────────────────────────────────── */
const MATCH_POINTS = [
  { x: 28, y: 35, type: 'inlier', label: 'MATCH POINT' },
  { x: 55, y: 22, type: 'inlier', label: 'INLIER' },
  { x: 72, y: 48, type: 'inlier', label: 'PIXEL COORDINATE' },
  { x: 38, y: 62, type: 'inlier', label: 'INLIER' },
  { x: 18, y: 55, type: 'inlier', label: 'MATCH POINT' },
  { x: 63, y: 72, type: 'inlier', label: 'INLIER' },
  { x: 82, y: 30, type: 'outlier', label: '' },
  { x: 46, y: 80, type: 'inlier', label: 'CONFIDENCE' },
  { x: 90, y: 68, type: 'outlier', label: '' },
  { x: 10, y: 20, type: 'inlier', label: 'RMSE' },
]

const CONNECT_PAIRS = [[0,1],[1,2],[2,5],[3,5],[0,4],[4,9]]

export default function CorrespondenceSection() {
  return (
    <section style={{ background: 'var(--bg)', padding: '140px 48px', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
          }}>Analysis Output</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>What the system finds.</h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Lunar image with match points */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            style={{
              position: 'relative',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#1A1814',
            }}
          >
            {/* Lunar surface */}
            <svg viewBox="0 0 100 65" width="100%" style={{ display: 'block' }}>
              <defs>
                <radialGradient id="corr-bg" cx="40%" cy="35%" r="70%">
                  <stop offset="0%" stopColor="#C8C2B6" />
                  <stop offset="55%" stopColor="#9E9488" />
                  <stop offset="100%" stopColor="#78706A" />
                </radialGradient>
                <radialGradient id="corr-c1" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
                </radialGradient>
                <radialGradient id="corr-c2" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
                </radialGradient>
              </defs>
              <rect width="100" height="65" fill="url(#corr-bg)" />
              <ellipse cx="52" cy="34" rx="22" ry="15" fill="url(#corr-c1)" />
              <ellipse cx="22" cy="20" rx="13" ry="9" fill="url(#corr-c2)" />
              <ellipse cx="78" cy="50" rx="9" ry="6" fill="url(#corr-c2)" />
              {Array.from({ length: 10 }, (_, i) => (
                <line key={i} x1="0" y1={i * 7} x2="100" y2={i * 7}
                  stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
              ))}
            </svg>

            {/* Connecting lines */}
            <svg style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}>
              {CONNECT_PAIRS.map(([a, b], i) => {
                const pa = MATCH_POINTS[a]
                const pb = MATCH_POINTS[b]
                if (pa.type === 'outlier' || pb.type === 'outlier') return null
                return (
                  <motion.line
                    key={i}
                    x1={`${pa.x}%`} y1={`${pa.y}%`}
                    x2={`${pb.x}%`} y2={`${pb.y}%`}
                    stroke="#3B6FBF"
                    strokeWidth="0.8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ delay: i * 0.12, duration: 0.6 }}
                    viewport={{ once: true }}
                  />
                )
              })}
            </svg>

            {/* Match point dots */}
            {MATCH_POINTS.map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4, type: 'spring', stiffness: 260 }}
                viewport={{ once: true }}
                style={{
                  position: 'absolute',
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div style={{
                  width: pt.type === 'inlier' ? '9px' : '7px',
                  height: pt.type === 'inlier' ? '9px' : '7px',
                  borderRadius: '50%',
                  background: pt.type === 'inlier' ? '#3B6FBF' : '#BF3B3B',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                  boxShadow: pt.type === 'inlier'
                    ? '0 0 8px rgba(59,111,191,0.7)'
                    : '0 0 6px rgba(191,59,59,0.5)',
                }} />
                {pt.label && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.7)',
                    whiteSpace: 'nowrap',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '1px 4px',
                    borderRadius: '2px',
                  }}>{pt.label}</div>
                )}
              </motion.div>
            ))}

            {/* Scan line overlay */}
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(59,111,191,0.4), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Corner annotations */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.1em',
            }}>MATCH ID: 004821</div>
          </motion.div>

          {/* Results panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Main metrics */}
            {[
              { label: 'INLIERS', value: '1,842', sub: 'Matched feature points', big: true },
              { label: 'CONFIDENCE', value: '94.7%', sub: 'Match confidence score', big: true },
              { label: 'RMSE', value: '0.38 px', sub: 'Root mean square error', big: false },
            ].map(({ label, value, sub, big }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                style={{
                  padding: '20px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}>{label}</div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: big ? '36px' : '28px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '6px',
                }}>{sub}</div>
              </motion.div>
            ))}

            {/* Status bar */}
            <div style={{
              padding: '14px 20px',
              border: '1px solid var(--accent)',
              borderRadius: '6px',
              background: 'var(--accent-light)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: 'none',
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  color: 'var(--accent)',
                }}>REGISTRATION STATUS: COMPLETE</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '14px 20px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
            }}>
              {[
                { color: '#3B6FBF', label: 'Inlier' },
                { color: '#BF3B3B', label: 'Outlier' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
