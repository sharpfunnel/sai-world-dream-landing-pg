# Meta CAPI "Send" UI

Manual conversion-event sender for `/admin/leads`, replacing the old one-click "Resend" link.

## What it does

Each lead row's **Meta CAPI** column has a **Send** button. Clicking it opens a modal where you can:

- See the lead's visitor/location/ad-ID/placement context (pulled from `Visitor` + `Session`).
- Pick an event type: Purchase, Lead, Subscribe, Registration (`CompleteRegistration`), Start Trial, or Custom (free-text event name).
- Optionally set a conversion value + currency.
- Optionally set an order/reference ID, used as the CAPI `event_id` for dedup against a client-side Pixel firing the same event.
- Review a live JSON payload preview before sending, with a copy button.
- Send, and see either a success screen (with the Meta event ID) or an inline error banner.

## Files

- `src/components/admin/SendCapiModal.tsx` — the button + modal (client component). Replaced `src/components/admin/ResendCapiButton.tsx` (deleted).
- `src/lib/meta/capi.ts` — added `sendManualConversionEvent`, `CAPI_EVENT_TYPES`, `ManualCapiOptions`/`ManualCapiResult`. Existing `sendLeadConversionEvent` (auto-fired on lead creation) is unchanged.
- `src/lib/meta/actions.ts` — added the `sendManualCapiEvent(leadId, options)` server action the modal calls.
- `src/lib/admin/queries.ts` — `getLeads` now also selects `visitor.city/country` and `session.metaAdId` so the modal has real context instead of placeholders.

Both the automatic ("Lead" on form submit) and manual sends write to the same `Lead.metaCapiSentAt` / `Lead.metaCapiError` columns, so the table's Sent/Failed badge reflects whichever fired most recently.

## Dev preview without credentials

`sendManualConversionEvent` requires `META_PIXEL_ID` + an access token (`META_CAPI_ACCESS_TOKEN` or a connected `MetaAdAccount`). If neither is configured **and `NODE_ENV !== "production"`**, it skips the real Graph API call and returns a fake success (`evt_preview_...` ID) purely so the UI can be reviewed before Meta credentials exist. It does not touch the lead's real `metaCapiSentAt`/`metaCapiError`. Once real credentials are set, this path stops being hit automatically — no cleanup needed.

## Known issue

The local dev server's Turbopack HMR WebSocket (`/_next/webpack-hmr`) was observed failing to connect (`ERR_INVALID_HTTP_RESPONSE`) during this build. Hot-reload may silently not deliver code changes to an already-open tab — a full tab close/reopen (not just refresh) is the reliable way to pick up changes. Not yet root-caused.
