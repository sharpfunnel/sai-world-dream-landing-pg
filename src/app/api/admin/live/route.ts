import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { getLiveVisitorCount } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  await verifyAdminSession();
  const count = await getLiveVisitorCount();
  return NextResponse.json({ count });
}
