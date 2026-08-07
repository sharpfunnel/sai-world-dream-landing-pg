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

function observeCtaElement(el: Element) {
  observer?.observe(el);
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
  document.querySelectorAll("[data-cta]").forEach(observeCtaElement);
}

/**
 * CTAs added after initial mount (client-side nav, dynamic content, e.g. a modal or a
 * lazily-rendered section) would otherwise never get "viewed" tracking — the
 * IntersectionObserver above only ever saw the DOM as it existed at init time.
 */
function watchForNewCtas() {
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches("[data-cta]")) observeCtaElement(node);
        node.querySelectorAll?.("[data-cta]").forEach(observeCtaElement);
      }
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

export function initCtaTracking() {
  if (typeof window === "undefined" || listenersAttached) return;
  listenersAttached = true;
  document.addEventListener("click", handleClick, true);
  document.addEventListener("mouseover", handleMouseOver, true);
  if ("IntersectionObserver" in window) {
    requestAnimationFrame(observeCtas);
    if ("MutationObserver" in window) watchForNewCtas();
  }
}
