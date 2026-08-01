"use client";

import { useEffect, useRef } from "react";
import type { eventWithTime } from "rrweb";
import type RRwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";

export function ReplayPlayer({ events }: { events: eventWithTime[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    let player: InstanceType<typeof RRwebPlayer> | null = null;

    import("rrweb-player").then(({ default: Player }) => {
      if (destroyed || !containerRef.current) return;
      player = new Player({
        target: containerRef.current,
        props: {
          events,
          width: containerRef.current.clientWidth,
          autoPlay: false,
          showController: true,
        },
      });
    });

    return () => {
      destroyed = true;
      // $destroy is Svelte's standard component teardown method; not part of rrweb-player's own .d.ts.
      (player as unknown as { $destroy?: () => void } | null)?.$destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" />;
}
