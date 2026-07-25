"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { CONFIG_OPTIONS } from "@/data/project";
import { buildEnquiryWhatsAppLink } from "@/lib/utils";

export default function LeadForm({
  id = "lead-form",
  variant = "card",
  title = "Get Callback in 30 Minutes",
  subtitle = "Share your details and our team will reach out shortly.",
  showExtras = false,
}: {
  id?: string;
  variant?: "card" | "light";
  title?: string;
  subtitle?: string;
  showExtras?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    config: "",
    budget: "",
    message: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const link = buildEnquiryWhatsAppLink(values);
    setSubmitted(true);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const isDark = variant === "card";
  const inputClass = isDark
    ? "w-full rounded-md bg-white/95 border border-white/10 px-4 py-3 text-sm text-navy-950 placeholder:text-navy-700/50 focus:outline-none focus:ring-2 focus:ring-gold-400"
    : "w-full rounded-md bg-navy-950/5 border border-navy-950/10 px-4 py-3 text-sm text-navy-950 placeholder:text-navy-700/50 focus:outline-none focus:ring-2 focus:ring-gold-400";

  if (submitted) {
    return (
      <div
        id={id}
        className={`flex animate-scale-in flex-col items-center justify-center gap-3 rounded-md p-8 text-center ${
          isDark ? "bg-white/10 border border-white/15" : "bg-navy-950/5 border border-navy-950/10"
        }`}
      >
        <CheckCircle2 className={`h-10 w-10 ${isDark ? "text-gold-300" : "text-gold-600"}`} />
        <h3 className={`font-display text-xl font-semibold ${isDark ? "text-white" : "text-navy-950"}`}>
          Thank You!
        </h3>
        <p className={`text-sm ${isDark ? "text-white/70" : "text-navy-700/80"}`}>
          Your enquiry has been sent over WhatsApp. Our team will contact you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className={`text-sm font-semibold underline underline-offset-4 ${
            isDark ? "text-gold-300" : "text-gold-600"
          }`}
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 rounded-md p-6 sm:p-7 ${
        isDark
          ? "bg-white/10 border border-white/15 backdrop-blur-md"
          : "bg-white border border-navy-950/10 shadow-xl shadow-navy-950/5"
      }`}
    >
      <div>
        <h3 className={`font-display text-xl font-semibold ${isDark ? "text-white" : "text-navy-950"}`}>
          {title}
        </h3>
        <p className={`mt-1 text-sm ${isDark ? "text-white/65" : "text-navy-700/70"}`}>{subtitle}</p>
      </div>

      <input
        type="text"
        name="name"
        required
        placeholder="Full Name*"
        value={values.name}
        onChange={handleChange}
        className={inputClass}
      />
      <input
        type="tel"
        name="phone"
        required
        pattern="[0-9+\s]{7,15}"
        placeholder="Mobile Number*"
        value={values.phone}
        onChange={handleChange}
        className={inputClass}
      />
      <input
        type="email"
        name="email"
        placeholder="Email (optional)"
        value={values.email}
        onChange={handleChange}
        className={inputClass}
      />
      <select
        name="config"
        required
        value={values.config}
        onChange={handleChange}
        className={inputClass}
      >
        <option value="" disabled>
          Configuration Interested*
        </option>
        {CONFIG_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {showExtras && (
        <>
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
        </>
      )}

      <button
        type="submit"
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-gold-400 px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-gold-400/20 transition-all hover:bg-gold-300"
      >
        <Send className="h-4 w-4" strokeWidth={2} />
        Submit Enquiry
      </button>

      <p className={`text-center text-xs ${isDark ? "text-white/50" : "text-navy-700/50"}`}>
        100% free &amp; confidential · No spam, ever.
      </p>
    </form>
  );
}
