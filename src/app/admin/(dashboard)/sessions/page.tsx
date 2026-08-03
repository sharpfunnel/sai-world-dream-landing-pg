import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getSessions } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

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

function formatRawParams(raw: unknown): { preview: string; full: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const entries = Object.entries(raw as Record<string, string>);
  if (entries.length === 0) return null;
  return {
    preview: `${entries.length} param${entries.length === 1 ? "" : "s"}`,
    full: entries.map(([k, v]) => `${k}=${v}`).join("\n"),
  };
}

export default async function AdminSessionsPage() {
  const sessions = await getSessions(100);

  return (
    <div>
      <PageHeader title="Sessions" description="Most recent 100 sessions" />

      <Table>
        <Thead>
          <Th>Time</Th>
          <Th>When</Th>
          <Th>User</Th>
          <Th>IP</Th>
          <Th>Location</Th>
          <Th>Source</Th>
          <Th>Medium</Th>
          <Th>Campaign</Th>
          <Th>Params</Th>
          <Th>Duration</Th>
          <Th>Bounce</Th>
          <Th>Replay</Th>
        </Thead>
        <tbody>
          {sessions.map((s) => {
            const rawParams = formatRawParams(s.rawParams);
            return (
              <Tr key={s.id}>
                <Td title={s.startedAt.toLocaleString()}>{s.startedAt.toLocaleString()}</Td>
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
                <Td>{s.ipAddress ?? "—"}</Td>
                <Td>{[s.visitor.city, s.visitor.country].filter(Boolean).join(", ") || "—"}</Td>
                <Td>{s.utmSource ?? (s.referrer ? (hostnameOf(s.referrer) ?? s.referrer) : "Direct")}</Td>
                <Td>{s.utmMedium ?? "—"}</Td>
                <Td>{s.utmCampaign ?? "—"}</Td>
                <Td className="text-xs text-slate-400" title={rawParams?.full}>
                  {rawParams?.preview ?? "—"}
                </Td>
                <Td className="tabular-nums">{formatDuration(s.totalDuration)}</Td>
                <Td>{s.isBounce ? "Yes" : "No"}</Td>
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
    </div>
  );
}
