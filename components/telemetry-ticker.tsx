"use client"

const TICKS = [
  { label: "ORBIT ALT", value: "100.4 km" },
  { label: "VELOCITY", value: "1.63 km/s" },
  { label: "SIGNAL", value: "–78 dBm" },
  { label: "IIRS TEMP", value: "–43.2°C" },
  { label: "DATA RATE", value: "21 Mbps" },
  { label: "BATTERY", value: "94.7%" },
  { label: "SOLAR FLUX", value: "1361 W/m²" },
  { label: "OHRC RES", value: "0.32 m/px" },
  { label: "FOOTPRINT", value: "3.0 × 1.5 km" },
  { label: "MISSION DAY", value: "D+2467" },
]

export function TelemetryTicker() {
  // Duplicate for seamless infinite scroll
  const items = [...TICKS, ...TICKS]

  return (
    <div className="relative overflow-hidden border-b border-border/40 bg-background/60 py-1.5 backdrop-blur-sm">
      {/* left/right fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

      <div className="flex animate-ticker whitespace-nowrap">
        {items.map((t, i) => (
          <span
            key={i}
            className="inline-flex shrink-0 items-center gap-2 px-6 font-mono text-[10px] uppercase tracking-widest"
          >
            <span className="text-muted-foreground">{t.label}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-border" aria-hidden="true" />
            <span className="text-primary">{t.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
