import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getPerformanceStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const UNITS: Record<string, string> = {
  LCP: "ms",
  INP: "ms",
  FCP: "ms",
  TTFB: "ms",
  CLS: "",
};

function formatValue(metric: string, value: number): string {
  if (metric === "CLS") return value.toFixed(3);
  return `${Math.round(value)}${UNITS[metric] ?? ""}`;
}

function RatingBar({ good, needsImprovement, poor }: { good: number; needsImprovement: number; poor: number }) {
  const total = good + needsImprovement + poor || 1;
  return (
    <div className="flex h-2 w-40 overflow-hidden rounded-full bg-neutral-800">
      <div style={{ width: `${(good / total) * 100}%`, backgroundColor: "#0ca30c" }} />
      <div style={{ width: `${(needsImprovement / total) * 100}%`, backgroundColor: "#fab219" }} />
      <div style={{ width: `${(poor / total) * 100}%`, backgroundColor: "#d03b3b" }} />
    </div>
  );
}

export default async function AdminPerformancePage() {
  const metrics = await getPerformanceStats(30);

  return (
    <div>
      <PageHeader title="Performance" description="Core Web Vitals, last 30 days" />

      <Table>
        <Thead>
          <Th>Metric</Th>
          <Th>Average</Th>
          <Th>Samples</Th>
          <Th>Good / needs improvement / poor</Th>
        </Thead>
        <tbody>
          {metrics.map((m) => (
            <Tr key={m.metric}>
              <Td className="text-white">{m.metric}</Td>
              <Td className="tabular-nums">{formatValue(m.metric, m.avg)}</Td>
              <Td className="tabular-nums">{m.count}</Td>
              <Td>
                <div className="flex items-center gap-3">
                  <RatingBar good={m.good} needsImprovement={m.needsImprovement} poor={m.poor} />
                  <span className="tabular-nums text-xs text-neutral-500">
                    {m.good}/{m.needsImprovement}/{m.poor}
                  </span>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {metrics.length === 0 && <EmptyState message="No performance data yet." />}
    </div>
  );
}
