import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertVisitor, findOrCreateSession, type SessionIdentity } from "@/lib/tracking/resolveVisitorSession";
import { readIpFromHeaders, readMetaCookies } from "@/lib/tracking/geo";
import { sendLeadConversionEvent } from "@/lib/meta/capi";
import { isValidEmail, isValidName, isValidPhone } from "@/lib/validation";

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

  if (!name || !isValidName(name)) {
    return NextResponse.json({ error: "Please enter a valid name" }, { status: 400 });
  }
  if (!phone || !isValidPhone(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

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

/** Fills in optional details (configuration, email, budget, message) a visitor adds on the thank-you page. */
export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const candidate = body as Record<string, unknown>;
  const leadId = typeof candidate.leadId === "string" ? candidate.leadId : "";
  if (!LEAD_ID_PATTERN.test(leadId)) {
    return NextResponse.json({ error: "leadId is required" }, { status: 400 });
  }

  const config = typeof candidate.config === "string" ? candidate.config.trim() : "";
  const email = typeof candidate.email === "string" ? candidate.email.trim() : "";
  const budget = typeof candidate.budget === "string" ? candidate.budget.trim() : "";
  const message = typeof candidate.message === "string" ? candidate.message.trim() : "";
  if (!config && !email && !budget && !message) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(config ? { config } : {}),
        ...(email ? { email } : {}),
        ...(budget ? { budget } : {}),
        ...(message ? { message } : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
