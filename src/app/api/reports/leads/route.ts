import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { resolveReportRange, getReportLeads } from "@/lib/admin/reports";
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

  const leads = await getReportLeads(range.since, range.until);
  const filename = `leads-${range.presetKey}`;

  if (format === "xlsx") {
    const buffer = await buildWorkbookBuffer(
      "Leads",
      [
        { header: "Name", key: "name", width: 20 },
        { header: "Phone", key: "phone", width: 16 },
        { header: "Email", key: "email", width: 26 },
        { header: "Config", key: "config", width: 14 },
        { header: "Budget", key: "budget", width: 14 },
        { header: "Message", key: "message", width: 32 },
        { header: "Source", key: "source", width: 14 },
        { header: "Status", key: "status", width: 12 },
        { header: "Received", key: "createdAt", width: 20 },
      ],
      leads.map((l) => ({
        name: l.name ?? "",
        phone: l.phone ?? "",
        email: l.email ?? "",
        config: l.config ?? "",
        budget: l.budget ?? "",
        message: l.message ?? "",
        source: l.source ?? "",
        status: l.status,
        createdAt: l.createdAt.toLocaleString(),
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
    ["Name", "Phone", "Email", "Config", "Budget", "Message", "Source", "Status", "Received"],
    leads.map((l) => [
      l.name,
      l.phone,
      l.email,
      l.config,
      l.budget,
      l.message,
      l.source,
      l.status,
      l.createdAt.toLocaleString(),
    ])
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
