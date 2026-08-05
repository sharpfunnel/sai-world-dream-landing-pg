"use client";

import { ChangeEvent, FormEvent, FocusEvent, InvalidEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { submitLead, trackFormEvent } from "@/lib/tracking/client";

export default function LeadForm({
  id = "lead-form",
  variant = "card",
  title = "Get Callback in 30 Minutes",
  subtitle = "Share your details and our team will reach out shortly.",
}: {
  id?: string;
  variant?: "card" | "light";
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    name: "",
    phone: "",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);
  const submittedRef = useRef(false);
  const abandonSentRef = useRef(false);

  useEffect(() => {
    const node = formRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackFormEvent(id, "viewed");
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const flagAbandoned = () => {
      if (startedRef.current && !submittedRef.current && !abandonSentRef.current) {
        abandonSentRef.current = true;
        trackFormEvent(id, "abandoned");
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flagAbandoned();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flagAbandoned);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flagAbandoned);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (e: FocusEvent<HTMLFormElement>) => {
    const target = e.target as unknown as HTMLInputElement;
    if (!target.name) return;
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormEvent(id, "started");
    }
    trackFormEvent(id, "field_focus", target.name);
  };

  const handleBlur = (e: FocusEvent<HTMLFormElement>) => {
    const target = e.target as unknown as HTMLInputElement;
    if (target.name && target.value.trim()) {
      trackFormEvent(id, "field_complete", target.name);
    }
  };

  const handleInvalid = (e: InvalidEvent<HTMLInputElement>) => {
    trackFormEvent(id, "validation_error", e.currentTarget.name, e.currentTarget.validationMessage);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    submittedRef.current = true;
    setSubmitting(true);
    trackFormEvent(id, "submitted");
    submitLead(id, values)
      .then(({ leadId }) => {
        router.push(leadId ? `/thank-you?leadId=${leadId}` : "/thank-you");
      })
      .catch(() => {
        router.push("/thank-you");
      });
  };

  const isDark = variant === "card";
  const inputClass = isDark
    ? "w-full rounded-md bg-white/95 border border-white/10 px-4 py-3 text-sm text-navy-950 placeholder:text-navy-700/50 focus:outline-none focus:ring-2 focus:ring-gold-400"
    : "w-full rounded-md bg-navy-950/5 border border-navy-950/10 px-4 py-3 text-sm text-navy-950 placeholder:text-navy-700/50 focus:outline-none focus:ring-2 focus:ring-gold-400";

  return (
    <form
      id={id}
      ref={formRef}
      onSubmit={handleSubmit}
      onFocus={handleFocus}
      onBlur={handleBlur}
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
        onInvalid={handleInvalid}
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
        onInvalid={handleInvalid}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-gold-400 px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-gold-400/20 transition-all hover:bg-gold-300 disabled:opacity-60"
      >
        <Send className="h-4 w-4" strokeWidth={2} />
        {submitting ? "Submitting..." : "Submit Enquiry"}
      </button>

      <p className={`text-center text-xs ${isDark ? "text-white/50" : "text-navy-700/50"}`}>
        100% free &amp; confidential · No spam, ever.
      </p>
    </form>
  );
}
