import { Phone, MessageCircle, Download } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon from "@/components/Icon";
import LeadForm from "@/components/LeadForm";
import GoldFrame from "@/components/ui/GoldFrame";
import { CONTACT, DEVELOPER, HERO, HIGHLIGHT_CARDS, STOCK_IMAGES } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={unsplashUrl(STOCK_IMAGES.skylineDusk, { w: 2000 })}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/40" />

      <Container className="relative grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="flex flex-col gap-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-gold-300/30 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-gold-300">
            18-Acre Integrated Township · Dombivli
          </span>

          <p className="-mb-3 text-sm font-medium text-white/60">
            A Development by <span className="font-semibold text-white/85">{DEVELOPER.brand}</span> ·{" "}
            {DEVELOPER.experienceYears} Years of Legacy &amp; Trust
          </p>

          <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.2rem]">
            {HERO.heading}
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-white/70">
            {HERO.subheading}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {HIGHLIGHT_CARDS.map((card) => (
              <GoldFrame key={card.label} tone="dark" className="bg-navy-900/60 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 px-3.5 py-3">
                  <Icon name={card.icon} className="h-4 w-4 shrink-0 text-gold-300" />
                  <span className="text-xs font-medium leading-snug text-white/85 sm:text-sm">
                    {card.label}
                  </span>
                </div>
              </GoldFrame>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button href="#lead-form" variant="primary" size="lg">
              Book Free Site Visit
            </Button>
            <Button href="#pricing" variant="outline" size="lg" icon={Download}>
              Download Brochure
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-1">
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-gold-300"
            >
              <Phone className="h-4 w-4" /> {CONTACT.phoneDisplay}
            </a>
            <a
              href={CONTACT.whatsappHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-gold-300"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Now
            </a>
          </div>
        </div>

        <div className="lg:justify-self-end lg:w-full lg:max-w-md">
          <LeadForm
            title="Book Your Free Site Visit"
            subtitle="Fill in your details — our team will call you back within 30 minutes."
          />
        </div>
      </Container>
    </section>
  );
}
