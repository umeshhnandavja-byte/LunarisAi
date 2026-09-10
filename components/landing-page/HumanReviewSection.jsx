import { useState, useEffect, useRef } from 'react'
import { motion, useInView, animate } from 'framer-motion'

/* ── Lock icon ──────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
      <rect x="2" y="7" width="10" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7V5C4.5 3.619 5.619 2.5 7 2.5C8.381 2.5 9.5 3.619 9.5 5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="11" r="1.2" fill="currentColor" />
    </svg>
  )
}

/* ── Confidence meter ──────────────────────────────────── */
function ConfidenceMeter({ value, inView }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.4,
      onUpdate: v => setDisplayed(parseFloat(v.toFixed(1))),
    })
    return () => controls.stop()
  }, [inView, value])

  const pct = value / 100
  const lowEnd = 0
  const highEnd = 100
  const medLow = 35
  const medHigh = 70

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        {['LOW', 'MEDIUM', 'HIGH'].map(t => (
          <span key={t} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
          }}>{t}</span>
        ))}
      </div>

      {/* Track */}
      <div style={{
        position: 'relative',
        height: '6px',
        background: 'var(--border)',
        borderRadius: '3px',
        overflow: 'visible',
      }}>
        {/* Color fill */}
        <motion.div
          initial={{ width: '0%' }}
          animate={inView ? { width: `${displayed}%` } : { width: '0%' }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            borderRadius: '3px',
            background: displayed < 35
              ? 'linear-gradient(to right, #BF4B3B, #E06B4B)'
              : displayed < 70
              ? 'linear-gradient(to right, #E0A840, #D4C040)'
              : 'linear-gradient(to right, #4BAF60, #40BF88)',
          }}
        />
        {/* Indicator dot */}
        <motion.div
          initial={{ left: '0%' }}
          animate={inView ? { left: `${displayed}%` } : { left: '0%' }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'white',
            border: '2px solid var(--accent)',
            boxShadow: '0 0 8px rgba(59,111,191,0.4)',
          }}
        />
        {/* Zone markers */}
        {[35, 70].map(pct => (
          <div key={pct} style={{
            position: 'absolute',
            top: '-4px',
            bottom: '-4px',
            left: `${pct}%`,
            width: '1px',
            background: 'var(--border)',
          }} />
        ))}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '40px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
        }}>{displayed}%</span>
      </div>
    </div>
  )
}

/* ── Mock match point overlay ───────────────────────────── */
const REVIEW_POINTS = [
  { x: 38, y: 42, color: '#3B6FBF' },
  { x: 62, y: 28, color: '#3B6FBF' },
  { x: 55, y: 70, color: '#3B6FBF' },
  { x: 25, y: 75, color: '#E07840' },  // uncertain
  { x: 72, y: 52, color: '#3B6FBF' },
]

function ReviewImage({ label, offsetX = 0 }) {
  return (
    <div style={{
      position: 'relative',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      overflow: 'hidden',
      background: '#1A1614',
    }}>
      <svg viewBox="0 0 200 140" width="100%" style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`rev-bg-${label}`} cx="45%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#C4BEB4" />
            <stop offset="55%" stopColor="#9E9890" />
            <stop offset="100%" stopColor="#787068" />
          </radialGradient>
        </defs>
        <rect width="200" height="140" fill={`url(#rev-bg-${label})`} />
        <ellipse cx={100 + offsetX} cy="70" rx="42" ry="32" fill="rgba(0,0,0,0.28)" />
        <ellipse cx={100 + offsetX} cy="70" rx="42" ry="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <ellipse cx="40" cy="35" rx="20" ry="14" fill="rgba(0,0,0,0.22)" />
        <ellipse cx="168" cy="112" rx="16" ry="11" fill="rgba(0,0,0,0.2)" />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="0" y1={i * 18} x2="200" y2={i * 18} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
        ))}
      </svg>
      {/* Match points */}
      {REVIEW_POINTS.map((pt, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${pt.x}%`,
          top: `${pt.y}%`,
          transform: 'translate(-50%, -50%)',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: pt.color,
            border: '1.5px solid white',
            boxShadow: `0 0 6px ${pt.color}80`,
          }} />
        </div>
      ))}
      {/* Connecting lines between source and reference (visual only) */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {REVIEW_POINTS.map((pt, i) => (
          <line key={i}
            x1={`${pt.x}%`} y1={`${pt.y}%`}
            x2={`${pt.x}%`} y2={`${pt.y + 5}%`}
            stroke={pt.color} strokeWidth="0.8" opacity="0.4" strokeDasharray="3 3"
          />
        ))}
      </svg>
      {/* Label */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '0.14em',
        color: 'rgba(255,255,255,0.6)',
        background: 'rgba(0,0,0,0.4)',
        padding: '2px 6px',
        borderRadius: '2px',
      }}>{label}</div>
    </div>
  )
}

export default function HumanReviewSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--bg-warm)',
        padding: '140px 48px',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '72px', maxWidth: '680px' }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '16px',
          }}>Human in the Loop</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}>
            Not every match<br />is certain.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.7 }}>
            When confidence falls below threshold, LUNARIS flags the result for scientific review.
            Uncertain results are not silently passed through.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '48px',
          alignItems: 'start',
        }}>
          {/* Left: confidence meter */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              padding: '28px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--surface)',
              marginBottom: '16px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                color: 'var(--text-muted)',
                marginBottom: '20px',
              }}>CONFIDENCE SCORE</div>
              <ConfidenceMeter value={78.2} inView={inView} />
            </div>

            {/* Status banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 2.4, duration: 0.6 }}
              style={{
                padding: '14px 18px',
                border: '1px solid #E0A840',
                borderRadius: '6px',
                background: 'rgba(224,168,64,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E0A840', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: '#C08020',
              }}>REQUIRES SCIENTIFIC REVIEW</span>
            </motion.div>

            {/* Authoritative access */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 2.6, duration: 0.6 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '12px 18px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
              }}
            >
              <LockIcon />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
              }}>Authoritative access required</span>
            </motion.div>
          </motion.div>

          {/* Right: review interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'var(--surface)',
            }}>
              {/* Panel header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-warm)',
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    color: 'var(--text-primary)',
                  }}>SCIENTIST REVIEW — MATCH #2847</div>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}>Confidence below threshold (78.2% &lt; 85%)</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: '#E0A840',
                  letterSpacing: '0.1em',
                }}>PENDING</div>
              </div>

              {/* Images */}
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <ReviewImage label="SOURCE — OHRC" offsetX={0} />
                <ReviewImage label="REFERENCE — TMC-2" offsetX={5} />
              </div>

              {/* Action buttons */}
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}>
                {[
                  { label: 'Approve Match', primary: true },
                  { label: 'Reject', primary: false },
                  { label: 'Adjust', primary: false },
                ].map(({ label, primary }) => (
                  <button
                    key={label}
                    style={{
                      padding: primary ? '10px 24px' : '9px 20px',
                      border: primary ? 'none' : '1px solid var(--border)',
                      borderRadius: '4px',
                      background: primary ? 'var(--text-primary)' : 'transparent',
                      color: primary ? 'white' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: primary ? 500 : 400,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.opacity = '0.75'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                  >{label}</button>
                ))}
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}>
                  Uncertain results are reviewed by a human scientist.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
