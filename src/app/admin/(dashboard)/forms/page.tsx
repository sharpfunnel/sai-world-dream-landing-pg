import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getFormStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminFormsPage() {
  const forms = await getFormStats(30);

  return (
    <div>
      <PageHeader title="Form funnels" description="Last 30 days" />

      <Table>
        <Thead>
          <Th>Form</Th>
          <Th>Viewed</Th>
          <Th>Started</Th>
          <Th>Submitted</Th>
          <Th>Abandoned</Th>
          <Th>Validation errors</Th>
          <Th>Completion rate</Th>
        </Thead>
        <tbody>
          {forms.map((f) => (
            <Tr key={f.formId}>
              <Td className="text-slate-900">{f.formId}</Td>
              <Td className="tabular-nums">{f.viewed}</Td>
              <Td className="tabular-nums">{f.started}</Td>
              <Td className="tabular-nums">{f.submitted}</Td>
              <Td className="tabular-nums">{f.abandoned}</Td>
              <Td className="tabular-nums">{f.validationErrors}</Td>
              <Td className="tabular-nums">{f.completionRate.toFixed(1)}%</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {forms.length === 0 && <EmptyState message="No form activity yet." />}
    </div>
  );
}
