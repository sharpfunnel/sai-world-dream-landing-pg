import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import IconBadge from "@/components/ui/IconBadge";
import { LIFESTYLE } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

export default function Lifestyle() {
  return (
    <section className="bg-navy-950 py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading eyebrow="Lifestyle" title="One Address, Every Convenience" light />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LIFESTYLE.map((item) => (
            <div
              key={item.title}
              className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-xl border border-white/10 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={unsplashUrl(item.image, { w: 700 })}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-navy-950/10" />

              <span className="absolute top-5 right-5">
                <IconBadge icon={item.icon} size="lg" tone="dark" className="bg-navy-950/70" />
              </span>
              <div className="relative p-6">
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-sm font-medium text-gold-200">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/40">Images are for representational purposes only.</p>
      </Container>
    </section>
  );
}
