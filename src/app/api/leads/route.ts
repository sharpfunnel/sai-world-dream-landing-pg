import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertVisitor, findOrCreateSession, type SessionIdentity } from "@/lib/tracking/resolveVisitorSession";

export const runtime = "nodejs";

interface LeadPayload {
  visitorId: string;
  session: SessionIdentity;
  formId: string;
  name?: string;
  phone?: string;
  email?: string;
  config?: string;
  budget?: string;
  message?: string;
}

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
    typeof (candidate.session as Record<string, unknown>).id === "string"
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

  const { visitorId, session, formId, name, phone, email, config, budget, message } = body;

  try {
    const visitor = await upsertVisitor(visitorId, request.headers, session);
    const { session: dbSession } = await findOrCreateSession(visitor.id, session);

    const lead = await prisma.lead.create({
      data: {
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
      select: { id: true },
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    console.error("[/api/leads] failed to record lead", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
