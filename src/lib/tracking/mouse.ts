"use client";

import { trackHeatmap, trackMouseEvent } from "./client";

const RAGE_WINDOW_MS = 1000;
const RAGE_THRESHOLD = 3;
const RAGE_RADIUS_PX = 30;
const HOVER_DWELL_MS = 600;

let listenersAttached = false;
let clickBuffer: { x: number; y: number; time: number }[] = [];
let rageFiredAt = 0;
let hoverTimer: ReturnType<typeof setTimeout> | null = null;

function currentPath(): string {
  return window.location.pathname + window.location.search;
}

/**
 * Heatmap coordinates are normalized against the full scrollable page, not the
 * viewport — on a long scrolling landing page, viewport-relative coordinates
 * would collapse every click into "near the top" regardless of scroll position.
 */
function pageDimensions() {
  const doc = document.documentElement;
  return { width: doc.scrollWidth, height: doc.scrollHeight };
}

function describeTarget(el: Element): string {
  if (el.id) return `#${el.id}`;
  const cta = el.getAttribute("data-cta");
  if (cta) return `[data-cta="${cta}"]`;
  const cls = typeof el.className === "string" ? el.className.split(/\s+/).filter(Boolean)[0] : undefined;
  return cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase();
}

function isDeadClick(target: Element): boolean {
  const interactive = target.closest(
    'a[href], button, input, select, textarea, label, [role="button"], [onclick], [data-cta], summary'
  );
  if (interactive) return false;
  return window.getComputedStyle(target).cursor === "pointer";
}

function isRageClick(x: number, y: number, now: number): boolean {
  clickBuffer = clickBuffer.filter((c) => now - c.time < RAGE_WINDOW_MS);
  clickBuffer.push({ x, y, time: now });
  if (clickBuffer.length < RAGE_THRESHOLD) return false;
  if (now - rageFiredAt < RAGE_WINDOW_MS) return false;

  const recent = clickBuffer.slice(-RAGE_THRESHOLD);
  const clustered = recent.every((c) => Math.hypot(c.x - x, c.y - y) <= RAGE_RADIUS_PX);
  if (clustered) rageFiredAt = now;
  return clustered;
}

function handleClick(e: MouseEvent) {
  const target = e.target as Element | null;
  if (!target) return;

  const { width, height } = pageDimensions();
  trackHeatmap(currentPath(), "click", e.pageX / width, e.pageY / height, window.innerWidth);

  const now = Date.now();
  if (isRageClick(e.clientX, e.clientY, now)) {
    trackMouseEvent(currentPath(), "rage_click", e.clientX, e.clientY, describeTarget(target));
    return;
  }
  if (isDeadClick(target)) {
    trackMouseEvent(currentPath(), "dead_click", e.clientX, e.clientY, describeTarget(target));
  }
}

function handleDoubleClick(e: MouseEvent) {
  const target = e.target as Element | null;
  trackMouseEvent(currentPath(), "double_click", e.clientX, e.clientY, target ? describeTarget(target) : undefined);
}

function handleMouseOver(e: MouseEvent) {
  if (hoverTimer) clearTimeout(hoverTimer);
  const x = e.pageX;
  const y = e.pageY;
  hoverTimer = setTimeout(() => {
    const { width, height } = pageDimensions();
    trackHeatmap(currentPath(), "hover", x / width, y / height, window.innerWidth);
  }, HOVER_DWELL_MS);
}

function handleMouseOut() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
}

export function initMouseTracking() {
  if (typeof window === "undefined" || listenersAttached) return;
  listenersAttached = true;

  document.addEventListener("click", handleClick, true);
  document.addEventListener("dblclick", handleDoubleClick, true);
  document.addEventListener("mouseover", handleMouseOver, true);
  document.addEventListener("mouseout", handleMouseOut, true);
}
