import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GoldFrame from "@/components/ui/GoldFrame";
import IconBadge from "@/components/ui/IconBadge";
import Reveal from "@/components/ui/Reveal";

import { INFRASTRUCTURE, STOCK_IMAGES } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

export default function WhyInvest() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Why Invest in Dombivli?"
          title="Riding the Next Wave of Infrastructure Growth"
          description="Dombivli is fast becoming one of MMR's most connected micro-markets, backed by a pipeline of transformational infrastructure projects linking it seamlessly to Mumbai and Navi Mumbai."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-10">
          <Reveal
            variant="left"
            className="relative h-72 overflow-hidden rounded-3xl sm:h-96 lg:h-136"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={unsplashUrl(STOCK_IMAGES.skylineDusk, { w: 1000 })}
              alt="Dombivli's evolving skyline"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-display text-4xl font-bold text-white sm:text-5xl">
                {INFRASTRUCTURE.length}+
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-white/75 sm:text-base">
                Transformational Infrastructure Projects Reshaping Dombivli
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {INFRASTRUCTURE.map((item, idx) => (
              <Reveal key={item.label} delay={Math.min(idx * 60, 360)}>
                <GoldFrame className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-950/10">
                  <div className="flex flex-col items-center gap-3 p-5 text-center">
                    <IconBadge icon={item.icon} size="lg" />
                    <span className="text-sm font-medium leading-snug text-navy-900">{item.label}</span>
                  </div>
                </GoldFrame>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
