import { COUNTRY_SHAPES, WORLD_MAP_VIEWBOX } from "@/lib/admin/worldMapPaths";
import { countryName } from "@/lib/admin/countries";

interface CountryCount {
  code: string;
  count: number;
  leads?: number;
}

const SHAPES_BY_CODE = new Map(COUNTRY_SHAPES.map((s) => [s.code, s]));

export function WorldMap({ data }: { data: CountryCount[] }) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  // Log-ish scale so a handful of countries with huge counts don't shrink everyone else to dots.
  const radiusFor = (count: number) => 3 + (Math.log(count + 1) / Math.log(maxCount + 1)) * 14;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Visitors by country</h2>
      <svg viewBox={WORLD_MAP_VIEWBOX} className="w-full" role="img" aria-label="World map of visitor locations">
        {COUNTRY_SHAPES.map((c) => (
          <path key={c.code} d={c.d} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={0.5} />
        ))}
        {data.map((d) => {
          const shape = SHAPES_BY_CODE.get(d.code);
          if (!shape) return null;
          return (
            <circle
              key={d.code}
              cx={shape.cx}
              cy={shape.cy}
              r={radiusFor(d.count)}
              fill="#d4af37"
              fillOpacity={0.6}
              stroke="#b8932c"
              strokeWidth={1}
            >
              <title>
                {countryName(d.code)}: {d.count} visitor{d.count === 1 ? "" : "s"}
                {d.leads ? ` · ${d.leads} lead${d.leads === 1 ? "" : "s"}` : ""}
              </title>
            </circle>
          );
        })}
      </svg>
      {data.length === 0 && <p className="mt-2 text-center text-sm text-slate-500">No geolocated visitors yet.</p>}
    </div>
  );
}
