import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertVisitor, findOrCreateSession, type SessionIdentity } from "@/lib/tracking/resolveVisitorSession";
import { readIpFromHeaders, readMetaCookies } from "@/lib/tracking/geo";
import { sendLeadConversionEvent } from "@/lib/meta/capi";

export const runtime = "nodejs";

interface LeadPayload {
  visitorId: string;
  session: SessionIdentity;
  formId: string;
  leadId?: string;
  name?: string;
  phone?: string;
  email?: string;
  config?: string;
  budget?: string;
  message?: string;
}

const LEAD_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function isValidPayload(body: unknown): body is LeadPayload {
  if (!body || typeof body !== "object") return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.visitorId === "string" &&
    candidate.visitorId.length > 0 &&
    typeof candidate.formId === "string" &&
    candidate.formId.length > 0 &&
    typeof candidate.session === "object" &&
    candidate.session !== null &&
    typeof (candidate.session as Record<string, unknown>).id === "string" &&
    (candidate.leadId === undefined || (typeof candidate.leadId === "string" && LEAD_ID_PATTERN.test(candidate.leadId)))
  );
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

  const { visitorId, session, formId, leadId, name, phone, email, config, budget, message } = body;

  try {
    const ip = readIpFromHeaders(request.headers);
    const metaCookies = readMetaCookies(request.headers);
    const visitor = await upsertVisitor(visitorId, request.headers, session);
    const { session: initialDbSession } = await findOrCreateSession(visitor.id, session, undefined, ip, metaCookies);

    // The session may already exist from an earlier /api/track beacon fired before the
    // pixel had written its cookies. Backfill fbc/fbp here — by form-submit time they're
    // almost always set, and this is the strongest match signal CAPI can send.
    const needsBackfill = (metaCookies.fbc && !initialDbSession.fbc) || (metaCookies.fbp && !initialDbSession.fbp);
    const dbSession = needsBackfill
      ? await prisma.session.update({
          where: { id: initialDbSession.id },
          data: {
            fbc: initialDbSession.fbc ?? metaCookies.fbc ?? undefined,
            fbp: initialDbSession.fbp ?? metaCookies.fbp ?? undefined,
          },
        })
      : initialDbSession;

    const lead = await prisma.lead.create({
      data: {
        id: leadId || undefined,
        visitorId: visitor.id,
        sessionId: dbSession.id,
        formId,
        name,
        phone,
        email,
        config,
        budget,
        message,
        source: session.utmSource,
      },
    });

    await sendLeadConversionEvent(lead, dbSession, {
      ip,
      userAgent: request.headers.get("user-agent"),
      sourceUrl: request.headers.get("referer"),
    }).catch((error) => console.error("[/api/leads] CAPI dispatch threw unexpectedly", error));

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    console.error("[/api/leads] failed to record lead", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
