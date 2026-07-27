import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { syncAllMetaAdAccounts } from "@/lib/meta/sync";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await syncAllMetaAdAccounts();
  return NextResponse.json({ ok: true, ...result });
}
