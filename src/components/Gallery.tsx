"use client";

import { useState } from "react";
import { Expand, X } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { GALLERY_CATEGORIES } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

const HEIGHTS = ["h-52", "h-64", "h-44", "h-72", "h-56", "h-60"];

export default function Gallery() {
  const [active, setActive] = useState(null);

  return (
    <section id="gallery" className="bg-white py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Gallery"
          title="A Glimpse Into Your Future Home"
          description="Images shown are representational stock visuals — visit us on-site to experience Sai World Dreams first-hand."
        />

        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [column-fill:_balance]">
          {GALLERY_CATEGORIES.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActive(item)}
              className={`group relative mb-4 flex w-full ${HEIGHTS[idx % HEIGHTS.length]} break-inside-avoid items-end overflow-hidden rounded-xl border border-navy-950/8 text-left transition-transform hover:-translate-y-1`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={unsplashUrl(item.image, { w: 500 })}
                alt={item.label}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
              <span className="relative z-10 p-4 text-sm font-semibold text-white">{item.label}</span>
              <span className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <Expand className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-navy-700/50">
          Images are for representational purposes only.
        </p>
      </Container>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/90 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={unsplashUrl(active.image, { w: 1400 })}
              alt={active.label}
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              aria-label="Close gallery preview"
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy-950/70 text-white hover:bg-navy-950"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-5">
              <span className="text-xl font-semibold text-white">{active.label}</span>
              <p className="mt-1 text-sm text-white/60">Representational image</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
