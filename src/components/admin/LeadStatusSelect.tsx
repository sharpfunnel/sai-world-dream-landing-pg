"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/lib/admin/actions";
import { LEAD_STATUSES } from "@/lib/admin/constants";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300",
  contacted: "bg-yellow-500/15 text-yellow-300",
  qualified: "bg-violet-500/15 text-violet-300",
  won: "bg-emerald-500/15 text-emerald-300",
  lost: "bg-neutral-500/15 text-neutral-400",
};

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateLeadStatus(leadId, e.target.value))}
      className={`rounded-md border-0 px-2 py-1 text-xs font-medium capitalize outline-none disabled:opacity-50 ${
        STATUS_STYLES[status] ?? STATUS_STYLES.new
      }`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-neutral-900 text-white">
          {s}
        </option>
      ))}
    </select>
  );
}
