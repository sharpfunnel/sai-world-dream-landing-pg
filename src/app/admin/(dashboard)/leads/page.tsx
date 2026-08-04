import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { SendCapiModal } from "@/components/admin/SendCapiModal";
import { getLeads } from "@/lib/admin/queries";
import { LEAD_STATUSES } from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

function rawParamsTitle(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const entries = Object.entries(raw as Record<string, string>);
  if (entries.length === 0) return undefined;
  return entries.map(([k, v]) => `${k}=${v}`).join("\n");
}

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
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
          <Th>Meta CAPI</Th>
        </Thead>
        <tbody>
          {leads.map((lead) => (
            <Tr key={lead.id}>
              <Td className="text-slate-900">{lead.name ?? "—"}</Td>
              <Td>{lead.phone ?? "—"}</Td>
              <Td>{lead.email ?? "—"}</Td>
              <Td>{lead.config ?? "—"}</Td>
              <Td>{lead.budget ?? "—"}</Td>
              <Td title={rawParamsTitle(lead.session?.rawParams)}>
                {lead.source ?? "—"}
                {lead.session?.utmMedium && (
                  <div className="mt-0.5 text-xs text-slate-400">
                    {lead.session.utmMedium}
                    {lead.session.utmCampaign && ` · ${lead.session.utmCampaign}`}
                  </div>
                )}
                {(lead.session?.utmContent || lead.session?.utmTerm) && (
                  <div className="text-xs text-slate-400">
                    {lead.session.utmContent && `ad: ${lead.session.utmContent}`}
                    {lead.session.utmContent && lead.session.utmTerm && " · "}
                    {lead.session.utmTerm && `adset: ${lead.session.utmTerm}`}
                  </div>
                )}
              </Td>
              <Td>
                <LeadStatusSelect leadId={lead.id} status={lead.status} />
              </Td>
              <Td>{lead.createdAt.toLocaleString()}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  {lead.metaCapiSentAt ? (
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      Sent
                    </span>
                  ) : lead.metaCapiError ? (
                    <span
                      className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                      title={lead.metaCapiError}
                    >
                      Failed
                    </span>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                      —
                    </span>
                  )}
                  <SendCapiModal
                    lead={{
                      id: lead.id,
                      name: lead.name,
                      city: lead.visitor?.city ?? null,
                      country: lead.visitor?.country ?? null,
                      adId: lead.session?.metaAdId ?? lead.session?.utmContent ?? null,
                      placement: lead.session?.placement ?? null,
                    }}
                  />
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {leads.length === 0 && <EmptyState message="No leads for this filter yet." />}
    </div>
  );
}
