import "server-only";
import { gunzipSync } from "zlib";
import { prisma } from "@/lib/prisma";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getOverviewStats(days = 30) {
  const since = daysAgo(days);

  const [
    visitorCount,
    sessionCount,
    leadCount,
    bounceCount,
    durationAgg,
    maxDepths,
    pageviewCount,
    scrolledDeepCount,
    ctaClickCount,
  ] = await Promise.all([
    prisma.visitor.count({ where: { firstSeenAt: { gte: since } } }),
    prisma.session.count({ where: { startedAt: { gte: since } } }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.session.count({ where: { startedAt: { gte: since }, isBounce: true } }),
    prisma.session.aggregate({
      where: { startedAt: { gte: since }, totalDuration: { not: null } },
      _avg: { totalDuration: true },
    }),
    prisma.scrollEvent.groupBy({
      by: ["sessionId"],
      where: { createdAt: { gte: since } },
      _max: { depth: true },
    }),
    prisma.pageView.count({ where: { session: { startedAt: { gte: since } } } }),
    prisma.session.count({ where: { startedAt: { gte: since }, scrollEvents: { some: { depth: { gte: 50 } } } } }),
    prisma.session.count({ where: { startedAt: { gte: since }, ctaEvents: { some: { action: "clicked" } } } }),
  ]);

  const avgScrollDepth = maxDepths.length
    ? maxDepths.reduce((sum, r) => sum + (r._max.depth ?? 0), 0) / maxDepths.length
    : 0;

  return {
    visitorCount,
    sessionCount,
    leadCount,
    pageviewCount,
    scrolledDeepCount,
    ctaClickCount,
    bounceRate: sessionCount ? (bounceCount / sessionCount) * 100 : 0,
    conversionRate: sessionCount ? (leadCount / sessionCount) * 100 : 0,
    avgSessionDuration: durationAgg._avg.totalDuration ?? 0,
    avgScrollDepth,
  };
}

export async function getNavBadgeCounts() {
  const [leadsCount, sessionsCount] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    prisma.session.count({ where: { startedAt: { gte: daysAgo(30) } } }),
  ]);
  return { leadsCount, sessionsCount };
}

export async function getDailyTimeSeries(days = 30) {
  const since = daysAgo(days - 1);
  since.setUTCHours(0, 0, 0, 0);

  const [visitors, sessions, leads] = await Promise.all([
    prisma.visitor.findMany({ where: { firstSeenAt: { gte: since } }, select: { firstSeenAt: true } }),
    prisma.session.findMany({ where: { startedAt: { gte: since } }, select: { startedAt: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const buckets = new Map<string, { date: string; visitors: number; sessions: number; leads: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 86_400_000);
    const key = dayKey(d);
    buckets.set(key, { date: key, visitors: 0, sessions: 0, leads: 0 });
  }

  const bump = (date: Date, field: "visitors" | "sessions" | "leads") => {
    const bucket = buckets.get(dayKey(date));
    if (bucket) bucket[field] += 1;
  };
  visitors.forEach((v) => bump(v.firstSeenAt, "visitors"));
  sessions.forEach((s) => bump(s.startedAt, "sessions"));
  leads.forEach((l) => bump(l.createdAt, "leads"));

  return Array.from(buckets.values());
}

export async function getTrafficSources(days = 30, limit = 8) {
  const since = daysAgo(days);
  const grouped = await prisma.session.groupBy({
    by: ["utmSource", "utmMedium"],
    where: { startedAt: { gte: since } },
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const rows = await Promise.all(
    grouped.map(async (g) => {
      const where = { startedAt: { gte: since }, utmSource: g.utmSource, utmMedium: g.utmMedium };
      const leads = await prisma.session.count({ where: { ...where, leads: { some: {} } } });
      const sessions = g._count._all;
      return {
        source: g.utmSource ?? "direct",
        medium: g.utmMedium ?? "(none)",
        sessions,
        leads,
        conversionRate: sessions ? (leads / sessions) * 100 : 0,
      };
    })
  );

  return rows.sort((a, b) => b.sessions - a.sessions);
}

export async function getRecentLeads(limit = 5) {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, phone: true, config: true, source: true, createdAt: true, status: true },
  });
}

export async function getLeads(status?: string, limit = 200) {
  return prisma.lead.findMany({
    where: status && status !== "all" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      session: {
        select: {
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
          utmTerm: true,
          placement: true,
          metaAdId: true,
          rawParams: true,
        },
      },
      visitor: {
        select: {
          city: true,
          country: true,
        },
      },
    },
  });
}

export async function getSessions(limit = 100) {
  return prisma.session.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      visitor: true,
      leads: { select: { config: true }, orderBy: { createdAt: "asc" }, take: 1 },
      _count: { select: { pageViews: true, replayChunks: true } },
    },
  });
}

export async function getCtaStats(days = 30) {
  const since = daysAgo(days);
  const grouped = await prisma.ctaEvent.groupBy({
    by: ["ctaId", "action"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  const byId = new Map<string, { ctaId: string; viewed: number; hovered: number; clicked: number }>();
  for (const row of grouped) {
    const entry = byId.get(row.ctaId) ?? { ctaId: row.ctaId, viewed: 0, hovered: 0, clicked: 0 };
    if (row.action === "viewed") entry.viewed = row._count._all;
    if (row.action === "hovered") entry.hovered = row._count._all;
    if (row.action === "clicked") entry.clicked = row._count._all;
    byId.set(row.ctaId, entry);
  }

  return Array.from(byId.values())
    .map((r) => ({ ...r, ctr: r.viewed ? (r.clicked / r.viewed) * 100 : 0 }))
    .sort((a, b) => b.clicked - a.clicked);
}

export async function getFormStats(days = 30) {
  const since = daysAgo(days);
  const grouped = await prisma.formEvent.groupBy({
    by: ["formId", "action"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  const byId = new Map<
    string,
    { formId: string; viewed: number; started: number; submitted: number; abandoned: number; validationErrors: number }
  >();
  for (const row of grouped) {
    const entry = byId.get(row.formId) ?? {
      formId: row.formId,
      viewed: 0,
      started: 0,
      submitted: 0,
      abandoned: 0,
      validationErrors: 0,
    };
    if (row.action === "viewed") entry.viewed = row._count._all;
    if (row.action === "started") entry.started = row._count._all;
    if (row.action === "submitted") entry.submitted = row._count._all;
    if (row.action === "abandoned") entry.abandoned = row._count._all;
    if (row.action === "validation_error") entry.validationErrors = row._count._all;
    byId.set(row.formId, entry);
  }

  return Array.from(byId.values()).map((r) => ({
    ...r,
    completionRate: r.started ? (r.submitted / r.started) * 100 : 0,
  }));
}

export async function getPerformanceStats(days = 30) {
  const since = daysAgo(days);
  const [avgAgg, ratingGroups] = await Promise.all([
    prisma.performanceMetric.groupBy({
      by: ["metric"],
      where: { createdAt: { gte: since } },
      _avg: { value: true },
      _count: { _all: true },
    }),
    prisma.performanceMetric.groupBy({
      by: ["metric", "rating"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const byMetric = new Map<
    string,
    { metric: string; avg: number; count: number; good: number; needsImprovement: number; poor: number }
  >();
  for (const row of avgAgg) {
    byMetric.set(row.metric, {
      metric: row.metric,
      avg: row._avg.value ?? 0,
      count: row._count._all,
      good: 0,
      needsImprovement: 0,
      poor: 0,
    });
  }
  for (const row of ratingGroups) {
    const entry = byMetric.get(row.metric);
    if (!entry) continue;
    if (row.rating === "good") entry.good = row._count._all;
    if (row.rating === "needs-improvement") entry.needsImprovement = row._count._all;
    if (row.rating === "poor") entry.poor = row._count._all;
  }

  return Array.from(byMetric.values());
}

export async function getErrors(limit = 100) {
  return prisma.errorEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getHeatmapPaths() {
  const rows = await prisma.heatmapEvent.groupBy({ by: ["path"], _count: { _all: true } });
  return rows.map((r) => r.path).sort();
}

export async function getHeatmapPoints(path: string, type: "click" | "hover", limit = 3000) {
  return prisma.heatmapEvent.findMany({
    where: { path, type },
    select: { xPct: true, yPct: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getMetaAdAccounts() {
  return prisma.metaAdAccount.findMany({ orderBy: { connectedAt: "desc" } });
}

export async function getMetaSummaryStats(days = 30) {
  const since = daysAgo(days);
  const agg = await prisma.metaInsight.aggregate({
    where: { level: "campaign", date: { gte: since } },
    _sum: { spend: true, impressions: true, clicks: true, reach: true, results: true },
  });

  const spend = agg._sum.spend ?? 0;
  const impressions = agg._sum.impressions ?? 0;
  const clicks = agg._sum.clicks ?? 0;
  const results = agg._sum.results ?? 0;

  return {
    spend,
    impressions,
    clicks,
    reach: agg._sum.reach ?? 0,
    results,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    cpc: clicks ? spend / clicks : 0,
    cpm: impressions ? (spend / impressions) * 1000 : 0,
    costPerResult: results ? spend / results : 0,
  };
}

// Site-behavior columns are matched against a campaign primarily by Meta's stable
// campaign_id (persisted as Session.metaCampaignId when the ad's URL is tagged with
// Meta's {{campaign.id}} dynamic parameter) — a campaign rename in Ads Manager can't
// break this join. Falls back to exact (case-insensitive) utm_campaign = campaign name
// for older sessions captured before campaign_id tagging was added.
async function getCampaignBehaviorStats(campaignMetaId: string, campaignName: string, since: Date) {
  const where = {
    startedAt: { gte: since },
    OR: [
      { metaCampaignId: campaignMetaId },
      { utmCampaign: { equals: campaignName, mode: "insensitive" as const } },
    ],
  };
  const [sessions, scrolled, ctaClicked, formStarted, leads] = await Promise.all([
    prisma.session.count({ where }),
    prisma.session.count({ where: { ...where, scrollEvents: { some: { depth: { gte: 25 } } } } }),
    prisma.session.count({ where: { ...where, ctaEvents: { some: { action: "clicked" } } } }),
    prisma.session.count({ where: { ...where, formEvents: { some: { action: "started" } } } }),
    prisma.session.count({ where: { ...where, leads: { some: {} } } }),
  ]);
  return { sessions, scrolled, ctaClicked, formStarted, leads };
}

export async function getCampaignPerformance(days = 30) {
  const since = daysAgo(days);
  const campaigns = await prisma.campaign.findMany({
    include: {
      adAccount: { select: { name: true, currency: true } },
      insights: { where: { level: "campaign", date: { gte: since } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = await Promise.all(
    campaigns.map(async (c) => {
      const spend = c.insights.reduce((sum, i) => sum + i.spend, 0);
      const impressions = c.insights.reduce((sum, i) => sum + i.impressions, 0);
      const clicks = c.insights.reduce((sum, i) => sum + i.clicks, 0);
      const reach = c.insights.reduce((sum, i) => sum + i.reach, 0);
      const results = c.insights.reduce((sum, i) => sum + i.results, 0);
      const behavior = await getCampaignBehaviorStats(c.metaId, c.name, since);

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective,
        accountName: c.adAccount.name,
        currency: c.adAccount.currency,
        spend,
        impressions,
        clicks,
        reach,
        results,
        ctr: impressions ? (clicks / impressions) * 100 : 0,
        cpc: clicks ? spend / clicks : 0,
        cpm: impressions ? (spend / impressions) * 1000 : 0,
        costPerResult: results ? spend / results : 0,
        ...behavior,
      };
    })
  );

  return rows.sort((a, b) => b.spend - a.spend);
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  conversionFromStart: number;
  dropOffFromPrev: number;
}

export async function getFunnelStats(days = 30, source: "all" | "meta" = "all"): Promise<FunnelStage[]> {
  const since = daysAgo(days);
  const sessionWhere = source === "meta" ? { startedAt: { gte: since }, fbclid: { not: null } } : { startedAt: { gte: since } };

  const [sessions, scrolled, ctaClicked, formStarted, leadSubmitted, metaClicksAgg] = await Promise.all([
    prisma.session.count({ where: sessionWhere }),
    prisma.session.count({ where: { ...sessionWhere, scrollEvents: { some: { depth: { gte: 25 } } } } }),
    prisma.session.count({ where: { ...sessionWhere, ctaEvents: { some: { action: "clicked" } } } }),
    prisma.session.count({ where: { ...sessionWhere, formEvents: { some: { action: "started" } } } }),
    prisma.session.count({ where: { ...sessionWhere, leads: { some: {} } } }),
    source === "meta"
      ? prisma.metaInsight.aggregate({ where: { level: "campaign", date: { gte: since } }, _sum: { linkClicks: true, clicks: true } })
      : Promise.resolve(null),
  ]);

  const adClicks = metaClicksAgg ? Math.round(metaClicksAgg._sum.linkClicks || metaClicksAgg._sum.clicks || 0) : null;

  const raw: { key: string; label: string; count: number }[] = [];
  if (adClicks !== null) raw.push({ key: "adClicks", label: "Ad clicks (Meta)", count: adClicks });
  raw.push({ key: "landingPageViews", label: "Landing page views", count: sessions });
  raw.push({ key: "scrolled", label: "Scrolled 25%+", count: scrolled });
  raw.push({ key: "ctaClicked", label: "CTA clicked", count: ctaClicked });
  raw.push({ key: "formStarted", label: "Form started", count: formStarted });
  raw.push({ key: "leadSubmitted", label: "Lead submitted", count: leadSubmitted });

  const first = raw[0]?.count ?? 0;
  return raw.map((stage, i) => ({
    ...stage,
    conversionFromStart: first ? Math.round((stage.count / first) * 1000) / 10 : 0,
    dropOffFromPrev: i === 0 || !raw[i - 1].count ? 0 : Math.round((1 - stage.count / raw[i - 1].count) * 1000) / 10,
  }));
}

function summarizeInsights(insights: { spend: number; impressions: number; clicks: number; results: number }[]) {
  const spend = insights.reduce((sum, i) => sum + i.spend, 0);
  const impressions = insights.reduce((sum, i) => sum + i.impressions, 0);
  const clicks = insights.reduce((sum, i) => sum + i.clicks, 0);
  const results = insights.reduce((sum, i) => sum + i.results, 0);
  return {
    spend,
    impressions,
    clicks,
    results,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    cpc: clicks ? spend / clicks : 0,
    cpm: impressions ? (spend / impressions) * 1000 : 0,
    costPerResult: results ? spend / results : 0,
  };
}

export async function getCampaignDetail(campaignId: string, days = 30) {
  const since = daysAgo(days);
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      adAccount: { select: { name: true, currency: true } },
      adSets: {
        include: {
          insights: { where: { level: "adset", date: { gte: since } } },
          ads: { include: { insights: { where: { level: "ad", date: { gte: since } } } } },
        },
      },
    },
  });
  if (!campaign) return null;

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    objective: campaign.objective,
    accountName: campaign.adAccount.name,
    currency: campaign.adAccount.currency,
    adSets: campaign.adSets.map((as) => ({
      id: as.id,
      name: as.name,
      status: as.status,
      ...summarizeInsights(as.insights),
      ads: as.ads.map((ad) => ({
        id: ad.id,
        name: ad.name,
        status: ad.status,
        headline: ad.headline,
        thumbnailUrl: ad.thumbnailUrl,
        ...summarizeInsights(ad.insights),
      })),
    })),
  };
}

export async function getSessionReplay(sessionId: string) {
  const [session, chunks] = await Promise.all([
    prisma.session.findUnique({ where: { id: sessionId }, include: { visitor: true } }),
    prisma.sessionReplay.findMany({
      where: { sessionId },
      orderBy: { seq: "asc" },
      select: { data: true },
    }),
  ]);
  if (!session || chunks.length === 0) return null;

  const events: unknown[] = [];
  for (const chunk of chunks) {
    const json = gunzipSync(chunk.data).toString("utf-8");
    events.push(...(JSON.parse(json) as unknown[]));
  }
  return { session, events };
}
