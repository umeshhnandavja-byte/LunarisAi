import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ── Crater SVG shared between zoom levels ─────────────── */
function CraterSurface({ id, brightness = 1 }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" style={{ display: 'block', filter: `brightness(${brightness})` }}>
      <defs>
        <radialGradient id={`scale-bg-${id}`} cx="45%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#D0CAC0" />
          <stop offset="55%" stopColor="#A8A098" />
          <stop offset="100%" stopColor="#807870" />
        </radialGradient>
        <radialGradient id={`main-crater-${id}`} cx="40%" cy="35%" r="62%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
          <stop offset="45%" stopColor="rgba(100,96,90,0.3)" />
          <stop offset="100%" stopColor="rgba(20,18,14,0.55)" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#scale-bg-${id})`} />
      {/* Main crater */}
      <ellipse cx="200" cy="150" rx="90" ry="70" fill={`url(#main-crater-${id})`} />
      <ellipse cx="200" cy="150" rx="90" ry="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {/* Rim */}
      <ellipse cx="192" cy="138" rx="78" ry="58" fill="none" stroke="rgba(255,255,240,0.12)" strokeWidth="2" />
      {/* Small craters */}
      <ellipse cx="80" cy="70" rx="28" ry="20" fill="rgba(0,0,0,0.28)" />
      <ellipse cx="320" cy="240" rx="22" ry="16" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="340" cy="80" rx="18" ry="13" fill="rgba(0,0,0,0.22)" />
      <ellipse cx="60" cy="240" rx="14" ry="10" fill="rgba(0,0,0,0.2)" />
      {/* Texture */}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="0" y1={i * 26} x2="400" y2={i * 26} stroke="rgba(0,0,0,0.025)" strokeWidth="1" />
      ))}
    </svg>
  )
}

/* ── Coordinate marker ─────────────────────────────────── */
function CoordMarker({ x, y, label }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      {/* Crosshair */}
      <div style={{ position: 'absolute', top: '50%', left: '-10px', right: '-10px', height: '1px', background: '#3B6FBF', opacity: 0.7 }} />
      <div style={{ position: 'absolute', left: '50%', top: '-10px', bottom: '-10px', width: '1px', background: '#3B6FBF', opacity: 0.7 }} />
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: '1px solid #3B6FBF',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#3B6FBF',
        position: 'relative',
        boxShadow: '0 0 8px rgba(59,111,191,0.8)',
      }} />
      <div style={{
        position: 'absolute',
        top: '-22px',
        left: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '0.1em',
        color: '#3B6FBF',
        whiteSpace: 'nowrap',
        background: 'rgba(255,255,255,0.85)',
        padding: '2px 6px',
        borderRadius: '2px',
        border: '1px solid rgba(59,111,191,0.3)',
      }}>{label}</div>
    </div>
  )
}

export default function ScaleSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // The left panel zooms out as we scroll
  const scaleLeft = useTransform(scrollYProgress, [0.15, 0.7], [1.8, 1.0])
  const scaleRight = useTransform(scrollYProgress, [0.15, 0.7], [1.0, 1.0])
  const labelOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1])

  return (
    <section
      ref={ref}
      style={{ background: 'var(--bg)', padding: '140px 48px', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          }}>Section 05</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>
            Different scale.<br />Same place.
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            maxWidth: '460px',
            fontSize: '16px',
            lineHeight: 1.7,
          }}>
            OHRC captures detail at ~25 cm/pixel while TMC-2 operates at ~5 m/pixel.
            The same crater looks like a pinprick in one image and a canyon in another.
          </p>
        </motion.div>

        {/* Two-panel scale comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          alignItems: 'start',
        }}>
          {/* Left — zoomed in / high resolution */}
          <div style={{ position: 'relative' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}>OHRC — 0.25 m/px</div>
            <motion.div style={{
              border: '1px solid var(--border)',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#1A1614',
              scale: scaleLeft,
              transformOrigin: 'center center',
            }}>
              <CraterSurface id="left" brightness={1.1} />
              <CoordMarker x="50%" y="50%" label="23.4°N 47.2°E" />
            </motion.div>
            <motion.div style={{ opacity: labelOpacity }}>
              <div style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(0,0,0,0.4)',
                padding: '3px 7px',
                borderRadius: '2px',
              }}>HIGH RESOLUTION</div>
            </motion.div>
          </div>

          {/* Right — wide field */}
          <div style={{ position: 'relative' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}>TMC-2 — 5 m/px</div>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#1A1614',
              position: 'relative',
            }}>
              {/* Wide field view — same terrain but smaller */}
              <svg viewBox="0 0 400 300" width="100%" style={{ display: 'block', filter: 'brightness(0.88) saturate(0.85)' }}>
                <defs>
                  <radialGradient id="wide-bg" cx="50%" cy="50%" r="80%">
                    <stop offset="0%" stopColor="#B8B4AC" />
                    <stop offset="100%" stopColor="#6A6660" />
                  </radialGradient>
                  <radialGradient id="wide-crater" cx="40%" cy="35%" r="62%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
                  </radialGradient>
                </defs>
                <rect width="400" height="300" fill="url(#wide-bg)" />
                {/* Many craters at wide scale */}
                {[
                  { cx: 200, cy: 150, rx: 22, ry: 17 }, // target crater — small at wide scale
                  { cx: 60, cy: 50, rx: 35, ry: 26 },
                  { cx: 340, cy: 80, rx: 28, ry: 21 },
                  { cx: 80, cy: 220, rx: 40, ry: 30 },
                  { cx: 320, cy: 240, rx: 30, ry: 22 },
                  { cx: 170, cy: 50, rx: 18, ry: 13 },
                  { cx: 270, cy: 180, rx: 25, ry: 19 },
                  { cx: 120, cy: 150, rx: 15, ry: 11 },
                  { cx: 350, cy: 150, rx: 20, ry: 15 },
                  { cx: 40, cy: 140, rx: 12, ry: 9 },
                ].map((c, i) => (
                  <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="url(#wide-crater)" />
                ))}
                {Array.from({ length: 12 }, (_, i) => (
                  <line key={i} x1="0" y1={i * 26} x2="400" y2={i * 26} stroke="rgba(0,0,0,0.025)" strokeWidth="1" />
                ))}
              </svg>

              {/* Same coordinate marker, but smaller on this scale */}
              <CoordMarker x="50%" y="50%" label="23.4°N 47.2°E" />

              <div style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(0,0,0,0.4)',
                padding: '3px 7px',
                borderRadius: '2px',
              }}>WIDE FIELD</div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          The coordinate marker identifies the same physical location across both scales.
        </motion.p>
      </div>
    </section>
  )
}
