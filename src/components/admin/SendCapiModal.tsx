"use client";

import { useState, useTransition } from "react";
import {
  Send,
  X,
  Wallet,
  ClipboardList,
  Bell,
  UserCheck,
  Zap,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { sendManualCapiEvent } from "@/lib/meta/actions";
import type { CapiEventType } from "@/lib/meta/capi";

const EVENT_OPTIONS: { value: CapiEventType; label: string; hint: string; icon: typeof Wallet }[] = [
  { value: "Purchase", label: "Purchase", hint: "Paid conversion", icon: Wallet },
  { value: "Lead", label: "Lead", hint: "Signup / form fill", icon: ClipboardList },
  { value: "Subscribe", label: "Subscribe", hint: "Subscription start", icon: Bell },
  { value: "CompleteRegistration", label: "Registration", hint: "Account created", icon: UserCheck },
  { value: "StartTrial", label: "Start Trial", hint: "Free trial began", icon: Zap },
  { value: "Custom", label: "Custom", hint: "Your event name", icon: Sparkles },
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

export interface SendCapiLeadInfo {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  adId: string | null;
  placement: string | null;
}

export function SendCapiModal({ lead }: { lead: SendCapiLeadInfo }) {
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<CapiEventType>("Lead");
  const [customName, setCustomName] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; eventId?: string; error?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const visitorLabel = lead.name?.trim() || "Anonymous";
  const locationLabel = lead.city && lead.country ? `${lead.city} · ${lead.country}` : lead.country || "Unknown";

  function close() {
    setOpen(false);
    setEventType("Lead");
    setCustomName("");
    setValue("");
    setCurrency("INR");
    setOrderId("");
    setResult(null);
  }

  const resolvedEventName = eventType === "Custom" ? customName.trim() || "custom_event" : eventType;

  const payloadPreview = {
    event_name: resolvedEventName,
    event_id: orderId.trim() || "auto-generated",
    action_source: "website",
    user_data: {
      em: lead.name ? ["<hashed if email present>"] : undefined,
      ph: ["<hashed if phone present>"],
      external_id: ["<hashed visitor id>"],
      client_ip_address: "<request ip>",
      client_user_agent: "<request user agent>",
      fbc: "<from session fbclid, if present>",
    },
    custom_data: {
      value: value ? Number(value) : undefined,
      currency: value ? currency : undefined,
      order_id: orderId.trim() || undefined,
    },
  };

  async function handleCopy() {
    await navigator.clipboard.writeText(JSON.stringify(payloadPreview, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleSend() {
    startTransition(async () => {
      const res = await sendManualCapiEvent(lead.id, {
        eventName: eventType,
        customEventName: eventType === "Custom" ? customName : undefined,
        value: value ? Number(value) : undefined,
        currency,
        orderId: orderId.trim() || undefined,
      });
      setResult(res);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
      >
        <Send className="h-3 w-3" strokeWidth={2} />
        Send
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="flex min-w-0 max-h-[90vh] w-full max-w-lg animate-scale-in flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {result?.ok ? (
              <SuccessView eventId={result.eventId} onClose={close} />
            ) : (
              <>
                <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-slate-900">Send Conversion Event to Meta</h2>
                    <p className="mt-1 w-full wrap-break-word text-xs text-slate-500">
                      This posts a server-side event via Meta Conversions API (CAPI). Meta uses it to attribute
                      this conversion to the ad and optimise future delivery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="ml-3 shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>

                <div className="min-w-0 min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 py-4">
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                    <InfoField label="Visitor" value={visitorLabel} />
                    <InfoField label="Location" value={locationLabel} />
                    <InfoField label="Ad ID" value={lead.adId || "—"} />
                    <InfoField label="Placement" value={lead.placement || "—"} />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      Event type <span className="text-red-500">Required</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {EVENT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const selected = eventType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEventType(opt.value)}
                            className={`flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition-colors ${
                              selected
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${selected ? "text-emerald-600" : "text-slate-400"}`}
                              strokeWidth={2}
                            />
                            <span className={`text-xs font-medium ${selected ? "text-emerald-700" : "text-slate-700"}`}>
                              {opt.label}
                            </span>
                            <span className="text-[10px] leading-tight text-slate-400">{opt.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                    {eventType === "Custom" && (
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. site_visit_booked"
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Conversion value <span className="font-normal text-slate-400">(optional for Lead)</span>
                      </label>
                      <div className="flex items-center rounded-md border border-slate-200 px-3 focus-within:border-slate-400">
                        <span className="mr-1 text-sm text-slate-400">{CURRENCY_SYMBOLS[currency] ?? ""}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder="0.00"
                          className="w-full py-2 text-sm text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="-mt-3 w-full wrap-break-word text-xs text-slate-400">
                    The revenue amount for this conversion. Leave blank for lead events with no value.
                  </p>

                  <div className="min-w-0">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Order / reference ID <span className="font-normal text-slate-400">optional but recommended</span>
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. ORD-2026-00142"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                    <p className="mt-1 w-full wrap-break-word text-xs text-slate-400">
                      Used for deduplication — prevents Meta counting the same conversion twice if your pixel also
                      fires.
                    </p>
                  </div>

                  <div className="min-w-0 wrap-break-word rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <span className="font-semibold">Deduplication:</span> If your Meta Pixel also fires a matching
                    event on the thank-you page, Meta will deduplicate using the order ID. Always pass the same
                    order ID in both the pixel event and this CAPI call so Meta counts it only once.
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">Payload preview (what gets sent)</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="max-h-40 w-full overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-200">
                      {JSON.stringify(payloadPreview, null, 2)}
                    </pre>
                  </div>

                  {result && !result.ok && (
                    <div className="min-w-0 wrap-break-word rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      {result.error ?? "Something went wrong sending this event."}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={pending || (eventType === "Custom" && !customName.trim())}
                    onClick={handleSend}
                    className="flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    {pending ? "Sending…" : "Send to Meta"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function SuccessView({ eventId, onClose }: { eventId?: string; onClose: () => void }) {
  return (
    <div className="flex min-w-0 flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-base font-semibold text-emerald-700">Sent to Meta successfully</h2>
      <p className="mt-2 w-full max-w-sm text-sm text-slate-500">
        The conversion event has been posted to Meta Conversions API. Meta will attribute this to the ad and use it
        to optimise future delivery.
      </p>
      {eventId && (
        <p className="mt-3 w-full break-all rounded-md bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-600">
          Event ID: {eventId}
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        Close
      </button>
    </div>
  );
}
