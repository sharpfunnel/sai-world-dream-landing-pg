import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { resolveReportRange, getReportOverview, formatDuration } from "@/lib/admin/reports";
import { toCsv } from "@/lib/reports/csv";
import { buildWorkbookBuffer } from "@/lib/reports/excel";
import { buildSummaryPdf } from "@/lib/reports/pdf";

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

  const overview = await getReportOverview(range.since, range.until);
  const stats = [
    { label: "Visitors", value: overview.visitorCount.toLocaleString() },
    { label: "Sessions", value: overview.sessionCount.toLocaleString() },
    { label: "Leads", value: overview.leadCount.toLocaleString() },
    { label: "Conversion rate", value: `${overview.conversionRate.toFixed(1)}%` },
    { label: "Bounce rate", value: `${overview.bounceRate.toFixed(1)}%` },
    { label: "Avg. session duration", value: formatDuration(overview.avgSessionDuration) },
    { label: "Avg. scroll depth", value: `${Math.round(overview.avgScrollDepth)}%` },
    { label: "Page views", value: overview.pageviewCount.toLocaleString() },
  ];

  const filename = `overview-${range.presetKey}`;

  if (format === "xlsx") {
    const buffer = await buildWorkbookBuffer(
      "Overview",
      [
        { header: "Metric", key: "label", width: 28 },
        { header: "Value", key: "value", width: 18 },
      ],
      stats
    );
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await buildSummaryPdf("Site overview", range.label, stats);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  const csv = toCsv(
    ["Metric", "Value"],
    stats.map((s) => [s.label, s.value])
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
