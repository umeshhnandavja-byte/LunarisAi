type Props = {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  accent?: "default" | "amber" | "red" | "green"
}

const accentMap = {
  default: "text-primary",
  amber:   "text-amber-400 dark:text-amber-300",
  red:     "text-red-400 dark:text-red-300",
  green:   "text-emerald-400 dark:text-emerald-300",
}

export function StatCard({ icon, label, value, unit, accent = "default" }: Props) {
  return (
    <div className="glass flex items-center gap-3 rounded-xl p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className={`font-mono text-lg font-semibold leading-tight ${accentMap[accent]}`}>
          {value}
          {unit && (
            <span className="ml-1 font-mono text-[11px] font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
