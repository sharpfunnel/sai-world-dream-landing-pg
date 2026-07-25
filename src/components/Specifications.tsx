import { BadgeCheck, Building2, LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/Icon";
import Reveal from "@/components/ui/Reveal";
import { APARTMENT_SPECIFICATIONS, STOCK_IMAGES, TOWER_FEATURES } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

const SPEC_ICONS: Record<string, string> = {
  "Big Size Vitrified Tiles in Living, Dining & Passage Area": "LayoutGrid",
  "Vitrified Tiles in Kitchen and Common Bedroom": "LayoutGrid",
  "European Wooden Flooring in Master Bedroom": "LayoutGrid",
  "Marble & Granite Window Sill": "LayoutGrid",
  "Granite Kitchen Platform with Service Platform": "ChefHat",
  "4 / 3 Burner Gas Hob with Exhaust Chimney": "ChefHat",
  "Water Purifier & Geyser for Hot Water at Kitchen Sink": "ChefHat",
  "Exhaust Fan in Kitchen Window": "ChefHat",
  "Shower Panel in Master Bedrooms": "Droplet",
  "Branded Geyser in Bathrooms": "Droplet",
  "Designer Bathroom with Branded Sanitary Ware & Fixtures": "Droplet",
  "Concealed Plumbing with Premium Quality C.P. Fittings": "Droplet",
  "TV, Telephone & Internet Points in All Rooms": "Wifi",
  "Branded Concealed Copper Wiring with MCB / ELCB": "Zap",
  "Ample Electrical Points & Modular Switches": "Zap",
  "Video Door Security System in Each Flat with Cameras": "ShieldCheck",
  "Attractive Main Door with Elegant Handles & Night Latch": "DoorClosed",
  "Premium Quality Plastic Paints on Interior Walls": "PaintRoller",
  "Gypsum Finished Internal Walls": "PaintRoller",
};

const TOWER_ICONS: Record<string, string> = {
  "Double-height Entrance Lobbies": "Building2",
  "Air-conditioned Lounge & Art Gallery": "Palette",
  "24x7 Security & CCTV Surveillance": "ShieldCheck",
  "Designer Floor Lobbies": "LayoutGrid",
  "High-speed Lifts & Generator Backup": "Zap",
  "Intercom System": "Phone",
  "Shopping Centre with Famous Brand Stores": "ShoppingBag",
};

function SpecPanel({
  eyebrow,
  title,
  headingIcon: HeadingIcon,
  image,
  items,
  icons,
}: {
  eyebrow: string;
  title: string;
  headingIcon: LucideIcon;
  image: string;
  items: string[];
  icons: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-950">
        <HeadingIcon className="h-5 w-5 text-gold-600" strokeWidth={1.75} />
        {title}
      </h3>
      <div className="grid overflow-hidden rounded-3xl border border-navy-950/8 lg:grid-cols-[0.85fr_1.7fr]">
        <div className="relative hidden min-h-[16rem] lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={unsplashUrl(image, { w: 800 })}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent" />
          <span className="absolute bottom-5 left-5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            {eyebrow}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 bg-navy-950/[0.02] p-6 sm:grid-cols-2 sm:p-10">
          {items.map((item, idx) => (
            <Reveal
              key={item}
              variant="fade"
              delay={Math.min(idx * 30, 300)}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/12 text-gold-600">
                <Icon name={icons[item] || "BadgeCheck"} className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-medium leading-snug text-navy-900">{item}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Specifications() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Project Specifications"
          title="Luxury Finishes, Thoughtfully Detailed"
        />

        <SpecPanel
          eyebrow="Interior Finishes"
          title="Luxury Apartment Specifications"
          headingIcon={BadgeCheck}
          image={STOCK_IMAGES.marbleLobby}
          items={APARTMENT_SPECIFICATIONS}
          icons={SPEC_ICONS}
        />

        <SpecPanel
          eyebrow="Tower Amenities"
          title="Extraordinary Tower Features"
          headingIcon={Building2}
          image={STOCK_IMAGES.hotelLobby}
          items={TOWER_FEATURES}
          icons={TOWER_ICONS}
        />
      </Container>
    </section>
  );
}
