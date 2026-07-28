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

const SEARCH_ENGINE_HOSTS = ["google.", "bing.", "yahoo.", "duckduckgo.", "baidu.", "yandex."];

/** No paid click id, no non-organic utm attribution, and referrer is a known search engine. */
function isOrganicSearch(s: {
  utmMedium: string | null;
  utmSource: string | null;
  referrer: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
}): boolean {
  if (s.gclid || s.fbclid || s.msclkid) return false;
  if (s.utmMedium) return s.utmMedium.toLowerCase() === "organic";
  if (s.utmSource) return false;
  const host = s.referrer ? hostnameOf(s.referrer) : null;
  return host !== null && SEARCH_ENGINE_HOSTS.some((engine) => host.includes(engine));
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
          <Th>Pages</Th>
          <Th>Duration</Th>
          <Th>Bounce</Th>
          <Th>Keywords</Th>
          <Th>Signed up?</Th>
          <Th>SERP?</Th>
          <Th>Project?</Th>
          <Th>Replay</Th>
        </Thead>
        <tbody>
          {sessions.map((s) => {
            const signedUp = s.leads.length > 0;
            return (
              <Tr key={s.id}>
                <Td title={s.startedAt.toLocaleString()}>{s.startedAt.toLocaleString()}</Td>
                <Td title={s.startedAt.toLocaleString()}>{formatRelativeTime(s.startedAt)}</Td>
                <Td className="text-white">
                  {s.visitor.fingerprint.slice(0, 8)}
                  {s.visitor.deviceType ? <span className="ml-1.5 text-neutral-500">· {s.visitor.deviceType}</span> : null}
                  <span
                    className={`ml-1.5 text-xs font-medium ${s.visitor.isReturning ? "text-amber-400" : "text-emerald-400"}`}
                  >
                    · {s.visitor.isReturning ? "Returning" : "New"}
                  </span>
                </Td>
                <Td>{s.ipAddress ?? "—"}</Td>
                <Td>{[s.visitor.city, s.visitor.country].filter(Boolean).join(", ") || "—"}</Td>
                <Td>{s.utmSource ?? (s.referrer ? (hostnameOf(s.referrer) ?? s.referrer) : "Direct")}</Td>
                <Td>{s.utmMedium ?? "—"}</Td>
                <Td>{s.utmCampaign ?? "—"}</Td>
                <Td className="tabular-nums">{s._count.pageViews}</Td>
                <Td className="tabular-nums">{formatDuration(s.totalDuration)}</Td>
                <Td>{s.isBounce ? "Yes" : "No"}</Td>
                <Td>{s.utmTerm ?? "—"}</Td>
                <Td>{signedUp ? "Yes" : "No"}</Td>
                <Td>{isOrganicSearch(s) ? "Yes" : "No"}</Td>
                <Td>{signedUp ? (s.leads[0].config ?? "—") : "—"}</Td>
                <Td>
                  {s._count.replayChunks > 0 ? (
                    <Link
                      href={`/admin/sessions/${s.id}/replay`}
                      className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
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
