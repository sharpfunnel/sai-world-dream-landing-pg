import { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
}) {
  const isCenter = align !== "left";
  const alignClass = isCenter ? "text-center items-center" : "text-left items-start";

  return (
    <Reveal className={`flex flex-col ${alignClass} gap-4 max-w-3xl ${isCenter ? "mx-auto" : ""}`}>
      {eyebrow && (
        <span
          className={`text-xs font-bold tracking-[0.18em] uppercase ${
            light ? "text-gold-300" : "text-gold-600"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-balance text-3xl sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.15] tracking-tight ${
          light ? "text-white" : "text-navy-950"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`text-base sm:text-lg leading-relaxed ${light ? "text-white/70" : "text-navy-700/80"}`}>
          {description}
        </p>
      )}
    </Reveal>
  );
}
