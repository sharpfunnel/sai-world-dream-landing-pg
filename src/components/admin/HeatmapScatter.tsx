const BOX_WIDTH = 400;
const BOX_HEIGHT = 1400;

export function HeatmapScatter({ points, color }: { points: { xPct: number; yPct: number }[]; color: string }) {
  return (
    <svg
      viewBox={`0 0 ${BOX_WIDTH} ${BOX_HEIGHT}`}
      className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900"
      role="img"
      aria-label="Click position density across the page"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={0}
          x2={BOX_WIDTH}
          y1={(BOX_HEIGHT / 10) * (i + 1)}
          y2={(BOX_HEIGHT / 10) * (i + 1)}
          stroke="#2c2c2a"
          strokeWidth={1}
        />
      ))}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.xPct * BOX_WIDTH}
          cy={p.yPct * BOX_HEIGHT}
          r={10}
          fill={color}
          opacity={0.12}
        />
      ))}
    </svg>
  );
}
