import { Building2, MapPinned, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import GoldFrame from "@/components/ui/GoldFrame";
import Icon from "@/components/Icon";
import Reveal from "@/components/ui/Reveal";
import { STOCK_IMAGES, TOWERS } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

const ZONES = [
  { label: "La Dreams Podium & Clubhouse", icon: "Gem" },
  { label: "World Dreams Plaza (Retail)", icon: "Store" },
  { label: "World Dreams Business Park", icon: "Briefcase" },
  { label: "World Dreams Hotel", icon: "BedDouble" },
  { label: "High Street Boulevard", icon: "ShoppingBag" },
];

const TOWER_HALF = Math.ceil(TOWERS.length / 2);
const TOWER_COLUMNS = [TOWERS.slice(0, TOWER_HALF), TOWERS.slice(TOWER_HALF)];

export default function MasterPlan() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-28">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={unsplashUrl(STOCK_IMAGES.skylineDusk, { w: 1600 })}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-navy-950/85" />

      <Container className="relative flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow="Master Plan"
          title="A Thoughtfully Zoned 18-Acre Township"
          description="Residences, retail, business and recreation — planned together so everything you need is within walking distance."
          light
        />

        <Reveal delay={120} className="w-full max-w-5xl">
        <GoldFrame tone="dark" className="overflow-hidden bg-navy-900/40 backdrop-blur-sm">
          <div className="grid grid-cols-1 divide-y divide-white/10 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <div className="flex h-full flex-col p-8 sm:p-10">
              <h3 className="mb-2 flex items-center gap-2.5 font-display text-lg font-semibold text-white">
                <Building2 className="h-5 w-5 text-gold-300" strokeWidth={1.75} />
                Residential Towers
              </h3>
              <div className="grid grid-cols-2 gap-x-6">
                {TOWER_COLUMNS.map((col, colIdx) => (
                  <div key={colIdx} className="divide-y divide-white/5">
                    {col.map((tower, i) => {
                      const idx = colIdx * TOWER_HALF + i;
                      return (
                        <Reveal
                          key={tower}
                          delay={Math.min(idx * 50, 300)}
                          className="flex items-center gap-3 py-3.5"
                        >
                          <span className="w-7 shrink-0 font-display text-sm tabular-nums text-gold-300/50">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 truncate text-base font-medium text-white/90">
                            {tower}
                          </span>
                        </Reveal>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="mt-auto flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-gold-300/60">
                8 Towers · G+35 Storeys Each
              </p>
            </div>

            <div className="flex h-full flex-col p-8 sm:p-10">
              <h3 className="mb-2 flex items-center gap-2.5 font-display text-lg font-semibold text-white">
                <Sparkles className="h-5 w-5 text-gold-300" strokeWidth={1.75} />
                Lifestyle &amp; Commercial Zones
              </h3>
              <div className="divide-y divide-white/5">
                {ZONES.map((zone, i) => (
                  <Reveal
                    key={zone.label}
                    delay={Math.min(i * 50, 300)}
                    className="group flex items-center gap-4 py-3.5"
                  >
                    <span className="flex w-8 shrink-0 items-center justify-center">
                      <Icon
                        name={zone.icon}
                        className="h-5 w-5 text-gold-300/70 transition-colors group-hover:text-gold-300"
                      />
                    </span>
                    <span className="flex-1 text-base font-medium text-white/90 transition-colors group-hover:text-gold-200">
                      {zone.label}
                    </span>
                  </Reveal>
                ))}
              </div>
              <p className="mt-auto flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-gold-300/60">
                5 Zones · Retail, Business, Hospitality &amp; Leisure
              </p>
            </div>
          </div>
        </GoldFrame>
        </Reveal>

        <Button href="#contact-form" variant="primary" size="lg" icon={MapPinned}>
          Request Master Plan
        </Button>
      </Container>
    </section>
  );
}
