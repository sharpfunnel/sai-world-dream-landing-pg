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
      className="rounded-md px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
