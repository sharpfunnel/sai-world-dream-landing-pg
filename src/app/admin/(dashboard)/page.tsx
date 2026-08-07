import Link from "next/link";
import { Users, Activity, UserPlus, TrendingUp, MoveDown, MousePointerClick, Clock } from "lucide-react";
import { StatTile } from "@/components/admin/StatTile";
import { ConversionFunnel } from "@/components/admin/ConversionFunnel";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";
import { DevicesDonut } from "@/components/admin/DevicesDonut";
import { BarList } from "@/components/admin/BarList";
import { CountryList } from "@/components/admin/CountryList";
import { WorldMap } from "@/components/admin/WorldMap";
import { DateRangeSelect } from "@/components/admin/DateRangeSelect";
import { LiveBadge } from "@/components/admin/LiveBadge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import {
  getOverviewStats,
  getDailyTimeSeries,
  getTrafficSources,
  getRecentLeads,
  getLiveVisitorCount,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getTopPages,
  getVisitorsByCountry,
} from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = Number(params.days) || 30;

  const [stats, series, trafficSources, recentLeads, liveCount, devices, browsers, topPages, countries] =
    await Promise.all([
      getOverviewStats(days),
      getDailyTimeSeries(days),
      getTrafficSources(days),
      getRecentLeads(5),
      getLiveVisitorCount(),
      getDeviceBreakdown(days),
      getBrowserBreakdown(days),
      getTopPages(days),
      getVisitorsByCountry(days),
    ]);

  const funnelStages = [
    { label: "Sessions", count: stats.sessionCount, color: "cyan" as const },
    { label: "Scrolled 50%+", count: stats.scrolledDeepCount, color: "purple" as const },
    { label: "Clicked a CTA", count: stats.ctaClickCount, color: "rose" as const },
    { label: "Converted (lead)", count: stats.leadCount, color: "gold" as const },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <LiveBadge initialCount={liveCount} />
        <DateRangeSelect basePath="/admin" searchParams={{ days: params.days }} days={days} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatTile
          label="Visitors"
          value={stats.visitorCount.toLocaleString()}
          icon={Users}
          color="blue"
          delta={stats.deltas.visitorCount}
        />
        <StatTile
          label="Sessions"
          value={stats.sessionCount.toLocaleString()}
          icon={Activity}
          color="cyan"
          delta={stats.deltas.sessionCount}
        />
        <StatTile
          label="Leads"
          value={stats.leadCount.toLocaleString()}
          icon={UserPlus}
          color="gold"
          delta={stats.deltas.leadCount}
        />
        <StatTile
          label="Conversion"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="emerald"
          delta={stats.deltas.conversionRate}
        />
        <StatTile
          label="Scrolled 50%+"
          value={stats.scrolledDeepCount.toLocaleString()}
          icon={MoveDown}
          color="purple"
          delta={stats.deltas.scrolledDeepCount}
        />
        <StatTile
          label="Clicked a CTA"
          value={stats.ctaClickCount.toLocaleString()}
          icon={MousePointerClick}
          color="rose"
          delta={stats.deltas.ctaClickCount}
        />
        <StatTile
          label="Avg. time"
          value={formatDuration(stats.avgSessionDuration)}
          icon={Clock}
          color="teal"
          delta={stats.deltas.avgSessionDuration}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ConversionFunnel stages={funnelStages} />

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Traffic sources</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Source</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Medium</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Sessions</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Leads</th>
                  <th className="whitespace-nowrap py-2 font-medium">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map((s) => (
                  <tr key={`${s.source}-${s.medium}`} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap py-2.5 pr-4 text-slate-900">{s.source}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-slate-600">{s.medium}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums text-slate-600">{s.sessions}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums text-slate-600">{s.leads}</td>
                    <td className="whitespace-nowrap py-2.5 tabular-nums">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.conversionRate > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {trafficSources.length === 0 && <EmptyState message="No traffic yet." />}
        </div>
      </div>

      <div className="mt-6">
        <TimeSeriesChart data={series} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DevicesDonut title="Devices" items={devices} />
        <BarList title="Browsers" items={browsers} barColor="bg-cyan-500" />
        <BarList title="Top pages" items={topPages} barColor="bg-purple-500" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <WorldMap data={countries} />
        <CountryList title="Top countries" items={countries} />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent leads</h2>
          <Link href="/admin/leads" className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>
        <Table>
          <Thead>
            <Th>Name</Th>
            <Th>Config</Th>
            <Th>Source</Th>
            <Th>Status</Th>
          </Thead>
          <tbody>
            {recentLeads.map((l) => (
              <Tr key={l.id}>
                <Td className="text-slate-900">{l.name ?? "—"}</Td>
                <Td>{l.config ?? "—"}</Td>
                <Td>{l.source ?? "—"}</Td>
                <Td>{l.status}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {recentLeads.length === 0 && <EmptyState message="No leads yet." />}
      </div>
    </div>
  );
}
