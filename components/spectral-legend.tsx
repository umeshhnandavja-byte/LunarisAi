import { getFeature, type FeatureId } from "@/lib/analyzer-data"

export function SpectralLegend({ feature }: { feature: FeatureId }) {
  const config = getFeature(feature)
  const [min, mid, max] = config.legendLabels

  return (
    <section className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Spectral Key / Data Scale
        </h3>
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
          {config.legendTitle}
        </span>
      </div>

      {/* Band badge */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Band</span>
        <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
          {config.band}
        </span>
      </div>

      {/* Gradient bar */}
      <div
        className="h-5 w-full rounded-lg border border-border/50 shadow-inner"
        style={{ backgroundImage: config.legendGradient }}
      />

      {/* Scale labels */}
      <div className="mt-2 flex items-start justify-between font-mono text-[10px] text-foreground/70">
        <span className="text-left leading-tight">{min}</span>
        <span className="text-center text-muted-foreground">{mid}</span>
        <span className="text-right leading-tight">{max}</span>
      </div>
    </section>
  )
}
