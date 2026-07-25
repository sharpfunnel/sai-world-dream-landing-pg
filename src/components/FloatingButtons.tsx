"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle, Phone, Send } from "lucide-react";
import { CONTACT } from "@/data/project";

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop floating stack */}
      <div className="fixed right-5 bottom-6 z-40 hidden flex-col gap-3 lg:flex">
        {showTop && (
          <a
            href="#top"
            aria-label="Back to top"
            className="flex h-12 w-12 animate-pop-in items-center justify-center rounded-full bg-navy-950 text-white shadow-lg shadow-navy-950/25 transition-transform hover:scale-105"
          >
            <ArrowUp className="h-5 w-5" />
          </a>
        )}
        <a
          href="#contact-form"
          aria-label="Enquire now"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400 text-navy-950 shadow-lg shadow-gold-400/30 transition-transform hover:scale-105"
        >
          <Send className="h-5 w-5" />
        </a>
        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp us"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
        <a
          href={CONTACT.phoneHref}
          aria-label="Call us"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg shadow-navy-950/25 transition-transform hover:scale-105"
        >
          <Phone className="h-5 w-5" />
        </a>
      </div>

      {/* Mobile sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-white/10 bg-navy-950 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <a
          href={CONTACT.phoneHref}
          className="flex flex-col items-center justify-center gap-1 py-3 text-white active:bg-white/10"
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs font-medium">Call</span>
        </a>
        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 border-x border-white/10 bg-emerald-600 py-3 text-white active:bg-emerald-700"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs font-medium">WhatsApp</span>
        </a>
        <a
          href="#contact-form"
          className="flex flex-col items-center justify-center gap-1 bg-gold-400 py-3 text-navy-950 active:bg-gold-300"
        >
          <Send className="h-5 w-5" />
          <span className="text-xs font-medium">Enquire</span>
        </a>
      </div>
    </>
  );
}
