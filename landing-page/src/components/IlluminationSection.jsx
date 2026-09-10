import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function IlluminationSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // Light angle goes from left (0°) to top (90°) to right (180°) as scroll progresses
  const lightAngle = useTransform(scrollYProgress, [0.1, 0.85], [0, 180])
  const lightX = useTransform(lightAngle, a => 50 + 45 * Math.cos((a - 90) * Math.PI / 180))
  const lightY = useTransform(lightAngle, a => 50 - 45 * Math.sin(a * Math.PI / 180))

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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}>
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
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
            }}>Section 04</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}>
              Same terrain.<br />Different light.
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '16px',
              lineHeight: 1.7,
              marginBottom: '32px',
              maxWidth: '400px',
            }}>
              As the sun angle shifts across the lunar day, craters that were visible
              disappear into shadow. Highlands become valleys. The same surface looks
              completely foreign.
            </p>

            <div style={{
              padding: '16px 20px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
              display: 'inline-block',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
              }}>
                "LUNARIS looks beyond the lighting."
              </p>
            </div>
          </motion.div>

          {/* Right: animated lunar surface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-80px' }}
            style={{ position: 'relative' }}
          >
            {/* Light source indicator */}
            <motion.div
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
              }}
            >
              <motion.div style={{
                position: 'absolute',
                left: lightX.get() ? `${lightX.get()}%` : '50%',
                top: 0,
                transform: 'translate(-50%, -50%)',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#F5D87A',
                boxShadow: '0 0 20px rgba(245,216,122,0.8)',
              }} />
            </motion.div>

            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#12100E',
              position: 'relative',
              aspectRatio: '1',
            }}>
              {/* Animated light + terrain SVG */}
              <motion.div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ display: 'block' }}>
                  <defs>
                    {/* Dynamic light radial gradient — updated per animation frame */}
                    <radialGradient id="sun-light" cx="50%" cy="10%" r="90%" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(245,224,170,0.7)" />
                      <stop offset="40%" stopColor="rgba(200,196,180,0.3)" />
                      <stop offset="100%" stopColor="rgba(30,28,24,0.9)" />
                    </radialGradient>
                    <radialGradient id="terrain-base" cx="50%" cy="50%" r="70%">
                      <stop offset="0%" stopColor="#8E887E" />
                      <stop offset="100%" stopColor="#3A3630" />
                    </radialGradient>
                    {/* Main crater */}
                    <radialGradient id="crater-main" cx="40%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="rgba(255,255,240,0.15)" />
                      <stop offset="50%" stopColor="rgba(0,0,0,0.2)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                    </radialGradient>
                  </defs>

                  {/* Base terrain */}
                  <rect width="300" height="300" fill="url(#terrain-base)" />

                  {/* Terrain features */}
                  {/* Main large crater */}
                  <ellipse cx="150" cy="145" rx="70" ry="55" fill="url(#crater-main)" />
                  <ellipse cx="150" cy="145" rx="70" ry="55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                  {/* Rim highlight */}
                  <ellipse cx="140" cy="130" rx="58" ry="45" fill="none" stroke="rgba(255,255,240,0.1)" strokeWidth="2" />

                  {/* Secondary craters */}
                  <ellipse cx="55" cy="80" rx="30" ry="22" fill="rgba(0,0,0,0.35)" />
                  <ellipse cx="55" cy="80" rx="30" ry="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <ellipse cx="240" cy="220" rx="24" ry="18" fill="rgba(0,0,0,0.3)" />
                  <ellipse cx="240" cy="220" rx="24" ry="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <ellipse cx="210" cy="65" rx="18" ry="13" fill="rgba(0,0,0,0.28)" />
                  <ellipse cx="70" cy="230" rx="15" ry="11" fill="rgba(0,0,0,0.25)" />

                  {/* Ridges */}
                  <path d="M 0 180 Q 80 165 150 175 Q 220 185 300 170" fill="none" stroke="rgba(180,174,164,0.2)" strokeWidth="2" />
                  <path d="M 0 100 Q 60 90 130 95 Q 200 100 300 88" fill="none" stroke="rgba(180,174,164,0.15)" strokeWidth="1.5" />

                  {/* Light overlay — animated */}
                  <motion.ellipse
                    cx={150}
                    cy={145}
                    rx={200}
                    ry={200}
                    style={{
                      fill: 'url(#sun-light)',
                      transformOrigin: '150px 145px',
                    }}
                    animate={{
                      rotate: [0, 120, 240, 360],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  {/* Moving shadow overlay */}
                  <motion.rect
                    x="0" y="0" width="300" height="300"
                    animate={{
                      fill: [
                        'rgba(20,18,14,0.55)',
                        'rgba(20,18,14,0.2)',
                        'rgba(20,18,14,0.55)',
                      ],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Highlight strip simulating sun direction */}
                  <motion.rect
                    y="0" height="300" width="60"
                    animate={{
                      x: [-60, 340],
                      opacity: [0, 0.08, 0.08, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: [0.37, 0, 0.63, 1],
                      repeatDelay: 2,
                    }}
                    fill="rgba(255,240,200,1)"
                  />
                </svg>

                {/* Label */}
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '3px 8px',
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: '2px',
                  backdropFilter: 'blur(4px)',
                }}>ILLUMINATION VARIATION</div>

                {/* Sun angle readout */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    right: '14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    color: 'rgba(245,216,122,0.7)',
                  }}
                >SUN ANGLE: VAR</motion.div>
              </motion.div>
            </div>

            {/* Light arc indicator below */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              padding: '0 4px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>DAWN</span>
              <div style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(to right, var(--border), var(--accent), var(--border))',
                margin: '0 12px',
                opacity: 0.5,
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>DUSK</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
