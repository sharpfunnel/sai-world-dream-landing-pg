import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { HeatmapOverlay } from "@/components/admin/HeatmapOverlay";
import { EmptyState } from "@/components/admin/Table";
import { getHeatmapPaths, getHeatmapPoints } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string; type?: string }>;
}) {
  const params = await searchParams;
  const paths = await getHeatmapPaths();
  const path = params.path ?? paths[0] ?? "/";
  const type = params.type === "hover" ? "hover" : "click";

  const points = paths.length ? await getHeatmapPoints(path, type) : [];

  return (
    <div>
      <PageHeader
        title="Heatmap"
        description="Click/hover density overlaid on a live preview of the page. Position is normalized to full page height, so it's a close approximation rather than a pixel-exact overlay."
      />

      {paths.length === 0 ? (
        <EmptyState message="No heatmap data yet." />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {paths.map((p) => (
                <Link
                  key={p}
                  href={`/admin/heatmap?path=${encodeURIComponent(p)}&type=${type}`}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    p === path ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 border-l border-white/10 pl-4">
              {(["click", "hover"] as const).map((t) => (
                <Link
                  key={t}
                  href={`/admin/heatmap?path=${encodeURIComponent(path)}&type=${t}`}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    t === type ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                  }`}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          <p className="mb-3 text-xs text-neutral-500">{points.length} points</p>
          <HeatmapOverlay key={path} path={path} points={points} color={type === "click" ? "#d03b3b" : "#3987e5"} />
        </>
      )}
    </div>
  );
}
