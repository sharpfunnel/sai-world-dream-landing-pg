import { GraduationCap, HeartPulse, MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { CONNECTIVITY, HOSPITALS, SCHOOLS, SITE } from "@/data/project";

export default function LocationAdvantages() {
  const mapQuery = encodeURIComponent(SITE.siteAddress);

  return (
    <section id="location" className="bg-navy-950/[0.02] py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Location Advantages"
          title="Perfectly Placed on Kalyan Shil Road"
          description="Seamless access to arterial roads, upcoming metro lines and everyday essentials — all within minutes."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <Reveal
            variant="left"
            className="overflow-hidden rounded-2xl border border-navy-950/10 shadow-sm"
          >
            <iframe
              title="Sai World Dreams location map"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-64 w-full sm:h-full sm:min-h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal variant="right" className="rounded-2xl border border-navy-950/8 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-navy-950">
                <MapPin className="h-5 w-5 text-gold-600" /> Connectivity
              </h3>
              <ul className="flex flex-col divide-y divide-navy-950/8">
                {CONNECTIVITY.map((item) => (
                  <li key={item.place} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-navy-700/80">{item.place}</span>
                    <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-semibold text-gold-700">
                      {item.time}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Reveal variant="right" delay={80} className="rounded-2xl border border-navy-950/8 bg-white p-6 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-navy-950">
                  <GraduationCap className="h-5 w-5 text-gold-600" /> Schools
                </h3>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {SCHOOLS.map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-3 text-navy-700/80">
                      <span>{s.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-gold-700">{s.time}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal variant="right" delay={160} className="rounded-2xl border border-navy-950/8 bg-white p-6 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-navy-950">
                  <HeartPulse className="h-5 w-5 text-gold-600" /> Hospitals
                </h3>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {HOSPITALS.map((h) => (
                    <li key={h.name} className="flex items-center justify-between gap-3 text-navy-700/80">
                      <span>{h.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-gold-700">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button href="#contact-form" variant="dark" size="lg">
            Schedule Site Visit
          </Button>
        </div>
      </Container>
    </section>
  );
}
