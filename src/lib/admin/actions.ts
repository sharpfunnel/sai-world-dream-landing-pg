"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export async function updateLeadStatus(leadId: string, status: string) {
  await verifyAdminSession();
  await prisma.lead.update({ where: { id: leadId }, data: { status } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
