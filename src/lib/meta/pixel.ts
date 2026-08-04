"use client";

/**
 * The Meta Pixel base code (init + PageView) is already installed via GTM
 * (GTM-W7MFGWFW), which defines `window.fbq` on every non-admin page. This
 * module only adds the one thing GTM's tag can't do: pair a `Lead` event
 * with the server-side CAPI event using a shared eventID for dedup.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Fires the browser half of a Lead conversion.
 *
 * `eventId` MUST match the `event_id` the server sends via CAPI for the same
 * lead — Meta collapses the two into one conversion when both `event_name`
 * and the event ID match. `trackSingle` (not `track`) pins this call to our
 * pixel ID so it can never broadcast into a different dataset.
 */
export function trackPixelLead(eventId: string) {
  if (!META_PIXEL_ID) return;
  window.fbq?.("trackSingle", META_PIXEL_ID, "Lead", {}, { eventID: eventId });
}
