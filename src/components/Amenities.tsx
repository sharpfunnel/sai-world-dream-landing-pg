import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import GoldFrame from "@/components/ui/GoldFrame";
import Reveal from "@/components/ui/Reveal";
import { AMENITIES } from "@/data/project";

export default function Amenities() {
  return (
    <section id="amenities" className="bg-navy-950 py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Amenities"
          title="61+ Lifestyle Amenities, Zero Compromises"
          description="From fitness and leisure to entertainment and an exclusive clubhouse — every amenity is designed around how modern families actually live."
          light
        />

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
          {AMENITIES.map((group, groupIdx) => {
            const half = Math.ceil(group.items.length / 2);
            const itemColumns = [group.items.slice(0, half), group.items.slice(half)];

            return (
              <Reveal key={group.category} delay={groupIdx * 120} className="h-full">
                <GoldFrame
                  tone="dark"
                  className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
                >
                  <div className="flex h-full flex-col gap-6 p-7 sm:p-8">
                    <div className="flex items-center gap-4">
                      <IconBadge icon={group.icon} size="lg" tone="dark" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gold-300">
                          {group.world}
                        </p>
                        <h3 className="text-xl font-semibold text-white">{group.category}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                      {itemColumns.map((column, colIdx) => (
                        <ul key={colIdx} className="flex flex-col gap-3">
                          {column.map((item, itemIdx) => {
                            const idx = colIdx * half + itemIdx;
                            return (
                              <Reveal
                                as="li"
                                key={item}
                                variant="fade"
                                delay={groupIdx * 120 + Math.min(idx * 30, 240)}
                                className="flex items-start gap-3 text-sm text-white/75"
                              >
                                <span className="mt-2 h-0.75 w-0.75 shrink-0 rotate-45 bg-gold-400" />
                                <span className="leading-snug">{item}</span>
                              </Reveal>
                            );
                          })}
                        </ul>
                      ))}
                    </div>
                  </div>
                </GoldFrame>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
