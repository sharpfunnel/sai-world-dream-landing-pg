"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, isAdminPreview, trackPageview } from "@/lib/tracking/client";
import { initCtaTracking } from "@/lib/tracking/cta";
import { initErrorTracking } from "@/lib/tracking/errors";
import { initMouseTracking } from "@/lib/tracking/mouse";
import { resetScrollTracking, initScrollTracking } from "@/lib/tracking/scroll";
import { initPerformanceTracking } from "@/lib/tracking/vitals";
import { initSessionReplay } from "@/lib/tracking/replay";

export function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin") || isAdminPreview()) return;
    initAnalytics();
    initScrollTracking();
    initCtaTracking();
    initErrorTracking();
    initPerformanceTracking();
    initMouseTracking();
    initSessionReplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin") || isAdminPreview()) return;
    const path = window.location.pathname + window.location.search;
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackPageview(path, document.title);
    resetScrollTracking(path);
  }, [pathname]);

  return null;
}
