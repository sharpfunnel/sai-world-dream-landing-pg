import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getErrors } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  js: "bg-red-500/15 text-red-300",
  unhandled_rejection: "bg-orange-500/15 text-orange-300",
  image_load: "bg-yellow-500/15 text-yellow-300",
};

export default async function AdminErrorsPage() {
  const errors = await getErrors(100);

  return (
    <div>
      <PageHeader title="Errors" description="Most recent 100 client-side errors" />

      <Table>
        <Thead>
          <Th>Time</Th>
          <Th>Type</Th>
          <Th>Message</Th>
          <Th>Path</Th>
        </Thead>
        <tbody>
          {errors.map((e) => (
            <Tr key={e.id}>
              <Td>{e.createdAt.toLocaleString()}</Td>
              <Td>
                <span className={`rounded-md px-2 py-1 text-xs font-medium ${TYPE_STYLES[e.type] ?? "bg-neutral-500/15 text-neutral-400"}`}>
                  {e.type}
                </span>
              </Td>
              <Td className="max-w-md truncate text-white" title={e.message}>
                {e.message}
              </Td>
              <Td>{e.path ?? "—"}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {errors.length === 0 && <EmptyState message="No errors recorded. Good sign." />}
    </div>
  );
}
