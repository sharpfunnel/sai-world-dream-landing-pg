import Link from "next/link";

const PRESETS = [7, 14, 30, 90];

export function DateRangeSelect({
  basePath,
  searchParams,
  days,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  days: number;
}) {
  return (
    <div className="flex gap-1 rounded-md border border-slate-200 bg-white p-1">
      {PRESETS.map((preset) => {
        const params = new URLSearchParams(
          Object.entries(searchParams).filter((entry): entry is [string, string] => entry[1] !== undefined)
        );
        params.set("days", String(preset));
        const active = days === preset;
        return (
          <Link
            key={preset}
            href={`${basePath}?${params.toString()}`}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {preset}d
          </Link>
        );
      })}
    </div>
  );
}
