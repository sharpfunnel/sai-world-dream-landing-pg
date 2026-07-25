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

export default async function AdminSessionsPage() {
  const sessions = await getSessions(100);

  return (
    <div>
      <PageHeader title="Sessions" description="Most recent 100 sessions" />

      <Table>
        <Thead>
          <Th>Started</Th>
          <Th>Visitor</Th>
          <Th>Device</Th>
          <Th>Location</Th>
          <Th>Source</Th>
          <Th>Pages</Th>
          <Th>Duration</Th>
          <Th>Bounce</Th>
        </Thead>
        <tbody>
          {sessions.map((s) => (
            <Tr key={s.id}>
              <Td>{s.startedAt.toLocaleString()}</Td>
              <Td className="text-white">
                {s.visitor.isReturning ? "Returning" : "New"}
                <span className="ml-1.5 text-neutral-500">· {s.visitor.fingerprint.slice(0, 8)}</span>
              </Td>
              <Td>
                {s.visitor.deviceType ?? "—"}
                {s.visitor.browser ? ` · ${s.visitor.browser}` : ""}
              </Td>
              <Td>{[s.visitor.city, s.visitor.country].filter(Boolean).join(", ") || "—"}</Td>
              <Td>{s.utmSource ? `${s.utmSource}${s.utmMedium ? ` / ${s.utmMedium}` : ""}` : s.referrer ?? "Direct"}</Td>
              <Td className="tabular-nums">{s._count.pageViews}</Td>
              <Td className="tabular-nums">{formatDuration(s.totalDuration)}</Td>
              <Td>{s.isBounce ? "Yes" : "No"}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {sessions.length === 0 && <EmptyState message="No sessions recorded yet." />}
    </div>
  );
}
