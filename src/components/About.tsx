import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/ui/Container";
import Icon from "@/components/Icon";
import Reveal from "@/components/ui/Reveal";
import { ABOUT, PROJECT_HIGHLIGHTS } from "@/data/project";

const HALF = Math.ceil(PROJECT_HIGHLIGHTS.length / 2);
const COLUMNS = [PROJECT_HIGHLIGHTS.slice(0, HALF), PROJECT_HIGHLIGHTS.slice(HALF)];

export default function About() {
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="About The Project"
          title={ABOUT.title}
          description={ABOUT.paragraphs.join(" ")}
        />

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 sm:gap-x-16">
          {COLUMNS.map((column, colIdx) => (
            <div
              key={colIdx}
              className="divide-y divide-navy-950/8 border-t border-navy-950/8"
            >
              {column.map((item, rowIdx) => (
                <Reveal
                  key={item.label}
                  delay={Math.min(rowIdx * 60, 300)}
                  className="group flex items-center gap-4 py-5"
                >
                  <span className="w-6 shrink-0 font-display text-xs font-semibold tabular-nums text-gold-600/70">
                    {String(colIdx * HALF + rowIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600 transition-colors duration-300 group-hover:bg-gold-400/15">
                    <Icon name={item.icon} className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-navy-900 transition-colors duration-300 group-hover:text-gold-700">
                    {item.label}
                  </span>
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
