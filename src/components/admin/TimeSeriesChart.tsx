"use client";

import { useMemo, useState } from "react";

interface DailyPoint {
  date: string;
  visitors: number;
  sessions: number;
  leads: number;
}

const SERIES = [
  { key: "visitors" as const, label: "Visitors", color: "#3987e5" },
  { key: "sessions" as const, label: "Sessions", color: "#d95926" },
  { key: "leads" as const, label: "Leads", color: "#199e70" },
];

const WIDTH = 900;
const HEIGHT = 260;
const PAD_LEFT = 40;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

export function TimeSeriesChart({ data: fullData }: { data: DailyPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  const data = zoomRange ? fullData.slice(zoomRange[0], zoomRange[1] + 1) : fullData;

  const { maxValue, points } = useMemo(() => {
    const max = Math.max(1, ...data.flatMap((d) => [d.visitors, d.sessions, d.leads]));
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;

    const toXY = (value: number, index: number) => ({
      x: PAD_LEFT + step * index,
      y: PAD_TOP + plotHeight - (value / max) * plotHeight,
    });

    return {
      maxValue: max,
      points: SERIES.map((s) => ({
        ...s,
        coords: data.map((d, i) => toXY(d[s.key], i)),
      })),
    };
  }, [data]);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const isDragging = dragStart !== null && dragEnd !== null;
  const dragLo = isDragging ? Math.min(dragStart!, dragEnd!) : null;
  const dragHi = isDragging ? Math.max(dragStart!, dragEnd!) : null;

  const indexFromClientX = (e: { clientX: number; currentTarget: SVGSVGElement }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const index = step > 0 ? Math.round((relX - PAD_LEFT) / step) : 0;
    return Math.min(data.length - 1, Math.max(0, index));
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
        {zoomRange && (
          <button
            type="button"
            onClick={() => setZoomRange(null)}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reset zoom
          </button>
        )}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full cursor-crosshair select-none"
        role="img"
        aria-label="Daily visitors, sessions, and leads — drag to zoom into a range"
        onMouseLeave={() => {
          setHoverIndex(null);
          setDragStart(null);
          setDragEnd(null);
        }}
        onMouseDown={(e) => {
          const index = indexFromClientX(e);
          setDragStart(index);
          setDragEnd(index);
        }}
        onMouseMove={(e) => {
          const index = indexFromClientX(e);
          setHoverIndex(index);
          if (dragStart !== null) setDragEnd(index);
        }}
        onMouseUp={() => {
          if (dragLo !== null && dragHi !== null && dragHi > dragLo) {
            const baseOffset = zoomRange ? zoomRange[0] : 0;
            setZoomRange([baseOffset + dragLo, baseOffset + dragHi]);
          }
          setDragStart(null);
          setDragEnd(null);
        }}
      >
        {gridLines.map((g) => {
          const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * (1 - g);
          return (
            <g key={g}>
              <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" fontSize={10} fill="#64748b">
                {Math.round(maxValue * g)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          if (data.length > 10 && i % Math.ceil(data.length / 8) !== 0) return null;
          const x = PAD_LEFT + step * i;
          return (
            <text key={d.date} x={x} y={HEIGHT - 8} textAnchor="middle" fontSize={10} fill="#64748b">
              {d.date.slice(5)}
            </text>
          );
        })}

        {points.map((s) => (
          <polyline
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={s.coords.map((c) => `${c.x},${c.y}`).join(" ")}
          />
        ))}

        {isDragging && dragLo !== null && dragHi !== null && (
          <rect
            x={PAD_LEFT + step * dragLo}
            y={PAD_TOP}
            width={step * (dragHi - dragLo)}
            height={HEIGHT - PAD_TOP - PAD_BOTTOM}
            fill="#3987e5"
            opacity={0.12}
          />
        )}

        {hoverIndex !== null && !isDragging && (
          <line
            x1={PAD_LEFT + step * hoverIndex}
            x2={PAD_LEFT + step * hoverIndex}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        )}

        {hoverIndex !== null && !isDragging &&
          points.map((s) => {
            const c = s.coords[hoverIndex];
            return (
              <circle key={s.key} cx={c.x} cy={c.y} r={4} fill={s.color} stroke="#ffffff" strokeWidth={2} />
            );
          })}
      </svg>

      {isDragging && dragLo !== null && dragHi !== null && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Release to zoom into {data[dragLo]?.date} – {data[dragHi]?.date}
        </p>
      )}

      {hovered && !isDragging && (
        <div className="mt-2 flex items-center gap-4 rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-300">
          <span className="font-medium text-white">{hovered.date}</span>
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}: <span className="tabular-nums text-white">{hovered[s.key]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
