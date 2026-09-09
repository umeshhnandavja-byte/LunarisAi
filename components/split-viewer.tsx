"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { compositeAlpha, getFeature, mapFeature, type FeatureId, type Region } from "@/lib/analyzer-data"

type Props = {
  feature: FeatureId
  opacity: number
  region: Region
}

type MineralCluster = { x: number; y: number; radius: number; intensity: number }

const MINERAL_CONFIGS: Record<string, { color: string, isRare: boolean, clusters: MineralCluster[] }> = {
  iron: { color: "255, 69, 0", isRare: false, clusters: [
    { x: 0.73, y: 0.84, radius: 0.08, intensity: 0.8 }, // Near Launch Site
    { x: 0.20, y: 0.30, radius: 0.25, intensity: 0.7 },
    { x: 0.50, y: 0.80, radius: 0.15, intensity: 0.6 },
    { x: 0.80, y: 0.20, radius: 0.18, intensity: 0.8 },
  ]},
  magnesium: { color: "50, 205, 50", isRare: false, clusters: [
    { x: 0.76, y: 0.86, radius: 0.06, intensity: 0.8 }, // Near Launch Site
    { x: 0.40, y: 0.40, radius: 0.20, intensity: 0.6 },
    { x: 0.10, y: 0.70, radius: 0.12, intensity: 0.7 },
    { x: 0.90, y: 0.50, radius: 0.18, intensity: 0.9 },
  ]},
  calcium: { color: "30, 144, 255", isRare: false, clusters: [
    { x: 0.74, y: 0.83, radius: 0.07, intensity: 0.8 }, // Near Launch Site
    { x: 0.30, y: 0.20, radius: 0.30, intensity: 0.6 },
    { x: 0.60, y: 0.10, radius: 0.15, intensity: 0.7 },
    { x: 0.15, y: 0.85, radius: 0.22, intensity: 0.8 },
  ]},
  silicon: { color: "138, 43, 226", isRare: true, clusters: [
    { x: 0.77, y: 0.87, radius: 0.05, intensity: 0.9 }, // Near Launch Site
    { x: 0.85, y: 0.15, radius: 0.12, intensity: 0.8 },
  ]},
  aluminum: { color: "255, 20, 147", isRare: true, clusters: [
    { x: 0.72, y: 0.86, radius: 0.04, intensity: 0.9 }, // Near Launch Site
    { x: 0.25, y: 0.65, radius: 0.15, intensity: 0.7 },
  ]},
  titanium: { color: "0, 255, 255", isRare: true, clusters: [
    { x: 0.76, y: 0.83, radius: 0.05, intensity: 0.8 }, // Near Launch Site
    { x: 0.55, y: 0.55, radius: 0.18, intensity: 0.6 },
  ]},
  hydration: { color: "173, 216, 230", isRare: true, clusters: [
    { x: 0.74, y: 0.87, radius: 0.06, intensity: 0.9 }, // Near Launch Site
    { x: 0.10, y: 0.10, radius: 0.25, intensity: 0.7 },
  ]},
  separation: { color: "255, 215, 0", isRare: true, clusters: [
    { x: 0.75, y: 0.84, radius: 0.04, intensity: 0.8 }, // Near Launch Site
    { x: 0.45, y: 0.25, radius: 0.10, intensity: 0.9 },
  ]}
}

export function SplitViewer({ feature, opacity, region }: Props) {
  const containerRef      = useRef<HTMLDivElement>(null)
  const overlayCanvasRef  = useRef<HTMLCanvasElement>(null)
  const baseImageDataRef  = useRef<ImageData | null>(null)
  const [split, setSplit] = useState(52)
  const [dragging, setDragging] = useState(false)
  const [ready, setReady]   = useState(false)
  const [scanning, setScanning] = useState(true)
  const [aspectRatio, setAspectRatio] = useState("1/1")

  const config = getFeature(feature)

  // Load panchromatic source once
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/lunar-panchromatic.png"
    img.onload = () => {
      const c = document.createElement("canvas")
      c.width  = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext("2d")
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      baseImageDataRef.current = ctx.getImageData(0, 0, c.width, c.height)
      const oc = overlayCanvasRef.current
      if (oc) { oc.width = c.width; oc.height = c.height }
      setAspectRatio(`${img.naturalWidth}/${img.naturalHeight}`)
      setReady(true)
      // Hide scanning skeleton after a brief moment
      setTimeout(() => setScanning(false), 600)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (feature === "thermal") return

    const canvas = overlayCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const config = MINERAL_CONFIGS[feature]
    if (!config) return

    const w = canvas.width
    const h = canvas.height

    const targetX = region.landingSuitability.targetPos.x / 100
    const targetY = region.landingSuitability.targetPos.y / 100

    // Draw realistic glowing heatmap clusters
    config.clusters.forEach((cluster, index) => {
      // Force the first cluster to dynamically align with the region's target position,
      // but retain its slight unique offset from the original center (0.75, 0.85)
      const actualX = index === 0 ? targetX + (cluster.x - 0.75) : cluster.x
      const actualY = index === 0 ? targetY + (cluster.y - 0.85) : cluster.y

      const cx = actualX * w
      const cy = actualY * h
      const r = cluster.radius * Math.max(w, h)

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      grad.addColorStop(0, `rgba(${config.color}, ${cluster.intensity})`)
      grad.addColorStop(0.3, `rgba(${config.color}, ${cluster.intensity * 0.6})`)
      grad.addColorStop(0.7, `rgba(${config.color}, ${cluster.intensity * 0.2})`)
      grad.addColorStop(1, `rgba(${config.color}, 0)`)

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
    })

  }, [feature, ready, region])

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct  = ((clientX - rect.left) / rect.width) * 100
    setSplit(Math.max(2, Math.min(98, pct)))
  }, [])

  useEffect(() => {
    if (!dragging) return
    const move = (e: PointerEvent) => updateFromClientX(e.clientX)
    const up   = () => setDragging(false)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup",   up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup",   up)
    }
  }, [dragging, updateFromClientX])

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden rounded-xl border border-border bg-black touch-none"
        style={{ aspectRatio }}
      >
        {/* Scanning skeleton overlay */}
        {scanning && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            {/* Animated scan line */}
            <div className="pointer-events-none absolute inset-x-0 h-0.5 bg-primary/60 animate-scan-line shadow-[0_0_12px_var(--color-primary)]" />
            <div className="relative h-10 w-10 rounded-full border border-primary/40 bg-primary/10">
              <span className="absolute inset-0 animate-ping rounded-full border border-primary/30" />
              <svg className="absolute inset-0 m-auto text-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none" />
                <circle cx="15" cy="14" r="2.4" />
              </svg>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Loading spectral cube…
            </p>
          </div>
        )}

        {/* Panchromatic base */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lunar-panchromatic.png"
          alt="Chandrayaan-2 OHRC panchromatic terrain of the lunar surface"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* False-color layer clipped to the right of divider */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
          {feature === "thermal" ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/lunar-thermal.jpg"
              alt="Colorful Thermal Heatmap"
              className="absolute inset-0 h-full w-full object-cover mix-blend-color-dodge"
              style={{ opacity: Math.max(0.3, opacity) }}
              draggable={false}
            />
          ) : (
            <canvas
              ref={overlayCanvasRef}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
              style={{ opacity }}
            />
          )}
        </div>


        {/* Glowing divider */}
        <div
          className="absolute inset-y-0 z-10 w-px bg-primary shadow-[0_0_16px_var(--color-primary)]"
          style={{ left: `${split}%`, transition: dragging ? "none" : undefined }}
          aria-hidden="true"
        />

        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag to compare panchromatic and IIRS layers"
          onPointerDown={(e) => {
            ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
            setDragging(true)
          }}
          style={{ left: `${split}%` }}
          className="absolute top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-primary/80 bg-background/90 text-primary shadow-[var(--glow-primary)] backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m9 7-5 5 5 5"  strokeLinecap="round" strokeLinejoin="round" />
            <path d="m15 7 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Crosshair grid overlay (very subtle) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "10% 10%",
          }}
          aria-hidden="true"
        />
        {/* Landing Site Target Overlay */}
        <div
          className={`absolute z-20 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-none`}
          style={{
            left: `${region.landingSuitability.targetPos.x}%`,
            top: `${region.landingSuitability.targetPos.y}%`,
          }}
        >
          {/* Target Box */}
          <div className={`relative flex h-14 w-14 items-center justify-center border-2 shadow-lg backdrop-blur-sm ${
            region.landingSuitability.score > 80 
              ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
              : region.landingSuitability.score > 60 
                ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                : "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          }`}>
            <span className={`absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 ${region.landingSuitability.score > 80 ? 'border-emerald-500' : region.landingSuitability.score > 60 ? 'border-amber-500' : 'border-red-500'}`} />
            <span className={`absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 ${region.landingSuitability.score > 80 ? 'border-emerald-500' : region.landingSuitability.score > 60 ? 'border-amber-500' : 'border-red-500'}`} />
            <span className={`absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 ${region.landingSuitability.score > 80 ? 'border-emerald-500' : region.landingSuitability.score > 60 ? 'border-amber-500' : 'border-red-500'}`} />
            <span className={`absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 ${region.landingSuitability.score > 80 ? 'border-emerald-500' : region.landingSuitability.score > 60 ? 'border-amber-500' : 'border-red-500'}`} />
            <div className={`h-1 w-1 rounded-full ${region.landingSuitability.score > 80 ? 'bg-emerald-500' : region.landingSuitability.score > 60 ? 'bg-amber-500' : 'bg-red-500'} animate-ping`} />
          </div>
          
          {/* Label */}
          <div className={`mt-2 rounded px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-md ${
            region.landingSuitability.score > 80 ? "bg-emerald-600/80" : region.landingSuitability.score > 60 ? "bg-amber-600/80" : "bg-red-600/80"
          }`}>
            {region.landingSuitability.score > 80 ? "SAFE SITE" : region.landingSuitability.score > 60 ? "MODERATE RISK" : "HAZARDOUS"}
          </div>
        </div>
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
        {config.description}
      </p>
    </div>
  )
}

