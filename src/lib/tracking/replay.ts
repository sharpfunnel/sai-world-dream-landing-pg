"use client";

import type { eventWithTime } from "rrweb";
import { getOrCreateVisitorId, getSession } from "./client";
import { getReplayConsent, REPLAY_CONSENT_EVENT, type ReplayConsent } from "./consent";

const REPLAY_ENDPOINT = "/api/replay";
const FLUSH_INTERVAL_MS = 15000;
const MAX_BUFFER_SIZE = 300;

let stopRecordingFn: (() => void) | null = null;
let flushTimer: ReturnType<typeof setInterval> | null = null;
let buffer: eventWithTime[] = [];
let initialized = false;

function send(useBeacon: boolean) {
  if (buffer.length === 0) return;
  const events = buffer.splice(0, buffer.length);
  const visitor = getOrCreateVisitorId();
  const session = getSession();
  const body = JSON.stringify({ visitorId: visitor.id, sessionId: session.meta.id, events });

  if (useBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(REPLAY_ENDPOINT, blob)) return;
  }
  fetch(REPLAY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    // `keepalive` caps the request body at ~64 KiB in most browsers (same limit
    // sendBeacon has). The very first chunk of a session carries the rrweb full
    // DOM snapshot, which is routinely several hundred KB — forcing keepalive on
    // every flush silently dropped that chunk every time. Only the actual
    // page-unload path (useBeacon) needs keepalive to survive navigation.
    keepalive: useBeacon,
  })
    .then(async (res) => {
      // The session row (created by /api/track's own flush) may not exist yet —
      // put the chunk back so it retries next tick instead of losing the full snapshot.
      const data = res.ok ? await res.json().catch(() => null) : null;
      if (data?.retry) buffer.unshift(...events);
    })
    .catch(() => {});
}

async function startRecording() {
  if (stopRecordingFn) return;
  const { record } = await import("rrweb");

  // maskAllInputs blanks every form field's recorded value — this is a lead-gen
  // site, every input is potentially PII, and replay fidelity doesn't need it.
  stopRecordingFn =
    record({
      emit: (event) => {
        buffer.push(event as eventWithTime);
        if (buffer.length >= MAX_BUFFER_SIZE) send(false);
      },
      maskAllInputs: true,
      sampling: { scroll: 200, mousemoveCallback: 400 },
    }) ?? null;

  if (!flushTimer) flushTimer = setInterval(() => send(false), FLUSH_INTERVAL_MS);
}

function stopRecording() {
  stopRecordingFn?.();
  stopRecordingFn = null;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  buffer = [];
}

export function initSessionReplay() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  if (getReplayConsent() === "granted") startRecording();

  window.addEventListener(REPLAY_CONSENT_EVENT, (e) => {
    const consent = (e as CustomEvent<ReplayConsent>).detail;
    if (consent === "granted") startRecording();
    else stopRecording();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") send(true);
  });
  window.addEventListener("pagehide", () => send(true));
}
