import { Check } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import GoldFrame from "@/components/ui/GoldFrame";
import { AMENITIES } from "@/data/project";

export default function Amenities() {
  return (
    <section id="amenities" className="bg-navy-950 py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Amenities"
          title="40+ Lifestyle Amenities, Zero Compromises"
          description="From fitness and leisure to entertainment and an exclusive clubhouse — every amenity is designed around how modern families actually live."
          light
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {AMENITIES.map((group) => (
            <GoldFrame key={group.category} tone="dark">
              <div className="flex flex-col gap-6 p-7 sm:p-8">
                <div className="flex items-center gap-4">
                  <IconBadge icon={group.icon} size="lg" tone="dark" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-300">
                      {group.world}
                    </p>
                    <h3 className="text-xl font-semibold text-white">{group.category}</h3>
                  </div>
                </div>

                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/75">
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold-400">
                        <Check className="h-2.5 w-2.5 text-navy-950" strokeWidth={3} />
                      </span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GoldFrame>
          ))}
        </div>
      </Container>
    </section>
  );
}
