"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/lib/admin/actions";
import { LEAD_STATUSES } from "@/lib/admin/constants";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-violet-50 text-violet-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-slate-100 text-slate-500",
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
        <option key={s} value={s} className="bg-white text-slate-900">
          {s}
        </option>
      ))}
    </select>
  );
}
