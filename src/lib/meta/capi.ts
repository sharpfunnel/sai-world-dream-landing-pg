import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Lead, Session } from "@/generated/prisma/client";

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION ?? "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email: string | null | undefined): string | undefined {
  if (!email) return undefined;
  return sha256(email.trim().toLowerCase());
}

// Meta expects digits-only E.164 (no leading +). Leads in this project are
// overwhelmingly Indian numbers submitted without a country code.
function hashPhone(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return sha256(withCountryCode);
}

function buildFbc(fbclid: string | null | undefined, clickedAt: Date): string | undefined {
  if (!fbclid) return undefined;
  return `fb.1.${clickedAt.getTime()}.${fbclid}`;
}

interface CapiCredentials {
  pixelId: string;
  accessToken: string;
}

async function getCapiCredentials(): Promise<CapiCredentials | null> {
  const pixelId = process.env.META_PIXEL_ID;
  if (!pixelId) return null;

  const accessToken =
    process.env.META_CAPI_ACCESS_TOKEN ??
    (
      await prisma.metaAdAccount.findFirst({
        where: { accessToken: { not: null } },
        select: { accessToken: true },
      })
    )?.accessToken;

  if (!accessToken) return null;
  return { pixelId, accessToken };
}

export interface CapiRequestInfo {
  ip: string | null;
  userAgent: string | null;
  sourceUrl: string | null;
}

export async function sendLeadConversionEvent(lead: Lead, session: Session, requestInfo: CapiRequestInfo): Promise<void> {
  const credentials = await getCapiCredentials();
  if (!credentials) return;

  const emailHash = hashEmail(lead.email);
  const phoneHash = hashPhone(lead.phone);

  const userData = {
    em: emailHash ? [emailHash] : undefined,
    ph: phoneHash ? [phoneHash] : undefined,
    external_id: [sha256(lead.visitorId)],
    client_ip_address: requestInfo.ip ?? undefined,
    client_user_agent: requestInfo.userAgent ?? undefined,
    fbc: buildFbc(session.fbclid, session.startedAt),
  };

  const body = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(lead.createdAt.getTime() / 1000),
        event_id: lead.id,
        action_source: "website",
        event_source_url: requestInfo.sourceUrl ?? undefined,
        user_data: userData,
        custom_data: {
          content_name: lead.config ?? undefined,
          lead_source: lead.source ?? undefined,
        },
      },
    ],
    access_token: credentials.accessToken,
    ...(process.env.META_CAPI_TEST_EVENT_CODE ? { test_event_code: process.env.META_CAPI_TEST_EVENT_CODE } : {}),
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${credentials.pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    if (!res.ok) {
      throw new Error(json?.error?.message ?? `Meta CAPI request failed (${res.status})`);
    }
    await prisma.lead.update({ where: { id: lead.id }, data: { metaCapiSentAt: new Date(), metaCapiError: null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CAPI error";
    console.error("[meta-capi] failed to send Lead event", error);
    await prisma.lead.update({ where: { id: lead.id }, data: { metaCapiError: message } });
  }
}
