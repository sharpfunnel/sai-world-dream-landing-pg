import { TrendingUp } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GoldFrame from "@/components/ui/GoldFrame";

import { INFRASTRUCTURE } from "@/data/project";

export default function WhyInvest() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Why Invest in Dombivli?"
          title="Riding the Next Wave of Infrastructure Growth"
          description="Dombivli is fast becoming one of MMR's most connected micro-markets, backed by a pipeline of transformational infrastructure projects."
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {INFRASTRUCTURE.map((item) => (
            <GoldFrame
              key={item}
              muted
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-950/10"
            >
              <div className="flex flex-col items-center gap-3 rounded-[15px] p-5 text-center">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-950 ring-1 ring-gold-400/50">
                  <TrendingUp className="h-5 w-5 text-gold-300" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-medium leading-snug text-navy-900">{item}</span>
              </div>
            </GoldFrame>
          ))}
        </div>
      </Container>
    </section>
  );
}
