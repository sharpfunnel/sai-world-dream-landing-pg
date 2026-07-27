"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import GoldFrame from "@/components/ui/GoldFrame";
import IconBadge from "@/components/ui/IconBadge";
import Button from "@/components/ui/Button";
import { getReplayConsent, setReplayConsent, REPLAY_CONSENT_EVENT, type ReplayConsent } from "@/lib/tracking/consent";

function subscribe(callback: () => void) {
  window.addEventListener(REPLAY_CONSENT_EVENT, callback);
  return () => window.removeEventListener(REPLAY_CONSENT_EVENT, callback);
}

function getServerSnapshot(): ReplayConsent {
  // No decision is visible during SSR — default to "denied" so the banner never
  // flashes on first paint; useSyncExternalStore reconciles with localStorage
  // right after hydration if the real answer is "no decision yet" (null).
  return "denied";
}

export function ReplayConsentBanner() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, getReplayConsent, getServerSnapshot);

  if (pathname.startsWith("/admin") || consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6">
      <GoldFrame
        tone="dark"
        className="mx-auto flex max-w-2xl flex-col gap-4 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <IconBadge icon="ShieldCheck" tone="dark" />
          <p className="text-sm text-white/70">
            We use anonymized browsing data to improve this page and your experience. Form fields are always
            masked.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="md" onClick={() => setReplayConsent("denied")}>
            No thanks
          </Button>
          <Button variant="primary" size="md" onClick={() => setReplayConsent("granted")}>
            Allow
          </Button>
        </div>
      </GoldFrame>
    </div>
  );
}
