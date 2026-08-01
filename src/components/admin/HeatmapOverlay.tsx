"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_WIDTH = 1280;
const FALLBACK_HEIGHT = 2000;

export function HeatmapOverlay({
  path,
  points,
  color,
}: {
  path: string;
  points: { xPct: number; yPct: number }[];
  color: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [contentHeight, setContentHeight] = useState(FALLBACK_HEIGHT);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / FRAME_WIDTH);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  const handleLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      const root = doc?.documentElement;
      if (!root) return;

      setContentHeight(root.scrollHeight);

      // Reveal-on-scroll sections, lazy-loaded embeds, etc. can still settle
      // after `load` fires — keep tracking height instead of measuring once.
      const observer = new ResizeObserver(() => setContentHeight(root.scrollHeight));
      observer.observe(root);
      resizeObserverRef.current = observer;
    } catch {
      // cross-origin fallback — keep default height
    }
  };

  const previewSrc = `${path}${path.includes("?") ? "&" : "?"}admin_preview=1`;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
      style={{ height: contentHeight * scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: FRAME_WIDTH, height: contentHeight, transform: `scale(${scale})` }}
      >
        <iframe
          ref={iframeRef}
          src={previewSrc}
          onLoad={handleLoad}
          title="Page preview"
          width={FRAME_WIDTH}
          height={contentHeight}
          tabIndex={-1}
          className="pointer-events-none border-0"
        />
        <div className="absolute inset-0">
          {points.map((p, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-multiply"
              style={{
                left: `${p.xPct * 100}%`,
                top: `${p.yPct * 100}%`,
                width: 28,
                height: 28,
                background: color,
                opacity: 0.25,
                filter: "blur(2px)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
