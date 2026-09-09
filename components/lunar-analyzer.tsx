"use client"

import { useState } from "react"
import { FEATURES, REGIONS, type FeatureId } from "@/lib/analyzer-data"
import { SplitViewer } from "@/components/split-viewer"
import { AnalysisSidebar } from "@/components/analysis-sidebar"
import { TelemetryTicker } from "@/components/telemetry-ticker"
import { ThemeToggle } from "@/components/theme-toggle"

export function LunarAnalyzer() {
  const [feature, setFeature] = useState<FeatureId>("thermal")
  const [opacity, setOpacity] = useState(0.65)
  const [regionId, setRegionId] = useState("tycho")

  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-[var(--glow-primary)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <circle cx="9"  cy="9"  r="1.6" fill="currentColor" stroke="none" />
                <circle cx="15" cy="14" r="2.4" />
                <circle cx="8"  cy="15" r="1"   fill="currentColor" stroke="none" />
              </svg>
              {/* live pulse ring */}
              <span className="absolute inset-0 animate-ping rounded-xl border border-primary/30 opacity-60" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-sans text-base font-bold leading-tight tracking-tight text-foreground">
                Lunaris
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Chandrayaan-2 · IIRS + OHRC
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="hidden items-center gap-3 md:flex">
            <StatusBadge color="green"  label="Uplink Nominal" />
            <StatusBadge color="primary" label="IIRS 800–5000 nm" />
            <StatusBadge color="amber"  label="Orbit 2210" />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <div className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
              UTC 03:07:18
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Telemetry ticker below the header bar */}
        <TelemetryTicker />
      </header>

      {/* ── Main grid ─────────────────────────────────────────────── */}
      <main className="mx-auto grid max-w-[1700px] grid-cols-1 gap-5 px-4 py-5 md:px-6 lg:grid-cols-[1fr_380px]">

        {/* Left column – viewer + controls */}
        <div className="flex flex-col gap-4 animate-fade-in-up">

          {/* Feature layer tabs + opacity */}
          <div className="glass flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Feature pill tabs */}
            <div className="flex-1">
              <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                False-Color Feature Layer
              </p>
              <div className="flex flex-wrap gap-2">
                {FEATURES.map((f) => {
                  const active = f.id === feature
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFeature(f.id)}
                      className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] transition-all duration-200 ${
                        active
                          ? "border-primary/60 bg-primary/15 text-primary shadow-[var(--glow-primary)]"
                          : "border-border bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Opacity slider */}
            <div className="w-full sm:w-52">
              <label
                htmlFor="opacity-range"
                className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                <span>Layer Opacity</span>
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-primary">
                  {Math.round(opacity * 100)}%
                </span>
              </label>
              <div className="relative">
                <input
                  id="opacity-range"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Split viewer */}
          <div className="glass rounded-xl p-4">
            <SplitViewer feature={feature} opacity={opacity} region={region} />
          </div>
        </div>

        {/* Right column – sidebar */}
        <AnalysisSidebar feature={feature} region={region} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
        ISRO · Chandrayaan-2 · IIRS Spectral Pipeline · Simulation Data
      </footer>
    </div>
  )
}

/* ── Status badge helper ─────────────────────────────────────────── */
function StatusBadge({
  color,
  label,
}: {
  color: "green" | "primary" | "amber"
  label: string
}) {
  const dotClass = {
    green:   "bg-emerald-400",
    primary: "bg-primary",
    amber:   "bg-amber-400",
  }[color]

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse-dot`} aria-hidden="true" />
      {label}
    </span>
  )
}
