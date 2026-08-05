"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { CONFIG_OPTIONS } from "@/data/project";
import { patchLead, trackFormEvent } from "@/lib/tracking/client";

const FORM_ID = "thank-you-form";

export default function ThankYouOptionalForm({ leadId }: { leadId: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [values, setValues] = useState({ config: "", email: "", budget: "", message: "" });
  const startedRef = useRef(false);

  const handleFocus = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFormEvent(FORM_ID, "started");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!values.config && !values.email && !values.budget && !values.message) return;
    setStatus("submitting");
    trackFormEvent(FORM_ID, "submitted");
    const ok = await patchLead(leadId, values);
    setStatus(ok ? "success" : "error");
  };

  const inputClass =
    "w-full rounded-md bg-white/95 border border-white/10 px-4 py-3 text-sm text-navy-950 placeholder:text-navy-700/50 focus:outline-none focus:ring-2 focus:ring-gold-400";

  if (status === "success") {
    return (
      <div className="flex w-full flex-col items-center gap-2 rounded-md border border-white/15 bg-white/10 p-6 text-center backdrop-blur-md">
        <CheckCircle2 className="h-8 w-8 text-gold-300" />
        <p className="text-sm text-white/80">Thanks — we&apos;ve added those details to your enquiry.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={handleFocus}
      className="flex w-full flex-col gap-4 rounded-md border border-white/15 bg-white/10 p-6 text-left backdrop-blur-md sm:p-7"
    >
      <div>
        <h2 className="font-display text-lg font-semibold text-white">Add a Few More Details</h2>
        <p className="mt-1 text-sm text-white/65">
          Optional — helps our team prepare a more relevant callback for you.
        </p>
      </div>

      <select name="config" value={values.config} onChange={handleChange} className={inputClass}>
        <option value="" disabled>
          Configuration Interested (optional)
        </option>
        {CONFIG_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <input
        type="email"
        name="email"
        placeholder="Email (optional)"
        value={values.email}
        onChange={handleChange}
        className={inputClass}
      />
      <input
        type="text"
        name="budget"
        placeholder="Budget (optional)"
        value={values.budget}
        onChange={handleChange}
        className={inputClass}
      />
      <textarea
        name="message"
        placeholder="Message (optional)"
        rows={3}
        value={values.message}
        onChange={handleChange}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-gold-400 px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-gold-400/20 transition-all hover:bg-gold-300 disabled:opacity-60"
      >
        <Send className="h-4 w-4" strokeWidth={2} />
        {status === "submitting" ? "Saving..." : "Save Details"}
      </button>

      {status === "error" && (
        <p className="text-center text-xs text-red-300">Something went wrong — please try again.</p>
      )}
    </form>
  );
}
