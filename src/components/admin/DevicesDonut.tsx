const COLORS = ["#3987e5", "#d95926", "#199e70", "#8b5cf6", "#e11d48", "#0891b2", "#ca8a04"];

interface DonutItem {
  label: string;
  count: number;
}

export function DevicesDonut({ title, items }: { title?: string; items: DonutItem[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const segments: { label: string; dash: number; offset: number }[] = [];
  let cursor = 0;
  for (const item of items) {
    const dash = (item.count / total) * circumference;
    segments.push({ label: item.label, dash, offset: cursor });
    cursor += dash;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>}
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No data yet.</p>
      ) : (
        <div className="flex items-center gap-6">
          <svg viewBox="0 0 160 160" className="h-32 w-32 shrink-0 -rotate-90" role="img" aria-label={title}>
            <circle cx={80} cy={80} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={20} />
            {segments.map((s, i) => (
              <circle
                key={s.label}
                cx={80}
                cy={80}
                r={radius}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={20}
                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                strokeDashoffset={-s.offset}
              />
            ))}
          </svg>
          <div className="min-w-0 flex-1 space-y-1.5">
            {items.map((item, i) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate text-slate-600">{item.label}</span>
                <span className="ml-auto shrink-0 font-medium tabular-nums text-slate-900">
                  {((item.count / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
