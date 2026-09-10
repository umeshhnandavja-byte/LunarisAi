import { useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

const METRICS = [
  { label: 'MATCHES', value: '1,842' },
  { label: 'INLIERS', value: '1,731' },
  { label: 'INLIER RATIO', value: '93.9%' },
  { label: 'RMSE', value: '0.38 px' },
  { label: 'CONFIDENCE', value: '94.7%' },
]

const RESULT_POINTS = [
  { x: 35, y: 40 }, { x: 58, y: 25 }, { x: 70, y: 55 },
  { x: 28, y: 68 }, { x: 65, y: 72 }, { x: 48, y: 82 },
]

function LunarImagePanel({ label, xOffset = 0, filter = 'none' }) {
  return (
    <div style={{
      position: 'relative',
      border: '1px solid var(--border)',
      borderRadius: '4px',
      overflow: 'hidden',
      background: '#1A1614',
    }}>
      <svg viewBox="0 0 280 200" width="100%" style={{ display: 'block', filter }}>
        <defs>
          <radialGradient id={`res-bg-${label}`} cx="40%" cy="35%" r="72%">
            <stop offset="0%" stopColor="#C8C2B6" />
            <stop offset="55%" stopColor="#9E9888" />
            <stop offset="100%" stopColor="#787068" />
          </radialGradient>
          <radialGradient id={`res-c-${label}`} cx="40%" cy="35%" r="62%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
          </radialGradient>
        </defs>
        <rect width="280" height="200" fill={`url(#res-bg-${label})`} />
        <ellipse cx={140 + xOffset} cy="100" rx="65" ry="50" fill={`url(#res-c-${label})`} />
        <ellipse cx={140 + xOffset} cy="100" rx="65" ry="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <ellipse cx={50 + xOffset} cy="50" rx="28" ry="20" fill="rgba(0,0,0,0.25)" />
        <ellipse cx={230 + xOffset} cy="155" rx="22" ry="16" fill="rgba(0,0,0,0.22)" />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1="0" y1={i * 22} x2="280" y2={i * 22} stroke="rgba(0,0,0,0.025)" strokeWidth="1" />
        ))}
      </svg>
      {/* Label */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '0.14em',
        color: 'rgba(255,255,255,0.65)',
        background: 'rgba(0,0,0,0.4)',
        padding: '3px 8px',
        borderRadius: '2px',
        backdropFilter: 'blur(4px)',
      }}>{label}</div>
    </div>
  )
}

export default function ResultsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [aligned, setAligned] = useState(false)
  const [registeredOpacity, setRegisteredOpacity] = useState(0)

  const handleAlign = () => {
    if (aligned) return
    setAligned(true)
    setTimeout(() => setRegisteredOpacity(1), 800)
  }

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--bg-warm)',
        padding: '140px 48px',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
          }}>Section 08</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>Registered result.</h2>
        </motion.div>

        {/* Image panels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div style={{ position: 'relative' }}>
            {/* Source + Reference → Registered */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              transition: 'all 0.8s ease',
            }}>
              <motion.div
                animate={aligned ? { x: 40, opacity: 0.6 } : { x: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <LunarImagePanel label="SOURCE — OHRC" xOffset={0} filter="brightness(1.05)" />
              </motion.div>
              <motion.div
                animate={aligned ? { x: -40, opacity: 0.6 } : { x: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <LunarImagePanel label="REFERENCE — TMC-2" xOffset={8} filter="brightness(0.9) saturate(0.85)" />
              </motion.div>
            </div>

            {/* REGISTERED overlay */}
            {aligned && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '1px solid var(--accent)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#1A1614',
                }}
              >
                <LunarImagePanel label="REGISTERED" xOffset={0} filter="brightness(1.0)" />
                {/* Match points on registered */}
                {RESULT_POINTS.map((pt, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.08, type: 'spring', stiffness: 300 }}
                    style={{
                      position: 'absolute',
                      left: `${pt.x}%`,
                      top: `${pt.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#3BE8A0',
                      border: '1.5px solid white',
                      boxShadow: '0 0 8px rgba(59,232,160,0.7)',
                    }} />
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    color: '#3BE8A0',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '4px 10px',
                    borderRadius: '2px',
                    border: '1px solid rgba(59,232,160,0.3)',
                  }}
                >✓ REGISTERED</motion.div>
              </motion.div>
            )}

            {/* Align button */}
            {!aligned && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  onClick={handleAlign}
                  style={{
                    padding: '12px 32px',
                    background: 'var(--text-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.75'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >Align Images →</button>
              </div>
            )}
          </div>

          {/* Metrics panel + Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ marginTop: '32px' }}
          >
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'var(--surface)',
            }}>
              {/* Metrics header */}
              <div style={{
                padding: '14px 24px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  color: 'var(--text-secondary)',
                }}>REGISTRATION METRICS</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--accent)',
                  letterSpacing: '0.12em',
                }}>MATCH ID: 004821</span>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '0',
                  marginBottom: '20px',
                }}>
                  {METRICS.map(({ label, value }, i) => (
                    <div key={label} style={{
                      padding: '16px 12px',
                      borderRight: i < METRICS.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        color: 'var(--text-muted)',
                        marginBottom: '8px',
                      }}>{label}</div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '22px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                      }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Export button */}
                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <button
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-warm)'
                      e.currentTarget.style.borderColor = 'var(--text-secondary)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'var(--border)'
                    }}
                  >
                    <span>Export CSV</span>
                    <span style={{ opacity: 0.6 }}>↓</span>
                  </button>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}>
                    Exports match coordinates, confidence scores, and RMSE data
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
