"use client";

import { trackError } from "./client";

let initialized = false;

export function initErrorTracking() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  window.addEventListener(
    "error",
    (event) => {
      const path = window.location.pathname;

      if (event.target instanceof HTMLImageElement) {
        trackError("image_load", `Failed to load image: ${event.target.currentSrc || event.target.src}`, undefined, path);
        return;
      }

      if (event.error instanceof Error) {
        trackError("js", event.error.message, event.error.stack, path);
      } else if (event.message) {
        trackError("js", event.message, undefined, path);
      }
    },
    true
  );

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    trackError("unhandled_rejection", message, stack, window.location.pathname);
  });
}
