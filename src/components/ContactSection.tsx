import { Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/ui/Reveal";
import { CONTACT, SITE } from "@/data/project";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-navy-950/[0.02] py-20 sm:py-28">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Get In Touch"
            title="Let's Find Your Dream Home"
            description="Reach out for a personalised walkthrough, pricing details, or to schedule your free site visit."
            align="left"
          />

          <div className="flex flex-col gap-4">
            <Reveal
              as="a"
              variant="left"
              href={CONTACT.phoneHref}
              data-cta="contact-call"
              className="flex items-center gap-3 rounded-xl border border-navy-950/8 bg-white p-4 shadow-sm transition-colors hover:border-gold-300/50"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/15 text-gold-700">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-navy-700/60">Call Us</p>
                <p className="text-sm font-semibold text-navy-950">{CONTACT.phoneDisplay}</p>
              </div>
            </Reveal>
            <Reveal
              as="a"
              variant="left"
              delay={70}
              href={`mailto:${CONTACT.email}`}
              data-cta="contact-email"
              className="flex items-center gap-3 rounded-xl border border-navy-950/8 bg-white p-4 shadow-sm transition-colors hover:border-gold-300/50"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/15 text-gold-700">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-navy-700/60">Email Us</p>
                <p className="text-sm font-semibold text-navy-950">{CONTACT.email}</p>
              </div>
            </Reveal>
            <Reveal
              variant="left"
              delay={140}
              className="flex items-center gap-3 rounded-xl border border-navy-950/8 bg-white p-4 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/15 text-gold-700">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-navy-700/60">Site Address</p>
                <p className="text-sm font-semibold text-navy-950">{SITE.siteAddress}</p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal variant="right" delay={100}>
          <LeadForm
            id="contact-form"
            variant="light"
            title="Send Us an Enquiry"
            subtitle="Fill in the form below and our sales team will get back to you shortly."
          />
        </Reveal>
      </Container>
    </section>
  );
}
