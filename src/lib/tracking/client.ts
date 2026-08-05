"use client";

import type {
  CtaEventPayload,
  ErrorEventPayload,
  FormEventPayload,
  HeatmapEventPayload,
  MouseEventPayload,
  PerformanceEventPayload,
  ScrollEventPayload,
  TrackedEvent,
} from "./types";
import { trackPixelLead } from "@/lib/meta/pixel";

const VISITOR_STORAGE_KEY = "aa_vid";
const SESSION_STORAGE_KEY = "aa_sid";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 5000;
const MAX_QUEUE_SIZE = 20;
const TRACK_ENDPOINT = "/api/track";
const LEADS_ENDPOINT = "/api/leads";

interface SessionMeta {
  id: string;
  startedAt: number;
  lastActivity: number;
}

interface SessionContext {
  meta: SessionMeta;
  isNew: boolean;
  utm: Record<string, string | undefined>;
  rawParams?: Record<string, string>;
  referrer?: string;
}

let queue: TrackedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateVisitorId(): { id: string; isNew: boolean } {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return { id: existing, isNew: false };
    const id = uuid();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, id);
    return { id, isNew: true };
  } catch {
    return { id: uuid(), isNew: true };
  }
}

function readUtm(): Record<string, string | undefined> {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
    utmTerm: params.get("utm_term") ?? undefined,
    gclid: params.get("gclid") ?? undefined,
    fbclid: params.get("fbclid") ?? undefined,
    msclkid: params.get("msclkid") ?? undefined,
    placement: params.get("placement") ?? undefined,
    metaCampaignId: params.get("campaign_id") ?? undefined,
    metaAdsetId: params.get("adset_id") ?? undefined,
    metaAdId: params.get("ad_id") ?? undefined,
  };
}

/** Every query param on the landing URL, verbatim — a catch-all so no acquisition
 *  signal is lost even if it isn't one of the named fields readUtm() extracts. */
function readRawParams(): Record<string, string> | undefined {
  const params = new URLSearchParams(window.location.search);
  const entries = Object.fromEntries(params.entries());
  return Object.keys(entries).length ? entries : undefined;
}

export function getSession(): SessionContext {
  const now = Date.now();
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const meta: SessionMeta = JSON.parse(raw);
      if (now - meta.lastActivity < SESSION_TIMEOUT_MS) {
        meta.lastActivity = now;
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(meta));
        return { meta, isNew: false, utm: {} };
      }
    }
  } catch {
    // storage unavailable — fall through to a fresh in-memory session
  }
  const meta: SessionMeta = { id: uuid(), startedAt: now, lastActivity: now };
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // ignore
  }
  return {
    meta,
    isNew: true,
    utm: readUtm(),
    rawParams: readRawParams(),
    referrer: document.referrer || undefined,
  };
}

function buildSessionPayload(session: SessionContext) {
  return {
    id: session.meta.id,
    isNew: session.isNew,
    referrer: session.referrer,
    ...session.utm,
    rawParams: session.rawParams,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function send(endpoint: string, payload: unknown, useBeacon: boolean) {
  const body = JSON.stringify(payload);
  if (useBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(endpoint, blob)) return;
  }
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function flush(useBeacon = false) {
  if (queue.length === 0) return;
  const events = queue.splice(0, queue.length);
  const visitor = getOrCreateVisitorId();
  const session = getSession();

  send(
    TRACK_ENDPOINT,
    {
      visitorId: visitor.id,
      isNewVisitor: visitor.isNew,
      session: buildSessionPayload(session),
      events,
    },
    useBeacon
  );
}

export interface LeadFields {
  name?: string;
  phone?: string;
  email?: string;
  config?: string;
  budget?: string;
  message?: string;
}

/**
 * Persists the lead. Submission is immediately followed by a WhatsApp app handoff
 * (native app switch on mobile), which can background or tear down the page before
 * a plain fetch finishes — so this prefers sendBeacon (survives that handoff) and
 * falls back to a keepalive fetch, mirroring the reliable-delivery pattern in send().
 *
 * sendBeacon has no response body, so the lead id can't come back from the server —
 * it's generated here instead and sent as `leadId` for the API route to use as the
 * row's primary key. That lets the Meta pixel's `Lead` event fire immediately with
 * the same id the server-side CAPI event will use, which is what lets Meta dedup them.
 */
export async function submitLead(formId: string, fields: LeadFields): Promise<{ ok: boolean; leadId: string }> {
  const leadId = uuid();
  if (typeof window === "undefined") return { ok: false, leadId };
  const visitor = getOrCreateVisitorId();
  const session = getSession();
  const payload = {
    visitorId: visitor.id,
    session: buildSessionPayload(session),
    formId,
    leadId,
    ...fields,
  };

  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon(LEADS_ENDPOINT, blob)) {
      trackPixelLead(leadId);
      return { ok: true, leadId };
    }
  }

  try {
    const res = await fetch(LEADS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (res.ok) trackPixelLead(leadId);
    return { ok: res.ok, leadId };
  } catch {
    return { ok: false, leadId };
  }
}

/** Enriches a lead created by submitLead() with the optional details collected on /thank-you. */
export async function patchLead(
  leadId: string,
  fields: { config?: string; email?: string; budget?: string; message?: string }
): Promise<boolean> {
  try {
    const res = await fetch(LEADS_ENDPOINT, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, ...fields }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function enqueue(event: TrackedEvent, flushImmediately = false) {
  if (typeof window === "undefined") return;
  queue.push(event);
  if (flushImmediately || queue.length >= MAX_QUEUE_SIZE) flush();
}

export function trackPageview(path: string, title?: string) {
  enqueue({ type: "pageview", path, title, timestamp: Date.now() });
}

export function trackEvent(name: string, metadata?: Record<string, unknown>) {
  enqueue({ type: "event", name, metadata, timestamp: Date.now() });
}

export function trackScroll(path: string, depth: number, timeToReach: number) {
  const payload: ScrollEventPayload = { type: "scroll", path, depth, timeToReach, timestamp: Date.now() };
  enqueue(payload);
}

export function trackCta(
  ctaId: string,
  action: CtaEventPayload["action"],
  timeBeforeClick?: number
) {
  const payload: CtaEventPayload = { type: "cta", ctaId, action, timeBeforeClick, timestamp: Date.now() };
  enqueue(payload, action === "clicked");
}

export function trackFormEvent(
  formId: string,
  action: FormEventPayload["action"],
  fieldName?: string,
  errorMessage?: string
) {
  const payload: FormEventPayload = { type: "form", formId, action, fieldName, errorMessage, timestamp: Date.now() };
  enqueue(payload, action === "submitted");
}

export function trackPerformance(
  path: string,
  metric: PerformanceEventPayload["metric"],
  value: number,
  rating: PerformanceEventPayload["rating"]
) {
  const payload: PerformanceEventPayload = { type: "performance", path, metric, value, rating, timestamp: Date.now() };
  enqueue(payload);
}

export function trackError(
  errorType: ErrorEventPayload["errorType"],
  message: string,
  stack?: string,
  path?: string
) {
  const payload: ErrorEventPayload = {
    type: "error",
    errorType,
    message: message.slice(0, 2000),
    stack: stack?.slice(0, 4000),
    path,
    timestamp: Date.now(),
  };
  enqueue(payload, true);
}

export function trackMouseEvent(
  path: string,
  mouseType: MouseEventPayload["mouseType"],
  x: number,
  y: number,
  targetSelector?: string
) {
  const payload: MouseEventPayload = { type: "mouse", path, mouseType, x, y, targetSelector, timestamp: Date.now() };
  enqueue(payload);
}

export function trackHeatmap(
  path: string,
  heatmapType: HeatmapEventPayload["heatmapType"],
  xPct: number,
  yPct: number,
  viewportWidth: number
) {
  const payload: HeatmapEventPayload = { type: "heatmap", path, heatmapType, xPct, yPct, viewportWidth, timestamp: Date.now() };
  enqueue(payload);
}

/** True when the current document is the admin heatmap's iframe preview of a live page. */
export function isAdminPreview(): boolean {
  if (typeof window === "undefined") return false;
  if (window.self !== window.top) return true;
  return new URLSearchParams(window.location.search).has("admin_preview");
}

export function initAnalytics() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  flushTimer = setInterval(() => flush(), FLUSH_INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
  window.addEventListener("pagehide", () => flush(true));

  window.addEventListener("beforeunload", () => {
    if (flushTimer) clearInterval(flushTimer);
  });
}
