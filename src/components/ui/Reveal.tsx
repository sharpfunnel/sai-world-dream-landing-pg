"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { isAdminPreview } from "@/lib/tracking/client";

const VARIANTS: Record<string, { hidden: string; visible: string }> = {
  up: { hidden: "opacity-0 translate-y-6", visible: "opacity-100 translate-y-0" },
  down: { hidden: "opacity-0 -translate-y-6", visible: "opacity-100 translate-y-0" },
  left: { hidden: "opacity-0 translate-x-6", visible: "opacity-100 translate-x-0" },
  right: { hidden: "opacity-0 -translate-x-6", visible: "opacity-100 translate-x-0" },
  fade: { hidden: "opacity-0", visible: "opacity-100" },
  scale: { hidden: "opacity-0 scale-95", visible: "opacity-100 scale-100" },
};

// The page renders dozens of <Reveal> instances (one per animated block). Giving each
// its own `new IntersectionObserver` means dozens of separate observer instances doing
// redundant layout/scroll work during hydration — a real contributor to main-thread
// (TBT) cost on slow devices. All instances share the same threshold/rootMargin, so a
// single observer instance registered once per module is enough for all of them.
let sharedObserver: IntersectionObserver | null = null;
const revealCallbacks = new WeakMap<Element, () => void>();

function getSharedObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const callback = revealCallbacks.get(entry.target);
          if (!callback) continue;
          callback();
          revealCallbacks.delete(entry.target);
          sharedObserver!.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
  }
  return sharedObserver;
}

/**
 * Fades/slides children into view the first time they cross into the viewport.
 * Pure CSS-transition based (no animation library) and respects prefers-reduced-motion.
 */
export default function Reveal({
  as,
  variant = "up",
  delay = 0,
  duration = 600,
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  variant?: keyof typeof VARIANTS;
  delay?: number;
  duration?: number;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}) {
  const Tag = (as || "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // The admin heatmap preview renders the page in a non-scrolling iframe, so
    // scroll-triggered reveals would never fire below the initial fold — show
    // everything immediately there instead.
    if (isAdminPreview()) {
      setVisible(true);
      return;
    }
    const observer = getSharedObserver();
    revealCallbacks.set(node, () => setVisible(true));
    observer.observe(node);
    return () => {
      revealCallbacks.delete(node);
      observer.unobserve(node);
    };
  }, []);

  const { hidden, visible: visibleClass } = VARIANTS[variant] || VARIANTS.up;

  return (
    <Tag
      ref={ref as any}
      className={`transition-all ease-out motion-reduce:transition-none ${
        visible ? visibleClass : hidden
      } ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
