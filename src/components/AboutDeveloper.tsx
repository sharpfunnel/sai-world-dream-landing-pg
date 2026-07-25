import { Landmark } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { CONSULTANTS, DEVELOPER } from "@/data/project";

export default function AboutDeveloper() {
  return (
    <section className="bg-navy-950/[0.02] py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="The Developer"
          title={`By ${DEVELOPER.fullName}`}
          description={`${DEVELOPER.isoCertified} · "${DEVELOPER.brandTagline}" · ${DEVELOPER.experienceYears} years of building homes across Navi Mumbai & Mumbai.`}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {DEVELOPER.stats.map((stat, idx) => (
            <Reveal
              key={stat.label}
              variant="scale"
              delay={idx * 80}
              className="flex flex-col items-center gap-1 rounded-2xl border border-navy-950/8 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="font-display text-3xl font-semibold text-navy-950">{stat.value}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-navy-700/60">
                {stat.label}
              </span>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-navy-700/60">
            Present Across
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {DEVELOPER.presence.map((city, idx) => (
              <Reveal
                as="span"
                key={city}
                variant="fade"
                delay={idx * 40}
                className="rounded-full border border-navy-950/10 bg-white px-4 py-1.5 text-sm font-medium text-navy-800"
              >
                {city}
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CONSULTANTS.map((c, idx) => (
            <Reveal
              key={c.role}
              delay={idx * 50}
              className="flex flex-col gap-1 rounded-xl border border-navy-950/8 bg-white p-4"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gold-700">
                {c.role}
              </span>
              <span className="text-sm font-medium text-navy-900">{c.name}</span>
            </Reveal>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-navy-700/70">
          <Landmark className="h-4 w-4 text-gold-600" />
          Project Financed By <span className="font-semibold text-navy-950">{DEVELOPER.projectFinancedBy}</span>
        </div>
      </Container>
    </section>
  );
}
