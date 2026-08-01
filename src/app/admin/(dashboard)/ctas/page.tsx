import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getCtaStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminCtasPage() {
  const ctas = await getCtaStats(30);

  return (
    <div>
      <PageHeader title="CTA performance" description="Last 30 days, ranked by clicks" />

      <Table>
        <Thead>
          <Th>CTA</Th>
          <Th>Viewed</Th>
          <Th>Hovered</Th>
          <Th>Clicked</Th>
          <Th>Click-through rate</Th>
        </Thead>
        <tbody>
          {ctas.map((c) => (
            <Tr key={c.ctaId}>
              <Td className="text-slate-900">{c.ctaId}</Td>
              <Td className="tabular-nums">{c.viewed}</Td>
              <Td className="tabular-nums">{c.hovered}</Td>
              <Td className="tabular-nums">{c.clicked}</Td>
              <Td className="tabular-nums">{c.ctr.toFixed(1)}%</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {ctas.length === 0 && <EmptyState message="No CTA activity yet." />}
    </div>
  );
}
