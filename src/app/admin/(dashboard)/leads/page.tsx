import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { SendCapiModal } from "@/components/admin/SendCapiModal";
import { getLeads, getLeadFilterOptions, type LeadFilters } from "@/lib/admin/queries";
import { LEAD_STATUSES } from "@/lib/admin/constants";

export const dynamic = "force-dynamic";

interface LeadsSearchParams {
  status?: string;
  source?: string;
  campaign?: string;
  country?: string;
  device?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
}

function rawParamsTitle(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const entries = Object.entries(raw as Record<string, string>);
  if (entries.length === 0) return undefined;
  return entries.map(([k, v]) => `${k}=${v}`).join("\n");
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<LeadsSearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filters: LeadFilters = {
    status: sp.status,
    source: sp.source,
    campaign: sp.campaign,
    country: sp.country,
    device: sp.device,
    dateFrom: sp.from,
    dateTo: sp.to,
    search: sp.q,
  };

  const [{ leads, total, totalPages }, filterOptions] = await Promise.all([
    getLeads(filters, page, 50),
    getLeadFilterOptions(),
  ]);

  const statusHref = (s: string) => {
    const params = new URLSearchParams();
    if (sp.source) params.set("source", sp.source);
    if (sp.campaign) params.set("campaign", sp.campaign);
    if (sp.country) params.set("country", sp.country);
    if (sp.device) params.set("device", sp.device);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    if (sp.q) params.set("q", sp.q);
    if (s !== "all") params.set("status", s);
    const qs = params.toString();
    return qs ? `/admin/leads?${qs}` : "/admin/leads";
  };

  return (
    <div>
      <PageHeader title="Leads" description={`${total} lead${total === 1 ? "" : "s"}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...LEAD_STATUSES].map((s) => (
          <Link
            key={s}
            href={statusHref(s)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              (sp.status ?? "all") === s
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3"
      >
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <div className="flex-1 basis-48">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">Search</label>
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              name="q"
              defaultValue={sp.q}
              placeholder="Name, phone, email…"
              className="w-full min-w-0 text-sm text-slate-900 outline-none"
            />
          </div>
        </div>
        <FilterSelect name="source" label="Source" defaultValue={sp.source} options={filterOptions.sources} />
        <FilterSelect name="campaign" label="Campaign" defaultValue={sp.campaign} options={filterOptions.campaigns} />
        <FilterSelect name="country" label="Country" defaultValue={sp.country} options={filterOptions.countries} />
        <FilterSelect name="device" label="Device" defaultValue={sp.device} options={filterOptions.devices} />
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">From</label>
          <input
            type="date"
            name="from"
            defaultValue={sp.from}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">To</label>
          <input
            type="date"
            name="to"
            defaultValue={sp.to}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Filter
        </button>
        {(sp.source || sp.campaign || sp.country || sp.device || sp.from || sp.to || sp.q) && (
          <Link
            href={statusHref(sp.status ?? "all")}
            className="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Clear
          </Link>
        )}
      </form>

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
              <Td className="text-slate-900">
                <Link href={`/admin/leads/${lead.id}`} className="hover:text-blue-600 hover:underline">
                  {lead.name ?? "—"}
                </Link>
              </Td>
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

      <Pagination
        basePath="/admin/leads"
        searchParams={{
          status: sp.status,
          source: sp.source,
          campaign: sp.campaign,
          country: sp.country,
          device: sp.device,
          from: sp.from,
          to: sp.to,
          q: sp.q,
        }}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
