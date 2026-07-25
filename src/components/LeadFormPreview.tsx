import { ChevronDown, Send } from "lucide-react";

export default function LeadFormPreview({
  title = "Book Your Free Site Visit",
  subtitle = "Fill in your details — our team will call you back within 30 minutes.",
  target = "#contact-form",
}: {
  title?: string;
  subtitle?: string;
  target?: string;
}) {
  const fieldClass =
    "w-full rounded-md bg-white/95 border border-white/10 px-4 py-3 text-sm text-navy-700/50";

  return (
    <a
      href={target}
      data-cta="hero-lead-preview"
      aria-label={`${title} — go to enquiry form`}
      className="group relative flex cursor-pointer flex-col gap-4 rounded-md border border-white/15 bg-white/10 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:p-7"
    >
      <div>
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/65">{subtitle}</p>
      </div>

      <div className={fieldClass}>Full Name*</div>
      <div className={fieldClass}>Mobile Number*</div>
      <div className={fieldClass}>Email (optional)</div>
      <div className={`${fieldClass} flex items-center justify-between`}>
        <span>Configuration Interested*</span>
        <ChevronDown className="h-4 w-4 text-navy-700/40" />
      </div>

      <span className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-gold-400 px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-lg shadow-gold-400/20 transition-colors group-hover:bg-gold-300">
        <Send className="h-4 w-4" strokeWidth={2} />
        Submit Enquiry
      </span>

      <p className="text-center text-xs text-white/50">100% free &amp; confidential · No spam, ever.</p>

      <div className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-gold-300/0 transition-all duration-300 group-hover:ring-gold-300/60" />
    </a>
  );
}
