import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { Pagination } from "@/components/admin/Pagination";
import { getSessions, getSessionFilterOptions, type SessionFilters } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

interface SessionsSearchParams {
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  from?: string;
  to?: string;
  page?: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatRelativeTime(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function statusOf(session: { endedAt: Date | null; isBounce: boolean; startedAt: Date }) {
  if (!session.endedAt && Date.now() - session.startedAt.getTime() < 5 * 60 * 1000) {
    return { label: "Live", className: "bg-emerald-50 text-emerald-700" };
  }
  if (session.isBounce) return { label: "Bounced", className: "bg-amber-50 text-amber-700" };
  return { label: "Completed", className: "bg-slate-100 text-slate-600" };
}

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<SessionsSearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const filters: SessionFilters = {
    device: sp.device,
    browser: sp.browser,
    os: sp.os,
    country: sp.country,
    dateFrom: sp.from,
    dateTo: sp.to,
  };

  const [{ sessions, total, totalPages }, filterOptions] = await Promise.all([
    getSessions(filters, page, 50),
    getSessionFilterOptions(),
  ]);

  const hasFilters = sp.device || sp.browser || sp.os || sp.country || sp.from || sp.to;

  return (
    <div>
      <PageHeader title="Sessions" description={`${total} session${total === 1 ? "" : "s"}`} />

      <form
        method="get"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3"
      >
        <FilterSelect name="device" label="Device" defaultValue={sp.device} options={filterOptions.devices} />
        <FilterSelect name="browser" label="Browser" defaultValue={sp.browser} options={filterOptions.browsers} />
        <FilterSelect name="os" label="OS" defaultValue={sp.os} options={filterOptions.oses} />
        <FilterSelect name="country" label="Country" defaultValue={sp.country} options={filterOptions.countries} />
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
        {hasFilters && (
          <Link
            href="/admin/sessions"
            className="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Clear
          </Link>
        )}
      </form>

      <Table>
        <Thead>
          <Th>When</Th>
          <Th>User</Th>
          <Th>Browser / OS</Th>
          <Th>Location</Th>
          <Th>Source</Th>
          <Th>Duration</Th>
          <Th>Scroll</Th>
          <Th>Mouse</Th>
          <Th>CTA</Th>
          <Th>Form</Th>
          <Th>Status</Th>
          <Th>Replay</Th>
        </Thead>
        <tbody>
          {sessions.map((s) => {
            const status = statusOf(s);
            const maxScrollDepth = s.scrollEvents[0]?.depth ?? 0;
            return (
              <Tr key={s.id}>
                <Td title={s.startedAt.toLocaleString()}>{formatRelativeTime(s.startedAt)}</Td>
                <Td className="text-slate-900">
                  {s.visitor.fingerprint.slice(0, 8)}
                  {s.visitor.deviceType ? <span className="ml-1.5 text-slate-500">· {s.visitor.deviceType}</span> : null}
                  <span
                    className={`ml-1.5 text-xs font-medium ${s.visitor.isReturning ? "text-amber-600" : "text-emerald-600"}`}
                  >
                    · {s.visitor.isReturning ? "Returning" : "New"}
                  </span>
                </Td>
                <Td>
                  {s.visitor.browser ?? "—"}
                  {s.visitor.os && <span className="text-slate-400"> · {s.visitor.os}</span>}
                </Td>
                <Td>{[s.visitor.city, s.visitor.country].filter(Boolean).join(", ") || "—"}</Td>
                <Td>{s.utmSource ?? (s.referrer ? (hostnameOf(s.referrer) ?? s.referrer) : "Direct")}</Td>
                <Td className="tabular-nums">{formatDuration(s.totalDuration)}</Td>
                <Td className="tabular-nums">{maxScrollDepth ? `${maxScrollDepth}%` : "—"}</Td>
                <Td className="tabular-nums">{s._count.mouseEvents || "—"}</Td>
                <Td className="tabular-nums">{s._count.ctaEvents || "—"}</Td>
                <Td className="tabular-nums">{s._count.formEvents || "—"}</Td>
                <Td>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </Td>
                <Td>
                  {s._count.replayChunks > 0 ? (
                    <Link
                      href={`/admin/sessions/${s.id}/replay`}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      <PlayCircle className="h-3.5 w-3.5" strokeWidth={2} />
                      Watch
                    </Link>
                  ) : (
                    "—"
                  )}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      {sessions.length === 0 && <EmptyState message="No sessions recorded yet." />}

      <Pagination
        basePath="/admin/sessions"
        searchParams={{
          device: sp.device,
          browser: sp.browser,
          os: sp.os,
          country: sp.country,
          from: sp.from,
          to: sp.to,
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
