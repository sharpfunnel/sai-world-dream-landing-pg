import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { getLeads } from "@/lib/admin/queries";
import { LEAD_STATUSES } from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const leads = await getLeads(status);

  return (
    <div>
      <PageHeader title="Leads" description={`${leads.length} lead${leads.length === 1 ? "" : "s"}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...LEAD_STATUSES].map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/leads" : `/admin/leads?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              (status ?? "all") === s
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <Table>
        <Thead>
          <Th>Name</Th>
          <Th>Phone</Th>
          <Th>Email</Th>
          <Th>Config</Th>
          <Th>Budget</Th>
          <Th>Source</Th>
          <Th>Status</Th>
          <Th>Received</Th>
        </Thead>
        <tbody>
          {leads.map((lead) => (
            <Tr key={lead.id}>
              <Td className="text-white">{lead.name ?? "—"}</Td>
              <Td>{lead.phone ?? "—"}</Td>
              <Td>{lead.email ?? "—"}</Td>
              <Td>{lead.config ?? "—"}</Td>
              <Td>{lead.budget ?? "—"}</Td>
              <Td>{lead.source ?? "—"}</Td>
              <Td>
                <LeadStatusSelect leadId={lead.id} status={lead.status} />
              </Td>
              <Td>{lead.createdAt.toLocaleString()}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {leads.length === 0 && <EmptyState message="No leads for this filter yet." />}
    </div>
  );
}
