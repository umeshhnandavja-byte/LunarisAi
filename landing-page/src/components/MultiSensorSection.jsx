import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

/* ─── Phase timing (ms) ─────────────────────────────────── */
const T_PANELS   = 2200   // show 3 panels
const T_MERGE    = 900    // panels slide to center
const T_MINERAL  = 2600   // show mineral overlay
const T_FLIP     = 500    // cross-fade between overlays
const T_COORD    = 2600   // show coordinate overlay
const T_RESET    = 700    // fade back to 3 panels

/* ─── Step labels ───────────────────────────────────────── */
const STEPS = [
  {
    sensor: 'OHRC',
    num: '01',
    title: 'Optical Detection',
    desc: 'High-resolution optical imagery captures surface texture and feature geometry at 0.25 m/px.',
    color: '#3B8FE8',
  },
  {
    sensor: 'TMC-2',
    num: '02',
    title: 'Terrain Mapping',
    desc: 'Stereo terrain data provides elevation context and 3D surface structure for spatial reasoning.',
    color: '#E87B3B',
  },
  {
    sensor: 'IIRS',
    num: '03',
    title: 'Spectral Analysis',
    desc: 'Infrared spectrometry reveals mineral composition, enabling material-aware correspondence.',
    color: '#5BAF68',
  },
]

/* ─── Lunar surface SVG base ────────────────────────────── */
function LunarBase({ id, brightness = 1 }) {
  return (
    <svg viewBox="0 0 360 260" width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, display: 'block', filter: `brightness(${brightness})` }}>
      <defs>
        <radialGradient id={`lb-bg-${id}`} cx="42%" cy="36%" r="72%">
          <stop offset="0%" stopColor="#D0CAC0" />
          <stop offset="55%" stopColor="#A8A098" />
          <stop offset="100%" stopColor="#787068" />
        </radialGradient>
        <radialGradient id={`lb-c1-${id}`} cx="40%" cy="35%" r="62%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.44)" />
        </radialGradient>
        <radialGradient id={`lb-c2-${id}`} cx="40%" cy="35%" r="62%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
      </defs>
      <rect width="360" height="260" fill={`url(#lb-bg-${id})`} />
      {/* Main crater */}
      <ellipse cx="180" cy="128" rx="80" ry="60" fill={`url(#lb-c1-${id})`} />
      <ellipse cx="180" cy="128" rx="80" ry="60" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
      <ellipse cx="172" cy="118" rx="66" ry="49" fill="none" stroke="rgba(255,255,240,0.1)" strokeWidth="1.5" />
      {/* Secondary craters */}
      <ellipse cx="62"  cy="62"  rx="32" ry="23" fill={`url(#lb-c2-${id})`} />
      <ellipse cx="296" cy="196" rx="26" ry="19" fill={`url(#lb-c2-${id})`} />
      <ellipse cx="295" cy="70"  rx="20" ry="14" fill="rgba(0,0,0,0.22)" />
      <ellipse cx="68"  cy="200" rx="16" ry="11" fill="rgba(0,0,0,0.18)" />
      {/* Texture lines */}
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1="0" y1={i * 20} x2="360" y2={i * 20}
          stroke="rgba(0,0,0,0.025)" strokeWidth="1" />
      ))}
    </svg>
  )
}

/* ─── Mineral overlay ────────────────────────────────────── */
const MINERALS = [
  { x: '32%', y: '38%', label: 'Pyroxene',  color: '#E07840', desc: 'Ca,Fe,Mg' },
  { x: '55%', y: '25%', label: 'Olivine',   color: '#5BAF68', desc: 'Mg₂SiO₄'  },
  { x: '68%', y: '52%', label: 'Ilmenite',  color: '#8B6FD4', desc: 'FeTiO₃'   },
  { x: '24%', y: '65%', label: 'Anorthosite',color:'#D4A840', desc: 'CaAl₂Si₂O₈' },
  { x: '72%', y: '72%', label: 'Fe²⁺',      color: '#E05050', desc: 'Iron oxide' },
  { x: '46%', y: '78%', label: 'Glass',     color: '#7ABCD4', desc: 'Impact melt' },
]

function MineralOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Header badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        letterSpacing: '0.16em', color: 'rgba(255,255,255,0.8)',
        background: 'rgba(0,0,0,0.5)', padding: '4px 10px',
        borderRadius: '2px', backdropFilter: 'blur(4px)',
      }}>IIRS · MINERAL MAP</div>

      {/* Mineral dots */}
      {MINERALS.map((m, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.08, duration: 0.35, type: 'spring', stiffness: 280 }}
          style={{ position: 'absolute', left: m.x, top: m.y, transform: 'translate(-50%,-50%)' }}
        >
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
            style={{
              position: 'absolute', inset: '-5px', borderRadius: '50%',
              border: `1px solid ${m.color}`,
            }}
          />
          {/* Dot */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: m.color, border: '2px solid rgba(255,255,255,0.85)',
            boxShadow: `0 0 10px ${m.color}90`,
            position: 'relative',
          }} />
          {/* Label chip */}
          <div style={{
            position: 'absolute', top: -26, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,8,6,0.72)',
            border: `1px solid ${m.color}55`,
            borderRadius: '3px', padding: '2px 6px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(6px)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: m.color, letterSpacing: '0.08em' }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>{m.desc}</div>
          </div>
        </motion.div>
      ))}

      {/* Spectral colour scale */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        background: 'rgba(0,0,0,0.55)', borderRadius: '4px',
        padding: '6px 10px', backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginBottom: 4 }}>SPECTRAL INDEX</div>
        <div style={{ height: 6, width: 100, borderRadius: 2, background: 'linear-gradient(to right, #5BAF68, #D4A840, #E07840, #E05050, #8B6FD4)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          {['Low', 'High'].map(l => (
            <span key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(255,255,255,0.35)' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Coordinate overlay ─────────────────────────────────── */
const COORD_POINTS = [
  { x: '32%', y: '38%', lat: '23.41°N', lon: '47.18°E', px: '(1024, 842)' },
  { x: '55%', y: '25%', lat: '23.44°N', lon: '47.23°E', px: '(1561, 612)' },
  { x: '68%', y: '52%', lat: '23.39°N', lon: '47.28°E', px: '(1824, 1094)' },
  { x: '24%', y: '65%', lat: '23.37°N', lon: '47.15°E', px: '(804, 1318)'  },
  { x: '72%', y: '72%', lat: '23.35°N', lon: '47.31°E', px: '(1938, 1492)' },
]

function CoordOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Header badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        letterSpacing: '0.16em', color: 'rgba(255,255,255,0.8)',
        background: 'rgba(0,0,0,0.5)', padding: '4px 10px',
        borderRadius: '2px', backdropFilter: 'blur(4px)',
      }}>OHRC · COORDINATE MAP</div>

      {/* Grid lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[25, 50, 75].map(pct => (
          <g key={pct}>
            <line x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%"
              stroke="rgba(59,111,191,0.2)" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`}
              stroke="rgba(59,111,191,0.2)" strokeWidth="1" strokeDasharray="4 6" />
          </g>
        ))}
        {/* Axis labels */}
        {['23.35°N','23.40°N','23.45°N'].map((l, i) => (
          <text key={l} x="4" y={`${78 - i * 26}%`}
            fontFamily="ui-monospace, monospace" fontSize="7.5" fill="rgba(59,111,191,0.55)" letterSpacing="0.5">{l}</text>
        ))}
        {['47.15°E','47.22°E','47.30°E'].map((l, i) => (
          <text key={l} x={`${12 + i * 30}%`} y="98%"
            fontFamily="ui-monospace, monospace" fontSize="7.5" fill="rgba(59,111,191,0.55)" letterSpacing="0.5">{l}</text>
        ))}
      </svg>

      {/* Coordinate points */}
      {COORD_POINTS.map((pt, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.09, duration: 0.3, type: 'spring', stiffness: 280 }}
          style={{ position: 'absolute', left: pt.x, top: pt.y, transform: 'translate(-50%,-50%)' }}
        >
          {/* Crosshair */}
          <svg width="20" height="20" style={{ position: 'absolute', top: -10, left: -10 }}>
            <line x1="10" y1="0" x2="10" y2="20" stroke="#3B6FBF" strokeWidth="1" opacity="0.7" />
            <line x1="0" y1="10" x2="20" y2="10" stroke="#3B6FBF" strokeWidth="1" opacity="0.7" />
          </svg>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#3B8FE8', border: '2px solid white',
            boxShadow: '0 0 8px rgba(59,143,232,0.8)',
            position: 'relative',
          }} />
          {/* Coordinate chip */}
          <div style={{
            position: 'absolute', top: -48, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,12,20,0.78)',
            border: '1px solid rgba(59,111,191,0.4)',
            borderRadius: '3px', padding: '3px 7px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(6px)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#7AABF0', letterSpacing: '0.06em' }}>{pt.lat} {pt.lon}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>px {pt.px}</div>
          </div>
        </motion.div>
      ))}

      {/* Corner: status */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        fontFamily: 'var(--font-mono)', fontSize: '9px',
        letterSpacing: '0.1em', color: 'rgba(100,170,255,0.7)',
        background: 'rgba(0,0,0,0.5)', padding: '4px 10px',
        borderRadius: '2px', backdropFilter: 'blur(4px)',
      }}>GEOREFERENCED · WGS-84</div>
    </div>
  )
}

/* ─── Small sensor panel (used in "spread" phase) ────────── */
function SensorPanel({ step }) {
  return (
    <div style={{
      position: 'relative',
      aspectRatio: '4/3',
      borderRadius: '6px',
      overflow: 'hidden',
      border: `1px solid ${step.color}30`,
      background: '#161210',
    }}>
      <LunarBase id={step.sensor} brightness={step.sensor === 'IIRS' ? 0.85 : step.sensor === 'TMC-2' ? 0.92 : 1.05} />
      {/* Sensor label */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        letterSpacing: '0.16em', color: 'rgba(255,255,255,0.85)',
        background: 'rgba(0,0,0,0.48)', padding: '3px 8px',
        borderRadius: '2px', backdropFilter: 'blur(4px)',
      }}>{step.sensor}</div>
      {/* Step number */}
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700,
        color: step.color, opacity: 0.18, letterSpacing: '-0.04em',
        lineHeight: 1,
      }}>{step.num}</div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function MultiSensorSection() {
  // phase: 'spread' → 'merging' → 'mineral' → 'flipping-to-coord' → 'coordinate' → 'flipping-to-mineral' → 'mineral' → ... → 'resetting' → 'spread'
  const [phase, setPhase] = useState('spread')
  const [overlay, setOverlay] = useState('mineral') // 'mineral' | 'coordinate'
  const timerRef = useRef(null)

  useEffect(() => {
    const run = () => {
      setPhase('spread')
      setOverlay('mineral')

      timerRef.current = setTimeout(() => {
        setPhase('merging')

        timerRef.current = setTimeout(() => {
          setPhase('merged')
          setOverlay('mineral')

          timerRef.current = setTimeout(() => {
            setOverlay('coordinate')

            timerRef.current = setTimeout(() => {
              setOverlay('mineral')

              timerRef.current = setTimeout(() => {
                setPhase('resetting')

                timerRef.current = setTimeout(run, T_RESET)
              }, T_MINERAL)
            }, T_COORD)
          }, T_MINERAL)
        }, T_MERGE)
      }, T_PANELS)
    }

    run()
    return () => clearTimeout(timerRef.current)
  }, [])

  const isMerged  = phase === 'merged'
  const isReset   = phase === 'resetting'
  const isMerging = phase === 'merging'

  return (
    <section style={{ background: 'var(--bg-warm)', padding: '140px 48px', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          style={{ marginBottom: '64px' }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '0.2em', color: 'var(--accent)',
            textTransform: 'uppercase', display: 'block', marginBottom: '20px',
          }}>Prediction Pipeline</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 58px)',
            fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}>
            Three sensors.<br />One prediction.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.7, maxWidth: '520px' }}>
            LUNARIS fuses optical, terrain, and spectral data across three Chandrayaan-2 sensors
            into a single unified correspondence prediction.
          </p>
        </motion.div>

        {/* ── Three-step labels ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '48px',
            background: 'var(--surface)',
          }}
        >
          {STEPS.map((s, i) => (
            <div key={s.sensor} style={{
              padding: '24px 28px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              position: 'relative',
            }}>
              {/* Step accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '2px', background: s.color, opacity: 0.7,
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.16em', color: s.color, opacity: 0.9,
                }}>{s.num}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.12em', color: 'var(--text-muted)',
                }}>{s.sensor}</span>
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '16px',
                fontWeight: 500, color: 'var(--text-primary)',
                marginBottom: '8px', letterSpacing: '-0.01em',
              }}>{s.title}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Animation stage ──────────────────────────── */}
        <div style={{
          position: 'relative',
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          {/* Three sensor panels — visible during 'spread' and 'resetting' */}
          {STEPS.map((step, i) => {
            const offsets = [-1, 0, 1]
            const spreadX = offsets[i] * 290

            return (
              <motion.div
                key={step.sensor}
                animate={{
                  x: (isMerged) ? 0 : isMerging ? offsets[i] * 60 : isReset ? 0 : spreadX,
                  scale: (isMerged) ? 0 : isMerging ? 0.6 : isReset ? 0 : 1,
                  opacity: isMerged ? 0 : isReset ? 0 : 1,
                  zIndex: isMerged ? 0 : 2,
                }}
                transition={{
                  duration: isMerging ? 0.75 : isReset ? 0.4 : 0.65,
                  ease: [0.16, 1, 0.3, 1],
                  delay: isMerging ? 0 : phase === 'spread' ? i * 0.08 : 0,
                }}
                style={{
                  position: 'absolute',
                  width: '260px',
                  transformOrigin: 'center center',
                }}
              >
                <SensorPanel step={step} />
                {/* Arrow between panels */}
                {i < 2 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-24px',
                    transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    opacity: 0.4,
                    zIndex: 10,
                  }}>→</div>
                )}
              </motion.div>
            )
          })}

          {/* Merged single image */}
          <AnimatePresence>
            {isMerged && (
              <motion.div
                key="merged"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  width: '540px',
                  maxWidth: '90vw',
                  aspectRatio: '16/9',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid rgba(59,111,191,0.35)',
                  background: '#14120E',
                  boxShadow: '0 0 40px rgba(59,111,191,0.12), 0 0 0 1px rgba(59,111,191,0.1)',
                }}
              >
                {/* Lunar base always visible */}
                <LunarBase id="merged" brightness={1} />

                {/* Overlay cross-fade */}
                <AnimatePresence mode="crossfade">
                  {overlay === 'mineral' ? (
                    <motion.div
                      key="mineral"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <MineralOverlay />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="coordinate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <CoordOverlay />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Overlay type indicator dots */}
                <div style={{
                  position: 'absolute', bottom: 12, left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', gap: '6px', alignItems: 'center',
                }}>
                  {['mineral', 'coordinate'].map(o => (
                    <div key={o} style={{
                      width: overlay === o ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: overlay === o ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)',
                      transition: 'width 0.35s ease, background 0.35s ease',
                    }} />
                  ))}
                </div>

                {/* Scan line */}
                <motion.div
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                  style={{
                    position: 'absolute', left: 0, right: 0, height: '1.5px',
                    background: 'linear-gradient(90deg, transparent, rgba(59,111,191,0.35), transparent)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase label */}
          <motion.div
            key={phase + overlay}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              bottom: -36,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {phase === 'spread'   && 'OHRC · TMC-2 · IIRS — Individual sensor streams'}
            {phase === 'merging'  && 'Fusing sensor data…'}
            {isMerged && overlay === 'mineral'    && 'IIRS SPECTRAL OUTPUT · Mineral composition map'}
            {isMerged && overlay === 'coordinate' && 'OHRC SPATIAL OUTPUT · Georeferenced coordinates'}
            {phase === 'resetting' && 'Resetting…'}
          </motion.div>
        </div>

        {/* ── Bottom result card ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          style={{
            marginTop: '80px',
            padding: '28px 32px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--surface)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.2em', color: 'var(--accent)',
              marginBottom: '10px',
            }}>UNIFIED PREDICTION OUTPUT</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.5vw, 26px)',
              fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em',
            }}>
              Three sensors. Fused. Predicted.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { label: 'CONFIDENCE', value: '94.7%' },
              { label: 'INLIERS',    value: '1,842'  },
              { label: 'RMSE',       value: '0.38 px'},
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '22px',
                  fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em',
                }}>{value}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  letterSpacing: '0.14em', color: 'var(--text-muted)', marginTop: '4px',
                }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
