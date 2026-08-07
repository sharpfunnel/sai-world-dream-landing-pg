import "server-only";
import { gunzipSync } from "zlib";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function periodStats(range: { gte: Date; lt?: Date }) {
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
    prisma.visitor.count({ where: { firstSeenAt: range } }),
    prisma.session.count({ where: { startedAt: range } }),
    prisma.lead.count({ where: { createdAt: range } }),
    prisma.session.count({ where: { startedAt: range, isBounce: true } }),
    prisma.session.aggregate({
      where: { startedAt: range, totalDuration: { not: null } },
      _avg: { totalDuration: true },
    }),
    prisma.scrollEvent.groupBy({
      by: ["sessionId"],
      where: { createdAt: range },
      _max: { depth: true },
    }),
    prisma.pageView.count({ where: { session: { startedAt: range } } }),
    prisma.session.count({ where: { startedAt: range, scrollEvents: { some: { depth: { gte: 50 } } } } }),
    prisma.session.count({ where: { startedAt: range, ctaEvents: { some: { action: "clicked" } } } }),
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

/** null means "no prior-period data to compare against" — the UI renders that as no badge. */
function pctDelta(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function getOverviewStats(days = 30) {
  const since = daysAgo(days);
  const prevSince = daysAgo(days * 2);

  const [current, previous] = await Promise.all([
    periodStats({ gte: since }),
    periodStats({ gte: prevSince, lt: since }),
  ]);

  return {
    ...current,
    deltas: {
      visitorCount: pctDelta(current.visitorCount, previous.visitorCount),
      sessionCount: pctDelta(current.sessionCount, previous.sessionCount),
      leadCount: pctDelta(current.leadCount, previous.leadCount),
      conversionRate: pctDelta(current.conversionRate, previous.conversionRate),
      scrolledDeepCount: pctDelta(current.scrolledDeepCount, previous.scrolledDeepCount),
      ctaClickCount: pctDelta(current.ctaClickCount, previous.ctaClickCount),
      avgSessionDuration: pctDelta(current.avgSessionDuration, previous.avgSessionDuration),
    },
  };
}

/** "Live" = a session with no endedAt stamp yet and some activity signal in the last 5 minutes. */
export async function getLiveVisitorCount(): Promise<number> {
  const since = new Date(Date.now() - 5 * 60 * 1000);
  const [pageviews, events, scrolls, ctas] = await Promise.all([
    prisma.pageView.findMany({ where: { enteredAt: { gte: since } }, select: { sessionId: true } }),
    prisma.event.findMany({ where: { createdAt: { gte: since } }, select: { sessionId: true } }),
    prisma.scrollEvent.findMany({ where: { createdAt: { gte: since } }, select: { sessionId: true } }),
    prisma.ctaEvent.findMany({ where: { createdAt: { gte: since } }, select: { sessionId: true } }),
  ]);
  const activeIds = new Set([...pageviews, ...events, ...scrolls, ...ctas].map((r) => r.sessionId));
  if (activeIds.size === 0) return 0;
  return prisma.session.count({ where: { id: { in: Array.from(activeIds) }, endedAt: null } });
}

export async function getDeviceBreakdown(days = 30) {
  const since = daysAgo(days);
  const sessions = await prisma.session.findMany({
    where: { startedAt: { gte: since } },
    select: { visitor: { select: { deviceType: true } } },
  });
  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = s.visitor.deviceType ?? "Unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getBrowserBreakdown(days = 30, limit = 8) {
  const since = daysAgo(days);
  const sessions = await prisma.session.findMany({
    where: { startedAt: { gte: since } },
    select: { visitor: { select: { browser: true } } },
  });
  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = s.visitor.browser ?? "Unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTopPages(days = 30, limit = 10) {
  const since = daysAgo(days);
  const rows = await prisma.pageView.findMany({
    where: { session: { startedAt: { gte: since } } },
    select: { path: true },
  });
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.path, (counts.get(r.path) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getVisitorsByCountry(days = 30, limit = 20) {
  const since = daysAgo(days);
  const [visitors, leads] = await Promise.all([
    prisma.visitor.findMany({ where: { firstSeenAt: { gte: since }, country: { not: null } }, select: { country: true } }),
    prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      select: { visitor: { select: { country: true } } },
    }),
  ]);

  const counts = new Map<string, number>();
  for (const v of visitors) {
    if (v.country) counts.set(v.country, (counts.get(v.country) ?? 0) + 1);
  }
  const leadCounts = new Map<string, number>();
  for (const l of leads) {
    if (l.visitor.country) leadCounts.set(l.visitor.country, (leadCounts.get(l.visitor.country) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([code, count]) => ({ code, count, leads: leadCounts.get(code) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
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

export interface LeadFilters {
  status?: string;
  source?: string;
  campaign?: string;
  country?: string;
  device?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function getLeadFilterOptions() {
  const [sources, campaigns, countries, devices] = await Promise.all([
    prisma.session.findMany({ where: { utmSource: { not: null } }, select: { utmSource: true }, distinct: ["utmSource"] }),
    prisma.session.findMany({
      where: { utmCampaign: { not: null } },
      select: { utmCampaign: true },
      distinct: ["utmCampaign"],
    }),
    prisma.visitor.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ["country"] }),
    prisma.visitor.findMany({ where: { deviceType: { not: null } }, select: { deviceType: true }, distinct: ["deviceType"] }),
  ]);
  return {
    sources: sources.map((s) => s.utmSource!).sort(),
    campaigns: campaigns.map((c) => c.utmCampaign!).sort(),
    countries: countries.map((c) => c.country!).sort(),
    devices: devices.map((d) => d.deviceType!).sort(),
  };
}

export async function getLeads(filters: LeadFilters = {}, page = 1, pageSize = 50) {
  const where: Prisma.LeadWhereInput = {};
  if (filters.status && filters.status !== "all") where.status = filters.status;
  if (filters.source) where.source = filters.source;
  if (filters.campaign) where.session = { utmCampaign: filters.campaign };
  if (filters.country || filters.device) {
    where.visitor = {
      ...(filters.country ? { country: filters.country } : {}),
      ...(filters.device ? { deviceType: filters.device } : {}),
    };
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
    };
  }
  if (filters.search) {
    const q = filters.search.trim();
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
            deviceType: true,
          },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getLeadDetail(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { session: true, visitor: true },
  });
  if (!lead) return null;

  const [visitCount, firstSession, pageViews, timeline, replay] = await Promise.all([
    prisma.session.count({ where: { visitorId: lead.visitorId } }),
    prisma.session.findFirst({ where: { visitorId: lead.visitorId }, orderBy: { startedAt: "asc" }, select: { entryPath: true } }),
    prisma.pageView.findMany({
      where: { sessionId: lead.sessionId },
      orderBy: { enteredAt: "asc" },
      select: { path: true, enteredAt: true, exitedAt: true, timeOnPage: true },
    }),
    getSessionTimeline(lead.sessionId),
    prisma.sessionReplay.findFirst({ where: { sessionId: lead.sessionId }, select: { id: true } }),
  ]);

  return {
    lead,
    visitCount,
    landingPage: firstSession?.entryPath ?? lead.session.entryPath,
    pageViews,
    timeline,
    hasReplay: replay !== null,
  };
}

export interface SessionFilters {
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getSessionFilterOptions() {
  const [devices, browsers, oses, countries] = await Promise.all([
    prisma.visitor.findMany({ where: { deviceType: { not: null } }, select: { deviceType: true }, distinct: ["deviceType"] }),
    prisma.visitor.findMany({ where: { browser: { not: null } }, select: { browser: true }, distinct: ["browser"] }),
    prisma.visitor.findMany({ where: { os: { not: null } }, select: { os: true }, distinct: ["os"] }),
    prisma.visitor.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ["country"] }),
  ]);
  return {
    devices: devices.map((d) => d.deviceType!).sort(),
    browsers: browsers.map((b) => b.browser!).sort(),
    oses: oses.map((o) => o.os!).sort(),
    countries: countries.map((c) => c.country!).sort(),
  };
}

export async function getSessions(filters: SessionFilters = {}, page = 1, pageSize = 50) {
  const where: Prisma.SessionWhereInput = {};
  if (filters.dateFrom || filters.dateTo) {
    where.startedAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
    };
  }
  if (filters.device || filters.browser || filters.os || filters.country) {
    where.visitor = {
      ...(filters.device ? { deviceType: filters.device } : {}),
      ...(filters.browser ? { browser: filters.browser } : {}),
      ...(filters.os ? { os: filters.os } : {}),
      ...(filters.country ? { country: filters.country } : {}),
    };
  }

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        visitor: true,
        leads: { select: { config: true }, orderBy: { createdAt: "asc" }, take: 1 },
        scrollEvents: { orderBy: { depth: "desc" }, take: 1, select: { depth: true } },
        _count: {
          select: {
            pageViews: true,
            replayChunks: true,
            scrollEvents: true,
            ctaEvents: true,
            formEvents: true,
            mouseEvents: true,
          },
        },
      },
    }),
    prisma.session.count({ where }),
  ]);

  return { sessions, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export interface TimelineEntry {
  type: "pageview" | "event" | "scroll" | "cta" | "form" | "error";
  label: string;
  detail?: string;
  at: Date;
}

/** Merged chronological activity for one session — used by the leads/sessions detail panels. */
export async function getSessionTimeline(sessionId: string): Promise<TimelineEntry[]> {
  const [pageViews, events, scrolls, ctas, forms, errors] = await Promise.all([
    prisma.pageView.findMany({ where: { sessionId }, select: { path: true, enteredAt: true } }),
    prisma.event.findMany({ where: { sessionId }, select: { name: true, createdAt: true } }),
    prisma.scrollEvent.findMany({ where: { sessionId }, select: { path: true, depth: true, createdAt: true } }),
    prisma.ctaEvent.findMany({ where: { sessionId }, select: { ctaId: true, action: true, createdAt: true } }),
    prisma.formEvent.findMany({ where: { sessionId }, select: { formId: true, action: true, fieldName: true, createdAt: true } }),
    prisma.errorEvent.findMany({ where: { sessionId }, select: { type: true, message: true, createdAt: true } }),
  ]);

  const timeline: TimelineEntry[] = [
    ...pageViews.map((p) => ({ type: "pageview" as const, label: `Viewed ${p.path}`, at: p.enteredAt })),
    ...events.map((e) => ({ type: "event" as const, label: e.name, at: e.createdAt })),
    ...scrolls.map((s) => ({
      type: "scroll" as const,
      label: `Scrolled ${s.depth}%`,
      detail: s.path,
      at: s.createdAt,
    })),
    ...ctas.map((c) => ({ type: "cta" as const, label: `CTA ${c.action}: ${c.ctaId}`, at: c.createdAt })),
    ...forms.map((f) => ({
      type: "form" as const,
      label: `Form ${f.action}: ${f.formId}`,
      detail: f.fieldName ?? undefined,
      at: f.createdAt,
    })),
    ...errors.map((e) => ({ type: "error" as const, label: `Error: ${e.type}`, detail: e.message, at: e.createdAt })),
  ];

  return timeline.sort((a, b) => a.at.getTime() - b.at.getTime());
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

export interface HeatmapFilters {
  days?: number;
  device?: string;
}

function heatmapWhere(path: string, type: "click" | "hover", filters: HeatmapFilters) {
  return {
    path,
    type,
    ...(filters.days ? { createdAt: { gte: daysAgo(filters.days) } } : {}),
    ...(filters.device ? { session: { visitor: { deviceType: filters.device } } } : {}),
  };
}

export async function getHeatmapPoints(path: string, type: "click" | "hover", filters: HeatmapFilters = {}, limit = 3000) {
  return prisma.heatmapEvent.findMany({
    where: heatmapWhere(path, type, filters),
    select: { xPct: true, yPct: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getHeatmapSummary(path: string, filters: HeatmapFilters = {}) {
  const [clicks, hovers, sessions] = await Promise.all([
    prisma.heatmapEvent.count({ where: heatmapWhere(path, "click", filters) }),
    prisma.heatmapEvent.count({ where: heatmapWhere(path, "hover", filters) }),
    prisma.heatmapEvent.findMany({
      where: { path, ...(filters.days ? { createdAt: { gte: daysAgo(filters.days) } } : {}) },
      select: { sessionId: true },
      distinct: ["sessionId"],
    }),
  ]);
  return { clicks, hovers, sessions: sessions.length };
}

/** Ranked "most clicked/hovered elements" — clustered by CSS selector rather than a raw
 *  point cloud, with a conversion rate per element (sessions that interacted with it and
 *  went on to submit a lead). */
export async function getInteractionHotspots(
  path: string,
  type: "click" | "hover",
  filters: HeatmapFilters = {},
  limit = 15
) {
  const events = await prisma.heatmapEvent.findMany({
    where: { ...heatmapWhere(path, type, filters), selector: { not: null } },
    select: { selector: true, elementText: true, sessionId: true },
  });

  const bySelector = new Map<string, { count: number; sessions: Set<string>; text?: string }>();
  for (const e of events) {
    if (!e.selector) continue;
    const entry = bySelector.get(e.selector) ?? { count: 0, sessions: new Set<string>(), text: e.elementText ?? undefined };
    entry.count += 1;
    entry.sessions.add(e.sessionId);
    if (!entry.text && e.elementText) entry.text = e.elementText;
    bySelector.set(e.selector, entry);
  }

  const allSessionIds = Array.from(new Set(Array.from(bySelector.values()).flatMap((v) => Array.from(v.sessions))));
  const leadSessions = allSessionIds.length
    ? await prisma.lead.findMany({ where: { sessionId: { in: allSessionIds } }, select: { sessionId: true } })
    : [];
  const leadSessionIds = new Set(leadSessions.map((l) => l.sessionId));

  return Array.from(bySelector.entries())
    .map(([selector, v]) => {
      const sessionCount = v.sessions.size;
      const converted = Array.from(v.sessions).filter((id) => leadSessionIds.has(id)).length;
      return {
        selector,
        elementText: v.text,
        count: v.count,
        sessionCount,
        conversionRate: sessionCount ? (converted / sessionCount) * 100 : 0,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** % of sessions on this path that reached each scroll-depth milestone (cumulative). */
export async function getScrollDepthProfile(path: string, days = 30) {
  const since = daysAgo(days);
  const rows = await prisma.scrollEvent.groupBy({
    by: ["sessionId"],
    where: { path, createdAt: { gte: since } },
    _max: { depth: true },
  });
  const total = rows.length;
  const milestones = [10, 25, 50, 75, 90, 100];
  return milestones.map((depth) => {
    const sessions = rows.filter((r) => (r._max.depth ?? 0) >= depth).length;
    return { depth, sessions, pct: total ? Math.round((sessions / total) * 1000) / 10 : 0 };
  });
}

interface TechStackRow {
  isBounce: boolean;
  converted: boolean;
  deviceType: string;
  browser: string;
  os: string;
  screenResolution: string;
  viewport: string;
  language: string;
  network: string;
}

export async function getTechStackData(days = 30) {
  const since = daysAgo(days);
  const sessions = await prisma.session.findMany({
    where: { startedAt: { gte: since } },
    select: {
      isBounce: true,
      language: true,
      viewportWidth: true,
      viewportHeight: true,
      leads: { select: { id: true }, take: 1 },
      visitor: {
        select: { deviceType: true, browser: true, os: true, screenWidth: true, screenHeight: true, network: true },
      },
    },
  });

  const rows: TechStackRow[] = sessions.map((s) => ({
    isBounce: s.isBounce,
    converted: s.leads.length > 0,
    deviceType: s.visitor.deviceType ?? "Unknown",
    browser: s.visitor.browser ?? "Unknown",
    os: s.visitor.os ?? "Unknown",
    screenResolution: s.visitor.screenWidth && s.visitor.screenHeight ? `${s.visitor.screenWidth}×${s.visitor.screenHeight}` : "Unknown",
    viewport: s.viewportWidth && s.viewportHeight ? `${s.viewportWidth}×${s.viewportHeight}` : "Unknown",
    language: s.language ?? "Unknown",
    network: s.visitor.network ?? "Unknown",
  }));

  function breakdown(key: keyof TechStackRow, limit = 10) {
    const groups = new Map<string, { sessions: number; bounces: number; conversions: number }>();
    for (const r of rows) {
      const k = String(r[key]);
      const g = groups.get(k) ?? { sessions: 0, bounces: 0, conversions: 0 };
      g.sessions += 1;
      if (r.isBounce) g.bounces += 1;
      if (r.converted) g.conversions += 1;
      groups.set(k, g);
    }
    return Array.from(groups.entries())
      .map(([label, g]) => ({
        label,
        sessions: g.sessions,
        bounceRate: g.sessions ? Math.round((g.bounces / g.sessions) * 1000) / 10 : 0,
        conversionRate: g.sessions ? Math.round((g.conversions / g.sessions) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, limit);
  }

  return {
    devices: breakdown("deviceType"),
    browsers: breakdown("browser"),
    oses: breakdown("os"),
    screenResolutions: breakdown("screenResolution"),
    viewports: breakdown("viewport"),
    languages: breakdown("language"),
    networks: breakdown("network"),
  };
}

/** Leads + full session data, for the /admin/meta-capi dry-run payload composer and
 *  delivery log — a lead's real conversion send needs the same Session row CAPI itself reads. */
export async function getLeadsForCapiPreview(limit = 50) {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { session: true },
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
