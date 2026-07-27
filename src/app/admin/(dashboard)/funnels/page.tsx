import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/Table";
import { getFunnelStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminFunnelsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  const activeSource = source === "meta" ? "meta" : "all";
  const stages = await getFunnelStats(30, activeSource);
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div>
      <PageHeader
        title="Funnels"
        description="Ad click → landing page → scroll → CTA click → form started → lead — last 30 days"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "meta"] as const).map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/funnels" : "/admin/funnels?source=meta"}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeSource === s ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
            }`}
          >
            {s === "all" ? "All traffic" : "Meta ads traffic"}
          </Link>
        ))}
      </div>

      {stages.every((s) => s.count === 0) ? (
        <EmptyState message="No sessions yet for this filter." />
      ) : (
        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.key} className="rounded-lg border border-white/10 bg-neutral-900 p-4">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                <span className="font-medium text-white">{stage.label}</span>
                <span className="text-neutral-400">
                  <span className="tabular-nums text-white">{stage.count.toLocaleString()}</span>
                  {" · "}
                  {stage.conversionFromStart}% of start
                  {stage.dropOffFromPrev > 0 && (
                    <span className="text-red-400"> · -{stage.dropOffFromPrev}% drop-off</span>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSource === "meta" && stages[0]?.key !== "adClicks" && (
        <p className="mt-4 text-xs text-neutral-500">
          Connect a Meta ad account on the{" "}
          <Link href="/admin/campaigns" className="text-blue-400 hover:text-blue-300">
            Campaigns
          </Link>{" "}
          page to see the &quot;Ad clicks&quot; stage sourced from Meta&apos;s own reporting.
        </p>
      )}
    </div>
  );
}
