import { NextResponse } from "next/server";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { prisma } from "@/lib/prisma";
import { upsertVisitor, findOrCreateSession, type SessionIdentity } from "@/lib/tracking/resolveVisitorSession";
import { readIpFromHeaders, readMetaCookies } from "@/lib/tracking/geo";
import type {
  CtaEventPayload,
  ErrorEventPayload,
  FormEventPayload,
  GenericEvent,
  HeatmapEventPayload,
  MouseEventPayload,
  PageviewEvent,
  PerformanceEventPayload,
  ScrollEventPayload,
} from "@/lib/tracking/types";

export const runtime = "nodejs";

interface TrackPayload {
  visitorId: string;
  session: SessionIdentity;
  events: unknown[];
}

function isValidPayload(body: unknown): body is TrackPayload {
  if (!body || typeof body !== "object") return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.visitorId === "string" &&
    candidate.visitorId.length > 0 &&
    typeof candidate.session === "object" &&
    candidate.session !== null &&
    typeof (candidate.session as Record<string, unknown>).id === "string" &&
    Array.isArray(candidate.events)
  );
}

function isType<T extends { type: string }>(event: unknown, type: T["type"]): event is T {
  return typeof event === "object" && event !== null && (event as { type?: unknown }).type === type;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { visitorId, session, events } = body;

  const pageviews = events.filter((e): e is PageviewEvent => isType(e, "pageview") && typeof (e as PageviewEvent).path === "string");
  const generic = events.filter((e): e is GenericEvent => isType(e, "event"));
  const scrolls = events.filter((e): e is ScrollEventPayload => isType(e, "scroll"));
  const ctas = events.filter((e): e is CtaEventPayload => isType(e, "cta"));
  const forms = events.filter((e): e is FormEventPayload => isType(e, "form"));
  const perf = events.filter((e): e is PerformanceEventPayload => isType(e, "performance"));
  const errors = events.filter((e): e is ErrorEventPayload => isType(e, "error"));
  const mouse = events.filter((e): e is MouseEventPayload => isType(e, "mouse"));
  const heatmap = events.filter((e): e is HeatmapEventPayload => isType(e, "heatmap"));

  try {
    const visitor = await upsertVisitor(visitorId, request.headers, session);

    const firstPath = pageviews[0]?.path;
    const lastPath = pageviews[pageviews.length - 1]?.path ?? firstPath;

    const { session: dbSession, created } = await findOrCreateSession(
      visitor.id,
      session,
      firstPath,
      readIpFromHeaders(request.headers),
      readMetaCookies(request.headers)
    );

    if (events.length > 0) {
      const now = new Date();
      const elapsedSeconds = Math.round((now.getTime() - dbSession.startedAt.getTime()) / 1000);
      // `created` sessions already have pagesViewed seeded from firstPath — incrementing again
      // here would double-count, so only increment for a session that already existed.
      const totalPagesViewed = created ? dbSession.pagesViewed : dbSession.pagesViewed + pageviews.length;
      // A single-page site rarely accumulates pageviews, so pageview count alone is a poor
      // bounce signal — any real engagement (scroll/CTA/form/custom event) or >=10s on site
      // counts as "not a bounce" too, matching how GA4 defines an engaged session. This must
      // also apply on the creating batch itself, since the first flush can already contain
      // scroll/CTA events alongside the pageview.
      const hasEngagementSignal =
        totalPagesViewed > 1 ||
        elapsedSeconds >= 10 ||
        scrolls.length + ctas.length + forms.length + generic.length > 0;

      await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          endedAt: now,
          totalDuration: elapsedSeconds,
          pagesViewed: created ? undefined : { increment: pageviews.length },
          exitPath: lastPath ?? undefined,
          isBounce: dbSession.isBounce && !hasEngagementSignal,
        },
      });
    }

    const sessionId = dbSession.id;

    await Promise.all([
      pageviews.length > 0 &&
        prisma.pageView.createMany({
          data: pageviews.map((event) => ({
            sessionId,
            path: event.path,
            title: event.title,
            enteredAt: new Date(event.timestamp),
          })),
        }),
      generic.length > 0 &&
        prisma.event.createMany({
          data: generic.map((event) => ({
            sessionId,
            name: event.name,
            metadata: event.metadata as InputJsonValue | undefined,
            createdAt: new Date(event.timestamp),
          })),
        }),
      scrolls.length > 0 &&
        prisma.scrollEvent.createMany({
          data: scrolls.map((event) => ({
            sessionId,
            path: event.path,
            depth: event.depth,
            timeToReach: event.timeToReach,
            createdAt: new Date(event.timestamp),
          })),
        }),
      ctas.length > 0 &&
        prisma.ctaEvent.createMany({
          data: ctas.map((event) => ({
            sessionId,
            ctaId: event.ctaId,
            action: event.action,
            timeBeforeClick: event.timeBeforeClick,
            createdAt: new Date(event.timestamp),
          })),
        }),
      forms.length > 0 &&
        prisma.formEvent.createMany({
          data: forms.map((event) => ({
            sessionId,
            formId: event.formId,
            action: event.action,
            fieldName: event.fieldName,
            errorMessage: event.errorMessage,
            createdAt: new Date(event.timestamp),
          })),
        }),
      perf.length > 0 &&
        prisma.performanceMetric.createMany({
          data: perf.map((event) => ({
            sessionId,
            path: event.path,
            metric: event.metric,
            value: event.value,
            rating: event.rating,
            createdAt: new Date(event.timestamp),
          })),
        }),
      errors.length > 0 &&
        prisma.errorEvent.createMany({
          data: errors.map((event) => ({
            sessionId,
            type: event.errorType,
            message: event.message,
            stack: event.stack,
            path: event.path,
            createdAt: new Date(event.timestamp),
          })),
        }),
      mouse.length > 0 &&
        prisma.mouseEvent.createMany({
          data: mouse.map((event) => ({
            sessionId,
            path: event.path,
            type: event.mouseType,
            x: Math.round(event.x),
            y: Math.round(event.y),
            targetSelector: event.targetSelector,
            createdAt: new Date(event.timestamp),
          })),
        }),
      heatmap.length > 0 &&
        prisma.heatmapEvent.createMany({
          data: heatmap.map((event) => ({
            sessionId,
            path: event.path,
            type: event.heatmapType,
            xPct: event.xPct,
            yPct: event.yPct,
            viewportWidth: Math.round(event.viewportWidth),
            selector: event.selector,
            elementText: event.elementText,
            createdAt: new Date(event.timestamp),
          })),
        }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/track] failed to record event", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
