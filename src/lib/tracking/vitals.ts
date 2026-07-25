"use client";

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { trackPerformance } from "./client";

let initialized = false;

export function initPerformanceTracking() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  const path = window.location.pathname;
  const report = (metric: Metric) => {
    trackPerformance(path, metric.name, metric.value, metric.rating);
  };

  onLCP(report);
  onINP(report);
  onCLS(report);
  onFCP(report);
  onTTFB(report);
}
