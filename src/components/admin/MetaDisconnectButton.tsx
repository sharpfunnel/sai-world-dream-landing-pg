"use client";

import { useTransition } from "react";
import { disconnectMetaAdAccount } from "@/lib/meta/actions";

export function MetaDisconnectButton({ accountId }: { accountId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Disconnect this ad account? Historical data is kept, syncing stops.")) {
          startTransition(() => disconnectMetaAdAccount(accountId));
        }
      }}
      className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
