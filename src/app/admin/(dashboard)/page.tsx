import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getOverviewStats, getDailyTimeSeries, getTopUtmSources, getRecentLeads } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default async function AdminOverviewPage() {
  const [stats, series, topSources, recentLeads] = await Promise.all([
    getOverviewStats(30),
    getDailyTimeSeries(30),
    getTopUtmSources(30),
    getRecentLeads(5),
  ]);

  return (
    <div>
      <PageHeader title="Overview" description="Last 30 days" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="Visitors" value={stats.visitorCount.toLocaleString()} />
        <StatTile label="Sessions" value={stats.sessionCount.toLocaleString()} />
        <StatTile label="Leads" value={stats.leadCount.toLocaleString()} />
        <StatTile label="Conversion rate" value={`${stats.conversionRate.toFixed(1)}%`} sub="Leads / sessions" />
        <StatTile label="Avg. session duration" value={formatDuration(stats.avgSessionDuration)} />
        <StatTile label="Bounce rate" value={`${stats.bounceRate.toFixed(1)}%`} />
        <StatTile label="Avg. scroll depth" value={`${Math.round(stats.avgScrollDepth)}%`} />
        <StatTile label="Page views" value={stats.pageviewCount.toLocaleString()} />
      </div>

      <div className="mt-6">
        <TimeSeriesChart data={series} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Top campaign sources</h2>
          <Table>
            <Thead>
              <Th>Source</Th>
              <Th>Medium</Th>
              <Th>Sessions</Th>
            </Thead>
            <tbody>
              {topSources.map((s) => (
                <Tr key={`${s.source}-${s.medium}`}>
                  <Td className="text-white">{s.source}</Td>
                  <Td>{s.medium}</Td>
                  <Td className="tabular-nums">{s.sessions}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          {topSources.length === 0 && <EmptyState message="No campaign traffic yet." />}
        </div>

        <div>
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
    </div>
  );
}
