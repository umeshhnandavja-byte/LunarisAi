import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ── Lunar surface SVG ──────────────────────────────────── */
function LunarPanel({ variant, style }) {
  const configs = {
    ohrc: {
      bg: ['#D4CFC6', '#B8B0A4', '#9E9488'],
      craterPos: [{ cx: 60, cy: 70, r: 30 }, { cx: 150, cy: 40, r: 18 }, { cx: 100, cy: 130, r: 12 }],
      label: 'OHRC',
      sublabel: 'Optical High Resolution Camera',
      filter: 'contrast(1.1) brightness(1.05)',
    },
    tmc2: {
      bg: ['#C8C2B6', '#AAA498', '#928C82'],
      craterPos: [{ cx: 80, cy: 60, r: 35 }, { cx: 160, cy: 100, r: 22 }, { cx: 50, cy: 140, r: 15 }],
      label: 'TMC-2',
      sublabel: 'Terrain Mapping Camera',
      filter: 'contrast(0.95) brightness(0.92) saturate(0.8)',
    },
    iirs: {
      bg: ['#BEB8AE', '#A09898', '#887E80'],
      craterPos: [{ cx: 70, cy: 80, r: 28 }, { cx: 140, cy: 45, r: 20 }, { cx: 100, cy: 140, r: 16 }],
      label: 'IIRS',
      sublabel: 'Imaging Infrared Spectrometer',
      filter: 'contrast(0.9) brightness(0.88) hue-rotate(10deg)',
    },
  }
  const c = configs[variant]

  return (
    <div style={{ position: 'relative', ...style }}>
      <svg
        viewBox="0 0 200 170"
        width="100%"
        style={{ display: 'block', borderRadius: '4px', filter: c.filter }}
      >
        <defs>
          <radialGradient id={`bg-${variant}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor={c.bg[0]} />
            <stop offset="55%" stopColor={c.bg[1]} />
            <stop offset="100%" stopColor={c.bg[2]} />
          </radialGradient>
          {c.craterPos.map((cr, i) => (
            <radialGradient key={i} id={`crater-${variant}-${i}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="40%" stopColor="rgba(0,0,0,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
            </radialGradient>
          ))}
        </defs>
        {/* Base surface */}
        <rect width="200" height="170" fill={`url(#bg-${variant})`} />
        {/* Terrain texture lines */}
        {Array.from({ length: 14 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 13}
            x2="200"
            y2={i * 13 + (i % 3 === 0 ? 6 : 0)}
            stroke="rgba(0,0,0,0.04)"
            strokeWidth="1"
          />
        ))}
        {/* Craters */}
        {c.craterPos.map((cr, i) => (
          <g key={i}>
            <ellipse
              cx={cr.cx}
              cy={cr.cy}
              rx={cr.r}
              ry={cr.r * 0.7}
              fill={`url(#crater-${variant}-${i})`}
            />
            <ellipse
              cx={cr.cx}
              cy={cr.cy}
              rx={cr.r}
              ry={cr.r * 0.7}
              fill="none"
              stroke="rgba(0,0,0,0.12)"
              strokeWidth="0.8"
            />
            {/* Rim highlight */}
            <ellipse
              cx={cr.cx - cr.r * 0.15}
              cy={cr.cy - cr.r * 0.2}
              rx={cr.r * 0.7}
              ry={cr.r * 0.45}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.2"
            />
          </g>
        ))}
        {/* Small surface details */}
        {[
          { x: 120, y: 100, r: 5 }, { x: 30, y: 50, r: 3 }, { x: 170, y: 140, r: 4 },
          { x: 90, y: 20, r: 2 }, { x: 10, y: 120, r: 6 },
        ].map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="rgba(0,0,0,0.07)" />
        ))}
      </svg>

      {/* Sensor label */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px 14px 10px',
        background: 'linear-gradient(transparent, rgba(30,26,22,0.6))',
        borderRadius: '0 0 4px 4px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 500,
        }}>{c.label}</div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '2px',
        }}>{c.sublabel}</div>
      </div>
    </div>
  )
}

const sectionStyle = {
  padding: '140px 48px',
  maxWidth: '1200px',
  margin: '0 auto',
}

export default function ProblemSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const p0Rotate = useTransform(scrollYProgress, [0.1, 0.6], [0, 2])
  const p0Scale = useTransform(scrollYProgress, [0.1, 0.6], [1, 1.06])
  const p0Brightness = useTransform(scrollYProgress, [0.1, 0.6], [1, 1.18])

  const p1Rotate = useTransform(scrollYProgress, [0.15, 0.65], [0, -1.5])
  const p1Scale = useTransform(scrollYProgress, [0.15, 0.65], [1, 0.93])

  const p2Rotate = useTransform(scrollYProgress, [0.1, 0.6], [0, 1.2])
  const p2Scale = useTransform(scrollYProgress, [0.1, 0.6], [1, 1.1])

  const labelOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1])

  const tags = ['SUN ANGLE', 'SCALE', 'VIEWPOINT', 'SENSOR']

  return (
    <section ref={ref} style={{ background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={sectionStyle}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '20px',
          }}>The Challenge</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 60px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: '700px',
            marginBottom: '16px',
          }}>
            The Moon doesn't look<br />the same twice.
          </h2>
          <p style={{ maxWidth: '520px', color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.7 }}>
            Chandrayaan-2 captures the lunar surface through three sensors, each with
            different characteristics, scales, and viewing angles — making correspondence
            a fundamental challenge.
          </p>
        </motion.div>

        {/* Tags */}
        <motion.div style={{ opacity: labelOpacity }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            margin: '40px 0 56px',
          }}>
            {tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: 'var(--text-accent)',
                padding: '5px 12px',
                border: '1px solid var(--accent)',
                borderRadius: '2px',
                opacity: 0.8,
              }}>{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* Three panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {[
            { variant: 'ohrc', rotate: p0Rotate, scale: p0Scale },
            { variant: 'tmc2', rotate: p1Rotate, scale: p1Scale },
            { variant: 'iirs', rotate: p2Rotate, scale: p2Scale },
          ].map(({ variant, rotate, scale }) => (
            <motion.div
              key={variant}
              style={{
                rotate,
                scale,
                transformOrigin: 'center center',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                overflow: 'hidden',
                background: '#1A1816',
              }}
            >
              <LunarPanel variant={variant} />
            </motion.div>
          ))}
        </div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginTop: '24px',
            textAlign: 'center',
          }}
        >
          Same lunar region — three different sensor perspectives
        </motion.p>
      </div>
    </section>
  )
}
