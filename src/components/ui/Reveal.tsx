"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

const VARIANTS: Record<string, { hidden: string; visible: string }> = {
  up: { hidden: "opacity-0 translate-y-6", visible: "opacity-100 translate-y-0" },
  down: { hidden: "opacity-0 -translate-y-6", visible: "opacity-100 translate-y-0" },
  left: { hidden: "opacity-0 translate-x-6", visible: "opacity-100 translate-x-0" },
  right: { hidden: "opacity-0 -translate-x-6", visible: "opacity-100 translate-x-0" },
  fade: { hidden: "opacity-0", visible: "opacity-100" },
  scale: { hidden: "opacity-0 scale-95", visible: "opacity-100 scale-100" },
};

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
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
