"use client";

import { trackScroll } from "./client";

const THRESHOLDS = [10, 25, 50, 75, 90, 100];

let reached = new Set<number>();
let pageLoadTime = Date.now();
let currentPath = "";
let ticking = false;
let listenerAttached = false;

function computeDepth(): number {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const viewportHeight = window.innerHeight;
  const fullHeight = doc.scrollHeight;
  if (fullHeight <= viewportHeight) return 100;
  const depth = ((scrollTop + viewportHeight) / fullHeight) * 100;
  return Math.min(100, Math.round(depth));
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const depth = computeDepth();
    for (const threshold of THRESHOLDS) {
      if (depth >= threshold && !reached.has(threshold)) {
        reached.add(threshold);
        trackScroll(currentPath, threshold, Date.now() - pageLoadTime);
      }
    }
  });
}

/** Call on every route change to reset depth tracking for the new page. */
export function resetScrollTracking(path: string) {
  currentPath = path;
  reached = new Set();
  pageLoadTime = Date.now();
  onScroll();
}

export function initScrollTracking() {
  if (typeof window === "undefined" || listenerAttached) return;
  listenerAttached = true;
  currentPath = window.location.pathname + window.location.search;
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
