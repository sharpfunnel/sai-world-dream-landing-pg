"use client";

import { useSyncExternalStore } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import { isAdminPreview } from "@/lib/tracking/client";

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

/**
 * The admin heatmap page renders live pages in an iframe to overlay click/hover
 * data. Without this gate, every heatmap view would fire a real GTM pageview
 * (and downstream ad pixels) for a page nobody actually visited.
 */
export function ConditionalGTM({ gtmId }: { gtmId: string }) {
  const enabled = useSyncExternalStore(subscribe, () => !isAdminPreview(), getServerSnapshot);

  if (!enabled) return null;
  return <GoogleTagManager gtmId={gtmId} />;
}
