import Link from "next/link";
import { Users, Activity, UserPlus, TrendingUp, MoveDown, MousePointerClick, Clock } from "lucide-react";
import { StatTile } from "@/components/admin/StatTile";
import { ConversionFunnel } from "@/components/admin/ConversionFunnel";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getOverviewStats, getDailyTimeSeries, getTrafficSources, getRecentLeads } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default async function AdminOverviewPage() {
  const [stats, series, trafficSources, recentLeads] = await Promise.all([
    getOverviewStats(30),
    getDailyTimeSeries(30),
    getTrafficSources(30),
    getRecentLeads(5),
  ]);

  const funnelStages = [
    { label: "Sessions", count: stats.sessionCount, color: "cyan" as const },
    { label: "Scrolled 50%+", count: stats.scrolledDeepCount, color: "purple" as const },
    { label: "Clicked a CTA", count: stats.ctaClickCount, color: "rose" as const },
    { label: "Converted (lead)", count: stats.leadCount, color: "gold" as const },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatTile label="Visitors" value={stats.visitorCount.toLocaleString()} icon={Users} color="blue" />
        <StatTile label="Sessions" value={stats.sessionCount.toLocaleString()} icon={Activity} color="cyan" />
        <StatTile label="Leads" value={stats.leadCount.toLocaleString()} icon={UserPlus} color="gold" />
        <StatTile
          label="Conversion"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatTile
          label="Scrolled 50%+"
          value={stats.scrolledDeepCount.toLocaleString()}
          icon={MoveDown}
          color="purple"
        />
        <StatTile
          label="Clicked a CTA"
          value={stats.ctaClickCount.toLocaleString()}
          icon={MousePointerClick}
          color="rose"
        />
        <StatTile label="Avg. time" value={formatDuration(stats.avgSessionDuration)} icon={Clock} color="teal" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ConversionFunnel stages={funnelStages} />

        <div className="rounded-lg border border-white/10 bg-neutral-900 p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Traffic sources</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Source</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Medium</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Sessions</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Leads</th>
                  <th className="whitespace-nowrap py-2 font-medium">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map((s) => (
                  <tr key={`${s.source}-${s.medium}`} className="border-b border-white/5 last:border-0">
                    <td className="whitespace-nowrap py-2.5 pr-4 text-white">{s.source}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-300">{s.medium}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums text-neutral-300">{s.sessions}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums text-neutral-300">{s.leads}</td>
                    <td className="whitespace-nowrap py-2.5 tabular-nums">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.conversionRate > 0
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-white/5 text-neutral-500"
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

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent leads</h2>
          <Link href="/admin/leads" className="text-xs font-medium text-blue-400 hover:text-blue-300">
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
                <Td className="text-white">{l.name ?? "—"}</Td>
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
