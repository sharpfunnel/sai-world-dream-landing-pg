import { countryFlagEmoji, countryName } from "@/lib/admin/countries";

interface CountryRow {
  code: string;
  count: number;
  leads?: number;
}

export function CountryList({ title, items }: { title?: string; items: CountryRow[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>}
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No visitors yet.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const pct = (item.count / max) * 100;
            return (
              <div key={item.code} className="flex items-center gap-3">
                <span className="text-base leading-none">{countryFlagEmoji(item.code)}</span>
                <span className="w-28 shrink-0 truncate text-sm text-slate-600" title={countryName(item.code)}>
                  {countryName(item.code)}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                  <div className="h-full rounded bg-gold-400" style={{ width: `${Math.max(2, pct)}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-slate-900">
                  {item.count}
                </span>
                {item.leads !== undefined && (
                  <span className="w-16 shrink-0 text-right text-xs tabular-nums text-slate-500">
                    {item.leads} lead{item.leads === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
