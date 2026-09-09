export function WaterDial({ value }: { value: number }) {
  const size = 160
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  // Only sweep 270° (leaving a 90° gap at the bottom)
  const sweep = 270
  const arcLength = (sweep / 360) * circumference
  const offset = arcLength - (clamped / 100) * arcLength

  // Rotate so the arc starts at 135° (bottom-left) and ends at 45° (bottom-right)
  const startAngle = 135

  const riskLabel =
    clamped >= 60 ? "HIGH" : clamped >= 30 ? "MODERATE" : "LOW"
  const riskColor =
    clamped >= 60
      ? "text-sky-400 border-sky-500/40 bg-sky-500/10"
      : clamped >= 30
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-muted-foreground border-border bg-muted/40"

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Water Presence Probability
      </h3>

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: `rotate(${startAngle}deg)` }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
          />
          {/* Filled arc – gradient via linearGradient */}
          <defs>
            <linearGradient id="water-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="oklch(0.72 0.18 195)" />
              <stop offset="100%" stopColor="oklch(0.55 0.20 240)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#water-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold leading-none text-foreground">
            {clamped}%
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Probability
          </span>
        </div>
      </div>

      {/* Risk badge */}
      <span className={`rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${riskColor}`}>
        {riskLabel} RISK
      </span>
    </div>
  )
}
