import Link from "next/link";
import { notFound } from "next/navigation";
import type { eventWithTime } from "rrweb";
import { PageHeader } from "@/components/admin/PageHeader";
import { ReplayPlayer } from "@/components/admin/ReplayPlayer";
import { getSessionReplay } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminSessionReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const replay = await getSessionReplay(id);
  if (!replay) notFound();

  const { session, events } = replay;

  return (
    <div>
      <Link href="/admin/sessions" className="mb-4 inline-block text-xs font-medium text-blue-400 hover:text-blue-300">
        ← All sessions
      </Link>
      <PageHeader
        title="Session replay"
        description={`${session.visitor.isReturning ? "Returning" : "New"} visitor · started ${session.startedAt.toLocaleString()} · form inputs are masked`}
      />
      <ReplayPlayer events={events as eventWithTime[]} />
    </div>
  );
}
