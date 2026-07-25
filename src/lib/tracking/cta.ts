"use client";

import { trackCta } from "./client";

const viewed = new Set<string>();
const hovered = new Set<string>();
let observer: IntersectionObserver | null = null;
let listenersAttached = false;

function ctaIdOf(el: Element): string | null {
  return el.getAttribute("data-cta");
}

function handleClick(e: MouseEvent) {
  const target = (e.target as Element | null)?.closest("[data-cta]");
  const ctaId = target ? ctaIdOf(target) : null;
  if (ctaId) trackCta(ctaId, "clicked");
}

function handleMouseOver(e: MouseEvent) {
  const target = (e.target as Element | null)?.closest("[data-cta]");
  const ctaId = target ? ctaIdOf(target) : null;
  if (ctaId && !hovered.has(ctaId)) {
    hovered.add(ctaId);
    trackCta(ctaId, "hovered");
  }
}

function observeCtas() {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const ctaId = ctaIdOf(entry.target);
        if (ctaId && !viewed.has(ctaId)) {
          viewed.add(ctaId);
          trackCta(ctaId, "viewed");
        }
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-cta]").forEach((el) => observer?.observe(el));
}

export function initCtaTracking() {
  if (typeof window === "undefined" || listenersAttached) return;
  listenersAttached = true;
  document.addEventListener("click", handleClick, true);
  document.addEventListener("mouseover", handleMouseOver, true);
  if ("IntersectionObserver" in window) {
    requestAnimationFrame(observeCtas);
  }
}
