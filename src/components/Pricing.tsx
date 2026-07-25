import { FileText, Ruler } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import GoldFrame from "@/components/ui/GoldFrame";
import { FLOOR_PLAN_TABS, FLOOR_WISE_COST_SHEET, PRICING } from "@/data/project";

function rangeText(min, max, suffix) {
  return min === max ? `${min} ${suffix}` : `${min} – ${max} ${suffix}`;
}

const PRICING_GROUPS = FLOOR_PLAN_TABS.map((config) => {
  const units = PRICING.filter((u) => u.config === config);
  const carpets = units.map((u) => u.carpet);
  const saleables = units.map((u) => u.saleable);

  return {
    config,
    carpetRange: rangeText(Math.min(...carpets), Math.max(...carpets), "sq.ft Carpet"),
    saleableRange: rangeText(Math.min(...saleables), Math.max(...saleables), "sq.ft Saleable"),
    priceStart: units[0].price,
    priceEnd: units[units.length - 1].price,
  };
});

export default function Pricing() {
  return (
    <section id="pricing" className="bg-navy-950/[0.02] py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Configurations & Pricing"
          title="Homes Designed for Every Milestone"
          description="Transparent carpet & saleable areas across 1, 2, 2.5 and 3 BHK homes. Prices are indicative — request the latest price sheet for current availability."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_GROUPS.map((group) => (
            <GoldFrame
              key={group.config}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-950/10"
            >
              <div className="flex h-full flex-col gap-4 rounded-[15px] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-navy-950">{group.config}</span>
                  <span className="text-gold-foil text-xs font-bold uppercase tracking-[0.15em]">
                    Premium
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-sm text-navy-700/75">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 shrink-0 text-gold-600" />
                    <span>{group.carpetRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 shrink-0 text-gold-600" />
                    <span>{group.saleableRange}</span>
                  </div>
                </div>

                <div className="rule-gold" />

                <div>
                  <p className="text-xs uppercase tracking-wide text-navy-700/60">Starting From</p>
                  <p className="text-2xl font-bold text-navy-950">
                    {group.priceStart}
                    {group.priceEnd !== group.priceStart && (
                      <span className="text-lg font-semibold text-navy-700/60"> to {group.priceEnd}</span>
                    )}
                  </p>
                </div>

                <Button href="#lead-form" variant="ghost" size="md" className="mt-1 w-full">
                  Enquire Now
                </Button>
              </div>
            </GoldFrame>
          ))}
        </div>

        <GoldFrame className="shadow-sm">
          <div className="flex flex-col gap-5 rounded-[15px] p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-xl font-semibold text-navy-950">
                Sample Floor-wise Cost Sheet — Tower {FLOOR_WISE_COST_SHEET.tower}
              </h3>
              <p className="text-sm text-navy-700/70">
                W.E.F. {FLOOR_WISE_COST_SHEET.effectiveDate} · G+35 Storey · Exclusive 1, 2 &amp; 2.5 BHK.
                Other towers are priced separately — request the current sheet for your preferred tower.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gold-400/30 text-left text-xs uppercase tracking-wide text-navy-700/60">
                    <th className="py-2 pr-4 font-semibold">Type</th>
                    <th className="py-2 pr-4 font-semibold">Saleable / Exclusive</th>
                    {FLOOR_WISE_COST_SHEET.floorBands.map((band) => (
                      <th key={band} className="py-2 pr-4 font-semibold">
                        {band}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FLOOR_WISE_COST_SHEET.rows.map((row) => (
                    <tr key={row.config} className="border-b border-navy-950/5 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-navy-950">{row.config}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-navy-700/70">
                        {row.saleable} / {row.exclusive} sq.ft
                      </td>
                      {row.prices.map((price, idx) => (
                        <td key={idx} className="py-3 pr-4 whitespace-nowrap font-medium text-navy-900">
                          {price}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-1 text-xs text-navy-700/60">
              {FLOOR_WISE_COST_SHEET.notes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        </GoldFrame>

        <div className="flex justify-center">
          <Button href="#lead-form" variant="dark" size="lg" icon={FileText}>
            Get Latest Price Sheet
          </Button>
        </div>
      </Container>
    </section>
  );
}
