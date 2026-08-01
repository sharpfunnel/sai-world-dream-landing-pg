const BAR_COLORS = {
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  gold: "bg-gold-400",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
} as const;

interface FunnelRow {
  label: string;
  count: number;
  color: keyof typeof BAR_COLORS;
}

export function ConversionFunnel({ stages }: { stages: FunnelRow[] }) {
  const max = stages[0]?.count || 1;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Conversion funnel</h2>
      <div className="space-y-3">
        {stages.map((stage) => {
          const pct = max ? (stage.count / max) * 100 : 0;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-sm text-slate-600">{stage.label}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                <div
                  className={`h-full rounded ${BAR_COLORS[stage.color]}`}
                  style={{ width: `${Math.min(100, Math.max(stage.count ? 2 : 0, pct))}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-sm tabular-nums text-slate-500">
                <span className="font-semibold text-slate-900">{stage.count}</span> {Math.round(pct)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
