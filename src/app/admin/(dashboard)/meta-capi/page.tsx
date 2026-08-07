import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getLeadsForCapiPreview } from "@/lib/admin/queries";
import { buildDryRunPayload } from "@/lib/meta/capi";

export const dynamic = "force-dynamic";

export default async function AdminMetaCapiPage() {
  const leads = await getLeadsForCapiPreview(50);

  return (
    <div>
      <PageHeader
        title="Meta CAPI"
        description="Dry-run composer for Conversions API payloads — builds and displays the exact payload without ever contacting Meta, plus the delivery log for every lead's automatic server-side send. To actually resend a lead's event, use Send on the Leads page."
      />

      <Table>
        <Thead>
          <Th>Lead</Th>
          <Th>Submitted</Th>
          <Th>Delivery status</Th>
          <Th>Payload preview</Th>
        </Thead>
        <tbody>
          {leads.map((lead) => {
            const payload = lead.session
              ? buildDryRunPayload(lead, lead.session, { ip: null, userAgent: null, sourceUrl: null })
              : null;
            return (
              <Tr key={lead.id}>
                <Td className="text-slate-900">{lead.name ?? "—"}</Td>
                <Td>{lead.createdAt.toLocaleString()}</Td>
                <Td>
                  {lead.metaCapiSentAt ? (
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      Sent {lead.metaCapiSentAt.toLocaleString()}
                    </span>
                  ) : lead.metaCapiError ? (
                    <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                      Failed: {lead.metaCapiError}
                    </span>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                      Not sent
                    </span>
                  )}
                </Td>
                <Td>
                  {payload ? (
                    <details>
                      <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700">
                        View payload
                      </summary>
                      <pre className="mt-2 max-w-xl overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-200">
                        {JSON.stringify(payload, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    "—"
                  )}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      {leads.length === 0 && <EmptyState message="No leads yet." />}
    </div>
  );
}
