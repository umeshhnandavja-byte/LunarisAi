import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'

/* ── Satellite SVG ──────────────────────────────────────── */
function Satellite({ style }) {
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" fill="none" style={style}>
      {/* Body */}
      <rect x="10" y="6" width="8" height="6" rx="1.5" fill="#3B6FBF" opacity="0.9"/>
      {/* Solar panels */}
      <rect x="1" y="7" width="7" height="4" rx="1" fill="#5A8AD4" opacity="0.8"/>
      <rect x="20" y="7" width="7" height="4" rx="1" fill="#5A8AD4" opacity="0.8"/>
      {/* Panel dividers */}
      <line x1="4.5" y1="7" x2="4.5" y2="11" stroke="#3B6FBF" strokeWidth="0.5" opacity="0.6"/>
      <line x1="23.5" y1="7" x2="23.5" y2="11" stroke="#3B6FBF" strokeWidth="0.6" opacity="0.6"/>
      {/* Antenna */}
      <line x1="14" y1="6" x2="14" y2="2" stroke="#8AADD4" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="14" cy="1.5" r="1" fill="#8AADD4"/>
      {/* Thruster glow */}
      <circle cx="14" cy="12" r="1" fill="#7BA8E8" opacity="0.6"/>
    </svg>
  )
}

/* ── Figure-8 path definition (screen coords relative to center) ─ */
const FIG8_R = 220
const FIG8_RY = 80

function getFig8Point(t) {
  // Lemniscate of Bernoulli parametric form
  const angle = t * Math.PI * 2
  const scale = FIG8_R
  const scaleY = FIG8_RY
  const denom = 1 + Math.sin(angle) * Math.sin(angle)
  const x = (scale * Math.cos(angle)) / denom
  const y = (scaleY * Math.sin(angle) * Math.cos(angle)) / denom
  return { x, y }
}

/* ── Orbital trail ──────────────────────────────────────── */
function OrbitalTrail({ opacity }) {
  const points = Array.from({ length: 120 }, (_, i) => {
    const p = getFig8Point(i / 120)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <svg
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity,
        transition: 'opacity 1.2s ease',
      }}
      width={FIG8_R * 2 + 60}
      height={FIG8_RY * 2 + 60}
      viewBox={`${-FIG8_R - 30} ${-FIG8_RY - 30} ${FIG8_R * 2 + 60} ${FIG8_RY * 2 + 60}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="0.6"
        strokeDasharray="3 6"
        opacity="0.25"
      />
    </svg>
  )
}

/* ── Hero ───────────────────────────────────────────────── */
export default function Hero() {
  const containerRef = useRef(null)
  const letters = 'LUNARIS'.split('')

  // Mouse parallax state
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [lightPos, setLightPos] = useState({ x: 50, y: 50 })

  // Satellite animation
  const satRef = useRef(null)
  const [satPos, setSatPos] = useState({ x: 0, y: -FIG8_RY })
  const [satPhase, setSatPhase] = useState('orbit') // orbit | float | behind
  const [trailOpacity, setTrailOpacity] = useState(0)
  const animRef = useRef(null)
  const startTimeRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height
    setMouse({ x: dx, y: dy })
    setLightPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  // Satellite animation loop
  useEffect(() => {
    let raf
    let figureEightDone = false
    const ORBIT_DURATION = 5000 // one full figure-8 in ms
    const FLOAT_SPEED = 0.00008

    const tick = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current

      if (!figureEightDone) {
        // Phase 1: figure-8 orbit (one full cycle)
        const t = elapsed / ORBIT_DURATION
        if (t <= 1) {
          setTrailOpacity(Math.min(t * 2, 0.8))
          const p = getFig8Point(t)
          setSatPos(p)
        } else {
          figureEightDone = true
          setSatPhase('float')
          startTimeRef.current = timestamp
        }
      } else {
        // Phase 2+3: slow float / elliptical drift
        const t2 = elapsed * FLOAT_SPEED
        const x = Math.cos(t2) * 90
        const y = Math.sin(t2 * 0.7) * 35

        // Phase 3: go behind text when near center
        if (Math.abs(x) < 60) {
          setSatPhase('behind')
        } else {
          setSatPhase('float')
        }
        setSatPos({ x, y })
      }
      raf = requestAnimationFrame(tick)
    }

    // Delay start slightly for title entrance
    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(tick)
    }, 1200)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Subtle cursor light */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(600px circle at ${lightPos.x}% ${lightPos.y}%, rgba(59,111,191,0.06), transparent 70%)`,
        transition: 'background 0.1s linear',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--border-light) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-light) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      {/* Orbital trail */}
      <OrbitalTrail opacity={trailOpacity * 0.6} />

      {/* Satellite layer — behind text when phase=behind */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${satPos.x}px), calc(-50% + ${satPos.y - 8}px))`,
        zIndex: satPhase === 'behind' ? 1 : 3,
        pointerEvents: 'none',
        transition: 'z-index 0s',
      }}>
        <Satellite style={{ filter: 'drop-shadow(0 0 6px rgba(59,111,191,0.5))' }} />
      </div>

      {/* LUNARIS title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0px',
        }}>
          {letters.map((letter, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'clamp(72px, 14vw, 160px)',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                display: 'inline-block',
                transform: `translate(${mouse.x * (i - 3) * 2.5}px, ${mouse.y * 4}px)`,
                transition: 'transform 0.15s ease-out',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 'clamp(14px, 2vw, 18px)',
            letterSpacing: '0.25em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginTop: '20px',
          }}
        >
          Multi-modal lunar image correspondence
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.0 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(16px, 2.2vw, 22px)',
            color: 'var(--text-secondary)',
            marginTop: '28px',
            letterSpacing: '0.01em',
          }}
        >
          Three sensors. Different light. One lunar surface.
        </motion.p>
      </motion.div>

      {/* Decorative labels */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '48px',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {[
          '23.4°N 47.2°E',
          'OHRC / TMC-2 / IIRS',
          'LUNAR SURFACE',
        ].map(label => (
          <span key={label} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            opacity: 0.7,
          }}>{label}</span>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        style={{
          position: 'absolute',
          top: '50%',
          right: '48px',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end',
        }}
      >
        {[
          'CHANDRAYAAN-2',
          'CORRESPONDENCE ENGINE',
          'MATCH ID: 004821',
        ].map(label => (
          <span key={label} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            opacity: 0.7,
          }}>{label}</span>
        ))}
      </motion.div>

      {/* Crosshair decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        {[
          { top: '20%', left: '15%' },
          { top: '75%', left: '8%' },
          { top: '30%', right: '12%' },
          { bottom: '20%', right: '18%' },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...pos,
            width: '14px',
            height: '14px',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--accent)', opacity: 0.3 }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--accent)', opacity: 0.3 }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '3px', height: '3px', borderRadius: '50%', background: 'var(--accent)', transform: 'translate(-50%,-50%)', opacity: 0.5 }} />
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '32px',
            background: 'linear-gradient(to bottom, var(--text-muted), transparent)',
            opacity: 0.5,
          }}
        />
      </motion.div>
    </section>
  )
}
