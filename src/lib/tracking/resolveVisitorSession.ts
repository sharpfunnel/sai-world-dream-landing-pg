import { prisma } from "@/lib/prisma";
import { readGeoFromHeaders } from "./geo";
import { parseUserAgent } from "./parseUserAgent";
import type { Visitor, Session } from "@/generated/prisma/client";

export interface SessionIdentity {
  id: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  timezone?: string;
}

export async function upsertVisitor(
  fingerprint: string,
  headers: Headers,
  session: Pick<SessionIdentity, "timezone" | "language" | "screenWidth" | "screenHeight">
): Promise<Visitor> {
  const geo = readGeoFromHeaders(headers);
  const ua = parseUserAgent(headers.get("user-agent"));

  const existing = await prisma.visitor.findUnique({
    where: { fingerprint },
    select: { id: true },
  });

  const data = {
    country: geo.country,
    region: geo.region,
    city: geo.city,
    timezone: session.timezone ?? geo.timezone,
    language: session.language,
    browser: ua.browser,
    browserVersion: ua.browserVersion,
    os: ua.os,
    deviceType: ua.deviceType,
    screenWidth: session.screenWidth,
    screenHeight: session.screenHeight,
  };

  return prisma.visitor.upsert({
    where: { fingerprint },
    create: { fingerprint, isReturning: false, ...data },
    update: { isReturning: existing !== null, ...data },
  });
}

export async function findOrCreateSession(
  visitorId: string,
  session: SessionIdentity,
  entryPath?: string,
  ipAddress?: string | null
): Promise<{ session: Session; created: boolean }> {
  const existing = await prisma.session.findUnique({ where: { clientId: session.id } });
  if (existing) return { session: existing, created: false };

  const created = await prisma.session.create({
    data: {
      clientId: session.id,
      visitorId,
      referrer: session.referrer,
      utmSource: session.utmSource,
      utmMedium: session.utmMedium,
      utmCampaign: session.utmCampaign,
      utmContent: session.utmContent,
      utmTerm: session.utmTerm,
      gclid: session.gclid,
      fbclid: session.fbclid,
      msclkid: session.msclkid,
      ipAddress,
      viewportWidth: session.viewportWidth,
      viewportHeight: session.viewportHeight,
      entryPath,
      exitPath: entryPath,
      pagesViewed: entryPath ? 1 : 0,
      isBounce: true,
    },
  });
  return { session: created, created: true };
}
