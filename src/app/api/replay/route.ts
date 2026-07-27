import { gzipSync } from "zlib";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface ReplayPayload {
  visitorId: string;
  sessionId: string;
  events: unknown[];
}

function isValidPayload(body: unknown): body is ReplayPayload {
  if (!body || typeof body !== "object") return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.visitorId === "string" &&
    typeof candidate.sessionId === "string" &&
    candidate.sessionId.length > 0 &&
    Array.isArray(candidate.events) &&
    candidate.events.length > 0
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

  const { sessionId, events } = body;

  try {
    const session = await prisma.session.findUnique({ where: { clientId: sessionId }, select: { id: true } });
    // A replay chunk can arrive before /api/track has created the session row
    // (its own flush runs on a separate, slower interval). Tell the client to
    // retry rather than dropping it — this chunk may hold the rrweb full
    // snapshot, without which the whole replay is unplayable.
    if (!session) return NextResponse.json({ ok: true, retry: true });

    const compressed = gzipSync(Buffer.from(JSON.stringify(events)));
    await prisma.sessionReplay.create({
      data: { sessionId: session.id, data: compressed, eventCount: events.length },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/replay] failed to store replay chunk", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
