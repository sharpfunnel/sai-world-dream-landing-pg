import "server-only";
import { prisma } from "@/lib/prisma";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getOverviewStats(days = 30) {
  const since = daysAgo(days);

  const [visitorCount, sessionCount, leadCount, bounceCount, durationAgg, maxDepths, pageviewCount] =
    await Promise.all([
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

export async function getTopUtmSources(days = 30, limit = 8) {
  const since = daysAgo(days);
  const grouped = await prisma.session.groupBy({
    by: ["utmSource", "utmMedium"],
    where: { startedAt: { gte: since }, utmSource: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { utmSource: "desc" } },
    take: limit,
  });
  return grouped.map((g) => ({
    source: g.utmSource ?? "unknown",
    medium: g.utmMedium ?? "—",
    sessions: g._count._all,
  }));
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
  });
}

export async function getSessions(limit = 100) {
  return prisma.session.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
    include: { visitor: true, _count: { select: { pageViews: true } } },
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
