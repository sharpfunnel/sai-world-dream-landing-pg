"use client";

import { useState } from "react";
import { Download, LayoutGrid } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import GoldFrame from "@/components/ui/GoldFrame";
import { FLOOR_PLAN_TABS, PRICING } from "@/data/project";

export default function FloorPlans() {
  const [active, setActive] = useState(FLOOR_PLAN_TABS[0]);
  const units = PRICING.filter((u) => u.config === active);

  return (
    <section id="floor-plans" className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-10">
        <SectionHeading
          eyebrow="Floor Plans"
          title="Explore Every Configuration"
          description="Select a configuration to view indicative unit details, then download the detailed floor plan."
        />

        <div className="flex flex-wrap justify-center gap-2 rounded-full border border-navy-950/10 bg-navy-950/[0.03] p-1.5">
          {FLOOR_PLAN_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active === tab
                  ? "bg-navy-950 text-gold-300 shadow-md"
                  : "text-navy-700/70 hover:text-navy-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <GoldFrame muted className="w-full max-w-4xl">
          <div className="grid grid-cols-1 items-center gap-8 rounded-[15px] bg-navy-950/[0.02] p-6 sm:p-10 lg:grid-cols-2">
          <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950">
            <div className="pointer-events-none absolute inset-0 bg-stars opacity-40" />
            <div className="relative flex flex-col items-center gap-3 text-gold-200/70">
              <LayoutGrid className="h-12 w-12" strokeWidth={1.25} />
              <span className="text-sm font-medium">{active} Floor Plan Preview</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h3 className="font-display text-2xl font-semibold text-navy-950">{active} Homes</h3>
            <ul className="flex flex-col gap-3">
              {units.map((unit, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <span className="text-navy-700/80">
                    {unit.carpet} sq.ft Carpet · {unit.saleable} sq.ft Saleable
                  </span>
                  <span className="font-semibold text-navy-950">{unit.price}</span>
                </li>
              ))}
            </ul>
            <Button href="#lead-form" variant="primary" size="lg" icon={Download} className="w-fit">
              Download Floor Plan
            </Button>
          </div>
          </div>
        </GoldFrame>
      </Container>
    </section>
  );
}
