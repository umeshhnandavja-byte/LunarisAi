"use client"

import { REGIONS, type Region } from "@/lib/analyzer-data"

type Props = {
  selected: string
  onChange: (id: string) => void
}

export function RegionSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Target Region
      </span>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((r: Region) => {
          const active = r.id === selected
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`group relative flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-all duration-200 ${
                active
                  ? "border-primary/60 bg-primary/10 text-primary shadow-[var(--glow-primary)]"
                  : "border-border bg-card/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary"
                  aria-hidden="true"
                />
              )}
              <span className="font-sans text-[11px] font-semibold leading-tight">
                {r.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">
                {r.sector} · {r.terrain.split("·")[0].trim()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
