"use client";

const CONSENT_STORAGE_KEY = "aa_replay_consent";
export const REPLAY_CONSENT_EVENT = "aa:replay-consent-changed";

export type ReplayConsent = "granted" | "denied";

export function getReplayConsent(): ReplayConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setReplayConsent(value: ReplayConsent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // ignore — consent just won't persist across reloads
  }
  window.dispatchEvent(new CustomEvent(REPLAY_CONSENT_EVENT, { detail: value }));
}
