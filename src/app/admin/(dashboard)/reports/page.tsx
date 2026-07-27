import type { ReactNode } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { resolveReportRange, getReportOverview, formatDuration } from "@/lib/admin/reports";

export const dynamic = "force-dynamic";

const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "month", label: "This month" },
];

function pillClass(active: boolean) {
  return `rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
    active ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
  }`;
}

function ReportCard({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-neutral-900 p-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}): Promise<ReactNode> {
  const sp = await searchParams;
  const range = resolveReportRange(sp);
  const overview = await getReportOverview(range.since, range.until);

  const query = new URLSearchParams({ range: range.presetKey });
  if (range.presetKey === "custom" && sp.from && sp.to) {
    query.set("from", sp.from);
    query.set("to", sp.to);
  }
  const q = query.toString();

  return (
    <div>
      <PageHeader title="Reports" description="Export analytics and lead data for any date range" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <a key={opt.key} href={`/admin/reports?range=${opt.key}`} className={pillClass(range.presetKey === opt.key)}>
            {opt.label}
          </a>
        ))}
        <form className="flex items-center gap-2 pl-2" action="/admin/reports" method="get">
          <input type="hidden" name="range" value="custom" />
          <input
            type="date"
            name="from"
            defaultValue={sp.from}
            required
            className="rounded-md border border-white/10 bg-neutral-900 px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-neutral-500">to</span>
          <input
            type="date"
            name="to"
            defaultValue={sp.to}
            required
            className="rounded-md border border-white/10 bg-neutral-900 px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className={pillClass(range.presetKey === "custom")}>
            Custom
          </button>
        </form>
      </div>

      <p className="mb-6 text-sm text-neutral-500">{range.label}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Visitors" value={overview.visitorCount.toLocaleString()} />
        <StatTile label="Sessions" value={overview.sessionCount.toLocaleString()} />
        <StatTile label="Leads" value={overview.leadCount.toLocaleString()} />
        <StatTile label="Conversion rate" value={`${overview.conversionRate.toFixed(1)}%`} />
        <StatTile label="Bounce rate" value={`${overview.bounceRate.toFixed(1)}%`} />
        <StatTile label="Avg. session duration" value={formatDuration(overview.avgSessionDuration)} />
        <StatTile label="Avg. scroll depth" value={`${Math.round(overview.avgScrollDepth)}%`} />
        <StatTile label="Page views" value={overview.pageviewCount.toLocaleString()} />
      </div>

      <div className="mt-8 space-y-3">
        <ReportCard
          title="Overview summary"
          description="Key site metrics for the selected range"
          links={[
            { label: "CSV", href: `/api/reports/overview?format=csv&${q}` },
            { label: "Excel", href: `/api/reports/overview?format=xlsx&${q}` },
            { label: "PDF", href: `/api/reports/overview?format=pdf&${q}` },
          ]}
        />
        <ReportCard
          title="Leads"
          description="Every lead submitted in the selected range"
          links={[
            { label: "CSV", href: `/api/reports/leads?format=csv&${q}` },
            { label: "Excel", href: `/api/reports/leads?format=xlsx&${q}` },
          ]}
        />
        <ReportCard
          title="Campaign performance"
          description="Meta Ads spend and results by campaign"
          links={[
            { label: "CSV", href: `/api/reports/campaigns?format=csv&${q}` },
            { label: "Excel", href: `/api/reports/campaigns?format=xlsx&${q}` },
          ]}
        />
      </div>
    </div>
  );
}
