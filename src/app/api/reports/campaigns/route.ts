import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { resolveReportRange, getReportCampaigns } from "@/lib/admin/reports";
import { toCsv } from "@/lib/reports/csv";
import { buildWorkbookBuffer } from "@/lib/reports/excel";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  await verifyAdminSession();

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format") ?? "csv";
  const range = resolveReportRange({
    range: searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const campaigns = await getReportCampaigns(range.since, range.until);
  const filename = `campaigns-${range.presetKey}`;

  if (format === "xlsx") {
    const buffer = await buildWorkbookBuffer(
      "Campaigns",
      [
        { header: "Campaign", key: "name", width: 28 },
        { header: "Account", key: "accountName", width: 20 },
        { header: "Status", key: "status", width: 12 },
        { header: "Spend", key: "spend", width: 14 },
        { header: "Impressions", key: "impressions", width: 14 },
        { header: "Clicks", key: "clicks", width: 12 },
        { header: "CTR %", key: "ctr", width: 10 },
        { header: "CPC", key: "cpc", width: 12 },
        { header: "Results", key: "results", width: 12 },
        { header: "Cost / result", key: "costPerResult", width: 14 },
      ],
      campaigns.map((c) => ({
        ...c,
        ctr: Number(c.ctr.toFixed(2)),
        cpc: Number(c.cpc.toFixed(2)),
        spend: Number(c.spend.toFixed(2)),
        costPerResult: Number(c.costPerResult.toFixed(2)),
      }))
    );
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  const csv = toCsv(
    ["Campaign", "Account", "Status", "Spend", "Impressions", "Clicks", "CTR %", "CPC", "Results", "Cost / result"],
    campaigns.map((c) => [
      c.name,
      c.accountName,
      c.status,
      c.spend.toFixed(2),
      c.impressions,
      c.clicks,
      c.ctr.toFixed(2),
      c.cpc.toFixed(2),
      c.results,
      c.costPerResult.toFixed(2),
    ])
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
