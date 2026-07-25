import { MapPinned } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import GoldFrame from "@/components/ui/GoldFrame";
import { STOCK_IMAGES, TOWERS } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

const ZONES = [
  { label: "La Dreams Podium & Clubhouse", span: "col-span-1 row-span-1" },
  { label: "World Dreams Plaza (Retail)", span: "col-span-1 row-span-1" },
  { label: "World Dreams Business Park", span: "col-span-1 row-span-1" },
  { label: "World Dreams Hotel", span: "col-span-1 row-span-1" },
  { label: "High Street Boulevard", span: "col-span-2 row-span-1" },
];

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

        <div className="flex w-full max-w-4xl flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TOWERS.map((tower) => (
              <GoldFrame key={tower} tone="dark" className="min-h-[70px] overflow-hidden bg-navy-900/70">
                <div className="flex h-full flex-col items-center justify-center gap-1 p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300/70">
                    Tower
                  </span>
                  <span className="text-base font-bold text-white">{tower}</span>
                </div>
              </GoldFrame>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {ZONES.map((zone) => (
              <GoldFrame
                key={zone.label}
                tone="dark"
                className={`${zone.span} min-h-[90px] overflow-hidden bg-navy-900/70`}
              >
                <div className="flex h-full items-center justify-center p-4 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gold-200 sm:text-sm">
                    {zone.label}
                  </span>
                </div>
              </GoldFrame>
            ))}
          </div>
        </div>

        <Button href="#lead-form" variant="primary" size="lg" icon={MapPinned}>
          Request Master Plan
        </Button>
      </Container>
    </section>
  );
}
