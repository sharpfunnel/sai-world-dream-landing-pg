"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, Menu, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { CONTACT, SITE, DEVELOPER } from "@/data/project";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-navy-950/10 transition-colors duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/10"
          : "bg-white"
      }`}
    >
      <Container className="flex items-center justify-between py-3.5">
        <a href="#top" className="flex flex-col">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-lg sm:text-2xl font-semibold text-navy-950">
              {SITE.projectName}
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-gold-600">
              {SITE.location}
            </span>
          </span>
          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-navy-950/45">
            by {DEVELOPER.brand} &middot; {SITE.tagline}
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={CONTACT.phoneHref}
            data-cta="header-call"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950/85 hover:text-gold-600 transition-colors"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            {CONTACT.phoneDisplay}
          </a>
          <Button href="#contact-form" size="md" variant="primary" data-cta="header-book-site-visit">
            Book Site Visit
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="lg:hidden text-navy-950 p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-navy-950/10 bg-white">
          <Container className="flex flex-col gap-1 py-4">
            <div className="mt-2 flex gap-3 px-3">
              <Button href={CONTACT.phoneHref} icon={Phone} variant="ghost" className="flex-1" data-cta="header-mobile-call">
                Call Now
              </Button>
              <Button href={CONTACT.whatsappHref} icon={MessageCircle} variant="primary" className="flex-1" data-cta="header-mobile-whatsapp">
                WhatsApp
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
