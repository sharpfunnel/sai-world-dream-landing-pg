import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/ui/Container";
import IconBadge from "@/components/ui/IconBadge";
import GoldFrame from "@/components/ui/GoldFrame";
import { ABOUT, PROJECT_HIGHLIGHTS } from "@/data/project";

export default function About() {
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="About The Project"
          title={ABOUT.title}
          description={ABOUT.paragraphs.join(" ")}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PROJECT_HIGHLIGHTS.map((item) => (
            <GoldFrame
              key={item.label}
              muted
              className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-950/10"
            >
              <div className="flex h-full flex-col items-start gap-4 rounded-[15px] p-5 transition-colors group-hover:bg-gold-50/40">
                <IconBadge icon={item.icon} />
                <span className="text-sm font-semibold leading-snug text-navy-900">
                  {item.label}
                </span>
              </div>
            </GoldFrame>
          ))}
        </div>
      </Container>
    </section>
  );
}
