"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { resendLeadCapiEvent } from "@/lib/meta/actions";

export function ResendCapiButton({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => resendLeadCapiEvent(leadId))}
      className="flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
    >
      <RefreshCw className={`h-3 w-3 ${pending ? "animate-spin" : ""}`} strokeWidth={2} />
      {pending ? "Sending…" : "Resend"}
    </button>
  );
}
