interface BarListItem {
  label: string;
  count: number;
}

export function BarList({
  title,
  items,
  emptyMessage = "No data yet.",
  barColor = "bg-blue-500",
}: {
  title?: string;
  items: BarListItem[];
  emptyMessage?: string;
  barColor?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>}
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const pct = (item.count / max) * 100;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-sm text-slate-600" title={item.label}>
                  {item.label}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                  <div className={`h-full rounded ${barColor}`} style={{ width: `${Math.max(item.count ? 2 : 0, pct)}%` }} />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums text-slate-900">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
