const BAR_COLORS = {
  blue: "bg-blue-400",
  cyan: "bg-cyan-400",
  gold: "bg-gold-400",
  emerald: "bg-emerald-400",
  purple: "bg-purple-400",
  rose: "bg-rose-400",
  teal: "bg-teal-400",
} as const;

interface FunnelRow {
  label: string;
  count: number;
  color: keyof typeof BAR_COLORS;
}

export function ConversionFunnel({ stages }: { stages: FunnelRow[] }) {
  const max = stages[0]?.count || 1;

  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Conversion funnel</h2>
      <div className="space-y-3">
        {stages.map((stage) => {
          const pct = max ? (stage.count / max) * 100 : 0;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm text-neutral-300">{stage.label}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-white/5">
                <div
                  className={`h-full rounded ${BAR_COLORS[stage.color]}`}
                  style={{ width: `${Math.min(100, Math.max(stage.count ? 2 : 0, pct))}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-sm tabular-nums text-neutral-400">
                <span className="font-semibold text-white">{stage.count}</span> {Math.round(pct)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
