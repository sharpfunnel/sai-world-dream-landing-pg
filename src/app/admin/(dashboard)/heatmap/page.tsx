import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { HeatmapOverlay } from "@/components/admin/HeatmapOverlay";
import { DateRangeSelect } from "@/components/admin/DateRangeSelect";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import {
  getHeatmapPaths,
  getHeatmapPoints,
  getHeatmapSummary,
  getInteractionHotspots,
  getSessionFilterOptions,
  type HeatmapFilters,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

interface HeatmapSearchParams {
  path?: string;
  type?: string;
  device?: string;
  days?: string;
}

export default async function AdminHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<HeatmapSearchParams>;
}) {
  const sp = await searchParams;
  const paths = await getHeatmapPaths();
  const path = sp.path ?? paths[0] ?? "/";
  const type = sp.type === "hover" ? "hover" : "click";
  const days = Number(sp.days) || 30;

  const filters: HeatmapFilters = { days, device: sp.device };

  const [points, summary, hotspots, filterOptions] = paths.length
    ? await Promise.all([
        getHeatmapPoints(path, type, filters),
        getHeatmapSummary(path, filters),
        getInteractionHotspots(path, type, filters),
        getSessionFilterOptions(),
      ])
    : [[], { clicks: 0, hovers: 0, sessions: 0 }, [], { devices: [] as string[], browsers: [], oses: [], countries: [] }];

  const filterHref = (overrides: Partial<HeatmapSearchParams>) => {
    const params = new URLSearchParams();
    const merged = { path, type, device: sp.device, days: String(days), ...overrides };
    if (merged.path) params.set("path", merged.path);
    if (merged.type) params.set("type", merged.type);
    if (merged.device) params.set("device", merged.device);
    if (merged.days) params.set("days", merged.days);
    return `/admin/heatmap?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Heatmap"
        description="Click/hover density overlaid on a live preview of the page. Position is normalized to full page height, so it's a close approximation rather than a pixel-exact overlay."
      />

      {paths.length === 0 ? (
        <EmptyState message="No heatmap data yet." />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {paths.map((p) => (
                <Link
                  key={p}
                  href={filterHref({ path: p })}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    p === path ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 border-l border-slate-200 pl-4">
              {(["click", "hover"] as const).map((t) => (
                <Link
                  key={t}
                  href={filterHref({ type: t })}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    t === type ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {t}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Device</span>
              <div className="flex flex-wrap gap-1">
                <Link
                  href={filterHref({ device: undefined })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    !sp.device ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  All
                </Link>
                {filterOptions.devices.map((d) => (
                  <Link
                    key={d}
                    href={filterHref({ device: d })}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      sp.device === d ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {d}
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <DateRangeSelect
                basePath="/admin/heatmap"
                searchParams={{ path, type, device: sp.device }}
                days={days}
              />
            </div>
          </div>

          <p className="mb-3 text-xs text-slate-500">
            {points.length} points · {summary.sessions} sessions · {summary.clicks} clicks · {summary.hovers} hovers
          </p>
          <HeatmapOverlay key={`${path}-${type}-${sp.device}-${days}`} path={path} points={points} color={type === "click" ? "#d03b3b" : "#3987e5"} />

          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Most {type === "click" ? "clicked" : "hovered"} elements
            </h2>
            <Table>
              <Thead>
                <Th>Element</Th>
                <Th>Text</Th>
                <Th>{type === "click" ? "Clicks" : "Hovers"}</Th>
                <Th>Sessions</Th>
                <Th>Conversion rate</Th>
              </Thead>
              <tbody>
                {hotspots.map((h) => (
                  <Tr key={h.selector}>
                    <Td className="font-mono text-xs text-slate-900">{h.selector}</Td>
                    <Td className="max-w-64 truncate text-slate-500" title={h.elementText}>
                      {h.elementText ?? "—"}
                    </Td>
                    <Td className="tabular-nums">{h.count}</Td>
                    <Td className="tabular-nums">{h.sessionCount}</Td>
                    <Td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          h.conversionRate > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {h.conversionRate.toFixed(1)}%
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            {hotspots.length === 0 && <EmptyState message="No element-level interactions recorded for this filter yet." />}
          </div>
        </>
      )}
    </div>
  );
}
