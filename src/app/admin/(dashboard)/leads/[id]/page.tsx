import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { getLeadDetail } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const TIMELINE_LABELS: Record<string, string> = {
  pageview: "bg-blue-50 text-blue-700",
  event: "bg-slate-100 text-slate-700",
  scroll: "bg-purple-50 text-purple-700",
  cta: "bg-rose-50 text-rose-700",
  form: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getLeadDetail(id);
  if (!detail) notFound();

  const { lead, visitCount, landingPage, pageViews, timeline, hasReplay } = detail;

  return (
    <div>
      <Link
        href="/admin/leads"
        className="mb-4 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to leads
      </Link>

      <PageHeader title={lead.name ?? "Lead"} description={`Submitted ${lead.createdAt.toLocaleString()}`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Details</h2>
          <dl className="space-y-3 text-sm">
            <Field label="Status">
              <LeadStatusSelect leadId={lead.id} status={lead.status} />
            </Field>
            <Field label="Phone" value={lead.phone} />
            <Field label="Email" value={lead.email} />
            <Field label="Config" value={lead.config} />
            <Field label="Budget" value={lead.budget} />
            <Field label="Message" value={lead.message} />
            <Field label="Source" value={lead.source} />
            <Field label="Campaign" value={lead.session?.utmCampaign} />
            <Field label="Location" value={[lead.visitor?.city, lead.visitor?.country].filter(Boolean).join(", ")} />
            <Field label="Device" value={lead.visitor?.deviceType} />
            <Field label="Visit count" value={String(visitCount)} />
            <Field label="Landing page" value={landingPage} />
            <Field
              label="Meta CAPI"
              value={lead.metaCapiSentAt ? "Sent" : lead.metaCapiError ? `Failed: ${lead.metaCapiError}` : "Not sent"}
            />
            {hasReplay && (
              <Link
                href={`/admin/sessions/${lead.sessionId}/replay`}
                className="flex items-center gap-1.5 pt-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <PlayCircle className="h-3.5 w-3.5" strokeWidth={2} />
                Watch session replay
              </Link>
            )}
          </dl>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Page-by-page time on this visit</h2>
            <Table>
              <Thead>
                <Th>Path</Th>
                <Th>Entered</Th>
                <Th>Time on page</Th>
              </Thead>
              <tbody>
                {pageViews.map((p, i) => (
                  <Tr key={i}>
                    <Td className="text-slate-900">{p.path}</Td>
                    <Td>{p.enteredAt.toLocaleTimeString()}</Td>
                    <Td>{formatDuration(p.timeOnPage)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            {pageViews.length === 0 && <EmptyState message="No page views recorded." />}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Event timeline</h2>
            <div className="max-h-120 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              {timeline.length === 0 ? (
                <EmptyState message="No events recorded for this session." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {timeline.map((t, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="w-20 shrink-0 text-xs tabular-nums text-slate-400">
                        {t.at.toLocaleTimeString()}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TIMELINE_LABELS[t.type] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {t.type}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-slate-700">
                        {t.label}
                        {t.detail && <span className="ml-1.5 text-slate-400">{t.detail}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string | null; children?: ReactNode }) {
  if (!children && !value) return null;
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{children ?? value}</dd>
    </div>
  );
}
