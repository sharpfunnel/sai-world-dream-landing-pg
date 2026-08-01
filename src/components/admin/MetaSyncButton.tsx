"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { triggerMetaSync } from "@/lib/meta/actions";

export function MetaSyncButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => triggerMetaSync())}
      className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} strokeWidth={2} />
      {pending ? "Syncing…" : "Sync now"}
    </button>
  );
}
