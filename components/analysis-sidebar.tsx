"use client"

import { type FeatureId, type Region } from "@/lib/analyzer-data"
import { WaterDial } from "@/components/water-dial"
import { SpectralLegend } from "@/components/spectral-legend"
import { StatCard } from "@/components/stat-card"

type Props = {
  feature: FeatureId
  region: Region
}

const MINERAL_META: {
  key: keyof Region["minerals"]
  label: string
  symbol: string
  color: string
  bg: string
}[] = [
  { key: "fe", label: "Iron",      symbol: "Fe", color: "bg-orange-500",  bg: "bg-orange-500/15" },
  { key: "mg", label: "Magnesium", symbol: "Mg", color: "bg-emerald-500", bg: "bg-emerald-500/15" },
  { key: "ca", label: "Calcium",   symbol: "Ca", color: "bg-sky-500",     bg: "bg-sky-500/15" },
  { key: "si", label: "Silicon",   symbol: "Si", color: "bg-yellow-500",  bg: "bg-yellow-500/15" },
  { key: "al", label: "Aluminum",  symbol: "Al", color: "bg-purple-500",  bg: "bg-purple-500/15" },
  { key: "ti", label: "Titanium",  symbol: "Ti", color: "bg-teal-500",    bg: "bg-teal-500/15" },
]

// Icons
const TempIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
)

const DropIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
)




export function AnalysisSidebar({ feature, region }: Props) {
  return (
    <aside className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>

      {/* Thermal + Hydration stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<TempIcon />}
          label="Peak Temp"
          value={region.peakTemp}
          accent={region.peakTemp.startsWith("+") ? "amber" : "green"}
        />
        <StatCard
          icon={<DropIcon />}
          label="Hydration"
          value={region.hydrationPpm}
          accent="default"
        />
      </div>

      {/* Mineral composition bars */}
      <section className="glass rounded-xl p-4">
        <h3 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Mineral Composition
        </h3>
        <div className="flex flex-col gap-3.5">
          {MINERAL_META.map((m) => {
            const val = region.minerals[m.key]
            return (
              <div key={m.key}>
                <div className="mb-1.5 flex items-center justify-between font-mono text-[11px]">
                  <span className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold text-white ${m.color}`}>
                      {m.symbol}
                    </span>
                    <span className="text-foreground">{m.label}</span>
                  </span>
                  <span className="text-muted-foreground">{val}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${m.color}`}
                    style={{
                      width: `${val}%`,
                      transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Water probability dial */}
      <section className="glass rounded-xl p-4">
        <WaterDial value={region.waterProbability} />
      </section>

      {/* Spectral legend */}
      <SpectralLegend feature={feature} />

      {/* Scientific signatures */}
      <section className="glass rounded-xl p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Scientific Signatures
        </h3>
        <ul className="flex flex-col gap-2.5">
          {region.signatures.map((sig) => (
            <li key={sig.label} className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  sig.detected
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                    : "border-border bg-muted/50 text-muted-foreground/50"
                }`}
                aria-hidden="true"
              >
                {sig.detected ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className={`font-mono text-[11px] leading-tight ${
                  sig.detected ? "text-foreground" : "text-muted-foreground/50 line-through"
                }`}
              >
                {sig.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Spatial Confidence Matrix */}
      <section className="glass rounded-xl p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
          <span>Spatial Confidence Matrix</span>
          <span className={region.aiConfidence.score > 85 ? "text-emerald-400" : region.aiConfidence.score > 65 ? "text-amber-400" : "text-red-400"}>
            {region.aiConfidence.score.toFixed(1)}%
          </span>
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>Inlier Match Ratio (w1)</span>
            <span className="text-foreground">{region.aiConfidence.similarity}%</span>
          </div>
          <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>RMSE Reprojection (w2)</span>
            <span className="text-foreground">{region.aiConfidence.reprojectionError.toFixed(2)}</span>
          </div>
          <div className={`mt-2 flex items-center justify-center rounded border px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider ${
            region.aiConfidence.score > 85 
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
              : region.aiConfidence.score > 65 
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400" 
                : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}>
            {region.aiConfidence.score > 85 ? "Auto-Accepted" : region.aiConfidence.score > 65 ? "Flagged for Review" : "Sent to Scientist"}
          </div>
        </div>
      </section>

      {/* Landing Suitability */}
      <section className="glass rounded-xl p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
          <span>Landing Suitability</span>
          <span className={region.landingSuitability.score > 80 ? "text-emerald-400" : region.landingSuitability.score > 60 ? "text-amber-400" : "text-red-400"}>
            {region.landingSuitability.score.toFixed(1)}
          </span>
        </h3>
        <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
          <div className="flex flex-col rounded border border-border bg-muted/20 p-1.5">
            <span className="text-muted-foreground">Slope</span>
            <span className="text-[11px] text-foreground">{region.landingSuitability.slope}</span>
          </div>
          <div className="flex flex-col rounded border border-border bg-muted/20 p-1.5">
            <span className="text-muted-foreground">Hazard</span>
            <span className="text-[11px] text-foreground">{region.landingSuitability.craterHazard}</span>
          </div>
          <div className="flex flex-col rounded border border-border bg-muted/20 p-1.5">
            <span className="text-muted-foreground">Boulders</span>
            <span className="text-[11px] text-foreground">{region.landingSuitability.boulderDensity}</span>
          </div>
          <div className="flex flex-col rounded border border-border bg-muted/20 p-1.5">
            <span className="text-muted-foreground">Illum.</span>
            <span className="text-[11px] text-foreground">{region.landingSuitability.illumination}</span>
          </div>
        </div>
        <div className={`mt-3 flex items-center justify-center rounded border px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider ${
            region.landingSuitability.score > 80 
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
              : region.landingSuitability.score > 60 
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400" 
                : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}>
            {region.landingSuitability.score > 80 ? "Safe Site" : region.landingSuitability.score > 60 ? "Moderate Risk" : "Hazardous Zone"}
        </div>
      </section>
    </aside>
  )
}
