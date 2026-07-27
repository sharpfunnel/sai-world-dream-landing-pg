import "server-only";
import { prisma } from "@/lib/prisma";

export interface ReportRange {
  since: Date;
  until: Date;
  label: string;
  presetKey: string;
}

export function resolveReportRange(params: { range?: string; from?: string; to?: string }): ReportRange {
  const now = new Date();

  if (params.range === "custom" && params.from && params.to) {
    const since = new Date(`${params.from}T00:00:00`);
    const until = new Date(`${params.to}T23:59:59.999`);
    if (!Number.isNaN(since.getTime()) && !Number.isNaN(until.getTime())) {
      return { since, until, label: `${params.from} to ${params.to}`, presetKey: "custom" };
    }
  }

  switch (params.range) {
    case "today": {
      const since = new Date(now);
      since.setHours(0, 0, 0, 0);
      return { since, until: now, label: "Today", presetKey: "today" };
    }
    case "7d":
      return { since: new Date(now.getTime() - 7 * 86_400_000), until: now, label: "Last 7 days", presetKey: "7d" };
    case "90d":
      return { since: new Date(now.getTime() - 90 * 86_400_000), until: now, label: "Last 90 days", presetKey: "90d" };
    case "month": {
      const since = new Date(now.getFullYear(), now.getMonth(), 1);
      return { since, until: now, label: "This month", presetKey: "month" };
    }
    case "30d":
    default:
      return { since: new Date(now.getTime() - 30 * 86_400_000), until: now, label: "Last 30 days", presetKey: "30d" };
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// Deliberately separate from src/lib/admin/queries.ts's `days`-since-now stats —
// these need an arbitrary bounded [since, until] range for custom date filters,
// not just "trailing N days".
export async function getReportOverview(since: Date, until: Date) {
  const range = { gte: since, lte: until };
  const [visitorCount, sessionCount, leadCount, bounceCount, durationAgg, maxDepths, pageviewCount] = await Promise.all([
    prisma.visitor.count({ where: { firstSeenAt: range } }),
    prisma.session.count({ where: { startedAt: range } }),
    prisma.lead.count({ where: { createdAt: range } }),
    prisma.session.count({ where: { startedAt: range, isBounce: true } }),
    prisma.session.aggregate({ where: { startedAt: range, totalDuration: { not: null } }, _avg: { totalDuration: true } }),
    prisma.scrollEvent.groupBy({ by: ["sessionId"], where: { createdAt: range }, _max: { depth: true } }),
    prisma.pageView.count({ where: { session: { startedAt: range } } }),
  ]);

  const avgScrollDepth = maxDepths.length
    ? maxDepths.reduce((sum, r) => sum + (r._max.depth ?? 0), 0) / maxDepths.length
    : 0;

  return {
    visitorCount,
    sessionCount,
    leadCount,
    pageviewCount,
    bounceRate: sessionCount ? (bounceCount / sessionCount) * 100 : 0,
    conversionRate: sessionCount ? (leadCount / sessionCount) * 100 : 0,
    avgSessionDuration: durationAgg._avg.totalDuration ?? 0,
    avgScrollDepth,
  };
}

export async function getReportLeads(since: Date, until: Date) {
  return prisma.lead.findMany({
    where: { createdAt: { gte: since, lte: until } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReportCampaigns(since: Date, until: Date) {
  const campaigns = await prisma.campaign.findMany({
    include: {
      adAccount: { select: { name: true, currency: true } },
      insights: { where: { level: "campaign", date: { gte: since, lte: until } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return campaigns
    .map((c) => {
      const spend = c.insights.reduce((sum, i) => sum + i.spend, 0);
      const impressions = c.insights.reduce((sum, i) => sum + i.impressions, 0);
      const clicks = c.insights.reduce((sum, i) => sum + i.clicks, 0);
      const results = c.insights.reduce((sum, i) => sum + i.results, 0);

      return {
        name: c.name,
        status: c.status,
        accountName: c.adAccount.name ?? "",
        currency: c.adAccount.currency ?? "",
        spend,
        impressions,
        clicks,
        results,
        ctr: impressions ? (clicks / impressions) * 100 : 0,
        cpc: clicks ? spend / clicks : 0,
        costPerResult: results ? spend / results : 0,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}
