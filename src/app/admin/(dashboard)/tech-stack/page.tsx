import { PageHeader } from "@/components/admin/PageHeader";
import { DateRangeSelect } from "@/components/admin/DateRangeSelect";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getTechStackData } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

interface BreakdownRow {
  label: string;
  sessions: number;
  bounceRate: number;
  conversionRate: number;
}

function BreakdownTable({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      <Table>
        <Thead>
          <Th>{title}</Th>
          <Th>Sessions</Th>
          <Th>Bounce rate</Th>
          <Th>Conversion rate</Th>
        </Thead>
        <tbody>
          {rows.map((r) => (
            <Tr key={r.label}>
              <Td className="text-slate-900">{r.label}</Td>
              <Td className="tabular-nums">{r.sessions}</Td>
              <Td className="tabular-nums">{r.bounceRate.toFixed(1)}%</Td>
              <Td>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                    r.conversionRate > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {r.conversionRate.toFixed(1)}%
                </span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <EmptyState message="No data yet." />}
    </div>
  );
}

export default async function AdminTechStackPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days = Number(sp.days) || 30;
  const data = await getTechStackData(days);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageHeader title="Tech stack" description="What visitors actually browse on, and how each cohort performs." />
        <DateRangeSelect basePath="/admin/tech-stack" searchParams={{}} days={days} />
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2">
        <BreakdownTable title="Device" rows={data.devices} />
        <BreakdownTable title="Browser" rows={data.browsers} />
        <BreakdownTable title="OS" rows={data.oses} />
        <BreakdownTable title="Screen resolution" rows={data.screenResolutions} />
        <BreakdownTable title="Viewport size" rows={data.viewports} />
        <BreakdownTable title="Language" rows={data.languages} />
        <BreakdownTable title="Connection" rows={data.networks} />
      </div>
    </div>
  );
}
