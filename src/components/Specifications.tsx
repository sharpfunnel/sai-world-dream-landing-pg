import { BadgeCheck, Building2 } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { APARTMENT_SPECIFICATIONS, TOWER_FEATURES } from "@/data/project";

export default function Specifications() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Project Specifications"
          title="Luxury Finishes, Thoughtfully Detailed"
        />

        <div className="flex flex-col gap-4">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-950">
            <BadgeCheck className="h-5 w-5 text-gold-600" /> Luxury Apartment Specifications
          </h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-3xl border border-navy-950/8 bg-navy-950/[0.02] p-6 sm:grid-cols-2 sm:p-10 lg:grid-cols-3">
            {APARTMENT_SPECIFICATIONS.map((spec) => (
              <div key={spec} className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 shrink-0 text-gold-600" strokeWidth={1.75} />
                <span className="text-sm font-medium text-navy-900">{spec}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-950">
            <Building2 className="h-5 w-5 text-gold-600" /> Extraordinary Tower Features
          </h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-3xl border border-navy-950/8 bg-navy-950/[0.02] p-6 sm:grid-cols-2 sm:p-10 lg:grid-cols-3">
            {TOWER_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 shrink-0 text-gold-600" strokeWidth={1.75} />
                <span className="text-sm font-medium text-navy-900">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
