"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { syncAllMetaAdAccounts } from "./sync";
import { sendLeadConversionEvent, sendManualConversionEvent, type ManualCapiOptions, type ManualCapiResult } from "./capi";

export async function triggerMetaSync() {
  await verifyAdminSession();
  await syncAllMetaAdAccounts();
  revalidatePath("/admin/campaigns");
}

export async function disconnectMetaAdAccount(accountId: string) {
  await verifyAdminSession();
  await prisma.metaAdAccount.update({
    where: { id: accountId },
    data: { accessToken: null, tokenExpiresAt: null, lastSyncError: "Disconnected" },
  });
  revalidatePath("/admin/campaigns");
}

export async function resendLeadCapiEvent(leadId: string) {
  await verifyAdminSession();
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { session: true } });
  if (!lead) return;

  await sendLeadConversionEvent(lead, lead.session, { ip: null, userAgent: null, sourceUrl: null });
  revalidatePath("/admin/leads");
}

export async function sendManualCapiEvent(leadId: string, options: ManualCapiOptions): Promise<ManualCapiResult> {
  await verifyAdminSession();
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { session: true } });
  if (!lead) return { ok: false, error: "Lead not found." };

  const result = await sendManualConversionEvent(lead, lead.session, { ip: null, userAgent: null, sourceUrl: null }, options);
  revalidatePath("/admin/leads");
  return result;
}
